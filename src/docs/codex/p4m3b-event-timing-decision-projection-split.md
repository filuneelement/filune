# FILUNE Codex P4-M.3B
## Event Timing Decision / Calendar Projection Split

현재 상태:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
EVENT_EVIDENCE_MAPPING_READY
READY_FOR_EVENT_TIMING_AUDIT

P4-M.3:
EVENT_TIMING_FIXTURE_GAP_REMAINS

P4-M.3A:
SOURCE_SNAPSHOT_FIXTURE_GAP_REMAINS
```

두 번의 fixture 감사 결과,
문제는 source의 사건 의미 부족이 아니라
현재 Event Timing 구조가 다음 두 책임을 한 객체에서 동시에 요구하는 데 있다.

```text
1. 명리적으로 어떤 사건 방향이 성립하는가
2. 그 사건을 실제 Gregorian 기간에 어디에 배치할 것인가
```

전문가 원자료에는 다음이 존재한다.

```text
원국 명식
대운/세운 등 명리 scope
현재 구조 작용
실제 계약·사업 결과
```

그러나 모든 사례에:

```text
Gregorian birth datetime
정확한 대운 시작일
절입 기준 start/end timestamp
```

가 존재하는 것은 아니다.

따라서 사건의 **semantic decision**과
Gregorian **calendar projection**을 분리한다.

---

# 1. 최종 목표

성공:

```text
EVENT_TIMING_DECISION_PROJECTION_SPLIT_READY
```

실패:

```text
P4M3B_FIX_REQUIRED
```

---

# 2. 가장 중요한 설계 변경

현재 개념:

```text
EventEvidenceFact
↓
EventTimingFact
```

을 다음으로 분리한다.

```text
EventEvidenceFact
↓
EventTimingDecision
↓
Calendar Projection
↓
EventTimingFact
```

---

# 3. 각 계층의 책임

## EventEvidenceFact

기존 Judgment / Outcome에서
사건과 관련된 구조적 근거를 번역한다.

예:

```text
contract_document_obstruction
business_expansion_support
business_adjustment_need
```

---

## EventTimingDecision

다음을 판정한다.

```text
어떤 사건인가
유리/지연/조정/변경 중 무엇인가
어느 명리 scope에서 성립하는가
현재 유효한가
확정도는 무엇인가
어떤 Evidence를 근거로 하는가
```

Gregorian 날짜는 필수 아님.

---

## EventTimingFact

Production calendar 정보가 존재할 때
Decision을 실제 사용자 시간 구간에 투영한다.

예:

```text
2027-02-04T...
~
2027-03-06T...
```

등.

---

# 4. EventTimingDecision 후보 구조

repository convention에 맞춰 최소화한다.

개념 예:

```text
type EventTimingDecision = {
  id: string

  eventType: EventTimingEventType
  result: EventTimingResult

  originScope: LuckScope
  scopeGanZhi?: string

  certainty: Certainty
  provenanceClass: ProvenanceClass

  sourceEvidenceIds: string[]

  currentlyEffective: boolean
}
```

Gregorian start/end를 넣지 않는다.

---

# 5. 명리 scope identity

source-backed regression에서는 다음과 같은 정보만으로도
Decision을 검증할 수 있어야 한다.

예:

```text
originScope = sewoon
scopeGanZhi = 丙午
parentScopeGanZhi = 庚戌
```

또는:

```text
originScope = sewoon
scopeGanZhi = 甲辰
parentScopeGanZhi = 己酉
```

원자료에 존재하는 범위만 기록한다.

---

# 6. Gregorian 날짜 역산 금지

절대 금지:

```text
사주 네 기둥 → 출생일 역산
대운 간지 → 대운 시작 날짜 추정
갑진년이라는 이유만으로 임의 start/end 생성
source에 없는 월/일 생성
```

---

# 7. GanZhi scope ≠ Gregorian interval

다음을 분리한다.

```text
甲辰 세운
```

이라는 명리 scope identity와:

```text
2024-02-04T...
~
2025-02-03T...
```

같은 실제 서비스용 interval은 별도 정보다.

Source regression에서는 전자만 있어도 semantic decision을 검증할 수 있다.

---

# 8. Production에서는 기존 날짜 계산 유지

실제 사용자 BirthInput 경로:

```text
BirthInput
→ Canonical
→ Luck scopes
→ Judgment
→ EventEvidence
→ EventTimingDecision
→ Calendar Projection
→ EventTimingFact
```

기존 12절기월과 실제 기간 계산을 그대로 사용한다.

---

# 9. Source-backed regression 경로

전문가 사례:

```text
Source-backed Judgment Snapshot
→ EventEvidenceAdapter
→ EventTimingDecision
```

까지만 필수로 검증한다.

Gregorian interval이 없다는 이유로
Decision 검증을 실패시키지 않는다.

---

# 10. Source regression과 Production integration 분리

두 레인을 독립 검증한다.

## Semantic Regression

```text
source case
→ Judgment snapshot
→ Evidence
→ Decision
```

목적:

```text
명리 의미가 맞게 매핑되는가
```

## Calendar Integration

```text
BirthInput
→ Canonical
→ Judgment
→ Evidence
→ Decision
→ EventTimingFact
```

목적:

```text
실제 사용자 달력 구간에 정확히 배치되는가
```

---

# 11. 둘 중 하나로 다른 하나를 대체하지 않는다

Semantic regression PASS가
Production calendar integration PASS를 의미하지 않는다.

반대도 마찬가지다.

---

# 12. 실제 source-backed Contract negative case

반드시 다음 전문가 사례를 fixture 후보로 사용한다.

원자료:

```text
임술년 을사월 임자일 병오시 남성
경술대운 병오년

