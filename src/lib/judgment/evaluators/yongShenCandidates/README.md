# FILUNE 천간 용신 후보

`evaluateYongShenCandidates`는 이미 생성된 PatternJudgment, 해당 PatternCandidate와 trace, 원국 Fact/상태, evidence를 소비한다. 격국·지장간·십신·투출·통근·합을 재계산하지 않는다. 모든 입력은 natal scope와 동일 producer provenance에 연결돼야 한다. 원문 C의 용신 기대값이나 case ID는 받지 않는다.

## 현행 근거와 용어 경계

- A179 A-8-1 I-01/I-02/C-10: 월령 중심의 격과 천간에 투출한 구성을 연결한다. 일간 및 비견·겁재는 독립 천간 용신 구성에서 제외한다. 겸격의 여러 천간 구성을 지지 본기 하나로 축소하지 않는다.
- A179 A-8-1 I-02a: 합거 뒤에도 투출/격 분류 사실은 유지하며 현재 기능 정지를 구분한다.
- A179 A-2-2 I-03: FILUNE의 월령 중심 정의와 용어 경계만 적용한다. 현행 A-8-1의 복수 천간 구성보다 앞선 정의를 우선하지 않는다. 원고의 ‘용신’을 일반적인 희용신/조후/억부 이론이나 다른 역할 확정으로 바꾸지 않는다.
- A179 A-8-2 I-04-1: 인·재·관·식 구성은 순용 구조 검토, 살·상 구성은 역용 구조 검토라는 **필요한 검토 방향**을 기록한다. 실제 보호/제어 관계, 성패 또는 최종 역할이 성립했다고 판정하지 않는다.

D152 Q16·H-3-1의 I-02 비겁 제외와 25-7 rev16 ① G-1/G-2 및 현행 역할 구분 정리를 대조했다. mapping-A와 implementation-readiness의 I-03/I-04-1 REVIEW를 범용 최종 역할 산출식으로 확대하지 않는다. I-03과 I-04-1 직접 절 receipt만 추가하며, I-03의 인접한 CS 예시/역할 배정 열은 receipt 인용에 넣지 않는다.

## 후보 조건과 제외/보류

확정 PatternJudgment의 selected trace와 정확히 연결되는 기존 PatternCandidate 구성만 독립 용신 후보 근거가 된다. PatternJudgment의 핵심 Fact와 evidence가 현재도 confirmed인지 다시 검사하되 판단 자체를 다시 실행하지 않는다. 해당 월령 투출·지장간 관측·십신·entity 및 parent assessment/provenance와 receipt가 일치해야 한다.

현재 기능이 active 또는 weakened로 공급되면 수치 임계값을 추가하지 않고 후보 가능성을 남긴다. stopped는 현재 기능이 없으므로 이 단계의 활성 후보를 확정적으로 주장하지 않고 deferred로 기록한다. 구조/투출 참조를 유지하며 stopped를 rejected로 바꾸지 않는다. 기능 정보 자체가 unknown이면 deferred다. 이 상태 처리는 새로운 천간합/약화 판정이 아니다.

일간·비겁 및 확정된 월령 투출 구성에 속하지 않는 천간은 이 slice의 독립 후보에서 rejected다. 이는 다른 비겁월 특수 구조나 미투출 잠재 용신에 대한 범용 부정이 아니다. 비겁월 특수 규정이나 미투출 구조가 upstream에서 해결되지 않았으면 downstream도 deferred다. 핵심 입력 provisional/unknown, 미완성 local coverage, scope/Fact 연결 불일치와 Rule receipt 부족도 deferred다.

통근은 후보의 참고 Fact ID로만 보존한다. 통근 수·오행 수·부족한 오행·일간 강약 점수로 후보나 순위를 정하지 않는다. 未/亥 및 NOT-SPECIFIED 목록을 월령 로컬 판단에 끌어오지 않는다. 입력의 전체 후보들을 entity ID로 정렬하는 것은 직렬화용이며 후보 우선순위가 아니다.

## 상태와 추적

`YongShenCandidate.status`는 candidate/rejected/deferred만 허용한다. `assessment=confirmed`는 **입력 근거의 확인 상태**이며 최종 용신 confirmed를 뜻하지 않는다. `roleBasis`는 원 PatternJudgment ID, source PatternCandidate IDs, 월령 지장간/투출·통근 참조, 십신과 원 RuntimeState, 검토 방향을 보존한다. supporting/conflicting Fact, Rule/evidence, blocking/context uncertainty와 단계별 trace도 보존한다. raw-source·출생·독립 검산 provenance는 원래 상태로 유지한다.

RoleState는 생성하지 않는다. 다른 역할 배정·길흉·운 평가는 생성하지 않는다. C215 C-10-1 항목4의 천간 투출 후보 구조는 verify의 expected로만 읽는다. CS-005의 甲·丙을 후보로 남기는 것은 후보 입력과 현행 I-02의 구조에서 나온 결과이며 최종 용신/다른 역할 확정이 아니다.
