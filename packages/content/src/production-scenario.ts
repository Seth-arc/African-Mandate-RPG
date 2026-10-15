import { ProductionScenarioConfigurationSchema } from "@african-mandate/domain";

const disclosure =
  "SIMULATED: Institutional roles, procedures, actor positions, costs, and balance values are fictional game design, not legal or historical claims.";

const institutionRoles = [
  "institution_au_commission",
  "institution_au_psc",
  "institution_government_mali",
  "institution_government_burkina_faso",
  "institution_government_niger",
  "institution_government_chad",
  "institution_government_mauritania",
  "institution_aes",
  "institution_ecowas",
].map((institutionId) => ({
  institutionId,
  modelRole: `${institutionId.replace("institution_", "").replaceAll("_", " ")} scenario role`,
  disclosure,
  historicalClaim: false as const,
}));

const hostActors = [
  ["actor_mali_focal_point", "institution_government_mali", 48, 52],
  [
    "actor_burkina_faso_focal_point",
    "institution_government_burkina_faso",
    46,
    58,
  ],
  ["actor_niger_focal_point", "institution_government_niger", 44, 61],
  ["actor_chad_focal_point", "institution_government_chad", 52, 49],
  ["actor_mauritania_focal_point", "institution_government_mauritania", 55, 43],
] as const;

const hostProcedures = hostActors.map(([, institutionId]) => ({
  procedureId: `procedure_simulated_${institutionId.replace("institution_government_", "")}_v1`,
  displayName: `SIMULATED: ${institutionId.replace("institution_government_", "").replaceAll("_", " ")} coordination procedure`,
  authorityInstitutionIds: ["institution_au_psc", institutionId],
  consultedInstitutionIds: [
    "institution_au_commission",
    "institution_aes",
    "institution_ecowas",
  ],
  requiredSteps: [
    "commission_submission",
    "regional_consultation",
    "psc_game_review",
    "affected_host_game_consent",
  ],
  leadTimeTurns: 2,
  expiryTurns: 6,
  legalClaim: false as const,
}));

