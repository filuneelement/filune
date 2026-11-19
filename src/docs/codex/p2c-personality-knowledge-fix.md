# FILUNE Codex P2-C Fix
## MISSING_EXTRACTION 7건 · UNSUPPORTED_TRAIT 4건 정밀 보완

P2-C Personality Knowledge 통합감사 결과:

```text
DayStemProfile       10/10
TenGodProfile        10/10
PositionRules         6/6
DayPillarProfile     60/60

MISSING_EXTRACTION    7
UNSUPPORTED_TRAIT     4

SOURCE_CONFLICT       1
FAIL 판정             존재
```

이번 작업의 목표는 P2-C 감사에서 확인된:

```text
MISSING_EXTRACTION 7건
UNSUPPORTED_TRAIT 4건
```

총 11건만 수정하여 Knowledge Layer를 Personality Engine 입력 가능 상태로 만드는 것이다.

새 Personality 이론을 추가하지 않는다.

---

# 1. 기준 감사 결과

최우선으로 다음 파일을 읽는다.

```text
src/docs/codex/p2c-personality-knowledge-integration-audit-result.md
```

그리고 P2-C 검증 스크립트:

```text
scripts/verify-personality-knowledge-integration-p2c.mjs
```

를 함께 확인한다.

**감사 보고서에 기록된 11건 각각의 Profile, field, sourceRef, 판정 이유를 정확히 확인한 뒤 수정한다.**

11건의 내용을 추측하지 않는다.

---

# 2. 기준 문서

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

원자료:

```text
src/docs/source/personality/십성.md
src/docs/source/personality/일주풀이.md
```

현재 Knowledge:

```text
src/lib/personality/types.ts
src/lib/personality/knowledge/dayStemProfiles.ts
src/lib/personality/knowledge/tenGodProfiles.ts
src/lib/personality/knowledge/positionRules.ts
src/lib/personality/knowledge/dayPillarProfiles.ts
```

분할 파일이 있다면 실제 Registry 위치를 따른다.

---

# 3. 수정 범위 고정

이번 수정 대상:

```text
MISSING_EXTRACTION 7
UNSUPPORTED_TRAIT 4
```

만.

다음은 수정 대상이 아니다.

```text
SOURCE_GAP 461
戊午 SOURCE_CONFLICT 1
Personality Engine
Prominence
StructuralRoleModifier
Luck Personality
Renderer
```

---

# 4. MISSING_EXTRACTION 정의

다음 경우만 MISSING_EXTRACTION이다.

```text
원자료에 명시적 성격 Fact가 존재
+
현재 Registry에서 누락
+
해당 Profile field에 넣을 수 있음
```

즉 source가 실제로 말한 것을 빠뜨린 경우다.

---

# 5. MISSING_EXTRACTION 수정 원칙

각 7건에 대해 반드시 다음을 확인한다.

```text
1. 원문 line range
2. 성격 Fact인지
3. 일간 공통인지 / 일주 고유인지 / 십성 일반인지
4. 넣어야 할 정확한 Registry
5. 넣어야 할 정확한 field
6. source_explicit 또는 source_synthesis
```

---

# 6. 잘못된 Registry에 넣지 않는다

예:

원자료가 특정 `丙子`에만 말하는 성향이면:

```text
DayPillarProfile[丙子]
```

에 들어가야 한다.

이를:

```text
DayStemProfile[丙]
```

에 넣지 않는다.

반대로 6개 丙 일주에 공통으로 반복되는 일간 기질이면 DayPillar에 중복 저장하지 않는다.

---

# 7. 십성 누락 처리

MISSING_EXTRACTION이 TenGodProfile 관련이면:

```text
productive
ordinary
excessive
deficient
social
inner
work
relationship
decision
stress
caution
variant
```

중 원자료가 실제로 지원하는 field에만 넣는다.

---

# 8. 빈 field를 채우기 위한 추론 금지

이번 작업은:

```text
SOURCE_GAP을 줄이는 작업
```

이 아니다.

예:

```text
stressResponse가 비어 있으므로 비슷한 성격에서 추론
```

금지.

---

# 9. UNSUPPORTED_TRAIT 정의

다음 경우 UNSUPPORTED_TRAIT다.

```text
Registry에 성격 trait 존재
+
해당 sourceRef가 그 trait를 실제로 지지하지 않음
```

또는:

```text
source보다 한 단계 이상 의미를 확장
```

한 경우.

---

# 10. UNSUPPORTED_TRAIT 기본 처리

4건 각각에서 먼저 판단한다.

### Case A — source가 전혀 지원하지 않음

```text
trait 삭제
```

### Case B — source는 일부만 지원

```text
trait를 source 범위까지 축소
```

