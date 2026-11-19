FILUNE v1 대운·세운·월운·일진 통합판정 마스터 규칙 v0.4
0. 문서 목적
이 문서는 FILUNE v1에서 다음 운 단계의 통합 판정 기준을 정의한다.
•	대운
•	세운
•	월운
•	일진
운은 원국과 별개의 새로운 사주를 만드는 것이 아니다.
원국의:
•	BranchPattern
•	ManifestedYongShen
•	PatternMode
•	YongShen
•	SangShen
•	Byeong
•	GuEung
•	RootState
•	DayMasterCapacity
•	천간·지지 관계
•	Formation
위에 새로운 글자가 들어오면서 현재 구조의 작동 상태를 변경하는 과정이다.
핵심 실행 원칙:
NatalStructure
↓
Current Luck
↓
CurrentPatternContext 재구성
↓
RelationFact
↓
PatternEffectPolicy
↓
Root / Runtime / Formation
↓
ActualStructuralFunction
↓
RoleState 갱신
↓
Stem / Branch Outcome
↓
현실 해석
________________________________________
1. 원국이 항상 선행한다
LK-001
운을 판정하기 전에 반드시 원국의 구조를 확정한다.
최소:
NatalBranchPattern
NatalPatternContext

NatalManifestedYongShen
NatalYongShenRelations

NatalSangShen
NatalByeong
NatalConditionalByeong
NatalGuEung

NatalRootState
NatalDayMasterCapacity

