# P4 Cause-to-Life Mapping Registry

고객 조립 계약. 구조 판정은 [08](08-luck-master.md), 성향은 [11](11-personality-master.md)과 [12](12-personality-knowledge-schema.md), 분야 판정은 [14](14-outcome-semantic-spec.md)와 [15](15-event-timing-spec.md), 공개 범위와 표현은 [13](13-reading-assembly-spec.md) 및 [B rev38](../../source/authority/B_rev38.md)을 따른다. 이 레지스트리의 승인은 해당 원천 의미를 고객 장면으로 전개할 수 있다는 뜻이다. 계산·분야 판정·발행 권한은 각 원천에서 유지한다.

## 읽기 순서와 입력

1. 기존 Outcome 또는 Personality assertion의 대상·범위·기간·확정도와 원천 ID를 고정한다. 연결된 Judgment의 actor → relation → target → actual function/effect와 보호·통관·손상 근거를 해결한다. RoleHistory는 귀속만 제공한다. 실제 발생 여부는 CurrentRole, Runtime, ActualStructuralFunction 및 평가된 luck effect를 읽는다.
2. 같은 대상과 기간에 승인된 규칙의 필수 Fact와 상태를 전부 확인한다. Natal → Daewoon → Sewoon → Month에서 장기 배경, 연 활성, 월 구체화를 유지한다. 월에는 유효한 절입 구간, 부모 세운, 직접 참여 또는 허용된 상위 상태 및 독립 로컬 근거를 요구한다. 축을 보존하고 서로 다른 방향은 각각 출력한다. Reduced는 감쇠를 명시하고, conditional은 조건과 함께 출력한다. Inactive·stopped는 활성 근거에서 제외하고 expired는 이력에만 사용한다.
3. 승인된 현실 기제와 고객 맥락에 맞는 예시를 선택한다. 기본 순서는 판정 → 구조적 원인 → 현실에서의 기능 → 가능한 장면 → 도움 → 악화 → 해당 시기 → 기억할 판단 기준이다. 별도 근거를 가진 도움·악화만 사용한다. 원인이나 시기가 비면 해당 슬롯을 보류한다.
4. 같은 결과의 다른 원인은 각각 유지한다. 여러 경로가 하나의 역할을 공유해도 독립 근거 없이 원인 수를 늘리지 않는다. 경로 충돌이 동일 주장에 걸리면 승인된 상위 해결 결과를 따르고, 해결이 없으면 경쟁 설명 또는 공백을 보존한다.

```ts
// 제안 타입. 기존 lib/reading 및 lib/outcome의 타입을 참조한다.
interface CauseToLifeMappingRule {
  readonly id: string
  readonly status: 'approved_subset' | 'candidate'
  readonly causeType: string
  readonly requiredFacts: readonly ReadingMeaningRef['kind'][]
  readonly requiredStates: readonly string[] // 아래 행의 명시적 판정 조건을 구현한 predicate ID
  readonly targetDomains: readonly (OutcomeFact['domain'] | 'personality' | 'event_timing')[]
  readonly targetSemantics: readonly string[] // producer semanticType, profile field 또는 eventType
  readonly precedenceWithinSamePath?: readonly string[] // 구체적 규칙이 대체하는 후보 ID
  readonly allowedScopes: readonly ReadingScope[]
  readonly allowedContexts?: readonly ('student' | 'job_seeking' | 'employed' | 'business' | 'single' | 'dating' | 'married')[]
  readonly lifeMechanisms: readonly { id: string; allowedMeanings: readonly string[] }[]
  readonly prohibitedShortcuts: readonly string[]
  readonly sourceRefs: readonly string[]
  readonly certaintyPolicy: 'inherit_and_preserve_conditions' | 'publication_restricted'
}
```

조립 결과는 mapping ID, mechanism ID, 원천 record/Fact/participant/role/effect ID, 대상, 축, scope ID, 유효기간과 certainty/lifecycle을 참조한다. 문자열 기제 ID는 문장 템플릿과 별개다. 판정에는 원천보다 강한 확정도를 부여하지 않는다. 현실 장면은 고객이 제공한 사실로 명시하지 않는 한 가능성의 예시로 표현한다.

## 승인 범위

아래 행은 해당 producer Fact와 연결된 원천 경로의 범위에 적용한다. 하위 세운·월운은 producer가 해당 범위에서 평가한 동일 assertion만 사용한다. 번호는 이 계약의 식별자이며 원천 규칙 번호와 별개다. [H1–H3 발행 계약](22-health-publication-contract.md)을 건강 문구에 적용한다. 출처 약칭은 [A rev182](../../source/authority/A_rev182.md), [D rev155](../../source/authority/D_rev155.md), [02 용신론](../../source/primary/02-용신론.md), [07 사주풀이예시](../../source/primary/07-사주풀이예시.md), [⑲-A 건강 근거](../../source/health/FILUNE-19A-premium-health-evidence.md)를 가리킨다.

