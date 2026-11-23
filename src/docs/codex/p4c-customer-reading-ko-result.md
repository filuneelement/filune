# FILUNE P4-C 고객 Assembly 및 한국어 결과

## 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| [customer/types.ts](../../lib/reading/customer/types.ts) | 5장 ID, 문단 역할, 의미·출처·원인 커버리지 계약과 한국어 품질 목표 |
| [buildCustomerReadingPlan.ts](../../lib/reading/customer/buildCustomerReadingPlan.ts) | 제품 범위에 따른 장 선택, 성향 슬롯의 결정론적 배치, 직접 연결된 반응, Outcome의 기간과 독립 assertion 배치 |
| [outcomeMapping.ts](../../lib/reading/customer/outcomeMapping.ts) | 승인 CL-M01~06 및 CL-R01~03 대응과 원인 없는 확정 결론의 fallback에 필요한 슬롯 |
| [renderCustomerReadingKo.ts](../../lib/reading/customer/renderCustomerReadingKo.ts) | 승인된 표현 식별자와 Fact의 한국어 표현, 기간 및 맥락, provenance 검사와 분량·밀도 메타데이터 |
| [personalityChapterProjection.ts](../../lib/reading/personalityChapterProjection.ts) | 이미 승인된 정보 선별 Fact를 정보 수용 축에 노출 |
| [singleResultCopy.ts](../../components/result/singleResultCopy.ts) | 한국어 결과의 무료 3장을 새 계획과 렌더러에 연결 |
| [BasicChartResult.tsx](../../components/BasicChartResult.tsx), [ResultChapter.tsx](../../components/result/ResultChapter.tsx) | 근거가 없는 한국어 장의 빈 상태 안내 |
| [verify-customer-reading-ko-p4c.mjs](../../../scripts/verify-customer-reading-ko-p4c.mjs) | 기존 검증 입력 5개의 재현, 관계·재물 내부 미리보기 및 전문·근거 출력 |

## Assembly와 Renderer

기존 B rev38 Assembly의 근거, 유효성, 고객 맥락에서 고객 장의 슬롯과 문단 역할을 선택한다. 기존 무료 라우팅에 없는 성향 Fact는 감사된 투영에 속하는 경우 같은 의미 키로 참조한다. 원천 ID, scope, 기간, certainty, CL 대응, 현실 기제, 원인 커버리지의 결정은 계획에서 끝난다. 같은 원인을 공유하는 독립 결과는 문단을 공유할 수 있고 모든 Outcome ID를 보존한다. 같은 설명이 다른 검증 범위에 재등장하면 해당 시기만 추가한다. 축적·유출·분배·비용 등 별도 근거가 필요한 슬롯에는 공백이 남는다.

KO Renderer는 정해진 표현과 Fact ID를 소비하고 기간·승인된 맥락을 문장으로 표현한다. 제목이나 메타데이터는 본문 글자 수에서 제외한다. 강조는 문단의 첫 핵심 결론을 표시하는 계획 메타데이터다. 관계·재물은 기존 유료 접근을 유지하며 아래 검증 도구로 내부 결과를 확인한다. Health, 기존 결제, 일본어·영어 결과에 새 표현을 연결하지 않았다.

```sh
node scripts/verify-customer-reading-ko-p4c.mjs --report
node scripts/verify-customer-reading-ko-p4c.mjs --json
```

JSON에는 문단별 실제 Fact ID, Outcome ID, 매핑과 기제, scope·periodRef, 기여 키, GAP, 전체 품질 메타데이터가 포함된다. 아래 전문에서는 근거 ID 대신 사람이 읽을 수 있는 Fact 의미와 Outcome 유형을 표기했다. A는 기존 성인 개발 fixture, B는 관계 Outcome이 확인된 CS-005의 2024년 평가, C는 재물 Outcome이 확인된 CS-126이다.

## Fixture A · CR-01 나의 기본 성향

PARTIAL · 544자 · 5문단 · 의미 5개.

스스로 해낸 일에 엄격한 기준을 적용하는 편입니다. 함께 만든 결과를 살필 때도, 자신의 몫을 돌아보며 무엇이 본인의 기준에 닿았고 무엇이 부족한지 세심하게 따져 보는 모습으로 읽힙니다.

