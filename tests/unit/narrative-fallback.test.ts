import { describe, expect, it, vi } from "vitest";

import type { NarrativePort } from "@african-mandate/application";
import {
  EvidenceRecordSchema,
  NARRATIVE_CONTRACT_VERSION,
  NARRATIVE_FORMAT_VERSION,
  NARRATIVE_POLICY_VERSION,
  NARRATIVE_TEMPLATE_VERSION,
  NarrativeRequestSchema,
  NarrativeResponseSchema,
  type CollectionOutcome,
  type EvidenceRecord,
  type NarrativeProviderResponse,
  type NarrativeRequest,
} from "@african-mandate/domain";
import {
  DeterministicNarrativePort,
  renderDeterministicNarrative,
  resolveNarrativeResponse,
} from "@african-mandate/narrative";

const firstEvidence = EvidenceRecordSchema.parse({
  evidenceId: "evidence_test_narrative_people",
  subject: { kind: "zone", zoneId: "zone_test_narrative" },
  claim: {
    kind: "scalar",
    metric: "reported_people_reached",
    value: 1250,
    unit: "people",
  },
  sourceType: "field_reporting",
  sourceParty: {
    kind: "actor",
    actorId: "actor_test_reporting_contact",
  },
  initialConfidence: 60,
  sourceReliability: 60,
  observedTurn: 2,
  observedDate: "2025-11-01",
  decayProfileId: "decay_test_narrative",
  contradictionKey: "zone_test_narrative:access",
  reportSensitivity: "open",
});

const secondEvidence = EvidenceRecordSchema.parse({
  evidenceId: "evidence_test_narrative_access",
  subject: { kind: "zone", zoneId: "zone_test_narrative" },
  claim: {
    kind: "boolean",
    proposition: "independent_verification_available",
    value: false,
  },
  sourceType: "partner_intelligence",
  initialConfidence: 55,
  sourceReliability: 50,
  observedTurn: 2,
  observedDate: "2025-10-28",
  decayProfileId: "decay_test_narrative",
  contradictionKey: "zone_test_narrative:access",
  reportSensitivity: "open",
});

const evidenceFor = (outcome: CollectionOutcome): readonly EvidenceRecord[] => {
  if (outcome === "contested") return [firstEvidence, secondEvidence];
  if (outcome === "useful" || outcome === "partial") return [firstEvidence];
  return [];
};

const requestFor = (outcome: CollectionOutcome): NarrativeRequest => {
  const evidence = evidenceFor(outcome);
  return NarrativeRequestSchema.parse({
    contractVersion: NARRATIVE_CONTRACT_VERSION,
    classification: "TEST_ONLY_KNOWLEDGE_SAFE_NARRATIVE",
    identity: {
      campaignId: "campaign_test_narrative",
      sourceCampaignRevision: 4,
      semanticContextHash: "a".repeat(64),
      language: "en",
      narrativePolicyVersion: NARRATIVE_POLICY_VERSION,
      templateVersion: NARRATIVE_TEMPLATE_VERSION,
    },
    context: {
      narrativeContextId: `narrative_test_${outcome}`,
      perspective: { kind: "player_office" },
      turn: 2,
      subjectRefs: [{ kind: "zone", zoneId: "zone_test_narrative" }],
      semanticState: {
        toneProfileId: "tone_test_measured",
        knownMemoryIds: [],
        knownCommitmentIds: [],
        knownDisputeIds: [],
        allowedClaimIds: evidence.map(({ evidenceId }) => evidenceId),
      },
      prohibitedClaimCodes: ["hidden_actor_intent_test"],
    },
    templateInput: {
      templateKind: "collection_outcome",
      collectionTaskId: "collection_test_narrative",
      outcome,
      responseDate: "2025-11-01",
      evidence,
      ...("useful" === outcome
        ? {}
        : { remainingGapQuestionCode: "verified_access_conditions" }),
    },
  });
};

const generatedCandidate = (
  request: NarrativeRequest,
): NarrativeProviderResponse => ({
  contractVersion: NARRATIVE_CONTRACT_VERSION,
  identity: request.identity,
  response: {
    text: "SIMULATED\nA knowledge-scoped generated response.",
    usedClaimIds: request.context.semanticState.allowedClaimIds,
    referencedMemoryIds: [],
    formatVersion: NARRATIVE_FORMAT_VERSION,
  },
});

