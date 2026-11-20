# FILUNE Codex P4-G.1
## Health Outcome Reactivation Fix

P4-H Health Outcome Integration Audit에서 다음 blocker가 재현되었다.

```text
P4H_FIX_REQUIRED
classification = P4G_OUTCOME_BUG
```

## 1. 재현된 문제

기존 P1-Fix 계열 실제 경로에서:

```text
원국:
보호 경로가 존재하여 용신 제어의 harmful path가 현재 억제됨

운:
보호자 정지 또는 보호 경로 손상 발생

Judgment:
기존에 억제되던 용신 제어 경로가 현재 scope에서 다시 활성화됨
```

까지는 정상이다.

그러나 현재 Health adapter는:

```text
현재 scope의 활성 harmful path
→ structural_health_attention
```

으로 변환하지 못한다.

결과적으로:

```text
Judgment = active harmful path
Health Outcome = missing
```

불일치가 발생한다.

---

# 2. 이번 작업의 성격

이것은 새 Health 규칙 연구가 아니다.

새 판정 규칙을 추가하지 않는다.

고쳐야 할 것은 오직:

```text
이미 Judgment가 확정한 현재 harmful structural path
→ 기존 승인 Health OutcomeFact
```

연결이다.

---

# 3. 기준 문서

반드시 먼저 읽는다.

```text
src/docs/rules/master/14-outcome-semantic-spec.md

src/docs/codex/p4d-health-outcome-supplement-audit-result.md
src/docs/codex/p4g-health-outcome-batch1-result.md
src/docs/codex/p4h-health-outcome-integration-audit-result.md

src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
```

그리고 실제 구현:

```text
src/lib/outcome/
src/lib/judgment/
```

을 확인한다.

---

# 4. 가장 중요한 원칙

Health adapter가 과거 원국 상태만 보면 안 된다.

현재 Health Outcome은:

```text
RoleHistory
```

만이 아니라 실제 해당 scope의:

```text
CurrentFunction
Runtime
ActualStructuralFunction
현재 Role state
현재 harmful path
```

를 읽어야 한다.

---

# 5. 이번 버그의 핵심

다음 상태 전이가 있어야 한다.

```text
Natal:
harmful path suppressed
→ Health attention inactive

Luck scope:
protector stopped/damaged
→ harmful path becomes currently active
→ Health attention active
```

현재 마지막 단계가 빠져 있다.

---

# 6. 반대 전이도 유지

다음도 기존대로 동작해야 한다.

```text
harmful path active
→ protector restored / harmful source stopped
→ harmful path inactive
→ current Health attention inactive
```

---

# 7. 신규 Judgment 계산 금지

Health adapter에서 다음을 다시 계산하지 않는다.

```text
YongShen
SangShen
Byeong
GuEung
Control relation
Pattern
Root
Formation
Runtime
```

이미 Judgment snapshot에 있는 현재 결과를 읽는다.

---

# 8. 무엇을 source of truth로 쓸지 확인

현행 Judgment output에서
“현재 harmful path가 작동 중”임을 나타내는 실제 필드를 조사한다.

후보 예:

```text
ActualStructuralFunction
CurrentFunction
Role state
active Byeong path
LuckEffect
Relation/EffectFact current operation
```

문서 예시 이름을 그대로 가정하지 말고
실제 코드 타입을 확인한다.

---

# 9. 원국 이력과 현재 상태 분리

금지:

```text
Natal role was protected
→ forever no health attention
```

또는:

```text
Natal harmful path existed
→ forever health attention
```

현재 scope를 기준으로 다시 읽어야 한다.

---

# 10. RoleHistory 보존

보호자/상신이 원국에 있었다는 이력은 유지한다.

그러나 현재:

```text
stopped
inactive
```

이면 보호 기능이 현재 작동한다고 취급하지 않는다.

---

# 11. Protective Standby SangShen

보호 대기 상신과
실제 active operating protection을 구분한다.

Standby 자체를 항상 현재 보호 작동으로 읽지 않는다.

---

# 12. stopped protector

