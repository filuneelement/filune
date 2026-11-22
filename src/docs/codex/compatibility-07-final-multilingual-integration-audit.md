# FILUNE Compatibility-07
## Final Multilingual Integration Audit

현재 완료 상태:

```text
COMPATIBILITY_CROSS_CHART_FACT_ENGINE_READY
COMPATIBILITY_STRUCTURAL_POLICY_READY
COMPATIBILITY_PERSONALITY_INTERACTION_READY
COMPATIBILITY_RELATIONSHIP_LIFECYCLE_TIMING_READY
COMPATIBILITY_FINAL_ASSEMBLY_READY

COMPATIBILITY_KO_RENDERER_FINAL_READY
COMPATIBILITY_JA_RENDERER_READY
COMPATIBILITY_EN_RENDERER_READY
```

이번 단계는 **Compatibility Engine 전체의 최종 통합 감사**다.

새 명리 규칙을 만들지 않는다.

---

# 1. 최종 목표

성공:

```text
COMPATIBILITY_ENGINE_MULTILINGUAL_COMPLETE
```

수정이 필요한 경우:

```text
COMPATIBILITY_C7_FIX_REQUIRED
```

새 정책 결정이 필요한 경우:

```text
COMPATIBILITY_C7_POLICY_DECISION_REQUIRED
```

---

# 2. AUDIT FIRST

이번 작업에서는 먼저 감사만 수행한다.

처음부터 코드 구조를 다시 설계하지 않는다.

반드시:

```text
1. 현재 계약 확인
2. public entry point 실행
3. C1→C6 end-to-end 추적
4. KO/JA/EN parity 감사
5. production exposure 감사
6. blocker 분류
```

순서로 진행한다.

---

# 3. 반드시 읽을 문서

```text
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/13-reading-assembly-spec.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md
src/docs/rules/master/16-compatibility-spec.md
```

최근 결과:

```text
Compatibility C1 result
Compatibility C2 result
Compatibility C3 result
Compatibility C4 / C4B result
Compatibility C5 result

C6-A result
C6-A.1 result
C6-B result
C6-C result
```

---

# 4. Authority

Compatibility 최종 판단 authority:

```text
현재 Master 03
현재 Master 05
현재 Master 08
현재 Master 09
현재 Master 11
현재 Master 14
현재 Master 15
현재 Master 16
```

과 현재 실행 코드다.

과거 Codex 문서나 오래된 명리 분석 문서를
새 판정 근거로 사용하지 않는다.

---

# PART A — Public Entry Point

# 5. Compatibility public API 확인

현재 실제 제품이 사용할 compatibility entry point를 확인한다.

예:

```text
readBirthCompatibility(...)
```

또는 repository의 실제 canonical API.

---

# 6. 한 번의 호출로 C1→C5 도달

두 `BirthInput`을 입력하면:

```text
C1 Cross-chart Facts
↓
C2 Structural Compatibility
↓
C3 Personality Interaction
↓
C4 Lifecycle / Timing
↓
C5 FinalCompatibilityResult
```

까지 하나의 정상 경로로 실행되어야 한다.

---

# 7. Renderer public API

최소:

```text
renderCompatibilityKo(...)
renderCompatibilityJa(...)
renderCompatibilityEn(...)
```

또는 현행 canonical API가
`FinalCompatibilityResult`를 직접 받아야 한다.

---

# 8. 중역 금지 재확인

다음 호출 구조가 있으면 FAIL:

```text
KO string → JA
KO string → EN
JA string → EN
```

Expected:

```text
FinalCompatibilityResult → KO
FinalCompatibilityResult → JA
FinalCompatibilityResult → EN
```

---

# PART B — C1 Fact Integrity

# 9. Cross-chart facts

두 사람 사이에서 생성되는:

```text
stem interaction
branch interaction
root-related compatibility fact
role-path evidence
direction
scope
source/target identity
```

가 C2 이후에도 추적 가능해야 한다.

---

# 10. 개인 Judgment 오염 금지

