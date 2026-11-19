# FILUNE Codex P3-E
## English Personality Renderer 구현

일본어 Personality Renderer 구현 및 의미·자연성 감사가 완료되었다.

현재 상태:

```text
P2-A ~ P2-G PASS

P3-A Korean Renderer PASS
P3-B Korean Semantic Audit PASS
P3-C Japanese Renderer PASS
P3-D Japanese Semantic Audit PASS

READY_FOR_EN_PERSONALITY_RENDERER

Judgment 35/35 PASS
TypeScript PASS
Build PASS
```

현재 다국어 구조:

```text
                    ┌─ KO Renderer
PersonalityResult ──┼─ JA Renderer
                    └─ EN Renderer ← 이번 구현
```

이번 단계에서는 **새 Personality Engine을 만들지 않는다.**

---

# 1. 절대 구조

Personality Engine은 언어 공통 1개다.

금지:

```text
EnglishPersonalityEngine
EnglishTenGodEngine
EnglishLuckPersonalityEngine
EnglishStructuralRoleEngine
```

---

# 2. 직접 입력

반드시:

```text
PersonalityResult
→ EN Renderer
```

이다.

금지:

```text
PersonalityResult
→ KO Renderer
→ Korean text
→ English
```

금지:

```text
PersonalityResult
→ JA Renderer
→ Japanese text
→ English
```

---

# 3. 번역이 아니라 localization

영어 Renderer는 한국어나 일본어 완성문을 번역하지 않는다.

동일 내부 의미를 영어 사용자에게 자연스럽게 다시 표현한다.

언어별 차이는:

```text
문장 구조
어순
대명사 사용
확정/조건부 표현
자연스러운 관용 표현
문장 리듬
```

에만 둔다.

판정 의미는 같아야 한다.

---

# 4. 기준 문서

Localization source:

```text
src/docs/source/localization/
FILUNE-ja-en-terminology-rendering-standard.md
```

Authority mapping:

```text
src/docs/rules/authority/mapping-localization.md
```

Personality:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

기존 Renderer:

```text
src/lib/personality/render/ko/
src/lib/personality/render/ja/
```

는 구조 참고용.

완성문 번역용이 아니다.

---

# 5. 판정 우선순위

항상:

```text
현재 authority/master
→ PersonalityResult
→ localization wording
```

순이다.

Localization 문장에 맞추기 위해 Personality 판정을 바꾸지 않는다.

---

# 6. 공통 Render Input

가능하면 기존:

```text
PersonalityRenderInput
RenderedPersonalityBlock
```

등 공통 타입을 그대로 사용한다.

EN 전용 Personality 입력 타입을 만들지 않는다.

---

# 7. 공개 함수

권장:

```ts
renderPersonalityEn({
  natal,
  current?,
  name?,
  mode?
})
```

또는 KO/JA와 동일한 API 형태.

---

# 8. 영어 기본 문체

고객용 영어는:

```text
warm
calm
conversational
clear
modern
```

한 문체로 쓴다.

고풍 점술체 금지.

---

# 9. 축약형

자연스러운 경우:

```text
it's
you'll
you're
there's
```

등 contraction 허용.

단 너무 캐주얼하거나 가벼운 인터넷 문체로 만들지 않는다.

---

# 10. 영어의 you

일본어와 달리 영어의:

```text
you
your
```

는 자연스럽고 중립적이므로 허용한다.

하지만 문장마다:

```text
You...
You...
You...
You...
```

처럼 반복하지 않는다.

---

# 11. 이름

이름이 필요한 위치에서는 입력된 이름 그대로 사용한다.

금지:

```text
Mr.
Ms.
Mrs.
dear
dear one
seeker
```

Personality Renderer에서는 기본적으로 이름 반복을 피한다.

---

# 12. 고객용 전문용어 금지

다음 내부 영어 명리 용어를 고객 Personality 본문에 노출하지 않는다.

```text
Day Master
Day Pillar
Month Commander
Heavenly Stems
Earthly Branches
Hidden Stems
Ten Gods

Companion
Rob Wealth
Eating God
Hurting Officer
Direct Wealth
Indirect Wealth
Direct Officer
Seven Killings
Direct Resource
Indirect Resource

Structure
Yong Shen
Xiang Shen
Bing
Jiu Ying

Rooted
Combined Away
Luck Pillar
Annual Pillar
Monthly Pillar
```

