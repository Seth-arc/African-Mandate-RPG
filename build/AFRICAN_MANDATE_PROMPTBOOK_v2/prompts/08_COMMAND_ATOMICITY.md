# Prompt 08 — Atomic decision commit and durable persistence

**Task ID:** AM-PB2-08  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 05,07 ACCEPTED  \n**Source authority:** Technical v2 persistence sequence; Reconciliation R-01/R-02

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Atomic decision commit and durable persistence.

**Implementation deliverables:** Build authoritative dispatcher behind SimulationPort and ApplicationOperationCoordinator; simulate->validate/hash->durable write->replace in-memory; idempotent command IDs; one consequential slot; journal immutable; failure leaves prior snapshot.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/08.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Duplicate submit, rejected command, save failure injected, concurrent click/EndTurn, version mismatch and revision mismatch; no changes to resources/events/slots on failure.

**Explicit exclusions:** Do not apply committed actions at End Month or allow in-turn undo/queue reorder. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** All atomicity and idempotence properties pass against in-memory repository. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
