# African Mandate
## Greenfield Domain Model & Simulation Specification v1.1

**Document type:** Canonical game-domain and simulation specification  
**Status:** v1.1 — revised implementation specification  
**Supersedes:** Greenfield Domain Model & Simulation Specification v1.0  
**Primary scenario:** Sahel  
**Architecture posture:** Greenfield  
**Reference implementation:** The existing African Mandate GitHub repository is a reference library for mechanics, content, UX lessons, assets, tests, and production findings. It does **not** constrain this architecture.  
**Product identity:** Intelligence-informed geopolitical strategy simulation centered on institutional mandate-building under uncertainty.

---

# 0. Normative Status, Revision Scope, and Conventions

## 0.1 Purpose of this revision

v1.0 established the intended game ontology and major architectural boundaries, but it left several implementation-critical questions unresolved.

v1.1 closes those gaps by:

1. separating immutable **definitions**, immutable **observed baseline**, hidden **simulation truth**, player-visible **knowledge**, and non-authoritative **presentation**;
2. removing duplicated mutable sources of truth between territory, zone, conflict, civilian, and infrastructure state;
3. defining all previously referenced but undefined core types and registries;
4. defining where memories, commitments, red lines, disputes, evidence, reports, gaps, positions, world events, and situations are canonically stored;
5. defining the player/envoy state and material-resource state inside the campaign aggregate;
6. defining a formal `ActionDefinition`, command economy, effect model, and safe rule model;
7. clarifying which player commands consume the three monthly strategic-decision slots;
8. replacing ambiguous arbitrary field-path rules with a validated fact-query model and tri-state rule evaluation;
9. clarifying mandate creation, coalition state, authorization procedure, implementation progression, and outcome classification;
10. replacing mutually exclusive “partial vs distorted” mandate outcomes with independent delivery, integrity, and net-impact dimensions;
11. defining precise turn timing, end-turn sequencing, turn-20 completion behavior, and blocking attention items;
12. replacing order-sensitive mutable RNG state with deterministic keyed randomness;
13. defining intelligence collection/tasking, evidence confidence decay, contradictions, and assessment staleness;
14. separating general relationships from issue-specific institutional positions;
15. clarifying actor memory semantics so relationship effects are not accidentally applied twice;
16. making hidden-information boundaries enforceable in player eligibility rules, forecasts, map selectors, and AI narrative contexts;
17. clarifying that this architecture is **snapshot-authoritative with immutable audit events**, not full event sourcing;
18. defining save revisioning, state hashing, replay verification, migration rules, and cloud conflict handling;
19. defining data provenance, licensing metadata, baseline immutability, and deterministic scenario compilation;
20. defining developer observability, resolution traces, headless simulation, balance testing, and anti-information-leak tests.

Appendix A maps the major v1.0 ambiguities to their v1.1 resolutions.

---

## 0.2 Normative language

This specification uses:

- **MUST** — required for conformance;
- **MUST NOT** — prohibited;
- **SHOULD** — strongly recommended; deviation requires a documented reason;
- **SHOULD NOT** — strongly discouraged; deviation requires a documented reason;
- **MAY** — optional;
- **SCENARIO-CONFIGURABLE** — intentionally variable by scenario;
- **BALANCE-TUNABLE** — numeric or weighted behavior intended to be adjusted without changing engine code;
- **PRESENTATIONAL** — affects rendering or UX but not authoritative simulation state.

---

## 0.3 Configuration taxonomy

Every behavior MUST belong to one of four categories.

### Engine invariant

Fundamental rules that scenario content cannot override.

Examples:

- hidden truth and player knowledge are distinct;
- commands are atomic;
- authoritative randomness is deterministic;
- AI cannot mutate authoritative state;
- immutable baseline does not change during a campaign.

### Scenario configuration

Rules that legitimately differ by scenario.

Examples:

- playable territories;
- campaign length;
- authorization institutions;
- available action definitions;
- actor roster;
- scenario start date;
- early-termination rules.

### Balance configuration

Numerical coefficients that tune behavior.

Examples:

- memory decay;
- conflict spillover weights;
- mandate distortion coefficients;
- implementation rates;
- confidence decay;
- doctrine modifiers.

### Presentation configuration

Non-authoritative display behavior.

Examples:

- colors;
- typography;
- briefing prose templates;
- map labels;
- animations.

Engine code MUST NOT hide balance values that designers are expected to tune.

---

## 0.4 Explicit v1 non-goals

v1 does **not** require:

- continent-wide playable campaigns;
- real-time multiplayer;
- competitive anti-cheat;
- server-authoritative simulation;
- live real-world data updates inside an active campaign;
- LLM-controlled game logic;
- procedurally generated states or borders;
- unrestricted mod scripting;
- real-time tactical combat;
- fully simulated individual citizens;
- a single “correct policy” answer.

Because the v1 simulation is expected to run client-side, hidden variables are **game-hidden**, not cryptographically secret from a technically sophisticated player inspecting runtime state.

If competitive multiplayer or authoritative leaderboards are later introduced, server-authoritative simulation becomes a separate architectural requirement.

---

# 1. Product Definition

African Mandate places the player in the role of an **African Union strategic envoy** operating at the intersection of:

- intelligence analysis;
- institutional politics;
- coalition-building;
- mandate authorization;
- implementation constraints;
- geopolitical consequence management.

The central strategic tension is:

> **Knowing what should be done does not mean possessing the evidence, authority, political support, capacity, or time required to do it.**

The player does not directly control:

- armies;
- sovereign governments;
- development banks;
- intelligence agencies;
- regional organizations;
- external powers.

The player must:

- interpret;
- assess;
- persuade;
- negotiate;
- authorize;
- coordinate;
- prioritize;
- adapt.

---

# 2. Core Gameplay Model

## 2.1 Player loop

**Observe → Assess → Build Mandate → Decide → Implement → Reassess**

This describes the player experience.

## 2.2 Institutional causality loop

**World State → Observation → Evidence → Assessment → Coalition → Authorization → Implementation → Consequence → Memory → New World State**

This describes the simulation.

## 2.3 Important distinction

The player loop and causality loop MUST NOT be collapsed.

The player experiences a limited, uncertain representation of the simulation.

The simulation may know facts that the player does not.

---

# 3. Core Design Principles

## 3.1 Agency

Player decisions MUST materially affect future state.

The game MUST NOT simulate responsiveness only through prose.

---

## 3.2 Imperfect information

The architecture MUST distinguish:

```text
True State
Observed Signals
Evidence
Reports
Player Knowledge
Player Assessments
```

The UI MUST NOT directly expose hidden true state unless a rule explicitly makes that state observable.

---

## 3.3 Institutional constraint

The game MUST distinguish:

```text
Knowing
Wanting
Supporting
Authorizing
Implementing
Achieving
```

These are separate state transitions.

---

## 3.4 Persistent world

Actors and institutions MUST retain strategically meaningful consequences of prior player behavior.

---

## 3.5 Multi-system consequence

Major interventions SHOULD affect several systems rather than a single meter.

Potential systems include:

- relationships;
- institutional positions;
- conflict;
- civilian outcomes;
- development;
- infrastructure;
- legitimacy;
- implementation capacity;
- external-power competition;
- future authorization.

---

## 3.6 Deterministic authority

Given the same:

- scenario version;
- baseline version;
- simulation version;
- balance profile;
- difficulty profile;
- campaign seed;
- ordered command history;

the simulation MUST produce the same authoritative state.

---

## 3.7 AI is presentational

Generative AI MAY render:

- dialogue;
- diplomatic cables;
- summaries;
- intelligence prose;
- briefings;
- end-of-campaign narrative.

Generative AI MUST NOT authoritatively decide:

- probabilities;
- actor intent;
- relationship deltas;
- conflict outcomes;
- mandate progression;
- authorization;
- hidden truth;
- evaluation scores.

---

## 3.8 Real data is baseline, not destiny

Real-world data may initialize observed baseline conditions.

Once the scenario begins:

> simulation outcomes are fictional game outcomes, not forecasts or claims about reality.

---

# 4. Architectural Layers

The architecture is divided into five truth layers.

```text
DEFINITIONS
    ↓
OBSERVED BASELINE
    ↓
SIMULATION TRUTH
    ↓
PLAYER KNOWLEDGE
    ↓
PRESENTATION
```

These layers MUST remain structurally distinct.

---

# 5. Definitions, Baseline, Runtime, Knowledge, Presentation

## 5.1 Definitions

Definitions are immutable authored content describing what entities **are**.

Examples:

- territory names and geometry references;
- actor priorities;
- institution authority domains;
- action definitions;
- event definitions;
- authorization procedures;
- doctrine profiles.

Definitions do not contain campaign-specific mutable state.

---

## 5.2 Observed baseline

The baseline is an immutable compiled representation of source data at a specific version/date.

Examples:

- observed conflict events;
- power assets;
- pipelines;
- construction;
- cables;
- displacement;
- financing;
- source quality;
- provenance.

Baseline records are observations, not mutable runtime truth.

---

## 5.3 Simulation truth

Simulation truth is the hidden authoritative world state used by the engine.

The player does not automatically see it.

---

## 5.4 Player knowledge

Player knowledge consists only of information that the player's office has obtained.

It includes:

- evidence;
- reports;
- intelligence gaps;
- adopted assessments;
- known actor positions;
- known commitments;
- discovered red lines.

---

## 5.5 Presentation

Presentation includes:

- rendered text;
- map styling;
- animations;
- open panels;
- selected entities;
- generated narrative cache.

Presentation MUST NOT become authoritative simulation state.

---

# 6. Source-of-Truth Rule

No mutable concept may have more than one canonical writable source.

Examples:

- zone conflict values live in `ConflictWorldState`;
- zone civilian values live in `CivilianWorldState`;
- asset operational values live in `InfrastructureWorldState`;
- actor relationship values live in `RelationshipState`;
- assessment lifecycle lives in `AssessmentState`.

Territory-level conflict, civilian, and infrastructure summaries MUST be derived through selectors.

They MUST NOT also be independently writable fields on `TerritoryRuntimeState`.

This is a key v1.1 correction.

---

# 7. Canonical Scalar Conventions

## 7.1 Score

```ts
type Score = number
```

Unless otherwise stated, a `Score` is an integer from `0` to `100`.

```text
0   = minimum
50  = midpoint
100 = maximum
```

The engine MUST clamp scores after mutation.

---

## 7.2 Signed score

```ts
type SignedScore = number
```

Range:

```text
-100 .. +100
```

Used for directional balances such as leverage or doctrine axes.

---

## 7.3 Probability

```ts
type Probability = number
```

Range:

```text
0.0 .. 1.0
```

Probabilities are engine-facing and SHOULD NOT automatically be exposed to the player.

---

## 7.4 Money

```ts
interface MoneyAmount {
  amount: number
  currency: string
}
```

`amount` is stored in whole currency units unless a scenario explicitly requires finer precision.

A scenario MUST define its canonical budget currency.

---

## 7.5 Population and counts

Populations, fatalities, event counts, and similar quantities MUST use explicit count fields rather than 0–100 normalization.

---

## 7.6 Dates

Calendar dates MUST use ISO `YYYY-MM-DD`.

Timestamps used only for saves/logging MAY use full ISO 8601 timestamps.

Authoritative simulation behavior MUST depend on turn/date state, not wall-clock time.

---

# 8. Canonical IDs and References

Opaque stable IDs are mandatory.

Recommended prefixes:

```text
campaign_
territory_
zone_
asset_
corridor_
institution_
actor_
relationship_
position_
memory_
commitment_
redline_
dispute_
evidence_
report_
gap_
collection_
assessment_
case_
authorization_
project_
decision_
worldevent_
situation_
attention_
consequence_
briefing_
action_
effectprofile_
eventdef_
```

---

## 8.1 Party references

Whenever either an actor or institution may participate, use:

```ts
type PartyRef =
  | { kind: 'actor'; id: ActorId }
  | { kind: 'institution'; id: InstitutionId }
```

Raw ambiguous string IDs MUST NOT be used when entity type matters.

---

## 8.2 Subject references

```ts
type SubjectRef =
  | { kind: 'territory'; id: TerritoryId }
  | { kind: 'zone'; id: ZoneId }
  | { kind: 'asset'; id: AssetId }
  | { kind: 'corridor'; id: CorridorId }
  | { kind: 'actor'; id: ActorId }
  | { kind: 'institution'; id: InstitutionId }
  | { kind: 'assessment'; id: AssessmentId }
  | { kind: 'mandate_case'; id: MandateCaseId }
  | { kind: 'world_event'; id: WorldEventId }
```

---

# 9. Versioning

Every campaign pins:

```ts
interface CampaignVersions {
  gameSchemaVersion: number
  simulationModelVersion: string
  baselineVersion: string
  scenarioVersion: string
  contentVersion: string
  balanceProfileVersion: string
  methodologyVersion: string
}
```

Campaign reproducibility requires all seven.

---

# 10. Immutable Scenario Bundle

The simulation is initialized from an immutable `ScenarioBundle`.

```ts
interface ScenarioBundle {
  scenario: ScenarioDefinition

  territoryDefinitions: Record<TerritoryId, TerritoryDefinition>
  zoneDefinitions: Record<ZoneId, ZoneDefinition>

  assetDefinitions: Record<AssetId, AssetDefinition>
  corridorDefinitions: Record<CorridorId, CorridorDefinition>

  institutionDefinitions: Record<InstitutionId, InstitutionDefinition>
  actorDefinitions: Record<ActorId, ActorDefinition>

  actionDefinitions: Record<ActionId, ActionDefinition>
  eventDefinitions: Record<EventDefinitionId, EventDefinition>

  authorizationProcedures: Record<string, AuthorizationProcedureDefinition>
  effectProfiles: Record<EffectProfileId, EffectProfile>

  doctrineProfiles: Record<string, DoctrineProfile>
  difficultyProfiles: Record<string, DifficultyProfile>

  balance: BalanceConfiguration
  methodology: MethodologyManifest
}
```

