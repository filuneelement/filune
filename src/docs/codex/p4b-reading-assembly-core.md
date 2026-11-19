# FILUNE Codex P4-B
## Language-neutral Reading Assembly Core 구현

P4-A Reading Assembly Contract Audit가 완료되었다.

현재 판정:

```text
READY_FOR_READING_ASSEMBLY_CORE
OUTCOME_LAYER_NOT_IMPLEMENTED
```

P4-A에서 확인된 핵심 상태:

```text
- 공통 Assembly Core는 구현 가능
- B rev38의 무료 5개 항목 + 유료 11장 + 개인 질문까지 총 17개 항목 감사 완료
- Canonical / Judgment / Personality 결과는 read-only 입력으로 사용 가능

보류:
- 12개월 최종 천간·지지 종합 판정
- 핵심 구조 3개 선정
- 강점 3개 / 과제 3개 선정
- 기억할 3개 선정

미구현:
- Work Outcome
- Money Outcome
- Relationship Outcome
- Health Outcome
- 개인 질문 routing
```

이번 작업의 목적은 위 미완성 영역을 채우는 것이 아니다.

**이미 존재하는 내부 결과를 언어중립적으로 감정서 구조에 조립하는 Core만 구현한다.**

---

# 1. 절대 아키텍처

최종 방향:

```text
CanonicalChart
        +
JudgmentResult
        +
PersonalityResult
        +
Luck Scope Results
        +
CustomerContext
        ↓
Reading Assembly Core
        ↓
Language-neutral ReadingAssembly
        ↓
 ┌──────────┬──────────┬──────────┐
 │ KO       │ JA       │ EN       │
 │ Renderer │ Renderer │ Renderer │
 └──────────┴──────────┴──────────┘
```

Assembly는 언어 공통 **1개**다.

금지:

```text
KoreanReadingAssembly
JapaneseReadingAssembly
EnglishReadingAssembly
```

---

# 2. 이번 단계에서 하지 않을 것

다음은 구현하지 않는다.

```text
Work Outcome Engine
Money Outcome Engine
Relationship Outcome Engine
Health Outcome Engine
Question Answer Engine
```

또한 다음 선정 규칙도 만들지 않는다.

```text
핵심 구조 Top 3
강점 Top 3
과제 Top 3
기억할 Top 3
best month
worst month
```

---

# 3. 신규 명리 규칙 금지

이번 작업에서 다음 추론을 새로 만들지 않는다.

```text
TenGod → 직업
TenGod → 돈
TenGod → 연애
TenGod → 건강

Personality trait → 직업 추천
Personality trait → 재물 능력
Personality trait → 배우자 유형
```

`SOURCE_INFERENCE`를 새 판정 규칙으로 승격하지 않는다.

---

# 4. 기준 문서

반드시 먼저 읽는다.

```text
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/codex/p4a-reading-assembly-contract-audit-result.md

src/docs/source/authority/B_rev38.md
src/docs/rules/authority/mapping-B-rendering.md
src/docs/rules/authority/mapping-localization.md
```

그리고 현재 코드:

```text
src/lib/judgment/
src/lib/personality/
```

의 실제 공개 결과 타입과 entrypoint를 확인한다.

문서의 예시 타입보다 현재 코드 계약을 우선하되,
새 의미를 만들지는 않는다.

---

# 5. Reading Assembly는 판단 엔진이 아니다

Assembly가 할 수 있는 것:

```text
select existing result
reference existing result
group existing result
route existing result
preserve certainty
preserve scope
preserve provenance
manage repetition
record gaps
```

Assembly가 하면 안 되는 것:

```text
new judgment
new favorable/unfavorable decision
new strength score
new ranking
new causal inference
new life prediction
```

---

# 6. 권장 코드 위치

저장소 구조를 확인한 뒤 충돌이 없다면:

```text
src/lib/reading/
├─ types.ts
├─ chapterRegistry.ts
├─ semanticUnit.ts
├─ deduplication.ts
├─ assembleReading.ts
├─ gaps.ts
└─ index.ts
```

를 우선 검토한다.

기존 reading/report/result namespace가 존재하면
새 폴더를 만들기 전에 재사용 여부를 판단한다.

결과 보고서에 실제 선택 경로를 기록한다.

---

