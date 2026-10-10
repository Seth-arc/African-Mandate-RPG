import { z } from "zod";

import { BaselinePackageSchema } from "./baseline.js";
import { CampaignStateSchema } from "./campaign.js";
import {
  AssetIdSchema,
  ConsequenceIdSchema,
  CorridorIdSchema,
  InstitutionIdSchema,
  TerritoryIdSchema,
  WorldEventIdSchema,
  ZoneIdSchema,
} from "./ids.js";
import { NonEmptyStringSchema, PositiveIntegerSchema } from "./scalars.js";
import { AssetOperationalStatusSchema } from "./world-state.js";

export const WORLD_RESOLVER_CONTRACT_VERSION = "1.0.0" as const;

const EffectBaseSchema = z.object({ effectId: NonEmptyStringSchema });
const delta = z.number().finite();

const requireOneDelta = (
  value: Record<string, unknown>,
  fields: readonly string[],
  ctx: z.RefinementCtx,
): void => {
  if (!fields.some((field) => value[field] !== undefined)) {
    ctx.addIssue({
      code: "custom",
      message: "At least one canonical delta is required",
    });
  }
};

export const AdjustInstitutionResourceEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_institution_resource"),
  institutionId: InstitutionIdSchema,
  resource: z.enum([
    "financialCapacity",
    "personnelCapacity",
    "logisticsCapacity",
    "diplomaticCapacity",
    "intelligenceCapacity",
    "implementationCapacity",
  ]),
  delta,
}).strict();

export const AdjustTerritoryCoreEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_territory_core"),
  territoryId: TerritoryIdSchema,
  stabilityDelta: delta.optional(),
  institutionalCapacityDelta: delta.optional(),
  economicResilienceDelta: delta.optional(),
})
  .strict()
  .superRefine((value, ctx) =>
    requireOneDelta(
      value,
      [
        "stabilityDelta",
        "institutionalCapacityDelta",
        "economicResilienceDelta",
      ],
      ctx,
    ),
  );

export const AdjustZoneCoreEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_zone_core"),
  zoneId: ZoneIdSchema,
  statePresenceDelta: delta.optional(),
  controlContestDelta: delta.optional(),
  localGovernanceCapacityDelta: delta.optional(),
})
  .strict()
  .superRefine((value, ctx) =>
    requireOneDelta(
      value,
      [
        "statePresenceDelta",
        "controlContestDelta",
        "localGovernanceCapacityDelta",
      ],
      ctx,
    ),
  );

export const AdjustConflictEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_conflict"),
  zoneId: ZoneIdSchema,
  armedActivityDelta: delta.optional(),
  civilianTargetingDelta: delta.optional(),
  actorFragmentationDelta: delta.optional(),
  mobilityDelta: delta.optional(),
  recruitmentPressureDelta: delta.optional(),
  escalationMomentumDelta: delta.optional(),
  spilloverPressureDelta: delta.optional(),
})
  .strict()
  .superRefine((value, ctx) =>
    requireOneDelta(
      value,
      [
        "armedActivityDelta",
        "civilianTargetingDelta",
        "actorFragmentationDelta",
        "mobilityDelta",
        "recruitmentPressureDelta",
        "escalationMomentumDelta",
        "spilloverPressureDelta",
      ],
      ctx,
    ),
  );

export const AdjustCivilianEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_civilian"),
  zoneId: ZoneIdSchema,
  civilianConfidenceDelta: delta.optional(),
  displacementPressureDelta: delta.optional(),
  humanitarianAccessDelta: delta.optional(),
  serviceReliabilityDelta: delta.optional(),
  perceivedLegitimacyDelta: delta.optional(),
})
  .strict()
  .superRefine((value, ctx) =>
    requireOneDelta(
      value,
      [
        "civilianConfidenceDelta",
        "displacementPressureDelta",
        "humanitarianAccessDelta",
        "serviceReliabilityDelta",
        "perceivedLegitimacyDelta",
      ],
      ctx,
    ),
  );

export const AdjustDevelopmentEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_development"),
  zoneId: ZoneIdSchema,
  investmentPipelineDelta: delta.optional(),
  implementationAbsorptionDelta: delta.optional(),
  infrastructureNeedDelta: delta.optional(),
  serviceDeficitDelta: delta.optional(),
  externalFinanceDependenceDelta: delta.optional(),
})
  .strict()
  .superRefine((value, ctx) =>
    requireOneDelta(
      value,
      [
        "investmentPipelineDelta",
        "implementationAbsorptionDelta",
        "infrastructureNeedDelta",
        "serviceDeficitDelta",
        "externalFinanceDependenceDelta",
      ],
      ctx,
    ),
  );

