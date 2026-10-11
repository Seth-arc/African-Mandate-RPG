# Production application adapter contract

**Task:** AM-PB2-20 / PB2-20  
**Contract version:** 1.0.0  
**Owner:** `@african-mandate/application`  
**Status:** READY_FOR_REVIEW; interfaces with no canonical exact shape remain TEST_ONLY proposals under AM-GOV-049

## Authority and boundary

The implementation follows Technical Architecture v2 sections 16, 20-23, 26, 29-32, 40, 45-48, 65-72 and 92 at source hash `982be4ecd82b996e14be83b6fd89a60a2876bb4e2505ed195889ad4f81dcee30`. It consumes the accepted Prompt 05 `SimulationPort`, Prompt 08 atomic services, Prompt 11 player-knowledge projection, Prompt 17 narrative contract, and Prompt 19 independent acceptance result. No second simulation engine or mutable source of authoritative state is introduced.

The application layer owns coordination, local durability, immutable-artifact retrieval, projections, sync metadata and narrative failover. Simulation remains the only decision/effect owner. UI imports only the application public root and cannot import domain, simulation, headless tooling, raw runtime state or debug projections.

## Public surfaces

| Surface | Public contract | Invariant |
|---|---|---|
| Artifact registry | `BrowserArtifactRegistryClient`, exact `CampaignArtifactRefsSchema`, `ReleaseManifestSchema`, `MapArtifactManifestSchema` | JSON is schema-valid before canonical SHA-256 comparison; a hash or pinned identity mismatch rejects; existing campaigns never consult `defaultForNewCampaigns` |
| Durable browser storage | `IndexedDbCampaignStorage`, `IndexedDbCampaignRepository` | stores `campaign_current`, `campaign_recovery`, `campaign_summaries`, `narrative_cache`, `storage_metadata`; current and recovery move in one read/write transaction; stale/equal revisions reject |
| Edit authority | `WebLocksCampaignEditLock` | one exclusive `african-mandate:campaign:<id>` lease; the lock callback remains held until explicit release |
| Projection facade | `CampaignProjection`, `ActionPreview`, `ResolutionProjection`, `CampaignProjectionFacade` | UI receives knowledge-safe envelopes, never raw CampaignState or resolver trace; response campaign/revision must match the request |
| Projection cache | `ProjectionCache` | key is revision + type + subject + locale + presentation-option hash; a newer authoritative revision removes every older entry |
| Sync metadata | `CampaignSyncStatusStore`, `CampaignSyncStateSchema` | source-defined status vocabulary; stale upload completion cannot replace or relabel the newer local head; no automatic merge |
| Narrative failover | `NarrativeFallbackService` | primary errors, invalid output or stale identity fall through to the injected deterministic `NarrativePort`; narrative never mutates campaign state |

`APPLICATION_ADAPTER_CONTRACT_VERSION` is `1.0.0`. `PROJECTION_FACADE_SCHEMA_VERSION` and `LOCAL_STORAGE_SCHEMA_VERSION` are independently versioned at `1`.

## Durable sequence

The existing accepted atomic command and EndTurn services retain the source sequence:

```text
SimulationPort result
-> validate and hash
-> IndexedDB local durable transaction
-> replace runtime state
-> rebuild/invalidate projections
-> enqueue optional sync/narrative work
```

`IndexedDbCampaignRepository.writeLocal` checks the current snapshot before invoking the storage transaction, while `IndexedDbCampaignStorage.commitCurrent` repeats the revision check inside the transaction to close the race. A failed write therefore prevents the runtime swap in the accepted atomic service.

## Exact fields and proposals

Technical v2 defines exact fields for `CampaignArtifactRefs`, `ReleaseManifest`, `ReleaseScenarioEntry` and `MapArtifactManifest`; the exported schemas preserve those shapes strictly. It names but does not fully specify the exact serialized fields for the projection envelopes, projection request, sync-state record, resolved immutable-URL lookup result, or injectable browser-storage seam. Those shapes are expressly TEST_ONLY design proposals requiring application/domain architecture review; they are not silently canonicalized or written into campaign state.

The accepted Prompt 08 `SaveSnapshotSchema` predates and lacks Technical v2 section 26's exact `artifacts: CampaignArtifactRefs` member. Prompt 20 publishes and validates that exact artifact-reference contract separately rather than weakening or silently changing the accepted snapshot. Integrating it into persisted saves requires an approved snapshot-version migration. Until then, production campaign initialization/resume is blocked; a live/current release artifact must never substitute for a missing pin.

## Explicit production blockers

- The Web Locks path is implemented. The source-required messaging + IndexedDB fallback lease is not invented because no lease record, timeout, heartbeat interval or takeover rule is approved. Browsers without Web Locks fail closed.
- Cloud transport, authentication, remote persistence and the explicit use-cloud/fork-local conflict workflows are not implemented. Sync metadata does not merge or overwrite campaign state.
- PMTiles binary retrieval/hash-at-publication, production artifact publishing/retention, production source admission and map provider selection remain unavailable.
- The current IndexedDB implementation is exercised through its repository/storage seam in Node. A real-browser IndexedDB migration/recovery run remains a Prompt 21+ browser gate.
- No production narrative provider, localization policy or rich rendering is approved; fallback remains the accepted deterministic plain-text implementation.

## Executable traceability

| Acceptance ID | Evidence |
|---|---|
| PB2-20 | `tests/unit/application-adapters.test.ts`, Prompt 20 log and handoff |
| AC-005 | deferred storage proves local durability completes before runtime revision changes; stale/equal writes reject |
| AC-008 | projection facade contains only player-knowledge output and application-owned public result fields |
| AC-020 | offline primary narrative deterministically falls back with matched request identity |
| AC-021 | UI package has only an application dependency; the UI-to-domain and web-to-simulation lint fixtures must fail |

Passing these synthetic adapter tests does not approve the remaining production blockers or mark PB2-20 ACCEPTED.
