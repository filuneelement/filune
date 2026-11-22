# FILUNE Compatibility-03
## Resource Dominance Policy Fix

현재 상태:

```text
PERSONALITY_PROMINENCE_POLICY_GAP
```

이번 작업에서는 generic `TenGodProminence`의
전체 4단계 판정 체계를 새로 만들지 않는다.

C3가 실제로 필요로 하는:

```text
ResourceDominanceFact
```

만 확정적으로 계산한다.

---

# ALLOWED SOURCES

```text
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
src/docs/rules/master/16-compatibility-spec.md

현재 Judgment public facts
현재 Personality public facts

C00-03 source fixture
Compatibility-03 현재 결과
```

옛 revision이나 과거 분석 문서에서
새 prominence 기준을 가져오지 않는다.

---

# 1. 이번 결정의 핵심

다음 generic grade를 새로 완성하지 않는다.

```text
low
present
prominent
very_prominent
```

기존 `resolveProminence()`의 다른 TenGod 결과가
`deferred / no_grade_criteria`인 것은 이번 작업에서 고치지 않는다.

대신 C3 전용이 아니라 재사용 가능한 qualitative fact:

```text
ResourceDominanceFact
```

를 추가한다.

---

# 2. ResourceDominanceFact

개념적 상태:

```text
confirmed
not_confirmed
deferred
```

숫자 strength는 두지 않는다.

최소 provenance:

```text
sourcePerson
dayMaster
evidencePath
sourceFactIds
branchPositions
stemFactIds
formationFactIds
certainty
```

실제 naming은 repository convention에 맞춘다.

---

# 3. Resource family

정인과 편인을 하나의:

```text
RESOURCE
```

family로 묶어 dominance를 판정한다.

정인/편인 identity 자체는 삭제하지 않는다.

---

# 4. Rule RD-01 — Branch-layer Resource Dominance

원국의 **사용 가능한 지지 본기 TenGod family**를 본다.

Resource가 사용 가능한 지지 본기 자리의
**엄격한 과반**을 차지하면:

```text
resourceDominance = confirmed
evidencePath = branch_layer_dominant
```

예:

```text
4개 중 4개 Resource → confirmed
4개 중 3개 Resource → confirmed
3개 중 3개 Resource → confirmed
```

---

# 5. 과반은 점수제가 아니다

이 기준은:

```text
Resource +1
다른 십성 -1
```

같은 scoring이 아니다.

지지층 자체가 어느 TenGod family에 의해
지배되는지를 판정하는 categorical condition이다.

금지:

```text
resourceScore
weight
percentage score
```

---

# 6. 2/4는 RD-01 dominance가 아니다

예:

```text
Resource
Resource
Wealth
Officer
```

이면 RD-01만으로:

```text
resourceDominance = confirmed
```

을 만들지 않는다.

다른 독립 reinforcement path를 확인한다.

---

# 7. Rule RD-02 — Month Resource + Independent Reinforcement

월지 본기가 Resource이고,

다음 중 최소 하나의 **독립적인 실제 보강 경로**가 있으면:

```text
resourceDominance = confirmed
evidencePath = month_resource_reinforced
```

허용되는 reinforcement:

```text
A. 다른 natal branch 본기가 Resource

B. natal heavenly stem의 Resource가
   실제 통근하고
   natal runtime에서 stopped가 아님

C. 현행 Branch Master에서 유효한 국/형성이
   Resource element를 실제 강화
```

---

# 8. 월지 단독은 dominance로 올리지 않는다

월지는 타고난 본성을 강하게 나타내지만:

```text
month branch Resource only
```

라는 이유만으로 이번 dominance Fact를
자동 confirmed하지 않는다.

이는 Resource 성향의 중요한 근거로 보존하되
`dominance`에는 독립 reinforcement를 요구한다.

---

# 9. 지장간 중기·여기 단독 금지

다음만으로 dominance 확정 금지:

```text
중기에 Resource
여기에 Resource
hidden stem 하나 존재
```

