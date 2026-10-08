# GLOSSARY.md — African Mandate
## Initial Stage 2 controlled terminology and actor naming v0.1

**Status:** Initial controlled vocabulary, with [H] historical/source-based institutional terms and [D] fictional scenario terms. Before public release, protocol forms, contested terms and all specialist meanings receive historical/legal and Sahel regional review. **Read alongside:** `VOICE.md`, actor registry, Writing Standard v2.

## 1. Core gameplay terms

| Canonical term | Plain gloss to show at first use | Internal concept / computation | Avoid or prohibited substitute |
|---|---|---|---|
| AU Strategic Envoy | The fictional African Union representative whose decisions you make | `EnvoyState` | commander, president of the Sahel, omnipotent leader |
| Envoy's Office | The fictional team that prepares evidence and coordinates the mandate | `institution_envoy_office` | real AU office unless documented |
| Mandate Charter | Your office's assigned goals, boundaries and review criteria | scenario Charter content | victory conditions |
| Strategic decision | One consequential institutional action; normally one of three monthly slots | command `decisionSlotCost=1` | action point, click |
| End month | Resolve background changes and advance the calendar | `EndTurn` | skip consequences |
| Evidence | A source-attributed claim available to your office | `EvidenceRecord` | truth, omniscient fact |
| Observation | A recorded or modeled signal that may or may not become available | observed baseline / observation candidate | guaranteed ground truth |
| Observed baseline | Historical source observations pinned to a cutoff and provenance | immutable `BaselinePackage` | current simulated world |
| Simulation truth | The model's fictional authoritative hidden state | `CampaignState.world` | real-world fact |
| Intelligence report | A set of source-linked evidence claims | `IntelligenceReport` | definitive answer |
| Intelligence gap | A consequential question your office cannot yet answer | `IntelligenceGap` | zero, absent event |
| Collection task | A delayed request to obtain additional reporting | `CollectionTask` | reveal truth action |
| Assessment | Your office's structured conclusion, including confidence and evidence | `AssessmentState` | confirmed fact |
| Declared confidence | Confidence chosen by the envoy for an adopted assessment | `AssessmentState.declaredConfidence` | objective evidence confidence |
| Contradictory evidence | Already-known claims that materially conflict with an assessment | contradiction key/model | dismissible trivia |
| Stale reporting | Evidence old enough that present conditions may differ | confidence decay | invalid evidence by default |
| Mandate case | A formal proposal to gain support and authorization | `MandateCaseState` | already approved mission |
| Coalition | Actors supporting a specific case, not permanent allies | `CoalitionState` / `PositionState` | friendship score |
| Host consent | Applicable permission from a government for a defined activity | authorization requirement where legally configured | AU membership means consent |
| Authorization | Formal approval through the applicable institutional procedure | `AuthorizationState` | institutional authority global meter |
| Institutional authority | The envoy's general political room to initiate processes | `EnvoyState.institutionalCapacity.mandateAuthority` | case authorization |
| Implementation | Work and resources used to carry out an authorized mandate | `ImplementationState` | instant result |
| Scope distortion | A gap between original objective and authorized/delivered scope | `MandateOutcome.integrity` | failure by itself |
| Commitment | A recorded promise with an issuer, beneficiary, terms and status | `CommitmentRecord` | flavor choice |
| Red line | A condition an actor may react strongly to if crossed | `RedLineState` | automatically known taboo |
| Actor memory | Persistent trace of a consequential prior decision | `MemoryRecord` | reapply bonus each turn |
| Issue position | An actor's stance on one assessment, action or case | `PositionState` | general relationship |
| Relationship | Directional trust, alignment, access, dependence, leverage, credibility | `RelationshipState` | simple ally/enemy flag |
| Scenario development | A fictional event after simulation starts | `WorldEventInstance` | historical incident |
| Decision journal | Auditable record of choices and immediate outcomes | `DecisionRecord` | editable commitment queue |
| Resolution ledger | Player-visible account of changes after month end | knowledge-limited projection | engine debug trace |
| End-of-Mandate Review | Multidimensional account of 20-month outcomes | `FinalEvaluation` | correct-answer screen |
| Verified leaderboard | Ranking accepted only after trusted deterministic replay | server verification addendum | browser-supplied final score |

## 2. Confidence lexicon

