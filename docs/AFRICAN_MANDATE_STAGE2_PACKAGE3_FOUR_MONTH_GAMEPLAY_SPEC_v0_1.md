# African Mandate — Stage 2, Package 3: Four Months of Gameplay

**Version:** v0.1 · **Status:** authored design and compile contract, NOT executable ScenarioBundle, validated history, balanced or approved production content.  
**Authority:** Domain Model v1.1 → Technical Architecture v2 → Data & Methodology v1.1 → Game Design v2.1 → owner-approved Stage 1 → Stage 2 Packages 1–2 → this Package 3.  
**Campaign:** 1 October 2025 to resolution of Month 4 (January 2026); 20-month campaign overall, 3 strategic decisions per month (maximum 12 across this slice). Five playable countries: Mali, Burkina Faso, Niger, Chad, Mauritania. Administrative region IDs **not yet approved**. Historical conflict observation cutoff 26 September 2025; 27–30 September is unknown, not zero.

**Evidence classification:** `[H]` sourced historical context only; `[O]` accepted observed baseline only after compilation (none in this package); `[S]` deliberately fictional in-game content, not actual events; `[T]` synthetic test values; `[P]` provisional gameplay choice or balance; `[X]` blocked until named research/engineering gate. All player-facing documents concerning real states or organizations must say `SIMULATED` and not attribute invented quotes to real named individuals.

**Interpretation:** Scenario authoring tables give *possible branches*. The simulation must resolve them from keyed deterministic rules and stored state, never from script selecting the most dramatic outcome. Do not leak hidden actor stances in action availability or forecasts. Free inspection/drafting; all consequential consultations, collection, assessment adoption, escalation, negotiation, and authorization requests cost one decision slot. Each committed action resolves immediately and is non-reorderable/non-undoable in normal play.

## 1. Scope and success criterion

The player's first four months should teach that observation is partial; institutional actors have separate interests; actions consume limited attention; waiting is possible but changes opportunities; promises outlast the month. The slice is successful if a player can follow at least **three distinct strategies** (collect-first, engage-first, defer/redirect) to significantly different *known* institutional and intelligence states at the Month 5 handoff. **Do not require an authorized intervention by Month 4**. A well-formed mandate case, a flawed assessment, or a postponed case are valid endings. The Stage 1 priorities remain civilian protection/access, regional coordination, evidence-based action, corridor/service continuity, legitimacy/sustainability. The three arcs remain A evidence/access arrangement, B cross-border civilian protection, C corridor/service resilience.

## 2. Cast and jurisdictional constraints

| Actor and ID | Available role in months 1–4 | What they cannot grant by themselves |
|---|---|---|
| `actor_envoy_intelligence_lead` | Exposes known evidence, gaps, collection channel distinctions | Hidden truth or guaranteed successful collection |
| `actor_envoy_legal_adviser` | Explains known authorization restrictions and incompleteness | Shortcut around institutional legal review |
| `actor_mali_focal_point` | Host-government consultation on access/reporting | PSC authorization, independent regional consent |
| `actor_civic_reporting_coordinator` | Fictional independent evidence and coverage limits | Representative consent from all civilians |
| `actor_au_commission_liaison` | Political/administrative sponsorship, options for case routing | PSC approval |
| `actor_aes_liaison` | Regional consultation subject to historical institutional vetting | Authority to speak for all three governments without terms |
| `actor_ecowas_liaison` | External technical/transit consultation | Membership votes on behalf of Mali, Burkina Faso or Niger |
| `actor_ocha_coordinator` | Humanitarian coordination/reporting opportunities | Independent AU mandate authorization |
| `actor_afdb_programme_officer` | Project appraisal/conditions for arc C | Guaranteed finance or commitment |
| `actor_burkina_faso_focal_point`, `actor_niger_focal_point` | Optional later B/C counterpart consultation | Blanket regional authorization |
| `actor_chad_focal_point`, `actor_mauritania_focal_point` | Regionally relevant context; optional liaison if branch conditions warrant | Mandatory meetings merely because country is in scope |

**Procedural freeze:** No playable authorization decision may assert specific AU/AES/host-body powers until legal/regional review approves `authorizationProcedureId`, applicable permission, and terms. Pending review, the case can progress through assessment and exploratory coalition states; the authorization action is *known-disabled* with explanation.

## 3. Opening knowledge and asset restrictions

