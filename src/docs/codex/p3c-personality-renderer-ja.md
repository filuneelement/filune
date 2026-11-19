# FILUNE Codex P3-C
## 일본어 Personality Renderer 구현

한국어 Personality Renderer와 의미 감사가 완료되었다.

현재 상태:

```text
P2-A ~ P2-G PASS
P3-A PASS
P3-B PASS

READY_FOR_MULTILINGUAL_PERSONALITY_RENDERER

Judgment 35/35 PASS
FAIL 0
PARTIAL 0
```

이번 단계에서는 **새 Personality Engine을 만들지 않는다.**

기존 공통 Personality Engine의 동일한 내부 결과를 입력으로 받아:

```text
PersonalityResult
↓
Japanese Renderer
↓
Japanese Customer Text
```

만 구현한다.

---

# 1. 절대 구조

FILUNE Personality는 하나의 공통 엔진을 사용한다.

```text
                 ┌─ KO Renderer
PersonalityResult├─ JA Renderer
                 └─ EN Renderer
```

금지:

```text
JapanesePersonalityEngine
JapaneseTenGodEngine
JapaneseLuckPersonalityEngine
JapaneseStructuralRoleEngine
```

---

# 2. 한국어 완성문 번역 금지

절대 다음 구조로 구현하지 않는다.

```text
PersonalityResult
→ KO Renderer
→ Korean text
→ Japanese translation
```

반드시:

```text
PersonalityResult
→ JA Renderer
```

직접 연결한다.

---

# 3. 판정 동일성

한국어·일본어 Renderer는 동일한 내부 입력에서
**동일한 Personality 의미**를 표현해야 한다.

언어별로 달라질 수 있는 것은:

```text
문체
어순
호칭
자연스러운 표현
확정/조건부 어미
문장 리듬
```

뿐이다.

다음은 달라지면 안 된다.

```text
PersonalityFact
Conflict
StructuralRoleModifier
CurrentPersonalityFact
certainty
Natal / Current 구분
expiry
```

---

# 4. 최우선 자료

우선 저장소에서 다음 제목의 문서를 찾아 실제 경로를 확인한다.

```text
FILUNE 일본어·영어 명리 용어 표준과 고객 표현 기준
```

찾은 실제 경로를 결과 보고서에 기록한다.

이 문서가 일본어 Renderer의 localization 기준이다.

함께 사용:

```text
src/docs/source/authority/B_rev38.md
src/docs/rules/authority/mapping-B-rendering.md
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

그리고 현재 한국어 Renderer:

```text
src/lib/personality/render/ko/
```

는 **구조 참고용**으로만 사용한다.

한국어 완성문을 일본어로 번역하지 않는다.

---

# 5. Localization source가 없을 경우

위 일본어·영어 표현 기준 문서를 저장소에서 찾지 못하면
일반 일본어 지식으로 규칙을 새로 만들지 않는다.

다음으로 보고한다.

```text
SOURCE_MISSING
```

그리고 구현 범위를 멈춘다.

---

# 6. 일본어 기본 문체

고객용 일본어는 현대적이고 자연스러운 구어체를 사용한다.

기본:

```text
やわらかいタメ口
```

허용 예:

```text
〜だよ
〜なんだ
〜している
〜しやすい
〜こともある
〜してみて
```

---

# 7. 지나친 캐릭터 말투 금지

다음과 같이 성별·캐릭터성이 강한 어미를 쓰지 않는다.

```text
〜だぜ
〜だぞ
〜だわ
〜のよ
```

---

# 8. 점술체 금지

고객 본문에서 다음과 같은 고풍 점술 문체를 쓰지 않는다.

```text
〜であろう
〜なり
〜すべし
〜と出ております
```

또한:

```text
宿命
天中殺
空亡
大吉
凶運
```

같은 공포·점술 어휘를 고객 Personality 문장에 쓰지 않는다.

---

# 9. 호칭

금지:

```text
あなた
君
お前
```

주어를 생략하는 것을 우선한다.

필요할 때만:

```text
この命式
生まれ持った命式
```

등 localization 기준에서 허용된 표현을 쓴다.

---

# 10. 이름

이름 사용이 필요한 위치에서는:

```text
{名前}さん
```

형태를 사용한다.

금지:

```text
様
ちゃん
君
```

단 Personality Renderer 자체에서는 이름을 기계적으로 반복하지 않는다.

---

# 11. 일본어에서는 일반 한자 허용

한국어 Renderer와 달리:

```text
考え方
判断
人間関係
気持ち
```

같은 일반 일본어 한자는 정상적으로 사용한다.

따라서 **일본어 전체 한자를 금지하는 guardrail을 만들지 않는다.**

---

# 12. 명리 한자 용어는 금지

고객 Personality 본문에는 다음과 같은 명리 전문어를 노출하지 않는다.

```text
比肩
劫財
食神
傷官
正財
偏財
正官
偏官
印綬
偏印

