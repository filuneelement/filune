FILUNE v1 격국 판정 마스터 규칙 v1.2
0. 문서 목적
이 문서는 FILUNE v1에서 다음을 판정하기 위한 기준이다.
•	월령 기반 지지 격
•	월령 지장간 YongShen 후보
•	천간에 실제 투출한 YongShen
•	정격
•	변격
•	겸격
•	월령무용
•	비견격·겁재격·양인격 특수 분기
•	운에서 YongShen이 새로 투출할 때의 천간 격 변화
•	겸격의 유정·무정
•	PatternContext 생성
이 문서는 단순히 사주에 하나의 격 이름을 붙이기 위한 문서가 아니다.
FILUNE에서는:
월령의 지지 격과 천간의 실제 투출 격을 분리해서 본다.
________________________________________
1. 용신의 출발점은 월령이다
PT-001 — SOURCE EXPLICIT
FILUNE에서 격과 YongShen 판단의 출발점은 월령이다.
전문가 자료는 월지 자체와 그 안의 지장간을 용신의 출처로 설명한다.
따라서 먼저:
MonthBranch
↓
MonthHiddenStems
↓
BranchPattern
을 확정한다.
________________________________________
2. BranchPattern은 월령 자체의 지지 격이다
PT-002
월령이 일간과 만드는 십신을 기준으로 BranchPattern을 만든다.
예:
丙日 申月
→ BranchPattern = 偏財
BranchPattern은 원국 월령의 기본 구조다.
운이 들어와도 월령 자체가 바뀌는 것은 아니므로 BranchPattern History는 유지한다.
________________________________________
3. BranchPattern과 HeavenlyPattern은 동일하지 않을 수 있다
PT-003 — SOURCE EXPLICIT
전문가 자료는 월지가 편재이더라도 본기가 아닌 다른 지장간 성분 壬이 천간에 투출하면:
•	지지는 편재 중심
•	천간은 편관 중심
으로 따로 본다고 설명한다. 이를 변격이라고 부른다.
따라서 FILUNE은:
BranchPattern
과:
HeavenlyPattern
을 별도 저장한다.
________________________________________
4. 월령 지장간은 모두 YongShen 후보가 될 수 있다
PT-004 — SOURCE EXPLICIT
일반격에서는 월령 지장간에 포함된 사용 가능한 성분이 천간에 투출하면 YongShen이 될 수 있다.
본기만 YongShen으로 인정하지 않는다.
전문가 자료의 申월 예에서도 월령 지장간의 다른 성분이 투출하면 그 글자를 천간 YongShen으로 사용한다고 설명한다.
________________________________________
5. ManifestedYongShen은 복수일 수 있다
PT-005
천간에 투출한 월령 YongShen을:
ManifestedYongShen[]
배열로 보존한다.
한 개를 대표 YongShen으로 뽑고 나머지를 삭제하지 않는다.
________________________________________
6. 지장간 출처를 반드시 보존한다
PT-006
각 YongShen은 다음 출처를 가진다.
main
middle
residual
즉:
•	본기
•	중기
•	여기
를 구분한다.
FILUNE 우선순위:
본기 > 중기 = 여기
이다.
숫자 배수는 사용하지 않는다.
________________________________________
7. 본기 투출의 의미
PT-007 — SOURCE EXPLICIT
월령 본기가 천간에 투출하면 월지의 중심과 천간에서 사용하는 중심이 일치한다.
전문가 자료에서는 이런 경우를 정격이라고 설명한다.
예:
丙日 申月
BranchPattern = 偏財

庚 偏財 투출