보호 기능 source가:

```text
stopped / inactive
```

이면 해당 보호 경로가 현재 harmful path를 차단하는 것으로 계산하지 않는다.

단 이 판정은 Judgment가 이미 끝낸다.

Health adapter는 그 결과를 읽기만 한다.

---

# 13. weakened / reduced protector

보호자가 reduced인 경우
Health adapter가 임의로:

```text
protection lost completely
```

라고 판정하지 않는다.

Judgment의 현재 최종 기능 상태를 따른다.

---

# 14. harmful path reactivation

Judgment에서 현재 harmful path가 operating/active로 확인되면
14 spec에서 승인된 조건에 따라:

```text
structural_health_attention
```

을 생성해야 한다.

---

# 15. certainty/state

재활성된 Health OutcomeFact의 certainty/state를
임의로 `confirmed`로 고정하지 않는다.

14 spec 및 공통 Outcome contract를 따른다.

---

# 16. scope

재활성화가 대운에서 발생했다면:

```text
scope = daewoon
```

세운이면:

```text
scope = sewoon
```

월운이면:

```text
scope = month
```

를 정확히 보존한다.

---

# 17. provenance

재활성 Health OutcomeFact에는
실제 현재 경로의 provenance가 연결돼야 한다.

가능한 근거:

```text
sourceJudgmentIds
sourceRoleIds
sourceRelationIds
sourceLuckEffectIds
```

현행 타입에서 실제 존재하는 항목을 사용한다.

---

# 18. 과거 억제 event와 현재 재활성 event 구분

과거에:

```text
protector active
```

였다는 history와

현재:

```text
protector inactive
harmful path active
```

상태를 구분한다.

History 때문에 current Health Outcome이 누락되면 안 된다.

---

# 19. Outcome ID

동일 current harmful path라면 deterministic stable ID를 사용한다.

재실행할 때 랜덤 새 ID 금지.

---

# 20. 중복 금지

동일 scope에서 같은 harmful path 때문에:

```text
structural_health_attention
```

이 두 번 생성되지 않아야 한다.

---

# 21. 기존 stopped rule 회귀

반대로 harmful source 자체가 stopped라면:

```text
current structural_health_attention = 0
```

기존 계약을 깨지 않는다.

---

# 22. ConditionalByeong 회귀

조건부 병이 실제 활성화되지 않았다면
Health attention을 생성하지 않는 기존 계약을 유지한다.

---

# 23. needed Killing 회귀

필요한 칠살을 Health harmful path로 잘못 읽지 않는다.

---

# 24. Fake relief 금지

재활성 후 다시 비활성화돼도:

```text
health_recovered
health_improved
health_relief_period
```

를 새로 만들지 않는다.

단지 current attention condition이 비활성화된 것이다.

---

# 25. P1-Fix 실제 fixture 사용

P4-H에서 blocker를 재현한
기존 P1-Fix/실제 fixture를 그대로 사용한다.

기존 기대값 변경 금지.

---

# 26. 필수 재현 테스트 A

상태:

```text
Natal protector operating
→ harmful path suppressed
```

Expected:

```text
Health attention active = 0
```

---

# 27. 필수 재현 테스트 B

상태:

```text
Luck stops protector
Judgment harmful path becomes active
```

Expected:

```text
structural_health_attention = 1
scope correct
provenance present
```

---

# 28. 필수 재현 테스트 C

보호 경로가 다음 scope에서 다시 유효해지는 실제 fixture가 있으면:

Expected:

```text
current Health attention inactive
```

없으면 기존 lifecycle regression으로 확인한다.

---

# 29. 필수 재현 테스트 D

harmful source 자체가 stopped.

Expected:

```text
Health attention active = 0
```

---

# 30. 필수 재현 테스트 E

protector가 단순 reduced인 경우.

Judgment가 harmful path를 active로 확정하지 않았다면
Health adapter가 독자적으로 활성화하지 않는다.

---

# 31. 상신 손상 독립 사례

P4-H에서:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

