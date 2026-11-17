# Execution context adapters (no judgment evaluator)

This layer expresses A rev179 OP-L01 comparison scopes and passes validated upstream
OP-L02/IR-01 carry references. It does not decide combinations, strength, roles or judgments.
Canonical, producer calculations, contract validators and existing evaluator are unchanged.

- `auditHiddenStemCompatibility` compares the untouched legacy table to explicit document
  observations. Those observations are audit-only, not a replacement calculation table.
  Full rows absent from the supplied documents remain unverified. Current result for all
  branches and the CS-005 input range is incompatible; no tolerance/filter is invented.
- `createExecutionScopeContext` requires stage, referenceTime and explicit producer period
  references (a supplied inspection window for natal). Canonical period boundaries are
  projected, not recalculated. Unknown boundaries remain unknown. Selection does not
  certify the underlying calendar or fabricate an OP-L01 application/approval.
- `selectExecutionCandidates` returns a view of existing fact IDs whose participants are
  included. Raw observation scope/provenance remains intact; contract execution binding
  and future rule application creation are still evaluator responsibilities.
- `adaptCarryContext` accepts empty input or an upstream contract bundle with an explicit
  producer-snapshot identity envelope. It reuses `validateContractBundle`, verifies the
  destination and entity provenance, then exposes existing sourceState/stage/validity/cause
  references. It creates no RuntimeState, rule result, consumption, or persistence action.
- `assessEvidenceAvailability` maps the 57 documented candidate IDs to direct/upstream
  independent-calendar-check requirements. Unrelated evidence IDs and regression records
  do not satisfy a request. Availability is not rule applicability or publication approval.
- `sourceDocumentEvidence` records real caller-supplied source text with matching flat
  front matter revision and section, provisionally. It does not certify claims, cross-check
  calendars, issue hashes or manufacture operator confirmations. File IO is caller-owned.
- `RoleJudgmentInput/Output` declare a future application-backed role boundary. The only
  initializer returns not-evaluated and empty roles. No case expected role is imported.

ReferenceTime comparisons only test explicit periods; they do not choose a lucky period.
An exact producer-root identity guards accidental reuse across canonical snapshots. It is
not a cryptographic identity or an ownership decision for persistence/orchestration.
The caller must pass truthful, valid upstream results; metadata checks cannot establish
that a future evaluator's astrological result is true.

The complete 12-branch audit, evidence policy and A/B/C/D readiness table are in
`src/docs/rules/CS-005-runtime-readiness.md`.
Run `npm run verify:judgment-runtime-context`; tests use generic non-CS calculation input
and synthetic upstream state solely to exercise integrity checks, not CS outcome fixtures.
