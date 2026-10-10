import { describe, expect, it } from "vitest";

import {
  BaselinePackageSchema,
  CampaignStateSchema,
  FixturePackageSchema,
  PartyRefSchema,
  RuleExpressionSchema,
  ScenarioBundleSchema,
  SubjectRefSchema,
} from "@african-mandate/domain";

const structuralScenarioBundle = () => ({
  scenario: {
    scenarioId: "scenario_schema_conformance_example",
    titleKey: "test.schema.title",
    baselineId: "baseline_schema_conformance_example",
    startDate: "2025-10-01",
    maxTurns: 20,
    turnDuration: "calendar_month",
    decisionsPerTurn: 3,
    representedInstitutionId: "institution_schema_example",
    territoryIds: ["territory_schema_example"],
    initialInstitutionIds: ["institution_schema_example"],
    initialActorIds: [],
    difficultyProfileIds: ["difficulty_schema_example"],
    earlyTerminationRuleIds: [],
    finalEvaluationProfileId: "evaluation_schema_example",
  },
  territoryDefinitions: {
    territory_schema_example: {
      territoryId: "territory_schema_example",
      nameKey: "test.territory.name",
      geometryRef: "test-only-no-production-geometry",
      zoneIds: ["zone_schema_example"],
      governmentInstitutionId: "institution_schema_example",
    },
  },
  zoneDefinitions: {
    zone_schema_example: {
      zoneId: "zone_schema_example",
      territoryId: "territory_schema_example",
      nameKey: "test.zone.name",
      geometryRef: "test-only-no-production-geometry",
      adjacentZoneIds: [],
      tags: ["test_only"],
    },
  },
  assetDefinitions: {},
  corridorDefinitions: {},
  institutionDefinitions: {
    institution_schema_example: {
      institutionId: "institution_schema_example",
      institutionType: "au",
      nameKey: "test.institution.name",
      authorityDomains: ["diplomacy"],
      actorIds: [],
      authorizationProcedureIds: [],
    },
  },
  actorDefinitions: {},
  actionDefinitions: {},
  eventDefinitions: {},
  authorizationProcedures: {},
  effectProfiles: {},
  doctrineProfiles: {},
  difficultyProfiles: {
    difficulty_schema_example: {
      difficultyProfileId: "difficulty_schema_example",
      evidenceClarityModifier: 1,
      confidenceDecayModifier: 1,
      hiddenRedLineFrequencyModifier: 1,
      actorAdaptationStrengthModifier: 1,
      escalationSpeedModifier: 1,
      implementationToleranceModifier: 1,
      causalExplanationLevel: "standard",
    },
  },
  balance: {
    balanceProfileId: "balance_schema_example_test_only",
    version: "test-only-v1",
    intelligence: {},
    actors: {},
    relationships: {},
    mandates: {},
    implementation: {},
    consequences: {},
    events: {},
    doctrine: {},
    conflict: {},
    civilian: {},
    infrastructure: {},
    development: {},
    attentionBudget: {
      maxInterruptiveEventsPerTurn: 0,
      maxPriorityItemsPerTurn: 0,
      maxCriticalItemsPerTurn: 0,
    },
  },
  methodology: {
    methodologyVersion: "test-only-v1",
    sections: [],
    modelVersions: {
      conflictModel: "test-only-v1",
      civilianModel: "test-only-v1",
      infrastructureModel: "test-only-v1",
      intelligenceModel: "test-only-v1",
      mandateModel: "test-only-v1",
    },
  },
});

const baselinePackage = () => ({
  baselineId: "baseline_schema_conformance_example",
  baselineSchemaVersion: 1,
  asOfDate: "2025-09-26",
  sourceManifest: {
    sources: [
      {
        sourceKey: "test-only-source",
        sourceName: "Schema conformance source",
        recordCount: 1,
      },
    ],
  },
  territoryBaselines: [
    {
      territoryId: "territory_schema_example",
      observedIndicators: {},
      dataQuality: {
        sourceReliability: 0,
        spatialPrecision: 0,
        freshness: 0,
        completeness: 0,
        gameplayRelevance: 0,
      },
      provenanceRefs: ["test-only-source:1"],
    },
  ],
  zoneBaselines: [],
  assetBaselines: [],
  corridorBaselines: [],
  conflictBaseline: { zoneIndicators: {}, territoryIndicators: {} },
  displacementBaseline: { zoneIndicators: {} },
  developmentBaseline: { zoneIndicators: {} },
  packageHash: "0".repeat(64),
});

