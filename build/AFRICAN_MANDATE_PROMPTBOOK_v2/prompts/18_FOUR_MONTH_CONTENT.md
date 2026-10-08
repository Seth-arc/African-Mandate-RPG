# Prompt 18 — Four-month TEST_ONLY compiled content

**Task ID:** AM-PB2-18  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 06–17 ACCEPTED  \n**Source authority:** Package 1–3 content/QA; Package 4 readiness

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Four-month TEST_ONLY compiled content.

**Implementation deliverables:** Compile synthetic four-month content against full executable test schema with versioned test-only actors, rules, actions, effects, source streams, messages, branches A/B/C; alias inconsistent draft gap IDs explicitly; produce manifest of unimplemented canonical systems and hard gate production.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/18.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Unique refs; 18 authoring action IDs audited (do not require all executable if documented blocked); 3 actions/month; collect/consult/defer distinct meaningful paths; no fake real data.

**Explicit exclusions:** Do not coerce authoring Markdown sketches into production JSON without validation. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Full test-only content cross-references, fixture hash and branch inventory pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