재성은 살아남
→ 부를 취할 조건

인성은 손상
→ 문서계약·승진·시험 불리
```

Expected Decision 의미:

```text
money favorable preserved
contract support NOT emitted
contract obstruction / unfavorable evidence preserved
```

정확한 canonical event type은 Master 15를 따른다.

---

# 13. 해당 사례의 핵심

반드시 다음을 검증한다.

```text
overall favorable
≠
contract favorable
```

즉:

```text
재물을 취할 수 있음
+
문서계약은 불리
```

가 동시에 보존되어야 한다.

---

# 14. 두 번째 Contract source case

원자료:

```text
기유대운 갑진년
부동산 계약 손해

세운 정인 등장
BUT
합으로 인성 손상
+
재성 활성
→ 계약/돈/문서 문제
```

이를 source-backed negative regression으로 검토한다.

---

# 15. Contract shortcut 금지 회귀

위 사례를 통해 최소 다음을 차단한다.

```text
印이 등장
→ contract favorable

재물이 살아남
→ contract favorable

좋은 운
→ contract favorable
```

Expected:

```text
0
```

---

# 16. Business source-backed case 탐색

P4-M.1에서 사용한 실제 사업 사례를 다시 확인한다.

우선순위:

```text
실제 업체 성장
사업 확장
거래처 증가
사업 형태 변경
확장보다 정비
```

원자료에서 명식 + 해당 운 scope + 구조 경로가 함께 확인되는 사례를 사용한다.

---

# 17. Business positive case

실제 source에서 사업 성장이 확인되고
필요한 Judgment path가 reconstructable이면:

```text
business_expansion_favorable Decision
```

을 source-backed regression으로 검증한다.

---

# 18. Business source case가 불충분하면

억지로 만들지 않는다.

```text
SOURCE_CASE_GAP
```

으로 기록한다.

단 Event Timing Engine implementation 자체와
source-backed contract negative regression은 계속 검증한다.

---

# 19. Contract fixture와 Source fixture 구분

두 종류의 테스트를 허용한다.

## Source Fixture

실제 전문가 사례.

```text
SOURCE_BACKED
```

## Contract Fixture

Master 15에 확정된 rule prerequisites를
최소 구조로 구성한 unit fixture.

```text
CONTRACT_TEST_ONLY
```

이는 실제 사람 사례라고 주장하지 않는다.

---

# 20. Contract fixture의 목적

예:

```text
required contract support evidence
+
all blocking conditions false
```

를 구성하여:

```text
contract_favorable Decision
```

코드 경로가 실제 존재하는지 검증할 수 있다.

이 expected는 Master 15에서 가져온다.

새 명리 규칙이 아니다.

---

# 21. Contract fixture 금지 사항

다음 금지:

```text
실제 전문가 사례라고 표시
source-backed라고 표시
원자료 적중 사례로 집계
고객 사례로 재사용
```

---

# 22. Contract positive path

현재 source-backed positive 사례가 부족해도
Master 15의 engine-ready mapping을 위한
`CONTRACT_TEST_ONLY` fixture로:

```text
contract_favorable
```

positive branch 실행을 검증한다.

---

# 23. Business positive path

동일하게 Master 15 engine-ready mapping에 대해:

```text
business_start_favorable
business_expansion_favorable
```

등 실제 구현 branch를 contract test로 검증할 수 있다.

---

# 24. 이렇게 두 테스트를 분리하는 이유

```text
source-backed regression
= 해석 의미 검증

