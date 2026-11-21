# FILUNE Compatibility-02 구조 정책 승인 계약

C2 승인 계약. 사용자 결정 1·2의 Option A를 각각 적용한다.

## 입력과 책임

- Compatibility-01의 `CrossStemInteractionFact`, `CrossBranchInteractionFact`, `CrossRootSupportFact`, `CrossRoleInteractionFact`를 읽는다. 개인 Judgment, RoleHistory, Runtime과 RootState를 변경하지 않는다.
- 결과는 A→B와 B→A로 분리한다. 같은 방향의 도움과 손상은 각각 원본 교차 Fact, 영향을 받은 기능 및 관계의 출처를 유지한다.
- 기존 삼합·반합·방합·육합·충·형·파·해의 판정은 Master 03을 따른다. 관계 자체는 유불리의 근거가 되지 않는다.

## 구조 효과

| 효과 | 승인된 근거 |
|---|---|
| `relieves_byeong` | 특정 병 경로의 실제 차단을 확인한 경우. `targetByeongId`와 `crossFactId`가 필요하다. |
| `weakens_byeong` | 기존 병의 해당 기능에 근거가 연결되고, 교차 극이 그 기능을 약화시킨 경우. |
| `activates_byeong` / `strengthens_harmful_path` | 상대의 生 또는 Root 제공이 대상의 유해 기능·경로에 연결되고 해당 작용을 확인할 수 있는 경우. |
| `supports_required_function` | 生·뿌리 지원·보호 작용이 확인된 필요 기능을 지원하는 경우. |
| `damages_required_function` | 확인된 필요 기능이 교차 극으로 약화되거나 유효한 교차합으로 정지된 경우. |
| `supports_required_root` / `supports_harmful_root` | `CrossRootSupportFact`의 수혜 대상이 각각 필요 기능 또는 유해 기능·병 경로로 확인된 경우. |

C-02에 따라 유효한 교차합은 Compatibility Runtime에서 양쪽을 정지시키고 극은 대상을 약화시킨다. 교차 Root는 C-03에 따라 별도 Fact로 기록한다. Master 04의 통근 근거와 Master 05·06의 실제 기능을 함께 확인한다. 병 또는 역할의 이름, 후보 표시, Root의 존재 자체만으로 효과를 확정하지 않는다.

## 경로 단위 evidence contract

- C1의 네 Fact 계열과 기존 관측의 ID·방향·의미를 보존한다. `CrossRoleInteractionFact.pathEvidence`에 기존 역할 및 실제 개인 경로의 ID, PatternContext, 양쪽 entity ID, 선택된 정책, 현재 기능, 근거가 확인된 필요·유해 분류와 핵심 여부, 교차 작용 및 해당 경로의 변화, 출처 ID를 추가할 수 있다. 이 역할 Fact는 원래 천간/Root Fact를 `sourceInteractionId`로 참조한다. 입력은 여전히 네 C1 Fact 계열이다.
- 현행 자동 증거 연결은 현재 역할 참조의 정확한 生·剋 경로와 `ActualStructuralFunction`을 대조한다. 병은 기존의 실제 병 경로와 동일 정책·행위·actor·대상을 대조한다. 필요 기능은 Judgment가 `required_function`으로 판정한 실제 유효한 기능을 연결한다. 역할 명칭과 글자 값의 일치만으로 근거를 만들지 않는다.
- 교차합에 의한 정지는 동일 actor가 수행하는 현재 유효한 경로를 차단할 수 있다. 극으로 인한 약화는 해당 작동 경로의 약화로 기록한다. 이미 약화된 경로에 새 약화를 확정할 별도 근거가 없으면 승격하지 않는다. 단순 접촉과 합·극 Fact의 존재는 경로 차단 근거를 대신하지 않는다.
- 실제 生·Root 기여는 확인된 경로에 연결한다. 이미 작동 중인 유해 경로의 지원과, 비활성 경로가 실제로 활성화된 경우를 구분한다. 후자는 비활성 상태와 활성화의 경로 증거가 모두 있어야 한다. 현재 연결에서 비활성 후보에 Root나 生만 닿으면 활성화 근거를 자동 생성하지 않는다.
- C2는 역할 Fact, 근거 대상과 출처, 원래 교차 Fact의 일치를 검증한다. 정지·약화는 같은 방향의 Compatibility Runtime 효과도 요구한다. C1의 미확인 `relief_candidate`, `support_candidate`, `path_contact`는 경로 수준 근거가 추가로 확인될 때만 확정 효과가 된다. 개인 상태에는 쓰지 않는다.

