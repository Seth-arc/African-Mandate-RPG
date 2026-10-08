# African Mandate
## Game Design Specification v2.1

**Document type:** Canonical player-experience and gameplay specification  
**Status:** v2.1 — stakeholder decisions incorporated  
**Supersedes:** `AFRICAN_MANDATE_GAME_DESIGN_SPEC_v2.md`  
**Depends on:**  
- `African_Mandate_Domain_Model_Simulation_Spec_v1_1.md`
- `AFRICAN_MANDATE_TECHNICAL_ARCHITECTURE_v2.md`
- `DESIGN_STANDARDS_ANTI_VIBECODE.md`

**Architecture posture:** Greenfield  
**Primary scenario:** Sahel  
**Primary audiences:** Strategy players and policy/governance professionals  
**Purpose:** Resolve ambiguities in Game Design Specification v1 and define a gameplay contract precise enough for scenario designers, systems designers, UI designers, writers, and coding agents to build the same intended game.

---

# Part I — Review of Game Design Specification v1

# 1. Review Method

Game Design Specification v1 was reviewed against:

1. its own stated player fantasy and pillars;
2. the Domain Model v1.1;
3. Technical Architecture v2;
4. the established three-decision monthly economy;
5. the imperfect-information boundary;
6. the Mandate Chain;
7. actor memory and institutional reactivity;
8. the requirement to balance entertainment with institutional realism;
9. the target audiences of strategy players and policy/governance professionals;
10. the anti-generic design standard.

Issues are classified as:

- **Resolved in v2** — the existing specifications support a clear revision;
- **Open question** — the source documents do not support one uniquely correct answer and stakeholder/product input is required.

---

# 2. Issue Audit

## Issue 1 — Decision cost and mandate requirement are conflated

**v1 references:** Sections 11 and 28.

**Relevant v1 text:**

> “A strategic decision consumes one of the three monthly decision slots when it changes authoritative game state in a consequential way.”

and later:

> “Tier 0 — Existing authority”

with examples including:

> “routine internal tasking” and “limited background engagement.”

### Why this is ambiguous

“Tier 0” can be read as “free,” even though the Domain Model establishes that consequential commands normally consume one strategic decision.

Mandate/authorization burden and decision-slot cost are different concepts.

### Revision

Treat them as two independent axes:

**Decision cost**

```text
Free inspection / organization
or
1 strategic decision
```

**Authority requirement**

```text
No mandate required
Assessment required
Coalition required
Formal authorization required
```

Rename the authorization tiers so “Tier 0” does not imply zero decision cost.

**Status:** Resolved in v2.

---

## Issue 2 — Opening a mandate case has no defined decision cost

**v1 references:** Sections 28–31 and Appendix D.

### Why this is incomplete

The player can adopt an assessment and then “build a mandate,” but v1 never says whether:

- opening the mandate case is free;
- it costs a decision;
- it is automatically created.

The Domain Model treats creation of authoritative mandate state as consequential.

### Revision

Default rule:

> **Escalating an adopted assessment into a mandate case is one strategic decision.**

A scenario MAY package mandate-case creation into another committed strategic decision, but the player never receives an additional state-changing step for free.

**Status:** Resolved in v2.

---

## Issue 3 — The unit of a strategic decision is underspecified

**v1 references:** Sections 11, 31–33, Appendix D.

### Why this matters

A single negotiation may involve:

- consulting an actor;
- offering a commitment;
- changing scope;
- agreeing to a condition.

If every UI sub-step costs one of only three decisions, the game becomes bureaucratic.

If every sub-step is free after opening a dialogue, players can bypass scarcity.

### Revision

One decision slot represents **one coherent strategic engagement or institutional commitment**.

A single committed command may contain several related terms configured before commitment.

Example:

```text
Consult ECOWAS
+ propose monitoring role
+ commit to quarterly review
= one strategic decision package
```

A later separate renegotiation is another decision.

**Status:** Resolved in v2.

---

## Issue 4 — Consequential and informational actor conversations are not distinguished clearly

**v1 references:** Sections 11, 31, 48–51.

**Relevant v1 text:**

> “reading non-consequential background dialogue” is free

but:

> “consequential consultation” costs a strategic decision.

### Why this is ambiguous

The specification does not define what makes a consultation consequential.

### Revision

Two interaction classes:

### Informational review — free

- read an existing known position;
- review prior correspondence;
- inspect commitments/disputes;
- ask no new authoritative question.

### Strategic consultation — one decision

- seek a current position;
- attempt persuasion;
- negotiate terms;
- make or request a commitment;
- obtain information that requires political access.

**Status:** Resolved in v2.

---

## Issue 5 — Blocking `DECISION REQUIRED` items can soft-lock a month

**v1 references:** Sections 11, 65.

**Relevant v1 text:**

> “A `DECISION REQUIRED` item may block End Month…”

### Why this is problematic

If the player spends all three decisions and an immediate reaction then creates a blocking item requiring another decision, End Month becomes impossible.

Multiple blocking responses can create the same problem.

### Revision

Mandatory-response design rules:

1. blocking responses that exist before the final decision reserve enough remaining strategic slots;
2. optional decisions become unavailable if spending them would leave too few slots for known blocking responses;
3. an immediate consequence of the player's final decision MUST NOT create a new same-month blocking response requiring another slot;
4. such a response becomes a next-month priority/decision-required item or is resolved as part of the initiating decision package;
5. scenario/event content MUST NOT create more simultaneously mandatory responses than the player can legally answer.

**Status:** Resolved in v2.

---

## Issue 6 — The specification never explicitly forbids bonus decision-slot farming

**v1 references:** Sections 7 and 11.

### Why this matters

Three decisions per month are a core pacing rule.

Without a prohibition, content designers could add:

- “+1 action” rewards;
- purchased decision slots;
- stockpiling.

That would undermine the central opportunity-cost mechanic.

### Revision

For v1:

```text
maximum strategic decisions per month = 3
```

They cannot be:

- purchased;
- carried forward;
- generated by an action;
- increased by doctrine.

Future modes may change this only through a deliberate Game Design Specification revision.

**Status:** Resolved in v2.

---

## Issue 7 — The campaign lacks an explicit strategic mandate/goal framework

**v1 references:** Sections 1–8 and 94–96.

### Why this is a significant gap

The game explains how to make decisions and how performance is evaluated, but not what the player is explicitly tasked to pursue at campaign start.

A strategy player needs clear purpose without reducing the experience to one score.

### Revision

Every scenario begins with a **Mandate Charter** containing:

- 3–5 strategic priorities;
- institutional constraints;
- known unacceptable outcomes or protected commitments where applicable;
- evaluation dimensions;
- duration of the mandate.

The Charter frames the campaign.

It does not prescribe one correct strategy.

**Status:** Resolved in v2.

---

## Issue 8 — Structured assessments are described ambiguously as “choose or compose”

**v1 reference:** Section 23.

**Relevant v1 text:**

> “The player chooses or composes from scenario-defined hypotheses and evidence.”

### Why this is ambiguous

This could mean:

- free-text hypothesis writing;
- a list of authored hypotheses;
- a combinatorial builder;
- AI interpretation of player prose.

Those imply very different implementation and balance requirements.

### Revision

For v1, authoritative assessments are **structured**.

The player selects:

- scenario-defined hypothesis;
- supporting known evidence;
- declared confidence band;
- optional non-authoritative private note.

Free-text prose cannot create new authoritative hypotheses in v1.

**Status:** Resolved in v2.

---

## Issue 9 — Declared confidence has no gameplay rule

**v1 references:** Sections 18, 23–26.

### Why this is incomplete

The Domain Model separates:

- evidence support;
- contradiction;
- declared confidence.

v1 never explains whether the player may declare stronger confidence than the evidence supports.

### Revision

The player selects a declared confidence band.

Recommended v1 bands:

```text
LOW
MODERATE
HIGH
```

`CONFIRMED` is reserved for evidentiary/source state and is not normally a player-selected assessment confidence.

The player MAY adopt confidence higher or lower than the analytical support suggests.

Consequences:

- higher confidence may strengthen political defensibility or unlock stronger positions;
- if later undermined, credibility costs can be greater;
- lower confidence may preserve credibility but restrict institutional action.

Exact thresholds belong in Scenario/Balance.

**Status:** Resolved in v2.

---

## Issue 10 — The player can potentially cherry-pick contradictory evidence

**v1 reference:** Section 23.

### Why this matters

If the player can simply omit known contradicting evidence from an adopted assessment, the intelligence mechanic becomes exploitable and less credible.

### Revision

Assessment workspace rules:

- player chooses which evidence they rely on as support;
- the system automatically lists materially relevant contradictory evidence already known to the player;
- known contradiction cannot be hidden from the analytical workspace;
- the player may still adopt the assessment despite contradiction.

This preserves player agency without allowing the UI to falsify the player's known information environment.

**Status:** Resolved in v2.

---

## Issue 11 — Assessment adoption is described as “materially consequential” without a crisp gameplay rule

**v1 references:** Sections 11, 23–27.

### Why this is ambiguous

Scenario designers need to know when an assessment consumes a decision.

### Revision

For v1:

- drafting/editing an uncommitted assessment is free;
- **adopting** an assessment is one strategic decision if it becomes authoritative player/institutional state;
- revising an adopted assessment is one strategic decision;
- withdrawing an adopted assessment is one strategic decision where it materially changes institutional posture.

**Status:** Resolved in v2.

---

## Issue 12 — Intelligence collection does not define partial failure or repeat-task behavior

**v1 references:** Sections 20–22.

### Why this is incomplete

Without rules, designers could treat collection as:

> spend one decision → reveal answer.

It also permits repeated farming of the same gap.

### Revision

Collection can return:

- useful evidence;
- partial evidence;
- contradictory evidence;
- no decisive evidence.

Repeated collection of the same question/channel SHOULD have diminishing informational value unless:

- conditions changed;
- a better source/channel became available;
- a new reporting period makes repetition meaningful.

Collection never guarantees hidden truth.

**Status:** Resolved in v2.

---

## Issue 13 — Hidden-state failure could leak through action availability

**v1 references:** Sections 13–17 and 34.

### Why this is problematic

If an action disappears because of an unknown red line or hidden actor unwillingness, the player learns the hidden state through UI behavior.

The Technical Architecture forbids this, but the game-design consequence is not stated.

### Revision

If the player satisfies all **known** eligibility requirements, hidden factors MUST NOT invalidate the action before commitment.

Hidden factors instead manifest as:

- resistance;
- failed persuasion;
- distortion;
- delay;
- consequence.

The decision slot is still consumed because the envoy genuinely attempted the action.

