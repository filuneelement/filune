# FILUNE Compatibility-05
## Final Compatibility Assembly

진입 조건:

```text
COMPATIBILITY_CROSS_CHART_FACT_ENGINE_READY
COMPATIBILITY_STRUCTURAL_POLICY_READY
COMPATIBILITY_PERSONALITY_INTERACTION_READY
COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY
```

현재 완료:

```text
C1 Cross-chart Fact Engine
C2 Structural Compatibility
C3 Personality Interaction
C4 Relationship Lifecycle & Timing
```

이번 단계의 목적은
위 결과들을 **하나의 Final Compatibility Result로 조립**하는 것이다.

---

# ALLOWED SOURCES

이번 작업에서 사용할 수 있는 것은:

```text
src/docs/rules/master/16-compatibility-spec.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/rules/master/15-event-timing-spec.md

Compatibility-01 result
Compatibility-02 result
Compatibility-03 result
Compatibility-04 result
Compatibility-04B result

현재 src/lib/compatibility/
현재 src/lib/reading/
```

새 명리 판단을 위해
원자료를 다시 연구하지 않는다.

---

# FIXED RULES

## F-01

C5는 판단 엔진이 아니다.

```text
C1/C2/C3/C4
↓
Final Assembly
```

만 수행한다.

---

## F-02

다음 의미를 새로 계산하지 않는다.

```text
합충형파해
용신/상신/병/구응
Root
TenGod
Personality trait
Marriage timing
Breakdown risk
```

기존 confirmed result만 조립한다.

---

## F-03

숫자 궁합 점수는 만들지 않는다.

금지:

```text
85점
72%
compatibilityScore
weightedScore
overallScore
```

---

## F-04

결과가 섞였다는 이유로:

```text
애매하다
판단하기 어렵다
좋을 수도 나쁠 수도 있다
```

로 축소하지 않는다.

각 축의 확정 결과를 그대로 보존한다.

---

# 1. 최종 결과 구조

권장:

```text
FinalCompatibilityResult
```

최소 구성:

```text
identity

structural
personality
relationshipLifecycle

strengths[]
risks[]
currentState[]
timingWindows[]

overallSummary

provenance
```

실제 naming은 repository convention에 맞춘다.

---

# 2. Structural section

C2 결과를 그대로 포함한다.

최소:

```text
AtoB
BtoA

structuralVerdict

relievesByeong
weakensByeong
activatesByeong
strengthensHarmfulPath

supportsRequiredFunction
damagesRequiredFunction

supportsRequiredRoot
supportsHarmfulRoot
```

---

# 3. 방향성 보존

예:

```text
A → B = favorable
B → A = unfavorable_dominant
```

이면 그대로 보존한다.

이를:

```text
overall = neutral
```

로 평균내지 않는다.

---

# 4. balanced_mixed 보존

C2에서:

```text
balanced_mixed
```

이면 그대로 보존한다.

의미:

```text
핵심 유리 작용
+
핵심 불리 작용
+
구조적 우열 없음
```

이지 `ambiguous`가 아니다.

---

# 5. Personality section

C3의:

```text
Natal Personality Interaction
Current Personality Interaction
```

을 분리해 포함한다.

최소:

```text
communication
expression
approved interaction facts

Natal state
Current state
Current relief / worsening
```

---

# 6. Natal과 Current 혼합 금지

예:

```text
Natal:
communication friction confirmed

Current:
expression relief confirmed
```

이면 둘 다 보존한다.

최종 결과를:

```text
communication = neutral
```

로 만들지 않는다.

---

# 7. Relationship Lifecycle section

C4 결과를 포함한다.

최소:

```text
relationshipFormation
relationshipChange

marriageOpportunity
marriageFavorable
marriageCaution

relationshipStrain
relationshipRelief

relationshipBreakdownRisk
```

---

# 8. Timing window 보존

각 event의:

```text
scope
scopeId
Gregorian interval if projectable
certainty
sourceFactIds
```

를 유지한다.

---

# 9. Opportunity와 Quality 분리

예:

```text
marriageOpportunity = confirmed
marriageCaution = confirmed
```

이면:

```text
결혼 가능성이 높은 시기
+
결혼 후 부담도 커질 수 있는 시기
```

