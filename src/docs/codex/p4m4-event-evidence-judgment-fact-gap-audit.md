# FILUNE Codex P4-M.4
## Event Evidence Judgment Fact Gap Audit

현재 상태:

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
EVENT_EVIDENCE_MAPPING_READY
READY_FOR_EVENT_TIMING_AUDIT

P4-M.3:
EVENT_TIMING_FIXTURE_GAP_REMAINS

P4-M.3A:
SOURCE_SNAPSHOT_FIXTURE_GAP_REMAINS

P4-M.3B:
P4M3B_FIX_REQUIRED
JUDGMENT_FACT_GAP
```

P4-M.3B에서 다음은 이미 해결되었다.

```text
EventTimingDecision 분리
Calendar Projection 분리
not_projectable 지원
가짜 Gregorian 날짜 0
Production calendar wiring PASS
```

이번 단계에서는 위 설계를 다시 수정하지 않는다.

현재 유일한 핵심 blocker:

```text
source-backed 전문가 사례에서
EventEvidenceAdapter가 요구하는 현재 구조 Fact가
JudgmentResult에 없거나 deferred 상태여서
EventEvidenceFact가 생성되지 않음
```

이번 작업은 이 `JUDGMENT_FACT_GAP`을 전수 감사한다.

---

# 1. 최종 목표

성공:

```text
EVENT_JUDGMENT_FACT_GAP_CLASSIFIED
```

실패:

```text
P4M4_AUDIT_INCOMPLETE
```

---

# 2. 이번 단계는 AUDIT ONLY

절대 금지:

```text
src/lib 수정
Judgment rule 추가
Event Timing 수정
fixture 추가
기대값 변경
source interpretation 추가
```

이번 단계에서는 코드 수정 0이어야 한다.

---

# 3. 반드시 읽을 파일

```text
src/docs/rules/master/15-event-timing-spec.md

src/docs/codex/p4m1-event-evidence-mapping-contract-result.md
src/docs/codex/p4m2-event-evidence-adapter-engine-result.md
src/docs/codex/p4m3-event-timing-source-backed-fixtures-result.md
src/docs/codex/p4m3a-source-backed-snapshot-fixture-fix-result.md
src/docs/codex/p4m3b-event-timing-decision-projection-split-result.md

