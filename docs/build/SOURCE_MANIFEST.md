# African Mandate source manifest

**Manifest version:** 0.1  
**Task:** AM-PB2-00  
**Prepared:** 2026-10-08  
**Repository base SHA:** `32686631558322be6757f2b6809acd83b255453b`  
**Hash algorithm:** SHA-256 over the exact file bytes  
**Status:** READY_FOR_REVIEW; this manifest is not owner approval of any source, dataset, or proposal.

## Authority and admission rules

The controlling precedence is Domain Model v1.1, Technical Architecture v2, Data & Methodology v1.1, Game Design v2.1, owner-approved Stage 1 narrative, Stage 2 authoring material, then reconciled presentation and copy sources. The Build Preparation package and Promptbook govern implementation work but do not override upstream domain or legal decisions.

The repository does not yet contain an accepted build state or a prior source manifest. Paths below record the repository as found at the base SHA plus `docs/DESIGN_STANDARDS.md`, which was untracked at preflight and was subsequently confirmed by the owner for inclusion as the project's design standard. A hash proves file identity only; it does not prove accuracy, licensing, completeness, or fitness for production.

Status terms used here:

- **CANONICAL:** controlling source at its stated level, subject to higher-precedence sources and explicit open decisions.
- **PARTIALLY_APPROVED:** contains named approved decisions and other gated material.
- **OWNER_APPROVED_STAGE1:** treated as owner-approved by the supplied Stage 2/build records; independent approval evidence is not stored in this repository.
- **AUTHORING_ONLY:** proposal, draft, fixture contract, or validation design; not compiled or production-approved.
- **BUILD_PROPOSAL:** proposed implementation governance or task material; not an accepted milestone.
- **SUPPLIED_UNREVIEWED:** present in the repository but not admitted to a production baseline.
- **TEST_ONLY:** deliberately synthetic or static test material; not historical evidence.
- **OWNER_CONFIRMED_SOURCE:** supplied outside the base commit and explicitly confirmed by the owner for inclusion; authoritative at its stated layer and still subordinate to higher-precedence sources.

## Canonical and scenario source corpus

