# FILUNE Codex P4-E
## Relationship Outcome Semantic Engine — Batch 1

P4-D Outcome Source Audit와 Health Supplement Audit가 완료되었다.

현재 상태:

```text
Reading Assembly Core COMPLETE

Outcome Source Contract:
Work          SOURCE_GAP
Money         PARTIAL_OUTCOME_IMPLEMENTATION
Relationship  PARTIAL_OUTCOME_IMPLEMENTATION
Health        PARTIAL_OUTCOME_IMPLEMENTATION

Health Outcome Source Contract = READY
Selection Layer = 별도
```

P4-D에서 제안한 첫 구현 Batch는:

```text
Relationship
- 원국 관계 자리
- 근거가 확인된 접점·변화 신호
```

이다.

이번 P4-E에서는 **Relationship Outcome 전체를 구현하지 않는다.**

다음만 구현한다.

```text
1. 관계 자리 / 배우자궁 semantic
2. 관계 관련 육친 significator의 존재와 현재 기능
3. 근거가 확인된 합·충 등 접점/변화 signal
4. 해당 signal의 Natal / Luck scope
5. certainty와 provenance
6. Reading Assembly 전달
```

구현하지 않는다.

```text
결혼 성사 예측
좋은 배우자 / 나쁜 배우자
이혼
외도
운명적 인연
관계 성공 확정
궁합
약속 성사 시기
유리한 관계 발전 시기
```

---

# 1. 기준 문서

반드시 실제 파일을 읽는다.

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/codex/p4d-outcome-semantic-source-audit-result.md

src/docs/rules/master/13-reading-assembly-spec.md
src/docs/codex/p4c-reading-assembly-integration-audit-result.md

src/docs/source/authority/A_rev182.md
src/docs/source/authority/B_rev38.md
src/docs/source/authority/C_rev215.md

src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
```

특히 `14-outcome-semantic-spec.md`의 Relationship section을 구현 계약으로 사용한다.

---

# 2. 절대 원칙

Outcome Engine은 기존 Judgment를 다시 판단하지 않는다.

구조:

```text
JudgmentResult
+
Luck snapshots
+
Relationship source contract
↓
Relationship OutcomeFact
↓
Reading Assembly
```

금지:

```text
Outcome Engine
→ Pattern 재판정
→ YongShen 재선정
→ Role 재판정
→ Branch relation 재계산
```

기존 결과를 read-only로 사용한다.

---

# 3. 권장 코드 위치

기존 namespace를 확인한 뒤 충돌이 없다면:

```text
src/lib/outcome/
├─ types.ts
├─ relationship/
│  ├─ relationshipOutcome.ts
│  ├─ relationshipPalace.ts
│  ├─ relationshipSignals.ts
│  └─ index.ts
└─ index.ts
```

기존 outcome/domain namespace가 있으면 새 구조를 만들기 전에 재사용한다.

---

# 4. 공통 OutcomeFact

가능하면 Relationship 전용 문자열 결과가 아니라
다른 Outcome domain에서도 확장 가능한 언어중립 타입을 사용한다.

예:

```ts
interface OutcomeFact {
  id: string;

  domain:
    | "work"
    | "money"
    | "relationship"
    | "health";

  semanticType: string;

  scope:
    | "natal"
    | "daewoon"
    | "sewoon"
    | "month";

  certainty:
    | "confirmed"
    | "contextual"
    | "conditional"
    | "deferred";

  currentlyEffective: boolean;

  sourceJudgmentIds: string[];
  sourceRelationIds: string[];
  sourceRoleIds: string[];
  sourceLuckEffectIds: string[];

