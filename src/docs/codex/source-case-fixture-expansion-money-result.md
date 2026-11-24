# FILUNE — Source Case Fixture Expansion · Money Batch 결과

## 요약

`07-사주풀이예시`에서 출생 4주와 성별, 재물에 관한 전문가 판단 및 구조 설명을 함께 확인할 수 있는 사례 5개를 추려 source-pillar snapshot fixture로 등록하고 기존 Judgment/Money/Explanation/Plan 경로를 실행했다.

다만 다섯 사례 모두 원문에 양력 출생 연월일시가 없다. 따라서 `Canonical`의 `BirthInput → CalculatedChart`를 재현한 full runtime fixture는 0개다. natal 2건은 source에 적힌 4주를 그대로 넣은 natal snapshot 결과와 비교했고, 대운·세운·월 scope 사례 3건은 해당 scope를 실행하지 않았으므로 비교 불가다. 성공 조건인 “최소 5개의 Canonical 재현 source chart”는 충족하지 못했다.

추정 출생일, 시간대, 대운 시작일 또는 운 경계를 추가하지 않았다. 신규 명리 규칙, Outcome mapping, Master, Renderer는 수정하지 않았다.

## 후보 및 등록 분류

원문에서 적격 자료가 함께 확인되는 후보 5개를 찾았다. 이 5개를 정확한 원문 간지·성별 기반 snapshot fixture로 등록했다. 아래의 생년월일 칸이 비어 있는 것은 원문이 양력 날짜를 제공하지 않기 때문이다.

| Fixture | 원문 위치 | 출생 연월일시 | 성별 | 원문 판단 범위 | 분류 |
|---|---|---|---|---|---|
| `SRC-07-0982` | [07-사주풀이예시.md:982-990](../source/primary/07-사주풀이예시.md) | 양력 날짜 미기재; 庚申 己丑 丙午 己未 | 여성 | 원국 | snapshot 등록; Canonical 미충족 |
| `SRC-07-0952` | [07-사주풀이예시.md:952-961](../source/primary/07-사주풀이예시.md) | 양력 날짜 미기재; 戊辰 癸亥 辛卯 戊子 | 남성 | 丁卯 대운·乙巳 세운 | snapshot 등록; 운 scope 재현 불가 |
| `SRC-07-0999` | [07-사주풀이예시.md:999-1009](../source/primary/07-사주풀이예시.md) | 양력 날짜 미기재; 丁卯 丁未 丙寅 壬申 | 여성 | 庚戌 대운·甲辰 세운·庚午 월 | snapshot 등록; 운 scope 재현 불가 |
| `SRC-07-1026` | [07-사주풀이예시.md:1026-1031](../source/primary/07-사주풀이예시.md) | 양력 날짜 미기재; 丁巳 庚戌 丁卯 戊申 | 남성 | 원국 구조 및 실제 사업 사례 | snapshot 등록; Canonical 미충족 |
| `SRC-07-2328` | [07-사주풀이예시.md:2328-2338](../source/primary/07-사주풀이예시.md) | 양력 날짜 미기재; 乙巳 戊寅 乙未 丙戌 | 남성 | 丙辰 대운·癸卯 세운, 후속 丁巳 대운 | snapshot 등록; 운 scope 재현 불가 |

“등록”은 이 단계의 source-pillar runtime snapshot만 뜻한다. 사용자 입력에서 출발하는 Canonical fixture 등록으로 해석하면 안 된다.

## Source expectation 및 runtime 비교

Expectation은 별도 source metadata에 유지했다. 전문가 판단의 범위와 실행한 runtime 범위가 같을 때만 비교했다.

