# FILUNE Codex P4-M.2
## Event Evidence Adapter + Event Timing Engine
## Contract & Business Batch 1

현재 진입 상태:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
EVENT_EVIDENCE_MAPPING_READY
MONEY_OUTCOME_BATCH1_COMPLETE
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

P4-M 최초 구현은 다음 이유로 중단되었다.

```text
P4M_FIX_REQUIRED
ENGINE_GAP
```

P4-M.1에서 이 gap을 조사하여
Master 15에 `Event Evidence Mapping Contract`를 확정했다.

이번 단계에서는 그 계약을 실제 코드로 구현한다.

---

# 1. 최종 목표

성공:

```text
READY_FOR_EVENT_TIMING_AUDIT
```

실패:

```text
P4M2_FIX_REQUIRED
```

---

# 2. 반드시 먼저 읽을 기준

```text
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4l-event-timing-source-contract-result.md
src/docs/codex/p4m-event-timing-engine-batch1-result.md
src/docs/codex/p4m1-event-evidence-mapping-contract-result.md

src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
```

그리고 현재:

```text
src/lib/judgment/
src/lib/outcome/
src/lib/reading/
```

의 실제 타입과 public API를 확인한다.

---

# 3. 이번 단계의 핵심 구조

구현 목표:

```text
Existing Judgment
+
Existing Outcome Facts
+
Explicit Event Context
↓
EventEvidenceAdapter
↓
EventEvidenceFact[]
↓
Event Timing Engine
↓
EventTimingFact[]
↓
Reading Assembly
```

---

# 4. Judgment 재판정 금지

EventEvidenceAdapter는 기존 Judgment를 읽는다.

금지:

```text
새 격 판정
새 용신 판정
새 상신·병·구응 판정
새 RelationFact 생성
새 FormulaFact 생성
새 Root/Capacity 판정
```

---

# 5. Judgment mutation 금지

Expected:

```text
Judgment mutation = 0
```

---

# 6. EventEvidenceAdapter

하나의 공통 adapter를 만든다.

권장 개념:

```text
buildEventEvidence(...)
```

계약용/사업용 엔진을 각각 별도 최상위 엔진으로 만들지 않는다.

---

# 7. EventEvidenceFact

Master 15 계약을 기준으로 최소 구조를 구현한다.

예:

```text
EventEvidenceFact {
  id
  eventDomain
  evidenceType
  direction

  originScope
  certainty
  provenanceClass
  currentlyEffective

  sourceJudgmentIds
  sourceRelationIds
  sourceRoleIds
  sourceOutcomeIds
}
```

실제 repository convention에 맞춰 조정한다.

불필요한 필드를 추가하지 않는다.

---

# 8. Event context

사주만 보고 사용자가:

```text
현재 계약을 준비 중
사업을 시작하려 함
기존 사업을 운영 중
확장을 계획 중
```

이라고 추론하지 않는다.

Event Timing 요청에는 명시적 event context가 필요하다.

---

# 9. Context와 사주 판정 분리

예:

```text
eventContext = contract
```

는 사용자가 알고 싶은 사건 범위다.

이것이:

```text
contract_favorable
```

판정을 자동 생성하는 근거는 아니다.

---

# 10. P4-M.1의 Mapping Matrix를 그대로 구현

Master 15의 11개 evidence row를 authority로 사용한다.

각 row마다:

```text
required Judgment facts
required current function
blocking conditions
source status
engine readiness
```

를 그대로 따른다.

---

# 11. Shortcut 금지

다음 직접 mapping은 모두 금지한다.

```text
印 → 계약 favorable
官 → 계약 favorable
合 → 계약 성사

食傷 → 사업 시작
財 → 사업 확장
沖 → 사업 구조변경

generic favorable → 모든 사건 favorable
generic unfavorable → 모든 사건 unfavorable
```

Expected:

```text
shortcut violations = 0
```

---

# 12. 계약 Evidence — positive

Master 15에서 승인된 positive contract evidence만 구현한다.

예를 들어 현재 기능이 실제로:

```text
문서·계약 기능을 지원
필요한 기능이 operating
필요한 기능이 protected
계약을 현실화하는 관계가 유효
```

인 경우.

단 정확한 조건은 Master 15 mapping row를 따른다.

---

# 13. 계약 Evidence — obstruction

다음 유형도 독립 Evidence로 구현한다.

```text
document obstruction
support-function stopped
institutional instability
contract-related trouble
```

Master 15가 승인한 범위만.

---

# 14. 印 양면성 유지

반드시 회귀:

```text
印이 유효한 계약 지원 기능
→ positive contract evidence

印이 食神 등 필요한 기능을 손상
→ contract obstruction evidence
```

즉:

```text
印 = 무조건 계약 좋음
```

금지.

---

# 15. 財와 계약 분리

다음 가능:

```text
money acquisition favorable
+
contract evidence unfavorable
```

둘 다 보존.

Money가 좋다는 이유로 contract result를 favorable로 덮지 않는다.

전문가 풀이에서도 재물 조건이 살아도 문서·계약은 따로 불리할 수 있다.

---

# 16. 官과 계약

관성 관련 evidence도
실제 현재 구조적 기능과 source mapping이 있을 때만 사용한다.

```text
官 exists
```

만으로 계약 사건을 만들지 않는다.

---

# 17. 合과 계약

다음 구분 유지:

```text
valid supportive binding
vs
required function stopped by combine
```

둘을 같은 `합`이라고 처리하지 않는다.

---

# 18. Contract Timing Policy

EventEvidence를 받은 뒤에만 Timing으로 변환한다.

예:

```text
positive contract evidence
+
current scope activation
↓
contract_favorable
```

---

# 19. Contract favorable

근거 충족 시 의미를 끝까지 보존:

```text
계약 성사에 유리한 시기
```

내부 semantic에서 이를 generic opportunity로 약화하지 않는다.

---

# 20. Contract delay

Master 15 / P4-M.1의 제한적 mapping이 실제 충족될 때만:

```text
contract_delay
```

생성.

---

# 21. Delay ≠ failure

다음 동시 결과 허용:

```text
contract_favorable = confirmed
contract_delay = confirmed
```

의미:

```text
성사 가능성은 있으나 진행이 늦어질 수 있음
```

---

# 22. Contract failure 자동 생성 금지

```text
contract_delay
→ contract_failure
```

금지.

---

# 23. Contract finalization

P4-M.1에서 Day finalization이 gap이면
이번 단계에서 억지 구현하지 않는다.

분류:

```text
ENGINE_GAP
```

또는 Master 15의 현재 정확한 상태.

---

# 24. 연·월 결과는 Day gap 때문에 막지 않는다

예:

```text
contract favorable year = confirmed
contract favorable month = confirmed
day finalization = ENGINE_GAP
```

허용.

---

# 25. 법적 분쟁

P4-M.1에서 별도 gap으로 남긴 legal dispute mapping을
이번 단계에서 일반 contract trouble로 확대하지 않는다.

정확히:

```text
SOURCE_GAP
ENGINE_GAP
```

등 Master 15 상태를 유지한다.

---

# 26. Business Evidence — activity

Master 15에서 승인된:

```text
business activity support
```

조건을 구현한다.

단:

```text
食傷 exists
```

만으로는 불충분하다.

---

# 27. 食傷 current function

최소:

```text
operating
reduced
inactive
stopped
```

등 현행 current state를 반영한다.

stopped 기능으로 business activity evidence를 만들지 않는다.

---

# 28. Business start evidence

Master 15의 제한된 SOURCE_INFERENCE 계약을 그대로 따른다.

필요한:

```text
business-specific current function
+
event context
+
current scope activation
```

이 없으면 발행하지 않는다.

---

# 29. Business start favorable

근거 충분 시:

```text
business_start_favorable
```

생성.

의미는:

```text
사업을 실제 시작하기 유리한 시기
계획을 실행으로 옮기기 좋은 시기
```

까지 보존한다.

---

# 30. Business start delay

승인 조건 충족 시 별도로:

```text
business_start_delay
```

생성.

---

# 31. Start favorable + delay

동시 허용:

```text
business_start_favorable
business_start_delay
```

이를:

```text
사업운 애매
```

로 합치지 않는다.

---

# 32. Business result support

사업 활동 기능과
현실 결과 기능을 분리한다.

예:

```text
activity support
≠
result support
```

---

# 33. 食傷生財

실제 current relation/function이:

```text
食傷生財
```

로 유효하더라도:

```text
무조건 창업
```

으로 만들지 않는다.

다만 기존 Event Context가 business이고
Master 15 mapping 조건이 만족되면
사업 결과 지원 evidence로 사용할 수 있다.

---

# 34. Business expansion

P4-M.1에서 승인된 evidence를 충족할 때:

```text
business_expansion_favorable
```

생성.

---

# 35. Expansion은 실제 생활 결과

근거 충분한 경우:

```text
사업 확장에 유리한 시기
거래 범위를 넓히기 좋은 시기
```

까지 semantic을 보존한다.

---

# 36. Expansion ≠ Money acquisition