### Case C — sourceRef가 잘못 연결됨

실제 동일 의미 source가 원자료에 있다면:

```text
정확한 sourceRef로 교체
```

### Case D — source_synthesis가 과도함

```text
원문 직접 의미 수준으로 축소
```

---

# 11. unsupported를 다른 일반 명리 지식으로 구제 금지

금지:

```text
원자료에 근거 없음
→ 일반 명리 지식에서는 맞으므로 유지
```

FILUNE Personality Knowledge는 현재 제공된 원자료 기준이다.

---

# 12. web 또는 외부 지식 사용 금지

이번 11건 해결을 위해:

```text
인터넷 검색
일반 사주 자료
모델 내부 명리 지식
```

을 사용하지 않는다.

---

# 13. source_explicit 우선

원자료 문장이 직접 성격을 말하면:

```text
source_explicit
```

을 우선한다.

---

# 14. source_synthesis 제한

다음 조건에서만 허용한다.

```text
복수 source 문장이 같은 성격축을 명확히 지원
+
새로운 심리 메커니즘을 추가하지 않음
```

---

# 15. filune_interpretation 추가 금지

현재 P2-B:

```text
filune_interpretation = 0
```

을 유지한다.

이번 보완 때문에:

```text
filune_interpretation > 0
```

으로 만들지 않는다.

---

# 16. 戊午 SOURCE_CONFLICT 유지

현재:

```text
Registry = 正印
canonical = 正印
원자료 일부 = 偏財 오표기
```

상태를 유지한다.

다음을 변경하지 않는다.

```text
dayBranchTenGod = 正印
```

---

# 17. 戊午 오표기 기반 trait 금지 재확인

다시 확인:

```text
偏財 오표기 부분
```

에서 추출된 Personality trait가 없어야 한다.

있다면 제거.

Conflict record는 유지.

---

# 18. SOURCE_GAP 유지

현재 통합감사 기준 약:

```text
SOURCE_GAP 461 fields
```

은 실패가 아니다.

이번 작업 후 수치가 크게 감소하면 오히려 의심해야 한다.

원자료가 실제로 지원하는 7건을 복구하면서 해당 gap만 자연스럽게 감소할 수 있다.

---

# 19. DayStem common-copy 계약 유지

MISSING_EXTRACTION을 수정하면서
DayStem 공통 기질을 DayPillar 6개에 반복 복사하지 않는다.

---

# 20. TenGod generic-copy 계약 유지

특정 일주의 일지 십성이 어떤 TenGod이라는 이유만으로
TenGodProfile 성향을 DayPillarProfile에 복사하지 않는다.

---

# 21. forbidden claim 계약 유지

다음은 여전히 Personality trait 금지.

```text
배우자
남편
아내
이혼
외도
궁합

재물복
부자
재산 결과

직업 운명
특정 직업 성공

질병
수명
사고

남자는
여자는

평생
반드시 성공
운명적 결과
```

---

# 22. 관계 성향은 허용

다음과 같은 순수 성격은 source가 지원하면 허용.

```text
상대를 챙김
거절이 어려움
관계 단절이 빠름
갈등을 우회함
```

배우자 결과와 혼동하지 않는다.

---

# 23. growthDirection 특별 검사

UNSUPPORTED_TRAIT 4건 중 growthDirection이 포함되어 있다면 가장 엄격하게 검토한다.

다음 구조가 있어야 한다.

```text
source personality fact
+
그 fact와 직접 연결된 source advice
```

조언만 있으면 제거한다.

---

# 24. internalConflict 특별 검사

다음 논리만으로 생성 금지:

```text
천간과 지지가 다르다
→ internalConflict
```

원자료가 실제로 상반·긴장·갈등을 설명해야 한다.

---

# 25. branchNature 특별 검사

일반적인 지지 상징을 모델이 추가했다면 제거.

원자료에서 해당 일주 Personality 해석에 실제 사용한 branch nature만 유지.

---

# 26. decisionStyle 특별 검사

행동 결과와 판단 방식을 혼동하지 않는다.

예:

```text
공무원 업무를 잘한다
```

는 decisionStyle 근거가 아니다.

반면:

```text
빠르게 판단한다
규칙을 기준으로 판단한다
```

는 source가 명시하면 가능.

---

# 27. sourceRef 정확성

11건 수정 후 각 trait의 sourceRef는:

```text
실제 trait를 직접 지지하는 최소 line range
```

여야 한다.

일주 전체 범위를 evidence로 잡지 않는다.

---

# 28. 잘못된 sourceRef 수정

trait 자체는 맞는데 line range가 틀린 경우:

```text
trait 유지
sourceRef 수정
```

가능.

