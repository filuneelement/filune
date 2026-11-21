# FILUNE Compatibility-00 구현 전 Readiness Audit

**최종 판정 — `COMPATIBILITY_BLOCKERS_CLASSIFIED`**

연애·결혼의 정적 궁합은 v1의 원자료 지원 범위다. 원자료에서 긍정·부정·혼합·비대칭을 비교할 3쌍을 확보했다. 두 명식의 관계가 한쪽의 병을 실제로 완화하거나 해로운 기능을 활성화하는 조건, 이를 증명할 교차 Fact, 두 사람을 입력받는 제품 계약은 아직 확정되지 않았다. 기존 FILUNE 명리 연산은 이 결정을 위해 다시 열 필요가 없다.

## 1. Authority와 정규화

적용 순서는 현행 Master → 현행 authority 및 승인된 override → 전문가 원자료 → 과거 revision과 감사다. Master 01은 월령의 지지 격과 천간 투출을 분리하고, 03은 관계·국을, 04는 Root의 존재·출처·현재 상태를 정한다. 05·06·09는 PatternContext와 실제 기능을 연결하고 RoleHistory와 현재 기능을 분리한다. 08의 원국→운 계약은 개인의 시간축에 적용된다. 11·12의 Personality는 별도 해석층이다. 14의 개인 Outcome과 15의 계약·사업 Event Timing은 각자 승인된 범위에서만 사용한다. [Master 목록](../rules/master/) · [현행 authority](../rules/authority/)

| Legacy/source terminology normalized | FILUNE 적용 |
|---|---|
| 원자료 07 §13의 寅卯辰·巳午未·申酉戌·亥子丑 ‘삼합’ | `SOURCE_WORDING_NORMALIZED`. 각각 木·火·金·水 방합. 세 글자 모두 필요하다. 원자료 06의 寅卯·卯辰·寅辰만으로 木을 강화하는 설명도 국이나 자동 강화로 이식하지 않는다. |
| 원자료 07 §13 사례의 寅戌 ‘반합’ | `SOURCE_WORDING_NORMALIZED`. 두 사람 사이 寅戌 관계만 남긴다. `half_combination = false`, 국 성립 및 火 자동 강화 없음. |
| 원자료의 ‘상파’ | FILUNE `破` 목록으로 계산한다. 원자료 표에서 생략된 子酉도 현행 목록에 속한다. 관계 해석은 교차 맥락의 별도 층이다. |
| 원자료의 높은 점수·좋은 점수를 주기 어려움 | 정성적 평어로 보존한다. 배점·가산·감점·가중치·순위로 옮기지 않는다. |

