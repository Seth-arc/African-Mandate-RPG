# Application port and operation contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-05 / PB2-05  
**Owner:** `@african-mandate/application`  
**Status:** READY_FOR_REVIEW; synthetic/test-only adapters, no production browser adapter

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

`APPLICATION_PORT_CONTRACT_VERSION` freezes these interfaces at `1.0.0` before command-engine and UI implementation.

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

Prompt 05 does not implement the durable commit sequence. Prompt 08 must implement and test simulation → validation/hash → durable local write → in-memory replacement → optional cloud/narrative ordering without adding another coordinator or dispatcher.

## Test adapters

The public root exposes in-memory adapters for injected simulation handlers, local snapshots with one-shot write failure, artifact handlers, narrative handlers, and an exclusive edit lock. They are deterministic test infrastructure only. No IndexedDB, Web Locks, cloud, network, browser session, or production narrative provider is implemented.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-05 | Ports frozen/versioned before engine and UI work | `tests/unit/application-ports.test.ts`; Prompt 05 CI log and handoff |
| AC-005 | Durable failure must not acknowledge or replace state | In-memory repository fault injection exists for Prompt 08; atomic commit behavior remains NOT_RUN |
| AC-021 | UI/web may not import simulation or hidden state | Existing forbidden-import fixture remains green; no UI change in Prompt 05 |

