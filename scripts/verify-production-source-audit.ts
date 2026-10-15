import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  APPROVED_COUNTRY_PARENTS,
  ProductionAcquisitionManifestSchema,
  ProductionSourceAuditReportSchema,
} from "@african-mandate/data-pipeline";

const root = resolve(import.meta.dirname, "..");
const manifestPath = resolve(
  root,
  "docs/build/PRODUCTION_DATA_ACQUISITION.json",
);
const reportPath = resolve(root, "docs/build/reports/25-source-audit.json");

const sha256 = (bytes: Uint8Array | string) =>
  createHash("sha256").update(bytes).digest("hex");

const parseCsv = (source: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let fieldStart = 0;
  let fieldParts: string[] = [];
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (character === '"' && source[index + 1] === '"') {
        fieldParts.push(source.slice(fieldStart, index), '"');
        index += 1;
        fieldStart = index + 1;
      } else if (character === '"') {
        fieldParts.push(source.slice(fieldStart, index));
        quoted = false;
        fieldStart = index + 1;
      }
      continue;
    }
    if (character === '"' && index === fieldStart) {
      quoted = true;
      fieldStart = index + 1;
    } else if (character === ",") {
      row.push(fieldParts.join("") + source.slice(fieldStart, index));
      fieldParts = [];
      fieldStart = index + 1;
    } else if (character === "\n") {
      row.push(
        (fieldParts.join("") + source.slice(fieldStart, index)).replace(
          /\r$/u,
          "",
        ),
      );
      rows.push(row);
      row = [];
      fieldParts = [];
      fieldStart = index + 1;
    }
  }
  if (quoted) throw new Error("Unterminated quoted CSV field");
  if (fieldStart < source.length || fieldParts.length > 0 || row.length > 0) {
    row.push(
      (fieldParts.join("") + source.slice(fieldStart)).replace(/\r$/u, ""),
    );
    rows.push(row);
  }
  return rows;
};

type Point = readonly [number, number];
interface AdminFeature {
  readonly a3: string;
  readonly n: string;
  readonly x: number;
  readonly y: number;
  readonly r: readonly (readonly Point[])[];
}
interface MapArtifact {
  readonly basemap: { readonly admin1: readonly AdminFeature[] };
  readonly finance: { readonly rows: readonly (readonly unknown[])[] };
}

const slug = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

const pointInRing = (x: number, y: number, ring: readonly Point[]) => {
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const currentPoint = ring[index]!;
    const previousPoint = ring[previous]!;
    const intersects =
      currentPoint[1] > y !== previousPoint[1] > y &&
      x <
        ((previousPoint[0] - currentPoint[0]) * (y - currentPoint[1])) /
          (previousPoint[1] - currentPoint[1]) +
          currentPoint[0];
    if (intersects) inside = !inside;
  }
  return inside;
};

const pointInFeature = (x: number, y: number, feature: AdminFeature) =>
  feature.r.some((ring) => pointInRing(x, y, ring));

const readJson = async (filePath: string): Promise<unknown> =>
  JSON.parse(await readFile(filePath, "utf8")) as unknown;

const manifest = ProductionAcquisitionManifestSchema.parse(
  await readJson(manifestPath),
);
const expected = ProductionSourceAuditReportSchema.parse(
  await readJson(reportPath),
);
const source = (key: "conflict" | "displacement" | "finance_status") => {
  const found = manifest.sources.find(({ sourceKey }) => sourceKey === key);
  if (!found) throw new Error("Missing source " + key);
  return found;
};
const artifact = (
  key: "conflict" | "displacement" | "finance_status",
  kind: string,
) => {
  const found = source(key).artifacts.find(
    (candidate) => candidate.kind === kind,
  );
  if (!found) throw new Error("Missing " + key + " artifact " + kind);
  return found;
};

