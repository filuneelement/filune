# FILUNE P4-C Reading Assembly Core Integration Audit

## A. 판정

`READY_FOR_READING_ASSEMBLY_CORE_COMPLETE`

현행 계약은 [13 Reading Assembly Spec](../rules/master/13-reading-assembly-spec.md), [P4-A 계약 감사](./p4a-reading-assembly-contract-audit-result.md), [P4-B 구현 결과](./p4b-reading-assembly-core-result.md), [B rev38](../source/authority/B_rev38.md), [B 적용 매핑](../rules/authority/mapping-B-rendering.md)을 기준으로 확인했다.

## B. 실제 통합 경로

| 입력 / 단계 | 확인 방식 |
|---|---|
| Canonical → Judgment | 저장소의 CS 출생 자료를 `runInternalReading`에 입력하고 Canonical Chart와 Judgment 결과를 함께 사용 |
| Natal Personality | `buildNatalPersonality`와 원국 역할 projection을 Canonical Chart와 원국 Judgment로 실행 |
| Current Personality | 실제 활성 구조 scope를 `projectCurrentPersonalityScopes`로 전달하여 월 기준 `buildCurrentPersonality` 실행 |
| Daewoon / Sewoon | 실제 Judgment scope snapshot을 CH-08과 CH-09에 연결 |
| Months | CS-005에서 `monthlyWindowStart`로 절기월 12개를 실행하여 CH-10으로 연결 |
| Day | 기준 시점의 일주를 달력에서 계산해 Judgment에 전달. 엔진 가용 범위를 기록하고 B 장의 의미 단위에서는 제외 |
| ReadingAssembly | 동일 입력으로 무료와 유료를 각각 조립하고 `validateReadingAssembly`와 원천 역추적을 실행 |

재현 명령은 `node scripts/verify-reading-assembly-integration-p4c.mjs`이다. [통합 검증 스크립트](../../../scripts/verify-reading-assembly-integration-p4c.mjs)

## C. 실제 사례

| Fixture | Judgment | Personality | Assembly / Validation |
|---|---|---|---|
| CS-005 | 실제 출생, 원국 역할 있음, No-Byeong, 대운·세운·월운·일진, 12개월 | 실제 원국과 현재 계산 | PASS · 유료 306개 / 무료 180개, 12개월, B-6, provenance |
| CS-126 | 실제 출생, ConditionalByeong | 실제 원국과 현재 계산 | PASS · 유료 331개 / 무료 203개, 역할 provenance와 조건부 확정도 |
| CS-005 출생시각 미상 | Canonical 계산 가능. Judgment는 원국 천간 4개 필요 | 실제 미상 원국 계산 | PASS · Canonical → Personality → Assembly에서 시주 단위 0. 전체 Judgment 경로는 `NOT_TESTABLE_WITH_CURRENT_PIPELINE` |
| P1 Closure | 기존 pillar fixture를 Judgment Core로 실행. 대운 효과의 세운·월운 승계와 다음 대운에서의 만료 | Judgment lifecycle 단독 검증 | 동일 이벤트 1개, 3개 projection, 만료 시 이력 참조만 유지 |
| P3 E / I / J | 기존 역할 fixture의 실제 core snapshot | 복수 역할 / No-Byeong / stopped modifier | 한 원국 요소의 복수 역할 ID 보존, 미작동 역할 제외 |
| P3 K / L | K는 기존 P3 약화 projection fixture, L은 실제 운 scope fixture | 약화 상태 / 임시 current fact | 약화의 확정 승격 0, 임시 fact의 원국 승격 0 |

## D. 12개월

CS-005의 `2026-11` 절기월부터 12개 입력을 각각 Judgment 파이프라인에서 실행했다. 기간은 `2026-11-07T09:52:33.362Z`부터 `2027-11-07T15:38:35.026Z`까지다. 전월 종료와 다음 달 시작이 같고, 달의 scope ID·간지·부모 세운·pattern context·runtime/role function ID·stage 상태·활성 effect ID를 원본과 대조했다.

| 지표 | 결과 |
|---|---:|
| 월 / 시간 순서 | 12/12 / 연속 |
| 경계 / provenance / scope 불일치 | 0 / 0 / 0 |
| Best/Worst/Top 월 자동 선정 및 점수 | 0 |

월별 단위는 해당 월의 평가 시점을 기준으로 효과를 참조한다. 월별 원천의 만료 projection 113건을 확인했고 해당 월의 활성 목록에 포함된 사례는 0건이다. 동일 이벤트의 현재 서술 단위는 원래 scope에서 한 번만 생성한다. CH-09에는 독립 세운 snapshot이 한 해만 전달되어 `sewoon-coverage` 공백을 표시한다. CH-10의 부모 세운 식별자는 그 공백을 해소하는 독립 연도 판단으로 집계하지 않는다.

## E. Semantic integrity

| 지표 | 건수 |
|---|---:|
| 중복 unit ID / 중복 결론·동일 역할 placement | 0 / 0 |
| Orphan provenance / 확인 대상 확정도 불일치 / scope 불일치 | 0 / 0 / 0 |
| 현재 만료 효과 누출 / 입력 변경 | 0 / 0 |

