import { z } from "zod";

import { CampaignStateSchema, DecisionRecordSchema } from "./campaign.js";
import {
  CommandIdSchema,
  CommandPreparationRejectionReasonSchema,
  StrategicActionCommandSchema,
} from "./commands.js";
import {
  AttentionItemIdSchema,
  CampaignIdSchema,
  DecisionIdSchema,
} from "./ids.js";
import { JsonObjectSchema } from "./json.js";
import { NonNegativeIntegerSchema } from "./scalars.js";
import { CampaignVersionsSchema } from "./versions.js";

export const ATOMIC_COMMIT_CONTRACT_VERSION = "1.1.0" as const;
export const SAVE_SNAPSHOT_VERSION = 1 as const;

export const AuthoritativeStateHashSchema = z.string().regex(/^[0-9a-f]{64}$/u);

const versionsMatch = (
  left: z.infer<typeof CampaignVersionsSchema>,
  right: z.infer<typeof CampaignVersionsSchema>,
): boolean =>
  left.gameSchemaVersion === right.gameSchemaVersion &&
  left.simulationModelVersion === right.simulationModelVersion &&
  left.baselineVersion === right.baselineVersion &&
  left.scenarioVersion === right.scenarioVersion &&
  left.contentVersion === right.contentVersion &&
  left.balanceProfileVersion === right.balanceProfileVersion &&
  left.methodologyVersion === right.methodologyVersion;

export const SaveSnapshotSchema = z
  .object({
    snapshotVersion: z.literal(SAVE_SNAPSHOT_VERSION),
    campaignId: CampaignIdSchema,
    campaignRevision: NonNegativeIntegerSchema,
    versions: CampaignVersionsSchema,
    authoritativeState: CampaignStateSchema,
    authoritativeStateHash: AuthoritativeStateHashSchema,
    presentationCache: z
      .object({
        narrative: z.array(JsonObjectSchema).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((snapshot, ctx) => {
    if (snapshot.campaignId !== snapshot.authoritativeState.meta.campaignId) {
      ctx.addIssue({
        code: "custom",
        message: "campaignId must match authoritativeState.meta.campaignId",
        path: ["campaignId"],
      });
    }
    if (
      snapshot.campaignRevision !== snapshot.authoritativeState.meta.revision
    ) {
      ctx.addIssue({
        code: "custom",
        message: "campaignRevision must match authoritativeState.meta.revision",
        path: ["campaignRevision"],
      });
    }
    if (
      !versionsMatch(snapshot.versions, snapshot.authoritativeState.versions)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "versions must match authoritativeState.versions",
        path: ["versions"],
      });
    }
  });

export const AtomicStrategicCommandRequestSchema = z
  .object({
    contractVersion: z.literal(ATOMIC_COMMIT_CONTRACT_VERSION),
    command: StrategicActionCommandSchema,
    expectedRevision: NonNegativeIntegerSchema,
    expectedVersions: CampaignVersionsSchema,
    mandatoryResponseAttentionItemId: AttentionItemIdSchema.optional(),
  })
  .strict();

export const AtomicCommandRejectionReasonSchema = z.union([
  CommandPreparationRejectionReasonSchema,
  z.enum([
    "INVALID_REQUEST_SCHEMA",
    "CAMPAIGN_NOT_FOUND",
    "REVISION_MISMATCH",
    "VERSION_MISMATCH",
    "CONSEQUENTIAL_SLOT_COST_REQUIRED",
    "UNSUPPORTED_IMMEDIATE_EFFECT_PROFILE",
    "UNSUPPORTED_CONSEQUENCE_PROFILE",
    "UNSUPPORTED_ESTIMATED_COST",
    "DECISION_SLOTS_RESERVED",
    "INVALID_MANDATORY_RESPONSE",
    "MANDATORY_RESPONSE_SOFTLOCK",
    "INVALID_SIMULATION_RESULT",
  ]),
]);

export const StrategicCommandSimulationInputSchema = z
  .object({
    request: AtomicStrategicCommandRequestSchema,
    currentState: CampaignStateSchema,
  })
  .strict();

export const StrategicCommandSimulationResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("committed"),
        commandId: CommandIdSchema,
        decisionRecord: DecisionRecordSchema,
        nextState: CampaignStateSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("duplicate"),
        commandId: CommandIdSchema,
        decisionRecord: DecisionRecordSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("rejected"),
        commandId: CommandIdSchema.optional(),
        reasonCode: AtomicCommandRejectionReasonSchema,
        detailCode: z.string().trim().min(1).optional(),
      })
      .strict(),
  ],
);

export const AtomicStrategicCommandResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("committed"),
        idempotent: z.literal(false),
        commandId: CommandIdSchema,
        decisionId: DecisionIdSchema,
        decisionSlotCost: z.literal(1),
        campaignRevision: NonNegativeIntegerSchema,
        authoritativeStateHash: AuthoritativeStateHashSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("duplicate"),
        idempotent: z.literal(true),
        commandId: CommandIdSchema,
        decisionId: DecisionIdSchema,
        originalTurn: z.number().int().positive(),
        originalSequenceWithinTurn: z.number().int().positive(),
        campaignRevision: NonNegativeIntegerSchema,
        authoritativeStateHash: AuthoritativeStateHashSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("rejected"),
        idempotent: z.literal(false),
        commandId: CommandIdSchema.optional(),
        reasonCode: AtomicCommandRejectionReasonSchema,
        detailCode: z.string().trim().min(1).optional(),
        campaignRevision: NonNegativeIntegerSchema.optional(),
        authoritativeStateHash: AuthoritativeStateHashSchema.optional(),
      })
      .strict(),
  ],
);

export type SaveSnapshot = z.infer<typeof SaveSnapshotSchema>;
export type AtomicStrategicCommandRequest = z.infer<
  typeof AtomicStrategicCommandRequestSchema
>;
export type AtomicCommandRejectionReason = z.infer<
  typeof AtomicCommandRejectionReasonSchema
>;
export type StrategicCommandSimulationInput = z.infer<
  typeof StrategicCommandSimulationInputSchema
>;
export type StrategicCommandSimulationResult = z.infer<
  typeof StrategicCommandSimulationResultSchema
>;
export type AtomicStrategicCommandResult = z.infer<
  typeof AtomicStrategicCommandResultSchema
>;
