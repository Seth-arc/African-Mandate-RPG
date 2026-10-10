# Atomic command and durable snapshot contract

**Contract version:** 1.1.0 (`1.0.0` accepted by PB2-08; Prompt 09 extension pending review)
**Snapshot version:** 1  
**Task:** AM-PB2-08 / PB2-08  
**Owners:** serialized contracts in `@african-mandate/domain`; deterministic next-state calculation in `@african-mandate/simulation`; operation serialization and durable commit in `@african-mandate/application`  
**Classification:** TEST_ONLY first-wave implementation; no production browser persistence adapter

## Public contracts

`@african-mandate/domain` publishes strict Zod schemas and inferred types for:

- `SaveSnapshot`, matching Domain v1.1 §123 with `snapshotVersion`, campaign identity/revision, pinned versions, authoritative state, authoritative state hash, and optional non-authoritative presentation cache;
- `AtomicStrategicCommandRequest`, binding a canonical strategic command to the caller's expected revision and complete pinned version set;
- simulation input/result envelopes used behind the accepted `SimulationPort` boundary; and
- committed, duplicate, and rejected application results.

The exact request/result envelopes, rejection codes, and snapshot version literal were not assigned exact upstream serialized fields. PB2-08 accepted the bounded TEST_ONLY proposal recorded as AM-GOV-025. Prompt 09 extends the request with optional `mandatoryResponseAttentionItemId` and bounded reservation rejection codes under AM-GOV-027; this `1.1.0` extension remains review-required.

## Ownership and commit order

`InProcessStrategicCommandDispatcher` calculates a candidate next state without mutating the supplied current state. `AtomicCampaignCommandService` owns this sequence under the existing `CampaignOperationCoordinator`:

1. schema-validate the request;
2. acquire the campaign's serialized `strategic_command` operation;
3. read the single in-memory authoritative state;
4. call the injected simulation dispatcher through `StrategicCommandSimulationPort`;
5. validate the returned schema and commit invariants;
6. hash the authoritative candidate state with canonical JSON and SHA-256;
7. build and validate `SaveSnapshot`;
8. call `CampaignRepository.writeLocal`;
9. replace the in-memory authoritative state only after the durable write resolves; and
10. return the committed result.

The durable repository is persistence, not a second independently mutable simulation owner. `InMemoryCampaignRuntimeStore` is the sole runtime authority in this test-only adapter and deep-freezes every accepted state.

## Atomicity and idempotency

- A successful consequential command deducts exactly one strategic slot, applies its exact known cost, appends one immutable decision and audit event, marks the command processed, and increments revision once.
- Existing `processedCommandIds` plus the immutable `DecisionRecord` journal identify a duplicate before stale revision/version checks. A duplicate returns the original decision identity and does not write, mutate, charge, or emit again.
- Rejected commands return the current revision/hash when a campaign was resolved and never write or replace state.
- A persistence failure raises `CampaignPersistenceError`; the prior runtime state remains authoritative and the fault-injectable repository preserves its prior snapshot.
- Expected revision and all seven pinned campaign versions must match before a new command can commit.
- A malformed or invariant-breaking simulation result is rejected before persistence.

## Deliberate bounded scope

Prompt 08 has no accepted closed effect or scheduled-consequence payload union. The first-wave dispatcher therefore supports a synthetic consequential action only when `immediateEffectProfileIds` and `consequenceProfileIds` are empty. Non-empty profiles fail closed with explicit rejection codes. Exact effect handlers and consequence scheduling remain assigned to their later canonical prompts; no arbitrary mutation callback or content-authored code was introduced.

Prompt 09 supplies EndTurn calendar/resolver behavior. The command dispatcher now preserves enough capacity for every known unresolved blocking `decision_required` item. A command may claim one such item through the explicit TEST_ONLY request field, resolve it in the same atomic decision package, and spend the final reserved slot without producing a same-month softlock.

Production IndexedDB, Web Locks, cloud synchronization, recovery snapshots, projection caching, narrative, UI, and multi-tab conflict handling remain outside this milestone.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-08 | Simulation → validation/hash → durable write → runtime replacement | `tests/unit/command-atomicity.test.ts` successful commit and snapshot assertions |
| AC-005 | Failed local write leaves resources, events, slots, revision, runtime hash, and durable snapshot unchanged | injected `failNextWrite` test |
| AC-006 | Duplicate command does not reapply effects, consume another slot, emit another event, increment revision, or rewrite persistence | duplicate submission test |
| AC-007 | One successful consequential command changes slots from 3 to 2 | successful commit test; full EndTurn chronology remains Prompt 09 |
| AC-025 | Command and EndTurn cannot overlap inside the authoritative campaign operation | gated-write concurrency test; mandatory-response lifecycle remains Prompt 09 |

Additional negative coverage pins known-rule rejection, revision mismatch, version mismatch, state-hash tampering, and invalid simulation output.
