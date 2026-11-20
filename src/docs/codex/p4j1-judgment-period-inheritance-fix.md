# FILUNE Codex P4-J.1
## Judgment Period Inheritance Fix

현재 상태:

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

Health / Relationship semantic expansion은 종료되었다.

기존 P4-J Money Outcome Integration Audit에서는 다음 blocker가 확인되었다.

```text
P4J_FIX_REQUIRED
UPSTREAM_JUDGMENT_REGRESSION
```

문제:

```text
CS-126의 12절기월 평가가
Money Outcome에 도달하기 전에
Judgment 기간 승계 오류로 중단됨
```

이번 작업은 **Judgment 기간 승계 오류만 수정**한다.

Money / Health / Relationship Outcome 의미를 수정하지 않는다.

---

# 1. 최종 목표

성공:

```text
READY_TO_RERUN_P4J
```

실패:

```text
P4J1_FIX_REQUIRED
```

---

# 2. 반드시 먼저 읽을 파일

```text
src/docs/codex/p4j-money-outcome-integration-audit-result.md
src/docs/codex/p4j-money-outcome-integration-audit.md

src/docs/codex/p4i-money-outcome-batch1-result.md

src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md

src/docs/codex/p1-final-closure-audit.md
```

그리고 실제:

```text
CS-126 fixture
12절기월 관련 Judgment pipeline
Luck scope 생성 코드
월 snapshot / inheritance 코드
```

를 추적한다.

---

# 3. 이번 작업의 성격

분류:

```text
UPSTREAM_JUDGMENT_REGRESSION
```

이다.

이것은:

```text
Money semantic bug 아님
Health semantic bug 아님
Relationship semantic bug 아님
Reading Assembly semantic bug 아님
```

이다.

---

# 4. 새 명리 규칙 추가 금지

이번 수정은 기존 FILUNE Judgment 계약을 복원하는 작업이다.

다음 금지:

```text
새로운 월운 우선순위
새로운 용신 판정
새로운 상신/병/구응 판정
새로운 Root 계산
새로운 Formation 계산
새로운 score
```

---

# 5. CS-126 정확히 재현

P4-J에서 실패한 **동일 CS-126 입력과 동일 12절기월 경로**를 그대로 사용한다.

기존 기대값 변경 금지.

먼저 수정 전 실패를 재현하고 기록한다.

---

# 6. Root Cause를 추측하지 말 것

실제 코드를 추적하여 다음 중 무엇이 문제인지 확정한다.

가능성 예:

```text
잘못된 parent snapshot
이전 월 state 잔존
만료된 effect 승계
scope parent 연결 오류
기간 boundary 계산 오류
12절기월 chronological chain 오류
current state와 history 혼동
scope 간 mutable state 공유
```

실제 원인은 파일/함수/분기까지 보고한다.

---

# 7. FILUNE scope 계약 유지

기존 scope 원칙을 변경하지 않는다.

내부 Judgment의 운 scope 관계는 현행 master를 따른다.

특히 월 평가가 상위 상태를 이어받더라도
현재 월의 직접 비교·현재 상태 계산은 기존 계약대로 유지한다.

---

# 8. 12절기월 유지

월 평가 기준은 calendar month가 아니라 기존 **12절기월**이다.

다음 변경 금지:

```text
양력 1일~말일 기준으로 대체
임의 30일 window
월 경계 재정의
```

---

# 9. Chronological evaluation

12개 월 snapshot은 시간순으로 평가한다.

확인:

```text
month 1
→ month 2
→ ...
→ month 12
```

각 기간의:

```text
start
end
parent/inherited state
current state
```

를 검증한다.

---

# 10. Snapshot immutable 계약

이전 scope snapshot을 다음 scope에서 mutate하지 않는다.

Expected:

```text
previous snapshot mutation = 0
```

---

# 11. History와 Current State 분리

기존 FILUNE 계약 유지:

```text
History
≠
Currently Effective State
```

이전 기간에 발생한 effect가 history에 남는 것은 허용된다.

그러나 만료된 effect가 현재 state에 남아서는 안 된다.

---

# 12. Expired LuckEffect

이전 기간 effect가 종료되면:

```text
currentlyEffective = false
expired = true
```

또는 현행 타입의 동등 상태를 유지한다.

현재 월 Judgment에 활성 효과로 재적용하지 않는다.

---

# 13. Inherited Combine 계약

P1 lifecycle fix에서 확정한:

```text
event history
vs
current lasting effect
```

분리를 유지한다.

