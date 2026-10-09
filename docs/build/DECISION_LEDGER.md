# African Mandate decision ledger

**Ledger version:** 1.2.0

**Created by:** AM-PB2-01

**Policy:** Append only after Prompt 01 acceptance. Corrections add a new row that cites and supersedes the earlier row; accepted rows are not rewritten. `docs/build/BUILD_STATE.json` remains the only mutable milestone-state record.

## Source precedence v1.0

The controlling order is:

1. `docs/African_Mandate_Domain_Model_Simulation_Spec_v1_1.md` — domain and engine invariants.
2. `docs/AFRICAN_MANDATE_TECHNICAL_ARCHITECTURE_v2.md` — implementation and persistence where the domain spec is silent.
3. `docs/AFRICAN_MANDATE_DATA_AND_METHODOLOGY_SPEC_v1_1.md` — approved dated data/methodology decisions and source admission.
4. `docs/AFRICAN_MANDATE_GAME_DESIGN_SPEC_v2_1.md` — player experience subject to higher-order invariants.
5. Owner-approved Stage 1 scenario material, then Stage 2 authoring-only material.
6. Reconciled presentation, design, voice, glossary, and writing sources.
7. Build Preparation v1 and Promptbook v2 govern implementation work but do not override upstream product, domain, technical, data, or legal authority.

Exact source byte hashes and admission classifications are pinned in `docs/build/SOURCE_MANIFEST.md` with SHA-256 `4ce13c6d0fa6eb7d99f4e7023a7c48669bb57407827dc83f661f8ab6eccbb436` at the Prompt 00 accepted commit.

## Decision register

| ID | Type | Decision or open question | Source authority | Value / disposition | Approval state | Owner or sign-off | Affected prompts |
|---|---|---|---|---|---|---|---|
| AM-GOV-001 | owner | Milestone acceptance workflow | Owner instruction, 2026-10-08; Build State Protocol | After the owner checks/runs a completed prompt and commits it, that commit is the acceptance event for the preceding prompt. Git SHA, author, and timestamp are the durable record; no duplicate sign-off ceremony is required. The implementing agent still stops at `READY_FOR_REVIEW` and cannot create the accepting commit. | APPROVED | Seth-arc, repository owner | 00–29 |
| AM-GOV-002 | owner | Prompt 00 acceptance | AM-GOV-001; commit metadata; Prompt 00 evidence | Commit `2385e8cdc245e1ae4779a8a81c5f06964a907302`, authored and committed by Seth-arc at `2026-10-08T15:40:21-04:00`, accepts PB2-00. | APPROVED | Seth-arc, repository owner | 01 |
| AM-GOV-003 | source | Fixed scenario dates, countries, turn count, and decision slots | Data & Methodology v1.1 AM-DM-001/002; Build Constitution §2; Reconciliation locked decisions | Historical conflict anchor `2025-09-26`; simulation start `2025-10-01`; countries Mali (`ML`), Burkina Faso (`BF`), Niger (`NE`), Chad (`TD`), Mauritania (`MR`); 20 calendar-month turns; 3 consequential decisions per month. | APPROVED | Source-approved; changes require versioned scenario/baseline amendment | 03–29 |
| AM-GOV-004 | external | Administrative boundary provider, edition, effective date, level, stable zone IDs, crosswalk, and licence | Data & Methodology v1.1 AM-DM-003; OD-02; AC-018/019 | Validated administrative boundaries are required. No provider, edition, level, crosswalk, or production geometry is approved. Admin-1 and Mopti remain candidates only. | PENDING / BLOCKED | GIS/data lead + scenario owner | 06, 22, 25–29 |
| AM-GOV-005 | external | Institutional and legal authorization procedures | Build Constitution §3; OD-09; AC-013/023 | No production authorization path is approved. Liaison, consultation, or case creation must not be treated as formal authorization. | PENDING / BLOCKED | Institutional counsel + regional reviewer | 15, 19, 26–29 |
| AM-GOV-006 | owner | Balance constants and actor private state | Build Constitution §§4,6; OD-08 | Exact balance constants, actor stances, confidence values, multipliers, and calibration ranges are unapproved. Named, versioned `TEST_ONLY` fixtures are allowed and cannot be promoted. | PENDING | Scenario/system owner | 06, 10, 12, 16, 18–19, 26–29 |
| AM-GOV-007 | owner | Indicators and evaluation formulas | Build Constitution §2; Data & Methodology §9; OD-10; AC-024 | Six evaluation dimensions are fixed; exact formulas, weights, normalizations, missingness policy, and five headline indicator projections are unapproved. No new writable gauges. | PENDING / BLOCKED | Methodology + balance owner | 13, 19, 21, 24, 26–29 |
| AM-GOV-008 | owner | Leaderboard formula, cohorts, and trusted replay boundary | Reconciliation leaderboard addendum; OD-11; proposed ADR-0001; AC-026 | Verified comparison is a product requirement, but formula, cohorts, and architecture amendment are unapproved. No client-scored or production leaderboard implementation. | PENDING / BLOCKED | Product + domain + backend owners | 28–29 |
| AM-GOV-009 | owner | `DESIGN_STANDARDS.md` mapping | Prompt 00 source manifest; legacy OD-15; source precedence | `docs/DESIGN_STANDARDS.md` exists at accepted Prompt 00 commit with SHA-256 `39755e3cbd573e8682970d2aefd1a98a7b53b9cb935611e6fd17bafdbfe21bb4` and is owner-confirmed for the presentation layer. This resolves artifact absence only; it does not override higher-precedence sources or approve new product behavior. | APPROVED, PRESENTATION ONLY | Repository owner confirmation captured by Prompt 00 | 21–24 |
| AM-GOV-010 | engineering | Canonical source directory mismatch | Promptbook README; Prompt 00 audit | Sources remain in `docs/`. Do not copy or move them into `docs/source/` without an approved migration, because that would create a second source of truth. | PENDING | Engineering owner | 02 and later source tooling |
| AM-GOV-011 | engineering | Exact build-state transition edges | Build State Protocol defines statuses but not every allowed edge | The `x-allowedTransitions` map in `docs/build/schemas/build-state.schema.json` is a `TEST_ONLY_DESIGN_PROPOSAL_PENDING_AM-PB2-01_REVIEW`. It exists only to exercise required transition tests and becomes binding only if the owner accepts Prompt 01 by reviewed commit. | PROPOSED / TEST_ONLY | Engineering owner review required | 01–29 |
| AM-GOV-012 | engineering | Exact Node/pnpm workspace and development toolchain | Technical Architecture v2 §§5, 5.1, 7–9, 90, 97, 100; Repository Bootstrap | Pin Node `22.16.0`, Corepack `0.32.0`, pnpm `11.23.0`, TypeScript `6.0.3`, tsx `4.23.15`, ESLint `10.12.0`, typescript-eslint `8.71.1`, Prettier `3.9.9`, and Vitest `5.0.3`. Allow only pinned transitive `esbuild@0.28.2` to run an install script. The package graph is TEST_ONLY infrastructure and contains no gameplay contract. | READY_FOR_REVIEW | Engineering owner acceptance by reviewed Prompt 02 commit | 02–29 |
| AM-GOV-013 | owner | Prompt 01 acceptance and transition-model review | AM-GOV-001; commit metadata; Prompt 01 evidence | Commit `3a3302099f6e78e786dbc0fc5d78f13723a366d4`, authored and committed by Seth-arc at `2026-10-08T15:53:09-04:00`, accepts PB2-01 and its reviewed build-state transition model. This row supersedes only the pending approval state of AM-GOV-011; it does not rewrite that historical proposal row. | APPROVED | Seth-arc, repository owner | 02–29 |