NatalStemOutcome
NatalBranchOutcome
NatalOverallOutcome
를 확보한다.
운을 먼저 보고 원국의 격을 역으로 결정하지 않는다.
________________________________________
2. 운은 원국 구조를 덮어쓰지 않는다
LK-002
대운·세운·월운·일진은 원국 History를 수정하지 않는다.
예:
NatalPatternMode = transformed
DaewoonPatternMode = combined
이어도:
NatalPatternMode = combined
로 덮어쓰지 않는다.
각 scope별 Snapshot으로 보존한다.
________________________________________
3. 운 단계는 서로 연결된다
LK-003
실행 흐름:
Natal
↓
Daewoon
↓
Sewoon
↓
Month
↓
Day
상위 단계에서 이미 발생한 상태 변화는 다음 단계로 승계한다.
________________________________________
4. 운의 차이는 단순 힘의 서열이 아니다
LK-004
다음과 같은 점수 체계를 사용하지 않는다.
Daewoon = 100
Sewoon = 50
Month = 20
Day = 5
운 단계의 차이는 주로:
•	지속 기간
•	구조적 배경
•	사건의 구체화 정도
•	현재성
차이다.
________________________________________
5. 각 운 단계의 역할
LK-005
대운
장기간 지속되는 구조적 환경과 배경.
세운
그 해의 핵심 변화·주제.
월운
세운의 주제가 현실에서 구체화되는 시기.
일진
당일의 실행·결정·확정·촉발 수준.
________________________________________
6. 일진을 독립 운으로 과대해석하지 않는다
LK-006
일진은:
Daewoon
+
Sewoon
+
Month
의 흐름 위에서 판정한다.
하루 글자 하나만 보고 장기적인 구조 변화를 확정하지 않는다.
________________________________________
7. 천간과 지지는 기본적으로 따로 계산한다
LK-010
기본:
Stem ↔ Stem
Branch ↔ Branch
이다.
천간과 지지는:
•	Root
•	지장간
•	입묘
•	Formation 결과
등 별도 연결 규칙을 통해 간접 연결한다.
________________________________________
8. 천간 운의 주요 의미
LK-011
천간은 주로:
•	원인
•	생각
•	판단
•	결정
•	계획
•	명분
•	사회적 역할
•	직위
•	외부 노출
•	빠르게 드러나는 변화
를 설명한다.
________________________________________
9. 지지 운의 주요 의미
LK-012
지지는 주로:
•	생활환경
•	실제 인간관계
•	심리적 체감
•	가족
•	거주
•	재산·물질 기반
•	현실적 결과
•	내부 사정
을 설명한다.
________________________________________
10. 천간과 지지 결과를 분리한다
LK-013
각 운 scope에서:
StemStructuralOutcome
BranchStructuralOutcome
OverallStructuralOutcome
을 별도로 만든다.
가능:
StemOutcome = favorable
BranchOutcome = unfavorable
또는 반대.
________________________________________
11. 천간의 결과가 원인·과정, 지지가 현실 결과일 수 있다
LK-014
예:
천간은 유리하지만 지지가 불리하면:
외부적으로 기회·직위·계약은 생기지만 실제 생활환경이나 실속에서는 부담이 남는다.
반대로 천간이 불리하고 지지가 유리하면:
외부 과정은 어렵지만 실제 결과나 내부 기반에서는 얻는 것이 남을 수 있다.
________________________________________
12. 운의 직접 비교 범위
LK-020
일반 RelationFact의 direct comparison 범위는 다음과 같다.
대운
원국 + 대운
세운
원국 + 대운 + 세운
월운
원국 + 세운 + 월운
대운은 이미 만들어 놓은 원국 상태 변화를 승계한다.
일진
원국 + 월운 + 일진
세운·대운의 상태 변화는 승계한다.
________________________________________
13. 월운에서 대운 글자를 일반 RelationTable에 다시 넣지 않는다
LK-021
월운에서 대운은:
InheritedState
로 존재한다.
그러나 일반적으로:
Month ↔ Daewoon
새 direct relation을 만들지 않는다.
________________________________________
14. 일진에서 세운·대운을 일반 direct relation에 다시 넣지 않는다
LK-022
일진에서는:
Day ↔ Month
을 immediate-parent final relation으로 본다.
대운·세운은 이미 전달된 상태로 반영한다.
________________________________________
15. Immediate Parent 원칙
LK-023 — FILUNE OPERATIONAL RULE
현재 운과 바로 위 단계 운의 최종 상호작용을 별도로 본다.
Sewoon ↔ Daewoon
Month ↔ Sewoon
Day ↔ Month
상위 모든 운과 현재 운을 무차별적으로 직접 비교하지 않는다.
________________________________________
16. 상위 운의 상태는 반드시 승계한다
LK-024
direct comparison을 하지 않는다고 상위 운 효과가 사라지는 것이 아니다.
승계 대상:
•	원국 글자의 stopped
•	원국 글자의 weakened
•	RootState 변화
•	FormationState
•	DayMasterCapacity
•	YongShen Runtime
•	SangShen CurrentState
•	Byeong CurrentState
•	GuEung CurrentState
•	CurrentPatternContext
•	ConditionalByeong 활성
•	StructuralOutcome 배경
________________________________________
17. 운 scope는 독립 Snapshot이다
LK-025
보존:
NatalState
DaewoonState
SewoonState
MonthState
DayState
각 State에는 해당 시점의 CurrentPatternContext를 포함한다.
________________________________________
18. 운에서 PatternContext를 반드시 재계산한다
LK-030 — CORE
운 천간이 들어오면 가장 먼저 확인한다.
Is current luck stem
a usable MonthHiddenStem candidate?
맞다면 현재 scope의:
ManifestedYongShenSet
을 갱신한다.
그 결과:
•	HeavenlyPattern
•	PatternMode
•	YongShenRelation
을 다시 계산한다.
________________________________________
19. BranchPattern은 운에서 바뀌지 않는다
LK-031
운으로 새 YongShen이 투출되어도:
NatalBranchPattern
은 유지한다.
변하는 것은:
CurrentHeavenlyPattern
CurrentPatternMode
CurrentManifestedYongShen
이다.
________________________________________
20. 운에서 YongShen 발현
LK-032
운 천간이 월령 지장간의 사용 가능한 YongShen 후보라면:
LuckManifestedYongShen
이 된다.
월령 지장간 provenance가 없는 일반 운 천간은:
LuckActor
이지 ManifestedYongShen이 아니다.
________________________________________
21. 운에서 정격이 될 수 있다
LK-033
원국에서 천간 YongShen이 없고 운에서 월령 본기가 투출하면:
CurrentPatternMode = proper
가능.
원국 History는 수정하지 않는다.
________________________________________
22. 운에서 변격이 될 수 있다
LK-034
운에서 본기 외의 월령 YongShen 후보가 투출하면:
CurrentPatternMode = transformed
가능.
________________________________________
23. 운에서 겸격이 될 수 있다
LK-035
기존 ManifestedYongShen이 있는 상황에서 운이 다른 월령 YongShen을 추가하면:
CurrentPatternMode = combined
가능.
________________________________________
24. 겸격이 되면 유정·무정을 다시 본다
LK-036
새로운 YongShen이 추가되면:
existing YongShen
↔
new YongShen
의:
•	生
•	剋
•	合
•	stopped 가능성
을 모두 재평가한다.
________________________________________
25. 운에서 YongShen이 합거되면 PatternContext를 다시 계산한다
LK-037
유효 천간합으로 YongShen이 stopped되면:
RoleHistory = retained
CurrentActiveYongShenSet = recomputed
CurrentEffectivePattern = recomputed
한다.
________________________________________
26. PatternContext 변경은 RoleHistory를 바꾸지 않는다
LK-038
원국 SangShen·Byeong·GuEung의 이름을 운마다 새로 작성하지 않는다.
운은:
CurrentState
CurrentFunction
LuckEffect
를 변경한다.
________________________________________
27. 운마다 PatternEffectPolicy를 다시 조회한다
LK-040 — CORE
다음 금지:
Natal Policy
→ 모든 운에 그대로 적용
CurrentPatternContext가 달라졌다면:
lookupPatternEffectPolicy(
  CurrentPatternContext,
  CurrentRelationFact
)
를 다시 실행한다.
________________________________________
28. 동일 RelationFact도 운의 PatternContext에 따라 반대 방향이 될 수 있다
LK-041
대표:
財 → 剋 → 印
재격
favorable
인수격
unfavorable
인수격 + 印過多
favorable
운 판정에서도 이 분기를 그대로 적용한다.
________________________________________
29. 재격 운에서 印이 들어오는 경우
LK-042 — FIXED
현재 BranchPattern이 財格이고 운에서 印이 들어오면:
財格 + 印
자체를 불리하게 처리하지 않는다.
기본:
favorable
이다.
해석:
•	부 + 학식
•	현실적 성취 + 문서
•	재물 + 공부·자격
•	실무 + 지식
의 결합이 가능하다.
________________________________________
30. 재격 운에서 財剋印
LK-043 — FIXED
재격에서 현재 운 관계가:
財 → 剋 → 印
이면:
PatternEffectPolicy = favorable
로 처리한다.
금지:
財剋印
→ 印 손상
→ 운이 나쁨
이라는 전역 판정.
________________________________________
31. 인수격 운에서 財剋印
LK-044
현재 BranchPattern이 印格이라면:
財 → 剋 → 印
기본:
unfavorable
이다.
용신 印을 공격하기 때문이다.
________________________________________
32. 인수격 + 印過多
LK-045
인성이 과다한 상태에서 운의 財가 印을 제어하면:
印多用財
가 될 수 있다.
이때:
財剋印 = favorable
로 반전한다.
________________________________________
33. 財剋印 운 판정 고정표
LK-046
WealthPattern:
  WealthControlsResource
  → favorable

