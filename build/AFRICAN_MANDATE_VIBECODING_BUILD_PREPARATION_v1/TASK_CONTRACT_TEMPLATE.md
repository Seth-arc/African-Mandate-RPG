# Coding-Agent Task Contract Template v1
```
Task ID: AM-BUILD-___
Title:
Status: PROPOSED | APPROVED FOR IMPLEMENTATION | BLOCKED | IMPLEMENTED | VERIFIED
Owner / reviewer roles:
Milestone and prerequisite task IDs:
Controlling sources: exact filename + sections
Goal / expected behavior:
In scope (files/modules/interfaces):
Explicit non-goals:
Allowed parameter classes: APPROVED / TEST_ONLY, with manifest ID
Inputs and pinned artifact versions:
Output files/contracts/API:
Knowledge/privacy/security boundary:
Failure cases and invariants:
Definition of done:
Tests to write BEFORE or WITH implementation:
Golden fixtures / seed / hash evidence:
Commands to run (actual script names after bootstrap):
Acceptance matrix rows:
Human signoffs needed:
Disallowed assumptions / unresolved questions:
Agent completion report: changed files, test outputs, schema diffs, proposed ADRs, remaining blockers
```

## Task acceptance rules
- Every task cites source authority and independent acceptance tests, not subjective 'works well'.
- Prefer <1 domain aggregate per task and a small reviewable code footprint; split unrelated effects.
- Reject scope creep and cross-layer imports. If new state is needed, open a Domain ADR and block the change.
- No 'ready' status for mere static lint. `VERIFIED` requires actual test execution and recorded evidence.
- No code touching production Sahel observed data without source/licence and validity approval.
