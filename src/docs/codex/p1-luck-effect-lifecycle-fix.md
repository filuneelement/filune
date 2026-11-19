# FILUNE Codex P1 운 효과 수명주기·만료 상태 보완

P1 최종 종료 감사에서 남은 종료 차단 항목은 다음 두 가지다.

```text
FAIL
LK-072 — 만료된 운을 core에 직접 전달했을 때
합거가 expired임에도 StemRuntime / RoleState에 stopped가 남음

NOT_IMPLEMENTED
SG-174 / EX-140 — LuckEffect가 이후 scope에서
현재도 유효한지 / 만료되었는지 추적하는 lifecycle 출력이 없음
```

이번 작업에서는 **이 두 항목만 수정한다.**

새 PatternEffectPolicy, 새 격국 규칙, Personality Engine, Palace, Renderer는 구현하지 않는다.

---

# 1. 기준 문서

최우선:

- `src/docs/rules/master/05-sangshen-byeong-gueung-master.md`
- `src/docs/rules/master/08-luck-master.md`
- `src/docs/rules/master/09-engine-integration-spec.md`
- `src/docs/rules/master/10-implementation-audit.md`

현재 구현:

- `src/lib/judgment/core/luckScope.ts`
- `src/lib/judgment/core/types.ts`
- `src/lib/judgment/core/roleEngine.ts`
- `src/lib/judgment/core/luckEffects.ts`
- `src/lib/judgment/core/combinationHistory.ts`
- `src/lib/judgment/pipeline/internalReading.ts`

필요하면 실제 저장소 구조에 맞는 동등 파일을 사용한다.

master에 없는 명리 규칙을 새로 만들지 않는다.

---

# 2. 핵심 원칙

다음을 반드시 분리한다.

```text
과거에 효과가 발생했다
≠
현재도 효과가 유효하다
```

즉:

```text
EffectHistory
CurrentEffectiveness
```

를 구분한다.

---

# 3. 운 이벤트의 수명주기

LuckEffect는 최소 다음 상태를 표현할 수 있어야 한다.

```text
originScope
originPeriod
inherited
currentlyEffective
expired
```

필드명은 기존 코드에 맞게 바꿔도 된다.

의미는 반드시 보존한다.

---

# 4. LuckEffectHistory

예:

```text
Daewoon:
傷官과 七殺 합거
→ relieves_byeong
```

이 Event는 이후에도 History로 남을 수 있다.

그러나 다음 대운에서 해당 합거가 더 이상 유효하지 않다면:

```text
relieves_byeong History = retained
currentlyEffective = false
expired = true
```

이어야 한다.

---

# 5. CurrentEffectiveness

하위 scope에서 상위 효과가 계속 유효하면:

```text
inherited = true
currentlyEffective = true
expired = false
```

새 이벤트를 중복 생성하지 않는다.

---

# 6. 운 기간 종료

현재 기준시각 또는 평가 대상 시점이 해당 운의 유효기간 밖이면:

```text
currentlyEffective = false
expired = true
```

로 처리한다.

이 History 때문에 StemRuntime / RoleState를 계속 stopped/inactive로 유지하면 안 된다.

---

# 7. LK-072 수정
## 만료된 합거의 Runtime 해제

현재 문제:

```text
과거 운에서 valid combination
→ stopped
```

였고 해당 운이 만료되었는데도,

core에 만료된 운 데이터를 직접 전달하면:

```text
StemRuntime = stopped
```

가 남는다.

이를 수정한다.

---

# 8. Runtime은 현재 유효한 Effect만 반영

StemRuntime 계산 시:

```text
combination history exists
```

만 보면 안 된다.

반드시:

```text
combination currentlyEffective == true
```

인지 확인한다.

---

# 9. 만료된 combine

Expected:

```text
CombinationHistory = retained
currentlyEffective = false
expired = true
```

그리고:

```text
StemRuntime
```

은 현재 다른 stop 원인이 없다면 재평가한다.

---

# 10. stopped는 History 상태가 아니다

금지:

```text
한 번 stopped
→ 영구 stopped
```

Runtime은 현재 scope와 유효기간의 상태다.

History는 별도 보존한다.

---

# 11. direct core 호출도 안전해야 한다

일반 `runInternalReading()` 경로가 현재 유효 운을 먼저 선택한다고 해도,

core 함수 자체가:

```text
expired luck input
```

을 받았을 때 잘못된 현재 상태를 반환하면 안 된다.

따라서:

```text
core = defensive lifecycle aware
```

이어야 한다.

---

# 12. 평가시점 전달

필요하면 core 판단에:

```text
evaluationTime
```

또는 동등 개념을 전달한다.

단 기존 public API를 불필요하게 크게 변경하지 않는다.

---

# 13. 기간 판정의 단일 기준

운 유효성 판정 로직을 여러 군데 중복 구현하지 않는다.

가능하면:

```text
isLuckScopeEffectiveAt(...)
```

또는 기존 동등 함수를 한 곳에서 사용한다.

---

# 14. SG-174 / EX-140 구현
## LuckEffect lifecycle 출력

