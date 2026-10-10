import {
  FourMonthTestContentArtifactSchema,
  FOUR_MONTH_CONTENT_CLASSIFICATION,
  FOUR_MONTH_CONTENT_CONTRACT_VERSION,
  FOUR_MONTH_CONTENT_VERSION,
  type FourMonthTestContentArtifact,
} from "./four-month-content.js";

const sourcePins = {
  package1ActorRegistry:
    "9603b1d6af04c8716b65b4cf0937f179f3bd5061a44f23f35face6c7f7b67edf",
  package2ContentContracts:
    "5506fa98613d7a460c5056b6ee7782ee3b16718c71080f04e3dca499d4a5943b",
  package2OpeningDocuments:
    "32e091c3727ace217332f93ba32c98a15a5ec688d3ac8a69c431ed399bf33855",
  package2OpeningIntelligence:
    "f2cf00126ea8caadcc2afca0d96521a381f0f704b40c697ef45fdcdbb61fe8d1",
  package3BriefingsReactionDeck:
    "44130a5e8282163e4763f7bac2ca20724aab0599b4beecd66631d51b030674c4",
  package3FourMonthGameplay:
    "f1d75b55815e82914c4d9318a2aa56fe2bfd7f785851f93624cbc93ce8b77742",
  package3ImplementationQa:
    "e7ed55efd11262257d30a6a377a0387421e94dd9c3162bdca1850f83214b4fdb",
  package4Readiness:
    "0ecdab17be272d3e9c04b7065c7ec72f5049ecee898194161de5523a25cc3ab3",
  package4Validation:
    "41c97fac25ee55fa51092fe48a0532d175e0e0c864888287cbd654809bbdade8",
} as const;

const rules = {
  rule_test_only_known_capacity: {
    ruleId: "rule_test_only_known_capacity",
    ruleVersion: "test-only-rules-v1",
    classification: "TEST_ONLY_KNOWLEDGE_RULE",
    expression: {
      kind: "predicate",
      query: { fact: "player.secretariat_capacity" },
      operator: "gt",
      value: 0,
      unknownPolicy: "propagate",
    },
  },
  rule_test_only_assessment_exists: {
    ruleId: "rule_test_only_assessment_exists",
    ruleVersion: "test-only-rules-v1",
    classification: "TEST_ONLY_KNOWLEDGE_RULE",
    expression: {
      kind: "predicate",
      query: {
        fact: "assessment.declared_confidence",
        subject: { kind: "command_target", targetIndex: 0 },
      },
      operator: "exists",
      unknownPolicy: "propagate",
    },
  },
  rule_test_only_case_known: {
    ruleId: "rule_test_only_case_known",
    ruleVersion: "test-only-rules-v1",
    classification: "TEST_ONLY_KNOWLEDGE_RULE",
    expression: {
      kind: "predicate",
      query: {
        fact: "mandate.coalition_support",
        subject: { kind: "command_target", targetIndex: 0 },
      },
      operator: "exists",
      unknownPolicy: "propagate",
    },
  },
} as const;

const effectProfileIdFor = (actionId: string): string =>
  `effectprofile_${actionId.slice("action_".length)}`;

type ExecutableActionFamily =
  "collection" | "consultation" | "assessment" | "mandate";

interface ExecutableActionSpecBase {
  readonly actionId: string;
  readonly sourceMonth: 1 | 2 | 3 | 4;
  readonly family: ExecutableActionFamily;
  readonly status?: undefined;
  readonly ruleId: keyof typeof rules;
  readonly actionDomain:
    | "intelligence"
    | "diplomacy"
    | "humanitarian"
    | "monitoring"
    | "infrastructure";
  readonly commandType: string;
  readonly targetKind: "zone" | "actor" | "assessment" | "mandate_case";
  readonly mandateRequirement: "none" | "assessment" | "coalition";
}

interface CollectionActionSpec extends ExecutableActionSpecBase {
  readonly family: "collection";
}

interface ConsultationActionSpec extends ExecutableActionSpecBase {
  readonly family: "consultation";
}

interface AssessmentActionSpec extends ExecutableActionSpecBase {
  readonly family: "assessment";
  readonly assessmentOperation: "adopt" | "revise";
}

interface MandateActionSpec extends ExecutableActionSpecBase {
  readonly family: "mandate";
  readonly mandateOperation: "open_case" | "negotiate_scope";
}

type ExecutableActionSpec =
  | CollectionActionSpec
  | ConsultationActionSpec
  | AssessmentActionSpec
  | MandateActionSpec;

interface BlockedActionSpec {
  readonly actionId: string;
  readonly sourceMonth: 1 | 2 | 3 | 4;
  readonly family: "consultation" | "authorization" | "strategic_response";
  readonly status: "blocked_unimplemented_canonical_system";
  readonly blockerSystemId: string;
  readonly blockerReasonCode: string;
}

type ActionSpec = ExecutableActionSpec | BlockedActionSpec;

