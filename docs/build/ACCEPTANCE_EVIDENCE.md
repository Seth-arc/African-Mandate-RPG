# Acceptance evidence

## AM-PB2-00 — Repository audit and source inventory

**Status:** ACCEPTED

**Acceptance ID:** PB2-00

**Base SHA:** `32686631558322be6757f2b6809acd83b255453b`

**Accepted commit:** `2385e8cdc245e1ae4779a8a81c5f06964a907302`

**Independent verifier / owner:** Seth-arc, repository owner

**Accepted at:** `2026-10-08T15:40:21-04:00` by reviewed commit under decision `AM-GOV-001`

### Evidence produced

- `docs/build/SOURCE_MANIFEST.md`: SHA-256 inventory, authority classification, and missing artifacts.
- `docs/build/REPO_AUDIT.md`: repository, toolchain, code, test, branch, workflow, and blocker audit.
- `docs/build/handoffs/00.md`: reviewer-ready handoff and reproduction instructions.

### Static checks performed during the audit

- Confirmed the Git root, base commit, branch, remote, and pre-existing dirty path.
- Confirmed all manifest paths existed when hashed, except artifacts explicitly marked unavailable.
- Computed SHA-256 over exact bytes for every pre-existing file under `build/`, `docs/`, and `data/`, excluding the new `docs/build/` outputs to avoid self-reference.
- Confirmed no package manifest, lockfile, workspace file, application package, automated test tree, CI workflow, deployment configuration, or environment template exists.
- Confirmed the only pre-existing dirty path was `docs/DESIGN_STANDARDS.md`; it was not modified, and the owner subsequently confirmed it for inclusion as the official project design standard.

### Tests and negative cases

- Project tests: NOT_RUN; no project test runner or executable application workspace exists.
- Authoring validator: NOT_RUN; Prompt 00 does not change code, and static inspection found its default source path does not match the repository layout.
- Hash/path negative case: unavailable required artifacts are listed explicitly rather than assigned invented hashes.
- Source-admission check: the design standard is classified as owner-confirmed at the presentation layer and remains subordinate to higher-precedence project sources.
- Evidence-state negative case: authoring fixture presence is not reported as `STATIC_PASS` or `SIMULATION_PASS` because the validator and engine were not run.

### Source-to-test traceability

The source-to-acceptance crosswalk is recorded in `docs/build/REPO_AUDIT.md`. Existing Acceptance Matrix identifiers are `AC-001` through `AC-026`; the Prompt 00 reference to `AM-ACT` identifiers has no matching IDs in the supplied matrix and is recorded as a governance issue.

### Acceptance record

The repository owner checked the Prompt 00 result and committed it as `2385e8cdc245e1ae4779a8a81c5f06964a907302`. Under the owner-approved acceptance-by-reviewed-commit rule recorded as `AM-GOV-001`, that commit is the durable independent acceptance event for PB2-00. The historical Prompt 00 handoff remains an accurate record of its pre-acceptance state.

## AM-PB2-01 — Build governance and approval state

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-01

**Preflight HEAD:** `2385e8cdc245e1ae4779a8a81c5f06964a907302`

**Prerequisite result:** PB2-00 is `ACCEPTED` at commit `2385e8cdc245e1ae4779a8a81c5f06964a907302` under `AM-GOV-001` and `AM-GOV-002`.

### Evidence produced

- `docs/build/BUILD_STATE.json`: the sole mutable milestone-state record; PB2-00 accepted and PB2-01 ready for independent review.
- `docs/build/schemas/build-state.schema.json`: public artifact schema v2.0 with approval invariants and an explicitly test-only proposed transition map.
- `docs/build/DECISION_LEDGER.md`: versioned, append-only source-precedence and decision record.
- `tests/governance/test_build_state.py`: dependency-free schema, hash, prerequisite, transition, and negative approval tests.
- `docs/build/logs/01-governance-tests.txt`: complete execution record, including two environment-launch failures and the successful test run.
- `docs/build/handoffs/01.md`: reproduction steps, changed paths, ownership, compatibility, and downstream prerequisites.

### Tests and negative cases

- `py -3 -m unittest discover -s tests/governance -p "test_*.py" -v`: exit `0`; 7 tests passed.
- BLOCKED, FAILED, PARTIAL, and ACCEPTED transition paths were exercised from allowed predecessor states.
- Direct `NOT_STARTED`/`IN_PROGRESS` self-approval was rejected.
- An `ACCEPTED` state without commit and approver evidence was rejected.
- A non-approved state carrying approval fields was rejected.
- The source-manifest SHA-256 was recomputed and matched the build state.
- Two earlier sandboxed runtime launches failed before test discovery (exit `1` and `101`); both remain visible in the log.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-01 | Build State Protocol; Promptbook build-state template | State schema, all 30 prompt records, independent approval invariants, gate transition proposal | PASS: 7 governance tests |
| AC-001 | Build Constitution §2; Data & Methodology AM-DM-001/002/003 | Fixed dates, countries, turn and slot bounds in `AM-GOV-003`; unresolved boundary fields remain pending | Governance evidence PASS; later runtime/schema tests remain pending |
| AC-002 | Build Constitution §3; Prompt 01 no-second-truth rule | `BUILD_STATE.json` is the sole mutable milestone state; ledger is append-only | Static contract test PASS; later architecture test remains pending |
| AC-018/019 | Data & Methodology; OD-02 | Boundary source/edition/admin/crosswalk/licence remain explicitly blocked in `AM-GOV-004` | BLOCKED as required |
| AC-023/024/026 | Build Constitution; OD-09/10/11 | Legal authority, formulas/indicators, and leaderboard remain explicitly blocked | BLOCKED as required |

