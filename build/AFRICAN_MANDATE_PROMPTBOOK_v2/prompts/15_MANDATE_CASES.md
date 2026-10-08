# Prompt 15 — Coalitions, mandate cases and authorization gate

**Task ID:** AM-PB2-15  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 13–14 ACCEPTED  \n**Source authority:** Domain Mandate Case and authorization; Package 3 §§4–7

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Coalitions, mandate cases and authorization gate.

**Implementation deliverables:** Implement assessment->case escalation one slot, issue-specific coalition positions, case terms and integrity dimensions, known-disabled missing legal procedure; authorization request only if explicitly approved fixture procedure; implementation launch as separate gated state; define status trace.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/15.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Case != authorization != implementation; one-slot case opening; no grant by AU liaison/AES/ECOWAS/OCHA; known missing procedure rejects without state mutation; negotiated scope tracked.

**Explicit exclusions:** Do not invent actual AU/AES legal authority or infer consent from membership. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** SIM-07 and SIM-10 pass in synthetic cases. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
