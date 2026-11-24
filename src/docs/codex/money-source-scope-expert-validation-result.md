# FILUNE — Source-Scope Expert Validation · Money 결과

## 판정 요약

`Canonical E2E`는 실행하지 않았다. 본 실행은 source에 적힌 natal 4주와 명시된 luck 간지를 그대로 입력하는 `Source-Scope Interpretation`이다.

기존 `runJudgmentCore`는 natal→대운→세운→월운의 explicit scope chain을 모두 받아 snapshot을 생성했다. 결과 snapshot은 전부 `runtimeStatus=resolved`였다. 그러나 source에 날짜 범위가 없는 luck snapshot은 실제 작동 시점(direction)을 확정하지 못해 relevant `ActualFunction.direction`이 `deferred`로 남았으며, `buildMoneyOutcome`은 luck scope 결과 생성 전에 `validity`의 exact Gregorian from/to와 해당 `evaluatedAt`의 `effective` 상태를 요구한다. 경계를 추정하지 않았으므로 대운·세운·월운 Money Outcome/Explanation을 만들 수 없다. 이 경우를 비교 불가로 뭉개지 않고 요청한 `ENGINE_SCOPE_GAP`으로 분류했다.

따라서 source scope Judgment relation graph는 검사했지만, 5개 source 범위 전체에서 전문가식 Money 결과와 runtime Outcome을 직접 비교하는 성공 기준은 아직 충족되지 않았다. luck 세 사례에서 고객 결과가 틀렸다고 판정할 근거도 없다.

## 검증 경계와 실행 방법

| 유형 | 입력 | 이번 실행 |
|---|---|---|
| Canonical E2E | `BirthInput → CalculatedChart → Judgment` | 실행하지 않음; source Gregorian birth datetime 없음 |
| Source-Scope Interpretation | source natal pillars + 명시된 luck pillars → 기존 `runJudgmentCore` → Money Outcome → Explanation assembly | 실행. source 간지 그대로 사용; validity from/to는 명시적으로 unknown |

실행기 [`verify-money-source-scope-expert-validation.mjs`](../../../scripts/verify-money-source-scope-expert-validation.mjs)는 기존 engine을 호출하는 검증 harness다. Judgment/Money rule을 새로 구현하거나 수정하지 않는다. Source expectation은 기존 [`money-expert-source-case-snapshots.json`](../../../scripts/fixtures/money-expert-source-case-snapshots.json)과 원문 line references를 유지했다.

## 사례별 결과

### SRC-07-0982 — natal 기준선

**Source scope / 판단**: 원국 `庚申 己丑 丙午 己未`, 여성. [07:982-990](../source/primary/07-사주풀이예시.md). 원문은 상관생재와 언변·임기응변을 통한 부의 조건을 말하면서도, 상관·재성 관련 말썽, 설기와 신약 부담, 겁재가 상관을 생하는 부정 경로를 함께 기술한다.

**FILUNE Judgment / Outcome**: natal `PatternContext.branchPattern=傷官`. `己丑 상관→庚申 편재 generate` 및 `己未 상관→庚申 편재 generate` 두 RelationFact가 `HO-01 / favorable / operating`이다. 각 경로에서 `money_acquisition=can_earn`과 `money_generation_method=ingenuity_and_expression`이 favorable로 생성되어 서로 다른 두 source path를 보존한다. `money_retention=unresolved/deferred`가 각 acquisition path에 연결되어 내부에 남고 발행되지 않는다. `比肩→偏財 control` 및 `比肩→傷官 generate`는 Judgment에 있으나 function direction은 deferred다.

**원인 경로**:

```text
己 상관 ─generate→ 庚 편재
  → acquisition favorable + ingenuity/output earning method

丙 일간의 比肩 ─control→ 庚 편재, 比肩 ─generate→ 己 상관
  → relation은 존재하지만 평가 direction deferred; 부담/유출 결과 assertion 없음
```

**비교**: 획득 `MATCH`; source가 함께 말한 부담을 Outcome axis로 표현하지 않아 전체 결론 `PARTIAL`. 누락 축: 명시적 `money_pressure` 및 source가 말한 상관·재성 문제의 발행 가능한 부담 semantic. 유지 unresolved는 source 자체가 확정 방향으로 말하지 않아 mismatch로 세지 않았다. 원인: `OUTCOME` coverage, 이번에는 수정하지 않음.

### SRC-07-1026 — natal 기준선

**Source scope / 판단**: `丁巳 庚戌 丁卯 戊申`, 남성. [07:1026-1031](../source/primary/07-사주풀이예시.md). 戊傷官이 庚正財를 생하고 丁比肩이 재성을 압박해도 재성이 완전히 깨지지 않아 부를 갖출 수 있다고 한다. 실제 회사 매출, 직원 실수·일부 횡령 손해, 수입과 함께하는 경제적 등락 및 말썽을 서술한다.

**FILUNE Judgment / Outcome**: natal `傷官格`. `戊申 상관→庚戌 정재 generate`가 `HO-01 / favorable / operating`이며 acquisition과 earning method가 favorable. `丁巳/丁卯 비견→庚 정재 control` 관계도 존재하지만 policy와 방향이 확정되지 않아 deferred. retention은 unresolved/deferred internal evidence다.

