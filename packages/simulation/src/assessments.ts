import {
  ASSESSMENT_CONTRACT_VERSION,
  AssessmentCommandResolutionRequestSchema,
  AssessmentCommandResolutionResultSchema,
  AssessmentIdSchema,
  AssessmentMetadataRecalculationRequestSchema,
  AssessmentMetadataRecalculationResultSchema,
  AssessmentWorkspaceRequestSchema,
  AssessmentWorkspaceResultSchema,
  CampaignStateSchema,
  type AssessmentCommandResolutionResult,
  type AssessmentConfidenceBandProfile,
  type AssessmentId,
  type AssessmentMetadataProfile,
  type AssessmentMetadataRecalculationResult,
  type AssessmentWorkspaceResult,
  type AssessmentWorkspaceState,
  type AssessmentSelection,
  type AuthoredAssessmentHypothesis,
  type CampaignState,
  type EvidenceId,
  type SubjectRef,
} from "@african-mandate/domain";

import { hashCanonicalJson } from "./determinism/canonical-json.js";
import { deriveSimulationId } from "./determinism/primitives.js";
import { findEvidenceContradictions } from "./knowledge.js";

type AssessmentRejectionReason = Extract<
  AssessmentWorkspaceResult,
  { status: "rejected" }
>["reasonCode"];

class AssessmentResolutionError extends Error {
  public constructor(
    public readonly reasonCode: AssessmentRejectionReason,
    public readonly detailCode?: string,
  ) {
    super(`${reasonCode}:${detailCode ?? ""}`);
  }
}

const rejectWorkspace = (
  reasonCode: AssessmentRejectionReason,
  detailCode?: string,
): AssessmentWorkspaceResult =>
  AssessmentWorkspaceResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

const duplicateHypothesisCode = (
  hypotheses: readonly AuthoredAssessmentHypothesis[],
): string | undefined => {
  const seen = new Set<string>();
  for (const hypothesis of hypotheses) {
    if (seen.has(hypothesis.hypothesisCode)) return hypothesis.hypothesisCode;
    seen.add(hypothesis.hypothesisCode);
  }
  return undefined;
};

const metadataScore = (
  entries: AssessmentMetadataProfile["supportScores"],
  count: number,
): AssessmentMetadataProfile["supportScores"][number]["score"] => {
  const entry = entries.find((candidate) => candidate.count === count);
  if (entry === undefined) {
    throw new AssessmentResolutionError(
      "METADATA_FACTOR_NOT_DEFINED",
      String(count),
    );
  }
  return entry.score;
};

const relevantContradictoryEvidenceIds = (
  state: CampaignState,
  hypothesis: AuthoredAssessmentHypothesis,
): EvidenceId[] => {
  const relevantKeys = new Set(hypothesis.relevantContradictionKeys);
  return [
    ...new Set(
      findEvidenceContradictions(Object.values(state.knowledge.evidence))
        .filter(
          (contradiction) =>
            relevantKeys.has(contradiction.contradictionKey) &&
            contradiction.evidenceIds.every((evidenceId) =>
              subjectsMatch(
                state.knowledge.evidence[evidenceId]!.subject,
                hypothesis.subject,
              ),
            ),
        )
        .flatMap((contradiction) => contradiction.evidenceIds),
    ),
  ].sort();
};

const subjectsMatch = (left: SubjectRef, right: SubjectRef): boolean =>
  hashCanonicalJson(left) === hashCanonicalJson(right);

