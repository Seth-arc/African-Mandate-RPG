import { z } from "zod";

import {
  ActorIdSchema,
  DecisionIdSchema,
  EffectProfileIdSchema,
  EvidenceIdSchema,
  MemoryIdSchema,
  PositionIdSchema,
  RedLineIdSchema,
  RelationshipIdSchema,
} from "./ids.js";
import {
  ACTOR_CONTRACT_VERSION,
  ActorCapabilityStateSchema,
  ActorStanceSchema,
  MemoryRecordSchema,
  MemoryRelationshipEffectsSchema,
  RelationshipStateSchema,
} from "./actor-state.js";
import { CampaignStateSchema } from "./campaign.js";
import { PartyRefSchema } from "./references.js";
import {
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";

export const CreateMemoryEffectSchema = z
  .object({
    effectId: NonEmptyStringSchema,
    kind: z.literal("create_memory"),
    memoryTemplateId: NonEmptyStringSchema,
  })
  .strict();

export const AdjustRelationshipEffectSchema = z
  .object({
    effectId: NonEmptyStringSchema,
    kind: z.literal("adjust_relationship"),
    relationshipId: RelationshipIdSchema,
    trustDelta: z.number().finite().optional(),
    alignmentDelta: z.number().finite().optional(),
    dependenceDelta: z.number().finite().optional(),
    leverageDelta: z.number().finite().optional(),
    accessDelta: z.number().finite().optional(),
    credibilityDelta: z.number().finite().optional(),
  })
  .strict()
  .refine(
    (effect) =>
      effect.trustDelta !== undefined ||
      effect.alignmentDelta !== undefined ||
      effect.dependenceDelta !== undefined ||
      effect.leverageDelta !== undefined ||
      effect.accessDelta !== undefined ||
      effect.credibilityDelta !== undefined,
    { message: "At least one relationship delta is required" },
  );

export const ChangePositionEffectSchema = z
  .object({
    effectId: NonEmptyStringSchema,
    kind: z.literal("change_position"),
    positionId: PositionIdSchema,
    stance: ActorStanceSchema,
    intensityDelta: z.number().finite().optional(),
  })
  .strict();

export const ActorMemoryEffectProfileSchema = z
  .object({
    effectProfileId: EffectProfileIdSchema,
    effects: z.array(CreateMemoryEffectSchema).min(1),
  })
  .strict();

export const TestOnlyMemoryTemplateSchema = z
  .object({
    memoryTemplateId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_MEMORY_TEMPLATE"),
    owner: PartyRefSchema,
    memoryType: MemoryRecordSchema.shape.memoryType,
    salience: ScoreSchema,
    persistenceClass: MemoryRecordSchema.shape.persistenceClass,
    tags: z.array(NonEmptyStringSchema),
    relationshipId: RelationshipIdSchema.optional(),
    firstRelationshipEffects: MemoryRelationshipEffectsSchema,
    firstFatigueDelta: z.number().finite(),
    repetitionPolicy: z
      .object({
        interactionTag: NonEmptyStringSchema,
        cooldownTurns: NonNegativeIntegerSchema,
        repeatRelationshipEffects: MemoryRelationshipEffectsSchema,
        repeatFatigueDelta: z.number().finite(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((template, ctx) => {
    const hasRelationshipEffects =
      Object.keys(template.firstRelationshipEffects).length > 0 ||
      Object.keys(template.repetitionPolicy?.repeatRelationshipEffects ?? {})
        .length > 0;
    if (hasRelationshipEffects && template.relationshipId === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "relationshipId is required for relationship effects",
        path: ["relationshipId"],
      });
    }
    if (
      template.repetitionPolicy !== undefined &&
      !template.tags.includes(template.repetitionPolicy.interactionTag)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "tags must include repetitionPolicy.interactionTag",
        path: ["tags"],
      });
    }
    if (
      template.memoryType === "consultation" &&
      template.repetitionPolicy === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "consultation memories require an explicit repetition policy",
        path: ["repetitionPolicy"],
      });
    }
    if (
      template.owner.kind !== "actor" &&
      (template.firstFatigueDelta !== 0 ||
        (template.repetitionPolicy?.repeatFatigueDelta ?? 0) !== 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "institution-owned memory cannot change actor fatigue",
        path: ["firstFatigueDelta"],
      });
    }
  });

