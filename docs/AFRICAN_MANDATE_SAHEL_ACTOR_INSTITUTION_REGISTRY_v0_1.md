# African Mandate — Sahel Scenario Specification v1
## Stage 2, Package 1: Actor & Institution Registry

**Status:** v0.1 research-grounded authoring draft; Stage 1 narrative foundation owner-approved on 2026-10-08. Not a compiled `ScenarioBundle`, not balanced, not a legal finding.  
**Historical as-of:** 2025-09-26. **Simulation opens:** 2025-10-01. **Countries:** Mali, Burkina Faso, Niger, Chad, Mauritania.  
**Canonical precedence:** Domain Model v1.1 → Technical Architecture v2 → Data & Methodology v1.1 → Game Design v2.1 → approved Stage 1 → this document.  
**Tags:** `[H]` sourced historical institutional fact; `[D]` invented scenario design; `[P]` provisional until vetted; `[X]` blocked for authoritative implementation.

## 1. Key distinction: evidence versus fiction

The registry separates historic institutional **authority and membership** from fictional game-specific **preferences, capacities, issue positions and red lines**. Real institutions are represented by institutional office or body, not invented statements attributed to named living officials. The playable player office is a **fictional AU Strategic Envoy appointment**, not a claim that such a five-country mandate was actually issued. A scenario appointment does not override AU PSC powers, state consent, existing suspensions or rights of international organizations.

Do not hardcode ally/enemy alignments. All stance values below are *scenario design hypotheses* requiring scenario approval and test balance. No actor's hidden thoughts or claims are historical observations.

## 2. Historical institutional corrections, as of the 2025 anchor

| Rule | Historical basis | Mandatory game consequence |
|---|---|---|
| Mali, Burkina Faso, Niger are not ECOWAS members from 2025-01-29 | ECOWAS notice [S1] | ECOWAS cannot be coded as their member institution or automatic authorization authority; cross-organizational liaison and transitional arrangements remain possible |
| Alliance/Confederation of Sahel States (AES) groups Mali, Burkina Faso and Niger | July 2024 confederation announcement [S2] | AES represented separately from states; exact treaty-specific competencies/ratification implementation require legal review |
| AU PSC is the AU's peace-and-security decision organ, with specified powers including authorization of peace support operations | AU PSC [S3] | A fictional envoy or AU Commission cannot personally grant powers reserved to the PSC/other competent organs |
| Mali, Burkina Faso, and Niger had AU participation suspensions imposed in 2021, 2022 and 2023 | PSC decisions [S4–S6] | Membership != participation. Initialize suspension-status fields only after checking any later lifting before 2025-09-26; no unconditional voting/participation assumption |
| G5 Sahel cannot be treated as an operational five-country authorization platform | Mauritania–Chad statement on withdrawals and winding-up measures [S7] | Historical context only; no current universal five-state governance slot without independently verified successor mechanism |
| AfDB has development-finance priorities but finance isn't automatically granted to an envoy | AfDB strategy and operational priorities [S8] | Treat finance as eligibility/negotiation/implementation dependent; proposals do not equal disbursement |

**As-of audit rule:** An older suspension communiqué documents that a suspension was imposed, not necessarily that it remained in effect unchanged on 2025-09-26. Before shipping, pin an AU status source dated near the anchor and record per-state `participationStatusAsOf` with provenance. Where current status cannot be validated, mark `unverified`, not `active` or `suspended` by inference. Likewise, the AES treaty's exact powers are not inferred merely from the fact of its formation.

## 3. Typed registry conventions

**Canonical institutions** describe authority domains, office names and procedure IDs. **Actors** are functional interlocutor roles or fictional named staff attached to institutions, with their own priorities and memory. We use stable IDs that will not change when display names are revised. `institutionId` on actors links to institutional parent. Relationship records are *directional*; issue position records are per assessment/mandate/action, not global friendship. Actor private intent lives only in hidden `ActorRuntimeState`. Player-facing dossiers use `PlayerKnowledgeState` and supporting evidence.

**Authoring statuses:** `core` = include in first four months; `extended` = may appear when events require; `context` = no direct decision authority in slice; `blocked` = not legal to deploy until further review. These are development statuses, not political judgments.

## 4. Core institutional registry

