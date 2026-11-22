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

- 두 사람의 Master 11 `ResourceDominanceFact`가 각각 `confirmed`이면 각자의 식상 기능 억제와 표현 억제를 확정하고 원국에 `mutual_expression_restraint`와 `communication_friction`을 확정한다. 한쪽에서만 확인되고 다른 쪽에 이 억제 경로가 적용되지 않음이 확인되면 해당 방향의 `expression_withholding`을 기록한다. 다른 쪽 근거가 미확정이면 상호 결과를 확정하지 않는다.
- 원국 상호작용을 보존한 채 같은 평가 시점의 개인별 현재 발현을 읽는다. 양쪽 표현 억제가 모두 완화되면 `communication_relief`를 확정한다. 한쪽만 완화되고 상대의 억제가 유지되면 부분 완화를 보존한다. 확인된 마찰 강화는 해당 방향에 기록하고, 상대의 완화가 공존하면 현재 혼합 상태와 양쪽 근거를 유지한다.
- 각 효과의 참가자와 방향, 개인 표현 ID, 범위 및 범위 ID, Personality와 Judgment의 출처를 보존한다. C2 방향별 구조 결과는 별도로 유지한다. 이 계약에서 관계 시기나 날짜를 산출하지 않는다.

[Master 11](11-personality-master.md) · [Compatibility-03 사용자 승인](../../codex/compatibility-03-personality-interaction-decision.md)

## C4 관계 형성과 생애 시기

- 각 사람의 Judgment, Relationship Outcome 및 C3 범위를 독립 평가한다. 상대의 원국과 운을 개인 Judgment에 넣지 않는다. C2의 양방향 구조 결과는 Pair baseline으로 보존한다.
- 배우자궁의 실제 육합·반합국·삼합국 및 원자료가 인정한 작동 조건을 충족한 배우자성·식신·일간합은 관계 형성 및 결혼 기회의 근거가 된다. 배우자궁 충은 관계 변화 근거다. 일간합은 시기 근거로만 사용한다.
- 기회는 같은 범위의 관계 구조가 확인하는 유리함과 주의 판정에서 독립한다. 같은 범위의 확인된 관계 손상과 C3 표현 억제 강화는 관계 부담의 근거다. C3 표현 회복과 소통 완화는 회복으로 보존한다. 구조 부담과 소통 완화는 공존할 수 있다.
- 파탄 위험은 서로 독립적인 두 경로 중 하나가 확정되면 발행한다. 두 경로가 성립하는 범위에서는 각각의 경로 ID와 출처를 함께 보존한다.
  - **BREAKDOWN-A — Baseline Vulnerability Aggravation.** 원국 취약성과 동일 관계 경로의 현재 실제 손상이 함께 확인된다. 장기와 단기가 같은 경로에서 연속 확인되면 높은 위험을 표시한다.
  - **BREAKDOWN-B — Spouse Event + Palace Disruption.** 작동 중인 원국 배우자 축, 현재 실제 작동하는 배우자성 actor, 현행 Branch Master의 원국 일지 충이 같은 평가 범위에서 확인된다. 역할 이력은 원국에 보존한다. 정지 actor는 제외하고, 상위 범위 actor는 기존 Judgment가 실제 작용의 승계를 확인한 경우에만 읽는다.
- 관계 변화, 배우자성 단순 출현, 경제 부담 각각은 관계 파탄 위험의 독립 근거가 아니다. 관계 상태와 실제 사건 발생 여부는 별도 근거가 필요하다.
- 각 개인의 기회는 보존한다. 양쪽 기회가 겹치는 실제 Gregorian 구간은 상호 기회로, 겹치지 않는 부분은 해당 개인의 구간으로 기록한다. 확인된 달력 범위와 C2·C3·Judgment 근거를 유지한다.

[Event Timing Master 15](15-event-timing-spec.md) · [원자료 결혼 시기](../../source/primary/07-사주풀이예시.md#L202)

## C5 최종 궁합 조립

- `readBirthCompatibility`는 각 출생 입력의 독립 Judgment를 C1–C4에 전달한다. 최종 Assembly는 C1 근거, C2 양쪽 방향별 판정, C3 원국과 현재, C4 개인과 상호 시기를 그대로 보존한다.
- Pair ID는 C1에서 사용하는 canonical 인물 ID 순서를 따른다. 입력 순서는 별도로 보존하며, A→B와 B→A 조회에 사용한다.
- 강점·위험과 세 축의 요약은 원본 Fact ID로 추적되는 인덱스다. 기존 효과의 우선순위, 확정도, 함께 존재하는 상반 작용과 부분 유보를 보존한다.
- 현재·미래·과거 구간은 C4와 기존 Event Timing에 투영된 범위의 인덱스다. 이름만 알려진 범위의 Decision, 결혼 기회·유리함·주의, 두 파탄 경로의 ID를 보존한다.
- 명시된 관계 상태는 별도의 사용자 문맥으로 보존한다. 최종 조립은 내부 계약이다.

[Reading Assembly Master 13](13-reading-assembly-spec.md) · [Event Timing Master 15](15-event-timing-spec.md)

## C6-A 고객 결과와 한국어 표현

- 고객 결과는 C5에서 확정된 의미와 출처를 읽어 생활 언어로 전달한다. 방향별 영향, 원국 대화와 현재 표현, 결혼 기회와 유불리, 파탄 위험과 해당 경로를 독립적으로 표현한다.
- 근거가 있는 섹션을 발행한다. 같은 사람에게 같은 의미가 여러 기간에 나타나면 한 문장에 해당 기간들을 연결할 수 있다. 시기별 인덱스는 문장과 각 기간을 참조한다.
- 달력 표시는 기존 투영 구간을 사용한다. 달력 기간을 확인할 수 없는 확정 Decision은 시점 미확인으로 표시한다. 관계 상태는 명시된 사용자 문맥에서만 읽는다.
- 문장은 내부 명리 명칭과 수치 궁합점수를 노출하지 않는다. 파탄 위험은 높은 위험을 분명히 전달하고, 실제 사건의 발생은 별개로 둔다.
