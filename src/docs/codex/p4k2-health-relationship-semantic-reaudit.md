# FILUNE Codex P4-K.2
## Health & Relationship Semantic Reaudit

진입 조건:

```text
READY_FOR_HEALTH_RELATIONSHIP_REAUDIT
OUTCOME_ASSERTION_POLICY_READY
```

P4-K backaudit에서 확인된 Health·Relationship의 의미 축소를 P4-K.1에서 보강했다.

이번 단계는 **새 기능 구현이 아니라 재감사**다.

원칙:

```text
코드 수정 금지
새 명리 규칙 추가 금지
기존 기대값 변경 금지
```

문제가 발견되면 수정하지 말고 정확히 분류하여 보고한다.

---

# 1. 최종 목표

성공:

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

실패:

```text
P4K2_FIX_REQUIRED
```

---

# 2. 반드시 먼저 읽을 파일

```text
src/docs/rules/master/14-outcome-semantic-spec.md

src/docs/codex/p4-outcome-assertion-policy-correction-result.md
src/docs/codex/p4k-health-relationship-assertion-backaudit-result.md
src/docs/codex/p4k1-health-relationship-semantic-expansion-result.md

src/docs/codex/p4e-relationship-outcome-batch1-result.md
src/docs/codex/p4f-relationship-outcome-integration-audit-result.md

src/docs/codex/p4g-health-outcome-batch1-result.md
src/docs/codex/p4g1-health-outcome-reactivation-fix-result.md
src/docs/codex/p4h-health-outcome-integration-audit-result.md
```

구현:

```text
src/lib/outcome/health/
src/lib/outcome/relationship/
src/lib/reading/
```

---

# 3. 감사 기준 — 공통 Outcome Policy

다음을 다시 확인한다.

```text
source supports
→ 생활 결과까지 명확히 보존

source does not support
→ 새 결과를 만들지 않음

한 축 deferred
→ 다른 confirmed 축을 숨기지 않음

긍정 + 부정
→ 동시에 보존 가능
```

---

# 4. Health 최종 결과 축

최소 다음 결과 타입 또는 repository의 동등 타입을 확인한다.

```text
traditional_body_correspondence
body_area_burden
health_burden
health_problem_prone_period
health_management_period
```

각각 존재 여부와 실제 생성 조건을 보고한다.

---

# 5. Health — correspondence와 burden

반드시 구분되어야 한다.

```text
traditional_body_correspondence
=
전통적으로 연결되는 신체 영역

body_area_burden
=
현재 구조적 부담과 연결된 실제 신체 영역 부담
```

금지:

```text
전통 대응만 있음
→ 현재 부담으로 자동 승격
```

---

# 6. Health — 생활 결과 축소 여부

실제 harmful Health condition이 확정된 fixture에서 결과가:

```text
건강 문제가 생기기 쉬운 조건
건강 부담이 커지는 시기
```

까지 의미적으로 살아 있는지 확인한다.

다음으로만 남으면 FAIL:

```text
health attention
structural signal
health context
```

---

# 7. Health — 특정 신체 영역

source-supported 조건이 충족되는 fixture에서:

```text
특정 전통 신체 영역의 부담이 커질 수 있음
```

수준의 의미가 실제 Outcome에 남아 있는지 확인한다.

---

# 8. Health — 과잉 부위 확대

乙·丁·庚·壬 기존 specificity 제한을 재검증한다.

다른 일간의 specific body area 자동 상속:

```text
0
```

---

# 9. Health — 기간이라는 이유의 확정도 하향

P4-K에서 확인했던 오류를 다시 검사한다.

금지:

```text
current harmful condition = confirmed
+
scope가 기간임
→ certainty 하향
```

Expected:

```text
period-only certainty downgrade = 0
```

---

# 10. Health — certainty source

certainty는 오직:

```text
structural evidence
source mapping strength
current activation
```

에 따라 결정되어야 한다.

---

# 11. Health — 실제 시기 결과

source-supported 현재 활성 조건에서:

```text
health_problem_prone_period
```

또는 동등 결과가 실제로 생성되는지 확인한다.

고객 의미:

```text
이 시기에는 건강 문제가 나타나기 쉬움
평소보다 건강 부담이 커질 수 있음
```

까지 보존.

