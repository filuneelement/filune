# FILUNE Codex P4-D
## Work · Money · Relationship · Health Outcome Semantic Source Audit

P4-C Reading Assembly Core Integration Audit가 완료되었다.

현재 상태:

```text
READY_FOR_READING_ASSEMBLY_CORE_COMPLETE

Reading Assembly Core COMPLETE
customerRenderable = false
```

완료된 계층:

```text
Canonical
→ Judgment
→ Luck Runtime / Scope snapshots
→ Personality
→ Reading Assembly Core
```

남은 주요 gap:

```text
Selection Layer
- 핵심 구조 3
- 강점 3
- 과제 3
- 기억할 3

Outcome Semantic Layer
- Work
- Money
- Relationship
- Health

Question Routing
```

이번 작업에서는 **Outcome 코드를 구현하지 않는다.**

먼저 Work / Money / Relationship / Health의 결과 규칙을
FILUNE 원자료·authority·전문가 사례에서 전수 감사한다.

---

# 1. 최종 목표

이번 작업의 판정은 분야별로 한다.

가능한 상태:

```text
READY_FOR_OUTCOME_IMPLEMENTATION
PARTIAL_OUTCOME_IMPLEMENTATION
SOURCE_GAP
CONFLICT
DEFERRED
```

전체 결과 예:

```text
Work          READY
Money         READY
Relationship  PARTIAL
Health        PARTIAL
```

처럼 분야별로 다를 수 있다.

모든 분야가 READY일 필요는 없다.

---

# 2. 절대 금지

이번 감사에서 새 명리 규칙을 발명하지 않는다.

금지:

```text
TenGod 이름만 보고 직업 판정
財星이 있으면 돈이 좋다고 판정
일지 합이면 관계가 좋아진다고 판정
오행 부족이면 질병 판정
Personality trait를 Outcome으로 자동 변환
```

---

# 3. 출처 분류

