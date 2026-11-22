# FILUNE Compatibility-04B Spouse Event Disruption Policy

**최종 판정 · `COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY`**

Targeted 검증에서 `READY_TO_RERUN_COMPATIBILITY_C4` 조건을 충족했다. C4 verifier를 이어서 실행했다.

## 정책 반영

`BREAKDOWN-A`는 원국 취약성과 같은 관계 경로의 실제 현재 손상을 사용한다. `BREAKDOWN-B`는 작동 중인 원국 배우자 축, 현재 배우자성 actor의 실제 효과, 현재 평가 범위의 배우자궁 충을 사용한다. 충은 조립된 위험 판정과 별도로 관계 변화에 연결한다.

상위 범위에서 들어온 actor는 현재 효과의 canonical 승계 상태와 그 효과의 원래 관계 ID를 제공한 상위 Judgment를 확인한 경우에만 인정한다. 정지된 actor와 실제 작용 근거가 없는 출현은 제외한다. 같은 범위의 두 경로는 하나의 위험 판정에 각 경로 ID와 근거를 연결한다. 날짜 투영은 기존 Event Timing을 사용한다.

## Targeted 결과

| 검증 | 결과 |
|---|---|
| 丁酉 원자료 | 작동 중인 원국 배우자 축, 丁의 실제 배우자성 작용, 卯酉 충 확정. `relationship_change` 및 `relationship_breakdown_risk` 확정 |
| 충 단독 | 배우자궁 교란과 관계 변화 확정, 파탄 위험 발행 0 |
| 작동 배우자성 단독 | 배우자 사건 활성화 확정, 파탄 위험 발행 0 |
| 정지 배우자성 + 충 | 배우자궁 교란 확정, 사건 활성화 및 파탄 위험 발행 0 |
| 원국 취약성 단독 | 파탄 위험 발행 0 |
| 상위 범위 승계 | 실제 승계와 상위 Judgment가 확인된 경우 위험 확정. 상위 증거를 뺀 입력에서는 파탄 위험 발행 0 |
| 두 경로 공존 | 같은 범위에 위험 판정 1건, `BREAKDOWN-A`와 `BREAKDOWN-B` 경로 ID 모두 연결 |
| 乙丑 + 甲辰 | 기존 Path A 위험 확정과 甲辰의 높은 위험 유지 |
| 戊戌 및 戊申 | 戊戌 결혼 기회, 戊申 결혼 기회·주의 유지 |

丁酉 원자료는 Gregorian 범위가 없는 의미 판정으로 검증했다. 합성 달력 fixture에서는 Decision의 경로 ID가 투영 Fact까지 연결되는 것을 확인했다.

구현 범위는 C4 정책, Event Timing의 additive 근거 및 투영 필드, Master 15·16, C4B 검증기와 C4 회귀 기대값이다. Judgment 계산과 RoleHistory, C1·C2·C3, 기존 Outcome, 고객 renderer에 대한 실행 코드 변경은 0건이다.

[C4 정책 구현](../../lib/compatibility/relationshipLifecycle.ts) · [Targeted verifier](../../../scripts/verify-compatibility-spouse-event-disruption-c4b.mjs) · [Master 16](../rules/master/16-compatibility-spec.md) · [Master 15](../rules/master/15-event-timing-spec.md)

## 회귀 검증

Compatibility C1·C2·C3·C4, Judgment 35/35, Relationship Outcome P4-E, Event Timing Batch 1 P4-M.2와 제품 배선 P4-N.1, Personality P2-G 및 KO·JA·EN Renderer, Money P4-I, Health P4-G를 통과했다. `npx tsc -b`, `npm run build`, `git diff --check`도 통과했다. Judgment의 이전 문서 경로는 임시 검증 사본에서만 연결했다.
