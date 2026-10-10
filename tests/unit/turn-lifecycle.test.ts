import { describe, expect, it } from "vitest";

import {
  AtomicCampaignTurnService,
  CampaignPersistenceError,
  InMemoryCampaignEditLock,
  InMemoryCampaignRepository,
  InMemoryCampaignRuntimeStore,
  SerialCampaignOperationCoordinator,
  createSaveSnapshot,
  type AtomicCommandRepositoryTypes,
} from "@african-mandate/application";
import {
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionDefinitionSchema,
  AttentionItemIdSchema,
  AttentionItemSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  EndTurnRequestSchema,
  ConsequenceIdSchema,
  ScheduledConsequenceSchema,
  SituationIdSchema,
  SituationStateSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  type CampaignState,
  type EndTurnRequest,
} from "@african-mandate/domain";
import {
  FactRegistry,
  InProcessEndTurnDispatcher,
  KnownFactSource,
  createInitialTurnResolverRegistry,
  hashCanonicalJson,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-turn-v1",
  baselineVersion: "test-only-turn-v1",
  scenarioVersion: "test-only-turn-v1",
  contentVersion: "test-only-turn-v1",
  balanceProfileVersion: "test-only-turn-v1",
  methodologyVersion: "test-only-turn-v1",
} as const;

const campaignState = (
  overrides: Readonly<Record<string, unknown>> = {},
): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_turn_lifecycle_test",
      scenarioId: "scenario_turn_lifecycle_test",
      campaignSeed: "turn-lifecycle-test-seed",
      difficultyProfileId: "difficulty_turn_test",
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
      representedInstitutionId: "institution_turn_test",
      materialResources: {
        budget: { amount: 10, currency: "TEST" },
        personnel: 5,
        logistics: 50,
      },
      institutionalCapacity: {
        mandateAuthority: 50,
        politicalCapital: 5,
        secretariatCapacity: 5,
        memberStateAlignment: 50,
        partnerConfidence: 50,
        implementationCapacity: 5,
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
    doctrine: {},
    evaluation: {},
    decisions: [],
    domainEvents: [],
    processedCommandIds: {},
    versions,
  });

