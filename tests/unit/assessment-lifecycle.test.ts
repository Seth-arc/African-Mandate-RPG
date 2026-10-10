import { describe, expect, it } from "vitest";

import {
  ASSESSMENT_CONTRACT_VERSION,
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionDefinitionSchema,
  ActionIdSchema,
  AssessmentActionBindingSchema,
  AssessmentCommandTermSchema,
  AssessmentConfidenceBandProfileSchema,
  AssessmentMetadataProfileSchema,
  AssessmentSelectionSchema,
  AtomicStrategicCommandRequestSchema,
  AuthoredAssessmentHypothesisSchema,
  CampaignStateSchema,
  EndTurnRequestSchema,
  EvidenceIdSchema,
  EvidenceRecordSchema,
  InstitutionIdSchema,
  IntelligenceGapIdSchema,
  IntelligenceGapSchema,
  IntelligenceReportSchema,
  ReportIdSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  ZoneIdSchema,
  type ActionDefinition,
  type AssessmentCommandTerm,
  type AssessmentId,
  type CampaignState,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  buildAssessmentWorkspace,
  createTestOnlyAssessmentResolverRegistry,
  hashCanonicalJson,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";

const zoneId = ZoneIdSchema.parse("zone_assessment_test");
const institutionId = InstitutionIdSchema.parse(
  "institution_assessment_test_envoy",
);
const gapId = IntelligenceGapIdSchema.parse("gap_assessment_test_access");
const supportingEvidenceId = EvidenceIdSchema.parse(
  "evidence_assessment_test_access_yes",
);
const contradictoryEvidenceId = EvidenceIdSchema.parse(
  "evidence_assessment_test_access_no",
);
const contradictionKey =
  "zone_assessment_test:turn_1:independent_verification_available";

const versions = {
  gameSchemaVersion: 1,
  simulationModelVersion: "test-only-assessment-v1",
  baselineVersion: "test-only-assessment-v1",
  scenarioVersion: "test-only-assessment-v1",
  contentVersion: "test-only-assessment-v1",
  balanceProfileVersion: "test-only-assessment-v1",
  methodologyVersion: "test-only-assessment-v1",
} as const;

const confidenceProfile = AssessmentConfidenceBandProfileSchema.parse({
  profileVersion: "test-only-assessment-confidence-v1",
  classification: "TEST_ONLY_ASSESSMENT_CONFIDENCE_PROFILE",
  values: { low: 20, moderate: 50, high: 80 },
});

const metadataProfile = AssessmentMetadataProfileSchema.parse({
  profileVersion: "test-only-assessment-metadata-v1",
  classification: "TEST_ONLY_ASSESSMENT_METADATA_PROFILE",
  supportScores: [
    { count: 0, score: 0 },
    { count: 1, score: 40 },
    { count: 2, score: 70 },
  ],
  contradictionScores: [
    { count: 0, score: 0 },
    { count: 2, score: 60 },
  ],
});

const primaryHypothesis = AuthoredAssessmentHypothesisSchema.parse({
  hypothesisCode: "hypothesis_test_access_feasible",
  definitionVersion: "test-only-assessment-hypothesis-v1",
  classification: "TEST_ONLY_AUTHORED_HYPOTHESIS",
  subject: { kind: "zone", zoneId },
  relevantEvidenceIds: [supportingEvidenceId, contradictoryEvidenceId],
  relevantContradictionKeys: [contradictionKey],
  intelligenceGapIds: [gapId],
  institutionalImplicationCodes: ["test_only_access_case_defensible"],
});

const revisedHypothesis = AuthoredAssessmentHypothesisSchema.parse({
  ...primaryHypothesis,
  hypothesisCode: "hypothesis_test_access_uncertain",
  institutionalImplicationCodes: ["test_only_collect_before_escalation"],
});

const evidence = (
  evidenceId: typeof supportingEvidenceId,
  value: boolean,
  initialConfidence: number,
) =>
  EvidenceRecordSchema.parse({
    evidenceId,
    subject: { kind: "zone", zoneId },
    claim: {
      kind: "boolean",
      proposition: "independent_verification_available",
      value,
    },
    sourceType: "simulation_observation",
    initialConfidence,
    sourceReliability: 50,
    observedTurn: 1,
    observedDate: "2025-10-01",
    decayProfileId: "decay_assessment_test",
    contradictionKey,
    provenanceRef: "TEST_ONLY:assessment-lifecycle",
    reportSensitivity: "open",
  });

const campaignState = (includeContradiction = true): CampaignState => {
  const supporting = evidence(supportingEvidenceId, true, 5);
  const contradictory = evidence(contradictoryEvidenceId, false, 95);
  return CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_assessment_test",
      scenarioId: "scenario_assessment_test",
      campaignSeed: "assessment-lifecycle-test-seed",
      difficultyProfileId: "difficulty_assessment_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: institutionId,
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
      [institutionId]: {
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
      },
    },
    actors: {},
    relationships: {},
    positions: {},
    memories: {},
    commitments: {},
    redLines: {},
    disputes: {},
    knowledge: {
      evidence: {
        [supporting.evidenceId]: supporting,
        ...(includeContradiction
          ? { [contradictory.evidenceId]: contradictory }
          : {}),
      },
      reports: {},
      intelligenceGaps: {
        [gapId]: IntelligenceGapSchema.parse({
          intelligenceGapId: gapId,
          subject: { kind: "zone", zoneId },
          questionCode: "test.access.verification",
          strategicImportance: 50,
          status: "open",
          createdTurn: 1,
        }),
      },
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
};

const action = (
  actionId: string,
  commandType: string,
  operation: "adopt" | "revise" | "withdraw",
  effectProfileId: string,
): ActionDefinition =>
  ActionDefinitionSchema.parse({
    actionId: ActionIdSchema.parse(actionId),
    nameKey: `test.assessment.${operation}.name`,
    descriptionKey: `test.assessment.${operation}.description`,
    actionDomain: "intelligence",
    commandType,
    decisionSlotCost: 1,
    targetSchema: {
      allowedKinds: operation === "adopt" ? ["zone"] : ["assessment"],
      minTargets: 1,
      maxTargets: 1,
      uniqueTargets: true,
    },
    eligibilityRule: { kind: "all", rules: [] },
    mandateRequirement: "none",
    immediateEffectProfileIds: [effectProfileId],
    consequenceProfileIds: [],
    doctrineSignal: {},
    previewPolicyId: `preview_test_assessment_${operation}`,
  });

const adoptAction = action(
  "action_test_assessment_adopt",
  "assessment_adopt",
  "adopt",
  "effectprofile_test_assessment_adopt",
);
const reviseAction = action(
  "action_test_assessment_revise",
  "assessment_revise",
  "revise",
  "effectprofile_test_assessment_revise",
);
const withdrawAction = action(
  "action_test_assessment_withdraw",
  "assessment_withdraw",
  "withdraw",
  "effectprofile_test_assessment_withdraw",
);
const actions = [adoptAction, reviseAction, withdrawAction];
const bindings = [
  AssessmentActionBindingSchema.parse({
    actionId: adoptAction.actionId,
    effectProfileId: "effectprofile_test_assessment_adopt",
    operation: "adopt",
  }),
  AssessmentActionBindingSchema.parse({
    actionId: reviseAction.actionId,
    effectProfileId: "effectprofile_test_assessment_revise",
    operation: "revise",
  }),
  AssessmentActionBindingSchema.parse({
    actionId: withdrawAction.actionId,
    effectProfileId: "effectprofile_test_assessment_withdraw",
    operation: "withdraw",
  }),
];

const dispatcherOptions = {
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
  assessments: {
    actionBindings: bindings,
    hypotheses: [primaryHypothesis, revisedHypothesis],
    confidenceProfile,
    metadataProfile,
  },
};

const commandRequest = (
  state: CampaignState,
  commandId: string,
  selectedAction: ActionDefinition,
  term: AssessmentCommandTerm,
  targetAssessmentId?: AssessmentId,
) =>
  AtomicStrategicCommandRequestSchema.parse({
    contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
    command: {
      commandId,
      commandType: selectedAction.commandType,
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {
        actionId: selectedAction.actionId,
        targets:
          targetAssessmentId === undefined
            ? [{ kind: "zone", zoneId }]
            : [{ kind: "assessment", assessmentId: targetAssessmentId }],
        terms: [term],
      },
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
  });

const highSelectionValue = AssessmentSelectionSchema.parse({
  hypothesisCode: primaryHypothesis.hypothesisCode,
  declaredConfidenceBand: "high",
  supportingEvidenceIds: [supportingEvidenceId],
});

const highSelection = AssessmentCommandTermSchema.parse({
  operation: "adopt",
  selection: highSelectionValue,
});

const commit = (
  state: CampaignState,
  commandId: string,
  selectedAction: ActionDefinition,
  term: AssessmentCommandTerm,
  targetAssessmentId?: AssessmentId,
) =>
  simulateStrategicCommand(
    {
      request: commandRequest(
        state,
        commandId,
        selectedAction,
        term,
        targetAssessmentId,
      ),
      currentState: state,
    },
    dispatcherOptions,
  );

describe("structured assessment lifecycle", () => {
  it("automatically displays every known relevant contradiction", () => {
    const state = campaignState();
    const otherZoneId = ZoneIdSchema.parse("zone_assessment_test_other");
    const otherYes = EvidenceRecordSchema.parse({
      ...state.knowledge.evidence[supportingEvidenceId]!,
      evidenceId: "evidence_assessment_test_other_yes",
      subject: { kind: "zone", zoneId: otherZoneId },
    });
    const otherNo = EvidenceRecordSchema.parse({
      ...state.knowledge.evidence[contradictoryEvidenceId]!,
      evidenceId: "evidence_assessment_test_other_no",
      subject: { kind: "zone", zoneId: otherZoneId },
    });
    state.knowledge.evidence[otherYes.evidenceId] = otherYes;
    state.knowledge.evidence[otherNo.evidenceId] = otherNo;
    const before = hashCanonicalJson(state);
    const result = buildAssessmentWorkspace({
      contractVersion: ASSESSMENT_CONTRACT_VERSION,
      classification: "TEST_ONLY_ASSESSMENT_WORKSPACE",
      currentState: state,
      hypotheses: [primaryHypothesis],
      confidenceProfile,
      metadataProfile,
      selection: highSelectionValue,
    });
    expect(result.status).toBe("ready");
    if (result.status !== "ready") throw new Error("workspace rejected");
    expect(result.workspace.supportingEvidenceIds).toEqual([
      supportingEvidenceId,
    ]);
    expect(result.workspace.contradictoryEvidenceIds).toEqual([
      contradictoryEvidenceId,
      supportingEvidenceId,
    ]);
    expect(result.workspace.analysisStatus).toBe("contested");
    expect(hashCanonicalJson(state)).toBe(before);

    expect(
      AssessmentCommandTermSchema.safeParse({
        ...highSelection,
        authoritativeFreeText: "Treat this prose as the hypothesis",
      }).success,
    ).toBe(false);
  });

  it("permits accountable high confidence and adoption costs exactly one slot", () => {
    const initial = campaignState();
    const before = hashCanonicalJson(initial);
    const missingRegistry = simulateStrategicCommand(
      {
        request: commandRequest(
          initial,
          "command_test_assessment_missing_registry",
          adoptAction,
          highSelection,
        ),
        currentState: initial,
      },
      {
        actions: dispatcherOptions.actions,
        factRegistry: dispatcherOptions.factRegistry,
        factSource: dispatcherOptions.factSource,
        costProfiles: dispatcherOptions.costProfiles,
        structuralValidators: dispatcherOptions.structuralValidators,
      },
    );
    expect(missingRegistry).toMatchObject({
      status: "rejected",
      reasonCode: "UNSUPPORTED_IMMEDIATE_EFFECT_PROFILE",
    });
    expect(hashCanonicalJson(initial)).toBe(before);

    const result = commit(
      initial,
      "command_test_assessment_adopt_high",
      adoptAction,
      highSelection,
    );
    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("adoption rejected");
    expect(result.nextState.meta.decisionsRemaining).toBe(2);
    expect(result.decisionRecord.decisionSlotCost).toBe(1);
    expect(result.decisionRecord.assessmentIds).toHaveLength(1);
    const assessmentId = result.decisionRecord.assessmentIds[0]!;
    expect(result.nextState.assessments[assessmentId]).toMatchObject({
      lifecycleStatus: "adopted",
      hypothesisCode: primaryHypothesis.hypothesisCode,
      declaredConfidence: 80,
      supportingEvidenceIds: [supportingEvidenceId],
      contradictoryEvidenceIds: [contradictoryEvidenceId, supportingEvidenceId],
    });
    expect(
      result.nextState.knowledge.evidence[supportingEvidenceId]
        ?.initialConfidence,
    ).toBe(5);
    expect(
      result.nextState.knowledge.evidence[contradictoryEvidenceId]
        ?.initialConfidence,
    ).toBe(95);
  });

  it("later reporting updates metadata without rewriting the adopted conclusion", () => {
    const initial = campaignState(false);
    const adopted = commit(
      initial,
      "command_test_assessment_before_report",
      adoptAction,
      highSelection,
    );
    expect(adopted.status).toBe("committed");
    if (adopted.status !== "committed") throw new Error("adoption rejected");
    const assessmentId = adopted.decisionRecord.assessmentIds[0]!;
    const assessmentBefore = adopted.nextState.assessments[assessmentId]!;

    const withReport = structuredClone(adopted.nextState);
    const contradiction = evidence(contradictoryEvidenceId, false, 95);
    withReport.knowledge.evidence[contradiction.evidenceId] = contradiction;
    const reportId = ReportIdSchema.parse("report_assessment_test_later");
    withReport.knowledge.reports[reportId] = IntelligenceReportSchema.parse({
      reportId,
      createdTurn: 1,
      evidenceIds: [contradiction.evidenceId],
      headlineKey: "test.assessment.later-report",
      urgency: "developing",
      sensitivity: "open",
      relatedAssessmentIds: [assessmentId],
    });
    const validated = CampaignStateSchema.parse(withReport);
    const registry = createTestOnlyAssessmentResolverRegistry({
      hypotheses: [primaryHypothesis, revisedHypothesis],
      metadataProfile,
    });
    const endTurn = simulateEndTurn(
      {
        request: EndTurnRequestSchema.parse({
          contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
          command: {
            commandId: "command_test_assessment_end_turn",
            commandType: "end_turn",
            campaignId: validated.meta.campaignId,
            submittedTurn: validated.meta.currentTurn,
            payload: {},
          },
          expectedRevision: validated.meta.revision,
          expectedVersions: validated.versions,
        }),
        currentState: validated,
      },
      registry,
    );
    expect(endTurn.status).toBe("committed");
    if (endTurn.status !== "committed") throw new Error("end turn rejected");
    const assessmentAfter = endTurn.nextState.assessments[assessmentId]!;
    expect(assessmentAfter.hypothesisCode).toBe(
      assessmentBefore.hypothesisCode,
    );
    expect(assessmentAfter.declaredConfidence).toBe(
      assessmentBefore.declaredConfidence,
    );
    expect(assessmentAfter.lifecycleStatus).toBe("adopted");
    expect(assessmentAfter.supportingEvidenceIds).toEqual([
      supportingEvidenceId,
    ]);
    expect(assessmentAfter.analysisStatus).toBe("contested");
    expect(assessmentAfter.contradictoryEvidenceIds).toEqual([
      contradictoryEvidenceId,
      supportingEvidenceId,
    ]);
    expect(
      endTurn.resolverTrace.find(
        (trace) => trace.resolverId === "assessment_metadata",
      ),
    ).toMatchObject({
      sourceStep: "13",
      adapterKind: "test_only_fixture",
      outcome: "applied",
    });
  });

  it("revises and withdraws only through one-slot consequential commands", () => {
    const adopted = commit(
      campaignState(),
      "command_test_assessment_adopt_for_revision",
      adoptAction,
      highSelection,
    );
    expect(adopted.status).toBe("committed");
    if (adopted.status !== "committed") throw new Error("adoption rejected");
    const adoptedId = adopted.decisionRecord.assessmentIds[0]!;
    const revisionTerm = AssessmentCommandTermSchema.parse({
      operation: "revise",
      previousAssessmentId: adoptedId,
      selection: {
        hypothesisCode: revisedHypothesis.hypothesisCode,
        declaredConfidenceBand: "low",
        supportingEvidenceIds: [supportingEvidenceId],
      },
    });
    const revised = commit(
      adopted.nextState,
      "command_test_assessment_revise",
      reviseAction,
      revisionTerm,
      adoptedId,
    );
    expect(revised.status).toBe("committed");
    if (revised.status !== "committed") throw new Error("revision rejected");
    expect(revised.nextState.meta.decisionsRemaining).toBe(1);
    expect(revised.nextState.assessments[adoptedId]!.lifecycleStatus).toBe(
      "superseded",
    );
    const revisedId = revised.decisionRecord.assessmentIds[0]!;
    expect(revised.nextState.assessments[revisedId]).toMatchObject({
      lifecycleStatus: "revised",
      revisedFromAssessmentId: adoptedId,
      hypothesisCode: revisedHypothesis.hypothesisCode,
      declaredConfidence: 20,
    });

    const withdrawal = commit(
      revised.nextState,
      "command_test_assessment_withdraw",
      withdrawAction,
      AssessmentCommandTermSchema.parse({
        operation: "withdraw",
        assessmentId: revisedId,
      }),
      revisedId,
    );
    expect(withdrawal.status).toBe("committed");
    if (withdrawal.status !== "committed") {
      throw new Error("withdrawal rejected");
    }
    expect(withdrawal.nextState.meta.decisionsRemaining).toBe(0);
    expect(withdrawal.decisionRecord.decisionSlotCost).toBe(1);
    expect(withdrawal.nextState.assessments[revisedId]!.lifecycleStatus).toBe(
      "withdrawn",
    );
  });
});