**Status:** Resolved in v2.

---

## Issue 14 — Repeated diplomacy can be spammed

**v1 references:** Sections 30–33 and 48–52.

### Why this is a gameplay risk

Without repetition rules, the player may repeatedly consult the same actor until trust or support rises.

### Revision

Scenario content MUST define repetition behavior for consequential diplomatic actions.

Acceptable tools:

- cooldown;
- diminishing returns;
- requirement for new evidence;
- requirement for changed terms;
- actor fatigue;
- increasing political cost.

Repeated identical consultation without changed context SHOULD NOT be an optimal strategy.

**Status:** Resolved in v2.

---

## Issue 15 — Commitments lack feasibility and conflict rules

**v1 references:** Sections 32–33.

### Why this is incomplete

Can the player promise:

- more money than exists;
- mutually incompatible terms;
- the same exclusive role to two actors?

Some contradictions create good gameplay; others are invalid UI states.

### Revision

Three categories:

### Structurally impossible

Cannot be committed.

Example:

- resource amount outside legal/system bounds.

### Politically conflicting

Allowed with explicit warning.

Example:

- overlapping or contradictory promises to two partners.

### Strategically risky

Allowed without hard prohibition but previewed where known.

A conflicting commitment may create powerful future consequences and should not always be blocked.

**Status:** Resolved in v2.

---

## Issue 16 — Unknown red lines need a stronger fairness standard

**v1 reference:** Section 34.

**Relevant v1 text:**

> “Avoid arbitrary ‘gotcha’ design.”

### Why this lacks sufficient detail

Scenario writers need an actionable fairness test.

### Revision

A severe unknown red line SHOULD normally have at least one discoverable route before first violation:

- prior actor signal;
- discoverable intelligence gap;
- related institutional history;
- consultation result;
- scenario briefing clue.

If a red line is intentionally unknowable, its first consequence SHOULD be limited enough to create new information rather than immediately destroy the campaign, unless the scenario explicitly frames the action as obviously extreme.

**Status:** Resolved in v2.

---

## Issue 17 — Authorization gameplay does not define player agency while the request is pending

**v1 reference:** Section 35.

### Why this is incomplete

The player knows “the world continues,” but not what they can do to affect the pending process.

### Revision

While authorization is pending, the player MAY use strategic decisions to:

- consult decision-makers;
- fulfill conditions;
- revise scope;
- offer commitments;
- withdraw the request;
- address new evidence.

A material revision may reset or extend authorization timing according to scenario rules.

The request never becomes a passive progress bar the player can only watch.

**Status:** Resolved in v2.

---

## Issue 18 — Implementation resource reallocation is not defined clearly

**v1 references:** Sections 39–43.

### Why this is ambiguous

v1 says implementation should progress automatically but the player can “allocate more capacity.”

It does not say whether small reallocations are free.

### Revision

For v1:

- launch-time resource allocation is part of the launch decision;
- routine execution is automatic;
- any player-initiated change that materially alters allocation, scope, partner, or objective is one strategic decision;
- cosmetic/inspection changes are free;
- implementation milestones do not require maintenance clicks.

**Status:** Resolved in v2.

---

## Issue 19 — Capacity recovery and depletion behavior is missing

**v1 references:** Sections 44–47.

### Why this matters

Without high-level recovery rules, capacities can become arbitrary permanent bars.

### Revision

Capacity classes:

### Spend/recover

Example:

- political capital.

May be spent and recovered through outcomes/events according to balance rules.

### Allocated/released

Examples:

- secretariat capacity;
- implementation capacity.

Consumed by active work and released when workload changes/completes.

### Derived

Examples:

- member-state alignment;
- partner confidence.

Recomputed from relationships/positions/events rather than “spent.”

### Informational/system condition

Example:

- intelligence confidence.

Changes with access, reporting, collection, and source quality.

Exact rates belong in Scenario/Balance.

**Status:** Resolved in v2.

---

## Issue 20 — Global “Mandate Authority” can be confused with case-specific authorization

**v1 references:** Sections 36 and 44–45.

### Why this is confusing

The terms sound like the same thing.

### Revision

Player-facing terminology:

```text
INSTITUTIONAL AUTHORITY
```

for the global envoy capacity currently represented by `mandateAuthority`.

Case-specific state remains:

```text
AUTHORIZATION
```

The Domain Model field may remain `mandateAuthority` internally until deliberately renamed, but UI/game copy SHOULD distinguish them.

**Status:** Resolved in v2.

---

## Issue 21 — Portfolio overload lacks player-legible states

**v1 references:** Sections 42–43.

### Why this matters

A soft cap is only strategic if the player can understand pressure before projects fail.

### Revision

Portfolio workload is communicated through qualitative bands:

```text
AVAILABLE
MANAGEABLE
STRAINED
OVEREXTENDED
```

The player can inspect:

- what is consuming capacity;
- which implementations are at risk;
- what releasing capacity would change.

Exact numeric capacity may remain subject to the numeric-visibility open question.

**Status:** Resolved in v2.

---

## Issue 22 — Doctrine review lost the previously intended “adjust” option

**v1 references:** Sections 53–56.

**Relevant v1 text:**

> “The player may formalize it; continue without codifying it.”

### Why this is incomplete

Earlier design and the Domain Model support doctrine emerging from behavior, but the review should allow some intentional strategic self-definition rather than a binary accept/decline.

### Revision

At doctrine review, present:

1. the observed doctrine vector;
2. one recommended doctrine profile;
3. where scenario/content permits, one or more **adjacent compatible** profiles;
4. option to remain uncodified.

The player cannot choose a doctrine radically inconsistent with observed behavior solely to gain a bonus.

**Status:** Resolved in v2.

---

## Issue 23 — Doctrine codification timing is not precise

**v1 reference:** Section 55.

### Why this is ambiguous

“Recommended after Turn 4” could mean:

- end of Month 4;
- during Month 4;
- start of Month 5.

### Revision

Default v1 timing:

> Doctrine Review becomes available at the **start of Month 5**, after Month 4 resolution.

Codification consumes one Month 5 strategic decision if chosen.

If declined, doctrine remains observational and may be reviewed again later when scenario rules permit.

**Status:** Resolved in v2.

---

## Issue 24 — Immediate actor reaction and end-of-month actor adaptation can be mistaken for duplicate reactions

**v1 references:** Sections 15, 51–52, 77.

### Why this needs clarification

A decision can generate immediate feedback and actors also adapt during monthly resolution.

Scenario writers need to understand the difference.

### Revision

**Immediate reaction**

Direct response to the committed decision:

- acknowledgement;
- explicit trust effect;
- commitment;
- issue-position shift directly caused by terms.

**Monthly adaptation**

Broader strategic reconsideration based on:

- cumulative memories;
- world changes;
- other actors;
- new evidence;
- unresolved disputes.

The same effect MUST NOT be applied twice merely because both phases exist.

**Status:** Resolved in v2.

---

## Issue 25 — Causality explanations can accidentally reveal hidden truth

**v1 references:** Sections 79 and 134.

### Why this is problematic

“Primary factor” language may use the engine's true causal calculation even if the player could not know it.

### Revision

Player-facing causal explanations may state as fact only:

- known decisions;
- known commitments;
- formal institutional rules;
- evidence the player has;
- observed implementation state.

Hidden causal factors remain:

```text
uncertain
unverified
poorly understood
```

until evidence reveals them.

Developer/debug causality may show full truth separately.

**Status:** Resolved in v2.

---

## Issue 26 — The “updated intelligence” stage can imply instant intelligence from every decision

**v1 references:** Section 15 and Appendix C.

### Why this is misleading

Some decisions, especially intelligence collection, are explicitly delayed.

### Revision

The responsiveness contract becomes:

> A major decision SHOULD eventually affect the information environment, but it does not need to generate immediate new intelligence.

Immediate feedback can instead be:

- actor acknowledgement;
- mandate state;
- known resource commitment.

Evidence arrives according to observation/collection rules.

**Status:** Resolved in v2.

---

## Issue 27 — Attention/event backlogs have no persistence rule

**v1 references:** Sections 63–67 and 108.

### Why this is incomplete

If a situation is not selected this month, does it disappear from the queue?

### Revision

Unresolved situations persist until:

- resolved;
- expired;
- transformed into another situation;
- no longer strategically relevant according to scenario rules.

Their urgency may:

- increase;
- decrease;
- remain stable.

A new month does not automatically clear attention.

**Status:** Resolved in v2.

---

## Issue 28 — Typical content density does not guarantee opportunity cost

**v1 reference:** Section 131.

**Relevant v1 text:**

> “1–3 items deserving real strategic consideration…”

### Why this may conflict with three available decisions

If there are only one to three important items and the player has three decisions, scarcity may disappear.

Existing implementations and active mandates can add demands, but v1 does not say so explicitly.

### Revision

Target monthly pressure:

```text
2–4 new serious candidates
+
ongoing mandate/relationship/commitment demands
```

The player should **frequently but not always** have more useful strategic actions than available slots.

Quiet months remain intentional exceptions.

**Status:** Resolved in v2.

---

## Issue 29 — Early failure lacks a fairness/foreshadowing requirement

**v1 references:** Sections 91–93.

### Why this matters

The specification says failure should not come from an unexplained roll, but does not define minimum signaling.

### Revision

Except for explicitly authored extraordinary shocks, campaign-threatening deterioration SHOULD provide:

- at least one prior warning state;
- a visible worsening trajectory;
- a plausible intervention opportunity.

If a scenario includes a sudden catastrophic event, the possibility must be grounded in visible prior risk or clearly framed external shock rather than arbitrary punishment.

**Status:** Resolved in v2.

---

## Issue 30 — End-of-mandate review has no epistemic boundary

**v1 references:** Sections 94–96 and 140.

### Why this is a major ambiguity

Should the final report reveal:

- hidden actor intent?
- the simulation's “true” conflict state?
- missed hidden opportunities?

Revealing everything could undermine the game's imperfect-information philosophy.

### Revision

The primary **End-of-Mandate Review** remains an institutional/player-knowledge product.

It may incorporate facts that became known by campaign end.

It does not automatically reveal all hidden truth.

A future optional **Simulation Debrief** may expose model truth and hidden variables, but if added it must be clearly labeled as fictional simulation/model state rather than real-world fact.

**Status:** Resolved in v2.

---

## Issue 31 — The game lacks an explicit decision-family taxonomy

**v1 reference:** Section 114.

### Why this matters

A list of verbs is useful but scenario designers need recurring content families to maintain variety and teachability.

### Revision

Define seven decision families:

```text
INTELLIGENCE
ASSESSMENT
DIPLOMACY
MANDATE
AUTHORIZATION
IMPLEMENTATION
CRISIS / STRATEGIC RESPONSE
```

Doctrine codification is a special strategic review action.

Every authored action declares one family and one authority requirement.

**Status:** Resolved in v2.

---

## Issue 32 — Player negotiation input is unspecified

**v1 references:** Sections 31 and 98–101.

### Why this matters

“AI actor responses” can be interpreted as free-form chat negotiation.

The Technical Architecture supports AI as renderer, not decision authority.

### Revision

For v1, authoritative negotiations use structured player choices and configured terms.

AI may dynamically render the actor's response to the already resolved semantic outcome.

Free-form player text does not alter simulation state.

A future conversational negotiation mode would require a separate design/architecture revision.

**Status:** Resolved in v2.

---

## Issue 33 — Political/institutional neutrality is not explicit

**v1 references:** Sections 97, 121, 123.

### Why this is important

The game uses real political and institutional actors.

Scenario content needs a rule preventing mechanics from encoding unsupported partisan or moral rankings.

### Revision

Real institutions and political actors MUST be represented through:

- documented roles;
- scenario-defined interests;
- relationships;
- constraints;
- explicit modeled consequences.

Do not classify real political actors as inherently:

```text
good
bad
smart
stupid
legitimate
illegitimate
```

through unexplained designer labels.

Policy outcomes are evaluated against explicit game dimensions and scenario assumptions, not partisan preference.

**Status:** Resolved in v2.

---

## Issue 34 — Strategic content has no minimum authoring contract

**v1 references:** Sections 110–116 and Appendix C.

### Why this is incomplete

A writer could author an action with a label and effect but no:

- evidence basis;
- institutional reaction;
- delayed consequence;
- callback.

That would recreate the unresponsive experience the redesign is intended to fix.

### Revision

Every major strategic action definition must document:

```text
PLAYER QUESTION
DECISION FAMILY
AUTHORITY REQUIREMENT
TARGET
KNOWN COSTS
EVIDENCE BASIS
PREVIEW RISKS/UNKNOWNS
IMMEDIATE RESPONSE
ACTOR/INSTITUTIONAL REACTION
IMPLEMENTATION PATH
POSSIBLE DELAYED CONSEQUENCES
CALLBACK HOOKS
DOCTRINE SIGNAL
```

Not every field requires a unique authored event, but all must be considered.

**Status:** Resolved in v2.

---

## Issue 35 — The first 15 minutes can branch around the core intelligence lesson

**v1 reference:** Section 89.

**Relevant v1 text:**

> first choice: “task additional intelligence or conduct a consequential consultation”

### Why this is a problem

A player who chooses consultation might not learn that intelligence collection is delayed, which is a defining mechanic.

### Revision

The first two months of the guided first campaign MUST demonstrate:

- at least one intelligence gap;
- at least one delayed information process;
- at least one contradictory source;
- at least one consequential institutional reaction.

The player's exact first choice can vary.

**Status:** Resolved in v2.

---

## Issue 36 — Save/reload philosophy is not a game-design decision

**v1 references:** Sections 7, 12, 125.

### Why this matters

Technical recovery exists, but player-facing rollback changes the strategic meaning of uncertainty and consequences.

### Revision

Flag as stakeholder decision.

Recommended options:

### A. Rolling campaign save — recommended

- autosave after decisions/end month;
- no normal rollback;
- technical recovery backups hidden;
- reinforces consequence.

### B. Manual multiple saves

- more forgiving;
- easier experimentation;
- weaker consequence ownership.

### C. Mode-dependent

- Standard/Expert rolling save;
- Narrative permits manual rollback.

**Status:** Open question OQ-G5.

---

## Issue 37 — Competitive scoring/leaderboards are not addressed

**v1 references:** evaluation and replay sections.

### Why this requires a decision

The reference repository contained leaderboard concepts, while the greenfield game now emphasizes nuanced multidimensional evaluation and different campaign seeds.

A global score could undermine that philosophy.

### Revision

Flag as stakeholder decision.

Recommendation:

> No global competitive leaderboard in v1.

If challenge comparison is added later, compare:

- same scenario;
- same baseline;
- same simulation model;
- same seed;
- same difficulty;

and show dimensions rather than a politically normative single score.

**Status:** Open question OQ-G6.

---

## Issue 38 — A dedicated integrity/corruption system is absent

**v1 reference:** no dedicated section.

### Why this is a gap worth flagging

The reference game included corruption/oversight mechanics, but the greenfield Domain Model intentionally does not currently define a dedicated integrity aggregate.

It is unclear whether integrity should be:

- a first-class system;
- scenario-specific consequences;
- modeled through commitments, disputes, legitimacy, and implementation.

### Revision

Do not silently add a new global meter.

Flag for stakeholder/scenario decision.

Recommendation:

> Start v1 by modeling integrity through explicit events, implementation risks, commitments, legitimacy, and oversight conditions. Add a dedicated system only if Sahel scenario design demonstrates repeated gameplay that cannot be represented cleanly.

**Status:** Open question OQ-G7.

---

## Issue 39 — Numeric score visibility remains open but needs a stronger recommendation

**v1 reference:** OQ-G3.

### Revision

Retain as open.

Recommended default:

- exact numbers for player-owned resources and formal procedural states;
- qualitative bands/trends for uncertain actor/region states;
- optional advanced detail only where the information is plausibly measurable.

**Status:** Open question OQ-G3.

---

## Issue 40 — Campaign identity and playtime remain legitimate stakeholder decisions

**v1 references:** OQ-G1 and OQ-G2.

### Revision

Retain them unchanged, with updated recommendation language.

**Status:** Open questions OQ-G1 and OQ-G2.

---

# Part II — Consolidated Game Design Specification v2

# 3. Authority and Scope

## 3.1 This document owns

This specification is authoritative for:

- player fantasy;
- strategic goals and campaign framing;
- gameplay pillars;
- campaign pacing;
- monthly decision economy;
- intelligence and assessment gameplay;
- diplomacy and negotiation;
- mandate formation;
- authorization;
- implementation;
- actor-facing experience;
- event/attention pacing;
- consequence feedback;
- doctrine;
- difficulty;
- onboarding;
- failure;
- replayability;
- end-of-mandate evaluation.

---

## 3.2 This document does not own

### Domain Model

Owns:

- state schemas;
- hidden truth;
- knowledge state;
- command semantics;
- lifecycle invariants.

### Technical Architecture

Owns:

- execution;
- persistence;
- deterministic algorithms;
- package boundaries;
- AI plumbing;
- projection firewall.

### Data & Methodology Specification

Owns:

- real-data inputs;
- derived indicators;
- confidence formulas;
- provenance;
- licensing;
- model methodology.

### UI/UX Specification

Owns:

- precise layouts;
- visual tokens;
- component interactions;
- responsive/accessibility implementation;
- detailed map controls.

### Sahel Scenario Specification

Owns:

- actual campaign content;
- strategic priorities;
- actors;
- red lines;
- actions;
- events;
- exact balance.

---

# 4. Game Identity

African Mandate is a **turn-based strategic governance simulation** about converting uncertain knowledge into legitimate collective action.

The player serves as an **African Union strategic envoy**.

The player's power comes from:

- information;
- judgment;
- access;
- institutional authority;
- relationships;
- coalition formation;
- commitments;
- mandate-building;
- implementation coordination.

The defining strategic tension:

> **You may understand a problem before you possess the authority, support, confidence, capacity, or time required to act effectively.**

---

# 5. Player Fantasy

The player combines two roles.

## 5.1 Intelligence-informed strategist

The player:

- reads incomplete reporting;
- recognizes patterns;
- compares conflicting accounts;
- identifies gaps;
- decides when evidence is sufficient;
- accepts the risk of being wrong.

---

## 5.2 Institutional operator

The player:

- navigates AU and regional structures;
- manages relationships;
- persuades actors;
- negotiates conditions;
- makes commitments;
- builds coalitions;
- seeks authorization;
- coordinates implementation.

---

## 5.3 Fantasy statement

> **I am not commanding the region. I am trying to understand it well enough, and build enough legitimate collective power, to change what happens next.**

---

# 6. Campaign Mandate Charter

Every scenario MUST begin with a **Mandate Charter**.

The Charter gives the player strategic purpose without prescribing a single solution.

It contains:

```text
ROLE
MANDATE DURATION
3–5 STRATEGIC PRIORITIES
KNOWN INSTITUTIONAL CONSTRAINTS
PROTECTED / NON-NEGOTIABLE COMMITMENTS WHERE APPLICABLE
END-OF-MANDATE EVALUATION DIMENSIONS
```

Example structure:

```text
PRIORITY
Reduce regional conflict pressure without undermining AU legitimacy.

PRIORITY
Preserve humanitarian access.

PRIORITY
Strengthen regional institutional cooperation.

CONSTRAINT
Major security interventions require formal authorization.
```

Exact Sahel priorities belong in the Scenario Specification.

---

# 7. Player Experience Promise

A strong campaign repeatedly produces:

## Analytical satisfaction

> “I noticed something meaningful in the evidence.”

## Institutional tension

> “I know what I want, but I do not yet have the support or authority.”

## Opportunity cost

> “I cannot pursue every useful action this month.”

## Ownership

> “A later development connects to something I chose.”

## Adaptation

> “My earlier judgment no longer fits the situation.”

## Legacy

> “What matters now is what can survive beyond my mandate.”

---

# 8. Core Gameplay Pillars

## Pillar 1 — Imperfect intelligence

The player never receives an omniscient strategy dashboard.

Information has:

- provenance;
- confidence;
- age;
- contradiction;
- gaps.

---

## Pillar 2 — Assessment is gameplay

The player must form and adopt structured institutional judgments.

Assessment changes:

- action space;
- political defensibility;
- coalition dynamics;
- future accountability.

---

## Pillar 3 — Authority must be built

Significant interventions require varying degrees of:

- assessment;
- political support;
- formal authorization;
- implementation capacity.

---

## Pillar 4 — Strategic attention is scarce

Three consequential decisions per month force prioritization.

The player should frequently have more worthwhile actions than available decisions.

---

## Pillar 5 — The world remembers

Decisions create:

- memories;
- commitments;
- disputes;
- callbacks;
- institutional expectations.

---

## Pillar 6 — Geography matters

The map helps the player reason about:

- conflict;
- infrastructure;
- corridors;
- displacement;
- cross-border dynamics;
- strategic dependencies.

---

# 9. What the Game Is Not

African Mandate is not:

- a military RTS;
- tactical combat;
- a spreadsheet optimization game;
- a policy quiz;
- an omnipotent geopolitical sandbox;
- a GIS viewer;
- an administrative paperwork simulator;
- an LLM roleplay chat with hidden game rules;
- a game with one politically “correct” answer.

---

# 10. Canonical Gameplay Loop

```text
OBSERVE
↓
ASSESS
↓
BUILD MANDATE
↓
DECIDE
↓
IMPLEMENT
↓
REASSESS
↺
```

A single issue may take several months to move through this loop.

That is intentional.

---

# 11. Campaign Structure

Initial Sahel target:

```text
20 monthly turns
3 strategic decisions per month
60 maximum strategic decisions
```

The player may end a month with unused decisions.

Unused decisions are forfeited.

No mechanic in v1:

- buys;
- grants;
- stockpiles;
- carries forward;

additional strategic-decision slots.

---

# 12. Target Playtime

Locked v1 target:

```text
Typical turn:
8–15 minutes

Full campaign:
3–5 hours

Multiple sessions:
supported
```

Scenario content density and briefing length MUST be tuned against this target.

---

# 13. No Real-Time Strategic Clock

The simulation does not advance while:

- reading;
- considering;
- browsing;
- inspecting.

Time advances through the turn system.

Network/AI latency never consumes game time.

---

# 14. Five Campaign Phases

## Phase I — Orientation and Diagnosis

**Turns 1–4**

Goals:

- learn the strategic environment;
- understand sources/confidence;
- identify gaps;
- make early assessments;
- establish relationships.

Core question:

> **What is actually happening?**

---

## Phase II — Coalition and Mandate Formation

**Turns 5–8**

Goals:

- build support;
- discover conditions;
- make commitments;
- open mandate cases;
- seek authorization.

Core question:

> **Who will support collective action, and on what terms?**

---

## Phase III — Implementation and Strategic Competition

**Turns 9–12**

Goals:

- manage active implementation;
- handle capacity;
- adapt to external actors;
- absorb first major second-order consequences.

Core question:

> **Can authorized strategy actually be delivered?**

---

## Phase IV — Consequence and Institutional Strain

**Turns 13–16**

Goals:

- manage callbacks;
- honor/breach commitments;
- repair overextension;
- respond to distorted outcomes.

Core question:

> **What did earlier choices set in motion?**

---

## Phase V — Consolidation and Legacy

**Turns 17–20**

Goals:

- stabilize portfolios;
- address critical unresolved risks;
- make late tradeoffs;
- leave sustainable institutions/mandates.

Core question:

> **What will endure after the envoy leaves?**

---

## 14.1 Phase flexibility

Phases describe pacing.

They do not hard-lock ordinary mechanics unless scenario conditions justify it.

A player may:

- form a coalition early;
- collect intelligence late;
- revise an assessment at any phase.

---

# 15. Monthly Turn Anatomy

```text
MONTH START
↓
STRATEGIC BRIEF
↓
FREE INSPECTION / DRAFTING
↓
STRATEGIC DECISION
↓
IMMEDIATE RESPONSE
↓
INSPECT / REASSESS
↓
STRATEGIC DECISION
↓
IMMEDIATE RESPONSE
↓
INSPECT / REASSESS
↓
STRATEGIC DECISION
↓
IMMEDIATE RESPONSE
↓
END MONTH
↓
MONTHLY RESOLUTION
↓
NEXT MONTH
```

The player can end early.

Decision order matters.

---

# 16. Monthly Strategic Brief

The brief answers:

```text
WHAT CHANGED?

WHAT REQUIRES ATTENTION?

WHAT REMAINS UNRESOLVED?

WHAT IMPLEMENTATIONS PROGRESSED OR STALLED?

WHAT NEW INFORMATION ARRIVED?

WHAT COMMITMENTS / AUTHORIZATION WINDOWS / OPPORTUNITIES ARE APPROACHING?
```

The brief is prioritized.

It is not the raw event log.

---

# 17. Strategic Decision Economy

## 17.1 Free activities

Do not consume strategic decisions:

- read;
- inspect;
- compare evidence;
- navigate map;
- review known actor position;
- review commitments;
- draft an uncommitted assessment;
- draft decision terms;
- cancel before commitment;
- change visual layers;
- read methodology;
- review decision journal.

---

## 17.2 Consequential activities

Normally consume one strategic decision:

- task intelligence;
- adopt/revise/withdraw a material assessment;
- strategic consultation;
- negotiate terms;
- make a commitment;
- escalate assessment into mandate case;
- seek authorization;
- materially revise mandate;
- launch implementation;
- materially reallocate implementation;
- suspend/restructure major implementation;
- respond to crisis;
- codify doctrine.

---

## 17.3 Decision package

One decision is one coherent strategic engagement.

The player may configure multiple linked terms before commitment.

The game MUST NOT charge one decision for each slider, sentence, or sub-step.

---

# 18. Authority Requirement Is a Separate Axis

Every strategic action also has an authority requirement.

```text
NO MANDATE REQUIRED
ASSESSMENT REQUIRED
COALITION REQUIRED
FORMAL AUTHORIZATION REQUIRED
```

These levels describe institutional burden, not decision cost or quality.

A no-mandate action may still consume one strategic decision.

---

# 19. Decision Families

Every strategic action belongs primarily to one family.

```text
INTELLIGENCE
ASSESSMENT
DIPLOMACY
MANDATE
AUTHORIZATION
IMPLEMENTATION
CRISIS / STRATEGIC RESPONSE
```

Doctrine codification is a special strategic-review action.

This taxonomy guides:

- content authoring;
- onboarding;
- balance analysis;
- action variety.

---

# 20. Decision Commitment

Before commitment, the player may:

- inspect evidence;
- change target;
- revise terms;
- adjust resource allocation;
- cancel.

After commitment:

- authoritative effects resolve;
- a decision slot is spent;
- the decision enters history;
- immediate institutional reaction may occur.

There is no normal in-turn undo.

Player-facing rollback policy remains OQ-G5.

---

# 21. Decision Preview

The preview shows only what the envoy can reasonably know.

Include:

```text
KNOWN COSTS

AUTHORITY REQUIREMENT

LIKELY INSTITUTIONAL REACTION

KNOWN DEPENDENCIES

KNOWN RISKS

IMPORTANT UNKNOWNS

REVERSIBILITY

CURRENT CONFIDENCE
```

Do not expose:

- hidden success chance;
- hidden red lines;
- hidden future callback;
- exact unknown actor intent.

---

# 22. Hidden-State Eligibility Rule

If an action is legal according to player-known rules, hidden information cannot silently remove it from the player's action list.

A hidden problem becomes an **in-world outcome**.

Examples:

- actor unexpectedly resists;
- authorization gains new condition;
- consultation fails;
- mandate distorts;
- implementation is blocked later.

The attempted action still consumes the decision.

This is essential to imperfect-information fairness.

---

# 23. Blocking Mandatory Responses

`DECISION REQUIRED` is reserved for situations that genuinely need explicit player response.

Rules:

1. known blocking items reserve required strategic slots;
2. optional decisions cannot spend the final reserved slots;
3. same-month immediate consequences cannot generate an unanswerable new blocking item after the final decision;
4. such consequences become next-month required items if another strategic response is needed;
5. scenario design must not create more mandatory responses than can legally be handled.

Use sparingly.

---

# 24. Immediate Feedback

Canonical response layers:

```text
ACKNOWLEDGEMENT
INSTITUTIONAL REACTION
VISIBLE STATE CHANGE
INFORMATION-ENVIRONMENT CHANGE
IMPLEMENTATION PROGRESS
DELAYED CONSEQUENCE
FUTURE REFERENCE
```

A major action SHOULD eventually touch at least four layers.

It does not need to produce new intelligence immediately.

---

# 25. Exact versus Uncertain Information

## Usually exact

- own budget;
- own personnel allocation;
- strategic decisions remaining;
- formal authorization status;
- known mandate restrictions;
- commitments made by the player;
- formal deadlines;
- implementation milestones.

## Usually uncertain

- actor intent;
- true armed-group capability;
- future actor response;
- informal willingness;
- infrastructure attack risk;
- simulated public sentiment;
- unknown red lines.

---

# 26. Confidence Vocabulary

Player-facing evidence/report vocabulary:

```text
CONFIRMED
HIGH CONFIDENCE
MODERATE CONFIDENCE
LOW CONFIDENCE
CONTESTED
UNVERIFIED
UNKNOWN
```

Assessment declared-confidence choices in v1:

```text
LOW
MODERATE
HIGH
```

Exact internal confidence scores need not be visible.

---

# 27. Intelligence Contradiction

Contradiction should be source- and institution-driven.

Example:

```text
HOST GOVERNMENT
Security conditions are improving.

AU FIELD REPORTING
Armed-group mobility remains elevated.

OPEN-SOURCE REPORTING
Displacement increased.

ASSESSMENT
Security gains remain localized.

DECLARED CONFIDENCE
Moderate.
```

The strategic question is:

> **Why do these sources differ, and what can I safely conclude?**

---

# 28. Intelligence Gaps

Known ignorance is explicit.

Examples:

```text
Unknown actor mobility
Unverified displacement
Unclear government willingness
Unconfirmed asset disruption
Unknown financing commitment
```

The player may leave a gap unresolved.

That risk then belongs to the decision.

---

# 29. Intelligence Collection

Tasking intelligence is a strategic decision.

The player chooses:

- question;
- subject/geography;
- collection channel when alternatives exist.

Collection is delayed.

Possible results:

```text
useful evidence
partial evidence
contradictory evidence
no decisive evidence
```

Never:

```text
spend decision → reveal true hidden value
```

---

# 30. Repeat Collection

Repeated collection using the same channel/question SHOULD face diminishing value unless something materially changed.

New value may come from:

- new reporting period;
- new access;
- better source;
- changed local conditions;
- different channel.

Scenario/Balance defines exact mechanics.

---

# 31. Collection Channels

Possible scenario-defined channels include:

```text
AU FIELD
HOST GOVERNMENT
PARTNER INTELLIGENCE
DIPLOMATIC
OPEN SOURCE
TECHNICAL
```

Tradeoffs may involve:

- speed;
- reliability;
- access;
- political cost;
- source bias.

Data/Methodology and Scenario specs own exact values.

---

# 32. Structured Assessments

Authoritative assessments are structured.

Player selects:

```text
SUBJECT
HYPOTHESIS
DECLARED CONFIDENCE
SUPPORTING EVIDENCE
```

The system also displays:

```text
KNOWN CONTRADICTORY EVIDENCE
KNOWN INTELLIGENCE GAPS
```

Optional private player notes are non-authoritative.

