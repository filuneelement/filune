# FILUNE P4-K.1 Health & Relationship Semantic Expansion

P4-K의 `HEALTH_RELATIONSHIP_ASSERTION_AUDIT_COMPLETE`, `SEMANTIC_EXPANSION_REQUIRED`, 공통 정책의 `OUTCOME_ASSERTION_POLICY_READY`를 확인했다. 승인 범위와 출처가 각 결과에 요구하는 조건을 Master 14에 추가했다. [P4-K 감사](./p4k-health-relationship-assertion-backaudit-result.md) · [Assertion Policy](./p4-outcome-assertion-policy-correction-result.md) · [Master 14](../rules/master/14-outcome-semantic-spec.md)

**최종 판정 `READY_FOR_HEALTH_RELATIONSHIP_REAUDIT`**

## A. Health

| 항목 | 구현 및 검증 |
|---|---|
| Traditional correspondence | 기존 일간 대응과 乙·丁·庚·壬의 오행 수준 제한을 유지했다. 대응 fact 자체에는 부담 의미가 없다. |
| Body-area burden | 독립적으로 입증된 영향을 받는 기능과 승인 영역에 `body_area_burden`을 기록한다. P4-K의 월운 보호 상실 사례로 확인했다. |
| Health burden | 기존 승인 불리 경로에 `health_burden`을 기록한다. 원국 OFF-T2 및 월운 보호 상실 사례가 근거다. |
| Health problem-prone period | 해당 운에서 실제 발동·재발하는 조건과 평가 구간이 있으면 `health_problem_prone_period`을 함께 보존한다. |
| Health management period | 승인된 시기를 살펴볼 수 있다는 독립 의미를 기록한다. 질환 발생·조치 결정·회복 기간은 이 의미의 범위 밖이다. |
| Certainty downgrade | 기간 여부에 따른 일괄 `contextual` 상한을 제거했다. 발동한 불리 경로는 `confirmed`가 가능하다. 약화·후보는 근거 수준에 따라 `contextual`을 유지한다. |
| Month-window omission | 월운 스냅샷의 해당 세운 기능 증거를 전달했다. P4-K 재현의 동일 월을 전체 체인과 창 경로에서 비교해 fact 수 1/1, 누락 0, ID·provenance·확정도·구간 일치를 확인했다. |

기존 Health fact의 ID와 관계 추적은 유지했다. `lifeMeanings`에 독립 의미를 기록해 같은 현재 조건과 기간을 공유하며, Assembly가 CH-07과 시기 장에서 같은 unit을 참조한다. 기본 현재 월 스냅샷이 포함된 입력은 같은 기간의 다시 계산된 창 스냅샷과 중복 발행하지 않는다. 별도로 계산되어 서로 다른 upstream ID를 가진 기록에는 각 출처 ID를 보존한다. 월운 종료 후 fact의 기존 ID는 이력에 남고 CH-10의 현재 노출은 사라진다. [Health 발행](../../lib/outcome/health/healthOutcome.ts) · [월운 어댑터](../../lib/outcome/health/fromJudgment.ts) · [검증](../../../scripts/verify-health-relationship-expansion-p4k1.mjs)

**Gap count** before 5 · after 0 · remaining 0. P4-K에서 확인된 승인 범위의 두 생활 의미 축소, 일괄 확정도 상한, 영역 부담 의미 공백, 월운 누락을 센다. 독립 상신 손상·Formation 건강 양성 fixture, 임상 주장, 독립 회복 예측은 이 집계의 구현 범위 밖이다.

## B. Relationship

