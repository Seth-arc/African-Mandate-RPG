# VOICE.md — African Mandate
## Stage 2 editorial voice system v0.1

**Status:** Initial authored standard, subordinate to `WRITING_STANDARDS (1).md` v2 and the approved Stage 1 narrative foundation. Content conventions proposed for approval; no production copy passed regional/player testing. **Temporal setting:** begins 2025-10-01. **Historical observations cutoff:** 2025-09-26. **Language:** English v1; preserve original proper-noun orthography and credible French terminology in source quotes/metadata.

## 1. Speaker and perspective

**Primary speaker:** the **Office of the AU Strategic Envoy**—a *fictional campaign office* responsible for synthesizing evidence, drafting advice, documenting decisions and tracking commitments. It is not the real African Union speaking, and the office has no claimed historical appointment. In-world documents carry **SIMULATED** visibly in their header. Technical errors are never dressed as diplomatic developments.

**Reader:** an adult strategy player, addressed as **you** in actionable explanatory copy; formal instruments may use **the Envoy** where a title is required. No assumed knowledge of AU procedures or Sahel politics; familiar with a strategy-game turn and map. Explain every specialist concept once through the glossary. Avoid writing as if the player personally controls sovereign governments.

**Three voice qualities:**

- **Measured:** facts first; no exclamation points, triumphalism or theatrical descriptions of suffering.
- **Precise:** source, date, jurisdiction and uncertainty stated; measured quantities always have units and basis.
- **Institutional but plain:** clear verbs in controls; document protocol only where reliably sourced; a one-sentence plain summary precedes formal body.
- **Accountable:** consequences acknowledge prior player actions and distinguish observed outcomes from hypotheses or contested evidence.

**Never say:** `win`, `level up`, `unlock`, `mission accomplished`, `crush`, `the region wants`, `observers say`, `intel says` without source, `100% chance` without justified information, `failed state`, `warlord` as default type, `the African people`, `game over`, `powerful/seamless/effortless`, theatrical `classified` decorations, or claims that the game represents actual AU policy.

## 2. Naming and institutional conventions

- Full first mention: **African Union (AU)**; then **AU**. **African Union Commission (AU Commission)**; **Peace and Security Council (PSC)**; **Economic Community of West African States (ECOWAS)**; **Confederation of Sahel States / Alliance of Sahel States (AES)** where context is clear and historical full title verified; refer to the exact treaty/legal form in research records.
- Player-facing role: **AU Strategic Envoy**. Office: **Office of the AU Strategic Envoy**; shortened **Envoy's Office**. Do not alternate with Special Envoy unless citing a source using that precise title. The original Stage 1 refers to a fictional appointment: always identify it as simulated.
- Countries: **Mali; Burkina Faso; Niger; Chad; Mauritania**. Derived adjectival forms **Malian; Burkinabè; Nigerien; Chadian; Mauritanian**. `Nigerien` is not `Nigerian`.
- Use official English/locally sourced spelling for real place names. Keep correct hooked and marked letters and apostrophes; store in Unicode NFC. Search may allow unaccented equivalents, display never silently strips marks.
- Sensitive community names: use the person's/community's documented self-designation when known; if multiple terms exist, name the source of the designation rather than hard-coding one universal label. Do not infer ethnic identity from location or armed-actor name.
- Contested boundaries/status: show the boundary source edition and **source-based neutral label**; disputed-status wording must be signed off by regional reviewer and must not imply the game decides sovereignty. The five-country scenario does not justify redesignating sovereignty.
- Institution and actor are not interchangeable: `Government of Mali` is institution; `Mali Government Focal Point` is fictional *role actor*; the person holding a real office should not be invented.

## 3. Forms of address and correspondence (safe starter contract)

No fabricated protocol for real named living officials. Until real institutional protocol sources are logged per receiving institution, address role-level communications as **To: [Institution/Office]** and sign as **Office of the AU Strategic Envoy (Simulated)**. Use full real titles only with a dated source entry in `GLOSSARY.md`. No invented direct quotations assigned to real people. The first line of every instrument is a plain description of its gameplay meaning, not protocol language.

## 4. Fixed confidence vocabulary

| State | Player-facing expression | Required evidence rule |
|---|---|---|
| known | **Known** / **Confirmed** only when independently supported to required standard | claim and source are actually in PlayerKnowledgeState |
| estimated | **Estimated**; **Moderate confidence** / **Low confidence** / **High confidence** as applicable | show source basis and uncertainty, no hidden-truth reveal |
| unknown | **Not known** / **Information unavailable** | do not insert plausible invented value |
| stale | **Last confirmed [month year]; may have changed** | derive from evidence date and decay profile |
| contested | **Contested** | conflicting known claims surfaced side by side |
| unverified | **Unverified** | a claim exists but cannot be corroborated sufficiently |

