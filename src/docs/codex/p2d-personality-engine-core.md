# FILUNE Codex P2-D
## Personality Engine 원국 코어 구현

P2 Personality Knowledge Layer 구축과 통합감사가 완료되었다.

현재 상태:

```text
DayStemProfile       10/10
TenGodProfile        10/10
PositionRules         6/6
DayPillarProfile     60/60

P2-A PASS
P2-B PASS
P2-C PASS

MISSING_EXTRACTION   0
UNSUPPORTED_TRAIT    0
FAIL                 0
```

이번 단계부터 처음으로 Personality 계산 엔진을 구현한다.

단 이번 P2-D의 범위는 **원국 Natal Personality Core**까지만이다.

---

# 1. 기준 문서

최우선:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

Knowledge Registry:

```text
src/lib/personality/knowledge/dayStemProfiles.ts
src/lib/personality/knowledge/tenGodProfiles.ts
src/lib/personality/knowledge/positionRules.ts
src/lib/personality/knowledge/dayPillarProfiles.ts
```

기존 canonical 계산:

```text
HeavenlyStem
EarthlyBranch
TenGod
HiddenStem
DayPillar
```

관련 기존 계산 코드를 재사용한다.

---

# 2. 절대 경계

Personality Engine은 Structural Judgment Engine과 분리한다.

허용:

```text
Judgment / canonical chart
→ Personality Engine
```

금지:

```text
Personality Engine
→ Judgment 결과 변경
```

`src/lib/judgment/`에서 personality module을 import하지 않는다.

---

# 3. 이번 구현 범위

이번 P2-D에서 구현:

```text
PersonalityFact
Natal TenGod occurrence extraction
PositionExpression
TenGodProminence evidence
TenGodProminence qualitative resolution
DayStem base
DayPillarModifier
PersonalityConflict
NatalPersonalityResult
```

---

# 4. 이번 단계에서 구현하지 않는 것

```text
StructuralRoleModifier
YongShen personality modifier
SangShen personality modifier
Byeong personality modifier
GuEung personality modifier

Daewoon personality
Sewoon personality
Month personality
Day luck personality

CurrentPersonalityResult

customer renderer
text generation
personality score
probability
percentage
ranking score
```

---

# 5. Personality Engine의 기본 원칙

Personality는 다음을 합성한다.

```text
DayStem base
+
Natal TenGod traits
+
Position Expression
+
MonthBranch nature
+
DayBranch / HourBranch internal judgment
+
DayPillar Modifier
+
conflicts / coexistence
```

이번 단계에서는 StructuralRole과 Luck을 제외한다.

---

# 6. PersonalityFact

최소 다음 구조를 둔다.

```ts
interface PersonalityFact {
  id: string;

  sourceType:
    | "day_stem"
    | "ten_god"
    | "day_pillar"
    | "position";

  trait: string;

  traitType:
    | "core"
    | "strength"
    | "shadow"
    | "decision"
    | "social"
    | "inner"
    | "interpersonal"
    | "work"
    | "stress"
    | "growth"
    | "internal_conflict"
    | "expression";

  sourcePosition?:
    | "year_stem"
    | "month_stem"
    | "day_stem"
    | "hour_stem"
    | "year_branch"
    | "month_branch"
    | "day_branch"
    | "hour_branch";

  tenGod?: TenGod;
  dayPillar?: DayPillar;

  provenanceIds: string[];

  status:
    | "active"
    | "contextual"
    | "deferred";
}
```

프로젝트 기존 타입에 맞춰 조정 가능하다.

---

# 7. DayStem base

일간은 Personality의 기본 기질이다.

```text
DayStemProfile
→ NatalPersonality의 base layer
```

일간 자체를 TenGod으로 취급하지 않는다.

---

# 8. DayStem trait의 역할

DayStemProfile의:

```text
coreNature
coreDrive
strengths
shadowTraits
decisionStyle
socialExpression
innerExpression
stressResponse
growthDirection
```

중 실제 존재하는 항목만 PersonalityFact로 변환한다.

빈 배열은 정상이다.

---

# 9. 빈 field 처리

Knowledge Layer의:

```text
[]
source_gap
```

을 오류로 취급하지 않는다.

빈 필드에서 성격을 추론해서 만들지 않는다.

---

# 10. Natal TenGod occurrence

