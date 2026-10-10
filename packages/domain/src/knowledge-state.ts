import { z } from "zod";

import {
  AssessmentIdSchema,
  CollectionTaskIdSchema,
  CommitmentIdSchema,
  DecisionIdSchema,
  DisputeIdSchema,
  EvidenceIdSchema,
  IntelligenceGapIdSchema,
  PositionIdSchema,
  RedLineIdSchema,
  RelationshipIdSchema,
  ReportIdSchema,
} from "./ids.js";
import { PartyRefSchema, SubjectRefSchema } from "./references.js";
import {
  IsoDateSchema,
  NonEmptyStringSchema,
  PositiveIntegerSchema,
  ScoreSchema,
  SignedScoreSchema,
} from "./scalars.js";

export const KNOWLEDGE_CONTRACT_VERSION = "1.0.0" as const;

export const EvidenceClaimSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("scalar"),
      metric: NonEmptyStringSchema,
      value: z.number().finite(),
      unit: NonEmptyStringSchema.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("range"),
      metric: NonEmptyStringSchema,
      min: z.number().finite(),
      max: z.number().finite(),
      unit: NonEmptyStringSchema.optional(),
    })
    .strict()
    .refine((claim) => claim.min <= claim.max, {
      message: "range min must not exceed max",
      path: ["min"],
    }),
  z
    .object({
      kind: z.literal("category"),
      category: NonEmptyStringSchema,
      value: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("boolean"),
      proposition: NonEmptyStringSchema,
      value: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("entity_relation"),
      relation: NonEmptyStringSchema,
      target: SubjectRefSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("text_claim"),
      claimCode: NonEmptyStringSchema,
    })
    .strict(),
]);

export const ObservationCandidateSchema = z
  .object({
    observationId: NonEmptyStringSchema,
    subject: SubjectRefSchema,
    claim: EvidenceClaimSchema,
    sourceChannel: NonEmptyStringSchema,
    baseReliability: ScoreSchema,
    discoverability: ScoreSchema,
    earliestTurn: PositiveIntegerSchema,
  })
  .strict();

export const EvidenceRecordSchema = z
  .object({
    evidenceId: EvidenceIdSchema,
    subject: SubjectRefSchema,
    claim: EvidenceClaimSchema,
    sourceType: z.enum([
      "observed_baseline",
      "simulation_observation",
      "institutional_report",
      "actor_claim",
      "open_source",
      "partner_intelligence",
      "field_reporting",
    ]),
    sourceParty: PartyRefSchema.optional(),
    initialConfidence: ScoreSchema,
    sourceReliability: ScoreSchema,
    observedTurn: PositiveIntegerSchema,
    observedDate: IsoDateSchema.optional(),
    decayProfileId: NonEmptyStringSchema,
    contradictionKey: NonEmptyStringSchema.optional(),
    provenanceRef: NonEmptyStringSchema.optional(),
    reportSensitivity: z.enum(["open", "restricted", "sensitive"]),
  })
  .strict();

export const IntelligenceReportSchema = z
  .object({
    reportId: ReportIdSchema,
    createdTurn: PositiveIntegerSchema,
    evidenceIds: z.array(EvidenceIdSchema),
    sourceParty: PartyRefSchema.optional(),
    headlineKey: NonEmptyStringSchema,
    bodyTemplateKey: NonEmptyStringSchema.optional(),
    urgency: z.enum(["routine", "developing", "priority", "critical"]),
    sensitivity: z.enum(["open", "restricted", "sensitive"]),
    relatedAssessmentIds: z.array(AssessmentIdSchema),
  })
  .strict();

