import {
  CampaignStateSchema,
  CollectionResolutionPlanSchema,
  KNOWLEDGE_CONTRACT_VERSION,
  EndTurnSimulationInputSchema,
  EndTurnSimulationResultSchema,
  TURN_RESOLVER_IDS,
  WORLD_RESOLVER_CONTRACT_VERSION,
  IsoDateSchema,
  type CampaignState,
  type CollectionResolutionPlan,
  type EndTurnRejectionReason,
  type EndTurnSimulationInput,
  type EndTurnSimulationResult,
  type TurnResolverId,
  type TurnResolverSourceStep,
  type TurnResolverTrace,
  type BaselinePackage,
  type WorldEffectEnvelope,
  type WorldSubsystemId,
} from "@african-mandate/domain";

import { hashCanonicalJson } from "./determinism/canonical-json.js";
import { deriveSimulationId } from "./determinism/primitives.js";
import { reservedMandatoryDecisionSlots } from "./mandatory-attention.js";
import { resolveWorldEffects } from "./world-resolvers.js";
import { resolveIntelligenceCollection } from "./knowledge.js";

export interface TurnResolverContext {
  readonly currentTurn: number;
  readonly finalTurn: boolean;
}

export interface TurnResolverDefinition {
  readonly resolverId: TurnResolverId;
  readonly sourceStep: TurnResolverSourceStep;
  readonly adapterKind: "implemented" | "initial_no_op" | "test_only_fixture";
  resolve(draft: CampaignState, context: TurnResolverContext): void;
}

const resolverOrder = [
  ["scheduled_consequences", "2"],
  ["commitments", "3"],
  ["red_lines", "4"],
  ["authorization", "5"],
  ["implementations", "6"],
  ["actors_and_positions", "7"],
  ["world_conflict", "8a"],
  ["world_civilian", "8b"],
  ["world_infrastructure", "8c"],
  ["world_development", "8d"],
  ["world_external_environment", "8e"],
  ["event_director", "9"],
  ["world_event_immediate_effects", "10"],
  ["passive_observations", "11"],
  ["intelligence_collection", "12"],
  ["assessment_metadata", "13"],
  ["institutional_capacities", "14"],
  ["attention", "15"],
  ["doctrine", "16"],
  ["evaluation_snapshot", "17"],
  ["early_termination", "18"],
  ["final_evaluation", "19"],
] as const satisfies readonly (readonly [
  TurnResolverId,
  TurnResolverSourceStep,
])[];

const noopResolver = (
  resolverId: TurnResolverId,
  sourceStep: TurnResolverSourceStep,
): TurnResolverDefinition => ({
  resolverId,
  sourceStep,
  adapterKind: "initial_no_op",
  resolve: () => undefined,
});

const expireConsequencesPastTheirExplicitWindow = (
  draft: CampaignState,
  context: TurnResolverContext,
): void => {
  for (const consequence of Object.values(draft.scheduledConsequences)) {
    if (
      (consequence.status === "scheduled" ||
        consequence.status === "eligible") &&
      consequence.latestTurn !== undefined &&
      context.currentTurn > consequence.latestTurn
    ) {
      draft.scheduledConsequences[consequence.consequenceId] = {
        ...consequence,
        status: "expired",
      };
    }
  }
};

const preserveAttention = (): void => undefined;

export const createInitialTurnResolverRegistry =
  (): readonly TurnResolverDefinition[] =>
    resolverOrder.map(([resolverId, sourceStep]) => {
      if (resolverId === "scheduled_consequences") {
        return {
          resolverId,
          sourceStep,
          adapterKind: "implemented" as const,
          resolve: expireConsequencesPastTheirExplicitWindow,
        };
      }
      if (resolverId === "attention") {
        return {
          resolverId,
          sourceStep,
          adapterKind: "implemented" as const,
          resolve: preserveAttention,
        };
      }
      return noopResolver(resolverId, sourceStep);
    });

