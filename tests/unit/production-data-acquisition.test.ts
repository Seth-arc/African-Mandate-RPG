import { describe, expect, it } from "vitest";

import {
  APPROVED_COUNTRY_PARENTS,
  ProductionAcquisitionManifestSchema,
  ProductionGeometryAdmissionSchema,
  ProductionSourceAuditReportSchema,
  assertProductionBaselineAdmission,
  auditConflictRowGrain,
  auditProductionAcquisition,
  classifyHistoricalDate,
} from "@african-mandate/data-pipeline";
import manifest from "../../docs/build/PRODUCTION_DATA_ACQUISITION.json";
import sourceAudit from "../../docs/build/reports/25-source-audit.json";

describe("Prompt 25 production acquisition gate", () => {
  it("pins exactly the five approved ISO parent mappings", () => {
    const parsed = ProductionAcquisitionManifestSchema.parse(manifest);
    expect(parsed.countryParents).toEqual(APPROVED_COUNTRY_PARENTS);

    const wrongCountry = structuredClone(manifest);
    wrongCountry.countryParents[2] = {
      name: "Niger",
      iso2: "NG",
      iso3: "NGA",
    };
    expect(
      ProductionAcquisitionManifestSchema.safeParse(wrongCountry).success,
    ).toBe(false);
  });

  it("admits history only through the anchor and preserves the date gap", () => {
    expect(classifyHistoricalDate("2024-09-28")).toBe("ADMIT_HISTORICAL");
    expect(classifyHistoricalDate("2025-09-26")).toBe("ADMIT_HISTORICAL");
    expect(classifyHistoricalDate("2025-09-27")).toBe("UNKNOWN_NONCOVERAGE");
    expect(classifyHistoricalDate("2025-09-30")).toBe("UNKNOWN_NONCOVERAGE");
    expect(classifyHistoricalDate("2025-10-01")).toBe("REJECT_AFTER_ANCHOR");
  });

  it("audits event row grain without double-counting unique event IDs", () => {
    const report = auditConflictRowGrain([
      { eventId: "MLI1", eventDate: "2025-09-26", country: "Mali" },
      { eventId: "MLI1", eventDate: "2025-09-26", country: "Mali" },
      { eventId: "BFA1", eventDate: "2025-09-27", country: "Burkina Faso" },
      { eventId: "NER1", eventDate: "2025-10-01", country: "Niger" },
    ]);
    expect(report).toEqual({
      rowCount: 4,
      uniqueEventCount: 3,
      duplicateEventGroups: 1,
      duplicateRows: 2,
      admittedHistoricalRows: 2,
      noncoverageRows: 1,
      rejectedAfterAnchorRows: 1,
      countryCounts: { Mali: 2, "Burkina Faso": 1, Niger: 1 },
    });
  });

  it("rejects synthetic geometry and a broken owner-decision reference", () => {
    expect(
      ProductionGeometryAdmissionSchema.safeParse({
        ...manifest.geometry,
        provider: "synthetic_test_only",
      }).success,
    ).toBe(false);

    const brokenReference = structuredClone(manifest);
    brokenReference.geometry.ownerDecisionRef = "docs/build/other.md";
    expect(
      ProductionAcquisitionManifestSchema.safeParse(brokenReference).success,
    ).toBe(false);
  });

  it("requires citations and immutable hashes for admitted sources", () => {
    const missingCitation = structuredClone(manifest);
    missingCitation.sources[0]!.artifacts[0]!.citationUrls = [];
    expect(
      ProductionAcquisitionManifestSchema.safeParse(missingCitation).success,
    ).toBe(false);

    const badHash = structuredClone(manifest);
    badHash.sources[2]!.artifacts[0]!.sha256 = "not-a-sha";
    expect(ProductionAcquisitionManifestSchema.safeParse(badHash).success).toBe(
      false,
    );
  });

  it("keeps the post-anchor conflict index out of historical admission", () => {
    const parsed = ProductionAcquisitionManifestSchema.parse(manifest);
    const conflict = parsed.sources.find(
      ({ sourceKey }) => sourceKey === "conflict",
    );
    const index = conflict?.artifacts.find(
      ({ kind }) => kind === "CONFLICT_INDEX_XLSX",
    );
    expect(index?.dataAsOf).toBe("2025-11-28");
    expect(index?.usage).toMatch(/post-anchor reference only/iu);
    expect(sourceAudit.conflict.historicalUse).toBe(
      "EVENT_CSV_ONLY_THROUGH_ANCHOR",
    );
  });

  it("publishes source completeness and reviewed geography exceptions", () => {
    const parsed = ProductionSourceAuditReportSchema.parse(sourceAudit);
    expect(parsed.conflict.countryRows).toEqual({
      MLI: 40,
      BFA: 20,
      NER: 14,
      TCD: 0,
      MRT: 6,
    });
    expect(parsed.conflict.approvedCountryUniqueEventIds).toBe(41);
    expect(parsed.conflict.uniqueEventsRetainedAtCountryLevel).toBe(1);
    expect(parsed.displacement.admissionStatus).toBe("OMISSION_APPROVED");
    expect(parsed.financeStatus.approvedCountryRecords).toBe(265);
    expect(parsed.geometry.zoneCount).toBe(97);
    expect(parsed.geometry.reviewedEnclaveOverlapCount).toBe(2);
  });

  it("opens baseline compilation only through the owner-approved manifest", () => {
    const report = auditProductionAcquisition(manifest);
    expect(report).toEqual({
      status: "READY_FOR_REVIEW",
      productionBaselineAllowed: true,
      blockers: [],
    });
    expect(
      assertProductionBaselineAdmission(manifest).ownerDecision.status,
    ).toBe("APPROVED_FOR_THIS_BUILD");

    const unsigned = structuredClone(manifest);
    unsigned.ownerDecision.status = "PENDING";
    expect(() => assertProductionBaselineAdmission(unsigned)).toThrow();
  });
});
