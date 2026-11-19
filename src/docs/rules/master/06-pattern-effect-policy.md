FILUNE v1 PatternEffectPolicy 격별 구조판정 마스터 v0.2
0. 문서 목적
이 문서는 FILUNE v1에서:
RelationFact
+
PatternContext
를 입력받아 해당 관계가 현재 격 구조에서 기본적으로:
•	favorable
•	favorable_candidate
•	unfavorable
•	unfavorable_candidate
•	context_dependent
•	mixed
•	neutral
•	deferred
중 어느 방향인지 판정하기 위한 PatternEffectPolicy 기준이다.
이 문서는 최종 성패표가 아니다.
최종 결과는 반드시 이후의:
•	RootState
•	12운성
•	RuntimeState
•	천간합거
•	Formation
•	DayMasterCapacity
•	SangShen
•	Byeong
•	GuEung
•	다른 동시 작용 경로
를 적용한 뒤 확정한다.
________________________________________
1. Policy 실행 원칙
PP-001
Policy 조회 순서:
BranchPattern
↓
PatternMode
↓
ManifestedYongShen 구성
↓
RelationFact
↓
PatternEffectPolicy
↓
Root / 12운성 / Runtime
↓
ActualStructuralFunction
________________________________________
2. 격 하나만으로 Policy를 조회하지 않는다
PP-002
금지:
pattern = 七殺
→ SevenKillingPolicy 하나 적용
반드시:
branchPattern
patternMode
activeManifestedYongShen[]
relationType
을 함께 본다.
________________________________________
3. Policy는 최종 결과가 아니다
PP-003
예:
食神制殺
defaultDirection = favorable
이어도:
•	食神 stopped
•	食神 약화
•	七殺 이미 지나치게 약함
•	印이 食神을 손상
•	財生殺 경로가 더 강하게 활성
되면 실제 결과는 달라질 수 있다.
________________________________________
4. RelationFact와 NamedFormula를 구분한다
PP-004
예:
傷官 → 剋 → 七殺
은 RelationFact다.
반면:
傷官合殺
食神制殺
殺印相生
은 특정 조건이 충족될 때 붙이는 구조 공식이다.
관계가 존재한다고 자동으로 NamedFormula를 부여하지 않는다.
________________________________________
5. 하나의 글자는 여러 RelationFact를 가질 수 있다
PP-005
예:
食神 → 生 → 財
食神 → 剋 → 七殺
은 동시에 존재할 수 있다.
각 path를 별도로 평가한다.
________________________________________
6. 십신 자체 길흉보다 실제 구조 기능을 우선한다
PP-006
•	길신도 Byeong이 될 수 있다.
•	흉신도 SangShen 기능을 가질 수 있다.
•	YongShen도 Byeong을 겸할 수 있다.
•	같은 십신도 격에 따라 반대 기능을 할 수 있다.
________________________________________
7. 천간의 剋과 合은 반드시 분리한다
PP-007
특히 칠살 처리에서:
FoodGod → control → SevenKilling
HurtingOfficer → control → SevenKilling
HurtingOfficer → combine → SevenKilling
을 서로 다른 RelationFact로 저장한다.
________________________________________
8. 천간합은 RuntimeState까지 변경한다
PP-008
유효한 천간합이면:
source RuntimeState = stopped
target RuntimeState = stopped
가능.
따라서 傷官合殺은 단순 favorable relation이 아니라 실제 기능 정지까지 반영해야 한다.
________________________________________
9. 정관격 기본 Policy
PP-100
정관격의 핵심:
정관을 생하거나 보호하고, 정관을 직접 손상시키는 경로와 관살혼잡을 관리한다.
________________________________________
10. 財生官
PP-101 — SOURCE EXPLICIT
財 → 生 → 正官
기본:
favorable
________________________________________
11. 印護官
PP-102 — SOURCE EXPLICIT
印 → 制 食傷
→ protect 正官
기본:
favorable
특히 상관이 정관을 공격할 때 인성은 SangShen 기능을 가질 수 있다.
________________________________________
12. 傷官見官
PP-103 — SOURCE EXPLICIT
傷官 → 剋 → 正官
기본:
unfavorable
단 인성이 상관을 실제 제어하거나 상관 자체가 stopped이면 재평가한다.
________________________________________
13. 財剋保官之印
PP-104 — CONDITIONAL
財 → 剋 → 印
그 印이:
傷官 → 剋 正官
을 막는 필수 SangShen이면:
unfavorable
이다.
단 財剋印이라는 관계만으로 자동 불리 판정하지 않는다.
________________________________________
14. 정관격 官殺混雜
PP-105 — SOURCE EXPLICIT
正官 + 七殺
기본:
unfavorable_candidate
정관격에서는 구조상 필요하면:
去殺留官
을 우선 검토한다.
________________________________________
15. 食神制殺 in 正官格
PP-106
정관격에 혼잡된 七殺을 食神이 실제 제어한다면:
食神 → 剋 → 七殺
기본:
favorable_when_removing_mixed_killing
정관을 보존하는 방향이어야 한다.
________________________________________
16. 傷官合殺 in 正官格
PP-107 — SOURCE EXPLICIT
정관격에 七殺이 혼잡되어 있고 傷官이 七殺과 유효 천간합을 이루면:
傷官 → 合 → 七殺
을 傷官合殺로 인정할 수 있다.
결과:
SevenKilling RuntimeState = stopped
HurtingOfficer RuntimeState = stopped
그 결과:
正官 remains active
이면:
favorable
가능.
격국론에서도 정관격의 칠살 혼잡에서 상관합살을 사용해 구조를 맑게 하는 경우를 명시한다.
________________________________________
17. 傷官合殺의 부작용 재평가
PP-108
傷官이 七殺을 합거하는 것은 유리할 수 있지만, 傷官 자신도 stopped된다.
따라서 傷官이 다른 중요한 구조 기능을 담당하고 있었다면 그 손실도 함께 본다.
________________________________________
18. 정관 합거
PP-109
현재 핵심 正官이 유효 천간합으로 stopped되면:
unfavorable
후보.
________________________________________
19. 정관격 요약
財生官                 favorable
印護官                 favorable
傷官剋官               unfavorable
財剋必要印             unfavorable
官殺混雜               unfavorable_candidate
食神制混殺             favorable_candidate
傷官合殺               favorable_when_removing_mixed_killing
合去正官               unfavorable
________________________________________
20. 칠살격 기본 Policy
PP-200
칠살격의 핵심:
칠살을 적절히 제어·인화하거나 일간이 감당 가능한 상태로 만든다.
________________________________________
21. 食神制殺
PP-201 — SOURCE EXPLICIT
食神 → 剋 → 七殺
기본:
favorable
칠살격의 대표적인 제살 공식.
________________________________________
22. 제살태과
PP-202
食神이 지나치게 강하고 七殺이 지나치게 약하면:
excessive_control
가능.
이 경우 七殺을 보완하는 운이 오히려 균형에 도움될 수 있다.
________________________________________
23. 七殺 과다
PP-203
七殺이 강하고 食神이 약하면:
FoodGodControlEffect = insufficient
식신 또는 DayMasterCapacity 보강 필요.
________________________________________
24. 殺印相生
PP-204 — SOURCE EXPLICIT
七殺 → 生 印 → 生 身
기본:
favorable_when_needed
특히:
•	七殺 강
•	DayMaster 약
•	食神制殺이 주 경로가 아님
일 때 유리 가능.
________________________________________
25. 印奪食
PP-205 — CONDITIONAL
印 → 剋 → 食神
食神이 핵심 SangShen이면:
unfavorable
그러나 食神이 지나치게 강하고 七殺이 약하면 인성의 조절이 유리할 수도 있다.
________________________________________
26. 財生殺
PP-206 — CONDITIONAL
財 → 生 → 七殺
기본:
context_dependent
칠살이 이미 해로운 상태면 불리.
칠살이 부족하고 구조적으로 필요한 경우는 유리 가능.
________________________________________
27. 官殺混雜 in 七殺格
PP-207 — SOURCE EXPLICIT
칠살격에 正官이 혼입하면:
unfavorable_candidate
칠살이 월령 중심일 경우:
去官留殺
가능.
________________________________________
28. 傷官剋殺
PP-208
傷官 → 剋 → 七殺
실제 극 관계가 존재하고 七殺이 해로운 경우:
favorable_candidate
그러나 FILUNE에서는 이를 무조건 대표 NamedFormula 傷官制殺로 부르지 않는다.
RelationFact와 ActualStructuralFunction으로 먼저 처리한다.
________________________________________
29. 傷官合殺 in 七殺 structure
PP-209
傷官 → 合 → 七殺
유효 천간합이면 칠살을 stopped시킬 수 있다.
칠살이 반드시 유지되어야 하는 구조라면 불리할 수 있다.
칠살이 병이라면 유리할 수 있다.
즉:
context_dependent
________________________________________
30. 칠살격 요약
食神制殺             favorable
過度制殺             conditional
殺印相生             favorable_when_needed
印奪食               context_dependent
財生殺               context_dependent
官殺混雜             unfavorable_candidate
去官留殺             favorable_when_required
傷官剋殺             favorable_candidate_when_killing_harmful
傷官合殺             context_dependent
________________________________________
31. 재격 기본 Policy
PP-300
재격의 핵심:
재성을 살리고 현실적 성취를 확대하며, 재성의 분탈과 해로운 재생살 경로를 관리하고, 일간이 재성을 감당하도록 한다.
그리고 FILUNE에서는 중요한 추가 원칙으로:
재격에서 印이 들어오는 것 자체를 문제로 보지 않는다.
를 명시한다.
________________________________________
32. 食神生財
PP-301 — SOURCE EXPLICIT
食神 → 生 → 財
기본:
favorable
대표적인 부를 키우는 유정 구조.
________________________________________
33. 財生官
PP-302 — SOURCE EXPLICIT
財 → 生 → 正官
기본:
favorable
재성이 정관으로 이어지면 재물과 사회적 지위를 함께 도모할 수 있다.
________________________________________
34. 財와 印의 공존
PP-303 — SOURCE EXPLICIT / EXPERT METHOD
재격에서 印이 함께 있다고 자동으로 파격으로 보지 않는다.
전문가 원고는 편재격에서 인성이 들어오는 경우를:
“돈도 버는데 학식도 높다”
는 식으로 긍정적으로 설명한다.
또 실제 운 사례에서도 재격에 인성이 들어오는 것을 문제로 보지 않고, 재격패인을 “돈을 버는데 학식도 높다”는 방향으로 해석한다.
따라서 기본:
Wealth + Resource coexist
→ favorable_candidate
가능.
현실 해석:
•	현실적 성취 + 학식
•	재물 + 문서·자격
•	실무력 + 지식
•	경제적 능력 + 학문적 기반
을 함께 가질 수 있다.
________________________________________
35. 재격에서 財剋印은 자동 불리가 아니다
PP-304 — FILUNE CORE CORRECTION
財 → 剋 → 印
을 단순히:
unfavorable
로 처리하지 않는다.
재격에서는 기본적으로:
neutral_to_favorable_candidate
로 둘 수 있다.
________________________________________
36. 재격 財剋印이 실제 불리해지는 조건
PP-305
다음 조건이 모두 또는 핵심적으로 충족될 때 불리하다.
1.	印이 현재 필수 SangShen이다.
2.	印이 DayMasterCapacity를 유지하는 핵심 경로다.
3.	印이 다른 병을 막는 보호자다.
4.	財가 실제로 해당 印의 기능을 유효하게 손상시킨다.
이 경우:
unfavorable
가능.
________________________________________
37. 재격 財剋印이 유리할 수 있는 조건
PP-306
印이 과다하여:
•	흐름을 막음
•	식상 기능을 억제
•	구조를 지나치게 무겁게 만듦
이라면 財가 印을 제어하는 것이 오히려 유리할 수 있다.
________________________________________
38. 比劫剋財
PP-307
比劫 → 剋 → 財
기본:
unfavorable_candidate
단:
•	食傷 통관
•	官으로 比劫 제어
•	財가 병 기능
•	비겁 Root와 Capacity 문제
등에 따라 반전 가능.
________________________________________
39. 財生殺
PP-308
財 → 生 → 七殺
기본:
unfavorable_candidate
특히 七殺이 해롭고 일간 Capacity가 부족하면 불리.
________________________________________
40. 재격 + 칠살
PP-309 — SOURCE EXPLICIT
재격에서 七殺이 살아나면:
財 → 生 → 七殺
로 일간을 위협해 파격 원인이 될 수 있다.
그러나 七殺을 제거·제어하면 재격을 보존할 수 있다.
________________________________________
41. 食神制殺 in 財格
PP-310
食神 → 剋 → 七殺
七殺이 재격의 병이면:
favorable
가능.
칠살을 제어하면서 財 자체를 보존하는 방향이어야 한다.
________________________________________
42. 傷官合殺 in 財格
PP-311 — SOURCE EXPLICIT
재격에 七殺이 있고 傷官이 七殺과 유효 천간합을 이루면:
傷官 → 合 → 七殺
칠살을 stopped시켜 재격을 남길 수 있다.
이 경우:
favorable_when_removing_wealth_generated_killing
가능.
격국론도 재격에 칠살이 있을 때 상관이 합살하거나 식신이 제살하는 경우를 구분하여 설명한다.
________________________________________
43. 傷官合殺과 食神制殺은 다른 Policy다
PP-312
傷官合殺
은 combine.
食神制殺
은 control.
두 관계를 동일 처리하지 않는다.
________________________________________
44. 傷官剋殺 in 財格
PP-313
상관이 오행 관계상 七殺을 직접 극하는 경우:
傷官 → 剋 → 七殺
도 RelationFact는 인정한다.
칠살이 병이면 유리 가능.
그러나 대표 공식은 실제 관계에 따라:
•	합이면 傷官合殺
•	극이면 傷官剋殺
로 분리한다.
________________________________________
45. 재격 + 食傷 + 正官
PP-314
食傷이 재성을 생하는 구조에 正官이 들어오면 食傷이 正官을 공격할 수 있다.
따라서:
unfavorable_candidate
________________________________________
46. 재격 Capacity
PP-315
재성이 왕할수록 일간의:
wealth_capacity
를 확인한다.
재성 자체가 좋더라도 일간이 감당하지 못하면 불리할 수 있다.
________________________________________
47. 재격 요약
食神生財               favorable
財生官                 favorable
財 + 印 coexist        favorable_candidate
財剋印                 not_inherently_bad
財剋必要印             unfavorable
財制過重印             favorable_candidate
比劫剋財               unfavorable_candidate
財生害殺               unfavorable_candidate
食神制害殺             favorable
傷官合殺               favorable_when_removing_killing
傷官剋害殺             favorable_candidate
DM wealth capacity不足  unfavorable
________________________________________
48. 인성격 기본 Policy
PP-400
인성격 핵심:
인성이 일간을 돕는 기능을 살리되, 인성과 일간이 지나치게 뭉쳐 흐름이 막히는 경우 설기·제어 경로를 확보한다.
________________________________________
49. 印生身
PP-401
印 → 生 → DayMaster
기본:
favorable_candidate
그러나 인성·일간 모두 과다하면 추가 인성은 불리할 수 있다.
________________________________________
50. 官助印
PP-402
正官 → 生 → 印
기본:
favorable
단 정관이 반드시 FILUNE 천간 YongShen이라는 뜻은 아니다.
________________________________________
51. 殺印相生
PP-403
七殺 → 生 印 → 生 身
기본:
favorable_when_needed
________________________________________
52. 財剋印 in 印格
PP-404
인성격에서는 재격과 다르게, 印 자체가 격의 핵심이다.
따라서:
財 → 剋 → 印
은 기본:
unfavorable_candidate
다만 印이 과다하여 구조를 막고 있을 때는 예외적으로 유리할 수 있다.
________________________________________
53. 食傷泄秀
PP-405
인성·일간이 과한 경우 食傷은 흐름을 빼주는 유리한 경로가 될 수 있다.
________________________________________
54. 印奪食
PP-406
식상이 필요한 설기·제살 SangShen이면:
unfavorable
________________________________________
55. 인수용살에서 財
PP-407
財 → 剋 印
+
財 → 生 七殺
이 동시에 작동하면:
unfavorable_candidate
________________________________________
56. 인성격 요약
印生身              favorable_candidate
官生印              favorable
殺印相生            favorable_when_needed
財剋印              unfavorable_candidate
財制過旺印          favorable_candidate
食傷泄秀            favorable_when_excess
印奪必要食          unfavorable
________________________________________
57. 식신격 기본 Policy
PP-500
식신격 핵심:
식신의 설기·생재·제살 기능을 살리고, 편인 등 식신을 직접 손상시키는 경로를 관리한다.
________________________________________
58. 食神生財
PP-501
食神 → 生 → 財
기본:
favorable
________________________________________
59. 食神制殺
PP-502
食神 → 剋 → 七殺
기본:
favorable
대표 NamedFormula로 사용 가능.
________________________________________
60. 食神制殺 + 財
PP-503
칠살 제어 중 財가:
財 → 生 → 七殺
하면 제살을 방해할 수 있다.
따라서:
unfavorable_candidate
하지만 실제 위치·관계상 財가 七殺을 생하지 못하면:
•	食神制殺
•	食神生財
동시 성립 가능.
________________________________________
61. 偏印奪食
PP-504
偏印 → 剋 → 食神
기본:
unfavorable_candidate
________________________________________
62. 財剋害食之印
PP-505
편인이 食神을 해치고 있을 때:
財 → 剋 → 印
은 食神을 보호하므로:
favorable
가능.
이것이 財剋印 = 자동 흉이 될 수 없는 대표 사례다.
________________________________________
63. 食神 과다
PP-506
食神이 지나치게 강하면 印이 이를 조절하는 것이 유리할 수 있다.
________________________________________
64. 식신격 Capacity
PP-507
DayMaster가 食神의 설기를 감당할 Capacity가 필요하다.
________________________________________
65. 식신격 요약
食神生財             favorable
食神制殺             favorable
財生殺               unfavorable_when_breaking_control
偏印奪食             unfavorable_candidate
財剋害食之印         favorable
印制過旺食神         favorable_when_excess
DM output capacity不足 unfavorable
________________________________________
66. 상관격 기본 Policy
PP-600
상관격은 변화가 많으므로 단일 공식으로 고정하지 않는다.
핵심:
•	상관의 설기
•	재성으로의 흐름
•	인성의 제어
•	정관과의 충돌
•	칠살 처리 방식
•	Capacity
를 함께 본다.
________________________________________
67. 傷官生財
PP-601
傷官 → 生 → 財
기본:
favorable
________________________________________
68. 傷官佩印
PP-602
印 → 制 → 傷官
상관 과다 + 일간 약 등 印이 필요한 경우:
favorable
________________________________________
69. 傷官見官
PP-603
傷官 → 剋 → 正官
기본:
unfavorable_candidate
________________________________________
70. 傷官剋殺
PP-604
傷官 → 剋 → 七殺
七殺이 해로운 경우:
favorable_candidate
가능.
다만 이 관계를 자동으로 傷官合殺이라고 부르지 않는다.
________________________________________
71. 傷官合殺
PP-605 — IMPORTANT
傷官과 七殺 사이에 실제 유효 천간합이 있을 때만:
傷官 → 合 → 七殺
을 傷官合殺로 분류한다.
결과:
HurtingOfficer Runtime = stopped
SevenKilling Runtime = stopped
가능.
________________________________________
72. 傷官合殺의 길흉
PP-606
七殺이 현재:
•	官殺混雜의 원인
•	재격의 재생살 병
•	일간을 위협하는 Active Byeong
이라면:
favorable
가능.
반대로 七殺이:
•	양인 제어의 핵심 YongShen
•	필요한 구조적 제어자
라면:
unfavorable
가능.
따라서:
context_dependent
이다.
________________________________________
73. 상관격 + 印 + 七殺
PP-607
해당 구조에서는:
•	印 강화 → 유리 가능
•	食傷이 七殺 제어 → 유리 가능
•	正官 추가 → 官殺混雜 가능
•	財가 印을 파괴하고 七殺을 생 → 위험 가능
________________________________________
74. 상관격 Capacity
PP-608
상관생재 등 설기가 큰 구조에서는 DayMasterCapacity를 확인한다.
________________________________________
75. 상관격 요약
傷官生財             favorable
傷官佩印             favorable_when_needed
傷官見官             unfavorable_candidate
傷官剋害殺           favorable_candidate
傷官合害殺           favorable
傷官合必要殺         unfavorable
財破必要印           unfavorable
DM output capacity不足 unfavorable
________________________________________
76. 食神制殺 / 傷官剋殺 / 傷官合殺 구분
PP-650 — CORE RULE
세 가지를 명확히 분리한다.
A. 食神制殺
FoodGod
→ control
→ SevenKilling
•	action = control
•	대표 고전 제살 공식
•	source/target 모두 원칙적으로 active 유지
•	target 기능은 약화
B. 傷官剋殺
HurtingOfficer
→ control
→ SevenKilling
•	action = control
•	실제 극 관계
•	SevenKilling 약화 가능
•	NamedFormula 사용은 제한적
C. 傷官合殺
HurtingOfficer
→ combine
→ SevenKilling
•	action = combine
•	실제 천간합 필요
•	유효합이면 양쪽 stopped 가능
•	단순 극 관계와 완전히 다름
________________________________________
77. 상관합살 엔진 규칙
PP-651
if relation.action == combine
and source.tenGod == HurtingOfficer
and target.tenGod == SevenKilling
and validStemCombination == true:

    formula = HurtingOfficerCombinesKilling

    source.runtime = stopped
    target.runtime = stopped
