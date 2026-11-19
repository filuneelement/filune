# FILUNE Codex P1 통합감사 보완
## 정책 충돌 · 상태 승계 · LuckEffect 수정

이번 작업은 P1 전체 통합 감사에서 확인된 **3개 FAIL만 수정**한다.

새로운 격국 Policy, Personality Engine, Palace, Renderer는 구현하지 않는다.

---

# 1. 기준 문서

최우선:

- `src/docs/rules/master/05-sangshen-byeong-gueung-master.md`
- `src/docs/rules/master/06-pattern-effect-policy.md`
- `src/docs/rules/master/07-pattern-effect-policy-audit.md`
- `src/docs/rules/master/08-luck-master.md`
- `src/docs/rules/master/09-engine-integration-spec.md`
- `src/docs/rules/master/10-implementation-audit.md`

필요 시:

- `01-pattern-master.md`
- `02-peer-rob-yangblade-master.md`

기존 P0/P0.1/P1-1/P1-2/P1-3 계약을 변경하지 않는다.

---

# 2. 수정 대상 FAIL 1
## 칠살격 Policy 충돌

현재 문제:

```text
食神이 과도함
+
食神이 현재 七殺 제어에 필요함
```

조건이 동시에 들어올 경우 서로 반대 방향의 Policy가 동시에 match된다.

현재 Registry 배열 순서에 따라 한쪽이 선택되는 것은 금지한다.

---

# 3. Policy 충돌 해결 원칙

Policy는 배열 순서가 아니라 **specificity와 구조적 선행조건**으로 결정한다.

최소적으로 다음 우선순위를 구현한다.

```text
more specific conditions
>
less specific conditions
```

예:

```text
七殺格
+
食神制殺 실제 작동
+
食神이 현재 required SangShen
```

은 단순:

```text
食神 excessive
```

보다 우선해서 평가되어야 한다.

---

# 4. 食神過多와 必要食神의 관계

둘을 전역적으로 반대 Policy 두 개로 동시에 확정하지 않는다.

다음처럼 구조화한다.

### Case A
```text
食神이 七殺을 제어하는 데 실제 필요
+
七殺이 해로움
```

기본:

```text
食神制殺 = favorable
```

### Case B
```text
食神이 과도
+
七殺이 부족
+
제살이 지나침
```

가능:

```text
食神 추가 제어 = unfavorable_candidate
또는
印의 식신 제어 = favorable_candidate
```

### Case C
```text
食神이 과도하다는 근거는 있으나
현재 七殺 제어 필요성과의 우선관계가 불명
```

```text
deferred
```

로 유지한다.

---

# 5. 칠살격 Policy Resolver 수정

필수:

```text
PatternContext
+
ActualRelationPath
+
RequiredFunction
+
ExcessEvidence
+
CapacityEvidence
```

를 통해 Policy를 결정한다.

다음 금지:

```text
first matching array item wins
```

---

# 6. deterministic policy resolution

PolicyResolution은 최소 다음을 지원해야 한다.

```text
matchedPolicies[]
selectedPolicy
selectionReason
```

가능하면:

```text
specificity
requiredConditionCount
```

같은 정성적 선택 근거를 남긴다.

단 숫자 길흉 scoring은 금지한다.

---

# 7. 충돌 감지

서로 반대 방향 Policy가 동시에 match되고 명확한 specificity 우선순위가 없으면:

```text
direction = deferred
```

를 반환한다.

조용히 배열 앞쪽 Policy를 선택하지 않는다.

---

# 8. 수정 대상 FAIL 2
## 차단된 harmful path의 하위 scope 승계

현재 문제:

상위 운에서 원국의 harmful path가 합거 등으로 차단되었는데,

하위 scope에서 해당 원국 Relation/Role을 다시 평가하면서:

```text
operating
```

으로 되돌리는 경우가 있다.

---

# 9. History와 CurrentEffect 분리

반드시 다음을 구분한다.

```text
RelationHistory
RoleHistory
```

와

```text
CurrentRuntimeState
CurrentStructuralEffect
CurrentRoleFunction
```

---

# 10. inherited blocked path

상위 scope에서 다음이 발생:

```text
source stopped
또는
target stopped
또는
required relation path broken
```

