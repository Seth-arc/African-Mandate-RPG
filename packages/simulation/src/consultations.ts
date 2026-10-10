import {
  CampaignStateSchema,
  CommitmentIdSchema,
  CommitmentResolutionRequestSchema,
  CommitmentResolutionResultSchema,
  ConsultationCommandRequestSchema,
  ConsultationCommandResultSchema,
  ConsultationKnownRiskPreviewSchema,
  ConsultationPackageSchema,
  ConsultationPoliticalConflictRuleSchema,
  EvidenceIdSchema,
  MemoryIdSchema,
  TestOnlyConsultationLegalProfileSchema,
  type CampaignState,
  type CommitmentResolutionResult,
  type CommitmentTransitionTrace,
  type ConsultationCommandResult,
  type ConsultationKnownRiskPreview,
  type ConsultationPackage,
  type ConsultationPoliticalConflictRule,
  type PartyRef,
  type TestOnlyConsultationLegalProfile,
} from "@african-mandate/domain";

import type { StructuralActionValidator } from "./command-rules.js";
import { deriveSimulationId } from "./determinism/primitives.js";

const sameParty = (left: PartyRef, right: PartyRef): boolean =>
  left.kind === right.kind &&
  (left.kind === "actor"
    ? right.kind === "actor" && left.actorId === right.actorId
    : right.kind === "institution" &&
      left.institutionId === right.institutionId);

const subjectToParty = (
  subject: CampaignState["decisions"][number]["targets"][number],
): PartyRef | undefined => {
  if (subject.kind === "actor") {
    return { kind: "actor", actorId: subject.actorId };
  }
  if (subject.kind === "institution") {
    return { kind: "institution", institutionId: subject.institutionId };
  }
  return undefined;
};

const partyExists = (state: CampaignState, party: PartyRef): boolean =>
  party.kind === "actor"
    ? state.actors[party.actorId] !== undefined
    : state.institutions[party.institutionId] !== undefined;

const addCommitmentReference = (
  state: CampaignState,
  party: PartyRef,
  commitmentId: ReturnType<typeof CommitmentIdSchema.parse>,
): void => {
  const ids =
    party.kind === "actor"
      ? state.actors[party.actorId]?.commitmentIds
      : state.institutions[party.institutionId]?.activeCommitmentIds;
  if (ids === undefined) throw new TypeError("Commitment party not found");
  if (!ids.includes(commitmentId)) ids.push(commitmentId);
};

const removeActiveInstitutionCommitmentReference = (
  state: CampaignState,
  party: PartyRef,
  commitmentId: ReturnType<typeof CommitmentIdSchema.parse>,
): void => {
  if (party.kind !== "institution") return;
  const institution = state.institutions[party.institutionId];
  if (institution === undefined) throw new TypeError("Institution not found");
  institution.activeCommitmentIds = institution.activeCommitmentIds.filter(
    (candidate) => candidate !== commitmentId,
  );
};

export const buildConsultationKnownRiskPreview = (
  stateValue: unknown,
  packageValue: unknown,
  rules: readonly ConsultationPoliticalConflictRule[],
): ConsultationKnownRiskPreview => {
  const state = CampaignStateSchema.parse(stateValue);
  const consultationPackage = ConsultationPackageSchema.parse(packageValue);
  const parsedRules = rules.map((rule) =>
    ConsultationPoliticalConflictRuleSchema.parse(rule),
  );
  const warnings: ConsultationKnownRiskPreview["politicalConflictWarnings"] =
    [];
  const proposedType = consultationPackage.commitmentOffer?.commitmentType;
  if (proposedType !== undefined) {
    for (const commitmentId of state.knowledge.knownCommitmentIds) {
      const commitment = state.commitments[commitmentId];
      if (commitment === undefined || commitment.status !== "active") continue;
      for (const rule of parsedRules) {
        if (
          rule.existingCommitmentType === commitment.commitmentType &&
          rule.proposedCommitmentType === proposedType
        ) {
          warnings.push({
            conflictRuleId: rule.conflictRuleId,
            warningCode: rule.warningCode,
            existingCommitmentId: commitment.commitmentId,
            existingBeneficiary: commitment.beneficiary,
          });
        }
      }
    }
  }
  const strategicRiskCodes: string[] = [];
  if (
    consultationPackage.negotiationId === "N1_MONITORING_ACCESS" &&
    consultationPackage.terms.reportingPath === "host_only"
  ) {
    strategicRiskCodes.push("N1_HOST_ONLY_REPORTING_DISTORTION_RISK");
  }
  if (consultationPackage.negotiationId === "N3_CIVILIAN_ACCESS") {
    strategicRiskCodes.push("N3_IMPLEMENTATION_BANDWIDTH_TRADEOFF");
  }
  return ConsultationKnownRiskPreviewSchema.parse({
    classification: "PLAYER_KNOWLEDGE_ONLY_CONSULTATION_PREVIEW",
    politicalConflictWarnings: warnings.sort((left, right) =>
      `${left.conflictRuleId}:${left.existingCommitmentId}`.localeCompare(
        `${right.conflictRuleId}:${right.existingCommitmentId}`,
      ),
    ),
    strategicRiskCodes,
  });
};

