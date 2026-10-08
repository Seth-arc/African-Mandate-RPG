# ADR-0001 — Trusted Replay Boundary for Verified Leaderboard
**Status:** PROPOSED / NOT APPROVED

## Context
Domain Model v1.1 treated server-authoritative gameplay/competitive leaderboards as v1 non-goals; Game Design v2.1 later selected a verified leaderboard, and Specification Reconciliation v1 R-08 requires independent server replay. The architecture cannot silently interpret browser state as authoritative for rankings.

## Proposed decision
Keep ordinary solo campaign deterministic with local durable working state. For verified challenge submission only, send ordered original commands, pinned version/artifact hashes, cohort key, seed and claimed final hash to an authenticated server verifier. The verifier loads immutable artifacts, validates commands and idempotency, replays independently using the same algorithm, computes state/evaluation/tiebreaker and publishes accepted entries through an isolated ranking read model. Client-supplied score is never authoritative.

## Consequences
Dedicated trust boundary, compute/memory/rate limits, conflict/duplicate rejection, privacy and retention policy, version compatibility, exactly reproducible vectors, accepted cohort equality and publishable score formula required. Scope explicitly excludes allowing server results to mutate active local CampaignState.

## Approval blockers
Scoring formula and ties, challenge cadence, cohort and identity policy, hosting/runtime, security/threat assessment, signed domain/technical revision. No leaderboard service implementation or publication before approvals.