ResourcePattern:
  WealthControlsResource
  → unfavorable

ResourcePattern + ResourceExcessive:
  WealthControlsResource
  → favorable

FoodGodPattern + harmful Resource:
  WealthControlsResource
  → favorable candidate
________________________________________
34. 칠살 처리 관계를 분리한다
LK-050 — CORE
운에서 다음은 서로 다른 Effect다.
食神制殺
傷官剋殺
傷官合殺
________________________________________
35. 食神制殺
LK-051
FoodGod
→ control
→ SevenKilling
Effect:
SevenKilling effectiveness ↓
가능.
Source와 Target을 자동 stopped시키지 않는다.
________________________________________
36. 傷官剋殺
LK-052
HurtingOfficer
→ control
→ SevenKilling
Effect:
SevenKilling effectiveness ↓
가능.
傷官合殺과 구분한다.
________________________________________
37. 傷官合殺
LK-053
HurtingOfficer
→ combine
→ SevenKilling
유효 천간합일 때만 인정한다.
원국-운 유효 합거 규칙이 적용되면:
HurtingOfficer = stopped
SevenKilling = stopped
가능.
________________________________________
38. 傷官合殺의 길흉은 PatternContext가 결정한다
LK-054
정관격 + 혼입 七殺
傷官合殺
→ favorable
가능.
재격 + 해로운 財生殺
傷官合殺
→ favorable
가능.
양인격 + 필요한 七殺
傷官合殺
→ unfavorable
가능.
________________________________________
39. 운에서 칠살이 들어오는 경우 한 경로만 보지 않는다
LK-055
예:
원국:
食神 → 生 財
운:
SevenKilling enters
그러면 동시에:
食神 → 剋 七殺
財 → 生 七殺
이 모두 존재할 수 있다.
하나를 지워서 단순화하지 않는다.
________________________________________
40. 식신생재 + 재생살
LK-056
운 전에는:
食神 → 生 財
가 favorable일 수 있다.
칠살 운 이후:
食神 → 生 財 → 生 七殺
이 추가될 수 있다.
따라서:
•	기존 식신생재 favorable path 유지
•	새 재생살 adverse path 추가
•	食神制殺 path도 별도 유지
한다.
________________________________________
41. ConditionalByeong 활성
LK-057
원국 財가:
CurrentFunction = favorable
ConditionalByeong = can_feed_future_killing
인 상태에서 운 七殺이 들어오면:
ConditionalByeong
→ active
가능.
새 원국 Byeong Role을 만드는 것이 아니다.
________________________________________
42. 운 글자는 새 Byeong Role이 아니다
LK-060
운에서 들어온 글자가 문제를 만들면:
LuckAdverseEffect
를 만든다.
예:
•	activates_byeong
•	strengthens_byeong
•	attacks_yongshen
•	attacks_sangshen
•	creates_harmful_relation
•	changes_pattern_mode
________________________________________
43. 운 글자는 새 SangShen Role이 아니다
LK-061
운 글자가 좋은 기능을 하면:
LuckSupportEffect
로 기록한다.
예:
•	protects_yongshen
•	weakens_byeong
•	relieves_byeong
•	activates_sangshen_function
•	strengthens_required_function
________________________________________
44. 운 글자는 새 GuEung Role이 아니다
LK-062
운이 원국 병을 해소해도:
LuckReliefEffect
이다.
LuckGuEungRole
을 생성하지 않는다.
________________________________________
45. 운은 기존 SangShen을 활성화할 수 있다
LK-063
원국 Protective Standby SangShen이 운의 위협을 실제로 막게 되면:
protective_standby
→ active_current_function
가능.
RoleHistory 자체는 원국에 남는다.
________________________________________
46. 운은 기존 Byeong을 활성화할 수 있다
LK-064
ConditionalByeong의 trigger가 운에서 들어오면:
conditional
→ active
로 바뀐다.
________________________________________
47. 운은 기존 Byeong을 완화할 수 있다
LK-065
운 관계가 ByeongPath를 약화하거나 끊으면:
CurrentByeongState
→ weakened / relieved / inactive
가능.
RoleHistory는 유지.
________________________________________
48. 천간합 기본 원칙
LK-070
천간합은:
•	관계가 실제 존재하는지
•	현재 direct comparison 범위인지
•	대상이 이미 stopped인지
•	합 우선순위
를 확인한다.
________________________________________
49. 일간과의 합은 일반 합거로 처리하지 않는다
LK-071
일간 참여 합은 일반 운세의 stopped 판정에서 제외한다.
들어온 운 십신의 기능을 자동 삭제하지 않는다.
________________________________________
50. 원국 글자와 운 글자의 유효 합거
LK-072
원국-운 유효 천간합으로 합거되면 원국 글자의 기능이 stopped될 수 있다.
이 상태는 해당 운 유효기간 동안 하위 scope로 승계한다.
________________________________________
51. 이미 stopped인 원국 글자
LK-073
이미 상위 운에서 stopped된 원국 글자는 하위 운에서 새로운 생극 Source로 사용하지 않는다.
RoleHistory는 유지한다.
________________________________________
52. 운끼리의 합
LK-074 — FILUNE OPERATIONAL
운끼리의 합은 원국-운 합거와 동일한 full stop으로 처리하지 않고, 기본적으로 상호 작용력 약화로 처리한다.
해당 운 관계 우선순위는:
Daewoon
→ Sewoon
→ Month
→ Day
순서를 따른다.
________________________________________
53. 합 때문에 기존 RoleHistory를 삭제하지 않는다
LK-075
합거된 YongShen·SangShen·Byeong도:
RoleHistory = retained
CurrentState = stopped
로 관리한다.
________________________________________
54. Root는 운마다 재계산한다
LK-080
각 scope에서:
existing Root
+
new luck branch Root
+
Formation Root
+
clash weakening
+
element overload
를 반영한다.
________________________________________
55. 운에서 Root 추가
LK-081
운 지지가 천간 또는 일간의 Root가 되면:
RootState = strengthened
가능.
________________________________________
56. stopped 천간은 Root 강화로 살아나지 않는다
LK-082
StemRuntimeState = stopped
이면 운에서 Root가 추가되어도:
active
로 복귀하지 않는다.
________________________________________
57. DayMasterCapacity도 운마다 재계산한다
LK-083
필요에 따라:
•	officer_capacity
•	killing_capacity
•	wealth_capacity
•	output_capacity
•	self_support_excess
를 갱신한다.
________________________________________
58. Capacity 강화 = 자동 길이 아니다
LK-084
일간 Root가 강해져도:
•	무엇을 감당해야 하는지
•	이미 과도하게 강한지
•	필요한 설기·제어 경로가 있는지
를 본다.
________________________________________
59. Formation과 일반 direct relation을 분리한다
LK-090
Formation은:
현재 같이 존재하는 지지 중
삼합·반합·방합을 완성하는 조합이 있는가
를 별도로 검사한다.
이는 OP-L01의 ordinary direct relation 범위와 다른 계산층이다.
________________________________________
60. FormationBranchPool
LK-091
대운
Natal + Daewoon
세운
Natal + Daewoon + Sewoon
월운
Natal + Daewoon + Sewoon + Month
일진
Natal + Daewoon + Sewoon + Month + Day
________________________________________
61. FormationBranchPool은 일반 관계표를 확장하지 않는다
LK-092
월운 Formation에 대운 지지가 참여한다고 해서:
Month ↔ Daewoon
일반 육합·충·형·파·해 RelationFact를 새로 만들지 않는다.
________________________________________
62. 운 단계가 올라가며 Formation이 완성될 수 있다
LK-093
예:
Natal 卯
+
Daewoon 亥
→ 亥卯 반합국

