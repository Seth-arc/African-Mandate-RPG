import { z } from "zod";

import {
  ActorIdSchema,
  CampaignIdSchema,
  CollectionTaskIdSchema,
  CommitmentIdSchema,
  DisputeIdSchema,
  InstitutionIdSchema,
  MemoryIdSchema,
} from "./ids.js";
import {
  CollectionOutcomeSchema,
  type CollectionOutcome,
} from "./knowledge-operations.js";
import { EvidenceRecordSchema } from "./knowledge-state.js";
import { SubjectRefSchema } from "./references.js";
import {
  IsoDateSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
} from "./scalars.js";

export const NARRATIVE_CONTRACT_VERSION = "1.0.0" as const;
export const NARRATIVE_FORMAT_VERSION = "plain-text-v1" as const;
export const NARRATIVE_POLICY_VERSION = "test-only-policy-v1" as const;
export const NARRATIVE_TEMPLATE_VERSION =
  "test-only-collection-template-v1" as const;

export const SemanticContextHashSchema = z
  .string()
  .regex(/^[0-9a-f]{64}$/u)
  .brand<"SemanticContextHash">();

const hasUnsafeToken = (value: string): boolean =>
  value.includes("<") ||
  value.includes(">") ||
  value.includes('"') ||
  value.includes("“") ||
  value.includes("”") ||
  [...value].some((character) => character.charCodeAt(0) < 32);

const hasUnsafePlainText = (value: string): boolean =>
  value.includes("<") ||
  value.includes(">") ||
  value.includes('"') ||
  value.includes("“") ||
  value.includes("”") ||
  [...value].some(
    (character) => character !== "\n" && character.charCodeAt(0) < 32,
  );

const PlainTextSchema = z
  .string()
  .min(1)
  .refine((value) => !hasUnsafePlainText(value), {
    message:
      "Narrative plain text must not contain markup delimiters, direct-quotation marks, or unsupported controls",
  });

const EnglishLanguageSchema = z.literal("en");

export const NarrativePerspectiveSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("player_office") }).strict(),
  z
    .object({
      kind: z.literal("actor"),
      actorId: ActorIdSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("institution"),
      institutionId: InstitutionIdSchema,
    })
    .strict(),
]);

export const NarrativeSemanticStateSchema = z
  .object({
    stanceCode: NonEmptyStringSchema.optional(),
    toneProfileId: NonEmptyStringSchema,
    knownMemoryIds: z.array(MemoryIdSchema),
    knownCommitmentIds: z.array(CommitmentIdSchema),
    knownDisputeIds: z.array(DisputeIdSchema),
    allowedClaimIds: z.array(NonEmptyStringSchema),
  })
  .strict();

export const NarrativeContextSchema = z
  .object({
    narrativeContextId: NonEmptyStringSchema,
    perspective: NarrativePerspectiveSchema,
    turn: PositiveIntegerSchema,
    subjectRefs: z.array(SubjectRefSchema),
    semanticState: NarrativeSemanticStateSchema,
    prohibitedClaimCodes: z.array(NonEmptyStringSchema),
  })
  .strict();

export const NarrativeRequestIdentitySchema = z
  .object({
    campaignId: CampaignIdSchema,
    sourceCampaignRevision: NonNegativeIntegerSchema,
    semanticContextHash: SemanticContextHashSchema,
    language: EnglishLanguageSchema,
    narrativePolicyVersion: z.literal(NARRATIVE_POLICY_VERSION),
    templateVersion: z.literal(NARRATIVE_TEMPLATE_VERSION),
  })
  .strict();

const claimTokens = (
  claim: z.infer<typeof EvidenceRecordSchema>["claim"],
): readonly string[] => {
  switch (claim.kind) {
    case "scalar":
      return [claim.metric, ...(claim.unit === undefined ? [] : [claim.unit])];
    case "range":
      return [claim.metric, ...(claim.unit === undefined ? [] : [claim.unit])];
    case "category":
      return [claim.category, claim.value];
    case "boolean":
      return [claim.proposition];
    case "entity_relation":
      return [claim.relation];
    case "text_claim":
      return [claim.claimCode];
  }
};

