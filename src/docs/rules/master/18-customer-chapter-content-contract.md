# P4 Customer Chapter Content Contract

[17 Cause-to-Life](17-cause-to-life-mapping.md)에서 승인된 경로를 [19 Narrative Blueprint](19-reading-narrative-blueprint.md)의 표현 계획으로 전달한다. 이 문서는 고객 조립의 공통 계약이다. [B rev38](../../source/authority/B_rev38.md)의 내부 authority와 [13 Assembly](13-reading-assembly-spec.md)의 장 ID 및 접근 범위를 유지한다. 고객 ID는 `CR-01`~`CR-09`로 제안한다. 01~03은 무료 원국 본문, 04~09는 유료 본문이다. 내부 F-01의 출생 정보, F-02 구조 안내, F-LINK, CH-11의 요약과 CH-Q 질문은 해당 B 계약에 남으며 새 본문 장 수에 포함하지 않는다. 유료에서 무료 결론을 참조할 때 원천 ID와 확정도를 유지한다.

`requiredSemanticSlots`는 검토할 항목이다. 개별 명식에서 적용 제외, 근거 공백, 충족을 각각 기록한다. 아래 최소 커버리지는 완성본 목표이며 미충족 시 `PARTIAL` 및 슬롯별 원인을 보존한다. 조건·시기가 적용되지 않는 원국 항목은 공백 분량으로 계산하지 않는다. 생활 장면은 예시이며 실제 이력 주장은 명시 입력이나 적격 원천이 필요하다.

CR-01~03의 현재 의미 투영은 Assembly의 natalPersonalityChapters에서 원천 Fact와 원천 갈등 ID를 제공한다. 후보 상태는 단일 축의 설명 가능성과 장 완성 여부를 구분한다. [15개 fixture 커버리지 감사](../../codex/p4-personality-coverage-audit-result.md)

## 고객 장의 판정 상태

- `semanticReadiness`는 장 질문을 설명할 원천 의미의 충분성을 뜻한다. 문장 길이와 표현은 이 판정에 사용하지 않는다.
- `publicationReadiness`는 근거 충분성, 필수 질문과 원인 커버리지, Renderer 완결성, 무근거·중복·층 혼합 검사 및 품질 band를 평가한다. 의미가 충분해도 본문 밀도가 부족하면 발행 PARTIAL이며 `RENDERER_GAP/density_target`을 기록한다. 밀도 공백 자체는 QA FAIL이 아니다. 의미 DEFERRED는 발행 DEFERRED다.

## CR-01 나의 기본 성향

- **chapterId / customerTitle** CR-01 · 나의 기본 성향
- **coreQuestion** 나는 기본적으로 어떤 방식으로 생각하고, 받아들이고, 판단하고, 행동하는가?
- **primaryProducers** NatalPersonalityResult의 DayStem, TenGod 및 PositionExpression, 월지·일지·시지의 이미 연결된 fact.
- **supportingProducers** DayPillar modifier, StructuralRoleModifier, Conflict, Canonical 위치 및 시간 신뢰도. 일주 원자료의 허용된 성향 필드 활용.
- **requiredSemanticSlots** core nature, external expression, internal decision style, information/adaptation, relationship/social expression, stress response, internal contradiction/duality.
- **optionalSemanticSlots** 위치 대비, 상황별 발현, 실제로 지지·제약하는 역할.
- **minimumEvidenceCoverage** 독립 축 4개 권장. 이중성은 양쪽 fact와 상황 구분이 있어야 한다.
- **causeExplanationRequirement** 기질 → 출처 역할과 위치 → 표현 상황. 일주는 성향을 보정한다.
- **timingRequirement** 원국만 사용.
- **customerContextUse** 실제 입력이 허용하는 비유 선택.
- **crossChapterReuse** F-03/CH-2, 구조 근거는 F-02/CH-1. CR-02에는 능력의 발휘, CR-03에는 상황에 따른 판단과 반응을 전달.
- **prohibitedInference** 일주로 격·재물·직업·결혼을 생성하거나 미상 시지 추정.
- **partialPolicy** 증거가 있는 독립 축만 사용하고 누락 축 기록.

## CR-02 나의 강점

