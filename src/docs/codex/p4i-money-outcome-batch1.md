# FILUNE Codex P4-I
## Money Outcome Semantic Engine — Batch 1
## Corrected Outcome Assertion Policy 적용본

진입 조건:

```text
OUTCOME_ASSERTION_POLICY_READY
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
HEALTH_OUTCOME_BATCH1_COMPLETE
```

현재 `14-outcome-semantic-spec.md`에는 공통 Outcome Assertion Policy가 교정되어 있다.

이번 P4-I는 반드시 **교정된 최신 14 spec**을 기준으로 구현한다.

이전의 다음 정책은 폐기한다.

```text
구조적 의미만 기록하고 생활 결과는 말하지 않는다
실제 돈 결과는 모두 보류한다
money_generation_path까지만 표현한다
```

새 원칙:

```text
근거가 확인된 생활 결과는 끝까지 판정한다.
근거 없는 결과는 만들지 않는다.
확정 가능한 한 축을 다른 불확실한 축 때문에 약화시키지 않는다.
서로 다른 긍정·부정 결과는 동시에 보존한다.
```

---

# 1. 최종 목표

성공:

```text
READY_FOR_MONEY_OUTCOME_AUDIT
```

실패:

```text
P4I_FIX_REQUIRED
```

---

# 2. 필수 기준 문서

반드시 실제 저장소의 최신 파일을 읽는다.

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/codex/p4-outcome-assertion-policy-correction-result.md
src/docs/codex/p4d-outcome-semantic-source-audit-result.md

src/docs/rules/master/01-pattern-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/13-reading-assembly-spec.md

src/docs/source/primary/05-격국론.md
src/docs/source/primary/07-사주풀이예시.md
```

현재 구현:

```text
src/lib/judgment/
src/lib/outcome/
src/lib/reading/
```

도 확인한다.

---

# 3. Outcome Layer의 역할

Money Outcome은 Judgment를 다시 판단하는 엔진이 아니다.

구조:

```text
Judgment
↓
Outcome Mapping
↓
Money OutcomeFact
↓
Reading Assembly
```

Judgment가 확정한 구조를
전문가 원자료에서 확인된 실제 생활 결과로 번역한다.

---

# 4. Source-supported real-life result는 반드시 보존

예:

```text
食神生財 confirmed
→ 돈을 벌 수 있는 구조 confirmed
```

이를:

```text
재물 생성 경로가 존재한다
```

로만 축소하지 않는다.

내부 semantic에도 실제 생활 결과를 표현할 수 있는 의미를 보존한다.

---

# 5. Money 결과는 하나가 아니다

최소 다음 결과 축을 독립적으로 표현할 수 있어야 한다.

```text
money_acquisition
money_generation_method
money_retention
money_division_or_outflow
money_related_difficulty
money_duration_or_stability
```

최신 14 spec에 다른 정식 명칭이 있으면 그 명칭을 사용한다.

---

# 6. 서로 다른 축은 동시에 존재 가능

예:

```text
money_acquisition = confirmed
money_retention = weak
money_division_or_outflow = present
money_related_difficulty = present
```

가능.

이를:

```text
mixed
ambiguous
deferred
```

하나로 뭉개지 않는다.

---

# 7. 食神生財 — 핵심 생활 결과

실제:

```text
食神
→ 유효한 생
→ 財
```

가 현재 작동하면,

source-supported Outcome:

```text
재물을 벌 수 있음
기술·재주·언변·생산물이 재물로 연결됨
```

을 생성한다.

단순:

```text
FoodGod exists + Wealth exists
```

만으로는 생성하지 않는다.

실제 Relation / Formula / Current Function이 필요하다.

---

# 8. 傷官生財

전문가 source와 최신 spec에서 승인된 경우:

```text
傷官
→ 財
```

의 유효한 생재 역시:

```text
재주·응용·표현·언변 등이 재물 획득으로 연결됨
```

으로 번역한다.

---

# 9. 돈을 번다는 것과 오래 남는 것은 분리

반드시:

```text
money_acquisition
≠
money_retention
```

이다.

예:

```text
돈을 벌 수 있음 = confirmed

