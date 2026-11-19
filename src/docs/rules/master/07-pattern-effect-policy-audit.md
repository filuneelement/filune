FILUNE v1 PatternEffectPolicy 출처감사 및 고정표 v0.2
0. 목적
이 문서는 FILUNE v1 PatternEffectPolicy 격별 구조판정 마스터 v0.2의 주요 Policy에 대해 다음을 고정한다.
•	기본 구조 방향
•	적용 조건
•	반전 조건
•	출처 수준
•	FILUNE 고정 규칙
•	구현 시 금지사항
근거 상태는 다음과 같다.
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
CONFLICT
DEFERRED
________________________________________
1. provenance 기본 정의
PA-001 — SOURCE_EXPLICIT
전문가 풀이 또는 격국론 자료에 해당 구조와 방향이 직접 설명되어 있는 경우.
________________________________________
PA-002 — SOURCE_INFERENCE
자료의 복수 규칙과 사례를 결합하면 도출되지만, 동일한 문장 또는 공식이 직접 명시되어 있지는 않은 경우.
________________________________________
PA-003 — FILUNE_APPROVED_OVERRIDE
자료와 다르거나 자료보다 적용범위를 좁게 잡더라도 FILUNE 구현 기준으로 확정한 규칙.
________________________________________
PA-004 — CONFLICT
전문가 풀이와 격국론 등 자료 간에 실제 차이가 있는 경우.
________________________________________
PA-005 — DEFERRED
현재 자료만으로 범용 실행규칙을 확정하기 어려운 경우.
________________________________________
2. RelationFact와 PolicyDirection은 분리한다
PA-010
예:
RelationFact:
財 → 剋 → 印
에는 길흉을 저장하지 않는다.
이 RelationFact는 현재 PatternContext에 따라 다음처럼 달라진다.
財格
→ favorable

印格
→ unfavorable

