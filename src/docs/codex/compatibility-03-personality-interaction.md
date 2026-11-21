# FILUNE Compatibility-03
## Personality Interaction

진입 조건:

```text
COMPATIBILITY_STRUCTURAL_POLICY_READY
```

현재까지 완료:

```text
Compatibility-01
Cross-chart Fact Engine

Compatibility-02
Structural Compatibility Policy
```

이번 단계는 기존 Personality Engine 결과를 사용하여
두 사람의 **성격 상호작용**을 계산한다.

개인의 Personality Engine을 다시 만들거나 수정하지 않는다.

---

# ALLOWED SOURCES

이번 단계에서 사용할 수 있는 규칙 근거는 아래로 제한한다.

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
src/docs/rules/master/16-compatibility-spec.md

src/docs/codex/compatibility-02-structural-policy-result.md

현재 src/lib/personality/의 public output/type
현재 src/lib/compatibility/의 C1/C2 output
```

필요할 경우에만:

```text
src/docs/source/primary/07-사주풀이예시.md
```

의 **실제 궁합 사례에서 성격 상호작용을 직접 말한 부분**을 사용할 수 있다.

과거 분석 문서,
옛 revision,
과거 Codex 결과를 새 규칙 근거로 사용하지 않는다.

---

# FIXED RULES

## P-01

```text
Personality A
Personality B
```

는 Compatibility 때문에 변경하지 않는다.

---

## P-02

성격 상호작용은:

```text
Structural Compatibility
```

와 별도 결과다.

성격이 잘 맞는다는 이유로
구조적으로 불리한 관계를 favorable로 뒤집지 않는다.

반대도 동일하다.

---

## P-03

같은 성향:

```text
same trait
→ automatically compatible
```

금지.

---

## P-04

반대 성향:

```text
opposite traits
→ automatically complementary
```

금지.

---

## P-05

숫자 점수 금지.

```text
compatibility score
percentage
weighted score
```

사용하지 않는다.

---

# OUT OF SCOPE

이번 C3에서는 다음을 구현하지 않는다.

```text
결혼 시기
이별·이혼 위험 시기
관계 진전 시기

future luck interaction

원진
귀문
격각

고객용 궁합 문장
KO/JA/EN renderer
```

위 항목은 C4 이후 범위다.

---

# 1. 최종 목표

정책 근거가 충분하여 구현 가능하면:

```text
COMPATIBILITY_PERSONALITY_INTERACTION_READY
```

정책 결정이 필요하면:

```text
COMPATIBILITY_C3_POLICY_DECISION_REQUIRED
```

코드 문제면:

```text
COMPATIBILITY_C3_FIX_REQUIRED
```

---

# 2. 먼저 PersonalityResult 계약 확인

현재 Personality Engine이 실제 제공하는:

```text
PersonalityFact
traits
modifiers
conflicts
Natal expression
Current expression
certainty
provenance
```

및 실제 canonical 필드를 확인한다.

없는 필드를 새로 가정하지 않는다.

---

# 3. Natal Personality를 기본으로 사용

정적 궁합에서는:

```text
Natal Personality A
Natal Personality B
```

를 기본 입력으로 한다.

Current Personality는 C4의 시기 변화와 연결할 수 있도록
이번에는 판정 근거로 섞지 않는다.

---

# 4. Personality Interaction은 방향성 가능

필요한 경우:

```text
A's trait affects B
B's trait affects A
```

를 구분한다.

성격 궁합도 반드시 대칭이라고 가정하지 않는다.

---

# 5. 기존 내부 trait identity 우선

Personality Engine에
언어 독립적인 canonical trait / fact identity가 있다면
그 ID를 사용한다.

한국어 문장끼리 문자열 비교하여
성격을 판정하지 않는다.

---

# 6. canonical ID가 없는 경우

고객 문장을 parsing해서
새 trait를 추정하지 않는다.

그 경우:

```text
PERSONALITY_FACT_GAP
```

으로 기록한다.

---

# 7. 먼저 실제 상호작용 근거를 inventory

현재 source/master에서 직접 지원하는
Personality Interaction 유형을 조사한다.

최소 확인 대상:

```text
communication
expression
decision style
independence / control
caution / suspicion
risk orientation
emotional response
conflict response
```

단 실제 source 또는 현재 PersonalityResult가 지원하는 축만 사용한다.

---

# 8. 실제 source example 우선

전문가 궁합 사례에서 명시적으로:

```text
둘 다 특정 성향이 강함
→ 의심 증가
→ 표현 감소
→ 대화 감소
```

처럼 **두 사람의 성향 조합 → 관계 과정**을 직접 연결한 경우를 inventory한다.

이러한 사례는:

```text
SOURCE_EXPLICIT
```

로 분류한다.

---

# 9. 일반 심리학 규칙 임의 추가 금지

예:

```text
내향형 + 외향형 = complementary
둘 다 독립적 = conflict
감성형 + 이성형 = good
```

같은 일반론을
FILUNE Personality Compatibility 규칙으로 넣지 않는다.

---

# 10. Interaction Fact 후보

현재 근거로 충분하면 다음과 같은 내부 Fact를 사용할 수 있다.

```text
PersonalityInteractionFact
```

최소 개념 필드:

```text
id

