# Serialized domain contract inventory

**Contract version:** 0.1.0  
**Task:** AM-PB2-03 / PB2-03  
**Owner:** `@african-mandate/domain`  
**Status:** PB2-03 ACCEPTED at `05f933cba84e7023009fffaee4b36f1d839ce3a7`; Prompt 04 vector-wrapper addition READY_FOR_REVIEW; structural validation only, not production scenario admission

## Authority and boundary

Zod schemas exported by `@african-mandate/domain` are the executable serialization authority. TypeScript types are inferred from those schemas; no parallel handwritten public interface is maintained. The source shapes come from Domain Model v1.1, with Zod/JSON mechanics from Technical Architecture v2 and validation requirements from the Executable Contract Inventory.

This first wave does not claim a production-valid scenario. The upstream AM-BUILD-001 contract explicitly reserves that claim until all registries are complete and reviewed. In particular, `EffectProfile.effects` and the later-prompt CampaignState subsystem entries are presently bounded only to JSON-safe objects. Their exact discriminated contracts remain assigned to prompts 07-16 and must replace those envelopes before production admission.

## Crosswalk

| Serialized contract | Executable schema / inferred type | Source | Prompt 03 coverage |
|---|---|---|---|
| Scalar bounds and dates | `ScoreSchema`, `SignedScoreSchema`, `ProbabilitySchema`, `IsoDateSchema`, `MoneyAmountSchema` | Domain §§7-11 | Strict numeric/date checks; no defaults or coercion |
| Stable entity IDs | branded `*IdSchema` / inferred branded types | Domain §12 and Appendix F.1 | Prefix validation at serialization boundaries |
| Parties and subjects | `PartyRefSchema`, `SubjectRefSchema` | Domain §12.1-12.2 | Strict discriminated unions |
| Version metadata | `CampaignVersionsSchema` plus seven typed version-tag schemas | Domain §12.3 | All seven fields required |
| Scenario definition | `ScenarioDefinitionSchema` | Domain §12.5 | Required fields, calendar-month literal, bounds, duplicate arrays |
| Baseline package | `BaselinePackageSchema`, `SourceManifestSchema` | Domain §§90-92 and Appendix F.12 | Strict observed-value envelopes, quality bounds, duplicate entity/source checks |
| Scenario bundle | `ScenarioBundleSchema` | Domain §12.4 and named registries | Strict registry shapes and cross-reference/key checks; structural only |
| Campaign state | `CampaignStateSchema` with `CampaignMetaSchema` and `EnvoyStateSchema` | Domain §§12.6-15, 111-112 | Exact top-level/core fields, strict status/scalars, JSON-only deferred subsystem envelopes |
| Partial test fixture | `FixturePackageSchema` | Prompt 03; AM-BUILD-001; fixture plan | `TEST_ONLY_PARTIAL_FIXTURE`; proposal AM-GOV-015; rejected by `ScenarioBundleSchema` |
| Determinism vector artifact | `DeterminismVectorArtifactSchema` | Technical v2 §14.1 | Wrapper schema v1.0 is TEST_ONLY proposal AM-GOV-017; vector bytes and expected values are source-canonical |

## Referential validation

`ScenarioBundleSchema` checks record key/embedded ID agreement and references among scenario, territories, zones, assets, corridors, institutions, actors, authorization procedures, actions, events, effect profiles, and difficulty profiles. Duplicate ID arrays are rejected where set semantics apply. Baseline arrays and source-manifest entries reject duplicate identifiers.

The following remain intentionally outside Prompt 03: production content admission, approved geography, real actor priorities, legal authorization content, balance values, formula registries, effect-handler completeness, runtime mutation, deterministic canonical JSON/hashing, and compilation. Their absence is not converted into permissive production validation.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-03 | Canonical serialized domain contracts and inventory crosswalk | `tests/unit/domain-contracts.test.ts`; Prompt 03 CI log |
| AC-001 | Fixed date/turn/slot-compatible scalar and scenario shapes | valid scenario/baseline/campaign examples; bounds/date checks |
| AC-002 | One CampaignState top-level location per mutable subsystem | `CampaignStateSchema` crosswalk; architecture review still required before final production schema |
| AC-003 | Serialized Zod unions and references validate | strict-union, unknown-key, dangling-ref, duplicate-ID, non-JSON, invalid-status, and fixture-isolation tests |
