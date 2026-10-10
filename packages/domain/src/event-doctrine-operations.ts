import { z } from "zod";

import { CampaignStateSchema } from "./campaign.js";
import {
  ConsequenceIdSchema,
  DecisionIdSchema,
  EventDefinitionIdSchema,
  SituationIdSchema,
  WorldEventIdSchema,
} from "./ids.js";
import { AttentionLevelSchema, EventFamilySchema } from "./lifecycle-state.js";
import { SubjectRefSchema } from "./references.js";
import { FactDefinitionSchema, KnownFactObservationSchema } from "./rules.js";
import { EventDefinitionSchema } from "./scenario.js";
import { NonEmptyStringSchema, PositiveIntegerSchema } from "./scalars.js";

export const EVENT_DOCTRINE_CONTRACT_VERSION = "1.0.0" as const;

export const EventCauseRefSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("baseline"),
      baselineRef: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("world_dynamic"),
      subsystem: z.enum([
        "conflict",
        "civilian",
        "infrastructure",
        "development",
        "external_environment",
      ]),
      subjectRefs: z.array(SubjectRefSchema),
    })
    .strict(),
  z
    .object({ kind: z.literal("decision"), decisionId: DecisionIdSchema })
    .strict(),
  z
    .object({
      kind: z.literal("world_event"),
      worldEventId: WorldEventIdSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("scheduled_consequence"),
      consequenceId: ConsequenceIdSchema,
    })
    .strict(),
]);

export const TestOnlySituationDirectiveSchema = z
  .object({
    situationId: SituationIdSchema,
    situationType: z.enum(["crisis", "opportunity", "strategic_issue"]),
    urgency: AttentionLevelSchema,
    blocking: z.boolean(),
    statusOnOpen: z.enum(["open", "developing", "managed"]),
    statusOnRetrigger: z
      .enum(["open", "developing", "managed", "resolved", "expired"])
      .optional(),
  })
  .strict();

export const TestOnlyEventTriggerPlanSchema = z
  .object({
    planId: NonEmptyStringSchema,
    eventDefinitionId: EventDefinitionIdSchema,
    selectionPolicy: z.literal("all_eligible_by_definition_id"),
    subjectRefs: z.array(SubjectRefSchema),
    causeRefs: z.array(EventCauseRefSchema).min(1),
    situationDirective: TestOnlySituationDirectiveSchema.optional(),
  })
  .strict();

export const DeveloperEventCauseTraceSchema = z
  .object({
    classification: z.literal("DEVELOPER_ONLY_CAUSE_TRACE"),
    planId: NonEmptyStringSchema,
    eventDefinitionId: EventDefinitionIdSchema,
    eligibilityResult: z.enum(["true", "false", "unknown", "not_evaluated"]),
    outcome: z.enum([
      "triggered",
      "ineligible",
      "outside_window",
      "cooldown",
      "occurrence_limit",
      "already_triggered_this_turn",
    ]),
    causeRefs: z.array(EventCauseRefSchema),
    worldEventId: WorldEventIdSchema.optional(),
    domainEventId: NonEmptyStringSchema.optional(),
  })
  .strict();

export const KnowledgeSafeWorldEventSchema = z
  .object({
    worldEventId: WorldEventIdSchema,
    eventDefinitionId: EventDefinitionIdSchema,
    triggeredTurn: PositiveIntegerSchema,
    family: EventFamilySchema,
    subjectRefs: z.array(SubjectRefSchema),
    status: z.enum(["active", "resolved", "expired"]),
  })
  .strict();