Free-text does not define new simulation hypotheses in v1.

---

# 33. Assessment Confidence

The player may deliberately state confidence above or below the apparent evidence support.

This is strategic.

## Higher declared confidence

Potential benefits:

- stronger institutional case;
- access to stronger actions;
- coalition clarity.

Potential risk:

- larger credibility cost if later undermined.

## Lower declared confidence

Potential benefits:

- analytical caution;
- reduced overcommitment.

Potential cost:

- weaker political case;
- fewer available interventions.

Exact balance belongs in Scenario/Balance.

---

# 34. Contradictory Evidence Cannot Be Hidden

The player chooses supporting evidence.

The assessment workspace automatically surfaces material known contradictory evidence.

The player may proceed despite contradiction.

They cannot make the application's known contradiction disappear by omitting it.

---

# 35. Assessment Lifecycle and Decision Cost

```text
DRAFT
free

ADOPT
1 strategic decision

REVISE ADOPTED ASSESSMENT
1 strategic decision

WITHDRAW / SUPERSEDE WHEN INSTITUTIONALLY MATERIAL
1 strategic decision
```

The engine may mark an assessment:

```text
contested
stale
undermined
```

without rewriting the player's adopted conclusion.

---

# 36. Insufficient Evidence Is a Valid Strategy

The player may refuse to adopt a strong assessment.

Options include:

- wait;
- collect;
- consult;
- take a lower-authority action;
- accept uncertainty.

Waiting advances risk because the world moves at End Month.

---

# 37. Mandate Case Creation

An adopted assessment does not automatically become a mandate.

Default flow:

```text
ADOPT ASSESSMENT
↓
strategic decision:
ESCALATE TO MANDATE CASE
↓
MANDATE CASE
```

A scenario may combine these in one authored decision package where clearly justified.

No extra state-changing action is free.

---

# 38. Mandate Case Experience

A mandate case presents:

```text
OBJECTIVE

ASSESSMENT BASIS

WHY AUTHORITY IS NEEDED

CURRENT SCOPE

WHO MATTERS

KNOWN / ESTIMATED POSITIONS

OUTSTANDING CONDITIONS

KNOWN OR SUSPECTED RED LINES

CURRENT POLITICAL STRENGTH

IMPLEMENTATION READINESS

CAPACITY DEMAND
```

It should feel like a strategic institutional case, not a process form.

---

# 39. Coalition Gameplay

Coalitions are issue-specific.

General relationship and specific position remain separate.

Example:

```text
GENERAL RELATIONSHIP
Cooperative

CURRENT MANDATE POSITION
Resistant

REASON
Opposes independent monitoring.
```

---

# 40. Coalition Negotiation

A strategic consultation/negotiation may:

- seek current position;
- attempt persuasion;
- revise scope;
- make commitment;
- offer institutional role;
- negotiate monitoring;
- address a known concern.

One coherent negotiated package is one strategic decision.

---

# 41. Negotiation Input

v1 uses structured authoritative options.

The player may configure:

- terms;
- commitments;
- scope;
- role;
- resources;

within the authored decision.

AI may render actor dialogue after the semantic outcome is resolved.

Free-form chat does not directly alter simulation state in v1.

---

# 42. Diplomacy Anti-Spam

Repeated identical engagement should not be the dominant strategy.

Scenario content must use one or more:

```text
cooldown
diminishing returns
new-evidence requirement
changed-term requirement
actor fatigue
increased political cost
```

---

# 43. Commitments

Commitments show:

```text
PROMISE
PARTIES
CREATED
DUE
CONDITIONS
STATUS
```

Statuses:

```text
ACTIVE
FULFILLED
BREACHED
WAIVED
EXPIRED
```

---

# 44. Commitment Feasibility

### Structurally impossible

Blocked.

### Politically conflicting

Allowed with warning.

### Strategically risky

Allowed if otherwise legal.

The game may permit the player to create a dangerous contradiction.

It should make known conflicts understandable before commitment.

---

# 45. Commitment Consequences

Honoring can affect:

- trust;
- credibility;
- coalition cohesion;
- partner confidence.

Breaching can create:

- memory;
- dispute;
- future conditions;
- resistance.

Commitments exist to return later.

---

# 46. Red Lines

Player knowledge categories:

```text
KNOWN
SUSPECTED
UNKNOWN
```

Unknown red lines are not shown.

---

# 47. Red-Line Fairness

A severe hidden red line SHOULD normally have at least one discoverable signal before first violation.

Possible signals:

- actor priority;
- earlier statement;
- consultation;
- intelligence gap;
- known dispute;
- historical scenario context.

If intentionally unknowable, first impact should usually create new information rather than instant campaign destruction.

---

# 48. Authorization

Authorization is an active strategic process.

While pending, the player can:

- lobby;
- consult;
- fulfill conditions;
- revise scope;
- offer commitments;
- withdraw;
- respond to new evidence.

The world continues.

---

# 49. Authorization States

```text
NOT REQUESTED
PENDING
AUTHORIZED
CONDITIONALLY AUTHORIZED
REJECTED
EXPIRED
REVOKED
```

---

# 50. Conditional Authorization

Conditional authorization can modify:

- geography;
- objective;
- implementation party;
- monitoring requirements;
- resource ceiling;
- duration;
- reporting.

This is a source of mandate distortion.

---

# 51. Mandate Distortion

The player should consciously encounter:

> **Is an altered mandate better than no mandate?**

Distortion is politically produced, not random flavor.

---

# 52. Outcome Dimensions

Outcomes are described independently.

## Delivery

```text
FULL
PARTIAL
MINIMAL
FAILED
```

## Integrity

```text
INTACT
DISTORTED
```

## Net impact

```text
POSITIVE
MIXED
NEGATIVE
COUNTERPRODUCTIVE
```

The primary UI should explain these rather than presenting a single score.

---

# 53. Implementation

Authorization creates the possibility of implementation.

Implementation depends on:

- resources;
- allocated capacity;
- partner cooperation;
- host access;
- logistics;
- disruption;
- portfolio load.

---

# 54. Implementation Decisions

Launch includes initial allocation.

Routine execution then progresses automatically.

A new strategic decision is required for material player-initiated change such as:

- major capacity reallocation;
- scope revision;
- partner change;
- suspension;
- restructuring.

No maintenance-click spam.

---

# 55. Implementation Milestones

Milestones provide:

- progress feedback;
- state change;
- evidence;
- political reaction.

A milestone may produce consequences without asking the player to click “continue.”

---

# 56. Mandate Portfolio

The player may hold several active cases/implementations.

No arbitrary hard cap is required in v1 unless scenario-specific.

Capacity creates a soft cap.

---

# 57. Workload State

Player-facing workload bands:

```text
AVAILABLE
MANAGEABLE
STRAINED
OVEREXTENDED
```

The player can inspect:

- capacity consumption;
- vulnerable projects;
- effect of releasing resources.

---

# 58. Capacity Classes

## Spend / recover

**Political capital**

## Allocate / release

**Secretariat capacity**  
**Implementation capacity**

## Derived political conditions

**Member-state alignment**  
**Partner confidence**

## Information-system condition

**Intelligence confidence**

## Institutional authority condition

Internally `mandateAuthority`; player-facing term:

**Institutional Authority**

Exact regeneration/derivation formulas belong in Scenario/Balance.

---

# 59. Institutional Authority versus Authorization

**Institutional Authority**

Global capacity describing the envoy's room to initiate/coordinate action.

**Authorization**

Case-specific permission for one mandate.

These terms MUST remain distinct in player copy.

---

# 60. Material Resources

Where relevant:

```text
BUDGET
PERSONNEL
LOGISTICS
```

These support implementation.

They should not become the game's primary fantasy.

---

# 61. Relationship Model

Player-relevant relationship dimensions:

```text
TRUST
STRATEGIC ALIGNMENT
DEPENDENCE
LEVERAGE
ACCESS
CREDIBILITY
COMMITMENTS
DISPUTES
```

The primary experience is qualitative/contextual, not a friendship score.

Exact visibility remains OQ-G3.

---

# 62. Actor Positions

Positions are issue-specific.

The player can know them as:

```text
KNOWN
ESTIMATED
UNCLEAR
```

A position may change more quickly than the underlying relationship.

---

# 63. Actor Memory

Actors remember consequential interactions.

Memory is surfaced through:

- later reaction;
- changed bargaining terms;
- dialogue callbacks;
- disputes;
- credibility;
- commitment enforcement.

Do not make a raw “memory points” mechanic.

---

# 64. Immediate Reaction versus Monthly Adaptation

## Immediate reaction

Direct consequence of one decision.

Example:

```text
Actor accepts commitment.
Trust rises.
Mandate position changes.
```

## Monthly adaptation

Broader reassessment based on:

- world changes;
- memories;
- other actors;
- new evidence;
- active disputes.

The same effect is not applied twice.

---

# 65. External Actor Strategy

External powers and institutions act from:

- priorities;
- capabilities;
- leverage;
- relationships;
- opportunities;
- active regional conditions.

Variation should remain plausible and interpretable.

---

# 66. Strategic Doctrine

Doctrine emerges from behavior.

Axes:

```text
REACTIVE ←→ PREVENTIVE

COALITION/REC-LED ←→ AU-CENTRALIZED

SECURITY-LED ←→ INSTITUTION/DEVELOPMENT-LED

PRESSURE/COERCION ←→ CONSENSUS/NEGOTIATION
```

These are descriptive strategy dimensions, not political rankings.

---

# 67. Doctrine Review Timing

Default:

```text
Month 4 resolves
↓
Month 5 begins
↓
Doctrine Review becomes available
```

Codification consumes one Month 5 strategic decision.

If declined, observation continues.

---

# 68. Doctrine Review Choices

Review shows:

- observed behavior;
- recommended compatible doctrine;
- where supported, adjacent compatible doctrine options;
- remain uncodified.

The player cannot select a completely contradictory doctrine merely for its modifier.

---

# 69. Doctrine Tradeoffs

Every codified doctrine must include:

- at least one strategic advantage;
- at least one constraint or vulnerability.

No pure buff doctrine.

---

# 70. World Event Families

```text
ANCHOR
SYSTEMIC
CALLBACK
AMBIENT
```

---

# 71. Anchor Events

Authored major scenario developments.

State may:

- prevent;
- alter;
- accelerate;
- delay;
- change severity.

They must not erase player agency.

---

# 72. Systemic Events

Generated from state interactions.

They provide replay variation without rewriting baseline facts.

---

# 73. Callback Events

Explicitly connect later developments to prior:

- decisions;
- mandates;
- commitments;
- distortions;
- neglected gaps.

