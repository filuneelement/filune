# FILUNE Compatibility-04A
## Relationship Breakdown Judgment Fact Minimal Fix

현재 상태:

```text
COMPATIBILITY_C4_JUDGMENT_FACT_GAP
```

C4 전체 설계는 유지한다.

이미 통과한 항목:

```text
戊戌 실제 결혼
→ marriage opportunity confirmed

戊申 결혼 주의
→ marriage opportunity confirmed
→ marriage caution confirmed

乙丑 + 甲辰 복합 이혼
→ relationship breakdown risk confirmed

relationship formation/change
marriage opportunity
marriage favorable/caution
relationship strain/relief
pair timing
```

현재 유일한 blocker:

```text
丁酉 배우자궁 충 + 실제 이혼 source case

relationship_change = confirmed

BUT

원국의 배우자 관계 취약성
+
丁酉 scope의 배우자 기능 손상

을 동일 breakdown path로 연결할
public Judgment evidence가 부족함

→ relationship_breakdown_risk deferred
```

이번 작업은 이 1건만 수정한다.

---

# ALLOWED SOURCES

반드시 현재 파일만 사용한다.

```text
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md
src/docs/rules/master/16-compatibility-spec.md

src/docs/codex/compatibility-04-relationship-lifecycle-timing-result.md

현재 src/lib/judgment/
현재 src/lib/outcome/relationship/
현재 src/lib/compatibility/
```

source 의미 확인은:

```text
src/docs/source/primary/07-사주풀이예시.md
```

의 해당 丁酉 사례만 사용한다.

과거 revision이나 옛 분석 문서에서
새 규칙을 가져오지 않는다.

---

# 1. 최종 목표

성공:

```text
READY_TO_RERUN_COMPATIBILITY_C4
```

새 정책이 필요한 경우:

```text
COMPATIBILITY_C4A_POLICY_DECISION_REQUIRED
```

코드 수정 후에도 blocker가 남으면:

```text
COMPATIBILITY_C4A_FIX_REQUIRED
```

---

# 2. 새 명리 규칙 추가 금지

이번 단계에서 새로 만들면 안 되는 것:

```text
丁酉 = 이혼
卯酉沖 = 이혼
배우자궁 충 = 이혼
관계 부담 = 이혼
```

Judgment에:

```text
divorce
breakup
marriage_failure
```

같은 생활 결과 Fact를 추가하지 않는다.

---

# 3. 필요한 구조

C4가 읽어야 하는 경로는:

```text
Natal relationship vulnerability
↓
Current scope harmful interaction
↓
Spouse / relationship function damage
↓
Relationship breakdown pressure
```

이다.

---

# 4. 먼저 gap 유형을 확인

丁酉 source case를 실제 실행하여 다음을 확인한다.

## A. JUDGMENT_EXPOSURE_GAP

```text
Judgment 내부에서는 이미:
- 원국 배우자 취약성
- 현재 배우자 기능 손상

을 계산함

BUT

public JudgmentResult / snapshot에서
C4가 연결할 ID 또는 CurrentFunction이 없음
```

이면:

```text
기존 계산값만 additive exposure
```

한다.

---

## B. JUDGMENT_COMPUTATION_GAP

현재 Judgment 자체가 필요한 structural Fact를
계산하지 않지만,

```text
현재 Master 05/08/09
```

에 이미 확정 규칙이 있으면:

```text
그 누락된 structural Fact만 최소 계산
```

한다.

새 Relationship/Divorce policy는 만들지 않는다.

---

## C. SOURCE_OR_POLICY_GAP

현재 Master만으로도
배우자 기능 손상을 구조적으로 확정할 수 없다면
임의 구현하지 않는다.

```text
COMPATIBILITY_C4A_POLICY_DECISION_REQUIRED
```

로 중단한다.

---

# 5. 이번 source case의 실제 path를 출력

반드시 결과 문서에:

```text
Natal vulnerability:
  Fact ID:
  semantic:
  current/history state:

丁酉 interaction:
  Fact ID:
  relation:
  source:
  target:

Spouse-function damage:
  Fact ID:
  CurrentFunction:

Breakdown linkage:
  Fact IDs:
```

