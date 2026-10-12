Original prompt: Prompt 07 — Rule facts, commands and eligibility (AM-PB2-07).

- Preflight: clean `main` at owner-authored Prompt 06 commit `d84f62f36ecd53eb0fc7dd84bf6f48ca5efb7e75`; PB2-06 acceptance is reconcilable under AM-GOV-001.
- Canonical Domain v1.1, Technical Architecture v2, Game Design v2.1, contract inventory, acceptance matrix, Prompt 07, and predecessor handoff/source hashes reviewed.
- Completed: domain command/rule schemas, simulation preparation APIs, required negative and differential tests, governance/evidence log, and Prompt 07 handoff.
- Browser/Playwright loop is not applicable to this headless package milestone; no UI or canvas is in scope.
- Verification: frozen install passed; full CI passed with 6 files/64 tests; focused Prompt 07 suite passed 15 tests; governance passed 7 tests; diff check passed.
- Review TODO: independent owner review/commit; Prompt 08 must add atomic durable mutation and original-result duplicate replay without weakening this preparation boundary.

## Prompt 22 — map, subjects, dossiers, and documents

- Preflight: clean owner-authored Prompt 21 commit `994280a2327fc02d02f4534078d75b4669a764eb`; acceptance is reconcilable under AM-GOV-001.
- Source review: Technical v2 MapArtifactManifest/feature identity/map tests/first slice; Components registry; VOICE dossier/document rules; GLOSSARY confidence and orthography.
- Implemented first slice: strict TEST_ONLY map/document projection and inline synthetic geometry schema; canonical hash checks; MapLibre host; ID-only map/list selection; knowledge-safe dossiers; metadata plus separate evidence and assessment sections; missing/unknown legend and label-glyph probe.
- Production gates remain explicit: real geography, PMTiles publication, and dated asset admission are BLOCKED. No Mopti polygon, inferred zone, or 2026 asset assertion is present.
- Verification: focused unit 7/7; focused browser 4/4; complete browser 13/13; web build passed; full CI passed with 21 files/167 tests; governance 7/7; frozen install and lockfile supply-chain policy passed. Corrected failures remain in the Prompt 22 log.
- Review TODO: independent owner review/commit; production geography, PMTiles publication, font/glyph approval, dated asset evidence, regional/editorial review, and production UI certification remain blocked.
