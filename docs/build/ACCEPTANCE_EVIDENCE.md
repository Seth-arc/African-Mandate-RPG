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
