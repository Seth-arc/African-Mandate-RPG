# African Mandate — Specification Reconciliation v1.0

**Date:** 2026-10-08  
**Status:** Canonical reconciliation/implementation change notice. Owner approval still required for choices explicitly marked PROPOSED.  
**Inputs:** Domain Model v1.1, Game Design v2.1, Technical Architecture v2, DESIGN_BRIEF v0.1, COMPONENTS v0.1, tokens.css, DESIGN_DECISIONS.md, Writing Standards v2.  
**Precedence:** Domain simulation invariants > Technical implementation > Data & Methodology > Game Design player experience > UI/UX and design brief. New stakeholder decisions in GDS v2.1 §149 supersede earlier open-question commentary, but do not silently supersede domain invariants or technical requirements.

## Reconciliation decision register

| ID | Area | Decision / binding interpretation | Owner | Disposition |
|---|---|---|---|---|
| R-01 | Decision commitment | `Commit` immediately submits one atomic state-changing command, resolves effects, costs one slot where configured, persists, and cannot be reordered or removed. `End Month` resolves background processes, not committed action packages. | Domain/Game Design | LOCKED |
| R-02 | Draft vs action history | An optional **draft decisions tray** may reorder/delete *uncommitted* drafts for planning; it is non-authoritative and cannot reserve future slots. A **committed decision journal** is immutable. Do not use “action queue” for both. | UI/UX | LOCKED semantic rule; draft tray optional |
| R-03 | Player role | Canonical player name: **African Union Strategic Envoy** (short UI: **AU Strategic Envoy**, equivalent in-world office: **AU Special Envoy** only where scenario/voice requires). No gameplay distinction between these labels. | GDS §149.2 | LOCKED |
| R-04 | Campaign | 20 calendar-month turns; 3 consequential decisions per month; 3–5h full campaign; role-first identity with light cosmetic customization; rolling autosave and no normal rollback. | Domain §11, GDS §149 | LOCKED |
| R-05 | Information visibility | Precise values: player-owned resources and knowable formal states. Qualitative bands/trends and confidence: external/political/uncertain states. No analyst-detail requirement for v1. | GDS §149.3 | LOCKED |
| R-06 | Five top-line indicators | Stability, insurgency, civilian support, global legitimacy, regional synergy are **UI candidate aggregates**, not five new writable domain scalars. Any displayed value is a projection derived from domain subsystems and player knowledge with methodology-proven source + uncertainty. Remove them from permanent status strip until the approved formulas and disclosure policies exist. | UI/UX + Methodology | CONDITIONALLY APPROVED for design; exact definitions pending |
| R-07 | Six evaluation dimensions | Security, civilian outcomes, regional stability, institutional cohesion, legitimacy, mandate sustainability remain canonical trajectory-aware evaluation dimensions and must not be conflated with the five UI labels. A mapping crosswalk is required; no global single-score target for normal gameplay. | Domain §§106–108 | LOCKED |
| R-08 | Leaderboard | GDS §149.7 requires verified ranking only within identical comparison cohorts. Add server-side replay verifier, authoritative hashes and score recomputation, and an isolated ranking read model. Simulation cannot be treated as authoritative simply because it ran in browser. | GDS §149.7, architecture addendum | LOCKED requirement; design pending |
| R-09 | Leaderboard formula | Composite weightings/ties/early termination and challenge cadence are owned by Sahel Scenario Spec. No provisional scored rankings may ship. Server ranking data must never be the source of campaign truth. | Scenario | OPEN |
| R-10 | Setting and dates | Simulation turn duration and gameplay loop are settled, but **campaign start year and baseline as-of date are not**. Propose start `2026-10-01` *only after* data cutoffs are approved; do not convert this into fact. | Scenario/Methodology | OPEN |
| R-11 | UI audience and layout | Desktop-first, tablet-landscape-secondary, 1280×720 minimum desktop and 1024×768 tablet are existing proposals, not locked GDS decisions. Verify against supported-browser/benchmark policy and first-playtest. | UI/UX | OPEN |
| R-12 | Identity palettes | Eight faction hues are a temporary presentation palette; actor roster is unrestricted by eight slots. Use emblem/pattern/label for scalable actor identity. | UI/UX | LOCKED constraint |
| R-13 | Source and scenario claims | Real baseline data always distinguishable from invented simulated outcomes; knowledge projections cannot disclose hidden simulation truth; AI is renderer only. | Domain, Writing | LOCKED |

## Decisions no longer open despite stale design-brief labels

- **Turn length:** calendar month, 20 months total.
- **Decision slots:** exactly three per month; no purchase, rollover, doctrine bonuses.
- **Campaign playtime:** target 3–5h; this is not the length of a single sitting.
- **Identity:** AU Strategic Envoy; player identity customization cannot affect simulation mechanics.
- **Rollback:** rolling autosave; edit drafts before commitment, no revision rollback after commitment.
- **Numerical exposure:** qualitative/trend presentation for uncertain external states.
- **Leaderboard inclusion:** yes, but verified server-side with published conditions.
- **Integrity:** no new global corruption meter for v1.

## Detailed action workflow and command ownership

