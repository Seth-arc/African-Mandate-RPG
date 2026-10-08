# African Mandate — Sahel Scenario Specification v1
## Stage 1: Narrative Foundation and Campaign Framework

**Status:** Proposed scenario-content specification for owner approval; not yet a compiled `ScenarioBundle`  
**Prepared:** 2026-10-08  
**Scenario working title:** **Sahel Arena** (provisional; name not yet formally approved)  
**Document role:** Narrative and political foundation for Stage 2 authoring; subordinate to the canonical Domain Model v1.1, Technical Architecture v2, Game Design v2.1 and Data & Methodology v1.1.  
**Approved constraints:** Historical conflict observation anchor **2025-09-26**; simulation opens **2025-10-01**; **Mali, Burkina Faso, Niger, Chad, Mauritania** playable; playable zones must use **validated administrative boundaries**, with specific provider, edition and level pending. **20 monthly turns**, **three strategic decisions per turn**.  
**Legend:** **APPROVED** = fixed upstream project decision; **PROPOSED** = concrete Stage 1 authorial recommendation, not yet accepted; **REQUIRES RESEARCH** = historical/institutional fact needing source and regional review; **STAGE 2** = to be implemented as authored content with decision/effect definitions.

---

# 1. Executive concept

The player serves as the **African Union Strategic Envoy**, assigned to pursue a bounded, politically difficult Sahel mandate in a simulated institutional environment beginning in October 2025. No sovereign government, regional organization, or external power is directly controlled by the player. The player has influence through credible assessment, institutional legitimacy, access, negotiation, coalition formation, formal authorization, resource coordination, and the accountability attached to commitments.

**The campaign question:** *Can the envoy turn partial and contested knowledge into collective action that reduces harm and leaves institutions able to cooperate after the envoy departs?*

A successful campaign is neither a military conquest nor a fixed peace settlement. The player must weigh urgent protection against long-term legitimacy, cooperation against independence, speed against quality of evidence, and visible delivery against lasting capacity. A mandate can be implemented but distorted, technically delivered but counterproductive, or only partly delivered yet strategically constructive.

**Narrative engine:** An authored starting environment and a few conditional anchor situations intersect with state-driven events, actor adaptation, commitments, memories, institutional procedures and delayed callbacks. No predetermined chronological chain of crises or mandatory policy answer is permissible.

**Epistemic frame:** Real-world source data provides an immutable, attributed observed baseline. All in-game developments from October 1, 2025 onward, including simulated reports and quotations, are fictional game outputs. The historical cutoff **does not establish full coverage** of the four-day period September 27–30, 2025. Missing observations must remain missing, never be recoded as stability or zero events.

# 2. Canonical boundaries and scope

## 2.1 Scenario time — APPROVED

- Simulation start: **2025-10-01**; Month 1 is October 2025.
- The 20th month resolves before the campaign closes; the opening 20-turn period runs October 2025 through May 2027, subject to the canonical calendar implementation.
- Historical conflict observation anchor: **2025-09-26**. Source-specific observation windows and later historical evidence of assets must be handled under Data & Methodology v1.1.
- One player-facing decision is one coherent strategic engagement. Consequential commitments resolve immediately upon **Commit**, consume one of three monthly decisions, and have no ordinary in-turn undo. There is no post-commit reorder/remove queue.
- Free reading, comparison, map exploration and uncommitted drafting do not consume a decision.

## 2.2 Geography — APPROVED policy, pending implementation

Five playable territories: Mali, Burkina Faso, Niger, Chad and Mauritania. Neighbors may appear as **context-only** subjects for transboundary dynamics. The canonical world geography uses validated administrative polygons with country parents, deterministic stable zone IDs and an adjacency graph.

**REQUIRES RESEARCH:** Choose the boundary source, edition, effective date, administrative level, historical crosswalk, rights and disputed-boundary convention. Admin-1 is a *candidate*, not an approved unit; no administrative names listed later in this document are canonical zone IDs. A visual Africa map or raw GeoJSON is not automatically the zone registry.

## 2.3 Audience and tone

