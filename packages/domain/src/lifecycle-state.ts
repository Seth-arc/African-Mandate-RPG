import { z } from "zod";

import {
  AttentionItemIdSchema,
  BriefingIdSchema,
  ConsequenceIdSchema,
  DecisionIdSchema,
  EffectProfileIdSchema,
  MandateCaseIdSchema,
  SituationIdSchema,
  WorldEventIdSchema,
} from "./ids.js";
import { SubjectRefSchema } from "./references.js";
import {
  NonEmptyStringSchema,
  PositiveIntegerSchema,
  ProbabilitySchema,
} from "./scalars.js";
import { RuleExpressionSchema } from "./rules.js";

export const AttentionLevelSchema = z.enum([
  "routine",
  "developing",
  "priority",
  "critical",
  "decision_required",
]);

export const AttentionItemSchema = z
  .object({
    attentionItemId: AttentionItemIdSchema,
    level: AttentionLevelSchema,
    createdTurn: PositiveIntegerSchema,
    subjectRefs: z.array(SubjectRefSchema),
    reasonCode: NonEmptyStringSchema,
    briefingId: BriefingIdSchema.optional(),
    blocking: z.boolean(),
    resolved: z.boolean(),
    resolvedTurn: PositiveIntegerSchema.optional(),
  })
  .strict();

export const AttentionStateSchema = z
  .object({
    items: z.record(AttentionItemIdSchema, AttentionItemSchema),
  })
  .strict()
  .superRefine((state, ctx) => {
    for (const [key, item] of Object.entries(state.items)) {
      if (item.attentionItemId !== key) {
        ctx.addIssue({
          code: "custom",
          message: "attention item key must match attentionItemId",
          path: ["items", key, "attentionItemId"],
        });
      }
    }
  });

export const SituationStateSchema = z
  .object({
    situationId: SituationIdSchema,
    situationType: z.enum(["crisis", "opportunity", "strategic_issue"]),
    subjectRefs: z.array(SubjectRefSchema),
    relatedWorldEventIds: z.array(WorldEventIdSchema),
    openedTurn: PositiveIntegerSchema,
    urgency: AttentionLevelSchema,
    status: z.enum(["open", "developing", "managed", "resolved", "expired"]),
    blocking: z.boolean(),
  })
  .strict();

export const ScheduledConsequenceSchema = z
  .object({
    consequenceId: ConsequenceIdSchema,
    sourceDecisionId: DecisionIdSchema.optional(),
    sourceWorldEventId: WorldEventIdSchema.optional(),
    sourceMandateCaseId: MandateCaseIdSchema.optional(),
    earliestTurn: PositiveIntegerSchema,
    latestTurn: PositiveIntegerSchema.optional(),
    eligibilityRule: RuleExpressionSchema,
    probability: ProbabilitySchema.optional(),
    effectProfileId: EffectProfileIdSchema,
    callbackTags: z.array(NonEmptyStringSchema),
    status: z.enum([
      "scheduled",
      "eligible",
      "resolved",
      "expired",
      "cancelled",
    ]),
    resolvedTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((consequence, ctx) => {
    if (
      consequence.latestTurn !== undefined &&
      consequence.earliestTurn > consequence.latestTurn
    ) {
      ctx.addIssue({
        code: "custom",
        message: "earliestTurn must not exceed latestTurn",
        path: ["latestTurn"],
      });
    }
    if (
      consequence.sourceDecisionId === undefined &&
      consequence.sourceWorldEventId === undefined &&
      consequence.sourceMandateCaseId === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "scheduled consequence requires a traceable source",
        path: ["sourceDecisionId"],
      });
    }
  });

export type AttentionLevel = z.infer<typeof AttentionLevelSchema>;
export type AttentionItem = z.infer<typeof AttentionItemSchema>;
export type AttentionState = z.infer<typeof AttentionStateSchema>;
export type SituationState = z.infer<typeof SituationStateSchema>;
export type ScheduledConsequence = z.infer<typeof ScheduledConsequenceSchema>;
