# FILUNE Codex P3-D
## 일본어 Personality Renderer 의미·자연성 감사

P3-C 일본어 Personality Renderer 구현과 Localization Authority Mapping이 완료되었다.

현재 상태:

```text
P2-A ~ P2-G PASS
P3-A PASS
P3-B PASS
P3-C 16/16 PASS

READY_FOR_JA_RENDERER_AUDIT

Personality Engine count = 1
JA separate engine = 0
JA → KO Renderer = 0
JA → Judgment direct dependency = 0

Judgment 35/35 PASS
```

이번 단계에서는 **새 판단 기능을 구현하지 않는다.**

실제 PersonalityResult를 일본어로 렌더링하여:

```text
Internal PersonalityResult
↓
Japanese Renderer
↓
Japanese Customer Text
```

사이에서 의미가 보존되는지 감사한다.

---

# 1. 최종 목표

최종 판정은 둘 중 하나다.

```text
READY_FOR_EN_PERSONALITY_RENDERER
```

또는:

```text
P3D_FIX_REQUIRED
```

---

# 2. 최우선 기준 문서

Localization:

```text
src/docs/source/localization/
FILUNE-ja-en-terminology-rendering-standard.md
```

Authority Mapping:

```text
src/docs/rules/authority/mapping-localization.md
```

Personality:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

Renderer 결과:

```text
src/docs/codex/p3c-personality-renderer-ja-result.md
```

---

# 3. 판정 기준 우선순위

감사 중 의미 충돌이 있으면:

```text
현재 authority/master
>
PersonalityResult
>
localization wording
```

순으로 본다.

Localization 문장에 맞추기 위해 Personality 판단을 변경하지 않는다.

---

# 4. 공통 엔진 재확인

반드시 다시 확인:

```text
Personality Engine = 1개
```

금지:

```text
JapanesePersonalityEngine
JapaneseTenGodEngine
JapaneseLuckEngine
```

---

# 5. Renderer 의존성

다음은 반드시 0:

```text
JA → KO Renderer
JA → Judgment direct
JA → 별도 Japanese judgment logic
```

JA는 동일한 PersonalityResult를 직접 읽어야 한다.

---

# 6. 348개 trait 사전 특별감사

P3-C 결과에 따르면 현재 언어중립 trait ID가 없고,
JA Renderer는 정규화된 내부 성향 값 **348개 전체**를 사전에서 조회한다.

이번 감사에서 반드시 이 구조를 전수 확인한다.

---

# 7. 348 coverage

확인:

```text
Personality Engine에서 생성 가능한 normalized trait
=
JA dictionary에서 처리 가능한 trait
```

전수 기준.

보고:

```text
total normalized traits:
mapped:
unmapped:
duplicate mappings:
ambiguous mappings:
```

Expected:

```text
unmapped = 0
ambiguous = 0
```

---

# 8. fallback 금지

JA 사전에 trait가 없을 때:

```text
한국어 원문 그대로 출력
generic Japanese filler
trait 삭제
```

중 어느 것도 조용히 발생하면 안 된다.

누락은:

```text
UNMAPPED_TRAIT
```

로 명시적으로 검출한다.

---

# 9. 한국어 문자열 노출 검사

고객 일본어 본문에 한국어 trait가 그대로 남으면 FAIL.

예:

```text
독립성
신중함
판단
```

등 실제 내부 한국어 표현 잔존 0건.

---

# 10. dictionary key normalization 감사

다음 차이 때문에 동일 trait가 다른 key가 되지 않는지 확인:

```text
공백
문장부호
괄호
조사
띄어쓰기
동일 의미 variant
```

하지만 의미가 다른 trait를 과도하게 합치면 안 된다.

---

# 11. dictionary collision 감사

서로 다른 내부 trait 두 개가
같은 key로 normalize되어 의미를 잃는 경우가 없는지 확인한다.

Expected:

```text
semantic collision = 0
```

---

# 12. 언어중립 ID 부재

이번 단계에서는 구조를 전면 재설계하지 않는다.

다만 결과 보고서에:

```text
TECH_DEBT:
language-neutral trait id absent
```

를 기록한다.

이것만으로 FAIL 처리하지 않는다.

단 현재 348 mapping이 불완전하면 FAIL.

---

# 13. 대표 fixture

최소 다음 17종을 실제 렌더링한다.

```text
A. Simple Natal
B. Outward / Inner difference
C. PersonalityConflict
D. DayPillar modifier
E. supports_expression
F. channels_expression
G. restrains_expression
H. distorts_expression
I. protects_expression
J. resolves_tension
K. Protective Standby SangShen
L. ConditionalByeong
M. Confirmed harmful function
N. No-Byeong
O. Current temporary expression
P. expired effect
Q. unknown hour
```

