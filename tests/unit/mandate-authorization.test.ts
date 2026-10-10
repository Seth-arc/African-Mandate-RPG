import { describe, expect, it } from "vitest";

import {
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionDefinitionSchema,
  AssessmentIdSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  EndTurnRequestSchema,
  InstitutionIdSchema,
  MANDATE_CONTRACT_VERSION,
  MandateActionBindingSchema,
  MandateCaseIdSchema,
  TestOnlyAuthorizationProcedureEntrySchema,
  TestOnlyAuthorizationResolutionPlanSchema,
  TestOnlyImplementationProfileSchema,
  TestOnlyMandateCaseTemplateSchema,
  TestOnlyScopeNegotiationTemplateSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  type CampaignState,
  type JsonObject,
  type SubjectRef,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  createTestOnlyAuthorizationResolverRegistry,
  resolveAuthorizationPlan,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const ownerId = InstitutionIdSchema.parse("institution_test_mandate_owner");
const assessmentId = AssessmentIdSchema.parse("assessment_test_access_basis");
const fixtureAuthorityId = InstitutionIdSchema.parse(
  "institution_test_fixture_authority",
);
const auLiaisonId = InstitutionIdSchema.parse("institution_test_au_liaison");
const aesId = InstitutionIdSchema.parse("institution_test_aes_liaison");
const ecowasId = InstitutionIdSchema.parse("institution_test_ecowas_channel");
const ochaId = InstitutionIdSchema.parse("institution_test_ocha_channel");

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-mandate-v1",
  baselineVersion: "test-only-mandate-v1",
  scenarioVersion: "test-only-mandate-v1",
  contentVersion: "test-only-mandate-v1",
  balanceProfileVersion: "test-only-mandate-v1",
  methodologyVersion: "test-only-mandate-v1",
} as const;

