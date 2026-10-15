import { IsoDateSchema, NonEmptyStringSchema } from "@african-mandate/domain";
import { z } from "zod";

export const PRODUCTION_ACQUISITION_SCHEMA_VERSION = 2 as const;
export const PRODUCTION_ACQUISITION_CONTRACT_VERSION =
  "0.2.0-proposal.1" as const;
export const HISTORICAL_CONFLICT_ANCHOR = "2025-09-26" as const;
export const SIMULATION_START_DATE = "2025-10-01" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const AuditStatusSchema = z.enum([
  "PASS",
  "PASS_WITH_LIMITATIONS",
  "PASS_WITH_REVIEWED_EXCEPTIONS",
  "NOT_APPLICABLE",
]);

export const ApprovedCountryParentSchema = z
  .object({
    name: z.enum(["Mali", "Burkina Faso", "Niger", "Chad", "Mauritania"]),
    iso2: z.enum(["ML", "BF", "NE", "TD", "MR"]),
    iso3: z.enum(["MLI", "BFA", "NER", "TCD", "MRT"]),
  })
  .strict();

export const APPROVED_COUNTRY_PARENTS = [
  { name: "Mali", iso2: "ML", iso3: "MLI" },
  { name: "Burkina Faso", iso2: "BF", iso3: "BFA" },
  { name: "Niger", iso2: "NE", iso3: "NER" },
  { name: "Chad", iso2: "TD", iso3: "TCD" },
  { name: "Mauritania", iso2: "MR", iso3: "MRT" },
] as const;

const OwnerDecisionSchema = z
  .object({
    owner: NonEmptyStringSchema,
    status: z.literal("APPROVED_FOR_THIS_BUILD"),
    decidedAt: IsoDateSchema,
    authority: z.literal("REPOSITORY_OWNER_INSTRUCTION"),
    evidencePath: NonEmptyStringSchema,
    acceptanceMechanism: z.literal("OWNER_REVIEWED_COMMIT_AM_GOV_001"),
    note: NonEmptyStringSchema,
  })
  .strict();

const SourceArtifactSchema = z
  .object({
    kind: z.enum([
      "GEOMETRY_AND_FINANCE_JSON",
      "CONFLICT_EVENTS_CSV",
      "CONFLICT_INDEX_XLSX",
      "EMPTY_DISPLACEMENT_GEOJSON",
    ]),
    localPath: NonEmptyStringSchema,
    sha256: Sha256Schema,
    release: NonEmptyStringSchema,
    dataAsOf: IsoDateSchema.nullable(),
    citationUrls: z.array(z.url()).min(1),
    license: NonEmptyStringSchema,
    attributionText: NonEmptyStringSchema,
    redistributionAllowed: z.boolean(),
    recordCount: z.number().int().nonnegative(),
    usage: NonEmptyStringSchema,
  })
  .strict();

export const ProductionGeometryAdmissionSchema = z
  .object({
    approvalStatus: z.literal("OWNER_APPROVED"),
    localPath: NonEmptyStringSchema,
    provider: z.literal("Natural Earth"),
    edition: NonEmptyStringSchema,
    administrativeLevel: z.literal("Natural Earth admin-1 feature layer"),
    artifactBuiltAt: IsoDateSchema,
    coordinateReferenceSystem: z.literal("EPSG:4326"),
    stableZoneIdScheme: z.literal("ne-admin1:{iso3}:{slug(name)}"),
    expectedZoneCount: z.literal(97),
    crosswalkSha256: Sha256Schema,
    geometrySha256: Sha256Schema,
    license: z.literal("Public domain"),
    licenseUrl: z.url(),
    attributionText: NonEmptyStringSchema,
    historicalUse: z.literal("NO_BOUNDARY_BACKDATING"),
    topologyAudit: z.literal("PASS_WITH_REVIEWED_EXCEPTIONS"),
    allocationAudit: z.literal("PASS_WITH_REVIEWED_EXCEPTIONS"),
    ownerDecisionRef: NonEmptyStringSchema,
  })
  .strict()
  .superRefine((geometry, ctx) => {
    for (const [field, value] of [
      ["provider", geometry.provider],
      ["edition", geometry.edition],
      ["administrativeLevel", geometry.administrativeLevel],
    ] as const) {
      if (/synthetic|test[_ -]?only/iu.test(value)) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Synthetic geometry cannot be admitted to production",
        });
      }
    }
  });

export const ProductionSourceAcquisitionSchema = z
  .object({
    sourceKey: z.enum(["conflict", "displacement", "finance_status"]),
    requirement: z.enum(["REQUIRED", "OPTIONAL"]),
    disposition: z.enum([
      "ADMITTED",
      "ADMITTED_WITH_LIMITATIONS",
      "OMISSION_APPROVED",
    ]),
    approvalStatus: z.literal("OWNER_APPROVED"),
    artifacts: z.array(SourceArtifactSchema).min(1),
    completenessStatus: AuditStatusSchema,
    deduplicationStatus: AuditStatusSchema,
    provenanceStatus: AuditStatusSchema,
    licenseStatus: AuditStatusSchema,
    ownerDecisionRef: NonEmptyStringSchema,
    note: NonEmptyStringSchema,
  })
  .strict()
  .superRefine((source, ctx) => {
    if (
      source.requirement === "REQUIRED" &&
      source.disposition === "OMISSION_APPROVED"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["disposition"],
        message: "A required source cannot be omitted",
      });
    }
    if (
      source.disposition !== "OMISSION_APPROVED" &&
      [
        source.completenessStatus,
        source.provenanceStatus,
        source.licenseStatus,
      ].includes("NOT_APPLICABLE")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Admitted sources require completed source audits",
      });
    }
  });

