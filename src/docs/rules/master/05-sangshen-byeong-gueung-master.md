FILUNE v1 상신·병·구응·성패 마스터 규칙 v0.3
0. 문서 목적
이 문서는 FILUNE v1에서 다음을 판정한다.
•	YongShen의 현재 기능
•	SangShen
•	Protective SangShen
•	Byeong
•	Conditional Byeong
•	GuEung
•	LuckEffect
•	성·유리 우세·불리 우세·패
핵심 원칙은 다음과 같다.
Role 이름만으로 길흉을 정하지 않는다.

PatternContext
→ PatternEffectPolicy
→ ActualStructuralFunction
→ SangShen / Byeong / GuEung
→ StructuralOutcome
순으로 판정한다.
________________________________________
1. Role과 CurrentFunction은 다르다
SG-001
다음은 분리한다.
RoleHistory
CurrentState
CurrentFunction
예:
RoleHistory = YongShen
CurrentState = stopped
CurrentFunction = inactive
가능.
YongShen이라는 원래 역할 자체를 삭제하지 않는다.
________________________________________
2. 하나의 글자가 복수 Role을 가질 수 있다
SG-002
허용:
YongShen + SangShen
YongShen + Byeong
YongShen + ConditionalByeong
SangShen + GuEung
favorable current function + ConditionalByeong
전문가 자료에도 동일 글자가 용신이면서 병이 되는 사례가 존재한다.
따라서 Role을 상호배타적으로 만들지 않는다.
________________________________________
3. 십신의 고정 길흉보다 격 구조가 우선한다
SG-003
금지:
財 = 길신
→ 항상 좋음

傷官 = 흉신
→ 항상 나쁨
현재 격에서 그 글자가 무엇을 하는지를 판단한다.
________________________________________
4. Role 판정 전에 PatternContext를 확정한다
SG-004
실행 순서:
BranchPattern
↓
ManifestedYongShen
↓
PatternMode
↓
YongShenRelations
↓
RelationFacts
↓
PatternEffectPolicy
↓
Root / Runtime
↓
ActualStructuralFunction
↓
Role 판정
________________________________________
5. Role 판정에 단일 PatternType을 사용하지 않는다
SG-005
금지:
pattern = Wealth
→ SangShen table
반드시:
•	BranchPattern
•	HeavenlyPattern
•	proper / transformed / combined
•	active YongShen
•	RelationFact
를 함께 본다.
________________________________________
6. YongShen의 정의
SG-010
YongShen은 기본적으로 월령 및 월령 지장간에서 나온다.
원국 또는 운에서 월령 지장간 성분이 천간으로 투출하면 ManifestedYongShen이 될 수 있다.
가용신 특수 규칙은 비겁계 월령무용에서 별도로 적용한다.
________________________________________
7. YongShen은 성패를 보장하지 않는다
SG-011
YongShen이 존재해도:
•	다른 YongShen과 무정
•	합거
•	Root 약화
•	Byeong 공격
•	Capacity 부족
이면 불리할 수 있다.
________________________________________
8. YongShen Runtime
SG-012
YongShenRuntime
- active
- weakened
- stopped
stopped여도 RoleHistory는 유지한다.
________________________________________
9. 겸격 YongShen
SG-013
겸격에서는 모든 ManifestedYongShen을 보존한다.
그리고:
YongShen A
↔
YongShen B
유정·무정을 먼저 판단한다.
________________________________________
10. SangShen 정의
SG-020
SangShen은:
현재 격과 YongShen이 필요한 구조적 기능을 실제로 수행하도록 돕는 원국의 글자 또는 기능
이다.
단순 길신 목록이 아니다.
________________________________________
11. SangShen에는 기능 경로가 필요하다
SG-021
SangShen
- actor
- action
- target
- protectedFunction
- supportingPath
예:
印
→ controls 傷官
→ protects 正官
________________________________________
12. Active SangShen
SG-022
현재 원국에서 실제 필요한 기능을 수행 중이면:
SangShenState = active
________________________________________
13. Protective Standby SangShen
SG-023
현재는 공격 대상이 없지만 미래 운에서 발생할 문제를 막을 수 있는 원국 글자는:
SangShenState = protective_standby
가능.
________________________________________
14. Protective SangShen은 미래 병을 만들어내는 것이 아니다
SG-024
보호자가 있다는 이유로 현재 존재하지 않는 Byeong을 강제로 생성하지 않는다.
다만 미래 조건을:
ConditionalThreat
로 기록할 수 있다.
________________________________________
15. SangShen도 약화될 수 있다
SG-025
•	Root 약화
•	합거
•	다른 글자의 극
•	Formation 변화
등으로 CurrentFunction이 약해질 수 있다.
RoleHistory는 유지한다.
________________________________________
16. Byeong 정의
SG-030
Byeong은:
현재 격의 YongShen·SangShen·필요 기능 또는 성격 경로를 실제로 손상시키는 구조적 문제
다.
흉신 자체를 Byeong이라고 하지 않는다.
________________________________________
17. Byeong에는 반드시 Path가 있어야 한다
SG-031
ByeongPath
- source
- action
- target
- damagedFunction
- structuralConsequence
________________________________________
18. 글자 존재만으로 Byeong을 만들지 않는다
SG-032
금지:
七殺 존재
→ Byeong

