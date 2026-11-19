FILUNE v1 통근·12운성 마스터 규칙 v0.2
0. 문서의 지위
이 문서는 FILUNE v1에서 다음을 판정하기 위한 실행 기준이다.
•	천간의 통근
•	일간의 통근
•	월령 Root
•	12운성
•	운에서 발생하는 Root 변화
•	반합·삼합·방합에 의한 Root 강화
•	충에 의한 Root 약화
•	Root 변화가 천간 기능과 격국 성패에 미치는 영향
•	일간의 감당력과 기세의 편중
Codex는 통근을 임의 숫자 점수로 환산하지 않는다.
기본 판정 흐름은 다음과 같다.
Root 존재
→ Root의 출처와 중요도
→ 현재 RootState
→ 12운성상 유무력
→ 천간 실제 기능
→ 일간 감당력 / 십신 작동력
→ 격국 구조 변화
________________________________________
1. 통근은 천간의 실제 작동력을 판단하는 핵심 보조축이다
R-001
천간에 어떤 글자가 존재한다는 사실과 그 글자가 실제로 강하게 작동하는 것은 동일하지 않다.
천간의 실제 기능을 판단할 때 다음을 함께 본다.
•	월령 Root 여부
•	본기 Root 여부
•	Root 개수
•	12운성
•	충
•	반합·삼합·방합
•	운에서 추가된 Root
따라서:
Stem exists
≠
Stem fully functional
이다.
________________________________________
2. RootFact와 RootState를 분리한다
R-002
RootFact
천간이 특정 지지 또는 지장간에 뿌리를 가지고 있다는 사실.
RootState
현재 scope에서 그 뿌리가 실제로 어느 정도 유효한가.
예:
RootFact = true
RootState = weakened
가 가능하다.
________________________________________
3. 원국 Root와 운 Root를 구분한다
R-003
NatalRootFact
출생 원국에서 존재하는 Root.
ScopeRootFact
대운·세운·월운·일진에서 새롭게 추가되거나 Formation에 의해 강화된 Root.
원국에서 Root가 약하더라도 운에서:
•	같은 오행 지지
•	반합국
•	완전 삼합국
•	완전 방합국
이 형성되면 현재 RootState가 달라질 수 있다.
________________________________________
4. RootState 기본 상태
R-004
기본 상태:
•	absent
•	present
•	strengthened
•	weakened
필요하면 내부적으로:
•	strongly_strengthened
정도의 질적 표현은 검토할 수 있다.
단:
•	10점
•	50점
•	75%
같은 임의 수치화는 하지 않는다.
________________________________________
5. 통근 판정의 기본 순서
R-005
각 천간마다 다음 순서로 판단한다.
1.	월령에 Root가 있는가
2.	다른 지지에도 Root가 있는가
3.	Root가 본기인가 중기·여기인가
4.	Root가 하나인가 복수인가
5.	12운성상 유무력은 어떠한가
6.	충으로 일부 Root가 약화됐는가
7.	반합·삼합·방합으로 Root가 강화됐는가
8.	운에서 새로운 Root가 추가됐는가
9.	전체 ScopeRootState는 어떤가
10.	그 결과 천간의 실제 기능이 바뀌는가
________________________________________
6. 지장간 통근
R-006
천간은 지지의 지장간에 같은 오행 성분이 존재하면 RootFact를 가질 수 있다.
통근 확인 단계에서는 우선 다음을 본다.
•	Root 존재 여부
•	본기 여부
•	Root가 위치한 지지
•	복수 Root 여부
•	월령 Root 여부
중요
충·오행 과다·Formation 등으로 인한 강화·약화는 Root 존재 확인 이후 RootState 판정 단계에서 별도로 처리한다.
따라서 통근 자체의 판정과 이후 상태 변화를 섞지 않는다.
________________________________________
7. 본기·중기·여기의 Root 우선도
R-007
FILUNE에서는 Root 우선도를:
본기 > 중기 = 여기
로 처리한다.
본기
본기에 존재하는 Root는 해당 지지의 대표 기운과 직접 연결되므로 우선적으로 본다.
중기·여기
중기와 여기는 모두 유효한 Root로 인정한다.
중기와 여기 사이에는 별도 강도 차이를 두지 않는다.
금지
다음과 같은 숫자화는 사용하지 않는다.
•	본기 3점
•	중기 2점
•	여기 1점
________________________________________
8. 월령 Root
R-008
월령에 존재하는 Root는 일반 지지의 Root보다 구조적으로 중요하게 본다.
특히 월령 지장간 성분이 천간에 투출한 경우:
MonthCommandRoot = true
로 별도 기록한다.
월령 Root는 단순한 뿌리 하나가 아니라:
•	해당 천간의 출처
•	격 형성
•	YongShen 형성
•	천간 기능의 기초
와 연결된다.
격국론에서도 월지에서 투출한 인성을 강한 기세로 평가하고, 월지에 함께 통근하는 구조를 겸격·유정의 근거로 사용한다.
금지
월령 Root = 다른 Root의 몇 배
같은 정량 규칙은 만들지 않는다.
________________________________________
9. FILUNE YongShen과 월령 Root
R-009
FILUNE의 Manifested YongShen은 월령 지장간에서 투출한 성분을 기준으로 한다.
따라서 Manifested YongShen은 원칙적으로:
MonthCommandRoot = true
이다.
즉:
ManifestedYongShen + RootState absent
를 기본 상태로 허용하지 않는다.
가능 상태
•	MonthCommandRoot 정상
•	MonthCommandRoot weakened
•	추가 Root 존재
•	Formation으로 Root strengthened
금지
용신이 무근이라 기능이 없다
라는 일반 규칙은 사용하지 않는다.
________________________________________
10. Root 개수
R-010
동일 천간이 여러 지지에서 Root를 확보하면 한 곳에만 Root를 가진 경우보다 기반이 안정적일 수 있다.
기본 질적 구분:
•	no root
•	single root
•	multiple roots
단 Root 개수만으로 최종 강약을 결정하지 않는다.
다음을 함께 본다.
•	월령 Root
•	본기 Root
•	Root의 현재 상태
•	Formation
•	운에서 추가된 Root
________________________________________
11. 하나뿐인 Root
R-011
천간이 한 지지에만 Root를 가지고 있다면 그 Root의 상태 변화가 천간 전체 기능에 큰 영향을 줄 수 있다.
특히 해당 지지가 충을 받으면:
single root
→ weakened root
로 본다.
전문가 자료에서도 하나뿐인 뿌리가 충을 받아도 없어졌다고 하지 않고 약해지는 요인으로 판단한다.
________________________________________
12. 복수 Root 중 일부가 충을 받은 경우
R-012
여러 곳에 충분히 통근한 천간은 Root 하나가 충을 받았다고 해서 천간 전체 RootState가 반드시 약해지는 것은 아니다.
예:
root1 = weakened by clash
root2 = present
root3 = present
인 경우 root1은 개별적으로 약화된다.
그러나 전체:
OverallRootState
는 여전히 present 또는 strengthened일 수 있다.
핵심
individual root damage
≠
overall stem root damage
이다.
________________________________________
13. 이미 충분히 강한 복수 Root
R-013
천간이 이미:
•	복수 Root
•	강한 본기 Root
•	MonthCommandRoot
•	Formation Root
등을 통해 충분히 유력한 경우 Root 하나가 충을 받아도 천간 전체 기능에는 실질적인 영향이 거의 없을 수 있다.
따라서:
Root 하나 충
→ 천간 전체 weakened
로 자동 처리하지 않는다.
________________________________________
14. 운에서 추가 Root가 들어오는 경우
R-014
대운·세운·월운·일진에서 새로운 Root가 추가될 수 있다.
따라서 원국 Root 하나가 충을 받고 있더라도 운에서 새로운 Root가 들어오면 전체 ScopeRootState는 다시 안정되거나 강화될 수 있다.
각 scope에서 Root 전체를 다시 평가한다.
________________________________________
15. 무근 천간
R-015
YongShen을 제외한 일반 천간은 지지에서 실질적인 Root를 전혀 얻지 못할 수 있다.
이 경우:
RootState = absent
로 본다.
단:
무근 = 기능 없음
은 아니다.
RelationFact는 그대로 존재한다.
다만 실제 작동력이 제한될 수 있다.
________________________________________
16. 병이 무근인 경우
R-016
병 역할 천간이 무근이면:
•	Byeong Role은 존재
•	문제 Relation도 존재
•	실제 작동력은 제한될 수 있음
으로 본다.
예:
ByeongRole = true
RootState = absent
CurrentByeongEffect = limited
________________________________________
17. YongShen은 무근 판정을 하지 않는다
R-017
Manifested YongShen은 월령에서 투출한 성분이므로 기본적으로 MonthCommandRoot를 가진다.
따라서 YongShen에는:
absent root
판정을 사용하지 않는다.
대신:
•	root present
•	root weakened
•	root strengthened
를 사용한다.
________________________________________
18. 운에서 Root가 생기면 일반 천간 기능이 살아날 수 있다
R-018
원국에서 무근 또는 약근인 일반 천간이 운 지지에서 Root를 얻으면 실제 기능이 증가할 수 있다.
예:
NatalRootState = absent
LuckRootAdded = true
ScopeRootState = present
또는:
ScopeRootState = strengthened
가 가능하다.
이 경우 해당 천간의:
•	SangShen 기능
•	Byeong 기능
•	관성 기능
•	재성 기능
•	식상 기능
등을 재평가한다.
________________________________________
19. Root 강화 자체에는 길흉이 없다
R-019
뿌리가 강화됐다는 사실 자체를 길 또는 흉으로 판정하지 않는다.
예:
YongShen Root 강화
대체로 유리 가능.
Byeong Root 강화
불리 가능.
칠살 Root 강화
제살·인화·일간 감당력에 따라 다름.
재성 Root 강화
재격에서는 유리할 수 있으나 재생살 구조에서는 불리할 수 있음.
________________________________________
20. 12운성의 역할
R-020
12운성은 천간의 유무력을 판단하는 보조도구로 제한한다.
전문가 자료에도:
12운성은 사주 천간의 유무력을 판단하는 도구로서만 제한
이라고 명시되어 있다.
따라서 12운성은:
•	YongShen 선정법 아님
•	격 결정법 아님
•	독립 길흉 판정법 아님
이다.
________________________________________
21. 12운성과 Root를 결합한다
R-021
같은 RootFact가 있어도 12운성상 상태를 참고해 Root의 질을 판단할 수 있다.
예:
•	건록
•	제왕
•	장생
등은 강한 기반 후보가 될 수 있다.
그러나:
제왕 = 무조건 최강
장생 = 무조건 길
처럼 기계적으로 처리하지 않는다.
________________________________________
22. 12운성 금지 규칙
R-022
다음은 사용하지 않는다.
•	제왕 = 무조건 길
•	건록 = 무조건 성격
•	장생 = 무조건 좋은 운
•	묘 = 무조건 무력
•	절 = 무조건 Root 없음
•	쇠 = 자동 신약
12운성은 실제 통근 구조를 보조한다.
________________________________________
23. 일간 Root와 일반 천간 Root를 분리한다
R-023
일간 Root는 일반 천간 Root와 의미가 다르다.
일반 천간 Root
해당 십신의 실제 작동력을 높인다.
일간 Root
사주 주체의:
•	감당력
•	운용력
•	지속력
을 높인다.
따라서 일간 RootState가 변하면:
DayMasterCapacity
를 별도로 재평가한다.
________________________________________
24. DayMasterCapacity
R-024
일간이 무엇을 감당할 수 있게 되었는지를 구조별로 본다.
주요 capacity:
•	officer_capacity
•	killing_capacity
•	wealth_capacity
•	output_capacity
•	self_support_excess
________________________________________
25. 신강·신약은 YongShen 선정법이 아니다
R-025
FILUNE에서 신강·신약은 용신을 결정하지 않는다.
용도는:
현재 격 구조를 일간이 감당할 수 있는가
를 판단하는 것이다.
따라서:
신약 → 인비를 용신으로 선정
같은 억부식 자동 공식은 사용하지 않는다.
________________________________________
26. 신강 자체에는 고정 길흉이 없다
R-026
신강 = 길
신약 = 흉
으로 판단하지 않는다.
예:
칠살이 강하면 신강이 도움이 될 수 있다.
반대로:
•	인성 왕
•	비겁 왕
•	일간 Root 왕
인데 설기·재관 흐름이 부족하면 과다한 self-support가 될 수 있다.
________________________________________
27. 중화의 정의
R-027
FILUNE에서 중화는 모든 오행을 비슷한 양으로 맞추는 것이 아니다.
중화는:
현재 강한 기세가 필요한 방향으로 생·설·제되어 막히지 않고 기능하는 상태
를 의미한다.
따라서:
•	강한 것을 무조건 약하게 만들 필요 없음
•	약한 것을 무조건 강하게 만들 필요 없음
•	필요한 흐름이 확보되는지가 핵심
이다.
________________________________________
28. 기세 편중
R-028
불리한 것은 단순히 강한 글자가 많다는 사실이 아니다.
문제는:
강한 기운이 한쪽으로 몰려 있고 이를 설기·제어·전환할 경로가 부족한 상태
이다.
내부적으로:
•	energy_concentration
•	missing_release_path
•	missing_control_path
등으로 표현할 수 있다.
________________________________________
29. 칠살격과 일간 Root
R-030
칠살은 일간을 강하게 극한다.
따라서 칠살을 쓰는 경우 일간 Root가 중요한 판단 요소다.
전문가 자료는 직접:
칠살을 쓰는 경우는 일간의 뿌리가 왕한 것이 좋음
이라고 설명한다.
또 식상·인성이 부족하면 비겁이라도 있어 일간이 버틸 수 있어야 한다고 설명한다.
________________________________________
30. 칠살 감당력
R-031
칠살이 강할 때:
DayMasterRootState strengthened
→ KillingCapacity 증가
가능.
따라서 이미 어느 정도 신강하더라도 추가 Root가 칠살을 감당하는 데 도움이 될 수 있다.
________________________________________
31. 천간 칠살에도 동일 적용
R-032
월령이 칠살격이 아니더라도 천간 칠살이 실제로 일간을 공격한다면 일간 Root를 확인한다.
특히:
•	칠살 Root 강함
•	재성이 칠살을 생함
이면 일간 Root의 중요성이 더 커질 수 있다.
________________________________________
32. 칠살 + 무근 일간
R-033
칠살이 유효한데 일간 Root가 거의 없다면 불리할 수 있다.
전문가 자료에서도:
•	칠살이 살아 있고
•	재성이 칠살을 생하며
•	일간이 지지 어디에도 Root가 없음
을 명확한 문제로 본다.
즉:
SevenKilling active
+
DayMasterRoot absent
→ bearing capacity insufficient
후보.
________________________________________
33. 칠살 + Root 강함
R-034
칠살을 쓰는 사주에서 일간 Root가 충분하면:
•	관살 압박 감당
•	직업적 난제 감당
•	칠살의 장점 활용
에 도움이 될 수 있다.
이것은 단순 신강 선호가 아니라:
KillingCapacity
의 문제다.
________________________________________
34. 관성 구조와 일간 Root
R-035
정관도 일간을 극한다.
정관은 길신이므로 칠살처럼 제압 대상은 아니지만, 일간이 지나치게 약하면 정관의 기능을 충분히 감당하기 어렵다.
따라서:
•	정관 기세
•	재성 생관
•	인성 보호
•	일간 Root
•	관살혼잡
을 함께 본다.
________________________________________
35. 재격과 일간 Root
R-036
재성이 왕하면 일간이 재성을 운용할 수 있어야 한다.
전문가 자료에서도 재성이 왕한 명에서 일간 Root가 필요하다고 판단한다.
따라서:
strong Wealth
+
DayMasterRoot strengthened
→ WealthCapacity 증가
가능.
________________________________________
36. 재성이 왕한데 일간 Root가 약한 경우
R-037
이 경우:
•	재를 감당하기 어려움
•	재성 기능을 오래 유지하기 어려움
으로 해석할 수 있다.
현실 해석에서는 확률적으로 표현한다.
________________________________________
37. 식상과 일간 Root
R-038
식상은 일간을 설기한다.
식상 세력이 강하면 일간 Root가 충분해야 지속적으로 식상 기능을 감당할 수 있다.
하지만 식상이 적정하다면 추가 Root가 반드시 필요한 것은 아니다.
________________________________________
38. 인수격과 일간 Root
R-039
인수격에서는 단순히:
인성 강 + 일간 강 = 불리
로 판단하지 않는다.
핵심은 기세의 편중과 흐름이다.
격국론은:
•	일간 강 + 인수 약 → 칠살이 인수를 돕는 경우 유정
•	일간 약 + 인수 강 → 인수가 칠살을 인화하여 일간을 돕는 경우 유정
으로 설명한다.
반대로:
일간 강
+
인수 강
+
칠살 추가
가 되면 이미 강한 구조에 칠살까지 더해져 기세가 편중될 수 있다.
________________________________________
39. 인수격 과왕의 핵심 문제
R-040
문제는:
강한 것들이 존재한다
는 사실 자체가 아니다.
문제는:
강한 인성 → 강한 일간으로 힘이 몰리고, 이를 다시 흘려보낼 설기·제어 경로가 부족한 것
이다.
따라서:
energy_concentration
+
missing_release_or_control_path
를 확인한다.
________________________________________
40. 인수격 과왕의 해결
R-041
인성과 일간이 모두 강한 경우에는 다음과 같은 흐름이 도움이 될 수 있다.
•	식상으로 설기
•	재성으로 인성 과다 조절
•	관성으로 일간 제어
격국론에서도 일간과 인수가 모두 강한데 식상이 있으면:
印 → 日主 → 食傷
으로 흐름이 생기고, 동시에 식상이 칠살을 제어하여 귀격이 될 수 있다고 설명한다.
________________________________________
41. 월령 Root와 격의 기세
R-042
월령에 직접 Root를 가진 천간은 격의 중심 기세와 직접 연결될 수 있다.
특히 월령에서 투출한 글자는:
•	단순히 Root가 하나 존재하는 것보다
•	격 자체의 출처와 연결되어 있다는 점
에서 중요하다.
따라서 MonthCommandRoot는 RootState 판정 시 우선적으로 고려한다.
________________________________________
42. 반합국과 Root 강화
R-050
왕지를 포함한 반합국은 해당 오행의 지지 세력을 실제로 강화하므로 관련 천간 RootState도 강화할 수 있다.
예:
亥卯 木 반합국
→ 甲乙 Root 강화 가능.
________________________________________
43. 완전 삼합국과 Root 강화
R-051
완전 삼합국은 관련 천간 RootState를 강하게 강화할 수 있다.
예:
亥卯未 木局
→ 甲乙 Root 강화.
해당 오행이 일간과 같으면:
DayMasterRootState
도 강화한다.
________________________________________
44. 방합과 Root 강화
R-052
완전 방합 역시 해당 오행 천간의 Root를 강화한다.
예:
寅卯辰 木方
→ 甲乙 Root 강화.
申酉戌 金方
→ 庚辛 Root 강화.
일간이 해당 오행이면 일간 Root도 강화한다.
________________________________________
45. Formation이 일간 Root가 되는 경우
R-053
반합·삼합·방합의 목표 오행이 일간과 같은 오행이거나 일간의 실질 Root가 된다면:
DayMasterRootState = strengthened
를 검토한다.
이후 반드시:
DayMasterCapacity
를 재평가한다.
________________________________________
46. Formation + 칠살
R-054
칠살이 강한 상황에서 Formation이 일간 Root를 강화하면:
KillingCapacity
가 증가할 수 있다.
따라서:
비겁 Formation
자동 불리
로 처리하지 않는다.
________________________________________
47. Formation + 정관
R-055
정관이 강한 구조에서 Formation이 일간 Root를 강화하면 정관을 감당하는 기반이 될 수 있다.
이 경우:
OfficerCapacity 증가
로 볼 수 있다.
정관을 제압하거나 손상시키는 효과와는 구분한다.
________________________________________
48. Formation + 재성
R-056
재성이 왕한 구조에서 Formation이 일간 Root를 강화하면:
WealthCapacity
가 높아질 수 있다.
다만 동시에:
•	식상 부재
•	비겁의 분탈
•	재생살
등 다른 문제는 별도로 본다.
________________________________________
49. Formation + 식상
R-057
식상 세력이 강해 일간 설기가 큰 경우 일간 Root Formation은:
OutputCapacity
를 높일 수 있다.
그러나 식상이 적정한 경우에는 추가 Root가 반드시 길한 것은 아니다.
________________________________________
50. Formation으로 Root가 강해져도 stopped 천간은 별개다
R-058
천간이 유효한 천간 합거로 stopped되어 있으면:
지지 Formation으로 Root가 강해져도 자동 재활성화되지 않는다.
가능:
RootState = strengthened
StemRuntimeState = stopped
________________________________________
51. Root 강화와 RoleHistory
R-060
YongShen·SangShen·Byeong의 역할 이력은 RootState 변화로 삭제하지 않는다.
예:
YongShenRole = retained
RootState = weakened
CurrentFunction = weakened
가능.
________________________________________
52. Byeong Root 강화
R-061
병 역할의 천간 Root가 강화되면 병의 실제 작용도 강해질 수 있다.
예:
Byeong Root strengthened
→ CurrentByeongEffect increased
가능.
________________________________________
53. Byeong Root 약화
R-062
병 Root가 충 등으로 약해지면 병의 실제 기능도 약해질 수 있다.
하지만 ByeongRole 자체는 유지한다.
________________________________________
54. YongShen Root 강화
R-063
YongShen의 MonthCommandRoot 또는 추가 Root가 강화되면 해당 용신의 실제 작동력이 높아질 수 있다.
다만 YongShen이 동시에 Byeong 역할도 가진다면 효과를 분리한다.
________________________________________
55. YongShen Root 약화
R-064
YongShen의 월령 Root가 충 등으로 약해지면 용신 기능이 약화될 수 있다.
하지만 YongShen RoleHistory는 유지한다.
________________________________________
56. SangShen Root 강화
R-065
상신 Root 강화는 상신이 실제로:
•	용신 보호
•	병 제어
•	흉신 제어
를 수행하는 능력을 높일 수 있다.
________________________________________
57. RootState와 생극 효과
R-070
생극 관계는 RootState와 함께 판정한다.
같은 극 관계라도:
•	강한 Root source → 약한 target
•	무근 source → 강한 Root target
은 실제 효과가 다를 수 있다.
RelationFact는 같아도 EffectFact는 달라질 수 있다.
________________________________________
58. RootState와 육합
R-071
육합은 특정 오행국을 만들지 않으므로 육합만으로 특정 오행 Root를 자동 강화하지 않는다.
육합은:
•	bound
•	weakened
•	relation adjustment
중심으로 본다.
________________________________________
59. RootState와 오행 과다
R-072
오행 과다는 Root 존재 확인 이후의 후처리다.
3:1 구조에서 소수 지지가 어떤 천간의 Root라면 그 RootState가 약화될 수 있다.
이 경우:
RootFact = true
+
RootState = weakened
가 가능하다.
________________________________________
60. 4:0 구조와 Root
R-073
지지 네 자리가 모두 한 오행이면 해당 오행 천간에는 매우 강한 기반이 될 수 있다.
동시에 다른 오행 천간은 원국 지지에서 Root가 없을 가능성이 높다.
따라서:
•	dominant element roots
•	missing element roots
를 함께 기록한다.
________________________________________
61. 4:0 + 운에서 새 Root
R-074
운에서 다른 오행 지지가 들어오면 새로운 RootFact가 생길 수 있다.
하지만 기존 네 지지의 압도적 세력 때문에 그 Root의 실제 기능이 제한될 수 있다.
따라서:
newRoot = present
functionalEffectiveness = weakened
가 가능하다.
________________________________________
62. Root와 Palace를 혼동하지 않는다
R-075
특정 지지가 일간 또는 천간 Root라고 해서 해당 궁위가 자동으로 좋다고 하지 않는다.
예:
일지가 강한 Root라도:
•	충
•	형
•	오행 편중
•	배우자궁 문제
가 별도로 존재할 수 있다.
Root 기능과 PalaceOutcome을 분리한다.
________________________________________
63. RootState 집계
R-080
천간별 최종 RootState는 개별 Root를 모아 질적으로 판정한다.
예:
roots:
- monthBranch: present
- dayBranch: weakened
- luckBranch: strengthened

