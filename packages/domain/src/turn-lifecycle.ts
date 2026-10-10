import { z } from "zod";

import { CampaignStateSchema } from "./campaign.js";
import { CommandIdSchema } from "./commands.js";
import { CampaignIdSchema } from "./ids.js";
import {
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  IsoDateSchema,
} from "./scalars.js";
import { CampaignVersionsSchema } from "./versions.js";
import { AuthoritativeStateHashSchema } from "./atomic-commit.js";

export const TURN_LIFECYCLE_CONTRACT_VERSION = "1.1.0" as const;

export const TURN_RESOLVER_IDS = [
  "scheduled_consequences",
  "commitments",
  "red_lines",
  "authorization",
  "implementations",
  "actors_and_positions",
  "world_conflict",
  "world_civilian",
  "world_infrastructure",
  "world_development",
  "world_external_environment",
  "event_director",
  "world_event_immediate_effects",
  "passive_observations",
  "intelligence_collection",
  "assessment_metadata",
  "institutional_capacities",
  "attention",
  "doctrine",
  "evaluation_snapshot",
  "early_termination",
  "final_evaluation",
] as const;

export const TurnResolverIdSchema = z.enum(TURN_RESOLVER_IDS);
export const TurnResolverSourceStepSchema = z.enum([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8a",
  "8b",
  "8c",
  "8d",
  "8e",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
]);

export const TurnResolverTraceSchema = z
  .object({
    resolverId: TurnResolverIdSchema,
    sourceStep: TurnResolverSourceStepSchema,
    adapterKind: z.enum(["implemented", "initial_no_op", "test_only_fixture"]),
    outcome: z.enum(["applied", "no_change", "skipped_not_final"]),
  })
  .strict();

export const EndTurnCommandSchema = z
  .object({
    commandId: CommandIdSchema,
    commandType: z.literal("end_turn"),
    campaignId: CampaignIdSchema,
    submittedTurn: PositiveIntegerSchema,
    payload: z.object({}).strict(),
  })
  .strict();

export const EndTurnRequestSchema = z
  .object({
    contractVersion: z.literal(TURN_LIFECYCLE_CONTRACT_VERSION),
    command: EndTurnCommandSchema,
    expectedRevision: NonNegativeIntegerSchema,
    expectedVersions: CampaignVersionsSchema,
  })
  .strict();

export const EndTurnRejectionReasonSchema = z.enum([
  "INVALID_REQUEST_SCHEMA",
  "CAMPAIGN_NOT_FOUND",
  "CAMPAIGN_NOT_ACTIVE",
  "CAMPAIGN_MISMATCH",
  "TURN_MISMATCH",
  "REVISION_MISMATCH",
  "VERSION_MISMATCH",
  "BLOCKING_ATTENTION_REQUIRES_DECISION",
  "MANDATORY_RESPONSE_CAPACITY_EXCEEDED",
  "INVALID_CALENDAR_ADVANCE",
  "INVALID_RESOLVER_REGISTRY",
  "INVALID_SIMULATION_RESULT",
]);

export const EndTurnSimulationInputSchema = z
  .object({
    request: EndTurnRequestSchema,
    currentState: CampaignStateSchema,
  })
  .strict();

export const EndTurnSimulationResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("committed"),
      commandId: CommandIdSchema,
      resolvedTurn: PositiveIntegerSchema,
      finalTurn: z.boolean(),
      resolverTrace: z.array(TurnResolverTraceSchema),
      nextState: CampaignStateSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("duplicate"),
      commandId: CommandIdSchema,
      originalResolvedTurn: PositiveIntegerSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      commandId: CommandIdSchema.optional(),
      reasonCode: EndTurnRejectionReasonSchema,
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const AtomicEndTurnResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("committed"),
      idempotent: z.literal(false),
      commandId: CommandIdSchema,
      resolvedTurn: PositiveIntegerSchema,
      currentTurn: PositiveIntegerSchema,
      currentDate: IsoDateSchema,
      finalTurn: z.boolean(),
      campaignRevision: NonNegativeIntegerSchema,
      authoritativeStateHash: AuthoritativeStateHashSchema,
      resolverTrace: z.array(TurnResolverTraceSchema),
    })
    .strict(),
  z
    .object({
      status: z.literal("duplicate"),
      idempotent: z.literal(true),
      commandId: CommandIdSchema,
      originalResolvedTurn: PositiveIntegerSchema,
      campaignRevision: NonNegativeIntegerSchema,
      authoritativeStateHash: AuthoritativeStateHashSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      idempotent: z.literal(false),
      commandId: CommandIdSchema.optional(),
      reasonCode: EndTurnRejectionReasonSchema,
      detailCode: NonEmptyStringSchema.optional(),
      campaignRevision: NonNegativeIntegerSchema.optional(),
      authoritativeStateHash: AuthoritativeStateHashSchema.optional(),
    })
    .strict(),
]);

export type TurnResolverId = z.infer<typeof TurnResolverIdSchema>;
export type TurnResolverSourceStep = z.infer<
  typeof TurnResolverSourceStepSchema
>;
export type TurnResolverTrace = z.infer<typeof TurnResolverTraceSchema>;
export type EndTurnCommand = z.infer<typeof EndTurnCommandSchema>;
export type EndTurnRequest = z.infer<typeof EndTurnRequestSchema>;
export type EndTurnRejectionReason = z.infer<
  typeof EndTurnRejectionReasonSchema
>;
export type EndTurnSimulationInput = z.infer<
  typeof EndTurnSimulationInputSchema
>;
export type EndTurnSimulationResult = z.infer<
  typeof EndTurnSimulationResultSchema
>;
export type AtomicEndTurnResult = z.infer<typeof AtomicEndTurnResultSchema>;