No `AM-ACT` identifiers exist in the supplied Acceptance Matrix; the repository uses the actual `PB2-*` and `AC-*` identifiers without inventing aliases.

## AM-PB2-02 — Pinned workspace and CI

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-02

**Preflight HEAD:** `3a3302099f6e78e786dbc0fc5d78f13723a366d4`

**Prerequisite result:** PB2-01 is `ACCEPTED` by the reviewed Prompt 01 commit under `AM-GOV-001` and `AM-GOV-013`.

### Evidence produced

- Exact Node/Corepack/pnpm and development dependency pins in `.node-version`, `package.json`, `toolchain.json`, and `pnpm-lock.yaml`.
- Nine-project pnpm workspace: the root plus `domain`, `simulation`, `application`, `data-pipeline`, `content`, `ui`, `tooling`, and `web` workspaces.
- ESM/strict-TypeScript public root exports and ESLint import-direction enforcement.
- GitHub Actions frozen install and format/lint/type/unit/negative-boundary/schema pipeline.
- `docs/build/PACKAGE_GRAPH.md` and `packages/tooling/schemas/toolchain.schema.json` document the graph and artifact contract.
- `docs/build/logs/02-workspace-ci.txt` preserves failed and successful command evidence.

### Tests and negative cases

- Clean `corepack pnpm install --frozen-lockfile`: exit `0`, starting with `node_modules=False`; lockfile supply-chain policy passed.
- `corepack pnpm run ci`: exit `0`; format, peer dependencies, lint, typecheck, two unit smoke tests, forbidden-import negative test, and schema checks passed.
- `py -3 -m unittest discover -s tests/governance -p "test_*.py" -v`: exit `0`; 7 governance regression tests passed after moving the negative fixture from newly accepted PB2-01 to unapproved PB2-02.
- Forbidden import fixture: web importing simulation was rejected by `no-restricted-imports`; the boundary test passes only on that expected lint failure.
- Browser matrix, basemap provider, and GIS tool list remain explicitly unselected.
- Earlier install/configuration, formatting, lint, typecheck, and unit-resolution failures remain visible in the Prompt 02 execution log.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-02 | Technical Architecture v2 §§5, 5.1, 7–9, 90, 97, 100; Repository Bootstrap | Exact toolchain pins, frozen lock, workspace roots, CI, public exports, package graph | PASS |
| AC-021 | Technical Architecture v2 §§7.1–7.2 and 45.1 | UI/web cannot import simulation or deep/raw/debug modules; checked-in negative fixture must fail lint | Import-firewall portion PASS; accessibility remains for later UI prompts |
| PB2-01 | Build State Protocol and accepted governance schema | Previous acceptance reconciled; current prompt remains `READY_FOR_REVIEW` without self-approval | PASS: governance regression suite |

The Promptbook references an `AM-ACT` family that does not exist in the supplied Acceptance Matrix. This evidence uses the actual `PB2-02` and `AC-021` identifiers and does not invent aliases.

## AM-PB2-03 — Canonical serialized domain contracts

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-03

**Preflight HEAD:** `5c944fb501e6f091c768421eaf0c2e0452ea8245`

**Prerequisite result:** PB2-02 is `ACCEPTED` by the reviewed Prompt 02 commit under `AM-GOV-001` and `AM-GOV-014`.

### Evidence produced

- `packages/domain/src/`: Zod-authoritative scalar, ID, reference, version, scenario, baseline, campaign, JSON-safety, and isolated fixture schemas with inferred public types.
- `docs/build/DOMAIN_CONTRACT_INVENTORY.md`: contract version 0.1.0, ownership, source mapping, explicit partial boundaries, and acceptance crosswalk.
- `tests/unit/domain-contracts.test.ts`: structural examples and the required negative schema suite.
- `docs/build/logs/03-domain-contracts.txt`: complete execution record, including the initial sandbox launch failures and first formatting/type failures.
- `docs/build/handoffs/03.md`: independent reproduction, compatibility, exact paths, and remaining gates.

### Tests and negative cases

- Full Prompt 03 verification commands and results are recorded in `docs/build/logs/03-domain-contracts.txt`.
- Valid structural `ScenarioBundle`, `BaselinePackage`, `CampaignState`, `PartyRef`, and `SubjectRef` examples parse.
- Unknown top-level fields, dangling scenario references, duplicate IDs, out-of-range scores, non-JSON state, and invalid campaign status are rejected.
- A `TEST_ONLY_PARTIAL_FIXTURE` parses only as `FixturePackage` and is rejected by `ScenarioBundleSchema`.
- No production bundle, geography, actor priorities, legal procedure content, balance values, or evaluation formula is asserted or admitted.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-03 | Domain v1.1 §§4-15 and registries; Technical v2 Zod rule; Executable Contract Inventory | Zod schemas and inferred types under `@african-mandate/domain`; inventory crosswalk | READY_FOR_REVIEW |
| AC-001 | Domain §§7-15; AM-DM-001/002 | Date/scalar bounds and source-compatible scenario shape; no production scenario values | Schema tests PASS; production fixture parse remains later work |
| AC-002 | Domain truth-layer and single-writer rules | One CampaignState top-level location per mutable subsystem | Static schema/crosswalk PASS; exact later subsystem schemas remain pending |
| AC-003 | Technical v2 Zod source-of-truth; Contract Inventory | Strict unions, JSON safety, duplicate and cross-reference rejection | Schema conformance tests PASS |

Prompt 03 remains unapproved until the repository owner reviews, reruns, and commits it under `AM-GOV-001`.

## AM-PB2-04 — Deterministic primitives and fixed vectors

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-04

**Preflight HEAD:** `05f933cba84e7023009fffaee4b36f1d839ce3a7`

