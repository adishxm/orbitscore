# Model Card: CDM-GradientBoosting-LogRisk-V1

## Overview
- **Architecture:** Scikit-Learn Pipeline (`SimpleImputer` -> `StandardScaler` -> `GradientBoostingRegressor`)
- **Input Features:** `time_to_tca_days`, `miss_distance_m`, `relative_speed_m_s`, `latest_early_risk`
- **Output:** Predicted `final_reported_log10_risk` (float)
- **Cutoff Horizon:** Minimum 2.0 days before Time of Closest Approach (TCA)

## Intended Use
Benchmarking offline risk forecasting against baseline persistence (`LastObservedRiskBaseline`) on historical conjunction messages.

## Baseline Comparison
- **Persistence Baseline:** Predicts that the latest early observed risk will remain unchanged.
- **Evaluation Metrics:** Mean Absolute Error (MAE), Root Mean Squared Error (RMSE) in log10 units, and forecast skill score.

## Prohibited Uses
- Maneuver decision automation.
- Independent physical orbit propagation or real-world Pc determination.
- Replacing certified operator flight dynamics software.
