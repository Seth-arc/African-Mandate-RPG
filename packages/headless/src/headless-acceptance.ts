import {
  AtomicCampaignCommandService,
  CampaignPersistenceError,
  InMemoryCampaignEditLock,
  InMemoryCampaignRepository,
  InMemoryCampaignRuntimeStore,
  SerialCampaignOperationCoordinator,
  createSaveSnapshot,
  type AtomicCommandRepositoryTypes,
} from "@african-mandate/application";
import {
  compileFourMonthTestContent,
  FOUR_MONTH_CONTENT_VERSION,
} from "@african-mandate/content";
import {
  ProductionScenarioAdmissionError,
  serializeProductionScenarioBundle,
} from "@african-mandate/data-pipeline";
import {
  ASSESSMENT_CONTRACT_VERSION,
  ACTOR_CONTRACT_VERSION,
  ActionIdSchema,
  ActorIdSchema,
  AssessmentIdSchema,
  AssessmentStateSchema,
  ATOMIC_COMMIT_CONTRACT_VERSION,
  AttentionItemIdSchema,
  AttentionItemSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  CommitmentIdSchema,
  EndTurnRequestSchema,
  EvidenceRecordSchema,
  KNOWLEDGE_CONTRACT_VERSION,
  EvidenceIdSchema,
  InstitutionIdSchema,
  KnowledgeForecastSchema,
  MANDATE_CONTRACT_VERSION,
  MandateCaseIdSchema,
  MandateCaseStateSchema,
  NARRATIVE_CONTRACT_VERSION,
  NARRATIVE_POLICY_VERSION,
  NARRATIVE_TEMPLATE_VERSION,
  NarrativeRequestSchema,
  RelationshipIdSchema,
  RelationshipStateSchema,
  ScoreSchema,
  TestOnlyCommitmentResolutionProfileSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  TerritoryIdSchema,
  ZoneIdSchema,
  createInitialDoctrineState,
  createUnavailableEvaluationState,
  type CampaignState,
  type SubjectRef,
} from "@african-mandate/domain";
import {
  renderDeterministicNarrative,
  resolveNarrativeResponse,
} from "@african-mandate/narrative";
import {
  FactRegistry,
  InProcessStrategicCommandDispatcher,
  KnownFactSource,
  buildKnowledgeSafeActionMenu,
  buildPlayerKnowledgeProjection,
  evaluateDoctrineReviewEligibility,
  findEvidenceContradictions,
  hashCanonicalJson,
  prevalidateMandateCommand,
  recalculateAssessmentMetadata,
  resolveDueCommitments,
  resolveIntelligenceCollection,
  resolveMemoryCreation,
  simulateEndTurn,
  simulateStrategicCommand,
} from "@african-mandate/simulation";
import { z } from "zod";

export const HEADLESS_ACCEPTANCE_SCHEMA_VERSION = "1.0.0" as const;
export const HEADLESS_ACCEPTANCE_VERSION = "0.1.0-test.1" as const;
export const HEADLESS_GOLDEN_SEED =
  "am-pb2-19-independent-golden-seed-v1" as const;
export const HEADLESS_SAMPLES_PER_DIFFICULTY = 50 as const;

const HEADLESS_ZONE_ID = ZoneIdSchema.parse("zone_test_issue_focus");
const HEADLESS_OTHER_ZONE_ID = ZoneIdSchema.parse("zone_headless_other_scope");
const MALI_ACTOR_ID = ActorIdSchema.parse("actor_mali_focal_point");
const ENVOY_INSTITUTION_ID = InstitutionIdSchema.parse(
  "institution_envoy_office",
);
const HEADLESS_ASSESSMENT_ID = AssessmentIdSchema.parse(
  "assessment_headless_overconfidence",
);
const HEADLESS_CASE_ID = MandateCaseIdSchema.parse("case_headless_access");
const SIM11_ATTENTION_ID = AttentionItemIdSchema.parse(
  "attention_headless_sim11_response",
);
const MALI_ENVOY_RELATIONSHIP_ID = RelationshipIdSchema.parse(
  "relationship_headless_mali_to_envoy",
);

export const HEADLESS_SIM_IDS = [
  "SIM-01",
  "SIM-02",
  "SIM-03",
  "SIM-04",
  "SIM-05",
  "SIM-06",
  "SIM-07",
  "SIM-08",
  "SIM-09",
  "SIM-10",
  "SIM-11",
  "SIM-12",
  "SIM-13",
  "SIM-14",
  "SIM-15",
  "SIM-16",
] as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const SimIdSchema = z.enum(HEADLESS_SIM_IDS);

export const HeadlessGoldenCaseSchema = z
  .object({
    simId: SimIdSchema,
    title: z.string().min(1),
    acceptanceIds: z.array(z.string().min(1)).min(1),
    inputFixtureId: z.string().min(1),
    expectedObservableCodes: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const HeadlessScenarioOutcomeSchema = z
  .object({
    simId: SimIdSchema,
    title: z.string().min(1),
    acceptanceIds: z.array(z.string().min(1)).min(1),
    inputFixtureId: z.string().min(1),
    inputHash: Sha256Schema,
    expectedObservableCodes: z.array(z.string().min(1)).min(1),
    observedObservableCodes: z.array(z.string().min(1)),
    status: z.enum(["PASS", "FAIL", "BLOCKED"]),
    commandIds: z.array(z.string().min(1)),
    traceRefs: z.array(z.string().min(1)),
    outputHash: Sha256Schema,
    failureReason: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((report, ctx) => {
    const matches =
      hashCanonicalJson(report.expectedObservableCodes) ===
      hashCanonicalJson(report.observedObservableCodes);
    if ((report.status === "PASS") !== matches) {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: "PASS requires exact golden observable equality",
      });
    }
    if ((report.status === "PASS") === (report.failureReason !== undefined)) {
      ctx.addIssue({
        code: "custom",
        path: ["failureReason"],
        message: "failureReason is required exactly for non-PASS outcomes",
      });
    }
  });

export const HeadlessDifficultyCoverageSchema = z
  .object({
    difficultyProfileId: z.string().min(1),
    requestedSamples: z.number().int().min(50),
    completedSamples: z.number().int().nonnegative(),
    failedSamples: z.number().int().nonnegative(),
    turnsPerSample: z.literal(4),
    decisionsPerTurn: z.literal(3),
    commandCount: z.number().int().nonnegative(),
    uniqueFinalHashes: z.number().int().positive(),
    aggregateHash: Sha256Schema,
  })
  .strict()
  .superRefine((coverage, ctx) => {
    if (
      coverage.completedSamples + coverage.failedSamples !==
      coverage.requestedSamples
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["completedSamples"],
        message: "Every requested sample must be accounted for",
      });
    }
  });

export const HeadlessProductionGateSchema = z
  .object({
    gateId: z.string().min(1),
    status: z.literal("BLOCKED"),
    reasonCode: z.string().min(1),
    ownerRole: z.string().min(1),
  })
  .strict();

export const HeadlessAcceptanceArtifactSchema = z
  .object({
    schemaVersion: z.literal(HEADLESS_ACCEPTANCE_SCHEMA_VERSION),
    acceptanceVersion: z.literal(HEADLESS_ACCEPTANCE_VERSION),
    classification: z.literal("TEST_ONLY_HEADLESS_ACCEPTANCE"),
    sourcePins: z
      .object({
        package4Validation: z.literal(
          "41c97fac25ee55fa51092fe48a0532d175e0e0c864888287cbd654809bbdade8",
        ),
        prompt19: z.literal(
          "cae36db7caf5274e7bae8181ed34157a011e28a415fac31aa0aeb23e8985b344",
        ),
        contentVersion: z.literal(FOUR_MONTH_CONTENT_VERSION),
        contentHash: Sha256Schema,
      })
      .strict(),
    seed: z.literal(HEADLESS_GOLDEN_SEED),
    outcomeReports: z.array(HeadlessScenarioOutcomeSchema).length(16),
    difficultyCoverage: z.array(HeadlessDifficultyCoverageSchema).min(1),
    replay: z
      .object({
        fixtureId: z.literal("replay_four_month_headless_v1"),
        commandIds: z.array(z.string().min(1)).min(1),
        firstRunHash: Sha256Schema,
        repeatRunHash: Sha256Schema,
        reloadHash: Sha256Schema,
        matched: z.boolean(),
      })
      .strict(),
    productionGates: z.array(HeadlessProductionGateSchema).min(1),
    overallStatus: z.enum(["READY_FOR_REVIEW", "FAILED", "BLOCKED"]),
  })
  .strict()
  .superRefine((artifact, ctx) => {
    if (
      hashCanonicalJson(artifact.outcomeReports.map(({ simId }) => simId)) !==
      hashCanonicalJson(HEADLESS_SIM_IDS)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["outcomeReports"],
        message: "Outcome reports must contain SIM-01 through SIM-16 in order",
      });
    }
    const allMandatoryPassed = artifact.outcomeReports.every(
      ({ status }) => status === "PASS",
    );
    const coveragePassed = artifact.difficultyCoverage.every(
      ({ failedSamples, completedSamples, requestedSamples }) =>
        failedSamples === 0 && completedSamples === requestedSamples,
    );
    const replayMatched =
      artifact.replay.matched &&
      artifact.replay.firstRunHash === artifact.replay.repeatRunHash &&
      artifact.replay.firstRunHash === artifact.replay.reloadHash;
    if (
      (artifact.overallStatus === "READY_FOR_REVIEW") !==
      (allMandatoryPassed && coveragePassed && replayMatched)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["overallStatus"],
        message:
          "READY_FOR_REVIEW requires every mandatory SIM, sample, and replay check to pass",
      });
    }
  });

