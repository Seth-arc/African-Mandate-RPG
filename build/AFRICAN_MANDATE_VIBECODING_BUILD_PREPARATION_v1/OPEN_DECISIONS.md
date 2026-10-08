# Open Decisions and Blocking Dependencies v1
**Do not resolve automatically.** Record decision owner, approved value, effective specification amendment and release artifacts when closed.

| ID | Issue | Existing position | Owner needed | Build impact |
|---|---|---|---|---|
| OD-01 | Historical time/countries | APPROVED: 2025-09-26, 2025-10-01; ML/BF/NE/TD/MR | no further decision on those values | retain; R-10 2026 proposal stale |
| OD-02 | Administrative boundary source, edition, effective date, level, zone crosswalk | UNAPPROVED; admin-1 candidate | GIS/data + scenario | blocks real map/baseline |
| OD-03 | ACLED representative extract and event grain | supplied sample inadequate, repeated event IDs | data lead | blocks regional observed violence estimates |
| OD-04 | 2025-09-27–30 temporal gap policy; source-specific effective dates | missing ≠ zero; exact policy open | methodology/scenario | blocks real initialization |
| OD-05 | Spatial displacement, source stocks vs flows | IDMC supplied GeoJSON features empty | data lead | no invented zone displacement |
| OD-06 | Finance raw native files/commitment validity | metadata alone insufficient | data lead | optional omit until source approved |
| OD-07 | Historical asset operation/routing and licences | 2026 inventory ≠ 2025 operational evidence | data/legal | no fabricated infrastructure exposure |
| OD-08 | Actor priorities, stances, confidence, report channel/costs | Package 1/3 placeholders; no approved 50 defaults | scenario/system | TEST-only fixture permitted |
| OD-09 | AU PSC/AES/ECOWAS/host authorization procedures | specific rules unapproved | institutional counsel + regional experts | block formal authorization production |
| OD-10 | Indicator formulas/evaluation weights/missingness | five UI candidate indicators suspended; six canonical dimensions need exact formulas | methodology + balance | block production scoring |
| OD-11 | Leaderboard scoring rules/cohorts and verified replay architecture | verified-only product requirement; Domain v1 non-goal conflict | product/domain/backend | versioned ADR before coding comparison service |
| OD-12 | Supported browsers/viewports and performance benchmark | desktop/tablet numbers proposed | product/UX | test matrix provisional |
| OD-13 | Map basemap, PMTiles hosting and licence | open provider | architecture/data | not blocking headless kernel |
| OD-14 | Simulation runtime/save compatibility policy | architecture recommends support current + two prior, not selected | product/architecture | decide before stable save support |
| OD-15 | Missing `DESIGN_STANDARDS.md` referenced by artifacts | file not in current supplied corpus | design owner | blocks full UI design conformance |
| OD-16 | Repository versions/CI/services | exact Node/pnpm/GIS, hosting choices not set | engineering owner | choose before bootstrap merge |
| OD-17 | Stage 2 content and source/legal editorial acceptance | drafts, static QA not gameplay signoff | scenario/region/legal | blocks production content |

## Reconciliation alerts
1. `AFRICAN_MANDATE_SPEC_RECONCILIATION_v1.md` R-10 proposes an October 2026 date, but later explicitly APPROVED Data & Methodology AM-DM-001 fixes **2025-10-01**. Preserve approved 2025 value; update stale derivative text via normal editorial revision.
2. Older design brief/components mentions always-visible five indicators; reconciliation suspends these until player-knowledge-safe formulas approved.
3. Package 2 initially labels different-scope government/civic statements as contradiction; later contracts clarify **source tension** only. Formal contradictions require same subject/proposition/scope/time with incompatible values.
4. Verified leaderboard requirement conflicts with original Domain v1 server-authority non-goal; implement only after approved spec/ADR revision.
5. `zone_pending_mopti_adm1` is authoring sentinel, never production domain geometry.
6. Some spec example directories retain `sahel-2026` or comparable illustrative labels; select real versioned scenario directory according to approved 2025 start and migration policy, not filename intuition.

## Readiness declaration
`READY FOR CONSTITUTION REVIEW`; `NOT READY FOR PRODUCTION SAHEL COMPILATION`; `NOT READY FOR CLAIMED PLAYABLE FOUR-MONTH BUILD`; `NOT READY FOR VERIFIED LEADERBOARD RELEASE`.