contract fixture
= 코드 분기 실행 검증

production BirthInput fixture
= 실제 wiring 검증
```

세 가지 역할이 다르다.

---

# 25. 모든 positive code path가 최소 한 번 실행되어야 함

Master 15에서:

```text
Engine Ready = yes
```

인 mapping 중 구현된 branch는
최소 하나의 테스트에서 실행되어야 한다.

가능한 종류:

```text
SOURCE_BACKED
또는
CONTRACT_TEST_ONLY
```

---

# 26. Test coverage 보고

각 mapping row마다:

| Mapping | Source fixture | Contract fixture | Production fixture | Status |
|---|---|---|---|---|

을 작성한다.

---

# 27. EventTimingFact 생성 조건

EventTimingDecision이 존재해도
calendar interval을 resolve할 수 없다면:

```text
Decision = confirmed
TimingFact = not_projectable
```

가능하게 한다.

---

# 28. not_projectable은 의미 불확실성이 아님

다음을 구분한다.

```text
semantic certainty
≠
calendar projection availability
```

예:

```text
contract obstruction = confirmed
calendar interval = unavailable
```

가능.

---

# 29. 새 상태 후보

필요하다면 calendar projection에:

```text
projected
not_projectable
```

또는 repository convention에 맞는 상태를 사용한다.

이는 Event semantic certainty를 낮추지 않는다.

---

# 30. Deferred 남용 금지

금지:

```text
Gregorian interval 없음
→ EventTimingDecision deferred
```

semantic evidence가 확정이면 Decision은 confirmed를 유지한다.

---

# 31. 실제 Production 사용자에서는 projection 필수

사용자에게:

```text
올해
3월
4월 12일
```

등을 보여주려면
Production pipeline의 실제 interval을 사용해야 한다.

source fixture의 GanZhi label을
그대로 고객 날짜로 변환하지 않는다.

---

# 32. Customer output 경계

Source-backed semantic fixture의:

```text
庚戌大運
丙午年
甲辰年
```

같은 내부 표현을
고객 renderer의 날짜 출력에 직접 사용하지 않는다.

---

# 33. 기존 EventEvidenceAdapter 유지

P4-M.2에서 구현한 EventEvidenceAdapter의
semantic rule은 변경하지 않는다.

필요한 변경은:

```text
Decision layer 추가
Projection 책임 분리
```

에 한정한다.

---

# 34. 기존 Master 15 의미 변경 금지

```text
event mapping semantics = unchanged
```

---

# 35. Judgment 변경 금지

```text
src/lib/judgment semantic changes = 0
```

---

# 36. Money / Health / Relationship 변경 금지

각각:

```text
0
```

---

# 37. EventTimingFact stable ID

Projected Fact ID는:

```text
Decision identity
+
resolved interval identity
```

를 기반으로 현행 deterministic convention에 맞춘다.

동일 projection은 동일 ID.

---

# 38. Decision stable ID

EventTimingDecision ID는 Gregorian timestamp를 필요로 하지 않는다.

최소:

```text
event type
origin scope
scope identity
source evidence IDs
```

등 semantic identity로 결정한다.

---

# 39. 같은 Decision을 여러 장에서 표시

CH-08/09/10에서 같은 Decision/Fact를 사용해도
semantic ID를 새로 만들지 않는다.

---

# 40. Source-backed regression A

`경술대운 병오년` 사례에서:

Expected:

```text
EventEvidence > 0
EventTimingDecision > 0

