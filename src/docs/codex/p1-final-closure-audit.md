# FILUNE Codex P1 최종 종료 감사

P1 통합감사에서 확인된 FAIL 3건은 모두 수정되었다.

현재 확인 상태:

```text
기존 회귀 40/40
P0 PASS
P1-1 23/23
P1-2 25/25
P1-3 30/30
P1 통합 Policy 68/68
P1-fix 6/6
FAIL 0
NOT_IMPLEMENTED 0
```

이번 작업에서는 **새 Policy나 새 명리 규칙을 구현하지 않는다.**

목적은 남은 P1 종료 조건을 검증하여:

```text
READY_FOR_NEXT_PHASE
```

또는:

```text
P1_FIX_REQUIRED
```

를 최종 결정하는 것이다.

---

# 1. 기준 문서

최우선:

- `src/docs/rules/master/05-sangshen-byeong-gueung-master.md`
- `src/docs/rules/master/08-luck-master.md`
- `src/docs/rules/master/09-engine-integration-spec.md`
- `src/docs/rules/master/10-implementation-audit.md`

그리고 현재 구현:

- `src/lib/judgment/core/`
- 기존 P0/P1 검증 스크립트

기존 master 규칙을 변경하지 않는다.

---

# 2. 이번 감사의 핵심

남은 P1 종료 이슈는 다음 두 영역이다.

```text
A. Protective Standby SangShen의 scope 승계와 활성화
B. LuckEffect의 기간 승계·종료·복원
```

승인된 정성 deferred 항목은 이번 감사에서 억지로 확정하지 않는다.

---

# 3. Protective Standby SangShen — 원국 상태

원국에:

```text
印 = protective_standby SangShen
```

이 있고 현재 실제 공격이 없다면:

Expected:

```text
RoleHistory = SangShen
CurrentState = protective_standby
```

Byeong을 강제로 생성하지 않는다.

---

# 4. Protective Standby — 운에서 활성화

상위 또는 현재 운에서 실제 위협:

```text
傷官 → control → 正官
```

이 발생하고 원국 印이:

```text
印 → control → 傷官
```

으로 정관을 보호하면:

Expected:

```text
CurrentState = active
CurrentFunction = operating

LuckEffect includes:
activates_sangshen_function
```

---

# 5. Protective Standby — 활성 운 종료

위협을 만든 운이 종료되어 다음 scope에서 해당 위협이 더 이상 존재하지 않는 경우:

Expected:

```text
RoleHistory = SangShen
CurrentState = protective_standby
```

로 돌아갈 수 있어야 한다.

즉:

```text
active SangShen
```

이 영구적으로 고정되면 안 된다.

---

# 6. Protective Standby — 상위 scope 위협 승계

예:

```text
Daewoon에서 傷官 위협 발생
→ 印 protective standby 활성화
```

그 뒤 Sewoon이 들어와도 대운 위협이 계속 유효하다면:

Expected:

```text
SangShen remains active
```

이어야 한다.

세운이라는 새 scope가 생겼다는 이유로 자동 standby 복귀하면 안 된다.

---

# 7. Protective Standby — 위협 source stopped

위협 source가 합거되어:

```text
傷官 = stopped
```

되면:

Expected:

```text
SangShen protection demand disappears
```

현재 다른 위협이 없다면:

```text
active
→ protective_standby
```

로 재평가 가능.

RoleHistory는 유지.

---

# 8. SangShen 자체가 stopped

원국 SangShen이 운에서 합거되면:

Expected:

```text
RoleHistory = SangShen
CurrentState = stopped
CurrentFunction = inactive
LuckEffect = weakens_sangshen
```

---

# 9. SangShen 정지 운 종료

SangShen을 stopped시킨 운이 종료되고 다음 유효기간에서 해당 합거가 더 이상 존재하지 않는다면:

기존 FILUNE scope/기간 규칙에 따라 Runtime을 재평가한다.

명시적 stop이 더 이상 유효하지 않으면:

```text
stopped 상태가 영구 History처럼 남아 현재 기능을 계속 막으면 안 됨
```

단 원국 RoleHistory는 계속 유지한다.

