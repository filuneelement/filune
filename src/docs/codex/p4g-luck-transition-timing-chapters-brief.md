# FILUNE P4-G — Luck Transition & Timing Chapters Brief

이번 작업은 운의 시간축을 다루는 고객 장 3개를 설계하고 구현하기 위한 단계다.

대상:

```text
CR-04 지금 내 삶에서 무엇이 달라지고 있는가
CR-08 앞으로 삶의 흐름이 크게 바뀌는 때
CR-09 기회를 활용할 때와 신중하게 판단할 때
```

세 장 모두 Luck / Outcome / Timing을 사용하지만 같은 내용을 반복해서는 안 된다.

이번 작업의 핵심은:

```text
Natal baseline
→ Daewoon
→ Sewoon
→ Month
```

를 단순 시기 나열로 보여주는 것이 아니라,

```text
원래 무엇이 있었는가
→ 무엇이 새로 달라졌는가
→ 그 변화가 어느 기간에 작동하는가
→ 장기 변화인지 단기 활성인지
→ 언제 활용하고 언제 조심해서 판단할 것인가
```

로 해석하는 것이다.

---

# 1. 세 장의 역할을 먼저 분리

## CR-04

```text
지금 내 삶에서 무엇이 달라지고 있는가
```

핵심 질문:

```text
현재 진행 중인 대운·세운·월운에서
원국과 비교해 어떤 기능·관계·압력·기회가 새로 활성되거나 약해지고 있는가?
```

현재 변화에 집중한다.

---

## CR-08

```text
앞으로 삶의 흐름이 크게 바뀌는 때
```

핵심 질문:

```text
장기 흐름의 전환점은 언제이며,
그 전환 전후에 구조적으로 무엇이 달라지는가?
```

대운 경계와 장기 변화에 집중한다.

---

## CR-09

```text
기회를 활용할 때와 신중하게 판단할 때
```

핵심 질문:

```text
어느 구간에서 어떤 기능을 활용하기 좋고,
어느 구간에서는 어떤 이유로 판단을 더 신중하게 해야 하는가?
```

구체적인 실행·판단 시기에 집중한다.

---

# 2. 중복 금지

같은 Outcome을 세 장에서 같은 문장으로 반복하지 않는다.

예:

```text
2027년에 수익화 경로가 활성
```

이 하나의 Outcome이면:

CR-04에서는:

```text
현재 무엇이 달라지고 있는가
```

의 관점으로 설명.

CR-08에서는 장기 전환 근거가 아니면 사용하지 않는다.

CR-09에서는:

```text
이 시기에 활용할 수 있는 기회
```

라는 역할이 실제 승인될 때만 사용한다.

---

# 3. Chapter Role Matrix

각 semantic contribution에는 chapter role을 명시한다.

권장:

```ts
type TimingChapterRole =
  | 'current_change'
  | 'long_term_transition'
  | 'opportunity_window'
  | 'caution_window'
```

하나의 Outcome이 여러 장에 들어갈 수는 있지만,
각 장에서 다른 질문에 답해야 한다.

---

# 4. 시간 계층

시간 계층은 계속 다음을 유지한다.

```text
Natal
Daewoon
Sewoon
Month
```

각 계층은 독립 평가 결과가 있어야 한다.

상위 범위에서 확인된 의미를 하위 기간에 자동 복제하지 않는다.

---

# 5. Natal은 기간이 아니다

Natal은 baseline이다.

다음처럼 사용한다.

```text
원래 이 명식에는 X가 있다.
현재 운에서는 Y가 새로 더해지거나 약해진다.
```

Natal에 시작·종료일을 만들지 않는다.

---

# 6. Daewoon

대운은 장기 구조 변화의 핵심 단위다.

특히 CR-08에서 우선 사용한다.

단:

```text
대운이 바뀐다
```

는 사실만으로 삶의 큰 변화라고 말하지 않는다.

다음 중 실제 구조적 변화가 있어야 한다.

```text
새로운 기능 등장
기존 핵심 기능 종료
방향 변화
보호 ↔ 손상 변화
target 변화
life mechanism 변화
```

---

# 7. Sewoon

