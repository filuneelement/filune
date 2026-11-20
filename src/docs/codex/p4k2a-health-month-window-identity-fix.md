# FILUNE Codex P4-K.2A
## Health Month Window Identity / Provenance Fix

P4-K.2 Health & Relationship Semantic Reaudit 결과:

```text
P4K2_FIX_REQUIRED
HEALTH_MONTH_WINDOW_BUG = 1
```

Relationship 검증은 통과했다.

Health에서도 다음은 정상이다.

```text
missing Health fact = 0
duplicate Health fact = 0
expired current leakage = 0
```

남은 문제는 하나다.

```text
full Judgment chain
vs
monthly window independent evaluation
```

에서 **같은 Health 사실의 결과 의미는 동일하지만**:

```text
stable ID가 다름
provenance가 다름
source/origin scope가 natal → month로 변경됨
```

이번 작업은 이 identity/provenance bug만 수정한다.

---

# 1. 최종 목표

성공:

```text
READY_TO_RERUN_P4K2
```

실패:

```text
P4K2A_FIX_REQUIRED
```

---

# 2. 반드시 먼저 읽을 파일

```text
src/docs/rules/master/14-outcome-semantic-spec.md
src/docs/rules/master/13-reading-assembly-spec.md

src/docs/codex/p4k-health-relationship-assertion-backaudit-result.md
src/docs/codex/p4k1-health-relationship-semantic-expansion-result.md
src/docs/codex/p4k2-health-relationship-semantic-reaudit-result.md

src/docs/codex/p4g-health-outcome-batch1-result.md
src/docs/codex/p4g1-health-outcome-reactivation-fix-result.md
src/docs/codex/p4h-health-outcome-integration-audit-result.md
```

코드:

```text
src/lib/outcome/health/
src/lib/reading/
```

실제 호출 경로를 추적한다.

---

# 3. 이번 작업의 성격

이것은:

```text
Health semantic bug가 아님
Relationship bug가 아님
Judgment rule bug가 아님
```

분류:

```text
HEALTH_MONTH_WINDOW_BUG
```

이다.

새 명리 규칙을 추가하지 않는다.

---

# 4. 가장 중요한 계약

다음을 구분한다.

```text
fact origin scope
≠
evaluation/display scope
```

예:

```text
원국에서 발생한 Health Fact
+
현재 월에도 유효
```

라고 해서:

```text
origin scope = month
```

으로 바꾸면 안 된다.

---

# 5. Natal fact를 월에 보여주는 경우

원국 Health Fact가 월 시점에도 현재 유효하면:

```text
origin/source scope = natal
stable ID = 원래 Health Fact ID
provenance = 원래 source provenance
certainty = 원래 현재 판정 근거에 따른 값
```

을 보존한다.

CH-10에 배치된다는 이유만으로 source identity를 다시 만들지 않는다.

---

# 6. 실제 Month-origin fact

반대로 실제 월 조건 때문에 새로 발생한 Health Fact라면:

```text
origin/source scope = month
```

가 맞다.

이 경우에만 month-origin stable ID를 사용한다.

---

# 7. 절대 금지

다음과 같은 구현 금지:

```text
requestedWindowScope = month
→ 모든 Health OutcomeFact.scope = month
```

또는:

```text
chapter = CH-10
→ fact origin scope = month
```

---

# 8. Reading context와 Fact identity 분리

월 단위 Reading에서 해당 사실이 노출되는 맥락과
원천 사실의 정체성을 구분한다.

개념:

```text
Health OutcomeFact
= 원천 사실의 의미·ID·scope·provenance

ReadingSemanticUnit / Chapter placement
= 현재 어느 기간/장 문맥에서 보여주는지
```

기존 타입이 이 구분을 이미 지원한다면 그대로 사용한다.

---

# 9. 새 필드 임의 추가 금지

`evaluationScope`, `displayScope` 같은 필드를
필요성 확인 없이 새로 만들지 않는다.

먼저 현행:

```text
OutcomeFact
ReadingSemanticUnit
ReadingAssembly
Luck snapshot
```

타입을 확인한다.

기존 구조로 표현 가능하면 기존 구조를 사용한다.

---

# 10. Root cause 추적

반드시 정확한 원인을 찾는다.

가능성 예:

```text
monthly window builder가 scope를 덮어씀
Health adapter가 호출 scope로 ID를 재생성
monthly window가 기존 fact를 reuse하지 않고 rebuild
provenance builder가 현재 evaluation scope를 source scope로 사용
```

실제 코드를 확인한 뒤 하나 이상을 특정한다.

