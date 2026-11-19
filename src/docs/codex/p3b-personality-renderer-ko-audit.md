# FILUNE Codex P3-B
## 한국어 Personality Renderer 출력 감사

P3-A에서 한국어 Personality Renderer 구현이 완료되었다.

현재 상태:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS
P2-F PASS
P2-G PASS

P3-A 16/16 PASS

Judgment 35/35 PASS
TypeScript PASS
Build PASS

FAIL 0
PARTIAL 0
```

이번 단계에서는 **새 Renderer 기능을 추가하지 않는다.**

목표는 실제 다양한 PersonalityResult를 한국어 Renderer에 넣어,
내부 구조와 고객 문장 사이의 의미 보존 상태를 감사하는 것이다.

최종 판정은:

```text
READY_FOR_MULTILINGUAL_PERSONALITY_RENDERER
```

또는:

```text
P3B_FIX_REQUIRED
```

이다.

---

# 1. 기준 문서

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

구현 결과:

```text
src/docs/codex/p3a-personality-renderer-ko-result.md
```

---

# 2. 감사 목적

이번 감사에서는 다음을 확인한다.

```text
Internal Personality Result
↓
한국어 Renderer
↓
Customer Text
```

과정에서:

```text
의미 손실
의미 추가
과장
확정도 변형
역할 오해
Conflict 삭제
Natal/Current 혼동
```

이 없는지 확인한다.

---

# 3. 코드 변경 원칙

이번 단계는 감사 우선이다.

문제가 발견되면:

```text
문제
재현 fixture
내부 입력
실제 출력
기대 의미
최소 수정 위치
```

를 먼저 기록한다.

테스트 통과를 위해 Personality Engine의 의미를 변경하지 않는다.

---

# 4. 감사 fixture 범위

최소 다음 유형을 각각 실제 렌더링한다.

```text
A. 단순한 원국 Personality
B. 천간 outward와 지지 inner가 다른 명식
C. DayPillar internalConflict
D. StructuralRoleModifier가 뚜렷한 명식
E. YongShen + Byeong 비독점
F. Protective Standby SangShen
G. ConditionalByeong
H. GuEung
I. No-Byeong
J. stopped Role
K. weakened Role
L. Current temporary expression
M. Natal vs Current conflict
N. expired Current effect
O. unknown hour
P. SOURCE_GAP가 많은 Profile
Q. 戊午 canonical conflict case
```

가능하면 기존 P2 fixture를 재사용한다.

---

# 5. 내부 입력 보존

각 fixture마다 고객 문장을 보기 전에
최소 다음 내부 정보를 기록한다.

```text
Natal Personality Facts
PositionExpressions
DayPillarModifier
PersonalityConflicts
StructuralRoleModifiers
CurrentPersonalityFacts
Current Role Modifier states
Current Conflicts
```

Renderer 결과와 직접 대조한다.

---

# 6. Fact coverage 감사

각 confirmed PersonalityFact가
반드시 하나씩 문장으로 전부 노출될 필요는 없다.

하지만 고객 출력에서 중요한 confirmed 성향이
완전히 사라지는 경우가 있는지 확인한다.

분류:

```text
rendered
merged
intentionally omitted
lost
```

`lost`는 근거를 설명할 수 없으면 FAIL 후보다.

---

# 7. 중복 병합 허용

같은 의미의 Fact 여러 개를
한 문장으로 병합하는 것은 허용한다.

예:

```text
DayStem
+
TenGod
+
DayPillar
```

세 source가 비슷한 독립성 trait를 지지한다면
한 문장으로 합칠 수 있다.

단 provenance는 유지한다.

---

# 8. 의미 확대 금지

입력:

```text
독립적으로 판단하려는 경향
```

출력:

```text
누구의 말도 듣지 않고 자기 뜻대로만 움직여.
```

처럼 확대하면 FAIL.

---

# 9. 의미 축소 금지

입력에:

```text
독립적 판단
+
관계에서는 배려
+
내부에서는 신중
```

이 있는데 출력이:

```text
독립적인 사람이야.
```

로 끝나면 주요 의미 손실 여부를 확인한다.

---

# 10. 확정도 보존

입력 status가:

```text
confirmed
```

이면 불필요하게:

```text
~일 수도 있어
~일지 몰라
```

로 약화하지 않는다.

---

# 11. 조건부 보존

입력:

```text
contextual
conditional
deferred
```

를:

```text
항상
분명히
반드시
```

로 올리면 FAIL.

---

# 12. Conflict 양쪽 보존

입력에:

```text
outward = 빠른 판단
inner = 신중한 판단
```

이 있으면 고객 문장에서 두 면을 모두 표현해야 한다.

한쪽을 삭제하면 FAIL 후보.

---

# 13. Conflict 문체

금지:

```text
모순적인 성격이야
이중적이야
앞뒤가 달라
```

가능:

```text
밖에서는 빠르게 움직이지만,
혼자 판단할 때는 한 번 더 따져보는 면이 있어.
```

---

# 14. DayPillar 과대사용 감사

DayPillar Modifier가
전체 성격 설명의 중심으로 과대 확대되는지 확인한다.

금지:

```text
DayPillar 한두 Fact
→ 전체 Personality 결론
```

DayPillar는 보조여야 한다.

---

# 15. DayStem 과대사용 감사

반대로 DayStem base 한 문장만 반복되어
TenGod / Position / Conflict가 사라지는지도 확인한다.

---

# 16. Position 의미 보존

천간 outward Fact가
고객 문장에서 내부 성향처럼 표현되지 않는지 확인한다.

지지 inner Fact가
외부에서 항상 드러나는 성향으로 바뀌지 않는지 확인한다.

---

# 17. MonthBranch 표현

월지 innate context는
“타고난 반응”으로 표현할 수 있다.

하지만:

```text
이 성향이 전부야
```

처럼 전체 Personality를 대표시키지 않는다.

---

# 18. DayBranch 표현

일지 internal/decision context를
배우자 설명으로 변환하지 않는다.

---

# 19. HourBranch 표현

시주 근거가 있는 경우에만
개인적 욕구·장기 판단 맥락을 사용한다.

unknown hour fixture에서는 해당 문장 0.

---

# 20. StructuralRole 의미 보존

RoleModifier operation이:

```text
supports_expression
channels_expression
restrains_expression
distorts_expression
protects_expression
resolves_tension
contextualizes
```

일 때 고객 문장이 실제 operation 의미와 일치하는지 확인한다.

---

# 21. YongShen 과장 감사

YongShen modifier가 있다는 이유로:

```text
가장 큰 장점
핵심 성격
최고의 강점
```

이라고 쓰지 않는다.

Prominence가 deferred이므로 순위화 금지.

---

# 22. SangShen active / standby 구분

active SangShen:

```text
실제로 조절 기능이 작동
```

standby SangShen:

```text
필요한 상황에서 작동할 수 있는 면
```

으로 구분되어야 한다.

standby를 현재 강점처럼 단정하면 FAIL.

---

# 23. Byeong 표현 감사

Byeong modifier가:

```text
결함
나쁜 성격
문제 있는 사람
```

으로 렌더링되지 않는지 확인한다.

---

# 24. ConditionalByeong 감사

조건부 병은 반드시:

```text
상황이 겹치면
압박이 커지면
그럴 때는
~쪽으로 기울 수 있어
```

같은 조건부 문체.

---

# 25. GuEung 감사

GuEung이 있는 경우:

```text
문제를 없애는 착한 성격
```

으로 표현하지 않는다.

실제 tension을 완화하는 다른 성향/기능으로만 표현.

---

# 26. non-exclusive Role 감사

같은 actor가:

```text
YongShen + Byeong
```

이면 고객 문장에서도
강점/과제의 두 방향을 필요 시 함께 보존한다.

한쪽만 남기지 않는다.

---

# 27. favorable + ConditionalByeong

현재는 잘 쓰이지만
특정 조건에서 문제 방향도 가능한 경우:

두 의미를 모두 보존한다.

단 무조건 문제처럼 쓰지 않는다.

---

# 28. No-Byeong 감사

No-Byeong fixture에서
Renderer가 읽기 재미를 위해 억지 단점을 하나 만들지 않는다.

---

# 29. Current 표현 분리

CurrentPersonalityFact는:

```text
타고난 성격
```

과 분리되어야 한다.

권장 표현:

```text
요즘은
지금은
이번 흐름에서는
```

---

# 30. Current를 영구 성격으로 만들지 않음

금지:

```text
원래 경쟁적인 사람이야.
```

입력이 운에서만 들어온 temporary 경쟁성인 경우.

---

# 31. Current와 Natal 동일 trait

Natal과 Current가 같은 trait를 지지하면
기계적으로 두 번 반복하지 않는다.

가능:

```text
원래 스스로 결정하려는 면이 있는데,
지금은 그 성향이 바깥에서 더 자주 쓰이기 쉬워.
```

---

# 32. expired effect

expired current effect는 고객 본문에서 0건이어야 한다.

---

# 33. History 사건화 금지

History에 과거 성향 충돌이 있어도:

```text
예전에 인간관계에서 큰 문제가 있었어.
```

같은 사건을 만들지 않는다.

---

# 34. Personality → 현실 결과 금지

다음 추론 금지:

```text
독립적
→ 사업 성공

