import { z } from "zod";

import { ASSESSMENT_CONTRACT_VERSION } from "./assessment-state.js";
import { CampaignStateSchema } from "./campaign.js";
import {
  ActionIdSchema,
  AssessmentIdSchema,
  DecisionIdSchema,
  EffectProfileIdSchema,
  EvidenceIdSchema,
  IntelligenceGapIdSchema,
} from "./ids.js";
import { SubjectRefSchema } from "./references.js";
import {
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  ScoreSchema,
} from "./scalars.js";

export const DeclaredConfidenceBandSchema = z.enum(["low", "moderate", "high"]);

const uniqueStrings = (
  values: readonly string[],
  path: string,
  ctx: z.RefinementCtx,
): void => {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    if (seen.has(value)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate value: ${value}`,
        path: [path, index],
      });
    }
    seen.add(value);
  });
};

export const AuthoredAssessmentHypothesisSchema = z
  .object({
    hypothesisCode: NonEmptyStringSchema,
    definitionVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_AUTHORED_HYPOTHESIS"),
    subject: SubjectRefSchema,
    relevantEvidenceIds: z.array(EvidenceIdSchema),
    relevantContradictionKeys: z.array(NonEmptyStringSchema),
    intelligenceGapIds: z.array(IntelligenceGapIdSchema),
    institutionalImplicationCodes: z.array(NonEmptyStringSchema),
  })
  .strict()
  .superRefine((hypothesis, ctx) => {
    uniqueStrings(hypothesis.relevantEvidenceIds, "relevantEvidenceIds", ctx);
    uniqueStrings(
      hypothesis.relevantContradictionKeys,
      "relevantContradictionKeys",
      ctx,
    );
    uniqueStrings(hypothesis.intelligenceGapIds, "intelligenceGapIds", ctx);
    uniqueStrings(
      hypothesis.institutionalImplicationCodes,
      "institutionalImplicationCodes",
      ctx,
    );
  });

export const AssessmentConfidenceBandProfileSchema = z
  .object({
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_ASSESSMENT_CONFIDENCE_PROFILE"),
    values: z
      .object({
        low: ScoreSchema,
        moderate: ScoreSchema,
        high: ScoreSchema,
      })
      .strict(),
  })
  .strict()
  .refine(
    (profile) =>
      profile.values.low < profile.values.moderate &&
      profile.values.moderate < profile.values.high,
    { message: "Confidence band values must increase low < moderate < high" },
  );

const CountScoreEntrySchema = z
  .object({
    count: NonNegativeIntegerSchema,
    score: ScoreSchema,
  })
  .strict();

export const AssessmentMetadataProfileSchema = z
  .object({
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_ASSESSMENT_METADATA_PROFILE"),
    supportScores: z.array(CountScoreEntrySchema).min(1),
    contradictionScores: z.array(CountScoreEntrySchema).min(1),
  })
  .strict()
  .superRefine((profile, ctx) => {
    uniqueStrings(
      profile.supportScores.map((entry) => String(entry.count)),
      "supportScores",
      ctx,
    );
    uniqueStrings(
      profile.contradictionScores.map((entry) => String(entry.count)),
      "contradictionScores",
      ctx,
    );
  });

export const AssessmentSelectionSchema = z
  .object({
    hypothesisCode: NonEmptyStringSchema,
    declaredConfidenceBand: DeclaredConfidenceBandSchema,
    supportingEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict()
  .superRefine((selection, ctx) => {
    uniqueStrings(
      selection.supportingEvidenceIds,
      "supportingEvidenceIds",
      ctx,
    );
  });

export const AssessmentCommandTermSchema = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("adopt"),
      selection: AssessmentSelectionSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("revise"),
      previousAssessmentId: AssessmentIdSchema,
      selection: AssessmentSelectionSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("withdraw"),
      assessmentId: AssessmentIdSchema,
    })
    .strict(),
]);

export const AssessmentActionBindingSchema = z
  .object({
    actionId: ActionIdSchema,
    effectProfileId: EffectProfileIdSchema,
    operation: z.enum(["adopt", "revise", "withdraw"]),
  })
  .strict();

export const AssessmentWorkspaceRequestSchema = z
  .object({
    contractVersion: z.literal(ASSESSMENT_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_ASSESSMENT_WORKSPACE"),
    currentState: CampaignStateSchema,
    hypotheses: z.array(AuthoredAssessmentHypothesisSchema).min(1),
    confidenceProfile: AssessmentConfidenceBandProfileSchema,
    metadataProfile: AssessmentMetadataProfileSchema,
    selection: AssessmentSelectionSchema,
  })
  .strict();

export const AssessmentWorkspaceStateSchema = z
  .object({
    hypothesisCode: NonEmptyStringSchema,
    subject: SubjectRefSchema,
    declaredConfidenceBand: DeclaredConfidenceBandSchema,
    declaredConfidence: ScoreSchema,
    evidenceSupportScore: ScoreSchema,
    contradictionScore: ScoreSchema,
    analysisStatus: z.enum(["current", "contested"]),
    supportingEvidenceIds: z.array(EvidenceIdSchema),
    contradictoryEvidenceIds: z.array(EvidenceIdSchema),
    intelligenceGapIds: z.array(IntelligenceGapIdSchema),
    institutionalImplicationCodes: z.array(NonEmptyStringSchema),
  })
  .strict();

export const AssessmentRejectionReasonSchema = z.enum([
  "INVALID_REQUEST_SCHEMA",
  "DUPLICATE_HYPOTHESIS_CODE",
  "HYPOTHESIS_NOT_FOUND",
  "SUPPORTING_EVIDENCE_NOT_FOUND",
  "SUPPORTING_EVIDENCE_NOT_RELEVANT",
  "INTELLIGENCE_GAP_NOT_FOUND",
  "METADATA_FACTOR_NOT_DEFINED",
  "SOURCE_DECISION_NOT_FOUND",
  "DUPLICATE_ACTION_BINDING",
  "ACTION_BINDING_NOT_FOUND",
  "COMMAND_OPERATION_MISMATCH",
  "ASSESSMENT_NOT_FOUND",
  "ASSESSMENT_NOT_ACTIVE",
  "REVISION_SUBJECT_MISMATCH",
  "ASSESSMENT_ALREADY_EXISTS",
  "INVALID_RESULT",
]);

export const AssessmentWorkspaceResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("ready"),
      workspace: AssessmentWorkspaceStateSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: AssessmentRejectionReasonSchema,
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const AssessmentCommandResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(ASSESSMENT_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_ASSESSMENT_COMMAND"),
    currentState: CampaignStateSchema,
    sourceDecisionId: DecisionIdSchema,
    actionId: ActionIdSchema,
    actionBindings: z.array(AssessmentActionBindingSchema).min(1),
    hypotheses: z.array(AuthoredAssessmentHypothesisSchema).min(1),
    confidenceProfile: AssessmentConfidenceBandProfileSchema,
    metadataProfile: AssessmentMetadataProfileSchema,
    term: AssessmentCommandTermSchema,
  })
  .strict();

export const AssessmentCommandTraceSchema = z
  .object({
    operation: z.enum(["adopt", "revise", "withdraw"]),
    assessmentId: AssessmentIdSchema,
    previousAssessmentId: AssessmentIdSchema.optional(),
    declaredConfidenceBand: DeclaredConfidenceBandSchema.optional(),
    automaticallyDisplayedContradictoryEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict();

export const AssessmentCommandResolutionResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("resolved"),
        nextState: CampaignStateSchema,
        trace: AssessmentCommandTraceSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("rejected"),
        reasonCode: AssessmentRejectionReasonSchema,
        detailCode: NonEmptyStringSchema.optional(),
      })
      .strict(),
  ],
);

export const AssessmentMetadataRecalculationRequestSchema = z
  .object({
    contractVersion: z.literal(ASSESSMENT_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_ASSESSMENT_METADATA_RECALCULATION"),
    currentState: CampaignStateSchema,
    hypotheses: z.array(AuthoredAssessmentHypothesisSchema).min(1),
    metadataProfile: AssessmentMetadataProfileSchema,
  })
  .strict();

export const AssessmentMetadataRecalculationResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("resolved"),
        nextState: CampaignStateSchema,
        recalculatedAssessmentIds: z.array(AssessmentIdSchema),
      })
      .strict(),
    z
      .object({
        status: z.literal("rejected"),
        reasonCode: AssessmentRejectionReasonSchema,
        detailCode: NonEmptyStringSchema.optional(),
      })
      .strict(),
  ],
);

export type DeclaredConfidenceBand = z.infer<
  typeof DeclaredConfidenceBandSchema
>;
export type AuthoredAssessmentHypothesis = z.infer<
  typeof AuthoredAssessmentHypothesisSchema
>;
export type AssessmentConfidenceBandProfile = z.infer<
  typeof AssessmentConfidenceBandProfileSchema
>;
export type AssessmentMetadataProfile = z.infer<
  typeof AssessmentMetadataProfileSchema
>;
export type AssessmentSelection = z.infer<typeof AssessmentSelectionSchema>;
export type AssessmentCommandTerm = z.infer<typeof AssessmentCommandTermSchema>;
export type AssessmentActionBinding = z.infer<
  typeof AssessmentActionBindingSchema
>;
export type AssessmentWorkspaceState = z.infer<
  typeof AssessmentWorkspaceStateSchema
>;
export type AssessmentWorkspaceResult = z.infer<
  typeof AssessmentWorkspaceResultSchema
>;
export type AssessmentCommandResolutionResult = z.infer<
  typeof AssessmentCommandResolutionResultSchema
>;
export type AssessmentMetadataRecalculationResult = z.infer<
  typeof AssessmentMetadataRecalculationResultSchema
>;
