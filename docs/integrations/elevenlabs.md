# ElevenLabs Accessible Narration Integration

## Purpose & Scope
ElevenLabs provides an accessible, opt-in audio narration capability for mission review summaries and individual engineering findings. Reviewers can click "Listen" to hear a synthesized reading of verified findings, citations, and reviewer notes.

## Strict Human Review Gate & Security Boundary
To guarantee that unconfirmed or misleading information is never vocalized:

1. **Human Review Gate (Fail-Closed)**:
   - Narration is **strictly rejected** (`status: "REJECTED_UNREVIEWED"`) if the requested finding has not been explicitly signed off by a human engineer.
   - Only findings with a recorded decision of `APPROVED`, `WAIVED_WITH_NOTE`, or `ACCEPTED` are permitted to generate audio.
2. **Authoritative Primacy of Written Text**:
   - Audio narration is purely an **accessibility and presentation convenience**.
   - The written cited dossier and cryptographic provenance ledger remain the sole authoritative records of truth.
   - Every audio player displays a persistent side-by-side disclaimer:
     > *"AI-generated narration; not certification or operational safety advice."*
3. **Server-Side Key Isolation**:
   - The `XI_API_KEY` is strictly held in backend environment secrets and injected into the `xi-api-key` HTTP header during server-to-server calls.
   - The key is **never** bundled into React client assets, mobile code, or browser logs.
4. **Data Sanitization & Privacy**:
   - Raw document binaries, full mission telemetry, credentials, and personal reviewer information are **never** passed to ElevenLabs.
   - Narration text is bounded to a maximum length of 2,000 characters.

## API Endpoint & Contract

### Endpoint: `POST /integrations/elevenlabs/narrate`
**Authentication**: Reviewer Bearer Token (`Authorization: Bearer <token>`)

#### Request Schema:
```json
{
  "finding_id": "find_orbit_passivation_01",
  "mission_id": "mission_complete",
  "reviewed_text": "Flight Safety Officer approved waiver with note: Battery depletion valves successfully vented to 0.0 Joules stored energy.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "opt_in": true
}
```

#### Response Schema:
```json
{
  "status": "SUCCESS",
  "finding_id": "find_orbit_passivation_01",
  "mission_id": "mission_complete",
  "audio_format": "audio/mpeg",
  "audio_base64": "<base64_encoded_mp3_data>",
  "audio_url": null,
  "character_count": 128,
  "transcript": "Flight Safety Officer approved waiver with note: Battery depletion valves successfully vented to 0.0 Joules stored energy.",
  "disclaimer": "AI-generated narration; not certification or operational safety advice.",
  "generated_at": "2026-10-24T15:00:00Z"
}
```

## Configuration & Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `ELEVENLABS_ENABLED` | Feature flag to activate ElevenLabs cloud synthesis | `0` (Disabled) |
| `XI_API_KEY` | Server-side ElevenLabs API key | *None (Blank)* |

## Offline Mock Behavior
When `ELEVENLABS_ENABLED=0`, the integration returns mock audio metadata and a synthetic URL identifier without making external HTTP calls or expending character quotas.
