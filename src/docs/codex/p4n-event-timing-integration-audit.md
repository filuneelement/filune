# FILUNE Codex P4-N
## Event Timing Integration Audit

현재 진입 상태:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
EVENT_EVIDENCE_MAPPING_READY
READY_FOR_P4N_EVENT_TIMING_AUDIT
```

P4-M.5까지 완료되었다.

이번 단계는 **Event Timing Batch 1의 최종 통합 감사**다.

새 명리 규칙을 추가하지 않는다.
새 Event Mapping을 만들지 않는다.
기존 source 기대값을 수정하지 않는다.

---

# 1. 최종 목표

성공:

```text
EVENT_TIMING_BATCH1_COMPLETE
```

실패:

```text
P4N_FIX_REQUIRED
```

---

# 2. 감사 범위

이번 감사는 반드시 다음 **세 레인**을 분리해서 검증한다.

```text
A. Source Semantic Regression
B. Contract Branch Coverage
C. Production Calendar Integration
```

세 레인을 섞어 하나의 PASS로 처리하지 않는다.

---

# 3. 반드시 읽을 기준

```text
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4l-event-timing-source-contract-result.md
src/docs/codex/p4m1-event-evidence-mapping-contract-result.md
src/docs/codex/p4m2-event-evidence-adapter-engine-result.md
src/docs/codex/p4m3b-event-timing-decision-projection-split-result.md
src/docs/codex/p4m4-event-evidence-judgment-fact-gap-audit-result.md
src/docs/codex/p4m5-event-judgment-fact-minimal-fix-result.md

src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
```

그리고 실제:

```text
src/lib/judgment/
src/lib/outcome/
src/lib/eventTiming/
src/lib/reading/
```

을 확인한다.

---

# 4. 최종 아키텍처

다음 구조가 유지되어야 한다.

```text
Birth Input / Source Snapshot
        ↓
Canonical / Judgment
        ↓
Domain Outcomes
        ↓
EventEvidenceAdapter
        ↓
EventEvidenceFact[]
        ↓
EventTimingDecision[]
        ↓
Calendar Projection
        ↓
EventTimingFact[]
        ↓
Reading Assembly
```

---

# 5. 책임 분리 감사

반드시 확인:

```text
Judgment
= 명리 구조 판정

EventEvidenceAdapter
= 기존 Fact를 사건 의미로 연결

EventTimingDecision
= 사건 방향과 scope 판정

Calendar Projection
= Gregorian 기간 배치

Reading Assembly
= 기존 결과 조립
```

각 계층이 다른 계층의 책임을 침범하면 FAIL.

---

# 6. Decision / Projection 분리 유지

다음이 가능해야 한다.

```text
semantic Decision = confirmed
calendar interval = unavailable