HeavenlyPattern = 偏財
PatternMode = proper
________________________________________
8. 정격 proper
PT-008
정격 조건:
1.	BranchPattern 확정
2.	월령 본기 투출
3.	천간의 중심 YongShen이 BranchPattern과 같은 계열
4.	다른 투출 YongShen이 없거나, 있다면 겸격 규칙을 우선 확인
즉 본기가 투출했다고 무조건 proper only로 종료하지 않는다.
________________________________________
9. 본기 외 지장간 성분 투출
PT-009 — SOURCE EXPLICIT
월령 본기가 아니라 중기·여기 등 다른 사용 가능한 성분이 천간에 투출하면, 천간에서는 그 투출 YongShen을 중심으로 본다.
전문가 자료는 이를 변격이라고 설명한다.
________________________________________
10. 변격 transformed
PT-010
예:
丙日 申月

BranchPattern = 偏財

壬 七殺 투출

HeavenlyPattern = 七殺
PatternMode = transformed
이 경우 전체 명식을 단순히 칠살격이라고 덮어쓰지 않는다.
정확히:
•	지지 격 = 편재격
•	천간 격 = 칠살 중심 변격
으로 본다.
________________________________________
11. 변격에서도 BranchPattern은 유지한다
PT-011
변격이 되었다고:
BranchPattern = SevenKilling
로 바꾸지 않는다.
BranchPattern은 월령 History로 유지한다.
변하는 것은 천간의 판정 중심이다.
________________________________________
12. 여러 YongShen 투출
PT-012 — SOURCE EXPLICIT
월령 지장간의 두 개 이상 사용 가능한 성분이 천간에 함께 투출하면 겸격이 가능하다.
전문가 사례에서 申월 丙화에:
•	庚 편재
•	戊 식신
이 함께 투출한 경우를 명확히 겸격이라고 부른다.
________________________________________
13. 겸격 combined
PT-013
예:
BranchPattern = 偏財

ManifestedYongShen:
- 庚 偏財
- 戊 食神

HeavenlyPatterns:
- 偏財
- 食神

