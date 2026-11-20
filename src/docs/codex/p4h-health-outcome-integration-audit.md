# FILUNE Codex P4-H
## Health Outcome Integration Audit

P4-G Health Outcome Semantic Engine — Batch 1이 완료되었다.

진입 조건:

```text
READY_FOR_HEALTH_OUTCOME_AUDIT
```

확인 완료.

현재 P4-G 결과:

```text
10일간 전통 대응 구현
乙·丁·庚·壬 과잉 구체화 0
근거 ID 참조
중복 ID 0
무료 운 시기 누출 0

CH-07 = PARTIAL
CH-08~10 = 동일 원본 OutcomeFact 재사용

Judgment 35/35 PASS
P2-A~G PASS
P3-A~F PASS
P4-B·C·E·F·G PASS
TypeScript PASS
Build PASS
```

P4-G에서 확인하지 못한 항목:

```text
상신 손상 독립 양성 사례
Formation 발동 독립 양성 사례
```

이 둘은 이번 P4-H에서도 실제 fixture가 없으면
새 명리 기대값을 만들지 않는다.

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 기록한다.

이번 단계에서는 새로운 Health rule을 구현하지 않는다.

목적은 실제:

```text
Canonical
→ Judgment
→ Luck
→ Health Outcome
→ ReadingAssembly
```

통합 경로 검증이다.

---

# 1. 최종 판정

성공:

```text
HEALTH_OUTCOME_BATCH1_COMPLETE
```

실패:

```text
P4H_FIX_REQUIRED
```

---

# 2. 반드시 읽을 파일

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/13-reading-assembly-spec.md

src/docs/codex/p4d-health-outcome-supplement-audit-result.md
src/docs/codex/p4g-health-outcome-batch1-result.md
src/docs/codex/p4c-reading-assembly-integration-audit-result.md

