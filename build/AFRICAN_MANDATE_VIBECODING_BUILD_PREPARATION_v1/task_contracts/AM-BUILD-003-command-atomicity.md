# AM-BUILD-003 — Atomic Commit and Save (First Wave)
**Status:** PROPOSED; not implemented.  
**Prerequisites:** domain command types, deterministic primitives, in-memory persistence test port.  
**Authority:** Domain v1.1, Technical v2 durable commit ordering, reconciliation R-01.

**Goal:** Accept one valid strategic command atomically; persist next state before replacing in-memory state; record immutable journal/audit record; deduct exactly one configured slot; reject duplicates/invalid actions without mutation. Implement EndTurn semantics in a separate clearly tested operation.

**In scope:** application operation coordinator, SimulationPort adapter contract, local persistence port/in-memory fault injection; tests. **Out:** browser UI, cloud sync provider, source data compilation, irreversible real-world effects.

**Tests:** slot 3→2 upon first committed action; invalid ID/known-prerequisite failure does not charge; same command ID twice does not produce event; durable write failure leaves authoritative prior hash/slot/revision; two concurrent writes serialized; EndTurn resolves one month and forfeits unused slots; final Month 20 resolves without Month 21.

**Acceptance:** AC-005/006/007/025; approved review of error classification and persistence port.
