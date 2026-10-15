import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  MapArtifactManifestSchema,
  ReleaseManifestSchema,
} from "@african-mandate/application";
import { productionScenarioConfiguration } from "@african-mandate/content";
import {
  ProductionAcquisitionManifestSchema,
  PRODUCTION_ARTIFACT_SCHEMA_VERSION,
  ProductionInitializationProfileSchema,
  ProductionMapBundleSchema,
  assertProductionClassification,
  compileProductionSemanticArtifacts,
} from "@african-mandate/data-pipeline";
import { canonicalJson, hashCanonicalJson } from "@african-mandate/simulation";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "apps/web/public/production");
const assets = resolve(root, "apps/web/public/assets");
const sha256 = (value: Uint8Array | string) =>
  createHash("sha256").update(value).digest("hex");
const json = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(resolve(root, path), "utf8")) as unknown;

const parseCsv = (source: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]!;
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/u, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new TypeError("Unterminated CSV field");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/u, ""));
    rows.push(row);
  }
  return rows;
};

const acquisition = ProductionAcquisitionManifestSchema.parse(
  await json("docs/build/PRODUCTION_DATA_ACQUISITION.json"),
);
const profile = ProductionInitializationProfileSchema.parse(
  await json("docs/build/PRODUCTION_INITIALIZATION_PROFILE.json"),
);
const mapBytes = await readFile(resolve(root, profile.mapDelivery.sourcePath));
if (sha256(mapBytes) !== profile.mapDelivery.sourceSha256) {
  throw new TypeError("Pinned map source hash mismatch");
}
const mapBundle = ProductionMapBundleSchema.parse(
  JSON.parse(mapBytes.toString("utf8")) as unknown,
);
const conflictSource = acquisition.sources
  .find(({ sourceKey }) => sourceKey === "conflict")
  ?.artifacts.find(({ kind }) => kind === "CONFLICT_EVENTS_CSV");
if (conflictSource === undefined)
  throw new TypeError("Conflict source missing");
const conflictBytes = await readFile(resolve(root, conflictSource.localPath));
if (sha256(conflictBytes) !== conflictSource.sha256) {
  throw new TypeError("Pinned conflict source hash mismatch");
}
const rows = parseCsv(conflictBytes.toString("utf8"));
const header = rows.shift()?.map((value) => value.replace(/^\uFEFF/u, ""));
if (header === undefined) throw new TypeError("Conflict CSV header missing");
const columns = Object.fromEntries(header.map((name, index) => [name, index]));
const nameToIso3 = new Map(
  acquisition.countryParents.map(({ name, iso3 }) => [name, iso3]),
);
const events = new Map<
  string,
  { eventId: string; iso3: string; longitude: number; latitude: number }
>();
for (const row of rows) {
  const eventId = row[columns["event_id_cnty"] ?? -1];
  const iso3 = nameToIso3.get(row[columns["country"] ?? -1] ?? "");
  if (eventId === undefined || iso3 === undefined || events.has(eventId)) {
    continue;
  }
  const longitude = Number(row[columns["longitude"] ?? -1]);
  const latitude = Number(row[columns["latitude"] ?? -1]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) continue;
  events.set(eventId, { eventId, iso3, longitude, latitude });
}

const artifacts = compileProductionSemanticArtifacts({
  acquisition,
  scenarioConfiguration: productionScenarioConfiguration,
  initializationProfile: profile,
  mapBundle,
  conflictEvents: [...events.values()],
});
for (const value of [
  artifacts.baseline,
  artifacts.scenario,
  artifacts.methodology,
]) {
  assertProductionClassification(value);
}

const mapAssetName = `african_map.${profile.mapDelivery.sourceSha256}.json`;
const mapManifest = MapArtifactManifestSchema.parse({
  mapArtifactSchemaVersion: 1,
  format: "african_map_json_bundle",
  artifactUrl: `/assets/${mapAssetName}`,
  artifactHash: profile.mapDelivery.sourceSha256,
  geometryPath: "basemap.admin1",
  sourceLayers: [
    {
      sourceLayer: "admin1",
      subjectKind: "zone",
      selectable: true,
      idProperty: "subject_id",
      requiredProperties: [
        "subject_kind",
        "subject_id",
        "display_label",
        "knowledge_status",
      ],
    },
  ],
  crsSource: "EPSG:4326",
  buildToolchainVersion: "node-22.16.0+pnpm-11.23.0+compiler-1.0.0",
});
assertProductionClassification(mapManifest);