src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
```

그리고 실제:

```text
src/lib/judgment/
src/lib/eventTiming/
```

타입과 public output을 읽는다.

---

# 4. 감사 질문

각 Event Evidence Mapping row마다 정확히 묻는다.

```text
1. 이 mapping이 요구하는 Fact는 무엇인가?
2. Judgment 내부에서 이미 계산되는가?
3. JudgmentResult에 실제 노출되는가?
4. current scope 값까지 존재하는가?
5. operating/reduced/inactive/stopped를 구분할 수 있는가?
6. source relation/role ID를 추적할 수 있는가?
7. 없으면 왜 없는가?
```

---

# 5. Gap을 세 종류로만 분류

모든 누락은 다음 중 하나로 분류한다.

## A. JUDGMENT_EXPOSURE_GAP

```text
Judgment 내부에서는 이미 계산함
BUT
외부 JudgmentResult / snapshot에서 노출되지 않음
```

해결 후보:

```text
기존 계산값 최소 노출
```

새 명리 규칙 필요 없음.

---

## B. JUDGMENT_COMPUTATION_GAP

```text
현재 Judgment 자체가 필요한 구조 Fact를 계산하지 않음
BUT
기존 확정 Master 규칙으로 계산 가능
```

후속 단계에서 최소 구현 후보.

---

## C. SOURCE_OR_POLICY_GAP

```text
현재 source/master만으로는
그 Fact 자체를 확정적으로 정의할 수 없음
```

구현 금지.

```text
SOURCE_GAP
DEFERRED
```

로 남겨야 함.

---

# 6. 네 번째 임의 분류 만들지 않기

```text
아마 가능
거의 있음
비슷한 Fact 있음
```

같은 애매한 분류 금지.

A / B / C 중 하나로 확정한다.

---

# 7. Event Mapping Matrix 전수 감사

Master 15 §6A의 모든 Event Evidence row를 대상으로 한다.

최소 계약 계열:

```text
contract support
contract obstruction
contract instability
contract support-function stopped
contract binding/finalization
```

최소 사업 계열:

```text
business activity support
business start support
business result support
business expansion support
business adjustment need
business restructure
business execution obstruction
```

실제 Master 15 row 수와 이름을 authority로 사용한다.

---

# 8. 각 row별 필수 출력

표:

| Mapping Row | Required Fact | Judgment Internal | JudgmentResult Exposed | Current State Available | Gap Class | Fix Needed |
|---|---|---:|---:|---:|---|---|

---

# 9. RelationFact 감사

다음이 현재 JudgmentResult에 충분히 존재하는지 확인:

```text
generate
control
combine
clash/branch relation
origin
source
target
scope
current effect
```

Event Adapter가 내부 계산을 다시 해서는 안 된다.

---

# 10. ActualStructuralFunction 감사

각 관계/역할의 실제 현재 기능이:

```text
operating
reduced
inactive
deferred
```

또는 현행 동등 상태로 외부에서 읽을 수 있는지 확인한다.

---

# 11. Role 감사

Event mapping에서 필요한:

```text
YongShen
SangShen
Byeong
GuEung
conditional byeong
protective standby
```

등의:

```text
RoleHistory
CurrentState
CurrentFunction
target linkage
```

가 필요한 수준까지 노출되는지 확인한다.

단 역할명 자체를 고객에게 노출하는 문제와 혼동하지 않는다.

---

# 12. stopped / weakened 구분

계약·사업 Evidence에서는 특히:

```text
stopped
weakened
```

가 다르다.

현재 JudgmentResult에서 Event Adapter가 이 차이를 확실히 읽을 수 있는지 확인.

---

# 13. Combine 감사

계약 관련 mapping에서 필요한 경우:

```text
valid combine
luck↔natal
luck↔luck
stopped/reduced
event history
current effect
```

가 노출되어 있는지 확인한다.

---

# 14. PatternContext 감사

Event mapping이 필요로 하는 경우만 확인.

```text
natal pattern
current final PatternContext
manifested YongShen
effective manifestation
```

이 있는지 조사.

필요하지 않은 mapping에 억지 dependency를 추가하지 않는다.

---

# 15. LuckEffect 감사

현재:

```text
activates
weakens
relieves
attacks
protects
manifest_yongshen
changes_pattern_mode
```

등 필요한 현재 effect가 Event mapping에서 재사용 가능한지 확인.

---

# 16. OutcomeFacts 감사

다음 기존 결과를 Event Evidence에서 재사용할 수 있는지 확인한다.

```text
Money Outcome
Relationship Outcome
```

예:

```text
money acquisition
money retention problem
partnership formation
relationship pressure
```

단 OutcomeFact 하나만으로 Event 결과를 만들 수 있는지 여부도 별도로 기록한다.

---

# 17. Contract source case 1 역추적

P4-M.3B에서 사용한:

```text
경술대운 병오년
재물 조건은 살아남
문서계약은 불리
```

사례를 대상으로 한다.

질문:

```text
전문가가 contract negative를 판정하는 데 사용한 구조 경로는 무엇인가?
그 경로의 각 Fact는 현재 Judgment에서 어디까지 존재하는가?
어느 Fact가 빠져 EventEvidenceFact = 0이 되었는가?
```

---

# 18. Contract source case 2 역추적

```text
기유대운 갑진년
부동산 계약 손해
```

사례도 동일하게 추적한다.

---

# 19. Fact path 형태로 보고

예:

```text
source interpretation
↓
RelationFact X
↓
ActualStructuralFunction Y
↓
Role CurrentFunction Z
↓
contract obstruction evidence
```

실제 경로를 작성한다.

---

# 20. 끊긴 지점 표시

각 사례마다:

```text
AVAILABLE
AVAILABLE
MISSING ← blocker
NOT REACHED
```

형태로 표시한다.

---

# 21. deferred 원인 감사

현재 Fact가 `deferred`라면 왜 deferred인지 확인한다.

분류:

```text
실제 evidence 부족
구현 미완성
항상 deferred로 초기화되는 placeholder
upstream qualitative fact 미전달
```

---

# 22. placeholder deferred 발견 시

예:

```text
CurrentFunction always deferred
```

같은 과거 문제가 남아 있다면:

```text
JUDGMENT_EXPOSURE_GAP
또는
JUDGMENT_COMPUTATION_GAP
```

중 정확히 분류한다.

---

# 23. Source가 확정했는데 코드가 deferred인 경우

이것을:

```text
SOURCE_GAP
```

으로 잘못 분류하지 않는다.

소스는 충분한데 구현이 부족하면 B다.

---

# 24. Source가 없는 경우

반대로 코드가 구현 가능해 보인다는 이유만으로
source 없는 Fact를 추가하지 않는다.

C로 분류.

---

# 25. 새 사건별 Judgment rule 금지

이번 감사의 목표는:

```text
Judgment가 contract_favorable를 직접 판정하게 만들기
```

가 아니다.

필요한 구조 Fact를 Event Adapter가 읽을 수 있게 하는 것이 목표다.

---

# 26. Event Adapter 중복 계산 감사

현재 `src/lib/eventTiming/eventEvidence.ts`에서
Judgment가 이미 계산한 사실을 다시 계산하는 부분이 있는지 확인한다.

예:

```text
십성 관계 재계산
role 추정
combine effect 추정
good/bad 추정
```

있다면 보고만 한다.

이번 단계에서 수정하지 않는다.

---

# 27. Adapter가 계산해도 되는 것

허용:

```text
기존 Judgment Facts를 사건별 의미로 조합
```

금지:

```text
새 명리 구조 판정
```

---

# 28. 최소 Fix Set 계산

A/B gap 각각에 대해:

```text
최소 수정 파일
필요 타입
필요 필드
기존 계산 재사용 가능 여부
```

를 작성한다.

---

# 29. Fix priority

다음 순서로 우선순위를 정한다.

```text
P0:
source-backed contract negative 사례를 살리는 blocker