그 뒤 전체 PatternContext를 다시 계산한다.
________________________________________
78. 상관합살 후 재평가
PP-652
반드시 다시 본다.
•	官殺混雜 해소 여부
•	財生殺 경로 종료 여부
•	양인 제어자 상실 여부
•	傷官 본래 기능 상실 여부
•	겸격 YongShen 구성 변화
•	PatternMode 변화 여부
________________________________________
79. 비견격 기본 Policy
PP-700 — FILUNE APPROVED OVERRIDE
핵심:
main:
  正官
  財

auxiliary:
  食傷
七殺은 주 YongShen으로 사용하지 않는다.
________________________________________
80. 正官制比肩
PP-701
기본:
favorable
________________________________________
81. 財 활용
PP-702
재성은 주요 활용 후보다.
비견의 직접 분탈 위험을 함께 확인한다.
________________________________________
82. 食傷 통관
PP-703
比肩 → 生 食傷 → 生 財
favorable_auxiliary
________________________________________
83. 七殺 in 비견격
PP-704
주 YongShen 금지.
해로운 七殺이면 食神制殺 등 제어를 검토한다.
________________________________________
84. 財生殺 in 비견격
PP-705
Active harmful 七殺을 실제 강화하는 경우:
unfavorable
그 외 자동 불리 금지.
________________________________________
85. 비견격 요약
正官制比肩         favorable
財                 main_candidate
食傷通關生財       favorable_auxiliary
七殺 as main       prohibited
食神制害殺         favorable_when_needed
財生害殺           unfavorable_when_active_path
________________________________________
86. 겁재격 기본 Policy
PP-800
겁재격은 비견격과 분리한다.
________________________________________
87. 正官制劫
PP-801
기본:
favorable
________________________________________
88. 七殺制劫
PP-802
기본:
favorable_candidate
단 Capacity 확인.
________________________________________
89. 食傷 통관
PP-803
보조 유리 기능.
________________________________________
90. 劫財剋財
PP-804
기본:
unfavorable_candidate
________________________________________
91. 겁재격 요약
正官制劫財        favorable
七殺制劫財        favorable_candidate
食傷通關          auxiliary_favorable
劫財剋財          unfavorable_candidate
________________________________________
92. 양인격 기본 Policy
PP-900
FILUNE 양인격:
•	甲卯
•	丙午
•	庚酉
•	壬子
핵심:
관살로 양인을 제어한다.
________________________________________
93. 七殺制刃
PP-901
기본:
favorable_priority
________________________________________
94. 正官制刃
PP-902
기본:
favorable
________________________________________
95. 財助官殺
PP-903
관살을 돕는 재성은 유리 가능.
단 財 자체가 양인에게 분탈되는지도 본다.
________________________________________
96. 食神制殺 in 羊刃格
PP-904
칠살이 양인을 제어하는 필요한 YongShen이면:
食神 → 剋 → 七殺
기본:
unfavorable_candidate
칠살 과도 시 예외.
________________________________________
97. 傷官合殺 in 羊刃格
PP-905 — IMPORTANT
칠살이 양인을 제어하는 핵심 YongShen인데 傷官이 이를 합거하면:
傷官 → 合 → 七殺
七殺이 stopped되어 양인이 살아날 수 있다.
따라서 기본:
unfavorable_candidate
전문가 양인 사례에서도 양인격에서는 정관·칠살을 살려 두어야 한다는 방향이 확인된다.
________________________________________
98. 印生刃
PP-906
양인·일간을 지나치게 강화한다면:
unfavorable_candidate
________________________________________
99. 양인격 요약
七殺制刃           favorable_priority
正官制刃           favorable
財助官殺           favorable_candidate
食神制必要殺       unfavorable_candidate
傷官合必要殺       unfavorable_candidate
食神制過旺殺       potentially_favorable
印增刃勢           unfavorable_candidate
________________________________________
100. 겸격 Policy
PP-1000
겸격에서는 하나의 격 Policy만 적용하지 않는다.
먼저 모든 ManifestedYongShen 사이의 관계를 본다.
________________________________________
101. 겸격 유정
PP-1001
•	생
•	보호
•	통관
•	역할 연결
이면:
favorable_harmony
________________________________________
102. 겸격 무정
PP-1002
•	극
•	합거
•	SangShen 파괴
•	필요한 경로 차단
이면:
unfavorable_conflict
________________________________________
103. 겸격에서 천간합 발생
PP-1003
두 ManifestedYongShen이 천간합거되면:
•	두 RoleHistory는 유지
•	두 RuntimeState는 stopped 가능
•	CurrentEffectiveYongShenSet 재계산
•	CurrentPatternMode 재평가
한다.
________________________________________
104. 운에서 Policy 재조회
PP-1100
운에서 새 YongShen이 발현하거나 기존 YongShen이 stopped되면:
CurrentPatternContext
를 새로 만든 뒤 Policy도 다시 조회한다.
________________________________________
105. transformed → combined
PP-1101
운에서 YongShen 추가로 겸격이 되면 기존 단일 Policy 결과를 그대로 승계하지 않는다.
________________________________________
106. Policy와 ConditionalByeong
PP-1110
현재 유리한 관계가 미래 운에서 문제 경로가 될 수 있다.
예:
食神 → 生 財
현재 유리.
미래 七殺:
財 → 生 七殺
이면 ConditionalByeong 가능.
________________________________________
107. Policy와 Protective SangShen
PP-1111
미래 위협을 막을 수 있는 원국 기능은:
protective_standby
SangShen 가능.
________________________________________
108. PolicyDirection
PP-1200
PolicyDirection
- favorable
- favorable_candidate
- unfavorable
- unfavorable_candidate
- context_dependent
- mixed
- neutral
- deferred
________________________________________
109. 숫자 점수 금지
PP-1201
금지:
favorable = +30
unfavorable = -20
________________________________________
110. provenance
PP-1202
각 Policy:
•	SOURCE_EXPLICIT
•	SOURCE_INFERENCE
•	FILUNE_APPROVED_OVERRIDE
•	CONFLICT
•	DEFERRED
중 하나를 가진다.
________________________________________
111. 최종 ActualStructuralFunction
PP-1300
RelationFact
↓
CurrentPatternContext
↓
PatternEffectPolicy
↓
RootState
↓
12LifeStageSupport
↓
RuntimeState
↓
FormationEffect
↓
OtherConcurrentPaths
↓
ActualStructuralFunction
________________________________________
112. 구현 데이터 구조
PatternEffectPolicy
- id
- branchPattern
- patternMode
- activeYongShenTypes[]
- relationType

