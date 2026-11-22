# FILUNE Compatibility-06A
## Customer Result Architecture & Korean Renderer

진입 조건:

```text
COMPATIBILITY_FINAL_ASSEMBLY_READY
```

현재 완료:

```text
C1 Cross-chart Fact Engine
C2 Structural Compatibility
C3 Personality Interaction
C4 Relationship Lifecycle & Timing
C5 Final Compatibility Assembly
```

이번 단계부터 **새로운 명리 판단을 하지 않는다.**

목표:

```text
FinalCompatibilityResult
↓
Customer Compatibility Result
↓
Korean Renderer
```

---

# ALLOWED SOURCES

이번 단계에서 사용할 수 있는 의미 근거는 아래로 제한한다.

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md
src/docs/rules/master/16-compatibility-spec.md

src/docs/codex/compatibility-05-final-assembly-result.md

현재 src/lib/compatibility/
현재 src/lib/reading/
현재 KO Personality Renderer의 표현 방식
```

명리 판단을 새로 하기 위해
원자료를 다시 연구하지 않는다.

---

# FIXED RULE 1 — Renderer는 판단하지 않는다

Renderer의 역할:

```text
confirmed internal semantic
→ customer language
```

뿐이다.

금지:

```text
새 합충 판단
새 십성 판단
새 궁합 판정
새 결혼 시기 판단
새 이혼 위험 판단
```

---

# FIXED RULE 2 — 확정 결과를 약화하지 않는다

엔진:

```text
confirmed
```

인데 고객 문장을:

```text
그럴 수도 있습니다
가능성이 있습니다
어떤 영향이 있을 수 있습니다
```

로 임의 약화하지 않는다.

---

# FIXED RULE 3 — 사건과 위험은 구분한다

예:

```text
relationship_breakdown_risk = confirmed
```

은 확정된 **위험 시기**다.

하지만:

```text
반드시 이혼합니다
```

라는 뜻은 아니다.

고객 문장은:

```text
관계가 크게 흔들리거나
이별·별거·이혼으로 이어질 위험이 뚜렷하게 높아지는 시기
```

수준으로 표현한다.

---

# FIXED RULE 4 — 명리 용어 고객 노출 금지

고객 결과에 직접 사용하지 않는다.

```text
용신
상신
병
구응
격국

비견
겁재
식신
상관
편재
정재
편관
정관
편인
정인

대운
세운
월운
일진

통근
투출
형충회합
```

필요하면 생활 의미로 변환한다.

---

# FIXED RULE 5 — 숫자 궁합점수 금지

금지:

```text
궁합 87점
상위 10%
85%
A등급
```

C5의 다축 결과를 그대로 보여준다.

---

# 1. 고객 결과의 핵심 질문

결과 페이지는 최소 다음 질문에 답해야 한다.

```text
1. 두 사람은 기본적으로 어떤 관계인가?
2. 서로에게 어떤 도움을 주는가?
3. 서로에게 어떤 부담을 주는가?
4. 누가 누구에게 더 큰 영향을 주는가?
5. 성격과 대화는 어떻게 맞물리는가?
6. 결혼으로 이어지기 쉬운 시기는 언제인가?
7. 결혼하기 좋은 시기와 조심해야 할 시기는 언제인가?
8. 관계가 좋아지는 시기는 언제인가?
9. 관계가 크게 흔들리는 시기는 언제인가?
```

---

# 2. 결과 페이지 권장 순서

고객 결과는 다음 순서로 구성한다.

```text
01 한눈에 보는 두 사람
02 이 관계의 강점
03 이 관계에서 주의할 점
04 서로에게 미치는 영향
05 성격과 대화
06 연애·결혼 흐름
07 관계가 좋아지는 시기
08 관계를 조심해야 하는 시기
09 결혼 가능성이 높아지는 시기
10 결혼하기 좋은 시기 / 부담이 큰 시기
11 관계 파탄 위험이 높아지는 시기
```

근거가 없는 chapter는 억지로 생성하지 않는다.

---

# 3. “한눈에 보는 두 사람”

C5에서 이미 생성된 다축 결과를
1~3문장으로 압축한다.

새로운 overall good/bad 판정은 만들지 않는다.

예:

```text
두 사람은 서로의 부족한 부분을 실제로 보완하는 힘이 있지만,
대화 방식에서는 답답함이 쌓이기 쉬운 조합입니다.
기본적인 인연의 힘은 살아 있으나 특정 시기에는 관계가 크게 흔들릴 수 있습니다.
```

이 예문을 그대로 하드코딩하지 않는다.

실제 confirmed C5 semantics를 조합한다.

---

# 4. 단일 “좋은 궁합/나쁜 궁합”으로 축소 금지

예:

```text
Structural = favorable
Personality = communication_friction
Future breakdown risk = confirmed
```

이면:

```text
좋은 궁합입니다.
```

로 끝내지 않는다.

각 결과를 모두 보여준다.

---

# 5. Strengths

C5 `strengths[]`를 생활 결과로 변환한다.

예시 mapping:

```text
relieves_byeong
→ 상대가 내가 혼자 해결하기 어려운 문제를 풀어주는 작용

