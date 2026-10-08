# African Mandate — First Compilation Fixture Implementation Plan v1

**Date:** 2026-10-08  
**Status:** Implementation proposal, not evidence of an executed or validated compiler.  
**Binding decisions:** AM-DM-001 (`2025-09-26` historical conflict anchor, `2025-10-01` simulation start); AM-DM-002 (Mali, Burkina Faso, Niger, Chad, Mauritania); AM-DM-003 (validated administrative zones; exact polygon source/edition and administrative level pending).

## Scope

Prove a repeatable, auditable **single-zone Mopti test fixture**, then scale. “Mopti” here names a candidate administrative region and MUST be resolved by the approved zone registry; no placeholder shape qualifies as a production boundary.

## Proposed implementation layout

```text
packages/data-pipeline/src/
  adapters/acled-events.ts
  geography/zone-registry.ts
  geography/assign-points.ts
  temporal/admit-observation.ts
  compilation/compile-zone-fixture.ts
  audit/source-audit.ts
  manifests/validate-manifest.ts
  canonical/canonical-json.ts
  canonical/hash.ts
  schemas/fixture-artifacts.ts
packages/data-pipeline/test/
  fixtures/sahel-mopti-2025/
    source-manifest.json
    acled-source-subset.csv
    zone-boundary.geojson             # approved input, presently pending
    edge-cases.synthetic.json         # tests only
    expected.json                     # computed and reviewed fixture assertions
  acled-grain.test.ts
  geography.test.ts
  temporal-gating.test.ts
  reproducibility.test.ts
  knowledge-firewall.test.ts
scenarios/sahel-2025/definitions/
  zone-registry.json
  scenario-dates.json
```

## Pipeline and immutable outputs

Read pinned files and hashes; validate raw row shapes; audit row grain and repeated IDs before aggregating; enforce event cutoff; assign verified WGS84 points to the pinned admin region; preserve excluded and uncertain records; compute *only approved observed fields*; emit canonical artifact and SHA-256; initialize one-zone domain state using separately versioned scenario assumptions; project only player knowledge.

Outputs: `fixture-source-manifest.json`, `fixture-source-audit.json`, `fixture-zone-registry.json`, `fixture-baseline.json`, `fixture-player-knowledge.json`, `fixture-expected-hashes.json`, and a machine-readable test report. Source-native text with restrictive licensing stays local.

## Required test cases

| Test | Fixture assertion |
|---|---|
| Duplicate event grain | One unique incident counted once regardless of repeated actor rows; fatality figure not inflated |
| Temporal cutoff | Event after 2025-09-26 excluded from observation baseline |
| Four-day gap | September 27–30 noncoverage explicitly reported, never generated as zero observations |
| Within/without/on edge | Deterministic polygon membership or reviewed ambiguity |
| Missing coordinate | Exclusion/unknown reason instead of inferred zero |
| Infrastructure historical status | 2026 inventory not admitted to 2025 operated assets without dated evidence |
| Provenance and licensing | Every included field linked to source record/manifest; publishing fails unless permission reviewed |
| Evidence contradiction | Two incompatible synthetic claims remain distinguishable |
| Hidden-information firewall | UI-facing projection contains no simulated private fields |
| Reproducible hash | Two clean builds equal; one controlled source change produces different hash |
| Baseline immutability | Simulated Month 1 changes state without rewriting observations |

## Acceptance and dependencies

**Blocking before real-geometry integration:** a licensed administrative boundary edition effective at baseline; chosen admin level; validated five-country parent naming; and a stable Mopti zone ID. **Blocking before full regional compilation:** a complete audited ACLED source covering all five countries for approved windows; spatial displacement strategy; eligible historical asset status; proven provenance and permissions; approved indicators/initialization coefficients.

The deliberately synthetic tests can begin before the real boundary source is approved, but synthetic data cannot be promoted to the observed baseline.

## Explicit exclusions

No full Sahel conflict rate; no manufactured population denominator; no zone-level IDMC displacement allocations from country totals; no 2026 infrastructure retrojection; no leaderboard metrics or five UI indicator coefficients; no claim this is a complete playable campaign.

## Ready-to-implement task order

1. Repository toolchain, manifest schema and fixed hashes (including pinned GIS binary/tool).
2. Source-specific ACLED row-grain parser and audit.
3. Deterministic admin polygon registry with synthetic unit cases.
4. Real Mopti admin geometry approval and test integration.
5. Temporal gate, quality metadata, provenance, license gate.
6. Canonical BaselinePackage fixture emitter.
7. Player-knowledge projection fixture and headless replay proof.
8. CI validation gate; then scale to additional zones.
