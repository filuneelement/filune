# FILUNE Codex P4-M.3
## Event Timing Source-backed Positive Fixture Qualification

현재 상태:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
EVENT_EVIDENCE_MAPPING_READY
READY_FOR_EVENT_TIMING_AUDIT
```

P4-M.2에서 EventEvidenceAdapter와 Event Timing Engine 구현은 완료되었다.

그러나 기존 pipeline fixture 4건에서는:

```text
EventEvidenceFact observed = 0
EventTimingFact observed = 0
```

이었으며,

```text
계약·사업 source-backed positive result
mixed result
```

는:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 남았다.

이번 단계의 목적은 **새 명리 규칙을 만들지 않고**, P4-M.1에서 이미 확인한 전문가 원자료 사례를 기반으로 실제 positive / negative / mixed fixture를 확보하는 것이다.

---

# 1. 최종 목표

성공:

```text
EVENT_TIMING_SOURCE_BACKED_FIXTURES_READY
```

실패:

```text
EVENT_TIMING_FIXTURE_GAP_REMAINS
```

---

# 2. 새 규칙 추가 금지

이번 단계에서:

```text
새 Event Evidence mapping = 0
새 Judgment rule = 0
새 Outcome rule = 0
새 source inference = 0
```

이어야 한다.

기존 Master 15와 P4-M.1 mapping만 사용한다.

---

# 3. 반드시 읽을 기준

```text
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4m1-event-evidence-mapping-contract-result.md
src/docs/codex/p4m2-event-evidence-adapter-engine-result.md

