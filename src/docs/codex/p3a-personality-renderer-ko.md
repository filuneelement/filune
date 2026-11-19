# FILUNE Codex P3-A
## 한국어 Personality Renderer 구현

P2 Personality Engine 전체 구현과 최종 통합감사가 완료되었다.

현재 내부 파이프라인:

```text
Knowledge Layer
↓
Natal Personality
↓
StructuralRoleModifier
↓
Current Personality
↓
Personality Effect / Conflict History
```

검증 상태:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS
P2-F PASS
P2-G 18/18 PASS

Judgment 35/35 PASS
FAIL 0
PARTIAL 0
```

이번 단계에서는 처음으로 **한국어 고객용 Personality Renderer**를 구현한다.

이번 작업에서 Personality 판단을 새로 만들지 않는다.

---

# 1. 최상위 원칙

Renderer는:

```text
Internal Personality Result
→ Customer-safe Korean wording
```

만 수행한다.

금지:

```text
Renderer
→ 새로운 성격 판정
→ 새로운 명리 해석
→ 새로운 길흉
→ 새로운 사건 예측
```

---

# 2. 기준 문서

최우선:

```text
src/docs/source/authority/B_rev38.md
src/docs/rules/authority/mapping-B-rendering.md
```

Personality 기준:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

입력 엔진:

```text
buildNatalPersonality()
applyStructuralRoleModifiers()
buildCurrentPersonality()
```

---

# 3. B 문서의 역할

B는 판단 엔진이 아니다.

따라서 Renderer가 다음을 다시 판정하면 FAIL:

```text
TenGodProminence
YongShen
SangShen
Byeong
GuEung
PatternContext
ActualStructuralFunction
CurrentPersonalityFact
PersonalityConflict
```

입력값을 그대로 번역·구성한다.

---

# 4. 첫 구현 언어

이번 단계는:

```text
ko
```

만 구현한다.

아직 구현하지 않음:

```text
ja
en
```

일본어/영어는 한국어 결과를 번역하는 방식으로 구현하지 않는다.

후속 단계에서 내부 PersonalityResult를 직접 각 언어 Renderer에 연결한다.

---

# 5. 권장 공개 함수

예:

```ts
renderPersonalityKo({
  natal,
  current?,
  name?,
  mode?
})
```

또는 프로젝트 구조에 맞는 동등 API.

Renderer 입력은 이미 계산된 Personality 결과다.

---

# 6. 고객 출력과 내부 출력 분리

내부:

```text
PersonalityFact
TenGod
RoleModifier
Conflict
originScope
source IDs
```

고객:

```text
자연스러운 성격 설명
```

고객 본문에서 내부 필드명 노출 금지.

---

# 7. W-01 문체

한국어 고객 본문은:

```text
친근하고 차분한 반말
```

을 사용한다.

가능한 종결:

```text
~야
~이야
~있어
~거든
~좋아
~살펴봐
```

지나치게 가볍거나 장난스러운 말투는 피한다.

---

# 8. W-02 호칭

금지:

```text
너
네
당신
```

주어를 생략하는 방식을 우선한다.

필요하면:

```text
이 사주
타고난 사주
```

사용 가능.

이름은 기계적으로 반복하지 않는다.

---

# 9. 이름 사용

이름이 입력되어도 성격 문장마다 넣지 않는다.

이번 Personality Renderer에서는 기본적으로 이름 없이 자연스럽게 작성한다.

별도 presentation layer에서 필요한 위치에만 이름을 삽입할 수 있도록 한다.

---

# 10. W-03 명리 용어 금지

고객 본문에서 다음과 같은 내부 용어를 그대로 쓰지 않는다.

```text
비견
겁재
식신
상관
정재
편재
정관
편관
정인
편인

용신
상신
병
구응

천간
지지
지장간

