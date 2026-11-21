# FILUNE Compatibility-02
## Policy Decision — Continue C2

현재 상태:

```text
COMPATIBILITY_C2_POLICY_DECISION_REQUIRED
```

두 정책 질문에 대해 다음과 같이 승인한다.

---

# APPROVED DECISION 1

```text
Decision 1 = Option A
```

## 승인 내용

Compatibility-01의 기존 Cross-chart Fact 네 계열에
C2 구조 효과를 확정하는 데 필요한 **경로 단위 근거를 additive 방식으로 보강**한다.

허용되는 추가 정보는 다음 목적에 한정한다.

```text
어느 기존 Role / Function / Byeong path를 대상으로 하는가

그 대상이:
- required function인지
- harmful function인지
- Byeong actor/path인지

교차 작용이 실제로:
- stopped
- weakened
- generated/supported
- root-supported

중 무엇을 일으켰는가

그 결과:
- harmful path가 차단되었는가
- harmful path가 약화되었는가
- harmful path가 활성화/강화되었는가
- required function이 지원되었는가
- required function이 손상되었는가
```

---

# 1. 기존 Fact를 버리지 않는다

Compatibility-01의 다음 구조를 유지한다.

```text
CrossStemInteractionFact
CrossBranchInteractionFact
CrossRootSupportFact
CrossRoleInteractionFact
```

새로운 별도 의미 엔진을 만들지 않는다.

필요한 evidence/linkage 필드만 additive하게 보강한다.

---

# 2. C1 기존 의미 변경 금지

기존 C1에서 확정한:

```text
combine → Compatibility Runtime stopped
control → Compatibility Runtime weakened

Judgment mutation = 0
RootState mutation = 0

A→B / B→A direction
stable ID
provenance
```

를 변경하지 않는다.

---

# 3. 경로 근거 필수

다음과 같은 추론은 금지한다.

```text
role 이름만 같음
→ 병 해소

십성 같음
→ required support

stem 같음
→ 같은 target path

root 제공
→ 무조건 favorable
```

반드시 기존 Judgment의 실제:

```text
RoleHistory
CurrentFunction
ActualStructuralFunction
Byeong path
source/target identity
relation/effect identity
```

를 연결한다.

---

# 4. Byeong relief evidence

`relieves_byeong`을 생성하려면 최소:

```text
targetByeongId
target harmful actor/path
cross interaction
compatibility runtime effect
실제 harmful action 차단 여부
```

가 추적 가능해야 한다.

---

# 5. weakened Byeong

control 때문에 harmful actor가 weakened되었지만
path가 완전히 끊기지 않았다면:

```text
weakens_byeong
```

으로 분리한다.

`relieves_byeong`과 동일 취급하지 않는다.

---

# 6. harmful activation evidence

다음은 실제 target linkage가 있을 때만 생성한다.

```text
activates_byeong
strengthens_harmful_path
```

예:

```text
상대가 Byeong actor에 root 제공
상대가 harmful actor를 generate/support
```

---

# 7. required function evidence

`supports_required_function` 또는
`damages_required_function`은

단순 Role 이름이 아니라
현재 구조에서 실제 필요한 기능임이 확인되어야 한다.

---

# 8. CrossRootSupport

CrossRootSupportFact에는
receiver stem/function linkage를 추가할 수 있다.

하지만 개인 RootState에는 쓰지 않는다.

```text
RootState mutation = 0
```

---

# 9. 기존 source fixture 기대 의미 변경 금지

C1 source snapshot에서:

```text
relief candidate
path contact
```

로 남아 있던 항목을
단순히 테스트 통과를 위해 confirmed로 바꾸지 않는다.

새로운 path evidence가 실제 연결되는 경우만 승격한다.

---

# APPROVED DECISION 2

```text
Decision 2 = Option A
```

## 신규 판정값 승인

핵심 유리 효과와 핵심 불리 효과가
같은 구조 우선순위에서 모두 확정되고,

어느 한쪽이 상대 효과를 실제로 제거하거나
구조적으로 우세하다는 근거가 없으면:

```text
balanced_mixed
```

를 사용한다.

---

# 10. balanced_mixed의 의미

`balanced_mixed`는:

```text
근거 부족
판단 불가
애매함
```

이 아니다.

정확한 의미:

```text
핵심 유리 효과가 confirmed
+
핵심 불리 효과가 confirmed
+
둘 사이에 구조적 우세 근거 없음
```

이다.

따라서 **확정 판정**이다.

---

# 11. 기존 verdict 체계

최종 directional verdict:

```text
favorable
favorable_dominant
balanced_mixed
minor_effect
unfavorable_dominant
unfavorable
```

---

# 12. deferred와 완전히 분리

```text
balanced_mixed
≠ deferred
```

`deferred`는 필요한 사실 자체가 부족한 경우만 허용한다.

---

# 13. favorable_dominant

유리/불리 효과 모두 존재하지만
구조적으로 유리 효과가 우세한 명확한 근거가 있으면:

```text
favorable_dominant
```

---

# 14. unfavorable_dominant

반대로 불리 효과가 구조적으로 우세하면:

```text
unfavorable_dominant
```

---

# 15. balanced_mixed

다음 경우:

```text
핵심 Byeong relief confirmed
+
별개의 핵심 harmful activation confirmed
+
서로 제거하지 않음
+
우세 근거 없음
```

이라면:

```text
balanced_mixed
```

---

# 16. 숫자/개수 동률해소 금지

금지:

```text
좋은 effect 3
나쁜 effect 2
→ favorable

severity score
weighted score
priority number
```

구조 경로만 사용한다.

---

# 17. 입력 순서로 우세 결정 금지

```text
먼저 발견된 effect
먼저 배열에 들어간 effect
A→B라서 우선
```

등으로 판정하지 않는다.

---

# 18. 결과 축은 계속 보존

`balanced_mixed`가 나오더라도
아래 실제 효과 배열을 삭제하거나 합치지 않는다.

```text
supportEffects[]
damageEffects[]

relieves_byeong
activates_byeong

supports_required_function
damages_required_function

supports_required_root
supports_harmful_root
```

verdict는 요약일 뿐이다.

---

# 19. 예시

예:

```text
B → A

A가 가진 핵심 Byeong X
→ B의 작용으로 stopped
→ relieves_byeong

동시에

A가 가진 별개의 핵심 required function Y
→ B의 작용으로 stopped
→ damages_required_function
```

둘 다 동급 핵심이고
우세 근거가 없다면:

```text
B → A = balanced_mixed
```

이는:

```text
좋은지 나쁜지 모름
```

이라는 뜻이 아니다.

```text
상대가 한 핵심 문제는 해결하지만,
동시에 다른 핵심 기능도 크게 손상시킨다.
```

라는 확정 구조다.

---

# 20. Master 16 반영

다음에 이번 승인 내용을 기록한다.

```text
src/docs/rules/master/16-compatibility-spec.md
```

추가할 것:

```text
경로 단위 evidence contract
C1 Fact evidence extension
structural effect confirmation requirement
balanced_mixed verdict
deferred와 balanced_mixed 구분
```

---

# 21. C2 구현 계속

정책 결정 후 기존 C2 구현을 이어간다.

구현 대상:

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

---

# 22. C1 regression

Fact schema를 additive하게 확장하므로
기존 Compatibility-01 검증을 반드시 다시 실행한다.

Expected:

```text
existing C1 expected meaning changes = 0
existing C1 fixture changes = 0
```

---

# 23. Targeted C2 tests

최소:

```text
confirmed path relief
confirmed path weakening
confirmed harmful activation
confirmed required support
confirmed required damage

required root support
harmful root support

favorable
favorable_dominant
balanced_mixed
minor_effect
unfavorable_dominant
unfavorable
```

각 verdict가 최소 한 번 검증 가능하도록 한다.

단 source fixture가 없는 verdict는
synthetic contract fixture 사용 가능.

---

# 24. Source fixture 조작 금지

C1에서 사용한 원자료 snapshot과
기존 expected facts는 변경하지 않는다.

새 evidence linkage가 실제로 얻어지는 경우에만
C2 effect를 생성한다.

---

# 25. 기존 엔진 isolation

Expected:

```text
Judgment semantic changes = 0
Personality changes = 0

Money changes = 0
Health changes = 0
Relationship changes = 0
Event Timing changes = 0

Reading customer output changes = 0
```

---

# 26. 신규 규칙 추가 금지

이번 결정은 다음을 승인하지 않는다.

```text
원진
귀문
격각
새 암합

성격 궁합
결혼 시기
이혼 시기

배우자 결과
궁합 고객 문장
```

---

# 27. 검증

반드시:

```text
Compatibility-01
Compatibility-02 targeted verifier

Judgment 35/35
Role/Byeong regression
Root regression
Branch regression

Money
Health
Relationship
Personality
Event Timing Batch 1

npx tsc -b
npm run build
git diff --check
```

---

# 28. 결과 파일

기존 결과 파일을 현재 상태로 갱신:

```text
src/docs/codex/compatibility-02-structural-policy-result.md
```

추가로 decision history가 필요하면 현재 이 decision 문서를 참조한다.

---

# 29. 필수 최종 보고

```text
C1 Fact evidence fields added:
C1 semantic changes:

Structural effects:
A→B:
B→A:

relieves_byeong:
weakens_byeong:
activates_byeong:
strengthens_harmful_path:

supports_required_function:
damages_required_function:

supports_required_root:
supports_harmful_root:

favorable:
favorable_dominant:
balanced_mixed:
minor_effect:
unfavorable_dominant:
unfavorable:

deferred:

mixed effect preservation:
asymmetric preservation:

duplicate IDs:
orphan evidence:
mutation:
```

---

# 30. 최종 판정

모든 조건이 충족되면:

```text
COMPATIBILITY_STRUCTURAL_POLICY_READY
```

실제 새로운 사용자 정책 결정이 또 필요하면:

```text
COMPATIBILITY_C2_POLICY_DECISION_REQUIRED
```

로 다시 중단한다.

단 이미 이번 문서에서 승인한 두 사안을
다시 질문하지 않는다.