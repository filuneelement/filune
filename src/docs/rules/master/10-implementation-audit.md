FILUNE v1 구현 감사표 및 정비 우선순위 v0.3
0. 문서 목적
이 문서는 현재 확정된 FILUNE 명리 판정 규칙을 실제 엔진 구현으로 옮기기 위한 최종 구현 감사표다.
기준 문서:
•	격국 판정 마스터 v1.2
•	PatternEffectPolicy v0.2
•	PatternEffectPolicy 출처감사 v0.2
•	상신·병·구응·성패 마스터 v0.3
•	대운·세운·월운·일진 통합판정 마스터 v0.4
•	엔진 통합 실행 명세 v0.3
목표는 세 가지다.
1. 문서상 확정 규칙과 코드 구조의 차이를 찾는다.
2. 구현 전에 반드시 필요한 P0 계약을 고정한다.
3. 회귀테스트가 가능한 순서로 구현한다.
________________________________________
1. 현재 감사 결론
IA-001
현재 가장 큰 구현 리스크는 개별 명리 공식이 아니다.
다음 다섯 가지 구조가 먼저 구현되어야 한다.
P0-1 PatternContext
P0-2 Stem Runtime State
P0-3 PatternEffectPolicy
P0-4 RoleHistory / CurrentFunction 분리
P0-5 Scope Snapshot
이 다섯 층이 없으면 이후 격별 판단을 구현해도 다시 뜯어고쳐야 한다.
________________________________________
2. 실제 코드 확인 범위
IA-002
현재 Project 자료에서 확인되는 판단 엔진 구조안에는 다음 계층이 존재한다.
src/lib/judgment/
  types.ts
  evaluateJudgments.ts
  facts/
  registry/
  policies/
  versions/
그리고 별도 검증 스크립트 구조가 제안되어 있다.
다만 현재 Project 파일만으로는 최신 저장소의:
internalReading.ts
stage.ts
PatternEffectPolicy 구현체
최신 E2E 스크립트
전체 소스 내용을 직접 감사할 수 없다.
따라서 이 문서의 코드 상태는:
문서상 필수 구현 계약
+
현재 Project에서 확인 가능한 코드 흔적
을 구분한다.
코드가 이미 존재한다고 추정하여 완료 처리하지 않는다.
________________________________________
3. 구현 상태 표기
IA-003
REQUIRED
문서상 반드시 구현해야 함

VERIFY
실제 코드에서 존재 여부 확인 필요

REFACTOR
기존 구조가 있더라도 새 계약에 맞춰 수정 필요

DEFERRED
규칙 미확정으로 구현 보류

TEST_REQUIRED
회귀테스트 없이는 완료 처리 금지
________________________________________
4. P0 — Pattern을 단일 값으로 저장하지 않는다
IA-P0-01
기존 위험
pattern: "wealth"
처럼 하나의 PatternType만 저장하는 구조.
필요한 구조
PatternContext
- branchPattern
- manifestedYongShen[]
- effectiveManifestedYongShen[]
- heavenlyPatterns[]
- patternMode
- yongShenRelations[]
상태
REQUIRED / REFACTOR
________________________________________
5. BranchPattern은 immutable history
IA-P0-02
NatalBranchPattern
은 월령 기준으로 한 번 확정한다.
운에서 교체하지 않는다.
운에서 바뀌는 것은:
CurrentHeavenlyPattern
CurrentPatternMode
CurrentManifestedYongShen
이다.
상태
REQUIRED
________________________________________
6. ManifestedYongShen은 배열이어야 한다
IA-P0-03
금지:
primaryYongShen: TenGod
만 존재.
필수:
manifestedYongShen: ManifestedYongShen[]
복수 투출을 보존해야 겸격을 구현할 수 있다.
상태
REQUIRED
________________________________________
7. ManifestationHistory와 EffectiveManifestation 분리
IA-P0-04
운 천간이 월령 지장간 성분으로 등장했다고 해서 최종적으로 항상 active인 것은 아니다.
합 처리 전에:
ManifestationHistory
를 기록하고,
Runtime 처리 후:
EffectiveManifestedYongShenSet
을 별도로 만든다.
이유
예:
운에서 YongShen 투출
→ 다른 운과 합
→ weakened

또는