모든 후보 규칙에 반드시 다음 중 하나를 붙인다.

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
CONFLICT
DEFERRED
```

정의:

### SOURCE_EXPLICIT

원자료 또는 현행 authority에 조건과 결과가 직접 적혀 있음.

### SOURCE_INFERENCE

복수의 전문가 사례에서 반복되는 구조를
공통 규칙으로 추출할 수 있으나 원문에 공식 규칙 문장이 없음.

### FILUNE_APPROVED_OVERRIDE

원자료와 다른 FILUNE 확정 운영 기준.

### CONFLICT

원자료·authority·전문가 사례 사이 충돌.

### DEFERRED

근거 부족으로 현재 확정 불가.

---

# 4. 최우선 문서

반드시 실제 파일을 읽는다.

## Authority

```text
src/docs/source/authority/25-7_rev16.md
src/docs/source/authority/A_rev182.md
src/docs/source/authority/B_rev38.md
src/docs/source/authority/C_rev215.md
src/docs/source/authority/D_rev155.md
```

## Mapping

```text
src/docs/rules/authority/mapping-A.md
src/docs/rules/authority/mapping-B-rendering.md
src/docs/rules/authority/mapping-C.md
src/docs/rules/authority/mapping-D-H5.md
src/docs/rules/authority/rule-dependency-map.md
```

## Current master

```text
src/docs/rules/master/01-pattern-master.md
src/docs/rules/master/02-peer-rob-yangblade-master.md
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/13-reading-assembly-spec.md
```

---

# 5. Primary sources

반드시 실제 원문을 조사한다.

```text
src/docs/source/primary/07-사주풀이예시.md
```

필요 시:

```text
01-간지론.md
02-용신론.md
03-육친론.md
04-행운론.md
05-격국론.md
06-합충형파해.md
```

도 대조한다.

---

# 6. 전문가 사례 전수 검색

`07-사주풀이예시.md`를 다음 주제별로 검색하고
관련 사례를 전부 목록화한다.

## Work

검색 예:

```text
직업
일
사업
조직
직장
독립
성과
교육
자문
기술
공무원
관리
전문
```

## Money

```text
재물
돈
재성
현금
자산
계약
투자
문서
재산
벌다
지출
```

## Relationship

```text
배우자
남편
아내
인연
결혼
관계
부모
형제
자녀
육친
```

## Health

```text
건강
몸
질병
간
심장
위
폐
신장
피부
혈액
소화
```

검색어만으로 규칙을 만들지 않는다.

각 문맥을 실제로 읽는다.

---

# 7. B의 역할

문서 B는 최종 고객 output 요구사항이다.

B 자체가 명리 판단 규칙을 새로 만드는 근거는 아니다.

따라서:

```text
B says CH-4 needs work outcome
```

만으로:

```text
work rule = confirmed
```

하면 안 된다.

B의 `내부 필요 정보`가 A/source에서 실제 규칙으로 연결되는지 확인한다.

---

# 8. 공통 Outcome 원칙

우선 다음 가설을 감사한다.

```text
Outcome
=
TenGod / palace / position
+
ActualStructuralFunction
+
PatternEffectPolicy
+
Role current state
+
scope-specific Luck effect
```

단 이 식을 **사전에 확정하지 않는다.**

원자료와 전문가 사례가 실제로 이를 지지하는지 검증한다.

---

# 9. TenGod intrinsic polarity 금지

예:

```text
財 = 항상 돈 좋음
官 = 항상 직업 좋음
食傷 = 항상 창작 직업
印 = 항상 공부/문서 좋음
```

같은 단독 mapping은 금지한다.

현재 Structural Engine의:

```text
PatternContext
ActualStructuralFunction
Role
Runtime
```

을 무시하면 안 된다.

---

# 10. Work audit — B requirement

CH-4가 요구하는 내용:

```text
4-1 잘 맞는 일의 방식
4-2 조직 안에서 / 혼자서
4-3 성과가 잘 나는 조건 / 어려워지는 조건
4-4 지금 시기의 방향
4-5 움직이기 좋은 때 / 준비하기 좋은 때
```

B의 내부 필요 정보:

```text
관성
식상
인성
위치
상신과의 관계
격의 성패
현재 대운
월별 판정
```

이다.

각 항목이 실제 source에서 어떻게 연결되는지 찾는다.

---

# 11. Work semantic categories

근거가 있다면 최소 다음 후보를 구분한다.

```text
work_style
organization_expression
independent_expression
performance_support
performance_obstacle
current_work_direction
work_timing_signal
work_timing_supportive
work_timing_caution
```

근거가 없는 category는 만들지 않는다.

---

# 12. Work — 직업군

B에는:

```text
자문
교육
기술
등 직업군·일의 형태 제안
```

요구가 있다.

전문가 원자료에 실제 직업군 mapping 규칙이 있는지 감사한다.

특히:

```text
오행 → 산업군
십성 → 직업군
격 → 직업군
용신 → 직업군
```

을 각각 별개로 조사한다.

---

# 13. Work — 과도한 직업 추천 방지

단일 성향에서:

```text
독립적
→ 창업

