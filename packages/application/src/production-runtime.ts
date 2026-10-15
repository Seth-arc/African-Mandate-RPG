import {
  ATOMIC_COMMIT_CONTRACT_VERSION,
  CampaignArtifactRefsSchema,
  CampaignIdSchema,
  CampaignStateSchema,
  CampaignVersionsSchema,
  EndTurnRequestSchema,
  KnownCostProfileSchema,
  ScoreSchema,
  StrategicCommandSimulationResultSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  type ActionDefinition,
  type BaselinePackage,
  type CampaignArtifactRefs,
  type CampaignId,
  type CampaignState,
  type KnownCostProfile,
  type ScenarioBundle,
  type StrategicCommandSimulationInput,
  type StrategicCommandSimulationResult,
  type SubjectRef,
} from "@african-mandate/domain";
import {
  FactRegistry,
  KnownFactSource,
  buildKnowledgeSafeActionMenu,
  buildPlayerKnowledgeProjection,
  createInitialTurnResolverRegistry,
  deriveSimulationId,
  hashCanonicalJson,
  sha256Hex,
  simulateEndTurn,
  simulateStrategicCommand,
  type TurnResolverDefinition,
} from "@african-mandate/simulation";
import {
  createInitialDoctrineState,
  createUnavailableEvaluationState,
} from "@african-mandate/domain";

import {
  BrowserArtifactRegistryClient,
  ArtifactHashMismatchError,
  type MapArtifactManifest,
} from "./artifact-registry.js";
import {
  AtomicCampaignCommandService,
  InMemoryCampaignRuntimeStore,
  createSaveSnapshot,
} from "./atomic-command-service.js";
import { AtomicCampaignTurnService } from "./atomic-turn-service.js";
import {
  CorruptCampaignSnapshotError,
  IndexedDbCampaignRepository,
  IndexedDbCampaignStorage,
  StaleCampaignRevisionError,
  WebLocksCampaignEditLock,
} from "./browser-persistence.js";
import {
  DECISION_WORKFLOW_CONTRACT_VERSION,
  DECISION_WORKFLOW_SCHEMA_VERSION,
  DecisionWorkflowCoordinator,
  DecisionWorkspaceProjectionSchema,
  type DecisionWorkspaceProjection,
} from "./decision-workflow.js";
import {
  MapDocumentProjectionSchema,
  type MapDocumentProjection,
} from "./map-documents.js";
import { SerialCampaignOperationCoordinator } from "./operation-coordinator.js";

export const PRODUCTION_CAMPAIGN_ID = CampaignIdSchema.parse(
  "campaign_local_primary",
);
export const PRODUCTION_DATABASE_NAME =
  "african-mandate-production-v1" as const;

type ProductionMapFeature = {
  readonly a3: string;
  readonly n: string;
  readonly r: readonly (readonly (readonly [number, number])[])[];
};

export interface ProductionRuntime {
  readonly recoveredFromSnapshot: boolean;
  readonly initialProjection: DecisionWorkspaceProjection;
  readonly mapDocuments: MapDocumentProjection;
  readonly workflow: {
    readonly initialProjection: DecisionWorkspaceProjection;
    commit: DecisionWorkflowCoordinator["commit"];
    endMonth: DecisionWorkflowCoordinator["endMonth"];
  };
  close(): void;
}

const coefficient = (
  section: Readonly<Record<string, unknown>>,
  key: string,
): number => {
  const value = section[key];
  if (typeof value !== "number") {
    throw new TypeError(`Missing production coefficient: ${key}`);
  }
  return value;
};

const clamp = (value: number, minimum = 0, maximum = 100): number =>
  Math.max(minimum, Math.min(maximum, value));

const monthForTurn = (startDate: string, turn: number): string => {
  const [year, month] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1 + turn - 1, 1));
  return date.toISOString().slice(0, 10);
};

const actorCooperation = (scenario: ScenarioBundle, actorId: string): number =>
  coefficient(scenario.balance.actors, `initial.compromise.${actorId}`);

