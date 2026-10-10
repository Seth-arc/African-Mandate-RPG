import {
  CampaignStateSchema,
  CollectionResolutionRequestSchema,
  CollectionResolutionResultSchema,
  CollectionTaskIdSchema,
  DecisionIdSchema,
  EvidenceConfidenceRequestSchema,
  EvidenceConfidenceResultSchema,
  EvidenceContradictionSchema,
  KnowledgeClaimLookupResultSchema,
  PlayerKnowledgeProjectionSchema,
  ScoreSchema,
  type CampaignState,
  type CollectionResolutionResult,
  type CollectionTaskTemplate,
  type EvidenceClaim,
  type EvidenceConfidenceResult,
  type EvidenceContradiction,
  type EvidenceRecord,
  type KnowledgeEffectProfile,
  type PlayerKnowledgeProjection,
  type SubjectRef,
} from "@african-mandate/domain";

import { hashCanonicalJson } from "./determinism/canonical-json.js";
import {
  deriveSimulationId,
  roundHalfAwayFromZero,
} from "./determinism/primitives.js";

const claimScope = (claim: EvidenceClaim): string => {
  switch (claim.kind) {
    case "scalar":
    case "range":
      return `${claim.kind}:${claim.metric}:${claim.unit ?? ""}`;
    case "category":
      return `${claim.kind}:${claim.category}`;
    case "boolean":
      return `${claim.kind}:${claim.proposition}`;
    case "entity_relation":
      return `${claim.kind}:${claim.relation}`;
    case "text_claim":
      return `${claim.kind}:${claim.claimCode}`;
  }
};

const referenceInterval = (evidence: EvidenceRecord): string =>
  `turn:${evidence.observedTurn}`;

const sameScope = (left: EvidenceRecord, right: EvidenceRecord): boolean =>
  left.contradictionKey !== undefined &&
  left.contradictionKey === right.contradictionKey &&
  hashCanonicalJson(left.subject) === hashCanonicalJson(right.subject) &&
  claimScope(left.claim) === claimScope(right.claim) &&
  referenceInterval(left) === referenceInterval(right);

const claimsAreIncompatible = (
  left: EvidenceClaim,
  right: EvidenceClaim,
): boolean => {
  if (left.kind !== right.kind) return false;
  switch (left.kind) {
    case "boolean":
      return right.kind === "boolean" && left.value !== right.value;
    case "category":
      return right.kind === "category" && left.value !== right.value;
    case "scalar":
      return right.kind === "scalar" && left.value !== right.value;
    case "range":
      return (
        right.kind === "range" && (left.max < right.min || right.max < left.min)
      );
    case "entity_relation":
    case "text_claim":
      return false;
  }
};

export const findEvidenceContradictions = (
  evidence: readonly EvidenceRecord[],
): readonly EvidenceContradiction[] => {
  const groups = new Map<
    string,
    { readonly contradictionKey: string; readonly evidenceIds: Set<string> }
  >();
  for (let leftIndex = 0; leftIndex < evidence.length; leftIndex += 1) {
    const left = evidence[leftIndex]!;
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < evidence.length;
      rightIndex += 1
    ) {
      const right = evidence[rightIndex]!;
      if (!sameScope(left, right)) continue;
      if (!claimsAreIncompatible(left.claim, right.claim)) continue;
      const groupKey = hashCanonicalJson({
        contradictionKey: left.contradictionKey,
        subject: left.subject,
        claimScope: claimScope(left.claim),
        referenceInterval: referenceInterval(left),
      });
      const group = groups.get(groupKey) ?? {
        contradictionKey: left.contradictionKey!,
        evidenceIds: new Set<string>(),
      };
      group.evidenceIds.add(left.evidenceId);
      group.evidenceIds.add(right.evidenceId);
      groups.set(groupKey, group);
    }
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) =>
      EvidenceContradictionSchema.parse({
        contradictionKey: group.contradictionKey,
        evidenceIds: [...group.evidenceIds].sort(),
      }),
    );
};

