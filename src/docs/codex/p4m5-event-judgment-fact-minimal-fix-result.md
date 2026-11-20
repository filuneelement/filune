# FILUNE P4-M.5 Event Judgment Fact Minimal Fix

## Final result

```text
READY_FOR_P4N_EVENT_TIMING_AUDIT
```

P4-M.4's classifications and Master 15 meaning remain unchanged. The two expert contract cases now produce source-linked EventEvidence and EventTimingDecision results. No Gregorian period was inferred for either source snapshot.

## Minimal changes

| File | Change |
|---|---|
| `src/lib/eventTiming/eventEvidence.ts` | Link stopped combination effects to the exact relation participants and the source relation identity. For a Luck-manifested YongShen, consume its existing PatternContext manifestation rather than creating a natal RoleHistory. Also allow that existing current manifestation to qualify the positive document-support mapping only when the active linked path is favorable. |
| `src/lib/eventTiming/types.ts` | Add `sourcePatternContextIds` to evidence, decision and projected fact provenance so LuckManifestedYongShen remains traceable without mislabeling it as RoleHistory. |
| `src/lib/eventTiming/eventTiming.ts` | Carry the PatternContext provenance through Decision and calendar projection. |
| `scripts/verify-event-timing-p4m2.mjs` | Validate exact PatternContext provenance and recognize source relation IDs retained in combination history. |
| `scripts/verify-event-timing-decision-projection-p4m3b.mjs` | Accept the valid SG-097 PatternContext provenance path. Source expectations and date boundaries are unchanged. |
| `scripts/verify-byeong-regression.mjs` | Correct the confirmed test-only A_rev179 path to `src/docs/source/authority/A_rev179.md`; source content is unchanged. |

No Judgment evaluator, Money/Health/Relationship semantics, Reading Assembly, Master 15, or source interpretation was changed. In particular, no Luck role was added to natal RoleHistory; Master 05 SG-097's LuckManifestedYongShen distinction is preserved.

## Judgment gap accounting

```text
P4-M.4 computation gaps before: 3 row-scope findings
P4-M.5 computation gaps fixed: 2 contract row-scope findings now consume the existing Luck manifestation and linked stopped-effect facts
remaining computation gaps: 1 Day-finalization row-scope; remains ENGINE_GAP / NOT_IMPLEMENTED end-to-end
```

The remaining Day scope is the same existing Day engine boundary documented in Master 15 §10. It was not implemented or reclassified. The two P4-M.4 `SOURCE_OR_POLICY_GAP` items are unchanged: legal dispute/lawsuit/party-conduct claims, and contract termination without a distinct §6A evidence gate.

## Source cases

| Source case | EventEvidence | EventTimingDecision | Result |
|---|---|---|---|
| `SRC-07-1131-contract-negative` · `07-사주풀이예시.md` §§1131–38 | `support_function_stopped` emitted from the active stopped combination and source-linked Luck manifestation | `contract_delay` emitted; no `contract_favorable` | PASS · no interval projection; `not_projectable` |
| `SRC-07-1960-real-estate-contract-negative` · `07-사주풀이예시.md` §§1958–67 | `support_function_stopped` emitted through exact participant/effect linkage to the existing stopped 印 role | `contract_delay` emitted; no `contract_favorable` | PASS · no interval projection; `not_projectable` |

Case 1's source separately says wealth can be obtained while documents/contracts remain unfavorable. The Event Timing layer leaves that Money axis independent and does not turn it into a contract-positive fact. Its source-transcribed Luck snapshot has no Gregorian boundaries, so the existing Money API cannot establish a current scope-specific Money Outcome from this fixture; this Money assertion remains `NOT_TESTABLE_WITH_CURRENT_FIXTURE` here. The existing P4-I/P4-J Money integration verifier passed unchanged.

## Branch coverage

| Branch | Coverage type | Result |
|---|---|---|
| Contract positive (`contract_favorable`) | `CONTRACT_TEST_ONLY` | PASS |
| Contract negative / delay | `SOURCE_BACKED` cases 1 and 2; `CONTRACT_TEST_ONLY` delay branch | PASS |
| Business start positive | `CONTRACT_TEST_ONLY` | PASS |
| Business expansion positive | `CONTRACT_TEST_ONLY` | PASS |
| Business adjustment | `CONTRACT_TEST_ONLY` | PASS |
| Business restructure | `CONTRACT_TEST_ONLY` | PASS |
| Business adjustment/restructure source case | no qualifying source snapshot in these fixtures | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |

The source fixtures use unknown Gregorian boundaries exactly as supplied. No dates, birth times, or source facts were invented.

## Shortcut, provenance and isolation audit

```text
印 → contract favorable: 0
官 → contract favorable: 0
合 → contract favorable: 0
食傷 → business start: 0
財 → business expansion: 0
沖 → business restructure: 0
generic favorable/unfavorable → event: 0
unsupported exact date: 0
orphan EventEvidence / Decision: 0
source case Gregorian projections: 0 (both are not_projectable)
production false-positive event timing: 0
```

```text
Judgment semantic changes: 0
Money semantic changes: 0
Health semantic changes: 0
Relationship semantic changes: 0
Personality changes: 0
Compatibility changes: 0
Master 15 changes: 0
```

## Verification

| Verification | Result |
|---|---|
| P4-M.3B source semantic + contract branch + projection verifier | PASS · 2 source cases emitted Decisions; contract and business decision branches passed; all source projections remained `not_projectable` |
| P4-M.2 production wiring verifier | PASS · 4 BirthInput pipelines; 9 evidence facts; orphan, duplicate, scope, context, shortcut, mutation, assembly and free-leakage counters all 0; no event false positive |
| A_rev179 path correction / Byeong regression | PASS · 3 existing deferral cases; source content unchanged |
| Judgment P0 | PASS |
| Judgment P1-1 / P1-2 / P1-3 | PASS · 23 / 25 / 30 cases |
| Judgment P1 lifecycle | PASS · 13/13 |
| Judgment broad regression record | PASS · 35/35 in the recent P4-K.2A run; Judgment implementation was not changed in P4-M.5 |
| Money P4-I/P4-J integration | PASS · `MONEY_OUTCOME_BATCH1_COMPLETE`; assertion-policy, provenance, scope and free-leakage counters 0 |
| Health P4-H integration | PASS · `HEALTH_OUTCOME_BATCH1_COMPLETE` |
| Relationship P4-F integration | PASS |
| `npx tsc -b --pretty false` | PASS |
| `npm run build` | PASS |
| `git diff --check` | PASS |

The initial temporary broad-regression workspace was missing `tsconfig.app.json` and `tsconfig.node.json`; that temporary-run setup failed before testing. The required current P0/P1 and targeted P4 checks above passed, and the previously recorded 35/35 run is from the unchanged Judgment tree.

## Final

```text
READY_FOR_P4N_EVENT_TIMING_AUDIT
```

P4-M is closed for the approved Day-independent contract/business scope. Proceed directly to P4-N's source semantic, contract branch, and production calendar lanes. Keep Day finalization as `ENGINE_GAP`; keep both source/policy gaps deferred.
