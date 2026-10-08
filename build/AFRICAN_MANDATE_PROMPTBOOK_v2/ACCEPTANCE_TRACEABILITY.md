# Prompt-to-acceptance traceability

Each item requires independent verification evidence. The underlying Build Preparation `ACCEPTANCE_MATRIX.md` remains normative and must be cross-referenced by Prompt 00 to precise AM-ACT IDs. This table is a milestone-level index, not proof of test execution.

| ID | Requirement | Prompt | Prerequisites | Exit evidence | Status |
|---|---|---|---|---|---|
| PB2-00 | Repository audit and source inventory | 00_REPOSITORY_AUDIT.md | None; repository access | Signed-off inventory and owner-approved next step; missing artifacts recorded. | Pending |
| PB2-01 | Build governance and approval state | 01_GOVERNANCE_FREEZE.md | 00 ACCEPTED | Build state exists, gate enforcement proven, owner sign-off for implementation baseline. | Pending |
| PB2-02 | Pinned workspace and CI | 02_WORKSPACE_CI.md | 01 ACCEPTED | Clean reproducible install and evidence log; package graph documented. | Pending |
| PB2-03 | Canonical serialized domain contracts | 03_DOMAIN_SCHEMAS.md | 02 ACCEPTED | Schema conformance suite green and inventory crosswalk updated. | Pending |
| PB2-04 | Deterministic primitives and fixed vectors | 04_DETERMINISM.md | 03 ACCEPTED | Independent fixed vectors pass on two clean runs. | Pending |
| PB2-05 | Application ports and operation boundary | 05_APPLICATION_PORTS.md | 04 ACCEPTED | Ports frozen/versioned before command engine and UI code. | Pending |
| PB2-06 | Isolated synthetic compilation fixture | 06_FIXTURE_KERNEL.md | 03–05 ACCEPTED | Fixture kernel compiles locally, full-production serializer rejects it. | Pending |
| PB2-07 | Rule facts, commands and eligibility | 07_COMMAND_RULES.md | 03–06 ACCEPTED | Differential eligibility test and schema-validated command tests pass. | Pending |
| PB2-08 | Atomic decision commit and durable persistence | 08_COMMAND_ATOMICITY.md | 05,07 ACCEPTED | All atomicity and idempotence properties pass against in-memory repository. | Pending |
| PB2-09 | Calendar, scheduling and attention lifecycle | 09_TURN_ENGINE.md | 08 ACCEPTED | Lifecycle tests pass with trace and bounded mandatory response. | Pending |
| PB2-10 | World state subsystem resolvers | 10_WORLD_SUBSYSTEMS.md | 09 ACCEPTED | Each subsystem test contract and coverage declaration accepted. | Pending |
| PB2-11 | Player knowledge and intelligence collection | 11_EVIDENCE_KNOWLEDGE.md | 09–10 ACCEPTED | SIM-01, SIM-06, SIM-14 core properties pass. | Pending |
| PB2-12 | Actor relationships, positions and memory | 12_ACTOR_MEMORY.md | 10–11 ACCEPTED | SIM-02 actor/memory kernel tests pass. | Pending |
| PB2-13 | Structured assessment lifecycle | 13_ASSESSMENTS.md | 11–12 ACCEPTED | SIM-05 assessment properties pass. | Pending |
| PB2-14 | Consultations, terms and commitments | 14_CONSULTATIONS.md | 12–13 ACCEPTED | SIM-02, SIM-09 consultation and commitment tests pass. | Pending |
| PB2-15 | Coalitions, mandate cases and authorization gate | 15_MANDATE_CASES.md | 13–14 ACCEPTED | SIM-07 and SIM-10 pass in synthetic cases. | Pending |
| PB2-16 | State-driven events, doctrine and evaluation traces | 16_EVENT_DIRECTOR.md | 10–15 ACCEPTED | Events/doctrine test harness accepts deterministic conditional paths. | Pending |
| PB2-17 | Deterministic narrative fallback and templates | 17_NARRATIVE_FALLBACK.md | 11–16 ACCEPTED | SIM-16 passes without network. | Pending |
| PB2-18 | Four-month TEST_ONLY compiled content | 18_FOUR_MONTH_CONTENT.md | 06–17 ACCEPTED | Full test-only content cross-references, fixture hash and branch inventory pass. | Pending |
| PB2-19 | Independent SIM-01 to SIM-16 headless acceptance | 19_HEADLESS_ACCEPTANCE.md | 18 ACCEPTED | Only ACCEPTED if every mandatory synthetic SIM passes and replay matches; otherwise BLOCKED/FAILED. | Pending |
| PB2-20 | Production application adapters and projections | 20_APPLICATION_ADAPTERS.md | 05,08,11,17,19 ACCEPTED | Adapter integration tests and stable snapshot/projection interfaces pass. | Pending |
| PB2-21 | Accessible UI shell and status surfaces | 21_UI_SHELL.md | 20 ACCEPTED | UI shell usable from projections with no simulator raw imports. | Pending |
| PB2-22 | Map, subject list, dossiers and documents | 22_UI_MAP_DOCS.md | 20–21 ACCEPTED | Map and document tests pass in isolated synthetic scope. | Pending |
| PB2-23 | Decision preview, commitment and resolution UI | 23_UI_DECISIONS.md | 20–22 ACCEPTED | Complete simulated four-month UI happy/adverse paths pass. | Pending |
| PB2-24 | Editorial, accessibility and visual conformance | 24_UI_EDITORIAL_QA.md | 21–23 ACCEPTED | Local editorial/UI acceptance accepted; regional/publication reviews separately pending. | Pending |
| PB2-25 | Production track: boundaries and data acquisition | 25_DATA_GEO_TRACK.md | 19 ACCEPTED; external input required | EXTERNAL_PENDING until signed source/geometry/licensing manifests. | Pending |
| PB2-26 | Production track: actors, authority, balances | 26_SCENARIO_APPROVAL.md | 19 ACCEPTED; external reviewers | EXTERNAL_PENDING until reviewers/owner sign off. | Pending |
| PB2-27 | Full 20-month scenario and balance verification | 27_FULL_CAMPAIGN.md | 25–26 ACCEPTED and 19 ACCEPTED | Production simulation accepted only with full trace, playtest and calibrated test evidence. | Pending |
| PB2-28 | Separate trusted leaderboard replay service | 28_LEADERBOARD_SERVICE.md | 04,19,26–27 ACCEPTED; approved ADR | Security/replay review and published scoring rule version accepted. | Pending |
| PB2-29 | Release evidence and sign-off | 29_RELEASE_DECISION.md | 24–28 ACCEPTED, or explicitly scoped noncompetitive release with authorized exclusion | Owner signs PROD_ACCEPTED; otherwise publish BLOCKED gate report. | Pending |
