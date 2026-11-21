# FILUNE Codex P4-N.2
## Event Timing Origin Scope Preservation Fix

현재 상태:

```text
P4N_FIX_REQUIRED
```

P4-N 재감사 결과:

```text
Source Semantic Regression = PASS
Contract Branch Coverage = PASS
Production Calendar Integration = FAIL
```

Production wiring 자체는 정상이다.

실제 `/result` 제품 경로에서:

```text
explicit event context
→ Event Timing
→ Reading Assembly
```

전달은 성공했다.

현재 유일한 실패 원인:

```text
EventTimingFact의 기존 Fact ID는 유지됨
BUT
Reading Assembly 전달 과정에서 originScope가 natal로 변질됨
```

이번 작업은 **originScope provenance 보존 버그만 수정**한다.

새 명리 규칙,
새 Event Mapping,
새 fixture 의미,
새 timing policy를 추가하지 않는다.

---

# 1. 최종 목표

성공:

```text
READY_TO_RERUN_P4N
```

실패:

```text
P4N2_FIX_REQUIRED
```

---

# 2. 이미 PASS한 영역은 수정하지 않는다

다음은 다시 설계하지 않는다.

```text
Source Semantic Regression
Contract Branch Coverage

EventEvidenceAdapter semantics
EventTimingDecision semantics
Calendar Projection semantics

contract/business policies
```

---

# 3. 반드시 먼저 읽을 파일

```text
src/docs/codex/p4n-event-timing-integration-audit-result.md
src/docs/codex/p4n1-production-event-timing-wiring-fix-result.md

src/lib/eventTiming/
src/lib/reading/eventTimingUnits.ts
src/lib/reading/assembleReading.ts
src/lib/reading/types.ts
```

그리고 Event Timing 결과가 `/result` 경로에서 Reading Assembly까지 전달되는 실제 호출 경로를 추적한다.

---

# 4. 핵심 감사

하나의 동일 EventTimingFact를 대상으로 다음 값을 단계별로 기록한다.

```text
A. Event Timing Engine output
B. product orchestration handoff
C. eventTimingUnits conversion
D. Reading Assembly input
E. final assembled reading unit
```

각 단계에서 확인:

```text
fact ID
originScope
scope
scopeId
scopeGanZhi
parentScopeGanZhi
provenance/source IDs
```

어느 단계에서 처음 `originScope = natal`로 바뀌는지 정확히 특정한다.

---

# 5. 원본 값이 authority

Reading Assembly는 EventTimingFact의:

```text
originScope
```

를 재판정하지 않는다.

반드시 upstream EventTimingFact 값을 그대로 보존한다.

---

# 6. 금지

다음과 같은 fallback은 금지한다.

```text
originScope ?? 'natal'
scope가 없으면 natal
chapter 종류로 originScope 추정
ReadingScope를 originScope로 사용
```

upstream에서 이미 originScope가 존재하면
반드시 그 값을 그대로 사용한다.

---

# 7. originScope와 display scope 구분

기존 FILUNE 계약 유지:

```text
originScope
≠
display scope
```

예:

```text
세운에서 발생한 EventTimingFact
→ 월 관련 장에서 표시
```

되어도:

```text
originScope = sewoon
```

이어야 한다.

---

# 8. originScope와 current reading scope도 구분

다음도 금지:

```text
현재 Reading chapter scope
→ EventTimingFact originScope로 덮어쓰기
```

---

# 9. 동일 Fact ID라면 provenance도 동일

P4-N에서 이미:

```text
Fact ID = 유지
originScope = 변질
```

이 확인되었다.

같은 Fact ID가 Assembly에 들어갔다면
최소 다음도 원본과 같아야 한다.

```text
originScope
source IDs
provenance
scope identity
```

---

# 10. eventTimingUnits 감사

특히:

```text
src/lib/reading/eventTimingUnits.ts
```

에서 ReadingUnit 또는 동등 구조로 변환할 때

```text
originScope
```

가:

```text
input.originScope
```

에서 직접 전달되는지 확인한다.

---

# 11. ReadingUnit 타입

ReadingUnit 또는 관련 타입이
originScope를 표현할 수 없는 구조라면
기존 provenance 계약을 깨지 않는 **최소 additive 필드**만 허용한다.

단 새 semantic type system을 만들지 않는다.

---

# 12. 기존 scope 필드 재사용 주의

다음 두 값을 혼동하지 않는다.

```text
scope
originScope
```

`scope`는 현재 표시/적용 범위일 수 있고
`originScope`는 Fact가 실제 발생한 범위다.

둘은 같을 수도 있지만 항상 같지는 않다.

---

# 13. existing Health precedent 확인

Health P4-K.2A에서 이미:

```text
origin scope
provenance
ID
```

보존 문제를 해결했다.

현재 Reading/Outcome 코드에
origin 보존 precedent가 있다면 동일 convention을 재사용한다.

새 convention을 만들지 않는다.

---

# 14. source snapshot 경로는 건드리지 않는다

Source-backed Decision의:

```text
not_projectable
```

계약은 이번 버그와 무관하다.

수정 금지.

---

# 15. Production calendar projection도 건드리지 않는다

P4-N에서 calendar wiring은 실제로 연결됐다.

날짜 계산 로직 변경:

```text
0
```

---

# 16. 실제 재현 fixture

