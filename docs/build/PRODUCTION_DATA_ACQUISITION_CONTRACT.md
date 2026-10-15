# Production data acquisition contract

**Task:** AM-PB2-25  
**Schema version:** 2  
**Contract version:** `0.2.0-proposal.1`  
**Owner:** repository owner through AM-GOV-001  
**Current state:** `READY_FOR_REVIEW`; source admission is open, milestone acceptance still requires the owner's reviewed commit

## Purpose and authority

This contract implements the Data & Methodology v1.1 and Fixture Plan admission rules for the artifacts already present in `data/`. On 2026-10-13 the repository owner clarified that those artifacts are the intended inputs for this individual build and require citation, not a fictitious multi-person approval panel. That instruction is the source/geometry selection decision; the usual reviewed commit remains the independent PB2-25 acceptance event.

`docs/build/PRODUCTION_DATA_ACQUISITION.json` is the sole mutable acquisition-state record. The aggregate report is reproducible evidence derived from that manifest and the pinned files. No second source registry or copied geometry is created.

The serialized wrapper is proposal AM-GOV-060 because the canonical sources prescribe the evidence but not its exact JSON field names. Canonical `SourceManifestSchema` and `BaselinePackageSchema` remain unchanged.

## Public API

`@african-mandate/data-pipeline` exports:

- `ProductionAcquisitionManifestSchema`, `ProductionGeometryAdmissionSchema`, `ProductionSourceAcquisitionSchema`, and `ProductionSourceAuditReportSchema`;
- the exact five `APPROVED_COUNTRY_PARENTS` mappings;
- `classifyHistoricalDate`, preserving 2025-09-27 through 2025-09-30 as unknown noncoverage;
- `auditConflictRowGrain`, which reports source rows and unique event IDs separately;
- `auditProductionAcquisition` and `assertProductionBaselineAdmission`.

Schema version 2 replaces the version 1 four-role approval array with one repository-owner decision. It also admits multiple immutable artifacts per source category, because conflict evidence uses both the event CSV and the later Conflict Index workbook.

## Admitted artifacts and constraints

### Geometry

`data/african_map.json` supplies the repository-pinned Natural Earth 1:10m admin-1 feature layer. The verifier finds all five ISO parents and 97 uniquely derived IDs using `ne-admin1:{iso3}:{slug(name)}`. It checks WGS84 coordinate bounds, nonempty closed rings, hashes the derived crosswalk, and audits event allocation.

Bamako within Koulikoro and Niamey within Tillabéri are reviewed enclave overlaps, not silently discarded topology errors. Points matching both are assigned by the frozen smallest-enclosing-zone rule. Of 41 unique in-scope events, 32 match one zone directly, eight use that enclave rule, and one country/coordinate mismatch is retained at country level. The 2026-09-23 artifact is not represented as a historical 2025 legal boundary edition.

### Conflict

The event CSV is admitted with limitations. Its 1,335 rows include 80 rows for the five countries and 41 unique `event_id_cnty` values; duplicates are never counted as separate events. Chad has no event row and therefore remains unknown, not zero.

The ACLED Conflict Index workbook covers all five countries but ends 2025-11-28. It is post-anchor reference evidence only and cannot enter the 2025-09-26 historical baseline. Raw ACLED rows and workbook content are not redistributed. Published outputs must be non-reversible aggregates with ACLED attribution and must follow ACLED's EULA, Content Usage Terms, and Attribution Policy.

### Displacement

The supplied IDMC GeoJSON contains zero features. The repository owner approves explicit omission for this build. No zero displacement value is created.

### Finance/status

The finance layer in `data/african_map.json` contains 2,874 activity rows, including 265 rows for the five countries: 152 AfDB and 113 World Bank. The pinned artifact records IATI 2.03 provenance, source URLs, and publisher licence descriptions. Admission is limited to its existing source IDs, status labels, nulls, and projections. It does not authorize raw export or aggregation of unlike financial measures.

## Gate meaning

`productionBaselineAllowed: true` means the admitted sources may be compiled under these constraints. It does not claim that a baseline has already been compiled, that upstream licences have been expanded, or that PB2-25 is ACCEPTED. Any hash drift, missing citation, changed owner-decision reference, invalid geometry, source backdating, or unrecorded exception fails closed. The repository owner marks PB2-25 ACCEPTED only by reviewing and committing this change under AM-GOV-001.
