import { z } from "zod";

import { DecisionIdSchema } from "./ids.js";
import {
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import { DoctrineModifierSchema, DoctrineVectorSchema } from "./scenario.js";

export const EVALUATION_DIMENSIONS = [
  "security",
  "civilianOutcomes",
  "regionalStability",
  "institutionalCohesion",
  "legitimacy",
  "mandateSustainability",
] as const;

export const DoctrineStateSchema = z
  .object({
    observed: DoctrineVectorSchema,
    codified: z.boolean(),
    codifiedProfileId: NonEmptyStringSchema.optional(),
    codifiedTurn: PositiveIntegerSchema.optional(),
    modifiers: z.array(DoctrineModifierSchema),
  })
  .strict()
  .superRefine((state, ctx) => {
    const hasCodificationFields =
      state.codifiedProfileId !== undefined && state.codifiedTurn !== undefined;
    if (state.codified !== hasCodificationFields) {
      ctx.addIssue({
        code: "custom",
        message:
          "codified doctrine requires both profile and turn; observational doctrine requires neither",
        path: ["codified"],
      });
    }
  });

export const EvaluationSnapshotSchema = z
  .object({
    turn: PositiveIntegerSchema,
    security: ScoreSchema,
    civilianOutcomes: ScoreSchema,
    regionalStability: ScoreSchema,
    institutionalCohesion: ScoreSchema,
    legitimacy: ScoreSchema,
    mandateSustainability: ScoreSchema,
  })
  .strict();

export const EvaluationDimensionResultSchema = z
  .object({
    score: ScoreSchema,
    startingScore: ScoreSchema,
    endingScore: ScoreSchema,
    trend: z.enum(["improving", "stable", "deteriorating"]),
    criticalTurns: NonNegativeIntegerSchema,
    summaryCode: NonEmptyStringSchema,
  })
  .strict();

export const EvaluationCausalChainSchema = z
  .object({
    sourceDecisionIds: z.array(DecisionIdSchema),
    intermediateDomainEventIds: z.array(NonEmptyStringSchema),
    outcomeSummaryCode: NonEmptyStringSchema,
    dimensionsAffected: z.array(z.enum(EVALUATION_DIMENSIONS)),
  })
  .strict();

export const FinalEvaluationSchema = z
  .object({
    security: EvaluationDimensionResultSchema,
    civilianOutcomes: EvaluationDimensionResultSchema,
    regionalStability: EvaluationDimensionResultSchema,
    institutionalCohesion: EvaluationDimensionResultSchema,
    legitimacy: EvaluationDimensionResultSchema,
    mandateSustainability: EvaluationDimensionResultSchema,
    causalChains: z.array(EvaluationCausalChainSchema),
  })
  .strict();

export const UnscoredEvaluationDimensionSchema = z
  .object({
    status: z.literal("unscored"),
    reasonCode: z.literal("APPROVED_COEFFICIENTS_UNAVAILABLE"),
  })
  .strict();

export const EvaluationStateSchema = z
  .object({
    status: z.literal("unavailable"),
    reasonCode: z.literal("APPROVED_COEFFICIENTS_UNAVAILABLE"),
    dimensions: z
      .object({
        security: UnscoredEvaluationDimensionSchema,
        civilianOutcomes: UnscoredEvaluationDimensionSchema,
        regionalStability: UnscoredEvaluationDimensionSchema,
        institutionalCohesion: UnscoredEvaluationDimensionSchema,
        legitimacy: UnscoredEvaluationDimensionSchema,
        mandateSustainability: UnscoredEvaluationDimensionSchema,
      })
      .strict(),
    snapshots: z.array(z.never()).length(0),
  })
  .strict();

export const createInitialDoctrineState = (): DoctrineState =>
  DoctrineStateSchema.parse({
    observed: {
      prevention: 0,
      centralization: 0,
      policyOrientation: 0,
      diplomaticStyle: 0,
    },
    codified: false,
    modifiers: [],
  });

export const createUnavailableEvaluationState = (): EvaluationState => {
  const unscored = {
    status: "unscored" as const,
    reasonCode: "APPROVED_COEFFICIENTS_UNAVAILABLE" as const,
  };
  return EvaluationStateSchema.parse({
    status: "unavailable",
    reasonCode: "APPROVED_COEFFICIENTS_UNAVAILABLE",
    dimensions: {
      security: unscored,
      civilianOutcomes: unscored,
      regionalStability: unscored,
      institutionalCohesion: unscored,
      legitimacy: unscored,
      mandateSustainability: unscored,
    },
    snapshots: [],
  });
};

export type DoctrineState = z.infer<typeof DoctrineStateSchema>;
export type EvaluationSnapshot = z.infer<typeof EvaluationSnapshotSchema>;
export type EvaluationDimensionResult = z.infer<
  typeof EvaluationDimensionResultSchema
>;
export type EvaluationCausalChain = z.infer<typeof EvaluationCausalChainSchema>;
export type FinalEvaluation = z.infer<typeof FinalEvaluationSchema>;
export type UnscoredEvaluationDimension = z.infer<
  typeof UnscoredEvaluationDimensionSchema
>;
export type EvaluationState = z.infer<typeof EvaluationStateSchema>;
