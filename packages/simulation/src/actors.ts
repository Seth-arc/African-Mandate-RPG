import {
  ActorAdaptationRequestSchema,
  ActorAdaptationResultSchema,
  CampaignStateSchema,
  DirectionalRelationshipLookupResultSchema,
  MemoryCreationRequestSchema,
  MemoryCreationResultSchema,
  MemoryIdSchema,
  RedLineDiscoveryRequestSchema,
  RedLineDiscoveryResultSchema,
  ScoreSchema,
  SignedScoreSchema,
  type ActorAdaptationProfile,
  type ActorAdaptationResult,
  type ActorMemoryEffectProfile,
  type CampaignState,
  type DirectionalRelationshipLookupResult,
  type DecisionId,
  type MemoryCreationResult,
  type MemoryCreationTrace,
  type MemoryRelationshipEffects,
  type PartyRef,
  type RelationshipId,
  type SubjectRef,
  type TestOnlyMemoryTemplate,
} from "@african-mandate/domain";

import { hashCanonicalJson } from "./determinism/canonical-json.js";
import { deriveSimulationId } from "./determinism/primitives.js";

const sameParty = (left: PartyRef, right: PartyRef): boolean =>
  hashCanonicalJson(left) === hashCanonicalJson(right);

const subjectMatchesParty = (subject: SubjectRef, party: PartyRef): boolean =>
  (subject.kind === "actor" &&
    party.kind === "actor" &&
    subject.actorId === party.actorId) ||
  (subject.kind === "institution" &&
    party.kind === "institution" &&
    subject.institutionId === party.institutionId);

const boundedScore = (value: number) =>
  ScoreSchema.parse(Math.min(100, Math.max(0, value)));

const boundedSignedScore = (value: number) =>
  SignedScoreSchema.parse(Math.min(100, Math.max(-100, value)));

class ActorResolutionError extends Error {
  public constructor(
    public readonly reasonCode: string,
    public readonly detailCode?: string,
  ) {
    super(`${reasonCode}:${detailCode ?? ""}`);
  }
}

const applyMemoryRelationshipEffects = (
  state: CampaignState,
  relationshipId: RelationshipId | undefined,
  owner: PartyRef,
  effects: MemoryRelationshipEffects,
): void => {
  if (Object.keys(effects).length === 0) return;
  if (relationshipId === undefined) {
    throw new ActorResolutionError("RELATIONSHIP_NOT_FOUND");
  }
  const relationship = state.relationships[relationshipId];
  if (relationship === undefined) {
    throw new ActorResolutionError("RELATIONSHIP_NOT_FOUND", relationshipId);
  }
  if (!sameParty(relationship.source, owner)) {
    throw new ActorResolutionError(
      "RELATIONSHIP_DIRECTION_MISMATCH",
      relationshipId,
    );
  }
  if (effects.trust !== undefined) {
    relationship.trust = boundedScore(relationship.trust + effects.trust);
  }
  if (effects.strategicAlignment !== undefined) {
    relationship.strategicAlignment = boundedScore(
      relationship.strategicAlignment + effects.strategicAlignment,
    );
  }
  if (effects.credibility !== undefined) {
    relationship.credibility = boundedScore(
      relationship.credibility + effects.credibility,
    );
  }
  relationship.lastChangedTurn = state.meta.currentTurn;
};

const isRepeatedInteraction = (
  state: CampaignState,
  template: TestOnlyMemoryTemplate,
): boolean => {
  const policy = template.repetitionPolicy;
  if (policy === undefined) return false;
  return Object.values(state.memories).some(
    (memory) =>
      sameParty(memory.owner, template.owner) &&
      memory.tags.includes(policy.interactionTag) &&
      state.meta.currentTurn - memory.createdTurn <= policy.cooldownTurns,
  );
};

