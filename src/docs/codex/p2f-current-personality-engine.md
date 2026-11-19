# FILUNE Codex P2-F
## Current Personality Engine 구현

P2-E까지 다음이 완료되었다.

```text
Knowledge Layer
DayStemProfile[10]
TenGodProfile[10]
PositionRules[6]
DayPillarProfile[60]

↓
P2-D Natal Personality Core

↓
P2-E StructuralRoleModifier
```

현재 상태:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS

Judgment regression PASS

FAIL 0
PARTIAL 0
```

이번 단계에서는 처음으로 운에 따른 **현재 성격 발현(Current Personality Expression)** 을 구현한다.

---

# 1. 최우선 원칙

반드시 다음을 분리한다.

```text
NatalPersonality
≠
CurrentPersonalityExpression
```

원국 성격은 삭제하거나 덮어쓰지 않는다.

운은:

```text
타고난 성격을 교체
```

하는 것이 아니라:

```text
현재 시기에 드러나는 성향
현재 활성/약화되는 구조 역할
임시로 들어온 십성의 표현
```

을 추가하는 layer다.

---

# 2. 의존 방향

허용:

```text
Canonical / Judgment Scope Snapshots
↓
Personality Engine
```

금지:

```text
Personality
↓
Judgment
```

`src/lib/judgment/`에서 personality module을 import하면 FAIL.

---

# 3. Structural Judgment 재계산 금지

Personality Engine 내부에서 다음을 다시 계산하지 않는다.

```text
PatternContext
YongShen
SangShen
Byeong
GuEung
StemRuntime
PatternEffectPolicy
ActualStructuralFunction
LuckEffect
```

이미 Judgment Engine이 만든 scope snapshot을 읽는다.

---

# 4. Scope

지원 범위:

```text
natal
daewoon
sewoon
month
day
```

흐름:

```text
Natal
→ Daewoon
→ Sewoon
→ Month
→ Day
```

---

# 5. 운별 강도 점수 금지

다음과 같은 hierarchy를 만들지 않는다.

```text
Daewoon = 100
Sewoon = 70
Month = 40
Day = 10
```

금지.

운 Scope의 차이는 기본적으로:

```text
유효기간
발생 시점
현재 적용 범위
```

의 차이다.

숫자 weight를 두지 않는다.

---

# 6. CurrentPersonalityResult

권장 구조:

```ts
interface CurrentPersonalityResult {
  natal: NatalPersonalityResult;

  evaluationScope: JudgmentScope;

  scopeExpressions: PersonalityScopeExpression[];

  currentFacts: CurrentPersonalityFact[];

  structuralRoleModifiers: StructuralRolePersonalityModifier[];

  conflicts: PersonalityConflict[];

  effectHistory: PersonalityEffectHistory[];

  provenanceIds: string[];
}
```

기존 타입 구조에 맞게 조정 가능.

---

# 7. Natal immutable

`NatalPersonalityResult`를 scope 계산 중 mutate하지 않는다.

금지:

```text
Daewoon이 들어옴
→ natal.facts 변경
```

허용:

```text
Natal facts 유지

+

Daewoon current-expression layer
```

---

# 8. PersonalityScopeExpression

권장:

```ts
interface PersonalityScopeExpression {
  scope: JudgmentScope;

  period?: {
    start: Date;
    end: Date;
  };

  inheritedFactIds: string[];

  temporaryFactIds: string[];

  roleModifierIds: string[];

  conflictIds: string[];

  currentlyEffective: boolean;
}
```

---

# 9. CurrentPersonalityFact

Natal Fact 자체를 복사해서 변경하기보다 현재 상태를 별도로 둔다.

예:

```ts
interface CurrentPersonalityFact {
  personalityFactId: string;

  origin:
    | "natal"
    | "luck";

  originScope: JudgmentScope;

  state:
    | "baseline"
    | "active"
    | "contextual"
    | "reduced"
    | "inactive"
    | "deferred";

  currentlyEffective: boolean;

