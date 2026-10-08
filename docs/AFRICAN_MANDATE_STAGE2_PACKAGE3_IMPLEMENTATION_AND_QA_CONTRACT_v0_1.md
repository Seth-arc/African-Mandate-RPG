# African Mandate — Stage 2, Package 3: Four Months of Gameplay

**Version:** v0.1 · **Status:** authored design and compile contract, NOT executable ScenarioBundle, validated history, balanced or approved production content.  
**Authority:** Domain Model v1.1 → Technical Architecture v2 → Data & Methodology v1.1 → Game Design v2.1 → owner-approved Stage 1 → Stage 2 Packages 1–2 → this Package 3.  
**Campaign:** 1 October 2025 to resolution of Month 4 (January 2026); 20-month campaign overall, 3 strategic decisions per month (maximum 12 across this slice). Five playable countries: Mali, Burkina Faso, Niger, Chad, Mauritania. Administrative region IDs **not yet approved**. Historical conflict observation cutoff 26 September 2025; 27–30 September is unknown, not zero.

**Evidence classification:** `[H]` sourced historical context only; `[O]` accepted observed baseline only after compilation (none in this package); `[S]` deliberately fictional in-game content, not actual events; `[T]` synthetic test values; `[P]` provisional gameplay choice or balance; `[X]` blocked until named research/engineering gate. All player-facing documents concerning real states or organizations must say `SIMULATED` and not attribute invented quotes to real named individuals.

**Interpretation:** Scenario authoring tables give *possible branches*. The simulation must resolve them from keyed deterministic rules and stored state, never from script selecting the most dramatic outcome. Do not leak hidden actor stances in action availability or forecasts. Free inspection/drafting; all consequential consultations, collection, assessment adoption, escalation, negotiation, and authorization requests cost one decision slot. Each committed action resolves immediately and is non-reorderable/non-undoable in normal play.

## 1. Decision-to-domain crosswalk

| Authored concept | Engine owner | Required canonical registry | UI view |
|---|---|---|---|
| Request intelligence | Command validator/resolver | `PlayerKnowledgeState.collectionTasks`, `intelligenceGaps`, scheduled consequences | task status, known costs, arrival window |
| Consult counterpart | Command + issue-position resolver | `PositionState`, `PositionKnowledgeState`, `RelationshipState`, `MemoryRecord` | known/estimated positions only |
| Adopt assessment | Assessment command | `AssessmentState` and evidence IDs | declared confidence distinct from evidence confidence |
| Open case | Mandate command | `MandateCaseState`, coalition and authorization not-requested | case scope, authority need, conditions |
| Negotiate terms | Diplomacy command | commitments, case scope, position/memory events | before/after terms, actor reply |
| Request authorization | procedure-specific command | `AuthorizationState` | pending/conditional/rejected only when resolved |
| End month | `EndTurn` | conflict/civilian/actor, events, attention, evidence, evaluation | resolution ledger and month brief |

## 2. Required compiled registries (not provided here)

The content pipeline must create `ActorDefinition`s with `priorityWeights`, `riskTolerance`, `memoryProfileId` and initial red-line references; `InstitutionDefinition`s with `authorityDomains` and validated `authorizationProcedureIds`; `ActionDefinition`s with `actionDomain`, `commandType`, `decisionSlotCost`, `eligibilityRule`, `mandateRequirement`, effect and consequence profile references, `doctrineSignal`, `previewPolicyId`; validated closed-union effect handlers; `FactKey` allowlist and `RuleExpression`s; `ObservationCandidate`/`EvidenceRecord` typed source and contradiction facts; doctrine/balance profiles; stable scoped target IDs. All missing numeric values are `[P] TBD`; **do not manufacture defaults at compiler time.** Package 1 offers roles, not complete actor runtime definitions.

## 3. Deterministic pseudo-script coverage

The script list below is not runnable syntax; IDs and expected checks are a QA contract. It expects fixture-defined command IDs and campaign seed.

