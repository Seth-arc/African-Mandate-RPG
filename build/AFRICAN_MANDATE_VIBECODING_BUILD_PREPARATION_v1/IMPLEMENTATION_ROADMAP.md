# Dependency-Ordered Implementation Roadmap v1
**Not a schedule or commitment of duration.** No phase implies approval of later phases.

| Phase | Prerequisite | Deliverables | Must-pass exit | Can proceed despite historical gaps? |
|---|---|---|---|---|
| P0: Constitution & governance | source corpus | reviewed constitution, governance, decision register, task templates, missing document audit | lead signs precedence and task convention | yes |
| P1: Toolchain & schema | P0 | pinned monorepo/CI, Zod registry schemas, cross-reference checker, canonical JSON | lint/typecheck/schema fixtures, compiler rejects pending in production | yes |
| P2: Deterministic primitives | P1 | keyed SHA-256 RNG/IDs, rounding, hashing, immutable snapshot utilities | published vectors, collision tests, repeated byte-identical hashes | yes |
| P3: Command + persistence | P2 | atomic dispatcher, operation coordinator, durable local repository, duplicate tracking, revision/audit journal, EndTurn | invalid/duplicate and save failure leave state unchanged; 3-slot cap | yes |
| P4: Knowledge & model | P3 | knowledge state, tri-state evaluator, observation/collection, assessment, actor memory/position, mandate-case basics | anti-leak differential; delayed result; memory once; case != authorization | yes, TEST profiles only |
| P5: Synthetic four-month slice | P4 | compiler TEST fixture, first-action registry, scripted M1–M4, Month 5 doctrine handoff, headless tests | SIM-01/02/04/07/08/12 first, then all 16, hashes reproducible | yes |
| P6: Application & UI | P5 projection API | status, map/document/dossier/decision interfaces, resolution ledger, autosave, accessible interactions | no restricted imports, Playwright and knowledge-safe copy tests | yes, clearly synthetic fixture |
| P7: Historical Sahel compilation | boundary/rights/source and source completeness review | real 5-country zone registry, dated data admission, BaselinePackage/hash and licensing reports | signed source QA; no unsupported zero or 2026 backdate | no |
| P8: Institutional procedure & balance | expert review + P5 | approved authorization rules, actor/collection/price profiles, calibration and trajectory evaluation | policy signoffs, headless regression + fairness paths | no for real claims |
| P9: Release integrations | P6–P8 | support/browser performance, production content, verified leaderboard backend if included | immutable released hashes, seed replay, server-verification and player QA | no |

## Dependency graph
`P0 → P1 → P2 → P3 → P4 → P5 → P6`; `P7` and institutional research can run independently of P1–P6; `P8` merges approved research into tested runtime; `P9` only after all mandatory gates.

## First milestone sequencing
1. Read source refs; freeze constitution/decision status; obtain missing DESIGN_STANDARDS.md.
2. Bootstrap ESM workspace with exact runtime pins and CI.
3. Implement canonical JSON/SHA and keyed deterministic vectors before gameplay.
4. Implement serialized Zod registries, cross-reference checking and safe rule boundaries.
5. Implement atomic command and save order.
6. Create visibly TEST-only one-zone scenario/fixtures, no actual Mopti polygon assertion.
7. Execute six P0 headless cases, then full 16 and differential anti-leak checks.
8. Begin UI only on stable player-projection contracts.

## Stop conditions
A production compiler emits TEST_ONLY content; a raw observed record changes after a turn; player eligibility varies with hidden-only mutations; replay hashes vary for fixed inputs; save failure still consumes slot; last decision creates a mandatory same-month deadlock; any purported authorized mandate lacks vetted procedure. Stop relevant merge/release, not independent documentation work.
