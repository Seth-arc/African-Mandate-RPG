# Prompt 06 — Isolated synthetic compilation fixture

**Task ID:** AM-PB2-06  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 03–05 ACCEPTED  \n**Source authority:** Data & Methodology §§11–14, Appendix C; Fixture Plan v1

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Isolated synthetic compilation fixture.

**Implementation deliverables:** Create a FixturePackage TEST_ONLY parser and isolated synthetic polygon/asset/claim examples, deterministic ID and source-audit output with SHA-256; define fixture->test initialization transform but DO NOT claim complete ScenarioBundle; keep raw historic facts separate.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/06.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Two clean builds byte-identical, controlled input change alters hash, edge/on/off polygon assignment, missingness != 0, postcutoff exclusion, duplicated source ID audit, publish gate rejects TEST_ONLY.

**Explicit exclusions:** Do not fabricate real Mopti boundary, ACLED totals, displacement or 2025 asset operating status. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Fixture kernel compiles locally, full-production serializer rejects it. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