교육성
→ 교사
```

등으로 직접 변환하지 않는다.

반드시 구조적 근거를 요구한다.

---

# 14. Work — organization / independent

B가 요구하는:

```text
조직 안에서
혼자서
```

비교를 어떤 source 근거로 판단할 수 있는지 감사한다.

근거가 없으면 `DEFERRED`.

Personality의 독립성을 곧바로 독립사업 적성으로 바꾸지 않는다.

---

# 15. Work — timing

월별 Work timing은 반드시:

```text
월 구조 판정
+
Work relevance
```

두 요소가 필요하다.

구조적으로 유리한 달이라고 해서 자동으로:

```text
work favorable month
```

라고 하지 않는다.

---

# 16. I-14와 Work

I-14 및 현행 OP-L03을 대조한다.

특히 현재 FILUNE은 천간·지지 축을 하나의:

```text
혼합
좋음
나쁨
```

점수로 합산하지 않는다는 계약을 유지한다.

Work timing rule이 이 계약과 충돌하면 표시한다.

---

# 17. Money audit — B requirement

CH-5:

```text
5-1 돈이 들어오는 방식
5-2 돈이 머무는 방식
5-3 돈 때문에 문제가 생기는 조건
5-4 계약 / 사업 / 지출 / 협업의 때
5-5 재물 원칙
```

내부 필요 정보:

```text
재성 위치
정재 / 편재
통근
재성과 병의 관계
구응
월별 돈 판정
```

---

# 18. Money — 財 intrinsic 금지

반드시 다음 차이를 보존한다.

```text
財 as TenGod
vs
財 current structural function
```

예:

```text
財格의 財剋印
```

은 FILUNE에서 구조적으로 유리할 수 있다.

반대로:

```text
印格의 財剋印
```

은 불리할 수 있다.

Money Outcome이 이를 무시하면 안 된다.

---

# 19. Money — 돈의 유입

전문가 사례에서:

```text
財 존재
財 통근
財 실제 기능
재성 보호
재성 훼손
```

과 실제 돈의 유입 해석이 어떻게 연결되는지 조사한다.

---

# 20. Money — 돈의 유지

B는 `들어옴`과 `머묾`을 구분한다.

원자료가 실제로 이 둘을 구분하는 규칙을 제공하는지 확인한다.

근거가 없으면:

```text
money_inflow READY
money_retention DEFERRED
```

처럼 분리한다.

---

# 21. Money — 문서/인성

전문가 사례에:

```text
인성
문서
자산 보호
```

연결이 존재하는 경우,
단일 사례인지 반복 규칙인지 구분한다.

단일 설명을 전체 엔진 규칙으로 자동 승격하지 않는다.

---

# 22. Money — 투자

Output rule에서:

```text
buy
sell
주식 추천
가상자산 추천
투자 종목
```

은 생성하지 않는다.

B가 허용하는 범위를 넘지 않는다.

---

# 23. Money — timing

다음 네 항목을 섞지 않는다.

```text
contract
business
spending
collaboration
```

한 달이 구조적으로 유리하다고
네 영역 모두 유리하다고 하지 않는다.

source가 실제로 분야를 구분하는지 감사한다.

---

# 24. Relationship audit — I-15

I-15의 육친 자리 규칙을 실제 현행 기준으로 감사한다.

현재 내용에는:

```text
일지 = 배우자 자리
여성 관성 = 남편·인연
여성 식상 = 자녀
재성 = 부친
남성 재성 = 처
인성 = 모친
```

이 포함되어 있다.

하지만 고객 실제 생활 상태를 전제하지 않는 제한도 함께 유지한다.

---

# 25. Relationship — palace vs real person

다음은 분리한다.

```text
relationship palace meaning
actual spouse exists
```

후자는 고객이 제공하지 않으면 추정하지 않는다.

---

# 26. Relationship — I-22

I-22의 네 종류 시기 신호를 분리한다.

```text
1. 인연이 생기기 쉬운 때
2. 기존 관계 변화 가능 시기
3. 결혼/큰 약속 성사 가능 시기
4. 실제 관계가 유리하게 발전하는 시기
```

이 넷을 하나의:

```text
good relationship month
```

으로 합치지 않는다.

---

# 27. Relationship — ④ 특별조건

④는 특히:

```text
해당 시기 구조 판정이 유리
+
배우자성 / 상신이 다치지 않음
```

조건이 필요하다는 현행 rule을 감사한다.

---

# 28. Relationship — 합

다음은 엄격히 금지:

```text
일지 합
→ 좋은 관계
```

합은:

```text
접점
변화
시기 신호
```

일 수 있으나 관계 개선 자체의 근거는 아니다.

---

# 29. Relationship — conflict

일지 충/형/파/해가 실제 관계 Outcome에 어떤 의미로 쓰였는지
전문가 사례와 A/B를 대조한다.

관계 파탄·이혼 자동 판정 금지.

---

# 30. Relationship — compatibility

궁합은 현재 개인 감정서 범위 밖이라는 기준을 유지한다.

두 명식을 비교하는 별도 엔진을 만들지 않는다.

---

# 31. Relationship — gender-specific rules

원자료의:

```text
여성 관성
남성 재성
```

육친 규칙은 현재 source 규칙으로는 존재한다.

그러나 Personality에서 제외했던 성별 결정론과 혼동하지 않는다.

Outcome에서 사용할 수 있는 범위를 정확히 분류한다.

---

# 32. Health audit — I-16

I-16의 전통 대응:

```text
木 → 간·담·근육·힘줄·신경
火 → 심장·혈액순환·눈
土 → 위·소화·허리
金 → 폐·대장·피부
水 → 신장·방광
```

을 확인한다.

이것은:

```text
traditional correspondence
```

이지:

```text
actual health condition
```

이 아니다.

---

# 33. Health — 절대 금지

다음 Outcome 생성 금지:

```text
질병
진단
수명
사고
병원 방문 필요
검진 시기
약 복용
치료
식이요법
```

---

# 34. Health — allowed semantic candidate

원자료가 지원하는 경우에만:

```text
traditional_body_area
structural_attention_area
period_of_increased_attention
period_of_reduced_pressure
```

정도로 제한한다.

---

# 35. Health — "부담"

구조적으로 특정 오행/역할이 눌리는 것과:

```text
실제 몸이 아프다
```

를 동일시하지 않는다.

---

# 36. Health — timing

B가 요구하는:

```text
더 세심히 볼 달
```

을 만들려면 실제로:

```text
해당 오행/글자가 구조적으로 눌림
+
건강 영역 mapping이 확정
```

되어야 하는지 source를 감사한다.

단순 불리 month → 건강 caution month 금지.

---

# 37. Health — lighter month

B의:

```text
가벼워지는 달
```

도 source에서 실제 구조적 relief와 연결되는지 확인한다.

---

# 38. Outcome과 Structural Judgment 분리

반드시:

```text
Structural Judgment
≠
Domain Outcome
```

이다.

예:

```text
財가 보호됨
```

은 structural semantic.

```text
돈이 들어온다
```

는 domain outcome.

두 번째 연결에는 별도 근거가 필요하다.

---

# 39. OutcomeFact 제안

감사 결과가 충분한 경우에만
향후 구현용 개념을 제안한다.

예:

```ts
interface OutcomeFact {
  id: string;

