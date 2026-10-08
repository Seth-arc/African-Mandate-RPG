# African Mandate
## Technical Architecture & Implementation Blueprint v2

**Document type:** Canonical implementation architecture and review record  
**Status:** v2.0 draft  
**Supersedes:** `AFRICAN_MANDATE_TECHNICAL_ARCHITECTURE_v1.md`  
**Depends on:** `African_Mandate_Domain_Model_Simulation_Spec_v1_1.md`  
**Architecture posture:** Greenfield  
**Primary scenario:** Sahel  
**Purpose:** Resolve implementation ambiguities in Technical Architecture v1 and define a build contract precise enough for human engineers and coding agents to implement without inventing architectural rules.

---

# Part I — Review of Technical Architecture v1

## 1. Review method

Technical Architecture v1 was reviewed against:

1. its own stated architectural goals;
2. the Greenfield Domain Model & Simulation Specification v1.1;
3. deterministic replay requirements;
4. hidden-information requirements;
5. persistence and recovery requirements;
6. content/data reproducibility requirements;
7. map/runtime separation;
8. AI-presentational-only requirements;
9. build and deployment reproducibility;
10. the requirement that coding agents not invent architectural decisions.

The findings below distinguish between:

- **Resolved in v2** — the architecture itself can determine a safe answer without stakeholder policy input;
- **Open question** — multiple valid options exist and stakeholder/product input is required.

---

# 2. Issue Audit

## Issue 1 — The “Application Layer” exists conceptually but not structurally

**v1 references:** Sections 2, 3, 9, 10, Appendix A.

**Relevant v1 text:**

> `domain ↑ simulation ↑ application ↑ web`

and:

> “Commands flow through an application service.”

but the repository layout contains no application package, while Appendix A permits:

> “web application … Yes via public API” to `simulation`.

### Why this is problematic

The architecture describes the application layer as a hard boundary but implements it only as files inside the web application. A coding agent could legitimately:

- import `simulation` directly from React;
- bypass persistence orchestration;
- bypass the command queue;
- couple UI to simulation internals.

This weakens one of the most important boundaries in the design.

### Revision

Create a dedicated:

```text
@african-mandate/application
```

workspace package.

The web application depends on `application`, not directly on `simulation`, except for explicitly isolated developer tooling and the simulation host adapter.

`application` defines ports for:

- simulation execution;
- persistence;
- artifacts;
- narrative;
- edit locking.

**Status:** Resolved in v2.

---

## Issue 2 — Toolchain versions are described as “project-pinned” but the pinning mechanism is unspecified

**v1 reference:** Section 1.

**Relevant v1 text:**

> “Runtime/tooling | Project-pinned current supported Node.js LTS”

### Why this is problematic

“Project-pinned” is an intention, not an implementation requirement.

Different Node, pnpm, GIS tool, or lockfile versions can produce:

- different dependency graphs;
- different generated data;
- different bundle behavior;
- CI/local inconsistencies.

### Revision

Require:

- exact Node version in repository tooling metadata;
- exact pnpm version in `packageManager`;
- committed `pnpm-lock.yaml`;
- CI installation with frozen lockfile;
- pinned versions/checksums for external GIS binaries or container images;
- a toolchain manifest emitted into build metadata.

The specification does not hard-code a Node version because that value should be chosen when the repository is created and deliberately upgraded later.

**Status:** Resolved in v2.

---

## Issue 3 — Workspace module format and package execution model are unspecified

**v1 references:** Sections 4–7.

**Relevant v1 text:**

> “Each package MUST expose a deliberate public API.”

but it does not say whether internal packages:

- compile to `dist`;
- publish ESM or CommonJS;
- are source-consumed by Vite;
- use project references;
- are executed directly by Node.

### Why this is problematic

Coding agents can create incompatible package configurations, duplicate build pipelines, or mix CommonJS and ESM.

### Revision

For v2:

- all workspace code is ESM;
- internal packages are private source packages, not npm-published packages;
- Vite/Vitest consume TypeScript source through workspace exports;
- Node-side build/CLI scripts execute TypeScript through one pinned TS execution tool;
- `tsc --noEmit` provides typechecking;
- web production code is bundled by Vite;
- Supabase Edge code must use Web-standard/Edge-compatible modules.

If the project later publishes packages, that is a separate ADR.

**Status:** Resolved in v2.

---

## Issue 4 — Zod and TypeScript can drift because no schema authority is defined

**v1 reference:** Section 8.

**Relevant v1 text:**

> “Zod is used at boundaries…”

### Why this is problematic

v1 does not specify whether:

- Zod schemas derive from TypeScript;
- TypeScript types derive from Zod;
- both are maintained manually.

Manual duplication is a predictable source of save/content contract drift.

### Revision

Serialized/external contracts use **Zod as the executable source of truth** and infer TypeScript types using `z.infer`.

Examples:

- save snapshots;
- scenario bundles;
- baseline manifests;
- environment configuration;
- narrative responses;
- compiled content artifacts.

Algorithm-only internal interfaces MAY remain TypeScript-only.

**Status:** Resolved in v2.

---

## Issue 5 — Simulation-created entity ID generation is missing

**v1 references:** deterministic replay sections 27–31; no ID-generation section exists.

### Why this is problematic

The Domain Model requires stable opaque IDs.

If new:

- memories;
- consequences;
- events;
- collection tasks;
- mandate cases;

use `crypto.randomUUID()` during simulation, replaying the same campaign produces different state hashes.

### Revision

Define two ID classes.

**External command IDs**

Generated by the application using UUID/random ID before dispatch and persisted in replay history.

**Simulation-derived IDs**

Generated deterministically:

```text
SHA-256(
  campaignSeed
  + "\0"
  + entityType
  + "\0"
  + resolutionKey
  + "\0"
  + ordinal
)
```

Use the first 96 bits encoded as lowercase hex after a domain prefix.

Example:

```text
consequence_a41c...
```

Collision detection is mandatory; a collision is an invariant failure.

**Status:** Resolved in v2.

---

## Issue 6 — Deterministic random sampling is not sufficiently specified

**v1 reference:** Section 28.

**Relevant v1 text:**

> “Take the first 53 usable bits and normalize into `[0,1)`.”

### Why this is problematic

“First 53 usable bits” leaves open:

- byte order;
- exact bits;
- encoding;
- integer conversion;
- normalization denominator.

Two implementations could disagree while both claim conformance.

### Revision

v2 freezes the algorithm:

1. UTF-8 encode `campaignSeed + "\0" + resolutionKey`;
2. SHA-256;
3. read the first 56 bits as an unsigned **big-endian** integer;
4. shift right three bits;
5. divide by `2^53`.

The implementation must pass fixed test vectors included in v2.

**Status:** Resolved in v2.

---

## Issue 7 — Canonical state hashing is underspecified

**v1 reference:** Section 30.

**Relevant v1 text:**

> “Use canonical JSON serialization.”

### Why this is problematic

v1 does not define:

- ordering;
- `-0`;
- undefined fields;
- non-finite numbers;
- arrays;
- Maps/Sets;
- Dates;
- BigInt.

A hash used for replay verification requires exact canonicalization.

### Revision

Authoritative state is restricted to JSON-safe values.

Canonicalization rules:

- `null`, boolean, string, finite number, arrays, plain objects only;
- `undefined`, functions, `Date`, `Map`, `Set`, `BigInt`, `NaN`, infinities prohibited;
- normalize `-0` to `0`;
- object keys sorted lexicographically;
- arrays preserve semantic order;
- unordered domain collections must be normalized before insertion;
- UTF-8 bytes are SHA-256 hashed.

**Status:** Resolved in v2.

---

## Issue 8 — Numeric rounding and quantization are unspecified

**v1 references:** Sections 20, 82–85, deterministic requirements.

### Why this is problematic

Many formulas multiply modifiers.

If modules independently:

- round early;
- round late;
- floor;
- use JavaScript `Math.round`;

results can differ materially.

### Revision

Define canonical numeric helpers.

Authoritative `Score`, counts, work units, and money are integers.

Formula modules may use local floating-point intermediates but commit through:

```text
roundHalfAwayFromZero
```

followed by type-specific clamping.

Probabilities remain `[0,1]` floating values and are never accumulated as scores.

**Status:** Resolved in v2.

---

## Issue 9 — Application commands can race

**v1 references:** Sections 9–13.

### Why this is problematic

The command service is asynchronous but v1 never states what happens if the player:

- double-clicks;
- submits a second action while the first save is pending;
- clicks End Turn during another command;
- triggers two React handlers concurrently.

### Revision

Introduce an application-level **CampaignOperationCoordinator**.

For each active campaign:

- one authoritative simulation operation at a time;
- strategic commands and End Turn are serialized;
- duplicate UI submissions are rejected/debounced;
- narrative requests never hold the operation lock;
- cloud synchronization never mutates local simulation state.

**Status:** Resolved in v2.

---

## Issue 10 — Save ordering relative to state replacement is ambiguous

**v1 reference:** Section 10.

**Relevant v1 sequence:**

> “replace the authoritative state atomically; trigger autosave”

### Why this is problematic

A browser crash after state replacement but before durable local save can lose the accepted decision.

### Revision

A successful player operation commits in this order:

```text
simulate next state
→ validate/hash
→ durable local write
→ replace in-memory campaign
→ enqueue cloud sync
→ request optional narrative
```

A strategic operation is not considered committed until the local durable write succeeds.

**Status:** Resolved in v2.

---

## Issue 11 — “Cloud canonical” and offline/failed cloud saves are not reconciled