const applyMemoryProfileToDraft = (
  draft: CampaignState,
  effectProfile: ActorMemoryEffectProfile,
  templates: readonly TestOnlyMemoryTemplate[],
  sourceDecisionId: DecisionId,
): readonly MemoryCreationTrace[] => {
  if (
    !draft.decisions.some(
      (decision) => decision.decisionId === sourceDecisionId,
    )
  ) {
    throw new ActorResolutionError(
      "SOURCE_DECISION_NOT_FOUND",
      sourceDecisionId,
    );
  }
  const traces: MemoryCreationTrace[] = [];
  effectProfile.effects.forEach((effect, ordinal) => {
    const template = templates.find(
      (candidate) => candidate.memoryTemplateId === effect.memoryTemplateId,
    );
    if (template === undefined) {
      throw new ActorResolutionError(
        "TEMPLATE_NOT_FOUND",
        effect.memoryTemplateId,
      );
    }
    const ownerActor =
      template.owner.kind === "actor"
        ? draft.actors[template.owner.actorId]
        : undefined;
    const ownerInstitution =
      template.owner.kind === "institution"
        ? draft.institutions[template.owner.institutionId]
        : undefined;
    if (ownerActor === undefined && ownerInstitution === undefined) {
      throw new ActorResolutionError(
        "OWNER_NOT_FOUND",
        hashCanonicalJson(template.owner),
      );
    }
    const memoryId = MemoryIdSchema.parse(
      deriveSimulationId({
        entityType: "memory",
        campaignSeed: draft.meta.campaignSeed,
        resolutionKey: `${sourceDecisionId}:${effect.effectId}:${template.memoryTemplateId}`,
        ordinal,
      }),
    );
    if (draft.memories[memoryId] !== undefined) {
      throw new ActorResolutionError("MEMORY_ALREADY_EXISTS", memoryId);
    }
    const repeatedInteraction = isRepeatedInteraction(draft, template);
    const relationshipEffects = repeatedInteraction
      ? (template.repetitionPolicy?.repeatRelationshipEffects ?? {})
      : template.firstRelationshipEffects;
    const fatigueDelta = repeatedInteraction
      ? (template.repetitionPolicy?.repeatFatigueDelta ?? 0)
      : template.firstFatigueDelta;

    applyMemoryRelationshipEffects(
      draft,
      template.relationshipId,
      template.owner,
      relationshipEffects,
    );
    if (ownerActor !== undefined) {
      ownerActor.fatigue = boundedScore(ownerActor.fatigue + fatigueDelta);
      ownerActor.memoryIds.push(memoryId);
    }
    draft.memories[memoryId] = {
      memoryId,
      owner: template.owner,
      createdTurn: draft.meta.currentTurn,
      sourceDecisionId,
      memoryType: template.memoryType,
      salience: template.salience,
      persistenceClass: template.persistenceClass,
      tags: [...template.tags],
      originalRelationshipEffects: relationshipEffects,
    };
    traces.push({
      memoryId,
      memoryTemplateId: template.memoryTemplateId,
      repeatedInteraction,
      ...(template.relationshipId === undefined
        ? {}
        : { relationshipId: template.relationshipId }),
      ...(ownerActor === undefined
        ? {}
        : { fatigueActorId: ownerActor.actorId }),
    });
  });
  return traces;
};

const rejectMemoryCreation = (
  reasonCode: Extract<
    MemoryCreationResult,
    { status: "rejected" }
  >["reasonCode"],
  detailCode?: string,
): MemoryCreationResult =>
  MemoryCreationResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveMemoryCreation = (
  inputValue: unknown,
): MemoryCreationResult => {
  const input = MemoryCreationRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectMemoryCreation("INVALID_REQUEST_SCHEMA");
  const draft = structuredClone(input.data.currentState);
  let traces: readonly MemoryCreationTrace[];
  try {
    traces = applyMemoryProfileToDraft(
      draft,
      input.data.effectProfile,
      input.data.templates,
      input.data.sourceDecisionId,
    );
  } catch (error) {
    if (error instanceof ActorResolutionError) {
      return rejectMemoryCreation(
        error.reasonCode as Extract<
          MemoryCreationResult,
          { status: "rejected" }
        >["reasonCode"],
        error.detailCode,
      );
    }
    return rejectMemoryCreation("INVALID_RESULT");
  }
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectMemoryCreation("INVALID_RESULT");
  return MemoryCreationResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    traces,
  });
};

