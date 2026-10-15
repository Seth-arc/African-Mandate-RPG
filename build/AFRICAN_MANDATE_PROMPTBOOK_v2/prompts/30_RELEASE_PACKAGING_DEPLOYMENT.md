# Prompt 30 — Release packaging, CI and deployment

**Task ID:** AM-PB2-30  
**Track:** Production/release, environment gated  
**Prerequisite gate:** 24,27–28 ACCEPTED; release scope records whether Prompt 29 is required or authorized for deferral  
**Source authority:** Technical Architecture v2 build/deployment boundaries; Package 4 readiness and validation; accepted production artifact manifests

## Copy-ready agent instruction
You are implementing one bounded African Mandate milestone. First read `COMMON_AGENT_RULES.md`, `BUILD_STATE_PROTOCOL.md`, `SOURCE_PRECEDENCE.md`, and the referenced source files from the canonical source manifest. Compare current commit/hash with the latest ACCEPTED milestone and report preflight. If a required prerequisite is not ACCEPTED, do not implement dependent functionality; classify BLOCKED and report the missing evidence.

**Objective:** Produce a reproducible release artifact, enforce its gates in CI, and deploy it to an owner-approved staging target with rollback evidence.

**Implementation deliverables:** Add the smallest provider-specific build and deployment configuration for the approved target; define required environment variables without secrets; publish immutable application and production-data artifacts with hashes; make clean install, lint, typecheck, unit, determinism, production-data audit, production web build and Playwright browser tests required CI gates; deploy the exact built artifact to staging; document cache/security headers, asset paths, observability needed for smoke checks, and a tested rollback to the prior immutable artifact. Include the Prompt 29 trusted service only when the approved release scope requires it.

**Inputs and output contract:** Consume only accepted production artifacts and version-pinned toolchain contracts. Record target, artifact identity, environment contract, ownership and exact changed paths in `docs/build/handoffs/30.md`. Do not commit secrets, create an unapproved provider account, or make staging/prod rebuild different source bytes.

**Required executable tests and negative cases:** Clean frozen install and production build; CI proves build and browser tests are mandatory; preview/staging smoke covers initial load, artifact integrity, real campaign create/commit/end-turn/reload, static asset and route reload behavior; missing required configuration fails before deployment; no secret appears in client output or logs; rollback restores the previous artifact and its health check.

**Explicit exclusions:** No production-domain cutover or public launch, no provider choice without owner approval, no new product feature, no general cloud-save/account system, and no silent CI waiver. Apply all security, accessibility, provenance, licensing and hidden-state restrictions.

**Completion / gate:** One immutable release artifact is reproducibly built, CI-enforced, deployed to the approved staging target, smoke-tested and successfully rolled back or restored in a documented rehearsal. Execute all applicable project commands and publish actual logs, artifact hashes and a diff summary. Mark at most READY_FOR_REVIEW, never self-approve ACCEPTED.

**Stop conditions:** no owner-approved hosting target or credentials path; missing production artifact; secret exposure; build/browser gate failure; staging smoke or rollback failure; surprise modification outside task scope. Preserve work and provide the smallest actionable blocker.

**Handoff required:** use `templates/handoff-template.md`; include independent reviewer-ready reproduction steps, exact deployed artifact hashes, staging URL/health evidence where authorized, rollback evidence, exact acceptance IDs from `ACCEPTANCE_TRACEABILITY.md`, and downstream contracts changed.