**Prerequisite result:** PB2-03 is `ACCEPTED` by the reviewed Prompt 03 commit under `AM-GOV-001` and `AM-GOV-016`.

### Evidence produced

- `packages/simulation/src/determinism/`: synchronous portable SHA-256, keyed sampling, derived IDs with collision failure, canonical JSON/hash, deep-frozen snapshot hashing, and round-half-away-from-zero.
- `packages/domain/src/determinism-vectors.ts`: Zod-authoritative fixed-vector artifact schema and inferred type.
- `tests/fixtures/determinism/technical-v2-random-vectors.json`: byte-for-byte expected digest/sample values from Technical v2 §14.1 with pinned provenance.
- `tests/unit/determinism.test.ts`: exact vectors, Web Crypto parity, Unicode boundaries, canonical ordering, prohibited values, collision, rounding, distinct-input, and immutability cases.
- `scripts/verify-determinism-vectors.mjs`: two fresh processes must emit identical bytes and independently validate source vectors.
- `docs/build/DETERMINISM_CONTRACT.md`, Prompt 04 log, and handoff: ownership, versions, source mapping, limitations, outputs, and reproduction.

### Tests and negative cases

- Final full CI, governance regression, two-fresh-process runs, and diff checks are recorded in `docs/build/logs/04-determinism.txt`.
- Technical v2 source vectors A and B match their exact SHA-256 digests and IEEE-754 samples.
- The synchronous implementation matches the standardized Web Crypto digest for ASCII, empty, Unicode, canonical state, and ID material.
- NFC/NFD-equivalent strings remain byte-distinct; object insertion order is invariant; array order remains semantic; `-0` becomes `0`.
- `undefined`, functions, symbols/accessors, sparse arrays, cycles, `Date`, `Map`, `Set`, `BigInt`, NaN, and infinities fail closed.
- Derived ID collision, embedded NUL ambiguity, invalid ordinal/prefix, mutable snapshot hashing, and non-finite rounding fail closed.
- ESLint prohibits `Math.random()` and `randomUUID()` calls inside the simulation package.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-04 | Technical v2 §§11-15, 86; Domain §3.6 and §99; AM-BUILD-002 | Public deterministic APIs, source vector artifact, two-process verifier | READY_FOR_REVIEW |
| AC-004 | Technical v2 hashing/RNG/ID/rounding rules | Exact source vectors, Web Crypto comparisons, stable IDs, canonical hash, quantization, two fresh processes | PASS |

Technical v2 publishes exact random vectors but no exact ID or canonical-state output. Generated diagnostic values are not labeled source-canonical; AM-GOV-017 records the review-required interface boundaries. Prompt 04 remains unapproved until the repository owner reviews, reruns, and commits it under `AM-GOV-001`.

## AM-PB2-05 — Application ports and operation boundary

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-05

**Preflight HEAD:** `cd1a1bd516c8a00392f4115498f3ecee50ca4286`

**Prerequisite result:** PB2-04 is `ACCEPTED` by the reviewed Prompt 04 commit under `AM-GOV-001` and `AM-GOV-018`.

### Evidence produced

- `packages/application/src/ports.ts`: versioned generic `SimulationPort`, `CampaignRepository`, `ArtifactRegistryClient`, `NarrativePort`, `CampaignEditLock`, and `CampaignOperationCoordinator` public interfaces.
- `packages/application/src/operation-coordinator.ts`: per-campaign authoritative-operation serialization with injected edit locking and failure-safe release.
- `packages/application/src/testing/in-memory-adapters.ts`: deterministic test adapters for all port families, including durable-write fault injection.
- `tests/unit/application-ports.test.ts`: port delegation, dependency injection, repository isolation/failure, coordinator serialization, independent campaign concurrency, lock behavior, failure recovery, and invalid-input tests.
- `docs/build/APPLICATION_PORT_CONTRACT.md`, Prompt 05 log, and handoff: version, ownership, source mapping, proposal boundaries, exclusions, and reproduction.

### Tests and negative cases

- Final full CI, governance regression, and diff checks are recorded in `docs/build/logs/05-application-ports.txt`.
- Same-campaign operations serialize even with a pass-through edit-lock dependency; different campaigns proceed independently.
- The in-memory edit-lock adapter separately proves exclusivity and rejects double release.
- Operation and injected lease-release failures release the queue; invalid ID/kind fails before lock acquisition.
- Repository writes are cloned, missing campaigns fail explicitly, invalid revisions fail, and injected write failure leaves the prior snapshot intact.
- Simulation, artifact, and narrative behavior is dependency-injected; application code performs no simulation resolution.
- Existing UI/web-to-simulation import rejection remains green. No production browser, IndexedDB, Web Locks, cloud, or narrative adapter exists.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-05 | Technical v2 §§9-10, 13, 16-20, 23, 30, 48 | Port contract v1.0.0, serial coordinator, injected in-memory adapters | READY_FOR_REVIEW |
| AC-005 | Technical v2 §20; AM-BUILD-003 | Fault-injectable repository is prepared; atomic durable commit remains Prompt 08 | PARTIAL / NOT_RUN for atomicity |
| AC-021 | Technical v2 package boundary | Existing UI/web import firewall regression | PASS for import boundary |

No serialized command/result/projection/reference shape was invented. AM-GOV-019 records generic TypeScript-only boundaries and naming differences for review. Prompt 05 remains unapproved until the repository owner reviews, reruns, and commits it under `AM-GOV-001`.

## AM-PB2-06 — Isolated synthetic compilation fixture

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-06

**Preflight HEAD:** `df00eadb67d75fa5a43b9cce9a49f0be12f2c525`

**Prerequisite result:** PB2-03 and PB2-04 were already accepted. The repository-owner commit above accepts PB2-05 under AM-GOV-001 and is reconciled by AM-GOV-020.

