# FILUNE P2-F Current Personality Engine 결과

## A. 전체 판정

**READY_FOR_PERSONALITY_RENDERER_AUDIT**

`buildCurrentPersonality({ natalPersonality, structuralScopes, evaluationScope, referenceTime, previousEffectHistory })`를 공개했다. 기존 `buildNatalPersonality(chart)`와 P2-E 원국 보정의 호출 방식은 유지된다. 외부 어댑터에는 `projectCurrentPersonalityScopes(snapshots, natalPersonality.dayStem, referenceTime)` 형태로 Judgment 스냅샷, 원국의 일간, Judgment 평가시각을 전달한다. [공개 진입점](../../lib/personality/index.ts) · [스냅샷 어댑터](../../lib/personalityCurrentReading.ts)

## B. Current Engine

| 영역 | 구현 | 테스트 | 결과 |
|---|---|---|---|
| Natal immutable | 원국 결과를 그대로 참조하고 current Fact 상태를 별도 반환 | A | PASS |
| Daewoon expression | 확인된 운 천간은 outward, 지장간은 inner 후보로 투영 | B | PASS |
| Sewoon inheritance | 같은 대운의 원본 effect ID를 세운의 inheritedEffectIds에 연결 | C | PASS |
| Month expression | 선택된 월운의 임시 발현과 종료 경계 검사 | E | PASS |
| Day expression | 일진 교체 시 이전 일진의 발현 종료 | F | PASS |
| Scope expiry | Judgment 부모 경로와 유효 범위, 명시적 비활성 상태를 확인 | D, E, F, Q | PASS |
| Effect history | 보존된 역사 스냅샷 또는 이전 결과의 이력을 원본 ID로 승계 | C, D, K, Q, R | PASS |
| Current conflicts | 실제 등록된 겉·속 성향 후보를 context_split으로 연결 | N | PASS |
| Current RoleModifier | 역할 ID는 유지하고 scope별 상태·기능·효과 참조 갱신 | G–L | PASS |

[현재 결과 계산](../../lib/personality/current/currentPersonality.ts) · [임시 발현 추출](../../lib/personality/current/luckPersonalityFacts.ts) · [역할 상태 투영](../../lib/personality/current/currentRoleModifiers.ts)

입력 범위는 원국→대운→세운→월운→일진 순이다. 요청 범위가 미확정·비활성·만료된 경우 Judgment 부모 연결로 확인 가능한 범위까지 평가한다. 결과에는 요청 범위와 실제 평가 범위를 각각 기록한다. 기간의 시작은 포함하고 끝은 제외한다. 정확한 기간이 없거나 확인된 운 글자가 없으면 해당 후보를 보류한다. 원국에서 시각을 사용할 수 없는 경우 시주 Fact는 생성되지 않는다.

## C. Role lifecycle

| 역할 전이 | 결과 |
|---|---|
| 상신 활성화 | 보호 대기 contextual → confirmed. 원국 modifier ID와 하위 범위 승계 효과 ID 보존 |
| 상신 정지·약화 | 실제 상태가 stopped면 inactive. weakened 또는 reduced면 reduced |
| 조건부 병 활성화 | 원래 조건부 근거에 연결된 실제 trigger가 확인될 때 confirmed 또는 reduced |
| 병 완화 | Judgment 현재 기능과 피해 상태가 inactive로 바뀐 것을 반영 |
| 완화 만료 | 이전 완화는 history에 남고 현재 스냅샷에서 재작동한 병을 다시 confirmed로 투영 |
| 용신 공격·보호 | 이벤트를 기존 역할·Fact에 연결. 상태는 이벤트 이름과 별개로 Judgment가 보고한 현재 기능을 사용 |
| manifests_yongshen | 이벤트를 확인된 임시 운 Fact 출처에 연결. 원국 역할 이력 추가 0건 |

상신·병·용신 공격 및 운 투출은 실제 Judgment 코어 스냅샷으로 검사했다. 용신 보호·공격의 상태 분리 계약은 주입한 스냅샷으로도 검증했다. 조건부 병이 활성 상태인 경우에도 shadow·과다·부재 Fact 활성화는 0건이다.

## D. Temporary personality

- 원국 Fact는 baseline이고 운 출현은 contextual 후보로 기록한다. Knowledge의 핵심축·일반 발현과 기존 위치별 후보 필드를 재사용한다. 빈 필드는 비워 둔다.
- 십성·성향 유형·성향 문구와 외부/내부 맥락이 일치하면 동일 Fact를 참조한다. 원국 년지의 보조 맥락은 임시 내부 맥락과 별도로 유지한다.
- 지장간별 출현 근거를 해당 Fact에 연결한다. 하나의 기간에서 발생한 효과는 하위 범위에서 원본 ID를 재사용한다. 기존 역할도 같은 ID를 scope별 상태에서 참조한다.
- 교체된 기간의 효과는 history에 유지하고 현재 Fact·충돌에서 제외한다. 네이티브 Judgment 기간 대체 스냅샷에는 이전 운 글자가 생략될 수 있다. 그런 경우 Personality 임시 이력은 같은 원국에서 얻은 `previousEffectHistory` 또는 이전에 평가된 운 범위 스냅샷을 전달해야 이어진다. Judgment가 보존한 기존 구조 효과 이력은 별도로 읽는다.
- 네이티브 관계에 나타나지 않은 고립 운 천간은 Confirmed 입력으로 실제 엔티티가 제공될 때만 기존 TenGod 계산으로 연결한다. 운 지지는 확인된 지지 엔티티와 기존 지장간 계산을 사용한다.

## E. Prominence

| 항목 | 결과 |
|---|---|
| Prominence resolver 변경 | 없음 |
| Prominence remains deferred | 예 |
| 수치 등급 경계·강도 점수 도입 | 없음 |

## F. 회귀

| 검증 | 결과 |
|---|---|
| P2-A · P2-B · P2-C | PASS |
| P2-D · P2-E | PASS |
| [P2-F](../../../scripts/verify-current-personality-p2f.mjs) | A–R 18/18 PASS |
| Judgment 전체 | 35/35 PASS |
| npx tsc -b | PASS |
| npm run build | PASS |

기존 구형 Judgment 검증의 삭제된 원자료 경로는 별도 검증 복사본에 Git HEAD의 기존 파일로 복원했다. P0, P1-1, P1-2, P1-3, P1-fix, P1-closure, P1-lifecycle와 CS-005 월별 회귀를 포함했다. 작업공간의 원자료 삭제 상태와 Judgment fixture 기대값은 그대로 유지했다.

## G. 구조 격리

| 항목 | 건수 |
|---|---:|
| Judgment 소스·fixture 변경 | 0 |
| Knowledge Registry 변경 | 0 |
| Judgment → Personality import | 0 |
| Personality 패키지 → Judgment import | 0 |

외부 어댑터가 읽기 전용 Judgment 스냅샷 타입을 받는다. Personality는 그 안의 역할 상태와 효과 투영을 소비하며 구조 판정을 실행하지 않는다. 戊午 일지 십성은 Canonical 正印으로 유지했다.

## H. 남은 상태

- **FAIL** 0
- **PARTIAL** 0
- **DEFERRED** Prominence 등급, 미확정 기간·출현·현재 역할 기능
- **NOT_IMPLEMENTED** 고객 Renderer와 사건·결과 문장 생성. P2-G 통합 감사를 위한 단계 경계다.