  sourceLuckFactIds?: string[];
  sourceStructuralEffectIds?: string[];
}
```

---

# 10. 원국 기본 성격

원국 PersonalityFact는 기본적으로:

```text
origin = natal
state = baseline
```

으로 유지한다.

운에서 역할 상태가 변해도 PersonalityFact 자체를 삭제하지 않는다.

---

# 11. 운에 들어온 글자의 Personality

대운·세운·월운·일진에 새 천간/지지가 들어오면
기존 canonical TenGod 계산 결과를 사용하여
**temporary personality expression 후보**를 만들 수 있다.

새 TenGod 계산식을 만들지 않는다.

---

# 12. 운 천간

운 천간 TenGod은:

```text
temporary outward expression
```

후보로 사용할 수 있다.

즉 현재 시기에:

```text
외부 행동
사회적 표현
말과 행동에서 드러나는 태도
```

측면으로 나타나는 임시 context다.

---

# 13. 운 지지

운 지지 및 기존 canonical hidden-stem TenGod은:

```text
temporary inner / judgment context
```

후보로 사용할 수 있다.

단 P2-D에서 사용한 branch personality extraction 계약을 재사용한다.

새 지지 성격 규칙을 만들지 않는다.

---

# 14. 운 글자 = 새 타고난 성격 금지

금지:

```text
Daewoon 正官
→ NatalPersonality에 正官 trait 영구 추가
```

Expected:

```text
temporary CurrentPersonalityFact
originScope = daewoon
```

---

# 15. 운 TenGod profile 사용

운 TenGod도 P2-A의:

```text
TenGodProfile
```

을 재사용한다.

별도 `LuckTenGodProfile`을 새로 만들지 않는다.

---

# 16. 기본 발현 범위

운 TenGod occurrence만으로:

```text
coreDrive
ordinaryExpression
```

등 source-supported base trait의 temporary candidate를 만들 수 있다.

하지만 다음 전체를 자동 활성화하지 않는다.

```text
productiveExpression
excessiveExpression
deficientExpression
```

---

# 17. excessive 자동 활성 금지

금지:

```text
원국에도 傷官
+
대운에도 傷官
→ excessiveExpression
```

반복 자체는 evidence일 수 있지만 과다 성격으로 자동 판정하지 않는다.

---

# 18. deficient 자동 활성 금지

운에서 특정 TenGod이 사라졌다는 이유로
deficientExpression을 활성화하지 않는다.

---

# 19. Prominence

P2-D에서 deterministic 경계 부족으로:

```text
Prominence = deferred
```

상태를 유지했다.

P2-F에서도 임의로 해결하지 않는다.

---

# 20. 운 때문에 Prominence 점수화 금지

금지:

```text
Natal occurrence + luck occurrence
→ prominent
```

자동 판정.

Prominence 계약은 별도 연구/승인 전까지 기존 deferred를 유지한다.

---

# 21. Scope duration

각 temporary Fact에는 반드시:

```text
originScope
period
currentlyEffective
```

를 추적한다.

---

# 22. 유효기간 종료

운의 유효기간이 끝나면:

```text
temporary PersonalityFact history = 유지 가능
currentlyEffective = false
```

로 바뀐다.

Natal Personality로 편입하지 않는다.

---

# 23. Luck Personality history

Structural Engine의 LuckEffect lifecycle과 같은 원칙을 따른다.

구분:

```text
과거에 이 성향이 현재 표현에 들어온 적이 있음
≠
지금도 유효함
```

---

# 24. Event 중복 금지

대운에서 만들어진 temporary personality effect가
세운·월운으로 승계될 때 같은 event를 새로 만들지 않는다.

가능하면:

```text
originEffectId
originScope
inherited
currentlyEffective
```

를 보존한다.

---

# 25. Scope inheritance

예:

```text
Daewoon에서 正官 temporary expression 발생
```

해당 대운 안의 세운에서는
대운의 현재 발현 context가 계속 유효할 수 있다.

하지만:

```text
새 正官 personality event 생성
```

으로 중복 기록하지 않는다.

---

# 26. 다음 대운

대운이 종료되면 이전 대운 temporary expression은:

```text
currentlyEffective = false
expired = true
```

또는 동등 lifecycle 상태.

---

# 27. StructuralRoleModifier 재평가

P2-E에서 원국 StructuralRoleModifier를 만들었다.

운에서는 Judgment scope snapshot의:

```text
Role CurrentState
CurrentFunction
LuckEffect
```

를 읽고 modifier의 현재 상태를 재평가한다.

---

# 28. RoleHistory 유지

예:

원국:

```text
印 = SangShen
```

대운에서 합거:

```text
RoleHistory = SangShen
CurrentFunction = inactive
```

Personality에서도:

```text
기본 印 trait 유지
SangShen modifier current state = inactive
```

로 한다.

---

# 29. weakens_sangshen

Judgment LuckEffect:

```text
weakens_sangshen
```

이 현재 유효하다면
해당 StructuralRolePersonalityModifier를:

```text
confirmed → reduced
또는
confirmed → inactive
```

로 실제 Role CurrentState에 맞춰 재평가한다.

LuckEffect 이름만 보고 임의 방향을 만들지 않는다.

---

# 30. activates_sangshen_function

원국:

```text
protective_standby
```

였던 SangShen이 운에서 실제 활성화되면:

```text
modifier
contextual → confirmed
```

또는 실제 role 상태에 맞는 current status로 전환한다.

---

# 31. activates_byeong

ConditionalByeong이 운에서 실제 활성화되면:

P2-E의:

```text
contextual role modifier
```

를 current scope에서:

```text
confirmed
```

으로 바꿀 수 있다.

단 나쁜 성격으로 변환하지 않는다.

---

# 32. Byeong activation 의미

금지:

```text
Byeong 활성화
→ shadow trait 전체 활성
```

대신:

```text
기존 PersonalityFact가
현재 문제 경로에서 실제로 사용되는 context
```

를 나타낸다.

---

# 33. relieves_byeong

Judgment에서:

```text
relieves_byeong
```

이 현재 유효하면:

```text
Byeong-related current modifier
→ reduced / inactive
```

로 재평가 가능.

RoleHistory는 유지.

---

# 34. relief 종료

relief 운이 끝나면
현재 Judgment snapshot에서 Byeong path가 다시 작동하는지 읽는다.

과거 relief event 때문에 영구 inactive 처리하지 않는다.

---

# 35. attacks_yongshen

Judgment Effect:

```text
attacks_yongshen
```

이 있다고 해서
YongShen TenGod의 Personality trait를 삭제하지 않는다.

가능:

```text
YongShen structural modifier current status
→ reduced / inactive
```

실제 Runtime/ActualStructuralFunction에 따라.

---

# 36. protects_yongshen

반대로 보호 효과가 현재 작동하면:

```text
YongShen structural modifier
```

의 현재 기능 상태에 반영한다.

새 Personality trait 창작 금지.

---

# 37. Luck actor와 RoleHistory 구분

운 글자는 일반적으로 새 원국 RoleHistory를 만들지 않는다.

따라서 Personality에서도:

```text
luck actor TenGod expression
```

과:

```text
Natal StructuralRoleModifier
```

를 분리한다.

---

# 38. 운 글자에 YongShenRole 생성 금지

금지:

```text
Daewoon stem manifests YongShen
→ luck stem에 natal YongShen personality role 영구 생성
```

Judgment의 `manifests_yongshen`은 현재 구조 Effect다.

Personality에서는 temporary current context로만 읽는다.

---

# 39. manifests_yongshen

현재 운에서 YongShen manifestation이 발생하면:

```text
temporary personality expression
+
structural current context
```

를 연결할 수 있다.

하지만:

```text
가장 강한 Personality
```

로 자동 승격하지 않는다.

---

# 40. changes_pattern_mode

PatternMode 변경이 발생했다고 해서
Personality trait를 직접 생성하지 않는다.

다만 Role/ActualStructuralFunction 변화가 생겼다면
그 결과 modifier 상태를 반영한다.

---

# 41. Root / Formation / Capacity

다음 LuckEffect 자체로 새 Personality trait를 만들지 않는다.

```text
changes_root_state
changes_formation
changes_capacity
```

이것들은 Structural Engine의 현재 기능 판정에 반영된 결과를 통해 간접적으로만 사용한다.

---

# 42. Structural 결과가 우선

Personality Engine이:

```text
root strengthened
→ 성격 강함
```

같은 새 규칙을 만들지 않는다.

---

# 43. Current Conflict

운에서 들어온 temporary trait와 Natal trait가 상반될 수 있다.

둘 중 하나를 삭제하지 않는다.

예:

```text
Natal = 신중함
Current luck = 빠른 외부 대응
```

이면:

```text
PersonalityConflict
resolution = context_split 또는 coexist
```

가능.

---

# 44. Natal vs Current conflict

새 conflict type을 최소한으로 추가 가능:

```text
natal_vs_current
temporary_expression_tension
```

실제 필요한 경우만.

---

# 45. scope context

같은 trait라도:

```text
Natal
Daewoon
Sewoon
Month
Day
```

origin을 구분한다.

---

# 46. 상위/하위 scope 충돌

대운 temporary expression과 세운 temporary expression이 상반돼도
숫자로 어느 쪽이 더 강한지 결정하지 않는다.

둘 다 현재 context로 보존할 수 있다.

---

# 47. 기간 차이 표현

대운/세운/월운/일진의 차이는:

```text
scope
period
```

로 표현한다.

강도 점수로 표현하지 않는다.

---

# 48. Day-luck

일진도 다른 scope와 동일한 lifecycle 원칙을 사용한다.

단 하루 효과를 장기 성격으로 저장하지 않는다.

---

# 49. 현재 결과와 이력 분리

권장:

```ts
interface PersonalityEffectHistory {
  id: string;

