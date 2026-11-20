# FILUNE Codex P4-L
## Event Timing Source Contract
## 계약·사업 시작·확장·조정 시기

현재 완료 상태:

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
MONEY_OUTCOME_BATCH1_COMPLETE
```

이번 단계는 Event Timing Engine을 바로 구현하는 작업이 아니다.

먼저 전문가 풀이·행운 원자료·기존 FILUNE Judgment 계약을 대조하여 다음 사건의 **Source Contract**를 고정한다.

```text
계약 성사에 유리한 시기
계약이 지연되기 쉬운 시기
계약을 최종 확정하기 좋은 날짜

사업을 시작하기 유리한 시기
사업 실행이 지연되기 쉬운 시기
사업 확장에 유리한 시기
사업 확장보다 조정·정리가 유리한 시기
```

---

# 1. 최종 목표

성공:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
```

실패:

```text
EVENT_TIMING_SOURCE_RESEARCH_REQUIRED
```

---

# 2. 이번 작업에서 코드 구현 금지

이번 단계에서는:

```text
src/lib changes = 0
```

이어야 한다.

문서 감사와 Source Contract 작성만 한다.

---

# 3. 반드시 읽을 원자료

```text
src/docs/source/primary/04-행운론.md
src/docs/source/primary/07-사주풀이예시.md

대운, 세운, 월운, 일진 원자료

src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
```

그리고 현재:

```text
Money Outcome
Relationship Outcome
Health Outcome
Reading Assembly
```

계약도 확인한다.

---

# 4. 가장 중요한 원칙

Event Timing은 단순히:

```text
좋은 운
→ 좋은 날짜
```

로 계산하지 않는다.

반드시:

```text
원국 구조
+
현재 Judgment
+
해당 사건과 실제 관련된 기능
+
시간 scope의 현재 작용
```

을 연결해야 한다.

---

# 5. 사건별 판정이 필요하다

같은 시기라도:

```text
계약
사업 시작
사업 확장
관계
건강
```

결과는 다를 수 있다.

따라서:

```text
generic_good_period
```

하나로 모든 사건을 처리하지 않는다.

---

# 6. 시간 계층의 기능

원자료에서 확인되는 시간 계층의 의미를 정성적으로 정리한다.

내부 개념:

```text
Daewoon
→ 장기 환경 / 활동 무대 / 방향

Sewoon
→ 해당 연도의 주요 사건 현실화

Month
→ 사건이 집중되는 구간
→ 준비된 일이 구체적 결과로 나타나는 시기

Day
→ 서명·결정·발표·입금 등 최종 실행/확정 시점
```

---

# 7. 숫자 비중 사용 금지

원자료에 다음과 같은 비율·점수가 존재하더라도:

```text
55
30
10
5
+85
+25
```

FILUNE 엔진에 사용하지 않는다.

금지:

```text
timing score
weighted score
threshold
percentage
```

FILUNE v1에서는 qualitative structural evidence만 사용한다.

---

# 8. 낮은 scope가 높은 scope를 무조건 뒤집지 않는다

예:

```text
장기·연간 구조가 불리
+
하루가 유리
```

라고 해서:

```text
전체 시기 = favorable
```

로 바꾸지 않는다.

---

# 9. 하지만 하위 scope의 실질 효과는 보존한다

반대로:

```text
전체 흐름이 불리하니
좋은 하루의 계약 성사 가능성은 무시
```

해서도 안 된다.

원자료처럼:

```text
큰 흐름은 불리
BUT
특정 날짜에는 계약 성사·해결 가능
```

을 함께 보존할 수 있어야 한다.

---

# 10. Event Timing은 다축 결과다

최소 다음을 분리한다.

```text
eventOpportunity
eventDelayRisk
eventFinalization
eventExpansion
eventAdjustment
eventDisruption
```

한 개의 good/bad 값으로 합치지 않는다.

---

# 11. 계약 Event Type

최소 다음 계약을 연구한다.

