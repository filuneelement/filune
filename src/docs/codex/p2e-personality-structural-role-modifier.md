# FILUNE Codex P2-E
## Personality StructuralRoleModifier 구현

P2-D에서 원국 Personality Core가 완료되었다.

현재 구현:

```text
CanonicalChart
↓
DayStem base
↓
Natal TenGod occurrence
↓
PositionExpression
↓
DayPillarModifier
↓
PersonalityConflict
↓
NatalPersonalityResult
```

현재 상태:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS

FAIL 0
PARTIAL 0
```

이번 단계의 목표는 Structural Judgment Engine이 이미 판정한 원국 역할과 실제 기능을
Personality Engine이 **읽어서 성격 발현 방향을 보정**하도록 구현하는 것이다.

이번 단계에서도 Personality가 Structural Judgment를 변경해서는 안 된다.

---

# 1. 절대 의존 방향

허용:

```text
Judgment Result
→ Personality Engine
```

금지:

```text
Personality
→ Judgment Engine
```

다음은 반드시 0이어야 한다.

```text
src/lib/judgment/
→ src/lib/personality/
```

import.

---

# 2. 이번 구현 범위

구현:

```text
StructuralRoleModifier
RoleHistory → Personality context
CurrentFunction → Personality expression modifier
ActualStructuralFunction → Personality modifier
Natal structural role integration
Role-based PersonalityConflict
Role provenance
```

---

# 3. 이번 단계에서 구현하지 않음

```text
Daewoon Personality
Sewoon Personality
Month Personality
Day-luck Personality

CurrentPersonalityResult
Luck PersonalityEffect
customer renderer

Prominence numeric scoring
Personality score
```

---

# 4. 역할 대상

Personality modifier가 읽을 수 있는 구조 역할:

```text
YongShen
SangShen
Byeong
GuEung
```

그리고 필요 시:

```text
ActualStructuralFunction
PatternEffectPolicy result
Runtime state
```

를 참고한다.

---

# 5. 역할 이름 자체로 성격을 만들지 않는다

금지:

```text
YongShen
→ 좋은 성격

Byeong
→ 나쁜 성격

SangShen
→ 착한 성격

GuEung
→ 문제 해결형 성격
```

역할은 인격의 선악이 아니다.

---

# 6. StructuralRoleModifier의 의미

StructuralRoleModifier는:

```text
기존 Personality trait
+
해당 글자가 원국 구조에서 실제 수행하는 기능
→ trait의 발현 방향/맥락 보정
```

이다.

새 성격 trait를 무근거로 창작하는 기능이 아니다.

---

# 7. 기본 원칙

Personality base trait는 유지한다.

예:

```text
傷官
→ 혁신성·응용성
```

이 원국에서 SangShen 역할을 한다고 해서
傷官의 기본 Personality를 삭제하지 않는다.

대신:

```text
혁신적 표현이 구조적으로 문제를 조정하거나 기능을 살리는 방향으로 쓰임
```

같은 modifier context를 붙일 수 있다.

단 Knowledge + Structural Role 양쪽 근거가 있어야 한다.

---

# 8. RoleHistory와 CurrentFunction 분리

Personality에서도 반드시 구분한다.

```text
RoleHistory
≠
CurrentFunction
```

원국 역할 이력이 있다고 해서 현재 기능까지 자동으로 active라고 보지 않는다.

---

# 9. Natal 단계

이번 P2-E는 원국 기준이다.

따라서 우선:

```text
Natal RoleHistory
Natal CurrentState
Natal CurrentFunction
Natal ActualStructuralFunction
```

만 사용한다.

운에 의한 role 변화는 아직 구현하지 않는다.

---

# 10. Role modifier 권장 타입

최소:

```ts
interface StructuralRolePersonalityModifier {
  id: string;

  sourceRole:
    | "yongshen"
    | "sangshen"
    | "byeong"
    | "gueung";

  sourceRoleId: string;

  sourceFactIds: string[];

  targetPersonalityFactIds: string[];

  operation:
    | "supports_expression"
    | "channels_expression"
    | "restrains_expression"
    | "distorts_expression"
    | "protects_expression"
    | "resolves_tension"
    | "contextualizes";

  status:
    | "confirmed"
    | "reduced"
    | "inactive"
    | "deferred";