현재 `LuckEffect`가 Event 종류만 가진다면 lifecycle metadata를 추가한다.

권장 예:

```ts
interface LuckEffect {
  id: string;

  type: LuckEffectType;

  originScope: JudgmentScope;
  originStateId?: string;

  inherited: boolean;

  currentlyEffective: boolean;
  expired: boolean;

  sourceRelationFactId?: string;
  sourceFormulaFactId?: string;
  targetRoleId?: string;
  targetByeongId?: string;
}
```

실제 타입 구조에 맞게 최소 수정한다.

---

# 15. Event ID 안정성

상위 scope에서 생성한 Event가 하위 scope로 승계될 때:

```text
새 id로 복제하지 않는다
```

가능하면 동일 event identity를 유지한다.

필요하면:

```text
originEffectId
```

를 둔다.

---

# 16. 중복 이벤트 금지

예:

```text
Daewoon:
activates_byeong
```

발생.

Sewoon에서도 그 대운 효과가 계속 유효하다고 해서:

```text
새 activates_byeong event
```

를 또 만들지 않는다.

대신:

```text
same history
inherited = true
currentlyEffective = true
```

로 표현한다.

---

# 17. 만료 이벤트 이력

후속 기간에서 원인이 사라지면 기존 Event는:

```text
currentlyEffective = false
expired = true
```

로 조회 가능해야 한다.

History에서 삭제하지 않는다.

---

# 18. activates_byeong lifecycle

예:

```text
Natal:
財 = ConditionalByeong

Daewoon:
harmful 七殺
→ activates_byeong
```

현재 대운 동안:

```text
currentlyEffective = true
```

대운 종료 후:

```text
currentlyEffective = false
expired = true
```

그리고 Role:

```text
active Byeong
→ conditional
```

로 재평가 가능.

---

# 19. relieves_byeong lifecycle

예:

```text
Natal:
active Byeong

Daewoon:
temporary combine/control
→ relieves_byeong
```

대운 동안:

```text
Byeong CurrentFunction = inactive/relieved
```

운 종료 후 relief path가 사라지면:

```text
relieves_byeong expired
```

원래 ByeongPath가 다시 유효한지 재평가.

---

# 20. weakens_sangshen lifecycle

대운에서 SangShen이 합거:

```text
weakens_sangshen
currentlyEffective = true
```

대운 종료 후 합거 원인이 사라지면:

```text
weakens_sangshen
currentlyEffective = false
expired = true
```

SangShen 상태를 다시 계산한다.

---

# 21. activates_sangshen_function lifecycle

상위 운의 위협 때문에 protective standby가 active가 된 경우:

```text
activates_sangshen_function
```

은 위협이 유효한 동안만 현재효과로 유지한다.

위협 종료:

```text
effect expired
active → protective_standby
```

---

# 22. manifests_yongshen lifecycle

운에서 새 YongShen 투출:

```text
manifests_yongshen
```

은 해당 운 유효기간 동안 current effect.

운 종료 후:

```text
ManifestationHistory 유지 가능
EffectiveManifestedYongShen에서 제거
LuckEffect expired
```

---

# 23. changes_pattern_mode lifecycle

예:

```text
Natal transformed
Daewoon 투출
→ combined
```

대운 종료:

```text
changes_pattern_mode event History 유지
현재 Effect expired
CurrentPatternMode 재계산
```

---

# 24. changes_root_state lifecycle

운 지지 때문에 RootState 강화:

```text
changes_root_state
```

운 종료 후 현재 formation/root 근거가 사라지면 재평가한다.

History와 현재 RootState 분리.

---

# 25. changes_formation lifecycle

운에서 삼합/방합 완성:

```text
changes_formation
```

해당 운 종료 후 구성 글자가 없어지면:

```text
FormationFact History와
Current Formation
```

을 구분한다.

---

# 26. changes_capacity lifecycle

Capacity는 현재 구조에서 다시 계산한다.

과거 운에서:

```text
changes_capacity
```

가 있었다고 해서 후속 기간 Capacity를 고정하지 않는다.

---

# 27. Current State 재계산 순서

권장:

```text
1. parent History inherit
2. 현재 평가시점에서 각 inherited effect 유효성 확인
3. expired effect는 current influence에서 제외
4. 현재 scope Relation / Runtime 계산
5. Role CurrentState / CurrentFunction 재계산
6. 새 current LuckEffect만 생성
7. History와 current effect snapshot 저장
```

---

# 28. History 때문에 현재 Fact를 삭제하지 않는다

예:

과거에 합거되었던 원국 천간도:

```text
Natal RelationFact
RoleHistory
```

는 계속 존재 가능.

단 현재 Runtime이 active로 복귀했다면 현재 작동도 다시 평가한다.

---

# 29. reactivation은 현재 근거로만

```text
expired stop
```

가 되었다고 자동으로 favorable을 부여하지 않는다.

단지:

```text
stopped constraint removed
```

일 뿐이다.

그 후 현재 Pattern/Runtime/Policy로 다시 판정한다.

---

# 30. regression A — expired combination direct core

Fixture:

```text
past Daewoon valid combine
evaluationTime after Daewoon end
```

