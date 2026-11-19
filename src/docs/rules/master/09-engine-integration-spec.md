FILUNE v1 엔진 통합 실행 명세 v0.3
0. 문서 목적
이 문서는 FILUNE v1 명리 판정 엔진의 최상위 실행 계약이다.
개별 이론을 설명하는 문서가 아니라 다음 마스터 규칙을 실제 엔진 실행 순서로 연결한다.
•	월령·격국
•	BranchPattern / HeavenlyPattern
•	정격·변격·겸격
•	ManifestedYongShen
•	PatternEffectPolicy
•	천간 생·극·합
•	지지 합·충·형·파·해
•	Formation
•	Root / 12운성
•	DayMasterCapacity
•	SangShen
•	Byeong
•	ConditionalByeong
•	GuEung
•	대운·세운·월운·일진
•	Stem / Branch StructuralOutcome
•	Palace
•	현실 해석
________________________________________
1. 최상위 판정 구조
EX-001
FILUNE 엔진은 다음 층을 분리한다.
Fact
↓
PatternContext
↓
Policy
↓
RuntimeState
↓
ActualStructuralFunction
↓
Role
↓
Outcome
↓
Interpretation
이 층들을 하나의 good/bad score로 합치지 않는다.
________________________________________
2. Fact Layer
EX-002
Fact에는 관찰 가능한 관계만 저장한다.
예:
財 → 剋 → 印
食神 → 剋 → 七殺
傷官 → 合 → 七殺
亥卯未 완성
甲이 寅에 통근
Fact 자체에는 기본 길흉을 저장하지 않는다.
________________________________________
3. 동일 생극도 PatternContext에 따라 방향이 다르다
EX-003 — CORE
대표적으로:
財 → 剋 → 印
은 동일한 RelationFact지만:
財格
→ favorable

印格
→ unfavorable

印格 + 印過多
→ favorable
가 된다.
따라서 다음 전역 규칙은 금지한다.
財剋印 = bad
또한:
財剋印 = context_dependent
하나로 뭉뚱그리는 것도 금지한다.
PatternContext가 확정되면 기본 방향도 확정한다.
________________________________________
4. RelationAction을 분리한다
EX-004
최소 다음을 구분한다.
generate
control
combine
protect
drain
formation_strengthen
특히:
control ≠ combine
이다.
________________________________________
5. 食神制殺·傷官剋殺·傷官合殺을 분리한다
EX-005 — CORE
FoodGodControlsKilling
食神 → control → 七殺
•	七殺 약화 가능
•	양쪽 자동 stopped 아님
HurtingOfficerControlsKilling
傷官 → control → 七殺
•	七殺 약화 가능
•	상관합살과 별개
HurtingOfficerCombinesKilling
傷官 → combine → 七殺
•	실제 유효 천간합 필요
•	합거 조건 충족 시 양쪽 stopped 가능
세 가지를 동일 kill_control 타입으로 만들지 않는다.
________________________________________
6. BranchPattern과 HeavenlyPattern을 분리한다
EX-010
Pattern을 하나의 enum으로 저장하지 않는다.
최소:
BranchPattern
ManifestedYongShen[]
HeavenlyPatterns[]
PatternMode
YongShenRelations[]
로 나눈다.
________________________________________
7. BranchPattern
EX-011
BranchPattern은 원국 월령 자체의 십신 격이다.
운에서 변경하지 않는다.
NatalBranchPattern = immutable history
________________________________________
8. 월령 지장간 후보
EX-012
월령의 모든 지장간을 후보로 수집한다.
MonthHiddenStemCandidate
- stem
- tenGod
- sourceClass
  - main
  - middle
  - residual
