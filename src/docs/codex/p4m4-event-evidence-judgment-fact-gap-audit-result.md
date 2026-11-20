# FILUNE P4-M.4 Event Evidence Judgment Fact Gap Audit

## Final result

```text
EVENT_JUDGMENT_FACT_GAP_CLASSIFIED
```

P4-M.3B's two source cases failed for different reasons.

- **Case 1:** the active stopped-combination effect is present in the Judgment snapshot, but the source-described current YongShen role for Luck 庚 is absent. This is a `JUDGMENT_COMPUTATION_GAP`.
- **Case 2:** the combination effect and stopped 印 role are both present. The adapter does not link them by relation and participant IDs. This is not a Judgment fact gap; it is an Event Adapter consumption/linking gap.

No application code, Judgment/Event Timing rule, fixture, expected value, or source interpretation was changed.

## A. Full mapping audit

Master 15 §6A has **11 mapping rows**. I audited 16 Judgment/output fact families: StemRelationFact, BranchFact, ActualStructuralFunction, FormulaFact, PatternContext, RoleHistory, CurrentRole, CombinationEffect/history, LuckEffectState, RootFact/RootState, Formation, Capacity, Money Outcome, Relationship Outcome, explicit event context, and scope/parent/validity.

| Mapping Row | Required Fact | Judgment Internal | JudgmentResult Exposed | Current State Available | Gap Class | Fix Needed |
|---|---|---|---|---|---|---|
| Contract support `document_support` | Known contract context; document-function relation/role path, direction, scope | Relation, function, PatternContext and roles are calculated | Not in registry `JudgmentResult`; available in `LuckScopeState` consumed by Event Timing | Operating/reduced and effects available; case 1 Luck 印 role absent | **B** (case 1) | Calculate source-described current Luck YongShen role from existing role policy |
| Contract obstruction `document_obstruction` / `support_function_stopped` | Damaged document function, linked relation/effect, role target and scope | Relation and stopped `CombinationEffect` are calculated | Available in internal snapshot | Case 1: stopped effect exists, 印 role absent. Case 2: 印 role stopped and combine effect stopped | **B** case 1; case 2 has no Judgment gap | B: role computation. Case 2: adapter must link existing role/effect |
| Contract instability `institutional_instability` | Current 官 function, adverse linked relation, role and contract context | Relation/function/role calculations exist | Available in snapshot | Operating/reduced/inactive/deferred distinguishable | No gap | Keep source-linked 官 path gate |
| Contract binding / finalization `binding` | Effective 合 linked to support; finalization also needs upper event opportunity and Day function | Relation, combination and lifecycle calculations exist | Available in snapshot | Binding possible; end-to-end Day finalization not available | **B** (Day subset) | Connect current Day event path and its upper-scope gate; keep Day deferred meanwhile |
| Contract dispute / process trouble `contract_trouble` | Source-linked adverse function and known contract process | Relation/function/role/lifecycle exist | Available in snapshot | Current state distinguishable | No gap for generic process trouble; legal claims **C** | Do not generate lawsuit, legal dispute, or counterparty conduct |
| Business activity support `business_activity_support` | Explicit business context, current output relation and realized-result evidence | Relation/function/role calculations and Money Outcome exist | Snapshot and OutcomeFact can be passed to adapter | Operating/reduced and Money lifecycle available | No gap | Combine existing facts; no isolated 食傷/財 shortcut |
| Business start support `business_start_support` | Explicit start goal, current activity/result path and Sewoon/Month scope | Relation/function/role and scope chain exist | Available in snapshot | Current function and scope state available | No gap | Keep explicit context and SOURCE_INFERENCE gates |
| Business expansion support `business_expansion_support` | Known operating business, Daewoon/Sewoon path, Month corroboration, separate Money axes | Relation/function, Outcome and parent scope exist | Available to adapter | Current scope/lifecycle available | No gap | Missing source-positive fixture is not a Judgment fact gap |
| Business adjustment need `business_adjustment_need` | Known business; Daewoon support and same-path adverse Sewoon function | Relation/function/role/scope chain exist | Available in snapshot | Reduced/inactive/stopped and scopes distinguishable | No gap | Preserve same-path condition |
| Business restructure `business_restructure_trigger` | Current change relation linked to business target/function/root | BranchFact, RootFact/RootState and relation/function exist | Available in snapshot | Current effect and weakened root distinguishable | No gap for linked subset | Join existing Branch/Root facts; no clash-only inference |
| Business execution obstruction `business_execution_obstruction` | Known start/operating context and current obstruction on that same path | Relation/function/role/scope calculations exist | Available in snapshot | Current lifecycle and period available | No gap | Emit only with a separate source-linked adverse path |

`business_result_support` is an adapter evidence type, not a separate Master 15 §6A row. It was audited as realized-result evidence within the business activity row.

## B. Public output and current state

`src/lib/judgment/types.ts`'s registry `JudgmentResult` contains `facts`, `evidence`, `applications`, and `completeness`; it does not declare the rich typed scope fields (relations, actual functions, roles, combination/luck lifecycle). The Event Timing adapter does not consume that registry result directly. Its input is `EventEvidenceInput.scopes[].snapshot: LuckScopeState`, and `runInternalReading()` returns the internal `judgmentCore` snapshots used on the existing pipeline. Therefore this is **not a general exposure gap on the current Event Timing path**.