+
Sewoon 未
→ 亥卯未 완전 삼합국
가능.
________________________________________
63. Formation은 RootState를 바꿀 수 있다
LK-094
왕지를 포함한 반합국 또는 완성된 삼합·방합은 해당 오행의 천간 RootState를 강화할 수 있다.
________________________________________
64. Formation도 길흉 고정 금지
LK-095
Formation 자체에:
good
bad
를 저장하지 않는다.
형성된 오행의:
•	PatternRole
•	YongShen
•	SangShen
•	Byeong
•	DayMasterCapacity
를 확인한다.
________________________________________
65. 六合과 Formation을 혼동하지 않는다
LK-096
六合:
•	관계
•	결속
•	기능 조정
•	약화
가능.
그러나 삼합/방합과 같은 오행 Formation은 아니다.
________________________________________
66. 합과 충은 동시에 존재할 수 있다
LK-097
운 지지가 원국 지지와 합도 하고 다른 지지와 충도 한다면:
둘 다 RelationFact로 유지한다.
합 때문에 충을 삭제하지 않는다.
________________________________________
67. 합 개입은 충의 실제 효과를 약화시킬 수 있다
LK-098
충 Relation은 유지하면서:
CurrentClashEffect = weakened
가능.
________________________________________
68. 지지 병이 합에 참여하면 병 기능이 약화될 수 있다
LK-099
Byeong 역할 지지가:
•	六合
•	반합
•	삼합
•	방합
등에 참여하여 실제 문제 기능이 약화되면:
LuckEffect = weakens_byeong
가능.
________________________________________
69. 대운 실행 순서
LK-100
load NatalState

