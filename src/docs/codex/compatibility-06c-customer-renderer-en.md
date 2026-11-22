# FILUNE Compatibility-06C
## English Customer Renderer

진입 조건:

```text
COMPATIBILITY_JA_RENDERER_READY
COMPATIBILITY_KO_RENDERER_FINAL_READY
```

현재 완료:

```text
C1 Cross-chart Fact Engine
C2 Structural Compatibility
C3 Personality Interaction
C4 Relationship Lifecycle & Timing
C5 Final Compatibility Assembly

C6-A Korean Renderer
C6-A.1 Korean Presentation Polish
C6-B Japanese Renderer
```

이번 단계에서는 **영어 Customer Renderer만 구현한다.**

새 명리 판단:

```text
0
```

---

# 1. 절대 원칙 — 중역 금지

영어 Renderer는:

```text
FinalCompatibilityResult
↓
English Customer Renderer
```

로 직접 변환한다.

금지:

```text
KO result → English
JA result → English
```

한국어 또는 일본어 문장을 번역해서 만드는 구조는 허용하지 않는다.

---

# 2. Semantic architecture

KO/JA와 동일한 semantic section 구조를 유지한다.

권장 section:

```text
01 At a glance
02 What works well between you
03 What needs attention
04 How you affect each other
05 Personality and communication
06 Relationship and marriage flow
07 Periods when the relationship gets easier
08 Periods when the relationship gets harder
09 Periods when marriage becomes easier to formalize
10 Better marriage windows / heavier marriage windows
11 Periods when the relationship is more likely to break down
12 Timeline
```

영어 UX에 맞춰 heading은 자연스럽게 다듬을 수 있으나
semantic 누락·추가 금지.

---

# 3. English style authority

Customer English:

```text
warm
calm
plain
modern
conversational
```

허용:

```text
it's
you'll
you're
```

과도한 점술체 금지.

금지:

```text
thou
thy
the stars foretell
destiny decrees
fate has chosen
```

---

# 4. Addressing the customer

영어의 `you`는 허용한다.

단:

```text
you
you
you
```

식으로 매 문장 반복하지 않는다.

이름이 있으면 입력된 이름 그대로 사용한다.

금지:

```text
Mr.
Ms.
Mrs.
```

자동 부여.

---

# 5. confirmed certainty

내부:

```text
confirmed
```

이면 영어도 확정형:

```text
is
has
will be
this period brings
this period has
```

등을 사용한다.

금지:

```text
may
might
perhaps
possibly
could maybe
```

로 임의 하향.

---

# 6. conditional certainty

조건부 결과는:

```text
tends to
is likely to
can
if ...
```

를 사용한다.

conditional을:

```text
definitely
certainly
always
```

로 올리지 않는다.

---

# 7. Risk vs guaranteed event

내부:

```text
relationship_breakdown_risk = confirmed
```

은 확정된 **risk window**다.

예:

```text
This is a period when the relationship is clearly more vulnerable to a major break.

If strain has already been building, it is easier for the relationship to move toward distance, separation, or an actual breakup.
```

금지:

```text
You will divorce.
You will break up.
This relationship will end.
```

---

# 8. Risk를 약화하지 않는다

confirmed breakdown risk를:

```text
You may want to be a little careful.
Things could feel slightly tense.
```

수준으로 낮추지 않는다.

---

# 9. Fear-based wording 금지

고객 본문에서 금지:

```text
danger
disaster
doom
curse
misfortune
beware
catastrophic
terrible fate
```

정확한 생활 결과를 설명한다.

---

# 10. Saju terminology customer exposure 금지

고객 영어에 다음 직접 노출 금지:

```text
Day Master
Ten Gods
Eating God
Hurting Officer
Rob Wealth
Seven Killings
Direct Wealth
Indirect Wealth
Direct Officer
Indirect Officer
Direct Resource
Indirect Resource

Yong Shen
Xiang Shen
Bing
Jiu Ying

Luck Pillar
Annual Pillar
Monthly Pillar
Hidden Stems

Combination
Clash
Punishment
Destruction
Harm
Root
Structure
```

내부 debug/provenance에는 허용.

---

# 11. Numeric compatibility 금지

금지:

```text
85%
90 points
compatibility score
rating
rank
stars
odds
```

날짜 숫자는 제외.

---

# 12. Structural favorable

내부:

```text
favorable
```

고객 의미:

```text
This relationship has a strong practical supportive effect.

The other person helps resolve problems that are harder to handle alone and helps important strengths work more effectively.
```

문맥에 맞게 자연스럽게 조립한다.

---

# 13. favorable_dominant

의미:

```text
There are both supportive and difficult effects, but the more important structural effect is supportive.
```

---

# 14. balanced_mixed

절대:

```text
average
neutral
50/50
unclear
so-so
```

로 번역하지 않는다.

정확한 의미:

```text
This relationship has strong supportive effects and strong points of friction at the same time.
```

---

# 15. unfavorable_dominant

의미:

```text
There are some supportive effects, but the more important pattern is that the relationship amplifies existing strain or weakens something you need.
```

---

# 16. unfavorable

의미:

```text
This relationship clearly tends to weaken something important or reinforce problems that are already present.
```

---

# 17. minor_effect

의미:

```text
The two of you do affect each other, but the effect does not strongly reshape the major foundations of either person's life.
```

---

# 18. Directionality 유지

A→B / B→A를 지우지 않는다.

금지:

```text
You affect each other.
```

만으로 축약.

예:

```text
The first person has a strongly supportive effect on the second.

In the other direction, the second person tends to amplify strain or weaken something the first person relies on.
```

---

# 19. Names

이름이 있으면:

```text
Yuna has a supportive effect on Mina.
```

처럼 사용할 수 있다.

한 문단에서 이름 반복 남용 금지.

---

# 20. Strength mappings

예:

```text
relieves_byeong
→ helps resolve a problem that is difficult to solve alone

supports_required_function
→ helps an important ability or role work properly

supports_required_root
→ gives an existing strength a firmer base to work from

communication_relief
→ makes it easier to say what you actually feel and think

relationship_relief
→ reduces the effort needed to keep the relationship running
```

---

# 21. Risk mappings

예:

```text
strengthens_harmful_path
→ amplifies a problem that is already present

damages_required_function
→ makes an important ability or role harder to use effectively

supports_harmful_root
→ allows an existing weakness to persist

communication_friction
→ makes it easier to hold things in and let conversation shrink

relationship_strain
→ increases the effort and pressure required to maintain the relationship

relationship_breakdown_risk
→ marks a period when an important relationship is much more likely to be seriously disrupted
```

---

# 22. Personality — Resource dominance

내부:

```text
ResourceDominance
OutputSuppression
ExpressionConstraint
```

직역 금지.

예:

```text
You tend to process thoughts and feelings internally before expressing them.

Speaking immediately and openly is not your natural default.
```

---

# 23. Mutual expression restraint

내부:

```text
mutualExpressionRestraint
communicationFriction
```

예:

```text
Both people tend to process things internally before speaking.

As the relationship gets closer, important conversations can be postponed, which makes communication gradually more blocked.
```

---

# 24. Current expression relief

예:

```text
Right now, it is easier than usual to put thoughts and feelings into words.

Conversations that would normally feel difficult are easier to open up.
```

---

# 25. Natal vs Current

가능:

```text
Communication is usually one of the harder parts of this relationship, but the current period makes it easier to speak openly and clear the air.
```

기본 성향과 현재 흐름을 상쇄하지 않는다.

---

# 26. Relationship formation

내부:

```text
relationship_formation
```

고객 표현:

```text
new connections are more likely
distance can close more easily
a relationship is easier to begin
```

실제 certainty와 semantic에 맞춰 사용한다.

---

# 27. Relationship change

내부:

```text
relationship_change
```

예:

```text
This is a period when the shape or direction of a close relationship is more likely to change.
```

자동 positive/negative 금지.

---

# 28. Romantic destiny wording 금지

금지:

```text
soulmate
the one
destined partner
twin flame
perfect match
meant to be
```

---

# 29. Marriage opportunity

내부:

```text
marriage_opportunity
```

예:

```text
This is a period when marriage or making the relationship official is easier to move forward.
```

---

# 30. Unknown relationship status

상태가 없으면:

```text
making the relationship official
formalizing a relationship
```

같은 중립 표현 사용.

사주로:

```text
husband
wife
boyfriend
girlfriend
fiancé
```

추정 금지.

---

# 31. Explicit relationship status

사용자가 실제 상태를 제공했을 때만:

```text
marriage
spouse
partner
dating relationship
```

등을 문맥에 맞게 사용할 수 있다.

---

# 32. Marriage favorable

예:

```text
If marriage is being considered, this is a period when the relationship itself also supports that decision.
```

---

# 33. Marriage caution

내부:

```text
marriage_opportunity = confirmed
marriage_caution = confirmed
```

이면 둘 다 쓴다.

예:

```text
Marriage or formal commitment is easier to move forward during this period.

At the same time, the relationship carries more pressure than usual.

A period when marriage is easier to formalize is not automatically the same as a period when married life will feel easy.
```

---

# 34. Opportunity ≠ favorable

금지:

```text
marriage opportunity
→ best time to marry
```

---

# 35. Relationship strain

예:

```text
This period asks more from the relationship.

Issues that would normally be brushed aside are more likely to turn into actual conflict.
```

---

# 36. Relationship relief

예:

```text
Pressure that has been building in the relationship eases during this period.

Conversation and day-to-day interaction become easier to manage.
```

---

# 37. BREAKDOWN-A

내부:

```text
Baseline Vulnerability Aggravation
```

고객 의미:

```text
Problems that have already existed in the relationship become active again during this period, making the relationship harder to sustain.
```

---

# 38. BREAKDOWN-B

내부:

```text
Spouse Event + Palace Disruption
```

고객 의미:

```text
Even if the relationship is not usually unstable, this period can bring a major shift involving a close partner or relationship, making the bond much easier to disrupt.
```

`partner` 사용은 relationship context가 허용하는지 확인한다.

상태 미상이면:

```text
a close relationship
someone important to you
```

등 중립 표현 사용.

---

# 39. A+B simultaneous

예:

```text
Two different sources of pressure overlap here.

Existing relationship problems become active at the same time as a major relationship shift, so the risk of a serious break is especially clear.
```

숫자 위험등급 추가 금지.

---

# 40. Time presentation architecture

C6-A.1 / C6-B와 동일한 분류 유지:

```text
past
current
current_spanning
future
unknown_calendar
```

---

# 41. current_spanning

권장:

```text
Long-term flow including the present
```

예:

```text
Long-term flow including the present · January 1, 2020–January 1, 2030
```

더 자연스러운 UX wording이 있으면
동일 의미 범위에서 조정 가능.

---

# 42. current

권장:

```text
Current
Now
```

기존 English renderer convention에 맞춰 하나로 고정.

---

# 43. future

권장:

```text
Ahead
Coming up
Future
```

UI convention에 맞춰 하나로 고정.

---

# 44. past

권장:

```text
Earlier
Past
Previously
```

기존 convention 확인 후 고정.

---

# 45. unknown calendar

권장:

```text
Calendar timing not yet available
```

또는 자연스러운 동등 표현.

가짜 날짜 생성 금지.

---

# 46. English date format

영어 customer locale의 현행 convention을 사용한다.

예:

```text
February 4, 2028–February 3, 2029
```

locale이 en-US인지 en-global인지
현재 repository convention을 먼저 확인한다.

새 날짜 계산 금지.

---

# 47. Overlapping-window grouping

C6-A.1과 동일.

예:

```text
From 2020 to 2030, the second person has a long-term flow that makes formal commitment easier.

Within that larger period, February 2028 to February 2029 is especially important because both people's relationship timing overlaps.
```

Underlying Fact 삭제 금지.

---

# 48. Mutual window

개인 window와 상호 window를 구분한다.

예:

```text
Both people enter a period that supports formal commitment at the same time.
```

---

# 49. Timeline

section 번호 reference 금지.

금지:

```text
item 1
item 2
section 7
the second statement above
```

실제 기간 + 의미로 보여준다.

---

# 50. Timeline example

```text
February 4, 2028–February 3, 2029

- Both people have timing that supports making the relationship official.
- The first person also carries more relationship pressure during the same period.
- If problems are already present, the risk of a major break is also clearly higher.
```

---

# 51. Same-window mixed results

같은 기간:

```text
marriage opportunity
marriage caution
relationship strain
breakdown risk
```

모두 공존 가능.

하나를 삭제하지 않는다.

---

# 52. Supportive baseline + future risk

가능:

```text
The relationship is fundamentally supportive in important ways.

However, 2030 contains a period when the relationship is much easier to destabilize.
```

모순 아님.

---

# 53. Difficult baseline + relief

가능:

```text
The relationship has several built-in points of friction, but 2029 is a period when communication and day-to-day pressure ease.
```

---

# 54. 생활 언어 우선

금지:

```text
The Resource overwhelms Output.
The Wealth star is clashed.
The Day Branch is attacked.
```

대신:

```text
Both people tend to hold things in.
Communication becomes harder.
Relationship pressure increases.
```

---

# 55. “energy” 남용 금지

가능하면:

```text
force
pressure
support
pull
pattern
flow
```

등 문맥에 맞는 생활어 사용.

`energy` 반복 금지.

---

# 56. Sentence style

영어 고객 문장은:

```text
짧고 명확한 문장
한 문단 2~3문장
과도하게 시적인 표현 금지
```

를 우선한다.

---

# 57. Deterministic renderer

같은:

```text
FinalCompatibilityResult
```

이면 같은 영어 결과.

LLM runtime dependency:

```text
0
```

---

# 58. KO/JA string dependency 금지

코드에서:

```text
renderKo()
→ translate

renderJa()
→ translate
```

금지.

canonical semantic ID에 영어 template를 직접 연결한다.

---

# 59. Existing English Personality Renderer 재사용

가능한 한 현재 English Personality Renderer의:

```text
tone
name handling
certainty helpers
date helpers
punctuation
customer safety
```

를 재사용한다.

새 parallel English style system을 만들지 않는다.

---

# 60. Result type

권장:

```text
CompatibilityCustomerResultEN
```

단 KO/JA와 동일한 semantic schema를 유지한다.

언어별 별도 의미 모델 금지.

---

# 61. Semantic parity

동일 fixture에서:

```text
KO semantic IDs
=
JA semantic IDs
=
EN semantic IDs
```

이어야 한다.

Missing:

```text
0
```

Extra:

```text
0
```

---

# 62. Certainty parity

```text
KO/JA confirmed
→ EN confirmed

KO/JA conditional
→ EN conditional
```

Mismatch:

```text
0
```

---

# 63. Direction parity

```text
A→B preserved
B→A preserved
```

direction reversal:

```text
0
```

---

# 64. Timing parity

동일:

```text
TimingFact IDs
Gregorian intervals
past/current/current_spanning/future classification
```

을 유지한다.

---

# 65. Marriage parity

각 fixture에서:

```text
marriage opportunity
marriage favorable
marriage caution
```

KO/JA/EN presence가 동일해야 한다.

---

# 66. Breakdown parity

```text
BREAKDOWN-A
BREAKDOWN-B
A+B
```

각각 동일 Fact IDs를 사용한다.

---

# 67. English terminology violation scan

최소 customer output에서 검사:

```text
Day Master
Ten Gods
Eating God
Hurting Officer
Rob Wealth
Seven Killings
Direct Wealth
Indirect Wealth
Direct Officer
Indirect Officer
Direct Resource
Indirect Resource
Yong Shen
Xiang Shen
Luck Pillar
Hidden Stems
```

Expected:

```text
0
```

---

# 68. Divination-style violation scan

검사:

```text
destiny
fate decrees
fortune says
the stars
curse
doom
disaster
beware
misfortune
```

문맥상 금지된 점술체 사용:

```text
0
```

---

# 69. Romantic-fate violation scan

검사:

```text
soulmate
the one
twin flame
destined partner
perfect match
meant to be
```

Expected:

```text
0
```

---

# 70. Numeric-score violation scan

검사:

```text
%
score
rating
rank
stars
odds
```

날짜/일반 숫자 제외.

궁합 numeric output:

```text
0
```

---

# 71. Certainty downgrade scan

예:

```text
confirmed
→ may / might / perhaps
```

위반:

```text
0
```

단 조건부 semantic의 legitimate `may/can`과 구분한다.

---

# 72. Invented outcome scan

FinalCompatibilityResult에 없는:

```text
cheating
affair
pregnancy
remarriage
lawsuit
debt
abuse
```

등 신규 사건 생성:

```text
0
```

---

# 73. Relationship-status inference scan

명시 입력 없는데:

```text
husband
wife
boyfriend
girlfriend
fiancé
fiancée
spouse
```

자동 추정:

```text
0
```

필요 시:

```text
a close relationship
someone important to you
the relationship
```

사용.

---

# 74. Orphan statement

모든 영어 customer statement는
C5 Fact / semantic / provenance까지 추적 가능해야 한다.

Orphan:

```text
0
```

---

# 75. Duplicate statements

같은 semantic + person + direction + window의
불필요한 반복:

```text
0
```

C6-A.1의 dedup/grouping contract 유지.

---

# 76. 신규 verifier