이면 하위 scope에서 별도의 reactivation trigger가 없는 한:

```text
CurrentStructuralEffect = inactive
```

를 유지한다.

---

# 11. 자동 재활성화 금지

금지:

```text
원국 RelationFact가 존재함
→ 하위 scope에서 operating으로 복귀
```

RelationFact는 History로 존재할 수 있지만 현재 작동은 RuntimeState를 따라야 한다.

---

# 12. reactivation 조건

하위 scope에서 다시 operating으로 돌아가려면 명시적인 reactivation 조건이 필요하다.

예:

```text
stopped 상태 종료
새로운 유효 source 생성
새로운 관계 경로 형성
상위 차단 조건 소멸
```

현재 FILUNE 규칙에 정의되지 않은 reactivation은 임의 생성하지 않는다.

---

# 13. inherited structural effect 필드

기존 구조를 크게 바꾸지 않는 범위에서 최소 다음 의미를 보존한다.

```text
originScope
inherited
currentlyEffective
blockedBy
```

또는 동등 필드.

---

# 14. 하위 scope 재평가 순서

```text
inherit parent runtime/effect
↓
apply current scope changes
↓
check whether blocking condition is removed
↓
only then recompute active function
```

원국부터 새로 계산하여 parent block을 덮어쓰지 않는다.

---

# 15. 수정 대상 FAIL 3
## 정관격 SangShen의 LuckEffect 누락

현재 문제:

원국에서 印이:

```text
SangShen
```

역할을 하고 있는데 대운에서 합거되어:

```text
RoleHistory = SangShen
CurrentState = stopped
CurrentFunction = inactive
```

가 됨.

그런데:

```text
LuckEffect = weakens_sangshen
```

이 기록되지 않는다.

---

# 16. SangShen 상태 변화 감지

LuckEffect builder는 parent/current RoleState를 비교한다.

다음 변화:

```text
active → weakened
active → stopped
active → inactive
protective_standby → stopped
protective_standby → inactive
```

에는:

```text
weakens_sangshen
```

을 기록한다.

---

# 17. activates_sangshen_function

반대로:

```text
protective_standby
→ active
```

가 실제 운 위협으로 인해 일어나면:

```text
activates_sangshen_function
```

을 기록한다.

---

# 18. LuckEffect는 RoleHistory가 아니다

운에서 SangShen이 약화되어도:

```text
SangShenRoleHistory
```

는 유지한다.

운 글자에 새 natal SangShenRole을 만들지 않는다.

---

# 19. stopped SangShen

Expected:

```text
RoleHistory = SangShen
CurrentState = stopped
CurrentFunction = inactive

LuckEffect = weakens_sangshen
```

---

# 20. 기존 LuckEffect 계약 유지

다음 기존 타입을 유지한다.

```text
manifests_yongshen
changes_pattern_mode

activates_byeong
strengthens_byeong
weakens_byeong
relieves_byeong

attacks_yongshen
protects_yongshen

activates_sangshen_function
weakens_sangshen

changes_root_state
changes_capacity
changes_formation
```

---

# 21. 신규 회귀 테스트 A
## 칠살격 Policy 충돌

Fixture:

```text
七殺格
FoodGodControlsKilling active
FoodGod required for killing control
FoodGod excessive evidence also present
```

Expected:

- 반대 방향 Policy 두 개가 동시에 최종 선택되지 않음
- 배열 순서 의존 없음
- required function과 과다 근거가 모두 고려됨
- 판정 불충분 시 deferred

---

# 22. 신규 회귀 테스트 B
## Policy 배열 순서 독립성

동일 Registry를 역순으로 평가해도:

```text
selectedPolicy
direction
```

이 같아야 한다.

이 테스트는 BLOCKING.

---

# 23. 신규 회귀 테스트 C
## inherited blocked path

대운:

```text
harmful natal path source stopped
```

세운:

아무 재활성화 조건 없음.

Expected:

```text
RelationHistory retained
CurrentStructuralEffect = inactive
CurrentFunction != operating
```

---

# 24. 신규 회귀 테스트 D
## blocked path does not revive

