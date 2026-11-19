# FILUNE Codex P4-A
## Multilingual Reading Result Assembly Contract Audit

현재 FILUNE은 다음 파이프라인까지 구현·감사 완료 상태다.

```text
Canonical Chart
↓
Judgment Engine
↓
Natal / Daewoon / Sewoon / Month / Day snapshots
↓
Personality Engine
↓
KO / JA / EN Personality Renderer
```

현재 검증:

```text
P2-A~G PASS
P3-A~F PASS

Multilingual Personality Pipeline COMPLETE

Judgment 35/35 PASS
TypeScript PASS
Build PASS
```

이번 단계에서는 **감정서 전체를 바로 구현하지 않는다.**

먼저 문서 B rev38이 요구하는:

```text
무료 풀이
+
유료 11장
+
개인 질문
```

전체에 대해 현재 코드가 실제로 제공할 수 있는 내부 데이터와
아직 없는 계약을 전수 감사한다.

---

# 1. 최종 목표

이번 작업의 최종 판정은:

```text
READY_FOR_READING_ASSEMBLY_CORE
```

또는:

```text
READING_ASSEMBLY_BLOCKED
```

이다.

단 `BLOCKED`는 실패라는 뜻이 아니라,
**아직 source 기반 규칙이 구현되지 않은 영역을 정확히 식별했다**는 뜻일 수 있다.

---

# 2. 절대 원칙

이번 작업에서는 새로운 명리 규칙을 만들지 않는다.

특히 다음을 임의로 만들지 않는다.

```text
직업 적성 판정
재물 판정
연애/결혼 판정
건강 판정
가족 판정
성공 판정
행동 권고
```

현재 authority/master/engine에 실제 근거와 계산 계약이 있는 것만 사용한다.

---

# 3. 기준 문서

최우선:

```text
src/docs/source/authority/B_rev38.md
src/docs/rules/authority/mapping-B-rendering.md
```

현재 localization:

```text
src/docs/source/localization/
FILUNE-ja-en-terminology-rendering-standard.md

src/docs/rules/authority/mapping-localization.md
```

현행 구조 규칙:

```text
src/docs/rules/master/01-pattern-master.md
src/docs/rules/master/02-peer-rob-yangblade-master.md
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/07-pattern-effect-policy-audit.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/10-implementation-audit.md
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

---

# 4. 문서 B의 역할

B는 판단 엔진이 아니다.

따라서:

```text
B chapter
→ 새로운 명리 판단
```

을 만들면 안 된다.

B는:

```text
이미 계산된 내부 결과
→ 어떤 장에
→ 어느 깊이로
→ 어떤 순서로
→ 어떤 고객 언어로
보여 줄지
```

정한다.

---

# 5. 전체 Assembly 구조

검토할 구조:

```text
CanonicalChart
+
JudgmentResult
+
PersonalityResult
+
Luck snapshots
+
known customer context
↓
ReadingAssembly
↓
Section / Chapter data
↓
Locale Renderer
```

이번 단계에서는 이 구조가 가능한지 감사한다.

---

# 6. Renderer와 Assembly 분리

반드시 다음을 구분한다.

```text
Assembly
= 무엇을 어느 장에 넣을지 결정

