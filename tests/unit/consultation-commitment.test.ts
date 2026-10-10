import { describe, expect, it } from "vitest";

import {
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionDefinitionSchema,
  ActorIdSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  CONSULTATION_CONTRACT_VERSION,
  ConsultationActionBindingSchema,
  CommitmentIdSchema,
  DecisionIdSchema,
  EndTurnRequestSchema,
  InstitutionIdSchema,
  PositionIdSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  TestOnlyCommitmentResolutionProfileSchema,
  TestOnlyConsultationLegalProfileSchema,
  TestOnlyConsultationResponseProfileSchema,
  type CampaignState,
  type ConsultationPackage,
  type PartyRef,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  buildConsultationKnownRiskPreview,
  createConsultationStructuralValidator,
  createTestOnlyCommitmentResolverRegistry,
  resolveConsultationCommand,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const ownerInstitutionId = InstitutionIdSchema.parse(
  "institution_test_consultation_owner",
);
const actorAcceptedId = ActorIdSchema.parse("actor_test_consultation_accepted");
const actorConditionalId = ActorIdSchema.parse(
  "actor_test_consultation_conditional",
);
const actorRejectedId = ActorIdSchema.parse("actor_test_consultation_rejected");
const acceptedPositionId = PositionIdSchema.parse(
  "position_test_consultation_accepted",
);
const conditionalPositionId = PositionIdSchema.parse(
  "position_test_consultation_conditional",
);
const rejectedPositionId = PositionIdSchema.parse(
  "position_test_consultation_rejected",
);

const acceptedParty: PartyRef = {
  kind: "actor",
  actorId: actorAcceptedId,
};
const conditionalParty: PartyRef = {
  kind: "actor",
  actorId: actorConditionalId,
};
const rejectedParty: PartyRef = {
  kind: "actor",
  actorId: actorRejectedId,
};

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-consultation-v1",
  baselineVersion: "test-only-consultation-v1",
  scenarioVersion: "test-only-consultation-v1",
  contentVersion: "test-only-consultation-v1",
  balanceProfileVersion: "test-only-consultation-v1",
  methodologyVersion: "test-only-consultation-v1",
} as const;