FILUNE 우선순위:
본기 > 중기 = 여기
________________________________________
9. ManifestedYongShen
EX-013
사용 가능한 월령 지장간 성분이 천간에 투출하면 ManifestedYongShen이 된다.
배열로 관리한다.
ManifestedYongShen[]
하나만 대표로 남기지 않는다.
________________________________________
10. MonthCommandRoot
EX-014
월령 지장간에서 투출한 ManifestedYongShen은 월령에 출처를 가진다.
따라서 기본적으로:
MonthCommandRoot = true
이다.
rootless ManifestedYongShen을 만들지 않는다.
________________________________________
11. 정격
EX-020
월령 본기가 투출하고 다른 YongShen 투출이 없으면:
PatternMode = proper
________________________________________
12. 변격
EX-021
본기가 아닌 사용 가능한 월령 성분 하나가 투출하면:
PatternMode = transformed
BranchPattern은 유지한다.
________________________________________
13. 겸격
EX-022
사용 가능한 월령 성분 둘 이상이 투출하면:
PatternMode = combined
본기가 포함되어 있어도 복수 투출이면 겸격을 우선한다.
________________________________________
14. 겸격 유정·무정
EX-023
겸격이면 반드시:
YongShenRelation[]
을 계산한다.
가능:
favorable_harmony
unfavorable_conflict
mixed
deferred
YongShen 개수 자체에는 길흉이 없다.
________________________________________
15. 비겁계 특수 Pattern
EX-024
비견·겁재·양인격은 일반 월령 투출 규칙에 특수 Policy를 적용한다.
같은 오행 비겁 성분을 일반 주 YongShen으로 사용하지 않는다.
________________________________________
16. 월령무용
EX-025
사용할 월령 천간 YongShen이 없는 비겁계에서는:
PatternMode = month_command_unusable
을 허용한다.
가용신은 ManifestedYongShen과 별도 provenance로 관리한다.
________________________________________
17. FILUNE 양인
EX-026
v1 인정:
甲卯
丙午
庚酉
壬子
戊午는 제외한다.
FILUNE_APPROVED_OVERRIDE + SOURCE_CONFLICT
로 기록한다.
________________________________________
18. PatternContext
EX-030
PatternContext
- id
- scope

- branchPattern
- monthHiddenStemCandidates[]

- manifestedYongShen[]
- usableHeavenlyFocus[]

- heavenlyPatterns[]
- patternMode

- yongShenRelations[]
________________________________________
19. NatalPatternContext와 CurrentPatternContext
EX-031
분리한다.
NatalPatternContext
DaewoonPatternContext
SewoonPatternContext
MonthPatternContext
DayPatternContext
운 때문에 NatalPatternContext를 수정하지 않는다.
________________________________________
20. 운에서 격이 바뀐다는 의미
EX-032
운에서 변하는 것은:
CurrentManifestedYongShen
CurrentHeavenlyPattern
CurrentPatternMode
이다.
월령 BranchPattern이 바뀌는 것이 아니다.
________________________________________
21. PatternEffectPolicy
EX-040
RelationFact가 만들어진 뒤:
PatternContext
+
RelationFact
→ PatternEffectPolicy
를 조회한다.
________________________________________
22. PatternEffectPolicy 구조
EX-041
PatternEffectPolicy
- policyId

- branchPattern
- patternMode
- activeYongShenTypes[]
- relationType

- defaultDirection

- requiredConditions[]
- reversalConditions[]
- exceptions[]

- evidenceStatus
________________________________________
23. PolicyDirection
EX-042
favorable
favorable_candidate
unfavorable
unfavorable_candidate
context_dependent
mixed
neutral
deferred
________________________________________
24. 재격 財剋印
EX-043 — FIXED
BranchPattern = Wealth
Relation = Wealth controls Resource
이면:
defaultDirection = favorable
로 고정한다.
________________________________________
25. 재격 + 印
EX-044
재격에 印이 존재하는 것을 병으로 잡지 않는다.
WealthPattern + Resource
→ favorable
가능.
현실 해석:
•	부 + 학식
•	재물 + 문서
•	현실 능력 + 공부·자격
________________________________________
26. 인수격 財剋印
EX-045 — FIXED
BranchPattern = Resource
Relation = Wealth controls Resource
기본:
unfavorable
이다.
________________________________________
27. 印多用財
EX-046
BranchPattern = Resource
ResourceState = excessive
Wealth controls Resource
이면:
favorable
NamedFormula = 印多用財
로 반전한다.
________________________________________
28. 식신격의 財剋印
EX-047
편인이 食神을 손상시키는 병인 경우:
財 → 剋 → 印
은 식신을 보호하므로:
favorable
가능.
________________________________________
29. Policy specificity 우선
EX-048
적용 우선:
가장 구체적인 PatternContext Policy
>
일반 Pattern Policy
예:
ResourcePattern + ResourceExcessive + 財剋印
은 일반:
ResourcePattern + 財剋印
보다 우선한다.
________________________________________
30. 천간 RelationFact
EX-050
생성:
StemGenerationFact
StemControlFact
StemCombinationFact
각 action을 별도 타입으로 유지한다.
________________________________________
31. 일간합
EX-051
일간이 참여하는 천간합은 일반 운세의 합거로 처리하지 않는다.
들어온 운 글자의 십신 기능을 삭제하지 않는다.
________________________________________
32. 원국-운 천간합
EX-052
유효 원국-운 합이면:
NatalStem Runtime = stopped
LuckStem Runtime = stopped
가능.
현행 A-8의 원국-운 합거 규칙을 따른다.
________________________________________
33. 운끼리 합은 원국합보다 먼저 처리한다
EX-053 — OP-T10 ALIGNMENT
현재 scope의 직접 비교 대상 운끼리 합을 먼저 검사한다.
순서:
1. current direct-scope luck↔luck combinations
2. valid luck↔luck combine → both weakened
3. 해당 운 천간은 원국과 다시 합하지 않음
4. 운끼리 합하지 않은 천간만 원국 합 검토
5. 원국과 유효합 → 양쪽 stopped
운끼리 합은 full stop이 아니라 약화다. 현행 A-8에서 운끼리 합을 먼저 처리하고, 그 운 천간은 원국과 다시 합하지 않도록 규정한다.
________________________________________
34. 복수 운 합 상대
EX-054 — OP-T11 ALIGNMENT
운 천간 하나가 현재 직접 비교 범위 내 여러 운 천간과 합 가능하면:
Daewoon
→ Sewoon
→ Month
→ Day
순으로 우선 상대를 정한다.
선택되지 않은 상대를 같은 합으로 다시 약화시키지 않는다.
________________________________________
35. weakened와 stopped를 구분한다
EX-055
weakened
•	관계 참여 가능
•	생극 효과 감소 가능
•	RoleHistory 유지
stopped
•	현재 새로운 생극 Source로 사용하지 않음
•	RoleHistory 유지
________________________________________
36. stopped 후 Root 강화
EX-056
Root가 강화되어도 stopped 천간을 다시 active로 만들지 않는다.
________________________________________
37. 상관합살 구현
EX-057
if relation.source.tenGod == HurtingOfficer
and relation.action == combine
and relation.target.tenGod == SevenKilling
and validStemCombination:

    formula = HurtingOfficerCombinesKilling
