# African Mandate — Package 2 Evidence and Content Contracts

**Status:** v0.1 authoring schema and testing contract. Illustrative records are not a valid complete ScenarioBundle and do not create real-world source claims.

## 1. Reference namespace

- `brief_m01_*`: month opening brief artifact; `instrument_m01_charter`: opening charter.
- `report_m01_*`: document templates (`IntelligenceReport` only once supported by accepted evidence IDs).
- `evidence_m01_*`: candidate `EvidenceRecord` identities; IDs must be converted into validated canonical serialized records, with `sourceType`, confidence, source date/turn, provenance and typed claim.
- `gap_m01_*`: `IntelligenceGap` object after approved numeric `strategicImportance` and valid `SubjectRef`.
- `action_m01_*`: authoring-only proposed `ActionDefinition`; `commandType`, validated rule expression, target schema, exact decision cost, costs, previews, effects, doctrine and consequences are still TBD.

## 2. Sample type-safe source claim; synthetic only

```json
{
  "evidenceId": "evidence_m01_access_gov_signal",
  "subject": {"kind": "institution", "id": "institution_government_mali"},
  "claim": {"kind": "category", "category": "liaison_channel", "value": "discussion_offered"},
  "sourceType": "actor_claim",
  "sourceParty": {"kind": "actor", "id": "actor_mali_focal_point"},
  "initialConfidence": 45,
  "sourceReliability": 50,
  "observedTurn": 1,
  "observedDate": "2025-10-01",
  "decayProfileId": "decay_diplomatic_statement_v0_test",
  "reportSensitivity": "open"
}
```

**Important:** This JSON is a **synthetic engineering sample**. Its scores are arbitrary test constants, not approved scenario balance and not real confidence about Mali. `decayProfileId` must resolve to a defined balance profile before compilation. No actor position, relationship score or hidden red line can be inferred from it.

## 3. Formal contradiction required for later compiled test

The two October reports in the player copy differ in perspective; they are not inherently contradictory because `technical_discussions_possible` and `independent_verification_not_available` can both be true. A later formally contradictory evidence pair must share the *same subject, question, scope, and time period* and have incompatible claim values. E.g., synthetic QA:

```json
[
  {"id":"test_evidence_access_yes","scope":"zone_test_001","period":"2025-10","claim":{"kind":"boolean","proposition":"independent_verification_available","value":true},"contradictionKey":"zone_test_001:2025-10:independent_verification_available"},
  {"id":"test_evidence_access_no","scope":"zone_test_001","period":"2025-10","claim":{"kind":"boolean","proposition":"independent_verification_available","value":false},"contradictionKey":"zone_test_001:2025-10:independent_verification_available"}
]
```

`scope` and `period` above are **test-harness metadata**, not `EvidenceRecord` schema fields. The compiler must map them through canonical `SubjectRef` and recorded observation time. Do not copy this object directly into a production register.

## 4. Deterministic delayed collection matrix

| Resolution category | Emitted event | New evidence? | Gap transition | Why player can tell |
|---|---|---|---|---|
| useful | `collection_completed` | yes, typed | possibly resolved | source, date, claim and confidence provided |
| partial | `collection_partially_completed` or supported event code | yes, incomplete | `partially_resolved` | important question still open |
| conflicting | `collection_completed_contested` or supported event code | two or more when justified | open or partial | incompatible claims clearly cross-referenced |
| inconclusive | `collection_completed_inconclusive` or supported event code | possibly none | remains open | reason given if known |
| delayed/failed | `collection_delayed` / `collection_failed` | not presumed | remains open | revised task status, no false “new intelligence” |

The actual event codes and source-channel policies must be registered, validated and balance-tuned. Completion timing and outcome use deterministic keyed randomness; `RequestIntelligence` never directly exposes hidden truth.

## 5. Story-to-model acceptance checklist

- [ ] Every source and institution ID exists in canonical registries.
- [ ] Every observed historical claim has an approved source manifest entry.
- [ ] Every fictional game report is labeled `SIMULATED` and not attributed to real living named people.
- [ ] All report `evidenceIds` exist, and a player only sees emitted records.
- [ ] All evidence claims are typed; no arbitrary `unknown` values.
- [ ] Contradiction keys represent genuinely incompatible same-scope claims.
- [ ] Exact numeric resource costs and slot cost are validated; actions obey three-slot economy.
- [ ] All player eligibility and preview rules are knowledge-scoped with tri-state unknown.
- [ ] The player begins without authoritatively adopted hypotheses.
- [ ] No real source gap creates fake zero event/asset/displacement values.
- [ ] Monthly callbacks and event variations are resolved from world/decision state.
- [ ] Same version/seed/commands yield identical authoritative final hash.
- [ ] Regional and institutional legal review completed before release.

## 6. Source references to retain

- Game Design v2.1: sections on intelligence, assessments, decision packages, first two months and knowledge firewall.
- Domain Model v1.1: EvidenceRecord, IntelligenceReport, IntelligenceGap, CollectionTask, PlayerKnowledgeState and `SimulationEffect` definitions.
- Stage 1 approved: Mandate Charter priorities, optional arcs A/B/C, narrative framing and source guards.
- Package 1 registry: distinct institution/actor IDs, 2025 ECOWAS/AES historical distinction, legal research backlog.
- Data & Methodology v1.1: 2025-09-26 historical anchor; 2025-10-01 start; missingness, noncoverage, date policy and licensing rules.
- Historical institutional fact source: https://www.ecowas.int/Burkina-faso-Mali-and-nigers-withdrawal-from-ECOWAS-is-now-a-reality/