| ID · 대상 | 필수 경로와 작동 | 현실 기제 및 제한 | Authority |
| --- | --- | --- | --- |
| CL-P01 · Personality | 출처가 있는 trait + 위치/발현 또는 승인된 modifier. 긴장은 conflict의 양쪽 Fact와 상황 근거 | 밖에서 드러나는 방식, 가까운 관계에서의 판단, 일·협업에서의 행동 성향. 직위·성과·실제 관계 사건으로 확대 금지 | 11·12, [일주풀이](../../source/personality/일주풀이.md), [십성](../../source/personality/십성.md) |
| CL-M01 · 획득·획득 방식 | 실제 食神→財 생산 경로 및 획득/방식 Fact | 기술·생산 결과의 수익화 가능성. 액수·안정성 제외 | 14 OUT-MONEY-01, 02 용신론, 07 L1256 |
| CL-M02 · 획득·획득 방식 | 실제 傷官→財 경로와 별도 통과한 획득/방식 Fact | 독창적 표현·기지로 만드는 결과의 수익화 가능성 | 14 OUT-MONEY-01 별도 gate, 07 L764·984 |
| CL-M03 · 유지·축적 지속성 | 적용 구조에서 財를 감당하는 힘의 부족이 확인되고 유지·기간 Fact가 각각 존재 | 들어오는 수익을 남기거나 계속 축적하기 어려운 조건. 유출·원인 주체 자동 추정 금지 | OUT-MONEY-02, 04·06, 07 L140–144·1117 |
| CL-M04 · 유지·유출/배분 | 관련 財에 실제로 도달한 손상과 각각의 Fact, 보호·통관 확인 | 경쟁·배분 또는 유출 가능성. 경쟁 주체·동업 비용은 독립 근거가 있을 때만 구체화 | OUT-MONEY-02/04, 07 L140–144·1250–1251 |
| CL-M05 · 유지 보호 | 유지 보호 Fact와 유효한 보호 경로 | 수익을 남기는 기능을 보호. 피해·유출 Fact와 공존 가능 | OUT-MONEY-02, 07 L1067·2322 |
| CL-M06 · 재물 관련 부담 | 실제 財生殺 또는 財가 필요한 印 등을 손상한 승인 경로와 money problem Fact | 전자는 수익 관련 활동에 따른 압박, 후자는 결과 추구가 필요한 기반을 누르는 문제. 지출·확장·문서·실제 책임 증가를 특정하려면 별도 근거 필요 | OUT-MONEY-04, 07 L162·1262·1273, 06 PP-503 |
| CL-R01 · 접촉/변화 | 유효한 일지 대상 합/충과 scope 참여자, 해당 signal Fact | 접점 또는 관계 구도 변화. 합의 접촉/변화 모호성 및 충의 변화 범위 보존 | A I-22, OP-R01/R03, 14 OUT-REL-02 |
| CL-R02 · 형성 기회 | 유효한 육합 또는 완전한 삼합과 같은 scope의 자격 있는 활성 천간, formation Fact | 가까운 관계를 만들 기회. 관계 상태·혼인·성사 추정 금지 | 14 Relationship expansion, A I-22①, 07 L202–207, B W-88 |
| CL-R03 · 관계 압박 | 관련 배우자 표지인 정관에 닿는 승인 OFF-03 경로와 operating/reduced 손상, pressure Fact | 표현과 관계에서 기대되는 역할 사이의 압박 가능성. 상대 행동·이별·제3자 추정 금지 | A I-15·OP-R03, 14, 07 L762–765 |
| CL-H01 · 전통 신체 대응 | Canonical 일간·오행과 대응 Fact | 전통 대응 소개. 주의 부위·약함 판정은 여기서 생성 금지 | A I-16, B W-30, [⑲-A A/B/F](../../source/health/FILUNE-19A-premium-health-evidence.md), 14 OUT-HEALTH-01 |
| CL-H02 · 구조 부담 | 실제 용신/상신 압박 또는 유효한 해로운 칠살 경로, 독립 Health target 및 burden Fact | 전통적 주의 근거. 부위는 승인된 피해 대상과 별도 연결 시에만. 필요한 칠살, 단순 합·오행 부족은 제외 | 14 OUT-HEALTH-02, ⑲-A B–F, B 7-2/W-35, A OP-P06/P07 |
| CL-H03 · 주의 시기 | CL-H02의 동일 경로와 독립 평가된 국소 활성·재활성, 확정 구간 및 attention period Fact | 해당 기간의 주의. 조건부면 부위 생략. 종료와 회복은 별도 권한 | 14 Level 3, ⑲-A C–F, B W-30–35, D Q10 |
| CL-E01 · 계약·사업 시기 | Master 15에서 승인되어 실제 채택된 EventTimingFact와 같은 event target의 근거·조건·구간 | 계획·진행 관련 기회, 조정·지연·부담 등 승인된 방향만. 일반 취업, 직업 적성·성공, 학업으로 확대 금지 | [15 §6A·§7](15-event-timing-spec.md) |

