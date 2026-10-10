import {
  ActionDefinitionSchema,
  CampaignStateSchema,
  DecisionIdSchema,
  KnownCostProfileSchema,
  ScoreSchema,
  StrategicCommandSimulationInputSchema,
  StrategicCommandSimulationResultSchema,
  type ActionDefinition,
  type AtomicCommandRejectionReason,
  type CampaignState,
  type KnownCostProfile,
  type KnowledgeEffectProfile,
  type CollectionTaskTemplate,
  type PreviewCost,
  type StrategicCommandSimulationInput,
  type StrategicCommandSimulationResult,
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
  if (
    action.immediateEffectProfileIds.length > 0 &&
    (options.knowledgeEffectProfiles === undefined ||
      options.collectionTaskTemplates === undefined)
  ) {
    return reject("UNSUPPORTED_IMMEDIATE_EFFECT_PROFILE", command.commandId);
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
  try {
    createdCollectionTaskIds = [
      ...createCollectionTasksFromKnowledgeProfiles(
        nextState,
        options.knowledgeEffectProfiles ?? [],
        options.collectionTaskTemplates ?? [],
        action.immediateEffectProfileIds,
        decisionId,
      ),
    ];
  } catch {
    return reject(
      "CONFIGURATION_ERROR",
      command.commandId,
      "COLLECTION_TASK_CREATION_FAILED",
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

  return StrategicCommandSimulationResultSchema.parse({
    status: "committed",
    commandId: command.commandId,
    decisionRecord,
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