const validatePackageAgainstLegalProfile = (
  consultationPackage: ConsultationPackage,
  profile: TestOnlyConsultationLegalProfile,
  implementationCapacity: number,
  submittedTurn: number,
):
  | { readonly status: "valid" }
  | {
      readonly status: "impossible";
      readonly detailCode: string;
    } => {
  if (
    !profile.allowedNegotiationIds.includes(consultationPackage.negotiationId)
  ) {
    return {
      status: "impossible",
      detailCode: "NEGOTIATION_OUTSIDE_TEST_LEGAL_PROFILE",
    };
  }
  if (
    consultationPackage.commitmentOffer?.dueTurn !== undefined &&
    consultationPackage.commitmentOffer.dueTurn <= submittedTurn
  ) {
    return { status: "impossible", detailCode: "DUE_TURN_NOT_FUTURE" };
  }
  if (consultationPackage.negotiationId !== "N1_MONITORING_ACCESS") {
    return { status: "valid" };
  }
  if (
    profile.boundedAllocationRequiresAvailableImplementationCapacity &&
    consultationPackage.terms.resourceCommitment ===
      "bounded_test_allocation" &&
    implementationCapacity === 0
  ) {
    return {
      status: "impossible",
      detailCode: "BOUNDED_ALLOCATION_CAPACITY_UNAVAILABLE",
    };
  }
  const forbidden = profile.forbiddenN1Combinations.find(
    (combination) =>
      combination.technicalLiaisonRole ===
        consultationPackage.terms.technicalLiaisonRole &&
      combination.reportingPath === consultationPackage.terms.reportingPath &&
      combination.resourceCommitment ===
        consultationPackage.terms.resourceCommitment,
  );
  return forbidden === undefined
    ? { status: "valid" }
    : { status: "impossible", detailCode: forbidden.detailCode };
};

export const createConsultationStructuralValidator = (
  legalProfileValues: readonly unknown[],
): StructuralActionValidator => {
  const profiles = legalProfileValues.map((profile) =>
    TestOnlyConsultationLegalProfileSchema.parse(profile),
  );
  if (
    new Set(profiles.map((profile) => profile.legalProfileId)).size !==
    profiles.length
  ) {
    throw new TypeError("Duplicate consultation legal profile ID");
  }
  return ({ command, player }) => {
    if (command.payload.terms.length !== 1) {
      return {
        status: "impossible",
        detailCode: "CONSULTATION_REQUIRES_ONE_COHERENT_PACKAGE",
      };
    }
    const parsedPackage = ConsultationPackageSchema.safeParse(
      command.payload.terms[0],
    );
    if (!parsedPackage.success) {
      return {
        status: "impossible",
        detailCode: "CONSULTATION_PACKAGE_SCHEMA_INVALID",
      };
    }
    const profile = profiles.find(
      (candidate) =>
        candidate.legalProfileId === parsedPackage.data.legalProfileId,
    );
    if (profile === undefined) {
      return {
        status: "impossible",
        detailCode: "CONSULTATION_LEGAL_PROFILE_NOT_FOUND",
      };
    }
    return validatePackageAgainstLegalProfile(
      parsedPackage.data,
      profile,
      player.institutionalCapacity.implementationCapacity,
      command.submittedTurn,
    );
  };
};