운에서 YongShen 투출
→ 원국과 합거
→ stopped
가능.
상태
REQUIRED
________________________________________
8. provisional / final PatternContext 분리
IA-P0-05
운 scope에서는 최소 두 단계가 필요하다.
ProvisionalPatternContext
FinalPatternContext
실행:
LuckStem 등장
↓
potential manifestation 탐지
↓
ProvisionalPatternContext
↓
천간합 처리
↓
Runtime 확정
↓
EffectiveYongShenSet 재계산
↓
FinalPatternContext
상태
REQUIRED
________________________________________
9. PatternMode
IA-P0-06
최소:
proper
transformed
combined
month_command_unusable
special_peer_pattern
을 지원한다.
상태
REQUIRED
________________________________________
10. 겸격 유정·무정
IA-P0-07
복수 YongShen이면 반드시:
YongShenRelation[]
을 만든다.
favorable_harmony
unfavorable_conflict
mixed
deferred
등 상태를 지원한다.
상태
REQUIRED
________________________________________
11. Stem Relation action 분리
IA-P0-08
현재 Relation 타입은 최소 다음을 구분해야 한다.
generate
control
combine
특히:
control != combine
이어야 한다.
상태
REQUIRED
________________________________________
12. 食神制殺 / 傷官剋殺 / 傷官合殺 타입 분리
IA-P0-09
세 구조를 절대로 하나의 kill_control로 구현하지 않는다.
FoodGodControlsKilling
source = FoodGod
action = control
target = SevenKilling
HurtingOfficerControlsKilling
source = HurtingOfficer
action = control
target = SevenKilling
HurtingOfficerCombinesKilling
source = HurtingOfficer
action = combine
target = SevenKilling
상태
REQUIRED / TEST_REQUIRED
________________________________________
13. FormulaFact를 RelationFact와 분리
IA-P0-10
RelationFact:
傷官 → 合 → 七殺
과 NamedFormula:
HurtingOfficerCombinesKilling
을 별도로 저장한다.
권장:
FormulaFact {
  formulaType
  relationFactIds[]
  patternContextId
  validity
}
상태
REQUIRED
________________________________________
14. 천간 RuntimeState
IA-P0-11
최소:
active
weakened
stopped
를 지원한다.
weakened와 stopped를 하나로 합치지 않는다.
상태
REQUIRED
________________________________________
15. 운-운 합과 운-원국 합을 다른 규칙으로 구현
IA-P0-12
현행 A-8 규칙:
운 ↔ 운
valid combine
→ 양쪽 weakened
운 ↔ 원국
valid combine
→ 양쪽 stopped
이다.
운끼리 합은 합거가 아니라 작용력 약화이고, 남은 운 천간만 원국 합을 검토한다.
상태
REQUIRED / TEST_REQUIRED
________________________________________
16. 운끼리 합을 먼저 처리
IA-P0-13
실행 순서:
1. 현재 direct scope의 운↔운 합 검색
2. 운↔운 합 우선 적용
3. 양쪽 weakened
4. 해당 운 천간은 원국과 재합 금지
5. 남은 운 천간만 원국 합 검색
6. 운↔원국 유효합 → 양쪽 stopped
이전 원국 합 우선 로직은 사용하지 않는다.
상태
REQUIRED
________________________________________
17. 복수 운 합 상대 우선순위
IA-P0-14
한 운 천간이 복수 운 천간과 합 가능:
Daewoon
→ Sewoon
→ Month
→ Day
순으로 하나만 선택한다.
같은 합으로 나머지 상대를 중복 약화하지 않는다.
상태
REQUIRED / TEST_REQUIRED
________________________________________
18. 일간합 예외
IA-P0-15
일간이 참여하는 합은 일반 운세 합거로 처리하지 않는다.
운 십신의 기능을 자동 삭제하지 않는다.
상태
REQUIRED
________________________________________
19. PatternEffectPolicy Layer가 별도 필요
IA-P0-16
RelationFact에 길흉을 저장하지 않는다.
필수 구조:
RelationFact
+
PatternContext
→ PatternEffectPolicy
→ ActualStructuralFunction
상태
REQUIRED
________________________________________
20. PatternEffectPolicy Registry
IA-P0-17
권장 구조:
PatternEffectPolicy {
  policyId

  branchPattern
  patternMode
  activeYongShenTypes[]
  relationType

  defaultDirection

  requiredConditions[]
  reversalConditions[]
  exceptions[]

  evidenceStatus
}
상태
REQUIRED
________________________________________
21. 財剋印을 전역 Policy로 만들지 않는다
IA-P0-18 — CORE
금지:
WealthControlsResource:
  direction = unfavorable
