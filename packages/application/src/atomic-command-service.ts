import {
  AtomicStrategicCommandRequestSchema,
  AtomicStrategicCommandResultSchema,
  CampaignStateSchema,
  SAVE_SNAPSHOT_VERSION,
  SaveSnapshotSchema,
  StrategicCommandSimulationResultSchema,
  type AtomicStrategicCommandRequest,
  type AtomicStrategicCommandResult,
  type CampaignId,
  type CampaignState,
  type SaveSnapshot,
  type StrategicCommandSimulationInput,
  type StrategicCommandSimulationResult,
} from "@african-mandate/domain";
import {
  freezeJsonSnapshot,
  hashCanonicalJson,
} from "@african-mandate/simulation";

import type {
  CampaignOperationCoordinator,
  CampaignRepository,
  CampaignRepositoryTypes,
  SimulationPort,
  SimulationPortTypes,
} from "./ports.js";

export interface AtomicCommandRepositoryTypes extends CampaignRepositoryTypes {
  readonly snapshot: SaveSnapshot;
  readonly cloudSyncResult: unknown;
}

export interface AtomicCommandSimulationPortTypes extends SimulationPortTypes {
  readonly command: StrategicCommandSimulationInput;
  readonly commandResult: StrategicCommandSimulationResult;
  readonly turnCommand: never;
  readonly turnResult: never;
  readonly initializationInput: never;
  readonly campaignState: CampaignState;
  readonly projectionRequest: never;
  readonly playerProjection: never;
}

export type StrategicCommandSimulationPort = Pick<
  SimulationPort<AtomicCommandSimulationPortTypes>,
  "dispatch"
>;

export interface CampaignRuntimeStore {
  load(campaignId: CampaignId): CampaignState;
  replace(state: CampaignState): void;
}

export class CampaignRuntimeStateNotFoundError extends Error {
  public constructor(campaignId: CampaignId) {
    super(`Campaign runtime state not found: ${campaignId}`);
    this.name = "CampaignRuntimeStateNotFoundError";
  }
}

export class CampaignPersistenceError extends Error {
  public constructor(campaignId: CampaignId, cause: unknown) {
    super(`Durable campaign write failed: ${campaignId}`, { cause });
    this.name = "CampaignPersistenceError";
  }
}

export class InMemoryCampaignRuntimeStore implements CampaignRuntimeStore {
  readonly #states = new Map<CampaignId, CampaignState>();

  public constructor(initialStates: readonly CampaignState[] = []) {
    initialStates.forEach((state) => this.replace(state));
  }

  public load(campaignId: CampaignId): CampaignState {
    const state = this.#states.get(campaignId);
    if (state === undefined) {
      throw new CampaignRuntimeStateNotFoundError(campaignId);
    }
    return state;
  }

  public replace(stateValue: CampaignState): void {
    const state = CampaignStateSchema.parse(stateValue);
    freezeJsonSnapshot(state);
    this.#states.set(state.meta.campaignId, state);
  }
}

export const createSaveSnapshot = (stateValue: CampaignState): SaveSnapshot => {
  const state = CampaignStateSchema.parse(stateValue);
  const authoritativeStateHash = hashCanonicalJson(state);
  return SaveSnapshotSchema.parse({
    snapshotVersion: SAVE_SNAPSHOT_VERSION,
    campaignId: state.meta.campaignId,
    campaignRevision: state.meta.revision,
    versions: state.versions,
    authoritativeState: state,
    authoritativeStateHash,
  });
};

export const saveSnapshotHashIsValid = (snapshotValue: unknown): boolean => {
  const parsed = SaveSnapshotSchema.safeParse(snapshotValue);
  return (
    parsed.success &&
    hashCanonicalJson(parsed.data.authoritativeState) ===
      parsed.data.authoritativeStateHash
  );
};

const versionsMatch = (
  left: CampaignState["versions"],
  right: CampaignState["versions"],
): boolean =>
  left.gameSchemaVersion === right.gameSchemaVersion &&
  left.simulationModelVersion === right.simulationModelVersion &&
  left.baselineVersion === right.baselineVersion &&
  left.scenarioVersion === right.scenarioVersion &&
  left.contentVersion === right.contentVersion &&
  left.balanceProfileVersion === right.balanceProfileVersion &&
  left.methodologyVersion === right.methodologyVersion;

const committedResultIsValid = (
  current: CampaignState,
  simulationResult: Extract<
    StrategicCommandSimulationResult,
    { status: "committed" }
  >,
): boolean => {
  const next = simulationResult.nextState;
  const decision = simulationResult.decisionRecord;
  return (
    next.meta.campaignId === current.meta.campaignId &&
    next.meta.revision === current.meta.revision + 1 &&
    next.meta.decisionsRemaining === current.meta.decisionsRemaining - 1 &&
    versionsMatch(next.versions, current.versions) &&
    next.decisions.length === current.decisions.length + 1 &&
    next.decisions.at(-1)?.decisionId === decision.decisionId &&
    decision.commandId === simulationResult.commandId &&
    decision.decisionSlotCost === 1 &&
    next.processedCommandIds[simulationResult.commandId] === true
  );
};