財 존재
→ Byeong

傷官 존재
→ Byeong
반드시 실제 해로운 구조 경로를 확인한다.
________________________________________
19. 모든 사주에 Byeong이 있는 것은 아니다
SG-033 — SOURCE EXPLICIT
전문가 풀이에는 원국 지지에 “딱히 병이 없다”는 직접 판정도 존재한다.
따라서:
ByeongStatus
- confirmed
- conditional
- none
- deferred
를 허용한다.
________________________________________
20. No-Byeong 판정
SG-034
none은 단순히 병을 못 찾았다는 뜻이 아니다.
다음 조사를 끝낸 뒤에만 가능하다.
•	YongShen 공격
•	SangShen 공격
•	합거
•	관살혼잡
•	재생살
•	편인도식
•	비겁분재
•	겸격 무정
•	Capacity 붕괴
•	필요한 제어자 손상
________________________________________
21. Active Byeong
SG-035
원국에서 이미 해로운 경로가 완성되어 있으면:
ByeongState = active
________________________________________
22. Conditional Byeong
SG-036
현재는 해로운 경로가 완성되지 않았으나 특정 운이 들어오면 완성되는 원국 요소는:
ByeongState = conditional
가능.
________________________________________
23. Conditional Byeong 사례
SG-037
예:
원국:
食神 → 生 財
현재는 좋은 식신생재.
그런데 미래에 七殺이 들어오면:
食神 → 生 財
財 → 生 七殺
이 되어 재생살 문제가 발생할 수 있다.
전문가 실제 사례에서도 식신생재 구조에 운의 칠살이 들어오면 食神制殺과 財生殺이 동시에 존재한다고 설명한다.
따라서 원국 財는:
CurrentFunction = favorable
ConditionalByeongPotential = true
를 동시에 가질 수 있다.
________________________________________
24. 현재 좋으면 과거 Role을 삭제하지 않는다
SG-038
ConditionalByeong이 운에서 활성화되었다가 이후 다시 해소되어도:
RoleHistory = retained
한다.
________________________________________
25. GuEung 정의
SG-050
GuEung은:
특정 원국 ByeongPath를 실제로 제거하거나 해소하는 원국의 해결 구조
다.
________________________________________
26. GuEung에는 대상 Byeong이 필요하다
SG-051
GuEung
- actor
- action
- targetByeongId
- relievedPath
targetByeongId 없는 GuEung을 만들지 않는다.
________________________________________
27. Byeong이 없으면 GuEung도 필수가 아니다
SG-052
GuEungStatus
- confirmed
- none
- not_applicable
- deferred
허용.
________________________________________
28. 단순 좋은 글자를 GuEung이라고 하지 않는다
SG-053
좋은 글자라도 특정 ByeongPath를 실제로 해결하지 않으면 GuEung이 아니다.
________________________________________
29. 운의 해결자는 GuEung Role이 아니다
SG-054 — FILUNE MODEL
운에서 병을 해결하는 글자는:
LuckReliefEffect
를 만든다.
새:
LuckGuEungRole
을 만들지 않는다.
________________________________________
30. 재격의 財剋印
SG-060 — CORE FIXED RULE
재격에서는:
財 → 剋 → 印
을 ByeongPath로 만들지 않는다.
기본 PatternEffectPolicy:
BranchPattern = Wealth
WealthControlsResource
→ favorable
이다.
________________________________________
31. 재격에서 印은 병이 아니다
SG-061
재격에서 印이 존재한다는 이유로:
ResourceRole = Byeong
을 만들지 않는다.
전문가 풀이에서는 재격에 인성이 함께 있는 것을 능력·부와 문서·학식이 함께 있는 모습으로 긍정적으로 해석한다.
________________________________________
32. 재격에서 財剋印은 favorable function
SG-062
財格
+
財剋印

