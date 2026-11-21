# FILUNE Compatibility-01
## Cross-chart Fact Engine

현재 상태:

```text
COMPATIBILITY_BLOCKERS_CLASSIFIED
```

Compatibility-00 이후 사용자 승인 정책:

```text
C-01 YES
개인 Judgment A/B는 절대 변경하지 않는다.

C-02 YES
두 사람 사이 천간 生·剋·合은
기존 FILUNE 작용 원리를 Compatibility Runtime 안에서 재사용한다.

- valid combine → 해당 Compatibility Context에서 기능 stop
- control → 해당 Compatibility Context에서 기능 weaken
- good/bad는 역할과 실제 구조 기능으로 판정

개인 natal/runtime state는 변경하지 않는다.

C-03 YES
상대가 제공하는 뿌리는 개인 RootState를 변경하지 않는다.

CrossRootSupportFact로 별도 기록한다.

필요한 기능의 뿌리 지원 → 도움 후보
해로운 기능/Byeong path의 뿌리 지원 → 문제 활성화 후보

root support = always favorable 금지.

C-04 YES
숫자 점수 없이 확실한 결과를 낸다.

A→B / B→A를 별도 보존하고,
좋은 작용과 나쁜 작용을 동시에 보존한다.

최종 단계에서는 기존 FILUNE qualitative 판정 체계:
유리 / 유리 우세 / 영향 작음 / 불리 우세 / 불리
및 유불리 공존 원칙을 재사용할 수 있다.

단 Compatibility-01에서는 최종 verdict를 아직 만들지 않는다.
```

---

# 1. Authority 우선순위

이번 작업의 최상위 authority:

```text
1. 현재 src/docs/rules/master/
2. 현재 FILUNE 승인 정책
3. 현재 authority mapping
4. 전문가 원자료
5. historical / superseded 문서
```

이미 FILUNE에서 해결된 규칙을 다시 열지 않는다.

---

# 2. 이번 단계 목표

이번 단계는 **두 명식 사이에서 새로 발생하는 Fact만 계산**한다.

구현:

```text
Person A Chart + Judgment
Person B Chart + Judgment
        ↓
Cross-chart Fact Engine
        ↓
CrossStemInteractionFact[]
CrossBranchInteractionFact[]
CrossRootSupportFact[]
CrossRoleInteractionFact[]
```

이번 단계에서는 만들지 않는다.

```text
Compatibility overall verdict
고객용 궁합 문장
궁합 점수
결혼 시기
관계 유지 시기
다국어 renderer
```

---

# 3. 개인 엔진 불변

절대 조건:

```text
Judgment A before === Judgment A after
Judgment B before === Judgment B after

Personality A mutation = 0
Personality B mutation = 0

RootState A mutation = 0
RootState B mutation = 0
```

Compatibility는 별도 simulation/context layer다.

---

# 4. 권장 코드 위치

repository convention을 확인한 뒤 기본적으로:

```text
src/lib/compatibility/
```

아래에 구현한다.

권장:

```text
src/lib/compatibility/types.ts

src/lib/compatibility/facts/
  crossStemInteractions.ts
  crossBranchInteractions.ts
  crossRootSupport.ts
  crossRoleInteractions.ts

src/lib/compatibility/buildCompatibilityFacts.ts
src/lib/compatibility/index.ts
```

실제 repository convention이 더 적절하면 그에 맞춘다.

---

# 5. Compatibility Context

최소 내부 context:

```text
Person A
Person B
```

를 명확히 식별한다.

A와 B의 사실을 하나의 chart로 합쳐서
single-chart Judgment를 다시 실행하지 않는다.

---

# 6. 방향성

모든 기능적 결과는 가능한 한:

```text
A → B
B → A
```

를 구분한다.

예:

```text
B controls A harmful function
A supports B required root
```

---

# 7. 관계 자체와 구조 효과 분리

다음 두 층을 구분한다.

```text
Cross Relation Fact
↓
Directional Structural Effect
```

예:

```text
A.甲 + B.己 = valid combine
```

이라는 관계와:

```text
A→B: B의 특정 기능 stop
B→A: A의 특정 기능 stop
```

에 따른 구조 결과를 분리한다.

---

# PART A — Cross Stem Interaction

# 8. 천간 生

현행 FILUNE 오행 관계를 그대로 사용한다.

두 사람 천간 사이에:

```text
generate
```