Callbacks are a signature responsiveness tool.

---

# 74. Ambient Events

Ambient changes appear without demanding a modal.

Examples:

- intelligence feed;
- map;
- monthly brief;
- dossier.

---

# 75. Event and Attention Pacing

Typical month target:

```text
2–4 new serious candidates
+
ongoing portfolio/relationship/commitment demands
+
background updates
```

Typical interruptive event target:

```text
0–1
```

Critical cascades may exceed this.

The player should frequently but not always have more worthwhile actions than three slots.

Quiet months are valid.

---

# 76. Persistent Attention

Unresolved situations do not disappear because the month changed.

They may:

- escalate;
- stabilize;
- expire;
- transform;
- resolve independently.

The attention queue represents the current strategic workload.

---

# 77. Decision-Required Items

Use only when explicit player choice is essential.

Known mandatory responses reserve strategic-decision capacity.

Ignoring ordinary crises remains legal.

---

# 78. Inaction

Not acting is a valid strategy.

Possible consequences:

- deterioration;
- expiration;
- actor self-action;
- external actor intervention;
- higher later cost.

The game does not require every problem to be solved.

---

# 79. Opportunities

Attention includes positive windows.

Examples:

- temporary coalition;
- funding window;
- mediation opening;
- intelligence access;
- reform opportunity;
- development opening.

Opportunities often expire.

---

# 80. Strategic Map

The map is a **strategic intelligence surface**.

It answers:

```text
Where are pressures converging?

What strategic assets are exposed?

Which corridors matter?

Where are cross-border effects?

Where is information weak?

What changed geographically?
```

It is not the sole command interface.

---

# 81. Data-to-Decision Rule

Every primary data layer must answer:

> **What strategic decision can this change?**

If none:

- aggregate;
- demote to reference;
- omit from primary gameplay.

---

# 82. Map Layer Questions

## Conflict

> Where is violence/escalation/humanitarian pressure concentrated?

## Power / infrastructure

> Which economically or politically important assets are exposed?

## Pipelines / corridors

> Where can disruption create broader fiscal or geopolitical effects?

## Connectivity

> Where are network dependencies?

## Development

> Where are implementation opportunities, bottlenecks, or external dependencies?

---

# 83. Dossier

Selected entity dossier answers:

```text
WHAT IS THIS?

WHY DOES IT MATTER?

WHAT CHANGED?

WHAT DO WE KNOW?

HOW CONFIDENT ARE WE?

WHAT IS CONTESTED?

WHO MATTERS?

WHAT CAN I DO?

WHAT MIGHT HAPPEN?

WHAT REMAINS UNKNOWN?
```

---

# 84. Briefing

Major decision brief:

```text
SITUATION

ASSESSMENT

CONFIDENCE

INSTITUTIONAL POSITION

OPTIONS

RISKS

UNKNOWNS

DECISION
```

A briefing is an instrument for choice.

---

# 85. Causality Explanation

Player-facing explanation must remain knowledge-limited.

May state known causes:

```text
Host-government access restriction delayed deployment.
```

May state uncertainty:

```text
Additional political resistance is suspected but not verified.
```

Must not expose hidden simulation truth as fact.

---

# 86. Consequence Design

Major interventions should create multi-system effects.

Examples:

```text
faster delivery
but
greater dependence

security improvement
but
legitimacy cost

broader support
but
narrower scope
```

---

# 87. Consequence Fairness

Unexpected outcomes must be retrospectively understandable.

Potential basis:

- known risk;
- ignored gap;
- actor priority;
- red-line signal;
- institutional compromise;
- world-system interaction.

Avoid arbitrary punishment.

---

# 88. Consequence Timing

## Immediate

Decision acknowledgement and direct institutional effects.

## Operational

Implementation/project effects over subsequent months.

## Strategic

Longer second-order changes and callbacks.

Exact timing is Scenario/Balance.

---

# 89. Monthly Resolution

End Month resolves:

- due consequences;
- commitments;
- authorization;
- implementations;
- actor adaptation;
- world systems;
- world events;
- new evidence;
- attention.

Player receives concise outcome summary.

---

# 90. Resolution Presentation

Organize into:

```text
IMPLEMENTATION

INSTITUTIONS

REGIONAL CONDITIONS

INTELLIGENCE

WATCH
```

Focus on changes relevant to future decisions.

---

# 91. Decision Journal

Journal records known factual history:

- adopted assessments;
- consultations;
- commitments;
- mandate milestones;
- authorizations;
- implementations;
- explicit consequences once known.

It must not reveal hidden causal factors before the player learns them.

---

# 92. Replayability

Variation primarily comes from:

- actor strategy;
- event timing;
- hidden conditions;
- consequences;
- doctrine;
- player decisions.

Observed baseline facts remain fixed for a baseline version.

---

# 93. Campaign Seed

Seed governs deterministic uncertainty.

It may be shown after campaign completion for:

- reproducibility;
- challenge sharing;
- debugging.

Normal campaigns may use generated seeds. Verified leaderboard challenge campaigns use an explicitly shared challenge seed so all ranked players face identical deterministic uncertainty.

---

# 94. Difficulty

```text
NARRATIVE
STANDARD
EXPERT
```

Difficulty is fixed when the campaign is created.

---

# 95. Narrative Difficulty

Adjusts:

- evidence clarity;
- escalation pacing;
- hidden institutional risk;
- implementation tolerance;
- causal explanation.

It preserves the Mandate Chain.

---

# 96. Standard Difficulty

Canonical intended experience.

---

# 97. Expert Difficulty

Uses:

- more contradiction;
- faster uncertainty decay;
- stronger adaptation;
- narrower political windows;
- less causal handholding.

It does not simply make every number worse.

---

# 98. Baseline Truth and Difficulty

Difficulty does not rewrite observed historical baseline facts.

It changes the simulated information/friction environment.

---

# 99. Onboarding Philosophy

Teach:

> **how to think like the envoy.**

Not merely:

> **where the button is.**

---

# 100. First 15 Minutes

## 0–2 minutes — Mandate Charter

Player learns:

- role;
- duration;
- priorities;
- three decisions per month;
- real-data baseline / simulated future distinction.

## 2–5 minutes — Strategic situation

Player sees:

- map;
- one priority;
- background developments.

## 5–8 minutes — Intelligence dossier

Player sees:

- evidence;
- contradiction;
- confidence;
- a gap.

## 8–12 minutes — First strategic action

Player commits a meaningful action.

## 12–15 minutes — End Month

Player sees:

- world progression;
- delayed processes;
- actor reaction.

---

# 101. First Two-Month Learning Guarantee

Regardless of first-choice branch, guided first campaign MUST demonstrate by the end of Month 2:

```text
one intelligence gap
one delayed information process
one contradictory source
one strategic decision consumed
one institutional reaction
one world change at month resolution
```

---

# 102. Guided First Campaign

Guidance may explain mechanics and uncertainty.

Good:

```text
This assessment is contested.
Review the contradictory evidence before adopting it.
```

Bad:

```text
Choose the security option.
```

Guidance informs rather than makes the political decision.

---

# 103. Tutorial Failure Protection

Narrative difficulty and guided early turns SHOULD avoid campaign-ending failure from a single poorly understood decision.

They may still produce meaningful cost.

---

# 104. Failure

Early termination is exceptional.

Campaign-threatening decline should normally show:

- warning;
- worsening trajectory;
- opportunity for response.

Sudden catastrophe must be grounded in visible risk or an explicitly authored extraordinary shock.

---

# 105. Campaign Completion

Most campaigns should reach Month 20.

Completion does not imply success.

---

# 106. End-of-Mandate Evaluation

Dimensions:

```text
SECURITY

CIVILIAN OUTCOMES

REGIONAL STABILITY

INSTITUTIONAL COHESION

LEGITIMACY

MANDATE SUSTAINABILITY
```

Scenario priorities from the Mandate Charter contextualize these dimensions.

No required single overall score.

---

# 107. Evaluation Detail

Each dimension should communicate:

- starting condition;
- ending condition;
- trajectory;
- critical periods;
- important player contributions;
- unresolved risk.

---

# 108. End-of-Mandate Causal Review

Show selected causal chains:

```text
DECISION
↓
INSTITUTIONAL EFFECT
↓
IMPLEMENTATION
↓
CONSEQUENCE
↓
FINAL CONDITION
```

Only player-known facts are stated as factual in the primary review.

---

# 109. Primary Review Epistemic Boundary

The primary review remains an institutional/player-knowledge product.

It does not automatically reveal:

- all hidden red lines;
- hidden actor intent;
- unobserved true world state.

A future separately labeled **Simulation Debrief** may reveal model truth.

It is not required for v1.

---

# 110. No Correct-Answer Verdict

Do not state:

```text
The correct policy was X.
```

Evaluate:

- consequences;
- sustainability;
- coherence;
- credibility;
- adaptation;
- scenario priorities.

---

# 111. AI Narrative Role

AI may render:

- actor response;
- cable;
- report summary;
- monthly brief;
- after-action prose;
- final narrative.

AI receives already decided semantic state.

---

# 112. Structured Negotiation and AI

Player chooses authoritative terms through structured game UI.

AI renders the resulting actor voice.

Free-form natural-language player negotiation is not authoritative gameplay in v1.

---

# 113. AI Failure

Fallback text appears.

No game state changes.

No strategic decision is lost because a model failed.

---

# 114. Verified Leaderboard Experience

The leaderboard is a competitive game surface built on deterministic replay.

It MUST NOT replace the End-of-Mandate Review.

A player should first understand:

```text
what happened
why it happened
what tradeoffs they made
```

and only then compare game performance.

## 114.1 Ranked comparison cohort

Ranked players must share:

```text
scenario
baseline
simulation model
balance profile
challenge seed
difficulty
```

## 114.2 Score meaning

The leaderboard composite is:

> a scenario-specific **game performance score**

It is not presented as a universal evaluation of real governance quality.

## 114.3 Verification state

Leaderboard entries should visibly distinguish:

```text
VERIFIED
REJECTED / INVALID
```

Unverified local campaigns do not appear on the ranked public board.

## 114.4 Dimension views

The interface SHOULD permit comparison by the six evaluation dimensions in addition to the overall composite.

This preserves the multidimensional character of African Mandate.

---

# 115. Narrative Tone

Writing should be:

- institutional;
- restrained;
- specific;
- concise;
- credible.

Avoid:

- sensationalism;
- cinematic villain speech;
- generic AI marketing prose;
- policy moralizing unsupported by the game model.

---

# 116. Political and Institutional Neutrality

Real political actors/institutions are represented through:

- roles;
- interests;
- constraints;
- documented scenario context;
- relationships;
- modeled decisions.

Do not encode unexplained partisan/moral labels into mechanics.

Outcome evaluation refers to explicit scenario dimensions, not partisan preference.

---

# 117. Sensitive Real-World Framing

The game MUST distinguish:

```text
OBSERVED BASELINE
SIMULATED STATE
PLAYER ASSESSMENT
FICTIONAL FUTURE EVENT
AI-RENDERED PROSE
```

Simulated future outcomes are not forecasts.

AI cannot invent new real evidence.

---

# 118. Development Gameplay

Development actions can create:

- resilience;
- dependency;
- fiscal pressure;
- bottlenecks;
- strategic assets;
- political visibility;
- target exposure.

They are not merely “peaceful actions.”

---

# 119. Infrastructure Gameplay

Infrastructure informs:

```text
ECONOMIC RESILIENCE
STRATEGIC LEVERAGE
VULNERABILITY
FISCAL IMPORTANCE
DEVELOPMENT POTENTIAL
TARGET RISK
```

---

# 120. Conflict Gameplay

Conflict influences:

- escalation;
- humanitarian pressure;
- mission risk;
- spillover;
- actor behavior;
- implementation.

The player shapes conditions institutionally rather than controlling tactical units.

---

# 121. Civilian Outcomes

Civilian conditions include:

- displacement;
- humanitarian access;
- service reliability;
- perceived legitimacy;
- civilian confidence;
- civilian harm when relevant.

Do not reduce civilians to one spendable “support” resource.

---

# 122. Visual Experience Direction

Visual doctrine:

> **Promethean Institutional Intelligence**

Desired:

- minimalist;
- elegant;
- realistic;
- strategically dense;
- legible;
- cohesive.

Not:

- generic SaaS;
- neon military HUD;
- purple/black AI aesthetic;
- glass panels everywhere.

Detailed rules belong in UI/UX Specification.

---

# 123. Motion

Motion explains:

- time;
- mandate progress;
- conflict spread;
- infrastructure disruption;
- state transition;
- attention escalation.

No decorative motion.

---

# 124. Sound

Sound reinforces:

- commitment;
- priority;
- authorization;
- milestone;
- time advance;
- critical institutional change.

Avoid arcade/casino reward language.

---

# 125. Non-Ideal In-World States

Examples:

```text
INTELLIGENCE GAP
ASSESSMENT CONTESTED
REPORTING STALE
LOW CONFIDENCE
FIELD REPORTING PENDING
AUTHORIZATION DELAYED
IMPLEMENTATION BLOCKED
COMMITMENT AT RISK
PORTFOLIO OVEREXTENDED
```

---

# 126. Technical Failure Separation

Software failure is not roleplay.

Technical failure uses explicit technical language.

---

# 127. Information Overload Rule

The player should not win by reading every available datum.

Main interface prioritizes:

```text
WHAT MATTERS
WHAT CHANGED
WHAT CAN I DO
```

Depth remains available.

---

# 128. Complexity Layers

## Layer 1

```text
What matters?
What changed?
What can I do?
```

## Layer 2

```text
Why?
Who matters?
What evidence exists?
```

## Layer 3

```text
detailed data
methodology
decision history
source detail
```

---

# 129. Campaign Resume

Resume brief:

```text
CURRENT MONTH
MANDATE PRIORITIES
ACTIVE MANDATES
UNRESOLVED PRIORITIES
RECENT DECISIONS
UPCOMING COMMITMENTS / DEADLINES
```

---

# 130. Decision Variety

Desired verbs:

```text
INVESTIGATE
ASSESS
CONSULT
NEGOTIATE
COMMIT
ESCALATE
AUTHORIZE
IMPLEMENT
REVISE
PRIORITIZE
DEFER
SUSPEND
```

Avoid repetitive resource sliders as the main form of choice.

---

# 131. Strategic Choice Quality

A good decision includes:

1. meaningful objective;
2. plausible alternatives;
3. opportunity cost;
4. incomplete certainty;
5. institutional consequence;
6. future ramifications.

---

# 132. False Choice Prohibition

Avoid one obviously correct option unless prior player preparation legitimately created dominance.

---

# 133. Inaction

Inaction is legal.

It does not freeze conditions.

---

# 134. Reversibility

Decisions are classified:

```text
REVERSIBLE
COSTLY TO REVERSE
EFFECTIVELY IRREVERSIBLE
```

Where knowable, preview communicates this.

---

# 135. Crisis Design

A crisis should normally create at least two competing pressures.

Examples:

```text
SECURITY URGENCY
vs
LEGITIMACY

HUMANITARIAN ACCESS
vs
HOST COOPERATION
```

---

# 136. Opportunity Design

Not all strategic attention is negative.

Opportunities create:

- preparation;
- coalition opening;
- investment;
- information access;
- reform.

---

# 137. Recovery and Adaptation

Poor decisions usually create recoverable strategic damage rather than instant defeat.

Recovery may require:

- decisions;
- time;
- political capital;
- opportunity cost.

---

# 138. Snowball Control

Positive momentum should not eliminate tradeoffs.

Negative momentum should not automatically become hopeless.

Use:

- diminishing returns;
- institutional capacity;
- counter-reactions;
- new opportunities.

---

# 139. Strategic Quiet

Some quieter months are valuable.

They support:

- repair;
- intelligence;
- institution building;
- long-term planning.

Do not equate engagement with constant crisis.

---

# 140. Final Phase and Unfinished Work

Late campaign should emphasize sustainability.

An unfinished implementation is not automatically failure.

Evaluation considers:

- trajectory;
- credibility;
- sustainability;
- unresolved risk.

---

# 141. End Narrative

Final narrative synthesizes:

- Mandate Charter priorities;
- doctrine;
- mandates;
- relationships;
- commitments;
- consequences;
- unresolved risks.

AI may render prose.

Evaluation remains deterministic.

---

# 142. Content Authoring Contract for Major Decisions

Every major strategic action must define/design:

```text
PLAYER QUESTION

DECISION FAMILY

AUTHORITY REQUIREMENT

TARGET

KNOWN COSTS

EVIDENCE BASIS

KNOWN RISKS

IMPORTANT UNKNOWNS

REVERSIBILITY

IMMEDIATE RESPONSE

INSTITUTIONAL REACTION

IMPLEMENTATION PATH

POSSIBLE OPERATIONAL CONSEQUENCES

POSSIBLE STRATEGIC CONSEQUENCES

CALLBACK HOOKS

DOCTRINE SIGNAL
```

This does not require a bespoke event for every field.

It requires the content designer to account for each dimension.

---

# 143. Content Authoring Contract for Major Situations

Every major crisis/opportunity should define:

```text
WHY IT MATTERS

WHAT THE PLAYER CAN KNOW

WHAT REMAINS HIDDEN

WHAT HAPPENS IF IGNORED

WHAT ACTION FAMILIES CAN ADDRESS IT

WHAT OTHER SYSTEMS IT TOUCHES

HOW IT CAN ESCALATE / RESOLVE / TRANSFORM

WHAT CALLBACKS IT CAN PRODUCE
```

---

# 144. Balance Philosophy

Balance should produce:

- difficult prioritization;
- multiple viable strategies;
- understandable failure;
- meaningful uncertainty;
- recovery opportunities;
- path dependence.

Avoid:

- one dominant doctrine;
- one dominant action family;
- mandatory response to every event;
- identical end states.

---

# 145. Playtest Learning Goals

By end of Phase I:

```text
information is uncertain
sources conflict
assessment matters
decisions are scarce
```

By end of Phase II:

```text
relationship ≠ issue position
coalitions have terms
authorization can distort scope
commitments matter
```

By end of Phase III:

```text
implementation is capacity-constrained
systems interact
delayed consequences exist
```

By end:

```text
strategy is path-dependent
institutional legitimacy matters
delivery and sustainability differ
```

---

# 146. Design Acceptance Criteria

A strong vertical-slice playtest should answer yes to most:

```text
Did I know what deserved attention?

Did I understand my campaign priorities?

Did the map help my reasoning?

Did uncertainty matter?

Did sources meaningfully disagree?

Did intelligence tasking feel useful without revealing truth?

Did assessment adoption feel consequential?

Did confidence choice matter?

Did coalition-building require tradeoffs?

Did authorization feel active rather than passive?

Did the game prevent diplomacy spam?

Did I have more useful possibilities than available decisions?

Did the world acknowledge my choices?

Did actors remember me?

Did implementation progress without maintenance clicking?

Did delayed consequences connect to earlier choices?

Did causality remain understandable without omniscience?

Could I recover from mistakes?

Did the end review explain my path rather than grade my politics?
```

---

# 147. Definition of a Good Turn

A good turn contains:

1. clear strategic priorities;
2. meaningful uncertainty;
3. at least one opportunity cost;
4. institutional tradeoff;
5. immediate acknowledgement;
6. evidence that past choices matter;
7. anticipation of future consequences.

Not every turn needs a crisis.

---

# 148. Definition of a Good Decision

The player should be able to say:

```text
I know why this matters.

I understand what I am trying to achieve.

I know the authority burden.

I know enough to act, but not everything.

I understand the known cost.

I know who may resist.

I cannot know the outcome with certainty.

I can explain why I chose it.
```

---

# 149. Stakeholder Decisions Locked for v1

The following previously open questions are now approved design decisions.

## 149.1 Campaign playtime

Target full-campaign playtime:

```text
3–5 hours
```

The 20-turn structure remains unchanged.

Content density, briefing length, event volume, and reading burden SHOULD be tuned to keep a typical first complete campaign inside this range.

---

## 149.2 Player identity

v1 uses a **role-centered identity with light customization**.

The player remains institutionally defined first as:

```text
AU Strategic Envoy
```

Light personalization MAY include a player-entered display identity where appropriate, but it MUST NOT change authoritative simulation mechanics.

The exact editable identity fields belong in the UI/UX specification.

The game does not use a heavily authored protagonist in v1.

---

## 149.3 Numeric visibility

Default player experience:

```text
QUALITATIVE / TREND-BASED
```

for uncertain external conditions.

Exact values are appropriate for:

- player-owned budget;
- personnel;
- strategic decisions remaining;
- formal mandate restrictions;
- known deadlines;
- implementation milestones;
- other directly knowable procedural/resource states.

Actor attitudes, regional pressures, intelligence-derived conditions, and uncertain political states SHOULD normally use:

- bands;
- trends;
- confidence;
- explanatory context.

A separate analyst-detail mode is not required for v1.

---

## 149.4 Campaign forks

