import {
  AuthorizationResolutionRequestSchema,
  AuthorizationResolutionResultSchema,
  CampaignStateSchema,
  JsonObjectSchema,
  MANDATE_CONTRACT_VERSION,
  MandateCaseIdSchema,
  MandateCommandPrevalidationRequestSchema,
  MandateCommandPrevalidationResultSchema,
  MandateCommandRequestSchema,
  MandateCommandResultSchema,
  MandateStatusTraceSchema,
  ProjectIdSchema,
  TestOnlyAuthorizationProcedureEntrySchema,
  type AuthorizationResolutionResult,
  type CampaignState,
  type MandateCommandPrevalidationResult,
  type MandateCommandPrevalidationRequest,
  type MandateCommandResult,
  type MandateCommandTerm,
  type TestOnlyAuthorizationProcedureEntry,
} from "@african-mandate/domain";

import { deriveSimulationId } from "./determinism/primitives.js";

type MandateRejectionReason = Extract<
  MandateCommandPrevalidationResult,
  { status: "rejected" }
>["reasonCode"];

const rejectPrevalidation = (
  reasonCode: MandateRejectionReason,
  detailCode?: string,
): MandateCommandPrevalidationResult =>
  MandateCommandPrevalidationResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

const rejectCommand = (
  reasonCode: MandateRejectionReason,
  detailCode?: string,
): MandateCommandResult =>
  MandateCommandResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

const duplicateValue = (values: readonly string[]): string | undefined => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return undefined;
};

const procedureById = (
  procedures: readonly TestOnlyAuthorizationProcedureEntry[],
  authorizationProcedureId: string,
): TestOnlyAuthorizationProcedureEntry | undefined =>
  procedures.find(
    (procedure) =>
      procedure.authorizationProcedureId === authorizationProcedureId,
  );