→ confirmed / not_projectable
```

날짜가 없다는 이유로 사건 의미를 deferred로 낮추지 않는다.

---

# 7. 가짜 날짜 금지

다음:

```text
invented Gregorian birth date
invented birth time
invented luck start date
invented month/day interval
```

모두:

```text
0
```

---

# 8. Lane A — Source Semantic Regression

전문가 원자료 사례를 이용한다.

목적:

```text
원자료가 말한 실제 사건 의미
→ 기존 Judgment Fact
→ Event Evidence
→ Event Timing Decision
```

이 일치하는지 검증한다.

Gregorian calendar projection은 필수 아님.

---

# 9. Source case 1

P4-M.5에서 통과시킨 계약 source case 1을 그대로 사용한다.

반드시 확인:

```text
EventEvidenceFact > 0
EventTimingDecision > 0
```

그리고 의미:

```text
Money favorable 축 유지
+
Contract negative/obstruction 축 유지
```

---

# 10. Source case 1 금지

다음 잘못된 축약:

```text
Money favorable
→ Contract favorable
```

건수:

```text
0
```

---

# 11. Source case 2

P4-M.5의 두 번째 계약 source 사례를 그대로 사용한다.

확인:

```text
기존 Judgment Fact 존재
Adapter linkage 정상
EventEvidenceFact > 0
EventTimingDecision > 0
```

---

# 12. Source 기대값 변경 금지

감사를 통과시키기 위해:

```text
전문가 풀이 의미 수정
기대 결과 완화
negative → mixed
negative → deferred
```

금지.

---

# 13. Source-backed와 Contract fixture 구분

결과 보고에서 반드시:

```text
SOURCE_BACKED
CONTRACT_TEST_ONLY
PRODUCTION_WIRING
```

세 종류를 구분한다.

`CONTRACT_TEST_ONLY`를 실제 전문가 사례라고 부르지 않는다.

---

# 14. Lane B — Contract Branch Coverage

Master 15에서:

```text
Engine Ready = yes
```

인 Event Mapping branch가 실제 코드에서 실행 가능한지 확인한다.

---

# 15. Contract positive

최소:

```text
contract_favorable
```

positive branch 실제 실행.

Expected:

```text
EventEvidence > 0
Decision > 0
```

---

# 16. Contract negative / delay

지원되는 범위에서:

```text
contract_delay
contract obstruction
contract support-function stopped
```

등을 검증한다.

Master 15에 없는 결과를 추가하지 않는다.

---

# 17. Delay ≠ Failure

반드시:

```text
contract_delay
→ contract_failure 자동 생성
```

건수:

```text
0
```

---

# 18. Contract favorable + delay

지원 가능한 fixture가 있으면 동시에 보존.

```text
contract_favorable
contract_delay
```

둘을:

```text
ambiguous
mixed only
```

로 축약하지 않는다.

fixture가 없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

허용.

---

# 19. Business positive

Master 15의 engine-ready 사업 branch 중 최소 하나 이상 실행.

예:

```text
business_start_favorable
business_expansion_favorable
```

실제 canonical 명칭 사용.

---

# 20. Business delay

지원 mapping이 구현되어 있다면:

```text
business_start_delay
```

검증.

Delay를 failure로 바꾸지 않는다.

---

# 21. Business adjustment

지원 branch에서:

```text
business_adjustment
```

실행 가능 여부 확인.

의미:

```text
무리한 확장보다 정비·조정이 유리
```

를 vague bad result로 축약하지 않는다.

---

# 22. Business restructure

지원 branch에서:

```text
business_restructure
```

검증.

다음 shortcut 금지:

```text
沖 exists
→ business_restructure
```

사업 관련 target/function 연결이 필요하다.

---

# 23. Business expansion + Money difficulty

가능한 fixture에서:

```text
business_expansion_favorable
+
money difficulty / retention problem
```

을 함께 보존한다.

둘 중 하나를 삭제하지 않는다.

---

# 24. 단일 십성 Shortcut 감사

다음 shortcut 위반:

```text
印 → contract favorable
官 → contract favorable
合 → contract favorable

食傷 → business start
財 → business expansion
沖 → business restructure
```

Expected:

```text
0
```

---

# 25. Generic favorable shortcut 감사

다음:

```text
generic favorable
→ contract favorable

generic favorable
→ business favorable
```

Expected:

```text
0
```

---

# 26. Generic unfavorable shortcut 감사

다음:

```text
generic unfavorable
→ contract delay/failure