단 source 어딘가에서 실제 지원되어야 한다.

---

# 29. Registry identity 변경 금지

이번 작업에서:

```text
DayStem identity
TenGod identity
DayPillar identity
PositionRule identity
```

를 변경하지 않는다.

---

# 30. canonical 계산 변경 금지

Personality source를 맞추기 위해 기존:

```text
TenGod calculation
Stem/Branch calculation
```

을 변경하지 않는다.

---

# 31. Structural Engine 변경 금지

```text
src/lib/judgment/
```

수정 0건이어야 한다.

필요해 보이더라도 이번 작업에서는 보고만 한다.

---

# 32. Personality Engine 구현 금지

아직 다음을 만들지 않는다.

```text
PersonalityFact generator
TenGodProminence
PersonalityResult
Conflict Resolver
Role Modifier
Luck Modifier
Renderer
```

---

# 33. 수정 후 11건 재감사

각 기존 감사 항목에 대해 표 작성:

| Audit ID | 기존 판정 | 수정 | sourceRef | 재판정 |
|---|---|---|---|---|

총:

```text
11 rows
```

여야 한다.

---

# 34. MISSING_EXTRACTION 목표

```text
MISSING_EXTRACTION = 0
```

---

# 35. UNSUPPORTED_TRAIT 목표

```text
UNSUPPORTED_TRAIT = 0
```

---

# 36. 기존 P2-A validation

실행:

```text
node scripts/verify-personality-knowledge-p2a.mjs
```

PASS.

---

# 37. 기존 P2-B validation

실행:

```text
node scripts/verify-personality-knowledge-p2b.mjs
```

PASS.

---

# 38. P2-C validation

실행:

```text
node scripts/verify-personality-knowledge-integration-p2c.mjs
```

Expected:

```text
PASS
```

---

# 39. TypeScript / Build

실행:

```text
npx tsc -b
npm run build
```

둘 다 PASS.

---

# 40. 추가 회귀

이번 수정에서 기존 P2-A 또는 P2-B Profile을 변경했으므로
P2-A / P2-B / P2-C 세 검증을 모두 실행한다.

Judgment source 변경이 없으면 Judgment 전체 회귀는 필수 아님.

---

# 41. audit result 업데이트

다음 결과 파일에 보완 결과를 기록한다.

```text
src/docs/codex/p2c-personality-knowledge-fix-result.md
```

---

# 42. 최종 보고 형식

## A. 수정 결과

```text
MISSING_EXTRACTION:
7 → ?

UNSUPPORTED_TRAIT:
4 → ?
```

---

## B. 11건 상세

| # | Profile | Field | 문제 | 처리 | Evidence | 결과 |
|---:|---|---|---|---|---|---|

---

## C. Registry 상태

```text
DayStem: 10/10
TenGod: 10/10
Position: 6/6
DayPillar: 60/60
```

---

## D. Conflict

```text
SOURCE_CONFLICT:
戊午 1
```

다음 확인:

```text
canonical = 正印
registry = 正印
偏財 오표기 기반 trait = 0
```

---

## E. Gap

```text
SOURCE_GAP:
```

총수를 보고한다.

감소한 경우 어떤 MISSING_EXTRACTION 복구로 감소했는지 설명한다.

---

## F. 검증

```text
P2-A:
P2-B:
P2-C:
npx tsc -b:
npm run build:
```

---

## G. 구조 격리

```text
Judgment source changes:
Personality → Judgment reverse dependency:
```

둘 다 0이어야 한다.

---

## H. 최종 상태

```text
FAIL:
MISSING_EXTRACTION:
UNSUPPORTED_TRAIT:
SOURCE_GAP:
SOURCE_CONFLICT:
NOT_IMPLEMENTED:
```

---

# 43. 종료 판정

다음 조건이면:

```text
READY_FOR_PERSONALITY_ENGINE
```

로 판정한다.

필수:

```text
MISSING_EXTRACTION = 0
UNSUPPORTED_TRAIT = 0
FAIL = 0

P2-A PASS
P2-B PASS
P2-C PASS
tsc PASS
build PASS
```

SOURCE_GAP은 허용.

戊午 SOURCE_CONFLICT 1건도 다음 조건이면 허용.

```text
canonical 정확
Registry canonical 유지
오표기 기반 Personality trait 없음
conflict provenance 유지
```

---

# 44. 작업 종료 후

`READY_FOR_PERSONALITY_ENGINE`이 나오면
더 이상 Knowledge Registry를 확장하지 않는다.

그 다음 단계부터 처음으로:

```text
PersonalityFact
TenGodProminence
PositionExpression
DayPillarModifier
PersonalityConflict
PersonalityResult
```

계산 엔진 설계로 넘어간다.