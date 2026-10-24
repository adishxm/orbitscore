# OrbitReady — Deep Research Dossier for Hackyard Build 2026

**Research date:** 17 October 2026  
**Decision status:** Build a narrow, evidence-first pre-review product; do not build operational conjunction assessment.

## 1. Executive verdict

### Is OrbitReady worth building?

**Yes, with a narrower claim.** The strongest defensible product is an **evidence-readiness copilot for early spacecraft design review**. It should transform structured mission inputs and supporting documents into a traceable review of debris-mitigation evidence, not claim to determine safety or regulatory compliance.

The idea fits Hackyard’s official rubric unusually well. Hackyard rewards a working build most heavily at 40%, then problem, ingenuity, and potential at 20% each. Its guide explicitly asks builders to start with one person, one problem, and one useful flow; to test realistic and awkward inputs; and to use synthetic, public, or authorized data honestly. [1] [2]

### Strongest framing

> **OrbitReady helps a small spacecraft team prepare a defensible debris-mitigation review before expert or regulatory assessment.**

The flagship interaction is an **evidence-linked counterfactual**: a user changes one design choice, such as disposal lifetime or maneuverability evidence, and the system recomputes the deterministic findings, confidence, missing proof, and cited next action.

### Weakest part

The weak point is the **MSRI score** if presented as a scientific risk measure. A weighted readiness score without a validated empirical target can create false precision. Keep it coarse, transparent, and subordinate to the evidence findings. Display confidence and unknowns separately.

### Best hackathon MVP

1. Mission intake with provenance.
2. Three versioned profiles: India DFSM-inspired, NASA-inspired, and neutral internal review.
3. Deterministic rule states: Pass, Warning, Needs evidence, Not evaluated.
4. Missing-evidence checklist.
5. One counterfactual comparison.
6. Cited Markdown/HTML review packet.
7. Seeded awkward case that refuses to overclaim.

### Remove from the 24-hour build

- Live collision prediction.
- Operational maneuver advice.
- Global orbital intelligence.
- Universal legal compliance.
- Insurance pricing.
- Large model training.
- Vector search unless document retrieval is already working.
- Claims of NASA, ISRO, IN-SPACe, regulator, or Hackyard endorsement.

### Safety boundary

OrbitReady is **not** an official certification tool, regulator, collision-prediction system, operator-facing conjunction-alert tool, or replacement for NASA Debris Assessment Software. Public orbital data may be used only for educational, contextual, historical, or non-operational purposes. Synthetic data must be visibly labeled.

## 2. Research-backed problem analysis

### The real problem

Small spacecraft teams need to make end-of-life and debris-mitigation decisions early, but the proof needed for a serious review is distributed across mission documents, engineering assumptions, supplier material, spreadsheets, and jurisdiction-specific guidance. The team may know its intended orbit and disposal plan while lacking a single answer to four review questions:

1. Which requirement or policy clause does this input address?
2. What evidence proves the claim?
3. Is the evidence current, authoritative, and owned by someone?
4. Which design change would remove the most important gap?

### The problem behind the problem

The bottleneck is not merely a lack of analysis software. It is a **traceability failure** between design decisions and evidence. A late discovery that disposal capability is unproven can trigger rework, new analysis, or a redesign. The exact time and cost are mission-specific and should not be invented in the MVP.

### Why now

The debris environment is shaped by accumulated objects, fragmentation events, operational releases, and the growth of satellite activity. Scientific work on the long-term LEO environment shows that mitigation affects future environment stability, while active removal and post-mission behavior are distinct policy and engineering questions. [13] [14] [15]

Policy expectations are also becoming more explicit. NASA maintains a formal Debris Assessment Software workflow; the UN COPUOS guidelines and IADC guidelines provide international mitigation principles; ISO 24113 defines primary space-debris mitigation requirements for unmanned systems; ESA publishes its own requirements; and ISRO has stated a 2030 Debris-Free Space Missions intent for Indian governmental and non-governmental actors. [3] [4] [5] [6] [7] [8]

### Why judges should care

The project makes a difficult workflow visible in a few minutes. It does not ask judges to believe an invented scientific score. It shows:

- an evidence value entering the system;
- a rule and source clause behind a finding;
- a missing input becoming a safe non-pass;
- a design change altering the review;
- a traceable packet leaving the system.

That is a stronger Build and Ingenuity demonstration than a generic orbital map.

## 3. Domain science and engineering context

### Debris growth and collision cascades

Kessler and Cour-Palais described the possibility that collisions among objects in low Earth orbit could create fragments faster than natural removal processes clear them, producing a self-reinforcing debris environment. [10] Later environment studies showed that mitigation and removal choices affect long-term population behavior and stability rather than only one mission’s immediate risk. [11] [12] [13]

OrbitReady does not need to model a debris cascade. It needs to represent the **mission-level controls** that reduce contribution to that environment: limiting released objects, preventing accidental breakups, designing post-mission disposal, preserving trackability and identifiability, and documenting maneuver or coordination capability.

### Disposal, deorbiting, and passivation

