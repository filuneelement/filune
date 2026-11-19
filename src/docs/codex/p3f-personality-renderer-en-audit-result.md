# FILUNE P3-F English Personality Renderer 의미·자연성 감사

## A. 전체 판정

`READY_FOR_MULTILINGUAL_PERSONALITY_COMPLETE`

**FILUNE Multilingual Personality Pipeline COMPLETE**

현행 authority/master의 판정 계약, PersonalityResult, 영어 localization 문구 순서로 대조했다. 저장소에서 확인한 localization 원문의 확장자는 `.m`이다. [Localization 원문](../source/localization/FILUNE-ja-en-terminology-rendering-standard.m) · [Authority Mapping](../rules/authority/mapping-localization.md) · [Personality Master](../rules/master/11-personality-master.md) · [Knowledge Schema](../rules/master/12-personality-knowledge-schema.md) · [P3-E 결과](p3e-personality-renderer-en-result.md)

## B. Trait Dictionary

| 항목 | 개수 |
| --- | ---: |
| Normalized traits | 348 |
| Mapped | 348 |
| Unmapped | 0 |
| Duplicate keys | 0 |
| Semantic collisions | 0 |
| Empty outputs | 0 |

엔진의 성향 생성 필드와 일주 충돌 근거에서 canonical 348개를 수집해 독립 문장으로 렌더링했다. 앞뒤 공백을 제거한 내부 키를 조회하며, 문장부호·조사를 임의로 합치지 않는다. 검증용 동의어 `빠른 판단`은 집계에서 제외했다. 미등록 키는 `UNMAPPED_TRAIT`로 검출하고, 최종 문장 안전 검사 실패는 `UNSAFE_EN_PERSONALITY_WORDING`으로 드러낸다. [영어 사전](../../lib/personality/render/en/wording.ts) · [P3-E 공통 검증](../../../scripts/verify-personality-renderer-en-p3e.mjs) · [P3-F 감사](../../../scripts/verify-personality-renderer-en-audit-p3f.mjs)

## C. Semantic Audit

| MATCH | PARTIAL_LOSS | OVERSTATEMENT | UNSUPPORTED | UNNATURAL |
| ---: | ---: | ---: | ---: | ---: |
| 17 | 0 | 0 | 0 | 0 |

수정 후 대표 의미 비교 판정이다. 기존 17개 엔진 fixture, canonical 60일주와 역할 상태 조합 35건을 실행했다. G는 실제 fixture의 근거 연결에 `restrains_expression` 작용만 주입한 표현 계약 검증이다.

| 사례 | Internal meaning | English output | Result |
| --- | --- | --- | --- |
| A. Simple Natal | 원국의 밝은 성향이 자연스럽게 표면에 드러남 | Naturally, you show your bright, upbeat side openly. | MATCH |
| B. Outward / Inner | 겉의 예리한 표현과 내면의 신중한 검토를 구분 | Around other people, you may find the words to explain what you think. You may also put the heart of a matter into sharp, clear words. Privately, you may check that something holds up for yourself before acting. You may also draw on what you know and what you've checked to make careful decisions. | MATCH |
| C. Conflict | 앞서려는 마음과 다시 확인하며 멈추는 반응의 공존 | You take longer to get started even when there's something you want to do. At the same time, you want to be out in front. You also hesitate while checking once more whether it's time to act. You also feel pulled between wanting to start and wanting to hold off on a decision. | MATCH |
| D. DayPillar | 실행 욕구를 검토가 누르는 보조 성향. 일간 성향도 유지 | Alongside that, you rein in the urge to get started as you weigh things up. | MATCH |
| E. Supports | 깊이 탐구하는 성향이 기존 발현을 지원 | The way you look into questions and follow them in depth helps another tendency come through. | MATCH |
| F. Channels | 과감한 시도가 행동 방향에 쓰임 | The way you make bold moves shapes the direction your actions take. | MATCH |
| G. Restrains | 기존 성향이 다른 성향의 발현을 제한 | The way you take interest in things that aren't immediately easy to explain holds back how another tendency comes through. | MATCH |
| H. Distorts | 기존 성향이 다른 반응이 작동하는 데 방해가 됨 | The way you apply what you know in a new setting is getting in the way of another part of how you respond. | MATCH |
| I. Protects | 다른 성향이 계속 제 기능을 하도록 보호 | The way you take interest in things that aren't immediately easy to explain helps keep another tendency working. | MATCH |
| J. Resolves | 서로 부딪치는 반응의 긴장을 완화 | The way you make bold moves eases the tension between those competing responses. | MATCH |
| K. Standby | 지원이 필요할 때만 보호 가능 | When support is needed, the way you care about learning and teaching can help keep another tendency working. | MATCH |
| L. ConditionalByeong | 평소 발현을 유지하며 다른 반응과 겹칠 때 방해 가능 | You already make bold moves in everyday situations. When this response overlaps with another, it can get in the way of another part of how you respond. | MATCH |
| M. Confirmed interference | 현재 실제로 방해가 작동 | Right now, the way you make bold moves is getting in the way of another part of how you respond. | MATCH |
| N. No-Byeong | 근거 있는 원국 주의는 유지하고 가상의 방해 역할은 추가하지 않음 | You keep pushing ahead even after noticing that the direction is wrong. You also sometimes feel deeply unsettled when pressure to hold back your views continues. | MATCH |
| O. Current | 활성 기간의 바깥·사회적 임시 발현 | Right now, around other people, you may apply what you know in a new setting. You may also bring humor into a conversation. | MATCH |
| P. Expired | 만료 효과의 현재 출력 없음 | Current 출력 0건 | MATCH |
| Q. Unknown hour | 시주 정보 없이 확인된 원국 성향만 표현 | Naturally, you push things forward. You also take the initiative and try to get ahead. | MATCH |

