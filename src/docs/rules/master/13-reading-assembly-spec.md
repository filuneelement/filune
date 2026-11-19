# FILUNE Reading Assembly Spec

상태는 P4-A 설계 초안이다. B rev38의 장 구성과 기존 내부 결과의 조립만 정의한다. 장별 가용성의 근거는 P4-A 감사 결과에 기록한다. [B rev38](../../source/authority/B_rev38.md) · [B 렌더링 매핑](../authority/mapping-B-rendering.md) · [감사 결과](../../codex/p4a-reading-assembly-contract-audit-result.md)

## 1. 목적

판정은 현행 authority와 master 01~12가 담당한다. Assembly는 이미 계산된 결과에서 장별로 허용된 근거와 깊이를 정한다. Locale Renderer는 조립 결과를 고객 언어로 표현한다. B-0-3, B-6, W-12, W-13, W-93, W-99를 조립 제약으로 적용한다.

## 2. 입력

기존 결과를 읽기 전용으로 참조한다.

- Canonical은 `CalculatedChart` 전체를 참조한다. 내부 `CanonicalChart`만으로는 출생 입력, 시간 정책, 절기, 운의 날짜, 불확실성 정보가 빠진다.
- Judgment는 `runInternalReading`의 원국·운 결과, `judgmentCore`의 `LuckScopeState` 및 존재하는 `luck.monthlyWindow`를 사용한다. 각 결과의 실행·기간·근거를 함께 읽는다.
- Personality는 `NatalPersonalityResult`와 요청된 범위의 `CurrentPersonalityResult`를 사용한다. 구조 역할 투영을 포함한 엔진 실행은 Assembly 입력 생산 단계에 속한다.
- `CustomerContext` 초안은 `name?`, `knownFacts?`, `question?`를 받는다. 실제 생활 정보의 값과 고객이 제공한 근거를 함께 둔다. 기준 시점과 구매 기준 시점은 호출자가 전달하며 감정서 조립이나 렌더링 중 현재 시각으로 다시 정하지 않는다.

[Canonical 타입](../../../lib/canonical/types.ts) · [내부 읽기](../../../lib/judgment/pipeline/internalReading.ts) · [Personality 진입점](../../../lib/personality/index.ts)

## 3. Output hierarchy

`ReadingAssembly → sections/chapters → semantic unit references` 계층을 제안한다. 공통 단위와 승인된 심화 근거는 한 번 등록하고, 장은 해당 단위의 참조 및 표현 목적을 보관한다. 동일 입력과 고객 맥락이면 동일한 목차·근거·판정·공백을 반환한다. 사례 문구, 랜덤 선택, LLM 선택은 사용 금지다.

## 4. Free/Premium structure

B-0-3 순서를 그대로 쓴다. 무료는 원국 정보와 F-link의 안내만 제공한다. 유료와 질문은 B가 지정한 원국·대운·세운·절기월 범위에서 근거를 더한다. W-99에 따라 공통 결론의 방향과 확정도를 보존한다. 현재 UI의 운 표시 여부는 감정서 범위와 별개다.

## 5. Chapter registry