Post-mission disposal can include controlled re-entry, lowering an orbit to reduce remaining lifetime, or moving an object to a disposal orbit depending on the mission and applicable standard. Passivation removes stored energy sources such as residual propellant, pressurant, or battery energy that could cause later fragmentation. The exact acceptance threshold is jurisdiction- and profile-specific; OrbitReady should store the clause and scope rather than hard-code a universal rule.

NASA’s public DAS page says DAS assesses debris generation, spacecraft vulnerability, postmission lifetime, and entry safety, while noting that inherent design-reliability facets are outside DAS. The current page identifies DAS 3.2.7 and says a Software Usage Agreement is required to acquire it. [3]

ISRO’s DFSM statement includes a public target of post-mission disposal success probability above 99% and less than five years of remaining orbital life for rocket bodies and spacecraft at end of operational life, alongside trackability, identifiability, maneuverability, coordination, and data sharing. [4] These statements are suitable for a transparent India-inspired profile, not a universal regulatory rule.

### Trackability, identifiability, maneuverability, breakup prevention

These concepts are related but not interchangeable:

- **Trackability:** whether an object can be observed and its state maintained in a catalog or operational process.
- **Identifiability:** whether the object can be associated with a known mission, operator, or physical identity.
- **Maneuverability:** whether the spacecraft has capability and authority to change its trajectory; capability does not prove an operational maneuver plan.
- **Breakup prevention:** design, passivation, reliability, and operational controls that reduce accidental or intentional fragmentation.

A readiness review can check whether evidence exists for each concept. It cannot infer capability from a vague sentence or claim actual safety from a checkbox.

### What OrbitReady can automate

- Field validation and normalization.
- Citation and provenance capture.
- Rule threshold comparison.
- Evidence presence and freshness checks.
- Reproducible scoring.
- Counterfactual comparison.
- Packet generation.
- Unsupported-claim detection against a stored rule library.

### What must remain expert-led

- Final engineering interpretation.
- Authorization or regulatory submission.
- Operational conjunction assessment.
- Maneuver decisions.
- Acceptance of a mission-specific reliability argument.
- Scientific validation of a new risk model.
- Resolution of conflicting authoritative documents.

## 4. Policy and regulation matrix

| Source | Organization / scope | Exact relevance | Safe automation | Human/expert boundary | MVP limitation |
|---|---|---|---|---|---|
| NASA Technical Standard 8719.14 context and DAS | NASA / NASA programs | Debris generation, vulnerability, postmission lifetime, entry safety | Map user inputs to stored NASA-inspired checks; show missing evidence | Formal assessment, reliability interpretation, agency acceptance | Not a DAS implementation or certification |
| NASA Debris Assessment Software | NASA / software utility | Performs formal debris assessments; current public page identifies DAS 3.2.7 | Link source, capture whether team has an assessment or input package | Use of DAS and acceptance of results | Software access requires agreement; not reproduced in MVP |
| UN COPUOS Space Debris Mitigation Guidelines | UN / international guidance | Mission-planning and debris-mitigation principles | Store clauses and source metadata | Jurisdictional adoption and legal interpretation | Guidelines are not one universal filing format |
| IADC Space Debris Mitigation Guidelines | Inter-Agency / technical guidance | Technical mitigation practices for mission planning and operations | Versioned rule fixtures, source-linked interpretation | Tailoring and mission-specific engineering judgment | Use the current official revision; do not silently use an old PDF |
| ISO 24113:2023 | ISO / international standard | Primary space-debris mitigation requirements for unmanned systems | Store clause references if licensed and available; expose scope | Conformance assessment and licensed use | Full standard text may not be freely accessible |
| ESA Space Debris Mitigation Requirements | ESA / ESA missions and procurements | Agency-specific requirements | Build an ESA-inspired profile only if the source is available and scoped | ESA acceptance and contract applicability | Do not imply universal applicability |
| ISRO DFSM statement | India / public strategic intent | 2030 debris-free intent; disposal, trackability, identifiability, maneuverability | India DFSM-inspired profile with source vs team interpretation labels | Indian mission authorization and expert interpretation | It is an initiative statement, not a universal certificate template |
| India Space Policy 2023 | India / national policy | Broader space-sector policy context | Use as context and source metadata | Legal/regulatory interpretation | Do not claim the MVP implements all Indian policy |
| FCC orbital-debris rules | United States / licensing for covered operators | Public regulatory example for post-mission disposal | Add only as a separate jurisdiction profile after exact rule verification | Filing and regulator decision | Not part of MVP unless directly sourced and scoped |
| UN COPUOS Long-Term Sustainability Guidelines | UN / long-term sustainability | Broader behavior, coordination, information sharing | Contextual checklist | State responsibility and implementation | Not a substitute for mission-specific debris analysis |

**Correct wording:** say “NASA-inspired profile,” “India DFSM-inspired profile,” or “publicly derived interpretation.” Do not say “NASA compliant,” “ISRO aligned,” “regulator approved,” or “official certificate.”

## 5. Paper-by-paper literature review

The table focuses on literature that directly supports OrbitReady’s scientific boundary, counterfactual design, explainability, uncertainty, grounded AI, provenance, and human-in-the-loop approach. Papers are not evidence that OrbitReady itself is validated.

