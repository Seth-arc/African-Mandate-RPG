import { z } from "zod";

import {
  AssetIdSchema,
  CommitmentIdSchema,
  CorridorIdSchema,
  DisputeIdSchema,
  InstitutionIdSchema,
  TerritoryIdSchema,
  ZoneIdSchema,
} from "./ids.js";
import {
  NonEmptyStringSchema,
  ScoreSchema,
  SignedScoreSchema,
} from "./scalars.js";

const addKeyMismatchIssues = <T extends Record<string, unknown>>(
  values: Record<string, T>,
  idField: keyof T,
  path: string,
  ctx: z.RefinementCtx,
): void => {
  for (const [key, value] of Object.entries(values)) {
    if (value[idField] !== key) {
      ctx.addIssue({
        code: "custom",
        message: `${path} key must match ${String(idField)}`,
        path: [path, key, String(idField)],
      });
    }
  }
};

export const TerritoryRuntimeStateSchema = z
  .object({
    territoryId: TerritoryIdSchema,
    stability: ScoreSchema,
    institutionalCapacity: ScoreSchema,
    economicResilience: ScoreSchema,
    politicalStatusTags: z.array(NonEmptyStringSchema),
  })
  .strict();

export const ZoneRuntimeStateSchema = z
  .object({
    zoneId: ZoneIdSchema,
    statePresence: ScoreSchema,
    controlContest: ScoreSchema,
    localGovernanceCapacity: ScoreSchema,
    tags: z.array(NonEmptyStringSchema),
  })
  .strict();

export const ConflictZoneStateSchema = z
  .object({
    zoneId: ZoneIdSchema,
    armedActivity: ScoreSchema,
    civilianTargeting: ScoreSchema,
    actorFragmentation: ScoreSchema,
    mobility: ScoreSchema,
    recruitmentPressure: ScoreSchema,
    escalationMomentum: SignedScoreSchema,
    spilloverPressure: ScoreSchema,
  })
  .strict();

export const ConflictWorldStateSchema = z
  .object({ zones: z.record(ZoneIdSchema, ConflictZoneStateSchema) })
  .strict()
  .superRefine((state, ctx) =>
    addKeyMismatchIssues(state.zones, "zoneId", "zones", ctx),
  );

export const CivilianZoneStateSchema = z
  .object({
    civilianConfidence: ScoreSchema,
    displacementPressure: ScoreSchema,
    humanitarianAccess: ScoreSchema,
    serviceReliability: ScoreSchema,
    perceivedLegitimacy: ScoreSchema,
  })
  .strict();

export const CivilianWorldStateSchema = z
  .object({ zones: z.record(ZoneIdSchema, CivilianZoneStateSchema) })
  .strict();

export const AssetOperationalStatusSchema = z.enum([
  "operational",
  "degraded",
  "disrupted",
  "offline",
  "under_construction",
  "planned",
  "unknown",
]);

export const AssetRuntimeStateSchema = z
  .object({
    assetId: AssetIdSchema,
    operationalStatus: AssetOperationalStatusSchema,
    disruptionRisk: ScoreSchema,
    conflictExposure: ScoreSchema,
    economicDependency: ScoreSchema,
  })
  .strict();

export const CorridorRuntimeStateSchema = z
  .object({
    corridorId: CorridorIdSchema,
    throughput: ScoreSchema,
    resilience: ScoreSchema,
    disruptionRisk: ScoreSchema,
  })
  .strict();

export const InfrastructureWorldStateSchema = z
  .object({
    assets: z.record(AssetIdSchema, AssetRuntimeStateSchema),
    corridors: z.record(CorridorIdSchema, CorridorRuntimeStateSchema),
  })
  .strict()
  .superRefine((state, ctx) => {
    addKeyMismatchIssues(state.assets, "assetId", "assets", ctx);
    addKeyMismatchIssues(state.corridors, "corridorId", "corridors", ctx);
  });

export const DevelopmentZoneStateSchema = z
  .object({
    investmentPipeline: ScoreSchema,
    implementationAbsorption: ScoreSchema,
    infrastructureNeed: ScoreSchema,
    serviceDeficit: ScoreSchema,
    externalFinanceDependence: ScoreSchema,
  })
  .strict();

export const DevelopmentWorldStateSchema = z
  .object({ zones: z.record(ZoneIdSchema, DevelopmentZoneStateSchema) })
  .strict();

export const ExternalEnvironmentStateSchema = z
  .object({
    externalPowerCompetition: ScoreSchema,
    donorRiskTolerance: ScoreSchema,
    commodityPressure: ScoreSchema,
    regionalDiplomaticPressure: ScoreSchema,
  })
  .strict();

export const WorldRuntimeStateSchema = z
  .object({
    territories: z.record(TerritoryIdSchema, TerritoryRuntimeStateSchema),
    zones: z.record(ZoneIdSchema, ZoneRuntimeStateSchema),
    conflict: ConflictWorldStateSchema,
    civilian: CivilianWorldStateSchema,
    infrastructure: InfrastructureWorldStateSchema,
    development: DevelopmentWorldStateSchema,
    externalEnvironment: ExternalEnvironmentStateSchema,
  })
  .strict()
  .superRefine((state, ctx) => {
    addKeyMismatchIssues(state.territories, "territoryId", "territories", ctx);
    addKeyMismatchIssues(state.zones, "zoneId", "zones", ctx);
  });

export const InstitutionalResourcesSchema = z
  .object({
    financialCapacity: ScoreSchema,
    personnelCapacity: ScoreSchema,
    logisticsCapacity: ScoreSchema,
    diplomaticCapacity: ScoreSchema,
    intelligenceCapacity: ScoreSchema,
    implementationCapacity: ScoreSchema,
  })
  .strict();

export const InstitutionRuntimeStateSchema = z
  .object({
    institutionId: InstitutionIdSchema,
    resources: InstitutionalResourcesSchema,
    policyPositions: z.record(z.string(), ScoreSchema),
    activeCommitmentIds: z.array(CommitmentIdSchema),
    activeDisputeIds: z.array(DisputeIdSchema),
    legitimacy: ScoreSchema,
    coordinationCapacity: ScoreSchema,
  })
  .strict();

export type TerritoryRuntimeState = z.infer<typeof TerritoryRuntimeStateSchema>;
export type ZoneRuntimeState = z.infer<typeof ZoneRuntimeStateSchema>;
export type ConflictWorldState = z.infer<typeof ConflictWorldStateSchema>;
export type CivilianWorldState = z.infer<typeof CivilianWorldStateSchema>;
export type InfrastructureWorldState = z.infer<
  typeof InfrastructureWorldStateSchema
>;
export type DevelopmentWorldState = z.infer<typeof DevelopmentWorldStateSchema>;
export type ExternalEnvironmentState = z.infer<
  typeof ExternalEnvironmentStateSchema
>;
export type WorldRuntimeState = z.infer<typeof WorldRuntimeStateSchema>;
export type InstitutionRuntimeState = z.infer<
  typeof InstitutionRuntimeStateSchema
>;