원천 확인은 Judgment의 fact·관계·역할·효과 이력·문서 기반 진단 원천 출력, 월별 stage와 관계 ledger, Canonical 포인터, Personality의 fact·modifier·conflict를 사용한다. upstream이 이전 범위의 참조만 제공하는 경우에는 공개 provenance ledger에서 확인했다. 입력을 동결하고 전후 구조를 비교했다. 동일 입력 재실행과 Fact/Effect/Month 배열 반전으로 unit·scope·routing·gap의 동등성을 확인했다.

## F. Free / Premium

무료 대운·세운·월운·일진 누출은 각각 0이다. 무료와 유료가 공유하는 원국 unit에서 방향·확정도·provenance 불일치는 각각 0이다. 고객 맥락의 이름, 제공 사실, 질문은 이 단계의 의미를 변경하지 않았다.

## G. B-6

F-03의 성격 결론과 CH-02의 후속 맥락은 동일 unit ID를 참조한다. 첫 배치와 후속 역할 불일치는 각각 0이다. F-04와 CH-03은 동일 강점·과제 후보를 사용하며, 선정은 보류한다. CS-005에서 이 경로를 공유한 성격 unit는 69개다. 문장 기반 dedupe는 0이다.

## H. Gap preservation

| 항목 | 상태 |
|---|---|
| 핵심 구조·강점·과제·기억할 3개 | `selection_rule_missing`, 모두 `deferred` |
| 월 순위 및 최종 양축 판단 | 선정 보류, `monthly-axes` 공백 유지 |
| CH-04 일 / CH-05 돈 / CH-06 관계 / CH-07 건강 | `outcome_layer_not_implemented`, 생성 단위 0 |
| CH-Q 개인 질문 | `question-routing` 공백, 생성 단위 0 |
| F-03 / CH-02 | 실제 Personality 조립 가능. 4면 고객 표현과 7면 계약의 공백 및 `partial` 유지 |
| 전체 발행 | `customerRenderable = false` |

## I. Architecture

Reading Assembly Core 1개, 언어별 Assembly 0개다. Judgment 재계산, Personality Renderer 호출, locale 고객 문장, LLM/API 호출은 각각 0이다.

## J. Upstream integrity

Judgment와 Personality의 전후 입력 변경은 각각 0이다. 감사 시작 시점 파일 해시와 비교해 두 디렉터리의 소스 변경도 0이다.

조립 계층 수정은 세 가지다.

1. 동일한 운 이벤트를 발생 범위와 원래 ID로 한 번만 조립하고, 현재 유효한 범위별 projection을 그 단위에 연결한다. 현재 하위 범위에서 만료된 이벤트는 현재 단위에서 제외한다.
2. CH-09에서 독립 세운이 두 해 미만이면 범위 공백을 기록한다.
3. 필수 Canonical/Personality 입력이 없으면 F-01/F-03에 입력 공백을 명시한다.

## K. Regression

| 검증 | 결과 |
|---|---|
| P2-A, B, C, D, E, F, G | 각 PASS |
| P3-A, B, C, D, E, F | 각 PASS |
| P4-B | PASS · 기존 검증 사례의 유료 unit 247개 |
| P4-C | PASS |
| Judgment | PASS · 35/35 |
| TypeScript / Build | 각각 PASS |

기존 Judgment 회귀는 레거시 검증이 참조하는 권위 문서 경로를 유지한 임시 사본에서 실행했다. Judgment 모듈은 작업 저장소와 임시 사본이 동일하다. 새 통합 검증은 작업 저장소의 현행 authority 경로를 사용했다.

## L. 남은 상태

| 상태 | 항목 |
|---|---|
| FAIL | 0 |
| PARTIAL | 출생 장, 성격의 B 구성, 구조·시기 요약, 종합 장 |
| SOURCE_GAP | B-6 맥락 및 장별 적용의 승인된 근거 |
| ENGINE_GAP | 두 해 세운의 완전한 양축 해석, 월 최종 양축 판정, 개인 질문 라우팅, 출생시각 미상의 전체 Judgment 경로 |
| OUTCOME_LAYER_NOT_IMPLEMENTED | 일·돈·관계·건강 |
| SELECTION_RULE_MISSING / DEFERRED | 핵심 구조·강점·과제·기억할 3개, 월 순위 |
| TECH_DEBT | 언어중립 Personality trait ID 부재 |
| UPSTREAM_REGRESSION | 0. 출생시각 미상은 기존 전체 Judgment 경로의 제약 |

선정층 평가에 앞서 선택의 입력으로 쓸 근거 있는 구조 요약과 OP-L03 출력 계약을 확인하는 순서가 적절하다. 선정 규칙과 분야별 의미 검증은 P4-A에서 식별한 승인 근거와 입력 범위에 따라 각각 진행할 수 있다. [P4-A 후속 작업 순서](./p4a-reading-assembly-contract-audit-result.md#j-next-implementation-order)
