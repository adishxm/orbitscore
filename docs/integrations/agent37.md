# Agent37 Bounded Evidence-Triage Integration

## Purpose & Scope
Agent37 functions as a bounded candidate evidence extractor. When a spacecraft engineering document or orbital assessment excerpt is uploaded to OrbitScore, Agent37 extracts candidate compliance values (e.g., disposal lifetime, wet mass, perigee altitude, casualty risk probability) and exact text citations.

## Strict Safety & Governance Boundaries
1. **Candidate-Only Output**: All fields produced by Agent37 strictly output `human_confirmed = False`. They appear as unconfirmed candidate evidence in OrbitScore and **cannot** alter compliance determinations without explicit human review.
2. **Zero Decision Rights**: Agent37 is strictly prohibited from:
   - Approving, rejecting, or waiving findings.
   - Modifying policy rules or evaluation thresholds.
   - Certifying flight readiness.
   - Generating authoritative final exports.
3. **Bounded Input Only**: Agent37 never browses arbitrary web links or navigates third-party URLs. It operates solely on pre-received text excerpts provided by the backend.
4. **Backend-Only Secret**: The `AGENT37_API_KEY` is maintained exclusively in server-side environment secrets. It is never transmitted to the browser or mobile client.

## API Endpoint & Contract

### Endpoint: `POST /integrations/agent37/triage`
**Authentication**: Reviewer Bearer Token (`Authorization: Bearer <token>`)

#### Request Schema:
```json
{
  "excerpt": "Satellite wet mass of 145.0 kg. Operating at perigee altitude of 550 km. Post-mission disposal duration is 4.2 years via atmospheric drag.",
  "source_identifier": "doc_orbit_assessment_sec4",
  "mission_id": "mission_complete"
}
```

#### Response Schema:
```json
{
  "status": "SUCCESS",
  "provider": "agent37_cloud",
  "model_template": "spacecraft-evidence-triage-v1",
  "request_time": "2026-10-24T15:00:00Z",
  "source_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "candidates": [
    {
      "field": "wet_mass_kg",
      "value": 145.0,
      "unit": "kg",
      "exact_quote": "wet mass of 145.0 kg",
      "source_identifier": "doc_orbit_assessment_sec4",
      "uncertainty": 0.05,
      "confidence_tier": "HIGH",
      "human_confirmed": false
    },
    {
      "field": "disposal_duration_years",
      "value": 4.2,
      "unit": "years",
      "exact_quote": "Post-mission disposal duration is 4.2 years",
      "source_identifier": "doc_orbit_assessment_sec4",
      "uncertainty": 0.05,
      "confidence_tier": "HIGH",
      "human_confirmed": false
    }
  ],
  "disclaimer": "Agent37 candidate extraction only. Requires independent human engineering confirmation."
}
```

## Configuration & Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `AGENT37_ENABLED` | Feature flag to activate remote API calls | `0` (Disabled) |
| `AGENT37_API_KEY` | Server-side API key for Agent37 | *None (Blank)* |
| `AGENT37_INSTANCE_URL` | Agent37 instance API URL | `https://api.agent37.com/v1` |

## Offline Deterministic Fallback
When `AGENT37_ENABLED=0` or the remote provider is unreachable, the adapter automatically and transparently falls back to the deterministic regex engine in `backend/app/integrations/agent37.py`. Local development and unit tests execute cleanly without consuming API credits or requiring external credentials.