src/docs/source/primary/07-사주풀이예시.md
src/docs/source/primary/04-행운론.md
```

특히 P4-M.1에서 이미 근거로 사용한 전문가 사례와 반례를 우선 사용한다.

---

# 4. Fixture 생성 원칙

fixture는 반드시:

```text
실제 원자료 사례
→ 기존 Canonical 입력으로 재현
→ 기존 Judgment 결과 확인
→ Master 15 mapping 충족 확인
→ EventEvidenceFact 기대값
→ EventTimingFact 기대값
```

순서로 만든다.

---

# 5. 합성 명리 기대값 금지

금지:

```text
테스트를 통과시키기 위해 임의 사주 생성
원자료에 없는 사건 결과 부여
role/currentFunction을 테스트에서 강제로 주입
EventEvidenceFact를 직접 만들어 Timing만 검증
```

가능한 한 **실제 Birth Input → Canonical → Judgment** 경로를 사용한다.

---

# 6. 최소 양성 fixture — Contract

최소 1건은 실제 원자료에서:

```text
문서·계약 기능이 실제 유리하게 작동
```

하는 사례를 확보한다.

Expected:

```text
EventEvidenceFact > 0
contract positive/support evidence 존재
contract_favorable EventTimingFact 존재
```

---

# 7. Contract positive shortcut 금지

해당 fixture가 단순:

```text
印 있음
官 있음
合 있음
```

때문에 통과해서는 안 된다.

Master 15의 실제:

```text
required Judgment facts
current function
blocking condition
```

을 모두 만족해야 한다.

---

# 8. 최소 음성/반례 — Contract

P4-M.1에서 확인한 반례 중 최소 1건을 fixture로 만든다.

예:

```text
재물 조건은 유리
BUT
문서·계약 기능은 불리
```

또는:

```text
印 존재
BUT
현재 기능상 계약 지원 아님
```

Expected:

```text
money favorable fact 존재 가능
contract_favorable = 0
```

또는 source에 따라 contract obstruction.

---

# 9. Contract obstruction fixture

원자료에서 문서·계약 문제를 명시하고
Master 15 mapping이 충족되는 실제 사례가 있으면 최소 1건 확보한다.

Expected:

```text
contract obstruction evidence > 0
```

지원 범위 안에서:

```text
contract_delay
또는
contract unfavorable/restructure 관련 timing
```

이 생성되는지 확인한다.

---

# 10. 최소 양성 fixture — Business

최소 1건은 실제 전문가 사례에서:

```text
사업 활동
사업 실행
사업 성과
사업 확장
```

중 Master 15의 engine-ready mapping을 충족하는 사례를 사용한다.

Expected:

```text
business EventEvidenceFact > 0
EventTimingFact > 0
```

---

# 11. Business start fixture

실제 source에서 사업 시작 조건까지 재현 가능한 경우:

```text
business_start_favorable
```

양성 fixture를 만든다.

단 P4-M.1에서 해당 mapping이 제한적 SOURCE_INFERENCE라면 그 상태를 유지한다.

---

# 12. Business expansion fixture

P4-M.1에서 언급된 실제 전문가 사례 중:

```text
사업 확장
거래처 확대
외부 성과 확대
```

가 명시된 사례를 우선 사용한다.

Expected:

```text
business_expansion_favorable
```

---

# 13. Expansion + Money 문제 혼합 fixture

원자료에:

```text
사업 확장 가능
+
내부 금전 문제
```

가 함께 있는 실제 사례를 P4-M.1에서 확인했다면 반드시 fixture화한다.

Expected:

```text
business_expansion_favorable = confirmed
money difficulty/retention problem = confirmed
```

둘 다 남아야 한다.

금지:

```text
사업 확장 가능하므로 돈 문제 삭제
돈 문제가 있으므로 확장 결과 삭제
mixed/ambiguous 하나로 축약
```

---

# 14. Business adjustment fixture

전문가 자료에서:

```text
확장보다 보수 운영
성과보다 정비
기존 구조 조정
```

이 명시된 실제 사례가 있고
Master 15 mapping이 engine-ready라면 fixture화한다.

Expected:

```text
business_adjustment
```

---

# 15. Business restructure fixture

실제:

```text
기존 거래 종료
사업 방식 변경
상품/수익 구조 변화
동업 구조 변화
```

사례가 Master 15 조건을 만족하면 fixture화한다.

Expected:

```text
business_restructure
```

---

# 16. 일반 충 반례

단순 `沖`만 존재하고
사업 기능과 연결되지 않는 fixture에서는:

```text
business_restructure = 0
```

을 확인한다.

---

# 17. Generic favorable 반례

전체적으로 favorable한 구조지만
계약 또는 사업-specific evidence가 없는 기존 fixture에서:

```text
contract_favorable = 0
business_start_favorable = 0
business_expansion_favorable = 0
```

을 확인한다.

---

# 18. 실제 Birth Input 우선

원자료 사례에 출생 입력이 충분히 존재하면
그 입력을 그대로 사용한다.

입력이 부족해 완전한 Canonical chart 재현이 불가능하면:

```text
FIXTURE_GAP
```

으로 남긴다.

자료를 추정해서 채우지 않는다.

---

# 19. 원자료와 현재 계산값 차이

원자료의 간지/십성 표기와
현재 Canonical 계산 결과가 다른 경우:

```text
SOURCE_CONFLICT
```

로 기록한다.

감사 통과를 위해 현재 계산값을 원자료에 맞게 조작하지 않는다.

---

# 20. Positive fixture 최소 종료 기준

최소 다음 중 engine-ready인 항목에 대해
실제 양성 fixture를 확보한다.

```text
contract positive support ≥ 1

business positive support ≥ 1
```

가능하다면 추가:

```text
contract obstruction ≥ 1
business expansion ≥ 1
business adjustment/restructure ≥ 1
mixed business + money ≥ 1
```

---

# 21. engine-ready인데 fixture가 0이면

Master 15에서:

```text
Engine Ready = yes
```

인데 실제 source-backed fixture를 하나도 만들 수 없다면:

```text
FIXTURE_GAP
```

으로 명시한다.

이를 PASS로 숨기지 않는다.

---

# 22. engine gap 항목

P4-M.2에서 이미:

```text
Day finalization = ENGINE_GAP
legal dispute = SOURCE_GAP
```

등으로 남은 항목은 fixture 생성 대상에서 제외한다.

---

# 23. Day 최종 날짜 억지 생성 금지

이번 단계에서도:

```text
계약 최종 서명일
사업 시작 정확한 날짜
```

를 새로 만들지 않는다.

---

# 24. Expected value는 source 기반

각 fixture마다 결과 문서에 반드시 기록:

```text
Fixture ID
Source location
Birth input
Relevant source interpretation
Judgment facts used
Event Evidence mapping row
Expected EventEvidenceFact
Expected EventTimingFact
Why this is not a shortcut
```

---

# 25. Provenance

생성된 모든 양성 EventEvidenceFact / EventTimingFact:

```text
source IDs 존재
orphan = 0
```

---

# 26. Stable ID

같은 fixture 2회 실행:

```text
same Evidence IDs
same Timing IDs
same provenance
same origin scope
```

---

# 27. Scope

원자료 사건이 어느 범위에 해당하는지 정확히 유지한다.

```text
natal
daewoon
sewoon
month
```

현행 내부 scope 사용.

고객 표현은 이번 단계 범위 아님.

---

# 28. 12절기월

월 fixture가 있으면 반드시 FILUNE 12절기월 사용.

---

# 29. Shortcut 감사

fixture 추가 후에도 다음 위반:

```text
印 → 계약 favorable
官 → 계약 favorable
合 → 계약 favorable

