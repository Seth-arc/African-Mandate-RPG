import { z } from "zod";

import { ActionIdSchema, ActorIdSchema, InstitutionIdSchema } from "./ids.js";
import { KnownCostProfileSchema } from "./commands.js";
import {
  IsoDateSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import { BalanceConfigurationSchema } from "./scenario.js";
import {
  EVALUATION_DIMENSIONS,
  EvaluationCausalChainSchema,
  EvaluationSnapshotSchema,
} from "./strategic-state.js";

export const PRODUCTION_SCENARIO_SCHEMA_VERSION = 1 as const;
export const PRODUCTION_SCENARIO_CONTRACT_VERSION = "1.0.0" as const;
export const PRODUCTION_SCENARIO_CLASSIFICATION =
  "PRODUCTION_SIMULATED_INSTITUTIONAL_MODEL" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);

export const SimulatedInstitutionRoleSchema = z
  .object({
    institutionId: InstitutionIdSchema,
    modelRole: NonEmptyStringSchema,
    disclosure: z.string().startsWith("SIMULATED:"),
    historicalClaim: z.literal(false),
  })
  .strict();

export const SimulatedActorAssumptionSchema = z
  .object({
    actorId: ActorIdSchema,
    institutionId: InstitutionIdSchema,
    stanceModel: z.enum(["cautious", "pragmatic", "assertive", "conditional"]),
    cooperationBaseline: ScoreSchema,
    riskTolerance: ScoreSchema,
    uncertainty: z
      .object({ min: ScoreSchema, max: ScoreSchema })
      .strict()
      .refine(({ min, max }) => min <= max, {
        message: "uncertainty min must not exceed max",
      }),
    historicalClaim: z.literal(false),
  })
  .strict();

export const SimulatedProcedureStepSchema = z.enum([
  "commission_submission",
  "psc_game_review",
  "affected_host_game_consent",
  "regional_consultation",
]);

export const SimulatedAuthorizationProcedureSchema = z
  .object({
    procedureId: NonEmptyStringSchema,
    displayName: z.string().startsWith("SIMULATED:"),
    authorityInstitutionIds: z.array(InstitutionIdSchema).min(1),
    consultedInstitutionIds: z.array(InstitutionIdSchema),
    requiredSteps: z.array(SimulatedProcedureStepSchema).min(1),
    leadTimeTurns: NonNegativeIntegerSchema,
    expiryTurns: PositiveIntegerSchema,
    legalClaim: z.literal(false),
  })
  .strict()
  .superRefine((procedure, ctx) => {
    const authorityIds = new Set(procedure.authorityInstitutionIds);
    procedure.consultedInstitutionIds.forEach((institutionId, index) => {
      if (authorityIds.has(institutionId)) {
        ctx.addIssue({
          code: "custom",
          path: ["consultedInstitutionIds", index],
          message: "A consultation role cannot also be an authority role",
        });
      }
    });
    if (
      new Set(procedure.requiredSteps).size !== procedure.requiredSteps.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["requiredSteps"],
        message: "requiredSteps must not contain duplicates",
      });
    }
  });

export const ProductionActionCostSchema = z
  .object({
    actionId: ActionIdSchema,
    decisionSlotCost: z.literal(1),
    costProfile: KnownCostProfileSchema,
    rationale: NonEmptyStringSchema,
  })
  .strict();

export const ProductionEvaluationProfileSchema = z
  .object({
    evaluationProfileId: NonEmptyStringSchema,
    version: NonEmptyStringSchema,
    requiredTurns: PositiveIntegerSchema,
    endingWeight: z.number().finite().min(0).max(1),
    trajectoryMeanWeight: z.number().finite().min(0).max(1),
    criticalThreshold: ScoreSchema,
    criticalPenaltyPerTurn: z.number().finite().nonnegative(),
    criticalPenaltyCap: ScoreSchema,
    countervailingHarmWeight: z.number().finite().min(0).max(1),
    stableDelta: ScoreSchema,
  })
  .strict()
  .refine(
    ({ endingWeight, trajectoryMeanWeight }) =>
      Math.abs(endingWeight + trajectoryMeanWeight - 1) < 1e-9,
    {
      path: ["endingWeight"],
      message: "ending and trajectory weights must sum to 1",
    },
  );

const CountervailingHarmsSchema = z
  .object(
    Object.fromEntries(
      EVALUATION_DIMENSIONS.map((dimension) => [dimension, ScoreSchema]),
    ) as Record<(typeof EVALUATION_DIMENSIONS)[number], typeof ScoreSchema>,
  )
  .strict();

export const ProductionEvaluationRequestSchema = z
  .object({
    profile: ProductionEvaluationProfileSchema,
    snapshots: z.array(EvaluationSnapshotSchema).min(1),
    countervailingHarms: CountervailingHarmsSchema,
    causalChains: z.array(EvaluationCausalChainSchema),
  })
  .strict();

