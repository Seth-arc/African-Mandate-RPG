# Event, doctrine, and evaluation contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-16 / PB2-16  
**Owners:** serialized state and operation schemas in `@african-mandate/domain`; deterministic TEST_ONLY resolution and projection in `@african-mandate/simulation`  
**Classification:** TEST_ONLY design proposal requiring independent review

## Canonical authority and ownership

`CampaignState` remains the only mutable aggregate. Its `worldEvents`, `doctrine`, and `evaluation` fields now use strict typed schemas rather than generic JSON envelopes.

- `WorldEventInstance` uses the exact Domain v1.1 runtime fields and remains distinct from immutable technical `DomainEventRecord` entries.
- `DoctrineState` owns the signed four-axis observed vector, codification flag/profile/turn, and modifiers. This milestone updates only `observed` and adds no codification command or modifier.
- `EvaluationState` is explicitly `unavailable`; all six canonical dimensions are `unscored` with reason `APPROVED_COEFFICIENTS_UNAVAILABLE`, and the snapshot list must remain empty. No parallel score store exists.

World-event keys must match embedded IDs. Source decision and consequence references and situation-to-event references validate against the same campaign snapshot.

## Conditional event resolution

The opt-in `TEST_ONLY_EVENT_DIRECTOR` consumes canonical `EventDefinition` values, registered simulation facts, observations, and versioned trigger plans. Definitions are processed by stable `eventDefinitionId` order under the explicit `all_eligible_by_definition_id` fixture policy. A definition triggers only when:

1. its authored turn window permits the current turn;
2. it has not already triggered this turn;
3. its occurrence and cooldown limits permit another instance; and
4. its rule evaluates deterministically to `true`.

An unknown rule result rejects without mutation. Missing references, ambiguous plans, non-empty effect/consequence profiles, and conflicting situation identity also reject. Non-empty profiles are forbidden because source step 10 effect execution is not part of this milestone. The default event adapter remains `initial_no_op`; only the explicit fixture registry installs this resolver.

An eligible definition creates one canonical world-event instance and one immutable technical event. The technical event payload and `DEVELOPER_ONLY_CAUSE_TRACE` retain typed source links to baseline, world dynamics, decisions, prior world events, or scheduled consequences. These traces are not player projections.

`KnowledgeSafeWorldEvent` exposes only observed event identity, turn, family, subjects, and status. It contains no rule, fact value, hidden cause, callback tag, or developer trace.

## Situation persistence and reactions

A trigger plan may explicitly open or update one canonical situation. Existing situations persist when no rule triggers. Re-running the resolver in the same turn cannot create a second world event, domain event, or situation callback. No implicit deterioration, catastrophe, escalation, expiry, or resolution is inferred.

## Observational doctrine and Month 5 review

Source step 16 deterministically recomputes the observed doctrine vector from all committed `DecisionRecord.doctrineDelta` values. Values must sum to integers and are clamped only to the canonical signed-score range. Recomputing from authoritative decisions prevents double accumulation. The exact recomputation/clamping trace is a TEST_ONLY proposal; production weights remain unapproved.

Doctrine Review eligibility is a pure knowledge-neutral response:

- before Month 5: unavailable;
- at active Month 5 or later: observational review available;
- non-active campaign: unavailable.

Ending Month 4 first performs source step 16, then advances the calendar to Month 5. The resolver never sets `codified`, chooses a profile, applies a modifier, or consumes a slot. A future codification command must remain a separate consequential action after approved profiles exist.

## Evaluation boundary

The six dimensions are security, civilian outcomes, regional stability, institutional cohesion, legitimacy, and mandate sustainability. Prompt 16 publishes their typed interface but does not calculate them. Source step 17 verifies the explicit unavailable state and records no snapshot. Final evaluation remains an initial no-op. In particular, missing inputs are not converted to zero, no 0–100 score is invented, and no overall score exists.

AC-024 remains `BLOCKED` until a versioned methodology supplies approved coefficients, trajectory rules, critical-state rules, summary codes, and projection requirements. The canonical scored snapshot/result schemas are published for future approved input but are not accepted by the current authoritative `EvaluationState`.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-16 | Deterministic conditional event paths, developer trace, safe event projection, observational doctrine, and unavailable evaluation | `tests/unit/event-doctrine-evaluation.test.ts` |
| AC-014 / SIM-03 | Inaction and a quiet month remain legal; existing situations persist; no forced catastrophe | quiet-month test |
| AC-014 / SIM-04 | Doctrine Review is unavailable in Month 4 and available at Month 5 without codification | Month-5 test |
| AC-007 / AC-025 / SIM-11 | A fourth consequential command in the same month rejects without mutation | fourth-action negative test |
| AC-024 | Six named dimensions exist but stay unscored; invented zero/overall scores reject | unavailable-evaluation test; production gate remains BLOCKED |

Production event content, weighted selection, attention pacing, immediate event effects, narrative rendering, situation dynamics, doctrine profiles/codification, evaluation coefficients, final results, and UI are excluded.
