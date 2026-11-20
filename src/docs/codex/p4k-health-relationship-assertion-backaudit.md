# FILUNE Codex P4-K
## Health & Relationship Outcome Assertion Backaudit

현재 공통 Outcome 정책은 다음으로 교정되어 있다.

```text
OUTCOME_ASSERTION_POLICY_READY
```

핵심 원칙:

```text
근거가 확인된 생활 결과는 끝까지 판정한다.
근거 없는 결과는 만들지 않는다.
확정 가능한 결과를 다른 불확실성 때문에 약화시키지 않는다.
긍정·부정·부작용·지속성은 서로 독립적으로 보존한다.
```

Health와 Relationship Outcome은 이 정책 교정 전에 구현되었다.

따라서 이번 작업에서는 두 영역에 남아 있을 수 있는 **과도한 추상화 / AI식 보수성**을 전수 감사한다.

이번 작업에서는 application code를 수정하지 않는다.

---

# 1. 최종 목표

다음 중 하나:

```text
HEALTH_RELATIONSHIP_ASSERTION_AUDIT_COMPLETE
```

또는:

```text
ASSERTION_BACKAUDIT_BLOCKED
```

---

# 2. 반드시 읽을 기준 문서

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/codex/p4-outcome-assertion-policy-correction-result.md

src/docs/codex/p4e-relationship-outcome-batch1-result.md
src/docs/codex/p4f-relationship-outcome-integration-audit-result.md

src/docs/codex/p4g-health-outcome-batch1-result.md
src/docs/codex/p4g1-health-outcome-reactivation-fix-result.md
src/docs/codex/p4h-health-outcome-integration-audit-result.md

src/docs/source/primary/07-사주풀이예시.md
src/docs/source/health/FILUNE-19A-premium-health-evidence.md

src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/08-luck-master.md
src/docs/rules/master/09-engine-integration-spec.md
src/docs/rules/master/13-reading-assembly-spec.md
```

그리고 실제 구현:

```text
src/lib/outcome/health/
src/lib/outcome/relationship/
src/lib/reading/
```

을 확인한다.

---

# 3. 이번 감사에서 찾을 오류

최소 다음 네 종류를 찾는다.

```text
A. source-supported real-life result
   → structural-only semantic으로 약화

B. confirmed result
   → "주의", "접점", "변화 가능성" 정도로 불필요하게 완화

C. 한 축이 불확실
   → 확정 가능한 다른 축까지 출력하지 않음

D. source에 없는 결과
   → 반대로 과도하게 만들어냄
