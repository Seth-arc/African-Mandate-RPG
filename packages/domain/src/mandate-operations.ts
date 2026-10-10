import { z } from "zod";

import { CampaignStateSchema } from "./campaign.js";
import {
  CoalitionStanceSchema,
  MANDATE_CONTRACT_VERSION,
  MandateScopeSchema,
} from "./mandate-state.js";
import {
  ActionIdSchema,
  AssessmentIdSchema,
  DecisionIdSchema,
  EffectProfileIdSchema,
  InstitutionIdSchema,
  MandateCaseIdSchema,
  ProjectIdSchema,
} from "./ids.js";
import {
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import { PartyRefSchema } from "./references.js";
import { AuthorizationProcedureDefinitionSchema } from "./scenario.js";

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

export const TestOnlyCoalitionMemberTemplateSchema = z
  .object({
    party: PartyRefSchema,
    stance: CoalitionStanceSchema,
    supportStrength: ScoreSchema,
    conditionCodes: z.array(NonEmptyStringSchema),
  })
  .strict();

export const TestOnlyMandateCaseTemplateSchema = z
  .object({
    caseTemplateId: NonEmptyStringSchema,
    templateVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_MANDATE_CASE_TEMPLATE"),
    titleKey: NonEmptyStringSchema,
    allowedHypothesisCodes: z.array(NonEmptyStringSchema).min(1),
    authorizationProcedureId: NonEmptyStringSchema,
    scope: MandateScopeSchema,
    objectiveIds: z.array(NonEmptyStringSchema).min(1),
    coalitionMembers: z.array(TestOnlyCoalitionMemberTemplateSchema),
    coalitionSupportStrength: ScoreSchema,
    coalitionCohesion: ScoreSchema,
    outstandingConditionCodes: z.array(NonEmptyStringSchema),
    politicalStrength: ScoreSchema,
    implementationReadiness: ScoreSchema,
    distortionRisk: ScoreSchema,
  })
  .strict()
  .superRefine((template, ctx) => {
    uniqueStrings(
      template.allowedHypothesisCodes,
      "allowedHypothesisCodes",
      ctx,
    );
    uniqueStrings(template.objectiveIds, "objectiveIds", ctx);
    uniqueStrings(
      template.outstandingConditionCodes,
      "outstandingConditionCodes",
      ctx,
    );
  });

export const TestOnlyScopeNegotiationTemplateSchema = z
  .object({
    scopeNegotiationId: NonEmptyStringSchema,
    templateVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_SCOPE_NEGOTIATION_TEMPLATE"),
    scope: MandateScopeSchema,
    coalitionMembers: z.array(TestOnlyCoalitionMemberTemplateSchema),
    coalitionSupportStrength: ScoreSchema,
    coalitionCohesion: ScoreSchema,
    outstandingConditionCodes: z.array(NonEmptyStringSchema),
    politicalStrength: ScoreSchema,
    implementationReadiness: ScoreSchema,
    distortionRisk: ScoreSchema,
  })
  .strict();

export const TestOnlyAuthorizationProcedureEntrySchema = z.discriminatedUnion(
  "availability",
  [
    z
      .object({
        authorizationProcedureId: NonEmptyStringSchema,
        classification: z.literal("TEST_ONLY_AUTHORIZATION_PROCEDURE_ENTRY"),
        availability: z.literal("known_missing"),
        blockerCode: NonEmptyStringSchema,
      })
      .strict(),
    z
      .object({
        authorizationProcedureId: NonEmptyStringSchema,
        classification: z.literal("TEST_ONLY_AUTHORIZATION_PROCEDURE_ENTRY"),
        availability: z.literal("approved_fixture"),
        fixtureApprovalId: NonEmptyStringSchema,
        definition: AuthorizationProcedureDefinitionSchema,
        requiredGrantingInstitutionIds: z.array(InstitutionIdSchema).min(1),
      })
      .strict()
      .superRefine((entry, ctx) => {
        if (
          entry.authorizationProcedureId !==
          entry.definition.authorizationProcedureId
        ) {
          ctx.addIssue({
            code: "custom",
            message: "procedure entry ID must match definition ID",
            path: ["definition", "authorizationProcedureId"],
          });
        }
        uniqueStrings(
          entry.requiredGrantingInstitutionIds,
          "requiredGrantingInstitutionIds",
          ctx,
        );
        entry.requiredGrantingInstitutionIds.forEach((institutionId, index) => {
          if (
            !entry.definition.authorityInstitutionIds.includes(institutionId)
          ) {
            ctx.addIssue({
              code: "custom",
              message:
                "required grantor must be an authority in the fixture procedure",
              path: ["requiredGrantingInstitutionIds", index],
            });
          }
        });
      }),
  ],
);

export const ImplementationMilestoneDefinitionSchema = z
  .object({
    milestoneId: NonEmptyStringSchema,
    nameKey: NonEmptyStringSchema,
    requiredWorkUnits: PositiveIntegerSchema,
    completionEffectProfileIds: z.array(EffectProfileIdSchema),
  })
  .strict();

export const TestOnlyImplementationProfileSchema = z
  .object({
    implementationProfileId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_IMPLEMENTATION_PROFILE"),
    baseLeadTimeTurns: NonNegativeIntegerSchema,
    baseWorkUnits: PositiveIntegerSchema,
    requiredCapacity: ScoreSchema,
    milestoneDefinitions: z.array(ImplementationMilestoneDefinitionSchema),
    riskProfileIds: z.array(NonEmptyStringSchema),
  })
  .strict()
  .superRefine((profile, ctx) => {
    uniqueStrings(
      profile.milestoneDefinitions.map((milestone) => milestone.milestoneId),
      "milestoneDefinitions",
      ctx,
    );
    uniqueStrings(profile.riskProfileIds, "riskProfileIds", ctx);
  });

export const MandateActionBindingSchema = z
  .object({
    actionId: ActionIdSchema,
    effectProfileId: EffectProfileIdSchema,
    operation: z.enum([
      "open_case",
      "negotiate_scope",
      "request_authorization",
      "launch_implementation",
    ]),
  })
  .strict();

export const MandateCommandTermSchema = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("open_case"),
      assessmentId: AssessmentIdSchema,
      caseTemplateId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("negotiate_scope"),
      mandateCaseId: MandateCaseIdSchema,
      scopeNegotiationId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("request_authorization"),
      mandateCaseId: MandateCaseIdSchema,
      authorizationProcedureId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("launch_implementation"),
      mandateCaseId: MandateCaseIdSchema,
      implementationProfileId: NonEmptyStringSchema,
      capacityAllocated: ScoreSchema,
    })
    .strict(),
]);

