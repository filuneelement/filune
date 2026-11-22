# FILUNE Compatibility-04
## Relationship Lifecycle & Timing

진입 조건:

```text
COMPATIBILITY_PERSONALITY_INTERACTION_READY
```

현재 완료:

```text
Compatibility-01 Cross-chart Fact Engine
Compatibility-02 Structural Compatibility
Compatibility-03 Personality Interaction
```

이번 단계는 두 사람의 관계에서:

```text
관계 형성·진전
결혼 가능 시기
결혼에 유리한 시기
결혼에 불리한 시기
관계 부담 증가 시기
관계 회복 시기
이별·별거·이혼 위험 상승 시기
```

를 계산한다.

---

# ALLOWED SOURCES

이번 작업의 규칙 근거는 아래로 제한한다.

```text
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md
src/docs/rules/master/16-compatibility-spec.md

src/docs/source/primary/07-사주풀이예시.md

Compatibility-02 result
Compatibility-03 result

현재 Judgment
현재 Relationship Outcome
현재 Event Timing
```

과거 revision과 과거 Codex 결과를
새 정책 근거로 사용하지 않는다.

---

# FIXED PRINCIPLES

## T-01

```text
결혼 가능 시기
≠
결혼하기 좋은 시기
```

반드시 분리한다.

---

## T-02

```text
관계 변화 신호
≠
관계 악화
```

합이나 충이 사건을 촉발한다고 해서
자동으로 길흉을 붙이지 않는다.

---

## T-03

```text
일지 충
≠
자동 이혼
```

이혼·별거 위험은
원국 관계 취약 구조와
해당 시기의 실제 악화 경로를 함께 본다.

---

## T-04

근거가 확정되면 결과를 지나치게 약화하지 않는다.

```text
confirmed relationship strain
→ 관계 부담 증가 확정

confirmed marriage opportunity
→ 결혼·관계 공식화가 생기기 쉬운 시기 확정

confirmed breakdown path
→ 관계 파탄 위험이 뚜렷하게 높아지는 시기 확정
```

---

## T-05

단:

```text
breakdown risk confirmed
```

는:

```text
반드시 이혼한다
```

와 동일하지 않다.

이는 source 자체가
여러 구조와 시기를 함께 보도록 하기 때문이다.

---

# 1. Individual Timing과 Pair Timing 분리

먼저 각 사람을 독립적으로 계산한다.

```text
A Relationship Timing
B Relationship Timing
```

그 후:

```text
Pair Relationship Timeline
```

으로 조립한다.

---

# 2. 두 사람의 운을 한 명식으로 합치지 않는다

금지:

```text
A의 운 글자
+
B의 원국/운 글자
→ 하나의 명식처럼 재계산
```

각 개인 Judgment는 독립적으로 실행한다.

Pair layer는 결과만 조합한다.

---

# 3. 기존 운 Scope 재사용

현행 FILUNE의 scope:

```text
Natal
GreatLuck
Year
Month
Day
```

또는 실제 canonical naming을 재사용한다.

새 시간 엔진을 만들지 않는다.

---

# 4. 기간은 힘의 점수가 아니다

기존 Master 08 유지:

```text
장기 범위
연 단위
월 단위
일 단위
```

는 duration 차이다.

숫자 weight를 만들지 않는다.

---

# PART A — Relationship Formation / Marriage Opportunity

# 5. Marriage Opportunity Fact

내부 결과 후보:

```text
MarriageOpportunityFact
```

최소:

```text
person
scope
scopeId
triggerType
sourceFactIds
certainty
```

---

# 6. 배우자궁 합

현재 Branch Master 기준으로
일지 배우자궁에 실제:

```text
六合
유효한 半合局
유효한 三合局
```

이 성립하는 시기를
관계 형성/결혼 시기 신호로 사용한다.

---

# 7. 옛 source terminology를 그대로 복제하지 않는다

원자료가 두 글자를
`삼합`, `합` 등으로 표현했더라도
엔진 내부 canonical relation은
현재 Master 03을 따른다.

예:

```text
午戌
```

은 현행 FILUNE 기준에 맞게 분류한다.

---

