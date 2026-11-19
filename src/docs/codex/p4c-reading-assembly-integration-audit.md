# FILUNE Codex P4-C
## Reading Assembly Core Integration Audit

P4-B 공통 Reading Assembly Core 구현이 완료되었다.

현재 상태:

```text
READY_FOR_READING_ASSEMBLY_AUDIT

Assembly Core = 1개
B chapter registry = 17/17
검증 semantic units = 249
provenance 누락 = 0
duplicate unit ID = 0
duplicate semantic conclusion = 0

무료 scope 시기 누출 = 0
Top-3 자동 선정 = 0
월 ranking 자동 생성 = 0

Outcome Layer:
Work = NOT_IMPLEMENTED
Money = NOT_IMPLEMENTED
Relationship = NOT_IMPLEMENTED
Health = NOT_IMPLEMENTED
Question routing = NOT_IMPLEMENTED

customerRenderable = false
```

P4-B에서는 12개월 검증 일부가 fixture 기반이었다.

이번 P4-C에서는 반드시 실제:

```text
Canonical
→ Judgment
→ Personality
→ Luck scopes
→ assembleReading()
```

통합 경로를 검증한다.

---

# 1. 목표

최종 판정:

```text
READY_FOR_READING_ASSEMBLY_CORE_COMPLETE
```

또는:

```text
P4C_FIX_REQUIRED
```

---

# 2. 이번 단계의 성격

이번 작업은 **통합 감사**다.

새 명리 규칙을 만들지 않는다.

새 Outcome Layer를 구현하지 않는다.

다음도 구현하지 않는다.

```text
Work Outcome
Money Outcome
Relationship Outcome
Health Outcome
Question Routing
Top-3 selection
Best/Worst month selection
```

---

# 3. 기준 문서

반드시 확인:

```text
src/docs/rules/master/13-reading-assembly-spec.md

src/docs/codex/p4a-reading-assembly-contract-audit-result.md
src/docs/codex/p4b-reading-assembly-core-result.md

src/docs/source/authority/B_rev38.md
src/docs/rules/authority/mapping-B-rendering.md
```

현재 엔진:

```text
src/lib/judgment/
src/lib/personality/
src/lib/reading/
```

---

# 4. 실제 통합 경로

최소 하나 이상의 실제 birth input에서:

```text
birth input
→ CanonicalChart
→ runInternalReading()
→ buildNatalPersonality()
→ buildCurrentPersonality() if applicable
→ assembleReading()
```

을 연결한다.

합성된 ReadingSemanticUnit를 직접 넣는 테스트만으로 통과시키지 않는다.

---

# 5. 실제 Luck 연결

최소 다음 scope를 실제 Judgment pipeline 결과에서 가져온다.

```text
Natal
Daewoon
Sewoon
Month
```

Day는 계산 가능하더라도 B의 기본 감정서 chapter에 자동 배치하지 않는다.

---

# 6. 실제 12개월

P4-B fixture 기반 12개월 검증을 보완한다.

실제 기준 연도에서:

```text
12 solar-term months
```

를 Judgment pipeline으로 계산하고
Reading Assembly에 전달한다.

검증:

```text
month count = 12
chronological order correct
month identity preserved
scope = month
provenance preserved
```

---

# 7. 12개월 ranking 금지 재검증

실제 12개월을 넣어도:

```text
bestMonth
worstMonth
topMonth
score
rank
```

가 생성되지 않아야 한다.

최종 천간·지지 종합 판정이 보류라는 P4-A 계약을 유지한다.

---

# 8. 통합 대표 사례

최소 다음 성격이 다른 실제 fixture를 사용한다.

```text
A. 정상적인 원국 + 역할 존재
B. No-Byeong 사례
C. ConditionalByeong / SangShen 상태가 있는 사례
D. LuckEffect가 실제 작동하는 사례
E. Current Personality가 Natal과 달라지는 사례
```

기존 회귀 fixture가 있으면 재사용한다.

새 기대 명리값을 발명하지 않는다.

---

# 9. 실제 CS 회귀 활용

가능하면 기존:

```text
CS-005
```

또는 기존 Judgment 회귀에서 이미 기대값이 확정된 사례를 우선 사용한다.

목표는 새 명리 기대값 검증이 아니라:

```text
기존 확정 결과
→ Assembly
```

전달 무결성 검사다.

---

# 10. Assembly가 Judgment를 변경하지 않는지

통합 실행 전후:

```text
JudgmentResult
```

를 비교한다.

