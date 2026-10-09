import { z } from "zod";

import {
  ActionIdSchema,
  ActorIdSchema,
  AssetIdSchema,
  CorridorIdSchema,
  EffectProfileIdSchema,
  EventDefinitionIdSchema,
  InstitutionIdSchema,
  TerritoryIdSchema,
  ZoneIdSchema,
} from "./ids.js";
import { JsonObjectSchema } from "./json.js";
import {
  IsoDateSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
  SignedScoreSchema,
} from "./scalars.js";
import { ActionTargetSchemaSchema } from "./commands.js";
import { RuleExpressionSchema } from "./rules.js";

const stringRecord = z.record(z.string(), z.number().finite());

const addDuplicateIssues = (
  values: readonly string[],
  path: PropertyKey[],
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate ID: ${value}`,
        path: [...path, index],
      });
    }
    seen.add(value);
  });
};

const addMissingRefIssue = (
  exists: boolean,
  value: string,
  path: PropertyKey[],
  ctx: z.RefinementCtx,
) => {
  if (!exists) {
    ctx.addIssue({
      code: "custom",
      message: `Dangling reference: ${value}`,
      path,
    });
  }
};

const checkRegistryKeys = (
  registry: Record<string, Record<string, unknown>>,
  idField: string,
  path: PropertyKey[],
  ctx: z.RefinementCtx,
) => {
  for (const [key, value] of Object.entries(registry)) {
    if (value[idField] !== key) {
      ctx.addIssue({
        code: "custom",
        message: `Registry key ${key} does not match ${idField}`,
        path: [...path, key, idField],
      });
    }
  }
};

export const AuthorityDomainSchema = z.enum([
  "diplomacy",
  "mediation",
  "security",
  "humanitarian",
  "development",
  "infrastructure",
  "monitoring",
  "sanctions",
  "finance",
  "intelligence",
]);

export const ScenarioDefinitionSchema = z
  .object({
    scenarioId: NonEmptyStringSchema,
    titleKey: NonEmptyStringSchema,
    baselineId: NonEmptyStringSchema,
    startDate: IsoDateSchema,
    maxTurns: PositiveIntegerSchema,
    turnDuration: z.literal("calendar_month"),
    decisionsPerTurn: PositiveIntegerSchema,
    representedInstitutionId: InstitutionIdSchema,
    territoryIds: z.array(TerritoryIdSchema).min(1),
    initialInstitutionIds: z.array(InstitutionIdSchema).min(1),
    initialActorIds: z.array(ActorIdSchema),
    difficultyProfileIds: z.array(NonEmptyStringSchema).min(1),
    earlyTerminationRuleIds: z.array(NonEmptyStringSchema),
    finalEvaluationProfileId: NonEmptyStringSchema,
  })
  .strict()
  .superRefine((scenario, ctx) => {
    addDuplicateIssues(scenario.territoryIds, ["territoryIds"], ctx);
    addDuplicateIssues(
      scenario.initialInstitutionIds,
      ["initialInstitutionIds"],
      ctx,
    );
    addDuplicateIssues(scenario.initialActorIds, ["initialActorIds"], ctx);
    addDuplicateIssues(
      scenario.difficultyProfileIds,
      ["difficultyProfileIds"],
      ctx,
    );
    addDuplicateIssues(
      scenario.earlyTerminationRuleIds,
      ["earlyTerminationRuleIds"],
      ctx,
    );
  });

export const TerritoryDefinitionSchema = z
  .object({
    territoryId: TerritoryIdSchema,
    nameKey: NonEmptyStringSchema,
    geometryRef: NonEmptyStringSchema,
    zoneIds: z.array(ZoneIdSchema),
    governmentInstitutionId: InstitutionIdSchema,
  })
  .strict();

export const ZoneDefinitionSchema = z
  .object({
    zoneId: ZoneIdSchema,
    territoryId: TerritoryIdSchema,
    nameKey: NonEmptyStringSchema,
    geometryRef: NonEmptyStringSchema,
    adjacentZoneIds: z.array(ZoneIdSchema),
    tags: z.array(NonEmptyStringSchema),
  })
  .strict();

export const AssetDefinitionSchema = z
  .object({
    assetId: AssetIdSchema,
    assetType: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    geometryRef: NonEmptyStringSchema,
    territoryIds: z.array(TerritoryIdSchema),
    zoneIds: z.array(ZoneIdSchema),
    ownerInstitutionIds: z.array(InstitutionIdSchema),
    sourceRecordRefs: z.array(NonEmptyStringSchema),
  })
  .strict();

export const CorridorDefinitionSchema = z
  .object({
    corridorId: CorridorIdSchema,
    corridorType: z.enum([
      "transport",
      "energy",
      "digital",
      "trade",
      "migration",
      "security",
    ]),
    zoneIds: z.array(ZoneIdSchema),
    assetIds: z.array(AssetIdSchema),
  })
  .strict();

export const InstitutionDefinitionSchema = z
  .object({
    institutionId: InstitutionIdSchema,
    institutionType: z.enum([
      "au",
      "regional_organization",
      "government",
      "multilateral",
      "external_power",
      "commercial",
      "civil_society",
      "security_actor",
    ]),
    nameKey: NonEmptyStringSchema,
    authorityDomains: z.array(AuthorityDomainSchema),
    actorIds: z.array(ActorIdSchema),
    authorizationProcedureIds: z.array(NonEmptyStringSchema),
    reportingProfileId: NonEmptyStringSchema.optional(),
  })
  .strict();

export const ActorDefinitionSchema = z
  .object({
    actorId: ActorIdSchema,
    institutionId: InstitutionIdSchema.optional(),
    actorType: z.enum([
      "political_leadership",
      "bureaucratic",
      "security",
      "armed_group",
      "diplomatic",
      "commercial",
      "civil_society",
      "community",
      "external_power",
    ]),
    nameKey: NonEmptyStringSchema,
    priorityWeights: z.record(z.string(), ScoreSchema),
    riskTolerance: ScoreSchema,
    memoryProfileId: NonEmptyStringSchema,
    reportingProfileId: NonEmptyStringSchema.optional(),
    initialRedLineDefinitionIds: z.array(NonEmptyStringSchema),
  })
  .strict();

export const DoctrineDeltaSchema = z
  .object({
    prevention: z.number().finite().optional(),
    centralization: z.number().finite().optional(),
    policyOrientation: z.number().finite().optional(),
    diplomaticStyle: z.number().finite().optional(),
  })
  .strict();

export const ActionDefinitionSchema = z
  .object({
    actionId: ActionIdSchema,
    nameKey: NonEmptyStringSchema,
    descriptionKey: NonEmptyStringSchema,
    actionDomain: AuthorityDomainSchema,
    commandType: NonEmptyStringSchema,
    decisionSlotCost: z.union([z.literal(0), z.literal(1)]),
    targetSchema: ActionTargetSchemaSchema,
    eligibilityRule: RuleExpressionSchema,
    mandateRequirement: z.enum([
      "none",
      "assessment",
      "coalition",
      "authorization",
    ]),
    knownCostProfileId: NonEmptyStringSchema.optional(),
    immediateEffectProfileIds: z.array(EffectProfileIdSchema),
    implementationProfileId: NonEmptyStringSchema.optional(),
    consequenceProfileIds: z.array(NonEmptyStringSchema),
    doctrineSignal: DoctrineDeltaSchema,
    previewPolicyId: NonEmptyStringSchema,
  })
  .strict();

export const EffectProfileSchema = z
  .object({
    effectProfileId: EffectProfileIdSchema,
    effects: z.array(JsonObjectSchema),
  })
  .strict();

const AuthorizationRequirementDefinitionSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("institution_approval"),
      institutionId: InstitutionIdSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("host_consent"),
      institutionId: InstitutionIdSchema,
    })
    .strict(),
  z
    .object({ kind: z.literal("coalition_support"), minimum: ScoreSchema })
    .strict(),
  z
    .object({ kind: z.literal("assessment_confidence"), minimum: ScoreSchema })
    .strict(),
  z.object({ kind: z.literal("rule"), rule: RuleExpressionSchema }).strict(),
]);

export const AuthorizationProcedureDefinitionSchema = z
  .object({
    authorizationProcedureId: NonEmptyStringSchema,
    authorityInstitutionIds: z.array(InstitutionIdSchema),
    requiredRequirements: z.array(AuthorizationRequirementDefinitionSchema),
    hostConsentRequired: z.boolean(),
    minimumCoalitionSupport: ScoreSchema.optional(),
    leadTimeTurns: NonNegativeIntegerSchema,
    expiryTurns: PositiveIntegerSchema.optional(),
    permittedDomains: z.array(AuthorityDomainSchema),
  })
  .strict();

export const EventDefinitionSchema = z
  .object({
    eventDefinitionId: EventDefinitionIdSchema,
    family: z.enum(["anchor", "systemic", "callback", "ambient"]),
    eligibilityRule: RuleExpressionSchema,
    weight: z.number().finite().nonnegative(),
    earliestTurn: PositiveIntegerSchema.optional(),
    latestTurn: PositiveIntegerSchema.optional(),
    cooldownTurns: NonNegativeIntegerSchema.optional(),
    maxOccurrences: PositiveIntegerSchema.optional(),
    attentionLevel: z.enum([
      "routine",
      "developing",
      "priority",
      "critical",
      "decision_required",
    ]),
    immediateEffectProfileIds: z.array(EffectProfileIdSchema),
    consequenceProfileIds: z.array(NonEmptyStringSchema),
    callbackTagsProduced: z.array(NonEmptyStringSchema),
    narrativeTemplateId: NonEmptyStringSchema.optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.earliestTurn === undefined ||
      value.latestTurn === undefined ||
      value.earliestTurn <= value.latestTurn,
    {
      message: "earliestTurn must not exceed latestTurn",
      path: ["earliestTurn"],
    },
  );

export const DoctrineProfileSchema = z
  .object({
    doctrineProfileId: NonEmptyStringSchema,
    nameKey: NonEmptyStringSchema,
    qualifyingVector: z
      .object({
        prevention: SignedScoreSchema,
        centralization: SignedScoreSchema,
        policyOrientation: SignedScoreSchema,
        diplomaticStyle: SignedScoreSchema,
      })
      .strict(),
    modifiers: z.array(
      z
        .object({
          parameterKey: NonEmptyStringSchema,
          operation: z.enum(["add", "multiply"]),
          value: z.number().finite(),
        })
        .strict(),
    ),
  })
  .strict();

export const DifficultyProfileSchema = z
  .object({
    difficultyProfileId: NonEmptyStringSchema,
    evidenceClarityModifier: z.number().finite(),
    confidenceDecayModifier: z.number().finite(),
    hiddenRedLineFrequencyModifier: z.number().finite(),
    actorAdaptationStrengthModifier: z.number().finite(),
    escalationSpeedModifier: z.number().finite(),
    implementationToleranceModifier: z.number().finite(),
    causalExplanationLevel: z.enum(["high", "standard", "low"]),
  })
  .strict();

export const BalanceConfigurationSchema = z
  .object({
    balanceProfileId: NonEmptyStringSchema,
    version: NonEmptyStringSchema,
    intelligence: stringRecord,
    actors: stringRecord,
    relationships: stringRecord,
    mandates: stringRecord,
    implementation: stringRecord,
    consequences: stringRecord,
    events: stringRecord,
    doctrine: stringRecord,
    conflict: stringRecord,
    civilian: stringRecord,
    infrastructure: stringRecord,
    development: stringRecord,
    attentionBudget: z
      .object({
        maxInterruptiveEventsPerTurn: NonNegativeIntegerSchema,
        maxPriorityItemsPerTurn: NonNegativeIntegerSchema,
        maxCriticalItemsPerTurn: NonNegativeIntegerSchema,
      })
      .strict(),
  })
  .strict();

export const MethodologyManifestSchema = z
  .object({
    methodologyVersion: NonEmptyStringSchema,
    sections: z.array(
      z
        .object({
          sectionId: NonEmptyStringSchema,
          titleKey: NonEmptyStringSchema,
          bodyKey: NonEmptyStringSchema,
        })
        .strict(),
    ),
    modelVersions: z
      .object({
        conflictModel: NonEmptyStringSchema,
        civilianModel: NonEmptyStringSchema,
        infrastructureModel: NonEmptyStringSchema,
        intelligenceModel: NonEmptyStringSchema,
        mandateModel: NonEmptyStringSchema,
      })
      .strict(),
  })
  .strict();

export const ScenarioBundleSchema = z
  .object({
    scenario: ScenarioDefinitionSchema,
    territoryDefinitions: z.record(
      TerritoryIdSchema,
      TerritoryDefinitionSchema,
    ),
    zoneDefinitions: z.record(ZoneIdSchema, ZoneDefinitionSchema),
    assetDefinitions: z.record(AssetIdSchema, AssetDefinitionSchema),
    corridorDefinitions: z.record(CorridorIdSchema, CorridorDefinitionSchema),
    institutionDefinitions: z.record(
      InstitutionIdSchema,
      InstitutionDefinitionSchema,
    ),
    actorDefinitions: z.record(ActorIdSchema, ActorDefinitionSchema),
    actionDefinitions: z.record(ActionIdSchema, ActionDefinitionSchema),
    eventDefinitions: z.record(EventDefinitionIdSchema, EventDefinitionSchema),
    authorizationProcedures: z.record(
      z.string(),
      AuthorizationProcedureDefinitionSchema,
    ),
    effectProfiles: z.record(EffectProfileIdSchema, EffectProfileSchema),
    doctrineProfiles: z.record(z.string(), DoctrineProfileSchema),
    difficultyProfiles: z.record(z.string(), DifficultyProfileSchema),
    balance: BalanceConfigurationSchema,
    methodology: MethodologyManifestSchema,
  })
  .strict()
  .superRefine((bundle, ctx) => {
    checkRegistryKeys(
      bundle.territoryDefinitions,
      "territoryId",
      ["territoryDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.zoneDefinitions,
      "zoneId",
      ["zoneDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.assetDefinitions,
      "assetId",
      ["assetDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.corridorDefinitions,
      "corridorId",
      ["corridorDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.institutionDefinitions,
      "institutionId",
      ["institutionDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.actorDefinitions,
      "actorId",
      ["actorDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.actionDefinitions,
      "actionId",
      ["actionDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.eventDefinitions,
      "eventDefinitionId",
      ["eventDefinitions"],
      ctx,
    );
    checkRegistryKeys(
      bundle.authorizationProcedures,
      "authorizationProcedureId",
      ["authorizationProcedures"],
      ctx,
    );
    checkRegistryKeys(
      bundle.effectProfiles,
      "effectProfileId",
      ["effectProfiles"],
      ctx,
    );
    checkRegistryKeys(
      bundle.doctrineProfiles,
      "doctrineProfileId",
      ["doctrineProfiles"],
      ctx,
    );
    checkRegistryKeys(
      bundle.difficultyProfiles,
      "difficultyProfileId",
      ["difficultyProfiles"],
      ctx,
    );

    const scenario = bundle.scenario;
    addMissingRefIssue(
      scenario.representedInstitutionId in bundle.institutionDefinitions,
      scenario.representedInstitutionId,
      ["scenario", "representedInstitutionId"],
      ctx,
    );
    scenario.territoryIds.forEach((id, index) =>
      addMissingRefIssue(
        id in bundle.territoryDefinitions,
        id,
        ["scenario", "territoryIds", index],
        ctx,
      ),
    );
    scenario.initialInstitutionIds.forEach((id, index) =>
      addMissingRefIssue(
        id in bundle.institutionDefinitions,
        id,
        ["scenario", "initialInstitutionIds", index],
        ctx,
      ),
    );
    scenario.initialActorIds.forEach((id, index) =>
      addMissingRefIssue(
        id in bundle.actorDefinitions,
        id,
        ["scenario", "initialActorIds", index],
        ctx,
      ),
    );
    scenario.difficultyProfileIds.forEach((id, index) =>
      addMissingRefIssue(
        id in bundle.difficultyProfiles,
        id,
        ["scenario", "difficultyProfileIds", index],
        ctx,
      ),
    );

    Object.entries(bundle.territoryDefinitions).forEach(([key, territory]) => {
      addMissingRefIssue(
        territory.governmentInstitutionId in bundle.institutionDefinitions,
        territory.governmentInstitutionId,
        ["territoryDefinitions", key, "governmentInstitutionId"],
        ctx,
      );
      addDuplicateIssues(
        territory.zoneIds,
        ["territoryDefinitions", key, "zoneIds"],
        ctx,
      );
      territory.zoneIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.zoneDefinitions,
          id,
          ["territoryDefinitions", key, "zoneIds", index],
          ctx,
        ),
      );
    });
    Object.entries(bundle.zoneDefinitions).forEach(([key, zone]) => {
      addMissingRefIssue(
        zone.territoryId in bundle.territoryDefinitions,
        zone.territoryId,
        ["zoneDefinitions", key, "territoryId"],
        ctx,
      );
      addDuplicateIssues(
        zone.adjacentZoneIds,
        ["zoneDefinitions", key, "adjacentZoneIds"],
        ctx,
      );
      zone.adjacentZoneIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.zoneDefinitions,
          id,
          ["zoneDefinitions", key, "adjacentZoneIds", index],
          ctx,
        ),
      );
    });
    Object.entries(bundle.assetDefinitions).forEach(([key, asset]) => {
      addDuplicateIssues(
        asset.territoryIds,
        ["assetDefinitions", key, "territoryIds"],
        ctx,
      );
      addDuplicateIssues(
        asset.zoneIds,
        ["assetDefinitions", key, "zoneIds"],
        ctx,
      );
      addDuplicateIssues(
        asset.ownerInstitutionIds,
        ["assetDefinitions", key, "ownerInstitutionIds"],
        ctx,
      );
      asset.territoryIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.territoryDefinitions,
          id,
          ["assetDefinitions", key, "territoryIds", index],
          ctx,
        ),
      );
      asset.zoneIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.zoneDefinitions,
          id,
          ["assetDefinitions", key, "zoneIds", index],
          ctx,
        ),
      );
      asset.ownerInstitutionIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.institutionDefinitions,
          id,
          ["assetDefinitions", key, "ownerInstitutionIds", index],
          ctx,
        ),
      );
    });
    Object.entries(bundle.corridorDefinitions).forEach(([key, corridor]) => {
      addDuplicateIssues(
        corridor.zoneIds,
        ["corridorDefinitions", key, "zoneIds"],
        ctx,
      );
      addDuplicateIssues(
        corridor.assetIds,
        ["corridorDefinitions", key, "assetIds"],
        ctx,
      );
      corridor.zoneIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.zoneDefinitions,
          id,
          ["corridorDefinitions", key, "zoneIds", index],
          ctx,
        ),
      );
      corridor.assetIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.assetDefinitions,
          id,
          ["corridorDefinitions", key, "assetIds", index],
          ctx,
        ),
      );
    });
    Object.entries(bundle.institutionDefinitions).forEach(
      ([key, institution]) => {
        addDuplicateIssues(
          institution.actorIds,
          ["institutionDefinitions", key, "actorIds"],
          ctx,
        );
        addDuplicateIssues(
          institution.authorizationProcedureIds,
          ["institutionDefinitions", key, "authorizationProcedureIds"],
          ctx,
        );
        institution.actorIds.forEach((id, index) =>
          addMissingRefIssue(
            id in bundle.actorDefinitions,
            id,
            ["institutionDefinitions", key, "actorIds", index],
            ctx,
          ),
        );
        institution.authorizationProcedureIds.forEach((id, index) =>
          addMissingRefIssue(
            id in bundle.authorizationProcedures,
            id,
            ["institutionDefinitions", key, "authorizationProcedureIds", index],
            ctx,
          ),
        );
      },
    );
    Object.entries(bundle.actorDefinitions).forEach(([key, actor]) => {
      if (actor.institutionId !== undefined) {
        addMissingRefIssue(
          actor.institutionId in bundle.institutionDefinitions,
          actor.institutionId,
          ["actorDefinitions", key, "institutionId"],
          ctx,
        );
      }
    });
    Object.entries(bundle.authorizationProcedures).forEach(
      ([key, procedure]) => {
        addDuplicateIssues(
          procedure.authorityInstitutionIds,
          ["authorizationProcedures", key, "authorityInstitutionIds"],
          ctx,
        );
        procedure.authorityInstitutionIds.forEach((id, index) =>
          addMissingRefIssue(
            id in bundle.institutionDefinitions,
            id,
            ["authorizationProcedures", key, "authorityInstitutionIds", index],
            ctx,
          ),
        );
        procedure.requiredRequirements.forEach((requirement, index) => {
          if ("institutionId" in requirement) {
            addMissingRefIssue(
              requirement.institutionId in bundle.institutionDefinitions,
              requirement.institutionId,
              [
                "authorizationProcedures",
                key,
                "requiredRequirements",
                index,
                "institutionId",
              ],
              ctx,
            );
          }
        });
      },
    );
    Object.entries(bundle.actionDefinitions).forEach(([key, action]) => {
      addDuplicateIssues(
        action.immediateEffectProfileIds,
        ["actionDefinitions", key, "immediateEffectProfileIds"],
        ctx,
      );
      action.immediateEffectProfileIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.effectProfiles,
          id,
          ["actionDefinitions", key, "immediateEffectProfileIds", index],
          ctx,
        ),
      );
    });
    Object.entries(bundle.eventDefinitions).forEach(([key, event]) => {
      addDuplicateIssues(
        event.immediateEffectProfileIds,
        ["eventDefinitions", key, "immediateEffectProfileIds"],
        ctx,
      );
      event.immediateEffectProfileIds.forEach((id, index) =>
        addMissingRefIssue(
          id in bundle.effectProfiles,
          id,
          ["eventDefinitions", key, "immediateEffectProfileIds", index],
          ctx,
        ),
      );
    });
  });

export const FixturePackageSchema = z
  .object({
    fixtureSchemaVersion: z.literal(1),
    classification: z.literal("TEST_ONLY_PARTIAL_FIXTURE"),
    fixtureId: z.string().regex(/^fixture_[a-z0-9][a-z0-9_-]*$/u),
    scenario: ScenarioDefinitionSchema,
    territoryDefinitions: z
      .record(TerritoryIdSchema, TerritoryDefinitionSchema)
      .optional(),
    zoneDefinitions: z.record(ZoneIdSchema, ZoneDefinitionSchema).optional(),
    institutionDefinitions: z
      .record(InstitutionIdSchema, InstitutionDefinitionSchema)
      .optional(),
    actorDefinitions: z.record(ActorIdSchema, ActorDefinitionSchema).optional(),
    notes: z.array(NonEmptyStringSchema),
  })
  .strict();

export type AuthorityDomain = z.infer<typeof AuthorityDomainSchema>;
export type ScenarioDefinition = z.infer<typeof ScenarioDefinitionSchema>;
export type ScenarioBundle = z.infer<typeof ScenarioBundleSchema>;
export type FixturePackage = z.infer<typeof FixturePackageSchema>;
export type ActionDefinition = z.infer<typeof ActionDefinitionSchema>;
