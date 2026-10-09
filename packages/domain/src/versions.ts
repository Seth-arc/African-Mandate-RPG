import { z } from "zod";

const versionTag = <T extends string>() => z.string().trim().min(1).brand<T>();

export const GameSchemaVersionSchema = z
  .number()
  .int()
  .positive()
  .brand<"GameSchemaVersion">();
export const SimulationModelVersionSchema =
  versionTag<"SimulationModelVersion">();
export const BaselineVersionSchema = versionTag<"BaselineVersion">();
export const ScenarioVersionSchema = versionTag<"ScenarioVersion">();
export const ContentVersionSchema = versionTag<"ContentVersion">();
export const BalanceProfileVersionSchema =
  versionTag<"BalanceProfileVersion">();
export const MethodologyVersionSchema = versionTag<"MethodologyVersion">();

export const CampaignVersionsSchema = z
  .object({
    gameSchemaVersion: GameSchemaVersionSchema,
    simulationModelVersion: SimulationModelVersionSchema,
    baselineVersion: BaselineVersionSchema,
    scenarioVersion: ScenarioVersionSchema,
    contentVersion: ContentVersionSchema,
    balanceProfileVersion: BalanceProfileVersionSchema,
    methodologyVersion: MethodologyVersionSchema,
  })
  .strict();

export type GameSchemaVersion = z.infer<typeof GameSchemaVersionSchema>;
export type SimulationModelVersion = z.infer<
  typeof SimulationModelVersionSchema
>;
export type BaselineVersion = z.infer<typeof BaselineVersionSchema>;
export type ScenarioVersion = z.infer<typeof ScenarioVersionSchema>;
export type ContentVersion = z.infer<typeof ContentVersionSchema>;
export type BalanceProfileVersion = z.infer<typeof BalanceProfileVersionSchema>;
export type MethodologyVersion = z.infer<typeof MethodologyVersionSchema>;
export type CampaignVersions = z.infer<typeof CampaignVersionsSchema>;