const prevalidate = (
  input: MandateCommandPrevalidationRequest,
): MandateCommandPrevalidationResult => {
  const duplicateBinding = duplicateValue(
    input.actionBindings.map((binding) => binding.actionId),
  );
  if (duplicateBinding !== undefined) {
    return rejectPrevalidation("DUPLICATE_ACTION_BINDING", duplicateBinding);
  }
  const duplicateConfiguredId = [
    duplicateValue(
      input.caseTemplates.map((template) => template.caseTemplateId),
    ),
    duplicateValue(
      input.scopeNegotiations.map(
        (negotiation) => negotiation.scopeNegotiationId,
      ),
    ),
    duplicateValue(
      input.authorizationProcedures.map(
        (procedure) => procedure.authorizationProcedureId,
      ),
    ),
    duplicateValue(
      input.implementationProfiles.map(
        (profile) => profile.implementationProfileId,
      ),
    ),
  ].find((value) => value !== undefined);
  if (duplicateConfiguredId !== undefined) {
    return rejectPrevalidation(
      "INVALID_RESULT",
      `DUPLICATE_CONFIGURATION_ID:${duplicateConfiguredId}`,
    );
  }
  const binding = input.actionBindings.find(
    (candidate) => candidate.actionId === input.actionId,
  );
  if (binding === undefined) {
    return rejectPrevalidation("ACTION_BINDING_NOT_FOUND", input.actionId);
  }
  if (binding.operation !== input.term.operation) {
    return rejectPrevalidation("COMMAND_OPERATION_MISMATCH");
  }

  const term = input.term;
  if (term.operation === "open_case") {
    const assessment = input.currentState.assessments[term.assessmentId];
    if (assessment === undefined) {
      return rejectPrevalidation("ASSESSMENT_NOT_FOUND", term.assessmentId);
    }
    if (
      assessment.lifecycleStatus !== "adopted" &&
      assessment.lifecycleStatus !== "revised"
    ) {
      return rejectPrevalidation("ASSESSMENT_NOT_ACTIVE", term.assessmentId);
    }
    if (
      Object.values(input.currentState.mandateCases).some((mandateCase) =>
        mandateCase.assessmentIds.includes(term.assessmentId),
      )
    ) {
      return rejectPrevalidation(
        "ASSESSMENT_ALREADY_ESCALATED",
        term.assessmentId,
      );
    }
    const template = input.caseTemplates.find(
      (candidate) => candidate.caseTemplateId === term.caseTemplateId,
    );
    if (template === undefined) {
      return rejectPrevalidation(
        "CASE_TEMPLATE_NOT_FOUND",
        term.caseTemplateId,
      );
    }
    if (!template.allowedHypothesisCodes.includes(assessment.hypothesisCode)) {
      return rejectPrevalidation(
        "ASSESSMENT_NOT_ALLOWED_BY_TEMPLATE",
        assessment.hypothesisCode,
      );
    }
    return MandateCommandPrevalidationResultSchema.parse({ status: "valid" });
  }

  const mandateCase = input.currentState.mandateCases[term.mandateCaseId];
  if (mandateCase === undefined) {
    return rejectPrevalidation("MANDATE_CASE_NOT_FOUND", term.mandateCaseId);
  }
  if (term.operation === "negotiate_scope") {
    if (
      mandateCase.stage !== "assessment_basis" &&
      mandateCase.stage !== "coalition"
    ) {
      return rejectPrevalidation(
        "MANDATE_CASE_STAGE_INVALID",
        mandateCase.stage,
      );
    }
    if (
      input.scopeNegotiations.find(
        (candidate) => candidate.scopeNegotiationId === term.scopeNegotiationId,
      ) === undefined
    ) {
      return rejectPrevalidation(
        "SCOPE_NEGOTIATION_NOT_FOUND",
        term.scopeNegotiationId,
      );
    }
    return MandateCommandPrevalidationResultSchema.parse({ status: "valid" });
  }
  if (term.operation === "request_authorization") {
    if (mandateCase.stage !== "coalition") {
      return rejectPrevalidation(
        "MANDATE_CASE_STAGE_INVALID",
        mandateCase.stage,
      );
    }
    if (mandateCase.authorization.status !== "not_requested") {
      return rejectPrevalidation(
        "AUTHORIZATION_ALREADY_REQUESTED",
        mandateCase.authorization.status,
      );
    }
    if (
      mandateCase.authorizationProcedureId !== term.authorizationProcedureId
    ) {
      return rejectPrevalidation("AUTHORIZATION_PROCEDURE_MISMATCH");
    }
    const procedure = procedureById(
      input.authorizationProcedures,
      term.authorizationProcedureId,
    );
    if (procedure === undefined) {
      return rejectPrevalidation(
        "AUTHORIZATION_PROCEDURE_NOT_FOUND",
        term.authorizationProcedureId,
      );
    }
    if (procedure.availability === "known_missing") {
      return rejectPrevalidation(
        "AUTHORIZATION_PROCEDURE_KNOWN_MISSING",
        procedure.blockerCode,
      );
    }
    return MandateCommandPrevalidationResultSchema.parse({ status: "valid" });
  }
  if (
    mandateCase.stage !== "authorization" ||
    !["authorized", "conditionally_authorized"].includes(
      mandateCase.authorization.status,
    )
  ) {
    return rejectPrevalidation(
      "AUTHORIZATION_NOT_GRANTED",
      mandateCase.authorization.status,
    );
  }
  if (mandateCase.implementationId !== undefined) {
    return rejectPrevalidation(
      "IMPLEMENTATION_ALREADY_EXISTS",
      mandateCase.implementationId,
    );
  }
  const profile = input.implementationProfiles.find(
    (candidate) =>
      candidate.implementationProfileId === term.implementationProfileId,
  );
  if (profile === undefined) {
    return rejectPrevalidation(
      "IMPLEMENTATION_PROFILE_NOT_FOUND",
      term.implementationProfileId,
    );
  }
  if (
    term.capacityAllocated < profile.requiredCapacity ||
    term.capacityAllocated >
      input.currentState.player.institutionalCapacity.implementationCapacity
  ) {
    return rejectPrevalidation(
      "IMPLEMENTATION_CAPACITY_INSUFFICIENT",
      term.implementationProfileId,
    );
  }
  return MandateCommandPrevalidationResultSchema.parse({ status: "valid" });
};

