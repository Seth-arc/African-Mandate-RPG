import { z } from "zod";

import {
  ActionIdSchema,
  ActorIdSchema,
  AssessmentIdSchema,
  CampaignIdSchema,
  CommitmentIdSchema,
  ConsequenceIdSchema,
  DecisionIdSchema,
  DisputeIdSchema,
  InstitutionIdSchema,
  MandateCaseIdSchema,
  MemoryIdSchema,
  PositionIdSchema,
  ProjectIdSchema,
  RedLineIdSchema,
  RelationshipIdSchema,
  SituationIdSchema,
  WorldEventIdSchema,
} from "./ids.js";
import { JsonObjectSchema } from "./json.js";
import { SubjectRefSchema } from "./references.js";
import {
  IsoDateSchema,
  MoneyAmountSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import { DoctrineDeltaSchema } from "./scenario.js";
import { CampaignVersionsSchema } from "./versions.js";

export const CampaignMetaSchema = z
  .object({
    campaignId: CampaignIdSchema,
    scenarioId: NonEmptyStringSchema,
    campaignSeed: NonEmptyStringSchema,
    difficultyProfileId: NonEmptyStringSchema,
    currentTurn: PositiveIntegerSchema,
    maxTurns: PositiveIntegerSchema,
    currentDate: IsoDateSchema,
    decisionsRemaining: NonNegativeIntegerSchema,
    decisionsPerTurn: PositiveIntegerSchema,
    revision: NonNegativeIntegerSchema,
    status: z.enum(["active", "completed", "terminated", "invalid"]),
    terminationReasonCode: NonEmptyStringSchema.optional(),
  })
  .strict()
  .superRefine((meta, ctx) => {
    if (meta.currentTurn > meta.maxTurns) {
      ctx.addIssue({
        code: "custom",
        message: "currentTurn must not exceed maxTurns",
        path: ["currentTurn"],
      });
    }
    if (meta.decisionsRemaining > meta.decisionsPerTurn) {
      ctx.addIssue({
        code: "custom",
        message: "decisionsRemaining must not exceed decisionsPerTurn",
        path: ["decisionsRemaining"],
      });
    }
  });

export const EnvoyStateSchema = z
  .object({
    representedInstitutionId: InstitutionIdSchema,
    materialResources: z
      .object({
        budget: MoneyAmountSchema,
        personnel: NonNegativeIntegerSchema,
        logistics: ScoreSchema,
      })
      .strict(),
    institutionalCapacity: z
      .object({
        mandateAuthority: ScoreSchema,
        politicalCapital: ScoreSchema,
        secretariatCapacity: ScoreSchema,
        memberStateAlignment: ScoreSchema,
        partnerConfidence: ScoreSchema,
        implementationCapacity: ScoreSchema,
        intelligenceConfidence: ScoreSchema,
      })
      .strict(),
  })
  .strict();

export const DomainEventRecordSchema = z
  .object({
    domainEventId: NonEmptyStringSchema,
    turn: PositiveIntegerSchema,
    eventType: NonEmptyStringSchema,
    aggregateType: NonEmptyStringSchema,
    aggregateId: NonEmptyStringSchema,
    sourceDecisionId: DecisionIdSchema.optional(),
    sourceWorldEventId: WorldEventIdSchema.optional(),
    sourceConsequenceId: ConsequenceIdSchema.optional(),
    payload: JsonObjectSchema,
  })
  .strict();

export const DecisionRecordSchema = z
  .object({
    decisionId: DecisionIdSchema,
    commandId: NonEmptyStringSchema,
    turn: PositiveIntegerSchema,
    sequenceWithinTurn: PositiveIntegerSchema,
    actionId: ActionIdSchema,
    targets: z.array(SubjectRefSchema),
    assessmentIds: z.array(AssessmentIdSchema),
    mandateCaseId: MandateCaseIdSchema.optional(),
    decisionSlotCost: NonNegativeIntegerSchema,
    createdDomainEventIds: z.array(NonEmptyStringSchema),
    createdConsequenceIds: z.array(ConsequenceIdSchema),
    doctrineDelta: DoctrineDeltaSchema,
  })
  .strict();

export const CampaignStateSchema = z
  .object({
    meta: CampaignMetaSchema,
    player: EnvoyStateSchema,
    world: JsonObjectSchema,
    institutions: z.record(InstitutionIdSchema, JsonObjectSchema),
    actors: z.record(ActorIdSchema, JsonObjectSchema),
    relationships: z.record(RelationshipIdSchema, JsonObjectSchema),
    positions: z.record(PositionIdSchema, JsonObjectSchema),
    memories: z.record(MemoryIdSchema, JsonObjectSchema),
    commitments: z.record(CommitmentIdSchema, JsonObjectSchema),
    redLines: z.record(RedLineIdSchema, JsonObjectSchema),
    disputes: z.record(DisputeIdSchema, JsonObjectSchema),
    knowledge: JsonObjectSchema,
    assessments: z.record(AssessmentIdSchema, JsonObjectSchema),
    mandateCases: z.record(MandateCaseIdSchema, JsonObjectSchema),
    implementations: z.record(ProjectIdSchema, JsonObjectSchema),
    worldEvents: z.record(WorldEventIdSchema, JsonObjectSchema),
    situations: z.record(SituationIdSchema, JsonObjectSchema),
    attention: JsonObjectSchema,
    scheduledConsequences: z.record(ConsequenceIdSchema, JsonObjectSchema),
    doctrine: JsonObjectSchema,
    evaluation: JsonObjectSchema,
    decisions: z.array(DecisionRecordSchema),
    domainEvents: z.array(DomainEventRecordSchema),
    processedCommandIds: z.record(z.string(), z.literal(true)),
    versions: CampaignVersionsSchema,
  })
  .strict();

export type CampaignMeta = z.infer<typeof CampaignMetaSchema>;
export type EnvoyState = z.infer<typeof EnvoyStateSchema>;
export type DomainEventRecord = z.infer<typeof DomainEventRecordSchema>;
export type DecisionRecord = z.infer<typeof DecisionRecordSchema>;
export type CampaignState = z.infer<typeof CampaignStateSchema>;
