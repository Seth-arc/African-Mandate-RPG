# Production simulated scenario policy

**Task:** AM-PB2-26 / PB2-26  
**Schema:** 1  
**Contract:** `1.0.0`  
**Content:** `1.0.0-simulated.1`  
**Classification:** `PRODUCTION_SIMULATED_INSTITUTIONAL_MODEL`  
**Owner decision:** AM-GOV-062, 2026-10-15  
**Canonical artifact hash:** `ab4ccb03b7b638c62f37c27111a2bd27cd156008d2b8b4e8bcad7c5ecb42d904`

## Scope and disclosure

This configuration is playable fiction for an individual noncompetitive build. Institutional roles, procedures, actor positions, uncertainty, action costs, balance values and evaluation coefficients are game design, not claims about law, history, government intent or institutional practice. Every institutional role and procedure carries a `SIMULATED:` disclosure and `historicalClaim`/`legalClaim` is always `false`.

The artifact duplicates no historical claim. It pins the Stage 1, Package 1 and Data & Methodology source hashes for vocabulary and constraints, while `sourceClaims` is required to remain empty. Existing TEST_ONLY content is neither imported nor promoted.

## Procedures and actors

Five host-specific fictional procedures use the same transparent game sequence: Commission submission, regional consultation, simulated PSC review and affected-host game consent. Each takes two turns and expires after six. AES and ECOWAS are consultation roles only in this model; neither is a grant authority. That is a game rule, not a statement of real competence.

Nine functional actor assumptions cover the AU Commission, PSC secretariat, AES, ECOWAS and five host focal points. Each assumption is versioned, bounded 0-100, carries an uncertainty interval and expressly denies historical-claim status. No real person or private intention is represented.

## Costs and balance

All three consequential actions consume one decision slot. Evidence collection costs 6 secretariat capacity; consultation costs 5 political capital and 3 secretariat capacity; the simulated authorization request costs 12 political capital and 8 secretariat capacity. Balance keys use the `simulated.*` namespace and the existing canonical `BalanceConfigurationSchema`.

## Six-dimension evaluation

Each canonical dimension is evaluated separately over exactly 20 ordered snapshots:

```text
score = clamp(round(0.4 * ending + 0.6 * trajectory mean
                    - min(25, 2 * turns below 25)
                    - 0.25 * countervailing harm), 0, 100)
```

The result also records starting score, ending score, improving/stable/deteriorating trend, critical-turn count and knowledge-safe causal chains. There is no overall score. A last-turn jump after 19 critical turns scores 18 in the fixed edge case, so it cannot erase sustained failure.

## Leaderboard

Competitive leaderboard scoring is structurally disabled with `OWNER_DISABLED_NONCOMPETITIVE_RELEASE`. The schema rejects `enabled: true` and any added composite score. Prompt 29 should be owner-deferred for this release after its prerequisites; no browser or server leaderboard is implemented here.

## Public ownership

- `@african-mandate/domain`: serialized policy, procedure, cost, evaluation request and result schemas.
- `@african-mandate/content`: the sole versioned configuration object.
- `@african-mandate/simulation`: pure procedure and evaluation resolvers.
- Prompt 27: compile this policy with the accepted production baseline and wire it into the browser runtime.

## Executable evidence

`tests/unit/production-scenario.test.ts` verifies artifact hash/disclosure, no TEST_ONLY marker, procedure roles, missing-step/lead-time/expiry behavior, six separate results, sustained-failure and harm penalties, incomplete-trajectory refusal, disabled leaderboard enforcement, and nonzero one-slot action costs.