BUT

오래 유지하기 어려움 = confirmed
```

동시에 허용한다.

---

# 10. 일간 Capacity / Root와 유지력

전문가 source가 특정 구조에서:

```text
일간 무근
감당력 부족
```

을:

```text
돈을 벌어도 오래 유지하기 어려움
```

과 연결한 경우에만
retention/duration Outcome에 사용한다.

새 일반규칙을 발명하지 않는다.

---

# 11. Capacity evidence가 없을 때

예:

```text
食神生財 = confirmed
DayMasterCapacity = unknown
```

이면:

```text
money_acquisition = confirmed
money_retention = deferred
```

이다.

금지:

```text
전체 Money Outcome = deferred
```

---

# 12. 財가 손상되는 경우

실제 유효한 Relation/Current Function에 의해 財가 손상되고
source-supported 생활 의미가 있으면:

```text
재물 유지 어려움
재물 분탈
재물이 주변으로 빠져나감
돈과 관련한 난제
```

중 해당 source가 지지하는 결과를 생성한다.

`wealth_function_damaged` 같은 추상 상태만 남기지 않는다.

---

# 13. 劫財 → 財

단순:

```text
劫財 exists
```

만으로 Money negative Outcome을 만들지 않는다.

하지만 실제:

```text
劫財
→ controls / clashes / damages
→ 財
```

가 유효하게 작동하고 source contract가 생활 결과를 지원하면:

```text
재물이 나뉠 수 있음
내가 만든 재물의 일부가 주변으로 빠질 수 있음
재물 유지력이 떨어질 수 있음
```

등 승인 결과를 생성한다.

---

# 14. 위치·육친 의미

전문가 사례처럼:

```text
겁재가 재를 손상
+
위치/육친 맥락
```

이 실제로 주변 사람·형제 등과 연결되는 source rule이 있으면
그 맥락을 별도로 보존할 수 있다.

하지만 위치 근거 없이 무조건:

```text
형제가 돈을 가져간다
```

로 만들지 않는다.

---

# 15. 돈을 벌면서 나가는 돈도 많을 수 있다

다음은 허용된다.

```text
money_acquisition = confirmed
money_division_or_outflow = confirmed
```

즉:

```text
돈을 벌 수 있지만 나가는 돈도 많다
```

는 모순이 아니다.

두 구조가 실제로 동시에 작동하면 둘 다 출력한다.

---

# 16. 재물과 난제 동시 발생

예:

```text
食神生財
+
財生 harmful 七殺
```

이면:

```text
money_acquisition = confirmed
money_related_difficulty = confirmed
```

둘 다 보존한다.

재생살이 있다고 돈벌이 결과 자체를 삭제하지 않는다.

---

# 17. 財生殺

Money Layer가 자체적으로 七殺의 좋고 나쁨을 판단하지 않는다.

기존 Judgment의:

```text
needed killing
harmful killing
```

판정을 따른다.

---

# 18. Harmful Killing

재성이 실제 해로운 칠살을 강화하면:

```text
돈을 벌거나 재물을 추구하는 경로와 함께
난제·압박·문제가 동반되는 구조
```

라는 source-supported Outcome을 허용한다.

---

# 19. Needed Killing

필요한 칠살을 財가 생한다고 해서:

```text
money-related difficulty
```

를 자동 생성하지 않는다.

---

# 20. 財格 財剋印

FILUNE 고정 계약:

```text
財格의 財剋印 = favorable structural function
```

을 유지한다.

다음 오판 금지:

```text
財가 印을 극함
→ 돈 손상
```

---

# 21. 印格 財剋印

印格에서는 기존 Judgment 결과를 따른다.

단:

```text
印過多 → 印多用財
```

같은 reversal이 있으면 그대로 보존한다.

---

# 22. 食神格 財制印

印이 食神을 손상하고
財가 印을 제어하여 食神을 보호한다면,

재성을 단순 negative로 처리하지 않는다.

기존 Structural Function을 따른다.

---

# 23. 財 기능 유지

현재 財가 실제 operating이고
보호·생성 경로가 유효하다면
Money 결과에 반영한다.

단:

```text
財 exists
→ maintained
```

금지.

---

# 24. 財 보호

기존 Judgment가 실제 보호 경로를 확인하면
그 보호 결과를 Money Outcome에 연결한다.

예:

```text
재물 분탈을 막는 구조
재물 기능을 유지시키는 구조
```

source-supported 의미까지만.

---

# 25. 보호 상실

원국에서 보호되던 財가
운에서 보호자 stopped/inactive로 보호를 잃고
Judgment가 손상 경로를 재활성화하면,

Money Outcome도 현재 scope에서 손상/분탈 Outcome을 생성해야 한다.

Health P4-G.1과 동일한 lifecycle 원칙을 적용한다.

---

# 26. RoleHistory만 보면 안 됨

반드시 현재:

```text
CurrentFunction
Runtime
ActualStructuralFunction
Current Role state
```

을 읽는다.

과거 보호 History가 있다고 현재도 보호된 것으로 처리하지 않는다.

---

# 27. stopped 財

財가 현재 stopped이면
현재 active acquisition/maintenance Outcome을 생성하지 않는다.

---

# 28. reduced 財

reduced를 full operating으로 읽지 않는다.

단 acquisition과 retention이 다른 근거를 가지면
각 축을 별도로 판정한다.

---

# 29. expired

운에서 생긴 Money Outcome이 종료되면:

```text
currentlyEffective = false
```

현재 Reading에서는 제외한다.

하지만 과거 Outcome history는 유지할 수 있다.

---

# 30. 만료 ≠ 손실

운이 끝났다고:

```text
돈을 잃는다
```

라고 자동 해석하지 않는다.

---

# 31. 성과 귀속 개념

공통 Outcome 정책에서 도입한:

```text
benefit capture
```

개념을 Money에서도 필요한 경우 지원한다.

예:

```text
문제는 해결됨
성과는 발생함
하지만 결과의 일부가 주변으로 나뉨
```

을 하나의 good/bad 값으로 합치지 않는다.

---

# 32. 겁재가 문제를 해결하는 경우

전문가 source가 지원하는 경우:

```text
problemResolved = confirmed
externalHelpOrActor = confirmed
benefitCapturedBySelf = reduced/contextual
```

등으로 분리할 수 있어야 한다.

실제 schema는 최신 14 spec에 맞춘다.

---

# 33. 해결 방식이 다르면 결과의 질도 다름

같은 난제 해결이라도:

```text
식신/상관이 해결
vs
겁재가 해결
```

의 결과 귀속이 source에서 다르게 해석되는 경우
그 차이를 보존한다.

---

# 34. 실제 사건 결과 허용 범위

source-supported 경우 다음은 허용된다.

```text
돈을 벌 수 있음
돈이 나뉘기 쉬움
돈이 오래 남기 어려움
돈 때문에 난제가 생길 수 있음
기술/언변/재주로 돈을 벌 수 있음
```

이들은 “과도한 예측”이라는 이유로 삭제하지 않는다.

---

# 35. 금지되는 확장

반면 다음은 source/engine evidence 없이는 금지한다.

```text
연봉 금액
자산 금액
몇 억 번다
부자가 반드시 된다
복권 당첨
특정 종목 수익
투자 성공 확정
```

---

# 36. 정재·편재 단순 mapping 금지

```text
正財 → 월급
偏財 → 투자수익
```

같은 deterministic shortcut을 만들지 않는다.

실제 source-supported 구조가 있을 때만 결과를 생성한다.

---

# 37. 투자 권고는 이번 범위 아님

다음은 구현하지 않는다.

```text
매수
매도
대출
레버리지
투자상품 추천
```

이는 Money Outcome 해석과 별도다.

---

# 38. 계약·사업·지출·협업 시기

P4-D에서 근거 부족으로 보류된 영역은 그대로 둔다.

이번 Batch에서 임의 구현하지 않는다.

---

# 39. 그러나 Money timing 자체를 지나치게 막지 말 것

운에서 source-supported Money 결과가 실제 활성화되면:

```text
이 시기에는 재물을 벌기 쉬운 구조가 작동
이 시기에는 재물 분탈이 커질 수 있음
이 시기에는 돈과 관련한 난제가 동반될 수 있음
```

등 해당 Outcome은 scope와 함께 기록할 수 있다.

금지된 것은:

```text
이번 달 계약하세요
이번 달 투자하세요
```

같은 별도 행동 권고다.

---

# 40. Scope

반드시:

```text
natal
daewoon
sewoon
month
```

보존.

---

# 41. Natal

원국의 Money 결과는 장기적 기본 구조.

예:

```text
기술로 돈을 벌 수 있는 구조
벌어도 유지가 어려운 구조
재물이 주변과 나뉘는 구조
```

source-supported 경우 명확하게 판정한다.

---

# 42. Luck

운은 원국 구조를 수정한다.

예:

```text
원국에서는 돈을 벌 수 있으나 유지가 약함