관계가 있으면 CrossStemInteractionFact 생성.

그러나:

```text
generate = favorable
```

자동 판정 금지.

---

# 9. 천간 剋

두 사람 천간 사이 유효 control 관계:

```text
source controls target
```

를 방향성 있게 기록한다.

Compatibility Runtime 효과:

```text
target function = weakened
```

후보.

---

# 10. control ≠ stop

현행 FILUNE 규칙 그대로:

```text
control
→ weaken

control
≠ stop
```

---

# 11. control의 유불리 미결정

예:

```text
B controls A's Byeong
```

이면 후속 policy에서 유리할 수 있고,

```text
B controls A's required SangShen
```

이면 불리할 수 있다.

따라서 Fact 자체에는 intrinsic good/bad를 넣지 않는다.

---

# 12. 천간 合

현재 FILUNE이 인정하는
유효 천간합만 계산한다.

궁합 source의 임의 합 규칙을 추가하지 않는다.

---

# 13. Cross-chart combine runtime

사용자 승인 정책에 따라:

```text
valid cross-chart stem combine
→ Compatibility Context에서 양쪽 해당 기능 stop
```

으로 모델링한다.

---

# 14. 개인 runtime은 그대로

예:

```text
A natal 甲 active
B natal 己 active
```

이고 Cross Compatibility에서 합이 성립해도:

```text
A Judgment stemRuntime.甲 = active 유지
B Judgment stemRuntime.己 = active 유지
```

Compatibility 결과에만:

```text
A.甲 compatibilityRuntime = stopped
B.己 compatibilityRuntime = stopped
```

를 기록한다.

---

# 15. Compatibility Runtime 후보

필요하면 내부적으로:

```text
active
weakened
stopped
```

를 사용한다.

이는 개인 Judgment Runtime과 별개다.

---

# 16. CrossStemInteractionFact 최소 필드

개념적으로:

```text
id
relationType
sourcePerson
sourceStem
sourcePosition

targetPerson
targetStem
targetPosition

action
compatibilityRuntimeEffect

sourceFactIds
provenance
```

실제 타입명은 repository convention에 맞춘다.

---

# 17. 모든 천간 pair 검사

A의 4천간 × B의 4천간을 검사한다.

Unknown hour가 있으면
존재하는 천간만 검사한다.

가짜 hour를 만들지 않는다.

---

# PART B — Cross Branch Interaction

# 18. Branch authority

Cross-chart 지지 relation의 canonical 계산은:

```text
src/docs/rules/master/03-branch-relations-master.md
```

만 따른다.

---

# 19. 삼합

현행 FILUNE:

```text
亥卯未
寅午戌
巳酉丑
申子辰
```

---

# 20. 반합국

두 글자만 있을 때
왕지를 포함한 경우만 반합국.

```text
亥卯 / 卯未
寅午 / 午戌
巳酉 / 酉丑
申子 / 子辰
```

---

# 21. 왕지 없는 두 글자

```text
亥未
寅戌
巳丑
申辰
```

은:

```text
relation = exists
formation = false
halfFormation = false
automatic element strengthening = false
```

---

# 22. 방합

```text
寅卯辰
巳午未
申酉戌
亥子丑
```

세 글자가 모두 있을 때만 성립.

---

# 23. 두 사람의 전체 branch pool

Compatibility에서는:

```text
A natal branches
+
B natal branches
```

에서 formation 후보를 검사할 수 있다.

단 formation의 구성원이 어느 사람에게서 왔는지 반드시 보존한다.

---

# 24. Formation provenance

예:

```text
A day branch = 卯
B year branch = 亥
B month branch = 未
```

이면 구성원을 전부 기록한다.

---

# 25. 六合

현행 FILUNE 규칙 그대로.

```text
六合
≠ elemental formation
≠ automatic strengthening
≠ full stop
```

Compatibility에서도 임의 확대 금지.

---

# 26. 沖

현행 FILUNE대로 bilateral relation으로 기록한다.

그러나:

```text
clash = bad compatibility
```

자동 판정 금지.

---

# 27. 刑 / 破 / 害

현재 Master의 Fact 규칙을 그대로 재사용한다.

Compatibility에서는 relation fact까지만 우선 생성한다.

---

# 28. 이번 단계에서 구현하지 않는 특수 relation

사용자 승인 없이 다음을 새로 구현하지 않는다.

```text
원진
귀문
격각
별도 암합 규칙
신살 궁합 점수
```

