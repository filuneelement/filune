# FILUNE Codex P4-M.3A
## Source-backed Snapshot Fixture Qualification Fix

현재 상태:

```text
READY_FOR_EVENT_TIMING_AUDIT
EVENT_TIMING_FIXTURE_GAP_REMAINS
```

P4-M.3에서는 전문가 원자료 사례에 Gregorian 출생 날짜·시간이 없다는 이유로
source-backed positive fixture를 만들지 않았다.

그러나 이는 기존 FILUNE fixture 계약보다 과도한 진입 조건이었다.

기존 FILUNE 규칙 엔진 fixture 원칙:

```text
- 입력은 저장된 CalculatedChart / Judgment snapshot을 기준으로 검증한다.
- 기대 판정은 문서의 확정 답을 사람이 매핑한다.
- 엔진 출력을 복사하여 정답으로 만들지 않는다.
- 원문에 없는 기대값은 만들지 않는다.
- BirthInput → CalculatedChart 검증은 별도 연결 테스트다.
- 규칙 엔진 사례 자체에서 계산을 다시 실행할 필요는 없다.
```

따라서 이번 작업에서는 **Gregorian BirthInput을 역산하지 않는다.**

대신 전문가 원자료에 명시된:

```text
원국 네 기둥
운의 간지/범위
전문가의 구조 판정
계약·사업 실제 결과
```

를 기반으로 source-backed snapshot fixture를 만든다.

---

# 1. 최종 목표

성공:

```text
EVENT_TIMING_SOURCE_BACKED_SNAPSHOT_FIXTURES_READY
```

실패:

```text
SOURCE_SNAPSHOT_FIXTURE_GAP_REMAINS
```

---

# 2. 이번 작업의 핵심 수정

폐기할 P4-M.3 조건:

```text
positive fixture는 반드시 Gregorian BirthInput에서 시작해야 한다
```

새 조건:

```text
Production wiring test
과
Source-backed semantic regression test
를 분리한다.
```

---

# 3. 테스트를 두 레인으로 분리

## Lane A — Production Wiring

기존 실제 BirthInput fixture 사용.

```text
BirthInput
→ Canonical
→ Judgment
→ EventEvidence
→ EventTiming
→ Reading Assembly
```

목적:

```text
실제 production wiring
호출 가능성
mutation 없음
오탐 없음
scope/lifecycle
Assembly 연결
```

기존 양성 event가 없어도 된다.

---

## Lane B — Source-backed Positive Regression

전문가 원자료에 있는 실제 사례 사용.

가능한 가장 높은 신뢰도의 저장 snapshot에서 시작한다.

우선순위:

```text
1. 기존 CalculatedChart snapshot을 만들 수 있는 source data
2. 기존 Canonical/Judgment regression snapshot
3. source-backed Judgment snapshot
4. EventEvidence 입력에 필요한 최소 verified snapshot
```

낮은 단계로 내려갈수록 이유를 보고한다.

---

# 4. BirthInput 역산 금지

절대 금지:

```text
사주 네 기둥
→ 임의 Gregorian 생년월일 추정

대운 정보
→ 출생시각 역산

원자료에 없는 성별·출생지·시간 생성
```

---

# 5. Production Canonical schema 변조 금지

fixture를 만들기 위해:

```text
BirthInput 타입에 fake/source_unknown 필드 추가
production Canonical schema 완화
calculateCanonicalChart 우회용 production 옵션 추가
```

금지.

테스트와 production 입력 계약을 분리한다.

---

# 6. source-backed fixture의 정체성

모든 fixture에 다음을 기록한다.

```text
fixtureId
sourceDocument
sourceLocation
sourceChart
sourceLuckContext
sourceInterpretation
snapshotLevel
verifiedFields
unknownFields
expectedEvidence
expectedTiming
```

---

# 7. Source chart

원자료에 명시된 네 기둥은
그대로 기록한다.

```text
year pillar
month pillar
day pillar
hour pillar
```

원자료에 시주가 없으면:

```text
hour = unknown
```

으로 남긴다.

추정하지 않는다.

---

# 8. 운 정보

원자료가 실제로 명시한 범위만 fixture에 넣는다.

예:

```text
대운 간지
세운 간지
월의 간지
해당 사건 발생 범위
```

원자료에 없는 날짜 경계는 만들지 않는다.

---

# 9. Judgment snapshot 생성 원칙

source-backed Judgment snapshot을 사용할 경우
모든 positive fact는 다음 둘 중 하나여야 한다.