const createInitialCampaign = (
  scenario: ScenarioBundle,
  baseline: BaselinePackage,
  versions: unknown,
): CampaignState => {
  const implementation = scenario.balance.implementation;
  const events = scenario.balance.events;
  const conflict = scenario.balance.conflict;
  const civilian = scenario.balance.civilian;
  const development = scenario.balance.development;
  const relationships = scenario.balance.relationships;
  const actors = scenario.balance.actors;
  const territoryStates = Object.fromEntries(
    Object.values(scenario.territoryDefinitions).map(({ territoryId }) => [
      territoryId,
      {
        territoryId,
        stability: coefficient(events, "initial.territory.stability"),
        institutionalCapacity: coefficient(
          events,
          "initial.territory.institutional_capacity",
        ),
        economicResilience: coefficient(
          events,
          "initial.territory.economic_resilience",
        ),
        politicalStatusTags: ["SIMULATED_NEUTRAL_NOT_OBSERVED"],
      },
    ]),
  );
  const zoneStates = Object.fromEntries(
    Object.values(scenario.zoneDefinitions).map(({ zoneId }) => [
      zoneId,
      {
        zoneId,
        statePresence: coefficient(events, "initial.zone.state_presence"),
        controlContest: coefficient(events, "initial.zone.control_contest"),
        localGovernanceCapacity: coefficient(
          events,
          "initial.zone.local_governance_capacity",
        ),
        tags: ["SIMULATED_NEUTRAL_NOT_OBSERVED"],
      },
    ]),
  );
  const conflictZones = Object.fromEntries(
    Object.keys(scenario.zoneDefinitions).map((zoneId) => {
      const observed = (
        baseline.conflictBaseline.zoneIndicators as Readonly<
          Record<string, Readonly<Record<string, number>>>
        >
      )[zoneId];
      const uniqueEventCount = observed?.["uniqueEventCount"];
      const armedActivity =
        uniqueEventCount === undefined
          ? coefficient(conflict, "initial.uncoveredZoneArmedActivity")
          : clamp(30 + 5 * uniqueEventCount, 30, 70);
      return [
        zoneId,
        {
          zoneId,
          armedActivity,
          civilianTargeting: coefficient(conflict, "initial.civilianTargeting"),
          actorFragmentation: coefficient(
            conflict,
            "initial.actorFragmentation",
          ),
          mobility: coefficient(conflict, "initial.mobility"),
          recruitmentPressure: coefficient(
            conflict,
            "initial.recruitmentPressure",
          ),
          escalationMomentum: coefficient(
            conflict,
            "initial.escalationMomentum",
          ),
          spilloverPressure: coefficient(conflict, "initial.spilloverPressure"),
        },
      ];
    }),
  );
  const civilianZones = Object.fromEntries(
    Object.keys(scenario.zoneDefinitions).map((zoneId) => [
      zoneId,
      {
        civilianConfidence: coefficient(civilian, "initial.civilianConfidence"),
        displacementPressure: coefficient(
          civilian,
          "initial.displacementPressure",
        ),
        humanitarianAccess: coefficient(civilian, "initial.humanitarianAccess"),
        serviceReliability: coefficient(civilian, "initial.serviceReliability"),
        perceivedLegitimacy: coefficient(
          civilian,
          "initial.perceivedLegitimacy",
        ),
      },
    ]),
  );
  const developmentZones = Object.fromEntries(
    Object.keys(scenario.zoneDefinitions).map((zoneId) => [
      zoneId,
      {
        investmentPipeline: coefficient(
          development,
          "initial.investmentPipeline",
        ),
        implementationAbsorption: coefficient(
          development,
          "initial.implementationAbsorption",
        ),
        infrastructureNeed: coefficient(
          development,
          "initial.infrastructureNeed",
        ),
        serviceDeficit: coefficient(development, "initial.serviceDeficit"),
        externalFinanceDependence: coefficient(
          development,
          "initial.externalFinanceDependence",
        ),
      },
    ]),
  );
  const resourceScore = coefficient(
    relationships,
    "initial.institution_resource",
  );
  const institutions = Object.fromEntries(
    Object.keys(scenario.institutionDefinitions).map((institutionId) => [
      institutionId,
      {
        institutionId,
        resources: {
          financialCapacity: resourceScore,
          personnelCapacity: resourceScore,
          logisticsCapacity: resourceScore,
          diplomaticCapacity: resourceScore,
          intelligenceCapacity: resourceScore,
          implementationCapacity: resourceScore,
        },
        policyPositions: {},
        activeCommitmentIds: [],
        activeDisputeIds: [],
        legitimacy: coefficient(
          relationships,
          "initial.institution_legitimacy",
        ),
        coordinationCapacity: coefficient(
          relationships,
          "initial.institution_coordination",
        ),
      },
    ]),
  );
  const actorStates = Object.fromEntries(
    Object.values(scenario.actorDefinitions).map(({ actorId }) => {
      const capability = coefficient(actors, "initial.capability");
      return [
        actorId,
        {
          actorId,
          capabilities: {
            political: capability,
            coercive: capability,
            financial: capability,
            information: capability,
            implementation: capability,
          },
          activeIntent: {
            activeGoalCodes: [],
            aggressiveness: coefficient(actors, "initial.aggressiveness"),
            opportunism: coefficient(actors, "initial.opportunism"),
            compromiseWillingness: actorCooperation(scenario, actorId),
            strategyTags: ["SIMULATED_NOT_OBSERVED"],
          },
          issuePositionIds: [],
          memoryIds: [],
          commitmentIds: [],
          redLineIds: [],
          disputeIds: [],
          fatigue: coefficient(actors, "initial.fatigue"),
        },
      ];
    }),
  );

  return CampaignStateSchema.parse({
    meta: {
      campaignId: PRODUCTION_CAMPAIGN_ID,
      scenarioId: scenario.scenario.scenarioId,
      campaignSeed: PRODUCTION_CAMPAIGN_ID,
      difficultyProfileId: scenario.scenario.difficultyProfileIds[0],
      currentTurn: 1,
      maxTurns: scenario.scenario.maxTurns,
      currentDate: scenario.scenario.startDate,
      decisionsRemaining: scenario.scenario.decisionsPerTurn,
      decisionsPerTurn: scenario.scenario.decisionsPerTurn,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: scenario.scenario.representedInstitutionId,
      materialResources: {
        budget: {
          amount: coefficient(implementation, "initial.budget_usd"),
          currency: "USD",
        },
        personnel: coefficient(implementation, "initial.personnel"),
        logistics: coefficient(implementation, "initial.logistics"),
      },
      institutionalCapacity: {
        mandateAuthority: coefficient(
          implementation,
          "initial.player.mandateAuthority",
        ),
        politicalCapital: coefficient(
          implementation,
          "initial.player.politicalCapital",
        ),
        secretariatCapacity: coefficient(
          implementation,
          "initial.player.secretariatCapacity",
        ),
        memberStateAlignment: coefficient(
          implementation,
          "initial.player.memberStateAlignment",
        ),
        partnerConfidence: coefficient(
          implementation,
          "initial.player.partnerConfidence",
        ),
        implementationCapacity: coefficient(
          implementation,
          "initial.player.implementationCapacity",
        ),
        intelligenceConfidence: coefficient(
          scenario.balance.intelligence,
          "initial.intelligence_confidence",
        ),
      },
    },
    world: {
      territories: territoryStates,
      zones: zoneStates,
      conflict: { zones: conflictZones },
      civilian: { zones: civilianZones },
      infrastructure: { assets: {}, corridors: {} },
      development: { zones: developmentZones },
      externalEnvironment: {
        externalPowerCompetition: coefficient(
          events,
          "initial.external.externalPowerCompetition",
        ),
        donorRiskTolerance: coefficient(
          events,
          "initial.external.donorRiskTolerance",
        ),
        commodityPressure: coefficient(
          events,
          "initial.external.commodityPressure",
        ),
        regionalDiplomaticPressure: coefficient(
          events,
          "initial.external.regionalDiplomaticPressure",
        ),
      },
    },
    institutions,
    actors: actorStates,
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
    versions: CampaignVersionsSchema.parse(versions),
  });
};

