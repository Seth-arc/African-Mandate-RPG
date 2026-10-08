# Prompt 19 — Independent SIM-01 to SIM-16 headless acceptance

**Task ID:** AM-PB2-19  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 18 ACCEPTED  \n**Source authority:** Stage 2 Package 4 Validation Spec §§3–6

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Independent SIM-01 to SIM-16 headless acceptance.

**Implementation deliverables:** Implement fixed independent golden inputs/expected observables for SIM-01…SIM-16, using source-defined invariants; separately record unavailable production gates; run fixed replay with seed+hash+commands, at least recommended 50 deterministic sample campaigns per difficulty with coverage report; freeze accepted results.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/19.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** 16 scenario outcome reports; differential hidden knowledge, null-vs-zero, duplicate, time, save failure, no forced case, trace; compare independent acceptance not tests authored to implementation convenience.

**Explicit exclusions:** Blocked mandatory SIM is not PASS; do not promote synthetic model to production. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Only ACCEPTED if every mandatory synthetic SIM passes and replay matches; otherwise BLOCKED/FAILED. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