const actionSpecs: readonly ActionSpec[] = [
  {
    actionId: "action_m01_task_access_verification",
    sourceMonth: 1,
    family: "collection",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "intelligence",
    commandType: "request_test_intelligence",
    targetKind: "zone",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m01_consult_mali_access",
    sourceMonth: 1,
    family: "consultation",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "diplomacy",
    commandType: "test_structured_consultation",
    targetKind: "actor",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m01_task_civilian_route",
    sourceMonth: 1,
    family: "collection",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "intelligence",
    commandType: "request_test_intelligence",
    targetKind: "zone",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m01_request_asset_validation",
    sourceMonth: 1,
    family: "collection",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "intelligence",
    commandType: "request_test_intelligence",
    targetKind: "zone",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m01_consult_au_commission",
    sourceMonth: 1,
    family: "consultation",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "diplomacy",
    commandType: "test_structured_consultation",
    targetKind: "actor",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m01_adopt_access_assessment",
    sourceMonth: 1,
    family: "assessment",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "intelligence",
    commandType: "assessment_adopt",
    targetKind: "zone",
    mandateRequirement: "none",
    assessmentOperation: "adopt",
  },
  {
    actionId: "action_m02_consult_civic_channel",
    sourceMonth: 2,
    family: "consultation",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "diplomacy",
    commandType: "test_structured_consultation",
    targetKind: "actor",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m02_open_access_case",
    sourceMonth: 2,
    family: "mandate",
    ruleId: "rule_test_only_assessment_exists",
    actionDomain: "monitoring",
    commandType: "test_open_mandate_case",
    targetKind: "assessment",
    mandateRequirement: "assessment",
    mandateOperation: "open_case",
  },
  {
    actionId: "action_m02_consult_aes_liaison",
    sourceMonth: 2,
    family: "consultation",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "diplomacy",
    commandType: "test_structured_consultation",
    targetKind: "actor",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m02_consult_ocha",
    sourceMonth: 2,
    family: "consultation",
    ruleId: "rule_test_only_known_capacity",
    actionDomain: "humanitarian",
    commandType: "test_structured_consultation",
    targetKind: "actor",
    mandateRequirement: "none",
  },
  {
    actionId: "action_m03_negotiate_monitoring_terms",
    sourceMonth: 3,
    family: "consultation",
    ruleId: "rule_test_only_case_known",
    actionDomain: "diplomacy",
    commandType: "test_structured_consultation",
    targetKind: "actor",
    mandateRequirement: "coalition",
  },
  {
    actionId: "action_m03_open_civilian_case",
    sourceMonth: 3,
    family: "mandate",
    ruleId: "rule_test_only_assessment_exists",
    actionDomain: "humanitarian",
    commandType: "test_open_mandate_case",
    targetKind: "assessment",
    mandateRequirement: "assessment",
    mandateOperation: "open_case",
  },
  {
    actionId: "action_m03_open_corridor_case",
    sourceMonth: 3,
    family: "mandate",
    ruleId: "rule_test_only_assessment_exists",
    actionDomain: "infrastructure",
    commandType: "test_open_mandate_case",
    targetKind: "assessment",
    mandateRequirement: "assessment",
    mandateOperation: "open_case",
  },
  {
    actionId: "action_m03_consult_afdb",
    sourceMonth: 3,
    family: "consultation",
    status: "blocked_unimplemented_canonical_system",
    blockerSystemId: "system_production_finance_terms",
    blockerReasonCode: "NO_CANONICAL_EXACT_AFDB_TERM_PACKAGE",
  },
  {
    actionId: "action_m04_revise_assessment",
    sourceMonth: 4,
    family: "assessment",
    ruleId: "rule_test_only_assessment_exists",
    actionDomain: "intelligence",
    commandType: "assessment_revise",
    targetKind: "assessment",
    mandateRequirement: "none",
    assessmentOperation: "revise",
  },
  {
    actionId: "action_m04_revise_case_scope",
    sourceMonth: 4,
    family: "mandate",
    ruleId: "rule_test_only_case_known",
    actionDomain: "monitoring",
    commandType: "test_negotiate_case_scope",
    targetKind: "mandate_case",
    mandateRequirement: "coalition",
    mandateOperation: "negotiate_scope",
  },
  {
    actionId: "action_m04_seek_authorization",
    sourceMonth: 4,
    family: "authorization",
    status: "blocked_unimplemented_canonical_system",
    blockerSystemId: "system_vetted_authorization_procedures",
    blockerReasonCode: "KNOWN_MISSING_APPROVED_PROCEDURE",
  },
  {
    actionId: "action_m04_reallocate_priority",
    sourceMonth: 4,
    family: "strategic_response",
    status: "blocked_unimplemented_canonical_system",
    blockerSystemId: "system_strategic_reallocation_effects",
    blockerReasonCode: "NO_CANONICAL_EXACT_REALLOCATION_EFFECT",
  },
] as const;

const isExecutableActionSpec = (
  spec: ActionSpec,
): spec is ExecutableActionSpec =>
  spec.status !== "blocked_unimplemented_canonical_system";

const executableActionSpecs = actionSpecs.filter(isExecutableActionSpec);

const isAssessmentActionSpec = (
  spec: ExecutableActionSpec,
): spec is AssessmentActionSpec => spec.family === "assessment";

const isMandateActionSpec = (
  spec: ExecutableActionSpec,
): spec is MandateActionSpec => spec.family === "mandate";

const actorDefinitions = Object.fromEntries(
  [
    [
      "actor_envoy_intelligence_lead",
      "institution_envoy_office",
      "bureaucratic",
    ],
    ["actor_envoy_legal_adviser", "institution_envoy_office", "bureaucratic"],
    ["actor_mali_focal_point", "institution_government_mali", "diplomatic"],
    [
      "actor_civic_reporting_coordinator",
      "institution_local_civic_network",
      "civil_society",
    ],
    ["actor_au_commission_liaison", "institution_au_commission", "diplomatic"],
    ["actor_aes_liaison", "institution_aes", "diplomatic"],
    ["actor_ecowas_liaison", "institution_ecowas", "diplomatic"],
    ["actor_ocha_coordinator", "institution_un_ocha", "bureaucratic"],
    ["actor_afdb_programme_officer", "institution_afdb", "bureaucratic"],
  ].map(([actorId, institutionId, actorType]) => [
    actorId,
    {
      actorId,
      institutionId,
      actorType,
      nameKey: `test.content.${actorId}.name`,
      priorityWeights: {
        test_only_mandate_integrity: 50,
        test_only_delivery_feasibility: 50,
      },
      riskTolerance: 50,
      memoryProfileId: `memory_profile_${actorId}_test_v1`,
      reportingProfileId: `reporting_profile_${actorId}_test_v1`,
      initialRedLineDefinitionIds: [],
    },
  ]),
);

