# Money Expert Comparison Batch 1 — Result

## Verdict

**PARTIAL / five-chart batch not executable from existing fixtures.** No application code, fixture, Master, or source document was changed. The requested result document is the only persistent addition.

The repository contains four source-backed expert charts: CS-005, CS-109, CS-126, and CS-127. Only CS-005, CS-126, and CS-127 have registered birth inputs in `scripts/fixtures/byeong-judgment-inputs.json`. The existing P4-J runtime run produced Money OutcomeFacts for CS-126 at its tested periods; CS-005 and CS-127 had no Money facts at the P4-J reference time. CS-109 has an exact source chart and a reconstructed birth date, but is not a registered runtime fixture. No fifth source-backed expert chart exists in the current authority corpus. The test-only `runtime-context` and synthetic policy fixtures were excluded.

Thus the five-chart comparison and “richest five” selection cannot be honestly completed without adding or reclassifying inputs, which this task prohibits. The trace below records the existing runnable evidence and the blocker; it does not treat absent Outcome data as an unfavorable judgment.

## Fixture inventory and selection

| Candidate | Existing source / input | Money runtime evidence | Use in this report |
|---|---|---|---|
| **CS-126** | Source chart in `C_rev215.md`; registered birth fixture; used by P4-C/P4-J | Richest usable trace: active acquisition and generation, plus deferred retention with competing causes | Deep trace |
| CS-005 | Source chart in `C_rev215.md`; registered birth fixture | P4-J at 2027-01-15 returned no Money OutcomeFacts | Runtime negative evidence; expert source comparison |
| CS-127 | Source chart in `25-7_rev16.md`; registered birth fixture | P4-J at 2027-01-15 returned no Money OutcomeFacts | Runtime negative evidence; monetary source comparison unavailable |
| CS-109 | Source chart in `C_rev215.md`; exact chart and reconstructed date recorded | No registered birth input or executed Money producer trace | Source-only; excluded from runtime comparison |
| Fifth chart | No fifth source-backed chart found in current authority corpus | None | Unavailable; not synthesized |

The authority casebook says it covers three original expert charts (CS-005, CS-126, CS-109). CS-127 is an additional source-backed regression case. Its full four pillars are `壬戌 壬子 辛未 丁酉`.

## Runtime run

Executed the existing P4-J integration verifier and the existing CS-126 real-chart vertical-slice runner. P4-J completed with `MONEY_OUTCOME_BATCH1_COMPLETE` (31 facts with provenance, no orphan/wrong-scope/duplicate IDs, no mixed-collapse or unsupported invention). The CS-126 runner used `2027-07-15T00:00:00.000Z`, evaluated Natal/Daewoon/Sewoon/Month snapshots, and reported 16 Money/Relationship OutcomeFacts, 16 Explanation Units, and 6 Plan semantic units in total.

### Chart: CS-126

- **Chart:** `辛未 戊戌 乙丑 丁丑` (female; source birth date is a reconstructed value).
- **Pattern / roles:** 戌월 戊 투출로 정재격. Source Master identifies 丁 식신 as 상신 and 辛 칠살 as 병; expert source describes `丁 → 戊 → 辛` and notes that the strong 財 can generate 殺 while 丁 supports/control is limited by position and period.
- **Money OutcomeFacts in selected July slice:** `money_acquisition / favorable / confirmed / active / month`; `money_generation_method / favorable / confirmed / active / month`; and `money_retention / deferred / deferred / deferred / month`. All retain source Judgment and relation provenance. The retention Explanation has 1 primary and 2 competing refs, with 0 unresolved refs; no protection/damage refs are reported on these selected Money units.
- **StructuralExplanation:** acquisition has 1 primary and 2 supporting cause paths, 0 competing, 0 unresolved. Its three source relations are the current month stem generating natal month stem, natal hour stem generating natal month stem, and Sewoon stem generating natal month stem. The selected active function is `WEALTH-01 / operating / favorable`.
- **Plan Money semantic units:** the active July acquisition Outcome reaches one `outcome_fact` semantic unit and references its Explanation Unit. The deferred retention Outcome creates no publishable semantic; it remains in `CustomerEvidenceContext` with its Explanation Unit ID. It is not a customer claim.
- **Causal chain:** `July 丁 stem → generates natal 戊 (財) → WEALTH-01 operating → favorable money acquisition`. Natal and Sewoon 丁→戊 paths support the same acquisition finding. No evidence here supports a claim that retention is favorable.
- **Diagnostic summary:**

```text
[획득] 유리 (specific active period assertion)
이유: Month 丁 generates natal 戊 財; the function resolves as operating/favorable.

[유지] 판단 유보
이유: a retention Outcome exists, but is deferred; its Explanation has two competing refs.

[부담 또는 제약] 판단 유보
현재 trace does not publish a retention or pressure conclusion.

[현재 고객에게 말할 수 있는 결론]
The Plan can state the confirmed acquisition assertion for the month, with its cause reference.
It cannot infer an overall “money is favorable” result or a favorable retention claim.

[시기가 확인되면] 2027-07-07 07:36:49.151Z – 2027-08-07 17:26:25.904Z
```

- **Net result:** dominant published Money axis is favorable acquisition for this exact monthly scope. Coexisting positive paths are the natal hour and Sewoon generation relations. Retention remains unresolved/deferred, not a competing negative assertion that can be netted into a score. No overall good/bad score is produced.
- **Expert-method assessment:** **PARTIAL.** The cause principle (食神 丁→財 戊, while 財 can feed the 病 殺 辛) is consistent with the source’s `丁→戊→辛` synthesis. However, the source casebook rates 2027 July `丁未` as **보통**, with the mid-month Daewoon transition and onset of the natal 상신’s suspension as context. The runtime assertion is a narrower monthly `money_acquisition` axis and should not be read as the source’s whole-month overall verdict. This is a scope/cause-selection comparability gap, not evidence that generation was inferred from a single Ten-God label. **Mismatch class: cause selection / comparison scope (PARTIAL), not a demonstrated engine defect.**