Renderer
= 그 의미를 특정 언어의 고객 문장으로 표현
```

금지:

```text
KO chapter assembler
JA chapter assembler
EN chapter assembler
```

Assembly는 언어 공통이어야 한다.

---

# 7. 권장 장기 구조

```text
Judgment / Personality
↓
Language-neutral ReadingAssembly
↓
├─ KO Reading Renderer
├─ JA Reading Renderer
└─ EN Reading Renderer
```

이번 감사에서 이 구조가 가능한지 확인한다.

---

# 8. 무료/유료 방향 동일성

W-99 계약을 유지한다.

```text
무료
유료
개인 질문
```

모두 동일한 내부 판정에서 출발해야 한다.

금지:

```text
무료용 별도 판정
유료용 별도 판정
```

차이는:

```text
분량
근거 깊이
조건
시기
상호작용
```

이다.

---

# 9. Product / Access와 Rule 분리

무료/유료 노출 범위는:

```text
Product / Access policy
```

이다.

명리 Rule Registry에 새 판정 규칙으로 넣지 않는다.

이번 P4-A에서는:

```text
무엇이 free/premium에 배치되는지
```

는 B 계약으로 기록하되,
결제·가격·구독·권한 시스템은 구현하지 않는다.

---

# 10. B-0-3 전체 구조 감사

다음 순서를 변경하지 않는다.

## 무료

```text
F-① 태어난 순간
F-② 가장 잘 드러나는 특징 세 가지
F-③ 성격과 사람을 대하는 방식
F-④ 타고난 강점과 반복되는 과제
F-링크 여기서 더 들어가면
```

## 유료

```text
CH-1 타고난 운명의 설계도
CH-2 나라는 사람의 본모습
CH-3 타고난 강점과 넘어야 할 과제
CH-4 일과 성공이 열리는 방향
CH-5 돈이 들어오고 머무는 흐름
CH-6 사랑과 평생의 인연
CH-7 몸과 건강의 흐름
CH-8 인생의 큰 운명 지도
CH-9 올해와 내년에 다가오는 운
CH-10 앞으로의 12개월
CH-11 마지막 안내
CH-Q 개인 질문
```

---

# 11. 각 Section 감사 상태

각 절/장마다 다음 중 하나로 분류한다.

```text
READY
PARTIAL
SOURCE_GAP
ENGINE_GAP
RENDERER_GAP
OUT_OF_SCOPE
```

정의:

### READY

현재 engine output만으로 B의 필수 내용을 구성 가능.

### PARTIAL

핵심 일부는 가능하지만 B 필수 항목 전체는 불가능.

### SOURCE_GAP

원자료/authority 자체에서 확정 계약 부족.

### ENGINE_GAP

규칙은 존재하지만 코드 계산/타입이 없음.

### RENDERER_GAP

내부 데이터는 있으나 고객 표현 layer가 없음.

### OUT_OF_SCOPE

현재 서비스가 의도적으로 제공하지 않는 내용.

---

# 12. 감사표 필수

다음 표를 완성한다.

| ID | 절/장 | 필요한 내부 정보 | 현재 source | 현재 engine | 현재 renderer | 상태 |
|---|---|---|---|---|---|---|
| F-① | 태어난 순간 | | | | | |
| F-② | 특징 세 가지 | | | | | |
| F-③ | 성격 | | | | | |
| F-④ | 강점·과제 | | | | | |
| F-link | 유료 안내 | | | | | |
| CH-1 | 설계도 | | | | | |
| CH-2 | 본모습 | | | | | |
| CH-3 | 강점·과제 | | | | | |
| CH-4 | 일 | | | | | |
| CH-5 | 돈 | | | | | |
| CH-6 | 관계 | | | | | |
| CH-7 | 건강 | | | | | |
| CH-8 | 대운 | | | | | |
| CH-9 | 세운 | | | | | |
| CH-10 | 월운 | | | | | |
| CH-11 | 종합 | | | | | |
| CH-Q | 개인질문 | | | | | |

---

# 13. F-① 태어난 순간

감사 대상:

```text
CanonicalChart
birth metadata
solar-term boundary data
Four Pillars
season/month-command context
nature metaphor source
unknown-hour state
```

현재 코드가 실제로 제공하는지 확인한다.

---

# 14. F-①에서 Personality 사용 금지 아님

필요한 경우 기본 일간 nature representation을 사용할 수 있으나
F-①에서 Personality 전체를 먼저 풀어 쓰지 않는다.

B의 chapter responsibility를 따른다.

---

# 15. F-② 핵심 구조 세 가지

매우 중요.

현재 engine에서:

```text
PatternContext
YongShen
SangShen
Byeong
GuEung
major RelationFacts
ActualStructuralFunction
```

을 사용해 **“핵심 구조 3가지”를 결정하는 공식 계약이 실제 존재하는지** 확인한다.

만약:

```text
어떤 세 가지를 고를지
우선순위 계약
```

이 없다면 임의 선정 금지.

상태:

```text
SOURCE_GAP
```

또는 `ENGINE_GAP`으로 기록.

숫자 score를 만들어 3개를 고르지 않는다.

---

# 16. F-③ 성격

현재 Multilingual Personality Pipeline을 직접 재사용한다.

Expected:

```text
READY
```

후보.

단 B 무료 성격의 네 모습과
현재 Personality Renderer output shape가 정확히 대응하는지 확인한다.

---

# 17. F-④ 강점 3 / 과제 3

현재 Personality Engine에 strength / caution 정보가 존재하더라도:

```text
정확히 3개를 고르는 계약
```

이 있는지 별도로 확인한다.

금지:

```text
첫 3개
배열 순서
trait count
임의 ranking
```

으로 선택.

3개 선정 근거가 없으면 `SOURCE_GAP`.

---

# 18. CH-1 설계도

필요:

```text
Pattern
YongShen
SangShen
Byeong
GuEung
Relations
distance/contact if implemented
natal structure
current Daewoon
```

현재 구조 engine이 실제 제공하는 것과 없는 것을 분리한다.

---

# 19. 거리·닿음

B가 요구하는:

```text
글자 사이의 거리와 닿음
```

이 현재 engine data model에 존재하는지 확인한다.

없다면 새 rule을 만들지 않는다.

---

# 20. 반가운/부담이 되는 기운

고객용 표현은 가능하더라도
그 분류가 현재 engine의:

```text
ActualStructuralFunction
PatternEffectPolicy
```

에서 deterministic하게 도출 가능한지 확인한다.

금지:

```text
TenGod intrinsic favorable/unfavorable
```

로 대체.

---

# 21. CH-2 성격 세부 7면

현재 Personality Engine은 별도 구현되어 있다.

B의 7면:

```text
생각
책임감
표현
감정
결정
사람을 대하는 방식
혼자 있을 때 / 사회 속
```

과 현재 trait taxonomy 간 coverage를 전수 비교한다.

---

# 22. 7면 중 source gap

근거가 약한 영역을 일반론으로 채우지 않는다.

현재 Personality source에 없는 영역은:

```text
SOURCE_GAP
```

으로 기록한다.

---

# 23. CH-3 강점과 과제

다시 F-④와 같은 문장을 재사용하면 안 된다.

B-6 기준:

```text
무료 = 결론
CH-3 = 작동 방식 / 쓰는 법
```

이 가능한 내부 데이터가 실제 있는지 확인한다.

---

# 24. 행동 권고 주의

`쓰는 법`을 구현하기 위해
임의의 자기계발 조언을 만들어서는 안 된다.

authority/source가 지원하는 범위만 허용.

---

# 25. CH-4 일과 성공

BLOCKING 감사 영역.

다음을 현재 코드가 실제 계산하는지 확인:

```text
work style
organization vs independent work
conditions for performance
current direction
work-related months
```

Personality trait를 곧바로 직업 적성으로 변환하지 않는다.

---

# 26. 직업 추천 생성 금지

예:

```text
독립적
→ 창업가