P1:
engine-ready contract/business positive branch blocker

P2:
추가 확장 mapping

DEFER:
SOURCE/POLICY gap
```

---

# 30. 하나의 거대한 Judgment 확장 금지

후속 fix가 필요하더라도:

```text
Event Timing을 위해 JudgmentResult 전체 구조 재작성
```

금지.

최소 exposure / computation만 한다.

---

# 31. 기존 Judgment API 안정성

현재:

```text
Judgment 35/35
P0/P1
Money
Health
Relationship
Personality
```

가 사용하는 타입을 깨지 않도록
후속 fix는 additive가 우선이다.

---

# 32. A/B/C 예상 예시

예시일 뿐 실제 코드를 확인 후 판정:

```text
RelationFact 존재
CurrentFunction 미노출
→ A

현재 구조적 기능 자체를 계산하지 않음
하지만 Master 6/9에 규칙 존재
→ B

계약 법적 분쟁 여부
source rule 없음
→ C
```

---

# 33. 결과 파일

생성:

```text
src/docs/codex/p4m4-event-evidence-judgment-fact-gap-audit-result.md
```

---

# 34. 결과 보고 A — 총계

```text
Event Mapping rows audited:
Required Facts audited:

JUDGMENT_EXPOSURE_GAP:
JUDGMENT_COMPUTATION_GAP:
SOURCE_OR_POLICY_GAP:
No gap:
```

---

# 35. 결과 보고 B — P0 blocker

```text
Contract source case 1 blocker:
Contract source case 2 blocker:

Missing Fact:
Current owner:
Gap class:
Minimum fix:
```

---

# 36. 결과 보고 C — Positive paths

```text
contract positive blocker:
contract delay blocker:

business start blocker:
business expansion blocker:
business adjustment blocker:
business restructure blocker:
```

각각:

```text
A
B
C
READY
```

로 표시.

---

# 37. 결과 보고 D — Adapter

```text
Judgment facts redundantly recomputed by Event Adapter:
Judgment facts safely reused:
Event-only semantic mappings:
```

---

# 38. 결과 보고 E — 후속 수정량

다음 형태로 정확히 보고:

```text
Files requiring Judgment exposure change:
Files requiring Judgment computation change:
Event Adapter files requiring cleanup:
Master changes required:
```

---

# 39. 이번 단계의 회귀

코드 수정이 없으므로 장시간 전체 회귀를 다시 돌리지 않는다.

필수:

```text
git diff --check
src/lib changes = 0
```

기존 최근 PASS 결과를 참조한다.

---

# 40. A_rev179 누락 문제

P4-M.3B에서 발생한:

```text
src/docs/source/A_rev179.md 없음
```

은 현재 authority 경로를 확인한다.

기존 문서가:

```text
src/docs/source/authority/A_rev179.md
```

로 이동한 것인지 확인한다.

단 이 파일 경로 문제는:

```text
JUDGMENT_FACT_GAP
```

과 별도로 기록한다.

---

# 41. 경로 오류 때문에 명리 blocker를 만들지 않는다

문서가 이동했는데 verifier가 legacy path를 보는 것이라면:

```text
TEST_INFRA_PATH_GAP
```

로 분리한다.

---

# 42. 최종 판정

다음을 모두 충족하면:

```text
EVENT_JUDGMENT_FACT_GAP_CLASSIFIED
```

판정한다.

조건:

```text
[ ] 모든 Master 15 mapping row 감사
[ ] 모든 required Judgment fact 감사

[ ] Exposure gap 분리
[ ] Computation gap 분리
[ ] Source/policy gap 분리

[ ] contract source 사례 2건 blocker 정확히 특정
[ ] positive contract/business path blocker 특정

[ ] Adapter 중복 계산 감사
[ ] 최소 fix set 작성
[ ] priority 작성

[ ] 새 명리 규칙 추가 0
[ ] src/lib 변경 0
```

---

# 43. 다음 단계

`EVENT_JUDGMENT_FACT_GAP_CLASSIFIED` 이후에는
결과에 따라 **한 번의 최소 fix 작업**만 진행한다.

예:

```text
P4-M.5 Event Judgment Fact Minimal Fix
```

여기서:

```text
A. 기존 계산값 노출
B. 기존 Master로 확정된 missing structural fact 계산
```

만 구현한다.

C:

```text
SOURCE_OR_POLICY_GAP
```

은 구현하지 않는다.

P4-M.5 이후에는 P4-M.3B를 다시 전체 설계하지 않고,
**source 사례 2건 + positive contract/business branch만 재검증**한 뒤 P4-N으로 이동한다.