| 순서 | 절·장 | 계약 근거 및 조립 대상 |
| --- | --- | --- |
| F-① | 태어난 순간 | B-2·W-03/W-97. 출생 정보, 명식표, 절기와 계절, 열쇠 이름 |
| F-② | 가장 잘 드러나는 특징 세 가지 | B-2·01~07. 핵심 구조의 첫 결론. 정확히 세 가지 선정은 SOURCE_GAP |
| F-③ | 성격과 사람을 대하는 방식 | B-2·W-40~43·11~12. 원국의 겉·가까운 사람·판단·감정과 근거 |
| F-④ | 타고난 강점과 반복되는 과제 | B-2·05·11~12. 구조 근거가 있는 강점·과제와 공통 뿌리. 3+3 선정은 SOURCE_GAP |
| F-link | 여기서 더 들어가면 | B-2. 목차 안내만 사용 |
| CH-1 | 타고난 운명의 설계도 | B-3·W-90~98·01~09. 구조 연결과 현재 대운의 짧은 자리 표시 |
| CH-2 | 나라는 사람의 본모습 | B-3·W-12/W-40~43·11~12. 원국 일곱 면의 근거 및 상황·조건·대상 |
| CH-3 | 타고난 강점과 넘어야 할 과제 | B-3·05·11~12. 같은 선정 단위에 작용·조건·대응 근거 추가 |
| CH-4 | 일과 성공이 열리는 방향 | B-3·W-13/W-53·08. 일의 방식·조건과 시기. 분야 투영층 공백 |
| CH-5 | 돈이 들어오고 머무는 흐름 | B-4·W-11/W-13/W-52·06~08. 재물 조건과 시기. 분야 투영층 공백 |
| CH-6 | 사랑과 평생의 인연 | B-4·W-50~56/W-87~89·A I-15/I-22/OP-R03. 자리·갈등·시기. 분야 투영층 공백 |
| CH-7 | 몸과 건강의 흐름 | B-4·W-30~35·A I-16. 전통 대응과 검증된 근거만 허용. 안전한 분야 투영층 공백 |
| CH-8 | 인생의 큰 운명 지도 | B-4·W-20~23·08~09. 과거·현재·다음 대운과 유효 근거 |
| CH-9 | 올해와 내년에 다가오는 운 | B-5·W-13/W-93·08~09. 두 절기년의 바탕과 월 참조 |
| CH-10 | 앞으로의 12개월 | B-5·W-13/W-14/W-93·08~10. 구매 절기월부터 12개월과 축별 월 판정 참조 |
| CH-11 | 마지막 안내 | B-5·B-6. 근거 있는 요약과 월별 리듬. ‘기억할 셋’ 선정은 SOURCE_GAP |
| CH-Q | 개인 질문에 대한 답 | B-5·W-11/W-99. 근거 있는 장·월의 선택. 질문 라우팅은 NOT_IMPLEMENTED |

## 6. Semantic Unit

다음은 설계 예시다. 의미 값은 출처가 있는 기존 결과 또는 그 결과 안의 읽기 전용 참조다. 새 분야 열거값 자체에 판정 능력을 부여하지 않는다.

```ts
interface ReadingSemanticUnit {
  id: string
  topic: ReadingTopic
  meaningRef: { producer: 'canonical' | 'judgment' | 'personality'; recordId: string; field?: string }
  scope: 'natal' | 'daewoon' | 'sewoon' | 'month' | 'day'
  periodRef?: string
  axis?: 'stem' | 'branch'
  sourceStatus: string
  sourceFactIds: readonly string[]
  sourceRoleIds: readonly string[]
  sourceEffectIds: readonly string[]
  sourcePersonalityFactIds: readonly string[]
  firstSectionId?: string
  allowedSectionIds: readonly string[]
  assemblyStatus: 'ready' | 'partial' | 'deferred'
}

interface ChapterAssemblyPlan {
  chapterId: string
  requiredTopics: readonly ReadingTopic[]
  optionalTopics: readonly ReadingTopic[]
  requiredScopes: readonly ReadingSemanticUnit['scope'][]
  placements: readonly { unitId: string; purpose: 'conclusion' | 'evidence' | 'condition' | 'timing' | 'application' | 'summary' }[]
  gaps: readonly AssemblyGap[]
}
```

Topic 후보는 structure, personality, strength, challenge, work, money, relationship, health, daewoon, year, month, summary다. `AssemblyGap`은 영향받는 장·필수 항목·분류·근거를 함께 기록한다. 현재 ID가 없는 canonical 필드는 출처의 버전·위치로 식별하는 방안을 사용한다.

## 7. Provenance

원천 ID와 계산 버전·검사 시점·출처를 유지한다. 같은 의미라도 축·유효기간·대상·조건이 다르면 구분한다. 역할·효과 ID, 원천 Fact ID에 더해 필요하면 Conflict ID, authority rule, evidence ID를 연결한다. 월은 동일 조립 실행의 검증된 월 키에 연결한다. 재실행마다 달라질 수 있는 scope ID만으로 서로 다른 실행을 합치지 않는다. 고객 본문에서 내부 ID와 역할명은 숨긴다.

## 8. Certainty

`confirmed`, `contextual`, `conditional`, `provisional`, `deferred`, `unknown`, `unsupported` 등 원천 상태와 이유를 보존한다. 확정도와 작동 상태(active/operating, reduced, inactive, expired)는 별개다. `confirmed` 관계 사실이나 달력 단계만으로 최종 운 판단을 확정하지 않는다. `not-applicable`은 작용이 적용되지 않은 상태로 보존한다.

