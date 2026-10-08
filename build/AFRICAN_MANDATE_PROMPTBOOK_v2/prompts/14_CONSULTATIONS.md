# Prompt 14 — Consultations, terms and commitments

**Task ID:** AM-PB2-14  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 12–13 ACCEPTED  \n**Source authority:** GDS consultation/commitment mechanics; Package 3 N1–N3

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Consultations, terms and commitments.

**Implementation deliverables:** Implement coherent structured single-slot consultation packages, legal term validation, known-risk preview, response after commit from typed actor state, commitment owner/beneficiary/dueTurn/fulfillment transitions, evidence emission and memory callbacks.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/14.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Conditional/rejected/accepted conversation states, independent regional consents, due/breach exactly once, political conflicting promises warn but may proceed, hard invalid terms rejected.

**Explicit exclusions:** No unrestricted free-form AI negotiation or automatic partner agreement. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** SIM-02, SIM-09 consultation and commitment tests pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