---

# 13. 한자·병음 금지

고객 본문에는:

```text
甲
乙
丙
...
用神
相神

Yong Shen
Xiang Shen
Jiu Ying
```

같은 전문 한자·병음도 쓰지 않는다.

---

# 14. 고객용 표현

전문용어 대신 실제 성격 의미를 평이한 영어로 표현한다.

예:

```text
independent judgment
careful decision-making
a tendency to act quickly
a quieter inner response
```

등.

단 실제 PersonalityFact가 지원하는 의미만 사용.

---

# 15. trait dictionary

JA와 동일하게 현재는 language-neutral trait ID가 없다.

따라서 정규화된 내부 trait를 EN wording dictionary에서 조회할 수 있다.

이번 단계에서는 P2 Knowledge 전체 구조를 재설계하지 않는다.

---

# 16. 348 trait 전수 대응

현재 JA audit에서 확인된 normalized trait:

```text
348
```

개 전체에 대해 EN mapping coverage를 확보한다.

결과 보고:

```text
total:
mapped:
unmapped:
duplicate:
collision:
empty:
```

---

# 17. 누락 fallback 금지

매핑되지 않은 trait가 있으면:

```text
UNMAPPED_TRAIT
```

로 명시적으로 실패시킨다.

금지:

```text
한국어 그대로 출력
일본어를 영어로 번역
generic filler
silent omission
```

---

# 18. semantic collision

서로 다른 내부 trait가 같은 normalized key로 합쳐져 의미 차이가 사라지는지 검사한다.

Expected:

```text
collision = 0
```

---

# 19. language-neutral ID

이번 단계에서는 부재를 blocker로 보지 않는다.

결과에:

```text
TECH_DEBT:
language-neutral trait id absent
```

기록.

단 348 mapping 완전성이 전제다.

---

# 20. Personality 기본 출력 영역

KO/JA와 같은 의미 구조를 유지한다.

예:

```text
What shows outwardly
What shows up once you're closer
How decisions are made
How feelings are handled
```

실제 영어 제목은 더 자연스럽게 조정 가능.

---

# 21. 제목 직역 금지

한국어/일본어 heading을 단어 대 단어로 번역할 필요 없다.

의미만 동일하면 된다.

---

# 22. DayStem base

원국의 기본 성향은 Natal base로 표현.

DayStem 자체 이름을 고객에게 노출하지 않는다.

---

# 23. DayPillar

DayPillar Modifier는 보조.

금지:

```text
one birth-day pair
→ whole personality conclusion
```

---

# 24. Position

내부:

```text
outward/social
inner/private
decision
```

맥락을 영어에서도 유지한다.

---

# 25. Position이 새 trait를 만들지 않는다

금지:

```text
stem → outgoing
branch → introverted
```

같은 새 일반화.

---

# 26. PersonalityConflict

상반된 성향을 둘 다 보존한다.

예:

```text
You may make decisions quickly in public,
while privately taking more time to think things through.
```

단 실제 Conflict가 있을 때만.

---

# 27. Conflict 낙인 금지

금지:

```text
contradictory personality
two-faced
split personality
inconsistent person
```

---

# 28. StructuralRoleModifier

다음 operation을 그대로 의미 보존:

```text
supports_expression
channels_expression
restrains_expression
distorts_expression
protects_expression
resolves_tension
contextualizes
```

---

# 29. 역할 이름으로 문장 생성 금지

금지:

```text
if YongShen → positive
if Byeong → negative
```

반드시:

```text
operation
status
target fact
```

를 기준으로 렌더링.

---

# 30. supports_expression

의미:

```text
supports another existing tendency
helps that tendency function
```

정도.

금지:

```text
your guiding principle
your deepest value
the basis of every choice
```

근거 없는 확대.

---

# 31. channels_expression

기존 성향이 특정 방향으로 쓰이는 의미.

새 성격으로 바꾸지 않는다.

---

# 32. restrains_expression