const rejectConsultation = (
  reasonCode: Extract<
    ConsultationCommandResult,
    { status: "rejected" }
  >["reasonCode"],
  detailCode?: string,
): ConsultationCommandResult =>
  ConsultationCommandResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveConsultationCommand = (
  inputValue: unknown,
): ConsultationCommandResult => {
  const input = ConsultationCommandRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectConsultation("INVALID_REQUEST_SCHEMA");
  const {
    currentState,
    sourceDecisionId,
    actionId,
    actionBindings,
    legalProfiles,
    responseProfiles,
    politicalConflictRules,
  } = input.data;
  const decision = currentState.decisions.find(
    (candidate) => candidate.decisionId === sourceDecisionId,
  );
  if (decision === undefined) {
    return rejectConsultation("SOURCE_DECISION_NOT_FOUND", sourceDecisionId);
  }
  const binding = actionBindings.find(
    (candidate) => candidate.actionId === actionId,
  );
  if (binding === undefined) {
    return rejectConsultation("ACTION_BINDING_NOT_FOUND", actionId);
  }
  const legalProfile = legalProfiles.find(
    (candidate) =>
      candidate.legalProfileId === input.data.package.legalProfileId,
  );
  if (legalProfile === undefined) {
    return rejectConsultation(
      "LEGAL_PROFILE_NOT_FOUND",
      input.data.package.legalProfileId,
    );
  }
  if (binding.legalProfileId !== legalProfile.legalProfileId) {
    return rejectConsultation("LEGAL_PROFILE_MISMATCH");
  }
  const legalValidation = validatePackageAgainstLegalProfile(
    input.data.package,
    legalProfile,
    currentState.player.institutionalCapacity.implementationCapacity,
    decision.turn,
  );
  if (legalValidation.status === "impossible") {
    return rejectConsultation("HARD_INVALID_TERMS", legalValidation.detailCode);
  }
  const responseProfile = responseProfiles.find(
    (candidate) => candidate.responseProfileId === binding.responseProfileId,
  );
  if (responseProfile === undefined) {
    return rejectConsultation(
      "RESPONSE_PROFILE_NOT_FOUND",
      binding.responseProfileId,
    );
  }
  if (decision.targets.length !== 1) {
    return rejectConsultation("TARGET_NOT_FOUND", "EXPECTED_ONE_TARGET");
  }
  const target = subjectToParty(decision.targets[0]!);
  if (target === undefined || !partyExists(currentState, target)) {
    return rejectConsultation("TARGET_NOT_FOUND");
  }
  const position =
    currentState.positions[input.data.package.responsePositionId];
  if (position === undefined) {
    return rejectConsultation(
      "POSITION_NOT_FOUND",
      input.data.package.responsePositionId,
    );
  }
  if (!sameParty(position.holder, target)) {
    return rejectConsultation("POSITION_TARGET_MISMATCH");
  }

  const responseState = responseProfile.statusByStance[position.stance];
  const draft = structuredClone(currentState);
  const evidenceId = EvidenceIdSchema.parse(
    deriveSimulationId({
      entityType: "evidence",
      campaignSeed: draft.meta.campaignSeed,
      resolutionKey: `consultation:${sourceDecisionId}:response`,
      ordinal: 0,
    }),
  );
  if (draft.knowledge.evidence[evidenceId] !== undefined) {
    return rejectConsultation("INVALID_RESULT", "EVIDENCE_ALREADY_EXISTS");
  }
  draft.knowledge.evidence[evidenceId] = {
    evidenceId,
    subject:
      target.kind === "actor"
        ? { kind: "actor", actorId: target.actorId }
        : { kind: "institution", institutionId: target.institutionId },
    claim: {
      kind: "text_claim",
      claimCode: responseProfile.evidence.claimCodeByResponse[responseState],
    },
    sourceType: "actor_claim",
    sourceParty: target,
    initialConfidence: responseProfile.evidence.initialConfidence,
    sourceReliability: responseProfile.evidence.sourceReliability,
    observedTurn: draft.meta.currentTurn,
    decayProfileId: responseProfile.evidence.decayProfileId,
    reportSensitivity: responseProfile.evidence.reportSensitivity,
  };

  const knownRiskPreview = buildConsultationKnownRiskPreview(
    currentState,
    input.data.package,
    politicalConflictRules,
  );
  let commitmentId: ReturnType<typeof CommitmentIdSchema.parse> | undefined;
  const offer = input.data.package.commitmentOffer;
  if (responseState !== "rejected" && offer !== undefined) {
    commitmentId = CommitmentIdSchema.parse(
      deriveSimulationId({
        entityType: "commitment",
        campaignSeed: draft.meta.campaignSeed,
        resolutionKey: `consultation:${sourceDecisionId}:commitment`,
        ordinal: 0,
      }),
    );
    if (draft.commitments[commitmentId] !== undefined) {
      return rejectConsultation("COMMITMENT_ALREADY_EXISTS", commitmentId);
    }
    const issuer: PartyRef = {
      kind: "institution",
      institutionId: draft.player.representedInstitutionId,
    };
    draft.commitments[commitmentId] = {
      commitmentId,
      issuer,
      beneficiary: target,
      createdTurn: draft.meta.currentTurn,
      ...(offer.dueTurn === undefined ? {} : { dueTurn: offer.dueTurn }),
      commitmentType: offer.commitmentType,
      descriptionKey: offer.descriptionKey,
      fulfillmentRules: offer.fulfillmentRules,
      status: "active",
      sourceDecisionId,
    };
    try {
      addCommitmentReference(draft, issuer, commitmentId);
      if (!sameParty(issuer, target)) {
        addCommitmentReference(draft, target, commitmentId);
      }
    } catch {
      return rejectConsultation("TARGET_NOT_FOUND");
    }
    if (!draft.knowledge.knownCommitmentIds.includes(commitmentId)) {
      draft.knowledge.knownCommitmentIds.push(commitmentId);
    }
  }

  const consultationDomainEventId = deriveSimulationId({
    entityType: "domain_event",
    campaignSeed: draft.meta.campaignSeed,
    resolutionKey: `consultation:${sourceDecisionId}:resolved`,
    ordinal: 0,
  });
  draft.domainEvents.push({
    domainEventId: consultationDomainEventId,
    turn: draft.meta.currentTurn,
    eventType: "consultation_resolved",
    aggregateType: target.kind,
    aggregateId:
      target.kind === "actor" ? target.actorId : target.institutionId,
    sourceDecisionId,
    payload: {
      actionId,
      negotiationId: input.data.package.negotiationId,
      responseState,
      responsePositionId: position.positionId,
      evidenceId,
      ...(commitmentId === undefined ? {} : { commitmentId }),
      politicalConflictWarningCodes:
        knownRiskPreview.politicalConflictWarnings.map(
          (warning) => warning.warningCode,
        ),
      strategicRiskCodes: knownRiskPreview.strategicRiskCodes,
    },
  });
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectConsultation("INVALID_RESULT");
  return ConsultationCommandResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    trace: {
      actionId,
      sourceDecisionId,
      target,
      responsePositionId: position.positionId,
      stanceAtCommit: position.stance,
      responseState,
      evidenceId,
      ...(commitmentId === undefined ? {} : { commitmentId }),
      consultationDomainEventId,
      knownRiskPreview,
    },
  });
};