격국
합거
통근
```

---

# 11. 한자 금지

Personality 고객 본문에:

```text
甲乙丙丁
比肩
正官
傷官
```

등 한자를 노출하지 않는다.

---

# 12. 전문용어 제거 ≠ 근거 제거

명리 용어를 제거한다고 해석 근거까지 없애면 안 된다.

금지:

```text
활발한 성격이야.
신중한 편이야.
```

만 던지고 끝내기.

가능하면 내부 근거가 표현하는 구조를 평이한 말로 풀어 쓴다.

---

# 13. Personality Renderer용 자연 비유

자연 비유는 기존 FILUNE의 글자/오행 비유 체계가 존재할 경우 그것만 사용한다.

Renderer가 새로운 비유 dictionary를 창작하지 않는다.

기존 canonical/nature mapping이 없다면 일반 성격 문장으로 표현한다.

---

# 14. 성격 출력 기본 구성

한국어 Personality 출력은 최소 다음 네 영역을 만들 수 있어야 한다.

```text
1. 겉으로 보이는 모습
2. 가까워졌을 때 드러나는 모습
3. 판단하는 방식
4. 감정을 다루는 방식
```

이는 고객용 구조이며 내부 TenGod 명칭을 쓰지 않는다.

---

# 15. 내부 Fact → 영역 매핑

권장:

```text
social / outward
→ 겉으로 보이는 모습

inner / interpersonal / private
→ 가까워졌을 때 드러나는 모습

decision
→ 판단하는 방식