supports_required_function
→ 상대가 내게 필요한 기능을 보완하고 살려주는 작용

supports_required_root
→ 내가 가진 장점이 실제로 힘을 쓰도록 기반을 만들어주는 관계

communication_relief
→ 평소보다 말과 감정을 주고받기 쉬워지는 작용

relationship_relief
→ 관계의 부담이 줄어드는 흐름
```

실제 semantic에 맞게 표현한다.

---

# 6. Risks

C5 `risks[]`를 생활 결과로 변환한다.

예:

```text
strengthens_harmful_path
→ 상대와의 관계가 내 기존 문제를 더 크게 만들 수 있음

damages_required_function
→ 내가 잘하던 기능이나 필요한 역할이 상대와 있을 때 약해질 수 있음

supports_harmful_root
→ 원래 있던 약점이 관계 안에서 더 오래 지속될 수 있음

communication_friction
→ 서로 마음속에 쌓아두고 대화가 줄어들기 쉬움

relationship_strain
→ 관계 유지에 드는 부담이 커짐

relationship_breakdown_risk
→ 중요한 관계가 크게 흔들리는 시기
```

---

# 7. 확정적인 현상은 확정적으로 쓴다

예:

```text
communicationFriction = confirmed
```

이면:

```text
두 사람은 서로 마음속에 생각을 오래 쌓아두기 쉬워,
시간이 지나면서 대화가 줄어들 수 있는 조합입니다.
```

처럼 쓸 수 있다.

다만 내부 certainty를:

```text
그럴지도 모릅니다.
```

수준으로 낮추지 않는다.

---

# 8. “누가 누구에게”를 반드시 표현

방향성이 존재하면 고객 결과에서도 유지한다.

예:

```text
A→B favorable
B→A unfavorable_dominant
```

이면 단순히:

```text
서로 영향을 줍니다.
```

라고 하지 않는다.

생활 언어:

```text
A는 B에게 도움이 되는 작용이 더 큽니다.