| Citation and year | Venue / URL | Why it matters | OrbitReady support | Method / finding | Limitation | Priority |
|---|---|---|---|---|---|---|
| Kessler & Cour-Palais (1978), “Collision Frequency of Artificial Satellites: The Creation of a Debris Belt” | *Journal of Geophysical Research*, DOI: https://doi.org/10.1029/JA083iA06p02637 | Foundational collision-cascade framing | Justifies debris-mitigation problem context | Models collision frequency and debris belt creation | Historical model; not a mission-review rule engine | Must-cite |
| Kessler (1981), “Collisional cascading: The limits of population growth in low earth orbit” | *Advances in Space Research*, DOI: https://doi.org/10.1016/0094-5765(81)90111-7 | Explains runaway accumulation concept | Supports why prevention matters | Analyzes population growth limits and collision cascade | Scenario assumptions are not direct operational forecasts | Must-cite |
| Liou & Johnson (2006), “Risks in space from orbiting debris” | *Science*, DOI: https://doi.org/10.1126/science.1123785 | Quantifies the future debris-environment concern | Supports long-term sustainability framing | Uses environment modeling to discuss collision risk | Not a compliance workflow or small-operator study | Must-cite |
| Liou (2011), “An update on the effectiveness of active debris removal” | *NASA / orbital-debris literature* | Separates mitigation from removal | Prevents OrbitReady from implying end-of-life checks solve the whole environment | Studies removal effectiveness under modeled scenarios | Active removal is outside MVP | Should-cite |
| Liou & Johnson (2009), “A LEO satellite post-mission disposal study for debris mitigation” | NASA technical literature / DOI search record | Connects disposal decisions to environment behavior | Supports counterfactual disposal comparison | Simulates post-mission disposal effects | Results depend on model and scenario | Should-cite |
| Krisko et al. (2015), “ORDEM 3.0 and MASTER-2009 modeled debris population comparison” | *Acta Astronautica*, DOI record: https://www.sciencedirect.com/science/article/abs/pii/S0094576515001241 | Shows that models differ in population representation | Supports cautious data/model provenance | Compares NASA and ESA environment models | Model comparison is not user evidence | Should-cite |
| Flohrer et al. (2021/2022), ESA Space Environment Report series | ESA Space Debris Office, https://www.esa.int/Space_Safety/Space_Debris/Space_environment_report | Provides current environment context | Supports data audit and “why now” | Environment monitoring and interpretation | Report values change by edition | Must-cite |
| Hull & Schonberg (2021), “Spacecraft Passivation – An Overview of Requirements…” | NASA NTRS, https://ntrs.nasa.gov/citations/20210019018 | Clarifies stored-energy breakup prevention | Supports passivation evidence field | Reviews passivation philosophies and principles | Review draft is not a universal standard | Should-cite |
| Braun et al. (2020), “Upgrade of DRAMA—ESA’s space debris mitigation analysis tool” | *Acta Astronautica*, search record: https://www.sciencedirect.com/science/article/abs/pii/S2468896720300847 | Shows agency-grade mitigation tools already exist | Supports positioning OrbitReady as earlier workflow layer | Describes DRAMA tool suite and upgrades | Commercial/agency tooling differs from MVP | Should-cite |
| Wachter, Mittelstadt & Russell (2018), “Counterfactual Explanations without Opening the Black Box” | *Harvard Journal of Law & Technology*, https://jolt.law.harvard.edu/assets/articlePDFs/v31/Counterfactual-Explanations-without-Opening-the-Black-Box-Sandra-Wachter-et-al.pdf | Provides a foundation for “what would need to change?” explanations | Directly supports the flagship counterfactual interaction | Frames explanations as actionable changes to inputs | Counterfactuals may be infeasible, non-unique, or non-causal | Must-cite |
| Ribeiro, Singh & Guestrin (2016), “Why Should I Trust You?” | KDD, DOI: https://doi.org/10.1145/2939672.2939778 | Classic local explanation work | Supports explaining individual findings | LIME approximates local model behavior | Explanations can be unstable; OrbitReady should prefer deterministic rules | Should-cite |
| Lundberg & Lee (2017), “A Unified Approach to Interpreting Model Predictions” | NeurIPS, https://papers.nips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions | Feature-attribution reference | Helps explain why generic attribution is not enough for rules | SHAP unifies additive feature attribution | Attribution is not evidence provenance or causality | Optional |
| Miller (2019), “Explanation in Artificial Intelligence: Insights from the Social Sciences” | *Artificial Intelligence*, DOI: https://doi.org/10.1016/j.artint.2018.07.007 | Grounds explanations in human concepts and contrastive questions | Supports plain-language “why this result?” and “what change?” | Reviews social-science concepts of explanation | Does not prescribe space-domain validation | Must-cite |
| Guidotti et al. (2018), “A Survey of Methods for Explaining Black Box Models” | *ACM Computing Surveys*, DOI: https://doi.org/10.1145/3236009 | Maps explainability methods and limits | Supports choosing rule-linked explanations over opaque model output | Surveys model-agnostic XAI | Survey does not validate any specific method | Should-cite |
| Guo et al. (2017), “On Calibration of Modern Neural Networks” | ICML / PMLR, https://proceedings.mlr.press/v70/guo17a.html | Shows confidence can be miscalibrated | Supports separate confidence display and conservative language | Studies calibration and temperature scaling | Model-calibration paper, not readiness-index validation | Must-cite |
| Ovadia et al. (2019), “Can You Trust Your Model’s Uncertainty?” | NeurIPS, https://papers.nips.cc/paper/9547-can-you-trust-your-models-uncertainty | Shows uncertainty changes under distribution shift | Supports stale-data, missing-data, and confidence tests | Evaluates uncertainty under dataset shift | Deep-model setting differs from deterministic rules | Should-cite |
| Lewis et al. (2020), “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks” | NeurIPS / arXiv: https://arxiv.org/abs/2005.11401 | Foundational grounded-generation pattern | Supports retrieving stored policy clauses before explanation | Combines parametric generation with retrieved evidence | Retrieval does not guarantee truth or citation correctness | Must-cite |
| Gao et al. (2023), “Retrieval-Augmented Generation for Large Language Models: A Survey” | arXiv: https://arxiv.org/abs/2312.10997 | Summarizes RAG architectures and failure modes | Supports a constrained, auditable explanation layer | Reviews retrieval, generation, and evaluation | Survey is broad and changes quickly | Should-cite |
| Wang et al. (2024), “DocLLM: A Layout-Aware Generative Language Model for Multimodal Document Understanding” | ACL, https://aclanthology.org/2024.acl-long.463/ | Relevant to extracting facts from engineering PDFs | Supports document extraction as optional AI layer | Uses layout-aware representations | Extraction errors require validation and human review | Must-cite |
| Buneman, Khanna & Tan (2001), “Why and Where: A Characterization of Data Provenance” | ICDT, DOI: https://doi.org/10.1007/3-540-44503-X_20 | Foundational provenance concept | Supports storing where each value came from | Formalizes why/where provenance | Database provenance does not solve policy interpretation | Must-cite |
| Amershi et al. (2019), “Guidelines for Human-AI Interaction” | CHI, DOI: https://doi.org/10.1145/3290605.3300233 | Practical human-AI interaction guidance | Supports visible uncertainty, correction, and escalation | Empirical guidelines for human-AI systems | General guidelines; domain-specific validation remains necessary | Must-cite |
| Parasuraman, Sheridan & Wickens (2000), “A Model for Types and Levels of Human Interaction with Automation” | *IEEE Transactions on Systems, Man, and Cybernetics*, DOI: https://doi.org/10.1109/3477.844354 | Clarifies automation allocation | Supports keeping acceptance and operational decisions human-led | Models levels of automation and human roles | Older framework; still conceptual | Should-cite |
| Sculley et al. (2015), “Hidden Technical Debt in Machine Learning Systems” | NeurIPS, https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems | Warns against hidden dependencies and feedback loops | Supports a simple monolith and explicit fallback | Catalogues ML-system maintenance risks | Not specific to space or hackathons | Optional |

