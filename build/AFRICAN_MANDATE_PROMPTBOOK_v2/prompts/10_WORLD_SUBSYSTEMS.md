# Prompt 10 — World state subsystem resolvers

**Task ID:** AM-PB2-10  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 09 ACCEPTED  \n**Source authority:** Domain world registries; GDS § major systems; Data methodology guardrails

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** World state subsystem resolvers.

**Implementation deliverables:** Implement minimum deterministic test-only resolver contracts for conflict, civilian, infrastructure, development, external environment, territory/zone state and resources; explicit source-of-truth ownership, scheduled/event inputs, output traces and no-op/fixture policy per subsystem; mark omitted production dynamics as BLOCKED not implemented.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/10.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** No double writable metrics; baseline unchanged across turns; test-only seeded fixtures deterministically change multiple subsystems when declared; negative cross-system invalid effects rejected.

**Explicit exclusions:** Do not invent real values, unapproved formulas or call a no-op a balanced model. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Each subsystem test contract and coverage declaration accepted. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