반대로 B는 A의 문제를 자극하거나
A에게 필요한 기능을 약하게 만드는 면이 더 큽니다.
```

처럼 방향을 보여준다.

---

# 9. 이름 사용

사용자가 입력한 이름이 있으면:

```text
A
B
```

대신 이름을 사용할 수 있다.

이름이 없으면:

```text
첫 번째 사람
두 번째 사람
```

같은 중립 표현 사용.

성별을 이름에서 추정하지 않는다.

---

# 10. C2 favorable

`favorable`는 생활언어로:

```text
상대가 내 구조의 중요한 문제를 해결하거나,
내게 꼭 필요한 부분을 실제로 살려주는 힘이 큰 관계
```

로 표현한다.

---

# 11. C2 favorable_dominant

```text
좋은 작용과 부담이 함께 있지만,
관계를 전체적으로 보면 도움이 되는 작용이 더 중요한 관계
```

---

# 12. C2 balanced_mixed

중요.

다음 표현 금지:

```text
애매한 궁합
보통
반반
```

정확한 의미:

```text
서로에게 큰 도움이 되는 부분과
크게 부딪히는 부분이 동시에 강한 관계
```

이다.

해당 positive/negative facts를 함께 설명한다.

---

# 13. C2 unfavorable_dominant

```text
도움이 되는 부분도 있지만,
관계 안에서 상대의 약점이나 기존 문제를 키우는 작용이 더 중요한 관계
```

---

# 14. C2 unfavorable

```text
상대와의 관계가 내게 필요한 기능을 약하게 하거나
기존 문제를 강하게 만드는 작용이 뚜렷한 관계
```

---

# 15. minor_effect

```text
서로 영향을 주기는 하지만
삶의 핵심 구조를 크게 바꿀 정도의 작용은 강하지 않은 관계
```

---

# 16. Personality section

C3 결과를 별도 chapter로 보여준다.

최소:

```text
기본 성격 상호작용
현재 성격 발현
대화 방식
표현 방식
현재 개선/악화
```

---

# 17. Resource Dominance 고객 번역

내부:

```text
ResourceDominance
OutputSuppression
ExpressionConstraint
```

고객에게 해당 용어를 노출하지 않는다.

예:

```text
생각을 안에서 오래 정리한 뒤 움직이는 성향이 강하고,
감정이나 생각을 바로 밖으로 표현하는 편은 아닙니다.
```

---

# 18. 두 사람 모두 표현 억제

내부:

```text
mutualExpressionRestraint = confirmed
communicationFriction = confirmed
```

예:

```text
두 사람 모두 속으로 생각을 오래 쌓아두는 편이라
처음에는 문제가 없어 보여도 시간이 지나면서
서로 말을 줄이고 자기 판단 안에 머물기 쉬운 조합입니다.
```

---

# 19. Current Expression Relief

현재 시기에:

```text
currentExpressionRelief = confirmed
```

이면:

```text
평소보다 말과 감정을 밖으로 꺼내기 쉬워지는 시기입니다.
평소에 대화가 막히던 관계라면 이때는 서로 풀어 이야기하기가 훨씬 수월합니다.
```

처럼 표현한다.

---

# 20. Natal과 Current 구분

예:

```text
기본적으로는 대화가 막히기 쉬운 두 사람이지만,
현재 시기에는 표현 기능이 살아나면서 관계가 한결 부드러워집니다.
```

가능.

원국과 현재 결과를 상쇄하지 않는다.

---

# 21. Relationship Lifecycle

C4 결과는 고객의 실제 관심사를 중심으로 보여준다.

```text
관계 형성
관계 변화
결혼
관계 부담
관계 회복
관계 파탄 위험
```

---

# 22. Marriage Opportunity

내부:

```text
marriage_opportunity = confirmed
```

고객 표현:

```text
연애 관계가 결혼이나 공식적인 관계로 넘어가기 쉬운 시기
```

또는 이미 관계 중이라면:

```text
결혼 이야기가 구체화되기 쉬운 시기
```

---

# 23. 관계 상태 미상

실제 관계 상태를 모르면:

```text
결혼이 성사되기 쉬운 시기
```

또는:

```text
관계가 공식적인 단계로 넘어가기 쉬운 시기
```

처럼 상태 중립적으로 표현한다.

---

# 24. Marriage Favorable

```text
marriage_favorable = confirmed
```

고객 표현:

```text
결혼을 추진하기에 관계 구조도 함께 받쳐주는 시기
```

---

# 25. Marriage Caution

```text
marriage_opportunity = confirmed
marriage_caution = confirmed
```

이면:

```text
결혼 자체는 성사되기 쉬운 시기지만,
같은 시기에 관계의 부담도 함께 커집니다.

