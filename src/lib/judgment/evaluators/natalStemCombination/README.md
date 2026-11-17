# 원국 내부 천간합

`evaluateNatalStemCombination`은 natal ExecutionScopeContext만 받는다. 기존 운 evaluator를 호출하거나 운 상태를 승계하지 않는다. 기존 `selectScope`의 관계 선택·계약 bundle 구성만 공통 util로 사용한다. 기존 운 evaluator의 원국합 보류 경계는 그대로 두며 이 결과를 운 evaluator upstream으로 자동 연결하지 않는다.

근거는 A rev179 A-8-4 OP-T01·OP-T02·OP-T09·OP-T12, A-5-1 OP-T01의 일간 제외 명시 및 OP-T04(A-8-4 유지)다. mapping-A.md의 해당 ID와 implementation-readiness.md의 실행 범위 및 CS-005 원국합 없음 설명을 대조했다. A-4-4/A-5-1의 폐기된 OP-T09 기본값은 실행하지 않는다.

RelationFact의 present는 합 가능 관계다. 실제 합거는 event.stopping과 기존 RuntimeState의 stopped로 기록한다. 년–시 관계는 OP-T02의 합이불합으로 active 유지, 일간 포함 관계는 OP-T04로 합거 제외, 년–월 및 월–시는 유효 상대의 거리와 OP-T12 중복 점유 제한을 적용한다. 선택되지 않은 상대는 active를 유지한다. active는 이 slice에서 합거로 정지하지 않았다는 뜻이며 전반적 강약 판단이 아니다. 같은 거리의 충돌은 문서에 우선순위가 없어 보류한다.

평가 전 상태는 기존 unknown/unresolved 계약으로 기록한다. 평가 후 상태는 priorStateRef로 연결하고, 문서 Rule ID ApplicationReference와 evidence를 보존한다. event는 참여 entity ID, sourceScope=natal, Rule ID, before/after, evidence ID, producer provenance 및 원래 relation을 보존한다. 후보가 없는 경우에도 완전한 6쌍 조사 coverage를 요구하며 관련 원국 규칙과 evidence로 active를 설명한다. 입력 상태나 C 기대값은 받지 않는다.

합화·오행 변환·RoleState·투출·통근·격국·길흉 판단을 생성하지 않는다. C rev215 C-10-1의 CS-005 ‘10 원국 천간합: 없음’은 verify의 expected로만 읽는다. 합거/먼 합/일간/다대일은 달력 유효성을 주장하지 않는 별도 합성 fact 배열로 검증한다.