  type:
    | "temporary_ten_god_expression"
    | "role_modifier_change"
    | "conflict_activation";

  originScope: JudgmentScope;

  originPeriod?: {
    start: Date;
    end: Date;
  };

  currentlyEffective: boolean;
  expired: boolean;

  sourceIds: string[];
}
```

---

# 50. CurrentPersonalityResult는 현재 상태

현재 사용자에게 보여줄 수 있는 계산의 내부 source는:

```text
NatalPersonalityResult
+
currentlyEffective CurrentPersonalityFacts
+
currentlyEffective RoleModifiers
+
Current Conflicts
```

이다.

과거 expired effects는 current output의 활성 내용에 포함하지 않는다.

---

# 51. History 삭제 금지

expired effect를 삭제하지 않는다.

debug/audit용 history에 보존한다.

---

# 52. Current expression 종료

예:

```text
Daewoon 劫財
→ temporary competitive expression
```

새 대운으로 바뀌면:

```text
previous effect expired
```

해야 한다.

Natal 劫財 Fact가 원래 존재하면 그 Natal Fact는 그대로 유지.

---

# 53. 원국과 동일 TenGod 운

원국에 이미 같은 TenGod이 있어도
운에서 같은 TenGod이 들어오면:

```text
Natal Fact를 복제하지 않는다.
```

가능한 구조:

```text
same PersonalityFact
+
temporary expression evidence
```

또는 별도 temporary context reference.

---

# 54. 중복 trait 방지

동일 문구를:

```text
Natal
Daewoon
Sewoon
```

세 번 output fact로 복제하지 않는다.

origin/evidence를 여러 개 연결하는 방식을 우선한다.

---

# 55. 단 context가 다르면 분리 가능

예:

```text
Natal branch 正官 = inner
Daewoon stem 正官 = outward temporary
```

는 같은 TenGod이어도 context가 다르므로 별도 CurrentExpression 가능.

---

# 56. 고객 문장 생성 금지

이번 단계에서는:

```text
요즘은 평소보다 경쟁심이 강해졌어요.
```

같은 문장을 만들지 않는다.

내부 구조만 생성한다.

---

# 57. 과거 사건 단정 금지

Current Personality Engine은:

```text
지난해 성격이 변했다
직장을 옮겼다
관계가 깨졌다
```

같은 사건을 생성하지 않는다.

---

# 58. Personality Effect와 Outcome 분리

현재 성격 표현은 현실 사건 결과가 아니다.

```text
temporary impulsive expression
≠
실수 발생
```

---

# 59. 권장 entry point

기존:

```ts
buildNatalPersonality(chart)
```

는 유지.

새 함수 권장:

```ts
buildCurrentPersonality({
  natalPersonality,
  structuralScopes,
  evaluationScope,
})
```

또는 현재 코드 구조에 맞는 동등 API.

---

# 60. Natal 자동 재계산 금지

가능하면 이미 생성된:

```text
NatalPersonalityResult
```

를 입력받는다.

매 scope마다 base를 처음부터 새로 만드는 방식은 피한다.

---

# 61. Structural scope snapshots 입력

Personality Current Engine은
Judgment Engine이 이미 만든 immutable scope snapshot을 입력받는다.

예:

```text
NatalState
DaewoonState
SewoonState
MonthState
DayState
```

---

# 62. Scope 순서

항상:

```text
Natal
→ Daewoon
→ Sewoon
→ Month
→ Day
```

stable order.

---

# 63. Parent state mutation 금지

Daewoon PersonalityScopeExpression을
Sewoon 계산 중 mutate하지 않는다.

각 scope는 독립 snapshot.

---

# 64. inherited effect

상위 scope current expression이 하위 scope에서도 유효하면:

```text
inherited = true
currentlyEffective = true
```

하위 scope 새 origin으로 바꾸지 않는다.

---

# 65. scope expiry

상위 scope 유효기간이 끝난 다음 period에서는
해당 inherited personality effect도 current state에서 제거한다.

History는 유지.

---

# 66. evaluation time

Structural Engine이 이미 평가시점 기준으로 유효 scope를 선택했다면
그 결과를 우선 사용한다.

Personality Engine이 독립적으로 다른 운 기간을 선택하지 않는다.

---

# 67. direct core safety

가능하면 Current Personality Engine도
만료된 scope snapshot/effect를 받았을 때:

```text
currentlyEffective = false
```

를 존중한다.

expired effect를 current trait로 되살리지 않는다.

---

# 68. Unknown hour

시각 미확정이면 Natal과 동일하게:

```text
hour personality facts
```

를 생성하지 않는다.

운 계산 때문에 시주를 역추정하지 않는다.

---

# 69. SOURCE_GAP

Knowledge source gap은 여전히 정상 입력이다.

운 TenGod Profile field가 비어 있으면:

```text
trait 생성 안 함
```

으로 끝낸다.

추론해서 보충하지 않는다.

---

# 70. 戊午 SOURCE_CONFLICT

기존 canonical:

```text
戊午 dayBranchTenGod = 正印
```

유지.

Current Engine에서도 원자료의 잘못된 `偏財` 표기를 사용하지 않는다.

---

# 71. Prominence 계약 유지

반드시 최종 보고에:

```text
Prominence remains deferred
```

여부를 명시한다.

이번 작업에서 임의 resolver를 추가하면 FAIL.

---

# 72. Numeric scoring 금지

전체 `src/lib/personality/` 검사.

금지 예:

```text
luckWeight
scopeWeight
traitScore
currentScore
personalityStrength
modifierScore
```

정성 상태/맥락만 사용.

---

# 73. Scope priority scoring 금지

금지:

```text
day overrides month
month overrides year
```

같은 전역 우선순위.

실제 structural state와 각 context를 보존한다.

---

# 74. 테스트 A — Natal immutable

원국 성격 생성 후 여러 luck scope 계산.

Expected:

```text
NatalPersonalityResult deep equality 유지
```

---

# 75. 테스트 B — Daewoon temporary expression

대운 천간에 원국에 없던 TenGod 진입.

Expected:

```text
temporary expression 존재
originScope = daewoon
Natal facts 변화 0
```

---

# 76. 테스트 C — Sewoon inheritance

대운 temporary expression이 세운 시점에도 유효.

Expected:

```text
same origin history
inherited = true
duplicate event = 0
```

---

# 77. 테스트 D — Daewoon expiry

새 대운 진입.

Expected:

```text
old temporary effect expired
current output에서 active 아님
history retained
```

---

# 78. 테스트 E — Month expression

월운 TenGod에 따른 temporary current context 생성.

월 종료 후 current effect 종료.

---

# 79. 테스트 F — Day expression

일진 temporary expression 생성.

다음 일진에서 이전 effect current=false.

---

# 80. 테스트 G — SangShen activation

Natal:

```text
protective_standby
```

Luck:

```text
activates_sangshen_function
```

Expected:

```text
Role PersonalityModifier
contextual → confirmed
```

---

# 81. 테스트 H — SangShen stop

Luck:

```text
weakens_sangshen
CurrentState = stopped
```

Expected:

```text
Role modifier inactive
Natal PersonalityFact remains
```

---

# 82. 테스트 I — ConditionalByeong activation

Natal:

```text
ConditionalByeong contextual
```

Luck:

```text
activates_byeong
```

Expected:

```text
current role modifier confirmed
```

다른 shadow trait 전체 자동 활성화 금지.

---

# 83. 테스트 J — Byeong relief

Luck:

```text
relieves_byeong
```

Expected:

```text
current Byeong modifier reduced/inactive
RoleHistory retained
```

---

# 84. 테스트 K — relief expiry

relief source 종료.

Judgment current snapshot에서 Byeong path 재활성.

Expected:

```text
current modifier re-evaluated
past relief history retained
```

---

# 85. 테스트 L — YongShen attack/protection

`attacks_yongshen` / `protects_yongshen` 각각에서:

```text
Natal trait 삭제 없음
StructuralRoleModifier current status만 재평가
```

확인.

---

# 86. 테스트 M — same TenGod duplicate

Natal + Daewoon + Sewoon에 같은 TenGod.

Expected:

```text
동일 trait 문구 무한 복제 없음
origin/evidence 구분
```

---

# 87. 테스트 N — outward vs current inner conflict

Natal outward trait와
current luck branch temporary trait가 상반.

Expected:

```text
두 Fact 유지
Current PersonalityConflict 생성
```

---

# 88. 테스트 O — source gap

현재 운 TenGod Profile의 일부 field가 비어 있음.

Expected:

```text
no crash
no invented trait
```

---

# 89. 테스트 P — unknown hour

시각 미확정 원국 + current luck.

Expected:

```text
hour-derived fact = 0
luck expression 정상
```

---

# 90. 테스트 Q — expired direct input

expired LuckEffect/Scope를 직접 current engine에 전달.

Expected:

```text
current Personality influence = 0
history only
```

---

# 91. 테스트 R — deterministic

동일 입력:

```text
NatalPersonality
+
Judgment snapshots
+
evaluationScope
```

에서 동일 ID/정렬/결과.

---

# 92. stable ordering

권장 정렬:

```text
scope
→ origin
→ position
→ TenGod canonical order
→ fact id
```

단순 출력 안정성 기준.

의미 점수 아님.

---

# 93. Role modifier lifecycle

P2-E RoleModifier 자체를 매 scope 새로 복제하지 않는다.

권장:

```text
modifier identity
+
scope state
```

분리.

---

# 94. Current conflicts lifecycle

temporary trait가 만료되면
그 trait와 관련된 current conflict도:

```text
currentlyEffective = false
```

또는 current conflict 목록에서 제외.

History 보존 가능.

---

# 95. raw Knowledge immutable

다음 파일은 이번 작업에서 원칙적으로 수정하지 않는다.

```text
dayStemProfiles
tenGodProfiles
dayPillarProfiles
positionRules
```

Knowledge 결함을 발견하면 보고만 한다.

---

# 96. Judgment immutable

기존 Judgment 결과를 Current Personality 테스트에 맞추기 위해 변경하지 않는다.

---

# 97. 권장 파일 구조

예:

```text
src/lib/personality/current/
├─ currentPersonality.ts
├─ luckPersonalityFacts.ts
├─ personalityScopeState.ts
├─ personalityEffectHistory.ts
├─ currentRoleModifiers.ts
└─ currentConflicts.ts
```

기존 프로젝트 구조에 맞게 조정 가능.

---

# 98. Verification script

권장:

```text
scripts/verify-current-personality-p2f.mjs
```

---

# 99. 기존 Personality 회귀

모두 실행:

```text
P2-A
P2-B
P2-C
P2-D
P2-E
```

PASS 필요.

---

# 100. Judgment 회귀

전체 Judgment regression도 실행한다.

특히:

```text
P0
P1-1
P1-2
P1-3
P1-fix
P1-closure
P1-lifecycle
```

기존 결과 유지.

---

# 101. tsc/build

```text
npx tsc -b
npm run build
```

PASS.

---

# 102. reverse dependency

다시 검사:

```text
Judgment → Personality import = 0
```

---

# 103. 신규 결과 파일

```text
src/docs/codex/p2f-current-personality-engine-result.md
```

---

# 104. 최종 보고

## A. 전체 판정

```text
READY_FOR_PERSONALITY_RENDERER_AUDIT
```

또는:

```text
P2F_FIX_REQUIRED
```

---

## B. Current Engine

| 영역 | 구현 | 테스트 | 결과 |
|---|---|---|---|
| Natal immutable | | | |
| Daewoon expression | | | |
| Sewoon inheritance | | | |
| Month expression | | | |
| Day expression | | | |
| Scope expiry | | | |
| Effect history | | | |
| Current conflicts | | | |
| Current RoleModifier | | | |

---

## C. Role lifecycle

```text
SangShen activation:
SangShen weakening:
ConditionalByeong activation:
Byeong relief:
Byeong relief expiry:
YongShen attack/protection:
```

---

## D. Temporary personality

```text
temporary luck facts:
duplicate suppression:
expired facts:
history preservation:
```

---

## E. Prominence

```text
Prominence resolver changed:
Prominence remains deferred:
numeric threshold introduced:
```

Expected:

```text
changed = no
remains deferred = yes
numeric threshold = no
```

---

## F. 회귀

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:

Judgment:
tsc:
build:
```

