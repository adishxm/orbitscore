# OrbitReady Research Dossier v2
## Source-locked, claim-traceable upgrade for Hackyard Build 2026

**Research date:** 17 October 2026  
**Purpose:** Upgrade the previous OrbitReady dossier using the attached quality-control brief.  
**Status labels:** **Confirmed**, **Inference**, **Assumption**, **Unknown**, **Unsupported**.

> **Decision:** Build OrbitReady as a narrow pre-review evidence workflow. Do not build an operational collision-prediction or conjunction-alert product.

## 1. Executive verdict

### Worth building?

**Yes, if the product claim remains narrow.** OrbitReady has a credible hackathon shape because the core flow is deterministic, visible, testable, and independent of live orbital feeds. Its value proposition is not “AI predicts space risk.” It is:

> **OrbitReady helps a small spacecraft team determine whether its debris-mitigation evidence is ready for expert review, and shows which documented design change would improve readiness.**

This framing fits the official Hackyard emphasis on making the smallest working product, testing awkward cases, and showing what the product does. Hackyard’s published judging weights are Build 40%, Problem 20%, Ingenuity 20%, and Potential 20%. [1] [2]

### Strongest element

The strongest element is the **evidence-linked counterfactual review**:

```text
mission input → stored evidence → scoped policy clause → deterministic finding
→ missing proof or corrective action → before/after comparison → cited packet
```

### Weakest element

The weakest element is the MSRI score if a viewer interprets it as a probability, scientific risk model, legal status, or safety guarantee. It must remain a coarse prioritization index with visible weights, unknowns, confidence, and limitations.

### Remove

Remove live conjunction prediction, maneuver recommendation, global tracking, universal compliance, insurance scoring, and any claim of NASA, ISRO, ESA, IN-SPACe, ISO, UN, IADC, FCC, or Hackyard endorsement.

### Safety boundary

OrbitReady is not an official certification tool, regulator, collision-prediction system, operator-facing conjunction-alert tool, or replacement for NASA Debris Assessment Software. Public orbital data may be used only for educational, contextual, historical, or clearly non-operational purposes. Synthetic data must be labeled in the interface and packet.

## 2. Problem analysis

### Real problem

A small spacecraft team preparing an internal review often has mission values and engineering documents but lacks an auditable connection between each design decision and the evidence a reviewer will expect. The team needs to know:

- what is satisfied;
- what is merely asserted;
- what proof is missing;
- what source clause applies;
- whether the source is current and in scope;
- who owns the next action; and
- what changes if one mission parameter changes.

### Problem behind the problem

The underlying bottleneck is **evidence traceability**, not the absence of another orbital map. The same value may appear in a spreadsheet, document, email, supplier response, and review slide with different dates or units. A readiness review that cannot preserve lineage creates rework and weakens expert handoff.

### Why now

The orbital environment is dynamic and affected by fragmentation, collision, release of mission-related objects, and post-mission behavior. Research on collision cascades and long-term LEO evolution supports mitigation as a real sustainability concern, but it does not provide a universal small-team readiness score. [24] [25] [26] [27]

Formal and quasi-formal mitigation sources now span NASA, UN COPUOS, IADC, ISO, ESA, and ISRO. These sources are not interchangeable: some are technical guidelines, some are standards, some are agency requirements, and some are public policy intent. OrbitReady’s job is to preserve those distinctions.

### Why this is not just another dashboard

A dashboard shows status. OrbitReady’s differentiator is the **trace**:

- status;
- triggering input;
- source clause;
- evidence excerpt;
- reasoning;
- uncertainty;
- next action;
- controlled before/after result.

## 3. Source audit and repair report

### Previous dossier audit

| Previous item | Audit result | Action in v2 |
|---|---|---|
| Hackyard overview and guide | Strong primary event sources | Keep; use exact wording and access date |
| NASA DAS page | Strong primary source | Keep; say NASA provides a debris-assessment utility; do not imply universal legal acceptance |
| ISRO DFSM statement | Strong primary public policy statement | Keep; scope as Indian DFSM intent, not endorsement or certificate |
| UNOOSA guideline PDF | Primary intergovernmental source | Keep; use for guideline principles, not jurisdiction-specific compliance |
| IADC guideline | Primary technical guidance | Keep; distinguish revision and scope |
| ISO 24113 page | Official scope page, full standard may be inaccessible/paywalled | Keep as scope evidence only; do not reproduce unseen clauses |
| ESA requirements PDF | Official agency document | Keep; label ESA-specific |
| Kessler 1981 DOI | Previous dossier had malformed DOI/Markdown | **Fixed:** `https://doi.org/10.1016/0094-5765(81)90111-7` |
| NASA ODPO library gateway | Too broad for a claim citation | Replace with exact NASA DAS, ORDEM, passivation, and model-validation pages |
| ESA user portal gateway | Too broad for specific claims | Replace with exact DISCOS, API, DRAMA, and environment-report pages |
| LeoLabs page | Product page, not science evidence | Keep only in competitor section |
| Slingshot Beacon page | Product page, not science evidence | Keep only in competitor section |
| NIST AI RMF | Governance source, not orbital evidence | Keep only for AI-risk design claims |
| RAG/XAI papers | Relevant methodology sources | Keep, but do not treat them as proof that OrbitReady explanations are correct |

### Source-type taxonomy

- **Primary official:** NASA, ISRO, UNOOSA, IADC, ISO scope page, ESA, Space-Track, Hackyard.
- **Peer-reviewed / archival research:** journal, conference, DOI, NASA technical paper, ESA conference paper.
- **Dataset/documentation:** CelesTrak, DISCOSweb/API, ORDEM, official catalogs.
- **Competitor/product:** LeoLabs, Slingshot, commercial tools.
- **Gateway:** broad library or portal page. Useful for discovery; insufficient alone for narrow claims.
- **Assumption:** prototype choice, not external evidence.

