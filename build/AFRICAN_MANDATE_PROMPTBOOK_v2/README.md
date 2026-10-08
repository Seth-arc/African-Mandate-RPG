# African Mandate — Vibecoding Promptbook v2

**Status:** Revised proposed AI-coding implementation plan; no simulation implementation, tests or legal/research approvals are claimed by this package. **Supersedes:** Promptbook v1. **Contents:** 30 numbered prompts + governance, owner guide, traceability and machine-readable state templates.

Start with `OWNER_GUIDE.md` → `SOURCE_PRECEDENCE.md` → `BUILD_STATE_PROTOCOL.md` → Prompt `00_REPOSITORY_AUDIT.md`. One prompt at a time, with independent acceptance. Never mistake a TEST_ONLY fixture for historical validation.

## Tracks and gates
- **00–05 Governance/foundation:** source versions, approvals, workspace, schemas, determinism and early application ports.
- **06–10 Test fixture/engine:** synthetic fixture, known eligibility, atomic persistence, turn lifecycle, world subsystem contracts.
- **11–17 Simulation mechanics:** intelligence, actors, assessment, commitments, mandates, events/doctrine, deterministic narrative fallback.
- **18–19 Integrated test slice:** compiled TEST_ONLY content and SIM-01–SIM-16 acceptance.
- **20–24 Application and UX:** ports/adapters, shell, map/docs, decision UI, editorial/accessibility QA.
- **25–29 Independently gated production:** source/geometry, institutional/legal/balance, twenty-month content, trusted leaderboard service, release decision.

## Nonnegotiable rules
- A task is not complete because an agent wrote tests that its own implementation passes. Verify canonical fixed vectors, negative property checks and independent golden scenarios.
- `READY_FOR_REVIEW` does not satisfy downstream dependencies; only explicitly verified `ACCEPTED` does.
- Stage 2 files are authoring candidates until compiled against approved contracts. Scenario time is 2025-10-01; historical conflict cutoff 2025-09-26; five countries ML/BF/NE/TD/MR.
- Absent real-world data remains unknown; no unauthorized production value, zone polygon, coefficient or law is inferred from source prose.
- The original architecture's leaderboard non-goal and later leaderboard requirement require an approved ADR/spec revision before the separate backend work.

## Prompt index

| # | Prompt | Prerequisites |
|---|---|---|
| 00 | [Repository audit and source inventory](prompts/00_REPOSITORY_AUDIT.md) | None; repository access |
| 01 | [Build governance and approval state](prompts/01_GOVERNANCE_FREEZE.md) | 00 ACCEPTED |
| 02 | [Pinned workspace and CI](prompts/02_WORKSPACE_CI.md) | 01 ACCEPTED |
| 03 | [Canonical serialized domain contracts](prompts/03_DOMAIN_SCHEMAS.md) | 02 ACCEPTED |
| 04 | [Deterministic primitives and fixed vectors](prompts/04_DETERMINISM.md) | 03 ACCEPTED |
| 05 | [Application ports and operation boundary](prompts/05_APPLICATION_PORTS.md) | 04 ACCEPTED |
| 06 | [Isolated synthetic compilation fixture](prompts/06_FIXTURE_KERNEL.md) | 03–05 ACCEPTED |
| 07 | [Rule facts, commands and eligibility](prompts/07_COMMAND_RULES.md) | 03–06 ACCEPTED |
| 08 | [Atomic decision commit and durable persistence](prompts/08_COMMAND_ATOMICITY.md) | 05,07 ACCEPTED |
| 09 | [Calendar, scheduling and attention lifecycle](prompts/09_TURN_ENGINE.md) | 08 ACCEPTED |
| 10 | [World state subsystem resolvers](prompts/10_WORLD_SUBSYSTEMS.md) | 09 ACCEPTED |
| 11 | [Player knowledge and intelligence collection](prompts/11_EVIDENCE_KNOWLEDGE.md) | 09–10 ACCEPTED |
| 12 | [Actor relationships, positions and memory](prompts/12_ACTOR_MEMORY.md) | 10–11 ACCEPTED |
| 13 | [Structured assessment lifecycle](prompts/13_ASSESSMENTS.md) | 11–12 ACCEPTED |
| 14 | [Consultations, terms and commitments](prompts/14_CONSULTATIONS.md) | 12–13 ACCEPTED |
| 15 | [Coalitions, mandate cases and authorization gate](prompts/15_MANDATE_CASES.md) | 13–14 ACCEPTED |
| 16 | [State-driven events, doctrine and evaluation traces](prompts/16_EVENT_DIRECTOR.md) | 10–15 ACCEPTED |
| 17 | [Deterministic narrative fallback and templates](prompts/17_NARRATIVE_FALLBACK.md) | 11–16 ACCEPTED |
| 18 | [Four-month TEST_ONLY compiled content](prompts/18_FOUR_MONTH_CONTENT.md) | 06–17 ACCEPTED |
| 19 | [Independent SIM-01 to SIM-16 headless acceptance](prompts/19_HEADLESS_ACCEPTANCE.md) | 18 ACCEPTED |
| 20 | [Production application adapters and projections](prompts/20_APPLICATION_ADAPTERS.md) | 05,08,11,17,19 ACCEPTED |
| 21 | [Accessible UI shell and status surfaces](prompts/21_UI_SHELL.md) | 20 ACCEPTED |
| 22 | [Map, subject list, dossiers and documents](prompts/22_UI_MAP_DOCS.md) | 20–21 ACCEPTED |
| 23 | [Decision preview, commitment and resolution UI](prompts/23_UI_DECISIONS.md) | 20–22 ACCEPTED |
| 24 | [Editorial, accessibility and visual conformance](prompts/24_UI_EDITORIAL_QA.md) | 21–23 ACCEPTED |
| 25 | [Production track: boundaries and data acquisition](prompts/25_DATA_GEO_TRACK.md) | 19 ACCEPTED; external input required |
| 26 | [Production track: actors, authority, balances](prompts/26_SCENARIO_APPROVAL.md) | 19 ACCEPTED; external reviewers |
| 27 | [Full 20-month scenario and balance verification](prompts/27_FULL_CAMPAIGN.md) | 25–26 ACCEPTED and 19 ACCEPTED |
| 28 | [Separate trusted leaderboard replay service](prompts/28_LEADERBOARD_SERVICE.md) | 04,19,26–27 ACCEPTED; approved ADR |
| 29 | [Release evidence and sign-off](prompts/29_RELEASE_DECISION.md) | 24–28 ACCEPTED, or explicitly scoped noncompetitive release with authorized exclusion |

## Source materials
Place the original canonical specs under `docs/source/` without modifying source bytes and Build Preparation Package v1 under its existing directory. If a source is absent, record a blocker; never synthesize its content.