**v1 reference:** Section 62.

**Relevant v1 text:**

> “Authenticated/cloud campaign — Cloud is canonical between devices. The client MAY maintain a local cache.”

### Why this is problematic

If cloud save fails after the player has made new local decisions, the latest state exists only locally.

Calling the cloud copy “canonical” then becomes misleading.

### Revision

Use a **local durable working copy for every campaign**, including cloud campaigns.

For cloud campaigns:

- the local revision is the current device's working state;
- the cloud revision is the cross-device synchronized state;
- a sync coordinator pushes the newest durable local revision;
- save state is explicitly `synced`, `syncing`, `unsynced`, or `conflict`.

No automatic state merge.

**Status:** Resolved in v2.

---

## Issue 12 — Cloud autosaves can complete out of order

**v1 references:** Sections 10, 61–63.

### Why this is problematic

Revision 12 and revision 13 may both be in flight.

If 13 arrives first and 12 later, naïve upserts can overwrite newer state.

### Revision

Add a **CloudSyncCoordinator**:

- only one cloud write per campaign is in flight;
- intermediate revisions may be coalesced;
- the newest local revision is written against the last known remote revision;
- remote revision may jump from 10 directly to 13;
- stale writes cannot overwrite newer rows.

**Status:** Resolved in v2.

---

## Issue 13 — Multi-tab editing is not addressed

**v1 references:** persistence sections.

### Why this is problematic

Two tabs can independently mutate the same IndexedDB campaign and create divergent revisions before cloud conflict checks occur.

### Revision

Add a `CampaignEditLock` abstraction.

Only one browser context may have write authority for a campaign.

Other tabs open the campaign read-only or request transfer of the editing lock.

Implementation may use Web Locks where available with a fallback lease mechanism.

**Status:** Resolved in v2.

---

## Issue 14 — Conflict recovery is not defined

**v1 reference:** Section 61.

**Relevant v1 text:**

> “The client MUST NOT silently overwrite.”

### Why this is incomplete

It does not define what the user/application does after detecting the conflict.

### Revision

Cloud conflict offers only explicit outcomes:

1. **Use cloud version** — discard local divergent working copy after confirmation;
2. **Fork local version** — create a new campaign ID from the local snapshot;
3. cancel and remain in blocked conflict state.

No automatic merge of campaign states.

**Status:** Resolved in v2.

---

## Issue 15 — Save corruption/recovery has no backup strategy

**v1 references:** Sections 58–64.

### Why this is problematic

A single malformed/latest snapshot can make a campaign unrecoverable.

### Revision

Repositories MUST retain recovery snapshots.

Minimum v2 policy:

- current durable snapshot;
- immediately previous successful snapshot.

Repositories SHOULD retain three recent revisions when storage permits.

Recovery snapshots are not part of normal campaign selection UI unless recovery is required.

**Status:** Resolved in v2.

---

## Issue 16 — IndexedDB storage-schema versioning is conflated with game save migration

**v1 references:** Sections 58–64.

### Why this is problematic

IndexedDB object-store structure can change independently of `gameSchemaVersion`.

### Revision

Maintain separate:

```text
localStorageSchemaVersion
snapshotVersion
gameSchemaVersion
```

IndexedDB migrations operate on storage layout.

Snapshot migrations operate on serialized campaign data.

**Status:** Resolved in v2.

---

## Issue 17 — Scenario bundles are compiled but no runtime scenario artifact client exists

**v1 references:** Sections 36–37 and 65.

### Why this is problematic

`BaselineClient` can fetch baselines, but old campaigns also require their exact:

- scenario bundle;
- content version;
- balance profile.

If scenario content is only bundled into the current web build, older saves cannot reliably resume.

### Revision

Replace `BaselineClient` with an `ArtifactRegistryClient`.

It resolves immutable:

- scenario bundle;
- baseline;
- methodology;
- map artifact manifest;

for the exact hashes pinned to the campaign save.

**Status:** Resolved in v2.

---

## Issue 18 — Artifact compatibility metadata is incomplete

**v1 references:** Sections 37 and 116.

### Why this is problematic

Current manifests omit or blur:

- artifact schema versions;
- exact artifact URLs;
- map artifact version;
- domain artifact compatibility;
- hashes pinned in individual saves.

### Revision

Add `CampaignArtifactRefs` to save metadata and richer release/artifact manifests containing:

- scenario bundle schema version;
- baseline schema version;
- map artifact schema version;
- hashes;
- immutable URLs;
- required simulation model;
- required game schema.

**Status:** Resolved in v2.

---

## Issue 19 — `compiledAtBuildId` creates a potential determinism/hash ambiguity

**v1 reference:** Section 37.

### Why this is problematic

v1 says it “MUST NOT affect deterministic simulation” but does not say whether it is inside the hashed scenario bundle.

### Revision

Semantic bundle JSON contains **no build timestamp or build ID**.

Bundle hash is calculated only from canonical semantic content.

Build metadata lives in the manifest outside the hashed semantic bundle.

**Status:** Resolved in v2.

---

## Issue 20 — Immutable artifact retention is not defined

**v1 references:** Sections 66, 116, 124.

### Why this is problematic

A save may pin a baseline that a deployment later deletes.

The save would become unloadable despite being otherwise compatible.

### Revision

Artifact storage is append-only for all versions inside the supported save-compatibility window.

A release process MUST NOT delete a scenario/baseline artifact referenced by a supported save version.

The duration of that support window is an open stakeholder policy question.

**Status:** Architecture resolved; retention duration remains open.

---

## Issue 21 — Simulation-model backward compatibility has no product policy

**v1 reference:** Section 124.

**Relevant v1 text:**

> “A save MUST NOT load under an unsupported engine version.”

### Why this is incomplete

It does not answer:

- how many engine versions are supported;
- whether old simulation engines ship with the app;
- whether campaigns are migrated semantically.

### Revision

Introduce a `SimulationRuntimeRegistry` that can resolve supported model versions.

Do **not** silently migrate simulation semantics.

The compatibility-window policy is an open question.

Recommended options:

- **A. Current only:** simplest, weakest save continuity;
- **B. Current + previous two simulation models:** recommended balance;
- **C. Indefinite:** strongest continuity, highest maintenance cost.

**Status:** Open question.

---

## Issue 22 — Map artifact features are not formally linked to domain IDs

**v1 references:** Sections 42–47.

### Why this is problematic

Map selection requires `SubjectRef`, but PMTiles source layers have no specified property contract.

### Revision

Define a `MapArtifactManifest`.

Selectable map features MUST carry stable:

```text
subject_kind
subject_id
```

properties.

Territory/zone vector sources MUST expose a stable feature ID suitable for MapLibre `promoteId`/feature-state.

**Status:** Resolved in v2.

---

## Issue 23 — Dynamic map-state architecture is underspecified

**v1 references:** Sections 43 and 93.

**Relevant v1 text:**

> “dynamic game state GeoJSON/view-model data”

### Why this is incomplete

For territory/zone polygons, duplicating all geometry into GeoJSON every revision is wasteful and creates two map geometry authorities.

### Revision

Use:

- PMTiles geometry as the stable territory/zone source;
- MapLibre feature-state for dynamic visual properties keyed by domain ID;
- compact GeoJSON only for genuinely dynamic point/line intelligence overlays that do not exist in the static map artifact.

**Status:** Resolved in v2.

---

## Issue 24 — Coordinate reference system and geometry normalization are missing

**v1 references:** Sections 38–45.

### Why this is problematic

Source datasets may use different coordinate assumptions.

No canonical CRS means geospatial assignment can differ across adapters.

### Revision

Canonical source/runtime geometry:

```text
WGS84 longitude/latitude — EPSG:4326
```

Map tile generation transforms into the projection required by the vector-tile toolchain.

All GeoJSON written by the compiler MUST use WGS84 coordinate order:

```text
[longitude, latitude]
```

Geometry simplification parameters are versioned compiler configuration.

**Status:** Resolved in v2.

---

## Issue 25 — PMTiles deployment requirements are absent

**v1 references:** Sections 43–44 and environment configuration.

### Why this is problematic

PMTiles depends on range-capable HTTP delivery.

A static host that does not correctly support byte-range requests can break the map.

### Revision

Artifact hosting MUST provide:

- HTTPS;
- byte-range requests;
- CORS as required;
- immutable cache headers;
- content-length;
- stable content-addressed URLs.

The hosting provider remains a stakeholder/deployment decision.

**Status:** Requirements resolved; provider open.

---

## Issue 26 — Basemap/cartography source is unspecified

**v1 references:** Map sections.

### Why this matters

MapLibre is only the renderer.

The architecture does not define:

- basemap source;
- labels;
- attribution;
- availability;
- recurring cost;
- reproducibility.

### Revision

Make basemap selection an explicit open decision.

Recommended options:

- **A. Self-hosted curated basemap** — recommended for reproducibility and cost control;
- **B. commercial vector-tile provider** — easiest cartography, recurring cost/vendor dependency;
- **C. public tile service** — generally unsuitable for production unless its terms explicitly permit the expected use.

Any selection must pass the Data & Methodology licensing review.

**Status:** Open question.

---

## Issue 27 — The player-projection boundary is policy, not enforcement

**v1 references:** Sections 48–52.

**Relevant v1 text:**

> “The normal web UI SHOULD operate primarily on projections.”

### Why this is problematic

A React component can still import:

- the raw campaign store;
- `simulation`;
- hidden relationship state.

### Revision

Make the boundary enforceable:

- UI folders cannot import `@african-mandate/simulation`;
- UI folders cannot import the raw authoritative store module;
- ESLint `no-restricted-imports`/package-boundary rules enforce this;
- only application adapters, projection hosts, persistence, and explicit debug tooling may access raw state;
- normal UI consumes a projection store/API.

Change SHOULD to MUST.

**Status:** Resolved in v2.

---

## Issue 28 — Projection cache/invalidation behavior is unspecified

**v1 references:** Sections 48–53 and performance budgets.

### Why this matters

Complex map/dossier projections can be expensive.

Different developers may:

- recompute everything on every render;
- store derived state;
- invent ad-hoc caches.

### Revision

Projection functions remain pure.

The application may memoize using:

```text
campaign revision
+ projection type
+ subject ID
+ locale
+ presentation options
```

Any authoritative campaign revision invalidates authoritative-state-derived projection caches.

Derived projection data MUST NOT be persisted as game state.

**Status:** Resolved in v2.

---

## Issue 29 — Narrative responses can arrive stale

**v1 references:** Sections 67–72.

### Why this is problematic

AI generation is asynchronous.

A response for revision 12 can arrive after the player has reached revision 14.

Without rules, stale prose can appear as current.

### Revision

Every narrative request carries:

- semantic context hash;
- campaign ID;
- source campaign revision;
- language;
- narrative policy/template version.

Late responses may be cached but may only render in a view whose requested context hash still matches.

Narrative never mutates campaign state.

**Status:** Resolved in v2.

---

## Issue 30 — Narrative rendering security is unspecified

**v1 references:** Sections 70, 119.

### Why this is problematic

Generated `text` could be rendered unsafely if an implementation chooses HTML or markdown.

### Revision

v2 narrative output is **plain text only**.

UI rendering:

- uses text nodes;
- may preserve newlines;
- MUST NOT use `dangerouslySetInnerHTML`.

Rich model-generated markup requires a future structured-rendering schema and security review.

**Status:** Resolved in v2.

---

## Issue 31 — Performance budgets have no benchmark profile

**v1 reference:** Section 92.

**Relevant v1 text:**

> “< 250 ms p95”, “< 3 s on supported broadband desktop”

### Why this is ambiguous

Numbers are meaningless unless the architecture defines:

- browser;
- CPU/device class;
- network;
- dataset size;
- measurement method.

### Revision

Retain the v1 budgets as provisional engineering targets, but they become release gates only after a supported-device/browser benchmark profile is approved.

Recommended benchmark-profile options are listed under Open Questions.

**Status:** Open question.

---

## Issue 32 — Worker migration trigger is vague

**v1 reference:** Section 91.

**Relevant v1 text:**

> “If end-turn or projection work exceeds UI budgets, move the simulation service behind a Web Worker.”

### Why this is incomplete

Moving the entire simulation “service” later can require application refactoring.

### Revision

Introduce a `SimulationPort` from the beginning.

Implement:

```text
InProcessSimulationAdapter
```

first.

A future:

```text
WorkerSimulationAdapter
```

implements the same port.

The application layer therefore never depends on where simulation executes.

**Status:** Resolved in v2.

---

## Issue 33 — Browser support is not defined

**v1 references:** MapLibre, IndexedDB, edit locking, performance.

### Why this matters

Support policy affects:

- WebGL;
- IndexedDB;
- Web Locks;
- Playwright matrix;
- performance expectations;
- support costs.

### Revision

Add an explicit open question.

Recommended options:

- **A. Chromium desktop only** — lowest QA cost;
- **B. current evergreen desktop browsers** — recommended product default;
- **C. enterprise/extended browser support** — highest QA cost.

The final browser matrix belongs in production readiness documentation.

**Status:** Open question.

---

## Issue 34 — Artifact integrity is checked in CI but not defined at runtime

**v1 references:** Sections 66, 116.

### Why this matters

A corrupted/misconfigured CDN response may return the wrong scenario or baseline.

### Revision

At runtime:

- scenario bundle JSON and simulation baseline JSON are SHA-256 verified against pinned artifact refs before initialization;
- manifests are schema validated;
- PMTiles uses content-addressed immutable URLs and release-time checksum verification; full PMTiles client hashing is not required at startup.

**Status:** Resolved in v2.

---

## Issue 35 — GIS tool versions are not covered by reproducible build rules

**v1 reference:** Section 1:

> “Node build scripts using targeted geospatial libraries”

### Why this is incomplete

The final pipeline may invoke non-Node tools such as vector-tile builders.

An unpinned binary can alter geometry output and baseline hashes.

### Revision

All external data-build tools MUST be version pinned.

If an external binary is used, execute it through:

- a pinned container digest; or
- a checked-in/pinned tool version verified by checksum.

The Node orchestration layer records tool versions in the data-build manifest.

**Status:** Resolved in v2.

---

## Issue 36 — Campaign state JSON-safety is assumed, not required

**v1 references:** state hashing, persistence, worker strategy.

### Why this matters

If an implementer inserts:

- `Date`;
- `Map`;
- `Set`;
- `BigInt`;
- functions;

the save/hash/worker contract breaks.

### Revision

`CampaignState` and all authoritative domain-event payloads MUST be JSON-safe.

Development/test builds deep-freeze authoritative snapshots after commit to detect accidental UI mutation.

**Status:** Resolved in v2.

---

## Issue 37 — Domain-event payload growth is uncontrolled

**v1 references:** Sections 22, 92.

### Why this matters

Domain events persist inside the campaign snapshot.

If handlers store full before/after state or raw source payloads, the save target will be exceeded rapidly.

### Revision

Domain-event payloads MUST contain compact:

- IDs;
- deltas;
- reason codes;
- classification metadata.

They MUST NOT contain:

- entire state snapshots;
- raw external source records;
- AI prose;
- binary geometry.

Long-run headless tests enforce the save-size budget.

**Status:** Resolved in v2.

---

## Issue 38 — Guest-to-account migration is undefined

**v1 references:** Section 62.

### Why this matters

Signing in while a guest campaign exists could:

- overwrite a cloud campaign;
- silently upload data;
- change campaign identity.

### Revision

Guest campaigns remain local until the user explicitly chooses **Save to account**.

That operation:

- creates a new cloud campaign entry from the current local snapshot;
- preserves campaign simulation identity unless a conflict requires a fork;
- never silently uploads all guest campaigns.

**Status:** Resolved in v2.

---

## Issue 39 — Telemetry architecture lacks consent/provider policy

**v1 reference:** Section 97.

### Why this requires stakeholder input

A technical interface can be defined, but:

- telemetry provider;
- consent model;
- retention;
- institutional deployment requirements;

are product/privacy decisions.

### Revision

Define a provider-neutral `TelemetryPort` with a default no-op implementation.

Telemetry MUST NOT be required for gameplay.

Provider and consent policy are open questions.

**Status:** Open question.

---

## Issue 40 — Production security controls stop short of browser policy

**v1 references:** Sections 117–119.

### Why this is incomplete

The document protects secrets and prompts but does not require:

- Content Security Policy;
- dependency lock integrity;
- forbidden inline HTML;
- safe outbound origin restrictions.

### Revision

Require:

- production CSP;
- no unsafe generated HTML;
- exact lockfile in CI;
- dependency-update/security workflow;
- outbound `connect-src` limited to approved origins;
- no debug tooling in production bundle.

Exact CSP origins are deployment configuration.

**Status:** Resolved in v2.

---

# 3. Open Stakeholder Questions

The following issues cannot be resolved responsibly from the existing specifications alone.

## OQ-1 — Save compatibility window

How long should campaigns created on older `simulationModelVersion`s remain playable?

### Option A — current simulation model only

**Pros**
- simplest maintenance;
- smallest bundle.

**Cons**
- app updates may invalidate active campaigns.

### Option B — current + previous two simulation model versions

**Recommended**

**Pros**
- good campaign continuity;
- bounded maintenance.

**Cons**
- versioned runtime registry required.

### Option C — indefinite compatibility

**Pros**
- strongest preservation.

**Cons**
- potentially large long-term maintenance burden.

---

## OQ-2 — Production static host / artifact CDN

Required capabilities:

- HTTPS;
- immutable cache headers;
- HTTP byte-range support for PMTiles;
- CORS configuration;
- SPA fallback;
- reliable large static artifact delivery.

Provider selection is outside the evidence provided.

---

## OQ-3 — Basemap source

### Option A — self-hosted curated basemap

**Recommended**, subject to license review.

### Option B — commercial vector-tile provider

Easier, but introduces recurring cost/vendor dependency.

### Option C — public tile infrastructure

Only acceptable if production use is explicitly permitted.

---

## OQ-4 — Supported desktop browser matrix

### Option A
Chromium desktop only.

### Option B
Modern evergreen Chrome/Edge/Firefox/Safari.

**Recommended**, assuming testing budget supports it.

### Option C
Enterprise extended compatibility.

Requires larger QA effort.

---

## OQ-5 — Performance benchmark device/network profile

The v1 numeric budgets are retained as provisional.

A release gate needs an approved profile such as:

- reference laptop class;
- RAM;
- browser;
- viewport;
- network throughput/latency;
- representative full Sahel dataset.

Do not treat p95 budgets as enforceable until this profile is selected.

---

## OQ-6 — Narrative model provider

The architecture remains provider-independent.

Provider selection should later consider:

- quality;
- latency;
- structured output;
- privacy;
- cost;
- rate limits;
- institutional deployment constraints.

---

## OQ-7 — Telemetry provider and consent

The core architecture uses a no-op telemetry port by default.

Stakeholders must decide:

- whether production telemetry is enabled;
- consent requirements;
- provider;
- retention;
- privacy documentation.

---

# Part II — Consolidated Technical Architecture Specification v2

# 4. Authority and Conformance

## 4.1 Precedence

The authoritative document order is:

```text
1. Domain Model & Simulation Specification
2. Technical Architecture
3. Data & Methodology Specification
4. Game Design Specification
5. UI/UX Interaction Specification
6. Scenario Specification
7. Implementation Roadmap
```

For simulation semantics, the Domain Model wins.

For implementation mechanics left open by the Domain Model, this document wins.

---

## 4.2 Architecture principles

The v2 build MUST optimize for:

- deterministic replay;
- strict truth/knowledge separation;
- JSON-safe authoritative state;
- content-driven scenario authoring;
- headless testability;
- reproducible source-data compilation;
- safe asynchronous persistence;
- provider-independent AI;
- enforceable package boundaries;
- recoverable saves;
- future scenario reuse.

---

# 5. Technology Baseline

| Concern | v2 decision |
|---|---|
| Language | TypeScript |
| JavaScript module system | ESM only |
| Runtime/tooling | Exact repository-pinned Node LTS version |
| Workspace manager | pnpm workspaces, exact pnpm version |
| Web | React + Vite |
| Routing | React Router |
| UI/application state | Zustand |
| Boundary validation | Zod |
| Strategic map | MapLibre GL JS |
| Large static vector transport | PMTiles |
| Simulation | pure TypeScript |
| Persistence/auth | Supabase |
| Local durability | IndexedDB |
| AI server boundary | Supabase Edge Functions |
| Testing | Vitest + Playwright |
| CI | GitHub Actions |
| Authoring | YAML/JSON compiled to canonical JSON |
| Formatting/linting | Prettier + ESLint |

---

## 5.1 Toolchain reproducibility

The repository MUST include:

```text
exact Node pin
exact pnpm packageManager field
pnpm-lock.yaml
toolchain manifest
```

CI MUST use:

```text
pnpm install --frozen-lockfile
```

Any non-JavaScript GIS tool MUST be version pinned by:

- container digest; or
- verified binary/tool checksum.

Tool upgrades require an explicit pull request and regenerated artifact hashes.

---

# 6. Architectural Style

African Mandate is a **modular monolith with ports/adapters**.

```text
┌─────────────────────────────────────────────┐
│                   WEB                       │
│ React / MapLibre / Projection UI            │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│              APPLICATION PACKAGE            │
│ operation coordination / ports / sessions   │
└──────────────┬────────────────┬─────────────┘
               │                │
               │                ├── PersistencePort
               │                ├── NarrativePort
               │                ├── ArtifactRegistryPort
               │                └── CampaignEditLockPort
               │
┌──────────────▼──────────────────────────────┐
│               SIMULATION PORT              │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│             SIMULATION PACKAGE             │
│ deterministic authoritative engine         │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│                DOMAIN PACKAGE              │
│ contracts / schemas / IDs / refs            │
└─────────────────────────────────────────────┘
```

---

# 7. Package Dependency Rules

Canonical dependency direction:

```text
domain
  ↑
simulation
  ↑
application
  ↑
web
```

Side packages:

```text
domain ← content
domain ← data-pipeline
domain ← narrative
```

`testing` may depend on all packages through test-only dependencies.

---

## 7.1 Illegal dependencies

```text
domain → simulation
domain → React
domain → Supabase
domain → MapLibre

simulation → application
simulation → React
simulation → Zustand
simulation → Supabase
simulation → IndexedDB
simulation → MapLibre
simulation → provider SDKs

application → React
application → MapLibre
application → concrete Supabase client

content → simulation
data-pipeline → simulation
narrative → simulation mutation APIs
```

---

## 7.2 Enforcement

ESLint/package boundary rules MUST enforce:

- package direction;
- restricted imports;
- raw-state UI prohibition.

Normal UI code MUST NOT import:

```text
@african-mandate/simulation
campaignRuntimeStore raw module
debug projection modules
```

---

# 8. Repository Layout

```text
african-mandate/
├── apps/
│   └── web/
│
├── packages/
│   ├── domain/
│   ├── simulation/
│   ├── application/
│   ├── data-pipeline/
│   ├── narrative/
│   ├── content/
│   └── testing/
│
├── scenarios/
│   └── sahel-2026/
│
├── source-data/
│   ├── raw/
│   └── manifests/
│
├── generated/
│   ├── baselines/
│   ├── scenarios/
│   └── release/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── docs/
│   ├── architecture/
│   ├── design/
│   └── methodology/
│
├── scripts/
├── .github/workflows/
├── AGENTS.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

# 9. Workspace Execution Model

Internal workspaces are private source packages.

They are not published to npm in v2.

Rules:

- ESM only;
- TypeScript source remains canonical;
- Vite/Vitest resolve workspace source;
- Node CLIs use one pinned TypeScript runner;
- `tsc --noEmit` validates types;
- production web output is bundled by Vite;
- Edge Function code uses Web/Edge-compatible APIs.

A future move to compiled/published workspace packages requires an ADR.

---

# 10. Domain Package

`@african-mandate/domain` contains:

```text
ids/
refs/
schemas/
definitions/
runtime/
knowledge/
commands/
rules/
effects/
persistence/
baseline/
scenario/
artifacts/
projections/
versions/
```

It MUST contain no simulation behavior.

---

## 10.1 Schema source of truth

For every serialized/external contract:

```text
Zod schema
→ z.infer TypeScript type
```

Examples:

- `SaveSnapshotSchema`;
- `ScenarioBundleSchema`;
- `BaselinePackageSchema`;
- `ReleaseManifestSchema`;
- `NarrativeResponseSchema`.

Do not hand-maintain a duplicate interface for the same serialized shape.

Internal non-serialized algorithm interfaces MAY be TypeScript-only.

---

# 11. JSON-Safe Authoritative State

`CampaignState` and persisted domain-event payloads MUST contain only:

- `null`;
- booleans;
- strings;
- finite numbers;
- arrays;
- plain JSON objects.

Prohibited:

```text
undefined
NaN
Infinity
-Infinity
Date
Map
Set
BigInt
Function
class instances
DOM objects
```

Development/test snapshots SHOULD be deeply frozen after commit.

---

# 12. Numeric Determinism

## 12.1 Authoritative integer types

The following MUST be integers in persisted state:

- Scores;
- signed scores;
- counts;
- personnel;
- work units;
- money whole-unit amounts;
- turns;
- revisions.

---

## 12.2 Rounding rule

When formulas produce fractional authoritative values:

```text
roundHalfAwayFromZero
```

then clamp to the target range.

Conceptual helper:

```ts
function roundHalfAwayFromZero(value: number): number {
  return value < 0
    ? -Math.floor(-value + 0.5)
    : Math.floor(value + 0.5)
}
```

All modules use shared quantization helpers.

Do not use module-specific rounding.

---

## 12.3 Probabilities

Probabilities are finite floats:

```text
0 <= p <= 1
```

They are not accumulated as Scores.

---

# 13. Deterministic ID Architecture

## 13.1 Application-generated command IDs

Before dispatch, application creates a globally unique `commandId`.

The exact random UUID implementation is non-authoritative because the resulting ID is persisted in command/replay history.

Replay uses the original ID.

---

## 13.2 Simulation-derived IDs

Simulation-created entities use:

```ts
deriveSimulationId(
  entityType,
  campaignSeed,
  resolutionKey,
  ordinal
)
```

Algorithm:

```text
material =
campaignSeed
+ "\0"
+ entityType
+ "\0"
+ resolutionKey
+ "\0"
+ ordinal

digest = SHA-256(UTF-8(material))