추측으로 수정하지 않는다.

---

# 11. Source of truth

Health Fact identity는 가능한 한
실제 upstream source identity를 기준으로 한다.

예:

```text
source Judgment ID
source Role ID
source Relation ID
source LuckEffect ID
```

현행 타입의 실제 필드를 사용한다.

---

# 12. Stable ID 원칙

동일 source fact + 동일 semantic이면:

```text
full pipeline
monthly window
```

에서 stable ID가 같아야 한다.

---

# 13. ID에 evaluation scope를 잘못 포함하지 않기

원국-origin 사실의 stable ID를 생성할 때
현재 조회 월을 ID 구성요소로 넣어
매월 새 fact처럼 만들지 않는다.

---

# 14. 하지만 실제 Month fact는 별도

실제 월에 새로 발생한 source event/fact는
별도 identity를 가져야 한다.

원국 fact와 월 fact를 무조건 합치지 않는다.

---

# 15. Provenance 보존

같은 원천 사실이면:

```text
source IDs
source path
source origin scope
certainty evidence
```

가 full chain과 monthly window에서 같아야 한다.

---

# 16. 현재 유효성은 별도

origin이 natal이라고 해서
항상 현재 유효한 것은 아니다.

현재 월에서:

```text
currentlyEffective
active/inactive
expired
```

등 current state는 정상적으로 재평가한다.

---

# 17. Origin scope와 current state 혼동 금지

예:

```text
origin = natal
current month = inactive
```

가능.

또:

```text
origin = natal
current month = active
```

가능.

origin을 month로 바꾸는 방식으로 현재성을 표현하지 않는다.

---

# 18. Health semantic 유지

이번 수정으로 다음 의미를 변경하지 않는다.

```text
traditional_body_correspondence
body_area_burden
health_burden
health_problem_prone_period
health_management_period
```

---

# 19. Assertion Policy 유지

다음 회귀 금지:

```text
건강 문제가 생기기 쉬움
→ structural attention으로 다시 축소
```

P4-K.1의 semantic expansion을 그대로 유지한다.

---

# 20. Certainty 유지

P4-K.1에서 수정한:

```text
기간이라는 이유만의 certainty 자동 하향 금지
```

계약을 유지한다.

이번 identity 수정 때문에 certainty가 달라지면 FAIL.

---

# 21. Test A — 재현된 Natal-origin 사례

P4-K.2에서 실패한 정확한 fixture를 사용한다.

Full chain:

```text
Health Fact origin scope = natal
ID = X
provenance = P
certainty = C
```

Monthly window:

```text
Health Fact origin scope = natal
ID = X
provenance = P
certainty = C
```

Expected 완전 일치.

---

# 22. Test B — CH-10 placement

같은 natal-origin Health Fact가 CH-10에서 사용되더라도:

```text
Fact origin scope = natal
```

을 유지한다.

CH-10 placement는 정상이어야 한다.

---

# 23. Test C — 실제 Month-origin Health fact

기존 fixture 중 실제 월 source에서 새 Health condition이 생기는 사례가 있으면:

Expected:

```text
origin scope = month
```

을 유지한다.

natal로 잘못 환원하면 FAIL.

---

# 24. Month-origin fixture가 없으면

새 명리 기대값을 발명하지 않는다.