  provenanceIds: string[];
}
```

프로젝트 실제 타입 구조에 맞춰 조정 가능.

---

# 11. 역할 비독점성 유지

Structural Engine에서:

```text
하나의 글자
→ YongShen + Byeong
```

등 역할 비독점이 가능하다.

Personality에서도 그대로 허용한다.

한 역할 때문에 다른 역할 modifier를 삭제하지 않는다.

---

# 12. YongShen modifier

YongShen은 구조 중심 역할이다.

Personality에서는:

```text
해당 글자의 기본 trait가
사회적/행동적 중심축으로 반복적으로 사용되는 경향
```

을 보정할 수 있다.

단:

```text
YongShen = 가장 강한 성격
```

으로 자동 변환하지 않는다.

---

# 13. YongShen과 prominence 분리

금지:

```text
YongShen
→ very_prominent
```

자동 판정.

Structural role과 TenGod prominence는 별개의 축이다.

---

# 14. SangShen modifier

SangShen은 특정 구조 기능을 보호하거나 살리는 역할이다.

Personality에서는:

```text
해당 trait가 특정 상황에서 보조·조절·보호 기능으로 사용됨
```

을 나타낼 수 있다.

---

# 15. Protective Standby SangShen

원국 SangShen이:

```text
protective_standby
```

상태라면:

```text
항상 강하게 드러나는 성격
```

으로 만들지 않는다.

Expected:

```text
modifier status = contextual 또는 deferred
```

실제 위협 발생 시 활성화는 P2-F Luck 단계에서 다룬다.

---

# 16. Active SangShen

원국에서 실제 보호 path가 작동 중이고:

```text
CurrentFunction = operating
```

이면:

```text
supports_expression
protects_expression
channels_expression
```

중 실제 관계에 맞는 modifier를 적용 가능.

---

# 17. Byeong modifier

Byeong은 Personality에서:

```text
나쁜 사람
결함 있는 사람
문제 있는 성격
```

을 뜻하지 않는다.

Byeong은 특정 trait가 구조 내에서
문제를 만들거나 다른 기능을 방해하는 방향으로 작동하는 context다.

---

# 18. Byeong path 필수

Byeong modifier는 반드시 Structural Engine의 실제:

```text
source
→ action
→ target
→ damagedFunction
→ structuralConsequence
```

path를 가져야 한다.

단순 Role label만으로 modifier 생성 금지.

---

# 19. Byeong modifier 예

예:

```text
財가 harmful 七殺을 실제 강화
```

하고 財가 Byeong 역할이라면

Personality에서 財의 기본 특성을 삭제하지 않는다.

가능한 modifier:

```text
평소의 현실적 판단이나 통제 욕구가
압박 상황에서는 과도한 추진 또는 문제 확대 방향으로 기울 수 있음
```

단 이 문장을 직접 생성하는 Renderer는 아직 구현하지 않는다.

내부 modifier 의미만 구조화한다.

---

# 20. Byeong = excessive 금지

금지:

```text
ByeongRole
→ TenGod excessiveExpression
```

자동 활성.

Byeong은 구조적 기능이고 excessive는 Personality 발현 상태다.

---

# 21. GuEung modifier

GuEung은 특정 Byeong을 실제로 해결하는 원국 경로다.

Personality에서는:

```text
resolves_tension
protects_expression
channels_expression
```

등으로 표현 가능.

반드시:

```text
targetByeongId
```

가 존재해야 한다.

---

# 22. GuEung 없는 경우

```text
Byeong 없음
→ GuEung not_applicable
```

또는

```text
Byeong 있음 + GuEung 없음
→ none
```

은 Personality에서도 그대로 존중한다.

GuEung trait를 임의 생성하지 않는다.

---

# 23. ActualStructuralFunction 우선

RoleHistory가 있어도:

```text
CurrentFunction = inactive
```

라면 current Natal personality modifier를 active로 적용하지 않는다.

---

# 24. Runtime 상태 반영

최소:

```text
active
→ modifier confirmed 가능

weakened
→ modifier reduced 가능

