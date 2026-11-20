# FILUNE P4-J.1 Judgment Period Inheritance Fix

**Final: `READY_TO_RERUN_P4J`**

The CS-126 reproduction now completes the same 12-term monthly window, reaches Money Outcome, and the unchanged P4-J integration verifier ends with `MONEY_OUTCOME_BATCH1_COMPLETE`.

## Before

```text
CS-126:
12-month Judgment: stopped during the 12-term window starting 2026-11
last successful scope: monthly window beginning 2027-07-07T07:36:49.151Z
failing month: monthly window beginning 2027-08-07T17:26:25.904Z
failing function: carryForward(), called by evaluateStemCombination() in yearlyLuck
failure cause: Carry does not cover full destination period; boundary split required.
expected parent: selected Great Luck card 3, valid from 2027-07-19T16:30:00.000Z
actual parent: the same Great Luck card 3 and its valid current state
destination: Sewoon card 4, 2027-02-04T01:46:24.431Z through 2028-02-04T07:31:07.292Z
```

The source Great Luck state was valid only from July 19, while the yearly evaluation context used the full canonical Sewoon period beginning February 4. The strict carry validity check correctly rejected applying that source state before its start.

## Root cause and fix

| Item | Finding |
|---|---|
| File | `src/lib/judgment/pipeline/internalReading.ts` |
| Function | `runLuck()` inside `runSingleInternalReading()` |
| Bug | A yearly execution used its full canonical period even when the current Great Luck source began partway through that period. |
| Why CS-126 exposed it | Its Great Luck boundary falls inside Sewoon card 4; the August 2027 month evaluation inherited the new Great Luck state while the child context still began in February. |
| Fix | Yearly evaluation can now explicitly use the exact intersection of its selected canonical Sewoon period and selected Great Luck period. The selection refs and canonical cards remain unchanged. |
| Validation | `createExecutionScopeContext()` derives and validates the intersection; `assertExecutionScopeContext()` reconstructs it. `carryForward()` retains its full-validity guard. |

This changes the validity interval of the yearly runtime evaluation to the period where both selected scopes are effective. It does not change Luck boundaries, Judgment rules, roles, pattern decisions, or Outcome meaning. The parent reference and each monthly 12-term boundary remain canonical.

## After

| Check | Result |
|---|---|
| CS-126 monthly Judgment snapshots | 12/12 generated |
| Chronological month bounds | PASS · all 12 are non-empty and contiguous; first `2026-11-07T09:52:33.362Z`, last end `2027-11-07T15:38:35.026Z` |
| Parent scope | PASS · all 12 monthly snapshots point to their corresponding yearly snapshot; no wrong or future parent observed |
| Determinism | PASS · two identical CS-126 executions yielded identical monthly snapshots and IDs |
| Invalid inheritance / exception | 0 / 0 |
| Money Outcome reached | PASS · 21 Money OutcomeFacts produced in the dedicated CS-126 check |
| Unchanged P4-J verifier | PASS · `MONEY_OUTCOME_BATCH1_COMPLETE`; failures 0, provenance/orphan/wrong-scope/duplicate/assertion-policy counters 31/0/0/0/0/0 |

The pre-fix boundary failure was reproduced by the existing P4-J verifier before the change. The post-fix dedicated verifier is `scripts/verify-judgment-period-inheritance-p4j1.mjs`.

## Isolation

| Area | Change in this fix |
|---|---:|
| Judgment period context / pipeline | 2 existing files |
| Money Outcome semantics | 0 |
| Health Outcome semantics | 0 |
| Relationship Outcome semantics | 0 |
| Reading Assembly semantics | 0 |
| Master 14 / Outcome Assertion Policy | 0 |
| Personality, Work, Compatibility | 0 |

## Regression

| Verification | Result |
|---|---|
| Judgment | PASS · 35/35. Legacy verification source paths were absent from the workspace, so the current `src/lib/judgment` tree was copied into the existing temporary P4-K.2 regression workspace, where its established legacy source-document fixtures are available. No source or rule files were added to the repository for this workaround. |
| P2-A–G | PASS · 7/7 |
| P3-A–F | PASS · 6/6 |
| P4-B / P4-C | PASS |
| P4-E / P4-F | PASS · Relationship Batch 1 remains complete |
| P4-G / P4-G.1 / P4-H | PASS · Health Batch 1 remains complete |
| P4-I | PASS |
| P4-J | PASS · `MONEY_OUTCOME_BATCH1_COMPLETE` |
| P4-K.1 / P4-K.2 / P4-K.2A | PASS |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

## Final

```text
READY_TO_RERUN_P4J
```

The existing P4-J instructions and expected values were not changed. The existing P4-J integration verifier was run unchanged and now passes.