### Literature synthesis

The literature supports five design conclusions:

1. **Debris science justifies mitigation but does not provide a universal readiness score.**
2. **Counterfactuals are useful as actionable explanations, but they must respect feasibility and cannot be treated as causal proof.**
3. **Confidence requires calibration and distribution-shift awareness; deterministic evidence states are safer than opaque probabilities in the MVP.**
4. **RAG and document models can help organize evidence, but retrieval does not make a generated claim true.**
5. **Provenance and human interaction are first-class system features, not report decoration.**

## 6. Data source audit

| Source | Owner / access | Fields or content | Freshness | Quality / restriction | Demo suitability | Operational suitability | Fallback |
|---|---|---|---|---|---|---|---|
| Mission profile supplied by team | Private / user-provided | Orbit, altitude, mass, duration, propulsion, disposal, evidence links | User-controlled | May be incomplete, contradictory, or confidential | High with synthetic fixture | Only if authoritative and controlled | Seeded mission with assumption labels |
| NASA DAS inputs and outputs | NASA / request plus Software Usage Agreement | Debris assessment inputs and outputs | Versioned; current page lists DAS 3.2.7 | Specialized; Windows; reliability facets outside DAS | Low for a 24-hour integration; high as reference | Potentially, subject to proper use and expertise | Cite DAS and simulate pre-review only |
| NASA ORDEM | NASA / model and software access | Debris flux by size/year and mode | Versioned model | Model assumptions; not a conjunction feed | Medium for educational context | Not a substitute for operational tracking | Static chart with model/version label |
| ESA DISCOS / DISCOSweb | ESA / account and terms | Launch, object, orbit history, physical properties, mission descriptions | Continuously maintained; access varies | Account and terms; catalog completeness and identity issues | Medium if access is available | Not by itself an operational conjunction service | Cached sample with access date |
| ESA DRAMA | ESA / software portal | Mitigation analysis modules | Versioned | Tool scope and agency context | Low–medium | Expert tool, not a generic score | Link and explain complementary scope |
| Space-Track GP/TLE/OMM | U.S. government / approved account and terms | Mean orbital elements and catalog data | Updated by service; age varies | Public TLE warning: not for operational conjunction prediction; terms restrict use | Medium for historical/educational visualization | Not from public TLE alone | Disable operational features; use cached labeled data |
| CelesTrak GP data | Public web/API-style downloads | TLE/OMM and catalog sets | CelesTrak says it checks for new data approximately every two hours | Derived/public GP data; format and catalog limitations | High for educational visualization | No for safety-grade CA | Historical fixture and age banner |
| ISRO DFSM statement | Public official web page | Policy intent and described targets | Published 19 Apr 2024; page updated later | Initiative statement, not a complete rulebook | High for India profile | Not a complete certification basis | Store source with interpretation labels |
| NASA/ESA/UN/IADC/ISO documents | Public or licensed, depending source | Clauses and technical guidance | Versioned by document | Scope and licensing differ | High for policy library examples | Only with correct jurisdiction and expertise | Neutral internal profile |
| Uploaded PDF or DOCX | Private / user upload | Text, tables, diagrams, evidence excerpts | As uploaded | OCR, layout, and extraction errors; privacy risk | High for one seeded sample | Only after secure handling and human review | Structured intake and manual provenance |
| Synthetic mission fixture | Internal / authored | All fields for happy and awkward cases | Fixed fixture version | Not real mission evidence | Essential | Never operational | Always label synthetic |

