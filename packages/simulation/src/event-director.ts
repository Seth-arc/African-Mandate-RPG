import {
  CampaignStateSchema,
  DoctrineObservationRequestSchema,
  DoctrineObservationResultSchema,
  DoctrineReviewEligibilitySchema,
  DoctrineVectorSchema,
  EVENT_DOCTRINE_CONTRACT_VERSION,
  EventDirectorResolutionRequestSchema,
  EventDirectorResolutionResultSchema,
  JsonObjectSchema,
  KnowledgeSafeWorldEventSchema,
  WorldEventIdSchema,
  WorldEventInstanceSchema,
  type CampaignState,
  type DoctrineObservationResult,
  type DoctrineReviewEligibility,
  type EventCauseRef,
  type EventDirectorResolutionResult,
  type KnowledgeSafeWorldEvent,
  type TestOnlyEventTriggerPlan,
  type WorldEventInstance,
} from "@african-mandate/domain";

import {
  FactRegistry,
  KnownFactSource,
  evaluateRule,
} from "./command-rules.js";
import { deriveSimulationId } from "./determinism/primitives.js";

const rejectEvents = (
  reasonCode: Extract<
    EventDirectorResolutionResult,
    { status: "rejected" }
  >["reasonCode"],
  detailCode?: string,
): EventDirectorResolutionResult =>
  EventDirectorResolutionResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

const causeRefExists = (
  state: CampaignState,
  cause: EventCauseRef,
): boolean => {
  switch (cause.kind) {
    case "baseline":
    case "world_dynamic":
      return true;
    case "decision":
      return state.decisions.some(
        (decision) => decision.decisionId === cause.decisionId,
      );
    case "world_event":
      return state.worldEvents[cause.worldEventId] !== undefined;
    case "scheduled_consequence":
      return state.scheduledConsequences[cause.consequenceId] !== undefined;
  }
};

const firstCause = <TKind extends EventCauseRef["kind"]>(
  causes: readonly EventCauseRef[],
  kind: TKind,
): Extract<EventCauseRef, { kind: TKind }> | undefined =>
  causes.find(
    (cause): cause is Extract<EventCauseRef, { kind: TKind }> =>
      cause.kind === kind,
  );

const occurrenceHistory = (
  state: CampaignState,
  eventDefinitionId: string,
): readonly WorldEventInstance[] =>
  Object.values(state.worldEvents)
    .filter((event) => event.eventDefinitionId === eventDefinitionId)
    .sort(
      (left, right) =>
        left.triggeredTurn - right.triggeredTurn ||
        left.worldEventId.localeCompare(right.worldEventId),
    );

const projectWorldEvent = (
  event: WorldEventInstance,
): KnowledgeSafeWorldEvent =>
  KnowledgeSafeWorldEventSchema.parse({
    worldEventId: event.worldEventId,
    eventDefinitionId: event.eventDefinitionId,
    triggeredTurn: event.triggeredTurn,
    family: event.family,
    subjectRefs: event.subjectRefs,
    status: event.status,
  });

export const projectKnowledgeSafeWorldEvents = (
  stateValue: unknown,
): readonly KnowledgeSafeWorldEvent[] => {
  const state = CampaignStateSchema.parse(stateValue);
  return Object.values(state.worldEvents)
    .sort(
      (left, right) =>
        left.triggeredTurn - right.triggeredTurn ||
        left.worldEventId.localeCompare(right.worldEventId),
    )
    .map(projectWorldEvent);
};

const situationConflicts = (
  state: CampaignState,
  plan: TestOnlyEventTriggerPlan,
): boolean => {
  const directive = plan.situationDirective;
  if (directive === undefined) return false;
  const existing = state.situations[directive.situationId];
  if (existing === undefined) return false;
  return (
    existing.situationType !== directive.situationType ||
    JSON.stringify(existing.subjectRefs) !== JSON.stringify(plan.subjectRefs)
  );
};