export const MemoryCreationRequestSchema = z
  .object({
    contractVersion: z.literal(ACTOR_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_MEMORY_CREATION"),
    currentState: CampaignStateSchema,
    sourceDecisionId: DecisionIdSchema,
    effectProfile: ActorMemoryEffectProfileSchema,
    templates: z.array(TestOnlyMemoryTemplateSchema).min(1),
  })
  .strict();

export const MemoryCreationTraceSchema = z
  .object({
    memoryId: MemoryIdSchema,
    memoryTemplateId: NonEmptyStringSchema,
    repeatedInteraction: z.boolean(),
    relationshipId: RelationshipIdSchema.optional(),
    fatigueActorId: ActorIdSchema.optional(),
  })
  .strict();

export const MemoryCreationResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      traces: z.array(MemoryCreationTraceSchema),
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "SOURCE_DECISION_NOT_FOUND",
        "TEMPLATE_NOT_FOUND",
        "OWNER_NOT_FOUND",
        "RELATIONSHIP_NOT_FOUND",
        "RELATIONSHIP_DIRECTION_MISMATCH",
        "MEMORY_ALREADY_EXISTS",
        "INVALID_RESULT",
      ]),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

const ActorCapabilityDeltaSchema = ActorCapabilityStateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one capability delta is required" },
);

export const ActorAdaptationProfileSchema = z
  .object({
    actorAdaptationProfileId: NonEmptyStringSchema,
    profileVersion: NonEmptyStringSchema,
    classification: z.literal("TEST_ONLY_ACTOR_ADAPTATION_PROFILE"),
    actorId: ActorIdSchema,
    condition: z
      .object({
        requiredMemoryTags: z.array(NonEmptyStringSchema),
        minFatigue: ScoreSchema.optional(),
        maxFatigue: ScoreSchema.optional(),
      })
      .strict()
      .refine(
        (condition) =>
          condition.minFatigue === undefined ||
          condition.maxFatigue === undefined ||
          condition.minFatigue <= condition.maxFatigue,
        { message: "minFatigue must not exceed maxFatigue" },
      ),
    fatigueDelta: z.number().finite(),
    capabilityDeltas: ActorCapabilityDeltaSchema.optional(),
    relationshipEffects: z.array(AdjustRelationshipEffectSchema),
    positionEffects: z.array(ChangePositionEffectSchema),
  })
  .strict()
  .refine(
    (profile) =>
      profile.fatigueDelta !== 0 ||
      profile.capabilityDeltas !== undefined ||
      profile.relationshipEffects.length > 0 ||
      profile.positionEffects.length > 0,
    { message: "Adaptation profile must declare at least one change" },
  );

export const ActorAdaptationPlanSchema = z
  .object({
    turn: PositiveIntegerSchema,
    adaptationKey: NonEmptyStringSchema,
    profileIds: z.array(NonEmptyStringSchema).min(1),
  })
  .strict()
  .superRefine((plan, ctx) => {
    const seen = new Set<string>();
    plan.profileIds.forEach((profileId, index) => {
      if (seen.has(profileId)) {
        ctx.addIssue({
          code: "custom",
          message: "profileIds must not contain duplicates",
          path: ["profileIds", index],
        });
      }
      seen.add(profileId);
    });
  });