export const createMemoriesFromActorProfiles = (
  draft: CampaignState,
  profiles: readonly ActorMemoryEffectProfile[],
  templates: readonly TestOnlyMemoryTemplate[],
  effectProfileIds: readonly string[],
  sourceDecisionId: DecisionId,
): readonly MemoryCreationTrace[] => {
  const traces: MemoryCreationTrace[] = [];
  for (const profileId of effectProfileIds) {
    const profile = profiles.find(
      (candidate) => candidate.effectProfileId === profileId,
    );
    if (profile === undefined) {
      throw new TypeError(
        `Actor memory effect profile not found: ${profileId}`,
      );
    }
    traces.push(
      ...applyMemoryProfileToDraft(draft, profile, templates, sourceDecisionId),
    );
  }
  return traces;
};

const applyRelationshipEffect = (
  draft: CampaignState,
  actorId: string,
  effect: ActorAdaptationProfile["relationshipEffects"][number],
): void => {
  const relationship = draft.relationships[effect.relationshipId];
  if (relationship === undefined) {
    throw new ActorResolutionError(
      "RELATIONSHIP_NOT_FOUND",
      effect.relationshipId,
    );
  }
  if (
    relationship.source.kind !== "actor" ||
    relationship.source.actorId !== actorId
  ) {
    throw new ActorResolutionError(
      "RELATIONSHIP_DIRECTION_MISMATCH",
      effect.relationshipId,
    );
  }
  if (effect.trustDelta !== undefined) {
    relationship.trust = boundedScore(relationship.trust + effect.trustDelta);
  }
  if (effect.alignmentDelta !== undefined) {
    relationship.strategicAlignment = boundedScore(
      relationship.strategicAlignment + effect.alignmentDelta,
    );
  }
  if (effect.dependenceDelta !== undefined) {
    relationship.sourceDependenceOnTarget = boundedScore(
      relationship.sourceDependenceOnTarget + effect.dependenceDelta,
    );
  }
  if (effect.leverageDelta !== undefined) {
    relationship.sourceLeverageOverTarget = boundedSignedScore(
      relationship.sourceLeverageOverTarget + effect.leverageDelta,
    );
  }
  if (effect.accessDelta !== undefined) {
    relationship.access = boundedScore(
      relationship.access + effect.accessDelta,
    );
  }
  if (effect.credibilityDelta !== undefined) {
    relationship.credibility = boundedScore(
      relationship.credibility + effect.credibilityDelta,
    );
  }
  relationship.lastChangedTurn = draft.meta.currentTurn;
};

const profileEligible = (
  state: CampaignState,
  profile: ActorAdaptationProfile,
): boolean => {
  const actor = state.actors[profile.actorId];
  if (actor === undefined) return false;
  if (
    profile.condition.minFatigue !== undefined &&
    actor.fatigue < profile.condition.minFatigue
  ) {
    return false;
  }
  if (
    profile.condition.maxFatigue !== undefined &&
    actor.fatigue > profile.condition.maxFatigue
  ) {
    return false;
  }
  const memoryTags = new Set(
    actor.memoryIds.flatMap((memoryId) => state.memories[memoryId]?.tags ?? []),
  );
  return profile.condition.requiredMemoryTags.every((tag) =>
    memoryTags.has(tag),
  );
};