### Claim-language repairs

| Too-strong wording | Correct wording |
|---|---|
| “NASA maintains a formal compliance workflow that OrbitReady complements.” | “NASA provides Debris Assessment Software as a debris-assessment utility; OrbitReady is proposed as an earlier evidence-readiness layer.” |
| “Hackyard asks for one person, one problem, one useful flow.” | “Hackyard’s guide strongly emphasizes starting small and building one useful flow.” |
| “ISRO requires…” | “ISRO’s public DFSM statement says…” |
| “The score measures sustainability.” | “The prototype index prioritizes evidence-review work.” |
| “RAG prevents hallucination.” | “Retrieved clauses constrain the explanation layer but do not guarantee correctness.” |
| “DISCOS is operationally authoritative for OrbitReady.” | “DISCOS is an ESA reference database with API terms and stated operational uses; OrbitReady should not depend on it for the demo.” |
| “Public TLEs provide real-time orbit intelligence.” | “Public GP/TLE/OMM data can provide educational context with age and source labels; Space-Track warns public TLEs should not be used for operational conjunction-assessment prediction.” |

## 4. Domain science

### Collision cascades and long-term environment

Kessler and Cour-Palais introduced the collision-frequency framing for a debris belt; Kessler later analyzed collisional cascading and population limits. [24] [25] Liou and Johnson used environment modeling to discuss risks from orbiting debris and the importance of mitigation. [26] Long-term environment studies compare scenarios with different disposal and removal assumptions. [27] [28]

These sources support the problem context. They do **not** justify a new probability score inside OrbitReady.

### Fragmentation and passivation

Breakups can come from collisions, explosions, residual energy, or intentional actions. Passivation reduces stored energy after mission operations. NASA’s passivation literature and debris-mitigation sources support a passivation evidence field, but the MVP should not attempt to calculate structural reliability or fragmentation probability. [29] [30]

### Post-mission disposal

Disposal is a mission-design decision. Relevant variables can include orbit regime, remaining orbital lifetime, controlled re-entry capability, disposal propulsion, reliability evidence, and ownership of the disposal plan. A five-year threshold may be relevant to a particular public policy statement or standard, but it must not be hard-coded as a universal rule.

### Trackability and identification

Trackability, identifiability, and maneuverability are separate evidence concepts. A declared radio, sensor, or propulsion system is not the same as verified operational capability. OrbitReady should ask for evidence and label assumptions rather than infer readiness.

## 5. Policy and regulation matrix

| Source | Type / scope | Exact support | Safe automation | Expert boundary | MVP claim |
|---|---|---|---|---|---|
| NASA DAS page | Official NASA utility | DAS assesses debris generation, vulnerability, postmission lifetime, and entry safety; current page identifies DAS 3.2.7 and usage agreement | Link source; map evidence fields to NASA-inspired checks | Formal assessment, reliability interpretation, use of DAS outputs | “NASA-inspired pre-review,” not DAS or certification |
| NASA Technical Standard 8719.14 | NASA standard context | NASA debris-mitigation requirements | Store verified public metadata and selected clauses where available | Applicability and conformance | Scope only unless exact clause verified |
| NASA ORDEM 3.2 | Official model | Debris flux, directionality, size/material bins, LEO–GEO model context | Show as contextual model reference | Engineering interpretation and model use | Not a live tracking or compliance engine |
| UN COPUOS Space Debris Mitigation Guidelines | UN guideline | Mission planning and mitigation principles | Store source-linked checklist | National adoption and legal interpretation | Generic international guidance |
| IADC-02-01 guideline | Inter-agency technical guidance | Mitigation practices, post-mission disposal, break-up prevention, re-entry | Versioned fixtures and interpretation label | Tailoring and engineering judgment | IADC-inspired, revision-specific |
| ISO 24113:2023 | International standard scope page | Primary requirements for unmanned systems | Record standard metadata and scope | Access, licensing, conformance | Cite scope; do not claim full implementation without text |
| ESA Space Debris Mitigation Requirements | Agency standard | ESA-specific mitigation requirements | Profile only when exact source is available | ESA mission/contract applicability | ESA-specific, not universal |
| ESA DRAMA | Agency analysis tool | Mitigation analysis across operational/disposal phases | Explain complementary boundary | Use and interpretation by mission analysts | Not reproduced by OrbitReady |
| ISRO DFSM statement | Indian public initiative | 2030 intent; zero debris, PMD target language, trackability, identifiability, maneuverability, coordination | India DFSM-inspired profile | Indian authorization and expert interpretation | Public-source-derived; no endorsement |
| India Space Policy 2023 | National policy | Broader Indian space-policy context | Context metadata | Regulatory interpretation | Not a debris rulebook by itself |
| FCC orbital-debris rule materials | U.S. regulatory example | National licensing context | Separate profile only if exact rule verified | Filing and regulator decision | Exclude from first demo unless sourced |
| UN Long-Term Sustainability Guidelines | UN guideline | Information sharing, coordination, long-term sustainability | Contextual checklist | State and operator responsibilities | Not a certificate basis |

## 6. Paper-by-paper literature review

### A. Orbital debris and mission analysis

