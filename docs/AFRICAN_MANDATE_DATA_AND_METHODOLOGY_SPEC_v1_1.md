# African Mandate — Data & Methodology Specification v1.1

**Date:** 2026-10-08  
**Status:** Baseline timing, five-country scope, and administrative-zone policy APPROVED by project owner on 2026-10-08. Source completeness, boundary dataset, derived formulas, and licensing remain gated. No unsupported coefficients are canonized.  
**Scope:** First Sahel scenario: approved Mali, Burkina Faso, Niger, Chad, Mauritania. Zones MUST use validated administrative boundaries; the specific boundary authority/edition and administrative level remain pending. Data sources in attached corpus were inventoried.  
**Authority:** Domain Model & Simulation Spec v1.1 sets truth layers/registries; Technical Architecture v2 sets artifact construction, runtime verification, deterministic transformations; Game Design v2.1 sets permissible player experience. A future approved scenario bundle pins exact methods and sources.

## 1. Core epistemic model

1. **Definitions:** immutable authored territory, zone, actor, institution, action, corridor and indicator definitions.
2. **Observed baseline:** immutable records about specified historical time windows and sources; never changed by game events.
3. **Latent simulation truth:** seeded simulated conditions derived from observed evidence, scenario assumptions and uncertainty envelopes.
4. **Player knowledge:** initially licensed/available observations plus evidence acquired through game reporting and collection; may be incomplete, delayed, contradicted or stale.
5. **Presentation:** knowledge-only projections, map styling, dossiers and qualitative assessments; no authoritative writable derived metrics.

Game time runs from a fixed `scenario.startDate`. After initialization **all future world events are simulated**, not real-world reporting or forecasts. Historical observations are separated from fictional projections in UI and provenance.

## 2. Baseline date and temporal harmonization

**Decision AM-DM-001 — APPROVED, 2026-10-08.** The historical conflict-observation **cutoff/anchor is `2025-09-26`**. This is the latest allowable ACLED event date within the currently supplied historical extract, **not** a claim that all sources were observed that day and **not** a declaration that the supplied extract is complete. The simulation scenario **starts `2025-10-01`**, and advances in monthly calendar turns.

**Implementation semantics:**

- `scenario.startDate = "2025-10-01"`; first turn covers October 2025; the preceding observed conflict cutoff is `2025-09-26`.
- `baseline.asOfDate = "2025-09-26"` is the scenario's designated historical **anchor**; preserve `source.dataAsOf`, `observedPeriod`, `release`, and `fetchedAt` independently for each source/field. `baseline.asOfDate` MUST NOT be interpreted as a universal measured-on date.
- This leaves **2025-09-27 through 2025-09-30** between the event cutoff and the October 1 simulation start. No incidents, fatalities, displacements, or improvements may be fabricated for those four dates. Record the coverage gap and treat corresponding state initialization as uncertainty, with an explicit scenario policy.
- Records observed **after September 26, 2025** MUST NOT be backdated into September 2025 truth. A 2026 asset inventory may corroborate historical existence only where independent dated commissioning/status evidence supports it; otherwise omit its 2025 operational-status assertion or flag as unverified and keep it outside authoritative initial world truth.
- Historical finance commitments can contribute only with documented commitment date, status, and validity as of the anchor. Newer retrieval dates never stand in for historical status.
- Initial latent game variables may be derived under approved, deterministic uncertainty rules; future events from `2025-10-01` are **fictional simulated results**, not appended historical source events.
- ACLED data acquired later is eligible only if its events are within the approved observation window and a new versioned baseline is compiled; no in-place mutation of existing baseline artifacts.

Every source/metric record MUST have `eventDate` or `observedPeriod`, `dataAsOf`, `release`, `fetchedAt`, effective lag, methodology version and source key where available. Unknown dates stay unknown. Time windows, effective-date rules, conflict-observation gap policy, and source vintage exceptions MUST be recorded in a versioned baseline manifest before full compilation.