PatternMode = combined
복수 YongShen을 모두 유지한다.
________________________________________
14. 본기가 포함된 겸격
PT-014
본기 + 다른 월령 지장간 성분이 동시에 투출해도 겸격이다.
예:
MainQi Wealth
+
ResidualQi FoodGod
이 함께 투출하면:
PatternMode = combined
으로 판정한다.
본기는 핵심 출처이지만 다른 YongShen을 삭제하지 않는다.
________________________________________
15. 본기 없는 겸격도 가능
PT-015 — SOURCE EXPLICIT / INFERENCE
전문가 자료에서는 본기가 아닌 여러 월령 지장간 성분이 투출해도 복수 YongShen 구조를 겸해서 볼 수 있다는 해석 흐름을 사용한다.
따라서 FILUNE은:
non-main manifested YongShen A
+
non-main manifested YongShen B
도 겸격 후보로 허용한다.
단 각각이 실제 월령 YongShen 후보인지 먼저 확인한다.
________________________________________
16. 겸격에서는 유정·무정이 필수 판정이다
PT-016 — SOURCE EXPLICIT
전문가 자료는 겸격일 때 두 YongShen 사이가 유정한지 무정한지를 반드시 본다고 설명한다.
따라서 겸격 판정 후 즉시:
YongShenRelation
을 생성한다.
________________________________________
17. 유정
PT-017
두 YongShen이:
•	생
•	보호
•	통관
•	서로 필요한 기능을 보완
하면 유정 가능.
예:
食神 → 生 → 財
전문가 사례에서도 식신생재를 유정으로 판단한다.
________________________________________
18. 무정
PT-018
YongShen끼리:
•	직접 극
•	합거
•	핵심 기능 방해
•	필요한 제어 경로 차단
를 만들면 무정 가능.
예:
食神 → 合去 → 正官
처럼 필요한 정관을 묶으면 무정으로 볼 수 있다.
________________________________________
19. 유정·무정은 이름만으로 판정하지 않는다
PT-019
다음처럼 단순화하지 않는다.
食神 + 財 = 항상 유정
印 + 食神 = 항상 무정
현재:
•	실제 위치
•	천간합
•	Root
•	Runtime
•	대상 기능
을 확인한다.
________________________________________
20. PatternMode와 성패는 다르다
PT-020
proper, transformed, combined는 구조 유형이지 길흉 등급이 아니다.
따라서:
proper = good
transformed = bad
combined = good
같은 규칙은 금지한다.
________________________________________
21. 정격도 패할 수 있다
PT-021
정격이라도:
•	YongShen 합거
•	YongShen 공격
•	SangShen 부재
•	Byeong 강화
가 발생하면 불리할 수 있다.
________________________________________
22. 변격도 성할 수 있다
PT-022
변격이라도 투출 YongShen이 적절히 기능하고 구조가 유정하면 성할 수 있다.
________________________________________
23. 겸격도 성하거나 패할 수 있다
PT-023
겸격의 핵심은 YongShen 개수가 아니라:
•	유정·무정
•	각 YongShen Root
•	Runtime
•	상신
•	병
이다.
________________________________________
24. 사주 이름은 YongShen 기준
PT-024 — SOURCE EXPLICIT
전문가 자료는 사주 이름을 정할 때 YongShen을 기준으로 해야 한다고 설명한다.
따라서 이름을 붙일 때 단순히 월지 십신만 보고 결정하지 않는다.
________________________________________
25. 월령 본기가 천간에 없는 경우의 명칭
PT-025 — SOURCE EXPLICIT
전문가 자료는 월령의 기운이 천간에 없을 때 사주 이름을 붙이기 위해 월령 본기가 투출했다고 가정하여 이름을 붙이는 설명을 사용한다.
FILUNE에서는 이를 표현상의 격 이름과 실제 ManifestedYongShen을 분리해 저장한다.
예:
DisplayPatternName = 偏財格
ActualManifestedYongShen = none
가능.
________________________________________
26. 이름과 실제 작동 격을 혼동하지 않는다
PT-026
고객 또는 내부 설명용 PatternName과 실제 엔진 PatternContext는 분리한다.
PatternLabel
≠
CurrentHeavenlyPattern
일 수 있다.
________________________________________
27. 비견 월령 특수 규칙
PT-030 — FILUNE APPROVED OVERRIDE
비견월은 일반격과 같은 방식으로 같은 오행 비견 성분을 천간 YongShen으로 사용하지 않는다.
사용 가능한 다른 월령 지장간 성분을 우선한다.
________________________________________
28. 양간 비견월
PT-031 — SOURCE EXPLICIT
전문가 자료는 양간 비견월의 경우 월령 지장간 안에 비겁 이외 성분이 있어, 그 성분이 천간 또는 운에서 투출하면 YongShen으로 사용할 수 있다고 설명한다.
예:
巳월 丙화:
•	戊
•	庚
등이 천간 또는 운에 투출하면 YongShen 가능.
________________________________________
29. 비견월에서 복수 YongShen
PT-032
예:
巳월 丙화에서:
•	戊 식신
•	庚 재성
이 모두 투출하면 복수 YongShen으로 사용한다.
두 YongShen의 유정·무정을 본다.
전문가 사례에서도 재와 식신을 모두 사용하는 구조를 실제로 이렇게 해석한다.
________________________________________
30. 음간 비견월의 월령무용
PT-033 — SOURCE EXPLICIT
일부 음간 비견월은 월령 지장간에 사실상 비겁 성분만 있어 사용할 천간 YongShen이 없는 구조가 발생한다.
전문가 자료는 이를 월령무용이라고 설명한다.
________________________________________
31. 월령무용의 가용신
PT-034 — SOURCE EXPLICIT + FILUNE OVERRIDE
월령무용이면 가용신을 검토한다.
기본 순서:
정관 > 재성 > 인성 > 식신
은 자료에서 관재인식순으로 확인된다.
FILUNE에서는 필요 시 비견을 그 다음 후보로 둘 수 있다.
________________________________________
32. 가용신은 ManifestedYongShen과 구분한다
PT-035
가용신은 월령 지장간 투출 YongShen과 provenance가 다르다.
ManifestedYongShen
과:
UsableHeavenlyFocus
를 구분한다.
________________________________________
33. 비견격에서 七殺 주용신 금지
PT-036 — FILUNE APPROVED OVERRIDE
FILUNE 비견격에서는 七殺을 주 YongShen으로 쓰지 않는다.
칠살이 존재할 수는 있으나:
•	병
•	제어 대상
•	별도 구조 요소
로 판단한다.
________________________________________
34. 겁재격에서 七殺 사용 가능
PT-037 — FILUNE APPROVED OVERRIDE
겁재격에서는 七殺을 주 YongShen 후보로 사용할 수 있다.
다만 정확한 우선순위는 구조에 따라 판단한다.
식상은 보조 기능으로 사용한다.
________________________________________
35. 양인격에서 七殺 사용 가능
PT-038 — FILUNE APPROVED OVERRIDE
양인격에서는 七殺이 핵심 YongShen 후보가 될 수 있다.
FILUNE 기본 우선:
七殺 > 正官 > 財
식상은 보조.
________________________________________
36. FILUNE 양인 범위
PT-039 — FILUNE APPROVED OVERRIDE / SOURCE CONFLICT
FILUNE v1은 다음 네 경우만 양인격으로 인정한다.
•	甲卯
•	丙午
•	庚酉
•	壬子
戊午는 양인격으로 처리하지 않는다.
격국론 자료에는 戊午 포함 다섯 양간 설명이 있으므로 이 부분은 source conflict로 보존한다.
________________________________________
37. 운에서 월령 YongShen이 새로 투출할 수 있다
PT-040 — SOURCE EXPLICIT / FILUNE MODELING
전문가 자료는 양간 비견월에서 월령 지장간 성분이 천간이나 운에서 투출하면 YongShen이 된다고 명시한다.
따라서 FILUNE은 운 천간도 월령 YongShen 투출로 인정한다.
________________________________________
38. 운에서 YongShen 발현
PT-041
원국:
ManifestedYongShen = none
이라도 운 천간이 월령 YongShen 후보와 일치하면:
ManifestedYongShen for scope
를 생성한다.
________________________________________
39. 운에서 BranchPattern은 바뀌지 않는다
PT-042
운으로 새 YongShen이 들어와도 원국 월령은 그대로다.
따라서:
BranchPatternHistory = retained
한다.
________________________________________
40. 운에서 HeavenlyPattern은 바뀔 수 있다
PT-043
새 YongShen이 투출하면 해당 scope의 HeavenlyPattern을 다시 만든다.
예:
원국:
BranchPattern = Wealth
ManifestedYongShen = SevenKilling
PatternMode = transformed
대운에 Wealth 본기 투출:
ManifestedYongShen:
- SevenKilling
- Wealth