用神
相神
病
救応

天干
地支
通変星
十二運
身強
身弱
五行
月令
```

일반 일본어 한자 사용과 명리 전문 한자 노출을 구분한다.

---

# 13. 내부 전문용어와 고객 표현 분리

내부 코드·로그에서는 기존 glossary 고정어를 사용할 수 있다.

고객 본문에서는 전문용어 대신
PersonalityResult가 가진 실제 의미를 자연스러운 일본어로 풀어 쓴다.

---

# 14. Renderer는 새로운 판단을 하지 않는다

금지:

```text
TenGod 이름
→ 일본 명리 관행으로 별도 성격 부여

Role 이름
→ 일본식 희신/기신 해석 추가

DayPillar
→ 일본 四柱推命 자료에서 성격 보충
```

---

# 15. 일본 자료의 역할

외부 또는 localization 자료는:

```text
용어 선택
문장 자연성
고객 표현
```

에만 사용한다.

해석 규칙은 기존 공통 Personality Engine만 사용한다.

---

# 16. 권장 공개 함수

```ts
renderPersonalityJa({
  natal,
  current?,
  name?,
  mode?
})
```

또는 기존 KO Renderer와 동일한 입력 계약을 재사용한다.

---

# 17. 가능하면 공통 Render Input 사용

KO와 JA가 서로 다른 Personality 입력 타입을 만들지 않는다.

권장:

```ts
PersonalityRenderInput
```

하나를 공유.

---

# 18. 공통 semantic layer

가능하면 다음 계층을 언어 공통으로 둔다.

```text
PersonalityResult
↓
Render Semantic Blocks
↓
KO wording / JA wording
```

단 현재 KO Renderer 구조를 대규모 재작성하지 않는다.

필요 최소 범위만 공통화한다.

---

# 19. 한국어 문자열 parser 금지

금지:

```ts
if (koreanText.includes("독립"))
```

같은 방식으로 일본어 의미를 결정하는 구현.

JA Renderer는:

```text
Fact type
trait identity/content
position
modifier operation
status
conflict
```

을 읽어야 한다.

---

# 20. 가능하면 trait identity 사용

현재 Knowledge에 stable trait ID가 존재한다면 그것을 우선 사용한다.

한국어 normalized trait 문자열만 존재한다면
이번 단계에서 전체 P2 Knowledge를 다시 설계하지 않는다.

단 결과 보고서에:

```text
language-neutral trait identity coverage
```

를 별도 보고한다.

---

# 21. 한국어 Renderer 의미 계약 재사용

P3-B에서 확정한 다음 의미 계약은 JA에도 동일하게 적용한다.

```text
supports_expression
channels_expression
restrains_expression
distorts_expression
protects_expression
resolves_tension
contextualizes
```

언어만 일본어로 바꾼다.

---

# 22. 역할명이 아니라 operation을 렌더링

금지:

```text
YongShen이면 좋은 문장
Byeong이면 나쁜 문장
```

JA Renderer도:

```text
operation
status
target PersonalityFact
```

를 기준으로 문장을 만든다.

---

# 23. 확정 판단

내부 상태가:

```text
confirmed
operating
```

이면 일본어에서 현재 작동을 분명하게 표현한다.

예시 어미:

```text
〜だよ
〜なんだ
〜している
```

---

# 24. 확정을 흐리지 않는다

금지:

```text
confirmed
→ 〜かもしれない
→ 〜こともあるかも
```

확정 의미를 가능성으로 낮추지 않는다.

---

# 25. 조건부 판단

내부 상태가:

```text
contextual
conditional
```

이면:

```text
〜しやすい
〜なら
〜ときは
〜こともある
```

등을 사용한다.

---

# 26. 조건부를 확정으로 올리지 않는다

금지:

```text
必ず
絶対
間違いなく
いつも
```

---

# 27. reduced

`reduced` 상태는 작용 자체가 사라진 것이 아니다.

고객 문장도:

```text
少し弱まりやすい
前ほど前面には出ていない
働きは弱まっている
```

등 입력 의미에 맞는 약화 표현을 사용한다.

새 강도 수치는 만들지 않는다.

---

# 28. inactive

`inactive` effect는 현재 Personality 본문의 활성 성향으로 출력하지 않는다.

History/provenance에만 남긴다.

---

# 29. Natal Personality

원국 Personality는:

```text
生まれ持った傾向
もともとの考え方
基本の反応
```

등 자연스러운 일본어로 표현 가능.

운 temporary expression과 섞지 않는다.

---

# 30. Current Personality

운에 의해 현재만 드러나는 성향은:

```text
今は
この時期は
今の流れでは
```

등 현재 맥락으로 표현한다.

---

# 31. Current를 본성으로 만들지 않는다

금지:

```text
temporary current fact
→ もともと〜な人なんだ
```

---

# 32. Current와 Natal 동일 trait

둘이 같은 의미를 지지하면 문장을 두 번 반복하지 않는다.

가능:

```text
もともと自分で決めようとするところがあるんだ。
今はその面が、いつもより外に出やすいよ。
```

처럼 base + current amplification context로 표현할 수 있다.

단 실제 입력이 이를 지원할 때만.

---

# 33. expired effect

만료된 Current effect는 현재 고객 본문에 출력하지 않는다.

---

# 34. History는 사건이 아니다

과거 Personality history로부터:

```text
以前、人間関係で問題があった
仕事で衝突した
```

같은 사건을 생성하지 않는다.

---

# 35. Personality 기본 출력 영역

KO와 동일 의미 구조를 유지한다.

최소:

```text
外から見えやすい面
親しくなると見えてくる面
判断のしかた
気持ちの扱い方
```

일본어 제목/표현은 자연스럽게 조정 가능.

---

# 36. 제목을 직역할 필요 없음

한국어:

```text
겉으로 보이는 모습
```

을 반드시 단어 대 단어로 번역할 필요는 없다.

일본어 사용자에게 자연스럽게:

```text
外から見えやすいところ
表に出やすい面
```

등으로 표현 가능.

의미만 같아야 한다.

---

# 37. Position 의미

내부:

```text
outward/social
```

은 일본어에서 외부·사회적 표현으로.

```text
inner/decision/private
```

은 내면·판단·사적 맥락으로 유지한다.

---

# 38. Position으로 새 성격 생성 금지

금지:

```text
branch
→ 控えめ

