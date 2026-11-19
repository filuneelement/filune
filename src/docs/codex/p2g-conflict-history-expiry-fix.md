# FILUNE Codex P2-G Fix
## PersonalityConflict 발생범위 · 만료 이력 보완

P2-G 최종 통합감사에서 남은 FAIL은 1건이다.

현재 상태:

```text
P2-A ~ P2-F PASS
Judgment regression 35/35 PASS
npx tsc -b PASS
npm run build PASS

P2-G 17/18 PASS

FAIL 1
PARTIAL 0
```

문제는 **현재 Personality 결과가 아니라 PersonalityConflict History의 lifecycle 기록**이다.

---

# 1. 재현된 문제

대운에서 발생한 PersonalityFact와
월운에서 발생한 PersonalityFact가 서로 충돌하는 경우:

```text
Daewoon Fact
+
Month Fact
→ PersonalityConflict
```

현재 구현은 Conflict의 발생 범위를:

```text
originScope = daewoon
```

으로 기록하고 있다.

그러나 실제 충돌은 월운 Fact가 들어와
두 Fact가 처음 동시에 유효해진 시점부터 발생한다.

Expected:

```text
originScope = month
```

이어야 한다.

---

# 2. 현재 상태 계산은 정상

P2-G 감사에서 확인된 다음 동작은 유지한다.

```text
월운 종료
→ 현재 PersonalityConflict 해제
```

즉 Current Personality 계산 자체는 정상이다.

이번 수정에서 이 정상 동작을 변경하지 않는다.

---

# 3. 문제는 History lifecycle

현재 문제:

```text
현재 conflict = 해제됨

하지만
conflict history = 아직 effective로 남음
```

이는 Conflict occurrence가 대운 범위로 잘못 기록되기 때문이다.

이번 작업에서는 이 history lifecycle만 수정한다.

---

# 4. 핵심 원칙

PersonalityConflict의 발생 범위는
**충돌에 참여한 Fact 중 가장 오래 지속되는 Fact의 범위가 아니다.**

반드시:

```text
모든 conflict participant가
동시에 effective가 된 범위
```

를 사용한다.

---

# 5. Conflict activation scope

예:

```text
Daewoon Fact = effective
Month Fact = effective
```

두 Fact가 처음 공존한 것은 Month scope이다.

Expected:

```text
Conflict activationScope = month
originScope = month
```

대운 Fact가 먼저 존재했다는 이유로:

```text
originScope = daewoon
```

으로 기록하면 안 된다.

---

# 6. Conflict effective period

Conflict의 유효기간은
참여 Fact들의 현재 유효기간 교집합으로 계산한다.

개념적으로:

```text
conflict.start
=
max(participant.start)

conflict.end
=
min(participant.end)
```

숫자 score가 아니라 기간 교집합 계산이다.

---

# 7. 예시

입력:

```text
Daewoon Fact
2025-01-01 ~ 2035-01-01

Month Fact
2027-05-05 ~ 2027-06-05
```

Expected Conflict:

```text
originScope = month

period.start = 2027-05-05
period.end   = 2027-06-05
```

금지:

```text
period = 2025 ~ 2035
```

---

# 8. Natal Fact 참여

Natal PersonalityFact는 기본 배경이므로
기간 제한이 없는 baseline으로 취급 가능하다.

예:

```text
Natal Fact
+
Month Fact
```

충돌이면 Conflict period는 Month Fact의 유효기간이 된다.

Expected:

```text
originScope = month
```

---

# 9. Daewoon + Sewoon

```text
Daewoon Fact
+
Sewoon Fact
```

충돌이 세운에서 처음 발생하면:

```text
originScope = sewoon
```

---

# 10. Sewoon + Month

```text
Sewoon Fact
+
Month Fact
```

Expected:

```text
originScope = month
```

---

# 11. Month + Day

```text
Month Fact
+
Day Fact
```

Expected:

```text
originScope = day
```

Conflict period도 해당 일진의 유효기간까지만이다.

---

# 12. 발생 scope 결정 원칙

Scope depth를 단순한 길흉 priority로 사용하지 않는다.

다만 Conflict 발생 시점 계산에서는:

```text
참여 Fact들이
처음 모두 동시에 effective가 되는 scope
```

를 activation scope로 사용한다.

즉 이는:

```text
scope strength ranking
```

이 아니라:

```text
temporal activation boundary
```

다.

---

# 13. Conflict identity와 occurrence 분리

같은 두 PersonalityFact가
여러 시기에 반복해서 충돌할 수 있다.

따라서 가능하면:

```text
Conflict definition
```

과:

```text
Conflict occurrence
```

를 구분한다.

예:

```text
Conflict key:
Fact-A vs Fact-B

Occurrence 1:
2027-05 month

Occurrence 2:
2028-03 month
```

둘은 같은 논리적 충돌 유형일 수 있지만
서로 다른 occurrence다.

---

# 14. 비연속 재발생

월운 충돌이 끝난 뒤
몇 달 후 같은 유형의 충돌이 다시 발생하면:

```text
old occurrence expired
+
new occurrence created
```

이어야 한다.

과거 occurrence를 다시 active로 살리지 않는다.

---

# 15. 동일 활성기간 하위 scope

월운에서 Conflict가 발생했고
그 월 안에서 일진을 계산하는 경우:

```text
Month Conflict
→ Day scope inheritance
```

Expected:

```text
same conflict occurrence ID
inherited = true
currentlyEffective = true
```

새 Conflict event 생성 금지.

---

# 16. 월 종료

Month Fact가 종료되면:

```text
Conflict occurrence
currentlyEffective = false
expired = true
```

대운 Fact가 계속 살아 있어도 Conflict는 종료된다.

---

# 17. 참여 Fact 하나라도 inactive면 종료

Conflict participant 중 하나가:

```text
inactive
expired
not currently effective
```

가 되면
그 Conflict occurrence도 현재 effective일 수 없다.

---

# 18. Conflict History 보존

만료 후에도:

```text
PersonalityConflictHistory
```

에서 과거 발생 사실은 유지한다.

삭제하지 않는다.

---

# 19. Current와 History 분리

반드시:

```text
ConflictHistory
≠
CurrentConflict
```

Current result에는:

```text
currentlyEffective = true
```

인 Conflict만 활성 상태로 포함한다.

---

# 20. History가 현재 Conflict를 부활시키면 안 됨

금지:

```text
과거 conflict history 존재
→ current conflict active
```

현재 Conflict는 현재 effective Fact들로 다시 결정한다.

---

# 21. previousEffectHistory 계약 유지

P2-F의 기존:

```text
previousEffectHistory
```

계약을 유지한다.

과거 Conflict occurrence가 전달되면:

```text
history preserved
```

하되 현재 period와 맞지 않으면:

```text
currentlyEffective = false
expired = true
```

여야 한다.

---

# 22. independent reading consistency

같은:

```text
chart
evaluation date
Judgment snapshots
```

을 다음 두 방식으로 계산한다.

```text
A. previous history 있음
B. previous history 없음
```

Expected:

```text
CurrentPersonalityResult 동일
CurrentConflict 동일
```

History 목록만 달라질 수 있다.

기존 P2-G 통과 계약을 유지한다.

---

# 23. Conflict origin 계산에서 participant origin을 복사하지 않는다

금지:

```text
first participant.originScope
→ conflict.originScope
```

또는:

```text
longest participant scope
→ conflict.originScope
```

Conflict 자체의 activation scope를 계산해야 한다.

---

# 24. 권장 계산

개념적으로:

```text
activeParticipants
↓
effective-period intersection
↓
intersection empty?
    yes → no current conflict
    no  → conflict occurrence
↓
activation start = intersection start
activation end   = intersection end
↓
activationScope = scope where final required participant becomes effective
```

기존 타입/함수 구조에 맞게 구현한다.

---

# 25. period overlap 없음

두 Fact가 의미상 상반돼도
유효기간이 겹치지 않으면:

```text
CurrentConflict = none
```

이다.

과거 각각의 Fact 존재만으로 Conflict를 만들지 않는다.

---

# 26. role modifier conflict에도 동일 원칙

Conflict participant가:

```text
Natal PersonalityFact
Current StructuralRoleModifier
Temporary Luck PersonalityFact
```

등 혼합인 경우에도
실제 동시에 effective인 기간만 Conflict가 존재한다.

---

# 27. source conflict와 혼동 금지

이번 `PersonalityConflict`는
성격 Fact 간의 발현 충돌이다.

Knowledge의:

```text
SOURCE_CONFLICT
```

와 별개다.

戊午 provenance conflict 로직은 변경하지 않는다.

---

# 28. Prominence 변경 금지

이번 수정과:

```text
TenGodProminence
```

는 무관하다.

계속:

```text
deferred
```

유지.

---

# 29. Personality Knowledge 변경 금지

다음 파일 수정 금지:

```text
dayStemProfiles
tenGodProfiles
dayPillarProfiles
positionRules
```

---

# 30. Judgment 변경 금지

다음 수정 금지:

```text
src/lib/judgment/
```

이번 문제는 Personality History lifecycle 문제다.

---

# 31. P2-F 현재 상태 로직 변경 최소화

P2-F의 CurrentConflict 해제는 이미 정상이다.