Assembly 호출 때문에:

```text
role
runtime
pattern
luck effect
scope snapshot
```

이 변경되면 FAIL.

---

# 11. Personality 변경 금지

Assembly 전후:

```text
PersonalityResult
```

가 동일해야 한다.

특히:

```text
Fact
Conflict
StructuralRoleModifier
Current effect
history
```

변경 0.

---

# 12. Read-only 계약

Assembly는 기존 result를 mutate하지 않는다.

가능하면 deep-freeze 또는 before/after structural comparison으로 검증한다.

---

# 13. Determinism

동일 실제 입력을 두 번 실행:

```text
assembleReading(input)
assembleReading(input)
```

Expected:

```text
same semantic unit IDs
same semanticKeys
same chapter routing
same readiness
same gaps
```

---

# 14. 배열 순서 독립성

동일 결과의 Fact/Effect 배열 순서만 바꿔 입력해도:

```text
semantic identity
chapter routing
readiness
```

가 동일해야 한다.

---

# 15. Stable ID

랜덤 ID가 없어야 한다.

동일 입력에서 모든:

```text
ReadingSemanticUnit.id
semanticKey
gap identity
```

가 안정적이어야 한다.

---

# 16. Provenance 실제 연결

합성 ID가 아니라 실제 Judgment / Personality ID가 연결되는지 확인한다.

각 의미 unit은 가능한 범위에서:

```text
sourceFactIds
sourceRoleIds
sourceEffectIds
sourcePersonalityFactIds
```

중 최소 하나를 갖는다.

---

# 17. Orphan provenance

존재하지 않는 source ID를 참조하는 unit:

```text
0
```

이어야 한다.

---

# 18. Provenance 역추적

샘플 semantic unit 몇 개에 대해:

```text
ReadingSemanticUnit
→ source ID
→ actual Judgment / Personality result
```

역추적 가능성을 검증한다.

---

# 19. F-03 Personality 통합

실제 `PersonalityResult`를 사용하여
F-03에 semantic units가 연결되는지 확인한다.

Assembly가 KO/JA/EN Personality Renderer를 호출하면 FAIL.

---

# 20. CH-02 Personality 통합

F-03과 CH-02가 같은 Personality Fact를 사용할 경우:

```text
same semantic identity
```

를 유지해야 한다.

단 repetition role은 달라야 한다.

예:

```text
F-03 = conclusion
CH-02 = context / condition / target
```

---

# 21. B-6 실제 중복 감사

실제 결과를 사용하여:

```text
same semanticKey
+
same repetition role
```

중복이 발생하지 않는지 검사한다.

Expected:

```text
duplicate semantic conclusion = 0
```

---

# 22. 문자열 dedupe 금지

실제 Assembly에서도 문장 문자열은 없어야 한다.

```text
ko text
ja text
en text
```

기반 dedupe가 없어야 한다.

---

# 23. F-04 / CH-03

실제 SangShen / Byeong / GuEung / Personality 결과가 존재해도:

```text
강점 3
과제 3
```

자동 확정 금지.

Expected:

```text
candidates may exist
selectionStatus = deferred
selection_rule_missing gap preserved
```

---

# 24. No-Byeong 실제 사례

실제 No-Byeong input에서:

```text
Byeong-derived challenge
```

를 Assembly가 강제로 만들지 않는지 확인한다.

---

# 25. Role non-exclusive 실제 사례

같은 원국 요소가 복수 역할을 가진 경우:

```text
RoleHistory
CurrentFunction
```

을 모두 provenance로 보존한다.

한 역할로 덮어쓰지 않는다.

---

# 26. stopped / inactive

현재 stopped/inactive 역할은:

```text
current operating semantic unit
```

으로 출력되지 않아야 한다.

역사적 provenance는 보존 가능.

---

# 27. reduced

현재 reduced 기능은:

```text
reduced
```

상태를 잃지 않는다.

confirmed operating으로 승격 금지.

---

# 28. expired LuckEffect

실제 lifecycle 결과에서 expired된 effect:

```text
current chapter unit = 0
```

이어야 한다.

History 참조는 허용.

---

# 29. inherited LuckEffect

하위 scope에 승계된 effect가 실제 현재 유효하면:

```text
same event identity / provenance
```

를 보존해야 한다.

중복 신규 event처럼 조립하지 않는다.

---

# 30. Scope integrity

각 실제 source 결과와 Assembly scope가 일치해야 한다.

```text
Natal → natal
Daewoon → daewoon
Sewoon → sewoon
Month → month
```