The package reuses Package 2 identities: `evidence_m01_access_gov_signal`, the independent civic coverage report, `gap_m01_access_verification`, `gap_m01_civilian_route`, `gap_m01_asset_status`, `gap_m01_counterpart_position`, and `gap_m01_institutional_procedure` (latter is an *authoring research blocker*, not an automatically collectable in-game gap). Player begins with no adopted assessment, mandate case, host commitment, or real verified asset status. Government willingness to *talk* and independent ability to *verify access* are compatible claims: do not wrongly render them as contradicting factual propositions. Formal contradictory evidence is allowed only when claims match subject, question, scope and reference period and truly differ.

The provisional Mopti story is an **issue-file focus**, not an already approved playable polygon. All zone-targeted commands use a placeholder `zone_pending_mopti_adm1` in authoring and MUST fail compilation until mapped to validated ID/geometry. Optional non-spatial entity/issue-targeted commands may work with existing institutional IDs. No displacement counts, conflict rates, asset points, or casualty numbers are invented to fill baseline gaps.

## 4. Strategic decision catalogue (authoring contracts)

All costs below are **one strategic slot** for successful consequential actions. Any material budget, staff, logistics, political-capital, or capacity cost remains an explicit `[P] TBD` profile; inventing a zero amount at runtime is prohibited. A command may be simulated in a development fixture only with a versioned TEST balance profile. `Authority` refers to prerequisites, not slot cost.

| Action ID | Family | Authority and knowledge-limited eligibility | Intended effects and risks | Next-turn/callback hooks |
|---|---|---|---|---|
| `action_m01_task_access_verification` | Intelligence | No mandate; known access gap, source channel option | CollectionTask `collection_access_*` due later; no instant revelation; repeat-task policy | collection useful/partial/contested/inconclusive/failed |
| `action_m01_consult_mali_access` | Diplomacy | No mandate; visible counterpart channel | Attempt consultation; if response, revealed claim/known commitment only when actual; possible fatigue | conditional invitation, restrictions, refusal |
| `action_m01_task_civilian_route` | Intelligence | No mandate; known civilian-route gap | delayed locality/access inquiry; no numeric IDP inference | B candidate; stalled access warning |
| `action_m01_request_asset_validation` | Intelligence | No mandate; asset-status unknown | delayed status verification, source suitability check | C candidate, inconclusive permitted |
| `action_m01_consult_au_commission` | Diplomacy | No mandate; known liaison route | knowledge of possible institutional sponsorship; not PSC authority | sponsorship conditionality |
| `action_m01_adopt_access_assessment` | Assessment | Known authored hypothesis + evidence; show contradictory evidence automatically | adopt declared Low/Moderate/High; political defensibility and accountability, no correctness oracle | potential case; later undermining |
| `action_m02_consult_civic_channel` | Diplomacy | Known civic reporting counterpart | negotiate verification terms, political cost/coverage constraint | independent reporting or capacity bottleneck |
| `action_m02_open_access_case` | Mandate | Adopted relevant assessment; one case per coherent assessment/scope | create `case_access_monitoring` assessment-basis stage | coalition engagement, distortion tension |
| `action_m02_consult_aes_liaison` | Diplomacy | Known liaison channel and issue; legal limitations displayed | seek technical position, no member-government consent | interinstitutional scope dispute |
| `action_m02_consult_ocha` | Diplomacy | Humanitarian need/reporting reason known | receive source-limited aid-access perspective, no raw historical data inventions | B path, access dependency |
| `action_m03_negotiate_monitoring_terms` | Diplomacy | Existing access case and actor channel | one package: scope + role + reporting conditions + commitment; issue-position shift conditional | scope integrity, oversight condition, promise due |
| `action_m03_open_civilian_case` | Mandate | Adopted B-relevant assessment | create `case_civilian_access` | cooperation, host permission, crisis response |
| `action_m03_open_corridor_case` | Mandate | Adopted C-relevant assessment and admissible asset/route evidence or explicitly qualitative service hypothesis | create `case_corridor_resilience`; cannot reference unverified named asset | partner finance/reliability |
| `action_m03_consult_afdb` | Diplomacy | Recognizable service/corridor issue | possible due diligence request, no automatic funding | funding conditionality, dependency |
| `action_m04_revise_assessment` | Assessment | Existing adopted assessment, new known evidence or materially changed rationale | linked revision; accountability effect, no automatic rewrite | renewed case credibility, actor memory |
| `action_m04_revise_case_scope` | Mandate | Existing case, player-known constraints | trade scope integrity for coalition feasibility; never free | distortion risk, possible host confidence |
| `action_m04_seek_authorization` | Authorization | **[X]** approved procedure, case stage, known institutional requirements | request pending; not instant authorization | approval/condition/rejection only after genuine resolution |
| `action_m04_reallocate_priority` | Crisis/strategic response | Known competing attention/capacity pressure | coherent strategic package for B/C/access priority; no arbitrary extra slots | portfolio strain and opportunity expiration |

