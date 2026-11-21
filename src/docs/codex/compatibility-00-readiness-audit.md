# FILUNE Compatibility-00
## Compatibility Engine Implementation Readiness Audit — FILUNE Authority First

현재 상태:

```text
EVENT_TIMING_BATCH1_COMPLETE
```

이번 단계부터 Compatibility Engine을 준비한다.

이번 작업은 구현 전 Readiness Audit이다.

```text
src/lib 구현 금지
Compatibility Engine 구현 금지
새 점수 공식 금지
새 명리 규칙 발명 금지
```

---

# 1. 가장 중요한 Authority 원칙

이번 작업에서는 다음 우선순위를 절대적으로 적용한다.

```text
1. 현재 FILUNE rules/master
2. 현재 FILUNE rules/authority 및 승인된 override
3. 전문가 원자료
4. 과거 revision / 과거 audit / historical source
```

이미 FILUNE에서 확정된 규칙을
원자료의 용어나 과거 revision 때문에 다시 열지 않는다.

---

# 2. 이미 확정된 FILUNE 규칙은 재논쟁 금지

다음은 이번 Compatibility audit에서
`SOURCE_CONFLICT`로 다시 올리지 않는다.

```text
삼합
반합
방합
육합
충
형
파
해
통근
천간합
stop / weakened
RoleHistory
CurrentFunction
Byeong / GuEung
```

현행 FILUNE master를 그대로 적용한다.

---

# 3. 원자료의 용어가 FILUNE과 다를 경우

예:

```text
원자료: 寅卯辰 = 삼합
FILUNE: 寅卯辰 = 방합
```

처리:

```text
FILUNE_CANONICAL = 방합
```

원자료 표현을 엔진 규칙으로 채택하지 않는다.

필요하면 provenance에만:

```text
SOURCE_WORDING_NORMALIZED
```

라고 기록한다.

이것은 blocker가 아니다.

---

# 4. 과거 revision의 잘못된 규칙도 authority가 아니다

과거 문서에:

```text
왕지 없는 寅戌도 반합
```

같은 규칙이 남아 있더라도
현재 FILUNE master와 다르면:

```text
SUPERSEDED_RULE
```

로 취급한다.

구현 판단에 사용하지 않는다.

---

# 5. 현재 FILUNE 삼합 규칙

Compatibility에서도 그대로 사용한다.

```text
亥卯未 → 木
寅午戌 → 火
巳酉丑 → 金
申子辰 → 水
```

---

# 6. 삼합 두 글자 규칙

두 글자만 있는 경우:

## 왕지를 포함

예:

```text
亥卯
卯未

寅午
午戌

巳酉
酉丑

申子
子辰
```

처리:

```text
반합국
결과 오행 강화
```

---

# 7. 왕지가 없는 두 글자

예:

```text
亥未
寅戌
巳丑
申辰
```

처리:

```text
관계 존재
BUT
반합국 아님
국 형성 아님
결과 오행 강화 자동 발생 아님
```

Compatibility에서도 동일.

---

# 8. 원자료의 `寅戌 반합`

원자료 사례에서:

```text
寅戌 반합
```

이라고 표현했더라도
Compatibility Engine에서는:

```text
寅戌 cross-chart relation
```

으로만 기록한다.

다음 금지:

```text
half_combination = true
formation = true
火 강화 자동 발생
```

---

# 9. 현재 FILUNE 방합 규칙

```text
寅卯辰 → 木
巳午未 → 火
申酉戌 → 金
亥子丑 → 水
```

반드시 세 글자 모두 있어야 한다.

---

# 10. 방합 일부만 존재

예:

```text
寅卯
卯辰
寅辰
```

만 있다고:

```text
반방합
방합국
木 강화
```

를 자동 생성하지 않는다.

---

# 11. Compatibility에서 원자료를 사용하는 목적

원자료는 다음을 찾는 데 사용한다.

```text
궁합에서 무엇을 비교하는가
어떤 결과를 중요하게 보는가
상대가 나에게 어떤 구조적 영향을 주는가
어떤 실제 사례가 있는가
```

하지만 이미 FILUNE이 확정한
기본 명리 연산 규칙을 다시 정의하는 데 사용하지 않는다.

---

# 12. Compatibility Readiness 목표

구현 전에 다음을 전부 확인한다.

```text
Source
→ Compatibility Rule
→ Required Facts
→ Existing Engine Availability
→ New Cross-chart Facts
→ Positive / Negative / Mixed Fixtures
→ Product Inputs
```

---

# 13. 최종 판정

준비 완료:

```text
COMPATIBILITY_READINESS_COMPLETE
READY_FOR_COMPATIBILITY_ENGINE_DESIGN
```

미완료:

```text
COMPATIBILITY_BLOCKERS_CLASSIFIED
```

---

# 14. blocker 분류

새로운 미해결 문제만:

```text
SOURCE_GAP
POLICY_DECISION_REQUIRED
JUDGMENT_FACT_GAP
CROSS_CHART_FACT_GAP
FIXTURE_GAP
PRODUCT_INPUT_GAP
```

으로 분류한다.

이미 FILUNE에서 해결된 규칙 차이는
blocker로 잡지 않는다.

---

# 15. 반드시 읽을 현행 Master

먼저 다음을 읽는다.

```text
src/docs/rules/master/01-pattern-master.md
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/15-event-timing-spec.md
```

이 문서들이 기본 computation authority다.

---

# 16. 그다음 전문가 원자료 확인

```text
src/docs/source/primary/07-사주풀이예시.md
src/docs/source/primary/06-합충형파해.md
```

특히:

```text
13) 궁합 보는 법
```

전체 사례를 읽는다.

---

# 17. Source provenance

새 Compatibility rule만 다음으로 분류한다.

```text
SOURCE_EXPLICIT
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
DEFERRED
```

`SOURCE_CONFLICT`는
**아직 FILUNE에서 판정하지 않은 실제 미해결 모순에만** 사용한다.

---

# 18. 초기 Compatibility v1 범위 감사

다음을 각각 조사한다.

```text
연애 궁합
결혼 궁합
관계 지속성
사업 파트너 궁합
친구 궁합
부모·자식 궁합
```

원자료 지원 정도에 따라:

```text
V1_SUPPORTED
DEFERRED
SOURCE_GAP
```

으로 분류한다.

---

# 19. v1 우선 후보

현재 원자료상 우선 후보:

```text
연애 / 결혼 Compatibility
```

그러나 audit 결과로 최종 확정한다.

---

# 20. 개인 Relationship Outcome과 분리

금지:

```text
Compatibility
=
Relationship Outcome A
+
Relationship Outcome B
```

Compatibility는 두 명식 사이에
새로 생기는 관계 Fact를 필요로 한다.

---

# 21. 기본 아키텍처 후보

```text
Judgment A ─┐
            ├→ Compatibility Fact Engine
Judgment B ─┘
        ↓
Compatibility Policy
        ↓
Compatibility Result
```

Compatibility 결과가
개인 Judgment A/B를 변경하지 않는다.

---

# 22. 방향성 필수

반드시:

```text
A → B
B → A
```

를 따로 계산한다.

궁합은 대칭이라고 가정하지 않는다.

---

# 23. 단일 숫자 점수 금지

원자료의:

```text
높은 점수
좋은 점수를 주기 어려움
```

은 질적 표현이다.

따라서:

```text
87점
+10
-20
weighted score
```

금지.

---

# 24. Natal Relationship Baseline

상대와 비교하기 전에
각자의 원국에서 확인:

```text
배우자궁 상태
배우자성 상태
관련 구조적 Byeong
관련 support/relief
```

이는 Compatibility baseline이지
최종 궁합이 아니다.

---

# 25. 배우자궁 하나로 결론 금지

```text
일지 충
→ 결혼 실패
```

금지.

원자료도 한 사람의 명식만으로
100% 판단하지 않는다.

---

# 26. 배우자성 중요도

원자료의 명시 기준:

```text
남성 → 재성
여성 → 관살
```

그리고 배우자성의 구조가 깨지는지를
중요하게 본다.

현재 FILUNE structural result를 재사용할 수 있는지 확인한다.

---

# 27. 궁-궁 직접 비교

최소:

```text
year ↔ year
month ↔ month
day ↔ day
hour ↔ hour
```

관계를 계산할 필요가 있는지 확인한다.

---

# 28. Cross-chart branch relation

현행 FILUNE relation computation을 기반으로 한다.

```text
六合
三合
半合
方合
沖
刑
破
害
```

의 canonical 의미는
`03-branch-relations-master.md`를 그대로 따른다.

---

# 29. Compatibility 전용 relation

원자료에서 궁합에 별도로 사용하는:

```text
원진
귀문
격각
암합
```

등이 현재 엔진에 없는지 확인한다.

없으면:

```text
CROSS_CHART_FACT_GAP
```

로 기록한다.

---

# 30. 원진

원자료상 궁합에서 중요하게 사용된다.

하지만:

```text
원진 존재
→ 무조건 나쁜 궁합
```

으로 단순화하지 않는다.

Compatibility relation fact 중 하나로 사용한다.

---

# 31. 상파

현행 FILUNE `破` 계산과
원자료의 Compatibility 의미를 분리해 확인한다.

기본 relation computation은 FILUNE master를 따른다.

---

# 32. 원자료의 잘못된 합 명칭 정규화

