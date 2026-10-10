import { describe, expect, it, vi } from "vitest";

import {
  AtomicCampaignCommandService,
  CampaignPersistenceError,
  InMemoryCampaignRepository,
  InMemoryCampaignRuntimeStore,
  InMemoryCampaignEditLock,
  SerialCampaignOperationCoordinator,
  createSaveSnapshot,
  saveSnapshotHashIsValid,
  type AtomicCommandRepositoryTypes,
} from "@african-mandate/application";
import {
  ATOMIC_COMMIT_CONTRACT_VERSION,
  ActionDefinitionSchema,
  AtomicStrategicCommandRequestSchema,
  CampaignStateSchema,
  KnownCostProfileSchema,
  type AtomicStrategicCommandRequest,
  type CampaignState,
  type SaveSnapshot,
} from "@african-mandate/domain";
import {
  FactRegistry,
  InProcessStrategicCommandDispatcher,
  KnownFactSource,
  hashCanonicalJson,
} from "@african-mandate/simulation";

const factDefinitions = [
  {
    key: "player.political_capital",
    valueType: "number",
    allowedScopes: ["player_eligibility", "player_forecast"],
    subjectKinds: [],
    resolverId: "known_player_political_capital",
  },
] as const;

const action = ActionDefinitionSchema.parse({
  actionId: "action_atomic_test_consult",
  nameKey: "test.atomic.consult.name",
  descriptionKey: "test.atomic.consult.description",
  actionDomain: "diplomacy",
  commandType: "consult_actor",
  decisionSlotCost: 1,
  targetSchema: {
    allowedKinds: ["actor"],
    minTargets: 1,
    maxTargets: 1,
    uniqueTargets: true,
  },
  eligibilityRule: {
    kind: "predicate",
    query: { fact: "player.political_capital" },
    operator: "gte",
    value: 2,
  },
  mandateRequirement: "none",
  knownCostProfileId: "cost_atomic_test_consult",
  immediateEffectProfileIds: [],
  consequenceProfileIds: [],
  doctrineSignal: {},
  previewPolicyId: "preview_atomic_test_known_only",
});

const costProfile = KnownCostProfileSchema.parse({
  knownCostProfileId: "cost_atomic_test_consult",
  costs: [
    {
      costType: "political_capital",
      amount: 1,
      certainty: "known",
    },
  ],
});

const campaignState = (): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_atomic_commit_test",
      scenarioId: "scenario_atomic_commit_test",
      campaignSeed: "atomic-command-test-seed",
      difficultyProfileId: "difficulty_atomic_test",
      currentTurn: 1,
      maxTurns: 20,
      currentDate: "2025-10-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: "institution_atomic_test",
      materialResources: {
        budget: { amount: 10, currency: "TEST" },
        personnel: 5,
        logistics: 50,
      },
      institutionalCapacity: {
        mandateAuthority: 50,
        politicalCapital: 5,
        secretariatCapacity: 5,
        memberStateAlignment: 50,
        partnerConfidence: 50,
        implementationCapacity: 5,
        intelligenceConfidence: 50,
      },
    },
    world: {},
    institutions: {},
    actors: {},
    relationships: {},
    positions: {},
    memories: {},
    commitments: {},
    redLines: {},
    disputes: {},
    knowledge: {},
    assessments: {},
    mandateCases: {},
    implementations: {},
    worldEvents: {},
    situations: {},
    attention: {},
    scheduledConsequences: {},
    doctrine: {},
    evaluation: {},
    decisions: [],
    domainEvents: [],
    processedCommandIds: {},
    versions: {
      gameSchemaVersion: 1,
      simulationModelVersion: "test-only-v1",
      baselineVersion: "test-only-v1",
      scenarioVersion: "test-only-v1",
      contentVersion: "test-only-v1",
      balanceProfileVersion: "test-only-v1",
      methodologyVersion: "test-only-v1",
    },
  });

const knownFacts = (politicalCapital: number) =>
  new KnownFactSource([
    {
      query: { fact: "player.political_capital" },
      resolution: { kind: "known", value: politicalCapital },
    },
  ]);

const requestFor = (
  state: CampaignState,
  options: {
    readonly commandId?: string;
    readonly expectedRevision?: number;
    readonly expectedVersions?: CampaignState["versions"];
  } = {},
): AtomicStrategicCommandRequest =>
  AtomicStrategicCommandRequestSchema.parse({
    contractVersion: ATOMIC_COMMIT_CONTRACT_VERSION,
    command: {
      commandId: options.commandId ?? "command_atomic_test_1",
      commandType: action.commandType,
      campaignId: state.meta.campaignId,
      submittedTurn: state.meta.currentTurn,
      payload: {
        actionId: action.actionId,
        targets: [{ kind: "actor", actorId: "actor_atomic_test" }],
        terms: [],
      },
    },
    expectedRevision: options.expectedRevision ?? state.meta.revision,
    expectedVersions: options.expectedVersions ?? state.versions,
  });