- **chapterId / customerTitle** CR-02 · 나의 강점
- **coreQuestion** 나는 무엇을 잘하며 어떤 상황에서 실제 능력이 되는가?
- **primaryProducers** NatalPersonalityResult의 strength 및 productive-expression evidence.
- **supportingProducers** 위치, 역할 modifier, work/interpersonal 및 stress fact.
- **requiredSemanticSlots** primary strength, secondary strength, problem solving, social/collaboration, work application, overuse risk.
- **optionalSemanticSlots** 보완 역할, 실패 조건, 협업에서 역할 대비.
- **minimumEvidenceCoverage** 독립 strength mechanism 3개 권장. 선두 배치는 최초 설명 순서이며 객관적 순위가 아니다.
- **causeExplanationRequirement** 능력 → 원인 → 발휘 조건 → 행동 → 근거 있는 과사용 위험.
- **timingRequirement** 원국만 사용.
- **customerContextUse** 알려진 활동에서 발휘 장면 선택.
- **crossChapterReuse** F-04/CH-3. CR-06은 환경 적용을 추가.
- **prohibitedInference** 강점 이름 나열, 임의 Top-3, 성공·성과 보장.
- **partialPolicy** 동일 mechanism의 별칭은 합치고 지원된 강점만 기술.

## CR-03 상황에 따라 달라지는 나의 반응

- **chapterId / customerTitle** CR-03 · 상황에 따라 달라지는 나의 반응
- **coreQuestion** 나는 어떤 상황에서 무엇을 중요하게 보고, 어떻게 판단하고 반응하는가?
- **primaryProducers** Natal Personality의 decision, stress, shadow, expression, 관련 strengths 및 Conflict.
- **requiredSemanticSlots** trigger, response_or_judgment, behavior_or_expression, context. 명시적 맥락 대비에서는 context가 trigger 역할을 할 수 있다.
- **optionalSemanticSlots** result, contrast, recurrence, protective_condition, aggravating_condition.
- **minimumEvidenceCoverage** 의미 판정은 독립 반응 2개 이상이면 READY, 1개면 PARTIAL, 0개면 DEFERRED. 각 반응에 촉발 또는 맥락, 반응 또는 판단, 행동 또는 표현을 요구한다. 같은 Conflict의 양쪽 Fact와 발현 맥락의 차이가 확인되면 하나의 맥락 대비로 센다.
- **causeExplanationRequirement** 상황 → 판단 또는 반응 → 행동·표현. 결과와 재발은 각각 별도 근거가 있을 때 추가한다.
- **timingRequirement** 원국만 사용.
- **crossChapterReuse** 같은 기제를 CR-05에서 사용할 경우 의미·기제·원천 Fact ID를 그대로 두고 검증된 관계 맥락을 덧붙인다.
- **prohibitedInference** 미지원 결과·재발, 맥락 대비의 시간 순서화, 일주를 실제 과거 이력이나 빈도로 변환.

## CR-04 지금 내 삶에서 무엇이 달라지고 있는가

- **chapterId / customerTitle** CR-04 · 지금 내 삶에서 무엇이 달라지고 있는가
- **coreQuestion** 지금의 기회와 압박은 원국과 비교해 어디에서 달라지는가?
- **primaryProducers** Natal Judgment, 현재 대운·세운 LuckScopeState, 현재 적격 Outcome.
- **supportingProducers** CurrentPersonalityResult, 승인 EventTiming, Health.
- **requiredSemanticSlots** baseline, current daewoon background, current sewoon activation, what changed, opportunity, pressure, affected domain, duration, cause.
- **optionalSemanticSlots** 권한과 책임의 별도 증거, 조건부 경감, 월의 독립 활성.
- **minimumEvidenceCoverage** 원국 또는 평가한 상위 범위와 현재 범위의 비교에서 실제 차이가 하나 이상이면 semantic READY. 현재 승인 Outcome만 있으면 PARTIAL. 유효한 현재 의미와 비교 근거가 모두 없으면 DEFERRED. 원국은 기준 상태로만 쓰며 시작일과 종료일을 표시하지 않는다.
- **causeExplanationRequirement** 실제로 달라진 역할·대상·기능과 기회/압박을 별도로 풀이. 책임만 증가하는지 권한이 함께 움직이는지 독립 증거 확인.
- **timingRequirement** 기준일이 현재의 검증 구간 안에 있어야 하며 대운 배경과 연 활성 범위를 각각 기록.
- **customerContextUse** 입증된 대상의 장면만 구체화.
- **crossChapterReuse** CH-1/8/9, 필요 시 CH-4~7/10. CR-08은 전환, CR-09는 구간별 판단 중심.
- **prohibitedInference** 변화운 총평으로 분야·책임·시기 단정.
- **partialPolicy** 가용 범위만 서술하고 비어 있는 비교 및 분야는 각각 표시.

