# African Mandate — Sahel Scenario v1
## Stage 2, Package 2: Opening Intelligence and Strategic Briefings

**Status:** v0.1 authoring-ready / NOT compiled, historically validated, or balanced. **Stage 1 narrative:** owner approved. **Starting turn:** Month 1, 1 October 2025. **Observed conflict cutoff:** 26 September 2025. **Territories:** Mali, Burkina Faso, Niger, Chad, Mauritania.

**Authoritative dependencies:** Domain Model v1.1 → Technical Architecture v2 → Data & Methodology v1.1 → Game Design v2.1 → approved Stage 1 → Package 1 actor registry, `VOICE.md`, `GLOSSARY.md`. This document defines *fictional opening content candidates* and epistemic contracts, not new domain rules or demonstrated historical facts.

**Annotation legend** — `[H]` independently sourced historical/contextual statement (must carry citation and as-of); `[O]` observed record accepted through verified versioned baseline (NONE approved for insertion here); `[S]` invented in-simulation/reporting content; `[T]` synthetic QA fixture; `[P]` proposed for owner/scenario approval; `[X]` cannot be committed to production until dependencies pass.

## 1. Editorial and gameplay decisions

1. The player starts with the approved **Mandate Charter**, not an emergency instruction to solve a predetermined crisis. Its five priorities: civilian protection/humanitarian access; regional coordination; evidence-based response; essential services/corridors; institutional legitimacy/sustainability.
2. The first brief offers three parallel investigative lenses: **contested local security reporting**, **civilian access verification**, and **network/service exposure**. None implies a confirmed new real-world October 2025 incident.
3. **Primary first dossier:** a *fictional issue file* on access and reporting reliability centered on Mali, with a proposed Mopti focus **pending validated zone ID/geometry**. A second dossier concerns cross-border coordination with Burkina Faso and Niger; Chad and Mauritania appear as distinct regional contexts rather than forced Month 1 negotiations.
4. **Institutional distinction:** AES and ECOWAS are separate interlocutors; withdrawal of Mali, Burkina Faso and Niger from ECOWAS is established historical context, not a fictional secret. Any AU participation-status specifics, AES treaty competencies and formal authorization paths remain behind legal/research review.
5. On launch, the player can **inspect freely**, then choose independent one-slot `RequestIntelligence` or `StrategicConsultation` actions where configured; **adopting an assessment costs a slot**, and escalating to mandate case normally costs another. No committed-action reorder/undo.
6. Monthly decisions must use **knowledge-limited eligibility/preview**; hidden red lines, true actor intent, future consequences, or numeric probabilities cannot leak. Unknowns cannot be presented as zero.
7. Player copy is authored from the viewpoint of the **fictional Office of the AU Strategic Envoy**, with a visible `SIMULATED` marker on every in-world document concerning real states or bodies.

## 2. Launch bundle of in-world documents

| Document ID | Title | Content artifact | Source/knowledge gate |
|---|---|---|---|
| `brief_m01_strategic_opening` | October Strategic Brief | `OPENING_DOCUMENTS.md` §1 | Sourced historical reference plus clearly simulated reporting; no unsourced statistics |
| `instrument_m01_charter` | Mandate Charter | `OPENING_DOCUMENTS.md` §2 | Approved Stage 1 priorities; exact legal delegation fictional and bounded |
| `report_m01_reporting_variance` | Divergent Reporting on Access | `OPENING_DOCUMENTS.md` §3 | Two fictional institutionally distinct claims; contradiction deliberate and known |
| `report_m01_access_status` | Civilian Access Information Note | `OPENING_DOCUMENTS.md` §4 | Fictional qualitative reporting only; no displacement count inferred |
| `report_m01_infrastructure_register` | Essential-Service Exposure Note | `OPENING_DOCUMENTS.md` §5 | Incomplete 2025 asset-status knowledge; zero invented sites |
| `report_m01_institutional_arrangements` | Institutional Routing Note | `OPENING_DOCUMENTS.md` §6 | ECOWAS/AES distinction; approval still required for procedural detail |
| `dossier_m01_issue_monitoring_access` | Access and Reporting Dossier | `OPENING_DOCUMENTS.md` §7 | Epistemic state and authorized options only |
| `brief_m02_scenario_update` | November Conditional Brief | `OPENING_DOCUMENTS.md` §8 | One of several conditional templates, not a fixed narrative outcome |

