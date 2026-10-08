# Prompt 23 — Decision preview, commitment and resolution UI

**Task ID:** AM-PB2-23  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 20–22 ACCEPTED  \n**Source authority:** Reconciliation R-01/R-02; GDS decision economy; Components

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Decision preview, commitment and resolution UI.

**Implementation deliverables:** Implement draft-only tray, knowledge-safe cost/unknown preview, explicit Commit with one atomic command, immutable decision journal, End Month and resolution ledger, transaction-saving/error/retry paths.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/23.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** No state change on draft; commit journal immediately after durable write; failed save retains unchanged prior state; last-slot blocker safety; screen reader confirmation; no reorder committed history.

**Explicit exclusions:** No forecast of hidden probability, hidden red-line availability leak or modal without focus trap. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Complete simulated four-month UI happy/adverse paths pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