All cross-references MUST validate before a build is considered playable.

---

# 11. Scenario Definition

```ts
interface ScenarioDefinition {
  scenarioId: string
  titleKey: string

  baselineId: string

  startDate: string

  maxTurns: number
  turnDuration: 'calendar_month'
  decisionsPerTurn: number

  representedInstitutionId: InstitutionId

  territoryIds: TerritoryId[]
  initialInstitutionIds: InstitutionId[]
  initialActorIds: ActorId[]

  difficultyProfileIds: string[]

  earlyTerminationRuleIds: string[]
  finalEvaluationProfileId: string
}
```

Initial Sahel defaults:

```text
turn duration = 1 calendar month
max turns = 20
strategic decisions per turn = 3
```

---

# 12. Campaign State Aggregate

```ts
interface CampaignState {
  meta: CampaignMeta

  player: EnvoyState

  world: WorldRuntimeState

  institutions: Record<InstitutionId, InstitutionRuntimeState>
  actors: Record<ActorId, ActorRuntimeState>

  relationships: Record<RelationshipId, RelationshipState>
  positions: Record<PositionId, PositionState>

  memories: Record<MemoryId, MemoryRecord>
  commitments: Record<CommitmentId, CommitmentRecord>
  redLines: Record<RedLineId, RedLineState>
  disputes: Record<DisputeId, DisputeState>

  knowledge: PlayerKnowledgeState

  assessments: Record<AssessmentId, AssessmentState>
  mandateCases: Record<MandateCaseId, MandateCaseState>
  implementations: Record<ProjectId, ImplementationState>

  worldEvents: Record<WorldEventId, WorldEventInstance>
  situations: Record<SituationId, SituationState>

  attention: AttentionState

  scheduledConsequences: Record<ConsequenceId, ScheduledConsequence>

  doctrine: DoctrineState
  evaluation: EvaluationState

  decisions: DecisionRecord[]
  domainEvents: DomainEventRecord[]

  processedCommandIds: Record<string, true>

  versions: CampaignVersions
}
```

The snapshot is authoritative.

`domainEvents` are immutable audit records but are **not** the sole source of truth.

This is therefore a **snapshot-authoritative, event-audited architecture**, not full event sourcing.

---

# 13. Campaign Metadata

```ts
interface CampaignMeta {
  campaignId: CampaignId
  scenarioId: string

  campaignSeed: string

  difficultyProfileId: string

  currentTurn: number
  maxTurns: number

  currentDate: string

  decisionsRemaining: number
  decisionsPerTurn: number

  revision: number

  status:
    | 'active'
    | 'completed'
    | 'terminated'
    | 'invalid'

  terminationReasonCode?: string
}
```

---

# 14. Turn Calendar Semantics

At campaign creation:

```text
currentTurn = 1
currentDate = scenario.startDate
decisionsRemaining = decisionsPerTurn
```

A turn covers the calendar month beginning at `currentDate`.

When the player ends turn `N`:

1. background resolution for turn `N` runs;
2. if the campaign is not complete or terminated, `currentTurn` increments;
3. `currentDate` advances exactly one calendar month;
4. decision slots refresh.

At the end of the final configured turn:

- resolution still runs;
- final evaluation runs;
- campaign becomes `completed` or `terminated`;
- turn does not advance beyond `maxTurns`.

---

# 15. Envoy / Player State

```ts
interface EnvoyState {
  representedInstitutionId: InstitutionId

  materialResources: MaterialResourceState
  institutionalCapacity: EnvoyCapacityState
}
```

---

## 15.1 Material resources

```ts
interface MaterialResourceState {
  budget: MoneyAmount
  personnel: number
  logistics: Score
}
```

---

## 15.2 Institutional capacity

```ts
interface EnvoyCapacityState {
  mandateAuthority: Score
  politicalCapital: Score
  secretariatCapacity: Score

  memberStateAlignment: Score
  partnerConfidence: Score

  implementationCapacity: Score
  intelligenceConfidence: Score
}
```

### Canonical semantics

**Mandate authority**  
The envoy office's current political/institutional room to initiate or coordinate action. It is not the same as formal authorization for a specific mandate.

**Political capital**  
Spendable capacity to pressure, bargain, prioritize, or absorb political cost.

**Secretariat capacity**  
Administrative bandwidth available to sustain active mandate work.

**Member-state alignment**  
Derived overall alignment among relevant member states. It SHOULD be derived rather than directly spent.

**Partner confidence**  
Derived willingness of external or multilateral partners to cooperate.

**Implementation capacity**  
The envoy/AU system's practical ability to coordinate delivery.

**Intelligence confidence**  
A strategic summary of access, source quality, and analytical capacity. It MUST NOT overwrite evidence-specific confidence.

---

# 16. Territory and Zone Definitions

Static definition:

```ts
interface TerritoryDefinition {
  territoryId: TerritoryId
  nameKey: string

  geometryRef: string

  zoneIds: ZoneId[]

  governmentInstitutionId: InstitutionId
}
```

```ts
interface ZoneDefinition {
  zoneId: ZoneId
  territoryId: TerritoryId

  nameKey: string
  geometryRef: string

  adjacentZoneIds: ZoneId[]

  tags: string[]
}
```

Geometry MUST live in static definition/baseline data, not mutable campaign state.

---

# 17. World Runtime State

```ts
interface WorldRuntimeState {
  territories: Record<TerritoryId, TerritoryRuntimeState>
  zones: Record<ZoneId, ZoneRuntimeState>

  conflict: ConflictWorldState
  civilian: CivilianWorldState
  infrastructure: InfrastructureWorldState
  development: DevelopmentWorldState

  externalEnvironment: ExternalEnvironmentState
}
```

---

# 18. Territory Runtime State

```ts
interface TerritoryRuntimeState {
  territoryId: TerritoryId

  stability: Score
  institutionalCapacity: Score
  economicResilience: Score

  politicalStatusTags: string[]
}
```

Territory conflict pressure, civilian confidence, and infrastructure resilience MUST be derived from subsystem state.

---

# 19. Zone Runtime State

```ts
interface ZoneRuntimeState {
  zoneId: ZoneId

  statePresence: Score

  controlContest: Score

  localGovernanceCapacity: Score

  tags: string[]
}
```

Conflict, civilian, development, and infrastructure values MUST remain in their subsystem registries.

---

# 20. Institution Definition

```ts
type AuthorityDomain =
  | 'diplomacy'
  | 'mediation'
  | 'security'
  | 'humanitarian'
  | 'development'
  | 'infrastructure'
  | 'monitoring'
  | 'sanctions'
  | 'finance'
  | 'intelligence'

interface InstitutionDefinition {
  institutionId: InstitutionId

  institutionType:
    | 'au'
    | 'regional_organization'
    | 'government'
    | 'multilateral'
    | 'external_power'
    | 'commercial'
    | 'civil_society'
    | 'security_actor'

  nameKey: string

  authorityDomains: AuthorityDomain[]

  actorIds: ActorId[]

  authorizationProcedureIds: string[]

  reportingProfileId?: string
}
```

---

# 21. Institution Runtime State

```ts
interface InstitutionRuntimeState {
  institutionId: InstitutionId

  resources: InstitutionalResources

  policyPositions: Record<string, Score>

  activeCommitmentIds: CommitmentId[]
  activeDisputeIds: DisputeId[]

  legitimacy: Score
  coordinationCapacity: Score
}
```

---

## 21.1 Institutional resources

```ts
interface InstitutionalResources {
  financialCapacity: Score
  personnelCapacity: Score
  logisticsCapacity: Score
  diplomaticCapacity: Score
  intelligenceCapacity: Score
  implementationCapacity: Score
}
```

These are normalized capability values.

Actual scenario money is represented separately where required.

---

# 22. Actor Definition

```ts
interface ActorDefinition {
  actorId: ActorId

  institutionId?: InstitutionId

  actorType:
    | 'political_leadership'
    | 'bureaucratic'
    | 'security'
    | 'armed_group'
    | 'diplomatic'
    | 'commercial'
    | 'civil_society'
    | 'community'
    | 'external_power'

  nameKey: string

  priorityWeights: Record<string, Score>

  riskTolerance: Score

  memoryProfileId: string

  reportingProfileId?: string

  initialRedLineDefinitionIds: string[]
}
```

Priorities belong in immutable actor definition unless scenario rules explicitly change them.

---

# 23. Actor Runtime State

```ts
interface ActorRuntimeState {
  actorId: ActorId

  capabilities: ActorCapabilityState

  activeIntent: ActorIntentState

  issuePositionIds: PositionId[]

  memoryIds: MemoryId[]
  commitmentIds: CommitmentId[]
  redLineIds: RedLineId[]
  disputeIds: DisputeId[]

  fatigue: Score
}
```

---

## 23.1 Actor capabilities

```ts
interface ActorCapabilityState {
  political: Score
  coercive: Score
  financial: Score
  information: Score
  implementation: Score
}
```

---

## 23.2 Actor intent

```ts
interface ActorIntentState {
  activeGoalCodes: string[]

  aggressiveness: Score
  opportunism: Score
  compromiseWillingness: Score

  strategyTags: string[]
}
```

`activeIntent` is hidden truth unless evidence reveals it.

---

# 24. Directional Relationship State

Relationships are directional.

```ts
interface RelationshipState {
  relationshipId: RelationshipId

  source: PartyRef
  target: PartyRef

  trust: Score
  strategicAlignment: Score

  sourceDependenceOnTarget: Score

  sourceLeverageOverTarget: SignedScore

  access: Score
  credibility: Score

  lastChangedTurn: number
}
```

If reciprocal state is needed, create a second directional relationship.

Do not infer symmetry.

---

# 25. Issue-Specific Position State

A general relationship does not answer:

> “Does this actor support this mandate?”

Issue-specific positions do.

```ts
type PositionSubjectRef =
  | { kind: 'assessment'; id: AssessmentId }
  | { kind: 'mandate_case'; id: MandateCaseId }
  | { kind: 'action'; id: ActionId }
  | { kind: 'issue'; id: string }

interface PositionState {
  positionId: PositionId

  holder: PartyRef
  subject: PositionSubjectRef

  stance:
    | 'strong_support'
    | 'support'
    | 'conditional_support'
    | 'neutral'
    | 'resist'
    | 'strong_resist'

  intensity: Score

  conditionCodes: string[]

  lastChangedTurn: number
}
```

`PositionState` is hidden authoritative state.

Whether the player knows that position belongs in `PlayerKnowledgeState`, not in the position itself.

Coalition state MUST use issue-specific positions rather than a global actor posture.

---

# 26. Memory Registry

Memory can belong to an actor or institution.

```ts
interface MemoryRecord {
  memoryId: MemoryId

  owner: PartyRef

  createdTurn: number

  sourceDecisionId?: DecisionId
  sourceDomainEventId?: string

  memoryType:
    | 'promise'
    | 'support'
    | 'exclusion'
    | 'pressure'
    | 'concession'
    | 'betrayal'
    | 'consultation'
    | 'sanction'
    | 'intervention'
    | 'failure'
    | 'success'
    | 'red_line_violation'

  salience: Score

  persistenceClass:
    | 'routine'
    | 'significant'
    | 'enduring'

  tags: string[]

  originalRelationshipEffects: {
    trust?: number
    strategicAlignment?: number
    credibility?: number
  }
}
```

### Memory-effect rule

`originalRelationshipEffects` are applied **once**, when the memory is created.

They MUST NOT be re-applied every turn.

Subsequent actor adaptation may consider the memory's remaining salience.

---

# 27. Commitment Registry

```ts
interface CommitmentRecord {
  commitmentId: CommitmentId

  issuer: PartyRef
  beneficiary: PartyRef

  createdTurn: number
  dueTurn?: number

  commitmentType: string
  descriptionKey: string

  fulfillmentRules: RuleExpression[]

  status:
    | 'active'
    | 'fulfilled'
    | 'breached'
    | 'waived'
    | 'expired'

  sourceDecisionId?: DecisionId

  resolvedTurn?: number
}
```

The engine MUST evaluate active commitments:

- after relevant commands;
- during end-turn commitment resolution.

Breaches MUST create domain events and SHOULD create memory.

---

# 28. Red-Line Registry

```ts
interface RedLineState {
  redLineId: RedLineId

  holder: PartyRef

  triggerRule: RuleExpression

  severity:
    | 'soft'
    | 'significant'
    | 'hard'

  consequenceProfileId: EffectProfileId

  status:
    | 'active'
    | 'crossed'
    | 'waived'
    | 'expired'

  crossedTurn?: number
}
```

`RedLineState` is hidden authoritative state.

Player awareness of a red line is represented separately as:

```ts
type RedLineKnowledgeStatus =
  | 'suspected'
  | 'known'
```

Hidden red lines MUST NOT affect player decision previews as known facts.

They MAY contribute to a generic “unknown reaction risk” only when the player's existing evidence justifies recognizing uncertainty.

---

# 29. Dispute Registry

```ts
interface DisputeState {
  disputeId: DisputeId

  participants: PartyRef[]

  topicCode: string

  severity: Score

  openedTurn: number
  lastChangedTurn: number

  status:
    | 'open'
    | 'escalating'
    | 'managed'
    | 'resolved'

  tags: string[]
}
```

---

# 30. Intelligence Architecture

Canonical flow:

```text
Hidden World Truth
     ↓
Observation Rules
     ↓
Observation Candidates
     ↓
Collection / Passive Reporting
     ↓
Evidence Records
     ↓
Intelligence Reports
     ↓
Player Assessment
```

The UI and player eligibility system MUST operate from player knowledge, not hidden world truth.

---

# 31. Player Knowledge State