| Path | Bytes | SHA-256 | Classification / authority |
|---|---:|---|---|
| `docs/African_Mandate_Domain_Model_Simulation_Spec_v1_1.md` | 112321 | `aa8a03380e93bb4adee9ef6115d59f64a98409f988eeaf132fa70460dec3c75c` | CANONICAL domain and simulation semantics |
| `docs/AFRICAN_MANDATE_TECHNICAL_ARCHITECTURE_v2.md` | 83226 | `982be4ecd82b996e14be83b6fd89a60a2876bb4e2505ed195889ad4f81dcee30` | CANONICAL implementation mechanics where Domain is silent |
| `docs/AFRICAN_MANDATE_DATA_AND_METHODOLOGY_SPEC_v1_1.md` | 30953 | `90f5de5f32585297747fa8cb91eaae5ad3b98b82327c4fc680df48e145a1a42c` | PARTIALLY_APPROVED; AM-DM-001/002/003 approved, other data/licensing/formula gates remain |
| `docs/AFRICAN_MANDATE_GAME_DESIGN_SPEC_v2_1.md` | 90437 | `89f7387d041e006e3cc1e21d52fdc07e2234227600321eea5601a35415341f04` | CANONICAL player-experience layer, subject to higher-level invariants and open scenario choices |
| `docs/AFRICAN_MANDATE_SPEC_RECONCILIATION_v1.md` | 11853 | `12c93d88480ced19bf581e2e23a143629bed68ce6140ad26eeee6855218cdf99` | CANONICAL only for LOCKED entries consistent with later approved decisions; R-10 date proposal is stale |
| `docs/AFRICAN_MANDATE_SAHEL_SCENARIO_STAGE_1_NARRATIVE_FOUNDATION_v1.md` | 39066 | `f5a935f08e1dfda8df6d9b7f0ff6aa001a80c562e356faa59a2682150de933c1` | OWNER_APPROVED_STAGE1 per supplied downstream records; proposed details remain labeled |
| `docs/AFRICAN_MANDATE_SAHEL_ACTOR_INSTITUTION_REGISTRY_v0_1.md` | 23542 | `9603b1d6af04c8716b65b4cf0937f179f3bd5061a44f23f35face6c7f7b67edf` | AUTHORING_ONLY; actor/legal/balance review outstanding |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE2_CONTENT_CONTRACTS_v0_1.md` | 6058 | `5506fa98613d7a460c5056b6ee7782ee3b16718c71080f04e3dca499d4a5943b` | AUTHORING_ONLY |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE2_OPENING_DOCUMENTS_v0_1.md` | 12170 | `32e091c3727ace217332f93ba32c98a15a5ec688d3ac8a69c431ed399bf33855` | AUTHORING_ONLY; simulated opening documents |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE2_OPENING_INTELLIGENCE_SPEC_v0_1.md` | 18967 | `f2cf00126ea8caadcc2afca0d96521a381f0f704b40c697ef45fdcdbb61fe8d1` | AUTHORING_ONLY |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE3_BRIEFINGS_DECISION_AND_REACTION_DECK_v0_1.md` | 8663 | `44130a5e8282163e4763f7bac2ca20724aab0599b4beecd66631d51b030674c4` | AUTHORING_ONLY |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE3_FOUR_MONTH_GAMEPLAY_SPEC_v0_1.md` | 25281 | `f1d75b55815e82914c4d9318a2aa56fe2bfd7f785851f93624cbc93ce8b77742` | AUTHORING_ONLY; 18 action IDs are not compiled ActionDefinitions |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE3_IMPLEMENTATION_AND_QA_CONTRACT_v0_1.md` | 8581 | `e7ed55efd11262257d30a6a377a0387421e94dd9c3162bdca1850f83214b4fdb` | AUTHORING_ONLY; explicitly non-executable |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE4_READINESS_REGISTER_v0_1.md` | 4005 | `0ecdab17be272d3e9c04b7065c7ec72f5049ecee898194161de5523a25cc3ab3` | AUTHORING_ONLY readiness record |
| `docs/AFRICAN_MANDATE_STAGE2_PACKAGE4_VALIDATION_SPEC_v0_1.md` | 12670 | `41c97fac25ee55fa51092fe48a0532d175e0e0c864888287cbd654809bbdade8` | AUTHORING_ONLY validation design; no gameplay tests executed |
| `docs/AFRICAN_MANDATE_FIRST_COMPILATION_FIXTURE_PLAN_v1.md` | 4989 | `51e9057ba2273104679dbcf2cfc0824aa6b7b2b2bcf0577b2b68a5d287620c5d` | BUILD_PROPOSAL; not an executed compiler |

## Presentation, design, and writing sources

| Path | Bytes | SHA-256 | Classification / authority |
|---|---:|---|---|
| `docs/COMPONENTS_RECONCILED_v1.md` | 23589 | `a512a1e46a3b2c1affca0e776c7ef31a0b9350dc222c21dcc191960ecbcd836c` | CANONICAL presentation source subordinate to domain/game rules |
| `docs/DESIGN_BRIEF_RECONCILED_v1.md` | 17005 | `4a7e6f54ea4dfde6bbc8f48ea286bc892adf18e1f621267d1835edd2379cd6b3` | CANONICAL presentation source with unresolved owner choices |
| `docs/DESIGN_DECISIONS.md` | 7208 | `d1341c336b9bb2ffb45fd544c0eb2bc03384187c9a3a784000abca9ad429e729` | Existing design decision record; subordinate to upstream sources |
| `docs/GLOSSARY.md` | 14527 | `622da2349c3f06e9812ec8eb4a09b3af21c624fb198a3c610753149efa0c857b` | Existing terminology source |
| `docs/tokens.css` | 15489 | `f534d03bbf1b60e65781972d5e358076b8b572005672bb5b1c61727a9718d4e9` | Existing presentation tokens; not an application stylesheet |
| `docs/VOICE.md` | 11444 | `73fe2fcd5da636a6e08e6d6f4422f6b859d5b62fa2a5ec0d6d60685aa98bc27f` | Existing voice guidance |
| `docs/WRITING_STANDARDS (1).md` | 47273 | `99def731f96884cdedc9ac4d585899d5b1a80875d59b7b83e273d9e176471f8c` | Existing writing standard; filename/version naming requires governance review |
| `docs/DESIGN_STANDARDS.md` | 47191 | `39755e3cbd573e8682970d2aefd1a98a7b53b9cb935611e6fd17bafdbfe21bb4` | OWNER_CONFIRMED_SOURCE; official project design standard, authoritative for presentation subject to higher-precedence domain, technical, data, game, and scenario rules |

## Static authoring utility and fixtures

| Path | Bytes | SHA-256 | Classification / authority |
|---|---:|---|---|
| `docs/validate_authoring.py` | 1511 | `1e8da51e9db95afb18b6a8916520c1dfb3a4b5068a2857d674f4d9ee86809333` | Implemented static utility, NOT_RUN; default source path appears disconnected from actual `docs/` location |
| `docs/authoring_fixtures.json` | 2488 | `e9722932157c50de4fba374c02d7f928b0c4feabab38aecb21181e44b20adb3b` | TEST_ONLY; 7 scripted templates, 9 SIM cases explicitly unencoded |

## Supplied data artifacts

These hashes identify the supplied bytes. Every artifact remains SUPPLIED_UNREVIEWED and outside a production baseline pending the Data & Methodology admission, completeness, temporal, provenance, and licensing gates.

| Path | Bytes | SHA-256 | Audit note |
|---|---:|---|---|
| `data/ACLED Data_2026-10-01_event_date_from_2024-09-28_event_date_to_2025-09-26.csv` | 889455 | `acce392bb35cfcf7ee1f24c9fc4c6025be4480335e46c6a4acc3912ad51bf65b` | Supplied extract; coverage and repeated-event grain unresolved |
| `data/ACLED_Conflict_Index_2025.xlsx` | 21777 | `15b00d940213fa0c86e9894f225b6c09ce783b76b8003acdd7f88c7275723314` | Binary workbook; sheet semantics and permissible use not audited here |
| `data/African_gem_oil_gas_pipelines.geojson` | 570236 | `043cbf6dc20eb85ac75a02f5e656ac6872b5a79d1333decd0b674ee179ec80df` | Route precision/status/licensing gates apply |
| `data/african_gem_power_assets.geojson` | 2336218 | `2c773623409666f7b85f9bb22c2691f516afd06ed29a7e63483410d594d06db3b` | 2026 inventory cannot establish 2025 operation without dated evidence |
| `data/african_map.json` | 7757922 | `8ef3de3e1bcb846c405915fad33c03f1b38376d83e66ba6d8900681202da3c27` | Reference map only; not an approved five-country zone registry |
| `data/african_osm_construction.geojson` | 4169882 | `c14d7c905d5cd790eb67c61633120a7a702f723cccf9bc311864bef4add29237` | ODbL/provenance and temporal gates apply |
| `data/African_telegeography_cables.geojson` | 227587 | `b184247ce5c364292f2908b634be487e0863cd921175f9516a158f20056d1a41` | Landing/link and share-alike review required |
| `data/IDMC_GIDD_Conflict_Internal_Displacement_Disaggregated.geojson` | 78467 | `634c40803007f2f4779d6fd00f72f885ad02a7f0bc77b2b4c4d044dfb6dfc0ed` | Supplied feature collection reported as empty; unusable for zone observations as-is |
| `data/meta.json` | 1089 | `499ff3f211832fb3241aa3a412f8c7bc708a1334b28f86e70a0d93b5d7829e0b` | Internal inventory metadata; not source-native finance data or approval evidence |

## Build Preparation v1 controls

All files in this section are BUILD_PROPOSAL material unless a later owner review accepts them. They constrain agents during the proposed build but do not prove implementation.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/README.md` | 2405 | `5c2837786bf0b116370b6e10df3febcf00bd5486aa19d9b1e1149e2ce6ea1d8e` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/AGENTS.md` | 3003 | `e11ac906a543ec6ef42ecd44b0b76e6d465a9d2caa65e8b5f91f7f421474045f` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/BUILD_CONSTITUTION.md` | 6729 | `e90c3197e7a3af4a9016b709e2ee3ed6a4c7da826992a741983ca98cfdbc3392` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/EXECUTABLE_CONTRACT_INVENTORY.md` | 6835 | `0a06ccf9f26c4648cb7b955c77c1bb7e8a21cb2d8934d9aa5673471282c3d432` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/IMPLEMENTATION_ROADMAP.md` | 3756 | `0274aa6c901e3945db03adfd79da02fd62ec8d3e3998004ea7b9031a9da7de25` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/OPEN_DECISIONS.md` | 4350 | `61925d6930ae25af6474fd4d1e803bc6c4ccda865572087a397d509641e16127` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/REPOSITORY_BOOTSTRAP.md` | 3438 | `8fbcc2dab6523b956efc611f7fd5ca2ad6e96758ae5209bc9c370a41d9b05e1d` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/ACCEPTANCE_MATRIX.md` | 5086 | `a5fe67e40ef74ce94eb850c8b05c5ab95e8eb38c168b01e5f71f6518d9791ad0` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/TASK_CONTRACT_TEMPLATE.md` | 1446 | `d0da9be83c80a242de99c565f9a87a9c44c13b34a2b5149890b6531d845fc8d5` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/adr/ADR-0001-verified-leaderboard-boundary-PROPOSED.md` | 1570 | `653266d50d43140c20578f8ed9373d9a315acc4634169cf14f7dd1ee0eca56a4` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/task_contracts/AM-BUILD-001-domain-schemas.md` | 1097 | `379e30eb45e25af4da0b215d3781576da067234b55f0b73eed499240ce8a88f1` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/task_contracts/AM-BUILD-002-deterministic-primitives.md` | 1151 | `daf7a9b301a904abb4adbcd4c729df3e870f7fc95f215fc0ea5f9effb168ade1` |
| `build/AFRICAN_MANDATE_VIBECODING_BUILD_PREPARATION_v1/task_contracts/AM-BUILD-003-command-atomicity.md` | 1282 | `13c2ad069343a9da2bfca58c9cfbbfcbf4e2777bb29d71f47b5f554b495ef0af` |

## Promptbook v2 controls and templates

All files in this section are BUILD_PROPOSAL task/governance material. The Prompt 00 row is current; all milestone acceptance remains pending until independent review.

| Path | Bytes | SHA-256 |
|---|---:|---|
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/README.md` | 5648 | `ffb297d6d1c11f4cd6b33e5c9f9a3042890d8179f2d9e5eb50d39e7c8e6355a9` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/OWNER_GUIDE.md` | 1337 | `cacac9a6356573b5e5ff9297621f4d773d63985748be9a2130d0857f427f0b77` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/COMMON_AGENT_RULES.md` | 2210 | `693e700a3be406fb7e3434a7480fdf22078f6f1817fb5bf777736fc32daedcc3` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/BUILD_STATE_PROTOCOL.md` | 1867 | `5cda8846a13e617ff1d07ddef7923d5eb9fad29a18727c5f2099ad910e7d09a1` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/SOURCE_PRECEDENCE.md` | 1668 | `11f5ae4f81d950242129f49815588e25879c44ead8564ca2dff1462fc88b23ad` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/ACCEPTANCE_TRACEABILITY.md` | 5730 | `99817debe29df0b42ebd990ebc2f96087db33de95ab9437d097c2749538afc0e` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/templates/build-state.example.json` | 4008 | `54423b2504953742f2e9b15ca049d5d24667227fe10372d9a460518fef9b0d0a` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/templates/build-state.schema.json` | 1323 | `7bfa9722ba1f7eed3772078fa6d7b1866770ae248c896abea154799752a22ba0` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/templates/decision-ledger-template.md` | 224 | `78f5288300c554a81340e2fca1e8481cd21a22d3c29d5563acc6db4dbe0e6fbc` |
| `build/AFRICAN_MANDATE_PROMPTBOOK_v2/templates/handoff-template.md` | 523 | `4378ea196f30ab6922b6d7204320fb2a293be5659df6423981bdb47f9d686333` |

