# AGENTS.md — African Mandate
## Mandatory entry sequence
Before coding: read `BUILD_CONSTITUTION.md`, the controlling upstream source chapter(s), `EXECUTABLE_CONTRACT_INVENTORY.md`, the current task contract, and relevant `ACCEPTANCE_MATRIX.md` rows. If these disagree materially, **stop only the affected task**, log an issue/ADR and complete independent tasks. Never invent stakeholder approval.

## Working rules
1. Implement the task's allowed scope only. No opportunistic feature rewrite or schema drift.
2. Classify every introduced scenario constant: APPROVED, TEST_ONLY, or blocked/TBD. No magic numbers outside named, versioned TEST balance fixtures.
3. Keep domain/state, deterministic simulation, application orchestration, player projection, presentation and data compiler as distinct packages. React cannot import hidden state or simulation directly.
4. Do not fabricate source observations, country-administrative polygon IDs, institution permissions or actor positions. Missing must be explicit.
5. All random resolution uses the specified keyed SHA-256 algorithm; no `Math.random`, wall-clock gameplay logic or runtime UUIDs inside authoritative simulation.
6. Command IDs may be generated externally by application, persisted and replayed. Derived simulation entity IDs must be deterministic.
7. `Commit` is an atomic durable transaction; `EndTurn` advances the simulation. Invalid/duplicate requests are idempotent and free.
8. Project historical source data stays immutable. All developments from October 2025 are `SIMULATED` in player-facing copy.
9. Separate player-visible causes and evidence from debug truth. Never leak hidden intent via availability, preview, map, dossiers or generated text.
10. Do not trust LLM prose to change any numeric or authoritative state. Plain-text templated fallback is required.
11. Test negative/edge cases, never only golden path. Use fixed vectors and explicit content hashes, not snapshots captured from a broken implementation and instantly approved.
12. Run formatter, lint, typecheck, unit/property tests, compiler test and the task's acceptance tests. Attach raw command/log excerpts or CI artifacts to the PR.

## PR handoff format
- Task ID and source authority (specific file/section)
- Files changed and reason; schema compatibility and migration impact
- New choices: none, or proposal IDs awaiting approval
- Deterministic vectors/seed and fixture classification
- Tests executed; pass/fail and log locations
- Knowledge-boundary/security checks
- Remaining blockers (do not mark production-ready)

## Forbidden shortcuts
No fabricated success output; no changing tests to match implementation without reviewing source authority; no unchecked `as any` to bypass serialized contract; no arbitrary field-path rule interpreter; no frontend-authored truth; no geometry in `CampaignState`; no new writable five-indicator gauges; no automatic rollback; no client-trusted leaderboard scores; no unapproved external source redistribution.