```ts
interface PlayerKnowledgeState {
  evidence: Record<EvidenceId, EvidenceRecord>
  reports: Record<ReportId, IntelligenceReport>

  intelligenceGaps: Record<IntelligenceGapId, IntelligenceGap>
  collectionTasks: Record<CollectionTaskId, CollectionTask>

  redLineKnowledge: Record<RedLineId, RedLineKnowledgeStatus>

  positionKnowledge: Record<PositionId, PositionKnowledgeState>

  knownCommitmentIds: CommitmentId[]
  knownDisputeIds: DisputeId[]

  relationshipKnowledge: Record<RelationshipId, RelationshipKnowledgeState>
}
```

```ts
interface PositionKnowledgeState {
  status:
    | 'estimated'
    | 'known'

  estimatedStance?:
    | 'strong_support'
    | 'support'
    | 'conditional_support'
    | 'neutral'
    | 'resist'
    | 'strong_resist'

  confidence: Score

  supportingEvidenceIds: EvidenceId[]
}
```

```ts
interface RelationshipKnowledgeState {
  trustEstimate?: Score
  alignmentEstimate?: Score
  leverageEstimate?: SignedScore
  dependenceEstimate?: Score

  confidence: Score

  supportingEvidenceIds: EvidenceId[]
}
```

All evidence in `PlayerKnowledgeState` is player-accessible.

Hidden truth does not belong in this registry.

The player-facing relationship dossier MUST use `relationshipKnowledge`, not raw `RelationshipState`.

---

# 32. Observation Candidate

Observation candidates are internal ephemeral objects created by the simulation.

They are not automatically player-visible.

```ts
interface ObservationCandidate {
  observationId: string

  subject: SubjectRef

  claim: EvidenceClaim

  sourceChannel: string

  baseReliability: Score

  discoverability: Score

  earliestTurn: number
}
```

Observation candidates MAY be materialized as evidence if reporting/collection rules succeed.

---

# 33. Typed Evidence Claims

`claimValue: unknown` is not permitted in v1.1.

```ts
type EvidenceClaim =
  | {
      kind: 'scalar'
      metric: string
      value: number
      unit?: string
    }
  | {
      kind: 'range'
      metric: string
      min: number
      max: number
      unit?: string
    }
  | {
      kind: 'category'
      category: string
      value: string
    }
  | {
      kind: 'boolean'
      proposition: string
      value: boolean
    }
  | {
      kind: 'entity_relation'
      relation: string
      target: SubjectRef
    }
  | {
      kind: 'text_claim'
      claimCode: string
    }
```

---

# 34. Evidence Record

```ts
interface EvidenceRecord {
  evidenceId: EvidenceId

  subject: SubjectRef

  claim: EvidenceClaim

  sourceType:
    | 'observed_baseline'
    | 'simulation_observation'
    | 'institutional_report'
    | 'actor_claim'
    | 'open_source'
    | 'partner_intelligence'
    | 'field_reporting'

  sourceParty?: PartyRef

  initialConfidence: Score
  sourceReliability: Score

  observedTurn: number
  observedDate?: string

  decayProfileId: string

  contradictionKey?: string

  provenanceRef?: string

  reportSensitivity:
    | 'open'
    | 'restricted'
    | 'sensitive'
}
```

Evidence is immutable after creation except for explicit correction/supersession metadata.

Current effective confidence is derived.

---

# 35. Evidence Confidence

The engine SHOULD derive effective confidence from:

```text
initial confidence
× freshness
× source reliability
× corroboration modifier
× access/collection quality modifier
```

Exact coefficients are BALANCE-TUNABLE.

```ts
function getEffectiveEvidenceConfidence(
  evidence: EvidenceRecord,
  currentTurn: number,
  knowledge: PlayerKnowledgeState,
  balance: BalanceConfiguration
): Score
```

Confidence decay MUST NOT mutate the original evidence record.

---

# 36. Contradiction Model

Evidence MAY share a `contradictionKey`.

Example:

```text
zone_mopti.security_control
```

Evidence with materially incompatible claims under the same contradiction key is presented as contested.

Contradictions SHOULD preferentially arise through institutional/source differences rather than arbitrary noise.

---

# 37. Reporting Profiles

Institutions and actors that generate evidence MAY have a reporting profile.

```ts
interface ReportingProfile {
  reportingProfileId: string

  baselineReliability: Score
  averageDelayTurns: number

  biasTags: string[]

  incentiveRuleIds: string[]
}
```

A reporting profile affects evidence generation.

It MUST NOT directly rewrite hidden truth.

---

# 38. Intelligence Reports

```ts
interface IntelligenceReport {
  reportId: ReportId

  createdTurn: number

  evidenceIds: EvidenceId[]

  sourceParty?: PartyRef

  headlineKey: string
  bodyTemplateKey?: string

  urgency:
    | 'routine'
    | 'developing'
    | 'priority'
    | 'critical'

  sensitivity:
    | 'open'
    | 'restricted'
    | 'sensitive'

  relatedAssessmentIds: AssessmentId[]
}
```

Report confidence is derived from its evidence.

---

# 39. Intelligence Gaps

```ts
interface IntelligenceGap {
  intelligenceGapId: IntelligenceGapId

  subject: SubjectRef

  questionCode: string

  strategicImportance: Score

  status:
    | 'open'
    | 'tasked'
    | 'partially_resolved'
    | 'resolved'

  createdTurn: number
  resolvedTurn?: number
}
```

Known ignorance is a first-class strategic state.

---

# 40. Intelligence Collection Tasks

```ts
interface CollectionTask {
  collectionTaskId: CollectionTaskId

  gapId?: IntelligenceGapId

  subject: SubjectRef
  questionCode: string

  collectionChannel:
    | 'au_field'
    | 'partner'
    | 'open_source'
    | 'host_government'
    | 'diplomatic'
    | 'technical'

  requestedTurn: number
  dueTurn: number

  expectedQuality: Score

  status:
    | 'tasked'
    | 'collecting'
    | 'completed'
    | 'failed'

  sourceDecisionId: DecisionId
}
```

A `RequestIntelligence` strategic action SHOULD create a collection task rather than immediately reveal hidden truth.

---

# 41. Assessment State

```ts
interface AssessmentState {
  assessmentId: AssessmentId

  subject: SubjectRef

  hypothesisCode: string

  lifecycleStatus:
    | 'draft'
    | 'adopted'
    | 'revised'
    | 'withdrawn'
    | 'superseded'

  analysisStatus:
    | 'current'
    | 'contested'
    | 'stale'
    | 'undermined'

  declaredConfidence: Score

  evidenceSupportScore: Score
  contradictionScore: Score

  supportingEvidenceIds: EvidenceId[]
  contradictoryEvidenceIds: EvidenceId[]

  intelligenceGapIds: IntelligenceGapId[]

  institutionalImplicationCodes: string[]

  adoptedTurn?: number
  revisedFromAssessmentId?: AssessmentId
}
```

### Important rule

The engine MAY recalculate:

- evidence support;
- contradiction;
- staleness;
- `analysisStatus`.

The engine MUST NOT automatically rewrite the player's adopted hypothesis.

Revision requires a player command.

---

# 42. Assessment Adoption

A materially consequential assessment adoption SHOULD consume one strategic decision slot.

Assessment adoption MAY:

- unlock action definitions;
- change institutional positions;
- increase accountability for later outcomes;
- create memories;
- create a mandate case.

The engine MUST NOT reveal whether an assessment is objectively “correct.”

---

# 43. Action Definitions

v1.0 named Actions but did not define them.

```ts
interface ActionDefinition {
  actionId: ActionId

  nameKey: string
  descriptionKey: string

  actionDomain: AuthorityDomain

  commandType: string

  decisionSlotCost: 0 | 1

  targetSchema: ActionTargetSchema

  eligibilityRule: RuleExpression

  mandateRequirement:
    | 'none'
    | 'assessment'
    | 'coalition'
    | 'authorization'

  knownCostProfileId?: string

  immediateEffectProfileIds: EffectProfileId[]

  implementationProfileId?: string

  consequenceProfileIds: string[]

  doctrineSignal: DoctrineDelta

  previewPolicyId: string
}
```

---

# 44. Strategic Decision Economy

The default rule is:

> Every player command that changes authoritative political, institutional, world, mandate, relationship, or intelligence-collection state costs one strategic decision slot.

Examples that normally cost `1`:

- adopt assessment;
- request intelligence;
- consult actor when it changes relationship/position;
- offer commitment;
- negotiate coalition condition;
- seek authorization;
- revise mandate scope;
- launch implementation;
- respond to crisis.

Zero-cost player operations MAY NOT:

- alter world truth;
- change relationships;
- create commitments;
- change actor positions;
- create implementation;
- resolve a crisis;
- create material resources.

Zero-cost operations are generally presentation/organization and SHOULD live outside the simulation.

`EndTurn` is a special zero-cost campaign command.

---

# 45. Command Types

```ts
interface SimulationCommand<TPayload = unknown> {
  commandId: string

  commandType: string

  campaignId: CampaignId

  submittedTurn: number

  payload: TPayload
}
```

Every command MUST have a deterministic validator and resolver.

---

# 46. Command Atomicity and Idempotency

A command is atomic.

If validation fails:

- no state mutation occurs;
- no decision slot is consumed;
- no domain event is emitted.

If `commandId` already exists in `processedCommandIds`, the engine MUST reject or return the original result without double-applying effects.

Successful strategic commands MUST:

1. validate;
2. calculate decision cost;
3. apply immediate effects;
4. reconcile commitments/red lines;
5. create domain events;
6. schedule consequences;
7. decrement decision slots;
8. increment campaign revision.

---

# 47. Ending a Turn

The player MAY end a turn with unused strategic decisions.

Unused decisions are forfeited.

The player MUST NOT carry them forward.

A `decision_required` attention item MAY block end-turn only if:

```ts
blocking: true
```

Blocking behavior is SCENARIO-CONFIGURABLE and MUST be used sparingly.

---

# 48. Safe Rule Model

Arbitrary property paths such as:

```text
world.zones.mopti.conflictPressure
```

MUST NOT be evaluated directly from unvalidated content.

Instead, rule content uses validated fact queries.

```ts
interface FactQuery {
  fact: FactKey

  subject?: SubjectSelector
}
```

Example:

```yaml
fact: zone.conflict_pressure
subject:
  type: zone
  id: zone_mopti
operator: gte
value: 70
```

---

# 49. Rule Scopes

Rules MUST declare an execution scope.

```ts
type RuleScope =
  | 'simulation'
  | 'player_eligibility'
  | 'player_forecast'
  | 'narrative'
```

### Simulation rules

MAY access hidden true state.

### Player eligibility rules

MUST access only:

- player knowledge;
- player resources/capacity;
- known institutional state;
- known mandate state.

They MUST NOT use hidden truth in a way that leaks information through action availability.

### Player forecast rules

MUST be knowledge-limited.

### Narrative rules

MUST respect the narrative perspective's knowledge boundary.

---

# 50. Tri-State Rule Evaluation

Rules evaluate to:

```ts
type RuleResult = 'true' | 'false' | 'unknown'
```

Unknown MUST NOT silently equal false.

Each rule consumer defines an unknown policy.

Default:

```text
player eligibility: fail closed
simulation event trigger: unknown is invalid configuration unless explicitly supported
forecast: surface uncertainty
```

---

# 51. Rule Operators

Allowed operators:

```text
eq
neq
gt
gte
lt
lte
contains
not_contains
exists
not_exists
all
any
not
```

No arbitrary JavaScript or `eval`.

---

# 52. Effect Model

v1.0 referenced effect profiles without defining safe effects.

Effects MUST be a closed discriminated union.

```ts
type SimulationEffect =
  | AdjustRelationshipEffect
  | AdjustInstitutionResourceEffect
  | AdjustEnvoyCapacityEffect
  | AdjustTerritoryCoreEffect
  | AdjustZoneCoreEffect
  | AdjustConflictEffect
  | AdjustCivilianEffect
  | AdjustDevelopmentEffect
  | AdjustInfrastructureEffect
  | SetAssetStatusEffect
  | CreateMemoryEffect
  | CreateCommitmentEffect
  | OpenDisputeEffect
  | ChangePositionEffect
  | CreateEvidenceEffect
  | CreateCollectionTaskEffect
  | CreateMandateCaseEffect
  | AdvanceMandateEffect
  | CreateImplementationEffect
  | ScheduleConsequenceEffect
  | CreateWorldEventEffect
  | AddAttentionEffect
```

Effect handlers MUST be engine-owned and unit-tested.

---

# 53. Effect Profiles

```ts
interface EffectProfile {
  effectProfileId: EffectProfileId

  effects: SimulationEffect[]
}
```

Content MAY compose effect profiles.

Content MUST NOT define arbitrary mutation code.

---

# 54. Decision Preview

The player sees a knowledge-limited forecast.

```ts
interface DecisionPreview {
  actionId: ActionId

  knownCosts: PreviewCost[]

  likelyInstitutionalReactions: ForecastReaction[]

  knownRisks: ForecastRisk[]

  intelligenceGaps: IntelligenceGapId[]

  requiredAuthorization?: string

  implementationDependencies: string[]

  confidence: Score
}
```

The preview MUST be generated from player knowledge.

It MUST NOT expose hidden red lines, hidden actor intent, or exact simulation probabilities unless those are genuinely known.


Supporting forecast types:

```ts
interface PreviewCost {
  costType:
    | 'budget'
    | 'personnel'
    | 'political_capital'
    | 'secretariat_capacity'
    | 'implementation_capacity'

  amount?: number
  money?: MoneyAmount

  certainty:
    | 'known'
    | 'estimated'
}
```

```ts
interface ForecastReaction {
  party: PartyRef

  expectedDirection:
    | 'positive'
    | 'neutral'
    | 'negative'
    | 'uncertain'

  confidence: Score

  basisEvidenceIds: EvidenceId[]
}
```