export const resolveTestOnlyEventDirector = (
  inputValue: unknown,
): EventDirectorResolutionResult => {
  const parsed = EventDirectorResolutionRequestSchema.safeParse(inputValue);
  if (!parsed.success) return rejectEvents("INVALID_REQUEST_SCHEMA");
  const input = parsed.data;

  const definitionIds = input.eventDefinitions.map(
    (definition) => definition.eventDefinitionId,
  );
  if (new Set(definitionIds).size !== definitionIds.length) {
    return rejectEvents("DUPLICATE_EVENT_DEFINITION");
  }
  const planIds = input.triggerPlans.map((plan) => plan.planId);
  const plannedDefinitionIds = input.triggerPlans.map(
    (plan) => plan.eventDefinitionId,
  );
  if (
    new Set(planIds).size !== planIds.length ||
    new Set(plannedDefinitionIds).size !== plannedDefinitionIds.length
  ) {
    return rejectEvents("DUPLICATE_TRIGGER_PLAN");
  }
  if (definitionIds.some((id) => !plannedDefinitionIds.includes(id))) {
    return rejectEvents("MISSING_TRIGGER_PLAN");
  }
  if (plannedDefinitionIds.some((id) => !definitionIds.includes(id))) {
    return rejectEvents("MISSING_EVENT_DEFINITION");
  }
  if (
    input.eventDefinitions.some(
      (definition) =>
        definition.immediateEffectProfileIds.length > 0 ||
        definition.consequenceProfileIds.length > 0,
    )
  ) {
    return rejectEvents("UNSUPPORTED_EVENT_EFFECTS");
  }
  for (const plan of input.triggerPlans) {
    if (
      plan.causeRefs.some((cause) => !causeRefExists(input.currentState, cause))
    ) {
      return rejectEvents("INVALID_CAUSE_REFERENCE", plan.planId);
    }
  }

  let registry: FactRegistry;
  let source: KnownFactSource;
  try {
    registry = new FactRegistry(input.factDefinitions);
    source = new KnownFactSource(input.factObservations);
  } catch {
    return rejectEvents("INVALID_REQUEST_SCHEMA");
  }

  const draft = structuredClone(input.currentState);
  const traces: Extract<
    EventDirectorResolutionResult,
    { status: "resolved" }
  >["developerCauseTraces"] = [];
  const emitted: KnowledgeSafeWorldEvent[] = [];
  const definitions = [...input.eventDefinitions].sort((left, right) =>
    left.eventDefinitionId.localeCompare(right.eventDefinitionId),
  );

  for (const definition of definitions) {
    const plan = input.triggerPlans.find(
      (candidate) =>
        candidate.eventDefinitionId === definition.eventDefinitionId,
    );
    if (plan === undefined) return rejectEvents("MISSING_TRIGGER_PLAN");
    const history = occurrenceHistory(draft, definition.eventDefinitionId);
    const last = history.at(-1);
    const baseTrace = {
      classification: "DEVELOPER_ONLY_CAUSE_TRACE" as const,
      planId: plan.planId,
      eventDefinitionId: definition.eventDefinitionId,
      causeRefs: plan.causeRefs,
    };

    if (
      (definition.earliestTurn !== undefined &&
        draft.meta.currentTurn < definition.earliestTurn) ||
      (definition.latestTurn !== undefined &&
        draft.meta.currentTurn > definition.latestTurn)
    ) {
      traces.push({
        ...baseTrace,
        eligibilityResult: "not_evaluated",
        outcome: "outside_window",
      });
      continue;
    }
    if (last?.triggeredTurn === draft.meta.currentTurn) {
      traces.push({
        ...baseTrace,
        eligibilityResult: "not_evaluated",
        outcome: "already_triggered_this_turn",
      });
      continue;
    }
    if (
      definition.maxOccurrences !== undefined &&
      history.length >= definition.maxOccurrences
    ) {
      traces.push({
        ...baseTrace,
        eligibilityResult: "not_evaluated",
        outcome: "occurrence_limit",
      });
      continue;
    }
    if (
      last !== undefined &&
      definition.cooldownTurns !== undefined &&
      draft.meta.currentTurn - last.triggeredTurn <= definition.cooldownTurns
    ) {
      traces.push({
        ...baseTrace,
        eligibilityResult: "not_evaluated",
        outcome: "cooldown",
      });
      continue;
    }

    let eligibility: "true" | "false" | "unknown";
    try {
      eligibility = evaluateRule(definition.eligibilityRule, registry, {
        scope: "simulation",
        factSource: source,
      });
    } catch {
      return rejectEvents("INVALID_REQUEST_SCHEMA");
    }
    if (eligibility === "unknown") {
      return rejectEvents("UNKNOWN_ELIGIBILITY", definition.eventDefinitionId);
    }
    if (eligibility === "false") {
      traces.push({
        ...baseTrace,
        eligibilityResult: eligibility,
        outcome: "ineligible",
      });
      continue;
    }
    if (situationConflicts(draft, plan)) {
      return rejectEvents("SITUATION_CONFLICT", plan.planId);
    }

    const resolutionKey = `event_director:${draft.meta.currentTurn}:${definition.eventDefinitionId}`;
    const worldEventId = WorldEventIdSchema.parse(
      deriveSimulationId({
        entityType: "worldevent",
        campaignSeed: draft.meta.campaignSeed,
        resolutionKey,
        ordinal: history.length,
      }),
    );
    const domainEventId = deriveSimulationId({
      entityType: "domain_event",
      campaignSeed: draft.meta.campaignSeed,
      resolutionKey,
      ordinal: history.length,
    });
    const sourceDecision = firstCause(plan.causeRefs, "decision");
    const sourceWorldEvent = firstCause(plan.causeRefs, "world_event");
    const sourceConsequence = firstCause(
      plan.causeRefs,
      "scheduled_consequence",
    );
    const event = WorldEventInstanceSchema.parse({
      worldEventId,
      eventDefinitionId: definition.eventDefinitionId,
      triggeredTurn: draft.meta.currentTurn,
      family: definition.family,
      subjectRefs: plan.subjectRefs,
      status: "active" as const,
      ...(sourceDecision === undefined
        ? {}
        : { sourceDecisionId: sourceDecision.decisionId }),
      ...(sourceConsequence === undefined
        ? {}
        : { sourceConsequenceId: sourceConsequence.consequenceId }),
      callbackTags: definition.callbackTagsProduced,
    });
    draft.worldEvents[worldEventId] = event;
    draft.domainEvents.push({
      domainEventId,
      turn: draft.meta.currentTurn,
      eventType: "world_event_triggered",
      aggregateType: "world_event",
      aggregateId: worldEventId,
      ...(sourceDecision === undefined
        ? {}
        : { sourceDecisionId: sourceDecision.decisionId }),
      ...(sourceWorldEvent === undefined
        ? {}
        : { sourceWorldEventId: sourceWorldEvent.worldEventId }),
      ...(sourceConsequence === undefined
        ? {}
        : { sourceConsequenceId: sourceConsequence.consequenceId }),
      payload: JsonObjectSchema.parse({
        eventDefinitionId: definition.eventDefinitionId,
        developerOnlyCauseRefs: plan.causeRefs,
      }),
    });

    const directive = plan.situationDirective;
    if (directive !== undefined) {
      const existing = draft.situations[directive.situationId];
      if (existing === undefined) {
        draft.situations[directive.situationId] = {
          situationId: directive.situationId,
          situationType: directive.situationType,
          subjectRefs: plan.subjectRefs,
          relatedWorldEventIds: [worldEventId],
          openedTurn: draft.meta.currentTurn,
          urgency: directive.urgency,
          status: directive.statusOnOpen,
          blocking: directive.blocking,
        };
      } else {
        existing.relatedWorldEventIds.push(worldEventId);
        if (directive.statusOnRetrigger !== undefined) {
          existing.status = directive.statusOnRetrigger;
        }
        existing.urgency = directive.urgency;
        existing.blocking = directive.blocking;
      }
    }

    emitted.push(projectWorldEvent(event));
    traces.push({
      ...baseTrace,
      eligibilityResult: eligibility,
      outcome: "triggered",
      worldEventId,
      domainEventId,
    });
  }

  const validation = CampaignStateSchema.safeParse(draft);
  if (!validation.success) return rejectEvents("INVALID_RESULT");
  return EventDirectorResolutionResultSchema.parse({
    status: "resolved",
    nextState: validation.data,
    developerCauseTraces: traces,
    knowledgeSafeEvents: emitted,
  });
};