食傷 → 사업 start
財 → 사업 expansion
沖 → business restructure

generic favorable → event positive
```

모두:

```text
0
```

---

# 30. Assertion 감사

```text
source-supported positive result not emitted
source-supported negative result not emitted
mixed result collapsed
unsupported result emitted
```

각각 0이 목표.

---

# 31. 기존 fixture 변경 금지

기존 검증이 통과하도록 만들어진 fixture 기대값을
Event Timing을 위해 수정하지 않는다.

신규 source-backed regression fixture를 별도로 추가한다.

---

# 32. 권장 fixture 파일

Repository convention에 맞춰
별도 fixture 파일 또는 검증 스크립트 안에 명확히 분리한다.

권장 검증:

```text
scripts/verify-event-timing-source-fixtures-p4m3.mjs
```

---

# 33. application code 변경 원칙

fixture를 실행하면서 실제 implementation bug가 발견되면
이번 단계에서 무작정 기대값을 바꾸지 않는다.

분류:

```text
EVENT_EVIDENCE_IMPLEMENTATION_BUG
EVENT_TIMING_IMPLEMENTATION_BUG
JUDGMENT_FACT_GAP
SOURCE_CONFLICT
FIXTURE_GAP
```

implementation bug가 실제 확인된 경우에만
Master 15 의미를 바꾸지 않는 최소 코드 수정 허용.

---

# 34. 기존 회귀

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

# 35. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 36. 결과 파일

생성:

```text
src/docs/codex/p4m3-event-timing-source-backed-fixtures-result.md
```

---

# 37. 최종 보고

반드시 다음 표를 포함한다.

| Fixture | Source-backed | Judgment path | Evidence Fact | Timing Fact | Result |
|---|---|---|---|---|---|

그리고:

```text
Contract positive fixtures:
Contract negative fixtures:

Business start fixtures:
Business expansion fixtures:
Business adjustment fixtures:
Business restructure fixtures:

Mixed fixtures:
Negative shortcut fixtures:
```

---

# 38. Gap 보고

```text
ENGINE_GAP:
JUDGMENT_FACT_GAP:
SOURCE_GAP:
SOURCE_CONFLICT:
FIXTURE_GAP:
```

정확히 구분한다.

---

# 39. 최종 판정

다음을 만족하면:

```text
EVENT_TIMING_SOURCE_BACKED_FIXTURES_READY
```

판정한다.

조건:

```text
[ ] 실제 source-backed contract positive fixture ≥ 1
[ ] 실제 source-backed business positive fixture ≥ 1

[ ] EventEvidenceFact 실제 발생 확인
[ ] EventTimingFact 실제 발생 확인

[ ] generic shortcut 반례 통과
[ ] source provenance 보존
[ ] stable IDs
[ ] orphan 0
[ ] duplicate 0

[ ] mixed source 사례가 있으면 독립 결과 보존
[ ] unsupported result invention 0

[ ] 기존 Judgment 기대값 변경 0
[ ] 기존 Outcome 의미 변경 0

[ ] 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 40. 다음 단계

성공 후에만:

```text
P4-N Event Timing Integration Audit
```

로 이동한다.

P4-N에서는 신규 source-backed 양성 fixture를 반드시 포함하여:

```text
Birth Input
→ Canonical
→ Judgment
→ Domain Outcomes
→ EventEvidenceAdapter
→ Event Timing
→ Reading Assembly
```

전체 경로를 검증한다.

`EventEvidenceFact = 0 / EventTimingFact = 0`인 기존 음성 fixture만으로
Batch 1 완료 판정을 내리지 않는다.