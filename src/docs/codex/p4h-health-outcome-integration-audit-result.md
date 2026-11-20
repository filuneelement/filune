# FILUNE P4-H Health Outcome Integration Audit

## A. 최종 판정

**`P4H_FIX_REQUIRED`**

P4-G 진입 판정은 `READY_FOR_HEALTH_OUTCOME_AUDIT`였다. 기존 P1-Fix E에서 보호 중인 용신 제어 경로가 대운에 재가동되는 두 사례를 재현했다. Judgment에 유효한 대운 발동이 기록되지만 Health Outcome에서 누락된다. 실패 분류는 `P4G_OUTCOME_BUG`다. [P4-G](./p4g-health-outcome-batch1-result.md) · [14 Outcome Semantic Spec](../rules/master/14-outcome-semantic-spec.md#health-source-contract)

## B. Actual Pipeline

| 단계 | 검증 |
|---|---|
| Canonical | 저장소의 CS-005, CS-126, CS-127 출생 입력을 기존 Canonical 계산에 전달 |
| Judgment | 각 출생 입력에서 `runInternalReading`으로 원국과 scoped Judgment를 평가 |
| Luck | CS-005의 대운·세운·월운·실제 일진 및 P4-C의 12절기월 사용. 12/12 순서·연속성·경계·부모 세운·scope 일치 |
| Health Outcome | 출생 경로는 원국 전통 대응을 전달. 활성 구조 경로는 기존 P1 정책 및 P4-G scope fixture에서 별도 실행 |
| ReadingAssembly | 각 출생 실행을 동일 입력으로 premium/free 조립 및 검증. Health unit의 원본 ID·확정도·근거·scope·기간을 역추적 |
| 결정론·순서 | CS-126 출생을 독립 재실행하고 결과 비교. 실제 snapshot 및 P1 fixture의 역할·관계·효과 배열을 역순으로 바꾸어 비교 |

12절기월 계산과 참조는 기존 Judgment 달력 및 P4-C 경로를 사용했다. [P4-C 결과](./p4c-reading-assembly-integration-audit-result.md) · [P4-H 검증](../../../scripts/verify-health-outcome-integration-p4h.mjs)

## C. Coverage 및 결함

| 범위 | 결과 |
|---|---|
| Traditional correspondence | PASS · 10/10. A I-16 전통 대응과 근거 분류 확인 |
| Structural attention / Natal | PASS · KILL-T2의 실제 P1 정책 출력에서 해로운 칠살 활성 fact 생성. KILL-T3의 필요 칠살 및 근거 없는 財生殺에서 0건 |
| Daewoon | 기존 칠살 활성 timing 전달 PASS. P1-Fix E의 용신 압력 재가동 2건 누락 |
| Sewoon / Month | 기존 scope 정책 fixture에서 실제 scoped Judgment → Health timing → Assembly PASS |
| Health relief | DEFERRED · 0건 |

P1-Fix E의 원국에서 `OFF-03`은 `active_protection`으로 비활성이다. 대운의 보호자 정지 또는 보호 경로 손상 뒤 같은 제어 경로가 `unfavorable`·`operating`으로 바뀐다. Judgment는 대상 용신, 활성 Byeong, `originScope = greatLuck`, `inherited = false`를 반환한다. 공격자와 대상은 원국 참여자다. Health timing gate는 대운 참여자가 둘 중 하나이거나 같은 관계에 직접 연결된 Health 허용 효과가 있어야 통과하므로, 이미 평가된 비승계 재가동을 두 경우 모두 버린다. CH-08까지 전달할 Health fact가 0건이다. [P1-Fix E](../../../scripts/verify-judgment-p1-fix.mjs#L119) · [Health timing gate](../../lib/outcome/health/healthOutcome.ts#L144)

| 분류 | 건수 |
|---|---:|
| P4G_OUTCOME_BUG | 1개 원인, 2개 재현 |
| P4H_ASSEMBLY_BUG | 0 |
| UPSTREAM_JUDGMENT_REGRESSION | 0 |
| FIXTURE_GAP | 상신 손상 / Formation 독립 양성 2개 |

## D. 일간

| 일간 | 근거 수준 | 과잉 구체화 |
|---|---|---:|
| 甲 | direct-source-specific | 0 |
| 乙 | element-level-only | 0 |
| 丙 | direct-source-specific | 0 |
| 丁 | element-level-only | 0 |
| 戊 | direct-source-specific | 0 |
| 己 | direct-source-specific | 0 |
| 庚 | element-level-only | 0 |
| 辛 | direct-source-specific | 0 |
| 壬 | element-level-only | 0 |
| 癸 | direct-source-specific | 0 |

## E. Provenance

| 항목 | 건수 |
|---|---:|
| 대표 OutcomeFact / 근거 포함 | 20 / 20 |
| 확인 대상 orphan / wrong-scope / 동일 실행 중복 ID | 0 / 0 / 0 |

전통 대응은 A I-16 및 ⑲-A 지식 근거로 확인했다. 구조 경로는 동일 scope의 Judgment·관계·역할과 해당 scope의 현재 유효 효과를 대조했다. 승계 이력은 원천 관계 ID와 하위 snapshot·기간을 확인했다. 집계는 실제 출생, 정책 fixture 및 만료 평가의 출력 합계다. 일간 specificity 전용 반복 검증은 별도다.

## F. Lifecycle

| 항목 | 결과 |
|---|---|
| active | 5개 구조 fact |
| reduced | 2건(구조 fact 1건, 승계 projection 1건). confirmed 승격 0 |
| stopped | 1개 정지 fixture에서 현재 attention 0 |
| conditional | 1개 미발동 fixture에서 confirmed 결과 0 |
| inherited | 1개 하위 scope projection에서 원천 관계 ID 유지 |
| expired | 3건이 같은 ID와 근거를 유지하며 `currentlyEffective = false` |
| expired current leakage / fake relief | 0 / 0 |

## G. Assembly

| 항목 | 결과 |
|---|---|
| CH-07 | PARTIAL |
| CH-08 / CH-09 / CH-10 | 각 생성된 timing fact에서 동일 unit 및 Outcome ID 재사용 |
| 월 CH-09 context → CH-10 timing | 같은 Outcome ID·근거·확정도 |
| 중복 결론 / B-6 역할 불일치 | 0 / 0 |
| 대운 용신 압력 재가동 | P4G_OUTCOME_BUG로 원본 fact 및 placement 누락 2건 |

## H. Free / Premium

무료 대운·세운·월운·일진 Health 노출은 각각 0건이다. 동일 Health 결과를 양쪽에 입력했다. 무료 목차의 Health 배치가 0건이어서 비교 가능한 공통 Health unit은 0건이고, 방향·확정도·provenance 불일치도 각각 0건이다. Premium 원국 Health unit은 원본 fact와 일치했다. [13 Reading Assembly Spec](../rules/master/13-reading-assembly-spec.md)

## I. Safety

Health 결과와 조립 의미 단위에서 질병명·질병 예측·진단·발병 시기, 의료 권고·치료·수술, 수명·사망 시기, 점수·위험률·등급·순위·최고/최저 Health 월은 각각 0건이다. 전체 운 방향에서 Health 방향으로 자동 변환하는 경로는 0건이다.

## J. Fixture Coverage

| Fixture | 결과 |
|---|---|
| 독립 상신 손상 | NOT_TESTABLE_WITH_CURRENT_FIXTURE |
| 독립 Formation 발동 | NOT_TESTABLE_WITH_CURRENT_FIXTURE |
| 실제 CS 출생에서 발동하는 구조 Health timing | 확인한 CS-005/126/127에서는 양성 0건. scope 양성 전달은 기존 P1·P4-G Judgment 정책 fixture로 검증 |

기존 상신 fixture의 정지는 보호 재가동을 검증하는 증거다. 상신 자체의 승인 Health 압력은 별도 근거가 필요하다. Formation 생성·통근 변화를 확인한 fixture에는 Formation 자체가 승인된 해로운 칠살 경로를 활성화했다는 독립 증거가 없다. CS-034는 저장소의 근거 원고에서 확인했다. 대응하는 실행 fixture와 독립 세운 근거는 확인되지 않았다. [P4-D 보강 감사](./p4d-health-outcome-supplement-audit-result.md) · [⑲-A 건강 근거](../source/health/FILUNE-19A-premium-health-evidence.md)

## K. Isolation

동결 입력의 전후 비교에서 Judgment·Luck·Personality 변경은 각각 0건이다. Relationship·Money·Work·Selection·Compatibility·Renderer 변경은 각각 0건이다. Health에서 Judgment 재계산, Judgment에서 Outcome 역방향 import, Reading의 엔진 재실행, 런타임 LLM/API 의존은 각각 0건이다.

## L. Regression

| 검사 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A~G / P3-A~F | PASS |
| P4-B / P4-C / P4-E / P4-F / P4-G | PASS |
| P4-H | FAIL · P4G_OUTCOME_BUG 재현 2건 |
| `npx tsc -b` / `npm run build` | PASS |

레거시 Judgment 문서 경로는 임시 사본에서 연결해 기존 명령과 기대값을 사용했다. Relationship Batch 1 회귀는 P4-E와 P4-F에서 확인했다.