id = prefix + "_" + first 24 lowercase hex characters
```

24 hex characters = 96 deterministic identifier bits.

If the resulting ID already exists for a different entity, the engine MUST fail an invariant.

---

# 14. Deterministic Randomness

Canonical function:

```ts
deterministicSample(
  campaignSeed: string,
  resolutionKey: string
): number
```

Algorithm:

1. UTF-8 encode:

```text
campaignSeed + "\0" + resolutionKey
```

2. Compute SHA-256.
3. Interpret the first seven digest bytes as an unsigned 56-bit **big-endian** integer.
4. Shift right by three bits to produce a 53-bit integer.
5. Return:

```text
value / 9007199254740992
```

where:

```text
9007199254740992 = 2^53
```

Result:

```text
0 <= n < 1
```

The SHA-256 implementation used by simulation MUST be synchronous and identical in browser and Node. It may use a pinned pure-JS/TypeScript implementation that passes the following vectors.

---

## 14.1 Required random test vectors

### Vector A

Seed:

```text
campaign-test-seed
```

Resolution key:

```text
turn:01|system:event_director|subject:zone_mopti|resolution:asset_disruption
```

SHA-256:

```text
fa4525869c8a1b68e950dd8400f61d5836b9bb80b9ddb3b1d095aa6cec0d5cde
```

Expected sample:

```text
0.9776175931588472
```

### Vector B

Resolution key:

```text
turn:08|system:actor_adaptation|subject:actor_foo|resolution:position_shift
```

Expected SHA-256:

```text
ca2ab6e11655d78db6dd5e4b829e9e644c575b6c5629cf2b8379ff611372c6b5
```

Expected sample:

```text
0.7897142695931827
```

---

# 15. Canonical State Hash

Before hashing, authoritative state is canonicalized.

Rules:

1. state MUST already be JSON-safe;
2. object keys sorted lexicographically;
3. arrays preserve existing order;
4. `-0` serialized as `0`;
5. no automatic sorting of arrays;
6. any semantically unordered arrays MUST be normalized by their owning subsystem before state commit;
7. canonical JSON is UTF-8 encoded;
8. SHA-256 produces the state hash.

Excluded from the authoritative hash:

- narrative cache;
- UI state;
- telemetry;
- save wall-clock metadata;
- resolution traces.

Included:

- campaign meta relevant to simulation;
- versions;
- all authoritative runtime registries;
- decision/domain-event history;
- processed-command registry.

---

# 16. Application Package

Create:

```text
@african-mandate/application
```

Responsibilities:

- serialize campaign operations;
- call `SimulationPort`;
- coordinate durable local persistence;
- coordinate cloud synchronization;
- coordinate projections;
- request narrative asynchronously;
- manage campaign edit lock;
- expose application-level status.

It MUST NOT calculate simulation effects.

---

# 17. Application Ports

```ts
interface SimulationPort {
  dispatch(command: SimulationCommand): Promise<CommandResult>
  endTurn(): Promise<TurnResult>
  initialize(input: CampaignInitializationInput): Promise<CampaignState>
  buildProjection(request: ProjectionRequest): Promise<PlayerProjection>
}
```

```ts
interface CampaignPersistencePort {
  load(id: CampaignId): Promise<SaveSnapshot>
  writeLocal(snapshot: SaveSnapshot): Promise<void>
  syncCloud?(snapshot: SaveSnapshot, expectedRemoteRevision: number):
    Promise<CloudSyncResult>
}
```

```ts
interface ArtifactRegistryPort {
  resolveCampaignArtifacts(refs: CampaignArtifactRefs):
    Promise<ResolvedCampaignArtifacts>
}
```

```ts
interface NarrativePort {
  request(context: NarrativeRequest): Promise<NarrativeResponse>
}
```

```ts
interface CampaignEditLockPort {
  acquire(campaignId: CampaignId): Promise<EditLock>
}
```

---

# 18. Simulation Adapters

Initial:

```text
InProcessSimulationAdapter
```

Future:

```text
WorkerSimulationAdapter
```

Both implement `SimulationPort`.

The web application does not care where the engine executes.

---

# 19. Campaign Operation Coordinator

Only one authoritative operation may execute per campaign at a time.

Operation classes:

```text
strategic command
end turn
campaign initialization
save migration
conflict-resolution replacement
```

Narrative generation is not authoritative and never owns this lock.

Cloud sync never owns this lock.

---

# 20. Durable Commit Sequence

For a successful strategic command or End Turn:

```text
1. acquire campaign operation lock
2. read current in-memory state
3. call SimulationPort
4. validate result
5. calculate authoritative state hash
6. create SaveSnapshot
7. transactionally write local durable snapshot
8. replace in-memory authoritative state
9. update projection cache/store
10. release operation lock
11. enqueue cloud synchronization
12. enqueue optional narrative
```

If step 7 fails:

- in-memory state remains the previous revision;
- no decision is considered committed;
- user receives a technical persistence error.

This prevents acknowledged-but-lost actions.

---

# 21. Local Persistence

IndexedDB is the mandatory durable browser store for playable campaigns.

Object stores:

```text
campaign_current
campaign_recovery
campaign_summaries
narrative_cache
storage_metadata
```

---

## 21.1 Local storage schema

Maintain:

```text
localStorageSchemaVersion
```

separately from:

```text
snapshotVersion
gameSchemaVersion
```

IndexedDB structural migrations MUST NOT be conflated with campaign snapshot migrations.

---

## 21.2 Recovery snapshots

On every successful durable write:

```text
previous current
→ recovery slot
new snapshot
→ current
```

At minimum, retain one prior successful snapshot.

SHOULD retain three where quota permits.

---

## 21.3 Quota/write failure

If authoritative local durability fails, the application MUST block further strategic mutation until:

- the write succeeds;
- the campaign is exported/forked through a future supported recovery flow;
- or the user leaves the campaign.

v2 does not silently switch to volatile unsaved play.

---

# 22. Cloud Synchronization

For authenticated cloud campaigns:

```text
local durable state = current-device working authority
cloud state = cross-device synchronized authority
```

Sync state:

```ts
type CloudSyncStatus =
  | 'synced'
  | 'syncing'
  | 'unsynced'
  | 'conflict'
  | 'unavailable'
```

---

## 22.1 CloudSyncCoordinator

Per campaign:

- one cloud request at a time;
- later local revisions may coalesce;
- write newest local revision using last known remote revision;
- stale remote response never replaces newer local state.

Remote revision may legally jump:

```text
10 → 13
```

if 11 and 12 were local intermediate autosaves.

---

## 22.2 Cloud revision conflict

On conflict:

```text
sync status = conflict
```

Further authoritative strategic commands SHOULD be blocked until the conflict is resolved.

Allowed resolution:

```text
use cloud
fork local
cancel
```

No automatic merge.

---

# 23. Multi-Tab Edit Lock

Only one browser context has write authority for one campaign.

The web adapter implements `CampaignEditLockPort`.

Preferred mechanisms:

1. Web Locks API where supported;
2. fallback lease/heartbeat backed by browser messaging + IndexedDB metadata.

Secondary tabs open campaign read-only.

Lock loss during an operation MUST prevent committing a new local revision.

---

# 24. Guest-to-Account Behavior

Guest campaigns remain local.

Signing in does not automatically upload them.

Explicit **Save to account**:

1. validates current local snapshot;
2. creates a cloud campaign;
3. associates it with the authenticated user;
4. initializes cloud revision from the current local revision;
5. records cloud campaign metadata.

No silent bulk migration.

---

# 25. Supabase Persistence

Recommended cloud tables:

```text
campaigns
campaign_recovery_snapshots
campaign_narratives
```

`campaigns` stores the latest authoritative synchronized snapshot.

Minimum fields:

```sql
id uuid primary key
user_id uuid not null
scenario_id text not null
campaign_revision bigint not null

game_schema_version int not null
simulation_model_version text not null
baseline_version text not null
scenario_version text not null
content_version text not null
balance_profile_version text not null
methodology_version text not null

scenario_bundle_hash text not null
baseline_hash text not null

authoritative_state_hash text not null
state_snapshot jsonb not null

last_played_at timestamptz not null
created_at timestamptz not null
updated_at timestamptz not null
```

RLS restricts rows to owners.

---

# 26. Save Snapshot v2 Metadata

Persistence adds artifact references outside simulation semantics.

```ts
interface CampaignArtifactRefs {
  scenarioId: string

  scenarioBundleSchemaVersion: number
  scenarioBundleHash: string

  baselineSchemaVersion: number
  baselineHash: string

  mapArtifactSchemaVersion: number
  mapArtifactHash: string
}
```

```ts
interface SaveSnapshot {
  snapshotVersion: number

  campaignId: CampaignId
  campaignRevision: number

  versions: CampaignVersions
  artifacts: CampaignArtifactRefs

  authoritativeState: CampaignState
  authoritativeStateHash: string
}
```

Narrative cache remains separate.

---

# 27. Snapshot Migration

Snapshot migrations live in domain persistence tooling.

A migration may transform **schema shape**.

A migration MUST NOT silently change historical simulation semantics.

If the new app cannot execute the campaign's pinned `simulationModelVersion`, compatibility policy applies.

---

# 28. Simulation Runtime Registry

Architecture supports:

```ts
interface SimulationRuntimeRegistry {
  resolve(
    simulationModelVersion: string
  ): SimulationPortFactory | null
}
```

Initial release may contain one runtime.

Future support window is Open Question OQ-1.

A save under an unsupported runtime fails clearly.

---

# 29. Scenario and Baseline Artifact Registry

Scenario content and real-data baselines are runtime-loadable immutable artifacts.

They are not assumed to be compiled permanently into the web bundle.

New campaign:

```text
current release manifest
→ choose current scenario artifact refs
→ initialize
```

Existing campaign:

```text
save artifact refs
→ resolve exact immutable artifacts
→ verify
→ load
```

---

# 30. Artifact Registry Client

```ts
interface ArtifactRegistryClient {
  loadReleaseManifest(): Promise<ReleaseManifest>

  loadScenarioBundle(
    ref: ScenarioBundleArtifactRef
  ): Promise<ScenarioBundle>

  loadBaseline(
    ref: BaselineArtifactRef
  ): Promise<BaselinePackage>

  loadMapManifest(
    ref: MapArtifactRef
  ): Promise<MapArtifactManifest>

  loadMethodology(
    ref: MethodologyArtifactRef
  ): Promise<MethodologyManifest>
}
```

---

# 31. Runtime Artifact Verification

Scenario bundle JSON:

```text
fetch
→ schema validate
→ canonical hash
→ compare pinned SHA-256
```

Simulation baseline JSON:

same.

PMTiles:

- served from immutable content-addressed URL;
- checksum verified during release publication;
- full client-side hash is not required before map rendering.

---

# 32. Artifact Retention

Artifact storage is append-only for all supported campaign versions.

A deployment MUST NOT mutate bytes at an existing content-addressed URL.

A deployment MUST NOT delete an artifact still required by a campaign inside the supported compatibility window.

---

# 33. Content Compiler v2

Source:

```text
scenarios/<scenario-id>/
```

Runtime never parses YAML.

Compile:

```text
parse
→ Zod
→ cross references
→ rule registry validation
→ effect validation
→ localization validation
→ deterministic canonical ordering
→ semantic scenario bundle
→ SHA-256
→ manifest
```

---

## 33.1 Build metadata exclusion

`scenario.bundle.json` contains semantic content only.

Fields such as:

```text
compiledAt
buildId
gitCommit
```

live in the manifest and are excluded from `scenarioBundleHash`.

---

# 34. Content Package versus Scenario Sources

`@african-mandate/content` contains compiler code.

`scenarios/` contains authored scenario source.

These are intentionally separate.

The compiler may import `domain`.

Scenario files cannot import code.

---

# 35. Data Pipeline

```text
raw source snapshots
→ adapters
→ canonical records
→ quality metadata
→ geography normalization
→ spatial assignment
→ derived observed indicators
→ provenance
→ license validation
→ simulation baseline
→ map artifact
```

Simulation never reads source-native fields.

---

# 36. Raw Source Snapshot Manifest

Every source-data build records:

```ts
interface RawSourceSnapshot {
  sourceKey: string
  fileName: string

