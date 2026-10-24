# OrbitReady research hub

This folder is the project’s shared research home. It preserves the original 66-file OrbitReady research library and provides short, agent-readable entry points. Start with this page, then read the relevant product summary and source files before proposing or implementing a feature.

## Start here

1. Read [`PRODUCT_RESEARCH.md`](PRODUCT_RESEARCH.md) for the problem, user, product thesis, current scope, alternatives, and claim boundaries.
2. Read [`SOURCE_REGISTER.md`](SOURCE_REGISTER.md) for source precedence, freshness checks, citation rules, and how to distinguish established evidence from project interpretation.
3. Use [`OrbitReady_Research_Library/RESEARCH_CATALOG_AND_INDEX.md`](OrbitReady_Research_Library/RESEARCH_CATALOG_AND_INDEX.md) to locate primary policy documents, academic literature, agency technical reports, data/tool documentation, competitor materials, and the original product research dossiers.
4. Read the original dossier(s) relevant to the question under `OrbitReady_Research_Library/05_Hackathon_and_Source_Dossiers/Original_OrbitReady_Dossiers/`.
5. For implemented project behavior, cross-check the source code, fixtures, tests, and [`../.brain/reports/package-audit.md`](../.brain/reports/package-audit.md). Research or architecture documents do not prove implementation.

The current canonical research paper is in [`../paper/`](../paper/). Earlier paper versions are retained separately in [`project-history/paper-drafts/`](project-history/README.md) for provenance only; they may contain superseded content.

## Library map

- `01_Academic_Literature/`: orbital debris/astrodynamics and AI explainability, uncertainty, human factors, provenance, and document processing.
- `02_Policy_and_Standards/`: international/agency standards and regulatory rulings/frameworks.
- `03_Agency_Technical_Reports/`: NASA and ESA technical reports, manuals, and release notes.
- `04_Data_and_Tools_Documentation/`: orbital data/catalog documentation, APIs, astrodynamics references, and commercial space-traffic products.
- `05_Hackathon_and_Source_Dossiers/`: Hackyard event material and the original OrbitReady product research dossiers.

The library has 66 preserved files (about 79 MB expanded at the time of packaging). It is copied from the project’s earlier research archive with its directory structure intact. [`FILE_MANIFEST.csv`](FILE_MANIFEST.csv) records each preserved path, byte size, and SHA-256 digest for integrity checks. It is an archival working library, not a guarantee that every linked, copied, or summarized source is current, complete, authentic, authoritative, or fit for a legal or engineering decision. Check [`SOURCE_REGISTER.md`](SOURCE_REGISTER.md) before relying on a source.

## Research-to-product use

Use research to inform problem framing, requirements, user workflows, rule-profile interpretation, safety boundaries, and test cases. For each proposed product claim or rule change, record: the claim; source title and issuing body; exact section/page/locator; publication/effective date; source type and jurisdiction; interpretation made by the team; uncertainty or scope limit; code/fixture affected; and the test that demonstrates the software behavior. Keep source language separate from team interpretation.

The project’s intended boundary is a source-linked, human-reviewed **pre-review evidence workflow**. It is not an orbital propagator, conjunction assessment or collision prediction service, maneuver advisor, certification authority, regulator filing system, or replacement for NASA Debris Assessment Software. “Inspired” profile logic must remain visibly scoped and must not be presented as official approval or general compliance.

## Updating this folder

Add new research without replacing the historical dossier files. Store each new source with a descriptive filename in the appropriate category; add it to the catalog and source register; include a retrieval/publication date and stable URL where applicable; and update `PRODUCT_RESEARCH.md` only when the project’s evidence-based product understanding changes. When replacing a source version, preserve the prior version or document why it was superseded. Avoid secrets, credentials, private personal data, and unrelated files.