### Evidence produced

- `@african-mandate/data-pipeline` exports the strict synthetic input parser, seven versioned Appendix C artifact schemas, deterministic compiler, polygon assignment, fixture-to-test initialization transform, and fail-closed production gates.
- `tests/fixtures/compilation/synthetic-fixture.json` contains only visibly synthetic square geometry, observation rows, asset, and claims; it contains no raw historical source record.
- `tests/unit/fixture-kernel.test.ts` pins parsing, artifact conformance, polygon edge/on/off behavior, missingness, cutoff, duplicate audit, order invariance, controlled hash mutation, initialization isolation, and publication rejection.
- `scripts/verify-fixture-build.mjs` executes the compiler in two fresh processes and requires byte-identical canonical files.
- `docs/build/FIXTURE_COMPILER_CONTRACT.md`, Prompt 06 log, and handoff record ownership, proposal boundaries, exact hashes, exclusions, and reproduction.

### Tests and negative cases

- Final full CI, governance regression, two-process fixture builds, and diff checks are recorded in `docs/build/logs/06-fixture-kernel.txt`.
- Missing observed values remain `null` with `missingness: MISSING`; no zero is synthesized.
- Post-`2025-09-26` rows are excluded; the `2025-09-27`–`2025-09-30` gap remains `null` with a warning.
- Repeated source-record IDs remain visible in the audit and only the stable first row is included.
- Inside/outside/boundary assignments are deterministic; boundary points are held unassigned.
- Reordering source rows leaves bytes unchanged; changing one included value changes the baseline hash.
- Compiler canonical JSON and SHA-256 output matches the accepted simulation determinism contract for representative JSON boundaries.
- TEST_ONLY publication and production `ScenarioBundle` serialization both reject the fixture.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-06 | Data & Methodology §§11–14, Appendix C; Fixture Plan v1 | Compiler contract v1.0.0, seven artifacts, fresh-process verifier | READY_FOR_REVIEW |
| AC-003 | Strict serialized parser/schema boundary | Fixture and artifact schema tests | PASS |
| AC-016 | Cutoff/gap/null behavior | Synthetic fixture audit only | STATIC_PASS synthetic; BLOCKED for real data |
| AC-017 | Duplicate grain and polygon assignment | Synthetic fixture audit only | STATIC_PASS synthetic; BLOCKED for real ACLED/GIS |
| AC-018 | Valid production polygons and map IDs | No production geometry included | BLOCKED |
| AC-019 | Production rights and dated asset status | Publish gate rejects TEST_ONLY | BLOCKED |

AM-GOV-021 records all exact compiler-only fields and policies as a review-required TEST_ONLY proposal. Prompt 06 does not claim a real Mopti baseline, complete `ScenarioBundle`, production source admission, or historical validation.

## AM-PB2-07 — Rule facts, commands and eligibility

**Status proposed:** READY_FOR_REVIEW

**Acceptance ID:** PB2-07

**Preflight HEAD:** `d84f62f36ecd53eb0fc7dd84bf6f48ca5efb7e75`

**Prerequisite result:** PB2-03 through PB2-05 were already accepted. The repository-owner Prompt 06 commit accepts PB2-06 under AM-GOV-001 and is reconciled by AM-GOV-022.

### Evidence produced

- `@african-mandate/domain` command/rule contract 1.0.0: initial closed FactKey allowlist, strict fact/rule/command/target/cost/preview/menu/preparation/postcommit schemas, and inferred types.
- `@african-mandate/simulation`: fact registry, explicit known fact source, tri-state evaluator, knowledge-safe action menu, pure command preparation, structural validator boundary, known-cost validation, duplicate classification, and postcommit hidden resolver gate.
- `tests/unit/command-rules.test.ts`: differential, schema, unknown, target, invalid action, duplicate, structural refusal, known cost, purity, and hidden-resolution timing coverage.
- `docs/build/COMMAND_RULE_CONTRACT.md`, Prompt 07 log, and handoff: ownership, versioning, exact source boundaries, downstream contract, exclusions, and reproduction.

### Tests and negative cases

- The final full CI, governance regression, focused Prompt 07 suite, and diff checks are recorded in `docs/build/logs/07-command-rules.txt`.
- Identical known facts and preview projection produce identical eligibility and preview objects despite two distinct hidden actor intentions.
- Missing facts remain explicit `unknown`; the default evaluator does not substitute `false`, `0`, or empty data. Player eligibility fails closed while preserving `ruleResult: unknown`.
- Arbitrary object-path facts, unknown FactKeys, unknown schema fields, malformed target IDs, target-count/kind violations, and missing runtime registrations fail closed.
- Unknown actions, duplicate IDs, structurally impossible terms, failed known requirements, unavailable slots, and unaffordable known costs return zero slot cost without changing campaign state.
- Hidden resolution rejects any phase other than `postcommit`; the wrapper does not claim durable commit proof before Prompt 08.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-07 | Domain §§43-54 and Appendix F.2-F.5; Technical §§13.1, 49-51, 57, 65; GDS §§17-22, 44 | Contract 1.0.0, schemas, pure evaluator/preparer, differential and negative suite | READY_FOR_REVIEW |
| AC-003 | Zod serialized-union authority | Strict FactKey, rule, command, target, cost, preview, result, and postcommit schemas | PASS |
| AC-005 | Invalid command causes no slot loss | Pure invalid-action/structural/cost preparation checks | STATIC_PASS for precommit; durable failure injection remains Prompt 08 |
| AC-006 | Duplicate command causes no duplicate effect | Duplicate ID classified zero-cost before mutation | STATIC_PASS for precommit; committed original-result behavior remains Prompt 08 |
| AC-008 | Hidden-state mutation cannot alter eligibility/forecast | Same known projection/two hidden intentions differential test | PASS |