형태로 기록한다.

---

# 6. 배우자궁 충은 trigger로 유지

현재 이미 생성되는:

```text
relationship_change = confirmed
```

는 유지한다.

이를 삭제하거나:

```text
relationship_breakdown_risk
```

와 동일시하지 않는다.

---

# 7. spouse-palace clash의 역할

배우자궁 충은:

```text
relationship_change_trigger
```

이다.

Breakdown risk를 만들려면 추가로:

```text
Natal vulnerability
+
Current harmful relationship damage
```

가 필요하다.

---

# 8. Natal vulnerability

현재 코드에 이미 존재하는
source-backed 관계 취약 Fact를 재사용한다.

후보를 이름으로 추정하지 말고 실제 repository를 확인한다.

예:

```text
spouse-significator damage
spouse-palace structural damage
relationship harmful path
persistent relationship pressure
```

중 실제 canonical Fact만 사용한다.

---

# 9. 새 vulnerability score 금지

금지:

```text
vulnerabilityScore
riskPoint
damageCount
clashCount
```

질적 구조 Fact만 사용한다.

---

# 10. Current spouse-function damage

丁酉 scope에서 실제로
배우자 관련 기능이:

```text
weakened
stopped
damaged
harmful-path activated
```

중 무엇인지
현재 Judgment의 Relation / Role / ActualStructuralFunction을 통해 확인한다.

---

# 11. 이름만으로 추정 금지

금지:

```text
재성이라 배우자
관살이라 배우자
酉가 들어왔으니 손상
卯酉沖이니 배우자 기능 파괴
```

실제 person-specific spouse-significator와
실제 relation/effect linkage를 사용한다.

---

# 12. Public linkage

C4가 필요한 것은
새 생활 결과가 아니라:

```text
Natal vulnerability Fact ID
Current damage Fact ID
target spouse/relationship identity
scope
origin/provenance
```

이다.

---

# 13. additive 우선

가능하면 기존 public schema를 깨지 말고:

```text
기존 collection의 누락 Fact 노출
기존 target/linkage ID 추가
기존 CurrentFunction 노출
```

방식으로 해결한다.

---

# 14. Relationship Outcome 재사용 가능성 확인

이미:

```text
src/lib/outcome/relationship/
```

에서 동일한 spouse/relationship damage를
confirmed OutcomeFact로 만들고 있다면
C4가 이를 재사용할 수 있는지 확인한다.

단 Outcome layer가
새 명리 구조 계산을 다시 하게 만들지 않는다.

---

# 15. 우선순위

선호 순서:

```text
1. 기존 Judgment Fact 직접 재사용
2. 기존 Judgment 계산값 additive exposure
3. 기존 Relationship Outcome의 confirmed semantic 재사용
4. Master-defined missing structural calculation 최소 추가
```

금지:

```text
C4 adapter에서 십성/충/역할을 다시 명리 계산
```

---

# 16. Source case 기대 결과

丁酉 실제 이혼 사례에서
구조 path가 실제 confirmed된다면:

```text
relationship_change = confirmed
relationship_breakdown_risk = confirmed
```

둘 다 생성한다.

---

# 17. certainty downgrade 금지

필요 경로가 모두 confirmed인데:

```text
이혼 사건이라 민감하므로 deferred
```

같은 이유로 낮추지 않는다.

구조적으로 confirmed면:

```text
relationship_breakdown_risk = confirmed
```

이다.

---

# 18. 하지만 사건 확정과 구분

내부 의미:

```text
relationship_breakdown_risk confirmed
```

이지:

```text
divorce guaranteed
```

가 아니다.

이 구분은 그대로 유지한다.

---

# 19. Negative regression 필수

Synthetic 또는 기존 fixture에서:

```text
spouse-palace clash
+
Natal vulnerability 없음
+
spouse-function damage 없음
```

이면:

```text
relationship_change = confirmed
relationship_breakdown_risk = 0
```

이어야 한다.

---

