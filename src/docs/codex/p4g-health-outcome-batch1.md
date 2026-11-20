# FILUNE Codex P4-G
## Health Outcome Semantic Engine — Batch 1

현재 저장소 기준점은 commit `2f15895`이다.

이미 완료된 상태:

- Reading Assembly Core COMPLETE
- Relationship Outcome Batch 1 COMPLETE
- Health Outcome Source Contract READY
- `src/docs/rules/master/14-outcome-semantic-spec.md`에 Health 계약 반영 완료

이번 단계에서는 **현행 14-outcome-semantic-spec.md에서 승인된 Health subset만 구현한다.**

새 건강 규칙을 연구하거나 추가하지 않는다.

## 1. 먼저 확인할 파일

반드시 읽는다.

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/codex/p4d-health-outcome-supplement-audit-result.md
src/docs/codex/p4d-outcome-semantic-source-audit-result.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/source/health/FILUNE-19A-premium-health-evidence.md
```

그리고 현행 구현을 확인한다.

```text
src/lib/judgment/
src/lib/outcome/
src/lib/reading/
```

## 2. 구현 범위

현행 14 spec에서 승인된 범위만 구현한다.

```text
traditional_body_correspondence
structural_health_attention
health_attention_period
```

그리고 다음 scope/lifecycle을 지원한다.

```text
Natal
Daewoon
Sewoon
Month

active
reduced
stopped/inactive
conditional
expired
```

Reading Assembly에서는 동일 Health OutcomeFact를 필요에 따라:

```text
CH-07
CH-08
CH-09
CH-10
```

에서 재사용할 수 있어야 한다.

## 3. 구현하지 않을 것

다음은 반드시 미구현 상태로 유지한다.

```text
health_relief_period

disease_prediction
disease_timing
diagnosis
medical_advice
treatment
surgery_prediction
life_expectancy

health_score
health_rank
best_health_month
worst_health_month
```

## 4. 별도 Health 판단 엔진 금지

새로 만들지 않는다.

```text
HealthJudgmentEngine
HealthSajuEngine
HealthLuckEngine
```

구조는 다음이어야 한다.

```text
기존 JudgmentResult
+
기존 Luck snapshots
↓
Health Outcome semantic adapter
↓
OutcomeFact
↓
ReadingAssembly
```

Health Layer가 Pattern, YongShen, SangShen, Byeong, Root, Formation, Runtime을 재계산하면 안 된다.

## 5. 일간별 전통 신체 대응

10일간을 모두 지원하되 근거 수준을 구분한다.

특히:

```text
乙
丁
庚
壬
```

은 같은 오행의 다른 일간에 있는 특정 부위를 복사하지 않는다.

허용:

```text
day stem
→ element
→ traditional element-level correspondence
```

금지:

```text
乙 → 甲의 특정 취약 부위 자동 상속
丁 → 丙의 특정 취약 부위 자동 상속
庚 → 辛의 특정 취약 부위 자동 상속
壬 → 癸의 특정 취약 부위 자동 상속
```

전통 신체 대응은 어디까지나:

```text
traditional reference area
```

이다.

다음 의미로 바꾸지 않는다.

```text
weak body area
vulnerable organ
disease
medical risk
```

## 6. Structural Health Attention

현행 14 spec에서 승인한 조건만 사용한다.

단순히 다음이 존재한다는 이유로 Health attention을 만들지 않는다.

```text
YongShen 존재
SangShen 존재
Seven Killing 존재
財生殺 존재
Branch Clash 존재
Formation 존재
Root 약화
```

반드시 기존 Judgment에서 **실제 해로운 구조적 기능과 현재 작동 상태가 확인된 경우**만 사용한다.

## 7. 칠살

금지:

```text
Seven Killing exists
→ health caution
```

필요:

```text
harmful killing path
+
actual structural activation
+
current function/runtime
```

필요한 칠살, 특히 구조적으로 필요한 殺은 Health 위험으로 자동 분류하지 않는다.

## 8. 財生殺

```text
財生殺
```

RelationFact만으로 Health Outcome을 만들지 않는다.

해당 殺이 실제 해로운 경로인지 기존 Judgment 결과를 따른다.

## 9. stopped / inactive

Health pressure source가 현재:

```text
stopped
inactive
```

이면 current Health attention을 활성화하지 않는다.

## 10. reduced

`reduced`를 full confirmed Health pressure로 올리지 않는다.

## 11. conditional

ConditionalByeong이 존재해도 실제 발동하지 않았다면:

```text
confirmed health attention = 0
```

이어야 한다.

## 12. GuEung / 병 해소

다음 자동 추론을 하지 않는다.

```text
병 해소
→ 건강 회복

