# Prompt 09 — Calendar, scheduling and attention lifecycle

**Task ID:** AM-PB2-09  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 08 ACCEPTED  \n**Source authority:** Domain turn calendar/end-turn ordering; GDS v2.1 blocking attention

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Calendar, scheduling and attention lifecycle.

**Implementation deliverables:** Implement month advancement exact calendar, decisions reset, unused forfeited, last month resolution/completion, scheduled consequence ledger and persistent situations/attention; register order-of-resolvers interface not invented ad hoc, with initial no-op adapters clearly labeled.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/09.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** October 2025 to February 2026 four rollover test; final Month 20 does not advance; mandatory slot reserve; last-command never softlocks; persistence/expiry only per explicit rules.

**Explicit exclusions:** No invented crisis/spontaneous turn effects to make UI interesting. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Lifecycle tests pass with trace and bounded mandatory response. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
