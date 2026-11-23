# P4 Reading Renderer Quality Reference

[17](17-cause-to-life-mapping.md) · [18](18-customer-chapter-content-contract.md) · [19](19-reading-narrative-blueprint.md)

## 읽기 자료와 현행 구조 감사

[07 사주풀이예시](../../source/primary/07-사주풀이예시.md)의 L128–145, L568–629, L889–915, L1008–1024에서는 먼저 판정이 작동하는 조건을 밝히고, 어떤 글자가 어떤 역할을 밀거나 막는지 따라간 뒤, 그 역할을 생활에서 수행하는 기능으로 번역한다. 이어 효과가 갈릴 수 있는 보호·악화 조건과 운의 범위를 연결한다. [일주풀이](../../source/personality/일주풀이.md)와 [십성](../../source/personality/십성.md)은 11·12에 승인된 성향 필드로 소비한다. [⑲-A 원자료](../../source/health/FILUNE-19A-premium-health-evidence.md)는 직접 전통 대응, 회고 사례, 전승 표, 추론, 추가 연구 제안을 구분해 사용한다. CS-034 원문에는 세운 검증이 비어 있고 CS-005 절기월 표는 적용 예시다. 두 사례 모두 누락된 scope를 메우는 증거로 사용하지 않는다. 원자료의 문구, 처방, 색상·향초·인테리어·음식·커피·운동·물건 정리/추천·임의 생활 루틴은 예시에서 가져오지 않는다.

| 계층 | 지금 확인된 구조 |
| --- | --- |
| Canonical / Judgment | `CalculatedChart`와 `LuckScopeState`의 판정·역할 이력/현재 기능·관계·효과·기간을 소비 가능. 08 및 15의 축·상속·유효기간 제약 유지. 현재 운/달력 평가가 가능한 범위와 모든 장에 필요한 연속 평가 범위는 다름. |
| Personality | `NatalPersonalityResult`에 Fact, 위치, prominence, DayPillar modifier, conflict, 역할 보정 및 provenance. `CurrentPersonalityResult`의 기간 있는 임시 발현을 별도로 소비 가능. 항목이 존재해도 완성된 행동 고리나 실제 이력의 증거가 생기지는 않음. |
| Outcome | `OutcomeFact`의 domain에 work가 예약되어 있으나 `src/lib/outcome/index.ts`와 `ReadingAssemblyInput`에 Work/Study producer 또는 input 없음. Money, Relationship, Health subset은 구현됨. Master 13의 초기 Outcome 미구현 문구는 현재 세 subset의 상태를 설명하지 않음. |
| Reading Assembly | `assembleReading`의 B 장 registry, semantic units, placement, provenance, gap, 범위/dedupe 처리 존재. 유료에서 명시 공급한 Money/Relationship/Health/EventTiming 수집. 현행 `customerRenderable: false`. 후속 구현은 정규화한 CustomerContext와 CR-01~03 성향 슬롯 근거를 제공한다. 전체 신규 고객 장/원인/문단 계획은 미구현. |
| Renderer | KO/JA/EN 성향 렌더러와 `singleResultCopy.ts`의 무료 3장 및 선택적 유료 미리보기 존재. 단일 UI는 Personality adapter를 소비하며 v1 전체 P4 Outcome·시기·신규 Blueprint를 렌더링하지 않음. 별도 궁합 렌더러는 2인 전용. |

근거는 [08 Luck](08-luck-master.md), [11 Personality](11-personality-master.md), [13 Assembly](13-reading-assembly-spec.md), [14 Outcome](14-outcome-semantic-spec.md), [현행 Assembly](../../../lib/reading/assembleReading.ts), [단일 결과 표현](../../../components/result/singleResultCopy.ts)이다.

### 9장 readiness

모든 고객 장에 신규 계약 표현을 연결하는 RENDERER_GAP이 있다. 표는 콘텐츠 입력의 준비 상태와 주된 추가 공백이다. 부분은 근거가 있는 슬롯을 조립할 수 있음을 뜻한다.

