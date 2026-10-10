# Serialized domain contract inventory

**Contract version:** 1.0.0
**Task:** AM-PB2-03 / PB2-03 through AM-PB2-17 / PB2-17
**Owner:** `@african-mandate/domain`  
**Status:** PB2-03 and PB2-07 through PB2-16 ACCEPTED; Prompt 17 narrative fallback contract 1.0.0 is READY_FOR_REVIEW; no production scenario admission

## Authority and boundary

Zod schemas exported by `@african-mandate/domain` are the executable serialization authority. TypeScript types are inferred from those schemas; no parallel handwritten public interface is maintained. The source shapes come from Domain Model v1.1, with Zod/JSON mechanics from Technical Architecture v2 and validation requirements from the Executable Contract Inventory.

This contract set does not claim a production-valid scenario. The upstream AM-BUILD-001 contract explicitly reserves that claim until all registries are complete and reviewed. Prompt 10 closes the world/institution runtime envelopes and its bounded world-effect union. Prompt 11 closes the canonical player-knowledge envelope and canonical `create_collection_task` effect subset. Prompt 12 closes the actor, directional-relationship, issue-position, memory, and red-line runtime envelopes plus the canonical `create_memory`, relationship-adjustment, and position-change effect subsets. Prompt 13 closes the canonical assessment runtime envelope while keeping authored hypothesis relevance, confidence-band mapping, metadata tables, and command bindings TEST_ONLY. Prompt 14 closes the canonical commitment registry while keeping consultation packages, legal/response/conflict profiles, fulfillment resolution, and callbacks TEST_ONLY. Prompt 15 closes the canonical mandate-case and implementation registries while every procedure, case/scope/implementation template, authorization outcome plan, and status wrapper remains conspicuously TEST_ONLY. Prompt 16 closes the canonical world-event and doctrine owners and an explicit unavailable/unscored evaluation boundary while event trigger wrappers, cause traces, situation directives, doctrine accumulation, and review eligibility remain conspicuously TEST_ONLY. The remainder of `EffectProfile.effects` and later-prompt registries remain gated until their assigned milestones. No partial typed contract admits production content.

Prompt 17 publishes the canonical source-listed narrative perspective, context, request-identity, and response fields inside strict AM-GOV-043 TEST_ONLY request/provider/render wrappers. It adds no campaign owner: narrative output is non-authoritative, separate from campaign hashes, and consumes only copied player-knowledge records.

## Crosswalk

| Serialized contract | Executable schema / inferred type | Source | Prompt 03 coverage |
|---|---|---|---|
| Scalar bounds and dates | `ScoreSchema`, `SignedScoreSchema`, `ProbabilitySchema`, `IsoDateSchema`, `MoneyAmountSchema` | Domain §§7-11 | Strict numeric/date checks; no defaults or coercion |
| Stable entity IDs | branded `*IdSchema` / inferred branded types | Domain §12 and Appendix F.1 | Prefix validation at serialization boundaries |
| Parties and subjects | `PartyRefSchema`, `SubjectRefSchema` | Domain §12.1-12.2 | Strict discriminated unions |
| Version metadata | `CampaignVersionsSchema` plus seven typed version-tag schemas | Domain §12.3 | All seven fields required |
| Scenario definition | `ScenarioDefinitionSchema` | Domain §12.5 | Required fields, calendar-month literal, bounds, duplicate arrays |
| Baseline package | `BaselinePackageSchema`, `SourceManifestSchema` | Domain §§90-92 and Appendix F.12 | Strict observed-value envelopes, quality bounds, duplicate entity/source checks |
| Scenario bundle | `ScenarioBundleSchema` | Domain §12.4 and named registries | Strict registry shapes and cross-reference/key checks; structural only |
| Campaign state | `CampaignStateSchema` with `CampaignMetaSchema` and `EnvoyStateSchema` | Domain §§12.6-15, 111-112 | Exact top-level/core fields, strict status/scalars, JSON-only deferred subsystem envelopes |
| Partial test fixture | `FixturePackageSchema` | Prompt 03; AM-BUILD-001; fixture plan | `TEST_ONLY_PARTIAL_FIXTURE`; proposal AM-GOV-015; rejected by `ScenarioBundleSchema` |
| Synthetic compilation artifacts | `FixtureSourceManifestSchema`, `FixtureSourceAuditSchema`, `FixtureZoneRegistrySchema`, `FixtureBaselineSchema`, `FixturePlayerKnowledgeSchema`, `FixtureExpectedHashesSchema`, `FixtureTestReportSchema` in `@african-mandate/data-pipeline` | Data & Methodology Appendix C; Prompt 06 | Version 1.0.0 TEST_ONLY proposal AM-GOV-021; production serializer and publish gate reject fixture output |
| Determinism vector artifact | `DeterminismVectorArtifactSchema` | Technical v2 §14.1 | Wrapper schema v1.0 is TEST_ONLY proposal AM-GOV-017; vector bytes and expected values are source-canonical |
| Rules and registered facts | `FactKeySchema`, `FactDefinitionSchema`, `FactQuerySchema`, `RuleExpressionSchema`, `FactResolutionSchema` | Domain §§48-51 and Appendix F.2-F.4; Technical §§50-51 | Initial closed source-listed key set, strict tri-state resolution, explicit unknown, no arbitrary object paths |
| Strategic command and target | `CommandIdSchema`, `ActionTargetSchemaSchema`, `StrategicActionCommandSchema`, `CommandPreparationResultSchema` | Domain §§43-46 and Appendix F.5; Technical §§13.1, 49, 57 | Strict external command/action/target envelope; duplicate and rejected results carry zero slot cost; no state mutation in Prompt 07 |
| Known preview and hidden-resolution boundary | `PreviewCostSchema`, `KnownCostProfileSchema`, `DecisionPreviewSchema`, `ActionMenuEntrySchema`, `PostCommitHiddenResolution*Schema` | Domain §54; GDS §§20-22; Prompt 07 | Knowledge-only menu/preview; hidden resolver request requires postcommit phase and decision ID; exact wrappers are AM-GOV-023 TEST_ONLY proposals |