| Paper | Venue / exact URL | Key idea and OrbitReady relevance | Methods / data | Limitation | Priority |
|---|---|---|---|---|---|
| Kessler & Cour-Palais (1978), “Collision Frequency of Artificial Satellites: The Creation of a Debris Belt” | *JGR*, https://doi.org/10.1029/JA083iA06p02637 | Foundational collision-cascade framing; supports problem context | Collision-frequency modeling | Historical assumptions; not a rule engine | Must-cite |
| Kessler (1981), “Collisional cascading: The limits of population growth in low earth orbit” | *Advances in Space Research*, **correct DOI:** https://doi.org/10.1016/0094-5765(81)90111-7 | Corrected citation; supports cascade explanation | Population/collision modeling | Scenario dependent | Must-cite |
| Liou & Johnson (2006), “Risks in space from orbiting debris” | *Science*, https://doi.org/10.1126/science.1123785 | Long-term debris risk and mitigation context | Environment modeling | Not a small-team workflow | Must-cite |
| Liou & Johnson (2009), “A LEO satellite post-mission disposal study for debris mitigation” | NASA/space-debris literature record, https://orbitaldebris.jsc.nasa.gov/library/ | Connects disposal decisions with environment outcomes | Long-term environment scenarios | Model assumptions and scenario limits | Should-cite |
| Liou (2011), “An update on the effectiveness of active debris removal” | NASA/ODPO literature, https://orbitaldebris.jsc.nasa.gov/library/ | Separates mitigation from active removal | Scenario analysis | Removal is outside MVP | Should-cite |
| Liou et al. (2013), “The 2010 NASA ODPO long-term orbital debris environment simulations” | NASA technical literature, https://orbitaldebris.jsc.nasa.gov/library/ | Shows the role of environment simulation | LEGEND-style long-term simulations | Not an evidence checklist | Should-cite |
| Krisko et al. (2015), “ORDEM 3.0 and MASTER-2009 modeled debris population comparison” | *Acta Astronautica*, https://www.sciencedirect.com/science/article/abs/pii/S0094576515001241 | Demonstrates model differences and provenance importance | Compares NASA/ESA models | Not mission compliance | Should-cite |
| Liou et al. (2018), “The effectiveness of mitigation measures in stabilizing the LEO environment” | NASA/ESA debris literature, https://conference.sdo.esoc.esa.int/ | Supports mitigation-effectiveness framing | Long-term environment scenarios | Scenario uncertainty | Should-cite |
| Braun et al. (2020), “Upgrade of DRAMA—ESA’s space debris mitigation analysis tool” | *Acta Astronautica*, https://www.sciencedirect.com/science/article/abs/pii/S2468896720300847 | Shows established mitigation software and strengthens complementary positioning | Tool-suite upgrade and analysis modules | Agency tool scope differs | Should-cite |
| Hull & Schonberg (2021), “Spacecraft Passivation—An Overview of Requirements…” | NASA NTRS, https://ntrs.nasa.gov/citations/20210019018 | Supports passivation evidence field | Review of passivation philosophies | Not universal law | Should-cite |
| Moreschi et al., “Implications of Space Debris Mitigation…” | ESA Space Debris Conference, https://conference.sdo.esoc.esa.int/proceedings/sdc9/paper/306/ | Disposal and mitigation analysis context | Integrated disposal analysis | Conference paper; use cautiously | Optional |
| Liou et al., “Stability of the Future LEO Environment—an IADC comparison study” | ESA conference PDF, https://conference.sdo.esoc.esa.int/proceedings/sdc6/paper/199/ | Shows sensitivity of future environment to assumptions | Multi-model comparison | Not a product-validation benchmark | Should-cite |

### B. Explainability, counterfactuals, uncertainty, provenance, and human review

| Paper | Exact URL | Relevance and method | Limitation | Priority |
|---|---|---|---|---|
| Wachter, Mittelstadt & Russell (2018), “Counterfactual Explanations without Opening the Black Box” | https://jolt.law.harvard.edu/assets/articlePDFs/v31/Counterfactual-Explanations-without-Opening-the-Black-Box-Sandra-Wachter-et-al.pdf | Actionable “what would need to change?” framing | Counterfactuals may be infeasible/non-unique and are not automatically causal | Must-cite |
| Ribeiro, Singh & Guestrin (2016), “Why Should I Trust You?” | https://doi.org/10.1145/2939672.2939778 | Local explanations; informs why OrbitReady should prefer rule traces | LIME can be unstable and model-dependent | Should-cite |
| Lundberg & Lee (2017), “A Unified Approach to Interpreting Model Predictions” | https://papers.nips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions | Feature attribution reference | Attribution is not provenance or causality | Optional |
| Miller (2019), “Explanation in Artificial Intelligence: Insights from the Social Sciences” | https://doi.org/10.1016/j.artint.2018.07.007 | Supports contrastive, human-readable explanations | Not space-specific | Must-cite |
| Guidotti et al. (2018), “A Survey of Methods for Explaining Black Box Models” | https://doi.org/10.1145/3236009 | Maps XAI families and failure modes | Survey-level evidence | Should-cite |
| Guo et al. (2017), “On Calibration of Modern Neural Networks” | https://proceedings.mlr.press/v70/guo17a.html | Shows confidence can be miscalibrated | Deep-model context | Must-cite |
| Ovadia et al. (2019), “Can You Trust Your Model’s Uncertainty?” | https://papers.nips.cc/paper/9547-can-you-trust-your-models-uncertainty | Uncertainty under distribution shift | Not a deterministic rule study | Should-cite |
| Lewis et al. (2020), “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks” | https://arxiv.org/abs/2005.11401 | Grounded retrieval architecture | Retrieval does not guarantee factual output | Must-cite |
| Gao et al. (2023), “Retrieval-Augmented Generation for Large Language Models: A Survey” | https://arxiv.org/abs/2312.10997 | RAG architecture and evaluation survey | Fast-changing field | Should-cite |
| Wang et al. (2024), “DocLLM” | https://aclanthology.org/2024.acl-long.463/ | Layout-aware document understanding | Extraction still needs validation | Must-cite |
| Buneman, Khanna & Tan (2001), “Why and Where: A Characterization of Data Provenance” | https://doi.org/10.1007/3-540-44503-X_20 | Formal provenance/lineage concepts | Database theory is not policy interpretation | Must-cite |
| Amershi et al. (2019), “Guidelines for Human-AI Interaction” | https://doi.org/10.1145/3290605.3300233 | Supports visible uncertainty, correction, and escalation | General human-AI setting | Must-cite |
| Parasuraman, Sheridan & Wickens (2000), “A Model for Types and Levels of Human Interaction with Automation” | https://doi.org/10.1109/3477.844354 | Supports explicit human decision boundaries | Older conceptual framework | Should-cite |
| Sculley et al. (2015), “Hidden Technical Debt in Machine Learning Systems” | https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems | Supports avoiding unnecessary ML infrastructure | General ML systems | Optional |