세운은:

```text
장기 배경 안에서 특정 의미가 활성화되는 연간 구간
```

으로 다룬다.

CR-04와 CR-09에서 중요하다.

세운 하나만으로 장기 인생 전환을 만들지 않는다.

---

# 8. Month

월운은 가장 구체적인 활성 구간이다.

CR-09에서 우선적으로 활용한다.

단 월운은 반드시 upstream에서 독립 평가된 periodRef를 사용한다.

대운·세운 의미를 월에 복사하지 않는다.

---

# 9. 현재 기준일

모든 current / upcoming 판단은 명시된 referenceDate를 사용한다.

다음 구분을 둔다.

```text
past
current
upcoming
future
expired
```

Renderer가 시스템 날짜를 임의로 사용하지 않는다.

---

# 10. 기간 포함 규칙

하위 기간이 상위 기간 안에 실제 포함되는 경우:

```text
대운
→ 세운
→ 월
```

activation progression으로 연결할 수 있다.

하지만 포함 관계만으로 같은 의미라고 보지 않는다.

동일:

```text
meaning
target
mechanism
direction
```

이 확인되어야 한다.

---

# 11. CR-04 역할

CR-04는 “현재 변화”를 다룬다.

기본 비교:

```text
Natal baseline
vs
current Daewoon
vs
current Sewoon
vs
current Month
```

현재 평가 가능한 범위까지만 사용한다.

---

# 12. CR-04 변화 유형

다음 유형을 구분한다.

```text
new_activation
strengthening
weakening
suppression
release
direction_change
target_change
protection_change
burden_change
```

실제 producer의 상태를 기준으로 한다.

---

# 13. new_activation

원국에서 없거나 비활성인 기능이 현재 운에서 실제 활성되는 경우.

고객 의미:

```text
원래 중심이 아니던 작용이
현재 시기에는 실제로 작동하기 시작함
```

단 사건 발생을 뜻하지 않는다.

---

# 14. strengthening

같은 기능이 이미 있었고,
현재 범위에서 더 강하게 작동하는 근거가 있을 때만 사용한다.

단순히 같은 semantic이 다시 등장한 것만으로 strengthening을 만들지 않는다.

---

# 15. weakening

기존 기능이 약해지는 실제 evidence가 있어야 한다.

예:

```text
needed support damaged
protection weakened
function stopped
```

같은 구조 변화.

---

# 16. suppression / release

기존에 작동하던 기능이 제어되거나,
기존 제약이 풀리는 경로를 구분한다.

```text
suppression ≠ disappearance
release ≠ favorable event
```

---

# 17. direction_change

가장 중요한 변화 중 하나다.

예:

```text
natal favorable
→ current unfavorable
```

또는 반대.

이 경우 scope compression 금지.

CR-04에서 명확히 대비한다.

---

# 18. target_change

같은 구조라도 대상이 달라지면 별도 변화다.

예:

```text
원국에서는 재물 대상
현재는 관계 대상
```

처럼 target이 다르면 하나의 흐름으로 합치지 않는다.

---

# 19. CR-04 기본 Narrative

가능하면:

```text
P1 현재 가장 큰 변화 요약

P2 원래 baseline

P3 현재 대운에서 달라진 점

P4 현재 세운에서 추가된 변화

P5 월운이 있으면 더 구체적인 활성

P6 변화가 의미하는 현실 기능

P7 함께 작동하는 반대 조건

P8 현재 판단 기준
```

근거 없는 슬롯은 생략한다.

---

# 20. CR-04 readiness

## semantic READY

최소:

```text
baseline 또는 이전 scope
+
현재 scope
+
실제 차이 1개 이상
```

이 있어야 한다.

단순 현재 Outcome 나열만으로 READY가 아니다.

---

## semantic PARTIAL

현재 Outcome은 있으나 baseline 대비가 제한적.

---

## DEFERRED

현재 변화라고 설명할 비교 근거 없음.

---

# 21. CR-04 publication band

기존 목표:

```text
1,500~2,400자
7~10문단
```

은 품질 band로 유지한다.

P4-E.2의 semantic/publication readiness 모델을 사용한다.