## 3. Geographic contract

**Decision AM-DM-002 — APPROVED, 2026-10-08.** The first scenario includes **five playable countries**: Mali (`ML`/`MLI`), Burkina Faso (`BF`/`BFA`), Niger (`NE`/`NER`), Chad (`TD`/`TCD`), Mauritania (`MR`/`MRT`). Normalize both ISO2 and ISO3; do not confuse Niger (`NER`) and Nigeria (`NGA`). Adjoining countries may be included as **context-only** for corridors and spillover and are not automatically playable.

**Decision AM-DM-003 — APPROVED, 2026-10-08.** Playable zones MUST be **validated administrative polygons**, with stable domain IDs and explicit parent country. **The exact administrative level and boundary source/edition are NOT YET approved**. Do not infer either from the continent-scale visual map. The preferred initial candidate is a consistently documented admin-1 equivalent where adequate; this is a selection recommendation, not an approved dataset. Changing a legal/official administrative configuration across the cutoff requires historical boundary compatibility review.

Boundary/zone admission criteria:

1. Pin an authoritative or properly licensed geospatial edition, retrieval checksum, effective date, coordinate system, and license/redistribution permissions.
2. Verify the selected administrative level exists and is reasonably comparable across all five countries; document any exceptional subdivision or historical change.
3. Validate geometries for correct ISO parent, nonempty polygon/multipolygon, WGS84 `EPSG:4326` `[longitude, latitude]`, topology validity, no unreviewed overlaps/gaps, and deterministic zone IDs.
4. Create `territoryId`, `zoneId`, `geometryRef`, parent-child mapping, adjacency graph, and a source-to-zone crosswalk. Keep geometry immutable and out of `CampaignState`.
5. Confirm that all eligible ACLED coordinates are allocated to zero or one zone under a deterministic boundary policy; ambiguous boundary/on-border assignments are recorded and reviewed, not silently snapped. Country-only records remain country-level.
6. For contested/changed boundaries, store source conventions and selected modeling policy instead of implying recognition or sovereignty conclusions.

Spatial allocation: use point-in-polygon deterministically; edge cases use a declared tie-break rule and geometry tolerance frozen with the compiler, with an exception audit. Line/polygon intersections use version-pinned length/area rules; unrouted/country-level infrastructure MUST NOT be artificially geocoded into zone exposure. Use pinned GIS libraries and versioned simplification settings. Any failure to allocate is preserved in the audit record, not converted to zero exposure.

**Do not claim the five-country scenario baseline is ready** until a validated boundary registry is approved and tested with all five countries.

## 4. Source inventory and extraction decisions