  provenance: string[];
}
```

실제 현행 타입 계약에 맞게 조정한다.

---

# 5. Relationship Outcome은 궁합이 아니다

이번 Engine은:

```text
한 사람의 명식
→ 그 사람의 관계 관련 구조
```

만 다룬다.

금지:

```text
Person A + Person B
→ compatibility
```

두 명식을 비교하는 Compatibility Engine은 별도 후속 트랙이다.

---

# 6. 관계 자리

현행 source가 지원하는:

```text
일지 = 관계/배우자 자리
```

의 contextual semantic을 사용한다.

그러나:

```text
일지 상태
→ 실제 배우자 상태
```

로 직접 변환하지 않는다.

---

# 7. Palace semantic

허용 semantic 후보:

```text
relationship_palace_context
relationship_contact_signal
relationship_change_signal
relationship_pressure_signal
```

실제 14 spec에서 승인된 이름을 우선 사용한다.

---

# 8. 관계 자리 ≠ 결혼 여부

고객이 미혼인지 기혼인지 알 수 없다.

따라서:

```text
배우자궁
```

은 내부 semantic name일 수 있으나
Outcome 의미는:

```text
close_relationship_context
```

처럼 실제 생활 상태를 전제하지 않아야 한다.

---

# 9. 육친 significator

현행 source에서 확인된 육친 연결을 사용하되
존재 자체를 사건으로 만들지 않는다.

예:

```text
significator exists
```

≠

```text
partner exists
marriage occurs
```

---

# 10. 성별 rule

A/source가 명시적으로 사용하는 관계 significator가 있다면
그 source contract 범위에서만 사용할 수 있다.

Personality에서 제외했던 성별 결정론을 다시 가져오지 않는다.

금지:

```text
남성/여성이라는 이유만으로 성격이나 관계 품질 단정
```

---

# 11. RelationshipStyle과 분리

Personality Engine의:

```text
relationshipStyle
```

과 Relationship Outcome은 다른 계층이다.

RelationshipStyle은:

```text
사람을 대하는 경향
```

이고,

Relationship Outcome은:

```text
명식 구조상의 관계 자리와 관계 signal
```

이다.

한쪽을 다른 쪽으로 자동 변환하지 않는다.

---

# 12. 합

현행 Branch Relation Rule을 따른다.

합은:

```text
contact
connection
change signal
```

후보가 될 수 있다.

금지:

```text
합
→ 좋은 관계
→ 결혼
→ 궁합 좋음
```

---

# 13. 六合 특칙

현행 master 계약:

```text
六合
= relation + binding / functional adjustment
≠ elemental transformation
≠ automatic strengthening
≠ full stop
```

을 그대로 유지한다.

Relationship Outcome에서 이를:

```text
romantic harmony
perfect match
```

로 바꾸지 않는다.

---

# 14. 三合 / 半合

formation이 실제 관계 자리 또는 관계 관련 구조와 연결될 때
승인된 범위의 contextual signal만 생성한다.

금지:

```text
삼합
→ 좋은 인연
```

---

# 15. 충

현행 Branch Rule:

```text
충 = bilateral relation
```

을 사용한다.

Relationship Outcome에서는
근거가 확인된 경우:

```text
change signal
pressure signal
```

정도로 제한한다.

금지:

```text
충
→ 이별
→ 이혼
→ 관계 파탄
```

---

# 16. 형·파·해

현행 master의 중요도와 조건을 보존한다.

특히:

```text
파 / 해 = secondary
형 = conditional
```

이라는 기존 계약을 무시해
강한 관계 예측으로 승격하지 않는다.

---

# 17. 원진

14 spec/source에 실제 승인 rule이 있는 범위만 사용한다.

원진이라는 이름만으로:

```text
악연
나쁜 궁합
```

을 만들지 않는다.

---

# 18. RelationFact 재사용

이미 Judgment에서 계산된:

```text
BranchRelationFact
```

또는 동등 결과를 읽는다.

Outcome Engine에서 같은 branch relation을 다시 계산하지 않는다.

---

# 19. ActualStructuralFunction

관계 신호의 의미가 Structural Function에 영향을 받는다고
14 spec이 요구할 경우 기존 결과를 읽는다.

RelationFact 하나만으로 좋음/나쁨을 확정하지 않는다.

---

# 20. Scope

OutcomeFact는 반드시 원래 scope를 보존한다.

```text
natal
daewoon
sewoon
month
```

---

# 21. Natal

원국 관계 자리는:

```text
baseline relationship context
```

이다.

현재 사건을 의미하지 않는다.

---

# 22. Luck contact

운에서 관계 자리에 접점이 생기면:

```text
relationship_contact_signal
```

후보가 될 수 있다.

단:

```text
새 사람 등장 확정
```

으로 바꾸지 않는다.

---

# 23. Luck change

운에서 관계 자리에 구조적 변화가 생기면
근거 범위에서:

```text
relationship_change_signal
```

을 생성할 수 있다.

금지:

```text
관계가 시작된다
관계가 끝난다
```

확정.

---

# 24. contact와 favorable 분리

중요.

```text
contact signal
≠
favorable relationship development
```

이다.

이번 Batch는 **contact / change까지만** 구현한다.

---

# 25. commitment timing

이번 Batch에서 구현하지 않는다.

```text
marriage
engagement
major commitment
```

관련 signal은 `DEFERRED` 또는 후속 Batch.

---

# 26. favorable-development timing

이번 Batch에서 구현하지 않는다.

I-22의 더 강한 조건은 후속 source/implementation batch로 남긴다.

---

# 27. 고객 생활 상태

다음 정보가 입력에 없으면 추정하지 않는다.

```text
single
dating
married
divorced
partner exists
```

---

# 28. Outcome certainty

원국 자리 의미:

```text
contextual
```

일 가능성이 높지만 14 spec의 확정 계약을 따른다.

Luck contact/change signal 역시
source 계약에 맞는 certainty를 사용한다.

임의로 confirmed로 올리지 않는다.

---

# 29. 사건 certainty와 구분

```text
confirmed relation signal
```

이라고 해도:

```text
confirmed real-world relationship event
```

라는 뜻이 아니다.

---

# 30. stopped / inactive

관계 signal의 source가 현재:

```text
stopped
inactive
expired
```

이면 current OutcomeFact를 활성화하지 않는다.

---

# 31. reduced

source relation/function이 reduced라면
full confirmed signal로 승격하지 않는다.

---

# 32. expired luck

expired 운의 관계 signal:

```text
currentlyEffective = false
```

로 유지.

현재 chapter에 active signal로 조립하지 않는다.

---

# 33. history

과거 signal은 이력에 남을 수 있다.

그러나:

```text
그때 연애했다
그때 헤어졌다
```

라는 실제 사건을 생성하지 않는다.

---

# 34. deterministic ID

OutcomeFact ID는 동일 입력에서 안정적이어야 한다.

권장 의미:

```text
relationship:<semanticType>:<scope>:<source-id>
```

랜덤 UUID를 semantic identity로 쓰지 않는다.

---

# 35. Provenance

모든 Relationship OutcomeFact에
실제 upstream provenance가 있어야 한다.

최소 하나:

```text
sourceRelationIds
sourceJudgmentIds
sourceRoleIds
sourceLuckEffectIds
```

---

# 36. orphan provenance

존재하지 않는 upstream ID:

```text
0
```

이어야 한다.

---

# 37. Reading Assembly 연결

P4-B/C의 Assembly Core를 변경하지 않고
승인된 OutcomeFact를 input으로 연결한다.

가능하면:

```text
OutcomeFact
→ ReadingSemanticUnit
```

변환 adapter를 둔다.

---

# 38. CH-06

이번 Batch 결과는 CH-06을 전부 READY로 만들지 않는다.

관계 장 내부의:

```text
관계 자리
접점 signal
변화 signal
```

subset만 available로 표시한다.

Expected:

```text
CH-06 = PARTIAL
```

---

# 39. CH-09 / CH-10

세운·월운에 관계 contact/change OutcomeFact가 존재하면
동일 OutcomeFact를 시기 장에서도 재사용할 수 있다.

새로 계산하지 않는다.

---

# 40. 동일 OutcomeFact 재사용

CH-06, CH-09, CH-10에서 같은 관계 signal이 나타날 때:

```text
same OutcomeFact ID
same provenance
same certainty
```

를 유지한다.

B-6 repetition role만 다르게 조립한다.

---

# 41. Free scope

무료 결과에서는 운 기반 relationship signal을 노출하지 않는다.

P4-C의 free scope 계약 유지.

---

# 42. Premium

Premium이라고 관계 signal 방향이 달라지지 않는다.

더 많은 timing/context만 허용.

---

# 43. Compatibility 금지

다음 코드/타입을 이번 Batch에서 만들지 않는다.

```text
CompatibilityFact
CompatibilityScore
PartnerMatch
PairChart
```

---

# 44. 관계 점수 금지

```text
relationship score
marriage probability
compatibility percentage
```

0.

---

# 45. 좋음/나쁨 총평 금지

이번 Batch에서:

```text
관계운 좋음
관계운 나쁨
```

총합 판정 생성 금지.

접점/변화 signal만.

---

# 46. renderer 미구현

이번 P4-E는 semantic engine이다.

한국어/일본어/영어 고객 문장을 만들지 않는다.

---

# 47. locale independence

OutcomeFact 내부에:

```text
textKo
textJa
textEn
```

0.

---

# 48. Application code 변경 범위

허용:

```text
src/lib/outcome/
src/lib/reading/  // 최소 adapter만 필요할 경우
```

금지:

```text
src/lib/judgment/ semantic 변경
src/lib/personality/ semantic 변경
```

---

# 49. Judgment 회귀

기존 Judgment 결과를 바꾸지 않는다.

```text
35/35 PASS
```

유지.

---

# 50. Personality 회귀

```text
P2-A~G PASS
P3-A~F PASS
```

유지.

---

# 51. Reading 회귀

```text
P4-B PASS
P4-C PASS
```

유지.

---

# 52. 신규 테스트

권장:

```text
scripts/verify-relationship-outcome-p4e.mjs
```

---

# 53. 테스트 A — Natal palace

원국 일지가 존재하는 정상 fixture.

Expected:

```text
relationship palace context fact = 존재
real spouse event = 0
```

---

# 54. 테스트 B — Natal relation

일지에 승인된 branch relation이 있는 fixture.

Expected:

```text
approved relationship structural signal
```

만 생성.

좋음/결혼 Outcome 0.

---

# 55. 테스트 C — Luck contact

운에서 관계 자리에 승인된 접점 signal이 발생.

Expected:

```text
relationship_contact_signal
scope correct
provenance correct
```

---

# 56. 테스트 D — Luck change

운에서 관계 자리 변화 signal 발생.

Expected:

```text
relationship_change_signal
```

실제 관계 사건 생성 0.

---

# 57. 테스트 E — Clash

충 fixture.

Expected:

```text
change/pressure signal
```

승인 범위에서만.

Expected 0:

```text
breakup
divorce
relationship failure
```

---

# 58. 테스트 F — Harmony

합 fixture.

Expected 0:

```text
perfect match
marriage
good relationship
```

---

# 59. 테스트 G — Expired

이전 relationship signal이 만료.

Expected:

```text
currentlyEffective = false
current active Reading unit = 0
history preserved
```

---

# 60. 테스트 H — stopped

upstream source가 stopped/inactive.

Expected current active OutcomeFact = 0 또는 현행 type상 inactive.

---

# 61. 테스트 I — Free

Free Reading에서 운 기반 relationship Outcome 노출 0.

---

# 62. 테스트 J — CH-06 readiness

Batch 1 구현 후에도:

```text
CH-06 = PARTIAL
```

Expected.

전체 관계 장 READY로 승격 금지.

---

# 63. 테스트 K — No ranking

Expected 0:

```text
relationship score
best month
marriage probability
```

---

# 64. 테스트 L — Pair input 없음

두 번째 사람의 chart를 요구하지 않는다.

이번 기능은 개인 Relationship Outcome이다.

---

# 65. 검증 항목

최소:

```text
duplicate OutcomeFact ID = 0
orphan provenance = 0
scope mismatch = 0
expired active leakage = 0
locale text = 0
unsupported event prediction = 0
compatibility logic = 0
numeric ranking = 0
```

---

# 66. 기존 gap 보존

구현 후에도 다음을 유지한다.

```text
relationship favorable-development timing = deferred
commitment timing = deferred
compatibility = not implemented
```

---

# 67. Money / Health / Work 변경 금지

이번 Batch는 Relationship만.

```text
Work files changed = 0
Money rules changed = 0
Health rules changed = 0
```

---

# 68. Health source contract 보존

방금 완료한:

```text
HEALTH_OUTCOME_SPEC_READY
```

를 구현 과정에서 변경하지 않는다.

---

# 69. Selection Layer 변경 금지

Top-3 selection은 계속 별도.

---

# 70. 결과 파일

```text
src/docs/codex/
p4e-relationship-outcome-batch1-result.md
```

---

# 71. 최종 판정

다음 중 하나:

```text
READY_FOR_RELATIONSHIP_OUTCOME_AUDIT
```

또는:

```text
P4E_FIX_REQUIRED
```

---

# 72. 결과 보고 — Architecture

```text
Outcome engine count:
Relationship specific Judgment recalculation:
Pair/Compatibility engine:
locale-specific outcome:
LLM:
```

Expected:

```text
1 common outcome layer
0
0
0
0
```

---

# 73. 결과 보고 — Coverage

```text
relationship palace:
natal relation signal:
luck contact signal:
luck change signal:

commitment timing:
favorable relationship timing:
compatibility:
```

Expected:

```text
first four = supported 범위
last three = not implemented / deferred
```

---

# 74. 결과 보고 — Safety

```text
marriage prediction:
divorce prediction:
affair prediction:
fated partner:
partner quality:
compatibility score:
relationship probability:
```

Expected 모두 0.

---

# 75. 결과 보고 — Provenance

```text
OutcomeFacts:
with provenance:
orphan:
duplicate ID:
scope mismatch:
```

---

# 76. 결과 보고 — Lifecycle

```text
active:
reduced:
stopped:
expired:
history:
```

상태별 검증 결과.

---

# 77. 결과 보고 — Assembly

```text
CH-06:
CH-09:
CH-10:
same OutcomeFact reuse:
B-6 duplicate conclusion:
free scope leakage:
```

---

# 78. 결과 보고 — Regression

```text
Judgment:
P2-A~G:
P3-A~F:
P4-B:
P4-C:
P4-E:
tsc:
build:
```

---

# 79. 종료 조건

다음을 모두 충족하면:

```text
READY_FOR_RELATIONSHIP_OUTCOME_AUDIT
```

판정한다.

```text
[ ] 기존 관계 source contract만 구현
[ ] 관계 자리 semantic 지원
[ ] 승인된 contact signal 지원
[ ] 승인된 change signal 지원
[ ] Natal/Luck scope 보존
[ ] provenance 완전
[ ] stable deterministic ID
[ ] stopped/expired lifecycle 보존
[ ] CH-06 PARTIAL 유지
[ ] CH-09/10 동일 OutcomeFact 재사용 가능
[ ] 무료 시기 누출 0
[ ] 결혼 예측 0
[ ] 이혼 예측 0
[ ] 외도 예측 0
[ ] 관계 품질 자동 판정 0
[ ] 궁합 로직 0
[ ] score/rank 0
[ ] Judgment 재계산 0
[ ] Personality 의미 변경 0
[ ] Health/Work/Money 변경 0
[ ] Selection Layer 변경 0
[ ] 기존 회귀 PASS
[ ] TypeScript/build PASS
```

---

# 80. 다음 단계

P4-E Batch 1이 통과하면 먼저:

```text
P4-F Relationship Outcome Integration Audit
```

로 실제 Judgment/Luck → OutcomeFact → ReadingAssembly 경로를 검증한다.

그 뒤 P4-D에서 승인된 다른 subset:

```text
Money
Health
```

중 source readiness와 implementation dependency를 비교해 다음 Batch를 정한다.

Relationship의 commitment/favorable-development timing은
Batch 1에 억지로 포함하지 않는다.

그리고 궁합은 여전히:

```text
Individual Reading 완료
↓
Compatibility Source Audit
↓
Pairwise Compatibility Engine
```

별도 후속 트랙으로 유지한다.