const institution = (institutionId: typeof ownerId) => ({
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

const campaignState = (): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_mandate_test",
      scenarioId: "scenario_mandate_test",
      campaignSeed: "mandate-authorization-test-seed",
      difficultyProfileId: "difficulty_mandate_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: ownerId,
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
      [ownerId]: institution(ownerId),
      [fixtureAuthorityId]: institution(fixtureAuthorityId),
      [auLiaisonId]: institution(auLiaisonId),
      [aesId]: institution(aesId),
      [ecowasId]: institution(ecowasId),
      [ochaId]: institution(ochaId),
    },
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
    assessments: {
      [assessmentId]: {
        assessmentId,
        subject: { kind: "institution", institutionId: ownerId },
        hypothesisCode: "test_access_case_is_warranted",
        lifecycleStatus: "adopted",
        analysisStatus: "current",
        declaredConfidence: 50,
        evidenceSupportScore: 50,
        contradictionScore: 0,
        supportingEvidenceIds: [],
        contradictoryEvidenceIds: [],
        intelligenceGapIds: [],
        institutionalImplicationCodes: ["test_only_case_candidate"],
        adoptedTurn: 1,
      },
    },
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

const approvedProcedure = TestOnlyAuthorizationProcedureEntrySchema.parse({
  authorizationProcedureId: "procedure_test_fixture_authority",
  classification: "TEST_ONLY_AUTHORIZATION_PROCEDURE_ENTRY",
  availability: "approved_fixture",
  fixtureApprovalId: "approval_test_fixture_only",
  definition: {
    authorizationProcedureId: "procedure_test_fixture_authority",
    authorityInstitutionIds: [fixtureAuthorityId],
    requiredRequirements: [
      {
        kind: "institution_approval",
        institutionId: fixtureAuthorityId,
      },
    ],
    hostConsentRequired: false,
    leadTimeTurns: 0,
    permittedDomains: ["monitoring"],
  },
  requiredGrantingInstitutionIds: [fixtureAuthorityId],
});

const missingProcedure = TestOnlyAuthorizationProcedureEntrySchema.parse({
  authorizationProcedureId: "procedure_test_known_missing",
  classification: "TEST_ONLY_AUTHORIZATION_PROCEDURE_ENTRY",
  availability: "known_missing",
  blockerCode: "PRODUCTION_LEGAL_PROCEDURE_NOT_APPROVED",
});

const caseTemplate = TestOnlyMandateCaseTemplateSchema.parse({
  caseTemplateId: "case_template_test_access",
  templateVersion: "test-only-mandate-case-v1",
  classification: "TEST_ONLY_MANDATE_CASE_TEMPLATE",
  titleKey: "test.mandate.access.title",
  allowedHypothesisCodes: ["test_access_case_is_warranted"],
  authorizationProcedureId: approvedProcedure.authorizationProcedureId,
  scope: {
    territoryIds: [],
    zoneIds: [],
    permittedDomains: ["monitoring"],
    monitoringRequirementCodes: ["test_independent_reporting"],
  },
  objectiveIds: ["objective_test_access"],
  coalitionMembers: [
    {
      party: { kind: "institution", institutionId: aesId },
      stance: "support",
      supportStrength: 60,
      conditionCodes: ["test_aes_condition"],
    },
    {
      party: { kind: "institution", institutionId: ecowasId },
      stance: "resist",
      supportStrength: 20,
      conditionCodes: ["test_ecowas_condition"],
    },
  ],
  coalitionSupportStrength: 40,
  coalitionCohesion: 30,
  outstandingConditionCodes: ["test_regional_scope_condition"],
  politicalStrength: 40,
  implementationReadiness: 30,
  distortionRisk: 10,
});

const missingCaseTemplate = TestOnlyMandateCaseTemplateSchema.parse({
  ...caseTemplate,
  caseTemplateId: "case_template_test_missing_procedure",
  authorizationProcedureId: missingProcedure.authorizationProcedureId,
});

const scopeNegotiation = TestOnlyScopeNegotiationTemplateSchema.parse({
  scopeNegotiationId: "scope_test_joint_review",
  templateVersion: "test-only-scope-negotiation-v1",
  classification: "TEST_ONLY_SCOPE_NEGOTIATION_TEMPLATE",
  scope: {
    territoryIds: [],
    zoneIds: [],
    permittedDomains: ["monitoring"],
    monitoringRequirementCodes: ["test_joint_review_reporting"],
  },
  coalitionMembers: [
    {
      party: { kind: "institution", institutionId: aesId },
      stance: "conditional_support",
      supportStrength: 55,
      conditionCodes: ["test_joint_review_required"],
    },
    {
      party: { kind: "institution", institutionId: ecowasId },
      stance: "neutral",
      supportStrength: 40,
      conditionCodes: [],
    },
  ],
  coalitionSupportStrength: 50,
  coalitionCohesion: 45,
  outstandingConditionCodes: ["test_joint_review_required"],
  politicalStrength: 50,
  implementationReadiness: 40,
  distortionRisk: 35,
});

const implementationProfile = TestOnlyImplementationProfileSchema.parse({
  implementationProfileId: "implementation_profile_test_monitoring",
  profileVersion: "test-only-implementation-v1",
  classification: "TEST_ONLY_IMPLEMENTATION_PROFILE",
  baseLeadTimeTurns: 1,
  baseWorkUnits: 10,
  requiredCapacity: 10,
  milestoneDefinitions: [
    {
      milestoneId: "milestone_test_setup",
      nameKey: "test.milestone.setup",
      requiredWorkUnits: 5,
      completionEffectProfileIds: [],
    },
  ],
  riskProfileIds: ["risk_test_access_delay"],
});

const action = (
  actionId: string,
  commandType: string,
  targetKind: "assessment" | "mandate_case",
  effectProfileId: string,
  mandateRequirement: "assessment" | "coalition" | "authorization",
) =>
  ActionDefinitionSchema.parse({
    actionId,
    nameKey: `test.${actionId}.name`,
    descriptionKey: `test.${actionId}.description`,
    actionDomain: "monitoring",
    commandType,
    decisionSlotCost: 1,
    targetSchema: {
      allowedKinds: [targetKind],
      minTargets: 1,
      maxTargets: 1,
      uniqueTargets: true,
    },
    eligibilityRule: { kind: "all", rules: [] },
    mandateRequirement,
    immediateEffectProfileIds: [effectProfileId],
    consequenceProfileIds: [],
    doctrineSignal: {},
    previewPolicyId: "preview_test_mandate_known_only",
  });

const actions = [
  action(
    "action_test_open_mandate_case",
    "test_open_mandate_case",
    "assessment",
    "effectprofile_test_open_mandate_case",
    "assessment",
  ),
  action(
    "action_test_negotiate_case_scope",
    "test_negotiate_case_scope",
    "mandate_case",
    "effectprofile_test_negotiate_case_scope",
    "coalition",
  ),
  action(
    "action_test_request_authorization",
    "test_request_authorization",
    "mandate_case",
    "effectprofile_test_request_authorization",
    "coalition",
  ),
  action(
    "action_test_launch_implementation",
    "test_launch_implementation",
    "mandate_case",
    "effectprofile_test_launch_implementation",
    "authorization",
  ),
];

const actionBindings = [
  MandateActionBindingSchema.parse({
    actionId: actions[0]!.actionId,
    effectProfileId: actions[0]!.immediateEffectProfileIds[0],
    operation: "open_case",
  }),
  MandateActionBindingSchema.parse({
    actionId: actions[1]!.actionId,
    effectProfileId: actions[1]!.immediateEffectProfileIds[0],
    operation: "negotiate_scope",
  }),
  MandateActionBindingSchema.parse({
    actionId: actions[2]!.actionId,
    effectProfileId: actions[2]!.immediateEffectProfileIds[0],
    operation: "request_authorization",
  }),
  MandateActionBindingSchema.parse({
    actionId: actions[3]!.actionId,
    effectProfileId: actions[3]!.immediateEffectProfileIds[0],
    operation: "launch_implementation",
  }),
];

const mandateOptions = {
  actions,
  factRegistry: new FactRegistry([]),
  factSource: new KnownFactSource([]),
  costProfiles: [],
  structuralValidators: Object.fromEntries(
    actions.map((candidate) => [
      candidate.actionId,
      () => ({ status: "valid" as const }),
    ]),
  ),
  mandates: {
    actionBindings,
    caseTemplates: [caseTemplate, missingCaseTemplate],
    scopeNegotiations: [scopeNegotiation],
    authorizationProcedures: [approvedProcedure, missingProcedure],
    implementationProfiles: [implementationProfile],
  },
};

const submit = (
  state: CampaignState,
  actionIndex: number,
  commandId: string,
  target: SubjectRef,
  term: JsonObject,
) =>
  simulateStrategicCommand(
    {
      request: AtomicStrategicCommandRequestSchema.parse({
        contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
        command: {
          commandId,
          commandType: actions[actionIndex]!.commandType,
          campaignId: state.meta.campaignId,
          submittedTurn: state.meta.currentTurn,
          payload: {
            actionId: actions[actionIndex]!.actionId,
            targets: [target],
            terms: [term],
          },
        },
        expectedRevision: state.meta.revision,
        expectedVersions: state.versions,
      }),
      currentState: state,
    },
    mandateOptions,
  );

const expectCommitted = (
  result: ReturnType<typeof submit>,
): Extract<ReturnType<typeof submit>, { status: "committed" }> => {
  expect(result.status).toBe("committed");
  if (result.status !== "committed") throw new Error(result.status);
  return result;
};

const mandateCaseIdOf = (state: CampaignState) =>
  MandateCaseIdSchema.parse(Object.keys(state.mandateCases)[0]);

const openAndNegotiate = (
  templateId = caseTemplate.caseTemplateId,
): CampaignState => {
  const opened = expectCommitted(
    submit(
      campaignState(),
      0,
      `command_test_open_${templateId}`,
      { kind: "assessment", assessmentId },
      {
        operation: "open_case",
        assessmentId,
        caseTemplateId: templateId,
      },
    ),
  );
  const mandateCaseId = mandateCaseIdOf(opened.nextState);
  return expectCommitted(
    submit(
      opened.nextState,
      1,
      `command_test_scope_${templateId}`,
      { kind: "mandate_case", mandateCaseId },
      {
        operation: "negotiate_scope",
        mandateCaseId,
        scopeNegotiationId: scopeNegotiation.scopeNegotiationId,
      },
    ),
  ).nextState;
};

const pendingAuthorizationState = (): CampaignState => {
  const negotiated = openAndNegotiate();
  const mandateCaseId = mandateCaseIdOf(negotiated);
  return expectCommitted(
    submit(
      negotiated,
      2,
      "command_test_request_fixture_authorization",
      { kind: "mandate_case", mandateCaseId },
      {
        operation: "request_authorization",
        mandateCaseId,
        authorizationProcedureId: approvedProcedure.authorizationProcedureId,
      },
    ),
  ).nextState;
};

const resolutionPlan = (
  state: CampaignState,
  grantingInstitutionIds: (typeof ownerId)[],
) => {
  const mandateCaseId = mandateCaseIdOf(state);
  return TestOnlyAuthorizationResolutionPlanSchema.parse({
    resolutionPlanId: `resolution_test_${grantingInstitutionIds[0]}`,
    planVersion: "test-only-authorization-resolution-v1",
    classification: "TEST_ONLY_AUTHORIZATION_RESOLUTION_PLAN",
    mandateCaseId,
    resolutionTurn: state.meta.currentTurn,
    grantingInstitutionIds,
    requirementResolutions: [
      { requirementId: "requirement_01", status: "satisfied" },
    ],
    outcome: "authorized",
    legalScopeCodes: ["test_monitoring_scope"],
    restrictionCodes: [],
  });
};

describe("PB2-15 mandate case and authorization gate", () => {
  it("keeps case, authorization, and implementation distinct while tracking negotiated scope", () => {
    const initial = campaignState();
    const opened = expectCommitted(
      submit(
        initial,
        0,
        "command_test_open_case",
        { kind: "assessment", assessmentId },
        {
          operation: "open_case",
          assessmentId,
          caseTemplateId: caseTemplate.caseTemplateId,
        },
      ),
    );
    const mandateCaseId = mandateCaseIdOf(opened.nextState);
    const openedCase = opened.nextState.mandateCases[mandateCaseId]!;
    expect(opened.nextState.meta.decisionsRemaining).toBe(2);
    expect(openedCase.stage).toBe("assessment_basis");
    expect(openedCase.authorization.status).toBe("not_requested");
    expect(openedCase.implementationId).toBeUndefined();
    expect(opened.nextState.implementations).toEqual({});
    expect(openedCase.coalition.members).toEqual([
      expect.objectContaining({
        party: { kind: "institution", institutionId: aesId },
        stance: "support",
      }),
      expect.objectContaining({
        party: { kind: "institution", institutionId: ecowasId },
        stance: "resist",
      }),
    ]);

    const negotiated = expectCommitted(
      submit(
        opened.nextState,
        1,
        "command_test_negotiate_scope",
        { kind: "mandate_case", mandateCaseId },
        {
          operation: "negotiate_scope",
          mandateCaseId,
          scopeNegotiationId: scopeNegotiation.scopeNegotiationId,
        },
      ),
    );
    expect(negotiated.nextState.mandateCases[mandateCaseId]).toMatchObject({
      stage: "coalition",
      distortionRisk: 35,
      scope: {
        monitoringRequirementCodes: ["test_joint_review_reporting"],
      },
    });
    expect(
      negotiated.nextState.domainEvents.find(
        (event) => event.eventType === "mandate_scope_negotiated",
      )?.payload,
    ).toMatchObject({
      previousDistortionRisk: 10,
      nextDistortionRisk: 35,
      negotiatedScope: {
        monitoringRequirementCodes: ["test_joint_review_reporting"],
      },
    });

    const requested = expectCommitted(
      submit(
        negotiated.nextState,
        2,
        "command_test_request_authorization",
        { kind: "mandate_case", mandateCaseId },
        {
          operation: "request_authorization",
          mandateCaseId,
          authorizationProcedureId: approvedProcedure.authorizationProcedureId,
        },
      ),
    );
    expect(requested.nextState.meta.decisionsRemaining).toBe(0);
    expect(requested.nextState.mandateCases[mandateCaseId]).toMatchObject({
      stage: "authorization",
      authorization: { status: "pending" },
    });
    expect(requested.nextState.implementations).toEqual({});

    const registry = createTestOnlyAuthorizationResolverRegistry({
      procedures: [approvedProcedure],
      plans: [resolutionPlan(requested.nextState, [fixtureAuthorityId])],
    });
    const ended = simulateEndTurn(
      {
        request: EndTurnRequestSchema.parse({
          contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
          command: {
            commandId: "command_test_end_turn_authorization",
            commandType: "end_turn",
            campaignId: requested.nextState.meta.campaignId,
            submittedTurn: requested.nextState.meta.currentTurn,
            payload: {},
          },
          expectedRevision: requested.nextState.meta.revision,
          expectedVersions: requested.nextState.versions,
        }),
        currentState: requested.nextState,
      },
      registry,
    );
    expect(ended.status).toBe("committed");
    if (ended.status !== "committed") return;
    expect(ended.nextState.mandateCases[mandateCaseId]).toMatchObject({
      stage: "authorization",
      authorization: { status: "authorized", resolvedTurn: 1 },
    });
    expect(ended.nextState.implementations).toEqual({});

    const launched = expectCommitted(
      submit(
        ended.nextState,
        3,
        "command_test_launch_implementation",
        { kind: "mandate_case", mandateCaseId },
        {
          operation: "launch_implementation",
          mandateCaseId,
          implementationProfileId:
            implementationProfile.implementationProfileId,
          capacityAllocated: 10,
        },
      ),
    );
    const launchedCase = launched.nextState.mandateCases[mandateCaseId]!;
    expect(launched.nextState.meta.decisionsRemaining).toBe(2);
    expect(launchedCase.stage).toBe("implementation");
    expect(launchedCase.authorization.status).toBe("authorized");
    expect(launchedCase.implementationId).toBeDefined();
    expect(
      launched.nextState.implementations[launchedCase.implementationId!],
    ).toMatchObject({
      mandateCaseId,
      status: "preparing",
      workCompleted: 0,
      workRequired: 10,
      capacityAllocated: 10,
    });
  });

  it("rejects a known-missing legal procedure without state mutation or slot cost", () => {
    const negotiated = openAndNegotiate(missingCaseTemplate.caseTemplateId);
    const mandateCaseId = mandateCaseIdOf(negotiated);
    const before = structuredClone(negotiated);
    const result = submit(
      negotiated,
      2,
      "command_test_missing_authorization_procedure",
      { kind: "mandate_case", mandateCaseId },
      {
        operation: "request_authorization",
        mandateCaseId,
        authorizationProcedureId: missingProcedure.authorizationProcedureId,
      },
    );
    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "STRUCTURALLY_IMPOSSIBLE_TERM",
      detailCode: "AUTHORIZATION_PROCEDURE_KNOWN_MISSING",
    });
    expect(negotiated).toEqual(before);
    expect(negotiated.meta.decisionsRemaining).toBe(1);
    expect(negotiated.mandateCases[mandateCaseId]?.authorization.status).toBe(
      "not_requested",
    );
  });

  it.each([
    ["AU liaison", auLiaisonId],
    ["AES liaison", aesId],
    ["ECOWAS channel", ecowasId],
    ["OCHA channel", ochaId],
  ])("does not infer an authorization grant from %s", (_label, grantorId) => {
    const pending = pendingAuthorizationState();
    const before = structuredClone(pending);
    const result = resolveAuthorizationPlan({
      contractVersion: MANDATE_CONTRACT_VERSION,
      classification: "TEST_ONLY_AUTHORIZATION_RESOLUTION",
      currentState: pending,
      authorizationProcedures: [approvedProcedure],
      plan: resolutionPlan(pending, [grantorId]),
    });
    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "UNAUTHORIZED_GRANTOR",
      detailCode: grantorId,
    });
    expect(pending).toEqual(before);
    expect(
      pending.mandateCases[mandateCaseIdOf(pending)]?.authorization.status,
    ).toBe("pending");
  });
});