**Literature conclusion:** The research supports deterministic, provenance-rich review more strongly than it supports an opaque score. Counterfactuals are useful as contrastive design explanations but need feasibility constraints and must not be sold as causal guarantees.

## 7. Data-source audit

| Source | Owner / access | Exact fields or content | Freshness | Restrictions / quality | Demo role | Operational role | Fallback |
|---|---|---|---|---|---|---|---|
| User mission profile | Mission team / private upload or form | Orbit type, altitude, inclination, mass, duration, propulsion, disposal, evidence links | User-supplied; timestamp required | Incomplete/conflicting/private | Primary demo input | Potentially, only with controlled provenance | Seeded synthetic profile |
| NASA DAS | NASA / request plus usage agreement | Mission/debris-assessment inputs and outputs; user guide and project files | Versioned; current NASA page identifies DAS 3.2.7 | Windows and agreement; specialized scope | Reference and future integration | Expert tool, not OrbitReady dependency | NASA-inspired fixtures |
| NASA ORDEM 3.2 | NASA / software request or cloud application | Flux by size bin/material/direction and velocity; 10 µm–1 m context; 2016–2050 model scope | Versioned and periodically updated | Agreement/access; model assumptions; not CA | Optional educational chart | Engineering model, not conjunction alerts | Static versioned example |
| ESA DISCOSweb | ESA / account, API docs, terms | Launch, object registration, launch vehicle, spacecraft size/mass/shape/mission/owner; >40,000 trackable unclassified objects claimed on page | Maintained; API versions matter | Registration/terms; ephemeris not distributed via DISCOSweb; source attribution required | Optional reference lookup | ESA says API can support operational uses, but OrbitReady should not depend on it | Cached object record |
| ESA DRAMA | ESA / portal/software | Debris-risk and mitigation analysis modules | Versioned | Specialist tool, not a generic compliance engine | Competitor/benchmark reference | Expert mission analysis | Link and explain boundary |
| Space-Track GP/TLE/OMM | U.S. government / approved account and terms | Catalog number, object name/designator where available, epoch, mean elements, OMM fields; products and CA service documentation | Service-dependent; age must be stored | Public TLE warning; account/terms and data-transfer restrictions | Historical/contextual display only | Public TLE not for operational CA prediction | Cached labeled fixture |
| CelesTrak GP data | Public web queries | CATNR, INTDES, GROUP, NAME, SPECIAL; TLE/3LE/2LE/XML/KVN/JSON/CSV; OMM keyword fields | CelesTrak says it checks for new GP data about every two hours; rate limits and blocks exist | Derived GP data, format gaps for 6-digit objects, request limits | Good demo context | Not safety-grade CA | Stop on errors; cache with timestamp |
| ISRO DFSM page | ISRO public page | Policy intent, PMD target language, trackability, identifiability, maneuverability, coordination | Published Apr 2024; page metadata can change | Public initiative, not complete rulebook | Policy profile source | Not an operational dataset | Stored source snapshot and URL |
| UN COPUOS PDF | UNOOSA public PDF | Mitigation guidelines and principles | Versioned document | Guideline scope, not one regulator’s law | Policy library | Not a mission analysis dataset | Stored PDF/page citation |
| IADC guideline | IADC official document | Technical guideline clauses and target values by revision | Revision-specific | Use current revision; public access varies | Policy fixtures | Technical reference, not an automated certificate | Cite exact revision |
| ISO 24113 page | ISO public standard metadata | Standard title, scope, edition metadata | Versioned | Full text may be paywalled | Scope reference | Conformance requires standard access/expertise | Use open public guidance instead |
| Official mission pages | Space agencies/operators | Mission objectives, orbit, launch, spacecraft facts | Page-specific | Marketing and incomplete fields | Context and provenance example | Not sufficient alone for compliance | Require primary document or human confirmation |
| Uploaded document | User/private | Text, tables, page/section, extracted fields | As uploaded | OCR/layout errors and confidentiality | One synthetic/authorized PDF | Human-reviewed only | Structured intake |
| Synthetic fixture | OrbitReady-authored | Complete, incomplete, conflict, stale, failure cases | Fixed version | Not real evidence | Essential | Never operational | Clearly labeled |

### Data-source decisions

- **Core dependency:** user-provided mission fields, stored policy clauses, and synthetic fixtures.
- **Optional contextual dependency:** CelesTrak or Space-Track GP/OMM record with age/source labels.
- **Not a core dependency:** NASA DAS, ORDEM, ESA DRAMA, DISCOS, or a live operator feed.
- **Operational suitability:** none of the public feeds should be presented as sufficient for OrbitReady operational conjunction assessment.