ActualStructuralFunction.direction
= favorable
로 처리한다.
금지:
財格 + 財剋印
→ Byeong
________________________________________
33. 재격의 印이 다른 좋은 기능을 가져도 財剋印 방향은 바꾸지 않는다
SG-063
재격에서 印이:
•	DayMaster를 도움
•	칠살을 인화
•	문서·학식 기능
을 가질 수 있다.
그러나 이것 때문에 財剋印 Relation 자체의 Policy를:
favorable → unfavorable
로 뒤집지 않는다.
필요하다면 서로 다른 FunctionPath를 각각 기록한다.
예:
Path A:
財 → 剋 印
direction = favorable

Path B:
印 → 化 七殺 → 生 身
direction = favorable
두 기능이 동시에 존재할 수 있다.
최종 OverallOutcome에서 전체 구조를 종합한다.
________________________________________
34. 재격에서 재생살은 별도 ByeongPath
SG-064
재격에서 문제가 되는 대표 경로는:
財 → 生 七殺
이다.
칠살이 해로운 경우:
ByeongPath = WealthGeneratesHarmfulKilling
가능.
격국론에서도 재격이 칠살을 생하여 일간을 위협하면 파격 원인이 된다고 설명한다.
________________________________________
35. 재격에서 食神制殺
SG-065
재생살 Byeong이 있을 때:
食神 → 剋 七殺
이면 해결 경로가 될 수 있다.
현재 구조에 따라:
SangShen
또는
GuEung
후보.
________________________________________
36. 재격에서 傷官剋殺
SG-066
傷官 → 剋 七殺
도 칠살을 실제 약화시키면 해결 기능으로 인정한다.
그러나 食神制殺과 다른 RelationFact다.
________________________________________
37. 재격에서 傷官合殺
SG-067
傷官 → 合 七殺
이 유효 천간합이고 七殺이 해로운 재생살 병이라면:
SevenKilling = stopped
되어 병 경로가 해소될 수 있다.
이 경우 傷官은 GuEung/SangShen 기능 후보가 될 수 있다.
________________________________________
38. 食神制殺과 傷官合殺을 같은 해결 방식으로 저장하지 않는다
SG-068
食神制殺
action = control
targetState = weakened 가능
傷官剋殺
action = control
targetState = weakened 가능
傷官合殺
action = combine
targetState = stopped 가능
sourceState = stopped 가능
서로 다른 Effect다.
________________________________________
39. 傷官合殺은 항상 GuEung이 아니다
SG-069
칠살이 병이면 해결 기능.
하지만 칠살이 필요한 YongShen이면 오히려 문제다.
따라서 傷官合殺이라는 공식 자체에 고정 길흉을 부여하지 않는다.
________________________________________
40. 정관격 官殺混雜
SG-070
正官 active
+
七殺 active
이 정관격의 구조를 탁하게 하면:
Byeong = mixed_officer_killing
가능.
________________________________________
41. 정관격 傷官合殺
SG-071
정관격의 혼입 七殺을 傷官이 합거해:
七殺 stopped
正官 active
가 되면:
GuEungFunction = removes_mixed_killing
가능.
격국론에서도 정관격의 상관합살을 명시적으로 사용한다.
________________________________________
42. 상관 자체의 RoleHistory도 유지한다
SG-072
傷官合殺이 이루어지면 상관 역시 stopped될 수 있다.
그러므로:
HurtingOfficer RoleHistory = retained
HurtingOfficer CurrentFunction = stopped
한다.
________________________________________
43. 양인격의 필요한 七殺
SG-080
양인격에서 七殺이 양인을 제어하는 핵심 YongShen이면:
七殺 → 制 羊刃
은 SangShen/핵심 favorable function이다.
전문가 사례에서도 양인격에 관살이 있으면 이를 살려야 한다는 방향을 명확히 사용한다.
________________________________________
44. 양인격에서 食神制殺
SG-081
필요한 七殺을 食神이 약화시키면:
FoodGodControlsRequiredKilling
은 Byeong 후보가 될 수 있다.
________________________________________
45. 양인격에서 傷官合殺
SG-082
필요한 七殺을 상관이 합거해 stopped시키면:
HurtingOfficerCombinesRequiredKilling
은:
unfavorable
이며 ByeongPath가 될 수 있다.
________________________________________
46. 양인격 財生殺
SG-083
양인을 제어하는 필요한 七殺을 財가 생하는 경우:
財 → 生 七殺
은 favorable function이 될 수 있다.
따라서:
財生殺 = Byeong
으로 일반화하지 않는다.
________________________________________
47. PatternContext가 달라지면 같은 글자의 CurrentFunction도 달라질 수 있다
SG-090
예:
재격
財生殺
→ harmful
가능.
양인격
財生殺
→ supports required Killing
→ favorable
가능.
RelationFact는 같지만 Role/Function은 달라진다.
________________________________________
48. 운에서 PatternContext 변경
SG-091
운 천간이 월령 지장간 YongShen을 새로 발현시키면:
CurrentPatternContext
를 다시 만든다.
그 뒤 SangShen·Byeong·GuEung의 CurrentState와 CurrentFunction을 다시 평가한다.
________________________________________
49. 운에서 RoleHistory를 다시 쓰지 않는다
SG-092
운에서 격이:
transformed → combined
로 바뀌어도 원국 RoleHistory는 유지한다.
운은:
CurrentFunction
CurrentState
LuckEffect
를 갱신한다.
________________________________________
50. 운 글자를 새 SangShen Role로 만들지 않는다
SG-093
운 글자가 구조를 돕는 경우:
LuckEffect:
- protects_yongshen
- weakens_byeong
- activates_sangshen_function
- strengthens_required_function
등으로 기록한다.
________________________________________
51. 운 글자를 새 Byeong Role로 만들지 않는다
SG-094
운 글자가 문제를 만들면:
LuckEffect:
- activates_byeong
- strengthens_byeong
- attacks_yongshen
- attacks_sangshen
- changes_pattern_mode
로 기록한다.
________________________________________
52. ConditionalByeong 활성화
SG-095
운에서 조건이 충족되면:
ConditionalByeong
→ active
로 바뀐다.
새 ByeongRole을 생성하는 것이 아니다.
________________________________________
53. 운에서 새로운 구조 문제
SG-096
원국에 ConditionalByeong으로 정의할 수 없었던 완전히 새로운 상호작용은:
LuckAdverseEffect
로 저장한다.
RoleHistory와 구분한다.
________________________________________
54. 운에서 YongShen이 새로 발현되는 경우
SG-097
운 글자가 월령 지장간 성분이라 새 ManifestedYongShen이 되는 경우에도:
그 운 글자에 원국 SangShen/Byeong/GuEung Role을 새로 부여하지 않는다.
대신:
LuckManifestedYongShen
으로 현재 PatternContext에 참여시킨다.
________________________________________
55. PatternMode 변경과 병 재평가
SG-098
예:
원국:
BranchPattern = Wealth
PatternMode = transformed
운에서 추가 YongShen 투출:
PatternMode = combined
이면:
1.	YongShen 유정·무정 재평가
2.	Policy 재조회
3.	기존 SangShen CurrentFunction 재평가
4.	기존 Byeong 활성 여부 재평가
5.	StructuralOutcome 재판정
한다.
________________________________________
56. 겸격 무정은 Byeong과 구별한다
SG-100
두 YongShen이 서로 무정하다고 해서 자동으로 한쪽을 ByeongRole로 지정하지 않는다.
먼저:
YongShenConflictFact
를 만든다.
그 관계가 실제로 핵심 기능을 깨뜨리는 경우에만 ByeongPath를 생성한다.
________________________________________
57. 겸격의 합거
SG-101
YongShen A와 B가 합거되면:
A RoleHistory retained
B RoleHistory retained

