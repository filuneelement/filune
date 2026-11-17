# 투출 / 통근 derived facts

진입점은 `produceExposureRootFacts({ producer, context }, sources)`다. 입력은 기존 producer와 검증된 ExecutionScopeContext, 동결 A179/C215/D152/25-7 rev16 원문이다. context에 포함된 entity만 조사하며, 운 기간을 자동 선택하거나 여러 시점의 운을 섞지 않는다. 기존 HiddenStem producer·RuntimeState·천간합 evaluator는 변경하지 않는다. 기존 A 단독 producer의 보수적인 子-only 공급을 수정하지 않고 C-10 체계 안에 D/C 직접 관측 자료를 별도 authority로 보강한다. legacy 지장간은 읽지 않는다.

## 근거

- A-8-1 C-10: 본기·중기·여기 체계. D H-3-1은 여기·중기·본기 순서를 명시한다. 이 표에서 子·丑·寅·辰·午·戌의 역할과 멤버십을 추출한다.
- A-8-1 I-02: 월령 지장간의 동일 오행 투출, 음양 무관, 일간 제외. 비겁의 존재 사실은 유지하며 용신 선정은 하지 않는다.
- A-8-1 I-02a: 합거돼도 투출 사실 유지. 이 producer는 RuntimeState를 입력받지 않으므로 합거로 투출 존재를 삭제하지 않는다.
- A-2-3 I-05: 통근 존재·고도 뿌리. 해당 행은 丙–戌 화고 뿌리를 명시한다. 지장간의 동일 천간 일치는 직접 멤버십으로 기록한다. 다른 음양의 같은 오행을 모두 뿌리로 인정하는 범용 식은 명시되지 않아 unknown으로 남긴다. 힘·성패 부분은 실행하지 않는다.
- A-8-5 OP-Z13: 충으로 개고·새 지장간·새 투출을 만들지 않는다. 이 producer는 충 관계를 소비하지 않는다.
- C C-10-1 항목 2·4·9: 亥 본기 壬, 亥에 戊 없음, 未 지장간 乙 존재만 사용한다. 未의 乙 역할과 나머지 목록, 亥의 나머지 목록은 만들지 않는다.
- 25-7 ① G-1/G-8 및 ② 14·15: 동일 오행 투출 및 합거 후 사실 유지. mapping-A / implementation-readiness의 REVIEW를 강약·격국 구현 허가로 확대하지 않는다. 폐기된 동일 천간만 투출하는 기준은 실행하지 않는다.

## 결과 의미

ExposureFact는 천간 entity × 지지의 확인된 지장간 관측별 레코드다. `sameElementVisible`은 순수한 동일 오행 존재 확인이고, `exposed`는 일간 제외를 반영한다. 일간과 같은 오행의 다른 천간은 존재 사실을 보존한다. 월령에만 `monthCommand=true`이며 I-02를 적용한다. 나머지 지지는 같은 오행의 천간 가시성만 deterministic observation으로 기록하며 I-02의 격국용 투출 범위를 확대하지 않는다. 시간 위치는 hour로 표기하고 운 천간은 position=null, sourceScope와 entity period로 추적한다.

RootFact는 같은 관측 단위에서 rootExistence와 hiddenStemMatched를 기록한다. present는 직접 동일 천간 일치 또는 I-05가 명시한 丙–戌, absent는 해당 지장간 관측과 오행 불일치, unknown은 문서상 일반화되지 않은 음양 간 관계나 조사 불완전이다. **개별 absent는 지지 전체에 뿌리가 없다는 판단이 아니다.** 같은 천간–지지의 present가 하나라도 있으면 존재가 확인된 것이며, present가 없고 unknown이 남으면 지지 전체의 부재를 단정할 수 없다. 부분 목록은 항상 별도의 hiddenStem=null unknown 관측도 남긴다. 亥의 戊 부재는 문서가 직접 명시한 배제다.

역할 미지정은 hiddenStemRole=null이며 추론해 채우지 않는다. 未 乙의 긍정 멤버십은 역할을 몰라도 유지한다. hiddenObservations는 명시된 멤버십만 보존한다. 모든 관측/파생 fact는 entity IDs, scope, system ID, 문서 evidence, 원 canonical input refs, producer와 계산 버전, rule version, uncertainty를 보존한다. Evidence와 HiddenStemEntry는 기존 계약 schema를 사용하며 새 schema는 만들지 않는다.

CS-005 기대값은 verify에서 C-10-1 항목 4와 비교한다. evaluator/producer에 CS 식별자나 기대 판정은 없다. 원문 C의 authority 공급에서 읽는 항목은 亥/未의 공통 멤버십 자료뿐이다. 격국·용신·상신·병·구응·길흉·강약 점수·RuntimeState는 생성하지 않는다.

## 개별 Fact assessment 전파

`documentReceipt.ts`는 mapping에 고정된 A179/C215/D152/25-7 rev16의 실제 원문 SHA-256, revision, 직접 절·값/역할표를 검사한 경우에만 local source-document receipt를 생성한다. 역할 순서와 branch별 역할표를 별도로 검증하며 이미 문서에 있는 여섯 branch coverage를 확대하지 않는다. C의 원국 간지 statement는 원고 원국 값 연결만 검증하고 출생일시나 격국 기대값을 채택하지 않는다. receipt의 checkedByRef는 실제 실행된 코드 검증기를 가리키며 operator 승인이나 independent-cross-check를 만들지 않는다.

원래 raw-source/계산 evidence와 A-only partial system은 provisional 상태로 유지한다. 확인된 로컬 claim은 새로운 receipt ID로 분리한다. 원문 hash만 맞는다고 전체 system을 confirmed로 만들지 않는다. 직접 원문 역할과 필요한 로컬 coverage가 확인되고, entity 및 원 canonical Fact assessment가 confirmed이며 부모/context uncertainty가 없고, 필요한 rule/section receipt가 있을 때만 derived Fact를 confirmed로 전달한다. 부모가 provisional/unknown/unsupported이면 이 검증으로 승격하지 않는다. partial 역할표와 legacy fallback도 confirmed를 허용하지 않는다.

`provenance.assessmentBasis`는 parentFactIds, receiptEvidenceIds, localCoverage, legacyFallback을 기록한다. 각 Fact에는 실제 수행된 구조 검증의 deterministic-calculation receipt도 붙는다. Fact ID·exposed/rootExistence·hiddenStemMatched 및 합 evaluator 결과는 유지한다. 기존 no-independent-cross-check 및 역산 생시 provenance는 삭제하거나 confirmed로 덮어쓰지 않는다. 통근 근거 미명시 unknown은 그대로 유지한다.