| Source and supplied artifact | Observed inventory | Intended use | Caveats / compiler gate |
|---|---|---|---|
| ACLED events CSV (download label 2026-10-01) | 1,335 rows; dates 2024-09-28 to 2025-09-26; Mali 40, Burkina Faso 20, Niger 14, Mauritania 6, Chad 0 | Disaggregated event counts, event-type mix, civilian targeting/fatalities, uncertainty | **Inadequate as Sahel representative sample** (only 80 rows in proposed five countries). Verify acquisition filters and obtain scenario-wide coverage or mark baseline incomplete. Repeated event IDs require investigation of actor-record expansion; never sum duplicates as distinct violence events automatically. |
| ACLED Conflict Index 2025 XLSX | Workbook supplied, detailed sheet semantics/calibration not yet audited here | Supplemental scale/level risk benchmark | Determine measurement unit, year and permitted use; do not combine directly with event totals without methodological reconciliation. |
| IDMC GIDD disaggregated GeoJSON | `FeatureCollection` with **0 features**, README metadata | Internal displacement | Not spatially usable as supplied. Replace/transform with spatially keyed table before map/zone use. Clarify stocks vs flows and date. |
| GEM power assets GeoJSON | 4,274 features | Infrastructure inventory/capacity/status; exposure | Distinguish project status, operating vs planned, geometry quality, year and plant/unit duplicates; validate units. |
| GEM oil/gas pipelines GeoJSON | 324 features; source meta indicates **176 unrouted** | Strategic pipelines/corridor vulnerability | Nonrouted records may be country-level/contextual only. No invented geometry or line exposure. Separate proposed/under construction/operating. |
| OSM construction GeoJSON | 5,111 features | Transport/construction opportunities and corridors | ODbL attribution/database restrictions, incompleteness, geometry vintages, duplicate OSM objects, status lag. |
| TeleGeography cables GeoJSON | 81 features (282 landing points according to meta) | Connectivity exposure/dependencies | Validate landing links and share-alike handling. Offshore geometry isn't ground accessibility. |
| African geographic map JSON | Existing continental geometry and several bundled context layers | Reference geometry; potential map prototype input | This is *not* the versioned Sahel zone registry/PMTiles artifact. Extract only verified named layers and stable IDs. |
| AfDB/World Bank finance | `meta.json` lists AfDB 8,275 records / 1,767 activities and WB 10,268 records / 1,123 activities; not supplied as separate raw finance files in this corpus | Development finance, commitments and opportunity | Counts in metadata are not sufficient to compile baseline. Obtain source-native snapshots and schema, dedupe activities, normalize currencies, commitments/disbursements and locations. |
| AidData China finance | `meta.json`: 2,324 records, including 1,168 precise, 728 approximate, 428 country-level, 26 unlocated | External finance, dependency and strategic exposure | Time coverage ends 2021 per source meta; no automatic 2026 stock-equivalent; country-level projects cannot be placed in a specific zone. Verify permissions for embedded footprint data. |

All counts above describe supplied artifacts or `meta.json` and are **not** published population statistics or gameplay scores. External source inventories may have already been transformed; retain original source IDs and original raw snapshots for traceability.

## 5. Acquisition/licensing and redistribution matrix

`meta.json` reports GEM power/pipelines `CC BY 4.0`; World Bank `CC BY 4.0`; OSM `ODbL 1.0`; TeleGeography `CC BY-SA 4.0`; AidData finance `ODC-By 1.0` with OSM footprints `ODbL`; AfDB `Open, per publisher`. These are **claims in an internal manifest**, not approval that arbitrary bundled derivatives may be redistributed. ACLED and IDMC terms are not supplied in the same manifest and are **unverified**.

For each source record: capture source name, URL, release, as-of date, acquisition date, authorship attribution, exact license/version, scope of use (internal, public map, downloadable data), share-alike obligations, attribution text, redistribution flag and verified reviewer/date. Compilation MUST fail for required data without a reviewed source manifest. No redistribution of raw restricted data by default. Map tiles, derived baselines and downloadable exports need separate licensing review; strip or aggregate restricted fields as necessary only if licensed and defensible. OSM database-rights and share-alike exposure require counsel/qualified review before bundling mixed databases.

## 6. Canonical source transformations

- **Identifiers:** retain source-native ID; canonical ID derived from dataset release and stable identity (never row order alone); store one-to-many actor associations separately when sources encode the same underlying event more than once.
- **Event violence:** classify by source `event_type`, `sub_event_type`, flags and year; preserve `fatalities` as reported estimate with uncertainty. Dedup by validated ACLED event ID and row-grain audit. Never sum actor-expanded duplicates as separate incidents.
- **Population:** counts remain counts and denominators need documented source vintage and geography. No per-capita risk without a valid compatible population surface.
- **Assets:** normalize `capacity_mw`, operating status, start year, owners, geospatial precision; group unit vs plant without summing both levels.
- **Pipelines/cables:** preserve line/corridor/country-level forms; classify route precision and operational status; only intersections of valid routed geometries produce zone-level exposure metrics.
- **Displacement:** distinguish internal displacement flows from stock at dates; harmonize country/admin keys. Never infer individual-level effects from an aggregate.
- **Finance:** preserve project versus activity/transaction, commitment vs disbursement, source currency/year, exchange/conversion rate; do not aggregate across incomparable financial measures; keep exact nominal amounts separate from estimated strategic leverage.
- **Missingness:** any missing denominator, location or temporal reference emits `null + reasonCode + confidence state`, not numeric zero.

