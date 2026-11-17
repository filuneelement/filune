# FILUNE 최종 천간 용신 역할

`evaluateYongShenJudgment`는 기존 PatternJudgment, PatternCandidate trace, YongShenCandidate[], 원국 Fact·현재 RuntimeState·evidence를 소비한다. 후보/격국/지장간/십신/투출/통근/합을 재계산하거나 C의 기대 역할을 읽지 않는다. 별도 YongShenJudgment와 용신 RoleState만 반환한다.

## 현행 Rule와 비교

A179 A-8-1 I-01/I-02/C-10으로 월령에서 나온 실제 투출 천간과 확정 격국 구성을 연결한다. A-8이 A-2의 과거 격국/투출 문구보다 우선한다. I-03은 FILUNE 용어 경계에 사용하며 희용신·조후·억부 개념으로 바꾸지 않는다. I-02의 복수 천간 용신 구성을 본기 하나만으로 축소하는 우선순위는 없다.

I-04-1의 순용/역용은 **요구되는 취급 방향**이다. 제공된 십신 Fact와 후보의 방향이 일치하는지 확인하되 실제 성패·유정/무정·길흉이나 보조 역할의 성립을 판정하지 않는다. 확정하는 것은 FILUNE의 ‘월령 투출 천간의 용신 역할’이며 유리한 오행이나 실제 출생정보의 인증이 아니다. D152 Q16/H-3-1, 25-7 rev16의 현행 I-02/I-03/I-04-1 정리, mapping-A 및 implementation-readiness의 역할 REVIEW 범위를 대조했다. 사례 기대값이나 미명시 정성 임계값을 일반 확정 공식으로 추가하지 않는다.

## 확정 조건

각 entity에 대해 다음을 함께 검사한다.

- PatternJudgment가 confirmed이고 핵심 Fact/evidence가 현재도 confirmed인지 확인한다.
- source candidate가 status=candidate, assessment=confirmed이며 blocking uncertainty가 없어야 한다. 후보의 status에는 confirmed가 없으므로 근거 assessment와 혼용하지 않는다.
- 기존 격국의 selected trace → 원 PatternCandidate 구성 → source candidate → 월령 지장간 관측 → 투출 entity가 같은 ID·값·십신·scope·producer로 연결돼야 한다. 격 이름이나 active 하나만으로 확정하지 않는다.
- 부모 Fact, 직접 Rule receipt, 후보 evidence가 confirmed여야 한다. 월령의 필요한 local coverage는 complete여야 하며 legacy 보완은 허용하지 않는다.
- source candidate와 현재 기능 상태가 일치해야 한다. weakened를 자동 탈락시키거나 수치 임계값을 만들지 않는다. stopped는 I-02a의 분류 사실을 유지하면서 역할 검토 deferred로 기록하며 rejected로 일반화하지 않는다.

source candidate가 rejected이면 실제 일간/비겁/월령 구성 밖이라는 I-02 제외 근거와 연결하여 rejected를 보존한다. 긍정 격국 구성과 source rejection이 모순되면 deferred다. 핵심 입력 provisional/unknown, 필수 후보나 연결/receipt 누락, 현재 상태 불일치도 deferred다. 후보 목록이 비어 있으면 새 후보를 만들지 않고 전역 deferred 항목을 반환한다.

원국 겸격의 모든 기존 독립 구성에 대응하는 source candidate가 제공돼야 한다. 이는 coverage 확인이며 우선순위나 점수가 아니다. 근거가 충족된 여러 천간은 함께 용신 역할로 남길 수 있다. 한 후보의 보류를 이유로 다른 후보를 대신 생성하지 않는다.

## 출력과 기존 계약

YongShenJudgment는 entity/stem/tenGod, confirmed/rejected/deferred, sourceCandidateIds, supporting/conflicting Fact IDs, Rule/evidence IDs, reasonCodes, assessment, blocking/context uncertainty, 후보 비교 trace, 실제 입력 RuntimeState와 기능 연결 근거를 담는다. trace의 본기/본기 외 복수구성 유지 사유는 실제 투출 Fact 연결에서 나온다.

confirmed 결과에만 기존 RoleState 계약의 `role=용신`, `status=evaluated`, `provisional=false`를 생성한다. I-02 ApplicationReference를 등록하고 기존 ContractBundle validator로 참조 연결을 검사한다. 다른 역할 RoleState는 만들지 않는다. 기존 후보/격국/상태 객체를 변경하지 않고 새 bundle을 만든다.

기존 후보 schema의 구조 payload와 candidate eligibility refinement를 분리했다. 최종 소비자는 payload의 원 status/assessment를 보존하여 provisional handoff를 deferred로 처리하며, source candidate를 재생성하거나 status를 고쳐서 승격하지 않는다. 기존 후보 producer가 사용하는 strict schema 조건은 그대로다.

통근과 원래의 출생·계산·독립 검산 미확보 provenance는 context로 유지한다. `evidenceIds`는 확정에 사용한 confirmed 근거만 담고 raw source를 임의 승격하지 않는다. source candidate/PatternJudgment의 핵심 uncertainty는 차단하되 원래 context 한계를 없애지 않는다.

## 검증

C215 C-10-1 항목4의 천간 용신 집합은 verify expected로만 사용한다. 불일치 시 후보·판단·evidence·trace를 출력하고 실패한다. 실제 CS-005 입력에서는 겸격의 년간 甲과 월간 丙을 함께 유지하며, 이는 C를 읽어 반환한 결과가 아니다. 상신·병·구응·길흉·운 평가는 구현하지 않는다.
