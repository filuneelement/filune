# FILUNE Codex P4-K.1
## Health & Relationship Semantic Expansion

진입 조건:

```text
HEALTH_RELATIONSHIP_ASSERTION_AUDIT_COMPLETE
SEMANTIC_EXPANSION_REQUIRED
OUTCOME_ASSERTION_POLICY_READY
```

이번 작업은 P4-K backaudit에서 확인된 Health·Relationship의 의미 축소와 누락을 수정한다.

새 명리 규칙을 연구하지 않는다.

현재 원자료·Master 14·backaudit에서 확인된 범위만 구현한다.

---

# 1. 최종 목표

성공:

```text
READY_FOR_HEALTH_RELATIONSHIP_REAUDIT
```

실패:

```text
P4K1_FIX_REQUIRED
```

---

# 2. 반드시 먼저 읽을 파일

```text
src/docs/rules/master/14-outcome-semantic-spec.md

src/docs/codex/p4-outcome-assertion-policy-correction-result.md
src/docs/codex/p4k-health-relationship-assertion-backaudit-result.md

src/docs/codex/p4e-relationship-outcome-batch1-result.md
src/docs/codex/p4f-relationship-outcome-integration-audit-result.md

src/docs/codex/p4g-health-outcome-batch1-result.md
src/docs/codex/p4g1-health-outcome-reactivation-fix-result.md
src/docs/codex/p4h-health-outcome-integration-audit-result.md

src/docs/source/primary/07-사주풀이예시.md
src/docs/source/health/FILUNE-19A-premium-health-evidence.md
```

현재 구현:

```text
src/lib/outcome/health/
src/lib/outcome/relationship/
src/lib/reading/
```

을 실제 확인한다.

---

# 3. 공통 Assertion Policy

반드시 유지:

```text
근거가 확인된 생활 결과는 끝까지 판정한다.

근거 없는 결과는 만들지 않는다.

한 축이 불명확하다는 이유로
확정 가능한 다른 축을 숨기지 않는다.

긍정과 부정 결과는 동시에 존재할 수 있다.
```

---

# 4. 이번 작업에서 금지되는 과잉 보수성

다음 패턴은 FAIL이다.

```text
건강 문제가 생기기 쉬운 구조가 확정
→ "건강 관련 구조적 신호가 있습니다"로만 출력

특정 신체 영역 부담이 source-supported
→ "전통적으로 연관된 부위입니다"로만 축소

관계 형성이 source-supported
→ "관계 접점이 생깁니다"로만 축소

중요한 약속/관계 진전이 source-supported
→ "관계 변화가 있을 수 있습니다"로만 축소
```

---

# 5. Health 확장 — 결과 축

Health Outcome은 최소 다음을 구분한다.

```text
traditional_body_correspondence
body_area_burden
health_burden
health_problem_prone_period
health_management_period
```

실제 semantic 이름은 최신 Master 14와 repository convention에 맞춘다.

---

# 6. traditional_body_correspondence 유지

기존 전통 신체 대응은 그대로 유지한다.

이는:

```text
전통적으로 연결되는 신체 영역
```

이라는 baseline 정보다.

---

# 7. correspondence와 burden 분리

금지:

```text
전통적으로 연결됨
=
현재 부담이 있음
```

현재 구조적 손상·압력이 실제 확인되어야
`body_area_burden` 계열 결과를 만든다.

---

# 8. body-area burden

원자료와 Health source contract에서:

```text
손상된 용신/일간의 오행
+
현재 harmful health condition
```

이 특정 신체 영역 부담과 연결되는 경우,

단순 correspondence를 넘어서:

```text
이 시기에 해당 전통 신체 영역의 부담이 커질 수 있음
```

수준의 Outcome을 허용한다.

---

# 9. 과잉 부위 확대 금지

기존 乙·丁·庚·壬 specificity 제한을 유지한다.

다른 일간의 구체 부위를 복사하지 않는다.

---

# 10. Health burden

현재 Judgment에서 건강 관련 harmful path가 실제 operating이면:

```text
health_burden
```

또는 동등 semantic을 생성한다.

의미:

```text
건강 문제가 생기기 쉬워지는 조건이 실제 활성화됨
```

이다.

단순 `attention`으로 약화시키지 않는다.

---

# 11. Health problem-prone period

운의 특정 범위에서 harmful health condition이 실제 활성화되고
source가 시기 결과까지 지원하는 경우:

```text
health_problem_prone_period
```

또는 동등 semantic을 생성한다.

고객 의미:

```text
이 시기에는 건강 문제가 나타나기 쉬움
이 시기에는 평소보다 건강 부담이 커질 수 있음
```

수준이다.

---

# 12. Health management period