const institution = () => ({
  institutionId: ownerInstitutionId,
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

const actor = (actorId: typeof actorAcceptedId, positionId: string) => ({
  actorId,
  capabilities: {
    political: 50,
    coercive: 50,
    financial: 50,
    information: 50,
    implementation: 50,
  },
  activeIntent: {
    activeGoalCodes: ["test_only_consultation_goal"],
    aggressiveness: 50,
    opportunism: 50,
    compromiseWillingness: 50,
    strategyTags: ["test_only_consultation_strategy"],
  },
  issuePositionIds: [positionId],
  memoryIds: [],
  commitmentIds: [],
  redLineIds: [],
  disputeIds: [],
  fatigue: 0,
});

const campaignState = (): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_consultation_test",
      scenarioId: "scenario_consultation_test",
      campaignSeed: "consultation-commitment-test-seed",
      difficultyProfileId: "difficulty_consultation_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: ownerInstitutionId,
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
    institutions: { [ownerInstitutionId]: institution() },
    actors: {
      [actorAcceptedId]: actor(actorAcceptedId, acceptedPositionId),
      [actorConditionalId]: actor(actorConditionalId, conditionalPositionId),
      [actorRejectedId]: actor(actorRejectedId, rejectedPositionId),
    },
    relationships: {},
    positions: {
      [acceptedPositionId]: {
        positionId: acceptedPositionId,
        holder: acceptedParty,
        subject: { kind: "issue", id: "issue_test_regional_access" },
        stance: "support",
        intensity: 50,
        conditionCodes: [],
        lastChangedTurn: 1,
      },
      [conditionalPositionId]: {
        positionId: conditionalPositionId,
        holder: conditionalParty,
        subject: { kind: "issue", id: "issue_test_regional_access" },
        stance: "conditional_support",
        intensity: 50,
        conditionCodes: ["test_only_reporting_condition"],
        lastChangedTurn: 1,
      },
      [rejectedPositionId]: {
        positionId: rejectedPositionId,
        holder: rejectedParty,
        subject: { kind: "issue", id: "issue_test_regional_access" },
        stance: "resist",
        intensity: 50,
        conditionCodes: [],
        lastChangedTurn: 1,
      },
    },
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

const consultationAction = ActionDefinitionSchema.parse({
  actionId: "action_test_structured_consultation",
  nameKey: "test.consultation.name",
  descriptionKey: "test.consultation.description",
  actionDomain: "diplomacy",
  commandType: "test_structured_consultation",
  decisionSlotCost: 1,
  targetSchema: {
    allowedKinds: ["actor"],
    minTargets: 1,
    maxTargets: 1,
    uniqueTargets: true,
  },
  eligibilityRule: { kind: "all", rules: [] },
  mandateRequirement: "none",
  immediateEffectProfileIds: ["effectprofile_test_consultation"],
  consequenceProfileIds: [],
  doctrineSignal: {},
  previewPolicyId: "preview_test_consultation_known_only",
});

const legalProfile = TestOnlyConsultationLegalProfileSchema.parse({
  legalProfileId: "legal_test_consultation_v1",
  profileVersion: "test-only-consultation-legal-v1",
  classification: "TEST_ONLY_CONSULTATION_LEGAL_PROFILE",
  allowedNegotiationIds: [
    "N1_MONITORING_ACCESS",
    "N2_REGIONAL_REPRESENTATION",
    "N3_CIVILIAN_ACCESS",
  ],
  boundedAllocationRequiresAvailableImplementationCapacity: true,
  forbiddenN1Combinations: [
    {
      technicalLiaisonRole: "none",
      reportingPath: "independent",
      resourceCommitment: "bounded_test_allocation",
      detailCode: "TEST_ONLY_INCOHERENT_INDEPENDENT_PATH_WITHOUT_LIAISON",
    },
  ],
});

const responseProfile = TestOnlyConsultationResponseProfileSchema.parse({
  responseProfileId: "response_test_consultation_v1",
  profileVersion: "test-only-consultation-response-v1",
  classification: "TEST_ONLY_CONSULTATION_RESPONSE_PROFILE",
  statusByStance: {
    strong_support: "accepted",
    support: "accepted",
    conditional_support: "conditional",
    neutral: "conditional",
    resist: "rejected",
    strong_resist: "rejected",
  },
  evidence: {
    initialConfidence: 50,
    sourceReliability: 50,
    decayProfileId: "decay_test_consultation_claim_v1",
    reportSensitivity: "restricted",
    claimCodeByResponse: {
      accepted: "TEST_ONLY_COUNTERPART_ACCEPTED",
      conditional: "TEST_ONLY_COUNTERPART_CONDITIONAL",
      rejected: "TEST_ONLY_COUNTERPART_REJECTED",
    },
  },
});

const actionBinding = ConsultationActionBindingSchema.parse({
  actionId: consultationAction.actionId,
  effectProfileId: "effectprofile_test_consultation",
  legalProfileId: legalProfile.legalProfileId,
  responseProfileId: responseProfile.responseProfileId,
});

const politicalConflictRules = [
  {
    conflictRuleId: "conflict_test_exclusive_monitoring",
    profileVersion: "test-only-conflict-v1",
    classification: "TEST_ONLY_POLITICAL_CONFLICT_RULE" as const,
    existingCommitmentType: "exclusive_monitoring_role",
    proposedCommitmentType: "exclusive_monitoring_role",
    warningCode: "TEST_ONLY_OVERLAPPING_EXCLUSIVE_PROMISE",
  },
];

const commandOptions = {
  actions: [consultationAction],
  factRegistry: new FactRegistry([]),
  factSource: new KnownFactSource([]),
  costProfiles: [],
  structuralValidators: {
    [consultationAction.actionId]: createConsultationStructuralValidator([
      legalProfile,
    ]),
  },
  consultations: {
    actionBindings: [actionBinding],
    legalProfiles: [legalProfile],
    responseProfiles: [responseProfile],
    politicalConflictRules,
  },
};

const regionalPackage = (
  positionId: typeof acceptedPositionId,
  regionalChannel: "au_commission" | "aes_liaison" | "ecowas_technical",
  commitmentType: string,
): ConsultationPackage => ({
  packageSchemaVersion: 1,
  classification: "TEST_ONLY_CONSULTATION_PACKAGE",
  legalProfileId: legalProfile.legalProfileId,
  responsePositionId: positionId,
  negotiationId: "N2_REGIONAL_REPRESENTATION",
  terms: {
    regionalChannel,
    proposedPromise: "reporting_access",
  },
  commitmentOffer: {
    commitmentType,
    descriptionKey: "test.commitment.reporting_access",
    dueTurn: 2,
    fulfillmentRules: [{ kind: "all", rules: [] }],
  },
});

const commandRequest = (
  state: CampaignState,
  commandId: string,
  target: PartyRef,
  consultationPackage: unknown,
) =>
  AtomicStrategicCommandRequestSchema.parse({
    contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
    command: {
      commandId,
      commandType: consultationAction.commandType,
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {
        actionId: consultationAction.actionId,
        targets: [target],
        terms: [consultationPackage],
      },
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
  });

describe("structured consultations and commitments", () => {
  it("resolves accepted, conditional, and rejected regional interactions independently", () => {
    const initial = campaignState();
    const accepted = simulateStrategicCommand(
      {
        request: commandRequest(
          initial,
          "command_test_consultation_accepted",
          acceptedParty,
          regionalPackage(
            acceptedPositionId,
            "au_commission",
            "regional_reporting_au",
          ),
        ),
        currentState: initial,
      },
      commandOptions,
    );
    expect(accepted.status).toBe("committed");
    if (accepted.status !== "committed") return;
    expect(accepted.nextState.meta.decisionsRemaining).toBe(2);
    expect(Object.values(accepted.nextState.knowledge.evidence)).toHaveLength(
      1,
    );
    expect(Object.values(accepted.nextState.commitments)).toHaveLength(1);
    expect(Object.values(accepted.nextState.commitments)[0]).toMatchObject({
      issuer: { kind: "institution", institutionId: ownerInstitutionId },
      beneficiary: acceptedParty,
      dueTurn: 2,
      status: "active",
    });
    expect(
      accepted.nextState.domainEvents.find(
        (event) => event.eventType === "consultation_resolved",
      )?.payload["responseState"],
    ).toBe("accepted");

    const conditional = simulateStrategicCommand(
      {
        request: commandRequest(
          accepted.nextState,
          "command_test_consultation_conditional",
          conditionalParty,
          regionalPackage(
            conditionalPositionId,
            "aes_liaison",
            "regional_reporting_aes",
          ),
        ),
        currentState: accepted.nextState,
      },
      commandOptions,
    );
    expect(conditional.status).toBe("committed");
    if (conditional.status !== "committed") return;
    expect(conditional.nextState.meta.decisionsRemaining).toBe(1);
    expect(Object.values(conditional.nextState.commitments)).toHaveLength(2);
    expect(
      conditional.nextState.domainEvents
        .filter((event) => event.eventType === "consultation_resolved")
        .at(-1)?.payload["responseState"],
    ).toBe("conditional");
    expect(conditional.nextState.positions[rejectedPositionId]?.stance).toBe(
      "resist",
    );

    const rejected = simulateStrategicCommand(
      {
        request: commandRequest(
          conditional.nextState,
          "command_test_consultation_rejected",
          rejectedParty,
          regionalPackage(
            rejectedPositionId,
            "ecowas_technical",
            "regional_reporting_ecowas",
          ),
        ),
        currentState: conditional.nextState,
      },
      commandOptions,
    );
    expect(rejected.status).toBe("committed");
    if (rejected.status !== "committed") return;
    expect(rejected.nextState.meta.decisionsRemaining).toBe(0);
    expect(Object.values(rejected.nextState.knowledge.evidence)).toHaveLength(
      3,
    );
    expect(Object.values(rejected.nextState.commitments)).toHaveLength(2);
    expect(
      rejected.nextState.domainEvents
        .filter((event) => event.eventType === "consultation_resolved")
        .at(-1)?.payload["responseState"],
    ).toBe("rejected");
  });

  it("warns about a known political conflict but allows the package", () => {
    const state = campaignState();
    const existingId = CommitmentIdSchema.parse(
      "commitment_test_existing_exclusive_role",
    );
    state.commitments[existingId] = {
      commitmentId: existingId,
      issuer: { kind: "institution", institutionId: ownerInstitutionId },
      beneficiary: acceptedParty,
      createdTurn: 1,
      dueTurn: 3,
      commitmentType: "exclusive_monitoring_role",
      descriptionKey: "test.commitment.existing_exclusive_role",
      fulfillmentRules: [{ kind: "all", rules: [] }],
      status: "active",
    };
    state.institutions[ownerInstitutionId]!.activeCommitmentIds.push(
      existingId,
    );
    state.actors[actorAcceptedId]!.commitmentIds.push(existingId);
    state.knowledge.knownCommitmentIds.push(existingId);
    const proposed = regionalPackage(
      conditionalPositionId,
      "aes_liaison",
      "exclusive_monitoring_role",
    );

    expect(
      buildConsultationKnownRiskPreview(
        CampaignStateSchema.parse(state),
        proposed,
        politicalConflictRules,
      ).politicalConflictWarnings,
    ).toEqual([
      expect.objectContaining({
        existingCommitmentId: existingId,
        warningCode: "TEST_ONLY_OVERLAPPING_EXCLUSIVE_PROMISE",
      }),
    ]);

    const result = simulateStrategicCommand(
      {
        request: commandRequest(
          CampaignStateSchema.parse(state),
          "command_test_conflicting_promise",
          conditionalParty,
          proposed,
        ),
        currentState: CampaignStateSchema.parse(state),
      },
      commandOptions,
    );
    expect(result.status).toBe("committed");
    if (result.status !== "committed") return;
    expect(Object.values(result.nextState.commitments)).toHaveLength(2);
    expect(
      result.nextState.domainEvents.find(
        (event) =>
          event.eventType === "consultation_resolved" &&
          event.payload["responseState"] === "conditional",
      )?.payload["politicalConflictWarningCodes"],
    ).toEqual(["TEST_ONLY_OVERLAPPING_EXCLUSIVE_PROMISE"]);
  });

  it("rejects hard-invalid and free-form terms without consuming a slot", () => {
    const state = campaignState();
    const hardInvalid = {
      packageSchemaVersion: 1,
      classification: "TEST_ONLY_CONSULTATION_PACKAGE",
      legalProfileId: legalProfile.legalProfileId,
      responsePositionId: acceptedPositionId,
      negotiationId: "N1_MONITORING_ACCESS",
      terms: {
        technicalLiaisonRole: "none",
        reportingPath: "independent",
        resourceCommitment: "bounded_test_allocation",
      },
    };
    const rejected = simulateStrategicCommand(
      {
        request: commandRequest(
          state,
          "command_test_hard_invalid_terms",
          acceptedParty,
          hardInvalid,
        ),
        currentState: state,
      },
      commandOptions,
    );
    expect(rejected).toMatchObject({
      status: "rejected",
      reasonCode: "STRUCTURALLY_IMPOSSIBLE_TERM",
      detailCode: "TEST_ONLY_INCOHERENT_INDEPENDENT_PATH_WITHOUT_LIAISON",
    });
    expect(state.meta.decisionsRemaining).toBe(3);
    expect(state.decisions).toEqual([]);
    expect(state.knowledge.evidence).toEqual({});

    const directState = structuredClone(state);
    const directDecisionId = DecisionIdSchema.parse(
      "decision_test_direct_invalid_consultation",
    );
    directState.decisions.push({
      decisionId: directDecisionId,
      commandId: "command_test_direct_invalid_consultation",
      turn: 1,
      sequenceWithinTurn: 1,
      actionId: consultationAction.actionId,
      targets: [acceptedParty],
      assessmentIds: [],
      decisionSlotCost: 1,
      createdDomainEventIds: [],
      createdConsequenceIds: [],
      doctrineDelta: {},
    });
    expect(
      resolveConsultationCommand({
        contractVersion: CONSULTATION_CONTRACT_VERSION,
        classification: "TEST_ONLY_CONSULTATION_COMMAND",
        currentState: CampaignStateSchema.parse(directState),
        sourceDecisionId: directDecisionId,
        actionId: consultationAction.actionId,
        actionBindings: [actionBinding],
        legalProfiles: [legalProfile],
        responseProfiles: [responseProfile],
        politicalConflictRules,
        package: hardInvalid,
      }),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "HARD_INVALID_TERMS",
      detailCode: "TEST_ONLY_INCOHERENT_INDEPENDENT_PATH_WITHOUT_LIAISON",
    });

    const freeForm = structuredClone(hardInvalid) as Record<string, unknown>;
    freeForm["authoritativeFreeText"] = "agree to anything";
    const freeFormRejected = simulateStrategicCommand(
      {
        request: commandRequest(
          state,
          "command_test_free_form_terms",
          acceptedParty,
          freeForm,
        ),
        currentState: state,
      },
      commandOptions,
    );
    expect(freeFormRejected).toMatchObject({
      status: "rejected",
      reasonCode: "STRUCTURALLY_IMPOSSIBLE_TERM",
      detailCode: "CONSULTATION_PACKAGE_SCHEMA_INVALID",
    });
  });

  it("fulfills or breaches due commitments once and emits one memory callback", () => {
    const state = campaignState();
    const fulfilledId = CommitmentIdSchema.parse(
      "commitment_test_due_fulfilled",
    );
    const breachedId = CommitmentIdSchema.parse("commitment_test_due_breached");
    state.commitments[fulfilledId] = {
      commitmentId: fulfilledId,
      issuer: { kind: "institution", institutionId: ownerInstitutionId },
      beneficiary: acceptedParty,
      createdTurn: 1,
      dueTurn: 1,
      commitmentType: "test_due_fulfilled",
      descriptionKey: "test.commitment.fulfilled",
      fulfillmentRules: [{ kind: "all", rules: [] }],
      status: "active",
    };
    state.commitments[breachedId] = {
      commitmentId: breachedId,
      issuer: { kind: "institution", institutionId: ownerInstitutionId },
      beneficiary: rejectedParty,
      createdTurn: 1,
      dueTurn: 1,
      commitmentType: "test_due_breached",
      descriptionKey: "test.commitment.breached",
      fulfillmentRules: [{ kind: "all", rules: [] }],
      status: "active",
    };
    state.institutions[ownerInstitutionId]!.activeCommitmentIds.push(
      fulfilledId,
      breachedId,
    );
    state.actors[actorAcceptedId]!.commitmentIds.push(fulfilledId);
    state.actors[actorRejectedId]!.commitmentIds.push(breachedId);
    state.knowledge.knownCommitmentIds.push(fulfilledId, breachedId);
    const initial = CampaignStateSchema.parse(state);
    const profiles = [
      TestOnlyCommitmentResolutionProfileSchema.parse({
        commitmentType: "test_due_fulfilled",
        profileVersion: "test-only-commitment-resolution-v1",
        classification: "TEST_ONLY_COMMITMENT_RESOLUTION_PROFILE",
        dueOutcome: "fulfilled",
        callback: {
          owner: "beneficiary",
          memoryType: "success",
          salience: 50,
          persistenceClass: "significant",
          tags: ["commitment_test_fulfilled"],
        },
      }),
      TestOnlyCommitmentResolutionProfileSchema.parse({
        commitmentType: "test_due_breached",
        profileVersion: "test-only-commitment-resolution-v1",
        classification: "TEST_ONLY_COMMITMENT_RESOLUTION_PROFILE",
        dueOutcome: "breached",
        callback: {
          owner: "beneficiary",
          memoryType: "failure",
          salience: 50,
          persistenceClass: "significant",
          tags: ["commitment_test_breached"],
        },
      }),
    ];
    const registry = createTestOnlyCommitmentResolverRegistry({ profiles });
    const first = simulateEndTurn(
      {
        request: EndTurnRequestSchema.parse({
          contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
          command: {
            commandId: "command_test_commitment_end_turn_1",
            commandType: "end_turn",
            campaignId: initial.meta.campaignId,
            submittedTurn: 1,
            payload: {},
          },
          expectedRevision: initial.meta.revision,
          expectedVersions: initial.versions,
        }),
        currentState: initial,
      },
      registry,
    );
    expect(first.status).toBe("committed");
    if (first.status !== "committed") return;
    expect(first.nextState.commitments[fulfilledId]).toMatchObject({
      status: "fulfilled",
      resolvedTurn: 1,
    });
    expect(first.nextState.commitments[breachedId]).toMatchObject({
      status: "breached",
      resolvedTurn: 1,
    });
    expect(
      first.nextState.domainEvents.filter((event) =>
        event.eventType.startsWith("commitment_"),
      ),
    ).toHaveLength(2);
    expect(Object.values(first.nextState.memories)).toHaveLength(2);
    expect(
      first.nextState.institutions[ownerInstitutionId]?.activeCommitmentIds,
    ).toEqual([]);
    expect(
      first.resolverTrace.find((trace) => trace.resolverId === "commitments"),
    ).toMatchObject({ adapterKind: "test_only_fixture", outcome: "applied" });

    const second = simulateEndTurn(
      {
        request: EndTurnRequestSchema.parse({
          contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
          command: {
            commandId: "command_test_commitment_end_turn_2",
            commandType: "end_turn",
            campaignId: first.nextState.meta.campaignId,
            submittedTurn: 2,
            payload: {},
          },
          expectedRevision: first.nextState.meta.revision,
          expectedVersions: first.nextState.versions,
        }),
        currentState: first.nextState,
      },
      registry,
    );
    expect(second.status).toBe("committed");
    if (second.status !== "committed") return;
    expect(
      second.nextState.domainEvents.filter((event) =>
        event.eventType.startsWith("commitment_"),
      ),
    ).toHaveLength(2);
    expect(Object.values(second.nextState.memories)).toHaveLength(2);
    expect(
      second.resolverTrace.find((trace) => trace.resolverId === "commitments"),
    ).toMatchObject({ outcome: "no_change" });
  });
});