export const MandateCommandRequestSchema = z
  .object({
    contractVersion: z.literal(MANDATE_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_MANDATE_COMMAND"),
    currentState: CampaignStateSchema,
    sourceDecisionId: DecisionIdSchema,
    actionId: ActionIdSchema,
    actionBindings: z.array(MandateActionBindingSchema).min(1),
    caseTemplates: z.array(TestOnlyMandateCaseTemplateSchema),
    scopeNegotiations: z.array(TestOnlyScopeNegotiationTemplateSchema),
    authorizationProcedures: z.array(TestOnlyAuthorizationProcedureEntrySchema),
    implementationProfiles: z.array(TestOnlyImplementationProfileSchema),
    term: MandateCommandTermSchema,
  })
  .strict();

export const MandateCommandPrevalidationRequestSchema =
  MandateCommandRequestSchema.omit({ sourceDecisionId: true });

export const MandateRejectionReasonSchema = z.enum([
  "INVALID_REQUEST_SCHEMA",
  "DUPLICATE_ACTION_BINDING",
  "ACTION_BINDING_NOT_FOUND",
  "COMMAND_OPERATION_MISMATCH",
  "SOURCE_DECISION_NOT_FOUND",
  "ASSESSMENT_NOT_FOUND",
  "ASSESSMENT_NOT_ACTIVE",
  "ASSESSMENT_NOT_ALLOWED_BY_TEMPLATE",
  "ASSESSMENT_ALREADY_ESCALATED",
  "CASE_TEMPLATE_NOT_FOUND",
  "MANDATE_CASE_NOT_FOUND",
  "MANDATE_CASE_STAGE_INVALID",
  "SCOPE_NEGOTIATION_NOT_FOUND",
  "AUTHORIZATION_PROCEDURE_NOT_FOUND",
  "AUTHORIZATION_PROCEDURE_KNOWN_MISSING",
  "AUTHORIZATION_PROCEDURE_MISMATCH",
  "AUTHORIZATION_ALREADY_REQUESTED",
  "AUTHORIZATION_NOT_GRANTED",
  "IMPLEMENTATION_PROFILE_NOT_FOUND",
  "IMPLEMENTATION_CAPACITY_INSUFFICIENT",
  "IMPLEMENTATION_ALREADY_EXISTS",
  "MANDATE_CASE_ALREADY_EXISTS",
  "INVALID_RESULT",
]);

export const MandateCommandPrevalidationResultSchema = z.discriminatedUnion(
  "status",
  [
    z.object({ status: z.literal("valid") }).strict(),
    z
      .object({
        status: z.literal("rejected"),
        reasonCode: MandateRejectionReasonSchema,
        detailCode: NonEmptyStringSchema.optional(),
      })
      .strict(),
  ],
);

export const MandateStatusTraceSchema = z.discriminatedUnion("transition", [
  z
    .object({
      transition: z.literal("case_opened"),
      mandateCaseId: MandateCaseIdSchema,
      assessmentId: AssessmentIdSchema,
      previousStage: z.null(),
      nextStage: z.literal("assessment_basis"),
      authorizationStatus: z.literal("not_requested"),
      implementationStatus: z.literal("not_created"),
      domainEventId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      transition: z.literal("scope_negotiated"),
      mandateCaseId: MandateCaseIdSchema,
      previousStage: z.enum(["assessment_basis", "coalition"]),
      nextStage: z.literal("coalition"),
      previousScope: MandateScopeSchema,
      negotiatedScope: MandateScopeSchema,
      previousDistortionRisk: ScoreSchema,
      nextDistortionRisk: ScoreSchema,
      authorizationStatus: z.literal("not_requested"),
      implementationStatus: z.literal("not_created"),
      domainEventId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      transition: z.literal("authorization_requested"),
      mandateCaseId: MandateCaseIdSchema,
      previousStage: z.literal("coalition"),
      nextStage: z.literal("authorization"),
      authorizationStatus: z.literal("pending"),
      implementationStatus: z.literal("not_created"),
      earliestResolutionTurn: PositiveIntegerSchema,
      domainEventId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      transition: z.literal("implementation_launched"),
      mandateCaseId: MandateCaseIdSchema,
      projectId: ProjectIdSchema,
      previousStage: z.literal("authorization"),
      nextStage: z.literal("implementation"),
      authorizationStatus: z.enum(["authorized", "conditionally_authorized"]),
      implementationStatus: z.literal("preparing"),
      domainEventId: NonEmptyStringSchema,
    })
    .strict(),
]);

export const MandateCommandResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      trace: MandateStatusTraceSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: MandateRejectionReasonSchema,
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const AuthorizationRequirementResolutionSchema = z
  .object({
    requirementId: NonEmptyStringSchema,
    status: z.enum(["satisfied", "failed", "waived"]),
  })
  .strict();

export const TestOnlyAuthorizationResolutionPlanSchema = z
  .object({
    resolutionPlanId: NonEmptyStringSchema,
    planVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_AUTHORIZATION_RESOLUTION_PLAN"),
    mandateCaseId: MandateCaseIdSchema,
    resolutionTurn: PositiveIntegerSchema,
    grantingInstitutionIds: z.array(InstitutionIdSchema).min(1),
    requirementResolutions: z.array(AuthorizationRequirementResolutionSchema),
    outcome: z.enum(["authorized", "conditionally_authorized", "rejected"]),
    legalScopeCodes: z.array(NonEmptyStringSchema),
    restrictionCodes: z.array(NonEmptyStringSchema),
    expiryTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((plan, ctx) => {
    uniqueStrings(plan.grantingInstitutionIds, "grantingInstitutionIds", ctx);
    uniqueStrings(
      plan.requirementResolutions.map(
        (requirement) => requirement.requirementId,
      ),
      "requirementResolutions",
      ctx,
    );
    uniqueStrings(plan.legalScopeCodes, "legalScopeCodes", ctx);
    uniqueStrings(plan.restrictionCodes, "restrictionCodes", ctx);
    if (
      plan.expiryTurn !== undefined &&
      plan.expiryTurn <= plan.resolutionTurn
    ) {
      ctx.addIssue({
        code: "custom",
        message: "expiryTurn must follow resolutionTurn",
        path: ["expiryTurn"],
      });
    }
  });

export const AuthorizationResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(MANDATE_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_AUTHORIZATION_RESOLUTION"),
    currentState: CampaignStateSchema,
    authorizationProcedures: z.array(TestOnlyAuthorizationProcedureEntrySchema),
    plan: TestOnlyAuthorizationResolutionPlanSchema,
  })
  .strict();

export const AuthorizationResolutionTraceSchema = z
  .object({
    transition: z.literal("authorization_resolved"),
    mandateCaseId: MandateCaseIdSchema,
    previousStage: z.literal("authorization"),
    nextStage: z.literal("authorization"),
    previousAuthorizationStatus: z.literal("pending"),
    authorizationStatus: z.enum([
      "authorized",
      "conditionally_authorized",
      "rejected",
    ]),
    implementationStatus: z.literal("not_created"),
    resolvedTurn: PositiveIntegerSchema,
    grantingInstitutionIds: z.array(InstitutionIdSchema),
    domainEventId: NonEmptyStringSchema,
  })
  .strict();

export const AuthorizationResolutionResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("resolved"),
        nextState: CampaignStateSchema,
        trace: AuthorizationResolutionTraceSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("rejected"),
        reasonCode: z.enum([
          "INVALID_REQUEST_SCHEMA",
          "TURN_MISMATCH",
          "MANDATE_CASE_NOT_FOUND",
          "AUTHORIZATION_NOT_PENDING",
          "AUTHORIZATION_NOT_DUE",
          "AUTHORIZATION_PROCEDURE_NOT_APPROVED",
          "UNAUTHORIZED_GRANTOR",
          "REQUIRED_GRANTOR_MISSING",
          "REQUIREMENT_SET_MISMATCH",
          "AUTHORIZATION_OUTCOME_INCONSISTENT",
          "INVALID_RESULT",
        ]),
        detailCode: NonEmptyStringSchema.optional(),
      })
      .strict(),
  ],
);