## 8. Existing solutions

| Solution | Type / users | What it actually does | Strength | Gap | OrbitReady distinction |
|---|---|---|---|---|---|
| NASA DAS | Debris assessment utility; NASA programs and engineers | Assesses debris generation, vulnerability, postmission lifetime, entry safety | Domain-specific and established | Not an early evidence workspace; not all reliability facets | Prepares evidence and explains gaps before specialist assessment |
| NASA ORDEM | Debris environment engineering model | Estimates debris flux, directionality, size/material bins; spacecraft/telescope modes | High-fidelity engineering model and V&V material | Not a policy/evidence workflow or CA service | Does not create a new debris model |
| ESA DRAMA | Mitigation analysis suite | Supports mission operational/disposal mitigation analysis | Agency-grade domain capability | Specialist and not a collaboration packet | Wraps earlier evidence readiness, not DRAMA replacement |
| ESA DISCOSweb | Reference database/API | Object registration, launch, spacecraft facts, API | Rich reference data and attribution rules | Access, version, and catalog interpretation | Optional provenance lookup only |
| Space-Track / 18 SDS | Government catalog and operator services | GP data, CA services, CDMs, operator support | Operational ecosystem and authority | Not a small-team design-evidence product; terms apply | Explicitly outside operational CA |
| CelesTrak | Public GP-data service | Queries GP data in TLE/OMM/JSON/CSV formats | Accessible, documented, useful for education | Rate limits, derived public data, operational warning | Optional historical/contextual panel |
| LeoLabs | Commercial orbital intelligence | SDA, STM, radars, catalog, alerts, launch/operations | Persistent sensors and operational scale | Different buyer, data, and risk boundary | Evidence-readiness workflow for small operators |
| Slingshot Beacon | Collision-avoidance collaboration | Operator communications, maneuver alerts, CDM/ephemeris sharing | Cross-operator coordination | Operations rather than design review | Before-review evidence and packet |
| Commercial compliance platforms | Workflow/document tools | Tasks, document storage, approvals | General workflow maturity | Lack of debris-specific deterministic clauses | Domain-specific evidence map |
| Open-source SGP4/poliastro tools | Libraries / researchers | Propagation and orbit-data handling | Accessible developer tooling | Not policy or safety workflow | Never infer compliance from propagation |

Competitor pages are **product references**, not evidence for debris science or regulatory claims. LeoLabs describes persistent orbital intelligence, space-domain awareness, space-traffic management, launch and operations support, radars, and AI-enabled alerts. [20] Slingshot describes Beacon as a collision-avoidance collaboration and communications platform with operator alerts, CDMs, and ephemeris sharing. [21]

## 9. Claim-to-source traceability

| Claim | Source | Status | Recommendation |
|---|---|---|---|
| Hackyard’s Build weight is 40% | Official Hackyard [1] [2] | Confirmed | Keep |
| Hackyard build is 24–25 Oct 2026 at IIT Guwahati | Official Hackyard [1] [2] | Confirmed | Keep |
| Hackyard guide prioritizes small working flows and awkward tests | Official guide [2] | Confirmed | Keep with paraphrase |
| Debris collision cascades are a recognized scientific concern | Kessler/Liou [24]–[26] | Confirmed | Keep |
| Mitigation and disposal affect future environment scenarios | Liou/ESA literature [27] [28] | Confirmed | Keep, qualify models |
| NASA DAS assesses debris-related requirements | NASA [3] | Confirmed | Keep |
| NASA DAS is a universal regulator | No source | Unsupported | Remove |
| Public TLE is suitable for operational CA | Space-Track says the opposite [18] | Unsupported | Remove |
| ISRO endorses OrbitReady | No source | Unsupported | Remove |
| ISRO DFSM statement contains public PMD/trackability targets | ISRO [4] | Confirmed as statement | Keep in scoped profile |
| ISO 24113 is a universal legal rule | ISO page only establishes standard scope | Unsupported | Replace with “international standard scope” |
| DISCOS distributes surveillance ephemerides | DISCOS page says it does not distribute them [42] | False | Remove |
| CelesTrak provides OMM JSON/CSV and query parameters | CelesTrak docs [41] | Confirmed | Keep |
| CelesTrak should be polled continuously | CelesTrak warns against frequent requests [41] | Unsupported | Remove; use caching |
| ORDEM is a collision-alert feed | NASA ORDEM page [43] | Unsupported | Remove |
| Counterfactuals can express actionable input changes | Wachter et al. [31] | Confirmed as XAI concept | Keep with feasibility caveat |
| RAG guarantees truthful answers | RAG papers [34] [35] | Unsupported | Remove |
| Confidence is always calibrated | Guo/Ovadia [36] [37] | Unsupported | Remove |
| Provenance supports lineage/auditability | Buneman [38] | Inference | Keep as design objective |
| AI should not decide the deterministic status | Human-AI and automation literature [39] [40] | Inference/design decision | Keep |
| OrbitReady can be built in 24 hours | Scope judgment | Inference | Keep as plan, not fact |
| MSRI is a safety probability | No source | Unsupported | Remove |
| MSRI is a prototype prioritization index | Product assumption | Assumption | Keep with visible disclaimer |

## 10. Validation plan

### Baseline

The baseline is a versioned JSON fixture with expected statuses, evidence references, confidence, and next actions. The baseline does not claim to validate the science of MSRI.

### Required tests

