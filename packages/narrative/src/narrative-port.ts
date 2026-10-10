import {
  NARRATIVE_CONTRACT_VERSION,
  NARRATIVE_FORMAT_VERSION,
  NarrativeProviderResponseSchema,
  NarrativeRenderResultSchema,
  NarrativeRequestSchema,
  type CollectionNarrativeTemplateInput,
  type EvidenceRecord,
  type NarrativeProviderResponse,
  type NarrativeRenderResult,
  type NarrativeRequest,
  type NarrativeRequestIdentity,
  type NarrativeResponse,
  type SubjectRef,
} from "@african-mandate/domain";

type FallbackReason = NonNullable<NarrativeRenderResult["fallbackReason"]>;

const sourceLabels: Readonly<Record<EvidenceRecord["sourceType"], string>> = {
  observed_baseline: "observed baseline",
  simulation_observation: "simulated observation",
  institutional_report: "institutional report",
  actor_claim: "role-level actor claim",
  open_source: "open-source report",
  partner_intelligence: "partner reporting",
  field_reporting: "field reporting",
};

const outcomeText: Readonly<
  Record<CollectionNarrativeTemplateInput["outcome"], string>
> = {
  useful:
    "The requested collection produced evidence that may address the scoped question.",
  partial:
    "The requested collection produced limited evidence. The scoped question remains partly unresolved.",
  contested:
    "The requested collection produced conflicting evidence. The scoped question remains contested.",
  inconclusive:
    "The requested collection did not establish an answer. The scoped question remains open.",
  delayed:
    "The requested collection did not arrive by this reporting date. The scoped question remains open.",
  failed:
    "The requested collection ended without new evidence. The scoped question remains open.",
};

const outcomeLabels: Readonly<
  Record<CollectionNarrativeTemplateInput["outcome"], string>
> = {
  useful: "Useful",
  partial: "Partial",
  contested: "Contested",
  inconclusive: "Inconclusive",
  delayed: "Delayed",
  failed: "Failed",
};

const humanizeCode = (value: string): string =>
  value.replaceAll("_", " ").normalize("NFC");

const formatDate = (value: string, language: "en"): string =>
  new Intl.DateTimeFormat(language === "en" ? "en-GB" : language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));

const formatNumber = (value: number, language: "en"): string =>
  new Intl.NumberFormat(language === "en" ? "en-GB" : language, {
    maximumFractionDigits: 20,
    useGrouping: true,
  }).format(value);

const subjectId = (subject: SubjectRef): string => {
  switch (subject.kind) {
    case "territory":
      return subject.territoryId;
    case "zone":
      return subject.zoneId;
    case "asset":
      return subject.assetId;
    case "corridor":
      return subject.corridorId;
    case "actor":
      return subject.actorId;
    case "institution":
      return subject.institutionId;
    case "assessment":
      return subject.assessmentId;
    case "mandate_case":
      return subject.mandateCaseId;
    case "world_event":
      return subject.worldEventId;
  }
};

const renderClaim = (evidence: EvidenceRecord, language: "en"): string => {
  const { claim } = evidence;
  switch (claim.kind) {
    case "scalar":
      return `${humanizeCode(claim.metric)} was reported as ${formatNumber(claim.value, language)} ${claim.unit}.`;
    case "range":
      return `${humanizeCode(claim.metric)} was reported from ${formatNumber(claim.min, language)} to ${formatNumber(claim.max, language)} ${claim.unit}.`;
    case "category":
      return `${humanizeCode(claim.category)} was reported as ${humanizeCode(claim.value)}.`;
    case "boolean":
      return `${humanizeCode(claim.proposition)} was reported as ${claim.value ? "available" : "not available"}.`;
    case "entity_relation":
      return `${humanizeCode(claim.relation)} was reported for ${humanizeCode(claim.target.kind)} ${subjectId(claim.target)}.`;
    case "text_claim":
      return `${humanizeCode(claim.claimCode)} was reported.`;
  }
};

const renderEvidence = (evidence: EvidenceRecord, language: "en"): string => {
  if (evidence.observedDate === undefined) {
    throw new Error("Validated narrative evidence must have an observed date");
  }
  return [
    `Evidence ${evidence.evidenceId}.`,
    `Source: ${sourceLabels[evidence.sourceType]}.`,
    `Observed: ${formatDate(evidence.observedDate, language)}.`,
    `Reported: ${renderClaim(evidence, language)}`,
  ].join(" ");
};