const endTurnRequest = (
  state: CampaignState,
  commandId = `command_end_turn_${state.meta.currentTurn}`,
): EndTurnRequest =>
  EndTurnRequestSchema.parse({
    contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
    command: {
      commandId,
      commandType: "end_turn",
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {},
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
  });

const blockingItem = (id: unknown, turn: number) =>
  AttentionItemSchema.parse({
    attentionItemId: id,
    level: "decision_required",
    createdTurn: turn,
    subjectRefs: [{ kind: "actor", actorId: "actor_turn_test" }],
    reasonCode: "TEST_ONLY_MANDATORY_RESPONSE",
    blocking: true,
    resolved: false,
  });

const responseAction = ActionDefinitionSchema.parse({
  actionId: "action_turn_test_response",
  nameKey: "test.turn.response.name",
  descriptionKey: "test.turn.response.description",
  actionDomain: "diplomacy",
  commandType: "respond_to_test_attention",
  decisionSlotCost: 1,
  targetSchema: {
    allowedKinds: ["actor"],
    minTargets: 1,
    maxTargets: 1,
    uniqueTargets: true,
  },
  eligibilityRule: { kind: "all", rules: [] },
  mandateRequirement: "none",
  immediateEffectProfileIds: [],
  consequenceProfileIds: [],
  doctrineSignal: {},
  previewPolicyId: "preview_turn_test",
});

const actionOptions = {
  actions: [responseAction],
  factRegistry: new FactRegistry([]),
  factSource: new KnownFactSource([]),
  costProfiles: [],
  structuralValidators: {
    [responseAction.actionId]: () => ({ status: "valid" as const }),
  },
};

describe("calendar, scheduling, and attention lifecycle", () => {
  it("advances October 2025 to February 2026 in four exact rollovers", () => {
    let state = campaignState({ decisionsRemaining: 1 });
    const dates = [state.meta.currentDate];

    for (let index = 0; index < 4; index += 1) {
      const result = simulateEndTurn({
        request: endTurnRequest(state),
        currentState: state,
      });
      expect(result.status).toBe("committed");
      if (result.status !== "committed") throw new Error("turn rejected");
      state = result.nextState;
      dates.push(state.meta.currentDate);
      expect(state.meta.decisionsRemaining).toBe(3);
    }

    expect(dates).toEqual([
      "2025-10-01",
      "2025-11-01",
      "2025-12-01",
      "2026-01-01",
      "2026-02-01",
    ]);
    expect(state.meta.currentTurn).toBe(5);
    expect(state.meta.revision).toBe(4);
  });

  it("resolves Month 20, forfeits unused slots, and does not advance", () => {
    const state = campaignState({
      currentTurn: 20,
      currentDate: "2027-05-01",
      decisionsRemaining: 2,
      revision: 19,
    });
    const result = simulateEndTurn({
      request: endTurnRequest(state),
      currentState: state,
    });

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("turn rejected");
    expect(result.finalTurn).toBe(true);
    expect(result.nextState.meta).toMatchObject({
      currentTurn: 20,
      currentDate: "2027-05-01",
      decisionsRemaining: 0,
      revision: 20,
      status: "completed",
    });
    expect(
      result.resolverTrace.find(
        (entry) => entry.resolverId === "final_evaluation",
      ),
    ).toMatchObject({
      sourceStep: "19",
      adapterKind: "initial_no_op",
      outcome: "no_change",
    });
  });

  it("reserves mandatory capacity and lets the final slot answer the blocker", () => {
    const attentionItemId = AttentionItemIdSchema.parse(
      "attention_turn_test_required",
    );
    const state = campaignState({ decisionsRemaining: 1 });
    state.attention.items[attentionItemId] = blockingItem(
      attentionItemId,
      state.meta.currentTurn,
    );
    const validated = CampaignStateSchema.parse(state);
    const baseRequest = {
      contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
      command: {
        commandId: "command_turn_test_response",
        commandType: responseAction.commandType,
        campaignId: validated.meta.campaignId,
        submittedTurn: validated.meta.currentTurn,
        payload: {
          actionId: responseAction.actionId,
          targets: [{ kind: "actor", actorId: "actor_turn_test" }],
          terms: [],
        },
      },
      expectedRevision: validated.meta.revision,
      expectedVersions: validated.versions,
    };

    const optional = simulateStrategicCommand(
      {
        request: AtomicStrategicCommandRequestSchema.parse(baseRequest),
        currentState: validated,
      },
      actionOptions,
    );
    expect(optional).toMatchObject({
      status: "rejected",
      reasonCode: "DECISION_SLOTS_RESERVED",
    });

    const response = simulateStrategicCommand(
      {
        request: AtomicStrategicCommandRequestSchema.parse({
          ...baseRequest,
          mandatoryResponseAttentionItemId: attentionItemId,
        }),
        currentState: validated,
      },
      actionOptions,
    );
    expect(response.status).toBe("committed");
    if (response.status !== "committed") throw new Error("response rejected");
    expect(response.nextState.meta.decisionsRemaining).toBe(0);
    expect(response.nextState.attention.items[attentionItemId]).toMatchObject({
      resolved: true,
      resolvedTurn: 1,
    });

    const endResult = simulateEndTurn({
      request: endTurnRequest(response.nextState),
      currentState: response.nextState,
    });
    expect(endResult.status).toBe("committed");
    if (endResult.status !== "committed") throw new Error("turn rejected");
    expect(endResult.nextState.meta).toMatchObject({
      currentTurn: 2,
      decisionsRemaining: 3,
    });
  });

  it("blocks EndTurn while a mandatory response is unresolved", () => {
    const state = campaignState();
    const attentionItemId = AttentionItemIdSchema.parse(
      "attention_turn_test_required",
    );
    state.attention.items[attentionItemId] = blockingItem(attentionItemId, 1);
    const validated = CampaignStateSchema.parse(state);
    const before = hashCanonicalJson(validated);
    const result = simulateEndTurn({
      request: endTurnRequest(validated),
      currentState: validated,
    });

    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "BLOCKING_ATTENTION_REQUIRES_DECISION",
    });
    expect(hashCanonicalJson(validated)).toBe(before);
  });

  it("persists situations and attention and expires only a passed explicit consequence window", () => {
    const state = campaignState({ currentTurn: 3, currentDate: "2025-12-01" });
    const situationId = SituationIdSchema.parse("situation_turn_test_open");
    const attentionItemId = AttentionItemIdSchema.parse(
      "attention_turn_test_priority",
    );
    const expiredConsequenceId = ConsequenceIdSchema.parse(
      "consequence_turn_test_expire",
    );
    const futureConsequenceId = ConsequenceIdSchema.parse(
      "consequence_turn_test_future",
    );
    state.situations[situationId] = SituationStateSchema.parse({
      situationId: "situation_turn_test_open",
      situationType: "strategic_issue",
      subjectRefs: [],
      relatedWorldEventIds: [],
      openedTurn: 1,
      urgency: "priority",
      status: "open",
      blocking: false,
    });
    state.attention.items[attentionItemId] = AttentionItemSchema.parse({
      attentionItemId: "attention_turn_test_priority",
      level: "priority",
      createdTurn: 2,
      subjectRefs: [],
      reasonCode: "TEST_ONLY_PERSISTENT_ATTENTION",
      blocking: false,
      resolved: false,
    });
    state.scheduledConsequences[expiredConsequenceId] =
      ScheduledConsequenceSchema.parse({
        consequenceId: "consequence_turn_test_expire",
        sourceDecisionId: "decision_turn_test_source",
        earliestTurn: 1,
        latestTurn: 2,
        eligibilityRule: { kind: "all", rules: [] },
        effectProfileId: "effectprofile_turn_test",
        callbackTags: [],
        status: "scheduled",
      });
    state.scheduledConsequences[futureConsequenceId] =
      ScheduledConsequenceSchema.parse({
        consequenceId: "consequence_turn_test_future",
        sourceDecisionId: "decision_turn_test_source",
        earliestTurn: 5,
        latestTurn: 6,
        eligibilityRule: { kind: "all", rules: [] },
        effectProfileId: "effectprofile_turn_test",
        callbackTags: [],
        status: "scheduled",
      });
    const validated = CampaignStateSchema.parse(state);
    const result = simulateEndTurn({
      request: endTurnRequest(validated),
      currentState: validated,
    });

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("turn rejected");
    expect(result.nextState.situations).toEqual(validated.situations);
    expect(result.nextState.attention).toEqual(validated.attention);
    expect(
      result.nextState.scheduledConsequences[expiredConsequenceId]?.status,
    ).toBe("expired");
    expect(
      result.nextState.scheduledConsequences[futureConsequenceId]?.status,
    ).toBe("scheduled");
  });

  it("publishes the exact resolver order and labels initial no-op adapters", () => {
    const state = campaignState();
    const registry = createInitialTurnResolverRegistry();
    const result = simulateEndTurn(
      { request: endTurnRequest(state), currentState: state },
      registry,
    );

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("turn rejected");
    expect(result.resolverTrace.map((entry) => entry.sourceStep)).toEqual([
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8a",
      "8b",
      "8c",
      "8d",
      "8e",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
    ]);
    expect(
      result.resolverTrace.filter(
        (entry) => entry.adapterKind === "initial_no_op",
      ),
    ).toHaveLength(20);
    expect(result.resolverTrace.at(-1)?.outcome).toBe("skipped_not_final");

    const invalid = simulateEndTurn(
      { request: endTurnRequest(state), currentState: state },
      registry.slice(1),
    );
    expect(invalid).toMatchObject({
      status: "rejected",
      reasonCode: "INVALID_RESOLVER_REGISTRY",
    });

    const overCapacityRegistry = registry.map((resolver) =>
      resolver.resolverId === "attention"
        ? {
            ...resolver,
            resolve: (draft: CampaignState) => {
              for (let index = 1; index <= 4; index += 1) {
                const itemId = AttentionItemIdSchema.parse(
                  `attention_turn_test_over_capacity_${index}`,
                );
                draft.attention.items[itemId] = blockingItem(
                  itemId,
                  draft.meta.currentTurn,
                );
              }
            },
          }
        : resolver,
    );
    const overCapacity = simulateEndTurn(
      { request: endTurnRequest(state), currentState: state },
      overCapacityRegistry,
    );
    expect(overCapacity).toMatchObject({
      status: "rejected",
      reasonCode: "MANDATORY_RESPONSE_CAPACITY_EXCEEDED",
    });
    expect(state.attention.items).toEqual({});
  });

  it("durably writes before runtime replacement and preserves both on write failure", async () => {
    const initial = campaignState();
    const runtimeStore = new InMemoryCampaignRuntimeStore([initial]);
    const repository =
      new InMemoryCampaignRepository<AtomicCommandRepositoryTypes>([
        createSaveSnapshot(initial),
      ]);
    const service = new AtomicCampaignTurnService({
      coordinator: new SerialCampaignOperationCoordinator(
        new InMemoryCampaignEditLock(),
      ),
      simulation: new InProcessEndTurnDispatcher(),
      repository,
      runtimeStore,
    });

    const firstRequest = endTurnRequest(initial);
    const committed = await service.endTurn(firstRequest);
    expect(committed).toMatchObject({
      status: "committed",
      currentTurn: 2,
      currentDate: "2025-11-01",
      campaignRevision: 1,
    });
    const afterCommit = runtimeStore.load(initial.meta.campaignId);
    expect(
      (await repository.load(initial.meta.campaignId)).authoritativeState,
    ).toEqual(afterCommit);
    const duplicate = await service.endTurn(firstRequest);
    expect(duplicate).toMatchObject({
      status: "duplicate",
      idempotent: true,
      originalResolvedTurn: 1,
      campaignRevision: 1,
    });

    const beforeFailureHash = hashCanonicalJson(afterCommit);
    const beforeFailureSnapshot = await repository.load(
      initial.meta.campaignId,
    );
    repository.failNextWrite(new Error("synthetic end-turn write failure"));
    await expect(
      service.endTurn(endTurnRequest(afterCommit, "command_end_turn_failure")),
    ).rejects.toBeInstanceOf(CampaignPersistenceError);
    expect(hashCanonicalJson(runtimeStore.load(initial.meta.campaignId))).toBe(
      beforeFailureHash,
    );
    expect(await repository.load(initial.meta.campaignId)).toEqual(
      beforeFailureSnapshot,
    );
  });
});