印格 + 印過多
→ favorable
즉:
RelationFact = 관계 사실
PatternEffectPolicy = 현재 격에서의 구조 방향
이다.
________________________________________
3. 일반 Policy보다 구체적 PatternContext가 우선한다
PA-011
동일 RelationFact에 여러 규칙이 적용될 경우 가장 구체적인 구조를 우선한다.
예:
財剋印
보다:
財格 + 財剋印
이 우선한다.
그리고:
印格 + 印過多 + 財剋印
은 일반 印格 + 財剋印보다 우선한다.
________________________________________
4. 정관격 — 財生官
PA-100
財 → 生 → 正官
방향
favorable
출처
SOURCE_EXPLICIT
정관격에서 재성은 정관을 생하여 정관의 기능을 강화한다.
________________________________________
5. 정관격 — 印護官
PA-101
印 → 制 食傷
→ protect 正官
방향
favorable
출처
SOURCE_EXPLICIT
상관이 정관을 공격하는 경우 인성이 상관을 제어하여 정관을 보호하면 성격으로 돌릴 수 있다.
________________________________________
6. 정관격 — 傷官見官
PA-102
傷官 → 剋 → 正官
방향
unfavorable
출처
SOURCE_EXPLICIT
________________________________________
7. 정관격 — 財剋護官之印
PA-103
정관을 보호하기 위해 실제로 필요한 印을 財가 극하는 경우:
財 → 剋 → 印
↓
印 cannot protect 正官
방향
unfavorable
출처
SOURCE_EXPLICIT
여기서 불리한 이유는 財剋印이라는 관계 자체가 아니라:
정관을 보호하는 필수 SangShen인 印의 기능이 깨지기 때문
이다.
________________________________________
8. 정관격 — 官殺混雜
PA-104
正官 + 七殺
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT
________________________________________
9. 정관격 — 去殺留官
PA-105
정관격에서 혼입한 七殺을 제거하고 正官을 남기면:
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
10. 정관격 — 傷官合殺
PA-106
傷官 → 合 → 七殺
정관격에서 七殺이 관살혼잡을 만들고 있고 傷官이 七殺과 유효 천간합을 이루어 이를 제거하면:
방향
favorable
출처
SOURCE_EXPLICIT
격국론에서도 정관격의 관살혼잡 해소 방법으로 상관합살을 직접 사용한다.
________________________________________
11. 傷官合殺 Runtime
PA-107
FILUNE 실행 모델에서는 유효 천간합이면:
傷官 RuntimeState = stopped
七殺 RuntimeState = stopped
로 처리한다.
출처
FILUNE_APPROVED_OVERRIDE
합살 공식 자체는 SOURCE EXPLICIT이고, 양쪽 stopped 상태 모델은 FILUNE 구현 규칙이다.
________________________________________
12. 칠살격 — 食神制殺
PA-200
食神 → 剋 → 七殺
방향
favorable
출처
SOURCE_EXPLICIT
칠살격의 대표적인 제살 경로다. 전문가 풀이에서도 식신·상관의 제살 기능을 직접 언급한다.
________________________________________
13. 칠살격 — 제살태과
PA-201
칠살은 약한데 食神의 제살이 지나치게 강한 경우:
방향
context_dependent
칠살 보강이 오히려 필요할 수 있다.
출처
SOURCE_EXPLICIT
________________________________________
14. 칠살격 — 殺印相生
PA-202
七殺 → 生 印 → 生 日主
방향
favorable_when_needed
출처
SOURCE_EXPLICIT
________________________________________
15. 칠살격 — 印奪食
PA-203
印 → 剋 → 食神
食神이 현재 핵심 제살 SangShen이면:
unfavorable
반대로 食神이 과하고 七殺이 약하면 印의 제어가 도움이 될 수도 있다.
출처
SOURCE_EXPLICIT
따라서 Policy는 context_dependent.
________________________________________
16. 칠살격 — 財生殺
PA-204
財 → 生 → 七殺
기본 방향
context_dependent
출처
SOURCE_EXPLICIT
칠살이 이미 과하고 해로우면 財生殺은 불리하다.
반대로 칠살이 부족하고 현재 구조에서 필요한 경우 財로 칠살을 돕는 구조도 존재한다.
________________________________________
17. 칠살격 — 官殺混雜
PA-205
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT
________________________________________
18. 칠살격 — 去官留殺 / 去殺留官
PA-206
관살혼잡을 해소하여 구조를 맑게 만드는 방향.
방향
favorable_when_structure_requires
출처
SOURCE_EXPLICIT
월령 칠살을 존중하여 정관을 제거하고 칠살을 남기는 사례도 직접 확인된다.
________________________________________
19. 칠살격 — 傷官剋殺
PA-207
傷官 → 剋 → 七殺
방향
favorable_candidate_when_killing_harmful
출처
SOURCE_EXPLICIT
전문가 풀이에서도 칠살을 극하는 식신·상관이 귀하게 쓰일 수 있다고 직접 설명한다.
________________________________________
20. 傷官制殺 명칭
PA-208
상관이 칠살을 극하는 기능 자체는 명확히 인정한다.
다만 FILUNE에서는 대표 구조명으로:
食神制殺
傷官合殺
을 우선하고,
傷官制殺
은 실제 극 Relation을 설명하는 제한적 명칭으로 사용한다.
출처
SOURCE_INFERENCE / RESTRICTED_NAMING
________________________________________
21. 재격 — 기본 원칙
PA-300 — FILUNE FIXED RULE
재격에서는 財가 격의 중심이다.
따라서 재격의 기본 판단은:
財의 기능을 살리는가, 財를 해치는가
를 중심으로 한다.
________________________________________
22. 재격 — 食神生財
PA-301
食神 → 生 → 財
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
23. 재격 — 財生官
PA-302
財 → 生 → 正官
방향
favorable
출처
SOURCE_EXPLICIT
재성의 현실적 성취가 사회적 자리·귀로 이어지는 좋은 경로다.
________________________________________
24. 재격 — 印과의 공존
PA-303
재격에서 印이 함께 존재하는 것을 문제로 보지 않는다.
방향
favorable
출처
SOURCE_EXPLICIT — EXPERT METHOD
전문가 풀이에서는 편재격이 인성을 만나는 경우:
재물도 있고 학식도 높아진다
는 방향으로 직접 해석한다.
실제 운 사례에서도 재격에 인성이 들어오는 것을 문제로 보지 않고 “돈을 버는데 학식도 높다”고 설명한다.
따라서:
財格 + 印
→ favorable
로 고정한다.
________________________________________
25. 재격 — 財剋印
PA-304 — FILUNE FIXED RULE
財 → 剋 → 印
재격에서의 방향
favorable
로 고정한다.
이유
재격에서는 財가 YongShen이자 격의 중심이다.
따라서:
財格
+
財剋印
은:
용신 財가 印을 제어하는 것
이므로 기본적으로 좋은 작용으로 본다.
________________________________________
26. 재격 財剋印 실행 규칙
PA-305
if BranchPattern == Wealth
and RelationFact == Wealth controls Resource:

    defaultDirection = favorable
