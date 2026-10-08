# Prompt 29 — Release evidence and sign-off

**Task ID:** AM-PB2-29  \n**Track:** Production/release, externally gated  \n**Prerequisite gate:** 24–28 ACCEPTED, or explicitly scoped noncompetitive release with authorized exclusion  \n**Source authority:** Package 4 gates and readiness register; Writing Standards; Data/Methodology

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Release evidence and sign-off.

**Implementation deliverables:** Collect CI, artifact hashes, licensing, geographic and legal reviews, determinism, replay, accessibility, regional copy, balance, browser matrix, compatibility, deployment and rollback evidence into dated release decision.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/29.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Re-run clean acceptance, verify artifact immutability, restore/replay saves, deployment smoke, no critical unresolved findings.

**Explicit exclusions:** Do not label partial QA as release pass or silently waive mandatory gates. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Owner signs PROD_ACCEPTED; otherwise publish BLOCKED gate report. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