### Numbered prompt hashes

| Prompt | SHA-256 | Prompt | SHA-256 |
|---|---|---|---|
| `00_REPOSITORY_AUDIT.md` | `b3d91f2b12d0263d4d2c3de1ada22e74ee5096458c0dde25677ef0557a0b5642` | `15_MANDATE_CASES.md` | `e731b16f11a26b66baba9f9e051832c16cc1c68f643bcc25af6b8cd597ca3e91` |
| `01_GOVERNANCE_FREEZE.md` | `d220778e81d94108bea9c9ecbecaaa604a5bcf859c6e962bee7606cb9c2b04e0` | `16_EVENT_DIRECTOR.md` | `b5d13123b5c8af22c65272d6f8a433f061fcaab8c632ca9414fc09fcea22cd5a` |
| `02_WORKSPACE_CI.md` | `1695b8a062e9113dd8da517ce3d151cfc1c7d2efac5cfca062b0386e5675618d` | `17_NARRATIVE_FALLBACK.md` | `f6eff14758da99cc1c1ce00c0b9aa6928cbdd12abcdf60013dd6be7ce9662f0d` |
| `03_DOMAIN_SCHEMAS.md` | `ab561791e1b805b7990f9999831e20a8b428f10293fd3693ff31a65ad627ca53` | `18_FOUR_MONTH_CONTENT.md` | `5faecabc8b52558a357469cfc60d8c066dea4dc99bd3b5f15b576b6d0cc5d2fa` |
| `04_DETERMINISM.md` | `91bc67e6916a4d8b64ef6db40b01bd633eacd303ba5a93e846170b0dedfafe5b` | `19_HEADLESS_ACCEPTANCE.md` | `cae36db7caf5274e7bae8181ed34157a011e28a415fac31aa0aeb23e8985b344` |
| `05_APPLICATION_PORTS.md` | `cfaf2292a5bf013c37300edec1605b093f0d02856d669feeda082611353262cd` | `20_APPLICATION_ADAPTERS.md` | `0f3d40e5869ee25d0c3e973aae0407ec963610ff3ba4a8511d29abec1695e0e2` |
| `06_FIXTURE_KERNEL.md` | `12e322c4bce7308132b0d08cc70c3a724669d7d174b90291eb8c4f8a86af29b0` | `21_UI_SHELL.md` | `28f43bb5dcbb255413b99b227fa6f5a9fb6af4feb1a9e3dba4a498ecd88c345e` |
| `07_COMMAND_RULES.md` | `c8a88aa56dd15f552d1c360732f3755253f0c7be26bedfe6a8a2ad1272ea581f` | `22_UI_MAP_DOCS.md` | `3989756636de9c430dcb274fc6dd2837cd6762eeb875b7c3615b1805ebf497be` |
| `08_COMMAND_ATOMICITY.md` | `85cb9b6575e5890ef584790e1ef56fbe4afd5dea3c9c3df303005b33b0f30e54` | `23_UI_DECISIONS.md` | `c69b4fab824a4cde284c8afb841987e18a2806a35b245309f0ebc6f76f174cf6` |
| `09_TURN_ENGINE.md` | `cd36f364e44485f7a096ce13fca60ea733a4706d415022a02256393dcd30f002` | `24_UI_EDITORIAL_QA.md` | `cc3e56a04fa92e968a0c196c080c31191f5a0e1805f79c0acf9b18911316eb05` |
| `10_WORLD_SUBSYSTEMS.md` | `32f3fd33ce849872b5dc91b72a8e5a9722bf119ceaaf7a6c288107a1616d6b94` | `25_DATA_GEO_TRACK.md` | `2d78004a61c1b8c3f25480376de9f5004b5a7b3d8a0ea785f1ec41f175b565f8` |
| `11_EVIDENCE_KNOWLEDGE.md` | `fed3c47b1a1520be83321419d7eecab7714dc40037d9d8195707e791b60355f0` | `26_SCENARIO_APPROVAL.md` | `adff437a8f553f606f660df6d07fe0d547dd99d86bb63809e62b72f200b06325` |
| `12_ACTOR_MEMORY.md` | `98a86c4ed8318f7f4eb7b5247a06d679200c4c914458428debfe7f936c2edb44` | `27_FULL_CAMPAIGN.md` | `0d0b5f4df58c0b89bfd91f40822c9d19ea4bc9e1cb9c2e74416e6c70993cd43b` |
| `13_ASSESSMENTS.md` | `75b955105813564450e8b520b44dffc386a41319add3b5673483d5cc2b7bfd36` | `28_LEADERBOARD_SERVICE.md` | `af26a619723e4120dc51e6dfb78a0bc621d533e8d54ae7cd0efb3e1d973860f5` |
| `14_CONSULTATIONS.md` | `fdc3d6269a7c267f2197f4d110c8b06fb400b4de4008ca92ea79d369e1104f1f` | `29_RELEASE_DECISION.md` | `e8a70e867bca25fd3c2ec716fe2eb5b36aca0acfa93c5555ab89063bdd6032bb` |