상태:

```text
DEFERRED_PENDING_POLICY
```

필요해지는 시점에 사용자에게 질문한다.

---

# 29. CrossPalace 정보

CrossBranchInteractionFact에는
가능하면 각 branch의 natal position도 보존한다.

```text
year
month
day
hour
```

그러나 위치 자체로 good/bad를 정하지 않는다.

---

# 30. 배우자궁

```text
day branch ↔ day branch
```

는 후속 Compatibility Policy에서 중요하게 사용할 수 있도록
명확히 식별한다.

Fact Engine에서는 평가하지 않는다.

---

# PART C — Cross Root Support

# 31. 원칙

상대가 내 천간 기능의 뿌리가 될 수 있는 경우:

```text
CrossRootSupportFact
```

생성.

개인 RootState는 변경하지 않는다.

---

# 32. Root authority

통근 판정은 현재:

```text
04-root-twelve-stages-master.md
```

를 따른다.

---

# 33. 지장간 root priority

현행:

```text
본기 > 중기 = 여기
```

그대로 사용.

숫자 strength score 금지.

---

# 34. 방향성

예:

```text
B branch provides root to A stem
```

과:

```text
A branch provides root to B stem
```

을 별도 Fact로 생성한다.

---

# 35. CrossRootSupportFact 후보 필드

```text
id

providerPerson
providerBranch
providerPosition
hiddenStemLevel

receiverPerson
receiverStem
receiverPosition

rootType
provenance
```

---

# 36. root support에 intrinsic good/bad 없음

Fact에는:

```text
favorable
unfavorable
```

를 직접 넣지 않는다.

후속 policy에서 receiver stem의 실제 역할을 읽는다.

---

# PART D — Cross Role Interaction

# 37. 목적

Cross-chart action이
상대의 어떤 기존 구조 기능에 닿는지를 연결한다.

새 개인 Role을 만들지 않는다.

---

# 38. 기존 RoleHistory 재사용

각 개인 Judgment에서 이미 존재하는:

```text
YongShen
SangShen
Byeong
GuEung
ConditionalByeong
ProtectiveStandby
```

등의 RoleHistory를 읽는다.

---

# 39. 상대가 Byeong에 작용

예:

```text
B stem controls A Byeong actor
B stem combines/stops A Byeong actor
```

이면:

```text
CrossRoleInteractionFact
```

후보 생성.

---

# 40. 이 단계에서 "해결 확정"까지 갈지 여부

단순 relation만으로:

```text
Byeong solved
```

를 확정하지 않는다.

기존 GuEung 계약처럼:

```text
특정 Byeong path
→ 실제 harmful action 차단
→ damaged function relief
```

가 연결되는지 확인해야 한다.

---

# 41. Cross Byeong Relief Fact

해당 path가 충분히 연결된다면:

```text
interactionType = relieves_byeong
```

을 생성할 수 있다.

반드시:

```text
targetByeongId
sourceInteractionId
```

를 가진다.

---

# 42. Cross Byeong Damage / Activation

상대가:

```text
Byeong actor의 root를 제공
harmful actor를 generate
harmful path를 활성화
```

하는 경우:

```text
activates_byeong
strengthens_harmful_path
```

후보를 구조적으로 연결한다.

---

# 43. YongShen / SangShen interaction

상대가 기존 필요한 기능을:

```text
generate
protect
root support
```

하면 후속 Compatibility Policy에서 support로 볼 수 있다.

반대로:

```text
control
combine-stop
```

하면 damage 후보.

---

# 44. Role에 따라 같은 작용의 의미가 달라짐

예:

```text
combine-stop Byeong
→ relief 후보

combine-stop SangShen
→ damage 후보
```

따라서 action 자체의 good/bad 금지.

---

# 45. Role non-exclusive

한 글자가 여러 role/function과 연결될 수 있다.

한 interaction을 단일 의미로 강제하지 않는다.

---

# PART E — Fact identity and provenance

# 46. Stable ID

동일 A/B 입력을 두 번 실행하면:

```text
same CrossStem IDs
same CrossBranch IDs
same CrossRoot IDs
same CrossRole IDs
```

이어야 한다.

---

# 47. A/B 순서 처리

API 호출 순서를 바꿔도
개별 directional 의미가 유지되어야 한다.

예:

```text
compatibility(A,B)
compatibility(B,A)
```