core 직접 호출.

Expected:

```text
CombinationHistory retained
currentlyEffective = false
expired = true

affected stems:
not stopped solely by expired combination
```

이 테스트는 BLOCKING.

---

# 31. regression B — active combination

동일 fixture를 유효기간 안에서 평가.

Expected:

```text
currentlyEffective = true
expired = false
Runtime = stopped
```

---

# 32. regression C — inherited active effect

Daewoon effect 발생.

Sewoon이 그 대운 안에 있음.

Expected:

```text
same effect history
inherited = true
currentlyEffective = true
duplicate event count = 0
```

---

# 33. regression D — inherited expired effect

새 대운 또는 해당 효과 유효기간 밖으로 이동.

Expected:

```text
History retained
currentlyEffective = false
expired = true
```

---

# 34. regression E — ConditionalByeong expiry

```text
Daewoon activates_byeong
next valid period lacks harmful path
```

Expected:

```text
old effect expired
Byeong current state returns conditional
```

---

# 35. regression F — relief expiry

```text
Daewoon relieves_byeong
later relief source absent
```

Expected:

```text
old relief effect expired
Byeong path re-evaluated
```

---

# 36. regression G — SangShen stop expiry

```text
Daewoon stops SangShen
later period no stop condition
```

Expected:

```text
weakens_sangshen expired
SangShen Runtime/CurrentState recalculated
```

---

# 37. regression H — Pattern effect expiry

```text
Daewoon manifests YongShen
→ combined

after expiration:
```

Expected:

```text
manifest event history retained
effect expired
CurrentEffectiveManifestedYongShen recalculated
CurrentPatternMode recalculated
```

---

# 38. regression I — no duplicate event

상위 scope Event가 3개 하위 scope로 승계되어도:

```text
origin event count = 1
```

이어야 한다.

하위 snapshot에서는 inherited current state만 보여준다.

---

# 39. 기존 승인 deferred 유지

다음은 이번 수정 대상이 아니다.

```text
겁재격 正官·七殺·財 절대순위
羊刃格 印增刃勢
七殺 Capacity
羊刃格 傷官合殺 limited reachability
```

---

# 40. 기존 계약 절대 보존

```text
財格 + 財剋印 = favorable
印格 + 財剋印 = unfavorable
印多用財 = favorable

食神制殺 ≠ 傷官剋殺 ≠ 傷官合殺

luck↔luck = weakened
luck↔natal = stopped

BranchPattern immutable

RoleHistory retained

RelationFact no intrinsic good/bad

numeric scoring 없음
```

---

# 41. Policy resolver 재변경 금지

P1-fix에서 완성한:

```text
matchedPolicies
selectedPolicy
selectionReason
specificity
```

계약을 유지한다.

이번 작업에서 다른 방식으로 다시 단순화하지 않는다.

---

# 42. 기존 fixture 기대값 변경 금지

테스트를 통과시키기 위해 기존 expectation을 임의 수정하지 않는다.

문제가 있으면 코드 lifecycle을 수정한다.

---

# 43. 검증

반드시:

```text
npx tsc -b
npm run build

기존 회귀 전체
P0
P1-1
P1-2
P1-3
P1-fix
P1-closure
신규 lifecycle regression
```

실행.

---

# 44. 완료 조건

다음 모두 만족해야 한다.

```text
[ ] expired combination이 core 직접 호출에서도 stopped를 유지하지 않음
[ ] active combination은 기존 stopped 유지
[ ] LuckEffect history와 current effectiveness 분리
[ ] inherited active effect 조회 가능
[ ] inherited expired effect 조회 가능
[ ] duplicate LuckEffect 생성 없음
[ ] ConditionalByeong activation expiry 검증
[ ] Byeong relief expiry 검증
[ ] SangShen weakening expiry 검증
[ ] YongShen manifestation expiry 검증
[ ] PatternMode expiry 후 재계산
[ ] 기존 회귀 무손상
```

---

# 45. 최종 보고 형식

## A. 수정 결과

| 항목 | 수정 파일/함수 | 신규 테스트 | 결과 |
|---|---|---|---|
| LK-072 expired combine | | | |
| LuckEffect lifecycle | | | |
| inherited active effect | | | |
| inherited expired effect | | | |
| duplicate prevention | | | |
| Role state restoration | | | |
| Pattern restoration | | | |

## B. 회귀

```text
기존 회귀:
P0:
P1-1:
P1-2:
P1-3:
P1-fix:
P1-closure:
P1-lifecycle:
```

## C. 남은 상태

```text
FAIL:
PARTIAL:
NOT_IMPLEMENTED:
```

PARTIAL은 승인된 deferred / limited reachability만 허용한다.

LK-072 또는 SG-174 / EX-140이 남으면 P1 종료 판정 금지.

---

# 46. 작업 종료 후

이 작업 완료 후 즉시 새 기능으로 넘어가지 않는다.

먼저:

```text
src/docs/codex/p1-final-closure-audit.md
```

를 다시 실행하여:

```text
READY_FOR_NEXT_PHASE
```

가 되는지 확인한다.