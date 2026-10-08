# African Mandate — Stage 2 Package 4: Gameplay Validation and Simulation Readiness

**Version:** 0.1 | **Status:** QA design and static fixture scaffold, NOT a completed simulation test run.  
**Authoritative dependencies:** Domain Model v1.1; Technical Architecture v2; Data & Methodology v1.1; Game Design v2.1; approved Stage 1; Stage 2 Packages 1–3.  
**Scope:** Months 1–4, 1 October 2025–31 January 2026. Five-country Sahel scenario; the initial Mopti focus remains an issue-file placeholder pending validated administrative geometry. Maximum 3 consequential strategic decisions per month (12 in the four-month slice). Historical observations end 26 September 2025; 27–30 September unknown, not zero.

## 1. Acceptance policy

There are three evidence classes. `STATIC_PASS`: a self-contained document/fixture lint successfully executed. `SIMULATION_PENDING`: needs compiled scenario content plus headless engine integration and cannot currently be marked passed. `EXTERNAL_PENDING`: needs data/legal/institutional assessment. Never relabel STATIC_PASS as a verified gameplay pass. Never treat fictional reports as historical observations.

The release gate is **BLOCKED** until all mandatory simulation and external tests pass. Static checks are necessary but not sufficient. Once complete, pass gate only with run logs, hash fixtures, pinned seed/versions, coverage matrix, and sign-offs.

## 2. Traceability and scenario contracts

- Authoring action catalogue: the 18 explicit `action_*` identifiers in Package 3, section 4; the file itself describes these as provisional authoring entries and not compiled `ActionDefinition`s. The validator reads a machine-readable inventory derived from that source and crosschecks against the source file.
- Initial evidence: `evidence_m01_access_gov_signal` plus Package 2 independent civic stream; don't misclassify "willing to discuss" versus "independent access unverified" as contradiction.
- Cases: `case_access_monitoring`, `case_civilian_access`, `case_corridor_resilience` — case opening is distinct from formal authorization and launch.
- Geography: `zone_pending_mopti_adm1` is strictly a preproduction sentinel, forbidden in production outputs.
- Authoring research blocker: `gap_m01_institutional_procedure` is **not** an in-game collection task merely because it has a gap prefix.
- Proposed actor reactions are scenario-configurable; do not serialize a real official's fictional stance as a historical fact.

## 3. Mandatory scenario-based simulations

| ID | Script | Required setup | Expected observable and authoritative properties | Coverage |
|---|---|---|---|---|
| SIM-01 | Collect-first | Known access gap, legal AU collection channel; delayed task profile | Slot -1 on committed request, task created and due later, no instant hidden-state reveal, evidence emitted only on due/resolution | M1–M3 |
| SIM-02 | Diplomacy-first | Known Mali channel, configured issue stance and source-safe reply | Interaction consumes one slot, reply knowledge only if delivered, memory relationship effect exactly once, no collective consent inferred | M1–M4 |
| SIM-03 | Alternative B/C | Civilian route and asset-status gaps; sector contact definitions | Distinct viable action path without forced access-monitoring case; unverified infrastructure and displacement remain unknown | M1–M4 |
| SIM-04 | Inaction | Opening state, no mandatory blocking items | Four consecutive EndTurn succeed with no forced case, appropriate expiry/persistence, Month 5 begins, doctrine review available not codified | M1–M5 |
| SIM-05 | Overconfidence | Adopted high-confidence assessment with known evidence and later contradictory report | Later evidence may undermine status; adopted hypothesis does not silently rewrite; accountability is source-traceable | M1–M4 |
| SIM-06 | Hidden-state differential | Two identical **player-known** projections but different hidden intentions (controlled test only) | Eligibility/preview identical, actual committed reactions may differ, subsequent projections differ only when observations delivered | M1–M4 |
| SIM-07 | Authorization gate | Open case but no approved procedure | Request rejected at validation without slot or mutation; known reason displayed; never invent mandate authority | M2–M4 |
| SIM-08 | Duplicate command | Same persisted commandId submitted twice | Second attempt no double slot, events, memory, resources, or revision | Any |
| SIM-09 | Commitment breach | Configured due turn and fulfillment rule | Exactly one transition to fulfilled/breached/waived/expired, memory created once, no double effects | M3 onward |
| SIM-10 | Negotiation scope | One defined decision package with monitoring terms and scope condition | One slot for coherent package; persistent scope and commitment; derived distortion risks; no instant authorization | M3–M4 |
| SIM-11 | Capacity/deadlock | Max three slots, mandatory-response reservation config | Optional spending may not create unanswerable mandatory response; EndTurn never softlocked by last action | All |
| SIM-12 | Replay/save | Fixed seed, content hashes, ordered commands, IndexedDB adapter or in-memory test port | Canonical deterministic state hash across repeat and reload; failed durable write leaves authoritative state uncommitted | All |
| SIM-13 | Calendar edge | Four end-month transitions | Oct → Nov → Dec → Jan → Feb; resolution runs before increment; unused slots expire; no extra slots | All |
| SIM-14 | Source contradiction | Claims same subject, metric, reference interval; then different scope | incompatible same-scope claims contested; different propositions not treated as contradiction | M1–M3 |
| SIM-15 | No-data geography | Missing zone observations and provisional ID | missing≠zero, no stability inferred; production compiler rejects unresolved zone sentinel | All |
| SIM-16 | Narrative fallback | Generation disabled/stale context/outage | templated text used, status remains coherent, game mutations unaffected, hidden truth absent from prose | All |

