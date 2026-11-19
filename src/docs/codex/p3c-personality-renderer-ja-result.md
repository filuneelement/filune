# FILUNE P3-C 일본어 Personality Renderer 결과

## A. 전체 판정

`READY_FOR_PERSONALITY_RENDERER_JA_AUDIT`

일본어 고객 표현 기준 원문 경로는 `src/docs/source/localization/FILUNE-ja-en-terminology-rendering-standard.m`이다. 파일 제목과 0절의 해석 분리 원칙, B절의 일본어 문체·확정도, D절의 상태 처리, E절의 금지 표현을 적용했다. [일본어·영어 표현 기준 원문](../source/localization/FILUNE-ja-en-terminology-rendering-standard.m)

고객 표현과 노출 제한은 B rev38 및 렌더링 매핑, Fact·역할·위치의 의미는 Personality 마스터와 Knowledge 스키마를 따랐다. [B rev38](../source/authority/B_rev38.md) · [렌더링 매핑](../rules/authority/mapping-B-rendering.md) · [Personality 마스터](../rules/master/11-personality-master.md) · [Knowledge 스키마](../rules/master/12-personality-knowledge-schema.md)

## B. Architecture

| 항목 | 결과 |
| --- | --- |
| 공통 Personality Engine | 1개 |
| 일본어 별도 엔진 | 0개 |
| JA → KO 렌더러 의존 | 0건 |
| JA → Judgment 직접 의존 | 0건 |
| 고객 문장 입력 | 공통 `PersonalityRenderInput`의 `natal`, 선택적 `current` |
| 고객 블록 | 공통 `RenderedPersonalityBlock` 및 Fact·Modifier·Conflict 근거 ID |

공개 함수 `renderPersonalityJa`는 공통 입력과 렌더링 로직을 사용한다. KO와 JA는 Fact 선택, 섹션 배치, 역할 작용, 활성 기간, 충돌 처리, 확정도 집계를 공유한다. 각 언어가 자체 문장과 안전 검사를 제공한다. [공개 API](../../lib/personality/index.ts) · [공통 렌더링](../../lib/personality/render/renderPersonality.ts) · [JA 렌더러](../../lib/personality/render/ja/renderPersonalityJa.ts)

KO에서 ‘논리적 사고’, ‘철학적 사고’, ‘재치와 창의적 사고’의 활용형이 사고 사건 필터에 걸려 같은 문단의 정상 근거까지 누락되는 현상을 확인했다. 세 표현만 같은 의미의 고객 문구로 고쳐 누락을 해소했다. P3-B의 17개 입력 생성부는 P3-C와 공유한다. [KO 문구](../../lib/personality/render/ko/wording.ts) · [공통 검증 입력](../../../scripts/fixtures/personality-renderer.mjs)

## C. Coverage

P3-B의 대표 사례 17건과 canonical 일주 60건에서 언어별 섹션의 고유 Fact·Modifier·Conflict ID 수를 입력별로 합산했다. 충돌 행은 전체 섹션의 Conflict ID만 합산한 값으로, 섹션 집계에도 포함된다.

| 영역 | KO provenance | JA provenance | Parity |
| --- | ---: | ---: | --- |
| overview | 254 | 254 | PASS |
| outward | 219 | 219 | PASS |
| inner | 1,595 | 1,595 | PASS |
| decision | 270 | 270 | PASS |
| emotion | 193 | 193 | PASS |
| strengths | 1,815 | 1,815 | PASS |
| cautions | 131 | 131 | PASS |
| conflicts | 29 | 29 | PASS |
| current | 105 | 105 | PASS |

**Language-neutral trait identity coverage.** 현재 렌더링 대상인 `PersonalityFact`에는 언어 중립적인 개별 trait ID가 없다. Fact ID도 정규화된 trait 내용을 포함한다. 따라서 언어 독립 키 기준은 0/348이고, 정규화된 내부 trait 값의 완전 일치 조회 기준은 348/348이다. canonical Knowledge의 Fact 생성 필드와 일주 충돌의 양쪽 근거 및 발현 값을 검증했다. JA 사전에 등록되지 않은 입력은 해당 문구를 생략한다. [Fact ID 생성](../../lib/personality/facts/personalityFacts.ts) · [JA 문구 사전](../../lib/personality/render/ja/wording.ts)