All numbered prompt paths are relative to `build/AFRICAN_MANDATE_PROMPTBOOK_v2/prompts/`.

## Unavailable or unresolved canonical artifacts

| Artifact | State | Consequence |
|---|---|---|
| Accepted `docs/build/BUILD_STATE.json` | Unavailable; Prompt 01 responsibility | No prompt, including Prompt 00, is recorded as ACCEPTED |
| `docs/build/DECISION_LEDGER.md` | Unavailable; Prompt 01 responsibility | Conflicts/open choices are not yet durably governed |
| Canonical `docs/source/` directory named by Promptbook v2 | Unavailable; supplied specifications are directly under `docs/` | Canonical-location policy requires governance; do not duplicate sources silently |
| Exact Node, pnpm, TypeScript runner, GIS tool versions | Unavailable/unapproved | Workspace bootstrap cannot claim reproducibility |
| Approved five-country boundary source/edition/admin level/crosswalk | Unavailable | Real map and regional baseline compilation blocked |
| Complete admitted source-native finance data | Unavailable | Finance baseline compilation blocked |
| Reviewed ACLED coverage/grain, source licences, and redistribution permissions | Unavailable | Production historical baseline and public derivatives blocked |
| Vetted institutional authorization procedures and actor/balance profiles | Unavailable | Production authorization mechanics blocked |
| Approved indicator and leaderboard formulas/cohort rules | Unavailable | Numerical headline indicators and competitive ranking blocked |

## Reproduction

From the repository root, an independent reviewer can recompute any entry with:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath '<repository-relative-path>'
```

The reviewer must compare the lowercase hexadecimal value to this manifest and verify every path, including the owner-confirmed `docs/DESIGN_STANDARDS.md`, is tracked at the reviewed commit.