const harness = (politicalCapital = 5) => {
  const initial = campaignState();
  const runtimeStore = new InMemoryCampaignRuntimeStore([initial]);
  const repository =
    new InMemoryCampaignRepository<AtomicCommandRepositoryTypes>([
      createSaveSnapshot(initial),
    ]);
  const coordinator = new SerialCampaignOperationCoordinator(
    new InMemoryCampaignEditLock(),
  );
  const simulation = new InProcessStrategicCommandDispatcher({
    actions: [action],
    factRegistry: new FactRegistry(factDefinitions),
    factSource: knownFacts(politicalCapital),
    costProfiles: [costProfile],
    structuralValidators: {
      [action.actionId]: () => ({ status: "valid" }),
    },
  });
  const service = new AtomicCampaignCommandService({
    coordinator,
    simulation,
    repository,
    runtimeStore,
  });
  return {
    initial,
    runtimeStore,
    repository,
    coordinator,
    simulation,
    service,
  };
};

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe("atomic strategic command commit", () => {
  it("persists before replacement and consumes exactly one slot", async () => {
    const { initial, repository, runtimeStore, service } = harness();
    const result = await service.dispatch(requestFor(initial));

    expect(result).toMatchObject({
      status: "committed",
      idempotent: false,
      decisionSlotCost: 1,
      campaignRevision: 1,
    });
    const current = runtimeStore.load(initial.meta.campaignId);
    expect(current.meta.decisionsRemaining).toBe(2);
    expect(current.player.institutionalCapacity.politicalCapital).toBe(4);
    expect(current.meta.revision).toBe(1);
    expect(current.decisions).toHaveLength(1);
    expect(current.domainEvents).toHaveLength(1);
    expect(current.processedCommandIds["command_atomic_test_1"]).toBe(true);
    expect(Object.isFrozen(current)).toBe(true);
    expect(Object.isFrozen(current.decisions)).toBe(true);

    const persisted = await repository.load(initial.meta.campaignId);
    expect(saveSnapshotHashIsValid(persisted)).toBe(true);
    expect(
      saveSnapshotHashIsValid({
        ...persisted,
        authoritativeStateHash: "0".repeat(64),
      }),
    ).toBe(false);
    expect(persisted.authoritativeStateHash).toBe(hashCanonicalJson(current));
    expect(persisted.authoritativeState).toEqual(current);
  });

  it("returns an idempotent duplicate without a second write or effect", async () => {
    const { initial, repository, runtimeStore, service } = harness();
    const request = requestFor(initial);
    const first = await service.dispatch(request);
    const persistedAfterFirst = await repository.load(initial.meta.campaignId);
    const duplicate = await service.dispatch(request);
    const persistedAfterDuplicate = await repository.load(
      initial.meta.campaignId,
    );

    expect(first.status).toBe("committed");
    expect(duplicate).toMatchObject({
      status: "duplicate",
      idempotent: true,
      campaignRevision: 1,
    });
    if (first.status === "committed" && duplicate.status === "duplicate") {
      expect(duplicate.decisionId).toBe(first.decisionId);
    }
    expect(persistedAfterDuplicate).toEqual(persistedAfterFirst);
    const current = runtimeStore.load(initial.meta.campaignId);
    expect(current.meta.decisionsRemaining).toBe(2);
    expect(current.player.institutionalCapacity.politicalCapital).toBe(4);
    expect(current.decisions).toHaveLength(1);
    expect(current.domainEvents).toHaveLength(1);
  });

  it("leaves resources, events, slots, revision, and hashes unchanged on rejection", async () => {
    const { initial, repository, runtimeStore, service } = harness(0);
    const beforeHash = hashCanonicalJson(
      runtimeStore.load(initial.meta.campaignId),
    );
    const beforeSnapshot = await repository.load(initial.meta.campaignId);
    const result = await service.dispatch(requestFor(initial));

    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "KNOWN_REQUIREMENT_FAILED",
      campaignRevision: 0,
      authoritativeStateHash: beforeHash,
    });
    expect(hashCanonicalJson(runtimeStore.load(initial.meta.campaignId))).toBe(
      beforeHash,
    );
    expect(await repository.load(initial.meta.campaignId)).toEqual(
      beforeSnapshot,
    );
  });

  it("keeps the prior durable and in-memory snapshot when save fails", async () => {
    const { initial, repository, runtimeStore, service } = harness();
    const beforeState = runtimeStore.load(initial.meta.campaignId);
    const beforeHash = hashCanonicalJson(beforeState);
    const beforeSnapshot = await repository.load(initial.meta.campaignId);
    repository.failNextWrite(new Error("synthetic atomic write failure"));

    await expect(service.dispatch(requestFor(initial))).rejects.toBeInstanceOf(
      CampaignPersistenceError,
    );
    const afterState = runtimeStore.load(initial.meta.campaignId);
    expect(hashCanonicalJson(afterState)).toBe(beforeHash);
    expect(afterState.meta.revision).toBe(0);
    expect(afterState.meta.decisionsRemaining).toBe(3);
    expect(afterState.player.institutionalCapacity.politicalCapital).toBe(5);
    expect(afterState.decisions).toEqual([]);
    expect(afterState.domainEvents).toEqual([]);
    expect(await repository.load(initial.meta.campaignId)).toEqual(
      beforeSnapshot,
    );
  });

  it("rejects revision and version mismatches without mutation", async () => {
    const { initial, repository, runtimeStore, service } = harness();
    const beforeHash = hashCanonicalJson(
      runtimeStore.load(initial.meta.campaignId),
    );
    const beforeSnapshot = await repository.load(initial.meta.campaignId);

    const revisionMismatch = await service.dispatch(
      requestFor(initial, { expectedRevision: 7 }),
    );
    const versionMismatch = await service.dispatch(
      requestFor(initial, {
        commandId: "command_atomic_test_version",
        expectedVersions: {
          ...initial.versions,
          contentVersion:
            "different-test-version" as CampaignState["versions"]["contentVersion"],
        },
      }),
    );

    expect(revisionMismatch).toMatchObject({
      status: "rejected",
      reasonCode: "REVISION_MISMATCH",
    });
    expect(versionMismatch).toMatchObject({
      status: "rejected",
      reasonCode: "VERSION_MISMATCH",
    });
    expect(hashCanonicalJson(runtimeStore.load(initial.meta.campaignId))).toBe(
      beforeHash,
    );
    expect(await repository.load(initial.meta.campaignId)).toEqual(
      beforeSnapshot,
    );
  });

  it("serializes a command durable write against a concurrent EndTurn", async () => {
    const base = harness();
    const writeEntered = deferred();
    const releaseWrite = deferred();
    const order: string[] = [];
    const repository = {
      load: (campaignId: CampaignState["meta"]["campaignId"]) =>
        base.repository.load(campaignId),
      writeLocal: async (snapshot: SaveSnapshot) => {
        order.push("command:write:start");
        writeEntered.resolve();
        await releaseWrite.promise;
        await base.repository.writeLocal(snapshot);
        order.push("command:write:end");
      },
    } satisfies Pick<
      import("@african-mandate/application").CampaignRepository<AtomicCommandRepositoryTypes>,
      "load" | "writeLocal"
    >;
    const service = new AtomicCampaignCommandService({
      coordinator: base.coordinator,
      simulation: base.simulation,
      repository,
      runtimeStore: base.runtimeStore,
    });

    const commandPromise = service.dispatch(requestFor(base.initial));
    await writeEntered.promise;
    const endTurnPromise = base.coordinator.runExclusive(
      base.initial.meta.campaignId,
      "end_turn",
      async () => {
        order.push("end_turn:start");
      },
    );
    await Promise.resolve();
    expect(order).toEqual(["command:write:start"]);
    releaseWrite.resolve();
    await Promise.all([commandPromise, endTurnPromise]);
    expect(order).toEqual([
      "command:write:start",
      "command:write:end",
      "end_turn:start",
    ]);
  });

  it("rejects an invalid simulation result before persistence or replacement", async () => {
    const { initial, repository, runtimeStore, coordinator } = harness();
    const write = vi.spyOn(repository, "writeLocal");
    const service = new AtomicCampaignCommandService({
      coordinator,
      simulation: {
        dispatch: async () => ({ status: "committed" }) as never,
      },
      repository,
      runtimeStore,
    });
    const beforeHash = hashCanonicalJson(
      runtimeStore.load(initial.meta.campaignId),
    );

    const result = await service.dispatch(requestFor(initial));

    expect(result).toMatchObject({
      status: "rejected",
      reasonCode: "INVALID_SIMULATION_RESULT",
      detailCode: "RESULT_SCHEMA_INVALID",
    });
    expect(write).not.toHaveBeenCalled();
    expect(hashCanonicalJson(runtimeStore.load(initial.meta.campaignId))).toBe(
      beforeHash,
    );
  });
});