**Concrete action variants, costs, eligibility, `ActionDefinition`, `ActionTargetSchema`, validated `RuleExpression`, `EffectProfile`, `PreviewPolicy` and `DoctrineDelta` must be compiled; a table row is not an engine definition.** Hidden simulation truth can change *resolution*, never preempt a player-known legally eligible attempt.

## 5. First four months: authored beat / branch / state matrix

### Month 1 — October 2025: Signals versus certainty

**Opening:** `brief_m01_strategic_opening` + Mandate Charter, simulated two-source access perspective, civilian/access gap, network-status unknown. Visible pressure is finite diplomatic/analytical bandwidth; no unsupported crisis counts.

**Decision candidates:** collect access evidence, consult Mali, investigate civilian route, request asset validation, consult AU Commission, or adopt a preconfigured cautious/decisive assessment if valid known evidence supports a selectable hypothesis. Draft/inspection are free; each submitted consequence costs 1 slot; at most 3. Any unused slots expire.

| Trigger | Immediate player-observable result | Background / later branch | Must not happen |
|---|---|---|---|
| `action_m01_task_access_verification` | Task accepted with question/channel and due-turn estimate; slot spent | keyed collection outcome scheduled, may remain pending in Month 2 | reveal true host intent instantly |
| `action_m01_consult_mali_access` | Consultation attempted; actual reply may acknowledge/condition/refuse | issue-position knowledge/memory if reported, revisit in M3 | claim government-wide policy from fictional focal point |
| `action_m01_adopt_access_assessment` | Declared-confidence assessment recorded; known contradictory material auto-displayed | case opening possible after another slot; future assessment challenge | mark true/false as omniscient feedback |
| no access action this month | No commitment entered; unresolved access gap persists | circumstances may evolve under actual scheduled simulated events | automatic punishment or forced losing ending |

**End-turn:** delayed collection processed in canonical subsystem sequence (authoring cannot override); urgency may change only via real engine world events. Create one available institutional reaction **from a simulated non-player interaction** if the player took no consultation, satisfying Month 1–2 tutorial without railroading player choices. No synthetic mandatory blocking decision after last slot.

### Month 2 — November 2025: Access on whose terms?

**Brief:** compose `brief_m02_scenario_update` conditionally from knowledge-visible tags: `collection_useful`, `collection_partial`, `collection_contested`, `collection_pending`, `consultation_terms_offered`, `consultation_declined`, `no_relevant_engagement`. Tags can combine; no single exclusive plot branch.

**Core dilemma:** extra collection may improve a weak assessment but consume an opportunity to institutionalize a viable channel. Counterpart willingness may be conditional while civic evidence coverage stays limited. The independent civic and government channels may disagree about **the same defined proposition** only if same-scope incompatible reports have actually been emitted.

| Visible circumstance | Legal candidate choices | Tradeoff / state recorded |
|---|---|---|
| usable evidence, no assessment | adopt Low/Moderate/High (1), collect again if new channel/context (1), consult civic contact (1) | confidence declaration influences accountability, cannot hide known contradiction |
| assessment adopted, no case | open `case_access_monitoring` (1), consult AU Commission (1), ask for new evidence (1) | case does not itself authorize implementation |
| government terms offered | accept/renegotiate term as coherent one-slot engagement where defined, defer, consult civic source | reporting independence vs access; only explicit recorded commitment persists |
| collection pending/inconclusive | change channel with justified value, pursue humanitarian route, avoid action | no collection farming, uncertainty retained |
| player pursued B/C first | OCHA/corridor route remains legal and important | opening access case not forced |

**End-turn:** update active commitments only from real recorded promises; delayed collection stays pending when delay applies; no duplicate relationship effect on memory processing.