const institution = (
  institutionId: string,
  institutionType: string,
  authorityDomains: readonly string[],
  actorIds: readonly string[] = [],
) => ({
  institutionId,
  institutionType,
  nameKey: `test.content.${institutionId}.name`,
  authorityDomains,
  actorIds,
  authorizationProcedureIds: [],
});

const institutionDefinitions = {
  institution_envoy_office: institution(
    "institution_envoy_office",
    "au",
    ["diplomacy", "intelligence", "monitoring"],
    ["actor_envoy_intelligence_lead", "actor_envoy_legal_adviser"],
  ),
  institution_au_commission: institution(
    "institution_au_commission",
    "au",
    ["diplomacy", "mediation"],
    ["actor_au_commission_liaison"],
  ),
  institution_au_psc: institution("institution_au_psc", "au", ["security"]),
  institution_government_mali: institution(
    "institution_government_mali",
    "government",
    ["diplomacy", "humanitarian", "monitoring"],
    ["actor_mali_focal_point"],
  ),
  institution_government_burkina_faso: institution(
    "institution_government_burkina_faso",
    "government",
    ["diplomacy", "humanitarian"],
  ),
  institution_government_niger: institution(
    "institution_government_niger",
    "government",
    ["diplomacy", "humanitarian"],
  ),
  institution_government_chad: institution(
    "institution_government_chad",
    "government",
    ["diplomacy", "humanitarian"],
  ),
  institution_government_mauritania: institution(
    "institution_government_mauritania",
    "government",
    ["diplomacy", "humanitarian"],
  ),
  institution_aes: institution(
    "institution_aes",
    "regional_organization",
    ["diplomacy"],
    ["actor_aes_liaison"],
  ),
  institution_ecowas: institution(
    "institution_ecowas",
    "regional_organization",
    ["diplomacy", "development"],
    ["actor_ecowas_liaison"],
  ),
  institution_un_ocha: institution(
    "institution_un_ocha",
    "multilateral",
    ["humanitarian"],
    ["actor_ocha_coordinator"],
  ),
  institution_afdb: institution(
    "institution_afdb",
    "multilateral",
    ["development", "finance", "infrastructure"],
    ["actor_afdb_programme_officer"],
  ),
  institution_local_civic_network: institution(
    "institution_local_civic_network",
    "civil_society",
    ["humanitarian", "monitoring"],
    ["actor_civic_reporting_coordinator"],
  ),
} as const;

const actionDefinitions = Object.fromEntries(
  executableActionSpecs.map((spec) => [
    spec.actionId,
    {
      actionId: spec.actionId,
      nameKey: `test.content.${spec.actionId}.name`,
      descriptionKey: `test.content.${spec.actionId}.description`,
      actionDomain: spec.actionDomain,
      commandType: spec.commandType,
      decisionSlotCost: 1,
      targetSchema: {
        allowedKinds: [spec.targetKind],
        minTargets: 1,
        maxTargets: 1,
        uniqueTargets: true,
      },
      eligibilityRule: rules[spec.ruleId].expression,
      mandateRequirement: spec.mandateRequirement,
      immediateEffectProfileIds: [effectProfileIdFor(spec.actionId)],
      consequenceProfileIds: [],
      doctrineSignal: {},
      previewPolicyId: "preview_test_only_player_knowledge_v1",
    },
  ]),
);

const effectProfiles = Object.fromEntries(
  executableActionSpecs.map((spec) => [
    effectProfileIdFor(spec.actionId),
    {
      effectProfileId: effectProfileIdFor(spec.actionId),
      effects: [],
    },
  ]),
);

const territories = [
  ["territory_ml", "institution_government_mali"],
  ["territory_bf", "institution_government_burkina_faso"],
  ["territory_ne", "institution_government_niger"],
  ["territory_td", "institution_government_chad"],
  ["territory_mr", "institution_government_mauritania"],
] as const;

const collectionSpecs = [
  {
    actionId: "action_m01_task_access_verification",
    gapId: "gap_m01_monitoring_verification",
    questionCode: "access.independent_verification_possible",
    channel: "partner",
  },
  {
    actionId: "action_m01_task_civilian_route",
    gapId: "gap_m01_civilian_access",
    questionCode: "humanitarian.access_status",
    channel: "diplomatic",
  },
  {
    actionId: "action_m01_request_asset_validation",
    gapId: "gap_m01_asset_status",
    questionCode: "asset.operational_asof_2025_09_26",
    channel: "technical",
  },
] as const;

const consultationSpecs = [
  {
    actionId: "action_m01_consult_mali_access",
    actorId: "actor_mali_focal_point",
    negotiationId: "N1_MONITORING_ACCESS",
    positionId: "position_test_mali_monitoring_access",
  },
  {
    actionId: "action_m01_consult_au_commission",
    actorId: "actor_au_commission_liaison",
    negotiationId: "N2_REGIONAL_REPRESENTATION",
    positionId: "position_test_au_scope",
  },
  {
    actionId: "action_m02_consult_civic_channel",
    actorId: "actor_civic_reporting_coordinator",
    negotiationId: "N1_MONITORING_ACCESS",
    positionId: "position_test_civic_monitoring_access",
  },
  {
    actionId: "action_m02_consult_aes_liaison",
    actorId: "actor_aes_liaison",
    negotiationId: "N2_REGIONAL_REPRESENTATION",
    positionId: "position_test_aes_scope",
  },
  {
    actionId: "action_m02_consult_ocha",
    actorId: "actor_ocha_coordinator",
    negotiationId: "N3_CIVILIAN_ACCESS",
    positionId: "position_test_ocha_civilian_access",
  },
  {
    actionId: "action_m03_negotiate_monitoring_terms",
    actorId: "actor_mali_focal_point",
    negotiationId: "N1_MONITORING_ACCESS",
    positionId: "position_test_mali_monitoring_access",
  },
] as const;

