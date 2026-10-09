import {
  FixturePackageSchema,
  IsoDateSchema,
  NonEmptyStringSchema,
  ScenarioBundleSchema,
  ZoneIdSchema,
} from "@african-mandate/domain";
import { z } from "zod";

import { fixtureCanonicalJson } from "../canonical/canonical-json.js";

export const FIXTURE_COMPILER_CONTRACT_VERSION = "1.0.0" as const;
export const FIXTURE_CLASSIFICATION = "TEST_ONLY_SYNTHETIC" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const DerivedIdSchema = z
  .string()
  .regex(/^(observation|asset|evidence)_[a-f0-9]{24}$/u);

export const SyntheticCoordinateSchema = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);

export const SyntheticPolygonSchema = z
  .object({
    geometrySource: z.literal("synthetic_test_only"),
    zoneId: ZoneIdSchema,
    ring: z.array(SyntheticCoordinateSchema).min(4),
  })
  .strict()
  .superRefine((polygon, ctx) => {
    const first = polygon.ring[0];
    const last = polygon.ring.at(-1);
    if (first?.[0] !== last?.[0] || first?.[1] !== last?.[1]) {
      ctx.addIssue({
        code: "custom",
        path: ["ring"],
        message: "Synthetic polygon ring must be closed",
      });
    }
    const uniqueVertices = new Set(
      polygon.ring.slice(0, -1).map(([x, y]) => `${x}\0${y}`),
    );
    if (uniqueVertices.size < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["ring"],
        message: "Synthetic polygon requires at least three unique vertices",
      });
    }
  });

const SourceDefinitionSchema = z
  .object({
    sourceId: NonEmptyStringSchema,
    sourceName: NonEmptyStringSchema,
    distributionPermission: z.literal("TEST_ONLY_LOCAL"),
  })
  .strict();

const SyntheticSourceRecordSchema = z
  .object({
    rowId: NonEmptyStringSchema,
    sourceId: NonEmptyStringSchema,
    sourceRecordId: NonEmptyStringSchema,
    observedAt: IsoDateSchema.nullable(),
    coordinate: SyntheticCoordinateSchema.nullable(),
    observedValue: z.number().finite().nullable(),
    missingReason: NonEmptyStringSchema.optional(),
  })
  .strict()
  .superRefine((record, ctx) => {
    if (record.observedValue === null && record.missingReason === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["missingReason"],
        message: "A missing observed value requires an explicit reason",
      });
    }
  });

const SyntheticAssetInputSchema = z
  .object({
    assetKey: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    zoneId: ZoneIdSchema,
    coordinate: SyntheticCoordinateSchema,
    statusEvidence: z.literal("SYNTHETIC_TEST_ONLY"),
  })
  .strict();

const SyntheticClaimInputSchema = z
  .object({
    claimKey: NonEmptyStringSchema,
    subjectKey: NonEmptyStringSchema,
    assertion: NonEmptyStringSchema,
    relation: z.enum(["SUPPORTS", "CONTRADICTS"]),
    epistemicStatus: z.literal("CONTRADICTORY_SYNTHETIC_CLAIM"),
    visibility: z.literal("PLAYER_KNOWN"),
  })
  .strict();

