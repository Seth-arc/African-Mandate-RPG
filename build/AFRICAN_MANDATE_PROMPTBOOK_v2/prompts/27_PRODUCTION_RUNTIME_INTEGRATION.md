# Prompt 27 — Production baseline and browser runtime integration

**Task ID:** AM-PB2-27  
**Track:** Production/release, technically and externally gated  
**Prerequisite gate:** 20,24–26 ACCEPTED  
**Source authority:** Technical Architecture v2 artifact, persistence and projection boundaries; Data & Methodology v1.1; accepted Prompt 25–26 manifests

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with the latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Replace the fixed browser demonstration with a production-artifact-backed, locally persistent game runtime.

**Implementation deliverables:** Deterministically compile the accepted Prompt 25 data and Prompt 26 scenario decisions into versioned baseline, scenario, methodology and browser-deliverable map artifacts; publish immutable hashes and provenance. Add one production composition root that verifies those artifacts, initializes or loads a campaign, acquires the browser edit lock, runs the accepted command and EndTurn services through the real simulation port, persists through IndexedDB before updating memory, and supplies only knowledge-safe projections to the existing UI. Keep synthetic fixtures available only on explicit test routes or test imports. Render “saved locally” only after the IndexedDB write completes, and support reload plus recovery from the last valid snapshot.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; do not create parallel command, persistence, projection or campaign-state owners. Record schema/version, artifact hashes, ownership and exact changed paths in `docs/build/handoffs/27.md`. Update acceptance evidence and source-to-test traceability. If an approved source lacks a value required by a production artifact, stop rather than copying a TEST_ONLY value or inferring one.

**Required executable tests and negative cases:** Two clean compilations produce byte-identical production artifacts; the production serializer rejects TEST_ONLY classifications; the browser starts a real campaign, commits a real action, ends a turn, reloads, and preserves the exact revision/history/hash; a failed durable write leaves the visible and in-memory state unchanged; corrupt or hash-mismatched artifacts and snapshots fail closed with recovery; stale revisions and concurrent tabs cannot double-commit; production UI imports remain behind the application projection boundary.

**Explicit exclusions:** No months 5–20 content, unapproved balance value, cloud sync/account system, leaderboard, hosting provider or deployment pipeline. Do not remove the synthetic acceptance harness. Apply all general non-invention, security, provenance, licensing, accessibility and hidden-state restrictions.

**Completion / gate:** A browser session uses accepted production artifacts, the real simulation/application services and durable local persistence for the approved initial content slice. Refresh restores the committed campaign, displayed save state is truthful, production artifact hashes are reproducible, and no TEST_ONLY content enters the production route. Execute all applicable project test commands, including the production build and browser suite; publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED.

**Stop conditions:** missing source/artifact/schema approval; no approved value for a required production field; invariant violation; failed persistence/reload/integration negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, exact artifact hashes, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
