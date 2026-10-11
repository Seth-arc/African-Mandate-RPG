import {
  NarrativeRequestSchema,
  NarrativeRenderResultSchema,
  type NarrativeRequest,
  type NarrativeRenderResult,
} from "@african-mandate/domain";

import type { NarrativePort } from "./ports.js";

export class NarrativeIdentityMismatchError extends Error {
  public constructor(readonly field: keyof NarrativeRequest["identity"]) {
    super(`Narrative output does not match request field: ${String(field)}`);
    this.name = "NarrativeIdentityMismatchError";
  }
}

const assertIdentity = (
  request: NarrativeRequest,
  result: NarrativeRenderResult,
): void => {
  const fields = [
    "campaignId",
    "sourceCampaignRevision",
    "semanticContextHash",
    "language",
    "narrativePolicyVersion",
    "templateVersion",
  ] as const;
  for (const field of fields) {
    if (result.identity[field] !== request.identity[field]) {
      throw new NarrativeIdentityMismatchError(field);
    }
  }
};

/** Optional primary rendering with a mandatory deterministic offline fallback. */
export class NarrativeFallbackService {
  public constructor(
    private readonly fallback: NarrativePort,
    private readonly primary?: NarrativePort,
  ) {}

  public async request(
    input: NarrativeRequest,
  ): Promise<NarrativeRenderResult> {
    const request = NarrativeRequestSchema.parse(input);
    if (this.primary !== undefined) {
      try {
        const result = NarrativeRenderResultSchema.parse(
          await this.primary.request(request),
        );
        assertIdentity(request, result);
        return result;
      } catch {
        // Primary failures and stale identity both fail over deterministically.
      }
    }
    const result = NarrativeRenderResultSchema.parse(
      await this.fallback.request(request),
    );
    assertIdentity(request, result);
    return result;
  }
}