# 20. 또 다른 negative regression

```text
Natal vulnerability 있음
BUT
현재 spouse/relationship damage 없음
```

이면:

```text
relationship_breakdown_risk
```

자동 생성 금지.

---

# 21. 복합 이혼 source case 회귀

이미 통과한:

```text
乙丑 + 甲辰
```

복합 이혼 source case의
`relationship_breakdown_risk = confirmed`
결과를 그대로 유지한다.

---

# 22. 결혼 관련 결과 변경 금지

이미 통과한:

```text
戊戌 marriage opportunity
戊申 marriage opportunity + caution
```

결과를 변경하지 않는다.

---

# 23. C1/C2/C3 변경 금지

Expected:

```text
Compatibility C1 semantic changes = 0
Compatibility C2 semantic changes = 0
Compatibility C3 semantic changes = 0
```

---

# 24. 기존 엔진 isolation

Expected:

```text
Judgment unrelated semantic changes = 0
Personality changes = 0
Money changes = 0
Health changes = 0
Relationship existing semantic changes = 0
Event Timing Batch 1 changes = 0
```

---

# 25. targeted verifier

권장:

```text
scripts/verify-compatibility-breakdown-fact-fix-c4a.mjs
```

먼저 이것만 실행한다.

---

# 26. Targeted 필수 결과

```text
丁酉 source case:
  Natal vulnerability:
  Current spouse damage:
  relationship change:
  breakdown risk:

乙丑+甲辰 source case:
  breakdown risk:

clash-only negative:
  relationship change:
  breakdown risk:

vulnerability-only negative:
  breakdown risk:
```

---

# 27. targeted 성공 후에만 C4 재실행

Targeted가 PASS하면:

```text
scripts/verify-compatibility-lifecycle-timing-c4.mjs
```

또는 실제 C4 verifier를 다시 실행한다.

---

# 28. C4 전체를 다시 설계하지 않는다

금지:

```text
Master 16 전체 재작성
C4 event taxonomy 변경
새 divorce policy
새 marriage policy
새 scoring
새 fixture expectation
```

---

# 29. Master 변경

필요한 경우에만
현재 확정된 **Fact exposure/linkage contract**를
Master 16 또는 09에 additive하게 기록한다.

새 명리 의미를 추가하지 않는다.

---

# 30. Regression

C4 targeted PASS 후 최소:

```text
Compatibility C1
Compatibility C2
Compatibility C3
Compatibility C4

Judgment 35/35
Relationship Outcome
Event Timing Batch 1

npx tsc -b
npm run build
git diff --check
```

---

# 31. 결과 파일

생성:

```text
src/docs/codex/compatibility-04a-relationship-breakdown-judgment-fact-fix-result.md
```

---

# 32. 결과 보고

반드시:

```text
Gap class:
  EXPOSURE / COMPUTATION / POLICY

Natal vulnerability Fact:
Current spouse-damage Fact:
Linkage:

Files changed:

丁酉:
  relationship_change:
  relationship_breakdown_risk:

乙丑+甲辰:
  relationship_breakdown_risk:

clash-only negative:
vulnerability-only negative:

Judgment unrelated changes:
C1 changes:
C2 changes:
C3 changes:

TypeScript:
Build:
```

---

# 33. 성공 판정

다음을 만족하면:

```text
READY_TO_RERUN_COMPATIBILITY_C4
```

조건:

```text
[ ] 丁酉 source case의 실제 structural path 연결
[ ] 일지 충 단독 divorce shortcut 0
[ ] Natal vulnerability 단독 shortcut 0
[ ] 기존 복합 이혼 source 회귀 유지
[ ] 기존 결혼 source 회귀 유지
[ ] 새 명리 정책 추가 0
[ ] C1/C2/C3 변경 0
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 34. 다음 단계

`READY_TO_RERUN_COMPATIBILITY_C4`가 나오면
새 작업을 만들지 말고
기존 C4 verifier만 다시 실행한다.

성공하면:

```text
COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY
```

로 C4를 닫고
바로 Compatibility-05 Final Assembly로 이동한다.