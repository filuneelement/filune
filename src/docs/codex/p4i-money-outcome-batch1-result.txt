# FILUNE P4-I Money Outcome Semantic Engine — Batch 1

**`READY_FOR_MONEY_OUTCOME_AUDIT`**

진입 판정은 `OUTCOME_ASSERTION_POLICY_READY`, `RELATIONSHIP_OUTCOME_BATCH1_COMPLETE`, `HEALTH_OUTCOME_BATCH1_COMPLETE`였다. 최신 14 명세와 공통 판정 감사의 사례 매핑을 적용했다. [14 Outcome Semantic Spec](../rules/master/14-outcome-semantic-spec.md) · [Assertion Policy 감사](./p4-outcome-assertion-policy-correction-result.md)

## Money axes

| 결과 | 상태 | 의미와 근거 |
|---|---|---|
| money_acquisition | SUPPORTED | 유효한 식신·상관의 생재 → 재물을 벌 수 있음. 격별 현재 정책과 관계의 실제 작동을 확인한다. |
| money_generation_method | SUPPORTED | 식신의 기술·생산·표현과 상관의 응용·표현을 유효한 획득 경로에 연결한다. |
| money_retention | SUPPORTED / DEFERRED | 유효한 분탈, 확인된 보호와 재격의 명시적 감당 부족을 별도로 표현한다. 유지 근거가 비어 있으면 그 결과만 보류한다. |
| money_loss_or_division | SUPPORTED | 실제 비겁의 유효한 재 손상 → 재물이 나뉘거나 빠져나갈 수 있음. 현재 보호와 경쟁·통관을 반영한다. |
| money_related_problem | SUPPORTED | 재의 사용 경로와 실제 해로운 칠살이 연결될 때 동반되는 난제. 필요한 칠살과 발동 전 조건부 이력을 구분한다. |
| money_duration | SUPPORTED / DEFERRED | 재격에서 현재 감당 부족 근거가 확인된 경우 축적을 지속하기 어려움을 기록한다. 구체적 유지 기간은 별도 근거가 필요하다. |

감당 부족은 기존 Judgment의 증거 ID가 붙은 `capacity` 결과를 사용했다. 검증의 재물 감당 상태는 명시적으로 공급한 정성 증거를 Judgment가 소비한 fixture다. Root 단독으로 감당을 재계산하거나, 근거가 없을 때 유지·지속성을 채우지 않는다. 귀속·해결은 원고의 후속 감사 후보로 유지했다. 검증한 기존 fixture에서 금전 성과의 귀속까지 입증하는 독립 매핑을 확인하지 못했다. 상대·형제의 실제 관여, 금액, 계약·사업·지출·협업 시기, 투자·대출 조언은 출력 범위 밖이다. [Money 매핑 근거](./p4-outcome-assertion-policy-correction-result.md#b-money-impact) · [Master 04](../rules/master/04-root-twelve-stages-master.md)

## Mixed Outcome

| 조합 | 검증 사례 |
|---|---:|
| 획득 + 유지 곤란 | 1 |
| 획득 + 분탈/유출 | 1 |
| 획득 + 동반 난제 | 1 |

유지 근거가 없는 fixture에서도 확인된 획득과 방법을 보존했다. 감당 부족이 운에서 따로 확인된 경우에는 기존 획득을 운의 새 획득으로 복제하지 않고 유지·지속성에 해당 운 효과를 연결했다. 세운의 실제 운-운 약화는 같은 원천의 contextual 획득·방법으로 유지했다. [P4-I 검증](../../../scripts/verify-money-outcome-p4i.mjs)

## Outcome Assertion Policy 준수 감사

P4-I 검증 fixture에서 확인한 결과다.

```text
source-supported result weakened to structural-only = 0
confirmed axis hidden because another axis deferred = 0
mixed outcome collapsed to ambiguous = 0
unsupported new real-life result = 0
```

## Pattern-specific regression

| 경로 | 결과 |
|---|---|
| 財格 財剋印 | WEALTH-04 favorable 유지. Money 손상 변환 0. |
| 印格 財剋印 | 기존 불리 기능은 인성 압박을 나타낸다. Money 손상 변환 0. |
| 食神格 財制印 | 식신을 보호하는 favorable 경로. Money 손상 변환 0. |
| 財生 harmful Killing | 활성 Judgment에서 재 관련 난제와 획득을 함께 보존. |
| 財生 needed Killing | 필요한 칠살 및 harm 판정 없는 財生殺의 자동 난제 0. |

## Provenance / lifecycle

| 항목 | 결과 |
|---|---:|
| 검증 Money facts / 근거 포함 | 55 / 55 |
| Orphan / 중복 ID / scope 불일치 | 0 / 0 / 0 |
| 활성 / reduced | 33 / 3 |
| 보호 유지 / 보호 상실 뒤 재활성 | 1 / 1 |
| 財 stopped 상태의 활동 획득 | 0 |
| 만료 이력 / 현재 누출 / 자동 손실 | 9 / 0 / 0 |

현재 Judgment의 역할 기능, Runtime, ActualStructuralFunction과 관계 ID를 사용한다. 재 손상·보호와 실제 해로운 칠살은 승인된 scope별 기능을 사용한다. 하위 운은 직접 참여자, 해당 운에 기록된 유효 효과, 또는 보호 상실 원천을 확인하여 발행한다. 동일 경로는 조건 ID와 원점 관계를 보존한다. 동일 입력 및 배열 역순에서 결과 ID·의미·근거가 동일했다.

## Assembly / isolation

CH-05는 PARTIAL이다. 대운·세운·월운 fact의 ID·확정도·근거를 CH-08·09·10에서 각각 재사용했다. 중복 결론과 무료 시기 누출은 각각 0건이다. 현행 무료 목차에는 Money 슬롯이 없어 Premium CH-05에서 생활 의미를 조립한다. 별도 Renderer를 추가하지 않았다.

Judgment·Personality·Relationship·Health·Work·Selection·Compatibility의 의미 변경은 각각 0건이다. 구체 금액·복권·종목 추천·매수/매도·대출 권고 및 재물 점수 생성은 0건이다.

## Regression

| 검증 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A~G / P3-A~F | PASS |
| P4-B / P4-C / P4-E / P4-F / P4-G / P4-G.1 / P4-H | PASS |
| P4-I | PASS |
| npx tsc -b / npm run build | PASS |

레거시 Judgment 스크립트의 문서 경로는 임시 사본에서 연결했다. 기존 기대값을 유지했다. 실제 출생 경로의 여섯 축 통합 검증은 P4-J의 범위다.
