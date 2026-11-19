# FILUNE P4-B Language-neutral Reading Assembly Core 결과

## A. 전체 판정

`READY_FOR_READING_ASSEMBLY_AUDIT`

**Reading Assembly Core COMPLETE**. 기존 결과 참조, 고정 목차, 후보와 확정 선정의 구분, 분야 및 장별 공백을 조립한다. 모든 장의 `customerRenderable`은 현재 `false`다. [P4-A 감사](p4a-reading-assembly-contract-audit-result.md) · [조립 명세](../rules/master/13-reading-assembly-spec.md) · [B rev38](../source/authority/B_rev38.md) · [B 렌더링 매핑](../rules/authority/mapping-B-rendering.md) · [Localization 매핑](../rules/authority/mapping-localization.md)

## B. Architecture

| 항목 | 결과 |
| --- | ---: |
| Assembly Core | 1 |
| 언어별 Assembly | 0 |
| Judgment 재계산 | 0 |
| Personality Renderer 호출·의존 | 0 |
| LLM/API 의존 | 0 |
| 고객 언어 완성문 필드 | 0 |

`src/lib/reading/`에 `assembleReading`, `chapterRegistry`, `validateReadingAssembly`를 공개했다. 기존 `BasicReading`과 `SelectedTopicReading`은 번역된 문장을 표시하는 UI이므로, 의미 조립은 별도 모듈에 두고 기존 Judgment·Personality 결과 타입을 재사용했다. 월 구간이 없는 반환과 있는 반환을 모두 받는 읽기 전용 입력 타입을 제공한다. 고객 이름·질문·알려진 사실은 입력 확장 지점으로만 받는다. [공개 진입점](../../lib/reading/index.ts) · [입출력 타입](../../lib/reading/types.ts)

## C. Chapter Registry

등록 **17/17**, 무료 5, 유료 전용 11, 질문 1, 순서 불일치 0. premium은 무료 단락을 포함한 17개 목차를 사용한다. 무료 모드의 F-LINK는 B F-링크의 주제에 해당하는 CH-04~08 및 CH-10 ID만 담는다. [고정 레지스트리](../../lib/reading/chapterRegistry.ts)

## D. Semantic Units

| 항목 | 검증 결과 |
| --- | ---: |
| 전체 단위 | 249 |
| 근거가 있는 단위 | 249 |
| 근거 없는 단위 | 0 |
| 중복 ID | 0 |
| 동일 의미·역할의 중복 결론 | 0 |
| UI-only metadata | 1 |

집계는 CS-005의 실제 원국·현재 Judgment, 동일 Canonical에서 만든 Personality, 절기 달력에서 만든 12개 월 입력 fixture를 결합한 검증 사례 기준이다. 12개 월 전체의 Judgment를 새로 계산한 통합 사례는 P4-C의 검증 범위다. Canonical에 숫자가 아닌 원천 Fact ID가 없는 값은 계산 버전과 위치, 또는 실제 절기 경계의 참조를 사용한다. raw 결과는 호출자가 보관하고 `meaningRef`의 생산자·레코드·범위 ID로 다시 읽을 수 있다. [단위 및 ID 정의](../../lib/reading/semanticUnit.ts)

## E. Selection Gaps

| 선정 항목 | 상태 | 자동 선택 |
| --- | --- | ---: |
| 핵심 구조 Top-3 | deferred / selection_rule_missing | 0 |
| 강점 Top-3 | deferred / selection_rule_missing | 0 |
| 과제 Top-3 | deferred / selection_rule_missing | 0 |
| 기억할 Top-3 | deferred / selection_rule_missing | 0 |
| Best month | deferred / selection_rule_missing | 0 |
| Worst month | deferred / selection_rule_missing | 0 |

기존 결과에서 후보를 모으고 `selectedUnitIds`는 비워 둔다. 정확히 3개와 6개인 입력 모두 검증했다. 월 순서는 실제 절기 시작 시각으로 정하며 순위는 생성하지 않는다.

## F. Outcome Gaps

| 범주 | 상태 |
| --- | --- |
| Work | outcome_not_implemented |
| Money | outcome_not_implemented |
| Relationship | outcome_not_implemented |
| Health | outcome_not_implemented |
| Question | engine_gap · question-routing |

CH-04~07 및 CH-Q의 의미 배치 0건. 관계 성향, 재성, 12운성, 건강·혼인 질문이 후속 분야 결과를 생성하지 않는 것을 확인했다.

## G. B-6 Deduplication