stopped
→ modifier inactive
```

---

# 25. stopped Role

RoleHistory는 남긴다.

Personality modifier도 History provenance는 유지 가능.

하지만:

```text
Current personality influence = inactive
```

이어야 한다.

---

# 26. Role와 PersonalityFact 연결

Role은 반드시 실제 해당 글자/십성에서 나온 PersonalityFact와 연결한다.

예:

```text
Role source stem = 甲
TenGod = 偏財
```

라면:

```text
偏財 관련 PersonalityFact
```

만 target 후보가 될 수 있다.

전혀 다른 TenGod trait에 modifier를 걸지 않는다.

---

# 27. Hidden Stem Role

구조 Role source가 지장간이라면
해당 hidden stem TenGod PersonalityFact와 연결 가능.

단 해당 occurrence가 PersonalityFact로 실제 생성되어 있어야 한다.

---

# 28. DayStem 자체 Role

일간 자체는 TenGod이 아니다.

Structural Role이 일간 관련 기능을 평가하더라도
일간을 TenGod Profile에 강제로 매핑하지 않는다.

---

# 29. structural role modifier는 additive

기존:

```text
PersonalityFact
```

를 mutate하여 원래 trait를 지우지 않는다.

권장:

```text
PersonalityFact
+
StructuralRolePersonalityModifier[]
```

형태.

---

# 30. raw Knowledge immutable

다음 Registry는 절대 수정하지 않는다.

```text
DayStemProfile
TenGodProfile
DayPillarProfile
PositionRules
```

Role modifier는 결과 계층에만 추가한다.

---

# 31. role-based conflict

같은 PersonalityFact에:

```text
YongShen modifier
+
Byeong modifier
```

가 동시에 걸릴 수 있다.

이를 허용한다.

---

# 32. 비독점 conflict 예

같은 財가:

```text
YongShen
+
ConditionalByeong
```

이면:

```text
기본적으로 중심 역할
+
특정 조건에서는 문제 경로가 될 가능성
```

둘 다 보존.

---

# 33. favorable current + ConditionalByeong

Structural Engine의 기존 계약:

```text
favorable current function
+
ConditionalByeong
```

동시 가능.

Personality에서도:

```text
현재 생산적 발현
+
조건부 shadow potential
```

을 동시에 보존할 수 있다.

---

# 34. ConditionalByeong은 active shadow가 아니다

금지:

```text
ConditionalByeong
→ shadow trait active
```

자동 처리.

Expected:

```text
modifier status = contextual
```

---

# 35. No-Byeong

Byeong이 없는 명식에서
Personality Engine이 반드시 하나의 문제성 trait를 만들어낼 필요가 없다.

```text
No-Byeong
```

허용.

---

# 36. 역할 기반 성격 우선순위 점수 금지

금지:

```text
YongShen +5
SangShen +3
Byeong -4
GuEung +2
```

---

# 37. 길흉 scoring 금지

Structural Role modifier는:

```text
positive score
negative score
```

가 아니다.

operation/context/status로만 표현한다.

---

# 38. StructuralFunction과 Role direction

가능하면 다음을 분리한다.

```text
Role identity
ActualStructuralFunction
```

예:

```text
RoleHistory = YongShen
CurrentFunction = reduced
```

이면 modifier도 reduced.

---

# 39. PersonalityConflict 확장

기존 P2-D `PersonalityConflict`에
role-based tension을 연결할 수 있다.

예:

```text
base TenGod trait
vs
structural role modifier
```

---

# 40. 기존 conflict 삭제 금지

P2-D에서 생성된:

```text
outward_vs_inner
DayPillar internal conflict
```

를 Role modifier가 덮어쓰지 않는다.

---

# 41. Role conflict 권장 타입

필요하면:

```text
structural_role_tension
structural_role_support
conditional_role_shift
```

등을 추가할 수 있다.

단 실제 구조를 표현하기 위한 최소 범위로 제한한다.

---

# 42. NatalPersonalityResult 확장

기존 결과에 최소:

```ts
structuralRoleModifiers: StructuralRolePersonalityModifier[];
```

를 추가.

필요하면:

```ts
roleConflicts: PersonalityConflict[];
```

추가 가능.

---

# 43. 기존 API 호환

기존:

```ts
buildNatalPersonality(chart)
```

를 깨지 않는다.

권장 방식:

```ts
buildNatalPersonality(chart, structuralResult?)
```

또는 별도:

```ts
applyStructuralRoleModifiers(
  natalPersonality,
  structuralReading
)
```

둘 중 기존 구조와 더 자연스러운 것을 선택.

---

# 44. 책임 분리 권장

개인적으로는 다음 구조 권장:

```text
buildNatalPersonality(chart)
↓
base NatalPersonalityResult

