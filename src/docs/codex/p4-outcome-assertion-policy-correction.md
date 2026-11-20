# FILUNE P4
## Outcome Assertion Policy Correction

현재 Outcome Layer가 일부 영역에서
FILUNE 전문가 풀이 원자료보다 지나치게 보수적으로 제한되어 있다.

이번 작업은 이 문제를 수정하기 위한 **공통 Outcome 판정 원칙 감사 및 계약 수정**이다.

Application Outcome 코드는 아직 수정하지 않는다.

특히 P4-I Money Outcome 구현은 이번 작업이 끝날 때까지 시작하지 않는다.

---

# 1. 문제 정의

현재 일부 Outcome 계약은:

```text
구조가 확정됨
→ structural semantic만 기록
→ 실제 생활 결과는 출력하지 않음
```

방향으로 제한되어 있다.

그러나 FILUNE 전문가 풀이 원자료에서는
구조적 조건이 확정되면 실제 생활 결과까지 명확하게 연결한다.

예:

```text
食神生財
→ 기술·언변·재주로 돈을 벌 수 있음

재성이 겁재에게 손상
→ 재물 분탈 / 돈 문제 발생

일간 무근
→ 자리를 얻어도 오래 유지하기 어려움
→ 돈을 벌어도 유지 과정에 어려움

칠살을 식상으로 제어
→ 자신의 기술/능력으로 난제 해결
→ 자신의 귀/성과로 연결

칠살을 겁재가 처리
→ 난제 자체는 해결
→ 성과/공의 일부가 주변 사람에게 귀속 가능
```

따라서 FILUNE Outcome Layer는
**근거가 확인된 생활 결과를 지나치게 추상화해서는 안 된다.**

---

# 2. 핵심 원칙

다음으로 수정한다.

```text
Structural condition confirmed
+
Source-supported real-life mapping confirmed
=
Real-life Outcome confirmed
```

단:

```text
Source-supported mapping 없음
```

이면 새 생활 결과를 발명하지 않는다.

---

# 3. 보수성 금지

다음은 금지한다.

```text
원자료가 돈을 번다고 명시
→ "재물 생성 경로가 있습니다"로만 축소

원자료가 건강 문제가 생길 수 있다고 명시
→ "건강 관련 구조적 주의가 있습니다"로만 축소

원자료가 직업 난제를 명시
→ "구조적 압력이 있습니다"로만 축소
```

원자료가 지원하는 의미를 불필요하게 약화하지 않는다.

---

# 4. 확정과 과장 구분

`확정적 Outcome`과 `근거 없는 과장`은 다른 문제다.

예:

```text
食神生財가 실제 작동
→ 재물을 벌 수 있는 구조
```

는 source-supported Outcome이다.

반면:

```text
→ 연봉 2억
→ 큰 부자가 된다
```

는 source가 없으므로 금지다.

---

# 5. Outcome은 다축이다

전체 결과를 하나의:

```text
good
bad
```

로 환원하지 않는다.

최소 다음 축을 독립적으로 표현할 수 있어야 한다.

```text
acquisition
retention
stability
problem_resolution
benefit_capture
cost
side_effect
duration
```

실제 명칭은 기존 schema와 source audit 결과를 바탕으로 결정한다.

---

# 6. 재물 예시

가능:

```text
재물을 벌 수 있음
재물이 들어오는 구조

그러나
재물 유지가 어려움
분탈 가능성이 큼
돈을 버는 과정에서 난제가 동반됨
```

세 결과는 동시에 존재 가능하다.

한 부정 요소 때문에
긍정적인 재물 생성 결과를 삭제하지 않는다.

---

# 7. Success와 Retention 분리

반드시 다음을 구분한다.

```text
acquire result
retain result
```

예:

```text
돈을 벌 수 있다
≠
돈이 오래 남는다
```

```text
자리를 얻는다
≠
그 자리를 오래 유지한다
```

전문가 사례가 이 차이를 반복적으로 사용한다.

---

# 8. Problem Resolution과 Benefit Capture 분리

다음을 구분한다.

```text
problemResolved
benefitCapturedBySelf
```

예:

```text
칠살이 제거됨
→ problemResolved = true
```

그러나 해결자가 겁재이고 source context가 이를 지원하면:

```text
benefitCapturedBySelf = reduced/contextual
externalBenefitCapture = present
```

처럼 결과 귀속을 별도로 기록할 수 있어야 한다.

---

# 9. 해결 수단의 질

같은 난제 해결이라도
해결 수단에 따라 결과가 다를 수 있다.

예:

```text
食神制殺
→ 자신의 기술·재능으로 난제 해결
→ 본인의 귀/성과 획득

劫財合殺 등
→ 주변 사람·동료·경쟁자의 작용으로 난제 해결
→ 난제는 해결되나 공/성과 귀속이 달라질 수 있음
```