라는 두 Fact를 모두 보존한다.

하나로 상쇄하지 않는다.

---

# 10. Relationship Breakdown Paths

C4의 두 경로를 보존한다.

```text
BREAKDOWN-A
Baseline Vulnerability Aggravation

BREAKDOWN-B
Spouse Event + Palace Disruption
```

같은 시기에 둘 다 confirmed면:

```text
breakdownPathIds = [A, B]
```

형태로 모두 보존한다.

---

# 11. path 개수 scoring 금지

```text
2개니까 위험 2배
```

같은 숫자화 금지.

---

# 12. Overall Summary의 역할

C5에는 고객 문장 이전 단계의
언어 독립적 summary를 만들 수 있다.

예:

```text
structurally_supportive
structurally_difficult
structurally_mixed

personality_supportive
personality_friction
personality_mixed

stable_baseline_with_risk_windows
difficult_baseline_with_relief_windows
```

실제 enum은 기존 결과를 요약하는 범위에서만 만든다.

---

# 13. 새로운 명리 판단 금지

Overall Summary 때문에:

```text
C2 = favorable
C3 = friction
C4 = breakdown risk
```

를 새 명리 규칙으로 재평가하지 않는다.

Summary는 **index / assembly label**이어야 한다.

---

# 14. Overall을 단일 good/bad로 강제하지 않는다

Final result에는 최소 세 축을 유지한다.

```text
Structural
Personality
Lifecycle/Timing
```

---

# 15. 예시 1

```text
Structural:
favorable

Personality:
communication friction

Lifecycle:
no current breakdown risk
```

최종 의미:

```text
구조적으로는 서로에게 도움이 됨
+
성격 표현에서는 마찰 있음
+
현재 관계 파탄 위험 경로는 없음
```

이다.

이를:

```text
궁합 보통
```

으로 줄이지 않는다.

---

# 16. 예시 2

```text
Structural:
favorable

Personality:
favorable

Lifecycle:
breakdown risk confirmed in future window
```

가능하다.

좋은 궁합이라고
향후 위험 시기를 숨기지 않는다.

---

# 17. 예시 3

```text
Structural:
unfavorable_dominant

Personality:
supportive

Lifecycle:
relationship relief window
```

가능하다.

성격이 잘 맞거나 특정 시기에 관계가 좋아진다고
기본 구조적 어려움을 삭제하지 않는다.

---

# 18. Strength Fact

최종 strengths는
기존 confirmed positive facts에서만 생성한다.

예:

```text
byeong relief
required function support
required root support

communication relief

marriage favorable
relationship relief
```

---

# 19. Risk Fact

최종 risks는
기존 confirmed negative facts에서만 생성한다.

예:

```text
harmful path strengthening
required function damage
harmful root support

communication friction

marriage caution
relationship strain
relationship breakdown risk
```

---

# 20. strengths와 risks 동시 존재 허용

예:

```text
strengths.length > 0
risks.length > 0
```

정상이다.

이를 `mixed/deferred` 하나로 합치지 않는다.

---

# 21. 강점·위험 우선순위

새 숫자 우선순위를 만들지 않는다.

기존 C2/C3/C4의 구조 우선순위와 certainty를 그대로 사용한다.

---

# 22. 동일 Fact 중복 방지

같은 source effect가:

```text
Structural strength
+
Lifecycle relief
```

양쪽에 참조될 수는 있다.

하지만 같은 semantic fact를
새 ID로 복제하지 않는다.

---

# 23. Stable identity

각 FinalCompatibilityResult는
입력 A/B 순서와 canonical identity 규칙을 명시한다.

---

# 24. A/B order swap

A/B를 바꾸어 실행했을 때:

```text
directional results
```

만 정상적으로 반전되고

```text
pair identity
source facts
symmetric facts
timing facts
```

가 불안정하게 중복 생성되어서는 안 된다.

---

# 25. Pair ID

현행 C1 pair identity를 재사용한다.

새 임의 hash rule을 만들지 않는다.

---

# 26. Source provenance

최종 결과의 모든:

```text
strength
risk
timing
summary basis
```

은 C1~C4 source fact IDs까지 추적 가능해야 한다.

---

# 27. Orphan summary 금지

다음 금지:

```text
overallSummary = favorable
```

BUT

```text
supporting Fact ID = 없음
```

---

# 28. Deferred 처리

하위 축의 일부가 deferred라도
확정 가능한 다른 축을 숨기지 않는다.

예:

```text
Structural = favorable
Personality = deferred
Marriage timing = confirmed
```

가능.

---

# 29. partial result 허용

하나의 sub-engine이 근거 부족이어도:

```text
FinalCompatibilityResult
```

자체를 전부 deferred로 만들지 않는다.

---

# 30. Free/paid visibility와 계산 분리

C5는 계산 결과를 만든다.

어떤 결과를 무료/유료로 보여줄지는
후속 renderer/product layer 책임이다.

---

# 31. 고객 명리 용어는 아직 노출하지 않는다

Final internal result에는 canonical ID가 존재할 수 있으나
customer-facing text는 C6에서 처리한다.

---

# 32. 현재 관계 상태 추정 금지

Final assembly가:

```text
married
dating
single
```

을 사주로 추정하지 않는다.

---

# 33. Relationship status input이 있는 경우

향후 renderer가 사용할 수 있도록
명시적 user context는 별도 보존 가능하다.

하지만 C5 판단 결과와 혼합하지 않는다.

---

# 34. Current / Future 분리

현재 시점 effect와
향후 timing window를 구분한다.

예:

```text
currentRelationshipState
futureRelationshipWindows[]
```

---

# 35. 과거 window

과거에 해당하는 confirmed timing fact도
history로 보존 가능하다.

현재/미래와 같은 배열에 넣더라도
temporal relation이 식별 가능해야 한다.

---

# 36. Day scope

지원되지 않는 Day projection 때문에
전체 Final Assembly를 deferred하지 않는다.

지원된 범위만 조립한다.

---

# 37. FinalCompatibilityResult 최소 계약

개념적으로:

```text
FinalCompatibilityResult {
  pairId

  structural
  personality
  lifecycle

  strengths
  risks

  current
  futureWindows

  provenance
}
```

실제 타입은 repository convention을 따른다.

---

# 38. Final verdict 단일 숫자 금지

최종 고객용 궁합에서도
향후 숫자 점수를 쓰지 않는 것이 현재 기본 계약이다.

C5에서는 절대 score를 추가하지 않는다.

---

# 39. Final headline 준비

C6가 사용할 수 있도록
언어 독립적인 headline semantic을 만들 수 있다.

예:

```text
strong_support_with_clear_risks
supportive_but_personality_friction
difficult_baseline_with_relief
mixed_strong_effects
```

단 반드시 기존 C2/C3/C4 결과의 조합이어야 한다.

---

# 40. headline semantic을 너무 많이 만들지 않는다

이번 C5에서 모든 조합의 문장 template을 설계하지 않는다.

목표는 renderer가 읽을 수 있는 최소 semantic grouping이다.

---

# 41. Customer Assertion Policy 유지

확정된 결과는:

```text
confirmed
```

로 보존한다.

민감한 결과라는 이유로 certainty를 내리지 않는다.

---

# 42. 특히 breakdown risk

```text
relationship_breakdown_risk = confirmed
```

이면 C5에서도 confirmed 그대로 유지한다.

C5가:

```text
relationship caution
```

으로 약화시키지 않는다.

---

# 43. marriage favorable / caution

둘 중 어느 것도:

```text
marriage opportunity
```

에 덮어쓰지 않는다.

세 축을 모두 보존한다.

---

# 44. Structural direction

A→B / B→A는
최종 결과에서도 반드시 사용자별로 조회 가능해야 한다.

---

# 45. C3 direction

성격 interaction도
방향성이 있는 fact는 그대로 보존한다.

---

# 46. C4 individual vs pair timing

다음을 구분한다.

```text
A-only window
B-only window
mutual window
```

---

# 47. mutual window

두 사람에게 실제 기간 중첩이 확인될 때만
mutual로 표시한다.

---

# 48. 날짜 invention 금지

기존 TimingFact의 Gregorian projection만 사용한다.

```text
fake Gregorian date = 0
```

---

# 49. 새로운 source research 금지

C5 중 새로운 생활 사례가 보이더라도
새 명리 규칙으로 구현하지 않는다.

