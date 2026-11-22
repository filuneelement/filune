# FILUNE Compatibility-04B
## Spouse Event Disruption Breakdown Policy

현재 상태:

```text
COMPATIBILITY_C4A_POLICY_DECISION_REQUIRED
```

C4A 감사 결과:

```text
Gap class = POLICY
```

확인된 사실:

```text
丁酉 source case

relationship_change = confirmed

Natal spouse relationship axis = 존재
Natal spouse significator roles = active / operating

Current spouse-palace clash = confirmed

BUT

현행 C4는:
Natal vulnerability
+
Current spouse-function damage

경로만 breakdown risk로 인정하여
丁酉 사례를 deferred 처리함.
```

이번 단계에서 C4의 breakdown policy를 보완한다.

---

# 1. 사용자 정책 결정

C4의 relationship breakdown risk에는
서로 다른 **두 개의 독립적인 source-supported 경로**를 허용한다.

```text
PATH A
Baseline Vulnerability Aggravation

PATH B
Spouse Event + Palace Disruption
```

둘 중 하나가 완전히 confirmed되면
relationship_breakdown_risk를 생성할 수 있다.

---

# 2. Path A 유지

기존 C4 규칙:

```text
Natal relationship vulnerability
↓
Current harmful activation
↓
Spouse / relationship function damage
↓
relationship_breakdown_risk
```

을 그대로 유지한다.

이미 통과한:

```text
乙丑 + 甲辰 복합 이혼 사례
```

를 변경하지 않는다.

---

# 3. Path B 신규 승인

새 source-supported 경로:

```text
Active spouse relationship axis
+
Current spouse-significator event activation
+
Effective spouse-palace disruption
↓
relationship_breakdown_risk
```

이것을:

```text
SPOUSE_EVENT_DISRUPTION_PATH
```

또는 repository convention에 맞는 동등 이름으로 구현한다.

---

# 4. Path B의 의미

이 경로는:

```text
원래 배우자 연이 반드시 나쁜 사람
```

만을 대상으로 하지 않는다.

원국 관계 축이 정상적으로 살아 있어도
특정 시기에 배우자 관련 사건성이 활성화되고
배우자궁에 직접적인 충격이 동시에 들어오면

```text
관계가 크게 흔들리는 시기
```

가 될 수 있다는 규칙이다.

---

# 5. 丁酉 source case

남성 원국:

```text
丙 ... 癸 ... 甲 ... 丙
辰 ... 卯 ... 午 ... 辰
        ↑
      배우자궁
```

현재 scope:

```text
丁酉
```

여기서:

```text
丁
→ 남성에게 財 계열
→ 배우자 관련 current actor

酉
→ natal spouse palace 卯와 충
```

이 동시에 존재한다.

Expected:

```text
spouseEventActivation = confirmed
spousePalaceDisruption = confirmed
relationshipChange = confirmed
relationshipBreakdownRisk = confirmed
```

---

# 6. Luck actor를 새 natal role로 만들지 않는다

기존 FILUNE Role contract 유지:

```text
운에서 들어온 丁
→ 새 natal SpouseRole 생성 금지
```

丁은:

```text
current spouse-significator actor
```

또는 현행 event actor 구조로 처리한다.

RoleHistory는 원국에서 유지한다.

---

# 7. spouse-significator mapping

기존 육친 계약을 재사용한다.

```text
남성:
財 → spouse-significator family

여성:
官殺 → spouse-significator family
```

새 육친 규칙을 만들지 않는다.

---

# 8. 단순 글자 출현은 부족

다음 shortcut 금지:

```text
남성 운에 財 등장
→ breakdown risk

여성 운에 官殺 등장
→ breakdown risk
```

배우자성 actor의 출현은
Path B의 한 조건일 뿐이다.

---

# 9. Current spouse event activation

현재 scope의 spouse-significator actor가
실제로 사용 가능한 상태여야 한다.

최소:

```text
not stopped
actual current effect exists
scope identity confirmed
```

현행 canonical runtime 상태를 따른다.

---

# 10. stopped actor

현재 spouse-significator actor가:

```text
stopped
```

이면 Path B의 event activation 조건을 충족하지 않는다.

---

# 11. spouse relationship axis

Natal에서 배우자 관련 축이 실제 존재하는지 확인한다.

사용 가능한 기존 근거:

```text
spouse significator RoleHistory
spouse relationship fact
spouse palace
```

현행 repository의 canonical fact를 사용한다.

새 role을 만들지 않는다.

---

# 12. 배우자궁

기존 육친/궁성 규칙:

```text
day branch = spouse palace
```

를 재사용한다.

---

# 13. spouse-palace disruption

현재 scope에서
운의 지지가 natal day branch와
유효한 `沖`을 형성하면:

```text
spousePalaceDisruption = confirmed
```

을 생성할 수 있다.

이 Fact는:

```text
relationshipChange
```

와 연결되지만 동일한 semantic은 아니다.

---

# 14. 沖 canonical rule

충 계산은 반드시:

```text
03-branch-relations-master.md
```

의 현재 FILUNE 규칙만 사용한다.

과거 source의 지지 관계 정의를 다시 가져오지 않는다.

---

# 15. 충 자체는 breakdown이 아니다

반드시 유지:

```text
spousePalaceDisruption only
→ relationshipBreakdownRisk = 0
```

즉:

```text
卯酉沖
→ 자동 이혼
```

금지.

---

# 16. 배우자성 actor만 있어도 breakdown 아님

```text
spouseEventActivation only
→ relationshipBreakdownRisk = 0
```

---

# 17. Path B 완성 조건

다음 세 축이 동일 current scope에서 모두 confirmed:

```text
A. active spouse relationship axis

B. current spouse-significator event activation

C. effective spouse-palace disruption
```

일 때:

```text
SPOUSE_EVENT_DISRUPTION_PATH = confirmed
relationship_breakdown_risk = confirmed
```

---

# 18. 같은 scope 원칙

예:

```text
spouse actor = year
spouse-palace clash = unrelated month
```

을 근거 없이 하나의 사건으로 합치지 않는다.

현행 scope inheritance 규칙에 따라
실제로 동시에 유효한 상태인지 확인한다.

---

# 19. 상위 scope carry

상위 scope의 effect가
현재 child scope에 실제 carry되어 있으면
현행 Master 08/09의 inheritance 계약에 따라 사용할 수 있다.

C4가 새 carry 규칙을 만들지 않는다.

---

# 20. 관계 상태 추정 금지

Path B confirmed라고 해서:

```text
현재 기혼
현재 연애 중
```

이라고 추정하지 않는다.

내부 결과:

```text
relationship_breakdown_risk
```

는 관계 상태 중립적이다.

---

# 21. 고객 표현은 후속 단계

향후 renderer에서는
실제 사용자 relationship status가 있다면:

```text
기혼
→ 부부관계가 크게 흔들리거나 별거·이혼 위험이 높아지는 시기

연애 중
→ 이별·관계 파탄 위험이 높아지는 시기

상태 미상
→ 중요한 관계가 크게 흔들리기 쉬운 시기
```

처럼 분기할 수 있다.

이번 단계에서는 renderer를 만들지 않는다.

---

# 22. 위험 결과 약화 금지

Path B가 confirmed이면:

```text
relationship_breakdown_risk = confirmed
```

으로 판정한다.

다음으로 낮추지 않는다.

```text
관계 변화 가능
조금 조심
어떤 영향
```

---

# 23. 그러나 확정 이혼은 아님

계속 구분:

```text
relationship_breakdown_risk = confirmed
≠
divorce guaranteed
```

---

# 24. Path A와 Path B 공존 가능

같은 scope에서:

```text
Path A confirmed
+
Path B confirmed
```

가능하다.

둘 중 하나를 지우지 않는다.

---

# 25. 둘 다 있는 경우

새 숫자 점수를 만들지 않는다.

결과:

```text
relationship_breakdown_risk = confirmed
breakdownPathIds = [A, B]
```

형태로 provenance를 보존한다.

향후 renderer에서는:

```text
여러 관계 악화 경로가 동시에 겹치는 강한 시기
```