밖에서는 비교적 넓은 범위의 사람들과 활발히 어울리는 모습이 먼저 보일 수 있습니다. 이미 가까운 사람만 찾기보다 새로 말을 나눌 접점에도 열려 있는 모습입니다.

조언을 받아도 결정은 한 번 더 자신의 기준을 통과해야 합니다. 예를 들어 두 가지 제안을 놓고 있다면 다른 사람이 골라 준 쪽을 곧바로 따르기보다, 어느 쪽이 자신의 판단 기준에 들어맞는지 따져 볼 수 있습니다.

새로운 정보를 접하면 그 안에서 받아들일 것과 더 확인할 것을 가르는 편으로 읽힙니다. 설명이 길거나 자료가 많더라도 전부를 같은 무게로 받아들이기보다, 판단에 쓸 근거를 선별하는 과정에 힘이 실립니다.

가까운 사이라도 의견을 꺼내는 때와 자리를 가려 보는 편입니다. 의견이 같아도 공개적으로 논의할 일과 따로 나눌 이야기를 구분할 수 있습니다. 관계의 친밀함과 그 자리에서 해야 할 말을 각각 판단하는 기질입니다.

- P1 · 자기 결과물에 엄격함 · CL-P01 · core:precision · natal · complete
- P2 · 넓고 활발한 교류 · CL-P01 · outward:broad_contact · natal · complete
- P3 · 조언을 들어도 스스로 납득한 뒤 움직임 · CL-P01 · decision:verify_before_acting · natal · complete
- P4 · 정보를 비판적으로 선별함 · CL-P01 · information:정보를 비판적으로 선별함 · natal · complete
- P5 · 때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함 · CL-P01 · relationship:때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함 · natal · complete

## Fixture A · CR-02 나의 강점

PARTIAL · 417자 · 4문단 · 의미 4개.

여러 조건이 한꺼번에 들어온 문제를 살피고 세부를 나누는 데 힘을 쓸 수 있습니다. 예를 들어 자료마다 결론이 다르면 어느 부분에서 판단의 근거가 갈리는지 살피는 일에 분석력이 쓰입니다.

함께 움직이는 힘은 공동으로 할 일이 분명할 때 쓰기 좋습니다. 각자 맡을 부분이 있는 과제에서 자기 몫을 챙기면서도, 서로의 움직임이 들어맞아야 결과가 나온다는 점을 살피는 방식입니다.

한 번 끝낸 작업을 다시 열어 보는 힘이 있습니다. 표와 원자료를 대조하거나 전달 직전에 빠진 부분을 살피는 일처럼, 완료 이후에 별도의 점검이 필요한 상황에서 이 행동이 강점이 됩니다.

여러 선택지 가운데 지금 붙잡을 만한 가능성을 알아차리는 힘도 읽힙니다. 같은 선택지를 늘어놓고 비교할 때, 이미 정해진 것만 보지 않고 새로 열려 있는 자리가 있는지 살피는 데 쓰입니다.

- P1 · 분석력 · CL-P01 · problem:분석력 · natal · complete
- P2 · 협동 · CL-P01 · collaboration:collaborate · natal · complete
- P3 · 완료한 작업도 다시 점검함 · CL-P01 · independent_ability:precision · natal · complete
- P4 · 기회 포착 · CL-P01 · independent_ability:기회 포착 · natal · complete

## Fixture A · CR-03 반복되는 행동 패턴

PARTIAL · 103자 · 1문단 · 의미 1개.

주변과의 마찰이 커지는 상황에서는 반발이 강해져, 요구를 그대로 받아들이기보다 이의를 드러내는 쪽으로 반응할 수 있습니다. 이런 반응을 살필 단서는 의견 차이가 커지는 순간에 있습니다.

- P1 · 사회적 마찰이 커지면 반항이 강해짐 · CL-P01 · friction_pushback · natal · complete

## Fixture B · CR-05 왜 관계에서 비슷한 일이 반복되는가

PARTIAL · 1173자 · 9문단 · 의미 9개.