Compact ID chain (IDs are present in runtime; full deterministic IDs are nested scope/relation keys):

```text
Judgment: p0-stem-relation [Month stem generate natal-month stem]
→ StructuralFunction: structural-function [same relation, WEALTH-01, operating]
→ OutcomeFact: money_acquisition [Month, favorable, confirmed]
→ Explanation: explanation [same OutcomeFact; 1 primary + 2 supporting]
→ Plan: reading [outcome_fact; same OutcomeFact; Explanation ref]
```

Retention follows a separate chain through Outcome and Explanation, then remains internal evidence because lifecycle is deferred; it does not enter Plan semantic units.

### Chart: CS-005

- **Chart:** `甲辰 丙寅 戊子 壬戌`; source pattern is 七殺格, with 丙印/甲殺 as source roles, 壬·子 as 病, and 戌 as 救應.
- **Runtime:** the existing P4-J run at `2027-01-15T00:00:00.000Z` emitted `fixture CS-005 []`: no Money OutcomeFacts, so there are no Explanation or Money Plan units to compare for that run. This is absence of an assertion in the tested scope, not “unfavorable.”
- **Source cause principle:** the expert source says 壬 and 子 damage the structure and 戌 controls 子; it also warns that 子辰/申 can strengthen the water path. This is a multi-path structure, not “財 exists, therefore favorable.”
- **Diagnostic:** acquisition/retention/burden are all **판단 유보 in runtime**. Current customer Money conclusion: none. Period: none. Expert-method alignment is **NOT TESTABLE** for Money Outcome mapping because the runtime emitted no Money assertion in the tested period. No root cause is assigned from missing data alone.

### Chart: CS-127

- **Chart:** `壬戌 壬子 辛未 丁酉`; source regression confirms 子월, 식신격 plus 천간 壬 상관, 지지 상신 酉, and 병 未·戌 under the current approved rules.
- **Runtime:** the existing P4-J run at `2027-01-15T00:00:00.000Z` emitted `fixture CS-127 []`: no Money OutcomeFacts for that run. No Money Explanation or Plan unit was produced.
- **Diagnostic:** acquisition/retention/burden are **판단 유보 in runtime**. Current customer Money conclusion: none. Period: none. The source regression documents structural rule changes and monthly fortune judgments, but the inspected section does not provide a comparable runtime Money assertion. Expert-method alignment is **NOT TESTABLE** for money; no engine or mapping mismatch is inferred.

### Chart: CS-109 (source-only candidate; not a runtime fixture)

- **Chart:** `戊申 癸亥 癸巳 癸亥`; exact source chart is documented, but `byeong-judgment-inputs.json` has no CS-109 key and the Money producer was not run for it.
- **Source cause principle:** 亥월 겁재 구조; expert source cites 巳財 damaged by the two 亥 paths, 戊官合癸 and therefore inactive, while later skill/output paths may revive financial results. This is the strongest source candidate for competing and period-specific money paths, but it cannot be counted as executed runtime evidence under this batch’s “existing fixture” rule.
- **Diagnostic:** runtime acquisition/retention/burden and Plan result are all **not available**. Expert-method alignment is **NOT TESTABLE**. Minimal next step is to register/approve an existing source-backed canonical birth input as a fixture in a separately authorized run; this report does not create it.

## Comparison and root-cause summary

| Item | Result | Classification |
|---|---|---|
| CS-126 active acquisition cause reaches Plan | Yes; three generated cause paths resolve, with the current Month path primary | `NO_GAP` for this supported assertion chain |
| CS-126 deferred retention reaches publication | No, correctly; its causes remain in internal evidence | `NO_GAP` for publication safety; not a negative customer claim |
| CS-126 whole-month expert “보통” vs favorable acquisition axis | Different scopes; exact month also contains transition/pressure context | `cause selection / comparison scope`, **PARTIAL**, needs axis-aligned expert/runtime comparison before calling a mismatch |
| CS-005 / CS-127 Money Outcome | No facts in P4-J’s tested reference period | `NOT_TESTABLE_WITH_CURRENT_PERIOD`, not ENGINE_GAP or MAPPING_GAP |
| CS-109 | Existing source case, absent runtime fixture | `FIXTURE_GAP` for this requested execution, not a demonstrated system defect |
| Fifth real expert chart | Not present in the source-backed case inventory checked | Batch selection blocker; no synthetic chart added |

No observed result says “財 exists, therefore favorable,” “食神 exists, therefore monetizable,” or “比劫 exists, therefore money is lost.” P4-J’s integration checks also report no unsupported result invention or mixed-axis collapse. Those policy checks do not substitute for a five-chart expert comparison.

## Minimal next step

Keep the implementation unchanged. To complete Batch 1, the corpus needs at least one additional source-backed expert chart and runtime-ready inputs for the existing source cases intended for comparison. Then rerun axis-aligned periods and compare Money acquisition/retention assertions separately against the source’s exact period judgment. Do not count `runtime-context`, policy fixtures, or repeated CS-126 periods as additional charts.

## Commands and outcomes

- `node scripts/verify-money-outcome-integration-p4j.mjs` — **PASS**, `MONEY_OUTCOME_BATCH1_COMPLETE`.
- `node scripts/trace-real-chart-vertical-slice.mjs CS-126` — **PASS**; determinism reversal assertions passed; 0 unresolved causes on the selected acquisition and retention explanations.
- No application code, fixtures, Masters, or customer copy were changed.