기존 성향/기능을 제한하거나 누르는 의미.

확정도에 맞춰 표현.

---

# 33. distorts_expression

기존 성향이 불편한 방향으로 쓰이는 의미.

금지:

```text
bad personality
flawed personality
toxic
problematic person
```

---

# 34. protects_expression

특정 성향/기능을 유지하도록 받쳐 주는 의미.

금지:

```text
your greatest strength
your strongest trait
```

---

# 35. resolves_tension

특정 tension을 완화하는 의미.

금지:

```text
solves everything
perfect balance
```

---

# 36. Protective Standby

아직 실제 작동 중이 아니라면:

```text
can become supportive when needed
```

정도의 조건부 의미.

항상 작동한다고 쓰지 않는다.

---

# 37. ConditionalByeong

고객 영어에서도 최소:

```text
condition
+
interference/distortion
```

둘 다 남긴다.

예 구조:

```text
When that pressure builds,
this side can start getting in the way of another part of how you respond.
```

실제 target meaning에 맞춰 생성.

---

# 38. confirmed interference

현재 실제로 작동 중이라면:

```text
Right now, this side is getting in the way of ...
```

처럼 현재 작동을 분명히 한다.

가능성으로 약화 금지.

---

# 39. 확정 판단

내부:

```text
confirmed / operating
```

고객 영어:

```text
is
has
shows
works
is working
```

등.

---

# 40. confirmed를 may로 낮추지 않는다

금지:

```text
confirmed
→ may
→ might
→ perhaps
```

자동 약화.

---

# 41. conditional

내부:

```text
contextual
conditional
```

고객 영어:

```text
tends to
can
is likely to
when ...
if ...
```

등.

---

# 42. 조건부를 definitely로 올리지 않는다

금지:

```text
always
definitely
certainly
without fail
```

---

# 43. reduced

작용은 존재하지만 약화됨.

예:

```text
is less active right now
has less pull than usual
isn't coming through as strongly
```

단 강도 수치를 만들지 않는다.

---

# 44. inactive

현재 고객 본문 active content에서는 제외.

History/provenance만 유지.

---

# 45. Natal

원국 Personality는:

```text
naturally
at baseline
by default
you tend to
```

등 자연스럽게 표현 가능.

---

# 46. Current

temporary Current Personality는:

```text
right now
in this period
at the moment
in the current phase
```

등으로 구분.

---

# 47. Current → Natal 승격 금지

temporary fact를:

```text
you've always been...
you're naturally...
```

로 바꾸면 FAIL.

---

# 48. expired

expired effect는 현재 customer output = 0.

---

# 49. History 사건화 금지

과거 Personality history에서:

```text
you changed jobs
you broke up
you had conflict
```

같은 실제 사건을 생성하지 않는다.

---

# 50. 사건 예측 금지

성격에서:

```text
you'll succeed
you'll fail
you'll leave your job
you'll meet someone
```

등 outcome 생성 금지.

---

# 51. 건강 추정 금지

성격에서:

```text
pain
stiffness
blocked
hospital
check-up
```

등 신체/의료 추정 생성 금지.

---

# 52. 생활상태 단정 금지

고객이 제공하지 않았다면:

```text
your husband
your wife
your children
your boss
your company
```

등을 실제 사실처럼 쓰지 않는다.

---

# 53. 공포 표현 금지

```text
danger
disaster
doom
curse
misfortune
beware
```

0건.

---

# 54. 점술체 금지

```text
the stars foretell
destiny decrees
fated
doomed
thou
thy
```

0건.

---

# 55. 면책문구 금지

고객 본문에:

```text
for entertainment only
everyone is different
your fate is in your hands
```

등 넣지 않는다.

---

# 56. 점수 금지

```text
%
score
odds
rating
stars
rank
```

성격 평가 수치화 0.

---

# 57. Prominence

현재:

```text
Prominence = deferred
```

유지.

금지:

```text
your strongest trait
your most dominant tendency
your number-one trait
```

자동 생성.

---

# 58. 일반 영어 자연성

다음 번역투를 피한다.

```text
the tendency of...
the side of you which...
in the case where...
it can be seen that...
```

필요 이상 반복 금지.

---

