import { z } from "zod";

import {
  ActionIdSchema,
  ActorIdSchema,
  AssessmentIdSchema,
  CampaignIdSchema,
  CommitmentIdSchema,
  ConsequenceIdSchema,
  DecisionIdSchema,
  DisputeIdSchema,
  InstitutionIdSchema,
  MandateCaseIdSchema,
  MemoryIdSchema,
  PositionIdSchema,
  ProjectIdSchema,
  RedLineIdSchema,
  RelationshipIdSchema,
  SituationIdSchema,
  WorldEventIdSchema,
} from "./ids.js";
import { JsonObjectSchema } from "./json.js";
import { SubjectRefSchema } from "./references.js";
import {
  IsoDateSchema,
  MoneyAmountSchema,
  NonEmptyStringSchema,
  NonNegativeIntegerSchema,
  PositiveIntegerSchema,
  ScoreSchema,
} from "./scalars.js";
import { DoctrineDeltaSchema } from "./scenario.js";
import { CampaignVersionsSchema } from "./versions.js";
import {
  AttentionStateSchema,
  ScheduledConsequenceSchema,
  SituationStateSchema,
} from "./lifecycle-state.js";
import {
  InstitutionRuntimeStateSchema,
  WorldRuntimeStateSchema,
} from "./world-state.js";
import { PlayerKnowledgeStateSchema } from "./knowledge-state.js";
import {
  ActorRuntimeStateSchema,
  MemoryRecordSchema,
  PositionStateSchema,
  RedLineStateSchema,
  RelationshipStateSchema,
} from "./actor-state.js";
import { AssessmentStateSchema } from "./assessment-state.js";

export const CampaignMetaSchema = z
  .object({
    campaignId: CampaignIdSchema,
    scenarioId: NonEmptyStringSchema,
    campaignSeed: NonEmptyStringSchema,
    difficultyProfileId: NonEmptyStringSchema,
    currentTurn: PositiveIntegerSchema,
    maxTurns: PositiveIntegerSchema,
    currentDate: IsoDateSchema,
    decisionsRemaining: NonNegativeIntegerSchema,
    decisionsPerTurn: PositiveIntegerSchema,
    revision: NonNegativeIntegerSchema,
    status: z.enum(["active", "completed", "terminated", "invalid"]),
    terminationReasonCode: NonEmptyStringSchema.optional(),
  })
  .strict()
  .superRefine((meta, ctx) => {
    if (meta.currentTurn > meta.maxTurns) {
      ctx.addIssue({
        code: "custom",
        message: "currentTurn must not exceed maxTurns",
        path: ["currentTurn"],
      });
    }
    if (meta.decisionsRemaining > meta.decisionsPerTurn) {
      ctx.addIssue({
        code: "custom",
        message: "decisionsRemaining must not exceed decisionsPerTurn",
        path: ["decisionsRemaining"],
      });
    }
  });

export const EnvoyStateSchema = z
  .object({
    representedInstitutionId: InstitutionIdSchema,
    materialResources: z
      .object({
        budget: MoneyAmountSchema,
        personnel: NonNegativeIntegerSchema,
        logistics: ScoreSchema,
      })
      .strict(),
    institutionalCapacity: z
      .object({
        mandateAuthority: ScoreSchema,
        politicalCapital: ScoreSchema,
        secretariatCapacity: ScoreSchema,
        memberStateAlignment: ScoreSchema,
        partnerConfidence: ScoreSchema,
        implementationCapacity: ScoreSchema,
        intelligenceConfidence: ScoreSchema,
      })
      .strict(),
  })
  .strict();

export const DomainEventRecordSchema = z
  .object({
    domainEventId: NonEmptyStringSchema,
    turn: PositiveIntegerSchema,
    eventType: NonEmptyStringSchema,
    aggregateType: NonEmptyStringSchema,
    aggregateId: NonEmptyStringSchema,
    sourceDecisionId: DecisionIdSchema.optional(),
    sourceWorldEventId: WorldEventIdSchema.optional(),
    sourceConsequenceId: ConsequenceIdSchema.optional(),
    payload: JsonObjectSchema,
  })
  .strict();

