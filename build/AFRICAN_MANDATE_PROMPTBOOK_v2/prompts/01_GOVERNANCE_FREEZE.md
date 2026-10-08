# Prompt 01 — Build governance and approval state

**Task ID:** AM-PB2-01  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 00 ACCEPTED  \n**Source authority:** Build Constitution; Reconciliation v1; Data & Methodology v1.1

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Build governance and approval state.

**Implementation deliverables:** Add BUILD_STATE.json with states and independent approval record; establish source precedence and a versioned decision ledger; record fixed dates/countries; mark boundary/admin level, legal authority, balance, indicators and leaderboard formula pending; map missing DESIGN_STANDARDS.md without inventing.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/01.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Validate state schema and transitions; dry-run BLOCKED/FAILED/PARTIAL/ACCEPTED paths.

**Explicit exclusions:** Do not reinterpret an open decision as approval; do not invent missing design standards. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Build state exists, gate enforcement proven, owner sign-off for implementation baseline. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
