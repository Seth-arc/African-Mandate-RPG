import { describe, expect, it } from "vitest";

import {
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionIdSchema,
  ActorIdSchema,
  ActionDefinitionSchema,
  AssessmentIdSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  CollectionTaskSchema,
  CollectionTaskIdSchema,
  CollectionTaskTemplateSchema,
  DecisionIdSchema,
  EndTurnRequestSchema,
  EmittedObservationSchema,
  EvidenceRecordSchema,
  EvidenceFreshnessProfileSchema,
  EvidenceIdSchema,
  IntelligenceGapSchema,
  IntelligenceGapIdSchema,
  IntelligenceReportSchema,
  IsoDateSchema,
  KNOWLEDGE_CONTRACT_VERSION,
  KnowledgeEffectProfileSchema,
  ReportIdSchema,
  ScoreSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  ZoneIdSchema,
  type CampaignState,
  type CollectionOutcome,
  type EvidenceRecord,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  buildPlayerKnowledgeProjection,
  calculateEffectiveEvidenceConfidence,
  createTestOnlyKnowledgeResolverRegistry,
  hashCanonicalJson,
  lookupPlayerKnowledgeClaim,
  resolveIntelligenceCollection,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const gapId = IntelligenceGapIdSchema.parse("gap_knowledge_test");
const taskId = CollectionTaskIdSchema.parse("collection_knowledge_test");
const decisionId = DecisionIdSchema.parse("decision_knowledge_test_source");
const zoneId = ZoneIdSchema.parse("zone_knowledge_test");

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-knowledge-v1",
  baselineVersion: "test-only-knowledge-v1",
  scenarioVersion: "test-only-knowledge-v1",
  contentVersion: "test-only-knowledge-v1",
  balanceProfileVersion: "test-only-knowledge-v1",
  methodologyVersion: "test-only-knowledge-v1",
} as const;

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
      campaignId: "campaign_knowledge_test",
      scenarioId: "scenario_knowledge_test",
      campaignSeed: "knowledge-test-seed",
      difficultyProfileId: "difficulty_knowledge_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: "institution_knowledge_test",
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
      zones: {
        zone_knowledge_test: {
          zoneId: "zone_knowledge_test",
          statePresence: 50,
          controlContest: 50,
          localGovernanceCapacity: 50,
          tags: ["test_only"],
        },
      },
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
    institutions: {},
    actors: {},
    relationships: {},
    positions: {},
    memories: {},
    commitments: {},
    redLines: {},
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

const accessClaim = (value: boolean) => ({
  kind: "boolean" as const,
  proposition: "independent_verification_available",
  value,
});

const evidenceRecord = (
  evidenceId: string,
  value: boolean,
  overrides: Readonly<Record<string, unknown>> = {},
): EvidenceRecord =>
  EvidenceRecordSchema.parse({
    evidenceId: EvidenceIdSchema.parse(evidenceId),
    subject: { kind: "zone", zoneId },
    claim: accessClaim(value),
    sourceType: "simulation_observation",
    initialConfidence: 80,
    sourceReliability: 50,
    observedTurn: 3,
    observedDate: "2025-12-01",
    decayProfileId: "decay_knowledge_test",
    contradictionKey:
      "zone_knowledge_test:2025-12:independent_verification_available",
    provenanceRef: "TEST_ONLY:knowledge-fixture",
    reportSensitivity: "open",
    ...overrides,
  });

const emittedObservation = (
  evidenceId: string,
  value: boolean,
  overrides: Readonly<Record<string, unknown>> = {},
) => {
  const evidence = evidenceRecord(evidenceId, value, overrides);
  return EmittedObservationSchema.parse({
    observation: {
      observationId: `observation_${evidenceId}`,
      subject: evidence.subject,
      claim: evidence.claim,
      sourceChannel: "test_only_partner",
      baseReliability: evidence.sourceReliability,
      discoverability: 50,
      earliestTurn: evidence.observedTurn,
    },
    evidence,
  });
};