context_dependent로 두지 않는다.
________________________________________
27. 재격에서 財剋印 자동 불리 금지
PA-306
금지:
財剋印
→ 印이 다침
→ unfavorable
재격에서는 적용하지 않는다.
또한 다음처럼 애매하게 남기지도 않는다.
財格 + 財剋印
→ context_dependent
FILUNE 기본 Policy는 명확히:
財格 + 財剋印
→ favorable
이다.
________________________________________
28. 재격의 현실 해석
PA-307
재격에 財와 印이 함께 기능하면:
財:
재물
실무
현실적 성취
경제력

印:
학식
공부
문서
자격
지식
을 함께 갖는 구조로 해석한다.
대표적 고객 표현:
현실적인 성취와 경제적 감각뿐 아니라 학식·문서·지식 기반도 함께 갖추기 쉬운 구조
또는 간단히:
부와 학식을 함께 갖춘 모습
으로 표현할 수 있다.
________________________________________
29. 재격 — 比劫剋財
PA-308
比劫 → 剋 → 財
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT
다만 食傷 통관 등으로 실제 財 손상이 막히면 재평가한다.
________________________________________
30. 재격 — 財生殺
PA-309
財 → 生 → 七殺
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT
재격에 七殺이 살아나면 財가 七殺을 생하여 일간을 위협할 수 있다.
________________________________________
31. 재격 — 食神制殺
PA-310
食神 → 剋 → 七殺
칠살이 재격의 문제를 만드는 경우:
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
32. 재격 — 傷官合殺
PA-311
傷官 → 合 → 七殺
칠살이 財生殺 문제를 만들고 있다면:
방향
favorable
출처
SOURCE_EXPLICIT
격국론은 재격에 칠살이 있을 때:
•	傷官合殺
•	食神制殺
을 별도로 설명한다.
________________________________________
33. 재격 — 傷官剋殺
PA-312
傷官 → 剋 → 七殺
칠살이 재격의 병이면:
방향
favorable
출처
SOURCE_EXPLICIT — EXPERT CASE
전문가 실제 사례에서 원국 상관이 칠살을 제어하여 귀를 얻는다고 직접 판단한다.
________________________________________
34. 재격 핵심 고정표
PA-313
財格:

食神生財      → favorable
財生官        → favorable
印            → favorable
財剋印        → favorable

比劫剋財      → unfavorable_candidate
財生七殺      → unfavorable_candidate

食神制害殺    → favorable
傷官剋害殺    → favorable
傷官合害殺    → favorable
이 표를 재격 Policy의 기본값으로 사용한다.
________________________________________
35. 인수격 — 기본 원칙
PA-400
인수격에서는 印이 격의 중심이다.
따라서 印을 생하고 보호하는 경로를 기본적으로 좋게 보고, 印을 직접 공격하는 경로를 기본적으로 나쁘게 본다.
________________________________________
36. 인수격 — 印生身
PA-401
印 → 生 → 日主
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
37. 인수격 — 官生印
PA-402
正官 → 生 → 印
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
38. 인수격 — 殺印相生
PA-403
七殺 → 生 印 → 生 日主
방향
favorable_when_needed
출처
SOURCE_EXPLICIT
________________________________________
39. 인수격 — 財剋印
PA-404 — FIXED RULE
財 → 剋 → 印
방향
unfavorable
출처
SOURCE_EXPLICIT
이유는 명확하다.
印格
→ 印 = YongShen / 격 중심

財剋印
→ 財가 YongShen 印을 공격
이므로 기본적으로 나쁘다.
________________________________________
40. 인수격 財剋印 실행 규칙
PA-405
if BranchPattern == Resource
and RelationFact == Wealth controls Resource:

    defaultDirection = unfavorable