**Assessment declared confidence** choices are **Low**, **Moderate**, **High**. Do not conflate a player's confidence declaration with evidence credibility, and never label an unsupported assessment as confirmed. Numeric player-owned costs can be exact; hidden actor intent, relationships and future reactions remain qualitative/knowledge-limited.

## 5. Formatting conventions

**Dates:** player-facing `1 October 2025`, `October 2025`, `Month 1 · October 2025` depending on context; generated with locale-aware formatters, not concatenated strings. `event_date` metadata may retain ISO `YYYY-MM-DD`. Do not use fake wall-clock countdowns. **Numerics:** use `Intl.NumberFormat`/`Intl.DateTimeFormat`; use locale-aware currency and clarify whether commitment or actual disbursement. Every data number carries unit, period and uncertainty where material. Signed change displays `+`/`−` and `increased`/`decreased`, not color alone. No exact unseen reaction probabilities. **Sources:** label **Observed baseline — [source] ([date])**, versus **Simulated development — [game month]**.

## 6. Writing templates (author before instances)

### A. Monthly strategic brief

Header: `SIMULATED · Office of the AU Strategic Envoy · [month] · Brief [ID] · [reporting confidence]`.  
Plain summary: `This month, [known material change]. [important gap]. [decision-relevant pressure].`  
Sections: **What changed** (observed reports); **Assessment** (explicit judgment and confidence); **Decisions approaching** (legal options); **Not known**; **Previous commitments**. If no evidence exists, say so.

### B. Actor/institution dossier

Header with subject/date/source confidence. Summary says which **known** authority or issue is relevant. Sections: **Role**, **Known position**, **Estimated position (confidence)**, **What is contested**, **Commitments**, **What you can do**, **What remains unknown**. Never display private `ActorIntentState` or `RedLineState` unless discovered.

### C. Intelligence report

Source type; observed date; received date; geographic scope; sensitivity; evidence IDs. **Reported:** [claim]; **Corroboration:** [status]; **Conflict:** [contradictory claim if known]; **Assessment:** [separate, explicitly labelled]; **Collection gap:** [question]; **Possible next step:** [player-known action]. No promise that collection reveals truth.

### D. Event/decision response

`[What occurred]. [Player-knowable reason]. [Known effect and unit]. [Available response or no action required].` Four clauses may be split between headline/summary/detail, but each can be retrieved. Results in simple past; current states in present; imperative for available actions. If causation hidden: `The cause is not yet known; [observable fact] was recorded.`

### E. Negotiation / authorization instrument

Header `SIMULATED`; preparing office, recipients, date, reference, legal basis (only vetted rules). Plain summary of effect and the required player decision. Numbered clauses: scope; authority; host conditions; resources; monitoring; milestones; expiry; dispute resolution. Final controls use **Commit [specific action]** / **Cancel draft** (or specific verbs). A proposal is never worded as approved before the engine authorizes it.

### F. Consequence summary / decision journal

Outcome first, then player-visible causes, observed state changes and linked decision IDs. Known and estimated causes distinguished. Never claim a consequence was certain or inevitable. Technical errors appear separately as software errors.

## 7. Starter sample copy (SIMULATED — illustrative, not approved scenario data)

- **Control:** `Request field reporting` / `Review the mandate case` / `Commit the consultation` / `End month`.
- **Brief summary:** `Reporting about access conditions remains inconsistent. Two sources describe different restrictions. A further collection request could clarify the situation, but may delay an institutional response.`
- **Intelligence gap:** `Movement restrictions in the selected zone are not yet independently verified.`
- **Dossier:** `The office may coordinate information sharing. Its position on independent field access is not known.`
- **Consequence:** `The consultation was recorded. Your office committed one strategic decision. Any later reporting will arrive through the selected channel.`
- **Technical error:** `The campaign could not be saved locally. No decision was committed. Retry saving before taking another action.`

## 8. Length and readability: measurement plan, not invented metrics

No defensible final character/word caps can be set until the approved UI containers have been rendered at 1024/1280 width, 200% text zoom and accessible settings. **Provisional editorial goals only:** button labels are short actionable verb+object; brief opening is one to three sentences; most event notices one sentence with expandable explanation; full documents permit substantive detail. These are *not* substitutes for the required measured word/character caps. Before production: measure the narrowest container in 200% zoom, set caps per component, name the readability measure, test plain summaries with general readers, and document target and limitations. No fabricated reading grade is asserted.

## 9. Governance and verification

All text uses string templates and named placeholders, not ad hoc concatenation. Save sample fixtures for every required state (known/estimated/unknown/stale/contested). Run the writing-standard lint and label-prediction tests; verify every claim with player knowledge projection; inspect 200% zoom and screen-reader labels; conduct Sahel/AU institutional review. Keep a per-string check of simulated marker, period, source and rendering. `VOICE.md` and `GLOSSARY.md` must be updated together with any naming/protocol changes. This document is an initial voice contract, **not** a completed copy compliance audit.