  domain:
    | "work"
    | "money"
    | "relationship"
    | "health";

  semanticType: string;

  scope:
    | "natal"
    | "daewoon"
    | "sewoon"
    | "month";

  certainty:
    | "confirmed"
    | "contextual"
    | "conditional"
    | "deferred";

  sourceJudgmentIds: string[];
  sourceRoleIds: string[];
  sourceRelationIds: string[];
  sourceLuckEffectIds: string[];

  provenance: OutcomeRuleEvidence[];
}
```

이번 작업에서는 구현하지 않는다.

---

# 40. Domain Outcome가 Role을 읽는 방식

다음을 감사한다.

```text
RoleHistory
CurrentState
CurrentFunction
```

중 무엇을 Outcome이 사용해야 하는가.

원칙적으로 현재 결과에는:

```text
CurrentFunction
ActualStructuralFunction
```

이 중요할 가능성이 있으나 source로 확인한다.

---

# 41. stopped / inactive

현재 stopped/inactive된 요소가
domain outcome을 계속 만드는지 확인한다.

일반적으로 자동 활성 처리하지 않는다.

---

# 42. reduced

reduced 상태를 confirmed full effect로 읽지 않는다.

---

# 43. conditional_byeong

조건부 병을 현재 확정된 문제 Outcome으로 만들지 않는다.

조건이 실제 발동한 경우와 분리한다.

---

# 44. LuckReliefEffect

운이 병을 완화할 때:

```text
structural relief
```

가 어떤 domain outcome까지 연결 가능한지
전문가 사례로 확인한다.

---

# 45. Daewoon / Sewoon / Month

같은 domain rule이 각 scope에서 적용 가능한지 감사한다.

기간 차이를 strength score로 바꾸지 않는다.

---

# 46. Month domain tagging

P4-A에서 미구현으로 확인된 핵심:

```text
월 구조 판정
→ Work / Money / Relationship / Health
```

domain tagging 계약을 집중 감사한다.

---

# 47. Month final ranking 금지

Outcome audit에서도:

```text
best month
worst month
```

선정 규칙을 만들지 않는다.

시기 signal과 ranking은 별개다.

---

# 48. OP-L03 / I-14 정합성

현행 A-8-7/OP-L03의:

```text
천간 축
지지 축
```

별도 판정을 보존한다.

Outcome rule이 두 축을 임의 점수로 합치면 FAIL.

---

# 49. 두 축이 다를 때

예:

```text
stem = favorable
branch = unfavorable
```

인 경우 domain outcome을 어떻게 처리해야 하는지
source에서 명시 근거를 찾는다.

근거 없으면:

```text
DEFERRED
```

로 유지한다.

---

# 50. 월별 "혼합" 과거 표현

구형 I-14의:

```text
혼합
```

표현과 현행 A-8-7의 축별 판정을 혼용하지 않는다.

역사적 문구는 provenance로만 보존.

---

# 51. Source evidence table

모든 후보 Outcome Rule마다 다음 표를 만든다.

| Rule ID | Domain | Input | Condition | Outcome | Source | Status |
|---|---|---|---|---|---|---|

Status:

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
CONFLICT
DEFERRED
```