export const SyntheticCompilationFixtureSchema = z
  .object({
    fixtureCompilerVersion: z.literal(FIXTURE_COMPILER_CONTRACT_VERSION),
    classification: z.literal(FIXTURE_CLASSIFICATION),
    fixturePackage: FixturePackageSchema,
    cutoffDate: IsoDateSchema,
    noncoveragePeriod: z
      .object({ startDate: IsoDateSchema, endDate: IsoDateSchema })
      .strict(),
    polygon: SyntheticPolygonSchema,
    sourceDefinitions: z.array(SourceDefinitionSchema).min(1),
    sourceRecords: z.array(SyntheticSourceRecordSchema).min(1),
    assets: z.array(SyntheticAssetInputSchema),
    claims: z.array(SyntheticClaimInputSchema),
  })
  .strict()
  .superRefine((fixture, ctx) => {
    const duplicateCheck = (values: readonly string[], path: string) => {
      const seen = new Set<string>();
      values.forEach((value, index) => {
        if (seen.has(value)) {
          ctx.addIssue({
            code: "custom",
            path: [path, index],
            message: `Duplicate ${path} key: ${value}`,
          });
        }
        seen.add(value);
      });
    };
    duplicateCheck(
      fixture.sourceDefinitions.map(({ sourceId }) => sourceId),
      "sourceDefinitions",
    );
    duplicateCheck(
      fixture.sourceRecords.map(({ rowId }) => rowId),
      "sourceRecords",
    );
    duplicateCheck(
      fixture.assets.map(({ assetKey }) => assetKey),
      "assets",
    );
    duplicateCheck(
      fixture.claims.map(({ claimKey }) => claimKey),
      "claims",
    );
    const sourceIds = new Set(
      fixture.sourceDefinitions.map(({ sourceId }) => sourceId),
    );
    fixture.sourceRecords.forEach((record, index) => {
      if (!sourceIds.has(record.sourceId)) {
        ctx.addIssue({
          code: "custom",
          path: ["sourceRecords", index, "sourceId"],
          message: `Unknown sourceId: ${record.sourceId}`,
        });
      }
    });
    if (fixture.cutoffDate !== "2025-09-26") {
      ctx.addIssue({
        code: "custom",
        path: ["cutoffDate"],
        message: "The accepted synthetic fixture cutoff is 2025-09-26",
      });
    }
    if (
      fixture.noncoveragePeriod.startDate !== "2025-09-27" ||
      fixture.noncoveragePeriod.endDate !== "2025-09-30"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["noncoveragePeriod"],
        message: "The four-day noncoverage period must remain explicit",
      });
    }
  });

const ArtifactHeaderSchema = z.object({
  schemaVersion: z.literal(FIXTURE_COMPILER_CONTRACT_VERSION),
  classification: z.literal(FIXTURE_CLASSIFICATION),
  fixtureId: NonEmptyStringSchema,
});

export const FixtureSourceManifestSchema = ArtifactHeaderSchema.extend({
  sources: z.array(
    SourceDefinitionSchema.extend({
      recordCount: z.number().int().nonnegative(),
      contentHash: Sha256Schema,
    }).strict(),
  ),
  publishable: z.literal(false),
}).strict();

const AuditDispositionSchema = z.enum([
  "INCLUDED",
  "EXCLUDED_DUPLICATE_SOURCE_ID",
  "EXCLUDED_POST_CUTOFF",
  "HELD_MISSING_DATE",
  "HELD_MISSING_COORDINATE",
  "HELD_BOUNDARY",
  "EXCLUDED_OUTSIDE",
]);

export const FixtureSourceAuditSchema = ArtifactHeaderSchema.extend({
  cutoffDate: IsoDateSchema,
  noncoveragePeriod: z
    .object({
      startDate: IsoDateSchema,
      endDate: IsoDateSchema,
      observationCount: z.literal(null),
      warning: NonEmptyStringSchema,
    })
    .strict(),
  records: z.array(
    z
      .object({
        rowId: NonEmptyStringSchema,
        sourceId: NonEmptyStringSchema,
        sourceRecordId: NonEmptyStringSchema,
        derivedObservationId: DerivedIdSchema,
        disposition: AuditDispositionSchema,
        reason: NonEmptyStringSchema,
      })
      .strict(),
  ),
  duplicatedSourceRecordIds: z.array(
    z
      .object({
        sourceId: NonEmptyStringSchema,
        sourceRecordId: NonEmptyStringSchema,
        rowIds: z.array(NonEmptyStringSchema).min(2),
      })
      .strict(),
  ),
}).strict();

export const FixtureZoneRegistrySchema = ArtifactHeaderSchema.extend({
  geometrySource: z.literal("synthetic_test_only"),
  zoneId: ZoneIdSchema,
  ring: z.array(SyntheticCoordinateSchema),
  boundaryPolicy: z.literal("HOLD_AS_BOUNDARY_NOT_ASSIGNED"),
}).strict();

