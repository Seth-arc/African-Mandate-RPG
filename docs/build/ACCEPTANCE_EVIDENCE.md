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