source-supported 경우에만 적용한다.

---

# 10. Mixed Outcome 허용

다음 구조를 허용한다.

```text
positive outcome confirmed
+
negative side effect confirmed
```

예:

```text
재물을 벌 수 있음
+
구설이 동반될 수 있음
```

또는:

```text
직위 상승 가능
+
성과가 주변과 나뉠 수 있음
```

이를 `mixed/deferred` 하나로 뭉개지 않는다.

---

# 11. Deferred 재정의

`deferred`는 다음 경우에만 사용한다.

```text
필요한 engine evidence가 실제로 없음
source rule 자체가 불명확
상반 조건 중 어느 것이 우선인지 source에서 결정 불가
```

금지:

```text
한 축만 불명확
→ 전체 Outcome deferred
```

---

# 12. Partial Knowledge

예:

```text
食神生財 = confirmed
capacity = unknown
```

이면:

```text
money acquisition = confirmed
money retention/durability = deferred
```

로 분리한다.

`money outcome 전체 deferred` 금지.

---

# 13. Customer output

내부적으로 여러 Fact가 존재하면
고객 출력도 이를 명확히 설명할 수 있어야 한다.

금지 예:

```text
재물운은 장단점이 있습니다.
돈은 좋을 수도 나쁠 수도 있습니다.
주의가 필요합니다.
```

허용 예:

```text
재물을 만들어 내는 경로는 분명히 작동합니다.
다만 들어온 재물을 지키는 기능은 약해져 있어,
버는 것에 비해 남기는 힘이 떨어질 수 있습니다.
```

---

# 14. Money Source Mapping

전문가 사례를 전수 검토하여
최소 다음을 분리한다.

```text
money_acquisition
money_retention
money_loss_or_division
money_related_problem
money_generation_method
money_duration
```

새 rule을 발명하지 않고 실제 source가 지원하는 범위만 등록한다.

---

# 15. 食神生財

실제 `食神生財`가 현재 작동하면
source-supported real-life Outcome:

```text
재물을 벌 수 있음
자신의 기술·언변·재주가 재물로 연결됨
```

을 지나치게 추상화하지 않는다.

---

# 16. 傷官生財

source가 동일하게 지원하는 경우:

```text
재주
응용
언변
임기응변
→ 재물 획득
```

결과를 등록한다.

---

# 17. 財 손상

실제 劫財/比肩 등의 유효한 경로로 財가 손상되고
source가 생활 결과를 지원하면:

```text
재물 손실
재물 분탈
돈이 묶임
재물 유지 어려움
```

중 source에 맞는 실제 Outcome을 사용한다.

무조건적인 generic `"wealth_function_damaged"`로 끝내지 않는다.

---

# 18. Root / Capacity

source가:

```text
돈을 벌더라도 오래 유지하기 어려움
```

까지 연결하는 조건이 있으면
retention/duration Outcome으로 분리한다.

---

# 19. Money Related Difficulty

재물을 얻는 경로가 동시에
해로운 七殺 등 난제를 활성화하면:

```text
money acquisition = confirmed
money-related difficulty = confirmed
```

둘 다 보존한다.

한쪽으로 상쇄하지 않는다.

---

# 20. Health Outcome 원칙도 동일하게 수정

현재 Health의:

```text
structural_health_attention
```

이 source 의미를 지나치게 축소하고 있는지 감사한다.

원자료에서 실제로:

```text
건강 문제가 생길 수 있음
특정 시기에 건강이 불리함
특정 전통 신체 영역에 부담
```

을 명시적으로 지원하는 경우
그 수준까지 Outcome semantic이 표현할 수 있어야 한다.

---

# 21. Health 한계

다만 다음은 계속 금지한다.

```text
질병명 확정
의학적 진단
수술 확정
치료법
의약품
의료검사 처방
수명/사망 시점
```

---

# 22. Health Timing

source-supported structural condition이
특정 대운/세운/월운에서 활성화되면:

```text
이 시기에 건강 문제가 나타날 수 있음
```

수준의 명리적 Outcome을 허용한다.

단 해당 source 근거 수준을 보존한다.

---

# 23. Health Body Area

전통 신체 대응 + 해당 오행의 실제 구조적 손상/압력이
source contract상 연결되는 경우:

```text
해당 전통 신체 영역의 부담이 커질 수 있음
```

수준까지 허용할 수 있는지
기존 Health Audit와 대조하여 명시한다.

근거 없는 일간별 부위 확장 금지는 유지한다.

---

# 24. Relationship에도 동일 철학 적용

향후 관계 Outcome에서 source가 충분하면:

```text
배우자연이 떨어짐
관계 변화가 큼
관계 갈등이 생길 수 있음
```