const actionDefinitions = (scenario: ScenarioBundle): ActionDefinition[] =>
  Object.values(scenario.actionDefinitions);

const costProfiles = (scenario: ScenarioBundle): KnownCostProfile[] =>
  actionDefinitions(scenario).map((action) => {
    const costs = [
      "political_capital",
      "secretariat_capacity",
      "implementation_capacity",
      "personnel",
      "budget",
    ].flatMap((costType) => {
      const amount =
        scenario.balance.implementation[`cost.${action.actionId}.${costType}`];
      if (amount === undefined) return [];
      return [
        costType === "budget"
          ? {
              costType,
              money: { amount, currency: "USD" },
              certainty: "known" as const,
            }
          : { costType, amount, certainty: "known" as const },
      ];
    });
    return KnownCostProfileSchema.parse({
      knownCostProfileId: action.knownCostProfileId,
      costs,
    });
  });

const targetExists = (state: CampaignState, target: SubjectRef): boolean => {
  if (target.kind === "territory")
    return target.territoryId in state.world.territories;
  if (target.kind === "zone") return target.zoneId in state.world.zones;
  if (target.kind === "actor") return target.actorId in state.actors;
  if (target.kind === "institution")
    return target.institutionId in state.institutions;
  if (target.kind === "asset")
    return target.assetId in state.world.infrastructure.assets;
  if (target.kind === "corridor")
    return target.corridorId in state.world.infrastructure.corridors;
  if (target.kind === "assessment")
    return target.assessmentId in state.assessments;
  if (target.kind === "mandate_case")
    return target.mandateCaseId in state.mandateCases;
  return target.worldEventId in state.worldEvents;
};

const authorizationEvents = (state: CampaignState, targetId: string) =>
  state.domainEvents.filter(
    ({ eventType, payload }) =>
      eventType === "simulated_authorization_step" &&
      payload["targetInstitutionId"] === targetId,
  );

const authorizationPrecheck = (
  input: StrategicCommandSimulationInput,
): StrategicCommandSimulationResult | undefined => {
  if (
    input.request.command.payload.actionId !==
    "action_simulated_request_authorization"
  ) {
    return undefined;
  }
  const target = input.request.command.payload.targets[0];
  if (target?.kind !== "institution") return undefined;
  const prior = authorizationEvents(input.currentState, target.institutionId);
  if (
    prior.some(
      ({ payload }) => payload["step"] === "affected_host_game_consent",
    )
  ) {
    return StrategicCommandSimulationResultSchema.parse({
      status: "rejected",
      commandId: input.request.command.commandId,
      reasonCode: "KNOWN_REQUIREMENT_FAILED",
      detailCode: "SIMULATED_AUTHORIZATION_ALREADY_GRANTED",
    });
  }
  if (prior.length === 0) return undefined;
  const consulted = input.currentState.domainEvents.some(
    ({ eventType }) => eventType === "simulated_consultation_memory_recorded",
  );
  if (!consulted) {
    return StrategicCommandSimulationResultSchema.parse({
      status: "rejected",
      commandId: input.request.command.commandId,
      reasonCode: "KNOWN_REQUIREMENT_FAILED",
      detailCode: "SIMULATED_REGIONAL_CONSULTATION_REQUIRED",
    });
  }
  const requestedTurn = Number(prior[0]!.payload["requestedTurn"]);
  const pscComplete = prior.some(
    ({ payload }) => payload["step"] === "psc_game_review",
  );
  if (!pscComplete && input.currentState.meta.currentTurn < requestedTurn + 2) {
    return StrategicCommandSimulationResultSchema.parse({
      status: "rejected",
      commandId: input.request.command.commandId,
      reasonCode: "KNOWN_REQUIREMENT_FAILED",
      detailCode: "SIMULATED_TWO_TURN_LEAD_TIME_REQUIRED",
    });
  }
  return undefined;
};