원국-운 유효 합거라면 양쪽 stopped 가능.
운끼리 합이라면 현행 운-운 합 규칙에 따라 weakened로 처리한다.
즉 傷官合殺이라고 해서 항상 stopped가 아니라 합의 참여 주체가 원국-운인지 운-운인지도 확인한다.
________________________________________
38. 食神制殺 구현
EX-058
source = FoodGod
action = control
target = SevenKilling
target을 자동 stopped시키지 않는다.
________________________________________
39. 傷官剋殺 구현
EX-059
source = HurtingOfficer
action = control
target = SevenKilling
HurtingOfficerCombinesKilling으로 변환하지 않는다.
________________________________________
40. 지지 RelationFact
EX-060
별도 탐지:
•	六合
•	冲
•	刑
•	破
•	害
________________________________________
41. FormationFact
EX-061
별도 탐지:
•	반합국
•	완전 삼합국
•	방합
BranchRelationFact와 섞지 않는다.
________________________________________
42. 모든 유효 합 공존
EX-062
한 지지가 여러 합에 참여할 수 있다.
새 합이 이전 합을 취소하지 않는다.
________________________________________
43. 합과 충 공존
EX-063
합이 있다고 충을 삭제하지 않는다.
충 효과가 약해질 수는 있다.
________________________________________
44. 六合
EX-064
六合은:
•	관계
•	결속
•	기능 조정
•	기능 약화
가능.
그러나:
六合 = stopped
六合 = new element formation
금지.
________________________________________
45. 반합국
EX-065
왕지를 포함하는 삼합 구성 두 글자면 반합국 인정.
오행 세력과 RootState를 강화할 수 있다.
________________________________________
46. 삼합국
EX-066
세 글자 완성 시 해당 오행 Formation을 만든다.
관련 천간 RootState 및 DayMasterRootState 강화 가능.
________________________________________
47. 방합
EX-067
세 글자 완성 시 해당 계절 오행 Formation을 만든다.
관련 천간 RootState도 강화 가능.
________________________________________
48. Formation 자체 길흉 금지
EX-068
Formation 오행이:
•	YongShen
•	SangShen
•	Byeong
•	DayMaster
•	다른 기능
중 무엇인지에 따라 결과를 판정한다.
________________________________________
49. RootFact
EX-070
Root의 존재 사실.
RootFact
과 현재 작동 상태:
RootState
를 분리한다.
________________________________________
50. RootState
EX-071
absent
present
strengthened
weakened
숫자 점수 금지.
________________________________________
51. 다중 Root
EX-072
Root 하나가 손상되었다고 전체 천간을 무근 처리하지 않는다.
________________________________________
52. Root 실행 순서
EX-073
detectDirectRootFacts
↓
detectMonthCommandRoot
↓
evaluate12LifeStageFacts
↓
applyFormationRootEffects
↓
applyElementOverloadEffects
↓
aggregateRootStates
________________________________________
53. 12운성
EX-074
12운성은 천간 유무력의 보조 근거다.
다음에 사용하지 않는다.
•	격 선정
•	YongShen 선정
•	PatternMode
•	독립 길흉
________________________________________
54. DayMasterCapacity
EX-080
평가:
officer_capacity
killing_capacity
wealth_capacity
output_capacity
self_support_excess
________________________________________
55. Capacity는 YongShen 선정 규칙이 아니다
EX-081
신강·신약으로 YongShen을 다시 고르지 않는다.
현재 구조를 감당할 수 있는지를 본다.
________________________________________
56. ActualStructuralFunction
EX-090
ActualStructuralFunction
- relationFactId
- patternContextId
- policyId