---

# 22. CR-08 역할

CR-08은 장기 전환점이다.

핵심 대상:

```text
Daewoon boundary
```

다만 모든 대운 경계를 고객 장에 출력하지 않는다.

---

# 23. 의미 있는 장기 전환

대운 A → 대운 B에서 다음 중 하나 이상이 실제로 바뀌어야 한다.

```text
direction
mechanism
target
protective state
burden state
major outcome availability
structural operating state
```

단순 간지 변경은 충분하지 않다.

---

# 24. Transition Pair

장기 전환은 pair로 평가한다.

권장:

```ts
interface LongTermTransition {
  fromPeriodId: string
  toPeriodId: string

  boundary: string

  changedSemanticIds: readonly string[]
  changedMechanismIds: readonly string[]

  directionChanges: readonly ...
  targetChanges: readonly ...
  protectionChanges: readonly ...
  burdenChanges: readonly ...

  significance: ...
}
```

실제 repo 구조에 맞춘다.

---

# 25. 독립 양쪽 평가 필수

CR-08에서:

```text
A 대운 종료
B 대운 시작
```

을 모두 독립 평가해야 한다.

B만 평가하고:

```text
이때부터 삶이 크게 달라진다
```

고 쓰지 않는다.

---

# 26. boundary exactness

대운 전환 시각은 내부적으로 exact boundary를 유지한다.

고객 본문은 읽기 쉬운 날짜를 사용할 수 있지만,
계산·provenance에는 정확한 boundary가 보존되어야 한다.

---

# 27. 전환 전/후 비교

고객 설명은 가능한 경우:

```text
이전 10년에는 무엇이 중심
→ 다음 10년에는 무엇이 중심
```

으로 대비한다.

하지만:

```text
이전 삶
다음 삶
```

전체를 단정하지 않는다.

해당 outcome/function 범위만.

---

# 28. CR-08 장기 전환 후보 수

모든 미래 대운을 다 보여주지 않는다.

우선:

```text
현재 대운의 종료
다음 대운
필요 시 그 다음 큰 전환 1개
```

정도를 검토한다.

고객에게 5~6개의 10년 구간을 나열하지 않는다.

---

# 29. 전환 significance

점수화하지 않는다.

다음 qualitative 상태를 검토한다.

```text
major
meaningful
minor
none
```

단 실제 차이의 수와 중요도에 기반해야 한다.

---

# 30. major 기준

예:

```text
favorable ↔ unfavorable direction change
핵심 target change
보호 소실 + 손상 등장
핵심 burden 등장/종료
중요 outcome availability 변화
```

하나 이상.

구체 조건은 audit 후 확정한다.

---

# 31. CR-08 Narrative

```text
P1 앞으로 큰 전환이 있는 시점

P2 전환 전 흐름

P3 전환 후 흐름

P4 가장 크게 달라지는 기능

P5 보호/부담 변화

P6 고객이 체감할 수 있는 현실 의미

P7 다음 전환 후보가 있으면 추가

P8 장기 판단 기준
```

---

# 32. CR-08 readiness

## semantic READY

독립 평가된 adjacent Daewoon pair에서
실제 의미 변화가 1개 이상.

---

## PARTIAL

대운 pair는 있으나 변화 의미가 제한적.

---

## DEFERRED

비교 가능한 장기 transition evidence가 없음.

---

# 33. CR-09 역할

CR-09는 실행 시기 판단이다.

여기서 “기회”와 “주의”는 독립 축이다.

```text
opportunity
≠
caution
```

---

# 34. opportunity 정의

단순 favorable 운이 아니다.

실제 승인된 Outcome 또는 EventTimingFact가 있어야 한다.

가능 후보:

```text
relationship formation opportunity
money acquisition activation
role acquisition
contract/business timing
approved work/study timing
```

현재 producer가 없는 것은 사용하지 않는다.

---

# 35. caution 정의

단순 unfavorable 운이 아니다.

실제:

```text
burden
damage
pressure
constraint
health attention period
```

등 target이 확인되어야 한다.

---

# 36. generic favorable/unfavorable 금지

다음 금지:

```text
좋은 달
나쁜 달
운이 좋은 시기
운이 안 좋은 시기
```

대신:

```text
무엇을 활용하기 좋은지
무엇을 조심해서 판단해야 하는지
```

를 target별로 말한다.

---

# 37. opportunity와 caution 동시 존재

같은 기간에 둘 다 있을 수 있다.

예:

```text
earning opportunity
+
burden activation
```

이면:

```text
활용할 기회가 있지만
같은 활동의 부담도 함께 커질 수 있음
```

으로 둘 다 보존한다.

상쇄해서 중립으로 만들지 않는다.

---

# 38. CR-09 카드 단위

CR-09는 paragraph-only보다 period card 구조가 더 적합할 수 있다.

권장 semantic card:

```ts
interface TimingCard {
  periodRef
  start
  end

  opportunitySemanticIds
  cautionSemanticIds

  targetIds
  mechanismIds

  scope
  certainty
}
```

UI 구현은 이번 범위에 포함하지 않아도 된다.

---

# 39. TimingCard grouping

같은 기간의 여러 의미를 하나의 카드로 묶을 수 있다.

단:

```text
다른 기간
다른 scope
다른 target
```

은 임의 결합하지 않는다.

---

# 40. 카드 제목

고객용 제목은 의미 중심으로.

예:

```text
관계의 접점이 넓어지는 시기
수익화 경로가 활성되는 시기
부담을 함께 살펴야 하는 시기
```

날짜만 제목으로 쓰지 않는다.

---

# 41. 기회 카드

각 카드에서:

```text
무슨 기회인지
왜 기회인지
어느 기간인지
무엇을 활용할 수 있는지
```

를 설명한다.

---

# 42. 주의 카드

각 카드에서:

```text
무슨 부담/제약인지
왜 조심해야 하는지
어느 기간인지
무엇을 구분해서 판단해야 하는지
```

를 설명한다.

---

# 43. 행동 지시 금지

CR-09는 고객 판단 기준을 줄 수 있지만
구체 행동을 명령하지 않는다.

금지:

```text
투자하세요
이직하세요
결혼하세요
헤어지세요
계약하세요
수술하세요
```

---

# 44. Event Timing과 Outcome Timing 분리

다음 두 종류를 구분한다.

```text
Outcome activation
EventTimingFact
```

Outcome activation은 기능·기회·압력 활성.

EventTimingFact는 승인된 실제 timing event 의미.

둘을 같은 certainty로 다루지 않는다.

---

# 45. EventTimingFact 우선권

특정 사건 시기를 말하려면 EventTimingFact가 우선이다.

일반 Outcome만으로:

```text
계약이 체결된다
취업한다
연애가 시작된다
```

를 확정하지 않는다.

---

# 46. period overlap

두 TimingFact가 겹치는 경우:

```text
intersection
```

을 자동으로 “최고의 시기”로 만들지 않는다.

각 의미를 병렬 보존한다.

---

# 47. 기간 정렬

CR-09는 고객 기준일 이후를 우선 정렬한다.

권장:

```text
current
→ near future
→ later future
```

과거는 필요할 때만 비교/설명에 사용한다.

---

# 48. 현재 진행 중 카드

현재 referenceDate가 interval 안에 있으면:

```text
현재 진행 중
```

으로 구분할 수 있다.

하지만 긴 대운 전체를:

```text
지금이 기회다
```

라고 단순화하지 않는다.

---

# 49. 중첩 기간

대운 안의 세운,
세운 안의 월운이 같은 의미를 강화하는 경우:

```text
long background
→ annual activation
→ monthly focus
```

로 연결한다.

P4-D scope compression을 그대로 재사용한다.

---

# 50. 방향 변화 시 카드 분리

예:

```text
대운 favorable
세운 unfavorable
```

이면 같은 카드로 압축하지 않는다.

---

# 51. 현재 source/producer audit

이번 작업 시작 시 기존 producer를 먼저 감사한다.

최소:

```text
Luck Fact
Outcome
EventTimingFact
periodRef
scope
certainty
direction
target
mechanism
lifecycle
```

이 실제로 어디까지 생성되는지 확인한다.

