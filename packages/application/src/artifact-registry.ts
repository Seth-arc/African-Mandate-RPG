import {
  BaselinePackageSchema,
  MethodologyManifestSchema,
  ScenarioBundleSchema,
  type BaselinePackage,
  type ScenarioBundle,
} from "@african-mandate/domain";
import { hashCanonicalJson } from "@african-mandate/simulation";
import { z } from "zod";

import type { ArtifactRegistryClient, ArtifactRegistryTypes } from "./ports.js";

export const APPLICATION_ADAPTER_CONTRACT_VERSION = "1.0.0" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const ImmutableUrlSchema = z.url();

export const JsonArtifactRefSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    hash: Sha256Schema,
    url: ImmutableUrlSchema,
  })
  .strict();

export const BaselineArtifactRefSchema = JsonArtifactRefSchema.extend({
  baselineVersion: z.string().min(1),
}).strict();

export const MapArtifactRefSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    hash: Sha256Schema,
    manifestUrl: ImmutableUrlSchema,
  })
  .strict();

export const MethodologyArtifactRefSchema = JsonArtifactRefSchema.extend({
  methodologyVersion: z.string().min(1),
}).strict();

/** Exact Save Snapshot v2 artifact identity from Technical v2 section 26. */
export const CampaignArtifactRefsSchema = z
  .object({
    scenarioId: z.string().min(1),
    scenarioBundleSchemaVersion: z.number().int().positive(),
    scenarioBundleHash: Sha256Schema,
    baselineSchemaVersion: z.number().int().positive(),
    baselineHash: Sha256Schema,
    mapArtifactSchemaVersion: z.number().int().positive(),
    mapArtifactHash: Sha256Schema,
  })
  .strict();

/**
 * Test-only proposal: the source defines the client methods but not the
 * post-registry-resolution envelope that supplies their immutable URLs.
 */
export const ResolvedCampaignArtifactRefsSchema = z
  .object({
    campaignArtifacts: CampaignArtifactRefsSchema,
    scenarioBundle: JsonArtifactRefSchema,
    baseline: BaselineArtifactRefSchema,
    mapArtifact: MapArtifactRefSchema,
    methodology: MethodologyArtifactRefSchema,
  })
  .strict();

export const ReleaseScenarioEntrySchema = z
  .object({
    defaultForNewCampaigns: z.boolean(),
    scenarioVersion: z.string().min(1),
    contentVersion: z.string().min(1),
    balanceProfileVersion: z.string().min(1),
    methodologyVersion: z.string().min(1),
    scenarioBundle: JsonArtifactRefSchema,
    baseline: BaselineArtifactRefSchema,
    mapArtifact: MapArtifactRefSchema,
    requiredSimulationModelVersion: z.string().min(1),
  })
  .strict();

export const ReleaseManifestSchema = z
  .object({
    releaseManifestSchemaVersion: z.number().int().positive(),
    appVersion: z.string().min(1),
    appBuildId: z.string().min(1),
    gameSchemaVersion: z.number().int().positive(),
    supportedSimulationModels: z.array(z.string().min(1)).min(1),
    scenarios: z.record(z.string().min(1), ReleaseScenarioEntrySchema),
  })
  .strict();

export const MapSourceLayerManifestSchema = z
  .object({
    sourceLayer: z.string().min(1),
    subjectKind: z.enum([
      "territory",
      "zone",
      "asset",
      "corridor",
      "baseline_event",
    ]),
    selectable: z.boolean(),
    idProperty: z.literal("subject_id"),
    requiredProperties: z.array(z.string().min(1)),
  })
  .strict();

export const MapArtifactManifestSchema = z
  .object({
    mapArtifactSchemaVersion: z.number().int().positive(),
    pmtilesUrl: ImmutableUrlSchema,
    pmtilesHash: Sha256Schema,
    sourceLayers: z.array(MapSourceLayerManifestSchema),
    crsSource: z.literal("EPSG:4326"),
    buildToolchainVersion: z.string().min(1),
  })
  .strict();

export type JsonArtifactRef = z.infer<typeof JsonArtifactRefSchema>;
export type BaselineArtifactRef = z.infer<typeof BaselineArtifactRefSchema>;
export type MapArtifactRef = z.infer<typeof MapArtifactRefSchema>;
export type MethodologyArtifactRef = z.infer<
  typeof MethodologyArtifactRefSchema
>;
export type CampaignArtifactRefs = z.infer<typeof CampaignArtifactRefsSchema>;
export type ResolvedCampaignArtifactRefs = z.infer<
  typeof ResolvedCampaignArtifactRefsSchema
>;
export type ReleaseManifest = z.infer<typeof ReleaseManifestSchema>;
export type MapArtifactManifest = z.infer<typeof MapArtifactManifestSchema>;
export type MethodologyManifest = z.infer<typeof MethodologyManifestSchema>;