가 서로 다른 사람 ID를 사용하더라도
같은 실제 interaction을 잘못 중복 생성하지 않게 한다.

---

# 48. Direction identity

Fact ID에는 필요하다면:

```text
provider/actor person
receiver/target person
```

방향성을 포함한다.

---

# 49. Provenance

모든 Cross Fact는
원래 chart/Judgment의 실제 ID를 추적할 수 있어야 한다.

Expected:

```text
orphan provenance = 0
```

---

# 50. Duplicate

Expected:

```text
duplicate CrossStem IDs = 0
duplicate CrossBranch IDs = 0
duplicate CrossRoot IDs = 0
duplicate CrossRole IDs = 0
```

---

# PART F — Unknown Hour

# 51. unknown hour 지원

한쪽의 시주가 없으면:

```text
hour-dependent cross facts = unavailable
```

처리.

---

# 52. 전체 엔진 중단 금지

시간이 없다는 이유만으로:

```text
all compatibility deferred
```

금지.

존재하는 3주/기타 facts로 계산 가능한 범위는 계산한다.

---

# 53. 결측 provenance

미상 시각으로 제외된 관계는
필요하면 diagnostics에 기록한다.

가짜 시주 생성 0.

---

# PART G — Product Scope

# 54. 이번 단계는 static romantic/marriage core

Compatibility-01에서는:

```text
static natal cross-chart facts
```

까지만 구현한다.

---

# 55. Future luck 제외

이번 단계에서:

```text
A future luck
B future luck
marriage timing
breakup timing
```

을 계산하지 않는다.

---

# 56. Event Timing 연결 금지

Compatibility-01에서
Event Timing dependency를 추가하지 않는다.

---

# 57. relationship type

현재 v1은:

```text
romantic / marriage compatibility core
```

를 목표로 한다.

그러나 Fact Engine 자체는
가능한 한 relationship label에 의존하지 않는
구조적 cross facts를 만든다.

---

# PART H — Source-backed regression

# 58. source 사례 사용

Compatibility-00에서 확보한:

```text
positive
negative
mixed
directional
```

source snapshots를 사용한다.

---

# 59. source fixture는 Fact 기대값만 검증

이번 단계에서는:

```text
overall good/bad compatibility
```

를 아직 판정하지 않는다.

검증 대상:

```text
cross relation 발생
cross combine/control 발생
cross root support 발생
cross role linkage 발생
```

이다.

---

# 60. 원자료 terminology 정규화

예:

```text
source says 寅戌 반합
```

이면 expected는 현행 FILUNE 기준으로:

```text
relation exists
formation = false
```

로 작성한다.

옛 terminology를 테스트 정답으로 만들지 않는다.

---

# 61. source 기대값을 코드 출력에서 역생성 금지

먼저 source + FILUNE master에서 expected Fact를 작성한 후
코드를 실행한다.

---

# 62. Positive source case

상대가:

```text
Byeong 관련 actor를 제어/정지
필요한 root를 제공
```

하는 사례에서
해당 Cross Facts가 실제 생성되어야 한다.

---

# 63. Negative / mixed source case

상대가:

```text
harmful actor의 root 제공
harmful path generate/support
```

하는 사례도 Fact로 보존한다.

---

# 64. 좋은 Fact가 있다고 나쁜 Fact 삭제 금지

반대도 동일.

Mixed structural facts를 모두 보존한다.

---

# PART I — Contract tests

# 65. 천간 combine

최소 synthetic contract test:

```text
valid cross-chart stem combination
```

Expected:

```text
relation generated
A compatibility function stopped
B compatibility function stopped
natal Judgment unchanged
```

---

# 66. 천간 control

Expected:

```text
target compatibility function weakened
not stopped
natal Judgment unchanged
```

---

# 67. root support

필요 기능과 해로운 기능에 각각
root가 제공되는 최소 contract fixture를 둔다.

Fact Engine에서는 둘 다 root support를 생성해야 한다.

good/bad는 아직 판정하지 않는다.

---

# 68. branch 왕지 포함 반합

Cross-chart branch pool에서
왕지가 포함된 두 글자 반합국이 정확히 생성되는지 확인.

---

# 69. 왕지 없는 pair

예:

```text
寅戌
```

Expected:

```text
relation exists
half formation = 0
formation strengthening = 0
```

---

# 70. 방합

세 구성원이 실제 존재할 때만 생성.

부분 방합 0.

---

# PART J — Isolation

