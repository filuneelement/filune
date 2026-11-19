# FILUNE P4-A Multilingual Reading Result Assembly Contract Audit

## A. 전체 판정

**`READY_FOR_READING_ASSEMBLY_CORE`**  
**`OUTCOME_LAYER_NOT_IMPLEMENTED`**

공통 조립 코어는 근거가 있는 장과 공백을 같은 구조로 표시할 수 있다. 전체 유료 감정서 발행은 별도다. 가장 큰 공백은 OP-L03의 최종 천간·지지 방향, 장별 선정 기준, 분야별 의미 투영이다. 현재 제공되는 개별 구조 작용과 월 스냅샷은 그대로 소비할 수 있다. 이번 단계에는 명리 규칙이나 애플리케이션 코드를 추가하지 않았다. [13 조립 계약 초안](../rules/master/13-reading-assembly-spec.md)

기준은 B rev38 및 매핑, A rev182의 현행 판정 계약, master 01~12, localization 원문과 그 권한 매핑이다. 실제 localization 원문 확장자는 `.m`이다. [B rev38](../source/authority/B_rev38.md) · [B 렌더링 매핑](../rules/authority/mapping-B-rendering.md) · [A rev182](../source/authority/A_rev182.md) · [Localization 원문](../source/localization/FILUNE-ja-en-terminology-rendering-standard.m) · [Localization Authority Mapping](../rules/authority/mapping-localization.md)

## B. Chapter Coverage

READY는 필수 내용의 데이터가 확보되었음을 뜻한다. PARTIAL은 기존 결과에서 안전하게 조립할 수 있는 일부만 있다. SOURCE_GAP은 확정 선택·해석 승인 공백, ENGINE_GAP은 계약 또는 데이터 생산 미구현, RENDERER_GAP은 지원되는 결과의 고객 표현 공백이다. 각 행의 종합 상태는 가장 직접적인 제약 또는 재사용 가능한 범위를 표시한다. 고정 장 전부를 발행할 수 있는 상태는 아니다.

