# FILUNE Codex P4-N.1
## Production Event Timing Wiring Fix

현재 상태:

```text
P4N_FIX_REQUIRED
```

P4-N 감사 결과:

```text
Source Semantic Regression = PASS
Contract Branch Coverage = PASS
Production Calendar Integration = FAIL
```

실패 원인은 하나다.

```text
실제 제품 진입점에서
명시적 contract/business event context
→ Event Timing Engine
→ Reading Assembly

연결이 존재하지 않는다.
```

기존 verifier에서는 이 연결을 테스트 스크립트가 직접 구성하고 있다.

이번 작업은 **production orchestration wiring만 추가**한다.

새 명리 규칙,
새 Event Mapping,
새 Evidence 조건,
새 Timing 의미를 추가하지 않는다.

---

# 1. 최종 목표

성공:

```text
READY_TO_RERUN_P4N
```

실패:

```text
P4N1_FIX_REQUIRED
```

---

# 2. 절대 수정하지 않을 영역

이번 작업에서 의미 변경 금지:

```text
Judgment semantics
Event Evidence Mapping
EventTimingDecision semantics
Calendar Projection semantics

Money Outcome
Health Outcome
Relationship Outcome
Personality
```

Master 15의 의미도 수정하지 않는다.

---

# 3. 이미 PASS한 영역 재설계 금지

다음은 이미 P4-N에서 PASS했다.

```text
Source Semantic Regression
Contract Branch Coverage
```

따라서 다음 파일의 semantic logic을
wiring 편의를 위해 바꾸지 않는다.

```text
src/lib/eventTiming/eventEvidence.ts
contract/business policies
EventTimingDecision rules
```

실제 wiring에 필요한 import/API 연결만 허용한다.

---

# 4. 먼저 실제 제품 진입점을 찾는다

repository에서 실제 고객 Reading을 만드는 public path를 추적한다.

다음 순서로 확인한다.

```text
UI / product caller
→ public reading API
→ Judgment
→ Outcomes
→ assembleReading(...)
```

특히 확인:

```text
src/lib/reading/index.ts
src/lib/reading/assembleReading.ts
```

및 이를 호출하는 실제 application code.

테스트 스크립트를 production entrypoint로 간주하지 않는다.

---

# 5. 기존 Event Timing API 재사용

현재 존재하는 public API를 확인한다.

예:

```text
buildEventEvidence
buildEventTimingDecisions
projectEventTimingDecisions
buildEventTiming
```

repository의 실제 API를 재사용한다.

새 Event Timing Engine을 만들지 않는다.

---

# 6. 기존 Reading 연결 재사용

현재 존재하는:

```text
src/lib/reading/eventTimingUnits.ts
```

및 관련 Reading Assembly API를 확인한다.

이미 구현된 EventTiming → Reading unit 변환을 재사용한다.

같은 변환기를 product entrypoint에 다시 작성하지 않는다.

---

# 7. 핵심 production flow

실제 제품 경로가 다음을 수행해야 한다.

```text
BirthInput
↓
Canonical
↓
Judgment
↓
Domain Outcomes
↓
explicit Event Context
↓
EventEvidenceAdapter
↓
EventTimingDecision
↓
Calendar Projection
↓
EventTimingFact
↓
Reading Assembly
```

---

# 8. Event Context는 명시적 입력

현재 사주만 보고 다음을 추론하지 않는다.

```text
이 사람은 계약하려 한다
이 사람은 창업하려 한다
이 사람은 사업 확장을 준비한다
```

금지.

Event Timing은 반드시
사용자 또는 상위 product flow가 제공한
명시적 context를 사용한다.

---

# 9. Context API

현재 repository convention을 확인한 뒤
최소 optional context 입력을 public reading path에 추가한다.

개념 예:

```text
eventContext?: {
  eventType: ...
}
```

정확한 타입명은 기존 Event Timing 타입을 재사용한다.

새 문자열 union을 별도로 중복 정의하지 않는다.

---

# 10. 기존 호출자 호환

Event context는 optional이어야 한다.

기존:

```text
readBirthChart(...)
assembleReading(...)
```

등의 호출이 context 없이도 계속 작동해야 한다.

Expected:

```text
existing callers broken = 0
```

---

# 11. Context 없음

명시적 Event Context가 없으면:

```text
EventEvidence/Decision/Timing
```

을 억지로 생성하지 않는다.

기존 Reading 결과를 그대로 유지한다.

---

# 12. Context 있음

예:

```text
contract
```

context가 명시되면:

```text
existing Judgment
→ existing Outcomes
→ buildEventEvidence
→ buildEventTimingDecision
→ projection
```

기존 엔진을 실제 product flow에서 실행한다.

---

# 13. Business도 동일

지원되는 canonical context:

```text
business_start
business_expansion
```

등은 Master 15 / 현재 타입에 정의된 값만 사용한다.

새 event type을 이번 작업에서 추가하지 않는다.

---

# 14. Event Timing 결과 전달

생성된:

```text
EventTimingDecision[]
EventTimingFact[]
```

또는 현재 Reading Assembly가 요구하는 동등 결과를
Assembly에 전달한다.

---

# 15. Reading Assembly 자체가 Timing을 다시 계산하지 않는다

금지:

```text
assembleReading()
→ 명리 구조 재판정
→ Event Evidence 재판정
```

Assembly는 받은 Event Timing 결과를 조립한다.

---

# 16. 중복 실행 금지

production path에서 Event Timing을 두 번 실행하지 않는다.

예:

```text
public API에서 buildEventTiming
+
assembleReading 내부에서 다시 buildEventTiming
```

금지.

owner를 하나로 정한다.

---

# 17. 권장 owner

가능하면 orchestration owner는
실제 public reading service/entrypoint로 둔다.

그곳에서:

```text
Judgment
Outcomes
Event Timing
Reading Assembly
```

를 순서대로 호출한다.

---

# 18. Source semantic regression은 production path와 분리

Source-backed fixture의:

```text
not_projectable
```

계약은 그대로 유지한다.

production wiring을 위해
source fixture에 가짜 Gregorian interval을 넣지 않는다.

---

# 19. Production calendar

실제 BirthInput에서는 기존 calendar/luck scope가 있으므로
Decision이 존재할 경우
기존 Projection을 사용한다.

새 날짜 계산 함수를 만들지 않는다.

---

# 20. 12절기월 유지

Month projection:

```text
기존 FILUNE 12절기월
```

그대로 사용.

calendar month 사용 금지.

---

# 21. Free/Premium 경계

Reading Assembly에 연결할 때
기존 접근 범위를 유지한다.

Expected:

```text
free detailed event timing leakage = 0
```

---

# 22. 고객 명리 용어

이번 wiring으로 customer output에:

```text
대운
세운
월운
일진
용신
상신
병
구응
격
```

신규 노출:

```text
0
```

---

# 23. Production Integration Fixture

이번 단계에서는 최소 하나의
**실제 제품 진입점을 통과하는 integration fixture**를 추가한다.

목적은 명리 의미를 새로 검증하는 것이 아니라:

```text
explicit event context가 실제 entrypoint에 들어감
↓
Event Timing API 호출됨
↓
결과가 Reading Assembly까지 전달됨
```

을 확인하는 것이다.

---

# 24. Contract production wiring fixture

명시적:

```text
eventContext = contract
```

을 실제 product entrypoint에 전달한다.

현재 fixture에서 Event Evidence가 실제 발생하지 않는다면
0건이어도 괜찮다.

하지만 반드시 확인:

```text
context accepted = true
Event Timing path executed = true
Reading Assembly received Event Timing result = true
```

---

# 25. positive semantic을 production fixture에 억지 주입 금지

기존 BirthInput fixture에서
contract positive evidence가 없다면:

```text
EventTimingFact = 0
```

이어도 된다.

Production Wiring과 Source Semantic Coverage를 혼동하지 않는다.

---

# 26. Business production wiring

최소 하나의 business context도
같은 public API에서 받을 수 있는지 확인한다.

예:

```text
business_start
```

또는 현재 canonical 지원 event.

---

# 27. invalid context

타입/런타임 계약상 invalid event context가 들어올 경우
임의 사건으로 fallback하지 않는다.

---

# 28. Mutation 금지

production wiring 실행 전후:

```text
Canonical
Judgment
OutcomeFacts
Luck snapshots
```

mutation:

```text
0
```

---

# 29. Stable identity

production path를 동일 입력으로 두 번 실행했을 때:

```text
EventEvidence IDs
Decision IDs
Timing IDs
```

동일해야 한다.

---

# 30. Context 없는 기존 앱 경로 회귀

기존 호출:

```text
eventContext 없음
```

에서 Reading 결과가 이전과 동일해야 한다.

---

# 31. Context 있는 경로의 Assembly

EventTimingFact가 존재할 경우
기존 `eventTimingUnits` 경로를 통해
Assembly에 포함되는지 확인한다.

직접 문자열을 삽입하지 않는다.

---

# 32. P4-N 실패 원인 직접 회귀

반드시 다음을 검증한다.

Before:

```text
실제 제품 진입점으로 Event Timing을 실행하는 fixture = 0
```

After:

```text
actual product entrypoint event-context fixture >= 1
```

이것이 이번 작업의 핵심 완료 조건이다.

---

# 33. 기존 P4-M.2 / M.3B / M.5 회귀

Semantic 변경이 없음을 확인하기 위해
최소 다음을 실행한다.

```text
P4-M.2 verifier
P4-M.3B verifier
P4-M.5 verifier
```

기대값 변경 금지.

---

# 34. Source regression 재연구 금지

P4-N에서 이미:

```text
Source Semantic Regression = PASS
```

했다.

이번 작업에서는 원자료를 다시 연구하거나
Event Mapping을 수정하지 않는다.

---

# 35. Contract branch 재설계 금지

이미:

```text
Contract Branch Coverage = PASS
```

다.

새 Contract fixture나 새 policy를 만들지 않는다.

---

# 36. 신규 verifier

권장:

```text
scripts/verify-event-timing-production-wiring-p4n1.mjs
```

---

# 37. Targeted verifier 결과

반드시 보고:

```text
actual product entrypoint identified:
explicit event context accepted:
contract context wiring:
business context wiring:

Event Timing invocation:
Reading Assembly handoff:

contextless legacy path:
false positives:
mutation:
free leakage:
```

---

# 38. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 39. 최소 기존 회귀

이번 wiring 영향 범위에 대해:

```text
Judgment 35/35
Money
Health
Relationship
Reading Assembly
```

기존 기대값 유지.

전체 장시간 회귀를 먼저 실행하지 않는다.

---

# 40. 결과 파일

생성:

```text
src/docs/codex/p4n1-production-event-timing-wiring-fix-result.md
```

---

# 41. 최종 보고 A — Entry Point

```text
Actual product entrypoint:
Event context API:
Event Timing owner:
Reading Assembly handoff:
```

---

# 42. 최종 보고 B — Before / After

```text
Before:
product entrypoint fixtures = 0

After:
product entrypoint fixtures =
contract context =
business context =
```

---

# 43. 최종 보고 C — Semantic isolation

```text
Judgment semantic changes:
Event Evidence mapping changes:
Event Decision semantic changes:
Money changes:
Health changes:
Relationship changes:
```

Expected 모두:

```text
0
```

---

# 44. 최종 판정

다음을 만족하면:

```text
READY_TO_RERUN_P4N
```

판정한다.

조건:

```text
[ ] 실제 product entrypoint 확인
[ ] explicit Event Context API 연결

[ ] Event Timing 실제 호출
[ ] Reading Assembly 실제 handoff

[ ] contract context production path >= 1
[ ] business context production path >= 1

[ ] context 없는 legacy path 유지
[ ] automatic event-context inference 0

[ ] false positive 0
[ ] mutation 0
[ ] free detailed timing leakage 0

[ ] Event semantic 변경 0
[ ] Judgment semantic 변경 0
[ ] Domain Outcome 변경 0

[ ] P4-M.2 PASS
[ ] P4-M.3B PASS
[ ] P4-M.5 PASS

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 45. 다음 단계

`READY_TO_RERUN_P4N`이면
새 작업 단계를 만들지 않는다.

기존:

```text
p4n-event-timing-integration-audit.md
```

을 **그대로 재실행**한다.

기대:

```text
Source Semantic Regression = PASS
Contract Branch Coverage = PASS
Production Calendar Integration = PASS

→ EVENT_TIMING_BATCH1_COMPLETE
```

P4-N 재감사에서 새 semantic 문제가 발견되지 않는 한
Event Timing Batch 1을 종료한다.