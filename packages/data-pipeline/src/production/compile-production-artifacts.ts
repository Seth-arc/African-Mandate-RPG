import {
  BaselinePackageSchema,
  MethodologyManifestSchema,
  ProductionScenarioConfigurationSchema,
  ScenarioBundleSchema,
  type BaselinePackage,
  type MethodologyManifest,
  type ProductionScenarioConfiguration,
  type ScenarioBundle,
} from "@african-mandate/domain";
import { z } from "zod";

import {
  APPROVED_COUNTRY_PARENTS,
  ProductionAcquisitionManifestSchema,
  type ProductionAcquisitionManifest,
} from "./source-admission.js";

export const PRODUCTION_ARTIFACT_SCHEMA_VERSION = 1 as const;
export const PRODUCTION_COMPILER_VERSION = "1.0.0" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const PositionSchema = z.tuple([z.number().finite(), z.number().finite()]);

export const ProductionMapAdminFeatureSchema = z
  .object({
    a3: z.string().length(3),
    n: z.string().min(1),
    x: z.number().finite(),
    y: z.number().finite(),
    r: z.array(z.array(PositionSchema).min(4)).min(1),
  })
  .passthrough();

export const ProductionMapBundleSchema = z
  .object({
    basemap: z
      .object({ admin1: z.array(ProductionMapAdminFeatureSchema) })
      .passthrough(),
  })
  .passthrough();

export const ProductionInitializationProfileSchema = z
  .object({
    schemaVersion: z.literal(1),
    profileVersion: z.string().min(1),
    classification: z.literal("PROPOSED_SIMULATED_PRODUCTION_INITIALIZATION"),
    status: z.literal("APPROVED"),
    approval: z.object({ decisionId: z.literal("AM-GOV-067") }).passthrough(),
    sourcePins: z
      .object({
        productionSourceAudit: z.object({ sha256: Sha256Schema }).passthrough(),
        productionScenarioConfiguration: z
          .object({ canonicalSha256: Sha256Schema })
          .passthrough(),
      })
      .passthrough(),
    campaign: z
      .object({
        scenarioId: z.string().min(1),
        startDate: z.string().date(),
        maxTurns: z.number().int().positive(),
        decisionsPerTurn: z.number().int().positive(),
        representedInstitutionId: z.string().min(1),
      })
      .passthrough(),
    versions: z
      .object({
        gameSchemaVersion: z.number().int().positive(),
        simulationModelVersion: z.string().min(1),
        baselineVersion: z.string().min(1),
        scenarioVersion: z.string().min(1),
        contentVersion: z.string().min(1),
        balanceProfileVersion: z.string().min(1),
        methodologyVersion: z.string().min(1),
        mapArtifactVersion: z.string().min(1),
      })
      .strict(),
    runtimeInitialization: z
      .object({
        envoy: z
          .object({
            materialResources: z
              .object({
                budget: z.object({ amount: z.number(), currency: z.string() }),
                personnel: z.number(),
                logistics: z.number(),
              })
              .passthrough(),
            institutionalCapacity: z.record(z.string(), z.number()),
          })
          .passthrough(),
        territoryDefaults: z.record(
          z.string(),
          z.union([z.string(), z.number()]),
        ),
        zoneDefaults: z.record(z.string(), z.union([z.string(), z.number()])),
        conflictInitialization: z.record(
          z.string(),
          z.union([z.string(), z.number()]),
        ),
        civilianDefaults: z.record(
          z.string(),
          z.union([z.string(), z.number()]),
        ),
        developmentDefaults: z.record(
          z.string(),
          z.union([z.string(), z.number()]),
        ),
        externalEnvironmentDefaults: z.record(
          z.string(),
          z.union([z.string(), z.number()]),
        ),
        institutionDefaults: z.record(
          z.string(),
          z.union([z.string(), z.number(), z.record(z.string(), z.number())]),
        ),
        actorDefaults: z.record(
          z.string(),
          z.union([z.string(), z.number(), z.array(z.string())]),
        ),
        difficultyProfile: z.record(
          z.string(),
          z.union([z.string(), z.number()]),
        ),
      })
      .passthrough(),
    mapDelivery: z
      .object({
        sourcePath: z.string().min(1),
        sourceSha256: Sha256Schema,
        sourceFormat: z.literal("AFRICAN_MAP_JSON_BUNDLE"),
        geometryPath: z.literal("basemap.admin1"),
        countryFilter: z.array(z.string()).length(5),
        subjectIdScheme: z.literal("ne-admin1:{iso3}:{slug(name)}"),
        coordinateReferenceSystem: z.literal("EPSG:4326"),
      })
      .passthrough(),
    projectionPolicy: z
      .object({ competitiveLeaderboardEnabled: z.literal(false) })
      .passthrough(),
  })
  .passthrough();