| Atomic request/result and durable snapshot | `AtomicStrategicCommandRequestSchema`, `StrategicCommandSimulation*Schema`, `AtomicStrategicCommandResultSchema`, `SaveSnapshotSchema` | Domain §§46, 123–126; Technical §§20, 48–49, 57; Prompt 08 | Strict revision/version preconditions, result classifications, authoritative hash, and snapshot consistency; exact wrappers are AM-GOV-025 TEST_ONLY proposals |
| Lifecycle state | `ScheduledConsequenceSchema`, `SituationStateSchema`, `AttentionStateSchema`, `AttentionItemSchema` | Domain sections 68, 73, 77 | Canonical fields replace JSON envelopes; record-key/source/window and resolved-state invariants are strict |
| EndTurn lifecycle | `EndTurnRequestSchema`, `EndTurnSimulation*Schema`, `AtomicEndTurnResultSchema`, `TurnResolverTraceSchema` | Domain sections 14, 47, 97, 123-126; GDS sections 11, 23, 76-77; Prompt 09 | Exact wrappers/trace/resolver IDs are AM-GOV-027 TEST_ONLY proposals; state remains snapshot-authoritative |
| World runtime state | `WorldRuntimeStateSchema`, subsystem state schemas, `InstitutionRuntimeStateSchema` | Domain sections 17-21, 82, 85-88 | Strict canonical owners replace world/institution JSON envelopes; duplicate summary fields rejected |
| World effects and trace | `WorldEffectSchema`, `WorldResolutionRequestSchema`, `WorldResolutionResultSchema`, `WorldSubsystemCoverageSchema` | Domain Appendix F.7; Prompt 10 | Canonical effects inside AM-GOV-029 TEST_ONLY orchestration/trace wrappers; production dynamics explicitly BLOCKED |
| Player knowledge state | `PlayerKnowledgeStateSchema`, `EvidenceClaimSchema`, `EvidenceRecordSchema`, `IntelligenceReportSchema`, `IntelligenceGapSchema`, `CollectionTaskSchema`, `ObservationCandidateSchema` | Domain sections 31-40 | Exact canonical fields, strict record/reference checks, immutable evidence inputs, and no hidden truth in the registry |
| Knowledge operations | `CreateCollectionTaskEffectSchema`, `EvidenceFreshnessProfileSchema`, `CollectionResolution*Schema`, `PlayerKnowledgeProjectionSchema` | Domain sections 35-36, 52-53 and Appendix F.7; Technical sections 45, 64-65; Prompt 11 | Canonical task effect inside AM-GOV-031 TEST_ONLY freshness/orchestration/projection wrappers; production coefficients and content remain BLOCKED |
| Actor authority state | `ActorRuntimeStateSchema`, `RelationshipStateSchema`, `PositionStateSchema`, `MemoryRecordSchema`, `RedLineStateSchema` | Domain sections 20-29; Package 1 actor registry | Canonical single-owner registries, directional uniqueness, cross-references, bounds, and hidden-state separation |
| Actor/memory operations | `CreateMemoryEffectSchema`, `AdjustRelationshipEffectSchema`, `ChangePositionEffectSchema`, `MemoryCreation*Schema`, `ActorAdaptation*Schema`, `RedLineDiscovery*Schema` | Domain sections 24-29, 100 and Appendix F.7; Package 1 sections 5-7; Prompt 12 | Canonical effects inside AM-GOV-033 TEST_ONLY template/adaptation/discovery wrappers; production intent, stance, and coefficients remain BLOCKED |
| Assessment authority state | `AssessmentStateSchema`, lifecycle and analysis status schemas | Domain sections 41-42 | Exact canonical owner replaces the assessment JSON envelope; evidence/gap/lineage references validate against CampaignState |
| Assessment operations | `AuthoredAssessmentHypothesisSchema`, `AssessmentCommandTermSchema`, `AssessmentWorkspace*Schema`, `AssessmentCommandResolution*Schema`, `AssessmentMetadataRecalculation*Schema` | Domain sections 41-42 and 97; GDS sections 32-35; Package 2 claims; Prompt 13 | Canonical state inside AM-GOV-035 TEST_ONLY relevance/profile/binding/orchestration wrappers; production hypotheses and balance remain BLOCKED |
| Commitment authority state | `CommitmentRecordSchema`, `CommitmentStatusSchema` | Domain section 27 and Appendix B.5 | Exact canonical owner replaces the commitment JSON envelope; party, decision, key, due/resolution, and active-state references validate in CampaignState |
| Consultation and commitment operations | `ConsultationPackageSchema`, consultation profile/command schemas, `CommitmentResolution*Schema` | Domain sections 27, 44, 46, 97-98; GDS sections 3-4, 13-15 and 40-45; Package 3 N1-N3; Prompt 14 | Canonical commitment state inside AM-GOV-037 TEST_ONLY legal/response/conflict/resolution wrappers; production legal scope, positions, mappings, and formulas remain BLOCKED |
| Mandate case and implementation authority state | `MandateCaseStateSchema`, coalition/authorization/scope/outcome schemas, `ImplementationStateSchema` | Domain sections 55-66 and Appendices B.2-B.4/F.8-F.10 | Exact canonical owners replace both generic JSON envelopes; case/assessment/commitment/implementation/party references validate in CampaignState |
| Mandate and authorization operations | mandate template/binding/command/prevalidation/status schemas, `AuthorizationResolution*Schema`, TEST_ONLY implementation profile | Domain sections 55-66 and 97; GDS sections 37-55; Package 3 sections 4-7; Prompt 15 | Canonical state inside AM-GOV-039 TEST_ONLY template/procedure/resolution wrappers; production procedure, real positions, formulas and dynamics remain BLOCKED |
| Event, doctrine, and evaluation authority state | `WorldEventInstanceSchema`, `DoctrineStateSchema`, `EvaluationStateSchema`, canonical scored result interfaces | Domain sections 70-81 and 106-110; Appendices F.11/F.14-F.15 | Exact world-event and doctrine fields; strict unavailable/unscored six-dimension evaluation owner; production evaluation state remains blocked |
| Event and doctrine operations | `EventDirectorResolution*Schema`, typed cause/situation/knowledge-safe projection schemas, `DoctrineObservation*Schema`, `DoctrineReviewEligibilitySchema` | Domain sections 74-81, 97 and 110; GDS sections 66-78/85; Stage 1 sections 7-11; Prompt 16 | Canonical state inside AM-GOV-041 TEST_ONLY trigger/trace/observation wrappers; effects, weights, production dynamics, coefficients, codification and evaluation formulas remain BLOCKED |
| Narrative context and fallback | `NarrativePerspectiveSchema`, `NarrativeContextSchema`, `NarrativeRequestIdentitySchema`, `NarrativeRequestSchema`, `NarrativeResponseSchema`, provider/render result schemas | Domain sections 117-122; Technical sections 29 and 66-72; VOICE/Writing v2; Prompt 17 | Canonical perspective/context/response fields inside AM-GOV-043 strict TEST_ONLY collection-template and guard wrappers; prose is plain text, non-authoritative, knowledge-only, and excluded from campaign state |
| Four-month compiled test content | `FourMonthTestContentArtifactSchema`, action-audit, gap-alias, source-stream, message, branch, runtime-contract and unimplemented-system schemas | Package 1 actor registry; Package 2 content/opening/intelligence; Package 3 gameplay/briefing/implementation; Package 4 readiness/validation; Prompt 18 | Contract 1.0.0 / content 0.1.0-test.1 under AM-GOV-045; all added wrappers and values are TEST_ONLY, the 18 authoring IDs are audited, and production serialization fails closed |

