# Turn lifecycle contract

**Contract version:** 1.1.0
**Task:** AM-PB2-09 / PB2-09
**Owners:** serialized state and operation schemas in `@african-mandate/domain`; deterministic resolver/calendar execution in `@african-mandate/simulation`; serialized durable commit in `@african-mandate/application`
**Classification:** TEST_ONLY lifecycle kernel; Prompt 10 adds opt-in fixture-only world adapters, Prompt 11 adds an opt-in fixture-only intelligence-collection adapter, and Prompt 12 adds an opt-in fixture-only actor-adaptation adapter while all unimplemented defaults remain initial no-ops

## Canonical state

`CampaignState` remains the one mutable aggregate. Prompt 09 replaces its former JSON envelopes with the source-defined `ScheduledConsequence`, `SituationState`, `AttentionState`, and `AttentionItem` schemas. Record keys must equal embedded IDs. A scheduled consequence must have at least one source and a valid turn window. No additional expiry field, hidden UI queue, or parallel lifecycle store exists.

Unresolved situations and attention items persist across month changes. The lifecycle does not infer deterioration, transformation, resolution, or expiry. A scheduled/eligible consequence changes to `expired` only after its explicit `latestTurn` has passed. Eligibility-rule evaluation and effect execution are deliberately not guessed; those adapters remain no-ops until their accepted subsystem contracts arrive.

## EndTurn operation

`EndTurnRequestSchema` carries a source-shaped `end_turn` command plus expected revision and all seven pinned versions. The exact wrapper and rejection fields are the TEST_ONLY proposal AM-GOV-027. `AtomicCampaignTurnService` uses the same accepted campaign coordinator, runtime authority, `SaveSnapshot`, repository, canonical hash, and durable-before-memory order as strategic commands.

A successful non-final EndTurn:

1. validates campaign/revision/version/turn and blocking attention;
2. executes the registered resolver sequence;
3. records the bounded resolver trace and immutable `end_turn_completed` event;
4. forfeits unused slots by replacing them with exactly `decisionsPerTurn` for the next turn;
5. increments the turn and advances the ISO date by one exact calendar month; and
6. increments revision once before durable commit.

At `maxTurns`, every resolver and the final-evaluation adapter still run. The campaign becomes `completed`, unused slots become zero, revision increments once, and neither `currentTurn` nor `currentDate` advances.

## Resolver registry

The registry is not caller-ordered. It must contain every Domain v1.1 section 97 resolver in the published order, with world step 8 expanded as 8a through 8e. Validation and calendar/final completion remain core lifecycle operations. The `final_evaluation` adapter is conditional on the final turn.

Only two initial adapters implement state behavior:

- `scheduled_consequences`: expires an unresolved consequence only after an explicit `latestTurn`;
- `attention`: preserves authoritative attention across the rollover.

The other 20 default adapters are labeled `initial_no_op` in every trace. They neither fabricate a crisis/event nor falsely mark subsystem resolution. Prompt 10 adds the `test_only_fixture` trace label and an opt-in registry factory that replaces only world phases 8a through 8d with declared canonical effects. Prompt 11 uses the same accepted adapter label in a separate opt-in registry factory that replaces only source step 12, `intelligence_collection`, with declared resolution plans; tasks before their explicit due turn are unchanged. Prompt 12 uses it in a separate opt-in registry factory that replaces only source step 7, `actors_and_positions`, with explicit versioned TEST_ONLY adaptation profiles and turn plans. Phase 8e and every other unimplemented default remain no-ops. Changing order requires the source-mandated simulation-model version bump.

## Mandatory attention capacity

Every unresolved item with `level = decision_required` and `blocking = true` reserves one strategic slot. An ordinary command cannot spend a reserved slot. The review-required `mandatoryResponseAttentionItemId` request field identifies the one blocking item resolved by the same atomic decision package. After every command, remaining slots must still cover remaining blockers. EndTurn is rejected while a blocker remains, and a resolver result that creates more next-month mandatory responses than `decisionsPerTurn` is rejected.

No production action-to-attention authorization rule is inferred. The explicit binding is TEST_ONLY pending review and future compiled-content validation.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-09 | Ordered lifecycle, typed state, atomic durable EndTurn, and bounded trace | `tests/unit/turn-lifecycle.test.ts` |
| AC-007 | Three-slot refresh/no carryover, exact four-month calendar, final-turn no advance | rollover and Month 20 tests |
| AC-025 | Known mandatory capacity is reserved and the final response slot cannot softlock | mandatory response and blocked-EndTurn tests |

Production adapters, effect execution, event creation, spontaneous crises, balance values, UI projection, IndexedDB/Web Locks, cloud sync, and narrative remain excluded.