| Fixture | Source expectation (획득 / 유지 / 부담) | Runtime Money 결과 | 비교 |
|---|---|---|---|
| `SRC-07-0982` | 유리 / unresolved / 있음. 상관생재로 재물 조건이 있으나 상관·재성 관련 말썽과 신약 부담도 언급 | natal에서 `money_acquisition=can_earn, favorable, confirmed` 2건; `money_generation_method=ingenuity_and_expression, favorable` 2건. `money_retention` 2건은 deferred/unresolved이며 발행 semantic 없음. 별도 `money_pressure` assertion 없음 | 획득은 `MATCH`. 압박의 명시적 결과 축 미생성은 `PARTIAL` (`OUTCOME`); 유지 unresolved는 `MATCH`에 가까우나 비교 대상의 확정 방향 없음 |
| `SRC-07-0952` | unresolved / 불리 / 있음. 乙財·巳官 및 직업 변동, 재성 경로와 칠살 문제의 동시 작용 | natal snapshot에서 대운·세운 Money Outcome 없음 | `NOT_COMPARABLE_SCOPE` |
| `SRC-07-0999` | unresolved / 불리 / 있음. 운 재성이 인성을 치고 문서 자금이 묶이며 재물 흐름 제한 | natal snapshot에서 대운·세운·월 Money Outcome 없음 | `NOT_COMPARABLE_SCOPE` |
| `SRC-07-1026` | 유리 / 불리(실제 유출 사례) / 있음. 戊傷官→庚正財, 丁比肩 압박, 매출과 직원 실수·횡령 손실 공존 | natal에서 획득 `can_earn, favorable, confirmed` 1건, 수익 방식 favorable 1건. 유지 Outcome은 deferred/unresolved로 evidence context에 남고 고객 semantic은 없음. 독립 pressure Outcome은 없음 | 구조적 획득은 `MATCH`; 유지/부담은 실제 사건 보고와 natal assertion의 scope 차이를 고려해 `PARTIAL` (Outcome이 사건성 손실 축을 표현하지 않음). 실제 사건 발생을 natal runtime 결과와 직접 등치하지 않음 |
| `SRC-07-2328` | 유리 / 불리 / 있음. skill→財 수익 경로, 문서가 財를 묶는 운, 후속 食神生財와 내적 부담 | natal snapshot에서 지정 대운·세운 Outcome 없음 | `NOT_COMPARABLE_SCOPE` |

비교표의 `MATCH`는 source-transcribed natal snapshot과 natal runtime의 방향/축이 일치한다는 뜻이며, 출생일시를 통한 계산의 독립 검증을 뜻하지 않는다. `SRC-07-1026`의 100억 원에 가까운 연매출과 직원 실수·횡령 손실은 source가 직접 보고한 실제 사례다. runtime은 이를 새로 추론하지 않았다.

## Runtime 요약과 ID 연결

runner: [`verify-money-expert-source-case-snapshots.mjs`](../../../scripts/verify-money-expert-source-case-snapshots.mjs)
입력 metadata: [`money-expert-source-case-snapshots.json`](../../../scripts/fixtures/money-expert-source-case-snapshots.json)

- Snapshot producer: `runJudgmentCore`, `scripts/verify-money-expert-source-case-snapshots.mjs`
- Money producer: `buildMoneyOutcome`, `src/lib/outcome/money/moneyOutcome.ts`
- Explanation producer: `assembleReading`, `src/lib/reading/assembleReading.ts` 및 structural explanation assembly
- Customer Plan consumer: `buildCustomerReadingPlan`, `src/lib/reading/customer/buildCustomerReadingPlan.ts`
- 두 natal fixture의 acquisition 경로는 `OutcomeFact.sourceRelationIds`/`sourceRoleIds`와 provenance에 Judgment `p0-stem-relation:[…,"generate",actor,target]`, `structural-role:["SangShen",…]`, `07:L764,L984` 또는 `07:L764,L1028`, `OUT-MONEY-01`, `PA-600`을 보존한다.
- Explanation은 각 Outcome ID를 `outcomeFactId`로 참조하고 primary/supporting/competing/unresolved cause refs, `causePaths`, functional changes 및 provenance ID를 가진다.
- Plan Money semantic unit은 Outcome `meaningRef.recordId`와 `structuralExplanationUnitIds`를 참조한다. 0982에는 acquisition 2개 및 earning-method 2개, 1026에는 acquisition 1개와 earning-method 1개가 발행된다.
- 유지 Outcome은 deferred ID와 explanation/evidence context에 남고 semantic unit으로 승격되지 않는다.

ID는 관계 생성에 사용된 source entity가 달라 composite 형태가 길다. 예를 들어 1026의 한 획득 체인은 다음으로 이어진다.

```text
Judgment RelationFact
  p0-stem-relation:[…,"generate","SRC-07-1026:time:戊申:stem","SRC-07-1026:month:庚戌:stem"]
→ Structural Role
  structural-role:["SangShen","SRC-07-1026:time:戊申:stem",[…,"generate"]]
→ OutcomeFact
  money:["money_acquisition", <natal snapshot>, <generate condition>]
→ StructuralExplanationUnit
  explanation:[<위 OutcomeFact ID>,"money",<natal snapshot>,…]
→ Customer semantic unit
  reading:["outcome","outcome_fact","natal",…,<위 OutcomeFact ID>]
```

