# Team knowledge map and judge preparation

Use `.brain/knowledge-manual.md` as the full reading and practice syllabus. This file remains the short judge-answer map; the manual adds concepts, internal reading locations, exercises, and readiness checks for each role.

## Aditya — backend and AI lead

Aditya needs to understand FastAPI routes, Pydantic validation, pure Python rule functions, SQLite persistence, SHA-256 hash chains, PDF/text parsing, structured LLM output, failure fallbacks, and why an LLM must never decide the final compliance-like status.

A likely judge question is: “Why do you need AI if deterministic rules decide?” Answer: “AI reduces manual extraction effort by suggesting fields and explanations. The final finding comes only from confirmed fields and versioned deterministic rules, so the system is reproducible and reviewable.”

Another likely question is: “Can this predict collisions or recommend a maneuver?” Answer: “No. It is deliberately a pre-review evidence tool. It does not perform conjunction assessment, collision prediction, orbital propagation, or maneuver guidance.”

## Narayan — frontend and UI lead

Narayan needs to understand React state, typed API clients, loading and error states, human confirmation controls, status rendering, API response shapes, the export lock, and how to show sources and limitations without hiding them in the UI.

A likely judge question is: “What does the reviewer actually do?” Answer: “The reviewer confirms or corrects extracted fields, opens each finding, checks its source and scope, chooses a review decision, and only then unlocks the cited packet.”

Another likely question is: “Why show a readiness band?” Answer: “It is only an evidence-prioritization aid. A critical gap caps the band, and the band is never a safety probability or certification result.”

## Roshan — QA and demo support

Roshan needs to understand the three synthetic fixtures, the five status values, how to run the test checklist, how to report a reproducible bug, how to verify an export, and how to run the offline demo if the live API or network fails.

A likely judge question is: “How did you validate it?” Answer: “We run deterministic fixture tests, negative cases for missing evidence and conflicts, export-lock tests, provenance tamper tests, frontend tests, typecheck, production build, and an offline demo path.”

Another likely judge question is: “Is the data real?” Answer: “No. The demo fixtures are explicitly synthetic. Real mission use would require qualified review, source verification, scope validation, and independent rule validation.”

## Whole-team answer pattern

Use this order: user problem → evidence source → human confirmation → deterministic rule → finding and limitation → reviewer decision → export. Never answer a technical question by claiming a capability that is outside the verified package.