특정 운에서 보호자가 들어옴
→ 유지/분탈 조건 개선

특정 운에서 보호자가 정지
→ 손상 경로 재활성
```

현재 scope 결과를 명확히 기록한다.

---

# 43. 여러 결과의 동시 출력

아래처럼 동시 가능:

```text
money_acquisition = confirmed
money_retention = weak
money_related_difficulty = confirmed
```

이를 하나의 “재물운 보통”으로 축약하지 않는다.

---

# 44. OutcomeFact

P4-E/G의 공통 Outcome Layer를 재사용한다.

필요한 Money-specific semantic을
최신 14 spec에서 읽어 사용한다.

새 별도 Money 사주 엔진을 만들지 않는다.

---

# 45. Outcome Mapping Rule

가능하면 구조:

```text
Judgment Fact(s)
+
Current State
+
Source-supported Mapping
↓
Money OutcomeFact
```

로 구현한다.

---

# 46. Provenance

각 생활 결과가 어느 구조에서 나왔는지 추적 가능해야 한다.

예:

```text
money acquisition
→ FoodGodGeneratesWealth relation/formula ID

money division
→ RobControlsWealth relation ID

money difficulty
→ WealthGeneratesHarmfulKilling path ID
```

---

# 47. 동일 구조에서 여러 Outcome 허용

하나의 upstream 구조가 여러 생활 결과를 만들 수 있다.

예:

```text
食神生財
→ money_acquisition
→ money_generation_method
```

이는 중복이 아니다.

semanticType이 다르다.

---

# 48. 중복 Outcome 금지

동일:

```text
semantic type
+
scope
+
source path
```

조합의 중복 Fact는 0이어야 한다.

---

# 49. Stable ID

동일 입력에서 동일 OutcomeFact ID.

랜덤 identity 금지.

---

# 50. CH-05

Money Batch 1 결과를 CH-05에 전달한다.

하지만 전체 CH-05는:

```text
PARTIAL
```

유지 가능.

아직 계약/사업/지출/협업 timing 등이 남아 있다.

---

# 51. CH-08 / 09 / 10

운에서 발생한 같은 Money OutcomeFact는
각 시기 장에서 동일 ID/provenance로 재사용한다.

---

# 52. B-6

같은 결론을 장마다 복제하지 않는다.

예:

```text
CH-05
→ 기본 재물 구조