semantic key는 생산자·원천 레코드·평가 범위·기간에 기반한다. 동일 의미와 표현 역할의 배치를 중복 제거한다. F-03은 첫 결론을 배치하고 CH-02는 연결된 위치·역할·충돌 맥락으로 참조한다. F-04와 CH-03은 같은 후보 묶음을 공유하며, CH-03의 문맥 참조는 미선정 후보다. CH-01과 CH-08은 같은 현재 대운 단위를 각각 결론 슬롯과 상세 맥락 슬롯에서 읽는다. 문자열 문장 기반 dedupe는 0건이다. [중복 관리](../../lib/reading/deduplication.ts)

## H. Free/Premium

| 항목 | 불일치 |
| --- | ---: |
| 무료 시기 unit 누출 | 0 |
| premium 방향 변경 | 0 |
| 동일 Fact 확정도 변경 | 0 |
| 동일 Fact provenance 변경 | 0 |

같은 입력의 무료 64개 의미 단위를 premium의 해당 단위와 객체 단위로 비교했다. 무료에서는 시기 값과 이력 ID를 반환하지 않는다.

## I. Scope

| 범위 | 처리 |
| --- | --- |
| Natal | Canonical·구조·Personality 및 원국 역할 참조 |
| Daewoon | 실제 유효기간 확인 후 현재 스냅샷 참조. 따로 평가된 과거·다음 구간도 입력이 있을 때만 참조 |
| Sewoon | 활성 세운 및 공급된 평가 결과가 canonical 다음 절기년과 일치할 때 참조 |
| Month | 경계·상위 세운·pattern·runtime·role function·효과 근거 참조. 최종 양축 방향은 보류 |
| Day | premium의 엔진 가용 범위에만 표시. 장 배치 0 |
| 만료·정지 | 현재 활성 배치 0. history ID는 별도 보존 |

범위 유효성은 공급된 기준 시점과 실제 유효기간을 비교한다. 현재 Personality의 효과에는 원천의 활성 이력과 기간을 요구한다. 월 상세의 레퍼런스는 그 월의 평가 상태이며, 과거 월의 레코드를 현재 효과로 승격하지 않는다. 원국 역할 이력과 현재 작동을 구분하고 한 글자의 복수 역할을 유지한다. 직접 받은 일진은 장에 배치하지 않는다.

## J. Unsupported Inference

일·돈·관계·건강·질문 신규 추론, 신규 순위 및 가중 수치 모두 **0건**. `ActualStructuralFunction`에 있는 국소 방향과 근거 상태를 그대로 보존한다. `SOURCE_INFERENCE`에 기반한 작용은 확정으로 승격하지 않는다. 권위 규칙이나 분야 결과를 새로 추가하지 않았다.

## K. Dependency

Judgment → Reading 0, Personality → Reading 0. Reading → Judgment/Personality/Canonical은 **타입 및 읽기 전용 결과 입력**이다. 판정 엔진·기존 KO/JA/EN 렌더러 소스 변경 0건. [검증 스크립트](../../../scripts/verify-reading-assembly-core-p4b.mjs)

## L. Regression

| 검증 | 결과 |
| --- | --- |
| P2-A | PASS |
| P2-B | PASS |
| P2-C | PASS |
| P2-D | PASS |
| P2-E | PASS |
| P2-F | PASS |
| P2-G | PASS |
| P3-A | PASS |
| P3-B | PASS |
| P3-C | PASS |
| P3-D | PASS |
| P3-E | PASS |
| P3-F | PASS |
| Judgment | PASS · 35/35 |
| P4-B | PASS |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment는 기존 검증이 참조하는 레거시 문서 경로를 복원한 임시 저장소 사본에서 실행했다. P4-B는 실제 단일 시점 Judgment와 Personality fixture, 달력 기반 12개월 입력을 사용하고 기록 누락·중복·범위 누출·임의 선정을 거부하는 검증을 포함한다.

## M. 남은 상태

FAIL 0. PARTIAL은 출생 장면, 장별 Persona 표현, 구조 및 시기 참조다. SOURCE_GAP은 핵심 3·강점/과제 3+3·기억할 3 선정과 일부 장 조건이다. ENGINE_GAP은 OP-L03 최종 방향, 다기간 전체 판단, 질문 라우팅과 장별 표현이다. OUTCOME_LAYER_NOT_IMPLEMENTED는 일·돈·관계·건강이다. SELECTION_RULE_MISSING은 위 6종 선택에 적용한다. DEFERRED에는 월별 최종 방향·TenGodProminence가 남는다. TECH_DEBT는 언어 중립 trait ID 부재다.

다음 단계는 **P4-C Reading Assembly Core Integration Audit**이다. 실제 12개월 Judgment 결과 및 Personality 현재 결과를 함께 조립해 범위·상태·중복·근거·장 준비도를 재검증한다.