export const FixtureBaselineSchema = ArtifactHeaderSchema.extend({
  asOfDate: IsoDateSchema,
  zoneId: ZoneIdSchema,
  observations: z.array(
    z
      .object({
        observationId: DerivedIdSchema,
        sourceId: NonEmptyStringSchema,
        sourceRecordId: NonEmptyStringSchema,
        observedAt: IsoDateSchema,
        observedValue: z.number().finite().nullable(),
        missingness: z.enum(["OBSERVED", "MISSING"]),
        missingReason: NonEmptyStringSchema.nullable(),
      })
      .strict(),
  ),
  assets: z.array(
    z
      .object({
        assetId: DerivedIdSchema,
        name: NonEmptyStringSchema,
        zoneId: ZoneIdSchema,
        statusEvidence: z.literal("SYNTHETIC_TEST_ONLY"),
      })
      .strict(),
  ),
}).strict();

export const FixturePlayerKnowledgeSchema = ArtifactHeaderSchema.extend({
  claims: z.array(
    z
      .object({
        evidenceId: DerivedIdSchema,
        subjectKey: NonEmptyStringSchema,
        assertion: NonEmptyStringSchema,
        relation: z.enum(["SUPPORTS", "CONTRADICTS"]),
        epistemicStatus: z.literal("CONTRADICTORY_SYNTHETIC_CLAIM"),
      })
      .strict(),
  ),
}).strict();

export const FixtureTestReportSchema = ArtifactHeaderSchema.extend({
  includedRows: z.number().int().nonnegative(),
  excludedOrHeldRows: z.number().int().nonnegative(),
  duplicateSourceIdsAudited: z.number().int().nonnegative(),
  missingValuesPreserved: z.number().int().nonnegative(),
  postCutoffRowsExcluded: z.number().int().nonnegative(),
  publishGate: z.literal("REJECTED_TEST_ONLY"),
}).strict();

export const FIXTURE_ARTIFACT_FILENAMES = [
  "fixture-source-manifest.json",
  "fixture-source-audit.json",
  "fixture-zone-registry.json",
  "fixture-baseline.json",
  "fixture-player-knowledge.json",
  "fixture-test-report.json",
] as const;

export const FixtureExpectedHashesSchema = ArtifactHeaderSchema.extend({
  hashes: z.record(z.enum(FIXTURE_ARTIFACT_FILENAMES), Sha256Schema),
}).strict();

export const FixtureTestInitializationSchema = z
  .object({
    schemaVersion: z.literal(FIXTURE_COMPILER_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_INITIALIZATION"),
    fixturePackage: FixturePackageSchema,
    baseline: FixtureBaselineSchema,
    playerKnowledge: FixturePlayerKnowledgeSchema,
  })
  .strict();

export const parseFixturePackage = (input: unknown) =>
  FixturePackageSchema.parse(input);

export const parseSyntheticCompilationFixture = (input: unknown) =>
  SyntheticCompilationFixtureSchema.parse(input);

export class FixturePublicationError extends Error {
  public constructor(fixtureId: string) {
    super(
      `TEST_ONLY fixture ${fixtureId} cannot pass the production publish gate`,
    );
    this.name = "FixturePublicationError";
  }
}

export const assertFixturePublishable = (
  fixture: z.infer<typeof SyntheticCompilationFixtureSchema>,
): never => {
  throw new FixturePublicationError(fixture.fixturePackage.fixtureId);
};

export const serializeProductionScenarioBundle = (input: unknown): string =>
  fixtureCanonicalJson(ScenarioBundleSchema.parse(input));

export type SyntheticCoordinate = z.infer<typeof SyntheticCoordinateSchema>;
export type SyntheticPolygon = z.infer<typeof SyntheticPolygonSchema>;
export type SyntheticCompilationFixture = z.infer<
  typeof SyntheticCompilationFixtureSchema
>;
export type FixtureBaseline = z.infer<typeof FixtureBaselineSchema>;
export type FixturePlayerKnowledge = z.infer<
  typeof FixturePlayerKnowledgeSchema
>;