```ts
interface ForecastRisk {
  riskCode: string

  likelihoodBand:
    | 'low'
    | 'moderate'
    | 'high'
    | 'unknown'

  impactBand:
    | 'low'
    | 'moderate'
    | 'high'
    | 'critical'

  confidence: Score

  basisEvidenceIds: EvidenceId[]
}
```

Likelihood bands are player-facing estimates, not direct disclosure of authoritative engine probabilities.

---

# 55. Mandate Chain Clarification

The conceptual chain remains:

```text
Evidence
→ Assessment
→ Coalition
→ Authorization
→ Implementation
→ Outcome
```

However, a `MandateCaseState` is created only once an assessment is escalated into an institutional action process.

Evidence therefore exists upstream of the mandate case.

This removes the v1.0 ambiguity where a mandate itself had “evidence” and “assessment” lifecycle stages despite assessments already existing independently.

---

# 56. Mandate Case Lifecycle

```ts
type MandateCaseStage =
  | 'assessment_basis'
  | 'coalition'
  | 'authorization'
  | 'implementation'
  | 'outcome'
  | 'closed'
  | 'abandoned'
```

---

# 57. Mandate Case State

```ts
interface MandateCaseState {
  mandateCaseId: MandateCaseId

  titleKey: string

  stage: MandateCaseStage

  assessmentIds: AssessmentId[]

  coalition: CoalitionState

  authorizationProcedureId: string
  authorization: AuthorizationState

  scope: MandateScope

  objectiveIds: string[]

  politicalStrength: Score
  implementationReadiness: Score
  distortionRisk: Score

  commitmentIds: CommitmentId[]

  implementationId?: ProjectId

  openedTurn: number
  lastChangedTurn: number

  outcome?: MandateOutcome
}
```

`politicalStrength`, `implementationReadiness`, and `distortionRisk` SHOULD be derived or recomputed from canonical inputs rather than manually edited.

---

# 58. Coalition State

```ts
interface CoalitionState {
  members: CoalitionMemberState[]

  supportStrength: Score
  cohesion: Score

  outstandingConditionCodes: string[]
}
```

```ts
interface CoalitionMemberState {
  party: PartyRef

  stance:
    | 'strong_support'
    | 'support'
    | 'conditional_support'
    | 'neutral'
    | 'resist'
    | 'strong_resist'

  supportStrength: Score

  conditionCodes: string[]

  joinedTurn?: number
  lastChangedTurn: number
}
```

`supportStrength` and `cohesion` at coalition level SHOULD be derived.

---

# 59. Authorization Procedure Definition

```ts
interface AuthorizationProcedureDefinition {
  authorizationProcedureId: string

  authorityInstitutionIds: InstitutionId[]

  requiredRequirements: AuthorizationRequirementDefinition[]

  hostConsentRequired: boolean

  minimumCoalitionSupport?: Score

  leadTimeTurns: number

  expiryTurns?: number

  permittedDomains: AuthorityDomain[]
}
```

---

# 60. Authorization Requirements

```ts
type AuthorizationRequirementDefinition =
  | {
      kind: 'institution_approval'
      institutionId: InstitutionId
    }
  | {
      kind: 'host_consent'
      institutionId: InstitutionId
    }
  | {
      kind: 'coalition_support'
      minimum: Score
    }
  | {
      kind: 'assessment_confidence'
      minimum: Score
    }
  | {
      kind: 'rule'
      rule: RuleExpression
    }
```

---

# 61. Authorization State

```ts
interface AuthorizationState {
  status:
    | 'not_requested'
    | 'pending'
    | 'authorized'
    | 'conditionally_authorized'
    | 'rejected'
    | 'expired'
    | 'revoked'

  requirementStates: AuthorizationRequirementState[]

  requestedTurn?: number
  earliestResolutionTurn?: number
  resolvedTurn?: number

  legalScopeCodes: string[]
  restrictionCodes: string[]

  expiryTurn?: number
}
```

Authorization progression occurs during end-turn mandate processing.

---

# 62. Mandate Scope

```ts
interface MandateScope {
  territoryIds: TerritoryId[]
  zoneIds: ZoneId[]

  permittedDomains: AuthorityDomain[]

  resourceCeilings?: {
    budget?: MoneyAmount
    personnel?: number
  }

  monitoringRequirementCodes: string[]
}
```

---

# 63. Implementation Definition

Scenario content MAY define reusable implementation profiles.

```ts
interface ImplementationProfile {
  implementationProfileId: string

  baseLeadTimeTurns: number

  baseWorkUnits: number

  requiredCapacity: Score

  milestoneDefinitions: ImplementationMilestoneDefinition[]

  riskProfileIds: string[]
}
```

---

# 64. Implementation State

```ts
interface ImplementationState {
  projectId: ProjectId

  mandateCaseId: MandateCaseId

  implementationProfileId: string

  status:
    | 'preparing'
    | 'active'
    | 'delayed'
    | 'blocked'
    | 'completed'
    | 'failed'
    | 'suspended'

  createdTurn: number
  activatedTurn?: number
  completedTurn?: number

  workCompleted: number
  workRequired: number

  capacityRequired: Score
  capacityAllocated: Score

  blockingReasonCodes: string[]

  riskIds: string[]
  milestoneStates: ImplementationMilestoneState[]
}
```

Implementation progress MUST be derived from work and capacity rather than an independently writable `progress` percentage.

A display percentage MAY be derived.

---

# 65. Implementation Progress

A default implementation progression model SHOULD resemble:

```text
effective work this turn
=
base work rate
× capacity ratio
× coalition cooperation modifier
× host cooperation modifier
× disruption modifier
× doctrine modifier
```

All coefficients are BALANCE-TUNABLE.

The result is bounded.

Implementation MAY regress only if a profile explicitly permits regression.

---

# 66. Mandate Outcome Dimensions

v1.0 forced outcomes into one mutually exclusive enum.

v1.1 uses three independent dimensions.

```ts
interface MandateOutcome {
  delivery:
    | 'full'
    | 'partial'
    | 'minimal'
    | 'failed'

  integrity:
    | 'intact'
    | 'distorted'

  netImpact:
    | 'positive'
    | 'mixed'
    | 'negative'
    | 'counterproductive'

  effectiveness: Score
  scopeIntegrity: Score

  objectiveResults: ObjectiveResult[]

  unintendedConsequenceIds: ConsequenceId[]

  closedTurn: number
}
```

An intervention can therefore be:

```text
partial + distorted + mixed
```

which is realistic and unambiguous.

---

# 67. Outcome Classification

Scenario/balance content defines thresholds.

Example structure:

```ts
interface OutcomeClassifierConfig {
  fullDeliveryThreshold: Score
  partialDeliveryThreshold: Score

  intactScopeThreshold: Score

  counterproductiveNetEffectThreshold: SignedScore
}
```

The engine calculates outcome dimensions.

Content MUST NOT directly assign a favorable outcome label.

---

# 68. Consequence Model

```ts
interface ScheduledConsequence {
  consequenceId: ConsequenceId

  sourceDecisionId?: DecisionId
  sourceWorldEventId?: WorldEventId
  sourceMandateCaseId?: MandateCaseId

  earliestTurn: number
  latestTurn?: number

  eligibilityRule: RuleExpression

  probability?: Probability

  effectProfileId: EffectProfileId

  callbackTags: string[]

  status:
    | 'scheduled'
    | 'eligible'
    | 'resolved'
    | 'expired'
    | 'cancelled'

  resolvedTurn?: number
}
```

---

# 69. Consequence Timing

Major decisions SHOULD support:

### Immediate

Applied during successful command resolution.

### Operational

Usually 1–3 turns later.

### Strategic

Usually 3–8+ turns later.

These are pacing guidelines.

Specific timing is content/balance data.

---

# 70. World Event Terminology

v1.0 used “Event” for multiple concepts.

v1.1 separates:

### Event Definition

Immutable authored/systemic event content.

### World Event Instance

A runtime geopolitical/world development.

### Domain Event

An immutable technical audit record describing a state transition.

These MUST NOT share the same type.

---

# 71. Event Definition

```ts
type EventFamily =
  | 'anchor'
  | 'systemic'
  | 'callback'
  | 'ambient'

interface EventDefinition {
  eventDefinitionId: EventDefinitionId

  family: EventFamily

  eligibilityRule: RuleExpression

  weight: number

  earliestTurn?: number
  latestTurn?: number

  cooldownTurns?: number
  maxOccurrences?: number

  attentionLevel: AttentionLevel

  immediateEffectProfileIds: EffectProfileId[]
  consequenceProfileIds: string[]

  callbackTagsProduced: string[]

  narrativeTemplateId?: string
}
```

---

# 72. World Event Instance

```ts
interface WorldEventInstance {
  worldEventId: WorldEventId

  eventDefinitionId: EventDefinitionId

  triggeredTurn: number

  family: EventFamily

  subjectRefs: SubjectRef[]

  status:
    | 'active'
    | 'resolved'
    | 'expired'

  sourceDecisionId?: DecisionId
  sourceConsequenceId?: ConsequenceId

  callbackTags: string[]
}
```

---

# 73. Situation State

A crisis or opportunity is a structured situation, not a synonym for event.

```ts
interface SituationState {
  situationId: SituationId

  situationType:
    | 'crisis'
    | 'opportunity'
    | 'strategic_issue'

  subjectRefs: SubjectRef[]

  relatedWorldEventIds: WorldEventId[]

  openedTurn: number

  urgency: AttentionLevel

  status:
    | 'open'
    | 'developing'
    | 'managed'
    | 'resolved'
    | 'expired'

  blocking: boolean
}
```

---

# 74. Event Director

The Event Director answers:

> Which eligible developments should enter or surface in the current turn?

It MUST consider:

- event eligibility;
- due callback consequences;
- current situations;
- world pressure;
- mandate state;
- actor state;
- campaign pacing;
- recent event repetition;
- attention saturation.

---

# 75. Event Director Priority

Recommended order:

```text
1. mandatory due callbacks
2. blocking scenario events
3. eligible anchor events within authored windows
4. high-salience systemic events
5. lower-salience systemic events
6. ambient developments
```

Within equal priority, deterministic weighted selection MAY be used.

---

# 76. Attention Budget

A scenario SHOULD define an attention budget.

```ts
interface AttentionBudget {
  maxInterruptiveEventsPerTurn: number
  maxPriorityItemsPerTurn: number
  maxCriticalItemsPerTurn: number
}
```

The event director MAY defer non-urgent events to avoid notification spam.

Deferred events MUST remain eligible unless their window expires.

---

# 77. Attention State

```ts
type AttentionLevel =
  | 'routine'
  | 'developing'
  | 'priority'
  | 'critical'
  | 'decision_required'

interface AttentionState {
  items: Record<AttentionItemId, AttentionItem>
}
```

```ts
interface AttentionItem {
  attentionItemId: AttentionItemId

  level: AttentionLevel

  createdTurn: number

  subjectRefs: SubjectRef[]

  reasonCode: string

  briefingId?: BriefingId

  blocking: boolean

  resolved: boolean
  resolvedTurn?: number
}
```

Strategic importance takes precedence over chronology.

---

# 78. Briefing State

Briefings are derived presentation-domain objects and need not live in authoritative state unless authored choices require persistent identity.

Canonical view model:

```ts
interface BriefingViewModel {
  briefingId: BriefingId

  situation: BriefingSituationVM

  assessment: BriefingAssessmentVM

  confidence: BriefingConfidenceVM

  institutionalPositions: BriefingPositionVM[]

  options: BriefingOptionVM[]

  risks: BriefingRiskVM[]

  unknowns: BriefingUnknownVM[]
}
```

Canonical order:

```text
Situation
Assessment
Confidence
Institutional Position
Options
Risks
Unknowns
Decision
```

---

# 79. Doctrine Model

Paired positive-only doctrine fields in v1.0 could produce inconsistent totals.

v1.1 uses four signed axes.

```ts
interface DoctrineVector {
  prevention: SignedScore
  centralization: SignedScore
  policyOrientation: SignedScore
  diplomaticStyle: SignedScore
}
```

Orientation:

```text
prevention:
-100 reactive
+100 preventive

centralization:
-100 coalition/REC-led
+100 AU-centralized

policyOrientation:
-100 security-led
+100 institution/development-led

diplomaticStyle:
-100 coercive/pressure
+100 consensus/negotiation
```

---

# 80. Doctrine Delta

Actions MAY contribute:

```ts
interface DoctrineDelta {
  prevention?: number
  centralization?: number
  policyOrientation?: number
  diplomaticStyle?: number
}
```

Signals accumulate according to BALANCE-TUNABLE weights.

---

# 81. Doctrine State

```ts
interface DoctrineState {
  observed: DoctrineVector

  codified: boolean

  codifiedProfileId?: string
  codifiedTurn?: number

  modifiers: DoctrineModifier[]
}
```

The first strategic review SHOULD occur after sufficient decisions, recommended after turn 4.

Doctrine MUST provide tradeoffs rather than pure bonuses.

---

# 82. Conflict World State

```ts
interface ConflictWorldState {
  zones: Record<ZoneId, ConflictZoneState>
}
```

```ts
interface ConflictZoneState {
  zoneId: ZoneId

  armedActivity: Score
  civilianTargeting: Score
  actorFragmentation: Score
  mobility: Score
  recruitmentPressure: Score

  escalationMomentum: SignedScore
  spilloverPressure: Score
}
```

Territory conflict pressure is derived from zone state.

---

# 83. Conflict Dynamics

A default update framework:

```text
next armed activity
=
current armed activity
+ momentum
+ actor capability pressure
+ neighboring spillover
+ recruitment pressure
+ external support
- state presence effect
- intervention effect
+ deterministic shock
```

