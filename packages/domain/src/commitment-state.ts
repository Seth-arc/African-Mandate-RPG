import { z } from "zod";

import { CommitmentIdSchema, DecisionIdSchema } from "./ids.js";
import { PartyRefSchema } from "./references.js";
import { RuleExpressionSchema } from "./rules.js";
import { NonEmptyStringSchema, PositiveIntegerSchema } from "./scalars.js";

export const COMMITMENT_CONTRACT_VERSION = "1.0.0" as const;

export const CommitmentStatusSchema = z.enum([
  "active",
  "fulfilled",
  "breached",
  "waived",
  "expired",
]);

export const CommitmentRecordSchema = z
  .object({
    commitmentId: CommitmentIdSchema,
    issuer: PartyRefSchema,
    beneficiary: PartyRefSchema,
    createdTurn: PositiveIntegerSchema,
    dueTurn: PositiveIntegerSchema.optional(),
    commitmentType: NonEmptyStringSchema,
    descriptionKey: NonEmptyStringSchema,
    fulfillmentRules: z.array(RuleExpressionSchema),
    status: CommitmentStatusSchema,
    sourceDecisionId: DecisionIdSchema.optional(),
    resolvedTurn: PositiveIntegerSchema.optional(),
  })
  .strict()
  .superRefine((commitment, ctx) => {
    if (
      commitment.dueTurn !== undefined &&
      commitment.dueTurn < commitment.createdTurn
    ) {
      ctx.addIssue({
        code: "custom",
        message: "dueTurn must not precede createdTurn",
        path: ["dueTurn"],
      });
    }
    if (
      (commitment.status === "active") !==
      (commitment.resolvedTurn === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "resolvedTurn is required exactly when status is not active",
        path: ["resolvedTurn"],
      });
    }
    if (
      commitment.resolvedTurn !== undefined &&
      commitment.resolvedTurn < commitment.createdTurn
    ) {
      ctx.addIssue({
        code: "custom",
        message: "resolvedTurn must not precede createdTurn",
        path: ["resolvedTurn"],
      });
    }
  });

export type CommitmentStatus = z.infer<typeof CommitmentStatusSchema>;
export type CommitmentRecord = z.infer<typeof CommitmentRecordSchema>;
