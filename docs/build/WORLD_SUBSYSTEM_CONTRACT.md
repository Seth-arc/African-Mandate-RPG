# World subsystem resolver contract

**Contract version:** 1.0.0

**Task:** AM-PB2-10 / PB2-10

**Owners:** serialized state/effect/artifact schemas in `@african-mandate/domain`; pure effect application, coverage declaration, and source-ordered TEST_ONLY adapters in `@african-mandate/simulation`

**Classification:** TEST_ONLY design proposal; every production subsystem dynamic is BLOCKED

## One authoritative state

`CampaignState` is the only mutable aggregate. Its `world` field now uses the exact Domain v1.1 registries for territories, zones, conflict, civilian, infrastructure, development, and external environment. Institution resources use the canonical institution runtime shape. Record keys must match embedded IDs where the source provides one.

Subsystem metrics are writable only at these paths:

| Subsystem | Sole mutable owner | Resolver mode |
|---|---|---|
| Institution resources | `institutions[*].resources` | canonical typed effects only |
| Territory core | `world.territories` | canonical typed effects only |
| Zone core | `world.zones` | canonical typed effects only |
| Conflict | `world.conflict` | canonical typed effects only |
| Civilian | `world.civilian` | canonical typed effects only |
| Infrastructure | `world.infrastructure` | canonical typed effects only |
| Development | `world.development` | canonical typed effects only |
| External environment | `world.externalEnvironment` | initial no-op |

Territory and zone schemas are strict. They reject duplicate writable subsystem summaries such as territory conflict pressure or zone civilian confidence. Baseline packages are immutable resolver inputs and are never copied into or rewritten by campaign state.

## Typed inputs and deterministic output

`WorldResolutionRequestSchema` version `1.0.0` accepts a pinned baseline, one current campaign state, the current turn, and an ordered list of effect envelopes. Every envelope identifies one source (`scheduled_consequence`, `world_event`, or `test_fixture`), one declared owner subsystem, and one canonical Appendix F effect. Duplicate effect IDs fail schema validation.

The wrapper fields, source envelope, declared-subsystem field, rejection codes, trace ID, changed-field paths, and `TEST_ONLY_WORLD_RESOLUTION` classification are not exact upstream fields. They are the review-required proposal AM-GOV-029. They do not become production content or a second source of truth.

The resolver clones the current campaign, checks source existence/eligibility, verifies that the declared subsystem owns the effect kind, applies effects in input order, validates the complete candidate state, and returns it with deterministic traces. Any invalid effect rejects the entire batch; the caller's state and baseline remain unchanged. Numeric deltas use the source-required effect-handler clamp and deterministic half-away-from-zero quantization, not a subsystem simulation formula.

## Ordered turn adapters

The default Prompt 09 registry is unchanged: world phases remain visible `initial_no_op` adapters. `createTestOnlyWorldFixtureResolverRegistry` can replace only phases 8a conflict, 8b civilian, 8c infrastructure, and 8d development with `test_only_fixture` adapters. It preserves the accepted registry order and refuses core/resource effects that do not belong to those four phases. Phase 8e external environment remains `initial_no_op` because no canonical external-environment effect contract exists.

Territory core, zone core, and institution-resource effects are supported by the pure typed batch resolver but are not silently inserted into a world-dynamics phase. Production orchestration of those effects at scheduled-consequence or immediate-event phases remains BLOCKED pending the later effect/event milestones.

## Explicit production blockers

All eight coverage entries publish `productionDynamics: BLOCKED`. No real baseline values, balance coefficients, per-turn contribution maxima, adjacency propagation, deterministic shocks, cross-system coupling formula, event generation, or external-environment update is implemented. A seeded fixture supplies explicit deltas; its seed identifies deterministic test evidence and never generates a magnitude.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-10 | Every named subsystem has an ownership and resolver/coverage declaration | `tests/unit/world-subsystems.test.ts`; `WORLD_SUBSYSTEM_COVERAGE` |
| AC-002 | No mutable metric has two writable owners | strict world/institution schemas and duplicate-summary negative test |
| PB2-10 | Baseline is unchanged across resolution | input/baseline hash tests |
| PB2-10 | Declared fixed fixture changes multiple subsystems deterministically | repeated-equality and multi-subsystem fixture tests |
| PB2-10 | Cross-system effects fail closed | owner mismatch, invalid target, and invalid infrastructure target tests |

Canonical references: Domain v1.1 lines 422-438, 906-958, 1004-1039, 2972-3122, 3161-3188, 3322-3360, 4180-4236, and 5260-5435; Technical Architecture v2 lines 3099-3125; Data & Methodology v1.1 lines 95-141; GDS v2.1 lines 3095-3143 and 3755-3829.