---

# 12. Health — management period

source가 관리·주의할 시기를 실제로 지원하는 fixture에서는:

```text
health_management_period
```

또는 동등 결과 확인.

fixture가 없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

허용.

---

# 13. Health — 의료 예측 금지 유지

다음 생성:

```text
질병명 확정
진단
검사 처방
약 처방
치료
수술
수명
사망 시점
```

모두:

```text
0
```

---

# 14. Health — 의미를 다시 약화하면 안 됨

의료 예측을 금지한다는 이유로:

```text
건강 문제가 생기기 쉬움
특정 영역 부담이 커질 수 있음
관리할 필요가 커지는 시기
```

까지 삭제되어서는 안 된다.

---

# 15. Health lifecycle

기존:

```text
active
reduced
stopped
conditional
expired
reactivated
```

회귀 확인.

---

# 16. Health 보호 상실 재활성

P4-G.1 회귀:

```text
보호 기능 상실
→ harmful path 재활성
→ Health Outcome 재활성
```

PASS 여부 확인.

---

# 17. Health month-window 핵심 회귀

P4-K에서 확인된 월 누락 사례를 반드시 다시 사용한다.

비교:

```text
full Judgment chain
vs
monthly window
```

Expected:

```text
같은 Health fact 존재
same semantic
same source identity
same provenance
same certainty
same scope
same stable ID
```

---

# 18. Month-window 누락

Expected:

```text
missing Health fact = 0
```

---

# 19. Month-window 중복

Expected:

```text
duplicate Health fact = 0
```

---

# 20. Month-window lifecycle

expired된 이전 월 Fact가 다음 월 current 결과에 남는지 확인한다.

Expected:

```text
expired current leakage = 0
```

---

# 21. Relationship 기존 결과 회귀

기존:

```text
relationship_contact_signal
relationship_change_signal
```

또는 동등 semantic을 그대로 유지해야 한다.

---

# 22. Relationship 신규 축

최소:

```text
relationship_formation
relationship_commitment
relationship_pressure
```

또는 동등 타입을 확인한다.

---

# 23. Relationship formation

CS-127 등 실제 source-supported fixture에서:

```text
relationship_formation = confirmed
```

확인.

단순 contact만 존재하면 FAIL.

---

# 24. Formation 의미

Outcome 의미가 최소:

```text
새로운 중요한 관계가 형성되기 쉬움
기존 접점이 실제 관계로 발전하기 쉬움
```

까지 보존되어야 한다.

---

# 25. Romantic-only 강제 금지

relationship formation을 무조건:

```text
연애
결혼
```

으로만 제한하지 않는다.

source가:

```text
동업
협력관계
중요한 관계
```

를 포함하면 해당 context도 보존한다.

---

# 26. 현재 관계 상태 추정 금지

사주 결과만으로:

```text
미혼
기혼
솔로
연애 중
```

추정:

```text
0
```

---

# 27. Relationship commitment

source-supported 실제 fixture가 있으면:

```text
relationship_commitment
```

검증.

예:

```text
결혼
중요한 약속
관계 확정
```

의미.

---

# 28. Commitment fixture가 없을 때

실제 양성 fixture가 없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 보고한다.

이를 이유로 전체 P4-K.2 FAIL 처리하지 않는다.

---

# 29. Commitment를 억지로 만들지 않기

감사 통과용 synthetic 명리 기대값 생성 금지.

---

# 30. Relationship pressure

OFF-T2 등 현재 fixture에서:

```text
relationship_pressure = confirmed
```

검증.

---

# 31. Pressure 의미

최소:

```text
관계 부담
갈등
관계로 인한 압박
```

중 source-supported 의미를 보존해야 한다.

---

# 32. Pressure ≠ change

pressure를 generic:

```text
relationship_change
```

하나로 축소하면 FAIL.

---

# 33. Pressure ≠ breakup

자동:

```text
이별
이혼
관계 종료
```

생성:

```text
0
```

---

# 34. Breakdown

breakdown/ending은:

```text
SOURCE_GAP
NOT_IMPLEMENTED
```

또는 현재 spec의 정확한 상태로 보고한다.

source-supported 별도 계약 없이는 구현하지 않는다.

---

# 35. Formation + pressure