const rejectedResult = (
  reasonCode: Extract<
    AtomicStrategicCommandResult,
    { status: "rejected" }
  >["reasonCode"],
  options: {
    readonly commandId?: AtomicStrategicCommandRequest["command"]["commandId"];
    readonly detailCode?: string;
    readonly currentState?: CampaignState;
  } = {},
): AtomicStrategicCommandResult =>
  AtomicStrategicCommandResultSchema.parse({
    status: "rejected",
    idempotent: false,
    reasonCode,
    ...(options.commandId === undefined
      ? {}
      : { commandId: options.commandId }),
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

export class AtomicCampaignCommandService {
  readonly #coordinator: CampaignOperationCoordinator;
  readonly #simulation: StrategicCommandSimulationPort;
  readonly #repository: CampaignRepository<AtomicCommandRepositoryTypes>;
  readonly #runtimeStore: CampaignRuntimeStore;

  public constructor(options: {
    readonly coordinator: CampaignOperationCoordinator;
    readonly simulation: StrategicCommandSimulationPort;
    readonly repository: CampaignRepository<AtomicCommandRepositoryTypes>;
    readonly runtimeStore: CampaignRuntimeStore;
  }) {
    this.#coordinator = options.coordinator;
    this.#simulation = options.simulation;
    this.#repository = options.repository;
    this.#runtimeStore = options.runtimeStore;
  }

  public async dispatch(
    requestValue: unknown,
  ): Promise<AtomicStrategicCommandResult> {
    const parsedRequest =
      AtomicStrategicCommandRequestSchema.safeParse(requestValue);
    if (!parsedRequest.success) return rejectedResult("INVALID_REQUEST_SCHEMA");
    const request = parsedRequest.data;
    const campaignId = request.command.campaignId;

    return this.#coordinator.runExclusive(
      campaignId,
      "strategic_command",
      async () => {
        let currentState: CampaignState;
        try {
          currentState = this.#runtimeStore.load(campaignId);
        } catch (error) {
          if (error instanceof CampaignRuntimeStateNotFoundError) {
            return rejectedResult("CAMPAIGN_NOT_FOUND", {
              commandId: request.command.commandId,
            });
          }
          throw error;
        }

        const currentHash = hashCanonicalJson(currentState);
        const rawSimulationResult = await this.#simulation.dispatch({
          request,
          currentState,
        });
        const parsedSimulationResult =
          StrategicCommandSimulationResultSchema.safeParse(rawSimulationResult);
        if (!parsedSimulationResult.success) {
          return rejectedResult("INVALID_SIMULATION_RESULT", {
            commandId: request.command.commandId,
            detailCode: "RESULT_SCHEMA_INVALID",
            currentState,
          });
        }
        if (hashCanonicalJson(currentState) !== currentHash) {
          return rejectedResult("INVALID_SIMULATION_RESULT", {
            commandId: request.command.commandId,
            detailCode: "SIMULATION_MUTATED_CURRENT_STATE",
            currentState,
          });
        }

        const simulationResult = parsedSimulationResult.data;
        if (simulationResult.status === "rejected") {
          return rejectedResult(simulationResult.reasonCode, {
            ...(simulationResult.commandId === undefined
              ? {}
              : { commandId: simulationResult.commandId }),
            ...(simulationResult.detailCode === undefined
              ? {}
              : { detailCode: simulationResult.detailCode }),
            currentState,
          });
        }
        if (simulationResult.status === "duplicate") {
          return AtomicStrategicCommandResultSchema.parse({
            status: "duplicate",
            idempotent: true,
            commandId: simulationResult.commandId,
            decisionId: simulationResult.decisionRecord.decisionId,
            originalTurn: simulationResult.decisionRecord.turn,
            originalSequenceWithinTurn:
              simulationResult.decisionRecord.sequenceWithinTurn,
            campaignRevision: currentState.meta.revision,
            authoritativeStateHash: currentHash,
          });
        }
        if (!committedResultIsValid(currentState, simulationResult)) {
          return rejectedResult("INVALID_SIMULATION_RESULT", {
            commandId: request.command.commandId,
            detailCode: "COMMIT_INVARIANT_FAILED",
            currentState,
          });
        }

        const snapshot = createSaveSnapshot(simulationResult.nextState);
        try {
          await this.#repository.writeLocal(snapshot);
        } catch (error) {
          throw new CampaignPersistenceError(campaignId, error);
        }
        this.#runtimeStore.replace(snapshot.authoritativeState);

        return AtomicStrategicCommandResultSchema.parse({
          status: "committed",
          idempotent: false,
          commandId: simulationResult.commandId,
          decisionId: simulationResult.decisionRecord.decisionId,
          decisionSlotCost: 1,
          campaignRevision: snapshot.campaignRevision,
          authoritativeStateHash: snapshot.authoritativeStateHash,
        });
      },
    );
  }
}