const authorizationIsAvailable = (state: CampaignState): boolean => {
  const targetId = "institution_government_mali";
  const prior = authorizationEvents(state, targetId);
  if (prior.length === 0) return true;
  if (
    prior.some(
      ({ payload }) => payload["step"] === "affected_host_game_consent",
    )
  ) {
    return false;
  }
  if (
    !state.domainEvents.some(
      ({ eventType }) => eventType === "simulated_consultation_memory_recorded",
    )
  ) {
    return false;
  }
  if (prior.some(({ payload }) => payload["step"] === "psc_game_review")) {
    return true;
  }
  return (
    state.meta.currentTurn >= Number(prior[0]!.payload["requestedTurn"]) + 2
  );
};

const appendProductionActionEvent = (
  result: Extract<StrategicCommandSimulationResult, { status: "committed" }>,
  baseline: BaselinePackage,
  scenario: ScenarioBundle,
): StrategicCommandSimulationResult => {
  const next = structuredClone(result.nextState);
  const decision = next.decisions.at(-1)!;
  const target = decision.targets[0]!;
  const eventId = deriveSimulationId({
    entityType: "domain_event",
    campaignSeed: next.meta.campaignSeed,
    resolutionKey: `production:${result.commandId}`,
    ordinal: 1,
  });
  let eventType: string;
  let payload: Record<string, string | number | boolean>;
  if (decision.actionId === "action_simulated_collect_evidence") {
    eventType = "simulated_collection_task_created";
    payload = {
      commandId: result.commandId,
      dueTurn: decision.turn + 1,
      targetKind: target.kind,
      targetId:
        target.kind === "territory"
          ? target.territoryId
          : target.kind === "zone"
            ? target.zoneId
            : "invalid",
      baselineAsOf: baseline.asOfDate,
    };
  } else if (decision.actionId === "action_simulated_consult_counterpart") {
    const priorDelta = next.domainEvents
      .filter(
        ({ eventType: type }) =>
          type === "simulated_consultation_memory_recorded",
      )
      .reduce(
        (sum, event) => sum + Number(event.payload["trustDelta"] ?? 0),
        0,
      );
    const trustDelta = coefficient(
      scenario.balance.relationships,
      "simulated.consultation_trust_delta",
    );
    eventType = "simulated_consultation_memory_recorded";
    payload = {
      commandId: result.commandId,
      targetKind: target.kind,
      targetId:
        target.kind === "actor"
          ? target.actorId
          : target.kind === "institution"
            ? target.institutionId
            : "invalid",
      trustDelta,
      cumulativeTrustDelta: clamp(priorDelta + trustDelta),
      classification: "SIMULATED_NOT_OBSERVED",
    };
  } else {
    const targetInstitutionId =
      target.kind === "institution" ? target.institutionId : "invalid";
    const prior = authorizationEvents(next, targetInstitutionId);
    const step =
      prior.length === 0
        ? "commission_submission"
        : prior.some(
              ({ payload: priorPayload }) =>
                priorPayload["step"] === "psc_game_review",
            )
          ? "affected_host_game_consent"
          : "psc_game_review";
    eventType = "simulated_authorization_step";
    payload = {
      commandId: result.commandId,
      targetInstitutionId,
      step,
      requestedTurn:
        prior.length === 0
          ? decision.turn
          : Number(prior[0]!.payload["requestedTurn"]),
      completedTurn: decision.turn,
      authorized: step === "affected_host_game_consent",
      classification: "SIMULATED_NOT_LEGAL_CLAIM",
    };
  }
  next.domainEvents.push({
    domainEventId: eventId,
    turn: decision.turn,
    eventType,
    aggregateType: "campaign",
    aggregateId: next.meta.campaignId,
    sourceDecisionId: decision.decisionId,
    payload,
  });
  decision.createdDomainEventIds.push(eventId);
  const validated = CampaignStateSchema.parse(next);
  return StrategicCommandSimulationResultSchema.parse({
    ...result,
    decisionRecord: validated.decisions.at(-1),
    nextState: validated,
  });
};