권장:

```text
scripts/verify-compatibility-renderer-en-c6c.mjs
```

---

# 77. Fixture reuse

C6-A.1 / C6-B fixture 그대로 재사용.

최소:

```text
mixed
balanced
history
relief
bothPaths
marriageSource
breakdownSource

A→B/B→A asymmetric
current expression relief
BREAKDOWN-A
BREAKDOWN-B
A+B
```

---

# 78. Full English samples

결과 문서에 최소:

```text
Sample A — support + communication friction
Sample B — marriage opportunity + caution
Sample C — breakdown-risk window
```

전체 출력 기록.

생략하지 않는다.

---

# 79. 3-language parity table

결과 문서에:

| Fixture | KO | JA | EN | Missing EN | Extra EN | Certainty mismatch | Direction mismatch | Timing mismatch |
|---|---:|---:|---:|---:|---:|---:|---:|---:|

Expected:

```text
Missing EN = 0
Extra EN = 0
Certainty mismatch = 0
Direction mismatch = 0
Timing mismatch = 0
```

---

# 80. Existing engine isolation

Expected:

```text
C1 = unchanged
C2 = unchanged
C3 = unchanged
C4 = unchanged
C5 = unchanged

KO Renderer = unchanged
JA Renderer = unchanged

Judgment = unchanged
Personality = unchanged
Money = unchanged
Health = unchanged
Relationship = unchanged
Event Timing = unchanged
```

---

# 81. English Personality Renderer regression

반드시 실행.

공용 English helper 수정 시
기존 Personality EN 결과 의미 변경:

```text
0
```

---

# 82. KO/JA renderer regression

반드시:

```text
COMPATIBILITY_KO_RENDERER_FINAL_READY
COMPATIBILITY_JA_RENDERER_READY
```

유지.

---

# 83. TypeScript / Build

```text
npx tsc -b
npm run build
git diff --check
```

PASS.

---

# 84. 결과 파일

생성:

```text
src/docs/codex/compatibility-06c-customer-renderer-en-result.md
```

---

# 85. 결과 보고

반드시:

```text
EN fixtures rendered:

KO/JA/EN semantic parity:
Missing EN:
Extra EN:

Certainty mismatches:
Direction mismatches:
Timing mismatches:

Saju terminology violations:
Divination-style violations:
Romantic-fate violations:
Numeric-score violations:
Invented-outcome violations:
Relationship-status inference violations:

Orphan statements:
Duplicate statements:

KO changes:
JA changes:
C1-C5 changes:

English Personality Renderer changes:

TypeScript:
Build:
```

---

# 86. 성공 판정

다음을 모두 만족하면:

```text
COMPATIBILITY_EN_RENDERER_READY
```

조건:

```text
[ ] FinalCompatibilityResult 직접 렌더링
[ ] KO/JA 중역 0

[ ] KO/JA/EN semantic parity
[ ] certainty parity
[ ] direction parity
[ ] timing parity

[ ] C6-A.1 presentation architecture 유지
[ ] overlapping window grouping 유지
[ ] chronological timeline 유지

[ ] Saju terminology exposure 0
[ ] divination-style wording 0
[ ] romantic-fate wording 0
[ ] numeric compatibility score 0
[ ] invented outcome 0
[ ] relationship-status inference 0

[ ] deterministic
[ ] provenance traceable

[ ] KO regression PASS
[ ] JA regression PASS
[ ] English Personality regression PASS

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 87. 정책 결정이 필요한 경우

영어 표현 때문에
새 명리 판단을 만들거나 C5 의미를 바꾸지 않는다.

정말 localization policy 결정이 필요하면:

```text
COMPATIBILITY_C6C_POLICY_DECISION_REQUIRED
```

로 중단한다.

반드시:

```text
Question:
Existing localization authority:
Option A:
Option B:
Customer consequence:
```

로 보고한다.

---

# 88. C6-C 이후

`COMPATIBILITY_EN_RENDERER_READY`가 나오면
KO / JA / EN Compatibility Renderer 구현은 닫는다.

다음 단계는 새 판단 엔진이 아니라:

```text
Compatibility-07
Final Multilingual Integration Audit
```

이다.

C7에서는:

```text
C1-C5 structural semantics
KO/JA/EN semantic parity
customer assertion strength
timing identity
provenance
public product entry point
```

만 최종 감사한다.

C7에서 새 명리 규칙을 만들지 않는다.