원자료가 명시적으로 관리·주의가 필요한 달/시기로 연결하는 경우:

```text
health_management_period
```

을 별도로 둘 수 있다.

하지만 이를 단순 vague attention으로 낮추지 않는다.

---

# 13. 건강 문제 ≠ 의학적 진단

계속 금지:

```text
질병명 확정
암/당뇨/심장병 등 진단
의학적 원인 진단
검사 처방
약물 처방
수술 예측
수명 예측
사망 시점
```

---

# 14. "문제가 생기기 쉬움"은 허용

다음은 source-supported 경우 허용한다.

```text
건강 문제가 생기기 쉬운 시기
건강 부담이 커지는 시기
특정 신체 영역이 평소보다 부담받기 쉬운 시기
```

이것을 의료 진단과 혼동해 차단하지 않는다.

---

# 15. Health certainty 과잉 하향 금지

P4-K에서 확인된:

```text
"기간이라는 이유만으로 확정도를 낮춘 분기"
```

를 조사한다.

금지:

```text
current harmful condition = confirmed
+
scope = period
→ certainty 자동 하향
```

scope가 기간이라는 사실만으로 certainty를 낮추지 않는다.

---

# 16. certainty는 근거 수준으로 결정

certainty는:

```text
현재 structural evidence
source mapping strength
current activation state
```

에 따라 결정한다.

시간 범위가 길거나 짧다는 이유만으로 낮추지 않는다.

---

# 17. Health lifecycle

기존:

```text
active
reduced
stopped
conditional
expired
reactivated
```

계약 유지.

---

# 18. 보호 상실 후 재활성

P4-G.1에서 수정한:

```text
보호 기능 상실
→ harmful path 재활성
→ Health Outcome 재활성
```

회귀를 유지한다.

---

# 19. Health 월 단위 누락 버그

P4-K 감사에서:

```text
전체 Judgment 체인에서는
CH-10에 배치되는 월 Health Fact 1건이 존재

하지만 월 단위 window 경로에서는 누락
```

이 재현되었다.

이 누락을 수정한다.

---

# 20. Month window 원칙

동일 실제 월 조건이라면:

```text
full Judgment path
monthly window path
```

에서 같은 Health OutcomeFact identity/provenance가 유지되어야 한다.

---

# 21. Month mismatch

Expected:

```text
full pipeline Health month facts
=
monthly window Health month facts
```

의미 기준 동일.

누락:

```text
0
```

---

# 22. 동일 ID

같은 월의 같은 원인으로 생성된 Health OutcomeFact는:

```text
same semantic type
same source identity
same provenance
same scope
same stable ID
```

를 사용한다.

---

# 23. Relationship 확장 — 기존 semantic 유지

현재의:

```text
relationship_contact_signal
relationship_change_signal
```

또는 동등 타입 자체는 삭제하지 않는다.

P4-K 결과상 이 두 신호의 과도한 완화는 확인되지 않았다.

---

# 24. Relationship 신규 결과 축

최소 다음을 독립적으로 검토·구현한다.

```text
relationship_formation
relationship_commitment
relationship_pressure
```

source-supported 경우.

---

# 25. Relationship formation

원자료가:

```text
결혼
동업
중요한 협력관계가 형성되기 쉬움
```

등 실제 관계 형성을 지원하는 조건이라면,

단순:

```text
contact_signal
```

로 끝내지 않는다.

```text
relationship_formation
```

계열 결과를 생성한다.

---

# 26. formation의 의미

formation은:

```text
새로운 중요 관계가 형성되기 쉬움
기존 접점이 실제 관계로 발전하기 쉬움
```

정도의 의미다.

---

# 27. 현재 연애/혼인 상태 추정 금지

금지:

```text
사용자는 미혼이다
현재 배우자가 없다
현재 연애 중이다
```

를 사주로 추정.

---

# 28. 상태 미상일 때도 Outcome은 가능

사용자 상태를 모른다고 해서
관계 형성 신호 자체를 삭제하지 않는다.

예:

```text
새로운 관계가 형성되기 쉬운 시기
```

는 가능.

기존 관계가 있는 사람에게는
renderer가 상황에 맞는 설명을 선택할 수 있도록
semantic 자체는 상태 중립적으로 만든다.

---

# 29. Relationship commitment

source가 결혼·약속·관계 확정까지 지원하는 조건은:

```text
relationship_commitment
```

계열 semantic 후보로 둔다.

---

# 30. commitment를 formation과 분리

```text
접점 발생
≠
관계 형성
≠
중요한 약속/확정
```

이다.

모두 `relationship_change` 하나로 뭉개지 않는다.

---

# 31. Relationship pressure

원자료가:

```text
배우자 문제
관계 부담
갈등
관계로 인한 고통
```

까지 구조적으로 연결하는 경우:

```text
relationship_pressure
```

를 별도로 생성한다.

---

# 32. pressure ≠ breakdown

금지:

```text
관계 부담
→ 자동 이별/이혼
```

---

# 33. breakdown은 별도 근거 필요

관계 종료·이혼까지 source가 직접 지원하고
필요 조건을 구조화할 수 있는 경우에만
후속 mapping 후보로 기록한다.

이번 P4-K.1에서 일반화하지 않는다.

---

# 34. Relationship formation + pressure 동시 허용

예:

```text
relationship_formation = confirmed
relationship_pressure = confirmed
```

동시 가능.

이를:

```text
관계운이 애매함
```

으로 합치지 않는다.

---

# 35. Commitment + pressure 동시 가능

```text
중요한 약속/관계 진전
+
갈등/부담 동반
```

도 source-supported 경우 둘 다 보존한다.

---

# 36. 동업/협력관계

source가:

```text
동업
중요한 협력관계
```

를 명시하는 경우
romantic-only 의미로 강제하지 않는다.

필요하다면 context subtype을 둔다.

예:

```text
romantic
partnership
general-important-relationship
```

하지만 source가 구분하지 못하면 억지 subtype을 만들지 않는다.

---

# 37. Compatibility 분리

이번 확장은 개인 한 사람의 관계 Outcome이다.

```text
Person A + Person B
→ 궁합
```

은 여전히 별도 트랙.

Compatibility code 변경 0.

---

# 38. Relationship scope

기존:

```text
natal
daewoon
sewoon
month
```

내부 scope 유지.

고객에게 명리 용어를 직접 노출하지 않는다.

---

# 39. 고객용 명리 용어 금지

향후 renderer에서 다음 직접 노출 금지:

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

내부 semantic/provenance에서는 사용 가능.

---

# 40. 고객용 현실 언어

향후 renderer는 예:

```text
장기적인 흐름
올해
이 시기
○월
```

등으로 변환할 수 있어야 한다.

이번 작업에서는 renderer 전체 구현은 하지 않는다.

---

# 41. Master 14 업데이트

P4-K backaudit 결과를 반영해:

```text
src/docs/rules/master/14-outcome-semantic-spec.md
```

를 수정한다.

최소 추가:

```text
Health:
- body area burden
- health burden
- health problem-prone period
- certainty not downgraded merely by period scope

Relationship:
- formation
- commitment
- pressure
- contact/change와 독립
- mixed outcomes 허용
```

---

# 42. Source mapping 명시

각 신규 semantic마다:

```text
requiredFacts
requiredCurrentState
realLifeMeaning
limitations
provenance
```

를 문서에 기록한다.

---

# 43. 신규 결과는 source-supported만

보수성 제거를 이유로
새 결과를 자유 추론하지 않는다.

원칙:

```text
source supports
→ 끝까지 말함

source does not support
→ 만들지 않음
```

---

# 44. Health 테스트 A

기존 structural health harmful path에서:

Expected:

```text
health_burden = 생성
```

가능한 경우:

```text
health_problem_prone_period = 생성
```

---

# 45. Health 테스트 B

단순 전통 신체 대응만 존재:

Expected:

```text
traditional correspondence = 생성
body_area_burden = 0
```

---

# 46. Health 테스트 C

구체 부위 부담까지 source-supported:

Expected:

```text
body_area_burden = 생성
```

---

# 47. Health 테스트 D

confirmed harmful condition + period scope:

Expected:

```text
certainty 자동 하향 = 0
```

---

# 48. Health 테스트 E — Month window

P4-K에서 재현된 월 Health Fact 누락 사례를 직접 사용한다.

Expected:

```text
full pipeline fact count = month window fact count
missing = 0
```

동일 source fact:

```text
same ID
same provenance
```

---

# 49. Health 테스트 F

expired condition:

```text
current health burden = inactive
```

가짜 회복 Outcome 0.

---

# 50. Relationship 테스트 A — contact

기존 contact signal 회귀 유지.

---

# 51. Relationship 테스트 B — change

기존 change signal 회귀 유지.

---

# 52. Relationship 테스트 C — formation

source-supported 실제 fixture에서:

```text
relationship_formation = confirmed
```

Expected.

`contact`만 생성되고 formation 누락이면 FAIL.

---

# 53. Relationship 테스트 D — commitment

source-supported fixture가 있으면:

```text
relationship_commitment = confirmed
```

없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 기록.

새 명리 기대값을 발명하지 않는다.

---

# 54. Relationship 테스트 E — pressure

source-supported 관계 부담 fixture에서:

```text
relationship_pressure = confirmed
```