현재 실제 fixture가 있으면:

```text
relationship_formation
+
relationship_pressure
```

동시 보존 확인.

없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

허용.

---

# 36. Commitment + pressure

동일 원칙.

fixture 없으면 보류 가능.

---

# 37. Mixed 결과를 애매함으로 축소 금지

금지:

```text
관계 형성 가능성도 있고 부담도 있으니
관계운은 애매하다
```

Expected:

```text
formation = confirmed
pressure = confirmed
```

둘 다 보존.

---

# 38. 관계의 context

가능한 경우 확인:

```text
romantic
partnership
general-important-relationship
```

source가 구분하는 범위까지만.

---

# 39. Compatibility 경계

이번 개인 Relationship Outcome과:

```text
Person A + Person B Compatibility
```

는 계속 별도.

Compatibility import/dependency 추가:

```text
0
```

---

# 40. 사용자용 명리 용어 검사

고객에게 출력 가능한 문자열/renderer/helper에서 다음 직접 노출을 검색한다.

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

Expected:

```text
new direct customer leakage = 0
```

---

# 41. 내부 명리 용어는 허용

다음 내부 영역에서는 허용:

```text
engine
types
provenance
debug
audit
```

고객 출력만 금지한다.

---

# 42. Assertion Policy — Health

다음 건수를 계산한다.

```text
structural-only weakening
period-only certainty downgrade
confirmed-axis suppression
unsupported invention
```

Expected:

```text
0
0
0
0
```

---

# 43. Assertion Policy — Relationship

다음 건수를 계산한다.

```text
formation → contact-only collapse
commitment → change-only collapse
pressure → change-only collapse
mixed outcome → ambiguous collapse
unsupported invention
```

Expected:

```text
0
0
0
0
0
```

단 commitment 미검증 fixture는 collapse 0과 별개로 NOT_TESTABLE로 기록.

---

# 44. Source gap을 숨기지 않기

현재 구현되지 않은 결과는 정확히 분류한다.

예:

```text
breakdown
specific marriage-event timing
compatibility
```

실제 source/contract 상태에 따라:

```text
SOURCE_GAP
DEFERRED
NOT_IMPLEMENTED
```

중 정확한 상태를 사용한다.

---

# 45. Judgment 변경 여부

P4-K.1 전후:

```text
Judgment semantic changes = 0
```

이어야 한다.

---

# 46. Money 변경 여부

```text
Money semantic changes = 0
```

P4-J blocker는 그대로 남아 있어야 한다.

---

# 47. Personality

변경:

```text
0
```

---

# 48. Work

변경:

```text
0
```

---

# 49. Compatibility

변경:

```text
0
```

---

# 50. Reading Assembly 회귀

Health/Relationship 신규 semantic이 Assembly에서:

```text
근거 ID
certainty
scope
stable ID
```

를 잃지 않는지 확인한다.

---

# 51. CH 배치

현재 13-reading-assembly-spec의 배치 계약을 그대로 따른다.

새 chapter를 임의 생성하지 않는다.

---

# 52. CH-10 Health

P4-K에서 문제가 있던 월 Health 결과가
CH-10에 정상 유지되는지 재확인한다.

---

# 53. Free leakage

Health/Relationship의 유료 시기 정보가 Free 결과에 새어 나오는지:

```text
0
```

---

# 54. Determinism

같은 실제 입력을 2회 실행.

Expected 동일:

```text
OutcomeFact ID
semantic
certainty
scope
provenance
```

---

# 55. 배열 순서 독립성

입력 Relation/Role/Effect 배열 순서 변경으로 결과 의미가 바뀌지 않아야 한다.

---

# 56. Mutation

Health/Relationship Outcome 실행으로:

```text
JudgmentResult mutation
PersonalityResult mutation
Luck snapshot mutation
```

모두:

```text
0
```

---

# 57. 신규 검증 스크립트

권장:

```text
scripts/verify-health-relationship-reaudit-p4k2.mjs
```

---

# 58. 코드 수정 금지

이번 P4-K.2에서:

```text
src/lib changes = 0
```

이어야 한다.

감사 스크립트 및 결과 문서만 허용.

문제가 발견되면 코드 수정하지 않고 FAIL을 보고한다.

---

# 59. 기존 회귀

