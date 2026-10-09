import { z } from "zod";

import {
  ActionIdSchema,
  CampaignIdSchema,
  DecisionIdSchema,
  EvidenceIdSchema,
  IntelligenceGapIdSchema,
} from "./ids.js";
import { JsonObjectSchema } from "./json.js";
import {
  PartyRefSchema,
  SubjectKindSchema,
  SubjectRefSchema,
} from "./references.js";
import {
  MoneyAmountSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import { RuleResultSchema } from "./rules.js";

export const COMMAND_RULE_CONTRACT_VERSION = "1.0.0" as const;

export const CommandIdSchema = z.string().min(1).brand<"CommandId">();

export const ActionTargetSchemaSchema = z
  .object({
    allowedKinds: z.array(SubjectKindSchema),
    minTargets: NonNegativeIntegerSchema,
    maxTargets: NonNegativeIntegerSchema,
    mustBeWithinMandateScope: z.boolean().optional(),
    uniqueTargets: z.boolean().optional(),
  })
  .strict()
  .superRefine((schema, ctx) => {
    if (schema.minTargets > schema.maxTargets) {
      ctx.addIssue({
        code: "custom",
        message: "minTargets must not exceed maxTargets",
        path: ["minTargets"],
      });
    }
    if (new Set(schema.allowedKinds).size !== schema.allowedKinds.length) {
      ctx.addIssue({
        code: "custom",
        message: "allowedKinds must not contain duplicates",
        path: ["allowedKinds"],
      });
    }
  });

export const PreviewCostSchema = z
  .object({
    costType: z.enum([
      "budget",
      "personnel",
      "political_capital",
      "secretariat_capacity",
      "implementation_capacity",
    ]),
    amount: z.number().finite().nonnegative().optional(),
    money: MoneyAmountSchema.extend({
      amount: z.number().finite().nonnegative(),
    }).optional(),
    certainty: z.enum(["known", "estimated"]),
  })
  .strict()
  .superRefine((cost, ctx) => {
    if (cost.costType === "budget") {
      if (cost.money === undefined || cost.amount !== undefined) {
        ctx.addIssue({
          code: "custom",
          message: "budget cost requires money and forbids amount",
        });
      }
      return;
    }
    if (cost.amount === undefined || cost.money !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: `${cost.costType} cost requires amount and forbids money`,
      });
    }
  });

export const KnownCostProfileSchema = z
  .object({
    knownCostProfileId: NonEmptyStringSchema,
    costs: z.array(PreviewCostSchema),
  })
  .strict();