구응 존재
→ 건강이 좋아짐
```

`health_relief_period`는 이번 Batch에서 구현하지 않는다.

## 13. 용신 합거

다음 규칙을 만들지 않는다.

```text
YongShen stopped/combine
→ health damage
```

14 spec에서 승인된 실제 Health 조건만 사용한다.

## 14. Scope

Health OutcomeFact는 기존 scope를 그대로 보존한다.

```text
natal
daewoon
sewoon
month
```

Day는 현재 B 감정서 기본 Health routing에 추가하지 않는다.

## 15. 원국 → 대운 → 세운 → 월운

같은 underlying Health condition이 여러 scope에서 이어질 경우:

- 기존 source identity 보존
- provenance 보존
- scope별 current state 보존
- 같은 건강 문제를 새로 발명하지 않음

## 16. Expiry

운 조건이 끝나면 current Health attention에서 제외한다.

하지만:

```text
expired
→ health recovered
```

로 바꾸면 안 된다.

## 17. Overall luck와 Health 분리

금지:

```text
overall favorable
→ health favorable

overall unfavorable
→ health unfavorable
```

Health-specific 구조 근거가 별도로 있어야 한다.

## 18. OutcomeFact

P4-E에서 만든 공통 Outcome 타입을 우선 재사용한다.

새 Health 전용 판단 모델을 만들지 않는다.

Health semantic의 예:

```text
domain = health

semanticType =
traditional_body_correspondence
structural_health_attention
health_attention_period
```

실제 타입명은 현행 14 spec을 따른다.

## 19. Provenance

모든 structural Health OutcomeFact는 실제 upstream 근거를 가진다.

예:

```text
sourceJudgmentIds
sourceRoleIds
sourceRelationIds
sourceLuckEffectIds
```

`traditional_body_correspondence`는 health knowledge/source provenance를 사용할 수 있다.

Orphan provenance는 0이어야 한다.

## 20. Stable ID

동일 입력이면 항상 동일 ID.

랜덤 UUID를 semantic identity로 사용하지 않는다.

## 21. Reading Assembly

기존 P4-B/C Assembly Core를 재사용한다.

별도 Health Assembly를 만들지 않는다.

같은 OutcomeFact가 여러 장에서 필요하면 동일 ID를 재사용한다.

```text
CH-07 = 건강 context
CH-08 = 대운 timing/context
CH-09 = 세운 timing/context
CH-10 = 월 timing/context
```

## 22. CH-07 상태

이번 Batch가 끝나도:

```text
CH-07 = PARTIAL
```

을 유지한다.

Full Health Reading READY로 올리지 않는다.

## 23. Free Scope

무료 감정서에서는 운 기반 Health timing을 노출하지 않는다.

```text
Daewoon = 0
Sewoon = 0
Month = 0
Day = 0
```

## 24. 금지 의료 의미

다음 결과/semantic/type을 생성하지 않는다.

```text
질병 예측
질병명
발병 시기
진단
의사 방문 권고
검진 권고
약
치료
수술
수명
사망
```

## 25. 점수·순위 금지

```text
health score
health percentage
health grade
health ranking
best health month
worst health month
```

모두 0.

## 26. 다른 영역 격리

이번 구현에서 의미 변경 0:

```text
Judgment
Personality
Relationship Outcome
Money
Work
Selection Layer
Compatibility
```

특히 완료된 Relationship Batch 1을 수정하지 않는다.

## 27. 권장 테스트

신규:

```text
scripts/verify-health-outcome-p4g.mjs
```

최소 다음을 검증한다.

### A. 10일간

```text
10/10 registered
乙丁庚壬 specificity violation = 0
disease inference = 0
```

### B. Approved Structural Attention

기존 Judgment fixture의 승인 harmful path에서:

```text
structural_health_attention
```

생성.

### C. Needed / non-harmful Killing

```text
health attention = 0
```

또는 현행 contract에 따른 deferred.

### D. stopped

```text
current health attention = 0
```

### E. reduced

full confirmed로 승격 0.

### F. conditional

발동 전 confirmed Health attention 0.

### G. Daewoon

scope와 provenance 검증.

### H. Sewoon

scope와 provenance 검증.

### I. Month

scope와 provenance 검증.

### J. expiry

```text
currentlyEffective = false
current reading leakage = 0
```

### K. fake relief

```text
health_improved = 0
health_recovered = 0
health_relief_period = 0
```

### L. Assembly reuse

동일 Health OutcomeFact를 CH-07~10에서 필요에 따라 같은 ID로 재사용.

### M. Free

운 기반 Health timing 노출 0.

### N. Safety

```text
disease prediction = 0
diagnosis = 0
medical advice = 0
life expectancy = 0
health score = 0
health rank = 0
best/worst month = 0
```

## 28. Determinism

같은 입력을 두 번 실행한다.

확인:

```text
same OutcomeFact IDs
same semanticType
same scope
same certainty
same provenance
```

## 29. 배열 순서 독립성

upstream Role/Relation/Effect 배열 순서가 바뀌어도 동일 의미 결과.

## 30. 회귀

반드시 기존 회귀를 유지한다.

```text
Judgment 35/35 PASS