| 장 | 상태 | 확인 및 공백 |
| --- | --- | --- |
| 01 기본 성향 | PARTIAL · RENDERER_GAP | 성향 fact/위치/갈등은 사용 가능. 장별 축과 표현 깊이 연결 필요. |
| 02 강점 | PARTIAL · SOURCE_GAP | 강점 fact 사용 가능. 발휘·과사용의 인과 및 선두 선정 근거는 개별 확인. |
| 03 패턴 | PARTIAL · SOURCE_GAP | 판단·스트레스 단서 사용 가능. 반복 결과의 연결 근거 부족. |
| 04 현재 변화 | PARTIAL · ENGINE_GAP | 현재 평가·일부 Outcome 사용 가능. 변화 비교·분야/양축 전체 미완. |
| 05 관계 | PARTIAL · SOURCE_GAP | 관계 성향 및 접촉·변화·형성·일부 압박. 관계 발달·약속과 일부 갈등 기제 보류. |
| 06 일/환경 | PARTIAL · ENGINE_GAP · SOURCE_GAP | 성향 workStyle과 범위가 한정된 이벤트. Work/Study Outcome 없음. |
| 07 돈 | PARTIAL · SOURCE_GAP | 획득·방법·유지·합쳐진 유출/배분·관련 어려움·축적 지속성. 세분화와 일부 시기 보류. |
| 08 큰 전환 | PARTIAL · ENGINE_GAP | 평가된 대운 비교에 한해 사용. 연속 전환 세트와 변화 규모 근거 미완. |
| 09 기회/판단 | PARTIAL · ENGINE_GAP · SOURCE_GAP | 승인 EventTiming과 개별 국소 Fact. 전체 월 양축 판정 및 분야 관련성 공백. |

### Work와 Health의 경계

