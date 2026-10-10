import { describe, expect, it } from "vitest";

import {
  ActionDefinitionSchema,
  ATOMIC_COMMIT_CONTRACT_VERSION,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  EVENT_DOCTRINE_CONTRACT_VERSION,
  EndTurnRequestSchema,
  EvaluationStateSchema,
  EventDefinitionSchema,
  FactDefinitionSchema,
  KnownFactObservationSchema,
  SituationIdSchema,
  SituationStateSchema,
  TestOnlyEventTriggerPlanSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  createInitialDoctrineState,
  createUnavailableEvaluationState,
  type CampaignState,
  type EndTurnRequest,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  createTestOnlyEventDoctrineResolverRegistry,
  evaluateDoctrineReviewEligibility,
  hashCanonicalJson,
  projectKnowledgeSafeWorldEvents,
  resolveTestOnlyEventDirector,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-event-doctrine-v1",
  baselineVersion: "test-only-event-doctrine-v1",
  scenarioVersion: "test-only-event-doctrine-v1",
  contentVersion: "test-only-event-doctrine-v1",
  balanceProfileVersion: "test-only-event-doctrine-v1",
  methodologyVersion: "test-only-event-doctrine-v1",
} as const;

const campaignState = (
  overrides: Readonly<Record<string, unknown>> = {},
): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_event_doctrine_test",
      scenarioId: "scenario_event_doctrine_test",
      campaignSeed: "event-doctrine-test-seed",
      difficultyProfileId: "difficulty_event_doctrine_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
      ...overrides,
    },
    player: {
      representedInstitutionId: "institution_event_doctrine_test",
      materialResources: {
        budget: { amount: 10, currency: "TEST" },
        personnel: 5,
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
        externalPowerCompetition: 0,
        donorRiskTolerance: 0,
        commodityPressure: 0,
        regionalDiplomaticPressure: 0,
      },
    },
    institutions: {},
    actors: {},
    relationships: {},
    positions: {},
    memories: {},
    commitments: {},
    redLines: {},
    disputes: {},
    knowledge: {
      evidence: {},
      reports: {},
      intelligenceGaps: {},
      collectionTasks: {},
      redLineKnowledge: {},
      positionKnowledge: {},
      knownCommitmentIds: [],
      knownDisputeIds: [],
      relationshipKnowledge: {},
    },
    assessments: {},
    mandateCases: {},
    implementations: {},
    worldEvents: {},
    situations: {},
    attention: { items: {} },
    scheduledConsequences: {},
    doctrine: createInitialDoctrineState(),
    evaluation: createUnavailableEvaluationState(),
    decisions: [],
    domainEvents: [],
    processedCommandIds: {},
    versions,
  });