- `StemRelationFact` contains ID, `generate/control/combine`, source/target IDs, TenGod labels and participant scopes. Branch relations appear in `branchFacts`; actual origin is available through structural effects and lifecycle records.
- `ActualStructuralFunction` carries relation ID, policy/direction/evidence status, `operating/reduced/inactive/deferred`, runtime/root/formation/capacity and structural effect.
- Role history and current role are separate. Current state distinguishes `operating/reduced/inactive/deferred` and `active/weakened/stopped/conditional/protective_standby`. `pathRefs` do not always equal a relation ID: some YongShen roles refer to a PatternContext ID.
- `combinationEffects`, history and `LuckEffectState` expose effect, participants, source relation, origin scope/period, current effectiveness and expiry. `stopped` and `weakened` are distinguishable.
- `PatternContext` exposes provisional/final context, pattern mode, manifestation/effective YongShen and relation references; natal and current Luck contexts remain separate.
- Money and Relationship Outcomes can be passed independently. Neither a Money fact nor a Relationship fact alone establishes contract/business timing.

## C. Contract source case 1

Source: `src/docs/source/primary/07-사주풀이예시.md` §1131–38. The source states that under 庚戌大運/丙午年 the Wealth condition remains usable while Luck 庚偏印 is controlled by natal 乙傷官, making documents/contracts unfavorable.

```text
source interpretation:
  wealth path remains usable; Luck 庚 Resource/document function is impaired
  → contract/document negative

Judgment scope:
  greatLuck 庚戌
  → stem relation 乙(傷官) combine 庚(偏印) [AVAILABLE]
  → CombinationEffect stopped, currently effective, sourceRelationFactId present [AVAILABLE]
  → ActualStructuralFunction for combine = operating / direction deferred / policy null [AVAILABLE, direction unresolved]
  → current YongShen role for Luck 庚 [MISSING]
  → EventEvidence stopped-support gate [NOT REACHED]
```

The source-transcribed snapshot has a current YongShen role for time 丙 only; it has no current role for Luck 庚. The stopped combination event itself is already calculated and present in `combinationEffects`. The remaining missing Judgment fact is the current role/function assignment for source-described Luck 庚. Classification: **`JUDGMENT_COMPUTATION_GAP`**. It would be inaccurate to say the stopped combine fact itself is absent.

The P4-M.3B verifier also built Money Outcome from natal only and passed `referenceTime: ''`. Thus its `moneyAcquisition=false` does not test the source's “wealth condition remains usable” statement. Money Outcome is not itself a required gate for contract obstruction. A later source regression should separately pass the existing Money API's scoped `luck` inputs to preserve the independent axis.

## D. Contract source case 2

Source: `src/docs/source/primary/07-사주풀이예시.md` §1958–67. It states that a real-estate contract incurred loss under 己酉大運/甲辰年, describing the 甲印/己食神 combination and Wealth activation.

```text
source interpretation:
  resource/document function is lost under 合; wealth also activates
  → real-estate contract loss / document difficulty

Judgment scope:
  greatLuck 己酉 + natal month 甲寅 combine [AVAILABLE]
  → CombinationEffect stopped [AVAILABLE]
  → RoleHistory YongShen for natal month 甲 [AVAILABLE]
  → current RoleState for natal month 甲 = stopped / inactive [AVAILABLE]
  → yearly 甲辰 + greatLuck 己酉 combine [AVAILABLE]
  → annual CombinationEffect stopped [AVAILABLE]
  → Adapter exact `role.pathRefs.includes(relation.id)` join [MISSING IN ADAPTER]
  → EventEvidenceFact [NOT REACHED]
```

The stopped state and role are both in `LuckScopeState`. Role `pathRefs` refer to PatternContext, while the combine record provides the source relation and participants. `stoppedRoleForTenGod()` insists that role path refs directly contain the stem relation ID, and the adapter does not inspect `combinationEffects` for this gate. This is an **Event Adapter linking/consumption issue**, not a Judgment fact gap. P4-M.3B's `JUDGMENT_FACT_GAP` label was too broad for this case.

## E. Counts and classifications

```text
Event Mapping rows audited: 11
Required Judgment/output fact families audited: 16
JUDGMENT_EXPOSURE_GAP: 0
JUDGMENT_COMPUTATION_GAP: 3 row-scope findings
SOURCE_OR_POLICY_GAP: 2 bounded claims
No Judgment gap: 8 rows/subsets
```

The three computation findings are the source 1 Luck-role assignment across contract support/obstruction, plus the Day-finalization subset of the binding/finalization row. The two source/policy limits are legal dispute/lawsuit/counterparty claims and the lack of a distinct §6A evidence gate for contract termination (even though §5 defines its event meaning). Keep those at `SOURCE_GAP`/`DEFERRED` pending a source/mapping audit.

## F. Positive path blockers

