import { z } from "zod";

import { ActorStanceSchema, MemoryRecordSchema } from "./actor-state.js";
import { CampaignStateSchema } from "./campaign.js";
import {
  ActionIdSchema,
  CommitmentIdSchema,
  DecisionIdSchema,
  EffectProfileIdSchema,
  EvidenceIdSchema,
  MemoryIdSchema,
  PositionIdSchema,
} from "./ids.js";
import { PartyRefSchema } from "./references.js";
import { RuleExpressionSchema } from "./rules.js";
import {
  NonEmptyStringSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";

export const CONSULTATION_CONTRACT_VERSION = "1.0.0" as const;

export const ConsultationResponseStateSchema = z.enum([
  "accepted",
  "conditional",
  "rejected",
]);

export const CommitmentOfferSchema = z
  .object({
    commitmentType: NonEmptyStringSchema,
    descriptionKey: NonEmptyStringSchema,
    dueTurn: PositiveIntegerSchema.optional(),
    fulfillmentRules: z.array(RuleExpressionSchema),
  })
  .strict();

const ConsultationPackageBaseShape = {
  packageSchemaVersion: z.literal(1),
  classification: z.literal("TEST_ONLY_CONSULTATION_PACKAGE"),
  legalProfileId: NonEmptyStringSchema,
  responsePositionId: PositionIdSchema,
  commitmentOffer: CommitmentOfferSchema.optional(),
};

export const MonitoringAccessConsultationPackageSchema = z
  .object({
    ...ConsultationPackageBaseShape,
    negotiationId: z.literal("N1_MONITORING_ACCESS"),
    terms: z
      .object({
        technicalLiaisonRole: z.enum(["limited", "joint", "none"]),
        reportingPath: z.enum(["independent", "joint_review", "host_only"]),
        resourceCommitment: z.enum(["none", "bounded_test_allocation"]),
      })
      .strict(),
  })
  .strict();

export const RegionalRepresentationConsultationPackageSchema = z
  .object({
    ...ConsultationPackageBaseShape,
    negotiationId: z.literal("N2_REGIONAL_REPRESENTATION"),
    terms: z
      .object({
        regionalChannel: z.enum([
          "au_commission",
          "aes_liaison",
          "ecowas_technical",
        ]),
        proposedPromise: z.enum([
          "none",
          "reporting_access",
          "sector_coordination",
          "scope_review",
        ]),
      })
      .strict(),
  })
  .strict();

export const CivilianAccessConsultationPackageSchema = z
  .object({
    ...ConsultationPackageBaseShape,
    negotiationId: z.literal("N3_CIVILIAN_ACCESS"),
    terms: z
      .object({
        priority: z.enum([
          "independent_access_verification",
          "near_term_liaison_expansion",
        ]),
        implementationBandwidthTradeoffAcknowledged: z.literal(true),
      })
      .strict(),
  })
  .strict();

export const ConsultationPackageSchema = z.discriminatedUnion("negotiationId", [
  MonitoringAccessConsultationPackageSchema,
  RegionalRepresentationConsultationPackageSchema,
  CivilianAccessConsultationPackageSchema,
]);

export const TestOnlyConsultationLegalProfileSchema = z
  .object({
    legalProfileId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_CONSULTATION_LEGAL_PROFILE"),
    allowedNegotiationIds: z
      .array(
        z.enum([
          "N1_MONITORING_ACCESS",
          "N2_REGIONAL_REPRESENTATION",
          "N3_CIVILIAN_ACCESS",
        ]),
      )
      .min(1),
    boundedAllocationRequiresAvailableImplementationCapacity: z.boolean(),
    forbiddenN1Combinations: z.array(
      z
        .object({
          technicalLiaisonRole:
            MonitoringAccessConsultationPackageSchema.shape.terms.shape
              .technicalLiaisonRole,
          reportingPath:
            MonitoringAccessConsultationPackageSchema.shape.terms.shape
              .reportingPath,
          resourceCommitment:
            MonitoringAccessConsultationPackageSchema.shape.terms.shape
              .resourceCommitment,
          detailCode: NonEmptyStringSchema,
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((profile, ctx) => {
    if (
      new Set(profile.allowedNegotiationIds).size !==
      profile.allowedNegotiationIds.length
    ) {
      ctx.addIssue({
        code: "custom",
        message: "allowedNegotiationIds must not contain duplicates",
        path: ["allowedNegotiationIds"],
      });
    }
  });

export const TestOnlyConsultationResponseProfileSchema = z
  .object({
    responseProfileId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_CONSULTATION_RESPONSE_PROFILE"),
    statusByStance: z
      .object({
        strong_support: ConsultationResponseStateSchema,
        support: ConsultationResponseStateSchema,
        conditional_support: ConsultationResponseStateSchema,
        neutral: ConsultationResponseStateSchema,
        resist: ConsultationResponseStateSchema,
        strong_resist: ConsultationResponseStateSchema,
      })
      .strict(),
    evidence: z
      .object({
        initialConfidence: ScoreSchema,
        sourceReliability: ScoreSchema,
        decayProfileId: NonEmptyStringSchema,
        reportSensitivity: z.enum(["open", "restricted", "sensitive"]),
        claimCodeByResponse: z
          .object({
            accepted: NonEmptyStringSchema,
            conditional: NonEmptyStringSchema,
            rejected: NonEmptyStringSchema,
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export const ConsultationActionBindingSchema = z
  .object({
    actionId: ActionIdSchema,
    effectProfileId: EffectProfileIdSchema,
    legalProfileId: NonEmptyStringSchema,
    responseProfileId: NonEmptyStringSchema,
  })
  .strict();

export const ConsultationPoliticalConflictRuleSchema = z
  .object({
    conflictRuleId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_POLITICAL_CONFLICT_RULE"),
    existingCommitmentType: NonEmptyStringSchema,
    proposedCommitmentType: NonEmptyStringSchema,
    warningCode: NonEmptyStringSchema,
  })
  .strict();

export const ConsultationConflictWarningSchema = z
  .object({
    conflictRuleId: NonEmptyStringSchema,
    warningCode: NonEmptyStringSchema,
    existingCommitmentId: CommitmentIdSchema,
    existingBeneficiary: PartyRefSchema,
  })
  .strict();

export const ConsultationKnownRiskPreviewSchema = z
  .object({
    classification: z.literal("PLAYER_KNOWLEDGE_ONLY_CONSULTATION_PREVIEW"),
    politicalConflictWarnings: z.array(ConsultationConflictWarningSchema),
    strategicRiskCodes: z.array(NonEmptyStringSchema),
  })
  .strict();

export const ConsultationCommandRequestSchema = z
  .object({
    contractVersion: z.literal(CONSULTATION_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_CONSULTATION_COMMAND"),
    currentState: CampaignStateSchema,
    sourceDecisionId: DecisionIdSchema,
    actionId: ActionIdSchema,
    actionBindings: z.array(ConsultationActionBindingSchema).min(1),
    legalProfiles: z.array(TestOnlyConsultationLegalProfileSchema).min(1),
    responseProfiles: z.array(TestOnlyConsultationResponseProfileSchema).min(1),
    politicalConflictRules: z.array(ConsultationPoliticalConflictRuleSchema),
    package: ConsultationPackageSchema,
  })
  .strict();

export const ConsultationCommandTraceSchema = z
  .object({
    actionId: ActionIdSchema,
    sourceDecisionId: DecisionIdSchema,
    target: PartyRefSchema,
    responsePositionId: PositionIdSchema,
    stanceAtCommit: ActorStanceSchema,
    responseState: ConsultationResponseStateSchema,
    evidenceId: EvidenceIdSchema,
    commitmentId: CommitmentIdSchema.optional(),
    consultationDomainEventId: NonEmptyStringSchema,
    knownRiskPreview: ConsultationKnownRiskPreviewSchema,
  })
  .strict();

export const ConsultationCommandResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      trace: ConsultationCommandTraceSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "SOURCE_DECISION_NOT_FOUND",
        "ACTION_BINDING_NOT_FOUND",
        "LEGAL_PROFILE_NOT_FOUND",
        "LEGAL_PROFILE_MISMATCH",
        "HARD_INVALID_TERMS",
        "RESPONSE_PROFILE_NOT_FOUND",
        "TARGET_NOT_FOUND",
        "POSITION_NOT_FOUND",
        "POSITION_TARGET_MISMATCH",
        "COMMITMENT_ALREADY_EXISTS",
        "INVALID_RESULT",
      ]),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const TestOnlyCommitmentCallbackSchema = z
  .object({
    owner: z.enum(["issuer", "beneficiary"]),
    memoryType: MemoryRecordSchema.shape.memoryType,
    salience: ScoreSchema,
    persistenceClass: MemoryRecordSchema.shape.persistenceClass,
    tags: z.array(NonEmptyStringSchema),
  })
  .strict();

export const TestOnlyCommitmentResolutionProfileSchema = z
  .object({
    commitmentType: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_COMMITMENT_RESOLUTION_PROFILE"),
    dueOutcome: z.enum(["fulfilled", "breached"]),
    callback: TestOnlyCommitmentCallbackSchema,
  })
  .strict();

export const CommitmentResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(CONSULTATION_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_COMMITMENT_RESOLUTION"),
    currentState: CampaignStateSchema,
    turn: PositiveIntegerSchema,
    profiles: z.array(TestOnlyCommitmentResolutionProfileSchema).min(1),
  })
  .strict();

export const CommitmentTransitionTraceSchema = z
  .object({
    commitmentId: CommitmentIdSchema,
    previousStatus: z.literal("active"),
    nextStatus: z.enum(["fulfilled", "breached"]),
    resolvedTurn: PositiveIntegerSchema,
    domainEventId: NonEmptyStringSchema,
    memoryId: MemoryIdSchema,
  })
  .strict();

export const CommitmentResolutionResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      transitions: z.array(CommitmentTransitionTraceSchema),
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "TURN_MISMATCH",
        "DUPLICATE_PROFILE_TYPE",
        "PROFILE_NOT_FOUND",
        "CALLBACK_OWNER_NOT_FOUND",
        "CALLBACK_ALREADY_EXISTS",
        "INVALID_RESULT",
      ]),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export type ConsultationResponseState = z.infer<
  typeof ConsultationResponseStateSchema
>;
export type CommitmentOffer = z.infer<typeof CommitmentOfferSchema>;
export type ConsultationPackage = z.infer<typeof ConsultationPackageSchema>;
export type TestOnlyConsultationLegalProfile = z.infer<
  typeof TestOnlyConsultationLegalProfileSchema
>;
export type TestOnlyConsultationResponseProfile = z.infer<
  typeof TestOnlyConsultationResponseProfileSchema
>;
export type ConsultationActionBinding = z.infer<
  typeof ConsultationActionBindingSchema
>;
export type ConsultationPoliticalConflictRule = z.infer<
  typeof ConsultationPoliticalConflictRuleSchema
>;
export type ConsultationKnownRiskPreview = z.infer<
  typeof ConsultationKnownRiskPreviewSchema
>;
export type ConsultationCommandRequest = z.infer<
  typeof ConsultationCommandRequestSchema
>;
export type ConsultationCommandResult = z.infer<
  typeof ConsultationCommandResultSchema
>;
export type ConsultationCommandTrace = z.infer<
  typeof ConsultationCommandTraceSchema
>;
export type TestOnlyCommitmentResolutionProfile = z.infer<
  typeof TestOnlyCommitmentResolutionProfileSchema
>;
export type CommitmentResolutionRequest = z.infer<
  typeof CommitmentResolutionRequestSchema
>;
export type CommitmentResolutionResult = z.infer<
  typeof CommitmentResolutionResultSchema
>;
export type CommitmentTransitionTrace = z.infer<
  typeof CommitmentTransitionTraceSchema
>;