지장간 존재와 구조적 우세를 구분한다.

---

# 10. Rooted Resource Stem

RD-02의 천간 보강으로 인정하려면:

```text
Resource heavenly stem exists
+
actual root confirmed
+
natal runtime != stopped
```

이어야 한다.

단순 천간 출현만으로 reinforcement를 만들지 않는다.

---

# 11. reduced 상태

natal runtime이 `reduced`이지만
root와 존재가 유지되는 경우에는
reinforcement evidence 자체는 보존한다.

다만 실제 dominance confirmation에 충분한지는
현재 Judgment의 canonical actual function을 따른다.

Codex가 새 threshold를 만들지 않는다.

---

# 12. stopped 상태

Resource stem이 natal combine 등으로:

```text
stopped
```

이면 RD-02의 active reinforcement로 사용하지 않는다.

Role/history는 그대로 보존한다.

---

# 13. Formation

Formation reinforcement는
현재 `03-branch-relations-master.md`에 이미 확정된 것만 사용한다.

다시 연구하지 않는다.

금지:

```text
왕지 없는 두 글자 → 반합국
부분 방합
六合 → element strengthening
```

---

# 14. Unknown Hour

시주 미상인 경우
알려진 지지만으로 dominance를 과잉 확정하지 않는다.

원칙:

```text
missing hour가 어떤 TenGod family여도
RD-01 결론이 뒤집히지 않을 때
→ confirmed 가능
```

예:

```text
known 3 branches 모두 Resource
→ unknown hour가 non-Resource여도 3/4
→ confirmed
```

반면:

```text
known 3 branches 중 Resource 2
→ unknown hour가 non-Resource이면 2/4
→ RD-01 dominance 확정 불가
```

이 경우 다른 RD-02 evidence가 없다면:

```text
deferred
```

---

# 15. C00-03 여성

원자료 chart:

```text
戌 戌 未 戌
```

일간 기준 지지 본기 Resource family가
전 지지층을 지배한다.

Expected:

```text
resourceDominance = confirmed
evidencePath = branch_layer_dominant
```

---

# 16. C00-03 남성

원자료 chart:

```text
寅 子 寅 寅
```

일간 기준:

```text
寅 = Resource
子 = non-Resource
寅 = Resource
寅 = Resource
```

Expected:

```text
resourceDominance = confirmed
evidencePath = branch_layer_dominant
```

---

# 17. Resource Dominance → Output Suppression

이미 사용자 승인된 규칙:

```text
Resource Dominance
↓
Output Suppression
↓
Expression Constraint
```

재질문하지 않는다.

따라서:

```text
resourceDominance = confirmed
```

이면:

```text
outputSuppression = confirmed
expressionConstraint = confirmed
```

을 생성한다.

---

# 18. 결과 약화 금지

확정된 경우:

```text
expression may be constrained
possibly restrained
```

로 낮추지 않는다.

내부 상태:

```text
expressionConstraint = confirmed
```

이다.

---

# 19. Natal history 유지

ResourceDominance는 Natal 구조 Fact다.

운에서 인성이 약해져도:

```text
Natal ResourceDominance 삭제
```

금지.

---

# 20. Current Personality

현재 운에서는 Natal history와 별도로
현재 작동을 계산한다.

이미 승인:

```text
Resource weakened
+
Output strengthened
↓
Current Expression Relief
```

---

# 21. 실제 운 작용 필요

다음만으로 current relief 금지:

```text
운에 식상 글자 등장
운에 재성 등장
```

기존 Judgment에서 실제:

```text
operating
weakened
strengthened
root-supported
stopped
```

등의 작용이 확인되어야 한다.

---

# 22. 인성 제압 + 식상 활성

현재 scope에서:

```text
Resource actual function weakened
+
Output actual function strengthened/activated
```

가 확인되면:

```text
currentExpressionRelief = confirmed
```

이다.

---

# 23. C00-03 pair interaction

양쪽 모두:

```text
resourceDominance = confirmed
```

이면 각각:

```text
outputSuppression = confirmed
expressionConstraint = confirmed
```