---

# 52. CR-04 필요한 producer

최소 필요:

```text
baseline semantic
current semantic
comparison result
```

새로운 comparison producer가 필요하면 설계한다.

단 기존 Judgment를 다시 계산하지 않는다.

---

# 53. CR-08 필요한 producer

최소 필요:

```text
adjacent Daewoon A
adjacent Daewoon B
both evaluated semantics
transition diff
```

기존 결과를 비교하는 deterministic diff layer로 우선 구현한다.

---

# 54. CR-09 필요한 producer

가능하면 기존:

```text
Outcome activation
EventTimingFact
```

를 재사용한다.

새로운 fortune-scoring engine을 만들지 않는다.

---

# 55. Transition Diff

권장:

```ts
interface SemanticTransitionDiff {
  semanticKey
  fromState
  toState

  changeType:
    | 'appeared'
    | 'disappeared'
    | 'strengthened'
    | 'weakened'
    | 'direction_changed'
    | 'target_changed'
    | 'protection_changed'
    | 'burden_changed'

  sourceIds
}
```

실제 타입은 repository 구조에 맞춘다.

---

# 56. 같은 semanticKey 정의

가능하면 다음으로 normalize한다.

```text
domain
target
mechanism
meaning
direction
```

단 direction change 비교가 필요하면 direction은 비교 필드로 분리할 수 있다.

기존 normalized meaning key 정책과 맞춘다.

---

# 57. appeared / disappeared 주의

`disappeared`는:

```text
다음 범위에서 평가되지 않음
```

과 다르다.

실제:

```text
stopped
expired
suppressed
```

같은 종료 근거가 있어야 한다.

Missing evaluation을 disappearance로 처리하지 않는다.

---

# 58. unknown state

비교 대상 중 하나가 충분히 평가되지 않았다면:

```text
unknown
```

으로 둔다.

추정해서 transition을 만들지 않는다.

---

# 59. lifecycle

계속:

```text
active
conditional
reduced
stopped
expired
```

등 기존 lifecycle을 보존한다.

현재와 미래를 비교할 때 중요하다.

---

# 60. Health cross-topic

Health는 별도 renderer가 아직 없다.

하지만 CR-04/08/09에서 Health Outcome contract가 허용하는 범위는 고려한다.

---

# 61. Health CR-04

현재 burden이 실제 활성될 때만
현재 주의 영역으로 연결 가능.

H1 correspondence만으로 현재 변화 생성 금지.

---

# 62. Health CR-08

장기 transition에서 양쪽 대운을 독립 평가해
Health burden 상태가 실제 달라질 때만 사용.

---

# 63. Health CR-09

독립 H3 조건을 충족하는 국소 기간만
주의 카드 후보가 될 수 있다.

이번 단계에서 Health Renderer를 새로 완성하지는 않는다.

---

# 64. Work/Study

P4-B에서 Work/Study producer가 아직 불완전하다.

따라서 CR-04/08/09에서:

```text
취업
승진
시험
합격
학업 성공
```

을 임의 생성하지 않는다.

기존 approved Outcome/EventTiming이 있을 때만.

---

# 65. Relationship

기존 CL-R01~03을 사용한다.

허용:

```text
contact/change
formation opportunity
pressure
```

금지:

```text
실제 연애 시작
결혼 확정
이별 확정
```

---

# 66. Money

P4-F 결과를 사용한다.

CR-09에서:

```text
money acquisition activation
retention pressure
burden
```

을 각각 기회/주의 semantic으로 사용할 수 있다.

단:

```text
돈 벌기 좋은 달
```

처럼 단순화하지 않는다.

---

# 67. Chapter overlap rule

같은 semantic unit이 CR-04와 CR-09에 모두 쓰이는 경우:

CR-04:

```text
현재 무엇이 달라졌는지
```

CR-09:

```text
언제 그 의미가 구체적으로 활성되는지
```

로 역할을 구분한다.

---

# 68. 장간 중복 QA

추가:

```ts
crossChapterDuplicateMeaningCount
crossChapterRoleCollisionCount
```

같은 내용을 같은 역할로 두 장에 반복하면 QA 경고.