A compiler generates audit summaries for included/excluded rows, duplicates, geolocation precision, temporal coverage, missingness and data permissions. No authoritative baseline may be hand-edited in a campaign snapshot.

## 7. Data quality model

The canonical domain type uses five integer [0,100] axes: `sourceReliability`, `spatialPrecision`, `freshness`, `completeness`, `gameplayRelevance`. Store source/zone/asset-specific assessments with explicit derivation inputs and an assessor or rule version. Do not treat source reputation as a blanket quality score; rate variable-specific coverage and data-generating bias.

**Proposed ordinal band semantics, not locked thresholds:** high-quality well located dated observation; usable but delayed/partial; weak/coarse/contradictory; insufficient/unknown. Numeric normalization mappings, decay and aggregation weights are **TBD-BALANCE** and must be empirically/calibration reviewed before release.

Quality is metadata about **evidence**, not truthfulness of simulated future outcomes. Weak inputs increase uncertainty of latent initial variables and reduce appropriate confidence; they never silently rewrite historical observed counts.

## 8. Confidence and contradiction

The domain calls for evidence confidence derived from initial confidence × freshness × source reliability × corroboration × access/collection quality. Here this is a **factorization template**, not a numeric formula. Avoid double-counting source reliability if already embedded in initial confidence.

### Proposed executable contract

`C(e,t) = clamp_0_100(round(100 × B_e × F(age,decayProfile) × R(source,claim) × K(corroboration/contradiction) × A(channel,access)))` where all factors and normalization schemes must be approved per claim family. `B_e` is initial support before source correction; if domain storage instead keeps source-adjusted initial confidence, set `R=1` by explicit profile and explain. No sample constants are canonical until registered in methodology/balance manifest. Confidence is derived each turn, not mutating evidence history.

Keep independent axes where possible: *reported confidence*, *factual corroboration*, *timeliness*, *positional precision*. Player-facing narrative should say `unknown`, `contested`, `low`, `moderate`, `high` rather than exact engine confidence for uncertain external matters. Never infer `confirmed` from a single high numeric score. Contradictory claims sharing a typed proposition/contradiction key remain concurrently present and visible as contested. Player assessments may disagree with available evidence; engine cannot silently replace their adopted hypothesis.

## 9. Indicator definitions and formulas — methodology status

**Crucial constraint:** The Domain Model owns canonical subsystem state and six evaluation dimensions. The Design Brief's five headline terms are unapproved candidate UI projections. Indicator names do not justify creating new writable state.

### 9.1 Candidate UI measures (do not publish without approval)

| Name | Proposed numerator / underlying observation | Required denominator and caveat | Mapping |
|---|---|---|---|
| Stability | share of zones whose *player-known* conflict/governance conditions are within approved thresholds, possibly trend-smoothed | Only zones with sufficient coverage; cannot simply invert insurgency | regional stability, security |
| Insurgency | weighted rate of explicitly classified insurgent-conflict incidents over an observation window | verified covered zone-time and population/exposure if rate; reject source mix with insufficient coverage | security |
| Civilian support | validated survey or explicitly modeled player-known community-support evidence | survey sample frame/time; displacement and civilian fatalities **do not directly measure support** | civilian outcomes, legitimacy |
| Global legitimacy | observed institutional acceptance, formal recognition, credibility signals (potentially multiple bounded indicators) | predeclared represented-party sample/visibility; no real-world global poll supplied | legitimacy, institutional cohesion |
| Regional synergy | coalition coordination and documented cross-state implementation cooperation | define institution set and mandate portfolio; absent data != opposition | institutional cohesion, mandate sustainability |