The game serves strategy players and policy/governance professionals. It should be playable without prior knowledge of African Union procedure. Tone is serious, concise, institutional and humanly grounded. It must not treat civilian harm as a spectacle, reduce a population to a single preference, or suggest one real-world political actor is an inherent villain. No real named living person's invented direct quote should appear. A regional/AU-practice reviewer must sign off on institutional roles and politically sensitive material before publication.

## 2.4 What this document does not authorize

This document **does not** establish historic conflict levels, official institutional membership, real actor motives, consent requirements under actual law, exact baseline figures, specific operations, a starting map layer or mechanically approved actor disposition. It proposes a plausible **fictional scenario framework** subject to source checking, scenario writing, numerical balancing and approval. It does not revise Domain Model schemas or substitute for Data & Methodology validation.

# 3. The opening situation — proposed fictional narrative premise

## 3.1 Narrative opening

**PROPOSED:** The African Union commissions a strategic envoy to coordinate a bounded regional initiative amidst overlapping cross-border civilian-protection concerns, infrastructure and trade dependencies, and differing views about the appropriate balance of national sovereignty, regional cooperation and external involvement.

The envoy's office receives a mixed first dossier: historical conflict observations, partner reporting, incomplete displacement evidence, infrastructure inventories with uncertain operational dates, and official institutional positions whose confidence varies by source. The opening is defined by **contested interpretation** rather than a scripted catastrophe. An opportunity for cooperation is visible but fragile: some institutions see a limited monitoring-and-access arrangement as feasible; others favor bilateral channels, narrower geographic scope, or development-led measures.

The first month should give the player meaningful **freedom to investigate, consult or establish an assessment**, while ensuring the first two months collectively demonstrate an intelligence gap, delayed information, conflicting sources and consequential institutional reaction.

## 3.2 Required opening documents — Stage 2

1. **Mandate Charter**: role, duration, priorities, known constraints, protected commitments, evaluation dimensions.
2. **Strategic situation brief**: a few observed baseline items with source/date, their uncertainty, and the most urgent decision-relevant questions.
3. **Intelligence gap register**: at least one unresolved cross-border or civilian-access question with possible collection channels.
4. **Actor and institution dossier set**: known authority, estimated or known issue-specific positions, source confidence, no exposure of hidden intent.
5. **Map situation view**: only selected validated geographic features and information the player actually has.
6. **First optional decision package(s)**: distinct strategic tradeoffs, each with known costs and uncertainty.

All documents involving real places or institutions must carry a visible **simulated** marker for fictional content and separate historically sourced facts from invented simulation material.

# 4. Proposed Mandate Charter

**PROPOSED — approval required before the ScenarioBundle is authored.** The Mandate Charter should be shown to the player as a clear institutional instruction rather than as an abstract victory list.

## 4.1 Role and duration

**Role:** African Union Strategic Envoy.  
**Duration:** 20 monthly turns, October 2025–May 2027.  
**Authority:** Coordinate, assess, recommend, consult, negotiate, seek appropriate formal authorization and support execution within authorized scope. The envoy cannot order sovereign forces or institutions as owned units.

## 4.2 Five proposed strategic priorities

| Priority | Player objective | Enduring tradeoff |
|---|---|---|
| **P1. Civilian protection and humanitarian access** | Improve the conditions for civilian safety, access and continuity of assistance where credible evidence points to need | Fast access may require concessions that constrain independent assessment |
| **P2. Regional coordination** | Create workable cross-border or interinstitutional cooperation mechanisms | Broad membership can slow agreement and narrow mandate scope |
| **P3. Evidence-based response** | Build and revise defensible assessments, acknowledging contradictions and gaps | More collection improves confidence but consumes strategic time |
| **P4. Resilient essential services and corridors** | Reduce the exposure of strategically important services, trade links and infrastructure to disruption | Visible projects can divert scarce capacity from less visible protections |
| **P5. Institutional legitimacy and sustainability** | Preserve credible authority, fulfill commitments and leave deliverable mechanisms after Month 20 | Short-term political convenience may weaken long-run trust |