stem
→ 積極的
```

같은 일본식 일반화.

위치는 기존 Fact가 **어디에서 드러나는지**만 바꾼다.

---

# 39. Conflict

상반된 성향을 한쪽으로 해결하지 않는다.

예:

```text
表では決断が早いけれど、
自分の中では一度立ち止まって考える面もあるんだ。
```

처럼 맥락별 공존으로 표현 가능.

---

# 40. Conflict를 부정적으로 낙인찍지 않는다

금지:

```text
矛盾した性格
二重人格
裏表がある
```

---

# 41. DayPillar

DayPillar Modifier는 보조 역할이다.

전체 성격을 일주 하나로 단정하지 않는다.

---

# 42. 일주 원자료의 배우자·재물·건강 정보 재유입 금지

JA Renderer가 일본 명리 표현에 익숙하다는 이유로:

```text
配偶者運
結婚運
金運
健康運
```

등을 Personality에 추가하면 FAIL.

---

# 43. Strong/Shadow 양면

내부에 strength와 caution 근거가 모두 있으면
일본어에서도 두 방향을 보존한다.

예:

```text
決断の早さは動きやすさにつながるよ。
ただ、急いでいるときは結論を早く出しすぎることもあるんだ。
```

단 양쪽 근거가 실제 있을 때만.

---

# 44. 자동 장단점 세트 금지

근거 없이:

```text
長所
短所
```

를 기계적으로 짝지어 만들지 않는다.

---

# 45. StructuralRoleModifier — supports_expression

의미:

```text
既存の傾向が働くのを支える
```

정도로 유지.

금지:

```text
人生の判断基準
最も大切な価値観
```

등 P3-B에서 이미 제거한 의미 확대.

---

# 46. channels_expression

기존 성향이 특정 방향으로 쓰인다는 의미만 유지한다.

새 Personality trait로 바꾸지 않는다.

---

# 47. restrains_expression

기존 성향이나 기능을 누르거나 제한하는 작용을 표현한다.

confirmed라면 현재형.

contextual이라면 조건부.

---

# 48. distorts_expression

기존 성향이 특정 상황에서 불편한 방향으로 작동하는 의미.

금지:

```text
性格が悪い
欠陥がある
問題のある人
```

---

# 49. protects_expression

필요한 성향/기능을 받쳐 주는 의미.

금지:

```text
最大の長所
最強の性格
```

---

# 50. resolves_tension

특정 긴장을 완화하는 의미.

금지:

```text
全部解決する
完全にバランスが取れる
```

---

# 51. Protective Standby

아직 실제 작동 중이 아니라면:

```text
必要なときに支えになりやすい
```

같은 조건부 의미.

금지:

```text
いつも支えている
```

---

# 52. ConditionalByeong

핵심 의미를 생략하지 않는다.

반드시:

```text
특정 조건
+
어떤 성향/기능을 방해할 수 있음
```

의 두 요소를 유지한다.

일본어 예시 구조:

```text
状況が重なると、
この面が別の働きを抑えるほうに出ることもあるんだ。
```

실제 target 의미에 맞게 생성한다.

---

# 53. confirmed interference

현재 실제 방해 기능이 작동 중이면:

```text
今は、この面が別の働きを抑える方向に動いているんだ。
```

처럼 현재형을 사용한다.

가능성으로 약화하지 않는다.

---

# 54. GuEung

Role 이름은 숨긴다.

실제 `resolves_tension` 의미만 고객 언어로 표현한다.

---

# 55. No-Byeong

문제 역할이 없는 입력에서
읽을거리를 만들기 위해 인위적 caution을 추가하지 않는다.

---

# 56. 명리 용어 guardrail

고객 일본어 text에서 최소 다음을 검사한다.

```text
用神
相神
救応
比肩
劫財
食神
傷官
正財
偏財
正官
偏官
印綬
偏印
月令
通変星
十二運
身強
身弱
五行
```

0건.

---

# 57. 전문 간지 노출

Personality 본문에서:

```text
甲
乙
丙
丁
戊
己
庚
辛
壬
癸