| Institution ID | Name / short form | Role and authority domains | Stage 2 status | Confidence and limits |
|---|---|---|---|---|
| `institution_au_commission` | African Union Commission / AU Commission | AU secretariat; coordination, proposals, reporting, implementation administration | core | [H] Secretariat role [S9]; cannot substitute for PSC authorization |
| `institution_au_psc` | African Union Peace and Security Council / PSC | AU collective security, peace/security mandate authorization where appropriate | core | [H] Authority conditioned by AU legal instruments [S3] |
| `institution_envoy_office` | Office of the AU Strategic Envoy / Envoy's Office | [D] fictional delegated liaison, evidence review, coalition-building and mandate facilitation | core | Not an independently real AU organ; fictional authority limited by Charter |
| `institution_government_mali` | Government of Mali / Malian government | National consent, access, relevant administrative and diplomatic decisions | core | [H] sovereign governmental category; exact office competences require legal review |
| `institution_government_burkina_faso` | Government of Burkina Faso / Burkinabè government | Same national authority within Burkina Faso | core | Same |
| `institution_government_niger` | Government of Niger / Nigerien government | Same national authority within Niger | core | Same |
| `institution_government_chad` | Government of Chad / Chadian government | Same within Chad | core | Same |
| `institution_government_mauritania` | Government of Mauritania / Mauritanian government | Same within Mauritania | core | Same |
| `institution_aes` | Confederation of Sahel States / AES | Regional coordination between Mali, Burkina Faso and Niger | core | [H] existence [S2]; exact 2025 competence and standing not assumed |
| `institution_ecowas` | Economic Community of West African States / ECOWAS | Regional trade/diplomatic coordination and existing institutional instruments | core, external liaison | [H] former membership of three states [S1]; cannot vote for ex-members |
| `institution_un_ocha` | United Nations Office for the Coordination of Humanitarian Affairs / OCHA | Humanitarian coordination and information; no autonomous mandate authorization for AU | core | Source/data access and country presence must be verified for scenario |
| `institution_afdb` | African Development Bank Group / AfDB | Development financing, technical capacity, project due diligence | core | [H] finance mandate [S8]; hypothetical project approvals are fictional |
| `institution_unhcr` | United Nations High Commissioner for Refugees / UNHCR | Refugee protection, displacement-related evidence and delivery cooperation | extended | Do not equate refugees with internally displaced persons |
| `institution_iom` | International Organization for Migration / IOM | Mobility and displacement-related operational information | extended | Institutional presence and operational information need source review |
| `institution_eccas` | Economic Community of Central African States / ECCAS | Regional context for Chad and cross-border coordination | extended | Membership/2025 procedures to validate separately |
| `institution_eu` | European Union / EU | External diplomatic and funding counterpart | extended | Individual program mandates, country relations and sanctions must be source-checked |
| `institution_china_cooperation` | Chinese governmental/development-finance counterpart / China cooperation channel | External finance/diplomatic counterpart | extended | No single invented unitary preference; specific agencies later |
| `institution_russia_cooperation` | Russian governmental cooperation counterpart / Russia cooperation channel | External diplomatic/security/economic counterpart | extended | No unverified real deployment or agreement assigned |
| `institution_local_civic_network` | Sahel Civilian Access Network / Civilian Access Network | [D] fictional composite of local humanitarian/community reporting partners | core | Fictional name; not representative of every community; avoid falsely implying real endorsement |
| `institution_logistics_consortium` | Corridor Service Operators Forum / Operators Forum | [D] fictional aggregation of infrastructure and transport stakeholders | extended | Not a real pre-existing body; operational assets must be verified |

**Institutional freeze gate:** PSC/Commission competence, AES instruments, ECOWAS transitional relations, and sovereign host-approval rules receive legal/regional review before `authorizationProcedures` can be compiled. NGO/humanitarian access is not presumed universally available. Never infer institutional stance from geography alone.

## 5. Playable actor-role registry (functional posts; no fabricated named officials)