const endTurnRequest = (state: CampaignState): EndTurnRequest =>
  EndTurnRequestSchema.parse({
    contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
    command: {
      commandId: `command_event_end_turn_${state.meta.currentTurn}`,
      commandType: "end_turn",
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {},
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
  });

const factDefinitions = [
  FactDefinitionSchema.parse({
    key: "zone.conflict_pressure",
    valueType: "number",
    allowedScopes: ["simulation"],
    subjectKinds: ["zone"],
    resolverId: "test-only-event-conflict-pressure-v1",
  }),
];

const eventDefinition = EventDefinitionSchema.parse({
  eventDefinitionId: "eventdef_test_conditional_pressure",
  family: "systemic",
  eligibilityRule: {
    kind: "predicate",
    query: {
      fact: "zone.conflict_pressure",
      subject: {
        kind: "literal",
        subject: { kind: "zone", zoneId: "zone_test_event_subject" },
      },
    },
    operator: "gte",
    value: 50,
  },
  weight: 1,
  earliestTurn: 1,
  latestTurn: 20,
  cooldownTurns: 1,
  maxOccurrences: 5,
  attentionLevel: "priority",
  immediateEffectProfileIds: [],
  consequenceProfileIds: [],
  callbackTagsProduced: ["test-only-pressure-observed"],
});

const triggerPlan = TestOnlyEventTriggerPlanSchema.parse({
  planId: "test-only-event-trigger-plan-v1",
  eventDefinitionId: eventDefinition.eventDefinitionId,
  selectionPolicy: "all_eligible_by_definition_id",
  subjectRefs: [{ kind: "zone", zoneId: "zone_test_event_subject" }],
  causeRefs: [
    {
      kind: "world_dynamic",
      subsystem: "conflict",
      subjectRefs: [{ kind: "zone", zoneId: "zone_test_event_subject" }],
    },
  ],
  situationDirective: {
    situationId: "situation_test_conditional_pressure",
    situationType: "strategic_issue",
    urgency: "priority",
    blocking: false,
    statusOnOpen: "open",
    statusOnRetrigger: "developing",
  },
});

const factObservations = (value: number) => [
  KnownFactObservationSchema.parse({
    query: {
      fact: "zone.conflict_pressure",
      subject: { kind: "zone", zoneId: "zone_test_event_subject" },
    },
    resolution: { kind: "known", value },
  }),
];

const eventRequest = (state: CampaignState, value: number) => ({
  contractVersion: EVENT_DOCTRINE_CONTRACT_VERSION,
  classification: "TEST_ONLY_EVENT_DIRECTOR",
  currentState: state,
  eventDefinitions: [eventDefinition],
  triggerPlans: [triggerPlan],
  factDefinitions,
  factObservations: factObservations(value),
});

const doctrineAction = ActionDefinitionSchema.parse({
  actionId: "action_test_doctrine_signal",
  nameKey: "test.doctrine.name",
  descriptionKey: "test.doctrine.description",
  actionDomain: "diplomacy",
  commandType: "test_doctrine_signal",
  decisionSlotCost: 1,
  targetSchema: {
    allowedKinds: [],
    minTargets: 0,
    maxTargets: 0,
    uniqueTargets: true,
  },
  eligibilityRule: { kind: "all", rules: [] },
  mandateRequirement: "none",
  immediateEffectProfileIds: [],
  consequenceProfileIds: [],
  doctrineSignal: {
    prevention: 4,
    centralization: -2,
    policyOrientation: 3,
    diplomaticStyle: 1,
  },
  previewPolicyId: "test-only-doctrine-preview-v1",
});

const actionOptions = {
  actions: [doctrineAction],
  factRegistry: new FactRegistry([]),
  factSource: new KnownFactSource([]),
  costProfiles: [],
  structuralValidators: {
    [doctrineAction.actionId]: () => ({ status: "valid" as const }),
  },
};

const commitDoctrineAction = (
  state: CampaignState,
  commandId: string,
): ReturnType<typeof simulateStrategicCommand> =>
  simulateStrategicCommand(
    {
      request: AtomicStrategicCommandRequestSchema.parse({
        contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
        command: {
          commandId,
          commandType: doctrineAction.commandType,
          campaignId: state.meta.campaignId,
          submittedTurn: state.meta.currentTurn,
          payload: {
            actionId: doctrineAction.actionId,
            targets: [],
            terms: [],
          },
        },
        expectedRevision: state.meta.revision,
        expectedVersions: state.versions,
      }),
      currentState: state,
    },
    actionOptions,
  );

describe("state-driven events, doctrine, and evaluation traces", () => {
  it("allows inaction and a quiet month without forcing catastrophe", () => {
    const state = campaignState();
    const situationId = SituationIdSchema.parse(
      "situation_test_persistent_opportunity",
    );
    state.situations[situationId] = SituationStateSchema.parse({
      situationId,
      situationType: "opportunity",
      subjectRefs: [],
      relatedWorldEventIds: [],
      openedTurn: 1,
      urgency: "routine",
      status: "open",
      blocking: false,
    });
    const validated = CampaignStateSchema.parse(state);
    const registry = createTestOnlyEventDoctrineResolverRegistry({
      eventDefinitions: [eventDefinition],
      triggerPlans: [triggerPlan],
      factDefinitions,
      factObservations: factObservations(20),
    });
    const result = simulateEndTurn(
      { request: endTurnRequest(validated), currentState: validated },
      registry,
    );

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("turn rejected");
    expect(result.nextState.worldEvents).toEqual({});
    expect(result.nextState.situations[situationId]).toEqual(
      validated.situations[situationId],
    );
    expect(result.nextState.meta.currentTurn).toBe(2);
  });

  it("links a triggered event to developer-only causes and emits a knowledge-safe projection", () => {
    const result = resolveTestOnlyEventDirector(
      eventRequest(campaignState(), 70),
    );

    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") throw new Error("event rejected");
    expect(result.developerCauseTraces).toHaveLength(1);
    expect(result.developerCauseTraces[0]).toMatchObject({
      classification: "DEVELOPER_ONLY_CAUSE_TRACE",
      eventDefinitionId: eventDefinition.eventDefinitionId,
      eligibilityResult: "true",
      outcome: "triggered",
      causeRefs: triggerPlan.causeRefs,
    });
    expect(result.knowledgeSafeEvents).toHaveLength(1);
    expect(result.knowledgeSafeEvents[0]).not.toHaveProperty("causeRefs");
    expect(result.knowledgeSafeEvents[0]).not.toHaveProperty(
      "developerOnlyCauseRefs",
    );
    const projected = projectKnowledgeSafeWorldEvents(result.nextState);
    expect(projected).toEqual(result.knowledgeSafeEvents);
    const technicalEvent = result.nextState.domainEvents.find(
      (event) => event.eventType === "world_event_triggered",
    );
    expect(technicalEvent?.payload).toMatchObject({
      developerOnlyCauseRefs: triggerPlan.causeRefs,
    });
    expect(
      Object.values(result.nextState.situations)[0]?.relatedWorldEventIds,
    ).toEqual([result.knowledgeSafeEvents[0]?.worldEventId]);
  });

  it("does not trigger the same event or situation reaction twice in one turn", () => {
    const first = resolveTestOnlyEventDirector(
      eventRequest(campaignState(), 70),
    );
    expect(first.status).toBe("resolved");
    if (first.status !== "resolved") throw new Error("event rejected");
    const second = resolveTestOnlyEventDirector(
      eventRequest(first.nextState, 70),
    );

    expect(second.status).toBe("resolved");
    if (second.status !== "resolved") throw new Error("event rejected");
    expect(second.knowledgeSafeEvents).toEqual([]);
    expect(second.developerCauseTraces[0]?.outcome).toBe(
      "already_triggered_this_turn",
    );
    expect(Object.keys(second.nextState.worldEvents)).toHaveLength(1);
    expect(
      Object.values(second.nextState.situations)[0]?.relatedWorldEventIds,
    ).toHaveLength(1);
    expect(
      second.nextState.domainEvents.filter(
        (event) => event.eventType === "world_event_triggered",
      ),
    ).toHaveLength(1);
  });

  it("rejects unknown event eligibility without mutating state", () => {
    const state = campaignState();
    const before = hashCanonicalJson(state);
    const result = resolveTestOnlyEventDirector({
      ...eventRequest(state, 70),
      factObservations: [],
    });

    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "UNKNOWN_ELIGIBILITY",
    });
    expect(hashCanonicalJson(state)).toBe(before);
  });

  it("makes observational doctrine review eligible only at Month 5 without codifying", () => {
    let state = campaignState({
      currentTurn: 4,
      currentDate: "2026-01-01",
      revision: 3,
    });
    expect(evaluateDoctrineReviewEligibility(state)).toMatchObject({
      available: false,
      reasonCode: "MONTH_5_NOT_REACHED",
    });
    for (let index = 1; index <= 2; index += 1) {
      const command = commitDoctrineAction(
        state,
        `command_test_doctrine_${index}`,
      );
      expect(command.status).toBe("committed");
      if (command.status !== "committed") throw new Error("action rejected");
      state = command.nextState;
    }
    const registry = createTestOnlyEventDoctrineResolverRegistry({
      eventDefinitions: [],
      triggerPlans: [],
      factDefinitions: [],
      factObservations: [],
    });
    const result = simulateEndTurn(
      { request: endTurnRequest(state), currentState: state },
      registry,
    );

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("turn rejected");
    expect(result.nextState.meta.currentTurn).toBe(5);
    expect(evaluateDoctrineReviewEligibility(result.nextState)).toMatchObject({
      available: true,
      earliestTurn: 5,
      reviewMode: "observational_only",
      reasonCode: "MONTH_5_REACHED",
    });
    expect(result.nextState.doctrine).toMatchObject({
      observed: {
        prevention: 8,
        centralization: -4,
        policyOrientation: 6,
        diplomaticStyle: 2,
      },
      codified: false,
      modifiers: [],
    });
    expect(result.nextState.doctrine).not.toHaveProperty("codifiedProfileId");
  });

  it("keeps all six evaluation dimensions unavailable and rejects an invented zero score", () => {
    const evaluation = createUnavailableEvaluationState();
    expect(Object.keys(evaluation.dimensions)).toEqual([
      "security",
      "civilianOutcomes",
      "regionalStability",
      "institutionalCohesion",
      "legitimacy",
      "mandateSustainability",
    ]);
    expect(Object.values(evaluation.dimensions)).toEqual(
      Array.from({ length: 6 }, () => ({
        status: "unscored",
        reasonCode: "APPROVED_COEFFICIENTS_UNAVAILABLE",
      })),
    );
    expect(
      EvaluationStateSchema.safeParse({
        ...evaluation,
        dimensions: {
          ...evaluation.dimensions,
          security: { status: "scored", score: 0 },
        },
      }).success,
    ).toBe(false);
    expect(evaluation).not.toHaveProperty("overallScore");
    expect(evaluation.snapshots).toEqual([]);
  });

  it("rejects a same-month fourth consequential action", () => {
    let state = campaignState();
    for (let index = 1; index <= 3; index += 1) {
      const result = commitDoctrineAction(state, `command_test_slot_${index}`);
      expect(result.status).toBe("committed");
      if (result.status !== "committed") throw new Error("action rejected");
      state = result.nextState;
    }
    const beforeFourth = hashCanonicalJson(state);
    const fourth = commitDoctrineAction(state, "command_test_slot_4");

    expect(fourth).toMatchObject({
      status: "rejected",
      reasonCode: "DECISION_SLOTS_RESERVED",
    });
    expect(state.meta.decisionsRemaining).toBe(0);
    expect(state.decisions).toHaveLength(3);
    expect(hashCanonicalJson(state)).toBe(beforeFourth);
  });
});