stress / internal conflict / expression
→ 감정을 다루는 방식
```

기존 traitType을 우선 사용한다.

---

# 16. 없는 영역 창작 금지

해당 영역에 근거 PersonalityFact가 없으면
내용을 채우기 위해 일반론을 만들지 않는다.

가능하면 영역 자체를 생략하거나 짧게 처리한다.

---

# 17. W-06 근거 없는 성격 금지

각 성격 문장은 실제 PersonalityFact 또는 Conflict/Modifier에 연결되어야 한다.

Renderer 결과의 각 paragraph/block에 내부적으로:

```text
sourceFactIds
sourceModifierIds
sourceConflictIds
```

를 추적 가능하게 한다.

고객에게 ID는 노출하지 않는다.

---

# 18. DayStem base

타고난 기본 기질은 성격 설명의 기초가 된다.

단 DayStem Profile의 원문 표현을 그대로 복사하지 않는다.

중립적인 고객 문장으로 다시 구성한다.

---

# 19. DayPillar는 보조

일주 Personality는:

```text
보조 modifier
```

로만 사용한다.

금지:

```text
일주 내용만으로 성격 전체 결론
```

---

# 20. 일주 원문 복사 금지

`일주풀이.md`의 문장을 그대로 Renderer에 넣지 않는다.

특히:

```text
당신은...
평생...
배우자...
돈...
직업...
```

형식의 원문 재사용 금지.

---

# 21. 일주론 육친 단정 금지

Renderer에서 다음을 출력하지 않는다.

```text
배우자 복이 있다
이별수가 있다
남편이...
아내가...
결혼이...
```

---

# 22. Personality Conflict 표현

상반된 PersonalityFact가 있으면
하나를 삭제하지 않는다.

예:

```text
밖에서는 결정을 빠르게 내리는 편인데,
혼자 판단할 때는 한 번 더 따져보는 면도 있어.
```

처럼 **맥락 차이**로 풀 수 있다.

단 입력 Conflict가 있을 때만 작성한다.

---

# 23. 모순을 결함으로 표현 금지

금지:

```text
성격이 모순적이야.
이중적이야.
```

대신:

```text
상황에 따라 다른 면이 드러남
```

으로 표현한다.

---

# 24. StructuralRoleModifier

YongShen/SangShen/Byeong/GuEung 역할명 자체는 고객에게 노출하지 않는다.

내부 RoleModifier가 말하는:

```text
supports_expression
channels_expression
restrains_expression
distorts_expression
protects_expression
resolves_tension
contextualizes
```

의 의미만 고객 언어로 풀어 쓴다.

---

# 25. YongShen 표현

금지:

```text
좋은 성격
타고난 장점
가장 강한 성격
```

자동 변환.

가능한 의미:

```text
평소 여러 선택에서 중심축으로 자주 쓰이는 성향
```

정도로만 표현.

---

# 26. SangShen 표현

active일 경우:

```text
어떤 성향이 다른 면을 조절하거나 받쳐 주는 구조
```

로 표현 가능.

protective standby이면:

```text
항상 드러남
```

처럼 쓰지 않는다.

조건부/상황적 표현을 사용한다.

---

# 27. Byeong 표현

금지:

```text
나쁜 성격
결함
문제 있는 성격
```

가능한 방향:

```text
같은 장점도 압박이 커질 때는 지나치게 밀어붙이는 쪽으로 기울 수 있어.
```

단 실제 입력 modifier가 있을 때만.

---

# 28. ConditionalByeong

조건부 역할은 반드시 조건부 문체로 쓴다.

예:

```text
상황이 겹치면
~쪽으로 기울기 쉬워
~할 수 있어
```

확정형 금지.

---

# 29. GuEung

구응 자체를 말하지 않는다.

입력이 `resolves_tension` 등을 제공하면:

```text
그럴 때 균형을 되찾게 해 주는 다른 면도 함께 있어.
```

처럼 해석 가능.

단 실제 target conflict/path가 있을 때만.

---

# 30. Current Personality

현재 운에 따른 temporary expression은
타고난 성격과 분리한다.

권장 구분:

```text
타고난 모습
요즘 더 드러나는 모습
```

---

# 31. 운 성격 = 성격 변화 단정 금지

금지:

```text
성격이 바뀌었어.
원래와 다른 사람이 됐어.
```

가능:

```text
요즘은 평소보다 이런 면이 앞에 나오기 쉬워.
```

---

# 32. Daewoon / Sewoon / Month / Day

고객 Personality Renderer에서 scope를
무조건 전문용어로 부르지 않는다.

필요한 경우:

```text
긴 흐름에서는
올해는
이번 시기에는
지금은
```

같은 일반 표현으로 변환한다.

정확한 날짜 출력이 필요한 상세 Renderer는 후속 단계에서 처리 가능.

---

# 33. Temporary effect expiry

expired Current PersonalityEffect는 현재 본문에 출력하지 않는다.

History 전용.

---

# 34. 과거 history를 사건처럼 쓰지 않는다

금지:

```text
예전에는 경쟁심 때문에 문제가 있었어.
```

History는 고객이 실제 사건을 알려주지 않는 이상 사건 서술에 사용하지 않는다.

---

# 35. W-15 아는 척 금지

금지:

```text
원래 사람들에게 이런 말을 많이 들었을 거야.
분명 예전에 이런 일이 있었을 거야.
```

---

# 36. W-22 사건 생성 금지

성격으로부터:

```text
이직
결혼
이별
사고
질병
사업 성공
```

같은 사건을 만들지 않는다.

---

# 37. W-34 신체 반응 추정 금지

성격 설명에서:

```text
스트레스를 받으면 몸이 먼저 아파.
참으면 소화가 안 돼.
```

같은 건강/신체 반응을 만들지 않는다.

---

# 38. 점수 금지

고객 출력에서:

```text
독립성 80점
외향성 70%
성격 강도 ★★★★
```

금지.

---

# 39. 순위 금지

내부 Prominence가 아직 deferred이므로:

```text
가장 강한 성향
두 번째로 강한 성향
```

같은 순위도 만들지 않는다.

---

# 40. Prominence deferred 처리

Prominence가 deferred이면
Renderer가 임의로 강도 표현을 추가하지 않는다.

금지:

```text
아주 강하게
매우 뚜렷하게
압도적으로
```

단 입력 fact 자체가 source explicit하게 강도를 갖는 경우는 별도.

---

# 41. W-07 확정/조건부 보존

입력:

```text
confirmed
```

이면 단정형 가능.

입력:

```text
contextual
deferred
conditional
```

이면:

```text
~기 쉬워
~할 수 있어
~한 상황에서는
```

등으로 낮춘다.

---

# 42. 확정 판단을 불필요하게 흐리지 않는다

confirmed Fact를 전부:

```text
~일 수도 있어
```

로 약화시키지 않는다.

입력 certainty를 보존한다.

---

# 43. W-09 불편한 성향 삭제 금지

shadow/constraint가 confirmed이면
“좋게 들리도록” 없애지 않는다.

다만 비난하거나 낙인찍지 않는다.

---

# 44. 강점/과제 같은 뿌리

가능한 경우 같은 PersonalityFact의 양면을:

```text
이 성향은 빠르게 움직이게 해 주는 힘이지만,
상황이 급할수록 결론을 너무 빨리 내릴 수도 있어.
```

처럼 연결한다.

단 실제 strength/shadow 근거가 둘 다 있을 때만.

---

# 45. 자동 균형 문장 금지

모든 단점 뒤에:

```text
하지만 장점도 있어.
```

를 기계적으로 붙이지 않는다.

입력 근거가 있을 때만 연결한다.

---

# 46. 출력 구조 권장

최소 타입:

```ts
interface RenderedPersonalityKo {
  overview?: RenderedPersonalityBlock;

  outward?: RenderedPersonalityBlock;
  closeRelations?: RenderedPersonalityBlock;
  decision?: RenderedPersonalityBlock;
  emotion?: RenderedPersonalityBlock;