또한 금지:
WealthControlsResource:
  direction = context_dependent
하나만 정의.
반드시 격별 Policy를 분리한다.
________________________________________
22. 재격 財剋印
IA-P0-19
branchPattern = Wealth
relation = WealthControlsResource
Expected:
direction = favorable
상태
REQUIRED / TEST_REQUIRED
________________________________________
23. 인수격 財剋印
IA-P0-20
branchPattern = Resource
relation = WealthControlsResource
Expected:
direction = unfavorable
상태
REQUIRED / TEST_REQUIRED
________________________________________
24. 인다용재
IA-P0-21
branchPattern = Resource
resourceState = excessive
relation = WealthControlsResource
Expected:
direction = favorable
formula = ResourceExcessUsesWealth
상태
REQUIRED / TEST_REQUIRED
________________________________________
25. 식신격의 財剋害食之印
IA-P0-22
branchPattern = FoodGod
Resource attacks FoodGod
Wealth controls Resource
이면 Wealth→Resource가 식신 보호 경로로 favorable 가능.
상태
REQUIRED
________________________________________
26. ActualStructuralFunction Layer
IA-P0-23
Policy 결과는 최종 결과가 아니다.
권장:
ActualStructuralFunction {
  relationFactId
  patternContextId
  policyId

  rootEvidence[]
  runtimeEvidence[]
  formationEvidence[]

  direction
  function
}
상태
REQUIRED
________________________________________
27. RoleHistory와 CurrentState 분리
IA-P0-24
YongShen·SangShen·Byeong·GuEung 모두:
roleHistory
currentState
currentFunction
을 분리한다.
예:
RoleHistory = Byeong
CurrentState = stopped
CurrentFunction = inactive
가능.
상태
REQUIRED
________________________________________
28. 운에서 새 SangShenRole 생성 금지
IA-P0-25
운 글자가 좋은 역할을 한다면:
LuckSupportEffect
를 만든다.
새 원국 SangShenRole을 만들지 않는다.
상태
REQUIRED
________________________________________
29. 운에서 새 ByeongRole 생성 금지
IA-P0-26
운 글자가 문제를 만들면:
LuckAdverseEffect
또는 기존 ConditionalByeong을 활성화한다.
상태
REQUIRED
________________________________________
30. 운에서 새 GuEungRole 생성 금지
IA-P0-27
운이 병을 해결하면:
LuckReliefEffect
로 처리한다.
상태
REQUIRED
________________________________________
31. ConditionalByeong
IA-P0-28
원국의 현재 좋은 기능과 미래 병 가능성을 동시에 저장할 수 있어야 한다.
예:
財:
  CurrentFunction = favorable
  ConditionalByeong = can_generate_future_killing
상태
REQUIRED
________________________________________
32. 재격 財剋印은 Byeong 생성 금지
IA-P0-29
WealthPattern
+
WealthControlsResource
Expected:
direction = favorable
Byeong = false
상태
REQUIRED / TEST_REQUIRED
________________________________________
33. 인수격 財剋印은 Byeong 후보
IA-P0-30
ResourcePattern
+
WealthControlsResource
Expected:
direction = unfavorable
ByeongCandidate = true
상태
REQUIRED
________________________________________
34. Scope별 immutable Snapshot
IA-P0-31
필수:
NatalState
DaewoonState
SewoonState
MonthState
DayState
하위 scope에서 상위 State를 직접 mutate하지 않는다.
상태
REQUIRED
________________________________________
35. direct scope와 Formation pool 분리
IA-P0-32
ordinary relation:
OP-L01 scope
과 Formation 탐지용:
FormationBranchPool
을 별도 데이터로 관리한다.
상태
REQUIRED
________________________________________
36. FormationBranchPool
IA-P0-33
Daewoon:
Natal + Daewoon

Sewoon:
Natal + Daewoon + Sewoon

Month:
Natal + Daewoon + Sewoon + Month

