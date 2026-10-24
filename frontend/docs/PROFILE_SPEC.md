# OrbitScore Profile Specification (`PROFILE_SPEC.md`)

**Profile Identifier**: `demo-evidence-completeness`  
**Profile Version**: `v0.1.0`  
**Profile Title**: Illustrative Mission Evidence Completeness Profile (Synthetic)  
**Profile Status**: `DEMO / SYNTHETIC` (Not derived from any agency, national, or international spaceflight regulation).

---

## 1. Executive Summary & Mandatory Non-Claims

This profile exists solely to demonstrate the deterministic checking engine and human review workflow in OrbitScore.
- **NOT A REGULATION**: This profile is purely synthetic and is not endorsed by, derived from, or aligned with the FCC, ITU, NASA, ESA, UKSA, or FAA.
- **NOT A SAFETY DECISION**: Running this profile evaluates evidence traceability and data completeness; it does **not** evaluate orbital lifetime, collision probability, structural integrity, electromagnetic interference, or reentry survivability.
- **WHAT THIS PROFILE DOES NOT COVER**:
  1. No orbital-risk or space debris mitigation assessment.
  2. No legal or regulatory interpretation or compliance determination.
  3. No engineering adequacy, flight readiness, or mission assurance judgment.
  4. No qualification of team operational competence.

---

## 2. Applicability Gate

Before executing any deterministic checks, the engine evaluates the declared `Mission.objectType`:

| Declared `objectType` | Gate Evaluation | Outcome & Behavior |
|---|---|---|
| `'cubesat'`, `'smallsat'` | **APPLICABLE** | Proceeds to deterministic checks `C-01` through `C-06`. |
| `'payload'`, `'other'` | **NOT APPLICABLE** | Halts execution. Generates a top-level finding: `Not applicable (out of profile scope)`. Message: *"Profile demo-evidence-completeness v0.1.0 is calibrated solely for integrated CubeSat and SmallSat platforms (1U to 27U). Payload packages and non-standard orbital objects must be evaluated under a specialized payload integration profile."* |

---

## 3. Deterministic Check Definitions

All checks are pure, deterministic functions $f(\text{frozenEvidenceSnapshot}) \to \text{CheckResult[]}$.

```
Allowed Finding Outcomes:
- Documented
- Needs attention: missing
- Needs attention: conflicting
- Needs attention: unconfirmed
- Not applicable (out of profile scope)
```

### Check `C-01`: Required Parameters Present
- **ID**: `C-01`
- **Title**: Mandatory Mission Baseline Parameters
- **Description**: Verifies that evidence records exist for all core parameters required to establish basic mission context.
- **Required Parameter Keys**:
  1. `mass_wet_kg` (or `mass_dry_kg`)
  2. `dimensions_folded_mm`
  3. `orbit_regime_declared`
  4. `deployment_epoch_target`
  5. `primary_contact_document`
- **Deterministic Logic**:
  - For each required key, inspect evidence register.
  - If count of items with matching `parameterKey` $== 0 \implies$ Outcome: `Needs attention: missing`.
  - If all required keys have $\ge 1$ item $\implies$ Outcome: `Documented`.
- **Engineering Rationale**: Spacecraft teams cannot conduct downstream licensing or launch integration without fundamental mass, envelope, and orbital regime declarations.

---

### Check `C-02`: Units Present & Permitted
- **ID**: `C-02`
- **Title**: Standard Physical Units Validation
- **Description**: Verifies that every numeric physical parameter declares an allowed, standardized SI or aerospace unit.
- **Unit Whitelist**:
  - Mass: `kg`, `g`
  - Dimensions: `mm`, `cm`, `m`
  - Orbit / Altitude: `km`, `nmi`
  - Velocity: `m/s`, `km/s`
  - Frequency / RF: `MHz`, `GHz`
  - Energy / Power: `W`, `Wh`, `J`, `mAh`
- **Deterministic Logic**:
  - Scan all evidence items where `valueType == 'numeric'`.
  - If `unit` is missing, null, or not in the permitted set $\implies$ Outcome: `Needs attention: missing` or `Needs attention: unconfirmed`.
  - If all units are permitted $\implies$ Outcome: `Documented`.