## Referential validation

`ScenarioBundleSchema` checks record key/embedded ID agreement and references among scenario, territories, zones, assets, corridors, institutions, actors, authorization procedures, actions, events, effect profiles, and difficulty profiles. Duplicate ID arrays are rejected where set semantics apply. Baseline arrays and source-manifest entries reject duplicate identifiers.

The following remain intentionally outside Prompt 03: production content admission, approved geography, real actor priorities, legal authorization content, balance values, formula registries, effect-handler completeness, runtime mutation, deterministic canonical JSON/hashing, and compilation. Their absence is not converted into permissive production validation.

## Source-to-test traceability

| Acceptance ID | Assertion | Executable evidence |
|---|---|---|
| PB2-03 | Canonical serialized domain contracts and inventory crosswalk | `tests/unit/domain-contracts.test.ts`; Prompt 03 CI log |
| AC-001 | Fixed date/turn/slot-compatible scalar and scenario shapes | valid scenario/baseline/campaign examples; bounds/date checks |
| AC-002 | One CampaignState top-level location per mutable subsystem | `CampaignStateSchema` crosswalk; architecture review still required before final production schema |
| AC-003 | Serialized Zod unions and references validate | strict-union, unknown-key, dangling-ref, duplicate-ID, non-JSON, invalid-status, and fixture-isolation tests |
| PB2-06 | Isolated synthetic compilation fixture | `tests/unit/fixture-kernel.test.ts`; two-process fixture verifier; Prompt 06 log |
| PB2-07 | Rule facts, commands, eligibility, structural refusal, and postcommit hidden boundary | `tests/unit/command-rules.test.ts`; Prompt 07 CI log |
| AC-005 | Invalid preparation result is pure and carries zero slot cost | Prompt 07 precommit test only; durable write atomicity remains Prompt 08 |
| AC-006 | Duplicate command ID is detected with zero slot cost | Prompt 07 precommit test only; full idempotent effect test remains Prompt 08 |
| AC-008 | Same known projection under distinct hidden states yields equal menu/preview objects | Prompt 07 differential unit test |
| PB2-08 | Typed atomic request/result and snapshot artifacts | `tests/unit/command-atomicity.test.ts`; `docs/build/ATOMIC_COMMIT_CONTRACT.md` |
| AC-005 | Durable write failure preserves prior runtime and repository state | Prompt 08 injected-write-failure test |
| AC-006 | Duplicate command returns its original decision identity with no second effect | Prompt 08 duplicate-submit test |
| PB2-09 | Typed calendar/scheduling/attention lifecycle and EndTurn artifacts | `tests/unit/turn-lifecycle.test.ts`; `docs/build/TURN_LIFECYCLE_CONTRACT.md` |
| AC-007 | Four exact rollovers, unused-slot forfeiture/reset, and final Month 20 no-advance | Prompt 09 lifecycle tests |
| AC-025 | Reserved mandatory capacity, blocked EndTurn, and final-response-slot success | Prompt 09 lifecycle tests |
| PB2-10 | Typed world owners, canonical effect handlers, deterministic traces, and coverage declaration | `tests/unit/world-subsystems.test.ts`; `docs/build/WORLD_SUBSYSTEM_CONTRACT.md` |
| AC-002 | Strict schemas reject duplicated writable subsystem summaries | Prompt 10 duplicate-owner negative test |
| PB2-11 | Typed knowledge authority, delayed collection, derived confidence/contradictions, and projection firewall | `tests/unit/knowledge-collection.test.ts`; `docs/build/KNOWLEDGE_COLLECTION_CONTRACT.md` |
| AC-008 | Hidden-state mutations leave knowledge projection unchanged until evidence delivery | Prompt 11 SIM-06 differential test |
| AC-009 | Collection creates no instant evidence and supports delayed/useful/partial/contested/inconclusive/failed results | Prompt 11 SIM-01 lifecycle and outcome tests |
| AC-011 | Same-scope incompatible evidence remains contested while different scopes remain distinct | Prompt 11 SIM-14 contradiction test |
| PB2-12 | Typed actor authority, directional relationships, issue positions, once-only memory, and evidence-gated red-line discovery | `tests/unit/actor-memory.test.ts`; `docs/build/ACTOR_MEMORY_CONTRACT.md` |
| AC-010 | Consultation memory effects apply once and repeated diplomacy uses explicit non-farming TEST_ONLY policy | Prompt 12 SIM-02 atomic consultation/memory test |
| PB2-13 | Typed structured assessment lifecycle, authored selection, automatic contradictions, and consequential commands | `tests/unit/assessment-lifecycle.test.ts`; `docs/build/ASSESSMENT_LIFECYCLE_CONTRACT.md` |
| AC-012 | Declared confidence stays independent from evidence confidence and later reports do not rewrite adopted conclusions | Prompt 13 SIM-05 high-confidence and metadata-recalculation tests |
| PB2-14 | Typed consultation packages, canonical commitment lifecycle, knowledge-only warnings, and postcommit response evidence | `tests/unit/consultation-commitment.test.ts`; `docs/build/CONSULTATION_COMMITMENT_CONTRACT.md` |
| AC-010 | Independent accepted/conditional/rejected consultations consume one slot and emit scoped evidence | Prompt 14 SIM-02 regional-response test |
| AC-010 / SIM-09 | Structurally impossible terms reject; political conflicts warn; due fulfillment/breach and callbacks run once | Prompt 14 commitment lifecycle tests |
| PB2-15 | Typed mandate case, coalition, authorization, scope, outcome and implementation owners plus gated operations | `tests/unit/mandate-authorization.test.ts`; `docs/build/MANDATE_AUTHORIZATION_CONTRACT.md` |
| AC-013 / SIM-07 | Assessment escalation costs one slot; negotiated case scope and issue-specific coalition state persist without authorization | Prompt 15 case/scope/state-separation test |
| AC-013 / SIM-10 | Missing procedure and unauthorized grantors reject without mutation; launch requires a distinct authorized command | Prompt 15 authorization-gate negative tests |
| PB2-16 | Typed event/doctrine/evaluation owners, conditional event resolver, developer cause trace, safe event projection, and observational Month-5 doctrine review | `tests/unit/event-doctrine-evaluation.test.ts`; `docs/build/EVENT_DOCTRINE_EVALUATION_CONTRACT.md` |
| AC-014 / SIM-03 / SIM-04 | Quiet inaction remains legal and Month-5 review is not available early or auto-codified | Prompt 16 quiet-month and Month-5 tests |
| AC-007 / AC-025 / SIM-11 | A fourth consequential action rejects without state mutation | Prompt 16 slot-cap negative test |
| AC-024 | Six dimensions remain unavailable/unscored and reject invented zero/overall scores | Prompt 16 interface test; production methodology gate remains BLOCKED |
| PB2-17 / AC-020 / SIM-16 | Deterministic knowledge-safe narrative fallback, fixed simulated marker, stale identity guard, plain-text security, and source/date/unit rendering | `tests/unit/narrative-fallback.test.ts`; `docs/build/NARRATIVE_FALLBACK_CONTRACT.md` |
| PB2-18 / AC-007 / AC-009 / AC-010 / AC-013 / AC-016-AC-019 / AC-022 / AC-023 / AC-025 | Four-month TEST_ONLY artifact, 18-ID audit, three-slot branches, collect/consult/defer paths, explicit gap alias, stable hash, no fake real data, and dual production rejection | `tests/unit/four-month-content.test.ts`; `docs/build/FOUR_MONTH_TEST_CONTENT_CONTRACT.md` |
