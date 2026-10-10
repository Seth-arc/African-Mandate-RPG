import { z } from "zod";

import {
  AssessmentIdSchema,
  CommitmentIdSchema,
  ConsequenceIdSchema,
  MandateCaseIdSchema,
  ProjectIdSchema,
  TerritoryIdSchema,
  ZoneIdSchema,
} from "./ids.js";
import { PartyRefSchema } from "./references.js";
import {
  MoneyAmountSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import {
  AuthorityDomainSchema,
  AuthorizationRequirementDefinitionSchema,
} from "./scenario.js";

export const MANDATE_CONTRACT_VERSION = "1.0.0" as const;

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
        message: `Duplicate value: ${value}`,
        path: [path, index],
      });
    }
    seen.add(value);
  });
};

const partyKey = (party: z.infer<typeof PartyRefSchema>): string =>
  party.kind === "actor"
    ? `actor:${party.actorId}`
    : `institution:${party.institutionId}`;

export const MandateCaseStageSchema = z.enum([
  "assessment_basis",
  "coalition",
  "authorization",
  "implementation",
  "outcome",
  "closed",
  "abandoned",
]);

export const CoalitionStanceSchema = z.enum([
  "strong_support",
  "support",
  "conditional_support",
  "neutral",
  "resist",
  "strong_resist",
]);

export const CoalitionMemberStateSchema = z
  .object({
    party: PartyRefSchema,
    stance: CoalitionStanceSchema,
    supportStrength: ScoreSchema,
    conditionCodes: z.array(NonEmptyStringSchema),
    joinedTurn: PositiveIntegerSchema.optional(),
    lastChangedTurn: PositiveIntegerSchema,
  })
  .strict()
  .superRefine((member, ctx) => {
    addDuplicateIssues(member.conditionCodes, "conditionCodes", ctx);
  });

export const CoalitionStateSchema = z
  .object({
    members: z.array(CoalitionMemberStateSchema),
    supportStrength: ScoreSchema,
    cohesion: ScoreSchema,
    outstandingConditionCodes: z.array(NonEmptyStringSchema),
  })
  .strict()
  .superRefine((coalition, ctx) => {
    addDuplicateIssues(
      coalition.members.map((member) => partyKey(member.party)),
      "members",
      ctx,
    );
    addDuplicateIssues(
      coalition.outstandingConditionCodes,
      "outstandingConditionCodes",
      ctx,
    );
  });

export const AuthorizationRequirementStatusSchema = z.enum([
  "pending",
  "satisfied",
  "failed",
  "waived",
]);

export const AuthorizationRequirementStateSchema = z
  .object({
    requirementId: NonEmptyStringSchema,
    definition: AuthorizationRequirementDefinitionSchema,
    status: AuthorizationRequirementStatusSchema,
    satisfiedTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((requirement, ctx) => {
    const resolved = requirement.status === "satisfied";
    if (resolved !== (requirement.satisfiedTurn !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "satisfiedTurn is present exactly for satisfied requirements",
        path: ["satisfiedTurn"],
      });
    }
  });

export const AuthorizationStatusSchema = z.enum([
  "not_requested",
  "pending",
  "authorized",
  "conditionally_authorized",
  "rejected",
  "expired",
  "revoked",
]);

export const AuthorizationStateSchema = z
  .object({
    status: AuthorizationStatusSchema,
    requirementStates: z.array(AuthorizationRequirementStateSchema),
    requestedTurn: PositiveIntegerSchema.optional(),
    earliestResolutionTurn: PositiveIntegerSchema.optional(),
    resolvedTurn: PositiveIntegerSchema.optional(),
    legalScopeCodes: z.array(NonEmptyStringSchema),
    restrictionCodes: z.array(NonEmptyStringSchema),
    expiryTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((authorization, ctx) => {
    addDuplicateIssues(
      authorization.requirementStates.map(
        (requirement) => requirement.requirementId,
      ),
      "requirementStates",
      ctx,
    );
    addDuplicateIssues(authorization.legalScopeCodes, "legalScopeCodes", ctx);
    addDuplicateIssues(authorization.restrictionCodes, "restrictionCodes", ctx);
    if (authorization.status === "not_requested") {
      if (
        authorization.requirementStates.length > 0 ||
        authorization.requestedTurn !== undefined ||
        authorization.earliestResolutionTurn !== undefined ||
        authorization.resolvedTurn !== undefined ||
        authorization.legalScopeCodes.length > 0 ||
        authorization.restrictionCodes.length > 0 ||
        authorization.expiryTurn !== undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message:
            "not_requested authorization cannot contain request or resolution state",
        });
      }
      return;
    }
    if (
      authorization.requestedTurn === undefined ||
      authorization.earliestResolutionTurn === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "requested authorization requires request timing",
        path: ["requestedTurn"],
      });
    }
    const isResolved = authorization.status !== "pending";
    if (isResolved !== (authorization.resolvedTurn !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "resolvedTurn is present exactly for resolved authorization",
        path: ["resolvedTurn"],
      });
    }
  });