const rejectAdaptation = (
  reasonCode: Extract<
    ActorAdaptationResult,
    { status: "rejected" }
  >["reasonCode"],
  detailCode?: string,
): ActorAdaptationResult =>
  ActorAdaptationResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveActorAdaptation = (
  inputValue: unknown,
): ActorAdaptationResult => {
  const input = ActorAdaptationRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectAdaptation("INVALID_REQUEST_SCHEMA");
  const { currentState, plan, profiles } = input.data;
  if (plan.turn !== currentState.meta.currentTurn) {
    return rejectAdaptation("TURN_MISMATCH");
  }
  if (
    new Set(profiles.map((profile) => profile.actorAdaptationProfileId))
      .size !== profiles.length
  ) {
    return rejectAdaptation("DUPLICATE_PROFILE_ID");
  }
  if (
    currentState.domainEvents.some(
      (event) =>
        event.eventType === "test_only_actor_adaptation_applied" &&
        event.payload["adaptationKey"] === plan.adaptationKey,
    )
  ) {
    return rejectAdaptation("ADAPTATION_ALREADY_APPLIED");
  }

  const draft = structuredClone(currentState);
  const traces: Array<{
    actorAdaptationProfileId: string;
    actorId: ActorAdaptationProfile["actorId"];
    outcome: "applied" | "not_eligible";
    changedRelationshipIds: ActorAdaptationProfile["relationshipEffects"][number]["relationshipId"][];
    changedPositionIds: ActorAdaptationProfile["positionEffects"][number]["positionId"][];
  }> = [];
  for (const profileId of plan.profileIds) {
    const profile = profiles.find(
      (candidate) => candidate.actorAdaptationProfileId === profileId,
    );
    if (profile === undefined) {
      return rejectAdaptation("PROFILE_NOT_FOUND", profileId);
    }
    const actor = draft.actors[profile.actorId];
    if (actor === undefined) {
      return rejectAdaptation("ACTOR_NOT_FOUND", profile.actorId);
    }
    if (!profileEligible(draft, profile)) {
      traces.push({
        actorAdaptationProfileId: profile.actorAdaptationProfileId,
        actorId: profile.actorId,
        outcome: "not_eligible",
        changedRelationshipIds: [],
        changedPositionIds: [],
      });
      continue;
    }
    actor.fatigue = boundedScore(actor.fatigue + profile.fatigueDelta);
    if (profile.capabilityDeltas !== undefined) {
      for (const [capability, delta] of Object.entries(
        profile.capabilityDeltas,
      )) {
        if (delta === undefined) continue;
        actor.capabilities[capability as keyof typeof actor.capabilities] =
          boundedScore(
            actor.capabilities[capability as keyof typeof actor.capabilities] +
              delta,
          );
      }
    }
    try {
      profile.relationshipEffects.forEach((effect) =>
        applyRelationshipEffect(draft, profile.actorId, effect),
      );
      profile.positionEffects.forEach((effect) => {
        const position = draft.positions[effect.positionId];
        if (position === undefined) {
          throw new ActorResolutionError(
            "POSITION_NOT_FOUND",
            effect.positionId,
          );
        }
        if (
          position.holder.kind !== "actor" ||
          position.holder.actorId !== profile.actorId
        ) {
          throw new ActorResolutionError(
            "POSITION_HOLDER_MISMATCH",
            effect.positionId,
          );
        }
        position.stance = effect.stance;
        if (effect.intensityDelta !== undefined) {
          position.intensity = boundedScore(
            position.intensity + effect.intensityDelta,
          );
        }
        position.lastChangedTurn = currentState.meta.currentTurn;
      });
    } catch (error) {
      if (error instanceof ActorResolutionError) {
        return rejectAdaptation(
          error.reasonCode as Extract<
            ActorAdaptationResult,
            { status: "rejected" }
          >["reasonCode"],
          error.detailCode,
        );
      }
      return rejectAdaptation("INVALID_RESULT");
    }
    const domainEventId = deriveSimulationId({
      entityType: "domain_event",
      campaignSeed: draft.meta.campaignSeed,
      resolutionKey: `actor_adaptation:${plan.adaptationKey}:${profile.actorAdaptationProfileId}`,
      ordinal: 0,
    });
    draft.domainEvents.push({
      domainEventId,
      turn: currentState.meta.currentTurn,
      eventType: "test_only_actor_adaptation_applied",
      aggregateType: "actor",
      aggregateId: profile.actorId,
      payload: {
        adaptationKey: plan.adaptationKey,
        actorAdaptationProfileId: profile.actorAdaptationProfileId,
      },
    });
    traces.push({
      actorAdaptationProfileId: profile.actorAdaptationProfileId,
      actorId: profile.actorId,
      outcome: "applied",
      changedRelationshipIds: profile.relationshipEffects.map(
        (effect) => effect.relationshipId,
      ),
      changedPositionIds: profile.positionEffects.map(
        (effect) => effect.positionId,
      ),
    });
  }
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectAdaptation("INVALID_RESULT");
  return ActorAdaptationResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    traces,
  });
};