CH-08
→ 대운에서 그 구조가 어떻게 바뀌는지

CH-09
→ 해당 연도 변화

CH-10
→ 해당 월 변화
```

---

# 53. Free scope

무료에서 유료 시기 정보 누출 0.

단 무료 범위에서 허용된 원국 Money 결과는
지나치게 추상화하지 않는다.

---

# 54. Renderer는 아직 별도

이번 단계는 Outcome semantic 구현이다.

고객 문장 renderer를 새로 만들지 않는다.

하지만 semantic에는 고객 문장으로 충분히 번역 가능한
실제 생활 의미가 담겨 있어야 한다.

---

# 55. 권장 코드 위치

기존 구조에 맞춰:

```text
src/lib/outcome/money/
```

사용.

예:

```text
moneyOutcome.ts
moneyAcquisition.ts
moneyRetention.ts
moneySideEffects.ts
index.ts
```

실제 repository convention을 우선한다.

---

# 56. 테스트 — 食神生財

실제 기존 fixture에서:

```text
食神生財 confirmed
```

Expected:

```text
money_acquisition = confirmed
money_generation_method = skill/output based
```

추상 structural-only fact로 끝나면 FAIL.

---

# 57. 테스트 — 食神과 財만 존재

실제 relation이 없으면:

```text
money_acquisition from 食神生財 = 0
```

---

# 58. 테스트 — 벌 수 있지만 유지 어려움

source-supported 구조 fixture에서:

Expected:

```text
money_acquisition = confirmed
money_retention/duration weakness = confirmed
```

두 결과 동시 존재.

---

# 59. 테스트 — 겁재 분탈

실제 劫財가 財를 유효하게 손상하고
source mapping 조건이 충족되면:

Expected:

```text
money_division_or_outflow = confirmed
```

단순 劫財 존재 fixture에서는 0.

---

# 60. 테스트 — 돈은 벌고 나가는 돈도 많음

실제 source-supported 구조에서:

```text
money_acquisition
+
money_outflow
```

두 결과를 동시에 유지한다.

---

# 61. 테스트 — 재물 + 난제

```text
valid acquisition path
+
harmful Wealth→Killing path
```

Expected:

```text
money_acquisition = confirmed
money_related_difficulty = confirmed
```

둘 중 하나를 삭제하면 FAIL.

---

# 62. 테스트 — 財格 財剋印

기존 favorable contract 유지.

Money damage로 오판 0.

---

# 63. 테스트 — 印格 財剋印

기존 Judgment 결과를 따른다.

---

# 64. 테스트 — 食神格 財制印

FoodGod 보호 구조를 negative Money로 오판하지 않는다.

---

# 65. 테스트 — 보호 상실 / 재활성

원국에서 財가 보호되다가
운에서 보호자가 stopped되고
Judgment가 harmful path를 재활성화하면:

Expected:

```text
current Money negative Outcome active
```

과거 보호 History 때문에 누락되면 FAIL.

---

# 66. 테스트 — stopped 財

현재 acquisition/maintenance Outcome 비활성.

---

# 67. 테스트 — expired

현재 Reading leakage 0.

과거 history는 보존 가능.

---

# 68. 테스트 — partial evidence

예:

```text
acquisition evidence confirmed
retention evidence missing
```

Expected:

```text
acquisition = confirmed
retention = deferred
```

전체 Money 결과 deferred 금지.

---

# 69. 테스트 — 성과 귀속

source-supported 실제 fixture가 있으면:

```text
problem resolved
benefit capture reduced/shared
```

두 축 분리 검증.

fixture가 없으면 억지로 만들지 않고 별도 audit candidate로 기록한다.

---

# 70. 안전 검증

금지 결과:

```text
구체 금액 예측
복권
특정 투자상품 추천
매수·매도 지시
의무적 대출 권고
```

0.

하지만 source-supported:

```text
돈을 벌 수 있음
돈이 오래 남기 어려움
돈이 나뉠 수 있음
돈 때문에 난제가 생길 수 있음
```

까지 금지하면 그것도 FAIL이다.

---

# 71. 다른 영역 격리

이번 구현에서 의미 변경 0:

```text
Judgment
Personality
Relationship
Health
Work
Selection
Compatibility
```

---

# 72. Health / Relationship 회귀

반드시:

```text
HEALTH_OUTCOME_BATCH1_COMPLETE
RELATIONSHIP_OUTCOME_BATCH1_COMPLETE
```

유지.

---

# 73. 신규 검증 스크립트

권장:

```text
scripts/verify-money-outcome-p4i.mjs
```

---

# 74. 기존 회귀

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
```