const consultationPackageFor = (spec: (typeof consultationSpecs)[number]) => {
  const base = {
    packageSchemaVersion: 1,
    classification: "TEST_ONLY_CONSULTATION_PACKAGE",
    legalProfileId: "legal_test_only_consultation_v1",
    responsePositionId: spec.positionId,
  } as const;
  if (spec.negotiationId === "N1_MONITORING_ACCESS") {
    return {
      ...base,
      negotiationId: spec.negotiationId,
      terms: {
        technicalLiaisonRole: "limited",
        reportingPath: "joint_review",
        resourceCommitment: "none",
      },
    };
  }
  if (spec.negotiationId === "N2_REGIONAL_REPRESENTATION") {
    return {
      ...base,
      negotiationId: spec.negotiationId,
      terms: {
        regionalChannel: spec.actorId.includes("aes")
          ? "aes_liaison"
          : "au_commission",
        proposedPromise: "scope_review",
      },
    };
  }
  return {
    ...base,
    negotiationId: "N3_CIVILIAN_ACCESS",
    terms: {
      priority: "independent_access_verification",
      implementationBandwidthTradeoffAcknowledged: true,
    },
  };
};

const positions = [
  [
    "position_test_mali_monitoring_access",
    "actor_mali_focal_point",
    "conditional_support",
    "issue_monitoring_access",
  ],
  [
    "position_test_au_scope",
    "actor_au_commission_liaison",
    "support",
    "issue_interinstitutional_scope",
  ],
  [
    "position_test_civic_monitoring_access",
    "actor_civic_reporting_coordinator",
    "support",
    "issue_monitoring_access",
  ],
  [
    "position_test_aes_scope",
    "actor_aes_liaison",
    "conditional_support",
    "issue_interinstitutional_scope",
  ],
  [
    "position_test_ocha_civilian_access",
    "actor_ocha_coordinator",
    "support",
    "issue_civilian_access",
  ],
] as const;

const actorRuntimeInitializations = Object.keys(actorDefinitions).map(
  (actorId) => ({
    actorId,
    capabilities: {
      political: 50,
      coercive: 0,
      financial: actorId === "actor_afdb_programme_officer" ? 50 : 0,
      information: 50,
      implementation: 40,
    },
    activeIntent: {
      activeGoalCodes: ["test_only_role_goal"],
      aggressiveness: 25,
      opportunism: 25,
      compromiseWillingness: 50,
      strategyTags: ["synthetic_test_only"],
    },
    issuePositionIds: positions
      .filter(([, holderId]) => holderId === actorId)
      .map(([positionId]) => positionId),
    memoryIds: [],
    commitmentIds: [],
    redLineIds: [],
    disputeIds: [],
    fatigue: 0,
  }),
);

const positionInitializations = positions.map(
  ([positionId, actorId, stance, issueId]) => ({
    positionId,
    holder: { kind: "actor", actorId },
    subject: { kind: "issue", id: issueId },
    stance,
    intensity: 50,
    conditionCodes: ["test_only_position_not_historical"],
    lastChangedTurn: 1,
  }),
);

const caseScope = (permittedDomains: readonly string[]) => ({
  territoryIds: ["territory_ml"],
  zoneIds: ["zone_test_issue_focus"],
  permittedDomains,
  monitoringRequirementCodes: ["test_only_source_trace_required"],
});

const caseTemplate = (
  caseTemplateId: string,
  hypothesisCode: string,
  permittedDomains: readonly string[],
) => ({
  caseTemplateId,
  templateVersion: "test-only-mandate-case-v1",
  classification: "TEST_ONLY_MANDATE_CASE_TEMPLATE",
  titleKey: `test.content.${caseTemplateId}.title`,
  allowedHypothesisCodes: [hypothesisCode],
  authorizationProcedureId: "procedure_known_missing_test_only",
  scope: caseScope(permittedDomains),
  objectiveIds: [`objective_${caseTemplateId}_test_only`],
  coalitionMembers: [],
  coalitionSupportStrength: 0,
  coalitionCohesion: 0,
  outstandingConditionCodes: ["test_only_coalition_not_formed"],
  politicalStrength: 0,
  implementationReadiness: 0,
  distortionRisk: 0,
});

const branchMonth = (
  month: 1 | 2 | 3 | 4,
  choices: readonly (string | null)[],
) => ({
  month,
  decisionSlots: choices.map((actionId, index) =>
    actionId === null
      ? {
          slot: index + 1,
          disposition: "unused_defer",
          reasonCode: "TEST_ONLY_DELIBERATE_DEFER_OR_REDIRECT",
        }
      : { slot: index + 1, disposition: "action", actionId },
  ),
});

