import { describe, expect, it, vi } from "vitest";

import {
  APPLICATION_PORT_CONTRACT_VERSION,
  CampaignNotFoundError,
  InMemoryArtifactRegistryClient,
  InMemoryCampaignEditLock,
  InMemoryCampaignRepository,
  InMemoryNarrativePort,
  InMemorySimulationPort,
  InvalidCampaignOperationError,
  SerialCampaignOperationCoordinator,
  type ArtifactRegistryTypes,
  type CampaignEditLock,
  type CampaignRepositoryTypes,
  type NarrativePortTypes,
  type SimulationPortTypes,
} from "@african-mandate/application";
import { CampaignIdSchema } from "@african-mandate/domain";

const campaignA = CampaignIdSchema.parse("campaign_port_test_a");
const campaignB = CampaignIdSchema.parse("campaign_port_test_b");

const passThroughEditLock: CampaignEditLock = {
  acquire: async (campaignId) => ({
    campaignId,
    release: async () => undefined,
  }),
};

const deferred = <Value = void>() => {
  let resolve!: (value: Value | PromiseLike<Value>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

interface TestSimulationTypes extends SimulationPortTypes {
  readonly command: { readonly commandId: string };
  readonly commandResult: { readonly accepted: boolean };
  readonly turnCommand: { readonly commandId: string };
  readonly turnResult: { readonly turn: number };
  readonly initializationInput: { readonly seed: string };
  readonly campaignState: { readonly revision: number };
  readonly projectionRequest: { readonly campaignId: string };
  readonly playerProjection: { readonly title: string };
}

interface TestRepositoryTypes extends CampaignRepositoryTypes {
  readonly snapshot: {
    readonly campaignId: typeof campaignA;
    readonly campaignRevision: number;
    readonly marker: string;
  };
  readonly cloudSyncResult: { readonly synced: boolean };
}

interface TestArtifactTypes extends ArtifactRegistryTypes {
  readonly releaseManifest: { readonly release: string };
  readonly scenarioBundleRef: string;
  readonly scenarioBundle: { readonly scenario: string };
  readonly baselineRef: string;
  readonly baseline: { readonly baseline: string };
  readonly mapArtifactRef: string;
  readonly mapArtifactManifest: { readonly map: string };
  readonly methodologyRef: string;
  readonly methodology: { readonly methodology: string };
}

interface TestNarrativeTypes extends NarrativePortTypes {
  readonly request: { readonly contextId: string };
  readonly response: { readonly text: string };
}

describe("application port contract", () => {
  it("freezes a public contract version before command and UI implementation", () => {
    expect(APPLICATION_PORT_CONTRACT_VERSION).toBe("1.1.0");
  });

  it("injects every SimulationPort operation without resolving effects in application", async () => {
    const handlers = {
      dispatch: vi.fn(async () => ({ accepted: true })),
      endTurn: vi.fn(async () => ({ turn: 2 })),
      initialize: vi.fn(async () => ({ revision: 0 })),
      buildProjection: vi.fn(async () => ({ title: "Known projection" })),
    };
    const port = new InMemorySimulationPort<TestSimulationTypes>(handlers);

    await expect(port.dispatch({ commandId: "command_test" })).resolves.toEqual(
      {
        accepted: true,
      },
    );
    await expect(
      port.endTurn({ commandId: "command_end_turn" }),
    ).resolves.toEqual({ turn: 2 });
    await expect(port.initialize({ seed: "seed" })).resolves.toEqual({
      revision: 0,
    });
    await expect(
      port.buildProjection({ campaignId: campaignA }),
    ).resolves.toEqual({ title: "Known projection" });
    expect(handlers.dispatch).toHaveBeenCalledOnce();
    expect(handlers.endTurn).toHaveBeenCalledOnce();
    expect(handlers.endTurn).toHaveBeenCalledWith({
      commandId: "command_end_turn",
    });
    expect(handlers.initialize).toHaveBeenCalledOnce();
    expect(handlers.buildProjection).toHaveBeenCalledOnce();
  });

  it("provides isolated in-memory repository writes and injected failure", async () => {
    const initial = {
      campaignId: campaignA,
      campaignRevision: 0,
      marker: "initial",
    } as const;
    const repository = new InMemoryCampaignRepository<TestRepositoryTypes>([
      initial,
    ]);
    const loaded = await repository.load(campaignA);
    expect(loaded).toEqual(initial);
    expect(loaded).not.toBe(initial);

    repository.failNextWrite(new Error("synthetic durable write failure"));
    await expect(
      repository.writeLocal({
        ...initial,
        campaignRevision: 1,
        marker: "failed",
      }),
    ).rejects.toThrow("synthetic durable write failure");
    await expect(repository.load(campaignA)).resolves.toEqual(initial);

    const committed = { ...initial, campaignRevision: 1, marker: "committed" };
    await repository.writeLocal(committed);
    await expect(repository.load(campaignA)).resolves.toEqual(committed);
    await expect(repository.load(campaignB)).rejects.toBeInstanceOf(
      CampaignNotFoundError,
    );
    await expect(
      repository.writeLocal({ ...initial, campaignRevision: -1 }),
    ).rejects.toThrow("campaignRevision must be a non-negative safe integer");
  });

  it("injects artifact and narrative ports without taking an operation lock", async () => {
    const artifacts = new InMemoryArtifactRegistryClient<TestArtifactTypes>({
      loadReleaseManifest: async () => ({ release: "test-only" }),
      loadScenarioBundle: async (reference) => ({ scenario: reference }),
      loadBaseline: async (reference) => ({ baseline: reference }),
      loadMapManifest: async (reference) => ({ map: reference }),
      loadMethodology: async (reference) => ({ methodology: reference }),
    });
    const narrative = new InMemoryNarrativePort<TestNarrativeTypes>(
      async ({ contextId }) => ({ text: `Narrative ${contextId}` }),
    );

    await expect(artifacts.loadReleaseManifest()).resolves.toEqual({
      release: "test-only",
    });
    await expect(artifacts.loadScenarioBundle("scenario-ref")).resolves.toEqual(
      {
        scenario: "scenario-ref",
      },
    );
    await expect(artifacts.loadBaseline("baseline-ref")).resolves.toEqual({
      baseline: "baseline-ref",
    });
    await expect(artifacts.loadMapManifest("map-ref")).resolves.toEqual({
      map: "map-ref",
    });
    await expect(artifacts.loadMethodology("method-ref")).resolves.toEqual({
      methodology: "method-ref",
    });
    await expect(narrative.request({ contextId: "one" })).resolves.toEqual({
      text: "Narrative one",
    });
  });
});

describe("campaign operation boundary", () => {
  it("provides an independently exclusive in-memory edit lock", async () => {
    const lock = new InMemoryCampaignEditLock();
    const first = await lock.acquire(campaignA);
    let secondAcquired = false;
    const secondPromise = lock.acquire(campaignA).then((lease) => {
      secondAcquired = true;
      return lease;
    });
    await Promise.resolve();
    expect(secondAcquired).toBe(false);
    await first.release();
    const second = await secondPromise;
    expect(secondAcquired).toBe(true);
    await second.release();
    await expect(second.release()).rejects.toThrow("already released");
  });

  it("serializes concurrent authoritative operations for one campaign", async () => {
    const coordinator = new SerialCampaignOperationCoordinator(
      passThroughEditLock,
    );
    const firstEntered = deferred();
    const releaseFirst = deferred();
    const order: string[] = [];

    const first = coordinator.runExclusive(
      campaignA,
      "strategic_command",
      async () => {
        order.push("first:start");
        firstEntered.resolve();
        await releaseFirst.promise;
        order.push("first:end");
        return "first";
      },
    );
    await firstEntered.promise;
    const second = coordinator.runExclusive(campaignA, "end_turn", async () => {
      order.push("second:start");
      order.push("second:end");
      return "second";
    });

    await Promise.resolve();
    expect(order).toEqual(["first:start"]);
    releaseFirst.resolve();
    await expect(Promise.all([first, second])).resolves.toEqual([
      "first",
      "second",
    ]);
    expect(order).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ]);
  });

  it("does not serialize independent campaigns behind one another", async () => {
    const coordinator = new SerialCampaignOperationCoordinator(
      passThroughEditLock,
    );
    const release = deferred();
    const entered: string[] = [];
    const operation = (campaignId: typeof campaignA) =>
      coordinator.runExclusive(
        campaignId,
        "campaign_initialization",
        async () => {
          entered.push(campaignId);
          await release.promise;
        },
      );

    const first = operation(campaignA);
    const second = operation(campaignB);
    await vi.waitFor(() => expect(entered).toHaveLength(2));
    release.resolve();
    await Promise.all([first, second]);
  });

  it("releases serialization after an operation failure", async () => {
    const coordinator = new SerialCampaignOperationCoordinator(
      passThroughEditLock,
    );
    await expect(
      coordinator.runExclusive(campaignA, "save_migration", async () => {
        throw new Error("synthetic operation failure");
      }),
    ).rejects.toThrow("synthetic operation failure");
    await expect(
      coordinator.runExclusive(
        campaignA,
        "conflict_resolution_replacement",
        async () => "recovered",
      ),
    ).resolves.toBe("recovered");
  });

  it("releases its local queue when an injected lease release fails", async () => {
    let acquisition = 0;
    const lock: CampaignEditLock = {
      acquire: async (campaignId) => {
        acquisition += 1;
        return {
          campaignId,
          release: async () => {
            if (acquisition === 1) throw new Error("synthetic release failure");
          },
        };
      },
    };
    const coordinator = new SerialCampaignOperationCoordinator(lock);

    await expect(
      coordinator.runExclusive(
        campaignA,
        "save_migration",
        async () => "completed-before-release",
      ),
    ).rejects.toThrow("synthetic release failure");
    await expect(
      coordinator.runExclusive(campaignA, "end_turn", async () => "recovered"),
    ).resolves.toBe("recovered");
  });

  it("fails invalid inputs before acquiring an edit lock", async () => {
    const lock = new InMemoryCampaignEditLock();
    const acquire = vi.spyOn(lock, "acquire");
    const coordinator = new SerialCampaignOperationCoordinator(lock);

    await expect(
      coordinator.runExclusive(
        "not-a-campaign" as typeof campaignA,
        "strategic_command",
        async () => undefined,
      ),
    ).rejects.toBeInstanceOf(InvalidCampaignOperationError);
    await expect(
      coordinator.runExclusive(
        campaignA,
        "narrative" as "strategic_command",
        async () => undefined,
      ),
    ).rejects.toBeInstanceOf(InvalidCampaignOperationError);
    expect(acquire).not.toHaveBeenCalled();
  });
});
