import { z } from "zod";

const id = <T extends string>(prefix: string) =>
  z
    .string()
    .regex(new RegExp(`^${prefix}[a-z0-9][a-z0-9_-]*$`, "u"))
    .brand<T>();

export const CampaignIdSchema = id<"CampaignId">("campaign_");
export const TerritoryIdSchema = id<"TerritoryId">("territory_");
export const ZoneIdSchema = id<"ZoneId">("zone_");
export const AssetIdSchema = id<"AssetId">("asset_");
export const CorridorIdSchema = id<"CorridorId">("corridor_");
export const InstitutionIdSchema = id<"InstitutionId">("institution_");
export const ActorIdSchema = id<"ActorId">("actor_");
export const RelationshipIdSchema = id<"RelationshipId">("relationship_");
export const PositionIdSchema = id<"PositionId">("position_");
export const MemoryIdSchema = id<"MemoryId">("memory_");
export const CommitmentIdSchema = id<"CommitmentId">("commitment_");
export const RedLineIdSchema = id<"RedLineId">("redline_");
export const DisputeIdSchema = id<"DisputeId">("dispute_");
export const EvidenceIdSchema = id<"EvidenceId">("evidence_");
export const ReportIdSchema = id<"ReportId">("report_");
export const IntelligenceGapIdSchema = id<"IntelligenceGapId">("gap_");
export const CollectionTaskIdSchema = id<"CollectionTaskId">("collection_");
export const AssessmentIdSchema = id<"AssessmentId">("assessment_");
export const MandateCaseIdSchema = id<"MandateCaseId">("case_");
export const ProjectIdSchema = id<"ProjectId">("project_");
export const DecisionIdSchema = id<"DecisionId">("decision_");
export const ConsequenceIdSchema = id<"ConsequenceId">("consequence_");
export const EventDefinitionIdSchema = id<"EventDefinitionId">("eventdef_");
export const WorldEventIdSchema = id<"WorldEventId">("worldevent_");
export const SituationIdSchema = id<"SituationId">("situation_");
export const AttentionItemIdSchema = id<"AttentionItemId">("attention_");
export const BriefingIdSchema = id<"BriefingId">("briefing_");
export const ActionIdSchema = id<"ActionId">("action_");
export const EffectProfileIdSchema = id<"EffectProfileId">("effectprofile_");

export type CampaignId = z.infer<typeof CampaignIdSchema>;
export type TerritoryId = z.infer<typeof TerritoryIdSchema>;
export type ZoneId = z.infer<typeof ZoneIdSchema>;
export type AssetId = z.infer<typeof AssetIdSchema>;
export type CorridorId = z.infer<typeof CorridorIdSchema>;
export type InstitutionId = z.infer<typeof InstitutionIdSchema>;
export type ActorId = z.infer<typeof ActorIdSchema>;
export type RelationshipId = z.infer<typeof RelationshipIdSchema>;
export type PositionId = z.infer<typeof PositionIdSchema>;
export type MemoryId = z.infer<typeof MemoryIdSchema>;
export type CommitmentId = z.infer<typeof CommitmentIdSchema>;
export type RedLineId = z.infer<typeof RedLineIdSchema>;
export type DisputeId = z.infer<typeof DisputeIdSchema>;
export type EvidenceId = z.infer<typeof EvidenceIdSchema>;
export type ReportId = z.infer<typeof ReportIdSchema>;
export type IntelligenceGapId = z.infer<typeof IntelligenceGapIdSchema>;
export type CollectionTaskId = z.infer<typeof CollectionTaskIdSchema>;
export type AssessmentId = z.infer<typeof AssessmentIdSchema>;
export type MandateCaseId = z.infer<typeof MandateCaseIdSchema>;
export type ProjectId = z.infer<typeof ProjectIdSchema>;
export type DecisionId = z.infer<typeof DecisionIdSchema>;
export type ConsequenceId = z.infer<typeof ConsequenceIdSchema>;
export type EventDefinitionId = z.infer<typeof EventDefinitionIdSchema>;
export type WorldEventId = z.infer<typeof WorldEventIdSchema>;
export type SituationId = z.infer<typeof SituationIdSchema>;
export type AttentionItemId = z.infer<typeof AttentionItemIdSchema>;
export type BriefingId = z.infer<typeof BriefingIdSchema>;
export type ActionId = z.infer<typeof ActionIdSchema>;
export type EffectProfileId = z.infer<typeof EffectProfileIdSchema>;