# 71. Judgment

Expected:

```text
Judgment semantic changes = 0
```

---

# 72. Personality

```text
Personality changes = 0
```

---

# 73. Outcome

```text
Money changes = 0
Health changes = 0
Relationship changes = 0
Event Timing changes = 0
```

---

# 74. Reading Assembly

이번 단계에서 고객 Reading 연결:

```text
0
```

---

# PART K — Forbidden shortcuts

# 75. 다음 모두 금지

```text
六合 → 좋은 궁합
三合 → 좋은 궁합
沖 → 나쁜 궁합
원진 → 나쁜 궁합

root support → 좋은 궁합

control → 나쁜 궁합
combine → 좋은 궁합

상대가 財를 살림 → 무조건 좋은 궁합
상대가 官殺을 잡음 → 무조건 좋은 궁합
```

---

# 76. 숫자 scoring

금지:

```text
compatibilityScore
weightedScore
+10
-20
percentage
```

---

# PART L — Verification

# 77. 신규 verifier

권장:

```text
scripts/verify-compatibility-cross-chart-facts-c1.mjs
```

---

# 78. 필수 검증 보고

```text
CrossStemInteractionFacts:
CrossBranchInteractionFacts:
CrossRootSupportFacts:
CrossRoleInteractionFacts:

stable IDs:
duplicate IDs:
orphan provenance:
mutation:
```

---

# 79. 필수 regression

현재 repository에서 가능한 최소:

```text
Judgment 35/35
P1 role/runtime 핵심
Branch relation regression
Root regression
Money
Health
Relationship
Event Timing Batch 1
Personality
```

기대값 변경 금지.

---

# 80. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 81. 결과 파일

생성:

```text
src/docs/codex/compatibility-01-cross-chart-fact-engine-result.md
```

---

# 82. 결과 보고 A — Fact coverage

```text
Cross stem:
Cross branch:
Cross root:
Cross role:
```

---

# 83. 결과 보고 B — Direction

```text
A→B facts:
B→A facts:
symmetric relation facts:
```

---

# 84. 결과 보고 C — source cases

```text
positive source fixture:
negative source fixture:
mixed source fixture:
directional source fixture:
```

각각 Fact-level PASS/FAIL.

---

# 85. 결과 보고 D — deferred

이번 단계에서 의도적으로 구현하지 않은 항목:

```text
원진
귀문
격각
별도 암합
future compatibility
marriage timing
overall compatibility verdict
renderer
```

실제 상태를 기록한다.

---

# 86. 최종 판정

다음을 모두 만족하면:

```text
COMPATIBILITY_CROSS_CHART_FACT_ENGINE_READY
```

조건:

```text
[ ] 개인 Judgment A/B mutation 0

[ ] Cross Stem 生/剋/合 Fact 생성
[ ] control = weaken
[ ] valid combine = compatibility stop

[ ] Cross Branch current FILUNE master 준수
[ ] 왕지 없는 pair 반합국 오판 0
[ ] 부분 방합 오판 0

[ ] CrossRootSupportFact 생성
[ ] 개인 RootState mutation 0

[ ] CrossRoleInteraction linkage
[ ] Byeong target linkage 가능
[ ] role action good/bad premature judgment 0

[ ] A→B / B→A 방향 보존
[ ] mixed facts 보존

[ ] stable IDs
[ ] duplicate 0
[ ] orphan provenance 0

[ ] unknown hour partial support

[ ] 숫자 score 0
[ ] single relation shortcut 0

[ ] Judgment/Personality/Outcome/EventTiming 의미 변경 0

[ ] regressions PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 87. 실패 시

실패하면 정확히:

```text
COMPATIBILITY_C1_FIX_REQUIRED
```

로 종료한다.

현장에서 새로운 Compatibility policy를 발명하지 않는다.

---

# 88. 다음 단계

성공 후:

```text
Compatibility-02
Structural Compatibility Policy
```

로 이동한다.

그 단계에서 처음으로:

```text
상대가 내 Byeong을 해소
상대가 필요한 기능을 보호
상대가 해로운 구조를 활성화
상대가 필요한/해로운 root를 제공
```

를 실제:

```text
유리
불리
유불리 공존
```

구조 결과로 연결한다.

그리고 **원진·귀문·격각처럼 아직 승인하지 않은 규칙이 Compatibility-02에 필요하다면 구현 전에 사용자에게 질문한다.**