AM-GOV-023 records all exact non-canonical wrapper fields as TEST_ONLY proposals. Prompt 07 does not implement campaign mutation, effects, durable persistence, EndTurn, production content, legal procedures, balance values, or UI behavior.

## AM-PB2-08 — initial blocked preflight (superseded)

**Historical status:** BLOCKED; superseded after the owner accepted PB2-07 and authorized implementation on 2026-10-09.

**Historical acceptance state at that preflight:** PB2-08 was blocked; AC-005 and AC-006 were NOT_RUN. The current implementation evidence below supersedes this state.

**Preflight HEAD:** `c9e65850767e2166f251f44eab7590d2908e4f3d`

**Prerequisite result:** PB2-05 is `ACCEPTED`, but PB2-07 is only `READY_FOR_REVIEW`. Its build-state entry has no approved commit or approver. Under the Build State Protocol, only `ACCEPTED` satisfies a hard prerequisite, so no Prompt 08 implementation or acceptance test was authorized.

### Evidence produced

- The working tree was clean at preflight; HEAD is the owner-authored `prompt 07` commit dated 2026-10-09 13:38:59 -04:00.
- The latest accepted milestone remains PB2-06 at `d84f62f36ecd53eb0fc7dd84bf6f48ca5efb7e75`; the current HEAD differs from it only by the documented Prompt 07 change set.
- `docs/build/BUILD_STATE.json` records PB2-07 as `READY_FOR_REVIEW` with `approvedCommit: null` and `approver: null`.
- `docs/build/handoffs/07.md` explicitly says independent owner sign-off remains pending and Prompt 08 becomes eligible only after review, rerun, and commit acceptance of Prompt 07.
- `docs/build/handoffs/08.md` records the blocker and reviewer-ready recovery steps. No application, domain, simulation, persistence, fixture, or test implementation file was changed.

### Tests and negative cases

- The mandatory Prompt 08 negative cases were **NOT RUN** because their required PB2-07 contract is not accepted: duplicate submit, rejected command, injected save failure, concurrent click/EndTurn, version mismatch, and revision mismatch.
- No claim is made for atomicity, idempotence, durable persistence, one-slot consumption, or failure-state preservation.
- Only governance validation and diff hygiene apply to this blocker-only documentation change; their actual results are recorded in `docs/build/logs/08-command-atomicity-blocked.txt`.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-08 | Technical Architecture v2 §§20–21 and 49; Reconciliation R-01/R-02; AM-BUILD-003 | Preflight and blocked handoff only; no dispatcher or persistence implementation authorized | BLOCKED by PB2-07 not `ACCEPTED` |
| AC-005 | Domain v1.1 §46; Technical v2 durable commit order | Required injected-save-failure before/after state hash test | NOT_RUN; dependent implementation blocked |
| AC-006 | Domain v1.1 §46; Technical v2 §49 | Required duplicate-command original-result/no-double-effect test | NOT_RUN; dependent implementation blocked |

The historical unblock was independent Prompt 07 acceptance. That acceptance is now recorded by AM-GOV-024, and Prompt 08 implementation resumed.

## AM-PB2-09 — premature blocked preflight (withdrawn)

**Historical local status:** withdrawn. PB2-09 remains `NOT_STARTED`; its uncommitted handoff/log were removed when PB2-08 became eligible.

**Acceptance IDs:** PB2-09; related Acceptance Matrix IDs AC-007 and AC-025 remain NOT_RUN.

**Preflight HEAD:** `078ef75a5cf38673e5f45ba04a3596e2f02beb04`

**Historical prerequisite result:** At this withdrawn preflight, PB2-08 was `BLOCKED`. Prompt 09 still requires PB2-08 to be `ACCEPTED`, so no Prompt 09 implementation was authorized.

### Evidence produced

- The working tree was clean at preflight. HEAD is the repository-owner `prompt 08` commit dated 2026-10-09 15:03:24 -04:00.
- The latest accepted milestone remains PB2-06 at `d84f62f36ecd53eb0fc7dd84bf6f48ca5efb7e75`. The accepted-to-HEAD path difference consists of the recorded Prompt 07 implementation/evidence and Prompt 08 blocker evidence; it does not contain an accepted atomic dispatcher or persistence implementation.
- `docs/build/BUILD_STATE.json` records PB2-07 as `READY_FOR_REVIEW` and PB2-08 as `BLOCKED`; neither has an approved commit or approver.
- `docs/build/handoffs/08.md` records that no atomic command dispatcher, durable repository transaction, runtime replacement, idempotent result replay, or EndTurn concurrency behavior was implemented or tested.
- The uncommitted Prompt 09 handoff/log created during that preflight were withdrawn and removed when Prompt 08 became eligible.

### Tests and negative cases

- Prompt 09 lifecycle tests were **NOT RUN** because the required PB2-08 contract is not accepted and the dependent implementation is prohibited.
- The October 2025 to February 2026 four-rollover case, final Month 20 no-advance case, mandatory-slot reserve case, final-command no-softlock case, and explicit persistence/expiry-only case all remain NOT_RUN.
- No claim is made for calendar advancement, unused-slot forfeiture, final-month completion, scheduled consequence persistence, situation/attention lifecycle, mandatory-response bounds, or resolver ordering.
- Only governance validation and diff hygiene apply to this blocker-only documentation change; actual outputs are recorded in `docs/build/logs/09-turn-engine-blocked.txt`.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-09 | Domain v1.1 §§14, 44, 47, 70–77, 96–97, 110–112; GDS v2.1 §§11, 15, 23, 75–78, 89, 105 and Appendix G | Preflight and blocked handoff only; no lifecycle contract or implementation authorized | BLOCKED by PB2-08 not `ACCEPTED` |
| AC-007 | Domain v1.1 §§14, 44, 47, 97; GDS v2.1 §§11, 15 | Required three-slot/no-rollover/calendar/final-turn lifecycle traces | NOT_RUN; dependent implementation blocked |
| AC-025 | Domain v1.1 §47; GDS v2.1 §§23, 77 and Appendix G | Required mandatory-slot reserve and last-command no-softlock adverse traces | NOT_RUN; dependent implementation blocked |

