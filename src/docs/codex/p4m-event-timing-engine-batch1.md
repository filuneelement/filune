# FILUNE Codex P4-M
## Event Timing Engine — Contract & Business Batch 1

진입 조건:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
MONEY_OUTCOME_BATCH1_COMPLETE
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

이번 단계는 P4-L에서 확정한 Event Timing Source Contract를 실제 코드로 구현한다.

새 명리 이론을 추가하지 않는다.

반드시 최신:

```text
src/docs/rules/master/15-event-timing-spec.md
src/docs/codex/p4l-event-timing-source-contract-result.md
```

을 authority로 사용한다.

---

# 1. 최종 목표

성공:

```text
READY_FOR_EVENT_TIMING_AUDIT
```

실패:

```text
P4M_FIX_REQUIRED
```

---

# 2. 구현 범위

Batch 1의 핵심 범위:

```text
계약 성사에 유리한 시기
계약 지연이 발생하기 쉬운 시기

사업 시작에 유리한 시기
사업 시작·실행이 지연되기 쉬운 시기

사업 확장에 유리한 시기
사업 확장보다 조정·정리가 유리한 시기
사업 구조 변경·전환 시기
```

Day engine이 현행 계약상 충분한 경우에만:

```text
계약 최종 확정/서명에 유리한 날짜
```

를 추가한다.

Day가 PARTIAL이면 연·월 구현을 막지 않는다.

---

# 3. 반드시 읽을 기준

```text
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4l-event-timing-source-contract-result.md
src/docs/codex/p4j2-money-outcome-closure-result.md
src/docs/codex/p4k2-health-relationship-semantic-reaudit-result.md

src/docs/source/primary/04-행운론.md
src/docs/source/primary/07-사주풀이예시.md
```

현재 코드:

```text
src/lib/judgment/
src/lib/outcome/
src/lib/reading/
```

도 실제 확인한다.

---

# 4. 아키텍처

별도 계약 엔진과 사업 엔진을 각각 만들지 않는다.

권장:

```text
Judgment
   ↓
Domain Outcomes
   ↓
Event Timing Engine
   ├─ Contract Timing Policy
   └─ Business Timing Policy
   ↓
EventTimingFact[]
   ↓
Reading Assembly
```

공통 engine은:

```text
시간 scope
현재 structural state
source provenance
certainty
lifecycle
stable ID
```

를 담당한다.

사건별 의미는 policy에서 담당한다.

---

# 5. Event Timing은 Judgment를 다시 계산하지 않는다

금지:

```text
Event Timing
→ 새로운 격 판정
→ 새로운 용신 판정
→ 새로운 상신/병/구응 판정
```

반드시 기존 Judgment 결과를 read-only로 사용한다.

---

# 6. Generic good/bad timing 금지

다음 하나로 모든 사건을 처리하지 않는다.

```text
good_period
bad_period
```

같은 시기라도:

```text
계약에는 유리
사업 확장에는 불리
사업 정비에는 유리
```

할 수 있다.

---

# 7. 사건별 Judgment gate

P4-L에서 확인된 핵심 계약을 구현한다.

특히:

```text
사업 시작
계약 지연
```

등 `SOURCE_INFERENCE` 결과는
**사건과 연결되는 Judgment 기능이 확인될 때만 발행**한다.

금지:

```text
전체 구조 favorable
→ 계약 favorable 자동 생성

전체 구조 favorable
→ 사업 시작 favorable 자동 생성
```

---

# 8. 출처 상태 보존

각 EventTiming rule에는 다음 provenance를 유지한다.

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
SOURCE_CONFLICT
DEFERRED
```

`SOURCE_INFERENCE`를 `SOURCE_EXPLICIT`로 승격하지 않는다.

---

# 9. 숫자 가중치 금지

원자료의:

```text
55
30
10
5
+85
+25
```

등을 계산에 사용하지 않는다.

금지:

```text
timingScore
eventScore
weightedScore
threshold
percentage
rank
```

FILUNE은 qualitative structural evidence를 사용한다.

---

# 10. 시간 계층

내부적으로 기존 scope를 사용한다.

```text
Daewoon
→ 장기 환경