const dueCollectionState = (): CampaignState => {
  const state = campaignState();
  state.meta.currentTurn = 3;
  state.meta.currentDate = IsoDateSchema.parse("2025-12-01");
  state.decisions.push({
    decisionId,
    commandId: "command_knowledge_test_source",
    turn: 1,
    sequenceWithinTurn: 1,
    actionId: ActionIdSchema.parse("action_knowledge_test_collect"),
    targets: [{ kind: "zone", zoneId }],
    assessmentIds: [],
    decisionSlotCost: 1,
    createdDomainEventIds: [],
    createdConsequenceIds: [],
    doctrineDelta: {},
  });
  state.knowledge.intelligenceGaps[gapId] = IntelligenceGapSchema.parse({
    intelligenceGapId: gapId,
    subject: { kind: "zone", zoneId },
    questionCode: "access.independent_verification_possible",
    strategicImportance: 50,
    status: "tasked",
    createdTurn: 1,
  });
  state.knowledge.collectionTasks[taskId] = CollectionTaskSchema.parse({
    collectionTaskId: taskId,
    gapId,
    subject: { kind: "zone", zoneId },
    questionCode: "access.independent_verification_possible",
    collectionChannel: "partner",
    requestedTurn: 1,
    dueTurn: 3,
    expectedQuality: 50,
    status: "tasked",
    sourceDecisionId: decisionId,
  });
  return CampaignStateSchema.parse(state);
};

const requestForEndTurn = (state: CampaignState, commandId: string) =>
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

