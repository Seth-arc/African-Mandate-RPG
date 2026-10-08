# African Mandate repository audit

**Task:** AM-PB2-00  
**Prepared:** 2026-10-08  
**Repository:** `C:\Users\ssnguna\Local Sites\African-Mandate-RPG`  
**Base SHA:** `32686631558322be6757f2b6809acd83b255453b` (`initial documentation commit`)  
**Status recommendation:** Reviewed
**Acceptance:** Not granted; PB2-00 remains pending independent verification and owner approval.

## Preflight

- Local branch: `main`.
- Upstream: `origin/main` at `https://github.com/Seth-arc/African-Mandate-RPG.git`.
- Other visible local branches: none.
- Commit history visible locally: one commit, `3268663` dated 2026-10-08.
- Pre-existing working-tree change: `docs/DESIGN_STANDARDS.md` was untracked at preflight; the owner subsequently confirmed it as the official project design standard for inclusion with Prompt 00.
- Prior accepted milestone: none recorded.
- `docs/build/BUILD_STATE.json`: absent.
- Latest accepted handoff: absent.
- Root `AGENTS.md`: absent. The only repository instruction file is scoped inside `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/AGENTS.md`; Promptbook rules also explicitly require it for proposed implementation work.

Prompt 00 has no prerequisite gate, so this audit can proceed independently. Prompts 01-29 remain gated because Prompt 00 has not been independently accepted.

## Repository purpose and intended workflow

African Mandate is specified as a deterministic, turn-based strategic governance simulation. The player is an African Union Strategic Envoy who observes incomplete evidence, adopts assessments, builds coalitions and mandate authority, commits bounded strategic actions, coordinates implementation, and reassesses delayed consequences. The initial scenario is limited to Mali, Burkina Faso, Niger, Chad, and Mauritania.

The intended player loop is:

`Observe -> Assess -> Build Mandate -> Decide -> Implement -> Reassess`

The authoritative simulation must keep definitions, observed baseline, hidden truth, player knowledge, and presentation distinct. Given identical pinned versions, seed, and ordered commands, authoritative output must replay identically. Narrative AI is presentational only and must not choose state, probabilities, authority, or scores.

## Repository structure as found

| Area | Present state | Classification |
|---|---|---|
| `docs/` | Domain, architecture, methodology, game design, scenario authoring, validation, writing, and design materials | Implemented documentation; mixed canonical, approved-in-part, proposed, and authoring-only authority |
| `data/` | Nine supplied data/metadata artifacts | Present but unreviewed; not admitted to a production baseline |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/` | Governance proposals, contracts, roadmap, acceptance matrix | BUILD_PROPOSAL, not accepted implementation evidence |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/` | Thirty prompts, protocol, templates, traceability | BUILD_PROPOSAL task queue; every prompt status is pending |
| `docs/validate_authoring.py` | Small Python static authoring check | Implemented but NOT_RUN and not a simulation test |
| `docs/authoring_fixtures.json` | Seven TEST_ONLY script templates | TEST_ONLY, incomplete versus the sixteen SIM cases |
| Application/runtime source | Absent | NOT_IMPLEMENTED |
| Package/toolchain manifests | Absent | NOT_IMPLEMENTED / unpinned |
| Automated test suite | Absent | NOT_IMPLEMENTED |
| CI workflows | Absent | NOT_IMPLEMENTED |
| Deployment/runtime configuration | Absent | NOT_IMPLEMENTED |

## Intended stack versus repository reality

The Technical Architecture specifies TypeScript, ESM, pnpm workspaces, React/Vite, React Router, Zustand, Zod, MapLibre, PMTiles, pure TypeScript simulation, IndexedDB, Supabase, Vitest, Playwright, GitHub Actions, ESLint, and Prettier.

The repository contains none of the files that would instantiate that stack:

- no root `README.md`;
- no `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, or TypeScript configuration;
- no exact Node, pnpm, TypeScript runner, or GIS version pins;
- no `apps/`, `packages/`, `scenarios/`, `source-data/`, `generated/`, `supabase/`, or `scripts/` implementation trees;
- no `.github/workflows/`;
- no `.env.example`;
- no dependency definitions, API endpoints, database schemas, migrations, authentication implementation, storage adapters, or deployment definitions.

The Promptbook asks for original canonical specifications under `docs/source/`, but that directory is absent and the supplied specifications are directly under `docs/`. This audit hashes the files where they actually exist and does not move or duplicate them. Prompt 01 must record the accepted canonical-location policy before later agents rely on `docs/source/`.

Accordingly, the current repository is a specification, planning, and source-data corpus. It is not an executable game repository.

## Implementation and evidence classification

### Implemented

- Versioned specification and authoring documents.
- Build-preparation and promptbook documents.
- Supplied data files and internal metadata.
- Presentation tokens and design/copy references.
- A 25-line Python authoring validator.
- A TEST_ONLY fixture containing seven static scenario templates.

“Implemented” here means the file exists. It does not mean its behavior, accuracy, approval, or production suitability has been verified.

### Tested

Nothing is execution-verified by this audit. No application tests, builds, compiler runs, migrations, services, or validation scripts were run. The Acceptance Matrix explicitly initializes implementation checks as `NOT_RUN` or `BLOCKED`, and the Package 4 validation document says no headless engine was built or run.

### Proposed

- The monorepo layout and CI command names.
- All serialized Zod surfaces and package APIs.
- Deterministic primitives, command dispatcher, persistence, projections, UI, narrative adapter, compiler, and leaderboard verifier.
- Stage 2 action, actor, evidence, event, balance, and authorization content not explicitly approved upstream.
- Synthetic one-zone compilation and four-month headless test slice.

### Unknown or blocked

- Exact toolchain versions and compatibility policy.
- Approved geographic source, edition, administrative level, stable zone crosswalk, and rights.
- ACLED extract completeness and duplicate row/event grain.
- Usable spatial displacement data.
- Historical 2025 operating status for infrastructure supplied from later inventories.
- Source-native finance files and finance admission rules.
- Licensing and redistribution decisions.
- Real actor stances, balance constants, and formal authorization procedures.
- Evaluation formulas, five candidate UI projections, leaderboard composite, ties, and cohorts.
- Supported browsers, viewports, performance benchmark, hosting, telemetry, and narrative provider.

## Main workflow trace

There is no executable path to trace. The specified future path is:

1. React UI reads only knowledge-safe player projections.
2. UI submits a typed command through the application service.
3. The operation coordinator serializes campaign mutations and calls the simulation port.
4. The deterministic simulation validates known eligibility, applies closed typed effects, records events, consumes a decision slot, and produces next state.
5. The application hashes and durably writes the snapshot before replacing in-memory authoritative state.
6. Projections rebuild for the UI; optional cloud sync and narrative happen after local durability.
7. `EndTurn` resolves ordered world systems and advances the calendar.

None of these runtime layers currently exists. They are contracts only.

## Consequential findings

### 1. The repository is pre-bootstrap

Promptbook PB2-00 is pending, Gate A is not accepted, and even the exact toolchain remains undecided. Creating gameplay code before audit/governance acceptance would bypass the repository's own dependency order.

### 2. The owner supplied the missing design standard outside the base commit

Build Preparation and Source Precedence say `DESIGN_STANDARDS.md` was not supplied in the earlier corpus. The file now exists with SHA-256 `39755e3cbd573e8682970d2aefd1a98a7b53b9cb935611e6fd17bafdbfe21bb4`, and the owner confirmed it as the official project design standard for inclusion with Prompt 00. Its content remains subordinate to higher-precedence sources. The audit did not alter its bytes.

### 3. The only script is disconnected by default

`docs/validate_authoring.py` sets `root` to `docs/` but resolves its default gameplay source through `root.parent`, which points to a non-existent root-level specification path. The actual source is under `docs/`. The script may be usable with an explicit argument, but it was not run. This is an observed static defect, not fixed under Prompt 00.

### 4. Static authoring fixtures are incomplete by design

`docs/authoring_fixtures.json` contains SIM-01, 02, 03, 04, 05, 07, and 10. It explicitly lists SIM-06, 08, 09, and 11-16 as unencoded. Even a successful static authoring check would not prove command behavior or any SIM acceptance case.

### 5. Production data gates are material

The supplied ACLED extract is documented as inadequate for representative five-country coverage; IDMC geometry has no usable features; the continental map is not an approved administrative registry; later infrastructure inventories cannot be backdated into 2025 truth; and source licensing has not been approved. Missing data must remain unknown, never zero.

### 6. Documentation contains an intentional date precedence conflict

Reconciliation R-10 proposes that campaign dates were open and mentions a 2026 start. The later approved Data & Methodology decisions control: historical conflict anchor `2025-09-26`, simulation start `2025-10-01`, and five-country scope. Derivative text should eventually be reconciled through governance, not silently edited during this audit.

### 7. Leaderboard implementation is blocked by architecture governance

Game Design requires verified comparison, while Domain v1.1 treats server-authoritative competition as outside the original v1 architecture. The supplied ADR is PROPOSED. No leaderboard service should be implemented until an approved versioned amendment and scoring/cohort rules exist.

### 8. Canonical source location is not yet reconciled

Promptbook v2 directs owners to place original sources under `docs/source/`; the actual source corpus is directly under `docs/`. Moving or duplicating it during an audit could create a second source of truth, so the discrepancy is recorded for Prompt 01 instead.

## Source-to-test and acceptance traceability

| Source area | Contract evidenced | Future acceptance | Current evidence |
|---|---|---|---|
| Domain §0; Build Constitution | Truth layers, atomicity, deterministic authority, non-invention | AC-001 through AC-015 as applicable | NOT_RUN |
| Data & Methodology §§2-6 | Dates, five countries, missingness, geography/source admission | AC-016, AC-017, AC-018, AC-019 | BLOCKED for real data |
| Reconciliation R-01 through R-07 | Commit semantics, player role, campaign bounds, indicator separation | AC-001, AC-007, AC-008, AC-024 | NOT_RUN / AC-024 BLOCKED |
| Stage 2 Package 4 | SIM-01 through SIM-16 scenario expectations | AC-005 through AC-016, AC-020, AC-025 | No simulation run; seven static scripts only |
| Technical Architecture v2 | Package firewall, durable commit, hashing, replay, persistence | AC-002 through AC-005, AC-015, AC-020, AC-021 | NOT_RUN |
| Reconciliation leaderboard addendum and proposed ADR | Trusted replay comparison boundary | AC-026 | BLOCKED |
| Prompt 00 and source manifest | Repository/source inventory and missing artifacts | PB2-00 | READY_FOR_REVIEW proposed; independent verification pending |

No AM-ACT identifier exists in the supplied Acceptance Matrix; its identifiers are `AC-001` through `AC-026`. Promptbook PB2-00 asks for “precise AM-ACT IDs,” which is inconsistent with the actual matrix. This audit cites the identifiers that exist and records the naming mismatch for Prompt 01 governance review.

## Files and areas inspected

- Entire repository file inventory excluding `.git` internals.
- Git root, branch, remote, status, and local commit history.
- Promptbook governance, Prompt 00, templates, and acceptance traceability.
- Build Preparation instructions, constitution, contract inventory, roadmap, open decisions, bootstrap, and acceptance matrix.
- Domain §0 and main gameplay/implementation sections used to establish purpose and workflow.
- Technical Architecture authority, stack, package boundaries, command flow, and durability contracts.
- Data & Methodology source inventory and gates.
- Reconciliation, Stage 1, Stage 2 implementation, and Package 4 validation records.
- Static authoring utility and fixture.
- Design/presentation inventory and supplied data metadata.

Not deeply validated: every row or geometry in large CSV/GeoJSON sources, XLSX workbook internals, external source terms, remote service state, or runtime behavior. Those require later bounded tasks and approvals.

## Next exact task

After an independent reviewer verifies this manifest and the owner accepts PB2-00, execute Prompt 01, “Build governance and approval state.” That task should establish `BUILD_STATE.json`, the versioned decision ledger, durable acceptance state, and explicit owner decisions without initializing the application workspace or inventing unresolved values.

Prompt 02 must remain blocked until Prompt 01 is ACCEPTED and exact toolchain versions are owner/team selected.
