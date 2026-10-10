import { describe, expect, it } from "vitest";

import {
  ACTOR_CONTRACT_VERSION,
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionDefinitionSchema,
  ActorAdaptationPlanSchema,
  ActorAdaptationProfileSchema,
  ActorIdSchema,
  ActorMemoryEffectProfileSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  EndTurnRequestSchema,
  EvidenceRecordSchema,
  InstitutionIdSchema,
  PositionIdSchema,
  RedLineDiscoveryRequestSchema,
  RedLineIdSchema,
  RelationshipIdSchema,
  ScoreSchema,
  TestOnlyMemoryTemplateSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  type CampaignState,
  type PartyRef,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  buildPlayerKnowledgeProjection,
  createTestOnlyActorResolverRegistry,
  discoverRedLine,
  findDirectionalRelationship,
  hashCanonicalJson,
  resolveActorAdaptation,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const actorAId = ActorIdSchema.parse("actor_test_counterpart_a");
const actorBId = ActorIdSchema.parse("actor_test_counterpart_b");
const institutionAId = InstitutionIdSchema.parse("institution_test_actor_a");
const institutionBId = InstitutionIdSchema.parse("institution_test_actor_b");
const relationshipABId = RelationshipIdSchema.parse("relationship_test_a_to_b");
const positionAId = PositionIdSchema.parse("position_test_actor_a_issue");
const redLineAId = RedLineIdSchema.parse("redline_test_actor_a_access");

const actorA: PartyRef = { kind: "actor", actorId: actorAId };
const actorB: PartyRef = { kind: "actor", actorId: actorBId };

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-actor-v1",
  baselineVersion: "test-only-actor-v1",
  scenarioVersion: "test-only-actor-v1",
  contentVersion: "test-only-actor-v1",
  balanceProfileVersion: "test-only-actor-v1",
  methodologyVersion: "test-only-actor-v1",
} as const;

const institution = (institutionId: typeof institutionAId) => ({
  institutionId,
  resources: {
    financialCapacity: 50,
    personnelCapacity: 50,
    logisticsCapacity: 50,
    diplomaticCapacity: 50,
    intelligenceCapacity: 50,
    implementationCapacity: 50,
  },
  policyPositions: {},
  activeCommitmentIds: [],
  activeDisputeIds: [],
  legitimacy: 50,
  coordinationCapacity: 50,
});

const actor = (actorId: typeof actorAId, issuePositionIds: string[] = []) => ({
  actorId,
  capabilities: {
    political: 90,
    coercive: 50,
    financial: 50,
    information: 50,
    implementation: 50,
  },
  activeIntent: {
    activeGoalCodes: ["test_only_goal"],
    aggressiveness: 50,
    opportunism: 50,
    compromiseWillingness: 50,
    strategyTags: ["test_only_strategy"],
  },
  issuePositionIds,
  memoryIds: [],
  commitmentIds: [],
  redLineIds: actorId === actorAId ? [redLineAId] : [],
  disputeIds: [],
  fatigue: 10,
});

const emptyKnowledge = () => ({
  evidence: {},
  reports: {},
  intelligenceGaps: {},
  collectionTasks: {},
  redLineKnowledge: {},
  positionKnowledge: {},
  knownCommitmentIds: [],
  knownDisputeIds: [],
  relationshipKnowledge: {},
});