였던 독립 상신 손상 사례를
이번 fix를 통과시키기 위해 새 명리 fixture로 발명하지 않는다.

그 상태 그대로 유지 가능.

---

# 32. Formation 독립 사례

동일하게:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

유지 가능.

이번 blocker와 무관하다.

---

# 33. Health Source Contract 변경 금지

다음 파일의 의미 변경 금지:

```text
src/docs/rules/master/14-outcome-semantic-spec.md
```

이번 문제는 spec gap이 아니라 구현 bug다.

단 명백한 구현 주석/링크 수정이 필요하면 이유를 기록하되
새 rule은 추가하지 않는다.

---

# 34. Judgment 의미 변경 금지

```text
src/lib/judgment/
```

판정 의미 수정 0.

P4-H가 이미 Judgment 쪽은 정상이라고 확인했다.

---

# 35. Relationship 변경 금지

```text
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

상태 유지.

---

# 36. Money / Work 변경 금지

0건.

---

# 37. Selection 변경 금지

0건.

---

# 38. Compatibility 변경 금지

0건.

---

# 39. Reading Assembly

Health OutcomeFact가 정상 생성되면
기존 adapter를 통해 Reading Assembly로 전달되는지 확인한다.

새 Health 전용 Assembly를 만들지 않는다.

---

# 40. CH-07

fix 후에도:

```text
CH-07 = PARTIAL
```

유지.

---

# 41. CH-08~10

해당 scope Health OutcomeFact가 있는 경우
같은 원본 fact/provenance를 재사용한다.

---

# 42. Free leakage

fix로 인해 무료 결과에 대운/세운/월운 Health signal이 새어 나오면 FAIL.

Expected:

```text
free timing leakage = 0
```

---

# 43. 안전 규칙

이번 fix 후에도 다음은 모두 0:

```text
disease prediction
diagnosis
medical advice
treatment
life expectancy
health score
health rank
best/worst month
```

---

# 44. 신규 테스트 파일

기존:

```text
scripts/verify-health-outcome-p4g.mjs
```

에 회귀를 추가하거나

필요하면:

```text
scripts/verify-health-outcome-reactivation-p4g1.mjs
```

을 만든다.

---

# 45. P4-H blocker 직접 재현

반드시 P4-H에서 실패한 정확한 경로를 테스트한다.

보고서에는:

```text
Before fix:
Judgment harmful path = active
Health Outcome = missing

After fix:
Judgment harmful path = active
Health Outcome = present
```

를 기록한다.

---

# 46. 기존 회귀

반드시:

```text
Judgment 35/35
P2-A~G
P3-A~F
P4-B
P4-C
P4-E
P4-F
P4-G
```

전부 PASS.

---

# 47. P4-G.1 신규 회귀

Expected:

```text
reactivation regression = PASS
```

---

# 48. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 49. 결과 파일

```text
src/docs/codex/
p4g1-health-outcome-reactivation-fix-result.md
```

---

# 50. 최종 판정

성공 시:

```text
READY_TO_RERUN_P4H
```

실패 시:

```text
P4G1_FIX_REQUIRED
```

---

# 51. 최종 보고 필수 항목

## A. Root Cause

정확히 어떤 조건/분기 때문에
재활성된 harmful path가 Health adapter에서 누락됐는지.

## B. Fix

수정 파일/함수.

## C. Before / After

```text
Judgment current path:
Health Outcome before:
Health Outcome after:
```

## D. Provenance

```text
OutcomeFact:
scope:
source IDs:
orphan:
```

## E. Regression

전체 결과.

## F. Isolation

```text
Judgment semantic changes:
Relationship changes:
Money changes:
Work changes:
Selection changes:
Compatibility changes:
```

Expected 모두 0.

---

# 52. 완료 후

`READY_TO_RERUN_P4H`가 나오면
**새 작업으로 넘어가지 말고 기존 P4-H를 그대로 다시 실행한다.**

P4-H의 기존 기준과 기대값을 변경하지 않는다.

최종 목표는:

```text
HEALTH_OUTCOME_BATCH1_COMPLETE
```

이다.