A Runtime stopped
B Runtime stopped
가능.
그 뒤 CurrentEffectiveYongShenSet을 다시 계산한다.
________________________________________
58. Root 약화는 Role 삭제가 아니다
SG-110
YongShen·SangShen·Byeong 모두 RootState가 약해지면 실제 영향력이 줄 수 있다.
그러나:
RoleHistory 삭제
금지.
________________________________________
59. 약한 Byeong
SG-111
ByeongPath가 존재해도 source가 무근·약화되어 실제 작용이 약하면:
ByeongState = active
Effectiveness = limited
가능.
병 자체가 없다고 하지 않는다.
________________________________________
60. 약한 SangShen
SG-112
SangShen이 존재해도 실제 기능이 약하면:
SangShenState = active
Effectiveness = limited
가능.
________________________________________
61. stopped Byeong
SG-113
Byeong source가 합거되어 stopped되면:
ByeongRoleHistory = retained
CurrentByeongFunction = inactive
한다.
병을 원국에서 삭제하지 않는다.
________________________________________
62. GuEung으로 해결된 Byeong
SG-114
GuEung이 실제로 ByeongPath를 끊으면:
ByeongRoleHistory = retained
CurrentByeongState = relieved
가능.
________________________________________
63. 구조의 성패는 Role 개수로 계산하지 않는다
SG-120
금지:
YongShen 2개 = +2
SangShen 1개 = +1
Byeong 1개 = -1
________________________________________
64. 성패는 핵심 Path가 기능하는지를 본다
SG-121
질문 순서:
1. YongShen이 살아 있는가?
2. YongShen끼리 유정한가?
3. 필요한 SangShen이 기능하는가?
4. Byeong이 핵심 기능을 실제 손상시키는가?
5. GuEung이 Byeong을 실제 해소하는가?
6. DayMaster가 구조를 감당하는가?
7. 천간/지지 결과는 각각 어떠한가?
________________________________________
65. 성
SG-122
다음과 같은 상태:
•	핵심 YongShen 기능 유효
•	필요한 SangShen 작동
•	치명적 Byeong 없음 또는 해결됨
•	Capacity 충분
•	겸격이면 유정
이면:
StructuralOutcome = 成
가능.
________________________________________
66. 유리 우세
SG-123
좋은 구조 기능이 우세하지만:
•	일부 Byeong
•	Root 약화
•	겸격 일부 충돌
•	Capacity 부담
등이 남는 경우.
________________________________________
67. 불리 우세
SG-124
문제 경로가 우세하지만 핵심 기능이 완전히 무너지지는 않은 경우.
________________________________________
68. 패
SG-125
핵심 YongShen 또는 필수 SangShen의 기능이 실질적으로 무너지고 이를 복구할 경로가 없는 경우.
단 RelationFact 하나만으로 즉시 패 처리하지 않는다.
________________________________________
69. StemOutcome과 BranchOutcome 분리
SG-126
StemStructuralOutcome
BranchStructuralOutcome
OverallStructuralOutcome
을 분리한다.
________________________________________
70. 천간 Role과 지지 Role을 억지로 같은 결과로 만들지 않는다
SG-127
가능:
StemOutcome = 成
BranchOutcome = 不利優勢
또는 반대.
________________________________________
71. 재격의 대표 성패 예
SG-130
A. 財 + 印
財格
財 active
印 present
財剋印
→ 財剋印 favorable
→ 印 존재 자체도 병 아님
→ 부 + 학식 해석 가능
________________________________________
72. 재격 + 七殺
SG-131
財格
財 → 生 七殺
七殺 harmful
→ Active Byeong 가능
________________________________________
73. 재격 + 七殺 + 食神
SG-132
財 → 生 七殺
食神 → 剋 七殺
두 경로 모두 보존한다.
칠살이 제거됐다고 단순 판단하지 말고:
•	식신 Root
•	칠살 Root
•	실제 제어력
•	Capacity
를 본다.
________________________________________
74. 재격 + 七殺 + 傷官合殺
SG-133
財 → 生 七殺
傷官 → 合 七殺
유효 합거라면:
七殺 stopped
傷官 stopped
→ 재생살 병 경로 해소 가능
단 상관의 다른 기능 상실도 재평가한다.
________________________________________
75. 인수격의 대표 성패
SG-140
일반
印格
財 → 剋 印
→ unfavorable
→ Active Byeong 후보
________________________________________
76. 인다용재
SG-141
印格
印 excessive
財 → 剋 excessive 印
→ favorable
→ 財를 Byeong으로 만들지 않는다.
오히려 과다 인성을 조절하는 해결 기능.
________________________________________
77. 같은 財剋印의 Role 차이
SG-142 — CORE
財格:
財剋印 → favorable
→ Byeong 금지

