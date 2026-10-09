Original prompt: Prompt 07 — Rule facts, commands and eligibility (AM-PB2-07).

- Preflight: clean `main` at owner-authored Prompt 06 commit `d84f62f36ecd53eb0fc7dd84bf6f48ca5efb7e75`; PB2-06 acceptance is reconcilable under AM-GOV-001.
- Canonical Domain v1.1, Technical Architecture v2, Game Design v2.1, contract inventory, acceptance matrix, Prompt 07, and predecessor handoff/source hashes reviewed.
- Completed: domain command/rule schemas, simulation preparation APIs, required negative and differential tests, governance/evidence log, and Prompt 07 handoff.
- Browser/Playwright loop is not applicable to this headless package milestone; no UI or canvas is in scope.
- Verification: frozen install passed; full CI passed with 6 files/64 tests; focused Prompt 07 suite passed 15 tests; governance passed 7 tests; diff check passed.
- Review TODO: independent owner review/commit; Prompt 08 must add atomic durable mutation and original-result duplicate replay without weakening this preparation boundary.