```

---

# 4. 판정 분류

각 항목을 다음 중 하나로 분류한다.

```text
NO_CHANGE
SEMANTIC_EXPANSION_REQUIRED
MAPPING_EXPANSION_REQUIRED
RENDERER_ONLY
SOURCE_GAP
SOURCE_CONFLICT
PROHIBITED
```

---

# 5. Health — 현재 구현 감사

현재 구현된 것으로 알려진 주요 semantic:

```text
traditional_body_correspondence
structural_health_attention
health_attention_period
```

각 semantic이 실제 source 의미보다 약화되어 있는지 확인한다.

---

# 6. Health — 건강 문제 발생 의미

전문가 원자료에서 구조와 운이 실제로:

```text
건강 문제가 생길 수 있음
건강 문제가 본격적으로 생길 수 있음
특정 시기에 건강 부담이 커짐
```

으로 연결되는 규칙을 전수 조사한다.

해당 조건이 이미 Judgment에서 확정 가능한 경우:

```text
structural_health_attention
```

만으로 끝내는 것이 과도한 추상화인지 판정한다.

---

# 7. Health — 시기 의미

다음 계층을 구분한다.

```text
baseline health tendency
health burden activation
health problem-prone period
health management period
```

source가 어느 수준까지 지원하는지 정확히 기록한다.

---

# 8. Health — 부위 의미

다음을 구분한다.

```text
traditional correspondence
specific body-area burden
body-area weakness
disease
```

source가 실제로:

```text
약할 수 있음
안좋을 수 있음
관리할 영역
```

까지 말하는 경우 이를 모두 `traditional correspondence` 하나로 축소했는지 감사한다.

---

# 9. Health — 질병 단정과 구분

다음은 계속 금지한다.

```text
질병명 확정
의학적 진단
검사 처방
치료 권고
약물 권고
수술 예측
수명/사망 시점
```

하지만 이 금지를 이유로 다음까지 삭제하면 안 된다.

```text
이 시기에 건강 문제가 생기기 쉬움
이 시기에 특정 신체 영역 부담이 커질 수 있음
건강 관리가 필요한 시기
```

source-supported 경우.

---

# 10. Health — 칠살

원자료에서 실제:

```text
칠살 소생
재생살
관살 문제
보호 경로 손상
```

등이 건강 문제와 직접 연결되는 경우를 조사한다.

현재 구현이 단지:

```text
structural_health_attention
```

으로만 남기는지 확인한다.

---

# 11. Health — 복수 결과

다음이 동시에 존재할 수 있어야 한다.

```text
건강 부담 시기
+
특정 전통 신체 영역
+
직업/재물 등 다른 난제
```

하나의 generic `attention`으로 합치지 않는다.

---

# 12. Health — 확정 가능한 시기

실제 Judgment가:

```text
Daewoon / Sewoon / Month
```

범위에서 harmful health condition을 확정하고
source가 생활 결과까지 지원한다면,

다음 정도의 Outcome semantic이 가능한지 판정한다.

```text
health_problem_prone_period
health_burden_period
body_area_attention_period
```

이름은 최신 spec 규칙에 맞춰 제안한다.

---

# 13. Health — 사용자용 명리용어 금지

내부 provenance에는:

```text
Daewoon
Sewoon
Month
YongShen
SangShen
Byeong
```

사용 가능.

고객 semantic/renderer에서는 직접 노출하지 않는다.

고객 결과는:

```text
장기적인 흐름
올해
이 시기
○월
```

등 현실 언어로 번역될 수 있어야 한다.

---

# 14. Relationship — 현재 구현 감사

현재 주요 semantic:

```text
relationship_palace_context
relationship_contact_signal
relationship_change_signal
relationship_pressure_signal
```

또는 현행 코드의 동등 타입.

이들이 source 의미를 지나치게 약화했는지 감사한다.

---

# 15. Relationship — 단순 접점보다 강한 결과

전문가 source에서 실제 다음 결과가 있는지 전수 조사한다.

```text
관계 형성
중요한 협력관계 형성
동업 형성
결혼 가능성 증가
관계 갈등
관계 단절/정리
배우자 관련 부담
```

단 source가 실제 지원하는 것만 등록한다.

---

# 16. Relationship — 좋은 흐름의 실제 결과

source가:

```text
결혼
동업
중요한 협력관계가 형성되기 쉽다
```

까지 명시한다면,

이를 단순:

```text
relationship_contact_signal
```

로만 남기는 것이 과도한 추상화인지 판정한다.

---

# 17. Relationship — 충과 변화

금지했던:

```text
충 → 무조건 이별
```

은 계속 금지.

그러나 실제 chart context와 source에서:

```text
관계 정리
이혼 결정
배우자 문제
```

까지 연결된 사례가 있다면,

그 조건을 별도 Mapping Rule로 만들 수 있는지 감사한다.

---

# 18. Relationship — 사건과 구조 분리

다음은 구분한다.

```text
contact
relationship formation
relationship pressure
relationship change
relationship breakdown
commitment
```

모든 것을 `contact/change`로 뭉개지 않는다.

---

# 19. Relationship — 생활 상태 추정 금지

사주 구조만으로 현재 사용자가:

```text
미혼
기혼
연애 중
배우자 있음
```

이라고 추정하지 않는다.

대신 조건부 결과는 가능하다.

예:

```text
새로운 관계가 형성되기 쉬운 시기
기존 관계라면 중요한 변화가 생기기 쉬운 시기
```

단 source contract가 지원해야 한다.

---

# 20. Relationship — 결혼 시기

source-supported 경우:

```text
relationship formation / commitment favorable period
```

를 향후 Outcome으로 만들 수 있는지 감사한다.

이번 감사에서는 코드 구현하지 않는다.

---

# 21. Compatibility와 분리

다음은 계속 별도 엔진이다.

```text
Person A + Person B
→ compatibility
```

개인 관계 Outcome을 확장한다고 해서
궁합 로직을 섞지 않는다.

---

# 22. Relationship — 동업/협력

source에서:

```text
동업
중요한 협력관계 형성
```

을 지원한다면,

Romantic Relationship과 Business Partnership을
같은 semantic으로 뭉갤지 여부도 감사한다.

필요하면 domain/context subtype 분리를 제안한다.

---

# 23. Mixed Relationship Outcome

다음이 동시에 존재할 수 있다.

```text
relationship formation chance = high
+
relationship pressure = present
```

또는:

```text
important relationship forms
+
conflict accompanies it
```

이를 “관계운 애매”로 축약하면 안 된다.

---

# 24. 기존 제한 문구 감사

Health/Relationship 지시문과 코드에서 다음 류 문구를 검색한다.

```text
only signal
only context
do not infer event
not a real-world event
structural only
contact only
change only
attention only
```

각 제한이:

```text
정당한 source boundary
```

인지,

아니면:

```text
AI식 과잉 보수성
```

인지 구분한다.

---

# 25. Renderer 감사

현재 KO/JA/EN Renderer가 Health/Relationship Outcome을
실제 의미보다 약하게 표현하고 있는지도 확인한다.

단 이번 작업에서 renderer code 수정은 하지 않는다.

분류만 한다.

---

# 26. 고객용 명리 용어

다음이 고객 문장에 직접 나타나는지 검색한다.

```text
대운
세운
월운
일운
일진
용신
상신
병
구응
격
```

고객용 직접 노출:

```text
0
```

이어야 한다.

내부 ID/provenance는 제외.

---

# 27. Assertion Policy 직접 검사

Health와 Relationship 각각 다음 건수를 계산한다.

```text
source-supported result weakened to structural-only
confirmed result weakened to vague possibility
confirmed axis hidden by deferred axis
mixed outcome collapsed
unsupported outcome invented
```

---

# 28. Source Evidence Table

각 수정 후보마다 표를 만든다.

| Domain | Current Semantic | Source-Supported Meaning | Current Too Conservative? | Classification | Evidence |
|---|---|---|---|---|---|

---

# 29. Health 결과 표

최소 다음 축을 별도 보고한다.

```text
baseline tendency
body-area mapping
body-area burden
health burden
health problem-prone period
health management period
```

각각:

```text
SUPPORTED
PARTIAL
SOURCE_GAP
PROHIBITED
```

---

# 30. Relationship 결과 표

최소:

```text
contact
formation
commitment
pressure
change
breakdown/ending
partnership/cooperation
```

각각 상태를 기록한다.

---

# 31. 기존 코드 변경 금지

이번 감사에서는:

```text
src/lib changes = 0
```

이어야 한다.

문서와 감사 스크립트만 허용한다.

---

# 32. 14 spec 변경도 이번에는 하지 않는다

먼저 감사 결과를 낸다.

필요 수정 후보만 제안한다.

---

# 33. 결과 파일

```text
src/docs/codex/
p4k-health-relationship-assertion-backaudit-result.md
```

---

# 34. 최종 판정

다음 중 하나:

```text
NO_CONSERVATIVE_SEMANTIC_GAPS
```

또는:

```text
SEMANTIC_EXPANSION_REQUIRED
```

또는:

```text
SOURCE_RESEARCH_REQUIRED
```

복수 문제라면 가장 강한 blocker를 최종 판정으로 쓴다.

---

# 35. 최종 보고 필수

## A. Health

```text
too conservative mappings:
missing source-supported outcomes:
renderer-only issues:
prohibited items preserved:
```

## B. Relationship

```text
too conservative mappings:
missing source-supported outcomes:
renderer-only issues:
compatibility boundary:
```

## C. Customer terminology

```text
direct Saju jargon leakage:
```

Expected:

```text
0
```

## D. Required fixes

각 항목을:

```text
P0
P1
P2
```

로 분류한다.

P0:

```text
현재 결과 의미를 잘못 약화시키는 문제
```

P1:

```text
source-supported 결과가 누락
```

P2:

```text
renderer 표현 개선
```

---

# 36. 이후 순서

감사 결과가:

```text
SEMANTIC_EXPANSION_REQUIRED
```

이면 다음 단계에서 Health/Relationship을 먼저 보강한다.

그 뒤에 P4-J의 `UPSTREAM_JUDGMENT_REGRESSION`을 수정하고 Money 통합 감사를 다시 실행한다.

감사 결과가:

```text
NO_CONSERVATIVE_SEMANTIC_GAPS
```

이면 바로 P4-J blocker 수정으로 돌아간다.

Event Timing Layer:

```text
계약 성사
사업 시작
```

은 그 다음 단계에서 진행한다.