Compatibility 계산이:

```text
Person A Judgment
Person B Judgment
```

자체를 mutate하면 FAIL.

Expected:

```text
Judgment mutation = 0
RootState mutation = 0
Personality mutation = 0
```

---

# 11. A/B swap

입력 순서를 바꿔도:

```text
pair identity stable
symmetric facts stable
directional facts reversed correctly
```

이어야 한다.

---

# PART C — Structural Compatibility

# 12. C2 다섯/여섯 판정값 확인

현재 canonical verdict set을 코드에서 읽고
Master 16과 일치하는지 확인한다.

예:

```text
favorable
favorable_dominant
balanced_mixed
minor_effect
unfavorable_dominant
unfavorable
```

정확한 현행 enum을 authority로 사용한다.

---

# 13. balanced_mixed 의미

다시 확인:

```text
강한 유리 효과
+
강한 불리 효과
+
구조적 우열 없음
```

이지:

```text
neutral
average
unknown
deferred
```

가 아니다.

---

# 14. Direction

다음이 Final 결과까지 보존:

```text
A→B
B→A
```

---

# 15. Structural effect provenance

각:

```text
relieves_byeong
weakens_byeong
activates_byeong
strengthens_harmful_path

supports_required_function
damages_required_function

supports_required_root
supports_harmful_root
```

또는 현행 canonical effect가
source fact까지 추적되어야 한다.

---

# PART D — Personality Interaction

# 16. Natal vs Current

C3의:

```text
Natal interaction
Current interaction
```

구분이 C5 / Renderer까지 유지되는지 확인한다.

---

# 17. 인성 우세 → 표현 억제 계약

현재 승인된:

```text
Resource dominance
→ Output / expression suppression
```

경로가 실제 evidence가 있을 때 확정되는지 확인한다.

---

# 18. 현재 운 회복

현재 scope에서:

```text
Resource pressure reduced
+
Output expression supported
```

가 확인되면:

```text
expression relief
communication relief
```

로 회복되는 계약 유지.

---

# 19. 보수적 collapse 금지

근거가 확인됐는데:

```text
deferred
maybe
possible
```

로 내려가는 사례가 없는지 확인한다.

---

# PART E — Relationship Lifecycle

# 20. Marriage Opportunity vs Quality

반드시 독립:

```text
marriage opportunity
marriage favorable
marriage caution
```

---

# 21. 사건과 평가 분리

다음 모두 가능:

```text
marriage opportunity confirmed
+
marriage caution confirmed
```

한쪽을 삭제하면 FAIL.

---

# 22. Relationship change

```text
relationship_change
```

가:

```text
automatic breakup
automatic marriage
```

로 변환되지 않는지 확인한다.

---

# 23. Breakdown-A

```text
Baseline Vulnerability
+
Current aggravation
→ relationship breakdown risk
```

검증.

---

# 24. Breakdown-B

```text
active spouse relationship axis
+
current spouse-significator event
+
effective spouse-palace disruption
→ relationship breakdown risk
```

검증.

---

# 25. Negative shortcut

반드시:

```text
clash only → no breakdown
spouse actor only → no breakdown
stopped spouse actor + clash → no breakdown
baseline vulnerability only → no breakdown
```

---

# 26. Breakdown A+B

둘 다 성립하는 경우:

```text
one breakdown risk
+
two path IDs/provenance
```

를 보존하는지 확인.

숫자 위험도 추가 금지.

---

# PART F — Timing

# 27. Individual / Mutual

구분:

```text
A-only timing
B-only timing
mutual timing
```

---

# 28. Scope identity

TimingFact의:

```text
scope
originScope
scopeId
scopeGanZhi
parentScopeGanZhi
```

등 현행 필드가 조립 과정에서 손실되지 않는지 확인.

---

# 29. Gregorian projection

실제 projection이 있는 경우에만 날짜 표시.

Expected:

```text
invented Gregorian date = 0
```

---

# 30. Day gap

현행 Day projection이 여전히:

```text
ENGINE_GAP
```

이라면 그 상태를 정확히 기록한다.

단 이 gap 때문에:

```text
Compatibility Engine incomplete
```

로 판정하지 않는다.

지원되는 범위는 정상 완료로 본다.

---

# 31. Long window presentation

C6-A.1 계약:

```text
current_spanning
→ 현재를 포함한 장기 흐름
→ corresponding JA/EN label
```

parity 확인.

---

# 32. Overlapping windows

상위 장기 window와 하위 집중 window:

```text
Fact는 모두 유지
Customer presentation은 grouping
```

인지 확인.

---

# PART G — Final Assembly

# 33. C5 세 축

최종 결과에:

```text
Structural
Personality
Lifecycle
```

독립 보존.

---

# 34. 평균화 금지

금지:

```text
structural positive
+
personality negative
+
timing risk
→ average compatibility
```

---

# 35. Strength + Risk 공존

정상:

```text
strengths.length > 0
risks.length > 0
```

이를 하나의 neutral 결과로 collapse하지 않는다.

---

# 36. Current / Future / Past

최종 결과에서 분리 유지.

---

# 37. Provenance

각:

```text
strength
risk
personality statement
marriage result
breakdown risk
timing window
```

가 원 Fact ID까지 추적 가능.

---

# PART H — KO / JA / EN Semantic Parity

# 38. 동일 fixture 사용

C6에서 사용한 7개 fixture를 모두 사용한다.

최소:

```text
mixed
balanced
history
relief
bothPaths
marriageSource
breakdownSource
```

---

# 39. Semantic parity

각 fixture마다:

```text
KO semantic IDs
=
JA semantic IDs
=
EN semantic IDs
```

Expected:

```text
missing = 0
extra = 0
```

---

# 40. Certainty parity

Expected:

```text
confirmed → confirmed → confirmed
conditional → conditional → conditional
```

Mismatch:

```text
0
```

---

# 41. Direction parity

Expected:

```text
A→B = same
B→A = same
```

Mismatch:

```text
0
```

---

# 42. Person identity parity

```text
first person
second person
both
```

각 locale에서 동일 semantic identity를 가져야 한다.

---

# 43. Timing parity

같은:

```text
TimingFact ID
Gregorian interval
temporal classification
```

사용.

Mismatch:

```text
0
```

---

# 44. Breakdown parity

```text
BREAKDOWN-A
BREAKDOWN-B
A+B
```

모두 3개 언어에서 동일 source fact를 사용.

---

# 45. Marriage parity

```text
opportunity
favorable
caution
```

누락/통합:

```text
0
```

---

# PART I — Customer Assertion Audit

# 46. KO certainty

confirmed Fact가:

```text
~일 수 있다
가능성이 있다
```

로 하향된 사례 검색.

Expected:

```text
0
```

---

# 47. JA certainty

confirmed Fact가:

```text
〜かもしれない
```

로 하향:

```text
0
```

---

# 48. EN certainty

confirmed Fact가:

```text
may
might
perhaps
possibly
```

로 하향된 사례:

```text
0
```

단 canonical conditional semantic은 제외.

---

# 49. Risk language

breakdown risk는:

```text
위험이 뚜렷하게 높아짐
リスクがはっきり高まる
risk is clearly higher
```

수준의 의미 강도를 유지해야 한다.

---

# 50. 사건 단정 금지

세 언어 모두:

```text
반드시 이혼
必ず離婚
you will divorce
```

위반:

```text
0
```

---

# PART J — Customer Terminology Audit

# 51. KO

고객 output에서 명리 전문용어:

```text
0
```

---

# 52. JA

명리 전문용어/점술체:

```text
0
```

---

# 53. EN

BaZi internal terminology/점술체:

```text
0
```

---

# 54. Numeric compatibility

세 언어 모두:

```text
score
percentage
rank
stars
odds
```

궁합 숫자화:

```text
0
```

---

# 55. Romantic marketing wording

다음 계열:

```text
천생연분
운명의 상대

運命の人
赤い糸

soulmate
the one
twin flame
perfect match
meant to be
```

Expected:

```text
0
```

---

# PART K — Relationship Status

# 56. 상태 추정 금지

입력에 없는:

```text
기혼
연애 중
남편/아내

夫/妻/彼氏/彼女

husband/wife/boyfriend/girlfriend/spouse
```

추정:

```text
0
```

---

# 57. Explicit context

명시적 relationship context가 있는 경우만
상태별 wording을 사용하는지 확인.

---

# PART L — Determinism

# 58. Same input

동일 두 BirthInput + 동일 context:

```text
same C1-C5 result
same KO result
same JA result
same EN result
```

---

# 59. Input mutation

Expected:

```text
BirthInput mutation = 0
Context mutation = 0
Judgment mutation = 0
```

---

# 60. Order swap

A/B 입력 교환:

```text
direction swapped correctly
pair identity stable
non-directional semantics preserved
```

---

# PART M — IDs / Provenance

# 61. Duplicate IDs

전 레이어:

```text
duplicate IDs = 0
```

---

# 62. Orphan provenance

```text
orphan facts = 0
orphan customer statements = 0
```

---

# 63. Source identity

Renderer가 새로운 semantic source ID를 발명하면 FAIL.

---

# PART N — Public Product Readiness

# 64. 실제 제품 호출 가능 여부

현재 app에서 호출 가능한 API를 감사한다.

최소:

```text
BirthInput A
BirthInput B
locale
optional names
optional relationship context
```

를 받아 최종 결과를 만들 수 있어야 한다.

---

# 65. locale

최소:

```text
ko
ja
en
```

지원 경로 확인.

---

# 66. fallback

지원되지 않는 locale이 들어왔을 때
현행 localization 정책을 확인한다.

이번 감사에서 임의 fallback 정책을 새로 만들지 않는다.

필요 시 보고만 한다.

---

# 67. Renderer output

제품이 실제로 사용할 수 있는
serializable result인지 확인.

debug-only object를 UI가 직접 조립하도록 두지 않는다.

---

# 68. Free/Paid

이번 단계에서는:

```text
무료 범위
유료 범위
```

를 새로 설계하지 않는다.

전체 결과 계약만 감사한다.

---

# PART O — Regression

# 69. Compatibility

반드시:

```text
C1
C2
C3
C4
C5
C6-A
C6-A.1
C6-B
C6-C
```

PASS.

---

# 70. Core regression

반드시:

```text
Judgment 35/35
P0
P1
```

현행 주요 회귀 PASS.

---

# 71. Other engines

반드시:

```text
Personality
Money
Health
Relationship
Event Timing Batch 1
```

PASS.

---

# 72. Locale regression

반드시:

```text
Personality KO
Personality JA
Personality EN
```

PASS.

---

# 73. TypeScript / Build

```text
npx tsc -b
npm run build
git diff --check
```

PASS.

---

# PART P — Audit Matrix

# 74. C1-C6 matrix

결과 문서에:

| Layer | Input | Output | Direction | Scope | Provenance | Deterministic | Status |
|---|---|---|---|---|---|---|---|

작성.

---

# 75. Locale matrix

| Check | KO | JA | EN |
|---|---:|---:|---:|
| semantic parity | | | |
| certainty | | | |
| direction | | | |
| timing | | | |
| terminology violations | | | |
| numeric score | | | |
| invented outcomes | | | |
| relationship-status inference | | | |
| orphan statements | | | |

---

# 76. Source case matrix

최소:

| Source case | Expected | Engine result | KO | JA | EN | PASS |
|---|---|---|---|---|---|---|

대상:

```text
actual marriage
marriage opportunity + caution
BREAKDOWN-A
BREAKDOWN-B
```

---

# PART Q — Gap Classification

# 77. 발견되는 모든 문제는 네 종류로만 분류

```text
IMPLEMENTATION_BUG
PRESENTATION_BUG
TEST_INFRA_GAP
POLICY_GAP
```

