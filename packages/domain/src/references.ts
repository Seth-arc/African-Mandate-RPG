import { z } from "zod";

import {
  ActorIdSchema,
  AssessmentIdSchema,
  AssetIdSchema,
  CorridorIdSchema,
  InstitutionIdSchema,
  MandateCaseIdSchema,
  TerritoryIdSchema,
  WorldEventIdSchema,
  ZoneIdSchema,
} from "./ids.js";

export const PartyRefSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("actor"), actorId: ActorIdSchema }).strict(),
  z
    .object({
      kind: z.literal("institution"),
      institutionId: InstitutionIdSchema,
    })
    .strict(),
]);

export const SubjectKindSchema = z.enum([
  "territory",
  "zone",
  "asset",
  "corridor",
  "actor",
  "institution",
  "assessment",
  "mandate_case",
  "world_event",
]);

export const SubjectRefSchema = z.discriminatedUnion("kind", [
  z
    .object({ kind: z.literal("territory"), territoryId: TerritoryIdSchema })
    .strict(),
  z.object({ kind: z.literal("zone"), zoneId: ZoneIdSchema }).strict(),
  z.object({ kind: z.literal("asset"), assetId: AssetIdSchema }).strict(),
  z
    .object({ kind: z.literal("corridor"), corridorId: CorridorIdSchema })
    .strict(),
  z.object({ kind: z.literal("actor"), actorId: ActorIdSchema }).strict(),
  z
    .object({
      kind: z.literal("institution"),
      institutionId: InstitutionIdSchema,
    })
    .strict(),
  z
    .object({ kind: z.literal("assessment"), assessmentId: AssessmentIdSchema })
    .strict(),
  z
    .object({
      kind: z.literal("mandate_case"),
      mandateCaseId: MandateCaseIdSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("world_event"),
      worldEventId: WorldEventIdSchema,
    })
    .strict(),
]);

export type PartyRef = z.infer<typeof PartyRefSchema>;
export type SubjectKind = z.infer<typeof SubjectKindSchema>;
export type SubjectRef = z.infer<typeof SubjectRefSchema>;