```text
A. 기존 Judgment engine으로 원자료 chart facts에서 결정적으로 산출 가능
B. 전문가 원자료가 직접 명시한 structural fact
```

---

# 10. 엔진 출력 복사 금지

금지:

```text
EventTiming 결과를 먼저 실행
→ 그 결과에 맞춰 Judgment fixture 작성
```

Expected value는 source에서 먼저 정의한다.

---

# 11. EventEvidence 직접 주입 제한

EventEvidenceFact 자체를 fixture 입력으로 직접 넣고
EventTiming만 테스트하는 것을
P4-M.3A의 핵심 양성 검증으로 인정하지 않는다.

가능하면 최소:

```text
Judgment snapshot
→ EventEvidenceAdapter
→ EventTiming
```

을 통과해야 한다.

---

# 12. Snapshot에서 필요한 Judgment fact

Master 15 §6A의 Mapping Contract에서
각 event mapping이 요구하는 실제 fact만 포함한다.

예:

```text
RelationFact
FormulaFact
CurrentFunction
Role state
ActualStructuralFunction
OutcomeFact
LuckEffect
PatternContext
```

필요하지 않은 fact를 채워 넣지 않는다.

---

# 13. Unknown 처리

원자료에 없는 정보가
해당 mapping에 필요하지 않다면:

```text
unknown
```

으로 두고 계속 검증한다.

원자료에 없는 정보가
필수 gate라면:

```text
FIXTURE_GAP
```

으로 해당 사례만 탈락시킨다.

---

# 14. Contract positive fixture

P4-M.1에서 확보한 실제 전문가 사례 중
Master 15 contract positive mapping을 충족하는 사례를 사용한다.

목표:

```text
source-backed contract positive fixture ≥ 1
```

Expected:

```text
EventEvidenceFact > 0
contract_favorable EventTimingFact > 0
```

---

# 15. Contract negative/obstruction fixture

가능하면 실제:

```text
재물 구조는 유리
BUT
문서·계약은 불리
```

사례를 fixture화한다.

Expected:

```text
Money favorable preserved
Contract positive not invented
Contract obstruction preserved
```

---

# 16. Business positive fixture

P4-M.1에서 이미 사용한 실제:

```text
사업 시작
사업 성과
사업 확장
거래처 확대
```

사례 중 engine-ready mapping을 사용한다.

목표:

```text
source-backed business positive fixture ≥ 1
```

---

# 17. Business mixed fixture

가능하면 전문가 자료의:

```text
사업 확장 가능
+
금전 문제 존재
```

사례를 반드시 사용한다.

Expected:

```text
business_expansion_favorable = confirmed
money difficulty/retention issue = confirmed
```

둘 다 보존.

---

# 18. Adjustment / Restructure

P4-M.1 source 사례에서
필수 Judgment mapping까지 확인 가능한 경우만 fixture화한다.

불충분하면:

```text
FIXTURE_GAP
```

으로 남긴다.

---

# 19. 단일 십성 shortcut 금지

source-backed fixture에서도 다음은 금지:

```text
印 → 계약
食傷 → 사업
財 → 확장
沖 → 구조변경
```

Master 15의 전체 gate가 충족되어야 한다.

---

# 20. Source fixture가 반드시 확인할 것

각 양성 fixture에 대해:

```text
required fact 존재
required current function 존재
blocking condition 불충족
event context 명시
scope 일치
source provenance 존재
```

를 확인한다.

---

# 21. Fixture의 event context

전문가 원자료가 실제로:

```text
계약
사업
사업 확장
사업 조정
```

을 언급한 경우
해당 event context를 fixture에 명시할 수 있다.

이는 사용자 현재 상태 추론이 아니다.

---

# 22. 실제 생활 결과 보존

source가:

```text
사업 확장
계약 성사
```

라고 말하면 expected도 그 의미까지 보존한다.

금지:

```text
business activity signal
contract-related opportunity
```

로 다시 약화.

---

# 23. P4-M.3 기존 실패 판정 수정 방식

기존:

```text
EVENT_TIMING_FIXTURE_GAP_REMAINS
```

결과 파일은 삭제하거나 위조하지 않는다.

감사 이력으로 유지한다.

P4-M.3A가 별도 결과를 추가한다.

---

# 24. Application code

원칙:

```text
src/lib application semantic changes = 0
```

fixture 실행 중 실제 implementation bug가 발견된 경우에만
별도 분류한다.

이번 단계에서 source gap을 코드 변경으로 메우지 않는다.