신중함
→ 돈을 잘 모음

관계를 빨리 정리
→ 이혼
```

---

# 35. 건강 추론 금지

다음 금지:

```text
스트레스가 쌓이면 소화가 안 돼.
마음이 답답하면 몸이 먼저 반응해.
```

---

# 36. 배우자/궁합 금지

Personality Renderer에서:

```text
배우자
남편
아내
결혼
이별
궁합
```

결과 단정 금지.

---

# 37. 고객이 알려주지 않은 과거 금지

금지:

```text
예전에도 이런 말을 들었을 거야.
사람들과 자주 부딪혔을 거야.
```

---

# 38. 명리 용어 감사

실제 대표 출력 전체에서:

```text
용신
상신
병
구응
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
지장간
격
합거
통근
```

노출 0건.

---

# 39. 한자 감사

고객 텍스트 내 명리 한자 노출 0건.

---

# 40. 호칭 감사

```text
너
네가
당신
```

0건.

---

# 41. 일본어 혼입 검사

한국어 Renderer 결과에 일본어 문장·호칭 0건.

---

# 42. 영어 내부용어 혼입 검사

고객 본문에서:

```text
Ten God
Yong Shen
Day Master
RoleModifier
PersonalityFact
```

등 내부 영어 표현 0건.

---

# 43. 점수/등급 감사

```text
%
점
확률
등급
별점
랭크
```

0건.

---

# 44. Prominence 표현 감사

현재 Prominence는:

```text
deferred
```

이므로 고객 문장에:

```text
가장 강한
압도적인
제일 두드러진
```

같은 임의 rank/strength 표현이 없는지 확인한다.

---

# 45. 부정적 성격의 완곡 삭제 금지

confirmed shadow가 있는데
Renderer가 전부 긍정적으로 순화해 없애면 안 된다.

예:

```text
결정을 너무 빨리 내릴 수 있음
```

을:

```text
결단력이 좋아.
```

만 남기면 의미 손실.

---

# 46. 낙인 표현 금지

반대로:

```text
고집이 세서 문제야
이기적이야
성격이 나빠
```

같은 도덕적 평가도 금지.

---

# 47. 고객 문장 자연성

자동 생성 티가 강한 반복 패턴을 검사한다.

예:

```text
~하는 면이 있어.
~하는 면이 있어.
~하는 면이 있어.
```

연속 반복이 지나치면 보고한다.

---

# 48. 문단 자연성

각 block은 개별 Fact 나열이 아니라
한두 개의 연결된 성격축을 문단으로 설명해야 한다.

---

# 49. 문단 길이

Renderer가 너무 많은 Fact를 한 문단에 몰아넣어
읽기 어려운지 확인한다.

단 임의 글자수 제한을 새 규칙으로 만들지 않는다.

---

# 50. 네 핵심 영역 감사

대표 fixture마다 가능하면:

```text
겉으로 보이는 모습
가까워졌을 때 드러나는 모습
판단하는 방식
감정을 다루는 방식
```

이 내부 근거에 맞게 구성되는지 확인한다.

근거 없는 영역은 생략 가능.

---

# 51. Strength/Caution 감사

strength와 caution은
실제 입력 근거가 있을 때만 출력.

무조건 3개씩 맞추지 않는다.

---

# 52. 동일 뿌리 연결

같은 trait가 strength와 caution 양쪽 근거가 있으면
고객에게 그 양면성을 연결해 설명하는 것이 적절한지 확인한다.

하지만 근거가 없는 쌍을 인위적으로 만들지 않는다.

---

# 53. Empty section

근거가 없는 section은:

```text
내용 없음
```

이라고 고객에게 표시하지 않는 것을 권장.

그 section을 생략한다.

---

# 54. Provenance coverage

각 고객 block이 최소 1개 이상의:

```text
Fact
Modifier
Conflict
```

내부 ID와 연결되어야 한다.

---

# 55. Render-only provenance

provenance는 내부에만 존재.

고객 문장에:

```text
Fact ID
Rule ID
sourceRef
```

노출 0건.

---

# 56. deterministic output

동일 fixture를 여러 번 렌더링해
완전히 동일한 출력인지 확인한다.

---

# 57. input order independence

내부 Fact 배열 순서를 뒤집어도
의미 결과가 같아야 한다.

문장 순서는 stable sorting 기준에 따라 동일해야 한다.

---

# 58. representative output dump

감사 보고서에는 최소 6개 대표 fixture의 실제 Renderer 출력 전문을 기록한다.

추천:

```text
1. simple
2. conflict
3. structural role
4. conditional byeong
5. current expression
6. unknown hour
```

---

# 59. 내부-외부 대조표

각 대표 fixture마다:

| Internal meaning | Customer sentence | 상태 |
|---|---|---|

상태:

```text
MATCH
PARTIAL_LOSS
OVERSTATEMENT
UNSUPPORTED
```

---

# 60. 의미 손실 판정

`PARTIAL_LOSS`는
중요한 내부 의미가 출력에서 빠졌지만
반대 뜻으로 변하지 않은 경우.

---

# 61. 과장 판정

`OVERSTATEMENT`는:

```text
contextual → confirmed
temporary → natal
role context → personality essence
```

등으로 올라간 경우.

---

# 62. Unsupported 판정

`UNSUPPORTED`는 고객 문장에
내부 입력 근거가 없는 의미가 추가된 경우.

이는 BLOCKING.

---

# 63. Renderer 판단 추가 검사

Renderer 내부 코드에서 새로운 조건:

```text
특정 TenGod이면 이런 문장
특정 Role이면 이런 성격
```

을 별도 명리판정처럼 추가했는지 검사한다.

Renderer는 입력 의미만 사용해야 한다.

---

# 64. Knowledge 직접 우회 참조 감사

Renderer가 PersonalityResult를 거치지 않고
Knowledge Registry를 직접 읽어 새로운 판단을 만드는지 확인한다.

가능하면:

```text
Renderer
→ PersonalityResult
```

입력만 사용.

---

# 65. Judgment 직접 참조 금지

Renderer가:

```text
src/lib/judgment/
```

결과를 직접 읽어 Personality Engine을 우회하면 FAIL.

---

# 66. 권장 테스트 script

```text
scripts/verify-personality-renderer-ko-audit-p3b.mjs
```

---

# 67. BLOCKING 자동검증

최소:

```text
unsupported customer meaning = 0
conditional → confirmed escalation = 0
temporary → natal escalation = 0
expired effect rendering = 0
internal terminology = 0
forbidden prediction = 0
score/rank = 0
Judgment direct dependency = 0
```

---

# 68. 기존 P3-A 검증

```text
P3-A 16/16 PASS
```

유지.

---

# 69. Personality P2 회귀

```text
P2-A
P2-B
P2-C
P2-D
P2-E
P2-F
P2-G
```

전부 PASS.

---

# 70. Judgment 회귀

```text
35/35 PASS
```

---

# 71. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 72. 수정 허용 범위

감사에서 Renderer 자체 문제가 발견되면
최소 Renderer 수정은 허용한다.

수정 허용:

```text
src/lib/personality/render/
```

필요 시 Renderer용 타입.

수정 금지 원칙:

```text
Knowledge Registry
Personality Engine semantics
Judgment Engine
```

---

# 73. 결과 파일

```text
src/docs/codex/p3b-personality-renderer-ko-audit-result.md
```

---

# 74. 최종 보고

## A. 전체 판정

```text
READY_FOR_MULTILINGUAL_PERSONALITY_RENDERER
```

또는:

```text
P3B_FIX_REQUIRED
```

## B. Semantic Audit

```text
MATCH:
PARTIAL_LOSS:
OVERSTATEMENT:
UNSUPPORTED:
```

## C. Guardrail Audit

```text
명리 용어:
한자:
호칭:
점수/확률:
사건 예측:
건강 예측:
배우자/궁합 단정:
근거 없는 문장:
```

## D. State Audit

```text
Natal → Natal:
Current → Current:
Conditional → Conditional:
Expired excluded:
Conflict sides preserved:
```

## E. Dependency

```text
Renderer → PersonalityResult:
Renderer → Knowledge direct:
Renderer → Judgment direct:
```

Expected:

```text
PersonalityResult = yes
Knowledge direct judgment = no
Judgment direct = no
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