Day:
Natal + Daewoon + Sewoon + Month + Day
이를 ordinary relation scope로 재사용하지 않는다.
상태
REQUIRED
________________________________________
37. RootFact / RootState 분리
IA-P0-34
RootFact
RootState
를 별도 타입으로 둔다.
RootState
absent
present
strengthened
weakened
상태
REQUIRED
________________________________________
38. stopped는 Root 강화로 해제되지 않는다
IA-P0-35
RuntimeState = stopped
+
RootState strengthened
이어도:
RuntimeState = stopped
유지.
상태
REQUIRED / TEST_REQUIRED
________________________________________
39. P0 최종 구현 순서
IA-P0-36
P0 내부에서도 다음 순서로 구현한다.
1. Core types
2. PatternContext
3. Stem Runtime
4. RelationFact action 분리
5. PatternEffectPolicy Registry
6. ActualStructuralFunction
7. RoleHistory / CurrentState
8. Scope Snapshot
9. Formation pool
10. P0 regression tests
명리 세부 Policy를 대량 작성하기 전에 이 골격부터 고정한다.
________________________________________
40. P1 — 격별 Policy Registry 구현
IA-P1-01
P0 완료 후 다음 순서로 Policy를 채운다.
정관격
칠살격
재격
인수격
식신격
상관격
비견격
겁재격
양인격
상태
REQUIRED AFTER P0
________________________________________
41. P1 — 정관격
IA-P1-02
최소 구현:
財生官 → favorable
印護官 → favorable
傷官見官 → unfavorable
官殺混雜 → unfavorable_candidate
去殺留官 → favorable
傷官合混殺 → favorable
상태
REQUIRED
________________________________________
42. P1 — 칠살격
IA-P1-03
최소:
食神制殺
殺印相生
財生殺
官殺混雜
去官留殺
傷官剋殺
재생살은 자동 흉이 아니라 칠살 상태를 함께 본다.
상태
REQUIRED
________________________________________
43. P1 — 재격
IA-P1-04
최소:
食神生財 → favorable
財生官 → favorable
財 + 印 → favorable
財剋印 → favorable
比劫剋財 → unfavorable_candidate
財生害殺 → unfavorable_candidate
食神制害殺 → favorable
傷官剋害殺 → favorable
傷官合害殺 → favorable
상태
REQUIRED / HIGH PRIORITY
________________________________________
44. P1 — 인수격
IA-P1-05
官生印
殺印相生
財剋印
印多用財
食傷泄秀
구현.
상태
REQUIRED
________________________________________
45. P1 — 식신격
IA-P1-06
食神生財
食神制殺
偏印奪食
財剋害食之印
상태
REQUIRED
________________________________________
46. P1 — 상관격
IA-P1-07
傷官生財
傷官佩印
傷官見官
傷官剋殺
傷官合殺
상태
REQUIRED
________________________________________
47. P1 — 비견·겁재·양인
IA-P1-08
이 셋은 같은 peerPatternPolicy 하나로 합치지 않는다.
각각 별도 Registry branch 필요.
상태
REQUIRED
________________________________________
48. P1 — 비견격
IA-P1-09
FILUNE override:
main = 正官, 財
auxiliary = 食傷
SevenKillingAsMain = false
상태
FILUNE_APPROVED_OVERRIDE
________________________________________
49. P1 — 겁재격
IA-P1-10
正官
七殺
財
주 후보.
食傷 보조.
정밀 우선순위는 아직 DEFERRED.
상태
PARTIAL / DEFERRED
________________________________________
50. P1 — 양인격
IA-P1-11
SevenKilling > DirectOfficer > Wealth
식상은 보조.
필요한 칠살을 제살/합살하면 불리 가능.
상태
FILUNE_APPROVED_OVERRIDE
________________________________________
51. P1 — Role Engine
IA-P1-12
Policy 결과를 이용해:
identifySangShen
identifyProtectiveSangShen
identifyActiveByeong
identifyConditionalByeong
identifyGuEung
를 구현한다.
Policy보다 먼저 Role을 찾으면 안 된다.
상태
REQUIRED
________________________________________
52. P1 — No-Byeong 지원
IA-P1-13
모든 명식에 병을 강제로 만들지 않는다.
confirmed
conditional
none
deferred
지원.
상태
REQUIRED
________________________________________
53. P1 — GuEung target 필수
IA-P1-14
GuEung.targetByeongId
필수.
target 없는 “좋은 글자”를 GuEung으로 만들지 않는다.
상태
REQUIRED
________________________________________
54. P1 — Dynamic Luck Pattern
IA-P1-15
각 운에서:
potential manifestation
→ runtime
→ final PatternContext
→ Policy re-resolution
→ RoleState update
구현.
상태
REQUIRED / HIGH PRIORITY
________________________________________
55. P1 — immediate-parent scope
IA-P1-16
일반 direct relation과 별도로:
Sewoon ↔ Daewoon
Month ↔ Sewoon
Day ↔ Month
처리.
상태
REQUIRED
________________________________________
56. P1 — 운끼리 합 테스트
IA-P1-17
테스트:
운 A + 운 B 합
→ weakened
→ stopped 아님
→ 원국과 재합 금지
A-8 현행 규칙과 맞춰야 한다.
상태
TEST_REQUIRED
________________________________________
57. P1 — 원국-운 합거 테스트
IA-P1-18
LuckStem + NatalStem valid combine
→ both stopped
단:
•	일간 제외
•	이미 stopped 상대 제외
•	원국 복수 상대 우선순위 반영
상태
TEST_REQUIRED
________________________________________
58. P1 — 복수 운 상대 테스트
IA-P1-19
same luck stem
+ multiple luck combination candidates
Expected:
Daewoon → Sewoon → Month → Day
하나만 선택.
상태
TEST_REQUIRED
________________________________________
59. P1 — PatternContext 변화 테스트
IA-P1-20
최소:
none → proper
none → transformed
proper → combined
transformed → combined
combined → effective single after stop
검증.
상태
TEST_REQUIRED
________________________________________
60. P1 — 財剋印 4-case 회귀
IA-P1-21
반드시 네 케이스를 독립 테스트한다.
A. 財格 + 財剋印
   → favorable