Expected.

---

# 55. Relationship 테스트 F — mixed

가능한 실제 fixture에서:

```text
formation + pressure
```

또는:

```text
commitment + pressure
```

동시 보존.

fixture 없으면 NOT_TESTABLE 가능.

---

# 56. Relationship 테스트 G

pressure만 있다고:

```text
breakdown/divorce
```

자동 생성 0.

---

# 57. Assertion Policy 검증

Health:

```text
source-supported result weakened to structural-only = 0
confirmed result weakened because it is a period = 0
```

Relationship:

```text
formation weakened to contact-only = 0
commitment weakened to change-only = 0
pressure weakened to generic change-only = 0
mixed outcome collapsed = 0
```

---

# 58. Unsupported invention

둘 다:

```text
unsupported new real-life result = 0
```

---

# 59. Judgment 변경 금지

이번 semantic expansion을 위해
명리 판정 의미를 바꾸지 않는다.

```text
src/lib/judgment/
```

semantic changes:

```text
0
```

---

# 60. Money 변경 금지

현재 P4-I Money 구현 의미 변경 0.

P4-J blocker도 이번 작업에서 수정하지 않는다.

---

# 61. Work 변경 금지

0.

---

# 62. Compatibility 변경 금지

0.

---

# 63. Personality 변경 금지

0.

---

# 64. Renderer

이번 단계에서는 전용 Health/Relationship 고객 renderer를 새로 완성하지 않는다.

단 기존 renderer가 직접 참조하는 타입이 깨지지 않도록 한다.

---

# 65. 신규 검증 스크립트

권장:

```text
scripts/verify-health-relationship-expansion-p4k1.mjs
```

---

# 66. 전체 회귀

반드시:

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
```

기존 기대값 유지.

---

# 67. Health 기존 완료 계약

확장 후에도:

```text
HEALTH_OUTCOME_BATCH1_COMPLETE
```

기존 기능 회귀 없음.

---

# 68. Relationship 기존 완료 계약

확장 후에도:

```text
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

기존 기능 회귀 없음.

---

# 69. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 70. 결과 파일

```text
src/docs/codex/p4k1-health-relationship-semantic-expansion-result.md
```

---

# 71. 최종 보고 A — Health

```text
traditional correspondence:
body-area burden:
health burden:
health problem-prone period:
health management period:

certainty downgrade bug:
month-window omission:
```

---

# 72. Health semantic gap count

```text
before:
after:
remaining:
```

---

# 73. 최종 보고 B — Relationship

```text
contact:
change:
formation:
commitment:
pressure:
breakdown:
partnership context:
```

각 상태 기록.

---

# 74. Relationship semantic gap count

```text
before:
after:
remaining:
```

---

# 75. Assertion Policy

```text
Health structural-only weakening:
Health period-only certainty downgrade:

Relationship formation→contact collapse:
Relationship commitment→change collapse:
Relationship pressure→change collapse:

unsupported invention:
```

Expected 모두 0.

---

# 76. Customer terminology

코드상 고객 노출 가능 문자열에:

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

직접 노출 추가:

```text
0
```

---

# 77. Isolation

```text
Judgment semantic changes:
Money semantic changes:
Work changes:
Compatibility changes:
Personality changes:
```

Expected 모두 0.

---

# 78. 최종 판정

다음을 모두 만족하면:

```text
READY_FOR_HEALTH_RELATIONSHIP_REAUDIT
```

판정한다.

```text
[ ] Health 실제 생활 의미 축소 수정
[ ] period라는 이유만의 certainty 하향 제거
[ ] Health month-window 누락 수정

[ ] relationship contact/change 회귀 유지
[ ] formation 별도 semantic 지원
[ ] commitment 별도 semantic 지원 가능한 범위 반영
[ ] pressure 별도 semantic 지원

[ ] formation/pressure mixed 결과 보존 가능
[ ] pressure → 자동 breakup 0

[ ] 명리 전문용어 고객 노출 추가 0

[ ] unsupported 생활 결과 발명 0
[ ] Judgment 의미 변경 0
[ ] Money 변경 0
[ ] Compatibility 변경 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 79. 다음 단계

P4-K.1이:

```text
READY_FOR_HEALTH_RELATIONSHIP_REAUDIT
```

로 끝나면 다음은:

```text
P4-K.2 Health & Relationship Semantic Reaudit
```

이다.

P4-K.2까지 통과한 뒤:

```text
P4-J UPSTREAM_JUDGMENT_REGRESSION 수정
→ P4-J 재실행
```

순서로 돌아간다.

그 이후:

```text
Event Timing Layer
- 계약 성사에 유리한 시기
- 사업 시작에 유리한 시기
```

를 진행한다.