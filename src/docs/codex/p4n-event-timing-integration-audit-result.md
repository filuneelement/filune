# FILUNE P4-N Event Timing Integration Audit

**최종 판정 — `EVENT_TIMING_BATCH1_COMPLETE`**

| 레인 | 판정 | 확인 범위 |
|---|---|---|
| A. Source Semantic Regression | PASS | 기존 P4-M.5 원자료 2건. 계약 부정 축 유지, 3개 Decision 모두 `not_projectable`. |
| B. Contract Branch Coverage | PASS | 기존 계약·사업 Decision 분기 7건과 투영 fixture 1건. 기존 계약 양성 분기를 추가 투영 검증에 재사용했다. |
| C. Production Calendar Integration | PASS | 실제 `/result` 제품 경로 fixture 3건. 계약 전용 투영에서 이전 Assembly origin 차단 요인 재현 후 수정 확인. |

## 레인별 계수

| 유형 | 기존 사례 | EventEvidenceFacts | EventTimingDecisions | EventTimingFacts |
|---|---:|---:|---:|---:|
| SOURCE_BACKED | 2 | 5 생성 | 3 | 0 |
| CONTRACT_TEST_ONLY | 분기 7 + 원래 투영 1 | 10 입력 | 8 | 2 투영 · 기존 양성 분기 재사용 포함 |
| PRODUCTION_WIRING | 계약 2 + 사업 시작 1 | 0 | 0 | 0 |

### A. 원자료 회귀

- `SRC-07-1131-contract-negative` — Evidence 2, `contract_delay` 1, `contract_favorable` 0. 원자료의 Money favorable과 계약 불리 의미를 각각 유지했다. 이 snapshot에서 기간별 Money Outcome 확인은 불가능했다.
- `SRC-07-1960-real-estate-contract-negative` — Evidence 3, `contract_delay` 2. 기존 Judgment 경로와 Adapter 연결을 재현했다.
- 기존 원자료의 계약 의미 불일치·Money에서 계약 양성으로의 전환·가짜 Gregorian 입력·미지원 결과는 관측 0건이다. 별도 계약 검증의 `confirmed / not_projectable`도 통과했다.

### B. 계약 분기

| 분기 | 유형 |
|---|---|
| `contract_favorable` | CONTRACT_TEST_ONLY |
| `contract_delay`, obstruction, support-function stopped | SOURCE_BACKED · CONTRACT_TEST_ONLY |
| `business_start_favorable`, `business_start_delay` | CONTRACT_TEST_ONLY |
| `business_expansion_favorable` | CONTRACT_TEST_ONLY |
| `business_adjustment` | CONTRACT_TEST_ONLY |
| `business_restructure` | CONTRACT_TEST_ONLY |

사전 구성된 Evidence는 분기 검증에 입력했다. 지연에서 실패로 자동 전환하는 경로는 0건이다. 원자료 snapshot과 분기 입력 및 기대값은 동일하다.

### C. 제품 연결

실제 `/result` 호출부 → `prepareProductResult` → `readBirthChart` → 기존 Event Timing → `assembleReading` 경로를 확인했다. 기존 verifier가 제품 함수에서 계약 2건, 사업 시작 1건을 실행했다. 동일 입력 반복을 포함한 엔진 호출과 같은 Fact 배열 전달은 각각 4회였다. Context가 없는 경로는 기존 팔자 결과와 같았고, 지원하지 않는 context는 거절됐다. Canonical·Judgment·달력 실패는 0건이었다. 1월 첫 절입까지 직전 연도의 12번째 절기월을 사용한다. [제품 경로 검증기](../../../scripts/verify-event-timing-production-wiring-p4n1.mjs)

이전 차단 요인은 기존 `projection-origin-natal` 양성 계약 fixture로 재검증했다. 조립 전후 같은 Fact ID와 scope ID에 평가 scope `sewoon`, `scopeGanZhi = 丙午`, `parentScopeGanZhi = 庚戌`, `originScope = natal` 및 같은 출처 집합이 유지됐다. 기존 양성 분기를 재사용한 대조에서도 `originScope = sewoon`이 유지됐다. 이 두 투영은 계약 전용 검증이며 실제 제품의 양성 사건으로 집계하지 않았다. [P4-N.2 수정 결과](p4n2-event-timing-origin-scope-preservation-fix-result.md)

## Projection 및 불변성

| 측정 | 결과 |
|---|---|
| Projected / not_projectable | 계약 전용 2 / 원자료 3. 제품 Decision 0. |
| 무효 interval / 잘못된 scope로 투영된 건 / origin mismatch | 0 / 0 / 0. 의도적으로 다른 scope에서 요청한 투영은 거절됐다. |
| Duplicate IDs / unstable IDs / orphan provenance | 확인 범위에서 0 / 0 / 0. 반복 입력, Evidence 역순과 upstream 배열 역순 검증 통과. |
| Expired leakage | 0. 기존 투영 fixture를 정확한 기간 종료점에서 재조회했다. Fact ID가 동일한 expired Fact는 현재 Reading에 포함되지 않았다. |
| False positives / input mutation / free detailed timing leakage | 0 / 0 / 0. 무료 조립에 계약 전용 양성 Fact를 직접 전달한 검증도 통과했다. |
| Confirmed 결과 억제 / 관측된 mixed collapse / 미지원 결과 | 기존 fixture의 검증 범위에서 0 / 0 / 0. 동시 보존 대상 중 현재 fixture로 검증할 수 없는 조합은 아래에 기록했다. |
| Generic good/bad 전환 / 단일 십성 shortcut / numeric scoring / 고객 출력 신규 전문용어 | 확인 범위에서 각각 0. |

## Gaps

| 종류 | 내용 |
|---|---|
| SOURCE_OR_POLICY_GAP | 법적 분쟁·소송·당사자 행위 예측과 독립 증거 조건 없는 계약 종료. 구현 0. |
| ENGINE_GAP | 기존 Day finalization gap. 연간·월간 Decision에 영향을 주지 않는다. |
| FIXTURE_GAP | 양성 원자료 snapshot 및 실제 제품의 양성 TimingFact 미확보. 제품 연결 합격 조건은 기존 context와 호출·전달·무오탐을 검증하는 것이다. |
| NOT_TESTABLE | Case 1의 기간별 Money favorable, 계약 favorable+delay 및 사업 확장+Money difficulty 동시 보존, 실제 제품 양성 Fact의 만료와 장 간 재사용. |

## 회귀

| 항목 | 결과 |
|---|---|
| Judgment | PASS · 35/35, P0/P1 포함. 종전 문서 경로의 별칭은 기존 임시 작업 사본에서 사용했다. 계약 계층 명령은 npm을 통해 다시 실행해 118개 검사와 종료 코드 0을 확인했다. |
| Money / Health / Relationship | PASS · P4-J / P4-H 및 P4-K.2A / P4-F |
| Personality / Renderer | PASS · P2-A~G 7/7 / P3-A~F 6/6 |
| Reading Assembly | PASS · P4-B / P4-C |
| Event Timing | PASS · P4-M.2, P4-M.3B 및 기존 P4-M.5 원자료 2건, P4-N.1 제품 경로 |
| TypeScript / Build | PASS · `npx tsc -b`, `npm run build`. 지연 로드 Reading 청크 크기 경고 유지. |
| Diff | `git diff --check` PASS. 재감사에서 애플리케이션 의미·Master·fixture 기대값 변경 0건. |

P4-L~P4-N Event Timing Batch 1을 종료한다.
