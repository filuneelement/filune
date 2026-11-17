# CS-005 실행 context / compatibility 준비도

기준: A rev179, C rev215, D rev152, 기존 mapping-A/C/D-H5 및 implementation-readiness와 preflight.
이번 단계는 context·참조 adapter·availability 정책·역할 인터페이스만 구현한다.
원문 규칙의 길흉 evaluator, 새 역할 선정, CS 기대값 fixture는 구현하지 않는다.

## 지장간 전체 비교

현재 표의 실제 표시 순서는 여기→중기→본기이며 의미 식별은 residual/middle/main key다.
D H-3-1의 표도 여기→중기→본기 순으로 기재한다. 표 이름의 본기·중기·여기를
저장 배열 순서라고 해석하지 않는다. 단일 source는 기존 HIDDEN_STEM_ROLE_TABLE 그대로다.

| 지지 | 현재 코드(여기/중기/본기) | 문서에서 직접 확인한 구성 | 비교 |
| --- | --- | --- | --- |
| 子 | 壬/—/癸 | D H-3-1 NT-03: 癸만 | 불일치: 壬 추가 |
| 丑 | 癸/辛/己 | D H-3-1 NT-04: 동일 | 일치 |
| 寅 | 戊/丙/甲 | D H-3-1 NT-08·09: 동일 | 일치 |
| 卯 | 甲/—/乙 | 이 확정 문서에서 전체 역할 목록 직접 확인 불가 | 정보 부족 |
| 辰 | 乙/癸/戊 | D H-3-1 NT-01: 동일 | 일치 |
| 巳 | 戊/庚/丙 | 전체 역할 목록 직접 확인 불가 | 정보 부족 |
| 午 | 丙/己/丁 | D H-3-1 NT-05: 동일 | 일치 |
| 未 | 丁/乙/己 | C C-10-1의 乙 존재는 확인되지만 전체 목록·순서 아님 | 정보 부족 |
| 申 | 戊/壬/庚 | 전체 역할 목록 직접 확인 불가 | 정보 부족 |
| 酉 | 庚/—/辛 | 전체 역할 목록 직접 확인 불가 | 정보 부족 |
| 戌 | 辛/丁/戊 | D H-3-1 NT-02·06·07: 동일 | 일치 |
| 亥 | 戊/甲/壬 | C C-10-1 CS-109는 기본 체계에 戊 없음. A C-10은 체계 차이 명시 | 불일치: 戊 추가 |

전체 및 CS-005 범위 결과는 **incompatible**이다.
CS-005 원국의 寅·辰·子·戌에 이미 子 차이가 있다. 현재 己未, 2026 丙午,
2027 丁未, 2027.1 辛丑까지의 필요한 지지는 子·丑·寅·辰·午·未·戌이다.
子 차이와 未의 문서 전체 목록 미확인을 이유 없이 무시하지 않는다.
亥의 차이는 12지지 전체 비교 결과이며 현재 좁은 slice에 별도로 강제 적용하지 않는다.

`compatible-with-metadata`는 일치하지 않는 부분을 허용한다는 뜻이 아니다.
명시 불일치는 없지만 문서 전체 row가 없는 경우에도 사용하며,
이때 `usableAsDocumentDefault:false`·`documentCoverageComplete:false`를 유지한다.
`compatible`은 요청 지지의 직접 확인 가능한 구성·역할이 일치하는 경우에 한정한다.
이 비교 함수의 문서 관찰값은 audit-only이며 계산용 새 지장간 표가 아니다.

십성은 기존 calculateTenGod을 유지한다. 새 verify는 D H-3-1의 실제 월지 지장간
십성 예시들을 읽어 기존 함수 결과와 대조한다. 원문의 한국어 명칭과 기존 TenGod
라벨의 표기 대응만 사용하며 새 생극/역할 공식을 만들지 않는다. 지장간 row 차이는
십성 계산식 차이와 구별한다.

## ExecutionScopeContext

`stage`, `includedScopes`, `excludedScopes`, `referenceTime`, `effectivePeriod`,
`selectedPeriodRefs`, 포함/제외 entity ID, 기간 선택 상태·uncertainty,
producer snapshot identity를 저장한다. 기간은 기존 canonical card 경계의 투영이다.
실제 기간을 caller가 명시하며 currentIndex나 현재 시계로 고르지 않는다.

| stage | includedScopes | excludedScopes |
| --- | --- | --- |
| natal | natal | greatLuck, yearlyLuck, monthlyLuck |
| greatLuck | natal, greatLuck | yearlyLuck, monthlyLuck |
| yearlyLuck | natal, greatLuck, yearlyLuck | monthlyLuck |
| monthlyLuck | natal, yearlyLuck, monthlyLuck | greatLuck |