```text
NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

로 기록한다.

---

# 25. Test D — 동일 fact 여러 월에서 유효

동일 natal-origin fact가 연속된 여러 월에 유효할 경우:

```text
origin ID 유지
origin provenance 유지
```

확인.

단 current state는 월별로 달라질 수 있다.

---

# 26. Test E — 만료

해당 fact가 다음 월에 더 이상 유효하지 않으면:

```text
current leakage = 0
```

기존 origin ID를 유지한다는 이유로
만료 fact를 active로 남기면 안 된다.

---

# 27. Test F — 재활성

동일 origin fact가 이후 다시 활성화될 수 있는 계약이라면:

```text
origin/history identity 보존
current effective state 재활성
```

을 구분한다.

기존 lifecycle contract를 따른다.

---

# 28. Test G — duplicate

Full chain 및 monthly window 각각:

```text
duplicate Health fact = 0
```

---

# 29. Test H — missing

```text
missing Health fact = 0
```

유지.

---

# 30. Relationship 변경 금지

이번 수정에서:

```text
src/lib/outcome/relationship/
```

의 의미 변경:

```text
0
```

---

# 31. Relationship 회귀

기존:

```text
contact
change
formation
pressure
```

PASS 유지.

Commitment/mixed fixture 미존재 상태는 그대로 보존한다.

---

# 32. Judgment 변경 금지

이번 버그를 고치기 위해:

```text
src/lib/judgment/
```

판정 의미를 수정하지 않는다.

Expected:

```text
Judgment semantic changes = 0
```

---

# 33. Money 변경 금지

P4-I Money semantics:

```text
changes = 0
```

P4-J의 기존:

```text
UPSTREAM_JUDGMENT_REGRESSION
```

도 이번 작업에서 처리하지 않는다.

---

# 34. Personality / Work / Compatibility 변경 금지

각각:

```text
0
```

---

# 35. Master 14 변경

이번 문제는 이미 계약된 identity/provenance 구현 버그다.

새 semantic rule을 추가하지 않는다.

Master 14의 의미 변경:

```text
0
```

명백한 문서 오기 수정이 필요하다면 이유만 보고하고
가급적 변경하지 않는다.

---

# 36. Reading Assembly

같은 Health OutcomeFact가:

```text
CH-07
CH-08
CH-09
CH-10
```

등 여러 문맥에 재사용되는 경우
원천 ID/provenance를 유지한다.

---

# 37. 장 배치 ≠ Fact 생성

다음을 코드 계약으로 확인한다.

```text
chapter placement
≠
new OutcomeFact origin
```

---

# 38. Free scope

이번 수정으로 유료 월 정보가 Free에 새어 나오지 않아야 한다.

Expected:

```text
free month leakage = 0
```

---

# 39. Determinism

같은 입력을 2회 실행.

Expected:

```text
same IDs
same provenance
same origin scope
same certainty
```

---

# 40. 배열 순서 독립성

Relation / Role / Effect 배열 순서 변경으로
Health fact identity가 달라지지 않아야 한다.

---

# 41. Mutation

Health monthly-window 평가가 upstream:

```text
JudgmentResult
Luck snapshot
PersonalityResult
```

를 mutate하지 않는다.

Expected:

```text
0
```

---

# 42. 수정 범위

최소 수정 원칙.

가능한 변경 위치:

```text
src/lib/outcome/health/
src/lib/reading/
```

실제 root cause에 필요한 파일만 수정한다.

---

# 43. 검증 스크립트

기존 P4-K.2 재현 스크립트를 재사용하거나
필요하면 별도:

```text
scripts/verify-health-month-window-identity-p4k2a.mjs
```

를 추가한다.

---

# 44. Before / After 보고

반드시 다음 형식으로 남긴다.

```text
BEFORE

full chain:
  origin scope:
  ID:
  provenance:

monthly window:
  origin scope:
  ID:
  provenance:
```

```text
AFTER

full chain:
  origin scope:
  ID:
  provenance:

monthly window:
  origin scope:
  ID:
  provenance:
```

---

# 45. Root cause 보고

정확한:

```text
파일
함수
분기
```

를 기록한다.

예상 원인이 아니라 실제 수정 위치를 보고한다.

---

# 46. 신규 결과 파일

반드시 생성:

```text
src/docs/codex/p4k2a-health-month-window-identity-fix-result.md
```

---

# 47. 회귀

반드시 실행:

```text
Judgment 35/35

P2-A~G
P3-A~F

P4-B
P4-C
P4-E
P4-F
P4-G
P4-H
P4-I
P4-K.1
P4-K.2 재현 fixture
```

---

# 48. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 49. 완료 조건

다음을 만족하면:

```text
READY_TO_RERUN_P4K2
```

판정한다.

```text
[ ] 재현된 Health month-window ID mismatch = 0
[ ] provenance mismatch = 0
[ ] origin/source scope mismatch = 0

[ ] natal-origin fact가 CH-10 배치 때문에 month-origin으로 변하지 않음
[ ] 실제 month-origin fact는 month 유지

[ ] semantic mismatch = 0
[ ] certainty mismatch = 0
[ ] missing = 0
[ ] duplicate = 0
[ ] expired leakage = 0

[ ] Health Assertion Policy 회귀 0
[ ] Relationship changes 0
[ ] Judgment semantic changes 0
[ ] Money changes 0
[ ] Compatibility changes 0

[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 50. 완료 후

`READY_TO_RERUN_P4K2`가 나오면:

**기존 P4-K.2를 수정하지 말고 그대로 다시 실행한다.**

기대값도 변경하지 않는다.

최종 목표:

```text
HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE
```

P4-K.2가 통과한 뒤에만
P4-J의 별도:

```text
UPSTREAM_JUDGMENT_REGRESSION
```

수정으로 이동한다.