PatternMode = combined
가능.
________________________________________
41. 운에서 정격이 될 수 있다
PT-044
원국에 천간 YongShen이 없다가 운에서 본기가 투출하면 해당 scope에서:
PatternMode = proper
가능.
이는 원국이 정격으로 소급 변경된다는 뜻이 아니다.
________________________________________
42. 운에서 변격이 될 수 있다
PT-045
원국에 천간 YongShen이 없다가 운에서 본기 외 월령 성분이 투출하면 해당 scope에서:
PatternMode = transformed
가능.
________________________________________
43. 운에서 겸격이 될 수 있다
PT-046
원국에 하나의 YongShen이 있고 운에서 다른 월령 YongShen이 추가되면:
PatternMode = combined
가능.
________________________________________
44. 운에서 격 변화의 의미
PT-047
“운에서 격이 바뀐다”는 말은:
월령 격 자체가 교체된다
는 뜻이 아니다.
정확히:
현재 scope의 천간 투출 YongShen 구성과 천간 판정 프레임이 달라진다.
는 뜻이다.
________________________________________
45. 운에서 겸격이 되면 유정·무정을 재평가한다
PT-048
운 YongShen이 추가되면:
existing YongShen
↔
new YongShen
의 관계를 새로 계산한다.
•	생
•	극
•	합
•	stopped
등을 확인한다.
________________________________________
46. 운에서 YongShen이 합거될 수 있다
PT-049
현재 scope에서 ManifestedYongShen이 천간합거로 stopped되면:
YongShenRoleHistory = retained
RuntimeState = stopped
로 처리한다.
________________________________________
47. 겸격 중 한 YongShen이 stopped된 경우
PT-050
겸격 History는 보존한다.
다만:
CurrentEffectiveYongShenSet
을 다시 만든다.
현재 천간 기능은 한 YongShen 중심으로 기울 수 있다.
________________________________________
48. PatternHistory와 CurrentPatternContext 분리
PT-051
반드시:
NatalPatternContext
CurrentPatternContext
를 분리한다.
운으로 원국 PatternHistory를 덮어쓰지 않는다.
________________________________________
49. PatternContext
PT-052
PatternContext
- scope