조건부 Current 문장에서 능력으로 읽히기 쉬운 `can want` 같은 결합을 고치고, 원자료 자체에 포함된 가능성과 렌더러의 확정도를 구분했다. 예를 들어 압박이 계속될 때 동요할 수 있다는 원국 성향은 `sometimes`와 `when`을 문장 안에 유지하면서 해당 Fact의 확정도는 `confirmed`로 유지한다. 실제 방해가 작동하는 M의 문구에는 현재형을 유지했다. 반복되던 친숙한 발현 문구와 충돌 연결을 다듬었다. P2-D가 고객 문구의 관용 표현 `weight`도 무점수화 검사에서 검출해, 같은 의미의 다른 표현으로 교체했다. 검사는 기존 계약을 그대로 사용했다.

## D. KO / JA / EN Parity

| Fact | Modifier | Conflict | Certainty | Natal/Current |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 0 | 0 | 0 |

각 섹션의 근거 ID와 확정도, 역할·충돌 문단의 근거 연결을 대조했다. active 효과의 표현, reduced의 약화, inactive 및 만료 효과의 현재 출력 제외를 각각 확인했다. 만료 현재 출력은 0건이다.

## E. English Guardrails

| 범주 | 위반 |
| --- | ---: |
| 한국어 누출 | 0 |
| 일본어·한자 누출 | 0 |
| 내부 용어·병음 | 0 |
| 점술체 | 0 |
| 공포 표현 | 0 |
| 생활 전제 | 0 |
| 사건 단정·예측 | 0 |
| 건강 추정 | 0 |
| 점수·확률·랭크 | 0 |
| Prominence 순위 | 0 |
| 면책·근거 없는 조언 | 0 |

제목과 고객 본문을 검사했다. 과거 성공·실패 단정과 근거 없는 `Trust yourself`를 금지 입력 검사에 추가했다. [영어 안전 검사](../../lib/personality/render/en/guardrails.ts)

## F. Naturalness

| 실제 전체 출력 fixture | 판정 | 이유 |
| --- | --- | --- |
| A · 단순 원국 | natural | 평이한 어휘로 원국 기질과 상황별 반응을 설명한다. |
| C · 성향 충돌 | acceptable | 먼저 나서고 싶은 마음과 행동을 재검토하는 면이 모두 읽힌다. 이어지는 두 보충 문장에 `You also` 반복이 남는다. |
| D · 활성 보호 | acceptable | 실제 보호 작용이 드러난다. 근거가 많은 영역에서 역할 문형이 일부 반복된다. |
| G · 조건부 방해 | acceptable | 평소 반응과 조건에서의 방해를 두 문장으로 구분한다. |
| L · 임시 현재 | acceptable | 처음에 현재 시점을 밝히고, 익숙한 반응과 임시 발현의 맥락을 유지한다. 연속 문단에 `Right now`가 반복되는 부분은 남아 있다. |
| O · 출생 시각 미정 | acceptable | 알려진 원국 성향에 집중하며, 속과 겉의 맥락을 구분한다. |

## G. Architecture

| 항목 | 결과 |
| --- | --- |
| Personality Engine count | 1 |
| EN separate engine | no |
| EN → KO | 0 |
| EN → JA | 0 |
| EN → Judgment | 0 |
| Language-neutral trait ID | 없음 · TECH_DEBT |

영어 진입점은 공통 PersonalityResult를 사용한다. EN 문구·안전 검사 및 검증 스크립트를 수정했으며, KO·JA·공통 렌더링 계약 및 Knowledge·Personality Engine·Judgment 코드는 이번 단계에서 변경하지 않았다. [EN 진입점](../../lib/personality/render/en/renderPersonalityEn.ts)

## H. Regression

