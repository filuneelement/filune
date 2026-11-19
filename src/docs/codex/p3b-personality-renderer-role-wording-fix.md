# FILUNE Codex P3-B Fix
## Personality Renderer 역할 표현 정합성 보완

P3-B 한국어 Personality Renderer 출력 감사에서
Renderer 의미 보존 문제 3건이 확인되었다.

현재 상태:

```text
P2-A ~ P2-G PASS
P3-A 16/16 PASS
Judgment 35/35 PASS
npx tsc -b PASS
npm run build PASS

P3-B semantic issues:
UNSUPPORTED 1
PARTIAL_LOSS 2
```

금지 표현, 근거 ID 누락, 만료 효과 현재 출력 문제는 모두 0건이다.

이번 작업에서는 **감사에서 확인된 3건만 수정**한다.

Personality Engine, Judgment Engine, Knowledge Registry의 의미는 변경하지 않는다.

---

# 1. 기준 감사 결과

최우선으로 다음 파일을 읽는다.

```text
src/docs/codex/p3b-personality-renderer-ko-audit-result.md
```

재현 스크립트:

```text
scripts/verify-personality-renderer-ko-audit-p3b.mjs
```

감사 보고서에 기록된 실제 3개 fixture의:

```text
internal meaning
actual customer sentence
expected meaning
classification
```

을 정확히 확인한다.

내용을 추측해서 수정하지 않는다.

---

# 2. 수정 대상 1
## 근거 없는 의미 추가 — 1건

감사에서 확인된 문제:

```text
StructuralRoleModifier가
특정 PersonalityFact를 받쳐 주거나 중심적으로 사용하게 함

↓

Renderer가 이를
'선택의 기준'
이라는 새로운 심리 의미로 표현
```

이 표현은 내부 입력이 직접 지원하지 않으므로 제거한다.

---

# 3. 원칙

StructuralRoleModifier가 말하는 것은:

```text
supports_expression
channels_expression
restrains_expression
distorts_expression
protects_expression
resolves_tension
contextualizes
```

등 **기존 성향이 어떤 방향으로 작동하는가**이다.

Renderer가 여기서 새로운 성격 메커니즘을 만들면 안 된다.

---

# 4. 금지 예

내부 입력:

```text
supports_expression
```

고객 출력:

```text
이 성향이 중요한 선택의 기준이 돼.
```

금지.

왜냐하면:

```text
supports_expression
≠
decision criterion
```

이기 때문이다.

---

# 5. 허용 방향

`supports_expression`이라면
입력 PersonalityFact 자체의 뜻을 유지하면서:

```text
이 면은 다른 성향이 흔들리지 않게 받쳐 주는 쪽으로 쓰여.
```

처럼 **지원 기능만 표현**한다.

실제 wording은 기존 문체 시스템에 맞춘다.

새로운 decision/priority/identity 의미를 추가하지 않는다.

---

# 6. Modifier operation별 의미 경계

Renderer mapping은 최소 다음 의미 경계를 지킨다.

### supports_expression

```text
기존 성향이 작동하도록 받쳐 줌
```

추가 금지:

```text
선택 기준
핵심 가치
정체성
가장 중요한 성격
```

---

### channels_expression

```text
기존 성향이 특정 방향으로 쓰임
```

추가 금지:

```text
성격 자체가 다른 trait로 변함
```

---

### restrains_expression

```text
기존 성향의 발현을 누르거나 제한
```

추가 금지:

```text
해당 성향이 없어짐
```

---

### distorts_expression

```text
기존 성향이 구조적으로 불편한 방향으로 작동
```

추가 금지:

```text
나쁜 사람
성격 결함
무조건 문제
```

---

### protects_expression

```text
특정 성향/기능이 유지되도록 보호
```

추가 금지:

```text
가장 큰 장점
타고난 강점 순위
```

---

### resolves_tension

```text
특정 긴장이나 문제 경로를 완화
```

추가 금지:

```text
모든 문제 해결
완벽한 균형
```

---

### contextualizes

```text
특정 조건에서 의미가 달라짐
```

조건을 제거하고 확정형으로 쓰면 안 된다.

---

# 7. 수정 대상 2
## 조건부 방해 기능 핵심 의미 누락

감사에서 확인된 첫 PARTIAL_LOSS:

```text
StructuralRoleModifier:
조건부로 다른 기능을 방해할 수 있음
```

인데 Renderer가:

```text
조건이 생길 수 있음
```

정도의 모호한 가능성만 남기고

**무엇을 어떻게 방해하는 역할인지**를 잃었다.

이를 수정한다.

---

# 8. Conditional role의 필수 요소

조건부 방해 modifier를 고객 문장으로 옮길 때 최소:

```text
1. 평소에는 기본 성향 유지
2. 특정 조건에서
3. 그 성향이 다른 기능의 발현을 방해하거나 흔들 수 있음
```

을 보존한다.

---

# 9. 예시 의미 구조

내부:

```text
ConditionalByeong
target = 다른 Personality expression
operation = distorts/restrains
status = contextual
```

Renderer 의미:

```text
평소에는 이 성향이 그대로 쓰이지만,
상황이 겹치면 다른 면이 움직이는 걸 막는 쪽으로 기울 수 있어.
```

정도의 구조.

실제 trait 이름/내용은 입력 Fact에 맞춰야 한다.

---

# 10. 조건부라는 이유로 핵심 기능 삭제 금지

금지:

```text
상황에 따라 달라질 수 있어.
```

만 출력.

이렇게 쓰면:

```text
무엇이 달라지는지
어떤 작용인지
```

가 사라져 일반론이 된다.

---

# 11. W-05 / W-06 원칙 유지

명리 용어는 제거하되
판단의 작동 관계까지 제거하지 않는다.

즉:

```text
무엇이 무엇을 받쳐 주는가
무엇이 무엇을 누르는가
무엇이 어떤 조건에서 방해하는가
```

의 의미를 평이한 고객 언어로 유지한다.

---

# 12. 수정 대상 3
## 현재 실제 작동 중인 방해 기능의 확정도 하락

두 번째 PARTIAL_LOSS:

내부에서는:

```text
현재 실제로 방해 기능이 operating / confirmed
```

인데 고객 문장은:

```text
~할 수도 있어
~기울 수 있어
```

처럼 가능성 수준으로 약화되었다.

이를 수정한다.

---

# 13. certainty 보존 원칙

Renderer는 내부 상태를 그대로 보존한다.

### confirmed / operating

단정형:

```text
~하는 쪽으로 작동해.
~을 누르는 역할을 해.
~이 앞에 나오면서 다른 면을 제한해.
```

등 가능.

---

### contextual / conditional

조건부:

```text
~하면
~한 상황에서는
~쪽으로 기울 수 있어
~하기 쉬워
```

---

### reduced

```text
그 작용은 전보다 약해져 있어.
```

또는 동등 의미.

---

### inactive

현재 본문에서는 active effect로 말하지 않는다.

필요한 경우 원국 설명과 구분해 history/provenance에만 유지.

---

# 14. confirmed를 가능성으로 낮추지 않는다

금지:

```text
internal = confirmed

customer =
~일 수도 있어
~할 가능성이 있어
```

W-07 계약 위반이다.

---

# 15. contextual을 단정으로 올리지 않는다

반대 방향도 금지.

```text
internal = contextual

customer =
항상 ~해
분명히 ~해
```

금지.

---

# 16. certainty 변환 테이블을 명시적으로 둔다

가능하면 Renderer 내부에:

```ts
confirmed  → assertive
contextual → conditional
deferred   → conditional/deferred
reduced    → weakened
inactive   → omit-current
```

와 같은 명시적 mapping을 둔다.

문구마다 개발자가 임의 선택하지 않게 한다.

---

# 17. 역할명 노출 금지 유지