---

# 52. Rule ID

새 master 후보 rule은 임시로:

```text
OUT-WORK-xx
OUT-MONEY-xx
OUT-REL-xx
OUT-HEALTH-xx
```

형태로 정리 가능.

단 감사 단계 ID일 뿐 구현 확정 ID가 아니다.

---

# 53. Source inference 조건

SOURCE_INFERENCE는 최소 다음을 기록한다.

```text
supporting cases
counterexamples checked
scope
limitations
```

---

# 54. 단일 사례 일반화 금지

전문가 사례 1개에서만 나타나는 해석을
전체 engine rule로 확정하지 않는다.

단 source가 명시적 일반 원칙을 같이 말하면 별도.

---

# 55. 반례 검사

각 후보 규칙은 `07-사주풀이예시.md` 전체에서
반대 사례가 있는지 검색한다.

반례가 있다면:

```text
context split
CONFLICT
DEFERRED
```

중 하나로 처리한다.

---

# 56. 실제 structural context 보존

예:

```text
財生殺
```

을 Money Outcome으로 해석할 때도
그 殺이 필요한지 해로운지에 따라 의미가 달라진다.

현재 PatternEffectPolicy를 우선한다.

---

# 57. Pattern-specific differences

최소 다음 차이를 훼손하지 않는다.

```text
財格 財剋印
印格 財剋印
食神格 財剋印

殺用食制
殺用印
羊刃 필요한 七殺
```

Outcome rule이 이를 하나로 뭉개면 FAIL.

---

# 58. outcome good/bad person 금지

Relationship/Work outcome을 성격 평가로 바꾸지 않는다.

---

# 59. Outcome certainty

각 rule에:

```text
confirmed
contextual
conditional
deferred
```

중 가능한 certainty contract를 기록한다.

---

# 60. 고객 생활 사실

Outcome engine은 고객이 제공하지 않은:

```text
직장
사업체
결혼
배우자
자녀
대출
질병
```

존재를 추정하지 않는다.

---

# 61. B의 표현 제한 함께 연결

각 domain rule마다 B의 관련:

```text
중복 방지
근거 부족 시
생활 상태 미상
금지 표현
```

을 연결한다.

---

# 62. Work forbidden inference

최소:

```text
이직해야 한다
퇴사해야 한다
창업해야 한다
반드시 성공한다
```

금지.

---

# 63. Money forbidden inference

최소:

```text
투자하라
매수하라
매도하라
대출 받아라
큰돈 번다
부자가 된다
```

근거 없이 금지.

---

# 64. Relationship forbidden inference

최소:

```text
반드시 결혼
이혼
외도
좋은 배우자
나쁜 배우자
운명적 인연
```

자동 생성 금지.

---

# 65. Health forbidden inference

최소:

```text
질병
진단
수명
사고
의료행위
```

금지.

---

# 66. 기존 Personality source 혼입 금지

`src/docs/source/personality/일주풀이.md`에서
제외했던:

```text
배우자
재물
건강
직업
성별 단정
```

을 Outcome source로 몰래 재사용하지 않는다.

사용 필요성이 있으면 별도 source audit 대상으로 보고한다.

---

# 67. 결과 master 생성 조건

감사 후 충분한 규칙이 확보된 경우에만:

```text
src/docs/rules/master/14-outcome-semantic-spec.md
```

를 작성한다.

---

# 68. master를 만들면 안 되는 경우

4개 분야 모두 근거가 심각하게 부족하면
억지로 master를 만들지 않는다.

결과 보고서에서 gap만 남긴다.

---

# 69. 14-outcome-semantic-spec 역할

만든다면 이 문서는:

```text
Structural result
→ domain semantic
```

의 연결 계약만 담는다.

고객 문체는 담지 않는다.

---

# 70. Renderer와 분리

예:

```text
OutcomeFact
→ Reading Assembly
→ Locale Renderer
```

구조.

Outcome spec에 한국어·일본어·영어 문장을 넣지 않는다.

---

# 71. Assembly와 분리

Outcome Layer는 chapter를 직접 선택하지 않는다.