const buildWorkspace = (
  state: CampaignState,
  hypotheses: readonly AuthoredAssessmentHypothesis[],
  confidenceProfile: AssessmentConfidenceBandProfile,
  metadataProfile: AssessmentMetadataProfile,
  selection: AssessmentSelection,
): AssessmentWorkspaceState => {
  const duplicateCode = duplicateHypothesisCode(hypotheses);
  if (duplicateCode !== undefined) {
    throw new AssessmentResolutionError(
      "DUPLICATE_HYPOTHESIS_CODE",
      duplicateCode,
    );
  }
  const hypothesis = hypotheses.find(
    (candidate) => candidate.hypothesisCode === selection.hypothesisCode,
  );
  if (hypothesis === undefined) {
    throw new AssessmentResolutionError(
      "HYPOTHESIS_NOT_FOUND",
      selection.hypothesisCode,
    );
  }
  const relevantEvidenceIds = new Set(hypothesis.relevantEvidenceIds);
  for (const evidenceId of selection.supportingEvidenceIds) {
    if (state.knowledge.evidence[evidenceId] === undefined) {
      throw new AssessmentResolutionError(
        "SUPPORTING_EVIDENCE_NOT_FOUND",
        evidenceId,
      );
    }
    if (!relevantEvidenceIds.has(evidenceId)) {
      throw new AssessmentResolutionError(
        "SUPPORTING_EVIDENCE_NOT_RELEVANT",
        evidenceId,
      );
    }
  }
  for (const gapId of hypothesis.intelligenceGapIds) {
    if (state.knowledge.intelligenceGaps[gapId] === undefined) {
      throw new AssessmentResolutionError("INTELLIGENCE_GAP_NOT_FOUND", gapId);
    }
  }
  const contradictoryEvidenceIds = relevantContradictoryEvidenceIds(
    state,
    hypothesis,
  );
  return {
    hypothesisCode: hypothesis.hypothesisCode,
    subject: hypothesis.subject,
    declaredConfidenceBand: selection.declaredConfidenceBand,
    declaredConfidence:
      confidenceProfile.values[selection.declaredConfidenceBand],
    evidenceSupportScore: metadataScore(
      metadataProfile.supportScores,
      selection.supportingEvidenceIds.length,
    ),
    contradictionScore: metadataScore(
      metadataProfile.contradictionScores,
      contradictoryEvidenceIds.length,
    ),
    analysisStatus:
      contradictoryEvidenceIds.length === 0 ? "current" : "contested",
    supportingEvidenceIds: [...selection.supportingEvidenceIds].sort(),
    contradictoryEvidenceIds,
    intelligenceGapIds: [...hypothesis.intelligenceGapIds],
    institutionalImplicationCodes: [
      ...hypothesis.institutionalImplicationCodes,
    ],
  };
};

export const buildAssessmentWorkspace = (
  inputValue: unknown,
): AssessmentWorkspaceResult => {
  const input = AssessmentWorkspaceRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectWorkspace("INVALID_REQUEST_SCHEMA");
  try {
    const workspace = buildWorkspace(
      input.data.currentState,
      input.data.hypotheses,
      input.data.confidenceProfile,
      input.data.metadataProfile,
      input.data.selection,
    );
    return AssessmentWorkspaceResultSchema.parse({
      status: "ready",
      workspace,
    });
  } catch (error) {
    return error instanceof AssessmentResolutionError
      ? rejectWorkspace(error.reasonCode, error.detailCode)
      : rejectWorkspace("INVALID_RESULT");
  }
};