`Civilian support`, `global legitimacy`, and `regional synergy` cannot currently be initialized as empirical observed quantities from the supplied datasets alone. Until their modeled/projection definitions and disclosure thresholds are authored, show `insufficient information`, not 50/100. This is a design decision, not a missing algorithm bug.

### 9.2 Six canonical evaluation dimensions

Maintain security, civilian outcomes, regional stability, institutional cohesion, legitimacy, mandate sustainability as distinct deterministic **runtime evaluation outputs**, not as a copy of those five front-end labels. Definitions must declare input variable IDs, directionality, weights, time aggregation, normalization, treatment of missingness, player-impact attribution, sustainability/irreversibility, assessment of countervailing harms, and rationale. Score normalization is a balance/scenario design choice, **not** a direct source fact.

**General formula family, placeholders only:** for an evaluated dimension `d` and turn `t`, `D[d,t] = Q_0_100( Σ_i w[d,i] × normalize_i(derived_truth_metric[i,t]) )`, with `Σ_i w[d,i]=1`, clipping at 0..100. The final evaluation additionally uses baseline-to-final trajectory, volatility, critical-state duration and persistence. The domain forbids a last-turn cosmetic gain from cancelling sustained failure. Any contribution from simulated latent state must be labeled model-derived in released methodology. Exact `w`, normalization curves, transformations and time aggregation are not approved and must be versioned before a real build.

### 9.3 Leaderboard composite

No formula in v1 methodology until Sahel Scenario Charter and evaluation thresholds are authored and published. Challenge cohort pins all versions/seed/difficulty; server recalculates scores from replay. Six-dimensional end review remains primary. A headline leaderboard cannot imply a correct real-world policy.

## 10. Latent initialization and uncertainty envelope

Baseline facts do not change with seed. `initialTrueState = deterministicInitialize(observedBaseline, scenarioDefinitions, methodologyVersion, balanceProfile, campaignSeed)` may sample *latent* variables only via keyed deterministic draws inside documented envelopes; no sample may mutate source event counts, geometry or public release dates. Every latent field declares: observed/derived/latent classification, observation inputs, calibration range, minimum/maximum feasible values, seed resolution key, and validation tests. Distinguish model uncertainty from random variety.

## 11. Build outputs and artifact integrity

The pipeline MUST emit: normalized observation tables; `BaselinePackage` with immutable ID/date/manifest/territory-zone-asset-corridor/conflict-displacement-development records; schema-validated `ScenarioBundle`; `MethodologyManifest`; `MapArtifactManifest` with `subject_kind`/`subject_id`; all canonical JSON hashes; source-scope licensing report; quality-and-missingness report; excluded/unrouted record report; parameter profile and compiler/toolchain manifest. Runtime loads exact pinned artifacts and SHA-256 verifies scenario/baseline JSON. PMTiles uses immutable content-addressed URL and release-time checksum; geometry and game state remain separate.

No new source updates enter an active campaign. Upgrading source versions creates a new baseline version and only new campaigns use it by default. Historical campaigns load exact pinned artifacts. Never change scenario results by dynamically fetching a live source.

## 12. Validation and release gates

**Source QA:** record-count parity; source ID audit; duplicate-grain resolution; time-series coverage; geographic inclusion/exclusion; legal rights review; invalid coordinate check; CRS check; missingness report; flags for unrouted pipelines and nonspatial displacement.

**Compiler QA:** same input + same toolchain produces identical output/hash; order-invariant source row permutation where ordering is nonsemantic; stable zone allocation and boundary tie-break; no undeclared row drops; map domain IDs match scenario IDs.