overallRootState: strengthened
개별 Root 하나의 상태를 전체 RootState로 그대로 복사하지 않는다.
________________________________________
64. RootState 비교
R-081
서로 직접 생극하는 두 천간의 실제 작용을 판단할 때 RootState 비교를 허용한다.
예:
WeakRoot 財
vs
StrongRoot 印
이면 재극인 Relation은 존재하지만 실제 인성 손상은 작을 수 있다.
________________________________________
65. 무근 공격자
R-082
공격 천간이 무근이어도 RelationFact는 생성한다.
하지만 실제 Effect 강도는 제한될 수 있다.
즉:
무근 → 관계 없음
으로 하지 않는다.
________________________________________
66. 약한 Root의 target
R-083
Target이 약근 또는 무근이면 비교적 작은 공격에도 실제 기능 손상이 크게 나타날 수 있다.
그러나 자동 stop은 금지한다.
________________________________________
67. 일간 Root와 식신제살
R-084
식신이 칠살을 제어하더라도 일간 자체가 지나치게 무력하면 구조의 실제 완성도가 제한될 수 있다.
전문가 자료에서도 칠살을 쓰는 사주에서 일간이 무력하면 식신이 칠살을 극해도 큰 공이 없다고 설명한다.
따라서:
FoodGod controls SevenKilling
만으로 성격 확정하지 않고:
DayMasterCapacity
를 함께 본다.
________________________________________
68. 일간 Root와 살인상생
R-085
살인상생에서도:
七殺 → 印 → 日主
관계 존재만 보지 않는다.
각 단계의 RootState와 실제 기능을 확인한다.
________________________________________
69. 일간 Root와 재격
R-086
재격은:
WealthFunction
+
DayMasterCapacity
를 함께 본다.
재성이 강한데 일간 Root가 너무 약하면 실제 재성 운용력이 제한될 수 있다.
________________________________________
70. 관살혼잡과 일간 Root
R-087
관살혼잡에서 일간 Root가 강하다고 혼잡 자체가 해결되는 것은 아니다.
일간 Root 강화는:
DayMasterCapacity
를 높이는 효과만 가진다.
혼잡 해결은 여전히:
•	합
•	제어
•	제거
•	청탁 정리
가 필요하다.
________________________________________
71. 신강·신약 내부 표현
R-090
내부적으로 신강·신약을 단순 boolean으로 관리하지 않는 것을 권장한다.
예:
•	insufficient_capacity
•	adequate_capacity
•	strong_capacity
•	excessive_capacity
________________________________________
72. Capacity 표현 우선
R-091
최종 해석에서는 가능하면:
신강해서 좋다
보다:
칠살을 감당할 수 있는 기반이 충분하다.
재성을 운용할 수 있는 일간 기반이 생겼다.
처럼 구조적 의미를 우선한다.
________________________________________
73. 12운성과 Capacity
R-092
12운성은 DayMasterCapacity에도 보조적으로 반영한다.
일간이 여러 지지에서:
•	건록
•	제왕
등 강한 기반을 가지면 높은 Capacity 후보가 될 수 있다.
그러나 Root 위치와 구조를 함께 본다.
________________________________________
74. Scope별 RootState 재계산
R-100
각 scope에서 RootState를 재평가한다.
Natal
원국 Root.
Daewoon
원국 + 대운에서 추가 Root와 Formation 반영.
Sewoon
원국 + 세운 직접 판정 후 대운 context 반영.
Month
원국 + 월운 직접 판정 후 세운 context 반영.
Day
원국 + 일진 직접 판정 후 월운 context 반영.
________________________________________
75. 운끼리 Formation을 통한 Root 강화
R-101
예:
대운 亥 + 세운 卯
→ 세운 scope에서 木 반합국
→ 甲乙 Root 강화 가능.
해당 木이 일간 Root라면:
DayMasterRootState
도 강화한다.
________________________________________
76. RootHistory와 CurrentRootState
R-102
과거 scope에서 어떤 Root가 강해졌다는 이력과 현재 RootState를 구분한다.
현재 scope에서는 다시:
•	새로운 Root
•	Formation
•	충
•	기존 MonthCommandRoot
를 보고 CurrentRootState를 계산한다.
________________________________________
77. RootState와 운 체용을 구분한다
R-103
RootState는 현재 구조적 기반을 의미한다.
운의 최종 길흉 비교는:
•	세운 ↔ 대운
•	월운 ↔ 세운
•	일진 ↔ 월운
의 체용 규칙을 따른다.
Root 계산과 운 길흉 판정을 하나의 로직으로 합치지 않는다.
________________________________________
78. 구현용 데이터 구조
RootFact
- stemId
- branchId
- hiddenStemSource
  - main
  - middle
  - residual
