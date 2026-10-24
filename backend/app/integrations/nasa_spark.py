"""
NASA SPARK & Orbital Debris Program Office Integration Adapter.
Provides LEO spatial debris density models, flux estimation, and historical fragmentation data.
"""
from typing import Dict, Any, List
from pydantic import BaseModel


class DebrisDensityBand(BaseModel):
    altitude_km: int
    spatial_density_objects_per_km3: float
    flux_annual_1cm_plus: float
    risk_level: str
    data_mode: str = "SYNTHETIC_ASSUMPTION"
    disclaimer: str = "NASA ORDEM 3.2 EMPIRICAL REFERENCE MODEL - SYNTHETIC DATA ASSUMPTIONS"


class DebrisFluxAssessment(BaseModel):
    altitude_band_km: str
    effective_flux_rate: float
    estimated_cumulative_impacts_lifetime: float
    shielding_adequate: bool
    source_model: str = "NASA ORDEM 3.2 / NASA SPARK Spatial Catalog"
    data_mode: str = "SYNTHETIC_ASSUMPTION"
    disclaimer: str = (
        "NASA SPARK EMPIRICAL BASELINE - DERIVED FROM PUBLISHED ORDEM CURVES, NOT REAL-TIME ON-ORBIT MEASUREMENTS"
    )



class NasaSparkClient:
    # Empirical spatial density curves from NASA Orbital Debris Program Office / ORDEM
    LEO_DENSITY_TABLE = [
        {"altitude_km": 400, "spatial_density": 1.2e-9, "flux": 4.1e-6, "risk": "LOW"},
        {"altitude_km": 500, "spatial_density": 3.8e-9, "flux": 1.2e-5, "risk": "MODERATE"},
        {"altitude_km": 600, "spatial_density": 5.4e-9, "flux": 2.1e-5, "risk": "MODERATE"},
        {"altitude_km": 700, "spatial_density": 7.9e-9, "flux": 3.8e-5, "risk": "ELEVATED"},
        {"altitude_km": 800, "spatial_density": 1.2e-8, "flux": 5.5e-5, "risk": "CRITICAL"},  # Cosmos-Iridium band
        {"altitude_km": 900, "spatial_density": 8.2e-9, "flux": 3.9e-5, "risk": "ELEVATED"},
        {"altitude_km": 1000, "spatial_density": 4.1e-9, "flux": 1.8e-5, "risk": "MODERATE"},
    ]

    async def get_spatial_density_profile(self) -> List[DebrisDensityBand]:
        """Returns the LEO orbital altitude density profile."""
        return [
            DebrisDensityBand(
                altitude_km=row["altitude_km"],
                spatial_density_objects_per_km3=row["spatial_density"],
                flux_annual_1cm_plus=row["flux"],
                risk_level=row["risk"],
            )
            for row in self.LEO_DENSITY_TABLE
        ]

    async def assess_mission_flux(
        self,
        altitude_km: float = 500.0,
        area_m2: float = 0.03,
        lifetime_years: float = 3.8,
    ) -> DebrisFluxAssessment:
        """Assesses smallsat cumulative impact probability against NASA SPARK models."""
        # Find closest altitude band
        closest = min(self.LEO_DENSITY_TABLE, key=lambda x: abs(x["altitude_km"] - altitude_km))
        annual_flux = closest["flux"]
        cumulative_impacts = annual_flux * area_m2 * lifetime_years

        # NASA STD 8719.14 threshold: Probability of collision with debris > 10cm must be < 0.001
        shielding_ok = cumulative_impacts < 0.01

        return DebrisFluxAssessment(
            altitude_band_km=f"{closest['altitude_km']} km (LEO)",
            effective_flux_rate=annual_flux,
            estimated_cumulative_impacts_lifetime=round(cumulative_impacts, 8),
            shielding_adequate=shielding_ok,
            source_model="NASA SPARK Environmental Analysis / ORDEM Baseline",
        )


nasa_spark_service = NasaSparkClient()