const rejectCommand = (
  reasonCode: AssessmentRejectionReason,
  detailCode?: string,
): AssessmentCommandResolutionResult =>
  AssessmentCommandResolutionResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const resolveAssessmentCommand = (
  inputValue: unknown,
): AssessmentCommandResolutionResult => {
  const input = AssessmentCommandResolutionRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectCommand("INVALID_REQUEST_SCHEMA");
  const request = input.data;
  const duplicateCode = duplicateHypothesisCode(request.hypotheses);
  if (duplicateCode !== undefined) {
    return rejectCommand("DUPLICATE_HYPOTHESIS_CODE", duplicateCode);
  }
  const bindingIds = request.actionBindings.map((binding) => binding.actionId);
  if (new Set(bindingIds).size !== bindingIds.length) {
    return rejectCommand("DUPLICATE_ACTION_BINDING");
  }
  const binding = request.actionBindings.find(
    (candidate) => candidate.actionId === request.actionId,
  );
  if (binding === undefined) return rejectCommand("ACTION_BINDING_NOT_FOUND");
  if (binding.operation !== request.term.operation) {
    return rejectCommand("COMMAND_OPERATION_MISMATCH");
  }
  const draft = structuredClone(request.currentState);
  const sourceDecision = draft.decisions.find(
    (decision) => decision.decisionId === request.sourceDecisionId,
  );
  if (sourceDecision === undefined) {
    return rejectCommand("SOURCE_DECISION_NOT_FOUND");
  }

  if (request.term.operation === "withdraw") {
    const assessment = draft.assessments[request.term.assessmentId];
    if (assessment === undefined) {
      return rejectCommand("ASSESSMENT_NOT_FOUND", request.term.assessmentId);
    }
    if (
      assessment.lifecycleStatus !== "adopted" &&
      assessment.lifecycleStatus !== "revised"
    ) {
      return rejectCommand("ASSESSMENT_NOT_ACTIVE", request.term.assessmentId);
    }
    assessment.lifecycleStatus = "withdrawn";
    sourceDecision.assessmentIds.push(assessment.assessmentId);
    const validated = CampaignStateSchema.safeParse(draft);
    if (!validated.success) return rejectCommand("INVALID_RESULT");
    return AssessmentCommandResolutionResultSchema.parse({
      status: "resolved",
      nextState: validated.data,
      trace: {
        operation: "withdraw",
        assessmentId: assessment.assessmentId,
        automaticallyDisplayedContradictoryEvidenceIds:
          assessment.contradictoryEvidenceIds,
      },
    });
  }

  const workspaceResult = buildAssessmentWorkspace({
    contractVersion: ASSESSMENT_CONTRACT_VERSION,
    classification: "TEST_ONLY_ASSESSMENT_WORKSPACE",
    currentState: draft,
    hypotheses: request.hypotheses,
    confidenceProfile: request.confidenceProfile,
    metadataProfile: request.metadataProfile,
    selection: request.term.selection,
  });
  if (workspaceResult.status !== "ready") {
    return rejectCommand(
      workspaceResult.reasonCode,
      workspaceResult.detailCode,
    );
  }
  const workspace = workspaceResult.workspace;
  const previousAssessment =
    request.term.operation === "revise"
      ? draft.assessments[request.term.previousAssessmentId]
      : undefined;
  if (request.term.operation === "revise" && previousAssessment === undefined) {
    return rejectCommand(
      "ASSESSMENT_NOT_FOUND",
      request.term.previousAssessmentId,
    );
  }
  if (
    previousAssessment !== undefined &&
    previousAssessment.lifecycleStatus !== "adopted" &&
    previousAssessment.lifecycleStatus !== "revised"
  ) {
    return rejectCommand(
      "ASSESSMENT_NOT_ACTIVE",
      previousAssessment.assessmentId,
    );
  }
  if (
    previousAssessment !== undefined &&
    !subjectsMatch(previousAssessment.subject, workspace.subject)
  ) {
    return rejectCommand(
      "REVISION_SUBJECT_MISMATCH",
      previousAssessment.assessmentId,
    );
  }
  const assessmentId = AssessmentIdSchema.parse(
    deriveSimulationId({
      entityType: "assessment",
      campaignSeed: draft.meta.campaignSeed,
      resolutionKey: `assessment:${request.sourceDecisionId}`,
      ordinal: 0,
    }),
  );
  if (draft.assessments[assessmentId] !== undefined) {
    return rejectCommand("ASSESSMENT_ALREADY_EXISTS", assessmentId);
  }
  if (previousAssessment !== undefined) {
    previousAssessment.lifecycleStatus = "superseded";
  }
  draft.assessments[assessmentId] = {
    assessmentId,
    subject: workspace.subject,
    hypothesisCode: workspace.hypothesisCode,
    lifecycleStatus: request.term.operation === "adopt" ? "adopted" : "revised",
    analysisStatus: workspace.analysisStatus,
    declaredConfidence: workspace.declaredConfidence,
    evidenceSupportScore: workspace.evidenceSupportScore,
    contradictionScore: workspace.contradictionScore,
    supportingEvidenceIds: workspace.supportingEvidenceIds,
    contradictoryEvidenceIds: workspace.contradictoryEvidenceIds,
    intelligenceGapIds: workspace.intelligenceGapIds,
    institutionalImplicationCodes: workspace.institutionalImplicationCodes,
    adoptedTurn: draft.meta.currentTurn,
    ...(previousAssessment === undefined
      ? {}
      : { revisedFromAssessmentId: previousAssessment.assessmentId }),
  };
  sourceDecision.assessmentIds.push(assessmentId);
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectCommand("INVALID_RESULT");
  return AssessmentCommandResolutionResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    trace: {
      operation: request.term.operation,
      assessmentId,
      ...(previousAssessment === undefined
        ? {}
        : { previousAssessmentId: previousAssessment.assessmentId }),
      declaredConfidenceBand: workspace.declaredConfidenceBand,
      automaticallyDisplayedContradictoryEvidenceIds:
        workspace.contradictoryEvidenceIds,
    },
  });
};