---

# 10. LuckEffect는 Event와 Current State를 분리

반드시 구분:

```text
LuckEffect event
```

와

```text
current Role/Runtime state
```

예:

대운에서:

```text
weakens_sangshen
```

이 발생했다고 해서 모든 하위/후속 기간에 새 `weakens_sangshen` event를 반복 생성하면 안 된다.

---

# 11. inherited LuckEffect

상위 scope에서 발생한 효과가 하위 scope에서도 유지되면:

```text
originScope retained
inherited = true
currentlyEffective = true
```

또는 동등 의미를 보존한다.

하위 scope에서 동일 신규 event를 중복 생성하지 않는다.

---

# 12. LuckEffect 종료

상위 효과의 원인이 더 이상 유효하지 않은 기간에서는:

```text
currentlyEffective = false
```

또는 동등 상태로 처리할 수 있어야 한다.

History를 삭제하지 않는다.

---

# 13. Byeong activation 종료

예:

```text
Natal 財 = ConditionalByeong

Daewoon:
harmful 七殺 enters
→ 財生殺
→ activates_byeong
```

이후 해당 七殺 운이 종료되고 더 이상 harmful path가 없으면:

Expected:

```text
Byeong current active state 종료
ConditionalByeong history 유지
```

과거 `activates_byeong` Event 자체는 삭제하지 않는다.

---

# 14. Byeong relief 종료 여부

운에서:

```text
relieves_byeong
```

이 발생했지만 그 relief source가 후속 기간에서 사라지면:

원래 ByeongPath가 다시 실제 작동 가능한지 재평가한다.

다음 둘을 구분한다.

```text
Byeong History
Current Byeong Function
```

과거 relief가 있었다는 이유만으로 영구적으로 relieved 처리하지 않는다.

---

# 15. YongShen 운 효과 기간

운에서:

```text
manifests_yongshen
```

이 발생한 경우 해당 운 scope/유효기간을 벗어나면:

```text
ManifestationHistory = retained where appropriate
CurrentEffectiveManifestation = current scope 기준 재계산
```

해야 한다.

운 투출이 원국 YongShen처럼 영구 존속하면 안 된다.

---

# 16. PatternMode 기간 재계산

예:

```text
Natal = transformed
Daewoon manifestation
→ combined
```

대운 종료 후 그 투출이 더 이상 Current Scope에 없다면:

```text
CurrentPatternMode
```

를 다시 계산해야 한다.

과거 combined History와 현재 PatternMode를 구분한다.

---

# 17. Root/Formation LuckEffect 기간

다음도 같은 원칙을 적용한다.

```text
changes_root_state
changes_formation
changes_capacity
```

운에서 발생한 변화가 현재 scope에 실제로 계속 존재하는지 확인한다.

History와 Current State를 혼동하지 않는다.

---

# 18. 테스트 A — Standby activation

```text
Natal:
印 = protective_standby SangShen

Luck:
傷官 attacks 正官
印 actually protects 官
```

Expected:

```text
protective_standby → active
activates_sangshen_function
```

---

# 19. 테스트 B — Standby inherited activation

```text
Daewoon:
threat activates SangShen

Sewoon:
no removal of Daewoon threat
```

Expected:

```text
SangShen remains active
```

신규 activation event 중복 금지.

---

# 20. 테스트 C — threat 종료

위협이 더 이상 존재하지 않는 다음 기간:

Expected:

```text
SangShen active
→ protective_standby
```

RoleHistory 유지.

---

# 21. 테스트 D — SangShen stopped

```text
Natal active SangShen
+
Luck valid combine
```

Expected:

```text
stopped
inactive
weakens_sangshen
```

---

# 22. 테스트 E — SangShen stop 종료

해당 합거 운 종료 후:

Expected:

```text
stopped 상태 재평가
```

현재 stop 원인이 없으면 역할 기능 회복 가능.

단 현재 위협이 없다면:

```text
protective_standby
```

등 적절한 상태로 복귀.

---

# 23. 테스트 F — ConditionalByeong activation and expiry

```text
Natal:
ConditionalByeong

Daewoon:
activates_byeong

later valid period:
activating harmful path absent
```