| Test | Expected result |
|---|---|
| Complete fixture | Stable Pass/Warning findings and cited inputs |
| Exact boundary | Explicit, versioned behavior at threshold |
| Missing disposal field | Needs evidence or Not evaluated; never Pass |
| Missing trackability proof | Needs evidence and confidence reduction |
| Conflicting mission documents | Conflict shown; no silent winner |
| Stale external record | Age shown and confidence reduced or input blocked |
| API timeout/403/404 | Stop retries, use labeled cache, or return Not evaluated |
| CelesTrak rate limit | Cached response used; no repeated polling |
| Unsupported policy profile | Not evaluated and expert escalation |
| Unsupported LLM explanation | Rejected or marked unsupported |
| Citation deletion | Packet fails citation-integrity check |
| Counterfactual parameter change | Only affected rules/components change |
| Re-run determinism | Same input and rule version produce same output |
| Export completeness | Packet includes sources, assumptions, limitations, findings |

### Success metrics

- 100% seeded rule fixtures match expected outputs.
- 100% critical missing-input cases produce non-pass states.
- 100% findings expose an input reference and policy-clause reference.
- 100% counterfactual fixtures reproduce the same delta.
- Zero unsupported claims in the seeded export.
- Demo completes offline after initial load.

### What cannot be validated in 24 hours

- Scientific validity of MSRI as a probability.
- Regulatory acceptance.
- Operational conjunction-assessment performance.
- Generalization to all jurisdictions.
- Real mission safety.
- Time savings across organizations.

## 11. Red-team / hostile judge analysis

| Concern | Strong answer | Evidence needed | Weakness if unanswered |
|---|---|---|---|
| Why AI? | AI extracts and explains; deterministic rules decide. | Architecture and tests | AI decoration |
| Why not NASA DAS? | DAS is specialized assessment; OrbitReady is earlier evidence preparation. | NASA DAS [3] | Redundant product |
| Why not LeoLabs? | LeoLabs operates at persistent orbital intelligence and SDA/STM scale; we address pre-review evidence. | LeoLabs page [20] | Weak differentiation |
| Why not Slingshot? | Slingshot coordinates operational collision avoidance; we prepare design evidence before that stage. | Beacon page [21] | Wrong market |
| Where is the real data? | The mission profile is user-owned; demo uses labeled synthetic input and official policy sources. | Data audit | Fabrication suspicion |
| Is the score valid? | No scientific probability claim; it is a transparent prioritization aid. | Formula/disclaimer | False precision |
| What if data is missing? | Needs evidence or Not evaluated, never Pass. | Missing-data fixture | Unsafe output |
| What if sources disagree? | Preserve both, scope them, escalate. | Conflict fixture | Silent interpretation |
| What is novel? | Evidence-linked counterfactual review and traceable packet. | Live demo | Generic dashboard |
| What is copyable? | A UI is copyable; versioned rule provenance, fixtures, and review history are harder. | Data model | No moat |
| Is ISRO involved? | No endorsement is claimed; profile is public-source-derived. | ISRO page [4] | Misrepresentation |
| Is ISO 24113 implemented? | No. The MVP uses public scope evidence and selected verified clauses only. | ISO page [7] | Compliance overclaim |
| Can CelesTrak data power CA? | No. It is contextual only; do not use it for operational prediction. | CelesTrak [41] and Space-Track [18] | Safety failure |
| Does DISCOS provide ephemeris? | Its page says orbital or attitude ephemeris is not distributed via DISCOSweb. | DISCOS [42] | Data misunderstanding |
| Does ORDEM predict collisions? | No. It estimates debris-environment flux, not conjunction alerts. | NASA ORDEM [43] | Scientific confusion |
| Does RAG stop hallucination? | No; it constrains the explanation layer and requires source/citation checks. | Lewis/Gao [34] [35] | AI overclaim |
| Are confidence values trustworthy? | Only after calibration studies; MVP uses coarse confidence from evidence completeness, not a model probability. | Guo/Ovadia [36] [37] | Misleading UI |
| Are counterfactuals causal? | No; they are controlled “what changes if input changes?” explanations under explicit assumptions. | Wachter [31] | Misleading recommendation |
| What if the mission is outside the profiles? | Not evaluated and expert escalation. | Unsupported-profile test | Universal scope |
| Is the export a regulatory filing? | No; it is a cited internal pre-review packet. | Disclaimer | Legal confusion |
| What if AI is offline? | Core rules, score, counterfactual, and export remain available. | Offline demo | Dependency risk |
| What is the biggest limitation? | No operational CA, certification, or validated safety probability. | UI and packet | Hidden limitation |
| Who uses it next week? | University or small-startup systems engineer preparing review inputs. | User interview plan | No user |
| What measurable benefit exists? | Repeatable evidence review and visible gap prioritization; time savings are an open hypothesis. | Baseline | Unsupported ROI |
| Why continue after Hackyard? | Add authorized document connectors, profiles, expert sign-off, and policy-version monitoring. | Roadmap | No Potential |

## 12. Final MVP recommendation

### Best product framing

**OrbitReady is a pre-review evidence-readiness copilot for small spacecraft teams.**

### Best 24-hour scope

- React/Next.js interface.
- Small FastAPI or local backend.
- JSON/YAML policy library.
- 6–10 deterministic rules across three profiles.
- Complete, incomplete, conflict, stale, and API-failure fixtures.
- MSRI band plus confidence.
- One counterfactual control.
- Markdown/HTML packet export.
- Optional one-document extraction example.

### Must-build features

1. Provenance-aware intake.
2. Profile selection with scope/disclaimer.
3. Deterministic statuses.
4. Missing evidence.
5. Counterfactual.
6. Cited packet.
7. Safe fallback.

### Must-remove features

