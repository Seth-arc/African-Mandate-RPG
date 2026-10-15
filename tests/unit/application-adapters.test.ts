import { describe, expect, it, vi } from "vitest";

import {
  APPLICATION_ADAPTER_CONTRACT_VERSION,
  ArtifactHashMismatchError,
  ArtifactRegistryError,
  BrowserArtifactRegistryClient,
  CampaignArtifactRefsSchema,
  CampaignProjectionFacade,
  CampaignSyncStatusStore,
  IndexedDbCampaignRepository,
  NarrativeFallbackService,
  ProjectionCache,
  SerialCampaignOperationCoordinator,
  StaleCampaignRevisionError,
  StaleProjectionError,
  createActionPreview,
  createResolutionProjection,
  createSaveSnapshot,
  InMemoryCampaignEditLock,
  InMemoryCampaignRuntimeStore,
  AtomicCampaignTurnService,
  type BrowserCampaignStorage,
  type BrowserLockManager,
  type CampaignProjection,
  WebLocksCampaignEditLock,
} from "@african-mandate/application";
import { compileFourMonthTestContent } from "@african-mandate/content";
import {
  NARRATIVE_CONTRACT_VERSION,
  NARRATIVE_POLICY_VERSION,
  NARRATIVE_TEMPLATE_VERSION,
  NarrativeRequestSchema,
  CampaignIdSchema,
  ScoreSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  type NarrativeRequest,
  type SaveSnapshot,
} from "@african-mandate/domain";
import { createHeadlessInitialState } from "@african-mandate/headless";
import { DeterministicNarrativePort } from "@african-mandate/narrative";
import {
  InProcessEndTurnDispatcher,
  buildPlayerKnowledgeProjection,
  hashCanonicalJson,
} from "@african-mandate/simulation";

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

class DeferredBrowserStorage implements BrowserCampaignStorage {
  public current: SaveSnapshot;
  public recovery: SaveSnapshot | undefined;
  public readonly commitEntered = deferred();
  public readonly allowCommit = deferred();

  public constructor(initial: SaveSnapshot) {
    this.current = structuredClone(initial);
  }

  public loadCurrent(): Promise<unknown> {
    return Promise.resolve(structuredClone(this.current));
  }

  public loadRecovery(): Promise<unknown | undefined> {
    return Promise.resolve(
      this.recovery === undefined ? undefined : structuredClone(this.recovery),
    );
  }

  public async commitCurrent(snapshot: SaveSnapshot): Promise<void> {
    this.commitEntered.resolve();
    await this.allowCommit.promise;
    this.recovery = structuredClone(this.current);
    this.current = structuredClone(snapshot);
  }

  public restoreCurrent(snapshot: SaveSnapshot): Promise<void> {
    this.current = structuredClone(snapshot);
    return Promise.resolve();
  }

  public close(): void {}
}

const endTurnRequest = (state: ReturnType<typeof createHeadlessInitialState>) =>
  ({
    contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
    command: {
      commandId: "command_test_adapter_end_turn",
      commandType: "end_turn" as const,
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {},
    },
    expectedRevision: state.meta.revision,
    expectedVersions: state.versions,
  }) as const;

const campaignProjection = (
  state: ReturnType<typeof createHeadlessInitialState>,
): CampaignProjection => ({
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
});

const narrativeRequest = (): NarrativeRequest =>
  NarrativeRequestSchema.parse({
    contractVersion: NARRATIVE_CONTRACT_VERSION,
    classification: "TEST_ONLY_KNOWLEDGE_SAFE_NARRATIVE",
    identity: {
      campaignId: "campaign_test_adapter_narrative",
      sourceCampaignRevision: 2,
      semanticContextHash: "a".repeat(64),
      language: "en",
      narrativePolicyVersion: NARRATIVE_POLICY_VERSION,
      templateVersion: NARRATIVE_TEMPLATE_VERSION,
    },
    context: {
      narrativeContextId: "narrative_test_adapter_offline",
      perspective: { kind: "player_office" },
      turn: 2,
      subjectRefs: [],
      semanticState: {
        toneProfileId: "tone_test_adapter",
        knownMemoryIds: [],
        knownCommitmentIds: [],
        knownDisputeIds: [],
        allowedClaimIds: [],
      },
      prohibitedClaimCodes: [],
    },
    templateInput: {
      templateKind: "collection_outcome",
      collectionTaskId: "collection_test_adapter_offline",
      outcome: "failed",
      responseDate: "2025-11-01",
      evidence: [],
      remainingGapQuestionCode: "offline_source_unavailable",
    },
  });

