# Prompt 17 — Deterministic narrative fallback and templates

**Task ID:** AM-PB2-17  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 11–16 ACCEPTED  \n**Source authority:** VOICE, GLOSSARY, Writing Standards v2, Package 2 opening documents

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Deterministic narrative fallback and templates.

**Implementation deliverables:** Implement plain-text templated response system before integration test; fixed SIMULATED marker, source/date/knowledge-limited claims, stable evidence IDs, no fabricated real-person quote; NarrativePort returns deterministic fallback independent of AI; stale response hash guard.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/17.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** All six collection outcomes render correctly; generation unavailable/stale => factual template; hidden state never in output; number/date unit sanity.

**Explicit exclusions:** No AI-generated authoritative changes or HTML injection. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** SIM-16 passes without network. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