결혼 가능성과 결혼 후 안정성은 별개로 봐야 하는 구간입니다.
```

---

# 26. 결혼 기회와 결혼 유리함 혼동 금지

금지:

```text
결혼 가능성이 높음
→ 좋은 결혼 시기
```

---

# 27. Relationship Strain

```text
relationship_strain = confirmed
```

고객 표현:

```text
서로에게 요구되는 부담이 커지고
평소에는 넘어가던 문제가 실제 갈등으로 드러나기 쉬운 시기
```

---

# 28. Relationship Relief

```text
relationship_relief = confirmed
```

예:

```text
그동안 쌓였던 관계 부담이 줄고,
대화나 관계 운영이 한결 수월해지는 시기
```

---

# 29. Breakdown Risk

```text
relationship_breakdown_risk = confirmed
```

고객 표현 강도는 분명하게 한다.

예:

```text
이 시기는 관계가 크게 흔들릴 가능성이 뚜렷하게 높아집니다.

기존 갈등이 있다면 이별·별거·이혼처럼
관계를 실제로 정리하는 결정으로 이어지기 쉬운 구간입니다.
```

---

# 30. 반드시 이혼 단정 금지

금지:

```text
이때 이혼합니다.
이때 헤어집니다.
```

하지만 반대로:

```text
조금 조심하세요.
```

수준으로 약화하는 것도 금지.

---

# 31. BREAKDOWN-A 고객 의미

내부:

```text
Baseline Vulnerability Aggravation
```

고객 표현:

```text
원래 관계 안에 있던 문제가 이 시기에 다시 강하게 살아나면서
관계를 유지하기 어려워지는 흐름
```

---

# 32. BREAKDOWN-B 고객 의미

내부:

```text
Spouse Event + Palace Disruption
```

고객 표현:

```text
평소 관계 자체가 크게 나쁘지 않았더라도
이 시기에는 배우자·연인과 관련된 사건이 크게 움직이면서
관계가 갑자기 흔들릴 수 있는 흐름
```

---

# 33. Path A+B 동시

두 경로가 동시에 confirmed면:

```text
원래 있던 관계 문제와
해당 시기의 강한 관계 변화가 동시에 겹치는 구간입니다.

관계 파탄 위험이 특히 크게 드러날 수 있습니다.
```

새 숫자 등급은 만들지 않는다.

---

# 34. Timing 표현

고객에게 다음 용어 금지:

```text
대운
세운
월운
일진
```

Gregorian projection이 존재하면:

```text
2028년
2029년 3월~5월
2031년 하반기
```

형식 사용.

---

# 35. Gregorian projection이 없는 경우

가짜 날짜를 만들지 않는다.

가능한 범위:

```text
장기적으로
특정 연도 범위
월 단위 확인 불가
```

등 실제 engine 결과에 맞게 표현한다.

---

# 36. Past / Current / Future

결과 페이지에서 구분한다.

```text
지나온 관계 흐름
현재
앞으로의 주요 시기
```

---

# 37. 현재 시기 우선

사용자가 가장 먼저 알아야 할 것은:

```text
현재 관계 상태
가까운 미래의 중요 변화
```

다.

과거 window를 최상단에 놓지 않는다.

---

# 38. 미래 구간 정렬

Gregorian interval이 있으면
시간순으로 정렬한다.

기존 scope hierarchy를 고객에게 보여주지 않는다.

---

# 39. 같은 기간 여러 Fact

같은 기간에:

```text
marriage opportunity
marriage caution
relationship strain
```

이 동시에 있다면 하나를 지우지 않는다.

예:

```text
관계를 공식화하기 쉬운 시기이지만,
동시에 현실적인 부담과 갈등도 커집니다.
```

---

# 40. 구조적 강점 + 미래 위험

가능:

```text
기본적으로는 서로 도움이 되는 관계입니다.