export const ProductionAcquisitionManifestSchema = z
  .object({
    schemaVersion: z.literal(PRODUCTION_ACQUISITION_SCHEMA_VERSION),
    contractVersion: z.literal(PRODUCTION_ACQUISITION_CONTRACT_VERSION),
    taskId: z.literal("AM-PB2-25"),
    classification: z.literal("PRODUCTION_ACQUISITION"),
    status: z.literal("READY_FOR_REVIEW"),
    assessedAt: IsoDateSchema,
    historicalConflictAnchor: z.literal(HISTORICAL_CONFLICT_ANCHOR),
    simulationStartDate: z.literal(SIMULATION_START_DATE),
    noncoveragePeriod: z
      .object({
        startDate: z.literal("2025-09-27"),
        endDate: z.literal("2025-09-30"),
        treatment: z.literal("UNKNOWN_NOT_ZERO"),
      })
      .strict(),
    countryParents: z.array(ApprovedCountryParentSchema).length(5),
    geometry: ProductionGeometryAdmissionSchema,
    sources: z.array(ProductionSourceAcquisitionSchema).length(3),
    ownerDecision: OwnerDecisionSchema,
    productionBaselineAllowed: z.literal(true),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    if (
      JSON.stringify(manifest.countryParents) !==
      JSON.stringify(APPROVED_COUNTRY_PARENTS)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["countryParents"],
        message:
          "Country parents must exactly match the five approved mappings",
      });
    }
    if (
      new Set(manifest.sources.map(({ sourceKey }) => sourceKey)).size !== 3
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Each production source category must appear exactly once",
      });
    }
    for (const source of manifest.sources) {
      const expected =
        source.sourceKey === "conflict" ? "REQUIRED" : "OPTIONAL";
      if (source.requirement !== expected) {
        ctx.addIssue({
          code: "custom",
          path: ["sources", source.sourceKey, "requirement"],
          message: source.sourceKey + " must be " + expected,
        });
      }
      if (source.ownerDecisionRef !== manifest.ownerDecision.evidencePath) {
        ctx.addIssue({
          code: "custom",
          path: ["sources", source.sourceKey, "ownerDecisionRef"],
          message: "Source approval must reference the sole owner decision",
        });
      }
    }
    if (
      manifest.geometry.ownerDecisionRef !== manifest.ownerDecision.evidencePath
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["geometry", "ownerDecisionRef"],
        message: "Geometry approval must reference the sole owner decision",
      });
    }
  });

export type ProductionAcquisitionManifest = z.infer<
  typeof ProductionAcquisitionManifestSchema
>;

const CountryCountSchema = z
  .object({
    MLI: z.number().int().nonnegative(),
    BFA: z.number().int().nonnegative(),
    NER: z.number().int().nonnegative(),
    TCD: z.number().int().nonnegative(),
    MRT: z.number().int().nonnegative(),
  })
  .strict();