| Canonical | Player copy | Meaning |
|---|---|---|
| known | Known | player office has a supported claim; exactness depends on evidence |
| confirmed | Confirmed | unusually well supported; never applied to hidden truth just because engine knows it |
| estimated | Estimated | inferential statement; cite evidence basis and uncertainty |
| unknown | Not known | no adequate available evidence; not zero |
| stale | Last confirmed [date]; may have changed | observation is old in relation to issue |
| contested | Contested | mutually incompatible known claims |
| unverified | Unverified | reported, not sufficiently supported |
| declared confidence: low | Low | chosen institutional assessment confidence |
| declared confidence: moderate | Moderate | chosen institutional assessment confidence |
| declared confidence: high | High | chosen institutional assessment confidence |

## 3. Institutions and regionally specific terms

| Full name | Short name | What it is in the scenario | Canonical ID | Status |
|---|---|---|---|---|
| African Union | AU | Continental member-state organization (actual participation may be suspended) | none (umbrella) | [H] |
| African Union Commission | AU Commission | AU secretariat | `institution_au_commission` | [H] |
| African Union Peace and Security Council | PSC | AU organ with collective peace/security powers | `institution_au_psc` | [H] |
| Office of the AU Strategic Envoy | Envoy's Office | Fictional campaign team delegated a bounded task | `institution_envoy_office` | [D] |
| Government of Mali | Malian government | Host government institutional aggregate, not the individual head of state | `institution_government_mali` | [H] institution, [D] game composition |
| Government of Burkina Faso | Burkinabè government | Same | `institution_government_burkina_faso` | same |
| Government of Niger | Nigerien government | Same; not Nigerian | `institution_government_niger` | same |
| Government of Chad | Chadian government | Same | `institution_government_chad` | same |
| Government of Mauritania | Mauritanian government | Same | `institution_government_mauritania` | same |
| Confederation of Sahel States / Alliance of Sahel States | AES | Confederation of Mali, Burkina Faso, Niger; exact legal English rendering to pin | `institution_aes` | [H] existence; terminology review |
| Economic Community of West African States | ECOWAS | Regional organization; former membership of Mali/Burkina Faso/Niger effective Jan 2025 | `institution_ecowas` | [H] |
| G5 Sahel | G5 Sahel | Former regional mechanism; historical context, not automatically an active five-state authority | no active authority ID | [H] historical |
| United Nations Office for the Coordination of Humanitarian Affairs | OCHA | Humanitarian coordination office | `institution_un_ocha` | [H] general remit |
| African Development Bank Group | AfDB | Development finance organization | `institution_afdb` | [H] |
| United Nations High Commissioner for Refugees | UNHCR | Protection and assistance for refugees and related populations | `institution_unhcr` | [H] |
| International Organization for Migration | IOM | Migration/displacement data and operations | `institution_iom` | [H] |
| Economic Community of Central African States | ECCAS | Regional body with relevance to Chad; procedures subject to review | `institution_eccas` | [H] existence |
| Sahel Civilian Access Network | Civilian Access Network | Fictional composite of local reporting partners | `institution_local_civic_network` | [D] |
| Corridor Service Operators Forum | Operators Forum | Fictional stakeholder interface | `institution_logistics_consortium` | [D] |

## 4. Actor role names and controlled forms of address

All persons below are **fictional functional characters**, not identified historical officeholders. Their *real world* forms of address are **NOT YET SOURCED**; use the role name in a `To:` field rather than a guessed honorific.

| Actor ID | Player-facing name | Correspondence address | Real or fictional |
|---|---|---|---|
| `actor_envoy_chief_of_staff` | Chief of Staff | Office of the AU Strategic Envoy | fictional |
| `actor_envoy_intelligence_lead` | Intelligence Adviser | Office of the AU Strategic Envoy | fictional |
| `actor_envoy_legal_adviser` | Legal and Mandate Adviser | Office of the AU Strategic Envoy | fictional |
| `actor_au_commission_liaison` | AU Commission Liaison | AU Commission | fictional role |
| `actor_psc_secretariat_contact` | PSC Secretariat Contact | PSC Secretariat | fictional role |
| `actor_mali_focal_point` | Mali Government Focal Point | Government of Mali | fictional role |
| `actor_burkina_faso_focal_point` | Burkina Faso Government Focal Point | Government of Burkina Faso | fictional role |
| `actor_niger_focal_point` | Niger Government Focal Point | Government of Niger | fictional role |
| `actor_chad_focal_point` | Chad Government Focal Point | Government of Chad | fictional role |
| `actor_mauritania_focal_point` | Mauritania Government Focal Point | Government of Mauritania | fictional role |
| `actor_aes_liaison` | AES Liaison | AES | fictional role |
| `actor_ecowas_liaison` | ECOWAS Liaison | ECOWAS | fictional role |
| `actor_ocha_coordinator` | Humanitarian Coordination Contact | OCHA | fictional role |
| `actor_afdb_programme_officer` | Development Finance Contact | AfDB | fictional role |
| `actor_civic_reporting_coordinator` | Civilian Reporting Coordinator | Civilian Access Network | fictional |
| `actor_corridor_operator_contact` | Corridor Operations Contact | Operators Forum | fictional |