src/docs/source/health/FILUNE-19A-premium-health-evidence.md
```

코드:

```text
src/lib/judgment/
src/lib/outcome/
src/lib/reading/
```

---

# 3. 실제 Pipeline 필수

최소 실제 출생 입력에서:

```text
Birth Input
→ CanonicalChart
→ Judgment
→ Luck scopes
→ Health Outcome
→ ReadingAssembly
```

전체를 실행한다.

합성 `HealthOutcomeFact`만 직접 주입하는 테스트로
P4-H를 통과시키지 않는다.

---

# 4. 기존 fixture 우선

다음 기존 검증 자산을 우선 재사용한다.

```text
CS-005
기존 Judgment regression fixtures
P1 policy fixtures
P4-C actual pipeline fixtures
```

새 명리 판정 기대값을 발명하지 않는다.

---

# 5. P4-G 검증과 P4-H 차이

P4-G:

```text
Health semantic 자체가 올바르게 생성되는가
```

P4-H:

```text
실제 Canonical/Judgment/Luck에서 생성된 결과가
Health Outcome을 거쳐 ReadingAssembly까지
정확히 전달되는가
```

를 검증한다.

---

# 6. Traditional Correspondence

10일간 계약을 다시 검사한다.

```text
甲
乙
丙
丁
戊
己
庚
辛
壬
癸
```

확인:

```text
10/10
specificity violation = 0
disease inference = 0
```

---

# 7. 乙·丁·庚·壬

다음 네 일간에서
다른 천간의 specific body area 자동 상속:

```text
0
```

이어야 한다.

---

# 8. 의미 범위

Traditional correspondence는:

```text
전통적으로 연결해 참고하는 신체 영역
```

까지만.

다음 의미 생성 금지:

```text
약한 장기
취약 부위
건강 위험 부위
질병 발생 부위
```

---

# 9. Structural Health Attention

실제 Judgment가 확정한:

```text
PatternContext
Role
CurrentFunction
Runtime
ActualStructuralFunction
LuckEffect
```

을 읽어 Health Outcome을 생성한다.

Health Outcome Layer가 이를 재계산하면 FAIL.

---

# 10. Judgment 재계산 금지

Health Layer에서 다음 재계산 0:

```text
Pattern
YongShen
SangShen
Byeong
GuEung
TenGod
Root
Formation
Luck Runtime
```

---

# 11. Harmful Killing

실제 harmful killing path가 확인되는 기존 fixture가 있으면:

```text
structural_health_attention
```

연결을 검사한다.

검증:

```text
source provenance
scope
certainty
currentlyEffective
```

---

# 12. Needed Killing

기존 Judgment에서 필요한 칠살이면:

```text
health attention 자동 생성 = 0
```

이어야 한다.

칠살 존재만으로 Health Outcome 생성 금지.

---

# 13. 財生殺

`財生殺` RelationFact 자체만으로:

```text
health attention
```

을 만들면 안 된다.

실제 harmful killing path가 확인돼야 한다.

---

# 14. ConditionalByeong

조건부 병 이력만 있고 실제 발동하지 않았다면:

```text
confirmed health attention = 0
```

---

# 15. stopped / inactive

Health pressure source가:

```text
stopped
inactive
```

이면 현재 active Health Outcome에서 제외한다.

RoleHistory/provenance는 남을 수 있다.

---

# 16. reduced

`reduced` source를:

```text
full confirmed structural_health_attention
```

으로 승격하지 않는다.

---

# 17. Expired

운 조건 종료 후:

```text
currentlyEffective = false
expired = true
```

또는 현행 공통 lifecycle의 동등 상태를 유지한다.

현재 Reading active unit:

```text
0
```

---

# 18. 가짜 Health Relief 금지

만료만으로:

```text
health_recovered
health_improved
health_relief_period
```

생성 0.

`health_relief_period`는 여전히 미구현이다.

---

# 19. Scope 검증

실제 source와 Outcome의 scope를 확인한다.

```text
Natal   → natal
Daewoon → daewoon
Sewoon  → sewoon
Month   → month
```

scope mismatch:

```text
0
```

---

# 20. 실제 12절기월

P4-C/P4-G에서 사용한 실제 12절기월 경로를 재사용한다.

확인:

```text
month count = 12
chronological = true
boundary mismatch = 0
scope mismatch = 0
```

calendar month를 새로 만들지 않는다.

---

# 21. 월 Ranking 금지

12개월을 모두 계산해도:

```text
bestHealthMonth
worstHealthMonth
healthScore
healthRank
```

생성 0.

---

# 22. Natal → Daewoon → Sewoon → Month

동일 underlying Health condition이 여러 scope에서 이어질 경우:

```text
source identity
provenance
lifecycle
```

를 추적할 수 있어야 한다.

매 scope마다 별개의 새로운 건강 문제처럼 만들지 않는다.

---

# 23. Inherited State

상위 scope condition이 하위 scope까지 유효하면
원래 source/event identity를 보존한다.

중복 신규 발행 금지.

---

# 24. Stable ID

동일 실제 입력을 2회 실행한다.

Expected:

```text
same OutcomeFact.id
same semanticType
same scope
same certainty
same provenance
```

---

# 25. 배열 순서 독립성

upstream:

```text
Role
Relation
LuckEffect
```

배열 순서만 변경해도 동일 Outcome 결과가 나와야 한다.

---

# 26. Provenance

모든 structural Health OutcomeFact에 실제 upstream 근거가 있어야 한다.

가능한 항목:

```text
sourceJudgmentIds
sourceRoleIds
sourceRelationIds
sourceLuckEffectIds
```

---

# 27. Traditional provenance

`traditional_body_correspondence`는
Health source/knowledge provenance를 사용할 수 있다.

Structural provenance와 혼동하지 않는다.

---

# 28. Orphan Provenance

참조 ID가 실제 upstream에 없는 경우:

```text
0
```

---

# 29. Wrong-scope Provenance

Month Outcome에서 상위 Daewoon/Sewoon provenance를
이력으로 참조할 수는 있지만,

현재 발생 source와 상위 inherited source를 구분해야 한다.

잘못된 current source 연결:

```text
0
```

---

# 30. Mutation Audit

실행 전후 비교:

```text
JudgmentResult
Luck snapshots
PersonalityResult
```

변경:

```text
0
```

---

# 31. Overall Luck와 Health 분리

다음 자동 mapping:

```text
overall favorable
→ health favorable

