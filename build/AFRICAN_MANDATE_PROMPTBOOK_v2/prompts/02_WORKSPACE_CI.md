# Prompt 02 — Pinned workspace and CI

**Task ID:** AM-PB2-02  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 01 ACCEPTED  \n**Source authority:** Technical v2 toolchain/workspace; Repository Bootstrap

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Pinned workspace and CI.

**Implementation deliverables:** Create exact pinned Node/pnpm workspace (actual versions recorded from approved setup), frozen lock, ESM TS packages domain, simulation, application, data-pipeline, content, ui/web and tooling; public exports and import restrictions; CI lint/typecheck/unit/schema checks; no gameplay implementation.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/02.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Clean install, lint, typecheck, unit smoke test, forbidden import compile/lint failure.

**Explicit exclusions:** Do not assert a browser matrix or basemap provider is approved. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Clean reproducible install and evidence log; package graph documented. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
