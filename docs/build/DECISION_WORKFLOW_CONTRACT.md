# Decision preview, commitment and resolution UI contract

**Task:** AM-PB2-23  
**Contract version:** `0.1.0-test.1`  
**Schema version:** `1`  
**Classification:** `TEST_ONLY_DECISION_WORKSPACE`  
**Owners:** `@african-mandate/application` owns coordination/projection schemas; `@african-mandate/ui` owns presentation; deterministic decisions remain owned by `@african-mandate/simulation`

## Accepted inputs

- PB2-20 application adapters: accepted at `709a2bfda126c6d96badd7098495446daf353565`.
- PB2-21 UI shell: accepted at `994280a2327fc02d02f4534078d75b4669a764eb`.
- PB2-22 map/documents: accepted by owner commit `1b54622ed8cea85dd32c4e66867ebe10a9dc2011` under AM-GOV-001.
- Source manifest: `4ce13c6d0fa6eb7d99f4e7023a7c48669bb57407827dc83f661f8ab6eccbb436`.
- Prompt 23: `c69b4fab824a4cde284c8afb841987e18a2806a35b245309f0ebc6f76f174cf6`.
- Reconciliation R-01/R-02: `12c93d88480ced19bf581e2e23a143629bed68ce6140ad26eeee6855218cdf99`.
- Game Design v2.1: `89f7387d041e006e3cc1e21d52fdc07e2234227600321eea5601a35415341f04`.
- Components Reconciled v1: `a512a1e46a3b2c1affca0e776c7ef31a0b9350dc222c21dcc191960ecbcd836c`.

## Public application contract

`@african-mandate/application` exports:

- `DecisionWorkspaceProjectionSchema`, `DecisionActionOptionSchema`, `DecisionJournalEntrySchema`, `ResolutionLedgerEntrySchema` and inferred types;
- `DECISION_WORKFLOW_SCHEMA_VERSION` and `DECISION_WORKFLOW_CONTRACT_VERSION`;
- `DecisionWorkflowCoordinator`, `DecisionCommandPort`, `DecisionTurnPort` and `DecisionProjectionLoader`.

The coordinator accepts the frozen atomic command and EndTurn request shapes. It invokes exactly one accepted atomic service operation. A committed result is projected only after that service resolves, which is after its local durable write. The coordinator then requires the refreshed journal/ledger to preserve the complete prior prefix. A new committed decision must already be present in the journal; a committed End Month must already add ledger entries. Rejected commands return the unchanged prior projection. Persistence exceptions do not load or swap a projection.

The decision journal and resolution ledger are strict append-only projections. They are not mutable campaign owners. The five resolution categories are the source-defined implementation, institutions, regional conditions, intelligence and watch groups.

## UI behavior

- Adding, removing and reordering draft options changes local React state only. It never calls an application operation.
- Commit requires an explicit focus-trapped confirmation. One confirmation calls `commit` once. The tray entry is removed only after a committed/duplicate durable result.
- End Month uses the same confirmation and durability rules. A visible reason explains every disabled state.
- Save failure keeps the dialog, prior projection and draft intact. Retry reuses the same request and command ID.
- Successful saves are announced through a polite atomic live region. Failure/rejection messages use `role=alert`.
- Cancel returns focus to its invoking control. Successful Commit moves focus to the immutable journal; successful End Month opens and focuses the resolution ledger.
- Committed journal and ledger rows contain no edit, delete or reorder control.
- Preview renders accepted known costs, intelligence gaps and implementation dependencies only. It does not render hidden success probability, hidden red lines, hidden availability, future callbacks or raw resolver traces.

## Explicit TEST_ONLY proposals

Canonical sources define the decision economy and display obligations but not the complete serialized projection fields. The exact workspace, option, journal-entry and ledger-entry envelopes are AM-GOV-055 TEST_ONLY proposals. `actionLabel`, `outcomeSummary`, category wrapper, entry IDs and sequence fields require application/domain/editorial review before production admission.

`apps/web/src/test-decision-workflow.ts` is a fixed four-month browser acceptance script. It returns schema-validated, visibly simulated projections through the real application coordinator but does not execute or duplicate domain effects. It contains no production values and cannot serialize as production scenario content. The adverse variant injects one local-save exception before mutation, then accepts retry with the identical command identity.

## Hard gates and exclusions

- This contract does not add an engine, forecast hidden outcomes or mutate raw campaign state in UI/web.
- Production decision prose, legal authorization, actor positions, balance effects, full twenty-month content, cloud sync and production geography remain blocked.
- The two exact fourth-month authoring actions without approved canonical execution remain absent rather than silently implemented.
- Passing Chromium automation does not certify production browser support, regional/editorial review, assistive-technology lab results or public launch readiness.

## Traceability

| Acceptance ID   | Requirement                                                           | Executable evidence                                                                                   | State                                                    |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| PB2-23          | four-month decision preview, commit, journal, End Month and ledger UI | `tests/unit/decision-workflow.test.ts`; `tests/e2e/decision-workflow.spec.ts`; screenshot and handoff | READY_FOR_REVIEW                                         |
| AC-005          | failed local save consumes no projected slot or journal entry         | injected exception test plus browser retry path                                                       | PASS TEST_ONLY                                           |
| AC-007 / AC-025 | three-slot economy and mandatory last-slot safety                     | coordinator fixture and browser adverse branch                                                        | PASS TEST_ONLY                                           |
| AC-008          | hidden-state-safe preview                                             | strict accepted preview schema and prohibited-field negative test                                     | PASS TEST_ONLY                                           |
| AC-021          | projection firewall and accessible semantics                          | forbidden-import gate, focus trap, keyboard, live region and axe                                      | PASS automated subset                                    |
| AC-022          | simulated marker/copy boundary                                        | visible TEST_ONLY markers and no real claims                                                          | PASS automated subset; regional/editorial review BLOCKED |

Passing these synthetic checks does not clear a production gate or self-approve PB2-23.