```text
CONTRACT_FAVORABLE_WINDOW
CONTRACT_DELAY_WINDOW
CONTRACT_FINALIZATION_WINDOW
CONTRACT_TERMINATION_OR_RESTRUCTURE_WINDOW
```

실제 이름은 Source Contract 감사 후 확정한다.

---

# 12. 계약 성사 favorable

원자료가 지원하는 경우:

```text
이미 계약 관련 조건이 형성되어 있음
+
현재 흐름에서 필요한 기능이 작동
+
월 단위에서 현실화 조건 확인
```

이면:

```text
계약 성사에 유리한 시기
```

를 명확히 판정할 수 있다.

---

# 13. 계약 성사라는 결과를 지나치게 약화하지 않는다

금지:

```text
계약 관련 변화 가능성이 있습니다.
문서 관련 움직임이 있을 수 있습니다.
```

Source와 Engine evidence가 충분하면:

```text
계약이 성사되기 좋은 시기입니다.
```

수준까지 허용한다.

---

# 14. 계약 지연

원자료에서:

```text
상위 흐름은 유리
+
해당 월이 방해
→ 계약 지연
```

이 직접 설명된다.

따라서 source-supported 경우:

```text
CONTRACT_DELAY_WINDOW
```

을 별도 결과로 둘 수 있다.

---

# 15. 지연 ≠ 실패

반드시 구분:

```text
delay
≠
failure
```

예:

```text
계약은 성사 가능한 구조
+
이번 달에는 지연 가능
```

동시 존재 가능.

---

# 16. 계약 최종 확정일

원자료에서 일 단위는:

```text
계약서 서명
결정
발표
입금
```

같은 최종 발생 시점으로 사용된다.

따라서 source-supported 경우:

```text
CONTRACT_FINALIZATION_DAY
```

계열 semantic 후보를 허용한다.

---

# 17. 날짜 선택과 운 전체 판단 분리

좋은 날짜를 골랐다고:

```text
불리한 전체 흐름
→ favorable
```

로 바꾸지 않는다.

하지만 동일 행동을 해야 한다면
보다 원활한 실행 날짜를 좁힐 수 있는 계약은 허용한다.

---

# 18. 사업 시작 Event Type

최소:

```text
BUSINESS_START_FAVORABLE_WINDOW
BUSINESS_START_DELAY_WINDOW
```

연구.

---

# 19. 사업 시작은 실제 사건 Outcome

원자료에서:

```text
사업 시작
```

은 연도 단위 주요 현실 사건의 하나로 직접 제시된다.

따라서 source-supported 경우:

```text
사업 관련 움직임이 있습니다.
```

로 축소하지 않는다.

---

# 20. 사업 시작 favorable

Engine evidence와 source mapping이 충분하면:

```text
사업을 시작하기 좋은 시기
```

까지 판정 가능하게 한다.

---

# 21. 현재 사업 여부 추정 금지

사주만으로:

```text
현재 사업 중
사업 준비 중
창업할 예정
```

이라고 추정하지 않는다.

Renderer는 조건부 표현 가능:

```text
사업 시작을 준비하고 있다면,
이 시기는 실행에 유리합니다.
```

---

# 22. 사업 확장

원자료에서 좋은 장기·연간 흐름이 함께 작동하는 경우:

```text
매출
거래처
확장
```

등 실제 사업 확장 결과가 연결된다.

따라서:

```text
BUSINESS_EXPANSION_FAVORABLE_WINDOW
```

후보를 연구한다.

---

# 23. 확장 결과를 추상화하지 않는다

근거 충분 시:

```text
사업을 확장하기 좋은 시기
```

까지 표현한다.

금지:

```text
사업 관련 에너지가 좋습니다.
```

처럼 의미를 흐리는 표현.

---

# 24. 조정/정리 시기

원자료에서는:

```text
좋은 장기 흐름
+
불리한 해당 연도
```

와 같은 경우:

```text
추락보다 조정
성과보다 정비
```

로 해석한다.

따라서:

```text
BUSINESS_ADJUSTMENT_WINDOW
```

후보를 둔다.

---

# 25. 조정 시기 고객 결과

Source-supported 경우:

```text
지금은 무리하게 확장하기보다
기존 사업 구조를 정비하는 편이 유리한 시기
```

까지 표현할 수 있어야 한다.

---

# 26. 사업 형태 전환

충 등 실제 구조에서:

```text
사업 형태 변경
기존 거래 종료
수익 모델 전환
```

이 source-supported 경우:

```text
BUSINESS_RESTRUCTURE_WINDOW
```

후보로 분리한다.

---

# 27. 확장과 구조조정 동시 금지 아님

실제 구조에 따라:

```text
기존 방식 정리
+
새 방식 확장
```

이 순차적으로 함께 있을 수도 있다.

이를 단순:

```text
사업운 mixed
```

로 뭉개지 않는다.

---

# 28. Contract와 Business는 같은 사건이 아니다

예:

```text
사업 시작 favorable
```

이라고 해서 자동:

```text
모든 계약 favorable
```

로 만들지 않는다.

반대도 동일.

---

# 29. Domain Outcome 연계

Event Timing은 기존 Domain Outcome을 재사용할 수 있다.

예:

```text
Money acquisition
Money retention
Relationship partnership
Structural function
```

등.

하지만 Event Timing Layer에서
Money/Relationship Judgment를 새로 계산하지 않는다.

---

# 30. Work가 SOURCE_GAP인 점 주의

현재 Work Outcome이 미구현이라는 이유로
사업 시작 timing 전체를 막지 않는다.

원자료에서 직접 지원하고
현재 Judgment facts로 판정 가능한 subset은 별도로 구현 가능하다.

---

# 31. Work-specific 결과가 필요한 항목은 분리

예:

```text
승진
취업
이직
직위
```

은 이번 P4-L의 핵심 범위에서 제외 가능.

후속 Work source audit 대상으로 남긴다.

---

# 32. Event Timing Fact 계약

권장 구조를 연구한다.

예:

```text
EventTimingFact {
  id
  eventType
  direction
  scope
  start
  end
  certainty
  sourceOutcomeIds
  sourceJudgmentIds
  sourceLuckEffectIds
  currentlyEffective
  provenance
}
```

실제 schema는 기존 architecture와 맞춰 최소화한다.

이번 단계에서 코드 타입은 만들지 않는다.

---

# 33. eventType과 direction 분리

예:

```text
eventType = contract_finalization
direction = favorable
```

또는:

```text
eventType = contract_process
direction = delay
```

같은 구조를 검토한다.

---

# 34. Event Timing의 certainty

단순히:

```text
Day scope라서 certainty 낮음
```

같은 규칙을 만들지 않는다.

certainty는:

```text
source rule strength
current structural evidence
required condition satisfaction
```

으로 정한다.

---

# 35. Deferred 사용

진짜 필요한 evidence가 없을 때만:

```text
deferred
```

사용.

예:

```text
사업 시작 favorable = confirmed
구체 최종 날짜 = evidence 없음
```

이면:

```text
사업 시작 favorable confirmed
날짜 deferred
```

로 분리한다.

전체 결과를 deferred로 만들지 않는다.

---

# 36. Mixed Timing 허용

예:

```text
사업 시작 favorable
+
초기 계약 지연 risk
```

동시 가능.

또:

```text
계약 최종 확정 가능
+
장기 유지 조건은 약함
```

도 가능.

---

# 37. 고객 명리 용어 금지

고객 출력에서 다음 금지:

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

---

# 38. 내부 명리 용어는 유지

Engine / provenance / audit에서는 사용 가능.

---

# 39. 고객 시간 표현

내부:

```text
Daewoon
Sewoon
Month
Day
```

고객:

```text
장기적인 흐름
올해
○월
○월 ○일
이 시기
```

등으로 변환.

---

# 40. 고객 결과 예 — 계약

가능한 형태:

```text
올해는 중요한 계약을 현실화하기 좋은 흐름입니다.

특히 ○월에는 협의가 구체적인 결과로 이어지기 쉽고,
그 안에서도 서명이나 최종 결정을 진행하기 좋은 날짜를
더 좁혀볼 수 있습니다.
```

Source/Engine evidence가 충분한 경우.

---

# 41. 고객 결과 예 — 계약 지연

```text
계약 자체가 깨지는 흐름이라기보다,
○월에는 일정이나 조건 조율 때문에 진행이 늦어질 가능성이 큽니다.
```

실제 source mapping이 delay인 경우.

---

# 42. 고객 결과 예 — 사업 시작

```text
사업을 준비하고 있다면
올해는 계획을 실제 실행으로 옮기기 좋은 시기입니다.

그중 ○월은 준비보다 착수에 무게를 두기 좋습니다.
```

Source-supported 경우.

---

# 43. 고객 결과 예 — 조정

```text
올해는 무리하게 규모를 키우기보다
기존 사업 구조와 거래 방식을 정비하는 편이 유리합니다.
```

Source-supported 경우.

---

# 44. 숫자 점수 고객 노출 금지

```text
85점
55%
30%
10%
5%
```

등 모두 금지.

내부 Engine에도 이번 Event Timing contract의 계산값으로 사용하지 않는다.

---

# 45. “좋은 날” 단독 판단 금지

날짜 하나만 보고:

```text
계약하기 좋은 날
```

을 확정하지 않는다.

상위 흐름과 사건 주제가 이미 형성됐는지 확인한다.

---

# 46. 하지만 일 단위 실행 의미는 유지

상위 사건 조건이 형성되어 있다면
일 단위가:

```text
서명
확정
결정
입금
```

같은 최종 시점으로 작동하는 source 의미를 살린다.

---

# 47. 기존 12절기월 사용

Month scope는 기존 FILUNE:

```text
12절기월
```

계약을 그대로 따른다.

calendar month를 새로 만들지 않는다.

---

# 48. Day scope 현행 구현 상태 감사

현재 Judgment/Reading pipeline에
Day scope가 실제 어느 수준까지 구현되어 있는지 확인한다.

분류:

```text
IMPLEMENTED
PARTIAL
NOT_IMPLEMENTED
```

Source가 있다고 코드 구현까지 있다고 가정하지 않는다.

---

# 49. 계약 Finalization Day가 미구현이면

연·월 결과는 구현 가능하고:

```text
day = NOT_IMPLEMENTED
```

로 분리한다.

이 때문에 연·월 계약 결과를 막지 않는다.

---

# 50. 사업 Event도 동일

사업 시작 favorable year/month이 확인되면
Day-level start date 미구현 때문에 전체 결과를 보류하지 않는다.

---

# 51. Source provenance