Every contribution MUST have a configured maximum magnitude per turn.

This prevents unstable runaway formulas.

---

# 84. Conflict Adjacency

Spillover MUST travel through explicit zone adjacency/corridor relationships.

Conflict MUST NOT automatically affect every territory globally.

---

# 85. Civilian World State

```ts
interface CivilianWorldState {
  zones: Record<ZoneId, CivilianZoneState>
}
```

```ts
interface CivilianZoneState {
  civilianConfidence: Score
  displacementPressure: Score
  humanitarianAccess: Score
  serviceReliability: Score
  perceivedLegitimacy: Score
}
```

---

# 86. Infrastructure World State

```ts
interface InfrastructureWorldState {
  assets: Record<AssetId, AssetRuntimeState>
  corridors: Record<CorridorId, CorridorRuntimeState>
}
```

```ts
interface AssetRuntimeState {
  assetId: AssetId

  operationalStatus:
    | 'operational'
    | 'degraded'
    | 'disrupted'
    | 'offline'
    | 'under_construction'
    | 'planned'
    | 'unknown'

  disruptionRisk: Score
  conflictExposure: Score
  economicDependency: Score
}
```

```ts
interface CorridorRuntimeState {
  corridorId: CorridorId

  throughput: Score
  resilience: Score
  disruptionRisk: Score
}
```

---

# 87. Development World State

```ts
interface DevelopmentWorldState {
  zones: Record<ZoneId, DevelopmentZoneState>
}
```

```ts
interface DevelopmentZoneState {
  investmentPipeline: Score
  implementationAbsorption: Score
  infrastructureNeed: Score
  serviceDeficit: Score
  externalFinanceDependence: Score
}
```

---

# 88. External Environment

```ts
interface ExternalEnvironmentState {
  externalPowerCompetition: Score
  donorRiskTolerance: Score
  commodityPressure: Score
  regionalDiplomaticPressure: Score
}
```

Campaign-wide external state provides shared pressure without duplicating values on every actor.

---

# 89. Initialization from Real-World Baseline

Real baseline facts MUST NOT be randomly rewritten.

However, derived latent simulation variables MAY include deterministic uncertainty.

Example:

```text
Observed baseline:
ACLED events and fatalities are historical records.

Derived latent variable:
current armed-group operational freedom = estimate with uncertainty.
```

Initialization rule:

```text
observed facts
+ scenario model
+ data-quality envelope
+ deterministic seed
→ initial latent simulation truth
```

The methodology MUST identify which initial values are:

- observed;
- derived;
- latent;
- randomized within an uncertainty envelope.

---

# 90. Baseline Package

```ts
interface BaselinePackage {
  baselineId: string

  baselineSchemaVersion: number

  asOfDate: string

  sourceManifest: SourceManifest

  territoryBaselines: TerritoryBaseline[]
  zoneBaselines: ZoneBaseline[]

  assetBaselines: AssetBaseline[]
  corridorBaselines: CorridorBaseline[]

  conflictBaseline: ConflictBaseline
  displacementBaseline: DisplacementBaseline
  developmentBaseline: DevelopmentBaseline

  packageHash: string
}
```

The baseline is immutable within a campaign.

---

# 91. Source Manifest

```ts
interface SourceManifest {
  sources: SourceManifestEntry[]
}
```

```ts
interface SourceManifestEntry {
  sourceKey: string
  sourceName: string

  release?: string
  dataAsOf?: string
  fetchedAt?: string

  sourceUrl?: string

  license?: string
  attributionText?: string

  redistributionAllowed?: boolean
  shareAlikeRequired?: boolean

  recordCount: number

  methodologyNote?: string
}
```

Baseline compilation MUST fail if a required source lacks required licensing/attribution metadata.

---

# 92. Data Quality

```ts
interface DataQuality {
  sourceReliability: Score
  spatialPrecision: Score
  freshness: Score
  completeness: Score
  gameplayRelevance: Score
}
```

Data quality MAY modify evidence confidence.

It MUST NOT silently alter observed source values.

---

# 93. Source Adapters

Initial source-adapter families are expected for:

```text
ACLED event data
ACLED Conflict Index
IDMC displacement
Global Energy Monitor power assets
Global Energy Monitor pipelines
OpenStreetMap construction/transport
TeleGeography cables
development-finance/AidData-style sources
African geographic base map
```

The simulation MUST consume canonical baseline records, never source-native schemas.

---

# 94. Deterministic Scenario Compilation

The scenario compiler MUST:

1. validate raw source adapters;
2. normalize identifiers;
3. filter relevant geography;
4. assign points to zones deterministically;
5. intersect lines/polygons deterministically;
6. create asset/corridor relationships;
7. calculate data-quality metadata;
8. derive baseline strategic metrics;
9. emit provenance;
10. emit a content-addressed package hash.

Given the same raw inputs and compiler version, output MUST be identical.

---

# 95. Geospatial Assignment Rules

Point assignment:

```text
point-in-polygon
```

Line assignment:

```text
geometry intersection
```

Boundary ambiguity MUST use a documented deterministic tiebreaker.

No runtime component should guess territory/zone membership from names.

---

# 96. Turn Command Phase

During a turn, the player sequentially submits up to the configured strategic-decision limit.

Immediate command effects happen at commit time.

Decision order therefore matters.

Example:

```text
Decision 1 changes actor trust.
Decision 2's negotiation eligibility may now change.
```

This is intentional.

---

# 97. End-Turn Resolution Order

When the player commits `EndTurn`, the engine resolves the current month in this exact order:

```text
1. Validate that EndTurn is allowed.
2. Resolve scheduled consequences due this turn.
3. Resolve commitment fulfillment/breach.
4. Resolve red-line crossings not already reconciled.
5. Progress authorization processes.
6. Progress active implementations.
7. Adapt actors and issue-specific positions.
8. Resolve world dynamics:
   a. conflict
   b. civilian
   c. infrastructure
   d. development
   e. external environment
9. Run Event Director eligibility and selection.
10. Apply immediate world-event effects.
11. Materialize passive observations/evidence.
12. Resolve completed intelligence collection tasks.
13. Recalculate assessment metadata:
    support, contradiction, staleness.
14. Recompute derived institutional capacities:
    member-state alignment, partner confidence, etc.
15. Rebuild attention state.
16. Accumulate doctrine signals / strategic review state.
17. Record evaluation snapshot.
18. Check early termination.
19. If final turn:
    finalize evaluation and complete campaign.
20. Otherwise:
    increment turn,
    advance calendar month,
    refresh decision slots.
```

No system may silently change this order without a simulation-model version bump.

---

# 98. Immediate Reconciliation after Commands

After each successful strategic command, the engine MUST immediately check:

- commitments directly affected by the command;
- red lines directly crossed;
- relationship changes;
- new actor positions;
- immediate attention items;
- immediate early-termination rules, if applicable.

End-turn does not delay obvious immediate political consequences.

---

# 99. Deterministic Keyed Randomness

v1.1 does **not** require mutable RNG state.

Use deterministic keyed sampling.

Conceptual API:

```ts
function deterministicSample(
  campaignSeed: string,
  resolutionKey: string
): number
```

`resolutionKey` MUST be stable and unique to the resolution.

Example:

```text
turn:07|system:event_director|eventdef:asset_disruption|zone:zone_mopti
```

Benefits:

- adding an unrelated random draw does not shift all later results;
- replay is easier;
- tests can target specific outcomes;
- resolution traces can record keys.

---

# 100. Probabilistic Resolution

For a probability `p`:

```text
sample = deterministicSample(seed, key)

resolve if sample < p
```

The exact sample MAY be logged in developer traces.

It SHOULD NOT normally be shown to players.

---

# 101. Actor Adaptation

Actor adaptation SHOULD derive issue positions from:

```text
actor priorities
+ hidden intent
+ capabilities
+ relationship trust
+ strategic alignment
+ leverage
+ dependencies
+ commitments
+ disputes
+ active memories
+ red lines
+ current mandate terms
+ relevant world state
```

Exact coefficients are BALANCE-TUNABLE.

Actor adaptation MUST create explicit domain events for meaningful position changes.

---

# 102. Strategic Positions versus Relationships

Relationships change slowly and describe general interaction quality.

Positions change more quickly and describe:

> “What does this actor think about this specific assessment/mandate/action?”

A hostile relationship does not make support impossible.

A trusted actor can still oppose a mandate.

This distinction is mandatory.

---

# 103. Portfolio Management

Multiple active mandate cases MAY coexist.

Each active mandate consumes:

- secretariat capacity;
- political attention;
- implementation capacity;
- material resources;
- partner confidence in some cases.

Portfolio overload SHOULD:

- slow implementation;
- increase administrative errors;
- reduce responsiveness;
- increase distortion or failure risk.

Exact overload formulas are BALANCE-TUNABLE.

---

# 104. Portfolio Capacity Demand

```ts
interface MandateCapacityDemand {
  politicalCapital: Score
  secretariatCapacity: Score
  implementationCapacity: Score

  budget?: MoneyAmount
  personnel?: number
}
```

Capacity demand is attached to mandate/implementation profiles.

---

# 105. Difficulty Profiles

```ts
interface DifficultyProfile {
  difficultyProfileId: string

  evidenceClarityModifier: number
  confidenceDecayModifier: number

  hiddenRedLineFrequencyModifier: number

  actorAdaptationStrengthModifier: number

  escalationSpeedModifier: number

  implementationToleranceModifier: number

  causalExplanationLevel:
    | 'high'
    | 'standard'
    | 'low'
}
```

Difficulty SHOULD primarily alter:

- information clarity;
- institutional friction;
- adaptation strength;
- timing pressure.

It SHOULD NOT simply inflate enemy numbers.

---

# 106. Evaluation Model

Evaluation is multidimensional and trajectory-aware.

```ts
interface EvaluationState {
  snapshots: EvaluationSnapshot[]

  final?: FinalEvaluation
}
```

```ts
interface EvaluationSnapshot {
  turn: number

  security: Score
  civilianOutcomes: Score
  regionalStability: Score
  institutionalCohesion: Score
  legitimacy: Score
  mandateSustainability: Score
}
```

---

# 107. Final Evaluation

```ts
interface FinalEvaluation {
  security: EvaluationDimensionResult
  civilianOutcomes: EvaluationDimensionResult
  regionalStability: EvaluationDimensionResult
  institutionalCohesion: EvaluationDimensionResult
  legitimacy: EvaluationDimensionResult
  mandateSustainability: EvaluationDimensionResult

  causalChains: EvaluationCausalChain[]
}
```

No authoritative overall score is required.

---

# 108. Trajectory-Aware Evaluation

Final evaluation SHOULD consider:

- starting value;
- ending value;
- trend;
- volatility;
- duration in critical states;
- irreversible consequences;
- mandate sustainability.

A last-turn cosmetic improvement MUST NOT erase 18 turns of severe failure.

---

# 109. Early Termination Rules

Scenario content defines early termination rules.

```ts
interface TerminationRuleDefinition {
  terminationRuleId: string

  rule: RuleExpression

  persistenceTurns?: number

  reasonCode: string
}
```

If persistence is required, the engine tracks consecutive qualifying turns.

Examples MAY include:

- mandate authority collapse;
- sustained institutional legitimacy collapse;
- unrecoverable authorization withdrawal;
- scenario-specific catastrophic conditions.

---

# 110. Event and Decision Causality

Every consequential state change SHOULD be traceable to:

```text
baseline / world dynamic
or
decision
or
world event
or
scheduled consequence
```

State mutation without a traceable source SHOULD be treated as a simulation defect.

---

# 111. Domain Events

Domain events are immutable technical audit records.

```ts
interface DomainEventRecord {
  domainEventId: string

  turn: number

  eventType: string

  aggregateType: string
  aggregateId: string

  sourceDecisionId?: DecisionId
  sourceWorldEventId?: WorldEventId
  sourceConsequenceId?: ConsequenceId

  payload: Record<string, unknown>
}
```

They describe why state changed.

They are not player-facing world events.

---

# 112. Decision Records

```ts
interface DecisionRecord {
  decisionId: DecisionId

  commandId: string

  turn: number
  sequenceWithinTurn: number

  actionId: ActionId

  targets: SubjectRef[]

  assessmentIds: AssessmentId[]
  mandateCaseId?: MandateCaseId

  decisionSlotCost: number

  createdDomainEventIds: string[]
  createdConsequenceIds: ConsequenceId[]

  doctrineDelta: DoctrineDelta
}
```

Wall-clock commit timestamps MAY exist in save metadata but MUST NOT affect simulation.

---

# 113. Player-Knowledge Leak Prevention

The following MUST NOT read hidden true state:

- action availability;
- decision preview;
- map risk labels presented as known;
- assessment support displayed to the player;
- briefing claims;
- AI narrative context from the player's perspective.

The following MAY read hidden true state:

- conflict evolution;
- actor hidden-intent adaptation;
- systemic event eligibility;
- consequence resolution;
- observation generation.

---

# 114. Map Information Boundary

Map layers fall into categories.

### Baseline-observed layers

May show facts the player is assumed to know from the scenario baseline.

Examples:

- major power assets;
- known pipelines;
- public cable routes.

### Intelligence-derived layers

Must use player evidence.

Examples:

- armed-group activity;
- current conflict pressure;
- actor intent;
- estimated vulnerability.

### Simulation-private layers

Must never be passed to normal UI selectors.

Development/debug tooling MAY expose them explicitly.

---

# 115. Forecast versus Truth

“What might happen?” MUST be generated as a player-knowledge forecast.

It MAY include:

- possible institutional reactions;
- plausible risk ranges;
- known dependencies;
- known unknowns.

It MUST NOT simply serialize the engine's hidden scheduled consequences.

---

# 116. Methodology Manifest