const eventArtifact = artifact("conflict", "CONFLICT_EVENTS_CSV");
const indexArtifact = artifact("conflict", "CONFLICT_INDEX_XLSX");
const displacementArtifact = artifact(
  "displacement",
  "EMPTY_DISPLACEMENT_GEOJSON",
);
const financeArtifact = artifact("finance_status", "GEOMETRY_AND_FINANCE_JSON");
if (financeArtifact.localPath !== manifest.geometry.localPath) {
  throw new Error(
    "Geometry and finance must reference the same pinned map artifact",
  );
}

const eventBytes = await readFile(resolve(root, eventArtifact.localPath));
const table = parseCsv(eventBytes.toString("utf8"));
const header = table.shift()?.map((name) => name.replace(/^\uFEFF/u, ""));
if (!header) throw new Error("Conflict CSV has no header");
const indexes = Object.fromEntries(header.map((name, index) => [name, index]));
for (const required of [
  "event_id_cnty",
  "event_date",
  "country",
  "latitude",
  "longitude",
]) {
  if (indexes[required] === undefined)
    throw new Error("Conflict CSV is missing " + required);
}

const targetIso3 = new Set(APPROVED_COUNTRY_PARENTS.map(({ iso3 }) => iso3));
const targetIso2 = new Set(APPROVED_COUNTRY_PARENTS.map(({ iso2 }) => iso2));
const nameToIso3 = new Map(
  APPROVED_COUNTRY_PARENTS.map(({ name, iso3 }) => [name, iso3]),
);
const countryRows = { MLI: 0, BFA: 0, NER: 0, TCD: 0, MRT: 0 };
const approvedRows = table.filter((row) => {
  const iso3 = nameToIso3.get(row[indexes.country!] ?? "");
  if (!iso3) return false;
  countryRows[iso3] += 1;
  return true;
});
const idCounts = new Map<string, number>();
const uniqueEvents = new Map<
  string,
  { iso3: string; longitude: number; latitude: number }
>();
for (const row of approvedRows) {
  const eventId = row[indexes.event_id_cnty!];
  const iso3 = nameToIso3.get(row[indexes.country!] ?? "");
  if (!eventId || !iso3)
    throw new Error("Conflict CSV contains an invalid event identity");
  idCounts.set(eventId, (idCounts.get(eventId) ?? 0) + 1);
  if (!uniqueEvents.has(eventId)) {
    uniqueEvents.set(eventId, {
      iso3,
      longitude: Number(row[indexes.longitude!]),
      latitude: Number(row[indexes.latitude!]),
    });
  }
}
const duplicateCounts = [...idCounts.values()].filter((count) => count > 1);
const eventDates = table.map((row) => row[indexes.event_date!] ?? "").sort();

const mapBytes = await readFile(resolve(root, financeArtifact.localPath));
const mapArtifact = JSON.parse(mapBytes.toString("utf8")) as MapArtifact;
const zones = mapArtifact.basemap.admin1.filter(({ a3 }) => targetIso3.has(a3));
const zoneCounts = { MLI: 0, BFA: 0, NER: 0, TCD: 0, MRT: 0 };
let ringCount = 0;
let coordinateCount = 0;
let invalidCoordinateCount = 0;
let openRingCount = 0;
for (const zone of zones) {
  zoneCounts[zone.a3 as keyof typeof zoneCounts] += 1;
  for (const ring of zone.r) {
    ringCount += 1;
    coordinateCount += ring.length;
    if (ring.length < 4) invalidCoordinateCount += 1;
    for (const point of ring) {
      if (
        point.length !== 2 ||
        !Number.isFinite(point[0]) ||
        !Number.isFinite(point[1]) ||
        point[0] < -180 ||
        point[0] > 180 ||
        point[1] < -90 ||
        point[1] > 90
      ) {
        invalidCoordinateCount += 1;
      }
    }
    const first = ring[0];
    const last = ring.at(-1);
    if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
      openRingCount += 1;
    }
  }
}
const zoneIds = zones
  .map(({ a3, n }) => "ne-admin1:" + a3 + ":" + slug(n))
  .sort();