export const prevalidateMandateCommand = (
  inputValue: unknown,
): MandateCommandPrevalidationResult => {
  const input = MandateCommandPrevalidationRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectPrevalidation("INVALID_REQUEST_SCHEMA");
  return prevalidate(input.data);
};

const mandateCaseTargetMatches = (
  state: CampaignState,
  sourceDecisionId: string,
  term: MandateCommandTerm,
): boolean => {
  const decision = state.decisions.find(
    (candidate) => candidate.decisionId === sourceDecisionId,
  );
  if (decision === undefined) return false;
  if (term.operation === "open_case") {
    return decision.targets.some(
      (target) =>
        target.kind === "assessment" &&
        target.assessmentId === term.assessmentId,
    );
  }
  return decision.targets.some(
    (target) =>
      target.kind === "mandate_case" &&
      target.mandateCaseId === term.mandateCaseId,
  );
};

const domainEventIdFor = (
  state: CampaignState,
  sourceDecisionId: string,
  transition: string,
): string =>
  deriveSimulationId({
    entityType: "domain_event",
    campaignSeed: state.meta.campaignSeed,
    resolutionKey: `mandate:${sourceDecisionId}:${transition}`,
    ordinal: 0,
  });

const pushMandateEvent = (
  state: CampaignState,
  domainEventId: string,
  sourceDecisionId: (typeof state.decisions)[number]["decisionId"],
  mandateCaseId: typeof MandateCaseIdSchema._output,
  eventType: string,
  payload: CampaignState["domainEvents"][number]["payload"],
): void => {
  state.domainEvents.push({
    domainEventId,
    turn: state.meta.currentTurn,
    eventType,
    aggregateType: "mandate_case",
    aggregateId: mandateCaseId,
    sourceDecisionId,
    payload,
  });
};

