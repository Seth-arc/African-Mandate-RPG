# Acceptance Matrix v1
**Evidence states:** `NOT_RUN`, `STATIC_PASS`, `SIMULATION_PASS`, `EXTERNAL_APPROVED`, `FAILED`, `BLOCKED`. These are not interchangeable. On package creation, ALL implementation tests are `NOT_RUN` or `BLOCKED`; no running engine has been provided.

| ID | Requirement / assertion | Phase | Verification method | Evidence required | Current state |
|---|---|---|---|---|---|
| AC-001 | approved dates/countries/turn and slot bounds pinned | P0–P1 | schema/manifest test | reviewed constants, fixture parse | NOT_RUN |
| AC-002 | no duplicated writable subsystem state | P1 | schema audit / architecture test | type crosswalk | NOT_RUN |
| AC-003 | serialized Zod union and references valid | P1 | schema parser and invalid-fixture tests | CI logs | NOT_RUN |
| AC-004 | canonical JSON/SHA, keyed RNG, ID vectors | P2 | fixed vectors, repeat fresh process | values + hashes + log | NOT_RUN |
| AC-005 | atomic commit: failed local write ⇒ no consumed slot | P3 | failure injection | before/after state hash | NOT_RUN |
| AC-006 | same command ID twice ⇒ no duplicated effect | P3 | SIM-08 | revision/event/slot assertions | NOT_RUN |
| AC-007 | max 3 decisions, no rollover/extra, EndTurn chronology | P3 | SIM-11/SIM-13 | turn/slot snapshots | NOT_RUN |
| AC-008 | hidden-state mutation cannot alter eligible UI/forecast | P4 | SIM-06 differential | projection diffs | NOT_RUN |
| AC-009 | collection delayed; partial/failed/contested allowed | P4 | SIM-01 | tasks and evidence emission trace | NOT_RUN |
| AC-010 | consultation and memory effects applied once | P4 | SIM-02/SIM-09 | IDs and deltas | NOT_RUN |
| AC-011 | same-scope incompatible evidence contested, unlike different scopes | P4 | SIM-14 | evidence keys and support trace | NOT_RUN |
| AC-012 | assessment independent of evidence confidence; no silent rewrite | P4 | SIM-05 | assessment revisions | NOT_RUN |
| AC-013 | mandate case not auto-authorized; absent vetted procedure blocks without cost | P4 | SIM-07/SIM-10 | case/authorization state, slot count | NOT_RUN |
| AC-014 | B/C choices viable; inaction playable; Month 5 doctrine timing | P5 | SIM-03/SIM-04 | alternate branch snapshots | NOT_RUN |
| AC-015 | full Month1–4 replay deterministic, save/reload | P5 | SIM-12 + sample headless campaigns | golden hashes and versions | NOT_RUN |
| AC-016 | no source 2025 retrojection, 4-day gap preserved, null != 0 | P5/P7 | SIM-15, temporal audit | source inclusion/exclusion report | BLOCKED real data |
| AC-017 | ACLED dedup grain, reproducible zone assignment, coordinates lon/lat | P7 | parser and GIS edge tests | unique event and boundary audit | BLOCKED real data |
| AC-018 | valid 5-country admin polygons and map subject IDs | P7 | GIS topology/crosswalk/map test | signed boundary manifest | BLOCKED |
| AC-019 | licensed source redistribution and dated operational assets | P7 | source manifest review | rights and temporal approvals | BLOCKED |
| AC-020 | no narrative hidden leak; template fallback and late response guard | P4/P6 | SIM-16, prompt/context restricted tests | transcripts/projection diff | NOT_RUN |
| AC-021 | UI cannot import engine or hidden store; input semantics accessible | P6 | restricted import lint + Playwright/a11y | CI trace/screenshot/test log | NOT_RUN |
| AC-022 | simulated marker and correct source/date/orthography | P6/P9 | copy lint plus regional review | copy report and signoff | BLOCKED reviewer |
| AC-023 | legal authorization procedures vetted, actual actor history reviewed | P8 | procedure registry audit | dated legal/region signoff | BLOCKED |
| AC-024 | full six-dimensional trajectory evaluation, no phantom UI meters | P8 | methodology regression and projection test | approved formulas/version | BLOCKED |
| AC-025 | no same-month required-action softlock | P3/P5 | SIM-11 property test | adverse branch traces | NOT_RUN |
| AC-026 | independent server replay and cohort verification for leaderboard | P9 | tamper/replay/seed/score/security tests | signed server verification logs | BLOCKED |

## Headless scenario traceability (Package 4)
`SIM-01` AC-009; `SIM-02` AC-010; `SIM-03` AC-014; `SIM-04` AC-014; `SIM-05` AC-012; `SIM-06` AC-008; `SIM-07` AC-013; `SIM-08` AC-006; `SIM-09` AC-010; `SIM-10` AC-013; `SIM-11` AC-007/025; `SIM-12` AC-015/005; `SIM-13` AC-007; `SIM-14` AC-011; `SIM-15` AC-016; `SIM-16` AC-020.

## Gates
- **Gate A — Ready for controlled bootstrap:** approval of constitution, repository contract and correct spec copies; no simulation proof claimed.
- **Gate B — Synthetic headless slice:** AC-001–015, AC-020, AC-025 executed and pass; `SIM-01..16` trace recorded; TEST_ONLY visibly gated.
- **Gate C — Production historical scenario:** AC-016–019, AC-023–024 and all gameplay regressions pass; external data/institution/region signoffs.
- **Gate D — Player integration:** AC-020–022, UI and persistence tests pass with no projection leaks.
- **Gate E — Verified comparison release:** AC-026 plus approved score/tie and cohort policy; never trust browser-submitted score.