## 5. Geography and orthography

| Name | Adjectival form | Notes |
|---|---|---|
| Mali | Malian | country, not a single actor |
| Burkina Faso | Burkinabè | include proper accent in adjectives |
| Niger | Nigerien | avoid confusion with Nigerian |
| Chad | Chadian | country, not same as Lake Chad basin |
| Mauritania | Mauritanian | country, not Maghreb-wide actor |
| Mopti | Mopti | indicative locality/administrative geography; not approved zone ID |
| Tillabéri | Tillabéri | correct accent; not an actor |
| Sahel | Sahelian (only where accurate) | not a homogeneous ethnicity, state or administration |

A future `GEOGRAPHY_GLOSSARY.md` or dedicated zone registry must hold source-verified administrative polygons, names, transliterations, aliases, contested-boundary rules, provenance and dates. All player-facing search accepts sensible unmarked text but displays canonical spellings. Use NFC and correct glyph sets (ƙ, ɓ, ɗ, ŋ, ɛ, ɔ, ɲ, ẹ, ọ).

## 6. Five headline indicators versus evaluation dimensions

**Headline candidates** (not yet approved formulas): stability; insurgency; civilian support; global legitimacy; regional synergy. These must only be **derived, knowledge-limited descriptions** with provenance and temporal qualification—never independent mutable hidden or exact omniscient counters. If a model is unable to support a player-visible estimate, display `Not known`, not invented 0–100.

| Indicator | A rise may mean | Safe player language | Possible disclosed inputs (only if available and method approved) |
|---|---|---|---|
| Stability | better, if definition holds | `Estimated regional stability increased` | observed conditions and confidence; no hidden state |
| Insurgency | worse, if pressure definition holds | `Reported insurgent activity increased` | verified event measures with period and coverage |
| Civilian support | context-dependent, not automatically known | `Civilian confidence is not reliably estimated` | verified survey/proxy evidence, never group generalization |
| Global legitimacy | depends on which institution and criterion | `External institutional confidence appears stable` | supported actor/institution positions; no global truth |
| Regional synergy | depends on operational definition | `Institutional coordination improved in the reported case` | observed joint action/fulfillment evidence |

**Six end evaluation dimensions** are separate: security; civilian outcomes; regional stability; institutional cohesion; legitimacy; mandate sustainability. Any bridge from five indicators to six evaluation dimensions must be defined in the method/balance layer; do not equate or sum them automatically.

## 7. Legal and publication-sensitive terms

- **Member:** institutionally part of an organization.
- **Suspended from participation:** member whose participation in some/all activity is restricted by a dated decision; not synonym for expulsion.
- **Withdrawn:** no longer a member as of documented date; not synonym for suspended.
- **Technical cooperation:** exchange/action possible under applicable arrangements; not proof of membership or political support.
- **Consent:** authorized permission for a defined activity; not inferred from historical affiliation.
- **Approved / authorized:** reserved for actions actually decided by eligible organs within the simulation's vetted rules.
- **Proposed / requested / pending:** no favorable outcome assumed.
- **Observed baseline:** anchored evidence, not a forecast.
- **Simulated:** an invented game event, role, report, quotation or outcome.

## 8. Sources and maintained references

The source register with direct URLs and date scope is in `AFRICAN_MANDATE_SAHEL_ACTOR_INSTITUTION_REGISTRY_v0_1.md` §12. All source claims must be checked against those records; glossary definitions must not be treated as independent legal authority. Full protocol forms, country-specific organizations and group self-designations are **research backlog**, not settled copy.