export const calculateEffectiveEvidenceConfidence = (
  inputValue: unknown,
): EvidenceConfidenceResult => {
  const input = EvidenceConfidenceRequestSchema.safeParse(inputValue);
  if (!input.success) {
    return EvidenceConfidenceResultSchema.parse({
      status: "unavailable",
      reasonCode: "INVALID_REQUEST_SCHEMA",
    });
  }
  const request = input.data;
  if (request.currentTurn < request.evidence.observedTurn) {
    return EvidenceConfidenceResultSchema.parse({
      status: "unavailable",
      reasonCode: "CURRENT_TURN_PRECEDES_OBSERVATION",
    });
  }
  if (
    request.freshnessProfile.decayProfileId !== request.evidence.decayProfileId
  ) {
    return EvidenceConfidenceResultSchema.parse({
      status: "unavailable",
      reasonCode: "DECAY_PROFILE_MISMATCH",
    });
  }
  const ageTurns = request.currentTurn - request.evidence.observedTurn;
  const factor = request.freshnessProfile.factors.find(
    (candidate) => candidate.ageTurns === ageTurns,
  );
  if (factor === undefined) {
    return EvidenceConfidenceResultSchema.parse({
      status: "unavailable",
      reasonCode: "FRESHNESS_FACTOR_NOT_DEFINED",
    });
  }
  const raw =
    request.evidence.initialConfidence *
    (request.evidence.sourceReliability / 100) *
    (factor.freshness / 100) *
    (request.corroborationModifier / 100) *
    (request.accessCollectionQualityModifier / 100);
  return EvidenceConfidenceResultSchema.parse({
    status: "calculated",
    effectiveConfidence: ScoreSchema.parse(
      Math.min(100, Math.max(0, roundHalfAwayFromZero(raw))),
    ),
    freshness: factor.freshness,
    ageTurns,
    profileVersion: request.freshnessProfile.profileVersion,
  });
};

const sortedValues = <T extends Record<string, unknown>>(
  values: Record<string, T>,
  idField: keyof T,
): T[] =>
  Object.values(values).sort((left, right) =>
    String(left[idField]).localeCompare(String(right[idField])),
  );

export const buildPlayerKnowledgeProjection = (
  state: CampaignState,
): PlayerKnowledgeProjection => {
  const evidence = sortedValues(state.knowledge.evidence, "evidenceId");
  return PlayerKnowledgeProjectionSchema.parse({
    campaignRevision: state.meta.revision,
    knowledge: structuredClone(state.knowledge),
    contradictions: findEvidenceContradictions(evidence),
  });
};

export const lookupPlayerKnowledgeClaim = (
  state: CampaignState,
  subject: SubjectRef,
  claimCode: string,
) => {
  const evidenceIds = Object.values(state.knowledge.evidence)
    .filter(
      (evidence) =>
        hashCanonicalJson(evidence.subject) === hashCanonicalJson(subject) &&
        claimScope(evidence.claim) === claimCode,
    )
    .map((evidence) => evidence.evidenceId)
    .sort();
  return KnowledgeClaimLookupResultSchema.parse(
    evidenceIds.length === 0
      ? { status: "missing", reasonCode: "NO_PLAYER_EVIDENCE" }
      : { status: "known", evidenceIds },
  );
};

export const createCollectionTasksFromKnowledgeProfiles = (
  draft: CampaignState,
  profiles: readonly KnowledgeEffectProfile[],
  templates: readonly CollectionTaskTemplate[],
  effectProfileIds: readonly string[],
  sourceDecisionId: string,
): readonly string[] => {
  const createdTaskIds: string[] = [];
  let ordinal = 0;
  for (const profileId of effectProfileIds) {
    const profile = profiles.find(
      (candidate) => candidate.effectProfileId === profileId,
    );
    if (profile === undefined) {
      throw new TypeError(`Knowledge effect profile not found: ${profileId}`);
    }
    for (const effect of profile.effects) {
      const template = templates.find(
        (candidate) =>
          candidate.collectionTemplateId === effect.collectionTemplateId,
      );
      if (template === undefined) {
        throw new TypeError(
          `Collection template not found: ${effect.collectionTemplateId}`,
        );
      }
      if (
        template.gapId !== undefined &&
        draft.knowledge.intelligenceGaps[template.gapId] === undefined
      ) {
        throw new TypeError(`Collection gap not found: ${template.gapId}`);
      }
      const collectionTaskId = CollectionTaskIdSchema.parse(
        deriveSimulationId({
          entityType: "collection",
          campaignSeed: draft.meta.campaignSeed,
          resolutionKey: `${sourceDecisionId}:${effect.effectId}:${template.collectionTemplateId}`,
          ordinal,
        }),
      );
      ordinal += 1;
      if (draft.knowledge.collectionTasks[collectionTaskId] !== undefined) {
        throw new TypeError(`Duplicate collection task: ${collectionTaskId}`);
      }
      draft.knowledge.collectionTasks[collectionTaskId] = {
        collectionTaskId,
        ...(template.gapId === undefined ? {} : { gapId: template.gapId }),
        subject: template.subject,
        questionCode: template.questionCode,
        collectionChannel: template.collectionChannel,
        requestedTurn: draft.meta.currentTurn,
        dueTurn: draft.meta.currentTurn + template.delayTurns,
        expectedQuality: template.expectedQuality,
        status: "tasked",
        sourceDecisionId: DecisionIdSchema.parse(sourceDecisionId),
      };
      if (template.gapId !== undefined) {
        const gap = draft.knowledge.intelligenceGaps[template.gapId]!;
        gap.status = "tasked";
        delete gap.resolvedTurn;
      }
      createdTaskIds.push(collectionTaskId);
    }
  }
  return createdTaskIds;
};