원국 네 기둥에서 실제 TenGod occurrence를 수집한다.

일간 자체는 제외한다.

최소 대상:

```text
year stem
month stem
hour stem

year branch hidden stems
month branch hidden stems
day branch hidden stems
hour branch hidden stems
```

day stem은 self이므로 TenGod occurrence가 아니다.

---

# 11. 시각 모름

출생시각이 없으면:

```text
hour stem
hour branch
hour hidden stems
```

을 PersonalityFact 근거로 사용하지 않는다.

없는 시주를 추정하지 않는다.

---

# 12. Stem / Branch 표현 분리

원자료 기준:

```text
천간
→ 사회적으로 빨리 드러나는 성격
→ 외부 표현

지지
→ 숨겨진 / 내재된 판단기제
→ 가까운 관계나 내부 반응
```

Personality Engine에서 반드시 구분한다.

---

# 13. Stem TenGod

천간 TenGod의 trait는 우선:

```text
socialExpression
ordinaryExpression
productiveExpression
```

등 외부 발현 후보로 연결한다.

단 단순히 모든 TenGod trait를 social로 재분류하지 않는다.

Knowledge Registry의 traitType과 PositionRule을 함께 사용한다.

---

# 14. Branch TenGod

지지 TenGod은 우선:

```text
innerExpression
decisionStyle
internal response
```

측면으로 표현한다.

단 해당 TenGod의 모든 trait를 무조건 inner로 바꾸지 않는다.

---

# 15. MonthBranch

월지는 source 기준:

```text
타고난 본성
```

의 중요 위치다.

따라서 월지 TenGod / branch 관련 PersonalityFact에는:

```text
positionContext = innate_nature
```

또는 동등한 context를 기록한다.

---

# 16. 월지 = 전체 성격 금지

금지:

```text
MonthBranch trait
→ 전체 PersonalityResult 덮어쓰기
```

월지는 중요한 context일 뿐 다른 PersonalityFact를 삭제하지 않는다.

---

# 17. DayBranch

일지는:

```text
내부 판단 기준
개인적 반응
생활 속 결정 기준
```

으로 사용한다.

배우자궁 해석은 Personality Engine에 넣지 않는다.

---

# 18. HourBranch

시지는:

```text
개인적 욕구
장기적 판단
내부 기준
```

에 사용한다.

시각 모름이면 제외.

---

# 19. YearBranch

년지는 P2-A에서 정한 대로:

```text
보조적 지지 context
```

로만 사용한다.

년지 고유 독립 성격규칙을 새로 만들지 않는다.

---

# 20. Hidden Stem

지장간 TenGod은 Personality evidence로 사용할 수 있다.

단:

```text
본기
중기
여기
```

를 임의 숫자 weight로 변환하지 않는다.

---

# 21. Hidden Stem의 위치 context

지장간은 해당 지지가 속한 position context를 상속한다.

예:

```text
month branch hidden stem
→ month branch innate context

day branch hidden stem
→ day branch internal-decision context
```

---

# 22. TenGodProminence

정성 등급:

```ts
type TenGodProminence =
  | "low"
  | "present"
  | "prominent"
  | "very_prominent";
```

---

# 23. Prominence와 과다를 분리

절대:

```text
very_prominent = excessive
```

로 처리하지 않는다.

둘은 다른 축이다.

```text
Prominence
= 명식에서 얼마나 분명하게 드러나는가

ExcessiveExpression
= 그 십성의 과도 발현 조건
```

---

# 24. Prominence evidence

다음은 evidence가 될 수 있다.

```text
stem manifestation
month position
root/support
formation reinforcement
repetition
runtime availability
actual structural function
```

단 이번 P2-D에서는 **원국 Natal 기준으로 사용 가능한 confirmed evidence만 사용**한다.

---

# 25. 숫자 score 금지

금지:

```text
stem = +3
month = +5
root = +2
repeat = +1
total >= 8
```

또는 동등한 numeric threshold.

---

# 26. Prominence resolver

`11-personality-master.md` 또는 `12-personality-knowledge-schema.md`에
Prominence 등급의 deterministic 조건이 명확하게 정의되어 있다면 **그 조건만 구현한다.**

문서에 정확한 경계가 없다면 Codex가 새로운 threshold를 만들지 않는다.

그 경우:

```text
evidence collection
```

까지 구현하고,

