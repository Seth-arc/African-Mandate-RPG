import type { CampaignId } from "@african-mandate/domain";

export const APPLICATION_PORT_CONTRACT_VERSION = "1.0.0" as const;

export interface SimulationPortTypes {
  readonly command: unknown;
  readonly commandResult: unknown;
  readonly turnResult: unknown;
  readonly initializationInput: unknown;
  readonly campaignState: unknown;
  readonly projectionRequest: unknown;
  readonly playerProjection: unknown;
}

export interface SimulationPort<Types extends SimulationPortTypes> {
  dispatch(command: Types["command"]): Promise<Types["commandResult"]>;
  endTurn(): Promise<Types["turnResult"]>;
  initialize(
    input: Types["initializationInput"],
  ): Promise<Types["campaignState"]>;
  buildProjection(
    request: Types["projectionRequest"],
  ): Promise<Types["playerProjection"]>;
}

export interface CampaignRepositoryTypes {
  readonly snapshot: {
    readonly campaignId: CampaignId;
    readonly campaignRevision: number;
  };
  readonly cloudSyncResult: unknown;
}

export interface CampaignRepository<Types extends CampaignRepositoryTypes> {
  load(id: CampaignId): Promise<Types["snapshot"]>;
  writeLocal(snapshot: Types["snapshot"]): Promise<void>;
  syncCloud?(
    snapshot: Types["snapshot"],
    expectedRemoteRevision: number,
  ): Promise<Types["cloudSyncResult"]>;
}

export type CampaignPersistencePort<Types extends CampaignRepositoryTypes> =
  CampaignRepository<Types>;

export interface ArtifactRegistryTypes {
  readonly releaseManifest: unknown;
  readonly scenarioBundleRef: unknown;
  readonly scenarioBundle: unknown;
  readonly baselineRef: unknown;
  readonly baseline: unknown;
  readonly mapArtifactRef: unknown;
  readonly mapArtifactManifest: unknown;
  readonly methodologyRef: unknown;
  readonly methodology: unknown;
}

export interface ArtifactRegistryClient<Types extends ArtifactRegistryTypes> {
  loadReleaseManifest(): Promise<Types["releaseManifest"]>;
  loadScenarioBundle(
    reference: Types["scenarioBundleRef"],
  ): Promise<Types["scenarioBundle"]>;
  loadBaseline(reference: Types["baselineRef"]): Promise<Types["baseline"]>;
  loadMapManifest(
    reference: Types["mapArtifactRef"],
  ): Promise<Types["mapArtifactManifest"]>;
  loadMethodology(
    reference: Types["methodologyRef"],
  ): Promise<Types["methodology"]>;
}

export interface NarrativePortTypes {
  readonly request: unknown;
  readonly response: unknown;
}

export interface NarrativePort<Types extends NarrativePortTypes> {
  request(context: Types["request"]): Promise<Types["response"]>;
}

export interface CampaignEditLease {
  readonly campaignId: CampaignId;
  release(): Promise<void>;
}

export interface CampaignEditLock {
  acquire(campaignId: CampaignId): Promise<CampaignEditLease>;
}

export type CampaignEditLockPort = CampaignEditLock;

export const CAMPAIGN_OPERATION_KINDS = [
  "strategic_command",
  "end_turn",
  "campaign_initialization",
  "save_migration",
  "conflict_resolution_replacement",
] as const;

export type CampaignOperationKind = (typeof CAMPAIGN_OPERATION_KINDS)[number];

export interface CampaignOperationCoordinator {
  runExclusive<Result>(
    campaignId: CampaignId,
    kind: CampaignOperationKind,
    operation: () => Promise<Result>,
  ): Promise<Result>;
}