describe("player knowledge and intelligence collection", () => {
  it("SIM-01 commits a delayed task without revealing instant intelligence", () => {
    const state = campaignState();
    state.knowledge.intelligenceGaps[gapId] = {
      intelligenceGapId: gapId,
      subject: { kind: "zone", zoneId },
      questionCode: "access.independent_verification_possible",
      strategicImportance: ScoreSchema.parse(50),
      status: "open",
      createdTurn: 1,
    };
    const validated = CampaignStateSchema.parse(state);
    const action = ActionDefinitionSchema.parse({
      actionId: "action_knowledge_test_collect",
      nameKey: "test.knowledge.collect.name",
      descriptionKey: "test.knowledge.collect.description",
      actionDomain: "intelligence",
      commandType: "request_test_intelligence",
      decisionSlotCost: 1,
      targetSchema: {
        allowedKinds: ["zone"],
        minTargets: 1,
        maxTargets: 1,
        uniqueTargets: true,
      },
      eligibilityRule: { kind: "all", rules: [] },
      mandateRequirement: "none",
      immediateEffectProfileIds: ["effectprofile_knowledge_test_collect"],
      consequenceProfileIds: [],
      doctrineSignal: {},
      previewPolicyId: "preview_knowledge_test",
    });
    const effectProfile = KnowledgeEffectProfileSchema.parse({
      effectProfileId: "effectprofile_knowledge_test_collect",
      effects: [
        {
          effectId: "effect_knowledge_test_create_task",
          kind: "create_collection_task",
          collectionTemplateId: "collection_template_knowledge_test",
        },
      ],
    });
    const template = CollectionTaskTemplateSchema.parse({
      collectionTemplateId: "collection_template_knowledge_test",
      classification: "TEST_ONLY_COLLECTION_TEMPLATE",
      gapId,
      subject: { kind: "zone", zoneId },
      questionCode: "access.independent_verification_possible",
      collectionChannel: "partner",
      delayTurns: 1,
      expectedQuality: 50,
    });
    const result = simulateStrategicCommand(
      {
        request: AtomicStrategicCommandRequestSchema.parse({
          contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
          command: {
            commandId: "command_knowledge_test_collect",
            commandType: action.commandType,
            campaignId: validated.meta.campaignId,
            submittedTurn: 1,
            payload: {
              actionId: action.actionId,
              targets: [{ kind: "zone", zoneId }],
              terms: [],
            },
          },
          expectedRevision: 0,
          expectedVersions: validated.versions,
        }),
        currentState: validated,
      },
      {
        actions: [action],
        factRegistry: new FactRegistry([]),
        factSource: new KnownFactSource([]),
        costProfiles: [],
        structuralValidators: {
          [action.actionId]: () => ({ status: "valid" }),
        },
        knowledgeEffectProfiles: [effectProfile],
        collectionTaskTemplates: [template],
      },
    );

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("command rejected");
    const task = Object.values(result.nextState.knowledge.collectionTasks)[0];
    expect(result.nextState.meta.decisionsRemaining).toBe(2);
    expect(task).toMatchObject({
      requestedTurn: 1,
      dueTurn: 2,
      status: "tasked",
      gapId,
    });
    expect(result.nextState.knowledge.evidence).toEqual({});

    const plan = {
      collectionTaskId: task!.collectionTaskId,
      outcome: "useful" as const,
      emittedObservations: [
        emittedObservation("evidence_knowledge_test_due", true, {
          observedTurn: 2,
          observedDate: "2025-11-01",
        }),
      ],
    };
    const registry = createTestOnlyKnowledgeResolverRegistry({ plans: [plan] });
    const firstTurn = simulateEndTurn(
      {
        request: requestForEndTurn(
          result.nextState,
          "command_knowledge_test_end_turn_1",
        ),
        currentState: result.nextState,
      },
      registry,
    );
    expect(firstTurn.status).toBe("committed");
    if (firstTurn.status !== "committed") throw new Error("turn rejected");
    expect(firstTurn.nextState.knowledge.evidence).toEqual({});

    const secondTurn = simulateEndTurn(
      {
        request: requestForEndTurn(
          firstTurn.nextState,
          "command_knowledge_test_end_turn_2",
        ),
        currentState: firstTurn.nextState,
      },
      registry,
    );
    expect(secondTurn.status).toBe("committed");
    if (secondTurn.status !== "committed") throw new Error("turn rejected");
    expect(Object.keys(secondTurn.nextState.knowledge.evidence)).toEqual([
      "evidence_knowledge_test_due",
    ]);
    expect(
      secondTurn.resolverTrace.find(
        (trace) => trace.resolverId === "intelligence_collection",
      ),
    ).toMatchObject({
      sourceStep: "12",
      adapterKind: "test_only_fixture",
      outcome: "applied",
    });
  });

  it("maps every declared collection outcome to bounded task and gap state", () => {
    const cases: readonly {
      outcome: CollectionOutcome;
      observations: ReturnType<typeof emittedObservation>[];
      taskStatus: string;
      gapStatus: string;
      revisedDueTurn?: number;
    }[] = [
      {
        outcome: "useful",
        observations: [emittedObservation("evidence_outcome_useful", true)],
        taskStatus: "completed",
        gapStatus: "resolved",
      },
      {
        outcome: "partial",
        observations: [emittedObservation("evidence_outcome_partial", true)],
        taskStatus: "completed",
        gapStatus: "partially_resolved",
      },
      {
        outcome: "contested",
        observations: [
          emittedObservation("evidence_outcome_contested_yes", true),
          emittedObservation("evidence_outcome_contested_no", false),
        ],
        taskStatus: "completed",
        gapStatus: "partially_resolved",
      },
      {
        outcome: "inconclusive",
        observations: [],
        taskStatus: "completed",
        gapStatus: "open",
      },
      {
        outcome: "delayed",
        observations: [],
        taskStatus: "collecting",
        gapStatus: "tasked",
        revisedDueTurn: 4,
      },
      {
        outcome: "failed",
        observations: [],
        taskStatus: "failed",
        gapStatus: "open",
      },
    ];

    for (const fixture of cases) {
      const state = dueCollectionState();
      const before = hashCanonicalJson(state);
      const result = resolveIntelligenceCollection({
        contractVersion: KNOWLEDGE_CONTRACT_VERSION,
        classification: "TEST_ONLY_COLLECTION_RESOLUTION",
        currentState: state,
        plan: {
          collectionTaskId: taskId,
          outcome: fixture.outcome,
          emittedObservations: fixture.observations,
          ...(fixture.revisedDueTurn === undefined
            ? {}
            : { revisedDueTurn: fixture.revisedDueTurn }),
        },
      });
      expect(result.status, fixture.outcome).toBe("resolved");
      if (result.status !== "resolved") throw new Error("resolution rejected");
      expect(result.trace).toMatchObject({
        outcome: fixture.outcome,
        taskStatus: fixture.taskStatus,
        gapStatus: fixture.gapStatus,
      });
      expect(hashCanonicalJson(state)).toBe(before);
    }
  });

  it("rejects early, mismatched, and duplicate observations atomically", () => {
    const early = dueCollectionState();
    early.meta.currentTurn = 2;
    early.meta.currentDate = IsoDateSchema.parse("2025-11-01");
    const earlyState = CampaignStateSchema.parse(early);
    const earlyHash = hashCanonicalJson(earlyState);
    expect(
      resolveIntelligenceCollection({
        contractVersion: KNOWLEDGE_CONTRACT_VERSION,
        classification: "TEST_ONLY_COLLECTION_RESOLUTION",
        currentState: earlyState,
        plan: {
          collectionTaskId: taskId,
          outcome: "useful",
          emittedObservations: [
            emittedObservation("evidence_early_rejected", true, {
              observedTurn: 2,
              observedDate: "2025-11-01",
            }),
          ],
        },
      }),
    ).toEqual({ status: "rejected", reasonCode: "TASK_NOT_DUE" });
    expect(hashCanonicalJson(earlyState)).toBe(earlyHash);

    const mismatchState = dueCollectionState();
    const mismatched = emittedObservation("evidence_mismatch_rejected", true);
    const mismatchHash = hashCanonicalJson(mismatchState);
    expect(
      resolveIntelligenceCollection({
        contractVersion: KNOWLEDGE_CONTRACT_VERSION,
        classification: "TEST_ONLY_COLLECTION_RESOLUTION",
        currentState: mismatchState,
        plan: {
          collectionTaskId: taskId,
          outcome: "useful",
          emittedObservations: [
            {
              observation: {
                ...mismatched.observation,
                claim: accessClaim(false),
              },
              evidence: mismatched.evidence,
            },
          ],
        },
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "OBSERVATION_EVIDENCE_MISMATCH",
    });
    expect(hashCanonicalJson(mismatchState)).toBe(mismatchHash);

    const duplicate = emittedObservation("evidence_duplicate_rejected", true);
    const duplicateState = dueCollectionState();
    duplicateState.knowledge.evidence[duplicate.evidence.evidenceId] =
      duplicate.evidence;
    const validatedDuplicateState = CampaignStateSchema.parse(duplicateState);
    const duplicateHash = hashCanonicalJson(validatedDuplicateState);
    expect(
      resolveIntelligenceCollection({
        contractVersion: KNOWLEDGE_CONTRACT_VERSION,
        classification: "TEST_ONLY_COLLECTION_RESOLUTION",
        currentState: validatedDuplicateState,
        plan: {
          collectionTaskId: taskId,
          outcome: "useful",
          emittedObservations: [duplicate],
        },
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "DUPLICATE_EVIDENCE",
    });
    expect(hashCanonicalJson(validatedDuplicateState)).toBe(duplicateHash);
  });

  it("SIM-14 contests only incompatible same-scope assertions", () => {
    const state = campaignState();
    const sameScopeYes = evidenceRecord("evidence_contradiction_yes", true);
    const sameScopeNo = evidenceRecord("evidence_contradiction_no", false);
    const otherScope = evidenceRecord(
      "evidence_contradiction_other_scope",
      false,
      {
        subject: {
          kind: "zone",
          zoneId: ZoneIdSchema.parse("zone_knowledge_other"),
        },
      },
    );
    state.knowledge.evidence[sameScopeYes.evidenceId] = sameScopeYes;
    state.knowledge.evidence[sameScopeNo.evidenceId] = sameScopeNo;
    state.knowledge.evidence[otherScope.evidenceId] = otherScope;

    const projection = buildPlayerKnowledgeProjection(
      CampaignStateSchema.parse(state),
    );
    expect(Object.values(projection.knowledge.evidence)).toHaveLength(3);
    expect(projection.contradictions).toEqual([
      {
        contradictionKey:
          "zone_knowledge_test:2025-12:independent_verification_available",
        evidenceIds: [
          "evidence_contradiction_no",
          "evidence_contradiction_yes",
        ],
      },
    ]);
  });

  it("recalculates freshness deterministically and never substitutes missing with zero", () => {
    const evidence = evidenceRecord("evidence_freshness_test", true, {
      observedTurn: 1,
      observedDate: "2025-10-01",
    });
    const profile = EvidenceFreshnessProfileSchema.parse({
      decayProfileId: "decay_knowledge_test",
      profileVersion: "test-only-freshness-v1",
      classification: "TEST_ONLY_FRESHNESS_PROFILE",
      factors: [
        { ageTurns: 0, freshness: 100 },
        { ageTurns: 2, freshness: 60 },
      ],
    });
    const input = {
      contractVersion: KNOWLEDGE_CONTRACT_VERSION,
      evidence,
      currentTurn: 3,
      freshnessProfile: profile,
      corroborationModifier: 100,
      accessCollectionQualityModifier: 100,
    };
    expect(calculateEffectiveEvidenceConfidence(input)).toEqual(
      calculateEffectiveEvidenceConfidence(input),
    );
    expect(calculateEffectiveEvidenceConfidence(input)).toMatchObject({
      status: "calculated",
      effectiveConfidence: 24,
      freshness: 60,
      ageTurns: 2,
      profileVersion: "test-only-freshness-v1",
    });
    expect(
      calculateEffectiveEvidenceConfidence({ ...input, currentTurn: 2 }),
    ).toEqual({
      status: "unavailable",
      reasonCode: "FRESHNESS_FACTOR_NOT_DEFINED",
    });

    const state = campaignState();
    expect(
      lookupPlayerKnowledgeClaim(
        state,
        { kind: "zone", zoneId },
        "scalar:unobserved_metric:",
      ),
    ).toEqual({ status: "missing", reasonCode: "NO_PLAYER_EVIDENCE" });
    state.knowledge.evidence[EvidenceIdSchema.parse("evidence_known_zero")] = {
      ...evidence,
      evidenceId: EvidenceIdSchema.parse("evidence_known_zero"),
      claim: { kind: "scalar", metric: "unobserved_metric", value: 0 },
    };
    expect(
      lookupPlayerKnowledgeClaim(
        CampaignStateSchema.parse(state),
        { kind: "zone", zoneId },
        "scalar:unobserved_metric:",
      ),
    ).toEqual({ status: "known", evidenceIds: ["evidence_known_zero"] });
  });

  it("SIM-06 projects only player knowledge under hidden-state differentials", () => {
    const left = campaignState();
    const right = structuredClone(left);
    right.world.externalEnvironment.externalPowerCompetition =
      ScoreSchema.parse(99);
    right.world.zones[zoneId]!.controlContest = ScoreSchema.parse(1);
    right.actors[ActorIdSchema.parse("actor_hidden_test")] = {
      actorId: ActorIdSchema.parse("actor_hidden_test"),
      capabilities: {
        political: ScoreSchema.parse(1),
        coercive: ScoreSchema.parse(99),
        financial: ScoreSchema.parse(1),
        information: ScoreSchema.parse(99),
        implementation: ScoreSchema.parse(1),
      },
      activeIntent: {
        activeGoalCodes: ["hidden_test_goal"],
        aggressiveness: ScoreSchema.parse(99),
        opportunism: ScoreSchema.parse(99),
        compromiseWillingness: ScoreSchema.parse(1),
        strategyTags: ["hidden_test_strategy"],
      },
      issuePositionIds: [],
      memoryIds: [],
      commitmentIds: [],
      redLineIds: [],
      disputeIds: [],
      fatigue: ScoreSchema.parse(99),
    };

    expect(buildPlayerKnowledgeProjection(left)).toEqual(
      buildPlayerKnowledgeProjection(CampaignStateSchema.parse(right)),
    );

    const delivered = evidenceRecord("evidence_projection_delivered", true, {
      observedTurn: 1,
      observedDate: "2025-10-01",
    });
    right.knowledge.evidence[delivered.evidenceId] = delivered;
    expect(buildPlayerKnowledgeProjection(left)).not.toEqual(
      buildPlayerKnowledgeProjection(CampaignStateSchema.parse(right)),
    );
  });

  it("keeps reports typed and rejects unresolved campaign references", () => {
    const assessmentId = AssessmentIdSchema.parse("assessment_knowledge_test");
    const report = {
      reportId: "report_knowledge_test",
      createdTurn: 1,
      evidenceIds: ["evidence_knowledge_missing"],
      headlineKey: "test.knowledge.report.headline",
      urgency: "routine",
      sensitivity: "open",
      relatedAssessmentIds: [assessmentId],
    };
    expect(IntelligenceReportSchema.safeParse(report).success).toBe(true);
    const state = campaignState();
    state.knowledge.reports[ReportIdSchema.parse("report_knowledge_test")] =
      IntelligenceReportSchema.parse(report);
    expect(CampaignStateSchema.safeParse(state).success).toBe(false);
    state.knowledge.evidence[
      EvidenceIdSchema.parse("evidence_knowledge_missing")
    ] = evidenceRecord("evidence_knowledge_missing", true, {
      observedTurn: 1,
      observedDate: "2025-10-01",
    });
    expect(CampaignStateSchema.safeParse(state).success).toBe(false);
    state.assessments[assessmentId] = {};
    expect(CampaignStateSchema.safeParse(state).success).toBe(true);
  });
});