```ts
interface MethodologyManifest {
  methodologyVersion: string

  sections: MethodologySection[]

  modelVersions: {
    conflictModel: string
    civilianModel: string
    infrastructureModel: string
    intelligenceModel: string
    mandateModel: string
  }
}
```

The methodology must document:

- source data;
- data dates;
- licenses;
- compilation;
- uncertainty;
- model assumptions;
- observed versus simulated;
- AI role;
- limitations.

---

# 117. Narrative AI Perspective

Every AI request has a perspective.

```ts
type NarrativePerspective =
  | { kind: 'player_office' }
  | { kind: 'actor'; actorId: ActorId }
  | { kind: 'institution'; institutionId: InstitutionId }
```

The context builder MUST only provide information that the selected perspective is allowed to know.

This prevents AI dialogue from leaking hidden player or actor information.

---

# 118. Narrative Context

```ts
interface NarrativeContext {
  narrativeContextId: string

  perspective: NarrativePerspective

  turn: number

  subjectRefs: SubjectRef[]

  semanticState: {
    stanceCode?: string
    toneProfileId: string

    knownMemoryIds: MemoryId[]
    knownCommitmentIds: CommitmentId[]
    knownDisputeIds: DisputeId[]

    allowedClaimIds: string[]
  }

  prohibitedClaimCodes: string[]
}
```

---

# 119. Narrative Output

The model does not choose authoritative stance.

```ts
interface NarrativeResponse {
  text: string

  usedClaimIds: string[]

  referencedMemoryIds: MemoryId[]

  formatVersion: string
}
```

If output references claims not allowed by context, validation fails and fallback rendering is used.

---

# 120. AI Prompt Input Rules

Narrative prompts SHOULD contain:

- curated structured facts;
- localized names/titles;
- tone constraints;
- permitted memories;
- permitted claims.

Prompts SHOULD NOT contain:

- raw authentication data;
- user account identifiers;
- arbitrary raw external-source text;
- hidden state outside the perspective;
- secrets/API keys.

---

# 121. Narrative Cache

Generated prose is non-authoritative.

Recommended separate cache:

```ts
interface NarrativeCacheEntry {
  narrativeContextHash: string

  provider: string
  model: string

  response: NarrativeResponse

  createdAt: string
}
```

The cache MAY be persisted alongside the campaign.

It MUST be excluded from authoritative simulation hashes.

---

# 122. AI Failure

If AI fails:

```text
semantic state
→ deterministic template renderer
→ game continues
```

AI failure MUST NOT:

- block turn progression;
- alter outcomes;
- consume a strategic decision;
- corrupt saves.

---

# 123. Persistence Contract

```ts
interface SaveSnapshot {
  snapshotVersion: number

  campaignId: CampaignId

  campaignRevision: number

  versions: CampaignVersions

  authoritativeState: CampaignState

  authoritativeStateHash: string

  presentationCache?: {
    narrative?: NarrativeCacheEntry[]
  }
}
```

---

# 124. Save Revisioning

Every successful strategic command and every successful end-turn increments:

```text
meta.revision
```

Cloud saves SHOULD use optimistic concurrency:

```text
update only if remoteRevision == expectedRevision
```

A revision conflict MUST NOT silently overwrite a newer campaign.

---

# 125. Autosave Policy

Recommended:

```text
autosave after every successful strategic command
autosave after successful end-turn resolution
manual save on demand
```

Failed autosave MUST leave local authoritative state intact.

---

# 126. State Hash

The authoritative state hash excludes:

- narrative cache;
- UI state;
- local timestamps unrelated to simulation;
- analytics.

It SHOULD include:

- campaign meta relevant to simulation;
- world;
- actors/institutions;
- knowledge;
- assessments;
- mandate cases;
- implementations;
- consequences;
- doctrine;
- evaluation;
- command-processing registry.

---

# 127. Replay Verification

A developer replay tool SHOULD:

1. initialize scenario/baseline;
2. apply recorded player commands in order;
3. run end-turn commands at recorded positions;
4. compare resulting authoritative state hash.

A mismatch is a determinism regression.

---

# 128. Save Migration

A schema change requires:

```text
old snapshot
→ explicit migration
→ new snapshot
→ validation
```

or:

```text
explicit incompatibility error
```

Never silently reinterpret missing fields.

---

# 129. Baseline Availability

A saved campaign requires its pinned baseline package.

If that package is unavailable:

- cloud/client SHOULD attempt to retrieve the pinned package;
- if retrieval fails, loading MUST stop with an explicit compatibility error;
- the game MUST NOT silently substitute a newer baseline.

---

# 130. View-Model Boundary

UI code MUST consume selectors/view models rather than traversing hidden campaign state directly.

Recommended projection boundary:

```ts
interface PlayerProjection {
  situationQueue: SituationQueueVM
  strategicMap: StrategicMapVM
  mandatePortfolio: MandatePortfolioVM
  actorDirectory: ActorDirectoryVM
  assessmentWorkspace: AssessmentWorkspaceVM
}
```

The projection layer is the principal hidden-information firewall.

---

# 131. Strategic Map View Model

```ts
interface StrategicMapVM {
  territories: MapTerritoryVM[]
  zones: MapZoneVM[]
  conflictFeatures: MapConflictVM[]
  infrastructureFeatures: MapInfrastructureVM[]
  corridorFeatures: MapCorridorVM[]
  attentionFeatures: MapAttentionVM[]
}
```

Every view-model field MUST declare its knowledge source.

---

# 132. Dossier View Model

```ts
interface DossierVM {
  subject: SubjectRef

  title: string

  whyItMatters: string

  whatChanged: DossierChangeVM[]

  currentAssessment?: DossierAssessmentVM

  confidence?: string

  contradictions: DossierContradictionVM[]

  relevantParties: DossierPartyVM[]

  activeMandates: DossierMandateVM[]

  availableDecisions: DossierDecisionVM[]

  unknowns: DossierUnknownVM[]
}
```

---

# 133. Debug Projection

Developer tooling MAY expose:

- true world state;
- hidden actor intent;
- hidden red lines;
- exact probabilities;
- deterministic samples;
- effect calculations.

Debug projection MUST be explicitly separate from player projection.

---

# 134. Resolution Trace

Developer builds SHOULD produce optional resolution traces.

```ts
interface ResolutionTrace {
  turn: number

  system: string

  sourceCommandId?: string

  inputFactSummary: Record<string, unknown>

  evaluatedRuleIds: string[]

  randomResolutionKeys: string[]

  producedEffectSummaries: string[]
}
```

Resolution traces are not authoritative campaign state.

They are debugging instrumentation.

---

# 135. Testing Layers

Required test families:

```text
schema validation
rule engine
effect handlers
command atomicity
domain invariants
determinism
scenario initialization
data-pipeline determinism
knowledge-leak prevention
simulation regression
headless balance
persistence/migration
AI narrative schema
integration
E2E player journey
```

---

# 136. Critical Invariants

Tests MUST verify:

```text
Baseline never mutates.

Runtime definitions are never edited.

No duplicated writable source of truth exists for subsystem metrics.

Every relationship is directional.

Every assessment references valid evidence/gaps.

Every mandate case references adopted/relevant assessments.

Every implementation references a valid mandate case.

Every commitment has valid parties.

Every red line has a valid holder.

Memory relationship deltas apply only once.

Every scheduled consequence has a traceable source.

No consequence resolves before eligibility.

Failed commands are atomic.

Processed commands cannot double-apply.

Decision slots never exceed configured maximum.

Player eligibility cannot read hidden world facts.

Player-facing relationship displays cannot read raw hidden `RelationshipState` values.

Player-facing actor positions cannot read raw hidden `PositionState` without a knowledge projection.

Player-facing red lines cannot read raw `RedLineState` without a knowledge projection.

Player forecasts cannot serialize hidden consequences.

Player map selectors cannot read simulation-private layers.

AI output cannot mutate authoritative state.

Same inputs + seed + command history produce the same hash.

Turn 20 resolves before campaign completion.

Unspent decisions never carry forward.

No save silently substitutes baseline/model versions.
```

---

# 137. Property-Based Tests

Where practical, property-based tests SHOULD verify:

- clamping;
- idempotency;
- rule tri-state semantics;
- deterministic random sampling;
- no negative counts;
- no invalid references after commands;
- no duplicate coalition parties;
- no impossible mandate transitions;
- no completed implementation with unfinished required milestones.

---

# 138. Headless Simulation Runner

Required early-development command:

```bash
npm run simulate -- \
  --scenario sahel-2026 \
  --difficulty standard \
  --runs 10000
```

Outputs SHOULD include:

```text
termination rate
evaluation distributions
mandate delivery distributions
mandate distortion distributions
average coalition size
authorization success rate
implementation delay rate
conflict trajectory distribution
civilian outcome distribution
actor trust distribution
doctrine distribution
action selection frequency
callback consequence frequency
```

---

# 139. Automated Policy Strategies

The headless runner SHOULD support simple bot policies.

Examples:

```text
security-first
coalition-first
development-first
reactive
preventive
random-valid-action
```

Bots exist for balance testing, not political evaluation.

The engine MUST NOT present one bot policy as inherently “correct.”

---

# 140. Balance Regression

A balance change SHOULD produce a before/after report.

Example:

```text
authorization success +7%
counterproductive mandates -2%
average campaign termination unchanged
coalition-led doctrine frequency +4%
```

Large unintended shifts require review.

---

# 141. Difficulty Testing

Difficulty profiles MUST be tested for:

- completion feasibility;
- information clarity;
- actor adaptation;
- mandate success distribution;
- termination rates.

Expert difficulty SHOULD be harder because of uncertainty/friction, not because every hidden parameter is simply worse.

---

# 142. Content Validation

Build validation MUST reject:

- unknown IDs;
- invalid rule facts;
- invalid rule scopes;
- impossible authorization procedures;
- event references to unknown effects;
- actions with invalid mandate requirements;
- missing localization;
- missing provenance;
- missing required license metadata;
- circular mandatory mandate prerequisites;
- duplicate opaque IDs.

---

# 143. Scenario-Pack Structure

Recommended:

```text
scenarios/
  sahel-2026/
    scenario.yaml

    world/
      territories.yaml
      zones.yaml
      corridors.yaml

    institutions.yaml
    actors.yaml
    relationships.yaml

    actions.yaml
    authorization-procedures.yaml

    events/
      anchors.yaml
      systemic.yaml
      callbacks.yaml

    doctrine.yaml
    difficulty.yaml
    balance.yaml
    methodology.yaml

    localization/
      en.json
```

Compiled baseline data SHOULD remain separate from authored scenario content.

---

# 144. Recommended Repository Structure

```text
african-mandate/

apps/
  web/
    src/
      app/
      map/
      ui/
      state/
      services/

packages/
  domain/
    src/
      ids/
      refs/
      schemas/
      definitions/
      runtime/
      knowledge/
      view-models/

  simulation/
    src/
      initialization/
      commands/
      rules/
      effects/
      actors/
      relationships/
      intelligence/
      assessments/
      mandates/
      implementation/
      consequences/
      events/
      doctrine/
      conflict/
      civilian/
      infrastructure/
      development/
      evaluation/
      projections/
      tracing/

  data-pipeline/
    src/
      adapters/
      canonical/
      geospatial/
      validators/
      compiler/

  narrative/
    src/
      contexts/
      perspectives/
      providers/
      validation/
      templates/

  content/
    scenarios/
      sahel-2026/

  testing/
    bots/
    fixtures/
    simulation-runner/
    balance-reporting/

supabase/
  migrations/
  functions/

docs/
  architecture/
  methodology/
  design/
```

---

# 145. Implementation Order

## Milestone 0 — Constitution

Freeze:

```text
GAME_DESIGN.md
DOMAIN_MODEL.md
ARCHITECTURE.md
DESIGN_STANDARDS.md
METHODOLOGY.md
```

## Milestone 1 — Domain kernel

Implement:

- branded IDs;
- refs;
- definitions/runtime separation;
- score conventions;
- campaign state;
- rule engine;
- effect engine;
- deterministic sampling;
- command dispatcher.

No UI.

## Milestone 2 — Minimal headless game

Implement:

- one territory;
- one zone;
- three actors/institutions;
- relationships;
- evidence;
- one assessment;
- one mandate case;
- one authorization path;
- one implementation;
- one callback consequence.

Playable entirely through tests/CLI.

## Milestone 3 — Data baseline compiler

Compile a real Sahel subset.

Validate:

- provenance;
- license metadata;
- geometry assignment;
- deterministic output.

## Milestone 4 — Intelligence game

Implement:

- passive observations;
- collection tasks;
- contradictions;
- confidence decay;
- assessment support/staleness.

## Milestone 5 — Institutional game

Implement:

- positions;
- commitments;
- red lines;
- coalition formation;
- authorization procedure;
- mandate distortion.

## Milestone 6 — Consequence/world game

Implement:

- conflict dynamics;
- civilian dynamics;
- infrastructure dynamics;
- world events;
- callback events;
- situations;
- attention budget.

## Milestone 7 — Strategic UI

Implement:

- player projection;
- situation queue;
- strategic map;
- dossier;
- assessment workspace;
- mandate portfolio;
- briefing flow.

## Milestone 8 — Full Sahel campaign

Implement:

- five territories;
- 20 monthly turns;
- three decisions per turn;
- doctrine review;
- multi-mandate portfolio;
- final evaluation.

## Milestone 9 — Narrative AI

Add:

- perspective-limited contexts;
- provider abstraction;
- validation;
- deterministic template fallback;
- cache.

## Milestone 10 — Production

Add:

- auth;
- local/cloud save;
- optimistic revisioning;
- migration;
- methodology surface;
- accessibility;
- performance budgets;
- deployment gates.

---

# 146. Definition of a Complete Gameplay Feature

A feature is complete only when it has:

```text
immutable definition
runtime state if needed
knowledge representation if player-visible
command
validation
rule/effect integration
domain events
persistence
player projection
UI
non-ideal states
methodology impact
tests
developer traceability
```

---

# 147. Definition of Successful v1 Experience

A first-time player should be able to experience:

```text
I inspect the Sahel strategic picture.

A situation requires attention.

I inspect a zone and understand why it matters.

I discover that available reporting is incomplete and partly contradictory.

I identify an intelligence gap.

I spend a strategic decision to task additional collection.

New evidence arrives later rather than instantly revealing the truth.

I adopt an assessment with a declared confidence level.

The assessment makes some actions politically defensible and others unavailable.

I open a mandate case.

I consult institutions.

A trusted partner still opposes part of my proposal.

Another actor conditionally supports it.

I make a commitment to secure coalition support.

I discover that authorization has procedural requirements.

The formal mandate is narrower than my initial proposal.

I allocate capacity and launch implementation.

The institutional response is immediate, but operational effects take time.

Other crises develop while implementation proceeds.

A hidden red line or second-order consequence creates an unexpected reaction.

The actor remembers my earlier commitment.

A later briefing explicitly references what I previously did.

At the end of the campaign, I receive a multidimensional causal review rather than a simplistic “correct/incorrect” verdict.
```

---

# 148. North-Star Feature Test

Every proposed feature should answer at least one:

```text
Does it change what the player knows?

Does it change what the player believes?

Does it change who supports the player?

Does it change what the player is authorized to do?

Does it change what institutions can implement?

Does it change what happens later?

Does it make uncertainty more strategically meaningful?

Does it make causality more legible?

Does it make the AU envoy role more believable?
```

If all answers are no, the feature likely does not belong in the core game.

---

# 149. Canonical Simulation Loop

```text
HIDDEN WORLD
    ↓
OBSERVATION
    ↓
PLAYER EVIDENCE
    ↓
ASSESSMENT
    ↓
ISSUE POSITIONS
    ↓
COALITION
    ↓
AUTHORIZATION
    ↓
IMPLEMENTATION
    ↓
CONSEQUENCES
    ↓
MEMORY
    ↓
ACTOR ADAPTATION
    ↓
NEW HIDDEN WORLD
    ↓
NEW OBSERVATIONS
    ↺
```

This loop is the authoritative conceptual architecture for African Mandate v1.1.

---

# Appendix A — v1.0 Gap Audit and Resolution

| v1.0 ambiguity or gap | Why it mattered | v1.1 resolution |
|---|---|---|
| Territory/zone fields duplicated conflict and civilian subsystem values | Multiple writable truths would diverge | Territory/zone core state is separated from conflict/civilian/infrastructure subsystem state; summaries are derived |
| `IntelligenceState` referenced but undefined | No canonical evidence/report registry | Replaced by explicit `PlayerKnowledgeState` |
| Memories, commitments, red lines, disputes defined but not stored canonically | References had nowhere authoritative to resolve | Added campaign-level registries |
| `EnvoyCapacityState` defined but absent from `CampaignState` | Player resource ownership ambiguous | Added `player: EnvoyState` |
| Material resources defined late and not attached to state | Budget/personnel ownership ambiguous | Added to `EnvoyState.materialResources` |
| Actor priorities mixed static and runtime concerns | Save-state bloat and mutation ambiguity | Added `ActorDefinition` vs `ActorRuntimeState` |
| Institution identity and runtime capability mixed | Same problem as actors | Added `InstitutionDefinition` vs `InstitutionRuntimeState` |
| Relationship target was raw string and direction unclear | Actor/institution collisions and leverage ambiguity | Added typed `PartyRef` and directional relationship semantics |
| Global actor posture conflated general relationship with issue support | Trusted actors could not credibly oppose specific mandates | Added issue-specific `PositionState` |
| Memory effects could be interpreted as recurring deltas | Risk of double application every turn | Effects apply once; memory thereafter influences adaptation |
| Evidence `claimValue: unknown` was too weakly typed | Impossible to validate or reason consistently | Added discriminated `EvidenceClaim` union |
| Evidence visibility allowed “hidden” evidence inside player knowledge | Hidden/player boundaries could leak | Hidden truth is no longer stored in player evidence |
| Confidence, reliability, freshness had unclear ownership | Designers could mutate the wrong field | Evidence immutable; effective confidence is derived |
| Assessment “update” phase implied auto-rewriting player judgments | Undermined player agency | Only support/contradiction/staleness metadata auto-updates |
| Mandate lifecycle duplicated upstream evidence/assessment states | Entity boundaries unclear | Mandate case starts from an assessment basis |
| Coalition arrays used ambiguous raw IDs | Actor/institution type ambiguity | Coalition uses typed party references |
| Authorization lacked procedure semantics | No reliable way to model PSC/host consent/etc. | Added authorization procedure definitions and requirement states |
| Partial and distorted outcomes were mutually exclusive | Real outcomes can be both | Outcome now has delivery, integrity, and net-impact dimensions |
| Implementation stored arbitrary writable progress | Could diverge from capacity/work state | Progress derived from work completed/work required |
| Actions were named but not defined | No content contract for gameplay | Added formal `ActionDefinition` |
| Decision-slot cost was undefined for many commands | Three-decision turn could be bypassed | Added explicit decision economy and zero-cost restrictions |
| Effects referenced by profile but not defined | Content could imply arbitrary mutation | Added closed typed effect union |
| Rule expressions used arbitrary paths | Unsafe and leak-prone | Added validated fact-query model |
| Rules were boolean only | Missing data silently ambiguous | Added tri-state true/false/unknown semantics |
| Player eligibility might accidentally read hidden truth | UI could leak secrets through available actions | Added rule scopes and player-knowledge firewall |
| “What might happen?” could serialize actual future consequences | Would destroy uncertainty | Added knowledge-limited decision forecast |
| Event terminology conflated authored events, runtime events, domain logs | Implementation ambiguity | Defined EventDefinition, WorldEventInstance, DomainEventRecord |
| Crisis/opportunity named but undefined | Ontology incomplete | Added `SituationState` |
| Event pacing not defined | Risk of notification spam | Added attention budgets and event priority order |
| Doctrine used paired scores | Axes could become internally inconsistent | Replaced with signed doctrine vector |
| Turn phases were imprecise around current vs next turn | Timing bugs likely | Added exact turn calendar and 20-step resolution order |
| Mutable RNG state was implied | Call-order changes could break determinism | Added keyed deterministic randomness |
| Baseline and latent initial truth were not distinguished | Risk of randomizing historical facts | Observed facts immutable; only derived latent variables vary |
| Source licensing/provenance insufficiently specified | Publishing/legal risk | Added source manifest and build-time license validation |
| AI output included stance as if model could decide it | Contradicted “AI is presentational” principle | Stance is simulation input; AI output is prose + referenced claims |
| AI perspective knowledge not specified | Dialogue could leak hidden state | Added perspective-limited narrative context |
| Save state and event sourcing semantics unclear | Teams might build two authorities | Snapshot authoritative; domain events are audit |
| Cloud save conflict handling omitted | Multi-device overwrite risk | Added revision + optimistic concurrency |
| Narrative cache reproducibility unclear | Re-generations could differ after reload | Cache is persistable but excluded from authoritative hash |
| Debugging complex outcomes unspecified | Balancing would be opaque | Added `ResolutionTrace` |
| Data pipeline determinism not explicit | Rebuild could alter campaigns | Added content-addressed deterministic compiler requirement |
| Difficulty philosophy lacked a schema | Inconsistent implementation likely | Added `DifficultyProfile` |
| Evaluation considered dimensions but not trajectories | Late fixes could erase long failure | Added turn snapshots and trajectory-aware final evaluation |

---

# Appendix B — Canonical Lifecycle Tables

## B.1 Assessment lifecycle

```text
draft
  ↓ adopt
adopted
  ↓ revise
revised
  ↓ supersede
superseded

adopted/revised
  ↓ withdraw
withdrawn
```

Analysis state runs independently:

```text
current
contested
stale
undermined
```

---

## B.2 Mandate case lifecycle

```text
assessment_basis
    ↓
coalition
    ↓
authorization
    ↓
implementation
    ↓
outcome
    ↓
closed
```

Possible exits:

```text
assessment_basis → abandoned
coalition → abandoned
authorization → abandoned
authorization → rejected/abandoned
implementation → outcome
```

---

## B.3 Authorization lifecycle

```text
not_requested
  ↓
pending
  ├→ authorized
  ├→ conditionally_authorized
  └→ rejected

authorized/conditionally_authorized
  ├→ expired
  └→ revoked
```

---

## B.4 Implementation lifecycle

```text
preparing
  ↓
active
  ├→ delayed → active
  ├→ blocked → active
  ├→ suspended → active
  ├→ failed
  └→ completed
```

---

## B.5 Commitment lifecycle

```text
active
  ├→ fulfilled
  ├→ breached
  ├→ waived
  └→ expired
```

---

## B.6 World event lifecycle

```text
active
  ├→ resolved
  └→ expired
```

---

# Appendix C — Hidden Truth and Player Knowledge Matrix

| Domain value | Hidden truth allowed? | Player knowledge representation |
|---|---:|---|
| Historical baseline conflict event | No, if included as public baseline | baseline evidence |
| Current simulated armed-group capability | Yes | estimate/range evidence |
| Actor hidden intent | Yes | inferred assessment/evidence |
| Actor red line | Yes | separate `redLineKnowledge` entry when suspected/known |
| Formal authorization status | Normally no | direct institutional state |
| Coalition support | May be partially uncertain | known or estimated position |
| Scheduled future consequence | Yes | only forecast/risk if inferable |
| Infrastructure public location | Normally no | baseline map layer |
| Infrastructure current disruption risk | Yes | intelligence-derived estimate |
| Player's own budget | No | direct state |
| Player's own political capital | No | direct state |
| Other institution's internal willingness | Yes | position/evidence |
| Mandate restrictions | No after authorization | direct state |
| AI-generated prose | Not truth | presentation only |

---

# Appendix D — Initial Sahel v1 Scenario Assumptions

These are recommended defaults, not engine invariants.

```text
Campaign length: 20 turns
Turn unit: calendar month
Strategic decisions per turn: 3
Primary playable territories:
- Mali
- Burkina Faso
- Niger
- Chad
- Mauritania

Primary institutional environment:
- AU Commission
- Peace and Security Council
- host governments
- ECOWAS
- UN
- EU
- China
- Russia

Secondary/conditional institutional environment:
- EAC
- SADC
- BRICS
- commercial actors

Primary data baseline families:
- ACLED conflict events
- ACLED Conflict Index
- IDMC displacement
- GEM power
- GEM pipelines
- OSM infrastructure/construction
- TeleGeography cables
- development finance
```

The scenario bundle, not the engine, owns these assumptions.

---

# Appendix E — Definition of Conformance

An implementation conforms to this specification only if:

1. hidden simulation truth and player knowledge are structurally separated;
2. player-facing rules cannot read hidden truth;
3. all strategic mutations occur through validated commands/effects;
4. command resolution is atomic and deterministic;
5. campaign state contains all canonical runtime registries;
6. baseline and definitions remain immutable;
7. AI cannot authoritatively mutate simulation state;
8. mandate progression uses explicit coalition, authorization, and implementation state;
9. actor memory and commitments persist and are traceable;
10. the same scenario, versions, seed, and command history reproduce the same authoritative state hash;
11. persistence pins all required versions;
12. player projections do not leak simulation-private state;
13. end-turn order is deterministic and versioned;
14. source provenance and licensing metadata are retained;
15. core gameplay can run headlessly without React, map libraries, Supabase, or an LLM.


---

# Appendix F — Supporting Type Contracts

This appendix closes supporting type references used elsewhere in the specification. These contracts are normative where they affect the simulation engine and illustrative where explicitly marked presentational.

## F.1 Branded ID aliases

Implementations SHOULD use branded string types or equivalent nominal wrappers.

```ts
type CampaignId = string
type TerritoryId = string
type ZoneId = string
type AssetId = string
type CorridorId = string
type InstitutionId = string
type ActorId = string
type RelationshipId = string
type PositionId = string
type MemoryId = string
type CommitmentId = string
type RedLineId = string
type DisputeId = string
type EvidenceId = string
type ReportId = string
type IntelligenceGapId = string
type CollectionTaskId = string
type AssessmentId = string
type MandateCaseId = string
type ProjectId = string
type DecisionId = string
type ConsequenceId = string
type EventDefinitionId = string
type WorldEventId = string
type SituationId = string
type AttentionItemId = string
type BriefingId = string
type ActionId = string
type EffectProfileId = string
```

Plain strings MAY be used at serialization boundaries, but domain APIs SHOULD preserve type distinctions.

---

## F.2 Rule expressions

```ts
type RuleExpression =
  | RulePredicate
  | {
      kind: 'all'
      rules: RuleExpression[]
    }
  | {
      kind: 'any'
      rules: RuleExpression[]
    }
  | {
      kind: 'not'
      rule: RuleExpression
    }
```

```ts
interface RulePredicate {
  kind: 'predicate'

  query: FactQuery

  operator:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'not_contains'
    | 'exists'
    | 'not_exists'

  value?: string | number | boolean

  unknownPolicy?:
    | 'propagate'
    | 'treat_true'
    | 'treat_false'
}
```

`unknownPolicy` SHOULD default to `propagate`.

Rule consumers remain responsible for handling the final `unknown`.

---

## F.3 Fact registry

`FactKey` is not an arbitrary path.

```ts
type FactKey = string
```

Every key MUST exist in an engine-owned registry.

```ts
interface FactDefinition {
  key: FactKey

  valueType:
    | 'number'
    | 'string'
    | 'boolean'
    | 'string_array'
    | 'entity_ref'

  allowedScopes: RuleScope[]

  subjectKinds: SubjectRef['kind'][]

  resolverId: string
}
```