## 9. Deduplication

B-6의 첫 등장에는 결론을 두고 이후에는 새로운 근거·조건·대상·시기·적용만 더한다. 동일 의미·기간·축·표현 목적의 복제를 공통 ID로 검출한다. B에서 명시한 CH-11 요약과 CH-Q의 직접 답은 같은 결론을 참조할 수 있다. 이미 노출한 문장 복사는 피하며, 선행 장이 제품 노출 범위 밖이면 동일한 원천 결론을 허용된 위치에서 제공한다. 고객 문장 문자열로 dedupe하지 않는다.

- F-③ → CH-2는 상황·조건·대상으로 심화한다.
- F-④ → CH-3 → CH-11은 근거 있는 작동 방식과 요약을 연결한다.
- CH-1의 현재 대운 요지는 CH-8에서 확장한다.
- 월 결론은 공통 월에서 읽고 CH-10을 상세 기준으로 둔다. 앞 장이 그 달을 언급해도 방향이나 이름을 재선정하지 않는다.

## 10. Scope handling

원국 판단과 현재의 임시 발현을 분리한다. 일진은 엔진 입력 범위에 있어도 B 목차의 고정 장에 배치하지 않는다. 월은 절입 경계의 유효기간과 상위 세운을 참조한다. 연·월 방향이 다를 때 각 범위를 유지한다. 과거 이력은 당시 작용의 기록까지 사용한다. 출생 시각 미상, 경계, 기간 불확실성을 해소한 것으로 취급하지 않는다. F-①의 시각/절입 공백은 B F-①·W-97 및 D Q2의 적용 범위를 확인하기 전까지 발행 차단 상태로 표시한다.

## 11. Locale separation

언어 공통 Assembly 하나를 제안한다. KO·JA·EN Reading Renderer는 같은 장 ID·단위 ID·근거·확정도·범위를 소비한다. Personality 문장은 Assembly에 저장하지 않는다. F-③/CH-2에서 공통 Personality 입력 또는 근거에 연결된 subview를 전달하고 최종 locale에서 기존 문구를 재사용한다. 현행 Personality Renderer API의 전체 출력만으로 장별 증거 깊이와 첫 등장 배치를 구현할 수 있다는 가정은 두지 않는다. 중역·판정 재실행을 금지한다. [Localization Authority Mapping](../authority/mapping-localization.md)

## 12. Product/Engine separation

계산 가능 여부, 조립 가능 여부, 제품 노출 여부를 각각 표현한다. 권한·상품 정책은 규칙 레지스트리 밖에 둔다. 전체 무료·유료·질문은 같은 판단을 참조한다. B 범위와 분량 차이만 기록하며 결제·가격·구독 계약은 별도다.

## 13. Gap policy

`SOURCE_GAP`, `ENGINE_GAP`, `RENDERER_GAP`, `OUT_OF_SCOPE` 및 장의 `PARTIAL`을 드러낸다. 현행 **OUTCOME_LAYER_NOT_IMPLEMENTED**와 OP-L03 최종 축별 출력의 ENGINE_GAP은 운영 단계의 의존성이다. 조립 자체는 읽을 수 있는 범위부터 구현할 수 있다. 필수 슬롯의 공백은 빈칸을 일반론으로 메우는 대신 명시적으로 표기하며 해당 완성본을 발행 준비 상태로 올리지 않는다. 선택 기준이 없는 Top-3는 선정을 보류한다.

검증 계약은 F-③→CH-2 심화, 전 장의 동일 월 키·방향, 무료·유료 공통 결론의 방향·확정도, KO/JA/EN 간 장·단위·provenance·scope 일치, 입력 순서 변경 시 결정론, 필수 근거 부재 시 공백 보존이다.

## 14. Prohibited inference

TenGod 고정 길흉, 원국 위치를 운에 확대, 구조를 직업·수입·혼인·건강·성공으로 자동 투영, 체감 또는 사건 추정, 12운성으로 신체·질병 생성, 생활 상태 추정, 주관적 순위·점수, 근거 없는 조언을 금지한다. 국소 작용은 `ActualStructuralFunction`, 승인된 `PatternEffectPolicy`, 역할의 현재 상태와 근거를 따른다. 근거 부족을 중립 또는 긍정으로 채우지 않는다.