1. apply DaewoonStem
2. check MonthHiddenStem manifestation
3. update ManifestedYongShen
4. build DaewoonPatternContext
5. evaluate YongShenRelations

6. calculate Natal ↔ Daewoon stem relations
7. resolve valid stem combinations

8. apply DaewoonBranch
9. calculate Natal ↔ Daewoon branch relations
10. detect Daewoon Formation

11. recalc RootState
12. recalc 12LifeStage support
13. recalc DayMasterCapacity

14. lookup PatternEffectPolicy
15. resolve ActualStructuralFunction

16. update YongShen Runtime
17. update SangShen CurrentState
18. activate/weaken/relieve Byeong
19. update GuEung CurrentState

20. judge StemOutcome
21. judge BranchOutcome
22. judge DaewoonOverallOutcome

23. save DaewoonState
________________________________________
70. 세운 실행 순서
LK-101
load DaewoonState

1. apply SewoonStem
2. check MonthHiddenStem manifestation
3. update ManifestedYongShen
4. build SewoonPatternContext
5. evaluate YongShenRelations

6. calculate Natal ↔ Sewoon direct stem relations
7. resolve valid stem combinations

8. apply SewoonBranch
9. calculate allowed branch relations
10. detect current Formation

11. recalc RootState
12. recalc Capacity

13. lookup PatternEffectPolicy
14. resolve ActualStructuralFunction

15. update RoleStates

16. calculate Sewoon ↔ Daewoon immediate-parent relation

17. re-evaluate CurrentFunction if required

18. judge StemOutcome
19. judge BranchOutcome
20. judge SewoonOverallOutcome

21. save SewoonState
________________________________________
71. 월운 실행 순서
LK-102
load SewoonState

1. apply MonthStem
2. check MonthHiddenStem manifestation
3. update ManifestedYongShen
4. build MonthPatternContext
5. evaluate YongShenRelations

6. calculate Natal ↔ Month direct relations
7. resolve stem combination

8. apply MonthBranch
9. calculate Natal/Sewoon/Month allowed direct branch relations
10. detect Formation using full FormationBranchPool

11. recalc RootState
12. recalc Capacity

13. lookup PatternEffectPolicy
14. resolve ActualStructuralFunction

15. update RoleStates

16. calculate Month ↔ Sewoon immediate-parent relation
17. re-evaluate current effects

18. judge StemOutcome
19. judge BranchOutcome
20. judge MonthOverallOutcome

21. save MonthState
________________________________________
72. 일진 실행 순서
LK-103
load MonthState

1. apply DayStem
2. check MonthHiddenStem manifestation
3. update ManifestedYongShen
4. build DayPatternContext
5. evaluate YongShenRelations

6. calculate Natal ↔ Day direct relations
7. resolve stem combination

8. apply DayBranch
9. calculate allowed branch relations
10. detect Formation using full current FormationBranchPool

11. recalc RootState
12. recalc Capacity

13. lookup PatternEffectPolicy
14. resolve ActualStructuralFunction

15. update RoleStates

16. calculate Day ↔ Month immediate-parent relation
17. re-evaluate effects

18. judge StemOutcome
19. judge BranchOutcome
20. judge DayOverallOutcome