### Recommended data strategy

Use **synthetic mission data plus public policy sources** for the main demo. Use CelesTrak or Space-Track only for an optional educational “data freshness” panel. Never make the core review depend on a live orbital API. Store `source_type`, `source_url`, `source_date`, `retrieved_at`, `age`, `license_status`, and `confidence_note` for every external value.

## 7. Existing solutions and alternatives

| Solution | Organization | Type / users | Strengths | Weaknesses or gap | OrbitReady difference |
|---|---|---|---|---|---|
| NASA DAS | NASA | Debris assessment; NASA programs and engineers | Formal, domain-specific, established workflow | Specialized; not an evidence-readiness workspace; access agreement | Prepares evidence and explains gaps before expert use |
| NASA ORDEM | NASA | Engineering debris-environment model | Established model for debris flux | Model, not a mission evidence workflow or conjunction service | Uses policy/evidence layer, not new environment modeling |
| ESA DRAMA | ESA | Mitigation analysis; mission designers | Multi-module mitigation analysis | Agency tool, not small-team evidence collaboration | Human-readable pre-review and provenance |
| ESA DISCOS | ESA | Object and launch database; analysts | Rich object/history reference | Access and catalog interpretation; not a readiness copilot | Mission evidence packet around user’s own inputs |
| Space-Track / 18 SDS services | U.S. government | Catalog and operator-facing CA services | Authoritative operational services and operator process | Not a design-review evidence organizer; access/terms apply | Explicitly outside CA; safe design-review layer |
| CelesTrak | Independent public data service | Public orbital elements and educational users | Accessible datasets and formats | Not authoritative operational CA; freshness/accuracy limitations | Optional contextual data only |
| LeoLabs | Commercial | Persistent orbital intelligence, SDA, STM, launch/operations | Sensors, catalog, analytics, alerts | Different scale, cost, and operational mission | Evidence readiness for small operators |
| Slingshot Beacon | Commercial | Collision-avoidance collaboration | Operator coordination, alerts, CDMs, ephemeris sharing | Operational collaboration rather than pre-review evidence | Design-to-evidence traceability before operations |
| Generic document/compliance software | Many vendors | Checklists and repositories | Storage, tasks, workflows | Does not understand debris-mitigation policy or counterfactual design | Domain-specific deterministic policy layer |

Commercial sources themselves describe an established operational market. LeoLabs describes persistent orbital intelligence, space-domain awareness, space-traffic management, launch and operations support, multi-mission radars, and AI-enabled alerts. [20] Slingshot describes Beacon as a collision-avoidance collaboration and communications platform with alerts, operator coordination, CDMs, and ephemeris sharing. [21] These sources strengthen—not weaken—the case for avoiding a generic orbital-intelligence dashboard.

## 8. Claim-to-source traceability matrix

| OrbitReady claim | Source | Status | Keep / change |
|---|---|---|---|
| Hackyard Build 2026 is a 24-hour in-person build at IIT Guwahati on 24–25 Oct 2026 | Official Hackyard pages [1] [2] | Confirmed | Keep |
| Hackyard weights Build 40%, Problem 20%, Ingenuity 20%, Potential 20% | Official Hackyard pages [1] [2] | Confirmed | Keep |
| The event guide prioritizes one useful flow and awkward tests | Official guide [2] | Confirmed | Keep |
| Orbital debris creates a long-term sustainability problem | Kessler, Liou, ESA reports [10]–[15] | Confirmed | Keep, without inventing current counts |
| Public TLEs should not be used for operational conjunction prediction | Space-Track documentation [18] | Confirmed | Keep prominently |
| NASA DAS assesses debris generation, vulnerability, postmission lifetime, and entry safety | NASA DAS page [3] | Confirmed | Keep |
| DAS covers every reliability facet | NASA page says the opposite | False / unsafe | Remove |
| ISRO intends DFSM by 2030 for Indian governmental and non-governmental actors | ISRO [4] | Confirmed | Keep |
| ISRO endorses OrbitReady | No source | Unknown / unsupported | Remove |
| India DFSM targets >99% PMD success and <5 years remaining orbital life for specified objects | ISRO [4] | Confirmed as statement | Keep only inside scoped India profile |
| One score can measure global mission safety | No source; scientifically unsupported | Unsupported | Remove |
| MSRI is a decision-support index | Product design choice | Assumption | Keep with disclaimer |
| Counterfactuals can show which input change alters a decision | Wachter et al. [22] | Confirmed as XAI concept | Keep, qualify feasibility and causality |
| Retrieved text guarantees a correct LLM explanation | RAG literature does not support guarantee | False / unsafe | Remove |
| Provenance makes a claim auditable | Buneman et al. [28] and governance literature | Inference supported by theory | Keep as design objective, not guarantee |
| Confidence from a model is automatically reliable | Calibration literature [25] [26] says no | False / unsafe | Remove |
| The MVP can be built in 24 hours | Hackathon scope judgment | Inference | Keep as recommendation, not fact |
| Public orbital data can provide educational context | Space-Track warning plus CelesTrak access [18] [19] | Inference with safety constraint | Keep with label and age |
| OrbitReady replaces NASA DAS | NASA DAS scope [3] | False | Remove |
| OrbitReady complements formal expert review | Product positioning based on sources | Inference | Keep |
| Commercial collision-avoidance platforms already exist | LeoLabs and Slingshot [20] [21] | Confirmed from primary product pages | Keep, avoid market-size claims |