가능하면 P3-C의 기존 17 fixture를 재사용한다.

---

# 14. 추가 canonical coverage

가능하면 60일주 전체 또는
P2-B에서 사용한 canonical DayPillar 60 fixture도 렌더링한다.

목적은:

```text
일주 고유 Personality trait
→ JA dictionary coverage
```

검증이다.

---

# 15. 내부-일본어 대조

각 대표 fixture마다 최소 다음을 기록:

| Internal meaning | Japanese output | 판정 |
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

# 16. MATCH

내부 의미와 일본어 의미가 동일하고
확정도·맥락이 유지된 경우.

---

# 17. PARTIAL_LOSS

중요한 의미 일부가 빠졌지만
반대 의미가 추가되지는 않은 경우.

---

# 18. OVERSTATEMENT

예:

```text
contextual → confirmed
temporary → natal
support → core identity
```

처럼 의미가 강해진 경우.

BLOCKING.

---

# 19. UNSUPPORTED

내부 입력에 없는 의미가 일본어 고객 문장에 추가된 경우.

BLOCKING.

---

# 20. UNNATURAL

의미는 맞지만 일본어로 지나치게 번역투거나 부자연스러운 경우.

예:

```text
한국어 어순 직역
지나친 명사 나열
일본어에서는 잘 쓰지 않는 결합
```

의미 오류와 별도로 집계한다.

---

# 21. KO/JA semantic parity

같은 PersonalityResult를:

```text
renderPersonalityKo()
renderPersonalityJa()
```

에 입력한다.

문자열을 비교하지 않는다.

비교 대상:

```text
sourceFactIds
sourceModifierIds
sourceConflictIds
certainty
Natal / Current
active / contextual / reduced / inactive
```

---

# 22. provenance parity

Expected:

```text
KO Fact coverage = JA Fact coverage
KO Modifier coverage = JA Modifier coverage
KO Conflict coverage = JA Conflict coverage
```

의미적으로 누락이 없어야 한다.

---

# 23. certainty parity

확인:

```text
confirmed
contextual
reduced
inactive
```

가 KO/JA에서 같은 상태 의미로 표현되는지 본다.

---

# 24. confirmed

내부:

```text
confirmed / operating
```

일본어:

```text
〜だよ
〜なんだ
〜している
```

등 현재형/확정형.

금지:

```text
〜かもしれない
```

자동 약화.

---

# 25. contextual

내부:

```text
contextual / conditional
```

일본어:

```text
〜しやすい
〜なら
〜ときは
〜こともある
```

등 조건부.

---

# 26. reduced

작용이 존재하되 약화되었다는 의미를 유지.

금지:

```text
inactive처럼 삭제
confirmed처럼 정상 작동
```

---

# 27. inactive

현재 고객 본문에서 active effect로 표현하지 않는다.

History만 유지 가능.

---

# 28. Natal / Current

Natal:

```text
もともと
生まれ持った
基本的には
```

등의 맥락.

Current:

```text
今は
この時期は
今の流れでは
```

등 임시 맥락.

---

# 29. Current → Natal 승격 금지

temporary trait를:

```text
もともと〜なんだ
生まれつき〜
```

로 쓰면 FAIL.

---

# 30. expired effect

expired Current effect:

```text
Japanese current text = 0
```

이어야 한다.

---

# 31. Conflict 양쪽 보존

예:

```text
outward = 빠름
inner = 신중함
```

이면 둘 다 고객 문장에 남는다.

한쪽 삭제 금지.

---

# 32. Conflict 낙인 금지

금지:

```text
矛盾した性格
二重人格
裏表がある
```

---

# 33. DayPillar 보조성

DayPillar Modifier가
전체 Personality 결론을 덮어쓰지 않는지 확인한다.

---

# 34. StructuralRole 의미

각 operation의 의미를 검증한다.

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

# 35. supports_expression

지원/받침 의미만 허용.

금지:

```text
人生の判断基準
最も大切な価値観
```

---

# 36. restrains / distorts

무엇인가를 누르거나 불편한 방향으로 작동한다는 의미가 있어야 한다.

조건부인데 단순:

```text
変わることもある
```

정도로만 표현해 핵심 작용을 잃으면 PARTIAL_LOSS.

---

# 37. confirmed interference

현재 실제 방해 기능이 operating이면:

```text
현재 작동 중
```

의미를 분명하게 표현한다.

가능성으로 약화하면 FAIL.

---

# 38. Protective Standby

대기 상태를:

```text
항상 작동하는 강점
```

처럼 표현하지 않는다.

---

# 39. ConditionalByeong

최소 두 요소 유지:

```text
조건
+
방해/왜곡 작용
```

---

# 40. No-Byeong

문제 역할이 없는 경우
일본어 Renderer가 억지 caution을 만들지 않는다.

---