**Simulation QA:** seeded latent init deterministic; no raw source write; historical baselines identical across difficulty and seed; tri-state knowledge rules; hidden-state leakage tests for map, dossiers, eligibility, forecasts and narrative; full turn replay/hash verification; contradictory evidence survives reports; aging confidence is reproducible and never modifies source record.

**Playtest QA:** human evaluation of plausibility and narrative fairness, including false certainty, unreasonable institutional reaction and misleading aggregate indicators. Require regional/AU-practice reviewer for politically sensitive scenario interpretation. Use feedback for versioned balance revisions, not silent data changes.

## 13. Open decisions and blocking work

**P0 — cannot ship a defensible Sahel baseline until addressed:**

1. **Countries APPROVED:** five playable countries. Still obtain and approve the exact administrative boundary source, edition, level, stable zone IDs and geographic QA.
2. **Anchor/start APPROVED:** 2025-09-26 / 2025-10-01. Still approve the exact conflict observation window, four-day gap handling and per-layer historical validity; refresh/correct sparse ACLED extract or explicitly constrain use to a documented subset.
3. Obtain/transform displacement records into valid spatial/territory time series.
4. Obtain raw finance files represented only by `meta.json`, or explicitly omit finance from the initial baseline.
5. Validate ACLED and IDMC rights; all publisher licensing/attribution and derivative permissions before release.
6. Approve mapping from observed metrics to latent initial variables and uncertainty envelopes.
7. Author exact numeric formulas, coefficients and missingness policies for whichever strategic projections/evaluation dimensions actually ship.

**P1 — required for full reproducible content:** pinned map/compiler runtime, all geospatial IDs, generated artifact hash manifest, source lineage, reviewed source-statistics QA, representative scenario tests and approved leaderboard composite/cohort rules.

## 14. First executable acceptance fixture

Compile one **small, deliberately incomplete** Sahel test fixture (**Mopti administrative region in Mali, conditional on verified boundary registry; synthetic polygon in isolated engineering tests only**) with a documented ACLED subset, one valid asset, one deliberately missing field and one contradictory evidence pair. It must demonstrate source provenance, temporal gap warning, quality factors, player-knowledge filtering, deterministic ID/hash, changing evidence confidence after two turns, and no change in real historical event totals after simulated crisis resolution. Mark test numbers and hypotheses as synthetic fixtures. Do not represent this fixture as a real Sahel-wide baseline.

## Appendix A. Inventory audit provenance

Artifact sizes and feature counts were checked against local uploaded files on 2026-10-08. The CSV is 1,335 data rows; source-country totals are indicative row counts, not independently deduplicated unique events. The event ID repeats 653 times, therefore the raw file **must** pass a grain audit before incident counts or fatalities are compiled. Metadata counts for finance and China are from `meta.json`; they are not directly source-native files in the supplied corpus. The IDMC file contains `features: []`. The project is data-rich but not compilation-ready.


## Appendix B — Approved decision record (2026-10-08)

| ID | Decision | Approved value | Still open | Owner/dependency |
|---|---|---|---|---|
| AM-DM-001 | Historical conflict anchor and simulation start | `2025-09-26`; `2025-10-01` | Exact ACLED lookback, four-day noncoverage, source-specific dated statuses | Data methodology lead + scenario designer |
| AM-DM-002 | Playable geography | `ML`, `BF`, `NE`, `TD`, `MR` | Verified datasets and country-specific completeness | Scenario designer + data lead |
| AM-DM-003 | Zone ontology | Validated administrative boundaries | Boundary provider, edition, admin level, zone identity/crosswalk, license | GIS/data lead + scenario designer |

The approved values apply to the **initial Sahel scenario** and require scenario/baseline version bumps to change. They do not supersede the generic Domain Model's scenario-configurability principle.

## Appendix C — First compilation fixture contract

**Fixture ID:** `sahel_mopti_anchor_2025_fixture_v1`  
**Purpose:** Prove deterministic raw-to-baseline compilation and evidence/knowledge separation; not a balanced game slice or comprehensive Mopti conflict estimate.