```text
money_acquisition
```

만 존재한다고:

```text
business_expansion
```

을 생성하지 않는다.

---

# 37. 확장 + 금전 문제

동시 가능:

```text
business_expansion_favorable
+
money_retention weakness
```

또는:

```text
business_expansion_favorable
+
money difficulty
```

이를 서로 상쇄하지 않는다.

---

# 38. Business adjustment

Master 15 evidence가 다음 의미를 지원하면:

```text
business_adjustment
```

생성.

고객 의미 후보:

```text
무리하게 확장하기보다 기존 구조를 정비하는 편이 유리한 시기
```

---

# 39. Adjustment ≠ generic bad

전체 운이 나쁘다는 이유만으로
business_adjustment 생성 금지.

---

# 40. Business restructure

Master 15의 실제 evidence가 충족될 때:

```text
business_restructure
```

생성.

---

# 41. 충 shortcut 금지

```text
沖 exists
→ business_restructure
```

금지.

최소:

```text
valid current clash/change fact
+
business-related target/function
+
actual current effect
```

를 확인한다.

---

# 42. Restructure direction

가능:

```text
business_restructure
+
improvement direction
```

또는:

```text
business_restructure
+
disruption
```

구분.

---

# 43. restructure ≠ failure

자동 사업 실패 추론 금지.

---

# 44. Event Timing Engine

EventEvidenceAdapter와 Timing policy를 분리한다.

권장:

```text
buildEventEvidence(...)
buildEventTiming(...)
```

공통 API를 유지한다.

---

# 45. Event Timing Fact

최소:

```text
id
eventType
originScope
effectivePeriod
certainty
provenance
sourceEvidenceIds
currentlyEffective
```

실제 repository convention을 따른다.

---

# 46. Origin scope

P4-K.2A 계약 재사용.

```text
origin scope
≠
display scope
```

---

# 47. 동일 사건 재사용

연 단위에서 발생한 Timing Fact가
월 장에서 표시되어도 origin을 month로 변경하지 않는다.

---

# 48. Month에서 새로 발생한 경우

실제 month-specific evidence가 새로 생긴 경우만:

```text
originScope = month
```

---

# 49. 12절기월

Month evaluation은 기존:

```text
12절기월
```

계약을 그대로 사용.

calendar month 금지.

---

# 50. 시간 계층

내부:

```text
Daewoon
Sewoon
Month
Day
```

기능 차이를 유지한다.

숫자 weight를 사용하지 않는다.

---

# 51. 숫자 score 금지

검색 및 감사:

```text
timingScore
eventScore
weightedScore
55
30
10
5
+85
```

Event Timing 계산에 사용:

```text
0
```

---

# 52. 상위와 하위 scope

낮은 scope가 높은 scope 전체를 자동 뒤집지 않는다.

하지만 하위 scope의 실제 단기 효과도 삭제하지 않는다.

---

# 53. Confirmed axis 보존

예:

```text
year favorable = confirmed
month = deferred
day = ENGINE_GAP
```

이면 year confirmed를 그대로 유지한다.

---

# 54. Mixed Timing

최소 다음 구조 지원:

```text
contract favorable + delay
business start favorable + delay
business expansion + money difficulty
business restructure + improvement
business restructure + disruption
```

fixture가 없으면 NOT_TESTABLE 가능.

---

# 55. Event Context required

이벤트 timing API에는 사건 종류를 명시해야 한다.

예:

```text
contract
business_start
business_expansion
```

사주만 보고 사용자 상황을 추론하지 않는다.

---

# 56. Context 없는 경우

명시적 event context가 없으면:

```text
event timing not requested
```

또는 현행 API 계약에 맞는 빈 결과를 반환한다.

사주에서 자동으로:

```text
당신은 사업을 시작하려 한다
```

같은 판단 금지.

---

# 57. Source status 유지