const productionCommandPort = (
  scenario: ScenarioBundle,
  baseline: BaselinePackage,
) => ({
  dispatch: async (input: StrategicCommandSimulationInput) => {
    const precheck = authorizationPrecheck(input);
    if (precheck !== undefined) return precheck;
    const factRegistry = new FactRegistry([
      {
        key: "player.secretariat_capacity",
        valueType: "number",
        allowedScopes: ["player_eligibility"],
        subjectKinds: [],
        resolverId: "production_player_capacity",
      },
    ]);
    const result = simulateStrategicCommand(input, {
      actions: actionDefinitions(scenario),
      factRegistry,
      factSource: new KnownFactSource([
        {
          query: { fact: "player.secretariat_capacity" },
          resolution: {
            kind: "known",
            value:
              input.currentState.player.institutionalCapacity
                .secretariatCapacity,
          },
        },
      ]),
      costProfiles: costProfiles(scenario),
      structuralValidators: Object.fromEntries(
        actionDefinitions(scenario).map(({ actionId }) => [
          actionId,
          ({ command }: { command: { payload: { targets: SubjectRef[] } } }) =>
            command.payload.targets.every((target) =>
              targetExists(input.currentState, target),
            )
              ? { status: "valid" as const }
              : {
                  status: "impossible" as const,
                  detailCode: "PRODUCTION_TARGET_NOT_REGISTERED",
                },
        ]),
      ),
    });
    return result.status === "committed"
      ? appendProductionActionEvent(result, baseline, scenario)
      : result;
  },
});

const collectionResolver = (
  baseline: BaselinePackage,
): TurnResolverDefinition => ({
  resolverId: "intelligence_collection",
  sourceStep: "12",
  adapterKind: "implemented",
  resolve: (draft, context) => {
    const resolvedCommands = new Set(
      draft.domainEvents
        .filter(
          ({ eventType }) => eventType === "simulated_collection_task_resolved",
        )
        .map(({ payload }) => String(payload["sourceCommandId"])),
    );
    const tasks = draft.domainEvents.filter(
      ({ eventType, payload }) =>
        eventType === "simulated_collection_task_created" &&
        Number(payload["dueTurn"]) === context.currentTurn + 1 &&
        !resolvedCommands.has(String(payload["commandId"])),
    );
    tasks.forEach((task, index) => {
      const targetId = String(task.payload["targetId"]);
      const indicator =
        (
          baseline.conflictBaseline.zoneIndicators as Readonly<
            Record<string, Readonly<Record<string, number>>>
          >
        )[targetId] ??
        (
          baseline.conflictBaseline.territoryIndicators as Readonly<
            Record<string, Readonly<Record<string, number>>>
          >
        )[targetId];
      draft.domainEvents.push({
        domainEventId: deriveSimulationId({
          entityType: "domain_event",
          campaignSeed: draft.meta.campaignSeed,
          resolutionKey: `collection-resolution:${String(task.payload["commandId"])}`,
          ordinal: index,
        }),
        turn: context.currentTurn,
        eventType: "simulated_collection_task_resolved",
        aggregateType: "campaign",
        aggregateId: draft.meta.campaignId,
        payload: {
          sourceCommandId: String(task.payload["commandId"]),
          targetId,
          outcome:
            indicator?.["uniqueEventCount"] === undefined
              ? "NO_NEW_VERIFIED_OBSERVATION"
              : "ADMITTED_BASELINE_EVIDENCE",
          ...(indicator?.["uniqueEventCount"] === undefined
            ? {}
            : { uniqueEventCount: indicator["uniqueEventCount"] }),
          baselineAsOf: baseline.asOfDate,
        },
      });
    });
  },
});

const productionTurnPort = (baseline: BaselinePackage) => {
  const registry = createInitialTurnResolverRegistry().map((resolver) =>
    resolver.resolverId === "intelligence_collection"
      ? collectionResolver(baseline)
      : resolver,
  );
  return {
    endTurn: async (input: unknown) => simulateEndTurn(input, registry),
  };
};

const targetForAction = (
  actionId: string,
  state: CampaignState,
): SubjectRef => {
  if (actionId === "action_simulated_collect_evidence") {
    return {
      kind: "zone",
      zoneId: Object.keys(state.world.zones)[0]!,
    } as SubjectRef;
  }
  if (actionId === "action_simulated_consult_counterpart") {
    return { kind: "actor", actorId: "actor_aes_liaison" } as SubjectRef;
  }
  return {
    kind: "institution",
    institutionId: "institution_government_mali",
  } as SubjectRef;
};

const actionLabels: Readonly<Record<string, string>> = {
  action_simulated_collect_evidence: "Collect verified evidence",
  action_simulated_consult_counterpart: "Consult a regional counterpart",
  action_simulated_request_authorization: "Advance simulated authorization",
};

