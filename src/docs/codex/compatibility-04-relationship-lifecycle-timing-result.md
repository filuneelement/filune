# FILUNE Compatibility-04 Relationship Lifecycle & Timing

**초기 C4 판정 · `COMPATIBILITY_C4_JUDGMENT_FACT_GAP`**

후속 C4B에서 승인된 `BREAKDOWN-B`로 丁酉의 위험을 확정했고 C4 verifier를 다시 통과했다. [C4B 최종 결과](compatibility-04b-spouse-event-disruption-policy-result.md)

C4의 개인·Pair 판정 및 기존 Event Timing 달력 투영을 구현했다. 필수 원자료 사례 네 건 중 세 건에서 목표 판정을 재현했다. 07:3274의 실제 이혼 사례에서는 丁酉의 배우자궁 충과 관계 변화를 확인했으며, 원국 취약성과 현재 배우자 기능 손상을 같은 경로로 연결할 공개 Judgment Fact가 부족해 위험 판정을 유보했다.

## 판정별 검증

| 항목 | 결과 |
|---|---|
| Relationship formation | 배우자궁 합에 의한 형성 기회 확정 |
| Relationship change | 배우자궁 충만 있는 사례에서도 변화 확정 |
| Marriage opportunity | 원자료 결혼 및 결혼 주의 사례에서 확정 |
| Marriage favorable | 같은 범위의 작동 중인 유리한 배우자 관계를 별도로 확인한 fixture에서 확정 |
| Marriage caution | 戊申에서 결혼 기회와 관계 부담을 각각 확정 |
| Relationship strain | 관계 기능의 실제 손상 근거에서 확정. C3 표현 억제 강화도 별도 경로로 연결 |
| Relationship relief | C3의 확정된 개인 표현 회복과 상호 소통 완화를 각각 확인 |
| Relationship breakdown risk | 乙丑의 보호 해제와 배우자성 공격 재활성화로 확정. 甲辰의 동일 경로 추가 작동으로 높은 위험 확인 |
| One-sided windows | 상대 기회와 겹치지 않는 실제 구간을 개인 구간으로 보존 |
| Mutual windows | 양쪽 결혼 기회의 Gregorian 교집합을 보존 |

## 원자료 회귀

| 사례 | 결과 |
|---|---|
| 07:1849 실제 결혼 | 戊戌의 午戌을 현행 유효 반합국으로 분류하고 결혼 기회를 확정 |
| 07:596–605 결혼 기회와 불리함 | 戊申의 배우자성 작동과 확인된 재생살 경로로 기회와 주의를 모두 확정. 원자료의 칠살 악화 근거를 기존 Judgment 검증 입력으로 전달 |
| 07:3274 배우자궁 충과 실제 이혼 | 丁酉의 卯酉 충으로 변화를 확정. 원국 배우자 기능 취약성과 현재 같은 배우자 기능의 손상 Fact가 없어 위험은 유보 |
| 07:1447–1451 복합 이혼 | 원국의 보호받는 甲→戊 공격, 乙丑에서 庚의 정지 후 같은 공격의 재활성화, 甲辰에서 추가 작동을 확인해 높은 파탄 위험을 확정 |

원자료의 간지 이름만 제공된 경우 달력 투영을 유보했다. Day 발행은 기존 독립 Day 평가 및 투영 지원이 필요하다. 결혼 기회가 확인되고 같은 범위의 결혼 유불리 근거가 부족한 경우에도 기회는 보존했다.

## Judgment Fact 부족

07:3274의 원국 甲→丙과 丁酉 범위의 甲→丁 관계는 Judgment에 관찰되지만 배우자 기능 손상 방향은 확정되지 않는다. 같은 범위의 卯酉 충은 접촉·변화 자료이며, 기존 Relationship Outcome은 해당 범위의 확정된 배우자 기능 손상이나 지속 부담을 제공하지 않는다. 필요한 근거는 원국의 관계 취약 경로와 丁酉에서 같은 기능의 실제 손상을 각각 확인하고 연결하는 공개 Fact다.

## 검증 계약

- 금지 shortcut 위반 0건. 충만 있는 경우, 합만 있는 경우, 배우자성 출현만 있는 경우, Money 악화만 있는 경우를 각각 검증했다.
- 신규 verifier에서 중복 ID, 고아 근거, 범위 불일치, 임의 Gregorian 날짜, 입력 mutation 모두 0건.
- 기존 C1·C2·C3와 Judgment 및 각 Outcome의 입력과 결과를 읽어서 사용한다. 관계 시기 고객 문구와 C5 조립은 포함하지 않는다.

[개인·Pair 구현](../../lib/compatibility/relationshipLifecycle.ts) · [C4 verifier](../../../scripts/verify-compatibility-lifecycle-timing-c4.mjs) · [Master 15](../rules/master/15-event-timing-spec.md) · [Master 16](../rules/master/16-compatibility-spec.md)

## 회귀

Compatibility C1·C2·C3, C4 신규 verifier, Judgment 35/35, Personality P2-G와 KO·JA·EN Renderer, Money P4-I, Health P4-G, Relationship P4-E, Event Timing Batch 1 P4-M.2, Decision·Projection P4-M.3B, 제품 배선 P4-N.1, `npx tsc -b`, `npm run build`, `git diff --check` 통과. Judgment 검증의 이전 문서 경로는 임시 사본에서만 연결했다.