describe("Prompt 17 deterministic narrative fallback", () => {
  it("renders all six collection outcomes with the fixed simulated marker", () => {
    const outcomes: readonly CollectionOutcome[] = [
      "useful",
      "partial",
      "contested",
      "inconclusive",
      "delayed",
      "failed",
    ];
    for (const outcome of outcomes) {
      const result = renderDeterministicNarrative(requestFor(outcome));
      expect(result.source).toBe("deterministic_template");
      expect(result.response.text.startsWith("SIMULATED\n")).toBe(true);
      expect(result.response.text.toLowerCase()).toContain(outcome);
      expect(result.response.text).toContain(
        "only evidence available to the Envoy's Office",
      );
    }
  });

  it("returns the factual template without a provider or network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const port: NarrativePort = new DeterministicNarrativePort();
    const request = requestFor("useful");

    await expect(port.request(request)).resolves.toEqual(
      renderDeterministicNarrative(request),
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("rejects a stale semantic response hash and uses the current fallback", () => {
    const request = requestFor("useful");
    const stale = generatedCandidate(request);
    const result = resolveNarrativeResponse(request, {
      ...stale,
      identity: {
        ...stale.identity,
        semanticContextHash: "b".repeat(64),
      },
    });

    expect(result.source).toBe("deterministic_template");
    expect(result.fallbackReason).toBe("STALE_RESPONSE_IDENTITY");
    expect(result.response).toEqual(
      renderDeterministicNarrative(request).response,
    );
  });

  it("fails closed on hidden-state input and generated claim leakage", () => {
    const request = requestFor("useful");
    expect(
      NarrativeRequestSchema.safeParse({
        ...request,
        hiddenState: { actorIntent: "hidden_actor_intent_test" },
      }).success,
    ).toBe(false);
    expect(
      NarrativeRequestSchema.safeParse({
        ...request,
        templateInput: {
          ...request.templateInput,
          evidence: [{ ...firstEvidence, observedTurn: 3 }],
        },
      }).success,
    ).toBe(false);

    const candidate = generatedCandidate(request);
    const result = resolveNarrativeResponse(request, {
      ...candidate,
      response: {
        ...candidate.response,
        text: "hidden_actor_intent_test",
        usedClaimIds: ["hidden_claim_test"],
      },
    });
    expect(result.fallbackReason).toBe("KNOWLEDGE_BOUNDARY_VIOLATION");
    expect(result.response.text).not.toContain("hidden_actor_intent_test");
    expect(result.response.text).not.toContain("actor_test_reporting_contact");
    expect(
      resolveNarrativeResponse(request, {
        ...candidate,
        response: {
          ...candidate.response,
          text: "A response without the required marker.",
        },
      }).fallbackReason,
    ).toBe("KNOWLEDGE_BOUNDARY_VIOLATION");
  });

  it("formats dates and numbers with units and rejects a missing unit", () => {
    const result = renderDeterministicNarrative(requestFor("useful"));
    expect(result.response.text).toContain("Date: 1 November 2025");
    expect(result.response.text).toContain(
      "reported people reached was reported as 1,250 people",
    );

    const request = requestFor("useful");
    const unitlessEvidence = {
      ...firstEvidence,
      claim: {
        kind: "scalar",
        metric: "reported_people_reached",
        value: 1250,
      },
    } as const;
    expect(
      NarrativeRequestSchema.safeParse({
        ...request,
        templateInput: {
          ...request.templateInput,
          evidence: [unitlessEvidence],
        },
      }).success,
    ).toBe(false);
  });

  it("keeps output plain text and rejects markup or direct quotations", () => {
    const request = requestFor("useful");
    expect(request.templateInput.evidence[0]?.sourceParty).toBeDefined();
    expect(renderDeterministicNarrative(request).response.text).not.toMatch(
      /[<>]/u,
    );
    expect(
      NarrativeResponseSchema.safeParse({
        text: "<script>authoritative change</script>",
        usedClaimIds: [],
        referencedMemoryIds: [],
        formatVersion: NARRATIVE_FORMAT_VERSION,
      }).success,
    ).toBe(false);
    expect(
      NarrativeResponseSchema.safeParse({
        text: 'SIMULATED\nA named person said, "This is invented."',
        usedClaimIds: [],
        referencedMemoryIds: [],
        formatVersion: NARRATIVE_FORMAT_VERSION,
      }).success,
    ).toBe(false);
  });

  it("is byte-stable and emits stable sorted evidence IDs", () => {
    const request = requestFor("contested");
    const first = renderDeterministicNarrative(request);
    const second = renderDeterministicNarrative(request);

    expect(first).toEqual(second);
    expect(first.response.usedClaimIds).toEqual([
      "evidence_test_narrative_access",
      "evidence_test_narrative_people",
    ]);
    expect(
      first.response.text.indexOf("evidence_test_narrative_access"),
    ).toBeLessThan(
      first.response.text.indexOf("evidence_test_narrative_people"),
    );
  });
});