No priority is an automatic scoring bonus; none requires maximization in isolation. **STAGE 2** must translate priorities into specific opportunities, mandates, tests and causal evaluation paths without creating a single ideologically favored strategy.

## 4.3 Proposed constraints

- No consequential formal intervention without the relevant scenario-defined authority requirement and procedure.
- Respect source uncertainty; acting on weak or conflicting reports may be defensible, but must create intelligible accountability.
- Treat partner promises as persistent commitments with due dates and possible breaches.
- No direct player command of armed forces, national cabinets, intelligence agencies or donor institutions.
- Material resources, political capital and implementation capacity are constrained; unused strategic decisions expire at end of month.
- An authorization may be conditional, time-limited, narrowed or revoked; formal approval never guarantees implementation.
- Host consent and AU/REC procedure are **not assumed as universal legal facts**; these are to be modeled case-by-case in the Sahel scenario after expert review.

## 4.4 Evaluation frame — canonical dimensions

The review uses **security, civilian outcomes, regional stability, institutional cohesion, legitimacy and mandate sustainability**, taking account of trajectory and delayed effects. These remain distinct from proposed always-visible indicators (stability, insurgency, civilian support, global legitimacy, regional synergy), which may only be derived, knowledge-limited projections after methodological approval. The leaderboard is an additional verified game format; its composite formula must be published separately and server-verified, never accepted from an untrusted client score.

# 5. Political and institutional cast — roster framework

**Status:** Provisional **institutional role slots**, not an approved actor list, assigned motivations, legal-status declaration, or claim of the historical situation on a specific date. Stage 2 needs identifiable instance IDs, jurisdiction, procedural authority, resources, stance tendencies, specific red lines, knowledge visibility, memory parameters, prose profiles and source notes. Real-world accuracy, names and relationships require historical research and regional review.

## 5.1 Actor classes and why they matter

| Role slot | Possible named institutions / participants for research | Strategic function in the game | Possible modeled disagreement (fictional, not asserted historical) |
|---|---|---|---|
| AU institutional center | AU Commission; Peace and Security Council | Representation, legitimacy, coordination, procedural authorization | Breadth and independence of mandate versus speed and consensus |
| Mali governmental interlocutors | Relevant national civilian, diplomatic, security and administrative institutions | Territorial access, institutional agreement, domestic capacity | Host authority versus external monitoring arrangements |
| Burkina Faso governmental interlocutors | Equivalent relevant national offices | Access, corridor coordination, implementation | Urgent protection versus bilateral control |
| Niger governmental interlocutors | Equivalent relevant national offices | Cross-border cooperation, logistics, access | Counter-disruption priorities versus outside oversight |
| Chad governmental interlocutors | Equivalent relevant national offices | Eastern regional interfaces and cross-border effects | National sequencing versus regional mandate priorities |
| Mauritania governmental interlocutors | Equivalent relevant national offices | Western regional coordination, border and humanitarian concerns | Local tradeoffs versus region-wide commitments |
| Regional institutional platforms | **REQUIRES RESEARCH:** appropriate bodies and actual membership/relationships at the 2025 anchor, including ECOWAS, AES and other relevant groupings | Coalition assembly and legitimacy across different institutional memberships | Regional ownership, inclusion and scope of coordination |
| Multilateral humanitarian/development partners | UN agencies, development finance institutions and appropriate partners, if vetted | Technical capacity, aid access, finance and delivery | Reporting independence versus access and political acceptability |
| External diplomatic/financial powers | EU, China, Russia and other historically relevant states/institutions as researched | Financing, diplomacy, strategic leverage | Project or political preferences; none assigned automatic good/bad status |
| Civil-society and community channels | Invented or appropriately researched field-reporting, humanitarian and civic representatives | Civilian evidence, legitimacy, feedback, accountability | Access and protection versus exposure or institutional exclusion |
| Non-state armed actors | Scenario-researched and legally reviewed, preferably represented through documented behavioral constraints rather than caricatures | Hidden coercive capabilities and pressures affecting security/civilians | Opportunism, bargaining, territorial influence — all model-defined, not omniscient UI facts |
| Infrastructure and commercial counterparties | Asset operators and corridor-dependent institutions | Implementation dependencies, service reliability and finance | Continuity, cost, access, local impact |