- rootEvidence[]
- runtimeEvidence[]
- formationEvidence[]

- direction
- function
________________________________________
57. Policy 이후 Runtime을 적용한다
EX-091
예:
Policy = favorable
이어도 source가 stopped이면:
CurrentFunction = inactive
가능.
________________________________________
58. 복수 경로를 모두 보존한다
EX-092
예:
食神 → 生 財
財 → 生 七殺
食神 → 剋 七殺
세 경로가 동시에 존재할 수 있다.
하나를 선택하여 나머지를 삭제하지 않는다.
________________________________________
59. SangShen
EX-100
현재 YongShen 또는 구조를 실제로 돕는 원국 기능.
active
protective_standby
weakened
stopped
상태 허용.
________________________________________
60. Byeong
EX-101
반드시:
source
→ action
→ target
→ damagedFunction
→ structuralConsequence
Path를 가진다.
________________________________________
61. 모든 사주에 Byeong 강제 금지
EX-102
허용:
confirmed
conditional
none
deferred
________________________________________
62. ConditionalByeong
EX-103
현재 favorable인 글자도 미래 운에서 문제 경로를 만들 수 있다.
예:
食神 → 生 財
현재 유리.
미래:
財 → 生 七殺
이 열리면 ConditionalByeong 활성 가능.
________________________________________
63. 재격 財剋印은 Byeong이 아니다
EX-104 — FIXED
WealthPattern
+
Wealth controls Resource
이면:
Byeong = false
Policy = favorable
로 처리한다.
________________________________________
64. 인수격 財剋印은 Byeong 후보
EX-105
ResourcePattern
+
Wealth controls Resource
기본:
Policy = unfavorable
ByeongCandidate = true
________________________________________
65. 印多用財는 Byeong이 아니다
EX-106
ResourcePattern
+
ResourceExcessive
+
Wealth controls Resource
이면:
Policy = favorable
Formula = 印多用財
Byeong = false
________________________________________
66. GuEung
EX-110
특정 원국 ByeongPath를 실제로 해결하는 원국 구조다.
targetByeongId
필수.
________________________________________
67. 운 해결자는 GuEungRole이 아니다
EX-111
운이 병을 해결하면:
LuckReliefEffect
를 생성한다.
________________________________________
68. 傷官合殺의 Role 판정
EX-112
정관격 + 혼입 七殺
칠살을 제거하여 정관을 남기면 favorable 해결 기능.
재격 + 해로운 財生殺
칠살을 제거하면 favorable 해결 기능.
양인격 + 필요한 七殺
칠살을 제거하면 unfavorable.
즉:
HurtingOfficerCombinesKilling
자체에 SangShen/GuEung 고정값을 넣지 않는다.
________________________________________
69. 성패 등급
EX-120
成
有利優勢
不利優勢
敗
숫자 합산 금지.
________________________________________
70. 성패 판정 순서
EX-121
YongShen CurrentFunction
↓
YongShen mutual relation
↓
SangShen function
↓
Byeong path
↓
GuEung / relief
↓
Capacity
↓
StemOutcome
↓
BranchOutcome
↓
OverallOutcome
________________________________________
71. StemOutcome / BranchOutcome
EX-122
별도 생성한다.
StemStructuralOutcome
BranchStructuralOutcome
OverallStructuralOutcome
________________________________________
72. 운 실행 기본원칙
EX-130
각 scope:
Natal
→ Daewoon
→ Sewoon
→ Month
→ Day
상위 상태를 승계한다.
________________________________________
73. ordinary direct comparison 범위
EX-131
대운
Natal + Daewoon
세운
Natal + Daewoon + Sewoon
월운
Natal + Sewoon + Month
대운 상태는 승계.
일진
Natal + Month + Day
대운·세운 상태는 승계.
________________________________________
74. immediate-parent relation
EX-132
Sewoon ↔ Daewoon
Month ↔ Sewoon
Day ↔ Month
별도 최종 상호작용으로 본다.
________________________________________
75. FormationBranchPool
EX-133
Formation은 ordinary relation 범위와 별개.
대운
Natal + Daewoon
세운
Natal + Daewoon + Sewoon
월운
Natal + Daewoon + Sewoon + Month
일진
Natal + Daewoon + Sewoon + Month + Day
________________________________________
76. 운 CurrentPatternContext
EX-134
각 scope에서 운 천간 적용 후:
checkMonthHiddenStemManifestation()
updateManifestedYongShenSet()
rebuildHeavenlyPatterns()
classifyPatternMode()
evaluateYongShenRelations()
를 반드시 실행한다.
________________________________________
77. 운끼리 합 처리 위치
EX-135 — IMPORTANT
CurrentPatternContext를 위한 운 천간 존재 자체는 먼저 등록하되, 해당 운 글자의 최종 Runtime은 천간합 해석 후 확정한다.
따라서 순서는:
register current luck stem
↓
detect potential YongShen manifestation
↓
build provisional PatternContext
↓
resolve luck↔luck stem combinations first
↓
resolve remaining luck↔natal combinations
↓
update RuntimeState
↓
rebuild effective ManifestedYongShenSet
↓
finalize CurrentPatternContext
이다.
즉 합거되거나 약화된 YongShen 상태를 최종 PatternContext에 반영한다.
________________________________________
78. 운끼리 합은 PatternHistory를 삭제하지 않는다
EX-136
운에서 YongShen 후보 둘이 합하여 약화되어도:
ManifestationHistory = retained
CurrentEffectiveness = weakened
으로 관리한다.
________________________________________
79. 원국-운 합거된 YongShen
EX-137
원국-운 유효합으로 stopped되면:
RoleHistory retained
CurrentEffectiveYongShenSet recalculated
한다.
________________________________________
80. 운마다 Policy 재조회
EX-138
최종 CurrentPatternContext 확정 후:
resolvePatternEffectPolicy()
를 다시 실행한다.
원국 Policy를 그대로 승계하지 않는다.
________________________________________
81. RoleState 재평가
EX-139
운마다:
updateYongShenState
updateSangShenState
updateConditionalByeongState
updateByeongState
updateGuEungState
를 실행한다.
원국 RoleHistory는 유지한다.
________________________________________
82. LuckEffect
EX-140
운 글자 자체에 새 원국 Role을 붙이지 않는다.
LuckEffect
- manifests_yongshen
- changes_pattern_mode