```text
OutcomeFact
→ Reading Assembly routing
```

이다.

---

# 72. 코드 변경 금지

이번 P4-D는 source audit이다.

원칙:

```text
src/lib/
```

변경 0.

---

# 73. 결과 파일

```text
src/docs/codex/
p4d-outcome-semantic-source-audit-result.md
```

---

# 74. 최종 보고 A — 전체 판정

예:

```text
OUTCOME_SOURCE_AUDIT_COMPLETE
```

그리고 분야별:

```text
Work:
Money:
Relationship:
Health:
```

---

# 75. B — Source Coverage

| Domain | Explicit | Inference | Override | Conflict | Deferred |
|---|---:|---:|---:|---:|---:|
| Work | | | | | |
| Money | | | | | |
| Relationship | | | | | |
| Health | | | | | |

---

# 76. C — Work

보고:

```text
work_style:
organization_vs_independent:
performance_conditions:
current_direction:
timing:
job_family:
```

각 상태.

---

# 77. D — Money

```text
inflow:
retention:
problem_conditions:
contract:
business:
spending:
collaboration:
principles:
```

---

# 78. E — Relationship

```text
palace:
partner-significator:
relationship_style:
conflict_structure:
contact/change timing:
commitment timing:
favorable-development timing:
family positions:
```

---

# 79. F — Health

```text
traditional correspondence:
attention area:
structural pressure:
attention timing:
relief timing:
disease prediction:
medical recommendation:
```

마지막 두 항목은 expected:

```text
PROHIBITED
```

---

# 80. G — Monthly Domain Mapping

```text
Work month mapping:
Money month mapping:
Relationship month mapping:
Health month mapping:
```

각각:

```text
READY
PARTIAL
DEFERRED
```

---

# 81. H — Axis handling

```text
Stem favorable + Branch unfavorable:
Stem unfavorable + Branch favorable:
both favorable:
both unfavorable:
one deferred:
```

각 상황의 domain rule이 source에 있는지 기록.

---

# 82. I — Upstream Dependencies

각 domain별 필요한 existing output:

```text
PatternContext
ActualStructuralFunction
RoleHistory
CurrentFunction
RelationFact
Runtime
Root
Formation
LuckEffect
Palace
TenGod
```

중 실제 필요한 것만 표시.

---

# 83. J — Missing Engine Data

source 규칙은 있지만 현재 engine output에 없는 입력을 명시한다.

예:

```text
palace semantic
relative-position semantic
domain tag
traditional body correspondence
```

실제 조사 결과만.

---

# 84. K — New Rules Invented

```text
UNSUPPORTED_NEW_RULE:
```

Expected:

```text
0
```

---

# 85. L — Proposed Implementation Batches

감사 결과에 따라 실제 구현 순서를 제안한다.

예시 형식:

```text
Batch 1:
Reason:
Rules:
Dependencies:

Batch 2:
...
```

미리 Work→Money→Relationship→Health 순서를 강제하지 않는다.

근거가 가장 완성된 분야부터 제안한다.

---

# 86. M — Selection Layer

이번 감사에서는 Top-3 규칙을 해결하지 않는다.

결과에:

```text
Selection Layer remains separate
```

라고 명시한다.

---

# 87. 종료 조건

다음을 만족하면 P4-D 종료:

```text
[ ] B CH-4~7 요구사항 전수 분석
[ ] A 관련 I 규칙 전수 대조
[ ] 전문가 사례 전수 검색
[ ] 후보 규칙별 provenance
[ ] 반례 검사
[ ] PatternContext 차이 보존
[ ] ActualStructuralFunction 우선
[ ] 월 천간/지지 축 계약 보존
[ ] 질병 예측 규칙 0
[ ] 투자 지시 규칙 0
[ ] 결혼/이혼 자동 판정 0
[ ] 직업 추천 일반론 0
[ ] unsupported new rule 0
[ ] 분야별 READY/PARTIAL/DEFERRED 판정
[ ] 다음 구현 batch 순서 제안
```

---

# 88. 다음 단계

P4-D 결과를 보고:

```text
READY 분야
```

만 구현한다.

예:

```text
P4-E Outcome Semantic Engine — Batch 1
```

분야가 PARTIAL이면
지원되는 subset만 구현한다.

DEFERRED rule을 통과시키기 위한 fallback을 만들지 않는다.