Sewoon
→ 해당 연도의 사건 현실화

Month
→ 사건의 집중·구체화

Day
→ 이미 형성된 사건의 실행·최종 확정
```

숫자 우열 체계로 바꾸지 않는다.

---

# 11. 상위 scope와 하위 scope

하위 scope 하나가 상위 전체를 자동 뒤집지 않는다.

예:

```text
장기/연간 흐름 불리
+
특정 월 favorable
```

이면:

```text
전체 favorable
```

가 아니다.

하지만:

```text
해당 월에는 일시적인 해결·진전 창구가 있음
```

은 보존한다.

---

# 12. 확정 가능한 축은 끝까지 판정

금지:

```text
연 단위 favorable confirmed
+
Month evidence missing
→ 전체 deferred
```

Expected:

```text
year favorable = confirmed
month = deferred
```

---

# 13. EventTimingFact

기존 타입 계약과 충돌하지 않는 최소 구조를 설계한다.

예:

```text
EventTimingFact {
  id
  eventType
  result
  originScope
  effectiveScope
  period
  certainty
  provenanceClass

  sourceJudgmentIds
  sourceOutcomeIds
  sourceRelationIds
  sourceRoleIds
  sourceLuckEffectIds

  currentlyEffective
}
```

실제 repository convention을 우선한다.

불필요한 필드는 추가하지 않는다.

---

# 14. Event Type — Contract

최소:

```text
contract_favorable
contract_delay
contract_finalization
contract_termination_or_restructure
```

Master 15의 실제 canonical naming이 있으면 그대로 사용한다.

---

# 15. Contract favorable

필요 조건이 모두 확인된 경우:

```text
계약 성사에 유리한 시기
```

라는 실제 생활 의미까지 보존한다.

금지:

```text
문서 관련 기운이 활성화됩니다.
계약 관련 변화가 있을 수 있습니다.
```

처럼 무의미하게 약화.

---

# 16. Contract favorable gate

단순:

```text
좋은 흐름
좋은 Money Outcome
좋은 관계 결과
```

만으로 발행하지 않는다.

Master 15에서 정한:

```text
event-specific Judgment condition
current function
scope condition
source-supported mapping
```

을 만족해야 한다.

---

# 17. Contract delay

source-supported 조건이 확인되면:

```text
계약 진행이 늦어지기 쉬운 시기
조건·일정 조율 때문에 성사가 늦어질 수 있는 시기
```

를 의미적으로 보존한다.

---

# 18. Delay ≠ Failure

금지:

```text
contract_delay
→ contract_failure
```

Expected:

```text
contract favorable = confirmed
contract delay = confirmed
```

동시 가능.

즉:

```text
성사 가능성은 살아 있으나 진행은 늦어질 수 있음
```

이 가능하다.

---

# 19. Contract finalization

Day engine이 실제 구현 가능한 경우에만:

```text
contract_finalization
```

을 생성한다.

의미:

```text
서명
최종 결정
확정
```

같은 실행 시점.

---

# 20. Day가 PARTIAL인 경우

Day-level evidence 부족 시:

```text
year/month contract timing confirmed
day finalization = deferred/not_implemented
```

로 분리한다.

Day 때문에 연·월 결과를 막지 않는다.

---

# 21. 좋은 하루 단독 판정 금지

금지:

```text
Day favorable
→ 계약하기 좋은 날
```

상위 사건 조건이 존재해야 한다.

---

# 22. Contract termination/restructure

기존 구조의 종료·전환이 source-supported 경우만 생성한다.

예:

```text
계약 종료
계약 변경
조건 재협상
기존 계약 구조 정리
```

이것을 일반 `contract unfavorable`로 뭉개지 않는다.

---

# 23. Business Event Types

최소:

```text
business_start_favorable
business_start_delay
business_expansion_favorable
business_adjustment
business_restructure
```

Master 15 canonical naming 우선.

---

# 24. Business start favorable

사건별 Judgment evidence가 충분하면:

```text
사업을 시작하기 좋은 시기
계획을 실제 실행으로 옮기기 좋은 시기
```

까지 판정한다.

금지:

```text
사업 관련 에너지가 활성화됩니다.
```

---

# 25. 사용자 현재 상태 추정 금지

사주만 보고:

```text
현재 창업 준비 중
현재 사업 중
회사를 운영 중
```

이라고 만들지 않는다.

EventTimingFact는 상태 중립적으로 만든다.

---

# 26. Business start delay

source-supported 경우:

```text
사업 실행이 늦어지기 쉬운 시기
준비는 되더라도 실제 착수가 지연될 수 있는 시기
```

를 별도 결과로 만든다.

---

# 27. Start favorable + delay 동시 가능

```text
business_start_favorable = confirmed
business_start_delay = confirmed
```

가능.

해석:

```text
방향 자체는 맞지만 실제 실행 과정은 늦어질 수 있음
```

이를 ambiguous로 만들지 않는다.

---

# 28. Business expansion favorable

source-supported condition에서:

```text
사업 확장에 유리한 시기
거래 범위나 활동 규모를 넓히기 좋은 시기
```

까지 보존한다.

---

# 29. Expansion ≠ 매출 금액 예측

금지:

```text
매출 2배
매출 ○억원
고객 ○명 증가
```

하지만:

```text
사업 확장에 유리함
거래처 확대에 유리함
```

같은 source-supported 결과는 허용한다.

---

# 30. Business adjustment

source-supported 경우:

```text
무리하게 확장하기보다 기존 구조를 정비하기 좋은 시기
```

를 실제 결과로 유지한다.

금지:

```text
사업운이 좋지 않습니다.
```

로만 축약.

---

# 31. Expansion과 Adjustment 분리

```text
expansion favorable
≠
adjustment favorable
```

같은 good/bad 한 축이 아니다.

---

# 32. Business restructure

실제 source에서:

```text
사업 방식 변경
기존 거래 관계 종료
수익 구조 전환
동업 구조 변경
```

등이 확인되는 경우:

```text
business_restructure
```

로 별도 판정한다.

---

# 33. Restructure ≠ Failure

사업 구조를 바꾸는 것이
자동 사업 실패를 의미하지 않는다.

---

# 34. 기존 Outcome과 연결

Event Timing은 필요한 경우 기존:

```text
Money Outcome
Relationship Outcome
Health Outcome
```

을 source evidence로 읽을 수 있다.

그러나 Domain Outcome 자체를 재판정하지 않는다.

---

# 35. Money 연계 예

예:

```text
money_acquisition confirmed
+
event-specific favorable business condition
```

이라면 business timing mapping에 사용할 수 있다.

하지만:

```text
money_acquisition confirmed
→ business_start_favorable 자동
```

은 금지.

---

# 36. Relationship 연계 예

partnership 관련 source-supported 조건이
사업·계약 event와 직접 연결될 때만 사용.

Relationship favorable를
모든 계약 favorable로 변환하지 않는다.

---

# 37. Work SOURCE_GAP 처리

현재 Work Outcome이 완전 구현되지 않았다고 해서:

```text
사업 start/expansion timing 전체 미구현
```

으로 막지 않는다.

Master 15가 직접 지원하는 subset만 구현한다.

---

# 38. Work 의존 항목은 분리

다음은 이번 Batch에서 억지 구현하지 않는다.

```text
승진 최적 시기
입사 최적 시기
퇴사 최적 시기
직위 상승
직업 선택
```

후속 Work source audit 대상으로 남긴다.

---

# 39. Scope lifecycle

각 EventTimingFact에:

```text
originScope
currentlyEffective
expired
```

또는 현행 동등 계약을 유지한다.

---

# 40. Origin scope ≠ display scope

P4-K.2A에서 확정한 동일 원칙 적용.

예:

```text
연 단위에서 발생한 contract favorable fact
→ 특정 월 chapter에서 표시
```

되어도 origin을 month로 다시 만들지 않는다.

---

# 41. 월에 새로 발생한 Event는 별도

실제로 Month 조건 때문에 새 event가 발생하면:

```text
originScope = month
```

로 별도 ID를 생성한다.

---

# 42. Stable ID

동일:

```text
event type
source identity
origin scope
```

이면 같은 stable ID.

같은 사실을 CH-08/09/10에 반복 배치하면서
새 ID를 만들지 않는다.

---

# 43. Provenance

모든 EventTimingFact에는
최소 하나 이상의 실제 upstream 근거가 있어야 한다.

Expected:

```text
orphan event facts = 0
```

---

# 44. Duplicate

동일 의미·동일 source path·동일 origin:

```text
duplicate ID = 0
```

---

# 45. Certainty

scope 크기로 자동 결정하지 않는다.

금지:

```text
Day → low
Month → medium
Year → high
```

certainty는 source와 structural evidence로 결정.

---

# 46. PARTIAL 처리

P4-L에서 PARTIAL로 분류한 의미는 그대로 유지한다.

PARTIAL을 구현 과정에서
confirmed/source_explicit로 임의 승격하지 않는다.

---

# 47. Deferred 최소화

진짜 필요한 근거가 없을 때만 사용한다.

한 결과가 deferred라고 다른 결과까지 deferred로 만들지 않는다.

---

# 48. Mixed Event Timing

다음 동시 결과를 허용한다.

```text
contract favorable + contract delay