필요하면:

```text
COMPATIBILITY_C5_POLICY_DECISION_REQUIRED
```

로 중단한다.

---

# 50. 신규 코드 위치

권장:

```text
src/lib/compatibility/final/
```

또는 현재 repository 구조상 적절한 기존 compatibility 하위 모듈.

---

# 51. Public entry point

최종적으로 두 BirthInput을 받아:

```text
readBirthCompatibility(...)
```

또는 현재 public API에서

```text
C1
→ C2
→ C3
→ C4
→ C5
```

까지 한 번에 반환할 수 있어야 한다.

---

# 52. 기존 Compatibility API가 있다면 재사용

새 별도 parallel entry point를 만들지 않는다.

---

# 53. 신규 verifier

권장:

```text
scripts/verify-compatibility-final-assembly-c5.mjs
```

---

# 54. 필수 검증 — axis preservation

각 fixture에서:

```text
Structural result preserved
Personality result preserved
Lifecycle result preserved
```

확인.

---

# 55. mixed preservation

최소 fixture:

```text
Structural favorable
+
Personality friction
+
Future breakdown risk
```

Expected:

```text
세 결과 모두 보존
```

---

# 56. asymmetric preservation

최소:

```text
A→B favorable
B→A unfavorable
```

Final result에서 그대로 확인.

---

# 57. timing preservation

최소:

```text
marriage opportunity
marriage caution
breakdown risk
```

의 scope/provenance/calendar projection 보존 확인.

---

# 58. duplicate check

Expected:

```text
duplicate Final IDs = 0
duplicate fact IDs = 0
```

---

# 59. provenance check

Expected:

```text
orphan provenance = 0
```

---

# 60. mutation check

Expected:

```text
C1 mutation = 0
C2 mutation = 0
C3 mutation = 0
C4 mutation = 0

Judgment mutation = 0
Personality mutation = 0
```

---

# 61. Existing regression

반드시:

```text
Compatibility C1
Compatibility C2
Compatibility C3
Compatibility C4

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

# 62. source fixtures

기존 C1~C4 source fixture를 재사용한다.

새로운 source expected value를 만들지 않는다.

---

# 63. 결과 파일

생성:

```text
src/docs/codex/compatibility-05-final-assembly-result.md
```

---

# 64. 필수 결과 보고

```text
Final compatibility fixtures:

Structural preserved:
Personality preserved:
Lifecycle preserved:

A→B preserved:
B→A preserved:

Strength facts:
Risk facts:

Current facts:
Future windows:

Marriage opportunity:
Marriage favorable:
Marriage caution:

Relationship strain:
Relationship relief:
Breakdown risk:

Mixed cases preserved:
Asymmetric cases preserved:

Duplicate IDs:
Orphan provenance:
Fake dates:
Mutations:
```

---

# 65. 성공 판정

다음을 모두 만족하면:

```text
COMPATIBILITY_FINAL_ASSEMBLY_READY
```

조건:

```text
[ ] C2/C3/C4 의미 변경 0
[ ] Structural / Personality / Lifecycle 독립 보존
[ ] A→B / B→A 보존
[ ] Strength / Risk 동시 보존
[ ] Current / Future 분리
[ ] Timing provenance 보존

[ ] numeric score 0
[ ] generic averaging 0
[ ] confirmed result certainty downgrade 0

[ ] duplicate ID 0
[ ] orphan provenance 0
[ ] fake date 0
[ ] upstream mutation 0

[ ] regression PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 66. 정책 질문 발생 시

C5는 새 명리 판단 단계가 아니다.

새로운 명리 판단이 필요하다고 판단되면
임의 구현하지 말고:

```text
COMPATIBILITY_C5_POLICY_DECISION_REQUIRED
```

로 중단한다.

---

# 67. 다음 단계

C5 성공 후:

```text
Compatibility-06
Customer Result Architecture & Renderer
```

로 이동한다.

C6에서는 처음으로:

```text
고객에게 무엇을
어떤 순서로
어느 정도 강도로
어떤 생활 언어로 보여줄지
```

를 설계한다.

내부 명리 용어:

```text
용신
상신
병
구응
격
대운
세운
월운
일진
```

은 고객 결과에 직접 노출하지 않는다.