과거 합거 event가 history에 있다는 이유로
다음 월 stem runtime을 계속 stopped로 만들지 않는다.

---

# 14. Role Current State

RoleHistory는 유지하되:

```text
operating
reduced
inactive
deferred
```

현재 기능은 해당 월의 current evidence로 다시 평가한다.

---

# 15. PatternContext

월마다:

```text
provisional PatternContext
→ runtime resolution
→ final PatternContext
```

기존 순서를 유지한다.

이전 월의 final PatternContext를 다음 월의 natal structure처럼 고정하지 않는다.

---

# 16. Manifestation History

다음은 분리한다.

```text
ManifestationHistory
EffectiveManifestedYongShenSet
```

이전 월 투출 이력이 있다고
현재 월에도 자동 유효 투출로 취급하지 않는다.

---

# 17. Root / Formation / Capacity

각 월 current state를 기존 계약대로 재평가한다.

이전 월 상태를 그대로 복사하여 확정하지 않는다.

---

# 18. 원국 불변

Natal structure/history는 바뀌지 않는다.

월 평가가 진행되어도:

```text
Natal facts
Natal role history
Natal pattern history
```

를 mutate하지 않는다.

---

# 19. Daewoon/Sewoon 상위 상태

월이 상위 운의 상태를 이어받는 계약은 유지한다.

단:

```text
상위 scope history
상위 scope currently effective state
```

를 혼동하지 않는다.

---

# 20. CS-126 중단 지점 기록

수정 전 반드시 보고:

```text
last successful scope:
failing month:
failing function:
error / invalid state:
expected parent:
actual parent:
```

---

# 21. 수정 범위 최소화

가능한 수정 범위:

```text
src/lib/judgment/
src/lib/judgment/pipeline/
```

실제 root cause에 필요한 파일만 수정한다.

---

# 22. Outcome 코드 변경 금지

다음 의미 변경:

```text
src/lib/outcome/money/
src/lib/outcome/health/
src/lib/outcome/relationship/
```

모두:

```text
0
```

---

# 23. Reading Assembly 변경 금지

```text
src/lib/reading/
```

의 의미 변경:

```text
0
```

이번 blocker는 Assembly 도달 전 Judgment에서 발생했다.

---

# 24. Master 14 변경 금지

Outcome Assertion Policy 변경:

```text
0
```

---

# 25. Health/Relationship 완료 상태 보존

다음 상태를 깨지 않는다.

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

---

# 26. Money P4-I 계약 보존

P4-I Money 결과의:

```text
acquisition
generation method
retention
division/outflow
money-related difficulty
duration/stability
```

의미 변경:

```text
0
```

---

# 27. Test A — CS-126 12절기월 완주

Expected:

```text
12/12 month Judgment snapshots generated
pipeline exception = 0
invalid inheritance = 0
```

---

# 28. Test B — 월 경계

각 월:

```text
start < end
```

이어야 한다.

연속 월 사이:

```text
previous.end
→ next.start
```

기존 절기 경계 계약과 일치해야 한다.

---

# 29. Test C — parent chain

각 월 snapshot의 parent/inherited source가
기존 scope contract와 일치해야 한다.

잘못된 이전 월 또는 미래 월 참조:

```text
0
```

---

# 30. Test D — expired state leakage

이전 월에서 종료된 effect가
다음 월 current state에 남는 건수:

```text
0
```

---

# 31. Test E — current state 재활성

이전 월에 stopped/inactive였던 기능이
원인이 끝난 다음 월에 다시 유효해지는 기존 fixture가 있으면:

```text
current function restored
```

확인.

---

# 32. Test F — history 보존

복원되더라도 이전:

```text
combine history
role history
luck effect history
```

는 삭제하지 않는다.

---

# 33. Test G — Pattern mode restoration

이전 월의 운 투출 때문에 transformed/combined 상태였다가
원인이 끝난 다음 월에는
현재 유효한 조건으로 PatternContext가 복원되어야 한다.

---

# 34. Test H — Root/Formation/Capacity

월 교체 후:

```text
Root
Formation
Capacity
```

가 현재 입력 기준으로 정상 재계산되는지 확인.

---

# 35. Test I — deterministic

동일 CS-126 입력을 2회 실행.

Expected:

```text
same month boundaries
same Judgment IDs
same state
same provenance
```

---

# 36. Test J — mutation

12개월 계산 후:

```text
Natal snapshot mutation = 0
Daewoon snapshot mutation = 0
Sewoon snapshot mutation = 0
prior month snapshot mutation = 0
```