describe("Prompt 20 browser persistence adapter", () => {
  it("makes the durable local write complete before swapping runtime state", async () => {
    const initial = createHeadlessInitialState();
    const storage = new DeferredBrowserStorage(createSaveSnapshot(initial));
    const repository = new IndexedDbCampaignRepository(storage);
    const runtime = new InMemoryCampaignRuntimeStore([initial]);
    const service = new AtomicCampaignTurnService({
      coordinator: new SerialCampaignOperationCoordinator(
        new InMemoryCampaignEditLock(),
      ),
      simulation: new InProcessEndTurnDispatcher(),
      repository,
      runtimeStore: runtime,
    });

    const operation = service.endTurn(endTurnRequest(initial));
    await storage.commitEntered.promise;
    expect(runtime.load(initial.meta.campaignId).meta.revision).toBe(0);

    storage.allowCommit.resolve();
    const result = await operation;
    expect(result.status).toBe("committed");
    expect(runtime.load(initial.meta.campaignId).meta.revision).toBe(1);
    expect(storage.current.campaignRevision).toBe(1);
    expect(storage.recovery?.campaignRevision).toBe(0);
  });

  it("rejects a stale local revision before storage mutation", async () => {
    const initial = createHeadlessInitialState();
    const snapshot = createSaveSnapshot(initial);
    const storage = new DeferredBrowserStorage(snapshot);
    const repository = new IndexedDbCampaignRepository(storage);

    await expect(repository.writeLocal(snapshot)).rejects.toBeInstanceOf(
      StaleCampaignRevisionError,
    );
    expect(storage.recovery).toBeUndefined();
  });

  it("holds the browser edit lock until its lease is explicitly released", async () => {
    let requestedName = "";
    let completed = false;
    const requestCompleted = deferred();
    const lockManager: BrowserLockManager = {
      request: async (name, _options, callback) => {
        requestedName = name;
        await callback();
        completed = true;
        requestCompleted.resolve();
      },
    };
    const initial = createHeadlessInitialState();
    const lock = new WebLocksCampaignEditLock(lockManager);
    const lease = await lock.acquire(initial.meta.campaignId);

    expect(requestedName).toContain(initial.meta.campaignId);
    expect(completed).toBe(false);
    await lease.release();
    await requestCompleted.promise;
    expect(completed).toBe(true);
  });
});