따라서 현재 계산 로직을 불필요하게 재작성하지 않는다.

주 수정 대상은:

```text
Conflict occurrence creation
originScope
originPeriod
history state
expiry
```

이다.

---

# 32. 신규 Regression A
## Daewoon + Month

입력:

```text
Daewoon Fact A
Month Fact B

A vs B conflict
```

Expected:

```text
originScope = month
period = month effective period
```

BLOCKING.

---

# 33. Regression B
## Month expiry

월운 종료 후:

```text
Daewoon Fact A remains effective
Month Fact B expired
```

Expected:

```text
current conflict = none

history:
currentlyEffective = false
expired = true
```

BLOCKING.

---

# 34. Regression C
## Day inheritance

Month에서 Conflict 발생.

그 Month 안의 Day scope 계산.

Expected:

```text
same conflict occurrence ID
inherited = true
duplicate occurrence = 0
```

---

# 35. Regression D
## Day-triggered conflict

Month Fact A와
Day Fact B가 충돌.

Expected:

```text
originScope = day
period = day period
```

---

# 36. Regression E
## Sewoon + Month

Expected:

```text
originScope = month
```

---

# 37. Regression F
## Natal + Month

Expected:

```text
originScope = month
period = month period
```

---

# 38. Regression G
## non-overlap

상반된 Fact 두 개의 기간이 겹치지 않음.

Expected:

```text
current conflict = 0
```

---

# 39. Regression H
## reactivation

첫 월운:

```text
Conflict occurrence A
```

종료 후:

```text
A expired
```

다른 월운에서 동일 논리적 conflict 재발생.

Expected:

```text
new occurrence B
B.id != A.id
A remains expired
```

---

# 40. Regression I
## previous history

이전 expired conflict history를 전달.

Expected:

```text
old occurrence remains expired
current result unaffected
```

---

# 41. Regression J
## independent current state

history 있음/없음 두 계산에서:

```text
currentFacts
currentRoleModifiers
currentConflicts
```

동일.

---

# 42. Stable ID

동일 occurrence를
동일 입력으로 다시 계산하면 동일 ID.

하지만 비연속 재발생은 새로운 occurrence ID를 가져야 한다.

---

# 43. Stable ordering

ConflictHistory 정렬은 deterministic하게 유지.

의미 강도 score는 사용하지 않는다.

---

# 44. 기존 P2-F 회귀 유지

P2-F A-R 전체 PASS 유지.

---

# 45. 기존 P2-G 회귀

기존 17개 PASS를 모두 유지하고
실패한 1건을 PASS로 만든다.

Expected:

```text
P2-G = 18/18
```

---

# 46. Personality 전체 회귀

반드시:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS
P2-F PASS
P2-G PASS
```

---

# 47. Judgment 회귀

```text
35/35 PASS
```

유지.

기존 fixture 수정 금지.

---

# 48. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 49. Numeric scoring 금지

이번 scope 계산을 위해:

```text
scopeWeight
conflictWeight
durationScore
```

등을 만들지 않는다.

기간 교집합만 계산한다.

---

# 50. 결과 파일

다음에 기록:

```text
src/docs/codex/p2g-conflict-history-expiry-fix-result.md
```

---

# 51. 최종 보고

## A. 수정 결과

```text
Conflict originScope:
Conflict originPeriod:
Conflict expiry:
Conflict inheritance:
Conflict reactivation:
```

## B. 회귀

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:
P2-G:

Judgment:
tsc:
build:
```

## C. 상태

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
```

## D. Prominence

```text
Prominence changed:
numeric boundary added:
```

Expected:

```text
no
no
```

---

# 52. 종료 조건

다음이면:

```text
READY_FOR_PERSONALITY_RENDERER
```

로 판정한다.

```text
[ ] P2-G 18/18
[ ] Daewoon+Month conflict originScope = month
[ ] Month expiry 시 history expired
[ ] current conflict 정상 해제
[ ] child scope 중복 occurrence 없음
[ ] 재발생 시 새 occurrence
[ ] history/current 분리
[ ] independent current state 동일
[ ] P2-A~F PASS
[ ] Judgment 35/35 PASS
[ ] tsc/build PASS
[ ] Prominence deferred 유지
[ ] numeric scoring 없음
```

---

# 53. 완료 후

이 수정 후에는 P2-G 전체 감사를 다시 처음부터 새로 작성하지 않는다.

기존:

```text
scripts/verify-personality-engine-integration-p2g.mjs
```

를 재실행하여:

```text
18/18 PASS
```

와:

```text
READY_FOR_PERSONALITY_RENDERER
```

를 확인한다.

그 결과가 나오면 Personality Engine의
Knowledge → Natal → Role → Current → History 파이프라인을 종료한다.