PASS.

---

# 75. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 76. 결과 파일

반드시 생성:

```text
src/docs/codex/p4i-money-outcome-batch1-result.md
```

---

# 77. 최종 판정

성공:

```text
READY_FOR_MONEY_OUTCOME_AUDIT
```

실패:

```text
P4I_FIX_REQUIRED
```

---

# 78. 결과 보고 — Money axes

반드시 별도로 보고한다.

```text
money acquisition:
generation method:
retention:
division/outflow:
money-related difficulty:
duration/stability:
```

각각:

```text
SUPPORTED
DEFERRED
NOT_APPLICABLE
```

등 현재 상태.

---

# 79. Mixed Outcome 검증

반드시 몇 건인지 보고한다.

예:

```text
acquisition + retention weakness:
acquisition + outflow:
acquisition + difficulty:
```

이러한 동시 결과가 정상 보존돼야 한다.

---

# 80. Pattern-specific regression

반드시:

```text
財格 財剋印:
印格 財剋印:
食神格 財制印:

財生 harmful Killing:
財生 needed Killing:
```

보고.

---

# 81. Provenance

```text
Money OutcomeFacts:
with provenance:
orphan:
duplicate IDs:
scope mismatch:
```

---

# 82. Lifecycle

```text
active:
reduced:
stopped:
protected:
protection lost:
expired:
reactivated:
```