const canonicalFiles = {
  "baseline.package.json": canonicalJson(artifacts.baseline),
  "scenario.bundle.json": canonicalJson(artifacts.scenario),
  "methodology.manifest.json": canonicalJson(artifacts.methodology),
  "map.manifest.json": canonicalJson(mapManifest),
};
const hashes = Object.fromEntries(
  Object.entries(canonicalFiles).map(([name, contents]) => [
    name,
    sha256(contents),
  ]),
);
const scenarioId = artifacts.scenario.scenario.scenarioId;
const releaseManifest = ReleaseManifestSchema.parse({
  releaseManifestSchemaVersion: 1,
  appVersion: "0.1.0-production-opening.1",
  appBuildId: "am-pb2-27-production-opening-v1",
  gameSchemaVersion: profile.versions.gameSchemaVersion,
  supportedSimulationModels: [profile.versions.simulationModelVersion],
  scenarios: {
    [scenarioId]: {
      defaultForNewCampaigns: true,
      scenarioVersion: profile.versions.scenarioVersion,
      contentVersion: profile.versions.contentVersion,
      balanceProfileVersion: profile.versions.balanceProfileVersion,
      methodologyVersion: profile.versions.methodologyVersion,
      methodology: {
        schemaVersion: PRODUCTION_ARTIFACT_SCHEMA_VERSION,
        methodologyVersion: profile.versions.methodologyVersion,
        hash: hashes["methodology.manifest.json"],
        url: "/production/methodology.manifest.json",
      },
      scenarioBundle: {
        schemaVersion: 1,
        hash: hashes["scenario.bundle.json"],
        url: "/production/scenario.bundle.json",
      },
      baseline: {
        baselineVersion: profile.versions.baselineVersion,
        schemaVersion: 1,
        hash: hashes["baseline.package.json"],
        url: "/production/baseline.package.json",
      },
      mapArtifact: {
        schemaVersion: 1,
        hash: hashes["map.manifest.json"],
        manifestUrl: "/production/map.manifest.json",
      },
      requiredSimulationModelVersion: profile.versions.simulationModelVersion,
    },
  },
});
const artifactHashes = {
  schemaVersion: 1,
  classification: "PRODUCTION_ARTIFACT_HASH_MANIFEST",
  compilerVersion: "1.0.0",
  sourcePins: {
    acquisitionManifest: hashCanonicalJson(acquisition),
    scenarioConfiguration: hashCanonicalJson(productionScenarioConfiguration),
    initializationProfile: sha256(
      await readFile(
        resolve(root, "docs/build/PRODUCTION_INITIALIZATION_PROFILE.json"),
      ),
    ),
    mapSource: profile.mapDelivery.sourceSha256,
    conflictSource: conflictSource.sha256,
  },
  artifacts: {
    ...hashes,
    "release.manifest.json": hashCanonicalJson(releaseManifest),
    [mapAssetName]: profile.mapDelivery.sourceSha256,
  },
};
assertProductionClassification(artifactHashes);

await mkdir(output, { recursive: true });
await mkdir(assets, { recursive: true });
await Promise.all([
  ...Object.entries(canonicalFiles).map(([name, contents]) =>
    writeFile(resolve(output, name), contents, "utf8"),
  ),
  writeFile(
    resolve(output, "release.manifest.json"),
    canonicalJson(releaseManifest),
    "utf8",
  ),
  writeFile(
    resolve(output, "artifact-hashes.json"),
    canonicalJson(artifactHashes),
    "utf8",
  ),
  writeFile(resolve(assets, mapAssetName), mapBytes),
]);

console.log(
  `PASS: compiled production artifacts for ${scenarioId}; ${String(Object.keys(artifacts.scenario.zoneDefinitions).length)} zones; hashes ${hashCanonicalJson(artifactHashes.artifacts)}.`,
);