business start favorable + start delay

business expansion favorable + adjustment pressure

business restructure + later expansion opportunity
```

가능한 fixture에서 그대로 보존한다.

---

# 49. Assertion Policy

기존 공통 원칙을 Event Timing에도 적용한다.

```text
근거가 확인된 결과는 끝까지 판정
근거 없는 결과는 만들지 않음
한 축 불확실 → 다른 확정 축 억제 금지
상반된 결과 → 각각 보존
```

---

# 50. 사용자용 명리 용어

EventTimingFact 내부에는:

```text
Daewoon
Sewoon
Month
Day
YongShen
Byeong
...
```

사용 가능.

하지만 customer-facing string을 이번 코드에 추가할 경우:

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

직접 노출:

```text
0
```

---

# 51. 현실 시간 언어

후속 renderer가 다음으로 바꿀 수 있는 semantic을 만든다.

```text
장기적인 흐름
올해
○월
○월 ○일
이 시기
```

---

# 52. Event Timing Renderer는 이번 범위 아님

이번 P4-M은 semantic engine.

고객 문장 renderer를 새로 만들지 않는다.

---

# 53. 12절기월

Month는 반드시 기존 FILUNE 12절기월을 사용한다.

calendar month 금지.

---

# 54. Day engine readiness

P4-L에서 확인한 현재 Day 구현 상태를 그대로 따른다.

Day가:

```text
PARTIAL
```

이면 억지로 완성하지 않는다.

---

# 55. 권장 코드 위치

Repository convention을 확인한 뒤 가능하면:

```text
src/lib/eventTiming/
```

또는:

```text
src/lib/outcome/timing/
```

중 기존 계층과 가장 맞는 곳을 사용한다.

예:

```text
src/lib/eventTiming/types.ts
src/lib/eventTiming/eventTiming.ts
src/lib/eventTiming/contractPolicy.ts
src/lib/eventTiming/businessPolicy.ts
src/lib/eventTiming/index.ts
```

불필요한 파일 분할은 피한다.

---

# 56. 공개 API

권장:

```text
buildEventTiming(...)
```

또는 repository naming convention에 맞는 하나의 공통 entry point.

계약/사업별 외부 엔진을 따로 노출하지 않는다.

---

# 57. Input mutation 금지

Event Timing 계산으로:

```text
Canonical
Judgment
Luck snapshots
Money Outcome
Relationship Outcome
Health Outcome
```

mutation:

```text
0
```

---

# 58. Test — 계약 favorable

실제 기존 fixture에서
Master 15의 필수 gate가 모두 확인되는 사례가 있으면:

Expected:

```text
contract_favorable = confirmed
```

생활 의미까지 보존.

---

# 59. Test — generic favorable 차단

전체 Judgment가 favorable여도
계약-specific evidence가 없으면:

```text
contract_favorable = 0
```

---

# 60. Test — 계약 delay

source-supported delay 조건이 실제 확인되면:

```text
contract_delay = confirmed
```

---

# 61. Test — favorable + delay

가능한 실제 fixture에서:

```text
contract_favorable
+
contract_delay
```

동시 보존.

없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

허용.

---

# 62. Test — Business start

사건-specific gate 충족:

```text
business_start_favorable = confirmed
```

---

# 63. Test — Business generic 차단

generic favorable 구조만 있고
business-specific evidence가 없으면:

```text
business_start_favorable = 0
```

---

# 64. Test — Business delay

필수 조건 충족:

```text
business_start_delay
```

생성.

---

# 65. Test — Expansion

source-supported fixture에서:

```text
business_expansion_favorable
```

생성.

---

# 66. Test — Adjustment

source-supported fixture에서:

```text
business_adjustment
```

생성.

---

# 67. Test — Restructure

source-supported fixture에서:

```text
business_restructure
```

생성.

---

# 68. Test — Expansion / Adjustment 구분

동일 generic 상태를
무조건 expansion 또는 adjustment로 mapping하지 않는다.

---

# 69. Test — numeric scoring

검색:

```text
55
30
10
5
+85
timingScore
eventScore
weighted
ranking
```

Event Timing 계산에 사용된 건수:

```text
0
```

---

# 70. Test — Customer jargon

고객 노출 문자열에:

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

신규 추가:

```text
0
```

---

# 71. Test — Scope

각 EventTimingFact의:

```text
originScope
effective period
source scope
```

일치 확인.

---

# 72. Test — Expiry

기간 종료 후:

```text
currentlyEffective = false
```

현재 결과에서 active leakage:

```text
0
```

---

# 73. Test — Stable identity

같은 input 2회:

```text
same IDs
same event types
same certainty
same provenance
```

---

# 74. Test — Array order

upstream 배열 순서를 바꿔도 결과 semantic이 동일해야 한다.

---

# 75. Test — Orphan

```text
orphan EventTimingFacts = 0
```

---

# 76. Test — Unsupported invention

다음 0:

```text
evidence 없는 계약 성사
evidence 없는 사업 시작
evidence 없는 사업 확장
evidence 없는 최종 날짜
```

---

# 77. Test — Over-conservative suppression

다음 0:

```text
source-supported contract favorable → vague signal only
source-supported business start → generic opportunity only
confirmed year result suppressed because Month missing
confirmed Month result suppressed because Day missing
mixed timing → ambiguous collapse
```

---

# 78. Reading Assembly 연결

이번 단계에서 최소한 EventTimingFact가
Reading Assembly에서 소비 가능한 계약을 만든다.

기존 chapter 의미를 임의 변경하지 않는다.

---

# 79. 장 배치

Master 13과 P4-L 기준에 따라
기존 시기 관련 chapter에 연결한다.

새 chapter를 임의 생성하지 않는다.

---

# 80. Free / Premium

무료 범위에 유료 timing을 노출하지 않는다.

Expected:

```text
free timing leakage = 0
```

---

# 81. 기존 Money 결과와 중복 금지

Event Timing:

```text
돈을 벌 수 있음
```

자체를 다시 생성하지 않는다.

Money Outcome은 기존 Money layer의 책임.

Event Timing은:

```text
그 결과가 언제 현실화되기 쉬운가
```

에 집중한다.

---

# 82. Relationship 중복 금지

Event Timing이:

```text
관계 형성
```

자체를 새로 판단하지 않는다.

필요한 경우 기존 Relationship fact를 timing evidence로 사용한다.

---

# 83. Health 변경 금지

Health semantic changes:

```text
0
```

---

# 84. Judgment 변경 금지

이번 P4-M에서 새로운 Judgment rule 추가:

```text
0
```

필요한 Judgment Fact가 없다면:

```text
ENGINE_GAP
```

으로 보고한다.

Event Timing 통과를 위해 Judgment를 임의 수정하지 않는다.

---

# 85. 신규 검증 스크립트

권장:

```text
scripts/verify-event-timing-p4m.mjs
```

---

# 86. 회귀

반드시:

```text
Judgment 35/35
P2-A~G
P3-A~F
P4 주요 완료 회귀
P4-I/J Money
P4-K Health/Relationship
P4-L contract
```

가능한 현행 검증기 전부 PASS.

기대값 변경 금지.

---

# 87. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 88. 결과 파일

생성:

```text
src/docs/codex/p4m-event-timing-engine-batch1-result.md
```

---

# 89. 최종 보고 A — Architecture

```text
common Event Timing engine:
contract policy:
business policy:
Judgment direct dependency:
Outcome dependencies:
```

---

# 90. 최종 보고 B — Contract

```text
contract favorable:
contract delay:
contract finalization:
contract termination/restructure:
```

각각:

```text
IMPLEMENTED
PARTIAL
DEFERRED
ENGINE_GAP
NOT_TESTABLE
```

등 정확한 상태.

---

# 91. 최종 보고 C — Business

```text
business start favorable:
business start delay:
business expansion:
business adjustment:
business restructure:
```

---

# 92. 최종 보고 D — Scope

```text
Daewoon:
Sewoon:
Month:
Day:
```

현재 구현 상태와 실제 지원 결과.

---

# 93. 최종 보고 E — Provenance

```text
EventTimingFacts:
with provenance:
SOURCE_EXPLICIT:
SOURCE_INFERENCE:
FILUNE_APPROVED_OVERRIDE:
orphan:
duplicate IDs:
scope mismatch:
```

---

# 94. 최종 보고 F — Mixed

```text
contract favorable + delay:
business start favorable + delay:
expansion + adjustment:
restructure + later favorable:
```

각각 PASS / NOT_TESTABLE.

---

# 95. 최종 보고 G — Policy violations

```text
generic favorable → event invented:
confirmed result suppressed:
mixed collapsed:
numeric scoring:
customer Saju jargon:
unsupported exact date:
```

Expected 모두 0.

---

# 96. 최종 보고 H — Isolation

```text
Judgment changes:
Money semantic changes:
Health semantic changes:
Relationship semantic changes:
Personality changes:
Compatibility changes:
```

Expected 모두 0.

---

# 97. 최종 판정

다음을 충족하면:

```text
READY_FOR_EVENT_TIMING_AUDIT
```

판정한다.

```text
[ ] 공통 Event Timing Engine 구현
[ ] Contract / Business policy 분리