const clampSignedScore = (value: number): number =>
  Math.max(-100, Math.min(100, value));

export const resolveDoctrineObservation = (
  inputValue: unknown,
): DoctrineObservationResult => {
  const parsed = DoctrineObservationRequestSchema.safeParse(inputValue);
  if (!parsed.success) {
    return DoctrineObservationResultSchema.parse({
      status: "rejected",
      reasonCode: "INVALID_REQUEST_SCHEMA",
    });
  }
  const state = parsed.data.currentState;
  const totals = {
    prevention: 0,
    centralization: 0,
    policyOrientation: 0,
    diplomaticStyle: 0,
  };
  for (const decision of state.decisions) {
    for (const axis of Object.keys(totals) as (keyof typeof totals)[]) {
      totals[axis] += decision.doctrineDelta[axis] ?? 0;
    }
  }
  if (Object.values(totals).some((value) => !Number.isInteger(value))) {
    return DoctrineObservationResultSchema.parse({
      status: "rejected",
      reasonCode: "INVALID_RESULT",
    });
  }
  const observed = DoctrineVectorSchema.parse({
    prevention: clampSignedScore(totals.prevention),
    centralization: clampSignedScore(totals.centralization),
    policyOrientation: clampSignedScore(totals.policyOrientation),
    diplomaticStyle: clampSignedScore(totals.diplomaticStyle),
  });
  const draft = structuredClone(state);
  draft.doctrine.observed = observed;
  const validation = CampaignStateSchema.safeParse(draft);
  if (!validation.success) {
    return DoctrineObservationResultSchema.parse({
      status: "rejected",
      reasonCode: "INVALID_RESULT",
    });
  }
  return DoctrineObservationResultSchema.parse({
    status: "resolved",
    nextState: validation.data,
    trace: {
      classification: "TEST_ONLY_DOCTRINE_OBSERVATION_TRACE",
      sourceDecisionIds: state.decisions.map((decision) => decision.decisionId),
      accumulationMethod: "sum_declared_signal_then_clamp_signed_score",
      observed,
    },
  });
};

export const evaluateDoctrineReviewEligibility = (
  stateValue: unknown,
): DoctrineReviewEligibility => {
  const state = CampaignStateSchema.parse(stateValue);
  const active = state.meta.status === "active";
  const available = active && state.meta.currentTurn >= 5;
  return DoctrineReviewEligibilitySchema.parse({
    available,
    earliestTurn: 5,
    reviewMode: "observational_only",
    reasonCode: !active
      ? "CAMPAIGN_NOT_ACTIVE"
      : available
        ? "MONTH_5_REACHED"
        : "MONTH_5_NOT_REACHED",
  });
};

export { EVENT_DOCTRINE_CONTRACT_VERSION };