const buildWorkspace = (
  state: CampaignState,
  scenario: ScenarioBundle,
): DecisionWorkspaceProjection => {
  const registry = new FactRegistry([
    {
      key: "player.secretariat_capacity",
      valueType: "number",
      allowedScopes: ["player_eligibility"],
      subjectKinds: [],
      resolverId: "production_player_capacity",
    },
  ]);
  const menu = buildKnowledgeSafeActionMenu({
    actions: actionDefinitions(scenario),
    factRegistry: registry,
    factSource: new KnownFactSource([
      {
        query: { fact: "player.secretariat_capacity" },
        resolution: {
          kind: "known",
          value: state.player.institutionalCapacity.secretariatCapacity,
        },
      },
    ]),
    costProfiles: costProfiles(scenario),
    forecasts: Object.fromEntries(
      actionDefinitions(scenario).map(({ actionId }) => [
        actionId,
        {
          likelyInstitutionalReactions: [],
          knownRisks: [],
          intelligenceGaps: [],
          implementationDependencies: [
            "SIMULATED: outcomes are limited to the approved opening-slice behavior.",
          ],
          confidence: ScoreSchema.parse(0),
        },
      ]),
    ),
  });
  const artifactVersions = state.versions;
  const actionOptions = menu.map((menuEntry) => {
    const entry =
      menuEntry.actionId === "action_simulated_request_authorization" &&
      !authorizationIsAvailable(state)
        ? {
            ...menuEntry,
            eligibility: {
              ruleResult: "false" as const,
              available: false,
              reasonCode: "KNOWN_REQUIREMENT_FAILED" as const,
            },
          }
        : menuEntry;
    return {
      optionId: `option-${entry.actionId}`,
      label: actionLabels[entry.actionId] ?? entry.actionId,
      request: {
        contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
        command: {
          commandId: `command_prod_${String(state.meta.revision)}_${entry.actionId}`,
          commandType: entry.commandType,
          campaignId: state.meta.campaignId,
          submittedTurn: state.meta.currentTurn,
          payload: {
            actionId: entry.actionId,
            targets: [targetForAction(entry.actionId, state)],
            terms: [],
          },
        },
        expectedRevision: state.meta.revision,
        expectedVersions: artifactVersions,
      },
      preview: {
        schemaVersion: 1 as const,
        projectionType: "action_preview" as const,
        campaignId: state.meta.campaignId,
        campaignRevision: state.meta.revision,
        action: entry,
      },
    };
  });
  return DecisionWorkspaceProjectionSchema.parse({
    schemaVersion: DECISION_WORKFLOW_SCHEMA_VERSION,
    contractVersion: DECISION_WORKFLOW_CONTRACT_VERSION,
    classification: "SIMULATED_PRODUCTION_DECISION_WORKSPACE",
    campaign: {
      schemaVersion: 1,
      projectionType: "campaign",
      campaignId: state.meta.campaignId,
      campaignRevision: state.meta.revision,
      currentTurn: state.meta.currentTurn,
      maxTurns: state.meta.maxTurns,
      currentDate: state.meta.currentDate,
      decisionsRemaining: state.meta.decisionsRemaining,
      decisionsPerTurn: state.meta.decisionsPerTurn,
      campaignStatus: state.meta.status,
      playerKnowledge: buildPlayerKnowledgeProjection(state),
    },
    actionOptions,
    journal: state.decisions.map((decision, decisionIndex) => ({
      entryId: `journal-${decision.decisionId}`,
      commandId: decision.commandId,
      decisionId: decision.decisionId,
      campaignRevision: decisionIndex + decision.turn,
      turn: decision.turn,
      sequenceWithinTurn: decision.sequenceWithinTurn,
      actionId: decision.actionId,
      actionLabel: actionLabels[decision.actionId] ?? decision.actionId,
      outcomeSummary:
        "SIMULATED: the decision and its approved costs were saved locally.",
      committedOn: monthForTurn(scenario.scenario.startDate, decision.turn),
    })),
    resolutionLedger: state.domainEvents
      .filter(({ eventType }) =>
        [
          "end_turn_completed",
          "simulated_collection_task_resolved",
          "simulated_consultation_memory_recorded",
          "simulated_authorization_step",
        ].includes(eventType),
      )
      .map((event, index) => ({
        entryId: `ledger-${event.domainEventId}`,
        commandId: String(
          event.payload["commandId"] ?? event.payload["sourceCommandId"],
        ),
        campaignRevision: Math.min(state.meta.revision, index + 1),
        resolvedTurn: event.turn,
        sequence: index + 1,
        category:
          event.eventType === "simulated_collection_task_resolved"
            ? "intelligence"
            : event.eventType === "simulated_consultation_memory_recorded"
              ? "institutions"
              : event.eventType === "simulated_authorization_step"
                ? "regional_conditions"
                : "implementation",
        summary:
          event.eventType === "end_turn_completed"
            ? `SIMULATED: month ${String(event.turn)} resolution completed.`
            : `SIMULATED: ${event.eventType.replaceAll("_", " ")}.`,
      })),
    endMonth: {
      available: state.meta.status === "active",
      ...(state.meta.status === "active"
        ? {}
        : { reason: "The campaign is complete." }),
      request: EndTurnRequestSchema.parse({
        contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
        command: {
          commandId: `command_prod_${String(state.meta.revision)}_end_turn`,
          commandType: "end_turn",
          campaignId: state.meta.campaignId,
          submittedTurn: state.meta.currentTurn,
          payload: {},
        },
        expectedRevision: state.meta.revision,
        expectedVersions: artifactVersions,
      }),
    },
  });
};

const parseMapFeatures = (value: unknown): readonly ProductionMapFeature[] => {
  const candidate = value as {
    basemap?: { admin1?: unknown };
  };
  if (!Array.isArray(candidate.basemap?.admin1)) {
    throw new TypeError("Production map bundle is missing basemap.admin1");
  }
  return candidate.basemap.admin1 as ProductionMapFeature[];
};

const slug = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