export const AdjustInfrastructureEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("adjust_infrastructure"),
  assetId: AssetIdSchema.optional(),
  corridorId: CorridorIdSchema.optional(),
  disruptionRiskDelta: delta.optional(),
  conflictExposureDelta: delta.optional(),
  economicDependencyDelta: delta.optional(),
  throughputDelta: delta.optional(),
  resilienceDelta: delta.optional(),
})
  .strict()
  .superRefine((value, ctx) => {
    if ((value.assetId === undefined) === (value.corridorId === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "Exactly one infrastructure target is required",
      });
    }
    requireOneDelta(
      value,
      [
        "disruptionRiskDelta",
        "conflictExposureDelta",
        "economicDependencyDelta",
        "throughputDelta",
        "resilienceDelta",
      ],
      ctx,
    );
    if (
      value.assetId !== undefined &&
      (value.throughputDelta !== undefined ||
        value.resilienceDelta !== undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Corridor deltas cannot target an asset",
      });
    }
    if (
      value.corridorId !== undefined &&
      (value.conflictExposureDelta !== undefined ||
        value.economicDependencyDelta !== undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Asset deltas cannot target a corridor",
      });
    }
  });

export const SetAssetStatusEffectSchema = EffectBaseSchema.extend({
  kind: z.literal("set_asset_status"),
  assetId: AssetIdSchema,
  status: AssetOperationalStatusSchema,
}).strict();

export const WorldEffectSchema = z.union([
  AdjustInstitutionResourceEffectSchema,
  AdjustTerritoryCoreEffectSchema,
  AdjustZoneCoreEffectSchema,
  AdjustConflictEffectSchema,
  AdjustCivilianEffectSchema,
  AdjustInfrastructureEffectSchema,
  SetAssetStatusEffectSchema,
  AdjustDevelopmentEffectSchema,
]);

export const WORLD_SUBSYSTEM_IDS = [
  "institution_resources",
  "territory_core",
  "zone_core",
  "conflict",
  "civilian",
  "infrastructure",
  "development",
  "external_environment",
] as const;

export const WorldSubsystemIdSchema = z.enum(WORLD_SUBSYSTEM_IDS);

export const WorldEffectSourceSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("scheduled_consequence"),
      consequenceId: ConsequenceIdSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("world_event"),
      worldEventId: WorldEventIdSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("test_fixture"),
      fixtureId: NonEmptyStringSchema,
      fixtureSeed: NonEmptyStringSchema,
    })
    .strict(),
]);

export const WorldEffectEnvelopeSchema = z
  .object({
    declaredSubsystem: WorldSubsystemIdSchema,
    source: WorldEffectSourceSchema,
    effect: WorldEffectSchema,
  })
  .strict();

export const WorldResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(WORLD_RESOLVER_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_WORLD_RESOLUTION"),
    turn: PositiveIntegerSchema,
    baseline: BaselinePackageSchema,
    currentState: CampaignStateSchema,
    effects: z.array(WorldEffectEnvelopeSchema),
  })
  .strict()
  .superRefine((request, ctx) => {
    const effectIds = new Set<string>();
    request.effects.forEach((envelope, index) => {
      if (effectIds.has(envelope.effect.effectId)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate effectId: ${envelope.effect.effectId}`,
          path: ["effects", index, "effect", "effectId"],
        });
      }
      effectIds.add(envelope.effect.effectId);
    });
  });

export const WorldResolutionTraceSchema = z
  .object({
    traceId: NonEmptyStringSchema,
    turn: PositiveIntegerSchema,
    subsystem: WorldSubsystemIdSchema,
    effectId: NonEmptyStringSchema,
    source: WorldEffectSourceSchema,
    outcome: z.enum(["applied", "no_change"]),
    changedFields: z.array(NonEmptyStringSchema),
  })
  .strict();

export const WorldResolutionRejectionReasonSchema = z.enum([
  "INVALID_REQUEST_SCHEMA",
  "TURN_MISMATCH",
  "CROSS_SYSTEM_EFFECT",
  "SOURCE_NOT_FOUND",
  "SOURCE_NOT_ELIGIBLE",
  "TARGET_NOT_FOUND",
  "INVALID_RESULT",
  "BASELINE_MUTATED",
]);

export const WorldResolutionResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      traces: z.array(WorldResolutionTraceSchema),
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: WorldResolutionRejectionReasonSchema,
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const WorldSubsystemCoverageSchema = z
  .object({
    contractVersion: z.literal(WORLD_RESOLVER_CONTRACT_VERSION),
    subsystem: WorldSubsystemIdSchema,
    ownerPath: NonEmptyStringSchema,
    mode: z.enum(["canonical_typed_effects", "initial_no_op"]),
    productionDynamics: z.literal("BLOCKED"),
    blocker: NonEmptyStringSchema,
  })
  .strict();

export type WorldEffect = z.infer<typeof WorldEffectSchema>;
export type WorldEffectEnvelope = z.infer<typeof WorldEffectEnvelopeSchema>;
export type WorldEffectSource = z.infer<typeof WorldEffectSourceSchema>;
export type WorldSubsystemId = z.infer<typeof WorldSubsystemIdSchema>;
export type WorldResolutionRequest = z.infer<
  typeof WorldResolutionRequestSchema
>;
export type WorldResolutionResult = z.infer<typeof WorldResolutionResultSchema>;
export type WorldResolutionTrace = z.infer<typeof WorldResolutionTraceSchema>;
export type WorldResolutionRejectionReason = z.infer<
  typeof WorldResolutionRejectionReasonSchema
>;
export type WorldSubsystemCoverage = z.infer<
  typeof WorldSubsystemCoverageSchema
>;