# 7. 핵심 결과 타입

권장 개념:

```ts
interface ReadingAssembly {
  version: string;

  source: {
    canonical: boolean;
    judgment: boolean;
    personality: boolean;
  };

  chapters: ReadingChapterAssembly[];

  semanticUnits: ReadingSemanticUnit[];

  gaps: ReadingAssemblyGap[];
}
```

실제 프로젝트 타입에 맞게 조정 가능.

---

# 8. ReadingSemanticUnit

최소 다음 의미를 표현할 수 있어야 한다.

```ts
interface ReadingSemanticUnit {
  id: string;

  topic: ReadingTopic;

  scope:
    | "natal"
    | "daewoon"
    | "sewoon"
    | "month"
    | "day";

  certainty:
    | "confirmed"
    | "contextual"
    | "conditional"
    | "deferred"
    | "unknown"
    | "unsupported";

  semanticKey: string;

  sourceFactIds: string[];
  sourceRoleIds: string[];
  sourceEffectIds: string[];
  sourcePersonalityFactIds: string[];

  allowedChapterIds: string[];

  status:
    | "ready"
    | "partial"
    | "deferred";
}
```

필드명은 현재 코드와 맞게 조정 가능.

핵심은:

```text
언어 문자열이 아니라
semantic identity + provenance
```

를 저장하는 것이다.

---

# 9. 고객 문장 저장 금지

ReadingAssembly Core 내부에는 원칙적으로:

```text
한국어 완성문
일본어 완성문
영어 완성문
```

을 저장하지 않는다.

금지:

```ts
textKo
textJa
textEn
```

를 Assembly semantic source로 사용하는 구조.

---

# 10. Personality 문장 재사용 방식

F-③ / CH-2 때문에 기존:

```text
renderPersonalityKo()
renderPersonalityJa()
renderPersonalityEn()
```

을 Assembly Core가 호출하면 안 된다.

Assembly는:

```text
PersonalityResult
PersonalityFact
PersonalityConflict
StructuralRoleModifier
```

등 언어중립 결과를 참조한다.

최종 언어 Renderer 단계에서 문장을 만든다.

---

# 11. Judgment 재계산 금지

Reading Assembly가:

```text
runInternalReading()
```

같은 판정 pipeline을 내부에서 다시 실행하지 않도록 한다.

입력으로 이미 계산된 결과를 받는다.

---

# 12. 권장 Assembly Input

개념적으로:

```ts
interface ReadingAssemblyInput {
  chart: CanonicalChart;

  judgment: InternalReadingResult;

  personality: NatalPersonalityResult | CurrentPersonalityResult;

  customerContext?: CustomerContext;

  productScope:
    | "free"
    | "premium";
}
```

실제 기존 타입명에 맞게 조정한다.

---

# 13. CustomerContext

최소한:

```ts
interface CustomerContext {
  name?: string;
  question?: string;
  knownFacts?: ...
}
```

정도의 확장 지점은 둘 수 있다.

그러나 이번 단계에서:

```text
직업
결혼 여부
배우자
자녀
사업 여부
건강 상태
```

등을 추론하지 않는다.

---

# 14. B 장 Registry 고정

Chapter Registry에 다음 17개 항목을 고정한다.

## Free

```text
F-01 태어난 순간
F-02 가장 잘 드러나는 특징 세 가지
F-03 성격과 사람을 대하는 방식
F-04 타고난 강점과 반복되는 과제
F-LINK 여기서 더 들어가면
```

## Premium

```text
CH-01 타고난 운명의 설계도
CH-02 나라는 사람의 본모습
CH-03 타고난 강점과 넘어야 할 과제
CH-04 일과 성공이 열리는 방향
CH-05 돈이 들어오고 머무는 흐름
CH-06 사랑과 평생의 인연
CH-07 몸과 건강의 흐름
CH-08 인생의 큰 운명 지도
CH-09 올해와 내년에 다가오는 운
CH-10 앞으로의 12개월
CH-11 마지막 안내
CH-Q 개인 질문
```

장 순서를 변경하지 않는다.

---

# 15. Chapter Registry와 구현 readiness 분리

Registry에 장이 존재한다고 해서
그 장이 현재 완성 가능하다는 뜻은 아니다.

각 chapter는 최소:

```ts
readiness:
  | "ready"
  | "partial"
  | "source_gap"
  | "engine_gap"
  | "outcome_not_implemented"
```

를 표현할 수 있어야 한다.

---

# 16. Outcome Layer 미구현을 그대로 표현

다음 장을 억지로 READY로 만들지 않는다.

```text
CH-04 Work
CH-05 Money
CH-06 Relationship
CH-07 Health
CH-Q Question
```

P4-A 결과를 기준으로 실제 readiness를 설정한다.

---

# 17. 빈 장을 일반론으로 채우지 않는다

금지:

```text
domain output missing
→ Personality 문장을 대신 넣음

domain output missing
→ generic advice 생성
```

Gap을 그대로 기록한다.

---

# 18. AssemblyGap

권장:

```ts
interface ReadingAssemblyGap {
  id: string;

  chapterId: string;

  type:
    | "source_gap"
    | "engine_gap"
    | "outcome_layer_not_implemented"
    | "selection_rule_missing"
    | "renderer_gap";

  description: string;

  blocking: boolean;

  provenance?: string[];
}
```

---

# 19. Gap은 고객용 텍스트가 아니다

AssemblyGap은 내부 개발/검증용.

최종 고객에게:

```text
ENGINE_GAP
SOURCE_GAP
```

같은 표현을 그대로 보여주지 않는다.

---

# 20. Selection Contract

현재 확정 선정 규칙이 없는 항목:

```text
핵심 구조 3
강점 3
과제 3
기억할 3
```

에 대해:

```text
candidate list
+
selection status = deferred
```

정도까지만 허용한다.

---

# 21. Top-3 임의 구현 금지

금지:

```ts
items.slice(0, 3)
```

금지:

```ts
sortByScore(...)
```

금지:

```text
role priority를 임의로 top-3 ranking에 사용
```

---

# 22. 후보와 선정 구분

가능하면:

```text
candidateUnits
selectedUnits
selectionStatus
```

를 구분한다.

예:

```ts
selectionStatus:
  | "confirmed"
  | "deferred"
  | "not_required";
```

---

# 23. F-02

`핵심 구조 3가지`는
선정 계약이 없으므로 최종 3개 확정 출력 금지.

Core는:

```text
구조 후보 semantic units
+
selection gap
```

까지만 조립한다.

---

# 24. F-04 / CH-03

강점·과제 candidate는 기존:

```text
SangShen
Byeong
GuEung
ActualStructuralFunction
Personality strengths/cautions
```

에서 실제 존재하는 semantic result만 참조 가능.

그러나:

```text
exactly 3 + 3
```

선정은 하지 않는다.

---

# 25. CH-11

`기억할 셋`도 동일.

선정 규칙 없이 3개를 만들지 않는다.

---

# 26. Month data

현재 Month snapshots는 조립 가능하다.

Core가 보존해야 하는 것:

```text
month identity
solar-term boundaries
PatternContext
Runtime
Role effects
LuckEffects
certainty
provenance
```

실제 현재 타입에 존재하는 범위만.

---

# 27. 12개월 ranking 금지

현재 최종 천간·지지 종합 기준이 보류이므로:

```text
best month
worst month
most favorable month
most difficult month
```

을 Core에서 고르지 않는다.

---

# 28. Month order

12개월은 실제 절기월 시간 순서로만 정렬 가능.

시간 순서는 ranking이 아니다.

---

# 29. CH-10

CH-10 Assembly는:

```text
12 month snapshots
```

자체를 연결할 수 있다.

하지만 고객용:

```text
좋은 달
부담 달
가장 좋은 달
```

등 최종 판정은 기존 명시 근거가 있을 때만.

없으면 deferred.

---

# 30. CH-08 Daewoon

현재 Daewoon snapshot이 있다면
구조 변화 semantic unit를 조립한다.

금지:

```text
대운 → 실제 과거 사건
```

---

# 31. CH-09 Sewoon

현재/다음 해 snapshot을
실제 결과 계약 범위에서 연결.

같은 Sewoon 결과는 다른 장에서도 동일 provenance와 certainty를 사용한다.

---

# 32. Day luck

현재 엔진이 Day까지 계산 가능해도
B rev38의 11장 product requirement에 자동 추가하지 않는다.