personA
personB

traitAId
traitBId

interactionType

direction
certainty

sourceFactIds
provenance
```

실제 타입명은 repository convention을 따른다.

---

# 11. Interaction type은 근거가 있는 것만

예시 후보:

```text
reinforces_expression
reinforces_restraint

communication_support
communication_friction

decision_support
decision_friction

mutual_caution
mutual_competition

complementary_expression
```

이 이름을 그대로 구현하라는 뜻이 아니다.

현재 source/master에서
실제로 확정 가능한 interaction만 채택한다.

---

# 12. "보완"의 증명

두 성향이 다르다는 이유만으로:

```text
complementary
```

를 만들지 않는다.

실제로:

```text
A의 약한 표현 기능을
B의 성향이 관계 과정에서 보완
```

처럼 근거가 있어야 한다.

---

# 13. "마찰"의 증명

같은 성향이라는 이유만으로:

```text
friction
```

을 만들지 않는다.

실제 source/Personality 구조상
서로 증폭되어 관계 과정에서 부담이 되는 경우만 사용한다.

---

# 14. Individual trait 자체의 good/bad 금지

```text
독립적 = bad
신중함 = good
직설적 = bad
```

같은 성격 평가 금지.

Interaction context만 판정한다.

---

# 15. Personality contradiction 보존

한 사람 내부에서도:

```text
outward active
+
internally cautious
```

처럼 상반된 Personality Facts가 공존할 수 있다.

하나만 골라서 pair interaction을 만들지 않는다.

---

# 16. Interaction mixed 보존

A/B 사이에도:

```text
communication support
+
decision friction
```

이 동시에 존재할 수 있다.

둘 다 보존한다.

---

# 17. Personality verdict를 바로 평균내지 않는다

이번 단계에서 가능하면 방향/축별 결과를 보존한다.

예:

```text
communication = favorable
decision style = friction
expression = favorable
```

이를 개수로 평균내지 않는다.

---

# 18. Personality qualitative summary

근거가 충분하면 후속 summary로:

```text
favorable
favorable_dominant
balanced_mixed
minor_effect
unfavorable_dominant
unfavorable
```

를 재사용할 수 있다.

단 C2 structural verdict와 별도로 저장한다.

---

# 19. balanced_mixed 의미 유지

```text
balanced_mixed
```

는 판단 불가가 아니다.

성격 축에서도:

```text
강한 긍정 상호작용
+
강한 부정 상호작용
+
우열 근거 없음
```

이면 사용할 수 있다.

---

# 20. 근거 부족이면 deferred

실제 Personality Fact가 부족하거나
interaction policy가 없는 경우만:

```text
deferred
```

허용.

---

# 21. 새로운 정책이 필요한 경우

아래와 같은 상황이 나오면
Codex가 임의 결정하지 않는다.

예:

```text
두 사람 모두 독립성이 강할 때
경쟁인가 존중인가?

한 사람은 직설적이고
한 사람은 민감할 때
항상 마찰인가?

상반된 risk orientation을
보완으로 볼 것인가 부담으로 볼 것인가?
```

현재 source/master에 명시적 근거가 없으면:

```text
COMPATIBILITY_C3_POLICY_DECISION_REQUIRED
```

로 중단한다.

---

# 22. Policy Decision 보고 형식

반드시:

```text
Question:

Observed Personality Facts:

Existing FILUNE support:

Source support:

Option A:

Option B:

Engine consequence:
```

형식으로 보고한다.

사용자 승인 전 구현하지 않는다.

---

# 23. C2와 결합 금지

C3 Personality result 때문에:

```text
C2 structural verdict
```

를 변경하지 않는다.

예:

```text
Structural = unfavorable
Personality = favorable
```

가능.

둘 다 보존한다.

---

# 24. Source Fixture

Compatibility-01/C2에서 사용한
원자료 궁합 사례를 우선 재사용한다.

그 사례에 실제 성격 해석이 있는 경우만
Personality Interaction expected value를 만든다.

---

# 25. 없는 source expected 값 발명 금지

원자료가 구조 궁합만 말하고
성격 상호작용을 말하지 않았다면
그 사례에 personality expected를 억지로 추가하지 않는다.

---

# 26. Synthetic fixture

source에서 직접 검증할 수 없는
순수 contract-level interaction은
현재 확정 Personality Policy에 대해서만 synthetic fixture 허용.

새 정책을 synthetic fixture로 발명하지 않는다.

---

# 27. 결과 보존

최종 C3 결과는 최소:

```text
PersonalityInteractionFact[]
PersonalityAxisResult[]
DirectionalPersonalityResult
```

또는 현행 convention에 맞는 동등 구조를 가진다.

---

# 28. Structural + Personality 병합은 아직 하지 않는다

C3에서:

```text
Final Compatibility
```

를 만들지 않는다.

다음처럼 분리 유지:

```text
Structural Compatibility Result
Personality Compatibility Result
```

---

# 29. 개인 Personality mutation 금지

Expected:

```text
Personality A mutation = 0
Personality B mutation = 0
```

---

# 30. 기존 엔진 isolation

Expected semantic changes:

```text
Judgment = 0
Money = 0
Health = 0
Relationship = 0
Event Timing = 0
Structural Compatibility C2 = 0
```

---

# 31. 신규 verifier

권장:

```text
scripts/verify-compatibility-personality-c3.mjs
```

---

# 32. 필수 검증

가능한 승인 범위에서:

```text
interaction facts
A→B
B→A

communication
expression
decision
other approved axes

mixed preserved
asymmetric preserved

personality verdict
```

---

# 33. Identity

Expected:

```text
duplicate IDs = 0
unstable IDs = 0
orphan provenance = 0
```

---

# 34. Regression

최소:

```text
Compatibility C1
Compatibility C2

Personality Engine
Personality Renderer regression

Judgment 35/35
Money
Health
Relationship
Event Timing
```

기대값 변경 금지.

---

# 35. TypeScript / Build

```text
npx tsc -b
npm run build
git diff --check
```

PASS.

---

# 36. Master 16 업데이트

새로운 Personality Compatibility 정책이
실제로 사용자 승인 또는 source로 확정된 경우만:

```text
src/docs/rules/master/16-compatibility-spec.md
```

에 추가한다.

미결정 후보는 Master에 확정 규칙으로 기록하지 않는다.

---

# 37. 결과 파일

```text
src/docs/codex/compatibility-03-personality-interaction-result.md
```

---

# 38. 성공 판정

실제 필요한 Personality Interaction 정책이
모두 현재 source/master로 확정 가능하고 구현·검증되면:

```text
COMPATIBILITY_PERSONALITY_INTERACTION_READY
```

---

# 39. 정책 결정 필요 시

한 항목이라도
새 사용자 판단이 필요하면:

```text
COMPATIBILITY_C3_POLICY_DECISION_REQUIRED
```

로 중단한다.

정책을 임의로 채우지 않는다.

---

# 40. 다음 단계

C3 완료 후:

```text
Compatibility-04
Relationship Lifecycle & Timing
```

으로 이동한다.

C4 범위:

```text
관계 진전 가능 시기
결혼 가능 시기
결혼에 유리한 시기
결혼에 부담이 큰 시기
관계 부담 증가 시기
이별·이혼 위험 상승 시기
```

C4에서는 현재 Luck/Judgment/Event Timing을 최대한 재사용하며,
개인 운과 두 사람의 Compatibility baseline을 분리해서 처리한다.