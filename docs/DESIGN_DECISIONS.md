# Design Decisions

Append-only. One entry per justified item from tier J and per approved exception to tier R (`DESIGN_STANDARDS.md` section 1.3).

Format: `## [rule] Title`, then Where, Decision, Reason.

---

## [J2, R3] Type families: Noto Sans (interface, data) and Charis SIL (documents)
Where: `tokens.css`, group 3 (`--font-interface`, `--font-data`, `--font-document`)
Decision: Noto Sans for interface and numeric data; Charis SIL for briefs, dossiers, agreements and consequence summaries.
Reason: The setting is the Sahel, so place names and source terms use Latin extensions such as ƙ ɓ ɗ ŋ ɛ ɔ ɲ ẹ ọ. On 2026-10-08 I compared the Latin coverage of ten candidate families (Fontsource builds, union of all regular-weight subsets). Noto Sans and Noto Serif covered every letter tested, and Noto Sans has tabular figures. Charis SIL covered every letter tested and was designed for minority-language orthographies. Rejected on coverage: Source Sans 3 (missing ƙ Ɲ), Source Serif 4 (missing most extensions), IBM Plex Sans and Serif, Libre Franklin. Charis SIL is used only for running text, never for numeric columns, because its tabular-figure support was not confirmed in the subsets tested. Noto Sans is a common family, so this choice rests on coverage and tabular figures, not on look. Revisit if a more distinctive family passes the same test.
Not yet done: confirm both licences in the repository when the files are self-hosted (both are published under the SIL Open Font License); create `fonts.css` with self-hosted `@font-face` rules and metric-matched fallback faces; generate the MapLibre glyph ranges for the same character set.

## [R2] Faction palette found by search, not by taste
Where: `tokens.css`, `--ref-faction-1` to `--ref-faction-8`
Decision: Eight muted hues selected by a randomized search that maximizes the smallest pairwise colour difference (CIELAB ΔE76) across normal vision and simulated protan, deutan and tritan vision, subject to 3:1 contrast against map land, map water and panel.
Reason: Hand-picked hue sets failed the colour-vision test (the first attempt had pairs at ΔE 2.6 under deutan simulation). Final minimum separation: normal 19.2, protan 18.5, deutan 17.9, tritan 16.3. The set contains no reds or oranges, so no faction can be mistaken for a critical or warning mark. Colour is still never the only channel: every faction also has an emblem shape and a fill pattern (R2, H3).
Limit: the set holds eight slots. The actor list is not final; if there are more than eight actors the extra identities must be carried by emblem and pattern alone, or the palette must be re-searched.

## [R2] Relation uses ink and line style, not hue
Where: `tokens.css`, `--color-relation-*`, `--line-*`
Decision: Allied is a heavy solid ink line, neutral a thin mid-ink line, hostile a dashed ink line, unknown a dotted fog line. Each also has a glyph.
Reason: R2 requires relation to be visually distinct from faction identity. All eight faction hues and any hue-based relation scheme would eventually collide. Using no hue makes collision impossible. It also follows aeronautical-chart practice, where line style carries the distinction.

## [R2] Indicator colours carry no good-or-bad meaning
Where: `tokens.css`, `--color-indicator-*`
Decision: Five muted hues, one per indicator, chosen by the same search method, at least 18 ΔE apart from each other and at least 11 from the faction set under all vision types.
Reason: A rising insurgency value is bad and a rising stability value is good, so hue cannot encode direction. Valence is shown by the delta glyph and a word in the tooltip.

## [R2, R5] Deltas are uncoloured
Where: `COMPONENTS.md`, Metric readout
Decision: Change since last turn is shown in ink with a direction glyph and sign, never green or red.
Reason: Green and red would reuse the success and critical roles for a different meaning (R12), and would imply valence the indicator may not have.

## [R12] Boundary-on-fill role
Where: `tokens.css`, `--color-map-boundary-on-fill`
Decision: When a thematic ramp is drawn, all boundaries use ink-900, differentiated by weight (international heavier, administrative lighter), instead of the two boundary greys.
Reason: The two boundary greys failed 3:1 against the darker ramp steps (as low as 1.11:1). A separate role avoids giving one grey two meanings.

## [R2] Thematic ramp has four steps
Where: `tokens.css`, `--color-map-ramp-1` to `-4`
Decision: Four sand steps, at least 8 ΔE apart, derived so map labels stay at 4.65:1 or better and boundary-on-fill at 5.48:1 or better on every step.
Reason: A five-step ramp could not keep adjacent steps distinguishable and keep labels legible. Fewer, clearer classes are more honest. Values are always also printed or hatched in the legend.

## [R6, R2] Primary action is ink, not a brand colour
Where: `tokens.css`, `--color-action-primary-*`
Decision: Primary buttons are blue-black ink with light text. Interaction blue is reserved for selection, focus and links.
Reason: Keeps colour for meaning (R2), matches the authoritative tone, and avoids the generic blue-button default (J6).

## [J1] Warning mark has marginal contrast on its own tint
Where: `tokens.css`, `--color-warning-mark` on `--color-warning-tint` (3.10:1)
Decision: Accepted at 3.10:1 for the glyph (above the 3:1 non-text floor). Warning text uses the darker `--color-warning-text` (5.83:1 on tint).
Reason: Amber needs a lighter mark to read as amber. Do not use the mark colour for text.

## [R2] Residual colour-vision risk in the semantic roles
Where: `tokens.css`, semantic roles
Decision: Under simulation, success and critical differ by only ΔE 12.9 (protan) and success and info by 10.7 (tritan).
Reason: This is acceptable only because every semantic use carries a distinct glyph and a text label (H3, `COMPONENTS.md` event map). Never use these colours alone.

---

## Token verification, 2026-10-08

Method: `tokens.css` was parsed, every `var()` chain resolved, and WCAG contrast computed for the role pairs used in the registry. Colour-vision checks used the Machado et al. (2009) simulation at full severity and CIELAB ΔE76.

| Check | Result |
|---|---|
| Unresolved token references | None |
| Text pairs (tiers of ink on all four surfaces; button text; semantic text on panel and tint; links; map labels) | All pass. Body and strong text 10.3:1 to 16.6:1 (above the 7:1 target); muted text 5.56:1 to 6.81:1 |
| Non-text pairs (control rules, focus ring, selected edge, semantic marks, relation lines, fog, boundaries, corridors, factions, indicators) | All pass at 3:1 or better. Lowest: warning mark on tint 3.10, control rule on ground 3.11, faction-5 and faction-6 on map water about 3.14 |
| Faction separation under colour-vision simulation | Minimum ΔE 16.3 (tritan) |
| Indicator separation | Minimum ΔE 18.0 among themselves, 11.0 from factions |
| Lint on `tokens.css` | No raw colour outside the reference tier, no gradients, no box-shadow, no emoji, no flagged font names, a `prefers-reduced-motion` rule present |

Not verified: rendered appearance (no screen exists yet), the type families in a browser, and any component in context.
