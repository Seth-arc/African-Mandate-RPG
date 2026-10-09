# Deterministic primitive contract

**Contract version:** 1.0  
**Task:** AM-PB2-04 / PB2-04  
**Runtime owner:** `@african-mandate/simulation`  
**Artifact-schema owner:** `@african-mandate/domain`  
**Status:** READY_FOR_REVIEW; no gameplay or production content

## Public APIs

| Contract | Public API | Source authority |
|---|---|---|
| Synchronous SHA-256 | `utf8Bytes`, `sha256Bytes`, `sha256Hex`, `bytesToLowerHex` | Technical v2 §§14-15 |
| Keyed sample | `deterministicSample`, `deterministicSampleWithDigest` | Technical v2 §14 and Domain §99 |
| Simulation-derived ID | `simulationIdMaterial`, `deriveSimulationId`, `DerivedIdCollisionError` | Technical v2 §13.2 |
| Canonical serialization/hash | `canonicalJson`, `hashCanonicalJson`, `CanonicalJsonError` | Technical v2 §§11 and 15 |
| Immutable snapshots | `freezeJsonSnapshot`, `hashImmutableSnapshot` | Technical v2 §§11 and 15 |
| Quantization | `roundHalfAwayFromZero` | Technical v2 §12.2 |
| Vector artifact | `DeterminismVectorArtifactSchema` and inferred type | Technical v2 §14.1; wrapper proposal AM-GOV-017 |

All functions are pure except `freezeJsonSnapshot`, whose named purpose is to recursively freeze the caller-provided JSON-safe snapshot. The hashing and randomness implementation imports no Node-only API and uses standardized JavaScript and `TextEncoder`; tests compare its bytes to the Web Crypto SHA-256 implementation exposed in the Node 22 runtime.

## Frozen source vectors

`tests/fixtures/determinism/technical-v2-random-vectors.json` copies only Technical v2 §14.1 values. Its provenance pins source SHA-256 `982be4ecd82b996e14be83b6fd89a60a2876bb4e2505ed195889ad4f81dcee30`. Vector B omits a repeated seed heading in the source; the artifact records the shared section seed and explains that scope explicitly. Its published digest independently verifies that interpretation.

Technical v2 does not publish an exact derived-ID output or canonical-state fixture value. None is presented as source-canonical. Those implementations are instead checked against their specified byte material, independent Web Crypto digests, mutation/order properties, and identical output from two fresh processes. The fresh-process diagnostic ID and hash become a versioned golden only if the owner accepts Prompt 04; until then they are review evidence, not upstream source.

## Canonicalization boundary

- Accepted: `null`, booleans, strings, finite numbers, dense arrays, and plain objects.
- Rejected: `undefined`, functions, symbols, accessors, non-enumerable data, sparse/extended arrays, `Date`, `Map`, `Set`, `BigInt`, non-finite numbers, class instances, and cycles.
- Object keys use deterministic ECMAScript string ordering; arrays retain their existing semantic order.
- Unicode is UTF-8 encoded without NFC/NFD normalization. Canonically equivalent but byte-distinct strings remain distinct.
- `-0` serializes as `0`.

The source says “lexicographically” but does not name a separate Unicode collation or normalization algorithm. The ECMAScript key ordering, no-normalization boundary, NUL-delimiter rejection, and vector-wrapper fields are therefore recorded as TEST_ONLY implementation proposals in AM-GOV-017 rather than silently treated as upstream product decisions.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-04 | Deterministic primitives and fixed vectors | `tests/unit/determinism.test.ts`; `scripts/verify-determinism-vectors.mjs`; Prompt 04 log |
| AC-004 | Canonical JSON/SHA, keyed RNG, IDs, and rounding | exact source vectors A/B; Web Crypto parity; two fresh processes; negative type, collision, Unicode, order, and rounding tests |

