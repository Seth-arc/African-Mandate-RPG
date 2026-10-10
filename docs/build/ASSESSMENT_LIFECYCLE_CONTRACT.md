# Structured assessment lifecycle contract

**Contract version:** 1.0.0  
**Task:** AM-PB2-13 / PB2-13  
**Owners:** serialized assessment state and operation schemas in `@african-mandate/domain`; deterministic workspace, command, and metadata resolution in `@african-mandate/simulation`  
**Classification:** canonical `AssessmentState` with TEST_ONLY authored hypotheses, confidence/metadata profiles, action bindings, and operation wrappers; no production hypothesis or balance admission

## Canonical state and authority

`CampaignState.assessments` remains the only mutable assessment registry. Prompt 13 replaces its generic JSON values with the source-defined `AssessmentState`: subject, authored hypothesis code, lifecycle and analysis statuses, numeric declared confidence, support and contradiction scores, player-known evidence/gap references, institutional implication codes, adoption turn, and revision lineage. Record keys and all evidence, gap, report, decision, and predecessor references validate against the same CampaignState aggregate.

The player cannot submit authoritative free text. `AuthoredAssessmentHypothesisSchema` declares the finite hypothesis code, subject, eligible evidence IDs, materially relevant contradiction keys, known gaps, and implication codes. These exact definition fields are TEST_ONLY because the sources require authored relevance but do not publish a serialized definition shape.

## Confidence and contradiction separation

Game Design requires player selection from LOW, MODERATE, or HIGH while canonical `AssessmentState.declaredConfidence` is a `Score`. `AssessmentConfidenceBandProfileSchema` therefore provides an explicit versioned TEST_ONLY mapping. The selected band is never calculated from `EvidenceRecord.initialConfidence`, `sourceReliability`, or effective evidence confidence. A player may choose HIGH even when evidence confidence is low; the resulting assessment still records cited support, every known relevant contradiction, and the committing decision.

`buildAssessmentWorkspace` is a pure, free drafting operation. It accepts only known relevant evidence as support and automatically derives all known evidence groups whose contradiction keys were authored as relevant. Omitting contradictory IDs from the player's selection cannot remove them. The fixture metadata table scores citation and contradiction counts with declared TEST_ONLY values; missing count entries fail closed instead of inventing a score.

## Consequential lifecycle commands

Adopt, revise, and withdraw use the accepted atomic strategic-command path. Each action has decision-slot cost `1` and an explicit TEST_ONLY action/effect-profile binding marker. Missing or mismatched bindings are rejected before mutation. Adoption creates a deterministic assessment ID. Revision creates a new assessment, marks its active predecessor `superseded`, and preserves lineage. Withdrawal changes the active adopted/revised assessment to `withdrawn`. Every successful decision records the affected assessment ID and decrements exactly one slot; duplicate command handling remains the accepted idempotent path.

The exact term, binding, request/result, trace, rejection, and marker-profile fields are AM-GOV-035 TEST_ONLY proposals. Assessment actions use a source-defined `AuthorityDomain` value because that closed union has no `assessment` member; the binding, not `actionDomain`, identifies the assessment operation.

## Metadata recalculation

The default source step 13 resolver remains `initial_no_op`. `createTestOnlyAssessmentResolverRegistry` replaces only `assessment_metadata` when explicitly supplied with hypotheses and a versioned metadata table. It may update support/contradiction scores, known contradictory evidence, and `analysisStatus` (`current` or `contested` in this bounded milestone). It cannot rewrite subject, hypothesis, declared confidence, lifecycle status, support citations, or revision lineage.

Production thresholds, stale/undermined rules, hypothesis content, implication behavior, confidence mappings, support formulas, and balance consequences remain BLOCKED pending content/balance review.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-13 | Typed assessment state, authored selection, pure workspace, atomic adopt/revise/withdraw, and step-13 metadata adapter | `tests/unit/assessment-lifecycle.test.ts` |
| AC-012 / SIM-05 | Declared confidence is independent from evidence confidence and later reporting cannot silently rewrite an adopted conclusion | high-confidence and later-report tests |
| PB2-13 negative | Known relevant contradictions remain visible even when omitted from selected support | workspace and committed-assessment assertions |
| PB2-13 negative | Adoption costs exactly one slot and missing assessment bindings fail without mutation | atomic adoption assertions |

No test hypothesis describes a real actor, institution, place condition, or production assessment as factual truth.
