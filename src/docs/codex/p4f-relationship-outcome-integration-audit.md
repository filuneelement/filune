# FILUNE Codex P4-F
## Relationship Outcome Integration Audit

P4-E Relationship Outcome Semantic Engine — Batch 1 구현이 완료되었다.

현재 상태:

```text
READY_FOR_RELATIONSHIP_OUTCOME_AUDIT
```

구현된 범위:

```text
- 원국 관계 자리 semantic
- 근거가 확인된 육친 significator
- significator의 현재 기능
- 관계 자리와 관련된 합·충 등의 접점 signal
- 관계 자리와 관련된 변화 signal
- Natal / Luck scope
- provenance
- lifecycle
- ReadingAssembly 전달
```

의도적으로 구현하지 않은 범위:

```text
- 결혼 성사
- 약속 성사
- 좋은 관계 발전 시기
- 배우자 품질
- 이혼
- 외도
- 운명적 인연
- 궁합
- 관계 점수
- 관계 확률
```

현재 CH-06은:

```text
PARTIAL
```

상태다.

이번 단계에서는 새로운 관계 규칙을 구현하지 않는다.

실제:

```text
Canonical
→ Judgment
→ Luck
→ Relationship OutcomeFact
→ ReadingAssembly
```

통합 경로를 감사한다.

---

# 1. 최종 목표

최종 판정:

```text
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

또는:

```text
P4F_FIX_REQUIRED
```

---

# 2. 기준 문서

반드시 실제 저장소 파일을 읽는다.

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/13-reading-assembly-spec.md

src/docs/codex/p4d-outcome-semantic-source-audit-result.md
src/docs/codex/p4e-relationship-outcome-batch1-result.md
src/docs/codex/p4c-reading-assembly-integration-audit-result.md

src/docs/source/authority/A_rev182.md
src/docs/source/authority/B_rev38.md

src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
```

---

# 3. 이번 감사의 목적

P4-E에서 구현한 Relationship Outcome이 실제 엔진 결과를 입력받아:

```text
1. 올바른 관계 자리와 연결되는가
2. 실제 RelationFact를 재사용하는가
3. 현재 Runtime / Function 상태를 보존하는가
4. scope를 보존하는가
5. expired/stopped를 현재 결과에서 제거하는가
6. ReadingAssembly에 중복 없이 전달되는가
7. CH-06 / CH-09 / CH-10에서 같은 OutcomeFact를 재사용하는가
```

를 확인한다.

---

# 4. 새 판단 금지

이번 P4-F에서 다음을 추가하지 않는다.

```text
결혼 판단
좋은 관계 판단
나쁜 관계 판단
배우자 평가
이별 판단
이혼 판단
외도 판단
궁합 판단
점수
ranking
```

---

# 5. 실제 pipeline

최소 실제 birth fixture에서 다음을 실행한다.

```text
birth input
↓
CanonicalChart
↓
Judgment
↓
Luck snapshots
↓
Relationship Outcome
↓
ReadingAssembly
```

합성 OutcomeFact만 직접 넣는 테스트로 종료하지 않는다.

---

# 6. 기존 확정 fixture 우선

가능하면:

```text
CS-005
```

및 기존 Judgment 회귀 fixture를 우선 사용한다.

새 명리 기대값을 발명하지 않는다.

이번 감사 목적은:

```text
기존 확정 Judgment
→ Relationship Outcome
```

전달 무결성이다.

---

# 7. 최소 fixture 구성

최소 다음 사례를 확보한다.

```text
A. 원국 관계 자리만 확인되는 사례

B. 원국 관계 자리에 합 또는 승인된 접점 관계가 있는 사례

C. 원국 관계 자리에 충/변화 관계가 있는 사례

D. 운에서 관계 자리 접점이 발생하는 사례

E. 운에서 관계 자리 변화 signal이 발생하는 사례

F. 관계 signal이 만료되는 사례

G. relation source가 stopped/inactive 되는 사례
```

기존 fixture로 테스트할 수 없는 항목은:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 보고한다.

하드코딩 fixture를 새 판정 근거로 만들지 않는다.

---

# 8. 원국 관계 자리

실제 Canonical/Judgment에서:

```text
day branch
```

가 Relationship Outcome의 관계 자리로 정확히 연결되는지 확인한다.

Expected:

```text
relationship_palace_context
```

또는 현행 14 spec의 승인 semantic.

---

# 9. 실제 배우자 존재 추론 금지

관계 자리 semantic이 존재해도:

```text
partner_exists
married
dating
```

등 실제 생활 상태를 만들지 않는다.

---

# 10. 육친 significator

P4-E에서 구현한 significator가
실제 Judgment의 TenGod/Role/Function을 참조하는지 확인한다.

Outcome Engine이 자체적으로 TenGod를 다시 계산하면 FAIL.

---

# 11. significator 존재와 현재 기능 분리

다음 두 개를 구분한다.

```text
Role/history exists

vs

currently operating
```

과거 역할이 존재한다고
현재 관계 signal을 활성화하지 않는다.

---

# 12. Actual current function

관계 Outcome이 현재 의미를 생성할 때:

```text
CurrentFunction
Runtime
ActualStructuralFunction
```

을 실제로 보존하는지 확인한다.

---

# 13. RelationFact 재사용

Outcome Engine이:

```text
BranchRelationFact
```

또는 현재 동등 타입의 실제 ID를 재사용해야 한다.

Outcome에서 지지 합·충을 다시 계산하면 FAIL.

---

# 14. 합 통합 감사

실제 합 relation이 있는 경우:

Expected:

```text
contact / connection signal
```

승인 범위.

Expected 0:

```text
good relationship
marriage
perfect match
compatibility
```

---

# 15. 六合

六合가:

```text
elemental transformation
full stop
automatic favorable
```

로 잘못 해석되지 않는지 확인한다.

---

# 16. 삼합/반합

실제 formation 결과가 관계 Outcome에 연결되는 경우
현행 승인 semantic 범위만 사용한다.

금지:

```text
삼합
→ 좋은 인연
```

---

# 17. 충 통합 감사

실제 관계 자리 충이 있을 경우:

승인 범위:

```text
change
pressure
movement/contextual signal
```

Expected 0:

```text
breakup
divorce
relationship failure
```

---

# 18. 형·파·해

실제 relation이 존재하면
03 master의 기존 중요도와 조건을 그대로 보존한다.

```text
형 = conditional
파/해 = secondary
```

과도한 relationship outcome으로 승격 금지.

---

# 19. Origin scope

각 OutcomeFact가 source의 scope를 그대로 유지해야 한다.

```text
natal
daewoon
sewoon
month
```

---

# 20. Luck contact

실제 운에서 관계 자리에 접점이 발생할 경우:

```text
relationship_contact_signal
```

생성 확인.

검증:

```text
scope
source relation ID
source luck ID
certainty
currentlyEffective
```

---

# 21. Luck change

실제 운에서 관계 자리 변화가 확인되면:

```text
relationship_change_signal
```

생성.

금지:

```text
new relationship starts
relationship ends
```

---

# 22. Sewoon

세운 관계 signal이
실제 Sewoon snapshot과 정확히 연결되는지 확인한다.

---

# 23. Month

월운 관계 signal이
실제 절기월 snapshot과 정확히 연결되는지 확인한다.

calendar month를 새로 계산하지 않는다.

---

# 24. Day

현재 B 기본 감정서 Product에는
Day 관계 signal을 자동 노출하지 않는다.

Engine capability와 product routing을 구분한다.

---

# 25. inherited state

상위 scope에서 시작된 관계 signal이
하위 scope에서도 현재 유효하다면:

```text
same underlying event/source identity
```

를 보존하는지 확인한다.

새 OutcomeFact처럼 중복 발행하지 않는다.

---

# 26. expiry

운 조건이 끝난 후:

```text
currentlyEffective = false
expired = true
```

가 되거나 현행 동등 계약을 유지해야 한다.

Reading current output에는 포함하지 않는다.

---

# 27. expired history

과거 OutcomeFact의 provenance/history는 보존 가능하다.

그러나:

```text
실제로 그때 연애했다
헤어졌다
```

같은 사건은 생성하지 않는다.

---

# 28. stopped

관계 signal을 만드는 source가:

```text
stopped
inactive
```