**원인 경로**:

```text
戊 상관 ─generate→ 庚 정재
  → money_acquisition=can_earn, favorable

丁 비견 ─control→ 庚 정재
  → Judgment relation 존재, direction deferred
  → source의 직원 손실·분탈·변동은 Money burden/outflow Outcome으로 발행되지 않음
```

**비교**: 획득 `MATCH`; 전체 결론 `PARTIAL`. 누락 축: money outflow/division, burden/pressure. 실제 매출/손실은 원문에 있는 사건 자료이지만 runtime이 이를 새로 예측한 것은 아니다. 원인: `OUTCOME` coverage; 수익 외 부담 축이 표현되지 않았다.

### SRC-07-0952 — 丁卯 대운 + 乙巳 세운

**Source scope / 판단**: `戊辰 癸亥 辛卯 戊子`, 남성. [07:952-961](../source/primary/07-사주풀이예시.md). source는 원국의 상관생재 가능성과 약한 일간/지속성 제약을 말하고, 乙巳년의 乙 편재·巳 정관 및 직업 변화, 상관격에서 관의 활성 문제와 문서/식신·인성의 상호작용을 함께 설명한다. 기존 metadata expectation은 acquisition unresolved, retention unfavorable, pressure present이며 source 문구는 metadata에 보존했다.

**FILUNE Judgment**: source 간지 `丁卯`를 `greatLuck`, `乙巳`를 `yearlyLuck`로 넣었다. 두 snapshot 모두 `resolved`; 세운 snapshot에서 `食神→偏財 generate`, `比肩→偏財 control`, `偏財→偏官 generate`, `食神→偏官 control` 등 source 판단과 대조 가능한 관계가 생성됐다. 다만 관련 ActualFunction들은 `direction=deferred`다.

**FILUNE Outcome / Explanation**: scoped Money Outcome 0건, scoped StructuralExplanation 0건. `buildMoneyOutcome` exact validity/effective instant guard를 통과할 수 없어 분류 `ENGINE_SCOPE_GAP`이다. 여기서 `NOT_COMPARABLE_SCOPE`는 사용하지 않는다: source와 runtime 모두 같은 명목 scope label을 사용했지만 Money engine이 평가 결과를 내지 못했다.

**Causal comparison**: 원문은 乙財 및 巳官·직업변동, 관살 및 식신/인성 조절을 함께 판단한다. runtime은 해당 관계 후보는 계산했지만 작동 방향, 재물 획득·유지·부담 결과로 확정하지 않았다. Missing axes: acquisition, generation method, retention/outflow, pressure, protection 전부 Outcome 단계에서 미평가. Root cause: unknown time validity를 허용하지 않는 `Money Outcome scope eligibility`와 Judgment direction deferral (`ENGINE_SCOPE_GAP`).

### SRC-07-0999 — 庚戌 대운 + 甲辰 세운 + 庚午 월운

**Source scope / 판단**: `丁卯 丁未 丙寅 壬申`, 여성. [07:999-1009](../source/primary/07-사주풀이예시.md). source는 庚戌 대운의 재성이 甲辰 세운 인성을 극하고, 辰戌冲 및 庚午월의 재극인/상관·겁재 활성으로 돈이 문서에 묶이거나 흐름이 막히는 판단을 명시한다.

**FILUNE Judgment**: `庚戌` greatLuck, `甲辰` yearlyLuck, `庚午` monthlyLuck로 이어 붙여 실행했다. 대운·세운·월운 snapshot 모두 `resolved`; 월운 snapshot에 `劫財→偏財 control`, `偏財→偏印 control`, `偏財→偏官 generate` 등 관계가 있다. 그러나 direction은 모두 deferred.

**FILUNE Outcome / Explanation**: 세 luck scope에 대해 Money Outcome/Explanation 0건. 판정 `ENGINE_SCOPE_GAP`. source와 동일한 luck labels로 Judgment 관계는 생성됐으나, exact validity/effective instant 없이 Money outcome eligibility가 거부된다.

**Causal comparison**: source의 재극인·문서 자금 묶임은 `財→印` 경로 및 월 재성의 작용 여부가 핵심이다. runtime snapshot에는 재성→편인 control 관계 후보가 있지만 기능 방향·손상 판정이 deferred여서 “문서/현금 흐름 제한”을 생성하지 않는다. Missing axes: retention/outflow, protection 및 부담 판정; acquisition도 같은 기간의 Outcome으로 확정하지 못함. Root cause: `ENGINE_SCOPE_GAP`, rule mismatch로 단정할 수 없음.

### SRC-07-2328 — 丙辰 대운 + 癸卯 세운

**Source scope / 판단**: `乙巳 戊寅 乙未 丙戌`, 남성. [07:2328-2338](../source/primary/07-사주풀이예시.md). 丙辰 대운에서 skill/output을 통한 財 획득 가능, 癸卯 세운에서 문서가 財를 묶어 손상/지연시키는 경로 및 부담을 서술한다.