# 8. 배우자궁 충

현재 운의 지지가
일지 배우자궁과 실제 충하면:

```text
relationship_change_trigger
```

를 생성한다.

이것은 자동 unfavorable이 아니다.

---

# 9. 충에 의한 갑작스러운 변화

배우자궁 충은 source-supported하게:

```text
갑작스러운 만남
관계 변화
주변 환경에 의한 관계 공식화
```

의 사건 trigger가 될 수 있다.

따라서:

```text
clash → breakup
```

shortcut은 금지한다.

---

# 10. 여성 — 食神

여성의 현재 scope에서
식신 기능이 실제로 강하게 살아나고
관계/배우자궁 시기 신호와 연결되면
결혼·관계 형성 opportunity로 사용한다.

단 단순 글자 출현만 보지 않는다.

기존 Judgment actual function을 사용한다.

---

# 11. 여성 — 官殺

여성의 현재 scope에서
배우자성인 관살이 실제로 들어와 작동하면
marriage opportunity 신호가 될 수 있다.

원국과 유효한 합 관계까지 형성되면
추가 timing evidence로 보존한다.

---

# 12. 여성 관살혼잡

현재 scope에서 실제:

```text
官殺混雜
```

이 성립하면:

```text
marriage_quality_pressure
```

의 불리한 근거로 사용한다.

결혼 opportunity 자체와 분리한다.

---

# 13. 남성 — 財

남성의 현재 scope에서
재성이 실제 작동하고
원국과 유효한 합을 형성하면:

```text
marriage_opportunity
```

의 source-supported trigger로 사용한다.

---

# 14. 日干合 특수 timing signal

기존 구조 해석에서 일간합을
일반 구조 효과로 사용하지 않는 규칙은 유지한다.

그러나 결혼 시기 source에서 인정한 범위에서는:

```text
dayMasterCombineTimingSignal
```

과 같은 **timing-only signal**로 사용할 수 있다.

구조 Judgment를 변경하지 않는다.

---

# 15. 단일 신호도 보존

source-supported timing trigger 하나가
명확히 성립하면
그 신호 자체를 삭제하지 않는다.

다만:

```text
marriage opportunity
```

와:

```text
marriage favorable
```

를 혼동하지 않는다.

---

# PART B — Marriage Opportunity vs Quality

# 16. Opportunity

다음은 사건 발생 가능성이 커지는 시기다.

```text
relationship formation
relationship officialization
marriage opportunity
```

이 자체에는 good/bad가 없다.

---

# 17. Marriage Quality

Opportunity가 존재하는 동일 scope에서:

```text
현재 Judgment
Relationship Outcome
배우자성 CurrentFunction
배우자궁 상태
현재 harmful path
```

를 확인한다.

---

# 18. 유리한 결혼 시기

결혼 opportunity가 있고
동시에 관계·배우자 관련 구조가
실제로 유리하게 작동하면:

```text
marriage_favorable_window = confirmed
```

---

# 19. 불리한 결혼 시기

결혼 opportunity는 있으나
같은 시기에:

```text
배우자성 손상
관살혼잡
배우자궁의 harmful structural effect
confirmed relationship pressure
핵심 Byeong activation이 관계 영역을 손상
```

등이 실제 확인되면:

```text
marriage_caution_window = confirmed
```

---

# 20. 결과를 숨기지 않는다

예:

```text
Marriage Opportunity = confirmed
Marriage Caution = confirmed
```

이면:

```text
결혼 가능성은 높은 시기지만
결혼 후 부담이 커질 구조
```

라는 의미다.

이를 `deferred`로 합치지 않는다.

---

# 21. 좋은 시기가 아니라고 opportunity 삭제 금지

불리한 결혼 시기라도:

```text
실제로 결혼이 잘 생기는 시기
```

라는 사실은 유지한다.

---

# PART C — Relationship Strain

# 22. Relationship Strain Fact

현재 scope에서 기존 Relationship Outcome이:

```text
relationship_pressure
significator damage
spouse-palace pressure
```

등을 confirmed로 산출하면 재사용한다.

---

# 23. C3 Personality 연결

C3에서 현재 scope의:

```text
communicationFrictionStrengthened
expressionConstraintStrengthened
```

이 confirmed이면:

```text
relationship_strain
```

의 독립 근거로 사용한다.

---

# 24. C3 회복

반대로:

```text
currentExpressionRelief
communicationRelief
```

가 confirmed이면:

```text
relationship_relief
```

로 보존한다.

---

# 25. 구조적 부담과 성격 부담은 분리

예:

```text
structural strain
+
communication relief
```

이 동시에 존재할 수 있다.

둘 중 하나를 삭제하지 않는다.

---

# PART D — Separation / Divorce Risk

# 26. 일지 충 단독 금지

다음 shortcut 금지:

```text
spouse-palace clash
→ divorce
```

---

# 27. Breakdown Path

이별·별거·이혼 위험을 높이려면
구조 경로를 추적한다.

최소 형태:

```text
baseline relationship vulnerability
↓
current harmful activation
↓
spouse/relationship function damage
↓
relationship strain/breakdown pressure
```

---

# 28. Baseline Vulnerability 후보

기존 confirmed Fact만 사용한다.

예:

```text
배우자궁 기존 손상
배우자성 기존 문제
relationship significator damage
confirmed harmful relationship path
기존 Relationship Outcome의 지속 부담
```

---

# 29. Current Harmful Activation

현재 scope에서:

```text
배우자궁에 실제 추가 손상
배우자성 weakened/stopped
기존 harmful path 활성/강화
관살혼잡 등 source-supported relationship pressure
```

가 확인되는지 본다.

---

# 30. Divorce/Breakdown Risk

Baseline vulnerability와
현재 harmful activation이
같은 관계 경로로 연결되면:

```text
relationship_breakdown_risk = confirmed
```

할 수 있다.

---

# 31. stronger breakdown path

원국부터 배우자 구조가 취약하고
현재 장기 범위와 단기 범위가
같은 harmful relationship path를 연속 활성화하면:

```text
relationship_breakdown_risk = high
```

또는 repository convention의
비수치 qualitative equivalent를 사용할 수 있다.

새 숫자 점수는 금지한다.

---

# 32. 위험을 애매하게 낮추지 않는다

구조 경로가 모두 confirmed라면:

```text
관계 파탄 위험이 뚜렷하게 높아지는 시기
```

로 판정한다.

```text
조금 조심할 수 있음
가능성이 있을 수도 있음
```

으로 낮추지 않는다.

---

# 33. 그러나 확정 사건과 구분

다음은 금지:

```text
이 시기에 반드시 이혼한다
```

실제 생활 사건에는
상대방 선택과 현실 조건이 개입한다.

엔진은 구조적 event risk를 판정한다.

---

# 34. 관계 상태에 따른 event label

사용자가 실제 relationship status를 제공하면
고객 renderer에서:

```text
married
→ marital conflict / separation / divorce risk

dating/partnered
→ relationship breakdown / breakup risk
```

로 표현할 수 있다.

C4 내부 canonical result는:

```text
relationship_breakdown_risk
```

를 우선 사용한다.

---

# 35. 관계 상태를 사주에서 추정하지 않는다

금지:

```text
현재 결혼한 사람일 것이다
현재 연애 중일 것이다
```

사용자 실제 상태가 없으면
generic relationship breakdown risk로 유지한다.

---

# PART E — One-sided and Mutual Timing

# 36. 한 사람에게만 신호가 있어도 보존

예:

```text
A marriage opportunity = confirmed
B = no matching signal
```

이면 A 신호를 삭제하지 않는다.

---

# 37. Mutual Window

A와 B에게
동일한 Gregorian 기간에
관계 형성/결혼 opportunity가 모두 존재하면:

```text
mutual_marriage_window
```

로 보존한다.

---

# 38. 한쪽만 위험해도 관계에 영향 가능

source-supported 원칙에 따라
한 사람의 관계/경제/생활 구조가 급격히 나빠져
실제 Relationship Outcome까지 악화되는 경우
pair 관계 부담에 영향을 줄 수 있다.

단:

```text
Money bad
→ divorce risk
```

직접 shortcut은 금지한다.