P4-N에서 실패한 동일 production fixture를 그대로 사용한다.

기대:

Before:

```text
EventTimingFact ID = X
originScope = sewoon/month/etc.

Assembly:
ID = X
originScope = natal
```

After:

```text
EventTimingFact ID = X
Assembly ID = X

EventTimingFact originScope
=
Assembly originScope
```

---

# 17. 최소 3개 제품 fixture 재검증

P4-N.1의:

```text
contract context 2
business start context 1
```

총 3개 제품 fixture를 그대로 실행한다.

---

# 18. 모든 product fixture에서 확인

```text
Fact ID mismatch = 0
originScope mismatch = 0
provenance mismatch = 0
scope identity mismatch = 0
```

---

# 19. natal-origin 실제 Fact

실제로 natal origin인 Fact가 있다면:

```text
originScope = natal
```

은 그대로 유지되어야 한다.

즉 단순히 모든 값을 non-natal로 바꾸는 수정은 금지한다.

---

# 20. Scope enum conversion 주의

Event Timing의 scope type과
Reading의 scope type이 다른 경우
명시적 1:1 mapping을 사용한다.

예:

```text
natal   → natal
daewoon → daewoon
sewoon  → sewoon
month   → month
day     → day
```

실제 repository canonical enum 값을 따른다.

---

# 21. unknown/default 처리

upstream originScope가 정말 없는 legacy Fact만
기존 안전한 fallback 계약을 적용한다.

이번 EventTimingFact에는 originScope가 있으므로
fallback이 호출되어서는 안 된다.

---

# 22. 새 fixture 기대값 변경 금지

P4-N 실패 fixture의 expected originScope를
`natal`로 바꿔 통과시키는 것 금지.

---

# 23. Event semantic isolation

이번 수정으로:

```text
contract favorable
contract delay
business start
business expansion
business adjustment
business restructure
```

판정 결과 변경:

```text
0
```

---

# 24. Judgment isolation

Judgment code 변경:

```text
0
```

원칙.

이 버그는 Reading handoff 문제다.

---

# 25. Domain Outcome isolation

다음 의미 변경:

```text
Money = 0
Health = 0
Relationship = 0
Personality = 0
```

---

# 26. Targeted verifier

권장:

```text
scripts/verify-event-timing-origin-scope-p4n2.mjs
```

---

# 27. Targeted 결과

반드시 보고:

```text
production fixtures:
EventTimingFacts delivered:
ID mismatches:
originScope mismatches:
provenance mismatches:
scope identity mismatches:
```

Expected mismatch 전부:

```text
0
```

---

# 28. 기존 P4-N.1 회귀

실행:

```text
verify-event-timing-production-wiring-p4n1
```

또는 실제 repository의 동등 검증기.

Expected:

```text
READY_TO_RERUN_P4N
```

---

# 29. P4-M 핵심 회귀

이번 수정은 Reading layer이므로
P4-M 구조를 다시 전체 연구하지 않는다.

최소:

```text
P4-M.5 targeted verifier
```

PASS 확인.

---

# 30. Reading Assembly 회귀

반드시 기존 Reading Assembly verifier를 실행한다.

기대값 변경 금지.

---

# 31. Health origin 회귀

Health P4-K.2A의 기존:

```text
ID/provenance/origin
```

보존 회귀를 실행한다.

Event Timing 수정 때문에 Health가 다시 깨지면 FAIL.

---

# 32. Relationship 회귀

Reading scope/provenance 관련 기존 Relationship 검증도
영향이 있으면 실행한다.

---

# 33. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 34. git diff check

```text
git diff --check
```

PASS.

---

# 35. 수정 범위 보고

결과에 반드시:

```text
files changed:
semantic code changes:
wiring/projection changes:
reading mapping changes:
```

를 기록한다.

Semantic code changes expected:

```text
0
```

---

# 36. 결과 파일

생성:

```text
src/docs/codex/p4n2-event-timing-origin-scope-preservation-fix-result.md
```

---

# 37. 최종 판정

다음을 모두 만족하면:

```text
READY_TO_RERUN_P4N
```

판정한다.

조건:

```text
[ ] P4-N originScope corruption 재현

[ ] corruption 발생 단계 정확히 특정
[ ] 최소 mapping/wiring 수정

[ ] EventTimingFact ID 보존
[ ] originScope 보존
[ ] provenance 보존
[ ] scope identity 보존

[ ] 3개 production fixture mismatch 0

[ ] natal 실제 origin 정상 유지
[ ] non-natal origin natal로 덮어쓰기 0

[ ] Event semantics 변경 0
[ ] Judgment 변경 0
[ ] Money/Health/Relationship 의미 변경 0

[ ] Reading Assembly PASS
[ ] Health origin regression PASS
[ ] P4-N.1 PASS

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 38. 이후

`READY_TO_RERUN_P4N`이면
새 P4-N.x 작업을 만들지 않는다.

기존:

```text
src/docs/codex/p4n-event-timing-integration-audit.md
```

를 그대로 다시 실행한다.

기대:

```text
Source Semantic Regression = PASS
Contract Branch Coverage = PASS
Production Calendar Integration = PASS

Final:
EVENT_TIMING_BATCH1_COMPLETE
```

새 semantic blocker가 없다면
그 시점에 P4-L~P4-N을 종료한다.