## CR-05 관계에서 드러나는 나의 방식

- **chapterId / customerTitle** CR-05 · 관계에서 드러나는 나의 방식
- **coreQuestion** 나는 사람을 어떻게 받아들이고, 가까워진 뒤에는 무엇을 중요하게 보며, 소통과 갈등에서는 어떤 방식으로 반응하는가?
- **Section A · 관계에서 드러나는 나의 방식** 원국 Personality만 사용한다. 사회적 접근, 친밀과 신뢰, 소통, 경계와 갈등 대응, 거리 조절 중 근거가 있는 축을 선택한다.
- **Section B · 관계의 흐름이 움직이는 시기** 별도 질문은 관계의 접점·구도·형성 기회 또는 압박이 어느 평가 기간에 움직이는가이다. 유효한 Relationship Outcome과 평가된 기간만 사용한다. A의 성향에서 B의 사건 원인을 만들지 않는다.
- **sequence / recurrence** `relationshipSequence`는 지지된 관계 단계의 연결이다. `relationshipRecurrence`에는 같은 유형의 반응이 다시 활성된다는 명시 근거만 허용한다.
- **beginnings** 폭넓은 교류는 사회적 접근에 해당한다. R10의 관찰과 차츰 마음을 여는 방식은 조건이 확인된 친밀 진입 후보이며, 연애 시작이나 성사를 뜻하지 않는다. `SOURCE_GAP/beginnings`를 유지한다.
- **semanticReadiness** Section A의 독립 관계 축 3개 이상에 소통 또는 경계·갈등이 있으면 READY다. 지지된 축이 있으나 이 기준을 만족하지 못하면 PARTIAL이다. 원국 관계 Fact가 없으면 DEFERRED다.
- **relationshipTimingAvailability** B는 A의 의미 판정과 독립적이다. 유효한 기간과 근거 연결이 완결되면 available, 유효 내용이나 근거·기간이 일부에 그치면 partial, 표시할 평가가 없으면 none이다.
- **publicationReadiness** A만으로도 발행 후보가 될 수 있다. B만 있으면 평가된 시기 결과를 내부 섹션으로 유지하고 고객 장 본문에서는 제외한다. 선택 근거인 관계 재발·친밀 관계 개시의 공백만으로 강등하지 않는다.

## CR-06 어떤 일과 환경에서 내 강점이 가장 잘 살아나는가

- **chapterId / customerTitle** CR-06 · 어떤 일과 환경에서 내 강점이 가장 잘 살아나는가
- **coreQuestion** 어떤 역할과 환경이 내 능력을 쓰게 하며 어려움은 어디에서 생기는가?
- **primaryProducers** Personality의 workStyle·strength. Work/Study Outcome은 현재 producer 공백.
- **supportingProducers** 판단·협업·modifier, 직접 연결된 제한적 계약/사업 EventTiming.
- **requiredSemanticSlots** work approach, strongest abilities, preferred role, organizational environment, independent vs organization, how recognition is earned, repeated difficulty, cause, current change, future timing.
- **optionalSemanticSlots** 피드백·역할 조건, 학생의 학습·시험·전공·학습환경 장면.
- **minimumEvidenceCoverage** 성향 작업 방식과 발휘 조건의 독립 근거. 어려움·성과·시기 주장마다 별도 분야 Fact와 원인 필요.
- **causeExplanationRequirement** 승인 경로마다 현실 작동을 설명한다. 학생용 CL-S01~04는 [조건부 비발행 후보](21-work-study-outcome-source-audit.md)이며 Work/Study 판정이 없으면 학습 방식까지만 표현.
- **timingRequirement** Work/Study timing producer 및 대상 자격 필요. EventTiming은 해당 계약/사업 이벤트의 구간만.
- **customerContextUse** 명시 학생은 study/exam/major/learning으로 장면을 라우팅. 재직·구직·사업은 각 환경 사용. 전공 성공·시험 결과를 만들지 않는다.
- **crossChapterReuse** CH-4 중심, CH-2/3 성향, CH-8/9/10 증거. CR-02의 강점을 환경 조건으로 재사용.
- **prohibitedInference** workStyle에서 직업 성공·직군·취업·승진 또는 학업 불리 생성, 사업 시기를 직업 시기로 전용.
- **partialPolicy** 작업/학습 성향과 승인된 이벤트만 제공. 분야별 결과 producer는 ENGINE_GAP, OUT-WORK-01~05 일반화는 SOURCE_GAP.