이번 수정 때문에 고객 본문에:

```text
용신
상신
병
구응
```

을 넣지 않는다.

---

# 18. 내부 operation 이름 노출 금지

고객에게:

```text
supports_expression
distorts_expression
RoleModifier
```

같은 내부 코드명도 노출하지 않는다.

---

# 19. 기존 기본 PersonalityFact 수정 금지

이번 문제는 Role wording 문제다.

다음은 수정하지 않는다.

```text
DayStem Profile
TenGod Profile
DayPillar Profile
PersonalityFact generation
PersonalityConflict generation
CurrentPersonality calculation
```

---

# 20. StructuralRoleModifier 의미 변경 금지

P2-E 결과 자체도 수정하지 않는다.

Renderer가 그 의미를 정확히 읽도록 수정한다.

---

# 21. Judgment 수정 금지

```text
src/lib/judgment/
```

수정 0건.

---

# 22. P3-A 계약 유지

다음 guardrail은 모두 유지한다.

```text
명리 용어 0
한자 0
너·네·당신 0
사건 예측 0
건강 예측 0
점수·확률 0
근거 없는 문장 0
expired effect 현재 출력 0
```

---

# 23. 신규 테스트 A
## supports_expression 의미 확대 방지

입력:

```text
operation = supports_expression
```

Expected:

```text
지원/받침 의미는 존재
선택 기준 의미 = 0
핵심 가치 의미 = 0
정체성 의미 = 0
```

---

# 24. 신규 테스트 B
## Conditional interference meaning

입력:

```text
operation = restrains_expression 또는 distorts_expression
status = contextual
target exists
```

Expected 고객 의미:

```text
조건부임
+
실제로 무엇인가를 방해/누를 수 있다는 작용 의미 존재
```

단순:

```text
상황에 따라 달라질 수 있어
```

만으로 끝나면 FAIL.

---

# 25. 신규 테스트 C
## Confirmed interference certainty

입력:

```text
operation = restrains_expression 또는 distorts_expression
status = confirmed
```

Expected:

```text
현재 작동 중임을 단정형으로 표현
```

금지:

```text
~할 수도 있어
~기울 수 있어
```

---

# 26. 신규 테스트 D
## contextual certainty

동일 operation:

```text
status = contextual
```

Expected:

```text
조건부 문체
```

confirmed처럼 단정하면 FAIL.

---

# 27. 신규 테스트 E
## inactive

입력:

```text
status = inactive
```

Expected:

```text
현재 active role wording = 0
```

---

# 28. 신규 테스트 F
## reduced

입력:

```text
status = reduced
```

Expected:

```text
작용 자체는 존재
+
약화 상태 의미 보존
```

---

# 29. semantic fixture 3건 재검증

P3-B 감사에서 실패한 실제 3개 fixture를
그대로 재사용한다.

Expected:

```text
UNSUPPORTED 1 → 0
PARTIAL_LOSS 2 → 0
```

---

# 30. 다른 14개 fixture 회귀

기존 P3-B에서 문제가 없었던 나머지 14개 fixture의
고객 문장이 의미상 후퇴하지 않는지 확인한다.

---

# 31. 단어 치환만으로 해결 금지

예:

```text
선택의 기준
→ 받쳐 주는 힘
```

한 문자열만 치환해서 끝내지 않는다.

operation + status + target meaning의 조합을
정확히 처리하는 구조인지 확인한다.

---

# 32. operation renderer 분리 권장

가능하면:

```text
renderRoleOperationMeaning(...)
renderRoleCertainty(...)
```

또는 동등 구조로 분리한다.

---

# 33. target meaning 보존

RoleModifier가:

```text
targetPersonalityFactIds
```

를 갖는다면
고객 문장이 가능하면 **어떤 성향을 받치거나 방해하는지** 알 수 있어야 한다.

단 모든 내부 세부사항을 장황하게 노출할 필요는 없다.

---

# 34. target 없는 경우