- isMonthCommandRoot
- scope
- sourceType
  - natal
  - luck
  - halfFormation
  - threeHarmony
  - seasonalHarmony
RootState
- stemId
- scope
- overallStatus
  - absent
  - present
  - strengthened
  - weakened
- individualRoots[]
- evidence[]
- affectedBy[]
________________________________________
79. DayMasterCapacity 데이터 구조
DayMasterCapacity
- scope
- overallCapacity
  - insufficient
  - adequate
  - strong
  - excessive

- officerCapacity
- killingCapacity
- wealthCapacity
- outputCapacity

- energyConcentration
- releasePathAvailable
- controlPathAvailable
- evidence[]
________________________________________
80. 12운성 데이터 구조
LifeStageFact
- stem
- branch
- stage
- scope
- function
  - root_quality_support
12운성에는:
good/bad
필드를 두지 않는다.
________________________________________
81. 통근 관련 구현 금지 규칙
Codex는 다음 규칙을 만들지 않는다.
•	지장간 Root 하나 = 강근
•	중기 > 여기
•	중기·여기 Root = 무효
•	충받은 Root = 삭제
•	Root 하나 충 = 전체 천간 약화
•	이미 복수 강근인데 하나 충 = 자동 신약
•	무근 천간 = Relation 없음
•	Root 많음 = 무조건 길
•	일간 Root 많음 = 무조건 길
•	신강 = 무조건 길
•	신약 = 무조건 흉
•	YongShen = 무근 가능
•	YongShen Root absent
•	칠살격에서 신강 = 자동 성격
•	재격에서 신강 = 자동 부
•	인수격에서 Root 많음 = 무조건 좋음
•	인수격에서 일간·인성 강함 = 자동 흉
•	강한 힘끼리 존재 = 자동 흉
•	제왕 = 무조건 길
•	절 = 자동 무근
•	반합·삼합·방합 Root 강화 = 자동 길
•	Formation Root 강화 → 천간 합거 자동 해제
•	YongShen Root 약화 → YongShen Role 삭제
•	Byeong Root 약화 → Byeong Role 삭제
________________________________________
82. 통근 판정 실행 순서
collectStemAndBranchFacts()
↓
detectMonthCommandRoots()
↓
detectOtherDirectRootFacts()
↓
classifyRootSource()
  - main
  - middle
  - residual
