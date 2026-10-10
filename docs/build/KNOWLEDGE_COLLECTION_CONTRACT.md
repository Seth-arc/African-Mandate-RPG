# Player knowledge and intelligence collection contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-11 / PB2-11  
**Owners:** serialized knowledge and operation schemas in `@african-mandate/domain`; deterministic collection, confidence, contradiction, and projection behavior in `@african-mandate/simulation`  
**Classification:** canonical knowledge state with explicitly TEST_ONLY orchestration and balance inputs

## Canonical authority

`CampaignState.knowledge` is the only mutable player-knowledge authority. It is now the strict source-defined `PlayerKnowledgeState`: evidence, reports, intelligence gaps, collection tasks, red-line knowledge, position knowledge, known commitment/dispute IDs, and relationship knowledge. No report, projection, observation candidate, resolver plan, or UI-facing object is a second writable store.

`EvidenceRecord`, `IntelligenceReport`, `IntelligenceGap`, `CollectionTask`, `ObservationCandidate`, and every `EvidenceClaim` variant use the exact canonical fields. Evidence is inserted as an immutable record; freshness and effective confidence are derived and never written back into evidence.

Record keys must equal embedded IDs. Reports and position/relationship knowledge may reference only evidence already present in player knowledge. A collection task may reference only a known gap and a decision already present in the campaign journal.

## Collection lifecycle

The canonical `create_collection_task` effect is applied in the same candidate campaign clone as its source decision. It creates only a task, sets its explicit gap to `tasked`, and uses a strictly later `dueTurn`; it never creates evidence or reads hidden truth.

The source-defined task statuses remain `tasked`, `collecting`, `completed`, and `failed`. Prompt 11's six result labels are a TEST_ONLY resolution classification mapped as follows:

| Resolution outcome | Task status | Gap status | Evidence rule |
|---|---|---|---|
| `useful` | `completed` | `resolved` | one or more emitted observations required |
| `partial` | `completed` | `partially_resolved` | one or more emitted observations required |
| `contested` | `completed` | `partially_resolved` | at least two emitted observations and a derived contradiction required |
| `inconclusive` | `completed` | `open` | no new evidence |
| `delayed` | `collecting` | `tasked` | no new evidence and a future revised due turn required |
| `failed` | `failed` | `open` | no new evidence |

Only the opt-in TEST_ONLY lifecycle registry replaces resolver step 12 (`intelligence_collection`). Before `dueTurn` it is a no-op. At or after `dueTurn`, it validates the declared resolution plan and commits emitted evidence and task/gap state atomically. The default production adapter remains `initial_no_op`.

## Contradiction semantics

Two evidence records are in the same contradiction scope only when all of these match exactly:

1. non-empty `contradictionKey`;
2. canonical `SubjectRef`;
3. typed claim identity (`metric` plus unit, category, proposition, relation, or claim code); and
4. monthly reference interval (`observedTurn`).

Within that scope, unequal booleans, categories, or scalar values and disjoint ranges are materially incompatible. Both records remain in player knowledge and the contradiction is derived for display; neither overwrites the other. Different subjects, claim identities, units, or observation turns are not grouped even if a malformed fixture reuses a contradiction key. `observedDate` remains evidence provenance; the campaign's calendar-month turn is the deterministic contradiction period. Mixed claim-kind adjudication, semantic text contradiction, and entity-relation exclusivity remain unimplemented pending an approved production rule.

## Freshness and missingness

The canonical factor names are applied multiplicatively: initial confidence, freshness, source reliability, corroboration, and access/collection quality. Exact factor values are not source-approved, so `EvidenceFreshnessProfileSchema` accepts only explicitly versioned `TEST_ONLY_FRESHNESS_PROFILE` tables. The calculation fails closed when the evidence/profile IDs differ, the requested turn predates observation, or the exact age factor is missing. There is no interpolated or default coefficient.

Missing evidence returns `NO_PLAYER_EVIDENCE`; it is never converted to numeric zero. A known scalar claim whose value is zero remains known evidence.

## Knowledge-only projection

`buildPlayerKnowledgeProjection` serializes only campaign revision, a cloned canonical `PlayerKnowledgeState`, and contradictions derived from that knowledge. It never traverses or copies world, actor, relationship, position, red-line, scheduled consequence, or event truth. Hidden-state differential tests prove that changing those registries cannot change the projection until evidence is explicitly delivered into player knowledge.

## Test-only proposals and blockers

AM-GOV-031 records the exact freshness-profile table, collection template, resolution plan/result/trace, rejection codes, six outcome labels, emitted-observation wrapper, claim lookup result, projection wrapper, and opt-in resolver adapter as review-required TEST_ONLY interfaces. They do not canonize production coefficients or content.

Production observation generation, discoverability tests, reporting delay/reliability formulas, corroboration coefficients, source bias, semantic contradiction adjudication, authored collection templates, and narrative/map rendering remain BLOCKED pending approved contracts and content. No hidden value or guessed production confidence is emitted.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-11 | Typed knowledge authority, collection lifecycle, derived confidence/contradictions, and knowledge-only projection | `tests/unit/knowledge-collection.test.ts` |
| AC-009 / SIM-01 | A decision creates a delayed task but no instant evidence; due resolution emits evidence and supports all six bounded outcomes | delayed-task and outcome-mapping tests |
| AC-008 / SIM-06 | Hidden-state changes do not alter player projection; delivered evidence does | hidden-state differential test |
| AC-011 / SIM-14 | Same-scope incompatible evidence remains and is contested; different scope is not merged | contradiction-scope test |
