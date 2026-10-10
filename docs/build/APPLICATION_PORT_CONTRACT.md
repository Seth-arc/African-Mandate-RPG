# Application port and operation contract

**Contract version:** 1.1.0 (`1.0.0` accepted by PB2-05)
**Task:** AM-PB2-05 / PB2-05; AM-PB2-09 / PB2-09
**Owner:** `@african-mandate/application`  
**Status:** PB2-05 and PB2-08 ACCEPTED; Prompt 09 EndTurn binding is READY_FOR_REVIEW; no production browser adapter

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

`APPLICATION_PORT_CONTRACT_VERSION` is `1.1.0`. Prompt 09 adds the typed `turnCommand` generic and passes it to `endTurn`; this review-required AM-GOV-027 extension binds the already accepted operation to an explicit request without weakening package ownership.

## Deliberate generic boundary

Technical v2 names method payloads such as `CommandResult`, `ProjectionRequest`, `EditLock`, artifact references, and map/release manifests without defining all exact serialized fields in Prompt 05's accepted predecessors. The ports therefore use required generic type families rather than permissive `any`, placeholder fields, or duplicate handwritten serialized interfaces. Later prompts must bind those families to their Zod-inferred canonical contracts without changing operation ownership.

No new serialized artifact is created by Prompt 05, so no new artifact schema is claimed. The requested repository/lock naming, compatibility aliases, minimal `{ campaignId, release() }` lease, generic families, and `runExclusive` signature are recorded as the TEST_ONLY design proposal AM-GOV-019.

## Coordinator semantics

- Only the five authoritative operation kinds may enter `runExclusive`.
- Operations for the same campaign execute in submission order, one at a time.
- Different campaigns do not share a queue.
- Failure releases both the operation queue and edit lease.
- Invalid campaign IDs and operation kinds fail before lock acquisition.
- Narrative and cloud synchronization are separate ports and never enter the authoritative operation API.

Prompt 08 adds `AtomicCampaignCommandService` without adding another coordinator. It binds the accepted operation boundary to a typed simulation dispatcher, canonical state hash, `SaveSnapshot`, durable repository write, and post-write runtime replacement. Cloud, narrative, projection-store, and production browser adapters remain later work.

Prompt 09 adds `AtomicCampaignTurnService` through the same coordinator, repository, snapshot, and runtime store. It calls the injected EndTurn dispatcher, validates its result and current-state immutability, writes durably, and only then replaces runtime authority. It adds no second mutable store.

## Test adapters

The public root exposes in-memory adapters for injected simulation handlers, local snapshots with one-shot write failure, artifact handlers, narrative handlers, and an exclusive edit lock. They are deterministic test infrastructure only. No IndexedDB, Web Locks, cloud, network, browser session, or production narrative provider is implemented.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-05 | Ports frozen/versioned before engine and UI work | `tests/unit/application-ports.test.ts`; Prompt 05 CI log and handoff |
| AC-005 | Durable failure must not acknowledge or replace state | `tests/unit/command-atomicity.test.ts` injects a failed write and pins prior runtime/repository hashes and state |
| AC-006 | Duplicate command cannot double-apply | Prompt 08 duplicate submission test pins one decision, event, revision, cost, and slot charge |
| AC-007 | Successful EndTurn advances/refreshed or finalizes exactly once | Prompt 09 lifecycle and durable-service tests |
| AC-025 | Mandatory response cannot be bypassed or softlock the final slot | Prompt 09 reservation and blocking-EndTurn tests |
| AC-021 | UI/web may not import simulation or hidden state | Existing forbidden-import fixture remains green; no UI change in Prompt 05 |