**FILUNE Judgment**: `丙辰` greatLuck, `癸卯` yearlyLuck으로 실행. 대운에는 `傷官→正財 generate`와 `比肩→傷官 generate` 후보가 있고, 세운에는 `正財`와 `偏印`의 `combine` 관계 등 source 검토에 필요한 상호작용 후보가 생성됐다. 각 주요 luck function의 direction은 deferred.

**FILUNE Outcome / Explanation**: scoped Money Outcome/Explanation 0건. `ENGINE_SCOPE_GAP`. 따라서 acquisition의 긍정과 문서 손상/제약의 동시성을 runtime Outcome 기준으로 비교할 수 없다.

**Causal comparison**:

```text
Source: 丙辰에서 peer → output → 財, skill-based earning
Runtime: 비견→상관 및 상관→정재 relation 후보; 작동 방향 deferred

Source: 癸卯에서 印/문서가 財를 묶고 재물 손상·지연
Runtime: 정재-편인 결합 관계 후보; 손상/보호 및 money retention/outflow 결과 미생성
```

Missing axes: acquisition/generation method, retention/damage, burden. Root cause: `ENGINE_SCOPE_GAP`.

### SRC-07-2328 — 후속 丁巳 대운

이 source scope를 이전 丙辰 대운의 다음 연속 luck으로 붙이지 않았다. 원문의 “후속 丁巳 대운”은 source label만으로 세운/기간 경계를 재구성할 수 없으므로 natal + explicit 丁巳 greatLuck의 독립적인 source-scope evaluation으로 실행했다.

**Source judgment**: 원문은 후속 丁巳에서 食神生財로 획득 조건이 좋아지지만 내적 압력은 남는다고 기록한다.

**FILUNE Judgment**: explicit 丁巳 대운에서 `食神→正財 generate` path가 계산됐으나 direction deferred.

**FILUNE Outcome / Explanation**: luck Money Outcome/Explanation 0건. `ENGINE_SCOPE_GAP`.

**Missing axes**: acquisition/generation method 및 coexisting pressure. Root cause: exact validity/evaluation instant guard.

## Money 축별 전체 coverage

| 사례/범위 | acquisition | generation method | retention | outflow/division | pressure/burden | protection |
|---|---|---|---|---|---|---|
| 0982 natal | 2 favorable Outcome | 2 favorable Outcome | 2 deferred unresolved | 별도 assertion 없음 | 별도 assertion 없음 | 별도 확정 assertion 없음 |
| 1026 natal | favorable Outcome | favorable Outcome | deferred unresolved | 별도 assertion 없음 | 별도 assertion 없음 | 별도 확정 assertion 없음 |
| 0952 丁卯+乙巳 | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP |
| 0999 庚戌+甲辰+庚午 | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP |
| 2328 丙辰+癸卯 | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP |
| 2328 후속 丁巳 | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP | ENGINE_SCOPE_GAP |

Luck 행의 반복 gap 표기는 서로 다른 Outcome mismatch를 뜻하지 않는다. 해당 scope 자체의 Money Outcome이 하나도 평가되지 않은 동일한 producer eligibility gap이다. `StructuralOutcome/Explanation`이 없으므로 competing/protection path를 Money 결과로 평가했다는 주장도 하지 않는다.

## 반복 후보 및 최소 후속 조치

두 natal baseline은 획득 경로를 포착하고 source의 동시 부담/유출을 독립 Money axis로 충분히 나타내지 않는다. 하지만 luck 세 사례는 부담 누락 여부를 비교할 Outcome 자체가 없어서 이 패턴이 3개 독립 운 사례에서 반복되었다고 볼 수 없다. 따라서 Outcome coverage 규칙을 수정할 근거는 아직 부족하다.

검증으로 확인된 선행 gap은 판단규칙이 아니라 scope/runtime 경계다. 날짜를 발명하지 않는 채 source label만으로 명리 작동을 비교하려면, 기존 `buildMoneyOutcome`의 exact-boundary requirement와 현재 Judgment direction deferral이 source-scope mode에서 어떤 기존 계약으로 허용되는지 먼저 확인해야 한다. 이번 요청의 코드 수정 금지에 따라 실행 adapter에서 exact period를 합성하거나 Outcome producer를 우회하지 않았다.

## 실행 결과

- Source fixture: 기존 5건 유지; 추가 synthetic fixture 없음.
- Evaluation runs: 6 (natal 2, 0952 1, 0999 1, 2328 丙辰+癸卯 1, 2328 후속 丁巳 1).
- Explicit scope snapshots: 0952=대운/세운, 0999=대운/세운/월운, 2328=대운/세운 및 후속 대운; 모두 `runJudgmentCore`에서 `resolved`.
- Luck scope Money Outcome / Explanation: 0건; exact validity/effective-time requirement 때문에 `ENGINE_SCOPE_GAP`.
- Natal comparison: acquisition 결과 재현; 동시 부담 축은 `PARTIAL`.
- Gregorian birth/luck boundaries inferred: 0.
- Outcome rule / Judgment engine / mapping / Master 수정: 없음.
- Runner: `node scripts/verify-money-source-scope-expert-validation.mjs` 성공.