export const productionScenarioConfiguration =
  ProductionScenarioConfigurationSchema.parse({
    schemaVersion: 1,
    contractVersion: "1.0.0",
    classification: "PRODUCTION_SIMULATED_INSTITUTIONAL_MODEL",
    contentVersion: "1.0.0-simulated.1",
    disclosure,
    approval: {
      decisionId: "AM-GOV-062",
      approvedBy: "Seth-arc, repository owner",
      approvedOn: "2026-10-15",
      reviewMode: "OWNER_ONLY_INDIVIDUAL_BUILD",
    },
    sourcePins: {
      "docs/AFRICAN_MANDATE_SAHEL_SCENARIO_STAGE_1_NARRATIVE_FOUNDATION_v1.md":
        "f5a935f08e1dfda8df6d9b7f0ff6aa001a80c562e356faa59a2682150de933c1",
      "docs/AFRICAN_MANDATE_SAHEL_ACTOR_INSTITUTION_REGISTRY_v0_1.md":
        "9603b1d6af04c8716b65b4cf0937f179f3bd5061a44f23f35face6c7f7b67edf",
      "docs/AFRICAN_MANDATE_DATA_AND_METHODOLOGY_SPEC_v1_1.md":
        "90f5de5f32585297747fa8cb91eaae5ad3b98b82327c4fc680df48e145a1a42c",
    },
    institutionRoles,
    actorAssumptions: [
      {
        actorId: "actor_au_commission_liaison",
        institutionId: "institution_au_commission",
        stanceModel: "pragmatic",
        cooperationBaseline: 58,
        riskTolerance: 42,
        uncertainty: { min: 35, max: 75 },
        historicalClaim: false,
      },
      {
        actorId: "actor_psc_secretariat_contact",
        institutionId: "institution_au_psc",
        stanceModel: "cautious",
        cooperationBaseline: 50,
        riskTolerance: 34,
        uncertainty: { min: 30, max: 70 },
        historicalClaim: false,
      },
      {
        actorId: "actor_aes_liaison",
        institutionId: "institution_aes",
        stanceModel: "assertive",
        cooperationBaseline: 43,
        riskTolerance: 63,
        uncertainty: { min: 20, max: 80 },
        historicalClaim: false,
      },
      {
        actorId: "actor_ecowas_liaison",
        institutionId: "institution_ecowas",
        stanceModel: "conditional",
        cooperationBaseline: 47,
        riskTolerance: 46,
        uncertainty: { min: 25, max: 75 },
        historicalClaim: false,
      },
      ...hostActors.map(
        ([actorId, institutionId, cooperationBaseline, riskTolerance]) => ({
          actorId,
          institutionId,
          stanceModel: "conditional" as const,
          cooperationBaseline,
          riskTolerance,
          uncertainty: { min: 20, max: 80 },
          historicalClaim: false as const,
        }),
      ),
    ],
    authorizationProcedures: hostProcedures,
    actionCosts: [
      {
        actionId: "action_simulated_collect_evidence",
        decisionSlotCost: 1,
        costProfile: {
          knownCostProfileId: "cost_simulated_collect_evidence_v1",
          costs: [
            {
              costType: "secretariat_capacity",
              amount: 6,
              certainty: "known",
            },
          ],
        },
        rationale:
          "Collection consumes staff capacity but preserves political capital.",
      },
      {
        actionId: "action_simulated_consult_counterpart",
        decisionSlotCost: 1,
        costProfile: {
          knownCostProfileId: "cost_simulated_consult_counterpart_v1",
          costs: [
            { costType: "political_capital", amount: 5, certainty: "known" },
            {
              costType: "secretariat_capacity",
              amount: 3,
              certainty: "known",
            },
          ],
        },
        rationale: "Consultation is cheaper than a formal simulated request.",
      },
      {
        actionId: "action_simulated_request_authorization",
        decisionSlotCost: 1,
        costProfile: {
          knownCostProfileId: "cost_simulated_request_authorization_v1",
          costs: [
            { costType: "political_capital", amount: 12, certainty: "known" },
            {
              costType: "secretariat_capacity",
              amount: 8,
              certainty: "known",
            },
          ],
        },
        rationale:
          "A formal simulated request has the highest coordination cost.",
      },
    ],
    balance: {
      balanceProfileId: "balance_simulated_owner_v1",
      version: "1.0.0-simulated.1",
      intelligence: { "simulated.confidence_decay_per_turn": 4 },
      actors: { "simulated.adaptation_strength": 8 },
      relationships: { "simulated.consultation_trust_delta": 5 },
      mandates: { "simulated.coalition_support_threshold": 60 },
      implementation: { "simulated.base_work_per_turn": 12 },
      consequences: { "simulated.commitment_breach_legitimacy_delta": -8 },
      events: { "simulated.selection_weight_cap": 100 },
      doctrine: { "simulated.modifier_scale": 10 },
      conflict: { "simulated.pressure_decay_per_turn": 2 },
      civilian: { "simulated.access_improvement_cap": 8 },
      infrastructure: { "simulated.recovery_cap": 6 },
      development: { "simulated.delivery_cap": 5 },
      attentionBudget: {
        maxInterruptiveEventsPerTurn: 2,
        maxPriorityItemsPerTurn: 4,
        maxCriticalItemsPerTurn: 2,
      },
    },
    evaluation: {
      evaluationProfileId: "evaluation_simulated_six_dimension_v1",
      version: "1.0.0-simulated.1",
      requiredTurns: 20,
      endingWeight: 0.4,
      trajectoryMeanWeight: 0.6,
      criticalThreshold: 25,
      criticalPenaltyPerTurn: 2,
      criticalPenaltyCap: 25,
      countervailingHarmWeight: 0.25,
      stableDelta: 4,
    },
    competitiveLeaderboard: {
      enabled: false,
      reasonCode: "OWNER_DISABLED_NONCOMPETITIVE_RELEASE",
    },
    sourceClaims: [],
    usesTestFixtureValues: false,
  });
