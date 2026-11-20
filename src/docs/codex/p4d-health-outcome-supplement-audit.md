# FILUNE Codex P4-D Supplement
## Health Outcome Semantic 보강 감사

P4-D Outcome Semantic Source Audit까지 완료되었다.

현재 전체 판정:

```text
OUTCOME_SOURCE_AUDIT_COMPLETE
```

분야별 현재 상태:

```text
Work          SOURCE_GAP
Money         PARTIAL_OUTCOME_IMPLEMENTATION
Relationship  PARTIAL_OUTCOME_IMPLEMENTATION
Health        PARTIAL_OUTCOME_IMPLEMENTATION
```

P4-D 이후 별도 건강 근거 문서가 저장소에 추가되었다.

```text
src/docs/source/health/
FILUNE-19A-premium-health-evidence.md
```

이번 작업의 목적은 이 문서의 건강 A~G를
현재:

```text
src/docs/rules/master/14-outcome-semantic-spec.md
```

및:

```text
src/docs/codex/p4d-outcome-semantic-source-audit-result.md
```

와 전수 대조하여,

**이미 반영된 건강 규칙 / 누락된 지원 규칙 / 근거 부족 / 금지 규칙을 확정하는 것**이다.

이번 작업에서는 application code를 구현하지 않는다.

---

# 1. 최종 목표

최종 판정은 다음 중 하나다.

```text
HEALTH_OUTCOME_SPEC_READY
```

또는:

```text
HEALTH_OUTCOME_SPEC_FIX_REQUIRED
```

성공 시에도 의미는:

```text
Health Outcome Source Contract READY
```

이지:

```text
Health Outcome Engine IMPLEMENTED
```

가 아니다.

---

# 2. 기준 문서

반드시 다음을 실제로 읽는다.

## 신규 건강 근거

```text
src/docs/source/health/FILUNE-19A-premium-health-evidence.md
```

## 현행 Outcome

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/codex/p4d-outcome-semantic-source-audit-result.md
```

## 기존 구조 규칙

```text
src/docs/rules/master/01-pattern-master.md
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
```

## Authority

```text
src/docs/source/authority/A_rev182.md
src/docs/source/authority/B_rev38.md
src/docs/source/authority/C_rev215.md
src/docs/source/authority/D_rev155.md
```

---

# 3. Source 보존

신규 건강 source:

```text
FILUNE-19A-premium-health-evidence.md
```

의 내용을 수정하지 않는다.

이 문서는 source/provenance다.

판정 계약 수정은:

```text
14-outcome-semantic-spec.md
```

에서만 한다.

---

# 4. 규칙 상태 분류

각 건강 규칙을 반드시 다음 중 하나로 분류한다.

```text
ALREADY_COVERED
MISSING_SUPPORTED
SOURCE_INFERENCE
DEFERRED
CONFLICT
PROHIBITED
```

### ALREADY_COVERED

현행 14 spec에 같은 의미가 이미 정확히 존재.

### MISSING_SUPPORTED

⑲-A에서 충분한 근거가 있으나 현행 14 spec에 빠져 있음.

### SOURCE_INFERENCE

사례를 통해 추론 가능하지만 일반규칙으로 직접 명시되지는 않음.

### DEFERRED

현재 근거로 확정하기 부족.

### CONFLICT

기존 master/authority와 충돌.

### PROHIBITED

FILUNE이 의도적으로 사용하지 않는 해석.

---

# 5. 건강 Outcome의 단계 계약

다음 4단계를 현행 spec과 전수 대조한다.

## Level 1 — 전통 대응

```text
일간 오행
→ 전통적으로 연결되는 몸의 영역 소개
```

허용 범위:

```text
traditional correspondence
```

금지:

```text
약하다
취약하다
질병이 생긴다
```

---

# 6. Level 2 — 명식 구조

후보:

```text
일간
+
용신/상신
+
그 기능을 해치는 구조
+
칠살이 살아날 조건
```

이 실제 건강 semantic으로 어떻게 연결되는지
현재 14 spec과 비교한다.

---

# 7. Level 3 — 시기

근거가 있는 후보:

```text
칠살 소생
용신 손상
대운 계절 방향 전환
대·세운 동일 방향 집중
세운 반복
월운 반복
```

이 중 현행 spec에 빠진 규칙을 찾는다.

---

# 8. Level 4 — 질병

다음은 모두:

```text
PROHIBITED
```

로 고정한다.

```text
질병 진단
질병명 예측
발병 확정
발병 시기
수명
사망
수술 예측
검사 필요 판단
치료법
약 복용
의학적 체질
식이 처방
```

---

# 9. 일간별 신체 대응 — 근거 수준 차이

반드시 다음을 구분한다.

원고에 직접 부위 근거가 있는 범위:

```text
甲
丙
戊
己
辛
癸
```

이 경우에도:

```text
traditional reference area
```

로만 사용한다.

---

# 10. 乙·丁·庚·壬 특칙

다음 네 일간:

```text
乙
丁
庚
壬
```

에는 동일 오행의 다른 천간 부위를 그대로 복사하지 않는다.

예:

```text
乙
→ 甲의 머리·피부·신경을 자동 상속
```

금지.

허용:

```text
乙 = 木
→ 전통 오행표에서 木이 연결되는 영역 소개
```

까지만.

이 경우:

```text
weak_area
attention_area
```

로 확정하지 않는다.

---

# 11. 오행 표의 역할

오행-신체 대응표는:

```text
symbolic traditional correspondence
```

이다.

금지:

```text
Element absence
→ disease