- monthBranch
- branchPattern

- monthHiddenStemCandidates[]

- manifestedYongShen[]

- heavenlyPatterns[]

- patternMode
  - proper
  - transformed
  - combined
  - month_command_unusable
  - special_peer_pattern

- yongShenRelations[]
________________________________________
50. PatternEffectPolicy는 PatternContext 이후 사용한다
PT-053
격국별 유불리 Policy는 격 이름 하나만으로 조회하지 않는다.
실행:
PatternContext
↓
RelationFact
↓
PatternEffectPolicy
이다.
________________________________________
51. Policy 조회 key
PT-054
최소 다음 정보를 사용한다.
branchPattern
patternMode
activeManifestedYongShenTypes
relationType
________________________________________
52. 동일한 七殺도 서로 다른 Context다
PT-055
구분해야 한다.
A
칠살 월령 + 본기 칠살 투출
B
재격에서 칠살 성분 투출 변격
C
겸격 중 七殺
D
비견격에 일반 七殺 존재
E
양인격에서 YongShen으로 쓰는 七殺
모두 같은 SevenKillingPolicy로 처리하지 않는다.
________________________________________
53. Root는 격 이후 기능성을 평가한다
PT-060
격과 YongShen 출처를 먼저 확정한다.
그 뒤 RootState를 평가한다.
RootState가 약하다고 YongShenRole을 삭제하지 않는다.
________________________________________
54. 12운성도 격을 결정하지 않는다
PT-061
12운성은 천간 기능의 유무력을 보조한다.
금지:
12운성이 帝旺
→ 이 글자가 YongShen
같은 판정.
________________________________________
55. 격 → Policy → Runtime 순서
PT-062
최종 구조:
BranchPattern
↓
ManifestedYongShen
↓
PatternMode
↓
YongShenRelation
↓
RelationFact
↓
PatternEffectPolicy
↓
Root / 12운성 / Runtime
↓
ActualStructuralFunction
________________________________________
56. 지지 격과 천간 격의 성패를 분리한다
PT-063
가능:
BranchPatternOutcome = favorable
HeavenlyPatternOutcome = unfavorable
또는 반대.
________________________________________
57. 천간과 지지가 다른 결론을 낼 수 있다
PT-064 — SOURCE EXPLICIT
전문가 자료에서도 천간에서는 패하지만 지지에서는 패가 아닌 구조가 가능하며, 천간과 지지를 따로 보라고 설명한다.
따라서 전체 결과에서 둘을 강제로 일치시키지 않는다.
________________________________________
58. PatternName은 별도 표현층이다
PT-065
고객에게 보여줄 격 이름과 엔진 내부 PatternContext를 분리한다.
DisplayPatternName
InternalPatternContext
은 서로 다를 수 있다.
________________________________________
59. 살인상생 같은 이름은 YongShen 기준으로 붙인다
PT-066 — SOURCE EXPLICIT
전문가 자료는 편관이 실제 YongShen인 경우에 편관이 인성을 만나 해소되는 것을 살인상생이라고 설명한다.
단순히:
七殺 + 印
이 함께 있다고 살인상생이라고 부르지 않는다.
________________________________________
60. 비견격의 七殺+印을 살인상생으로 부르지 않는다
PT-067 — SOURCE EXPLICIT / FILUNE ALIGNMENT
전문가 자료는 월건록/비견 구조에서 칠살과 인성이 있다고 해서 살인상생으로 부르면 해석 방향이 뒤집힐 수 있다고 경고한다.
따라서 구조 이름은 반드시 실제 YongShen을 기준으로 한다.
________________________________________
61. 겸격에서 비YongShen 七殺도 별도 처리
PT-068
천간에 YongShen 두 개가 투출해 겸격이더라도, 그 밖의 七殺 등 다른 천간이 존재하면 별도의 문제 또는 제어 대상이 될 수 있다.
전문가 사례에서도 편인·식신 두 YongShen 겸격과 별도로 七殺 문제를 해결해야 한다고 해석한다.
________________________________________
62. 모든 투출 천간을 YongShen으로 부르지 않는다
PT-069
천간에 존재한다는 이유만으로 YongShen이 아니다.
YongShen이 되려면:
1.	월령 지장간 provenance가 있거나
2.	비겁계 월령무용에서 FILUNE 가용신 규칙으로 선정
되어야 한다.
________________________________________
63. 운 천간도 같은 provenance 검사를 한다
PT-070
운에서 들어온 천간이 월령 지장간 후보와 일치하는지 확인한다.
일치하지 않으면 일반 LuckActor이지 새 ManifestedYongShen이 아니다.
________________________________________
64. 운 YongShen과 일반 LuckActor 구분
PT-071
예:
LuckStem = X
가:
월령 지장간 후보와 일치
→ ManifestedYongShen 가능.
일치하지 않음
→ 일반 LuckEffect Source.
________________________________________
65. 격국 판정 파이프라인
PT-080
detectMonthCommand()
↓
resolveBranchPattern()
↓
collectMonthHiddenStemCandidates()
↓
excludeInvalidPeerRobCandidatesIfNeeded()
↓
resolveManifestedYongShen()
↓
resolveUsableHeavenlyFocusIfMonthCommandUnusable()
↓
buildHeavenlyPatterns()
↓
classifyPatternMode()
↓
evaluateYongShenRelations()
↓
buildPatternContext()
________________________________________
66. 운의 격 갱신 파이프라인
PT-081
loadParentPatternContext()
↓
applyCurrentLuckStem()
↓
checkMonthHiddenStemManifestation()
↓
updateManifestedYongShenSet()
↓
rebuildHeavenlyPatterns()
↓
reclassifyPatternMode()
↓
recheckYongShenRelations()
↓
buildCurrentPatternContext()
________________________________________
67. 원국과 운 PatternContext를 별도 보존
PT-082
NatalPatternContext
DaewoonPatternContext
SewoonPatternContext
MonthPatternContext
DayPatternContext
각각 별도 Snapshot으로 보존한다.
________________________________________
68. 격국 판정 데이터 구조
PT-083
PatternContext
- id
- scope