Day는:

```text
engine capability
```

로 보존하되
기본 chapter routing에는 넣지 않는다.

---

# 33. Scope preservation

각 SemanticUnit는 원래 scope를 잃으면 안 된다.

```text
natal
daewoon
sewoon
month
day
```

---

# 34. Current와 Natal 혼합 금지

Current effect를 Natal fact로 승격하지 않는다.

Personality에서 이미 고정한 계약과 동일하다.

---

# 35. Expired effect

현재 유효하지 않은 effect는
현재 chapter unit로 조립하지 않는다.

history에는 남길 수 있다.

---

# 36. Provenance 필수

모든 실제 semantic unit는
가능한 범위에서 원본 ID를 가져야 한다.

최소 하나:

```text
sourceFactIds
sourceRoleIds
sourceEffectIds
sourcePersonalityFactIds
```

전부 비어 있는 고객 의미 unit를 임의 생성하지 않는다.

---

# 37. synthetic UI unit 예외

다음처럼 순수 UI 구조 unit는 provenance가 없어도 가능.

```text
chapter heading
section divider
product link placeholder
```

단 `semantic content`로 분류하지 않는다.

---

# 38. Semantic Key

같은 판단을 언어와 무관하게 식별할 수 있는
안정적인 semantic key를 만든다.

예 개념:

```text
personality:fact:<factId>
role:<roleId>:current-function
luck:<scope>:<effectId>
```

실제 ID 체계에 맞게 구현.

---

# 39. 언어 문자열을 key로 쓰지 않는다

금지:

```ts
semanticKey = koreanSentence;
```

---

# 40. B-6 Deduplication 핵심

같은 semantic fact가 여러 chapter에 필요할 경우:

```text
첫 등장
→ conclusion

재등장
→ 추가 context만
```

이라는 계약을 표현할 수 있어야 한다.

---

# 41. FirstOccurrence

가능하면 unit에:

```ts
firstOccurrenceChapterId
```

또는 별도 registry를 둔다.

---

# 42. 재등장 정보 타입

후속 장에서 같은 의미를 사용할 때:

```text
evidence
condition
timing
application
context
```

중 무엇을 추가하는지 명시 가능해야 한다.

---

# 43. RepetitionRole

권장:

```ts
type RepetitionRole =
  | "conclusion"
  | "evidence"
  | "condition"
  | "timing"
  | "application"
  | "context";
```

---

# 44. 동일 semantic conclusion 복제 금지

같은 semanticKey + 같은 repetition role을
여러 chapter에서 그대로 복제하지 않는다.

---

# 45. 문자열 중복 제거 금지

금지:

```ts
new Set(sentences)
```

방식만으로 dedupe.

Assembly는 아직 문장이 없어야 한다.

---

# 46. B-6 고정 예시

최소 다음 routing contract를 registry에 반영한다.

```text
성격 네 모습:
F-03 = first conclusion
CH-02 = situation / condition / target

강점·과제:
F-04 = first conclusion
CH-03 = operation / application
CH-11 = remembered principle

현재 10년:
CH-01 = direction/name
CH-08 = detailed daewoon context
```

실제 B-6 전체에서 구현 가능한 routing을 확인해 반영한다.

---

# 47. B-6 전체를 무조건 코드화하지 않는다

Outcome Layer가 필요한 항목까지
가짜 semantic routing으로 구현하지 않는다.

지원되는 부분만 registry에 넣고
나머지는 gap 상태로 둔다.

---

# 48. Free/Premium Access contract

Assembly는:

```text
productScope = free | premium
```

에 따라 허용 chapter를 선택할 수 있다.

---

# 49. 무료에서 시기 데이터 차단

Free mode에서는:

```text
daewoon
sewoon
month
day
```

시기 semantic unit를 고객 chapter에 배치하지 않는다.

---

# 50. 무료 원국 결과와 유료 원국 결과 방향 동일

같은 Natal semantic fact는:

```text
free
premium
```

에서 certainty와 direction이 바뀌면 안 된다.

---

# 51. Premium은 더 깊게, 다르게 판정하지 않음

Premium은:

```text
more context
more evidence
more timing
more application
```

을 추가할 수 있다.

새 방향을 만들어서는 안 된다.

---

# 52. Access와 판정 분리