- activates_byeong
- strengthens_byeong
- weakens_byeong
- relieves_byeong

- attacks_yongshen
- protects_yongshen

- activates_sangshen_function
- weakens_sangshen

- changes_root_state
- changes_capacity
- changes_formation
________________________________________
83. 대운 실행
EX-150
load NatalState

apply DaewoonStem
detect provisional YongShen manifestation

resolve stem runtime
finalize DaewoonPatternContext

apply DaewoonBranch
collect branch relations
detect formations

recalc Root
recalc Capacity

resolve PatternEffectPolicy
resolve ActualStructuralFunction

update Roles

judge StemOutcome
judge BranchOutcome
judge OverallOutcome

save DaewoonState
________________________________________
84. 세운 실행
EX-151
load DaewoonState

register SewoonStem
detect provisional YongShen manifestation

resolve Daewoon↔Sewoon luck combination first
resolve allowed Sewoon↔Natal combinations

finalize SewoonPatternContext

apply SewoonBranch
collect branch relations
detect Formation

recalc Root / Capacity

resolve PatternEffectPolicy
resolve ActualStructuralFunction
update Roles

resolve immediate-parent final interaction if required

judge outcomes
save SewoonState
________________________________________
85. 월운 실행
EX-152
load SewoonState

register MonthStem
detect provisional YongShen manifestation

resolve current direct-scope luck↔luck combinations first
resolve remaining Month↔Natal combinations

finalize MonthPatternContext

apply MonthBranch
collect allowed direct branch relations
detect Formation from full FormationBranchPool

recalc Root / Capacity

resolve Policy
resolve Functions
update Roles

resolve Month↔Sewoon final interaction

judge outcomes
save MonthState
________________________________________
86. 일진 실행
EX-153
load MonthState