overall unfavorable
→ health unfavorable
```

0.

Health-specific condition이 필요하다.

---

# 32. ReadingAssembly 실제 연결

실제:

```text
Health OutcomeFact
→ ReadingSemanticUnit
→ ReadingAssembly
```

경로를 검증한다.

---

# 33. CH-07

지원된 Health subset을 CH-07에 연결한다.

상태는:

```text
PARTIAL
```

유지.

이번 P4-H 통과로 CH-07을 READY로 바꾸지 않는다.

---

# 34. CH-08

Daewoon Health Outcome이 있으면
동일 OutcomeFact를 CH-08에서 재사용한다.

---

# 35. CH-09

Sewoon Health Outcome이 있으면
동일 OutcomeFact를 CH-09에서 재사용한다.

---

# 36. CH-10

Month Health Outcome이 있으면
동일 OutcomeFact를 CH-10에서 재사용한다.

---

# 37. Same OutcomeFact Reuse

같은 Health condition의:

```text
ID
provenance
certainty
```

가 장마다 바뀌면 FAIL.

---

# 38. B-6 중복 계약

역할만 달라진다.

```text
CH-07 = health context
CH-08 = Daewoon context
CH-09 = year context
CH-10 = month context
```

동일 conclusion 중복:

```text
0
```

---

# 39. Free Reading

동일 실제 reading을:

```text
productScope = free
```

로 조립한다.

Expected:

```text
Daewoon Health timing = 0
Sewoon Health timing = 0
Month Health timing = 0
Day Health timing = 0
```

---

# 40. Premium

Premium이라고 동일 Natal Health semantic의:

```text
direction
certainty
provenance
```

가 달라지면 FAIL.

---

# 41. Day Luck

Day 계산 능력이 있어도
현재 B 기본 Health chapter에 자동 routing하지 않는다.

```text
Day Health customer unit = 0
```

---

# 42. 질병/의료 안전성

다음 semantic 또는 출력 생성 0:

```text
disease_prediction
illness_prediction
diagnosis
disease_timing

doctor
hospital
check-up
medication
treatment
surgery

life_expectancy
death_timing
```

---

# 43. Health 점수

다음 생성 0:

```text
health score
risk %
health grade
health rank
best month
worst month
```

---

# 44. 상신 손상 독립 사례

P4-G에서 독립 양성 fixture가 확인되지 않았다.

이번 P4-H에서 기존 fixture를 검색한다.

실제 독립 사례가 있으면 검증한다.

없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 기록한다.

통과를 위해 synthetic 명리 기대값을 만들지 않는다.

---

# 45. Formation 독립 사례

동일 원칙.

기존 실제 fixture에서
Formation 활성만으로 승인 Health condition이 검증 가능한 사례가 있으면 사용.

없으면:

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

---

# 46. NOT_TESTABLE 처리

다음 조건이면 P4-H 전체 FAIL로 보지 않는다.

```text
해당 규칙이 v1 필수 실행 경로가 아니고
기존 fixture에서 독립적으로 재현할 수 없으며
이미 source contract상 제한이 명시됨
```

단 실제 구현 오류를 `NOT_TESTABLE`로 숨기지 않는다.

---

# 47. 영역 격리

이번 P4-H로 의미 변경 0:

```text
Work
Money
Relationship
Selection
Compatibility
Personality
```

---

# 48. Relationship 회귀

반드시:

```text
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

계약을 유지한다.

---

# 49. Renderer 변경 금지

KO/JA/EN Renderer 변경 0.

이번 단계는 semantic/integration audit다.

---

# 50. LLM

runtime LLM/API 의존:

```text
0
```

---

# 51. Dependency Direction

Expected:

```text
Health Outcome
→ Judgment result read-only

ReadingAssembly
→ Outcome result read-only
```

역방향:

```text
Judgment → Outcome
```

0.

---

# 52. 신규 검증 스크립트

권장:

```text
scripts/verify-health-outcome-integration-p4h.mjs
```

---

# 53. 실패 분류

문제 발견 시 반드시 구분한다.

```text
P4H_ASSEMBLY_BUG
P4G_OUTCOME_BUG
UPSTREAM_JUDGMENT_REGRESSION
FIXTURE_GAP
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

---

# 54. 기존 Judgment를 감사 통과용으로 수정 금지

upstream 문제가 보이면:

```text
UPSTREAM_JUDGMENT_REGRESSION
```

으로 보고하고 P4-H에서 명리 rule을 수정하지 않는다.

---

# 55. 회귀

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
```

기존 기대값 수정 금지.

---

# 56. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 57. 결과 파일

반드시 생성:

```text
src/docs/codex/p4h-health-outcome-integration-audit-result.md
```

---

# 58. 최종 보고

## A. 전체 판정

```text
HEALTH_OUTCOME_BATCH1_COMPLETE
```

또는:

```text
P4H_FIX_REQUIRED
```

## B. Actual Pipeline