export const ProductionSourceAuditReportSchema = z
  .object({
    schemaVersion: z.literal(PRODUCTION_ACQUISITION_SCHEMA_VERSION),
    taskId: z.literal("AM-PB2-25"),
    assessedAt: IsoDateSchema,
    classification: z.literal("AGGREGATE_AUDIT_NO_RAW_SOURCE_ROWS"),
    conflict: z
      .object({
        eventArtifactSha256: Sha256Schema,
        indexArtifactSha256: Sha256Schema,
        totalRows: z.number().int().nonnegative(),
        approvedCountryRows: z.number().int().nonnegative(),
        approvedCountryUniqueEventIds: z.number().int().nonnegative(),
        approvedCountryDuplicateEventGroups: z.number().int().nonnegative(),
        approvedCountryDuplicateRows: z.number().int().nonnegative(),
        countryRows: CountryCountSchema,
        minimumEventDate: IsoDateSchema,
        maximumEventDate: IsoDateSchema,
        uniqueEventsAllocatedToOneZone: z.number().int().nonnegative(),
        uniqueEventsResolvedByEnclaveTieBreak: z.number().int().nonnegative(),
        uniqueEventsRetainedAtCountryLevel: z.number().int().nonnegative(),
        indexCoverageCountries: z.literal(5),
        indexPeriodEnd: IsoDateSchema,
        historicalUse: z.literal("EVENT_CSV_ONLY_THROUGH_ANCHOR"),
        admissionStatus: z.literal("ADMITTED_WITH_LIMITATIONS"),
      })
      .strict(),
    displacement: z
      .object({
        artifactSha256: Sha256Schema,
        featureCount: z.literal(0),
        usable: z.literal(false),
        admissionStatus: z.literal("OMISSION_APPROVED"),
      })
      .strict(),
    financeStatus: z
      .object({
        artifactSha256: Sha256Schema,
        totalRecords: z.number().int().nonnegative(),
        approvedCountryRecords: z.number().int().nonnegative(),
        publisherRecords: z
          .object({
            AfDB: z.number().int().nonnegative(),
            WB: z.number().int().nonnegative(),
          })
          .strict(),
        countryRecords: z
          .object({
            ML: z.number().int().nonnegative(),
            BF: z.number().int().nonnegative(),
            NE: z.number().int().nonnegative(),
            TD: z.number().int().nonnegative(),
            MR: z.number().int().nonnegative(),
          })
          .strict(),
        admissionStatus: z.literal("ADMITTED_WITH_LIMITATIONS"),
      })
      .strict(),
    geometry: z
      .object({
        artifactSha256: Sha256Schema,
        countryParents: z.literal(5),
        zoneCount: z.literal(97),
        zoneCounts: CountryCountSchema,
        uniqueZoneIds: z.literal(97),
        crosswalkSha256: Sha256Schema,
        ringCount: z.number().int().positive(),
        coordinateCount: z.number().int().positive(),
        invalidCoordinateCount: z.literal(0),
        openRingCount: z.literal(0),
        reviewedEnclaveOverlapCount: z.literal(2),
        topologyAudit: z.literal("PASS_WITH_REVIEWED_EXCEPTIONS"),
        allocationAudit: z.literal("PASS_WITH_REVIEWED_EXCEPTIONS"),
      })
      .strict(),
    productionBaselineAllowed: z.literal(true),
  })
  .strict();

export type ProductionSourceAuditReport = z.infer<
  typeof ProductionSourceAuditReportSchema
>;

export type HistoricalAdmission =
  "ADMIT_HISTORICAL" | "UNKNOWN_NONCOVERAGE" | "REJECT_AFTER_ANCHOR";

export const classifyHistoricalDate = (date: string): HistoricalAdmission => {
  const parsed = IsoDateSchema.parse(date);
  if (parsed <= HISTORICAL_CONFLICT_ANCHOR) return "ADMIT_HISTORICAL";
  if (parsed < SIMULATION_START_DATE) return "UNKNOWN_NONCOVERAGE";
  return "REJECT_AFTER_ANCHOR";
};

export interface ConflictAuditRow {
  readonly eventId: string;
  readonly eventDate: string;
  readonly country: string;
}

export interface ConflictRowGrainAudit {
  readonly rowCount: number;
  readonly uniqueEventCount: number;
  readonly duplicateEventGroups: number;
  readonly duplicateRows: number;
  readonly admittedHistoricalRows: number;
  readonly noncoverageRows: number;
  readonly rejectedAfterAnchorRows: number;
  readonly countryCounts: Readonly<Record<string, number>>;
}

export const auditConflictRowGrain = (
  rows: readonly ConflictAuditRow[],
): ConflictRowGrainAudit => {
  const byId = new Map<string, number>();
  const countryCounts: Record<string, number> = {};
  let admittedHistoricalRows = 0;
  let noncoverageRows = 0;
  let rejectedAfterAnchorRows = 0;

  for (const row of rows) {
    const eventId = NonEmptyStringSchema.parse(row.eventId);
    const country = NonEmptyStringSchema.parse(row.country);
    byId.set(eventId, (byId.get(eventId) ?? 0) + 1);
    countryCounts[country] = (countryCounts[country] ?? 0) + 1;
    const admission = classifyHistoricalDate(row.eventDate);
    if (admission === "ADMIT_HISTORICAL") admittedHistoricalRows += 1;
    if (admission === "UNKNOWN_NONCOVERAGE") noncoverageRows += 1;
    if (admission === "REJECT_AFTER_ANCHOR") rejectedAfterAnchorRows += 1;
  }

  const duplicateCounts = [...byId.values()].filter((count) => count > 1);
  return {
    rowCount: rows.length,
    uniqueEventCount: byId.size,
    duplicateEventGroups: duplicateCounts.length,
    duplicateRows: duplicateCounts.reduce((sum, count) => sum + count, 0),
    admittedHistoricalRows,
    noncoverageRows,
    rejectedAfterAnchorRows,
    countryCounts,
  };
};

export interface AcquisitionGateReport {
  readonly status: "READY_FOR_REVIEW";
  readonly productionBaselineAllowed: true;
  readonly blockers: readonly [];
}

export const auditProductionAcquisition = (
  input: unknown,
): AcquisitionGateReport => {
  ProductionAcquisitionManifestSchema.parse(input);
  return {
    status: "READY_FOR_REVIEW",
    productionBaselineAllowed: true,
    blockers: [],
  };
};

export const assertProductionBaselineAdmission = (
  input: unknown,
): ProductionAcquisitionManifest =>
  ProductionAcquisitionManifestSchema.parse(input);