## 학업 후보 및 역조건

아래 네 후보는 [07 사주풀이예시](../../source/primary/07-사주풀이예시.md)의 사례를 분해한 것이다. Runtime의 `study_difficulty` producer, 대상 적격성, 일반화 검증과 공개 승인에는 공백이 있다. [후속 감사](21-work-study-outcome-source-audit.md)에서 네 경로 모두 CONDITIONAL로 판정했다. 실제 학업 대상 연결·producer·발행에 필요한 양성 및 반례 fixture를 확보하기 전에는 프로덕션에서 활성화하지 않는다. 테스트에서만 동일 결과와 네 가지 가상의 구조 근거를 조합한다.

| 후보 ID | 같은 결과에 필요한 별도 구조·상태 | 가능한 생활 장면 | 출처와 역조건 |
| --- | --- | --- | --- |
| CL-S01 | 작동 중인 비겁·겁재 경로가 경쟁을 통해 학습 집중에 실제 불리하게 연결됨 | 또래·친구·경쟁·바깥 활동으로 주의가 분산되어 자기 속도가 밀림 | 07 L134–135. 07 L140–144의 지지·보호 가능성 보존. 친구 또는 가족 문제 확정 금지. |
| CL-S02 | 학습에 필요한 印의 흡수·축적 기능 손상이 확인됨. 공격자가 확인되지 않으면 특정 금지 | 배운 내용을 쌓고 복습·시험 준비를 이어가기 어려움. 교사·문서는 그 대상의 근거가 있는 경우에만 | 07 L574–577·619–623. 실제 印 지원 경로는 학습 축적에 도움을 줄 수 있음(07 L1426). |
| CL-S03 | 작동 중인 傷官의 표현 기능과 정형 학습 환경의 충돌이 입증됨 | 실험·자기 방식·즉각적인 결과물에 힘이 실려 학교·시험 방식과 마찰 가능 | 07 L892–895, L1013–1024. 유효한 표현 기능이 학습·모방을 돕는 반례도 있음. |
| CL-S04 | 財가 필요한 印에 작동 중인 손상을 실제로 가하고, 학습 주장이 그 경로에 연결됨 | 빠른 결과나 현실 보상에 관심이 쏠려 이해·복습의 시간이 줄어들 수 있음 | 07 L574–577·610–624. 財의 결과 지향이 유용한 경우도 있음(07 L1022). CL-S02와 동일 손상 경로는 한 원인으로 묶고 구체적인 S04를 우선. |

## Context와 원인 공백

실제 `CustomerContext`는 `name?`, `question?`, `knownFacts?`이고 v1 Assembly는 허용 상태만 정규화한다. 정규화된 상태는 의미나 판정을 바꾸지 않는다. 단일 UI는 관심사를 받고 관계 `single/dating/married`, 직업 `job_seeking/employed/business`를 별도로 보관하여 기존 결과 표현에 전달한다. 학생 상태는 수집하지 않는다. 단일 결과 어댑터는 해당 UI 상태를 검증해 `knownFacts.careerStatus`와 `knownFacts.relationshipStatus`에 투영하고, 명시 입력이 생기면 `knownFacts.lifeStage = student`를 허용한다. 학생과 직장 상태의 공존은 해당 슬롯의 명시 대상에 따라 선택하고 대상이 애매하면 중립 장면을 사용한다. 미입력·미인식·상충 값은 미상으로 유지한다. 나이, 이름, 자유서술, 관계 표지에서 상태를 추정하지 않는다.

같은 승인 경쟁 기제라도 학생은 친구·또래·학업 환경, 재직자는 동료·성과 경쟁·업무 역할, 사업자는 경쟁자·동업·수익 배분이 가능한 장면이다. 각 장면은 해당 target 의미가 허용할 때만 사용한다. 예를 들어 돈의 배분을 다루는 Fact에 공부 방해 장면을 붙일 수 없다. 명시된 사업·계약 계획은 15의 별도 입력 자격을 따르며 직업 상태만으로 계획을 생성하지 않는다.

주요 assertion마다 `causeAvailable`, `lifeMappingAvailable`, `reasonStatus: complete | partial`을 기록한다. 원천 연결·런타임 증거가 빠지면 engine gap, 승인된 대응이 없으면 source gap, 의미는 준비되었으나 표현을 구현하지 못하면 renderer gap이다. 결론의 출처와 확정도는 유지한다. 조건이 충족되지 않은 경로는 적용 제외이며, 아직 검사할 증거가 오지 않은 경로와 구별한다. 조건부 사실도 원인과 조건이 확인되면 reason coverage는 complete일 수 있다.