| Actor ID | Institutional parent | Role / canonical label | Decision contribution | Initial player visibility |
|---|---|---|---|---|
| `actor_envoy_chief_of_staff` | `institution_envoy_office` | Chief of Staff | Player brief, capacity warning, commitment deadlines | known role; no hidden private intent needed |
| `actor_envoy_intelligence_lead` | `institution_envoy_office` | Intelligence Adviser | Evidence relevance, source disputes, collection requests | known analytical remit; no infallibility |
| `actor_envoy_legal_adviser` | `institution_envoy_office` | Legal and Mandate Adviser | Maps proposed actions to actual procedures and known restrictions | known rules only; unknown responses remain uncertain |
| `actor_au_commission_liaison` | `institution_au_commission` | AU Commission Liaison | Administrative support, PSC preparation, capacity | formal affiliation known; position on case [D] estimated |
| `actor_psc_secretariat_contact` | `institution_au_psc` | PSC Secretariat Contact | Procedural briefings and institutional submission | procedure known; PSC vote/outcome not pre-known |
| `actor_mali_focal_point` | `institution_government_mali` | Mali Government Focal Point | Access/host terms, information channels | office affiliation known; mandate stance unverified |
| `actor_burkina_faso_focal_point` | `institution_government_burkina_faso` | Burkina Faso Government Focal Point | Same for Burkina Faso | same |
| `actor_niger_focal_point` | `institution_government_niger` | Niger Government Focal Point | Same for Niger | same |
| `actor_chad_focal_point` | `institution_government_chad` | Chad Government Focal Point | Same for Chad | same |
| `actor_mauritania_focal_point` | `institution_government_mauritania` | Mauritania Government Focal Point | Same for Mauritania | same |
| `actor_aes_liaison` | `institution_aes` | AES Liaison | Cross-member consultation, potential coordination | known organization; agreement authority requires review |
| `actor_ecowas_liaison` | `institution_ecowas` | ECOWAS Liaison | Cross-institution dialogue, transit/trade continuity | no invented voting role for former members |
| `actor_ocha_coordinator` | `institution_un_ocha` | Humanitarian Coordination Contact | Needs assessments, access constraints, report quality | source identity known; field truth limited |
| `actor_afdb_programme_officer` | `institution_afdb` | Development Finance Contact | Finance conditions, appraisal timelines | no guaranteed commitment |
| `actor_civic_reporting_coordinator` | `institution_local_civic_network` | Civilian Reporting Coordinator | [D] fictional community evidence and competing local perspectives | reporting bias and coverage visible as appropriate |
| `actor_corridor_operator_contact` | `institution_logistics_consortium` | Corridor Operations Contact | [D] operational dependencies, project bottlenecks | extended, not assumed baseline asset fact |

All generic posts represent **fictional role-level interlocutors**, not claims of a particular person or office occupant. Attach specific proper names only for wholly fictional characters after cultural/linguistic review; use no invented quotes from real named officials.

## 6. Proposed issue-position and relationship design (NOT historical facts)

Define first-slice issues as stable strings before linking to actual mandate case IDs:

- `issue_monitoring_access`: independent versus partner-restricted reporting
- `issue_civilian_access`: humanitarian coordination/access terms
- `issue_corridor_resilience`: service and transit corridor assistance
- `issue_interinstitutional_scope`: AU-centered versus distributed regional process

Every `PositionState` is issue-specific, sourced as hidden simulation truth, with a separate `PositionKnowledgeState` for estimates. **Do not initialize all members of AES with identical positions.** Example *testing configurations only*:

| Actor | Issue | Hidden fictional design possibility | Player-known start |
|---|---|---|---|
| Mali focal point | `issue_monitoring_access` | conditional support if national reporting role preserved | unknown; one potential discoverable signal |
| Burkina Faso focal point | `issue_civilian_access` | conditional support based on operational access terms | estimated only if authored evidence exists |
| Niger focal point | `issue_corridor_resilience` | partner-finance concern | unknown |
| Chad focal point | `issue_civilian_access` | priorities constrained by capacity | unknown |
| Mauritania focal point | `issue_interinstitutional_scope` | favor pragmatic bridging | unknown |
| AES liaison | `issue_interinstitutional_scope` | sensitive to institutional standing | unknown |
| ECOWAS liaison | `issue_corridor_resilience` | support technical transit coordination subject to mandates | uncertain, not historical claim |
| Civilian reporting coordinator | `issue_monitoring_access` | favors independent corroboration | known only after consultation |