const buildArtifact = (): unknown => ({
  schemaVersion: FOUR_MONTH_CONTENT_CONTRACT_VERSION,
  contentVersion: FOUR_MONTH_CONTENT_VERSION,
  classification: FOUR_MONTH_CONTENT_CLASSIFICATION,
  ownership: {
    package: "@african-mandate/content",
    definitionsOwner: "@african-mandate/domain",
    executionOwner: "@african-mandate/simulation",
    sourceCompilerOwner: "@african-mandate/data-pipeline",
  },
  sourcePins,
  historicalConflictCutoff: "2025-09-26",
  simulationStart: "2025-10-01",
  noncoveragePeriod: {
    startDate: "2025-09-27",
    endDate: "2025-09-30",
    interpretation: "UNKNOWN_NOT_ZERO",
  },
  actorProfile: {
    version: "test-only-actor-profile-v1",
    classification: "TEST_ONLY_SYNTHETIC_ACTOR_VALUES",
  },
  ruleDefinitions: Object.values(rules),
  scenarioBundle: {
    scenario: {
      scenarioId: "scenario_four_month_test_only_v1",
      titleKey: "test.content.four_month.title",
      baselineId: "baseline_test_only_unknown_real_observations_v1",
      startDate: "2025-10-01",
      maxTurns: 20,
      turnDuration: "calendar_month",
      decisionsPerTurn: 3,
      representedInstitutionId: "institution_envoy_office",
      territoryIds: territories.map(([territoryId]) => territoryId),
      initialInstitutionIds: Object.keys(institutionDefinitions),
      initialActorIds: Object.keys(actorDefinitions),
      difficultyProfileIds: ["difficulty_test_only_standard_v1"],
      earlyTerminationRuleIds: [],
      finalEvaluationProfileId: "evaluation_unavailable_test_only_v1",
    },
    territoryDefinitions: Object.fromEntries(
      territories.map(([territoryId, governmentInstitutionId]) => [
        territoryId,
        {
          territoryId,
          nameKey: `test.content.${territoryId}.name`,
          geometryRef: "test_only_non_spatial_country_scope",
          zoneIds:
            territoryId === "territory_ml" ? ["zone_test_issue_focus"] : [],
          governmentInstitutionId,
        },
      ]),
    ),
    zoneDefinitions: {
      zone_test_issue_focus: {
        zoneId: "zone_test_issue_focus",
        territoryId: "territory_ml",
        nameKey: "test.content.synthetic_issue_focus.name",
        geometryRef: "synthetic_test_only_no_real_boundary",
        adjacentZoneIds: [],
        tags: ["test_only", "not_a_real_boundary", "non_spatial_issue_focus"],
      },
    },
    assetDefinitions: {},
    corridorDefinitions: {},
    institutionDefinitions,
    actorDefinitions,
    actionDefinitions,
    eventDefinitions: {},
    authorizationProcedures: {},
    effectProfiles,
    doctrineProfiles: {
      doctrine_test_only_observational_v1: {
        doctrineProfileId: "doctrine_test_only_observational_v1",
        nameKey: "test.content.doctrine.observational",
        qualifyingVector: {
          prevention: 0,
          centralization: 0,
          policyOrientation: 0,
          diplomaticStyle: 0,
        },
        modifiers: [],
      },
    },
    difficultyProfiles: {
      difficulty_test_only_standard_v1: {
        difficultyProfileId: "difficulty_test_only_standard_v1",
        evidenceClarityModifier: 1,
        confidenceDecayModifier: 1,
        hiddenRedLineFrequencyModifier: 1,
        actorAdaptationStrengthModifier: 1,
        escalationSpeedModifier: 1,
        implementationToleranceModifier: 1,
        causalExplanationLevel: "standard",
      },
    },
    balance: {
      balanceProfileId: "balance_four_month_test_only_v1",
      version: "test-only-balance-v1",
      intelligence: {},
      actors: {},
      relationships: {},
      mandates: {},
      implementation: {},
      consequences: {},
      events: {},
      doctrine: {},
      conflict: {},
      civilian: {},
      infrastructure: {},
      development: {},
      attentionBudget: {
        maxInterruptiveEventsPerTurn: 1,
        maxPriorityItemsPerTurn: 2,
        maxCriticalItemsPerTurn: 1,
      },
    },
    methodology: {
      methodologyVersion: "test-only-methodology-v1",
      sections: [],
      modelVersions: {
        conflictModel: "unimplemented_test_only",
        civilianModel: "unimplemented_test_only",
        infrastructureModel: "unimplemented_test_only",
        intelligenceModel: "accepted-test-contract-v1",
        mandateModel: "accepted-test-contract-v1",
      },
    },
  },
  runtimeContracts: {
    actors: {
      runtimeInitializations: actorRuntimeInitializations,
      positionInitializations,
    },
    collection: {
      effectProfiles: collectionSpecs.map((spec) => ({
        effectProfileId: effectProfileIdFor(spec.actionId),
        effects: [
          {
            effectId: `effect_${spec.actionId.slice("action_".length)}_create_task`,
            kind: "create_collection_task",
            collectionTemplateId: `collection_template_${spec.actionId.slice("action_".length)}`,
          },
        ],
      })),
      taskTemplates: collectionSpecs.map((spec) => ({
        collectionTemplateId: `collection_template_${spec.actionId.slice("action_".length)}`,
        classification: "TEST_ONLY_COLLECTION_TEMPLATE",
        gapId: spec.gapId,
        subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
        questionCode: spec.questionCode,
        collectionChannel: spec.channel,
        delayTurns: 1,
        expectedQuality: 50,
      })),
    },
    consultation: {
      actionBindings: consultationSpecs.map((spec) => ({
        actionId: spec.actionId,
        effectProfileId: effectProfileIdFor(spec.actionId),
        legalProfileId: "legal_test_only_consultation_v1",
        responseProfileId: "response_test_only_consultation_v1",
      })),
      legalProfiles: [
        {
          legalProfileId: "legal_test_only_consultation_v1",
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
              detailCode:
                "TEST_ONLY_INCOHERENT_INDEPENDENT_PATH_WITHOUT_LIAISON",
            },
          ],
        },
      ],
      responseProfiles: [
        {
          responseProfileId: "response_test_only_consultation_v1",
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
            decayProfileId: "decay_test_only_consultation_v1",
            reportSensitivity: "restricted",
            claimCodeByResponse: {
              accepted: "TEST_ONLY_COUNTERPART_ACCEPTED",
              conditional: "TEST_ONLY_COUNTERPART_CONDITIONAL",
              rejected: "TEST_ONLY_COUNTERPART_REJECTED",
            },
          },
        },
      ],
      authoredPackages: consultationSpecs.map((spec) => ({
        actionId: spec.actionId,
        targetActorId: spec.actorId,
        package: consultationPackageFor(spec),
      })),
    },
    assessment: {
      actionBindings: executableActionSpecs
        .filter(isAssessmentActionSpec)
        .map((spec) => ({
          actionId: spec.actionId,
          effectProfileId: effectProfileIdFor(spec.actionId),
          operation: spec.assessmentOperation,
        })),
      hypotheses: [
        {
          hypothesisCode: "access_restrictions_unresolved",
          definitionVersion: "test-only-hypothesis-v1",
          classification: "TEST_ONLY_AUTHORED_HYPOTHESIS",
          subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
          relevantEvidenceIds: [
            "evidence_m01_access_gov_signal",
            "evidence_m01_access_civic_signal",
          ],
          relevantContradictionKeys: [],
          intelligenceGapIds: ["gap_m01_monitoring_verification"],
          institutionalImplicationCodes: ["TEST_ONLY_ACCESS_CASE_MAY_OPEN"],
        },
        {
          hypothesisCode: "civilian_access_unresolved",
          definitionVersion: "test-only-hypothesis-v1",
          classification: "TEST_ONLY_AUTHORED_HYPOTHESIS",
          subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
          relevantEvidenceIds: ["evidence_m01_civilian_location_gap"],
          relevantContradictionKeys: [],
          intelligenceGapIds: ["gap_m01_civilian_access"],
          institutionalImplicationCodes: ["TEST_ONLY_CIVILIAN_CASE_MAY_OPEN"],
        },
        {
          hypothesisCode: "corridor_status_unverified",
          definitionVersion: "test-only-hypothesis-v1",
          classification: "TEST_ONLY_AUTHORED_HYPOTHESIS",
          subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
          relevantEvidenceIds: ["evidence_m01_infra_2025_unknown"],
          relevantContradictionKeys: [],
          intelligenceGapIds: ["gap_m01_asset_status"],
          institutionalImplicationCodes: ["TEST_ONLY_CORRIDOR_CASE_MAY_OPEN"],
        },
      ],
      confidenceProfile: {
        profileVersion: "test-only-confidence-v1",
        classification: "TEST_ONLY_ASSESSMENT_CONFIDENCE_PROFILE",
        values: { low: 25, moderate: 50, high: 75 },
      },
      metadataProfile: {
        profileVersion: "test-only-assessment-metadata-v1",
        classification: "TEST_ONLY_ASSESSMENT_METADATA_PROFILE",
        supportScores: [
          { count: 0, score: 0 },
          { count: 1, score: 50 },
          { count: 2, score: 75 },
        ],
        contradictionScores: [
          { count: 0, score: 0 },
          { count: 1, score: 50 },
          { count: 2, score: 75 },
        ],
      },
    },
    mandate: {
      actionBindings: executableActionSpecs
        .filter(isMandateActionSpec)
        .map((spec) => ({
          actionId: spec.actionId,
          effectProfileId: effectProfileIdFor(spec.actionId),
          operation: spec.mandateOperation,
        })),
      caseTemplates: [
        caseTemplate(
          "case_template_access_monitoring_test_v1",
          "access_restrictions_unresolved",
          ["monitoring"],
        ),
        caseTemplate(
          "case_template_civilian_access_test_v1",
          "civilian_access_unresolved",
          ["humanitarian"],
        ),
        caseTemplate(
          "case_template_corridor_resilience_test_v1",
          "corridor_status_unverified",
          ["infrastructure", "development"],
        ),
      ],
      scopeNegotiations: [
        {
          scopeNegotiationId: "scope_test_monitoring_joint_review_v1",
          templateVersion: "test-only-scope-negotiation-v1",
          classification: "TEST_ONLY_SCOPE_NEGOTIATION_TEMPLATE",
          scope: caseScope(["monitoring"]),
          coalitionMembers: [],
          coalitionSupportStrength: 0,
          coalitionCohesion: 0,
          outstandingConditionCodes: ["test_only_joint_review_required"],
          politicalStrength: 25,
          implementationReadiness: 0,
          distortionRisk: 50,
        },
      ],
      authorizationProcedures: [
        {
          authorizationProcedureId: "procedure_known_missing_test_only",
          classification: "TEST_ONLY_AUTHORIZATION_PROCEDURE_ENTRY",
          availability: "known_missing",
          blockerCode: "PRODUCTION_LEGAL_PROCEDURE_NOT_APPROVED",
        },
      ],
    },
  },
  initialPlayerKnowledge: {
    evidence: {
      evidence_m01_access_gov_signal: {
        evidenceId: "evidence_m01_access_gov_signal",
        subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
        claim: {
          kind: "category",
          category: "liaison_channel",
          value: "discussion_offered_test_only",
        },
        sourceType: "actor_claim",
        sourceParty: { kind: "actor", actorId: "actor_mali_focal_point" },
        initialConfidence: 45,
        sourceReliability: 50,
        observedTurn: 1,
        observedDate: "2025-10-01",
        decayProfileId: "decay_test_only_diplomatic_v1",
        provenanceRef: "source_stream_test_mali_liaison",
        reportSensitivity: "open",
      },
      evidence_m01_access_civic_signal: {
        evidenceId: "evidence_m01_access_civic_signal",
        subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
        claim: {
          kind: "boolean",
          proposition: "independent_verification_available_test_only",
          value: false,
        },
        sourceType: "actor_claim",
        sourceParty: {
          kind: "actor",
          actorId: "actor_civic_reporting_coordinator",
        },
        initialConfidence: 45,
        sourceReliability: 50,
        observedTurn: 1,
        observedDate: "2025-10-01",
        decayProfileId: "decay_test_only_civic_v1",
        provenanceRef: "source_stream_test_civic_reporting",
        reportSensitivity: "open",
      },
      evidence_m01_civilian_location_gap: {
        evidenceId: "evidence_m01_civilian_location_gap",
        subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
        claim: {
          kind: "text_claim",
          claimCode: "TEST_ONLY_LOCATION_DATA_UNAVAILABLE",
        },
        sourceType: "simulation_observation",
        initialConfidence: 100,
        sourceReliability: 100,
        observedTurn: 1,
        observedDate: "2025-10-01",
        decayProfileId: "decay_test_only_method_gap_v1",
        provenanceRef: "source_stream_test_method_gap",
        reportSensitivity: "open",
      },
      evidence_m01_infra_2025_unknown: {
        evidenceId: "evidence_m01_infra_2025_unknown",
        subject: { kind: "zone", zoneId: "zone_test_issue_focus" },
        claim: {
          kind: "text_claim",
          claimCode: "TEST_ONLY_ASSET_STATUS_UNKNOWN",
        },
        sourceType: "simulation_observation",
        initialConfidence: 100,
        sourceReliability: 100,
        observedTurn: 1,
        observedDate: "2025-10-01",
        decayProfileId: "decay_test_only_method_gap_v1",
        provenanceRef: "source_stream_test_method_gap",
        reportSensitivity: "open",
      },
    },
    reports: {
      report_m01_reporting_variance: {
        reportId: "report_m01_reporting_variance",
        createdTurn: 1,
        evidenceIds: [
          "evidence_m01_access_gov_signal",
          "evidence_m01_access_civic_signal",
        ],
        headlineKey: "test.content.report.reporting_variance",
        bodyTemplateKey: "test.content.report.reporting_variance.body",
        urgency: "developing",
        sensitivity: "open",
        relatedAssessmentIds: [],
      },
    },
    intelligenceGaps: Object.fromEntries(
      [
        [
          "gap_m01_monitoring_verification",
          "zone",
          "access.independent_verification_possible",
          75,
        ],
        ["gap_m01_civilian_access", "zone", "humanitarian.access_status", 75],
        [
          "gap_m01_asset_status",
          "zone",
          "asset.operational_asof_2025_09_26",
          50,
        ],
        [
          "gap_m01_counterpart_position",
          "actor",
          "position.monitoring_access",
          50,
        ],
        [
          "gap_m01_institutional_procedure",
          "institution",
          "mandate.required_authority",
          75,
        ],
      ].map(([gapId, kind, questionCode, strategicImportance]) => [
        gapId,
        {
          intelligenceGapId: gapId,
          subject:
            kind === "actor"
              ? { kind, actorId: "actor_mali_focal_point" }
              : kind === "institution"
                ? { kind, institutionId: "institution_au_psc" }
                : { kind, zoneId: "zone_test_issue_focus" },
          questionCode,
          strategicImportance,
          status: "open",
          createdTurn: 1,
        },
      ]),
    ),
    collectionTasks: {},
    redLineKnowledge: {},
    positionKnowledge: {},
    knownCommitmentIds: [],
    knownDisputeIds: [],
    relationshipKnowledge: {},
  },
  authoringActionAudit: actionSpecs.map((spec) =>
    spec.status === "blocked_unimplemented_canonical_system"
      ? {
          actionId: spec.actionId,
          sourceMonth: spec.sourceMonth,
          family: spec.family,
          status: spec.status,
          blockerSystemId: spec.blockerSystemId,
          blockerReasonCode: spec.blockerReasonCode,
        }
      : {
          actionId: spec.actionId,
          sourceMonth: spec.sourceMonth,
          family: spec.family,
          status: "executable_test_only",
          ruleId: spec.ruleId,
        },
  ),
  gapAliases: [
    {
      alias: "gap_m01_civilian_route",
      canonicalId: "gap_m01_civilian_access",
      reason:
        "Package 3 uses civilian_route while Package 2 defines civilian_access; the compiled test artifact preserves the Package 2 canonical ID.",
    },
  ],
  sourceStreams: [
    {
      sourceStreamId: "source_stream_test_mali_liaison",
      classification: "TEST_ONLY_SYNTHETIC_SOURCE_STREAM",
      sourceActorId: "actor_mali_focal_point",
      supportedOutcomeKinds: ["accepted", "conditional", "rejected"],
      containsHistoricalObservations: false,
      containsRealPersonClaims: false,
    },
    {
      sourceStreamId: "source_stream_test_civic_reporting",
      classification: "TEST_ONLY_SYNTHETIC_SOURCE_STREAM",
      sourceActorId: "actor_civic_reporting_coordinator",
      supportedOutcomeKinds: [
        "useful",
        "partial",
        "contested",
        "inconclusive",
        "delayed",
        "failed",
      ],
      containsHistoricalObservations: false,
      containsRealPersonClaims: false,
    },
    {
      sourceStreamId: "source_stream_test_method_gap",
      classification: "TEST_ONLY_SYNTHETIC_SOURCE_STREAM",
      supportedOutcomeKinds: ["inconclusive", "delayed", "failed"],
      containsHistoricalObservations: false,
      containsRealPersonClaims: false,
    },
  ],
  messages: [
    {
      messageId: "message_m01_opening_test_only",
      month: 1,
      classification: "SIMULATED_TEST_ONLY_MESSAGE",
      bodyTemplate:
        "SIMULATED — Opening records are incomplete. Choose collection, consultation, assessment, or deliberate deferral without treating unknown observations as zero.",
      sourceStreamIds: [
        "source_stream_test_mali_liaison",
        "source_stream_test_civic_reporting",
        "source_stream_test_method_gap",
      ],
      knowledgeRefIds: [
        "evidence_m01_access_gov_signal",
        "evidence_m01_access_civic_signal",
        "gap_m01_monitoring_verification",
      ],
      containsHistoricalObservation: false,
    },
    {
      messageId: "message_m02_conditional_test_only",
      month: 2,
      classification: "SIMULATED_TEST_ONLY_MESSAGE",
      bodyTemplate:
        "SIMULATED — Report only emitted collection outcomes and observed consultation responses. Pending evidence remains pending.",
      sourceStreamIds: ["source_stream_test_civic_reporting"],
      knowledgeRefIds: ["gap_m01_monitoring_verification"],
      containsHistoricalObservation: false,
    },
    {
      messageId: "message_m03_paths_test_only",
      month: 3,
      classification: "SIMULATED_TEST_ONLY_MESSAGE",
      bodyTemplate:
        "SIMULATED — Assessment, coalition, and authorization remain separate. Civilian and corridor paths do not imply invented local totals or asset status.",
      sourceStreamIds: ["source_stream_test_method_gap"],
      knowledgeRefIds: ["gap_m01_civilian_access", "gap_m01_asset_status"],
      containsHistoricalObservation: false,
    },
    {
      messageId: "message_m04_commitments_test_only",
      month: 4,
      classification: "SIMULATED_TEST_ONLY_MESSAGE",
      bodyTemplate:
        "SIMULATED — Revise only from known evidence, preserve recorded commitments, and keep authorization unavailable while its procedure is unapproved.",
      sourceStreamIds: ["source_stream_test_mali_liaison"],
      knowledgeRefIds: ["gap_m01_institutional_procedure"],
      containsHistoricalObservation: false,
    },
  ],
  monthlyAvailability: [1, 2, 3, 4].map((month) => ({
    month,
    authoringActionIds: actionSpecs
      .filter((spec) => spec.sourceMonth === month)
      .map(({ actionId }) => actionId),
  })),
  branches: [
    {
      branchId: "A",
      strategy: "collect_first",
      months: [
        branchMonth(1, [
          "action_m01_task_access_verification",
          "action_m01_consult_au_commission",
          "action_m01_adopt_access_assessment",
        ]),
        branchMonth(2, [
          "action_m02_consult_civic_channel",
          "action_m02_open_access_case",
          "action_m02_consult_aes_liaison",
        ]),
        branchMonth(3, ["action_m03_negotiate_monitoring_terms", null, null]),
        branchMonth(4, [
          "action_m04_revise_assessment",
          "action_m04_revise_case_scope",
          null,
        ]),
      ],
      expectedKnownStateCodes: [
        "TEST_ONLY_COLLECTION_TASK_CREATED",
        "TEST_ONLY_ACCESS_CASE_OPTIONAL",
      ],
    },
    {
      branchId: "B",
      strategy: "consult_first",
      months: [
        branchMonth(1, [
          "action_m01_consult_mali_access",
          "action_m01_task_civilian_route",
          null,
        ]),
        branchMonth(2, [
          "action_m02_consult_ocha",
          "action_m01_adopt_access_assessment",
          null,
        ]),
        branchMonth(3, ["action_m03_open_civilian_case", null, null]),
        branchMonth(4, [
          "action_m04_revise_assessment",
          "action_m04_revise_case_scope",
          null,
        ]),
      ],
      expectedKnownStateCodes: [
        "TEST_ONLY_CIVILIAN_GAP_REMAINS_EXPLICIT",
        "TEST_ONLY_CONSULTATION_RESPONSE_OBSERVED_ONLY",
      ],
    },
    {
      branchId: "C",
      strategy: "defer_redirect",
      months: [
        branchMonth(1, ["action_m01_request_asset_validation", null, null]),
        branchMonth(2, [
          "action_m02_consult_aes_liaison",
          "action_m01_adopt_access_assessment",
          null,
        ]),
        branchMonth(3, ["action_m03_open_corridor_case", null, null]),
        branchMonth(4, ["action_m04_revise_case_scope", null, null]),
      ],
      expectedKnownStateCodes: [
        "TEST_ONLY_ASSET_STATUS_REMAINS_UNKNOWN",
        "TEST_ONLY_UNUSED_SLOTS_EXPIRE",
      ],
    },
  ],
  unimplementedCanonicalSystems: [
    {
      systemId: "system_verified_geography",
      ownerRole: "GIS/data owner",
      state: "BLOCKED",
      consequence:
        "No real administrative boundary or production map target can compile.",
    },
    {
      systemId: "system_admitted_historical_baseline",
      ownerRole: "data/licensing owner",
      state: "BLOCKED",
      consequence:
        "No historical observation, total, asset status, or source redistribution is admitted.",
    },
    {
      systemId: "system_production_actor_profiles",
      ownerRole: "scenario/regional owner",
      state: "BLOCKED",
      consequence:
        "Synthetic actor values cannot become claims about real officials or institutions.",
    },
    {
      systemId: "system_vetted_authorization_procedures",
      ownerRole: "institutional counsel",
      state: "BLOCKED",
      consequence:
        "Authorization requests remain known-disabled and cannot consume a slot.",
    },
    {
      systemId: "system_production_balance_effects",
      ownerRole: "systems/balance owner",
      state: "BLOCKED",
      consequence:
        "All numeric profiles and response mappings remain TEST_ONLY.",
    },
    {
      systemId: "system_production_finance_terms",
      ownerRole: "finance/legal/content owner",
      state: "BLOCKED",
      consequence:
        "The AfDB authoring action has no exact approved executable term package.",
    },
    {
      systemId: "system_strategic_reallocation_effects",
      ownerRole: "domain/systems owner",
      state: "BLOCKED",
      consequence:
        "The priority-reallocation action has no canonical exact effect shape.",
    },
    {
      systemId: "system_full_twenty_month_content",
      ownerRole: "scenario/content owner",
      state: "BLOCKED",
      consequence: "This artifact covers only the four-month TEST_ONLY slice.",
    },
    {
      systemId: "system_production_evaluation",
      ownerRole: "methodology owner",
      state: "BLOCKED",
      consequence:
        "Evaluation formulas, weights, snapshots, and overall scoring remain unavailable.",
    },
  ],
  productionGate: {
    publishable: false,
    result: "REJECTED_TEST_ONLY",
    blockerSystemIds: [
      "system_verified_geography",
      "system_admitted_historical_baseline",
      "system_production_actor_profiles",
      "system_vetted_authorization_procedures",
      "system_production_balance_effects",
      "system_production_finance_terms",
      "system_strategic_reallocation_effects",
      "system_full_twenty_month_content",
      "system_production_evaluation",
    ],
  },
});

export const compileFourMonthTestContent = (): FourMonthTestContentArtifact =>
  FourMonthTestContentArtifactSchema.parse(buildArtifact());