Element excess
→ disease

Element clash
→ diagnosed body problem
```

---

# 12. 일간 중심 원칙

다음 반복 근거를 검토한다.

```text
건강은 일간을 중심으로 본다
```

단 이것을:

```text
일간 오행 부위는 항상 약하다
```

로 바꾸지 않는다.

---

# 13. 손상된 용신의 오행

⑲-A에서 반복 사례가 확인된:

```text
손상된 용신
→ 해당 오행의 전통적 신체 영역 참고
```

규칙이 현행 spec에 정확히 반영되어 있는지 확인한다.

근거 사례와 제한조건을 같이 기록한다.

---

# 14. 상신

상신 자체의 오행을
자동 건강 부위로 연결하는지 여부를 엄격히 감사한다.

다음 두 개를 구분한다.

```text
상신이 실제 건강 관련 구조에서 손상
```

vs

```text
상신이라는 이유만으로 해당 부위가 약함
```

후자는 금지.

---

# 15. 칠살 소생

건강 source에서 가장 반복 근거가 많은 조건 중 하나다.

감사 대상:

```text
칠살이 구조적으로 실제 살아남
재생살
칠살국 성립
```

이 건강의:

```text
attention_condition
```

으로 사용할 수 있는지 확인한다.

---

# 16. 칠살 존재 ≠ 건강 주의

금지:

```text
Seven Killing exists
→ health caution
```

반드시:

```text
current structural activation
ActualStructuralFunction
runtime
root/formation if required
```

등 현행 Judgment 결과를 따라야 한다.

---

# 17. 財生殺

현재 PatternEffectPolicy를 무시하고:

```text
財生殺
→ 건강 나쁨
```

으로 만들지 않는다.

칠살이 실제로 해로운 경로인지 먼저 확인해야 한다.

---

# 18. 양인 필요 칠살

FILUNE에서 필요한 칠살인 경우를
건강 위해 요소로 자동 처리하지 않는다.

PatternContext를 따른다.

---

# 19. 용신 제어/손상

source의:

```text
용신이 극을 받음
```

과 건강 관련 사례를 확인한다.

다음은 구분한다.

```text
valid control → function reduced/weakened
```

vs

```text
stop
```

기존 Runtime 계약을 유지한다.

---

# 20. 용신 합거

중요.

⑲-A에서:

```text
용신이 합으로 묶임
→ 건강과 직접 연결된 사례 없음
```

으로 확인된 경우,

다음 규칙을 만들지 않는다.

```text
용신 합거
→ 건강 손상
```

필요하면:

```text
DEFERRED
```

또는 일반 구조 판정 수준만 유지.

---

# 21. 병 해소

중요.

다음 추론:

```text
병이 해소됨
→ 건강이 회복됨
```

은 직접 건강 근거가 없으므로 자동 rule로 만들지 않는다.

상태:

```text
DEFERRED
```

또는:

```text
PROHIBITED_AS_AUTOMATIC_RULE
```

로 기록.

---

# 22. 일간 뿌리

다음 추론을 검토한다.

```text
일간 뿌리 약화/제거
→ 건강 문제
```

⑲-A에서 직접 연결 근거가 부족하다면
Outcome rule에 넣지 않는다.

---

# 23. 오행 상극

근거가 확인된:

```text
水剋火
```

등 특정 사례를 검토한다.

단:

```text
모든 오행 극
→ 건강 문제
```

라는 일반규칙으로 확장하지 않는다.

---

# 24. 조후

⑲-A에서 건강 직접 연결 근거가 없다면:

```text
조후
→ 건강 Outcome
```

자동 rule 금지.

상태:

```text
PROHIBITED / DEFERRED
```

중 근거에 맞게 기록.

---

# 25. 삼형

⑲-A의:

```text
丑戌未 삼형
```

사례는 보조 근거 수준인지 확인한다.

모든 형:

```text
→ 건강 악화
```

로 확대하지 않는다.

---

# 26. 지지 충

다음 추론:

```text
branch clash
→ 해당 오행 신체 부위 손상
```

이 직접 source rule인지 분석자 추정인지 구분한다.

분석자 추정이면 엔진 rule로 채택하지 않는다.

---

# 27. 삼합 / Formation

다음은 구분한다.

```text
삼합 자체
```

vs

```text
삼합으로 해로운 칠살 구조가 실제 성립
```

건강 Outcome은 후자처럼
구조적 기능이 확인되는 경우만 후보가 될 수 있다.

---

# 28. 대운 계절 방향 전환

CS-034 / R-43 근거의:

```text
Daewoon seasonal direction transition
```

이 건강 `attention timing`으로 사용할 수 있는 범위를 확인한다.

단일 사례인지 일반규칙인지 구분한다.

필요하면:

```text
SOURCE_INFERENCE
```

로 둔다.

---

# 29. 대운·세운 한 방향 집중

⑲-A의 사례:

```text
대운 + 세운이 한 오행 방향으로 몰림
```

조건을 감사한다.

일반 health rule로 고정 가능한지,
사례 수준에 머무는지 판정한다.

---

# 30. 원국 → 대운 → 세운 → 월운

CS-034가 FILUNE 건강 해석의 표준 경로로 제안되어 있다.

현행 spec이 다음 chain을 지원하는지 확인한다.

```text
Natal health context
↓
Daewoon condition
↓
Sewoon condition
↓
Month repetition/activation
```

---

# 31. 이 chain은 새 판정 엔진이 아님

각 scope의 기존 Judgment 결과를 읽는다.

금지:

```text
Health layer
→ Pattern 재계산
→ Role 재계산
→ Luck 재계산
```

---

# 32. 원국과 운 분리

반드시:

```text
원국의 바탕
```

과:

```text
운에서 생긴 조건
```

을 분리한다.

금지:

```text
운에서 일시적으로 생긴 건강 조건
→ 타고난 건강 약점
```

---

# 33. 좋은 운과 건강 분리

⑲-A에는:

```text
전체 운이 좋아도 건강은 별개일 수 있음
```

사례가 있다.

따라서:

```text
overall favorable scope
→ health favorable
```

자동 상속 금지.

Health Outcome은 건강 관련 근거를 별도로 요구한다.

---

# 34. 반대도 동일

```text
overall unfavorable scope
→ health unfavorable
```

자동 상속하지 않는다.

건강-specific condition이 있어야 한다.

---

# 35. Health Domain independence

향후 Outcome Engine 계약은 최소:

```text
Structural Overall Result
≠
Health Domain Result
```

을 명시해야 한다.

---

# 36. 식신

source에:

```text
식신이 힘을 못 쓰면 건강 문제
```

사례가 존재한다.

이것이:

```text
SOURCE_EXPLICIT general rule
```

인지,

```text
single-case/context-specific
```

인지 전수 감사한다.

단순:

```text
FoodGod reduced
→ health caution
```

으로 확정하지 않는다.

---

# 37. 스트레스형 구조

원고의:

```text
스트레스성 질환
불안
대인기피
집중력
```

등 표현을 현대 정신건강 진단처럼 사용하지 않는다.

고객 Health Outcome에서는
명리적 구조 압력 설명 범위만 허용한다.

---

# 38. 정신건강 진단 금지

금지:

```text
depression
anxiety disorder
panic disorder
mental illness
```

등 의학적 진단 추론.

---

# 39. Health Semantic Type 후보

source가 지원하면 향후 다음 정도만 허용한다.

```text
traditional_body_correspondence
structural_health_attention
health_attention_period
health_pressure_condition
```

다음은 지원 근거가 확인되기 전까지 만들지 않는다.

```text
disease_prediction
diagnosis
medical_risk_score
treatment
```

---

# 40. Relief semantic

`health_relief_period`를 별도 semantic으로 둘 수 있는지 감사한다.

중요:

```text
병 해소
→ 건강 회복
```

직접 변환은 금지.

실제 건강-specific pressure condition이 끝났다는 근거가 있을 경우에만:

```text
attention condition no longer active
```

정도로 처리 가능한지 검토한다.

---

# 41. "좋아졌다"보다 "주의 조건 종료"

근거가 부족하면:

```text
health improves
```

대신:

```text
previous attention condition is no longer active
```

로 제한한다.

---

# 42. 월별 건강

CH-7, CH-9, CH-10의 건강 관련 시기 정보는
동일한 Health OutcomeFact를 사용해야 한다.

금지:

```text
CH-7 health month logic
CH-10 health month logic
```

별도 구현.

---

# 43. 장 간 일관성

다음은 동일 provenance를 사용해야 한다.

```text
CH-7 건강
CH-8 대운
CH-9 세운
CH-10 월운
```

같은 건강 조건이 재등장할 경우
B-6 repetition contract만 다르게 적용.

---

# 44. Month ranking

이번 건강 audit에서도:

```text
best health month
worst health month
health score
```

를 만들지 않는다.

---

# 45. 관리에 유의할 달

다음 표현은:

```text
health_attention_period
```

근거가 있을 때만 사용 가능.

질병 발생 월이 아니다.

---

# 46. 가벼워지는 달

다음은 source에서 직접 지원되는지 감사한다.

```text
health_relief_period
```

지원되지 않으면 `DEFERRED`.

---

# 47. 甲·丙·戊己·辛·癸 처리

직접 R-43/사례 근거가 있는 경우에도
고객 semantic은:

```text
전통적으로 연결되는 관리 영역
```

수준.

금지:

```text
이 부위가 약하다
이 부위에 병이 난다
```

---

# 48. 乙·丁·庚·壬 처리

다음 rule을 명시한다.

```text
traditional element-level introduction only
```

금지:

```text
specific vulnerable body area
```

---

# 49. Source provenance 단계

건강 rule별로:

```text
R-43
case ID
traditional element table
analysis inference
FILUNE decision
```

을 구분한다.

---

# 50. 이미지 표의 근거 수준

⑲-A에 포함된 전통 오행표는:

```text
source title unknown
image reference
```

라는 제한이 있다.

따라서 authority 수준을 과장하지 않는다.

---

# 51. 추가 문헌

⑲-A G절의:

```text
滴天髓
三命通會
黃帝內經
窮通寶鑑
```

조사 후보를
현재 확정 rule처럼 사용하지 않는다.

---

# 52. 滴天髓

일부 질병 문구를 확인했더라도
판정 기준이 불충분하고 FILUNE의 자평진전 구조와 연결되지 않았다면:

```text
DEFERRED
```

유지.

---

# 53. 窮通寶鑑

조후 자료를 건강 rule로 가져오지 않는다.

---

# 54. 추가 연구는 blocker가 아님

P4-E v1 Health Outcome은
현재 근거로 안전하게 구현 가능한 subset만 사용 가능하다.

모든 건강 문헌 연구 완료를 기다릴 필요는 없다.

---

# 55. 현재 14 spec 대조표

반드시 다음 표를 만든다.

| Health Rule | ⑲-A | 현재 14 spec | 판정 | 조치 |
|---|---|---|---|---|

조치:

```text
KEEP
ADD
NARROW
DEFER
PROHIBIT
REMOVE
```

---

# 56. 필수 감사 항목

최소 다음을 각각 행으로 작성한다.

```text
H-01 일간 오행 전통 대응
H-02 甲 직접 부위
H-03 丙 직접 부위
H-04 土 직접 부위
H-05 辛 직접 부위
H-06 癸 직접 부위
H-07 乙/丁/庚/壬 element-only
H-08 손상된 용신 오행
H-09 상신 손상
H-10 칠살 소생
H-11 財生殺
H-12 용신 제어
H-13 용신 합거
H-14 병 강화
H-15 병 해소
H-16 일간 root 약화
H-17 오행 상극
H-18 대운 계절 전환
H-19 대세운 동일 방향 집중
H-20 조후
H-21 삼형
H-22 지지 충
H-23 삼합으로 칠살국
H-24 식신 기능 저하
H-25 overall luck vs health independence
H-26 Natal→Daewoon→Sewoon→Month chain
H-27 health attention period
H-28 health relief period
H-29 질병 예측
H-30 의료 권고
```

---

# 57. 규칙 채택 기준

`MISSING_SUPPORTED`를 14 spec에 추가하려면:

```text
source
+
condition
+
effect
+
limitation
```

네 요소가 명확해야 한다.

---

# 58. 단일 사후 사례

사후 사례 하나만 있는 규칙은
자동 `SOURCE_EXPLICIT`으로 승격하지 않는다.

필요하면:

```text
SOURCE_INFERENCE
```

또는:

```text
DEFERRED
```

---

# 59. 건강 Outcome에서 사후 사건 사용

사후 기록은:

```text
rule evidence
```

로 사용할 수 있으나
고객에게 사건을 예측하는 문장으로 변환하지 않는다.

---

# 60. Current Structural Function 우선

건강 Outcome이 역할을 읽을 때:

```text
RoleHistory
```

만으로 현재 건강 조건을 생성하지 않는다.

반드시 현재:

```text
CurrentFunction
Runtime
ActualStructuralFunction
```

을 고려해야 한다.

---

# 61. stopped

health pressure source가 현재:

```text
stopped
```

이면 현재 health attention을 계속 활성화하지 않는다.

다른 독립 근거가 있을 경우는 별도.

---

# 62. reduced

`reduced`는:

```text
full active
```

로 읽지 않는다.

---

# 63. conditional

조건부 병은:

```text
current health issue
```

로 만들지 않는다.

실제 발동 조건이 확인돼야 한다.

---

# 64. GuEung / relief

구응이 존재한다고:

```text
건강이 좋다
```

로 자동 변환하지 않는다.

---

# 65. same condition, same fact

동일 건강 조건은:

```text
CH-7
CH-8
CH-9
CH-10
```

에서 같은 OutcomeFact ID를 재사용할 수 있도록
향후 spec을 설계한다.

---

# 66. OutcomeFact 제안

필요한 경우 14 spec에
health-specific semantic contract를 보강한다.

예:

```ts
type HealthOutcomeType =
  | "traditional_body_correspondence"
  | "structural_attention"
  | "attention_period";