밖에서는 비교적 넓은 범위의 사람들과 활발히 어울리는 모습이 먼저 보일 수 있습니다. 이미 가까운 사람만 찾기보다 새로 말을 나눌 접점에도 열려 있는 모습입니다.

사람을 만나는 자리에서도 모든 모임에 억지로 맞춰 들어가려 하지는 않는 편입니다. 함께할 기회가 있더라도 혼자 보내는 시간을 불편하게 여기지 않는 모습으로 읽힙니다.

가까운 사람과의 신뢰는 작은 접촉을 이어 가며 쌓는 편입니다. 한 차례의 강한 인상보다 말을 나눈 뒤의 태도가 꾸준한지, 주고받는 약속이 계속 이어지는지를 통해 관계가 자리 잡을 수 있습니다.

관계에서 서로의 의견에 같은 무게가 실리는 대화를 중요하게 여기는 편입니다. 결정을 앞두고 한 사람이 일방적으로 정하는 상황보다, 각자가 따로 생각할 수 있는 여지가 있을 때 의견을 나누기 수월할 수 있습니다. 교제 중이라면 가까워진 뒤 어떤 기대를 말로 나누는지가 이 이야기가 적용될 수 있는 장면입니다.

사람을 폭넓게 받아들이는 모습과 관계의 경계를 분명히 하는 모습이 함께 읽힙니다. 편하게 어울리더라도 본인이 중요하게 보는 기준을 넘는 상황에서는 받아들일 수 있는 범위를 단호하게 정할 수 있습니다.

가까운 관계를 나타내는 구조에 다른 요소가 맞물리며 접점이 열리거나 관계 구도가 조정될 가능성이 읽힙니다. 접촉과 변화 중 어느 쪽으로 전개되는지는 열려 있습니다. 이 해석은 한국 시간 2015년 8월 26일 19:30부터 2025년 8월 26일 19:30 직전까지의 흐름에 해당합니다.

관계에 관련된 여러 조건이 한 방향으로 모이고, 그 흐름을 실제로 돕는 별도 조건도 작동합니다. 접점이 가까운 관계로 이어질 수 있는 조건이 해당 기간에 함께 갖춰진다는 의미입니다. 이 해석은 한국 시간 2015년 8월 26일 19:30부터 2025년 8월 26일 19:30 직전까지의 흐름에 해당합니다.

해당 절기월에서도 보는 주제는 ‘관계의 접점이나 구도가 움직이는 신호’입니다. 이 해석은 한국 시간 2024년 1월 6일 05:49부터 2024년 2월 4일 17:26 직전까지의 흐름에 해당합니다.

관계의 접점을 만드는 작용에 가까운 관계를 지지하는 조건까지 함께 작동합니다. 새로운 접점이 생길 가능성과 별도로, 접점이 친밀한 관계로 이어질 기회도 읽을 수 있습니다. 이 해석은 한국 시간 2024년 1월 6일 05:49부터 2024년 2월 4일 17:26 직전까지의 흐름에 해당합니다.

- P1 · 넓고 활발한 교류 · CL-P01 · outward:broad_contact · natal · complete
- P2 · 집단에 섞이기 위해 억지로 움직이지 않으며 혼자 있는 상태를 크게 불편해하지 않음 · CL-P01 · relationship_style:집단에 섞이기 위해 억지로 움직이지 않으며 혼자 있는 상태를 크게 불편해하지 않음 · natal · complete
- P3 · 가까운 사람과 신뢰를 차곡차곡 쌓음 · CL-P01 · afterCloseness:가까운 사람과 신뢰를 차곡차곡 쌓음 · natal · complete
- P4 · 수평적인 대화와 동등한 대우를 중시함 · CL-P01 · communication:수평적인 대화와 동등한 대우를 중시함 · natal · complete
- P5 · 교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음 · CL-P01 · conflictMechanism:교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음 · natal · complete
- P6 · relationship_contact_signal · CL-R01 · palace_combination · daewoon · complete
- P7 · relationship_formation · CL-R02 · three_formation_with_active_stem · daewoon · complete
- P8 · relationship_contact_signal · CL-R01 · palace_combination · month · complete
- P9 · relationship_formation · CL-R02 · combination_with_active_stem · month · complete

