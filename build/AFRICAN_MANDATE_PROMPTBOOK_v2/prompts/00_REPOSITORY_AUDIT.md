# Prompt 00 — Repository audit and source inventory

**Task ID:** AM-PB2-00  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** None; repository access  \n**Source authority:** Build Preparation README; reconciliation; Domain §0, Technical v2

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Repository audit and source inventory.

**Implementation deliverables:** Inspect existing repository read-only; locate canonical source files and their SHA-256; identify current code, toolchain, tests, branches and missing design standards; produce docs/build/SOURCE_MANIFEST.md and docs/build/REPO_AUDIT.md; classify existing code as implemented/tested/proposed/unknown.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/00.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** No code changes; validate all paths and hashes; explicitly mark unavailable files; provide current git status and baseline commit if present.

**Explicit exclusions:** Do not initialize, overwrite, reformat or delete existing implementation. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Signed-off inventory and owner-approved next step; missing artifacts recorded. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