다만 2030년에는 관계를 크게 흔드는 요인이 강해집니다.
```

모순이 아니다.

---

# 41. 구조적으로 어려움 + 회복 시기

가능:

```text
기본적으로는 서로 부딪히는 부분이 많은 관계지만,
2029년에는 대화와 관계 부담이 크게 완화됩니다.
```

---

# 42. 고객 결과에서 근거를 설명한다

내부 명리 용어 대신 생활 원인을 설명한다.

금지:

```text
인성이 왕해서
식상이 약해서
편재가 충을 받아서
```

대신:

```text
두 사람 모두 생각을 속으로 오래 쌓는 편이라
대화가 줄기 쉽습니다.
```

---

# 43. 설명의 구체성

가능하면:

```text
무슨 일이 일어나는가
왜 그런가
누구에게 더 크게 작용하는가
언제 강해지는가
```

네 가지를 답한다.

---

# 44. "좋은 기운" 같은 모호한 표현 금지

금지:

```text
좋은 기운이 들어옵니다.
나쁜 에너지가 있습니다.
운이 좋습니다.
```

대신 실제 결과:

```text
대화가 풀립니다.
결혼 이야기가 구체화되기 쉽습니다.
재정 문제 때문에 관계 부담이 커집니다.
```

처럼 쓴다.

단 실제 C5 Fact가 있을 때만.

---

# 45. 확정 Fact 없는 생활 결과 발명 금지

예:

```text
바람
외도
임신
재혼
법적 분쟁
```

등이 C5에 없다면 Renderer가 만들지 않는다.

---

# 46. 사용자 불안 유발용 과장 금지

Renderer 목적은 정확한 전달이다.

금지:

```text
운명적인 파국
절대 헤어지면 안 됨
천생연분
최악의 궁합
```

단 이것은 결과를 약화하라는 뜻이 아니다.

---

# 47. 결과 강도 표현

엔진 certainty와 effect importance를 구분한다.

예:

```text
confirmed + core structural effect
→ 명확한 문장

confirmed + secondary effect
→ 보조 설명

deferred
→ 고객 핵심 결과에서 제외하거나 별도 근거 부족 처리
```

---

# 48. deferred를 고객에게 남발하지 않는다

내부 deferred Fact를:

```text
판단할 수 없습니다.
```

문장으로 줄줄이 보여주지 않는다.

확정 결과 중심으로 결과를 구성한다.

---

# 49. 결과가 없는 section

해당 section에 confirmed 결과가 없으면:

```text
특별한 위험이 없습니다.
```

를 자동 생성하지 않는다.

그 section을 생략하거나
실제 neutral semantic이 있을 때만 표시한다.

---

# 50. 무료/유료 분리 금지

이번 C6-A는 전체 고객 결과 구조를 만든다.

무료/유료 공개 범위는 후속 Product Layer에서 결정한다.

---

# 51. Korean Customer Result 타입

권장:

```text
CompatibilityCustomerResultKO
```

최소:

```text
headline

overview

strengths
risks

directionalInfluence

personality
communication

relationshipFlow

marriage
relationshipRisks

timeline

provenanceRefs
```

실제 repository convention에 맞춘다.

---

# 52. Renderer 입력

오직:

```text
FinalCompatibilityResult
```

를 받는다.

BirthInput을 다시 읽어 명리 계산하지 않는다.

---

# 53. Deterministic renderer

같은 FinalCompatibilityResult:

```text
same Korean result
```

이어야 한다.

LLM runtime 의존 금지.

---

# 54. 템플릿 조합

기존 Personality Renderer처럼
canonical semantic → deterministic text
구조를 우선한다.

---

# 55. 문장 중복 제거

같은 내부 Fact가 여러 section에 연결돼도
같은 문장을 반복하지 않는다.

---

# 56. 중요도에 따른 배치

고객 결과 상단 우선:

```text
핵심 관계 구조
큰 강점
큰 위험
현재 상태
가까운 중요 시기
```

하위:

```text
세부 작용
보조 관계 변화
먼 미래
```

---

# 57. Structural direction 예시

A→B favorable,
B→A unfavorable이면:

```text
첫 번째 사람은 두 번째 사람에게 실질적인 도움을 주는 작용이 강합니다.