**Do not place unverifiable ACLED counts, fictional casualty figures, real-person quotations, inferred IDMC subnational counts, or 2026 GEM asset operational statuses into these templates.** Genuine observed facts become `[O]` only when compiler/source QA accepts them.

## 3. Opening intelligence topology

### 3.1 Three distinct evidence streams

**A. Access/reporting independence (`issue_monitoring_access`).** Fictional counterpart reporting says limited coordination is feasible; a second fictional civic reporting channel cannot corroborate access consistency. This is a designed contradiction about **reporting/observation access**, not an unsupported factual claim that security objectively improved or deteriorated.

**B. Civilian protection (`issue_civilian_access`).** Source-based country-level context may exist, but the supplied displacement GeoJSON has no spatial features. Opening player knowledge must therefore say **zone-level displacement is not known** until eligible data arrives. A simulated inquiry can ask which corridor or locality has independently verified access constraints.

**C. Infrastructure and service continuity (`issue_corridor_resilience`).** Available 2026-inventory assets are *research candidates*, not 2025 operating baseline. No automatic location-based threat indicator or actionable targeted asset appears until existence/status, geometry, location and public-disclosure checks pass.

### 3.2 Evidence registers, first month

All rows below are **fictional simulated records**, unless explicitly historical context; their facts exist **only in the game’s authored simulation**. The designer must compile them as `EvidenceRecord`s from approved observation/report emission, never duplicate hidden truth in the UI.

| Evidence ID | Source / perspective | Claim / confidence vocabulary | Contradiction | Player visibility |
|---|---|---|---|---|
| `evidence_m01_access_gov_signal` | `[S]` Mali Government Focal Point, simulated liaison note | “A limited liaison channel is available for technical discussions.” *Unverified*, no proof of field access | `access_channel_reliability` | Known at opening |
| `evidence_m01_access_civic_signal` | `[S]` Sahel Civilian Access Network, simulated reporting note | “Independent verification routes for the proposed area remain unavailable to this channel.” *Unverified* | `access_channel_reliability` | Known at opening |
| `evidence_m01_civilian_location_gap` | `[S]` Envoy Intelligence Adviser analysis of missing data | “Location-specific displacement cannot currently be assessed from the supplied source.” *Not known*, not observed count | none; method gap | Known at opening |
| `evidence_m01_infra_2025_unknown` | `[S]` Envoy technical desk | “Historical operating condition and exact location of candidate assets are not yet verified.” *Not known* | none | Known at opening |
| `evidence_m01_ecowas_membership` | `[H]` historical institutional notice; separate methodology-backed context | Three-state ECOWAS withdrawal effective 29 January 2025 | none | Known background, with dated source |

**Contradiction interpretation:** the first two claims differ in channel and scope; they are not inherently logically incompatible. The scenario **must either** author a precisely shared proposition (e.g., *independent reporting can be arranged in zone X now*) with genuinely incompatible categorical assertions, **or** display them as *unresolved source tension* rather than mark a machine-detectable contradiction. The initial report pack deliberately calls them divergent/contested *interpretations*, not mathematically incompatible facts. This distinction is a content-quality gate.

### 3.3 Intelligence gap registry