export interface ProductionConflictEvent {
  readonly eventId: string;
  readonly iso3: string;
  readonly longitude: number;
  readonly latitude: number;
}

export interface ProductionCompilationInput {
  readonly acquisition: ProductionAcquisitionManifest;
  readonly scenarioConfiguration: ProductionScenarioConfiguration;
  readonly initializationProfile: z.infer<
    typeof ProductionInitializationProfileSchema
  >;
  readonly mapBundle: z.infer<typeof ProductionMapBundleSchema>;
  readonly conflictEvents: readonly ProductionConflictEvent[];
}

export interface ProductionSemanticArtifacts {
  readonly baseline: BaselinePackage;
  readonly scenario: ScenarioBundle;
  readonly methodology: MethodologyManifest;
  readonly zoneEventCounts: Readonly<Record<string, number>>;
}

export const productionSlug = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

const pointInRing = (
  x: number,
  y: number,
  ring: readonly (readonly [number, number])[],
): boolean => {
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const current = ring[index]!;
    const prior = ring[previous]!;
    if (
      current[1] > y !== prior[1] > y &&
      x <
        ((prior[0] - current[0]) * (y - current[1])) / (prior[1] - current[1]) +
          current[0]
    ) {
      inside = !inside;
    }
  }
  return inside;
};

const unknownQuality = () => ({
  value: null,
  reasonCode: "NO_APPROVED_NUMERIC_QUALITY_MEASURE",
});

const dataQuality = () => ({
  sourceReliability: unknownQuality(),
  spatialPrecision: unknownQuality(),
  freshness: unknownQuality(),
  completeness: unknownQuality(),
  gameplayRelevance: unknownQuality(),
});

const territoryIdByIso3 = Object.fromEntries(
  APPROVED_COUNTRY_PARENTS.map(({ iso3 }) => [
    iso3,
    `territory_${iso3.toLowerCase()}`,
  ]),
);

const institutionType = (id: string) =>
  id === "institution_au_commission" || id === "institution_au_psc"
    ? ("au" as const)
    : id.startsWith("institution_government_")
      ? ("government" as const)
      : ("regional_organization" as const);