export const resolveMandateCommand = (
  inputValue: unknown,
): MandateCommandResult => {
  const input = MandateCommandRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectCommand("INVALID_REQUEST_SCHEMA");
  const sourceDecision = input.data.currentState.decisions.find(
    (candidate) => candidate.decisionId === input.data.sourceDecisionId,
  );
  if (sourceDecision === undefined) {
    return rejectCommand(
      "SOURCE_DECISION_NOT_FOUND",
      input.data.sourceDecisionId,
    );
  }
  const validation = prevalidate({
    contractVersion: input.data.contractVersion,
    classification: input.data.classification,
    currentState: input.data.currentState,
    actionId: input.data.actionId,
    actionBindings: input.data.actionBindings,
    caseTemplates: input.data.caseTemplates,
    scopeNegotiations: input.data.scopeNegotiations,
    authorizationProcedures: input.data.authorizationProcedures,
    implementationProfiles: input.data.implementationProfiles,
    term: input.data.term,
  });
  if (validation.status === "rejected") {
    return rejectCommand(validation.reasonCode, validation.detailCode);
  }
  if (
    !mandateCaseTargetMatches(
      input.data.currentState,
      input.data.sourceDecisionId,
      input.data.term,
    )
  ) {
    return rejectCommand("INVALID_RESULT", "COMMAND_TARGET_MISMATCH");
  }

  const draft = structuredClone(input.data.currentState);
  const term = input.data.term;
  if (term.operation === "open_case") {
    const template = input.data.caseTemplates.find(
      (candidate) => candidate.caseTemplateId === term.caseTemplateId,
    )!;
    const mandateCaseId = MandateCaseIdSchema.parse(
      deriveSimulationId({
        entityType: "case",
        campaignSeed: draft.meta.campaignSeed,
        resolutionKey: `mandate:${input.data.sourceDecisionId}:case`,
        ordinal: 0,
      }),
    );
    if (draft.mandateCases[mandateCaseId] !== undefined) {
      return rejectCommand("MANDATE_CASE_ALREADY_EXISTS", mandateCaseId);
    }
    draft.mandateCases[mandateCaseId] = {
      mandateCaseId,
      titleKey: template.titleKey,
      stage: "assessment_basis",
      assessmentIds: [term.assessmentId],
      coalition: {
        members: template.coalitionMembers.map((member) => ({
          ...member,
          joinedTurn: draft.meta.currentTurn,
          lastChangedTurn: draft.meta.currentTurn,
        })),
        supportStrength: template.coalitionSupportStrength,
        cohesion: template.coalitionCohesion,
        outstandingConditionCodes: [...template.outstandingConditionCodes],
      },
      authorizationProcedureId: template.authorizationProcedureId,
      authorization: {
        status: "not_requested",
        requirementStates: [],
        legalScopeCodes: [],
        restrictionCodes: [],
      },
      scope: template.scope,
      objectiveIds: [...template.objectiveIds],
      politicalStrength: template.politicalStrength,
      implementationReadiness: template.implementationReadiness,
      distortionRisk: template.distortionRisk,
      commitmentIds: [],
      openedTurn: draft.meta.currentTurn,
      lastChangedTurn: draft.meta.currentTurn,
    };
    const eventId = domainEventIdFor(
      draft,
      input.data.sourceDecisionId,
      "case_opened",
    );
    pushMandateEvent(
      draft,
      eventId,
      input.data.sourceDecisionId,
      mandateCaseId,
      "mandate_case_opened",
      {
        assessmentId: term.assessmentId,
        caseTemplateId: template.caseTemplateId,
        stage: "assessment_basis",
        authorizationStatus: "not_requested",
      },
    );
    const decision = draft.decisions.find(
      (candidate) => candidate.decisionId === input.data.sourceDecisionId,
    )!;
    decision.assessmentIds = [term.assessmentId];
    decision.mandateCaseId = mandateCaseId;
    decision.createdDomainEventIds.push(eventId);
    return validatedCommandResult(draft, {
      transition: "case_opened",
      mandateCaseId,
      assessmentId: term.assessmentId,
      previousStage: null,
      nextStage: "assessment_basis",
      authorizationStatus: "not_requested",
      implementationStatus: "not_created",
      domainEventId: eventId,
    });
  }

  const mandateCase = draft.mandateCases[term.mandateCaseId]!;
  if (term.operation === "negotiate_scope") {
    const template = input.data.scopeNegotiations.find(
      (candidate) => candidate.scopeNegotiationId === term.scopeNegotiationId,
    )!;
    const previousStage = mandateCase.stage as "assessment_basis" | "coalition";
    const previousScope = structuredClone(mandateCase.scope);
    const previousDistortionRisk = mandateCase.distortionRisk;
    mandateCase.stage = "coalition";
    mandateCase.scope = template.scope;
    mandateCase.coalition = {
      members: template.coalitionMembers.map((member) => ({
        ...member,
        joinedTurn: draft.meta.currentTurn,
        lastChangedTurn: draft.meta.currentTurn,
      })),
      supportStrength: template.coalitionSupportStrength,
      cohesion: template.coalitionCohesion,
      outstandingConditionCodes: [...template.outstandingConditionCodes],
    };
    mandateCase.politicalStrength = template.politicalStrength;
    mandateCase.implementationReadiness = template.implementationReadiness;
    mandateCase.distortionRisk = template.distortionRisk;
    mandateCase.lastChangedTurn = draft.meta.currentTurn;
    const eventId = domainEventIdFor(
      draft,
      input.data.sourceDecisionId,
      "scope_negotiated",
    );
    pushMandateEvent(
      draft,
      eventId,
      input.data.sourceDecisionId,
      mandateCase.mandateCaseId,
      "mandate_scope_negotiated",
      {
        scopeNegotiationId: template.scopeNegotiationId,
        previousScope: JsonObjectSchema.parse(previousScope),
        negotiatedScope: JsonObjectSchema.parse(template.scope),
        previousDistortionRisk,
        nextDistortionRisk: template.distortionRisk,
      },
    );
    sourceDecisionFor(draft, input.data.sourceDecisionId).mandateCaseId =
      mandateCase.mandateCaseId;
    sourceDecisionFor(
      draft,
      input.data.sourceDecisionId,
    ).createdDomainEventIds.push(eventId);
    return validatedCommandResult(draft, {
      transition: "scope_negotiated",
      mandateCaseId: mandateCase.mandateCaseId,
      previousStage,
      nextStage: "coalition",
      previousScope,
      negotiatedScope: template.scope,
      previousDistortionRisk,
      nextDistortionRisk: template.distortionRisk,
      authorizationStatus: "not_requested",
      implementationStatus: "not_created",
      domainEventId: eventId,
    });
  }

  if (term.operation === "request_authorization") {
    const procedure = procedureById(
      input.data.authorizationProcedures,
      term.authorizationProcedureId,
    );
    if (
      procedure === undefined ||
      procedure.availability !== "approved_fixture"
    ) {
      return rejectCommand("AUTHORIZATION_PROCEDURE_KNOWN_MISSING");
    }
    mandateCase.stage = "authorization";
    mandateCase.authorization = {
      status: "pending",
      requirementStates: procedure.definition.requiredRequirements.map(
        (definition, index) => ({
          requirementId: `requirement_${String(index + 1).padStart(2, "0")}`,
          definition,
          status: "pending",
        }),
      ),
      requestedTurn: draft.meta.currentTurn,
      earliestResolutionTurn:
        draft.meta.currentTurn + procedure.definition.leadTimeTurns,
      legalScopeCodes: [],
      restrictionCodes: [],
    };
    mandateCase.lastChangedTurn = draft.meta.currentTurn;
    const eventId = domainEventIdFor(
      draft,
      input.data.sourceDecisionId,
      "authorization_requested",
    );
    pushMandateEvent(
      draft,
      eventId,
      input.data.sourceDecisionId,
      mandateCase.mandateCaseId,
      "mandate_authorization_requested",
      {
        authorizationProcedureId: procedure.authorizationProcedureId,
        fixtureApprovalId: procedure.fixtureApprovalId,
        authorizationStatus: "pending",
        earliestResolutionTurn:
          mandateCase.authorization.earliestResolutionTurn!,
      },
    );
    const decision = sourceDecisionFor(draft, input.data.sourceDecisionId);
    decision.mandateCaseId = mandateCase.mandateCaseId;
    decision.createdDomainEventIds.push(eventId);
    return validatedCommandResult(draft, {
      transition: "authorization_requested",
      mandateCaseId: mandateCase.mandateCaseId,
      previousStage: "coalition",
      nextStage: "authorization",
      authorizationStatus: "pending",
      implementationStatus: "not_created",
      earliestResolutionTurn: mandateCase.authorization.earliestResolutionTurn!,
      domainEventId: eventId,
    });
  }

  const profile = input.data.implementationProfiles.find(
    (candidate) =>
      candidate.implementationProfileId === term.implementationProfileId,
  )!;
  const projectId = ProjectIdSchema.parse(
    deriveSimulationId({
      entityType: "project",
      campaignSeed: draft.meta.campaignSeed,
      resolutionKey: `mandate:${input.data.sourceDecisionId}:implementation`,
      ordinal: 0,
    }),
  );
  mandateCase.stage = "implementation";
  mandateCase.implementationId = projectId;
  mandateCase.lastChangedTurn = draft.meta.currentTurn;
  draft.implementations[projectId] = {
    projectId,
    mandateCaseId: mandateCase.mandateCaseId,
    implementationProfileId: profile.implementationProfileId,
    status: "preparing",
    createdTurn: draft.meta.currentTurn,
    workCompleted: 0,
    workRequired: profile.baseWorkUnits,
    capacityRequired: profile.requiredCapacity,
    capacityAllocated: term.capacityAllocated,
    blockingReasonCodes: [],
    riskIds: [...profile.riskProfileIds],
    milestoneStates: profile.milestoneDefinitions.map((milestone) => ({
      milestoneId: milestone.milestoneId,
      status: "pending",
    })),
  };
  const eventId = domainEventIdFor(
    draft,
    input.data.sourceDecisionId,
    "implementation_launched",
  );
  pushMandateEvent(
    draft,
    eventId,
    input.data.sourceDecisionId,
    mandateCase.mandateCaseId,
    "mandate_implementation_launched",
    {
      projectId,
      implementationProfileId: profile.implementationProfileId,
      status: "preparing",
      capacityAllocated: term.capacityAllocated,
    },
  );
  const decision = sourceDecisionFor(draft, input.data.sourceDecisionId);
  decision.mandateCaseId = mandateCase.mandateCaseId;
  decision.createdDomainEventIds.push(eventId);
  return validatedCommandResult(draft, {
    transition: "implementation_launched",
    mandateCaseId: mandateCase.mandateCaseId,
    projectId,
    previousStage: "authorization",
    nextStage: "implementation",
    authorizationStatus: mandateCase.authorization.status as
      "authorized" | "conditionally_authorized",
    implementationStatus: "preparing",
    domainEventId: eventId,
  });
};