  sha256: string

  release?: string
  dataAsOf?: string
  fetchedAt?: string

  toolOrAcquisitionVersion?: string
}
```

The same raw checksums + same compiler/toolchain versions MUST produce identical semantic artifacts.

---

# 37. GIS Toolchain Reproducibility

Node orchestrates the data build.

External GIS/vector-tile tools MAY be invoked only when version pinned.

The data-build manifest records:

```text
Node version
pnpm version
compiler version
adapter versions
external GIS tool versions/digests
```

---

# 38. Coordinate System

Canonical source and runtime geometry:

```text
EPSG:4326
WGS84
GeoJSON coordinate order [longitude, latitude]
```

Source adapters MUST transform inputs to this canonical form before spatial assignment.

Map tile generation may project as required by the tile format/toolchain.

---

# 39. Geometry Determinism

Compiler configuration pins:

- simplification tolerance;
- precision;
- boundary rules;
- line intersection behavior;
- point-on-boundary tie-breaker.

Changing any geometry-processing rule increments the relevant compiler/baseline version.

---

# 40. Map Artifact Manifest

```ts
interface MapArtifactManifest {
  mapArtifactSchemaVersion: number

  pmtilesUrl: string
  pmtilesHash: string

  sourceLayers: MapSourceLayerManifest[]

  crsSource: 'EPSG:4326'

  buildToolchainVersion: string
}
```

```ts
interface MapSourceLayerManifest {
  sourceLayer: string

  subjectKind:
    | 'territory'
    | 'zone'
    | 'asset'
    | 'corridor'
    | 'baseline_event'

  selectable: boolean

  idProperty: 'subject_id'

  requiredProperties: string[]
}
```

---

# 41. Map Feature Identity

Every selectable static feature carries:

```text
subject_kind
subject_id
```

Territory/zone tiles MUST support stable feature IDs keyed from domain IDs.

Map click returns `SubjectRef`.

No name matching.

---

# 42. Static versus Dynamic Map State

## Static PMTiles

Use for:

- political geometry;
- zones;
- baseline public infrastructure;
- corridors;
- dense static point inventories;
- labels/basemap as selected.

## Feature-state

Use for dynamic styling of static territory/zone/asset features.

Examples:

- known attention level;
- player-known confidence class;
- selected state.

## Dynamic GeoJSON

Use only for runtime features whose geometry is not already present in static artifacts.

Examples:

- player-known current intelligence observations;
- temporary investigation markers;
- simulated incident visualization when appropriate.

---

# 43. Map Knowledge Classes

```ts
type MapKnowledgeClass =
  | 'baseline_public'
  | 'player_intelligence'
  | 'debug_private'
```

Production player map never registers debug-private layers.

Map style code MUST consume player projection, not hidden state.

---

# 44. Map Hosting Requirements

Static artifact host MUST support:

- HTTPS;
- Range requests;
- immutable cache control;
- stable content-addressed URLs;
- correct CORS;
- content length.

Host provider remains OQ-2.

Basemap source remains OQ-3.

---

# 45. Player Projection Firewall

Normal UI receives projections, not authoritative state.

Pipeline:

```text
CampaignState
→ knowledge-aware projection builder
→ readonly projection
→ web projection store
→ UI
```

---

## 45.1 Enforced import rule

Files under normal UI directories MUST NOT import:

```text
@african-mandate/simulation
authoritative campaign store
debug projections
```

Linting fails CI on violation.

---

## 45.2 Raw state consumers

Allowed:

- application simulation adapter;
- persistence serializer;
- projection host;
- explicit development console.

---

# 46. Projection Cache

Projection functions remain pure.

Memoization key:

```text
campaignRevision
+ projectionType
+ subjectId if any
+ locale
+ presentation option hash
```

Any authoritative campaign revision invalidates authoritative-state projections.

Projection data is never persisted as game state.

---

# 47. Web State Stores

## Campaign runtime store

Private to application/projection infrastructure.

```ts
interface CampaignRuntimeStore {
  state: CampaignState | null
  revision: number | null
}
```

Do not export a general `useCampaignState()` hook to UI.

---

## Projection store

UI-facing.

Contains readonly projections:

```text
campaign overview
situation queue
strategic map state
selected dossier
mandate portfolio
active briefing
```

---

## UI store

Contains non-authoritative:

```text
selection
workspace
modal
viewport
layer visibility
panel layout
reduced motion
local display preferences
```

---

## Session/sync store

Contains:

```text
auth
campaign ID
edit-lock status
local-save status
cloud-sync status
narrative availability
```

---

# 48. Application Command Flow

```text
UI
↓
ApplicationCommandService
↓
CampaignOperationCoordinator
↓
SimulationPort
↓
next state
↓
local durable commit
↓
runtime store
↓
projection rebuild
↓
UI
```

Cloud and narrative work happen after durable local commit.

---

# 49. Command Idempotency

Application generates a command ID before simulation.

Simulation maintains `processedCommandIds`.

If a command reaches simulation twice:

- it MUST NOT reapply;
- the application receives an idempotent duplicate result/error according to the public API.

UI double-click prevention is supplementary, not the authoritative defense.

---

# 50. Rule Engine

Rules use registered facts only.

Every `FactDefinition` declares:

- value type;
- valid subject kinds;
- valid scopes;
- resolver.

Rule scopes:

```text
simulation
player_eligibility
player_forecast
narrative
```

A content compile error occurs if:

```text
player_eligibility
```

references a simulation-private fact.

---

# 51. Rule Evaluation

Return:

```text
true
false
unknown
```

Unknown is not false.

Default consumers:

```text
player eligibility → fail closed
player forecast → surface uncertainty
simulation event trigger → configuration-specific; default requires deterministic fact availability
```

---

# 52. Effect Engine

Authored content uses a closed discriminated union of effect types defined by the Domain Model.

Forbidden:

```text
setByPath()
eval()
arbitrary script strings
dynamic code import from scenario
```

Every effect handler:

- validates target;
- applies typed change;
- clamps/quantizes;
- emits compact domain events;
- may schedule typed consequences.

---

# 53. Domain Event Size Rules

Domain-event payloads SHOULD contain:

- IDs;
- deltas;
- reason codes;
- status transitions;
- compact classification metadata.

They MUST NOT contain:

- full before/after campaign states;
- full external-source records;
- AI narrative;
- PMTiles/GeoJSON blobs.

The 20-turn full-campaign fixture MUST remain inside the authoritative save-size budget.

---

# 54. Simulation Context

Resolvers receive explicit context.

```ts
interface SimulationContext {
  bundle: ScenarioBundle

  campaignSeed: string

  turn: number

  modelVersion: string

  trace?: TraceCollector
}
```

No simulation module loads global scenario JSON directly.

---

# 55. Simulation Transaction

Internal transaction owns:

- cloned/copy-on-write draft;
- emitted domain events;
- scheduled consequences;
- resolution traces;
- deterministic ID ordinals.

External API remains immutable.

---

# 56. Mutation Strategy

Initial implementation MAY use:

```text
structuredClone
```

for the small headless slice.

Before full Sahel release, profile full-campaign state.

If cloning becomes material, replace internals with copy-on-write/Immer-like drafting without changing public APIs or semantics.

UI never mutates authoritative objects.

---

# 57. Command Pipeline

Canonical strategic command sequence:

```text
1 validate schema
2 validate campaign active
3 validate submitted turn
4 validate edit/operation ownership at application layer
5 validate command idempotency
6 resolve ActionDefinition
7 validate targets
8 evaluate player eligibility
9 validate decision slots
10 validate known costs
11 create transaction
12 apply immediate effects
13 reconcile commitments/red lines
14 recompute affected relationships/positions
15 schedule consequences
16 record domain events
17 record DecisionRecord
18 mark command processed
19 decrement decision slots
20 increment campaign revision
21 run invariants
22 return result
```

Application then performs durable commit.

---

# 58. Turn Engine

The turn phase order remains exactly as defined in Domain Model v1.1.

Implementation modules remain isolated.

Changing phase order requires:

```text
simulationModelVersion bump
replay fixture update
balance regression report
```

---

# 59. World-System Isolation

Conflict, civilian, infrastructure, and development modules do not mutate each other's state directly through private helpers.

They interact only through:

- defined read dependencies;
- typed effects;
- explicit phase ordering.

Cross-system coupling must appear in architecture/trace output.

---

# 60. Worker-Ready Simulation

The application uses `SimulationPort` from the first build.

Initial:

```text
InProcessSimulationAdapter
```

Worker migration does not change application APIs.

`WorkerSimulationAdapter` uses structured-clone-compatible command/result DTOs.

Authoritative state remains JSON-safe.

---

# 61. Worker Adoption Gate

Before public release, benchmark on the approved reference profile.

A worker becomes REQUIRED if:

- end-turn processing consistently creates unacceptable UI blocking; or
- the approved p95 responsiveness budget cannot be achieved in-process.

Final thresholds depend on OQ-5.

---

# 62. Scenario Initialization

```text
resolve exact scenario/baseline artifacts
↓
schema validation
↓
hash verification
↓
compatibility checks
↓
create campaign meta
↓
instantiate institutions/actors/relationships
↓
initialize observed baseline
↓
derive latent truth
↓
initialize player knowledge
↓
opening reports/situations
↓
derive capacities
↓
assert invariants
↓
durable local save
↓
expose campaign
```

A new campaign is not considered created until the initial durable local save succeeds.

---

# 63. Scenario/Baseline Compatibility

Initialization MUST verify:

```text
scenario expected baseline ID/version
baseline schema version
scenario bundle schema version
simulation model requirements
referenced territory/zone/asset IDs
methodology version
artifact hashes
```

Any mismatch blocks initialization.

---

# 64. Intelligence Collection

`RequestIntelligence` produces a collection task.

At due turn:

```text
hidden truth
+ collection channel
+ source reporting profile
+ intelligence capacity
+ deterministic uncertainty
→ player evidence
```

Collection never simply returns raw hidden state.

---

# 65. Player Projection and Forecast

Action eligibility, dossiers, briefings, and “what might happen?” forecasts may use:

- player knowledge;
- player-owned resources;
- known mandate state;
- public baseline.

They MUST NOT inspect hidden scheduled consequences or hidden actor intent.

Knowledge-leak tests enforce this.

---

# 66. Narrative Architecture

Narrative remains presentational.

Pipeline:

```text
simulation semantic state
→ perspective filter
→ semantic narrative context
→ NarrativePort
→ Edge Function
→ provider
→ schema validation
→ plain text
→ cache
→ UI
```

---

# 67. Narrative Request Identity

Every request contains:

```ts
interface NarrativeRequestIdentity {
  campaignId: CampaignId

