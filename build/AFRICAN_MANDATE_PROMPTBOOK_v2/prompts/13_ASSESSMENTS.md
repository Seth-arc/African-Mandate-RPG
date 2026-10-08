# Prompt 13 — Structured assessment lifecycle

**Task ID:** AM-PB2-13  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 11–12 ACCEPTED  \n**Source authority:** Domain AssessmentState; GDS assessment §§; Package 2 claims

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Structured assessment lifecycle.

**Implementation deliverables:** Implement authored-hypothesis selection, player-evidence citation, Low/Moderate/High declared confidence, automatic display of all known relevant contradictions, adopt/revise/withdraw as consequential commands.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/13.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Known contradiction displayed even if omitted by user; high-confidence choice permitted but accountable; later report does not auto rewrite adopted assessment; adoption costs exactly one slot.

**Explicit exclusions:** No free-text authority and no source confidence conflated with declared confidence. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** SIM-05 assessment properties pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