const sourceDecisionFor = (
  state: CampaignState,
  sourceDecisionId: string,
): CampaignState["decisions"][number] => {
  const decision = state.decisions.find(
    (candidate) => candidate.decisionId === sourceDecisionId,
  );
  if (decision === undefined) throw new TypeError("Source decision not found");
  return decision;
};

const validatedCommandResult = (
  draft: CampaignState,
  traceValue: unknown,
): MandateCommandResult => {
  const trace = MandateStatusTraceSchema.safeParse(traceValue);
  const state = CampaignStateSchema.safeParse(draft);
  if (!trace.success || !state.success) {
    return rejectCommand("INVALID_RESULT");
  }
  return MandateCommandResultSchema.parse({
    status: "resolved",
    nextState: state.data,
    trace: trace.data,
  });
};

type AuthorizationRejectionReason = Extract<
  AuthorizationResolutionResult,
  { status: "rejected" }
>["reasonCode"];

const rejectAuthorization = (
  reasonCode: AuthorizationRejectionReason,
  detailCode?: string,
): AuthorizationResolutionResult =>
  AuthorizationResolutionResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveAuthorizationPlan = (
  inputValue: unknown,
): AuthorizationResolutionResult => {
  const input = AuthorizationResolutionRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectAuthorization("INVALID_REQUEST_SCHEMA");
  const mandateCase =
    input.data.currentState.mandateCases[input.data.plan.mandateCaseId];
  if (mandateCase === undefined) {
    return rejectAuthorization(
      "MANDATE_CASE_NOT_FOUND",
      input.data.plan.mandateCaseId,
    );
  }
  if (mandateCase.authorization.status !== "pending") {
    return rejectAuthorization(
      "AUTHORIZATION_NOT_PENDING",
      mandateCase.authorization.status,
    );
  }
  if (
    input.data.plan.resolutionTurn !== input.data.currentState.meta.currentTurn
  ) {
    return rejectAuthorization("TURN_MISMATCH");
  }
  if (
    input.data.plan.resolutionTurn <
    mandateCase.authorization.earliestResolutionTurn!
  ) {
    return rejectAuthorization("AUTHORIZATION_NOT_DUE");
  }
  const procedure = procedureById(
    input.data.authorizationProcedures,
    mandateCase.authorizationProcedureId,
  );
  if (
    procedure === undefined ||
    procedure.availability !== "approved_fixture"
  ) {
    return rejectAuthorization("AUTHORIZATION_PROCEDURE_NOT_APPROVED");
  }
  const allowedGrantors = new Set(procedure.definition.authorityInstitutionIds);
  const unauthorizedGrantor = input.data.plan.grantingInstitutionIds.find(
    (institutionId) => !allowedGrantors.has(institutionId),
  );
  if (unauthorizedGrantor !== undefined) {
    return rejectAuthorization("UNAUTHORIZED_GRANTOR", unauthorizedGrantor);
  }
  const providedGrantors = new Set(input.data.plan.grantingInstitutionIds);
  const missingGrantor = procedure.requiredGrantingInstitutionIds.find(
    (institutionId) => !providedGrantors.has(institutionId),
  );
  if (missingGrantor !== undefined) {
    return rejectAuthorization("REQUIRED_GRANTOR_MISSING", missingGrantor);
  }
  const requirementIds = mandateCase.authorization.requirementStates.map(
    (requirement) => requirement.requirementId,
  );
  const resolvedIds = input.data.plan.requirementResolutions.map(
    (requirement) => requirement.requirementId,
  );
  if (
    requirementIds.length !== resolvedIds.length ||
    requirementIds.some((requirementId) => !resolvedIds.includes(requirementId))
  ) {
    return rejectAuthorization("REQUIREMENT_SET_MISMATCH");
  }
  const hasFailedRequirement = input.data.plan.requirementResolutions.some(
    (requirement) => requirement.status === "failed",
  );
  if ((input.data.plan.outcome === "rejected") !== hasFailedRequirement) {
    return rejectAuthorization("AUTHORIZATION_OUTCOME_INCONSISTENT");
  }

  const draft = structuredClone(input.data.currentState);
  const draftCase = draft.mandateCases[input.data.plan.mandateCaseId]!;
  draftCase.authorization.status = input.data.plan.outcome;
  draftCase.authorization.resolvedTurn = input.data.plan.resolutionTurn;
  draftCase.authorization.legalScopeCodes = [
    ...input.data.plan.legalScopeCodes,
  ];
  draftCase.authorization.restrictionCodes = [
    ...input.data.plan.restrictionCodes,
  ];
  if (input.data.plan.expiryTurn !== undefined) {
    draftCase.authorization.expiryTurn = input.data.plan.expiryTurn;
  }
  draftCase.authorization.requirementStates =
    draftCase.authorization.requirementStates.map((requirement) => {
      const resolution = input.data.plan.requirementResolutions.find(
        (candidate) => candidate.requirementId === requirement.requirementId,
      )!;
      return {
        ...requirement,
        status: resolution.status,
        ...(resolution.status === "satisfied"
          ? { satisfiedTurn: input.data.plan.resolutionTurn }
          : {}),
      };
    });
  draftCase.lastChangedTurn = input.data.plan.resolutionTurn;
  const domainEventId = deriveSimulationId({
    entityType: "domain_event",
    campaignSeed: draft.meta.campaignSeed,
    resolutionKey: `authorization:${input.data.plan.resolutionPlanId}`,
    ordinal: 0,
  });
  draft.domainEvents.push({
    domainEventId,
    turn: input.data.plan.resolutionTurn,
    eventType: "mandate_authorization_resolved",
    aggregateType: "mandate_case",
    aggregateId: draftCase.mandateCaseId,
    payload: {
      authorizationProcedureId: procedure.authorizationProcedureId,
      fixtureApprovalId: procedure.fixtureApprovalId,
      authorizationStatus: input.data.plan.outcome,
      grantingInstitutionIds: input.data.plan.grantingInstitutionIds,
      legalScopeCodes: input.data.plan.legalScopeCodes,
      restrictionCodes: input.data.plan.restrictionCodes,
    },
  });
  const state = CampaignStateSchema.safeParse(draft);
  if (!state.success) return rejectAuthorization("INVALID_RESULT");
  return AuthorizationResolutionResultSchema.parse({
    status: "resolved",
    nextState: state.data,
    trace: {
      transition: "authorization_resolved",
      mandateCaseId: draftCase.mandateCaseId,
      previousStage: "authorization",
      nextStage: "authorization",
      previousAuthorizationStatus: "pending",
      authorizationStatus: input.data.plan.outcome,
      implementationStatus: "not_created",
      resolvedTurn: input.data.plan.resolutionTurn,
      grantingInstitutionIds: input.data.plan.grantingInstitutionIds,
      domainEventId,
    },
  });
};

export const parseAuthorizationProcedureEntries = (
  values: readonly unknown[],
): readonly TestOnlyAuthorizationProcedureEntry[] =>
  values.map((value) => TestOnlyAuthorizationProcedureEntrySchema.parse(value));

export { MANDATE_CONTRACT_VERSION };