이면 현재 active relationship Outcome을 생성하지 않는다.

---

# 29. reduced

source가 reduced면
full-strength confirmed outcome으로 승격하지 않는다.

현행 Outcome certainty/state 계약을 따른다.

---

# 30. conflict between signals

동일 scope에서:

```text
contact signal
+
change/pressure signal
```

이 동시에 존재할 수 있다.

한쪽을 삭제하거나:

```text
좋음
나쁨
```

으로 단순화하지 않는다.

둘 다 보존한다.

---

# 31. 총합 relationship polarity 금지

이번 Batch 결과를 이용해:

```text
relationship favorable
relationship unfavorable
```

총합 값을 만들지 않는다.

---

# 32. OutcomeFact stable ID

동일 실제 입력에서 반복 실행해:

```text
same OutcomeFact IDs
same semantic keys
```

인지 확인한다.

랜덤 ID 금지.

---

# 33. deterministic

동일 입력을 두 번 실행:

```text
buildRelationshipOutcomes(...)
```

또는 실제 공개 함수.

Expected:

```text
identical semantic output
```

---

# 34. 배열 순서 독립성

RelationFact/Role/LuckEffect 배열 순서만 바꿔도
Outcome semantic 결과가 동일해야 한다.

---

# 35. provenance completeness

모든 semantic OutcomeFact는 실제 upstream ID를 가져야 한다.

최소:

```text
sourceRelationIds
sourceJudgmentIds
sourceRoleIds
sourceLuckEffectIds
```

중 하나.

---

# 36. orphan provenance

OutcomeFact가 참조하는 모든 ID가
실제 upstream result에 존재하는지 검사한다.

Expected:

```text
orphan = 0
```

---

# 37. source mismatch

잘못된 다른 scope/source의 ID를 참조하면 FAIL.

---

# 38. ReadingAssembly 연결

실제:

```text
OutcomeFact
→ ReadingSemanticUnit
```

경로를 실행한다.

합성 adapter 테스트만으로 끝내지 않는다.

---

# 39. CH-06

Relationship OutcomeFact가
CH-06의 사용 가능한 subset으로 들어가는지 확인한다.

전체 상태는:

```text
PARTIAL
```

유지.

---

# 40. CH-06 READY 금지

다음이 아직 없기 때문에:

```text
commitment timing
favorable development
full relationship outcome
```

CH-06 전체를 READY로 바꾸면 FAIL.

---

# 41. CH-09

세운 관계 signal이 있으면
CH-09에 같은 OutcomeFact ID를 재사용한다.

---

# 42. CH-10

월운 관계 signal이 있으면
CH-10에 같은 OutcomeFact ID를 재사용한다.

---

# 43. same OutcomeFact reuse

같은 relationship signal이:

```text
CH-06
CH-09
CH-10
```

에 등장할 경우:

```text
same OutcomeFact ID
same provenance
same certainty
```

를 유지해야 한다.

---

# 44. B-6 repetition

ReadingAssembly에서는
동일 OutcomeFact를 반복하되:

```text
CH-06 = relationship-context conclusion
CH-09/10 = timing/context
```

등 repetition role만 달라야 한다.

동일 conclusion 복제 금지.

---

# 45. duplicate conclusion

Expected:

```text
0
```

---

# 46. Free mode

실제 동일 reading을:

```text
productScope = free
```

로 조립한다.

Expected:

```text
Daewoon relationship unit = 0
Sewoon relationship unit = 0
Month relationship unit = 0
Day relationship unit = 0
```

---

# 47. Natal relationship semantic

Free에서 원국 관계 semantic을 어느 정도 노출하는지는
B/13 spec의 existing routing만 따른다.

새 무료 관계 상품을 만들지 않는다.

---

# 48. Premium

Premium에서는 허용된 관계 timing/context를 사용 가능.

그러나 premium 때문에 direction/certainty를 바꾸지 않는다.

---

# 49. W-99

동일 Natal Relationship OutcomeFact가
free/premium 양쪽에서 사용된다면:

```text
same semantic ID
same certainty
same provenance
```

이어야 한다.

---

# 50. customerRenderable

Relationship Batch 1 통합이 완료되어도
전체 Reading:

```text
customerRenderable = false
```

상태가 유지되는지 확인한다.

Work/Money/Health/Selection gaps가 남아 있다.

---

# 51. 안전 감사

최소 다음 문자열/semantic type 발생을 검사한다.

```text
marriage_prediction
divorce_prediction
affair_prediction
fated_partner
perfect_match
partner_quality
compatibility
relationship_score
relationship_probability
```

Expected:

```text
0
```

---

# 52. 관계 점수 금지

숫자:

```text
%
score
rank
probability
```

를 관계 Outcome에 만들지 않는다.

---

# 53. 고객 생활상태 단정

다음 semantic 생성 0:

```text
has_spouse
is_married
is_single
has_partner
```

고객 context에 실제 입력되지 않은 경우.

---

# 54. RelationshipStyle 혼입 검사

Personality의:

```text
relationshipStyle
```

이 Relationship Outcome의 source provenance로
무단 변환되는지 검사한다.

이번 Batch는 구조적 Relationship Outcome 중심이다.

Personality는 자동 source가 아니다.

---

# 55. 궁합 분리

코드베이스에 이번 P4-F로:

```text
Compatibility
PairChart
PartnerMatch
CompatibilityScore
```

관련 신규 구현이 없어야 한다.

---

# 56. Work 격리

Work Outcome 관련 변경:

```text
0
```

---

# 57. Money 격리

Money Outcome 관련 변경:

```text
0
```

---

# 58. Health 격리

Health source contract / Outcome spec 관련 semantic 변경:

```text
0
```

이번 감사 때문에 건강 rule을 바꾸지 않는다.

---

# 59. Selection 격리

Top-3 선정 관련 변경:

```text
0
```

---

# 60. Judgment mutation

Relationship Outcome 실행 전후:

```text
JudgmentResult
```

비교.

변경:

```text
0
```

---

# 61. Luck mutation

Luck snapshot 전후 변경:

```text
0
```

---

# 62. Personality mutation

PersonalityResult 변경:

```text
0
```

---

# 63. Reading Assembly mutation

동일 입력으로 재조립 시
기존 result를 mutation하지 않아야 한다.

---

# 64. dependency direction

Expected:

```text
Outcome → Judgment result read-only
Reading → Outcome result read-only
```

금지:

```text
Judgment → Outcome
Personality → Outcome
```

역방향 import.

---

# 65. Locale text

OutcomeFact에:

```text
ko
ja
en
customer sentence
```

저장 0.

---

# 66. Renderer

P4-F에서 Relationship Renderer를 만들지 않는다.

---

# 67. LLM

Outcome 및 통합 감사 과정에서 runtime LLM 호출:

```text
0
```

---

# 68. 신규 검증 스크립트

권장:

```text
scripts/verify-relationship-outcome-integration-p4f.mjs
```

---

# 69. 테스트 결과 그룹 A

## Upstream integration

```text
Canonical → PASS
Judgment → PASS
Luck → PASS
Relationship Outcome → PASS
ReadingAssembly → PASS
```

---

# 70. 테스트 결과 그룹 B

## Provenance

```text
OutcomeFact count:
with provenance:
orphan:
wrong scope reference:
duplicate ID:
```

---

# 71. 테스트 결과 그룹 C

## Relationship semantics

```text
palace context:
significator:
natal contact:
natal change:
luck contact:
luck change:
```

---

# 72. 테스트 결과 그룹 D

## Lifecycle

```text
active:
reduced:
stopped:
expired:
inherited:
```

각 검증 결과.

---

# 73. 테스트 결과 그룹 E

## Reading routing

```text
CH-06:
CH-09:
CH-10:

same fact reuse:
duplicate conclusion:
```

---

# 74. 테스트 결과 그룹 F

## Free / Premium

```text
free luck leakage:
Natal mismatch:
certainty mismatch:
provenance mismatch:
```

---

# 75. 테스트 결과 그룹 G

## Safety

```text
marriage:
divorce:
affair:
fated partner:
partner quality:
compatibility:
score:
probability:
life-state assumption:
```

모두 0.

---

# 76. 기존 회귀

반드시:

```text
Judgment 35/35 PASS

P2-A~G PASS
P3-A~F PASS

P4-B PASS
P4-C PASS
P4-E PASS
```

---

# 77. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 78. 결과 파일

```text
src/docs/codex/
p4f-relationship-outcome-integration-audit-result.md
```

---

# 79. 최종 보고 A

다음 중 하나:

```text
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

또는:

```text
P4F_FIX_REQUIRED
```

---

# 80. B — Actual integration

```text
Canonical:
Judgment:
Luck:
Relationship Outcome:
ReadingAssembly:
```

---

# 81. C — Outcome coverage

```text
relationship palace:
significator:
natal contact:
natal change:
luck contact:
luck change:

commitment:
favorable development:
compatibility:
```

마지막 세 항목은:

```text
DEFERRED / NOT_IMPLEMENTED
```

유지.

---

# 82. D — Provenance

```text
facts:
with provenance:
orphan:
duplicate IDs:
scope mismatch:
```

---

# 83. E — Lifecycle

```text
active:
reduced:
stopped:
expired:
inherited:
current leakage:
```

---

# 84. F — Assembly

```text
CH-06 readiness:
CH-09 reuse:
CH-10 reuse:
duplicate conclusion:
B-6 role mismatch:
```

Expected:

```text
CH-06 = PARTIAL
```

---

# 85. G — Free / Premium

```text
free timing leakage:
semantic mismatch:
certainty mismatch:
provenance mismatch:
```

모두 0.

---

# 86. H — Safety

모든 금지 Outcome 건수 기록.

Expected 모두 0.

---

# 87. I — Regression

```text
Judgment:
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:
P2-G:

P3-A:
P3-B:
P3-C:
P3-D:
P3-E:
P3-F:

P4-B:
P4-C:
P4-E:
P4-F:

tsc:
build:
```

---

# 88. J — 남은 상태

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
TECH_DEBT:
UPSTREAM_REGRESSION:
```

---

# 89. 종료 조건

다음을 만족하면:

```text
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

판정한다.

```text
[ ] 실제 Judgment → Relationship Outcome 연결
[ ] 실제 Luck → Relationship Outcome 연결
[ ] 실제 Outcome → ReadingAssembly 연결
[ ] 관계 자리 source 일치
[ ] significator source 일치
[ ] relation source ID 일치
[ ] scope mismatch 0
[ ] orphan provenance 0
[ ] duplicate ID 0
[ ] stable deterministic ID
[ ] contact/change 동시 보존 가능
[ ] stopped/expired current leakage 0
[ ] CH-06 PARTIAL 유지
[ ] CH-09/10 동일 OutcomeFact 재사용
[ ] B-6 duplicate conclusion 0
[ ] free luck leakage 0
[ ] free/premium mismatch 0
[ ] 결혼 예측 0
[ ] 이혼 예측 0
[ ] 외도 예측 0
[ ] partner quality 0
[ ] 궁합 0
[ ] score/probability 0
[ ] life-state assumption 0
[ ] Work/Money/Health 변경 0
[ ] Selection 변경 0
[ ] Judgment/Personality mutation 0
[ ] locale text 0
[ ] LLM 0
[ ] 기존 회귀 PASS
[ ] tsc/build PASS
```

---

# 90. 완료 의미

P4-F가 통과하면 다음 subset을 닫는다.

```text
Individual Relationship Outcome v1 — Batch 1

원국 관계 자리
+
육친 significator context
+
접점 signal
+
변화 signal
+
scope/lifecycle/provenance
```

아직 닫히지 않는 것:

```text
관계 발전 favorable/unfavorable
결혼/약속 시기
관계 결과
궁합
```

---

# 91. 다음 단계

P4-F 완료 후
P4-D 결과에 따라 다음 구현 후보를 비교한다.

현재 후보:

```text
Money Outcome — supported subset
Health Outcome — supported subset
```

다음 Batch는:

```text
source readiness
existing engine dependency
customer value
implementation risk
```

를 비교해 결정한다.

Work는 현재 `SOURCE_GAP`이므로
우선 구현 대상으로 올리지 않는다.

Compatibility는 개인 Outcome과 분리하여
개인 감정서 v1 이후 별도 트랙으로 유지한다.