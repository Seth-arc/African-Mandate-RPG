# AM-BUILD-002 — Deterministic Kernel Primitives (First Wave)
**Status:** PROPOSED; not implemented.  
**Prerequisites:** pinned toolchain and Zod scalar conventions.  
**Authority:** Technical Architecture v2 hashing, keyed sampling, deterministic IDs and rounding; Domain v1.1.

**Goal:** Implement canonical JSON, SHA-256 keyed random draws, deterministic derived IDs, round-half-away-from-zero, and hash integrity APIs using explicit fixed test vectors from the source. Never generate authoritative randomness using Math.random or a mutable RNG stream.

**In scope:** pure simulation canonical primitives, unit/property tests, public fixed-vector test artifact. **Out:** command dispatcher, campaign content, live dataset compilation.

**Tests:** two clean processes produce same byte output/hash; different resolution keys differ, stable 53-bit float range, stable 96-bit ID and collision guard, unordered-record normalization before hash, -0 normalization, prohibited types rejected, negative-half rounding.

**Acceptance:** AC-004. The initial expected vectors must be traced to Technical v2, not invented from the implementation under test.