**Historical institutional correctness is a gate.** Do not automatically treat these bodies as allied or mutually compatible. In particular, legal membership and procedural standing across Sahel regional organizations must be verified as of the historical anchor before any authorization rule or coalition requirement is authored.

## 5.2 Granularity policy

Institutions and persons are different domain entities. A government, a named representative office and a particular interlocutor are not interchangeable. Actor stances are **issue-specific**; a trusted institution may resist a particular monitoring mandate. Relationships are directional. Hidden intent and red lines are only exposed through acquired knowledge. Do not reuse broad faction color slots as a substitute for the full, potentially larger actor roster.

## 5.3 Actor profile authoring contract — Stage 2

For every named slot: canonical name/short name, source/validity date, stable actor/institution ID, type, institutional affiliation, authority domain, interests and constraints, risk tolerance, capability profile, initial known and unknown positions, relationship direction, discoverable and hidden red lines, reporting reliability/delay/bias, negotiation term repertoire, memory triggers, consultation repetition control, and potential adaptation/callbacks. All scores/weights remain **balance-tunable and pending approval**.

# 6. Major strategic tensions

The campaign's dramatic conflict should recur through these six **mechanical** tensions rather than a fixed series of cinematic plot twists.

| Tension | First-order attraction | Cost or counterpressure | Possible delayed callback |
|---|---|---|---|
| **Evidence vs. urgency** | Act immediately on imperfect reporting | Wrong diagnosis, misdirected priorities or damaged credibility | Later evidence undermines an adopted assessment |
| **Sovereignty vs. independent verification** | Gain quicker local cooperation | Monitoring scope or source access narrowed | Implementation apparently succeeds but evidence quality degrades |
| **Coalition breadth vs. mandate integrity** | Increase political authorization prospects | Conditions dilute core objective | Wider coalition approves a distorted mandate |
| **Security response vs. civilian confidence** | Stabilize access or reduce disruption quickly | Community confidence and humanitarian accessibility may deteriorate | Security gains coexist with weaker legitimacy |
| **Infrastructure investment vs. resilience risk** | Build service continuity and economic opportunity | Capacity diversion, asset exposure and dependency | Corridor improves initially but later disruption strains cooperation |
| **Immediate delivery vs. sustainable institutions** | Show visible progress within 20 months | Overload, partner dependence and unresolved maintenance | Strong short-run delivery leaves brittle systems at close |

These are design possibilities, not predictions of real actors. No tension should reward one default ideological position. At least two actions addressing each major situation should be defensible with different risks and unknowns.

# 7. Crisis and opportunity families

Each family is a **scenario-authoring template**. It should have trigger rules, geographic subjects, intelligence leads, relevant actors, competing choices, implementation pathways, plausible systemic effects, callbacks and a non-escalation branch. Where applicable, source evidence may motivate the initial fictional setup but must never be represented as a new historical event after the campaign start.

| Family | Core player question | Example mechanisms | Counterweight / opportunity |
|---|---|---|---|
| **F1. Cross-border security and mobility** | Is a regional response justified by the evidence? | conflicting reports, monitoring, consultations, spillover | independent verification may prevent misallocation |
| **F2. Humanitarian access and displacement** | Can access be secured without losing accountability? | humanitarian coordination, host conditions, data lag | local agreement creates a new reporting channel |
| **F3. Infrastructure and corridor disruption** | Which assets merit scarce attention? | exposure, service failure, implementation protection | coordinated maintenance improves resilience |
| **F4. Regional institutional competition** | Who has standing and sufficient support for this mandate? | conflicting procedural preferences, conditions, authorizations | narrower but legitimate coalition becomes viable |
| **F5. External finance and strategic dependence** | What does financing buy and constrain? | commitments, co-financing, project conditions | pooled financing diversifies exposure |
| **F6. Legitimacy and information dispute** | Is the official assessment still credible? | contradicting institutional reports, confidence decay, revision | correction protects credibility despite political cost |
| **F7. Operational capacity and portfolio overload** | Which implementation can be sustained? | personnel/logistics limits, delayed milestones | suspend or narrow one project to save another |
| **F8. Political openings and de-escalation** | When does restraint become strategic action? | windows for trust-building and joint access | missed window may close without an artificial catastrophe |