금지:

```text
if premium:
  favorable = true
```

같은 구조.

---

# 53. Chapter readiness API

각 chapter에:

```ts
readiness
gaps
availableUnitIds
```

를 반환할 수 있어야 한다.

---

# 54. 부분 조립 허용

전체 Reading이 아직 완성되지 않아도:

```text
F-03 ready
CH-02 ready/partial
CH-04 outcome_not_implemented
```

처럼 chapter 단위 상태를 유지한다.

---

# 55. 전체 결과를 거짓 READY로 만들지 않는다

Assembly가 생성됐다는 이유로:

```text
all chapters complete = true
```

로 만들지 않는다.

---

# 56. Customer Ready와 Assembly Ready 분리

권장:

```text
assemblyReady
customerRenderable
```

또는 이에 준하는 별도 상태.

현재 P4-B 성공은:

```text
Assembly Core READY
```

이지:

```text
Full Paid Reading READY
```

가 아니다.

---

# 57. Outcome Chapter

CH-04~07은 현재 적어도:

```text
outcome layer missing
```

상태를 안전하게 보존해야 한다.

---

# 58. Relationship personality와 CH-06 구분

Personality의:

```text
relationshipStyle
```

이 있다고 해서
CH-06 전체가 READY가 아니다.

그 정보는 사용 가능한 일부 semantic input일 뿐.

---

# 59. Health

Personality/12운성 데이터를 건강 outcome으로 변환하지 않는다.

---

# 60. Question

`CustomerContext.question`을 받을 수 있어도
이번 단계에서 semantic routing을 자동 추론하지 않는다.

CH-Q:

```text
not_implemented
```

상태 보존.

---

# 61. Deterministic

동일 입력:

```text
Canonical
Judgment
Personality
CustomerContext
productScope
```

→ 동일 Assembly.

---

# 62. LLM 호출 금지

Reading Assembly Core에서
LLM/API 호출 0.

---

# 63. 입력 배열 순서 독립성

동일 Fact 집합의 배열 순서가 달라도
semantic unit identity와 chapter routing 결과가 동일해야 한다.

---

# 64. 정렬 기준

출력 순서는 deterministic해야 한다.

허용:

```text
B chapter fixed order
scope chronological order
stable ID order
```

임의 importance sort 금지.

---

# 65. importance score 금지

신규:

```text
score
weight
importance
priorityNumber
```

로 semantic significance를 정하지 않는다.

B가 명시한 chapter 순서/first occurrence는 사용할 수 있다.

---

# 66. Engine dependency 방향

반드시:

```text
ReadingAssembly
→ Judgment result types
→ Personality result types
```

읽기 방향.

금지:

```text
Judgment
→ ReadingAssembly

Personality
→ ReadingAssembly
```

---

# 67. Judgment 소스 변경 금지

```text
src/lib/judgment/
```

기능 변경 0.

---

# 68. Personality 소스 변경 금지

```text
src/lib/personality/
```

판정 의미 변경 0.

공용 type export가 꼭 필요하다면 최소 수정 후
결과 보고서에 이유 기록.

---

# 69. Renderer 변경 금지

P3-F까지 완료된:

```text
KO Personality Renderer
JA Personality Renderer
EN Personality Renderer
```

의 의미를 변경하지 않는다.

---

# 70. Outcome logic 금지

P4-B 테스트를 통과시키기 위해:

```text
work
money
relationship
health
```

fixture-specific 의미를 hard-code하지 않는다.

---

# 71. Candidate collection

Top-3 같은 선정이 필요한 곳에서는
가능하면 candidate collection까지만 구현한다.

후보 자체도 기존 result에 명시적 근거가 있을 때만.

---

# 72. 후보 수가 3개여도 자동 confirmed 아님

우연히 후보가 정확히 3개라고 해서:

```text
selectionStatus = confirmed
```

으로 바꾸지 않는다.

명시적 선정 계약이 없으면 deferred.

---

# 73. F-LINK

`여기서 더 들어가면`은
Product navigation metadata로 취급.

유료 내용의 결론을 미리 생성하지 않는다.

---

# 74. Architecture Tests

최소:

```text
A. Assembly count = 1
B. locale text fields = 0
C. Judgment recalculation = 0
D. Personality renderer call = 0
E. LLM call = 0
```