불명확 등급은:

```text
present
```

또는 임의 등급으로 강제하지 말고:

```text
deferred
```

가능한 별도 resolution state로 처리한다.

필요하다면 타입:

```ts
type ProminenceResolution =
  | { status: "confirmed"; level: TenGodProminence }
  | { status: "deferred"; evidence: ProminenceEvidence[] };
```

를 사용한다.

---

# 27. presence와 prominence 분리

실제 occurrence가 하나라도 확인되면:

```text
presence = present
```

라는 Fact는 만들 수 있다.

그러나:

```text
prominent
very_prominent
```

판정은 별도 근거가 있어야 한다.

---

# 28. TenGodProminenceEvidence

권장:

```ts
interface TenGodProminenceEvidence {
  tenGod: TenGod;

  type:
    | "stem_manifested"
    | "month_branch"
    | "rooted"
    | "formation_supported"
    | "repeated"
    | "runtime_active"
    | "structurally_operating";

  sourceIds: string[];
}
```

---

# 29. structural evidence 주의

이번 P2-D에서 Structural Judgment 결과를 읽을 수는 있다.

그러나 이번 단계에서는:

```text
YongShen
SangShen
Byeong
GuEung
```

에 따른 **성격 방향 보정은 하지 않는다.**

Prominence에 필요한 사실 확인 정도만 문서가 명시적으로 허용할 경우 사용한다.

---

# 30. 반복 occurrence

같은 TenGod이 여러 위치에 존재하면:

```text
repetition evidence
```

를 생성한다.

그러나 개수 자체를 Personality score로 사용하지 않는다.

---

# 31. TenGod Profile 적용

TenGod occurrence가 확인되면 해당:

```text
TenGodProfile
```

을 참조하여 PersonalityFact 후보를 만든다.

---

# 32. 모든 TenGod trait 무조건 출력 금지

TenGod 하나가 존재한다고:

```text
coreStrengths
ordinaryExpression
productiveExpression
excessiveExpression
deficientExpression
...
```

전체를 동시에 active로 만들지 않는다.

---

# 33. 기본 발현

일반 presence에서는 우선:

```text
coreDrive
ordinaryExpression
```

중 source-supported base trait를 사용한다.

---

# 34. productiveExpression

`productiveExpression`은:

```text
십성이 존재함
```

만으로 무조건 확정하지 않는다.

현재 구조/위치에서 생산적인 발현 근거가 있을 때만 active.

근거가 부족하면:

```text
contextual
```

로 둘 수 있다.

---

# 35. excessiveExpression

금지:

```text
TenGod repeated
→ excessive
```

자동 판정.

과다 판정은 별도 confirmed evidence가 필요하다.

---

# 36. deficientExpression

금지:

```text
원국에 TenGod 없음
→ deficientExpression 전부 활성화
```

원자료 자체에서 “없거나 너무 많은 십신을 확인하지 않는다”는
성격 분석 주의가 존재하므로,
**absence만으로 결핍 성격을 자동 단정하지 않는다.**

---

# 37. absence 처리

십성이 없으면:

```text
TenGodOccurrence = absent
```

는 기록 가능.

하지만:

```text
deficient personality traits
```

는 이번 P2-D에서 자동 활성화하지 않는다.

문서에 명시적인 확정 조건이 있을 때만 적용.

---

# 38. DayPillarModifier

현재 일주에 해당하는:

```text
DayPillarProfile
```

을 하나 읽는다.

---

# 39. DayPillar는 modifier

DayPillarProfile은:

```text
base personality replacement
```

가 아니다.

반드시:

```text
DayStem / TenGod base
+
DayPillar modifier
```

형태로 적용한다.

---

# 40. DayPillar 중복 금지

P2-B에서 제거한 DayStem 공통 내용을 Personality Engine이 다시 복사하지 않는다.

DayPillarProfile에 실제 등록된 trait만 사용한다.

---

# 41. DayPillar 적용 대상

다음이 존재하면 PersonalityFact로 연결:

```text
corePersonality
decisionStyle
interpersonalStyle
strengths
shadowPatterns
internalConflict
expressionPattern
growthDirection
```

---

# 42. DayPillar excludedClaims

```text
excludedClaims
```

는 PersonalityResult에 절대 사용하지 않는다.