| ID | 절·장 | 필요한 내부 정보 | 현재 source | 현재 engine | 현재 renderer | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
| F-① | 태어난 순간 | 출생 입력/출처, 절입·시주 경계, 원국, 계절·월령, 자연 비유, 열쇠 3~4개 | B F-①·W-03/W-97, A C-01~03/C-12/I-01, localization B-3 | `CalculatedChart`의 recorded/effective clock, 절기 경계, 8글자 상태, 월지 및 core 월령. C-12 출처 구분, 시주 경계 판정 및 B의 보류 게이트, 열쇠 선정은 완전한 출력 없음 | 차트·일간/일지 UI 및 locale element labels. B의 장면/명식표 완성 문장 없음 | PARTIAL |
| F-② | 가장 잘 드러나는 특징 세 가지 | 격, 역할, 투출·통근, 합충, 성패, 정확한 세 가지 선정, 실제 삶의 발현·조건 | B F-②, A I-01~11, master 01~07. 확정 구조 우선·미확정 제외만 규정 | `patternContext`, `actualFunctions`, 관계·역할·근거는 존재. 일반 성패 보류, 세 가지 선정과 분야 투영 없음 | 구조 고객 렌더러 없음 | SOURCE_GAP |
| F-③ | 성격과 사람을 대하는 방식 | 겉·가까운 사람·판단·감정 네 면과 각 면의 근거 | B F-③·W-40~43, A I-15, master 11~12 | 네 면 대응 Fact 및 provenance, 위치·역할·충돌. 차트에 따라 면별 근거가 없을 수 있음 | KO/JA/EN에 `outward`, `closeRelations`, `decision`, `emotion`이 있으나 optional. B의 단락당 자연 비유 근거와 무료용 길이·첫 배치 계약 없음 | PARTIAL |
| F-④ | 타고난 강점과 반복되는 과제 | 상신·병·구응과 공통 뿌리, 정확히 강점 3·과제 3 선정 | B F-④, A I-03/I-04, master 05·11~12. 임의 선정 기준 없음 | strength/shadow/growth 및 구조 근거는 후보. 3+3 및 공통 원인 짝짓기 결과 없음 | strength/caution 블록 재사용 가능, B의 짝 표 없음 | SOURCE_GAP |
| F-link | 여기서 더 들어가면 | B에 정한 유료 주제 목록 | B F-링크 | 계산 불필요 | B 전용 안내 카피 없음. 정적 목차로 조립 가능 | READY |
| CH-1 | 타고난 운명의 설계도 | 격·역할·관계도, 거리·닿음, 도움·부담 정의, 현재 대운·교운 | B CH-1·W-90~98, A I-01~06/I-09/I-13, master 01~09 | 관계와 국소 작용, 현재 대운 유효기간 재사용 가능. 일반 거리 효과·전역 도움/부담·교운 양쪽 요약 없음 | 장 렌더러 없음 | PARTIAL |
| CH-2 | 나라는 사람의 본모습 | 일곱 면별 원국 Fact, 근거, 장면, 대가 | B CH-2·W-12/W-40~43, A I-11/I-15, master 11~12 | 성격 Fact·위치 맥락은 존재. B 일곱 면 전용 결과, 책임감 독립 슬롯 및 일관된 장면·대가는 없음 | 다국어 Personality 문구는 가능. 일곱 면 선택·장별 심화 표현 없음 | PARTIAL |
| CH-3 | 타고난 강점과 넘어야 할 과제 | F-④ 공통 선택, 작동 조건·상함·구응, 사용할 수 있는 근거 있는 대응 | B CH-3·B-6, A I-04, master 05·11~12 | 역할의 작동·약화·방해·보호 근거 일부. 선택 3+3, 공통 뿌리·대응 결과 없음 | Personality 강점·주의 문구만 존재. 작동/대응 심화 장 없음 | PARTIAL |
| CH-4 | 일과 성공이 열리는 방향 | 일의 방식, 조직/독립, 성과 조건, 대운 방향, 일 관련 월 | B CH-4·W-13/W-53, A I-12/I-14. 장 요구와 사례는 있으나 일반 직업·월별 영역 변환 계약 부족 | Personality `work`와 구조 근거만 있음. 성공·직업군·일 관련 월 결과 없음 | 선택 주제 UI는 표시 자리. 고객 결과 없음 | SOURCE_GAP |
| CH-5 | 돈이 들어오고 머무는 흐름 | 유입·유지·부담 조건, 계약/사업/지출/협업 시기 및 원칙 | B CH-5·W-11/W-13/W-52, A I-04/I-05/I-14, master 06~07. 구조 규칙은 존재, 돈의 결과·행동 일반 변환 부족 | 재성 위치·정편·통근, 구조적 경로 가능. 유입·유지·네 종류 시기 결과 없음 | 주제 자리만 있음 | SOURCE_GAP |
| CH-6 | 사랑과 평생의 인연 | 일지·육친 자리, 일지/운 관계, 인연/변화/성사/유리한 발전 구분 | B CH-6·W-50~56/W-87~89, A I-15/I-22/OP-R03. 육친 부재는 원문 제약 유지 | 관계 성향·일지·합충은 존재. 네 가지 시기 평가 및 가족 맥락 결과 없음 | 가까운 사람 성격만 재사용 가능. 관계 장 없음 | ENGINE_GAP |
| CH-7 | 몸과 건강의 흐름 | 전통 대응, 실제 구조 부담 근거, 시기와 제한된 관리 표현 | B CH-7·W-30~35, A I-16. 전통 대응과 표현 제한만 승인 | 오행·역할/월별 작용 근거는 존재. 안전한 신체 대응·월 선별의 전용 결과 없음 | 건강 장/안전 표현 전용 렌더러 없음 | ENGINE_GAP |
| CH-8 | 인생의 큰 운명 지도 | 출생 이후 과거·현재·다음 대운과 역할 작용·전환 | B CH-8·W-20~23, A C-05~07/I-12/I-13, master 08~09 | 대운 cards 8개 및 가능한 경우 기간, 활성 대운 snapshot과 이력. 과거~다음 전체 평가 묶음·분야/체감 없음 | 달력 카드만 존재. 대운 장 없음 | PARTIAL |
| CH-9 | 올해와 내년에 다가오는 운 | 절기년 2개, 각 해 바탕과 동일 월 참조 | B CH-9·W-13/W-93, A C-11/I-12/I-14/OP-L03, master 08~09 | 올해·내년 달력 cards 생성. 내부 읽기는 기준 시점의 세운만 노출. 두 해의 최종 축별 판정·내년 전체 계절 뷰 없음 | 달력 카드만 존재 | PARTIAL |
| CH-10 | 앞으로의 12개월 | 구매 절기월의 12기간, 월별 양축 방향·반대 근거, 비교·중심 영역·사용 안내 | B CH-10·W-13/W-14/W-93, A I-14/OP-L03, master 08~10 | 명시적으로 지정한 시작 월부터 12개 구조 스냅샷 존재. 구매 instant→시작 월 연결, 최종 양축 방향, 영역·행동 계약 없음 | 절기월 달력 UI만 존재 | PARTIAL |
| CH-11 | 마지막 안내 | CH-1/3/8/10의 참조, 기억할 셋, 동일 방향 월 구간, 10년 사용법·마지막 말 | B CH-11·B-6. 새 판단 제한, 기억할 셋 선택 우선순위 없음 | 일부 참조 원재료 존재. 선정·리듬·활용 계약 없음 | 종합 장 없음 | SOURCE_GAP |
| CH-Q | 개인 질문에 대한 답 | 고객 제공 질문·사실, 관련 장과 월 키, 직접 답·올해/내년 표 | B CH-Q·W-11/W-99, B-6. 비지원 질문 제외 | 질문→기존 판단 라우팅 출력 없음. 월·분야 공백도 상속 | 선택 주제 UI는 `reading?`만 표시 | ENGINE_GAP |