const campaignState = () => ({
  meta: {
    campaignId: "campaign_schema_example",
    scenarioId: "scenario_schema_conformance_example",
    campaignSeed: "schema-test-seed",
    difficultyProfileId: "difficulty_schema_example",
    currentTurn: 1,
    maxTurns: 20,
    currentDate: "2025-10-01",
    decisionsRemaining: 3,
    decisionsPerTurn: 3,
    revision: 0,
    status: "active",
  },
  player: {
    representedInstitutionId: "institution_schema_example",
    materialResources: {
      budget: { amount: 0, currency: "TEST" },
      personnel: 0,
      logistics: 0,
    },
    institutionalCapacity: {
      mandateAuthority: 0,
      politicalCapital: 0,
      secretariatCapacity: 0,
      memberStateAlignment: 0,
      partnerConfidence: 0,
      implementationCapacity: 0,
      intelligenceConfidence: 0,
    },
  },
  world: {
    territories: {},
    zones: {},
    conflict: { zones: {} },
    civilian: { zones: {} },
    infrastructure: { assets: {}, corridors: {} },
    development: { zones: {} },
    externalEnvironment: {
      externalPowerCompetition: 0,
      donorRiskTolerance: 0,
      commodityPressure: 0,
      regionalDiplomaticPressure: 0,
    },
  },
  institutions: {},
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
    simulationModelVersion: "test-only-v1",
    baselineVersion: "test-only-v1",
    scenarioVersion: "test-only-v1",
    contentVersion: "test-only-v1",
    balanceProfileVersion: "test-only-v1",
    methodologyVersion: "test-only-v1",
  },
});

describe("canonical serialized domain contracts", () => {
  it("accepts complete structural examples without claiming production admission", () => {
    expect(
      ScenarioBundleSchema.safeParse(structuralScenarioBundle()).success,
    ).toBe(true);
    expect(BaselinePackageSchema.safeParse(baselinePackage()).success).toBe(
      true,
    );
    expect(CampaignStateSchema.safeParse(campaignState()).success).toBe(true);
    expect(
      PartyRefSchema.safeParse({
        kind: "institution",
        institutionId: "institution_schema_example",
      }).success,
    ).toBe(true);
    expect(
      SubjectRefSchema.safeParse({
        kind: "territory",
        territoryId: "territory_schema_example",
      }).success,
    ).toBe(true);
  });

  it("rejects unknown keys", () => {
    expect(
      CampaignStateSchema.safeParse({ ...campaignState(), unknownField: true })
        .success,
    ).toBe(false);
  });

  it("requires structured fact queries rather than arbitrary paths", () => {
    expect(
      RuleExpressionSchema.safeParse({
        kind: "predicate",
        query: {
          fact: "territory.stability",
          subject: {
            kind: "literal",
            subject: {
              kind: "territory",
              territoryId: "territory_schema_example",
            },
          },
        },
        operator: "gte",
        value: 1,
      }).success,
    ).toBe(true);
    expect(
      RuleExpressionSchema.safeParse({
        kind: "predicate",
        query: "world.territories.example.stability",
        operator: "gte",
        value: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects dangling references", () => {
    const bundle = structuralScenarioBundle();
    bundle.scenario.territoryIds = ["territory_missing"];
    expect(ScenarioBundleSchema.safeParse(bundle).success).toBe(false);
  });

  it("rejects duplicate IDs", () => {
    const bundle = structuralScenarioBundle();
    bundle.scenario.territoryIds = [
      "territory_schema_example",
      "territory_schema_example",
    ];
    expect(ScenarioBundleSchema.safeParse(bundle).success).toBe(false);

    const baseline = baselinePackage();
    baseline.territoryBaselines.push(
      structuredClone(baseline.territoryBaselines[0]!),
    );
    expect(BaselinePackageSchema.safeParse(baseline).success).toBe(false);
  });

  it("rejects impossible scalar bounds", () => {
    const campaign = campaignState();
    campaign.player.materialResources.logistics = 101;
    expect(CampaignStateSchema.safeParse(campaign).success).toBe(false);
  });

  it("rejects non-JSON campaign state", () => {
    const campaign = campaignState();
    const stateWithNonJson = {
      ...campaign,
      world: { generatedAt: new Date() },
    };
    expect(CampaignStateSchema.safeParse(stateWithNonJson).success).toBe(false);
  });

  it("rejects an invalid campaign status", () => {
    const campaign = campaignState();
    const invalidStatus = {
      ...campaign,
      meta: { ...campaign.meta, status: "paused" },
    };
    expect(CampaignStateSchema.safeParse(invalidStatus).success).toBe(false);
  });

  it("keeps a partial fixture isolated from ScenarioBundle", () => {
    const fixture = {
      fixtureSchemaVersion: 1,
      classification: "TEST_ONLY_PARTIAL_FIXTURE",
      fixtureId: "fixture_schema_example",
      scenario: structuralScenarioBundle().scenario,
      territoryDefinitions: structuralScenarioBundle().territoryDefinitions,
      notes: ["Synthetic schema fixture; not production content."],
    };

    expect(FixturePackageSchema.safeParse(fixture).success).toBe(true);
    expect(ScenarioBundleSchema.safeParse(fixture).success).toBe(false);
  });
});
