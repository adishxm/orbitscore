# Agent37 Bounded Evidence-Triage & Mission Copilot Integration

## Overview & Architecture
Agent37 ([agent37.com](https://agent37.com)) provides hosted, persistent AI agent sandboxes. In OrbitScore, Agent37 is integrated across the full stack:

1. **Backend Evidence Triage (`POST /integrations/agent37/triage`)**: Extracts candidate telemetry and compliance parameters (disposal duration, wet mass, perigee altitude, casualty risk) directly from spacecraft mission excerpts.
2. **Interactive Mission Copilot (`POST /integrations/agent37/chat`)**: Answers engineering and regulatory questions (NASA-STD-8719.14, FCC 5-year post-mission disposal rule) via an interactive drawer in the OrbitScore React workspace.
3. **Live Health & Status Probe (`GET /integrations/agent37/status`)**: Verifies real-time sandbox instance connectivity and latency.

---

## Active Live Instance Configuration
* **Instance ID**: `z2dhn46l7d`
* **Instance Name**: `Orbitscore`
* **Agent Framework / Template**: `agent37-app` (Hermes Agent)
* **Instance Endpoint**: `https://z2dhn46l7d.agent37.app`
* **Sandbox API Endpoint**: `https://api.agent37.com/v1`
* **Hardware Profile**: 2 vCPU · 4 GB RAM · 2 GB Disk

---

## Strict Safety & Governance Boundaries
1. **Candidate-Only Output (`human_confirmed = False`)**: All fields produced by Agent37 strictly output `human_confirmed = False`. They appear as unconfirmed candidate evidence in OrbitScore and **cannot** alter compliance determinations without explicit human review.
2. **Zero Decision Rights**: Agent37 is strictly prohibited from:
   - Approving, rejecting, or waiving findings.
   - Modifying policy rules or evaluation thresholds.
   - Certifying flight readiness.
   - Generating authoritative final export packets.
3. **Bounded Input Only**: Agent37 operates solely on pre-received text excerpts provided by the reviewer or workspace telemetry dossiers.
4. **Backend-Only Secret**: The `AGENT37_API_KEY` is maintained exclusively in server-side environment secrets (`.env`) and is never leaked to the client bundle.

---

## API Endpoints & Contracts

### 1. Evidence Triage: `POST /integrations/agent37/triage`
**Request Schema:**
```json
{
  "excerpt": "Satellite wet mass of 180.5 kg. Operating at perigee altitude of 520 km. Post-mission disposal duration is 4.5 years via atmospheric drag.",
  "source_identifier": "doc_orbit_assessment_sec4",
  "mission_id": "asteria-3"
}
```

**Response Schema:**
```json
{
  "status": "SUCCESS",
  "provider": "agent37_cloud_hermes",
  "model_template": "spacecraft-evidence-triage-v1",
  "request_time": "2026-10-24T20:04:08Z",
  "source_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "candidates": [
    {
      "field": "wet_mass_kg",
      "value": 180.5,
      "unit": "kg",
      "exact_quote": "Satellite wet mass of 180.5 kg",
      "source_identifier": "doc_orbit_assessment_sec4",
      "uncertainty": 0.05,
      "confidence_tier": "HIGH",
      "human_confirmed": false
    },
    {
      "field": "disposal_duration_years",
      "value": 4.5,
      "unit": "years",
      "exact_quote": "Post-mission disposal duration is 4.5 years via atmospheric drag",
      "source_identifier": "doc_orbit_assessment_sec4",
      "uncertainty": 0.05,
      "confidence_tier": "HIGH",
      "human_confirmed": false
    }
  ],
  "disclaimer": "Agent37 candidate extraction only. Requires independent human engineering confirmation."
}
```

### 2. Mission Copilot: `POST /integrations/agent37/chat`
**Request Schema:**
```json
{
  "message": "What is the maximum post-mission orbital lifetime allowed for LEO satellites under FCC 2022 rules?",
  "session_id": "optional-session-id",
  "mission_id": "asteria-3"
}
```

**Response Schema:**
```json
{
  "status": "SUCCESS",
  "agent": "hermes",
  "response": "Under the FCC 2022 Order (FCC 22-74), satellites licensed by the FCC operating in Low Earth Orbit must complete post-mission disposal via atmospheric re-entry within 5 years following mission completion (replacing the previous 25-year guideline).",
  "session_id": "540815c96633421a9c0144125552ff86",
  "request_id": "4085174af474419aba40d4953cdd6dde",
  "timestamp": "2026-10-24T20:05:00Z",
  "disclaimer": "Agent37 assistance only. Not an official compliance determination."
}
```

### 3. Status Probe: `GET /integrations/agent37/status`
**Response Schema:**
```json
{
  "enabled": true,
  "configured": true,
  "instance_id": "z2dhn46l7d",
  "instance_url": "https://z2dhn46l7d.agent37.app",
  "status": "ONLINE",
  "agent_name": "hermes",
  "latency_ms": 142.5,
  "detail": "Instance responding on health endpoint."
}
```

---

## Configuration & Environment Variables

| Variable | Description | Default / Value |
| :--- | :--- | :--- |
| `AGENT37_ENABLED` | Feature flag to activate live cloud sandbox calls | `1` |
| `AGENT37_API_KEY` | Secret Bearer key (`sk_live_...`) | Configured in server `.env` |
| `AGENT37_INSTANCE_ID` | Sandbox Instance ID | `z2dhn46l7d` |
| `AGENT37_INSTANCE_URL` | Live routing URL | `https://z2dhn46l7d.agent37.app` |
| `AGENT37_TIMEOUT_SECONDS` | HTTP timeout for remote agent responses | `30.0` |

---

## Hackyard Build 2026 Verification Guide
For submitting this project to the **Agent37 Challenge at Hackyard Build 2026**:
1. **Instance ID**: `z2dhn46l7d`
2. **Dashboard URL**: `https://agent37.com/instances` (Instance `Orbitscore`)
3. **Form Submission Link**: [Google Form](https://forms.gle/nmJxUubMJj6ZEKaY7)
4. **Platform Verification**: Every triage request logs `agent37_triage_executed` with `source_hash` and candidate count into OrbitScore's tamper-evident SHA-256 provenance ledger.