## D. Japanese Guardrails

| 검증 항목 | 대표 출력 위반 |
| --- | ---: |
| 명리 전문용어·간지 기호 | 0 |
| 금지 호칭·캐릭터 어미 | 0 |
| 고풍 점술체 | 0 |
| 공포 표현 | 0 |
| 사건 단정 | 0 |
| 생활 상태 단정 | 0 |
| 건강 추정 | 0 |
| 점수·확률·랭크 | 0 |
| 근거 없는 역할·성향 표현 | 0 |

금지 입력 74건을 차단했고 일반 한자와 단어 내부의 `君`을 허용하는 예를 검증했다. 근거 없는 의미는 대표 시나리오의 조건·작용 문구 검증, 근거 누락 시 출력 생략, provenance 비교로 확인했다. [JA guardrails](../../lib/personality/render/ja/guardrails.ts) · [P3-C 자동검증](../../../scripts/verify-personality-renderer-ja-p3c.mjs)

## E. Certainty

| 내부 상태 | 검증 결과 |
| --- | --- |
| confirmed → assertive | PASS · 현재 방해는 실제 작동형으로 표현 |
| contextual → conditional | PASS · 보호 대기는 필요할 때의 보조, 조건부 방해는 평소 발현·조건·방해를 보존 |
| reduced → weakened | PASS · 역할 및 Current Fact에 약화 표현 |
| inactive → current omitted | PASS · 활성 문단 0건 |
| expired → current omitted | PASS · 만료된 효과와 연결된 현재 문단 0건 |

P3-B와 같은 7개 operation × 5개 상태를 검증했다. 조건 의존성을 나타내는 `contextualizes`는 조건 표현을 유지한다. 충돌 양쪽 근거는 같은 문단에서 추적되며 중복 원국 성향은 현재 맥락을 덧붙여 표현한다.

## F. Semantic parity

| 비교 | 불일치 |
| --- | ---: |
| KO/JA Fact | 0 |
| KO/JA Modifier | 0 |
| KO/JA Conflict | 0 |
| KO/JA certainty | 0 |
| KO/JA Natal/Current | 0 |

섹션별 ID와 문단 확정도, 역할·충돌 문단의 연결된 Fact·Modifier·Conflict ID를 비교했다. 배열 순서를 역전해도 JA 출력이 동일함을 확인했다. 출생 시각 미정, `SOURCE_GAP`, 戊午 canonical 결과 및 만료 처리도 검증에 포함했다.

## G. Regression

| 검증 | 결과 |
| --- | --- |
| P2-A | PASS · 일간 10, 십성 10, 위치 6 |
| P2-B | PASS · 일주 60/60 |
| P2-C | PASS · 등록 항목 86 |
| P2-D | PASS |
| P2-E | PASS |
| P2-F | PASS · 18/18 |
| P2-G | PASS · 18/18 |
| P3-A | PASS · 16/16 |
| P3-B | PASS · 대표 사례 17건, 의미 검증 3건, 역할·확정도 35/35 |
| P3-C | PASS · A–P 16/16, 역할·확정도 35/35 |
| Judgment | PASS · 35/35 |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment 검증 명령 35개는 임시 저장소 사본에서 실행했다. 일부 명령이 읽는 레거시 문서 경로는 커밋 `651c431`의 원본으로 임시 사본에 복원했다. Judgment, Personality Engine, Knowledge 소스 수정은 0건이다.

## H. 남은 상태

| 분류 | 결과 |
| --- | --- |
| FAIL | P3-C 검증 0 |
| PARTIAL | P3-C 검증 0 |
| UNSUPPORTED | canonical 렌더링 대상 trait 0 |
| OVERSTATEMENT | 대표 확정도·의미 검증 0 |
| DEFERRED | Prominence와 P3-D 일본어 의미 감사 |
| SOURCE_MISSING | 일본어 기준 문서 0. Knowledge의 기존 `SOURCE_GAP`은 입력대로 처리 |
| NOT_IMPLEMENTED | P3-C 범위 0 |

다음 단계는 P3-D 일본어 Personality Renderer Semantic Audit이다. 실제 문장에서 의미 손실, 표현의 자연성, 확정도와 역할 의미, KO와의 일관성을 확인한다.