The current unblock is independent review and owner acceptance of the implemented PB2-08 change, followed by a fresh Prompt 09 preflight against that accepted commit.

The preceding PB2-09 preflight was never committed as a milestone artifact and is withdrawn by the current Prompt 08 implementation. PB2-09 remains `NOT_STARTED` pending independent acceptance of PB2-08.

## AM-PB2-08 — atomic decision commit implementation (current)

**Status proposed:** READY_FOR_REVIEW

**Acceptance IDs:** PB2-08; AC-005 and AC-006 PASS. AC-007 one-slot coverage and AC-025 operation-serialization coverage pass within Prompt 08's bounded scope; their turn/mandatory-response portions remain Prompt 09.

**Implementation base:** `078ef75a5cf38673e5f45ba04a3596e2f02beb04`

**Prerequisite result:** the repository owner explicitly accepted PB2-07 at commit `c9e65850767e2166f251f44eab7590d2908e4f3d` on 2026-10-09. `docs/build/BUILD_STATE.json` and AM-GOV-024 now record that acceptance. PB2-05 was already accepted.

### Evidence produced

- Atomic commit contract `1.0.0` and `SaveSnapshot` version `1` are documented in `docs/build/ATOMIC_COMMIT_CONTRACT.md`; exact non-canonical wrapper fields remain the review-required TEST_ONLY proposal AM-GOV-025.
- `@african-mandate/domain` publishes strict request, simulation-result, application-result, state-hash, and save-snapshot schemas.
- `@african-mandate/simulation` calculates a candidate next state without mutating current authority, applies exact known costs, creates deterministic decision/audit IDs, appends the immutable journal, marks the command processed, consumes one slot, and increments revision once.
- `@african-mandate/application` serializes the command through the accepted coordinator, validates the result, hashes the authoritative candidate state, writes the snapshot, and replaces the frozen runtime authority only after the durable write resolves.
- Unsupported effect/consequence payloads, stale revisions, version mismatches, malformed simulation output, and unapproved exact-cost semantics fail closed.

### Tests and negative cases

- Focused Prompt 08 suite: PASS, 1 file / 7 tests.
- Full repository CI: PASS, 7 files / 71 tests plus formatting, dependency, lint, type, determinism, fixture, boundary, and governance-artifact checks.
- Governance regression: the initial run exposed two stale Prompt 07 negative fixtures after acceptance; that failure is retained in the log. The fixtures now target unapproved Prompt 09 and the final suite passes 7/7.
- Duplicate submission returns the original decision identity and causes no second write, resource cost, slot use, revision, decision, or event.
- Known-rule rejection, revision mismatch, version mismatch, invalid simulation output, and injected save failure leave the prior runtime/durable state unchanged.
- Concurrent EndTurn cannot enter while the command's durable write holds the campaign operation.
- Tampering with the authoritative state hash is detected.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-08 | Domain v1.1 §§46, 123–126; Technical v2 §§19–20, 48–49, 57; Reconciliation R-01/R-02; AM-BUILD-003 | Atomic contract, domain schemas, simulation dispatcher, application commit service, focused suite, handoff, and raw log | READY_FOR_REVIEW |
| AC-005 | Domain v1.1 §46; Technical v2 §20 | Injected durable-write failure pins prior runtime hash, repository snapshot, resources, events, slots, and revision | PASS |
| AC-006 | Domain v1.1 §46; Technical v2 §49 | Duplicate command returns original decision identity with no second effect/write | PASS |
| AC-007 | Domain v1.1 §§44, 46 | Successful consequential command changes slots 3 → 2 exactly once | PARTIAL PASS; EndTurn chronology remains Prompt 09 |
| AC-025 | Technical v2 §§19–20; GDS blocking-attention rule | Command durable write and concurrent EndTurn serialize under one coordinator | PARTIAL PASS; mandatory-response lifecycle remains Prompt 09 |

Prompt 08 does not implement EndTurn resolution, non-empty effect/consequence profiles, production persistence, UI, cloud sync, recovery, or narrative. These exclusions remain visible and do not weaken the tested atomic command boundary.

PB2-08 was subsequently accepted by the repository owner at commit `6d78e4b67c5201c76e3327a597113ebfbda260d5` after the independently reproduced focused, full-CI, governance, and diff checks. AM-GOV-026 and `docs/build/BUILD_STATE.json` hold the durable acceptance record.

## AM-PB2-09 — calendar, scheduling, and attention lifecycle

**Status proposed:** READY_FOR_REVIEW

**Acceptance IDs:** PB2-09; AC-007; AC-025

**Implementation base:** accepted PB2-08 commit `6d78e4b67c5201c76e3327a597113ebfbda260d5`

### Evidence produced

- `@african-mandate/domain` now owns strict canonical lifecycle-state schemas plus versioned EndTurn request/result/trace artifacts.
- `@african-mandate/simulation` advances ISO calendar months deterministically, completes but does not advance Month 20, preserves situations/attention, expires consequences only after an explicit window, reserves known mandatory capacity, and executes an exact source-step resolver registry.
- Twenty subsystem adapters are explicitly traced as `initial_no_op`; only explicit consequence-window expiry and attention persistence have implemented adapters. No crisis, spontaneous event, world effect, or evaluation value is invented.
- `@african-mandate/application` commits EndTurn through the accepted coordinator and existing runtime/repository/snapshot authority, durably before replacing memory.
- `docs/build/TURN_LIFECYCLE_CONTRACT.md`, AM-GOV-027, this evidence, the Prompt 09 handoff, and the raw log publish ownership, versions, proposal boundaries, and reproduction.

