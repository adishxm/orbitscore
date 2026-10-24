# FlutterFlow Mobile Reviewer Client Integration

## Purpose & Scope
FlutterFlow provides a focused, native mobile companion for mission review engineers. It enables field or on-call reviewers to:
1. Browse mission profiles and evidence status.
2. View detected findings and citations.
3. Review candidate evidence (Approve, Reject, or Waive with Note).
4. Inspect tamper-evident SHA-256 provenance chains.
5. Download cited compliance review dossiers.

## Architectural Boundary & Single Contract
The FlutterFlow mobile application is an API consumer, **not an independent decision engine**:
- **Same Authoritative API**: FlutterFlow communicates with the exact same FastAPI endpoints used by the React web application (`https://orbitscore-api.onrender.com` or local `http://127.0.0.1:8000`).
- **OpenAPI Schema Import**: Import `backend/openapi.json` directly into FlutterFlow's **API Calls > Import from OpenAPI** wizard.
- **Client State Non-Authority**: FlutterFlow's local device state is never trusted for compliance status, rule evaluations, or export locking. Every decision must be submitted to and validated by FastAPI.
- **No Client Secrets**: Never store Agent37, Browser Use, ElevenLabs, database, or Render master secrets in FlutterFlow environment variables. Only store the authenticated user's Bearer token (`ORBITSCORE_REVIEWER_KEY`).

## OpenAPI Endpoints Used by FlutterFlow

| Method | Endpoint | Description | Mobile Reviewer Screen |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server status and database health check | App Launch & Connectivity Banner |
| `GET` | `/missions` | List all registered spacecraft missions | Missions Overview Screen |
| `GET` | `/missions/{mission_id}` | Fetch mission details and evidence fields | Mission Detail Screen |
| `POST` | `/missions/{mission_id}/evaluate` | Trigger deterministic policy evaluation | Evaluation Tab |
| `POST` | `/missions/{mission_id}/findings/{finding_id}/decision` | Submit human engineering decision | Findings Sign-Off Modal |
| `GET` | `/provenance` | Verify tamper-evident SHA-256 event ledger | Audit & Integrity Screen |
| `GET` | `/export/{mission_id}` | Retrieve cited review dossier | Export & Dossier Viewer |

## Authentication Setup in FlutterFlow
1. Open FlutterFlow Project Settings > **Authentication**.
2. Select **Custom Authentication** or **API Token Authentication**.
3. In **API Calls > Shared Headers**, configure:
   ```text
   Authorization: Bearer [AuthenticatedUserToken]
   Content-Type: application/json
   Accept: application/json
   ```
4. Configure environment base URLs:
   - **Development**: `http://10.0.2.2:8000` (Android emulator) or `http://localhost:8000` (iOS simulator)
   - **Staging / Production**: `https://orbitscore-api.onrender.com`

## Shared State Verification: React <-> FlutterFlow
Because both clients communicate with the central SQLite / Postgres backend, changes made in one client immediately reflect in the other:
1. **Decision Synchronization**: When a reviewer approves a finding via the FlutterFlow mobile interface (`POST /missions/{id}/findings/{fid}/decision`), the finding status updates in the central database, logs an immutable provenance event, and immediately reflects on the React dashboard upon refresh.
2. **Export Lock Coherence**: If a finding is unresolved, both the React app and FlutterFlow will receive `HTTP 423 EXPORT_LOCKED`. Once all decisions are signed off via either client, the export dossier is unlocked for both.