export const ActorAdaptationRequestSchema = z
  .object({
    contractVersion: z.literal(ACTOR_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_ACTOR_ADAPTATION"),
    currentState: CampaignStateSchema,
    profiles: z.array(ActorAdaptationProfileSchema).min(1),
    plan: ActorAdaptationPlanSchema,
  })
  .strict();

export const ActorAdaptationTraceSchema = z
  .object({
    actorAdaptationProfileId: NonEmptyStringSchema,
    actorId: ActorIdSchema,
    outcome: z.enum(["applied", "not_eligible"]),
    changedRelationshipIds: z.array(RelationshipIdSchema),
    changedPositionIds: z.array(PositionIdSchema),
  })
  .strict();

export const ActorAdaptationResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      traces: z.array(ActorAdaptationTraceSchema),
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "TURN_MISMATCH",
        "DUPLICATE_PROFILE_ID",
        "PROFILE_NOT_FOUND",
        "ADAPTATION_ALREADY_APPLIED",
        "ACTOR_NOT_FOUND",
        "RELATIONSHIP_NOT_FOUND",
        "RELATIONSHIP_DIRECTION_MISMATCH",
        "POSITION_NOT_FOUND",
        "POSITION_HOLDER_MISMATCH",
        "INVALID_RESULT",
      ]),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const RedLineDiscoveryRequestSchema = z
  .object({
    contractVersion: z.literal(ACTOR_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_RED_LINE_DISCOVERY"),
    currentState: CampaignStateSchema,
    redLineId: RedLineIdSchema,
    knowledgeStatus: z.enum(["suspected", "known"]),
    supportingEvidenceIds: z.array(EvidenceIdSchema).min(1),
  })
  .strict();

export const RedLineDiscoveryResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      redLineId: RedLineIdSchema,
      knowledgeStatus: z.enum(["suspected", "known"]),
      supportingEvidenceIds: z.array(EvidenceIdSchema).min(1),
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum([
        "INVALID_REQUEST_SCHEMA",
        "RED_LINE_NOT_FOUND",
        "EVIDENCE_NOT_FOUND",
        "EVIDENCE_SCOPE_MISMATCH",
        "KNOWLEDGE_DOWNGRADE",
        "INVALID_RESULT",
      ]),
      detailCode: NonEmptyStringSchema.optional(),
    })
    .strict(),
]);

export const DirectionalRelationshipLookupResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("found"),
        relationship: RelationshipStateSchema,
      })
      .strict(),
    z
      .object({
        status: z.literal("missing"),
        reasonCode: z.literal("DIRECTION_NOT_REGISTERED"),
      })
      .strict(),
  ],
);

export type CreateMemoryEffect = z.infer<typeof CreateMemoryEffectSchema>;
export type AdjustRelationshipEffect = z.infer<
  typeof AdjustRelationshipEffectSchema
>;
export type ChangePositionEffect = z.infer<typeof ChangePositionEffectSchema>;
export type ActorMemoryEffectProfile = z.infer<
  typeof ActorMemoryEffectProfileSchema
>;
export type TestOnlyMemoryTemplate = z.infer<
  typeof TestOnlyMemoryTemplateSchema
>;
export type MemoryCreationRequest = z.infer<typeof MemoryCreationRequestSchema>;
export type MemoryCreationResult = z.infer<typeof MemoryCreationResultSchema>;
export type MemoryCreationTrace = z.infer<typeof MemoryCreationTraceSchema>;
export type ActorAdaptationProfile = z.infer<
  typeof ActorAdaptationProfileSchema
>;
export type ActorAdaptationPlan = z.infer<typeof ActorAdaptationPlanSchema>;
export type ActorAdaptationRequest = z.infer<
  typeof ActorAdaptationRequestSchema
>;
export type ActorAdaptationResult = z.infer<typeof ActorAdaptationResultSchema>;
export type ActorAdaptationTrace = z.infer<typeof ActorAdaptationTraceSchema>;
export type RedLineDiscoveryRequest = z.infer<
  typeof RedLineDiscoveryRequestSchema
>;
export type RedLineDiscoveryResult = z.infer<
  typeof RedLineDiscoveryResultSchema
>;
export type DirectionalRelationshipLookupResult = z.infer<
  typeof DirectionalRelationshipLookupResultSchema
>;
