# FILUNE Codex P4-M.5
## Event Judgment Fact Minimal Fix

진입 조건:

```text
EVENT_JUDGMENT_FACT_GAP_CLASSIFIED
```

P4-M.4 감사 결과를 authority로 사용한다.

반드시 먼저 읽는다.

```text
src/docs/codex/p4m4-event-evidence-judgment-fact-gap-audit-result.md
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4m1-event-evidence-mapping-contract-result.md
src/docs/codex/p4m2-event-evidence-adapter-engine-result.md
src/docs/codex/p4m3b-event-timing-decision-projection-split-result.md
```

이번 작업은 **새 명리 규칙을 추가하는 단계가 아니다.**

P4-M.4에서 확정된 최소 gap만 수정한다.

---

## 1. 최종 목표

성공:

```text
READY_FOR_P4N_EVENT_TIMING_AUDIT
```

실패:

```text
P4M5_FIX_REQUIRED
```

---

## 2. P4-M.4 확정 결과를 변경하지 말 것

P4-M.4에서 확인된 핵심:

```text
Master 15 mapping rows audited = 11

JUDGMENT_EXPOSURE_GAP = 0

JUDGMENT_COMPUTATION_GAP
= 3 row-scope findings

SOURCE_OR_POLICY_GAP
= 2 restricted items

remaining row/subsets
= no Judgment fact gap
```

이 분류를 이번 구현 편의를 위해 바꾸지 않는다.

---

## 3. Source / Policy Gap은 구현하지 않는다

P4-M.4에서 C로 분류된 항목은 그대로:

```text
SOURCE_GAP
DEFERRED
```

유지한다.

코드 completeness를 위해 임의 구현 금지.

---

# PART A — Contract source case 1

## 4. 사례 1의 확정 blocker

P4-M.4 결과:

```text
stopped stem effect
= Judgment snapshot에 존재

BUT

원자료가 용신/계약 기능으로 보는
해당 운의 庚印 current role/function
= Judgment에서 계산되지 않음
```

분류:

```text
JUDGMENT_COMPUTATION_GAP
```

---

## 5. 사례 1 수정 원칙

새로운 계약 판단을 Judgment에 넣지 않는다.

고칠 것은:

```text
기존 확정 Role/CurrentFunction 규칙에 따라
해당 scope의 역할 기능을 계산하는 누락
```

뿐이다.

---

## 6. Role history와 current role을 구분

기존 FILUNE 계약 유지:

```text
RoleHistory
≠
CurrentState
≠
CurrentFunction
```

운에서 작용하는 글자라고 해서
새 natal role을 만든다는 뜻이 아니다.

P4-M.4가 요구한 정확한 기존 role/function 계약을 따른다.

---

## 7. stopped effect 반영

해당 기능의 source/target이 실제 stopped라면
current function은 기존 계약에 따라:

```text
inactive
```

또는 현행 canonical 동등 상태가 되어야 한다.

---

## 8. weakened와 stopped 혼동 금지

```text
weakened
→ reduced

stopped
→ inactive
```

기존 규칙 유지.

---

## 9. contract 의미는 Event Adapter 책임

Judgment가 새로:

```text
contract_bad
contract_unfavorable
```

같은 fact를 만들지 않는다.

Judgment는 구조적 current role/function까지만 제공한다.

---

# PART B — Contract source case 2

## 10. 사례 2는 Judgment gap이 아니다

P4-M.4 결과:

```text
stem effect = 존재
명시된 印 role = 존재

BUT

Event Adapter가
role ↔ relation/effect
를 연결하지 못함
```

따라서:

```text
Judgment computation 추가 금지
```

---

## 11. Adapter linkage 최소 수정

`src/lib/eventTiming/eventEvidence.ts` 또는 실제 owner에서
기존 ID/linkage를 이용해:

```text
role
↔ source relation/effect
```

를 연결한다.

새 명리 추론을 하지 않는다.

---

## 12. 이름/십성만으로 연결 금지

금지:

```text
같은 印이니까 연결
같은 stem이니까 연결
같은 TenGod이니까 연결
```

가능한 한 기존:

```text
relationFactId
role source ID
target/source identity
scope identity
```

