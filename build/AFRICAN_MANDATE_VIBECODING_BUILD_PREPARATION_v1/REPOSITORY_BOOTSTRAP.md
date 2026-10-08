# Repository & Agent Bootstrap Plan v1
**Status:** Proposed future repository layout (not presently installed/created as an executable codebase).

## Proposed layout
```
/apps/web/                     # projection-only React/Vite interface
/packages/domain/              # Zod source-of-truth contracts, IDs and data types
/packages/simulation/          # pure deterministic engine, reducers, keyed random
/packages/application/         # operation coordinator and app ports
/packages/projection/          # knowledge-safe selectors/read-models
/packages/data-pipeline/       # sourced compiler, GIS allocation, audits
/packages/content/             # authored data schema/compile validators
/packages/persistence/         # IndexedDB, local revisions, recovery
/packages/ui/                  # registered components and tokens
/packages/testing/             # golden vectors/headless scripts
/scenarios/sahel-2025/         # immutable scenario source, NO placeholder production ID
/fixtures/synthetic/          # TEST-only data and expected hashes
/docs/adr/                     # approved architecture decisions
/docs/specs/                   # pinned reference editions
/.github/workflows/            # reproducible CI
```
The boundary details must be aligned with Technical Architecture v2 package graph before creating package exports. Treat exact folder allocation above as proposed staging, not a new approved architecture.

## Tooling selection decisions to pin at bootstrap
- Supported exact Node LTS version, pnpm version, lockfile and ESM/TypeScript execution tool.
- Vite/Vitest, Zod, ESLint restricted imports and strict TS config; formatter and CI platform.
- MapLibre/PMTiles/approved map hosting and pinned GIS binaries/container digest when map build begins.
- IndexedDB storage adapter and test port; Playwright browser/device matrix requires owner signoff.
- For cloud play/server verification, identity and hosting providers remain open; do not choose these to unblock kernel work.

## Proposed CI sequence
1. `format:check` and `lint` including forbidden imports.
2. `typecheck` all packages and parse public serialized fixtures.
3. `test:determinism` for hash/random/IDs/rounding and fixed vectors.
4. `test:domain` for range, references, missingness, rule tri-state and effect exhaustiveness.
5. `test:application` for atomicity/durable-write failure, command duplicate, EndTurn and locks.
6. `test:projection` for differential hidden-state leak and narrative fallback.
7. `test:fixture` for time/geometry/dedup/source provenance/immutable output hashes.
8. `test:headless` for SIM cases as implemented; never mark unimplemented ones passed.
9. `test:ui` Playwright with accessibility, only after UI exists.
10. `test:release` checks no TEST_ONLY or pending IDs in production output; license/historical approval checklist (human signatures required).
Script names are proposed acceptance names until actual `package.json` binds them.

## Ownership and permissions
Domain/technical leads approve state or engine-contract changes; data/GIS leads approve geography, temporal source and licences; scenario/system owner approves scenario parameters; institutional reviewer approves authorization procedures; UX/content reviewers approve presentation/voice; security/backend owner approves verified leaderboard boundary. An agent may implement a previously approved contract but does not self-approve any of these roles.