- **Engineering Rationale**: Unit ambiguities have historically caused catastrophic spaceflight mission losses (e.g., Mars Climate Orbiter metric/imperial confusion).

---

### Check `C-03`: Cross-Source Consistency & Conflict Detection
- **ID**: `C-03`
- **Title**: Cross-Document Parameter Discrepancy Detection
- **Description**: Compares multiple values entered from disparate sources for the same parameter key to identify engineering discrepancies beyond declared tolerances.
- **Tolerance Thresholds**:
  - Mass: $\pm 2.0\%$ tolerance
  - Dimensions: $\pm 1.0\text{ mm}$ tolerance
  - Battery Capacity: $\pm 5.0\%$ tolerance
- **Deterministic Logic**:
  - Group evidence items by `parameterKey`.
  - If multiple distinct values exist for a key and $|v_1 - v_2| / \max(v_1, v_2) > \text{tolerance} \implies$ Outcome: `Needs attention: conflicting`.
  - Lists the conflicting document titles and locators in the finding message.
  - If values agree within tolerance $\implies$ Outcome: `Documented`.
- **Engineering Rationale**: Divergent numbers across systems budgets indicate stale documents, uncoordinated revisions, or uncommunicated design changes.

---

### Check `C-04`: Source Traceability & Document Locators
- **ID**: `C-04`
- **Title**: Source Document Citation & Page/Section Locators
- **Description**: Verifies that every evidence item points to an authentic primary document with an explicit page, section, or drawing number locator.
- **Deterministic Logic**:
  - For every evidence item, evaluate `source.documentTitle` and `source.locator`.
  - If `source.documentTitle` is empty or `source.locator` is blank/vague $\implies$ Outcome: `Needs attention: missing` (missing locator).
  - If every item has explicit document and page/section citation $\implies$ Outcome: `Documented`.
- **Engineering Rationale**: A claim without a verifiable source locator cannot be peer-reviewed by mission reviewers or regulators.

---

### Check `C-05`: Version & Date Currency
- **ID**: `C-05`
- **Title**: Document Baseline Age & Currency Check
- **Description**: Compares source document dates against the mission's declared baseline threshold date (defaults to 180 days prior to current date or the mission context date).
- **Deterministic Logic**:
  - For each evidence item, if `source.documentDate < mission.baselineThresholdDate` $\implies$ Outcome: `Needs attention: unconfirmed` (stale baseline).
  - Finding explicitly states the age delta in days.
- **Engineering Rationale**: Mission teams frequently rely on preliminary CDR slide decks that have been superseded by launch-manifested baseline ICDs.

---

### Check `C-06`: Confirmation Status of Dependent Inputs
- **ID**: `C-06`
- **Title**: Human Verification Status of Key Parameters
- **Description**: Verifies whether critical parameters have been explicitly reviewed and promoted to `confirmed` by a human team member.
- **Deterministic Logic**:
  - Scan all evidence items tied to required parameters.
  - If any required parameter item has `state == 'unconfirmed'` $\implies$ Outcome: `Needs attention: unconfirmed`.
  - Message identifies the unconfirmed items and prompts human review in Step 3.
  - If all required items are `confirmed` $\implies$ Outcome: `Documented`.
- **Engineering Rationale**: Unvetted claims should never be incorporated into an export packet without designated human accountability.

---

## 4. Versioning & Deprecation Policy

- **SemVer Specification**: Profiles follow strict Semantic Versioning (`MAJOR.MINOR.PATCH`).
  - `PATCH`: Bug fixes in regex or unit parsing logic that do not change finding outcomes.
  - `MINOR`: New check definitions or backwards-compatible unit whitelist additions.
  - `MAJOR`: Changes to required parameter keys or tolerance formulas that could alter finding outcomes for existing datasets.
- **Frozen Snapshots in CheckRuns**: Whenever checks are executed, a `CheckRun` object stores both `profileId` and `profileVersion`, alongside an immutable snapshot of all input evidence items. This guarantees that findings remain 100% reproducible over time, even if the profile is updated later.