const worldPhaseSubsystems = {
  world_conflict: "conflict",
  world_civilian: "civilian",
  world_infrastructure: "infrastructure",
  world_development: "development",
} as const satisfies Partial<Record<TurnResolverId, WorldSubsystemId>>;

export interface TestOnlyWorldFixtureRegistryInput {
  readonly baseline: BaselinePackage;
  readonly effects: readonly WorldEffectEnvelope[];
}

export const createTestOnlyWorldFixtureResolverRegistry = (
  input: TestOnlyWorldFixtureRegistryInput,
): readonly TurnResolverDefinition[] => {
  const unsupported = input.effects.find(
    (envelope) =>
      !Object.values(worldPhaseSubsystems).includes(
        envelope.declaredSubsystem as (typeof worldPhaseSubsystems)[keyof typeof worldPhaseSubsystems],
      ),
  );
  if (unsupported !== undefined) {
    throw new TypeError(
      `Effect ${unsupported.effect.effectId} does not belong to a source-ordered world phase`,
    );
  }

  return createInitialTurnResolverRegistry().map((resolver) => {
    const subsystem = worldPhaseSubsystems[
      resolver.resolverId as keyof typeof worldPhaseSubsystems
    ] as WorldSubsystemId | undefined;
    if (subsystem === undefined) return resolver;
    const effects = input.effects.filter(
      (envelope) => envelope.declaredSubsystem === subsystem,
    );
    if (effects.length === 0) return resolver;
    return {
      ...resolver,
      adapterKind: "test_only_fixture" as const,
      resolve: (draft: CampaignState, context: TurnResolverContext) => {
        const result = resolveWorldEffects({
          contractVersion: WORLD_RESOLVER_CONTRACT_VERSION,
          classification: "TEST_ONLY_WORLD_RESOLUTION",
          turn: context.currentTurn,
          baseline: input.baseline,
          currentState: draft,
          effects,
        });
        if (result.status !== "resolved") {
          throw new TypeError(
            `World fixture resolver rejected: ${result.reasonCode}:${result.detailCode ?? ""}`,
          );
        }
        Object.assign(draft, result.nextState);
      },
    };
  });
};

export interface TestOnlyKnowledgeResolverRegistryInput {
  readonly plans: readonly CollectionResolutionPlan[];
  readonly baseRegistry?: readonly TurnResolverDefinition[];
}

export const createTestOnlyKnowledgeResolverRegistry = (
  input: TestOnlyKnowledgeResolverRegistryInput,
): readonly TurnResolverDefinition[] => {
  const plans = input.plans.map((plan) =>
    CollectionResolutionPlanSchema.parse(plan),
  );
  if (
    new Set(plans.map((plan) => plan.collectionTaskId)).size !== plans.length
  ) {
    throw new TypeError("Duplicate collection resolution plan");
  }
  const base = input.baseRegistry ?? createInitialTurnResolverRegistry();
  if (plans.length === 0) return base;
  return base.map((resolver) =>
    resolver.resolverId === "intelligence_collection"
      ? {
          ...resolver,
          adapterKind: "test_only_fixture" as const,
          resolve: (draft: CampaignState, context: TurnResolverContext) => {
            for (const plan of plans) {
              const task =
                draft.knowledge.collectionTasks[plan.collectionTaskId];
              if (task === undefined) {
                throw new TypeError(
                  `Collection resolution task not found: ${plan.collectionTaskId}`,
                );
              }
              if (task.status === "completed" || task.status === "failed") {
                continue;
              }
              if (task.dueTurn > context.currentTurn) continue;
              const result = resolveIntelligenceCollection({
                contractVersion: KNOWLEDGE_CONTRACT_VERSION,
                classification: "TEST_ONLY_COLLECTION_RESOLUTION",
                currentState: draft,
                plan,
              });
              if (result.status !== "resolved") {
                throw new TypeError(
                  `Collection resolver rejected: ${result.reasonCode}:${result.detailCode ?? ""}`,
                );
              }
              Object.assign(draft, result.nextState);
            }
          },
        }
      : resolver,
  );
};