투자 자산 매매, 생사·질병 예측, 궁합 서비스와 고객 미제공 사건 단정은 해당 부분이 **OUT_OF_SCOPE**다. CH-7의 승인된 전통 대응 및 제한된 표현은 그 범위에 포함하지 않는다. F-link는 B에 정해진 주제 안내의 조립만 가능하다. 유료 제공 여부를 보증할 근거는 별도다.

### F-①과 F-③ 적용 경계

F-①에는 출생정보·일간 자연 비유를 담을 수 있다. 전체 Personality는 F-③의 책임이다. Canonical의 `SolarTermContext.evaluation`은 전후 절입과 입춘을 제공하고 `ambiguousOnRecordedDate` 및 `Uncertainty`가 불확실성을 표시한다. 이는 F-①의 ±1일 발행 보류 게이트나 시주 경계 양안 고객 계약과 같은 출력이 아니다. `BirthInput`에는 recorded/known 정보가 있지만 C-12의 원고·사용자·역산 출처를 별도 구분하는 필드가 없다. B F-①·B-6의 작성 보류와 W-97의 경계 표현은 기능별 적용 범위를 확인할 때까지 그대로 보존한다.

F-③의 네 블록은 기존 다국어 렌더러의 키와 의미상 대응한다. Optional 블록, 렌더러의 내부 한자·역할명 차단과 B의 근거 제시 방식 때문에 장 전체를 READY로 올리지 않았다. 조립에서 원국 Fact와 근거를 먼저 연결하고, locale 측에서 허용된 평이한 근거 표현을 한다.

### CH-2 일곱 면 전수 대조

| B의 면 | 현재 Fact/맥락 | 남은 계약 |
| --- | --- | --- |
| 생각하는 방식 | `core`, `inner`, `innerDecision` | 생각과 결정의 장별 중복 방지. 실재 조건이 없을 때 사례 추가 금지 |
| 책임감 | `strength`, `work`, 일부 원국 성향 내용 | 독립 taxonomy와 모든 차트의 근거 없음. 빈 근거는 SOURCE_GAP |
| 표현 | `expression`, `social`, outward 맥락 | 대상을 구분하는 실제 근거가 있는 범위만 |
| 감정 | `inner`, `stress`, `internal_conflict` | 마음의 처리와 몸의 상태를 분리. 근거 없는 대가 제외 |
| 결정 | `decision`, `innerDecision` | 구체적 선택 장면의 근거 수준 표시 |
| 사람을 대하는 방식 | `interpersonal`, `social`, DayPillar 보조 | 일지와 관계 성향을 실제 혼인 여부로 해석하지 않음 |
| 혼자 있을 때와 사회 속 | `positionExpressions`, `inner`/outward, `conflicts` | 알려진 위치에만 사용. 출생 시각 미상에서 사적 양상을 채우지 않음 |

