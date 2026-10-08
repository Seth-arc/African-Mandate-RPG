# Prompt 07 — Rule facts, commands and eligibility

**Task ID:** AM-PB2-07  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 03–06 ACCEPTED  \n**Source authority:** Domain command/rule/effect §§; GDS v2.1 command economy

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Rule facts, commands and eligibility.

**Implementation deliverables:** Register typed FactKey allowlist and tri-state rule evaluations; authoritative structural checks vs knowledge-safe action menu; model command ID, duplicate handling, known costs, signed action/target schema, and postcommit hidden resolution.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/07.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Same known projection with two hidden states => identical eligibility/preview; invalid action consumes no slot; unknown never coerced to false/0; structurally impossible term refused.

**Explicit exclusions:** No arbitrary object-path rule expressions or precommit hidden veto. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Differential eligibility test and schema-validated command tests pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