각 Evidence/Timing fact에:

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
```

등 필요한 provenance class를 보존한다.

---

# 58. SOURCE_INFERENCE 승격 금지

P4-L/P4-M.1에서:

```text
사업 시작
계약 지연
```

이 제한적 SOURCE_INFERENCE이면
그 상태를 그대로 유지.

---

# 59. JUDGMENT_FACT_GAP

P4-M.1에서 실제 Judgment fact가 없어
구현할 수 없다고 판정된 mapping은
이번 단계에서 임의로 만들어내지 않는다.

정확히:

```text
JUDGMENT_FACT_GAP
```

로 유지.

---

# 60. ENGINE_GAP

기술적으로 아직 지원하지 않는 부분은:

```text
ENGINE_GAP
```

으로 유지.

---

# 61. SOURCE_GAP

원자료가 충분히 지원하지 않는 항목은:

```text
SOURCE_GAP
```

유지.

---

# 62. Gap 때문에 지원되는 결과까지 차단 금지

예:

```text
contract favorable = supported
contract finalization day = ENGINE_GAP
```

이면 favorable는 생성한다.

---

# 63. Reading Assembly

EventTimingFact를 기존 Reading Assembly에서
소비할 수 있게 연결한다.

Master 13 / Master 15 기준.

---

# 64. 새 chapter 생성 금지

기존 장 구조를 사용한다.

---

# 65. CH 시기 장

기존:

```text
CH-08
CH-09
CH-10
```

등 시기 장에서
동일 EventTimingFact를 stable ID/provenance로 재사용한다.

---

# 66. Free timing leakage

무료 결과에 유료 상세 timing 노출:

```text
0
```

---

# 67. Customer-facing 문장

이번 단계의 핵심은 semantic engine이다.

전용 Renderer는 만들지 않는다.

다만 고객 노출 문자열을 추가한다면 명리 전문용어 직접 노출 금지.

---

# 68. 금지 고객 용어

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

신규 customer-facing leakage:

```text
0
```

---

# 69. Existing Outcomes mutation

다음 변경 금지:

```text
Money Outcome
Health Outcome
Relationship Outcome
Personality
```

---

# 70. Judgment semantic changes

```text
0
```

이번 Event layer를 구현하기 위해
Judgment 규칙을 임의 확장하지 않는다.

---

# 71. 권장 코드 구조

Repository convention 확인 후 가능하면:

```text
src/lib/eventTiming/types.ts
src/lib/eventTiming/eventEvidence.ts
src/lib/eventTiming/contractPolicy.ts
src/lib/eventTiming/businessPolicy.ts
src/lib/eventTiming/eventTiming.ts
src/lib/eventTiming/index.ts
```

파일이 과도하면 단순화 가능.

---

# 72. Public API

권장:

```text
buildEventTiming(input)
```

내부에서:

```text
buildEventEvidence()
→ applyEventTimingPolicies()
```

순서.

---

# 73. Test A — 인성 shortcut 차단

印 존재.

하지만 현재 기능이 계약 지원이 아님.

Expected:

```text
contract evidence = 0
```

---

# 74. Test B — 계약 positive

P4-M.1 source-supported positive fixture에서:

```text
contract positive evidence = confirmed
contract_favorable = confirmed
```

---

# 75. Test C — 계약 obstruction

필요 문서 기능이 손상되거나
관련 support function이 stopped인 fixture:

```text
contract obstruction = confirmed
```

---

# 76. Test D — Money good / Contract bad

전문가 사례와 같은 구조:

```text
money favorable
contract unfavorable
```

둘 다 보존.

---

# 77. Test E — 食傷 shortcut 차단

食傷 present이지만
사업-specific evidence 불충족:

```text
business start = 0
```

---

# 78. Test F — Business start

승인 evidence 충족:

```text
business_start_favorable = confirmed
```

---

# 79. Test G — Business expansion + money issue

가능한 fixture에서:

```text
business_expansion_favorable = confirmed
money difficulty = confirmed
```

둘 다 유지.

---

# 80. Test H — adjustment

승인 evidence에서:

```text
business_adjustment = confirmed
```

---

# 81. Test I — restructure

사업 관련 유효 충/변화 evidence:

```text
business_restructure = confirmed
```

---

# 82. Test J — generic clash 차단

사업과 무관한 충:

```text
business_restructure = 0
```

---

# 83. Test K — delay ≠ failure

```text
contract_delay
```

있어도:

```text
contract_failure
```

자동 생성 0.

---

# 84. Test L — business start delay

```text
business_start_delay
```

있어도:

```text
business_failure
```

자동 생성 0.

---

# 85. Test M — unsupported day

Day engine gap인 상태에서:

```text
contract_finalization_day
```

invented:

```text
0
```

---

# 86. Test N — confirmed upper scope

Day gap이어도:

```text
year/month event fact
```

정상 유지.

---

# 87. Test O — Stable ID

같은 input을 2회 실행:

```text
same Evidence IDs
same Timing IDs
same provenance
same scope
```

---

# 88. Test P — Array order

upstream fact 배열 순서를 바꿔도
동일 결과.

---

# 89. Test Q — Orphan

```text
EventEvidence orphan = 0
EventTiming orphan = 0
```

---

# 90. Test R — Duplicate

```text
duplicate Evidence IDs = 0
duplicate Timing IDs = 0
```

---

# 91. Test S — Expired

이전 scope event가 종료되면:

```text
active leakage = 0
```

---

# 92. Test T — Mutation

```text
Judgment mutation = 0
Outcome mutation = 0
Luck snapshot mutation = 0
```

---

# 93. Test U — Scoring

```text
numeric timing scoring = 0
```

---

# 94. Test V — Customer terminology

```text
new customer Saju jargon leakage = 0
```

---

# 95. 신규 검증 스크립트

권장:

```text
scripts/verify-event-timing-p4m2.mjs
```

---

# 96. 기존 회귀

반드시:

```text
Judgment 35/35
P2-A~G
P3-A~F