register DayStem
detect provisional YongShen manifestation

resolve current direct-scope luck↔luck combinations first
resolve remaining Day↔Natal combinations

finalize DayPatternContext

apply DayBranch
collect allowed branch relations
detect Formation

recalc Root / Capacity

resolve Policy
resolve Functions
update Roles

resolve Day↔Month final interaction

judge outcomes
save DayState
________________________________________
87. Palace Layer
EX-160
구조 판정 이후:
BranchRelation
→ Palace
→ TenGod
→ StructuralRole
→ CurrentOutcome
→ LifeDomainInterpretation
순으로 현실 해석한다.
________________________________________
88. Palace 자동 사건 금지
EX-161
금지:
日支冲 = divorce
관계·궁위·십신·현재 기능을 결합해서 설명한다.
________________________________________
89. ExperiencedProcess
EX-162
구조적 유리와 체감 난이도를 분리한다.
StructuralOutcome
ExperiencedProcess
예:
칠살을 잘 활용해 결과는 좋더라도 압박·책임·난제가 클 수 있다.
________________________________________
90. 최종 데이터 구조
EX-170
InternalStructuredReading

- natalState
- daewoonStates[]
- sewoonStates[]
- monthStates[]
- dayStates[]

- currentPatternContext

- relationFacts[]
- formationFacts[]

- rootFacts[]
- rootStates[]
- twelveLifeStageFacts[]

- dayMasterCapacity

- actualStructuralFunctions[]

- yongShenRoles[]
- sangShenRoles[]
- byeongRoles[]
- guEungRoles[]

- luckEffects[]

- stemOutcome
- branchOutcome
- overallOutcome

- palaceEffects[]
- experiencedProcess
________________________________________
91. StemRelationFact
EX-171
StemRelationFact
- sourceEntityId
- targetEntityId

- action
  - generate
  - control
  - combine

- scope
- relationOrigin
  - natal_natal
  - luck_natal
  - luck_luck

- runtimeEffect
________________________________________
92. FormulaFact
EX-172
NamedFormula를 RelationFact와 분리한다.
FormulaFact
- formulaType
- relationFactIds[]
- patternContextId
- validity
예:
FoodGodControlsKilling
HurtingOfficerControlsKilling
HurtingOfficerCombinesKilling
WealthGeneratesOfficer
KillingGeneratesResource
FoodGodGeneratesWealth
________________________________________
93. PolicyResolution
EX-173
PolicyResolution
- matchedPolicyId
- direction
- requiredConditions
- reversalApplied
- evidenceStatus
________________________________________
94. StructuralRole
EX-174
StructuralRole
- entityId
- roleType

- roleHistory
- currentState
- currentFunction

- patternContextId

- supportingPaths[]
- adversePaths[]
________________________________________
95. LuckScopeState
EX-175
LuckScopeState
- scope
- parentStateId

- provisionalPatternContext
- finalPatternContext

- stemRuntimeStates[]
- branchRelationFacts[]
- formationFacts[]

- rootStates[]
- dayMasterCapacity

- policyResolutions[]
- actualStructuralFunctions[]

- roleStates[]
- luckEffects[]

- stemOutcome
- branchOutcome
- overallOutcome
________________________________________
96. 전체 원국 파이프라인
EX-200
runInternalReading(input)

1. buildCanonicalChart()
2. collectBasicFacts()

3. detectMonthCommand()
4. resolveBranchPattern()

5. collectMonthHiddenStemCandidates()
6. applyPeerRobSpecialCandidateRules()
7. resolveNatalManifestedYongShen()
8. buildNatalHeavenlyPatterns()
9. classifyNatalPatternMode()
10. evaluateNatalYongShenRelations()

11. collectNatalStemRelationFacts()
12. resolveNatalStemRuntimeStates()

13. collectNatalBranchRelationFacts()
14. detectNatalFormationFacts()

15. detectRootFacts()
16. detectMonthCommandRoots()
17. evaluate12LifeStageFacts()
18. applyFormationRootEffects()
19. applyElementOverloadEffects()
20. aggregateRootStates()

21. evaluateDayMasterCapacity()
22. evaluateEnergyConcentration()
23. evaluateReleaseAndControlPaths()

24. resolvePatternEffectPolicies()
25. resolveActualStructuralFunctions()

26. updateYongShenRuntime()

27. identifySangShen()
28. identifyProtectiveSangShen()

29. identifyActiveByeong()
30. identifyConditionalByeong()
31. identifyGuEung()