- Live conjunction prediction.
- Maneuver advice.
- Universal compliance.
- Unlabeled TLE map.
- Deep model training.
- Production multi-tenancy.

### Recommended stack

React or Next.js; FastAPI or server routes; SQLite/JSON; Markdown/HTML export; optional grounded structured-output model; unit tests around rules and provenance.

### Safest data strategy

Use synthetic mission fixtures and public official policy sources. If an orbital record is shown, cache it, include source/epoch/age, and label it educational. Do not upload confidential mission files in the demo.

### Strongest innovation

The live, source-linked counterfactual: the system shows exactly which evidence and design parameter changed the readiness result.

### Biggest risk

Judges may mistake the UI for a compliance certificate. Repeat the boundary in the UI, demo script, packet, and answer to every safety question.

### What judges will remember

A missing disposal proof is not silently scored as zero or pass. OrbitReady identifies the gap, shows the exact source-linked reason, lets the user change the design or add evidence, recomputes the result, and exports the trace.

## 13. Bibliography

### Event and official policy / standards sources

[1]: https://hackyard.org/build2026 "Hackyard Build 2026 official overview — Hackyard, 2026; accessed 2026-10-17"

[2]: https://hackyard.org/build2026/guide "Project & Participant Guide — Hackyard, updated 2026-09-22; accessed 2026-10-17"

[3]: https://orbitaldebris.jsc.nasa.gov/mitigation/debris-assessment-software.html "Debris Assessment Software — NASA Orbital Debris Program Office, updated 2026-04-10; accessed 2026-10-17"

[4]: https://www.isro.gov.in/Debris_Free_Space_Missions.html "India’s Intent on Debris-Free Space Missions — ISRO, 2024-04-19; accessed 2026-10-17"

[5]: https://www.unoosa.org/pdf/publications/st_space_49E.pdf "Space Debris Mitigation Guidelines of the UN COPUOS — UNOOSA; accessed 2026-10-17"

[6]: https://www.iadc-home.org/documents_public/file_down/id/5836 "IADC Space Debris Mitigation Guidelines — IADC, official document; accessed 2026-10-17"

[7]: https://www.iso.org/standard/83494.html "Space debris mitigation requirements — ISO 24113:2023, ISO scope page; accessed 2026-10-17"

[8]: https://technology.esa.int/upload/media/ESA-Space-Debris-Mitigation-Requirements-ESSB-ST-U-007-Issue1.pdf "ESA Space Debris Mitigation Requirements — ESA, 2023; accessed 2026-10-17"

[9]: https://www.unoosa.org/documents/pdf/spacelaw/sd/Space_Debris_Compendium_COPUOS_2_May_2025.pdf "Space Debris Compendium — UNOOSA/COPUOS, 2025; accessed 2026-10-17"

[22]: https://www.nasa.gov/reference/nasa-procedural-requirements-npr-8715-6/ "NASA Procedural Requirements for Limiting Orbital Debris — NASA, official reference; accessed 2026-10-17"

[23]: https://www.faa.gov/space/licenses/safer "FAA commercial space safety and orbital-debris resources — FAA, accessed 2026-10-17"

[44]: https://www.fcc.gov/document/fcc-adopts-5-year-rule-deorbiting-satellites "FCC orbital-debris five-year rule announcement — FCC; accessed 2026-10-17"

### Data and tool documentation

[18]: https://www.space-track.org/documentation "Space-Track documentation — U.S. Space Force/18 SDS, accessed 2026-10-17"

[19]: https://celestrak.org/NORAD/elements/ "CelesTrak NORAD GP element sets — CelesTrak, accessed 2026-10-17"

[41]: https://celestrak.org/NORAD/documentation/gp-data-formats.php "CelesTrak GP Data Formats — CelesTrak, updated 2026-03-26; accessed 2026-10-17"

[42]: https://discosweb.esoc.esa.int/ "DISCOSweb — ESA Space Debris Office, accessed 2026-10-17"

[45]: https://discosweb.esoc.esa.int/apidocs "DISCOSweb API Documentation — ESA, accessed 2026-10-17"

[43]: https://orbitaldebris.jsc.nasa.gov/modeling/ordem.html "ORDEM 3.2: Orbital Debris Engineering Model — NASA, accessed 2026-10-17"

[46]: https://software.nasa.gov/software/MSC-26690-1 "NASA Software Catalog: DAS 3.2.7 — NASA, accessed 2026-10-17"

[47]: https://software.nasa.gov/software/MSC-25457-1 "NASA Software Catalog: ORDEM 3.2 — NASA, accessed 2026-10-17"

[48]: https://sdup.esoc.esa.int/ "ESA Space Debris User Portal — ESA, accessed 2026-10-17"

[49]: https://www.ucs.org/resources/satellite-database "UCS Satellite Database — Union of Concerned Scientists, accessed 2026-10-17; secondary/non-operational reference"

[50]: https://www.space-track.org/documentation#/gp "Space-Track GP/OMM product documentation — U.S. Space Force, accessed 2026-10-17"

### Science and mission-analysis literature

[24]: https://doi.org/10.1029/JA083iA06p02637 "Collision Frequency of Artificial Satellites: The Creation of a Debris Belt — Kessler & Cour-Palais, 1978, Journal of Geophysical Research"

[25]: https://doi.org/10.1016/0094-5765(81)90111-7 "Collisional cascading: The limits of population growth in low earth orbit — Kessler, 1981, Advances in Space Research"

[26]: https://doi.org/10.1126/science.1123785 "Risks in space from orbiting debris — Liou & Johnson, 2006, Science"