Minimum bar: each major family has at least one **constructive opportunity**, one inaction path, one plausible downside, and a retrospectively intelligible causal route.

# 8. Five-act campaign structure

The five four-month acts are **pacing intentions**, not fixed mechanic locks. Events may occur early, late, in altered form or not at all according to state. The player can continue collecting intelligence in the final months or form coalitions earlier than Act II.

| Act / months | Player's central question | Narrative function | Candidate content (PROPOSED) | End-state pressure |
|---|---|---|---|---|
| **I — Orientation & Diagnosis (1–4)** | What is actually happening? | Show contradictory evidence and costly attention | conflicting cross-border reports, a humanitarian-access uncertainty, first consequential consultation, early adopted or deferred assessment | office must choose a defensible initial institutional posture |
| **II — Coalition & Mandate Formation (5–8)** | Who will support action and on what terms? | Turn analysis into political bargaining | issue-specific actor stances, commitments, procedural delays, discoverable red lines, narrower/broader mandate choices | formal authorization may become conditional or stalled |
| **III — Implementation & Competition (9–12)** | Can an authorized strategy deliver? | Reveal material constraints and actor adaptation | implementation milestone, infrastructure/corridor complication, partner conditionality, competing active cases | portfolio strain exposes tradeoffs |
| **IV — Consequence & Strain (13–16)** | What did earlier choices set in motion? | Make commitments and memories matter | promised access questioned, distorted monitoring affects reporting, overdue commitment, cross-border spillover | previously defensible decisions produce mixed costs |
| **V — Consolidation & Legacy (17–20)** | What survives beyond the envoy? | Shift from launches to sustainable outcomes | final allocation, renewal/revision/suspension, institutional handover and unresolved-risk review | six-dimension end-of-mandate evaluation and causal chains |

**Scenario pacing target:** frequently more worthwhile demands than three decision slots, including approximately 2–4 serious *new* candidates plus ongoing commitments/mandate work. Quiet months are legitimate. Most situations persist, transform or expire rather than disappearing at turn rollover.

# 9. Three proposed major mandate opportunity arcs

These are **optional arcs** for development, not compulsory quests, source claims, guaranteed wins or final canonical mandate names. Each may branch and coexist with other mandates depending on the player's choices.

## Arc A — Regional Evidence and Access Arrangement

**Question:** Can the envoy build a credible multi-institution reporting and access arrangement without losing necessary host cooperation?

**Inputs:** conflicting field and official claims, disputed access or reporting delays, known gaps.  
**Institutional path:** acquire or assess evidence → scope a case → negotiate partner roles and monitoring conditions → seek appropriate authorization → support field reporting.  
**Tradeoffs:** independent verification, speed, institutional access and coalition breadth.  
**Potential callbacks:** denied access creates staleness; accepted oversight condition increases cooperation but weakens independence; fulfilled information-sharing promise improves later consultation.  
**Multiple outcomes:** strong/intact/positive, partial/intact/mixed, full/distorted/mixed, failed/negative, as determined by simulation rather than narrative labels.

## Arc B — Cross-Border Civilian Access and Protection Coordination

**Question:** How can scarce political capital improve humanitarian access and civilian conditions across neighboring jurisdictions?

**Inputs:** source-dated displacement reporting, simulated evidence gaps, corridor exposure, stakeholder conditions.  
**Institutional path:** identify need → select target geography → consult governments/community channels → negotiate access terms → obtain necessary authorization and delivery commitments.  
**Tradeoffs:** speed, consistency of access, local legitimacy, monitoring independence and capacity.  
**Potential callbacks:** initial access succeeds but monitoring is restricted; neighboring zone pressure grows; a prior promise determines whether a partner remains engaged.  
**Guardrail:** do not treat IDMC's current empty GeoJSON features as spatial evidence; initial zone-level displacement must remain unknown until sourced or transparently modeled.

