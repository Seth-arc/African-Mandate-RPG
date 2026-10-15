# Prompt 29 — Separate trusted leaderboard replay service

**Task ID:** AM-PB2-29  
**Track:** Production/release, externally gated and optional for an authorized noncompetitive release  
**Prerequisite gate:** 04,19,26–28 ACCEPTED; approved ADR  
**Source authority:** Spec Reconciliation leaderboard addendum; Architecture v2 changes pending

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Separate trusted leaderboard replay service.

**Implementation deliverables:** After formal Domain/Architecture ADR, implement an authenticated trusted server verifier of seed/cohort/manifest/hash/ordered commands, replay and independent score recomputation; separated read model, immutable accepted verification.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/29.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Reject altered client score/history, wrong seed/version, duplicate submissions, tampered hash, cross-cohort rankings, rate-limit violations and unauthenticated requests.

**Explicit exclusions:** Never accept browser-supplied score as authority; never leak private state. This service does not add general cloud saves or player account features beyond the minimum authentication required for verified submissions. Apply all general non-invention, security, provenance, licensing and hidden-state restrictions.

**Completion / gate:** Security/replay review and published scoring rule version accepted. For an explicitly authorized noncompetitive release, record the exclusion and mark this prompt `DEFERRED_APPROVED`; otherwise only `ACCEPTED` satisfies the competitive-release prerequisite. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED or DEFERRED_APPROVED.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
