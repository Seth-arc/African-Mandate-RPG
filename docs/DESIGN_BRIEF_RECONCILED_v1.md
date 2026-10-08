# Design Brief: African Mandate

Version 0.1, 2026-10-08. Written under `DESIGN_STANDARDS.md` v2.1, section 1.1.

Items marked **PROPOSED** are my working assumptions where the source material did not settle the answer. Each one is listed again in "Open decisions" at the end. Change them there first, then update this file.

---

## 1. Premise and setting

African Mandate is an online, turn-based strategic crisis-management game. The player is an African Union Strategic Envoy working in the Sahel (the first scenario is Sahel Arena). The player manages a portfolio of mandates: diplomatic, security, humanitarian and development-finance commitments that must be authorized, negotiated with coalition partners, resourced and defended.

- **Actors.** AU leadership, regional state actors, regional and external institutions, civil society, and external stakeholders. The full actor list is not yet fixed (see Open decisions: faction slot count).
- **Stakes.** Five indicators track the player's standing and the region's condition: stability, insurgency, civilian support, global legitimacy, regional synergy.
- **Structure.** Five acts spanning multiple turns. **LOCKED:** one turn is one calendar month; 20 turns and three consequential decisions per month (Domain v1.1; GDS v2.1).
- **Intent.** Civilian protection, moral complexity, and earned progress under scarcity. Outcomes are nuanced: fragile successes and real trade-offs, not simple win or lose. The interface must not make the game look like a military campaign map.
- **Setting year.** **OPEN.** Required by the standard; not yet decided. All scenario data attached to real countries and institutions is labeled fictional or simulated wherever it appears (H4).

## 2. Player and session

All of this section is **PROPOSED**.

- **Who.** Adults interested in policy, international relations and strategy games: students and practitioners as well as players. Many will not know AU procedures or Sahel politics in detail.
- **Session.** 45 to 90 minutes per sitting. A sitting covers several turns. Saving and resuming mid-act is a primary path, not an edge case.
- **Device and input.** Desktop or laptop browser with mouse and keyboard is the primary target. Tablet landscape with touch is supported as secondary.
- **Assumed to know:** the basic strategy-game pattern (select a thing, see its details, choose an action, end the turn); how to read a map with a legend; that a number on screen has a cause.
- **Assumed not to know:** the AU's decision procedures; which actors hold which interests; what the game's indicators measure; how much of the situation they cannot see.

## 3. Conventions honored

The player already expects these from grand-strategy and map-based games. The interface keeps them, and any departure is logged in `DESIGN_DECISIONS.md` and counts against the novelty budget.

1. **Select, then act.** Single-click on a map feature or list row selects it and opens its dossier; actions appear in the dossier, not on the map.
2. **Map navigation.** Drag to pan, wheel or pinch to zoom, double-click to zoom to a feature. Plus and minus buttons and a "reset view" control are always present. Esc clears selection.
3. **Tooltip depth.** Hover or focus on a number shows the breakdown of its disclosable inputs. A second level of detail opens on click or Enter. No nested tooltips deeper than two levels.
4. **Queues.** Uncommitted draft decisions MAY appear in a planning tray and be reordered/removed. A committed strategic decision resolves immediately, consumes a slot and is recorded in an immutable decision journal; it cannot be reordered or removed. End Month resolves background processes.
5. **End turn.** One persistent control in a fixed corner. If attention items are unresolved, pressing it opens a summary of what is outstanding before the turn resolves.
6. **Layers.** Map overlays toggle from a legend that doubles as the layer control, as in a printed atlas key.
7. **Dialogs.** Confirm on the right, cancel on the left of the same row, Esc cancels, focus returns to the control that opened it.
8. **Tables.** Click a column header to sort; rows are keyboard-navigable; numeric columns right-aligned.

## 4. Core loop and screens

**Core loop (one turn).**

1. Read the monthly brief: what changed, what needs attention.
2. Assess on the map and in the indicators.
3. Decide: authorize, negotiate or adjust mandates and commitments.
4. Preview the player-known costs and the knowledge-limited forecast; commit.
5. End the turn; watch the resolution.
6. Review the consequence summary and the change log; the next brief arrives.

**Screens and panels.**

| Screen or panel | Purpose |
|---|---|
| Strategic map | Home view. Map, layers, legend, selection |
| Monthly brief | Document-mode surface for the turn's assessment, evidence separated from assessment |
| Attention queue | What needs the player now |
| Mandate portfolio | Ledger of active mandates and their status |
| Actor dossier | Profile, relation, confidence, available actions |
| Decision panel | Options with costs, preview and confirm |
| Coalition and authorization documents | Formal instruments: conditions, commitments, outcomes |
| Indicators and trends | Five indicators with history |
| Resolution ledger | What changed this turn, highlighted on the map |
| Consequence summary | Document-mode account of results |
| Legend and glossary | Every symbol and term |
| Help and hints | Reopens first-use hints |
| Settings | Audio, motion, text size, shortcuts |
| Save and load | States per R9 |
| Act transition and end states | Fragile success, partial failure, session ended |