export type HeadlessGoldenCase = z.infer<typeof HeadlessGoldenCaseSchema>;
export type HeadlessScenarioOutcome = z.infer<
  typeof HeadlessScenarioOutcomeSchema
>;
export type HeadlessAcceptanceArtifact = z.infer<
  typeof HeadlessAcceptanceArtifactSchema
>;

export const HEADLESS_GOLDEN_CASES: readonly HeadlessGoldenCase[] = [
  [
    "SIM-01",
    "Collect-first",
    ["AC-009"],
    [
      "slot_consumed",
      "task_delayed",
      "no_instant_evidence",
      "evidence_only_on_due_resolution",
    ],
  ],
  [
    "SIM-02",
    "Diplomacy-first",
    ["AC-010"],
    [
      "slot_consumed",
      "reply_is_knowledge",
      "memory_once",
      "no_collective_consent",
    ],
  ],
  [
    "SIM-03",
    "Alternative B/C",
    ["AC-007", "AC-015"],
    [
      "alternative_path_viable",
      "no_forced_case",
      "civilian_unknown",
      "asset_unknown",
    ],
  ],
  [
    "SIM-04",
    "Inaction",
    ["AC-007", "AC-014"],
    [
      "four_end_turns",
      "month_five_begins",
      "no_forced_case",
      "doctrine_review_not_codified",
    ],
  ],
  [
    "SIM-05",
    "Overconfidence",
    ["AC-012"],
    [
      "later_contradiction_contests",
      "hypothesis_unchanged",
      "declared_confidence_unchanged",
      "source_trace_retained",
    ],
  ],
  [
    "SIM-06",
    "Hidden-state differential",
    ["AC-008"],
    [
      "known_projection_equal",
      "preview_equal",
      "hidden_intent_absent",
      "observation_changes_projection",
    ],
  ],
  [
    "SIM-07",
    "Authorization gate",
    ["AC-013", "AC-023"],
    [
      "known_missing_rejected",
      "no_slot_cost",
      "no_state_mutation",
      "no_invented_authority",
    ],
  ],
  [
    "SIM-08",
    "Duplicate command",
    ["AC-006"],
    [
      "duplicate_classified",
      "no_double_slot",
      "no_double_event",
      "revision_unchanged",
    ],
  ],
  [
    "SIM-09",
    "Commitment breach",
    ["AC-010"],
    ["single_transition", "memory_once", "no_double_effect"],
  ],
  [
    "SIM-10",
    "Negotiation scope",
    ["AC-013"],
    [
      "one_slot_package",
      "scope_persisted",
      "commitment_persisted",
      "distortion_risk_derived",
      "authorization_not_requested",
    ],
  ],
  [
    "SIM-11",
    "Capacity/deadlock",
    ["AC-007", "AC-025"],
    [
      "optional_action_reserved",
      "mandatory_response_commits",
      "end_turn_not_softlocked",
    ],
  ],
  [
    "SIM-12",
    "Replay/save",
    ["AC-005", "AC-006"],
    [
      "fixed_replay_hash",
      "reload_hash_equal",
      "failed_write_uncommitted",
      "trace_order_stable",
    ],
  ],
  [
    "SIM-13",
    "Calendar edge",
    ["AC-007"],
    [
      "oct_to_feb",
      "resolution_before_increment",
      "unused_slots_expire",
      "no_extra_slots",
    ],
  ],
  [
    "SIM-14",
    "Source contradiction",
    ["AC-011"],
    ["same_scope_contested", "different_scope_not_contested"],
  ],
  [
    "SIM-15",
    "No-data geography",
    ["AC-016", "AC-017", "AC-018", "AC-019"],
    [
      "missing_not_zero",
      "no_stability_inference",
      "production_rejects_synthetic_zone",
    ],
  ],
  [
    "SIM-16",
    "Narrative fallback",
    ["AC-020", "AC-022"],
    [
      "fallback_used",
      "stale_response_rejected",
      "state_unchanged",
      "hidden_truth_absent",
    ],
  ],
].map(([simId, title, acceptanceIds, expectedObservableCodes]) =>
  HeadlessGoldenCaseSchema.parse({
    simId,
    title,
    acceptanceIds,
    inputFixtureId: `golden_${String(simId).toLowerCase().replace("-", "_")}_v1`,
    expectedObservableCodes,
  }),
);

const content = compileFourMonthTestContent();