| AM-GOV-014 | owner | Prompt 02 acceptance and pinned workspace review | AM-GOV-001; commit metadata; Prompt 02 evidence | Commit `5c944fb501e6f091c768421eaf0c2e0452ea8245`, authored and committed by Seth-arc at `2026-10-08T16:19:00-04:00`, accepts PB2-02 and the pinned workspace/toolchain recorded in AM-GOV-012. This row supersedes only the pending approval state of AM-GOV-012; it does not rewrite that historical proposal row. | APPROVED | Seth-arc, repository owner | 03-29 |
| AM-GOV-015 | engineering | Isolated partial `FixturePackage` serialization shape | Prompt 03; AM-BUILD-001; First Compilation Fixture Plan v1 | `FixturePackageSchema` uses explicit `fixtureSchemaVersion: 1` and `classification: TEST_ONLY_PARTIAL_FIXTURE`. These fields have no canonical upstream shape and are therefore a test-only design proposal. A fixture is rejected by `ScenarioBundleSchema`; this proposal cannot admit production content. | PROPOSED / TEST_ONLY | Domain/architecture owner review required with Prompt 03 | 03, 06, 18-19 |

| AM-GOV-016 | owner | Prompt 03 acceptance and serialized-domain review | AM-GOV-001; commit metadata; Prompt 03 evidence | Commit `05f933cba84e7023009fffaee4b36f1d839ce3a7`, authored and committed by Seth-arc at `2026-10-09T11:13:45-04:00`, accepts PB2-03 and its contract version 0.1.0. This acceptance does not promote the partial fixture or admit production scenario content. | APPROVED | Seth-arc, repository owner | 04-29 |
| AM-GOV-017 | engineering | Determinism artifact wrapper and unspecified string boundaries | Technical v2 §§13-15; Prompt 04; AM-BUILD-002 | The source-published random values remain canonical. Artifact wrapper fields, ECMAScript string key ordering, no automatic Unicode normalization, NUL-delimiter rejection, and the collision-registry call shape are TEST_ONLY implementation proposals where the source does not define an exact serialized/API field. No generated ID or state hash is source-canonical before Prompt 04 review. | PROPOSED / TEST_ONLY | Domain/architecture owner review required with Prompt 04 | 04-29 |

## Non-decisions

- Unknown or missing source data remains unknown, never zero.
- No source hash proves licensing, correctness, completeness, or production admission.
- No proposal, test fixture, authoring sentinel, or required schema field converts a pending value into an approved value.
- No AI-authored prose or UI projection may mutate authoritative simulation state.