1. Browse map, evidence and dossier (free; player projection only).
2. Choose an action and edit one coherent decision package (free draft, no authoritative side effects).
3. Generate a *knowledge-limited* preview showing known costs, dependencies, legal prerequisites, uncertainty and reversibility.
4. **Commit action** -> application operation lock -> deterministic validation + effect resolution -> durable local write -> replace in-memory state -> create immutable journal/history entry -> refresh projection -> optional cloud sync/narrative.
5. No mutable post-commit action queue; all subsequent new interventions require new commands and normally another slot.
6. **End Month** may occur with unused slots, forfeiting unused slots; it resolves pending consequences, actors, mandates, collection and world dynamics, then generates next-month brief.

**Blocking mandatory responses:** reserve available slots for known mandatory decisions; no same-month impossible blocker after spending last slot. Hidden truth cannot remove known-legitimate actions from the menu. An attempted action may fail after commitment and still consume its slot.

## Five-indicator / six-evaluation crosswalk — methodological design constraints

| UI candidate | Plausible model inputs, not formula | Disclosure restriction | Candidate evaluation connection |
|---|---|---|---|
| Stability | observed/inferred conflict, governance, resilience | Must be knowledge-limited estimate; may be UNKNOWN | Regional stability / security |
| Insurgency | ACLED violence, modeled armed-group activity, contest | Do not label overall conflict as insurgency without event/actor classification and sampling bias | Security |
| Civilian support | evidence about confidence, protection, access and service reliability | Cannot equate displacement count or violence alone with public opinion | Civilian outcomes / legitimacy |
| Global legitimacy | documented institutional reactions, commitments, perceived credibility | External perception is not objectively measured by any attached dataset | Legitimacy / institutional cohesion |
| Regional synergy | intergovernmental cooperation, coalition cohesion, delivery | Not identical to alliance count; may be partly unknowable | Institutional cohesion / mandate sustainability |

**No five-indicator equations are approved.** Until the Methodology Specification passes review, the status strip must show turn/date/remaining decisions/save state and *may show issue-specific known status*, but must not fabricate meter readings.

## Architecture addendum — verified leaderboards

### Separate trust boundary

`Browser Campaign -> immutable replay submission -> authenticated ingestion -> replay validation service -> pinned artifact registry -> deterministic simulation runtime -> recomputed state hash and evaluation -> published cohort ranking`.

The replay service is server-owned, not callable as a client-trusted score setter. Verification MUST: authenticate eligible submitters; verify all required version and artifact hashes; validate command schemas, order and allowed turn/slot usage; recompute state from initial state and campaign seed; compare final authoritative state hash; independently recompute evaluation + composite using *published* scenario ranking rules; reject unverifiable submissions. Use canonical state hashing and deterministic test vectors from Technical Architecture v2. Submit no raw secret token or undocumented external data.

### Required structures

- `LeaderboardCohort`: scenario ID + scenario bundle hash + baseline hash/version + simulation model + balance profile + difficulty + seed/challenge ID + scoring-rule version.
- `ReplaySubmission`: campaign ID, submitter, cohort key, permitted metadata, ordered original commands with IDs, claimed final state hash, no trusted score field.
- `VerificationResult`: accepted/rejected, deterministic reason code, verified final hash, computed dimension scores, verified ranking score, verification model build ID.
- `LeaderboardEntry`: immutable accepted verification reference, public pseudonym, cohort, computed score, tie-break tuple, server timestamp.
- `ChallengeDefinition`: exact seed/artifacts/difficulty, opening/closing dates if any, ranking rules version.

### Required operational controls and tests

- Edge/function runtime must support same deterministic engine code/algorithm and pinned content artifacts as client. If unsuitable for execution limits, choose a dedicated trusted worker; provider choice is open.
- Per-submission CPU/memory/time and replay-size caps; auth+rate limiting; idempotent submission ID; queue for asynchronous validation without blocking gameplay; signed server decision; prevent replay of already accepted campaign as multiple entries unless rules permit.
- Test altered client score, altered history, invalid command, alternate seed, wrong model or artifact, hash mismatch, truncated history, command replay determinism, concurrent submissions, eligibility/termination/tie rules.
- No ranking API route that accepts client-calculated scores. Never expose hidden truth in public leaderboard entries.

**Architecture versioning note:** this addendum changes the earlier Domain v1.1 v1-non-goal of authoritative leaderboards into a bounded exception requiring trusted replay; update Domain and Technical Architecture through a versioned ADR/spec revision prior to implementation. It does **not** redefine their core state semantics.

## Implementation conformance tests

- Preview and drafting do not alter campaign revision, budget, slot count, actor positions or RNG.
- Commit changes state/persists immediately; last committed item cannot be removed or reordered.
- An `End Month` call with one remaining slot forfeits it, without replaying committed actions.
- UI imports cannot access hidden simulation state or private causal explanation.
- Five candidate indicators do not appear with fabricated numerical values on initial screen.
- Two different leaderboard cohorts never share one ranked table.

## Open approvals (not secretly resolved)

Campaign starting year; Sahel geography and zone topology; indicator scope/weights and missingness thresholds; cohort and composite ranking rules; player display name policy; browser/viewport matrix; baseline harmonization date; licensing/redistribution; deployment/runtime for replay verification.
