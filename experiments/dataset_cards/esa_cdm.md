# Dataset Card: ESA Collision Avoidance Challenge (CDMs)

## Overview
- **Source:** European Space Agency (ESA) Space Debris Office via Zenodo (DOI: 10.5281/zenodo.4463683)
- **License:** CC-BY-4.0
- **Domain:** Historical Conjunction Data Messages (CDMs) received during 2015–2019
- **Target Variable:** `final_reported_log10_risk` (base-10 logarithm of calculated collision risk, e.g., -6.0 = 10^-6)

## Purpose and Scope
This dataset is utilized strictly for offline benchmark forecasting research to assess whether machine learning models can forecast the final reported collision risk at a 2-day pre-TCA cutoff.

## Leakage Prevention
- **Chronological Cutoff:** Only messages with `time_to_tca_days >= 2.0` are permitted as feature snapshots.
- **Label Source:** The final message with `time_to_tca_days < 2.0` serves as the gold target.
- **Event-Disjoint Partitioning:** Splits are constructed strictly by `event_id`. All messages from any given conjunction encounter belong exclusively to one split (train, validation, or test).

## Limitations & Prohibited Uses
- **NOT Operational Collision Probability:** The risk values reflect historical model computations from specific tracking networks; they do not calculate physical physical collision likelihood.
- **Selection Bias:** Events in the challenge dataset over-represent high-risk encounters and do not mirror baseline operational space traffic distributions.
- **NOT for Flight Maneuver Planning:** This dataset and derived models cannot be used for operational collision avoidance decisions.