## Arc C — Essential Corridor and Service Resilience Compact

**Question:** Can regional actors coordinate protection and continuity of infrastructure without creating unsustainable dependency?

**Inputs:** dated asset existence/status, verified geometry, credible vulnerability data, prospective co-financing evidence.  
**Institutional path:** identify exposure → prioritize corridor or asset → negotiate finance and participation → authorize an implementation scope → manage delivery and maintenance.  
**Tradeoffs:** investment visibility, long-term reliability, partner influence, financial burden and portfolio strain.  
**Potential callbacks:** resource diversion slows another mandate; dependence invites conditionality; corridor recovers but service equity remains unresolved.  
**Guardrail:** 2026 inventory records cannot be silently backdated as assets operating in 2025; unrouted pipelines do not create fictitious zone geometry.

# 10. Stage 2 narrative responsiveness contract

Every major strategic action must be authored with:

1. **Player question and decision family**: intelligence, assessment, diplomacy, mandate, authorization, implementation or crisis/strategic response.
2. **Target and authority requirement**: no mandate, assessment, coalition or formal authorization. Independent from the one-slot strategic decision cost.
3. **Player-known evidence and contested evidence**: source, age, confidence, contradiction and gaps.
4. **Terms and costs**: one coherent committed engagement; feasibility and political conflict warnings.
5. **Knowledge-limited preview**: plausible reactions and risks without hidden actor intent, unseen red lines or exact hidden probabilities.
6. **Immediate authoritative state response**: formal effect, decision journal and memory where applicable.
7. **Delayed implementation and evidence**: task, milestone, report, capacity effect and/or world consequence.
8. **Actor/institutional adaptation**: interest-based, issue-specific change; repetition controls prevent diplomacy farming.
9. **Callback hooks**: later events traceable to specific earlier choices without double-applying the same memory effect.
10. **Doctrine signal and evaluation trace**: no automatic moral label; explanation respects what the player knows.

**Must-pass quality checks:** hidden factors may cause failure **after commitment**, but must not make a seemingly eligible action disappear in advance; contradictory known evidence cannot be hidden from the assessment workspace; mandatory response items cannot exhaust all decisions and soft-lock End Month; simulated outcomes never rewrite raw historical baseline observations. A major action should normally touch at least four of the game's responsiveness layers over time.

# 11. Opening months: content commissioning brief (not Stage 2 scripts)

To make the foundation actionable, Stage 2 should begin with a compact **four-month vertical slice**. This is the target content design, not a forced sequence:

| Month | Learning / strategic aim | Minimum playable content | Flexibility |
|---|---|---|---|
| **1 (Oct 2025)** | Diagnose uncertainty and understand the mandate | Charter, priority brief, one contested issue, two credible first actions, one visible information gap | player may collect, consult or defer; all have costs/benefits |
| **2 (Nov 2025)** | Experience delayed information and actor response | a previously tasked collection result or alternative delayed information mechanism, actor follow-up, confidence change | if player did not collect, still teach delay through state-generated reporting, not forced identical script |
| **3 (Dec 2025)** | Form a strategic judgment and understand the cost of persuasion | structured assessment opportunity, visible contradictory evidence, first case-escalation or diplomacy opportunity | weak-confidence or no-adoption strategy remains valid |
| **4 (Jan 2026)** | Encounter mandate/coalition tradeoffs and path dependence | one contested coalition position, one commitment or condition, one clear short delayed callback | if player avoids mandate formation, alternative strategic opportunity maintains learning |

Doctrine Review becomes available **at start of Month 5** after Month 4 resolution. Codification remains a strategic decision, not automatic selection of a class.

The first two months must, across permitted branches, demonstrate: intelligence gap, delayed information, conflicting sources and consequential institutional reaction. The first four months should not require completing the entire mandate chain.

