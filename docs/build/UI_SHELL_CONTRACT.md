# Accessible UI shell contract

**Task:** AM-PB2-21  
**Contract version:** `0.1.0-test.1`  
**Schema version:** `1`  
**Classification:** `TEST_ONLY`; production admission and full design conformance are blocked  
**Owner:** `@african-mandate/ui` owns presentation schemas/components; `@african-mandate/web` owns the Vite host only

## Accepted inputs

- Prompt 20 owner-accepted commit: `709a2bfda126c6d96badd7098495446daf353565`.
- Source manifest: `4ce13c6d0fa6eb7d99f4e7023a7c48669bb57407827dc83f661f8ab6eccbb436`.
- Prompt 21: `28f43bb5dcbb255413b99b227fa6f5a9fb6af4feb1a9e3dba4a498ecd88c345e`.
- Components Reconciled v1: `a512a1e46a3b2c1affca0e776c7ef31a0b9350dc222c21dcc191960ecbcd836c`.
- Design Brief Reconciled v1: `4a7e6f54ea4dfde6bbc8f48ea286bc892adf18e1f621267d1835edd2379cd6b3`.
- Design Decisions: `d1341c336b9bb2ffb45fd544c0eb2bc03384187c9a3a784000abca9ad429e729`.
- Canonical tokens: `f534d03bbf1b60e65781972d5e358076b8b572005672bb5b1c61727a9718d4e9`.
- Owner-confirmed Design Standard v2.1: `39755e3cbd573e8682970d2aefd1a98a7b53b9cb935611e6fd17bafdbfe21bb4`.

The application `CampaignProjection` remains the source for campaign revision, turn, calendar date, decision capacity and campaign status. UI code imports no domain, simulation, headless, raw store or debug projection.

## Public interface

`@african-mandate/ui` exports:

- `UiShellModelSchema`, `UiSaveStateSchema`, `UiAttentionItemSchema` and inferred types;
- `createUiShellModel`, which validates an accepted `CampaignProjection` before copying the shell-safe fields;
- `UiShell`, `UiShellProps` and `UiShellViewState`;
- `UI_SHELL_SCHEMA_VERSION = 1` and `UI_SHELL_CONTRACT_VERSION = 0.1.0-test.1`.

`UiShellModel` is a read-only presentation artifact. It cannot mutate campaign state, issue commands, save data or resolve simulation behavior.

## Explicit TEST_ONLY proposals

Canonical sources require save status and an attention queue but do not define their complete knowledge-safe presentation fields. The exact `UiSaveState` and `UiAttentionItem` envelopes are therefore proposals under AM-GOV-051. They require application/domain architecture review before production use.

The accepted projection has no act field. The shell displays `Not available`; it does not infer an act from turn number. The five candidate headline indicators remain suspended and are absent from the shell. No unknown value is rendered as zero.

The web host uses a visibly marked synthetic fixture solely for browser tests and screenshots. It is not a scenario bundle and cannot pass a production serializer.

## Registered components and states

The implementation composes already registered Button, Panel, Panel header, Notice, Attention queue, Status strip, Status label, Skip link and Link definitions. No second component registry is introduced.

- Status: turn, unavailable act, date, decision slots and local/sync save state.
- Navigation: semantic links with `aria-current`; the selected view is local UI state only.
- Attention: severity-ordered list, glyph plus text, one jump link per item and an explicit empty state.
- Workspace: ready, loading, error with retry, and partial-data notice.
- End month: disabled in this milestone with a visible, programmatically associated reason.
- Unsupported viewport: an explanatory message below the proposed landscape floor.
- Motion: the shell has no animation; canonical reduced-motion tokens remain loaded.

## Proposed responsive matrix

This matrix is a TEST_ONLY design proposal because the brief marks the viewport choices as proposed.

| Viewport          | Shell behavior                                                    | Browser evidence                  |
| ----------------- | ----------------------------------------------------------------- | --------------------------------- |
| 1920 × 1080       | full three-column navigation, workspace, attention layout         | `desktop-target-1920x1080.png`    |
| 1440 × 900        | full three-column layout                                          | `desktop-common-1440x900.png`     |
| 1280 × 720        | compact two-column layout with attention in a lower band          | `desktop-minimum-1280x720.png`    |
| 1024 × 768        | tablet landscape two-column layout with attention in a lower band | `tablet-landscape-1024x768.png`   |
| below 1024 CSS px | shell hidden; minimum-width explanation shown                     | automated boundary assertion only |

All screenshots live under `docs/build/screenshots/21/`. The 200% text-size capture is `text-zoom-200.png`; its browser assertion requires no horizontal document overflow and verifies the end-month control remains present.

## Hard production gate and limitations

- `classification` must remain `TEST_ONLY_UI_SHELL`; no production adapter accepts it.
- No map, dossier, document, decision preview/commitment, resolution ledger behavior or live campaign bootstrap is implemented here.
- The responsive matrix, save/attention envelopes and copy length limits need owner/editorial review.
- Noto Sans and Charis SIL are not self-hosted; screenshots use the declared fallback stacks. Font licensing/loading and MapLibre glyph ranges remain open.
- Browser/version support is not approved in `toolchain.json`; Chromium is test evidence, not a production browser matrix.
- Human novice playtesting, Sahel/AU regional review and final editorial comprehension review have not occurred. Intuitiveness and comprehension are verified by proxy only.
- Audio is outside this shell and no audio behavior was added. The repository still lacks the source-requested `AUDIO.md`, so audio conformance is not claimed.

## Traceability

| Acceptance ID | Requirement                                          | Executable evidence                                                               | State                                                    |
| ------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| PB2-21        | accessible projection-only shell and status surfaces | `tests/unit/ui-shell.test.tsx`; `tests/e2e/ui-shell.spec.ts`; browser screenshots | READY_FOR_REVIEW                                         |
| AC-021        | UI import firewall and accessible input semantics    | three forbidden-import fixtures; axe smoke; keyboard and named-button tests       | PASS automated subset                                    |
| AC-022        | simulated marker and source/date/orthography review  | visible simulated/test-only marker and locale date formatting                     | PASS automated subset; regional/editorial review BLOCKED |
| AC-024        | no phantom headline meters                           | unit and browser assertions reject all five candidate labels                      | PASS omission; production methodology BLOCKED            |

Passing the synthetic checks does not clear Gate D or certify production design conformance.
