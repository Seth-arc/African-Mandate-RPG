# Build Constitution v1 — African Mandate
**Normative scope:** Instructions for a future implementation team/agents; not a substitute for approved upstream domain or legal decisions.

## 1. Source precedence
1. Domain Model & Simulation Spec v1.1: ontology, state ownership, engine invariants.
2. Technical Architecture v2: package boundaries, determinism, persistence, build architecture.
3. Data & Methodology v1.1: observed baseline, geography, time validity, provenance and licensing.
4. Game Design v2.1: player experience and economy, subject to domain invariants.
5. Owner-approved Stage 1 narrative and Stage 2 authoring packages: provisional scenario content and fixture contracts.
6. Reconciled design/components, tokens, voice, glossary and writing: presentation/copy, subject to all higher-order constraints.

**Cross-version policy:** Explicitly dated and approved decisions supersede earlier *open or proposed* statements about the same issue, not fundamental engine invariants. Conflicts between approved requirements are escalated and versioned; never silently adjudicated by an agent. `AFRICAN_MANDATE_SPEC_RECONCILIATION_v1.md` is a binding change notice only where its entries are LOCKED and consistent with more recent approved decisions. Its R-10 proposed 2026 start is superseded by Data & Methodology decisions AM-DM-001/002/003 of 2026-10-08.

## 2. Approved scenario constants
- Role: **African Union Strategic Envoy**; fictional appointment with limited delegated remit.
- Playable countries: Mali (ML), Burkina Faso (BF), Niger (NE), Chad (TD), Mauritania (MR).
- Historical conflict anchor/cutoff: **2025-09-26**; simulation starts **2025-10-01**. Preserve unknown noncoverage **2025-09-27–30**.
- Calendar-month turns, **20** total (October 2025–May 2027), **3** consequential decisions per month; no carryover, purchasing or bonus decisions.
- Zones: validated administrative polygons with stable identifiers. **Provider, edition, level, and five-country crosswalk are not approved**. Admin-1 and Mopti are candidates only.
- Decision workflow: free inspection and uncommitted drafts; Commit immediately resolves a single atomic consequential command, consumes configured slots, persists before in-memory replacement; committed decisions cannot be reordered/undone; End Month resolves background processes.
- Month 5 doctrine review appears only after Month 4 resolution; codification itself costs a Month 5 decision if chosen.
- Six evaluation dimensions: security, civilian outcomes, regional stability, institutional cohesion, legitimacy, mandate sustainability. Five headline UI indicators are **unapproved derived candidate projections**, not writable state or default status-strip gauges.
- Verified leaderboard is an approved **product requirement** but its server-trust architecture remains a **versioned amendment** to core v1 non-goals; composite scoring/cohorts are not approved. No client-scored ranking ships.

## 3. Non-negotiable engine invariants
- **Five distinct epistemic layers:** immutable definitions; immutable observed baseline; hidden simulation truth; player-acquired knowledge; non-authoritative presentation.
- No duplicate writable source for a concept. Conflict, civilian and infrastructure values remain in canonical subsystems; territory summaries are selectors.
- Player preview, map, dossiers, rule eligibility and narrative may use **only player-knowledge projections**. Hidden factors resolve *after* an apparently known-eligible attempt, never leak through precommit menu gating.
- Unknown and missing observations remain `null` with reason/confidence, **never zero**. Historical 2026 datasets do not automatically assert 2025 operational conditions.
- AI may render and rephrase state-confirmed narrative; never chooses probabilities, hidden intent, state deltas, authorization or scores.
- Deterministic keyed randomness, deterministic IDs, canonical JSON/SHA-256 hashing; same pinned versions, seed and ordered commands ⇒ same authoritative state hash.
- Authoritative snapshots are JSON-safe, snapshot-authoritative with immutable audit events (**not** pure event sourcing). Memory relationship effect applies exactly once.
- Invalid/replayed commands have no effect, cost, emitted event or revision increment. Durable local write succeeds before new state becomes authoritative in memory.
- Actual formal authorization uses approved institutional procedure and host-scope requirements; a liaison or case creation is not authorization.
- Simulated reports about real places/institutions carry `SIMULATED`; no invented quotes attributed to named living real people.

## 4. Parameter and evidence classes
`APPROVED` = source-approved binding value; `PROPOSED` = design recommendation requiring owner signoff; `TBD_BALANCE` = unresolved calibrated number; `TEST_ONLY` = synthetic, versioned engineering constant forbidden in production; `BLOCKED` = no production compilation until gate passes; `OBSERVED` = admitted source-linked historical record; `SIMULATED` = authored or engine-generated fictional event.

No agent may transform `PROPOSED`, `TBD_BALANCE`, `TEST_ONLY`, or `BLOCKED` into `APPROVED` by filling a required schema field. A test fixture must use conspicuous `synthetic_test_only` and include a compile mode that rejects promotion to production.

## 5. Repository governance
- Use exact pinned Node/pnpm/GIS toolchain and frozen lockfile after owner/team selection. All workspace code ESM, strict TS, Zod authoritative for serialized contracts.
- UI imports **application/projection API**, never simulation engine or hidden campaign store. Registry and tests enforce this.
- Map geometry lives in immutable map artifacts (PMTiles), selectable features keyed by `subject_kind` and `subject_id`; WGS84 EPSG:4326 longitude/latitude during data compilation.
- Production release requires dated source/licence review, validated geography, actor/authority institutional review, headless replay, projection leakage checks, UI/accessibility checks and version/hash manifests.
- Every change must cite its controlling spec sections in PR/task notes and attach test evidence. A change that requires a new game or architecture decision first drafts an ADR, not new engine behavior.

## 6. Prohibited autonomous decisions
No invented stakeholder approval; no numeric stance, multiplier, confidence default, population, displacement or conflict value; no inferred 2025 infrastructure operation; no invented boundary; no hidden-truth narrative; no actor moral rankings; no unverifiable retrospective historic claims; no unapproved institutional powers; no unsanctioned server-scoring implementation; no new player decision slots or rollback semantics.
