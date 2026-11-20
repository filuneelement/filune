# FILUNE P4-J Money Outcome Integration Audit

## A. 전체 판정

**`P4J_FIX_REQUIRED`**

P4-I 최종 판정 `READY_FOR_MONEY_OUTCOME_AUDIT`을 확인했다. 월운 보호 상실 시 Money fact가 누락되는 통합 결함을 수정했다. CS-126의 12절기월 평가에서는 기존 Judgment의 기간 승계 오류가 재현되어 Batch 1을 닫을 수 없다. 오류는 Money Outcome이나 Reading Assembly가 실행되기 전에 발생한다. [P4-I 결과](./p4i-money-outcome-batch1-result.md) · [P4-J 검증 스크립트](../../../scripts/verify-money-outcome-integration-p4j.mjs)

## B. Actual Pipeline

| 단계 | 실제 출생 입력 검증 |
|---|---|
| Canonical | CS-005, CS-126, CS-127 및 기존 Judgment Runtime Context 출생 입력을 사용했다. |
| Judgment | 각 입력의 기존 P1 계산 결과를 사용했다. CS-126의 경계를 가로지르는 절기월 창은 아래 오류로 차단된다. |
| Daewoon | CS-126의 1998-01-15 평가에서 식신생재의 획득·방식을 확인했다. |
| Sewoon | CS-126의 1998-01-15 평가에서 두 독립 식신생재 경로의 획득·방식을 확인했다. |
| Month | CS-005의 연속 12절기월에서 원래 시작·종료와 Judgment 스냅샷 ID를 대조했다. 창은 2026-11-07T09:52:33.362Z부터 2027-11-07T15:38:35.026Z까지다. CS-126의 2027-07-15 월운에서 식신생재, Runtime Context의 1999-09-15 월운에서 실제 분탈·유지 곤란을 확인했다. |
| Money Outcome | 실제 Judgment 결과를 `moneyOutcomeFromReading`으로 읽고, 생활 결과와 원천 스냅샷을 대조했다. |
| Reading Assembly | 실제 Money fact로 Premium과 Free를 조립하고 ID·방향·확정도·기간·근거를 비교했다. |