단 다음 印多用財 조건이 있으면 반전한다.
________________________________________
41. 인수격 — 印多用財
PA-406 — SOURCE EXPLICIT
인성이 지나치게 많고 일간도 강하여 印이 과다하면:
財 → 剋 → 過多印
이 오히려 필요한 조절이 된다.
방향
favorable
NamedFormula
印多用財
출처
SOURCE_EXPLICIT
________________________________________
42. 인수격 — 印輕財重
PA-407
印이 약하고 財가 너무 강하여 印을 깨면:
방향
unfavorable
출처
SOURCE_EXPLICIT
貪財破印 구조로 이어질 수 있다.
________________________________________
43. 인수격 — 食傷泄秀
PA-408
인성과 일간의 기세가 강해 흐름이 막힐 때:
食傷
→ 泄 日主
방향
favorable_when_excess
출처
SOURCE_EXPLICIT
________________________________________
44. 인수용살 — 食傷
PA-409
식상은:
•	七殺을 제어
•	일간을 설기
할 수 있다.
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
45. 인수용살 — 財
PA-410
財가:
財 → 剋 印
財 → 泄 食傷
財 → 生 七殺
경로를 만들면:
방향
unfavorable
출처
SOURCE_EXPLICIT
________________________________________
46. 財剋印 격별 최종 고정표
PA-420 — CORE RULE
동일한 RelationFact:
財 → 剋 → 印
은 다음처럼 판정한다.
재격
財 = 격의 중심
印 = 財가 제어하는 성분

財剋印
→ favorable
인수격
印 = 격의 중심
財 = 印을 공격

財剋印
→ unfavorable
인수격 + 印過多
印 = excessive
財 = 과다한 印을 조절

財剋印
→ favorable
이 세 방향을 FILUNE v1 고정 규칙으로 사용한다.
________________________________________
47. 식신격 — 食神生財
PA-500
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
48. 식신격 — 食神制殺
PA-501
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
49. 식신격 — 財生殺로 제살 방해
PA-502
食神이 七殺을 제어하고 있는데 財가 七殺을 다시 생하면:
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT
________________________________________
50. 식신격 — 위치에 따른 財 예외
PA-503
財가 실제로 七殺을 생하지 않는 위치라면:
食神制殺
+
食神生財
동시 성립 가능.
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
51. 식신격 — 偏印奪食
PA-504
偏印 → 剋 → 食神
방향
unfavorable
출처
SOURCE_EXPLICIT
________________________________________
52. 식신격 — 財剋害食之印
PA-505
편인이 식신을 손상시키고 있다면:
財 → 剋 → 印
은 식신을 보호한다.
방향
favorable
출처
SOURCE_EXPLICIT + STRUCTURAL INFERENCE
이 역시 財剋印 = 무조건 나쁨이 성립하지 않는 사례다.
________________________________________
53. 식신 과다 + 印 조절
PA-506
食神이 지나치게 강하면 印으로 食神을 조절할 수 있다.
방향
favorable_when_excess
출처
SOURCE_EXPLICIT
________________________________________
54. 상관격 — 傷官生財
PA-600
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
55. 상관격 — 傷官佩印
PA-601
상관이 과하고 印으로 상관을 적절히 제어할 필요가 있을 때:
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
56. 상관격 — 傷官見官
PA-602
傷官 → 剋 → 正官
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT
________________________________________
57. 상관격 — 傷官剋殺
PA-603
傷官 → 剋 → 七殺
七殺이 해로울 경우:
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
58. 상관격 — 傷官合殺
PA-604
傷官 → 合 → 七殺
기본 방향
context_dependent
출처
SOURCE_EXPLICIT AS FORMULA + FILUNE RUNTIME
칠살이 문제라면 좋고, 필요한 칠살이라면 나쁘다.
________________________________________
59. 상관격 — 財破必要印
PA-605
印이 상관을 제어하는 필수 SangShen인 경우:
財 → 剋 → 印
방향
unfavorable
출처
SOURCE_EXPLICIT
________________________________________
60. 食神制殺 / 傷官剋殺 / 傷官合殺
PA-650 — CORE DISTINCTION
食神制殺
食神 → 剋 → 七殺
•	RelationType = control
•	七殺 약화
•	대표 제살 공식
傷官剋殺
傷官 → 剋 → 七殺
•	RelationType = control
•	七殺 약화
•	실제 극 관계
傷官合殺
傷官 → 合 → 七殺
•	RelationType = combine
•	유효 천간합 필요
•	FILUNE에서는 양쪽 stopped 가능
세 관계를 하나로 합치지 않는다.
________________________________________
61. 傷官合殺의 격별 방향
PA-651
정관격 + 혼잡 七殺
傷官合殺
→ favorable
재격 + 해로운 財生殺
傷官合殺
→ favorable
양인격 + 필요한 七殺
傷官合殺
→ unfavorable
따라서:
傷官合殺 = always good
금지.
________________________________________
62. 비견격 Policy
PA-700 — FILUNE APPROVED OVERRIDE
FILUNE 비견격:
main:
正官
財