OP-L01의 범위를 그대로 표현한다. 일진은 이번 최소 API 범위 밖이며 새 규칙을 만들지 않는다.
다른 연도/대운 카드도 그 sourceScope가 포함된다는 이유로 모두 직접 비교하지 않는다.
caller가 선택한 periodRef만 포함하며 referenceTime이 그 기간 밖이면 거부한다.
기간이 미확인이면 context는 unknown이고 후보 view는 deferred이며 기간을 추정하지 않는다.

Producer의 모든 관측 후보는 보존한다. selectExecutionCandidates는 context에서
명시한 모든 참가자가 포함된 후보의 view만 반환하고 원래 fact ID/관측 scope/provenance를
변경하지 않는다. 실제 application 및 contract execution scope binding은 향후 evaluator의 책임이다.
OP-L01 scope context는 승인/길흉/출판 판정이 아니다.

## CarryContext

빈 carry 또는 `UpstreamCarryInput {producerSnapshotIdentity,bundle}`만 받는다.
원본 canonical root 값의 snapshot identity가 다르면 upstream을 거부한다.
상태·승계·중복 소비·유효기간 검사는 기존 validateContractBundle에 위임한다.
context와 destination scope, producer entity 참조도 일치해야 한다.

현재 단계로 들어오는 원국 변화의 sourceStateId, sourceStage/sourceScope,
validFrom/To, causedByRuleIds, source snapshot/application identity를 view로 제공한다.
`provenance.kind:inherited`는 출처 설명이며 새로운 RuntimeState나 기능 정지를 생성하지 않는다.
carry 내용·처리 ledger·기존 소비 기록은 그대로 보존한다. adapter는 새 consume도 하지 않는다.
저장소/이벤트 dispatcher/실행 순서의 owner는 정하지 않는다.

## Evidence availability (57개 후보 전체 분류)

직접 independent-cross-check 요구: **C-02, OP-P04** (A C-02/OP-P04).
계산 단계의 upstream 독립 검증 gate: **C-01, C-03, C-04, C-05, C-06, C-07, C-08, OP-P02**
(D H-2 계층 1, H-5-2 단계 1~2, A-1-3).
나머지 47개 후보에는 별도의 독립 천문 계산을 각 규칙에서 다시 수행하라는 직접 요구를
추가하지 않는다. 기존 fact uncertainty, 역할 근거, C-10 compatibility 및 실제 입력 검증은 별개다.

위 10개는 관련된 confirmed independent-cross-check evidence가 없으면 availability가 deferred다.
이것은 고객 예측 적중 검증이나 새 외부 전문가 원고를 선행 조건으로 요구하는 정책이 아니다.
두 계산의 독립성·관측·날짜/간지 일치 등 기존 계산 검증 의무에 대한 gate다.
Rule ID에 관련된 evidence ID를 caller가 명시해야 하며, catalog에 아무 검증 기록이 있다는
이유만으로 통과하지 않는다. 출처 종류의 존재만으로 전체 Rule 실행을 허용하지 않는다.

실제 현재 공급:
- deterministic-calculation: producer가 실제 수행한 projection/lookup provenance.
- source-document: 실제 공급한 A/C/D 텍스트의 front matter revision·section 확인 기록.
  sourceDocumentEvidence는 provisional로 남긴다. 파일 존재가 내용 확정/독립 계산 확인은 아니다.
- customer-input: 실제 receipt provenance를 전달한 경우에만 기존 producer 기록 사용.
- independent-cross-check / operator-confirmed: 현재 공급 없음. 기록 생성/상태 승격 없음.
- reverse-inference: source 문서의 역산 설명과 별도로 정식 runtime 증거 공급은 아직 없음.

## Role judgment interface

RoleJudgmentInput/Output만 정의한다. Input은 context, fact/관계/근거 ID와 이전 application 참조다.
Output의 기본값은 not-evaluated 및 roles=[]이다. 격·용신은 A-8-1 I-01/I-02,
상신·병·구응은 A-8-2의 4~7단계 및 I-03/I-04를 참조하도록 boundary metadata를 둔다.
이는 알고리즘이 아니다. C 사례의 역할/최종 등급은 runtime input으로 넣지 않는다.

## CS-005 첫 slice의 A/B/C/D 준비도

표의 실행은 실제 Rule 결과 생성 여부다. Fact/context 공급 완료와 구분한다.

