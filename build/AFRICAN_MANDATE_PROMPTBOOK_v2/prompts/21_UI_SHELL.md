# Prompt 21 — Accessible UI shell and status surfaces

**Task ID:** AM-PB2-21  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 20 ACCEPTED  \n**Source authority:** Components Reconciled, Design Brief, tokens.css, design decisions

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Accessible UI shell and status surfaces.

**Implementation deliverables:** Create React shell using registered components, status turn/date/slots/save, attention queue, navigation, error/loading/partial states, semantic control behavior, responsive *proposed* desktop/tablet matrix clearly flagged; support keyboard and reduced motion.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/21.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Accessibility smoke/keyboard/no inaccessible buttons; 200% text zoom; no five fabricated headline numeric indicators; browser screenshots measured.

**Explicit exclusions:** Missing DESIGN_STANDARDS.md prevents final full design conformance certification. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** UI shell usable from projections with no simulator raw imports. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