- monthBranch
- branchPattern

- monthHiddenStemCandidates[]

- manifestedYongShen[]
- usableHeavenlyFocus[]

- heavenlyPatterns[]

- patternMode

- yongShenRelations[]

- evidence[]
________________________________________
69. ManifestedYongShen 데이터 구조
PT-084
ManifestedYongShen
- entityId
- stem
- tenGod
- sourceHiddenStem
- sourceClass
  - main
  - middle
  - residual
- manifestationScope
- monthCommandRoot
- runtimeState
- roleHistory
________________________________________
70. PatternMode 판정 우선순위
PT-085
기본:
사용 가능한 월령 YongShen 없음
→ month_command_unusable
본기 하나만 투출
→ proper
본기 아닌 하나만 투출
→ transformed
사용 가능한 YongShen 둘 이상 투출
→ combined
비견·겁재·양인 특수 규칙
→ special_peer_pattern
단 특수 비겁계는 일반 규칙보다 우선한다.
________________________________________
71. 겸격의 유정·무정 저장
PT-086
YongShenHarmonyState
- favorable_harmony
- unfavorable_conflict
- mixed
- deferred
________________________________________
72. PatternMode 변경 History
PT-087
운에서:
transformed → combined
처럼 바뀌어도 원국 History를 바꾸지 않는다.
각 scope의 CurrentPatternMode만 기록한다.
________________________________________
73. 엔진 구현 금지 규칙
PT-090
Codex는 다음을 만들지 않는다.
•	격을 하나의 전역 PatternType으로만 저장
•	BranchPattern과 HeavenlyPattern 동일시
•	월령 본기만 YongShen 후보로 인정
•	월령 지장간 투출 YongShen 중 하나만 선택하고 나머지 삭제
•	본기 투출 = 항상 정격 단독
•	겸격에서 유정·무정 생략
•	변격이 되면 BranchPattern 변경
•	운에서 BranchPattern 자체 변경
•	운에서 새 YongShen 발현 후 PatternMode 재계산 생략
•	PatternMode = 길흉 등급
•	정격 = 자동 성
•	변격 = 자동 패
•	겸격 = 자동 성
•	RootState로 YongShen 자격 삭제
•	12운성으로 격 결정
•	모든 천간을 YongShen으로 간주
•	비겁월의 같은 오행 성분을 일반 주 YongShen으로 사용
•	월령무용과 일반 투출 YongShen을 같은 provenance로 저장
•	七殺+印 존재만으로 살인상생 명명
•	사주 이름만 보고 PatternEffectPolicy 적용
•	운에서 천간 격 변화가 원국 History를 덮어쓰기
________________________________________
74. 회귀 테스트 필수 사례
PT-100
최소 다음을 고정한다.
1.	본기만 투출한 정격
2.	본기 아닌 하나만 투출한 변격
3.	본기 + 다른 성분의 겸격
4.	본기 없이 두 성분의 겸격
5.	식신생재로 유정한 겸격
6.	투출 YongShen끼리 합거해 무정한 겸격
7.	비견월 양간에서 월령 다른 성분 투출
8.	음간 비견월 월령무용
9.	운에서 처음 YongShen 발현
10.	운에서 정격 전환
11.	운에서 변격 전환
12.	운에서 겸격 전환
13.	겸격 YongShen 하나가 운에서 stopped
14.	BranchPattern 유지 + HeavenlyPattern 변화
15.	SevenKilling 존재하지만 실제 YongShen이 아니어서 살인상생 명칭을 쓰지 않는 사례
________________________________________
75. 최종 격국 판정 원칙
FILUNE은 격을 하나의 이름으로 끝내지 않는다.
반드시 다음을 순서대로 판단한다.
월령이 무엇인가
→ 지지에서 어떤 격을 이루는가
→ 월령 지장간에는 어떤 YongShen 후보가 있는가
→ 그중 무엇이 천간에 실제로 투출했는가
→ 본기인가 중기·여기인가
→ 하나인가 여러 개인가
→ 본기와 천간 중심이 같아 정격인가
→ 다른 성분이 중심이 되어 변격인가
→ 여러 YongShen이 함께 투출해 겸격인가
→ 겸격의 YongShen끼리 유정한가 무정한가
→ 비견·겁재·양인 특수 규칙이 적용되는가
→ 월령무용인가
→ 현재 운에서 새로운 월령 YongShen이 발현했는가
→ 그 결과 천간 PatternMode가 어떻게 달라졌는가
→ 현재 PatternContext에서 각각의 RelationFact가 어떤 의미를 가지는가
를 판단한다.
따라서 FILUNE v1의 핵심 원칙은:
BranchPattern은 월령의 원국 기준 격으로 유지하고,
천간의 격은 월령 지장간의 실제 투출 상태를 따라 정격·변격·겸격으로 구성한다.
운에서 새로운 YongShen이 투출하면 BranchPattern을 바꾸지 않고 CurrentHeavenlyPattern과 PatternMode를 다시 계산한다.
이다.

