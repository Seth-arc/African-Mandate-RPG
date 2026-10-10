import { describe, expect, it } from "vitest";

import {
  BaselinePackageSchema,
  CampaignStateSchema,
  AssetIdSchema,
  EndTurnRequestSchema,
  InstitutionIdSchema,
  TerritoryIdSchema,
  TURN_LIFECYCLE_CONTRACT_VERSION,
  WORLD_RESOLVER_CONTRACT_VERSION,
  ZoneIdSchema,
  type CampaignState,
} from "@african-mandate/domain";
import {
  WORLD_SUBSYSTEM_COVERAGE,
  createTestOnlyWorldFixtureResolverRegistry,
  hashCanonicalJson,
  resolveWorldEffects,
  simulateEndTurn,
} from "@african-mandate/simulation";

const assetId = AssetIdSchema.parse("asset_world_test");
const institutionId = InstitutionIdSchema.parse("institution_world_test");
const territoryId = TerritoryIdSchema.parse("territory_world_test");
const zoneId = ZoneIdSchema.parse("zone_world_test");

const baseline = BaselinePackageSchema.parse({
  baselineId: "baseline_world_resolver_test",
  baselineSchemaVersion: 1,
  asOfDate: "2025-09-26",
  sourceManifest: {
    sources: [
      {
        sourceKey: "test-only-world-source",
        sourceName: "Synthetic world resolver source",
        recordCount: 1,
      },
    ],
  },
  territoryBaselines: [],
  zoneBaselines: [],
  assetBaselines: [],
  corridorBaselines: [],
  conflictBaseline: { zoneIndicators: {}, territoryIndicators: {} },
  displacementBaseline: { zoneIndicators: {} },
  developmentBaseline: { zoneIndicators: {} },
  packageHash: "0".repeat(64),
});

const campaignState = (): CampaignState =>
  CampaignStateSchema.parse({
    meta: {
      campaignId: "campaign_world_resolver_test",
      scenarioId: "scenario_world_resolver_test",
      campaignSeed: "world-resolver-test-seed",
      difficultyProfileId: "difficulty_world_resolver_test",
      currentTurn: 3,
      maxTurns: 20,
      currentDate: "2025-12-01",
      decisionsRemaining: 3,
      decisionsPerTurn: 3,
      revision: 0,
      status: "active",
    },
    player: {
      representedInstitutionId: "institution_world_test",
      materialResources: {
        budget: { amount: 0, currency: "TEST" },
        personnel: 0,
        logistics: 50,
      },
      institutionalCapacity: {
        mandateAuthority: 50,
        politicalCapital: 50,
        secretariatCapacity: 50,
        memberStateAlignment: 50,
        partnerConfidence: 50,
        implementationCapacity: 50,
        intelligenceConfidence: 50,
      },
    },
    world: {
      territories: {
        territory_world_test: {
          territoryId: "territory_world_test",
          stability: 50,
          institutionalCapacity: 50,
          economicResilience: 50,
          politicalStatusTags: ["test_only"],
        },
      },
      zones: {
        zone_world_test: {
          zoneId: "zone_world_test",
          statePresence: 50,
          controlContest: 50,
          localGovernanceCapacity: 50,
          tags: ["test_only"],
        },
      },
      conflict: {
        zones: {
          zone_world_test: {
            zoneId: "zone_world_test",
            armedActivity: 50,
            civilianTargeting: 50,
            actorFragmentation: 50,
            mobility: 50,
            recruitmentPressure: 50,
            escalationMomentum: 0,
            spilloverPressure: 50,
          },
        },
      },
      civilian: {
        zones: {
          zone_world_test: {
            civilianConfidence: 50,
            displacementPressure: 50,
            humanitarianAccess: 50,
            serviceReliability: 50,
            perceivedLegitimacy: 50,
          },
        },
      },
      infrastructure: {
        assets: {
          asset_world_test: {
            assetId: "asset_world_test",
            operationalStatus: "operational",
            disruptionRisk: 50,
            conflictExposure: 50,
            economicDependency: 50,
          },
        },
        corridors: {
          corridor_world_test: {
            corridorId: "corridor_world_test",
            throughput: 50,
            resilience: 50,
            disruptionRisk: 50,
          },
        },
      },
      development: {
        zones: {
          zone_world_test: {
            investmentPipeline: 50,
            implementationAbsorption: 50,
            infrastructureNeed: 50,
            serviceDeficit: 50,
            externalFinanceDependence: 50,
          },
        },
      },
      externalEnvironment: {
        externalPowerCompetition: 50,
        donorRiskTolerance: 50,
        commodityPressure: 50,
        regionalDiplomaticPressure: 50,
      },
    },
    institutions: {
      institution_world_test: {
        institutionId: "institution_world_test",
        resources: {
          financialCapacity: 50,
          personnelCapacity: 50,
          logisticsCapacity: 50,
          diplomaticCapacity: 50,
          intelligenceCapacity: 50,
          implementationCapacity: 50,
        },
        policyPositions: {},
        activeCommitmentIds: [],
        activeDisputeIds: [],
        legitimacy: 50,
        coordinationCapacity: 50,
      },
    },
    actors: {},
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
    doctrine: {},
    evaluation: {},
    decisions: [],
    domainEvents: [],
    processedCommandIds: {},
    versions: {
      gameSchemaVersion: 1,
      simulationModelVersion: "test-only-world-v1",
      baselineVersion: "test-only-world-v1",
      scenarioVersion: "test-only-world-v1",
      contentVersion: "test-only-world-v1",
      balanceProfileVersion: "test-only-world-v1",
      methodologyVersion: "test-only-world-v1",
    },
  });