export const compileProductionSemanticArtifacts = (
  inputValue: ProductionCompilationInput,
): ProductionSemanticArtifacts => {
  const acquisition = ProductionAcquisitionManifestSchema.parse(
    inputValue.acquisition,
  );
  const configuration = ProductionScenarioConfigurationSchema.parse(
    inputValue.scenarioConfiguration,
  );
  const profile = ProductionInitializationProfileSchema.parse(
    inputValue.initializationProfile,
  );
  const mapBundle = ProductionMapBundleSchema.parse(inputValue.mapBundle);
  const allowedIso3 = new Set<string>(
    APPROVED_COUNTRY_PARENTS.map(({ iso3 }) => iso3),
  );
  const zones = mapBundle.basemap.admin1
    .filter(({ a3 }) => allowedIso3.has(a3))
    .map((feature) => ({
      ...feature,
      zoneId: `ne-admin1:${feature.a3}:${productionSlug(feature.n)}`,
    }))
    .sort((left, right) => left.zoneId.localeCompare(right.zoneId));
  if (zones.length !== acquisition.geometry.expectedZoneCount) {
    throw new TypeError("Production zone count does not match admission");
  }

  const zoneEventCounts: Record<string, number> = Object.fromEntries(
    zones.map(({ zoneId }) => [zoneId, 0]),
  );
  const territoryEventCounts: Record<string, number> = {};
  for (const event of [...inputValue.conflictEvents].sort((left, right) =>
    left.eventId.localeCompare(right.eventId),
  )) {
    const territoryId = territoryIdByIso3[event.iso3];
    if (territoryId !== undefined) {
      territoryEventCounts[territoryId] =
        (territoryEventCounts[territoryId] ?? 0) + 1;
    }
    const candidates = zones.filter(
      ({ a3, r }) =>
        a3 === event.iso3 &&
        r.some((ring) => pointInRing(event.longitude, event.latitude, ring)),
    );
    const selected = candidates.sort((left, right) =>
      left.zoneId.localeCompare(right.zoneId),
    )[0];
    if (selected !== undefined) {
      zoneEventCounts[selected.zoneId] =
        (zoneEventCounts[selected.zoneId] ?? 0) + 1;
    }
  }

  const sourceArtifacts = acquisition.sources.flatMap(({ artifacts }) =>
    artifacts.map((artifact) => ({
      sourceKey: artifact.kind.toLowerCase(),
      sourceName: artifact.attributionText,
      release: artifact.release,
      ...(artifact.dataAsOf === null ? {} : { dataAsOf: artifact.dataAsOf }),
      sourceUrl: artifact.citationUrls[0],
      license: artifact.license,
      attributionText: artifact.attributionText,
      redistributionAllowed: artifact.redistributionAllowed,
      recordCount: artifact.recordCount,
      methodologyNote: artifact.usage,
    })),
  );
  const baseline = BaselinePackageSchema.parse({
    baselineId: profile.versions.baselineVersion,
    baselineSchemaVersion: PRODUCTION_ARTIFACT_SCHEMA_VERSION,
    asOfDate: acquisition.historicalConflictAnchor,
    sourceManifest: { sources: sourceArtifacts },
    territoryBaselines: APPROVED_COUNTRY_PARENTS.map(({ iso3 }) => {
      const territoryId = territoryIdByIso3[iso3]!;
      const covered = iso3 !== "TCD";
      return {
        territoryId,
        observedIndicators: {
          conflictCoverage: covered
            ? "ADMITTED_EVENT_AGGREGATES"
            : "NO_ADMITTED_HISTORICAL_CONFLICT_OBSERVATIONS",
          displacementCoverage: "SOURCE_OMITTED_ZERO_FEATURES",
          ...(covered
            ? {
                uniqueConflictEventCount:
                  territoryEventCounts[territoryId] ?? 0,
              }
            : {}),
        },
        dataQuality: dataQuality(),
        provenanceRefs: ["docs/build/PRODUCTION_DATA_ACQUISITION.json"],
      };
    }),
    zoneBaselines: zones.map(({ zoneId, a3 }) => ({
      zoneId,
      observedIndicators: {
        coverageStatus:
          a3 === "TCD"
            ? "NO_ADMITTED_HISTORICAL_CONFLICT_OBSERVATIONS"
            : "ADMITTED_EVENT_AGGREGATES",
        ...(a3 === "TCD"
          ? {}
          : { uniqueConflictEventCount: zoneEventCounts[zoneId] ?? 0 }),
      },
      dataQuality: dataQuality(),
      provenanceRefs: ["docs/build/reports/25-source-audit.json"],
    })),
    assetBaselines: [],
    corridorBaselines: [],
    conflictBaseline: {
      zoneIndicators: Object.fromEntries(
        zones
          .filter(({ a3 }) => a3 !== "TCD")
          .map(({ zoneId }) => [
            zoneId,
            { uniqueEventCount: zoneEventCounts[zoneId] ?? 0 },
          ]),
      ),
      territoryIndicators: Object.fromEntries(
        Object.entries(territoryEventCounts).map(([territoryId, count]) => [
          territoryId,
          { uniqueEventCount: count },
        ]),
      ),
    },
    displacementBaseline: { zoneIndicators: {} },
    developmentBaseline: { zoneIndicators: {} },
    packageHash: profile.sourcePins.productionSourceAudit.sha256,
  });

  const methodology = MethodologyManifestSchema.parse({
    methodologyVersion: profile.versions.methodologyVersion,
    sections: [
      {
        sectionId: "historical_unknowns",
        titleKey: "methodology.historical_unknowns.title",
        bodyKey: "methodology.historical_unknowns.null_not_zero",
      },
      {
        sectionId: "simulated_initialization",
        titleKey: "methodology.simulated_initialization.title",
        bodyKey: "methodology.simulated_initialization.disclosed",
      },
    ],
    modelVersions: {
      conflictModel: profile.versions.simulationModelVersion,
      civilianModel: profile.versions.simulationModelVersion,
      infrastructureModel: profile.versions.simulationModelVersion,
      intelligenceModel: profile.versions.simulationModelVersion,
      mandateModel: profile.versions.simulationModelVersion,
    },
  });

  const zoneDefinitions = Object.fromEntries(
    zones.map(({ zoneId, a3 }) => [
      zoneId,
      {
        zoneId,
        territoryId: territoryIdByIso3[a3],
        nameKey: `zone.${zoneId}.name`,
        geometryRef: zoneId,
        adjacentZoneIds: [],
        tags: ["natural_earth_admin1"],
      },
    ]),
  );
  const territoryDefinitions = Object.fromEntries(
    APPROVED_COUNTRY_PARENTS.map(({ iso3 }) => {
      const territoryId = territoryIdByIso3[iso3]!;
      const government = {
        MLI: "institution_government_mali",
        BFA: "institution_government_burkina_faso",
        NER: "institution_government_niger",
        TCD: "institution_government_chad",
        MRT: "institution_government_mauritania",
      }[iso3]!;
      return [
        territoryId,
        {
          territoryId,
          nameKey: `territory.${iso3.toLowerCase()}.name`,
          geometryRef: `country:${iso3}`,
          zoneIds: zones
            .filter(({ a3 }) => a3 === iso3)
            .map(({ zoneId }) => zoneId),
          governmentInstitutionId: government,
        },
      ];
    }),
  );
  const actorIdsByInstitution = new Map<string, string[]>();
  for (const actor of configuration.actorAssumptions) {
    actorIdsByInstitution.set(actor.institutionId, [
      ...(actorIdsByInstitution.get(actor.institutionId) ?? []),
      actor.actorId,
    ]);
  }
  const institutionDefinitions = Object.fromEntries(
    configuration.institutionRoles.map(({ institutionId }) => [
      institutionId,
      {
        institutionId,
        institutionType: institutionType(institutionId),
        nameKey: `institution.${institutionId}.name`,
        authorityDomains: ["diplomacy", "intelligence"],
        actorIds: actorIdsByInstitution.get(institutionId) ?? [],
        authorizationProcedureIds: configuration.authorizationProcedures
          .filter(({ authorityInstitutionIds }) =>
            authorityInstitutionIds.includes(institutionId),
          )
          .map(({ procedureId }) => procedureId),
      },
    ]),
  );
  const actorDefinitions = Object.fromEntries(
    configuration.actorAssumptions.map((actor) => [
      actor.actorId,
      {
        actorId: actor.actorId,
        institutionId: actor.institutionId,
        actorType: "diplomatic",
        nameKey: `actor.${actor.actorId}.name`,
        priorityWeights: {},
        riskTolerance: actor.riskTolerance,
        memoryProfileId: "memory_simulated_default_v1",
        initialRedLineDefinitionIds: [],
      },
    ]),
  );
  const alwaysEligible = {
    kind: "predicate",
    query: { fact: "player.secretariat_capacity" },
    operator: "gte",
    value: 0,
    unknownPolicy: "propagate",
  } as const;
  const actionDefinitions = Object.fromEntries(
    configuration.actionCosts.map(
      ({ actionId, decisionSlotCost, costProfile }) => {
        const allowedKinds =
          actionId === "action_simulated_collect_evidence"
            ? ["territory", "zone"]
            : actionId === "action_simulated_consult_counterpart"
              ? ["actor", "institution"]
              : ["institution"];
        return [
          actionId,
          {
            actionId,
            nameKey: `action.${actionId}.name`,
            descriptionKey: `action.${actionId}.description`,
            actionDomain:
              actionId === "action_simulated_collect_evidence"
                ? "intelligence"
                : "diplomacy",
            commandType: "strategic_action",
            decisionSlotCost,
            targetSchema: {
              allowedKinds,
              minTargets: 1,
              maxTargets: 1,
              uniqueTargets: true,
            },
            eligibilityRule: alwaysEligible,
            mandateRequirement: "none",
            knownCostProfileId: costProfile.knownCostProfileId,
            immediateEffectProfileIds: [],
            consequenceProfileIds: [],
            doctrineSignal: {
              prevention: 0,
              centralization: 0,
              policyOrientation: 0,
              diplomaticStyle: 0,
            },
            previewPolicyId: "preview_known_costs_only_v1",
          },
        ];
      },
    ),
  );
  const authorizationProcedures = Object.fromEntries(
    configuration.authorizationProcedures.map((procedure) => [
      procedure.procedureId,
      {
        authorizationProcedureId: procedure.procedureId,
        authorityInstitutionIds: procedure.authorityInstitutionIds,
        requiredRequirements: procedure.authorityInstitutionIds.map(
          (institutionId) => ({
            kind: "institution_approval" as const,
            institutionId,
          }),
        ),
        hostConsentRequired: true,
        leadTimeTurns: procedure.leadTimeTurns,
        expiryTurns: procedure.expiryTurns,
        permittedDomains: ["diplomacy"],
      },
    ]),
  );
  const difficulty = profile.runtimeInitialization.difficultyProfile;
  const difficultyProfileId = String(difficulty["difficultyProfileId"]);
  const initial = profile.runtimeInitialization;
  const coefficient = (
    section: Readonly<Record<string, unknown>>,
    key: string,
  ): number => {
    const value = section[key];
    if (typeof value !== "number") {
      throw new TypeError(`Missing numeric production coefficient: ${key}`);
    }
    return value;
  };
  const actionCosts = Object.fromEntries(
    configuration.actionCosts.flatMap(({ actionId, costProfile }) =>
      costProfile.costs.map((cost) => [
        `cost.${actionId}.${cost.costType}`,
        cost.amount ?? cost.money?.amount ?? 0,
      ]),
    ),
  );
  const scenario = ScenarioBundleSchema.parse({
    scenario: {
      scenarioId: profile.campaign.scenarioId,
      titleKey: "scenario.sahel_five_country.title",
      baselineId: baseline.baselineId,
      startDate: profile.campaign.startDate,
      maxTurns: profile.campaign.maxTurns,
      turnDuration: "calendar_month",
      decisionsPerTurn: profile.campaign.decisionsPerTurn,
      representedInstitutionId: profile.campaign.representedInstitutionId,
      territoryIds: Object.keys(territoryDefinitions),
      initialInstitutionIds: Object.keys(institutionDefinitions),
      initialActorIds: Object.keys(actorDefinitions),
      difficultyProfileIds: [difficultyProfileId],
      earlyTerminationRuleIds: [],
      finalEvaluationProfileId: configuration.evaluation.evaluationProfileId,
    },
    territoryDefinitions,
    zoneDefinitions,
    assetDefinitions: {},
    corridorDefinitions: {},
    institutionDefinitions,
    actorDefinitions,
    actionDefinitions,
    eventDefinitions: {},
    authorizationProcedures,
    effectProfiles: {},
    doctrineProfiles: {},
    difficultyProfiles: {
      [difficultyProfileId]: {
        difficultyProfileId,
        evidenceClarityModifier: Number(difficulty["evidenceClarityModifier"]),
        confidenceDecayModifier: Number(difficulty["confidenceDecayModifier"]),
        hiddenRedLineFrequencyModifier: Number(
          difficulty["hiddenRedLineFrequencyModifier"],
        ),
        actorAdaptationStrengthModifier: Number(
          difficulty["actorAdaptationStrengthModifier"],
        ),
        escalationSpeedModifier: Number(difficulty["escalationSpeedModifier"]),
        implementationToleranceModifier: Number(
          difficulty["implementationToleranceModifier"],
        ),
        causalExplanationLevel: String(difficulty["causalExplanationLevel"]),
      },
    },
    balance: {
      ...configuration.balance,
      intelligence: {
        ...configuration.balance.intelligence,
        "initial.intelligence_confidence":
          initial.envoy.institutionalCapacity["intelligenceConfidence"],
      },
      actors: {
        ...configuration.balance.actors,
        "initial.capability": coefficient(
          initial.actorDefaults,
          "capabilityScores",
        ),
        "initial.aggressiveness": coefficient(
          initial.actorDefaults,
          "aggressiveness",
        ),
        "initial.opportunism": coefficient(
          initial.actorDefaults,
          "opportunism",
        ),
        "initial.fatigue": coefficient(initial.actorDefaults, "fatigue"),
        ...Object.fromEntries(
          configuration.actorAssumptions.map(
            ({ actorId, cooperationBaseline }) => [
              `initial.compromise.${actorId}`,
              cooperationBaseline,
            ],
          ),
        ),
      },
      relationships: {
        ...configuration.balance.relationships,
        "initial.institution_resource": coefficient(
          initial.institutionDefaults,
          "resourceScores",
        ),
        "initial.institution_legitimacy": coefficient(
          initial.institutionDefaults,
          "legitimacy",
        ),
        "initial.institution_coordination": coefficient(
          initial.institutionDefaults,
          "coordinationCapacity",
        ),
      },
      implementation: {
        ...configuration.balance.implementation,
        "initial.budget_usd": initial.envoy.materialResources.budget.amount,
        "initial.personnel": initial.envoy.materialResources.personnel,
        "initial.logistics": initial.envoy.materialResources.logistics,
        ...Object.fromEntries(
          Object.entries(initial.envoy.institutionalCapacity).map(
            ([key, value]) => [`initial.player.${key}`, value],
          ),
        ),
        ...actionCosts,
      },
      events: {
        ...configuration.balance.events,
        "initial.territory.stability": coefficient(
          initial.territoryDefaults,
          "stability",
        ),
        "initial.territory.institutional_capacity": coefficient(
          initial.territoryDefaults,
          "institutionalCapacity",
        ),
        "initial.territory.economic_resilience": coefficient(
          initial.territoryDefaults,
          "economicResilience",
        ),
        "initial.zone.state_presence": coefficient(
          initial.zoneDefaults,
          "statePresence",
        ),
        "initial.zone.control_contest": coefficient(
          initial.zoneDefaults,
          "controlContest",
        ),
        "initial.zone.local_governance_capacity": coefficient(
          initial.zoneDefaults,
          "localGovernanceCapacity",
        ),
        ...Object.fromEntries(
          Object.entries(initial.externalEnvironmentDefaults)
            .filter(([, value]) => typeof value === "number")
            .map(([key, value]) => [`initial.external.${key}`, value]),
        ),
      },
      conflict: {
        ...configuration.balance.conflict,
        ...Object.fromEntries(
          Object.entries(initial.conflictInitialization)
            .filter(([, value]) => typeof value === "number")
            .map(([key, value]) => [`initial.${key}`, value]),
        ),
      },
      civilian: {
        ...configuration.balance.civilian,
        ...Object.fromEntries(
          Object.entries(initial.civilianDefaults)
            .filter(([, value]) => typeof value === "number")
            .map(([key, value]) => [`initial.${key}`, value]),
        ),
      },
      development: {
        ...configuration.balance.development,
        ...Object.fromEntries(
          Object.entries(initial.developmentDefaults)
            .filter(([, value]) => typeof value === "number")
            .map(([key, value]) => [`initial.${key}`, value]),
        ),
      },
    },
    methodology,
  });

  return { baseline, scenario, methodology, zoneEventCounts };
};

export const assertProductionClassification = (value: unknown): void => {
  const serialized = JSON.stringify(value);
  if (/TEST_ONLY|test-only|test_only/u.test(serialized)) {
    throw new TypeError("Production artifacts must not contain TEST_ONLY data");
  }
};
