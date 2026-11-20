# FILUNE Codex P4-M.1
## Event Evidence Mapping Contract
## 계약·사업 사건별 Judgment 근거 매핑

현재 상태:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
P4M_FIX_REQUIRED
```

P4-M 실패 원인:

```text
ENGINE_GAP
```

Master 15는 사건 의미와 시간 계층을 승인했지만,
현재 Judgment 결과에는 계약·사업 사건별로 직접 사용할 수 있는
`event-specific evidence` 계약이 없다.

따라서 generic favorable 흐름이나
특정 십성 하나만으로 EventTimingFact를 생성하면 안 된다.

이번 단계는 **기존 Judgment 결과를 사건별 Evidence로 번역하는 Mapping Contract를 고정**한다.

이번 단계에서는 Event Timing Engine을 구현하지 않는다.

---

# 1. 최종 목표

성공:

```text
EVENT_EVIDENCE_MAPPING_READY
```

실패:

```text
EVENT_EVIDENCE_SOURCE_GAP
```

---

# 2. 코드 수정 금지

이번 작업:

```text
src/lib changes = 0
```

문서·감사만 수행한다.

---

# 3. 반드시 읽을 기준

```text
src/docs/rules/master/01-pattern-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4l-event-timing-source-contract-result.md
src/docs/codex/p4m-event-timing-engine-batch1-result.md