### Tests and negative cases

- The focused affected suite passes 3 files / 24 tests.
- October 2025 rolls through November, December, January, and February exactly; every new month resets to three slots and no unused slot carries.
- Month 20 runs the resolver/final-evaluation trace, becomes completed with zero remaining slots, and retains turn/date.
- An ordinary command cannot spend a slot reserved for blocking attention; an explicit response may spend the final slot, resolves its item atomically, and then EndTurn succeeds.
- EndTurn rejects unresolved blocking attention without mutating state.
- Open situations and unresolved ordinary attention persist. Only an unresolved consequence whose explicit `latestTurn` has passed expires; a future-window consequence stays scheduled.
- Resolver removal/reordering is rejected. Initial no-op adapters are visible in the trace.
- EndTurn writes durably before runtime replacement; injected write failure preserves the prior runtime hash and durable snapshot. Duplicate EndTurn is idempotent.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-09 | Domain v1.1 sections 14, 47, 68, 73, 77, 97, 123-126; Technical v2 sections 19-20, 54-56; GDS v2.1 sections 11, 23, 76-77 | lifecycle schemas, ordered dispatcher, atomic service, contract doc, handoff, log | READY_FOR_REVIEW |
| AC-007 | Domain v1.1 sections 14, 44, 47, 97; GDS v2.1 sections 11, 15 | four-rollover, slot reset/forfeiture, and Month 20 tests | PASS |
| AC-025 | Domain v1.1 section 47; GDS v2.1 sections 23, 77 and Appendix G | mandatory reserve, blocked EndTurn, last-slot response, and bounded-capacity tests | PASS |

Exact EndTurn wrapper/trace fields, resolver IDs, application `turnCommand`, and `mandatoryResponseAttentionItemId` are TEST_ONLY design proposals under AM-GOV-027 because the sources define semantics but not those API fields. Prompt 09 remains unapproved until independent owner review and an accepting commit.

PB2-09 was subsequently accepted under AM-GOV-001/028 by repository-owner commit `201f3d3fd7ab5d5ebaf5c587f53cec47529884fd` after independent reproduction reported 24/24 focused tests, 78/78 full-CI tests, 7/7 governance tests, and a clean diff check. The TEST_ONLY and initial-no-op limitations remain unchanged.

## AM-PB2-10 — world state subsystem resolvers

**Status proposed:** READY_FOR_REVIEW

**Acceptance IDs:** PB2-10; AC-002

**Implementation base:** accepted PB2-09 commit `201f3d3fd7ab5d5ebaf5c587f53cec47529884fd`

### Evidence produced

- Strict canonical world and institution runtime schemas replace their former JSON envelopes without adding another mutable store.
- Canonical institution-resource, territory, zone, conflict, civilian, infrastructure, asset-status, and development effects apply atomically through a versioned TEST_ONLY request/result/trace contract.
- The accepted source order is preserved. Opt-in fixture adapters run only at 8a through 8d; default adapters and external environment remain visibly `initial_no_op`.
- `WORLD_SUBSYSTEM_COVERAGE` declares the sole owner, mode, and explicit production blocker for every requested subsystem.
- AM-GOV-029 records every non-canonical wrapper/trace field as a review-required test-only proposal.

### Tests and negative cases

- The focused Prompt 10 suite covers strict single ownership, immutable baseline/input, deterministic repeatability, declared multi-subsystem fixture changes, atomic cross-system/target rejection, coverage declarations, invalid infrastructure targeting, and ordered EndTurn integration.
- Synthetic values are fixed and labeled TEST_ONLY. The seed identifies the fixture and does not create effect magnitudes.
- Production coefficients, formulas, real values, adjacency propagation, shocks, event generation, and external-environment dynamics remain BLOCKED and unimplemented.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-10 | Domain v1.1 sections 17-21, 82-89 and Appendix F.7; Technical v2 sections 54-56; Data & Methodology guardrails | world schemas, effect resolver, coverage declaration, ordered fixture registry, contract doc, handoff, log | READY_FOR_REVIEW |
| AC-002 | Domain v1.1 canonical-state and derived-summary invariants | strict duplicate-owner rejection and key/ID agreement tests | PASS |

Prompt 10 remains unapproved until independent owner review and an accepting commit. Passing tests do not promote any test fixture or production dynamic.

PB2-10 was subsequently accepted under AM-GOV-001/030 by repository-owner commit `6cf2462800fc780563f819531124e69480683615` after independent reproduction reported 6/6 focused tests, 84/84 full-CI tests, 7/7 governance tests, and a clean diff check. The TEST_ONLY classification and all documented production-dynamics blockers remain unchanged.

## AM-PB2-11 — player knowledge and intelligence collection

**Status proposed:** READY_FOR_REVIEW

**Acceptance IDs:** PB2-11; AC-008; AC-009; AC-011

**Implementation base:** accepted PB2-10 commit `6cf2462800fc780563f819531124e69480683615`

### Evidence produced