분석적
→ 회계사

표현력
→ 마케터
```

같은 일반론 추론 금지.

B/source/engine 근거가 없으면 gap.

---

# 27. CH-5 돈

현재 engine에 다음 semantic output이 있는지 확인:

```text
money inflow
money retention
harmful money conditions
contract/business/spending timing
```

단순 財星 존재만으로 돈 판정하지 않는다.

---

# 28. 투자 판단 금지

Assembly가:

```text
buy
sell
investment asset
stock
crypto
```

판정을 만들지 않는다.

---

# 29. CH-6 사랑과 인연

현재 engine이 실제로 지원하는 범위를 분리한다.

특히:

```text
Personality relationship style
palace context
branch relation signals
current luck signals
```

과:

```text
배우자복
결혼 확정
좋은 인연 확정
궁합
```

을 구분한다.

후자는 근거 없이 만들지 않는다.

---

# 30. 사용자 생활상태

고객이 제공하지 않은:

```text
결혼 여부
배우자
자녀
직장
사업 여부
```

를 Assembly에서 추정하지 않는다.

---

# 31. CH-7 건강

가장 엄격하게 감사한다.

현재 FILUNE 정책상:

```text
질병 예측 금지
```

이다.

B의 건강 장 요구와
현재 source/master/engine 계약이 실제로 어디까지 일치하는지 확인한다.

---

# 32. 건강 gap 숨기지 않기

현재 엔진에 안전하게 제공할 건강 semantic data가 없다면:

```text
READY
```

로 판정하지 않는다.

`SOURCE_GAP`, `ENGINE_GAP`, `OUT_OF_SCOPE` 중 실제 상태로 기록한다.

---

# 33. 12운성으로 건강 생성 금지

12운성 supporting evidence를
질병·장기·신체 결과로 확대하지 않는다.

---

# 34. CH-8 대운 지도

현재 Luck Engine의:

```text
Daewoon snapshots
PatternContext
runtime
roles
ActualStructuralFunction
LuckEffect
```

로 어느 범위까지 가능한지 확인.

---

# 35. 과거 대운 사건 생성 금지

과거 대운 데이터를:

```text
이직했다
결혼했다
실패했다
성공했다
```

로 사건화하지 않는다.

구조적 흐름만 표현.

---

# 36. CH-9 올해와 내년

현재 Sewoon 계산이:

```text
current year
next year
```

둘 다 생성 가능한지 확인한다.

같은 판정은 모든 장에서 동일해야 한다.

---

# 37. CH-10 12개월

현재 Month Engine이:

```text
12 solar-term months
```

전체를 안정적으로 계산하는지 확인한다.

필수:

```text
same month
→ same internal judgment
→ 모든 chapter에서 동일
```

---

# 38. 월별 영역 분기

CH-4/5/6/7이 동일 월 데이터를 각 영역으로 사용하는 경우:

```text
전체 월 판단
≠ 분야별 결과 자동 생성
```

이다.

분야별 mapping contract가 실제 존재하는지 확인한다.

없으면 gap.

---

# 39. CH-11 종합

B가 요구하는:

```text
한 문장
기억할 셋
12개월 리듬
현재 10년 쓰는 법
마지막 한마디
```

중 deterministic selection contract가 있는지 감사한다.

---

# 40. “기억할 셋” 선정

금지:

```text
첫 3개
가장 긴 3개
score 상위 3개
```

source contract 없으면 gap.

---

# 41. CH-Q 개인질문

현재 단계에서는 범용 Q&A 엔진을 만들지 않는다.

감사 대상:

```text
질문 → 기존 내부 판정 선택
```

계약이 존재하는지 여부만 확인한다.

---

# 42. 질문으로 판정 변경 금지

질문에 맞추기 위해:

```text
같은 month judgment
```

의 방향을 바꾸면 안 된다.

---

# 43. B-6 중복 지도

감정서 조립 계층의 핵심 계약으로 취급한다.

한 판단이 여러 장에 등장하면:

```text
first occurrence
→ conclusion

