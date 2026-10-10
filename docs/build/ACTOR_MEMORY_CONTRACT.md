# Actor relationships, positions, and memory contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-12 / PB2-12  
**Owners:** serialized actor state and operation schemas in `@african-mandate/domain`; deterministic memory, adaptation, and discovery resolution in `@african-mandate/simulation`  
**Classification:** canonical registry shapes with TEST_ONLY operation profiles; no production actor intent, stance, coefficient, or real-person claim

## Canonical ownership

`CampaignState` remains the sole mutable aggregate. Its `actors`, `relationships`, `positions`, `memories`, and `redLines` records now use the source-defined runtime shapes instead of generic JSON. Actor references must resolve to the matching position, memory, red line, commitment, and dispute owner. Relationship records are directional and only one record may own a given source-to-target direction. Position stance is issue-specific; it is not inferred from a general relationship.

Hidden `ActorRuntimeState.activeIntent`, authoritative positions, and red-line trigger rules never enter the player projection. Discovery writes only `PlayerKnowledgeState.redLineKnowledge` after explicit supporting evidence exists for the same actor or institution. Changing hidden intent or stance without knowledge evidence therefore cannot change player-visible output.

## Memory creation and once-only effects

The canonical `create_memory` effect is applied in the same atomic strategic-command draft as the decision. A successful creation writes one `MemoryRecord`, links it to its actor owner, applies the selected relationship delta once, applies the declared actor-fatigue delta once, and records the actual once-only relationship delta in `originalRelationshipEffects`. Duplicate commands return through the accepted idempotency path and cannot apply the effect again.

The source does not publish exact template, cooldown, or fatigue fields. `TestOnlyMemoryTemplateSchema`, `ActorMemoryEffectProfileSchema`, and the memory request/result/trace wrappers are therefore versioned TEST_ONLY proposals under AM-GOV-033. Consultation templates must declare an interaction tag and repetition policy. A repeat inside the declared cooldown uses only the explicitly declared repeat deltas; the fixture uses zero relationship gain and increased fatigue. No reward, intent, or production balance value is inferred.

## Conditional actor adaptation

The default source step 7 resolver remains `initial_no_op`. `createTestOnlyActorResolverRegistry` replaces only `actors_and_positions` when a caller supplies versioned TEST_ONLY profiles and turn plans. Eligibility may use only explicit memory tags and fatigue bounds. Applied profiles clamp actor fatigue/capabilities and relationship values to their canonical bounds, enforce source-direction and position-holder ownership, and create an explicit domain event keyed by `adaptationKey`. That event makes the plan once-only across later turns. Duplicate profile IDs and duplicate plan references fail closed.

These exact profile fields, conditions, deltas, trace fields, and rejection codes are not canonical production content. Production adaptation formulas, memory decay/salience changes, real actor intent, real institutional stance, semantic red-line discovery, and all balance coefficients remain BLOCKED pending domain/content review.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-12 | Typed actor, directional relationship, position, memory, red-line, discovery, and TEST_ONLY adaptation contracts | `tests/unit/actor-memory.test.ts` |
| AC-010 / SIM-02 | Consultation relationship effects occur once; duplicate submission is inert; repeated diplomacy cannot farm support | atomic consultation/memory test |
| PB2-12 negative | Reverse relation is not inferred and reverse-direction mutation is rejected atomically | directional lookup and adaptation rejection tests |
| PB2-12 negative | Hidden stance/intent cannot alter knowledge; red-line trigger stays hidden | differential projection and evidence-gated discovery tests |
| PB2-12 negative | Actor fatigue, capabilities, positions, and relationship scores stay bounded | step-7 adaptation clamp test |

No real person, government, or AES member receives a factual hidden intention or unified stance in this contract or its fixtures.