  strengths?: RenderedPersonalityBlock;
  cautions?: RenderedPersonalityBlock;

  currentExpression?: RenderedPersonalityBlock;

  provenance: RenderProvenance[];
}
```

실제 프로젝트 타입에 맞게 조정 가능.

---

# 47. Rendered block

권장:

```ts
interface RenderedPersonalityBlock {
  text: string;

  sourceFactIds: string[];
  sourceModifierIds: string[];
  sourceConflictIds: string[];

  certainty:
    | "confirmed"
    | "conditional"
    | "mixed";
}
```

provenance는 고객 화면에 노출하지 않는다.

---

# 48. Renderer는 deterministic

동일 PersonalityResult 입력에 대해
동일한 출력 구조와 문장 선택을 반환해야 한다.

LLM runtime에 의존하지 않는다.

---

# 49. 템플릿 폭발 방지

각 trait마다 개별 완성 문장 수십 개를 하드코딩하기보다:

```text
trait normalization
+
position context
+
certainty
+
modifier operation
```

조합 방식으로 구성하는 것을 우선한다.

---

# 50. 그러나 의미 일반화 금지

추상 템플릿 때문에:

```text
모든 TenGod → 적극적이다
모든 branch → 속이 깊다
```

식으로 의미가 뭉개지면 안 된다.

Knowledge trait의 실제 뜻을 유지한다.

---

# 51. 중복 제거

같은 의미가:

```text
DayStem
TenGod
DayPillar
Current
```

여러 곳에서 반복되면 한 문단 안에서 기계적으로 반복하지 않는다.

---

# 52. W-12 중복 방지

같은 판단을 다시 쓰는 경우:

```text
근거
조건
현재 맥락
```

중 하나가 실제로 추가될 때만 반복한다.

---

# 53. Current 표현은 Natal 반복이 아님

현재 운에서 같은 trait가 다시 활성화되어도:

금지:

```text
원래 독립적이야.
요즘도 독립적이야.
```

가능:

```text
원래 스스로 결정하려는 힘이 있는데,
지금은 그 면이 바깥에서 더 자주 쓰이기 쉬워.
```

단 current effect가 실제 있을 때만.

---

# 54. 고객용 내부 용어 검사

최종 text에서 다음 token을 금지 검사한다.

예:

```text
용신
상신
구응
병격
정관
편관
상관
식신
비견
겁재
정재
편재
정인
편인
천간
지지
합거
통근
```

개발/근거 metadata는 제외.

---

# 55. 한자 검사

고객 text에서 CJK 한자 명리 기호가 노출되지 않는지 검사한다.

한국어 일반 한자어까지 regex로 과도하게 막지 않는다.

---

# 56. 금지 예측 검사

고객 Personality text에서 최소 다음을 검사한다.

```text
배우자복
이별수
외도
궁합
질병
수명
부자가 된다
사업 성공
반드시 성공
평생 고생
```

---

# 57. 호칭 검사

고객 text:

```text
너
네가
당신
```

0건.

문맥 false positive는 필요 시 검사 예외를 명시한다.

---

# 58. 건강 검사

성격 본문에서:

```text
몸
통증
질병
병원
소화
두통
```

등 신체 예측이 새로 생기지 않아야 한다.

---

# 59. 점수 검사

```text
%
점
별점
확률
등급
랭크
```

등 성격 수치화 0건.

---

# 60. Current history 검사

expired PersonalityEffect를 입력해도
현재 고객 문장에 포함되지 않아야 한다.

---

# 61. Conflict rendering fixture

입력:

```text
outward = 빠른 판단
inner = 신중한 판단
```

Expected:

두 성향 모두 표현.

금지:

```text
모순된 성격
```

---

# 62. Conditional modifier fixture

입력:

```text
ConditionalByeong contextual
```

Expected:

조건부 문체.

단정형 금지.

---

# 63. No-Byeong fixture

문제성 Role이 없는 경우에도
억지 caution 문장을 하나 만들지 않는다.

---

# 64. Protective standby fixture

standby SangShen을
현재 active 강점처럼 표현하지 않는다.

---

# 65. Current temporary fixture

운 temporary trait 존재.

Expected:

```text
현재/요즘 맥락으로만 출력
```

Natal section에 영구 성격처럼 포함되지 않는다.

---

# 66. Expired temporary fixture

Expected:

```text
current customer text = 0
```

History에는 남아도 Renderer 현재 출력에는 사용하지 않는다.

---

# 67. Unknown hour fixture

시각 미정 명식에서
시주 기반 고객 성격 문장이 생성되지 않는다.

---

# 68. 戊午 fixture

잘못된 원자료 `偏財` conflict는 고객에게 노출하지 않는다.

canonical Personality 결과만 사용한다.

---

# 69. SOURCE_GAP fixture

근거가 없는 빈 field를
Renderer가 일반론으로 채우지 않는다.

---

# 70. 구조 엔진 격리

Renderer 구현 때문에:

```text
src/lib/judgment/
```

수정 금지.

---

# 71. Personality Engine 격리

가급적 다음 기존 엔진 결과 의미를 변경하지 않는다.

```text
P2-D
P2-E
P2-F
P2-G
```

Renderer는 read-only consumer다.

---

# 72. 권장 경로

예:

```text
src/lib/personality/render/
├─ ko/
│  ├─ renderPersonalityKo.ts
│  ├─ renderPersonalityBlock.ts
│  ├─ wording.ts
│  └─ guardrails.ts
└─ types.ts
```

기존 프로젝트 구조에 맞게 조정 가능.

---

# 73. Renderer validation

권장:

```text
scripts/verify-personality-renderer-ko-p3a.mjs
```

---

# 74. 필수 검증

최소:

```text
A. DayStem base rendering
B. outward / inner rendering
C. decision rendering
D. conflict rendering
E. StructuralRole rendering
F. ConditionalByeong wording
G. Current temporary expression
H. expired effect exclusion
I. unknown hour
J. source gap safe
K. no terminology
L. no hanja
M. no forbidden prediction
N. no scoring
O. no customer pronouns
P. deterministic output
```

---

# 75. 기존 Personality 회귀

반드시:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS
P2-F PASS
P2-G PASS
```