↓
evaluate12LifeStageFacts()
↓
evaluateIndividualRootStates()
  - clash weakening
  - other confirmed weakening
↓
applyFormationRootEffects()
  - half three-harmony
  - complete three-harmony
  - complete seasonal harmony
↓
applyElementOverloadEffects()
↓
aggregateOverallStemRootStates()
↓
resolveDayMasterRootState()
↓
evaluateDayMasterCapacity()
↓
evaluateEnergyConcentration()
↓
evaluateReleaseAndControlPaths()
↓
updateStemFunctionalStates()
↓
recheckYongShen()
↓
recheckSangShen()
↓
recheckByeong()
↓
recheckGuEung()
↓
recheckStructureFormula()
↓
rejudgeSuccessFailure()
________________________________________
83. FILUNE 통근·12운성 엔진의 최종 원칙
FILUNE은 통근을 단순히:
“뿌리가 있다 / 없다”
로 끝내지 않는다.
최종적으로는:
월령에 직접 뿌리를 두고 있는가
→ 본기인가 중기·여기인가
→ 다른 지지에도 복수 Root가 있는가
→ 개별 Root가 충을 받았는가
→ 그 충이 전체 천간 RootState에 실제 영향을 줄 정도인가
→ 운에서 새로운 Root가 들어왔는가
→ 반합·삼합·방합으로 뿌리가 강화되었는가
→ 12운성상 해당 천간의 유무력은 어떠한가
→ 그 결과 천간 기능이 얼마나 실제로 작동하는가
→ 일간이라면 현재 정관·칠살·재성·식상을 감당할 능력이 충분한가
→ 이미 강한 인성·일간의 기세가 한쪽으로 편중되지는 않았는가
→ 생·설·제의 흐름을 통해 그 기세가 적절히 순환하는가
→ 그 변화가 용신·상신·병·구응 및 격국 성패에 어떤 영향을 주는가
를 판단한다.
통근과 12운성은 용신을 새로 선택하는 도구가 아니라, 이미 정해진 격국과 역할이 실제로 얼마나 작동할 수 있는지 판단하는 유무력·감당력·기세 흐름 도구다.