## Fixture C · CR-07 돈을 만드는 방식과 돈을 지키는 힘

PARTIAL · 357자 · 3문단 · 의미 6개.

익힌 기술을 실제로 쓸 수 있는 결과물로 만들 때 수익과 연결될 가능성이 있습니다. 하는 일에서 기술을 익히는 과정과 그 기술이 고객이나 거래 상대에게 전달할 만큼 구체적인 산출물이 되는 과정을 나누어 보면, 수익화의 근거는 후자에 있습니다.

해당 절기년에서도 보는 주제는 ‘기술과 산출물이 수익으로 이어지는 흐름’입니다. 이 해석은 한국 시간 2027년 2월 4일 10:46부터 2028년 2월 4일 16:31 직전까지의 흐름에 해당합니다.

해당 절기월에서도 보는 주제는 ‘기술과 산출물이 수익으로 이어지는 흐름’입니다. 이 해석은 한국 시간 2027년 7월 7일 16:36부터 2027년 8월 8일 02:26 직전까지의 흐름에 해당합니다.

- P1 · money_acquisition / money_generation_method · CL-M01 · skill_production · natal · complete
- P2 · money_acquisition / money_generation_method · CL-M01 · skill_production · sewoon · complete
- P3 · money_acquisition / money_generation_method · CL-M01 · skill_production · month · complete

## 남은 GAP

- CR-01은 기본 기질·겉의 태도·판단·정보 선별·관계의 다섯 축을 표현했다. A의 직접 연결 반응은 CR-03에서 다뤘고, 스트레스의 원인이나 입증되지 않은 대비를 별도 문단으로 만들지 않았다. 본문은 분량 목표 미달이다.
- CR-02에는 문제 해결·협업·독립 능력이 있다. 출처가 없는 순위, 일의 성과, 과사용의 부작용은 보류했다.
- CR-03은 한 원천 Fact가 직접 연결한 반응 한 개를 표현했다. 결과와 되풀이의 원인이 확보되지 않아 PARTIAL_LOOP이며 완성 루프 수는 0이다.
- CR-05는 성향과 관계 Outcome을 분리했고 관계 접점·형성 기회를 각 기간으로 연결했다. 확인된 관계 시작·반복 인과 전체가 필요하다.
- CR-07의 C에서는 수익 획득·방식, 그 방식이 확인된 절기년과 절기월을 표현했다. 유지·유출·분배·비용·경쟁·축적은 C에서 독립 근거가 필요한 슬롯이다. 별도 검증에서는 실제 P4-I producer가 낸 획득 기회와 유지·축적 제약을 모두 유지했다. 현재 producer가 제공하는 유출·배분 합성 Fact를 둘로 확정하지 않는다. 재성이 필요한 인성을 손상하는 별도 돈 Outcome은 현재 producer의 결과에 포함되지 않는다.
- CR-04/06/08/09 및 Health 고객 Renderer는 이 버전의 결과 범위 밖에 있다.

## 테스트

- npm run build
- npx tsc -b
- git diff --check
- verify-customer-reading-ko-p4c.mjs · 서로 다른 명식 5개, 같은 입력의 반복, 역순 입력, 제품 범위, 출력 차이, 실제 관계/재물 Outcome, 재물의 획득·유지 공존, 기간·provenance, 원인 GAP, 한국어 결과 페이지 조립 경로
- verify-customer-reading-contract-p4.mjs 및 verify-personality-chapter-coverage-p4.mjs · 기존 prototype과 성향 커버리지 회귀

검증된 고객 출력에는 출처 참조 검사 위반과 중복 기여 키가 각각 0건이다. 지원 슬롯과 분량 목표가 모두 충족되면 품질 상태가 PASS가 된다. 계약의 기대 분량에 못 미친 본문은 PARTIAL로 남겼다. 렌더러 검증은 문단의 참조와 허용된 표현 경로를 검사하며 별도 출처가 없는 인과나 실제 사건을 확인하는 수단으로 사용하지 않는다.
