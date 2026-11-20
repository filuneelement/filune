# FILUNE P4 Outcome Assertion Policy Correction

**`OUTCOME_ASSERTION_POLICY_READY`**

## A. Core policy

| 항목 | 계약 |
|---|---|
| Source-supported real-life outcome | 확정 구조와 검증된 출처 매핑이 있으면 생활 결과를 출처 강도대로 기록한다. 수입을 만들 수 있다는 판단, 실제 수입 발생, 날짜와 금액은 각각 독립 근거를 요구한다. |
| Partial deferred | 증거 부재, 출처 불명확 또는 같은 결과 안의 우선순위 미확정일 때 해당 항목만 보류한다. |
| Mixed outcomes | 이익·비용·부작용과 독립된 축의 반대 결과를 함께 보존한다. |
| Acquisition / retention | 얻는 것과 유지·축적하는 것을 분리한다. 기간·안정성은 별도 근거를 가진다. |
| Resolution / benefit capture | 해결 여부, 수단, 본인·외부 귀속은 각각 판단한다. |

원고에서 식상으로 난제를 해결해 공을 얻는 경우에도 구설이 남을 수 있다. 겁재가 합살한 사례에서는 해결을 기록하되 공의 일부가 동료·경쟁자에게 돌아갈 수 있다는 의미를 별도로 보존한다. 겁재합이나 식상 이름만으로 해결이나 귀속을 확정하지 않는다. [식상 제살과 구설](../source/primary/07-사주풀이예시.md#L1267) · [합살과 귀속](../source/primary/07-사주풀이예시.md#L903)

현행 OutcomeFact의 semanticType을 결과 식별자로 사용하고 scope·기간·확정도·lifecycle·provenance를 재사용한다. 방향·귀속은 필요한 domain payload에서만 표현한다. 독립 결과별 fact를 사용하면 모든 축을 공통 필드로 추가할 필요가 없다. 후속 OutcomeMappingRule에는 필요 fact, 현재 상태, 생활 의미와 표현 강도, 범위 및 근거를 기록한다. [OutcomeFact](../../lib/outcome/types.ts) · [개정 명세](../rules/master/14-outcome-semantic-spec.md#outcome-assertion-policy)

## B. Money impact

P4-D의 OUT-MONEY-01은 재 형성 경로에, OUT-MONEY-04는 구조 효과 승계에 머물렀다. 개정 계약은 출처가 직접 뒷받침하는 획득·유지·분탈·난제를 독립적으로 기록한다. OUT-MONEY-02는 유입과 보유 제약의 분리와 실제 감당·보호 근거를 요구한다. [P4-D](./p4d-outcome-semantic-source-audit-result.md) · [B CH-5](../source/authority/B_rev38.md#L238)

전문가 원고 07의 전체 3,348줄을 재물·수입·자산·분탈 및 식신/상관생재 표기 변형으로 색인했다. 포괄 검색 557줄은 검토 후보이며 승인 규칙 수가 아니다. 아래는 구조와 생활 결과가 직접 연결된 문맥과 적용 한계를 대조한 매핑이다. 사례의 실제 수입·손해액은 당시 관찰로 남긴다. [전문가 원고 07](../source/primary/07-사주풀이예시.md) · [Master 06](../rules/master/06-pattern-effect-policy.md)

| 결과 | 필요 조건과 허용 범위 | 출처 |
|---|---|---|
| money_acquisition | 현재 유효한 식신→재와 해당 맥락이 입증되면 재물을 벌 수 있음을 기록한다. 상관→재는 실제 경로와 해당 격의 자격을 독립적으로 확인한다. 재성 존재와 전체 유리 방향은 단독 근거가 아니다. | [식신생재](../source/primary/07-사주풀이예시.md#L1256) · [상관생재](../source/primary/07-사주풀이예시.md#L764) · [경합 병존](../source/primary/07-사주풀이예시.md#L1028) |
| money_generation_method | 식신의 기술·언변·재주, 상관의 응용·언변·재주를 실제 수단에 귀속한다. 직업명과 사업체 보유는 추정하지 않는다. | [식신 수단](../source/primary/07-사주풀이예시.md#L1256) · [상관 수단](../source/primary/07-사주풀이예시.md#L984) |
| money_retention | 적용 가능한 재격·재다신약 문맥에서 감당 부족 또는 실제 분탈이 보유를 제약하면 유지·축적 곤란을 기록한다. 무근 단독 판정을 피하고 보호·통관·대체 경로를 확인한다. | [감당과 분탈](../source/primary/07-사주풀이예시.md#L140) · [축적 곤란](../source/primary/07-사주풀이예시.md#L1114) |
| money_loss_or_division | 보호 이후에도 비겁의 실제 작용이 관련 재를 손상하고 출처가 분탈·손실을 연결할 때 해당 의미를 기록한다. 통관으로 재가 살아나는 반례를 보존한다. 문서로 돈이 묶이는 경우는 별도 유동성 매핑을 요구해 보류한다. | [분탈과 관찰된 손해](../source/primary/07-사주풀이예시.md#L1250) · [통관](../source/primary/07-사주풀이예시.md#L2322) · [돈이 묶이는 사례](../source/primary/07-사주풀이예시.md#L2277) |
| money_related_problem | 실제 생성과 연결된 해로운 칠살·난제는 획득과 함께 남긴다. 제살의 실제 방해와 생활 결과의 연결을 각각 확인한다. 財生殺만으로 손실이나 직업 사건을 확정하지 않는다. | [생재와 난제](../source/primary/07-사주풀이예시.md#L1262) · [재 증가와 별도 부담](../source/primary/07-사주풀이예시.md#L1273) · [PP-503](../rules/master/06-pattern-effect-policy.md#L530) |
| money_duration | 출처와 감당·유지 근거가 뒷받침하는 경우 지속성 제약을 기록한다. 특정 운 구간이나 길이는 별도 입증이 필요하다. | [축적 제약](../source/primary/07-사주풀이예시.md#L1117) · [반복 유출과 유지](../source/primary/07-사주풀이예시.md#L2478) |

P4-I 파일은 작업 트리와 로컬 Git 이력에 없었다. 지정 경로에 진입·범위, 여섯 결과, 표현 검토, 검증 기준을 갖춘 개정 명세를 작성했다. 요청에 인용된 세 문구는 원본 위치를 대조할 수 없어 각 문구의 대체 기준을 명세에 직접 기록했다. [P4-I 표현 검토](./p4i-money-outcome-batch1.md#publication-wording-review)

## C. Health impact

| 분류 | 영향 |
|---|---|
| NO_CHANGE | 10일간 근거 수준, A I-16 전통 부위, scoped 근거·승계·재활성·만료, 근거 없는 일간별 세분화 제한. |
| SEMANTIC_EXPANSION_REQUIRED | P4-G/P4-H의 구조 주의와 timing은 경로·구간을 전달한다. 직접 매핑이 검증된 경우에는 그 구간에 비임상적 건강상 어려움 또는 부담이 나타날 수 있다는 생활 의미를 담는다. 전통 영역 부담은 검증된 대상과 A I-16 부위의 출처 연결이 모두 있을 때 허용한다. |
| RENDERER_ONLY | B W-30–35와 D Q10의 고정 문구 안에서 전통 영역 및 살펴볼 시기를 표현한다. 조건부 월은 부위를 생략한다. “건강 문제가 나타날 수 있음”을 그대로 고객에게 내보내는 문구는 W-30 변경 없이 승인하지 않는다. |
| FUTURE_SOURCE_GAP | 독립 회복 시기와 근거 없는 부위 연결은 보류. 독립 상신 손상·Formation 양성 fixture 공백은 기존 감사 상태 유지. |

CS-026/034의 사후 관찰은 비임상적 부담 매핑의 맥락으로 사용한다. 구체 증상·질병명 및 발병 예측, 진단, 수술, 치료, 약, 검사 처방, 수명·사망, 위험률·등급·순위 금지는 유지한다. [⑲-A C–F](../source/health/FILUNE-19A-premium-health-evidence.md) · [P4-D Health](./p4d-health-outcome-supplement-audit-result.md) · [P4-G.1/P4-H](./p4g1-health-outcome-reactivation-fix-result.md) · [B W-30–35](../source/authority/B_rev38.md#L79) · [D Q10](../source/authority/D_rev155.md#L38)

## D. Relationship impact

| 분류 | 영향 |
|---|---|
| NO_CHANGE | 현재 개인 배우자궁·significator·접점/변화 fact, 실제 관계 상태 미전제, 궁합과의 분리. |
| RENDERER_ONLY | 승인된 접점·변화 신호를 생활 언어로 설명하며 원본 확정도·범위를 보존한다. |
| SEMANTIC_EXPANSION_REQUIRED | 관계 변화 강도, 갈등, 관계 여건 저하는 원고 조건과 OP-R03 자격을 검증해야 할 후보. |
| FUTURE_SOURCE_GAP | 성사·발전의 세부 입력 및 무손상·방향 조건. 사례 혼인·이혼 사건을 다른 고객에게 자동 예측하지 않는다. |

[Relationship Batch 1](./p4f-relationship-outcome-integration-audit-result.md) · [원고 사례](../source/primary/07-사주풀이예시.md#L2289) · [A I-22](../source/authority/A_rev182.md#L325)

## E. Work impact

후속 source audit에서 자리 획득·유지·안정성, 직업 난제, 해결 수단, 본인·외부 공로 귀속, 구설 등의 비용과 조직 영향을 독립적으로 검토한다. 원고의 무근과 자리 유지 연결에는 적용 맥락과 실제 감당 근거를 확인한다. 식상제살과 겁재합살의 귀속을 모든 격에 일반화하지 않는다. Work의 SOURCE_GAP은 후속 매핑 및 입력 검증의 대상으로 남긴다. [자리 유지](../source/primary/07-사주풀이예시.md#L866) · [귀속 사례](../source/primary/07-사주풀이예시.md#L903) · [P4-D](./p4d-outcome-semantic-source-audit-result.md)

## F. Code

작업 전후 src/lib 전체 파일 목록과 SHA-256 일치. **src/lib changes = 0**. P4-I는 작업 명세까지 완료했다.
