# FILUNE P4-N.1 Production Event Timing Wiring Fix

**최종 판정 — `READY_TO_RERUN_P4N`**

## 제품 연결

| 항목 | 연결 |
|---|---|
| 실제 제품 진입점 | `App.calculateAndShowResult` → `prepareProductResult` → 공개 `readBirthChart` |
| Event context API | 선택적 `eventContext?: EventDomain`. UI는 진행 중인 계약, 사업 시작 준비, 운영 중인 사업 확장을 명시적으로 선택할 수 있다. |
| Event Timing owner | `readBirthChart`가 Canonical/Judgment와 기존 Money·Health·Relationship Outcome을 계산한 뒤, 명시적 context가 있으면 `buildEventTiming`을 한 번 호출한다. |
| Assembly handoff | 기존 Projection이 반환한 같은 `facts` 배열을 `assembleReading({ eventTimingFacts })`에 건넨다. 기존 `eventTimingUnits`와 유료 장 접근 조건을 사용한다. |
| Context 없음 | 기존 화면은 같은 팔자 계산 결과를 사용한다. 공개 Reading API를 context 없이 호출하면 Event Timing 없이 Assembly를 실행한다. |
| Calendar | 기존 Canonical/Judgment 절기월과 기간을 사용한다. 1월 첫 절입 전에는 직전 연도의 12번째 절기월을 선택한다. |

[제품 호출부](../../App.tsx) · [공개 Reading API](../../lib/product/readBirthChart.ts) · [제품 결과 준비](../../lib/product/prepareProductResult.ts)

## Production Integration Fixture

기존 `CS-127` BirthInput을 사용했다. 검증기는 제품 UI가 호출하는 `prepareProductResult`를 실행하고 실제 엔진 호출과 Assembly 전달을 관찰했다. 기존 Event Timing 엔진과 Assembly의 반환값을 그대로 사용했다.

| 측정 | 이전 | 이번 |
|---|---:|---:|
| 명시적 context 제품 진입점 fixture | 0 | 3 |
| 계약 context | 0 | 2 |
| 사업 시작 context | 0 | 1 |

한 차례 동일 입력을 반복해 전체 Event Timing 결과와 Assembly의 동일성을 비교했다. 1월 절입 경계 fixture를 포함했다. CS-127의 기준일 계약·사업 시작 fixture에서 TimingFact는 각각 0건이다.

[제품 연결 검증기](../../../scripts/verify-event-timing-production-wiring-p4n1.mjs)

## Semantic isolation

Judgment, Event Evidence Mapping, Event Decision 정책, Calendar Projection, Money, Health, Relationship, Personality, Master 15 및 기존 fixture 기대값 변경은 각각 0건이다. 신규 고객 문구는 명시적 사건 context 선택 항목에 한정한다. 현재 결과 화면은 기존 팔자 렌더러를 사용하며 무료 Reading Assembly 객체만 제품 결과 상태에 보관한다.

사용자가 사건 context를 선택한 경우에만 Reading 엔진과 기존 권위 문서가 담긴 모듈을 지연 로드한다. Vite 빌드는 이 청크에 대해 기본 크기 경고를 표시한다.

## Targeted verifier 결과

| 확인 항목 | 결과 |
|---|---|
| 계약·사업 context 수락 | PASS · 엔진에 각 context에 해당하는 기존 키 전달 |
| Event Timing 실행 / Assembly 전달 | 4 / 4 · 반복 실행 포함. 각 호출의 Fact 배열 참조 일치 |
| Context 없는 앱 경로 | 기존 알려진 시각·미상 시각 팔자 결과와 동일 |
| Context 없는 공개 Reading 경로 | Event Timing 호출 0. 기존 Assembly 결과와 동일 |
| Invalid context | 런타임에서 거절 |
| False positive / mutation / 무료 상세 노출 | 0 / 0 / 0 |
| Stable identity | 동일 BirthInput, context 및 기준 시각에서 결과 동일 |
| 달력 | 12절기월 및 1월 첫 절입 전 기간 확인 |

## 기존 회귀

| 검증 | 결과 |
|---|---|
| P4-M.2 | PASS · BirthInput 파이프라인 4건, Evidence 9건, TimingFact 0건. 안정성·구조·누출·mutation 카운터 0 |
| P4-M.3B | PASS · Decision/Projection 분리, 계약·사업 분기 및 달력 없는 confirmed Decision |
| P4-M.5 | PASS · 별도 스크립트 없이 기존 P4-M.3B가 실행하는 원자료 검증 2건. Decision 3건, 모두 `not_projectable` |
| Judgment | PASS · 35/35. 종전 문서 경로를 참조하는 검증기용 별칭은 임시 작업 사본에만 추가했다. 초기 배치에서 누락됐던 readiness 문서 별칭을 추가한 뒤 runtime-context 재실행 41건을 통과했다. |
| Money / Health / Relationship | PASS · P4-J / P4-H / P4-F |
| Reading Assembly | PASS · P4-B / P4-C |
| TypeScript / Build | PASS · `npx tsc -b` / `npm run build` |
| Diff | PASS · `git diff --check` |

Batch 1의 완료 여부는 기존 P4-N 재감사 판정 범위다.