## 9. Validation plan

### Baseline

Create a hand-checked spreadsheet or JSON fixture in which each input, evidence item, rule, expected state, and expected next action is known. The baseline is not “human experts already agree on the score.” The baseline is reproducibility of the stated rule interpretation.

### Test classes

| Test class | Example | Pass condition |
|---|---|---|
| Rule fixture | Complete mission with disposal evidence | Expected Pass/Warning states match fixture |
| Boundary | Exactly at configured disposal threshold | Boundary behavior is explicit and stable |
| Missing data | Remove disposal lifetime | Needs evidence or Not evaluated; never Pass |
| Unknown provenance | Enter value without source | Value is marked assumption or needs evidence |
| Conflicting documents | Two different mass or lifetime values | Conflict shown; no silent merge |
| Stale data | External value older than configured freshness | Age shown; confidence reduced or value blocked |
| API failure | Simulate timeout/HTTP error | Cached/synthetic path is labeled; core review continues |
| Counterfactual | Add disposal evidence or change lifetime | Only expected findings and score components change |
| Unsupported claim | LLM answer with no stored clause | Rejected, qualified, or marked unsupported |
| Citation integrity | Delete source URL | Packet cannot claim cited support |
| Report determinism | Re-run same input and rule version | Same states, score band, and citations |
| Human escalation | Critical gap | Packet contains explicit expert-review action |

### Success metrics

For the hackathon MVP, use measurable engineering metrics rather than invented mission-safety metrics:

- 100% of seeded rule fixtures match expected states.
- 100% of missing-critical-input fixtures produce non-pass states.
- 100% of findings expose an input reference and policy-clause reference.
- 100% of counterfactual tests reproduce the same before/after result.
- 0 unsupported claims appear in the exported packet from the seeded tests.
- Export completes for complete and incomplete cases.
- A judge can complete the happy path in under three minutes during rehearsal.

These are prototype acceptance metrics, not evidence that the MSRI is scientifically valid.

### Human evaluation

Have at least one domain-informed reviewer inspect:

- whether the policy interpretation is faithful;
- whether the wording overclaims;
- whether missing evidence is obvious;
- whether the counterfactual is technically plausible;
- whether the packet distinguishes source fact from team assumption.

## 10. Red-team and hostile judge analysis