auxiliary:
食傷

七殺 as main YongShen:
prohibited
________________________________________
63. 비견격 — 食傷 통관
PA-701
比肩 → 生 食傷 → 生 財
방향
favorable_auxiliary
출처
SOURCE_EXPLICIT + FILUNE STRUCTURING
________________________________________
64. 비견격 — 財生害殺
PA-702
財가 현재 해로운 七殺을 실제로 강화하면:
방향
unfavorable
출처
SOURCE_EXPLICIT + FILUNE NARROWING
자동 財 + 七殺 = 흉으로 처리하지 않는다.
________________________________________
65. 겁재격 Policy
PA-800 — FILUNE APPROVED OVERRIDE
주 후보:
正官
七殺
財
보조:
食傷
七殺 주 YongShen 사용 가능.
________________________________________
66. 겁재격 — 七殺制劫
PA-801
방향
favorable_candidate
출처
FILUNE_APPROVED_OVERRIDE
DayMasterCapacity를 확인한다.
________________________________________
67. 겁재격 — 劫財剋財
PA-802
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT / GENERAL STRUCTURE
________________________________________
68. 양인격 — 七殺制刃
PA-900
七殺 → 制 → 羊刃
방향
favorable_priority
출처
SOURCE_EXPLICIT + FILUNE PRIORITY
________________________________________
69. 양인격 — 正官制刃
PA-901
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
70. 양인격 — 財助官殺
PA-902
방향
favorable
출처
SOURCE_EXPLICIT
________________________________________
71. 양인격 — 食神制必要殺
PA-903
칠살이 양인을 제어하는 핵심 YongShen일 때:
食神 → 剋 → 七殺
방향
unfavorable_candidate
출처
SOURCE_EXPLICIT + FILUNE PRIORITY
________________________________________
72. 양인격 — 傷官合必要殺
PA-904
傷官 → 合 → 七殺
필요한 七殺이 stopped되어 양인이 살아나면:
방향
unfavorable
출처
SOURCE_INFERENCE + FILUNE RUNTIME
________________________________________
73. 양인 범위
PA-905
FILUNE v1:
甲卯
丙午
庚酉
壬子
만 인정.
출처
FILUNE_APPROVED_OVERRIDE + CONFLICT
격국론의 戊午 포함 규칙과 충돌한다.
________________________________________
74. 겸격 — 복수 YongShen
PA-1000
두 개 이상 월령 YongShen이 투출하면 겸격 가능.
출처
SOURCE_EXPLICIT
________________________________________
75. 겸격 — 유정
PA-1001
YongShen들이 서로:
•	생
•	보호
•	통관
•	기능 연결
하면:
방향
favorable_harmony
출처
SOURCE_EXPLICIT
________________________________________
76. 겸격 — 무정
PA-1002
YongShen들이:
•	극
•	합거
•	기능 파괴
하면:
방향
unfavorable_conflict
출처
SOURCE_EXPLICIT
________________________________________
77. 겸격 합거 후 PatternContext 재계산
PA-1003
ManifestedYongShen 둘 중 하나 또는 둘이 stopped되면:
RoleHistory = retained
CurrentEffectiveYongShenSet = recomputed
CurrentPatternMode = recomputed
출처
FILUNE_APPROVED_OVERRIDE
________________________________________
78. 운에서 YongShen 발현
PA-1100
월령 지장간 성분이 운 천간으로 들어오면 해당 scope에서 ManifestedYongShen이 될 수 있다.
출처
SOURCE_EXPLICIT + FILUNE MODELING
________________________________________
79. 운에서 정격·변격·겸격 변화
PA-1101
운에 따라:
none → proper
none → transformed
proper → combined
transformed → combined
등이 가능하다.
단 BranchPattern History는 유지한다.
출처
현상:
SOURCE_SUPPORTED
상태 모델:
FILUNE_APPROVED_OVERRIDE
________________________________________
80. PatternEffectPolicy 조회 우선순위
PA-1200
Policy 충돌 시:
1.	가장 구체적인 PatternContext
2.	FILUNE Approved Override
3.	전문가 실제 풀이의 동일 구조
4.	격국론 Source Explicit
5.	Source Inference
6.	Deferred
순으로 적용한다.
________________________________________
81. 격 중심 우선 원칙
PA-1201 — CORE RULE
십신의 생극 자체보다:
현재 격의 중심 YongShen이 누구인가
를 먼저 본다.
예:
財剋印
財格
財가 용신.
→ 財가 印을 극하는 것이 좋다.
印格
印이 용신.
→ 財가 印을 극하는 것이 나쁘다.
이것이 FILUNE PatternEffectPolicy의 핵심 원칙이다.
________________________________________
82. 동일 RelationFact 비교표
RelationFact	PatternContext	기본 방향
財剋印	財格	favorable
財剋印	印格	unfavorable
財剋印	印格 + 印過多	favorable
財剋印	食神格 + 印奪食	favorable
食神制殺	七殺格	favorable
食神制殺	食神格	favorable
食神制殺	財格 + 해로운 七殺	favorable
食神制殺	羊刃格 + 필요한 七殺	unfavorable_candidate
傷官合殺	正官格 + 官殺混雜	favorable
傷官合殺	財格 + 해로운 七殺	favorable
傷官合殺	羊刃格 + 필요한 七殺	unfavorable
________________________________________
83. DEFERRED 항목
PA-1300
현재 범용 규칙으로 고정하지 않는다.
겁재격 세부 절대 우선순위
正官·七殺·財의 정밀한 우선순위.
모든 겸격 조합별 Policy
실제 사례와 필요에 따라 확장한다.
중기와 여기의 세밀 강도 차이
현재:
본기 > 중기 = 여기
만 사용.
傷官制殺 공식 명칭의 범용 사용
RelationFact는 인정하되 구조명 사용은 제한한다.
________________________________________
84. Policy Registry 권장 구조
PatternPolicyRegistry
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
- evidenceNotes

