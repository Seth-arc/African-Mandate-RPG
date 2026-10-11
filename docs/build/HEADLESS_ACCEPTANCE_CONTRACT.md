# Independent headless acceptance contract

**Task:** AM-PB2-19 / PB2-19  
**Schema version:** `1.0.0`  
**Runner version:** `0.1.0-test.1`  
**Owner:** `@african-mandate/headless`  
**Classification:** `TEST_ONLY_HEADLESS_ACCEPTANCE`  
**Status:** READY_FOR_REVIEW; never production-admissible

## Authority and boundary

The runner consumes the accepted Prompt 18 compiled artifact and only public APIs from the accepted domain, simulation, application, data-pipeline, and narrative packages. Package 4 Validation Spec sections 3-6 define the independent SIM behavior. AM-GOV-047 records the exact artifact wrappers as test-only proposals because the source does not prescribe their serialized field names.

The runner does not decide production correctness, admit synthetic content, or write canonical gameplay state. It cannot return `ACCEPTED`. A reviewable result requires exact observable equality for all sixteen mandatory SIMs, zero failed samples, and identical first-run, repeat-run, and reload hashes. Any blocked mandatory SIM prevents `READY_FOR_REVIEW`.

## Frozen fixture and results

- Seed: `am-pb2-19-independent-golden-seed-v1`
- Compiled content version/hash: `0.1.0-test.1` / `c9a12875cf70933777ef3d4d45a7a4f6bb0d332524364afc10561bc62751d8ac`
- Difficulty: `difficulty_test_only_standard_v1` (the only approved compiled test difficulty)
- Coverage: 50 requested, 50 completed, 0 failed; four turns and three actions per turn; 800 commands
- Coverage aggregate hash: `a10c63c39627c5420391d367db69024179021e6956d8a051530a3d392ee00701`
- Replay/repeat/reload hash: `8b903e93b5f0ac00d1804fe385e018bc72e1e9b86f03d51fd3a94b5ee7f23f32`
- Full acceptance artifact hash: `47195790f1e7ba07285c8ef59b422045cfec6d2262e8999045f2d07231dc2fab`

Each sample executes twelve strategic commands and four EndTurn commands. Sample identities are seed-derived and therefore intentionally produce 50 distinct final hashes; determinism is established by repeating sample zero and reloading its frozen snapshot.

## Independent golden inventory

| SIM | Required observation boundary | Acceptance IDs |
|---|---|---|
| SIM-01 | collect consumes one slot, delays evidence, and emits only on due resolution | AC-009 |
| SIM-02 | consultation returns knowledge, creates one memory, and grants no collective consent | AC-010 |
| SIM-03 | alternative/defer path remains viable without forced case or invented data | AC-007, AC-015 |
| SIM-04 | four quiet rollovers enter Month 5 without forced case or doctrine codification | AC-007, AC-014 |
| SIM-05 | later contradiction contests metadata without rewriting the hypothesis or declared confidence | AC-012 |
| SIM-06 | hidden-state differential is projection/menu-invariant until an observation is delivered | AC-008 |
| SIM-07 | known-missing authorization rejects without slot cost, mutation, or invented authority | AC-013, AC-023 |
| SIM-08 | duplicate command has no second slot, event, or revision | AC-006 |
| SIM-09 | due commitment breaches once, creates one memory, and has no repeated effect | AC-010 |
| SIM-10 | one negotiation package persists scope, its linked commitment, and derived distortion risk without requesting authorization | AC-013 |
| SIM-11 | optional use of reserved capacity rejects, mandatory response commits, EndTurn remains live | AC-007, AC-025 |
| SIM-12 | injected save failure is uncommitted; replay, reload, and trace order match | AC-005, AC-006 |
| SIM-13 | October-to-February calendar, resolver order, slot expiry, and reset remain exact | AC-007 |
| SIM-14 | same-scope conflicting evidence contests; different scope does not | AC-011 |
| SIM-15 | missing geography/data is not zero, produces no stability inference, and fails production admission | AC-016–AC-019 |
| SIM-16 | deterministic fallback handles stale response without mutation or hidden truth | AC-020, AC-022 |

Goldens contain source-defined observable codes, fixture identity, and acceptance IDs. They do not copy implementation result objects. The outcome schema requires exact ordered equality between expected and observed codes before `PASS` is legal.

## Production blockers

All nine Prompt 18 unimplemented-system records are copied into the immutable result as `BLOCKED`: verified geography, admitted historical baseline, production actor profiles, vetted authorization procedures, production balance/effects, production finance terms, strategic reallocation effects, full twenty-month content, and production evaluation. The four-month 50-sample sweep is complete for the accepted test fixture; a twenty-month production sweep is unavailable and is not misreported as a passed gate.

## Public API and downstream compatibility

`@african-mandate/headless` exports the five schemas, inferred artifact types, fixed seed and SIM inventory, immutable goldens, initial-state builder, runner, and canonical artifact hash helper. No accepted predecessor schema changes. The package is an integration-test leaf and must never become a dependency of domain, simulation, application, content, narrative, data-pipeline, UI, or web runtime code.

## Verification

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm run test:headless
corepack pnpm run ci
py -3 -B -m unittest discover -s tests/governance -p "test_*.py" -v
git diff --check
```

Pass means SIM-01 through SIM-16 all report PASS, the focused suite reports 9/9, coverage is 50/50 and 800 commands, all three replay hashes equal the frozen value, the artifact hash matches, nine production gates remain BLOCKED, full CI/governance pass, and Prompt 19 remains no higher than READY_FOR_REVIEW.