32. judgeStemStructuralOutcome()
33. judgeBranchStructuralOutcome()
34. judgeNatalOverallOutcome()

35. freezeNatalState()

36. evaluateDaewoon()
37. evaluateSewoon()
38. evaluateMonth()
39. evaluateDay()

40. resolvePalaceEffects()
41. buildExperiencedProcess()
42. buildLifeDomainInterpretation()

43. return InternalStructuredReading
________________________________________
97. 공통 운 파이프라인
EX-201
evaluateLuckScope(parentState, currentLuck, scope)

1. inheritParentState()

2. registerCurrentLuckStem()

3. detectPotentialMonthHiddenStemManifestation()
4. buildProvisionalPatternContext()

5. collectCurrentDirectScopeLuckStemCombinations()
6. resolveLuckLuckCombinationPriority()
7. applyLuckLuckWeakening()

8. collectRemainingLuckNatalStemCombinations()
9. applyLuckNatalStops()

10. collectStemGenerationAndControlFacts()
11. finalizeStemRuntimeStates()

12. rebuildEffectiveManifestedYongShenSet()
13. rebuildHeavenlyPatterns()
14. reclassifyPatternMode()
15. reevaluateYongShenRelations()
16. finalizeCurrentPatternContext()

17. applyCurrentLuckBranch()
18. collectAllowedBranchRelationFacts()

19. buildFormationBranchPool()
20. detectFormationFacts()

21. recalculateRootStates()
22. recalculateDayMasterCapacity()

23. resolvePatternEffectPolicies()
24. resolveActualStructuralFunctions()

25. updateYongShenStates()
26. updateSangShenStates()
27. updateConditionalByeongStates()
28. updateByeongStates()
29. updateGuEungStates()

30. buildLuckEffects()

31. resolveImmediateParentInteraction()

32. rerunAffectedFunctionsIfNeeded()

33. judgeStemStructuralOutcome()
34. judgeBranchStructuralOutcome()
35. judgeOverallStructuralOutcome()

36. resolvePalaceEffects()
37. buildExperiencedProcess()

38. return LuckScopeState
________________________________________
98. 왜 provisional PatternContext가 필요한가
EX-202
운 천간이 월령 지장간 성분이면 투출 사실 자체는 먼저 탐지해야 한다.
하지만 이후 합 때문에:
•	weakened
•	stopped
될 수 있다.
따라서:
potential manifestation
↓
stem runtime resolution
↓
effective manifestation
을 분리한다.
________________________________________
99. ManifestationHistory와 EffectiveManifestation
EX-203
ManifestationHistory
는 해당 scope에서 그 YongShen 후보가 천간으로 등장했다는 사실.
EffectiveManifestedYongShenSet
은 Runtime 처리 후 실제 현재 작동 가능한 YongShen 집합.
둘을 구분한다.
________________________________________
100. stopped된 YongShen과 PatternMode
EX-204
예:
두 YongShen 투출
→ provisional combined

한 YongShen 합거 stopped
이면:
•	combined History 보존
•	CurrentEffectivePattern은 다시 계산
한다.
________________________________________
101. 필수 회귀 테스트 — 財剋印
EX-220
Test A — 財格
BranchPattern = Wealth
Relation = Wealth controls Resource
Expected:
direction = favorable
Byeong = false
Test B — 印格
BranchPattern = Resource
Relation = Wealth controls Resource
Expected:
direction = unfavorable
ByeongCandidate = true
Test C — 印多用財
BranchPattern = Resource
ResourceState = excessive
Relation = Wealth controls Resource
Expected:
direction = favorable
Formula = 印多用財
________________________________________
102. 필수 회귀 테스트 — 제살/합살
EX-221
FoodGodControlsKilling
action = control
SevenKilling not automatically stopped
HurtingOfficerControlsKilling
action = control
formula != HurtingOfficerCombinesKilling
HurtingOfficerCombinesKilling
action = combine
valid combination required
________________________________________
103. 필수 회귀 테스트 — 합살 Pattern 차이
EX-222
정관격
OfficerPattern
+ mixed SevenKilling
+ HurtingOfficerCombinesKilling

→ favorable
재격
WealthPattern
+ harmful WealthGeneratesKilling
+ HurtingOfficerCombinesKilling

→ favorable
양인격
YangBladePattern
+ required SevenKilling
+ HurtingOfficerCombinesKilling