const crosswalkSha256 = sha256(zoneIds.join("\n") + "\n");
const reviewedEnclaveOverlapCount = zones.filter(
  (zone) =>
    zones.filter(
      (candidate) =>
        candidate.a3 === zone.a3 && pointInFeature(zone.x, zone.y, candidate),
    ).length > 1,
).length;

let uniqueEventsAllocatedToOneZone = 0;
let uniqueEventsResolvedByEnclaveTieBreak = 0;
let uniqueEventsRetainedAtCountryLevel = 0;
for (const event of uniqueEvents.values()) {
  const matches = zones.filter(
    (zone) =>
      zone.a3 === event.iso3 &&
      pointInFeature(event.longitude, event.latitude, zone),
  );
  if (matches.length === 0) uniqueEventsRetainedAtCountryLevel += 1;
  else if (matches.length === 1) uniqueEventsAllocatedToOneZone += 1;
  else uniqueEventsResolvedByEnclaveTieBreak += 1;
}

const financeRows = mapArtifact.finance.rows;
const inScopeFinance = financeRows.filter((row) =>
  targetIso2.has(String(row[1])),
);
const publisherRecords = { AfDB: 0, WB: 0 };
const financeCountryRecords = { ML: 0, BF: 0, NE: 0, TD: 0, MR: 0 };
for (const row of inScopeFinance) {
  const publisher = String(row[13]);
  const country = String(row[1]);
  if (publisher === "AfDB" || publisher === "WB")
    publisherRecords[publisher] += 1;
  if (country in financeCountryRecords) {
    financeCountryRecords[country as keyof typeof financeCountryRecords] += 1;
  }
}

const indexBytes = await readFile(resolve(root, indexArtifact.localPath));
const displacementBytes = await readFile(
  resolve(root, displacementArtifact.localPath),
);
const displacement = JSON.parse(displacementBytes.toString("utf8")) as {
  features?: unknown[];
};

const actual = ProductionSourceAuditReportSchema.parse({
  ...expected,
  conflict: {
    ...expected.conflict,
    eventArtifactSha256: sha256(eventBytes),
    indexArtifactSha256: sha256(indexBytes),
    totalRows: table.length,
    approvedCountryRows: approvedRows.length,
    approvedCountryUniqueEventIds: idCounts.size,
    approvedCountryDuplicateEventGroups: duplicateCounts.length,
    approvedCountryDuplicateRows: duplicateCounts.reduce(
      (sum, count) => sum + count,
      0,
    ),
    countryRows,
    minimumEventDate: eventDates[0],
    maximumEventDate: eventDates.at(-1),
    uniqueEventsAllocatedToOneZone,
    uniqueEventsResolvedByEnclaveTieBreak,
    uniqueEventsRetainedAtCountryLevel,
  },
  displacement: {
    ...expected.displacement,
    artifactSha256: sha256(displacementBytes),
    featureCount: displacement.features?.length ?? 0,
  },
  financeStatus: {
    ...expected.financeStatus,
    artifactSha256: sha256(mapBytes),
    totalRecords: financeRows.length,
    approvedCountryRecords: inScopeFinance.length,
    publisherRecords,
    countryRecords: financeCountryRecords,
  },
  geometry: {
    ...expected.geometry,
    artifactSha256: sha256(mapBytes),
    countryParents: new Set(zones.map(({ a3 }) => a3)).size,
    zoneCount: zones.length,
    zoneCounts,
    uniqueZoneIds: new Set(zoneIds).size,
    crosswalkSha256,
    ringCount,
    coordinateCount,
    invalidCoordinateCount,
    openRingCount,
    reviewedEnclaveOverlapCount,
  },
});

if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error("Prompt 25 production source audit is stale");
}

console.log(
  "PASS: Prompt 25 owner-approved source audit matches pinned artifacts " +
    "(" +
    zones.length +
    " zones; " +
    idCounts.size +
    " unique in-scope events; " +
    inScopeFinance.length +
    " in-scope finance rows; " +
    (displacement.features?.length ?? 0) +
    " displacement features).",
);