# 41. GuEung

generic:

```text
バランスがいい
何でも解決できる
```

로 확대하지 않는다.

실제 특정 tension 완화 의미만 유지.

---

# 42. 일본어 호칭

고객 본문:

```text
あなた
君
お前
```

0건.

Localization 원문 기준을 따른다.

---

# 43. 이름

이름이 필요한 fixture에서는:

```text
{名前}さん
```

만 허용.

금지:

```text
様
ちゃん
君
```

---

# 44. 문체

부드러운 현대 일본어 タメ口인지 확인.

허용:

```text
〜だよ
〜なんだ
〜しやすい
```

---

# 45. 성별 강한 어미 금지

```text
〜だぜ
〜だわ
〜のよ
```

0건.

---

# 46. 점술체 금지

```text
〜であろう
〜なり
〜すべし
〜と出ております
```

0건.

---

# 47. 점술 어휘 금지

```text
宿命
天中殺
空亡
大吉
凶運
```

0건.

---

# 48. 명리 전문용어 금지

고객 Personality 본문:

```text
日干
日柱
月令
天干
地支
通変星
比肩
劫財
食神
傷官
偏財
正財
偏官
正官
偏印
印綬
用神
相神
救応
```

0건.

---

# 49. 일반 일본어 한자 허용

다음은 금지하지 않는다.

```text
判断
気持ち
関係
考え方
行動
```

명리 한자와 일반 일본어 한자를 구분한다.

---

# 50. 공포 표현 금지

```text
破滅
災い
危険
不幸が訪れる
```

0건.

---

# 51. 사건 생성 금지

고객이 제공하지 않은:

```text
転職した
別れた
失敗した
成功した
```

등 과거·미래 사건 단정 0건.

---

# 52. 생활 전제 금지

고객 정보가 없는 상태에서:

```text
夫
妻
子ども
上司
会社
```

를 실제 생활 사실처럼 쓰지 않는다.

---

# 53. 건강 추정 금지

```text
痛む
こる
張る
詰まる
病院
検診
```

등 0건.

---

# 54. 점수·확률 금지

```text
％
点
確率
ランク
★
```

0건.

---

# 55. Prominence

현재:

```text
deferred
```

유지.

따라서:

```text
一番強い
最も目立つ
圧倒的
```

같은 ranking 0건.

---

# 56. 번역투 검사

다음 유형을 별도 `UNNATURAL` 후보로 본다.

```text
한국어식 주어 반복
한국어 조사 구조의 직역
명사형 나열
일본어에서 드문 인과 접속 반복
모든 문장이 〜んだ 로 끝남
```

---

# 57. 반복 어미 검사

같은 paragraph에:

```text
〜なんだ。
〜なんだ。
〜なんだ。
```

가 기계적으로 반복되는지 확인한다.

BLOCKING은 아니지만 naturalness 개선 대상.

---

# 58. 문장 길이

Localization 원문의:

```text
한 문장 40자 안팎
한 문단 3문장 안팎
```

은 자연성 가이드다.

hard threshold로 FAIL 처리하지 않는다.

의미 보존이 우선.

---

# 59. 자연성 감사

최소 6개 대표 fixture의 실제 일본어 전체 출력을 보고서에 기록한다.

추천:

```text
simple
conflict
structural role
conditional interference
current expression
unknown hour
```

---

# 60. 고객 문장 provenance

각 rendered block은:

```text
sourceFactIds
sourceModifierIds
sourceConflictIds
```

를 유지해야 한다.

고객에게 ID는 노출하지 않는다.

---

# 61. guardrail false positive 감사

P3-C에서 KO 문구 일부가
사고/사건 필터에 잘못 걸렸던 사례가 있었으므로,
JA에서도 문자열 substring 기반 guardrail이 정상 성향 문구를 잘못 제거하지 않는지 확인한다.

---

# 62. guardrail은 의미를 삭제하면 안 됨

금지어 filter에 걸렸다고
문장 전체를 조용히 버려서:

```text
Fact coverage 감소
```

하면 안 된다.

가능하면 안전한 wording으로 대체한다.

---

# 63. 348 trait 전수 guardrail 통과

348개 trait 각각을 최소 독립적으로 JA wording 처리해:

```text
guardrail false positive
unmapped
empty output
```

를 검사한다.

Expected 모두 0.

---

# 64. KO 변경 여부

P3-D 감사 중 일본어 문제를 고치기 위해
KO Renderer 의미를 변경하지 않는다.

KO 수정이 필요해 보이면 별도 보고.

---

# 65. Judgment 변경 금지

```text
src/lib/judgment/
```

수정 0.

---

# 66. Knowledge 변경 금지

```text
src/lib/personality/knowledge/
```

원칙적으로 수정 0.

---

# 67. Personality Engine 변경 금지