**Scope:** one verified Mali administrative zone tentatively identified as Mopti, at `2025-09-26`; simulation begins `2025-10-01`. No production geometry is generated from intuition: use a checked-in synthetic polygon **only for unit tests**, with `geometrySource="synthetic_test_only"`; the integration fixture must wait for an approved real polygon and zone crosswalk.

**Minimum input set:**

- A small **frozen** CSV extraction from the supplied ACLED material, retaining source IDs and the original row-grain audit. Select rows by verified location and time **after** the admin polygon is available; do not prelabel records “Mopti” solely from a text field.
- One synthetic point exactly inside polygon, one outside, one on its boundary (GIS assignment test only).
- One valid historical-status-tested infrastructure feature if available; otherwise a **clearly synthetic engineering asset**, never mixed into observed baseline production data.
- One record with absent coordinate/date and an explicit exclusion reason.
- One synthetic mutually contradictory evidence pair for player-knowledge tests; it is not presented as ACLED source evidence.
- A small manifest with source URL, observed dates, release, checksums, license review status, compiler version, boundary edition and scenario/methodology IDs.

**Pipeline:** `read input bytes → schema validate → row-grain/dedup audit → canonicalize IDs/dates/units/CRS → zone assign → apply source-specific temporal admission → evidence/data-quality annotate → emit source audit → canonicalize JSON → SHA-256 baseline hash → generate knowledge-limited fixture projection`.

**Outputs:** `fixture-source-manifest.json`, `fixture-source-audit.json`, `fixture-zone-registry.json`, `fixture-baseline.json`, `fixture-player-knowledge.json`, `fixture-expected-hashes.json`, and test report; exactly named output schemas MUST be versioned in the repository before execution.

**Acceptance gates:**

1. Identical pinned inputs/toolchain/config produce byte-identical canonical JSON and SHA-256 hashes in two fresh builds; changing one input changes the resulting content hash.
2. Every source row is either included once at its verified grain or excluded/held with a reason. Duplicate actor rows do not inflate unique incident or fatality totals.
3. Coordinates are never swapped; inside/outside/edge cases produce the predeclared deterministic outcome; unassigned records remain in audit.
4. Post-anchor records do not change September 2025 observations, and the `2025-09-27`–`2025-09-30` noncoverage remains visible.
5. Missing data never turns into observed zero; synthetic geometry/asset/evidence never ships as historical baseline data.
6. Hidden actor intent / simulated world truth cannot appear in normal player projections; an estimated or contradictory claim is labeled appropriately.
7. Simulating Month 1 cannot mutate observed baseline records. Saving/reloading and deterministic replay reproduce identical authoritative hashes.
8. License gate blocks publishing artifacts while any required source's distribution permission is unreviewed; isolated local fixture tests may use appropriately restricted private inputs.

**Implementation order:**

- **F0 / registry:** choose and license the exact historical administrative boundary edition and administrative level; freeze Mopti zone ID and geometry checksum.
- **F1 / source audit:** isolate Mopti candidate ACLED rows, audit duplicate IDs, country/time coverage and coordinates; acquire missing observations if necessary.
- **F2 / compiler kernel:** typed parsers, deterministic IDs, zone assignment, temporal gate, audit records, canonical JSON/hash.
- **F3 / fixture assertions:** missingness, boundary ambiguity, duplicates, time cutoff, quality and knowledge-limit tests.
- **F4 / integration:** emit versioned immutable test artifacts and initialize a one-zone headless campaign; validate replay and save.
- **F5 / expansion gate:** replicate to additional admin regions only after fixture acceptance and all five-country boundary/coverage QA are complete.

**Deliberate non-goals of this fixture:** calibrating full-game coefficients; proving that ACLED sample is representative; defining five UI gauge formulas; inferring displacement geography; publishing restricted source data; full twenty-turn balance.