21. save DayState
________________________________________
73. RoleState 갱신 순서
LK-110
각 scope에서:
ActualStructuralFunction
↓
YongShen Runtime
↓
SangShen CurrentState
↓
ConditionalByeong trigger check
↓
Byeong CurrentState
↓
GuEung CurrentState
↓
LuckEffect
순으로 갱신한다.
________________________________________
74. 운에서 기존 SangShen이 stopped될 수 있다
LK-111
운 합거 또는 공격으로 SangShen이 기능을 잃으면:
SangShenRoleHistory = retained
CurrentState = stopped
한다.
________________________________________
75. 운에서 Byeong source가 stopped될 수 있다
LK-112
운 합거로 병의 source가 stopped되면:
ByeongRoleHistory = retained
CurrentByeongFunction = inactive
가능.
________________________________________
76. 운에서 GuEung이 stopped될 수 있다
LK-113
원국의 GuEung 역할 글자가 합거되면:
GuEung CurrentState = stopped
로 처리하고 ByeongPath를 다시 평가한다.
________________________________________
77. PatternContext 변화로 Role 기능이 반전될 수 있다
LK-114
같은 원국 글자도 운에서 CurrentPatternContext가 달라지면:
favorable function
→ adverse function
또는 반대가 가능하다.
RoleHistory 자체는 유지한다.
________________________________________
78. 재격의 운 판정 사례 구조
LK-120
원국
BranchPattern = Wealth
財 active
印 present
운
財가 印을 극함.
판정:
RelationFact = 財剋印
Policy = favorable
이를 Byeong으로 만들지 않는다.
________________________________________
79. 재격에 印運
LK-121
財格에 印運이 들어오면:
印運 = unfavorable
로 자동 판단하지 않는다.
기본적으로 긍정 가능.
단 다른 별도 RelationFact가 실제 문제를 만들면 그 경로를 별도로 판정한다.
________________________________________
80. 인수격의 財運
LK-122
印格에 財運이 들어오고 실제:
財 → 剋 印
하면:
Policy = unfavorable
이다.
印 과다인 경우만 별도 반전.
________________________________________
81. 재격 + 七殺 운
LK-123
재격에서 운 七殺이 들어오면:
財 → 生 七殺
이 실제 형성되는지 본다.
형성되고 七殺이 해로운 경우:
LuckEffect = activates_byeong
가능.
________________________________________
82. 재격 + 七殺 + 食神
LK-124
동시에:
食神 → 剋 七殺
財 → 生 七殺
이 존재할 수 있다.
둘 다 계산한다.
최종은:
•	Root
•	Runtime
•	거리/유효 관계
•	Capacity
를 반영한다.
________________________________________
83. 재격 + 七殺 + 傷官合殺
LK-125
상관이 칠살과 유효 천간합하면:
傷官 stopped
七殺 stopped
가능.
해로운 재생살 경로가 끊어지면:
LuckEffect = relieves_byeong
가능.
________________________________________
84. 정관격 + 七殺 운
LK-126
칠살이 들어와 官殺混雜이 발생하면:
LuckEffect = activates_mixed_officer_killing
가능.
________________________________________
85. 정관격 + 傷官合殺
LK-127
혼입 七殺을 傷官이 합거하여 正官이 남으면:
favorable
가능.
단 傷官도 stopped된다는 점을 반영한다.
________________________________________
86. 양인격 + 七殺 운
LK-128
七殺이 양인을 제어한다면:
favorable
가능.
일간 Capacity와 七殺 과다 여부는 별도 확인한다.
________________________________________
87. 양인격 + 食神制殺
LK-129
필요한 七殺을 식신이 제거하면:
unfavorable_candidate
이다.
________________________________________
88. 양인격 + 傷官合殺
LK-130
필요한 七殺이 합거되어 stopped되면:
unfavorable
가능.
그 결과 양인이 다시 살아나는지도 재평가한다.
________________________________________
89. 운의 현실 해석은 구조 판정 뒤에 한다
LK-140
먼저:
StructuralOutcome
을 결정한다.
그 뒤:
•	TenGod
•	Palace
•	Stem/Branch
•	현재 Role
•	ExperiencedProcess
를 조합해 현실 언어로 번역한다.
________________________________________
90. 궁위 관계
LK-141
운 지지가 원국 궁위와:
•	합
•	충
•	형
•	파
•	해
를 만들면 그 생활영역을 설명한다.
단 관계 이름만으로 사건을 확정하지 않는다.
________________________________________
91. 일지
LK-142
주요 영역:
•	배우자
•	연애
•	결혼
•	동거
•	가장 가까운 관계
•	개인 생활기반
________________________________________
92. 월지
LK-143
주요 영역:
•	직장·사회환경
•	부모
•	생활기반
•	월령 구조
________________________________________
93. 시지
LK-144
주요 영역:
•	자녀
•	미래 계획
•	개인 활동
•	결과물
•	개인 시간
________________________________________
94. 년지
LK-145
주요 영역:
•	초기환경
•	가족 배경
•	외부 사회환경
•	원래 생활기반
________________________________________
95. 궁위 충 = 자동 사건 금지
LK-146
금지:
日支 clash
→ divorce
대신:
Relation
+
Palace
+
TenGod
+
StructuralRole
+
CurrentOutcome
을 조합한다.
________________________________________
96. ExperiencedProcess
LK-150
좋은 구조적 운이라고 반드시 편안한 것은 아니다.
예:
七殺을 잘 활용하는 운은:
•	책임 증가
•	압박
•	난제
•	경쟁
를 동반하면서 결과는 유리할 수 있다.
따라서:
StructuralOutcome
ExperiencedProcess
를 분리한다.
________________________________________
97. 조후는 별도 보정층이다
LK-151
조후는:
•	PatternContext
•	YongShen
•	SangShen
•	Byeong
을 대체하지 않는다.
운의 체감과 환경 적합도를 보조한다.
________________________________________
98. 운 결과 등급
LK-160
각 scope의 최종 StructuralOutcome:
成
有利優勢
不利優勢
敗
를 사용한다.
________________________________________
99. 숫자 점수 금지
LK-161
금지:
Daewoon +50
Sewoon -20
Month +10
또는:
good relation 3개
bad relation 2개
→ +1
같은 계산.
________________________________________
100. 상반된 경로를 개수로 상쇄하지 않는다
LK-162
예:
食神制殺
財生殺
이 동시에 있으면:
+1 -1 = 0
으로 계산하지 않는다.
각 경로의 구조적 중요성과 실제 기능을 본다.
________________________________________
101. CurrentPatternContext 데이터
LK-170
LuckPatternContext
- scope
- branchPatternHistory