### Month 3 — December 2025: Mandate scope and competing routes

**Brief:** present at least two meaningful candidate obligations, e.g. access case negotiation vs civilian access issue vs independent service-validation opportunity, subject to actual available knowledge. Do not introduce fixed disaster solely to force scarcity.

**Branch A: case opened.** Author one coherent consultation with a scope/oversight/monitoring package; potential conditional support or insistence on restricted reporting. A narrowed version may move political feasibility but increase **derived** distortion risk. No institution grants authorization automatically.

**Branch B: assessment adopted but no case.** Permit case opening now or revising assessment based on new evidence; previous communications and actor memories persist.

**Branch C: no adopted assessment.** Permit continued collection, cautious consultation, or credible deliberate deferral. World conditions evolve on end-turn only, not through passive real-time clocks.

**Branch B/C sector paths:** OCHA humanitarian access inquiry may support `issue_civilian_access` but cannot provide invented zone displacement totals. AfDB contact may flag finance appraisal/condition requirements without assuring funds; C implementation unavailable if historical corridor status unverified. Multi-country coordination cannot be accomplished by one actor inventing partner consent.

**Cross-country dimension:** AES/ECOWAS institutional differences are made action-relevant. Mali/Burkina Faso/Niger no longer members of ECOWAS at the anchor; technical dialogue is possible in authoring, not ECOWAS authorization for their policy. Chad and Mauritania may create separate conditions if scenario events or player priority call for them; do not force five-country attendance.

### Month 4 — January 2026: Institutional commitment under uncertainty

**Brief:** name the player's surviving access/civilian/service priorities, any case stage, known sponsor and condition changes, evidence age, and due promises. No invented precise outcome claims.

**Choices:** (a) revise adopted position after relevant source changes; (b) make/restructure a coalition condition and explicitly record a promise; (c) narrow/expand mandate scope where known legal bounds allow; (d) shift attention into the B/C pathway; (e) defer pending better evidence or cooperation. Formal authorization remains disabled if procedure research not signed off. A decision on a pending authorization is available only if a compiled and legally vetted procedure exists. A player may make decisions in another order or end the month early.

**End of Month 4:** compute appropriate derived doctrine tendency, then expose **Doctrine Review at start of Month 5**, not earlier. Do not auto-codify or spend a slot. End states are not win/lose. Handoff includes one of: `A-case with coalition progress`, `A-case contested/strained`, `B/C-case initiation`, `adopted assessment but no case`, `collection/engagement-heavy with no adopted assessment`, or `low-engagement unresolved` — more than one may apply when player uses parallel case paths.

## 6. Negotiation packages and political consequences

### Negotiation N1 — Monitoring independence versus counterpart access

**Proposed terms (one coherent action):** technical liaison role `{limited|joint|none}`, reporting path `{independent|joint_review|host_only}`, resource commitment `{none|bounded_test_allocation}`. Validate combination against legal scope and resources before commitment. `host_only` may ease counterpart negotiations in hidden model but makes the case's original independent-verification objective vulnerable to distortion; that vulnerability only becomes public through known terms, not an exposed hidden score. A commitment with a promised timeline must create a typed record with beneficiary, due turn, fulfillment rule, breach/fulfilled states. Do not apply a trust adjustment again when memory decays.

**Actor response categories:** `accepts_discussion`, `requests_revision`, `declines`, `noncommittal`, `offers_conditional_access`. Actual category resolved deterministically based on actor's issue-specific stance, case terms, leverage, red lines, and contextual events. Hidden red-line risks manifest *after* attempt, not as preemptively disabled known choices. A severe hidden sanction needs a discoverable signal before first severe impact.

### Negotiation N2 — Regional representation versus case coherence

**Proposed terms:** consult AU Commission, AES liaison, ECOWAS technical channel as **separate interactions** unless a legal consolidated process is approved. The player may promise reporting access, sector coordination, or scope review; cooperation from one body does not imply permission from another. Support is issue-specific, not a global attitude modifier.

### Negotiation N3 — Civilian access versus implementation bandwidth

**Proposed terms:** prioritize source-independent access verification or near-term liaison expansion; both draw on capacity and may delay an infrastructure dossier. OCHA and civic channels are sources/cooperation pathways, not owners of national sovereignty. Unverified displacement counts cannot be an eligibility gate or certainty claim.