반드시 실행:

```text
Judgment 35/35

P2-A~G
P3-A~F

P4-B
P4-C
P4-E
P4-F
P4-G
P4-H
P4-I
P4-K.1
```

기존 기대값 수정 금지.

---

# 60. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 61. 결과 파일

반드시 생성:

```text
src/docs/codex/p4k2-health-relationship-semantic-reaudit-result.md
```

---

# 62. 최종 보고 A — Health

```text
traditional_body_correspondence:
body_area_burden:
health_burden:
health_problem_prone_period:
health_management_period:

period-only certainty downgrade:
month-window omission:
month-window ID mismatch:
expired leakage:
```

---

# 63. Health gaps

```text
semantic gaps before P4-K.1:
fixed:
remaining:
```

---

# 64. 최종 보고 B — Relationship

```text
contact:
change:
formation:
commitment:
pressure:
breakdown:
partnership/general relationship context:
```

---

# 65. Relationship gaps

```text
semantic gaps before P4-K.1:
fixed:
remaining:
```

---

# 66. Mixed results

```text
formation + pressure:
commitment + pressure:
```

각각:

```text
PASS
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

---

# 67. Terminology

```text
customer-visible Saju jargon leakage:
```

Expected:

```text
0
```

---

# 68. Assertion Policy

```text
Health structural-only weakening:
Health period certainty downgrade:
Health confirmed-axis suppression:

Relationship formation collapse:
Relationship commitment collapse:
Relationship pressure collapse:
Relationship mixed collapse:

unsupported result invention:
```

Expected 모두 0.

---

# 69. Isolation

```text
Judgment changes:
Money changes:
Personality changes:
Work changes:
Compatibility changes:
```

Expected 모두 0.

---

# 70. 전체 판정

다음을 만족하면:

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

판정한다.

조건:

```text
[ ] Health structural-only 의미 축소 0
[ ] Health period-only certainty downgrade 0
[ ] Health monthly window 누락 0
[ ] Health same fact stable ID/provenance 유지
[ ] Health unsupported medical prediction 0

[ ] Relationship contact/change 회귀 유지
[ ] Relationship formation 독립 결과 정상
[ ] Relationship pressure 독립 결과 정상
[ ] Commitment fixture 없으면 정확히 NOT_TESTABLE
[ ] pressure → breakup 자동 추론 0
[ ] mixed outcome collapse 0

[ ] 사용자용 명리 전문용어 누출 0

[ ] unsupported 생활 결과 발명 0
[ ] Judgment semantic 변경 0
[ ] Money 변경 0
[ ] Compatibility 변경 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 71. 실패 분류

문제가 있으면 다음 중 하나 이상으로 정확히 분류한다.

```text
HEALTH_SEMANTIC_BUG
HEALTH_MONTH_WINDOW_BUG
HEALTH_CERTAINTY_BUG

RELATIONSHIP_FORMATION_BUG
RELATIONSHIP_COMMITMENT_BUG
RELATIONSHIP_PRESSURE_BUG
RELATIONSHIP_MIXED_OUTCOME_BUG

CUSTOMER_TERMINOLOGY_LEAK
ASSERTION_POLICY_VIOLATION
FIXTURE_GAP
SOURCE_GAP
```

---

# 72. P4-K.2 통과 후 다음 순서

성공:

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

이면 다음은 P4-J에서 발견된:

```text
UPSTREAM_JUDGMENT_REGRESSION
```

을 수정한다.

문제:

```text
CS-126 12절기월 평가가
Money Outcome에 도달하기 전에
Judgment 기간 승계 오류로 중단
```

이를 별도 fix 작업으로 처리한다.

그 후 기존 P4-J를 기대값 변경 없이 재실행한다.

---

# 73. Money 완료 후

P4-J까지:

```text
MONEY_OUTCOME_BATCH1_COMPLETE
```

로 닫히면 다음은:

```text
Event Timing Layer
```

이다.

우선 범위:

```text
계약 성사에 유리한 시기
계약이 지연되기 쉬운 시기

사업 시작에 유리한 시기
사업을 확장하기보다 조정하는 편이 나은 시기
```

내부적으로는 기존 운 scope를 사용하지만
고객에게는 명리 전문용어를 직접 노출하지 않는다.