export const EventDirectorResolutionRequestSchema = z
  .object({
    contractVersion: z.literal(EVENT_DOCTRINE_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_EVENT_DIRECTOR"),
    currentState: CampaignStateSchema,
    eventDefinitions: z.array(EventDefinitionSchema),
    triggerPlans: z.array(TestOnlyEventTriggerPlanSchema),
    factDefinitions: z.array(FactDefinitionSchema),
    factObservations: z.array(KnownFactObservationSchema),
  })
  .strict();

export const EventDirectorResolutionResultSchema = z.discriminatedUnion(
  "status",
  [
    z
      .object({
        status: z.literal("resolved"),
        nextState: CampaignStateSchema,
        developerCauseTraces: z.array(DeveloperEventCauseTraceSchema),
        knowledgeSafeEvents: z.array(KnowledgeSafeWorldEventSchema),
      })
      .strict(),
    z
      .object({
        status: z.literal("rejected"),
        reasonCode: z.enum([
          "INVALID_REQUEST_SCHEMA",
          "DUPLICATE_EVENT_DEFINITION",
          "DUPLICATE_TRIGGER_PLAN",
          "MISSING_TRIGGER_PLAN",
          "MISSING_EVENT_DEFINITION",
          "UNSUPPORTED_EVENT_EFFECTS",
          "UNKNOWN_ELIGIBILITY",
          "INVALID_CAUSE_REFERENCE",
          "SITUATION_CONFLICT",
          "INVALID_RESULT",
        ]),
        detailCode: NonEmptyStringSchema.optional(),
      })
      .strict(),
  ],
);

export const DoctrineObservationRequestSchema = z
  .object({
    contractVersion: z.literal(EVENT_DOCTRINE_CONTRACT_VERSION),
    classification: z.literal("TEST_ONLY_DOCTRINE_OBSERVATION"),
    currentState: CampaignStateSchema,
  })
  .strict();

export const DoctrineObservationTraceSchema = z
  .object({
    classification: z.literal("TEST_ONLY_DOCTRINE_OBSERVATION_TRACE"),
    sourceDecisionIds: z.array(DecisionIdSchema),
    accumulationMethod: z.literal(
      "sum_declared_signal_then_clamp_signed_score",
    ),
    observed: z
      .object({
        prevention: z.number().int().min(-100).max(100),
        centralization: z.number().int().min(-100).max(100),
        policyOrientation: z.number().int().min(-100).max(100),
        diplomaticStyle: z.number().int().min(-100).max(100),
      })
      .strict(),
  })
  .strict();

export const DoctrineObservationResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("resolved"),
      nextState: CampaignStateSchema,
      trace: DoctrineObservationTraceSchema,
    })
    .strict(),
  z
    .object({
      status: z.literal("rejected"),
      reasonCode: z.enum(["INVALID_REQUEST_SCHEMA", "INVALID_RESULT"]),
    })
    .strict(),
]);

export const DoctrineReviewEligibilitySchema = z
  .object({
    available: z.boolean(),
    earliestTurn: z.literal(5),
    reviewMode: z.literal("observational_only"),
    reasonCode: z.enum([
      "MONTH_5_REACHED",
      "MONTH_5_NOT_REACHED",
      "CAMPAIGN_NOT_ACTIVE",
    ]),
  })
  .strict();

export type EventCauseRef = z.infer<typeof EventCauseRefSchema>;
export type TestOnlySituationDirective = z.infer<
  typeof TestOnlySituationDirectiveSchema
>;
export type TestOnlyEventTriggerPlan = z.infer<
  typeof TestOnlyEventTriggerPlanSchema
>;
export type DeveloperEventCauseTrace = z.infer<
  typeof DeveloperEventCauseTraceSchema
>;
export type KnowledgeSafeWorldEvent = z.infer<
  typeof KnowledgeSafeWorldEventSchema
>;
export type EventDirectorResolutionRequest = z.infer<
  typeof EventDirectorResolutionRequestSchema
>;
export type EventDirectorResolutionResult = z.infer<
  typeof EventDirectorResolutionResultSchema
>;
export type DoctrineObservationRequest = z.infer<
  typeof DoctrineObservationRequestSchema
>;
export type DoctrineObservationResult = z.infer<
  typeof DoctrineObservationResultSchema
>;
export type DoctrineReviewEligibility = z.infer<
  typeof DoctrineReviewEligibilitySchema
>;