const registryIsExact = (
  registry: readonly TurnResolverDefinition[],
): boolean =>
  registry.length === resolverOrder.length &&
  registry.every(
    (resolver, index) =>
      resolver.resolverId === resolverOrder[index]?.[0] &&
      resolver.sourceStep === resolverOrder[index]?.[1] &&
      resolver.resolverId === TURN_RESOLVER_IDS[index],
  );

export const advanceOneCalendarMonth = (
  isoDate: string,
): string | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(isoDate);
  if (match === null) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const candidate = `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = new Date(`${candidate}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== candidate
  ) {
    return undefined;
  }
  return candidate;
};

const versionsMatch = (
  expected: EndTurnSimulationInput["request"]["expectedVersions"],
  actual: CampaignState["versions"],
): boolean =>
  expected.gameSchemaVersion === actual.gameSchemaVersion &&
  expected.simulationModelVersion === actual.simulationModelVersion &&
  expected.baselineVersion === actual.baselineVersion &&
  expected.scenarioVersion === actual.scenarioVersion &&
  expected.contentVersion === actual.contentVersion &&
  expected.balanceProfileVersion === actual.balanceProfileVersion &&
  expected.methodologyVersion === actual.methodologyVersion;

const reject = (
  reasonCode: EndTurnRejectionReason,
  commandId?: EndTurnSimulationInput["request"]["command"]["commandId"],
  detailCode?: string,
): EndTurnSimulationResult =>
  EndTurnSimulationResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(commandId === undefined ? {} : { commandId }),
    ...(detailCode === undefined ? {} : { detailCode }),
  });

const originalEndTurn = (
  state: CampaignState,
  commandId: string,
): number | undefined => {
  const event = state.domainEvents.find(
    (candidate) =>
      candidate.eventType === "end_turn_completed" &&
      candidate.payload["commandId"] === commandId,
  );
  const resolvedTurn = event?.payload["resolvedTurn"];
  return typeof resolvedTurn === "number" && Number.isSafeInteger(resolvedTurn)
    ? resolvedTurn
    : undefined;
};