子丑寅卯...
```

를 성격 설명용 전문 기호로 직접 노출하지 않는다.

---

# 58. 호칭 guardrail

고객 본문:

```text
あなた
君
お前
```

0건.

단 일본어 일반 문장의 `君`이 다른 한자어 일부로 등장하는 false positive를 구분한다.

---

# 59. 점술체 guardrail

최소:

```text
〜であろう
〜なり
〜すべし
宿命
天中殺
空亡
大吉
凶運
```

0건.

---

# 60. 공포 표현 금지

금지:

```text
破滅
災い
危険
不幸が訪れる
```

---

# 61. 사건 단정 금지

금지:

```text
転職したでしょう
別れたはず
覚えてる？
実際に〜した
```

고객이 제공하지 않은 사건을 만들지 않는다.

---

# 62. 생활상태 단정 금지

고객이 알려주지 않았다면:

```text
夫
妻
子ども
会社
上司
```

가 실제 생활 전제로 나오지 않아야 한다.

Personality 일반 관계 표현은 가능.

---

# 63. 건강 추정 금지

금지:

```text
痛む
こる
張る
詰まる
病院
検診
```

등 신체 증상·의료 조언을 Personality에서 생성하지 않는다.

---

# 64. 점수·확률 금지

금지:

```text
％
点
確率
ランク
★
```

---

# 65. Prominence

현재:

```text
Prominence = deferred
```

유지.

따라서:

```text
一番強い
最も目立つ
圧倒的に
```

등 임의 ranking 표현을 추가하지 않는다.

---

# 66. 문장 길이

Localization 기준의:

```text
한 문장 40자 안팎
한 문단 3문장 안팎
```

을 **자연성 가이드**로 적용한다.

이를 강제 글자수 threshold로 만들어
의미를 잘라내지 않는다.

---

# 67. 구두점

일본어 고객 문장은 전각 구두점을 사용한다.

```text
、
。
```

---

# 68. 숫자

숫자가 필요할 경우 산용 숫자를 사용한다.

Personality 본문에서 점수화 용도로는 쓰지 않는다.

---

# 69. 외래어 남용 금지

다음 표현을 기계적으로 남용하지 않는다.

```text
エネルギー
パワー
チャンス
```

자연스러운 일본어를 우선한다.

---

# 70. Renderer code 위치

권장:

```text
src/lib/personality/render/
├─ ko/
├─ ja/
│  ├─ renderPersonalityJa.ts
│  ├─ wording.ts
│  └─ guardrails.ts
└─ types.ts
```

---

# 71. 한국어 Renderer 변경 최소화

JA 구현을 위해 KO 문장 의미 계약을 다시 바꾸지 않는다.

공통 타입 추출 등 필요한 최소 리팩터링은 허용한다.

---

# 72. Judgment 수정 금지

```text
src/lib/judgment/
```

수정 0건.

---

# 73. Knowledge 수정 금지

원칙적으로:

```text
DayStemProfile
TenGodProfile
DayPillarProfile
PositionRules
```

변경하지 않는다.

---

# 74. Personality Engine semantics 변경 금지

P2-D~G 결과의 의미를 일본어에 맞추기 위해 변경하지 않는다.

---

# 75. JA Renderer가 Judgment 직접 읽지 않음

금지:

```text
JA Renderer
→ JudgmentResult 직접 참조
```

반드시 Personality Renderer input을 사용한다.

---

# 76. JA Renderer가 KO Renderer를 호출하지 않음

BLOCKING:

```text
renderPersonalityJa()
→ renderPersonalityKo()
```

0건.

---

# 77. Japanese wording dictionary

언어별 wording map은 허용한다.

예:

```text
trait semantic identity
→ Japanese customer phrase
```

그러나 새로운 명리 판단 map을 만들지 않는다.

---

# 78. 안정적 출력

동일 PersonalityResult는 항상 동일 JA text를 생성해야 한다.

LLM runtime 호출 금지.

---

# 79. 입력 순서 독립성

Fact 배열 순서가 달라도 의미 결과는 동일해야 한다.

---

# 80. 대표 테스트 A
## Simple Natal

기본 원국 성격.

Expected:

```text
자연스러운 일본어
전문용어 없음
Natal meaning 보존
```

---

# 81. 테스트 B
## Outward / Inner

서로 다른 outward와 inner trait.

Expected:

두 맥락을 구분해 표현.

---

# 82. 테스트 C
## Conflict

상반된 성향 공존.

Expected:

양쪽 유지.

금지:

```text
矛盾した性格
裏表がある
```

---

# 83. 테스트 D
## DayPillar modifier

DayPillar 고유 성향은 보조로 추가.

base overwrite 없음.

---

# 84. 테스트 E
## supports_expression

P3-B에서 고친 계약 재검증.

Expected:

```text
지원 의미
```

존재.

금지:

```text
選択の基準
人生の価値観
```

새 의미.

---

# 85. 테스트 F
## Conditional interference

Expected:

```text
조건부
+
실제 방해 작용 의미
```

둘 다 존재.

---

# 86. 테스트 G
## Confirmed interference

Expected:

현재 작동형 일본어.

가능성으로 약화하지 않음.

---

# 87. 테스트 H
## Protective Standby

Expected:

조건부/대기 의미.

active로 표현하지 않음.

---

# 88. 테스트 I
## GuEung

실제 tension relief 의미 보존.

generic positive personality 금지.

---

# 89. 테스트 J
## No-Byeong

근거 없는 caution 생성 0.

---

# 90. 테스트 K
## Current temporary

Expected:

```text
今は
この時期は
```

등 current 맥락.

Natal로 승격 금지.

---

# 91. 테스트 L
## Expired

expired effect customer output = 0.

---

# 92. 테스트 M
## Unknown hour

hour-derived sentence = 0.

---

# 93. 테스트 N
## SOURCE_GAP

no crash.

generic filler personality = 0.

---

# 94. 테스트 O
## 戊午

canonical PersonalityResult만 사용.

source conflict 자체를 고객에게 노출하지 않는다.

---

# 95. 테스트 P
## KO/JA semantic parity

동일 PersonalityResult를:

```text
renderPersonalityKo()
renderPersonalityJa()
```

양쪽에 넣는다.

문장 번역 일치는 요구하지 않는다.

대신 내부 provenance 기준으로:

```text
Fact coverage
Modifier coverage
Conflict coverage
certainty
Natal/Current state
```

가 일치하는지 검사한다.

---

# 96. semantic parity에서 금지

금지:

```text
koText === jaText 번역 대응
```

문자열 기반 비교.

ID/provenance 기반으로 비교한다.

---

# 97. Provenance

JA 고객 block도 최소:

```text
sourceFactIds
sourceModifierIds
sourceConflictIds
```

를 추적 가능하게 한다.

---

# 98. Renderer 결과 타입

가능하면 KO와 동일한 공통 block 타입을 사용한다.

```ts
RenderedPersonalityBlock
```

에 locale별 text만 다르게 저장.

---

# 99. 신규 validation

권장:

```text
scripts/verify-personality-renderer-ja-p3c.mjs
```

---

# 100. 필수 자동검증

최소:

```text
A. direct PersonalityResult input
B. KO renderer dependency = 0
C. Judgment direct dependency = 0
D. 명리 전문어 = 0
E. 금지 호칭 = 0
F. 점술체 = 0
G. 점수/확률 = 0
H. 사건 예측 = 0
I. 건강 추정 = 0
J. conditional certainty 보존
K. confirmed certainty 보존
L. conflict 양쪽 보존
M. Natal/Current 분리
N. expired 출력 0
O. deterministic
P. KO/JA semantic provenance parity
```

---

# 101. 기존 회귀

반드시:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS
P2-F PASS
P2-G PASS

P3-A PASS
P3-B PASS
```

