# FILUNE P2-G Personality Engine 최종 통합 감사

## A. 전체 판정

**P2G_FIX_REQUIRED.** 기본 통합 검사 A–P는 16/16 통과했다. 추가 검사에서 서로 다른 운 기간에 걸친 충돌의 이력에 발생 범위와 만료일이 잘못 기록되는 문제 1건을 재현했다. 현재 활성 성향과 현재 충돌은 월운 전환 시 정상적으로 해제됐다.

## B. Layer Audit

| Layer | 상태 | 결과 |
|---|---|---|
| Knowledge | PASS | 두 master와 P2-A~C의 계약을 확인했다. 60일주와 10십성 전수 실행에서 출력 trait를 Registry 필드와 대조했다. |
| Natal | PASS | 일간 기본 성향과 천간·지장간 occurrence를 확인했다. 일간 자체는 occurrence에서 제외되며 시각 미정일 때 시주에서 파생된 Fact만 빠진다. |
| Position | PASS | 천간 outward, 월지 innate, 일지 decision, 시지 private, 년지 supporting context를 확인했다. Trait는 Knowledge에서 공급된다. |
| DayPillar | PASS | 원국 기본 Fact를 유지하면서 일주 modifier가 추가된다. 근거가 없는 빈 필드는 비워 둔다. |
| Conflict | FAIL | 원국·일주·역할·운 충돌은 해당 Fact를 유지한다. 서로 다른 운 범위의 Fact로 구성된 충돌의 이력 기간에 G-01이 재현된다. |
| StructuralRole | PASS | 실제 역할·기능·경로를 기존 Fact에 연결한다. standby, 활성, 약화, 정지, 조건부 병 활성, 구응 대상 및 역할 비독점성을 확인했다. |
| Current | PASS | 대운·세운·월운·일진 임시 표현과 상위 effect ID 승계를 확인했다. 원국 및 부모 스냅샷은 동결 입력을 사용해 검증했다. |
| History | FAIL | 선택된 시점의 active 상태와 이력은 분리된다. 두 운 기간에 걸친 충돌 이력의 만료가 늦게 기록된다. |

### G-01 복수 운 기간에 걸친 충돌 이력