B. 印格 + 財剋印
   → unfavorable

C. 印格 + 印過多 + 財剋印
   → favorable

D. 食神格 + 偏印奪食 + 財剋印
   → favorable
상태
TEST_REQUIRED / BLOCKING
________________________________________
61. P1 — 칠살 처리 3-way 회귀
IA-P1-22
食神制殺
傷官剋殺
傷官合殺
각각 다른 action과 Runtime 결과를 가져야 한다.
상태
TEST_REQUIRED / BLOCKING
________________________________________
62. P1 — 傷官合殺 격별 회귀
IA-P1-23
정관격
官殺混雜
+ 傷官合殺
→ favorable
재격
財生害殺
+ 傷官合殺
→ favorable
양인격
七殺制刃
+ 傷官合殺
→ unfavorable
상태
TEST_REQUIRED
________________________________________
63. P1 — ConditionalByeong 회귀
IA-P1-24
Natal:
食神 → 生 財

Luck:
七殺 enters
Expected:
食神生財 retained
財生殺 added
食神制殺 added if valid
ConditionalByeong activated
하나의 경로로 덮어쓰지 않는다.
상태
TEST_REQUIRED
________________________________________
64. P1 — Multiple concurrent path engine
IA-P1-25
현재 엔진은 반드시 동시에 여러 Path를 보존할 수 있어야 한다.
예:
食神生財
財生殺
食神制殺
동시 존재.
상태
REQUIRED
________________________________________
65. P2 — Palace Interpretation
IA-P2-01
구조 판정 후:
Relation
→ Palace
→ TenGod
→ StructuralRole
→ Outcome
→ LifeDomain
구현.
상태
AFTER CORE ENGINE
________________________________________
66. P2 — ExperiencedProcess
IA-P2-02
StructuralOutcome
ExperiencedProcess
분리.
좋은 운도 어렵게 체감될 수 있다.
상태
AFTER P1
________________________________________
67. P2 — 고객 렌더링
IA-P2-03
내부 용어:
YongShen
SangShen
Byeong
GuEung
을 고객에게 그대로 노출하지 않는다.
Product/Renderer layer에서 현실 언어로 번역한다.
상태
SEPARATE PRODUCT LAYER
________________________________________
68. 기존 judgment 구조와의 정합성
IA-200
현재 Project에 남아 있는 설계안은:
CalculatedChart
→ Deterministic Engine
→ JudgmentResult
→ Product Projection
처럼 계산·판정·상품표현을 분리하려는 방향이다.
이 방향은 현재 FILUNE 구조와 맞다.
따라서 유지한다.
________________________________________
69. 현재 코드에서 우선 확인해야 할 파일
IA-201
실제 저장소 연결 후 가장 먼저 확인:
src/lib/judgment/types.ts
src/lib/judgment/evaluateJudgments.ts
src/lib/judgment/facts/*
src/lib/judgment/registry/*
src/lib/judgment/policies/*
그리고 현재 파이프라인이 별도 존재한다면:
src/lib/judgment/pipeline/internalReading.ts
src/lib/judgment/pipeline/stage.ts
도 함께 확인한다.
________________________________________
70. types.ts 감사 포인트
IA-202
다음 타입 존재 여부 확인.
PatternContext
ManifestedYongShen
YongShenRelation
StemRelationFact
FormulaFact
StemRuntimeState
RootFact
RootState
PatternEffectPolicy
PolicyResolution
ActualStructuralFunction
StructuralRole
Byeong
GuEung
LuckEffect
LuckScopeState
없으면 P0로 추가한다.
________________________________________
71. 기존 OperatorReview와 명리 provenance를 섞지 않는다
IA-203
현재 자료상 OperatorReview.status에는:
auto-approved
review-required
blocked
가 존재하는 것으로 확인된다.
이것은:
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
와 다른 개념이다.
따라서 별도 필드여야 한다.
________________________________________
72. EvidenceStatus와 OperatorReview 분리
IA-204
예:
evidenceStatus = FILUNE_APPROVED_OVERRIDE

operatorReview.status = auto-approved
가능.
둘을 하나의 enum으로 합치지 않는다.
________________________________________
73. Registry 검증 필요
IA-205
Registry 로딩 시 최소 검사:
policyId unique
required conditions valid
relationType valid
branchPattern valid
evidenceStatus present
deferred policy cannot silently execute
상태
REQUIRED
________________________________________
74. deterministic engine에서 숫자 점수 금지
IA-206
다음 형태 금지.
policyWeight
goodScore
badScore
luckWeight
rootMultiplier
정성적 구조 판정만 사용한다.
________________________________________
75. regression fixture 기준
IA-210
기존 CS 사례:
CS-005
CS-109
CS-126
CS-127
를 계속 핵심 회귀세트로 사용한다.
기존 문서에서도 해당 사례를 판단 엔진의 주요 회귀 기준으로 사용하고 있다.
________________________________________
76. 기존 기대값을 무단 변경하지 않는다
IA-211
새 엔진 규칙을 구현했다고 기존 C/25-7 고정 기대값을 자동 수정하지 않는다.
차이가 나면:
rule change
test failure
old expectation conflict
중 무엇인지 먼저 판정한다.
________________________________________
77. 신규 Policy 전용 fixture 필요
IA-212
기존 CS만으로 새 Policy 전부를 검증할 수 없다.
따라서 다음 최소 fixture 추가 필요.
PF-WR-01 財格 財剋印
PF-WR-02 印格 財剋印
PF-WR-03 印多用財
PF-KC-01 食神制殺
PF-KC-02 傷官剋殺
PF-KC-03 傷官合殺
PF-KC-04 양인격 필요殺 합거
PF-PC-01 transformed→combined
PF-PC-02 combined→effective-single
________________________________________
78. 구현 완료 기준
IA-220
P0 완료는 코드가 컴파일된다는 뜻이 아니다.
다음이 모두 충족되어야 한다.
1. 타입 계약 완료
2. deterministic execution 순서 고정
3. immutable scope snapshot 확인
4. Policy Registry 검증
5. Runtime precedence 검증
6. P0 regression 통과
7. 기존 CS 회귀 무손상 확인
________________________________________
79. P1 완료 기준
IA-221
1. 9개 격 기본 Policy 구현
2. 財剋印 4-case 통과
3. 제살/합살 3-way 통과
4. 격별 傷官合殺 통과
5. Dynamic PatternContext 통과
6. RoleHistory / CurrentFunction 통과
7. ConditionalByeong 통과
8. 기존 CS 회귀 통과
________________________________________
80. P2 완료 기준
IA-222
Palace
ExperiencedProcess
LifeDomainInterpretation
Product Projection
이 deterministic engine을 오염시키지 않고 별도 층으로 연결되어야 한다.
________________________________________
81. 현재 P0 Blocking 항목
IA-230
다음 중 하나라도 미구현이면 PatternEffectPolicy 대량 구현을 시작하지 않는다.
[ ] PatternContext
[ ] provisional/final PatternContext
[ ] ManifestationHistory
[ ] EffectiveManifestedYongShenSet
[ ] StemRuntime active/weakened/stopped
[ ] luck-luck combine precedence
[ ] luck-natal stop
[ ] PatternEffectPolicy Registry
[ ] ActualStructuralFunction
[ ] RoleHistory / CurrentState
[ ] immutable LuckScopeState
________________________________________
82. 현재 P1 Blocking 테스트
IA-231
[ ] 財格 財剋印 favorable
[ ] 印格 財剋印 unfavorable
[ ] 印多用財 favorable

[ ] 食神制殺 control
[ ] 傷官剋殺 control
[ ] 傷官合殺 combine

[ ] 정관격 傷官合殺 favorable
[ ] 재격 傷官合殺 favorable
[ ] 양인격 傷官合殺 unfavorable

[ ] transformed → combined
[ ] combined YongShen stopped → effective pattern 재계산
________________________________________
83. 코드 정비 최우선 순서
IA-240
실제 구현 착수 시 권장 작업 순서:
STEP 1
judgment core types 확장

STEP 2
PatternContext builder 작성

STEP 3
Stem runtime resolver 작성

STEP 4
luck-luck / luck-natal combine resolver 작성

STEP 5
effective PatternContext finalizer 작성

STEP 6
PatternEffectPolicy Registry 작성

STEP 7
ActualStructuralFunction resolver 작성

STEP 8
Role engine 연결

STEP 9
LuckScope pipeline 연결

STEP 10
P0/P1 회귀 테스트

STEP 11
기존 CS 회귀

STEP 12
Palace / Interpretation
________________________________________
84. 구현에서 먼저 만들지 말아야 할 것
IA-241
다음부터 만들지 않는다.
고객용 문장
AI 해석 프롬프트
격별 장문 해설
길흉 점수
운 가중치
세부 Palace 문장
판정 코어가 안정된 뒤 붙인다.
________________________________________
85. 코드 레이어 권장 구조
IA-250
src/lib/judgment/

  types/
    pattern.ts
    relation.ts
    runtime.ts
    roles.ts
    outcome.ts
    luck.ts

  pattern/
    monthCommand.ts
    manifestedYongShen.ts
    patternContext.ts

  relations/
    stems.ts
    branches.ts
    formations.ts

  runtime/
    stemCombination.ts
    roots.ts
    capacity.ts

  policies/
    patternEffect/
      types.ts
      registry.ts
      officer.ts
      sevenKilling.ts
      wealth.ts
      resource.ts
      foodGod.ts
      hurtingOfficer.ts
      peer.ts
      robWealth.ts
      yangBlade.ts

  roles/
    sangShen.ts
    byeong.ts
    guEung.ts

  pipeline/
    natal.ts
    luckScope.ts
    internalReading.ts
기존 구조가 다르다면 파일명을 억지로 맞출 필요는 없지만 책임 경계는 유지해야 한다.
________________________________________
86. PatternContext builder 책임
IA-251
PatternContext builder는 다음까지만 한다.
BranchPattern
Manifestation
HeavenlyPattern
PatternMode
YongShenRelation
길흉 판단을 하지 않는다.
________________________________________
87. Relation engine 책임
IA-252
Relation engine은:
누가
무엇을
누구에게
했는지만 만든다.
good/bad
를 반환하지 않는다.
________________________________________
88. PatternEffectPolicy 책임
IA-253
Policy는:
이 PatternContext에서 이 관계의 기본 구조 방향은 무엇인가
만 반환한다.
Runtime 최종판정을 하지 않는다.
________________________________________
89. Runtime resolver 책임
IA-254
다음 실제 작동 여부 판정:
•	stopped
•	weakened
•	RootState
•	Formation effect
•	Capacity
________________________________________
90. Role engine 책임
IA-255
Runtime까지 반영된 ActualStructuralFunction을 기준으로:
SangShen
Byeong
ConditionalByeong
GuEung
을 판정한다.
________________________________________
91. Outcome engine 책임
IA-256
Role 개수를 합산하지 않고 전체 구조를 평가한다.
成
有利優勢
不利優勢
敗
________________________________________
92. 가장 중요한 회귀 원칙
IA-260
다음 테스트가 서로 독립적으로 통과해야 한다.
Fact correctness
Pattern correctness
Runtime correctness
Policy correctness
Role correctness
Scope correctness
Outcome correctness
최종 결과만 맞고 중간 상태가 틀린 것을 성공으로 보지 않는다.
________________________________________
93. 테스트가 확인해야 할 evidence
IA-261
가능하면 결과에:
ruleId
policyId
evidenceStatus
inputsUsed
relationFactId
patternContextId
를 남긴다.
회귀 실패 시 어떤 규칙이 바뀌었는지 추적할 수 있어야 한다.
________________________________________
94. 구현 금지 최종표
IA-270
Codex는 다음을 구현하지 않는다.
•	단일 PatternType
•	단일 대표 YongShen만 저장
•	RelationFact에 길흉 저장
•	財剋印 전역 방향
•	財剋印 = context_dependent 하나로 처리
•	食神制殺/傷官剋殺/傷官合殺 통합
•	control/combine 통합
•	weakened/stopped 통합
•	운-운 합 full stop
•	운-원국 합 단순 약화
•	운-운 합 이후 원국과 재합
•	Root 강화로 stopped 해제
•	운에서 원국 RoleHistory 덮어쓰기
•	모든 명식에 Byeong 강제
•	운 글자에 새 GuEungRole 생성
•	Formation과 ordinary branch relation 통합
•	숫자 길흉 점수
•	운 가중치 점수
•	Palace만으로 사건 확정
•	source inference를 source explicit로 표시
________________________________________
95. 구현 준비도 최종 판정
IA-280
명리 규칙 정의
READY
핵심 구조는 현재 구현 가능한 수준까지 정리됐다.
데이터 계약
P0 IMPLEMENTATION REQUIRED
PatternContext·Runtime·Policy·Role·Scope 타입 확정 필요.
격별 Policy
P1 READY
단 P0 코어 이후 구현.
전체 회귀
TEST EXPANSION REQUIRED
기존 CS 외 신규 Policy fixture 필요.
현실 해석
P2
엔진 판정 안정화 이후.
________________________________________
96. 최종 정비 우선순위
P0
1. PatternContext
2. ManifestationHistory / EffectiveManifestation
3. StemRuntimeState
4. 운-운 합 우선처리
5. 운-원국 합거
6. PatternEffectPolicy Registry
7. ActualStructuralFunction
8. RoleHistory / CurrentFunction
9. immutable ScopeState
10. FormationBranchPool
P1
1. 정관·칠살·재·인·식신·상관 Policy
2. 비견·겁재·양인 특수 Policy
3. SangShen / Byeong / GuEung
4. Dynamic luck PatternContext
5. ConditionalByeong
6. 격별 Policy regression
7. 기존 CS regression
P2
1. Palace
2. ExperiencedProcess
3. LifeDomainInterpretation
4. 고객용 Renderer
________________________________________
97. 구현 착수 기준
다음 체크가 모두 끝나면 실제 엔진 구현 단계로 넘어간다.
[ ] PatternContext schema 확정
[ ] RuntimeState schema 확정
[ ] RelationAction schema 확정
[ ] FormulaFact schema 확정
[ ] PatternEffectPolicy schema 확정
[ ] ActualStructuralFunction schema 확정
[ ] StructuralRole schema 확정
[ ] LuckScopeState schema 확정
[ ] P0 fixture 정의
[ ] P1 신규 fixture 정의
________________________________________
98. 최종 결론
현재 FILUNE의 구현 핵심은 더 이상:
“정관격이면 무엇이 좋은가?”
수준이 아니다.
실제 엔진은:
MonthCommand
↓
BranchPattern
↓
ManifestationHistory
↓
ProvisionalPatternContext
↓
Stem Runtime
↓
EffectiveManifestedYongShen
↓
FinalPatternContext
↓
RelationFact
↓
PatternEffectPolicy
↓
Root / Formation / Capacity
↓
ActualStructuralFunction
↓
SangShen / Byeong / GuEung
↓
Stem / Branch Outcome
↓
Luck Scope Snapshot
↓
Interpretation
구조로 구현해야 한다.
특히 구현상 절대 흔들리면 안 되는 규칙은 다음 네 가지다.
財格 + 財剋印
→ favorable
印格 + 財剋印
→ unfavorable

印格 + 印過多
→ favorable
食神制殺
≠ 傷官剋殺
≠ 傷官合殺
그리고 운에서는:
운↔운 합 먼저
→ weakened
→ 원국 재합 금지

남은 운↔원국 유효합
→ stopped
이다.
이 계약을 P0로 먼저 구현한 뒤 격별 Policy를 올리는 것이 현재 가장 안전한 구현 순서다.

