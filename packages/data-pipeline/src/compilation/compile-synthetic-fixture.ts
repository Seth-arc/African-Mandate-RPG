import type { FixturePackage } from "@african-mandate/domain";

import {
  fixtureCanonicalJson,
  hashFixtureJson,
} from "../canonical/canonical-json.js";
import {
  assignPointToSyntheticPolygon,
  type PointAssignment,
} from "../geography/assign-points.js";
import {
  FIXTURE_ARTIFACT_FILENAMES,
  FIXTURE_CLASSIFICATION,
  FIXTURE_COMPILER_CONTRACT_VERSION,
  FixtureBaselineSchema,
  FixtureExpectedHashesSchema,
  FixturePlayerKnowledgeSchema,
  FixtureSourceAuditSchema,
  FixtureSourceManifestSchema,
  FixtureTestInitializationSchema,
  FixtureTestReportSchema,
  FixtureZoneRegistrySchema,
  parseSyntheticCompilationFixture,
  type SyntheticCompilationFixture,
} from "../schemas/fixture-artifacts.js";

const derivedId = async (
  prefix: "observation" | "asset" | "evidence",
  material: unknown,
): Promise<string> =>
  `${prefix}_${(await hashFixtureJson(material)).slice(0, 24)}`;

const header = (fixture: SyntheticCompilationFixture) => ({
  schemaVersion: FIXTURE_COMPILER_CONTRACT_VERSION,
  classification: FIXTURE_CLASSIFICATION,
  fixtureId: fixture.fixturePackage.fixtureId,
});

const dispositionFor = (
  record: SyntheticCompilationFixture["sourceRecords"][number],
  fixture: SyntheticCompilationFixture,
  duplicate: boolean,
): { disposition: string; reason: string; assignment?: PointAssignment } => {
  if (duplicate) {
    return {
      disposition: "EXCLUDED_DUPLICATE_SOURCE_ID",
      reason: "Repeated source record ID retained in audit and counted once",
    };
  }
  if (record.observedAt === null) {
    return {
      disposition: "HELD_MISSING_DATE",
      reason: "Observation date is missing; no temporal admission inferred",
    };
  }
  if (record.observedAt > fixture.cutoffDate) {
    return {
      disposition: "EXCLUDED_POST_CUTOFF",
      reason: `Observation is later than ${fixture.cutoffDate}`,
    };
  }
  if (record.coordinate === null) {
    return {
      disposition: "HELD_MISSING_COORDINATE",
      reason: "Coordinate is missing; no zone assignment inferred",
    };
  }
  const assignment = assignPointToSyntheticPolygon(
    record.coordinate,
    fixture.polygon,
  );
  if (assignment === "BOUNDARY") {
    return {
      disposition: "HELD_BOUNDARY",
      reason: "Boundary points remain unassigned under the fixture policy",
      assignment,
    };
  }
  if (assignment === "OUTSIDE") {
    return {
      disposition: "EXCLUDED_OUTSIDE",
      reason: "Point is outside the synthetic polygon",
      assignment,
    };
  }
  return {
    disposition: "INCLUDED",
    reason: "Inside synthetic polygon and on or before the cutoff",
    assignment,
  };
};

export interface CompiledSyntheticFixture {
  readonly artifacts: Readonly<Record<string, unknown>>;
  readonly canonicalFiles: Readonly<Record<string, string>>;
}

