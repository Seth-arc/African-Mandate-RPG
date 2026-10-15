# Workspace package graph

**Contract version:** 1.0

**Task:** AM-PB2-02

**Classification:** ACCEPTED TEST_ONLY foundations through Prompt 24; Prompt 25 production source admission is READY_FOR_REVIEW

## Dependency direction

```text
domain -> simulation -> application -> ui -> web
domain -> application
domain -> content
domain -> data-pipeline
domain -> web
application -> web

tooling (build/verification only; no runtime dependency)
headless (TEST_ONLY acceptance only) -> domain, simulation, application, content, data-pipeline, narrative
```

Arrows show direct contract imports. `application` may consume the public `simulation` API; `ui` and `web` may not. `ui` has no direct domain import. Every package is private, ESM-only, TypeScript-source-first, and exposes only its root `exports["."]` entry.

## Public roots and allowed internal dependencies

| Workspace | Public root | Allowed internal imports | Ownership |
|---|---|---|---|
| `packages/domain` | `@african-mandate/domain` | none | Serialized contracts, domain types, typed lifecycle/world state and effects, command/EndTurn/world request/results, save snapshots, and deterministic artifacts |
| `packages/simulation` | `@african-mandate/simulation` | `domain` | Deterministic primitives, pure command/world-effect logic, mandatory-capacity rules, exact calendar, and ordered lifecycle resolver registry |
| `packages/application` | `@african-mandate/application` | `domain`, public `simulation` API | Versioned ports, atomic services, verified immutable-artifact client, IndexedDB repository, Web Locks edit lock, sync status, narrative fallback, projection facade/cache, TEST_ONLY map/document projections and decision-workflow coordinator |
| `packages/data-pipeline` | `@african-mandate/data-pipeline` | `domain` | TEST_ONLY synthetic fixture compiler plus Prompt 25 owner-selected production-source schemas, audits and compilation gate; no production baseline compiled |
| `packages/content` | `@african-mandate/content` | `domain` | Versioned four-month TEST_ONLY compiled artifact, strict cross-reference schema, branch inventory and hard production rejection; no production content admitted |
| `packages/headless` | `@african-mandate/headless` | `domain`, public `simulation`, `application`, `content`, `data-pipeline`, `narrative` APIs | Independent TEST_ONLY SIM-01…SIM-16 goldens, deterministic sample/replay runner and blocked-production-gate report; not a production runtime dependency |
| `packages/ui` | `@african-mandate/ui` | `application` | Projection-only React presentation boundary, TEST_ONLY shell/map/document/decision components, MapLibre host and canonical-token stylesheet; domain, simulation, and raw state forbidden |
| `apps/web` | `@african-mandate/web` | `domain`, `application`, `ui` | Knowledge-safe React/Vite shell host and fixed TEST_ONLY browser fixtures; no simulation import |
| `packages/tooling` | `@african-mandate/tooling` | none | Build and verification boundary; owns toolchain plus TEST_ONLY editorial audit, measurement and human-approval schemas |

## Enforced restrictions

- Deep imports such as `@african-mandate/domain/internal` are forbidden; callers use public package roots.
- Normal UI cannot import domain, simulation, headless tooling, raw campaign stores, or debug projections. Web cannot import simulation, headless tooling, raw campaign stores, or debug projections.
- Domain cannot import another workspace package.
- Content and data-pipeline can import only domain. Prompt 18 keeps the compiled artifact in content. Prompt 25 admits pinned sources for later compilation without creating a baseline. The Prompt 19 `headless` integration package may consume public package roots solely for TEST_ONLY acceptance and is not imported by production packages.
- Package exports expose only their public roots. Prompt 20 adds application-owned IndexedDB/Web Locks, revision-aware sync status, verified JSON artifact loading, knowledge-safe projections, and deterministic narrative failover without moving simulation ownership. Prompt 21 adds projection-derived shell/status rendering. Prompt 22 adds only an immutable synthetic map/document projection and UI. Prompt 23 adds a projection-only decision coordinator/UI and fixed browser script; simulation ownership does not move into UI/web. Prompt 24 adds build-time editorial/token audits and typed evidence records in tooling; UI/web still do not depend on tooling at runtime. Cloud transport, approved fallback lease constants, production artifact publication/source admission and production UI certification remain outside these milestones.

`tests/fixtures/forbidden-import/web-imports-simulation.ts`, `ui-imports-domain.ts`, and `ui-imports-simulation.ts` deliberately violate the projection firewall. `scripts/verify-forbidden-import.mjs` passes only when ESLint rejects all three fixtures with `no-restricted-imports`.

## Toolchain and unresolved choices

Exact runtime/tool versions are in `toolchain.json`, validated against `packages/tooling/schemas/toolchain.schema.json`, and dependency integrity is frozen in `pnpm-lock.yaml`. Prompt 22 pins `maplibre-gl@6.13.0`; Prompt 25 selects the pinned Natural Earth layer in `data/african_map.json` but does not introduce a PMTiles publication process or new GIS dependency.