applyStructuralRoleModifiers(
  base,
  structuralReading
)
↓
RoleModifiedNatalPersonalityResult
```

이유:

```text
Knowledge/Personality 계산
≠
Structural Role 연결
```

을 테스트하기 쉬움.

단 현재 코드 구조가 한 entrypoint 확장을 더 자연스럽게 지원하면 그 방식도 허용.

---

# 45. Structural Engine 전체 객체 복사 금지

PersonalityResult 안에 Judgment 전체 결과를 복제 저장하지 않는다.

필요한:

```text
roleId
sourceFactId
ActualStructuralFunction ID
runtime state
```

등 reference만 저장.

---

# 46. provenance

각 Role modifier는 최소:

```text
sourceRoleId
sourceStructuralFactIds
targetPersonalityFactIds
```

추적 가능해야 한다.

---

# 47. deterministic 결과

동일:

```text
CanonicalChart
+
StructuralReading
```

입력은 항상 동일 modifier 결과를 생성해야 한다.

---

# 48. stable ordering

Role modifier 정렬 기준을 명시적으로 둔다.

권장:

```text
targetPersonalityFactId
→ Role canonical order
→ sourceRoleId
```

배열 등록 순서에 의존하지 않는다.

---

# 49. Structural Role order가 priority는 아니다

정렬 순서가:

```text
YongShen > SangShen > Byeong > GuEung
```

같은 의미 우선순위를 뜻하면 안 된다.

단순 stable output ordering만 둔다.

---

# 50. Role non-exclusive fixture

필수 fixture:

```text
same actor
→ YongShen + Byeong
```

Expected:

```text
두 modifier 모두 존재
```

하나가 다른 하나를 삭제하지 않는다.

---

# 51. Active SangShen fixture

원국:

```text
SangShen operating
```

Expected:

```text
target PersonalityFact에
supports/protects/channels modifier
status confirmed
```

---

# 52. Protective Standby fixture

원국:

```text
SangShen protective_standby
```

Expected:

```text
active modifier 강제 금지
contextual/deferred
```

---

# 53. Active Byeong fixture

실제 harmful path 존재.

Expected:

```text
structural role modifier 존재
```

단:

```text
bad personality label 없음
```

---

# 54. ConditionalByeong fixture

Expected:

```text
contextual modifier
```

active shadow 자동 생성 없음.

---

# 55. No-Byeong fixture

Expected:

```text
Byeong modifier count = 0
```

정상 결과.

---

# 56. GuEung fixture

원국 Byeong + 실제 GuEung.

Expected:

```text
targetByeongId preserved
resolves_tension 또는 동등 modifier
```

---

# 57. stopped Role fixture

RoleHistory 존재하지만 source stopped.

Expected:

```text
modifier history/provenance preserved
status inactive
```

Personality Fact 삭제 없음.

---

# 58. weakened Role fixture

Expected:

```text
modifier status reduced
```

---

# 59. Role source 연결 오류 검사

Structural Role source와 target PersonalityFact의 stem/TenGod이 불일치하면
modifier를 만들지 않는다.

보고:

```text
ROLE_PERSONALITY_LINK_MISMATCH
```

---

# 60. source가 Personality Fact가 없는 경우

Structural role source는 존재하지만
Knowledge에 해당 trait가 전혀 없다면:

```text
새 trait 창작 금지
```

modifier target 없음으로 남길 수 있다.

상태:

```text
NO_PERSONALITY_TRAIT_TARGET
```

또는 동등 debug metadata.

---

# 61. source_gap safe

Knowledge source gap이 있어도 Role modifier 구현이 crash하면 안 된다.

---

# 62. Prominence 변경 금지

이번 P2-E에서 Role 때문에:

```text
prominence level
```

을 변경하지 않는다.

P2-D처럼 deterministic 경계가 없는 Prominence는 deferred 유지.

---

# 63. excessive/deficient 변경 금지

금지:

```text
Byeong → excessive
GuEung → productive
```

자동 변환.

---

# 64. productiveExpression과 Role

Role은 base trait의 context를 설명할 수 있지만
Knowledge Registry의 `productiveExpression`을 직접 toggle하는 별도 규칙이
마스터에 없다면 자동 활성화하지 않는다.

---

# 65. StructuralRoleModifier와 Renderer 분리

이번 단계는 내부 의미만 구현.

예:

```text
operation = channels_expression
```

까지.

다음 같은 고객 문장 생성 금지:

```text
당신의 경쟁심은 오히려 문제를 해결하는 힘으로 쓰입니다.
```

Renderer는 후속 단계.

---

# 66. 개인정보/운명 단정 추가 금지

Role modifier를 이유로:

```text
직업 성공
재물 결과
배우자 관계
건강
```

를 Personality Result에 추가하지 않는다.

---

# 67. 권장 파일

```text
src/lib/personality/modifiers/
├─ structuralRoleModifier.ts
├─ linkRoleToPersonalityFacts.ts
└─ rolePersonalityTypes.ts
```

실제 구조에 맞게 조정 가능.

---

# 68. 기존 types 확장

필요하면:

```text
src/lib/personality/types.ts
```

만 최소 확장.

Knowledge Registry schema 자체는 변경하지 않는다.

---

# 69. 신규 verification

권장:

```text
scripts/verify-personality-role-modifier-p2e.mjs
```

---

# 70. 필수 검증

최소:

```text
A. YongShen modifier
B. Active SangShen
C. Protective Standby SangShen
D. Active Byeong
E. ConditionalByeong
F. No-Byeong
G. GuEung
H. stopped Role
I. weakened Role
J. Role non-exclusive
K. source_gap safe
L. Role-Personality link mismatch
```

---

# 71. 기존 Personality 검증

반드시:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
```