반대로 두 번째 사람은 첫 번째 사람이 원래 가진 문제를 자극하거나,
첫 번째 사람에게 필요한 기능을 약하게 만드는 면이 더 큽니다.
```

이런 방향으로 렌더링한다.

---

# 58. Customer assertion regression

다음 위반을 검사한다.

```text
confirmed → maybe
confirmed → could
confirmed → uncertain

breakdown risk → minor caution
marriage opportunity → generic change

balanced_mixed → neutral
```

Expected:

```text
0
```

---

# 59. Saju terminology regression

고객 KO 결과에서 금지어 검사:

```text
용신
상신
병
구응
격국
대운
세운
월운
일진
비견
겁재
식신
상관
편재
정재
편관
정관
편인
정인
```

Expected:

```text
0
```

단 명칭 자체를 설명하는 별도 교육 화면은 이번 범위가 아니다.

---

# 60. Numeric score regression

금지:

```text
궁합점수
%
점
등급
```

Expected:

```text
0
```

---

# 61. Source fixtures

C1~C5에서 이미 사용한 source fixture를 재사용한다.

최소 다음 유형의 KO 결과를 snapshot 검증한다.

```text
구조적으로 유리 + 성격 마찰
구조적으로 불리 + 관계 회복 시기
balanced_mixed
결혼 기회 + 결혼 주의 동시
breakdown risk
A→B/B→A 비대칭
```

---

# 62. 실제 결과 샘플 생성

검증 결과 문서에 최소 3개의
전체 Korean Customer Result sample을 기록한다.

```text
Sample A — supportive but communication friction
Sample B — marriage opportunity + caution
Sample C — breakdown-risk window
```

이는 제품 문장 품질 검토용이다.

---

# 63. 샘플은 source fixture 기반

새 사주 의미를 발명하지 않는다.

---

# 64. 기존 엔진 isolation

Expected:

```text
C1 changes = 0
C2 changes = 0
C3 changes = 0
C4 changes = 0
C5 changes = 0

Judgment changes = 0
Personality changes = 0
Outcome changes = 0
Event Timing changes = 0
```

---

# 65. 신규 verifier

권장:

```text
scripts/verify-compatibility-renderer-ko-c6a.mjs
```

---

# 66. 필수 verifier 결과

```text
fixtures rendered:

headline:
strength sections:
risk sections:
directional sections:
personality sections:
marriage sections:
timing sections:

certainty downgrade violations:
Saju terminology violations:
numeric score violations:
invented outcome violations:
duplicate sentence violations:
orphan rendered statements:
```

Expected violation:

```text
0
```

---

# 67. TypeScript / Build

```text
npx tsc -b
npm run build
git diff --check
```

PASS.

---

# 68. 결과 파일

생성:

```text
src/docs/codex/compatibility-06a-customer-result-architecture-ko-result.md
```

---

# 69. 성공 판정

다음을 만족하면:

```text
COMPATIBILITY_KO_RENDERER_READY
```

조건:

```text
[ ] C5 의미 변경 0
[ ] Structural / Personality / Lifecycle 모두 고객 결과에 연결

[ ] A→B / B→A 방향 보존
[ ] mixed result 보존
[ ] marriage opportunity/favorable/caution 분리
[ ] breakdown risk 강도 보존

[ ] confirmed certainty downgrade 0
[ ] Saju terminology exposure 0
[ ] numeric score 0
[ ] invented outcome 0

[ ] deterministic renderer
[ ] provenance traceable
[ ] sample results 작성

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 70. 정책 결정 필요

렌더링 중
새 명리 결과가 필요하다는 이유로
판단을 추가하지 않는다.

필요하면:

```text
COMPATIBILITY_C6_POLICY_DECISION_REQUIRED
```

로 중단한다.

---

# 71. 다음 단계

성공 후:

```text
Compatibility-06B
Japanese Renderer

Compatibility-06C
English Renderer
```

순서로 진행한다.

KO에서 확정된 의미 구조를 번역하며
JA/EN 단계에서 새로운 궁합 규칙을 만들지 않는다.