target fact가 없으면
Renderer가 임의 대상을 만들어내지 않는다.

---

# 35. Customer sentence provenance

수정된 역할 문장도:

```text
sourceModifierIds
sourceFactIds
```

를 유지한다.

---

# 36. unsupported 검사

수정 후 대표 출력 전체에서:

```text
고객 문장 의미
⊆
Internal Personality Result 의미
```

여야 한다.

새 의미 추가 0.

---

# 37. overstatement 검사

특히:

```text
contextual → confirmed
temporary → natal
modifier → core identity
```

0.

---

# 38. under-rendering 검사

이번에는 반대로:

```text
confirmed role function
→ vague possibility only
```

0.

---

# 39. renderer direct judgment 금지

이번 수정에서:

```text
if role === byeong then ...
if role === yongshen then ...
```

식으로 역할 이름만 보고 새로운 성격 판단을 만들지 않는다.

실제:

```text
operation
status
target fact
```

를 사용한다.

---

# 40. Prominence 유지

```text
Prominence = deferred
```

계속 유지.

역할 문장 수정을 이유로:

```text
가장 중요한
가장 강한
핵심적인
```

등 임의 strength ranking 추가 금지.

---

# 41. 고객용 강도 표현

`confirmed`는 존재/작동 확정도이지
강도 최상급이 아니다.

금지:

```text
아주 강하게
압도적으로
무척 강한
```

자동 추가.

---

# 42. 기존 P3-A 검증

반드시:

```text
P3-A 16/16 PASS
```

유지.

---

# 43. P3-B 재감사

기존:

```text
scripts/verify-personality-renderer-ko-audit-p3b.mjs
```

재실행.

Expected:

```text
semantic issues = 0
```

---

# 44. P2 전체 회귀

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

# 45. Judgment 회귀

```text
35/35 PASS
```

유지.

---

# 46. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 47. 결과 파일

다음에 기록:

```text
src/docs/codex/p3b-personality-renderer-role-wording-fix-result.md
```

---

# 48. 최종 보고

## A. 수정 전/후

```text
UNSUPPORTED:
1 → ?

PARTIAL_LOSS:
2 → ?

OVERSTATEMENT:
? → ?
```

---

## B. 3건 상세

| # | Internal meaning | 기존 출력 문제 | 수정 출력 의미 | 결과 |
|---:|---|---|---|---|

---

## C. Role operation coverage

| operation | confirmed | contextual | reduced | inactive |
|---|---|---|---|---|
| supports_expression | | | | |
| channels_expression | | | | |
| restrains_expression | | | | |
| distorts_expression | | | | |
| protects_expression | | | | |
| resolves_tension | | | | |
| contextualizes | | | | |

지원되지 않는 조합은 `N/A`로 표시.

---

## D. Guardrails

```text
명리 용어:
한자:
금지 호칭:
사건 예측:
건강 예측:
점수/확률:
근거 없는 의미:
expired effect:
```

---

## E. 회귀

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

Judgment:
tsc:
build:
```

---

## F. 남은 상태

```text
FAIL:
PARTIAL:
UNSUPPORTED:
OVERSTATEMENT:
DEFERRED:
NOT_IMPLEMENTED:
```

---

# 49. 종료 조건

다음이면:

```text
READY_FOR_MULTILINGUAL_PERSONALITY_RENDERER
```

판정한다.

필수:

```text
UNSUPPORTED = 0
OVERSTATEMENT = 0
BLOCKING PARTIAL_LOSS = 0

P3-A PASS
P3-B PASS
P2-A~G PASS
Judgment 35/35 PASS
tsc PASS
build PASS
```

Prominence deferred는 허용.

---

# 50. 완료 후

통과 후 한국어 Renderer는 고정한다.

그 다음 단계부터:

```text
P3-C Japanese Personality Renderer
P3-D English Personality Renderer
```

로 진행한다.

다국어 Renderer를 구현하면서
한국어 Renderer의 의미 계약을 다시 바꾸지 않는다.