예:

```text
원자료: 寅卯辰 삼합
FILUNE: 寅卯辰 방합
```

결과 문서에는:

```text
source wording: 삼합
FILUNE canonical: 방합
```

정도로 provenance만 남긴다.

구현 blocker로 만들지 않는다.

---

# 33. 궁합의 핵심 구조

원자료에서 가장 중요한 원칙:

```text
각자의 사주를 먼저 판단
→ 용신 / 상신 / 병 / 현재 구조 확인
→ 상대가 내 병을 실제로 해소하는가
```

를 Compatibility 핵심 축 후보로 둔다.

---

# 34. Cross Byeong Relief

방향별:

```text
B relieves A
A relieves B
```

를 분리한다.

---

# 35. Cross Byeong Activation

반대로:

```text
B activates A's harmful path
A activates B's harmful path
```

도 분리한다.

---

# 36. Cross-chart 천간 작용

상대 명식의 천간과
내 명식의 천간 사이:

```text
생
극
합
```

이 실제 구조 기능에
어떤 영향을 주는지 source 사례를 inventory한다.

---

# 37. 개인 운의 합 규칙을 무조건 복사 금지

```text
luck ↔ natal 합거
```

와:

```text
person A ↔ person B cross-chart 합
```

이 동일한 runtime 계약인지
자동 가정하지 않는다.

이 부분은 실제 Compatibility source를 기준으로
새 policy가 필요한지 확인한다.

---

# 38. Cross-chart root support

원자료에는 상대 명식이:

```text
내 필요한 기운의 뿌리를 제공
```

하는 것을 긍정적으로 보는 사례가 있다.

필요 Fact 후보:

```text
CrossRootSupportFact
```

---

# 39. Harmful Root Support

상대가:

```text
내 해로운 재성
내 해로운 칠살
내 Byeong path
```

의 뿌리를 제공할 수도 있다.

따라서:

```text
root support = always good
```

금지.

---

# 40. Mixed result 필수

예:

```text
상대 때문에 돈은 벌 수 있음
BUT
재성이 살아나며 칠살도 살아남
→ 직업 / 가족 / 건강 부담
```

같은 결과를 그대로 보존한다.

---

# 41. 평균으로 삭제 금지

예:

```text
재물 +1
직업 -1
→ 보통
```

같은 상쇄식 금지.

각 Outcome axis를 보존한다.

---

# 42. 상호 영향이 비대칭인 경우

허용:

```text
A는 B에게 큰 도움
B는 A에게 혼합 또는 부담
```

이를 하나의 평균값으로 지우지 않는다.

---

# 43. Personality Interaction

기존 Personality Engine의:

```text
PersonalityResult A
PersonalityResult B
```

를 재사용할 수 있는지 확인한다.

Personality Engine 자체는 변경하지 않는다.

---

# 44. 성격 유사성 = 좋은 궁합 금지

원자료처럼:

```text
둘 다 인성이 강함
```

이 공통점이어도
의심·표현부족·보수성 등이 겹쳐
충돌이 커질 수 있다.

---

# 45. Structural과 Personality 분리

```text
Structural Compatibility
Personality Interaction
```

은 별도 결과로 유지한다.

---

# 46. 미래 관계 지속성 분리

원자료는:

```text
현재 궁합이 좋아도
앞으로 한쪽 운이 크게 나빠지면
관계가 흔들릴 수 있음
```

을 인정한다.

따라서:

```text
Natal Compatibility
Future Sustainability
```

를 별도 계층으로 둔다.

---

# 47. 결혼 시기와 궁합 분리

이번 static compatibility에:

```text
언제 결혼하는가
언제 만나는가
```

를 섞지 않는다.

현재 Event Timing과
후속 연결 가능성만 확인한다.

---

# 48. 필요한 Fact Inventory

최소 다음을 감사한다.

```text
Natal spouse-palace state
Spouse-star state
YongShen
SangShen
Byeong
GuEung
ActualStructuralFunction
RootState
PersonalityResult

CrossStemRelation
CrossBranchRelation
CrossRoleRelief
CrossRoleDamage
CrossRootSupport
CrossHarmfulRootActivation
```

---

# 49. Existing vs New Fact 표

반드시 작성:

| Fact | Existing Engine Reusable | Cross-chart Computation Needed | Source Support |
|---|---:|---:|---|

---

# 50. Compatibility 전용 Fact 후보

구현하지 말고 필요 여부만 판정:

```text
CrossPalaceRelationFact
CrossStemInteractionFact
CrossBranchInteractionFact
CrossRoleReliefFact
CrossRoleDamageFact
CrossRootSupportFact
CrossPersonalityInteractionFact
CompatibilityOutcomeFact
```

각각:

```text
REQUIRED
OPTIONAL
NOT_SUPPORTED
```

---

# 51. Source fixture inventory

`궁합 보는 법`의 실제 두 사람 사례를 전수 조사한다.

최소 확보 목표:

```text
positive
negative
mixed
directional
```

---

# 52. Positive fixture

예상 source 요소:

```text
상대가 내 병 해소
해로운 기능 제어
필요한 뿌리 지원
배우자궁 관계 긍정
```

실제 원문 기대 결과를 그대로 기록한다.

---

# 53. Negative / Mixed fixture

예상 source 요소:

```text
궁 relation 일부 긍정
BUT
상대가 해로운 구조를 강화
성격 마찰
future sustainability 문제
```

실제 원문 conclusion을 그대로 사용한다.

---

# 54. Fixture expected output도 방향별

```text
A receives from B
  support:
  damage:

B receives from A
  support:
  damage:
```

분리.

---

# 55. Overall result

원문이 실제 종합 결론을 말한 사례에만
overall expected result를 둔다.

새로운 숫자 점수는 만들지 않는다.

---

# 56. Product Input 감사

최소:

```text
BirthInput A
BirthInput B
gender A
gender B
unknown hour
relationship type
```

필요 여부 확인.

---

# 57. Gender source limitation

현재 source가:

```text
남성 = 재성
여성 = 관살
```

기준이라면
그 범위 밖을 일반화하지 않는다.

지원하지 못하는 경우:

```text
SOURCE_GAP
```

으로 기록한다.

---

# 58. Unknown hour

시간을 모르는 경우:

```text
hour ↔ hour comparison unavailable
```

만 제외하고
나머지 지원 가능한 궁합까지
무조건 deferred하지 않는 방향이 가능한지 확인한다.

---

# 59. Readiness Matrix

최종 표:

| Capability | FILUNE Rule Ready | Source Ready | Existing Fact | New Fact | Fixture | Ready |
|---|---|---|---|---|---|---|

최소:

```text
Natal relationship baseline
Spouse-star condition
Cross-palace relations
Cross Byeong relief
Cross harmful activation
Cross root support
Personality interaction
Overall compatibility
Future sustainability
Marriage timing integration
```

---

# 60. 구현 전 blocker

실제 unresolved인 것만 blocker로 남긴다.

예:

```text
Cross-chart 천간합 runtime 의미
원진/귀문/격각 계산 부재
CrossRootSupport schema
gender unsupported case
fixture 부족
```

---

# 61. 이미 해결된 FILUNE 규칙은 blocker 금지

다음은 blocker로 다시 올리지 않는다.

```text
삼합 vs 방합
왕지 없는 반합
방합 세 글자 조건
육합 기본 의미
충 기본 의미
```

현행 master를 그대로 따른다.

---

# 62. 결과 파일

```text
src/docs/codex/compatibility-00-readiness-audit-result.md
```

---

# 63. 결과 보고 — Authority Normalization

반드시:

```text
Legacy/source terminology normalized:
Superseded rules ignored:
Actual unresolved conflicts:
```

를 기록한다.

---

# 64. 결과 보고 — Required Facts

```text
Existing Judgment facts reusable:
Existing Personality facts reusable:
Existing Branch/Stem facts reusable:

New cross-chart facts required:
```

---

# 65. 결과 보고 — Fixtures

```text
positive:
negative:
mixed:
directional:

full BirthInput:
snapshot-only:
fixture gaps:
```

---

# 66. 결과 보고 — V1

```text
V1_SUPPORTED:
V1_DEFERRED:
SOURCE_GAP:
```

---

# 67. 최종 판정

다음이 준비되면:

```text
COMPATIBILITY_READINESS_COMPLETE
READY_FOR_COMPATIBILITY_ENGINE_DESIGN
```

조건:

```text
[ ] 현행 FILUNE master 우선 적용
[ ] legacy rule이 active rule로 재유입되지 않음

[ ] V1 범위 확인
[ ] required facts 전수 확인
[ ] existing/new fact 경계 확인

[ ] A→B / B→A 방향성 설계 가능
[ ] mixed result 보존 가능

[ ] Compatibility 전용 relation gap 확인
[ ] cross-role relief/damage gap 확인
[ ] root support/damage gap 확인

[ ] positive fixture 확보
[ ] negative/mixed fixture 확보

[ ] gender input 확인
[ ] unknown hour 확인

[ ] static / future timing 분리

[ ] 숫자 scoring 없음
[ ] single relation shortcut 없음
[ ] generic good/bad 없음

[ ] src/lib changes = 0
```

준비되지 않았으면:

```text
COMPATIBILITY_BLOCKERS_CLASSIFIED
```

로 종료하고
실제 unresolved blocker만 한 번에 정리한다.