실제 근거가 약한 면은 B-3 지침을 따라 필요한 상태를 드러낸다. 분류 단어 검색만으로 책임감·대가·현실 사건을 선정하지 않는다. [Personality Fact 및 지원 정보](../../lib/personality/types.ts) · [원국 차원 집계](../../lib/personality/natalPersonality.ts) · [렌더러 블록](../../lib/personality/render/types.ts)

## C. Engine Capabilities

| 기능 | 실제 출력과 경계 |
| --- | --- |
| Canonical | `calculateCanonicalChart` → `CalculatedChart`의 `birthInput`, `timePolicy`, `solarTerms`, `chart`, 운 달력 및 uncertainties. 기본 간지와 절기, 시간 상태의 공급원 |
| Natal Judgment | `runInternalReading().natal` 및 `judgmentCore` 원국 snapshot에 격·역할·관계·근거. pipeline `successState`는 `SUCCESS_EFFECT_RULES_UNAVAILABLE`로 deferred |
| Daewoon | `calculateGreatLuck` 달력·기간과 활성 snapshot. 시간 미상은 시작·현재 인덱스 미확정, 성별·기간 전제도 보존. 과거부터 다음까지 모든 구조 판단을 생산하는 보고서 범위 함수는 없음 |
| Sewoon | `calculateYearlyLuck`의 입춘 기준 10 cards에 올해·내년 포함. `runInternalReading`은 주어진 기준 시점의 세운 체인을 평가. 재평가가 필요한 추가 기간은 상류 생산 단계에서 해결 |
| Month | `monthlyWindowStart`를 주면 12개 연속 절기월, 상위 세운, 관계·역할·런타임·근거와 `judgmentCore` 월 snapshot을 제공. `interpretationInputs`의 방향·작용 요약 필드는 null이고 해석 단계는 `LUCK_FUNCTION_EFFECTS_UNVERIFIED`로 deferred. 스냅샷에 완성된 B 월별 축 표는 없음 |
| Day | `dailyLuck`은 사전 계산된 간지/유효기간 입력. 유효한 대운·세운·월 체인과 일진 기간이 있을 때 core에 추가. B 고정 장의 표시 요구 없음 |
| Personality | `buildNatalPersonality` → `applyStructuralRoleModifiers` → 필요할 때 `buildCurrentPersonality`. 구조 투영 두 함수로 `LuckScopeState`를 읽으며 locale 렌더러는 이 결과를 직접 받음 |
| Structural Roles | 격·용신·상신·병·구응의 근거와 상태. `ActualStructuralFunction`의 `direction`, `function`, policy·관계·근거 ID는 국소 작용 설명에 활용 가능 |
| Runtime | 격 맥락, 관계·형성/공식·통근, active/weakened/stopped 상태와 조건부·역할 기능·유효기간 |
| History | manifestation, combination 및 luck-effect 이력과 현재 상태, Personality effect history/conflicts. 이력 근거는 고객 경험에 대한 확인으로 변환 불가 |

[Canonical 계산](../../lib/canonical/calculateCanonicalChart.ts) · [대운 달력](../../lib/calculateGreatLuck.ts) · [세운 달력](../../lib/calculateYearlyLuck.ts) · [월운 달력](../../lib/calculateMonthlyLuck.ts) · [내부 리딩/월 구간](../../lib/judgment/pipeline/internalReading.ts) · [Core scope 선택](../../lib/judgment/core/fromReading.ts) · [판정 snapshot](../../lib/judgment/core/luckScope.ts) · [실제 구조 작용](../../lib/judgment/core/policies.ts) · [Personality 공개 진입점](../../lib/personality/index.ts)

