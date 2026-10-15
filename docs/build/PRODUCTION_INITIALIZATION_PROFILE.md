# Production initialization profile proposal

**Task:** AM-PB2-27 preparation  
**Profile version:** `0.1.0-proposal.1`  
**Classification:** `PROPOSED_SIMULATED_PRODUCTION_INITIALIZATION`  
**Status:** APPROVED under `AM-GOV-067` on 2026-10-15  
**Canonical JSON:** `docs/build/PRODUCTION_INITIALIZATION_PROFILE.json`  
**SHA-256:** `4affa81339e8473e176552da43bf56225db29c88668e413d2240cc4e512f2305`

## What this proposal completes

This profile supplies the decisions that accepted Prompts 25 and 26 did not contain but Prompt 27 needs to initialize its opening production slice. It does not implement the compiler, browser runtime or full campaign.

Every new numeric runtime value is fictional simulation design. It is not an observed baseline, factual institutional assessment, government position or forecast. Historical unknowns remain `null` in the baseline and player knowledge even when the engine needs a separately disclosed hidden simulated value.

## Starting configuration

- The campaign retains the accepted 2025-10-01 start, five countries, 20-turn calendar and three decisions per turn. Prompt 27 exposes content only through Turn 4; Prompt 28 owns Turns 5–20.
- Political capital and secretariat capacity start at 30. One use of each accepted action costs 17 of each resource in total, so the initial slice supports all three choices without a large surplus.
- Other active envoy capacities start conservatively at 25 or 40. Material budget, personnel and logistics remain inactive and are not projected because no accepted opening action uses them.
- Territory, zone, institution, civilian, development and external-environment fields that require numeric hidden state use a disclosed simulated midpoint of 50. They never populate observed baseline fields or player knowledge.
- Actor capabilities use the same simulated midpoint. Aggressiveness and opportunism start at 25; compromise willingness copies the already accepted fictional cooperation baseline. No real-person intent is asserted.
- The single opening difficulty profile adds no modifiers and enables high causal explanation.

## Historical data and unknowns

- The baseline contains the five accepted countries and 97 accepted Natural Earth admin-1 zones.
- Deduplicated ACLED event counts through 2025-09-26 remain observed evidence. The one country-level event is not forced into a zone.
- Chad conflict remains `null` with `NO_ADMITTED_HISTORICAL_CONFLICT_OBSERVATIONS`; the later index is not backdated.
- Displacement remains `null` with `SOURCE_OMITTED_ZERO_FEATURES`.
- Categorical source-audit outcomes are not converted into invented 0–100 quality scores. The production baseline contract must allow `null + reasonCode` for unmeasured quality factors.
- Hidden zone armed activity for covered zones uses the proposed fictional formula `clamp(30 + 5 * uniqueEventCount, 30, 70)`. Uncovered zones use a hidden simulated midpoint of 50. Only event counts and coverage status may be projected as historical evidence.
- Finance records remain source evidence. Amount aggregation and unsupported zone allocation are forbidden.

## Conservative opening actions

1. **Collect evidence** targets one territory or zone, costs six secretariat capacity and resolves on the next End Turn. It may return only admitted evidence or `NO_NEW_VERIFIED_OBSERVATION`; it cannot invent a factual claim or directly change world scores.
2. **Consult counterpart** targets one registered actor or institution, costs five political capital and three secretariat capacity, records one consultation/memory and applies the already accepted simulated trust delta of +5 once. It may satisfy regional consultation but never grants authorization.
3. **Request simulated authorization** targets one of the five host institutions, costs twelve political capital and eight secretariat capacity, and advances only one formal step at a time. Consultation, the two-turn lead time, simulated PSC review and host game consent cannot be skipped. Failed sequence or lead-time checks are free and do not increment revision.

None of the opening actions directly changes conflict, civilian, infrastructure or development scores. That keeps Prompt 27 functional without inventing unapproved outcome coefficients; Prompt 28 owns full campaign effects and calibration.

## Local map decision

Use the accepted `data/african_map.json` bytes directly as a content-addressed local build asset. The file is a repository-specific JSON bundle containing `basemap.admin1`; it is not a standard GeoJSON `FeatureCollection`, so the implementation must not label it GeoJSON.

One read-only adapter filters the five accepted countries, applies the accepted stable zone-ID scheme and verifies SHA-256 `8ef3de3e1bcb846c405915fad33c03f1b38376d83e66ba6d8900681202da3c27` before rendering. There is no PMTiles compiler, network basemap, new source dataset or second mutable copy.

## Owner review checklist

Approval of this profile means approval of:

- the fictional starting values and neutral hidden-state policy;
- the conflict-count formula and the strict separation between observed `null` values and hidden simulated values;
- the three exact conservative action behaviors;
- zero additional difficulty modifiers for the opening slice;
- the nullable production data-quality contract change;
- direct local use of the pinned map JSON through one adapter;
- continued exclusion of Turns 5–20 content, cloud/accounts, leaderboard, hosting/deployment, unverified asset status and raw restricted-source redistribution.

The repository owner explicitly approved this profile as AM-GOV-067 on 2026-10-15. A reviewed commit is still required to make that approval durable under AM-GOV-001. It does not accept PB2-27; Prompt 27 must then implement and pass its compiler, persistence, recovery, concurrency, projection, build and browser gates.