| Gap ID | Subject / question code | Opening status | Importance | Potential collection channels | Closure test |
|---|---|---|---|---|---|
| `gap_m01_monitoring_verification` | proposed Mali focus, `access.independent_verification_possible` | `open` | high, numeric score TBD | AU field (authorization-dependent), partner, diplomatic | New evidence supports or contests same scoped proposition |
| `gap_m01_civilian_access` | Mali–Burkina Faso regional issue (not yet a mapped corridor), `humanitarian.access_status` | `open` | high, score TBD | partner, diplomatic, open-source | Dated locality/route-specific evidence; not national aggregate inferred |
| `gap_m01_asset_status` | candidate corridor/asset, `asset.operational_asof_2025_09_26` | `open` | medium, score TBD | technical, open-source, operator contact | Dated commissioning/status provenance and approved geometry |
| `gap_m01_counterpart_position` | Mali Government Focal Point, `position.monitoring_access` | `open` | medium-high, score TBD | strategic consultation | Position evidence arrives; hidden true position not disclosed by UI gating |
| `gap_m01_institutional_procedure` | AU/AES/ECOWAS legal routing, `mandate.required_authority` | `open` in authoring (not automatically player collectible) | high | institutional legal research | Legal review approves a procedure definition; until then formal authorization actions disabled due to *known missing procedure*, not hidden willingness |

`strategicImportance` requires a `Score` before compilation; terms above are authoring labels. The last item is explicitly an **out-of-game research dependency** unless Stage 2 deliberately creates a fictional in-world policy clarification process.

## 4. Knowledge, hidden state and authoring visibility

- `PlayerKnowledgeState` begins with the *evidence/report IDs explicitly marked known*; actor issue positions and red lines remain unknown unless concrete authored evidence supports an estimate.
- Scenario hidden truth may include whether a partner is actually amenable or whether access restrictions exist, but such variables may not be visible through ability/preview/sentence style.
- `EvidenceRecord` claims must use typed claim schemas and immutable source/date/confidence metadata; a narrative claim alone is not automatically engine authority.
- `AssessmentState` remains a player choice: no initial adopted conclusion and no automatic assessment revision. The report can say “the office assesses” only as non-authoritative analytical commentary if not committed as a structured institutional assessment.
- Map features use `subject_kind` and `subject_id`; no unverified Mopti geometry is shipped as an authoritative player map selection.
- In-game ‘blocked due to no approved procedure’ is visible as a *known institutional constraint*, not a hidden actor veto.

## 5. First decision opportunities (authoring contracts, not balanced ActionDefinitions)

| Action candidate | Family | Authority prerequisite | Slot cost | Immediate semantic result | Deferred possibilities | Knowledge-safe preview |
|---|---|---|---|---|---|---|
| `action_m01_task_access_verification` | intelligence | no mandate | 1 | create collection task, due later; decision journal | partial/contradictory/none/useful response; possible partner reaction | known effort, uncertain source coverage, no promise of reveal |
| `action_m01_consult_mali_access` | diplomacy | no mandate | 1 | simulate consequential consultation and record reply/possible commitment | role position becomes more knowable; fatigue or trust consequences | contacts may decline, no hidden stance leaked |
| `action_m01_task_civilian_route` | intelligence | no mandate | 1 | delayed request for locality/route access evidence | partial access picture; sources may disagree | no inferred displacement statistics |
| `action_m01_request_asset_validation` | intelligence | no mandate | 1 | task historical asset-status verification | may confirm existence, return incomplete records, or fail | not described as instant infrastructure investment |
| `action_m01_consult_au_commission` | diplomacy | no mandate | 1 | ask for procedural/political sponsorship | qualified institutional routing may become known | does not bypass PSC or host consent |
| `action_m01_adopt_access_assessment` | assessment | known hypothesis option and evidence | 1 | adopt structured player assessment with selected confidence; known contradictions automatically surfaced | changes defensibility/accountability; case escalation possible later | can proceed amid uncertainty; no “correct answer” feedback |

**Minimum authored choice quality:** first month may offer 2–4 *serious* competing options, not necessarily all six simultaneously. The scenario content gate must choose exact available set and define numeric costs, rule queries, effect profiles and scope IDs. No free hidden state mutation. A coherent consultation *package* may include related terms inside one slot; subsequent separate negotiation costs another.

## 6. Month 1 and Month 2 branching contract

**Month 1 opening:** present strategic brief, Mandate Charter, reporting divergence, access dossier, related unresolved gaps. Let player inspect map and reports without spending a slot; at least one `RequestIntelligence` and one `StrategicConsultation` can be legal under *known* conditions. Never require adopting a particular hypothesis.