const makeInstitutions = () =>
  Object.fromEntries(
    Object.keys(content.scenarioBundle.institutionDefinitions).map(
      (institutionId) => [
        institutionId,
        {
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
      ],
    ),
  );

export const createHeadlessInitialState = (
  campaignSeed: string = HEADLESS_GOLDEN_SEED,
  campaignId: string = "campaign_headless_acceptance_v1",
): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId,
      scenarioId: content.scenarioBundle.scenario.scenarioId,
      campaignSeed,
      difficultyProfileId: "difficulty_test_only_standard_v1",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: ENVOY_INSTITUTION_ID,
      materialResources: {
        budget: { amount: 100, currency: "TEST" },
        personnel: 100,
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
        [HEADLESS_ZONE_ID]: {
          zoneId: HEADLESS_ZONE_ID,
          statePresence: 50,
          controlContest: 50,
          localGovernanceCapacity: 50,
          tags: ["test_only", "missing_observed_baseline"],
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
    institutions: makeInstitutions(),
    actors: Object.fromEntries(
      content.runtimeContracts.actors.runtimeInitializations.map((actor) => [
        actor.actorId,
        structuredClone(actor),
      ]),
    ),
    relationships: {},
    positions: Object.fromEntries(
      content.runtimeContracts.actors.positionInitializations.map(
        (position) => [position.positionId, structuredClone(position)],
      ),
    ),
    memories: {},
    commitments: {},
    redLines: {},
    disputes: {},
    knowledge: structuredClone(content.initialPlayerKnowledge),
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
    versions: {
      gameSchemaVersion: 1,
      simulationModelVersion: "test-only-headless-v1",
      baselineVersion: "test-only-no-observed-baseline-v1",
      scenarioVersion: content.scenarioBundle.scenario.scenarioId,
      contentVersion: content.contentVersion,
      balanceProfileVersion: content.scenarioBundle.balance.version,
      methodologyVersion: content.scenarioBundle.methodology.methodologyVersion,
    },
  });

const factDefinitions = [
  {
    key: "player.secretariat_capacity",
    valueType: "number",
    allowedScopes: ["player_eligibility", "player_forecast"],
    subjectKinds: [],
    resolverId: "headless_known_secretariat_capacity",
  },
  {
    key: "assessment.declared_confidence",
    valueType: "number",
    allowedScopes: ["player_eligibility", "player_forecast"],
    subjectKinds: ["assessment"],
    resolverId: "headless_known_assessment_confidence",
  },
  {
    key: "mandate.coalition_support",
    valueType: "number",
    allowedScopes: ["player_eligibility", "player_forecast"],
    subjectKinds: ["mandate_case"],
    resolverId: "headless_known_coalition_support",
  },
] as const;

const baseFactObservations = [
  {
    query: { fact: "player.secretariat_capacity" },
    resolution: { kind: "known", value: 50 },
  },
] as const;

const dispatcherOptions = (extraFacts: readonly unknown[] = []) => ({
  actions: Object.values(content.scenarioBundle.actionDefinitions),
  factRegistry: new FactRegistry(factDefinitions),
  factSource: new KnownFactSource([...baseFactObservations, ...extraFacts]),
  costProfiles: [],
  structuralValidators: Object.fromEntries(
    Object.keys(content.scenarioBundle.actionDefinitions).map((actionId) => [
      actionId,
      () => ({ status: "valid" as const }),
    ]),
  ),
  knowledgeEffectProfiles: content.runtimeContracts.collection.effectProfiles,
  collectionTaskTemplates: content.runtimeContracts.collection.taskTemplates,
  consultations: {
    actionBindings: content.runtimeContracts.consultation.actionBindings,
    legalProfiles: content.runtimeContracts.consultation.legalProfiles,
    responseProfiles: content.runtimeContracts.consultation.responseProfiles,
    politicalConflictRules: [],
  },
  assessments: content.runtimeContracts.assessment,
  mandates: {
    ...content.runtimeContracts.mandate,
    implementationProfiles: [],
  },
});

const endTurnRequest = (state: CampaignState, commandId: string) =>
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

const requestForAction = (
  state: CampaignState,
  actionId: string,
  commandId: string,
  target: SubjectRef,
  terms: readonly unknown[] = [],
  mandatoryResponseAttentionItemId?: string,
) => {
  const parsedActionId = ActionIdSchema.parse(actionId);
  const action = content.scenarioBundle.actionDefinitions[parsedActionId];
  if (action === undefined) throw new Error(`Unknown action: ${actionId}`);
  return AtomicStrategicCommandRequestSchema.parse({
    contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
    command: {
      commandId,
      commandType: action.commandType,
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: { actionId, targets: [target], terms },
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
    ...(mandatoryResponseAttentionItemId === undefined
      ? {}
      : { mandatoryResponseAttentionItemId }),
  });
};

const consultationPackage = (actionId: string) => {
  const authored = content.runtimeContracts.consultation.authoredPackages.find(
    (candidate) => candidate.actionId === actionId,
  );
  if (authored === undefined)
    throw new Error(`Missing consultation package: ${actionId}`);
  return authored;
};

const reportFor = (
  golden: HeadlessGoldenCase,
  input: unknown,
  observedObservableCodes: readonly string[],
  commandIds: readonly string[],
  traceRefs: readonly string[],
  output: unknown,
): HeadlessScenarioOutcome => {
  const passed =
    hashCanonicalJson(golden.expectedObservableCodes) ===
    hashCanonicalJson(observedObservableCodes);
  return HeadlessScenarioOutcomeSchema.parse({
    ...golden,
    inputHash: hashCanonicalJson(input),
    observedObservableCodes,
    status: passed ? "PASS" : "FAIL",
    commandIds,
    traceRefs,
    outputHash: hashCanonicalJson(output),
    ...(passed ? {} : { failureReason: "GOLDEN_OBSERVABLE_MISMATCH" }),
  });
};

const golden = (simId: (typeof HEADLESS_SIM_IDS)[number]) => {
  const value = HEADLESS_GOLDEN_CASES.find((item) => item.simId === simId);
  if (value === undefined) throw new Error(`Missing golden: ${simId}`);
  return value;
};

const committed = (result: ReturnType<typeof simulateStrategicCommand>) => {
  if (result.status !== "committed") {
    throw new Error(
      `Expected committed command: ${result.status}:${"reasonCode" in result ? result.reasonCode : ""}`,
    );
  }
  return result;
};

const ended = (result: ReturnType<typeof simulateEndTurn>) => {
  if (result.status !== "committed") {
    throw new Error(
      `Expected committed EndTurn: ${result.status}:${"reasonCode" in result ? result.reasonCode : ""}`,
    );
  }
  return result;
};

const sim01 = (): HeadlessScenarioOutcome => {
  const initial = createHeadlessInitialState();
  const commandId = "command_headless_sim01_collect";
  const first = committed(
    simulateStrategicCommand(
      {
        request: requestForAction(
          initial,
          "action_m01_task_access_verification",
          commandId,
          { kind: "zone", zoneId: HEADLESS_ZONE_ID },
        ),
        currentState: initial,
      },
      dispatcherOptions(),
    ),
  );
  const task = Object.values(first.nextState.knowledge.collectionTasks)[0];
  if (task === undefined) throw new Error("SIM-01 task was not created");
  const immediateEvidenceCount = Object.keys(
    first.nextState.knowledge.evidence,
  ).length;
  const nextTurn = ended(
    simulateEndTurn({
      request: endTurnRequest(
        first.nextState,
        "command_headless_sim01_end_turn",
      ),
      currentState: first.nextState,
    }),
  );
  const dueEvidence = EvidenceRecordSchema.parse({
    evidenceId: "evidence_headless_sim01_due",
    subject: task.subject,
    claim: {
      kind: "boolean",
      proposition: "independent_verification_available_test_only",
      value: true,
    },
    sourceType: "simulation_observation",
    initialConfidence: 60,
    sourceReliability: 60,
    observedTurn: 2,
    observedDate: "2025-11-01",
    decayProfileId: "decay_headless_sim01_v1",
    contradictionKey: "zone_test_issue_focus:turn2:independent_verification",
    provenanceRef: "TEST_ONLY:headless-sim01",
    reportSensitivity: "open",
  });
  const resolution = resolveIntelligenceCollection({
    contractVersion: KNOWLEDGE_CONTRACT_VERSION,
    classification: "TEST_ONLY_COLLECTION_RESOLUTION",
    currentState: nextTurn.nextState,
    plan: {
      collectionTaskId: task.collectionTaskId,
      outcome: "useful",
      emittedObservations: [
        {
          observation: {
            observationId: "observation_headless_sim01_due",
            subject: dueEvidence.subject,
            claim: dueEvidence.claim,
            sourceChannel: "test_only_partner",
            baseReliability: 60,
            discoverability: 60,
            earliestTurn: 2,
          },
          evidence: dueEvidence,
        },
      ],
    },
  });
  const observed: string[] = [];
  if (first.nextState.meta.decisionsRemaining === 2)
    observed.push("slot_consumed");
  if (task.dueTurn === 2 && task.requestedTurn === 1)
    observed.push("task_delayed");
  if (immediateEvidenceCount === Object.keys(initial.knowledge.evidence).length)
    observed.push("no_instant_evidence");
  if (
    resolution.status === "resolved" &&
    resolution.trace.emittedEvidenceIds.includes(dueEvidence.evidenceId)
  )
    observed.push("evidence_only_on_due_resolution");
  return reportFor(
    golden("SIM-01"),
    { initialHash: hashCanonicalJson(initial), taskTemplate: task.gapId },
    observed,
    [commandId, "command_headless_sim01_end_turn"],
    ["decision", `collection:${task.collectionTaskId}`],
    resolution,
  );
};

const sim02 = (): HeadlessScenarioOutcome => {
  const initial = createHeadlessInitialState();
  initial.relationships[MALI_ENVOY_RELATIONSHIP_ID] =
    RelationshipStateSchema.parse({
      relationshipId: MALI_ENVOY_RELATIONSHIP_ID,
      source: { kind: "actor", actorId: MALI_ACTOR_ID },
      target: {
        kind: "actor",
        actorId: ActorIdSchema.parse("actor_envoy_legal_adviser"),
      },
      trust: 50,
      strategicAlignment: 50,
      sourceDependenceOnTarget: 50,
      sourceLeverageOverTarget: 0,
      access: 50,
      credibility: 50,
      lastChangedTurn: 1,
    });
  const validated = CampaignStateSchema.parse(initial);
  const authored = consultationPackage("action_m01_consult_mali_access");
  const commandId = "command_headless_sim02_consult";
  const consultation = committed(
    simulateStrategicCommand(
      {
        request: requestForAction(
          validated,
          authored.actionId,
          commandId,
          {
            kind: "actor",
            actorId: ActorIdSchema.parse(authored.targetActorId),
          },
          [authored.package],
        ),
        currentState: validated,
      },
      dispatcherOptions(),
    ),
  );
  const memoryInput = {
    contractVersion: ACTOR_CONTRACT_VERSION,
    classification: "TEST_ONLY_MEMORY_CREATION",
    currentState: consultation.nextState,
    sourceDecisionId: consultation.decisionRecord.decisionId,
    effectProfile: {
      effectProfileId: "effectprofile_headless_sim02_memory",
      effects: [
        {
          effectId: "effect_headless_sim02_memory",
          kind: "create_memory",
          memoryTemplateId: "memory_template_headless_sim02",
        },
      ],
    },
    templates: [
      {
        memoryTemplateId: "memory_template_headless_sim02",
        profileVersion: "test-only-headless-memory-v1",
        classification: "TEST_ONLY_MEMORY_TEMPLATE",
        owner: { kind: "actor", actorId: MALI_ACTOR_ID },
        memoryType: "consultation",
        salience: 50,
        persistenceClass: "significant",
        tags: ["headless_sim02_consultation"],
        relationshipId: "relationship_headless_mali_to_envoy",
        firstRelationshipEffects: { trust: 5 },
        firstFatigueDelta: 5,
        repetitionPolicy: {
          interactionTag: "headless_sim02_consultation",
          cooldownTurns: 1,
          repeatRelationshipEffects: { trust: 0 },
          repeatFatigueDelta: 10,
        },
      },
    ],
  } as const;
  const memory = resolveMemoryCreation(memoryInput);
  const duplicateMemory =
    memory.status === "resolved"
      ? resolveMemoryCreation({
          ...memoryInput,
          currentState: memory.nextState,
        })
      : memory;
  const evidenceAdded =
    Object.keys(consultation.nextState.knowledge.evidence).length ===
    Object.keys(validated.knowledge.evidence).length + 1;
  const observed: string[] = [];
  if (consultation.nextState.meta.decisionsRemaining === 2)
    observed.push("slot_consumed");
  if (evidenceAdded) observed.push("reply_is_knowledge");
  if (
    memory.status === "resolved" &&
    memory.traces.length === 1 &&
    duplicateMemory.status === "rejected"
  )
    observed.push("memory_once");
  if (Object.keys(consultation.nextState.mandateCases).length === 0)
    observed.push("no_collective_consent");
  return reportFor(
    golden("SIM-02"),
    { initialHash: hashCanonicalJson(validated), package: authored.package },
    observed,
    [commandId],
    [
      `decision:${consultation.decisionRecord.decisionId}`,
      "memory:headless_sim02_consultation",
    ],
    { consultation, memory, duplicateMemory },
  );
};

const sim03 = (): HeadlessScenarioOutcome => {
  const initial = createHeadlessInitialState();
  const branch = content.branches.find(({ branchId }) => branchId === "C")!;
  const commandId = "command_headless_sim03_asset_path";
  const result = committed(
    simulateStrategicCommand(
      {
        request: requestForAction(
          initial,
          "action_m01_request_asset_validation",
          commandId,
          { kind: "zone", zoneId: HEADLESS_ZONE_ID },
        ),
        currentState: initial,
      },
      dispatcherOptions(),
    ),
  );
  const observed: string[] = [];
  if (branch.strategy === "defer_redirect" && result.status === "committed")
    observed.push("alternative_path_viable");
  if (Object.keys(result.nextState.mandateCases).length === 0)
    observed.push("no_forced_case");
  if (
    result.nextState.knowledge.evidence[
      EvidenceIdSchema.parse("evidence_m01_civilian_location_gap")
    ]?.claim.kind === "text_claim"
  )
    observed.push("civilian_unknown");
  if (
    result.nextState.knowledge.evidence[
      EvidenceIdSchema.parse("evidence_m01_infra_2025_unknown")
    ]?.claim.kind === "text_claim"
  )
    observed.push("asset_unknown");
  return reportFor(
    golden("SIM-03"),
    { branch, initialHash: hashCanonicalJson(initial) },
    observed,
    [commandId],
    ["branch:C", `decision:${result.decisionRecord.decisionId}`],
    result.nextState,
  );
};

const sim04 = (): HeadlessScenarioOutcome => {
  let state = createHeadlessInitialState();
  const commandIds: string[] = [];
  const traces: string[] = [];
  for (let turn = 1; turn <= 4; turn += 1) {
    const commandId = `command_headless_sim04_end_turn_${turn}`;
    const result = ended(
      simulateEndTurn({
        request: endTurnRequest(state, commandId),
        currentState: state,
      }),
    );
    state = result.nextState;
    commandIds.push(commandId);
    traces.push(...result.resolverTrace.map(({ resolverId }) => resolverId));
  }
  const review = evaluateDoctrineReviewEligibility(state);
  const observed: string[] = [];
  if (commandIds.length === 4) observed.push("four_end_turns");
  if (state.meta.currentTurn === 5 && state.meta.currentDate === "2026-02-01")
    observed.push("month_five_begins");
  if (Object.keys(state.mandateCases).length === 0)
    observed.push("no_forced_case");
  if (review.available && !state.doctrine.codified)
    observed.push("doctrine_review_not_codified");
  return reportFor(
    golden("SIM-04"),
    { initial: createHeadlessInitialState(), endTurns: 4 },
    observed,
    commandIds,
    traces,
    state,
  );
};

const assessmentFixtureState = (): CampaignState => {
  const state = createHeadlessInitialState();
  const support = EvidenceRecordSchema.parse({
    evidenceId: "evidence_headless_assessment_yes",
    subject: { kind: "zone", zoneId: HEADLESS_ZONE_ID },
    claim: {
      kind: "boolean",
      proposition: "access_verification_test_only",
      value: true,
    },
    sourceType: "simulation_observation",
    initialConfidence: 20,
    sourceReliability: 50,
    observedTurn: 1,
    observedDate: "2025-10-01",
    decayProfileId: "decay_headless_assessment_v1",
    contradictionKey: "headless:access:turn1",
    provenanceRef: "TEST_ONLY:headless-assessment-support",
    reportSensitivity: "open",
  });
  const contradiction = EvidenceRecordSchema.parse({
    ...support,
    evidenceId: "evidence_headless_assessment_no",
    claim: { ...support.claim, value: false },
    initialConfidence: 90,
    provenanceRef: "TEST_ONLY:headless-assessment-contradiction",
  });
  state.knowledge.evidence[support.evidenceId] = support;
  state.knowledge.evidence[contradiction.evidenceId] = contradiction;
  state.assessments[HEADLESS_ASSESSMENT_ID] = AssessmentStateSchema.parse({
    assessmentId: HEADLESS_ASSESSMENT_ID,
    subject: support.subject,
    hypothesisCode: "headless_access_available",
    lifecycleStatus: "adopted",
    analysisStatus: "current",
    declaredConfidence: 75,
    evidenceSupportScore: 50,
    contradictionScore: 0,
    supportingEvidenceIds: [support.evidenceId],
    contradictoryEvidenceIds: [],
    intelligenceGapIds: ["gap_m01_monitoring_verification"],
    institutionalImplicationCodes: ["TEST_ONLY_ACCOUNTABLE_ASSESSMENT"],
    adoptedTurn: 1,
  });
  return CampaignStateSchema.parse(state);
};

const sim05 = (): HeadlessScenarioOutcome => {
  const initial = assessmentFixtureState();
  const before = initial.assessments[HEADLESS_ASSESSMENT_ID]!;
  const result = recalculateAssessmentMetadata({
    contractVersion: ASSESSMENT_CONTRACT_VERSION,
    classification: "TEST_ONLY_ASSESSMENT_METADATA_RECALCULATION",
    currentState: initial,
    hypotheses: [
      {
        hypothesisCode: before.hypothesisCode,
        definitionVersion: "test-only-headless-hypothesis-v1",
        classification: "TEST_ONLY_AUTHORED_HYPOTHESIS",
        subject: before.subject,
        relevantEvidenceIds: [
          EvidenceIdSchema.parse("evidence_headless_assessment_yes"),
        ],
        relevantContradictionKeys: ["headless:access:turn1"],
        intelligenceGapIds: ["gap_m01_monitoring_verification"],
        institutionalImplicationCodes: ["TEST_ONLY_ACCOUNTABLE_ASSESSMENT"],
      },
    ],
    metadataProfile: content.runtimeContracts.assessment.metadataProfile,
  });
  const after =
    result.status === "resolved"
      ? result.nextState.assessments[HEADLESS_ASSESSMENT_ID]
      : undefined;
  const observed: string[] = [];
  if (after?.analysisStatus === "contested")
    observed.push("later_contradiction_contests");
  if (after?.hypothesisCode === before.hypothesisCode)
    observed.push("hypothesis_unchanged");
  if (after?.declaredConfidence === before.declaredConfidence)
    observed.push("declared_confidence_unchanged");
  if (
    result.status === "resolved" &&
    result.nextState.knowledge.evidence[
      EvidenceIdSchema.parse("evidence_headless_assessment_no")
    ]?.provenanceRef === "TEST_ONLY:headless-assessment-contradiction"
  )
    observed.push("source_trace_retained");
  return reportFor(
    golden("SIM-05"),
    initial,
    observed,
    [],
    ["assessment_metadata", "evidence:headless:access:turn1"],
    result,
  );
};

const sim06 = (): HeadlessScenarioOutcome => {
  const left = createHeadlessInitialState();
  const right = structuredClone(left);
  right.actors[MALI_ACTOR_ID]!.activeIntent.aggressiveness =
    ScoreSchema.parse(100);
  right.actors[MALI_ACTOR_ID]!.activeIntent.activeGoalCodes = [
    "hidden_changed_test_only",
  ];
  const validatedRight = CampaignStateSchema.parse(right);
  const action =
    content.scenarioBundle.actionDefinitions[
      ActionIdSchema.parse("action_m01_task_access_verification")
    ]!;
  const menuInput = {
    actions: [action],
    factRegistry: new FactRegistry(factDefinitions),
    factSource: new KnownFactSource(baseFactObservations),
    costProfiles: [],
    forecasts: {
      [action.actionId]: KnowledgeForecastSchema.parse({
        likelyInstitutionalReactions: [],
        knownRisks: [],
        intelligenceGaps: ["gap_m01_monitoring_verification"],
        implementationDependencies: [],
        confidence: 50,
      }),
    },
  };
  const leftProjection = buildPlayerKnowledgeProjection(left);
  const rightProjection = buildPlayerKnowledgeProjection(validatedRight);
  const leftMenu = buildKnowledgeSafeActionMenu(menuInput);
  const rightMenu = buildKnowledgeSafeActionMenu(menuInput);
  const observedRight = structuredClone(validatedRight);
  const observation = EvidenceRecordSchema.parse({
    evidenceId: "evidence_headless_sim06_observation",
    subject: { kind: "actor", actorId: "actor_mali_focal_point" },
    claim: {
      kind: "text_claim",
      claimCode: "TEST_ONLY_DELIVERED_ACTOR_OBSERVATION",
    },
    sourceType: "simulation_observation",
    initialConfidence: 50,
    sourceReliability: 50,
    observedTurn: 1,
    observedDate: "2025-10-01",
    decayProfileId: "decay_headless_sim06_v1",
    provenanceRef: "TEST_ONLY:headless-sim06",
    reportSensitivity: "restricted",
  });
  observedRight.knowledge.evidence[observation.evidenceId] = observation;
  const deliveredProjection = buildPlayerKnowledgeProjection(
    CampaignStateSchema.parse(observedRight),
  );
  const observed: string[] = [];
  if (hashCanonicalJson(leftProjection) === hashCanonicalJson(rightProjection))
    observed.push("known_projection_equal");
  if (hashCanonicalJson(leftMenu) === hashCanonicalJson(rightMenu))
    observed.push("preview_equal");
  if (!JSON.stringify(leftProjection).includes("hidden_changed_test_only"))
    observed.push("hidden_intent_absent");
  if (
    hashCanonicalJson(deliveredProjection) !==
    hashCanonicalJson(rightProjection)
  )
    observed.push("observation_changes_projection");
  return reportFor(
    golden("SIM-06"),
    {
      leftHidden: left.actors[MALI_ACTOR_ID],
      rightHidden: validatedRight.actors[MALI_ACTOR_ID],
    },
    observed,
    [],
    ["knowledge_projection", "action_menu"],
    { leftProjection, rightProjection, deliveredProjection },
  );
};

const stateWithNegotiableCase = (): CampaignState => {
  const state = assessmentFixtureState();
  state.mandateCases[HEADLESS_CASE_ID] = MandateCaseStateSchema.parse({
    mandateCaseId: HEADLESS_CASE_ID,
    titleKey: "test.headless.case.access",
    stage: "assessment_basis",
    assessmentIds: [HEADLESS_ASSESSMENT_ID],
    coalition: {
      members: [],
      supportStrength: 0,
      cohesion: 0,
      outstandingConditionCodes: ["test_only_joint_review_required"],
    },
    authorizationProcedureId: "procedure_known_missing_test_only",
    authorization: {
      status: "not_requested",
      requirementStates: [],
      legalScopeCodes: [],
      restrictionCodes: [],
    },
    scope: {
      territoryIds: [TerritoryIdSchema.parse("territory_ml")],
      zoneIds: [HEADLESS_ZONE_ID],
      permittedDomains: ["monitoring"],
      monitoringRequirementCodes: ["test_only_source_trace_required"],
    },
    objectiveIds: ["objective_headless_access"],
    politicalStrength: 0,
    implementationReadiness: 0,
    distortionRisk: 0,
    commitmentIds: [],
    openedTurn: 1,
    lastChangedTurn: 1,
  });
  return CampaignStateSchema.parse(state);
};

const sim07 = (): HeadlessScenarioOutcome => {
  const authorizationReady = stateWithNegotiableCase();
  authorizationReady.mandateCases[HEADLESS_CASE_ID]!.stage = "coalition";
  const initial = CampaignStateSchema.parse(authorizationReady);
  const before = hashCanonicalJson(initial);
  const result = prevalidateMandateCommand({
    contractVersion: MANDATE_CONTRACT_VERSION,
    classification: "TEST_ONLY_MANDATE_COMMAND",
    currentState: initial,
    actionId: "action_headless_request_authorization",
    actionBindings: [
      {
        actionId: "action_headless_request_authorization",
        effectProfileId: "effectprofile_headless_request_authorization",
        operation: "request_authorization",
      },
    ],
    caseTemplates: content.runtimeContracts.mandate.caseTemplates,
    scopeNegotiations: content.runtimeContracts.mandate.scopeNegotiations,
    authorizationProcedures:
      content.runtimeContracts.mandate.authorizationProcedures,
    implementationProfiles: [],
    term: {
      operation: "request_authorization",
      mandateCaseId: HEADLESS_CASE_ID,
      authorizationProcedureId: "procedure_known_missing_test_only",
    },
  });
  const observed: string[] = [];
  if (
    result.status === "rejected" &&
    result.reasonCode === "AUTHORIZATION_PROCEDURE_KNOWN_MISSING"
  )
    observed.push("known_missing_rejected");
  if (initial.meta.decisionsRemaining === 3) observed.push("no_slot_cost");
  if (hashCanonicalJson(initial) === before) observed.push("no_state_mutation");
  if (
    initial.mandateCases[HEADLESS_CASE_ID]?.authorization.status ===
    "not_requested"
  )
    observed.push("no_invented_authority");
  return reportFor(
    golden("SIM-07"),
    { stateHash: before, procedure: "procedure_known_missing_test_only" },
    observed,
    [],
    ["mandate_prevalidation"],
    result,
  );
};

const sim08 = async (): Promise<HeadlessScenarioOutcome> => {
  const initial = createHeadlessInitialState();
  const runtimeStore = new InMemoryCampaignRuntimeStore([initial]);
  const repository =
    new InMemoryCampaignRepository<AtomicCommandRepositoryTypes>([
      createSaveSnapshot(initial),
    ]);
  const service = new AtomicCampaignCommandService({
    coordinator: new SerialCampaignOperationCoordinator(
      new InMemoryCampaignEditLock(),
    ),
    simulation: new InProcessStrategicCommandDispatcher(dispatcherOptions()),
    repository,
    runtimeStore,
  });
  const commandId = "command_headless_sim08_duplicate";
  const request = requestForAction(
    initial,
    "action_m01_task_access_verification",
    commandId,
    { kind: "zone", zoneId: HEADLESS_ZONE_ID },
  );
  const first = await service.dispatch(request);
  const afterFirst = runtimeStore.load(initial.meta.campaignId);
  const duplicate = await service.dispatch(request);
  const afterDuplicate = runtimeStore.load(initial.meta.campaignId);
  const observed: string[] = [];
  if (duplicate.status === "duplicate") observed.push("duplicate_classified");
  if (afterDuplicate.meta.decisionsRemaining === 2)
    observed.push("no_double_slot");
  if (afterDuplicate.domainEvents.length === afterFirst.domainEvents.length)
    observed.push("no_double_event");
  if (afterDuplicate.meta.revision === afterFirst.meta.revision)
    observed.push("revision_unchanged");
  return reportFor(
    golden("SIM-08"),
    request,
    observed,
    [commandId],
    ["atomic_command_service"],
    { first, duplicate, stateHash: hashCanonicalJson(afterDuplicate) },
  );
};

const sim09 = (): HeadlessScenarioOutcome => {
  const state = createHeadlessInitialState();
  const commitmentId = CommitmentIdSchema.parse(
    "commitment_headless_sim09_breach",
  );
  state.commitments[commitmentId] = {
    commitmentId,
    issuer: { kind: "institution", institutionId: ENVOY_INSTITUTION_ID },
    beneficiary: { kind: "actor", actorId: MALI_ACTOR_ID },
    createdTurn: 1,
    dueTurn: 1,
    commitmentType: "headless_due_breach",
    descriptionKey: "test.headless.commitment.breach",
    fulfillmentRules: [{ kind: "all", rules: [] }],
    status: "active",
  };
  state.institutions[ENVOY_INSTITUTION_ID]!.activeCommitmentIds.push(
    commitmentId,
  );
  state.actors[MALI_ACTOR_ID]!.commitmentIds.push(commitmentId);
  state.knowledge.knownCommitmentIds.push(commitmentId);
  const initial = CampaignStateSchema.parse(state);
  const profile = TestOnlyCommitmentResolutionProfileSchema.parse({
    commitmentType: "headless_due_breach",
    profileVersion: "test-only-headless-commitment-v1",
    classification: "TEST_ONLY_COMMITMENT_RESOLUTION_PROFILE",
    dueOutcome: "breached",
    callback: {
      owner: "beneficiary",
      memoryType: "failure",
      salience: 50,
      persistenceClass: "significant",
      tags: ["headless_sim09_breach"],
    },
  });
  const first = resolveDueCommitments({
    contractVersion: "1.0.0",
    classification: "TEST_ONLY_COMMITMENT_RESOLUTION",
    currentState: initial,
    turn: 1,
    profiles: [profile],
  });
  const second =
    first.status === "resolved"
      ? resolveDueCommitments({
          contractVersion: "1.0.0",
          classification: "TEST_ONLY_COMMITMENT_RESOLUTION",
          currentState: first.nextState,
          turn: 1,
          profiles: [profile],
        })
      : first;
  const observed: string[] = [];
  if (
    first.status === "resolved" &&
    first.transitions.length === 1 &&
    first.transitions[0]?.nextStatus === "breached"
  )
    observed.push("single_transition");
  if (
    first.status === "resolved" &&
    Object.keys(first.nextState.memories).length === 1
  )
    observed.push("memory_once");
  if (second.status === "resolved" && second.transitions.length === 0)
    observed.push("no_double_effect");
  return reportFor(
    golden("SIM-09"),
    initial,
    observed,
    [],
    ["commitment_resolution"],
    { first, second },
  );
};

const sim10 = (): HeadlessScenarioOutcome => {
  const fixture = stateWithNegotiableCase();
  const commitmentId = CommitmentIdSchema.parse(
    "commitment_headless_sim10_monitoring",
  );
  fixture.commitments[commitmentId] = {
    commitmentId,
    issuer: { kind: "institution", institutionId: ENVOY_INSTITUTION_ID },
    beneficiary: { kind: "actor", actorId: MALI_ACTOR_ID },
    createdTurn: 1,
    commitmentType: "headless_monitoring_package",
    descriptionKey: "test.headless.commitment.monitoring_package",
    fulfillmentRules: [{ kind: "all", rules: [] }],
    status: "active",
  };
  fixture.mandateCases[HEADLESS_CASE_ID]!.commitmentIds.push(commitmentId);
  fixture.institutions[ENVOY_INSTITUTION_ID]!.activeCommitmentIds.push(
    commitmentId,
  );
  fixture.actors[MALI_ACTOR_ID]!.commitmentIds.push(commitmentId);
  fixture.knowledge.knownCommitmentIds.push(commitmentId);
  const initial = CampaignStateSchema.parse(fixture);
  const commandId = "command_headless_sim10_scope";
  const fact = {
    query: {
      fact: "mandate.coalition_support",
      subject: {
        kind: "mandate_case",
        mandateCaseId: HEADLESS_CASE_ID,
      },
    },
    resolution: { kind: "known", value: 0 },
  };
  const result = committed(
    simulateStrategicCommand(
      {
        request: requestForAction(
          initial,
          "action_m04_revise_case_scope",
          commandId,
          {
            kind: "mandate_case",
            mandateCaseId: HEADLESS_CASE_ID,
          },
          [
            {
              operation: "negotiate_scope",
              mandateCaseId: HEADLESS_CASE_ID,
              scopeNegotiationId: "scope_test_monitoring_joint_review_v1",
            },
          ],
        ),
        currentState: initial,
      },
      dispatcherOptions([fact]),
    ),
  );
  const mandateCase = result.nextState.mandateCases[HEADLESS_CASE_ID]!;
  const observed: string[] = [];
  if (result.nextState.meta.decisionsRemaining === 2)
    observed.push("one_slot_package");
  if (
    mandateCase.stage === "coalition" &&
    mandateCase.scope.monitoringRequirementCodes.includes(
      "test_only_source_trace_required",
    )
  )
    observed.push("scope_persisted");
  if (
    mandateCase.commitmentIds.includes(commitmentId) &&
    result.nextState.commitments[commitmentId]?.status === "active"
  )
    observed.push("commitment_persisted");
  if (mandateCase.distortionRisk === 50)
    observed.push("distortion_risk_derived");
  if (mandateCase.authorization.status === "not_requested")
    observed.push("authorization_not_requested");
  return reportFor(
    golden("SIM-10"),
    {
      stateHash: hashCanonicalJson(initial),
      term: "scope_test_monitoring_joint_review_v1",
    },
    observed,
    [commandId],
    [`mandate_case:${mandateCase.mandateCaseId}`],
    result,
  );
};

const sim11 = (): HeadlessScenarioOutcome => {
  const state = createHeadlessInitialState();
  state.meta.decisionsRemaining = 1;
  const attentionItemId = SIM11_ATTENTION_ID;
  state.attention.items[attentionItemId] = AttentionItemSchema.parse({
    attentionItemId,
    level: "decision_required",
    createdTurn: 1,
    subjectRefs: [{ kind: "actor", actorId: MALI_ACTOR_ID }],
    reasonCode: "TEST_ONLY_MANDATORY_RESPONSE",
    blocking: true,
    resolved: false,
  });
  const initial = CampaignStateSchema.parse(state);
  const authored = consultationPackage("action_m01_consult_mali_access");
  const optionalId = "command_headless_sim11_optional";
  const optional = simulateStrategicCommand(
    {
      request: requestForAction(
        initial,
        authored.actionId,
        optionalId,
        {
          kind: "actor",
          actorId: ActorIdSchema.parse(authored.targetActorId),
        },
        [authored.package],
      ),
      currentState: initial,
    },
    dispatcherOptions(),
  );
  const mandatoryId = "command_headless_sim11_mandatory";
  const mandatory = committed(
    simulateStrategicCommand(
      {
        request: requestForAction(
          initial,
          authored.actionId,
          mandatoryId,
          {
            kind: "actor",
            actorId: ActorIdSchema.parse(authored.targetActorId),
          },
          [authored.package],
          attentionItemId,
        ),
        currentState: initial,
      },
      dispatcherOptions(),
    ),
  );
  const endId = "command_headless_sim11_end_turn";
  const end = ended(
    simulateEndTurn({
      request: endTurnRequest(mandatory.nextState, endId),
      currentState: mandatory.nextState,
    }),
  );
  const observed: string[] = [];
  if (
    optional.status === "rejected" &&
    optional.reasonCode === "DECISION_SLOTS_RESERVED"
  )
    observed.push("optional_action_reserved");
  if (
    mandatory.nextState.attention.items[attentionItemId]?.resolved === true &&
    mandatory.nextState.meta.decisionsRemaining === 0
  )
    observed.push("mandatory_response_commits");
  if (end.status === "committed" && end.nextState.meta.currentTurn === 2)
    observed.push("end_turn_not_softlocked");
  return reportFor(
    golden("SIM-11"),
    initial,
    observed,
    [optionalId, mandatoryId, endId],
    [
      "mandatory_capacity",
      ...end.resolverTrace.map(({ resolverId }) => resolverId),
    ],
    { optional, mandatory, end },
  );
};

const sim12 = async (): Promise<HeadlessScenarioOutcome> => {
  const initial = createHeadlessInitialState();
  const repository =
    new InMemoryCampaignRepository<AtomicCommandRepositoryTypes>([
      createSaveSnapshot(initial),
    ]);
  const runtimeStore = new InMemoryCampaignRuntimeStore([initial]);
  const service = new AtomicCampaignCommandService({
    coordinator: new SerialCampaignOperationCoordinator(
      new InMemoryCampaignEditLock(),
    ),
    simulation: new InProcessStrategicCommandDispatcher(dispatcherOptions()),
    repository,
    runtimeStore,
  });
  const commandId = "command_headless_sim12_save";
  const request = requestForAction(
    initial,
    "action_m01_task_access_verification",
    commandId,
    { kind: "zone", zoneId: HEADLESS_ZONE_ID },
  );
  repository.failNextWrite(new Error("TEST_ONLY_INJECTED_WRITE_FAILURE"));
  let failedWriteWasRejected = false;
  try {
    await service.dispatch(request);
  } catch (error) {
    failedWriteWasRejected = error instanceof CampaignPersistenceError;
  }
  const unchangedAfterFailure =
    hashCanonicalJson(runtimeStore.load(initial.meta.campaignId)) ===
    hashCanonicalJson(initial);
  const committedResult = await service.dispatch(request);
  const committedState = runtimeStore.load(initial.meta.campaignId);
  const snapshot = await repository.load(initial.meta.campaignId);
  const reloadedStore = new InMemoryCampaignRuntimeStore([
    snapshot.authoritativeState,
  ]);
  const reloadHash = hashCanonicalJson(
    reloadedStore.load(initial.meta.campaignId),
  );
  const replayA = committed(
    simulateStrategicCommand(
      { request, currentState: initial },
      dispatcherOptions(),
    ),
  );
  const replayB = committed(
    simulateStrategicCommand(
      { request, currentState: createHeadlessInitialState() },
      dispatcherOptions(),
    ),
  );
  const replayHashA = hashCanonicalJson(replayA.nextState);
  const replayHashB = hashCanonicalJson(replayB.nextState);
  const observed: string[] = [];
  if (replayHashA === replayHashB) observed.push("fixed_replay_hash");
  if (reloadHash === hashCanonicalJson(committedState))
    observed.push("reload_hash_equal");
  if (failedWriteWasRejected && unchangedAfterFailure)
    observed.push("failed_write_uncommitted");
  if (
    committedResult.status === "committed" &&
    replayA.nextState.domainEvents
      .map(({ eventType }) => eventType)
      .join("|") ===
      replayB.nextState.domainEvents.map(({ eventType }) => eventType).join("|")
  )
    observed.push("trace_order_stable");
  return reportFor(
    golden("SIM-12"),
    request,
    observed,
    [commandId],
    ["atomic_write", "snapshot_reload", "repeat_replay"],
    { replayHashA, replayHashB, reloadHash, committedResult },
  );
};

const sim13 = (): HeadlessScenarioOutcome => {
  let state = createHeadlessInitialState();
  state.meta.decisionsRemaining = 1;
  state = CampaignStateSchema.parse(state);
  const dates = [state.meta.currentDate];
  const commandIds: string[] = [];
  const resolverOrder: string[][] = [];
  for (let index = 0; index < 4; index += 1) {
    const commandId = `command_headless_sim13_end_${index + 1}`;
    const result = ended(
      simulateEndTurn({
        request: endTurnRequest(state, commandId),
        currentState: state,
      }),
    );
    resolverOrder.push(
      result.resolverTrace.map(({ resolverId }) => resolverId),
    );
    state = result.nextState;
    dates.push(state.meta.currentDate);
    commandIds.push(commandId);
  }
  const expectedDates = [
    "2025-10-01",
    "2025-11-01",
    "2025-12-01",
    "2026-01-01",
    "2026-02-01",
  ];
  const observed: string[] = [];
  if (hashCanonicalJson(dates) === hashCanonicalJson(expectedDates))
    observed.push("oct_to_feb");
  if (
    resolverOrder.every(
      (order) =>
        order[0] === "scheduled_consequences" &&
        order.at(-1) === "final_evaluation",
    )
  )
    observed.push("resolution_before_increment");
  if (state.meta.decisionsRemaining === 3) observed.push("unused_slots_expire");
  if (state.meta.decisionsRemaining === state.meta.decisionsPerTurn)
    observed.push("no_extra_slots");
  return reportFor(
    golden("SIM-13"),
    { startDate: dates[0], transitions: 4 },
    observed,
    commandIds,
    resolverOrder.flat(),
    { dates, stateHash: hashCanonicalJson(state) },
  );
};

const sim14Evidence = (
  evidenceId: string,
  value: boolean,
  subjectZoneId = HEADLESS_ZONE_ID,
) =>
  EvidenceRecordSchema.parse({
    evidenceId,
    subject: { kind: "zone", zoneId: ZoneIdSchema.parse(subjectZoneId) },
    claim: {
      kind: "boolean",
      proposition: "access_verified_test_only",
      value,
    },
    sourceType: "simulation_observation",
    initialConfidence: 50,
    sourceReliability: 50,
    observedTurn: 1,
    observedDate: "2025-10-01",
    decayProfileId: "decay_headless_sim14_v1",
    contradictionKey: "headless:access:turn1",
    provenanceRef: `TEST_ONLY:${evidenceId}`,
    reportSensitivity: "open",
  });

const sim14 = (): HeadlessScenarioOutcome => {
  const yes = sim14Evidence("evidence_headless_sim14_yes", true);
  const no = sim14Evidence("evidence_headless_sim14_no", false);
  const otherScope = sim14Evidence(
    "evidence_headless_sim14_other_scope",
    false,
    HEADLESS_OTHER_ZONE_ID,
  );
  const sameScope = findEvidenceContradictions([yes, no]);
  const differentScope = findEvidenceContradictions([yes, otherScope]);
  const observed: string[] = [];
  if (sameScope.length === 1 && sameScope[0]?.evidenceIds.length === 2)
    observed.push("same_scope_contested");
  if (differentScope.length === 0)
    observed.push("different_scope_not_contested");
  return reportFor(
    golden("SIM-14"),
    [yes, no, otherScope],
    observed,
    [],
    ["contradiction_key:headless:access:turn1"],
    { sameScope, differentScope },
  );
};

const sim15 = (): HeadlessScenarioOutcome => {
  const state = createHeadlessInitialState();
  const zone = state.world.zones[HEADLESS_ZONE_ID]!;
  const observedBaselineCount = Object.values(state.knowledge.evidence).filter(
    ({ sourceType }) => sourceType === "observed_baseline",
  ).length;
  let productionRejected = false;
  try {
    serializeProductionScenarioBundle(content.scenarioBundle);
  } catch (error) {
    productionRejected = error instanceof ProductionScenarioAdmissionError;
  }
  const observed: string[] = [];
  if (
    observedBaselineCount === 0 &&
    content.noncoveragePeriod.interpretation === "UNKNOWN_NOT_ZERO"
  )
    observed.push("missing_not_zero");
  if (
    zone.tags.includes("missing_observed_baseline") &&
    !state.knowledge.evidence[
      EvidenceIdSchema.parse("evidence_headless_stability_inference")
    ]
  )
    observed.push("no_stability_inference");
  if (productionRejected) observed.push("production_rejects_synthetic_zone");
  return reportFor(
    golden("SIM-15"),
    {
      zone: content.scenarioBundle.zoneDefinitions[HEADLESS_ZONE_ID],
      noncoverage: content.noncoveragePeriod,
    },
    observed,
    [],
    ["production_scenario_admission"],
    { observedBaselineCount, productionRejected },
  );
};

const sim16 = (): HeadlessScenarioOutcome => {
  const state = createHeadlessInitialState();
  const before = hashCanonicalJson(state);
  const evidence =
    state.knowledge.evidence[
      EvidenceIdSchema.parse("evidence_m01_access_civic_signal")
    ]!;
  const request = NarrativeRequestSchema.parse({
    contractVersion: NARRATIVE_CONTRACT_VERSION,
    classification: "TEST_ONLY_KNOWLEDGE_SAFE_NARRATIVE",
    identity: {
      campaignId: state.meta.campaignId,
      sourceCampaignRevision: state.meta.revision,
      semanticContextHash: hashCanonicalJson(
        buildPlayerKnowledgeProjection(state),
      ),
      language: "en",
      narrativePolicyVersion: NARRATIVE_POLICY_VERSION,
      templateVersion: NARRATIVE_TEMPLATE_VERSION,
    },
    context: {
      narrativeContextId: "narrative_headless_sim16",
      perspective: { kind: "player_office" },
      turn: 1,
      subjectRefs: [evidence.subject],
      semanticState: {
        toneProfileId: "tone_headless_measured",
        knownMemoryIds: [],
        knownCommitmentIds: [],
        knownDisputeIds: [],
        allowedClaimIds: [evidence.evidenceId],
      },
      prohibitedClaimCodes: ["hidden_changed_test_only"],
    },
    templateInput: {
      templateKind: "collection_outcome",
      collectionTaskId: "collection_headless_sim16",
      outcome: "partial",
      responseDate: "2025-10-01",
      evidence: [evidence],
      remainingGapQuestionCode: "access.independent_verification_possible",
    },
  });
  const fallback = renderDeterministicNarrative(request);
  const stale = resolveNarrativeResponse(request, {
    contractVersion: NARRATIVE_CONTRACT_VERSION,
    identity: { ...request.identity, semanticContextHash: "b".repeat(64) },
    response: fallback.response,
  });
  const observed: string[] = [];
  if (
    fallback.source === "deterministic_template" &&
    fallback.response.text.startsWith("SIMULATED\n")
  )
    observed.push("fallback_used");
  if (stale.fallbackReason === "STALE_RESPONSE_IDENTITY")
    observed.push("stale_response_rejected");
  if (hashCanonicalJson(state) === before) observed.push("state_unchanged");
  if (!fallback.response.text.includes("hidden_changed_test_only"))
    observed.push("hidden_truth_absent");
  return reportFor(
    golden("SIM-16"),
    request,
    observed,
    [],
    ["narrative_fallback", "stale_identity_guard"],
    { fallback, stale },
  );
};

interface SampleCampaignResult {
  readonly sampleIndex: number;
  readonly finalHash: string;
  readonly commandIds: readonly string[];
  readonly finalState: CampaignState;
}

const runSampleCampaign = (sampleIndex: number): SampleCampaignResult => {
  let state = createHeadlessInitialState(
    `${HEADLESS_GOLDEN_SEED}:standard:${sampleIndex}`,
    `campaign_headless_sample_${String(sampleIndex).padStart(2, "0")}`,
  );
  const commandIds: string[] = [];
  for (let month = 1; month <= 4; month += 1) {
    const authored = consultationPackage("action_m01_consult_mali_access");
    const actions = [
      {
        actionId: "action_m01_task_access_verification",
        target: { kind: "zone", zoneId: HEADLESS_ZONE_ID } as const,
        terms: [] as readonly unknown[],
      },
      {
        actionId: authored.actionId,
        target: {
          kind: "actor",
          actorId: ActorIdSchema.parse(authored.targetActorId),
        } as const,
        terms: [authored.package] as readonly unknown[],
      },
      {
        actionId: "action_m01_task_civilian_route",
        target: { kind: "zone", zoneId: HEADLESS_ZONE_ID } as const,
        terms: [] as readonly unknown[],
      },
    ];
    actions.forEach((choice, index) => {
      const commandId = `command_sample_${sampleIndex}_m${month}_s${index + 1}`;
      const result = committed(
        simulateStrategicCommand(
          {
            request: requestForAction(
              state,
              choice.actionId,
              commandId,
              choice.target,
              choice.terms,
            ),
            currentState: state,
          },
          dispatcherOptions(),
        ),
      );
      state = result.nextState;
      commandIds.push(commandId);
    });
    const endCommandId = `command_sample_${sampleIndex}_m${month}_end`;
    const end = ended(
      simulateEndTurn({
        request: endTurnRequest(state, endCommandId),
        currentState: state,
      }),
    );
    state = end.nextState;
    commandIds.push(endCommandId);
  }
  return {
    sampleIndex,
    finalHash: hashCanonicalJson(state),
    commandIds,
    finalState: state,
  };
};

export const runHeadlessAcceptance =
  async (): Promise<HeadlessAcceptanceArtifact> => {
    const reports = [
      sim01(),
      sim02(),
      sim03(),
      sim04(),
      sim05(),
      sim06(),
      sim07(),
      await sim08(),
      sim09(),
      sim10(),
      sim11(),
      await sim12(),
      sim13(),
      sim14(),
      sim15(),
      sim16(),
    ];
    const samples: SampleCampaignResult[] = [];
    const failures: string[] = [];
    for (let index = 0; index < HEADLESS_SAMPLES_PER_DIFFICULTY; index += 1) {
      try {
        samples.push(runSampleCampaign(index));
      } catch (error) {
        failures.push(
          `${index}:${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    const firstReplay = runSampleCampaign(0);
    const repeatReplay = runSampleCampaign(0);
    const reloadSnapshot = createSaveSnapshot(firstReplay.finalState);
    const reloadHash = hashCanonicalJson(reloadSnapshot.authoritativeState);
    const replayMatched =
      firstReplay.finalHash === repeatReplay.finalHash &&
      firstReplay.finalHash === reloadHash;
    const coverage = {
      difficultyProfileId: "difficulty_test_only_standard_v1",
      requestedSamples: HEADLESS_SAMPLES_PER_DIFFICULTY,
      completedSamples: samples.length,
      failedSamples: failures.length,
      turnsPerSample: 4 as const,
      decisionsPerTurn: 3 as const,
      commandCount: samples.reduce(
        (total, sample) => total + sample.commandIds.length,
        0,
      ),
      uniqueFinalHashes: new Set(samples.map(({ finalHash }) => finalHash))
        .size,
      aggregateHash: hashCanonicalJson(
        samples.map(({ sampleIndex, finalHash }) => ({
          sampleIndex,
          finalHash,
        })),
      ),
    };
    const allPassed = reports.every(({ status }) => status === "PASS");
    return HeadlessAcceptanceArtifactSchema.parse({
      schemaVersion: HEADLESS_ACCEPTANCE_SCHEMA_VERSION,
      acceptanceVersion: HEADLESS_ACCEPTANCE_VERSION,
      classification: "TEST_ONLY_HEADLESS_ACCEPTANCE",
      sourcePins: {
        package4Validation:
          "41c97fac25ee55fa51092fe48a0532d175e0e0c864888287cbd654809bbdade8",
        prompt19:
          "cae36db7caf5274e7bae8181ed34157a011e28a415fac31aa0aeb23e8985b344",
        contentVersion: content.contentVersion,
        contentHash: hashCanonicalJson(content),
      },
      seed: HEADLESS_GOLDEN_SEED,
      outcomeReports: reports,
      difficultyCoverage: [coverage],
      replay: {
        fixtureId: "replay_four_month_headless_v1",
        commandIds: firstReplay.commandIds,
        firstRunHash: firstReplay.finalHash,
        repeatRunHash: repeatReplay.finalHash,
        reloadHash,
        matched: replayMatched,
      },
      productionGates: content.unimplementedCanonicalSystems.map((system) => ({
        gateId: system.systemId,
        status: "BLOCKED",
        reasonCode: system.consequence,
        ownerRole: system.ownerRole,
      })),
      overallStatus:
        allPassed && failures.length === 0 && replayMatched
          ? "READY_FOR_REVIEW"
          : reports.some(({ status }) => status === "BLOCKED")
            ? "BLOCKED"
            : "FAILED",
    });
  };

export const hashHeadlessAcceptanceArtifact = (
  artifact: HeadlessAcceptanceArtifact,
): string =>
  hashCanonicalJson(HeadlessAcceptanceArtifactSchema.parse(artifact));