| 항목 | 결과 |
| --- | --- |
| P2-A | PASS |
| P2-B | PASS |
| P2-C | PASS |
| P2-D | PASS |
| P2-E | PASS |
| P2-F | PASS |
| P2-G | PASS |
| P3-A | PASS |
| P3-B | PASS |
| P3-C | PASS · 16/16 |
| P3-D | PASS |
| P3-E | PASS |
| P3-F | PASS · 대표 17건, 60일주, 348개 성향, 역할 상태 35건 |
| Judgment | PASS · 35/35 |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment 35개 명령은 기존 검증이 참조하는 레거시 문서 경로를 복원한 임시 저장소 사본에서 실행했다.

## I. 남은 상태

FAIL 0 · PARTIAL 0 · UNSUPPORTED 0 · OVERSTATEMENT 0 · UNNATURAL 0 · NOT_IMPLEMENTED 0 (P3-F 범위). DEFERRED는 기존 TenGodProminence다. TECH_DEBT는 **language-neutral trait ID absent**이며, 별도 선택 기술 정비로 남긴다.

## 부록. 대표 6개 fixture 전체 영어 출력

고객 본문과 제목은 최종 렌더러 출력 그대로다.

<details>
<summary>A · 단순 원국</summary>

```text
Your natural tendencies

Naturally, you show your bright, upbeat side openly.

Alongside that, you turn curiosity into questions and action.

What others notice

You have an effect on the mood of a gathering.

What comes through as people get closer

In everyday life, you act from your own standards. You also come up with new things.

In everyday life, you decide things for yourself. You also hold to what you believe.

In everyday life, you look into questions and follow them in depth. You also move decisions into action.

In everyday life, you pay attention to the ideas that suddenly come to you. You also question information and sort out what holds up.

In everyday life, you show feelings and opinions through words and actions. You also take interest in things that aren't immediately easy to explain.

In everyday life, you use your own thinking as a point of reference.

In everyday life, you may compete in good faith with people on equal footing. You may also explore questions on your own.

In everyday life, you may give care and share your talents mostly with people close to you. You may also take an interest in mysteries and philosophy.

In everyday life, you may try to hold on to your standards and protect your share.

How you make decisions

In everyday life, you may check that something holds up for yourself before acting. You may also listen to advice and wait until it makes sense to you before acting.

How you handle feelings

You show it on your face as soon as something upsets you.

What you do well

You put people you've just met at ease.

In everyday life, you may adapt on the spot. You may also break things down to understand them.

In everyday life, you may feel things deeply and with nuance. You may also have an eye for art and design.

In everyday life, you may keep a steady sense of your own worth. You may also make things as a form of expression.

In everyday life, you may reason things through logically. You may also reflect on the deeper questions behind things.

In everyday life, you may respond quickly when caught off guard. You may also spot openings when they appear.

In everyday life, you may take time to think a matter over. You may also treat people as equals.

In everyday life, you may use intuition to get a read on things. You may also work together with others.

Where things can get harder

You find it hard to adjust how strongly you show your feelings. You also tend to overlook middle-ground options when you're thinking big.
```

</details>

<details>
<summary>C · 성향 충돌</summary>

```text
Your natural tendencies

Naturally, you push things forward. You also take the initiative and try to get ahead.

Alongside that, you rein in the urge to get started as you weigh things up.

What comes through as people get closer

In everyday life, you care about learning and teaching. You also look for ways to feel settled and secure.

In everyday life, you look to protect what needs it. You also pay attention to the ideas that suddenly come to you.

In everyday life, you question information and sort out what holds up. You also show compassion toward others.

In everyday life, you take interest in things that aren't immediately easy to explain. You also turn ideas over and come up with new ones.

In everyday life, you may explore questions on your own. You also sometimes feel distant from others despite seeming agreeable when your need for stability grows too strong.

In everyday life, you may take an interest in mysteries and philosophy.

How you make decisions

You delay a decision while weighing the possibilities over and over. You also find it hard to change course once you've decided, and sometimes take a long time getting to that decision.

In everyday life, you may check that something holds up for yourself before acting. You may also draw on what you know and what you've checked to make careful decisions.

How you handle feelings

You take longer to get started even when there's something you want to do.

You take longer to get started even when there's something you want to do. At the same time, you want to be out in front. You also hesitate while checking once more whether it's time to act. You also feel pulled between wanting to start and wanting to hold off on a decision.

What you do well

You act quickly once you've made up your mind.

In everyday life, you may care about what is morally right. You may also favor stable conditions.

In everyday life, you may get things ready ahead of time. You may also keep to standards you know well.

In everyday life, you may reason things through logically. You may also reflect on the deeper questions behind things.

In everyday life, you may respond quickly when caught off guard. You may also seek out things you can learn.

In everyday life, you may spot openings when they appear. You may also take time to think a matter over.

In everyday life, you may think creatively and respond with wit. You may also treat people with warmth and kindness.

In everyday life, you may use intuition to get a read on things. You may also weigh choices carefully before deciding.

Where things can get harder

You keep pushing ahead even after noticing that the direction is wrong.
```