const buildMapDocuments = (
  state: CampaignState,
  baseline: BaselinePackage,
  manifest: MapArtifactManifest,
  mapValue: unknown,
): MapDocumentProjection => {
  const allowed = new Set(["MLI", "BFA", "NER", "TCD", "MRT"]);
  const features = parseMapFeatures(mapValue)
    .filter(({ a3 }) => allowed.has(a3))
    .map(({ a3, n, r }) => {
      const subjectId = `ne-admin1:${a3}:${slug(n)}`;
      const known =
        (
          baseline.conflictBaseline.zoneIndicators as Readonly<
            Record<string, Readonly<Record<string, number>>>
          >
        )[subjectId] !== undefined;
      return {
        type: "Feature" as const,
        id: subjectId,
        properties: {
          subject_kind: "zone" as const,
          subject_id: subjectId,
          source_layer: "admin1",
          display_label: n,
          knowledge_status: known ? ("known" as const) : ("unknown" as const),
        },
        geometry: { type: "Polygon" as const, coordinates: r },
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  const subjects = features.map((feature) => {
    const count = (
      baseline.conflictBaseline.zoneIndicators as Readonly<
        Record<string, Readonly<Record<string, number>>>
      >
    )[feature.id]?.["uniqueEventCount"];
    return {
      subject_kind: "zone" as const,
      subject_id: feature.id,
      display_label: feature.properties.display_label,
      knowledge_status: feature.properties.knowledge_status,
      dossier: {
        subject_id: feature.id,
        title: feature.properties.display_label,
        summary:
          count === undefined
            ? "No admitted historical conflict observation is available for this opening baseline."
            : `${String(count)} unique admitted conflict events were recorded through ${baseline.asOfDate}.`,
        sourceConfidence:
          count === undefined ? ("Not known" as const) : ("Known" as const),
        sections: [
          {
            heading: "What remains unknown" as const,
            statements: [
              "SIMULATED runtime conditions are not presented as observed facts.",
            ],
          },
        ],
        evidenceIds:
          count === undefined ? [] : [`evidence-baseline-${feature.id}`],
        assessmentIds: [],
      },
    };
  });
  const geometry = { type: "FeatureCollection" as const, features };
  const firstSubject = subjects[0]!;
  return MapDocumentProjectionSchema.parse({
    schemaVersion: 1,
    contractVersion: "0.1.0-test.1",
    classification: "SIMULATED_PRODUCTION_MAP_DOCUMENT_PROJECTION",
    campaignId: state.meta.campaignId,
    campaignRevision: state.meta.revision,
    mapArtifactManifest: manifest,
    renderTransport: "verified_local_json_bundle",
    geometryHash: hashCanonicalJson(geometry),
    geometry,
    labelGlyphProbe: "Burkinabè · Tillabéri · Ŋ",
    subjects,
    documents: [
      {
        documentId: "document-production-baseline-methodology",
        kind: "brief",
        metadata: {
          reference: baseline.baselineId,
          date: baseline.asOfDate,
          preparer: "African Mandate deterministic production compiler",
          status: "Issued",
          sourceConfidence: "Known",
          classification: "SIMULATED",
        },
        title: "Opening baseline and simulation disclosure",
        summary:
          "Observed event counts are source-attributed; all runtime positions, procedures, and balance values are fictional simulation design.",
        subjectIds: [firstSubject.subject_id],
        evidence: baseline.sourceManifest.sources.map((source) => ({
          evidenceId: `evidence-source-${source.sourceKey}`,
          heading: source.sourceName,
          statement:
            source.methodologyNote ??
            "Admitted by the production source audit.",
          sourceLabel: source.attributionText ?? source.sourceName,
          ...(source.dataAsOf === undefined
            ? {}
            : { observedDate: source.dataAsOf }),
          confidence: "known",
        })),
        assessments: [],
        unknowns: [
          "Chad conflict observations are unavailable in the admitted historical source slice.",
          "Displacement and unmeasured source-quality values remain unknown, not zero.",
        ],
      },
    ],
    productionGates: {
      realGeography: "VERIFIED_LOCAL_ARTIFACT",
      pmtilesPublication: "NOT_REQUIRED",
      assetTemporalAdmission: "NOT_IN_INITIAL_SLICE",
    },
  });
};

const refsMatch = (
  snapshot: Awaited<ReturnType<IndexedDbCampaignRepository["load"]>>,
  expected: CampaignArtifactRefs,
): boolean =>
  snapshot.snapshotVersion === 2 &&
  hashCanonicalJson(snapshot.artifacts) === hashCanonicalJson(expected);

export const createProductionRuntime = async (
  options: {
    readonly releaseManifestUrl?: string;
    readonly fetcher?: typeof fetch;
    readonly databaseName?: string;
    readonly indexedDb?: IDBFactory;
    readonly lockManager?: ConstructorParameters<
      typeof WebLocksCampaignEditLock
    >[0];
  } = {},
): Promise<ProductionRuntime> => {
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const registry = new BrowserArtifactRegistryClient({
    releaseManifestUrl:
      options.releaseManifestUrl ?? "/production/release.manifest.json",
    fetcher,
  });
  const release = await registry.loadReleaseManifest();
  const selected = Object.entries(release.scenarios).find(
    ([, entry]) => entry.defaultForNewCampaigns,
  );
  if (selected === undefined)
    throw new TypeError("Release has no default production scenario");
  const [scenarioId, entry] = selected;
  const campaignArtifacts = CampaignArtifactRefsSchema.parse({
    scenarioId,
    scenarioBundleSchemaVersion: entry.scenarioBundle.schemaVersion,
    scenarioBundleHash: entry.scenarioBundle.hash,
    baselineSchemaVersion: entry.baseline.schemaVersion,
    baselineHash: entry.baseline.hash,
    mapArtifactSchemaVersion: entry.mapArtifact.schemaVersion,
    mapArtifactHash: entry.mapArtifact.hash,
  });
  const { scenarioBundle, baseline, mapArtifactManifest } =
    await registry.resolveCampaignArtifacts({
      campaignArtifacts,
      scenarioBundle: entry.scenarioBundle,
      baseline: entry.baseline,
      mapArtifact: entry.mapArtifact,
      methodology: entry.methodology,
    });
  if (mapArtifactManifest.format !== "african_map_json_bundle") {
    throw new TypeError(
      "Production release requires the approved local JSON map bundle",
    );
  }
  const mapResponse = await fetcher(mapArtifactManifest.artifactUrl);
  if (!mapResponse.ok)
    throw new TypeError("Production map artifact could not be loaded");
  const mapText = await mapResponse.text();
  const actualMapHash = sha256Hex(mapText);
  if (actualMapHash !== mapArtifactManifest.artifactHash) {
    throw new ArtifactHashMismatchError(
      mapArtifactManifest.artifactUrl,
      mapArtifactManifest.artifactHash,
      actualMapHash,
    );
  }
  const mapValue: unknown = JSON.parse(mapText);
  const storage = await IndexedDbCampaignStorage.open({
    databaseName: options.databaseName ?? PRODUCTION_DATABASE_NAME,
    ...(options.indexedDb === undefined ? {} : { factory: options.indexedDb }),
  });
  const repository = new IndexedDbCampaignRepository(storage);
  let state: CampaignState;
  let recoveredFromSnapshot = false;
  try {
    const snapshot = await repository.load(PRODUCTION_CAMPAIGN_ID);
    if (!refsMatch(snapshot, campaignArtifacts)) {
      throw new CorruptCampaignSnapshotError(PRODUCTION_CAMPAIGN_ID);
    }
    state = snapshot.authoritativeState;
  } catch (error) {
    if (error instanceof CorruptCampaignSnapshotError) {
      const recovery = await repository.recoverLastValid(
        PRODUCTION_CAMPAIGN_ID,
      );
      if (!refsMatch(recovery, campaignArtifacts)) throw error;
      state = recovery.authoritativeState;
      recoveredFromSnapshot = true;
    } else {
      state = createInitialCampaign(scenarioBundle, baseline, {
        gameSchemaVersion: release.gameSchemaVersion,
        simulationModelVersion: entry.requiredSimulationModelVersion,
        baselineVersion: entry.baseline.baselineVersion,
        scenarioVersion: entry.scenarioVersion,
        contentVersion: entry.contentVersion,
        balanceProfileVersion: entry.balanceProfileVersion,
        methodologyVersion: entry.methodologyVersion,
      });
      try {
        await repository.writeLocal(
          createSaveSnapshot(state, campaignArtifacts),
        );
      } catch (writeError) {
        if (!(writeError instanceof StaleCampaignRevisionError))
          throw writeError;
        const snapshot = await repository.load(PRODUCTION_CAMPAIGN_ID);
        if (!refsMatch(snapshot, campaignArtifacts)) throw writeError;
        state = snapshot.authoritativeState;
      }
    }
  }
  const runtimeStore = new InMemoryCampaignRuntimeStore([state]);
  const coordinator = new SerialCampaignOperationCoordinator(
    new WebLocksCampaignEditLock(options.lockManager),
  );
  const commands = new AtomicCampaignCommandService({
    coordinator,
    simulation: productionCommandPort(scenarioBundle, baseline),
    repository,
    runtimeStore,
    artifactRefs: campaignArtifacts,
  });
  const turns = new AtomicCampaignTurnService({
    coordinator,
    simulation: productionTurnPort(baseline),
    repository,
    runtimeStore,
    artifactRefs: campaignArtifacts,
  });
  const projections = {
    load: async (campaignId: CampaignId, expectedRevision: number) => {
      const current = runtimeStore.load(campaignId);
      if (current.meta.revision !== expectedRevision) {
        throw new TypeError("Production projection revision mismatch");
      }
      return buildWorkspace(current, scenarioBundle);
    },
  };
  const workflowCoordinator = new DecisionWorkflowCoordinator({
    commands,
    turns,
    projections,
  });
  const initialProjection = buildWorkspace(state, scenarioBundle);
  return {
    recoveredFromSnapshot,
    initialProjection,
    mapDocuments: buildMapDocuments(
      state,
      baseline,
      mapArtifactManifest,
      mapValue,
    ),
    workflow: {
      initialProjection,
      commit: workflowCoordinator.commit.bind(workflowCoordinator),
      endMonth: workflowCoordinator.endMonth.bind(workflowCoordinator),
    },
    close: () => repository.close(),
  };
};