유지.

---

# 72. Structural Judgment 회귀

이번 단계는 Judgment 출력 타입/데이터를 읽기 시작하므로
기존 Judgment 전체 회귀도 실행한다.

최소:

```text
P0
P1-1
P1-2
P1-3
P1-fix
P1-closure
P1-lifecycle
```

현재 프로젝트의 전체 Judgment verification 명령이 있으면 그것을 사용한다.

---

# 73. Judgment expectation 변경 금지

Personality 연결을 위해 기존 Judgment fixture 기대값을 수정하지 않는다.

---

# 74. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 75. no reverse dependency 검사

반드시:

```text
Judgment → Personality imports = 0
```

확인.

---

# 76. no scoring 검사

`src/lib/personality/`에서 성격 방향 수치 scoring:

```text
roleScore
positiveWeight
negativeWeight
modifierWeight
```

등 0.

---

# 77. 결과 파일

```text
src/docs/codex/p2e-personality-structural-role-modifier-result.md
```

---

# 78. 최종 보고 형식

## A. 전체 판정

```text
READY_FOR_CURRENT_PERSONALITY_ENGINE
```

또는:

```text
P2E_FIX_REQUIRED
```

---

## B. 구현

| 영역 | 파일/함수 | 결과 |
|---|---|---|
| Role linking | | |
| YongShen modifier | | |
| SangShen modifier | | |
| Protective standby | | |
| Byeong modifier | | |
| ConditionalByeong | | |
| GuEung modifier | | |
| stopped/reduced role | | |
| role conflict | | |

---

## C. 역할별 결과

```text
YongShen modifiers:
SangShen modifiers:
Byeong modifiers:
GuEung modifiers:
```

테스트 fixture 기준으로 보고.

---

## D. 비독점성

```text
same actor multi-role:
favorable current + ConditionalByeong:
```

결과 보고.

---

## E. 구조 격리

```text
Judgment source modifications:
Judgment fixture modifications:
Judgment → Personality imports:
```

원칙적으로 모두 0.

---

## F. 회귀

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:

P0:
P1-1:
P1-2:
P1-3:
P1-fix:
P1-closure:
P1-lifecycle:

tsc:
build:
```

---

## G. 남은 상태

```text
FAIL:
PARTIAL:
DEFERRED:
ROLE_PERSONALITY_LINK_MISMATCH:
NO_PERSONALITY_TRAIT_TARGET:
NOT_IMPLEMENTED:
```

---

# 79. 종료 조건

다음 조건이면:

```text
READY_FOR_CURRENT_PERSONALITY_ENGINE
```

판정.

```text
[ ] Role modifier additive
[ ] Personality base 삭제 없음
[ ] YongShen != good personality
[ ] Byeong != bad personality
[ ] SangShen standby 구분
[ ] ConditionalByeong contextual
[ ] GuEung targetByeongId 유지
[ ] stopped → inactive
[ ] weakened → reduced
[ ] role non-exclusive 유지
[ ] numeric scoring 없음
[ ] prominence 변경 없음
[ ] Judgment reverse dependency 없음
[ ] Personality A-E PASS
[ ] Judgment regression PASS
[ ] tsc/build PASS
```

---

# 80. 다음 단계

P2-E 통과 후 다음은:

```text
P2-F
Current Personality Engine
```

이다.

그 단계에서 처음으로:

```text
NatalPersonality
+
Daewoon
+
Sewoon
+
Month
+
Day
→ CurrentPersonalityExpression
```

을 계산한다.

원국 Personality는 History/base로 유지하고,
운은 현재 발현을 바꾸는 layer로만 추가한다.