Expected:

```text
active Byeong current state 종료
ConditionalByeong history 유지
```

---

# 24. 테스트 G — Luck relief expiry

```text
Natal active Byeong

Daewoon:
temporary relief
→ relieves_byeong

later period:
relief path absent
```

Expected:

원래 harmful path가 다시 유효하다면:

```text
Byeong CurrentFunction re-evaluated
```

과거 relief event 때문에 영구 inactive 금지.

---

# 25. 테스트 H — dynamic Pattern expiry

```text
Natal transformed

Daewoon manifests second YongShen
→ combined

after Daewoon validity:
second manifestation absent
```

Expected:

```text
PatternHistory retains event
CurrentPatternMode recalculated
```

---

# 26. 승인된 PARTIAL 유지

다음은 이번 P1 종료를 막지 않는다.

### 겁재격 절대 우선순위

```text
正官 / 七殺 / 財
```

절대순위는 근거 부족으로 deferred.

### 羊刃格 印增刃勢

조건 미확정으로 deferred.

### 칠살 Capacity

정성 evidence 부족 시 deferred.

### 羊刃格 傷官合殺 reachability

인정된 네 양인 일간의 실제 오합 조합에서 일반 명식으로 자연스럽게 도달하기 어렵다면 synthetic/limited reachability로 유지 가능.

이것 때문에 FAIL 판정하지 않는다.

---

# 27. deferred 남용은 다시 확인

승인된 항목 이외에:

```text
PatternContext
Relation
Runtime
required conditions
```

이 모두 확정되었는데 `deferred`인 경우는 보고한다.

---

# 28. 기존 계약 전체 유지

반드시:

```text
財格 + 財剋印 = favorable
印格 + 財剋印 = unfavorable
印多用財 = favorable

食神制殺
≠ 傷官剋殺
≠ 傷官合殺

luck↔luck = weakened
luck↔natal = stopped

BranchPattern immutable
RoleHistory retained
RelationFact no intrinsic good/bad
numeric scoring 없음
```

---

# 29. 검증

실행:

```text
npx tsc -b
npm run build

기존 회귀 전체
P0
P1-1
P1-2
P1-3
P1-fix
P1 closure 신규 회귀
```

기존 fixture 기대값 임의 수정 금지.

---

# 30. 코드 수정 원칙

이번 단계는 우선 감사다.

위 기간/승계 테스트를 추가하기 위해 필요한 최소 수정은 허용한다.

하지만:

- 새 격국 Policy 추가
- 새로운 명리 이론 추가
- Personality 구현
- Palace 구현
- 고객 Renderer 구현

은 금지한다.

---

# 31. 최종 종료 판정

다음 조건이면:

```text
READY_FOR_NEXT_PHASE
```

로 판정한다.

필수:

```text
FAIL = 0
NOT_IMPLEMENTED = 0
```

PARTIAL은 다음만 허용:

```text
승인된 정성 deferred
synthetic/limited reachability
source condition unresolved
```

다음은 허용되지 않는 PARTIAL:

```text
상태 승계 테스트 누락
운 효과 기간 종료 미검증
Role active/standby/stopped 복원 미검증
명시된 LuckEffect 누락
```

---

# 32. 최종 보고 형식

## 전체 판정

```text
READY_FOR_NEXT_PHASE
또는
P1_FIX_REQUIRED
```

## Scope-state 감사

| 항목 | 테스트 | 결과 |
|---|---|---|
| Protective standby activation | | |
| inherited activation | | |
| threat expiry | | |
| SangShen stopped | | |
| SangShen stop expiry | | |
| ConditionalByeong expiry | | |
| Luck relief expiry | | |
| Dynamic Pattern expiry | | |

## 전체 회귀

```text
기존 회귀:
P0:
P1-1:
P1-2:
P1-3:
P1-fix:
P1-closure:
```

## 남은 항목

```text
FAIL:
PARTIAL:
NOT_IMPLEMENTED:
```

PARTIAL은 각각:
- 규칙 ID
- 남은 이유
- 승인된 deferred인지
를 명시한다.