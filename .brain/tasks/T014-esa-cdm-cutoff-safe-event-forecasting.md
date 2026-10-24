# T014 — ESA CDM Conjunction Event Processing and Leakage-Safe Baseline Forecasting

- status: done
- owner: Aditya
- reviewer: Roshan
- priority: P1
- depends_on: [T012, T013]

## Goal

Implement Track B research capabilities: leakage-safe conjunction event assembly using a strict 2-day pre-TCA cutoff, disjoint event partitioning, persistence baseline forecasting, and log-risk metrics.

## Acceptance checks

1. `ai_ml/datasets/esa_cdm.py` filters early messages to `time_to_tca_days >= 2.0` and final labels to `time_to_tca_days < 2.0`, excluding events with incomplete chronology.
2. `partition_cdm_events_by_event_id` splits strictly by `event_id` to guarantee zero cross-split event leakage.
3. `LastObservedRiskBaseline` and `DummyRiskBaseline` establish empirical persistence benchmarks in `ai_ml/training/baselines.py`.
4. `ai_ml/evaluation/cdm_metrics.py` evaluates log10-risk MAE, RMSE, and skill relative to persistence.
5. All research outputs carry prominent disclaimers separating research benchmarks from operational collision probability.

## Required verification

Execute `pytest ai_ml/tests/test_extraction_modules.py` and run `python -m ai_ml.cli cdm-build-events; python -m ai_ml.cli cdm-evaluate`.

## Reviewer log

- Implementation evidence: Cutoff-safe event assembly, persistence forecasters, log10 error metrics, CLI subcommands, and passing test suites.
- Reviewer sign-off: Roshan (2026-10-24T18:32:00.000000Z / 2026-10-25T00:02:00.000000+05:30)