등 명시적 linkage를 사용한다.

---

## 13. 여러 동일 십성이 있을 때 안전해야 함

같은 scope에 동일 TenGod 후보가 여러 개 있어도
잘못된 role을 잡지 않아야 한다.

---

# PART C — 나머지 computation gap

## 14. P4-M.4의 나머지 computation gap 2건

결과 문서에 기록된
나머지 `JUDGMENT_COMPUTATION_GAP` row-scope 2건을 확인한다.

각각:

```text
기존 Master에 계산 규칙이 이미 있는가
```

를 다시 확인한 후 **P4-M.4가 B로 확정한 범위만** 구현한다.

---

## 15. 새 정책 만들지 않기

필요한 Fact가 없다는 이유로:

```text
contract policy
business policy
event meaning
```

을 새로 추가하지 않는다.

기존 구조 Fact computation만 보완한다.

---

## 16. additive 우선

기존 Judgment API를 깨지 않는다.

가능하면:

```text
새 필드 추가보다
기존 role/function collection에 누락 Fact 추가
```

를 우선한다.

---

# PART D — Event Timing Decision / Projection

## 17. P4-M.3B 구조 유지

다음 구조는 이미 올바르므로 변경하지 않는다.

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

## 18. semantic certainty와 projection 분리 유지

```text
confirmed Decision
+
Gregorian interval 없음
→ confirmed / not_projectable
```

가능.

날짜 없음 때문에 semantic certainty를 낮추지 않는다.

---

## 19. fake Gregorian date 금지

계속:

```text
invented Gregorian dates = 0
```

---

# PART E — Source 사례 재검증

## 20. Source case 1

기존 source-backed 사례를 그대로 재실행한다.

기대:

```text
EventEvidenceFact > 0
EventTimingDecision > 0
```

그리고 의미:

```text
재물 favorable 축 보존
+
계약 negative/obstruction 축 보존
```

---

## 21. Source case 1에서 금지

```text
재물 favourable
→ 계약 favourable
```

0건.

---

## 22. Source case 2

기존 source-backed 사례를 그대로 재실행한다.

기대:

```text
EventEvidenceFact > 0
EventTimingDecision > 0
```

P4-M.4에서 이미 존재한다고 확인한
Judgment Facts를 재계산해서는 안 된다.

---

## 23. source 기대값 변경 금지

두 사례를 통과시키기 위해
전문가 원문 기대 의미를 수정하지 않는다.

---

# PART F — Positive branch coverage

## 24. Contract positive branch

Master 15의 engine-ready positive contract branch가
실제로 최소 한 번 실행되는지 확인한다.

Source-backed 실제 사례가 충분하면 그것을 사용한다.

아니면 기존 승인된:

```text
CONTRACT_TEST_ONLY
```

fixture를 사용한다.

---

## 25. Business positive branch

동일하게 engine-ready business positive branch를
최소 한 번 실행한다.

---

## 26. Contract test는 source-backed라고 부르지 않는다

명확히 분리:

```text
SOURCE_BACKED
CONTRACT_TEST_ONLY
PRODUCTION_WIRING
```

---

# PART G — shortcut 방지

## 27. 다음 위반 0

```text
印 → 계약 favorable
官 → 계약 favorable
合 → 계약 favorable

食傷 → 사업 시작
財 → 사업 확장
沖 → 사업 restructure

generic favorable → event positive
generic unfavorable → event negative
```

---

# PART H — Source/Policy gaps 유지

## 28. P4-M.4의 2개 SOURCE_OR_POLICY_GAP

그대로 남긴다.

Expected:

```text
new implementation = 0
```

---

# PART I — Test infra path

## 29. A_rev179 legacy path

P4-M.4에서 별도:

```text
TEST_INFRA_PATH_GAP
```

로 확인한 경우에만 고친다.

현재 authority 경로:

```text
src/docs/source/authority/A_rev179.md
```

를 사용한다.

---

## 30. Authority 내용 변경 금지

경로 수정만 한다.

```text
A_rev179 content changes = 0
```

---

# PART J — 검증

## 31. 이번에는 장시간 전체 회귀를 먼저 돌리지 않는다

우선 순서:

```text
1. source case 1
2. source case 2
3. contract positive branch
4. business positive branch
5. P4-M.2 verifier
6. P4-M.3B verifier
```

모두 통과한 뒤에만 최소 회귀를 진행한다.

---

## 32. Targeted verifier

권장:

```text
scripts/verify-event-judgment-fact-fix-p4m5.mjs
```

---

## 33. 필수 targeted 결과

```text
source case 1 EventEvidence > 0
source case 1 Decision > 0

source case 2 EventEvidence > 0
source case 2 Decision > 0

contract positive branch > 0
business positive branch > 0
```

---

## 34. 기존 negative fixtures

P4-M.2의 production BirthInput fixture에서
기존 false positive:

```text
0
```

유지.

---

## 35. 기존 Event Timing 구조 회귀

확인:

```text
stable ID
provenance
originScope
scopeGanZhi
parentScopeGanZhi
not_projectable
calendar projection
```

---

## 36. 최소 Judgment 회귀

반드시:

```text
Judgment 35/35
```

실행.

legacy path 문제가 있었다면 먼저 경로를 고친 후 실행.

---

## 37. 핵심 구조 회귀

최소:

```text
P0
P1 role/lifecycle
P4-M.2
P4-M.3B
```

실행.

---

## 38. 기존 Outcome 의미 회귀

적어도 현재 영향 영역:

```text
Money
Health
Relationship
```

검증기를 실행한다.

기대값 변경 금지.

---

## 39. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# PART K — 금지 사항

## 40. 이번 작업에서 금지

```text
Master 15 의미 변경
전문가 source 해석 수정
새 contract/business rule 발명
새 score
새 threshold
fake Gregorian date
fixture 기대값 변경
generic good/bad 도입
customer Saju terminology 추가
```

---

# PART L — 결과 보고

## 41. 결과 파일

생성:

```text
src/docs/codex/p4m5-event-judgment-fact-minimal-fix-result.md
```

---

## 42. Judgment gap 결과

반드시:

```text
P4-M.4 computation gaps before:
P4-M.5 computation gaps fixed:
remaining computation gaps:
```

---

## 43. Source 사례

```text
source case 1:
  Evidence:
  Decision:
  blocker:

source case 2:
  Evidence:
  Decision:
  blocker:
```

성공 시 blocker:

```text
NONE
```

---

## 44. Branch coverage

```text
contract positive:
contract negative:
business positive:
business adjustment/restructure:
```

각각 coverage type까지 기록.

---

## 45. Source/policy gaps

```text
SOURCE_OR_POLICY_GAP:
```

P4-M.4와 동일하게 유지됐는지 기록.

---

## 46. Isolation

```text
Judgment unrelated semantic changes:
Money semantic changes:
Health semantic changes:
Relationship semantic changes:
Personality changes:
```

Expected 모두:

```text
0
```

---

# 47. 최종 판정

다음을 만족하면:

```text
READY_FOR_P4N_EVENT_TIMING_AUDIT
```

판정한다.

조건:

```text
[ ] P4-M.4의 B computation gaps 승인 범위 수정
[ ] 사례 1 EventEvidence/Decision 생성
[ ] 사례 2 Adapter linkage 수정 및 Evidence/Decision 생성

[ ] contract positive branch 실제 실행
[ ] business positive branch 실제 실행

[ ] SOURCE/POLICY gaps 임의 구현 0

[ ] single-TenGod shortcut 0
[ ] generic favorable shortcut 0

[ ] EventTimingDecision / Calendar Projection 분리 유지
[ ] fake Gregorian date 0

[ ] Judgment 35/35
[ ] 핵심 회귀 PASS
[ ] Money/Health/Relationship 의미 변경 0

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 48. 이 단계 이후

`READY_FOR_P4N_EVENT_TIMING_AUDIT`가 나오면
**P4-M 계열 추가 작업은 만들지 않는다.**

바로:

```text
P4-N Event Timing Integration Audit
```

로 이동한다.

P4-N에서는:

```text
A. Source semantic regression
B. Contract branch coverage
C. Production calendar integration
```

세 레인만 최종 감사한다.

P4-N에서 새 설계를 만들지 않는다.