## CR-07 돈을 만드는 방식과 돈을 지키는 힘

- **chapterId / customerTitle** CR-07 · 돈을 만드는 방식과 돈을 지키는 힘
- **coreQuestion** 무엇으로 수익을 만들고 무엇이 유지를 돕거나 제한하는가?
- **primaryProducers** MoneyOutcomeFact와 연결된 scoped Judgment.
- **supportingProducers** 승인 EventTiming, Runtime·protection.
- **requiredSemanticSlots** 획득 계열에서 한 축 이상, 유지·정성적 축적 지속성·보호·합성 유출/배분·부담 계열에서 한 축 이상. 분리된 손실·분배·경쟁·비용과 독립적인 장기 지속은 근거가 있을 때만 추가한다.
- **optionalSemanticSlots** 보호·통관, 해당 시기, 독립 확인된 사업 관련 부담.
- **semanticReadiness** 두 계열이 모두 지원되면 READY, 한 계열만 있으면 PARTIAL, 고객용 Money Outcome이 없으면 DEFERRED. 같은 합성 Fact나 한 기간의 반복으로 축을 늘리지 않는다.
- **publicationReadiness** 의미 판정·장 질문·원인 커버리지·QA와 1,500~2,500자 및 7~10문단 band를 별도 검증한다.
- **causeExplanationRequirement** 획득 → 방식 → 유지/축적 → 유출과 비용의 근거 → 시기. 기술 수익화, 실제 경쟁·배분, 필요한 기반 손상, 압박 경로를 분리.
- **timingRequirement** 독립 평가된 기간만 연결. 원국 capacity를 월 판단에 복제하지 않는다.
- **customerContextUse** 실제 돈 활동이 확인된 경우 승인 기제의 예시에 반영.
- **crossChapterReuse** CH-5, CH-8/9/10 및 CR-04/09에 같은 ID의 시기 참조.
- **prohibitedInference** 순길흉 상쇄, 합쳐진 outflow Fact에서 잃음과 분배를 각각 확정, 금액·투자 조언.
- **partialPolicy** cost·competition·loss·division 등 별도 귀속이 미확정이면 범용 결과의 원천 표현 유지.

## CR-08 앞으로 삶의 흐름이 크게 바뀌는 때

- **chapterId / customerTitle** CR-08 · 앞으로 삶의 흐름이 크게 바뀌는 때
- **coreQuestion** 어느 장기 전환에서 무엇이 달라지고 다음 단계는 어떻게 이어지는가?
- **primaryProducers** 평가된 연속 대운과 원국 비교, 세운 activation.
- **supportingProducers** Outcome, EventTiming, Health, 승인된 월 구체화.
- **requiredSemanticSlots** major transition, changed structural state, why, affected domain, opportunity, burden, duration, next stage.
- **optionalSemanticSlots** 과거 변화 이력, 전환기에 국소 분기.
- **minimumEvidenceCoverage** 정확한 경계를 공유하는 대운을 양쪽에서 독립 평가하고 승인된 의미의 상태 차이가 하나 이상이면 semantic READY. 평가한 쌍에서 설명 가능한 변화가 확인되지 않으면 PARTIAL. 양쪽을 확인할 수 없으면 DEFERRED. 대운 변경만으로 변화가 생겼다고 설명하지 않는다.
- **causeExplanationRequirement** 변한 경로의 시작·감쇠·정지·유지를 구분.
- **timingRequirement** 대운은 장기 환경, 세운은 연 활성, 절기월은 구체화. 기간과 계층을 유지.
- **customerContextUse** 확인된 분야 변화의 예시만 선택.
- **crossChapterReuse** CH-8/9, CH-1/7/10에서 근거 보완. CR-04와 현재 대운의 같은 ID 사용.
- **prohibitedInference** 대운 간지 교체만으로 큰 사건, 연·월 활성으로 대운 전환 주장, 임의 변화 점수.
- **partialPolicy** 다음 대운의 평가가 없으면 현재 구간까지만 제공하고 전환 공백 표시.