export const discoverRedLine = (inputValue: unknown) => {
  const input = RedLineDiscoveryRequestSchema.safeParse(inputValue);
  if (!input.success) {
    return RedLineDiscoveryResultSchema.parse({
      status: "rejected",
      reasonCode: "INVALID_REQUEST_SCHEMA",
    });
  }
  const { currentState, redLineId, knowledgeStatus, supportingEvidenceIds } =
    input.data;
  const redLine = currentState.redLines[redLineId];
  if (redLine === undefined) {
    return RedLineDiscoveryResultSchema.parse({
      status: "rejected",
      reasonCode: "RED_LINE_NOT_FOUND",
    });
  }
  const missingEvidence = supportingEvidenceIds.find(
    (evidenceId) => currentState.knowledge.evidence[evidenceId] === undefined,
  );
  if (missingEvidence !== undefined) {
    return RedLineDiscoveryResultSchema.parse({
      status: "rejected",
      reasonCode: "EVIDENCE_NOT_FOUND",
      detailCode: missingEvidence,
    });
  }
  const mismatchedEvidence = supportingEvidenceIds.find(
    (evidenceId) =>
      !subjectMatchesParty(
        currentState.knowledge.evidence[evidenceId]!.subject,
        redLine.holder,
      ),
  );
  if (mismatchedEvidence !== undefined) {
    return RedLineDiscoveryResultSchema.parse({
      status: "rejected",
      reasonCode: "EVIDENCE_SCOPE_MISMATCH",
      detailCode: mismatchedEvidence,
    });
  }
  if (
    currentState.knowledge.redLineKnowledge[redLineId] === "known" &&
    knowledgeStatus === "suspected"
  ) {
    return RedLineDiscoveryResultSchema.parse({
      status: "rejected",
      reasonCode: "KNOWLEDGE_DOWNGRADE",
    });
  }
  const draft = structuredClone(currentState);
  draft.knowledge.redLineKnowledge[redLineId] = knowledgeStatus;
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) {
    return RedLineDiscoveryResultSchema.parse({
      status: "rejected",
      reasonCode: "INVALID_RESULT",
    });
  }
  return RedLineDiscoveryResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    redLineId,
    knowledgeStatus,
    supportingEvidenceIds,
  });
};

export const findDirectionalRelationship = (
  state: CampaignState,
  source: PartyRef,
  target: PartyRef,
): DirectionalRelationshipLookupResult => {
  const relationship = Object.values(state.relationships).find(
    (candidate) =>
      sameParty(candidate.source, source) &&
      sameParty(candidate.target, target),
  );
  return DirectionalRelationshipLookupResultSchema.parse(
    relationship === undefined
      ? { status: "missing", reasonCode: "DIRECTION_NOT_REGISTERED" }
      : { status: "found", relationship },
  );
};