export const CollectionNarrativeTemplateInputSchema = z
  .object({
    templateKind: z.literal("collection_outcome"),
    collectionTaskId: CollectionTaskIdSchema,
    outcome: CollectionOutcomeSchema,
    responseDate: IsoDateSchema,
    evidence: z.array(EvidenceRecordSchema),
    remainingGapQuestionCode: NonEmptyStringSchema.optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    const count = input.evidence.length;
    const evidenceRequired: readonly CollectionOutcome[] = [
      "useful",
      "partial",
      "contested",
    ];
    if (evidenceRequired.includes(input.outcome) && count === 0) {
      ctx.addIssue({
        code: "custom",
        message: `${input.outcome} requires player-visible evidence`,
        path: ["evidence"],
      });
    }
    if (input.outcome === "contested" && count < 2) {
      ctx.addIssue({
        code: "custom",
        message:
          "contested requires at least two player-visible evidence records",
        path: ["evidence"],
      });
    }
    if (
      ["inconclusive", "delayed", "failed"].includes(input.outcome) &&
      count !== 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${input.outcome} must not invent new evidence`,
        path: ["evidence"],
      });
    }
    if (
      ["partial", "contested", "inconclusive", "delayed", "failed"].includes(
        input.outcome,
      ) &&
      input.remainingGapQuestionCode === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${input.outcome} requires the remaining scoped gap`,
        path: ["remainingGapQuestionCode"],
      });
    }

    const ids = new Set<string>();
    input.evidence.forEach((evidence, index) => {
      if (ids.has(evidence.evidenceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate evidence ID: ${evidence.evidenceId}`,
          path: ["evidence", index, "evidenceId"],
        });
      }
      ids.add(evidence.evidenceId);
      if (evidence.observedDate === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Narrative evidence requires an observed date",
          path: ["evidence", index, "observedDate"],
        });
      }
      if (
        (evidence.claim.kind === "scalar" || evidence.claim.kind === "range") &&
        evidence.claim.unit === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Narrative numeric claims require a unit",
          path: ["evidence", index, "claim", "unit"],
        });
      }
      claimTokens(evidence.claim).forEach((token) => {
        if (hasUnsafeToken(token)) {
          ctx.addIssue({
            code: "custom",
            message: "Narrative claim tokens must be plain text",
            path: ["evidence", index, "claim"],
          });
        }
      });
    });
    if (
      input.remainingGapQuestionCode !== undefined &&
      hasUnsafeToken(input.remainingGapQuestionCode)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Narrative gap codes must be plain text",
        path: ["remainingGapQuestionCode"],
      });
    }
  });

export const NarrativeRequestSchema = z
  .object({
    contractVersion: z.literal(NARRATIVE_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_KNOWLEDGE_SAFE_NARRATIVE"),
    identity: NarrativeRequestIdentitySchema,
    context: NarrativeContextSchema,
    templateInput: CollectionNarrativeTemplateInputSchema,
  })
  .strict()
  .superRefine((request, ctx) => {
    if (request.context.perspective.kind !== "player_office") {
      ctx.addIssue({
        code: "custom",
        message:
          "Prompt 17 templates support only the player-office perspective",
        path: ["context", "perspective"],
      });
    }
    const allowed = new Set(request.context.semanticState.allowedClaimIds);
    request.templateInput.evidence.forEach((evidence, index) => {
      if (!allowed.has(evidence.evidenceId)) {
        ctx.addIssue({
          code: "custom",
          message: `Evidence is not allowed by the narrative context: ${evidence.evidenceId}`,
          path: ["templateInput", "evidence", index, "evidenceId"],
        });
      }
      if (evidence.observedTurn > request.context.turn) {
        ctx.addIssue({
          code: "custom",
          message: "Future evidence cannot enter a player narrative",
          path: ["templateInput", "evidence", index, "observedTurn"],
        });
      }
    });
  });

export const NarrativeResponseSchema = z
  .object({
    text: PlainTextSchema,
    usedClaimIds: z.array(NonEmptyStringSchema),
    referencedMemoryIds: z.array(MemoryIdSchema),
    formatVersion: z.literal(NARRATIVE_FORMAT_VERSION),
  })
  .strict();

export const NarrativeProviderResponseSchema = z
  .object({
    contractVersion: z.literal(NARRATIVE_CONTRACT_VERSION),
    identity: NarrativeRequestIdentitySchema,
    response: NarrativeResponseSchema,
  })
  .strict();

export const NarrativeRenderResultSchema = z
  .object({
    contractVersion: z.literal(NARRATIVE_CONTRACT_VERSION),
    identity: NarrativeRequestIdentitySchema,
    source: z.enum(["deterministic_template", "generated_plain_text"]),
    fallbackReason: z
      .enum([
        "GENERATION_UNAVAILABLE",
        "INVALID_GENERATED_RESPONSE",
        "STALE_RESPONSE_IDENTITY",
        "KNOWLEDGE_BOUNDARY_VIOLATION",
      ])
      .optional(),
    response: NarrativeResponseSchema,
  })
  .strict()
  .superRefine((result, ctx) => {
    if (
      (result.source === "deterministic_template") !==
      (result.fallbackReason !== undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "fallbackReason is required exactly for deterministic fallback",
        path: ["fallbackReason"],
      });
    }
  });

export type SemanticContextHash = z.infer<typeof SemanticContextHashSchema>;
export type NarrativePerspective = z.infer<typeof NarrativePerspectiveSchema>;
export type NarrativeContext = z.infer<typeof NarrativeContextSchema>;
export type NarrativeRequestIdentity = z.infer<
  typeof NarrativeRequestIdentitySchema
>;
export type CollectionNarrativeTemplateInput = z.infer<
  typeof CollectionNarrativeTemplateInputSchema
>;
export type NarrativeRequest = z.infer<typeof NarrativeRequestSchema>;
export type NarrativeResponse = z.infer<typeof NarrativeResponseSchema>;
export type NarrativeProviderResponse = z.infer<
  typeof NarrativeProviderResponseSchema
>;
export type NarrativeRenderResult = z.infer<typeof NarrativeRenderResultSchema>;
