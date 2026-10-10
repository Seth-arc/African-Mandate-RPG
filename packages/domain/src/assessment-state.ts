import { z } from "zod";

import {
  AssessmentIdSchema,
  EvidenceIdSchema,
  IntelligenceGapIdSchema,
} from "./ids.js";
import { SubjectRefSchema } from "./references.js";
import {
  NonEmptyStringSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";

export const ASSESSMENT_CONTRACT_VERSION = "1.0.0" as const;

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

export const AssessmentLifecycleStatusSchema = z.enum([
  "draft",
  "adopted",
  "revised",
  "withdrawn",
  "superseded",
]);

export const AssessmentAnalysisStatusSchema = z.enum([
  "current",
  "contested",
  "stale",
  "undermined",
]);

export const AssessmentStateSchema = z
  .object({
    assessmentId: AssessmentIdSchema,
    subject: SubjectRefSchema,
    hypothesisCode: NonEmptyStringSchema,
    lifecycleStatus: AssessmentLifecycleStatusSchema,
    analysisStatus: AssessmentAnalysisStatusSchema,
    declaredConfidence: ScoreSchema,
    evidenceSupportScore: ScoreSchema,
    contradictionScore: ScoreSchema,
    supportingEvidenceIds: z.array(EvidenceIdSchema),
    contradictoryEvidenceIds: z.array(EvidenceIdSchema),
    intelligenceGapIds: z.array(IntelligenceGapIdSchema),
    institutionalImplicationCodes: z.array(NonEmptyStringSchema),
    adoptedTurn: PositiveIntegerSchema.optional(),
    revisedFromAssessmentId: AssessmentIdSchema.optional(),
  })
  .strict()
  .superRefine((assessment, ctx) => {
    addDuplicateIssues(
      assessment.supportingEvidenceIds,
      "supportingEvidenceIds",
      ctx,
    );
    addDuplicateIssues(
      assessment.contradictoryEvidenceIds,
      "contradictoryEvidenceIds",
      ctx,
    );
    addDuplicateIssues(
      assessment.intelligenceGapIds,
      "intelligenceGapIds",
      ctx,
    );
    addDuplicateIssues(
      assessment.institutionalImplicationCodes,
      "institutionalImplicationCodes",
      ctx,
    );
    if (
      (assessment.lifecycleStatus === "draft") !==
      (assessment.adoptedTurn === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "adoptedTurn is absent exactly for draft assessments",
        path: ["adoptedTurn"],
      });
    }
    if (
      assessment.lifecycleStatus === "revised" &&
      assessment.revisedFromAssessmentId === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "revised assessments require revisedFromAssessmentId",
        path: ["revisedFromAssessmentId"],
      });
    }
    if (
      ["draft", "adopted"].includes(assessment.lifecycleStatus) &&
      assessment.revisedFromAssessmentId !== undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "draft and initially adopted assessments cannot claim revision lineage",
        path: ["revisedFromAssessmentId"],
      });
    }
    if (assessment.revisedFromAssessmentId === assessment.assessmentId) {
      ctx.addIssue({
        code: "custom",
        message: "An assessment cannot revise itself",
        path: ["revisedFromAssessmentId"],
      });
    }
  });

export type AssessmentLifecycleStatus = z.infer<
  typeof AssessmentLifecycleStatusSchema
>;
export type AssessmentAnalysisStatus = z.infer<
  typeof AssessmentAnalysisStatusSchema
>;
export type AssessmentState = z.infer<typeof AssessmentStateSchema>;