```text
Canonical:
Judgment:
Luck:
Health Outcome:
ReadingAssembly:
```

## C. Coverage

```text
traditional correspondence:
structural attention:

Natal:
Daewoon:
Sewoon:
Month:

health relief:
```

## D. Day Stem

| 일간 | 근거 수준 | 과잉 구체화 |
|---|---|---|
| 甲 | | |
| 乙 | | |
| 丙 | | |
| 丁 | | |
| 戊 | | |
| 己 | | |
| 庚 | | |
| 辛 | | |
| 壬 | | |
| 癸 | | |

## E. Provenance

```text
OutcomeFacts:
with provenance:
orphan:
wrong-scope:
duplicate IDs:
```

## F. Lifecycle

```text
active:
reduced:
stopped:
conditional:
inherited:
expired:
current leakage:
fake relief:
```

## G. Assembly

```text
CH-07 readiness:
CH-08 reuse:
CH-09 reuse:
CH-10 reuse:

duplicate conclusion:
B-6 mismatch:
```

Expected:

```text
CH-07 = PARTIAL
```

## H. Free / Premium

```text
free Daewoon leakage:
free Sewoon leakage:
free Month leakage:
free Day leakage:

Natal semantic mismatch:
certainty mismatch:
provenance mismatch:
```

## I. Safety

```text
disease prediction:
diagnosis:
disease timing:
medical advice:
treatment:
surgery:
life expectancy:
health score:
health ranking:
best/worst month:
```

Expected 모두 0.

## J. Fixture Coverage

```text
SangShen-damage independent case:
Formation independent case:
```

가능한 상태:

```text
PASS
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

## K. Isolation

```text
Judgment mutation:
Personality mutation:
Relationship changes:
Money changes:
Work changes:
Selection changes:
Compatibility changes:
Renderer changes:
```

Expected 모두 0.

## L. Regression

전체 회귀 결과.

---

# 59. 종료 조건

다음을 만족하면:

```text
HEALTH_OUTCOME_BATCH1_COMPLETE
```

판정한다.

```text
[ ] 실제 Canonical → Judgment → Luck → Health Outcome → Assembly 통과

[ ] 10일간 전통 대응 계약 유지
[ ] 乙丁庚壬 과잉 구체화 0

[ ] 승인 structural health attention 실제 연결
[ ] harmful Killing context 보존
[ ] needed Killing 오판 0

[ ] stopped leakage 0
[ ] conditional confirmed leakage 0
[ ] expired current leakage 0
[ ] fake health relief 0

[ ] Natal scope 정상
[ ] Daewoon scope 정상
[ ] Sewoon scope 정상
[ ] Month scope 정상

[ ] provenance orphan 0
[ ] duplicate ID 0
[ ] stable deterministic ID
[ ] input mutation 0

[ ] CH-07 PARTIAL 유지
[ ] CH-08/09/10 OutcomeFact 재사용
[ ] B-6 duplicate conclusion 0

[ ] free timing leakage 0
[ ] free/premium mismatch 0

[ ] 질병 예측 0
[ ] 진단 0
[ ] 의료 권고 0
[ ] 수명 예측 0
[ ] 건강 score/rank 0
[ ] best/worst health month 0

[ ] Work/Money 변경 0
[ ] Relationship 변경 0
[ ] Selection 변경 0
[ ] Compatibility 변경 0

[ ] Judgment/Personality mutation 0
[ ] Renderer 변경 0
[ ] LLM 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 60. 완료 의미

P4-H 통과 시 다음을 닫는다.

```text
Individual Health Outcome v1 — Batch 1 COMPLETE

전통 신체 대응
+
구조적 건강 주의 조건
+
주의 조건 활성 시기
+
Natal / Daewoon / Sewoon / Month
+
lifecycle
+
provenance
+
Reading Assembly integration
```

계속 미구현:

```text
health_relief_period
질병
진단
의료 예측
의료 권고
건강 점수
건강 순위
```

---

# 61. 다음 단계

P4-H 통과 후:

```text
Money Outcome — supported subset
```

으로 이동한다.

Money는 P4-D Source Audit의 승인된 subset만 구현한다.

우선 후보:

```text
실제 食神生財
財格의 감당 조건
財 기능의 유지/손상
```

계속 보류:

```text
계약 시기
사업 시기
지출 시기
협업 시기
투자 판단
```

Work는 `SOURCE_GAP`이므로 아직 구현하지 않는다.