money positive preserved
contract positive NOT invented
contract negative/obstruction preserved
```

---

# 41. Source-backed regression B

`기유대운 갑진년 부동산 계약 손해` 사례:

Expected:

```text
contract-related negative Decision > 0
```

Master 15 canonical event가 지원하는 범위까지만.

---

# 42. Business source regression

실제 업체 성장 사례를 검토한다.

source에 필요한 current structural path가 충분하면:

```text
business positive Decision > 0
```

부족하면:

```text
SOURCE_CASE_GAP
```

을 유지.

---

# 43. Contract positive unit test

Master 15의 engine-ready positive mapping을
`CONTRACT_TEST_ONLY` fixture로 검증.

Expected:

```text
contract_favorable Decision = 1+
```

---

# 44. Business positive unit test

Engine-ready business positive mapping을
`CONTRACT_TEST_ONLY` fixture로 검증.

Expected:

```text
business positive Decision = 1+
```

---

# 45. Generic shortcut negative tests 유지

기존 P4-M.2의 4개 BirthInput fixture:

```text
false positive = 0
```

계속 통과.

---

# 46. Production projection regression

기존 실제 BirthInput pipeline에서
Decision이 없으면 TimingFact도 0이어도 된다.

목적은:

```text
no crash
no mutation
no false positive
calendar pipeline valid
```

검증이다.

---

# 47. 향후 실제 positive BirthInput 사례가 생기면

그때:

```text
Decision
→ Projection
→ TimingFact
```

positive production regression을 추가한다.

현재 source에 없는 생년월일을 만들어서 채우지 않는다.

---

# 48. 신규 검증 스크립트

권장:

```text
scripts/verify-event-timing-decision-projection-p4m3b.mjs
```

---

# 49. 기존 P4-M.2 검증 유지

P4-M.2 verifier를 삭제하거나 기대값을 바꾸지 않는다.

---

# 50. 회귀

반드시:

```text
Judgment 35/35
P2-A~G
P3-A~F
P4 주요 회귀
P4-M.2
```

통과.

---

# 51. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 52. 결과 파일

생성:

```text
src/docs/codex/p4m3b-event-timing-decision-projection-split-result.md
```

---

# 53. 결과 보고 A — Architecture

```text
EventEvidenceFact:
EventTimingDecision:
Calendar Projection:
EventTimingFact:
```

각 책임을 기록한다.

---

# 54. 결과 보고 B — Source regression

```text
contract negative source cases:
business source cases:

EventEvidence generated:
EventTimingDecision generated:
Gregorian dates invented:
```

Expected:

```text
Gregorian dates invented = 0
```

---

# 55. 결과 보고 C — Contract tests

```text
contract positive code path:
contract delay code path:
business start path:
business expansion path:
business adjustment path:
business restructure path:
```

각각:

```text
SOURCE_BACKED
CONTRACT_TEST_ONLY
SOURCE_GAP
ENGINE_GAP
```

중 정확한 coverage type을 기록한다.

---

# 56. 결과 보고 D — Projection

```text
production calendar wiring:
semantic decision without interval:
not_projectable handling:
```

---

# 57. Policy audit

다음 위반:

```text
semantic confirmed → interval missing 때문에 deferred
fake Gregorian interval
single TenGod shortcut
generic favorable shortcut
unsupported exact date
```

Expected 모두:

```text
0
```

---

# 58. 최종 판정

다음을 만족하면:

```text
EVENT_TIMING_DECISION_PROJECTION_SPLIT_READY
```

판정한다.

조건:

```text
[ ] EventTimingDecision 계층 분리
[ ] Gregorian projection 별도 책임

[ ] source-backed semantic regression 실행 가능
[ ] Gregorian BirthInput 역산 0
[ ] fake interval 0

[ ] source-backed contract negative 사례 실제 Decision 생성
[ ] engine-ready positive branch contract test 실행
[ ] engine-ready business positive branch contract test 실행

[ ] Decision certainty와 calendar availability 분리
[ ] interval 없음 때문에 confirmed semantic 억제 0

[ ] generic shortcut 0
[ ] single-TenGod shortcut 0

[ ] Judgment 의미 변경 0
[ ] Money/Health/Relationship 변경 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 59. 다음 단계

성공 후에는 더 이상 P4-M.3 fixture를 반복하지 않는다.

바로:

```text
P4-N Event Timing Integration Audit
```

로 이동한다.

P4-N에서는 세 레인을 감사한다.

```text
1. Source semantic regression
2. Contract branch coverage
3. Production calendar integration
```

이 세 레인을 합쳐 Event Timing Batch 1 완료 여부를 판정한다.