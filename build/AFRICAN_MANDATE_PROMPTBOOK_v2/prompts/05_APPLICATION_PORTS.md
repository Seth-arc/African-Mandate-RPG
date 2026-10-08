# Prompt 05 — Application ports and operation boundary

**Task ID:** AM-PB2-05  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 04 ACCEPTED  \n**Source authority:** Technical v2 application architecture, operation coordinator and persistence ordering

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Application ports and operation boundary.

**Implementation deliverables:** Define and test SimulationPort, CampaignRepository, ArtifactRegistryClient, NarrativePort, CampaignEditLock and CampaignOperationCoordinator interfaces; add in-memory test adapters; reserve clear ownership: application coordinates, simulation resolves; no production browser adapter yet.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/05.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Port contract tests, concurrent operation serialization, dependency injection, invalid input failure.

**Explicit exclusions:** UI must not import hidden state/simulation; do not implement a second command dispatcher in Prompt 15. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Ports frozen/versioned before command engine and UI code. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