P2-D~G 의미를 일본어 출력 때문에 변경하지 않는다.

---

# 68. 수정 허용 범위

P3-D에서 실제 Renderer 문제가 발견되면
최소 수정 허용:

```text
src/lib/personality/render/ja/
```

필요하면 공통 render 타입.

---

# 69. 별도 엔진 생성 금지

문제를 고치기 위해 Japanese-specific judgment logic을 추가하면 FAIL.

---

# 70. 신규 audit script

권장:

```text
scripts/verify-personality-renderer-ja-audit-p3d.mjs
```

---

# 71. BLOCKING 자동검증

최소:

```text
UNMAPPED_TRAIT = 0
SEMANTIC_COLLISION = 0
UNSUPPORTED = 0
OVERSTATEMENT = 0
blocking PARTIAL_LOSS = 0

KO/JA provenance mismatch = 0
certainty mismatch = 0
Natal/Current mismatch = 0

Korean leakage = 0
internal terminology = 0
forbidden pronouns = 0
fortune-telling style = 0
event prediction = 0
health inference = 0
score/rank = 0

expired effect rendering = 0
```

---

# 72. 기존 P3-C

```text
P3-C 16/16 PASS
```

유지.

---

# 73. 기존 Personality 회귀

```text
P2-A
P2-B
P2-C
P2-D
P2-E
P2-F
P2-G

P3-A
P3-B
P3-C
```

모두 PASS.

---

# 74. Judgment 회귀

```text
35/35 PASS
```

유지.

---

# 75. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 76. 결과 파일

```text
src/docs/codex/p3d-personality-renderer-ja-audit-result.md
```

---

# 77. 최종 보고

## A. 전체 판정

```text
READY_FOR_EN_PERSONALITY_RENDERER
```

또는:

```text
P3D_FIX_REQUIRED
```

---

## B. Trait Dictionary

```text
normalized trait total:
mapped:
unmapped:
duplicate:
collision:
empty output:
guardrail false positive:
```

---

## C. Semantic Audit

```text
MATCH:
PARTIAL_LOSS:
OVERSTATEMENT:
UNSUPPORTED:
UNNATURAL:
```

---

## D. KO / JA Parity

```text
Fact mismatch:
Modifier mismatch:
Conflict mismatch:
certainty mismatch:
Natal/Current mismatch:
```

---

## E. Japanese Guardrails

```text
한국어 누출:
명리 전문용어:
あなた:
君:
お前:
고풍 점술체:
공포 표현:
사건 단정:
생활 전제:
건강 추정:
점수/확률:
Prominence ranking:
```

---

## F. Naturalness

대표 6개 fixture별:

```text
natural
acceptable
needs_revision
```

판정 및 이유.

---

## G. Architecture

```text
Personality Engine count:
JA separate engine:
JA → KO:
JA → Judgment:
language-neutral trait id:
```

현재 기대:

```text
1
no
no
no
not yet
```

---

## H. Regression

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

Judgment:
tsc:
build:
```

---

## I. 남은 상태

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

# 78. 종료 조건

다음이면:

```text
READY_FOR_EN_PERSONALITY_RENDERER
```

판정한다.

```text
[ ] 348 trait mapping 누락 0
[ ] semantic collision 0
[ ] unsupported 0
[ ] overstatement 0
[ ] blocking partial loss 0
[ ] KO/JA provenance mismatch 0
[ ] certainty mismatch 0
[ ] Natal/Current mismatch 0
[ ] expired 출력 0
[ ] 한국어 누출 0
[ ] 명리 용어 0
[ ] あなた・君・お前 0
[ ] 점술체 0
[ ] 사건·건강 단정 0
[ ] score/rank 0
[ ] 대표 출력 자연성 통과
[ ] Personality Engine 1개
[ ] JA 별도 엔진 0
[ ] JA → KO 0
[ ] JA → Judgment 0
[ ] P2/P3 기존 회귀 PASS
[ ] Judgment 35/35 PASS
[ ] tsc/build PASS
```

---

# 79. 언어중립 trait ID

현재 언어중립 trait ID 부재는 이번 P3-D의 BLOCKER로 보지 않는다.

단 다음 조건을 만족해야 한다.

```text
348 mapping complete
semantic collision 없음
deterministic lookup
```

그렇다면:

```text
TECH_DEBT
```

로만 기록한다.

영어 Renderer까지 완료한 뒤 별도 리팩터링 여부를 결정한다.

---

# 80. 다음 단계

P3-D가:

```text
READY_FOR_EN_PERSONALITY_RENDERER
```

로 끝나면 다음은:

```text
P3-E
English Personality Renderer
```

다.

영어 역시:

```text
PersonalityResult
→ EN Renderer
```

직접 연결한다.

금지:

```text
KO → EN
JA → EN
```