---

# 102. Judgment 회귀

```text
35/35 PASS
```

유지.

---

# 103. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 104. 결과 파일

```text
src/docs/codex/p3c-personality-renderer-ja-result.md
```

---

# 105. 최종 보고

## A. 전체 판정

```text
READY_FOR_PERSONALITY_RENDERER_JA_AUDIT
```

또는:

```text
P3C_FIX_REQUIRED
```

---

## B. Architecture

```text
Personality Engine count:
JA separate engine created:
JA → KO renderer dependency:
JA → Judgment direct dependency:
```

Expected:

```text
Personality Engine count = 1
JA separate engine = no
JA → KO = no
JA → Judgment = no
```

---

## C. Coverage

| 영역 | KO provenance | JA provenance | parity |
|---|---:|---:|---|
| outward | | | |
| inner | | | |
| decision | | | |
| emotion | | | |
| strengths | | | |
| cautions | | | |
| conflicts | | | |
| current | | | |

---

## D. Japanese Guardrails

```text
명리 전문용어:
금지 호칭:
점술체:
공포 표현:
사건 단정:
생활 상태 단정:
건강 추정:
점수/확률:
근거 없는 의미:
```

모두 0을 목표로 한다.

---

## E. Certainty

```text
confirmed → assertive:
contextual → conditional:
reduced → weakened:
inactive → current omitted:
```