**No fabricated default trust numbers:** per-edge trust/alignment/access/leverage/credibility remain `TBD_BALANCE`, never instantiated as 50 merely to fill a schema. The opening role graph is authorable but **not executable** until a versioned balance profile and evidence-aware knowledge initialization are approved.

## 7. Red lines, commitments, memory, and diplomacy design

**Red-line design candidates** (fictional): national consent for field activity, source confidentiality, inclusion/exclusion of reporting channels, unacceptable scope creep, exclusive resource allocation, disclosure of sensitive civilian informants. Each red line must have `{owner, triggerRule, severity, consequenceProfileId, status}`; at least one **discoverable signal** before a severe reaction. Red lines remain hidden unless independently discovered through evidence.

**Commitment templates:** `provide_staff_by_turn`, `allow_field_access`, `submit_reporting_by_turn`, `fund_capacity_component`, `include_oversight_partner`. Terms require legal target validation, amount bounds, recipient, deliverable, due turn, detectable completion and breach effects. These are *possible game agreements*, not historical agreements.

**Memory callbacks:** consulted before authorization; excluded from coalition; promised access fulfilled/breached; report dismissed and later corroborated; high-pressure diplomacy versus sustained consultation. Immediate relationship effects occur **once**, never again during end-turn adaptation. Repeated diplomacy requires changed terms, new evidence, cooldown or increasing fatigue; do not allow support farming.

**Reporting profiles:** government, partner humanitarian, civil-society and technical reporting channels have distinct **authored plausible** delays, coverage, incentives and reliability. They must not be assigned blanket trustworthy/untrustworthy status solely by institutional label. Bias = source-specific incentive under scenario conditions, not moral ranking. Source confidence remains evidence-specific, decays over time, and may be contested.

## 8. Authorization and access procedure matrix (design scaffolding)

| Action | Could the envoy initiate? | Who must authorize or consent? | Gate |
|---|---|---|---|
| Request internal analysis / partner information | [D] Within delegated office scope, yes | Collection-access constraints, information-sharing permissions | Check scenario charter |
| Conduct diplomatic consultations | [D] Usually yes | Relevant counterpart cooperation | No automatic agreement |
| Draft/propose regional monitoring arrangement | [D] Yes as proposal | Scope-dependent AU procedures; host consent where needed | PSC/host legal review |
| Deploy an AU peace support mission | Not unilaterally | PSC/other applicable legal conditions [S3] | **X: exclude from first slice until reviewed** |
| Open a civilian-access coordination case | [D] yes as proposal | Host/implementer approval and actual operational access | Verify country / humanitarian rules |
| Request development financing | [D] propose/consult | AfDB or other financier's own assessment/approval process | No budget generated by envoy action |
| Claim ECOWAS member-state authorization for Mali/Burkina Faso/Niger | **No** | Not applicable after withdrawal [S1] | **X: prohibited** |
| Claim G5 Sahel five-state authorization | **No** | Not operationally grounded [S7] | **X: prohibited** |

## 9. First-four-month actor coverage and authored content obligations

**Month 1:** AU office/Commission + 2 nationally relevant contacts + one non-government evidence channel; at least one contested source and one known intelligence gap. **Month 2:** one delayed collection result and a meaningful institutional reaction, whether collection, consultation, or inaction occurred. **Months 3–4:** introduce AES/ECOWAS institutional distinction and a realistic mandate-case opening path where player assessment supports it. Content does not mandate all five host negotiations in Month 1.

For each **core** actor create: `ActorDefinition`, `ActorRuntimeInitialization`, `PlayerKnowledgeInitialization`, `ReportingProfile`, 2 issue-position possibilities, 2 consultation term packages, 1 discoverable concern, 1 positive and 1 negative memory/callback, 1 non-response branch, at least 1 evidence source or explicitly `none`, and a provenance record. Author 2–4 serious candidate decisions per turn plus existing commitments; 3 strategic slots are fixed.

## 10. Package 1 handoff schema and validation checks