로 표현할 수 있다.

---

# 26. raw path count scoring 금지

금지:

```text
Path 2개 = 위험도 2배
riskScore +20
```

---

# 27. 丁酉 targeted expected

Expected:

```text
relationshipChange = confirmed

spouseRelationshipAxis = confirmed
spouseEventActivation = confirmed
spousePalaceDisruption = confirmed

spouseEventDisruptionPath = confirmed

relationshipBreakdownRisk = confirmed
```

---

# 28. clash-only negative 유지

기존 targeted fixture:

```text
spouse-palace clash only
```

Expected:

```text
relationshipChange = confirmed
spousePalaceDisruption = confirmed

spouseEventActivation = not confirmed

relationshipBreakdownRisk = 0
```

---

# 29. spouse-actor-only negative 추가

Fixture:

```text
spouse-significator actor active
BUT
spouse-palace disruption 없음
```

Expected:

```text
relationshipBreakdownRisk = 0
```

---

# 30. inactive actor fixture

```text
spouse-significator actor exists
BUT stopped
+
spouse-palace clash
```

Expected:

```text
spouseEventActivation = not confirmed
relationshipBreakdownRisk = 0
```

---

# 31. baseline vulnerability-only negative

기존:

```text
Natal vulnerability only
```

Expected:

```text
relationshipBreakdownRisk = 0
```

유지.

---

# 32. Path A regression

기존:

```text
乙丑 + 甲辰 복합 이혼
```

Expected:

```text
Baseline Vulnerability Aggravation Path = confirmed
relationshipBreakdownRisk = confirmed
```

유지.

---

# 33. 결혼 source regressions

기존:

```text
戊戌 actual marriage
戊申 marriage opportunity + caution
```

변경:

```text
0
```

---

# 34. C1/C2/C3 변경 금지

Expected:

```text
Compatibility C1 = unchanged
Compatibility C2 = unchanged
Compatibility C3 = unchanged
```

---

# 35. 구현 위치

우선:

```text
src/lib/compatibility/
```

또는 현재 C4 relationship timing policy owner에서 구현한다.

Judgment에:

```text
divorce
breakdown
```

생활 결과를 추가하지 않는다.

---

# 36. Judgment 수정 최소화

이번 정책에 필요한 Fact가
이미 Judgment / canonical chart에 존재하면
그대로 읽는다.

새 structural computation을 Judgment에 넣지 않는다.

---

# 37. Master 16 업데이트

Breakdown Path를 두 개로 고정한다.

```text
BREAKDOWN-A
Baseline Vulnerability Aggravation

BREAKDOWN-B
Spouse Event + Palace Disruption
```

---

# 38. Master 15

Event Timing에는:

```text
BREAKDOWN-B confirmed
→ relationship_breakdown_risk evidence
```

mapping만 additive하게 기록한다.

---

# 39. targeted verifier

권장:

```text
scripts/verify-compatibility-spouse-event-disruption-c4b.mjs
```

---

# 40. targeted 검증

필수:

```text
丁酉 source case
→ PASS

clash only
→ no breakdown

spouse actor only
→ no breakdown

stopped spouse actor + clash
→ no breakdown

Path A source case
→ PASS

marriage cases
→ unchanged
```

---

# 41. C4 재실행

Targeted PASS 후
기존 C4 verifier를 그대로 재실행한다.

기대:

```text
COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY
```

---

# 42. Regression

최소:

```text
Compatibility C1
Compatibility C2
Compatibility C3
Compatibility C4

Judgment 35/35
Relationship Outcome
Event Timing Batch 1

npx tsc -b
npm run build
git diff --check
```

---

# 43. 결과 파일

생성:

```text
src/docs/codex/compatibility-04b-spouse-event-disruption-policy-result.md
```

---

# 44. 최종 판정

성공:

```text
READY_TO_RERUN_COMPATIBILITY_C4
```

그리고 C4 재실행까지 통과하면:

```text
COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY
```

새 정책 질문이 발생하면
이번에 승인한 BREAKDOWN-B를 다시 묻지 않는다.