| Script | Month 1 | Month 2 | Month 3 | Month 4 | Expected assertions |
|---|---|---|---|---|---|
| `script_collect_first` | access task; AU consult; civilian route task | adopt assessment if known requirements; civic consult; open case if adopted | negotiate case; legal scope review or defer | revise based on evidence or coalition; end month | no instant reveal, task delayed, at most three actions/month |
| `script_diplomacy_first` | Mali consult; AU consult; optional assessment | civic consult; assess or open case | negotiate monitoring terms; OCHA consult | prioritize revised terms or B | issue position known only after evidence/actual response; memory once |
| `script_alternative_arc` | civilian route task; asset validation request | OCHA; new channel if warranted | open B or C only if prerequisites met; AfDB consult | capacity tradeoff / alternative case | no invented named asset or national totals; alternative path remains valid |
| `script_inactivity` | end month | end month | end month | end month | no forced case; some situation persists or expires by explicit rules; Month 5 starts correctly |
| `script_overconfident` | adopt high confidence when legal; other steps | escalate | contradiction arrives through valid source | revise or maintain | no auto-correct; visible accountability when undermined |
| `script_hidden_variation` | submit same eligible consult | same known history under separate hidden seeds | compare visibility | compare resolution | eligibility remains identical until evidence differs; outcomes may diverge |
| `script_invalid_authorization` | any | open qualifying case | attempt request without vetted procedure | none | action visibly disabled due known missing procedure, no slot consumed |
| `script_duplicate_command` | submit same command ID twice | — | — | — | no duplicate slot/effects/events; atomicity preserved |

**Property checks:** initial evidence set exactly equals emitted records; replacing hidden stance without known evidence cannot alter player projections; unrelated evidence cannot be marked contradictory; zero geographical observations cannot imply observed stability; task completion source details are traceable; snapshot hash reproduces after save/replay; timeout/saving failures do not commit a decision; no mandatory-slot deadlocks.

## 4. Event and forecast authoring schema template

```yaml
# AUTHORING ONLY — intentionally incomplete, NOT a valid ScenarioBundle
id: action_m03_negotiate_monitoring_terms
family: diplomacy
decisionSlotCost: 1
subject: { kind: mandate_case, id: case_access_monitoring }
knownEligibility:
  requires: [known_actor_channel, active_case, known_legal_constraints]
  missingPolicy: unknown_is_not_a_hidden_veto
terms:
  liaisonRole: [limited, joint, none]
  reportingRoute: [independent, joint_review, host_only]
  resourceOffer: [none, bounded_test_allocation]
immediate:
  commandType: PROPOSED_COMMAND_TYPE_TO_REGISTER
  effectProfiles: [PENDING_VALIDATED_EFFECT_PROFILE]
future:
  eventDefinitionRefs: [PENDING_EVENT_DEFINITIONS]
preview:
  basis: player_knowledge_only
  uncertainty: explicit
balance:
  costProfile: PENDING_NUMERIC_PROFILE
  repeatPolicy: PENDING_COOLDOWN_OR_DIMINISHING_RETURN
```

## 5. Copy templates to author during compilation

Each document: reference ID, author/recipient roles, date, SIMULATED marker, player-knowledge source IDs, short plain summary, evidence separated from assessment, specific known choice and confidence. Variant templates required for collection useful/partial/contested/inconclusive/pending/failed, counterpart accepts/conditional/refuses, commitment fulfilled/breached, case opened, case narrowed, case blocked, revised assessment, evidence stale, month handoff, unresolved attention. Never invent real official statements or quote specific real living individuals.

## 6. Producer approvals and acceptance gates

- **Stage 1 owner approval:** recorded in conversation.
- **Package 1/2 statuses:** authoring drafts; no balance, legal or source QA signoff implied.
- **Package 3:** content authoring design, not implementation.
- **Before content freeze:** actual actor priorities/stances, institution procedure review, costs/rules/effects, validated boundaries and baseline availability, complete copy template coverage.
- **Before playable:** runtime compilation, test harness, deterministic simulation, valid projections, persistence and UI.
- **Before public release:** historical fact verification, regional/institutional review, source licence review and usability playtest.