---

# 69. Readiness model

P4-E.2의 두 층 readiness를 세 장에도 적용한다.

```text
semanticReadiness
publicationReadiness
```

---

# 70. CR-04 semantic readiness

READY:

```text
baseline/current comparison valid
+
실제 change 1개 이상
```

PARTIAL:

```text
current semantic만 있고 비교 제한
```

DEFERRED:

```text
현재 변화 근거 없음
```

---

# 71. CR-08 semantic readiness

READY:

```text
adjacent Daewoon pair
+
양쪽 독립 평가
+
실제 transition 1개 이상
```

PARTIAL:

```text
pair 있으나 의미 변화 제한
```

DEFERRED:

```text
유효 transition 없음
```

---

# 72. CR-09 semantic readiness

READY:

```text
독립 timing window 2개 이상
```

또는:

```text
opportunity 1
+
caution 1
```

처럼 고객 판단에 의미 있는 복수 timing 근거.

PARTIAL:

```text
유효 window 1개
```

DEFERRED:

```text
유효 timing 없음
```

실제 fixture coverage를 본 뒤 조정 가능.

---

# 73. publication quality band

CR-04:

```text
1,500~2,400자
7~10문단
```

CR-08:

```text
1,300~2,200자
6~9문단
```

CR-09:

```text
1,700~2,800자
8~12문단/카드
```

현재와 같이 source가 충분할 때의 품질 band다.

---

# 74. 발행 기준은 coverage 중심

이번 단계부터 다음도 기록한다.

```text
supportedSemanticCount
explainedSemanticCount
transitionCount
timingWindowCount
opportunityCount
cautionCount
```

분량만으로 발행 여부를 판단하지 않는다.

---

# 75. CR-04 QA

추가:

```text
baselineCoverage
currentCoverage
changeCount
unsupportedChangeCount
```

---

# 76. CR-08 QA

추가:

```text
evaluatedPairCount
transitionCount
unknownSideCount
unsupportedTransitionCount
```

---

# 77. CR-09 QA

추가:

```text
timingWindowCount
opportunityCount
cautionCount
unsupportedOpportunityCount
unsupportedCautionCount
```

---

# 78. 반드시 0

```text
unsupportedChangeCount = 0
unsupportedTransitionCount = 0
unsupportedOpportunityCount = 0
unsupportedCautionCount = 0
duplicateMeaningCount = 0
```

---

# 79. fixture 유형

최소 다음 fixture를 확보한다.

## CR-04

```text
current new activation
direction change
protection change
current semantic but no baseline comparison
no current change
```

---

## CR-08

```text
major Daewoon transition
minor transition
no meaningful transition
one side unknown
protection ↔ damage transition
burden start/end transition
```

---

## CR-09

```text
opportunity only
caution only
opportunity + caution same period
nested daewoon/sewoon/month activation
different directions across scopes
no timing
```

---

# 80. 과거 구간 회귀

현재 referenceDate 이전의 period도
comparison fixture로 사용할 수 있다.

하지만 customer default는 현재/미래 중심이다.

---

# 81. 실제 고객 전문

최소 다음을 출력한다.

```text
CR-04
- 가장 풍부한 current change fixture
- direction change fixture

CR-08
- major transition fixture
- no meaningful transition fixture

CR-09
- opportunity + caution fixture
- nested scope fixture
```

각 결과:

```text
semanticReadiness
publicationReadiness
글자/문단 또는 카드
semantic 수
transition/timing 수
gap
```

---

# 82. CR-04 실제 품질 확인

본문에서 다음이 보여야 한다.

```text
원래 상태
현재 달라진 상태
왜 달라졌는지
어느 범위에서 달라졌는지
```

---

# 83. CR-08 실제 품질 확인

본문에서:

```text
전환 전
전환 후
실제 차이
경계 시점
```

이 명확해야 한다.

---

# 84. CR-09 실제 품질 확인

각 카드/문단이:

```text
무슨 시기인지
왜 그런지
무엇을 활용/주의해서 볼지
기간
```

을 제공해야 한다.

---

# 85. 고객 판단 기준

