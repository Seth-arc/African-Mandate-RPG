# Prompt 20 — Production application adapters and projections

**Task ID:** AM-PB2-20  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 05,08,11,17,19 ACCEPTED  \n**Source authority:** Technical v2 application, artifact registry, cache and projection

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Production application adapters and projections.

**Implementation deliverables:** Implement projection facade types (CampaignProjection, ActionPreview, ResolutionProjection), artifact registry SHA-256 verify, in-browser durable storage adapter/edit lock and sync status, narrative fallback integration; consume frozen earlier SimulationPort; no duplicate engine.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/20.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** No UI raw domain imports; stale revision rejected; local durability-before-swap; source artifact hash mismatch rejected; projection-cache invalidates on revision; offline fallback.

**Explicit exclusions:** Do not substitute a live source update into active campaign. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Adapter integration tests and stable snapshot/projection interfaces pass. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