</details>

<details>
<summary>D · 활성 보호</summary>

```text
Your natural tendencies

Naturally, you push things forward. You also take the initiative and try to get ahead.

Alongside that, you show a firm sense of pride and speak up for your own views.

You may care about who holds authority and who takes the lead. You may also come up with new things.

You may exercise restraint to get through difficulty. You may also look into questions and follow them in depth.

You may make bold moves. You may also try to steer the situation directly.

The way you take interest in things that aren't immediately easy to explain helps keep another tendency working.

The way you care about acting honorably shapes the direction your actions take.

What others notice

Around other people, you apply what you know in a new setting. You also care about acting honorably.

Around other people, you challenge established ways of doing things. You also check whether things make sense.

Around other people, you pay attention to the ideas that suddenly come to you. You also question information and sort out what holds up.

Around other people, you seek stability and try to follow the rules. You also take interest in things that aren't immediately easy to explain.

Around other people, you try to renew existing ways of doing things. You also value keeping promises and looking out for the common good.

Around other people, you want to put your thoughts into words or actions.

Around other people, you may become deeply absorbed in subjects that interest you. You may also bring humor into a conversation.

Around other people, you may bring together ideas from different fields. You may also find it harder to fit into a group when your independent curiosity comes to the fore.

Around other people, you may find the words to explain what you think. You may also manage things carefully by following established steps.

Around other people, you may put the heart of a matter into sharp, clear words. You may also take a gentle, low-key approach.

Around other people, you may use new approaches without being tied to the old ones.

What comes through as people get closer

In everyday life, you act from your own standards. You also come up with new things.

In everyday life, you decide things for yourself. You also hold to what you believe.

In everyday life, you look into questions and follow them in depth. You also make bold moves.

In everyday life, you make broad use of the opportunities and resources at hand. You also move decisions into action.

In everyday life, you show feelings and opinions through words and actions. You also try to steer the situation directly.

In everyday life, you use your own thinking as a point of reference.

In everyday life, you may compete in good faith with people on equal footing. You may also give care and share your talents mostly with people close to you.

In everyday life, you may set your sights high. You may also try to hold on to your standards and protect your share.

In everyday life, you may want to try something outside the familiar.

When you have time to think on your own, you care about learning and teaching. You also look for ways to feel settled and secure.

When you have time to think on your own, you look to protect what needs it. You also pay attention to the ideas that suddenly come to you.

When you have time to think on your own, you question information and sort out what holds up. You also show compassion toward others.

When you have time to think on your own, you take interest in things that aren't immediately easy to explain. You also turn ideas over and come up with new ones.

When you have time to think on your own, you may explore questions on your own. You also sometimes feel distant from others despite seeming agreeable when your need for stability grows too strong.

When you have time to think on your own, you may take an interest in mysteries and philosophy.

Privately, you care about acting honorably. You also care about who holds authority and who takes the lead.

Privately, you check whether things make sense. You also exercise restraint to get through difficulty.

Privately, you hold yourself back when restraint is needed. You also notice how power is used and react sensitively to it.

Privately, you push back to change established ways of doing things. You also seek stability and try to follow the rules.

Privately, you value keeping promises and looking out for the common good.

Privately, you may have a strong sense of pride. You may also mix widely with people and draw a firm line when someone crosses your limits.

Privately, you may value conviction and honor. You may also value recognition that lives up to your own standards of honor.

You may give care and share your talents mostly with people close to you. You may also have a strong sense of pride.

You may mix widely with people and draw a firm line when someone crosses your limits. You may also set your sights high.

You may value conviction and honor. You may also want to try something outside the familiar.

Around other people, you may value speaking on equal terms and being treated as equals.

How you make decisions

You find it hard to change course once you've decided, and sometimes take a long time getting to that decision.

In everyday life, you may listen to advice and wait until it makes sense to you before acting. You may also weigh the practical payoff and reach a decision quickly.

When you have time to think on your own, you may check that something holds up for yourself before acting. You may also draw on what you know and what you've checked to make careful decisions.

Privately, you may judge by common sense and established procedures. You may also make decisions with a larger purpose and common goals in mind.

You may make decisions with a larger purpose and common goals in mind. You may also weigh the practical payoff and reach a decision quickly.

How you handle feelings

You may hold yourself back when restraint is needed. You may also make broad use of the opportunities and resources at hand.

You may notice how power is used and react sensitively to it. You may also push back to change established ways of doing things.

You may show feelings and opinions through words and actions.

Around other people, you may put the heart of a matter into sharp, clear words. At the same time, in private, you may check that something holds up for yourself before acting.

Around other people, you may put the heart of a matter into sharp, clear words. At the same time, in private, you may draw on what you know and what you've checked to make careful decisions.

What you do well

You act quickly once you've made up your mind.

In everyday life, you may adapt on the spot. You may also break things down to understand them.

In everyday life, you may feel things deeply and with nuance. You may also go ahead and try something bold.

In everyday life, you may grasp how things fit together in space. You may also handle situations deftly.

In everyday life, you may have an eye for art and design. You may also keep a steady sense of your own worth.

In everyday life, you may look for practical gains. You may also make quick judgments.

In everyday life, you may make things as a form of expression. You may also treat people as equals.

In everyday life, you may work together with others.

When you have time to think on your own, you may care about what is morally right. You may also favor stable conditions.

When you have time to think on your own, you may get things ready ahead of time. You may also keep to standards you know well.

When you have time to think on your own, you may reason things through logically. You may also reflect on the deeper questions behind things.

When you have time to think on your own, you may respond quickly when caught off guard. You may also seek out things you can learn.

When you have time to think on your own, you may spot openings when they appear. You may also take time to think a matter over.

When you have time to think on your own, you may think creatively and respond with wit. You may also treat people with warmth and kindness.

When you have time to think on your own, you may use intuition to get a read on things. You may also weigh choices carefully before deciding.

Around other people, you may act fairly without letting personal preferences sway you. You may also care about principles and fairness.

Around other people, you may consider what others need. You may also follow through in action on what you say.

Around other people, you may give things sincere, steady effort. You may also handle a wide variety of things with skill.

Around other people, you may keep a handle on how you act. You may also keep going through drawn-out tasks.

Around other people, you may look for ways to be of service to others. You may also reason things through logically.

Around other people, you may reflect on the deeper questions behind things. You may also respond quickly when caught off guard.

Around other people, you may show wit in the moment. You may also spot openings when they appear.

Around other people, you may take an optimistic view. You may also take time to think a matter over.

Around other people, you may use intuition to get a read on things.

Privately, you may act fairly without letting personal preferences sway you. You may also bear with things that take time.

Privately, you may care about principles and fairness. You may also follow through in action on what you say.

Privately, you may give yourself fully to people or causes. You may also keep a handle on how you act.

Privately, you may look for ways to be of service to others. You may also notice subtle details and see through to the heart of things.

Privately, you may pick things up by instinct. You may also push through difficult situations.

Privately, you may remember things well. You may also take responsibility for what you agree to do.

You may adapt on the spot. You may also bear with things that take time.

You may break things down to understand them. You may also feel things deeply and with nuance.

You may give yourself fully to people or causes. You may also go ahead and try something bold.

You may grasp how things fit together in space. You may also handle situations deftly.

You may have an eye for art and design. You may also look for practical gains.

You may make quick judgments. You may also make things as a form of expression.

You may notice subtle details and see through to the heart of things. You may also pick things up by instinct.

You may push through difficult situations. You may also remember things well.

You may take responsibility for what you agree to do.

Where things can get harder

You keep pushing ahead even after noticing that the direction is wrong. You also sometimes feel deeply unsettled when pressure to hold back your views continues.
```

