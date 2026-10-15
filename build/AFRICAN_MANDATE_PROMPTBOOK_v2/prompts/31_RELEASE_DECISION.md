# Prompt 31 — Release evidence and sign-off

**Task ID:** AM-PB2-31  
**Track:** Production/release, externally gated  
**Prerequisite gate:** 24–28 and 30 ACCEPTED; Prompt 29 ACCEPTED for competitive release or DEFERRED_APPROVED by an explicitly authorized noncompetitive release decision  
**Source authority:** Package 4 gates and readiness register; Writing Standards; Data/Methodology

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED or explicitly authorized for deferral as stated above, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Release evidence and sign-off.

**Implementation deliverables:** Collect CI, artifact hashes, licensing, geographic and legal reviews, determinism, replay, accessibility, regional copy, balance, browser matrix, compatibility, staging deployment and rollback evidence into a dated release decision. State whether the release is competitive or noncompetitive and verify Prompt 29 accordingly.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/31.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Re-run clean acceptance, verify artifact immutability, restore/replay saves, independently reproduce staging deployment smoke and rollback, and confirm no critical unresolved findings or unauthorized prerequisite deferrals.

**Explicit exclusions:** Do not label partial QA as release pass, use Prompt 31 to build missing product/deployment work, or silently waive mandatory gates. Apply all general non-invention, security, provenance, licensing and hidden-state restrictions.

**Completion / gate:** Owner signs PROD_ACCEPTED; otherwise publish a BLOCKED gate report. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; missing staging/rollback evidence; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