Work의 현행 의미는 Personality의 작업 방식·강점·역할 보정, Judgment의 비분야 구조 작용과 별도 Master 15의 계약·사업 시작/확장/조정/재편 사실 중 검증된 subset이다. [P4-D OUT-WORK-01~05](../../codex/p4d-outcome-semantic-source-audit-result.md#c-work--ch-4)의 직위 획득·유지, 일의 난제와 해소/공로, 조직·독립·직업군 적합성, 현재 일 방향과 월 relevance는 보류다. 학업 결과 및 입학·시험·전공 결과 producer도 없다. 명시된 직업 상태는 현실 장면에 적용한다.

| 건강 단계 | 고객 공개 범위 |
| --- | --- |
| 원국 | A I-16 승인 대응. 甲·丙·戊/己·辛·癸는 14의 허용 부위만, 乙·丁·庚·壬은 오행 소개까지. case/image-only 부위 제외. |
| 구조 | 해당 용신/상신 손상 또는 유효 해로운 칠살과 독립 Health target에 근거한 주의. 확인된 대상·경로·출처가 있으면 H2의 전통적 부담 표현 사용 가능. |
| 대운 | 정확한 대운에서 동일 Health 경로를 독립 평가하면 긴 배경 및 주의 기간. 전환 주장은 경계 양쪽 근거 필요. |
| 세운 | 별도로 평가한 연간 대상 및 활성·재현의 주의 기간. 장기 배경과 구분. |
| 월운 | 유효한 절기월과 부모 세운 및 국소 근거. 실제 영향 대상과 승인 대응이 확인되면 부위를 살필 기간. 조건부는 부위 생략. |

발병·장기 약화·구체 사건·회복을 일반화하지 않는다. [14 Level 1~4 및 publication gate](14-outcome-semantic-spec.md#health-source-contract) · [H1–H3 발행 계약](22-health-publication-contract.md)

## 비교 예시

아래 예시는 사실을 가정한 축약 QA 문단이다. 인용이나 고객 발행용 템플릿으로 쓰지 않는다. 완성본 역할과 분량은 [19](19-reading-narrative-blueprint.md)를 적용한다.

### 01 나의 기본 성향

- **GOOD SAMPLE** [겉의 행동·속의 판단 Fact가 모두 있을 때] 첫 만남에서는 대화를 먼저 시작하는 편으로 읽힙니다. 결과를 책임져야 하는 약속에서는 안쪽의 신중한 판단이 앞서, 어떤 조건인지 한 번 더 확인하고 답할 수 있습니다.
- **GOOD SAMPLE 2** [수용 스타일·스트레스 근거] 새로운 설명을 들으면 아는 것과 이어 붙여 정리하는 힘이 있습니다. 여러 요청이 한꺼번에 들어오면 연결할 기준부터 찾느라 바로 답하기 어려울 수 있습니다.
- **BAD SAMPLE** 이 일주이므로 타고난 부자이고 결혼은 늦습니다.

### 02 나의 강점

- **GOOD SAMPLE** [문제 정리 강점과 적용 근거] 요구가 여러 갈래로 나뉘었을 때 각각이 해결해야 하는 문제를 뽑아낼 수 있습니다. 팀 회의에서는 서로 다른 제안을 비교 가능한 선택지로 만드는 데 이 힘이 쓰입니다.
- **GOOD SAMPLE 2** [실험 강점과 과사용 근거] 목표가 분명하고 방법을 맡길 때 빠르게 예시를 만들어 대화를 진전시키기 쉽습니다. 검토 기준이 합의되기 전에는 결과부터 보여 주려는 속도가 오히려 재작업을 늘릴 수 있습니다.
- **BAD SAMPLE** 추진력, 분석력, 공감력이 당신의 객관적 상위 3개입니다.

### 03 반복되는 행동 패턴

- **GOOD SAMPLE** [검토 루프 근거] 요청 범위가 모호할 때 조건을 더 알아야 답할 수 있다고 판단해 결정을 미루기 쉽습니다. 답을 기다리는 상대가 설명 없이 같은 요청을 반복하면 모호함이 그대로 남아 검토도 반복될 수 있습니다.
- **GOOD SAMPLE 2** [독립적인 실험 루프 근거] 방식이 막히면 문제를 쪼개 작은 시도로 확인하려는 반응이 먼저 나올 수 있습니다. 짧은 실험으로 답을 얻었던 상황과 비슷해 보이면 그 방식을 다시 택하기 쉽고, 합의가 필요한 환경에서는 조율이 뒤로 밀릴 수 있습니다.
- **BAD SAMPLE** 소심해서 언제나 결정을 못 합니다.

### 04 지금 내 삶에서 무엇이 달라지고 있는가

- **GOOD SAMPLE** [원국·대운·세운·해당 이벤트 각각 확인] 대운에서 계약을 진행할 배경이 열려 있어도, 올해는 진행을 늦추는 별도 작용이 확인됩니다. 계약 논의와 실제 마무리의 속도를 따로 보는 기간입니다.
- **GOOD SAMPLE 2** [재물 획득·관련 부담이 같은 연에 독립 확인] 결과물을 수익으로 연결하는 힘이 살아나는 한편, 재물 경로가 부담을 높이는 작용도 있습니다. 새 수익과 그 수익에 따르는 책임을 나누어 볼 때 지금 달라지는 부분이 드러납니다.
- **BAD SAMPLE** 올해 변화운이니 곧 승진하고 권한이 커집니다.

### 05 왜 관계에서 비슷한 일이 반복되는가

- **GOOD SAMPLE** [A층] 처음에는 공통 관심사를 이야기하면서 가까워지기 쉽습니다. 더 가까워졌을 때 기대가 모호하면 질문하기 전에 뜻을 오래 해석하는 반응이 나올 수 있어, 확인되지 않은 기대가 다음 대화에도 남을 수 있습니다.
- **GOOD SAMPLE 2** [B층, CL-R03] 이번 평가 구간에는 자기 방식으로 표현하는 힘이 관계에서 기대되는 역할과 부딪히는 압박이 읽힙니다. 관계의 변화 자체나 상대의 의중과 별개로, 같은 약속을 서로 어떻게 이해했는지가 살펴볼 조건입니다.
- **BAD SAMPLE** 직설적인 성격이니 연인이 떠날 것입니다.

### 06 어떤 일과 환경에서 내 강점이 가장 잘 살아나는가

- **GOOD SAMPLE** [일 방식 Fact] 문제와 확인 기준이 주어진 뒤 방법을 설계할 여지가 있을 때 일의 강점이 드러날 수 있습니다. 재직자라면 답을 먼저 요구받는 자리보다 초안을 공유하고 검토할 수 있는 역할에서 그 방식을 쓰기 쉽습니다.
- **GOOD SAMPLE 2** [학생 비발행 CL-S04] 이 학업 가정에서는 학습을 받치는 인성의 기능이 재성의 작동으로 손상됩니다. 생활에서는 당장 정답이나 점수가 보이는 단계로 서둘러 넘어가, 배운 내용을 설명하고 복습할 시간이 줄어드는 식으로 나타날 수 있습니다.
- **BAD SAMPLE** 상관이 있으니 시험에 약하고 창업하면 성공합니다.

### 07 돈을 만드는 방식과 돈을 지키는 힘

- **GOOD SAMPLE** [CL-M01·CL-M03 각각 확인] 기술로 만든 결과물이 수익을 낼 수 있습니다. 별도로 재물을 감당하는 힘에 제약이 있어, 수익이 생긴 뒤 오래 남겨 축적하는 힘에는 다른 조건이 필요합니다.
- **GOOD SAMPLE 2** [CL-M04 및 CL-M05의 독립 조건] 재물에 실제 손상이 닿는 구간에는 수익 일부가 나뉘거나 빠져나갈 수 있습니다. 보호가 작동하는 경로도 있어, 수익을 내는 것과 배분 조건을 통해 남기는 것을 따로 살펴볼 구간입니다.
- **BAD SAMPLE** 재물 점수가 높으니 이달에 투자하면 벌고 남깁니다.

### 08 앞으로 삶의 흐름이 크게 바뀌는 때

- **GOOD SAMPLE** [대운 경계 양쪽 평가] 다음 대운에는 지금까지 작동하던 방해 경로가 약해지고 보호 기능은 유지됩니다. 전환의 의미는 두 기능의 강도가 달라지는 데 있으며, 새 대운 전반의 배경으로 이어집니다.
- **GOOD SAMPLE 2** [별도 연 활성] 장기 보호가 이어지는 가운데 다음 절기년에는 그 보호가 실제 대상과 연결됩니다. 대운에서 생긴 조건과 올해 실제 활성의 구간을 함께 읽을 때 변화의 시점이 분명해집니다.
- **BAD SAMPLE** 대운 간지가 바뀌는 해에 이직과 이사가 모두 일어납니다.

### 09 기회를 활용할 때와 신중하게 판단할 때

- **GOOD SAMPLE** [동일 절기월의 승인 계약 facts] 계약을 진행할 근거와 조율이 늦어질 근거가 함께 확인됩니다. 이 구간에는 합의가 시작되는지와 세부 조건까지 확정됐는지를 각각 살펴볼 수 있습니다.
- **GOOD SAMPLE 2** [국소 관계 변화와 조건부 Health] 이 절기월에는 관계의 접점이 달라질 신호가 있어, 만남이 실제 약속으로 이어지는 조건을 살펴볼 수 있습니다. 몸의 리듬은 가볍게 살펴볼 시기입니다.
- **BAD SAMPLE** 5월은 최악의 달이니 계약을 피하고 특정 음식으로 건강을 회복하세요.

## 실행 가능한 Assembly fixture

`node scripts/verify-customer-reading-contract-p4.mjs`는 검증된 세 출생 입력에 테스트 맥락을 붙이고 각 한 장의 기초 Assembly projection과 공백을 JSON으로 출력한다. 학생·재직·사업 상태는 테스트 라벨이며, 명식이나 실존 인물의 상태를 뜻하지 않는다. 테스트 선언과 결과는 프로덕션 Assembly 또는 Renderer에 주입하지 않는다.

- 학생 CS-127 · CR-06. 학습 방식에 사용할 성향 Fact와 Work/Study gap. 별도 비발행 동일 `study_difficulty` 입력에 CL-S01(또래 경쟁으로 집중 분산), CL-S02(학습 흡수·축적의 손상), CL-S03(직접 실험하려는 방식과 학교 요구의 마찰), CL-S04(당장 보이는 성과에 학습 과정이 밀림)를 비교.
- 재직자 CS-005 · CR-01. 기본 기질과 판단 Fact를 원국 성향 슬롯에 연결. 직업 상태는 범위를 바꾸지 않음.
- 사업자 CS-126 · CR-07. 실제 MoneyOutcomeFact에서 원국 획득과 방식의 근거(CL-M01)를 분리 출력. 유지가 미확정이며 비용·금액·시기는 이 예시의 원국 투영에 포함하지 않음.

추가 연구는 Work/Study relevance와 보호·역조건, 행동 루프 연결, 관계의 약속/발달 및 일부 갈등, 돈의 유출 세분화와 추가 분야 시기, 건강의 추가 부위·완화 공개 권한에 필요하다. 현재 자료로는 승인 subset의 규칙 데이터화, context adapter, 슬롯/문단 plan, provenance QA, 기존 부분 결과의 locale 표현 구현이 가능하다. 별도의 엔진 의존성은 비교 가능한 전체 기간, 월 양축 최종 결과, Work/Study producer, 새 입력 경로다.