불일치 0.

---

# 31. Free Assembly

동일 실제 reading으로:

```text
productScope = free
```

Assembly 생성.

Expected customer chapter scopes:

```text
Natal only
```

---

# 32. Free 시기 누출

Free에서 다음 customer semantic unit:

```text
Daewoon = 0
Sewoon = 0
Month = 0
Day = 0
```

---

# 33. Premium Assembly

동일 실제 reading으로:

```text
productScope = premium
```

생성.

Premium은 B registry가 허용하는 범위에서
시기 unit를 포함할 수 있다.

---

# 34. W-99 실제 검증

같은 Natal fact가 Free/Premium 양쪽에 나타날 경우:

```text
semanticKey same
source IDs same
certainty same
direction same
```

이어야 한다.

---

# 35. Premium 방향 변경 금지

금지:

```text
Free: favorable
Premium: unfavorable
```

같은 동일 fact 방향 역전.

---

# 36. Premium depth

Premium에서 추가되는 것은:

```text
context
condition
timing
application
```

등의 추가 정보다.

새 원국 판단을 만들지 않는다.

---

# 37. Chapter Registry

실제 통합에서도:

```text
17/17
```

을 유지한다.

순서 변경:

```text
0
```

---

# 38. Chapter readiness

실제 데이터를 넣었다고 미구현 장이 READY가 되면 안 된다.

특히:

```text
CH-04 Work
CH-05 Money
CH-06 Relationship
CH-07 Health
CH-Q Question
```

의 P4-A gap을 보존한다.

---

# 39. Personality를 Outcome 대용으로 사용 금지

예:

```text
independent personality
→ CH-04 work outcome
```

생성 금지.

---

# 40. 財 관련 결과를 Money outcome으로 자동 승격 금지

Judgment에 財 관련 Fact가 있어도
CH-05 고객 돈 결과를 새로 만들지 않는다.

---

# 41. RelationshipStyle로 연애운 생성 금지

Personality relationshipStyle이 있어도:

```text
marriage timing
partner quality
relationship luck
```

생성 0.

---

# 42. Health 신규 의미 금지

오행/12운성/root/branch 관계를:

```text
disease
organ
health risk
```

로 변환하지 않는다.

---

# 43. CH-Q

질문 문자열이 있더라도:

```text
new answer semantic unit
```

자동 생성 0.

Question routing gap 유지.

---

# 44. F-02 핵심 구조 3

실제 Pattern/YongShen/Role 결과가 많아도:

```text
exact top 3
```

자동 선정하지 않는다.

---

# 45. CH-11 기억할 3

동일하게 자동 선정 금지.

---

# 46. ActualSemanticUnit count

P4-B의 249는 특정 검증 fixture의 값이다.

P4-C에서 **249라는 숫자를 고정 기대값으로 사용하지 않는다.**

실제 입력마다 unit 수는 달라질 수 있다.

검증해야 하는 것은:

```text
identity
provenance
dedupe
scope
readiness
```

이다.

---

# 47. 고객 Renderable

현재 Outcome Layer와 selection gap이 있으므로
전체 감정서:

```text
customerRenderable = false
```

유지가 예상된다.

실제 통합만 성공했다고 true로 바꾸지 않는다.

---

# 48. 부분 Renderability

필요하면 chapter별:

```text
customerRenderable
```

을 별도로 확인할 수 있다.

단 전체 paid reading 상태와 혼동하지 않는다.

---

# 49. F-03 준비 상태

Personality가 완성되어 있으므로
F-03이 실제 semantic data 기준으로 조립 가능한지 확인한다.

---

# 50. CH-02 준비 상태

P3까지 완성된 Personality 의미를 기반으로
어디까지 READY/PARTIAL인지 실제 결과로 검증한다.

B의 7면 전체 source gap이 있으면 그대로 유지.

---

# 51. CH-08

실제 Daewoon 결과를 넣어
chapter semantic routing 자체가 가능한지 확인한다.

과거 사건 생성 금지.

---

# 52. CH-09

실제 Sewoon 결과가 chapter에 연결되는지 확인.

올해/다음 해가 필요한데 현재 입력에 한 해만 있으면
필요 범위를 정확히 gap으로 보고한다.

임의 생성 금지.

---

# 53. CH-10

실제 12개월을 연결한다.

Expected:

```text
12 scopes routed
chronological
no best/worst ranking
```

---

# 54. Month identity

월 identity가:

```text
calendar month
```

