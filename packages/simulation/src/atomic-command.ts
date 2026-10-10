import {
  ActionDefinitionSchema,
  ASSESSMENT_CONTRACT_VERSION,
  CampaignStateSchema,
  DecisionIdSchema,
  KnownCostProfileSchema,
  ScoreSchema,
  StrategicCommandSimulationInputSchema,
  StrategicCommandSimulationResultSchema,
  type ActionDefinition,
  type ActorMemoryEffectProfile,
  type AssessmentActionBinding,
  type AssessmentConfidenceBandProfile,
  type AssessmentMetadataProfile,
  type AuthoredAssessmentHypothesis,
  type AtomicCommandRejectionReason,
  type CampaignState,
  type KnownCostProfile,
  type KnowledgeEffectProfile,
  type CollectionTaskTemplate,
  type PreviewCost,
  type StrategicCommandSimulationInput,
  type StrategicCommandSimulationResult,
  type TestOnlyMemoryTemplate,
} from "@african-mandate/domain";

import {
  FactRegistry,
  KnownFactSource,
  prepareStrategicCommand,
  type StructuralActionValidator,
} from "./command-rules.js";
import { deriveSimulationId } from "./determinism/primitives.js";
import {
  mandatoryResponseItem,
  reservedMandatoryDecisionSlots,
  resolveMandatoryAttentionItem,
} from "./mandatory-attention.js";
import { createCollectionTasksFromKnowledgeProfiles } from "./knowledge.js";
import { createMemoriesFromActorProfiles } from "./actors.js";
import { resolveAssessmentCommand } from "./assessments.js";

export interface AssessmentCommandConfiguration {
  readonly actionBindings: readonly AssessmentActionBinding[];
  readonly hypotheses: readonly AuthoredAssessmentHypothesis[];
  readonly confidenceProfile: AssessmentConfidenceBandProfile;
  readonly metadataProfile: AssessmentMetadataProfile;
}

export interface InProcessStrategicCommandDispatcherOptions {
  readonly actions: readonly ActionDefinition[];
  readonly factRegistry: FactRegistry;
  readonly factSource: KnownFactSource;
  readonly costProfiles: readonly KnownCostProfile[];
  readonly structuralValidators: Readonly<
    Record<string, StructuralActionValidator | undefined>
  >;
  readonly knowledgeEffectProfiles?: readonly KnowledgeEffectProfile[];
  readonly collectionTaskTemplates?: readonly CollectionTaskTemplate[];
  readonly actorMemoryEffectProfiles?: readonly ActorMemoryEffectProfile[];
  readonly memoryTemplates?: readonly TestOnlyMemoryTemplate[];
  readonly assessments?: AssessmentCommandConfiguration;
}

const reject = (
  reasonCode: AtomicCommandRejectionReason,
  commandId?: StrategicCommandSimulationInput["request"]["command"]["commandId"],
  detailCode?: string,
): StrategicCommandSimulationResult =>
  StrategicCommandSimulationResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(commandId === undefined ? {} : { commandId }),
    ...(detailCode === undefined ? {} : { detailCode }),
  });

const versionsMatch = (
  expected: StrategicCommandSimulationInput["request"]["expectedVersions"],
  actual: CampaignState["versions"],
): boolean =>
  expected.gameSchemaVersion === actual.gameSchemaVersion &&
  expected.simulationModelVersion === actual.simulationModelVersion &&
  expected.baselineVersion === actual.baselineVersion &&
  expected.scenarioVersion === actual.scenarioVersion &&
  expected.contentVersion === actual.contentVersion &&
  expected.balanceProfileVersion === actual.balanceProfileVersion &&
  expected.methodologyVersion === actual.methodologyVersion;

const costProfileForAction = (
  action: ActionDefinition,
  profiles: readonly KnownCostProfile[],
): KnownCostProfile | undefined => {
  if (action.knownCostProfileId === undefined) return undefined;
  return profiles.find(
    (profile) => profile.knownCostProfileId === action.knownCostProfileId,
  );
};