반드시 Relationship path까지 연결되어야 한다.

---

# PART F — Pair Baseline

# 39. C2 Structural Compatibility 재사용

C2의:

```text
A→B structural verdict
B→A structural verdict
support/damage effects
```

를 baseline으로 보존한다.

---

# 40. C2 baseline이 불리해도 결혼은 가능

```text
Structural Compatibility = unfavorable
```

이라고:

```text
marriage opportunity = false
```

로 만들지 않는다.

좋지 않은 궁합에서도 실제 결혼은 발생할 수 있다.

---

# 41. C2 baseline이 좋아도 breakdown risk 가능

반대로:

```text
Structural Compatibility = favorable
```

이어도
향후 한쪽 또는 양쪽의 시기 악화로:

```text
relationship strain
breakdown risk
```

가 생길 수 있다.

---

# PART G — Timeline

# 42. 결과 구조

권장:

```text
RelationshipLifecycleFact[]
RelationshipTimingDecision[]
PairRelationshipWindow[]
```

실제 repository convention에 맞춘다.

---

# 43. Event 종류

최소:

```text
relationship_formation
relationship_change

marriage_opportunity
marriage_favorable
marriage_caution

relationship_strain
relationship_relief

relationship_breakdown_risk
```

---

# 44. Event Timing Engine 재사용

기존:

```text
Evidence
↓
Decision
↓
Calendar Projection
↓
TimingFact
```

구조를 그대로 사용한다.

새 날짜 계산기를 만들지 않는다.

---

# 45. Gregorian Projection

현재 scope가 실제 Gregorian interval로
projection 가능할 때만 날짜/기간을 만든다.

가짜 날짜:

```text
0
```

---

# 46. Day scope

현행 Day projection이 아직 지원되지 않는 부분이 있다면
C4 전체를 막지 않는다.

지원 가능한:

```text
장기 범위
연
월
```

부터 결과를 만든다.

Day는 실제 engine support가 있을 때만 포함한다.

---

# 47. 고객 명리 용어 금지

내부에서는 canonical scope를 사용해도 된다.

하지만 후속 고객 결과에는:

```text
대운
세운
월운
일진
용신
상신
병
구응
```

을 직접 노출하지 않는다.

고객에게는:

```text
2028년
2029년 봄
이 시기
장기적으로
```

등의 생활 언어로 변환한다.

---

# PART H — Source Regression

# 48. 결혼 발생 사례

원자료의 실제:

```text
배우자궁 합 시 결혼
```

사례를 source fixture로 사용한다.

Expected:

```text
marriage_opportunity = confirmed
```

---

# 49. 결혼 가능하지만 불리한 사례

원자료의:

```text
결혼 시기 신호 존재
BUT
동일 scope 구조 악화
```

사례를 반드시 검증한다.

Expected:

```text
marriage_opportunity = confirmed
marriage_caution = confirmed
```

둘 다 존재.

---

# 50. 일지 충 이혼 사례

일지 충이 실제 이혼 시기와 겹친 source case를 검증하되:

```text
clash only
```

가 아니라
기존 관계 취약 경로와 현재 악화를 함께 추적한다.

---

# 51. 복합 이혼 사례

원국 배우자 구조 취약
+
장기 scope 악화
+
추가 단기 scope 악화
+
실제 관계 문제

가 겹친 source 사례를
`relationship_breakdown_risk` positive regression으로 사용한다.

---

# 52. Clash-only negative fixture

배우자궁 충만 있고
기타 relationship harmful path가 없는 synthetic fixture에서는:

```text
relationship_change = confirmed
relationship_breakdown_risk = not generated
```

이어야 한다.

---

# PART I — No Conservative Collapse

# 53. 다음 패턴 금지

```text
marriage timing confirmed
→ "관련 가능성"

breakdown path confirmed
→ "조심하면 좋음"

relationship relief confirmed
→ "좋아질 수도 있음"
```

---

# 54. 현상은 현상대로 기록

Confirmed path:

```text
confirmed
```

Mixed result:

```text
both preserved
```

Evidence 부족:

```text
deferred
```

이 셋을 구분한다.

---