later occurrence
→ evidence / condition / timing / application
```

중 실제 새 정보만 추가.

---

# 44. 동일 문장 중복 금지

Assembly 단계에서:

```text
same semantic fact
same purpose
same wording role
```

가 여러 chapter에 그대로 복제되지 않도록 계약을 설계한다.

---

# 45. semantic ID 기반 중복 관리

가능하면 문장 문자열이 아니라:

```text
sourceFactId
sourceEffectId
sourceRoleId
sourcePersonalityFactId
semanticKey
```

등 내부 provenance 기반으로 중복을 관리한다.

---

# 46. 문자열 기반 dedupe 금지

금지:

```ts
if (sentence === previousSentence)
```

만으로 중복 판단.

언어별 문장이 달라도 같은 의미일 수 있다.

---

# 47. Reading Semantic Unit

감사 후 적절하다면 다음과 같은 언어중립 중간 타입을 제안한다.

예:

```ts
interface ReadingSemanticUnit {
  id: string;
  topic: ReadingTopic;
  meaning: ReadingMeaning;
  certainty: ReadingCertainty;

  scope:
    | "natal"
    | "daewoon"
    | "sewoon"
    | "month"
    | "day";

  sourceFactIds: string[];
  sourceRoleIds: string[];
  sourceEffectIds: string[];
  sourcePersonalityFactIds: string[];

