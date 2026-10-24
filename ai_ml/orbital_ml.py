"""
Scikit-Learn Machine Learning module for orbital decay timeline prediction
and conjunction vector risk classification.
Provides deterministic, explainable surrogate heuristics clearly labeled as research-only.
"""
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from pydantic import BaseModel, Field


class DecayPredictionResult(BaseModel):
    predicted_lifetime_years: float = Field(..., description="Estimated orbital lifetime in years")
    confidence_interval_95: List[float] = Field(..., description="[lower_bound_years, upper_bound_years]")
    fcc_5yr_compliant: bool
    isro_dfsm_compliant: bool
    ballistic_coefficient_kg_m2: float
    model_version: str = "OrbitalDecay-GBR-v1.0"
    research_only: bool = True
    disclaimer: str = (
        "RESEARCH DEMONSTRATION ONLY: Semi-empirical surrogate model based on King-Hele formulation. "
        "Flight compliance verification requires formal numerical propagation (e.g. NASA DAS 3.x)."
    )


class ConjunctionRiskResult(BaseModel):
    risk_tier: str  # LOW, MODERATE, ELEVATED
    collision_probability_estimate: float
    miss_distance_meters: float
    relative_speed_kms: float
    maneuver_recommended: bool
    confidence_score: float
    model_version: str = "CollisionVector-RF-v1.0"
    research_only: bool = True
    disclaimer: str = (
        "RESEARCH DEMONSTRATION ONLY: Deterministic 2D encounter geometry scaling proxy. "
        "Does not constitute operational maneuver guidance or agency collision avoidance certification."
    )


class OrbitalDecayML:
    """GradientBoostingRegressor trained on physical drag & atmospheric density models."""

    def __init__(self):
        self.model: Optional[GradientBoostingRegressor] = None

    def _ensure_fitted(self):
        if self.model is not None:
            return
        clf = GradientBoostingRegressor(n_estimators=80, max_depth=4, random_state=42)
        np.random.seed(42)
        n_samples = 1000

        # Features: [perigee_km, apogee_km, inclination_deg, mass_kg, area_m2, bc, solar_flux]
        perigee = np.random.uniform(350, 700, n_samples)
        apogee = perigee + np.random.uniform(0, 40, n_samples)
        inc = np.random.uniform(28, 98, n_samples)
        mass = np.random.uniform(1.0, 25.0, n_samples)
        area = np.random.uniform(0.01, 0.20, n_samples)
        f107 = np.random.uniform(80, 200, n_samples)
        bc = mass / np.maximum(area, 0.002)

        X = np.column_stack([perigee, apogee, inc, mass, area, bc, f107])

        # Semi-empirical lifetime approximation: scales exponentially with altitude, inversely with area/mass
        alt_avg = (perigee + apogee) / 2.0
        base_decay = np.exp((alt_avg - 475.0) / 48.0) * (bc / 100.0) * (140.0 / f107) * 2.2
        noise = np.random.normal(1.0, 0.03, n_samples)
        y = np.clip(base_decay * noise, 0.1, 50.0)

        clf.fit(X, y)
        self.model = clf

    def predict(
        self,
        perigee_km: float = 498.8,
        apogee_km: float = 500.2,
        inclination_deg: float = 97.4,
        mass_kg: float = 4.0,
        area_m2: float = 0.03,
        solar_flux_f107: float = 145.0,
    ) -> DecayPredictionResult:
        self._ensure_fitted()
        if perigee_km < 100.0 or apogee_km < 100.0:
            raise ValueError("Perigee and apogee altitudes must be at or above 100 km LEO threshold.")

        bc_val = mass_kg / max(area_m2, 0.002)
        X_val = np.array([[perigee_km, apogee_km, inclination_deg, mass_kg, area_m2, bc_val, solar_flux_f107]])
        pred_lifetime = float(self.model.predict(X_val)[0])
        pred_lifetime = round(max(0.1, pred_lifetime), 2)

        # Estimated empirical dispersion bound (~12%)
        lower_bound = round(max(0.05, pred_lifetime * 0.88), 2)
        upper_bound = round(pred_lifetime * 1.12, 2)
        bc = round(bc_val, 2)

        return DecayPredictionResult(
            predicted_lifetime_years=pred_lifetime,
            confidence_interval_95=[lower_bound, upper_bound],
            fcc_5yr_compliant=pred_lifetime <= 5.0,
            isro_dfsm_compliant=pred_lifetime <= 5.0,
            ballistic_coefficient_kg_m2=bc,
        )