</details>

<details>
<summary>G · 조건부 방해</summary>

```text
Your natural tendencies

Naturally, you push things forward. You also take the initiative and try to get ahead.

Alongside that, you show a firm sense of pride and speak up for your own views.

You may care about who holds authority and who takes the lead. You may also come up with new things.

You may exercise restraint to get through difficulty. You may also look into questions and follow them in depth.

You may make bold moves. You may also try to steer the situation directly.

You already make bold moves in everyday situations. When this response overlaps with another, it can get in the way of another part of how you respond.

The way you look into questions and follow them in depth helps another tendency come through.

The way you make bold moves shapes the direction your actions take.

What others notice

Around other people, you come up with new things. You also look into questions and follow them in depth.

Around other people, you make bold moves. You also make broad use of the opportunities and resources at hand.

Around other people, you show feelings and opinions through words and actions. You also try to steer the situation directly.

Around other people, you may keep a relaxed and hopeful outlook. You may also keep digging into subjects that interest you.

Around other people, you may keep up active contact with a wide range of people. You may also see the bigger picture and adapt as you expand what you're doing.

What comes through as people get closer

In everyday life, you act from your own standards. You also come up with new things.

In everyday life, you decide things for yourself. You also hold to what you believe.

In everyday life, you look into questions and follow them in depth. You also make bold moves.

In everyday life, you make broad use of the opportunities and resources at hand. You also move decisions into action.

In everyday life, you show feelings and opinions through words and actions. You also try to steer the situation directly.

In everyday life, you use your own thinking as a point of reference.

In everyday life, you may compete in good faith with people on equal footing. You may also give care and share your talents mostly with people close to you.

In everyday life, you may set your sights high. You may also try to hold on to your standards and protect your share.

In everyday life, you may want to try something outside the familiar.

Privately, you care about learning and teaching. You also look for ways to feel settled and secure.

Privately, you look to protect what needs it. You also make bold moves.

Privately, you make broad use of the opportunities and resources at hand. You also show compassion toward others.

Privately, you step readily into competition. You also take an active part.

Privately, you try things beyond familiar territory. You also try to steer the situation directly.

Privately, you turn ideas over and come up with new ones. You also want to earn what you're after through your own effort.

Privately, you may compete intensely or draw together firmly with your peers. You may also set your sights high.

Privately, you sometimes feel distant from others despite seeming agreeable when your need for stability grows too strong. You may also take pride in yourself.

Privately, you may want to hold on to what you have. You may also want to try something outside the familiar.

You may give care and share your talents mostly with people close to you. You may also have a strong sense of pride.

You may mix widely with people and draw a firm line when someone crosses your limits. You may also set your sights high.

You may value conviction and honor. You may also want to try something outside the familiar.

Around other people, you may give care and share your talents mostly with people close to you.

How you make decisions

You find it hard to change course once you've decided, and sometimes take a long time getting to that decision.

In everyday life, you may listen to advice and wait until it makes sense to you before acting. You may also weigh the practical payoff and reach a decision quickly.

Privately, you may draw on what you know and what you've checked to make careful decisions. You may also weigh the practical payoff and reach a decision quickly.

You may make decisions with a larger purpose and common goals in mind. You may also weigh the practical payoff and reach a decision quickly.

How you handle feelings

You may hold yourself back when restraint is needed. You may also make broad use of the opportunities and resources at hand.

You may notice how power is used and react sensitively to it. You may also push back to change established ways of doing things.

You may show feelings and opinions through words and actions.

What you do well

You act quickly once you've made up your mind.

In everyday life, you may adapt on the spot. You may also break things down to understand them.

In everyday life, you may feel things deeply and with nuance. You may also go ahead and try something bold.

In everyday life, you may grasp how things fit together in space. You may also handle situations deftly.

In everyday life, you may have an eye for art and design. You may also keep a steady sense of your own worth.

In everyday life, you may look for practical gains. You may also make quick judgments.

In everyday life, you may make things as a form of expression. You may also treat people as equals.

In everyday life, you may work together with others.

Privately, you may care about what is morally right. You may also favor stable conditions.

Privately, you may get things ready ahead of time. You may also go ahead and try something bold.

Privately, you may grasp how things fit together in space. You may also handle situations deftly.

Privately, you may hold to a goal even when the going gets hard. You may also keep to standards you know well.

Privately, you may look for practical gains. You may also look for ways to make progress.

Privately, you may make quick judgments. You may also seek out things you can learn.

Privately, you may stay determined in a contest. You may also take on challenges willingly.

Privately, you may think creatively and respond with wit. You may also treat people with warmth and kindness.

Privately, you may weigh choices carefully before deciding.

Around other people, you may adapt on the spot. You may also break things down to understand them.

Around other people, you may feel things deeply and with nuance. You may also go ahead and try something bold.

Around other people, you may grasp how things fit together in space. You may also handle situations deftly.

Around other people, you may have an eye for art and design. You may also look for practical gains.

Around other people, you may make quick judgments. You may also make things as a form of expression.

You may adapt on the spot. You may also bear with things that take time.

You may break things down to understand them. You may also feel things deeply and with nuance.

You may give yourself fully to people or causes. You may also go ahead and try something bold.

You may grasp how things fit together in space. You may also handle situations deftly.

You may have an eye for art and design. You may also look for practical gains.

You may make quick judgments. You may also make things as a form of expression.

You may notice subtle details and see through to the heart of things. You may also pick things up by instinct.

You may push through difficult situations. You may also remember things well.

You may take responsibility for what you agree to do.

Where things can get harder

You keep pushing ahead even after noticing that the direction is wrong. You also sometimes feel deeply unsettled when pressure to hold back your views continues.
```