const rejectResolution = (
  reasonCode: Extract<
    CollectionResolutionResult,
    { status: "rejected" }
  >["reasonCode"],
  detailCode?: string,
): CollectionResolutionResult =>
  CollectionResolutionResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveIntelligenceCollection = (
  inputValue: unknown,
): CollectionResolutionResult => {
  const input = CollectionResolutionRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectResolution("INVALID_REQUEST_SCHEMA");
  const { currentState, plan } = input.data;
  const task = currentState.knowledge.collectionTasks[plan.collectionTaskId];
  if (task === undefined) return rejectResolution("TASK_NOT_FOUND");
  if (task.status !== "tasked" && task.status !== "collecting") {
    return rejectResolution("TASK_NOT_PENDING");
  }
  if (currentState.meta.currentTurn < task.dueTurn) {
    return rejectResolution("TASK_NOT_DUE");
  }
  if (
    plan.outcome === "delayed" &&
    (plan.revisedDueTurn === undefined ||
      plan.revisedDueTurn <= currentState.meta.currentTurn)
  ) {
    return rejectResolution("INVALID_DELAY");
  }

  const draft = structuredClone(currentState);
  const draftTask = draft.knowledge.collectionTasks[plan.collectionTaskId]!;
  for (const emitted of plan.emittedObservations) {
    if (
      emitted.observation.earliestTurn > currentState.meta.currentTurn ||
      emitted.evidence.observedTurn !== currentState.meta.currentTurn
    ) {
      return rejectResolution(
        "OBSERVATION_NOT_ELIGIBLE",
        emitted.observation.observationId,
      );
    }
    if (
      hashCanonicalJson(emitted.observation.subject) !==
        hashCanonicalJson(draftTask.subject) ||
      hashCanonicalJson(emitted.observation.subject) !==
        hashCanonicalJson(emitted.evidence.subject) ||
      hashCanonicalJson(emitted.observation.claim) !==
        hashCanonicalJson(emitted.evidence.claim) ||
      emitted.observation.baseReliability !== emitted.evidence.sourceReliability
    ) {
      return rejectResolution(
        "OBSERVATION_EVIDENCE_MISMATCH",
        emitted.observation.observationId,
      );
    }
    if (draft.knowledge.evidence[emitted.evidence.evidenceId] !== undefined) {
      return rejectResolution(
        "DUPLICATE_EVIDENCE",
        emitted.evidence.evidenceId,
      );
    }
    draft.knowledge.evidence[emitted.evidence.evidenceId] = emitted.evidence;
  }

  if (plan.outcome === "contested") {
    const emittedIds = new Set(
      plan.emittedObservations.map(
        (observation) => observation.evidence.evidenceId,
      ),
    );
    const contradictions = findEvidenceContradictions(
      Object.values(draft.knowledge.evidence),
    );
    if (
      !contradictions.some((contradiction) =>
        contradiction.evidenceIds.some((id) => emittedIds.has(id)),
      )
    ) {
      return rejectResolution("CONTESTED_OUTCOME_NOT_CONTRADICTORY");
    }
  }

  draftTask.status =
    plan.outcome === "failed"
      ? "failed"
      : plan.outcome === "delayed"
        ? "collecting"
        : "completed";
  if (plan.outcome === "delayed") {
    draftTask.dueTurn = plan.revisedDueTurn!;
  }

  let gapStatus:
    "open" | "tasked" | "partially_resolved" | "resolved" | undefined;
  if (draftTask.gapId !== undefined) {
    const gap = draft.knowledge.intelligenceGaps[draftTask.gapId]!;
    if (plan.outcome === "useful") {
      gap.status = "resolved";
      gap.resolvedTurn = currentState.meta.currentTurn;
    } else if (plan.outcome === "partial" || plan.outcome === "contested") {
      gap.status = "partially_resolved";
      delete gap.resolvedTurn;
    } else if (plan.outcome === "delayed") {
      gap.status = "tasked";
      delete gap.resolvedTurn;
    } else {
      gap.status = "open";
      delete gap.resolvedTurn;
    }
    gapStatus = gap.status;
  }

  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectResolution("INVALID_RESULT");
  return CollectionResolutionResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    trace: {
      collectionTaskId: plan.collectionTaskId,
      turn: currentState.meta.currentTurn,
      outcome: plan.outcome,
      taskStatus: draftTask.status,
      ...(gapStatus === undefined ? {} : { gapStatus }),
      emittedEvidenceIds: plan.emittedObservations.map(
        (observation) => observation.evidence.evidenceId,
      ),
    },
  });
};