CR-09의 application은 명령이 아니라 판단 기준이다.

예:

```text
기회가 열려 있더라도
같은 시기에 부담이 함께 커지는지를 따로 확인합니다.
```

같은 수준.

---

# 86. 확정도

기존 certainty를 그대로 보존한다.

Renderer가:

```text
conditional
```

을 확정 표현으로 바꾸지 않는다.

---

# 87. 날짜 표현

내부:

```text
exact ISO / periodRef
```

유지.

고객:

```text
한국 날짜 중심
```

으로 읽기 쉽게 표시 가능.

필요하면 exact boundary는 보조 정보.

---

# 88. timezone

KO:

```text
Asia/Seoul
```

JA/EN은 추후 locale renderer에서 별도 처리한다.

Semantic layer에는 locale timezone 문자열을 박지 않는다.

---

# 89. deterministic

같은:

```text
chart
context
referenceDate
contract version
```

이면 결과 순서와 grouping이 동일해야 한다.

---

# 90. 정렬

기본:

CR-04:

```text
importance → scope → period
```

CR-08:

```text
transition boundary ascending
```

CR-09:

```text
current → nearest future → later future
```

구체 tie-breaker를 명시한다.

---

# 91. 랜덤 예시 금지

고객 장면과 application은
semantic/context mapping에서 deterministic하게 선택한다.

---

# 92. 이번 단계에서 새 scoring 금지

다음 만들지 않는다.

```text
운 점수
기회 점수
위험 점수
전환 점수
```

qualitative state만.

---

# 93. Master 변경 후보

필요하면:

```text
15-event-timing-spec.md
17-cause-to-life-mapping.md
18-customer-chapter-content-contract.md
19-reading-narrative-blueprint.md
20-reading-renderer-quality-reference.md
```

를 수정한다.

새 source authority가 필요하면 먼저 audit result에 제안하고 무단 승격하지 않는다.

---

# 94. 구현 순서

권장:

```text
1. 기존 Luck/Outcome/EventTiming producer audit
2. temporal comparison model
3. CR-04 current-change assembly
4. adjacent Daewoon diff
5. CR-08 transition assembly
6. timing card grouping
7. CR-09 assembly
8. KO renderer
9. readiness + QA
10. fixture regression
```

---

# 95. 결과 문서

권장:

```text
src/docs/codex/p4g-luck-transition-timing-chapters-result.md
```

---

# 96. 결과 보고

## Producer Audit

현재 무엇이 있고 없는지.

## Temporal Model

baseline/current/transition/timing.

## CR-04

계약, fixture, 실제 전문.

## CR-08

transition 정의, fixture, 실제 전문.

## CR-09

opportunity/caution 정의, timing card, 실제 전문.

## Cross-Chapter Deduplication

같은 Outcome이 어떻게 다른 역할로 배치되는지.

## Readiness

semantic/publication.

## QA

unsupported / duplicate / transition / timing.

## Remaining GAP

source / producer / renderer를 분리.

---

# 97. 성공 기준

이번 작업 성공은:

```text
운세 문장이 많아졌다
```

가 아니다.

성공은:

```text
현재 변화와 장기 전환과 구체 시기를 구분한다.

원국·대운·세운·월의 역할이 다르다.

대운 경계만으로 큰 변화를 만들지 않는다.

하위 기간을 상위 운에서 복제하지 않는다.

기회와 주의를 독립 평가한다.

좋은 운/나쁜 운 같은 일반 문구로 축약하지 않는다.

같은 Outcome을 세 장에서 반복하지 않는다.

고객이
'지금 무엇이 달라지는가'
'언제 큰 전환이 있는가'
'언제 무엇을 활용하거나 조심해서 볼 것인가'
를 각각 다른 장에서 이해할 수 있다.
```

이다.

---

# 98. 범위 밖

이번 작업에서는 하지 않는다.

```text
Work/Study producer 신규 확장
Health Renderer 완성

JA Renderer
EN Renderer

UI redesign
Paywall

운 점수화
종합 행운지수
```

이번 작업은 CR-04 / CR-08 / CR-09의 시간 구조와 고객 리딩 계약 구현에만 집중한다.