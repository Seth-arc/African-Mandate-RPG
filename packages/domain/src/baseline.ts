import { z } from "zod";

import {
  AssetIdSchema,
  CorridorIdSchema,
  TerritoryIdSchema,
  ZoneIdSchema,
} from "./ids.js";
import {
  IsoDateSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  ScoreSchema,
} from "./scalars.js";

const observedValueSchema = z.union([
  z.number().finite(),
  z.string(),
  z.boolean(),
]);
const observedNullableValueSchema = observedValueSchema.nullable();
const numericIndicatorRecordSchema = z.record(z.string(), z.number().finite());

const DataQualitySchema = z
  .object({
    sourceReliability: ScoreSchema,
    spatialPrecision: ScoreSchema,
    freshness: ScoreSchema,
    completeness: ScoreSchema,
    gameplayRelevance: ScoreSchema,
  })
  .strict();

const SourceManifestEntrySchema = z
  .object({
    sourceKey: NonEmptyStringSchema,
    sourceName: NonEmptyStringSchema,
    release: NonEmptyStringSchema.optional(),
    dataAsOf: IsoDateSchema.optional(),
    fetchedAt: NonEmptyStringSchema.optional(),
    sourceUrl: z.url().optional(),
    license: NonEmptyStringSchema.optional(),
    attributionText: NonEmptyStringSchema.optional(),
    redistributionAllowed: z.boolean().optional(),
    shareAlikeRequired: z.boolean().optional(),
    recordCount: NonNegativeIntegerSchema,
    methodologyNote: NonEmptyStringSchema.optional(),
  })
  .strict();

export const SourceManifestSchema = z
  .object({ sources: z.array(SourceManifestEntrySchema) })
  .strict()
  .superRefine((manifest, ctx) => {
    const sourceKeys = new Set<string>();
    manifest.sources.forEach((source, index) => {
      if (sourceKeys.has(source.sourceKey)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate sourceKey: ${source.sourceKey}`,
          path: ["sources", index, "sourceKey"],
        });
      }
      sourceKeys.add(source.sourceKey);
    });
  });

const TerritoryBaselineSchema = z
  .object({
    territoryId: TerritoryIdSchema,
    observedPopulation: NonNegativeIntegerSchema.optional(),
    observedIndicators: z.record(z.string(), observedValueSchema),
    dataQuality: DataQualitySchema,
    provenanceRefs: z.array(NonEmptyStringSchema),
  })
  .strict();

const ZoneBaselineSchema = z
  .object({
    zoneId: ZoneIdSchema,
    observedPopulation: NonNegativeIntegerSchema.optional(),
    observedIndicators: z.record(z.string(), observedValueSchema),
    dataQuality: DataQualitySchema,
    provenanceRefs: z.array(NonEmptyStringSchema),
  })
  .strict();

const AssetBaselineSchema = z
  .object({
    assetId: AssetIdSchema,
    observedStatus: NonEmptyStringSchema,
    observedProperties: z.record(z.string(), observedNullableValueSchema),
    dataQuality: DataQualitySchema,
    provenanceRefs: z.array(NonEmptyStringSchema),
  })
  .strict();

const CorridorBaselineSchema = z
  .object({
    corridorId: CorridorIdSchema,
    observedIndicators: z.record(z.string(), observedValueSchema),
    dataQuality: DataQualitySchema,
    provenanceRefs: z.array(NonEmptyStringSchema),
  })
  .strict();

const addDuplicateEntityIssues = (
  values: readonly Record<string, unknown>[],
  field: string,
  path: string,
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<unknown>();
  values.forEach((value, index) => {
    const entityId = value[field];
    if (seen.has(entityId)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate ID: ${String(entityId)}`,
        path: [path, index, field],
      });
    }
    seen.add(entityId);
  });
};

export const BaselinePackageSchema = z
  .object({
    baselineId: NonEmptyStringSchema,
    baselineSchemaVersion: z.number().int().positive(),
    asOfDate: IsoDateSchema,
    sourceManifest: SourceManifestSchema,
    territoryBaselines: z.array(TerritoryBaselineSchema),
    zoneBaselines: z.array(ZoneBaselineSchema),
    assetBaselines: z.array(AssetBaselineSchema),
    corridorBaselines: z.array(CorridorBaselineSchema),
    conflictBaseline: z
      .object({
        zoneIndicators: z.record(ZoneIdSchema, numericIndicatorRecordSchema),
        territoryIndicators: z.record(
          TerritoryIdSchema,
          numericIndicatorRecordSchema,
        ),
      })
      .strict(),
    displacementBaseline: z
      .object({
        zoneIndicators: z.record(ZoneIdSchema, numericIndicatorRecordSchema),
      })
      .strict(),
    developmentBaseline: z
      .object({
        zoneIndicators: z.record(ZoneIdSchema, numericIndicatorRecordSchema),
      })
      .strict(),
    packageHash: z.string().regex(/^[a-f0-9]{64}$/u),
  })
  .strict()
  .superRefine((baseline, ctx) => {
    addDuplicateEntityIssues(
      baseline.territoryBaselines,
      "territoryId",
      "territoryBaselines",
      ctx,
    );
    addDuplicateEntityIssues(
      baseline.zoneBaselines,
      "zoneId",
      "zoneBaselines",
      ctx,
    );
    addDuplicateEntityIssues(
      baseline.assetBaselines,
      "assetId",
      "assetBaselines",
      ctx,
    );
    addDuplicateEntityIssues(
      baseline.corridorBaselines,
      "corridorId",
      "corridorBaselines",
      ctx,
    );
  });

export type SourceManifest = z.infer<typeof SourceManifestSchema>;
export type BaselinePackage = z.infer<typeof BaselinePackageSchema>;
