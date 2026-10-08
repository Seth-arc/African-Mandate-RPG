# Prompt 12 — Actor relationships, positions and memory

**Task ID:** AM-PB2-12  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 10–11 ACCEPTED  \n**Source authority:** Domain actor/relationship/position/memory registries; Package 1 actor roster

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Actor relationships, positions and memory.

**Implementation deliverables:** Implement typed actor and institution runtime, directional relation, issue-specific stance, red-line discovery, memory creation and once-only relationship effects, fatigue and conditional adaptation using explicit TEST_ONLY profiles.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/12.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Reverse relation not inferred; changing hidden stance does not alter knowledge; memory effect once on creation; repetitive diplomacy non-farming; actor capacity bounded.

**Explicit exclusions:** Do not assign factual intentions to real people or encode all AES states as one stance. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** SIM-02 actor/memory kernel tests pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