각 테스트 결과 보고.

---

## F. Semantic parity

```text
KO/JA Fact mismatch:
KO/JA Modifier mismatch:
KO/JA Conflict mismatch:
KO/JA certainty mismatch:
KO/JA Natal/Current mismatch:
```

모두 0이어야 한다.

문장 자체는 동일 번역일 필요 없음.

---

## G. Regression

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

Judgment:
tsc:
build:
```

---

## H. 남은 상태

```text
FAIL:
PARTIAL:
UNSUPPORTED:
OVERSTATEMENT:
DEFERRED:
SOURCE_MISSING:
NOT_IMPLEMENTED:
```

---

# 106. 종료 조건

다음이면:

```text
READY_FOR_PERSONALITY_RENDERER_JA_AUDIT
```

판정한다.

```text
[ ] 공통 Personality Engine 1개 유지
[ ] Japanese 별도 판단 엔진 없음
[ ] KO text 중역 없음
[ ] PersonalityResult 직접 입력
[ ] KO/JA provenance parity
[ ] confirmed/conditional 구분 유지
[ ] Natal/Current 구분 유지
[ ] expired 출력 0
[ ] conflict 양쪽 보존
[ ] 명리 전문용어 노출 0
[ ] あなた・君・お前 0
[ ] 고풍 점술체 0
[ ] 사건·건강 단정 0
[ ] 점수·확률·랭크 0
[ ] 근거 없는 의미 0
[ ] P2-A~G PASS
[ ] P3-A/B/C PASS
[ ] Judgment 35/35 PASS
[ ] tsc/build PASS
```

---

# 107. 다음 단계

P3-C 구현이 통과해도 바로 영어로 넘어가지 않는다.

먼저 일본어 실제 출력에 대해:

```text
P3-D
Japanese Personality Renderer Semantic Audit
```

를 진행한다.

그 감사에서는 실제 대표 fixture를 일본어로 렌더링하여:

```text
Internal PersonalityResult
↔ Japanese Customer Text
```

사이의:

```text
의미 손실
일본어 부자연스러움
번역투
확정도 오류
Role 의미 확대
KO 의미와의 불일치
```

를 감사한다.

일본어 의미 계약이 고정된 뒤에 영어 Renderer로 넘어간다.