const rejectCommitmentResolution = (
  reasonCode: Extract<
    CommitmentResolutionResult,
    { status: "rejected" }
  >["reasonCode"],
  detailCode?: string,
): CommitmentResolutionResult =>
  CommitmentResolutionResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveDueCommitments = (
  inputValue: unknown,
): CommitmentResolutionResult => {
  const input = CommitmentResolutionRequestSchema.safeParse(inputValue);
  if (!input.success)
    return rejectCommitmentResolution("INVALID_REQUEST_SCHEMA");
  const { currentState, turn, profiles } = input.data;
  if (turn !== currentState.meta.currentTurn) {
    return rejectCommitmentResolution("TURN_MISMATCH");
  }
  if (
    new Set(profiles.map((profile) => profile.commitmentType)).size !==
    profiles.length
  ) {
    return rejectCommitmentResolution("DUPLICATE_PROFILE_TYPE");
  }
  const draft = structuredClone(currentState);
  const transitions: CommitmentTransitionTrace[] = [];
  const dueCommitments = Object.values(draft.commitments)
    .filter(
      (commitment) =>
        commitment.status === "active" &&
        commitment.dueTurn !== undefined &&
        commitment.dueTurn <= turn,
    )
    .sort((left, right) => left.commitmentId.localeCompare(right.commitmentId));

  for (const commitment of dueCommitments) {
    const profile = profiles.find(
      (candidate) => candidate.commitmentType === commitment.commitmentType,
    );
    if (profile === undefined) {
      return rejectCommitmentResolution(
        "PROFILE_NOT_FOUND",
        commitment.commitmentType,
      );
    }
    const domainEventId = deriveSimulationId({
      entityType: "domain_event",
      campaignSeed: draft.meta.campaignSeed,
      resolutionKey: `commitment:${commitment.commitmentId}:${profile.dueOutcome}`,
      ordinal: 0,
    });
    const callbackOwner =
      profile.callback.owner === "issuer"
        ? commitment.issuer
        : commitment.beneficiary;
    if (!partyExists(draft, callbackOwner)) {
      return rejectCommitmentResolution(
        "CALLBACK_OWNER_NOT_FOUND",
        commitment.commitmentId,
      );
    }
    const memoryId = MemoryIdSchema.parse(
      deriveSimulationId({
        entityType: "memory",
        campaignSeed: draft.meta.campaignSeed,
        resolutionKey: `commitment:${commitment.commitmentId}:${profile.dueOutcome}:callback`,
        ordinal: 0,
      }),
    );
    if (draft.memories[memoryId] !== undefined) {
      return rejectCommitmentResolution("CALLBACK_ALREADY_EXISTS", memoryId);
    }

    commitment.status = profile.dueOutcome;
    commitment.resolvedTurn = turn;
    removeActiveInstitutionCommitmentReference(
      draft,
      commitment.issuer,
      commitment.commitmentId,
    );
    if (!sameParty(commitment.issuer, commitment.beneficiary)) {
      removeActiveInstitutionCommitmentReference(
        draft,
        commitment.beneficiary,
        commitment.commitmentId,
      );
    }
    draft.domainEvents.push({
      domainEventId,
      turn,
      eventType: `commitment_${profile.dueOutcome}`,
      aggregateType: "commitment",
      aggregateId: commitment.commitmentId,
      ...(commitment.sourceDecisionId === undefined
        ? {}
        : { sourceDecisionId: commitment.sourceDecisionId }),
      payload: {
        commitmentId: commitment.commitmentId,
        previousStatus: "active",
        nextStatus: profile.dueOutcome,
      },
    });
    draft.memories[memoryId] = {
      memoryId,
      owner: callbackOwner,
      createdTurn: turn,
      sourceDomainEventId: domainEventId,
      memoryType: profile.callback.memoryType,
      salience: profile.callback.salience,
      persistenceClass: profile.callback.persistenceClass,
      tags: [...profile.callback.tags],
      originalRelationshipEffects: {},
    };
    if (callbackOwner.kind === "actor") {
      draft.actors[callbackOwner.actorId]!.memoryIds.push(memoryId);
    }
    transitions.push({
      commitmentId: commitment.commitmentId,
      previousStatus: "active",
      nextStatus: profile.dueOutcome,
      resolvedTurn: turn,
      domainEventId,
      memoryId,
    });
  }
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectCommitmentResolution("INVALID_RESULT");
  return CommitmentResolutionResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    transitions,
  });
};
