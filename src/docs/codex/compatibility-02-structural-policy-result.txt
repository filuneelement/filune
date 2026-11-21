# FILUNE Compatibility-02 Structural Compatibility Policy

**최종 판정 — `COMPATIBILITY_STRUCTURAL_POLICY_READY`**

결정 1·2의 Option A를 적용했다. C2는 기존 C1 Fact 네 계열에서 증명 가능한 개별 구조 효과를 생성한다. 원본 효과를 유지한 채 각 방향의 구조 판정을 별도로 계산한다. [사용자 승인](compatibility-02-structural-policy-decision.md) · [Master 16](../rules/master/16-compatibility-spec.md)

## 근거와 판정

| 항목 | 결과 |
|---|---|
| C1 Fact evidence fields added | `CrossRoleInteractionFact.pathEvidence`를 선택 필드로 추가. 단위 근거는 기존 경로·PatternContext·정책·양끝 entity ID, 필요/유해 분류와 핵심 여부, 기존 기능 상태, 교차 작용과 경로 변화 및 출처를 담는다. 원래 교차 작용은 `sourceInteractionId`로 추적한다. |
| C1 semantic changes | 0. 네 Fact 계열, 기존 역할 후보와 링크, ID, 방향, 출처 및 원자료 fixture 기대값을 보존했다. |
| 근거 생성 | 현재 역할이 참조하는 정확한 生·剋 경로의 `ActualStructuralFunction`을 대조한다. 병은 기존에 작동하는 병 경로의 정책·행위·actor·대상을 일치시킨다. 필요 기능은 개인 Judgment가 `required_function`으로 확인한 유효한 경로를 연결한다. 이름이나 십성이 같다는 이유로 승격하지 않는다. |
| C2 확인 | 네 Fact만 받는다. 역할·경로·교차 Fact와 원본 방향을 대조한다. stop과 weaken은 분리하며, Root의 양쪽 제공자·수혜자 ID를 확인한다. 실제 활성화는 비활성 경로의 활성 근거가 함께 있는 경우에 한한다. |
| 요약 판정 | 핵심 경로 → 확인된 필요 기능 → Root → 기타 연결된 기능 순서다. 동일 Judgment·PatternContext·경로의 차단만 요약 판정에 반영한다. 독립된 동급 핵심 효과가 서로 반대 방향이면 `balanced_mixed`로 확정한다. 원본 효과 배열은 두 경우 모두 유지한다. |

[근거 생성](../../lib/compatibility/pathEvidence.ts) · [구조 효과와 방향 판정](../../lib/compatibility/structuralPolicy.ts)

## 원자료 및 계약 검증

C1의 기존 원자료 snapshot 3쌍과 기대값을 그대로 재사용했다. C00-01은 충·파만으로 구조 유불리를 부여하지 않았고, 해당 명식의 별도 확인 경로는 독립적으로 처리했다. C00-02는 기존 己 병 경로의 실제 actor·대상·정책과 정확한 교차 stop을 대조해 해당 경로의 해소를 확인했다. C00-03에서 유해 판정이 없는 庚→壬 등 `path_contact`의 원래 링크는 보존했고, 그 후보를 확정으로 올리지 않았다.

필요 기능의 生·Root 지원 및 合 stop·剋 weaken은 기존 Judgment를 실행한 합성 입력에서 확인했다. `activates_byeong`은 명시적으로 비활성→활성 증거가 있는 합성 Fact 계약에서 검증했다. 현재 C1 증거 생성기는 비활성 경로에 단순히 뿌리나 生이 제공됐다는 이유로 그 전이를 만들지 않는다. 반대 증거의 동급 공존, 각 방향의 다른 판정, 같은 경로의 차단, Evidence 누락·다른 actor·잘못된 방향 거절을 확인했다. [C2 verifier](../../../scripts/verify-compatibility-structural-policy-c2.mjs)

## 검증 계수

원자료 3쌍을 포함한 C2 타깃 검증의 모든 관측을 합산했다.

| 효과 | 수 |
|---|---:|
| Structural effects | 64 |
| A→B / B→A | 46 / 18 |
| relieves_byeong | 9 |
| weakens_byeong | 7 |
| activates_byeong | 1 |
| strengthens_harmful_path | 18 |
| supports_required_function | 6 |
| damages_required_function | 6 |
| supports_required_root | 3 |
| supports_harmful_root | 14 |

| 방향 판정 또는 불변성 | 수 |
|---|---:|
| favorable | 3 |
| favorable_dominant | 1 |
| balanced_mixed | 1 |
| minor_effect | 10 |
| unfavorable_dominant | 2 |
| unfavorable | 2 |
| deferred 판정 / 근거 대기 역할 링크 | 7 / 153 |
| mixed effect preservation / asymmetric preservation | 9 방향 / 11 실행 |
| duplicate IDs / orphan evidence / unstable IDs / mutation | 0 / 0 / 0 / 0 |

수치 점수, Fact 개수 기반 우세, 방향 평균, 입력 순서 기반 우세는 0건이다. Judgment·RootState mutation 및 Judgment·Personality·Money·Health·Relationship·Event Timing·고객 Reading 의미 변경은 0건이다. 생애·시기·고객 문장과 새 특수 관계 규칙 추가도 0건이다.

## 회귀 및 빌드

| 검증 | 결과 |
|---|---|
| Compatibility-01 | PASS. 기존 출처 fixture와 기대값 수정 0. verifier에 C2 재사용용 출력 참조만 추가. |
| Compatibility-02 | PASS. 효과 8종, 확정 판정 6종 및 deferred 확인. |
| Judgment | PASS 35/35. P0/P1 role/runtime·Byeong, 지지 관계, Root·투간 및 월간 창 포함. 종전 문서 경로 별칭은 임시 사본에서 사용했다. |
| Money / Health / Relationship | PASS · P4-J / P4-H 및 P4-K.2A / P4-F |
| Personality | PASS · P2-G |
| Event Timing Batch 1 | PASS · P4-M.2, P4-M.3B 및 M.5, P4-N.1 |
| TypeScript / Build | PASS · `npx tsc -b`, `npm run build`. 기존 Vite Reading 청크 크기 경고 표시. |
| Diff | PASS · `git diff --check` 및 신규 파일 공백 검사 |