```

`relief_period`는 근거 감사 결과에 따라 결정.

---

# 67. 의료 결과 타입 금지

다음 enum/type 자체를 만들지 않는다.

```text
disease
diagnosis
illness_prediction
surgery
treatment
medical_score
```

---

# 68. 14 spec 수정

감사 결과:

```text
MISSING_SUPPORTED
```

가 존재하면:

```text
src/docs/rules/master/14-outcome-semantic-spec.md
```

을 최소 범위로 보강한다.

---

# 69. Source 변경 금지

수정:

```text
src/docs/source/health/FILUNE-19A-premium-health-evidence.md
```

0건.

---

# 70. Application code 변경 금지

이번 단계:

```text
src/lib/
```

변경 0건.

---

# 71. P4-D 기존 Work/Money/Relationship 변경 금지

이번 supplement는 Health만 다룬다.

Work/Money/Relationship 규칙을 함께 손대지 않는다.

---

# 72. Selection Layer 변경 금지

Top-3 관련 규칙은 별도다.

---

# 73. 결과 파일

```text
src/docs/codex/
p4d-health-outcome-supplement-audit-result.md
```

---

# 74. 결과 보고 — A. 전체 판정

```text
HEALTH_OUTCOME_SPEC_READY
```

또는:

```text
HEALTH_OUTCOME_SPEC_FIX_REQUIRED
```

---

# 75. B. Coverage

```text
Audit rules:
ALREADY_COVERED:
MISSING_SUPPORTED:
SOURCE_INFERENCE:
DEFERRED:
CONFLICT:
PROHIBITED:
```

---

# 76. C. 4 Levels

```text
Level 1 traditional correspondence:
Level 2 structural:
Level 3 timing:
Level 4 disease:
```

Expected:

```text
Level 4 = PROHIBITED
```

---

# 77. D. Day Stem Coverage

```text
甲:
乙:
丙:
丁:
戊:
己:
庚:
辛:
壬:
癸:
```

각각:

```text
direct-source-specific
element-level-only
```

구분.

---

# 78. E. Structural Conditions

```text
YongShen damage:
SangShen damage:
Killing activation:
Wealth→Killing:
Root damage:
Formation:
Clash:
Season transition:
```

각 status.

---

# 79. F. Lifecycle

```text
Natal:
Daewoon:
Sewoon:
Month:
expired:
stopped:
reduced:
conditional:
```

---

# 80. G. Prohibited

```text
Disease diagnosis:
Disease timing:
Medical advice:
Treatment:
Life expectancy:
Health score:
```

Expected 모두:

```text
PROHIBITED
```

---

# 81. H. 14 spec changes

수정한 rule/section 목록.

변경이 없으면:

```text
none
```

---

# 82. I. Source integrity

```text
health source changed:
application code changed:
Work/Money/Relationship changed:
Selection Layer changed:
```

Expected 모두:

```text
0
```

단 14 spec Health section 변경만 허용.

---

# 83. J. 남은 연구

별도 정리:

```text
future literature research
```

와:

```text
v1 implementation blocker
```

를 구분한다.

추가 문헌 연구가 없어도
현재 안전한 subset 구현이 가능하면 blocker로 두지 않는다.

---

# 84. 종료 조건

다음을 만족하면:

```text
HEALTH_OUTCOME_SPEC_READY
```

판정한다.

```text
[ ] 건강 4단계 계약 확정
[ ] 10일간 근거 수준 분리
[ ] 乙丁庚壬 과잉 확장 금지
[ ] 손상된 용신 규칙 감사
[ ] 상신 손상 규칙 감사
[ ] 칠살 소생 규칙 감사
[ ] 財生殺 context 보존
[ ] 용신 합거 자동 건강 손상 금지
[ ] 병 해소 자동 건강 회복 금지
[ ] root 약화 자동 건강 문제 금지
[ ] 조후 건강 자동 연결 금지
[ ] 원국→대운→세운→월운 계약
[ ] overall luck와 health 분리
[ ] stopped/reduced/conditional 상태 보존
[ ] CH-7/8/9/10 동일 조건 재사용
[ ] 질병 예측 0
[ ] 의료 권고 0
[ ] 건강 score 0
[ ] unsupported rule 0
[ ] application code 변경 0
```

---

# 85. 완료 후 다음 단계

이 audit가:

```text
HEALTH_OUTCOME_SPEC_READY
```

로 끝나면 P4-D는 최종적으로 닫는다.

그 다음 구현 batch는
기존 P4-D 결과와 이번 supplement를 합쳐 결정한다.

현재 예상 후보:

```text
P4-E Outcome Semantic Engine — Batch 1
```

단 실제 구현 우선순위는
보강 감사 결과를 보고 확정한다.

Health가 준비되었다고 해서
Work의 SOURCE_GAP을 임의로 채우지 않는다.