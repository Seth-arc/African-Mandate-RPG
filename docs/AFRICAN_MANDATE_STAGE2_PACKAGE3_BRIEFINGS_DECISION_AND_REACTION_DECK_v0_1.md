# African Mandate — Stage 2, Package 3: Four Months of Gameplay

**Version:** v0.1 · **Status:** authored design and compile contract, NOT executable ScenarioBundle, validated history, balanced or approved production content.  
**Authority:** Domain Model v1.1 → Technical Architecture v2 → Data & Methodology v1.1 → Game Design v2.1 → owner-approved Stage 1 → Stage 2 Packages 1–2 → this Package 3.  
**Campaign:** 1 October 2025 to resolution of Month 4 (January 2026); 20-month campaign overall, 3 strategic decisions per month (maximum 12 across this slice). Five playable countries: Mali, Burkina Faso, Niger, Chad, Mauritania. Administrative region IDs **not yet approved**. Historical conflict observation cutoff 26 September 2025; 27–30 September is unknown, not zero.

**Evidence classification:** `[H]` sourced historical context only; `[O]` accepted observed baseline only after compilation (none in this package); `[S]` deliberately fictional in-game content, not actual events; `[T]` synthetic test values; `[P]` provisional gameplay choice or balance; `[X]` blocked until named research/engineering gate. All player-facing documents concerning real states or organizations must say `SIMULATED` and not attribute invented quotes to real named individuals.

**Interpretation:** Scenario authoring tables give *possible branches*. The simulation must resolve them from keyed deterministic rules and stored state, never from script selecting the most dramatic outcome. Do not leak hidden actor stances in action availability or forecasts. Free inspection/drafting; all consequential consultations, collection, assessment adoption, escalation, negotiation, and authorization requests cost one decision slot. Each committed action resolves immediately and is non-reorderable/non-undoable in normal play.

## 1. Monthly briefs (SIMULATED; templates, not observed facts)

### `brief_m01_strategic_opening` — October: The limits of the initial picture
**SIMULATED · Office of the AU Strategic Envoy · 1 October 2025**  
**Summary:** The office has an opening for technical discussions on reporting access. Independent verification of access remains incomplete. You may seek additional evidence, consult counterparts or adopt a cautious institutional assessment.  
**What is known:** Two channels have reported, with different claims about discussion access and field verification. **What is not known:** Whether consistent independent reporting can be sustained, what civilian corridors are accessible, which historical infrastructure entries were operating at the conflict anchor. **Decision-relevant tension:** Early engagement may establish a political channel; investigation may improve the quality of the case but use the same scarce monthly attention.

### `brief_m02_scenario_update` — November: Conditional situation
**SIMULATED · Office of the AU Strategic Envoy · November 2025**  
**Summary selection rules:** If task returned usable evidence, say what the named channel actually reported with date and confidence; if inconclusive/pending, do not imply success. If a counterpart offered terms, summarize *known* terms. If no relevant engagement, state that the matter remains open and that relevant opportunities may change. **The four fragments can be composed; they are not mutually exclusive alternative worlds.**

### `brief_m03_institutional_paths` — December: What is feasible
**SIMULATED · Office of the AU Strategic Envoy · December 2025**  
**Summary:** An assessment can support a mandate case, but a mandate case is not authority to act. The office must decide whether to make the reporting arrangement workable, pursue civilian access or continue validating service continuity. **Conditional insert:** Include actual outstanding case constraints, source gaps, commitments and open windows only when registered/known.

### `brief_m04_commitments` — January: What can be carried forward
**SIMULATED · Office of the AU Strategic Envoy · January 2026**  
**Summary:** The first phase of the mandate is nearing completion. The office can formalize its emerging institutional position, adjust scope or continue building evidence. **Conditional insert:** Name known overdue/due commitments and the exact case stage. Do not describe a mandate as authorized without an authorized `AuthorizationState`.

## 2. Sample decision panels (SIMULATED, optional and knowledge-limited)

### `panel_access_collection`
**Question:** What do we need to know about independent verification?  
**Options:** Request technical monitoring; request independent civic reporting; defer.  
**Known costs:** One strategic decision for committed collection; other resources display from approved balance profile only.  
**Unknown:** Whether reporting is available, timely or decisive.  
**Effect:** A collection task is created; evidence is not delivered immediately.

### `panel_access_consultation`
**Question:** Should the envoy pursue counterpart discussions now?  
**Options:** Seek a limited technical meeting; request reporting conditions in writing; defer.  
**Known:** An invitation to discuss is not field access.  
**Possible responses:** Accept discussion, condition it, decline or remain noncommittal. A reply is reported as observed, never inferred from hidden intent.

### `panel_assessment_confidence`
**Question:** How strongly can the office stand behind its access hypothesis?  
**Hypotheses [P]:** `access_channel_feasible`, `access_restrictions_unresolved`, `insufficient_evidence_for_access_mandate` (subject to Scenario Bundle registration).  
**Confidence:** Low, Moderate, High.  
**Evidence:** Player selects support; system always surfaces known same-question contradictory material and gaps.  
**Effect:** A formally adopted assessment consumes one decision; later evidence may undermine it without rewriting it.

### `panel_case_scope_terms`
**Question:** Which reporting arrangement can partners sustain without defeating the mandate's objective?  
**Options:** Independent reporting; joint-reviewed reporting; host-routed reporting.  
**What changes:** Scope and obligations exactly as shown in recorded terms if agreed, with no guaranteed authorization.  
**Risk:** A narrow politically acceptable arrangement may compromise independent evidence. This risk description may use only terms/knowledge the player sees.

## 3. Reactions (SIMULATED, condition-bound variants)

| Triggered state | Response template | Player-visible aftereffects |
|---|---|---|
| counterpart accepts discussion | “The focal point agreed to further technical talks. No agreement on independent reporting access was recorded.” | invitation/report event; no host consent assumed |
| counterpart proposes conditions | “The focal point requested a joint reporting process. The office has not accepted those terms.” | estimated or known issue position with evidence; term proposal |
| counterpart declines | “The requested consultation did not secure a meeting. The reason is not independently verified.” | rejected/failed attempt recorded; fatigue possible |
| collection partially returns | “The reporting task produced some relevant material, but the main verification question remains unresolved.” | partial evidence and gap remains |
| authentic same-scope contradiction arrives | “Two reports give incompatible accounts of independent verification for the same period. The assessment is contested.” | evidence IDs in dossier; confidence recalculated |
| mandate case opened | “A mandate case was opened on the basis of the adopted assessment. Authorization has not been requested.” | case stage assessment basis; slot spent |
| terms materially narrow scope | “The agreed monitoring terms limit independent reporting. The case remains open for further institutional consideration.” | known term and scope integrity factors; not final distortion label |
| no action taken | “The access question remains unresolved. No institutional commitment was made this month.” | persistent gap/situation; no invented failure |

## 4. Month 5 handoff (SIMULATED)

**Event:** Doctrine Review becomes available **at the start of Month 5 after Month 4 resolution**. The office reports the pattern of decisions actually taken (preventive/reactive; AU/regional; security/development; pressure/consensus). Codification, if offered, is a *future* consequential Month 5 decision. If the player has mostly deferred, the office should say the pattern is not yet pronounced; no invented doctrine. The dossier and decision journal preserve evidence sources, consultation responses, known restrictions and commitments.
