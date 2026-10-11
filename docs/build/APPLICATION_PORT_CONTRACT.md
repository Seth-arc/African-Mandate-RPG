# Application port and operation contract

**Contract version:** 1.2.0 (`1.0.0` accepted by PB2-05; `1.1.0` accepted with PB2-09)
**Task:** AM-PB2-05 / PB2-05; AM-PB2-09 / PB2-09; AM-PB2-17 / PB2-17; AM-PB2-20 / PB2-20
**Owner:** `@african-mandate/application`  
**Status:** PB2-05, PB2-08, PB2-09, PB2-17 and PB2-19 ACCEPTED; Prompt 20 browser/projection adapters are READY_FOR_REVIEW; no cloud or production narrative-provider adapter

## Ownership boundary

The application package serializes authoritative operations, calls a `SimulationPort`, coordinates persistence and edit locks, and invokes artifact/narrative dependencies. It does not calculate simulation effects, mutate hidden state from UI code, or create a second command dispatcher.

| Public contract | Responsibility | Source |
|---|---|---|
| `SimulationPort` | Dispatch, end turn, initialize, and build a knowledge-safe projection through an injected engine adapter | Technical v2 §§17-18 |
| `CampaignRepository` / `CampaignPersistencePort` | Load and durably write local snapshots; optional cloud synchronization stays non-authoritative | Technical v2 §§17, 20-21 |
| `ArtifactRegistryClient` | Load the release manifest and exact scenario, baseline, map, and methodology artifacts | Technical v2 §30 |
| `NarrativePort` | Request optional presentational narrative outside the authoritative operation lock | Technical v2 §§17, 19, 48 |
| `CampaignEditLock` / `CampaignEditLockPort` | Acquire exclusive campaign write authority and release its lease | Technical v2 §§13, 17, 23 |
| `CampaignOperationCoordinator` | Serialize the five source-listed authoritative operation classes per campaign | Technical v2 §§9, 19-20, 48 |

`APPLICATION_PORT_CONTRACT_VERSION` is `1.2.0`. Prompt 09 added the typed `turnCommand` generic and passed it to `endTurn`. Prompt 17 adds `CanonicalNarrativePortTypes` and makes it the default `NarrativePort` family, binding the existing optional port to Zod-inferred request/result contracts without importing narrative implementation code into application. Custom injected test families remain compatible.

## Deliberate generic boundary

Technical v2 names method payloads such as `CommandResult`, `ProjectionRequest`, `EditLock`, artifact references, and map/release manifests without defining all exact serialized fields in Prompt 05's accepted predecessors. The ports therefore use required generic type families rather than permissive `any`, placeholder fields, or duplicate handwritten serialized interfaces. Later prompts must bind those families to their Zod-inferred canonical contracts without changing operation ownership.

No new serialized artifact was created by Prompt 05. Its repository/lock naming, compatibility aliases, minimal `{ campaignId, release() }` lease, generic families, and `runExclusive` signature are recorded as TEST_ONLY design proposal AM-GOV-019. Prompt 20 now binds the artifact, projection, persistence and sync families described in `PRODUCTION_APPLICATION_ADAPTER_CONTRACT.md` without changing the frozen generic `SimulationPort`.

## Coordinator semantics

- Only the five authoritative operation kinds may enter `runExclusive`.
- Operations for the same campaign execute in submission order, one at a time.
- Different campaigns do not share a queue.
- Failure releases both the operation queue and edit lease.
- Invalid campaign IDs and operation kinds fail before lock acquisition.
- Narrative and cloud synchronization are separate ports and never enter the authoritative operation API.

Prompt 08 adds `AtomicCampaignCommandService` without adding another coordinator. It binds the accepted operation boundary to a typed simulation dispatcher, canonical state hash, `SaveSnapshot`, durable repository write, and post-write runtime replacement. Cloud, narrative, projection-store, and production browser adapters remain later work.

Prompt 09 adds `AtomicCampaignTurnService` through the same coordinator, repository, snapshot, and runtime store. It calls the injected EndTurn dispatcher, validates its result and current-state immutability, writes durably, and only then replaces runtime authority. It adds no second mutable store.

Prompt 17 binds only the optional presentational narrative port. `DeterministicNarrativePort` lives in the separate narrative package, imports only domain contracts, performs no authoritative operation, and requires no operation lock. Prompt 20 adds application-owned failover and identity checking around that port; no production provider is selected.

Prompt 20 adds the browser IndexedDB repository, Web Locks edit authority, verified immutable JSON artifact client, revision-aware sync status, and projection facade/cache. These consume the accepted atomic services and ports; they do not calculate effects or create another runtime store. Cloud transport, real-browser validation, the fallback heartbeat lease, and SaveSnapshot artifact-pin migration remain explicit blockers.

## Application and test adapters

The public root retains deterministic in-memory adapters for injected simulation handlers, local snapshots with one-shot write failure, artifact handlers, narrative handlers, and an exclusive edit lock. It additionally exports the Prompt 20 production adapter foundations. No cloud backend, browser session/authentication, fallback heartbeat lease, or production narrative provider is implemented.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-05 | Ports frozen/versioned before engine and UI work | `tests/unit/application-ports.test.ts`; Prompt 05 CI log and handoff |
| AC-005 | Durable failure must not acknowledge or replace state | `tests/unit/command-atomicity.test.ts` injects a failed write and pins prior runtime/repository hashes and state |
| AC-006 | Duplicate command cannot double-apply | Prompt 08 duplicate submission test pins one decision, event, revision, cost, and slot charge |
| AC-007 | Successful EndTurn advances/refreshed or finalizes exactly once | Prompt 09 lifecycle and durable-service tests |
| AC-025 | Mandatory response cannot be bypassed or softlock the final slot | Prompt 09 reservation and blocking-EndTurn tests |
| AC-020 / SIM-16 | Narrative is knowledge-safe, plain text, stale-guarded, and available without a provider | `tests/unit/narrative-fallback.test.ts`; `docs/build/NARRATIVE_FALLBACK_CONTRACT.md` |
| PB2-20 / AC-005 / AC-008 / AC-020 | Browser durability, immutable artifact verification, projection revision safety and offline narrative failover | `tests/unit/application-adapters.test.ts`; `docs/build/PRODUCTION_APPLICATION_ADAPTER_CONTRACT.md` |
| AC-021 | UI/web may not import simulation or hidden state; UI may not import domain | Both forbidden-import fixtures must fail ESLint |