→ unfavorable
________________________________________
104. 필수 회귀 테스트 — 운끼리 합
EX-223
현재 direct scope에서 운끼리 합이 성립하면:
both luck stems = weakened
Expected:
•	stopped 아님
•	원국과 다시 합하지 않음
•	약화 상태에서 생극 일부 작용 가능
현행 A-8의 OP-T10과 맞춰야 한다.
________________________________________
105. 필수 회귀 테스트 — 운-원국 합
EX-224
운끼리 합하지 않은 운 천간이 원국과 유효합:
Expected:
luck stem = stopped
natal stem = stopped
원국-운 합거 규칙과 맞춘다.
________________________________________
106. 필수 회귀 테스트 — 복수 운 합 상대
EX-225
복수 상대가 있으면:
Daewoon
→ Sewoon
→ Month
→ Day
우선순위 적용.
선택되지 않은 상대를 같은 합으로 추가 약화하지 않는다.
________________________________________
107. 필수 회귀 테스트 — dynamic PatternContext
EX-226
transformed → combined
운에서 새 YongShen 투출.
Expected:
CurrentPatternMode = combined
YongShenRelations recalculated
Policies rerun
combined → effective single
운에서 한 YongShen stopped.
Expected:
PatternHistory retained
EffectiveYongShenSet reduced
CurrentEffectivePattern recalculated
________________________________________
108. 구현 금지 규칙
EX-230
Codex는 다음을 하지 않는다.
•	Pattern을 단일 enum으로만 저장
•	BranchPattern을 운에서 교체
•	복수 YongShen 중 하나만 보존
•	겸격 유정·무정 생략
•	운 YongShen 발현 후 PatternContext 재계산 생략
•	Runtime 처리 전에 PatternContext를 최종 확정
•	운끼리 합보다 원국 합을 먼저 처리
•	운끼리 합을 full stop 처리
•	운끼리 합한 천간을 다시 원국과 합거
•	원국-운 유효합을 단순 약화로만 처리
•	weakened와 stopped 통합
•	control과 combine 통합
•	食神制殺과 傷官剋殺 통합
•	傷官剋殺과 傷官合殺 통합
•	傷官合殺을 항상 길로 판정
•	財剋印을 전역 불리로 판정
•	財剋印을 단일 context_dependent로 처리
•	財格의 財剋印을 Byeong으로 생성
•	印格의 일반 財剋印을 favorable로 처리
•	印多用財 예외 누락
•	운 글자에 새 원국 SangShenRole 생성
•	운 글자에 새 원국 ByeongRole 생성
•	운 글자에 새 원국 GuEungRole 생성
•	Root 강화로 stopped 글자 재활성화
•	FormationBranchPool과 ordinary relation scope 혼동
•	합이 있으면 충 삭제
•	지지합을 천간합거처럼 처리
•	Relation 개수를 합산해 성패 계산
•	Palace 하나로 사건 확정
________________________________________
109. provenance
EX-240
각 실행 규칙은 다음 상태를 지원해야 한다.
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
CONFLICT
DEFERRED
________________________________________
110. Policy와 provenance 분리
EX-241
direction = favorable
evidenceStatus = SOURCE_EXPLICIT
처럼 별도 저장한다.
FILUNE Override가 가장 오래된 이론이라는 뜻이 아니라 제품 실행 기준상 우선한다는 뜻이다.
________________________________________
111. 최종 엔진 철학
FILUNE 엔진은:
십신 이름
→ 길흉
을 계산하는 엔진이 아니다.
실제 실행은:
월령
↓
BranchPattern
↓
월령 지장간 후보
↓
투출 YongShen
↓
정격·변격·겸격
↓
YongShen 유정·무정
↓
RelationFact
↓
PatternEffectPolicy
↓
천간합·Root·Formation·Runtime
↓
ActualStructuralFunction
↓
SangShen / Byeong / GuEung
↓
Capacity
↓
Stem / Branch Outcome
↓
운에서 CurrentPatternContext 재구성
↓
현실 해석
이다.
특히 다음 네 가지를 FILUNE v1 통합 실행 기준으로 고정한다.
1. 財剋印
財格
→ favorable

印格
→ unfavorable

印格 + 印過多
→ favorable
2. 칠살 처리
食神制殺
≠
傷官剋殺
≠
傷官合殺
3. 운 천간합
현재 직접 범위의 운끼리 합
→ 먼저 처리
→ 양쪽 weakened

남은 운 천간과 원국 유효합
→ 양쪽 stopped
4. 운의 격 변화
BranchPattern History = 유지

CurrentManifestedYongShen
CurrentHeavenlyPattern
CurrentPatternMode
= 운마다 재계산
이 네 규칙을 기준으로 모든 하위 모듈이 동일한 실행 결과를 내도록 한다.