const campaignState = (): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_actor_test",
      scenarioId: "scenario_actor_test",
      campaignSeed: "actor-memory-test-seed",
      difficultyProfileId: "difficulty_actor_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: institutionBId,
      materialResources: {
        budget: { amount: 0, currency: "TEST" },
        personnel: 0,
        logistics: 50,
      },
      institutionalCapacity: {
        mandateAuthority: 50,
        politicalCapital: 50,
        secretariatCapacity: 50,
        memberStateAlignment: 50,
        partnerConfidence: 50,
        implementationCapacity: 50,
        intelligenceConfidence: 50,
      },
    },
    world: {
      territories: {},
      zones: {},
      conflict: { zones: {} },
      civilian: { zones: {} },
      infrastructure: { assets: {}, corridors: {} },
      development: { zones: {} },
      externalEnvironment: {
        externalPowerCompetition: 50,
        donorRiskTolerance: 50,
        commodityPressure: 50,
        regionalDiplomaticPressure: 50,
      },
    },
    institutions: {
      [institutionAId]: institution(institutionAId),
      [institutionBId]: institution(institutionBId),
    },
    actors: {
      [actorAId]: actor(actorAId, [positionAId]),
      [actorBId]: actor(actorBId),
    },
    relationships: {
      [relationshipABId]: {
        relationshipId: relationshipABId,
        source: actorA,
        target: actorB,
        trust: 40,
        strategicAlignment: 40,
        sourceDependenceOnTarget: 40,
        sourceLeverageOverTarget: 0,
        access: 40,
        credibility: 40,
        lastChangedTurn: 1,
      },
    },
    positions: {
      [positionAId]: {
        positionId: positionAId,
        holder: actorA,
        subject: { kind: "issue", id: "issue_test_monitoring_access" },
        stance: "resist",
        intensity: 90,
        conditionCodes: ["test_only_condition"],
        lastChangedTurn: 1,
      },
    },
    memories: {},
    commitments: {},
    redLines: {
      [redLineAId]: {
        redLineId: redLineAId,
        holder: actorA,
        triggerRule: { kind: "all", rules: [] },
        severity: "hard",
        consequenceProfileId: "effectprofile_test_redline",
        status: "active",
      },
    },
    disputes: {},
    knowledge: emptyKnowledge(),
    assessments: {},
    mandateCases: {},
    implementations: {},
    worldEvents: {},
    situations: {},
    attention: { items: {} },
    scheduledConsequences: {},
    doctrine: {},
    evaluation: {},
    decisions: [],
    domainEvents: [],
    processedCommandIds: {},
    versions,
  });

const consultationAction = ActionDefinitionSchema.parse({
  actionId: "action_test_actor_consultation",
  nameKey: "test.actor.consultation.name",
  descriptionKey: "test.actor.consultation.description",
  actionDomain: "diplomacy",
  commandType: "test_actor_consultation",
  decisionSlotCost: 1,
  targetSchema: {
    allowedKinds: ["actor"],
    minTargets: 1,
    maxTargets: 1,
    uniqueTargets: true,
  },
  eligibilityRule: { kind: "all", rules: [] },
  mandateRequirement: "none",
  immediateEffectProfileIds: ["effectprofile_test_actor_consultation"],
  consequenceProfileIds: [],
  doctrineSignal: {},
  previewPolicyId: "preview_test_actor_consultation",
});

const memoryProfile = ActorMemoryEffectProfileSchema.parse({
  effectProfileId: "effectprofile_test_actor_consultation",
  effects: [
    {
      effectId: "effect_test_actor_consultation_memory",
      kind: "create_memory",
      memoryTemplateId: "memory_template_test_actor_consultation",
    },
  ],
});

const memoryTemplate = TestOnlyMemoryTemplateSchema.parse({
  memoryTemplateId: "memory_template_test_actor_consultation",
  profileVersion: "test-only-memory-v1",
  classification: "TEST_ONLY_MEMORY_TEMPLATE",
  owner: actorA,
  memoryType: "consultation",
  salience: 50,
  persistenceClass: "routine",
  tags: ["interaction_test_consultation"],
  relationshipId: relationshipABId,
  firstRelationshipEffects: {
    trust: 10,
    strategicAlignment: 5,
    credibility: 5,
  },
  firstFatigueDelta: 2,
  repetitionPolicy: {
    interactionTag: "interaction_test_consultation",
    cooldownTurns: 2,
    repeatRelationshipEffects: {
      trust: 0,
      strategicAlignment: 0,
      credibility: 0,
    },
    repeatFatigueDelta: 20,
  },
});

