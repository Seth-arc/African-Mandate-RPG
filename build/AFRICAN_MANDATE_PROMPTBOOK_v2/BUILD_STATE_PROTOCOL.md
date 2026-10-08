# Build state, acceptance and recovery protocol

## State machine
Each prompt begins `NOT_STARTED` and can become `IN_PROGRESS`, `PARTIAL`, `BLOCKED`, `FAILED`, `READY_FOR_REVIEW`, `ACCEPTED`, or `DEFERRED_APPROVED`. Only `ACCEPTED` satisfies hard prerequisites; `DEFERRED_APPROVED` changes scope only through a named owner approval and never counts as a passing test. `BLOCKED` means missing approval/input; `FAILED` means executed acceptance failed; `PARTIAL` means some code exists but gate has not passed. The implementing agent can propose `READY_FOR_REVIEW` but cannot self-grant ACCEPTED.

## Required durable files
`docs/build/BUILD_STATE.json` validates against `templates/build-state.schema.json`; `docs/build/handoffs/NN.md`; `docs/build/ACCEPTANCE_EVIDENCE.md`; `docs/build/SOURCE_MANIFEST.md`; `docs/build/DECISION_LEDGER.md`. Reviewers record approved commit SHA, relevant source hashes, independent tests and exact approval date/identity for every ACCEPTED step.

## Context handoff and restart
1. Read latest accepted step and handoff; compare git SHA and working tree.
2. If dirty/unexpected, do not overwrite: report changed paths and request resolution.
3. Re-run previous acceptance gate if source/toolchain/contract changed; mark downstream acceptance *needs revalidation*, retaining audit history.
4. On failure, preserve logs and previous durable state; repair within original scope; do not mutate tests or source canon to make green.
5. Continue only when all hard prerequisites ACCEPTED, or use separate independently scoped task.

## Gate review
Implementer provides test evidence; independent checker validates checksums, negative cases, required outputs and test authenticity. Owner approves product, legal and methodological exceptions; engineering checker may approve purely technical conformance. No action can approve its own content.