Example registered facts:

```text
zone.conflict_pressure
zone.humanitarian_access
territory.stability
actor.capability.political
relationship.trust
relationship.credibility
assessment.declared_confidence
assessment.support_score
mandate.coalition_support
mandate.authorization_status
player.political_capital
player.secretariat_capacity
```

The content compiler MUST reject unknown fact keys.

---

## F.4 Subject selectors

A rule/effect may reference a fixed subject or a runtime command/context subject.

```ts
type SubjectSelector =
  | {
      kind: 'literal'
      subject: SubjectRef
    }
  | {
      kind: 'command_target'
      targetIndex: number
    }
  | {
      kind: 'mandate_case'
      source: 'current'
    }
  | {
      kind: 'assessment_subject'
      source: 'current'
    }
```

The engine MUST resolve selectors before rule/effect execution.

Failure to resolve a required selector is a validation error.

---

## F.5 Action target schema

```ts
interface ActionTargetSchema {
  allowedKinds: SubjectRef['kind'][]

  minTargets: number
  maxTargets: number

  mustBeWithinMandateScope?: boolean

  uniqueTargets?: boolean
}
```

The action validator MUST reject target sets outside this schema.

---

## F.6 Balance configuration

The exact coefficient set may evolve with simulation-model versions, but the top-level contract is:

```ts
interface BalanceConfiguration {
  balanceProfileId: string
  version: string

  intelligence: Record<string, number>
  actors: Record<string, number>
  relationships: Record<string, number>
  mandates: Record<string, number>
  implementation: Record<string, number>
  consequences: Record<string, number>
  events: Record<string, number>
  doctrine: Record<string, number>
  conflict: Record<string, number>
  civilian: Record<string, number>
  infrastructure: Record<string, number>
  development: Record<string, number>

  attentionBudget: AttentionBudget
}
```

A future version MAY replace generic coefficient maps with stronger typed subcontracts, but all used keys MUST be schema validated.

---

## F.7 Effect contracts

All effects share:

```ts
interface EffectBase {
  effectId: string
}
```

### Relationship

```ts
interface AdjustRelationshipEffect extends EffectBase {
  kind: 'adjust_relationship'

  relationshipId: RelationshipId

  trustDelta?: number
  alignmentDelta?: number
  dependenceDelta?: number
  leverageDelta?: number
  accessDelta?: number
  credibilityDelta?: number
}
```

### Institution resources

```ts
interface AdjustInstitutionResourceEffect extends EffectBase {
  kind: 'adjust_institution_resource'

  institutionId: InstitutionId

  resource:
    | 'financialCapacity'
    | 'personnelCapacity'
    | 'logisticsCapacity'
    | 'diplomaticCapacity'
    | 'intelligenceCapacity'
    | 'implementationCapacity'

  delta: number
}
```

### Envoy capacity

```ts
interface AdjustEnvoyCapacityEffect extends EffectBase {
  kind: 'adjust_envoy_capacity'

  capacity:
    | 'mandateAuthority'
    | 'politicalCapital'
    | 'secretariatCapacity'
    | 'implementationCapacity'
    | 'intelligenceConfidence'

  delta: number
}
```

Derived `memberStateAlignment` and `partnerConfidence` SHOULD NOT be directly mutated except by explicitly documented scenario exceptions.

### Territory core

```ts
interface AdjustTerritoryCoreEffect extends EffectBase {
  kind: 'adjust_territory_core'

  territoryId: TerritoryId

  stabilityDelta?: number
  institutionalCapacityDelta?: number
  economicResilienceDelta?: number
}
```

### Zone core

```ts
interface AdjustZoneCoreEffect extends EffectBase {
  kind: 'adjust_zone_core'

  zoneId: ZoneId

  statePresenceDelta?: number
  controlContestDelta?: number
  localGovernanceCapacityDelta?: number
}
```

### Conflict

```ts
interface AdjustConflictEffect extends EffectBase {
  kind: 'adjust_conflict'

  zoneId: ZoneId

  armedActivityDelta?: number
  civilianTargetingDelta?: number
  actorFragmentationDelta?: number
  mobilityDelta?: number
  recruitmentPressureDelta?: number
  escalationMomentumDelta?: number
  spilloverPressureDelta?: number
}
```

### Civilian

```ts
interface AdjustCivilianEffect extends EffectBase {
  kind: 'adjust_civilian'

  zoneId: ZoneId

  civilianConfidenceDelta?: number
  displacementPressureDelta?: number
  humanitarianAccessDelta?: number
  serviceReliabilityDelta?: number
  perceivedLegitimacyDelta?: number
}
```

### Development

```ts
interface AdjustDevelopmentEffect extends EffectBase {
  kind: 'adjust_development'

  zoneId: ZoneId

  investmentPipelineDelta?: number
  implementationAbsorptionDelta?: number
  infrastructureNeedDelta?: number
  serviceDeficitDelta?: number
  externalFinanceDependenceDelta?: number
}
```

### Infrastructure

```ts
interface AdjustInfrastructureEffect extends EffectBase {
  kind: 'adjust_infrastructure'

  assetId?: AssetId
  corridorId?: CorridorId

  disruptionRiskDelta?: number
  conflictExposureDelta?: number
  economicDependencyDelta?: number
  throughputDelta?: number
  resilienceDelta?: number
}
```

```ts
interface SetAssetStatusEffect extends EffectBase {
  kind: 'set_asset_status'

  assetId: AssetId

  status:
    | 'operational'
    | 'degraded'
    | 'disrupted'
    | 'offline'
    | 'under_construction'
    | 'planned'
    | 'unknown'
}
```

### Registry-creating effects

```ts
interface CreateMemoryEffect extends EffectBase {
  kind: 'create_memory'
  memoryTemplateId: string
}
```

```ts
interface CreateCommitmentEffect extends EffectBase {
  kind: 'create_commitment'
  commitmentTemplateId: string
}
```

```ts
interface OpenDisputeEffect extends EffectBase {
  kind: 'open_dispute'
  disputeTemplateId: string
}
```

```ts
interface ChangePositionEffect extends EffectBase {
  kind: 'change_position'
  positionId: PositionId
  stance: PositionState['stance']
  intensityDelta?: number
}
```

```ts
interface CreateEvidenceEffect extends EffectBase {
  kind: 'create_evidence'
  evidenceTemplateId: string
}
```

```ts
interface CreateCollectionTaskEffect extends EffectBase {
  kind: 'create_collection_task'
  collectionTemplateId: string
}
```

```ts
interface CreateMandateCaseEffect extends EffectBase {
  kind: 'create_mandate_case'
  mandateTemplateId: string
}
```

```ts
interface AdvanceMandateEffect extends EffectBase {
  kind: 'advance_mandate'
  mandateCaseId: MandateCaseId
  targetStage: MandateCaseStage
}
```

```ts
interface CreateImplementationEffect extends EffectBase {
  kind: 'create_implementation'
  implementationProfileId: string
}
```

```ts
interface ScheduleConsequenceEffect extends EffectBase {
  kind: 'schedule_consequence'
  consequenceTemplateId: string
}
```

```ts
interface CreateWorldEventEffect extends EffectBase {
  kind: 'create_world_event'
  eventDefinitionId: EventDefinitionId
}
```

```ts
interface AddAttentionEffect extends EffectBase {
  kind: 'add_attention'
  reasonCode: string
  level: AttentionLevel
  subjectRefs: SubjectRef[]
}
```

Every effect MUST validate its referenced IDs and allowed target domain.

---

## F.8 Authorization requirement runtime state

```ts
interface AuthorizationRequirementState {
  requirementId: string

  definition: AuthorizationRequirementDefinition

  status:
    | 'pending'
    | 'satisfied'
    | 'failed'
    | 'waived'

  satisfiedTurn?: number
}
```

---

## F.9 Implementation milestones

```ts
interface ImplementationMilestoneDefinition {
  milestoneId: string
  nameKey: string

  requiredWorkUnits: number

  completionEffectProfileIds: EffectProfileId[]
}
```

```ts
interface ImplementationMilestoneState {
  milestoneId: string

  status:
    | 'pending'
    | 'completed'
    | 'failed'

  completedTurn?: number
}
```

---

## F.10 Mandate objectives and objective results

A mandate objective MUST be structurally identifiable.

```ts
interface MandateObjectiveDefinition {
  objectiveId: string
  descriptionKey: string

  successRule: RuleExpression

  weight: number
}
```

```ts
interface ObjectiveResult {
  objectiveId: string

  achievement: Score

  achieved: boolean
}
```

Objective weights SHOULD sum to `1.0`, validated at compile time.

---

## F.11 Doctrine profiles and modifiers

```ts
interface DoctrineProfile {
  doctrineProfileId: string

  nameKey: string

  qualifyingVector: DoctrineVector

  modifiers: DoctrineModifier[]
}
```

```ts
interface DoctrineModifier {
  parameterKey: string

  operation:
    | 'add'
    | 'multiply'

  value: number
}
```

`parameterKey` MUST reference a validated balance parameter.

Doctrine modifiers MUST NOT mutate arbitrary state directly.

---

## F.12 Baseline entity contracts

```ts
interface TerritoryBaseline {
  territoryId: TerritoryId

  observedPopulation?: number

  observedIndicators: Record<string, number | string | boolean>

  dataQuality: DataQuality

  provenanceRefs: string[]
}
```

```ts
interface ZoneBaseline {
  zoneId: ZoneId

  observedPopulation?: number

  observedIndicators: Record<string, number | string | boolean>

  dataQuality: DataQuality

  provenanceRefs: string[]
}
```

```ts
interface AssetDefinition {
  assetId: AssetId

  assetType: string

  name: string

  geometryRef: string

  territoryIds: TerritoryId[]
  zoneIds: ZoneId[]

  ownerInstitutionIds: InstitutionId[]

  sourceRecordRefs: string[]
}
```

```ts
interface AssetBaseline {
  assetId: AssetId

  observedStatus: string

  observedProperties: Record<string, number | string | boolean | null>

  dataQuality: DataQuality

  provenanceRefs: string[]
}
```

```ts
interface CorridorDefinition {
  corridorId: CorridorId

  corridorType:
    | 'transport'
    | 'energy'
    | 'digital'
    | 'trade'
    | 'migration'
    | 'security'

  zoneIds: ZoneId[]
  assetIds: AssetId[]
}
```

```ts
interface CorridorBaseline {
  corridorId: CorridorId

  observedIndicators: Record<string, number | string | boolean>

  dataQuality: DataQuality

  provenanceRefs: string[]
}
```

```ts
interface ConflictBaseline {
  zoneIndicators: Record<ZoneId, Record<string, number>>
  territoryIndicators: Record<TerritoryId, Record<string, number>>
}
```

```ts
interface DisplacementBaseline {
  zoneIndicators: Record<ZoneId, Record<string, number>>
}
```

```ts
interface DevelopmentBaseline {
  zoneIndicators: Record<ZoneId, Record<string, number>>
}
```

These baseline contracts retain normalized observed information.

Scenario initialization transforms them into runtime latent state through versioned models.

---

## F.13 Source adapter contract

```ts
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

```ts
interface SourceAdapter<TRaw, TCanonical> {
  sourceKey: string

  parse(raw: TRaw): TCanonical[]

  validate(records: TCanonical[]): ValidationResult
}
```

Adapters MUST be deterministic.

---

## F.14 Evaluation dimension result

```ts
interface EvaluationDimensionResult {
  score: Score

  startingScore: Score
  endingScore: Score

  trend:
    | 'improving'
    | 'stable'
    | 'deteriorating'

  criticalTurns: number

  summaryCode: string
}
```

---

## F.15 Evaluation causal chain

```ts
interface EvaluationCausalChain {
  sourceDecisionIds: DecisionId[]

  intermediateDomainEventIds: string[]

  outcomeSummaryCode: string

  dimensionsAffected: string[]
}
```

---

## F.16 Methodology section

```ts
interface MethodologySection {
  sectionId: string
  titleKey: string
  bodyKey: string
}
```

Methodology prose itself belongs in authored/localized content.

---

## F.17 Presentational leaf types

Types such as:

```text
MapTerritoryVM
MapZoneVM
MapConflictVM
MapInfrastructureVM
MapCorridorVM
MapAttentionVM
DossierChangeVM
DossierAssessmentVM
DossierContradictionVM
DossierPartyVM
DossierMandateVM
DossierDecisionVM
DossierUnknownVM
BriefingSituationVM
BriefingAssessmentVM
BriefingConfidenceVM
BriefingPositionVM
BriefingOptionVM
BriefingRiskVM
BriefingUnknownVM
SituationQueueVM
MandatePortfolioVM
ActorDirectoryVM
AssessmentWorkspaceVM
```

are intentionally PRESENTATIONAL and MAY evolve without a simulation-model version bump, provided they:

1. are derived from approved player projections;
2. do not introduce hidden-state access;
3. do not become persistence authorities.

Their exact UI fields belong in the separate UI/UX specification rather than the simulation domain contract.

---

# Appendix G — Knowledge-State Invariant

The following distinction is mandatory:

```text
TRUE POSITION
PositionState
        ↓ observation/evidence
PLAYER POSITION KNOWLEDGE
PositionKnowledgeState
```

```text
TRUE RED LINE
RedLineState
        ↓ observation/evidence
PLAYER RED-LINE KNOWLEDGE
RedLineKnowledgeStatus
```

```text
TRUE RELATIONSHIP
RelationshipState
        ↓ observation/interactions/evidence
PLAYER RELATIONSHIP KNOWLEDGE
RelationshipKnowledgeState
```

No UI selector, action-preview selector, or player-facing AI context may bypass these knowledge projections.

---

This is the canonical **African Mandate Greenfield Domain Model & Simulation Specification v1.1**.