배우자·재물·직업·건강·궁합 예측을 재활성화하지 않는다.

---

# 43. PersonalityConflict

상반된 PersonalityFact를 삭제하지 않는다.

최소 구조:

```ts
interface PersonalityConflict {
  id: string;

  factIds: string[];

  conflictType:
    | "outward_vs_inner"
    | "fast_vs_cautious"
    | "independent_vs_relational"
    | "stable_vs_change"
    | "direct_vs_indirect"
    | "source_explicit"
    | "other";

  resolution:
    | "coexist"
    | "context_split"
    | "deferred";

  explanationEvidence: string[];
}
```

---

# 44. conflict를 길흉으로 해결 금지

금지:

```text
좋은 성향이 나쁜 성향을 이긴다
```

Personality는 상반된 특성이 공존할 수 있다.

---

# 45. outward_vs_inner

대표적인 허용 구조:

```text
Stem
→ outward/social

Branch
→ inner/judgment
```

이 둘이 상반되면:

```text
context_split
```

로 보존 가능.

---

# 46. DayPillar explicit conflict

DayPillarProfile의:

```text
internalConflict
```

가 source explicit이면 높은 우선의 Conflict Fact로 보존한다.

단 다른 trait를 삭제하지 않는다.

---

# 47. 동일 trait 중복 제거

여러 source에서 같은 의미 trait가 나오면:

```text
PersonalityFact 1개
+
provenanceIds 여러 개
```

로 통합 가능.

---

# 48. 다른 맥락이면 통합 금지

예:

```text
천간 正官의 규칙성
월지 正官의 내재 규칙성
```

은 맥락이 다르면 별도 Fact로 유지한다.

---

# 49. NatalPersonalityResult

최소:

```ts
interface NatalPersonalityResult {
  dayStem: HeavenlyStem;
  dayPillar: DayPillar;

  facts: PersonalityFact[];

  tenGodStates: TenGodPersonalityState[];

  positionExpressions: PositionExpression[];

  dayPillarModifier: DayPillarPersonalityModifier;

  conflicts: PersonalityConflict[];

  summaryDimensions: PersonalityDimensionSummary[];

  provenanceIds: string[];
}
```

---

# 50. TenGodPersonalityState

권장:

```ts
interface TenGodPersonalityState {
  tenGod: TenGod;

  occurrence:
    | "absent"
    | "present";

  occurrenceIds: string[];

  prominence: ProminenceResolution;

  activeTraitFactIds: string[];
}
```

---

# 51. summaryDimensions

이번 단계에서는 고객 문장을 만들지 않는다.

대신 내부 구조화 summary만 가능.

예:

```text
outwardExpression
innerDecision
workStyle
interpersonal
stressPattern
strengths
shadowPatterns
```

---

# 52. summaryDimension도 score 금지

금지:

```text
outward = 80
independence = 70
```

대신:

```text
confirmedFacts[]
conflictingFacts[]
```

형태를 사용한다.

---

# 53. trait priority 숫자화 금지

금지:

```text
DayStem weight 30
MonthBranch weight 50
DayPillar weight 20
```

---

# 54. 해석 우선순위와 삭제 우선순위 구분

월지가 중요하다고 해서 다른 trait를 제거하지 않는다.

중요도는:

```text
context / prominence evidence
```

로 표현하고,
상반 trait는 conflict에 남긴다.

---

# 55. PositionExpression

최소 구조:

```ts
interface PositionExpression {
  position: PersonalityPosition;
  expressionMode:
    | "outward"
    | "innate"
    | "inner"
    | "decision"
    | "private"
    | "supporting_context";

  factIds: string[];
}
```

---

# 56. 천간 위치

```text
yearStem
monthStem
hourStem
```

은 외부/social expression layer.

dayStem은 base self이며 TenGod position occurrence로 취급하지 않는다.

---

# 57. 월지

```text
monthBranch
→ innate
```

---

# 58. 일지

```text
dayBranch
→ inner / decision
```

---

# 59. 시지

```text
hourBranch
→ private / long-term judgment
```

---

# 60. 년지

```text
yearBranch
→ supporting_context
```

---

# 61. 출처 provenance

모든 PersonalityFact는 최소:

```text
knowledge profile id
```

를 추적할 수 있어야 한다.

가능하면:

```text
sourceRef
```

까지 연결 가능하게 한다.

---