印格:
財剋印 → unfavorable
→ Byeong 후보

印格 + 印過多:
財剋印 → favorable
→ 해결 기능
________________________________________
78. 식신격의 대표 병
SG-150
偏印 → 剋 食神
식신이 핵심 YongShen이면:
Byeong = ResourceAttacksFoodGod
가능.
________________________________________
79. 식신격의 財剋印
SG-151
편인이 食神을 해치고 있다면:
財 → 剋 印
은:
GuEung/SangShen function
가능.
따라서 여기서도 財剋印은 유리.
________________________________________
80. 상관격의 대표 해결
SG-160
상관이 과하여 印이 이를 제어할 필요가 있다면:
印 → 剋 傷官
은 SangShen 기능 가능.
________________________________________
81. 상관격에서 財가 필요한 印을 깨는 경우
SG-161
財 → 剋 印
로 상관패인의 핵심 印이 무너지면:
ByeongPath 가능.
즉 財剋印의 방향은 격마다 다르다.
________________________________________
82. Role 판정 데이터 구조
SG-170
StructuralRole
- entityId
- roleType
- roleHistory
- currentState
- currentFunction
- patternContextId
- supportingPaths[]
- adversePaths[]
- evidenceStatus
________________________________________
83. Byeong 데이터 구조
SG-171
Byeong
- id
- sourceEntity
- action
- targetEntity
- damagedFunction
- patternContextId