---

# 37. Test K — Money Outcome 도달

Judgment 수정 후 CS-126이 실제:

```text
Canonical
→ Judgment
→ 12절기월
→ Money Outcome
```

까지 중단 없이 도달하는지만 확인한다.

이번 단계에서 P4-J 전체 감사는 아직 하지 않는다.

---

# 38. Money 결과 기대값 변경 금지

Money Outcome이 생성되더라도
P4-J의 기대값을 이번 fix에서 수정하지 않는다.

---

# 39. 신규 검증 스크립트

권장:

```text
scripts/verify-judgment-period-inheritance-p4j1.mjs
```

기존 P4-J 재현 fixture를 최대한 재사용한다.

---

# 40. Before / After 보고

반드시:

```text
BEFORE

CS-126:
12-month Judgment:
failure month:
failure function:
failure cause:
```

```text
AFTER

CS-126:
12-month Judgment:
completed months:
invalid inheritance:
expired leakage:
Money Outcome reached:
```

---

# 41. Root Cause 보고

반드시:

```text
file:
function:
bug:
why it appeared in CS-126:
```

를 구체적으로 기록한다.

---

# 42. 회귀 — Judgment

반드시:

```text
Judgment 35/35
P0
P1-1
P1-2
P1-3
P1 lifecycle / closure
```

현행 repository의 실제 검증 명령 기준으로 모두 PASS.

---

# 43. Personality 회귀

```text
P2-A~G
```

PASS.

---

# 44. Renderer 회귀

```text
P3-A~F
```

PASS.

---

# 45. Outcome 회귀

최소:

```text
P4-B
P4-C
P4-E
P4-F
P4-G
P4-G.1
P4-H
P4-I
P4-K.1
P4-K.2
```

PASS 가능한 범위 전체 실행.

---

# 46. Health month identity 회귀

P4-K.2A에서 수정한:

```text
natal origin Health fact
→ monthly window에서도 natal origin
→ same stable ID/provenance
```

계약을 반드시 다시 통과시킨다.

---

# 47. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 48. git diff 감사

이번 fix의 실제 코드 변경이
Judgment 기간 승계 문제에 필요한 범위를 벗어나지 않았는지 확인한다.

특히:

```text
Money semantic changes = 0
Health semantic changes = 0
Relationship semantic changes = 0
Master 14 changes = 0
```

---

# 49. 결과 파일

반드시 생성:

```text
src/docs/codex/p4j1-judgment-period-inheritance-fix-result.md
```

---

# 50. 최종 판정

성공:

```text
READY_TO_RERUN_P4J
```

실패:

```text
P4J1_FIX_REQUIRED
```

---

# 51. 성공 조건

```text
[ ] CS-126 실패 정확히 재현
[ ] 실제 root cause 특정

[ ] 12절기월 12/12 Judgment 생성
[ ] 기간 boundary 오류 0
[ ] parent/inheritance 오류 0

[ ] expired current leakage 0
[ ] previous snapshot mutation 0
[ ] natal mutation 0

[ ] history/current state 분리 유지
[ ] combine lifecycle 회귀 유지
[ ] role lifecycle 회귀 유지
[ ] PatternContext 복원 유지
[ ] Root/Formation/Capacity 복원 유지

[ ] Money Outcome까지 정상 도달
[ ] Money 의미 변경 0
[ ] Health 의미 변경 0
[ ] Relationship 의미 변경 0

[ ] P4-K.2A identity fix 회귀 유지

[ ] Judgment 회귀 PASS
[ ] Personality 회귀 PASS
[ ] Renderer 회귀 PASS
[ ] Outcome 회귀 PASS

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 52. 완료 후

`READY_TO_RERUN_P4J`가 나오면
**기존 P4-J 파일을 수정하지 말고 그대로 다시 실행한다.**

기존 파일:

```text
src/docs/codex/p4j-money-outcome-integration-audit.md
```

기대값 변경 금지.

최종 목표:

```text
MONEY_OUTCOME_BATCH1_COMPLETE
```

P4-J까지 통과한 뒤에만 다음 단계인:

```text
Event Timing Layer
```

로 이동한다.

첫 구현 후보:

```text
계약 성사에 유리한 시기
계약 지연이 발생하기 쉬운 시기
사업 시작에 유리한 시기
사업 확장보다 조정이 유리한 시기
```

내부적으로는 기존 운 scope를 사용하지만
고객 결과에서는 명리 전문용어를 직접 노출하지 않는다.