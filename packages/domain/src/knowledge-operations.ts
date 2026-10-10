import { z } from "zod";

import { CampaignStateSchema } from "./campaign.js";
import {
  CollectionTaskIdSchema,
  EffectProfileIdSchema,
  EvidenceIdSchema,
  IntelligenceGapIdSchema,
} from "./ids.js";
import {
  CollectionTaskSchema,
  EvidenceRecordSchema,
  IntelligenceGapSchema,
  KNOWLEDGE_CONTRACT_VERSION,
  ObservationCandidateSchema,
  PlayerKnowledgeStateSchema,
} from "./knowledge-state.js";
import { SubjectRefSchema } from "./references.js";
import {
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";

export const CreateCollectionTaskEffectSchema = z
  .object({
    effectId: NonEmptyStringSchema,
    kind: z.literal("create_collection_task"),
    collectionTemplateId: NonEmptyStringSchema,
  })
  .strict();

export const KnowledgeEffectProfileSchema = z
  .object({
    effectProfileId: EffectProfileIdSchema,
    effects: z.array(CreateCollectionTaskEffectSchema).min(1),
  })
  .strict();

export const CollectionTaskTemplateSchema = z
  .object({
    collectionTemplateId: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_COLLECTION_TEMPLATE"),
    gapId: IntelligenceGapIdSchema.optional(),
    subject: SubjectRefSchema,
    questionCode: NonEmptyStringSchema,
    collectionChannel: CollectionTaskSchema.shape.collectionChannel,
    delayTurns: PositiveIntegerSchema,
    expectedQuality: ScoreSchema,
  })
  .strict();

export const EvidenceFreshnessProfileSchema = z
  .object({
    decayProfileId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_FRESHNESS_PROFILE"),
    factors: z
      .array(
        z
          .object({
            ageTurns: NonNegativeIntegerSchema,
            freshness: ScoreSchema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((profile, ctx) => {
    const ages = new Set<number>();
    profile.factors.forEach((factor, index) => {
      if (ages.has(factor.ageTurns)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate ageTurns: ${factor.ageTurns}`,
          path: ["factors", index, "ageTurns"],
        });
      }
      ages.add(factor.ageTurns);
    });
    if (!ages.has(0)) {
      ctx.addIssue({
        code: "custom",
        message: "A freshness factor for ageTurns 0 is required",
        path: ["factors"],
      });
    }
  });

export const EvidenceConfidenceRequestSchema = z
  .object({
    contractVersion: z.literal(KNOWLEDGE_CONTRACT_VERSION),
    evidence: EvidenceRecordSchema,
    currentTurn: PositiveIntegerSchema,
    freshnessProfile: EvidenceFreshnessProfileSchema,
    corroborationModifier: ScoreSchema,
    accessCollectionQualityModifier: ScoreSchema,
  })
  .strict();

export const EvidenceConfidenceResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("calculated"),
      effectiveConfidence: ScoreSchema,
      freshness: ScoreSchema,
      ageTurns: NonNegativeIntegerSchema,
      profileVersion: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("unavailable"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "CURRENT_TURN_PRECEDES_OBSERVATION",
        "DECAY_PROFILE_MISMATCH",
        "FRESHNESS_FACTOR_NOT_DEFINED",
      ]),
    })
    .strict(),
]);

export const EmittedObservationSchema = z
  .object({
    observation: ObservationCandidateSchema,
    evidence: EvidenceRecordSchema,
  })
  .strict();

export const COLLECTION_OUTCOMES = [
  "useful",
  "partial",
  "contested",
  "inconclusive",
  "delayed",
  "failed",
] as const;

export const CollectionOutcomeSchema = z.enum(COLLECTION_OUTCOMES);

export const CollectionResolutionPlanSchema = z
  .object({
    collectionTaskId: CollectionTaskIdSchema,
    outcome: CollectionOutcomeSchema,
    emittedObservations: z.array(EmittedObservationSchema),
    revisedDueTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((plan, ctx) => {
    const observationCount = plan.emittedObservations.length;
    if (plan.outcome === "useful" && observationCount < 1) {
      ctx.addIssue({ code: "custom", message: "useful requires evidence" });
    }
    if (plan.outcome === "partial" && observationCount < 1) {
      ctx.addIssue({ code: "custom", message: "partial requires evidence" });
    }
    if (plan.outcome === "contested" && observationCount < 2) {
      ctx.addIssue({
        code: "custom",
        message: "contested requires at least two observations",
      });
    }
    if (
      ["inconclusive", "delayed", "failed"].includes(plan.outcome) &&
      observationCount > 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${plan.outcome} must not presume new evidence`,
        path: ["emittedObservations"],
      });
    }
    if ((plan.outcome === "delayed") !== (plan.revisedDueTurn !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "revisedDueTurn is required exactly for delayed outcome",
        path: ["revisedDueTurn"],
      });
    }
  });

export const CollectionResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(KNOWLEDGE_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_COLLECTION_RESOLUTION"),
    currentState: CampaignStateSchema,
    plan: CollectionResolutionPlanSchema,
  })
  .strict();

export const CollectionResolutionTraceSchema = z
  .object({
    collectionTaskId: CollectionTaskIdSchema,
    turn: PositiveIntegerSchema,
    outcome: CollectionOutcomeSchema,
    taskStatus: CollectionTaskSchema.shape.status,
    gapStatus: IntelligenceGapSchema.shape.status.optional(),
    emittedEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict();

export const CollectionResolutionResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      trace: CollectionResolutionTraceSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "TASK_NOT_FOUND",
        "TASK_NOT_PENDING",
        "TASK_NOT_DUE",
        "INVALID_DELAY",
        "OBSERVATION_NOT_ELIGIBLE",
        "OBSERVATION_EVIDENCE_MISMATCH",
        "DUPLICATE_EVIDENCE",
        "CONTESTED_OUTCOME_NOT_CONTRADICTORY",
        "INVALID_RESULT",
      ]),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const EvidenceContradictionSchema = z
  .object({
    contradictionKey: NonEmptyStringSchema,
    evidenceIds: z.array(EvidenceIdSchema).min(2),
  })
  .strict();

export const PlayerKnowledgeProjectionSchema = z
  .object({
    campaignRevision: NonNegativeIntegerSchema,
    knowledge: PlayerKnowledgeStateSchema,
    contradictions: z.array(EvidenceContradictionSchema),
  })
  .strict();

export const KnowledgeClaimLookupResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("known"),
      evidenceIds: z.array(EvidenceIdSchema).min(1),
    })
    .strict(),
  z
    .object({
      status: z.literal("missing"),
      reasonCode: z.literal("NO_PLAYER_EVIDENCE"),
    })
    .strict(),
]);