# 12. Data and epistemic handoff

Stage 1 narrative assumptions cannot supply real measured baseline values. Data compilation must bind narrative locations and conditions to the approved canonical zone registry and validated source windows.

| Input family | Narrative use | Admission restriction |
|---|---|---|
| ACLED event extract | historical source claims and contextualized conflict indicators | existing attached extract has only 80 raw records in five proposed countries, with repeated IDs; needs completeness and row-grain audit before regional assumptions |
| ACLED Conflict Index 2025 | potential context/benchmark | do not infer admin-zone severity from country-level index without validated transformation |
| IDMC displacement | civilian/displacement context | supplied GeoJSON has zero features; no unsupported zone-level allocations |
| GEM power/pipelines | historical infrastructure context and resilience opportunities | historical commissioning/status evidence needed as of anchor; unrouted pipelines are not geographic lines |
| OSM construction/transport | connectivity/context | date, license, geometry and historic status must be checked |
| TeleGeography cables | network dependencies | dated landing/cable status and redistribution terms required |
| AfDB/World Bank/AidData finance | finance/dependency possibilities | finance totals in metadata are not complete source-native event histories; prior commitments need date/status checks |

**Source naming:** In player copy use *observed historical baseline*, *reported/estimated intelligence*, or *fictional simulated development* distinctly. Player eligibility and forecast may only use knowledge-limited projections, not simulation-private facts. Qualitative headlines must not rely on currently unapproved five-indicator formulas.

# 13. Narrative governance and writing requirements

All actor correspondence and scenario copy follow Writing Standards v2. Before bulk content authoring, produce **`VOICE.md`**, **`GLOSSARY.md`** and reusable event/document templates. The speaker is a professional office supporting the envoy; its exact identity and forms of address require approval. Keep evidence and assessment separate, explain unfamiliar institutions in plain language, preserve local orthography, and use a source-supported convention for contested names. Real officials should not receive invented direct quotations. For real geographic/political material, scenario documents carry a simulated label. Events must describe state-confirmed outcomes and player-visible causes; AI may rephrase style only under semantic guardrails, never decide outcomes.

Proposed document genres: Mandate Charter, monthly strategic brief, intelligence report, actor dossier, assessment, coalition instrument, authorization instrument, implementation notice, diplomatic cable, decision journal entry, end-of-mandate review. Every document type needs metadata and a one-line plain-language purpose statement.

# 14. Decisions required before Stage 1 approval

| ID | Decision | Proposed answer / gate | Status / owner |
|---|---|---|---|
| **S1-01** | Public scenario title | “Sahel Arena” as working title | **OPEN — product owner** |
| **S1-02** | Mandate Charter | five priorities P1–P5 in §4 | **OPEN — product owner / scenario lead** |
| **S1-03** | Institutional commissioning premise | limited strategic-envoy appointment, no omnipotent powers | **PROPOSED — institutional review** |
| **S1-04** | Historical political roster | verify all named roles, membership, authority and institutional relationships as of 2025-09-26 | **BLOCKED — historian/region expert** |
| **S1-05** | Canonical administrative zones | choose provider, edition, effective date, level and ID crosswalk | **BLOCKED — GIS/data lead** |
| **S1-06** | Observed baseline completeness | resolve sparse ACLED, nonspatial IDMC, finance provenance and dated infrastructure status | **BLOCKED — data lead** |
| **S1-07** | Primary mandate arc emphasis | A / B / C all viable; select opening emphasis after first content playtest | **OPEN — design lead** |
| **S1-08** | Initial actor knowledge/red-line policies | issue-specific evidence gating and discoverability routes | **STAGE 2 — scenario/balance lead** |
| **S1-09** | In-world voice and nomenclature | approved VOICE, GLOSSARY, forms of address, contested names | **BLOCKED FOR BULK COPY — writing lead** |
| **S1-10** | Leaderboard scoring model | explicit composite, cohort and completion policy after Charter approval | **STAGE 2 — scenario/balance + backend** |
| **S1-11** | Scenario review protocol | competent Sahel and AU-institutional reviewers | **OPEN — product owner** |