**After first consequential command:** give immediate acknowledgment and any actually resolved institutional reaction, create audit event, decrement slot, persist snapshot, update the knowledge-limited projection. New intelligence can remain pending; no forced instant answer.

**End Month 1:** process task progression, event director, knowledge emission, unresolved attention persistence and commitment checks in the canonical end-turn order. The example Month 2 brief has four variants keyed to **player-visible** event types, not actual hidden intent:

- **A. Collection returned evidence:** state what was learned, source and limits; surface any contradictions; note whether revising/adopting assessment is worth consideration.
- **B. Collection pending/inconclusive:** state delay or no decisive result; preserve the gap and indicate other possible channels.
- **C. Consultation materially changed known position:** show the *observed* response and recorded terms, not unobserved private motivation.
- **D. No relevant action / unrelated priorities:** explain the status remains unresolved, a window may narrow through actual emitted world events, and record opportunity cost without moral scolding.

These variants may combine. A single turn should not produce a mandatory blocking response that exhausts slots; no action is artificially rewarded just for choosing a particular story path. The first **two** months must, across the guided onboarding experience, demonstrate a known gap, delayed reporting, divergent/contradictory source interpretation and an institutional reaction. Some onboarding reactions can be triggered by a non-player institutional action; do not force a particular player choice.

**Months 3–4 handoff:** if adopted assessment exists, may offer a one-slot `EscalateToMandateCase` command, then issue-specific coalition negotiation; no automatic permission to deploy. Introduce AES–ECOWAS distinction through a decision-relevant legal/liaison item rather than exposition alone.

## 7. Non-response and fairness

- Inaction is legal; unresolved issues persist, transform or expire through authored rules.
- Repeating the same task through the same source without changed context cannot be the dominant exploitation strategy.
- A severe hidden red line must normally have a discoverable clue before the first severe penalty.
- A no-data source cannot trigger `false` eligibility that reveals a hidden actor state; use tri-state unknown semantics.
- Never make the game present one invented official-sounding claim as objective historical truth. Every fictional document carries SIMULATED.

## 8. Data admission and research dependencies

**Blocking for historical baseline:** approved ADM1 boundary registry; ACLED five-country row-grain completeness (supplied file only 80 rows for those five states); displacement source with usable level/geometry (current IDMC GeoJSON has no spatial features); historical status validation for GEM and other infrastructure; verified licensing. Four-day conflict-observation gap between 26 September and 1 October must be flagged as unknown, not recorded as a quiet period.

**Blocking for executable gameplay content:** compiled actor/priorities/stance profiles, collection delays/costs and source-specific success mechanisms, approved fact and effect profiles, valid scene targeting, initial knowledge records, rule validation, and formal institutional procedures for authorization actions. All must be versioned and deterministic.

**Blocking for player-facing production copy:** legal review of historical status/mandate competencies, writing-standard conformance and regional review. Provisional report strings are not assertions about actual August/September 2025 counterpart communications.

## 9. Quality gates and acceptance

1. All docs with real actor references carry SIMULATED and distinguish history/source from fiction.
2. All real historical statements have date+source; no historical observation is synthesized as a fact.
3. Starting dossier and map contain no unverified spatial displacement or asset-status details.
4. Opening has three different valuable directions and does not force early security doctrine.
5. `EvidenceRecord` and `IntelligenceReport` IDs refer to valid typed records after compilation; pending evidence is never shown as received.
6. Every substantive response has an authored rationale and possible delayed/callback effects.
7. No hidden stance/red line influences player eligibility display.
8. Monthly instruction does not overfill three decision slots or generate unwinnable `decision_required` items.
9. Same seed, snapshot, command sequence and version set yield identical state hash.
10. Regional/legal review complete before declaring production readiness.

## 10. Package 3 handoff

Package 3 must convert the candidates to scenario content: exact hypotheses and option terms; `ActionDefinition`/`RuleExpression`/`EffectProfile` definitions; `CollectionTask` delivery semantics and deterministic samples; 4 months of authored event branches; objectives and scope; positions/commitments; actor reaction profiles; timeline and callback matrix; balance profile, IDs and coverage tests. Do not treat these Markdown drafts as already executable YAML/JSON.
