# Workspace package graph

**Contract version:** 1.0

**Task:** AM-PB2-02

**Classification:** ACCEPTED TEST_ONLY workspace infrastructure; Prompt 06 is ACCEPTED; Prompt 07 command/rule layer is READY_FOR_REVIEW

## Dependency direction

```text
domain
├── simulation
│   └── application
│       ├── ui
│       │   └── web
│       └── web
├── application
├── content
├── data-pipeline
├── ui
└── web

tooling (build/verification only; no runtime dependency)
```

The repeated arrows from `domain` show direct contract imports. `application` may consume the public `simulation` API; `ui` and `web` may not. Every package is private, ESM-only, TypeScript-source-first, and exposes only its root `exports["."]` entry.

## Public roots and allowed internal dependencies

| Workspace | Public root | Allowed internal imports | Ownership |
|---|---|---|---|
| `packages/domain` | `@african-mandate/domain` | none | Serialized contracts, domain types, command/rule/preview schemas, and the determinism-vector artifact schema |
| `packages/simulation` | `@african-mandate/simulation` | `domain` | Deterministic primitives plus pure fact/rule evaluation, knowledge-safe menu construction, command preparation, and the postcommit hidden-resolution gate |
| `packages/application` | `@african-mandate/application` | `domain`, public `simulation` API | Versioned operation/port boundary, serial coordinator, and in-memory TEST_ONLY adapters; no production browser adapter |
| `packages/data-pipeline` | `@african-mandate/data-pipeline` | `domain` | TEST_ONLY synthetic fixture parser/compiler and versioned artifact schemas; no production source admission or GIS tool selected |
| `packages/content` | `@african-mandate/content` | `domain` | Authored-content boundary; no content compiled |
| `packages/ui` | `@african-mandate/ui` | `domain`, `application` | Presentation-only boundary; simulation and raw state forbidden |
| `apps/web` | `@african-mandate/web` | `domain`, `application`, `ui` | Knowledge-safe shell boundary; no React/browser behavior yet |
| `packages/tooling` | `@african-mandate/tooling` | none | Build and verification boundary; owns the toolchain artifact schema |

## Enforced restrictions

- Deep imports such as `@african-mandate/domain/internal` are forbidden; callers use public package roots.
- Normal UI and web code cannot import `@african-mandate/simulation`, raw campaign stores, or debug projections.
- Domain cannot import another workspace package.
- Content and data-pipeline can import only domain.
- Package exports expose only their public roots. Domain schemas, pure simulation determinism/rule/command-preparation primitives, and an isolated synthetic fixture compiler are implemented. Prompt 07 does not mutate campaign state or perform a durable commit; production reducer, persistence, balance, source admission, legal, map, narrative, and UI behavior remain outside this milestone.

`tests/fixtures/forbidden-import/web-imports-simulation.ts` deliberately violates the UI firewall. `scripts/verify-forbidden-import.mjs` passes only when ESLint rejects that fixture with `no-restricted-imports`.

## Toolchain and unresolved choices

Exact runtime/tool versions are in `toolchain.json`, validated against `packages/tooling/schemas/toolchain.schema.json`, and dependency integrity is frozen in `pnpm-lock.yaml`. Browser matrix, basemap provider, and GIS tools remain explicitly `null`/empty and unapproved.