- state
  - active
  - conditional
  - relieved
  - inactive

- effectiveness
- evidenceStatus
________________________________________
84. SangShen 데이터 구조
SG-172
SangShen
- id
- entityId
- supportedYongShenId
- protectedFunction
- state
  - active
  - protective_standby
  - weakened
  - stopped
- supportingPath
________________________________________
85. GuEung 데이터 구조
SG-173
GuEung
- id
- entityId
- targetByeongId
- reliefAction
- relievedPath
- currentState
________________________________________
86. LuckEffect 데이터 구조
SG-174
LuckEffect
- sourceLuckEntity
- scope

- effectType
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
  - changes_formation
________________________________________
87. 최종 원국 Role 판정 순서
SG-180
resolvePatternContext()
↓
resolveRelationFacts()
↓
lookupPatternEffectPolicies()
↓
resolveRootAndRuntime()
↓
resolveActualStructuralFunctions()
↓
identifySangShen()
↓
identifyProtectiveSangShen()
↓
identifyActiveByeong()
↓
identifyConditionalByeong()
↓
identifyGuEung()
↓
judgeStemOutcome()
↓
judgeBranchOutcome()
↓
judgeOverallOutcome()
________________________________________
88. 운에서의 Role 재판정 순서
SG-181
load ParentState
↓
apply Luck
↓
rebuild CurrentPatternContext
↓
recalculate Relations
↓
reapply PatternEffectPolicy
↓
recalculate Root / Runtime
↓
recalculate ActualStructuralFunction
↓
update SangShen CurrentState
↓
update Byeong CurrentState
↓
apply LuckReliefEffects
↓
rejudge Outcomes
________________________________________
89. 구현 금지
SG-190
Codex는 다음을 하지 않는다.
길신 = SangShen
흉신 = Byeong
금지.
또한:
•	모든 명식에 Byeong 강제 금지
•	모든 Byeong에 GuEung 강제 금지
•	운 글자를 새 SangShen Role로 생성 금지
•	운 글자를 새 Byeong Role로 생성 금지
•	운 글자를 새 GuEung Role로 생성 금지
•	Root 약화로 RoleHistory 삭제 금지
•	합거로 RoleHistory 삭제 금지
•	RelationFact 하나로 즉시 패 판정 금지
•	겸격 무정을 무조건 Byeong 하나로 단순화 금지
•	食神制殺, 傷官剋殺, 傷官合殺 통합 금지
•	傷官合殺 = 항상 길 금지
•	財生殺 = 항상 흉 금지
•	財剋印 = 항상 흉 금지
•	財剋印 = context_dependent 하나로 뭉뚱그리기 금지
________________________________________
90. 財剋印 고정 규칙
SG-191
반드시 다음처럼 분기한다.
財格:
財剋印 = favorable