export const MandateScopeSchema = z
  .object({
    territoryIds: z.array(TerritoryIdSchema),
    zoneIds: z.array(ZoneIdSchema),
    permittedDomains: z.array(AuthorityDomainSchema),
    resourceCeilings: z
      .object({
        budget: MoneyAmountSchema.optional(),
        personnel: NonNegativeIntegerSchema.optional(),
      })
      .strict()
      .optional(),
    monitoringRequirementCodes: z.array(NonEmptyStringSchema),
  })
  .strict()
  .superRefine((scope, ctx) => {
    addDuplicateIssues(scope.territoryIds, "territoryIds", ctx);
    addDuplicateIssues(scope.zoneIds, "zoneIds", ctx);
    addDuplicateIssues(scope.permittedDomains, "permittedDomains", ctx);
    addDuplicateIssues(
      scope.monitoringRequirementCodes,
      "monitoringRequirementCodes",
      ctx,
    );
  });

export const MandateOutcomeSchema = z
  .object({
    delivery: z.enum(["full", "partial", "minimal", "failed"]),
    integrity: z.enum(["intact", "distorted"]),
    netImpact: z.enum(["positive", "mixed", "negative", "counterproductive"]),
    effectiveness: ScoreSchema,
    scopeIntegrity: ScoreSchema,
    objectiveResults: z.array(
      z
        .object({
          objectiveId: NonEmptyStringSchema,
          achievement: ScoreSchema,
          achieved: z.boolean(),
        })
        .strict(),
    ),
    unintendedConsequenceIds: z.array(ConsequenceIdSchema),
    closedTurn: PositiveIntegerSchema,
  })
  .strict();

export const MandateCaseStateSchema = z
  .object({
    mandateCaseId: MandateCaseIdSchema,
    titleKey: NonEmptyStringSchema,
    stage: MandateCaseStageSchema,
    assessmentIds: z.array(AssessmentIdSchema).min(1),
    coalition: CoalitionStateSchema,
    authorizationProcedureId: NonEmptyStringSchema,
    authorization: AuthorizationStateSchema,
    scope: MandateScopeSchema,
    objectiveIds: z.array(NonEmptyStringSchema).min(1),
    politicalStrength: ScoreSchema,
    implementationReadiness: ScoreSchema,
    distortionRisk: ScoreSchema,
    commitmentIds: z.array(CommitmentIdSchema),
    implementationId: ProjectIdSchema.optional(),
    openedTurn: PositiveIntegerSchema,
    lastChangedTurn: PositiveIntegerSchema,
    outcome: MandateOutcomeSchema.optional(),
  })
  .strict()
  .superRefine((mandateCase, ctx) => {
    addDuplicateIssues(mandateCase.assessmentIds, "assessmentIds", ctx);
    addDuplicateIssues(mandateCase.objectiveIds, "objectiveIds", ctx);
    addDuplicateIssues(mandateCase.commitmentIds, "commitmentIds", ctx);
    if (mandateCase.lastChangedTurn < mandateCase.openedTurn) {
      ctx.addIssue({
        code: "custom",
        message: "lastChangedTurn cannot precede openedTurn",
        path: ["lastChangedTurn"],
      });
    }
    if (
      mandateCase.stage === "implementation" &&
      mandateCase.implementationId === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "implementation stage requires implementationId",
        path: ["implementationId"],
      });
    }
    if (
      ["outcome", "closed"].includes(mandateCase.stage) &&
      mandateCase.outcome === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "outcome and closed stages require an outcome",
        path: ["outcome"],
      });
    }
  });