</details>

<details>
<summary>L · 임시 현재</summary>

```text
Your natural tendencies

Naturally, you push things forward. You also take the initiative and try to get ahead.

Alongside that, you show a firm sense of pride and speak up for your own views.

The way you care about acting honorably shapes the direction your actions take.

What others notice

Around other people, you care about acting honorably. You also check whether things make sense.

Around other people, you seek stability and try to follow the rules. You also value keeping promises and looking out for the common good.

Around other people, you may manage things carefully by following established steps. You may also take a gentle, low-key approach.

What comes through as people get closer

In everyday life, you act from your own standards. You also come up with new things.

In everyday life, you decide things for yourself. You also hold to what you believe.

In everyday life, you look into questions and follow them in depth. You also make bold moves.

In everyday life, you make broad use of the opportunities and resources at hand. You also move decisions into action.

In everyday life, you show feelings and opinions through words and actions. You also try to steer the situation directly.

In everyday life, you use your own thinking as a point of reference.

In everyday life, you may compete in good faith with people on equal footing. You may also give care and share your talents mostly with people close to you.

In everyday life, you may set your sights high. You may also try to hold on to your standards and protect your share.

In everyday life, you may want to try something outside the familiar.

Privately, you care about acting honorably. You also care about who holds authority and who takes the lead.

Privately, you check whether things make sense. You also exercise restraint to get through difficulty.

Privately, you hold yourself back when restraint is needed. You also notice how power is used and react sensitively to it.

Privately, you push back to change established ways of doing things. You also seek stability and try to follow the rules.

Privately, you value keeping promises and looking out for the common good.

Privately, you may have a strong sense of pride. You may also mix widely with people and draw a firm line when someone crosses your limits.

Privately, you may value conviction and honor. You may also value recognition that lives up to your own standards of honor.

How you make decisions

You find it hard to change course once you've decided, and sometimes take a long time getting to that decision.

In everyday life, you may listen to advice and wait until it makes sense to you before acting. You may also weigh the practical payoff and reach a decision quickly.

Privately, you may judge by common sense and established procedures. You may also make decisions with a larger purpose and common goals in mind.

What you do well

You act quickly once you've made up your mind.

In everyday life, you may adapt on the spot. You may also break things down to understand them.

In everyday life, you may feel things deeply and with nuance. You may also go ahead and try something bold.

In everyday life, you may grasp how things fit together in space. You may also handle situations deftly.

In everyday life, you may have an eye for art and design. You may also keep a steady sense of your own worth.

In everyday life, you may look for practical gains. You may also make quick judgments.

In everyday life, you may make things as a form of expression. You may also treat people as equals.

In everyday life, you may work together with others.

Privately, you may act fairly without letting personal preferences sway you. You may also bear with things that take time.

Privately, you may care about principles and fairness. You may also follow through in action on what you say.

Privately, you may give yourself fully to people or causes. You may also keep a handle on how you act.

Privately, you may look for ways to be of service to others. You may also notice subtle details and see through to the heart of things.

Privately, you may pick things up by instinct. You may also push through difficult situations.

Privately, you may remember things well. You may also take responsibility for what you agree to do.

Around other people, you may act fairly without letting personal preferences sway you. You may also care about principles and fairness.

Around other people, you may follow through in action on what you say. You may also keep a handle on how you act.

Around other people, you may look for ways to be of service to others.

Where things can get harder

You keep pushing ahead even after noticing that the direction is wrong. You also sometimes feel deeply unsettled when pressure to hold back your views continues.

What comes through right now

Right now, around other people, you may apply what you know in a new setting. You may also bring humor into a conversation.

Right now, around other people, you may bring together ideas from different fields. You may also challenge established ways of doing things.

Right now, around other people, you may find the words to explain what you think. You may also put the heart of a matter into sharp, clear words.

Right now, around other people, you may try to renew existing ways of doing things. You may also use new approaches without being tied to the old ones.

Right now, around other people, you may want to put your thoughts into words or actions.

Right now, in private, as part of a familiar response, you may care about who holds authority and who takes the lead. As part of a familiar response, you may also come up with new things.

Right now, in private, as part of a familiar response, you may exercise restraint to get through difficulty. As part of a familiar response, you may also have a strong sense of pride.

Right now, in private, as part of a familiar response, you may hold yourself back when restraint is needed. As part of a familiar response, you may also look into questions and follow them in depth.

Right now, in private, as part of a familiar response, you may make bold moves. As part of a familiar response, you may also make broad use of the opportunities and resources at hand.

Right now, in private, as part of a familiar response, you may make decisions with a larger purpose and common goals in mind. As part of a familiar response, you may also notice how power is used and react sensitively to it.

Right now, in private, as part of a familiar response, you may push back to change established ways of doing things. As part of a familiar response, you may also set your sights high.

Right now, in private, as part of a familiar response, you may show feelings and opinions through words and actions. As part of a familiar response, you may also try to steer the situation directly.

Right now, in private, as part of a familiar response, you may value conviction and honor. As part of a familiar response, you may also want to try something outside the familiar.

Right now, in private, as part of a familiar response, you may weigh the practical payoff and reach a decision quickly.
```