---

# 76. Judgment 회귀

```text
35/35 PASS
```

유지.

---

# 77. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 78. Renderer 결과 파일

```text
src/docs/codex/p3a-personality-renderer-ko-result.md
```

---

# 79. 최종 보고

## A. 전체 판정

```text
READY_FOR_PERSONALITY_RENDERER_KO_AUDIT
```

또는:

```text
P3A_FIX_REQUIRED
```

## B. Renderer Coverage

| 영역 | 구현 | 테스트 | 결과 |
|---|---|---|---|
| overview | | | |
| outward | | | |
| close relations | | | |
| decision | | | |
| emotion | | | |
| strengths | | | |
| cautions | | | |
| current expression | | | |

## C. Guardrails

```text
명리 용어 노출:
한자 노출:
배우자/궁합 단정:
건강 예측:
사건 생성:
점수/확률:
금지 호칭:
근거 없는 trait:
```

모두 0이어야 한다.

## D. 회귀

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:
P2-G:
P3-A:

Judgment:
tsc:
build:
```

## E. 남은 상태

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
```

---

# 80. 종료 조건

다음 조건이면:

```text
READY_FOR_PERSONALITY_RENDERER_KO_AUDIT
```

판정한다.

```text
[ ] Renderer가 Personality 판단을 새로 하지 않음
[ ] 내부 명리 용어 고객 노출 0
[ ] 고객 본문 한자 노출 0
[ ] 근거 없는 trait 생성 0
[ ] DayPillar는 보조로만 사용
[ ] Conditional 상태는 조건부 문체
[ ] confirmed 상태는 불필요하게 흐리지 않음
[ ] Conflict 양쪽 성향 보존
[ ] Natal / Current 구분
[ ] expired current effect 출력 0
[ ] 배우자·궁합·건강·재물·직업 운명 단정 0
[ ] 점수·확률·등급 0
[ ] '너·네·당신' 0
[ ] P2 전체 PASS
[ ] Judgment 35/35 PASS
[ ] tsc/build PASS
```

---

# 81. 이후 단계

P3-A가 통과해도 바로 일본어·영어 Renderer를 만들지 않는다.

먼저:

```text
P3-B
한국어 Personality Renderer 출력감사
```

를 수행한다.

그 감사에서는 실제 대표 명식들을 렌더링해:

```text
내부 PersonalityResult
↔ 고객 문장
```

간 의미 손실·과장·근거 누락을 확인한다.

한국어 출력 계약이 고정된 다음에만:

```text
P3-C Japanese Renderer
P3-D English Renderer
```

로 진행한다.

일본어와 영어는 한국어 완성문을 번역하는 구조가 아니라
동일한 내부 PersonalityResult에서 각 언어별로 직접 생성한다.