- filuneOverride
- conflictFlag
- deferredFlag
________________________________________
85. 테스트에서도 provenance를 검증한다
PA-1400
예:
expectedRelation = WealthControlsResource
expectedPattern = Wealth
expectedDirection = favorable
expectedEvidenceStatus = SOURCE_EXPLICIT
결과뿐 아니라 근거 상태도 테스트할 수 있도록 한다.
________________________________________
86. 구현 금지
PA-1500
Codex는 다음을 하지 않는다.
財剋印 = universally bad
금지.
財剋印 = universally context_dependent
도 금지.
반드시:
財格 → favorable
印格 → unfavorable
印格 + 印過多 → favorable
로 분기한다.
또한:
•	傷官剋殺과 傷官合殺 통합 금지
•	食神制殺과 傷官合殺 통합 금지
•	양인격에서 필요한 七殺 제거를 자동 길로 처리 금지
•	SOURCE_INFERENCE를 SOURCE_EXPLICIT로 승격 금지
•	FILUNE_OVERRIDE를 고전 직접 규칙처럼 기록 금지
•	겸격 유정·무정 생략 금지
•	운에서 PatternContext 재계산 생략 금지
________________________________________
87. 최종 고정 결론
FILUNE은 오행 생극 관계 하나만으로 길흉을 결정하지 않는다.
그러나 PatternContext가 확정되면 애매하게 남겨두지 않고 격에 따른 기본 방향을 명확히 정의한다.
대표적으로:
財 → 剋 → 印
은 RelationFact 자체는 중립이지만:
財格
→ favorable

印格
→ unfavorable

印格 + 印過多
→ favorable
로 명확히 판정한다.
특히 재격에서는:
財가 격의 중심 YongShen이므로 財가 印을 극하는 것은 좋은 작용으로 본다.
그리고 印이 함께 존재하는 것 역시:
재물·현실적 성취와 학식·문서·지식 능력을 함께 갖추는 구조
로 긍정 해석한다.
반대로 인수격에서는:
印이 격의 중심 YongShen이므로 財가 印을 극하면 용신을 공격하는 것이 되어 나쁘다.
다만 印이 과다하면:
財로 과다한 印을 제어하는 印多用財가 되어 다시 좋다.
이 원칙을 FILUNE v1 PatternEffectPolicy의 고정 실행 기준으로 사용한다.