export const ForecastReactionSchema = z
  .object({
    party: PartyRefSchema,
    expectedDirection: z.enum(["positive", "neutral", "negative", "uncertain"]),
    confidence: ScoreSchema,
    basisEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict();

export const ForecastRiskSchema = z
  .object({
    riskCode: NonEmptyStringSchema,
    likelihoodBand: z.enum(["low", "moderate", "high", "unknown"]),
    impactBand: z.enum(["low", "moderate", "high", "critical"]),
    confidence: ScoreSchema,
    basisEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict();

export const DecisionPreviewSchema = z
  .object({
    actionId: ActionIdSchema,
    knownCosts: z.array(PreviewCostSchema),
    likelyInstitutionalReactions: z.array(ForecastReactionSchema),
    knownRisks: z.array(ForecastRiskSchema),
    intelligenceGaps: z.array(IntelligenceGapIdSchema),
    requiredAuthorization: NonEmptyStringSchema.optional(),
    implementationDependencies: z.array(NonEmptyStringSchema),
    confidence: ScoreSchema,
  })
  .strict();

export const KnowledgeForecastSchema = DecisionPreviewSchema.omit({
  actionId: true,
  knownCosts: true,
});

export const StrategicActionPayloadSchema = z
  .object({
    actionId: ActionIdSchema,
    targets: z.array(SubjectRefSchema),
    terms: z.array(JsonObjectSchema),
  })
  .strict();

export const StrategicActionCommandSchema = z
  .object({
    commandId: CommandIdSchema,
    commandType: NonEmptyStringSchema,
    campaignId: CampaignIdSchema,
    submittedTurn: PositiveIntegerSchema,
    payload: StrategicActionPayloadSchema,
  })
  .strict();

export const ActionMenuEntrySchema = z
  .object({
    actionId: ActionIdSchema,
    commandType: NonEmptyStringSchema,
    decisionSlotCost: z.union([z.literal(0), z.literal(1)]),
    eligibility: z
      .object({
        ruleResult: RuleResultSchema,
        available: z.boolean(),
        reasonCode: z.enum([
          "ELIGIBLE",
          "KNOWN_REQUIREMENT_FAILED",
          "INSUFFICIENT_KNOWN_INFORMATION",
        ]),
      })
      .strict(),
    preview: DecisionPreviewSchema,
  })
  .strict();

export const CommandPreparationResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("prepared"),
      commandId: CommandIdSchema,
      actionId: ActionIdSchema,
      decisionSlotCost: z.union([z.literal(0), z.literal(1)]),
    })
    .strict(),
  z
    .object({
      status: z.literal("duplicate"),
      commandId: CommandIdSchema,
      decisionSlotCost: z.literal(0),
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      commandId: CommandIdSchema.optional(),
      decisionSlotCost: z.literal(0),
      reasonCode: z.enum([
        "INVALID_COMMAND_SCHEMA",
        "CAMPAIGN_NOT_ACTIVE",
        "CAMPAIGN_MISMATCH",
        "TURN_MISMATCH",
        "UNKNOWN_ACTION",
        "COMMAND_TYPE_MISMATCH",
        "INVALID_TARGETS",
        "STRUCTURALLY_IMPOSSIBLE_TERM",
        "KNOWN_REQUIREMENT_FAILED",
        "INSUFFICIENT_KNOWN_INFORMATION",
        "INSUFFICIENT_DECISION_SLOTS",
        "KNOWN_COST_UNAFFORDABLE",
        "CONFIGURATION_ERROR",
      ]),
      ruleResult: RuleResultSchema.optional(),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const PostCommitHiddenResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(COMMAND_RULE_CONTRACT_VERSION),
    phase: z.literal("postcommit"),
    commandId: CommandIdSchema,
    decisionId: DecisionIdSchema,
    actionId: ActionIdSchema,
    targets: z.array(SubjectRefSchema),
    resolutionKey: NonEmptyStringSchema,
  })
  .strict();

export const PostCommitHiddenResolutionResultSchema = z
  .object({
    contractVersion: z.literal(COMMAND_RULE_CONTRACT_VERSION),
    commandId: CommandIdSchema,
    decisionId: DecisionIdSchema,
    resolutionCode: NonEmptyStringSchema,
    payload: JsonObjectSchema,
  })
  .strict();

export type CommandId = z.infer<typeof CommandIdSchema>;
export type ActionTargetSchema = z.infer<typeof ActionTargetSchemaSchema>;
export type PreviewCost = z.infer<typeof PreviewCostSchema>;
export type KnownCostProfile = z.infer<typeof KnownCostProfileSchema>;
export type DecisionPreview = z.infer<typeof DecisionPreviewSchema>;
export type KnowledgeForecast = z.infer<typeof KnowledgeForecastSchema>;
export type StrategicActionPayload = z.infer<
  typeof StrategicActionPayloadSchema
>;
export type StrategicActionCommand = z.infer<
  typeof StrategicActionCommandSchema
>;
export type ActionMenuEntry = z.infer<typeof ActionMenuEntrySchema>;
export type CommandPreparationResult = z.infer<
  typeof CommandPreparationResultSchema
>;
export type PostCommitHiddenResolutionRequest = z.infer<
  typeof PostCommitHiddenResolutionRequestSchema
>;
export type PostCommitHiddenResolutionResult = z.infer<
  typeof PostCommitHiddenResolutionResultSchema
>;
