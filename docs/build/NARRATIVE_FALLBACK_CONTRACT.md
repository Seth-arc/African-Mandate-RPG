# Deterministic narrative fallback contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-17 / PB2-17  
**Acceptance:** AC-020 / SIM-16  
**Classification:** TEST_ONLY knowledge-safe presentation contract; READY_FOR_REVIEW

## Ownership and authority

- `@african-mandate/domain` owns the strict serialized request identity, perspective-limited semantic context, collection-template input, provider response, and render-result schemas.
- `@african-mandate/narrative` owns deterministic plain-text rendering and provider-response validation. It imports only public domain contracts and cannot mutate `CampaignState`.
- `@african-mandate/application` owns the `NarrativePort` boundary. Application port contract `1.2.0` binds its default type family to the Zod-inferred Prompt 17 request/result while preserving the generic test adapter.
- The accepted knowledge registry remains the only source of evidence. Narrative receives copied knowledge-safe records and stable evidence IDs; it does not own evidence, reports, tasks, hidden intent, event truth, or authoritative outcomes.

## Public contract

`NarrativeRequestIdentitySchema` pins campaign ID, source campaign revision, semantic context SHA-256, language, policy version, and template version. Prompt 17 supports only the English v1 test template and the player-office perspective. Other perspectives and languages require separately reviewed templates.

`NarrativeContextSchema` implements the source-listed perspective boundary: subjects, known memory/commitment/dispute IDs, allowed claim IDs, and prohibited claim codes. `NarrativeRequestSchema` is strict and rejects undeclared fields. Every projected evidence record must be present in `allowedClaimIds`, cannot come from a future turn, and must carry an observed date. Numeric claims require a unit.

`CollectionNarrativeTemplateInputSchema` supports the six accepted collection outcomes:

| Outcome | Template constraint |
|---|---|
| `useful` | one or more player-visible evidence records |
| `partial` | evidence plus a remaining scoped gap |
| `contested` | at least two evidence records plus a remaining scoped gap |
| `inconclusive` | no invented evidence; remaining gap required |
| `delayed` | no invented evidence; remaining gap required |
| `failed` | no invented evidence; remaining gap required |

Every fallback begins with the fixed `SIMULATED` marker, identifies the collection task, formats its reporting date through `Intl.DateTimeFormat`, presents source type/date/stable evidence ID, formats numeric claims through `Intl.NumberFormat` with a required unit, and closes with an explicit knowledge limit. Evidence is rendered in stable evidence-ID order. Source-party IDs and hidden state are not rendered.

`NarrativeResponseSchema` retains the canonical source fields `text`, `usedClaimIds`, `referencedMemoryIds`, and `formatVersion`. Text rejects markup delimiters, unsupported control characters, and direct-quotation marks; this test-only milestone cannot attribute a generated quotation to any real person. Downstream UI must render it as a text node and may preserve newlines; it must not interpret HTML or Markdown.

## Deterministic fallback and stale guard

`DeterministicNarrativePort.request()` always returns the factual template and has no provider, network, clock, or random dependency. `resolveNarrativeResponse()` is a separately pure guard for a future optional provider candidate:

1. invalid provider schema returns the current deterministic template;
2. any campaign/revision/context-hash/language/policy/template mismatch returns the current deterministic template;
3. a claim or memory reference outside the semantic allowlist, a missing fixed `SIMULATED` marker, or prose containing a prohibited claim code returns the current deterministic template;
4. only a current, strict, plain-text, knowledge-safe candidate may be returned as generated presentation.

No narrative result mutates the campaign, consumes a strategic decision, changes a collection outcome, or enters authoritative state hashing.

## Proposal and production blockers

AM-GOV-043 records the exact request/result wrapper, fallback reason codes, English template wording, code-to-plain-label conversion, stable evidence ordering, and markup/direct-quotation refusal as TEST_ONLY interfaces requiring review. Upstream sources define the invariant and canonical identity/context/response fields but not these complete serialized wrappers.

No production AI provider, prompt transport, cache adapter, model policy, localized template, production copy cap, reading-level target, or regional/institutional review is implemented. AC-022 remains BLOCKED for external editorial review. The opening-document package remains AUTHORING_ONLY and is not compiled into authoritative scenario content.

## Copy conformance report

- Copy added: six collection-outcome fallback variants and fixed source/date/evidence/knowledge-limit lines.
- Mechanical rules: no HTML/markup output, invented real-person quote, unnamed authority, dramatic punctuation, game vocabulary, or hand-built numeric/date literal is present in the renderer.
- Label prediction: no interactive labels were added.
- Reading level: not scored because `VOICE.md` explicitly leaves the measure and target unresolved until the UI-container study. This is a visible production blocker, not a passing claim.
- Truth/state check: inputs are strict player-office knowledge contracts; evidence IDs are allowlisted; future evidence and undeclared hidden fields reject.
- `VOICE.md`, `GLOSSARY.md`, and `DESIGN_DECISIONS.md` are unchanged because no naming, protocol, or presentation exception was introduced.
- Regional review: not performed; required before release under AC-022.
- Comprehension is verified by proxy only until real general players read the copy.

## Source-to-test traceability

| Acceptance | Source | Executable evidence |
|---|---|---|
| PB2-17 | Domain v1.1 sections 117-122; Technical v2 sections 29 and 66-72; VOICE sections 1, 4-6 and 9; Writing v2 WH1/WH4 and W5/W9/W11/W12 | strict schemas, deterministic port, plain-text renderer, stale/allowlist guard |
| AC-020 / SIM-16 | Technical v2 stale identity and failure path; Package 2 collection matrix/opening variants | `tests/unit/narrative-fallback.test.ts` covers six outcomes, no-provider fallback, stale hash, hidden-state rejection, units/dates, markup rejection, and byte stability |
| AC-022 | VOICE/Writing simulated/source/date/orthography and external review rules | automated subset PASS; regional review and production copy QA remain BLOCKED |