---

# 83. Reading Assembly

```text
CH-05:
CH-08:
CH-09:
CH-10:

same OutcomeFact reuse:
duplicate conclusion:
free timing leakage:
```

Expected:

```text
CH-05 = PARTIAL
```

가능.

---

# 84. Outcome Assertion Policy 준수 감사

반드시 별도 검사:

```text
source-supported result weakened to structural-only = 0
confirmed axis hidden because another axis deferred = 0
mixed outcome collapsed to ambiguous = 0
unsupported new real-life result = 0
```

---

# 85. 종료 조건

다음을 충족하면:

```text
READY_FOR_MONEY_OUTCOME_AUDIT
```

판정한다.

```text
[ ] 실제 食神生財 → 재물을 벌 수 있음까지 표현
[ ] 실제 傷官生財 승인 범위 반영
[ ] acquisition / retention 분리
[ ] retention / duration 근거 조건 보존
[ ] 劫財 실제 財 손상 → 분탈/유출 결과 지원
[ ] 단순 劫財 존재 오판 0

[ ] acquisition + outflow 동시 보존
[ ] acquisition + difficulty 동시 보존
[ ] 한 축 deferred 때문에 다른 confirmed 결과 삭제 0

[ ] 財格 財剋印 계약 보존
[ ] 印格 財剋印 context 보존
[ ] 食神格 財制印 context 보존
[ ] 財生 harmful/needed Killing 구분

[ ] 보호 상실 후 current negative path 재활성 지원
[ ] stopped/expired leakage 0

[ ] Natal/Daewoon/Sewoon/Month scope 보존
[ ] stable ID
[ ] orphan provenance 0
[ ] duplicate ID 0

[ ] CH-05 PARTIAL 계약 보존
[ ] CH-08/09/10 동일 OutcomeFact 재사용
[ ] free timing leakage 0

[ ] 구체 금액 예측 0
[ ] 투자 매수/매도 권고 0

[ ] source-supported 생활 결과 과도한 추상화 0
[ ] unsupported 생활 결과 발명 0

[ ] Health 변경 0
[ ] Relationship 변경 0
[ ] Work 변경 0
[ ] Selection 변경 0
[ ] Compatibility 변경 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 86. 다음 단계

P4-I가:

```text
READY_FOR_MONEY_OUTCOME_AUDIT
```

로 끝나면:

```text
P4-J Money Outcome Integration Audit
```

로 이동한다.

P4-J에서는 실제:

```text
Canonical
→ Judgment
→ Luck
→ Money Outcome
→ ReadingAssembly
```

경로에서 이번 여섯 Money 축이
실제로 유지되는지 검증한다.

P4-I 결과를 보기 전에는
다른 Outcome 영역으로 넘어가지 않는다.