export const IntelligenceGapSchema = z
  .object({
    intelligenceGapId: IntelligenceGapIdSchema,
    subject: SubjectRefSchema,
    questionCode: NonEmptyStringSchema,
    strategicImportance: ScoreSchema,
    status: z.enum(["open", "tasked", "partially_resolved", "resolved"]),
    createdTurn: PositiveIntegerSchema,
    resolvedTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((gap, ctx) => {
    if ((gap.status === "resolved") !== (gap.resolvedTurn !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "resolvedTurn is required exactly when the gap is resolved",
        path: ["resolvedTurn"],
      });
    }
    if (gap.resolvedTurn !== undefined && gap.resolvedTurn < gap.createdTurn) {
      ctx.addIssue({
        code: "custom",
        message: "resolvedTurn must not precede createdTurn",
        path: ["resolvedTurn"],
      });
    }
  });

export const CollectionTaskSchema = z
  .object({
    collectionTaskId: CollectionTaskIdSchema,
    gapId: IntelligenceGapIdSchema.optional(),
    subject: SubjectRefSchema,
    questionCode: NonEmptyStringSchema,
    collectionChannel: z.enum([
      "au_field",
      "partner",
      "open_source",
      "host_government",
      "diplomatic",
      "technical",
    ]),
    requestedTurn: PositiveIntegerSchema,
    dueTurn: PositiveIntegerSchema,
    expectedQuality: ScoreSchema,
    status: z.enum(["tasked", "collecting", "completed", "failed"]),
    sourceDecisionId: DecisionIdSchema,
  })
  .strict()
  .refine((task) => task.dueTurn > task.requestedTurn, {
    message: "dueTurn must be later than requestedTurn",
    path: ["dueTurn"],
  });

export const PositionKnowledgeStateSchema = z
  .object({
    status: z.enum(["estimated", "known"]),
    estimatedStance: z
      .enum([
        "strong_support",
        "support",
        "conditional_support",
        "neutral",
        "resist",
        "strong_resist",
      ])
      .optional(),
    confidence: ScoreSchema,
    supportingEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict();

export const RelationshipKnowledgeStateSchema = z
  .object({
    trustEstimate: ScoreSchema.optional(),
    alignmentEstimate: ScoreSchema.optional(),
    leverageEstimate: SignedScoreSchema.optional(),
    dependenceEstimate: ScoreSchema.optional(),
    confidence: ScoreSchema,
    supportingEvidenceIds: z.array(EvidenceIdSchema),
  })
  .strict();

const keyMustMatch = (
  values: Record<string, Record<string, unknown>>,
  idField: string,
  path: string,
  ctx: z.RefinementCtx,
): void => {
  for (const [key, value] of Object.entries(values)) {
    if (value[idField] !== key) {
      ctx.addIssue({
        code: "custom",
        message: `${path} key must match ${idField}`,
        path: [path, key, idField],
      });
    }
  }
};

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

export const PlayerKnowledgeStateSchema = z
  .object({
    evidence: z.record(EvidenceIdSchema, EvidenceRecordSchema),
    reports: z.record(ReportIdSchema, IntelligenceReportSchema),
    intelligenceGaps: z.record(IntelligenceGapIdSchema, IntelligenceGapSchema),
    collectionTasks: z.record(CollectionTaskIdSchema, CollectionTaskSchema),
    redLineKnowledge: z.record(RedLineIdSchema, z.enum(["suspected", "known"])),
    positionKnowledge: z.record(PositionIdSchema, PositionKnowledgeStateSchema),
    knownCommitmentIds: z.array(CommitmentIdSchema),
    knownDisputeIds: z.array(DisputeIdSchema),
    relationshipKnowledge: z.record(
      RelationshipIdSchema,
      RelationshipKnowledgeStateSchema,
    ),
  })
  .strict()
  .superRefine((knowledge, ctx) => {
    keyMustMatch(knowledge.evidence, "evidenceId", "evidence", ctx);
    keyMustMatch(knowledge.reports, "reportId", "reports", ctx);
    keyMustMatch(
      knowledge.intelligenceGaps,
      "intelligenceGapId",
      "intelligenceGaps",
      ctx,
    );
    keyMustMatch(
      knowledge.collectionTasks,
      "collectionTaskId",
      "collectionTasks",
      ctx,
    );
    addDuplicateIssues(knowledge.knownCommitmentIds, "knownCommitmentIds", ctx);
    addDuplicateIssues(knowledge.knownDisputeIds, "knownDisputeIds", ctx);

    for (const [reportId, report] of Object.entries(knowledge.reports)) {
      report.evidenceIds.forEach((evidenceId, index) => {
        if (knowledge.evidence[evidenceId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: `Report references unknown evidence: ${evidenceId}`,
            path: ["reports", reportId, "evidenceIds", index],
          });
        }
      });
    }
    for (const [taskId, task] of Object.entries(knowledge.collectionTasks)) {
      if (
        task.gapId !== undefined &&
        knowledge.intelligenceGaps[task.gapId] === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Collection task references unknown gap: ${task.gapId}`,
          path: ["collectionTasks", taskId, "gapId"],
        });
      }
    }
    for (const [positionId, position] of Object.entries(
      knowledge.positionKnowledge,
    )) {
      position.supportingEvidenceIds.forEach((evidenceId, index) => {
        if (knowledge.evidence[evidenceId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: `Position knowledge references unknown evidence: ${evidenceId}`,
            path: [
              "positionKnowledge",
              positionId,
              "supportingEvidenceIds",
              index,
            ],
          });
        }
      });
    }
    for (const [relationshipId, relationship] of Object.entries(
      knowledge.relationshipKnowledge,
    )) {
      relationship.supportingEvidenceIds.forEach((evidenceId, index) => {
        if (knowledge.evidence[evidenceId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: `Relationship knowledge references unknown evidence: ${evidenceId}`,
            path: [
              "relationshipKnowledge",
              relationshipId,
              "supportingEvidenceIds",
              index,
            ],
          });
        }
      });
    }
  });

export type EvidenceClaim = z.infer<typeof EvidenceClaimSchema>;
export type ObservationCandidate = z.infer<typeof ObservationCandidateSchema>;
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;
export type IntelligenceReport = z.infer<typeof IntelligenceReportSchema>;
export type IntelligenceGap = z.infer<typeof IntelligenceGapSchema>;
export type CollectionTask = z.infer<typeof CollectionTaskSchema>;
export type PlayerKnowledgeState = z.infer<typeof PlayerKnowledgeStateSchema>;