export type TestOnlyMandateCaseTemplate = z.infer<
  typeof TestOnlyMandateCaseTemplateSchema
>;
export type TestOnlyScopeNegotiationTemplate = z.infer<
  typeof TestOnlyScopeNegotiationTemplateSchema
>;
export type TestOnlyAuthorizationProcedureEntry = z.infer<
  typeof TestOnlyAuthorizationProcedureEntrySchema
>;
export type TestOnlyImplementationProfile = z.infer<
  typeof TestOnlyImplementationProfileSchema
>;
export type MandateActionBinding = z.infer<typeof MandateActionBindingSchema>;
export type MandateCommandTerm = z.infer<typeof MandateCommandTermSchema>;
export type MandateCommandPrevalidationRequest = z.infer<
  typeof MandateCommandPrevalidationRequestSchema
>;
export type MandateCommandPrevalidationResult = z.infer<
  typeof MandateCommandPrevalidationResultSchema
>;
export type MandateCommandResult = z.infer<typeof MandateCommandResultSchema>;
export type MandateStatusTrace = z.infer<typeof MandateStatusTraceSchema>;
export type TestOnlyAuthorizationResolutionPlan = z.infer<
  typeof TestOnlyAuthorizationResolutionPlanSchema
>;
export type AuthorizationResolutionResult = z.infer<
  typeof AuthorizationResolutionResultSchema
>;
