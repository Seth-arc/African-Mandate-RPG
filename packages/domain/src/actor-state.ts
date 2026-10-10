import { z } from "zod";

import {
  ActionIdSchema,
  ActorIdSchema,
  AssessmentIdSchema,
  CommitmentIdSchema,
  DecisionIdSchema,
  DisputeIdSchema,
  EffectProfileIdSchema,
  MandateCaseIdSchema,
  MemoryIdSchema,
  PositionIdSchema,
  RedLineIdSchema,
  RelationshipIdSchema,
} from "./ids.js";
import { PartyRefSchema } from "./references.js";
import { RuleExpressionSchema } from "./rules.js";
import {
  NonEmptyStringSchema,
  PositiveIntegerSchema,
  ScoreSchema,
  SignedScoreSchema,
} from "./scalars.js";

export const ACTOR_CONTRACT_VERSION = "1.0.0" as const;

const addDuplicateIssues = (
  values: readonly string[],
  path: string,
  ctx: z.RefinementCtx,
): void => {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate ID: ${value}`,
        path: [path, index],
      });
    }
    seen.add(value);
  });
};

export const ActorCapabilityStateSchema = z
  .object({
    political: ScoreSchema,
    coercive: ScoreSchema,
    financial: ScoreSchema,
    information: ScoreSchema,
    implementation: ScoreSchema,
  })
  .strict();

export const ActorIntentStateSchema = z
  .object({
    activeGoalCodes: z.array(NonEmptyStringSchema),
    aggressiveness: ScoreSchema,
    opportunism: ScoreSchema,
    compromiseWillingness: ScoreSchema,
    strategyTags: z.array(NonEmptyStringSchema),
  })
  .strict();

export const ActorRuntimeStateSchema = z
  .object({
    actorId: ActorIdSchema,
    capabilities: ActorCapabilityStateSchema,
    activeIntent: ActorIntentStateSchema,
    issuePositionIds: z.array(PositionIdSchema),
    memoryIds: z.array(MemoryIdSchema),
    commitmentIds: z.array(CommitmentIdSchema),
    redLineIds: z.array(RedLineIdSchema),
    disputeIds: z.array(DisputeIdSchema),
    fatigue: ScoreSchema,
  })
  .strict()
  .superRefine((actor, ctx) => {
    addDuplicateIssues(actor.issuePositionIds, "issuePositionIds", ctx);
    addDuplicateIssues(actor.memoryIds, "memoryIds", ctx);
    addDuplicateIssues(actor.commitmentIds, "commitmentIds", ctx);
    addDuplicateIssues(actor.redLineIds, "redLineIds", ctx);
    addDuplicateIssues(actor.disputeIds, "disputeIds", ctx);
  });

export const RelationshipStateSchema = z
  .object({
    relationshipId: RelationshipIdSchema,
    source: PartyRefSchema,
    target: PartyRefSchema,
    trust: ScoreSchema,
    strategicAlignment: ScoreSchema,
    sourceDependenceOnTarget: ScoreSchema,
    sourceLeverageOverTarget: SignedScoreSchema,
    access: ScoreSchema,
    credibility: ScoreSchema,
    lastChangedTurn: PositiveIntegerSchema,
  })
  .strict();

export const PositionSubjectRefSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("assessment"), id: AssessmentIdSchema }).strict(),
  z
    .object({ kind: z.literal("mandate_case"), id: MandateCaseIdSchema })
    .strict(),
  z.object({ kind: z.literal("action"), id: ActionIdSchema }).strict(),
  z.object({ kind: z.literal("issue"), id: NonEmptyStringSchema }).strict(),
]);

export const ActorStanceSchema = z.enum([
  "strong_support",
  "support",
  "conditional_support",
  "neutral",
  "resist",
  "strong_resist",
]);

export const PositionStateSchema = z
  .object({
    positionId: PositionIdSchema,
    holder: PartyRefSchema,
    subject: PositionSubjectRefSchema,
    stance: ActorStanceSchema,
    intensity: ScoreSchema,
    conditionCodes: z.array(NonEmptyStringSchema),
    lastChangedTurn: PositiveIntegerSchema,
  })
  .strict();

export const MemoryRelationshipEffectsSchema = z
  .object({
    trust: z.number().finite().optional(),
    strategicAlignment: z.number().finite().optional(),
    credibility: z.number().finite().optional(),
  })
  .strict();

export const MemoryRecordSchema = z
  .object({
    memoryId: MemoryIdSchema,
    owner: PartyRefSchema,
    createdTurn: PositiveIntegerSchema,
    sourceDecisionId: DecisionIdSchema.optional(),
    sourceDomainEventId: NonEmptyStringSchema.optional(),
    memoryType: z.enum([
      "promise",
      "support",
      "exclusion",
      "pressure",
      "concession",
      "betrayal",
      "consultation",
      "sanction",
      "intervention",
      "failure",
      "success",
      "red_line_violation",
    ]),
    salience: ScoreSchema,
    persistenceClass: z.enum(["routine", "significant", "enduring"]),
    tags: z.array(NonEmptyStringSchema),
    originalRelationshipEffects: MemoryRelationshipEffectsSchema,
  })
  .strict();

export const RedLineStateSchema = z
  .object({
    redLineId: RedLineIdSchema,
    holder: PartyRefSchema,
    triggerRule: RuleExpressionSchema,
    severity: z.enum(["soft", "significant", "hard"]),
    consequenceProfileId: EffectProfileIdSchema,
    status: z.enum(["active", "crossed", "waived", "expired"]),
    crossedTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((redLine, ctx) => {
    if (
      (redLine.status === "crossed") !==
      (redLine.crossedTurn !== undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "crossedTurn is required exactly when status is crossed",
        path: ["crossedTurn"],
      });
    }
  });

export type ActorCapabilityState = z.infer<typeof ActorCapabilityStateSchema>;
export type ActorIntentState = z.infer<typeof ActorIntentStateSchema>;
export type ActorRuntimeState = z.infer<typeof ActorRuntimeStateSchema>;
export type RelationshipState = z.infer<typeof RelationshipStateSchema>;
export type PositionSubjectRef = z.infer<typeof PositionSubjectRefSchema>;
export type ActorStance = z.infer<typeof ActorStanceSchema>;
export type PositionState = z.infer<typeof PositionStateSchema>;
export type MemoryRelationshipEffects = z.infer<
  typeof MemoryRelationshipEffectsSchema
>;
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;
export type RedLineState = z.infer<typeof RedLineStateSchema>;