- defaultDirection

- requiredConditions[]
- reversalConditions[]
- exceptions[]

- evidenceStatus
- evidenceRefs[]
________________________________________
113. RelationType 확장
RelationType
- generates
- controls
- combines
- protects
- drains
- formation_strengthens
controls와 combines를 절대 합치지 않는다.
________________________________________
114. NamedFormula
NamedFormula
- FoodGodControlsKilling
- HurtingOfficerCombinesKilling
- KillingGeneratesResource
- WealthGeneratesOfficer
- FoodGodGeneratesWealth
- HurtingOfficerGeneratesWealth
- ResourceControlsHurtingOfficer
조건이 충족된 경우에만 부여한다.
________________________________________
115. 격별 핵심표
격	대표 유리 경로	대표 불리 경로
정관	財生官, 印護官, 필요시 傷官合殺	傷官見官, 官殺混雜
칠살	食神制殺, 殺印相生	해로운 財生殺, 官殺混雜
재	食神生財, 財生官, 財+印, 食神制殺, 傷官合殺	比劫剋財, 해로운 財生殺
인	官/殺生印, 필요시 食傷泄秀	財剋必要印, 印奪必要食
식신	食神生財, 食神制殺	偏印奪食, 財生殺로 제살 방해
상관	傷官生財, 傷官佩印, 필요시 傷官剋殺/合殺	傷官見官, 財破必要印
비견	正官制比, 財 활용, 食傷 통관	七殺 주용신 금지, 財生害殺
겁재	官殺制劫, 食傷 통관	劫財剋財
양인	七殺制刃, 正官制刃	食神制必要殺, 傷官合必要殺
________________________________________
116. FILUNE 최종 핵심 원칙
FILUNE은:
財剋印 = 나쁨
食神制殺 = 무조건 좋음
傷官合殺 = 무조건 좋음
처럼 관계 이름만으로 결과를 고정하지 않는다.
특히:
재격의 財와 印
재격에서는 印이 존재하거나 財와 印이 함께 있는 것을 기본적으로 문제로 보지 않는다.
오히려 구조가 잘 성립하면:
재물·현실적 성취와 학식·문서·지식 기능을 함께 갖추는 구조
로 해석할 수 있다.
財剋印이 불리한 것은 그 印이 현재 반드시 필요한 기능을 하고 있는데 실제로 손상될 때다.
食神制殺
FoodGod → control → SevenKilling
대표적인 제살 경로다.
傷官剋殺
HurtingOfficer → control → SevenKilling
실제 극 관계로 칠살을 약화시키는 효과다.
傷官合殺
HurtingOfficer → combine → SevenKilling
실제 천간합 조건이 있어야 하며, 유효합이면 두 천간의 기능이 함께 stopped될 수 있다.
따라서 상관합살의 길흉은:
칠살을 제거하는 것이 현재 구조에 필요한가
를 기준으로 판단한다.
정관격의 官殺混雜이나 재격의 해로운 財生殺을 해소하면 유리할 수 있지만, 양인격의 필요한 七殺을 제거하면 불리할 수 있다.
최종 엔진은 항상:
RelationFact
→ PatternContext
→ PatternEffectPolicy
→ Runtime
→ ActualStructuralFunction
순으로 판단한다.