export const SimulatedAuthorizationProgressSchema = z
  .object({
    procedure: SimulatedAuthorizationProcedureSchema,
    requestedTurn: PositiveIntegerSchema,
    currentTurn: PositiveIntegerSchema,
    completedSteps: z.array(SimulatedProcedureStepSchema),
  })
  .strict()
  .superRefine((progress, ctx) => {
    if (progress.currentTurn < progress.requestedTurn) {
      ctx.addIssue({
        code: "custom",
        path: ["currentTurn"],
        message: "currentTurn must not precede requestedTurn",
      });
    }
    if (
      new Set(progress.completedSteps).size !== progress.completedSteps.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["completedSteps"],
        message: "completedSteps must not contain duplicates",
      });
    }
  });

export const SimulatedAuthorizationResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("pending"),
        reasonCode: z.enum(["MISSING_STEPS", "LEAD_TIME"]),
        missingSteps: z.array(SimulatedProcedureStepSchema),
        earliestResolutionTurn: PositiveIntegerSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("authorized"),
        resolvedTurn: PositiveIntegerSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("expired"),
        expiredTurn: PositiveIntegerSchema,
      })
      .strict(),
  ],
);

export const ProductionScenarioConfigurationSchema = z
  .object({
    schemaVersion: z.literal(PRODUCTION_SCENARIO_SCHEMA_VERSION),
    contractVersion: z.literal(PRODUCTION_SCENARIO_CONTRACT_VERSION),
    classification: z.literal(PRODUCTION_SCENARIO_CLASSIFICATION),
    contentVersion: NonEmptyStringSchema,
    disclosure: z.string().startsWith("SIMULATED:"),
    approval: z
      .object({
        decisionId: z.literal("AM-GOV-062"),
        approvedBy: NonEmptyStringSchema,
        approvedOn: IsoDateSchema,
        reviewMode: z.literal("OWNER_ONLY_INDIVIDUAL_BUILD"),
      })
      .strict(),
    sourcePins: z.record(NonEmptyStringSchema, Sha256Schema),
    institutionRoles: z.array(SimulatedInstitutionRoleSchema).min(1),
    actorAssumptions: z.array(SimulatedActorAssumptionSchema).min(1),
    authorizationProcedures: z
      .array(SimulatedAuthorizationProcedureSchema)
      .min(1),
    actionCosts: z.array(ProductionActionCostSchema).min(1),
    balance: BalanceConfigurationSchema,
    evaluation: ProductionEvaluationProfileSchema,
    competitiveLeaderboard: z
      .object({
        enabled: z.literal(false),
        reasonCode: z.literal("OWNER_DISABLED_NONCOMPETITIVE_RELEASE"),
      })
      .strict(),
    sourceClaims: z.array(z.never()).length(0),
    usesTestFixtureValues: z.literal(false),
  })
  .strict()
  .superRefine((configuration, ctx) => {
    const institutionIds = new Set(
      configuration.institutionRoles.map(({ institutionId }) => institutionId),
    );
    configuration.actorAssumptions.forEach((actor, index) => {
      if (!institutionIds.has(actor.institutionId)) {
        ctx.addIssue({
          code: "custom",
          path: ["actorAssumptions", index, "institutionId"],
          message: `Unknown simulated institution role: ${actor.institutionId}`,
        });
      }
    });
    configuration.authorizationProcedures.forEach((procedure, index) => {
      [
        ...procedure.authorityInstitutionIds,
        ...procedure.consultedInstitutionIds,
      ].forEach((institutionId) => {
        if (!institutionIds.has(institutionId)) {
          ctx.addIssue({
            code: "custom",
            path: ["authorizationProcedures", index],
            message: `Unknown simulated institution role: ${institutionId}`,
          });
        }
      });
    });
    const unique = (values: readonly string[], path: string) => {
      if (new Set(values).size !== values.length) {
        ctx.addIssue({
          code: "custom",
          path: [path],
          message: `${path} must be unique`,
        });
      }
    };
    unique(
      configuration.actorAssumptions.map(({ actorId }) => actorId),
      "actorAssumptions",
    );
    unique(
      configuration.authorizationProcedures.map(
        ({ procedureId }) => procedureId,
      ),
      "authorizationProcedures",
    );
    unique(
      configuration.actionCosts.map(({ actionId }) => actionId),
      "actionCosts",
    );
    unique(
      configuration.actionCosts.map(
        ({ costProfile }) => costProfile.knownCostProfileId,
      ),
      "actionCosts",
    );
  });

export type ProductionScenarioConfiguration = z.infer<
  typeof ProductionScenarioConfigurationSchema
>;
export type ProductionEvaluationProfile = z.infer<
  typeof ProductionEvaluationProfileSchema
>;
export type ProductionEvaluationRequest = z.infer<
  typeof ProductionEvaluationRequestSchema
>;
export type SimulatedAuthorizationProgress = z.infer<
  typeof SimulatedAuthorizationProgressSchema
>;
export type SimulatedAuthorizationResult = z.infer<
  typeof SimulatedAuthorizationResultSchema
>;