이 chain은 실제 `meaningRef.recordId`와 explanation reference로 연결된다. 세 운 scope 사례는 원문 대상 운을 Judgment snapshot 입력으로 실행하지 않았으므로 이 chain이 그 기간에 대해 만들어졌다고 주장하지 않는다.

## Source별 판단 핵심

### `SRC-07-0982`

원문은 상관생재의 부의 조건과, 상관·재성으로 인한 말썽 및 겁재가 상관을 생하는 불리함을 동시에 설명한다. runtime은 월간 己 상관→년간 庚 편재, 시간 己 상관→년간 庚 편재 두 생성 경로를 각각 별도 acquisition 및 수익 방식 Outcome으로 보존한다. 반면 원문에서 말하는 말썽/신약 부담을 Money pressure semantic으로 별도 발행하지 않았고 유지 Outcome은 deferred다. 따라서 획득 원리는 일치하지만 source의 동시 부담을 고객용 Money 판단 축에서 표현하는 데 부분 차이가 있다.

### `SRC-07-0952`

source scope는 丁卯 대운·乙巳 세운이다. 원문은 재성/관성 동시 유입, 직업 변경, 상관격·무근 일간 및 칠살 관련 문제를 함께 판단한다. natal only 실행으로는 해당 운 상호작용을 판정할 수 없으며, 비교를 위한 운 경계나 실제 시작 시점을 추정하지 않았다.

### `SRC-07-0999`

source는 庚戌 대운·甲辰 세운·庚午 월에 재극인, 진술충, 화기 상관의 활성과 문서/자금 유동 제한을 상세히 기술한다. natal only snapshot은 이 운 입력을 포함하지 않아 비교 대상이 아니다.

### `SRC-07-1026`

원문은 戊 상관이 庚 정재를 생해 부를 갖출 수 있다고 보면서 丁 비견의 재성 압박, 상관의 말썽, 직원 실수/횡령과 현금 유출을 함께 서술한다. runtime은 생성 관계에 근거한 획득·수익 방식은 포착했지만 source의 사업 운영 손실을 별도 획득/유지/압박 결과로 발행하지 않았다. 보고된 사건은 명시적으로 보존하되 natal runtime의 예측 결과로 간주하지 않았다.

### `SRC-07-2328`

source가 丙辰 대운의 peer→output→財 수익 경로, 癸卯 세운의 문서로 인한 재물 손상, 후속 丁巳 대운의 食神生財를 각각 구분한다. natal만 실행했으므로 세 경로를 runtime 대운·세운 비교로 재현하지 않았다.

## 반복 mismatch 및 결론

반복적으로 확인된 것은 서로 다른 두 제약이다.

1. **Fixture eligibility:** 승인 원문은 간지 4주와 성별을 제공하지만 양력 생년월일시를 제공하지 않는다. source-pillar snapshot 실행은 가능하지만 Canonical 재현은 불가능하다. 이를 해결하려면 source 자체의 날짜/시간 출처가 필요하다. 추정으로 채우지 않는다.
2. **Scope/runtime coverage:** 세 운 사례는 source의 실제 대운·세운·월 적용 범위까지 runtime으로 실행되지 않아 비교 불가다. scope mismatch를 엔진 오판으로 분류하지 않는다.
3. **Outcome coverage:** 두 natal 실행에서는 상관생재의 획득 경로가 source와 부합하지만, source의 부담·유출 설명을 별도 Money pressure/retention assertion으로 표현하는 coverage가 제한적이다. deferred retention은 publication에서 제외되고 내부 근거로만 남는다. 이것은 이번 단계에서 고치지 않았다.

Mismatch 1건만 근거로 engine을 수정하지 않았다. Master, mapping, Renderer 문구와 judgment rule도 변경하지 않았다. 다음 유효 단계는 날짜가 포함된 승인 source 사례를 찾거나 source 제공자에게 날짜 정보를 확보한 뒤, 최소 5건을 `BirthInput → Canonical`부터 실행하고 대운·세운 scope가 일치하는 경우에만 전문가 판단과 비교하는 것이다.

## 검증 산출물

- Snapshot runner 실행: 5 fixtures 처리 성공.
- source pillar 값 외의 출생 입력 추정: 0.
- Canonical 처리: 0 (출생 연월일 미기재).
- 대운·세운·월 scope를 원문과 동일하게 비교한 fixture: 0.
- natal scope 직접 비교 가능한 fixture: 2 (`SRC-07-0982`, `SRC-07-1026`).
- 기존 코어/Outcome/Mapping/Renderer 수정: 없음.