# PART J — Forbidden Shortcuts

# 55. 금지

```text
合 = 결혼
沖 = 이혼

官殺 = 여성 결혼
財 = 남성 결혼

식신 등장 = 여성 결혼

Structural Compatibility favorable
= 반드시 결혼

Structural Compatibility unfavorable
= 반드시 이별
```

각각 source-supported 추가 조건과
actual function을 확인한다.

---

# 56. 숫자 scoring 금지

```text
marriageScore
divorceScore
relationshipRiskScore
+10
-20
percentage
```

0건.

---

# PART K — Master Updates

# 57. Master 16

Compatibility lifecycle 섹션을 추가한다.

최소:

```text
Marriage Opportunity vs Quality
one-sided vs mutual timing
relationship strain/relief
relationship breakdown path
C2/C3 baseline linkage
```

---

# 58. Master 15

기존 Event Timing 구조를 변경하지 않고
source-supported relationship event mapping만 additive하게 추가한다.

최소:

```text
relationship formation
marriage opportunity
marriage favorable/caution
relationship strain/relief
relationship breakdown risk
```

---

# 59. Master 08/09 수정 금지

기존 Luck/Judgment semantics를
C4 편의를 위해 변경하지 않는다.

필요한 Fact가 없으면:

```text
COMPATIBILITY_C4_JUDGMENT_FACT_GAP
```

으로 정확히 보고한다.

---

# PART L — Verification

# 60. 신규 verifier

권장:

```text
scripts/verify-compatibility-lifecycle-timing-c4.mjs
```

---

# 61. 필수 검증

```text
marriage opportunity
marriage favorable
marriage caution

relationship change
relationship strain
relationship relief
relationship breakdown risk

one-sided timing
mutual timing
```

---

# 62. Source Cases

최소:

```text
결혼 발생 source case
결혼 timing + 불리 source case
일지 충 + 실제 이혼 source case
복합 구조 + 이혼 source case
```

검증.

---

# 63. Negative Contracts

최소:

```text
clash only ≠ divorce
combine only ≠ marriage favorable
partner-star appearance only ≠ marriage
bad money outcome only ≠ divorce
```

---

# 64. Identity / Provenance

Expected:

```text
duplicate IDs = 0
orphan provenance = 0
wrong scope = 0
fake Gregorian dates = 0
```

---

# 65. Isolation

Expected semantic changes:

```text
Judgment = 0
Money = 0
Health = 0
Relationship existing semantics = 0
Personality = 0

Compatibility C1 = 0
Compatibility C2 = 0
Compatibility C3 = 0
```

---

# 66. Regression

반드시:

```text
Compatibility C1
Compatibility C2
Compatibility C3

Judgment 35/35
Personality
Money
Health
Relationship
Event Timing Batch 1

npx tsc -b
npm run build
git diff --check
```

---

# 67. 결과 파일

생성:

```text
src/docs/codex/compatibility-04-relationship-lifecycle-timing-result.md
```

---

# 68. 최종 보고

반드시:

```text
Relationship formation:
Relationship change:

Marriage opportunity:
Marriage favorable:
Marriage caution:

Relationship strain:
Relationship relief:
Relationship breakdown risk:

One-sided windows:
Mutual windows:

Source regressions:
Negative shortcut violations:

Deferred:
Judgment fact gaps:

Duplicate IDs:
Orphan provenance:
Fake Gregorian dates:
Mutations:
```

---

# 69. 정책 결정 필요

현재 source/master에 없는
새 관계 timing 규칙이 필요하면:

```text
COMPATIBILITY_C4_POLICY_DECISION_REQUIRED
```

로 중단한다.

임의 구현하지 않는다.

---

# 70. 성공

다음을 모두 만족하면:

```text
COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY
```

---

# 71. 다음 단계

C4 성공 후:

```text
Compatibility-05
Final Compatibility Assembly
```

로 이동한다.

C5에서는 처음으로:

```text
C2 Structural Compatibility
+
C3 Personality Interaction
+
C4 Relationship Lifecycle & Timing
```

을 하나의 최종 궁합 결과로 조립한다.

새 명리 규칙은 만들지 않는다.