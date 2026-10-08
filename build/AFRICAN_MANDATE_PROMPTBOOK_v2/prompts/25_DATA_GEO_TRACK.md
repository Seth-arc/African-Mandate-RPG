# Prompt 25 — Production track: boundaries and data acquisition

**Task ID:** AM-PB2-25  \n**Track:** Production/release, externally gated  \n**Prerequisite gate:** 19 ACCEPTED; external input required  \n**Source authority:** Data Methodology v1.1; Fixture Plan; research register

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Production track: boundaries and data acquisition.

**Implementation deliverables:** Research/obtain owner-approved admin boundary provider/edition/level, ACLED representative audited extract, IDMC usable displacement or explicit exclusion, source native finance/status or omit, licenses; build manifests and source audit; no production baseline until approvals.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/25.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Five ISO parents, historical date admission, geography topology and allocation, dedup row-grain, provenance, license tests and source completeness reports.

**Explicit exclusions:** No source backdating, invented zone counts, distribution of restricted source or synthetic geom in production. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** EXTERNAL_PENDING until signed source/geometry/licensing manifests. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