generic unfavorable
→ business adjustment/failure
```

Expected:

```text
0
```

---

# 27. SOURCE_OR_POLICY_GAP 유지

P4-M.4에서 확정된 2개 restricted gap은 그대로 유지한다.

Expected:

```text
new implementation = 0
```

통합 감사 통과를 위해 억지로 구현하지 않는다.

---

# 28. Day finalization

기존:

```text
ENGINE_GAP
```

상태를 유지한다면 그대로 기록한다.

Day finalization이 미구현이라는 이유로:

```text
year/month Event Decision
```

을 숨기지 않는다.

---

# 29. 법적 분쟁

기존 SOURCE/POLICY gap이면 유지.

새로운:

```text
legal dispute prediction
lawsuit timing
```

을 만들지 않는다.

---

# 30. Lane C — Production Calendar Integration

실제 BirthInput 기반 기존 production fixture를 사용한다.

경로:

```text
BirthInput
→ Canonical
→ Judgment
→ Outcomes
→ Event Evidence
→ Decision
→ Projection
→ Reading Assembly
```

---

# 31. Production fixture에서 positive event 필수 아님

현재 production fixture에 event-specific evidence가 없다면:

```text
EventEvidence = 0
EventTimingDecision = 0
EventTimingFact = 0
```

이어도 PASS 가능.

이 lane의 목적은:

```text
wiring
calendar correctness
false-positive prevention
mutation prevention
```

이다.

---

# 32. Production false positive

event context 또는 event-specific evidence가 없는데:

```text
contract event
business event
```

발생:

```text
0
```

---

# 33. 12절기월

Month projection은 기존 FILUNE:

```text
12절기월
```

계약을 그대로 사용.

calendar month로 대체:

```text
0
```

---

# 34. Scope hierarchy

확인:

```text
Daewoon
Sewoon
Month
Day
```

각 scope의 existing contract 유지.

단 고객 출력에는 전문용어를 직접 노출하지 않는다.

---

# 35. originScope 보존

예:

```text
sewoon에서 발생한 Decision
→ month chapter에 표시
```

되어도:

```text
originScope = sewoon
```

유지.

---

# 36. scopeGanZhi 보존

Source semantic Decision에서 필요한 경우:

```text
scopeGanZhi
parentScopeGanZhi
```

가 안정적으로 보존되는지 확인한다.

---

# 37. Calendar projection

실제 BirthInput이 있는 production lane에서는:

```text
start
end
```

가 기존 canonical/luck 계산 결과와 일치해야 한다.

---

# 38. not_projectable

Source snapshot처럼 Gregorian 정보가 없는 경우:

```text
Decision = confirmed
Projection = not_projectable
```

허용.

---

# 39. Stable ID

동일 입력 2회:

```text
EventEvidence IDs
EventTimingDecision IDs
EventTimingFact IDs
```

동일.

---

# 40. 배열 순서 독립성

upstream Facts 순서를 바꿔도:

```text
semantic result
IDs
certainty
provenance
```

동일해야 한다.

---

# 41. Provenance

모든 EventEvidence/Decision/TimingFact에
실제 upstream ID가 있어야 한다.

Expected:

```text
orphan evidence = 0
orphan decision = 0
orphan timing fact = 0
```

---

# 42. Duplicate

Expected:

```text
duplicate evidence IDs = 0
duplicate decision IDs = 0
duplicate timing IDs = 0
```

---

# 43. lifecycle

기간 종료 후:

```text
expired/currentlyEffective
```

상태가 기존 scope 계약과 일치해야 한다.

Expired event가 현재 result에 active leakage:

```text
0
```

---

# 44. History와 current 구분

과거 발생 Event가 history에 존재할 수 있다.

하지만:

```text
history existence
≠
currently effective
```

유지.

---

# 45. Reading Assembly 연결

Event Timing이 기존 Reading Assembly에 정상 연결되는지 확인한다.

다만 기존 장 의미를 변경하지 않는다.

---

# 46. 동일 Fact 재사용

CH-08/09/10 등 여러 장에서 같은 Event 결과를 사용해도:

```text
same ID
same provenance
same origin
```

유지.

---

# 47. 무료/유료 경계

Expected:

```text
free detailed timing leakage = 0
```

무료 결과에 유료 상세 timing이 새어 나오면 FAIL.

---

# 48. 고객 명리 전문용어

customer-facing 신규 출력에서:

```text
대운
세운
월운
일운
일진