P4 Money
P4 Health
P4 Relationship
P4-K
P4-J
P4-L
```

현행 검증기 기준으로 가능한 전체 회귀 PASS.

---

# 97. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 98. 결과 파일

생성:

```text
src/docs/codex/p4m2-event-evidence-adapter-engine-result.md
```

---

# 99. 결과 보고 — Evidence

```text
Event Evidence rows implemented:

contract:
  positive support:
  obstruction:
  instability:
  stopped support:
  binding:

business:
  activity:
  start:
  result support:
  expansion:
  adjustment:
  restructure:
  obstruction:
```

Master 15의 실제 11 rows 기준으로 정확히 작성.

---

# 100. Gap 보고

```text
JUDGMENT_FACT_GAP:
ENGINE_GAP:
SOURCE_GAP:
FIXTURE_GAP:
```

각 항목을 숨기지 않는다.

---

# 101. Timing 결과

```text
contract favorable:
contract delay:
contract finalization:
contract restructure:

business start:
business start delay:
business expansion:
business adjustment:
business restructure:
```

각각:

```text
IMPLEMENTED
PARTIAL
ENGINE_GAP
SOURCE_GAP
NOT_TESTABLE
```

보고.

---

# 102. Shortcut Audit

```text
印 → contract:
官 → contract:
合 → contract:
食傷 → business:
財 → expansion:
沖 → restructure:
generic favorable → events:
generic unfavorable → events:
```

위반:

```text
0
```

---

# 103. Assertion Audit

```text
supported result weakened to vague signal:
confirmed result suppressed by unrelated gap:
mixed result collapsed:
unsupported event invented:
unsupported exact date invented:
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

# 104. Isolation

```text
Judgment semantic changes:
Money semantic changes:
Health semantic changes:
Relationship semantic changes:
Personality changes:
Compatibility changes:
```

Expected 모두:

```text
0
```

---

# 105. 최종 판정

다음을 만족하면:

```text
READY_FOR_EVENT_TIMING_AUDIT
```

판정한다.

조건:

```text
[ ] EventEvidenceAdapter 구현
[ ] 공통 Event Timing Engine 구현

[ ] Master 15의 engine-ready evidence mapping 구현
[ ] JUDGMENT_FACT_GAP을 억지로 채우지 않음
[ ] ENGINE_GAP 유지
[ ] SOURCE_GAP 유지

[ ] 단일 십성 shortcut 0
[ ] generic favorable shortcut 0
[ ] generic unfavorable shortcut 0

[ ] contract favorable 지원 범위 구현
[ ] contract delay 지원 범위 구현

[ ] business start 지원 범위 구현
[ ] business delay 지원 범위 구현
[ ] business expansion 지원 범위 구현
[ ] business adjustment 지원 범위 구현
[ ] business restructure 지원 범위 구현

[ ] Day gap 때문에 year/month 결과 차단 0

[ ] mixed outcomes 보존
[ ] vague semantic 축소 0
[ ] unsupported event invention 0
[ ] unsupported exact date 0

[ ] score 0
[ ] stable IDs
[ ] provenance orphan 0
[ ] duplicate 0
[ ] expired leakage 0

[ ] customer Saju jargon leakage 0
[ ] free timing leakage 0

[ ] Judgment semantic changes 0
[ ] existing Outcome changes 0

[ ] 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 106. 다음 단계

성공 후:

```text
P4-N Event Timing Integration Audit
```

으로 이동한다.

P4-N에서는 실제 출생 입력부터:

```text
Canonical
→ Judgment
→ Domain Outcomes
→ EventEvidenceAdapter
→ Event Timing
→ Reading Assembly
```

까지 통합 검증한다.

P4-M.1/P4-M.2에서 남은:

```text
JUDGMENT_FACT_GAP
ENGINE_GAP
SOURCE_GAP
```

은 통합 감사에서도 그대로 구분한다.

감사 통과를 위해 gap을 임의로 메우지 않는다.