---

## G. 구조 격리

```text
Judgment source changes:
Knowledge Registry changes:
Judgment → Personality imports:
```

원칙적으로 모두 0.

---

## H. 남은 상태

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
```

---

# 105. 종료 조건

다음 조건을 모두 충족하면:

```text
READY_FOR_PERSONALITY_RENDERER_AUDIT
```

판정한다.

```text
[ ] Natal Personality immutable
[ ] luck expression temporary
[ ] Daewoon/Sewoon/Month/Day scope 지원
[ ] inherited effects 중복 생성 없음
[ ] expired effect current output 제외
[ ] effect history 유지
[ ] role modifier current state 반영
[ ] ConditionalByeong active/contextual 구분
[ ] relief expiry 재평가
[ ] Natal/current conflict 공존
[ ] source gap safe
[ ] prominence deferred 유지
[ ] numeric scoring 없음
[ ] Knowledge mutation 없음
[ ] Judgment mutation 없음
[ ] reverse dependency 없음
[ ] Personality A-F PASS
[ ] Judgment regression PASS
[ ] tsc/build PASS
```

---

# 106. 다음 단계

P2-F 통과 후 바로 고객 문장을 작성하지 않는다.

먼저:

```text
P2-G
Personality Engine Final Integration Audit
```

를 수행한다.

감사 범위:

```text
Knowledge
→ Natal Personality
→ StructuralRoleModifier
→ Current Personality
```

전체다.

그 감사에서:

```text
FAIL = 0
NOT_IMPLEMENTED = 0
```

가 확인된 후에만
고객용 Personality Renderer를 구현한다.