export type KnowledgeEffectProfile = z.infer<
  typeof KnowledgeEffectProfileSchema
>;
export type CreateCollectionTaskEffect = z.infer<
  typeof CreateCollectionTaskEffectSchema
>;
export type CollectionTaskTemplate = z.infer<
  typeof CollectionTaskTemplateSchema
>;
export type EvidenceFreshnessProfile = z.infer<
  typeof EvidenceFreshnessProfileSchema
>;
export type EvidenceConfidenceResult = z.infer<
  typeof EvidenceConfidenceResultSchema
>;
export type EvidenceConfidenceRequest = z.infer<
  typeof EvidenceConfidenceRequestSchema
>;
export type EmittedObservation = z.infer<typeof EmittedObservationSchema>;
export type CollectionOutcome = z.infer<typeof CollectionOutcomeSchema>;
export type CollectionResolutionPlan = z.infer<
  typeof CollectionResolutionPlanSchema
>;
export type CollectionResolutionRequest = z.infer<
  typeof CollectionResolutionRequestSchema
>;
export type CollectionResolutionResult = z.infer<
  typeof CollectionResolutionResultSchema
>;
export type CollectionResolutionTrace = z.infer<
  typeof CollectionResolutionTraceSchema
>;
export type EvidenceContradiction = z.infer<typeof EvidenceContradictionSchema>;
export type PlayerKnowledgeProjection = z.infer<
  typeof PlayerKnowledgeProjectionSchema
>;
export type KnowledgeClaimLookupResult = z.infer<
  typeof KnowledgeClaimLookupResultSchema
>;