export const compileSyntheticFixture = async (
  input: unknown,
): Promise<CompiledSyntheticFixture> => {
  const fixture = parseSyntheticCompilationFixture(input);
  const records = [...fixture.sourceRecords].sort((left, right) =>
    left.rowId.localeCompare(right.rowId),
  );
  const groups = new Map<string, typeof records>();
  for (const record of records) {
    const key = `${record.sourceId}\0${record.sourceRecordId}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  const duplicateGroups = [...groups.values()]
    .filter((group) => group.length > 1)
    .sort((left, right) => left[0]!.rowId.localeCompare(right[0]!.rowId));
  const duplicateRows = new Set(
    duplicateGroups.flatMap((group) =>
      group.slice(1).map(({ rowId }) => rowId),
    ),
  );

  const auditedRecords = await Promise.all(
    records.map(async (record) => {
      const result = dispositionFor(
        record,
        fixture,
        duplicateRows.has(record.rowId),
      );
      return {
        rowId: record.rowId,
        sourceId: record.sourceId,
        sourceRecordId: record.sourceRecordId,
        derivedObservationId: await derivedId("observation", {
          fixtureId: fixture.fixturePackage.fixtureId,
          rowId: record.rowId,
          sourceId: record.sourceId,
          sourceRecordId: record.sourceRecordId,
        }),
        disposition: result.disposition,
        reason: result.reason,
      };
    }),
  );

  const sourceManifest = FixtureSourceManifestSchema.parse({
    ...header(fixture),
    sources: await Promise.all(
      [...fixture.sourceDefinitions]
        .sort((left, right) => left.sourceId.localeCompare(right.sourceId))
        .map(async (source) => {
          const sourceRecords = records.filter(
            ({ sourceId }) => sourceId === source.sourceId,
          );
          return {
            ...source,
            recordCount: sourceRecords.length,
            contentHash: await hashFixtureJson(sourceRecords),
          };
        }),
    ),
    publishable: false,
  });

  const sourceAudit = FixtureSourceAuditSchema.parse({
    ...header(fixture),
    cutoffDate: fixture.cutoffDate,
    noncoveragePeriod: {
      ...fixture.noncoveragePeriod,
      observationCount: null,
      warning: "Noncoverage is unknown, not an observed zero",
    },
    records: auditedRecords,
    duplicatedSourceRecordIds: duplicateGroups.map((group) => ({
      sourceId: group[0]!.sourceId,
      sourceRecordId: group[0]!.sourceRecordId,
      rowIds: group.map(({ rowId }) => rowId),
    })),
  });

  const zoneRegistry = FixtureZoneRegistrySchema.parse({
    ...header(fixture),
    geometrySource: fixture.polygon.geometrySource,
    zoneId: fixture.polygon.zoneId,
    ring: fixture.polygon.ring,
    boundaryPolicy: "HOLD_AS_BOUNDARY_NOT_ASSIGNED",
  });

  const includedRows = records.filter((record) =>
    sourceAudit.records.some(
      (audit) =>
        audit.rowId === record.rowId && audit.disposition === "INCLUDED",
    ),
  );
  const baseline = FixtureBaselineSchema.parse({
    ...header(fixture),
    asOfDate: fixture.cutoffDate,
    zoneId: fixture.polygon.zoneId,
    observations: await Promise.all(
      includedRows.map(async (record) => ({
        observationId: await derivedId("observation", {
          fixtureId: fixture.fixturePackage.fixtureId,
          rowId: record.rowId,
          sourceId: record.sourceId,
          sourceRecordId: record.sourceRecordId,
        }),
        sourceId: record.sourceId,
        sourceRecordId: record.sourceRecordId,
        observedAt: record.observedAt,
        observedValue: record.observedValue,
        missingness: record.observedValue === null ? "MISSING" : "OBSERVED",
        missingReason:
          record.observedValue === null ? (record.missingReason ?? null) : null,
      })),
    ),
    assets: await Promise.all(
      [...fixture.assets]
        .sort((left, right) => left.assetKey.localeCompare(right.assetKey))
        .map(async (asset) => ({
          assetId: await derivedId("asset", {
            fixtureId: fixture.fixturePackage.fixtureId,
            assetKey: asset.assetKey,
          }),
          name: asset.name,
          zoneId: asset.zoneId,
          statusEvidence: asset.statusEvidence,
        })),
    ),
  });

  const playerKnowledge = FixturePlayerKnowledgeSchema.parse({
    ...header(fixture),
    claims: await Promise.all(
      [...fixture.claims]
        .sort((left, right) => left.claimKey.localeCompare(right.claimKey))
        .map(async (claim) => ({
          evidenceId: await derivedId("evidence", {
            fixtureId: fixture.fixturePackage.fixtureId,
            claimKey: claim.claimKey,
          }),
          subjectKey: claim.subjectKey,
          assertion: claim.assertion,
          relation: claim.relation,
          epistemicStatus: claim.epistemicStatus,
        })),
    ),
  });

  const report = FixtureTestReportSchema.parse({
    ...header(fixture),
    includedRows: sourceAudit.records.filter(
      ({ disposition }) => disposition === "INCLUDED",
    ).length,
    excludedOrHeldRows: sourceAudit.records.filter(
      ({ disposition }) => disposition !== "INCLUDED",
    ).length,
    duplicateSourceIdsAudited: sourceAudit.duplicatedSourceRecordIds.length,
    missingValuesPreserved: baseline.observations.filter(
      ({ missingness }) => missingness === "MISSING",
    ).length,
    postCutoffRowsExcluded: sourceAudit.records.filter(
      ({ disposition }) => disposition === "EXCLUDED_POST_CUTOFF",
    ).length,
    publishGate: "REJECTED_TEST_ONLY",
  });

  const artifactsByFilename = {
    "fixture-source-manifest.json": sourceManifest,
    "fixture-source-audit.json": sourceAudit,
    "fixture-zone-registry.json": zoneRegistry,
    "fixture-baseline.json": baseline,
    "fixture-player-knowledge.json": playerKnowledge,
    "fixture-test-report.json": report,
  } as const;
  const canonicalFiles = Object.fromEntries(
    Object.entries(artifactsByFilename).map(([name, artifact]) => [
      name,
      fixtureCanonicalJson(artifact),
    ]),
  );
  const hashes = Object.fromEntries(
    await Promise.all(
      FIXTURE_ARTIFACT_FILENAMES.map(async (name) => [
        name,
        await hashFixtureJson(artifactsByFilename[name]),
      ]),
    ),
  );
  const expectedHashes = FixtureExpectedHashesSchema.parse({
    ...header(fixture),
    hashes,
  });

  return {
    artifacts: {
      ...artifactsByFilename,
      "fixture-expected-hashes.json": expectedHashes,
    },
    canonicalFiles: {
      ...canonicalFiles,
      "fixture-expected-hashes.json": fixtureCanonicalJson(expectedHashes),
    },
  };
};

export const fixtureToTestInitialization = (
  fixturePackage: FixturePackage,
  compiled: CompiledSyntheticFixture,
) =>
  FixtureTestInitializationSchema.parse({
    schemaVersion: FIXTURE_COMPILER_CONTRACT_VERSION,
    classification: "TEST_ONLY_INITIALIZATION",
    fixturePackage,
    baseline: compiled.artifacts["fixture-baseline.json"],
    playerKnowledge: compiled.artifacts["fixture-player-knowledge.json"],
  });