印格:
財剋印 = unfavorable

印格 + 印過多:
財剋印 = favorable

食神格 + 印奪食:
財剋印 = favorable
________________________________________
91. 칠살 처리 고정 규칙
SG-192
다음을 별도 구조로 관리한다.
FoodGodControlsKilling
HurtingOfficerControlsKilling
HurtingOfficerCombinesKilling
각각:
control
control
combine
이다.
________________________________________
92. 해결 방식의 차이
SG-193
食神制殺
칠살을 제어한다.
SevenKilling = weakened 가능
傷官剋殺
칠살을 직접 제어한다.
SevenKilling = weakened 가능
傷官合殺
칠살과 상관이 합한다.
SevenKilling = stopped 가능
HurtingOfficer = stopped 가능
동일 효과로 처리하지 않는다.
________________________________________
93. 최종 성패 판정 철학
FILUNE에서 상신·병·구응은 십신 이름을 붙이는 작업이 아니다.
반드시:
현재 월령 격이 무엇인가
→ 어떤 YongShen이 발현되어 있는가
→ 정격·변격·겸격 중 무엇인가
→ YongShen끼리 유정한가 무정한가
→ 현재 RelationFact의 PatternEffectPolicy는 무엇인가
→ Root와 Runtime상 실제 작동 가능한가
→ 어떤 글자가 YongShen의 기능을 실제 도와주는가
→ 어떤 글자가 실제 기능을 깨뜨리는가
→ 그 문제는 현재 발생했는가, 운에서 조건부로 발생하는가
→ 어떤 원국 구조가 그 병을 실제 해결하는가
→ 운이 들어와 PatternContext가 달라졌을 때 기존 Role의 현재 기능은 어떻게 달라지는가
를 판정한다.
특히 다음을 고정한다.
財格 + 財剋印
→ favorable
→ Byeong 아님
印格 + 財剋印
→ unfavorable
→ Byeong 후보
印格 + 印過多 + 財剋印
→ favorable
→ 印多用財
그리고:
食神制殺 ≠ 傷官剋殺 ≠ 傷官合殺
이다.
최종 성패는 Role의 개수가 아니라:
PatternContext
→ ActualStructuralFunction
→ SangShen
→ Byeong
→ GuEung
→ Capacity
→ Stem/Branch Outcome
의 전체 경로가 실제로 기능하는지를 기준으로 판정한다.