각 Event Timing rule마다 반드시:

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
SOURCE_CONFLICT
DEFERRED
```

중 하나를 기록한다.

---

# 52. 숫자 비율 처리

원자료의 수치 비율은:

```text
SOURCE_EXPLICIT
```

이지만 FILUNE에서는:

```text
FILUNE_APPROVED_OVERRIDE:
numeric weighting not used
```

로 명시한다.

---

# 53. Timing hierarchy 자체

반면 다음은 Source Contract에 사용할 수 있다.

```text
long-term environment
annual event realization
monthly concretization
daily finalization
```

---

# 54. Contract Source Table

최종 보고에 작성:

| Event | Trigger | Supporting Scope | Blocking/Delay Condition | Result | Provenance |
|---|---|---|---|---|---|

최소:

```text
contract favorable
contract delay
contract finalization
contract termination/restructure
```

---

# 55. Business Source Table

최소:

```text
business start
business start delay
business expansion
business adjustment
business restructure
```

---

# 56. Evidence Gap Table

각 결과에 필요한데 현재 source/engine에서 부족한 항목을 기록한다.

```text
SOURCE_GAP
ENGINE_GAP
FIXTURE_GAP
```

구분.

---

# 57. 보수적 축소 감사

다음 건수 산출:

```text
source-supported contract result weakened to vague signal
source-supported business result weakened to vague signal
confirmed year result suppressed because month/day unavailable
mixed timing collapsed
```

목표:

```text
0
0
0
0
```

---

# 58. 과잉 발명 감사

```text
unsupported contract event
unsupported business event
unsupported exact date
unsupported numeric score
```

목표:

```text
0
0
0
0
```

---

# 59. Customer terminology contract

최종 문서에 명시:

```text
internal Saju terminology allowed
customer Saju terminology prohibited
```

---

# 60. 결과 문서

생성:

```text
src/docs/rules/master/15-event-timing-spec.md
```

이 문서는 Event Timing의 새 master가 된다.

---

# 61. 감사 결과 파일

생성:

```text
src/docs/codex/p4l-event-timing-source-contract-result.md
```

---

# 62. 기존 master 변경

필요하면:

```text
13-reading-assembly-spec.md
14-outcome-semantic-spec.md
```

와의 연결점만 기록한다.

이번 단계에서 기존 의미를 광범위하게 수정하지 않는다.

---

# 63. 코드 변경 없음

반드시:

```text
src/lib changes = 0
```

---

# 64. 최종 보고 A — Timing Hierarchy

```text
long-term environment:
annual realization:
monthly concretization:
daily finalization:
numeric weighting:
```

---

# 65. 최종 보고 B — Contract

```text
contract favorable:
contract delay:
contract finalization:
contract termination/restructure:
```

각각:

```text
SOURCE_EXPLICIT
SUPPORTED_INFERENCE
DEFERRED
SOURCE_GAP
```

등으로 분류.

---

# 66. 최종 보고 C — Business

```text
business start:
business delay:
business expansion:
business adjustment:
business restructure:
```

---

# 67. 최종 보고 D — Engine Readiness

```text
Natal:
Daewoon:
Sewoon:
Month:
Day:
```

각 scope의 현재 구현 상태.

---

# 68. 최종 보고 E — Customer Language

```text
direct Saju jargon:
numeric score:
vague structural-only language:
```

Expected:

```text
0
0
0
```

---

# 69. 최종 보고 F — Gaps

```text
SOURCE_GAP:
ENGINE_GAP:
FIXTURE_GAP:
CONFLICT:
```

정확히 구분한다.

---

# 70. 최종 판정

다음 조건을 만족하면:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
```

판정한다.

조건:

```text
[ ] 계약 favorable source contract 확정
[ ] 계약 delay source contract 확정
[ ] 계약 finalization source contract 확정 또는 Day engine gap 분리

[ ] 사업 start source contract 확정
[ ] 사업 expansion source contract 확정
[ ] 사업 adjustment source contract 확정
[ ] 사업 restructure source contract 확인

[ ] 시간 계층의 역할 고정
[ ] 숫자 가중치 사용 0

[ ] 상위 흐름과 하위 실행 시점 분리
[ ] 하위 scope가 상위 scope를 무조건 덮지 않음
[ ] 하위 scope의 실제 단기 효과도 삭제하지 않음

[ ] 확정 가능한 연/월 결과를 Day 미구현 때문에 숨기지 않음
[ ] mixed timing 유지

[ ] 고객 명리 용어 노출 0
[ ] vague structural-only 축소 0
[ ] unsupported 결과 발명 0

[ ] src/lib changes 0
```

---

# 71. 다음 단계

`EVENT_TIMING_SOURCE_CONTRACT_READY`가 나오면 다음은:

```text
P4-M Event Timing Engine — Contract & Business Batch 1
```

이다.

구현 우선순위:

```text
1. 계약 성사 favorable / delay
2. 사업 시작 favorable / adjustment
3. 사업 expansion / restructure
4. Month timing
5. Day finalization
```

단 Day scope가 현재 Engine gap이면
1~4를 먼저 구현하고 Day는 별도 후속으로 분리한다.