용신
상신
병
구응
격
```

노출:

```text
0
```

---

# 49. 고객용 semantic strength

근거가 confirmed인 경우:

```text
계약에 유리한 시기
사업 확장에 유리한 시기
조정이 필요한 시기
```

같은 실제 의미를 내부 semantic에서 유지한다.

다음으로 약화 금지:

```text
기회가 있을 수 있음
관련 변화 가능
에너지가 있음
```

---

# 50. 보수적 축소 감사

다음 건수:

```text
confirmed contract result suppressed:
confirmed business result suppressed:
confirmed negative result softened to vague signal:
mixed result collapsed:
```

Expected:

```text
0
0
0
0
```

---

# 51. 과잉 발명 감사

다음 건수:

```text
unsupported contract result:
unsupported business result:
unsupported exact date:
unsupported failure prediction:
unsupported legal dispute:
```

Expected:

```text
0
0
0
0
0
```

---

# 52. Numeric scoring 감사

Event Timing 코드에서:

```text
timingScore
eventScore
weightedScore
rank
55
30
10
5
```

같은 가중 계산 사용:

```text
0
```

단 다른 unrelated 코드의 숫자까지 오탐하지 않는다.

---

# 53. 기존 Outcome 격리

Event Timing 때문에:

```text
Money Outcome
Health Outcome
Relationship Outcome
```

의미 변경:

```text
0
```

---

# 54. Personality 격리

Personality 의미/결과 변경:

```text
0
```

---

# 55. Judgment 격리

P4-M.5 승인 최소 computation fix 외에:

```text
new Judgment semantics
```

추가:

```text
0
```

---

# 56. 기존 계약·사업 context 추론 금지

사주만 보고:

```text
현재 계약을 추진 중이다
현재 창업 준비 중이다
현재 사업 운영 중이다
```

라고 추정:

```text
0
```

Event context는 명시적으로 제공되어야 한다.

---

# 57. Production event context

실제 public API가 event context를 어떻게 받는지 확인한다.

명시적:

```text
contract
business_start
business_expansion
```

등이 없는 경우 자동 사건 추정 금지.

---

# 58. Source fixture context

전문가 원문 자체가:

```text
계약
사업 확장
```

을 실제 사건으로 명시했다면
source regression context로 사용하는 것은 허용한다.

이는 사용자 상황 추정이 아니다.

---

# 59. EventTimingDecision certainty

scope 크기로 자동 결정 금지.

```text
Day = low
Year = high
```

같은 단순 규칙이 없어야 한다.

---

# 60. 기존 gaps 최종 보고

반드시:

```text
SOURCE_OR_POLICY_GAP
ENGINE_GAP
FIXTURE_GAP
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

를 서로 구분한다.

---

# 61. Audit-only 원칙

P4-N은 감사 단계다.

원칙:

```text
application semantic code changes = 0
Master semantic changes = 0
fixture expectation changes = 0
```

---

# 62. 실제 blocker 발견 시

새 blocker가 있으면 즉시:

```text
P4N_FIX_REQUIRED
```

로 종료한다.

통과시키기 위해 코드나 기대값을 현장에서 수정하지 않는다.

---

# 63. 검증 스크립트

권장:

```text
scripts/verify-event-timing-integration-p4n.mjs
```

---

# 64. Source lane 결과

반드시 보고:

```text
source cases executed:
source Evidence generated:
source Decisions generated:

semantic mismatches:
shortcut violations:
unsupported results:
```

---

# 65. Contract coverage 결과

```text
contract positive:
contract negative/delay:
business start:
business expansion:
business adjustment:
business restructure:
```

각각:

```text
SOURCE_BACKED
CONTRACT_TEST_ONLY
PRODUCTION
NOT_TESTABLE
SOURCE_GAP
ENGINE_GAP
```

중 정확히 표시.

---

# 66. Production lane 결과

```text
BirthInput fixtures:
Canonical failures:
Judgment failures:
calendar failures:
false positive events:
mutation:
```

---

# 67. Projection 결과

```text
projected decisions:
not_projectable decisions:
invalid intervals:
scope mismatch:
origin mismatch:
```