const buildFallbackResponse = (
  request: NarrativeRequest,
): NarrativeResponse => {
  const { templateInput, identity } = request;
  const evidence = [...templateInput.evidence].sort((left, right) =>
    left.evidenceId < right.evidenceId
      ? -1
      : left.evidenceId > right.evidenceId
        ? 1
        : 0,
  );
  const lines = [
    "SIMULATED",
    `Collection response: ${outcomeLabels[templateInput.outcome]}`,
    `Date: ${formatDate(templateInput.responseDate, identity.language)}`,
    `Reference: ${templateInput.collectionTaskId}`,
    "",
    outcomeText[templateInput.outcome],
  ];
  if (evidence.length > 0) {
    lines.push("", "Source records:");
    evidence.forEach((record) =>
      lines.push(renderEvidence(record, identity.language)),
    );
  }
  if (templateInput.remainingGapQuestionCode !== undefined) {
    lines.push(
      "",
      `Remaining gap: ${humanizeCode(templateInput.remainingGapQuestionCode)}.`,
    );
  }
  lines.push(
    "",
    "Knowledge limit: This response contains only evidence available to the Envoy's Office. It does not establish hidden conditions.",
  );

  return {
    text: lines.join("\n").normalize("NFC"),
    usedClaimIds: evidence.map(({ evidenceId }) => evidenceId),
    referencedMemoryIds: [],
    formatVersion: NARRATIVE_FORMAT_VERSION,
  };
};

const fallback = (
  request: NarrativeRequest,
  fallbackReason: FallbackReason,
): NarrativeRenderResult =>
  NarrativeRenderResultSchema.parse({
    contractVersion: NARRATIVE_CONTRACT_VERSION,
    identity: request.identity,
    source: "deterministic_template",
    fallbackReason,
    response: buildFallbackResponse(request),
  });

const identityMatches = (
  expected: NarrativeRequestIdentity,
  actual: NarrativeRequestIdentity,
): boolean =>
  expected.campaignId === actual.campaignId &&
  expected.sourceCampaignRevision === actual.sourceCampaignRevision &&
  expected.semanticContextHash === actual.semanticContextHash &&
  expected.language === actual.language &&
  expected.narrativePolicyVersion === actual.narrativePolicyVersion &&
  expected.templateVersion === actual.templateVersion;

const staysWithinKnowledge = (
  request: NarrativeRequest,
  candidate: NarrativeProviderResponse,
): boolean => {
  const allowedClaims = new Set(request.context.semanticState.allowedClaimIds);
  const allowedMemories = new Set(request.context.semanticState.knownMemoryIds);
  return (
    candidate.response.text.startsWith("SIMULATED\n") &&
    candidate.response.usedClaimIds.every((id) => allowedClaims.has(id)) &&
    candidate.response.referencedMemoryIds.every((id) =>
      allowedMemories.has(id),
    ) &&
    request.context.prohibitedClaimCodes.every(
      (code) => !candidate.response.text.includes(code),
    )
  );
};

export const renderDeterministicNarrative = (
  input: NarrativeRequest,
): NarrativeRenderResult => {
  const request = NarrativeRequestSchema.parse(input);
  return fallback(request, "GENERATION_UNAVAILABLE");
};

export const resolveNarrativeResponse = (
  input: NarrativeRequest,
  candidateInput?: unknown,
): NarrativeRenderResult => {
  const request = NarrativeRequestSchema.parse(input);
  if (candidateInput === undefined) {
    return fallback(request, "GENERATION_UNAVAILABLE");
  }
  const parsedCandidate =
    NarrativeProviderResponseSchema.safeParse(candidateInput);
  if (!parsedCandidate.success) {
    return fallback(request, "INVALID_GENERATED_RESPONSE");
  }
  if (!identityMatches(request.identity, parsedCandidate.data.identity)) {
    return fallback(request, "STALE_RESPONSE_IDENTITY");
  }
  if (!staysWithinKnowledge(request, parsedCandidate.data)) {
    return fallback(request, "KNOWLEDGE_BOUNDARY_VIOLATION");
  }
  return NarrativeRenderResultSchema.parse({
    contractVersion: NARRATIVE_CONTRACT_VERSION,
    identity: request.identity,
    source: "generated_plain_text",
    response: parsedCandidate.data.response,
  });
};

export class DeterministicNarrativePort {
  public request(input: NarrativeRequest): Promise<NarrativeRenderResult> {
    return Promise.resolve(renderDeterministicNarrative(input));
  }
}