- **재현** · 甲寅 원국에 丁巳 대운과 癸子 월운을 넣으면 대운 천간의 傷官 표현과 월운 지지의 印 판단 성향이 충돌한다. 일진까지 평가한 다음 2027년 3월 1일에 월운을 己未로 교체하고, 같은 충돌 이력을 전달한다.
- **관측** · 충돌은 대운 단독 스냅샷에 없다. 발생 범위는 `daewoon`으로 기록되고 종료일은 대운 종료일인 2035년 1월 1일이다. 월운이 끝나면 현재 충돌은 정상 해제되며 이력은 `currentlyEffective = false`, `expired = false`로 남는다.
- **기대와 영향** · 두 Fact가 처음 공존한 범위는 `month`다. 종료일은 두 운 기간의 교집합이 끝나는 2027년 3월 1일이며 월운 교체 시 `expired = true`여야 한다. 이력 소비자는 충돌의 시작 범위와 만료를 잘못 해석할 수 있다.
- **최소 수정 위치** · `currentConflicts`에서 두 Fact의 발생 범위와 유효기간을 함께 읽어 충돌의 기간과 승계 여부를 계산한다. `mergeHistory`가 해당 교집합의 종료 경계를 사용하도록 회귀를 고정한다. [발생 범위 선택](../../lib/personality/current/currentPersonality.ts#L51) · [이력 만료](../../lib/personality/current/currentPersonality.ts#L70)

이전 원국 scope의 역할 충돌은 자식 scope에서 역할이 정지한 뒤에도 내장된 `natal.conflicts`에서 확인된다. 최종 `conflicts`는 선택된 시점의 충돌을 담는다. [P2-G 검증](../../../scripts/verify-personality-engine-integration-p2g.mjs)

## C. Data integrity

| 항목 | 결과 |
|---|---|
| DayStem / TenGod / Position / DayPillar | 10/10 · 10/10 · 6/6 · 60/60 |
| 일간별 일주 | 甲 乙 丙 丁 戊 己 庚 辛 壬 癸 각각 6/6 |
| UNSUPPORTED_TRAIT / UNSUPPORTED_ENGINE_TRAIT | 0 / 0 |
| MISSING_EXTRACTION | 0 · P2-C 보완 기준 유지 |
| SOURCE_GAP | 455 필드 · 빈 필드에서 trait 생성 0 |
| SOURCE_CONFLICT | 戊午 1건 · Registry 및 canonical 正印. 偏財 오표기 기반 출력 0 |
| 제외 예측 / 성별 결정론 / 고객용 문체 | trait 출력에서 0 |

TenGod 기본 발현은 출처가 있는 trait를 연결한다. 생산적 발현 후보는 contextual로 남는다. 부재·반복으로 결핍·과다를 활성화한 경우는 없었다. 분기 조건이 확정되지 않은 variant와 일지 이미지 metadata는 별도 Fact로 활성화하지 않는 기존 계약을 따른다.

## D. Engine integrity

| 항목 | 결과 |
|---|---|
| 원국·부모 scope mutation | 검증 fixture에서 0 |
| 동일 문구 Fact 및 상속 effect 중복 | 대응 fixture에서 0 · 위치·발생 범위가 다른 표현은 구분 |
| 만료된 활성 운 효과 | 0 · G-01은 현재 활성화와 별개의 충돌 이력 만료 오류 |
| Role 연결 불일치 | 정상 fixture에서 0 · 기존 P2-E 음성 fixture는 불일치를 진단하고 modifier 생성을 차단 |
| 역할 상태 | SangShen 활성·약화·정지, ConditionalByeong 활성, Byeong relief·종료, YongShen 공격·보호 전환 통과 |
| 안정성 | 동일 입력 재실행 및 scope/history 배열 순서 교란 fixture 통과 |

구조 모드·뿌리·용량·성국 변화의 구조 판정은 Judgment 스냅샷에서 읽는다. Personality 쪽에는 해당 효과에서 직접 성향을 생성하는 경로가 없다.

## E. History

| 계약 | 결과 |
|---|---|
| 같은 체인의 승계 | 최초 effect ID 유지 및 `inherited = true` 확인 |
| 독립 리딩과 이전 이력 | `previousEffectHistory` 선택 입력으로 이미 끝난 이벤트를 이어받을 수 있다. 생략하면 현재 계산이 정상이며, 현재 입력 스냅샷에 없는 과거 이벤트는 재구성되지 않는다. |
| 독립 리딩 현재 일치 · BLOCKING L | 같은 명식·날짜·Judgment 스냅샷으로 이력 유무를 비교했다. Natal, 현재 Fact·modifier·conflict, scope 결과 및 활성 history가 deep equal이었다. |
| 이력 중복 | 같은 이력을 다시 투입해도 origin ID 중복 0 |
| 만료 | 개별 운 효과는 정확한 경계에서 만료되고 기존 이력에 보존된다. 복수 운 Fact의 충돌은 G-01 참조. |

## F. Prominence

- Resolver 변경 없음 · 상태 `deferred`.
- Numeric resolver 없음. Occurrence·월지·반복 증거는 독립적으로 수집된다. 역할 및 운에 의한 자동 승격 0.
- 정렬용 인덱스와 기간 비교는 출력 안정성과 기간 판정에 사용한다. 성격 강도 산술 연산 0.

## G. Reverse dependency

- Judgment → Personality import 0.
- Personality → Judgment는 타입 및 이미 계산된 구조 결과 읽기. 구조 재판정 호출 0.
- Personality가 포함된 순환 import 0. TenGod·지장간·일주 계산은 canonical 경로를 재사용한다.
- 이번 감사에서 Judgment, canonical, 원자료, Knowledge와 운영 Personality 구현의 변경 0.

## H. Regression

| 검증 | 결과 |
|---|---|
| P2-A · P2-B · P2-C | PASS |
| P2-D · P2-E | PASS |
| P2-F | PASS · 18/18 |
| P2-G | FAIL · A–P 및 추가 G-02 통과, G-01 실패 |
| Judgment 전체 | PASS · 35/35 |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment 회귀는 작업 트리에서 삭제 상태인 레거시 문서를 읽는 검증을 포함한다. 임시 작업 사본에서만 HEAD의 해당 문서를 복원하여 실행했다.

## I. 남은 항목

| 분류 | 상태 |
|---|---|
| FAIL | 1 · 복수 scope 충돌 이력 G-01 |
| PARTIAL | 0 |
| DEFERRED | Prominence 정성 경계. SOURCE_GAP 455 및 戊午 충돌 1건은 기존 허용 상태. |
| NOT_IMPLEMENTED | 감사 범위 0 · 고객용 Renderer는 후속 단계 |