  sourceCampaignRevision: number

  semanticContextHash: string

  language: string

  narrativePolicyVersion: string
  templateVersion: string
}
```

---

# 68. Stale Narrative Responses

A response may be cached regardless of when it arrives.

It may render only if the current view still requests the same:

```text
semanticContextHash
language
policy/template version
```

Narrative completion never mutates `CampaignState`.

---

# 69. Narrative Rendering Security

Model output is plain text in v2.

Allowed presentation transformation:

- newline splitting;
- application-controlled typography.

Forbidden:

- raw HTML;
- `dangerouslySetInnerHTML`;
- model-supplied executable markup;
- model-supplied tool calls.

A future rich-text system must use a typed controlled rendering schema.

---

# 70. Narrative Cache Storage

Local:

```text
IndexedDB narrative_cache
```

Cloud:

```text
campaign_narratives
```

Recommended key:

```text
campaign_id
semantic_context_hash
language
narrative_policy_version
template_version
```

Narrative rows are separate from authoritative state snapshots.

---

# 71. Narrative Provider Portability

`@african-mandate/narrative` MUST use Web-standard/Edge-compatible primitives.

It MUST NOT require Node-only built-ins if shared with Supabase Edge Functions.

Provider SDKs live only in server adapters if they are not portable.

---

# 72. Narrative Budget/Failure

Server enforces:

- rate limits;
- prompt limits;
- output limits;
- timeout;
- circuit breaker.

Failure path:

```text
structured semantic context
→ deterministic template fallback
```

Gameplay continues unchanged.

---

# 73. Security

## Browser

Production MUST ship an explicit CSP appropriate to selected hosts.

At minimum architecture requires:

- scripts from approved origins only;
- network connections to approved API/artifact origins only;
- no unsafe generated HTML;
- debug surfaces disabled.

## Dependencies

- lockfile committed;
- frozen install in CI;
- automated dependency/security update workflow;
- no unpinned remote script imports.

## Server secrets

Never expose:

- service-role key;
- narrative-provider secret;
- ingestion credentials.

---

# 74. Input Validation

Validate all:

- save snapshots;
- release manifests;
- scenario bundles;
- baseline packages;
- environment configuration;
- narrative responses;
- deep-link authoritative parameters.

Do not trust a save merely because it originated from the same client.

---

# 75. Performance

The v1 budgets remain **provisional** until OQ-5 is resolved.

Current targets:

| Operation | provisional target |
|---|---:|
| strategic command | < 50 ms p95 |
| end-turn simulation | < 250 ms p95 |
| projection refresh | < 50 ms p95 |
| dossier response | < 100 ms perceived |
| interactive shell | < 3 s |
| authoritative save | < 2 MB |
| compressed baseline JSON | < 2 MB |
| narrative timeout | 8 s |

Benchmark reports MUST record:

- device profile;
- browser/version;
- scenario;
- artifact versions;
- state size;
- sample count.

---

# 76. Accessibility

Required:

- keyboard-accessible strategic workflows;
- visible focus;
- semantic controls/tables;
- screen-reader labels;
- non-color status encoding;
- reduced motion;
- sufficient contrast;
- textual equivalents for strategically important map information.

The map cannot be the only way to access a critical situation.

---

# 77. Localization

All authored player-facing content uses localization keys.

Fallback:

```text
requested locale
→ scenario default locale
→ development error marker
```

Production should not silently expose raw localization keys.

AI narrative cache is language-specific.

---

# 78. Telemetry Port

```ts
interface TelemetryPort {
  record(event: TelemetryEvent): void
}
```

Default:

```text
NoopTelemetryAdapter
```

Telemetry never influences simulation state.

Provider/consent is OQ-7.

---

# 79. Technical Error Model

Application error categories:

```text
SimulationError
LocalPersistenceError
CloudSyncError
ArtifactLoadError
ArtifactIntegrityError
NarrativeError
AuthenticationError
CompatibilityError
EditLockError
NetworkError
```

Technical errors MUST remain visibly distinct from in-world uncertainty.

---

# 80. Loading and Recovery States

Required UI states:

```text
app boot
release manifest loading
artifact loading
artifact integrity verification
campaign initialization
campaign migration
campaign recovery
edit lock read-only
local save pending
local save failed
cloud syncing
cloud unsynced
cloud conflict
map artifact loading
optional map layer failed
narrative pending
narrative unavailable
```

---

# 81. Baseline Failure Semantics

If required simulation baseline fails:

```text
block initialization/load
```

If optional visual map artifact fails:

```text
simulation may continue
map UI reports degraded visual state
```

Map rendering is not the simulation authority.

---

# 82. Developer Console

Development-only capabilities:

- hidden world truth;
- player knowledge;
- diff truth vs knowledge;
- actor intent;
- red lines;
- exact positions;
- scheduled consequences;
- fact resolution;
- rule results;
- deterministic resolution keys;
- domain events;
- state hash;
- replay controls;
- test command injection.

Never ship enabled in production.

---

# 83. Resolution Tracing

Optional development trace:

```ts
interface ResolutionTrace {
  campaignRevision: number
  turn: number

  system: string

  sourceCommandId?: string

  evaluatedFacts: TraceFact[]
  evaluatedRules: TraceRule[]
  randomKeys: TraceRandom[]
  effects: TraceEffect[]

  resultingDomainEventIds: string[]
}
```

Traces are not authoritative state.

---

# 84. Logging

Production logs contain minimal metadata:

```text
campaign ID
revision
scenario version
simulation model
error code
system
request correlation ID
```

Never log:

- auth tokens;
- full save snapshots;
- raw narrative prompts by default;
- personal account data;
- large source records.

---

# 85. Testing Architecture

Required families:

```text
domain/schema
fact/rule
effect
command
turn-order
knowledge leak
determinism
ID derivation
state hashing
artifact compilation
artifact integrity
scenario contract
persistence
local recovery
cloud concurrency
multi-tab lock
AI validation
web integration
Playwright
headless balance
```

---

# 86. Determinism Tests

Must include:

- required SHA-256 random vectors;
- deterministic ID vectors;
- canonical state hash fixture;
- full replay fixture.

A simulation-model version must preserve its published fixtures.

---

# 87. Persistence Tests

Test:

```text
local write success
local write rollback/failure
recovery snapshot
snapshot migration
IndexedDB schema migration
cloud sync
coalesced revisions
revision conflict
fork local
use cloud
guest save-to-account
```

---

# 88. Map Tests

Validate:

- map manifest schema;
- stable domain IDs;
- click → correct `SubjectRef`;
- no debug-private production layer;
- public/static feature-state update;
- player-intelligence overlay uses projection only.

---

# 89. Narrative Tests

Validate:

- perspective restrictions;
- allowed claims;
- plain-text output;
- stale-response suppression;
- fallback;
- provider outage;
- invalid schema;
- cache identity.

---

# 90. CI

Pull request:

```text
1 toolchain verification
2 frozen install
3 format
4 lint / package boundaries
5 typecheck
6 domain tests
7 simulation tests
8 determinism vectors
9 content validation
10 data fixture validation
11 artifact schema/integrity tests
12 persistence tests
13 web tests
14 production build
15 Playwright smoke
```

---

# 91. Full Data Build CI

When source data changes:

```text
validate raw checksums
run adapters
compile baseline
compile map artifact
generate provenance
generate license report
verify deterministic hashes
publish validation report
```

Release publication occurs only after review.

---

# 92. Release Manifest v2

```ts
interface ReleaseManifest {
  releaseManifestSchemaVersion: number

  appVersion: string
  appBuildId: string

  gameSchemaVersion: number

  supportedSimulationModels: string[]