const fixtureSource = {
  kind: "test_fixture" as const,
  fixtureId: "fixture_world_multi_subsystem",
  fixtureSeed: "fixed-world-fixture-seed",
};

const declaredEffects = [
  {
    declaredSubsystem: "institution_resources",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_resource",
      kind: "adjust_institution_resource",
      institutionId,
      resource: "financialCapacity",
      delta: 3,
    },
  },
  {
    declaredSubsystem: "territory_core",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_territory",
      kind: "adjust_territory_core",
      territoryId,
      stabilityDelta: -2,
    },
  },
  {
    declaredSubsystem: "zone_core",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_zone",
      kind: "adjust_zone_core",
      zoneId,
      statePresenceDelta: 2,
    },
  },
  {
    declaredSubsystem: "conflict",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_conflict",
      kind: "adjust_conflict",
      zoneId,
      armedActivityDelta: 4,
      escalationMomentumDelta: -2,
    },
  },
  {
    declaredSubsystem: "civilian",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_civilian",
      kind: "adjust_civilian",
      zoneId,
      humanitarianAccessDelta: -4,
    },
  },
  {
    declaredSubsystem: "infrastructure",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_infrastructure",
      kind: "adjust_infrastructure",
      assetId,
      disruptionRiskDelta: 5,
    },
  },
  {
    declaredSubsystem: "development",
    source: fixtureSource,
    effect: {
      effectId: "effect_world_development",
      kind: "adjust_development",
      zoneId,
      investmentPipelineDelta: 6,
    },
  },
] as const;

const request = (
  state: CampaignState,
  effects: readonly unknown[] = declaredEffects,
) => ({
  contractVersion: WORLD_RESOLVER_CONTRACT_VERSION,
  classification: "TEST_ONLY_WORLD_RESOLUTION",
  turn: state.meta.currentTurn,
  baseline,
  currentState: state,
  effects,
});

