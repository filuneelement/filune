# FILUNE Compatibility-03
## Personality Interaction Policy Decision — Resource / Output Dynamic Rule

현재 상태:

```text
COMPATIBILITY_C3_POLICY_DECISION_REQUIRED
```

사용자 승인 정책:

```text
인성이 우세하면 식상 기능은 약해진다.

인성이 매우 왕하면
식상에 해당하는 표현·발산 기능이 억제되어
생각이나 감정을 밖으로 표현하는 기능이 부족해진다.

반대로 현재 운에서
인성이 제압·약화되고
식상에 실제 힘이 실리면
해당 표현 기능은 좋아진다.
```

이것을 FILUNE의 확정 Personality 작용 규칙으로 사용한다.

---

# 1. 핵심 원칙

다음 경로를 확정한다.

```text
Resource dominance
↓
Output function suppression
↓
Expression constraint
```

즉:

```text
인성 우세
→ 식상 기능 약화
→ 표현 기능 억제
```

는 별도의 추가 추론이 아니라
FILUNE Personality의 구조적 작용으로 본다.

---

# 2. 보수적 유보 금지

인성 우세가 canonical하게 확정되어 있으면:

```text
식상 억제 가능성 있음
표현이 약할 수도 있음
```

처럼 약화하지 않는다.

내부 결과:

```text
output_function_suppressed = confirmed
expression_constraint = confirmed
```

으로 처리한다.

---

# 3. 인성이 매우 왕한 경우

현재 Personality Engine에서
인성의 강한 우세가 확정되면
표현 억제도 명확히 기록한다.

예:

```text
resource prominence = very_prominent
또는 현행 canonical 동등 상태
```

이면:

```text
output suppression = confirmed
expression constraint = confirmed
```

---

# 4. 새 숫자 threshold 금지

인성 글자 개수나 점수로
새 기준을 만들지 않는다.

금지:

```text
인성 3개 이상
70점 이상
resourceScore
outputScore
```

현재 FILUNE Personality / Judgment에서 이미 확정하는
질적 우세 상태를 사용한다.

---

# 5. 기존 prominence 체계 재사용

현재 Personality Engine의:

```text
low
present
prominent
very_prominent
```

또는 실제 canonical 동등 상태를 확인한다.

새로운 독립 strength scoring을 만들지 않는다.

---

# 6. Natal Personality

원국에서 인성이 우세하면:

```text
Natal Resource Dominance
↓
Natal Output Suppression
↓
Natal Expression Constraint
```

을 기록한다.

이것은 기본 성향이다.

---

# 7. Current Personality 분리

Natal Personality를 지우지 않는다.

구조:

```text
Natal Personality
+
Current Luck Effects
↓
Current Personality Expression
```

으로 처리한다.

---

# 8. 현재 운에서 표현 기능 회복

현재 scope에서 다음 두 작용이 실제 확인되면:

```text
1. 인성 기능이 제압·약화됨
2. 식상 기능이 활성·강화·통근됨
```

현재 표현 억제가 완화된다.

내부 효과:

```text
current_expression_relief = confirmed
```

또는 현행 convention에 맞는 동등 semantic을 사용한다.

---

# 9. 구체적인 Current 경로

예:

```text
Natal:
Resource dominant
→ Output suppressed
→ Expression constrained

Current:
Resource weakened
+
Output strengthened
↓
Current expression improves
```

이 경우:

```text
Natal expression constraint = 유지
Current expression constraint = reduced
Current expression relief = confirmed
```

으로 분리한다.

---

# 10. 원국 성향 삭제 금지

운에서 식상이 살아났다고:

```text
Natal Resource Dominance 삭제
Natal Expression Constraint 삭제
```

하지 않는다.

운은 현재 발현을 바꾸는 것이다.

---

# 11. 반대 방향도 동일

현재 운에서:

```text
Resource strengthened
또는
Output weakened/stopped
```

되어 기존 표현 억제 경로가 실제 강화되면:

```text
current_expression_constraint_strengthened
```