---

# 68. Identity 결과

```text
duplicate IDs:
unstable IDs:
orphan provenance:
expired leakage:
```

모두 0이어야 한다.

---

# 69. Assertion 결과

```text
confirmed result suppressed:
mixed collapsed:
unsupported result invented:
generic good/bad conversion:
single-TenGod shortcut:
```

Expected 모두:

```text
0
```

---

# 70. 기존 회귀

최소 다음을 실행한다.

```text
Judgment 35/35

P0/P1 핵심
P2-A~G
P3-A~F

Money
Health
Relationship

P4-M.2
P4-M.3B
P4-M.5
```

현행 repository 검증기 기준.

---

# 71. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 72. git diff

이번 감사로 application semantic 변경이 없어야 한다.

```text
git diff --check
```

PASS.

---

# 73. 결과 파일

생성:

```text
src/docs/codex/p4n-event-timing-integration-audit-result.md
```

---

# 74. 최종 보고 A

```text
Source Semantic Regression:
PASS / FAIL

Contract Branch Coverage:
PASS / FAIL

Production Calendar Integration:
PASS / FAIL
```

---

# 75. 최종 보고 B

```text
Source-backed cases:
Contract-test-only cases:
Production fixtures:
```

각 개수 기록.

---

# 76. 최종 보고 C

```text
EventEvidenceFacts:
EventTimingDecisions:
EventTimingFacts:
```

lane별 발생 건수 기록.

---

# 77. 최종 보고 D — gaps

```text
SOURCE_OR_POLICY_GAP:
ENGINE_GAP:
FIXTURE_GAP:
NOT_TESTABLE:
```

---

# 78. 최종 보고 E — regression

```text
Judgment:
Personality:
Renderer:
Money:
Health:
Relationship:
TypeScript:
Build:
```

---

# 79. 최종 판정

다음을 모두 만족하면:

```text
EVENT_TIMING_BATCH1_COMPLETE
```

판정한다.

조건:

```text
[ ] Source Semantic Regression PASS
[ ] source case 1 PASS
[ ] source case 2 PASS

[ ] Contract Branch Coverage PASS
[ ] contract positive branch 실행
[ ] business positive branch 실행

[ ] Production Calendar Integration PASS
[ ] false positive 0
[ ] mutation 0

[ ] EventTimingDecision / Calendar Projection 분리 유지
[ ] fake Gregorian date 0

[ ] generic favorable shortcut 0
[ ] generic unfavorable shortcut 0
[ ] single-TenGod shortcut 0

[ ] confirmed 결과 억제 0
[ ] mixed collapse 0
[ ] unsupported result invention 0

[ ] stable IDs
[ ] provenance orphan 0
[ ] duplicate 0
[ ] expired leakage 0

[ ] customer Saju jargon 신규 노출 0
[ ] numeric scoring 0

[ ] Money/Health/Relationship 의미 변경 0
[ ] Personality 변경 0

[ ] Judgment 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 80. 실패 조건

다음 중 하나라도 실제 발생하면:

```text
P4N_FIX_REQUIRED
```

로 종료한다.

단:

```text
승인된 SOURCE_OR_POLICY_GAP
승인된 Day ENGINE_GAP
실제 fixture가 없는 NOT_TESTABLE
```

만 존재하고 지원 범위의 계약이 모두 정상이라면
그 자체는 FAIL이 아니다.

---

# 81. 완료 이후

`EVENT_TIMING_BATCH1_COMPLETE`가 나오면:

```text
P4-L ~ P4-N Event Timing Batch 1
```

을 종료한다.

추가 P4-M 계열 작업으로 돌아가지 않는다.

그 다음 신규 기능은 반드시 먼저:

```text
Source
→ Required Facts
→ Engine Availability
→ Positive/Negative/Mixed Fixtures
→ Projection Requirements
```

까지 확인하는 **Readiness Audit**을 선행한 뒤 구현한다.