**Minimum execution:** fixed golden seed plus at least 50 deterministic headless sampled campaigns per difficulty profile; 20-turn sweep when ScenarioBundle is full. Fifty is a proposed initial engineering smoke-test count, **not** statistical balance certification. Record sample coverage and failures; never claim quality simply because 50 runs finish.

## 4. Fundamental invariants (tests must fail if violated)

1. Player eligibility and decision previews consume player-known projections only, never hidden red lines or actor intent. Differential property tests modify hidden state while holding known state fixed.
2. Atomic command validation: invalid or duplicate commands do not charge a decision, change world, emit events or increment revision.
3. Decision packages are committed immediately, one consequential slot, no in-turn undo or reorder. Three slots never increase or carry forward.
4. Intel request produces task; results arrive only from observation/collection resolver, may be useful, partial, contradictory, inconclusive, delayed or failed.
5. Issue-specific coalition position differs from general relationship; coalition and authorization do not implicitly follow consultation.
6. Memory's original relationship effects applied exactly once; commitments transition only by eligible settlement rule.
7. Authorization may resolve only under scenario-vetted `AuthorizationProcedureDefinition`; no OCHA, AU liaison, AES/ECOWAS contact by itself authorizes a mandate.
8. Real-world baseline observations immutable; historical fact and fictional outcome lexically/structurally distinct; missing displacement/asset/ACLED data not replaced by fabricated totals.
9. Keyed SHA-256 randomness and ID derivation plus JSON canonical hash must match architecture vectors. Same semantic inputs/history => identical authoritative hash.
10. Month 4 end resolution precedes Month 5 doctrine review; review does not silently adopt doctrine.
11. No information leak through action visibility, forecasts, player-facing causal explanations, map selectors or AI narrative prompts.
12. Production compilation rejects unfinished `[P]`, `[X]`, `PENDING_`, placeholder IDs, undefined fact keys/effects and cross-references.

## 5. Test layers and required artifacts

**Layer S: static contracts.** Parse source action IDs and fixture scenarios; check unique IDs, 1-slot cost, script references, four months, three slots, forbidden production placeholders, evidence/case labels. This package includes an executable Python *authoring linter*; it does not test game behavior.

**Layer K: kernel unit tests.** Vitest tests for deterministic samples/vectors, typed FactQuery tri-state, rule scope, atomicity, effect handler ranges, deterministic ID collision, commitment and memory. Deliver `pnpm test:kernel` logs.

**Layer H: headless integration.** Compile a minimal **TEST** scenario bundle with test-only balance values; run SIM-01 through SIM-16 against actual dispatcher/end-turn; assert snapshots, projections, events, hashes, and stable replay. Golden artifacts include seed, versions, command ID history, expectation schema and output hash.

**Layer P: projections and UI.** Rendering and keyboard tests on decision preview, evidence contradictions, mandated response, save error and resolution; Playwright + restricted-import and knowledge-boundary tests. Test narrative fallback with network blocked.

**Layer R: research and release.** Approved administrative boundary IDs/geometries, historical data observation windows, licences, actor/institutional authority, signed-off procedures, accessible copy and regional review; public leaderboard server verification is a **separate architecture change**, not a client-side trust assumption.

## 6. Coverage matrix and defects

Each authored decision receives traceability: action ID → decision family → player-known prerequisites → command type → cost profile → effect profiles → events → delayed callbacks → expected projection → tests. Block compile if a link is missing. Keep open issues tagged `P0` (compiler or truth/safety break), `P1` (quality and broad content), or `P2` (polish). Defects must reproduce from pinned seed, scenario version, command history and pre-state hash.

## 7. Gate decisions

**Gate 4A — Content contract review:** ready for conditional review; use static linter, crosswalk and outstanding dependency list. Does not require complete baseline.  
**Gate 4B — Headless four-month slice:** BLOCKED; engine, executable scenario bundle and test profile are absent from supplied project files.  
**Gate 4C — Production Sahel data and historical signoff:** BLOCKED; geographic registry, completeness/licence review and formal institutional authorizations unverified.  
**Gate 4D — Player/UI integration:** BLOCKED pending 4B and functioning application/projection interface.  
**Gate 4E — Verified leaderboard:** BLOCKED pending server-side replay verification specification, implementation and security tests.

## 8. Required outputs before developer handoff

- Signed scenario registry and issue-specific actor behavior assumptions.
- Real data source/administrative geometry manifest with dates, licences and completeness flags.
- `ScenarioBundle` + `BaselinePackage` with stable immutable hashes and pinned methodological versions.
- Validated `ActionDefinition`, `AuthorizationProcedureDefinition`, typed effect profile and balance data without placeholders.
- Deterministic command scripts, expected result fixture hashes, kernel/headless test report.
- Projection-safe narrative and UI coverage; documented legal/institutional signoff.

## 9. Next implementation sequence

1. Freeze Package 1–3 action/actor IDs in an interim authoring inventory, recording compatibility aliases if renamed.
2. Implement minimal `domain` Zod schemas and the headless engine ports; commit deterministic SHA-256 fixed vectors before gameplay reducers.
3. Register test-only sample actor/position/collection profiles and explicit `[T]` prices, not real history or production defaults.
4. Compile a **non-production one-zone fixture** using synthetic geometry; wire SIM-01/02/04/07/08/12 first as P0 cases.
5. Add branch B/C, contradiction, mandate negotiation, callbacks, confidence and fairness tests; gate on zero knowledge leaks.
6. Replace provisional geography/baselines and approve legal procedures before any production Sahel bundle or public board.

**No headless engine was built or run as part of this package.** All SIM-xx expectations are proposed, executable only after adapters/content exist.
