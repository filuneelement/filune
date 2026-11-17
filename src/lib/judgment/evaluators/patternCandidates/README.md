# 격국 후보 전용 evaluator

`evaluatePatternCandidates({ producer, derived, natalCombination, context })`는 기존 원국 Fact와 원국 천간합 결과만 받는다. 문서 C, 원 canonical chart, 지장간 표, 기대 격국은 입력받지 않는다. `producer` 타입도 facts/entities/producerRef만 허용한다. 투출·통근·십신·합·달력을 계산하는 함수를 호출하지 않는다. 최종 확정·용신·상신·병·구응·길흉·운 평가는 생성하지 않는다.

근거는 A rev179 A-8-1 I-01(월령 본기 중심), I-02(본기/본기 외/복수 오행 투출, 일간 제외, 비겁 독립 구성 제외), I-02a(합거 후 분류 유지), C-10(지장간 체계)이다. mapping-A 및 implementation-readiness의 READY I-01/I-02/I-02a를 이 후보 범위로 한정한다. C-10의 REVIEW를 전체 지장간 체계 추론 허가로 확대하지 않는다. A-2의 과거 동일 천간만 인정하는 투출 기준은 실행하지 않는다.

## Schema

기존 계약 schema 도구로 `patternCandidateSchema`를 정의한다.

- candidateId, patternType: 월령본기격 / 정격 / 변격 / 겸격 / 비겁월특수 / 미정
- status: candidate / deferred / rejected. confirmed는 schema가 거부한다.
- basis: 월지 entity, 본기 HiddenObservation ID, 구성별 tenGod·지장간 관측·천간 entity·투출·십신 Fact ID, 참고용 통근 Fact ID, 원국 RuntimeState, 관련 합 RelationFact ID, stopped 후 분류 유지 여부, 이유
- supportingFactIds, conflictingFactIds, sourceRuleIds, evidenceIds, uncertaintyIds
- sourceScope=natal, scopeId, hiddenStemSystemId, provenance(기존 producer 및 A179/A-8-1 문서 연결)

후보 배열의 ID 정렬은 직렬화용이며 후보 우선순위가 아니다. 구성별 십신은 이미 공급된 십신 Fact를 그대로 사용한다. 본기 십신은 authority가 확인한 월지 지장간 글자·역할과 일치하는 기존 projected tenGod Fact에서만 읽는다. 기존 projection의 지장간 행을 새 멤버십/역할 공급원으로 사용하지 않는다. 부분 authority나 관측 누락은 deferred다.

월령본기격 후보는 I-01의 지지 기본 구조만 표현한다. 정격은 본기 오행 투출, 변격은 본기 외 오행 투출의 검토 후보다. 두 구성 이상의 오행이 투출하면 겸격 검토 후보를 함께 보존한다. 유정·무정이나 성패는 판단하지 않는다. 같은 오행의 다른 음양은 별개의 오행으로 세지 않으며, 같은 천간에 대한 본기 투출 Fact가 있으면 동일 오행의 본기 외 역할을 별도 변격으로 중복 생성하지 않는다. 복수 오행 판별은 공급된 십신의 정·편 쌍 구분을 사용한다.

통근 Fact는 basis.rootFactIds의 참고 정보일 뿐 I-01/I-02 후보 생성·배제 조건이 아니다. 이 참조는 해당 월지와 후보 천간의 기존 통근 Fact로 제한한다. 未 등 다른 지지의 부분 정보를 원국 월령 후보 조건으로 끌어오지 않는다. RootFact를 삭제해도 후보 분류/상태는 바뀌지 않는다.

stopped가 있어도 해당 구성은 rejected가 되지 않는다. I-02a를 기록하고 현재 RuntimeState와 합 RelationFact를 conflictingFactIds에 남긴다. 이는 현재 기능의 제약이며 격 분류를 지우는 반증이 아니다. 정격·변격 단일 분류 후보의 conflictingFactIds에는 다른 오행의 투출 Fact도 들어간다. 이는 겸격 검토가 필요함을 알리는 정보이며 자동 탈락이나 최종 선택을 뜻하지 않는다.

일간을 구성으로 쓰지 않는다. 비견·겁재 투출 구성은 rejected로 기록하되 존재 Fact는 보존한다. 비겁월은 건록·양인 등 특수 처리가 필요한 deferred 후보만 만들고 일반 본기격으로 확정하지 않는다. 투출 관측·십신·현재 상태가 없으면 재계산하지 않고 deferred다. 월령 본기 자체가 확보돼 있으면 기본 후보는 투출 관측 부족과 구분해 보존한다.

CS-005 C-10-1 항목 3·5는 verify의 expected로만 사용한다. 생성 결과는 월령 본기 偏官 후보, 본기 甲의 정격 후보, 중기 丙의 변격 검토 후보, 偏官+偏印의 겸격 검토 후보다. 네 레코드는 네 개의 최종 격국이라는 의미가 아니다.

## Assessment 추적

후보 status와 입력의 assessment는 별개다. `inputAssessments`는 supporting/conflicting 및 참고 통근 Fact의 ID·실제 assessment·evidence IDs·uncertainty를 보존한다. RuntimeState처럼 assessment 축이 없는 계약은 null로 명시한다. `evidenceAssessments`는 후보가 참조한 evidence 각각의 실제 status·sourceType·uncertainty를 보존한다. evidence uncertainty도 후보 uncertaintyIds에 병합한다. 후보 자체를 confirmed로 승격하거나 격국 판단을 추가하지 않는다. raw-source/독립 검산 미확보 evidence와 확인된 로컬 Fact receipt가 함께 있으면 각 상태를 그대로 추적하며 하나의 confirmed 요약으로 덮어쓰지 않는다.