임의 분류 추가 금지.

---

# 78. IMPLEMENTATION_BUG

이미 확정된 계약과 코드가 다름.

후속 최소 fix 대상.

---

# 79. PRESENTATION_BUG

semantic은 맞지만 고객 표시가 잘못됨.

후속 Renderer 최소 fix.

---

# 80. TEST_INFRA_GAP

실제 구현 문제가 아니라
fixture/verifier/path 문제.

별도 처리.

---

# 81. POLICY_GAP

현재 Master에서 결정되지 않은 문제.

임의 구현 금지.

사용자 결정 필요.

---

# PART R — 코드 변경 원칙

# 82. 감사 중 PASS라면 코드 변경 금지

C7은 청소 작업이 아니다.

```text
예뻐 보이게 refactor
helper 합치기
파일 이동
타입명 변경
```

금지.

---

# 83. blocker 발견 시

결과 문서에서 정확히:

```text
Gap:
Class:
Affected layer:
Exact failure:
Minimum fix:
Regression needed:
```

보고한다.

---

# 84. 대규모 재작성 금지

금지:

```text
Compatibility engine rewrite
Renderer architecture rewrite
Judgment rewrite
Event Timing rewrite
```

---

# PART S — 결과 파일

# 85. 생성

```text
src/docs/codex/compatibility-07-final-multilingual-integration-audit-result.md
```

---

# 86. 결과 요약

반드시:

```text
C1:
C2:
C3:
C4:
C5:

KO:
JA:
EN:

Public entry point:

Semantic mismatches:
Certainty mismatches:
Direction mismatches:
Timing mismatches:

Duplicate IDs:
Orphan provenance:
Invented dates:
Input mutations:

Terminology violations:
Numeric-score violations:
Invented outcomes:
Relationship-status inference:

Implementation bugs:
Presentation bugs:
Test infra gaps:
Policy gaps:
```

---

# 87. 최종 판정

다음을 모두 만족하면:

```text
COMPATIBILITY_ENGINE_MULTILINGUAL_COMPLETE
```

조건:

```text
[ ] C1-C5 semantic integrity PASS
[ ] C1→C5 production path PASS

[ ] KO/JA/EN semantic parity
[ ] certainty parity
[ ] direction parity
[ ] timing parity

[ ] marriage opportunity/favorable/caution 독립 보존
[ ] BREAKDOWN-A/B 보존
[ ] one-sided/mutual timing 보존

[ ] numeric scoring 0
[ ] conservative certainty downgrade 0
[ ] invented outcome 0
[ ] customer Saju terminology 0
[ ] relationship-status inference 0

[ ] duplicate IDs 0
[ ] orphan provenance 0
[ ] fake Gregorian date 0
[ ] input/upstream mutation 0

[ ] Compatibility regressions PASS
[ ] Judgment regressions PASS
[ ] Personality/Outcome/Event Timing regressions PASS

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 88. FAIL 조건

다음 중 하나라도 실제 발생하면:

```text
semantic loss
wrong direction
wrong timing identity
certainty downgrade
orphan customer statement
production public API disconnected
```

최종 완료 판정 금지.

---

# 89. POLICY GAP

정말 새 결정이 필요한 경우에만:

```text
COMPATIBILITY_C7_POLICY_DECISION_REQUIRED
```

사용한다.

반드시 실제 질문 하나씩 보고한다.

---

# 90. 성공 이후

`COMPATIBILITY_ENGINE_MULTILINGUAL_COMPLETE`이면
**Compatibility 명리 판단 개발은 종료한다.**

다음 단계는:

```text
Compatibility-08
Product Result Integration
```

이다.

C8의 범위:

```text
/result 실제 제품 화면 연결
BirthInput A/B 입력 UX
locale 연결
결과 section component
timeline UI
loading/error state
mobile layout
무료/유료 노출 구조
```

이다.

C8에서는 새로운 명리 규칙을 만들지 않는다.