export const DecisionRecordSchema = z
  .object({
    decisionId: DecisionIdSchema,
    commandId: NonEmptyStringSchema,
    turn: PositiveIntegerSchema,
    sequenceWithinTurn: PositiveIntegerSchema,
    actionId: ActionIdSchema,
    targets: z.array(SubjectRefSchema),
    assessmentIds: z.array(AssessmentIdSchema),
    mandateCaseId: MandateCaseIdSchema.optional(),
    decisionSlotCost: NonNegativeIntegerSchema,
    createdDomainEventIds: z.array(NonEmptyStringSchema),
    createdConsequenceIds: z.array(ConsequenceIdSchema),
    doctrineDelta: DoctrineDeltaSchema,
  })
  .strict();

export const CampaignStateSchema = z
  .object({
    meta: CampaignMetaSchema,
    player: EnvoyStateSchema,
    world: WorldRuntimeStateSchema,
    institutions: z.record(InstitutionIdSchema, InstitutionRuntimeStateSchema),
    actors: z.record(ActorIdSchema, ActorRuntimeStateSchema),
    relationships: z.record(RelationshipIdSchema, RelationshipStateSchema),
    positions: z.record(PositionIdSchema, PositionStateSchema),
    memories: z.record(MemoryIdSchema, MemoryRecordSchema),
    commitments: z.record(CommitmentIdSchema, JsonObjectSchema),
    redLines: z.record(RedLineIdSchema, RedLineStateSchema),
    disputes: z.record(DisputeIdSchema, JsonObjectSchema),
    knowledge: PlayerKnowledgeStateSchema,
    assessments: z.record(AssessmentIdSchema, AssessmentStateSchema),
    mandateCases: z.record(MandateCaseIdSchema, JsonObjectSchema),
    implementations: z.record(ProjectIdSchema, JsonObjectSchema),
    worldEvents: z.record(WorldEventIdSchema, JsonObjectSchema),
    situations: z.record(SituationIdSchema, SituationStateSchema),
    attention: AttentionStateSchema,
    scheduledConsequences: z.record(
      ConsequenceIdSchema,
      ScheduledConsequenceSchema,
    ),
    doctrine: JsonObjectSchema,
    evaluation: JsonObjectSchema,
    decisions: z.array(DecisionRecordSchema),
    domainEvents: z.array(DomainEventRecordSchema),
    processedCommandIds: z.record(z.string(), z.literal(true)),
    versions: CampaignVersionsSchema,
  })
  .strict()
  .superRefine((state, ctx) => {
    const partyExists = (
      party:
        | { readonly kind: "actor"; readonly actorId: string }
        | { readonly kind: "institution"; readonly institutionId: string },
    ): boolean =>
      party.kind === "actor"
        ? party.actorId in state.actors
        : party.institutionId in state.institutions;
    const partyKey = (
      party:
        | { readonly kind: "actor"; readonly actorId: string }
        | { readonly kind: "institution"; readonly institutionId: string },
    ): string =>
      party.kind === "actor"
        ? `actor:${party.actorId}`
        : `institution:${party.institutionId}`;
    const addKeyMismatch = (
      registry: Record<string, Record<string, unknown>>,
      idField: string,
      path: string,
    ): void => {
      for (const [key, value] of Object.entries(registry)) {
        if (value[idField] !== key) {
          ctx.addIssue({
            code: "custom",
            message: `${path} key must match ${idField}`,
            path: [path, key, idField],
          });
        }
      }
    };

    addKeyMismatch(state.actors, "actorId", "actors");
    addKeyMismatch(state.relationships, "relationshipId", "relationships");
    addKeyMismatch(state.positions, "positionId", "positions");
    addKeyMismatch(state.memories, "memoryId", "memories");
    addKeyMismatch(state.redLines, "redLineId", "redLines");
    addKeyMismatch(state.assessments, "assessmentId", "assessments");

    for (const [key, institution] of Object.entries(state.institutions)) {
      if (institution.institutionId !== key) {
        ctx.addIssue({
          code: "custom",
          message: "institution key must match institutionId",
          path: ["institutions", key, "institutionId"],
        });
      }
      institution.activeCommitmentIds.forEach((commitmentId, index) => {
        if (state.commitments[commitmentId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "institution commitment must reference a commitment",
            path: ["institutions", key, "activeCommitmentIds", index],
          });
        }
      });
      institution.activeDisputeIds.forEach((disputeId, index) => {
        if (state.disputes[disputeId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "institution dispute must reference a dispute",
            path: ["institutions", key, "activeDisputeIds", index],
          });
        }
      });
    }
    for (const [actorId, actor] of Object.entries(state.actors)) {
      actor.issuePositionIds.forEach((positionId, index) => {
        const position = state.positions[positionId];
        if (
          position === undefined ||
          position.holder.kind !== "actor" ||
          position.holder.actorId !== actorId
        ) {
          ctx.addIssue({
            code: "custom",
            message: "actor position must reference a position held by actor",
            path: ["actors", actorId, "issuePositionIds", index],
          });
        }
      });
      actor.memoryIds.forEach((memoryId, index) => {
        const memory = state.memories[memoryId];
        if (
          memory === undefined ||
          memory.owner.kind !== "actor" ||
          memory.owner.actorId !== actorId
        ) {
          ctx.addIssue({
            code: "custom",
            message: "actor memory must reference a memory owned by actor",
            path: ["actors", actorId, "memoryIds", index],
          });
        }
      });
      actor.commitmentIds.forEach((commitmentId, index) => {
        if (state.commitments[commitmentId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "actor commitment must reference a commitment",
            path: ["actors", actorId, "commitmentIds", index],
          });
        }
      });
      actor.redLineIds.forEach((redLineId, index) => {
        const redLine = state.redLines[redLineId];
        if (
          redLine === undefined ||
          redLine.holder.kind !== "actor" ||
          redLine.holder.actorId !== actorId
        ) {
          ctx.addIssue({
            code: "custom",
            message: "actor red line must reference a red line held by actor",
            path: ["actors", actorId, "redLineIds", index],
          });
        }
      });
      actor.disputeIds.forEach((disputeId, index) => {
        if (state.disputes[disputeId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "actor dispute must reference a dispute",
            path: ["actors", actorId, "disputeIds", index],
          });
        }
      });
    }
    const relationshipDirections = new Set<string>();
    for (const [relationshipId, relationship] of Object.entries(
      state.relationships,
    )) {
      if (!partyExists(relationship.source)) {
        ctx.addIssue({
          code: "custom",
          message: "relationship source must reference a party",
          path: ["relationships", relationshipId, "source"],
        });
      }
      if (!partyExists(relationship.target)) {
        ctx.addIssue({
          code: "custom",
          message: "relationship target must reference a party",
          path: ["relationships", relationshipId, "target"],
        });
      }
      const directionKey = `${partyKey(relationship.source)}->${partyKey(
        relationship.target,
      )}`;
      if (relationshipDirections.has(directionKey)) {
        ctx.addIssue({
          code: "custom",
          message: "relationship direction must be unique",
          path: ["relationships", relationshipId],
        });
      }
      relationshipDirections.add(directionKey);
    }
    for (const [positionId, position] of Object.entries(state.positions)) {
      if (!partyExists(position.holder)) {
        ctx.addIssue({
          code: "custom",
          message: "position holder must reference a party",
          path: ["positions", positionId, "holder"],
        });
      }
      if (
        position.subject.kind === "assessment" &&
        state.assessments[position.subject.id] === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "position subject must reference an assessment",
          path: ["positions", positionId, "subject", "id"],
        });
      }
      if (
        position.subject.kind === "mandate_case" &&
        state.mandateCases[position.subject.id] === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "position subject must reference a mandate case",
          path: ["positions", positionId, "subject", "id"],
        });
      }
    }
    for (const [memoryId, memory] of Object.entries(state.memories)) {
      if (!partyExists(memory.owner)) {
        ctx.addIssue({
          code: "custom",
          message: "memory owner must reference a party",
          path: ["memories", memoryId, "owner"],
        });
      }
      if (
        memory.sourceDecisionId !== undefined &&
        !state.decisions.some(
          (decision) => decision.decisionId === memory.sourceDecisionId,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: "memory sourceDecisionId must reference a decision",
          path: ["memories", memoryId, "sourceDecisionId"],
        });
      }
      if (
        memory.sourceDomainEventId !== undefined &&
        !state.domainEvents.some(
          (event) => event.domainEventId === memory.sourceDomainEventId,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: "memory sourceDomainEventId must reference a domain event",
          path: ["memories", memoryId, "sourceDomainEventId"],
        });
      }
    }
    for (const [redLineId, redLine] of Object.entries(state.redLines)) {
      if (!partyExists(redLine.holder)) {
        ctx.addIssue({
          code: "custom",
          message: "red-line holder must reference a party",
          path: ["redLines", redLineId, "holder"],
        });
      }
    }
    for (const [assessmentId, assessment] of Object.entries(
      state.assessments,
    )) {
      assessment.supportingEvidenceIds.forEach((evidenceId, index) => {
        if (state.knowledge.evidence[evidenceId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "assessment support must reference player evidence",
            path: ["assessments", assessmentId, "supportingEvidenceIds", index],
          });
        }
      });
      assessment.contradictoryEvidenceIds.forEach((evidenceId, index) => {
        if (state.knowledge.evidence[evidenceId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "assessment contradiction must reference player evidence",
            path: [
              "assessments",
              assessmentId,
              "contradictoryEvidenceIds",
              index,
            ],
          });
        }
      });
      assessment.intelligenceGapIds.forEach((gapId, index) => {
        if (state.knowledge.intelligenceGaps[gapId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "assessment gap must reference player knowledge",
            path: ["assessments", assessmentId, "intelligenceGapIds", index],
          });
        }
      });
      if (
        assessment.revisedFromAssessmentId !== undefined &&
        state.assessments[assessment.revisedFromAssessmentId] === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "revised assessment must reference its predecessor",
          path: ["assessments", assessmentId, "revisedFromAssessmentId"],
        });
      }
    }
    for (const [taskId, task] of Object.entries(
      state.knowledge.collectionTasks,
    )) {
      if (
        !state.decisions.some(
          (decision) => decision.decisionId === task.sourceDecisionId,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: "collection task sourceDecisionId must reference a decision",
          path: ["knowledge", "collectionTasks", taskId, "sourceDecisionId"],
        });
      }
    }
    for (const [reportId, report] of Object.entries(state.knowledge.reports)) {
      report.relatedAssessmentIds.forEach((assessmentId, index) => {
        if (state.assessments[assessmentId] === undefined) {
          ctx.addIssue({
            code: "custom",
            message: "knowledge report assessment must reference an assessment",
            path: [
              "knowledge",
              "reports",
              reportId,
              "relatedAssessmentIds",
              index,
            ],
          });
        }
      });
    }
    for (const commitmentId of state.knowledge.knownCommitmentIds) {
      if (state.commitments[commitmentId] === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "known commitment must reference a commitment",
          path: ["knowledge", "knownCommitmentIds"],
        });
      }
    }
    for (const disputeId of state.knowledge.knownDisputeIds) {
      if (state.disputes[disputeId] === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "known dispute must reference a dispute",
          path: ["knowledge", "knownDisputeIds"],
        });
      }
    }
    for (const redLineId of Object.keys(state.knowledge.redLineKnowledge)) {
      if (!(redLineId in state.redLines)) {
        ctx.addIssue({
          code: "custom",
          message: "red-line knowledge must reference a red line",
          path: ["knowledge", "redLineKnowledge", redLineId],
        });
      }
    }
    for (const positionId of Object.keys(state.knowledge.positionKnowledge)) {
      if (!(positionId in state.positions)) {
        ctx.addIssue({
          code: "custom",
          message: "position knowledge must reference a position",
          path: ["knowledge", "positionKnowledge", positionId],
        });
      }
    }
    for (const relationshipId of Object.keys(
      state.knowledge.relationshipKnowledge,
    )) {
      if (!(relationshipId in state.relationships)) {
        ctx.addIssue({
          code: "custom",
          message: "relationship knowledge must reference a relationship",
          path: ["knowledge", "relationshipKnowledge", relationshipId],
        });
      }
    }
    for (const [key, situation] of Object.entries(state.situations)) {
      if (situation.situationId !== key) {
        ctx.addIssue({
          code: "custom",
          message: "situation key must match situationId",
          path: ["situations", key, "situationId"],
        });
      }
    }
    for (const [key, consequence] of Object.entries(
      state.scheduledConsequences,
    )) {
      if (consequence.consequenceId !== key) {
        ctx.addIssue({
          code: "custom",
          message: "consequence key must match consequenceId",
          path: ["scheduledConsequences", key, "consequenceId"],
        });
      }
    }
  });

export type CampaignMeta = z.infer<typeof CampaignMetaSchema>;
export type EnvoyState = z.infer<typeof EnvoyStateSchema>;
export type DomainEventRecord = z.infer<typeof DomainEventRecordSchema>;
export type DecisionRecord = z.infer<typeof DecisionRecordSchema>;
export type CampaignState = z.infer<typeof CampaignStateSchema>;