을 기록할 수 있다.

단 실제 Current Judgment/Luck Fact가 있어야 한다.

---

# 12. 역할이 실제로 작동해야 함

단순히 운에:

```text
인성 글자 등장
식상 글자 등장
```

만으로 현재 성격을 바꾸지 않는다.

반드시 기존 Judgment에서:

```text
active
operating
strengthened
weakened
stopped
root-supported
```

등 실제 작용이 확인되어야 한다.

---

# 13. Compatibility Pair Rule

각 사람에 대해 먼저:

```text
resourceDominance
outputSuppression
expressionConstraint
```

를 판단한다.

---

# 14. 양쪽 모두 해당

다음이 모두 confirmed이면:

```text
A.resourceDominance = confirmed
A.expressionConstraint = confirmed

B.resourceDominance = confirmed
B.expressionConstraint = confirmed
```

pair interaction:

```text
mutual_expression_restraint = confirmed
communication_friction = confirmed
```

으로 판정한다.

---

# 15. 이 결과는 확정 효과

위 구조가 확인된 경우:

```text
대화가 줄어들 가능성이 있을 수 있음
```

처럼 보수적으로 축소하지 않는다.

내부 결과는:

```text
communication_friction = confirmed
```

이다.

고객 renderer에서만 자연스러운 생활 언어로 변환한다.

---

# 16. 한쪽만 해당하는 경우

예:

```text
A expression constrained
B expression unconstrained
```

이면 양방향 `mutual_expression_restraint`는 만들지 않는다.

대신 방향성을 보존할 수 있다.

예:

```text
A → B
expression_withholding

B → A
no matching restraint effect
```

실제 naming은 구현 convention에 맞춘다.

---

# 17. Current Compatibility Expression

두 사람 모두 Natal에서는 표현 억제가 있더라도
현재 운에서 한 사람 또는 양쪽의 표현 기능이 회복될 수 있다.

예:

```text
Natal:
A constrained
B constrained
→ communication friction

Current:
A Resource weakened + Output strengthened
B Resource weakened + Output strengthened
↓
current communication friction reduced
```

---

# 18. Natal Compatibility와 Current Compatibility 분리

반드시:

```text
Natal Personality Compatibility
Current Personality Compatibility
```

를 구분한다.

현재 운이 좋아졌다고
Natal interaction history를 지우지 않는다.

---

# 19. 한 사람만 회복되는 경우

예:

```text
A current expression relieved
B still constrained
```

이면:

```text
mutual friction 완전 해소
```

로 만들지 않는다.

현재 pair state는
한쪽 개선을 반영한 별도 상태로 둔다.

실제 판정은 확인된 양쪽 current facts를 사용한다.

---

# 20. 현재 운으로 관계 표현이 좋아지는 경우

두 사람의 Current Facts가
실제로 기존 표현 억제 경로를 완화하면:

```text
communication_relief = confirmed
```

할 수 있다.

보수적으로:

```text
대화가 좋아질 수도 있음
```

으로 약화하지 않는다.

---

# 21. 현재 운으로 악화되는 경우

반대로 두 사람 중 한쪽 또는 양쪽에서
인성이 더 강해지고 식상 기능이 더 억제되어
기존 communication friction이 실제 강화되면:

```text
communication_friction_strengthened
```

을 기록한다.

---

# 22. 이것이 향후 C4와 연결되는 방식

C3는:

```text
무슨 성격 작용이 발생하는가
```

를 판정한다.

C4는:

```text
언제 그 작용이 강해지거나 완화되는가
```

를 판정한다.

따라서 C3에서 current-scope effect를 생성하되
Gregorian 관계 시기를 임의 계산하지 않는다.

---

# 23. C4에서 사용할 수 있도록 provenance 보존

각 Current Personality Interaction에는:

```text
person
scope
scopeId
source PersonalityFact IDs
source Judgment/Luck Fact IDs
interaction ID
```

를 추적 가능하게 한다.

---

# 24. Source case C00-03

원자료 사례에서는:

```text
두 사람 모두 인성 왕
+
둘 다 식상 약
↓
표현 서툼
↓
시간이 갈수록 대화 감소
```

경로가 확인되어 있다.

Expected:

```text
A.resourceDominance = confirmed
A.outputSuppression = confirmed
A.expressionConstraint = confirmed

B.resourceDominance = confirmed
B.outputSuppression = confirmed
B.expressionConstraint = confirmed

mutual_expression_restraint = confirmed
communication_friction = confirmed
```

---

# 25. source fixture 전용 shortcut 금지

일반 사용자 입력에서도:

```text
BirthInput
↓
Judgment
↓
Personality
↓
Resource / Output state
↓
Personality Interaction
```

경로로 동일한 결과를 만들 수 있어야 한다.

---

# 26. 표현 기능이 회복되는 fixture 필수

Synthetic 또는 기존 확인 가능한 fixture에서:

```text
Natal:
Resource dominant
Output suppressed

Current:
Resource weakened
Output strengthened
```

을 구성한다.

Expected:

```text
current_expression_relief = confirmed
```

---

# 27. 반대 fixture도 검증

```text
Natal:
Expression normal or constrained

Current:
Resource strengthened
Output weakened
```

으로 기존 표현 기능이 더 억제되는 경로도
현재 확정 규칙으로 검증한다.

---

# 28. Personality Engine 책임

이 규칙은 Compatibility만의 예외가 아니다.

따라서 개인 Personality의:

```text
Natal → Current expression
```

에서도 동일한 의미를 사용할 수 있어야 한다.

필요하면 현재 Master 11에
이 승인 규칙만 additive하게 기록한다.

기존 Personality 규칙을 재감사하지 않는다.

---

# 29. Master 반영

다음 두 문서에 역할을 구분해 기록한다.

```text
src/docs/rules/master/11-personality-master.md
```

추가:

```text
Resource dominance
→ Output suppression
→ expression constraint

Current Resource weakening + Output strengthening
→ current expression relief
```

그리고:

```text
src/docs/rules/master/16-compatibility-spec.md
```

추가:

```text
양쪽 expression constraint
→ mutual expression restraint
→ communication friction

Current expression relief
→ current pair communication relief
```

---

# 30. 임의 성격 궁합 확대 금지

이번 승인으로 다음은 자동 승인되지 않는다.

```text
비견 강함 + 비견 강함
겁재 강함 + 겁재 강함
재성 강함 + 재성 강함
관성 강함 + 관성 강함
상반된 성격끼리 보완
```

필요하면 별도 근거 또는 사용자 결정이 필요하다.

---

# 31. 보수적 출력 금지 원칙

확정된 구조 경로가 있으면
확정 효과로 기록한다.

```text
confirmed structural path
→ confirmed personality effect
```

다음 식으로 약화 금지:

```text
might
possibly
could perhaps
```

단 실제 Fact가 부족하면 그 Fact만 deferred 한다.

---

# 32. 검증

최소 검증:

```text
C00-03 source fixture

general Resource-dominant pair
Current expression relief fixture
Current expression worsening fixture
one-side-only fixture

Compatibility C1
Compatibility C2

Personality Engine
Personality Renderer

Judgment 35/35
TypeScript
Build
git diff --check
```

---

# 33. 기존 의미 변경

Expected:

```text
existing Personality semantic changes = 0
existing Structural Compatibility changes = 0
Judgment semantic changes = 0
```

추가 규칙만 additive하게 동작해야 한다.

---

# 34. 최종 판정

승인 범위가 구현되고 검증되면:

```text
COMPATIBILITY_PERSONALITY_INTERACTION_READY
```

새로운 성격 조합 규칙이 필요하면:

```text
COMPATIBILITY_C3_POLICY_DECISION_REQUIRED
```

로 중단한다.

이번에 승인한:

```text
Resource dominance
→ Output suppression
→ Expression constraint

Current Resource weakening
+
Current Output strengthening
→ Expression relief
```

규칙은 다시 질문하지 않는다.