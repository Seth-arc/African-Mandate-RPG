# Command and rule contract

**Contract version:** 1.0.0
**Domain schema version:** 0.2.0
**Task:** AM-PB2-07 / PB2-07
**Owners:** serialized artifacts — `@african-mandate/domain`; deterministic evaluation and preparation — `@african-mandate/simulation`
**Status:** READY_FOR_REVIEW; TEST_ONLY interface proposals are recorded in AM-GOV-023

## Canonical sources

- Domain Model v1.1 SHA-256 `aa8a03380e93bb4adee9ef6115d59f64a98409f988eeaf132fa70460dec3c75c`, §§43-54 and Appendix F.2-F.5.
- Technical Architecture v2 SHA-256 `982be4ecd82b996e14be83b6fd89a60a2876bb4e2505ed195889ad4f81dcee30`, §§13.1, 49-51, 57, and 65.
- Game Design v2.1 SHA-256 `89f7387d041e006e3cc1e21d52fdc07e2234227600321eea5601a35415341f04`, §§17-22, 44, 142, and Appendix G.
- Executable Contract Inventory SHA-256 `0a06ccf9f26c4648cb7b955c77c1bb7e8a21cb2d8934d9aa5673471282c3d432`.
- Prompt 07 SHA-256 `c8a88aa56dd15f552d1c360732f3755253f0c7be26bedfe6a8a2ad1272ea581f`.

## Public contract

`@african-mandate/domain` owns strict Zod schemas and inferred types for:

- the 12 FactKeys listed by Domain Appendix F.3, `FactDefinition`, query/selectors, explicit known/unknown resolution, and tri-state expressions;
- externally generated persisted command IDs, exact action-target constraints, strategic action payloads, and preparation results;
- canonical preview costs/forecast fields plus the immutable known-cost profile wrapper;
- knowledge-safe menu entries and postcommit hidden-resolution request/result envelopes.

`@african-mandate/simulation` owns:

- validated fact registries and explicit `KnownFactSource` observations;
- deterministic Kleene-style `true | false | unknown` evaluation;
- knowledge-safe action-menu/preview construction that accepts no hidden-state argument;
- pure command preparation: schema, campaign, turn, duplicate, action, target, structural, eligibility, slot, and known-cost checks;
- a postcommit-only hidden-resolution gate whose input requires a committed decision ID and literal `phase: postcommit`.

Preparation never mutates `CampaignState`, consumes a slot, emits an event, or marks a command processed. It returns the configured slot cost only for `prepared`; every rejection and duplicate result carries `decisionSlotCost: 0`. Prompt 08 must bind a prepared command to the accepted operation coordinator, atomic transaction, durable write, state replacement, and original duplicate result.

## Unknown and hidden-state policy

Missing facts resolve to `{ kind: unknown, reasonCode }`; no missing fact becomes `false`, numeric `0`, or an empty string. Predicate `unknownPolicy` remains the explicit source-defined override; without that field, unknown propagates through `all`, `any`, and `not`. The player-eligibility consumer fails closed while retaining `ruleResult: unknown` and the reason `INSUFFICIENT_KNOWN_INFORMATION`.

Menu and preview APIs require `KnownFactSource` and knowledge-derived forecast input. Hidden state is absent from their call shape. Hidden facts can be supplied only to `resolvePostCommitHiddenOutcome` after a postcommit request parses. Prompt 07 does not prove that a decision ID was durably written; Prompt 08 must construct that request only after atomic commit.

## Structural checks and exact-field boundaries

Action target counts, kinds, uniqueness, command/action pairing, and known resource costs are engine checks. Action-specific term feasibility is an engine-owned structural-validator registry. A validator receives only the action, parsed command, and player-owned state; it does not receive hidden simulation state. An impossible result is refused before eligibility and slot checks.

Upstream sources do not define an exact serialized union for action terms, exact fact scope/resolver registration, known-cost profile wrappers, menu/result envelopes, or postcommit resolver envelopes. AM-GOV-023 therefore labels these exact fields TEST_ONLY design proposals. The phrase “signed action/target schema” in Prompt 07 has no canonical signature algorithm or field; the implementation supplies a strict schema-validated action/target envelope and does not invent cryptographic signing. Relationship FactKeys remain allowlisted but cannot receive a relationship subject until the canonical `SubjectRef` family is extended by an approved contract.

## Acceptance coverage and exclusions

`tests/unit/command-rules.test.ts` pins arbitrary-path rejection, tri-state unknown propagation, differential hidden-state safety, strict command/target parsing, invalid and duplicate zero-cost results, structurally impossible term refusal, known-cost preview, pure valid preparation, and the postcommit hidden gate.

This milestone does not implement effects, command mutation, decision records, persistence, rollback, EndTurn, production content, production values, authorization procedures, UI, or a cryptographic signature. AC-005 and AC-006 receive only precommit/static coverage here; their durable atomic requirements remain mandatory in Prompt 08.
