# Prompt 04 — Deterministic primitives and fixed vectors

**Task ID:** AM-PB2-04  \n**Track:** Synthetic engineering / test-only  \n**Prerequisite gate:** 03 ACCEPTED  \n**Source authority:** Technical v2 hashing/ID/RNG/quantization; Domain §3.6

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Deterministic primitives and fixed vectors.

**Implementation deliverables:** Implement UTF-8 keyed SHA-256 first-56-bits>>3 randomness, stable derived IDs from seed/entity/resolutionKey/ordinal, canonical JSON, round-half-away-from-zero, immutable snapshot hashes; copy exact canonical vectors from source and freeze provenance.

**Inputs and output contract:** Consume only validated, version-pinned contracts from accepted predecessor prompts; publish typed public APIs and artifact schemas under the appropriate package. Record schema/version, ownership and exact changed paths in `docs/build/handoffs/04.md`. Update acceptance evidence and source-to-test traceability. Do not add a second mutable source of truth. If a proposed interface lacks a canonical exact field, document it as a test-only design proposal requiring review; do not silently canonize it.

**Required executable tests and negative cases:** Byte-exact fixed vectors, unicode normalization boundaries, -0, invalid NaN/undefined, order invariance for unordered structures, Node/browser parity; distinct input changes hashes.

**Explicit exclusions:** Do not use Math.random or randomUUID inside simulation or change source vectors to satisfy tests. Apply all general non-invention, security, provenance, licensing, and hidden-state restrictions.

**Completion / gate:** Independent fixed vectors pass on two clean runs. Execute all applicable project test commands, publish actual logs and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED. Failed, skipped, or blocked tests remain visible.

**Stop conditions:** missing source/artifact/schema approval; invariant violation; unreviewed production value; failed mandatory negative test; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, fixed seed/fixtures where used, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