| Question / concern | Strong answer | Evidence required | Weakness if unanswered |
|---|---|---|---|
| Why does this need AI? | AI helps extract and explain; deterministic rules decide. | Architecture and grounded prompt | Looks like chatbot decoration |
| Why not NASA DAS? | DAS performs specialized assessment; OrbitReady prepares the earlier evidence workflow. | NASA DAS scope [3] | Product appears redundant |
| Why not LeoLabs or Slingshot? | They focus on operational intelligence and coordination; OrbitReady focuses on pre-review evidence readiness. | Product pages [20] [21] | Differentiation collapses |
| Where is the real data? | The mission data is user-owned; the MVP uses labeled synthetic fixtures and public policy sources. | Data audit and labels | Judges suspect fabrication |
| Is the score scientifically valid? | No. It is a transparent prioritization index with visible assumptions. | Score formula and disclaimer | False precision |
| What happens when data is missing? | Needs evidence or Not evaluated, never Pass. | Missing-data test | Unsafe overconfidence |
| What happens when data is stale? | Show age, lower confidence, and block unsupported conclusions. | Freshness fixture | Hidden data risk |
| What part is novel? | Evidence-linked counterfactual review, not AI or a dashboard. | Live demo trace | Generic feature claim |
| What can a judge attack? | The weights, policy interpretations, and limited fixtures. We expose all three. | Rule library and limitations | Defensive credibility weakens |
| What cannot be defended? | Official certification, collision prediction, scientific safety probability, or regulator endorsement. | Explicit exclusions | Overclaiming |
| Does ISRO endorse it? | No. It is a public-source-derived India profile. | ISRO source wording [4] | Misrepresentation |
| Are public TLEs sufficient? | No for operational CA; Space-Track explicitly warns against it. | Space-Track warning [18] | Safety boundary failure |
| Why include an orbital map at all? | Only as optional educational context; the core value is evidence review. | UI label and fallback | Scope creep |
| Why not use a large model? | A large model does not improve deterministic rule correctness and adds failure modes. | Architecture and tests | Technology-first design |
| How is hallucination handled? | The model receives stored clauses and excerpts; unsupported outputs are rejected or marked. | Prompt and unsupported-claim test | AI risk remains invisible |
| How do you validate policy mapping? | Versioned clauses, source URLs, hand-checked fixtures, and human review. | Policy fixtures | No auditability |
| How are weights justified? | They are prototype assumptions; the product prioritizes evidence work, not probability. | Formula and label | Judges may see arbitrary scoring |
| What if two standards disagree? | Show both scoped rules and escalate; never silently merge. | Conflict test | Hidden jurisdiction risk |
| Who uses it next week? | A university or small startup engineer preparing internal review inputs. | User workflow | No concrete buyer/user |
| What measurable benefit exists? | Repeatable evidence packet and faster identification of missing proof; time savings require study. | Baseline comparison | Unsupported productivity claim |
| Is a generated report a filing? | No, it is a cited internal review packet. | Disclaimer | Legal confusion |
| Can a reviewer trust citations? | Every finding stores URL, title, version/date, excerpt or clause, and input reference. | Citation integrity test | Citation theater |
| What if the LLM is unavailable? | The deterministic flow and export still work. | Offline/fallback demo | Core depends on AI |
| What if a mission is outside the profiles? | Return Not evaluated and recommend expert escalation. | Unsupported-profile test | Universal-compliance overclaim |
| What is the moat? | Versioned rules, evidence provenance, fixtures, and authorized anonymized review history. | Post-hackathon plan | Easy-to-copy dashboard |
| Why should this continue after the event? | The layer between mission design and formal review is reusable across profiles and organizations. | User interviews and pilot plan | No Potential |
| What is the biggest limitation? | No operational CA, no certification, no scientific validity for the score. | UI disclaimer | If hidden, trust falls |
| What is the safest dataset strategy? | User-owned mission facts, public official policy documents, and labeled synthetic fixtures. | Data audit | Privacy/license concerns |
| Could the product cause a bad mission decision? | It is designed to refuse unsupported pass results and route critical gaps to experts. | Safety tests | Residual risk remains |

## 11. Final MVP recommendation

### Product framing

**OrbitReady: evidence-first debris-mitigation readiness review for small spacecraft teams.**

### 24-hour build

- React/Next.js or simple React frontend.
- FastAPI or local server backend.
- SQLite or JSON rules library.
- Three profiles with 6–10 total rules.
- Seeded complete and incomplete missions.
- Deterministic evaluator.
- MSRI band plus confidence.
- Counterfactual control.
- Markdown packet export.
- Optional single grounded extraction demo.

### Features to build

1. Intake with provenance.
2. Profile selection.
3. Deterministic findings.
4. Missing evidence.
5. Counterfactual.
6. Export.
7. Safe fallback and visible disclaimer.

### Features to remove

- Live satellite tracking as a dependency.
- Collision probability.
- Maneuver recommendation.
- Universal regulation.
- Deep ML.
- Multi-tenant production platform.

### Safest dataset strategy

Use synthetic mission profiles that resemble realistic inputs but are visibly labeled. Use official public policy pages as source material. Do not upload confidential documents in the hackathon demo. If a document is shown, use a synthetic or authorized sample and preserve page/section provenance.

### Strongest innovation

A design change produces an evidence-linked before/after review. This is more defensible than a new score or another orbital map because the system’s reasoning is inspectable.

### Biggest risk

The product may look like a compliance tool while disclaiming that it is not one. The UI, naming, and demo language must repeat “pre-review,” “evidence readiness,” and “not certification.”

### What judges will remember

A mission starts with a missing disposal proof. OrbitReady refuses a pass, identifies the source-linked gap, the user changes the design or adds evidence, the band changes, and a cited packet is exported.

## 12. Bibliography and source register

### Official event and policy sources

[1]: https://hackyard.org/build2026 "Hackyard Build 2026 official overview"

[2]: https://hackyard.org/build2026/guide "Project & Participant Guide | Hackyard Build 2026"

[3]: https://orbitaldebris.jsc.nasa.gov/mitigation/debris-assessment-software.html "NASA Debris Assessment Software"

[4]: https://www.isro.gov.in/Debris_Free_Space_Missions.html "India’s Intent on Debris-Free Space Missions - Explained"

[5]: https://www.unoosa.org/pdf/publications/st_space_49E.pdf "Space Debris Mitigation Guidelines of the UN Committee on the Peaceful Uses of Outer Space"

[6]: https://www.iadc-home.org/documents_public/file_down/id/5836 "IADC Space Debris Mitigation Guidelines"

[7]: https://www.iso.org/standard/83494.html "Space debris mitigation requirements — ISO 24113:2023"

[8]: https://technology.esa.int/upload/media/ESA-Space-Debris-Mitigation-Requirements-ESSB-ST-U-007-Issue1.pdf "ESA Space Debris Mitigation Requirements"

