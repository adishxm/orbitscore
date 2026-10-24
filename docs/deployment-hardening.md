# OrbitScore — Deployment Hardening, Audit & Rollback Guide

> **Task**: T022 (Main-product shadow pilot, deployment hardening, rollback)
> **Authority**: System Safety & Regulatory Conformance Architecture

---

## 1. Cryptographic Audit Trail & Provenance

OrbitScore implements a SHA-256 hash-chained provenance ledger for all mission actions:

```text
Genesis Event (e0) [SHA-256: 0000...0000]
         │
         ▼
Document Upload (e1) [Hash: H(e0_hash + payload_sha256)]
         │
         ▼
Field Extraction (e2) [Hash: H(e1_hash + candidates_sha256)]
         │
         ▼
Human Review Sign-off (e3) [Hash: H(e2_hash + decision_sha256)]
         │
         ▼
Export Generation (e4) [Hash: H(e3_hash + export_sha256)]
```

### Verification Invariant
Any manual modification, record deletion, or unauthorized edit to SQLite/PostgreSQL breaks the hash chain, causing `/provenance/verify` to fail with `INTEGRITY_TAMPERED`.

---

## 2. Role-Based Access Control (RBAC)

OrbitScore enforces strict capability separation:

| Role | Permissions | Endpoints Authorized |
|---|---|---|
| **`viewer`** | Read-only inspection of missions, telemetry, and draft packets | `GET /missions/*`, `GET /health`, `GET /ready` |
| **`reviewer`** | Sign waivers, confirm extracted evidence, unlock exports | `POST /reviews`, `POST /counterfactuals`, `GET /export/*` |
| **`admin`** | Telemetry ingestion triggers, model registry management | `POST /integrations/*`, `POST /fleet/*` |

### Export Review Gate (HTTP 423)
Even authenticated users cannot download or generate ODAR/EOMP submission packets (`/export/odar`, `/export/eomp`) until every flagged finding is adjudicated by a qualified reviewer:
```json
{
  "code": "EXPORT_LOCKED",
  "message": "Mission findings must be reviewed and signed off prior to export generation",
  "pending_decisions": 2,
  "unreviewed_findings": ["IN-DFSM-PMD-PROB", "NASA-DEMISE-HAZARD"]
}
```

---

## 3. Trusted Model Artifact Registry (T021)

All learned weights and regressors (`model_artifacts/`) must be registered in `model_artifacts/registry.json` with an immutable SHA-256 checksum:

```json
{
  "artifact_id": "art_cdm_gb_v1",
  "sha256": "8f4b...",
  "approved_by": "Safety Officer",
  "approval_date": "2026-10-24"
}
```

If an artifact file on disk is modified, tampered with, or corrupted, the runtime loader raises `ArtifactIntegrityError` and abstains from operational inference.

---

## 4. Shadow Pilot & Monitoring Runbook

During deployment hardening:
1. **Side-by-side Shadowing**: Run automated extraction alongside manual human data entry for 20 real satellite datasheet filings.
2. **Error Tracking**: Log all field extraction discrepancies with page citations.
3. **Rollback Procedure**: If regression rate exceeds 2%, flip the feature flag:
   ```bash
   export ORBIT_ENABLE_AI_EXTRACTION=false
   ```
   The platform seamlessly falls back to pure deterministic regex extraction with zero downtime.