src/docs/source/primary/04-행운론.md
src/docs/source/primary/07-사주풀이예시.md
```

그리고 실제 현재 Judgment output schema/code를 읽는다.

---

# 4. 핵심 설계

새로운 명리 Judgment를 만들지 않는다.

구조:

```text
Existing Judgment Facts
+
Existing Relations
+
Existing Role / CurrentFunction
+
Existing OutcomeFacts
↓
Event Evidence Mapping
↓
EventEvidenceFact
↓
Event Timing Engine
```

즉:

```text
Judgment
→ EventEvidenceAdapter
→ EventTiming
```

구조로 설계한다.

---

# 5. Judgment 자체에 사건명을 억지로 넣지 않는다

기존 Judgment가:

```text
contract_favorable
business_start
```

를 직접 생성하도록 구조를 오염시키지 않는다.

Judgment는 명리 구조를 판정하고,
EventEvidenceAdapter가 그 구조를 현실 사건 근거로 번역한다.

---

# 6. EventEvidenceFact 후보

권장 개념:

```text
EventEvidenceFact {
  id
  eventDomain
  functionType
  direction
  sourceType

  sourceJudgmentIds
  sourceRelationIds
  sourceRoleIds
  sourceOutcomeIds

  originScope
  currentlyEffective
  certainty
  provenanceClass
}
```

이번 단계에서는 코드 타입을 만들지 않는다.

---

# 7. Event Domain

최소:

```text
contract
business_start
business_expansion
business_adjustment
business_restructure
```

---

# 8. Function Type

예:

```text
supports
blocks
delays
destabilizes
protects
activates
finalizes
```

실제 source를 감사한 뒤 필요한 값만 확정한다.

---

# 9. 단일 십성 shortcut 금지

다음은 금지한다.

```text
印 → contract favorable
食傷 → business start
財 → business expansion
官 → contract favorable
沖 → business restructure
```

모두 구조와 현재 기능을 확인해야 한다.

---

# 10. 계약 Evidence — 인성

원자료에서 印은:

```text
문서
계약
학문
자격
```

과 연결될 수 있다.

하지만:

```text
印 exists
→ contract_support
```

는 금지한다.

반드시 현재 기능을 본다.

---

# 11. 印이 계약을 지원하는 경우

전문가 사례에서 印이:

```text
현재 유효
보호됨
필요한 구조적 기능을 수행
```

하고 실제 문서·계약 유리와 연결된 경우를 수집한다.

그 경우에만:

```text
contract_document_support
```

후보로 매핑한다.

---

# 12. 印이 계약을 방해하는 경우

전문가 사례에서:

```text
偏印奪食
印이 필요한 食神을 손상
```

하면서:

```text
잘못된 계약
문서 문제
먹고사는 길 방해
```

로 해석되는 사례를 별도 매핑한다.

후보:

```text
contract_document_obstruction
```

---

# 13. 印 손상

운 전체가 다른 면에서는 좋아도
印이 실제 손상되어:

```text
문서계약 불리
```

라고 판정된 사례를 별도 근거로 등록한다.

즉:

```text
overall favorable
+
contract negative evidence
```

동시 가능.

---

# 14. 정관/관성 — 계약 Evidence

전문가 사례에서 관성이 흔들리면서:

```text
직장
계약
자리
제도
```

문제가 함께 나타나는 경우를 조사한다.

단:

```text
官 exists
→ contract
```

로 일반화하지 않는다.

---

# 15. 官 손상과 계약

실제 사례에서:

```text
官 current function damaged
```

가 계약 불리와 직접 연결되는 경우만:

```text
contract_institutional_instability
```

후보로 등록한다.

---

# 16. 合과 계약

원자료에는:

```text
좋은 흐름에서 합
→ 현실적인 관계나 계약으로 묶임
```

설명이 존재한다.

하지만:

```text
任何 合
→ 계약 성사
```

금지.

반드시:

```text
무엇이 합하는가
그 글자의 현재 구조적 역할
합 이후 기능
```

을 확인한다.

---

# 17. 合去와 계약 방해

전문가 사례에서:

```text
필요한 용신/기능이 합거됨
→ 계약이나 마땅히 얻을 결과를 못 가져감
```

으로 해석되는 경로를 별도 등록한다.

후보:

```text
contract_support_function_stopped
```

---

# 18. 계약 Evidence 표

최소 다음 후보를 source audit한다.

```text
document_support
document_obstruction
institutional_support
institutional_instability
support_function_stopped
binding/finalization_support
contract_dispute_or_trouble
```

각 항목은:

```text
SUPPORTED
CONDITIONAL
SOURCE_GAP
REJECTED
```

중 하나로 분류한다.

---

# 19. 계약 favorable gate

`contract_favorable` EventTiming을 만들려면
최소 하나의 **positive contract evidence**가 필요하다.

generic favorable만으로 발행 금지.

예:

```text
overall favorable
+
contract evidence 없음
→ no contract event
```

---

# 20. 계약 negative gate

마찬가지:

```text
overall unfavorable
```

만으로:

```text
contract_delay
contract_failure
```

생성 금지.

계약-specific negative evidence가 필요하다.

---

# 21. 사업 시작 Evidence — 食傷

원자료에서 食傷은:

```text
활동
표현
생산
결과
사업
```

과 연결된다.

하지만:

```text
食傷 exists
→ business_start
```

금지.

---

# 22. 食傷의 현재 기능

사업 시작 Evidence 후보가 되려면:

```text
현재 operating
stopped 아님
필요한 구조를 훼손하는 방향이 아님
```

등 source-supported current function을 확인한다.

---

# 23. 사업 시작과 재성

사업이라는 현실 사건이:

```text
활동/생산
→ 현실적 결과
```

까지 이어지는 구조인지 조사한다.

예:

```text
食傷生財
```

등이 실제 사업 실행/성과와 연결되는 전문가 사례를 별도 수집한다.

하지만:

```text
食傷生財
→ 무조건 창업
```

금지.

---

# 24. 사업 시작과 난제

예:

```text
사업 활동 가능
+
해로운 살/병 경로 활성
```

이면:

```text
business_start_support
+
business_difficulty
```

동시 Evidence 가능.

이를 하나의 favorable/unfavorable로 합치지 않는다.

---

# 25. 사업 확장 Evidence

원자료의 실제 사례에서:

```text
성과
돈
거래처
외부 활동 확대
```

등이 동반될 때
사업 확장으로 판정한 조건을 수집한다.

---

# 26. 사업 확장과 재성

재성이 살아난다는 사실만으로:

```text
business_expansion
```

자동 생성 금지.

실제 source가:

```text
재성 기능
+
사업 활동 기능
+
현재 구조
→ 확장
```

으로 연결하는 사례가 있어야 한다.

---

# 27. 확장 가능 + 금전 문제 동시

전문가 사례처럼:

```text
사업 확장 가능
+
내부 금전 문제
```

가 동시에 존재할 수 있다.

Event Evidence에서 둘 다 보존한다.

---

# 28. 사업 Adjustment Evidence

다음 유형의 source를 조사한다.

```text
확장보다 보수 운영
성과보다 정비
필요 없는 것 정리
다음 상승 준비
```

이를 만드는 structural evidence를 추출한다.

---

# 29. Generic bad flow로 Adjustment 만들지 않는다

금지:

```text
overall unfavorable
→ business_adjustment
```

사업 관련 기능이 실제로 affected되어야 한다.

---

# 30. 사업 Restructure Evidence

원자료의 충 사례에서:

```text
기존 거래 종료
사업 방식 변경
상품 변경
동업 관계 변경
수익 형태 변경
```

이 명시된다.

하지만:

```text
沖 exists
→ business_restructure
```

금지.

---

# 31. Restructure gate

최소:

```text
실제 유효한 충/변화 relation
+
사업 관련 기능/Outcome과 연결
+
현재 scope에서 작동
```

이 필요하다.

---

# 32. 충의 방향성

기존 FILUNE 원칙 유지:

```text
충 자체 = good/bad 아님
```

무엇을 깨뜨리는지가 중요하다.

---

# 33. 나쁜 구조를 깨는 충

실제 harmful structure를 깨는 경우:

```text
restructure
+
improvement direction
```

가능.

---

# 34. 좋은 구조를 깨는 충

필요한 사업 기능을 깨는 경우:

```text
restructure
+
disruption
```

가능.

---

# 35. 사업 Evidence 후보

최소 다음을 감사한다.

```text
business_activity_support
business_result_support
business_money_support
business_external_expansion
business_execution_obstruction
business_financial_constraint
business_adjustment_need
business_restructure_trigger
```

---

# 36. Money Outcome 활용

기존:

```text
money_acquisition
money_retention
money_division_or_outflow
money_related_difficulty
```

를 Event Evidence로 사용할 수 있는 조건을 명시한다.

단:

```text
money_acquisition
→ business expansion
```

자동 mapping 금지.

---

# 37. Relationship Outcome 활용

기존:

```text
partnership formation
relationship pressure
```

등을 사업/계약 Evidence로 사용할 수 있는 조건을 조사한다.

동업/협력 맥락이 source에서 실제 확인된 경우만 사용.

---

# 38. 사건별 Evidence가 없는 경우

정확히:

```text
ENGINE_GAP
```

또는:

```text
SOURCE_GAP
```

으로 남긴다.

generic role로 메우지 않는다.

---

# 39. 기존 Judgment facts 재사용 가능성

현재 Judgment 출력에서 실제로 재사용 가능한 항목을 전수 조사한다.

예:

```text
RelationFact
FormulaFact
ActualStructuralFunction
RoleHistory
CurrentFunction
PatternContext
LuckEffect
RootState
Capacity
Formation
```

각 event evidence에 어떤 입력이 필요한지 표로 만든다.

---

# 40. 새 Judgment rule 필요 여부

각 매핑마다:

```text
existing Judgment sufficient
```

또는:

```text
new Judgment fact required
```

를 구분한다.

---

# 41. 가급적 Event Adapter에서 해결

기존 Judgment 정보로 충분하다면
Judgment를 변경하지 않고:

```text
EventEvidenceAdapter
```

에서 해결하는 방향을 우선한다.

---

# 42. Judgment 확장이 정말 필요한 경우

현재 구조적 사실 자체가 출력되지 않아
event mapping이 불가능한 경우에만:

```text
JUDGMENT_FACT_GAP
```

으로 명시한다.

이번 단계에서 코드는 수정하지 않는다.

---

# 43. 출처 분류

모든 mapping을:

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
SOURCE_CONFLICT
DEFERRED
```

