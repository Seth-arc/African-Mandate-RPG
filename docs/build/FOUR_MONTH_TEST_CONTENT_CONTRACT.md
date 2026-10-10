# Four-month TEST_ONLY compiled-content contract

**Contract version:** 1.0.0  
**Content version:** 0.1.0-test.1  
**Task:** AM-PB2-18 / PB2-18  
**Owner:** `@african-mandate/content`  
**Classification:** TEST_ONLY; production publication prohibited

## Boundary and ownership

`FourMonthTestContentArtifactSchema` is the single compiled artifact for this milestone. It owns a complete structural `ScenarioBundle`, initial player knowledge, versioned actor runtime and positions, accepted predecessor operation registries, source streams, simulated messages, monthly availability, branches A/B/C, explicit gap aliases, the 18-action authoring audit, and the unimplemented-system manifest.

The artifact consumes accepted domain contracts instead of redefining their mutable state. Exact wrappers and synthetic values that are not canonical source fields are the review-required TEST_ONLY proposal AM-GOV-045. They cannot be promoted by relabeling or by passing the structural `ScenarioBundleSchema`.

## Authoring action audit

The Package 3 authoring catalogue contains 18 unique action IDs. The compiled audit preserves every ID in source order:

- 15 IDs have TEST_ONLY executable definitions and explicit operation bindings;
- `action_m03_consult_afdb` is blocked because no exact canonical AfDB term package is approved;
- `action_m04_seek_authorization` is blocked because the applicable production authorization procedure is known missing;
- `action_m04_reallocate_priority` is blocked because no exact canonical effect is approved.

Monthly availability contains all 18 IDs once. Each branch has exactly three slot positions per month. Branch A exercises collection, branch B consultation, and branch C explicit defer/redirect behavior without inventing an executable command for an unused slot.

## Cross-reference and provenance rules

The public schema rejects duplicate IDs and dangling rule, action, effect, source, evidence, message, gap-alias, actor, position, and operation-binding references. Executable audit entries must match the scenario action registry exactly. Blocked action entries must point to the unimplemented-system manifest.

The inconsistent draft reference `gap_m01_civilian_route` is an alias of canonical fixture ID `gap_m01_civilian_access`; it is not a second mutable gap. Source streams and messages are explicitly `TEST_ONLY_SYNTHETIC` / `SIMULATED`, and the fixture asserts no historical observation or real-person claim.

## Production gate

`assertFourMonthContentPublishable` always throws `TestOnlyContentPublicationError`. The generic `serializeProductionScenarioBundle` boundary also recursively rejects TEST_ONLY, synthetic, placeholder, and pending marker strings, so extracting the structurally complete nested bundle does not bypass the hard gate.

Production remains blocked on the nine systems enumerated in `unimplementedCanonicalSystems`: verified geography, admitted historical baseline, production actor profiles, vetted authorization procedures, production balance effects, production finance terms, strategic-reallocation effects, full twenty-month content, and production evaluation.

## Deterministic fixture identity

`compileFourMonthTestContent()` parses the immutable fixture, serializes canonical JSON, and computes SHA-256. The expected fixture hash is:

`c9a12875cf70933777ef3d4d45a7a4f6bb0d332524364afc10561bc62751d8ac`

No clock, random source, network call, or production dataset participates in compilation.

## Source-to-test traceability

| Acceptance ID | Covered assertion | Executable evidence |
|---|---|---|
| PB2-18 | Full four-month artifact parses with unique cross-references and a stable hash | `tests/unit/four-month-content.test.ts` |
| AC-007 / AC-025 | Three slot positions per month across four months | branch inventory assertions |
| AC-009 | Meaningful collection path using accepted collection contracts | branch A and operation-binding assertions |
| AC-010 | Meaningful consultation path using accepted consultation contracts | branch B and operation-binding assertions |
| AC-013 / AC-023 | Known-missing authorization is visible and non-executable | blocked-action and production-gate assertions |
| AC-016–AC-019 | No fake real data or geography is admitted | classification, marker, and generic serializer rejection assertions |
| AC-022 | Messages retain a fixed `SIMULATED` marker | message and negative-classification assertions |
