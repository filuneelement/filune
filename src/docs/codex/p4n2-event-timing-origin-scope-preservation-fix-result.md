# FILUNE P4-N.2 Event Timing Origin Scope Preservation Fix

**최종 판정 — `READY_TO_RERUN_P4N`**

## 재현과 수정

P4-N 재감사의 기존 `projection-origin-natal` 계약 투영 fixture를 그대로 사용했다. 실제 관측값은 `natal` 덮어쓰기가 아니라 `eventTimingUnits` 변환에서의 필드 누락이었다. 첫 실패 assertion에서 원본 `originScope = natal`은 `undefined`로, `scopeGanZhi = 丙午`와 `parentScopeGanZhi = 庚戌`도 각각 `undefined`로 나타났다. Fact ID, 평가 scope `sewoon`, scope ID는 유지됐다. Decision ID는 기존 Unit의 출처 목록에서 누락됐다.

| 단계 | Fact ID · scope identity | origin 및 provenance |
|---|---|---|
| A. Event Timing Projection 출력 | 기존 `event-timing:` ID와 연간 Judgment scope ID · `sewoon / 丙午 / 庚戌` | `natal`, 기존 Decision·Judgment·Relation·Evidence·Role ID와 provenance |
| B. 제품 오케스트레이션 | `readBirthChart`는 엔진의 `facts` 배열 참조를 그대로 전달한다. 기존 제품 fixture 3건에서 참조 동일성 확인 | 제품 fixture에서 투영 Fact 0건. 양성 Fact의 변환 검증은 기존 계약 투영 fixture로 실행 |
| D. Assembly 입력 | 기존 투영 Fact의 같은 배열과 같은 ID · `sewoon / 丙午 / 庚戌` | `natal`, 모든 출처 ID 유지 |
| C. `eventTimingUnits` 변환 | 같은 Fact ID와 scope ID, GanZhi 두 값 직접 전달 | `natal` 직접 전달. Decision과 PatternContext ID를 기존 `sourceFactIds` 목록에 포함 |
| E. 최종 Reading Unit | 같은 Fact ID 및 scope ID를 `meaningRef`에서 참조. 평가는 `sewoon`, 배치는 CH-09 | `natal`. 기존 출처 목록 정렬·중복 제거 규약을 사용하며 Role·Effect ID와 provenance의 원본 집합을 유지 |

기존 `contract_favorable` 분기 입력을 같은 연간 투영 경로로 재사용해 `sewoon` origin도 유지함을 확인했다. 무료 조립에서는 투영된 양성 Fact가 공개되지 않았다. Health P4-K.2A와 동일하게 평가 scope와 출처 scope를 별개로 유지하며, 이번 수정은 투영된 값을 그대로 조립한다.

## 수정 범위

| 항목 | 변경 |
|---|---|
| Reading mapping | `src/lib/reading/eventTimingUnits.ts`, `src/lib/reading/types.ts` |
| Targeted verifier | `scripts/verify-event-timing-decision-projection-p4m3b.mjs`에 기존 투영 Fact의 조립 검증 추가 |
| Semantic code changes | 0 · Event Evidence·Decision, Judgment, Money, Health, Relationship, Personality 판정 변경 0 |
| Wiring / Projection changes | 0 · 제품 호출부, 달력 구간, Master 규칙 변경 0 |
| Fixture 기대값 변경 | 0 |

[Reading 변환](../../lib/reading/eventTimingUnits.ts) · [기존 fixture 재사용 검증](../../../scripts/verify-event-timing-decision-projection-p4m3b.mjs)

## 검증

| 측정 | 결과 |
|---|---|
| 제품 fixture | 3건 · 계약 context 2, 사업 시작 context 1 |
| EventTimingFacts delivered | 제품 0건, 계약 전용 검증 2건 |
| ID / originScope / provenance / scope identity mismatch | 0 / 0 / 0 / 0. 양성 metadata 비교는 계약 전용 투영에서 수행했다. |
| False positive / mutation / free timing leakage | 0 / 0 / 0 |
| P4-N.1 제품 연결 | PASS · 4회 호출 및 같은 Fact 배열 전달 |
| P4-M.3B 및 P4-M.5 | PASS · 기존 투영 Fact 재현, 원자료 Decision 3건 모두 `not_projectable` |
| P4-M.2 | PASS |
| Reading Assembly P4-B / P4-C | PASS |
| Health origin P4-K.2A | PASS · origin·ID·provenance mismatch 0 |
| Relationship scope/provenance P4-F | PASS |
| TypeScript / Build | PASS · 기존 Vite Reading 청크 크기 경고 유지 |
| `git diff --check` | PASS |