[ ] 계약 favorable 구현
[ ] 계약 delay 구현
[ ] generic favorable에서 계약 결과 발명 0

[ ] 사업 시작 favorable 구현
[ ] 사업 start delay 승인 범위 구현
[ ] 사업 expansion 구현
[ ] 사업 adjustment 구현
[ ] 사업 restructure 승인 범위 구현

[ ] SOURCE_INFERENCE gate 보존
[ ] event-specific Judgment evidence 없는 결과 발행 0

[ ] 상위/하위 시간 scope 기능 분리
[ ] 12절기월 유지
[ ] Day PARTIAL이면 연·월 결과 차단 0

[ ] 숫자 가중치 0
[ ] score/rank 0

[ ] source-supported 결과 vague signal로 축소 0
[ ] 한 축 deferred 때문에 확정 축 억제 0
[ ] mixed timing collapse 0
[ ] unsupported event invention 0

[ ] stable ID
[ ] provenance orphan 0
[ ] duplicate 0
[ ] expired leakage 0

[ ] 고객 명리 전문용어 신규 노출 0
[ ] free timing leakage 0

[ ] Judgment 의미 변경 0
[ ] Money 변경 0
[ ] Health 변경 0
[ ] Relationship 변경 0
[ ] Compatibility 변경 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 98. 다음 단계

P4-M이:

```text
READY_FOR_EVENT_TIMING_AUDIT
```

로 끝나면:

```text
P4-N Event Timing Integration Audit
```

로 이동한다.

P4-N에서는 실제:

```text
Birth Input
→ Canonical
→ Judgment
→ Domain Outcomes
→ Event Timing
→ Reading Assembly
```

경로에서:

```text
계약 favorable/delay
사업 start/expansion/adjustment/restructure
scope
lifecycle
provenance
free/premium boundary
```

를 통합 검증한다.

Day finalization이 P4-M에서 `ENGINE_GAP` 또는 `PARTIAL`이면
그 사실을 숨기지 않고 별도 후속 단계로 분리한다.