---

# 75. Chapter Registry Tests

검증:

```text
17/17 chapter IDs registered
fixed order preserved
free/premium scope correct
```

---

# 76. Free Scope Test

Free Assembly에서:

```text
Daewoon customer units = 0
Sewoon customer units = 0
Month customer units = 0
Day customer units = 0
```

---

# 77. W-99 Test

동일 Natal fact가 free/premium에 사용될 때:

```text
semanticKey same
certainty same
direction same
provenance same
```

---

# 78. B-6 Dedupe Test

같은 Personality fact:

```text
F-03
CH-02
```

두 장에서 사용.

Expected:

```text
same semantic identity
different repetition role
duplicate conclusion = 0
```

---

# 79. Strong/Challenge Dedupe Test

F-04와 CH-03 사이:

```text
same selected/candidate identity
F-04 = conclusion
CH-03 = application/context
```

선정이 deferred라면 그대로 deferred.

---

# 80. Top-3 Guard Test

최소 테스트:

```text
candidate 6개 입력
```

Expected:

```text
selected top3 자동 생성 = 0
selectionStatus = deferred
gap = selection_rule_missing
```

---

# 81. Month Ranking Guard

12개월 입력.

Expected:

```text
chronological months = 12
bestMonth = absent
worstMonth = absent
ranking score = absent
```

---

# 82. Outcome Guard

Judgment에 財星 등이 존재해도:

```text
CH-05 money outcome
```

을 자동 생성하지 않는다.

---

# 83. Relationship Guard

Personality에 relationshipStyle이 있어도:

```text
marriage timing
partner quality
```

를 만들지 않는다.

---

# 84. Health Guard

12운성/오행/root가 있어도:

```text
disease
body organ
health risk
```

semantic unit 생성 0.

---

# 85. Question Guard

question text가 있어도
이번 단계에서는 새 answer semantic unit 생성 0.

CH-Q gap 유지.

---

# 86. Expired Effect Test

expired LuckEffect는 current chapter unit = 0.

history provenance는 유지 가능.

---

# 87. Role History Test

원국 역할 이력과 현재 기능을 구분한다.

현재 stopped/inactive인 역할을
현재 작동 semantic unit로 만들지 않는다.

---

# 88. Non-exclusive Role Test

동일 원국 글자가:

```text
YongShen
+
ConditionalByeong
```

등 복수 역할을 가져도
각 provenance를 보존한다.

한 역할로 덮어쓰지 않는다.

---

# 89. No-Byeong Test

Byeong이 없으면
강제 challenge semantic unit 생성 금지.

---

# 90. Unknown Hour

시주 미확정/없음 입력에서
hour-derived semantic unit 생성 금지.

---

# 91. Stable ID

동일 입력에서 생성되는:

```text
ReadingSemanticUnit.id
semanticKey
```

는 반복 실행해도 동일해야 한다.

랜덤 UUID를 의미 identity로 사용하지 않는다.

---

# 92. Provenance completeness

실제 의미 semantic unit에서
모든 source ID 배열이 비어 있다면 테스트 실패.

단 UI-only metadata 제외.

---

# 93. Assembly Validation

권장:

```ts
validateReadingAssembly(assembly)
```

검증 대상:

```text
duplicate IDs
invalid chapter ID
scope leakage
missing provenance
unsupported selection
forbidden locale text
```

---

# 94. 신규 검증 스크립트

권장:

```text
scripts/verify-reading-assembly-core-p4b.mjs
```

---

# 95. 기존 회귀

반드시 유지:

```text
P2-A~G PASS
P3-A~F PASS
Judgment 35/35 PASS
```

---

# 96. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 97. 결과 문서

```text
src/docs/codex/
p4b-reading-assembly-core-result.md
```

---

# 98. 최종 보고 — A. 전체 판정

다음 중 하나:

```text
READY_FOR_READING_ASSEMBLY_AUDIT
```

또는:

```text
P4B_FIX_REQUIRED
```

---

# 99. B. Architecture

보고:

```text
Assembly Core count:
language-specific Assembly:
Judgment recalculation:
Personality renderer dependency:
LLM dependency:
```

Expected:

```text
1
0
0
0
0
```

---

# 100. C. Chapter Registry