## 5. First five minutes

All steps are **PROPOSED**. Replace them with the game's actual opening if it differs, then run the walkthrough check (5.4) against the revised script.

The player is assumed to know: how to select things and end a turn in a strategy game; how to read a map legend.
The player is assumed not to know: the AU's procedures; the actors; what the indicators measure.

| Step | Player goal | Decision they face | What they must see | Where it appears | Hint shown |
|---|---|---|---|---|---|
| 1 | Understand the situation and the mandate | Which issue in the brief to look at first | Brief summary, what changed, the five indicators with deltas | Monthly brief over the map | Yes: "Start here. The brief says what changed and what needs you." |
| 2 | Orient on the map | Which region or actor to inspect | Map with legend, attention markers, selectable features | Strategic map | Yes: how to select and open a dossier |
| 3 | Understand an actor | Whether to engage this actor | Relation, what is known and what is not, confidence | Actor dossier | Yes: confidence and unknowns are shown, not hidden |
| 4 | Choose a first action | Which action, at what cost | Player-known costs, forecast with uncertainty, why anything is unavailable | Decision panel | Yes: how previews work |
| 5 | Commit and end the turn | Whether to commit now | Queue with costs, outstanding attention items | Queue and end-turn control | Yes: what ending the turn does |
| 6 | Learn what happened | What to do next | Resolution ledger and map highlights | Resolution ledger | Yes: where to see what changed |

## 6. Interaction budget

**PROPOSED.** An interaction is a click, key press or tap. Hover and focus reveals count as zero.

| Frequent action | Max interactions | Why this number |
|---|---|---|
| Select a map feature and open its dossier | 1 | Done dozens of times per turn; the dossier is the main workspace |
| Reach any actor dossier from anywhere | 2 | Search or list, then select; actors are not always on screen |
| See the breakdown of a displayed number | 0 (hover or focus) | Causality must be effortless (R11); touch gets 1 |
| Jump to the next attention item | 1 | The attention queue is the answer to "what now?" |
| Draft and commit an action from a dossier | 3 | Select action, review preview, confirm; fewer would skip the preview |
| Toggle a map layer | 1 | Atlas-style exploration depends on cheap layer changes |
| Remove an uncommitted draft action | 1 | Reversible actions should be cheap to reverse (R6) |
| End the turn with nothing outstanding | 1 | Frequent; confirmation only when something is unresolved |
| End the turn with outstanding items | 2 | The extra step is the summary of what is outstanding |
| Open the previous brief | 2 | Occasional reference |

## 7. Information inventory

**Always visible**
- Turn, act, date; save state
- Approved knowledge-limited strategic indicators only (no fabricated global metrics); initially omit five candidate gauges
- Attention queue count and next item
- End-turn control and its state
- The current selection
- The map legend (compact)

**One action away**
- Actor dossiers and mandate details
- The monthly brief and previous briefs
- Indicator trends
- The resolution ledger and change log
- Costs and forecast for any queued action
- Relation and confidence per actor

**On demand**
- Breakdown of any computed number (hover or focus)
- Full legend, glossary, keyboard shortcuts
- Archive of documents and agreements
- Settings

## 8. Visual references

Six named sources outside software. The pairings below state what is borrowed and where it applies. None is imitated stylistically; each contributes a structural habit.

1. **Strategic cartography: National Geographic atlas.** Borrow: muted geographic palettes, restrained boundary weights, cartographic hierarchy (a few things emphasized, many quiet), detailed legends, carefully positioned labels, thematic overlays. Apply to: the primary African map, regional conflict visualization, infrastructure networks, cross-border corridors. The map must be rich enough to invite exploration while keeping strategically significant information legible. Does not borrow: the publication's own colours, borders or frames.
2. **Intelligence briefings: the President's Daily Brief format.** Borrow: strong hierarchy, short analytical headings, document metadata, restrained typographic emphasis, separation of evidence from assessment. Apply to: monthly briefs, assessments, dossiers, consequence summaries. Each document should read as prepared to support a consequential decision, with no decorative classified stamps and no agency insignia.
3. **Editorial information design: the Financial Times.** Borrow: dense but readable tables, quiet colour, clear numeric hierarchy, understated annotations, explanation placed beside data. Apply to: mandate portfolio, regional indicators, development finance, actor relationships, strategic evaluation, trend analysis. Does not borrow: the paper's signature pink or its masthead.
4. **Swiss International Style: Josef Müller-Brockmann.** Borrow: strict grids, asymmetrical composition, precise alignment, strong typographic contrast, deliberate negative space, mathematically consistent spacing. Apply to: navigation, panel hierarchy, decision interfaces, dossiers, mandate workflows. This supplies the discipline that keeps the game from looking assembled from generic components.
5. **Aeronautical navigation charts: FAA and Jeppesen.** Borrow: purpose-built symbology, high density, standardized legends, precise annotation, a firm line between critical and contextual information. Apply to: infrastructure layers, map controls, alert severity, intelligence confidence, operational dependencies, strategic corridors. Every symbol and treatment has a reason to exist.
6. **Diplomatic correspondence and institutional memoranda.** Borrow: formal document structure, restrained authority, date and reference metadata, document identification, numbered provisions, decisions separated from supporting text. Apply to: coalition agreements, authorization outcomes, institutional communications, conditions, commitments, formal mandates. Uses structural conventions only; no real institutional insignia and nothing implying official endorsement.

