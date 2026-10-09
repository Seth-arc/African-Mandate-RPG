import { describe, expect, it } from "vitest";

import {
  FixtureBaselineSchema,
  FixtureExpectedHashesSchema,
  FixturePlayerKnowledgeSchema,
  FixturePublicationError,
  FixtureSourceAuditSchema,
  FixtureSourceManifestSchema,
  FixtureTestReportSchema,
  FixtureZoneRegistrySchema,
  SyntheticCompilationFixtureSchema,
  assertFixturePublishable,
  assignPointToSyntheticPolygon,
  compileSyntheticFixture,
  fixtureCanonicalJson,
  fixtureToTestInitialization,
  hashFixtureJson,
  parseFixturePackage,
  parseSyntheticCompilationFixture,
  serializeProductionScenarioBundle,
} from "@african-mandate/data-pipeline";
import { ScenarioBundleSchema } from "@african-mandate/domain";
import { canonicalJson, hashCanonicalJson } from "@african-mandate/simulation";
import fixtureInput from "../fixtures/compilation/synthetic-fixture.json";

const compile = () => compileSyntheticFixture(structuredClone(fixtureInput));

describe("isolated synthetic fixture compiler", () => {
  it("matches the accepted canonical JSON and SHA-256 contract", async () => {
    const representative = {
      z: ["synthetic", -0, null],
      a: { known: true, value: 4 },
    };
    expect(fixtureCanonicalJson(representative)).toBe(
      canonicalJson(representative),
    );
    await expect(hashFixtureJson(representative)).resolves.toBe(
      hashCanonicalJson(representative),
    );
  });

  it("parses only the explicit TEST_ONLY FixturePackage contract", () => {
    const fixture = parseSyntheticCompilationFixture(fixtureInput);
    expect(parseFixturePackage(fixture.fixturePackage)).toEqual(
      fixture.fixturePackage,
    );
    expect(
      SyntheticCompilationFixtureSchema.safeParse({
        ...fixtureInput,
        classification: "PRODUCTION",
      }).success,
    ).toBe(false);
  });

  it("assigns inside, outside, and boundary points deterministically", () => {
    const fixture = parseSyntheticCompilationFixture(fixtureInput);
    expect(assignPointToSyntheticPolygon([5, 5], fixture.polygon)).toBe(
      "INSIDE",
    );
    expect(assignPointToSyntheticPolygon([20, 20], fixture.polygon)).toBe(
      "OUTSIDE",
    );
    expect(assignPointToSyntheticPolygon([0, 5], fixture.polygon)).toBe(
      "BOUNDARY",
    );
  });

  it("emits every versioned Appendix C fixture artifact", async () => {
    const compiled = await compile();
    FixtureSourceManifestSchema.parse(
      compiled.artifacts["fixture-source-manifest.json"],
    );
    FixtureSourceAuditSchema.parse(
      compiled.artifacts["fixture-source-audit.json"],
    );
    FixtureZoneRegistrySchema.parse(
      compiled.artifacts["fixture-zone-registry.json"],
    );
    FixtureBaselineSchema.parse(compiled.artifacts["fixture-baseline.json"]);
    FixturePlayerKnowledgeSchema.parse(
      compiled.artifacts["fixture-player-knowledge.json"],
    );
    FixtureExpectedHashesSchema.parse(
      compiled.artifacts["fixture-expected-hashes.json"],
    );
    FixtureTestReportSchema.parse(
      compiled.artifacts["fixture-test-report.json"],
    );
    expect(Object.keys(compiled.canonicalFiles).sort()).toEqual([
      "fixture-baseline.json",
      "fixture-expected-hashes.json",
      "fixture-player-knowledge.json",
      "fixture-source-audit.json",
      "fixture-source-manifest.json",
      "fixture-test-report.json",
      "fixture-zone-registry.json",
    ]);
  });

  it("preserves missingness, cutoff exclusions, duplicates, and the gap", async () => {
    const compiled = await compile();
    const baseline = FixtureBaselineSchema.parse(
      compiled.artifacts["fixture-baseline.json"],
    );
    const audit = FixtureSourceAuditSchema.parse(
      compiled.artifacts["fixture-source-audit.json"],
    );

    expect(
      baseline.observations.find(
        ({ sourceRecordId }) =>
          sourceRecordId === "synthetic_incident_missing_value",
      ),
    ).toMatchObject({
      observedValue: null,
      missingness: "MISSING",
      missingReason: "Synthetic source field deliberately absent",
    });
    expect(
      baseline.observations.some(({ observedValue }) => observedValue === 0),
    ).toBe(false);
    expect(audit.duplicatedSourceRecordIds).toEqual([
      {
        sourceId: "source_synthetic_observations",
        sourceRecordId: "synthetic_incident_duplicate",
        rowIds: ["row_duplicate_a", "row_duplicate_b"],
      },
    ]);
    expect(
      audit.records.find(({ rowId }) => rowId === "row_duplicate_b")
        ?.disposition,
    ).toBe("EXCLUDED_DUPLICATE_SOURCE_ID");
    expect(
      audit.records.find(({ rowId }) => rowId === "row_post_cutoff")
        ?.disposition,
    ).toBe("EXCLUDED_POST_CUTOFF");
    expect(audit.noncoveragePeriod).toMatchObject({
      startDate: "2025-09-27",
      endDate: "2025-09-30",
      observationCount: null,
    });
  });

  it("is order-invariant and changes hashes after a controlled input change", async () => {
    const first = await compile();
    const reorderedInput = structuredClone(fixtureInput);
    reorderedInput.sourceRecords.reverse();
    const reordered = await compileSyntheticFixture(reorderedInput);
    expect(reordered.canonicalFiles).toEqual(first.canonicalFiles);

    const changedInput = structuredClone(fixtureInput);
    changedInput.sourceRecords[0]!.observedValue = 5;
    const changed = await compileSyntheticFixture(changedInput);
    const firstHashes = FixtureExpectedHashesSchema.parse(
      first.artifacts["fixture-expected-hashes.json"],
    );
    const changedHashes = FixtureExpectedHashesSchema.parse(
      changed.artifacts["fixture-expected-hashes.json"],
    );
    expect(changedHashes.hashes["fixture-baseline.json"]).not.toBe(
      firstHashes.hashes["fixture-baseline.json"],
    );
  });

  it("creates a test initialization without claiming ScenarioBundle completeness", async () => {
    const fixture = parseSyntheticCompilationFixture(fixtureInput);
    const compiled = await compileSyntheticFixture(fixture);
    const initialization = fixtureToTestInitialization(
      fixture.fixturePackage,
      compiled,
    );
    expect(initialization.classification).toBe("TEST_ONLY_INITIALIZATION");
    expect(ScenarioBundleSchema.safeParse(initialization).success).toBe(false);
  });

  it("rejects TEST_ONLY publication and production serialization", () => {
    const fixture = parseSyntheticCompilationFixture(fixtureInput);
    expect(() => assertFixturePublishable(fixture)).toThrow(
      FixturePublicationError,
    );
    expect(() =>
      serializeProductionScenarioBundle(fixture.fixturePackage),
    ).toThrow();
  });
});
