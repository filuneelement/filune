# FILUNE P2-E 원국 Personality StructuralRoleModifier 결과

## A. 전체 판정

**READY_FOR_CURRENT_PERSONALITY_ENGINE**

`buildNatalPersonality(chart)`는 기존 진입점이다. 연결할 때는 기존 Judgment 결과에서 `scope === 'natal'` 스냅샷을 선택하여 `projectNatalStructuralReading(snapshot)`으로 필요한 참조만 투영한 뒤, `applyStructuralRoleModifiers(base, reading)`를 호출한다. 두 경계에서 원국 범위를 검사한다.

## B. 구현

| 영역 | 파일 또는 함수 | 결과 |
|---|---|---|
| Judgment 출력 연결 | [projectNatalStructuralReading](../../lib/personalityStructuralReading.ts) | 기존 원국 스냅샷의 역할 이력·현재 상태·실제 기능·runtime·피해 경로를 투영한다. |
| Role linking | [linkRoleToPersonalityFacts](../../lib/personality/modifiers/linkRoleToPersonalityFacts.ts) | 위치·글자·Canonical 십성·지장간 역할과 출현 ID가 일치하는 기존 핵심·일반 발현 Fact만 연결한다. 일간 자체는 연결 대상에서 제외한다. |
| YongShen | [applyStructuralRoleModifiers](../../lib/personality/modifiers/structuralRoleModifier.ts) | 현재 투출 기능 또는 실제 작동하는 구조 경로가 확인되면 channels_expression으로 기록한다. |
| SangShen | 같은 함수 | 작동 중인 보조 경로는 supports_expression, 보호 정책 경로는 protects_expression으로 기록한다. |
| Protective standby | 같은 함수 | 대기 보호는 contextual로 기록한다. 보호 대상, 이력·현재 경로, 비활성 현재 기능을 보존한다. |
| Byeong | 같은 함수 | 피해 주체·작용·대상·손상 기능·구조 결과가 연결된 실제 피해 경로를 요구한다. 작동 시 distorts_expression으로 기존 Fact에 맥락을 더한다. |
| ConditionalByeong | 같은 함수 | 원국의 조건부 선행 경로를 contextual로 기록한다. 현재의 유리한 기능과 조건부 위험을 함께 보존한다. |
| GuEung | 같은 함수 | 실제 피해 경로의 targetByeongId와 구제 경로를 확인하고 resolves_tension으로 기록한다. |
| stopped / weakened | 같은 함수 | stopped는 inactive, 작동 근거가 있는 weakened는 reduced로 기록한다. 두 상태 모두 role ID와 이력 근거를 유지한다. |
| Role conflict | 같은 함수 | 같은 Fact에 지지와 실제 피해가 연결되면 coexist, 지지와 조건부 피해가 연결되면 context_split으로 기록한다. P2-D 충돌은 유지한다. |

현재 기능의 확인에는 현재 경로 참조와 실제 구조 기능 또는 기존 엔진이 기록한 유효 용신 투출을 사용한다. 이력 경로와 현재 경로를 각각 반환한다. 연결 근거가 없는 레거시 역할 참조는 보류하거나 경로 미확인으로 남긴다. 입력에서 역할의 실제 출현을 확인할 수 없으면 진단을 반환한다. 보정은 기존 Fact·발현 단계·Prominence와 Knowledge Registry를 변경하지 않는다. [마스터](../rules/master/11-personality-master.md#L198-L229) · [스키마](../rules/master/12-personality-knowledge-schema.md#L755-L855)

## C. 역할별 결과

아래는 P2-E 검증에서 기존 Judgment 코어로 계산한 여섯 원국 fixture를 합산한 값이다. 상태 보정·불일치 검사용 투영 변형은 합산에서 제외했다.

| 역할 | Modifier 수 |
|---|---:|
| YongShen | 7 |
| SangShen | 5 |
| Byeong, 조건부 포함 | 4 |
| GuEung | 1 |

## D. 비독점성

- **같은 actor의 복수 역할.** 동일 출현에 작동 용신과 실제 병을 공급한 경계 fixture에서 두 modifier와 coexist를 모두 확인했다.
- **favorable current + ConditionalByeong.** 기존 Judgment 코어가 같은 財 actor에 출력한 원국 용신과 조건부 병을 동시에 보존했다. 조건부 병은 contextual이며 shadow Fact의 수나 상태를 변경하지 않는다.
- 활성·대기 상신, 실제·조건부·무병, 구응, 정지·약화, 일간·지장간과 연결 오류를 검사했다. 정지·약화의 단독 전이 조건은 원국에서 투영한 입력의 runtime을 독립적으로 바꾸어 확인했다. [P2-E 검증](../../../scripts/verify-personality-role-modifier-p2e.mjs)

## E. 구조 격리

| 항목 | 결과 |
|---|---:|
| Judgment 소스 변경 | 0 |
| Judgment fixture 변경 | 0 |
| Judgment → Personality 의존성 | 0 |
| Personality 모듈 → Judgment 의존성 | 0 |
| 성격 수치 점수 | 0 |

타입 전용 어댑터는 두 엔진 바깥에 두었다. 실행 중 Judgment를 호출하는 Personality 코드는 없으며 전체 Judgment 객체를 결과에 복제하지 않는다.

## F. 회귀

| 검증 | 결과 |
|---|---|
| P2-A | PASS |
| P2-B | PASS |
| P2-C | PASS |
| P2-D | PASS |
| P2-E A–L | PASS |
| Judgment P0 | PASS |
| Judgment P1-1 | PASS |
| Judgment P1-2 | PASS |
| Judgment P1-3 | PASS |
| Judgment P1-fix | PASS |
| Judgment P1-integration-audit | PASS |
| Judgment P1-closure | PASS |
| Judgment P1-lifecycle | PASS |
| 전체 Judgment 회귀 | 35/35 PASS, 검증용 복사본 |
| npx tsc -b | PASS |
| npm run build | PASS |

작업공간에서 이미 삭제된 기존 원자료 경로를 직접 읽는 구형 회귀는 최초 실행에서 ENOENT가 발생했다. 구형 명령을 재검증하기 위해 작업공간의 검증용 복사본에 Git HEAD의 삭제된 문서만 복원했다. 기존 작업공간과 Judgment fixture 기대값은 그대로 유지했다.

## G. 남은 상태

| 분류 | 결과 |
|---|---|
| FAIL | 0 |
| PARTIAL | 0 |
| DEFERRED | 결정적 등급 기준이 없는 Prominence와 현재 기능 근거가 부족한 역할 |
| ROLE_PERSONALITY_LINK_MISMATCH | 기준 원국 fixture 0건. 불일치 검증에서 별도 진단 확인 |
| NO_PERSONALITY_TRAIT_TARGET | 기준 원국 fixture 0건. 출현 Fact가 비거나 일간 자체인 검증에서 별도 진단 확인 |
| NOT_IMPLEMENTED | 대운·세운·월운·일운 Personality, CurrentPersonalityResult, 고객 Renderer |