describe("Prompt 20 verified artifact and projection facades", () => {
  it("accepts a pinned scenario artifact only when its canonical SHA-256 matches", async () => {
    const scenarioBundle = compileFourMonthTestContent().scenarioBundle;
    const hash = hashCanonicalJson(scenarioBundle);
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify(scenarioBundle), { status: 200 }),
    ) as unknown as typeof fetch;
    const registry = new BrowserArtifactRegistryClient({
      releaseManifestUrl: "https://fixtures.invalid/release.json",
      fetcher,
    });
    const reference = {
      schemaVersion: 1,
      hash,
      url: "https://fixtures.invalid/scenario.json",
    } as const;

    await expect(registry.loadScenarioBundle(reference)).resolves.toEqual(
      scenarioBundle,
    );
    await expect(
      registry.loadScenarioBundle({ ...reference, hash: "0".repeat(64) }),
    ).rejects.toBeInstanceOf(ArtifactHashMismatchError);
  });

  it("pins the exact Save Snapshot v2 artifact identity and rejects alternate shapes", () => {
    const pinned = CampaignArtifactRefsSchema.parse({
      scenarioId: "scenario_test_adapter",
      scenarioBundleSchemaVersion: 1,
      scenarioBundleHash: "1".repeat(64),
      baselineSchemaVersion: 1,
      baselineHash: "2".repeat(64),
      mapArtifactSchemaVersion: 1,
      mapArtifactHash: "3".repeat(64),
    });
    expect(pinned.scenarioBundleHash).toHaveLength(64);
    expect(() =>
      CampaignArtifactRefsSchema.parse({
        ...pinned,
        scenarioBundle: { hash: "1".repeat(64) },
      }),
    ).toThrow();
  });

  it("rejects resolved URLs that do not match the campaign-pinned hashes", async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;
    const registry = new BrowserArtifactRegistryClient({
      releaseManifestUrl: "https://fixtures.invalid/release.json",
      fetcher,
    });
    await expect(
      registry.resolveCampaignArtifacts({
        campaignArtifacts: {
          scenarioId: "scenario_test_adapter",
          scenarioBundleSchemaVersion: 1,
          scenarioBundleHash: "1".repeat(64),
          baselineSchemaVersion: 1,
          baselineHash: "2".repeat(64),
          mapArtifactSchemaVersion: 1,
          mapArtifactHash: "3".repeat(64),
        },
        scenarioBundle: {
          schemaVersion: 1,
          hash: "4".repeat(64),
          url: "https://fixtures.invalid/scenario.json",
        },
        baseline: {
          baselineVersion: "test-only-v1",
          schemaVersion: 1,
          hash: "2".repeat(64),
          url: "https://fixtures.invalid/baseline.json",
        },
        mapArtifact: {
          schemaVersion: 1,
          hash: "3".repeat(64),
          manifestUrl: "https://fixtures.invalid/map.json",
        },
        methodology: {
          methodologyVersion: "test-only-v1",
          schemaVersion: 1,
          hash: "5".repeat(64),
          url: "https://fixtures.invalid/methodology.json",
        },
      }),
    ).rejects.toBeInstanceOf(ArtifactRegistryError);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("caches by revision and rejects stale projection responses", async () => {
    const initial = createHeadlessInitialState();
    const projection = campaignProjection(initial);
    const buildProjection = vi.fn(async () => projection);
    const cache = new ProjectionCache();
    const facade = new CampaignProjectionFacade({
      simulation: { buildProjection },
      cache,
    });
    const request = {
      campaignId: initial.meta.campaignId,
      expectedRevision: 0,
      locale: "en",
      presentationOptions: {},
    } as const;

    await facade.buildCampaignProjection(request);
    await facade.buildCampaignProjection(request);
    expect(buildProjection).toHaveBeenCalledOnce();

    cache.invalidateForRevision(initial.meta.campaignId, 1);
    expect(
      cache.get({
        campaignId: initial.meta.campaignId,
        campaignRevision: 0,
        projectionType: "campaign",
        locale: "en",
        presentationOptions: {},
      }),
    ).toBeUndefined();
    await expect(
      facade.buildCampaignProjection({ ...request, expectedRevision: 1 }),
    ).rejects.toBeInstanceOf(StaleProjectionError);
  });

  it("publishes knowledge-safe action and resolution projection envelopes", () => {
    const initial = createHeadlessInitialState();
    const action = Object.values(
      compileFourMonthTestContent().scenarioBundle.actionDefinitions,
    )[0];
    if (action === undefined) throw new Error("Missing fixture action");
    const preview = createActionPreview({
      campaignId: initial.meta.campaignId,
      campaignRevision: 0,
      action: {
        actionId: action.actionId,
        commandType: action.commandType,
        decisionSlotCost: action.decisionSlotCost,
        eligibility: {
          ruleResult: "true",
          available: true,
          reasonCode: "ELIGIBLE",
        },
        preview: {
          actionId: action.actionId,
          knownCosts: [],
          likelyInstitutionalReactions: [],
          knownRisks: [],
          intelligenceGaps: [],
          implementationDependencies: [],
          confidence: ScoreSchema.parse(100),
        },
      },
    });
    const resolution = createResolutionProjection({
      campaignId: initial.meta.campaignId,
      operationKind: "end_turn",
      currentRevision: 0,
      result: {
        status: "rejected",
        idempotent: false,
        reasonCode: "INVALID_REQUEST_SCHEMA",
      },
    });

    expect(preview.projectionType).toBe("action_preview");
    expect(resolution).not.toHaveProperty("resolverTrace");
    expect(resolution.outcomeCode).toBe("INVALID_REQUEST_SCHEMA");
  });
});

describe("Prompt 20 sync and offline narrative adapters", () => {
  it("does not let a stale sync completion overwrite a newer local revision", () => {
    const sync = new CampaignSyncStatusStore();
    const campaignId = CampaignIdSchema.parse("campaign_test_sync");
    sync.initialize(campaignId, 1, 1);
    sync.markSyncing(campaignId);
    sync.noteLocalCommit(campaignId, 2);

    expect(sync.markSynced(campaignId, 1, 1)).toBe(false);
    expect(sync.get(campaignId)).toMatchObject({
      localRevision: 2,
      status: "unsynced",
    });
    expect(() => sync.noteLocalCommit(campaignId, 2)).toThrow(
      StaleCampaignRevisionError,
    );
  });

  it("falls back to deterministic narrative when the primary is offline", async () => {
    const primary = {
      request: vi.fn(async () => {
        throw new TypeError("synthetic offline failure");
      }),
    };
    const service = new NarrativeFallbackService(
      new DeterministicNarrativePort(),
      primary,
    );

    const result = await service.request(narrativeRequest());
    expect(result).toMatchObject({
      source: "deterministic_template",
      fallbackReason: "GENERATION_UNAVAILABLE",
    });
    expect(result.response.text).toContain("SIMULATED");
  });

  it("publishes a separately versioned adapter contract", () => {
    expect(APPLICATION_ADAPTER_CONTRACT_VERSION).toBe("1.0.0");
  });
});