**How the references show up in tokens.** Atlas: map palette group, restrained boundary weights, serif italic for water labels. Briefing and memoranda: document surface, serif reading face, metadata style. FT: tabular numerals, quiet colour, ledger table density. Swiss: 4px baseline, spacing scale, heavy-rule-over-hairline hierarchy, zero panel radius. Jeppesen: relation encoded by line style, fog hatching, symbol-first indicators.

## 9. Tone

| Adjective | Visible consequence |
|---|---|
| Austere | No ornament on data panels. Zero radius on panels. No shadows. Colour appears only where it carries a meaning. |
| Precise | One 4px baseline. Tabular numerals in every numeric column. Units on every quantity. Hairline rules at a fixed weight. Labels aligned to the grid. |
| Authoritative | Primary actions are ink-black. Hierarchy comes from weight and a heavy top rule, not from colour. Documents use a serif reading face and carry reference metadata. Headings are short and declarative. |
| Refined | One interaction accent, used sparingly. Careful label placement on the map. Considered negative space. Fine typographic detail: true minus signs, en dashes for ranges, tracked capitals for metadata. |

**Resolving a tension.** "Austere" and "visually rich enough to invite exploration" (reference 1) pull apart. Resolution: richness lives in the map and in the documents; panels stay austere. This is also the novelty budget below.

These four words also feed `VOICE.md`.

## 10. Supported viewports and input

**PROPOSED** sizes. Everything is tested against these.

| Class | Size (CSS px) | Support |
|---|---|---|
| Target desktop | 1920 × 1080 | Full layout |
| Common laptop | 1440 × 900 | Full layout |
| Minimum desktop | 1280 × 720 | Full layout, tighter panel widths |
| Tablet landscape | 1024 × 768 | Supported: panels collapse to overlays, touch targets at least 32 px |
| Below 1024 wide, or portrait | | Unsupported: show a clear message explaining the minimum size and offering to continue on a larger screen |

Input: mouse and keyboard primary; touch secondary on tablet; keyboard equivalents for every map action (H3).

## 11. Novelty budget

Three places where the interface may be unusual. Each is subject to the precedence rule: if it hurts intuitiveness, it changes.

1. **The map.** Atlas-grade cartographic treatment with thematic overlays and a legend that also works as the layer control.
2. **Document surfaces.** Briefs, dossiers, agreements and consequence summaries use a distinct paper-like surface, serif reading face and a metadata block.
3. **The resolution ledger.** Turn resolution as a reviewable, itemized ledger tied to highlights on the map, rather than only an updated state.

Everything else (forms, tables, menus, dialogs, tabs, settings) behaves conventionally (R10).

## 12. Accessibility targets

- The full H3 floor applies.
- Higher than the floor: body and data text meets 7:1 contrast (verified for the ink tiers in `DESIGN_DECISIONS.md`); primary controls are at least 32 px; support the `forced-colors` mode.
- Faction identities are verified distinguishable under protan, deutan and tritan simulation, and each also carries a pattern and an emblem (R2).
- Glyph coverage: every face must cover the Latin extensions used in Sahel place and language names (for example ƙ ɓ ɗ ŋ ɛ ɔ ɲ ẹ ọ). Verified for the chosen faces on 2026-10-08. Map label fonts, which are served as glyph ranges to MapLibre, must be generated to cover the same set (see Open decisions).

## 13. Out of scope

**PROPOSED.**
- A marketing site.
- Phones and portrait layouts (an explanatory message is shown instead).
- A dark theme at launch. Tokens are structured in tiers so a second theme can be added later without touching components.
- Localization beyond the glyph requirement above.
- Multiplayer.

---

## Open decisions for the owner

1. **Scenario start year and baseline observation window** (Section 1). Required by the standard.
2. **Turn length — CLOSED.** One calendar month (Domain v1.1 / GDS v2.1).
3. **Number of faction slots.** `tokens.css` defines eight, which is a guess. The final count depends on the actor list.
4. **Session length/audience/device:** full campaign locked at 3–5h; sitting length and supported device remain proposed.
5. **First-five-minutes script** (Section 5). Drafted from the premise. It needs checking against the real opening.
6. **Viewport floor** (Section 10). I proposed 1280 × 720 as the minimum.
7. **Map label fonts.** MapLibre needs its glyph ranges generated for the chosen faces. That pipeline is not specified yet.
8. **Out-of-scope list** (Section 13).


## Reconciliation notice (2026-10-08)

This is a working derivative. See `AFRICAN_MANDATE_SPEC_RECONCILIATION_v1.md` for canonical conflict decisions, indicator treatment, role naming and verified leaderboard architecture. The five headline indicators remain candidate *derived player projections* and must not become writable state or omniscient status strips.
