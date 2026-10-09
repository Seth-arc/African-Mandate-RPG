# Synthetic fixture compiler contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-06 / PB2-06  
**Owner:** `@african-mandate/data-pipeline`  
**Classification:** TEST_ONLY; not a historical baseline or complete `ScenarioBundle`

## Authority and isolation

This compiler implements only the isolated engineering fixture permitted by Data & Methodology v1.1 §§11–14 and Appendix C. The checked-in input contains a square synthetic polygon, synthetic observation rows, one synthetic asset, and two synthetic contradictory claims. It does not read `data/`, assert a real Mopti boundary, compile ACLED totals, allocate displacement, or infer a 2025 operating status.

`FixturePackageSchema` from `@african-mandate/domain` remains the parser authority for the partial fixture envelope. `SyntheticCompilationFixtureSchema` adds strict compiler-only inputs under classification `TEST_ONLY_SYNTHETIC`. Unknown fields fail closed. The raw historical-source path is deliberately absent from this fixture compiler; real-source adapters remain blocked pending Prompts 25–27 and the external gates in AM-GOV-004.

The exact compiler input/output fields, SHA-derived ID material, stable row ordering, and boundary policy are the review-required TEST_ONLY proposal AM-GOV-021. They do not silently canonize production geography or source methodology.

## Deterministic pipeline

The compiler performs:

1. strict Zod parsing of the partial `FixturePackage` and synthetic inputs;
2. stable source-row ordering by `rowId`;
3. duplicate source-record audit before inclusion;
4. explicit temporal, coordinate, boundary, and outside-polygon dispositions;
5. SHA-256-derived observation, asset, and evidence IDs;
6. explicit `null` plus `MISSING` preservation for absent observed values;
7. canonical JSON serialization with sorted object keys and semantic array order;
8. Web Crypto SHA-256 generation for source content and emitted artifacts, regression-checked against the accepted simulation canonical JSON/hash contract.

The synthetic polygon uses longitude/latitude tuple ordering. Exact edge hits are classified `BOUNDARY` and held unassigned under `HOLD_AS_BOUNDARY_NOT_ASSIGNED`. This is a deterministic unit-test policy, not an approved GIS tie-break for production geometry.

## Versioned artifact schemas

The public package exports strict schemas for the Appendix C names:

| Artifact | Schema | Purpose |
|---|---|---|
| `fixture-source-manifest.json` | `FixtureSourceManifestSchema` | Synthetic source inventory, row counts, source-content SHA-256, non-publishable state |
| `fixture-source-audit.json` | `FixtureSourceAuditSchema` | One disposition per row, duplicate IDs, cutoff and four-day gap |
| `fixture-zone-registry.json` | `FixtureZoneRegistrySchema` | Synthetic polygon and boundary policy |
| `fixture-baseline.json` | `FixtureBaselineSchema` | Included synthetic observations and asset only |
| `fixture-player-knowledge.json` | `FixturePlayerKnowledgeSchema` | Player-known contradictory synthetic claims; no private actor state |
| `fixture-expected-hashes.json` | `FixtureExpectedHashesSchema` | SHA-256 for the six non-circular compiled artifacts |
| `fixture-test-report.json` | `FixtureTestReportSchema` | Counts for inclusion, exclusion, duplicates, missingness, cutoff, and publish rejection |

`fixtureToTestInitialization` produces `TEST_ONLY_INITIALIZATION` with the accepted partial fixture, compiled synthetic baseline, and player knowledge. It deliberately lacks the complete registries required by `ScenarioBundleSchema`.

## Fail-closed publication boundary

`assertFixturePublishable` always rejects a parsed TEST_ONLY fixture. `serializeProductionScenarioBundle` first requires `ScenarioBundleSchema`; the fixture package and test initialization therefore fail production serialization. No conversion function promotes them.

## Source-to-test traceability

| Acceptance ID | Covered assertion | Evidence |
|---|---|---|
| PB2-06 | Isolated fixture compiler, test initialization, production rejection | `tests/unit/fixture-kernel.test.ts`; `scripts/verify-fixture-build.mjs` |
| AC-003 | Strict fixture and artifact schemas | parser, versioned artifact, unknown/classification rejection tests |
| AC-016 | Synthetic cutoff, four-day gap, and null-not-zero behavior only | audit/baseline assertions; real-data gate remains BLOCKED |
| AC-017 | Synthetic duplicate grain and inside/outside/edge behavior only | source-audit and polygon tests; real ACLED/GIS gate remains BLOCKED |
| AC-018 | Production five-country polygons | BLOCKED; synthetic square is explicitly not evidence |
| AC-019 | Production licensing and dated asset status | BLOCKED; TEST_ONLY publish gate proves non-admission |
