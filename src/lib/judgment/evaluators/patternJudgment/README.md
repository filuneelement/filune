# PatternJudgment: 원국 구조 확정

`evaluatePatternJudgment({ candidates, producer, derived, natalCombination, context })`는 기존 PatternCandidate[]와 원국 Fact를 소비한다. 후보 evaluator, 지장간/십신/투출/통근/합 계산을 호출하지 않고, 문서 원문이나 C의 기대 격국을 입력받지 않는다. 결과는 별도 `PatternJudgment`와 기존 evidence catalog, 빈 roleStates다. 후보의 status나 입력은 변경하지 않는다.

## 현행 근거와 분기

A rev179 A-8-1 I-01, I-02, I-02a, C-10만 적용한다. 월령 본기 중심의 지지 격과 투출에 따른 정격/변격/겸격 분류를 구분한다. 원국 월령의 완전한 로컬 역할표, 본기와 십신 Fact, 일간 제외 투출 행렬, 독립 구성 후보, confirmed 입력 및 필요한 receipt를 함께 검사한다. 본기 하나나 투출/통근 하나만으로 확정하지 않는다.

- I-01: 월령 본기 후보를 유지한다. 비겁월의 특수 규정은 이 slice가 해결하지 않으므로 deferred다.
- I-02: 본기 오행만 투출한 기존 정격 후보는 조건을 모두 충족할 때 확정한다. 정·편 십신을 같은 오행으로 분류하는 기존 구분을 사용하며, 오행 수량이나 강약 점수로 우선순위를 만들지 않는다.
- I-02: 복수 오행의 독립 투출 구성과 이를 모두 포함하는 기존 겸격 후보가 일치하면 겸격 구조를 확정한다. 단일 정격/변격 후보는 **최종 단독 설명**에서 rejected로 기록하되 구성 사실은 삭제하지 않는다. 월령 본기 후보는 겸격과 양립하는 기본 근거로 유지한다.
- I-02: 본기 외 단일 오행만 투출한 경우 원문은 ‘변격 검토’를 요구한다. 추가 확정 근거가 없는 이 slice에서는 deferred를 반환한다. 새 변격 확정식을 만들지 않는다.
- I-02a: stopped는 투출 분류를 지우지 않는다. 현재 상태/합 관계는 trace·conflicting/context 참조로 보존하고 이를 자동 탈락 조건으로 쓰지 않는다. supplied weakened 상태도 새 격국 제외 규칙으로 확대하지 않고 현재 상태로 추적한다.

기존 후보가 누락되거나 모순되면 Fact에서 후보를 새로 만들어 채우지 않는다. confirmed/provisional 비교, ID/역할/오행 구성 및 scope/producer 연결 검사는 입력 정합성 검사이며 Fact 재계산이 아니다.

## Assessment와 evidence 범위

confirmed는 필요한 월령/관측/투출/십신 Fact의 assessment가 confirmed이고 uncertainty가 없으며, 필요한 로컬 source/구조 검증 receipt와 A-8-1 Rule receipt도 confirmed인 경우에만 반환한다. authority에 I-01의 직접 원문 receipt를 추가한 것은 이 단계의 Rule 근거를 공급하기 위한 변경이다. 기존 멤버십·투출·통근 값은 변경하지 않는다.

제공된 confirmed 십신 Fact는 그대로 입력 전제로 소비하며 새로운 십신 계산이나 독립 검증을 주장하지 않는다. `evidenceIds`는 실제 확정에 사용한 confirmed Rule/로컬 Fact receipt만 담는다. 원래의 raw-source·달력·출생·독립 검산 미확보 evidence는 `contextEvidenceIds`와 원 catalog에 원래 상태로 보존한다. confirmed로 덮어쓰거나 이 slice의 확인을 실제 출생정보 인증으로 확대하지 않는다. 통근은 I-01/I-02의 선정 조건이 아니므로 context 참조이며 미확정 통근이 확정 근거에 섞이지 않는다.

`uncertainty.blockingIds`는 핵심 조건의 누락/미확정/모순이고, `contextIds`는 후보와 원래 provenance의 비핵심 한계다. 핵심이 provisional이면 deferred, unknown/unsupported이면 해당 assessment를 보존한 deferred다. 문서의 부분 未·亥 정보나 전체 12지 미완성을 원국 寅 로컬 조건에 끌어오지 않는다.

## 출력과 검증

PatternJudgment는 patternType, confirmed/rejected/deferred status, 월령 본기 십신, 투출 구성 십신, sourceCandidateIds, supporting/conflicting Fact IDs, Rule/evidence IDs, reasonCodes, assessment, uncertainty, 후보별 trace 및 provenance를 보존한다. 각 후보 trace에는 원래 supporting/conflicting IDs와 유지·제외·보류 사유가 있다. 배열 정렬은 JSON 결정성용이며 후보 순위가 아니다.

CS-005의 지지 칠살격 / 겸격(칠살+편인)은 C rev215 C-10-1 항목 3·5의 구조 부분과 verify에서만 비교한다. 유정·무정·성패·용신·상신·병·구응·길흉·운 평가는 생성하지 않는다. 예상과 다르면 후보, Rule, assessment, evidence 및 trace를 포함한 진단으로 실패한다. stopped/단일 정격/단일 변격/비겁월 등은 별도 합성 Fact·계약 입력으로 검사하며 달력 유효성을 주장하지 않는다.