### 거리와 반가운/부담이 되는 기운

원국 천간합의 `evaluateNatalStemCombination`은 OP-T12의 상대 선정에서 원국 위치에 따른 거리를 실제로 사용하며 동일 거리에서 보류할 수 있다. 위치 및 관계 ID는 있으나 모든 조합의 I-06 거리·닿음 효과를 일반 장 데이터로 출력하는 모델은 찾지 못했다. 운의 글자에 원국 자리 규칙을 그대로 적용할 수 없다. [원국 천간합 평가](../../lib/judgment/evaluators/natalStemCombination/index.ts) · [A I-06](../source/authority/A_rev182.md#L90)

이미 채택된 `PatternEffectPolicy`와 `ActualStructuralFunction`에 역할 현재 상태를 함께 적용하면, 개별 작용의 도움·부담 표현 근거를 얻을 수 있다. 이를 격·기간 전체의 길흉이나 TenGod의 고정 극성으로 확대할 수 없다. OP-L03와 I-14에 필요한 방향, 반대 근거, 출처 수준, 양축의 최종 합성은 별도 계약이 필요하다. [격별 정책](../rules/master/06-pattern-effect-policy.md) · [정책 출처 감사](../rules/master/07-pattern-effect-policy-audit.md) · [A OP-L03](../source/authority/A_rev182.md#L617)

## D. Missing Semantic Layers

| 레이어 | 상태 | 확인 결과 |
| --- | --- | --- |
| Structural summary | PARTIAL | 격·구조 관계·역할·작용의 읽기 전용 요약은 가능. 최종 성패·기간 양축 표는 ENGINE_GAP |
| Top-3 selection | SOURCE_GAP | B F-②의 개수와 제외 조건은 존재. 후보 간 우선순위·동률·근거 부족 처리 기준을 찾지 못함 |
| Strength/challenge selection | SOURCE_GAP | 지원/방해 경로와 성향 후보는 있으나 B의 3+3, 공통 뿌리 및 확정 대응 선택 없음 |
| Work | NOT_IMPLEMENTED | 성격의 work style만 존재. 조직/독립 적성, 성과, 대운 및 월별 일 결과에 대한 공식 매퍼 없음 |
| Money | NOT_IMPLEMENTED | 구조의 재성 역할과 관계 경로만 존재. 유입·유지·위험 조건 또는 영역별 계약/사업/지출/협업 결과 없음 |
| Relationship | NOT_IMPLEMENTED | 관계 성향·일지·합충과 A I-15/I-22/OP-R03 규칙까지 확인. 시기 신호를 네 결과로 내는 계약 구현 없음. 고객 혼인 상태와 궁합은 별개 |
| Health | NOT_IMPLEMENTED | A I-16 전통 대응 원자료와 B 제한은 존재. 안전하게 고객에게 전달할 근거 연결과 월별 건강 범주 결과 없음. 12운성·성격·운 부담을 질병 또는 장기 상태로 전환할 수 없음 |
| Summary | SOURCE_GAP | CH-11의 요약 역할과 동일 판정 월 묶기 조건은 존재. 기억할 셋 및 10년 사용법의 일반 선택 기준 없음 |
| Question routing | NOT_IMPLEMENTED | 질문에서 관련 장·기간의 기존 판단을 고르는 계약 없음. 선택 주제 UI의 `reading?`은 라우팅이 아님 |
| Subjective experience | NOT_IMPLEMENTED | 구조상 유리/불리는 실제 행위·성공·느낌·생활 사실에 대한 출력이 아님 |

**`OUTCOME_LAYER_NOT_IMPLEMENTED`**는 분야별 typed result/공식 변환의 부재를 지칭한다. 관계와 건강에 소스가 전혀 없다는 뜻으로 사용하지 않는다. 저장소에서 구조 판정·Personality·UI의 용어 및 import 경로를 비교했다. 경기/재성 등의 구조 정책, 일주 자료의 제외 태그, 관심사 UI는 분야 결과가 아니다. 현재 승인된 범위는 A 및 B에 근거해 보류 이유와 입력 근거로만 기록한다. [A I-15/I-16](../source/authority/A_rev182.md#L109) · [A I-22](../source/authority/A_rev182.md#L325) · [엔진 통합의 구조/체감 구분](../rules/master/09-engine-integration-spec.md#L951)

## E. Deduplication Contract

- **Semantic ID**는 `sourceFactId`, `sourceEffectId`, `sourceRoleId`, `sourcePersonalityFactId` 및 scope·기간·축·대상과 버전으로 연결한다. 동일한 표현 역할의 중복을 검사한다.
- **첫 등장**은 B-6의 결론 위치를 사용한다. **재등장**은 근거·조건·대상·시기·적용 중 검증된 새 내용을 더한다. F-③과 CH-2의 사례가 대표적인 심화 테스트다.
- **월 일관성**은 CH-10에서 쓰는 동일 월 결론과 출처를 CH-4~7/9/11/CH-Q가 참조하는 방식으로 검증한다. 분야 레이어가 없으면 분야 내용은 비워 두고 출처 공백을 표시한다. 다른 상태의 월을 하나의 리듬으로 묶지 않는다.
- **문자열 dedupe**는 no다. 고객 문장의 번역이나 유사도는 원천 ID를 대체할 수 없다. 무료·유료의 범위/깊이 변경에도 결론의 방향과 확정도를 같게 검증한다.

## F. Product / Engine Separation

| 항목 | 계약 |
| --- | --- |
| Free access logic | B-2 원국만. 결제·권한 검증은 감사 범위 밖 |
| Premium access logic | B-0-3 순서대로 11장과 개인 질문. 범위 정책만 정의 |
| Judgment direction | W-99. 한 결론·유효 기간·축을 참조하고 분량·조건·근거만 확장 |
| Day luck product usage | B 고정 장 배치 없음. 계산/조립/노출은 별개 |
| 현재 UI | 차트·운 cards 및 선택 주제 화면은 기존 별도 표시 범위 |

## G. Multilingual Architecture

현재 감정서 Assembly 런타임은 **0개**이며 설계는 공통 **1개**다. KO/JA/EN 전용 Assembly는 각각 **0개**다. 기존 세 Personality 렌더러는 고객 문구 역할만 한다. 기본 입력 또는 provenance 기반 subview를 장에 넘기고 최종 locale에서 표현한다. Personality 완성문을 저장해 다시 번역하는 경로는 도입하지 않는다. 새 Reading Renderer가 생기면 같은 장·단위·근거·확정도·scope를 사용하는지 비교한다.

## H. Dependency Audit

| 방향 | 확인 |
| --- | --- |
| Judgment → Assembly | 0 |
| Personality → Assembly | 0 |
| Assembly → Judgment result | 설계상 읽기 전용. upstream 계약과 `runInternalReading` 반환값 재사용 |
| Assembly → Personality result | 설계상 읽기 전용. `NatalPersonalityResult` 및 `CurrentPersonalityResult` 재사용 |
| Renderer → Engine 재계산 | 기존 Personality 경로 0. Reading Renderer도 결과 참조만 허용 |

`runInternalReading`과 `runJudgmentCore`는 함수 경로로 노출되어 있다. `src/lib/judgment/index.ts`는 없다. `projectNatalStructuralReading`과 `projectCurrentPersonalityScopes`는 Judgment 스냅샷을 Personality 입력으로 투영하므로 중복 읽기 모델을 새로 만들 근거가 없다. 기존 `BasicReading`은 문자열/리스트를 표시하고 `SelectedTopicReading`은 제공 텍스트 또는 미리보기 안내를 표시한다. `BasicChartResult`에서 전달하는 선택 주제는 제목이다. 기존 UI를 조립 계약으로 계산하지 않는다. [원국 역할 투영](../../lib/personalityStructuralReading.ts) · [현재 범위 투영](../../lib/personalityCurrentReading.ts) · [BasicReading](../../components/result/BasicReading.tsx) · [SelectedTopicReading](../../components/result/SelectedTopicReading.tsx) · [결과 화면](../../components/BasicChartResult.tsx)

## I. New Rules Invented

| 항목 | 신규 |
| --- | ---: |
| SOURCE_INFERENCE | 0 |
| FILUNE_OVERRIDE | 0 |
| UNSUPPORTED_NEW_RULE | 0 |

기존 snapshot의 출처 상태는 보존한다. P4-A는 조립 제약과 가용 근거만 기록했다.

## J. Next Implementation Order

| 순서 | Task | Reason | Blocking dependency | Source status |
| --- | --- | --- | --- | --- |
| 1 | P4-B 공통 Reading Assembly Core | 장 순서, 입력 참조·provenance·상태·노출 범위·gap을 고정할 수 있음 | 승인 범위의 기존 결과 타입. 양축·분야 미완은 gap으로 보존 | B-0-3/B-6/W-99 명시 |
| 2 | 근거 있는 Structural Summary와 OP-L03 출력 계약 | CH-1과 CH-8~10에 구조적 요약이 필요하며, 최종 월 방향은 여러 장의 공통 의존성 | 현행 정책/상태 근거에서 축별 판단·반대 근거를 내는 상류 계약 및 회귀. 보류는 유지 | A I-14/OP-L03 및 B W-93 명시. 일부 구현 공백 |
| 3 | F-②·F-④·CH-11 선정 계약 검토 | 일정 개수의 구조·과제·요약은 공통 코어가 임의 선정할 수 없음 | 출처 기반 우선순위·동률·부족 입력의 승인 | SOURCE_GAP |
| 4 | 분야별 semantic layer의 계약 검증 | CH-4~7을 구조 판정에서 직접 만들 수 없음 | 월 공통 판정 및 분야별 승인·구현. 관계는 I-15/OP-R03, 건강은 I-16과 W-30~35 범위 우선 확인 | Work/Money 일반화 SOURCE_GAP. Relationship/Health는 제한 소스 존재, ENGINE_GAP |
| 5 | 장별 locale 표현·질문 라우팅 | 승인된 의미 단위로 장별 깊이와 질문 응답을 제공 | 장별 근거와 월 키 및 질문 지원 범위. 기존 Personality 렌더러 재사용 | B-3~6/W-99 및 locale 가이드 명시 |

2~4단계의 의존성을 확인하기 전에 전체 장 발행 일정을 확정하지 않는다.

## K. 남은 상태 및 검증

| 항목 | 상태 |
| --- | --- |
| FAIL | 조립 계약 감사 0 |
| PARTIAL | F-①, F-③, CH-1~3, CH-8~10 |
| SOURCE_GAP | F-②, F-④, CH-4, CH-5, CH-11 및 CH-2 일부 책임감/장면 근거 |
| ENGINE_GAP | CH-6, CH-7, CH-Q, 최종 축별 판단/성패와 다기간 묶음 |
| RENDERER_GAP | B 형식의 전체 Reading 및 구조·분야·시기 고객 렌더러. 기존 Personality 블록은 재사용 후보 |
| NOT_IMPLEMENTED | Assembly 런타임 0개, Outcome Semantic Layer, 질문 라우팅, 체감 결과 모델 |
| DEFERRED | TenGodProminence, 성패·운 해석 단계의 기존 보류, 미확정 조건별 발행 범위 |

Master 01~07에서 격·관계·통근·역할·격별 정책 범위를, 08~10에서 운·통합·미구현 계약을, 11~12에서 Personality 범위와 자료 공백을 확인했다. 작업 전후 `src/lib/`의 상태와 파일 해시가 일치했다. 애플리케이션 코드 변경은 **0건**이다. 이번 감사에서 Canonical 검증 및 P3-F 다국어 회귀 검증을 재실행해 통과했다. 전체 Judgment 35/35와 TypeScript/빌드는 P3-F 기준선을 참조했다. 기존 CS-005 월 구간 검증은 연속 12기간과 상위 세운 경계 등 19개 검사를 통과했고 각 월의 해석은 deferred로 남았다. [월 구간 검증](../../../scripts/verify-cs005-monthly-window.mjs) · [P3-F 결과](p3f-personality-renderer-en-audit-result.md)