| 단계 | 필요한 Rule ID | 필요한 Fact | Scope | Carry | Evidence | Role judgment | 현재 실행 가능 여부 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A 원국 Fact | C-01~06, C-08~12; 구조 판정은 향후 I-01/I-02/I-03 | 네 기둥·십성·지장간·원국 관계·위치·시간정책·출처 | natal, 명시한 inspection period | 빈 carry; 원국 내부 판단은 향후 결과 | 기존 계산 provenance·문서 기준·역산 출생 출처·계산 독립 대조 | Fact 단계 없음. 격/용신 등의 자동 판정은 미실행 | Fact 관측/연결 가능. 문서 준수 판정은 지장간 차이 및 계산 gate로 deferred |
| B 己未 대운의 변화 | OP-T01/T02/T03/T04/T07/T08, I-08a, OP-L01/L02; 길흉은 I-03/I-04-1/I-04a 등 | 원국·선택한 대운·유효 합 후보·현재 원국 상태 참조 | natal + greatLuck | 원국 내부 결과가 있으면 upstream 공급; 새 원국 변화는 evaluator 책임 | 계산/관계 provenance·A 기준·해당 운 검증 | 합 상태 구조와 역할 판단 분리. 흉신/상신 등은 향후 역할 결과 필요 | Context/빈·upstream carry 전달 가능. 실제 변화 판정은 미구현 |
| C 2027 丁未 세운 상태 | OP-T10, OP-T03/T04/T07/T08, OP-L01/L02, IR-01; 역할·성패는 I-03/I-04/I-04a/I-04c 등 | 원국·선택 대운·입춘 이후 세운·기존 원국 변화 | natal + greatLuck + yearlyLuck | B가 만든 원국 변화만 유효기간 내 승계. 운끼리 약화는 승계하지 않음 | 상위 상태 application/evidence·세운 기간·A 기준 | 병 제거/성패 등은 향후 evaluator 역할·기능 결과 | Context는 공급 가능. 세운 상태/길흉 결과는 미구현 |
| D 2027.1 辛丑 월운 | OP-T10, OP-L01/L02, IR-01, OP-T03/T04/T07/T08, OP-L03; 지지는 OP-Z01/Z02/Z03/Z05/Z10/Z11/Z12/Z13 및 I-10/I-14 | 원국·丙午 세운·辛丑 월운·기능 상태·지지 관계 | natal + yearlyLuck + monthlyLuck; 대운 직접 관계 제외 | B 및 유효한 丙午 세운 단계의 원국 변화. C의 丁未 결과를 소급 승계하지 않음 | 기간·운끼리 합 순서·상위 처리 이력·축별 근거·A/C 출처 | 상신 기능 유지는 역할 결과 + 기능 결과를 함께 요구. 기대값 선주입 금지 | 제외 scope 후보 필터/참조 전달 가능. 실제 상신 유지·축별 판정은 미구현 |

2027년 1월은 丙午 세운에 속한다. C의 丁未 세운 snapshot은 D의 부모가 아니다.
D에는 별도의 유효한 丙午 세운 snapshot이 필요하며 생성 알고리즘은 이번에 구현하지 않는다.
위 표는 전체 57개 inventory 중 첫 단계의 주요 실행·증거 의무를 연결한다.
I-04b는 비적용 확인만 유지하고 OP-T11/OP-R01~03은 여전히 첫 구현 범위에서 제외한다.

## 구현 시작 조건 재평가

| 조건 | 결과 |
| --- | --- |
| CS-005에 필요한 문서 지장간 체계와 현행 표의 호환성 확인 | 불충족: 子 불일치, 未 전체 문서 row 미확인 |
| OP-L01 scope context 공급 | 완료 |
| carry provenance 전달·중복 검증 | 완료, 빈 carry 또는 명시적 upstream 필요 |
| required evidence 누락 Rule 식별 | 완료: 10개 계산/검증 gate가 현재 deferred |
| RoleState 생성 책임을 evaluator에 두는 interface | 완료, 자동 생성 없음 |
| 기대값을 runtime에 주입하지 않는 회귀 경계 | 유지: 기대값은 C-10 검증 쪽에만 사용 가능, 실제 evaluator/fixture는 없음 |

**CS-005 evaluator 구현 시작: NO.** 남은 최소 blocker는
(1) 사용 범위 지장간의 문서/현행 표 차이를 정식 입력 정책으로 해결할 것,
(2) 문서 준수 계산 실행을 주장하려면 독립 대조·역산/시각 provenance를 실제 공급할 것이다.
후자는 구조 검사 prototype 전체를 금지한다는 뜻은 아니며 해당 Rule은 deferred로 남길 수 있다.
실제 evaluator가 아직 없다는 사실 자체를 새 승인 blocker로 만들지는 않는다.
기존 표나 확정 문서를 이번 단계에서 수정하지 않는다.