삼합은 亥卯未→木, 寅午戌→火, 巳酉丑→金, 申子辰→水다. 왕지 포함 짝 亥卯·卯未, 寅午·午戌, 巳酉·酉丑, 申子·子辰은 반합국으로 해당 오행을 강화한다. 亥未·寅戌·巳丑·申辰은 관계만 인정한다. 방합은 별도의 완성된 세 글자 조합이다. 육합·충·형·파·해의 원래 관계 판정과 통근·천간합·stop/weakened·RoleHistory·CurrentFunction·Byeong/GuEung의 현행 의미도 동일하게 적용한다. [Master 03 B-020~023, B-050~052](../rules/master/03-branch-relations-master.md#L185) · [Master 04](../rules/master/04-root-twelve-stages-master.md) · [Master 05](../rules/master/05-sangshen-byeong-gueung-master.md)

**Superseded rules ignored.** authority에 보존된 OP-Z03의 왕지 없는 일반 반합, 이에 기반한 과거 사례 결과, 원자료 06의 관계 강도 순서를 새 실행 계약으로 채택하지 않는다. 특히 현재 producer의 `isHalfCombination`은 왕지 없는 짝도 조회하는 관측 API다. `core.formations`의 `half`는 왕지를 요구한다. Compatibility는 producer의 `branch-half-combination`을 국·강화의 증거로 그대로 사용할 수 없다. 이것은 승인 규칙을 재논쟁할 항목이 아니라 재사용 경계다. [과거 OP-Z03 기록](../rules/authority/mapping-A.md#L2389) · [관측 catalog](../../lib/judgment/producers/relationCatalog.ts) · [Judgment formation](../../lib/judgment/core/branches.ts)

**Actual unresolved conflicts.** 정책을 뒤집어야 하는 확인된 `SOURCE_CONFLICT`는 0건이다. 교차합의 작동 기준, 암합의 탐색 범위와 기능, 귀문·격각의 전수표, 표와 사례 문구의 위치 불확실성은 아래의 실제 정책·근거·Fact 문제로 남긴다. [원자료 06](../source/primary/06-합충형파해.md#L484) · [원자료 07 §13](../source/primary/07-사주풀이예시.md#L3206)

## 2. 원자료에서 새로 확인한 Compatibility 계약

| 후보 | Source provenance | 확인된 범위와 한계 |
|---|---|---|
| 개인 판정 후 두 궁·두 명식 비교 | SOURCE_EXPLICIT · 07:3231–36, A I-21 | 각자의 배우자궁, 배우자성, 용신·상신·병·구응과 현재 작동을 먼저 확인한다. 연↔연, 월↔월, 일↔일, 시↔시를 따로 기록한다. 동일 위치의 궁 비교로 구조 작용에 필요한 교차 위치의 증거까지 제한하지 않는다. |
| 배우자성 분류 | FILUNE_APPROVED_OVERRIDE 범위의 고객 출력 제한 · 현행 I-15와 Master 14 | 남성 재성, 여성 관살이라는 기존 전통 참조 범위만 사용한다. 분류의 존재와 그 기능의 활성·손상은 별개다. 실제 배우자·혼인 상태는 입력 없이 추정하지 않는다. |
| 교차 relief, damage, harmful activation | SOURCE_EXPLICIT 사례 · 07:3279–83, 3313–16. 일반 실행 조건 DEFERRED | 제공자·수혜자·대상 기능을 분리한다. 천간 생·극·합의 존재와 교차 맥락에서의 실제 완화·손상·정지를 구별한다. OP-T04는 일간합을 궁합에서 참고할 수 있게 하며, 두 명식 합의 자동 합거·정지·합화를 승인하지 않는다. |
| 교차 Root 지원의 독립 방향 | SOURCE_EXPLICIT 사례 · 07:3281, 3314–16. 일반 실행 조건 SOURCE_INFERENCE | 약한 지원 기능의 뿌리를 보완하는 사례와 해로운 기능에 뿌리를 공급하는 사례를 함께 유지한다. 같은 Root가 소득 가능성과 칠살 부담에 함께 연결될 수 있다. |
| 원진·상파와 궁 관계 | SOURCE_EXPLICIT 참고 기준 · 07:3208–15, 3233–35 | 원진 및 破의 위치·참여자를 근거로 보존한다. 일지 충, 원진, 합 하나로 혼인 실패·성공 또는 궁합 확정을 내리지 않는다. 월 원진과 연 상파의 원자료 강조는 가중치가 아니다. |
| Personality interaction | SOURCE_EXPLICIT 사례 · 07:3322–24. 보편 정책 DEFERRED | 두 사람의 공통 인성·표현 부족이 마찰 가능성과 함께 나타난다. 각자의 성향 근거를 재사용할 수 있으며 유사성만으로 지원 방향을 결정하지 않는다. |
| 정적 궁합과 미래 지속성 | SOURCE_EXPLICIT 구분 · 07:3283, 3317–24. 두 사람의 시기 합성 DEFERRED | 한쪽의 미래 구조가 경제·생활 부담에 영향을 줄 수 있다는 사례를 참조한다. 관계 존속 기간·이혼·사망·질환·결혼 날짜를 이 근거로 단정하거나 예측하지 않는다. |

[Authority I-15](../rules/authority/mapping-A.md#L1128) · [I-21/OP-R02](../rules/authority/mapping-A.md#L1318) · [OP-T04](../rules/authority/mapping-A.md#L2018) · [개인 리딩 출판 경계 W-89](../rules/authority/mapping-B-rendering.md#L589)

### 두 명식의 책임 경계

독립적으로 계산한 Judgment A와 B를 읽기 전용으로 넘기고, Compatibility Fact가 제공자·수혜자·교차 관계 및 대상 경로를 식별한다. Compatibility Policy는 확인된 Fact를 방향별 결과로 옮긴다. 개인 Relationship Outcome은 배우자궁과 배우자성의 출처로 참고할 수 있다. 두 Outcome의 합이나 한 명식에 상대를 운처럼 주입하는 방식으로 새 Fact를 대신할 수 없다. Fact ID 후보에는 양쪽 명식 ID, 위치·참여자 ID, 대상 경로와 방향을 구분할 수 있는 출처가 필요하다. 양방향 결과는 독립적으로 존재하며, 미확인인 반대 방향은 비워 둔다. 같은 방향에서도 지원과 손상을 별도 경로와 생활 축으로 보존한다. 정적 구조, 성격 상호작용, 미래 지속성은 별도 결과다.

## 3. Existing vs New Fact

| Fact | Existing Engine Reusable | Cross-chart Computation Needed | Source Support |
|---|---|---|---|
| Natal spouse-palace state | Canonical 일지, core `branchFacts`·참여자와 `relationship_palace_context`. 개인 Outcome의 관계 종류는 제한적이다. | 개인 기초 상태에는 없음. 다른 궁과 실제 경로를 연결하는 Fact는 신규. | 07:3231–36, 3341–44, I-15 |
| Spouse-star state | 성별별 개인 `relationship_significator`, 참여 천간의 runtime/role 기능. 현재 Outcome 조회는 확인된 연·월·시 천간 범위다. | 전체 배우자성 손상·보호·지장간 후보 및 자신과 상대의 기여를 별도로 증명해야 함. | I-15, 07:3254, 3342–44 |
| YongShen, SangShen, Byeong, GuEung | `PatternContext`, `roleEngine.roleHistory/currentRoles`, 병·구응 경로. 역할 보유와 작동은 구별. | 두 명식의 제공자와 대상 역할 및 실제 완화·손상 연결. | Master 01·05·06·09, 07:3236, 3279–80 |
| ActualStructuralFunction | 방향, runtime, 형성·Root·capacity 등 증거가 있는 개인 구조 기능. | 교차 관계만으로 운영 상태를 재평가할 수 없음. 대상 경로와 유효성 판단 필요. | Master 05·06 |
| RootState | `rootFacts/rootStates`, 지장간·형성·충 근거. | 상대 지지·지장간에서 내 대상 천간으로 이어지는 별도 Root와 실제 작동 변화. | Master 04, 07:3281, 3314–16 |
| PersonalityResult | `buildNatalPersonality`의 `NatalPersonalityResult`와 조건·충돌·출처. | 쌍의 행동 상호작용 조건과 출력은 별도. | Master 11·12, 07:3322–24 |
| CrossStemRelation | 천간합 catalog, 기존 생·극 판별과 십신 계산. | 양쪽 명식의 소유자·위치·방향. 생·극의 source/target, 합의 성립과 작동을 구분. | 06 §1, 07:3279–80 |
| CrossBranchRelation / CrossPalace | 기본 합·충·형·파·해 catalog와 formation 기준, 원진 관측. | 별도 양쪽 참여자 ID와 대응 궁, B-022 관계 전용 처리, 허용되는 교차 국의 참여 범위. | Master 03, 07:3207–36, 3312 |
| CrossRoleRelief / CrossRoleDamage | 대상의 기존 RoleHistory·CurrentFunction·실제 정책 경로. | 대상 병·상신·용신을 연결하고 완화/손상, 공존/차단, 경쟁·보호 근거를 확인. | 07:3279–81, 3313–16 |
| CrossRootSupport / CrossHarmfulRootActivation | 개인 Root 존재·등급·상태와 재성→칠살 등 기존 대상 경로. | Root 제공과 수혜 방향, 실제 활성 및 결과 축을 개별 저장. | 07:3281, 3314–16 |

[Judgment snapshot](../../lib/judgment/core/luckScope.ts#L293) · [관계 producer](../../lib/judgment/producers/relationFactProducer.ts) · [Relationship 개인 Fact](../../lib/outcome/relationship/relationshipOutcome.ts) · [Personality 결과](../../lib/personality/types.ts#L235)

### 새 Fact 후보의 필요도

| 후보 | 필요도 | 이유 |
|---|---|---|
| CrossPalaceRelationFact | REQUIRED | 동일 위치 궁과 양쪽 참여자 식별. |
| CrossStemInteractionFact | REQUIRED | 교차 생·극·합 및 관측과 기능의 구별. |
| CrossBranchInteractionFact | REQUIRED | 기본 관계·왕지 있는 반합·완전한 국과 보조 관계를 분리. |
| CrossRoleReliefFact / CrossRoleDamageFact | REQUIRED | 동일 대상 축에 발생할 수 있는 완화·손상, 해로운 기능의 활성 및 출처. |
| CrossRootSupportFact | REQUIRED | 제공자, 수혜 천간, 지장간, 기존 Root와 보강/유해 활성의 연결. |
| CrossPersonalityInteractionFact | OPTIONAL | 개인 결과의 재사용은 가능. 상호작용 출력은 승인된 근거에 한해 별도. |
| CompatibilityOutcomeFact | REQUIRED | 방향별 생활 축과 근거 및 확실성. 공통 숫자 점수·범용 종합 판정은 NOT_SUPPORTED. |

### Compatibility 보조 관계의 실제 가용성

- **원진** — `WONJIN` 6쌍과 `branch-wonjin` 관측 producer/contract가 있다. core `branchFacts`와 교차 궁합 Fact에는 해당 출력이 없다. 조회 자료는 재사용 가능하며, 짝 비교의 출처와 해석 연결이 `CROSS_CHART_FACT_GAP`이다. 원진만으로 불리 결론을 확정하지 않는다.
- **상파** — `BREAKS`가 있고 core가 계산한다. 동일 쌍의 육합과 파를 모두 보존한다. 원자료의 상파 해석은 관계 맥락 후보다.
- **귀문·격각** — 07:3312에서 寅未와 戌子가 언급되나 전수 정의, 위치별 의미 기준과 런타임 출력이 없다. 각각 `CROSS_CHART_FACT_GAP`, 일반화는 `SOURCE_GAP`. §13 본문은 戌子를 월지로 중복 표기하며, 인쇄된 명식의 戌子는 일지 쌍이다. 인쇄 위치와 서술을 모두 기록하고 해석 위치는 미확정으로 둔다.
- **암합** — 현행 지장간·천간합 primitives는 있으나 이름 붙은 Fact는 없다. 07:3215는 참고 목록, 06 §5는 지장간 합 설명과 정기 후보를 제시한다. 참여 지장간 범위와 발현 기준은 `POLICY_DECISION_REQUIRED`. 자동 친밀도·길흉 산정은 유보한다.

[기본 catalog](../../lib/judgment/producers/relationCatalog.ts) · [관측 스키마](../../lib/judgment/contracts/relationFact.ts) · [원자료 06 §5·§9](../source/primary/06-합충형파해.md#L484)

## 4. §13 fixture 전수 목록

간지는 **연·월·일·시** 순서다. 선명한 원문 결론은 정성적으로 유지했다. 각 행에서 명시되지 않은 역방향이나 전체 결론은 검증 기대값으로 만들지 않는다. 아래 ID는 문서상의 참조명이다.

| 참조 | 명식 A / 명식 B | A receives from B | B receives from A | 원문 전체 결론 및 범위 |
|---|---|---|---|---|
| C00-01 · 부정 궁 관계 | 辛酉 己亥 丙午 辛卯 / 甲寅 戊辰 丙子 甲午. 성별 미기재. | 별도 지원·손상 미기재. 공통 비교는 연 寅酉 원진, 월 辰亥 원진, 시 卯午 파. 일 子午 충도 인쇄된 두 일지에서 확인된다. | 별도 방향 미기재. B 원국의 일·시 子午 충은 개인 baseline. | 각 궁이 전반적으로 잘 맞지 않는 인상. 원국 일지 충 하나로 결혼 실패를 확정하지 않는 사례다. [07:3217–36](../source/primary/07-사주풀이예시.md#L3217) |
| C00-02 · 긍정, 한 방향 명시 | 여성 丁巳 己酉 乙亥 辛巳 / 남성 丙辰 甲午 癸卯 丙辰 | 지원: B의 월간 甲과 A의 己, B의 丙과 A의 辛 칠살을 연결해 경감한다고 설명. 亥卯는 현행 반합국 조건을 만족하는 짝이며 일지 간 충 없음. B가 A 일간의 Root가 될 요소를 원문이 언급한다. 구체 제공 지장간 및 실제 교차 정지 조건은 미확정. 손상은 별도 미기재. | 교차 지원·손상 미기재. B 자신의 재격 및 이혼 서술은 개인 사례. | 여성 관점의 긍정. 평생 무문제 결론은 없다. 한쪽 미래 운의 급변에 따른 공동 경제 부담을 별도로 언급한다. [07:3238–83](../source/primary/07-사주풀이예시.md#L3238) |
| C00-03 · 혼합, 양방향 비대칭 | 여성 庚戌 癸未 庚戌 丙戌 / 남성 壬寅 壬寅 丙子 庚寅 | 지원: B의 일지 子를 A의 약한 癸 상관을 뒷받침하는 Root로 설명. 본문은 이를 일간이라고 부르지만 표의 일간은 丙이다. 손상: B의 木이 A 재성에 해당해 A의 인성에 부담을 주며, 재성은 A의 살을 살릴 수 있다. | A의 戌이 B의 庚 편재에 Root를 제공해 수입이 가능해질 수 있다. 동시에 재성→칠살 활성으로 직업·자녀 관련 부담 및 건강 문제 가능성을 원문이 언급한다. 두 축을 남기되 질병 예측으로 승격하지 않는다. | 궁 관계는 원문에서 보통, 전체는 좋은 평가를 주기 어렵다는 정성적 결론. 연·시 寅戌은 관계만 남는다. 寅未 귀문·戌子 격각은 검증 보류. 공통 인성·표현 부족은 별도 성격 마찰 후보이고, 두 사람 운의 논의는 별도 미래 축이다. [07:3285–3324](../source/primary/07-사주풀이예시.md#L3285) |
| C00-S1 · 단독 보조례 | 辛亥 丙申 丙戌 壬辰 / 상대 없음 | 해당 없음 | 해당 없음 | 일지 辰戌 충, 재성 지원과 칠살 부담의 공존을 다룬 개인 사례. 과거 사건 서술을 상대 명식의 기대값이나 결혼·건강·사망 시점 예측에 사용하지 않는다. [07:3326–48](../source/primary/07-사주풀이예시.md#L3326) |

**Fixtures 집계.** 두 사람 snapshot 3쌍, 별도 개인 snapshot 1건, 전체 `BirthInput` 0쌍. 긍정 1, 부정 1, 혼합 1, 방향성이 명시된 사례 2이며 이 중 양쪽 방향이 기술된 사례는 1이다. 원문에서 성별이 없는 쌍의 배우자성 기대값, 긍정 쌍의 역방향 기대값, 날짜·시각·출생지로 Canonical부터 재생할 쌍, 미상 시각을 포함한 실제 궁합 쌍은 `FIXTURE_GAP`이다. 원문에 없는 Gregorian 날짜·출생 시각·운 기준일을 채우지 않았다.

## 5. v1 및 제품 입력 판정

| 범위 | 판정 | 경계 |
|---|---|---|
| 연애 궁합 | V1_SUPPORTED | 승인 후보는 정적 궁 비교와 방향별 구조 지원·마찰. 결혼 가능성이나 성패를 추정하지 않는다. |
| 결혼 궁합 | V1_SUPPORTED | 배우자궁·배우자성 기초와 역할·뿌리의 교차 효과. 결혼 성공·이혼 보장 없음. |
| 관계 지속성 | DEFERRED | 원자료에 미래 부담 사례는 있다. 두 사람의 기간 동기화·맥락·장기 관계 결과 매핑은 미정. |
| 사업 파트너 | DEFERRED | 07:3235가 파트너를 언급하지만 사업 전용 방향별 사례와 결과 경계가 부족하다. Master 15의 개인 사업 timing으로 대체할 수 없다. |
| 친구 / 부모·자식 | SOURCE_GAP | 이 두 유형의 두 명식 기대 결과 및 관계 전용 판정 자료가 확인되지 않았다. |

- **두 출생 입력.** `BirthInput`의 날짜, 출생 시각 known/value 또는 unknown, 필요한 경우 출생지 및 보정 방식은 각 사람에 대해 재사용 가능하다. 현재 `/result`와 `readBirthChart`는 한 사람 입력이다. 두 번째 명식과 명시적인 관계 종류를 받을 계약이 `PRODUCT_INPUT_GAP`이다. 현재 UI의 개인 relationshipStatus는 두 명식의 관계 유형 입력이 아니다. [BirthInput](../../lib/canonical/types.ts#L11) · [제품 호출부](../../App.tsx#L288) · [Reading API](../../lib/product/readBirthChart.ts)
- **성별.** 양쪽에서 배우자성 분류가 필요할 때 현재 형식의 성별을 각자 명시 입력해야 한다. 누락 또는 근거 범위 밖이면 해당 배우자성 해석을 유보하되 근거가 확보된 궁 관계까지 유보하지 않는다. 자료가 지원하지 않는 성별·관계 조합의 배우자성 의미를 일반화하지 않는다. `SOURCE_GAP`이며 입력 강제나 상대 성별 추정으로 메우지 않는다.
- **미상 시각.** Canonical은 시주 unknown 및 절입 경계의 연·월 provisional을 표현한다. 확인된 일지 등으로 수행 가능한 비교는 남기고, 미상 시주를 필요로 하는 시↔시 및 Root·역할 경로는 유보할 수 있다. 다만 현행 전체 `runInternalReading`은 네 원국 천간을 요구한다. 일부 Canonical/Personality 사용은 검증됐고, 미상 시각의 전체 구조 판정은 `JUDGMENT_FACT_GAP`이다. 합성 시각·내부 참조 정오를 고객 출생 시각으로 사용하지 않는다. [Canonical](../../lib/canonical/calculateCanonicalChart.ts#L69) · [P4-C 미상 시각 검사](../../../scripts/verify-reading-assembly-integration-p4c.mjs#L350)
- **시간 통합.** Master 08·09의 개인별 검증된 기간과 활성·만료는 후속 지속성 입력 후보다. 현재 Master 14의 개인 관계 변화 신호와 Master 15의 계약·사업 투영은 배우자를 만나거나 결혼할 고객 시점을 승인하지 않는다. 두 사람의 미래 판단과 정확한 결혼 timing은 각각 별도 매핑·실제 입력·fixture가 필요하다.

## 6. Readiness Matrix

| Capability | FILUNE Rule Ready | Source Ready | Existing Fact | New Fact | Fixture | Ready |
|---|---|---|---|---|---|---|
| Natal relationship baseline | 예 | 예 | Canonical 일지·개인 branch/runtime | 확인된 개인 경로의 참조 | 3쌍 + 단독례 | 완전 출생시각 입력의 기초만 재사용 |
| Spouse-star condition | I-15 지원 범위만 | 해당 성별만 | 개인 significator, Role/Runtime | 전체 대상 손상·보호 연결 | 성별 명시 2쌍 | 부분 |
| Cross-palace relations | 기본 계산 예 | 궁 비교 예 | branch catalog / producer | 양쪽 궁 관계와 교차 국 참여 계약 | 3쌍 | 교차 Fact 미지원 |
| Cross Byeong relief | 개인 규칙 예 | 사례 예 | Byeong·GuEung·CurrentFunction | 대상 병과 교차 작동·완화 | C00-02 | 정책·교차 Fact 미지원 |
| Cross harmful activation | 개인 규칙 예 | 사례 예 | 정책 경로·현재 상태 | 대상 손상 및 활성 | C00-03 | 정책·교차 Fact 미지원 |
| Cross root support | 개인 규칙 예 | 사례 예 | Root facts/state 및 역할 | 제공 지장간·수혜 대상·활성 근거 | C00-02/03 | 정책·교차 Fact 미지원 |
| Personality interaction | 개인 해석 예 | 사례 한정 | NatalPersonalityResult | 선택적 상호작용 | C00-03 | 유보 |
| Overall compatibility | 범용 단일 판정 보류 | 사례 결론만 | 개인 Outcome은 보조 | 방향별 복수 CompatibilityOutcome | 3쌍, 기대값 범위 상이 | 구체 결과 승인 필요 |
| Future sustainability | 개인 기간만 | 분리 원칙 예 | 개인 Luck 상태·구간 | 두 사람 기간·대상 축 연결 | 시간 없는 서술 | 유보 |
| Marriage timing integration | 현행 승인 없음 | 결혼 시점 매핑 미확정 | 개인 관계 신호/투영 primitives | 결혼 전용 근거·Decision | 없음 | 유보 |

## 7. 실제 미해결 blocker

| 분류 | 닫아야 할 항목 |
|---|---|
| POLICY_DECISION_REQUIRED | 두 명식으로 만든 합·형성의 참여 허용 범위와 우선·보호·경합 조건, 개인 운과 구분되는 합의 기능 및 실제 정지 기준. Root 기여를 단순 존재에서 기능으로 올릴 기준, 성격 상호작용과 정성 결과의 근거 조건. 암합은 독립 승인 전 참고 후보. |
| CROSS_CHART_FACT_GAP | 양쪽 소유자가 식별되는 궁·천간·지지·Root·역할 Fact와 방향별 효과. 원진 교차 출력, 귀문·격각·암합 Fact 부재. |
| JUDGMENT_FACT_GAP | 미상 시각의 전체 구조 입력, 배우자성 전체 손상·보호의 집계 및 대상 기능 근거. 현재 개인 significator의 조회 범위 밖에는 별도 근거가 필요하다. |
| FIXTURE_GAP | 실제 두 사람 BirthInput, 미상 시각 쌍, 긍정 쌍의 역방향 검증 및 관계 유형별·시기별 기대값. |
| PRODUCT_INPUT_GAP | A/B 출생 입력, 명시적 관계 유형, 누락된 성별·시각의 축별 허용 규약과 제품 전달 경로. |
| SOURCE_GAP | 현행 배우자성 해석 범위 밖의 일반화, 친구·부모자식 및 사업 전용 기대 결과, 귀문·격각 전수 근거와 결혼 시점 검증 근거. |

## 8. 변경 및 검증

원자료·Master·authority·`src/lib` 및 기존 fixture의 변경은 0건이다. Compatibility 구현, 새 명리 규칙, 배점, 단일 관계 shortcut, 범용 좋음/나쁨 산식은 추가하지 않았다. 기존 unknown-time과 canonical 검증을 실행했다. 미상 시각의 시주 제외와 절입 경계의 불확실성을 확인했다. 기존 canonical 검증 종료 시 Vite dependency scan 경고가 출력됐고 명령 종료 코드는 0이었다. 본 감사에는 신규 Compatibility 런타임 실행 기록이 없다.

**Final — `COMPATIBILITY_BLOCKERS_CLASSIFIED`**
