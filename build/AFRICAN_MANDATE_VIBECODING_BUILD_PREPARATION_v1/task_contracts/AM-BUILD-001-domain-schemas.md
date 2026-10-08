# AM-BUILD-001 — Domain Zod Boundary (First Wave)
**Status:** PROPOSED; not implemented.  
**Prerequisites:** Gate A, pinned workspace; precise schema chapter review.  
**Authority:** Domain v1.1, Technical v2 Zod source-of-truth, Build Constitution.

**Goal:** Define canonical serialized Zod contracts and inferred TS types for `CampaignVersions`, `ScenarioDefinition`, ID/PartyRef/SubjectRef, core `CampaignMeta`, `EnvoyState`, sample subset of `ScenarioBundle`, and baseline envelopes without adding new writable state.

**In scope:** domain package schema modules, index exports, parser fixtures, negative unit tests. **Out:** reducers, GIS, real actor balance, formal authorization rules, UI.

**Tests:** numeric ranges, YYYY-MM-DD, country scope/test fixture tags, duplicate/cross-reference IDs, bad union kinds, unknown field rejection, JSON-safe data; ensure no unapproved defaults (`riskTolerance:50` etc.).

**Acceptance:** AC-001/002/003; evidence = typecheck and parser logs. Reviewer: domain/architecture. No production-valid `ScenarioBundle` claim until all registries completed.
