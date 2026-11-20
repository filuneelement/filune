# FILUNE P4-G.1 Health Outcome Reactivation Fix

## 판정

- P4-G.1 `READY_TO_RERUN_P4H`
- 기존 P4-H 재실행 `HEALTH_OUTCOME_BATCH1_COMPLETE`

## A. Root Cause

Health의 운 시기 gate는 유효한 경로에서도 현재 운 참여자나 동일 경로에 연결된 현재 운 효과를 요구했다. P1-Fix E에서는 공격자와 용신이 모두 원국 참여자다. 보호자 정지 또는 보호 경로 손상 후 Judgment가 `OFF-03`을 현재 운에서 재가동해도, 이 gate에서 두 경로가 제외됐다. [P4-H 최초 감사](./p4h-health-outcome-integration-audit-result.md) · [Health Source Contract](../rules/master/14-outcome-semantic-spec.md#health-source-contract)

## B. Fix

`healthOutcome.ts`의 `structural`에 현재 snapshot의 부모 Judgment를 연결했다. 현재 Scope에서 작동하는 승인 용신 압박이 `inherited = false`로 기록되고, 부모의 동일 원천 관계가 `active_protection`으로 차단돼 있으면 Judgment가 기록한 현재 보호 해제 근거를 읽는다. 유효한 현재 합거 효과의 관계 ID 또는 현재 보호 기능 손상 Byeong이 가리키는 관계 ID를 시기 근거로 보존한다. 기존 유해성·현재 기능·stopped·reduced·conditional·기간 gate는 계속 적용된다. [Health adapter](../../lib/outcome/health/healthOutcome.ts) · [P1-Fix E](../../../scripts/verify-judgment-p1-fix.mjs#L119)

## C. Before / After

| 상태 | Judgment | Health 이전 | Health 이후 |
|---|---|---|---|
| 원국 보호 작동 | `OFF-03` inactive · active protection | 활성 0 | 활성 0 |
| 대운 보호자 정지 | `OFF-03` operating, unfavorable, 현재 대운 발생 | 누락 | 활성 1 |
| 대운 보호 기능 손상 | `OFF-03` operating, unfavorable, 현재 대운 발생 | 누락 | 활성 1 |
| 이전 운 만료 | 해당 구간 종료 | 재가동 fact 누락 | 같은 ID의 expired 이력 1, 현재 조립 0 |
| 공격원 정지 | 유해 경로 미작동 | 활성 0 | 활성 0 |

운 구간에는 기존 `health_attention_period`와 `yongshen_pressure`를 사용하며 확정도는 `contextual`이다. 세운과 월운에서도 같은 P1 보호자 정지 경로를 해당 scope에 배치해 scope와 기간을 확인했다. 보호자를 reduced로 낮춘 검증은 이미 결정된 차단 상태를 입력으로 유지하는 adapter 경계 검사다. P1 Closure E의 다음 대운에서는 보호 역할 복귀와 이전 이벤트 만료를 구분했다. 교체 대운에 독립적으로 판정된 압력은 해당 대운의 별도 근거로 유지된다. [P4-G.1 검증](../../../scripts/verify-health-outcome-reactivation-p4g1.mjs)

## D. Provenance

| 항목 | 결과 |
|---|---|
| OutcomeFact | 동일 scope·동일 경로에서 1건. 재실행 및 같은 snapshot 중복 입력에도 ID 동일 |
| Scope | 각 발동의 `daewoon`, `sewoon`, `month`와 원본 유효기간 보존 |
| Source IDs | 현재 Judgment scope와 `OFF-03` 제어 관계, 보호자를 정지시킨 합거 관계 또는 보호 기능을 손상시킨 현재 제어 관계 보존 |
| Origin | 원국 관계 ID와 원국 scope ID를 현재 발동 scope와 구분 |
| Orphan | 0 |
| Assembly | CH-07 PARTIAL. CH-08·09·10이 해당 원본 Health fact ID와 근거 재사용. 무료 운 시기 누출 0 |

이전 차단과 현재 해제의 연결에는 해당 scope의 상위 Judgment snapshot과 검증된 현재 원천 관계를 사용한다.

## E. Regression

| 검증 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A~G / P3-A~F | PASS |
| P4-B / P4-C / P4-E / P4-F / P4-G | PASS |
| P4-G.1 | PASS · 보호자 정지와 손상, 보호 중 억제, 공격원 정지, reduced 경계, 만료, scope 및 provenance |
| 기존 P4-H 재실행 | PASS · 두 재가동 누락 해소. Health fact 24/24 근거 확인. CS-005·126·127과 12절기월 확인 |
| `npx tsc -b` / `npm run build` | PASS |

레거시 Judgment 문서 경로는 임시 사본에서 연결했다. P4-H 검증 스크립트와 기존 기대값을 그대로 실행했다. 독립 상신 손상과 Formation 발동은 `NOT_TESTABLE_WITH_CURRENT_FIXTURE`다. [P4-H 검증 스크립트](../../../scripts/verify-health-outcome-integration-p4h.mjs)

## F. Isolation

Judgment·Relationship·Money·Work·Selection·Compatibility 의미 변경은 각각 0건이다. Health Source Contract, Reading Assembly 및 Renderer의 본 단계 변경도 각각 0건이다. 질병 예측·진단·의료 권고·치료·수명·건강 회복·점수·순위·최고/최저 월 생성은 각각 0건이다.