로 분류한다.

---

# 44. SOURCE_INFERENCE 제한

특히:

```text
사업 시작
계약 지연
```

은 P4-L에서 승인한 제한적 SOURCE_INFERENCE 상태를 유지한다.

임의로 SOURCE_EXPLICIT로 올리지 않는다.

---

# 45. 숫자 점수 제외

원자료 수치식:

```text
55 / 30 / 10 / 5
```

은 mapping evidence로 사용하지 않는다.

---

# 46. 결과 문서

새 Master를 만들지 말고 우선:

```text
src/docs/rules/master/15-event-timing-spec.md
```

에 `Event Evidence Mapping Contract` 절을 추가한다.

기존 Event 의미를 바꾸지 않는다.

---

# 47. 결과 파일

생성:

```text
src/docs/codex/p4m1-event-evidence-mapping-contract-result.md
```

---

# 48. 필수 Mapping Matrix

반드시 다음 표를 만든다.

| Event Evidence | Required Judgment Facts | Required Current Function | Blocking Conditions | Source Status | Engine Ready |
|---|---|---|---|---|---|

계약:

```text
contract support
contract obstruction
contract instability
contract binding/finalization
contract dispute
```

사업:

```text
business activity support
business start support
business expansion support
business adjustment need
business restructure
business execution obstruction
```