export interface BrowserArtifactRegistryTypes extends ArtifactRegistryTypes {
  readonly releaseManifest: ReleaseManifest;
  readonly scenarioBundleRef: JsonArtifactRef;
  readonly scenarioBundle: ScenarioBundle;
  readonly baselineRef: BaselineArtifactRef;
  readonly baseline: BaselinePackage;
  readonly mapArtifactRef: MapArtifactRef;
  readonly mapArtifactManifest: MapArtifactManifest;
  readonly methodologyRef: MethodologyArtifactRef;
  readonly methodology: MethodologyManifest;
}

export class ArtifactRegistryError extends Error {}

export class ArtifactHashMismatchError extends ArtifactRegistryError {
  public constructor(url: string, expected: string, actual: string) {
    super(
      `Artifact hash mismatch for ${url}: expected ${expected}, received ${actual}`,
    );
    this.name = "ArtifactHashMismatchError";
  }
}

export class ArtifactFetchError extends ArtifactRegistryError {
  public constructor(url: string, status: number) {
    super(`Artifact fetch failed for ${url}: HTTP ${String(status)}`);
    this.name = "ArtifactFetchError";
  }
}

const verifiedJson = async <Value>(
  fetcher: typeof fetch,
  url: string,
  expectedHash: string,
  schema: z.ZodType<Value>,
): Promise<Value> => {
  const response = await fetcher(url);
  if (!response.ok) throw new ArtifactFetchError(url, response.status);
  const value = schema.parse(await response.json());
  const actualHash = hashCanonicalJson(value);
  if (actualHash !== expectedHash) {
    throw new ArtifactHashMismatchError(url, expectedHash, actualHash);
  }
  return value;
};

export class BrowserArtifactRegistryClient implements ArtifactRegistryClient<BrowserArtifactRegistryTypes> {
  readonly #releaseManifestUrl: string;
  readonly #fetcher: typeof fetch;

  public constructor(options: {
    readonly releaseManifestUrl: string;
    readonly fetcher?: typeof fetch;
  }) {
    this.#releaseManifestUrl = ImmutableUrlSchema.parse(
      options.releaseManifestUrl,
    );
    this.#fetcher = options.fetcher ?? globalThis.fetch;
  }

  public async loadReleaseManifest(): Promise<ReleaseManifest> {
    const response = await this.#fetcher(this.#releaseManifestUrl);
    if (!response.ok) {
      throw new ArtifactFetchError(this.#releaseManifestUrl, response.status);
    }
    return ReleaseManifestSchema.parse(await response.json());
  }

  public loadScenarioBundle(referenceValue: JsonArtifactRef) {
    const reference = JsonArtifactRefSchema.parse(referenceValue);
    return verifiedJson(
      this.#fetcher,
      reference.url,
      reference.hash,
      ScenarioBundleSchema,
    );
  }

  public loadBaseline(referenceValue: BaselineArtifactRef) {
    const reference = BaselineArtifactRefSchema.parse(referenceValue);
    return verifiedJson(
      this.#fetcher,
      reference.url,
      reference.hash,
      BaselinePackageSchema,
    );
  }

  public loadMapManifest(referenceValue: MapArtifactRef) {
    const reference = MapArtifactRefSchema.parse(referenceValue);
    return verifiedJson(
      this.#fetcher,
      reference.manifestUrl,
      reference.hash,
      MapArtifactManifestSchema,
    );
  }

  public loadMethodology(referenceValue: MethodologyArtifactRef) {
    const reference = MethodologyArtifactRefSchema.parse(referenceValue);
    return verifiedJson(
      this.#fetcher,
      reference.url,
      reference.hash,
      MethodologyManifestSchema,
    );
  }

  public async resolveCampaignArtifacts(
    referenceValue: ResolvedCampaignArtifactRefs,
  ) {
    const references = ResolvedCampaignArtifactRefsSchema.parse(referenceValue);
    if (
      references.scenarioBundle.schemaVersion !==
        references.campaignArtifacts.scenarioBundleSchemaVersion ||
      references.scenarioBundle.hash !==
        references.campaignArtifacts.scenarioBundleHash ||
      references.baseline.schemaVersion !==
        references.campaignArtifacts.baselineSchemaVersion ||
      references.baseline.hash !== references.campaignArtifacts.baselineHash ||
      references.mapArtifact.schemaVersion !==
        references.campaignArtifacts.mapArtifactSchemaVersion ||
      references.mapArtifact.hash !==
        references.campaignArtifacts.mapArtifactHash
    ) {
      throw new ArtifactRegistryError(
        "Resolved artifact references do not match the campaign-pinned identity",
      );
    }
    const [scenarioBundle, baseline, mapArtifactManifest, methodology] =
      await Promise.all([
        this.loadScenarioBundle(references.scenarioBundle),
        this.loadBaseline(references.baseline),
        this.loadMapManifest(references.mapArtifact),
        this.loadMethodology(references.methodology),
      ]);
    if (
      scenarioBundle.scenario.scenarioId !==
      references.campaignArtifacts.scenarioId
    ) {
      throw new ArtifactRegistryError(
        "Scenario artifact identity does not match the campaign-pinned scenario",
      );
    }
    return { scenarioBundle, baseline, mapArtifactManifest, methodology };
  }
}