const applyKnownCost = (
  player: CampaignState["player"],
  cost: PreviewCost,
): void => {
  if (cost.costType === "budget") {
    if (cost.money === undefined)
      throw new TypeError("Budget cost is missing money");
    player.materialResources.budget.amount -= cost.money.amount;
    return;
  }
  if (cost.amount === undefined)
    throw new TypeError("Known cost is missing amount");
  if (cost.costType === "personnel") {
    player.materialResources.personnel -= cost.amount;
    return;
  }
  if (cost.costType === "political_capital") {
    player.institutionalCapacity.politicalCapital = ScoreSchema.parse(
      player.institutionalCapacity.politicalCapital - cost.amount,
    );
    return;
  }
  if (cost.costType === "secretariat_capacity") {
    player.institutionalCapacity.secretariatCapacity = ScoreSchema.parse(
      player.institutionalCapacity.secretariatCapacity - cost.amount,
    );
    return;
  }
  player.institutionalCapacity.implementationCapacity = ScoreSchema.parse(
    player.institutionalCapacity.implementationCapacity - cost.amount,
  );
};

export const simulateStrategicCommand = (
  inputValue: unknown,
  options: InProcessStrategicCommandDispatcherOptions,
): StrategicCommandSimulationResult => {
  const parsedInput =
    StrategicCommandSimulationInputSchema.safeParse(inputValue);
  if (!parsedInput.success) return reject("INVALID_REQUEST_SCHEMA");
  const { currentState, request } = parsedInput.data;
  const command = request.command;

  if (currentState.processedCommandIds[command.commandId] === true) {
    const original = currentState.decisions.find(
      (decision) => decision.commandId === command.commandId,
    );
    if (original === undefined) {
      return reject(
        "CONFIGURATION_ERROR",
        command.commandId,
        "PROCESSED_COMMAND_WITHOUT_DECISION",
      );
    }
    return StrategicCommandSimulationResultSchema.parse({
      status: "duplicate",
      commandId: command.commandId,
      decisionRecord: original,
    });
  }

  if (request.expectedRevision !== currentState.meta.revision) {
    return reject("REVISION_MISMATCH", command.commandId);
  }
  if (!versionsMatch(request.expectedVersions, currentState.versions)) {
    return reject("VERSION_MISMATCH", command.commandId);
  }

  const reservedSlots = reservedMandatoryDecisionSlots(currentState);
  const mandatoryResponseId = request.mandatoryResponseAttentionItemId;
  if (reservedSlots > currentState.meta.decisionsRemaining) {
    return reject("MANDATORY_RESPONSE_SOFTLOCK", command.commandId);
  }
  if (
    mandatoryResponseId !== undefined &&
    mandatoryResponseItem(currentState, mandatoryResponseId) === undefined
  ) {
    return reject("INVALID_MANDATORY_RESPONSE", command.commandId);
  }
  if (
    mandatoryResponseId === undefined &&
    currentState.meta.decisionsRemaining <= reservedSlots
  ) {
    return reject("DECISION_SLOTS_RESERVED", command.commandId);
  }

  const preparation = prepareStrategicCommand({
    command,
    campaign: currentState,
    actions: options.actions,
    factRegistry: options.factRegistry,
    factSource: options.factSource,
    costProfiles: options.costProfiles,
    structuralValidators: options.structuralValidators,
  });

  if (preparation.status === "rejected") {
    return reject(
      preparation.reasonCode,
      preparation.commandId,
      preparation.detailCode,
    );
  }
  if (preparation.status === "duplicate") {
    return reject(
      "CONFIGURATION_ERROR",
      command.commandId,
      "DUPLICATE_CLASSIFICATION_WITHOUT_PRIOR_DECISION",
    );
  }

  const actionResult = ActionDefinitionSchema.safeParse(
    options.actions.find(
      (candidate) => candidate.actionId === preparation.actionId,
    ),
  );
  if (!actionResult.success) {
    return reject(
      "CONFIGURATION_ERROR",
      command.commandId,
      "ACTION_NOT_RESOLVED",
    );
  }
  const action = actionResult.data;
  if (action.decisionSlotCost !== 1) {
    return reject("CONSEQUENTIAL_SLOT_COST_REQUIRED", command.commandId);
  }
  const knowledgeProfileIds = new Set(
    (options.knowledgeEffectProfiles ?? []).map(
      (profile) => profile.effectProfileId,
    ),
  );
  const actorProfileIds = new Set(
    (options.actorMemoryEffectProfiles ?? []).map(
      (profile) => profile.effectProfileId,
    ),
  );
  const assessmentProfileIds = new Set(
    (options.assessments?.actionBindings ?? []).map(
      (binding) => binding.effectProfileId,
    ),
  );
  for (const profileId of action.immediateEffectProfileIds) {
    const owners =
      Number(knowledgeProfileIds.has(profileId)) +
      Number(actorProfileIds.has(profileId)) +
      Number(assessmentProfileIds.has(profileId));
    if (owners === 0) {
      return reject("UNSUPPORTED_IMMEDIATE_EFFECT_PROFILE", command.commandId);
    }
    if (owners > 1) {
      return reject(
        "CONFIGURATION_ERROR",
        command.commandId,
        "AMBIGUOUS_IMMEDIATE_EFFECT_PROFILE",
      );
    }
  }
  if (
    action.immediateEffectProfileIds.some((id) =>
      knowledgeProfileIds.has(id),
    ) &&
    options.collectionTaskTemplates === undefined
  ) {
    return reject("UNSUPPORTED_IMMEDIATE_EFFECT_PROFILE", command.commandId);
  }
  if (
    action.immediateEffectProfileIds.some((id) => actorProfileIds.has(id)) &&
    options.memoryTemplates === undefined
  ) {
    return reject("UNSUPPORTED_IMMEDIATE_EFFECT_PROFILE", command.commandId);
  }
  const assessmentBinding = options.assessments?.actionBindings.find(
    (binding) => binding.actionId === action.actionId,
  );
  const selectedAssessmentProfileIds = action.immediateEffectProfileIds.filter(
    (profileId) => assessmentProfileIds.has(profileId),
  );
  if (
    (assessmentBinding === undefined &&
      selectedAssessmentProfileIds.length > 0) ||
    (assessmentBinding !== undefined &&
      (selectedAssessmentProfileIds.length !== 1 ||
        selectedAssessmentProfileIds[0] !== assessmentBinding.effectProfileId))
  ) {
    return reject(
      "CONFIGURATION_ERROR",
      command.commandId,
      "ASSESSMENT_ACTION_BINDING_MISMATCH",
    );
  }
  if (action.consequenceProfileIds.length > 0) {
    return reject("UNSUPPORTED_CONSEQUENCE_PROFILE", command.commandId);
  }

  const profileValue = costProfileForAction(action, options.costProfiles);
  const profile =
    profileValue === undefined
      ? undefined
      : KnownCostProfileSchema.parse(profileValue);
  if (profile?.costs.some((cost) => cost.certainty !== "known") === true) {
    return reject("UNSUPPORTED_ESTIMATED_COST", command.commandId);
  }

  const nextState = structuredClone(currentState);
  try {
    profile?.costs.forEach((cost) => applyKnownCost(nextState.player, cost));
  } catch {
    return reject(
      "CONFIGURATION_ERROR",
      command.commandId,
      "COST_APPLICATION_FAILED",
    );
  }

  const resolutionKey = `command:${command.commandId}`;
  const decisionId = DecisionIdSchema.parse(
    deriveSimulationId({
      entityType: "decision",
      campaignSeed: currentState.meta.campaignSeed,
      resolutionKey,
      ordinal: 0,
    }),
  );
  const domainEventId = deriveSimulationId({
    entityType: "domain_event",
    campaignSeed: currentState.meta.campaignSeed,
    resolutionKey,
    ordinal: 0,
  });
  const decisionRecord = {
    decisionId,
    commandId: command.commandId,
    turn: currentState.meta.currentTurn,
    sequenceWithinTurn:
      currentState.decisions.filter(
        (decision) => decision.turn === currentState.meta.currentTurn,
      ).length + 1,
    actionId: action.actionId,
    targets: command.payload.targets,
    assessmentIds: [],
    decisionSlotCost: 1,
    createdDomainEventIds: [domainEventId],
    createdConsequenceIds: [],
    doctrineDelta: action.doctrineSignal,
  };

  nextState.decisions.push(decisionRecord);
  let createdCollectionTaskIds: string[];
  let createdMemoryIds: string[];
  let assessmentTrace:
    | Extract<
        ReturnType<typeof resolveAssessmentCommand>,
        { status: "resolved" }
      >["trace"]
    | undefined;
  try {
    const selectedKnowledgeProfileIds = action.immediateEffectProfileIds.filter(
      (profileId) => knowledgeProfileIds.has(profileId),
    );
    const selectedActorProfileIds = action.immediateEffectProfileIds.filter(
      (profileId) => actorProfileIds.has(profileId),
    );
    createdCollectionTaskIds = [
      ...createCollectionTasksFromKnowledgeProfiles(
        nextState,
        options.knowledgeEffectProfiles ?? [],
        options.collectionTaskTemplates ?? [],
        selectedKnowledgeProfileIds,
        decisionId,
      ),
    ];
    createdMemoryIds = createMemoriesFromActorProfiles(
      nextState,
      options.actorMemoryEffectProfiles ?? [],
      options.memoryTemplates ?? [],
      selectedActorProfileIds,
      decisionId,
    ).map((trace) => trace.memoryId);
    if (assessmentBinding !== undefined) {
      if (command.payload.terms.length !== 1) {
        throw new TypeError("Assessment command requires exactly one term");
      }
      const assessmentResult = resolveAssessmentCommand({
        contractVersion: ASSESSMENT_CONTRACT_VERSION,
        classification: "TEST_ONLY_ASSESSMENT_COMMAND",
        currentState: nextState,
        sourceDecisionId: decisionId,
        actionId: action.actionId,
        actionBindings: options.assessments!.actionBindings,
        hypotheses: options.assessments!.hypotheses,
        confidenceProfile: options.assessments!.confidenceProfile,
        metadataProfile: options.assessments!.metadataProfile,
        term: command.payload.terms[0],
      });
      if (assessmentResult.status !== "resolved") {
        throw new TypeError(
          `Assessment command rejected: ${assessmentResult.reasonCode}:${assessmentResult.detailCode ?? ""}`,
        );
      }
      Object.assign(nextState, assessmentResult.nextState);
      assessmentTrace = assessmentResult.trace;
    }
  } catch {
    return reject(
      "CONFIGURATION_ERROR",
      command.commandId,
      "IMMEDIATE_EFFECT_APPLICATION_FAILED",
    );
  }
  nextState.domainEvents.push({
    domainEventId,
    turn: currentState.meta.currentTurn,
    eventType: "strategic_command_committed",
    aggregateType: "campaign",
    aggregateId: currentState.meta.campaignId,
    sourceDecisionId: decisionId,
    payload: {
      commandId: command.commandId,
      actionId: action.actionId,
      createdCollectionTaskIds,
      createdMemoryIds,
      ...(assessmentTrace === undefined
        ? {}
        : {
            assessmentTrace: {
              operation: assessmentTrace.operation,
              assessmentId: assessmentTrace.assessmentId,
              automaticallyDisplayedContradictoryEvidenceIds:
                assessmentTrace.automaticallyDisplayedContradictoryEvidenceIds,
              ...(assessmentTrace.previousAssessmentId === undefined
                ? {}
                : {
                    previousAssessmentId: assessmentTrace.previousAssessmentId,
                  }),
              ...(assessmentTrace.declaredConfidenceBand === undefined
                ? {}
                : {
                    declaredConfidenceBand:
                      assessmentTrace.declaredConfidenceBand,
                  }),
            },
          }),
    },
  });
  nextState.processedCommandIds[command.commandId] = true;
  nextState.meta.decisionsRemaining -= 1;
  if (mandatoryResponseId !== undefined) {
    resolveMandatoryAttentionItem(nextState, mandatoryResponseId);
  }
  if (
    reservedMandatoryDecisionSlots(nextState) >
    nextState.meta.decisionsRemaining
  ) {
    return reject("MANDATORY_RESPONSE_SOFTLOCK", command.commandId);
  }
  nextState.meta.revision += 1;

  const validatedState = CampaignStateSchema.safeParse(nextState);
  if (!validatedState.success) {
    return reject(
      "INVALID_SIMULATION_RESULT",
      command.commandId,
      "CAMPAIGN_STATE_VALIDATION_FAILED",
    );
  }

  const committedDecisionRecord = validatedState.data.decisions.find(
    (decision) => decision.decisionId === decisionId,
  );
  if (committedDecisionRecord === undefined) {
    return reject(
      "INVALID_SIMULATION_RESULT",
      command.commandId,
      "COMMITTED_DECISION_NOT_FOUND",
    );
  }
  return StrategicCommandSimulationResultSchema.parse({
    status: "committed",
    commandId: command.commandId,
    decisionRecord: committedDecisionRecord,
    nextState: validatedState.data,
  });
};

export class InProcessStrategicCommandDispatcher {
  readonly #options: InProcessStrategicCommandDispatcherOptions;

  public constructor(options: InProcessStrategicCommandDispatcherOptions) {
    this.#options = options;
  }

  public dispatch(input: unknown): Promise<StrategicCommandSimulationResult> {
    return Promise.resolve(simulateStrategicCommand(input, this.#options));
  }
}