## 7. Timed consequence and callback matrix

| Source decision / condition | Earliest intended callback | Conditions | Visible consequence | Persistent state |
|---|---|---|---|---|
| M1 intelligence collection | M2–M3 | source outcome, due turn | usable, partial, contested, inconclusive, delayed, failed evidence status | task, evidence IDs, gap state, report history |
| M1 government consultation | M2–M4 | response recorded, terms retained | further restriction or limited cooperation known through response | known position, optional memory/commitment |
| M1 high-confidence assessment | M3–M5 | later contradictory/source evidence actually emitted | confidence may become contested/undermined; **not** auto-rewritten | assessment lifecycle + accountability |
| M2 civic consultation | M3–M4 | credible channel, capacity/conditions | independent coverage increased or inability to verify persists | evidence, fatigue/access commitments |
| M2 mandate-case opening | M3–M5 | adopted assessment and qualified scope | new coalition opportunities, opposition, delay | case state + issue positions |
| M3 scope concession | M4–M7 | condition accepted and implementation path exists | strengthened coalition but narrowed monitoring independence | commitment, case scope, distorted-risk inputs |
| M3 humanitarian inquiry | M4–M6 | collected access report | B issue advances or remains uncertain | gap/evidence/task |
| M3 finance inquiry | M4–M7 | appraisal and validated project | conditional finance pathway, never instant disbursement | due-diligence task/position/commitment if signed |
| M4 promise | M5 onward | dueTurn/fulfillment condition | eventual kept/breached/waived/expired with actor memory | commitment and audit events |
| Any ignored situation | M2–M5 | actual expiry or changing world conditions | window changes or remains stable | situation/attention registry |

These are **relative authoring windows**, not guaranteed events. Events never spawn a same-month unavoidable fourth strategic action. Every significant consequence references source decision IDs, event IDs and known evidence in player-facing explanations; debug traces can retain hidden causes separately.

## 8. Authoring invariants and release gates

| Test | Required assertion |
|---|---|
| Slot economy | Never more than three committed 1-slot decisions in a turn; no carryover; no undo; reserved mandatory slots cannot softlock |
| Branch diversity | Collection-first, consultation-first, and no-access-focus scripts yield different authoritative/projected state under same seed |
| Temporal causality | M2–M4 report appears only after task due/emission, not because narrative script wants it |
| Epistemic firewall | Changing a hidden position alone does not change visible eligibility, forecast details, or event text |
| Contradiction validity | Disagreement on different questions is not labeled contradiction; incompatible claims on same scope/date are flagged |
| Institutional powers | No authorization by liaison, OCHA, AES, ECOWAS without validated rules; known missing procedure is legibly blocked |
| Geographic integrity | No dummy Mopti ID survives production compilation; no imaginary asset or displacement allocation |
| Character memory | Memory effects applied once; commitments must be actionable, due and reconcilable |
| Determinism | same versions+seed+ordered command IDs/history → identical snapshot/hash; changed order may change outcome |
| Inaction | End Month legal with unused slots unless legitimate preexisting bounded mandatory response |
| Month 5 transition | Doctrine Review appears only after Month 4 resolution; does not auto-codify |
| Narrative safety | Every in-world doc labeled SIMULATED; no fabricated real-person quotes; no text from unseen hidden truth |
| Test coverage | Run complete synthetic Month 1–4 branch scripts plus randomized headless run; no unresolved schema or reference errors |
| Field review | AU/institutional legal review, Sahel regional review, licensing and data source admissions completed before public production use |

## 9. Outstanding decisions and handoff to Package 4

**P0 content/compiler blockers:** approve actual administrative boundary IDs and geometry; supply adequate five-country 2025 conflict coverage; validate historical assets/displacement or leave explicitly unknown; build exact actor definitions (priority vectors, capacity, issue-specific position rules); define typed rules/facts/effect profiles/collection task semantics; legally vet authorization procedures; tune material costs and balancing; implement validated immutable scenario bundle. **Stage 2 design may proceed without inventing those values.**

**P1 design work:** test warning/priority cadence against 3 slots; place B and C decisions in distinct compelling access paths; author reporting templates for every outcome; codify doctrine tendencies; test no-progress trajectories are understandable rather than punitive; prepare pending authorization content once approved. **Package 4 must execute** these cases headlessly and then in a player projection/UI slice.