## CR-09 기회를 활용할 때와 신중하게 판단할 때

- **chapterId / customerTitle** CR-09 · 기회를 활용할 때와 신중하게 판단할 때
- **coreQuestion** 어떤 구간에 무엇이 활성화되며 판단 전에 어떤 조건을 살펴야 하는가?
- **primaryProducers** 검증된 세운·절기월의 LuckScopeState와 scoped Outcome / EventTiming.
- **supportingProducers** 대운 배경, Health timing, CR-04/08의 근거.
- **requiredSemanticSlots** 구간별 판정, 원인, 분야/대상, 실제 행동 시 고려 조건.
- **optionalSemanticSlots** 기회, 재물 활동, 관계 변화, 판단 유의, 기회와 부담 공존, 축·근거 간 방향 차이.
- **minimumEvidenceCoverage** 각 카드에 유효한 구간과 독립 평가 근거를 요구한다. 독립 구간 두 개 이상 또는 기회와 주의가 각각 하나 이상이면 semantic READY. 단일 관점의 유효 구간 한 개는 PARTIAL. 유효한 구간이 없으면 DEFERRED.
- **causeExplanationRequirement** 무엇이 어떤 조건에서 활성화되는지와 주의의 이유를 연결.
- **timingRequirement** 시작·끝과 부모 세운 및 축. 미래는 해당 구간에 별도로 평가된 Fact만 사용.
- **customerContextUse** 명시 이벤트의 자격과 실제 선택 기준에 사용.
- **crossChapterReuse** CH-9/10 상세, CH-5/6/7/8 참조. 같은 interval의 방향·부위·확정도 유지.
- **prohibitedInference** 좋은 달/나쁜 달 구분, 매매·처방, 분야 relevance 없는 월 추천.
- **partialPolicy** 근거 있는 카드만 노출 후보로 조립. 미평가 월을 중립 또는 유리로 채우지 않는다.

### 시간 장 공통 발행 기준

CR-04·08·09는 `semanticReadiness`와 `publicationReadiness`를 따로 기록한다. 발행은 장의 질문에 답하는 설명과 원인, 출처, 표현 밀도, 미지원 주장 및 중복 검사를 거친다. `current_change`, `long_term_transition`, `opportunity_window`, `caution_window`는 의미를 사용하는 역할이다. 동일한 Outcome을 재사용하면 원천 의미·대상·메커니즘·방향·확정도·기간이 보존되어야 한다.

## 건강의 교차 배치

CH-7의 근거는 내부에 유지한다. 무료 보충 카드는 원국의 독립·충분한 근거와 별도 상품/발행 승인을 조건으로 한다. v1은 무료 Health unit을 소비하지 않는다. 일간 대응만 있는 경우 전통 대응 소개까지만 허용한다. 04는 현재 실제 구조 혹은 운의 활성, 08은 독립 평가된 대운/세운 전환과 해당 Health 경로, 09는 유효한 세운/절기월의 국소 활성에 연결한다. 필요한 경우 동일 ID를 재사용한다.

[Health 발행 계약](22-health-publication-contract.md)의 H1–H3를 따른다. H1은 전통 대응을 소개하고, H2에서 경로와 부위가 각각 확인되면 전통 해석상 부담을 받기 쉬운 영역으로 표현할 수 있다. H3는 확인된 시기를 연결한다. 조건부 월은 부위 없이 리듬 수준이다. 장기의 의학적 약함, 질병·증상·발병, 사망·수명·사고·수술·치료·약·검사·식단·운동 처방은 금지한다.