- `CampaignState.knowledge` now has the exact canonical `PlayerKnowledgeState` shape, including strict typed evidence, reports, gaps, tasks, red-line/position/relationship knowledge, and known commitment/dispute IDs.
- The canonical `create_collection_task` effect creates a future-due task atomically with its decision and emits no evidence. An opt-in TEST_ONLY step-12 resolver applies declared outcomes and observations only when the task is due.
- Contradictions are derived without deleting evidence and require the same contradiction key, subject, typed claim scope, and reference interval. Different-scope records are not merged.
- Effective confidence is derived from immutable evidence and an explicit versioned TEST_ONLY freshness table. Missing factors fail closed and missing claims remain distinct from numeric zero.
- The player projection contains only campaign revision, the complete canonical player-knowledge state, and contradictions derived from it; raw hidden registries are never copied.
- `docs/build/KNOWLEDGE_COLLECTION_CONTRACT.md`, AM-GOV-031, this evidence, the Prompt 11 handoff, and the raw test log publish ownership, version, proposal boundaries, and reproduction.

### Tests and negative cases

- The focused Prompt 11 suite covers six core properties: delayed collection/no instant intelligence, all six bounded resolution outcomes, same-scope contradiction retention, deterministic freshness and missingness, hidden-state differential projection, and typed report reference integrity.
- Collection outcomes cannot emit evidence when inconclusive, delayed, or failed; useful/partial require evidence; contested requires two observations that actually form a derived contradiction.
- A task cannot resolve before its due turn. Emitted observations must be eligible and match evidence subject, claim, and reliability. Duplicate evidence is rejected atomically.
- Production coefficients, observation discovery, source-bias formulas, semantic text contradiction, real collection content, and narrative/map rendering remain BLOCKED and unimplemented.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-11 | Domain v1.1 sections 31-40, 52-53 and Appendix F.7; Technical v2 sections 45, 64-65; Package 2 content contracts | strict schemas, atomic task creation, collection resolver, confidence/contradiction derivation, projection firewall, contract doc, handoff, and log | READY_FOR_REVIEW |
| AC-009 / SIM-01 | Domain collection/evidence rules; Package 2 delayed-intelligence contract | task creation emits no evidence; due resolver emits declared evidence; all six outcomes map to canonical task/gap statuses | PASS |
| AC-008 / SIM-06 | Domain knowledge-state invariant; Technical player-projection firewall | different hidden world/actor state produces identical projection until evidence delivery | PASS |
| AC-011 / SIM-14 | Domain contradiction model; Package 2 same-scope requirement | incompatible same-scope records remain and produce a contradiction; different scope does not merge | PASS |

Prompt 11 remains unapproved until independent owner review and an accepting commit. Passing synthetic tests does not approve production confidence values, collection content, or hidden-state disclosure.

PB2-11 was subsequently accepted under AM-GOV-001/032 by repository-owner commit `571d5b287c88f872811c0fd46b02b8b9957027c3` after independent reproduction reported a frozen install, 7/7 focused tests, 91/91 full-CI tests, 7/7 governance tests, and a clean diff check. The TEST_ONLY classification and all documented production-content and coefficient blockers remain unchanged.

## AM-PB2-12 — actor relationships, positions and memory

**Status proposed:** READY_FOR_REVIEW

**Acceptance IDs:** PB2-12; AC-010 / SIM-02

**Implementation base:** accepted PB2-11 commit `571d5b287c88f872811c0fd46b02b8b9957027c3`

### Evidence produced

- `CampaignState` now owns strict actor, directional-relationship, issue-position, memory, and red-line registries; no parallel mutable store was added.
- Canonical `create_memory`, relationship-adjustment, and position-change effects are exposed through versioned TEST_ONLY templates and profiles. Memory relationship effects apply once during atomic creation and are retained as audit data, not replayed every turn.
- Consultation repetition requires an explicit interaction tag, cooldown, repeat relationship effect, and fatigue delta. The fixed fixture gives no repeat relationship gain and increases fatigue, so repeated diplomacy cannot farm support.
- Conditional adaptation runs only through an opt-in TEST_ONLY source-step-7 adapter, clamps canonical scores, enforces directional/holder ownership, and records a once-only domain event.
- Red-line discovery requires existing evidence and writes only knowledge status. Hidden actor intent, position stance, and red-line rules remain absent from player projection.
- `docs/build/ACTOR_MEMORY_CONTRACT.md`, AM-GOV-033, this evidence, the Prompt 12 handoff, and the raw log publish ownership, version, proposal boundaries, and reproduction.

### Tests and negative cases

- Reverse relations are not inferred; duplicate direction ownership is invalid; a reverse-direction effect is rejected without changing input.
- A consultation creates one memory and applies its relationship/fatigue effect once. Duplicate command submission is inert. A repeated consultation creates auditable memory but uses the explicit zero-gain/increased-fatigue repeat profile.
- Hidden intent and stance changes leave the player-knowledge projection byte-equivalent.
- Red-line discovery rejects missing or different-party evidence and never reveals the trigger rule.
- Eligible adaptation changes multiple actor subsystems, an ineligible actor stays unchanged, all numeric state is bounded, duplicate plan references are invalid, and an applied adaptation key cannot run again.
- Production intent, stance, balance values, adaptation formulas, salience/decay, real-person claims, and unified AES positions remain BLOCKED and unimplemented.

### Source-to-test traceability

| Acceptance ID | Source authority | Contract / evidence | Test state |
|---|---|---|---|
| PB2-12 | Domain v1.1 sections 20-29, 100 and Appendix F.7; Package 1 actor registry sections 5-7 | strict schemas, atomic memory, directional lookup, discovery firewall, adaptation resolver, contract doc, handoff, and log | READY_FOR_REVIEW |
| AC-010 / SIM-02 | Domain memory-effect rule and actor adaptation; Package 1 non-farming rule | once-only consultation effect, duplicate-command inertness, and explicit repeat policy | PASS |

Prompt 12 remains unapproved until independent owner review and an accepting commit. Passing synthetic tests does not approve production profiles, factual intentions, or real institutional positions.