**UPSTREAM_JUDGMENT_REGRESSION**. CS-126, 창 시작 2026년 11월, 평가 2027-07-15 UTC에서 `Carry does not cover full destination period; boundary split required.`가 발생한다. 기존 코드에서도 같은 출생 사례와 창 시작점에서 같은 오류가 재현됐다. 기간 승계와 경계 분할 판단은 후속 Judgment 수정 대상으로 기록했다. [기간 검사](../../lib/judgment/evaluators/stemCombination/carryForward.ts#L92)

**P4J_ASSEMBLY_BUG · 수정 완료**. P4-I 보호 fixture에 기존 P1 대운·세운·월운 평가 경로를 적용했다. 세운의 실제 재성 보호가 멈추면 월운에서 기존 손상 경로가 다시 작동한다. 월운 스냅샷만 조립한 경우에는 직전 세운의 보호 근거가 없어서 월운 분탈·유지 곤란 fact가 모두 빠졌다. 월운을 계산할 때 이미 나온 직전 세운의 관계와 현재 기능을 전달하자 전체 Judgment 체인과 같은 두 fact가 생성됐고 CH-10이 해당 ID를 재사용했다. 세운 근거는 월운 검증에 사용되며 월운 창에서 새 세운 Money fact를 발행하지 않는다. [월운 스냅샷](../../lib/judgment/pipeline/internalReading.ts#L410) · [Money 어댑터](../../lib/outcome/money/fromJudgment.ts#L8)

## C. Money Axes

| 축 | 확인 범위 |
|---|---|
| Acquisition | CS-126 원국·대운·세운·월운에서 `can_earn`. |
| Generation method | CS-126 식신에서 `skill_and_output`. Runtime Context 2003-02-15 월운과 P4-I HO-T1 상관생재에서 `ingenuity_and_expression`. |
| Retention | CS-126의 독립 획득 경로는 `unresolved`. Runtime Context 1999-09-15의 월운은 `harder_to_retain`. P4-I에서 보호와 재격 감당 근거를 별도로 검증했다. |
| Division/outflow | Runtime Context 1999-09-15의 월운, P4-I ROB-T3의 유효 재 손상 및 월운 보호 상실 보강 fixture에서 `wealth_can_be_divided_or_flow_out`. 손상 연결이 없는 겁재는 출력 0건. |
| Money-related difficulty | P4-I의 명시적 `harmful_killing` 증거에서 `wealth_path_can_bring_difficulty`. 출생 fixture에서 같은 활성 조건을 입증할 자료는 보류. |
| Duration/stability | P4-I 재격의 명시적 `wealth_capacity_insufficient`에서 `harder_to_sustain_accumulation`. CS-126의 실제 감당 근거가 없는 경로는 보류. |
| Benefit capture | `NOT_IMPLEMENTED`. P4-I 범위 밖이며 기존 출생 fixture로 독립 귀속을 검증할 수 없다. |
| Problem resolution | `NOT_IMPLEMENTED`. 해결 여부·수단과 성과 귀속을 독립 확인할 현재 Money 매핑이 없다. |

`money_loss_or_division`, `money_related_problem`, `money_duration`은 각각 분탈·난제·지속성의 구현 타입이다. 원고의 식신·상관 획득, 분탈, 감당, 해로운 재생살 표현을 적용했다. 형제·동료 등 구체 귀속을 부여할 승인 근거는 확인되지 않았다. [Assertion Policy 매핑](./p4-outcome-assertion-policy-correction-result.md#b-money-impact) · [Outcome 명세](../rules/master/14-outcome-semantic-spec.md) · [원고 05 재격](../source/primary/05-격국론.md#L98) · [원고 07 생재와 재생살](../source/primary/07-사주풀이예시.md#L1248)

## D. Mixed Outcomes

| 조합 | 기존 P1/P4-I 정책 fixture | 실제 출생 경로 |
|---|---|---|
| Acquisition + retention weakness | PASS · 감당 부족 및 현재 재 손상 | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |
| Acquisition + outflow | PASS · 재격의 명시적 재 손상 증거 | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |
| Acquisition + difficulty | PASS · 실제 해로운 칠살 강화 | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |
| Resolution + shared/reduced benefit capture | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |

정책 fixture는 실제 Judgment 엔진을 실행하며 검토된 정성 증거를 전달한다. 출생 경로에 근거가 없는 감당 부족이나 성과 귀속을 추가하지 않았다. [P4-I 정책 회귀](../../../scripts/verify-money-outcome-p4i.mjs)

## E. Pattern Regression

| 경로 | 판정 |
|---|---|
| 財格 財剋印 | PASS · `WEALTH-04` favorable. Money 손상 0건. |
| 印格 財剋印 | PASS · 기본 불리 경로는 인성 압박으로 유지. P1 RES-T4 `resource-excess-uses-wealth` 유리 반전 유지, Money 손상 0건. |
| 食神格 財制印 | PASS · `food-god-wealth-protects-output` favorable. Money 손상 0건. |
| 財生 harmful Killing | PASS · P4-I의 활성 화살표에서 획득과 재 관련 난제가 각각 남았다. |
| 財生 needed Killing | PASS · 필요한 칠살과 유해 근거가 없는 경우의 재 관련 난제 0건. |

[Master 01](../rules/master/01-pattern-master.md) · [Master 04](../rules/master/04-root-twelve-stages-master.md) · [Master 05](../rules/master/05-sangshen-byeong-gueung-master.md) · [Master 06](../rules/master/06-pattern-effect-policy.md) · [Master 08](../rules/master/08-luck-master.md) · [Master 09](../rules/master/09-engine-integration-spec.md)

## F. Provenance

출생 경로의 Judgment·relation·role·luck effect ID를 해당 스냅샷에서 확인했다. 같은 입력의 재투영과 Relation·Role·LuckEffect 배열 역순에서 ID·의미·확정도·근거를 비교했다. `conditionId`와 `originRelationId`로 현재 관계와 원점 경로를 연결했다.

| 출생 경로 집계 | 건수 |
|---|---:|
| Money OutcomeFacts | 31 |
| With provenance | 31 |
| Orphan / wrong scope | 0 / 0 |
| Duplicate IDs / 동일 원천 경로 중복 | 0 / 0 |

## G. Lifecycle

실제 출생 경로는 활성 22건, 유지 보류 9건이다. 세 월운 평가에서 원래 절기월의 종료 시각으로 관측 기준을 옮겼을 때 활성 fact 10건이 같은 ID로 만료됐다. 조립 누출은 0건이며 만료에서 새 손실·회복 의미가 생성된 사례는 0건이다.

P4-I 회귀의 활성 33건, reduced 3건, 보호 1건, 손상 재활성 1건, 만료 9건을 확인했다. stopped 재의 활성 획득과 발동 전 조건부 재생살의 확정 난제는 0건이다. 보강 fixture에서는 보호 기능 정지 후 운의 분탈이 활성화됐고, 이후 보호 상태가 복원되면서 같은 경로의 새 분탈이 생성되지 않았다. 기존 분탈 ID는 만료 이력으로 남았으며 현재 조립에서 제외됐다.

## H. Assembly

CH-05 `PARTIAL`. CH-08/09/10의 timing 배치와 CH-09의 월운 context는 CH-05와 같은 semantic unit 및 OutcomeFact를 참조한다. P4-I/P4-J에서 확정도와 출처를 대조했다. [Assembly 명세](../rules/master/13-reading-assembly-spec.md)

출생 경로의 CH-08 재사용 2건, CH-09 세운 재사용 6건, CH-10 재사용 10건. 월운 보호 상실 보강 fixture에서 CH-10 재사용을 추가로 2건 확인했다. 결론 중복과 B-6 역할 불일치는 각각 0건이다.

## I. Free / Premium

Free는 기존 목차에서 Money 슬롯을 노출하지 않는다. 동일 입력으로 Money fact가 있는 경우와 없는 경우의 Free 조립 결과를 비교했다. Daewoon / Sewoon / Month / Day 누출은 각각 0건이다. Free에 노출된 Natal Money fact는 0건으로 두 모드 간 해당 의미·확정도·근거 불일치는 각각 0건이다.

## J. Assertion Policy

| 검사 | 건수 |
|---|---:|
| Structural-only weakening | 0 |
| Confirmed-axis suppression | 0 |
| Mixed-to-ambiguous collapse | 0 |
| Unsupported result invention | 0 |

집계 범위는 실제로 완료된 출생 경로와 기존 P4-I 정책 검증이다. CS-126에서는 유지 근거가 보류된 경우에도 생재의 획득과 기술·생산 결과가 읽기에 남았다. 위 건수에 Judgment에서 중단된 창은 포함하지 않았다.

## K. Safety / Scope Boundary

감사 범위에서 구체 금액·복권·투자상품 추천·매수/매도·대출 지시·재물 점수·순위·최선/최악 월 출력은 각각 0건이다. 계약·사업·지출·협업 행동 권고는 별도 범위다. 정재·편재의 이름만으로 월급·투자 수입을 생성하는 매핑 및 런타임 LLM/API 호출은 0건이다.

## L. Isolation

JudgmentResult, Luck snapshots, PersonalityResult는 실행 전후 값 변경이 각각 0건이다. Money를 추가하기 전후의 비Money semantic unit 변경도 0건이다. Judgment → Outcome 의존성 0건. Judgment 변경은 월운 평가가 이미 계산한 상위 출처를 전달하는 데 한정된다. Health, Relationship, Work, Selection, Compatibility 및 Personality 의미 변경은 각각 0건이다.

## M. Regression

기존 기대값을 유지했다. 레거시 Judgment 검증이 읽는 경로는 임시 사본에 `651c431`의 소스·규칙 문서로 복원했다. P4-J는 현행 저장소에서 실행했다.

| 검증 | 결과 |
|---|---|
| Judgment | PASS · 35/35. CS-005 월운 회귀 포함. |
| P2-A~G / P3-A~F | PASS · 7/7 및 6/6. |
| P4-B / P4-C | PASS. |
| P4-E / P4-F | PASS · `RELATIONSHIP_OUTCOME_BATCH1_COMPLETE` 유지. |
| P4-G / P4-G.1 / P4-H | PASS · `HEALTH_OUTCOME_BATCH1_COMPLETE` 유지. |
| P4-I | PASS · 명시적 증거를 가진 정책 fixture의 Money fact 55/55 근거 확인. |
| P4-J | FAIL · `UPSTREAM_JUDGMENT_REGRESSION` 1건으로 종료 코드 1. 완료된 출생 경로와 보호 상실 보강 검사는 통과. |
| `npx tsc -b` / `npm run build` | PASS / PASS. |

## N. 남은 상태

| 상태 | 항목 |
|---|---|
| FAIL | CS-126의 기간 경계가 들어가는 12절기월 통합. |
| PARTIAL | CH-05의 승인된 Money subset. |
| DEFERRED | 실제 감당·지속 근거가 없는 결과, 구체 기간·금액의 별도 출처, 계약·사업·지출·협업 타이밍. |
| NOT_IMPLEMENTED | Money Renderer, 해결·성과 귀속, 행동 권고. |
| NOT_TESTABLE / FIXTURE_GAP | 실제 출생 경로의 세 가지 동시 결과와 명시적 감당 부족에 따른 지속성 제약. 공유·축소 성과 귀속은 구현 근거와 fixture 모두 공백이다. |
| TECH_DEBT | 기존 회귀의 레거시 문서 경로. |
| UPSTREAM_REGRESSION | 월운 창 평가의 carry 기간 경계 오류. |

감사는 현행 출생 fixture의 관찰 범위를 명시한다. P4-I의 명시적 증거가 있는 정책 fixture에서는 획득과 유지 곤란·분탈·난제가 모두 독립적으로 유지됐다.
