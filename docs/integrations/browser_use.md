# Browser Use Cloud Public-Source Capture Integration

## Purpose & Scope
Browser Use Cloud captures candidate regulatory and technical excerpts from an explicit allowlist of public authoritative space domain registers (e.g., NASA ODPO, FCC rulings, FAA regulations, ESA standards, ISO specifications). It can also run repeatable browser-based end-to-end user interface quality assurance.

## Strict Allowlist & Safety Boundary
To prevent SSRF, data exfiltration, or unauthorized scraping, Browser Use Cloud enforces strict security constraints:

1. **Approved Public Domain Allowlist**:
   Only URLs matching the authoritative domains registered in `research/SOURCE_REGISTER.md` are permitted:
   - `*.nasa.gov` (`orbitaldebris.jsc.nasa.gov`, `ntrs.nasa.gov`, `standards.nasa.gov`, `nodis3.gsfc.nasa.gov`)
   - `*.fcc.gov` (`docs.fcc.gov`, `www.fcc.gov`)
   - `*.faa.gov` (`www.faa.gov`)
   - `nvlpubs.nist.gov`
   - `*.isro.gov.in`
   - `*.esa.int`
   - `public.ccsds.org`
   - `www.space-track.org`
   - `*.iso.org`
   
   Any attempt to navigate to a non-allowlisted domain is rejected immediately with `status: "REJECTED_DOMAIN"`.
2. **Read-Only / Non-Mutating Execution**:
   - The browser never submits forms, clicks external transaction buttons, creates or logs into external user accounts, or modifies remote site state.
   - It never downloads executable files or stores persistent cookies across sessions.
3. **No Transmission of Private Mission Evidence**:
   Private telemetry, confidential payload parameters, and user credentials are never transmitted to external websites.
4. **Candidate-Only Status**:
   Captured page text is treated strictly as unconfirmed candidate evidence (`human_confirmed = False`). A human reviewer must verify the quote against the primary document before it can be cited in a dossier.

## API Endpoint & Contract

### Endpoint: `POST /integrations/browser-use/capture`
**Authentication**: Reviewer Bearer Token (`Authorization: Bearer <token>`)

#### Request Schema:
```json
{
  "url": "https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf",
  "target_clause": "5-year disposal rule",
  "max_excerpt_chars": 2000
}
```

#### Response Schema:
```json
{
  "status": "SUCCESS",
  "url": "https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf",
  "domain": "docs.fcc.gov",
  "capture_time": "2026-10-24T15:00:00Z",
  "page_title": "FCC Second Report and Order FCC 22-74",
  "excerpt": "In-orbit satellites in Low Earth Orbit must complete post-mission disposal within 5 years of mission termination.",
  "locator": {
    "source_url": "https://docs.fcc.gov/public/attachments/FCC-22-74A1.pdf",
    "clause": "5-year disposal rule",
    "cloud_run_id": "run_bu_987123"
  },
  "human_confirmed": false,
  "warning": "SYNTHETIC CANDIDATE EXTRACTION - REQUIRES INDEPENDENT HUMAN VERIFICATION"
}
```

## Configuration & Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `BROWSER_USE_ENABLED` | Feature flag to activate remote browser execution | `0` (Disabled) |
| `BROWSER_USE_API_KEY` | Server-side API key for Browser Use Cloud | *None (Blank)* |
| `BROWSER_USE_API_URL` | Browser Use Cloud API base URL | `https://api.browser-use.com/v1` |

## Offline Mock Behavior
When `BROWSER_USE_ENABLED=0`, the integration returns cached, pre-verified excerpts for allowlisted domains without invoking remote cloud browsers or incurring external billing.
