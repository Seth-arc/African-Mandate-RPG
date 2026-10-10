# Consultation and commitment contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-14 / PB2-14  
**Owners:** canonical commitment state and serialized operation schemas in `@african-mandate/domain`; deterministic consultation and due-resolution behavior in `@african-mandate/simulation`; atomic durability remains owned by the accepted application command/turn services  
**Classification:** canonical commitment owner plus strict TEST_ONLY consultation/legal/response/conflict/resolution interfaces pending Prompt 14 review

## Canonical ownership

`CampaignState.commitments` is the only writable commitment registry. `CommitmentRecordSchema` implements the exact Domain v1.1 section 27 fields: ID, issuer, beneficiary, created/due turn, type, description key, fulfillment rules, status, optional source decision, and optional resolved turn. Record keys, parties, source decisions, due chronology, and active/resolved lifecycle shape are validated. Actor/institution ID lists and player `knownCommitmentIds` are references, not second commitment records.

The five canonical states are `active`, `fulfilled`, `breached`, `waived`, and `expired`. Prompt 14 implements only explicit TEST_ONLY due transitions from `active` to `fulfilled` or `breached`. Waiver, expiry policy, production fulfillment formulas, and command-triggered reconciliation remain blocked rather than guessed.

## Structured consultation command

One committed package is one accepted atomic strategic command and therefore costs exactly one slot. The strict package union covers Package 3 authoring candidates N1–N3:

- N1: technical liaison role, reporting path, and bounded-or-none resource commitment;
- N2: one regional channel and one proposed promise; and
- N3: one access/bandwidth priority with explicit acknowledgement of the tradeoff.

Every package is marked `TEST_ONLY_CONSULTATION_PACKAGE`. Unknown fields and unrestricted authoritative free text fail strict parsing. A versioned TEST_ONLY legal profile declares allowed negotiations, bounded-allocation availability behavior, and forbidden N1 combinations. It is not a production legal authorization rule. The structural validator runs before mutation: a hard-invalid package loses no slot and emits no evidence/event.

## Knowledge-safe preview and postcommit response

The preview reads only selected visible terms and commitments already listed in `knowledge.knownCommitmentIds`. Profile-declared political conflicts produce warnings but never become hard prohibitions. N1 host-only reporting and N3 capacity tradeoffs produce visible strategic-risk codes from the package itself; no hidden stance or score is exposed.

Response resolution runs only after the decision record exists. The single target and its typed issue position must agree. A versioned TEST_ONLY response profile maps the six canonical stances to `accepted`, `conditional`, or `rejected`; these mappings and evidence confidence values are synthetic fixtures, not claims about real actors. Every genuine attempt emits one scoped actor-claim evidence record. Accepted/conditional offers may create a commitment; rejection does not. No partner agrees merely because a consultation was submitted.

N2 commands target one actor or institution at a time. AU, AES, and ECOWAS channel choices are separate packages, so one response cannot imply another body's consent.

## Due resolution and callbacks

The default source-step-3 resolver remains `initial_no_op`. `createTestOnlyCommitmentResolverRegistry` opts into explicit versioned outcome profiles. At or after `dueTurn`, each active commitment must have one matching profile. The adapter atomically:

1. transitions it to the declared `fulfilled` or `breached` outcome;
2. records `resolvedTurn` and removes institutional active references;
3. emits one deterministic domain event; and
4. emits one deterministic memory callback linked to that event.

A non-active commitment is skipped, so repeating EndTurn cannot reapply the transition, event, or callback. Actor commitment IDs remain historical references. Missing profiles fail the candidate EndTurn closed. Fulfillment rules stay on the canonical record; the TEST_ONLY outcome profile does not claim to be their production evaluator.

## Test and source traceability

| Acceptance ID   | Assertion                                                                                                               | Executable evidence                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| PB2-14          | Coherent structured single-slot consultation and canonical commitment lifecycle                                         | `tests/unit/consultation-commitment.test.ts`     |
| AC-010 / SIM-02 | Accepted, conditional, and rejected interactions remain scoped; each attempt emits evidence and costs one slot          | regional-response test                           |
| AC-010 / SIM-09 | Known political conflicts warn but proceed; hard-invalid terms reject; due fulfillment/breach and callbacks happen once | conflict, invalid-term, and due-resolution tests |

Canonical sources are Domain v1.1 lines 1267–1302, 1857–1887, 1915–1932, 3322–3375, and 4923–4931; GDS v2.1 lines 120–193, 450–540, and 2402–2516; Package 3 gameplay lines 121–135. Package 3 content remains AUTHORING_ONLY under the source manifest. Production legal authority, real actor positions, response/fulfillment mappings, numeric confidence/balance, unrestricted AI negotiation, automatic agreement, authorization, UI, and narrative are excluded.