</details>

<details>
<summary>O · 출생 시각 미정</summary>

```text
Your natural tendencies

Naturally, you push things forward. You also take the initiative and try to get ahead.

Alongside that, you show a firm sense of pride and speak up for your own views.

You may care about who holds authority and who takes the lead. You may also come up with new things.

You may exercise restraint to get through difficulty. You may also look into questions and follow them in depth.

You may make bold moves. You may also try to steer the situation directly.

The way you care about acting honorably shapes the direction your actions take.

What others notice

Around other people, you apply what you know in a new setting. You also care about acting honorably.

Around other people, you challenge established ways of doing things. You also check whether things make sense.

Around other people, you seek stability and try to follow the rules. You also try to renew existing ways of doing things.

Around other people, you value keeping promises and looking out for the common good. You also want to put your thoughts into words or actions.

Around other people, you may bring humor into a conversation. You may also bring together ideas from different fields.

Around other people, you may find the words to explain what you think. You may also manage things carefully by following established steps.

Around other people, you may put the heart of a matter into sharp, clear words. You may also take a gentle, low-key approach.

Around other people, you may use new approaches without being tied to the old ones.

What comes through as people get closer

In everyday life, you act from your own standards. You also come up with new things.

In everyday life, you decide things for yourself. You also hold to what you believe.

In everyday life, you look into questions and follow them in depth. You also make bold moves.

In everyday life, you make broad use of the opportunities and resources at hand. You also move decisions into action.

In everyday life, you show feelings and opinions through words and actions. You also try to steer the situation directly.

In everyday life, you use your own thinking as a point of reference.

In everyday life, you may compete in good faith with people on equal footing. You may also give care and share your talents mostly with people close to you.

In everyday life, you may set your sights high. You may also try to hold on to your standards and protect your share.

In everyday life, you may want to try something outside the familiar.

Privately, you care about acting honorably. You also care about who holds authority and who takes the lead.

Privately, you check whether things make sense. You also exercise restraint to get through difficulty.

Privately, you hold yourself back when restraint is needed. You also notice how power is used and react sensitively to it.

Privately, you push back to change established ways of doing things. You also seek stability and try to follow the rules.

Privately, you value keeping promises and looking out for the common good.

Privately, you may have a strong sense of pride. You may also mix widely with people and draw a firm line when someone crosses your limits.

Privately, you may value conviction and honor. You may also value recognition that lives up to your own standards of honor.

You may give care and share your talents mostly with people close to you. You may also have a strong sense of pride.

You may mix widely with people and draw a firm line when someone crosses your limits. You may also set your sights high.

You may value conviction and honor. You may also want to try something outside the familiar.

Around other people, you may value speaking on equal terms and being treated as equals.

How you make decisions

You find it hard to change course once you've decided, and sometimes take a long time getting to that decision.

In everyday life, you may listen to advice and wait until it makes sense to you before acting. You may also weigh the practical payoff and reach a decision quickly.

Privately, you may judge by common sense and established procedures. You may also make decisions with a larger purpose and common goals in mind.

You may make decisions with a larger purpose and common goals in mind. You may also weigh the practical payoff and reach a decision quickly.

How you handle feelings

You may hold yourself back when restraint is needed. You may also make broad use of the opportunities and resources at hand.

You may notice how power is used and react sensitively to it. You may also push back to change established ways of doing things.

You may show feelings and opinions through words and actions.

What you do well

You act quickly once you've made up your mind.

In everyday life, you may adapt on the spot. You may also break things down to understand them.

In everyday life, you may feel things deeply and with nuance. You may also go ahead and try something bold.

In everyday life, you may grasp how things fit together in space. You may also handle situations deftly.

In everyday life, you may have an eye for art and design. You may also keep a steady sense of your own worth.

In everyday life, you may look for practical gains. You may also make quick judgments.

In everyday life, you may make things as a form of expression. You may also treat people as equals.

In everyday life, you may work together with others.

Privately, you may act fairly without letting personal preferences sway you. You may also bear with things that take time.

Privately, you may care about principles and fairness. You may also follow through in action on what you say.

Privately, you may give yourself fully to people or causes. You may also keep a handle on how you act.

Privately, you may look for ways to be of service to others. You may also notice subtle details and see through to the heart of things.

Privately, you may pick things up by instinct. You may also push through difficult situations.

Privately, you may remember things well. You may also take responsibility for what you agree to do.

Around other people, you may act fairly without letting personal preferences sway you. You may also care about principles and fairness.

Around other people, you may consider what others need. You may also follow through in action on what you say.

Around other people, you may give things sincere, steady effort. You may also handle a wide variety of things with skill.

Around other people, you may keep a handle on how you act. You may also keep going through drawn-out tasks.

Around other people, you may look for ways to be of service to others. You may also respond quickly when caught off guard.

Around other people, you may show wit in the moment. You may also take an optimistic view.

You may adapt on the spot. You may also bear with things that take time.

You may break things down to understand them. You may also feel things deeply and with nuance.

You may give yourself fully to people or causes. You may also go ahead and try something bold.

You may grasp how things fit together in space. You may also handle situations deftly.

You may have an eye for art and design. You may also look for practical gains.

You may make quick judgments. You may also make things as a form of expression.

You may notice subtle details and see through to the heart of things. You may also pick things up by instinct.

You may push through difficult situations. You may also remember things well.

You may take responsibility for what you agree to do.

Where things can get harder

You keep pushing ahead even after noticing that the direction is wrong. You also sometimes feel deeply unsettled when pressure to hold back your views continues.

The way you apply what you know in a new setting is getting in the way of another part of how you respond.
```

</details>