- manifestedYongShen[]
- heavenlyPatterns[]
- patternMode
- yongShenRelations[]

- inheritedPatternState
- currentLuckManifestations[]
________________________________________
102. LuckScopeState
LK-171
LuckScopeState
- scope
- parentStateId

- patternContext

- stemRelationFacts[]
- branchRelationFacts[]
- formationFacts[]

- rootStates[]
- dayMasterCapacity

- actualStructuralFunctions[]

- yongShenStates[]
- sangShenStates[]
- byeongStates[]
- guEungStates[]

- luckEffects[]

- stemOutcome
- branchOutcome
- overallOutcome

- experiencedProcess
- palaceEffects[]
________________________________________
103. LuckEffect 타입
LK-172
LuckEffectType
- manifests_yongshen
- changes_heavenly_pattern
- expands_to_combined_pattern
- reduces_effective_combined_pattern

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

- creates_favorable_relation
- creates_adverse_relation
________________________________________
104. PatternEffectPolicy provenance도 보존한다
LK-173
운 판정 결과에는 가능하면 어떤 Policy가 적용됐는지 남긴다.
PolicyResolution
- policyId
- evidenceStatus
- direction
- reversalApplied
________________________________________
105. 재격 財剋印 회귀 테스트
LK-180
반드시 포함한다.
Case A
BranchPattern = Wealth
Luck = Resource
Wealth controls Resource
Expected:
Policy = favorable
Byeong = false
________________________________________
106. 인수격 財剋印 회귀 테스트
LK-181
BranchPattern = Resource
Luck Wealth controls Resource
Expected:
Policy = unfavorable
Byeong candidate = true
________________________________________
107. 인다용재 회귀 테스트
LK-182
BranchPattern = Resource
ResourceState = excessive
Luck Wealth controls Resource
Expected:
Policy = favorable
Formula = 印多用財
________________________________________
108. 食神制殺 회귀 테스트
LK-183
Expected:
relationType = control
target = SevenKilling
target != automatically stopped
________________________________________
109. 傷官剋殺 회귀 테스트
LK-184
Expected:
relationType = control
formula != HurtingOfficerCombinesKilling
________________________________________
110. 傷官合殺 회귀 테스트
LK-185
Expected:
relationType = combine

if valid:
  HurtingOfficer = stopped
  SevenKilling = stopped
