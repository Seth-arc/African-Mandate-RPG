import { CampaignIdSchema, type CampaignId } from "@african-mandate/domain";

import type {
  ArtifactRegistryClient,
  ArtifactRegistryTypes,
  CampaignEditLease,
  CampaignEditLock,
  CampaignRepository,
  CampaignRepositoryTypes,
  NarrativePort,
  NarrativePortTypes,
  SimulationPort,
  SimulationPortTypes,
} from "../ports.js";

export class CampaignNotFoundError extends Error {
  public constructor(campaignId: CampaignId) {
    super(`Campaign not found: ${campaignId}`);
    this.name = "CampaignNotFoundError";
  }
}

export class InMemoryCampaignRepository<
  Types extends CampaignRepositoryTypes,
> implements CampaignRepository<Types> {
  readonly #snapshots = new Map<CampaignId, Types["snapshot"]>();
  #nextWriteFailure: Error | undefined;

  public constructor(initialSnapshots: readonly Types["snapshot"][] = []) {
    initialSnapshots.forEach((snapshot) => {
      this.#validateSnapshot(snapshot);
      this.#snapshots.set(snapshot.campaignId, structuredClone(snapshot));
    });
  }

  public async load(id: CampaignId): Promise<Types["snapshot"]> {
    const campaignId = CampaignIdSchema.parse(id);
    const snapshot = this.#snapshots.get(campaignId);
    if (snapshot === undefined) throw new CampaignNotFoundError(campaignId);
    return structuredClone(snapshot);
  }

  public async writeLocal(snapshot: Types["snapshot"]): Promise<void> {
    this.#validateSnapshot(snapshot);
    if (this.#nextWriteFailure !== undefined) {
      const failure = this.#nextWriteFailure;
      this.#nextWriteFailure = undefined;
      throw failure;
    }
    this.#snapshots.set(snapshot.campaignId, structuredClone(snapshot));
  }

  public failNextWrite(error: Error): void {
    this.#nextWriteFailure = error;
  }

  #validateSnapshot(snapshot: Types["snapshot"]): void {
    CampaignIdSchema.parse(snapshot.campaignId);
    if (
      !Number.isSafeInteger(snapshot.campaignRevision) ||
      snapshot.campaignRevision < 0
    ) {
      throw new TypeError(
        "campaignRevision must be a non-negative safe integer",
      );
    }
  }
}

export interface SimulationPortHandlers<Types extends SimulationPortTypes> {
  readonly dispatch: (
    command: Types["command"],
  ) => Promise<Types["commandResult"]>;
  readonly endTurn: () => Promise<Types["turnResult"]>;
  readonly initialize: (
    input: Types["initializationInput"],
  ) => Promise<Types["campaignState"]>;
  readonly buildProjection: (
    request: Types["projectionRequest"],
  ) => Promise<Types["playerProjection"]>;
}

export class InMemorySimulationPort<
  Types extends SimulationPortTypes,
> implements SimulationPort<Types> {
  readonly #handlers: SimulationPortHandlers<Types>;

  public constructor(handlers: SimulationPortHandlers<Types>) {
    this.#handlers = handlers;
  }

  public dispatch(command: Types["command"]): Promise<Types["commandResult"]> {
    return this.#handlers.dispatch(command);
  }

  public endTurn(): Promise<Types["turnResult"]> {
    return this.#handlers.endTurn();
  }

  public initialize(
    input: Types["initializationInput"],
  ): Promise<Types["campaignState"]> {
    return this.#handlers.initialize(input);
  }

  public buildProjection(
    request: Types["projectionRequest"],
  ): Promise<Types["playerProjection"]> {
    return this.#handlers.buildProjection(request);
  }
}

export type ArtifactRegistryHandlers<Types extends ArtifactRegistryTypes> = {
  readonly loadReleaseManifest: () => Promise<Types["releaseManifest"]>;
  readonly loadScenarioBundle: (
    reference: Types["scenarioBundleRef"],
  ) => Promise<Types["scenarioBundle"]>;
  readonly loadBaseline: (
    reference: Types["baselineRef"],
  ) => Promise<Types["baseline"]>;
  readonly loadMapManifest: (
    reference: Types["mapArtifactRef"],
  ) => Promise<Types["mapArtifactManifest"]>;
  readonly loadMethodology: (
    reference: Types["methodologyRef"],
  ) => Promise<Types["methodology"]>;
};

export class InMemoryArtifactRegistryClient<
  Types extends ArtifactRegistryTypes,
> implements ArtifactRegistryClient<Types> {
  readonly #handlers: ArtifactRegistryHandlers<Types>;

  public constructor(handlers: ArtifactRegistryHandlers<Types>) {
    this.#handlers = handlers;
  }

  public loadReleaseManifest(): Promise<Types["releaseManifest"]> {
    return this.#handlers.loadReleaseManifest();
  }

  public loadScenarioBundle(
    reference: Types["scenarioBundleRef"],
  ): Promise<Types["scenarioBundle"]> {
    return this.#handlers.loadScenarioBundle(reference);
  }

  public loadBaseline(
    reference: Types["baselineRef"],
  ): Promise<Types["baseline"]> {
    return this.#handlers.loadBaseline(reference);
  }

  public loadMapManifest(
    reference: Types["mapArtifactRef"],
  ): Promise<Types["mapArtifactManifest"]> {
    return this.#handlers.loadMapManifest(reference);
  }

  public loadMethodology(
    reference: Types["methodologyRef"],
  ): Promise<Types["methodology"]> {
    return this.#handlers.loadMethodology(reference);
  }
}

export class InMemoryNarrativePort<
  Types extends NarrativePortTypes,
> implements NarrativePort<Types> {
  readonly #handler: (request: Types["request"]) => Promise<Types["response"]>;

  public constructor(
    handler: (request: Types["request"]) => Promise<Types["response"]>,
  ) {
    this.#handler = handler;
  }

  public request(context: Types["request"]): Promise<Types["response"]> {
    return this.#handler(context);
  }
}

export class InMemoryCampaignEditLock implements CampaignEditLock {
  readonly #tails = new Map<CampaignId, Promise<void>>();

  public async acquire(campaignId: CampaignId): Promise<CampaignEditLease> {
    const parsedCampaignId = CampaignIdSchema.parse(campaignId);
    const predecessor = this.#tails.get(parsedCampaignId) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = predecessor.then(() => gate);
    this.#tails.set(parsedCampaignId, tail);
    await predecessor;

    let held = true;
    return {
      campaignId: parsedCampaignId,
      release: async () => {
        if (!held) throw new Error("Edit lease already released");
        held = false;
        release();
        if (this.#tails.get(parsedCampaignId) === tail) {
          this.#tails.delete(parsedCampaignId);
        }
      },
    };
  }
}