## 방향 판정

구조 근거의 우선순위는 핵심 병의 해소·활성화 → 확인된 필요 기능의 지원·손상 → 필요·유해 Root 작용 → 기타 연결된 기능 → 관계 관측이다. Fact 개수, 숫자 점수, 양방향 평균은 사용하지 않는다.

- `favorable`은 핵심 병의 실제 해소 또는 핵심 필요 기능의 확인된 보호에 동급 이상의 유해 활성화가 없는 경우다.
- `favorable_dominant`는 도움과 손상이 공존하며 핵심 구조 해결이 우세한 경우다.
- `unfavorable`은 핵심 유해 경로가 활성화되거나 핵심 필요 기능이 손상되며 이를 상쇄할 구조적 완화가 없는 경우다.
- `unfavorable_dominant`는 도움도 있으나 핵심 손상이 우세한 경우다.
- `minor_effect`는 관계가 관측되지만 핵심 구조에 실제 영향이 없는 경우다.
- 근거가 부족한 개별 효과는 유보할 수 있다. 유불리 공존 자체는 유보 조건이 아니다.

- `balanced_mixed`는 같은 방향에서 유리한 핵심 효과와 불리한 핵심 효과가 같은 우선순위로 확인되고 실제 제거 또는 구조적 우세의 근거가 없는 경우의 확정 판정이다. 서로 독립적으로 확인된 핵심 병 해소와 핵심 필요 기능 정지도 이 조건을 충족할 수 있다.
- 요약 판정에서는 같은 Judgment·PatternContext·경로 ID의 실제 차단이 입증된 경우에만 해당 경로의 경쟁 지원을 우세 비교에서 제외한다. 다른 경로에는 이 처리를 적용하지 않는다. 지원·손상 효과 배열은 그대로 유지한다.
- 필요한 근거가 부족한 효과의 유보와 `balanced_mixed`는 별개다. 방향별 출력을 합산하거나 동급에서 개수·배열 순서로 우세를 선택하지 않는다.

[사용자 승인 결정](../../codex/compatibility-02-structural-policy-decision.md) · [Master 03](03-branch-relations-master.md) · [Master 04](04-root-twelve-stages-master.md) · [Master 05](05-sangshen-byeong-gueung-master.md) · [Master 06](06-pattern-effect-policy.md) · [Master 09](09-engine-integration-spec.md) · [Compatibility-01 결과](../../codex/compatibility-01-cross-chart-fact-engine-result.md)

## C3 인성·식상 표현 상호작용

- Master 11의 각 사람별 인성 우세와 표현 억제가 모두 확정되면 원국에 `mutual_expression_restraint`와 `communication_friction`을 확정한다. 한쪽에서만 확인되고 다른 쪽에 이 억제 경로가 적용되지 않음이 확인되면 해당 방향의 `expression_withholding`을 기록한다. 다른 쪽 근거가 미확정이면 상호 결과를 확정하지 않는다.
- 원국 상호작용을 보존한 채 같은 평가 시점의 개인별 현재 발현을 읽는다. 양쪽 표현 억제가 모두 완화되면 `communication_relief`를 확정한다. 한쪽만 완화되고 상대의 억제가 유지되면 부분 완화를 보존한다. 확인된 마찰 강화는 해당 방향에 기록하고, 상대의 완화가 공존하면 현재 혼합 상태와 양쪽 근거를 유지한다.
- 각 효과의 참가자와 방향, 개인 표현 ID, 범위 및 범위 ID, Personality와 Judgment의 출처를 보존한다. C2 방향별 구조 결과는 별도로 유지한다. 이 계약에서 관계 시기나 날짜를 산출하지 않는다.

[Master 11](11-personality-master.md) · [Compatibility-03 사용자 승인](../../codex/compatibility-03-personality-interaction-decision.md)