[9]: https://www.unoosa.org/documents/pdf/spacelaw/sd/Space_Debris_Compendium_COPUOS_2_May_2025.pdf "COPUOS Space Debris Compendium"

[18]: https://www.space-track.org/documentation "Space-Track documentation and operational conjunction-assessment warning"

[19]: https://celestrak.org/NORAD/documentation/gp-data-formats.php "CelesTrak GP Data Formats and Documentation"

[20]: https://leolabs.space/ "LeoLabs orbital intelligence platform"

[21]: https://www.slingshot.space/news/beacon-first-collision-avoidance-collaboration-platform "Slingshot Aerospace Beacon collision-avoidance collaboration platform"

[23]: https://www.nist.gov/itl/ai-risk-management-framework "NIST AI Risk Management Framework"

[24]: https://sdup.esoc.esa.int/ "ESA Space Debris User Portal and DRAMA/DISCOS resources"

[27]: https://orbitaldebris.jsc.nasa.gov/modeling/ordem.html "NASA ORDEM orbital debris engineering model"

[29]: https://www.esa.int/Space_Safety/Space_Debris/ESA_makes_space_debris_software_available_online "ESA makes space debris software available online"

### Science and sustainability literature

[10]: https://doi.org/10.1029/JA083iA06p02637 "Kessler & Cour-Palais (1978), Collision Frequency of Artificial Satellites: The Creation of a Debris Belt"

[11]: https://doi.org/10.1016/0094-5765(81)90111-7 "Kessler (1981), Collisional cascading: The limits of population growth in low earth orbit"

[12]: https://doi.org/10.1126/science.1123785 "Liou & Johnson (2006), Risks in space from orbiting debris"

[13]: https://orbitaldebris.jsc.nasa.gov/library/ "NASA Orbital Debris Program Office library and technical publications"

[14]: https://www.esa.int/Space_Safety/Space_Debris/Space_environment_report "ESA Space Environment Report"

[15]: https://ntrs.nasa.gov/citations/20210019018 "Hull & Schonberg (2021), Spacecraft Passivation — An Overview of Requirements and Practices"

[16]: https://www.sciencedirect.com/science/article/abs/pii/S0094576515001241 "Krisko et al. (2015), ORDEM 3.0 and MASTER-2009 modeled debris population comparison"

[17]: https://www.sciencedirect.com/science/article/abs/pii/S2468896720300847 "Braun et al. (2020), Upgrade of DRAMA — ESA’s space debris mitigation analysis tool"

### AI, explanation, uncertainty, provenance, and human-in-the-loop literature

[22]: https://jolt.law.harvard.edu/assets/articlePDFs/v31/Counterfactual-Explanations-without-Opening-the-Black-Box-Sandra-Wachter-et-al.pdf "Wachter, Mittelstadt & Russell (2018), Counterfactual Explanations without Opening the Black Box"

[25]: https://proceedings.mlr.press/v70/guo17a.html "Guo et al. (2017), On Calibration of Modern Neural Networks"

[26]: https://papers.nips.cc/paper/9547-can-you-trust-your-models-uncertainty "Ovadia et al. (2019), Can You Trust Your Model’s Uncertainty?"

[28]: https://doi.org/10.1007/3-540-44503-X_20 "Buneman, Khanna & Tan (2001), Why and Where: A Characterization of Data Provenance"

[30]: https://doi.org/10.1145/2939672.2939778 "Ribeiro, Singh & Guestrin (2016), Why Should I Trust You?"

[31]: https://papers.nips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions "Lundberg & Lee (2017), A Unified Approach to Interpreting Model Predictions"

[32]: https://doi.org/10.1016/j.artint.2018.07.007 "Miller (2019), Explanation in Artificial Intelligence: Insights from the Social Sciences"

[33]: https://doi.org/10.1145/3236009 "Guidotti et al. (2018), A Survey of Methods for Explaining Black Box Models"

[34]: https://arxiv.org/abs/2005.11401 "Lewis et al. (2020), Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"

[35]: https://arxiv.org/abs/2312.10997 "Gao et al. (2023), Retrieval-Augmented Generation for Large Language Models: A Survey"

[36]: https://aclanthology.org/2024.acl-long.463/ "Wang et al. (2024), DocLLM: A Layout-Aware Generative Language Model for Multimodal Document Understanding"

[37]: https://doi.org/10.1145/3290605.3300233 "Amershi et al. (2019), Guidelines for Human-AI Interaction"

[38]: https://doi.org/10.1109/3477.844354 "Parasuraman, Sheridan & Wickens (2000), A Model for Types and Levels of Human Interaction with Automation"

[39]: https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems "Sculley et al. (2015), Hidden Technical Debt in Machine Learning Systems"

### Source-quality note

The strongest claims in this dossier use official Hackyard, NASA, ISRO, UN, IADC, ISO, ESA, Space-Track, NIST, and primary product pages. Literature links include peer-reviewed papers, conference proceedings, NASA technical records, and archival preprints. Some technical standards are paywalled or available only through official summaries; where that occurs, the dossier treats the source as scope evidence rather than reproducing unseen clauses. Search-result snippets are not used as standalone evidence.
