# Prompt 11 — Player knowledge and intelligence collection

**Task ID:** AM-PB2-11  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 09–10 ACCEPTED  \n**Source authority:** Domain knowledge/evidence/collection sections; Package 2 content contracts

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Player knowledge and intelligence collection.

**Implementation deliverables:** Implement typed EvidenceRecord, report, gap, collection task, emitted observation; explicit same-scope contradictionKey semantics, freshness recalculation from synthetic versioned factors, status transitions useful/partial/contested/inconclusive/delayed/failed; knowledge-only projections.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/11.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Task gives no instant intel; contradictory same-scope assertions remain; different-scope claims not contradiction; stale factor deterministic; missing != zero; hidden-state differential projection.

**Explicit exclusions:** No unapproved production confidence coefficients or truth leak through narrative or map. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** SIM-01, SIM-06, SIM-14 core properties pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