```yaml
institution:
  institutionId: institution_government_mali
  institutionType: government
  authorityDomains: [diplomacy, humanitarian, monitoring]
  actorIds: [actor_mali_focal_point]
  authorizationProcedureIds: [] # none added without legal review
actor:
  actorId: actor_mali_focal_point
  institutionId: institution_government_mali
  actorType: diplomatic
  priorityWeights: {} # BLOCKED: scenario tuning required
  riskTolerance: null # BLOCKED: schema Score required before compile
  memoryProfileId: memo_mali_focal_point
  initialRedLineDefinitionIds: []
# This YAML is deliberately a non-compilable authoring sketch, not a fake valid bundle.
```

**Acceptance before compile:** IDs unique; parent references valid; no duplicate writable truth; issue positions not substituted for relationships; hidden intent absent from player projections; source links valid; 2025 membership/access status reviewed; mandatory response slots cannot softlock; all numeric profiles versioned and tuned; NPC cannot give away unknown red lines through eligibility; no invented direct quotations from real persons.

## 11. Research and approval backlog

| ID | Work | Owner role | Blocking level |
|---|---|---|---|
| R-01 | Verify AU participation status for Mali, Burkina Faso, Niger *as of Sep 26, 2025* and interaction rules | AU legal/institutional researcher | Hard gate for formal procedure claims |
| R-02 | Verify AES treaty competencies, ratification and operational procedures as of anchor | regional-institutions researcher | Hard gate for AES authorizations |
| R-03 | Identify actual country ministry/office counterparts and 2025 office-holder changes without fictional quotes | country researchers | Hard gate for historical naming; functional posts usable now |
| R-04 | Verify ECCAS, ECOWAS, UN/OCHA, AfDB 2025 access mechanisms and humanitarian procedural limits | subject-matter researcher | Before specific real arrangements |
| R-05 | Validate fictional actor names, protocols, orthography and sensitive community framing | Sahel language/regional reviewer | Before player-facing production copy |
| R-06 | Approve functional actor roster (core vs extended), historical-fact/fictitious-case matrix | scenario lead | Before bundle compilation |
| R-07 | Establish authoring balance profile: actor capabilities, relationships, private intent, issue positions, reporting qualities | systems designer | Before bundle compilation |
| R-08 | Link approved administrative zone IDs, verified baseline, and geo scopes | data/geo engineer | Before map-coupled scenario |
| R-09 | Review authority rules for AU PSC, Commission, five governments; no invented supranational legal power | institutional counsel | Before authorization feature |

## 12. Source register (URLs and historical chronology)

- **[S1] ECOWAS**, withdrawal effective 29 January 2025: https://www.ecowas.int/Burkina-faso-Mali-and-nigers-withdrawal-from-ECOWAS-is-now-a-reality/
- **[S2] Presidency of Burkina Faso**, AES confederation treaty announced July 2024: https://www.presidencedufaso.bf/consolidation-de-laes-les-chefs-detat-adoptent-le-traite-portant-creation-de-la-confederation/
- **[S3] African Union**, Peace & Security Council remit: https://au.int/en/psc
- **[S4] AU PSC**, Mali suspension 1 June 2021: https://retrievedfromwww.peaceau.org/en/article/communique-of-1001st-meeting-of-the-african-union-peace-and-security-council-on-the-situation-in-mali-1st-of-june-2021
- **[S5] AU PSC**, Burkina Faso suspension January 2022: https://www.peaceau.org/en/article/communique-of-the-1062nd-meeting-of-the-psc-held-on-31-january-2022-on-the-situation-in-burkina-faso
- **[S6] AU PSC**, Niger suspension August 2023: https://www.peaceau.org/en/article/communique-of-the-1168th-meeting-of-the-psc-held-on-14-august-2023-on-updated-briefing-on-the-situation-in-niger
- **[S7] Mauritanian News Agency**, Mauritania–Chad G5 Sahel statement Dec 2023: https://ami.mr/en/archives/12844
- **[S8] African Development Bank**, operational priorities May 2025: https://www.afdb.org/en/about/mission-and-strategy/operational-priorities
- **[S9] AU Commission** overview: https://aucapps.au.int/en/commission

**Source-validation policy:** these sources substantiate limited historical propositions only. Later webpage updates must not silently rewrite 2025 facts. Country/agency roles, internal incentives and specific procedural permissions need additional dated sources. Never use a post-October-2025 event as initial player knowledge.