[27]: https://orbitaldebris.jsc.nasa.gov/library/ "NASA Orbital Debris Program Office technical library — NASA; gateway, use exact document pages for claims"

[28]: https://conference.sdo.esoc.esa.int/proceedings/sdc6/paper/199/ "Stability of the Future LEO Environment — an IADC comparison study — ESA Space Debris Conference"

[29]: https://ntrs.nasa.gov/citations/20210019018 "Spacecraft Passivation — An Overview of Requirements and Practices — Hull & Schonberg, 2021, NASA NTRS"

[30]: https://www.sciencedirect.com/science/article/pii/S2468896720300586 "Meeting passivation requirements for spacecraft pressure vessels and fuel tanks — technical literature record"

[51]: https://ntrs.nasa.gov/citations/20220004345 "ORDEM 3.1 Model Process — NASA NTRS"

[52]: https://ntrs.nasa.gov/citations/20220002309 "ORDEM 3.1 Model Verification and Validation — NASA NTRS"

[53]: https://www.sciencedirect.com/science/article/abs/pii/S0094576515001241 "ORDEM 3.0 and MASTER-2009 modeled debris population comparison — Krisko et al., 2015, Acta Astronautica"

[54]: https://www.sciencedirect.com/science/article/abs/pii/S2468896720300847 "Upgrade of DRAMA — ESA’s space debris mitigation analysis tool — Braun et al., 2020, Acta Astronautica"

[55]: https://conference.sdo.esoc.esa.int/proceedings/sdc9/paper/306/ "Implications of Space Debris Mitigation… — ESA Space Debris Conference paper"

### AI, explainability, provenance, and human-review literature

[31]: https://jolt.law.harvard.edu/assets/articlePDFs/v31/Counterfactual-Explanations-without-Opening-the-Black-Box-Sandra-Wachter-et-al.pdf "Counterfactual Explanations without Opening the Black Box — Wachter, Mittelstadt & Russell, 2018"

[32]: https://doi.org/10.1145/2939672.2939778 "Why Should I Trust You? — Ribeiro, Singh & Guestrin, 2016, KDD"

[33]: https://papers.nips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions "A Unified Approach to Interpreting Model Predictions — Lundberg & Lee, 2017, NeurIPS"

[34]: https://arxiv.org/abs/2005.11401 "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks — Lewis et al., 2020"

[35]: https://arxiv.org/abs/2312.10997 "Retrieval-Augmented Generation for Large Language Models: A Survey — Gao et al., 2023"

[36]: https://proceedings.mlr.press/v70/guo17a.html "On Calibration of Modern Neural Networks — Guo et al., 2017, ICML"

[37]: https://papers.nips.cc/paper/9547-can-you-trust-your-models-uncertainty "Can You Trust Your Model’s Uncertainty? — Ovadia et al., 2019, NeurIPS"

[38]: https://doi.org/10.1007/3-540-44503-X_20 "Why and Where: A Characterization of Data Provenance — Buneman, Khanna & Tan, 2001"

[39]: https://doi.org/10.1145/3290605.3300233 "Guidelines for Human-AI Interaction — Amershi et al., 2019, CHI"

[40]: https://doi.org/10.1109/3477.844354 "A Model for Types and Levels of Human Interaction with Automation — Parasuraman, Sheridan & Wickens, 2000"

[56]: https://doi.org/10.1016/j.artint.2018.07.007 "Explanation in Artificial Intelligence: Insights from the Social Sciences — Miller, 2019"

[57]: https://doi.org/10.1145/3236009 "A Survey of Methods for Explaining Black Box Models — Guidotti et al., 2018"

[58]: https://aclanthology.org/2024.acl-long.463/ "DocLLM: A Layout-Aware Generative Language Model for Multimodal Document Understanding — Wang et al., 2024"

[59]: https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems "Hidden Technical Debt in Machine Learning Systems — Sculley et al., 2015"

### Competitor/product references

[20]: https://leolabs.space/ "LeoLabs orbital intelligence platform — competitor/product reference, accessed 2026-10-17"

[21]: https://www.slingshot.space/news/beacon-first-collision-avoidance-collaboration-platform "Slingshot Beacon collision-avoidance collaboration platform — competitor/product reference, accessed 2026-10-17"

[60]: https://www.esa.int/Space_Safety/Space_Debris/ESA_makes_space_debris_software_available_online "ESA makes space debris software available online — product/tool reference, accessed 2026-10-17"

[61]: https://www.esa.int/Space_Safety/Space_Debris/Analysis_and_prediction "ESA Space Debris analysis and prediction — agency capability reference, accessed 2026-10-17"

[62]: https://www.poliastro.space/ "poliastro — open-source astrodynamics software reference, accessed 2026-10-17"

[63]: https://github.com/poliastro/poliastro "poliastro source repository — open-source tool reference, accessed 2026-10-17"

[64]: https://www.orekit.org/ "Orekit — open-source space dynamics library, accessed 2026-10-17"

[65]: https://www.nasa.gov/organizations/otps/orbital-debris/ "NASA Orbital Debris Program Office — agency reference page, accessed 2026-10-17"

[66]: https://www.slingshot.space/product-beacon "Slingshot Beacon product page — competitor/product reference, accessed 2026-10-17"

[67]: https://leolabs.space/space-traffic-management/ "LeoLabs space traffic management — competitor/product reference, accessed 2026-10-17"

### Source-quality note

This v2 dossier labels official guidance, technical papers, data documentation, gateway pages, and competitor pages separately. A source appearing in the bibliography does not make every claim in the dossier confirmed. The highest-risk areas remain jurisdictional applicability, mission-specific reliability, operational data quality, and scientific validity of any composite index.