| 항목 | 상태 |
|---|---|
| Contact | 기존 근거와 조건부 접점 신호 유지. |
| Change | 기존 충·변화 조건 및 확정도 유지. |
| Formation | CS-127 실제 출생 입력에서 활성 일지 육합과 적용 가능한 같은 세운의 역할을 확인했다. 기존 접점과 동일 출처를 참조하는 별도 `relationship_formation`이 `confirmed`로 발행됐다. 생활 상태를 추정하지 않는다. |
| Commitment | 별도 의미와 근거 요건을 Master 14에 등록했다. I-22 ③의 독립 조건과 양성 fixture가 없어 `NOT_TESTABLE_WITH_CURRENT_FIXTURE`. |
| Pressure | 여성의 실제 정관 손상과 연결된 OFF-03 subset에서 `relationship_pressure`를 발행한다. OFF-T2 정책 fixture에서 `confirmed`로 검증했다. |
| Breakdown | SOURCE_GAP. 관계 부담에서 이별·이혼 발행 0. |
| Partnership context | SOURCE_GAP. 연애 또는 업무로 분류하려면 해당 맥락의 독립 확인이 필요하다. |

형성 기회와 부담은 독립된 ID를 가지며 한 결과를 발행할 때 다른 축을 검사하거나 상쇄하지 않는다. 같은 scope에서 두 축을 동시에 입증하는 실제 fixture는 `NOT_TESTABLE_WITH_CURRENT_FIXTURE`. 성별 적용 근거가 빠진 CS-127 대조 입력에서는 같은 접점 신호가 남았다. [Relationship 구현](../../lib/outcome/relationship/relationshipOutcome.ts) · [A I-22](../source/authority/A_rev182.md#L325) · [원고 07 L202–207](../source/primary/07-사주풀이예시.md#L202) · [원고 07 L762–765](../source/primary/07-사주풀이예시.md#L762)

**Gap count** before 3 · after 1 · remaining 1. 형성·약속·부담의 우선 매핑 후보 집계다. 남은 약속은 보류이며 기존 접점과 변화는 유지했다. 종료 및 업무 협력은 별도 source gap으로 남았다.

## C. Assertion Policy와 고객 용어

| 검사 | 건수 또는 검증 범위 |
|---|---|
| Health structural-only weakening | 0 |
| Health period-only certainty downgrade | 0 |
| Relationship formation → contact collapse | 0 |
| Relationship commitment → change collapse | 0건 관측. 미발행 축이며 양성 검증은 보류. |
| Relationship pressure → change collapse | 0 |
| Mixed outcome collapse | 0건 관측. 동시 양성 검증은 보류. |
| Unsupported invention | 0 |
| 고객에 직접 노출되는 명리 용어 추가 | 0 |

기존 고객 표현 승인 한계와 임상 사건의 금지를 유지했다. 이번 작업은 고객 렌더러 연결을 추가하지 않았다.

## D. 격리와 회귀

Judgment 의미 변경 0, Money 의미 변경 0, Work 변경 0, Compatibility 변경 0, Personality 변경 0. P4-J의 기존 작업과 경계 blocker는 이 범위 밖이다. 레거시 Judgment 검증에는 이전과 같이 임시 사본에 문서 경로를 복원했다. P4-E/F 테스트에서 기존 신호의 기대값은 유지하고 새 fact의 출처 검사를 추가했다. P4-G.1의 월·연·대운 재활성 회귀는 유지했고, 예전의 기간 확정도 상한을 직접 기대하던 검사는 이번 명세의 확정 조건에 맞춰 갱신했다.

| 검증 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A–G / P3-A–F | PASS · 7/7 및 6/6 |
| P4-B / P4-C | PASS |
| P4-E / P4-F | PASS · `RELATIONSHIP_OUTCOME_BATCH1_COMPLETE` 유지 |
| P4-G / P4-G.1 / P4-H | PASS · `HEALTH_OUTCOME_BATCH1_COMPLETE` 유지 |
| P4-I | PASS |
| P4-K.1 신규 검증 | PASS · Health 부담 및 기간, 동일 월의 fact/ID/근거, 만료, CS-127 형성, OFF-T2 부담 |
| `npx tsc -b` / `npm run build` | PASS / PASS |

다음 단계는 P4-K.2 Health & Relationship Semantic Reaudit이다.