describe("world state subsystem resolvers", () => {
  it("keeps each mutable metric under exactly one strict owner", () => {
    const state = campaignState();
    const duplicatedTerritory = {
      ...state,
      world: {
        ...state.world,
        territories: {
          territory_world_test: {
            ...state.world.territories[territoryId],
            conflictPressure: 50,
          },
        },
      },
    };

    expect(CampaignStateSchema.safeParse(duplicatedTerritory).success).toBe(
      false,
    );
    expect(
      CampaignStateSchema.safeParse({
        ...state,
        institutions: {
          institution_wrong_key: state.institutions[institutionId],
        },
      }).success,
    ).toBe(false);
  });

  it("leaves the immutable baseline and input state unchanged", () => {
    const state = campaignState();
    const baselineBefore = hashCanonicalJson(baseline);
    const stateBefore = hashCanonicalJson(state);

    const first = resolveWorldEffects(request(state));
    const second = resolveWorldEffects(request(state));

    expect(first.status).toBe("resolved");
    expect(second).toEqual(first);
    expect(hashCanonicalJson(baseline)).toBe(baselineBefore);
    expect(hashCanonicalJson(state)).toBe(stateBefore);
  });

  it("applies only declared seeded fixture effects across subsystems", () => {
    const result = resolveWorldEffects(request(campaignState()));
    expect(result.status).toBe("resolved");
    if (result.status !== "resolved") throw new Error("fixture rejected");

    expect(
      result.nextState.institutions[institutionId]?.resources,
    ).toMatchObject({ financialCapacity: 53 });
    expect(result.nextState.world.territories[territoryId]?.stability).toBe(48);
    expect(result.nextState.world.zones[zoneId]?.statePresence).toBe(52);
    expect(result.nextState.world.conflict.zones[zoneId]).toMatchObject({
      armedActivity: 54,
      escalationMomentum: -2,
    });
    expect(
      result.nextState.world.civilian.zones[zoneId]?.humanitarianAccess,
    ).toBe(46);
    expect(
      result.nextState.world.infrastructure.assets[assetId]?.disruptionRisk,
    ).toBe(55);
    expect(
      result.nextState.world.development.zones[zoneId]?.investmentPipeline,
    ).toBe(56);
    expect(result.nextState.world.externalEnvironment).toEqual(
      campaignState().world.externalEnvironment,
    );
    expect(result.traces.map((trace) => trace.subsystem)).toEqual(
      declaredEffects.map((effect) => effect.declaredSubsystem),
    );
    expect(result.traces.every((trace) => trace.outcome === "applied")).toBe(
      true,
    );
  });

  it("rejects cross-system declarations and invalid targets atomically", () => {
    const state = campaignState();
    const before = hashCanonicalJson(state);
    const crossSystem = resolveWorldEffects(
      request(state, [
        {
          ...declaredEffects[3],
          declaredSubsystem: "civilian",
        },
      ]),
    );
    expect(crossSystem).toMatchObject({
      status: "rejected",
      reasonCode: "CROSS_SYSTEM_EFFECT",
    });

    const missingTarget = resolveWorldEffects(
      request(state, [
        {
          ...declaredEffects[3],
          effect: {
            ...declaredEffects[3].effect,
            zoneId: "zone_missing",
          },
        },
      ]),
    );
    expect(missingTarget).toMatchObject({
      status: "rejected",
      reasonCode: "TARGET_NOT_FOUND",
    });
    expect(hashCanonicalJson(state)).toBe(before);
  });

  it("publishes explicit test-only and blocked production coverage", () => {
    expect(WORLD_SUBSYSTEM_COVERAGE).toHaveLength(8);
    expect(
      WORLD_SUBSYSTEM_COVERAGE.every(
        (entry) => entry.productionDynamics === "BLOCKED",
      ),
    ).toBe(true);
    expect(
      WORLD_SUBSYSTEM_COVERAGE.find(
        (entry) => entry.subsystem === "external_environment",
      ),
    ).toMatchObject({ mode: "initial_no_op" });

    const invalidInfrastructure = {
      ...declaredEffects[5],
      effect: {
        ...declaredEffects[5].effect,
        throughputDelta: 1,
      },
    };
    expect(
      resolveWorldEffects(request(campaignState(), [invalidInfrastructure])),
    ).toMatchObject({
      status: "rejected",
      reasonCode: "INVALID_REQUEST_SCHEMA",
    });
    expect(() =>
      createTestOnlyWorldFixtureResolverRegistry({
        baseline,
        effects: declaredEffects.slice(0, 1),
      }),
    ).toThrow("does not belong to a source-ordered world phase");
    expect(
      createTestOnlyWorldFixtureResolverRegistry({
        baseline,
        effects: declaredEffects.slice(3, 4),
      }).find((resolver) => resolver.resolverId === "world_civilian"),
    ).toMatchObject({ adapterKind: "initial_no_op" });
  });

  it("runs declared fixtures only in the accepted 8a through 8d order", () => {
    const state = campaignState();
    const baselineBefore = hashCanonicalJson(baseline);
    const registry = createTestOnlyWorldFixtureResolverRegistry({
      baseline,
      effects: declaredEffects.slice(3),
    });
    const endTurn = EndTurnRequestSchema.parse({
      contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
      command: {
        commandId: "command_world_fixture_end_turn",
        commandType: "end_turn",
        campaignId: state.meta.campaignId,
        submittedTurn: state.meta.currentTurn,
        payload: {},
      },
      expectedRevision: state.meta.revision,
      expectedVersions: state.versions,
    });
    const result = simulateEndTurn(
      { request: endTurn, currentState: state },
      registry,
    );

    expect(result.status).toBe("committed");
    if (result.status !== "committed") throw new Error("turn rejected");
    expect(
      result.resolverTrace
        .filter((entry) => entry.adapterKind === "test_only_fixture")
        .map((entry) => [entry.sourceStep, entry.resolverId, entry.outcome]),
    ).toEqual([
      ["8a", "world_conflict", "applied"],
      ["8b", "world_civilian", "applied"],
      ["8c", "world_infrastructure", "applied"],
      ["8d", "world_development", "applied"],
    ]);
    expect(
      result.resolverTrace.find(
        (entry) => entry.resolverId === "world_external_environment",
      ),
    ).toMatchObject({ adapterKind: "initial_no_op", outcome: "no_change" });
    expect(result.nextState.world.conflict.zones[zoneId]?.armedActivity).toBe(
      54,
    );
    expect(result.nextState.meta.currentTurn).toBe(4);

    const secondTurn = EndTurnRequestSchema.parse({
      contractVersion: TURN_LIFECYCLE_CONTRACT_VERSION,
      command: {
        commandId: "command_world_fixture_end_turn_second",
        commandType: "end_turn",
        campaignId: result.nextState.meta.campaignId,
        submittedTurn: result.nextState.meta.currentTurn,
        payload: {},
      },
      expectedRevision: result.nextState.meta.revision,
      expectedVersions: result.nextState.versions,
    });
    const secondResult = simulateEndTurn(
      { request: secondTurn, currentState: result.nextState },
      registry,
    );
    expect(secondResult.status).toBe("committed");
    expect(hashCanonicalJson(baseline)).toBe(baselineBefore);
  });
});