P2-A~G PASS
P3-A~F PASS

P4-B PASS
P4-C PASS
P4-E PASS
P4-F PASS
```

그리고 신규:

```text
P4-G PASS
```

## 31. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

## 32. 결과 파일

반드시 생성:

```text
src/docs/codex/p4g-health-outcome-batch1-result.md
```

## 33. 최종 판정

성공하면 반드시 결과 파일과 최종 응답에:

```text
READY_FOR_HEALTH_OUTCOME_AUDIT
```

을 기록한다.

실패 시:

```text
P4G_FIX_REQUIRED
```

## 34. 결과 보고

최소 다음을 기록한다.

### Coverage

```text
traditional correspondence:
structural health attention:
Daewoon attention:
Sewoon attention:
Month attention:

health relief:
disease:
medical advice:
```

### Day Stem

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

각 specificity 수준.

### Provenance

```text
facts:
with provenance:
orphan:
duplicate ID:
scope mismatch:
```

### Lifecycle

```text
active:
reduced:
stopped:
conditional:
expired:
```

### Assembly

```text
CH-07:
CH-08:
CH-09:
CH-10:
same OutcomeFact reuse:
free scope leakage:
```

### Safety

```text
disease prediction:
diagnosis:
medical advice:
treatment:
life expectancy:
health score:
health ranking:
best/worst month:
```

모두 0 목표.

### Isolation

```text
Judgment changes:
Personality changes:
Relationship changes:
Money changes:
Work changes:
Selection changes:
Compatibility changes:
```

모두 0 목표.

---

# 완료 조건

다음을 충족해야 한다.

```text
[ ] 현재 14 spec의 승인 Health subset만 구현
[ ] 10일간 계약 보존
[ ] 乙丁庚壬 과잉 구체화 0
[ ] structural health attention provenance 존재
[ ] harmful Killing context 보존
[ ] needed Killing 오판 0
[ ] stopped leakage 0
[ ] conditional confirmed leakage 0
[ ] Natal/Daewoon/Sewoon/Month scope 보존
[ ] expired current leakage 0
[ ] fake health relief 0
[ ] CH-07~10 동일 OutcomeFact 재사용
[ ] free timing leakage 0
[ ] 질병 예측 0
[ ] 의료 권고 0
[ ] 건강 score/rank 0
[ ] best/worst month 0
[ ] Judgment 재판정 0
[ ] Relationship 변경 0
[ ] Money/Work 변경 0
[ ] Selection 변경 0
[ ] Compatibility 변경 0
[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```