  scenarios: Record<string, ReleaseScenarioEntry>
}
```

```ts
interface ReleaseScenarioEntry {
  defaultForNewCampaigns: boolean

  scenarioVersion: string
  contentVersion: string
  balanceProfileVersion: string
  methodologyVersion: string

  scenarioBundle: {
    schemaVersion: number
    hash: string
    url: string
  }

  baseline: {
    baselineVersion: string
    schemaVersion: number
    hash: string
    url: string
  }

  mapArtifact: {
    schemaVersion: number
    hash: string
    manifestUrl: string
  }

  requiredSimulationModelVersion: string
}
```

---

# 93. Release Artifact Policy

All URLs in release manifests are immutable.

A mutable:

```text
latest
```

endpoint MAY point to the newest release manifest only.

Campaign saves never rely on “latest.”

---

# 94. Compatibility Registry

The application has a compatibility registry describing:

- supported game schema versions;
- supported simulation runtimes;
- supported artifact schema versions;
- available snapshot migrations.

A campaign load must resolve all required components before hydration.

---

# 95. Deployment Topology

Fixed:

```text
browser
→ static web/artifact hosting
→ Supabase Auth/Postgres/Edge Functions
→ optional narrative provider
```

Not fixed:

- static host/CDN provider;
- basemap provider;
- narrative model provider;
- telemetry provider.

Those remain Open Questions.

---

# 96. PMTiles Deployment Check

Deployment smoke test MUST include an HTTP byte-range request against the production PMTiles origin.

A host passes only if partial content behavior is compatible with the selected PMTiles client.

---

# 97. Repository Script Contract

Required root commands:

```text
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e

pnpm content:validate
pnpm content:build

pnpm data:validate
pnpm data:build
pnpm data:manifest

pnpm scenario:validate

pnpm simulate
pnpm replay
pnpm balance:report

pnpm artifacts:verify
pnpm release:manifest
```

---

# 98. Coding-Agent Guardrails

`AGENTS.md` MUST require:

1. read Domain Model before gameplay changes;
2. read Technical Architecture before package changes;
3. read Design Standards before UI changes;
4. never add authoritative fields without classifying ownership;
5. never import simulation directly into normal UI;
6. never use `Math.random()` for simulation;
7. never mutate state by arbitrary paths;
8. never let narrative AI determine state;
9. never consume raw source datasets in React;
10. preserve replay fixtures;
11. update versions when semantics change;
12. add tests for new rules/effects.

---

# 99. Architecture Decision Records

Minimum ADRs:

```text
0001-modular-monolith.md
0002-application-package-and-ports.md
0003-maplibre-pmtiles.md
0004-snapshot-authoritative.md
0005-keyed-deterministic-randomness.md
0006-player-projection-firewall.md
0007-local-first-durable-cloud-sync.md
0008-supabase-backend.md
0009-ai-presentational-only.md
0010-runtime-artifact-registry.md
```

---

# 100. First Repository Scaffold

First commit contains:

```text
workspace configs
toolchain pins
lockfile
domain package
simulation package
application package
testing package
empty web shell
CI
architecture docs
AGENTS.md
```

No large source-data import.

---

# 101. First Headless Slice

Must prove:

```text
one territory
one zone
three actors/institutions
directional relationships
one hidden red line
one evidence source
one intelligence gap
one collection task
one assessment
one mandate case
one coalition negotiation
one authorization procedure
one implementation
one scheduled consequence
one callback
five turns
```

---

# 102. First Slice Durability Test

The scripted slice MUST additionally verify:

```text
command
→ deterministic next state
→ local durable save
→ reload
→ same state hash
→ replay from command history
→ same state hash
```

---

# 103. First Slice Knowledge Test

Must prove:

```text
hidden red line exists
player cannot see it
decision preview does not reveal it
actor later reacts when crossed
new evidence can reveal it afterward
```

This validates the game's central imperfect-information architecture.

---

# 104. First Map Slice

After headless systems work:

```text
one territory polygon
one zone polygon
stable PMTiles subject ID
feature-state dynamic style
one player-intelligence overlay
click → SubjectRef → dossier projection
```

---

# 105. Milestone Gates

## Gate A — Kernel

Requires:

- package boundaries;
- schemas;
- rule/effect engine;
- command dispatcher;
- deterministic IDs;
- deterministic random vectors;
- canonical hash fixture.

## Gate B — Durable Headless Game

Requires:

- mandate chain;
- local persistence;
- replay;
- recovery snapshot;
- knowledge-leak tests.

## Gate C — Data/Artifact Pipeline

Requires:

- deterministic baseline;
- deterministic map artifact;
- provenance;
- license validation;
- artifact manifests.

## Gate D — Player Projection

Requires:

- import firewall;
- projection cache;
- truth/knowledge test suite.

## Gate E — Strategic UI

Requires:

- situation;
- dossier;
- assessment;
- mandate;
- decision tray;
- map slice.

## Gate F — Cloud

Requires:

- auth;
- cloud sync;
- coalesced revisions;
- conflict/fork behavior;
- edit lock.

## Gate G — AI

Requires:

- perspective filter;
- plain-text validated generation;
- stale response handling;
- outage fallback.

## Gate H — Full Sahel

Requires:

- 20-turn headless completion;
- balance report;
- save-size budget;
- performance profile;
- full E2E.

---

# 106. Definition of v2 Architecture Conformance

The implementation conforms only if:

1. `application` is a real boundary;
2. normal UI cannot import simulation/raw authoritative state;
3. serialized contracts derive TypeScript from executable schemas;
4. authoritative state is JSON-safe;
5. authoritative integer rounding is standardized;
6. simulation IDs are deterministic;
7. deterministic random test vectors pass;
8. canonical state hash fixtures pass;
9. strategic operations serialize;
10. local durability precedes visible commit;
11. cloud sync cannot overwrite newer revisions;
12. multi-tab write authority is controlled;
13. recovery snapshots exist;
14. exact scenario and baseline artifacts are pinned and verified;
15. old artifact versions are immutable inside the support window;
16. map features carry stable domain IDs;
17. CRS and geometry build rules are explicit;
18. player projections are the UI knowledge firewall;
19. stale narrative cannot masquerade as current state;
20. generated narrative is plain text/non-authoritative;
21. external GIS tools are version pinned;
22. source licenses/provenance are release gates;
23. technical failures are distinct from game uncertainty;
24. simulation can execute headlessly without React, MapLibre, Supabase, or AI;
25. the first vertical slice survives save/reload/replay with the same state hash.

---

# Appendix A — v2 Package Matrix

| Layer/package | domain | simulation | application | content | data pipeline | narrative | Supabase | React | MapLibre |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| domain | — | No | No | No | No | No | No | No | No |
| simulation | Yes | — | No | No | No | No | No | No | No |
| application | Yes | public API/port | — | No | No | contracts only | Port only | No | No |
| content | Yes | No | No | — | No | No | No | No | No |
| data-pipeline | Yes | No | No | No | — | No | No | No | build-only if needed |
| narrative | Yes | No | No | No | No | — | No | No | No |
| web | Yes | **No direct import** | Yes | compiled artifact only | No | client contracts | Yes | Yes | Yes |
| Edge Functions | Yes | No | No | No | No | Yes | Yes | No | No |
| testing | Yes | Yes | Yes | Yes | Yes | Yes | adapters | optional | optional |

---

# Appendix B — Authority Matrix

| Data | authoritative | persisted | UI access |
|---|---:|---:|---|
| CampaignState | Yes | Yes | projection only |
| RelationshipState | Yes | Yes | knowledge projection |
| PositionState | Yes | Yes | knowledge projection |
| PlayerKnowledgeState | Yes | Yes | Yes |
| MandateCaseState | Yes | Yes | Yes |
| ScheduledConsequences | Yes | Yes | forecast only |
| Domain events | Audit-authoritative | Yes | selected derived views |
| UI selection | No | optional local | Yes |
| map viewport | No | optional | Yes |
| narrative prose | No | separate cache | Yes |
| resolution trace | No | debug optional | debug only |
| PMTiles geometry | visual/source artifact | immutable external | Yes |
| raw datasets | source authority | outside campaign | methodology only |

---

# Appendix C — Recommended Open-Question Decisions

These recommendations are not automatically binding until stakeholder approval.

| Question | Recommended |
|---|---|
| Save compatibility window | current + previous two simulation models |
| Static host | provider supporting immutable assets + PMTiles byte ranges |
| Basemap | self-hosted curated vector basemap |
| Browser support | modern evergreen desktop browsers |
| Telemetry | provider-neutral, opt-in/appropriate consent policy |
| Narrative model | choose after benchmark; keep provider abstraction |
| Performance benchmark | define a representative mid-range desktop/laptop profile before Gate H |

---

# Appendix D — Required Documents After v2

Next specifications remain:

1. `AFRICAN_MANDATE_GAME_DESIGN_SPEC_v1.md`
2. `AFRICAN_MANDATE_DATA_AND_METHODOLOGY_SPEC_v1.md`
3. `AFRICAN_MANDATE_UI_UX_INTERACTION_SPEC_v1.md`
4. `AFRICAN_MANDATE_SAHEL_SCENARIO_SPEC_v1.md`
5. `AFRICAN_MANDATE_IMPLEMENTATION_ROADMAP_v1.md`

The next document should normally be the **Game Design Specification**, unless the immediate development priority is ingestion of the provided real-world datasets, in which case the **Data & Methodology Specification** may be written first.

---

This is the consolidated **African Mandate Technical Architecture & Implementation Blueprint v2**.
