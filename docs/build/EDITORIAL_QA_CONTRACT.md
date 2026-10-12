# Editorial QA contract

**Task:** AM-PB2-24 / PB2-24  
**Schema version:** `1`  
**Contract version:** `0.1.0-test.1`  
**Owner:** `@african-mandate/tooling` for executable QA artifacts; `@african-mandate/ui` for presentation fixes  
**Classification:** TEST_ONLY editorial and accessibility verification; READY_FOR_REVIEW

## Authority and scope

This contract implements the local, automatable subset of Writing Standards v2, VOICE, GLOSSARY, Components Reconciled, the owner-confirmed Design Standard, and design decisions. In particular, it enforces simulated labeling and truthfulness (`WRITING_STANDARDS (1).md` lines 77-90), meaningful controls (lines 98-99 and 185), measured containers at 200% text (line 209), locale formatting (line 231), the copy-lint requirement (line 284), and the cold-read/human-review separation (lines 292 and 592-594). VOICE fixes player-facing dates and source wording (line 50) and expressly forbids invented readability claims before measurement and reader testing (lines 91-95). The component registry requires semantic elements and reduced-motion behavior (lines 11 and 24), while the Design Standard requires keyboard semantics, reduced motion, 200% zoom, simulated labeling, and source-aware static checks (lines 148-160 and 336-350).

`docs/DESIGN_STANDARDS.md` is present, version-pinned in the source manifest, and owner-confirmed. Therefore the prompt's missing-file blocker does not apply. This milestone does not convert automated checks into final human design, regional, legal, publication, licensing, general-reader, or assistive-technology approval.

## Public API and artifacts

`@african-mandate/tooling` exports strict Zod schemas and inferred types for:

- `EditorialAuditResultSchema` and `EditorialIssueSchema`;
- `TextContainerMeasurementSchema`, fixed to the required 200% text scale;
- `HumanApprovalRegisterSchema` and `HumanApprovalEntrySchema`;
- `auditEditorialCopy` and `auditTokenReferences`.

The exact QA report and approval-register fields are a TEST_ONLY design proposal under AM-GOV-057. They do not alter domain, simulation, application, or UI projection contracts. `docs/build/EDITORIAL_APPROVAL_REGISTER.json` is the sole mutable review-status artifact: pending/blocked entries cannot carry reviewer metadata, and an approved entry requires a named role, dated review record, findings, and no missing evidence.

`COLLECTION_NARRATIVE_OUTCOMES` exposes the six values already owned by `CollectionOutcomeSchema`; it is an inventory view, not a second list or mutable source of truth.

## Executable checks

- `scripts/verify-editorial-conformance.ts` parses relevant TypeScript/TSX strings, inspects the synthetic JSON fixture, applies fail/review copy patterns, validates all CSS custom-property references, rejects raw component colors and unregistered typography/radius/motion values, checks semantic interaction source, verifies simulated document markers and fixed dates, confirms the four-month date inventory, and validates the fail-closed human register.
- `tests/unit/editorial-qa.test.ts` pins all six narrative outcomes, prohibited copy detection, current-fixture cleanliness, token detection, and fake-approval rejection.
- `tests/e2e/editorial-conformance.spec.ts` measures the Strategic map, Monthly brief, and Decision journal at 1024 by 768 CSS pixels with 200% root text. It rejects document overflow and clipped text, captures each surface, completes a month by keyboard under reduced motion, runs axe, verifies locale dates/plain summaries/simulation notice, and confirms local fallback with the browser offline.
- Existing decision, map/document, shell, narrative, boundary, deterministic, schema, and full browser tests remain regression gates.

## Resource-tolerant execution policy

Independent reproduction exposed wall-clock starvation on this Windows host:
four browser workers delayed Vite/React/MapLibre initialization beyond the old
5/30-second waits, and a complete-suite headless artifact build exceeded its
old 60-second hook budget. Trace evidence showed delayed initialization and no
application exception; the map reached ready state after the locator timeout.

The browser gate therefore runs one worker with a 180-second test/server budget
and 60-second assertion budget. Deterministic headless artifact construction
has a 240-second per-run budget. These are execution envelopes, not acceptance
changes: there are no retries, no skipped cases, no reduced campaign/sample
counts, and no changed expected observables. The complete 24-test browser gate
and 175-test unit gate must still pass.

## Measured result and honest limits

The three 1024 by 768 / 200% surfaces contain 72, 72, and 77 measured visible text containers respectively. Each reported zero horizontally overflowing containers, zero clipped text containers, and a document width of 1024 CSS pixels. The browser suite also found and drove the correction of a two-pixel masthead glyph clipping condition. These measurements are observations, not invented editorial caps or readability targets.

The screenshots are machine evidence only. Visual inspection found no lost content in the captured paths, but no general-reader cold read, regional/AU-practice review, legal/protocol review, publication/licensing approval, assistive-technology lab, production-font admission, or production browser-matrix sign-off was run. Those entries remain visible in the human approval register and cannot be counted as PASS.

## Source-to-test traceability

| Acceptance ID | Requirement | Evidence | State |
|---|---|---|---|
| PB2-24 | Local editorial, accessibility, and visual conformance | focused unit/static/browser suites, captures, this contract, handoff | READY_FOR_REVIEW |
| AC-020 / SIM-16 | Every fallback outcome remains available without network | six-value inventory unit test; existing fallback tests; offline browser test | PASS TEST_ONLY |
| AC-021 | Accessible input semantics and UI/engine boundary | keyboard month, focus assertions, axe, 200% measurement, reduced-motion check, existing forbidden-import gate | PASS automated subset |
| AC-022 | Simulated marker and source/date/orthography correctness | AST copy lint, simulated marker/date tests, locale rendering, glyph regression, approval register | PASS automated subset; regional/publication review BLOCKED |
| AC-024 | No phantom five-meter presentation | existing shell omission tests and full regression suite | PASS omission; production formulas remain BLOCKED |

No passing local check promotes TEST_ONLY content or establishes production conformance.