# 62. source_gap propagation 금지

Knowledge의 source_gap 자체를 PersonalityFact로 출력하지 않는다.

단 debug metadata에는 보존 가능.

---

# 63. SOURCE_CONFLICT propagation

현재 알려진:

```text
戊午 source conflict
```

은 debug/audit metadata로 보존 가능.

그러나 Personality trait로 출력하지 않는다.

---

# 64. canonical 우선

戊午의:

```text
dayBranchTenGod = 正印
```

을 사용한다.

원자료 오표기 `偏財`를 계산에 사용하지 않는다.

---

# 65. deterministic result

동일 Natal input에 대해:

```text
facts
tenGodStates
positionExpressions
conflicts
```

순서와 ID가 안정적이어야 한다.

---

# 66. 배열 순서 의존 금지

Knowledge Registry 파일 순서를 바꾸더라도 의미 결과가 달라지지 않아야 한다.

---

# 67. stable sorting

결과 정렬 기준을 명시적으로 둔다.

예:

```text
position order
→ TenGod canonical order
→ trait type
→ stable id
```

숫자 길흉 우선순위가 아니다.

---

# 68. 권장 파일 구조

```text
src/lib/personality/
├─ types.ts
├─ knowledge/
│  └─ ...
├─ facts/
│  ├─ extractPersonalityFacts.ts
│  └─ natalTenGodOccurrences.ts
├─ prominence/
│  ├─ collectProminenceEvidence.ts
│  └─ resolveProminence.ts
├─ position/
│  └─ applyPositionExpression.ts
├─ modifiers/
│  └─ applyDayPillarModifier.ts
├─ conflicts/
│  └─ resolvePersonalityConflicts.ts
├─ natalPersonality.ts
└─ index.ts
```

기존 구조에 맞춰 조정 가능.

---

# 69. public entry point

권장:

```ts
buildNatalPersonality(input)
```

또는 프로젝트 naming 규칙에 맞는 동등 함수.

---

# 70. 입력

가능하면 이미 계산된 canonical chart를 입력으로 받는다.

생년월일을 Personality Engine 내부에서 다시 계산하지 않는다.

---

# 71. calculation duplication 금지

금지:

```text
Personality Engine 내부에서
TenGod 계산식 새 구현
HiddenStem table 새 구현
DayPillar 계산 새 구현
```

기존 canonical 함수 재사용.

---

# 72. P2-D regression fixture

최소 여러 유형을 만든다.

필수 케이스:

```text
A. 천간 TenGod이 분명히 드러난 명식
B. 월지 TenGod이 강한 본성 context인 명식
C. 천간과 지지 성향이 상반되는 명식
D. DayPillar internalConflict가 있는 명식
E. 동일 TenGod 반복 명식
F. 시각 모름 명식
G. source_gap이 많은 Profile
H. 戊午
```

---

# 73. 테스트 A — Stem outward

천간에 특정 TenGod 존재.

Expected:

```text
TenGod occurrence present
outward PositionExpression 생성
```

---

# 74. 테스트 B — Month innate

월지 TenGod 존재.

Expected:

```text
innate context 생성
```

다른 PersonalityFact 삭제 없음.

---

# 75. 테스트 C — outward / inner conflict

천간 trait와 일지/월지 trait가 source상 상반.

Expected:

```text
두 Fact 모두 유지
PersonalityConflict 생성
```

---

# 76. 테스트 D — DayPillar modifier

DayPillarProfile에 고유 Personality modifier 존재.

Expected:

```text
DayStem base 유지
DayPillar modifier 추가
```

base overwrite 금지.

---

# 77. 테스트 E — repeated TenGod

동일 TenGod 반복.

Expected:

```text
repetition evidence 생성
```

숫자 score 없음.

과다 자동 판정 없음.

---

# 78. 테스트 F — unknown hour

시각 모름.

Expected:

```text
hour PersonalityFact = 0
```

다른 위치 정상 계산.

---

# 79. 테스트 G — source gap

Knowledge field가 비어 있음.

Expected:

```text
no crash
no invented trait
```

---

# 80. 테스트 H — 戊午

Expected:

```text
dayBranchTenGod = 正印
偏財 기반 PersonalityFact = 0
```

---

# 81. deficient 자동 활성 금지 테스트

특정 TenGod이 없는 명식.

Expected:

```text
occurrence = absent
```

그러나:

```text
deficientExpression active = 0
```

이번 단계 기준.

---

# 82. excessive 자동 활성 금지 테스트

특정 TenGod이 반복.

Expected:

```text
repetition evidence
```

그러나:

```text
excessiveExpression automatic = 0
```

---

# 83. no scoring 검사

`src/lib/personality/` 전체에서 다음 패턴 검사:

```text
score
weight
percent
probability
points
threshold
```

단 타입명/외부 라이브러리 등 false positive는 설명.

성격 강도 산술 scoring이 있으면 FAIL.

---

# 84. reverse dependency 검사

```text
src/lib/judgment/
```

이:

```text
src/lib/personality/
```

를 import하면 FAIL.

---

# 85. 기존 Knowledge 검증 재실행

반드시:

```text
node scripts/verify-personality-knowledge-p2a.mjs
node scripts/verify-personality-knowledge-p2b.mjs
node scripts/verify-personality-knowledge-integration-p2c.mjs
```

PASS.

---

# 86. 신규 검증

권장:

```text
scripts/verify-personality-engine-p2d.mjs
```

---

# 87. 신규 검증 최소 조건

```text
Natal Personality deterministic
unknown hour safe
source gap safe
no deficient auto activation
no excessive auto activation
DayPillar modifier additive
outward/inner conflict coexistence
戊午 canonical mapping
no numeric scoring
no reverse judgment dependency
```

---

# 88. TypeScript / build

```text
npx tsc -b
npm run build
```

PASS.

---

# 89. 기존 Judgment 회귀

원칙적으로 Judgment source를 수정하지 않는다.

공용 canonical 타입 또는 함수 변경이 있었다면 기존 Judgment 회귀 전체를 실행한다.

---

# 90. P2-D 결과 파일

다음에 기록:

```text
src/docs/codex/p2d-personality-engine-core-result.md
```

---

# 91. 최종 보고

## A. 전체 판정

```text
READY_FOR_PERSONALITY_ROLE_MODIFIER
```

또는:

```text
P2D_FIX_REQUIRED
```

---

## B. 구현

| 영역 | 파일/함수 | 상태 |
|---|---|---|
| PersonalityFact | | |
| TenGod occurrence | | |
| Prominence evidence | | |
| Prominence resolver | | |
| PositionExpression | | |
| DayPillarModifier | | |
| PersonalityConflict | | |
| NatalPersonalityResult | | |

---

## C. Prominence 계약

반드시 별도 보고:

```text
master에 deterministic prominence 조건 존재 여부:
구현한 confirmed 조건:
deferred 조건:
numeric scoring 사용 여부:
```

문서에 없는 기준을 새로 만들었으면 FAIL.

---

## D. Regression

```text
P2-A:
P2-B:
P2-C:
P2-D:
tsc:
build:
```

---

## E. 구조 격리

```text
Judgment source changes:
Judgment → Personality dependency:
Personality → Judgment reverse dependency:
```

---

## F. 남은 항목

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
```

---

# 92. P2-D 종료 조건

다음이 충족되면:

```text
READY_FOR_PERSONALITY_ROLE_MODIFIER
```

판정.

```text
[ ] Natal PersonalityResult 생성
[ ] DayStem base 적용
[ ] TenGod occurrence 추출
[ ] PositionExpression 적용
[ ] DayPillarModifier additive 적용
[ ] conflicts coexistence 구현
[ ] source gap safe
[ ] absent → deficient 자동판정 없음
[ ] repeated → excessive 자동판정 없음
[ ] numeric scoring 없음
[ ] judgment reverse dependency 없음
[ ] 戊午 canonical 유지
[ ] P2-A/B/C PASS
[ ] P2-D PASS
[ ] tsc PASS
[ ] build PASS
```

---

# 93. 다음 단계

이번 단계가 통과해도 자동으로 운 성격까지 구현하지 않는다.

다음은 별도 단계:

```text
P2-E
StructuralRoleModifier
```

즉 원국에서:

```text
YongShen
SangShen
Byeong
GuEung
ActualStructuralFunction
```

이 기본 성격 발현 방향을 어떻게 조정하는지만 먼저 연결한다.

그 후 별도로:

```text
P2-F
NatalPersonality
vs
CurrentPersonalityExpression
```

을 구현한다.