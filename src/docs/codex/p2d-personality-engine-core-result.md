# FILUNE P2-D 원국 Personality Engine 결과

## A. 전체 판정

**READY_FOR_PERSONALITY_ROLE_MODIFIER**

공개 함수 `buildNatalPersonality(chart)`는 계산 완료된 `CanonicalChart`를 받아 원국 결과를 생성한다. 입력은 기존 Canonical의 `CalculatedChart.chart`이며, 결과의 Occurrence 출처 경로는 해당 원본 envelope의 JSON 포인터다. 원국 만세력·십성·지장간을 다시 계산하지 않는다.

## B. 구현

| 영역 | 파일/함수 | 상태 |
|---|---|---|
| PersonalityFact·출처 | [personalityFacts.ts](../../lib/personality/facts/personalityFacts.ts), [types.ts](../../lib/personality/types.ts) | 일간과 십성·일주의 등록 항목을 Fact로 구성한다. 지식 필드 ID와 원자료 참조를 보존한다. |
| 원국 십성 출현 | [natalTenGodOccurrences.ts](../../lib/personality/facts/natalTenGodOccurrences.ts) | 천간 세 위치와 네 지지의 기존 십성·지장간 본기·중기·여기 표기를 사용한다. 일간은 별도 base다. |
| Prominence 근거·해결 | [tenGodProminence.ts](../../lib/personality/prominence/tenGodProminence.ts) | 천간 투출·월지·지지 기반·위치 간 반복 근거를 수집한다. 등급은 보류한다. |
| 위치 발현 | [positionExpression.ts](../../lib/personality/position/positionExpression.ts), [natalPersonality.ts](../../lib/personality/natalPersonality.ts) | 천간은 outward, 월지는 innate, 일지는 decision, 시지는 private, 년지는 supporting_context로 연결한다. 해당 위치 규칙의 출처와 Fact ID를 함께 반환한다. |
| DayPillarModifier | [natalPersonality.ts](../../lib/personality/natalPersonality.ts) | 일간과 십성에 일주의 성향 Fact를 추가하고 Canonical 일지 십성과 대조한다. branchNature와 제외 claim은 성향 Fact에 사용하지 않는다. |
| PersonalityConflict | [personalityConflicts.ts](../../lib/personality/conflicts/personalityConflicts.ts) | 일주의 근거 있는 상반성은 coexist로 보존한다. 천간 傷官의 표현과 지지 印의 검토라는 마스터 사례는 양쪽 맥락 후보를 연결한다. |
| NatalPersonalityResult | [index.ts](../../lib/personality/index.ts), [natalPersonality.ts](../../lib/personality/natalPersonality.ts) | Fact·십성 상태·위치 발현·보정·충돌·구조화 요약과 출처를 반환한다. |

확인된 십성에서 핵심축과 일반 발현을 기본 Fact로 저장한다. 년지 Fact는 보조 맥락으로만 남긴다. 강점·생산적 후보와 위치에 적합한 표현 방식은 contextual로 기록한다. 등록된 위치와 의미가 같을 때 동일 문자열 및 같은 Fact 유형을 기준으로 병합하며, 위치가 다르면 각각 보존한다. 과다·부재 발현과 발현 조건이 해결되지 않은 Variant는 원국 코어에서 활성화하지 않는다.

출생시각 미상·미지원 및 절기 경계 등의 미확정 위치는 `unavailablePositions`로 구분한다. 그런 위치가 있을 때 관측된 위치에서 발견한 십성은 `present`이며, 발견하지 못한 십성은 `undetermined`다. 모든 위치가 확인된 경우에만 미출현을 `absent`로 기록한다. Canonical이 제공하는 확정 일주가 필수이며, 잘못된 일주 식별자와 확정 일지 십성의 충돌은 입력 오류로 처리한다.

## C. Prominence 계약

| 항목 | 결과 |
|---|---|
| 마스터·스키마에 결정적 등급 기준 존재 여부 | 없음. 마스터 §7과 스키마 §§35–38은 정성 근거와 개수 사용 금지를 정한다. |
| 구현한 confirmed 조건 | 등급 확정 조건 없음. 확인된 위치의 실제 출현만 presence로 확정한다. |
| deferred 조건 | 모든 십성의 등급을 no_grade_criteria로 보류한다. 관측 근거는 출현 ID로 추적할 수 있다. |
| 수치 점수 사용 | 0. 반복은 서로 다른 위치에 나타났다는 근거다. 위치와 ID의 정렬은 안정적인 결과 형식을 위한 것이다. |

Canonical에서 확인한 지장간은 지지 기반 근거이며, 구조 엔진의 통근 판정과 구별한다. Formation·RuntimeState·실제 구조 기능은 이번 입력에서 사용하지 않는다. 마스터 §29의 천간 傷官과 지지 印 대조는 contextual 후보를 context_split으로 묶으며, 상대 강도를 확정하지 않는다. [마스터](../rules/master/11-personality-master.md#L410-L422) · [스키마](../rules/master/12-personality-knowledge-schema.md#L857-L927)

## D. Regression

| 검증 | 결과 |
|---|---|
| P2-A Knowledge | PASS |
| P2-B Knowledge | PASS |
| P2-C Knowledge 통합 | PASS |
| [P2-D 원국 코어](../../../scripts/verify-personality-engine-p2d.mjs) | PASS |
| npx tsc -b | PASS |
| npm run build | PASS |

P2-D에서 천간 외부 발현, 월지 본성, 겉·속 맥락 공존, 일주 보정, 십성 반복, 시각 미상, source_gap, 戊午와 60개 일주 전체를 검사했다. 실제 Canonical 입력과 기존 함수로 만든 고립 fixture를 사용했다. 결정적 출력과 출처 ID 연결, 레지스트리 배열 재배열, 미확정 월지·시주 제외, 과다·부재 자동 활성화 금지도 확인했다.

戊午는 Canonical 印綬를 Personality 正印으로 사용한다. 偏財가 실제로 존재하지 않는 고립 fixture에서 偏財 성향은 0건이다. 원자료 충돌 기록은 P2-B 검증에서 기존 1건으로 확인했다.

## E. 구조 격리

- Judgment 소스 변경 0건, 공용 Canonical 타입과 함수 변경 0건.
- Judgment → Personality 의존성 0건, Personality → Judgment 의존성 0건.
- Personality는 Canonical 타입 및 그 결과를 읽는다. 구조 관련 역방향 의존성과 순환은 TypeScript 모듈 해석으로 검사했다.

## F. 남은 항목

| 분류 | 결과 |
|---|---|
| FAIL | 0 |
| PARTIAL | 0 |
| DEFERRED | 결정적 기준이 없는 Prominence 등급. 확인 불가 위치의 미관측 출현 여부. |
| NOT_IMPLEMENTED | StructuralRoleModifier, 대운·세운·월운·일운 성격 보정, CurrentPersonalityResult, 고객 Renderer와 점수화 |