# 59. 과도한 you 반복

예:

```text
You think...
You decide...
You feel...
You act...
```

처럼 반복되지 않도록 문장 구조를 다양화.

---

# 60. 너무 상담체로 가지 않는다

금지:

```text
That's okay.
Don't worry.
You should embrace this.
```

PersonalityResult에 없는 감정적 조언을 추가하지 않는다.

---

# 61. 자연스러운 대화체

적절한 예:

```text
You tend to decide things for yourself.
Around other people, that side comes through fairly clearly.
In private, though, you may take more time before settling on a choice.
```

단 실제 입력 근거가 있을 때만.

---

# 62. 문장 길이

영어 문장은 자연스러운 길이를 우선한다.

Localization source의 일본어 40자 가이드를 영어에 기계적으로 적용하지 않는다.

---

# 63. KO/JA/EN semantic parity

동일 PersonalityResult를:

```text
KO
JA
EN
```

Renderer에 입력.

문자열 번역 일치는 요구하지 않는다.

비교:

```text
Fact IDs
Modifier IDs
Conflict IDs
certainty
Natal/Current
active/reduced/inactive
```

---

# 64. provenance parity

Expected:

```text
KO = JA = EN
```

의 Fact/Modifier/Conflict coverage.

---

# 65. certainty parity

언어별 확정도가 같아야 한다.

```text
confirmed = confirmed
contextual = contextual
reduced = reduced
inactive = omitted-current
```

---

# 66. canonical 60일주

가능하면 60일주 전체를 EN Renderer로 통과시킨다.

목적:

```text
DayPillar trait coverage
348 dictionary coverage
```

검증.

---

# 67. 대표 fixture

최소 17종:

```text
A Simple Natal
B Outward/Inner
C Conflict
D DayPillar
E supports
F channels
G restrains
H distorts
I protects
J resolves
K Standby
L ConditionalByeong
M Confirmed interference
N No-Byeong
O Current
P Expired
Q Unknown hour
```

---

# 68. 내부-영어 대조

각 대표 fixture:

| Internal meaning | English output | 판정 |
|---|---|---|

판정:

```text
MATCH
PARTIAL_LOSS
OVERSTATEMENT
UNSUPPORTED
UNNATURAL
```

---

# 69. OVERSTATEMENT

BLOCKING.

예:

```text
contextual → definite
temporary → innate
support → core value
```

---

# 70. UNSUPPORTED

내부 근거가 없는 영어 의미 추가.

BLOCKING.

---

# 71. PARTIAL_LOSS

핵심 의미 일부 누락.

중요 의미이면 BLOCKING.

---

# 72. UNNATURAL

의미는 맞지만 영어가 부자연스러움.

별도 집계.

---

# 73. Dictionary 전수검사

348개 각각:

```text
mapped
non-empty
deterministic
no collision
no Korean leakage
no Japanese leakage
```

검사.

---

# 74. 한국어 누출

고객 영어 text에 한국어 trait가 그대로 나오면 FAIL.

---

# 75. 일본어 누출

고객 영어 text에:

```text
〜だよ
命式
判断のしかた
```

등 일본어가 남으면 FAIL.

---

# 76. 내부 용어 누출

고객 text에:

```text
PersonalityFact
RoleModifier
sourceFactId
confirmed
contextual
```

등 코드용 표현 0건.

---

# 77. EN → KO/JA dependency

다음 0:

```text
EN → KO Renderer
EN → JA Renderer
```

---

# 78. EN → Judgment dependency

0.

---

# 79. EN 별도 엔진

0.

---

# 80. 권장 코드 경로

```text
src/lib/personality/render/en/
├─ renderPersonalityEn.ts
├─ wording.ts
└─ guardrails.ts
```

기존 공통 render types 재사용.

---

# 81. Knowledge 변경 금지

원칙적으로:

```text
src/lib/personality/knowledge/
```

수정 0.

---

# 82. Personality Engine 변경 금지

P2-D~G semantics 수정 0.

---

# 83. Judgment 변경 금지

```text
src/lib/judgment/
```

수정 0.

---

# 84. KO/JA 변경 최소화

EN 구현을 위해 기존 KO/JA 문장 계약을 바꾸지 않는다.

