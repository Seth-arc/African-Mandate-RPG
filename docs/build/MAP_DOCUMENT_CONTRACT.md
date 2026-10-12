# Map, subject, dossier and document contract

**Task:** AM-PB2-22 / PB2-22  
**Status:** READY_FOR_REVIEW; TEST_ONLY  
**Schema version:** `1`  
**Contract version:** `0.1.0-test.1`  
**Owners:** `@african-mandate/application` owns schemas, identity checks and hashes; `@african-mandate/ui` owns projection-only rendering; `@african-mandate/web` owns the immutable synthetic browser fixture.

## Pinned authority

- Source manifest: `4ce13c6d0fa6eb7d99f4e7023a7c48669bb57407827dc83f661f8ab6eccbb436`.
- Prompt 22: `3989756636de9c430dcb274fc6dd2837cd6762eeb875b7c3615b1805ebf497be`.
- Technical Architecture v2: `982be4ecd82b996e14be83b6fd89a60a2876bb4e2505ed195889ad4f81dcee30`, especially sections 40-43, 88 and 104.
- Components Reconciled: `a512a1e46a3b2c1affca0e776c7ef31a0b9350dc222c21dcc191960ecbcd836c`.
- VOICE: `73fe2f046da88bf76fe493b1321f6e32ea7986528ecde5a29983a8703bf101e0`.
- GLOSSARY: `622da2536adeff29d1d472f9a049cda30f7335161336c882302744449a4ee738`.
- Design Standard: `39755e3cbd573e8682970d2aefd1a98a7b53b9cb935611e6fd17bafdbfe21bb4`.
- Canonical tokens: `f534d03bbf1b60e65781972d5e358076b8b572005672bb5b1c61727a9718d4e9`.

## Public contract

`MapDocumentProjectionSchema` is strict and classified `TEST_ONLY_MAP_DOCUMENT_PROJECTION`. It embeds the accepted `MapArtifactManifestSchema` unchanged, an immutable-hash GeoJSON fixture, a subject list, knowledge-safe dossiers, documents and explicit blocked production gates. Map features require `subject_kind`, `subject_id`, `source_layer`, `display_label` and player-visible `knowledge_status`; the feature ID must equal `subject_id`.

The projection validator enforces:

- unique subject, feature and document references;
- exact map/list equivalence by `subject_kind` and `subject_id`;
- selectable source-layer/type/property agreement with `MapArtifactManifest`;
- closed polygon rings and a canonical geometry SHA-256;
- document references only to known subjects; and
- an explicit glyph probe, missing/unknown states and blocked production gates.

`selectMapSubjectById` accepts an exact stable ID only. Display names are not identity and have no fallback behavior. `verifyMapDocumentArtifact` validates the projection and its whole-artifact SHA-256 before the web host renders it.

`MapDocumentsWorkspace` keeps MapLibre controls, the searchable keyboard list and the dossier synchronized by subject ID. Map styling uses only `knowledge_status` plus transient selected UI state. No hidden campaign state, simulator trace or private actor state is accepted by this API. `KnowledgeDocumentView` renders document metadata, evidence and assessment as separate semantic sections.

## Frozen TEST_ONLY fixture

- Fixture: `apps/web/src/test-map-document-artifact.json`.
- Whole artifact SHA-256: `55b38466a3ce3e58367592749ade0295a1bef36588b63b1c204090bb6b8a8c8f`.
- Geometry SHA-256: `2c0b076749e96610617f327204101b76c8a1b1562a7af352fd33105529476eed`.
- Subjects: four abstract territory/zone/asset/corridor records.
- Documents: two synthetic records with evidence and assessment explicitly separated.
- Random seed: none. No clock, network, random value or real-world observation contributes to the artifact.

The fixture's PMTiles URL/hash is a schema-valid placeholder and is never fetched. `renderTransport` is explicitly `test_inline_geojson`; it is not a production alternative to Technical v2 publication.

## Proposal boundary and production blocks

AM-GOV-053 records every exact wrapper field not supplied canonically. The fixture does not assert a Mopti polygon, administrative provider, inferred operational zone, asset condition, or 2026-to-2025 fact. These remain hard-blocked:

1. approved boundary provider, edition, level, stable IDs, crosswalk and licence;
2. production PMTiles build, immutable publication and glyph/font asset gate; and
3. temporally admissible production asset evidence.

No synthetic field, passing test or source hash can clear those gates.

## Verification

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm run test:map-docs
corepack pnpm run test:e2e
corepack pnpm --filter @african-mandate/web run build
corepack pnpm run ci
py -3 -B -m unittest discover -s tests/governance -p "test_*.py" -v
git diff --check
```

The actual Prompt 22 command transcript, including corrected failures, is preserved in `docs/build/logs/22-test.log`. Browser captures are under `docs/build/screenshots/22/`.