와 혼동되지 않고
현재 Judgment의 절기월 identity를 그대로 사용해야 한다.

---

# 55. Month boundaries

가능하면 각 month의:

```text
start
end
```

경계가 Judgment 결과와 Assembly에서 동일한지 확인한다.

---

# 56. Day exclusion

Day Luck이 engine result에 존재하더라도
B 기본 17개 chapter routing에 자동 들어가지 않아야 한다.

Expected:

```text
day customer unit = 0
```

기본 Assembly 기준.

---

# 57. Customer Context

name 등 context가 존재해도
Assembly semantic meaning이 바뀌지 않아야 한다.

---

# 58. 생활 상태 추정 금지

CustomerContext에 정보가 없으면:

```text
spouse
children
boss
company
health condition
```

자동 추정 semantic unit = 0.

---

# 59. Unknown hour

실제 unknown-hour 지원 fixture가 있다면 통합한다.

Expected:

```text
hour-derived unit = 0
```

지원되지 않는 경우 억지 fixture를 만들지 말고
`NOT_TESTABLE_WITH_CURRENT_PIPELINE`로 보고한다.

---

# 60. Actual error behavior

필수 입력이 없을 때:

```text
silent fabricated fallback
```

이 없어야 한다.

명시적 gap 또는 validation error를 사용한다.

---

# 61. Assembly Validation

실제 통합 결과마다:

```text
validateReadingAssembly()
```

또는 동등 검증을 실행한다.

검사:

```text
duplicate IDs
orphan provenance
invalid chapter
scope leakage
locale text leakage
unsupported selection
unsupported outcome
```

---

# 62. Locale independence

ReadingAssembly 내부에:

```text
Korean customer sentence
Japanese customer sentence
English customer sentence
```

가 생성되지 않는지 확인한다.

---

# 63. Personality Renderer dependency

Assembly runtime에서:

```text
renderPersonalityKo
renderPersonalityJa
renderPersonalityEn
```

호출 0.

---

# 64. Reading Locale Renderer

아직 전체 Reading KO/JA/EN renderer를 구현하지 않는다.

이번 P4-C는 Assembly까지만.

---

# 65. LLM

통합 실행에서 LLM/API 호출 0.

---

# 66. Numeric scoring

신규:

```text
importance score
favorability score
chapter score
month score
```

0.

---

# 67. 구조 판정 수정 금지

Assembly 통합 때문에:

```text
PatternEffectPolicy
Role
Luck Runtime
Personality
```

를 수정하지 않는다.

문제가 있다면 Assembly bug인지 upstream bug인지 분리해서 보고한다.

---

# 68. Upstream bug 발견 시

현재 회귀와 모순되는 upstream 문제가 발견되면:

```text
UPSTREAM_REGRESSION
```

으로 분류한다.

P4-C에서 임의 수정하지 않는다.

---

# 69. Assembly bug

Assembly 자체 문제만:

```text
P4C_FIX_REQUIRED
```

범위에서 최소 수정 가능.

---

# 70. 권장 통합 테스트 스크립트

```text
scripts/verify-reading-assembly-integration-p4c.mjs
```

---

# 71. 최소 통합 테스트 그룹

## A. Actual pipeline

```text
Birth
→ Canonical
→ Judgment
→ Personality
→ ReadingAssembly
```

PASS.

## B. 12 actual months

12/12.

## C. Free scope

time leakage 0.

## D. Premium

direction mismatch 0.

## E. B-6

duplicate conclusion 0.

## F. lifecycle

expired current leakage 0.

## G. gaps

Outcome/selection gaps preserved.

---

# 72. 기존 회귀

반드시:

```text
P2-A~G PASS
P3-A~F PASS
P4-B PASS
Judgment 35/35 PASS
```

---

# 73. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 74. 결과 파일

```text
src/docs/codex/
p4c-reading-assembly-integration-audit-result.md
```

---

# 75. 최종 보고 A — 판정

```text
READY_FOR_READING_ASSEMBLY_CORE_COMPLETE
```

또는:

```text
P4C_FIX_REQUIRED
```

---

# 76. B — 실제 통합 경로

보고:

```text
Canonical:
Judgment:
Natal Personality:
Current Personality:
Daewoon:
Sewoon:
Months:
ReadingAssembly:
```

각 실제 연결 상태.

---

# 77. C — 실제 사례

사용한 fixture별:

| Fixture | Judgment | Personality | Assembly | Validation |
|---|---|---|---|---|

---

# 78. D — 12개월