export const simulateEndTurn = (
  inputValue: unknown,
  registry: readonly TurnResolverDefinition[] = createInitialTurnResolverRegistry(),
): EndTurnSimulationResult => {
  const input = EndTurnSimulationInputSchema.safeParse(inputValue);
  if (!input.success) return reject("INVALID_REQUEST_SCHEMA");
  const { currentState, request } = input.data;
  const command = request.command;

  if (currentState.processedCommandIds[command.commandId] === true) {
    const originalResolvedTurn = originalEndTurn(
      currentState,
      command.commandId,
    );
    if (originalResolvedTurn === undefined) {
      return reject(
        "INVALID_SIMULATION_RESULT",
        command.commandId,
        "PROCESSED_END_TURN_WITHOUT_EVENT",
      );
    }
    return EndTurnSimulationResultSchema.parse({
      status: "duplicate",
      commandId: command.commandId,
      originalResolvedTurn,
    });
  }
  if (request.expectedRevision !== currentState.meta.revision) {
    return reject("REVISION_MISMATCH", command.commandId);
  }
  if (!versionsMatch(request.expectedVersions, currentState.versions)) {
    return reject("VERSION_MISMATCH", command.commandId);
  }
  if (currentState.meta.status !== "active") {
    return reject("CAMPAIGN_NOT_ACTIVE", command.commandId);
  }
  if (command.campaignId !== currentState.meta.campaignId) {
    return reject("CAMPAIGN_MISMATCH", command.commandId);
  }
  if (command.submittedTurn !== currentState.meta.currentTurn) {
    return reject("TURN_MISMATCH", command.commandId);
  }
  if (reservedMandatoryDecisionSlots(currentState) > 0) {
    return reject("BLOCKING_ATTENTION_REQUIRES_DECISION", command.commandId);
  }
  if (!registryIsExact(registry)) {
    return reject("INVALID_RESOLVER_REGISTRY", command.commandId);
  }

  const resolvedTurn = currentState.meta.currentTurn;
  const finalTurn = resolvedTurn === currentState.meta.maxTurns;
  const draft = structuredClone(currentState);
  const context: TurnResolverContext = { currentTurn: resolvedTurn, finalTurn };
  const resolverTrace: TurnResolverTrace[] = [];

  for (const resolver of registry) {
    if (resolver.resolverId === "final_evaluation" && !finalTurn) {
      resolverTrace.push({
        resolverId: resolver.resolverId,
        sourceStep: resolver.sourceStep,
        adapterKind: resolver.adapterKind,
        outcome: "skipped_not_final",
      });
      continue;
    }
    const before = hashCanonicalJson(draft);
    try {
      resolver.resolve(draft, context);
    } catch {
      return reject(
        "INVALID_SIMULATION_RESULT",
        command.commandId,
        `RESOLVER_FAILED:${resolver.resolverId}`,
      );
    }
    const validation = CampaignStateSchema.safeParse(draft);
    if (!validation.success) {
      return reject(
        "INVALID_SIMULATION_RESULT",
        command.commandId,
        `RESOLVER_INVALID_STATE:${resolver.resolverId}`,
      );
    }
    resolverTrace.push({
      resolverId: resolver.resolverId,
      sourceStep: resolver.sourceStep,
      adapterKind: resolver.adapterKind,
      outcome: before === hashCanonicalJson(draft) ? "no_change" : "applied",
    });
  }

  const mandatoryResponses = reservedMandatoryDecisionSlots(draft);
  if (mandatoryResponses > (finalTurn ? 0 : draft.meta.decisionsPerTurn)) {
    return reject("MANDATORY_RESPONSE_CAPACITY_EXCEEDED", command.commandId);
  }

  if (draft.meta.status === "active") {
    if (finalTurn) {
      draft.meta.status = "completed";
      draft.meta.decisionsRemaining = 0;
    } else {
      const nextDate = advanceOneCalendarMonth(draft.meta.currentDate);
      if (nextDate === undefined) {
        return reject("INVALID_CALENDAR_ADVANCE", command.commandId);
      }
      draft.meta.currentTurn += 1;
      draft.meta.currentDate = IsoDateSchema.parse(nextDate);
      draft.meta.decisionsRemaining = draft.meta.decisionsPerTurn;
    }
  }

  const domainEventId = deriveSimulationId({
    entityType: "domain_event",
    campaignSeed: currentState.meta.campaignSeed,
    resolutionKey: `end_turn:${command.commandId}`,
    ordinal: 0,
  });
  draft.domainEvents.push({
    domainEventId,
    turn: resolvedTurn,
    eventType: "end_turn_completed",
    aggregateType: "campaign",
    aggregateId: currentState.meta.campaignId,
    payload: {
      commandId: command.commandId,
      resolvedTurn,
      finalTurn,
      resolverContractVersion: "1.1.0",
      resolverOrder: resolverTrace.map((entry) => entry.resolverId),
    },
  });
  draft.processedCommandIds[command.commandId] = true;
  draft.meta.revision += 1;

  const nextState = CampaignStateSchema.safeParse(draft);
  if (!nextState.success) {
    return reject(
      "INVALID_SIMULATION_RESULT",
      command.commandId,
      "CAMPAIGN_STATE_VALIDATION_FAILED",
    );
  }
  return EndTurnSimulationResultSchema.parse({
    status: "committed",
    commandId: command.commandId,
    resolvedTurn,
    finalTurn,
    resolverTrace,
    nextState: nextState.data,
  });
};

export class InProcessEndTurnDispatcher {
  readonly #registry: readonly TurnResolverDefinition[];

  public constructor(
    registry: readonly TurnResolverDefinition[] = createInitialTurnResolverRegistry(),
  ) {
    this.#registry = registry;
  }

  public endTurn(input: unknown): Promise<EndTurnSimulationResult> {
    return Promise.resolve(simulateEndTurn(input, this.#registry));
  }
}