Formal player-facing counterfactual campaign forks are **deferred from v1**.

The technical replay infrastructure remains.

Players cannot normally fork from arbitrary prior revisions as a standard campaign feature.

---

## 149.5 Save / rollback philosophy

v1 uses a **rolling campaign save**.

Rules:

- autosave after each committed strategic decision;
- autosave after End Month;
- manual “save now” MAY exist but saves the current authoritative revision;
- no normal player-facing rollback to earlier strategic revisions;
- technical recovery snapshots remain hidden from ordinary gameplay and exist only for corruption/failure recovery.

This reinforces consequence ownership.

---

## 149.6 Integrity / corruption

v1 does **not** introduce a dedicated global corruption/integrity meter.

Integrity-related gameplay is modeled through existing systems:

- implementation risk;
- oversight conditions;
- commitments;
- disputes;
- legitimacy;
- actor memory;
- partner confidence;
- authored/systemic events.

A dedicated integrity aggregate may be added only if Sahel scenario design demonstrates repeated gameplay that cannot be represented cleanly through the existing model.

---

## 149.7 Leaderboard

African Mandate v1 includes a **verified leaderboard**.

The leaderboard ranks player campaign performance as a game system. It does not claim that the highest-scoring strategy is the objectively correct real-world policy.

Leaderboard comparison MUST be constrained to campaigns with identical competitive conditions:

```text
scenario
baseline version
simulation model version
balance profile version
campaign seed or challenge seed
difficulty
```

Campaigns outside the same comparison cohort MUST NOT be placed in the same ranked table.

### Verification

A leaderboard submission is accepted only after deterministic server-side replay verification.

Submission contains the authoritative replay inputs required to reconstruct the campaign.

The verification service:

```text
loads exact pinned artifacts
→ replays the submitted command history
→ confirms final authoritative state hash
→ recomputes leaderboard result
→ accepts or rejects submission
```

The client MUST NOT be trusted to submit an authoritative final score.

### Ranking philosophy

The leaderboard MUST remain subordinate to the multidimensional End-of-Mandate Review.

The primary leaderboard may use a scenario-defined composite **Mandate Performance Score**, but:

- its formula MUST be documented in the Sahel Scenario Specification;
- its dimensions MUST come from the established deterministic campaign evaluation system;
- it MUST NOT introduce hidden political/moral judgments outside the scenario's published evaluation framework;
- individual evaluation-dimension views SHOULD remain available so the composite does not replace the richer campaign assessment.

### Recommended leaderboard views

```text
OVERALL MANDATE PERFORMANCE
SECURITY
CIVILIAN OUTCOMES
REGIONAL STABILITY
INSTITUTIONAL COHESION
LEGITIMACY
MANDATE SUSTAINABILITY
```

### Completion rules

Only campaigns that satisfy the leaderboard mode's completion rules are ranked.

Early-terminated campaigns MAY appear in a separate completed/terminated history but SHOULD NOT be mixed into the primary completed-campaign ranking unless the Scenario Specification explicitly defines a comparable score.

### Player identity and privacy

The leaderboard should display a player-selected public display name or pseudonym rather than requiring real-world identity.

Account/privacy requirements belong in the UI/UX, Privacy, and Technical specifications.

### Challenge comparability

The recommended public competitive format is a **shared challenge seed**.

This creates meaningful comparison because players face the same deterministic uncertainty environment while making different decisions.

The product MAY also provide personal/unranked campaign history for arbitrary seeds.

---

# 150. Remaining Open Game-Design Questions

Most v1 product-level questions are now resolved.

The remaining leaderboard-specific design values belong to the **Sahel Scenario Specification**, not this generic Game Design Specification:

## 150.1 Sahel leaderboard composite formula

The Sahel Scenario Specification MUST define:

- which established evaluation dimensions contribute to the composite Mandate Performance Score;
- their weights;
- any completion modifier;
- tie-break ordering;
- whether early termination can receive a ranked composite.

### Recommended approach

Use a transparent weighted composite built only from:

```text
SECURITY
CIVILIAN OUTCOMES
REGIONAL STABILITY
INSTITUTIONAL COHESION
LEGITIMACY
MANDATE SUSTAINABILITY
```

Do not add opaque hidden bonus categories solely for leaderboard ranking.

The exact weights should reflect the Sahel Mandate Charter and therefore cannot be responsibly fixed until that scenario document is written.

---

## 150.2 Public leaderboard cadence

The product must later decide whether public challenge leaderboards are:

- permanent per seed;
- weekly;
- monthly;
- scenario-season based.

### Recommendation

Start with **scenario challenge boards** tied to an explicitly published seed and version set. Add rotating cadence only after observing actual player participation.

---

# 151. Deferred Features Requiring Future Specification

Not part of v1 authoritative gameplay:

```text
free-form LLM negotiation
real-time multiplayer
continent-wide first campaign
tactical military unit control
full campaign counterfactual laboratory
simulation-truth debrief
```

They may be revisited later.

---

# Appendix A — Core Gameplay Loop

```text
MONTH START
   ↓
MANDATE / STRATEGIC BRIEF
   ↓
FREE INSPECTION
   ↓
DECISION
   ↓
IMMEDIATE REACTION
   ↓
INSPECT / REASSESS
   ↓
DECISION
   ↓
IMMEDIATE REACTION
   ↓
INSPECT / REASSESS
   ↓
DECISION
   ↓
IMMEDIATE REACTION
   ↓
END MONTH
   ↓
WORLD / ACTOR / IMPLEMENTATION RESOLUTION
   ↓
NEW EVIDENCE
   ↓
NEXT MONTH
```

---

# Appendix B — Mandate Chain

```text
EVIDENCE
   ↓
ASSESSMENT
   ↓
ESCALATE TO MANDATE CASE
   ↓
COALITION
   ↓
AUTHORIZATION
   ↓
IMPLEMENTATION
   ↓
OUTCOME
   ↓
NEW EVIDENCE
```

Not every action requires the full chain.

---

# Appendix C — Decision Cost versus Authority Requirement

These are independent.

| Example | Strategic decision? | Authority requirement |
|---|---:|---|
| Read report | No | None |
| Review known actor position | No | None |
| Task intelligence | Yes | No formal mandate |
| Adopt assessment | Yes | Assessment action |
| Strategic consultation | Yes | Usually no formal mandate |
| Open mandate case | Yes | Adopted assessment |
| Coalition negotiation | Yes | Active mandate case |
| Seek authorization | Yes | Required coalition/procedure state |
| Launch implementation | Yes | Appropriate authorization |
| End Month | No slot | Advances time |

---

# Appendix D — Experience Responsiveness Contract

| Layer | Design question |
|---|---|
| Acknowledgement | Did the world register what I did? |
| Institutional reaction | Who responded and why? |
| Visible change | What formal/state change can I see? |
| Information environment | Did this eventually change what can be known? |
| Implementation | Is the decision actually being carried out? |
| Delayed consequence | What happened later? |
| Future reference | Does the world remember the decision? |

A major action should normally touch at least four layers.

---

# Appendix E — Strategic Decision Families

| Family | Typical decisions |
|---|---|
| Intelligence | Task collection, change collection approach |
| Assessment | Adopt, revise, withdraw assessment |
| Diplomacy | Consult, negotiate, commit |
| Mandate | Escalate assessment, revise mandate scope |
| Authorization | Seek/renew/withdraw authorization |
| Implementation | Launch, reallocate, restructure, suspend |
| Crisis / Strategic Response | Respond to emergent crisis/opportunity |

---

# Appendix F — Campaign Phase Summary

| Turns | Phase | Core question |
|---:|---|---|
| 1–4 | Orientation & Diagnosis | What is actually happening? |
| 5–8 | Coalition & Mandate Formation | Who will support action, and on what terms? |
| 9–12 | Implementation & Competition | Can the mandate deliver? |
| 13–16 | Consequence & Institutional Strain | What did earlier choices set in motion? |
| 17–20 | Consolidation & Legacy | What will endure? |

---

# Appendix G — Gameplay Guardrails for Coding and Content Agents

```md
## AFRICAN MANDATE GAMEPLAY GUARDRAILS

- The player is an intelligence-informed AU institutional strategist, not an omnipotent commander.
- The scenario must provide a clear Mandate Charter.
- Three strategic decisions per month are a fixed v1 scarcity constraint.
- Inspection, reading, and drafting are free.
- Decision cost and mandate/authorization requirement are separate concepts.
- One decision is one coherent strategic engagement, not every UI sub-step.
- Do not leak hidden truth through action availability, previews, dossiers, or causality text.
- Authoritative assessments are structured in v1.
- Known contradictory evidence cannot be hidden from the assessment workspace.
- Intelligence tasking produces evidence later; it does not purchase truth.
- Do not make every action require a formal mandate.
- Opening/escalating a mandate case is consequential.
- Coalition positions are issue-specific and distinct from general relationships.
- Avoid diplomacy spam through cooldowns, changed-context requirements, or diminishing returns.
- Unknown red lines need fair discoverability/signaling.
- Authorization must remain strategically interactive while pending.
- Implementation progresses automatically unless the player materially changes it.
- Portfolio overload is a soft strategic constraint and must be legible.
- Actor immediate reactions and monthly adaptation are separate.
- Actor memory must surface through later behavior.
- Unexpected consequences must be understandable without revealing hidden truth.
- Blocking decisions must never create an impossible end-turn state.
- Difficulty changes uncertainty/friction more than raw punishment.
- AI renders resolved semantic state; free-form AI chat does not determine authoritative outcomes in v1.
- Real political actors are not assigned unexplained partisan/moral rankings.
- The primary end review remains knowledge-limited and does not reveal all simulation truth.
- The final review explains causal chains and multidimensional outcomes rather than declaring the politically correct choice.
```

---

# Appendix H — Next Documents

1. **`AFRICAN_MANDATE_DATA_AND_METHODOLOGY_SPEC_v1.md`**  
   Defines exact data-source transformations, confidence methods, indicators, provenance, licensing, and baseline methodology.

2. **`AFRICAN_MANDATE_UI_UX_INTERACTION_SPEC_v1.md`**  
   Defines the Promethean Institutional Intelligence interface and exact interactions.

3. **`AFRICAN_MANDATE_SAHEL_SCENARIO_SPEC_v1.md`**  
   Defines the actual Mandate Charter, actor roster, actions, conditions, events, mandate opportunities, balance, and first-campaign content.

4. **`AFRICAN_MANDATE_IMPLEMENTATION_ROADMAP_v1.md`**  
   Converts specifications into epics, implementation order, and acceptance criteria.

---

This is the consolidated **African Mandate Game Design Specification v2.1**.