Do not treat **S1-04 to S1-06** as reasons to invent starting conditions. Provisional story content may be prototyped with unmistakably synthetic fixture values while source and geometry decisions are pending.

# 15. Stage 1 acceptance criteria

The Stage 1 foundation is approved only when:

1. Narrative premise and Charter priorities are owner-approved and consistent with the non-commanding AU envoy role.
2. All real institutions and proposed procedural roles have been checked for source-backed historical plausibility; unresolved roles are excluded from authoritative content.
3. Five-country scope, historical anchor, start date, 20-turn length and decision economy are unchanged.
4. Actor roster slots are traceable to issue-specific positions, intelligence/reporting, consultation, memory and future callbacks.
5. At least three mandate-opportunity arcs and eight crisis/opportunity families are specified without forced outcomes.
6. The opening four-month content commissioning brief is approved but not mistaken for a fixed script.
7. `VOICE.md` and `GLOSSARY.md` conventions are approved before production copy.
8. Data/geometry dependencies and deliberate unknowns are explicitly recorded; no unsupported numbers are treated as real evidence.
9. Stage 2 can use this document to author a playable Month 1–4 slice without inventing an alternative game economy.

# 16. Immediate Stage 2 deliverables

**Content pack 1: Sahel actor and institution registry.** Historian-reviewed named participants and institutions; issue positions, authority procedures, relationships, red-line discoverability and source records.

**Content pack 2: Opening intelligence package.** Baseline-linked observations, contradictory reports, gaps, collection channels and delayed results; no historical simulation conflation.

**Content pack 3: Four-month decision and mandate matrix.** Decision definitions/terms, eligibility, known costs, effects, actor responses, staged authorization, implementation profile, delayed callbacks and alternate inaction branches.

**Content pack 4: Content tests.** Seeded headless runs, anti-leak checks, decision opportunity-cost metrics, authoring completeness and first-two-month onboarding path coverage.

---

# Appendix A — Source and precedence crosswalk

- **Domain Model v1.1:** product identity; definitions/baseline/truth/knowledge/presentation; source-of-truth; campaign aggregate; rule/effect/command economy; mandate chain; deterministic replay; evaluation; source provenance.
- **Game Design v2.1:** five-act 20-month campaign; three decisions; structured assessment; issue-specific diplomacy; mandate/authorization/implementation; delayed callbacks; Month 5 doctrine review; endorsed player identity and rolling save; verified leaderboard; knowledge-limited previews.
- **Technical Architecture v2:** modular packages, compiled immutable artifact registry, source-to-zone IDs, server-side upgrade needed for verified leaderboard, application-layer orchestration and save continuity.
- **Data & Methodology v1.1:** approved anchor/start/five countries/administrative-boundary policy; 2025–26 temporal exceptions; sparse ACLED and empty IDMC spatial artifact; unapproved indicator coefficients; compilation gates.
- **Writing Standards v2:** real/simulated label, provenance-sensitive language, restrained institutional voice, no fabricated quotes from real individuals, glossary and actor naming protocols.
- **Design Brief reconciled / Components reconciled:** restrained strategic map and document surfaces; draft tray distinct from irreversible committed decision history.

# Appendix B — Stage 1 editorial guardrails

- **No fabricated history:** fictional October 2025+ developments are shown as fictional simulated events, not as history.
- **No invented actual agreement:** proposed coalition instruments exist only if game rules authorize and the player takes appropriate actions.
- **No hidden spoilers:** player dossiers and previews cannot quote unlearned red lines or motives.
- **No homogeneous populations:** civilian concerns must be localized to an evidenced or explicitly modeled subject, not a monolithic country preference.
- **No predetermined success:** positive/negative outcomes follow the simulation and may differ by seed and player decision.
- **No actor caricature:** motives are scenario-defined hypotheses, not moral labels; source contradictions may be honest institutional disagreements.
- **No simulation as forecast:** scores/trajectories refer to this model's fictional future, not a prediction.

**End of Stage 1 proposed specification.**