공통 타입 추출 같은 최소 리팩터링만 허용.

---

# 85. deterministic

동일 PersonalityResult → 동일 English output.

LLM runtime 사용 금지.

---

# 86. input ordering

Fact 배열 순서가 달라도 의미 결과 동일.

---

# 87. validation script

권장:

```text
scripts/verify-personality-renderer-en-p3e.mjs
```

---

# 88. 필수 자동검증

```text
348 mapped
unmapped = 0
collision = 0
empty = 0

KO/JA/EN provenance mismatch = 0
certainty mismatch = 0
Natal/Current mismatch = 0

KO dependency = 0
JA dependency = 0
Judgment direct = 0
separate EN engine = 0

Korean leakage = 0
Japanese leakage = 0
internal terminology = 0
fortune-telling wording = 0
fear wording = 0
event prediction = 0
health inference = 0
score/rank = 0
expired rendering = 0
```

---

# 89. 기존 Personality 회귀

```text
P2-A ~ P2-G PASS
P3-A PASS
P3-B PASS
P3-C PASS
P3-D PASS
```

---

# 90. Judgment

```text
35/35 PASS
```

---

# 91. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 92. 결과 파일

```text
src/docs/codex/p3e-personality-renderer-en-result.md
```

---

# 93. 최종 보고

## A. 전체 판정

```text
READY_FOR_EN_PERSONALITY_RENDERER_AUDIT
```

또는:

```text
P3E_FIX_REQUIRED
```

## B. Architecture

```text
Personality Engine count:
EN separate engine:
EN → KO:
EN → JA:
EN → Judgment:
```

Expected:

```text
1
no
no
no
no
```

## C. Trait Dictionary

```text
total:
mapped:
unmapped:
duplicate:
collision:
empty:
```

## D. Semantic parity

```text
KO/EN Fact mismatch:
JA/EN Fact mismatch:
Modifier mismatch:
Conflict mismatch:
certainty mismatch:
Natal/Current mismatch:
```

## E. English Guardrails

```text
Korean leakage:
Japanese leakage:
internal terminology:
fortune-telling style:
fear wording:
unsupported life assumptions:
event prediction:
health inference:
score/rank:
Prominence ranking:
```

## F. Regression

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:
P2-G:

P3-A:
P3-B:
P3-C:
P3-D:
P3-E:

Judgment:
tsc:
build:
```

## G. 남은 상태

```text
FAIL:
PARTIAL:
UNSUPPORTED:
OVERSTATEMENT:
UNNATURAL:
DEFERRED:
TECH_DEBT:
NOT_IMPLEMENTED:
```

---

# 94. 종료 조건

다음이면:

```text
READY_FOR_EN_PERSONALITY_RENDERER_AUDIT
```

판정.

```text
[ ] 공통 Personality Engine 1개
[ ] EN 별도 엔진 0
[ ] EN→KO 0
[ ] EN→JA 0
[ ] EN→Judgment 0
[ ] 348 mapping 누락 0
[ ] collision 0
[ ] empty 0
[ ] KO/JA/EN provenance parity
[ ] certainty parity
[ ] Natal/Current parity
[ ] expired 출력 0
[ ] 한국어 누출 0
[ ] 일본어 누출 0
[ ] 전문용어 노출 0
[ ] 점술체 0
[ ] 공포 표현 0
[ ] 사건·건강 단정 0
[ ] score/rank 0
[ ] P2/P3 기존 회귀 PASS
[ ] Judgment 35/35 PASS
[ ] tsc/build PASS
```

---

# 95. 다음 단계

P3-E 구현 통과 후:

```text
P3-F
English Personality Renderer Semantic Audit
```

을 수행한다.

P3-F까지 통과하면:

```text
KO
JA
EN
```

세 언어 Personality Renderer의 의미 계약을 모두 고정한다.

그 뒤에:

```text
language-neutral trait ID
```

리팩터링을 할지 판단한다.

중요:

그 리팩터링은 **성격 판정을 바꾸는 작업이 아니라 348개 언어별 dictionary key를 공통 semantic ID로 치환하는 기술 정비 작업**이어야 한다.