  firstSectionId?: string;
  allowedSectionIds: string[];

  assemblyStatus:
    | "ready"
    | "partial"
    | "deferred";
}
```

실제 구현은 이번 단계에서 하지 않는다.

---

# 48. Topic 후보

source가 지원하는 범위에서만 검토:

```text
structure
personality
strength
challenge
work
money
relationship
health
daewoon
year
month
summary
```

Topic 존재가 곧 해당 분야 판정 가능을 뜻하지 않는다.

---

# 49. ChapterAssemblyPlan

제안 가능:

```ts
interface ChapterAssemblyPlan {
  chapterId: string;
  requiredTopics: ReadingTopic[];
  optionalTopics: ReadingTopic[];

  requiredScopes: Scope[];

  firstOccurrenceRules: ...
  repetitionRules: ...

  readiness:
    | "ready"
    | "partial"
    | "blocked";

  gaps: AssemblyGap[];
}
```

이번 단계에서는 타입 설계 문서 수준만.

---

# 50. 언어중립성

ReadingAssembly는:

```text
ko text
ja text
en text
```

를 저장하지 않는 것을 우선한다.

내부 semantic data만 저장.

---

# 51. Multilingual Renderer 구조

장기 목표:

```text
ReadingAssembly
↓
├─ renderReadingKo()
├─ renderReadingJa()
└─ renderReadingEn()
```

Personality Renderer와 같은 원칙.

---

# 52. Personality Renderer 재사용

F-③ / CH-2에서 기존:

```text
renderPersonalityKo
renderPersonalityJa
renderPersonalityEn
```

의 고객 문장을 그대로 Assembly에 박는 구조가 적절한지 감사한다.

가능하면 더 상위에서는:

```text
PersonalityResult / semantic block
```

을 먼저 조립하고 locale renderer가 최종 문장을 만드는 구조를 검토한다.

---

# 53. 이중 렌더링 금지

금지:

```text
Personality KO text
→ 전체 Reading JA 번역
```

모든 언어는 같은 semantic assembly에서 직접 생성되어야 한다.

---

# 54. 무료와 유료

무료는 원국만 다룬다는 B 계약을 유지한다.

무료에:

```text
Daewoon
Sewoon
Month
Day
```

의 시기 해석을 넣지 않는다.

---

# 55. 단, 현재 시점 UI와 구분

무료 감정서 내부 내용과
웹 UI에서 별도 제공하는 현재 정보가 있다면
동일 개념으로 합치지 않는다.

이번 감사에서는 B 감정서 계약만 다룬다.

---

# 56. Premium 범위

유료는 B에 정해진 범위만 사용한다.

현재 engine이 Day까지 지원한다고 해서
B 유료 11장에 일진을 임의 추가하지 않는다.

---

# 57. Day Luck

일진 계산 기능은 존재하더라도
B 감정서 장 구성에서 사용할 근거가 있는지 확인한다.

없다면:

```text
engine capability
≠ product chapter requirement
```

로 기록한다.

---

# 58. Product capability와 Engine capability 분리

반드시 다음을 구분한다.

```text
can calculate
can assemble
should display in this product
```

세 가지는 다르다.

---

# 59. 고객 context

향후 Assembly Input에서 사용자 제공 정보가 필요하다면
다음처럼 명시한다.

```ts
interface CustomerContext {
  name?: string;
  knownFacts?: ...
  question?: ...
}
```

이번 단계에서 생활 사실을 자동 추론하지 않는다.

---

# 60. Unknown input

출생 시각 미상, 경계 등 uncertainty를
Assembly가 확정값으로 바꾸지 않는다.

---

# 61. certainty 전달

Assembly는 다음 상태를 보존해야 한다.

```text
confirmed
contextual
conditional
deferred
unknown
unsupported
```

Renderer가 이를 변경하지 않는다.

---

# 62. Structural Role 내부명

Assembly 내부 provenance에는:

```text
YongShen
SangShen
Byeong
GuEung
```

역할이 존재할 수 있다.

고객용 Reading Renderer에서는 내부명을 숨긴다.

---

# 63. ActualStructuralFunction 우선

고객 의미를 조립할 때:

```text
TenGod intrinsic polarity
```

보다:

```text
ActualStructuralFunction
PatternEffectPolicy
Role current state
```

를 따른다.

---

# 64. 결과와 체감 분리

구조 판정과:

```text
subjective experience
```

를 같은 것으로 만들지 않는다.

현재 experience model이 없으면 별도 gap.

---

# 65. Outcome mapping 감사

현재 코드에서:

```text
structural effect
→ work/money/relationship/health outcome
```

을 연결하는 공식 mapping이 있는지 전수 조사한다.

없으면 없는 것으로 기록.

이것이 P4-A의 핵심 감사 중 하나다.

---

# 66. 새 Outcome Mapping 생성 금지

이번 작업에서:

```text
TenGod → career
TenGod → wealth
TenGod → relationship
TenGod → health
```

새 규칙을 작성하지 않는다.

---

# 67. Outcome layer 판정

감사 결과에 따라 다음 중 하나로 결론:

```text
OUTCOME_LAYER_READY
OUTCOME_LAYER_PARTIAL
OUTCOME_LAYER_NOT_IMPLEMENTED
```

---

# 68. Assembly core와 Outcome layer 분리

예상 가능:

```text
Assembly Core READY
but
Work/Money/Relationship/Health semantic layer NOT READY
```

이 경우 전체를 실패로 보지 말고 분리해서 보고한다.

---

# 69. 현재 구현 우선순위 도출

감사 후 필요한 다음 구현을 정확히 순서화한다.

예:

```text
P4-B Reading Semantic Core
P4-C Structural Summary
P4-D Outcome Mapping
...
```

단 실제 gap 결과를 보고 결정한다.

미리 결론을 강제하지 않는다.

---

# 70. 코드 수정 금지

이번 P4-A는 감사/설계 단계다.

원칙:

```text
src/lib/
```

코드 수정 0.

---

# 71. 문서 산출물

감사가 성공적으로 구조화되면 다음 master 초안을 생성한다.

```text
src/docs/rules/master/
13-reading-assembly-spec.md
```

단 이 문서는:

```text
새 명리 규칙
```

이 아니라:

```text
기존 결과의 조립 계약
```

만 담아야 한다.

---

# 72. 13-reading-assembly-spec 필수 내용

최소:

```text
1. 목적
2. 입력
3. Output hierarchy
4. Free/Premium structure
5. Chapter registry
6. Semantic Unit
7. Provenance
8. Certainty
9. Deduplication
10. Scope handling
11. Locale separation
12. Product/Engine separation
13. Gap policy
14. Prohibited inference
```

---

# 73. Gap은 master에 숨기지 않음

아직 구현되지 않은 것은:

```text
TODO
```

로 얼버무리지 않는다.

명시적으로:

```text
SOURCE_GAP
ENGINE_GAP
OUTCOME_LAYER_NOT_IMPLEMENTED
```

등으로 기록한다.

---

# 74. Source provenance

각 chapter 계약에는 가능하면:

```text
B section
W rule
current master
current engine output
```

을 연결한다.

---

# 75. 기존 코드 의존성 감사

최소 다음을 조사:

```text
src/lib/judgment/
src/lib/personality/
src/lib/*Reading*
```

현재 실제 공개 entrypoint를 확인한다.

---

# 76. 기존 Reading 관련 코드

이미:

```text
reading
result
report
interpretation
assembly
renderer
```

성격의 코드가 있다면
중복 구현 후보로 기록한다.

---

# 77. 신규 시스템을 만들기 전에 재사용

현재 type/result가 충분하면
새 Reading 모델을 불필요하게 만들지 않는다.

---

# 78. 역방향 의존성

금지:

```text
Judgment → ReadingAssembly
Personality → ReadingAssembly
```

하위 engine이 상위 report layer를 import하면 안 된다.

Expected:

```text
ReadingAssembly
→ Judgment
→ Personality results read-only
```

---

# 79. Renderer 의존성

권장:

```text
Reading Renderer
→ ReadingAssembly
```

금지:

```text
Reading Renderer
→ Judgment 재계산
```

---

# 80. Deterministic assembly

동일 내부 결과 + 동일 customer context이면
동일 Assembly가 생성되어야 한다.

LLM 판단으로 chapter selection을 하지 않는다.

---

# 81. LLM 사용 여부

이번 단계에서 LLM prose generation architecture를 추가하지 않는다.

현재 deterministic renderer 원칙을 유지한다.

향후 별도 검토 가능.

---

# 82. B-6 중복 테스트 설계

최소 사례:

```text
Personality conclusion
→ F-③ first occurrence

same meaning
→ CH-2

Expected:
CH-2는 동일 결론 반복이 아니라
조건/대상/상황을 추가
```

---

# 83. Month consistency 테스트 설계

같은 month가:

```text
CH-4
CH-5
CH-6
CH-7
CH-10
CH-Q
```

여러 곳에 등장할 수 있다.

Underlying month structural judgment는 동일해야 한다.

분야별 semantic mapping만 다를 수 있다.

---

# 84. Premium depth test

무료와 유료가 같은 semantic conclusion을 사용할 경우:

```text
direction same
certainty same
```

이어야 한다.

유료에서만 방향이 뒤집히면 FAIL.

---

# 85. Multilingual parity 설계

향후 Reading Renderer가 완성되면:

```text
KO
JA
EN
```

간:

```text
chapter IDs
semantic unit IDs
provenance
certainty
scope
```

가 같아야 한다.

---

# 86. 현재 Personality multilingual 결과 재사용

P3-F 결과:

```text
348/348
KO/JA/EN semantic parity
```

를 깨지 않는다.

---

# 87. 감사 스크립트

이번 단계는 코드 검증보다 구조 감사가 핵심이므로
필요하면 문서 전용 audit script를 만들 수 있다.

단 application code는 수정하지 않는다.

권장 이름:

```text
scripts/audit-reading-assembly-contract-p4a.mjs
```

필수는 아니다.

---

# 88. 결과 파일

```text
src/docs/codex/
p4a-reading-assembly-contract-audit-result.md
```

---

# 89. 최종 보고 형식

## A. 전체 판정

```text
READY_FOR_READING_ASSEMBLY_CORE
```

또는:

```text
READING_ASSEMBLY_BLOCKED
```

---

## B. Chapter Coverage

| Chapter | Source | Engine | Renderer | Overall |
|---|---|---|---|---|
| F-① | | | | |
| F-② | | | | |
| F-③ | | | | |
| F-④ | | | | |
| F-Link | | | | |
| CH-1 | | | | |
| CH-2 | | | | |
| CH-3 | | | | |
| CH-4 | | | | |
| CH-5 | | | | |
| CH-6 | | | | |
| CH-7 | | | | |
| CH-8 | | | | |
| CH-9 | | | | |
| CH-10 | | | | |
| CH-11 | | | | |
| CH-Q | | | | |

---

## C. Engine Capabilities

```text
Canonical:
Natal Judgment:
Daewoon:
Sewoon:
Month:
Day:
Personality:
Structural Roles:
Runtime:
History:
```

---

## D. Missing Semantic Layers

```text
Structural summary:
Top-3 selection:
Strength/challenge selection:
Work:
Money:
Relationship:
Health:
Summary:
Question routing:
```

각각:

```text
READY
PARTIAL
SOURCE_GAP
ENGINE_GAP
NOT_IMPLEMENTED
```

---

## E. Deduplication Contract

```text
semantic ID:
first occurrence:
later occurrence:
cross-chapter provenance:
string-based dedupe:
```

Expected:

```text
string-based dedupe = no
```

---

## F. Product / Engine Separation

```text
Free access logic:
Premium access logic:
Judgment direction:
Day luck product usage:
```

---

## G. Multilingual Architecture

```text
Assembly count:
KO assembly:
JA assembly:
EN assembly:

Locale renderer dependency:
```

Expected:

```text
Assembly count = 1
language-specific assembly = no
```

---

## H. Dependency Audit

```text
Judgment → Assembly:
Personality → Assembly:
Assembly → Judgment result:
Assembly → Personality result:
Renderer → Engine recalculation:
```

---

## I. New Rules Invented

```text
SOURCE_INFERENCE:
FILUNE_OVERRIDE:
UNSUPPORTED_NEW_RULE:
```

Expected:

```text
UNSUPPORTED_NEW_RULE = 0
```

---

## J. Next Implementation Order

실제 감사 결과만 근거로 다음 작업을 순서화한다.

각 항목:

```text
Task
Reason
Blocking dependency
Source status
```

---

## K. 남은 상태

```text
FAIL:
PARTIAL:
SOURCE_GAP:
ENGINE_GAP:
RENDERER_GAP:
NOT_IMPLEMENTED:
DEFERRED:
```

---

# 90. 종료 판정 기준

다음 조건이면:

```text
READY_FOR_READING_ASSEMBLY_CORE
```

판정 가능.

```text
[ ] 공통 language-neutral Assembly 구조 정의 가능
[ ] B chapter order 고정
[ ] Product/Engine 분리
[ ] W-99 방향 일치 계약 가능
[ ] B-6 semantic dedupe 계약 가능
[ ] Judgment/Personality 결과 read-only 사용
[ ] 언어별 별도 Assembly 없음
[ ] 새 명리 규칙 발명 0
[ ] missing outcome layer 명확히 식별
[ ] gaps를 숨기지 않음
```

모든 CH-4~7이 READY일 필요는 없다.

Assembly Core와 Domain Outcome Layer를 분리할 수 있으면
Assembly Core는 먼저 진행할 수 있다.

---

# 91. 중요한 판정 원칙

이번 감사에서:

```text
CH-4 Work
CH-5 Money
CH-6 Relationship
CH-7 Health
```

가 미완성이라고 해서
기존 Judgment/Personality가 실패한 것은 아니다.

이를:

```text
Outcome Semantic Layer Gap
```

으로 별도 분류한다.

---

# 92. 다음 단계

P4-A 결과가:

```text
READY_FOR_READING_ASSEMBLY_CORE
```

이면 다음은 감사 결과에 따라
가장 먼저 필요한 조립 core를 구현한다.

예상 후보:

```text
P4-B Language-neutral Reading Assembly Core
```

하지만 P4-A 결과에서 더 선행해야 할 semantic layer가 발견되면
그 순서를 따른다.

P4-A 전에 다음 구현을 임의로 확정하지 않는다.