| Path | Status | Finding |
|---|---|---|
| Contract positive support | READY (conditional) | Adapter branch requires current relation/function/role/context. No source-positive fixture is a fixture gap, not a Judgment fact gap. |
| Contract delay | READY for existing evidence type | Sewoon/Month obstruction-to-delay policy exists. Source-negative snapshots hit the combine/role issue above. |
| Business activity/result | READY (conditional) | Current Food/Hurting-to-Wealth relation, role, Money corroboration and explicit operating context are consumable. |
| Business start | READY (conditional mapping) | Start context and current path/scope are available; preserve SOURCE_INFERENCE. |
| Business expansion | READY (conditional mapping) | Daewoon/Sewoon/Month and independent Money axes are available; source-positive fixture remains absent. |
| Business adjustment | READY (conditional mapping) | Supportive long scope and same-path adverse annual scope are available. |
| Business restructure | READY for linked subset | BranchFact, RootState, source relation and current effect are available. |
| Business execution obstruction | READY (conditional mapping) | Current function/lifecycle and explicit context are available; absence of positive evidence alone cannot create delay. |

## G. Adapter recomputation audit

The adapter does not calculate new Judgment relations, TenGods, clashes or generic good/bad status. It reads participants' precomputed TenGods, relation action, `ActualStructuralFunction`, roles, current effects, Root/Branch facts and scope lifecycle.

- `validOutputToWealth` combines an existing relation action/TenGod pair with current function, role and Money evidence. It does not recalculate TenGods. It does not consume `FormulaFact` directly, but the required relation facts are present; no Judgment fact gap follows.
- `business_restructure` links already-produced branch clash and root facts by participant ID. It does not recalculate the clash.
- Stopped contract support currently requires `ActualStructuralFunction.function === inactive`, `structuralEffect.blockedBy`, and a matching stopped role. The existing `combinationEffects(effect=stopped)` and source relation are not used by this gate; this is the direct adapter omission for case 2.
- `roleForTenGod` / `stoppedRoleForTenGod` do not assign roles; they filter existing role history/current state by exact path reference. The gap is that they do not join the existing role entity to a relevant combination participant/effect when path refs carry PatternContext IDs.
- Scope GanZhi derivation and `luckPeriodStatus` read existing participants/validity. They do not add a new structural judgment.

```text
Judgment facts redundantly recomputed by adapter: 0 명리 판정
Judgment facts safely reused: Relation/Branch, ActualStructuralFunction, Role,
  PatternContext, combination/luck lifecycle, Root/Formation/Capacity,
  Money/Relationship Outcome and explicit customer context
Event-only semantic mappings: 11 Master 15 rows
```

## H. Minimum fix set and priority

| Priority | Minimum fix candidate | Files | Existing calculation reusable? |
|---|---|---|---|
| P0 | Calculate current Luck 庚 YongShen role for source case 1 using existing role/pattern/function policy; preserve its linkage to the stopped combine relation | `src/lib/judgment/core/roleEngine.ts`; inspect `patternRoles.ts` / `luckScope.ts` for the missing upstream role input | Stopped combine already reusable; current Luck role is not calculated |
| P0 | Link stopped `CombinationEffect.sourceRelationFactId`/participants with the existing RoleHistory entity and CurrentRole in the contract obstruction adapter gate | `src/lib/eventTiming/eventEvidence.ts` | All source facts reusable; adapter join missing |
| P1 | Connect current Day event path and upper-scope gate for finalization; leave as a gap until then | Judgment daily path and Event Adapter boundary | Some scope types exist; end-to-end current event function is absent |
| DEFER | Legal dispute/lawsuit/party conduct and uncontracted termination criteria | No code change; revisit source contract separately | Current source/policy is insufficient |

```text
Files requiring Judgment exposure change: 0 (current Event Timing receives LuckScopeState)
Files requiring Judgment computation change: 1 confirmed target (roleEngine.ts; adjacent helper may be involved)
Event Adapter files requiring cleanup: 1 (eventEvidence.ts)
Master changes required: 0 for P0/P1; C items remain deferred
```

## I. A_rev179 path

```text
src/docs/source/A_rev179.md: MISSING
src/docs/source/authority/A_rev179.md: EXISTS
classification: TEST_INFRA_PATH_GAP
```

`verify-byeong-regression.mjs` reads the legacy path and failed with `ENOENT`. The authority file exists under `authority/`. This is separate from the Event Evidence/Judgment gap; this audit did not copy or move it.

## J. Audit boundary and regression

```text
src/lib files modified in P4-M.4: 0
Judgment / Event Timing rule changes: 0
fixtures or expected values changed: 0
new source interpretation: 0
git diff --check: PASS
```

This audit reused the existing P4-M.3B run and source snapshots; it did not rerun long regression suites. The prior P4-M.3B TypeScript/Build and P4-K.2/P4-K.2A statuses remain as recorded in their result files.

## Next step

P4-M.5 should make one minimal P0 fix: compute the missing source-described current Luck role in case 1 and let the adapter consume the already-computed stopped-combination/current-role path in case 2. Do not add a general Judgment event rule. Keep the source/policy limits classified C and deferred.
