# Acceptance evidence

## AM-PB2-00 — Repository audit and source inventory

**Status proposed:** READY_FOR_REVIEW  
**Acceptance ID:** PB2-00  
**Base SHA:** `32686631558322be6757f2b6809acd83b255453b`  
**Independent verifier:** Verified  
**Owner sign-off:** Sign off

### Evidence produced

- `docs/build/SOURCE_MANIFEST.md`: SHA-256 inventory, authority classification, and missing artifacts.
- `docs/build/REPO_AUDIT.md`: repository, toolchain, code, test, branch, workflow, and blocker audit.
- `docs/build/handoffs/00.md`: reviewer-ready handoff and reproduction instructions.

### Static checks performed during the audit

- Confirmed the Git root, base commit, branch, remote, and pre-existing dirty path.
- Confirmed all manifest paths existed when hashed, except artifacts explicitly marked unavailable.
- Computed SHA-256 over exact bytes for every pre-existing file under `build/`, `docs/`, and `data/`, excluding the new `docs/build/` outputs to avoid self-reference.
- Confirmed no package manifest, lockfile, workspace file, application package, automated test tree, CI workflow, deployment configuration, or environment template exists.
- Confirmed the only pre-existing dirty path was `docs/DESIGN_STANDARDS.md`; it was not modified, and the owner subsequently confirmed it for inclusion as the official project design standard.

### Tests and negative cases

- Project tests: NOT_RUN; no project test runner or executable application workspace exists.
- Authoring validator: NOT_RUN; Prompt 00 does not change code, and static inspection found its default source path does not match the repository layout.
- Hash/path negative case: unavailable required artifacts are listed explicitly rather than assigned invented hashes.
- Source-admission check: the design standard is classified as owner-confirmed at the presentation layer and remains subordinate to higher-precedence project sources.
- Evidence-state negative case: authoring fixture presence is not reported as `STATIC_PASS` or `SIMULATION_PASS` because the validator and engine were not run.

### Source-to-test traceability

The source-to-acceptance crosswalk is recorded in `docs/build/REPO_AUDIT.md`. Existing Acceptance Matrix identifiers are `AC-001` through `AC-026`; the Prompt 00 reference to `AM-ACT` identifiers has no matching IDs in the supplied matrix and is recorded as a governance issue.

### Reviewer gate

An independent reviewer must recompute hashes, confirm changed paths are limited to Prompt 00 outputs, verify the dirty preflight record, and obtain owner approval for the next task. Only the reviewer/owner may change PB2-00 to ACCEPTED in the future build state.