Judgment:
tsc:
build:
```

## G. 남은 상태

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
```

---

# 75. 종료 조건

다음이면:

```text
READY_FOR_MULTILINGUAL_PERSONALITY_RENDERER
```

판정한다.

```text
[ ] UNSUPPORTED = 0
[ ] OVERSTATEMENT = 0
[ ] BLOCKING PARTIAL_LOSS = 0
[ ] conditional certainty 유지
[ ] temporary/natal 구분 유지
[ ] expired effect 출력 0
[ ] conflict 양쪽 의미 유지
[ ] 명리 용어 노출 0
[ ] 한자 노출 0
[ ] 점수/순위 0
[ ] 사건·건강·배우자 단정 0
[ ] 고객 호칭 금지 준수
[ ] Renderer가 Judgment 직접 참조하지 않음
[ ] P2 전체 PASS
[ ] P3-A/B PASS
[ ] Judgment 35/35 PASS
[ ] tsc/build PASS
```

---

# 76. 감사 통과 후

P3-B가 통과하면 한국어 Personality Renderer의 의미 계약을 고정한다.

그 이후에만:

```text
P3-C Japanese Personality Renderer
P3-D English Personality Renderer
```

로 진행한다.

일본어/영어 Renderer는:

```text
한국어 완성문
→ 번역
```

하지 않는다.

반드시 동일한:

```text
PersonalityResult
```

를 입력받아 각 언어에서 직접 렌더링한다.

언어별 차이는:

```text
호칭
문장 리듬
확정/조건부 표현
자연스러운 비유 표현
```

에만 두고,
내부 판정 의미는 동일하게 유지한다.