대운에서 stopped 된 source가 세운/월운에서 원국 Fact 재수집 때문에 operating으로 돌아가지 않는지 검증.

Expected:

```text
inactive remains inactive
```

---

# 25. 신규 회귀 테스트 E
## SangShen weakened by luck

원국:

```text
印 = active SangShen
```

대운:

```text
valid combination stops 印
```

Expected:

```text
RoleHistory retained
CurrentState = stopped
CurrentFunction = inactive
LuckEffect includes weakens_sangshen
```

---

# 26. 신규 회귀 테스트 F
## Protective Standby activation

원국:

```text
印 = protective_standby SangShen
```

운:

```text
傷官 threat activates
印 actually protects 正官
```

Expected:

```text
CurrentState = active
LuckEffect includes activates_sangshen_function
```

---

# 27. 기존 cross-pattern 계약 보존

반드시 유지:

```text
財格 + 財剋印
→ favorable

印格 + 財剋印
→ unfavorable

印格 + 印過多
→ favorable

食神格 + 偏印奪食 + 財剋印
→ favorable

傷官格 + 必要印 + 財剋印
→ unfavorable
```

---

# 28. 칠살 관련 기존 계약 보존

```text
食神制殺
≠
傷官剋殺
≠
傷官合殺
```

---

# 29. 운 합 계약 보존

```text
luck↔luck
→ weakened

luck↔natal valid combine
→ stopped
```

운끼리 합 선처리 유지.

---

# 30. 양인격 傷官合殺 PARTIAL

P1 통합 감사에서 양인격 `傷官合殺` cross-pattern은 PARTIAL이었다.

현재 인정된 양인 조합에서는 일반적인 오합 구조상 해당 분기에 자연스럽게 도달하지 않을 수 있다.

이번 수정에서 이를 억지로 reachable하게 만들지 않는다.

기존 Policy 계약은 유지하고:

```text
runtime reachability = limited / synthetic only
```

상태로 남길 수 있다.

이를 FAIL로 승격하지 않는다.

---

# 31. 기존 승인 deferred 유지

다음은 이번 수정 대상이 아니다.

```text
겁재격 正官·七殺·財 절대순위
羊刃格 印增刃勢
칠살 Capacity 정성판정
```

---

# 32. 숫자 scoring 금지

Policy specificity를 해결하기 위해 다음을 만들지 않는다.

```text
favorableScore
unfavorableScore
policyWeight
importanceScore
```

specificity는 조건 구조 비교용이며 길흉 점수가 아니다.

---

# 33. RelationFact purity

RelationFact에 길흉 필드 추가 금지.

---

# 34. 검증

수정 후 반드시 실행:

```text
npx tsc -b
npm run build

기존 검증 전체
npm run verify:judgment-p0
P1-1
P1-2
P1-3

P1 integration audit regression
신규 P1 fix regression
```

기존 fixture 기대값 임의 수정 금지.

---

# 35. 완료 조건

다음 모두 만족:

```text
[ ] 칠살격 반대 Policy 동시 매칭이 deterministic하게 해소
[ ] Registry 배열 순서 독립
[ ] 상위 scope blocked path가 하위 scope에서 자동 operating 복귀하지 않음
[ ] inherited inactive effect 유지
[ ] stopped SangShen에 weakens_sangshen 기록
[ ] protective standby 활성화 시 activates_sangshen_function 기록
[ ] 기존 40/40 유지
[ ] P0 PASS
[ ] P1-1 PASS
[ ] P1-2 PASS
[ ] P1-3 PASS
```

---

# 36. 최종 보고

| 보완 항목 | 수정 파일/함수 | 신규 테스트 | 결과 |
|---|---|---|---|
| 칠살격 Policy 충돌 | | | |
| 배열 순서 독립 | | | |
| blocked path 승계 | | | |
| SangShen LuckEffect | | | |

그리고:

```text
기존 회귀: ?/?
P0:
P1-1:
P1-2:
P1-3:
P1-fix:

FAIL:
PARTIAL:
NOT_IMPLEMENTED:
```

FAIL이 남으면 P1을 종료하지 않는다.

FAIL = 0이고 PARTIAL이 승인된 deferred/reachability 항목뿐이면 다음 P1 통합감사를 다시 실행한다.