이므로 pair 결과:

```text
mutualExpressionRestraint = confirmed
communicationFriction = confirmed
```

---

# 24. 이것은 possibility가 아니다

내부 결과:

```text
communicationFriction = confirmed
```

으로 판정한다.

고객 renderer에서 자연어 강도를 조절하는 문제와
엔진 certainty를 혼동하지 않는다.

---

# 25. 운에서 식상이 살아나는 경우

C00-03 원자료처럼
기본적으로 무식상/식상 약 구조라도
운에서 식상이 실제 작동하면:

```text
currentExpressionRelief
```

를 생성할 수 있다.

성격적으로:

```text
표현
유머
베푸는 성향
활동성
```

등의 식상 기능이 현재 발현되는 근거로 연결한다.

실제 Personality knowledge에 존재하는 trait만 사용한다.

---

# 26. 기본 성향과 현재 발현 공존

가능:

```text
Natal:
expressionConstraint = confirmed

Current:
expressionRelief = confirmed
```

이를 모순으로 처리하지 않는다.

의미:

```text
기본적으로 표현을 안에 쌓는 성향
BUT
현재 시기에는 표현 기능이 살아남
```

---

# 27. generic TenGodProminence와 분리

이번 작업 후에도:

```text
resolveProminence(otherTenGod)
```

가 `deferred/no_grade_criteria`일 수 있다.

그것 때문에 C3 완료를 막지 않는다.

---

# 28. Master 11 업데이트

현재 확정된 Personality rule로 다음을 기록한다.

```text
ResourceDominanceFact

RD-01 branch-layer dominance
RD-02 month Resource + independent reinforcement

Resource Dominance
→ Output Suppression
→ Expression Constraint

Current Resource weakening
+
Current Output strengthening
→ Current Expression Relief
```

---

# 29. Master 12 업데이트

generic TenGodProminence의 전체 grade 기준을
이번에 새로 만들지 않는다.

대신 ResourceDominanceFact schema와 provenance만 추가한다.

---

# 30. Master 16 업데이트

Compatibility:

```text
A ResourceDominance confirmed
+
B ResourceDominance confirmed
↓
Mutual Expression Restraint
↓
Communication Friction
```

을 기록한다.

---

# 31. 신규 verifier

권장:

```text
scripts/verify-resource-dominance-personality-c3.mjs
```

---

# 32. 최소 fixture

반드시:

```text
C00-03 female 4/4 branch Resource
C00-03 male 3/4 branch Resource

2/4 branch Resource → RD-01 not confirmed

month Resource + rooted active Resource stem
→ RD-02 confirmed

month Resource only
→ dominance not confirmed

unknown hour 3/3 Resource
→ confirmed

unknown hour 2/3 Resource
→ RD-01 deferred/not confirmed
```

---

# 33. Current-expression fixture

반드시:

```text
Natal ResourceDominance confirmed
Current Resource weakened
Current Output strengthened
```

Expected:

```text
currentExpressionRelief = confirmed
```

---

# 34. Mutation 금지

Expected:

```text
Judgment mutation = 0
RootState mutation = 0
C1 semantic changes = 0
C2 semantic changes = 0
```

---

# 35. Regression

반드시:

```text
Compatibility C1
Compatibility C2
Compatibility C3

Personality Engine
KO/JA/EN Personality Renderer

Judgment 35/35

Money
Health
Relationship
Event Timing

npx tsc -b
npm run build
git diff --check
```

기대값 임의 변경 금지.

---

# 36. 성공

다음을 만족하면:

```text
COMPATIBILITY_PERSONALITY_INTERACTION_READY
```

---

# 37. 실패/새 정책 결정

이번에 승인한 ResourceDominance 기준 외의
새 Personality pairing rule이 필요하면:

```text
COMPATIBILITY_C3_POLICY_DECISION_REQUIRED
```

로 중단한다.

generic TenGodProminence 전체 등급이 미완성이라는 이유만으로
C3를 다시 중단하지 않는다.