등 실제 source-supported 결과까지 갈 수 있다.

다만 궁합과 개인 관계 Outcome은 계속 분리한다.

이번 작업에서는 Relationship code를 수정하지 않는다.

---

# 25. Work에도 동일 철학 적용

Work가 현재 SOURCE_GAP이라는 이유로
근거 있는 전문가 사례 결과까지 영구적으로 막지 않는다.

후속 source audit에서:

```text
자리 획득
자리 유지
직업 난제
공로 귀속
조직/주변 영향
```

축을 별도로 연구한다.

---

# 26. Outcome schema 감사

현재 공통 OutcomeFact가
다음 표현을 지원할 수 있는지 검토한다.

```text
domain
resultType
direction
scope
certainty

acquisition
retention
duration
resolution
benefitCapture
sideEffect
```

모두 필수 필드로 만들 필요는 없다.

필요 최소 schema를 제안한다.

---

# 27. 구조 사실과 생활 결과 연결

향후 권장 구조:

```text
JudgmentFact
↓
OutcomeMappingRule
↓
OutcomeFact
```

OutcomeMappingRule에는:

```text
requiredFacts
requiredCurrentState
realLifeMeaning
limitations
provenance
```

을 기록할 수 있어야 한다.

---

# 28. AI 일반 보수성 사용 금지

Codex/LLM이 자체적으로:

```text
확실하지 않으니 가능성만 언급
민감하니 모두 추상화
실생활 결과는 피함
```

같은 일반적 보수 판단을 추가하지 않는다.

FILUNE source contract를 따른다.

---

# 29. 단, Source 없는 확장은 여전히 금지

“보수성 금지”는
자유로운 추론 허용이 아니다.

```text
source supports result
→ 결과를 충분히 말한다

source does not support result
→ 새 결과를 만들지 않는다
```

이 둘을 동시에 지킨다.

---

# 30. 14-outcome-semantic-spec 수정

이번 감사 결과를 반영해:

```text
src/docs/rules/master/14-outcome-semantic-spec.md
```

의 공통 Outcome 원칙을 수정한다.

최소 수정:

```text
- structural-only 축소 금지
- source-supported real-life outcome 허용/필수
- acquisition vs retention 분리
- resolution vs benefit capture 분리
- mixed outcome 병존
- partial deferred 금지
- Health real-life timing 범위 정리
```

---

# 31. 기존 Health 구현 영향 감사

P4-G/P4-H의 Health implementation이
수정된 spec보다 지나치게 좁은지 목록화한다.

분류:

```text
NO_CHANGE
SEMANTIC_EXPANSION_REQUIRED
RENDERER_ONLY
FUTURE_SOURCE_GAP
```

이번 작업에서는 Health application code를 수정하지 않는다.

---

# 32. 기존 Relationship 구현 영향 감사

동일하게 목록화만 한다.

코드 변경하지 않는다.

---

# 33. P4-I 영향

기존 `p4i-money-outcome-batch1.md`가
새 Outcome 원칙과 충돌하는 부분을 전수 표시한다.

특히 다음 문구는 재검토한다.

```text
"돈이 곧 들어온다" 금지
"실제 돈 사건 예측 0"
"money generation path로만 표현"
```

source-supported 경우에는 지나친 축소일 수 있다.

---

# 34. P4-I 수정본 필요

이번 작업 종료 시
기존 P4-I 작업 파일을 새 기준으로 수정한다.

아직 P4-I 구현은 실행하지 않는다.

---

# 35. 결과 파일

```text
src/docs/codex/
p4-outcome-assertion-policy-correction-result.md
```

---

# 36. 최종 판정

성공:

```text
OUTCOME_ASSERTION_POLICY_READY
```

실패:

```text
OUTCOME_POLICY_FIX_REQUIRED
```

---

# 37. 결과 보고

반드시 다음을 보고한다.

## A. Core policy

```text
Source-supported real-life outcome:
Partial deferred:
Mixed outcomes:
Acquisition/retention:
Resolution/benefit capture:
```

## B. Money impact

```text
current spec too conservative:
rules changed:
P4-I sections changed:
```

## C. Health impact

```text
current implementation too conservative:
semantic expansion required:
medical prohibition preserved:
```

## D. Relationship impact

```text
semantic expansion candidates:
compatibility remains separate:
```

## E. Work impact

```text
future source audit targets:
```

## F. Code

이번 작업에서:

```text
src/lib changes = 0
```

---

# 38. 종료 후 순서

`OUTCOME_ASSERTION_POLICY_READY`가 나오면:

```text
1. 수정된 P4-I를 실행
2. Money Integration Audit
3. Health Semantic Expansion 필요분 보강
4. Relationship Outcome 후속 Batch
5. Work Outcome source 재감사
```

순서로 진행한다.