```text
registered:
free:
premium:
question:
order mismatch:
```

Expected:

```text
17/17
```

---

# 101. D. Semantic Units

보고:

```text
total units:
units with provenance:
units without provenance:
duplicate IDs:
duplicate semantic conclusions:
```

UI-only unit는 별도 집계.

---

# 102. E. Selection Gaps

```text
Core structure top-3:
Strength top-3:
Challenge top-3:
Remember top-3:
Best month:
Worst month:
```

Expected:

```text
deferred / selection_rule_missing
```

자동 선정 0.

---

# 103. F. Outcome Gaps

```text
Work:
Money:
Relationship:
Health:
Question:
```

현재 승인된 상태 그대로 보고.

---

# 104. G. B-6 Deduplication

```text
semantic-key dedupe:
first occurrence:
later occurrence roles:
string-based dedupe:
```

Expected:

```text
string-based dedupe = no
```

---

# 105. H. Free/Premium

```text
free time-scope leakage:
premium direction changes:
same-fact certainty mismatch:
same-fact provenance mismatch:
```

모두 0.

---

# 106. I. Scope

```text
Natal:
Daewoon:
Sewoon:
Month:
Day:
expired current leakage:
```

---

# 107. J. Unsupported Inference

```text
new work inference:
new money inference:
new relationship inference:
new health inference:
new question inference:
new ranking:
new numeric score:
```

모두 0.

---

# 108. K. Dependency

```text
Judgment → Reading:
Personality → Reading:
Reading → Judgment result:
Reading → Personality result:
```

Expected:

```text
Judgment → Reading = 0
Personality → Reading = 0
Reading → results = read-only
```

---

# 109. L. Regression

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:
P2-G:

P3-A:
P3-B:
P3-C:
P3-D:
P3-E:
P3-F:

Judgment:
P4-B:
tsc:
build:
```

---

# 110. M. 남은 상태

```text
FAIL:
PARTIAL:
SOURCE_GAP:
ENGINE_GAP:
OUTCOME_LAYER_NOT_IMPLEMENTED:
SELECTION_RULE_MISSING:
DEFERRED:
TECH_DEBT:
```

---

# 111. P4-B 종료 조건

다음을 만족하면:

```text
READY_FOR_READING_ASSEMBLY_AUDIT
```

판정한다.

```text
[ ] Assembly Core 1개
[ ] 언어별 Assembly 0
[ ] B 17개 registry
[ ] 고정 장 순서
[ ] semantic provenance
[ ] deterministic stable ID
[ ] semantic-key dedupe
[ ] B-6 first/later occurrence 계약
[ ] free scope 시기 leakage 0
[ ] free/premium 방향 불일치 0
[ ] Top-3 임의 선정 0
[ ] Month 임의 ranking 0
[ ] Work 신규 판단 0
[ ] Money 신규 판단 0
[ ] Relationship 신규 판단 0
[ ] Health 신규 판단 0
[ ] Question 신규 판단 0
[ ] Judgment 재계산 0
[ ] Personality Renderer 의존 0
[ ] locale 완성문 저장 0
[ ] LLM 호출 0
[ ] Judgment/Personality 역방향 의존 0
[ ] P2/P3/Judgment 회귀 PASS
[ ] tsc/build PASS
```

---

# 112. 중요한 종료 의미

P4-B 성공은:

```text
Reading Assembly Core COMPLETE
```

라는 뜻이다.

다음을 뜻하지 않는다.

```text
Full Reading COMPLETE
Paid 11 Chapters COMPLETE
Outcome Layer COMPLETE
```

---

# 113. 다음 단계

P4-B 통과 후 바로 Outcome Layer를 구현하지 않는다.

먼저:

```text
P4-C Reading Assembly Core Integration Audit
```

을 수행한다.

P4-C에서:

```text
실제 JudgmentResult
+
실제 PersonalityResult
+
실제 Luck snapshot
→ ReadingAssembly
```

를 통합 실행하여:

```text
중복
scope leakage
expired state
provenance
free/premium consistency
chapter readiness
```

를 검증한다.

P4-C가 닫힌 뒤에야
P4-A에서 확인된:

```text
Selection Layer
Outcome Semantic Layer
```

중 어느 것을 먼저 구현할지 결정한다.