---

# 49. 필수 Source 사례 표

각 mapping마다 실제 전문가 사례를 연결한다.

최소:

```text
source location
original interpretation
structural path
event meaning
mapping strength
```

---

# 50. 반례 표

특히 반드시 작성:

```text
印이 있으나 계약에 불리한 사례
食傷이 있으나 사업에 불리한 사례
재물이 살아도 계약은 불리한 사례
사업 확장 가능하지만 금전 문제도 있는 사례
충이 있어도 개선이 아닌 손상인 사례
```

이 표가 없으면 완료 판정 금지.

---

# 51. Generic Shortcut Audit

다음 shortcut이 0인지 확인한다.

```text
印 → 계약 favorable
官 → 계약 favorable
合 → 계약 성사
食傷 → 사업 시작
財 → 사업 확장
沖 → 사업 구조변경
generic favorable → 모든 사건 favorable
```

---

# 52. 최종 판정

다음을 만족하면:

```text
EVENT_EVIDENCE_MAPPING_READY
```

판정한다.

```text
[ ] 계약 positive/negative evidence mapping 확정
[ ] 사업 start/expansion/adjustment/restructure mapping 확정

[ ] 단일 십성 shortcut 0
[ ] generic favorable shortcut 0
[ ] generic unfavorable shortcut 0

[ ] 반례까지 포함
[ ] source status 구분
[ ] 현재 Judgment 재사용 가능 입력 확인
[ ] JUDGMENT_FACT_GAP 분리
[ ] ENGINE_GAP 분리

[ ] 숫자 score 사용 0
[ ] src/lib changes 0
```

---

# 53. 다음 단계

`EVENT_EVIDENCE_MAPPING_READY`이면:

```text
P4-M.2 Event Evidence Adapter + Event Timing Engine
```

로 이동한다.

이때 기존 실패한 P4-M을 바로 재실행하지 않고,
먼저 EventEvidenceAdapter를 구현한 다음
Event Timing Engine을 연결한다.

P4-M.2가 끝난 뒤 기존 P4-M의 검증 계약을 다시 적용한다.