const rejectMetadata = (
  reasonCode: AssessmentRejectionReason,
  detailCode?: string,
): AssessmentMetadataRecalculationResult =>
  AssessmentMetadataRecalculationResultSchema.parse({
    status: "rejected",
    reasonCode,
    ...(detailCode === undefined ? {} : { detailCode }),
  });

export const recalculateAssessmentMetadata = (
  inputValue: unknown,
): AssessmentMetadataRecalculationResult => {
  const input =
    AssessmentMetadataRecalculationRequestSchema.safeParse(inputValue);
  if (!input.success) return rejectMetadata("INVALID_REQUEST_SCHEMA");
  const duplicateCode = duplicateHypothesisCode(input.data.hypotheses);
  if (duplicateCode !== undefined) {
    return rejectMetadata("DUPLICATE_HYPOTHESIS_CODE", duplicateCode);
  }
  const draft = structuredClone(input.data.currentState);
  const recalculatedAssessmentIds: AssessmentId[] = [];
  try {
    for (const assessment of Object.values(draft.assessments)) {
      if (
        assessment.lifecycleStatus !== "adopted" &&
        assessment.lifecycleStatus !== "revised"
      ) {
        continue;
      }
      const hypothesis = input.data.hypotheses.find(
        (candidate) =>
          candidate.hypothesisCode === assessment.hypothesisCode &&
          subjectsMatch(candidate.subject, assessment.subject),
      );
      if (hypothesis === undefined) {
        throw new AssessmentResolutionError(
          "HYPOTHESIS_NOT_FOUND",
          assessment.hypothesisCode,
        );
      }
      const contradictions = relevantContradictoryEvidenceIds(
        draft,
        hypothesis,
      );
      assessment.evidenceSupportScore = metadataScore(
        input.data.metadataProfile.supportScores,
        assessment.supportingEvidenceIds.length,
      );
      assessment.contradictionScore = metadataScore(
        input.data.metadataProfile.contradictionScores,
        contradictions.length,
      );
      assessment.contradictoryEvidenceIds = contradictions;
      assessment.analysisStatus =
        contradictions.length === 0 ? "current" : "contested";
      recalculatedAssessmentIds.push(assessment.assessmentId);
    }
  } catch (error) {
    return error instanceof AssessmentResolutionError
      ? rejectMetadata(error.reasonCode, error.detailCode)
      : rejectMetadata("INVALID_RESULT");
  }
  const validated = CampaignStateSchema.safeParse(draft);
  if (!validated.success) return rejectMetadata("INVALID_RESULT");
  return AssessmentMetadataRecalculationResultSchema.parse({
    status: "resolved",
    nextState: validated.data,
    recalculatedAssessmentIds,
  });
};