```text
actual month count:
chronological:
boundary mismatch:
provenance mismatch:
scope mismatch:
best/worst auto selection:
```

---

# 79. E — Semantic integrity

```text
duplicate ID:
duplicate conclusion:
orphan provenance:
certainty mismatch:
scope mismatch:
expired leakage:
mutation:
```

모두 0 목표.

---

# 80. F — Free / Premium

```text
free Daewoon leakage:
free Sewoon leakage:
free Month leakage:
free Day leakage:

same Natal fact direction mismatch:
certainty mismatch:
provenance mismatch:
```

모두 0.

---

# 81. G — B-6

```text
same semantic identity preserved:
duplicate conclusion:
first occurrence mismatch:
later occurrence role mismatch:
```

---

# 82. H — Gap preservation

```text
Core structure Top-3:
Strength Top-3:
Challenge Top-3:
Remember Top-3:
Month ranking:

Work:
Money:
Relationship:
Health:
Question:
```

P4-A/P4-B 상태와 비교.

---

# 83. I — Architecture

```text
Assembly count:
language-specific assembly:
Judgment recalculation:
Personality renderer dependency:
locale text in Assembly:
LLM dependency:
```

Expected:

```text
1
0
0
0
0
0
```

---

# 84. J — Upstream integrity

```text
Judgment mutation:
Personality mutation:
Judgment source changes:
Personality semantic changes:
```

모두 0.

---

# 85. K — Regression

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

P4-B:
P4-C:

Judgment:
tsc:
build:
```

---

# 86. L — 남은 상태

```text
FAIL:
PARTIAL:
SOURCE_GAP:
ENGINE_GAP:
OUTCOME_LAYER_NOT_IMPLEMENTED:
SELECTION_RULE_MISSING:
DEFERRED:
TECH_DEBT:
UPSTREAM_REGRESSION:
```

---

# 87. 종료 조건

다음이면:

```text
READY_FOR_READING_ASSEMBLY_CORE_COMPLETE
```

판정한다.

```text
[ ] 실제 Canonical → Judgment → Personality → Assembly 통과
[ ] 실제 Daewoon 연결
[ ] 실제 Sewoon 연결
[ ] 실제 Month 12개 연결
[ ] month chronology 정상
[ ] month ranking 자동 생성 0
[ ] semantic duplicate 0
[ ] orphan provenance 0
[ ] scope mismatch 0
[ ] expired current leakage 0
[ ] upstream result mutation 0
[ ] Free time leakage 0
[ ] Free/Premium 방향 mismatch 0
[ ] B-6 duplicate conclusion 0
[ ] Top-3 자동 선정 0
[ ] Outcome 신규 판단 0
[ ] Gap 상태 보존
[ ] 전체 customerRenderable false 유지
[ ] Assembly 1개
[ ] locale-specific Assembly 0
[ ] Personality renderer dependency 0
[ ] Judgment recalculation 0
[ ] LLM 0
[ ] P2/P3/P4-B/Judgment 회귀 PASS
[ ] tsc/build PASS
```

---

# 88. P4-C 완료 의미

P4-C 통과는:

```text
Reading Assembly Core COMPLETE
```

를 의미한다.

이때 확정되는 것:

```text
Judgment
+
Personality
+
Luck
↓
하나의 language-neutral ReadingAssembly
```

통합 경로.

아직 확정되지 않는 것:

```text
Full Customer Reading
Work Outcome
Money Outcome
Relationship Outcome
Health Outcome
Question Answer
Top-3 selections
Monthly final ranking
KO/JA/EN Full Reading Renderer
```

---

# 89. 다음 단계 선정

P4-C가 통과하면 다음 작업은
P4-A/P4-C의 남은 gap을 기준으로 결정한다.

후보는 크게 두 계층이다.

```text
A. Selection Layer
- 핵심 구조 3
- 강점 3
- 과제 3
- 기억할 3

B. Outcome Semantic Layer
- Work
- Money
- Relationship
- Health
- Question routing
```

P4-C 결과를 보기 전에는 어느 쪽을 먼저 구현할지 확정하지 않는다.

---

# 90. 중요한 금지

P4-C를 통과시키기 위해 미완성 영역을 임시 하드코딩하지 않는다.

특히:

```text
fixture-specific top3
fixture-specific best month
fixture-specific work outcome
fixture-specific money outcome
fixture-specific relationship outcome
fixture-specific health outcome
```

전부 금지.

Gap을 남긴 채 통합이 정확하게 작동하는 것이 이번 단계의 성공 조건이다.