class CollisionRiskClassifierML:
    """RandomForestClassifier trained to identify elevated conjunction geometry vectors."""

    def __init__(self):
        self.clf: Optional[RandomForestClassifier] = None

    def _ensure_fitted(self):
        if self.clf is not None:
            return
        clf = RandomForestClassifier(n_estimators=50, max_depth=4, random_state=42)
        np.random.seed(42)
        n_samples = 300

        # Features: [miss_distance_m, relative_speed_kms, radial_miss_m, combined_hard_body_radius_m]
        miss_dist = np.random.uniform(50, 10000, n_samples)
        rel_speed = np.random.uniform(1.0, 15.5, n_samples)
        radial_miss = np.random.uniform(10, 2000, n_samples)
        hbr = np.random.uniform(1.0, 10.0, n_samples)

        X = np.column_stack([miss_dist, rel_speed, radial_miss, hbr])

        # Labels: 0: LOW, 1: MODERATE, 2: ELEVATED
        y = np.zeros(n_samples, dtype=int)
        for i in range(n_samples):
            if miss_dist[i] < 200.0 or radial_miss[i] < 50.0:
                y[i] = 2  # ELEVATED
            elif miss_dist[i] < 1000.0 or radial_miss[i] < 200.0:
                y[i] = 1  # MODERATE
            else:
                y[i] = 0  # LOW

        clf.fit(X, y)
        self.clf = clf

    def evaluate_conjunction(
        self,
        miss_distance_m: float = 850.0,
        relative_speed_kms: float = 14.1,
        radial_miss_m: float = 140.0,
        combined_hbr_m: float = 2.5,
    ) -> ConjunctionRiskResult:
        self._ensure_fitted()
        X_val = np.array([[miss_distance_m, relative_speed_kms, radial_miss_m, combined_hbr_m]])
        pred_class = int(self.clf.predict(X_val)[0])
        probs = self.clf.predict_proba(X_val)[0]
        confidence = float(np.max(probs))

        tier_map = {0: "LOW", 1: "MODERATE", 2: "ELEVATED"}
        tier = tier_map.get(pred_class, "LOW")

        # Deterministic Foster-1992 2D Gaussian B-plane proxy (reproducible, non-random)
        sigma = max(float(radial_miss_m) * 1.5, 45.0)
        hbr = max(float(combined_hbr_m), 0.5)
        dist = max(float(miss_distance_m), 0.0)
        exponent = -(dist ** 2) / (2.0 * (sigma ** 2))
        scale = (hbr ** 2) / (2.0 * (sigma ** 2))
        raw_pc = scale * np.exp(exponent)

        if tier == "ELEVATED":
            pc_est = round(float(np.clip(raw_pc * 2.5, 1e-4, 5e-3)), 6)
            recommend_maneuver = True
        elif tier == "MODERATE":
            pc_est = round(float(np.clip(raw_pc, 1e-6, 9.9e-5)), 7)
            recommend_maneuver = False
        else:
            pc_est = round(float(np.clip(raw_pc * 0.1, 1e-9, 9.9e-7)), 8)
            recommend_maneuver = False

        return ConjunctionRiskResult(
            risk_tier=tier,
            collision_probability_estimate=pc_est,
            miss_distance_meters=miss_distance_m,
            relative_speed_kms=relative_speed_kms,
            maneuver_recommended=recommend_maneuver,
            confidence_score=round(confidence, 3),
        )


# Global singleton instances with lazy initialization
decay_ml_engine = OrbitalDecayML()
collision_ml_engine = CollisionRiskClassifierML()
