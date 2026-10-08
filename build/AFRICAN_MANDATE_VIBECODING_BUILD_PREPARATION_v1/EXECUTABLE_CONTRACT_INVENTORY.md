# Executable Contract Inventory v1
**Status:** Schema implementation inventory, not a claim the schemas already exist. All proposed paths reflect Technical Architecture v2 and are subject to repo bootstrap.

## 1. Required serialized Zod contract surfaces
| Group | Canonical types / registries | Authority | First acceptance |
|---|---|---|---|
| Immutable definitions | `ScenarioDefinition`, `ScenarioBundle`, `TerritoryDefinition`, `ZoneDefinition`, `AssetDefinition`, `CorridorDefinition` | Domain §§10–11, 16–19 | exact ID references, stable geography identity, no runtime geometry mutation |
| Institution and actors | `InstitutionDefinition`, `InstitutionRuntimeState`, `ActorDefinition`, `ActorRuntimeState`, `RelationshipState`, `PositionState`, `MemoryRecord`, `CommitmentRecord`, `RedLineState`, `DisputeState` | Domain actor/registry chapters; Package 1 | directional relations, position-vs-relation distinction, memory once |
| Campaign | `CampaignState`, `CampaignMeta`, `CampaignVersions`, `EnvoyState`, `WorldRuntimeState`, resources, doctrine, evaluations | Domain §§9, 12–15 | 20 turns / calendar semantics, JSON-safe snapshot |
| Knowledge | `PlayerKnowledgeState`, `EvidenceRecord`, `IntelligenceReport`, `IntelligenceGap`, `CollectionTask`, `AssessmentState`, contradiction/position knowledge types | Domain evidence chapters; Package 2 | knowledge projection only; contradictions same subject/scope/time |
| Mandate | `MandateCaseState`, `CoalitionState`, `AuthorizationState`, `AuthorizationProcedureDefinition`, `ImplementationState`, `MandateOutcome` | Domain mandate chapters; Package 3 | case ≠ authorization ≠ implementation; integrity separate from delivery |
| Commands and rules | `ActionDefinition`, `ActionTargetSchema`, command unions, `FactKey` allowlist, `FactQuery`, `RuleExpression` tri-state, `SimulationEffect` closed union, `EffectProfile`, preview policy, doctrine delta | Domain command/effect chapters; Package 3 implementation contract | known eligibility can't be hidden veto; bounded closed effect handlers |
| World scheduler | `WorldEventInstance`, `SituationState`, `AttentionState`, `ScheduledConsequence`, `DecisionRecord`, `DomainEventRecord` | Domain; Package 3 | stable event IDs, ordered end-month processing, no softlock |
| Data/compiler | `SourceManifest`, `BaselinePackage`, `MethodologyManifest`, `MapArtifactManifest`, source-audit, data-quality/missingness, output-hash manifests | Data & Methodology §§3–6, 11–14 | provenance, cutoffs, WGS84, exclusions, licensing release gate |
| Persistence/replay | snapshot envelope, `CampaignArtifactRefs`, release/artifact manifest, replay command history, recovery and cloud sync state | Technical Architecture v2 | hash validation, atomic local save, deterministic reload |
| Trusted comparison | `LeaderboardCohort`, `ReplaySubmission`, `VerificationResult`, `LeaderboardEntry`, `ChallengeDefinition` | Reconciliation R-08 + proposed versioned ADR | no client-trusted scores; server replay only; **not first-kernel scope** |
| Narrative | state-grounded plain-text response/template records and semantic context hash | Technical v2, VOICE, Writing v2 | no authoritative mutations, fallback templates and stale-response rejection |

## 2. Schema implementation rules
1. Define Zod parsers as the authoritative serialized boundary; infer TS types (`z.infer`). Internal-only algorithm interfaces may remain TS-only.
2. Prefer discriminated unions and exhaustive switch handling for commands, typed facts and effects; reject unknown type/field rather than silently ignoring.
3. IDs are opaque and typed; `PartyRef` and `SubjectRef` always carry explicit `kind`.
4. Support `null + reasonCode + confidence` rather than null-coercion or made-up 0 for unavailable observations.
5. Type and range tests cover `Score` 0–100 integer, `SignedScore` −100..100, `Probability` 0..1, counts/integer budgets, ISO calendar dates.
6. Construct canonical JSON only from JSON-safe plain data; object keys ordered; arrays preserve semantic order; `-0` normalized; reject `undefined`, Date, Map, Set, BigInt, NaN/infinities.
7. Cross-reference validate every actor, institution, action, effect, evidence, report, zone, map feature and authorization procedure before fixture initialization.
8. Production compiler rejects unresolved `PENDING_`, `[P]`, `[X]`, `zone_pending_*`, synthetic geometry, and TEST-only balance profiles.

## 3. Fixed deterministic primitives
- Keyed draw: UTF-8 SHA-256 of `campaignSeed + "\0" + resolutionKey`; read first 56 unsigned big-endian bits, shift right 3, divide by `2^53` (Technical v2).
- Derived ID: SHA-256 of `campaignSeed + "\0" + entityType + "\0" + resolutionKey + "\0" + ordinal`; first 96 bits hexadecimal under domain prefix; collision = invariant failure.
- Numeric commit: integer values use round-half-away-from-zero and type-specific clamping.
- Commit persistence: compute → validate/hash → durable local write → replace in-memory → enqueue optional cloud sync/narrative.
- Compile reproducibility: same input bytes/toolchain/methodology ⇒ byte-identical canonical artifacts/hashes; source row ordering invariant where not semantic.

## 4. Required initial fixture artifacts
`fixture-source-manifest.json`, `fixture-source-audit.json`, `fixture-zone-registry.json`, `fixture-baseline.json`, `fixture-player-knowledge.json`, `fixture-expected-hashes.json`, machine-readable test report. Initial geometry can be synthetic **only in isolated TEST mode**, not called a verified Mopti administrative boundary.

## 5. Conversion backlog
- Package 1 actors are role sketches; fill priorities, risk tolerance, memory profile, reporting profiles, issue-specific stances only with approved or TEST parameters.
- Package 2 `evidence_m01_*`, `gap_m01_*` and report rows need canonical typed claims, valid IDs, scope, time, reliability, decay profiles and contradiction validation; divergent claims are not automatically logically incompatible.
- Package 3's **18 action IDs** need `ActionDefinition`, eligibility, target schemas, exact cost profiles, rule/effect registrations, after-commit reaction and delayed callback templates.
- Package 4's **16 SIM-xx** scenarios are intended behavioral tests, *not* a passed integration suite. Existing `authoring_fixtures.json` encodes **7** scripts; 9 SIM cases are unencoded in that fixture.

## 6. Gates
**Synthetic kernel:** versioned fixture balances acceptable. **Real-data integration:** verified administrative boundary/ACLED grain and coverage/historical status and licence requirements. **Authorization feature:** vetted legal procedure. **Production release:** all aforementioned plus regional review and usable player projection. **Leaderboard:** separate server trust-boundary implementation and approved scoring charter.