---

# 25. 테스트 전용 fixture/helper

필요하면:

```text
scripts/fixtures/eventTiming/
```

또는 repository 기존 fixture convention에 맞는 위치에
source-backed snapshot helper를 추가할 수 있다.

production bundle에 포함시키지 않는다.

---

# 26. 반드시 별도 검증 — Production wiring

기존 Gregorian BirthInput fixture는 계속 실행한다.

목표:

```text
production pipeline no crash
false-positive event = 0
mutation = 0
```

양성 event가 없어도 이 lane은 PASS 가능.

---

# 27. 반드시 별도 검증 — Source semantics

source-backed snapshot fixture에서:

```text
EventEvidenceFact > 0
EventTimingFact > 0
```

가 실제 발생해야 한다.

---

# 28. 두 검증을 혼동하지 않는다

최종 보고:

```text
Production Wiring Coverage
Source-backed Positive Semantic Coverage
```

를 별도 표로 작성한다.

---

# 29. Stable ID

source-backed snapshot을 두 번 실행:

```text
same Evidence ID
same Timing ID
same provenance
same scope
```

---

# 30. Provenance

모든 positive fixture:

```text
source citation/location 있음
orphan evidence = 0
orphan timing = 0
```

---

# 31. Negative shortcut fixture

기존 BirthInput fixture 4건을 그대로 유지한다.

Expected:

```text
generic favorable shortcut false positive = 0
```

---

# 32. Day gap

다음은 그대로 유지:

```text
day finalization = ENGINE_GAP
```

positive fixture를 만들기 위해 가짜 일진을 추가하지 않는다.

---

# 33. Legal dispute

기존:

```text
SOURCE_GAP
```

유지.

---

# 34. Source conflict

전문가 원자료의 간지·구조와
현재 계산/판정 기준이 충돌하면:

```text
SOURCE_CONFLICT
```

로 기록한다.

억지로 맞추지 않는다.

---

# 35. 결과 파일

생성:

```text
src/docs/codex/p4m3a-source-backed-snapshot-fixture-fix-result.md
```

---

# 36. 최종 보고 A — Fixture strategy

```text
Production BirthInput fixtures:
Source-backed snapshot fixtures:
Reverse-engineered BirthInputs:
```

Expected:

```text
Reverse-engineered BirthInputs = 0
```

---

# 37. 최종 보고 B — Contract

```text
contract positive source fixture:
contract obstruction source fixture:
```

각각:

```text
PASS
FIXTURE_GAP
SOURCE_CONFLICT
```

---

# 38. 최종 보고 C — Business

```text
business positive:
business expansion:
business adjustment:
business restructure:
mixed business + money:
```

---

# 39. 최종 보고 D — Actual generated facts

```text
EventEvidenceFacts:
EventTimingFacts:

positive contract:
positive business:
negative/obstruction:
mixed:
```

---

# 40. 최종 보고 E — Safety

```text
invented Gregorian dates:
invented birth times:
invented source facts:
engine-output-derived expectations:
shortcut violations:
```

Expected 모두:

```text
0
```

---

# 41. 최종 판정

최소:

```text
source-backed contract positive ≥ 1
source-backed business positive ≥ 1
EventEvidenceFact 실제 발생 > 0
EventTimingFact 실제 발생 > 0
```

이고 모든 provenance가 확인되면:

```text
EVENT_TIMING_SOURCE_BACKED_SNAPSHOT_FIXTURES_READY
```

로 판정한다.

---

# 42. 만약 그래도 양성 fixture가 불가능하면

반드시 정확히 이유를 나눈다.

```text
SOURCE_CHART_INCOMPLETE
REQUIRED_JUDGMENT_FACT_NOT_RECONSTRUCTABLE
SOURCE_CONFLICT
ENGINE_GAP
```

단순:

```text
Gregorian BirthInput 없음
```

만으로 실패시키지 않는다.

---

# 43. 다음 단계

성공 후:

```text
P4-N Event Timing Integration Audit
```

로 이동한다.

P4-N은 두 가지 통합 검증을 모두 포함한다.

### Production integration

```text
BirthInput
→ Canonical
→ Judgment
→ Event Timing
→ Assembly
```

기존 실제 앱 경로 검증.

### Source semantic integration

```text
source-backed Calculated/Judgment snapshot
→ EventEvidenceAdapter
→ EventTiming
→ Assembly
```

실제 양성 의미 검증.

두 레인을 합쳐야 Event Timing Batch 1 완료 판정을 내린다.