const commandRequest = (state: CampaignState, commandId: string) =>
  AtomicStrategicCommandRequestSchema.parse({
    contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
    command: {
      commandId,
      commandType: consultationAction.commandType,
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {
        actionId: consultationAction.actionId,
        targets: [actorA],
        terms: [],
      },
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
  });

const commandOptions = {
  actions: [consultationAction],
  factRegistry: new FactRegistry([]),
  factSource: new KnownFactSource([]),
  costProfiles: [],
  structuralValidators: {
    [consultationAction.actionId]: () => ({ status: "valid" as const }),
  },
  actorMemoryEffectProfiles: [memoryProfile],
  memoryTemplates: [memoryTemplate],
};

describe("actor relationships, positions, and memory", () => {
  it("keeps relationships directional and positions issue-specific", () => {
    const state = campaignState();
    expect(findDirectionalRelationship(state, actorA, actorB)).toMatchObject({
      status: "found",
      relationship: { trust: 40 },
    });
    expect(findDirectionalRelationship(state, actorB, actorA)).toEqual({
      status: "missing",
      reasonCode: "DIRECTION_NOT_REGISTERED",
    });
    expect(state.positions[positionAId]).toMatchObject({
      subject: { kind: "issue", id: "issue_test_monitoring_access" },
      stance: "resist",
    });
    expect(state.relationships[relationshipABId]!.trust).toBe(40);

    const duplicate = structuredClone(state);
    const duplicateId = RelationshipIdSchema.parse(
      "relationship_test_a_to_b_duplicate",
    );
    duplicate.relationships[duplicateId] = {
      ...duplicate.relationships[relationshipABId]!,
      relationshipId: duplicateId,
    };
    expect(CampaignStateSchema.safeParse(duplicate).success).toBe(false);
  });

  it("SIM-02 applies memory effects once and prevents repetitive diplomacy farming", () => {
    const initial = campaignState();
    const first = simulateStrategicCommand(
      {
        request: commandRequest(initial, "command_test_consultation_1"),
        currentState: initial,
      },
      commandOptions,
    );
    expect(first.status).toBe("committed");
    if (first.status !== "committed") throw new Error("first command rejected");
    expect(first.nextState.relationships[relationshipABId]).toMatchObject({
      trust: 50,
      strategicAlignment: 45,
      credibility: 45,
    });
    expect(first.nextState.actors[actorAId]!.fatigue).toBe(12);
    expect(Object.keys(first.nextState.memories)).toHaveLength(1);

    const firstHash = hashCanonicalJson(first.nextState);
    const duplicate = simulateStrategicCommand(
      {
        request: commandRequest(first.nextState, "command_test_consultation_1"),
        currentState: first.nextState,
      },
      commandOptions,
    );
    expect(duplicate.status).toBe("duplicate");
    expect(hashCanonicalJson(first.nextState)).toBe(firstHash);

    const repeated = simulateStrategicCommand(
      {
        request: commandRequest(first.nextState, "command_test_consultation_2"),
        currentState: first.nextState,
      },
      commandOptions,
    );
    expect(repeated.status).toBe("committed");
    if (repeated.status !== "committed") throw new Error("repeat rejected");
    expect(repeated.nextState.relationships[relationshipABId]).toMatchObject({
      trust: 50,
      strategicAlignment: 45,
      credibility: 45,
    });
    expect(repeated.nextState.actors[actorAId]!.fatigue).toBe(32);
    expect(Object.keys(repeated.nextState.memories)).toHaveLength(2);
    expect(
      Object.values(repeated.nextState.memories)[1]
        ?.originalRelationshipEffects,
    ).toEqual({ trust: 0, strategicAlignment: 0, credibility: 0 });
  });

  it("changing hidden intent and stance does not alter player knowledge", () => {
    const left = campaignState();
    const right = structuredClone(left);
    right.actors[actorAId]!.activeIntent.aggressiveness =
      ScoreSchema.parse(100);
    right.actors[actorAId]!.activeIntent.activeGoalCodes = ["hidden_changed"];
    right.positions[positionAId]!.stance = "strong_support";
    right.positions[positionAId]!.intensity = ScoreSchema.parse(1);

    expect(buildPlayerKnowledgeProjection(left)).toEqual(
      buildPlayerKnowledgeProjection(CampaignStateSchema.parse(right)),
    );
  });

  it("discovers red lines only through received evidence", () => {
    const state = campaignState();
    const evidence = EvidenceRecordSchema.parse({
      evidenceId: "evidence_test_redline_signal",
      subject: { kind: "actor", actorId: actorAId },
      claim: { kind: "text_claim", claimCode: "redline.access_signal" },
      sourceType: "simulation_observation",
      initialConfidence: 80,
      sourceReliability: 80,
      observedTurn: 1,
      observedDate: "2025-10-01",
      decayProfileId: "decay_test_actor",
      provenanceRef: "TEST_ONLY:actor-redline-signal",
      reportSensitivity: "restricted",
    });
    state.knowledge.evidence[evidence.evidenceId] = evidence;
    const unrelatedEvidence = EvidenceRecordSchema.parse({
      ...evidence,
      evidenceId: "evidence_test_unrelated_redline_signal",
      subject: { kind: "actor", actorId: actorBId },
    });
    state.knowledge.evidence[unrelatedEvidence.evidenceId] = unrelatedEvidence;
    const validated = CampaignStateSchema.parse(state);
    expect(
      buildPlayerKnowledgeProjection(validated).knowledge.redLineKnowledge,
    ).toEqual({});

    const missing = discoverRedLine({
      contractVersion: ACTOR_CONTRACT_VERSION,
      classification: "TEST_ONLY_RED_LINE_DISCOVERY",
      currentState: validated,
      redLineId: redLineAId,
      knowledgeStatus: "known",
      supportingEvidenceIds: ["evidence_test_missing"],
    });
    expect(missing).toMatchObject({
      status: "rejected",
      reasonCode: "EVIDENCE_NOT_FOUND",
    });

    expect(
      discoverRedLine({
        contractVersion: ACTOR_CONTRACT_VERSION,
        classification: "TEST_ONLY_RED_LINE_DISCOVERY",
        currentState: validated,
        redLineId: redLineAId,
        knowledgeStatus: "known",
        supportingEvidenceIds: [unrelatedEvidence.evidenceId],
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "EVIDENCE_SCOPE_MISMATCH",
    });

    const discovered = discoverRedLine(
      RedLineDiscoveryRequestSchema.parse({
        contractVersion: ACTOR_CONTRACT_VERSION,
        classification: "TEST_ONLY_RED_LINE_DISCOVERY",
        currentState: validated,
        redLineId: redLineAId,
        knowledgeStatus: "known",
        supportingEvidenceIds: [evidence.evidenceId],
      }),
    );
    expect(discovered.status).toBe("resolved");
    if (discovered.status !== "resolved") throw new Error("discovery rejected");
    const projection = buildPlayerKnowledgeProjection(discovered.nextState);
    expect(projection.knowledge.redLineKnowledge[redLineAId]).toBe("known");
    expect(JSON.stringify(projection)).not.toContain("triggerRule");
  });

  it("applies conditional adaptation at step 7 with bounded capacity", () => {
    const initial = campaignState();
    const first = simulateStrategicCommand(
      {
        request: commandRequest(initial, "command_test_adaptation_setup"),
        currentState: initial,
      },
      commandOptions,
    );
    expect(first.status).toBe("committed");
    if (first.status !== "committed") throw new Error("setup rejected");

    const eligible = ActorAdaptationProfileSchema.parse({
      actorAdaptationProfileId: "actor_adaptation_test_eligible",
      profileVersion: "test-only-adaptation-v1",
      classification: "TEST_ONLY_ACTOR_ADAPTATION_PROFILE",
      actorId: actorAId,
      condition: {
        requiredMemoryTags: ["interaction_test_consultation"],
        minFatigue: 10,
      },
      fatigueDelta: 100,
      capabilityDeltas: { political: 100 },
      relationshipEffects: [
        {
          effectId: "effect_test_adaptation_relationship",
          kind: "adjust_relationship",
          relationshipId: relationshipABId,
          leverageDelta: 200,
          accessDelta: 100,
        },
      ],
      positionEffects: [
        {
          effectId: "effect_test_adaptation_position",
          kind: "change_position",
          positionId: positionAId,
          stance: "conditional_support",
          intensityDelta: 100,
        },
      ],
    });
    const ineligible = ActorAdaptationProfileSchema.parse({
      actorAdaptationProfileId: "actor_adaptation_test_ineligible",
      profileVersion: "test-only-adaptation-v1",
      classification: "TEST_ONLY_ACTOR_ADAPTATION_PROFILE",
      actorId: actorBId,
      condition: { requiredMemoryTags: ["missing_memory_tag"] },
      fatigueDelta: 5,
      relationshipEffects: [],
      positionEffects: [],
    });
    const plan = ActorAdaptationPlanSchema.parse({
      turn: 1,
      adaptationKey: "turn_1_actor_adaptation_test",
      profileIds: [
        eligible.actorAdaptationProfileId,
        ineligible.actorAdaptationProfileId,
      ],
    });
    expect(
      ActorAdaptationPlanSchema.safeParse({
        ...plan,
        profileIds: [
          eligible.actorAdaptationProfileId,
          eligible.actorAdaptationProfileId,
        ],
      }).success,
    ).toBe(false);
    const registry = createTestOnlyActorResolverRegistry({
      profiles: [eligible, ineligible],
      plans: [plan],
    });
    const endTurn = simulateEndTurn(
      {
        request: EndTurnRequestSchema.parse({
          contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
          command: {
            commandId: "command_test_actor_end_turn",
            commandType: "end_turn",
            campaignId: first.nextState.meta.campaignId,
            submittedTurn: 1,
            payload: {},
          },
          expectedRevision: first.nextState.meta.revision,
          expectedVersions: first.nextState.versions,
        }),
        currentState: first.nextState,
      },
      registry,
    );
    expect(endTurn.status).toBe("committed");
    if (endTurn.status !== "committed") throw new Error("end turn rejected");
    expect(endTurn.nextState.actors[actorAId]).toMatchObject({
      fatigue: 100,
      capabilities: { political: 100 },
    });
    expect(endTurn.nextState.actors[actorBId]!.fatigue).toBe(10);
    expect(endTurn.nextState.relationships[relationshipABId]).toMatchObject({
      sourceLeverageOverTarget: 100,
      access: 100,
    });
    expect(endTurn.nextState.positions[positionAId]).toMatchObject({
      stance: "conditional_support",
      intensity: 100,
    });
    expect(
      endTurn.resolverTrace.find(
        (trace) => trace.resolverId === "actors_and_positions",
      ),
    ).toMatchObject({
      sourceStep: "7",
      adapterKind: "test_only_fixture",
      outcome: "applied",
    });

    const duplicatePlan = {
      ...plan,
      turn: 2,
    };
    expect(
      resolveActorAdaptation({
        contractVersion: ACTOR_CONTRACT_VERSION,
        classification: "TEST_ONLY_ACTOR_ADAPTATION",
        currentState: endTurn.nextState,
        profiles: [eligible, ineligible],
        plan: duplicatePlan,
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "ADAPTATION_ALREADY_APPLIED",
    });
  });

  it("rejects reverse-direction adaptation without mutating input", () => {
    const state = campaignState();
    const before = hashCanonicalJson(state);
    const reverseProfile = ActorAdaptationProfileSchema.parse({
      actorAdaptationProfileId: "actor_adaptation_test_reverse_rejected",
      profileVersion: "test-only-adaptation-v1",
      classification: "TEST_ONLY_ACTOR_ADAPTATION_PROFILE",
      actorId: actorBId,
      condition: { requiredMemoryTags: [] },
      fatigueDelta: 0,
      relationshipEffects: [
        {
          effectId: "effect_test_reverse_rejected",
          kind: "adjust_relationship",
          relationshipId: relationshipABId,
          trustDelta: 5,
        },
      ],
      positionEffects: [],
    });
    const result = resolveActorAdaptation({
      contractVersion: ACTOR_CONTRACT_VERSION,
      classification: "TEST_ONLY_ACTOR_ADAPTATION",
      currentState: state,
      profiles: [reverseProfile],
      plan: {
        turn: 1,
        adaptationKey: "reverse_direction_rejected",
        profileIds: [reverseProfile.actorAdaptationProfileId],
      },
    });
    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "RELATIONSHIP_DIRECTION_MISMATCH",
    });
    expect(hashCanonicalJson(state)).toBe(before);
  });
});