export const ImplementationMilestoneStatusSchema = z.enum([
  "pending",
  "completed",
  "failed",
]);

export const ImplementationMilestoneStateSchema = z
  .object({
    milestoneId: NonEmptyStringSchema,
    status: ImplementationMilestoneStatusSchema,
    completedTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((milestone, ctx) => {
    const completed = milestone.status === "completed";
    if (completed !== (milestone.completedTurn !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "completedTurn is present exactly for completed milestones",
        path: ["completedTurn"],
      });
    }
  });

export const ImplementationStateSchema = z
  .object({
    projectId: ProjectIdSchema,
    mandateCaseId: MandateCaseIdSchema,
    implementationProfileId: NonEmptyStringSchema,
    status: z.enum([
      "preparing",
      "active",
      "delayed",
      "blocked",
      "completed",
      "failed",
      "suspended",
    ]),
    createdTurn: PositiveIntegerSchema,
    activatedTurn: PositiveIntegerSchema.optional(),
    completedTurn: PositiveIntegerSchema.optional(),
    workCompleted: NonNegativeIntegerSchema,
    workRequired: PositiveIntegerSchema,
    capacityRequired: ScoreSchema,
    capacityAllocated: ScoreSchema,
    blockingReasonCodes: z.array(NonEmptyStringSchema),
    riskIds: z.array(NonEmptyStringSchema),
    milestoneStates: z.array(ImplementationMilestoneStateSchema),
  })
  .strict()
  .superRefine((implementation, ctx) => {
    addDuplicateIssues(
      implementation.blockingReasonCodes,
      "blockingReasonCodes",
      ctx,
    );
    addDuplicateIssues(implementation.riskIds, "riskIds", ctx);
    addDuplicateIssues(
      implementation.milestoneStates.map((milestone) => milestone.milestoneId),
      "milestoneStates",
      ctx,
    );
    if (implementation.workCompleted > implementation.workRequired) {
      ctx.addIssue({
        code: "custom",
        message: "workCompleted cannot exceed workRequired",
        path: ["workCompleted"],
      });
    }
    if (
      implementation.status === "preparing" &&
      implementation.activatedTurn !== undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "preparing implementation cannot have activatedTurn",
        path: ["activatedTurn"],
      });
    }
    const completed = implementation.status === "completed";
    if (completed !== (implementation.completedTurn !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message:
          "completedTurn is present exactly for completed implementation",
        path: ["completedTurn"],
      });
    }
  });

export type MandateCaseStage = z.infer<typeof MandateCaseStageSchema>;
export type CoalitionStance = z.infer<typeof CoalitionStanceSchema>;
export type CoalitionMemberState = z.infer<typeof CoalitionMemberStateSchema>;
export type CoalitionState = z.infer<typeof CoalitionStateSchema>;
export type AuthorizationRequirementState = z.infer<
  typeof AuthorizationRequirementStateSchema
>;
export type AuthorizationState = z.infer<typeof AuthorizationStateSchema>;
export type MandateScope = z.infer<typeof MandateScopeSchema>;
export type MandateOutcome = z.infer<typeof MandateOutcomeSchema>;
export type MandateCaseState = z.infer<typeof MandateCaseStateSchema>;
export type ImplementationState = z.infer<typeof ImplementationStateSchema>;
