# Mandate case and authorization contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-15 / PB2-15  
**Owners:** canonical serialized state and operation schemas in `@african-mandate/domain`; deterministic command and authorization resolution in `@african-mandate/simulation`; existing atomic persistence in `@african-mandate/application`  
**Classification:** canonical state owners plus strict TEST_ONLY case, procedure, resolution and implementation interfaces pending Prompt 15 review

## Canonical state and single ownership

`CampaignState.mandateCases` is the only mutable mandate-case registry and now parses the source-defined `MandateCaseState`: assessment basis, case-specific coalition, authorization procedure/state, negotiated scope, objectives, political strength, implementation readiness, distortion risk, commitments, implementation reference, turn metadata and optional outcome. `CampaignState.implementations` is the only mutable implementation registry and now parses source-defined work, capacity, risk and milestone state. Cross-references validate both directions. No authorization flag, coalition summary or progress percentage is duplicated elsewhere.

Coalition members live inside a case, so stance is issue/case-specific. A member's institutional affiliation, general relationship, membership in a regional body, consultation response, or coalition support never creates authority.

## Ordered command transitions

The TEST_ONLY command contract exposes four separate one-slot operations through the already accepted atomic command path:

1. `open_case`: an adopted/revised authored assessment becomes a new `assessment_basis` case; authorization is `not_requested`; no implementation exists.
2. `negotiate_scope`: a complete declared scope/coalition template replaces the case terms, records previous and negotiated scope plus distortion-risk dimensions, and moves the case to `coalition`.
3. `request_authorization`: only a matching `approved_fixture` procedure may move `coalition` to `authorization` with status `pending`; the request never grants authority.
4. `launch_implementation`: only an `authorized` or `conditionally_authorized` case with explicit capacity and a versioned TEST_ONLY profile may create a separate canonical `preparing` implementation.

Every transition emits an immutable domain event and typed status trace. The trace is output/audit evidence, not another mutable lifecycle owner.

## Failure-closed authorization boundary

Procedure entries distinguish `known_missing` from `approved_fixture`. The missing form contains only an ID and blocker code and cannot be requested. The fixture form must carry an explicit approval ID, canonical procedure definition, authority institutions, requirements and required grantors. Source-step-5 authorization resolution is opt-in and processes only a declared plan on its declared turn. An unlisted grantor, missing required grantor, mismatched requirement set, premature plan or inconsistent outcome rejects the entire EndTurn candidate.

The synthetic fixture names one fictional authority. AU liaison, AES liaison, ECOWAS technical channel and OCHA channel are negative fixtures and cannot grant. This is test coverage, not a claim about real institutional law. AM-GOV-005 and AC-023 remain BLOCKED pending legal and regional review.

## Proposal boundary and omissions

Canonical state field names and lifecycle values come from Domain v1.1 sections 55–66 and Appendices B.2–B.4/F.8–F.10. Exact template IDs/fields, action binding, prevalidation/result/rejection wrappers, generated requirement IDs, approved-fixture/missing entry discriminator, resolution plan and status-trace shapes are AM-GOV-039 TEST_ONLY design proposals requiring review.

No production authorization procedure, factual AU/AES/ECOWAS/OCHA authority, membership-derived consent, real coalition position, balance coefficient, implementation progress formula, objective result, waiver/revocation/expiry rule or outcome model is implemented. Default source-step-5 authorization and source-step-6 implementation adapters remain visibly `initial_no_op`.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-15 | Typed public state/operation schemas, single owners and bounded transition trace | `tests/unit/mandate-authorization.test.ts` |
| AC-013 / SIM-07 | One-slot assessment escalation; case is neither authorization nor implementation; negotiated scope and issue positions persist | full transition-chain test |
| AC-013 / SIM-10 | Known-missing procedure and unauthorized grantors reject without mutation; approved resolution and launch remain separate | missing-procedure, four-grantor matrix and full transition-chain tests |
