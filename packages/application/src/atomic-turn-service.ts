import {
  AtomicEndTurnResultSchema,
  CampaignStateSchema,
  EndTurnRequestSchema,
  EndTurnSimulationResultSchema,
  type AtomicEndTurnResult,
  type CampaignState,
  type EndTurnRequest,
  type EndTurnRejectionReason,
  type EndTurnSimulationInput,
  type EndTurnSimulationResult,
} from "@african-mandate/domain";
import { hashCanonicalJson } from "@african-mandate/simulation";

import {
  CampaignPersistenceError,
  CampaignRuntimeStateNotFoundError,
  createSaveSnapshot,
  type AtomicCommandRepositoryTypes,
  type CampaignRuntimeStore,
} from "./atomic-command-service.js";
import type {
  CampaignOperationCoordinator,
  CampaignRepository,
  SimulationPort,
  SimulationPortTypes,
} from "./ports.js";

export interface EndTurnSimulationPortTypes extends SimulationPortTypes {
  readonly command: never;
  readonly commandResult: never;
  readonly turnCommand: EndTurnSimulationInput;
  readonly turnResult: EndTurnSimulationResult;
  readonly initializationInput: never;
  readonly campaignState: CampaignState;
  readonly projectionRequest: never;
  readonly playerProjection: never;
}

export type EndTurnSimulationPort = Pick<
  SimulationPort<EndTurnSimulationPortTypes>,
  "endTurn"
>;

const rejected = (
  reasonCode: EndTurnRejectionReason,
  options: {
    readonly request?: EndTurnRequest;
    readonly detailCode?: string;
    readonly currentState?: CampaignState;
  } = {},
): AtomicEndTurnResult =>
  AtomicEndTurnResultSchema.parse({
    status: "rejected",
    idempotent: false,
    reasonCode,
    ...(options.request === undefined
      ? {}
      : { commandId: options.request.command.commandId }),
    ...(options.detailCode === undefined
      ? {}
      : { detailCode: options.detailCode }),
    ...(options.currentState === undefined
      ? {}
      : {
          campaignRevision: options.currentState.meta.revision,
          authoritativeStateHash: hashCanonicalJson(options.currentState),
        }),
  });

const committedResultIsValid = (
  currentState: CampaignState,
  result: Extract<EndTurnSimulationResult, { status: "committed" }>,
): boolean => {
  const nextState = CampaignStateSchema.safeParse(result.nextState);
  if (!nextState.success) return false;
  if (nextState.data.meta.campaignId !== currentState.meta.campaignId)
    return false;
  if (nextState.data.meta.revision !== currentState.meta.revision + 1)
    return false;
  if (nextState.data.processedCommandIds[result.commandId] !== true)
    return false;
  return nextState.data.domainEvents.some(
    (event) =>
      event.eventType === "end_turn_completed" &&
      event.payload["commandId"] === result.commandId,
  );
};

export class AtomicCampaignTurnService {
  readonly #coordinator: CampaignOperationCoordinator;
  readonly #simulation: EndTurnSimulationPort;
  readonly #repository: CampaignRepository<AtomicCommandRepositoryTypes>;
  readonly #runtimeStore: CampaignRuntimeStore;

  public constructor(options: {
    readonly coordinator: CampaignOperationCoordinator;
    readonly simulation: EndTurnSimulationPort;
    readonly repository: CampaignRepository<AtomicCommandRepositoryTypes>;
    readonly runtimeStore: CampaignRuntimeStore;
  }) {
    this.#coordinator = options.coordinator;
    this.#simulation = options.simulation;
    this.#repository = options.repository;
    this.#runtimeStore = options.runtimeStore;
  }

  public async endTurn(requestValue: unknown): Promise<AtomicEndTurnResult> {
    const request = EndTurnRequestSchema.safeParse(requestValue);
    if (!request.success) return rejected("INVALID_REQUEST_SCHEMA");
    const campaignId = request.data.command.campaignId;

    return this.#coordinator.runExclusive(campaignId, "end_turn", async () => {
      let currentState: CampaignState;
      try {
        currentState = this.#runtimeStore.load(campaignId);
      } catch (error) {
        if (error instanceof CampaignRuntimeStateNotFoundError) {
          return rejected("CAMPAIGN_NOT_FOUND", { request: request.data });
        }
        throw error;
      }

      const currentHash = hashCanonicalJson(currentState);
      const rawResult = await this.#simulation.endTurn({
        request: request.data,
        currentState,
      });
      const parsedResult = EndTurnSimulationResultSchema.safeParse(rawResult);
      if (!parsedResult.success) {
        return rejected("INVALID_SIMULATION_RESULT", {
          request: request.data,
          detailCode: "RESULT_SCHEMA_INVALID",
          currentState,
        });
      }
      if (hashCanonicalJson(currentState) !== currentHash) {
        return rejected("INVALID_SIMULATION_RESULT", {
          request: request.data,
          detailCode: "SIMULATION_MUTATED_CURRENT_STATE",
          currentState,
        });
      }

      const result = parsedResult.data;
      if (result.status === "rejected") {
        return rejected(result.reasonCode, {
          request: request.data,
          ...(result.detailCode === undefined
            ? {}
            : { detailCode: result.detailCode }),
          currentState,
        });
      }
      if (result.status === "duplicate") {
        return AtomicEndTurnResultSchema.parse({
          status: "duplicate",
          idempotent: true,
          commandId: result.commandId,
          originalResolvedTurn: result.originalResolvedTurn,
          campaignRevision: currentState.meta.revision,
          authoritativeStateHash: currentHash,
        });
      }
      if (!committedResultIsValid(currentState, result)) {
        return rejected("INVALID_SIMULATION_RESULT", {
          request: request.data,
          detailCode: "COMMIT_INVARIANT_FAILED",
          currentState,
        });
      }

      const snapshot = createSaveSnapshot(result.nextState);
      try {
        await this.#repository.writeLocal(snapshot);
      } catch (error) {
        throw new CampaignPersistenceError(campaignId, error);
      }
      this.#runtimeStore.replace(snapshot.authoritativeState);

      return AtomicEndTurnResultSchema.parse({
        status: "committed",
        idempotent: false,
        commandId: result.commandId,
        resolvedTurn: result.resolvedTurn,
        currentTurn: snapshot.authoritativeState.meta.currentTurn,
        currentDate: snapshot.authoritativeState.meta.currentDate,
        finalTurn: result.finalTurn,
        campaignRevision: snapshot.campaignRevision,
        authoritativeStateHash: snapshot.authoritativeStateHash,
        resolverTrace: result.resolverTrace,
      });
    });
  }
}