________________________________________
111. 傷官合殺 정관격 테스트
LK-186
OfficerPattern
+
mixed SevenKilling
+
valid HurtingOfficerCombinesKilling
Expected:
mixed killing relieved
Officer preserved
direction = favorable
________________________________________
112. 傷官合殺 재격 테스트
LK-187
WealthPattern
+
Wealth generates harmful Killing
+
HurtingOfficer combines Killing
Expected:
harmful Killing stopped
Byeong relieved
direction = favorable
________________________________________
113. 傷官合殺 양인격 테스트
LK-188
YangBladePattern
+
SevenKilling controls Blade
+
HurtingOfficer combines required Killing
Expected:
required Killing stopped
direction = unfavorable
________________________________________
114. 운에서 겸격 전환 테스트
LK-189
원국:
PatternMode = transformed
ManifestedYongShen = A
운:
new MonthHiddenStem YongShen B manifests
Expected:
PatternMode = combined
YongShen A/B relation recalculated
Policy re-resolved
________________________________________
115. 운 종료 테스트
LK-190
운에서 잠시 추가된 ManifestedYongShen은 해당 운 종료 후 자동 NatalHistory로 편입되지 않는다.
________________________________________
116. 구현 금지
LK-200
Codex는 다음을 하지 않는다.
•	대운·세운·월운·일진에 임의 숫자 가중치 부여
•	현재 운에서 NatalPatternContext를 덮어쓰기
•	운에서 BranchPattern 자체 변경
•	새 YongShen 발현 후 PatternMode 재계산 생략
•	Natal PatternEffectPolicy를 모든 운에 그대로 적용
•	운 글자를 새 SangShenRole로 생성
•	운 글자를 새 ByeongRole로 생성
•	운 글자를 새 GuEungRole로 생성
•	ConditionalByeong과 LuckAdverseEffect 혼동
•	財剋印을 전역적으로 불리 처리
•	財剋印을 전역적으로 context_dependent로 처리
•	財格의 財剋印을 불리로 판정
•	印格의 일반 財剋印을 유리로 판정
•	印多用財 예외 누락
•	食神制殺과 傷官剋殺 통합
•	傷官剋殺과 傷官合殺 통합
•	傷官合殺을 항상 유리 처리
•	財生殺을 항상 불리 처리
•	stopped 천간을 Root 강화로 재활성화
•	월운에서 대운을 ordinary direct relation table에 재삽입
•	일진에서 세운·대운을 ordinary direct relation table에 재삽입
•	FormationBranchPool을 ordinary direct relation table과 동일하게 취급
•	합이 있으면 충 Relation 삭제
•	지지합을 천간합거처럼 완전 stopped 처리
•	궁위 충만으로 구체적 사건 확정
•	운 결과를 관계 개수 합산으로 판정
________________________________________
117. 최종 실행 함수
LK-210
evaluateLuckScope(
  parentState,
  currentLuck,
  scope
):

1. inheritParentState()

2. applyCurrentLuckStem()

3. detectMonthHiddenStemManifestation()
4. updateManifestedYongShenSet()
5. rebuildCurrentHeavenlyPatterns()
6. classifyCurrentPatternMode()
7. evaluateCurrentYongShenRelations()

8. collectAllowedStemRelationFacts()
9. resolveStemRuntimeStates()

10. applyCurrentLuckBranch()
11. collectAllowedBranchRelationFacts()

12. buildFormationBranchPool()
13. detectCurrentFormations()

14. recalculateRootFactsAndStates()
15. recalculateDayMasterCapacity()

16. resolvePatternEffectPolicies()
17. resolveActualStructuralFunctions()

18. updateYongShenStates()
19. updateSangShenStates()
20. updateConditionalByeongStates()
21. updateByeongStates()
22. updateGuEungStates()
23. buildLuckEffects()

24. resolveImmediateParentRelations()

25. recheckActualStructuralFunctionsIfNeeded()

26. judgeStemStructuralOutcome()
27. judgeBranchStructuralOutcome()
28. judgeOverallStructuralOutcome()

29. resolvePalaceEffects()
30. buildExperiencedProcess()

31. return LuckScopeState
________________________________________
118. 최종 핵심 원칙
FILUNE의 운 판정은:
“이 운에 어떤 십신이 들어왔는가”
만 보는 것이 아니다.
반드시:
현재 원국 구조가 무엇인가
→ 상위 운에서 어떤 상태 변화가 이미 일어났는가
→ 현재 운 천간이 월령 YongShen을 새로 발현시키는가
→ 현재 천간 격이 정격·변격·겸격 중 어떻게 달라지는가
→ YongShen끼리 유정한가 무정한가
→ 어떤 RelationFact가 새로 생기는가
→ 그 관계가 현재 PatternContext에서는 유리한가 불리한가
→ 합거·Root·Formation 때문에 실제 기능할 수 있는가
→ 기존 SangShen·Byeong·GuEung의 현재 상태가 어떻게 변하는가
→ 천간의 외부 결과와 지지의 실제 결과가 각각 어떠한가
→ 어느 궁위와 생활영역에 현실적으로 드러나는가
를 순서대로 판단한다.
특히 다음을 고정한다.
財格 + 財剋印
→ favorable
印格 + 財剋印
→ unfavorable
印格 + 印過多 + 財剋印
→ favorable
그리고:
食神制殺
≠ 傷官剋殺
≠ 傷官合殺
이다.
또한 운에서 새 YongShen이 발현하면:
CurrentPatternContext 재생성
→ PatternEffectPolicy 재조회
→ ActualStructuralFunction 재판정
→ RoleState 재평가
를 반드시 수행한다.
이 구조를 FILUNE v1의 대운·세운·월운·일진 통합 실행 기준으로 사용한다.

