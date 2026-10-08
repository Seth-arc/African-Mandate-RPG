# Prompt 26 — Production track: actors, authority, balances

**Task ID:** AM-PB2-26  \n**Track:** Production/release, externally gated  \n**Prerequisite gate:** 19 ACCEPTED; external reviewers  \n**Source authority:** Stage 1 approved foundation; Package 1 registry; GDS v2.1; Data methodology

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Production track: actors, authority, balances.

**Implementation deliverables:** Obtain legal/regional review of 2025 AU/PSC/AES/ECOWAS host procedure; approve real institutional assertions and actor scenario assumptions, six-dimension evaluation and leaderboard scoring, production coefficients/uncertainty and action costs; record versioned approval.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/26.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Procedure competence audit; every source claim dated and attributable; coefficients tested on scenarios and edge cases; values not copied from TEST fixtures.

**Explicit exclusions:** No inventing government stances or law from functional actor roles. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** EXTERNAL_PENDING until reviewers/owner sign off. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
