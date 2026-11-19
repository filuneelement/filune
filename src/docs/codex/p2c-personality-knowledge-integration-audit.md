# FILUNE Codex P2-C
## Personality Knowledge Layer 통합 감사

P2-A와 P2-B가 완료되었다.

현재 Knowledge Layer:

```text
DayStemProfile[10]
TenGodProfile[10]
PositionExpressionRules[6]
DayPillarProfile[60]
```

검증 상태:

```text
P2-A PASS
P2-B PASS
FAIL 0
PARTIAL 0
SOURCE_CONFLICT 1
```

이번 작업에서는 Personality Engine을 구현하지 않는다.

목표는 P2-A와 P2-B에서 구축한 Knowledge Layer 전체가
Personality Engine의 입력 데이터로 사용 가능한 상태인지 최종 감사하는 것이다.

---

# 1. 감사 대상

다음 파일을 전수 감사한다.

```text
src/lib/personality/types.ts

src/lib/personality/knowledge/dayStemProfiles.ts
src/lib/personality/knowledge/tenGodProfiles.ts
src/lib/personality/knowledge/positionRules.ts
src/lib/personality/knowledge/dayPillarProfiles.ts
```

분할 파일이 존재하면 해당 Registry 전체를 포함한다.

기준 문서:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

원자료:

```text
src/docs/source/personality/십성.md
src/docs/source/personality/일주풀이.md
```

---

# 2. 이번 작업의 원칙

이번 단계는:

```text
Knowledge Audit
```

이다.

금지:

```text
Personality Engine 구현
Prominence 계산
Personality score
StructuralRoleModifier 실행
Luck modifier
Renderer
새 성격 지식 추가
source gap 임의 보충
```

---

# 3. Registry 완전성

반드시 확인:

```text
DayStemProfile = 10
TenGodProfile = 10
DayPillarProfile = 60
PositionExpressionRules = 6
```

그리고:

```text
각 일간 DayPillar = 6
```

이어야 한다.

---

# 4. Identity 일관성

다음 identity가 서로 일치하는지 확인한다.

```text
DayPillar.pillar
DayPillar.dayStem
DayPillar.dayBranch
DayPillar.dayBranchTenGod
```

canonical 계산을 기준으로 검증한다.

---

# 5. TenGod canonical 감사

60개 일주의 `dayBranchTenGod`을 기존 canonical TenGod 계산과 전수 비교한다.

Expected:

```text
canonical mismatch = 0
```

원자료 표기와 canonical이 다르면 Registry를 원자료 오표기에 맞춰 변경하지 않는다.

해당 건은:

```text
SOURCE_CONFLICT
```

로만 유지한다.

---

# 6. 戊午 SOURCE_CONFLICT 특별 감사

현재 알려진 충돌:

```text
戊午
```

원자료 일부 구간에서 일지 십성을:

```text
偏財
```

로 표기.

하지만:

```text
원자료 도입부
원자료 본기 설명
canonical TenGod 계산
```

은:

```text
正印
```

과 일치한다.

다음을 확인한다.

```text
[ ] Registry dayBranchTenGod = 正印
[ ] canonical 계산 변경 없음
[ ] 偏財 오표기에서 Personality trait를 파생하지 않음
[ ] source conflict evidence가 남아 있음
```

하나라도 실패하면 FAIL.

---

# 7. SOURCE_CONFLICT와 SOURCE_GAP 구분

반드시 구분한다.

```text
SOURCE_GAP
= 원자료가 해당 성격 필드를 말하지 않음

SOURCE_CONFLICT
= 원자료 내부 또는 canonical 사실과 표기가 충돌
```

둘을 같은 상태로 처리하지 않는다.

---

# 8. P2-A DayStem → P2-B 중복 감사

DayPillarProfile에 해당 일간의 공통 문장이 반복 저장되어 있는지 전수 검사한다.

예:

```text
丙 DayStemProfile
→ 밝고 외부 표현이 직접적
```

가 있다면 모든 丙○ DayPillar에 그대로 복제되어 있으면 안 된다.

DayPillar에는:

```text
stem + branch combination modifier
```

만 남기는 것이 원칙이다.

---

# 9. duplicate 분류

중복이 발견되면:

### A. 불필요한 공통 일간 복제

```text
FAIL
```

### B. 일주 결합을 설명하기 위해 필요한 최소 반복

```text
allowed_with_reason
```

### C. 원자료가 해당 일주 고유 성향으로 다시 명시

```text
allowed_source_explicit
```

로 구분한다.

---

# 10. TenGod generic copy 감사

DayPillarProfile이 일지 십성 때문에
TenGodProfile의 일반 특성을 그대로 복사했는지 검사한다.

금지 예:

```text
일지 正官
→ TenGodProfile 正官의 전체 trait 복사
```

허용:

```text
원자료가 해당 일주에서 실제로 正官적 성향을 구체적으로 설명
```

한 경우만 해당 trait 일부를 가질 수 있다.

---

# 11. PositionExpressionRules와 Knowledge 분리

다음은 위치 규칙이다.

```text
천간 = 외부 표현
지지 = 내재 판단
월지 = 타고난 본성
일지 = 내부 결정 기준
시지 = 개인적 욕구/장기 판단
년지 = 보조 맥락
```

이를 개별 TenGodProfile이나 DayPillarProfile에 반복 하드코딩하지 않았는지 검사한다.

---

# 12. TenGod polarity 감사

TenGodProfile에:

```text
good personality
bad personality
길신이므로 좋은 사람
흉신이므로 나쁜 성격
```

같은 방향이 없어야 한다.

다음 분리는 유지:

```text
productive
ordinary
excessive
deficient
contextual
```

---

# 13. 正偏 구분 감사

다음 쌍은 distinct Profile이어야 한다.

```text
比肩 ≠ 劫財
食神 ≠ 傷官
正財 ≠ 偏財
正官 ≠ 偏官
正印 ≠ 偏印
```

공통 표현이 일부 존재하는 것은 허용.

전체 Profile이 실질적으로 같은 것은 FAIL.

---

# 14. 印綬 mapping 감사

현재 기존 TenGod 표현:

```text
印綬
```

를 Personality Registry:

```text
正印
```

에 매핑했다.

이 mapping이 기존 Structural Engine의 TenGod enum 의미를 훼손하지 않는지 확인한다.

Personality Knowledge 내부 adapter/mapping 수준이어야 한다.

Structural Engine TenGod 의미 변경 금지.

---

# 15. excluded claim 전수감사

trait field에 다음 내용이 들어갔는지 검사한다.

```text
배우자 예측
연애·결혼 결과
성별 운명 단정
재물 결과
직업 결과
건강 예측
궁합
운명 결과
```

Expected:

```text
forbidden trait = 0
```

---

# 16. 관계 성향과 관계 예측 구분

다음은 Personality로 허용 가능:

```text
상대를 잘 챙긴다
거절하기 어렵다
관계를 빠르게 정리한다
갈등을 우회한다
```

다음은 제외:

```text
배우자복이 있다
결혼이 늦다
이혼 가능성이 있다
특정 일주와 궁합이 좋다
```

감사에서 둘을 혼동하지 않는다.

---

# 17. WorkStyle과 직업예측 구분

허용:

```text
체계적 방식 선호
빠른 판단
독립적 업무 선호
규칙 중심
```

금지:

```text
공무원이 된다
대기업이 좋다
사업가가 적합
전문직 성공
```

---

# 18. source provenance 감사

모든 Profile 핵심 trait가 다음 중 하나를 가져야 한다.

```text
source_explicit
source_synthesis
```

현재 P2-B에서는:

```text
filune_interpretation = 0
```

이다.

통합감사 후에도 원칙적으로 0을 유지한다.

---

# 19. source_synthesis 감사

`source_synthesis`가 실제 source 범위 안의 요약인지 표본검사한다.

특히 27개 전부를 가능하면 전수 확인한다.

금지:

```text
source에 없는 새로운 심리 메커니즘 추가
```

---

# 20. DayStem source 감사

P2-A의 일간 10개는 각 일간의 6개 일주에서 반복된
공통 기질 문단을 기반으로 한다.

각 DayStemProfile에:

```text
특정 일주만의 branch modifier
일지 십성
십이운성
배우자 설명
```

이 섞이지 않았는지 다시 검사한다.

---

# 21. DayPillar source segmentation 감사

60일주별 source extraction이 다음 원칙을 따르는지 확인한다.

```text
A. 일주 소개
B. 공통 일간 기질
C. stem + branch 결합 Personality
D. 일지 십성/배우자
E. 재물·직업·건강·관계 결과
F. 궁합
```

주 Personality source는:

```text
C
```

여야 한다.

B는 DayStem 검증용.

D는 순수 성격이 독립적으로 확인될 때만 제한적으로 허용.

E/F는 제외.

---

# 22. DayPillar internalConflict 감사

`internalConflict`가 단순히:

```text
천간과 지지가 다름
```

이라는 일반 논리로 자동 생성되지 않았는지 검사한다.

원자료가 실제로 내부 긴장/상반성을 설명한 경우에만 존재해야 한다.

---

# 23. branchNature 감사

`branchNature`도 일반 명리 지식으로 채운 것이 아니라
실제 원자료가 Personality 설명에 사용한 내용인지 확인한다.

source가 없는 branchNature는 제거하거나 source_gap 처리한다.

---

# 24. growthDirection 감사

`growthDirection`은 가장 엄격하게 검사한다.

다음만 허용한다.

```text
source에서 명확한 성격 Fact
+
그 Fact와 직접 연결된 조언
```

단순 조언만 존재할 경우 Personality trait로 승격하지 않는다.

---

# 25. deterministic wording 감사

Knowledge trait에 다음 식의 문장이 없어야 한다.

```text
반드시 ~한다
무조건 ~하다
평생 ~하다
결국 ~한다
```

성격 경향으로 정규화되어 있어야 한다.

---

# 26. 고객용 문체 감사

Knowledge Registry에:

```text
당신은...
당신에게는...
당신의 운명은...
```

형식이 없어야 한다.

Knowledge Layer는 중립적 normalized trait다.

---

# 27. SOURCE_GAP 감사

현재:

```text
P2-A:
일간 40
십성 26
위치 1

P2-B:
394 field gaps
```

가 존재한다.

이번 감사에서는 이를 채우지 않는다.

대신 다음을 확인한다.

```text
source가 실제로 있는데 gap으로 잘못 둔 것
```

이 있는지만 검사한다.

---

# 28. gap overuse 검사

원자료에 분명한 성격 Fact가 있는데
Registry field가 비어 있다면:

```text
MISSING_EXTRACTION
```

으로 보고한다.

이는 SOURCE_GAP과 다르다.

---

# 29. gap underuse 검사

원자료 근거가 없는데 trait가 채워져 있으면:

```text
UNSUPPORTED_TRAIT
```

로 보고한다.

이쪽이 더 심각하다.

---

# 30. evidence line-range 감사

sourceRef line range가:

```text
실제 해당 trait를 지지하는 최소 범위
```

인지 표본 또는 전수 검사한다.

너무 넓은 일주 전체 범위를 근거로 사용하지 않는다.

---

# 31. sourceRef path 감사

모든 sourceRef가 저장소 현재 경로:

```text
src/docs/source/personality/
```

를 가리키는지 확인한다.

이동 전 경로나 삭제된 경로를 참조하면 수정 대상.

---

# 32. source file immutable

이번 감사 과정에서:

```text
십성.md
일주풀이.md
```

원자료를 수정하지 않는다.

원자료 오류는 `SOURCE_CONFLICT`로 남긴다.

---

# 33. Structural Engine isolation

다음 방향을 확인한다.

```text
Judgment Engine
→ 향후 Personality Engine에서 읽기 가능
```

금지:

```text
Personality Knowledge
→ Judgment Engine 판정 변경
```

P2-A/P2-B 코드 때문에 `src/lib/judgment/`가 import하는 personality module이 있으면 FAIL.

---

# 34. import direction 감사

허용:

```text
personality
→ shared canonical types
```

향후:

```text
personality engine
→ judgment output
```

가능.

금지:

```text
judgment
→ personality knowledge
```

---

# 35. circular dependency 감사

personality knowledge 도입으로 circular import가 생기지 않았는지 확인한다.

---

# 36. Type/schema consistency

다음 Registry가 같은 evidence/type 체계를 사용하는지 확인한다.

```text
DayStemProfile
TenGodProfile
DayPillarProfile
PositionExpressionRules
```

불필요하게 서로 다른 provenance 구조를 쓰고 있다면 보고한다.

---

# 37. Personality Engine 입력 계약 초안 확인

코드를 구현하지 말고,
현재 Knowledge Layer로 향후 최소 다음 입력을 만들 수 있는지만 감사한다.

```text
dayStem base
tenGod traits
position expression
dayPillar modifier
```

모두 접근 가능해야 한다.

---

# 38. Prominence는 아직 계산하지 않는다

이번 감사에서는:

```text
low
present
prominent
very_prominent
```

를 구현하거나 판정하지 않는다.

다만 향후 Prominence가 `TenGodProfile`을 참조할 수 있는 구조인지 확인만 한다.

---

# 39. 빈 필드 때문에 Engine이 실패하지 않아야 함

향후 엔진은:

```text
[]
source_gap
```

을 정상 입력으로 받아야 한다.

모든 필드가 채워져 있다고 가정하는 Knowledge 구조면 수정 필요.

---

# 40. audit script

권장:

```text
scripts/verify-personality-knowledge-integration-p2c.mjs
```

---

# 41. 자동 검증 최소 항목

```text
DayStem = 10
TenGod = 10
DayPillar = 60
PositionRules = 6

DayPillar per stem = 6

canonical TenGod mismatch = 0

unsupported trait = 0
forbidden prediction trait = 0
gender deterministic trait = 0
customer-facing prose = 0

missing provenance without gap = 0

structural judgment import from personality = 0
```

---

# 42. P2-A / P2-B 기존 검증

반드시 재실행:

```text
node scripts/verify-personality-knowledge-p2a.mjs
node scripts/verify-personality-knowledge-p2b.mjs
```

---

# 43. build

반드시:

```text
npx tsc -b
npm run build
```

PASS.

---

# 44. Judgment source 변경 금지

이번 감사 수정으로:

```text
src/lib/judgment/
```

변경하지 않는다.

변경이 필요하다고 판단되면 구현하지 말고 보고한다.

---

# 45. 결과 파일

감사 결과:

```text
src/docs/codex/p2c-personality-knowledge-integration-audit-result.md
```

에 기록한다.

---

# 46. Coverage 보고

## DayStem

| Stem | traits | evidence | gap | unsupported |
|---|---:|---:|---:|---:|

## TenGod

| TenGod | traits | evidence | gap | unsupported |
|---|---:|---:|---:|---:|

## DayPillar

일간 단위 summary:

| Stem | Pillars | traits | evidence | gaps | conflicts |
|---|---:|---:|---:|---:|---:|

---

# 47. Conflict 보고

특히:

```text
戊午 SOURCE_CONFLICT
```

를 별도 항목으로 보고한다.

형식:

```text
Source text:
Canonical:
Registry:
Personality trait impact:
Resolution:
```

Resolution은 원자료 수정이 아니라:

```text
canonical retained
source conflict preserved
```

이어야 한다.

---

# 48. 최종 상태 분류

```text
FAIL
PARTIAL
SOURCE_GAP
SOURCE_CONFLICT
MISSING_EXTRACTION
UNSUPPORTED_TRAIT
NOT_IMPLEMENTED
```

을 분리한다.

---

# 49. 완료 판정

다음이면:

```text
READY_FOR_PERSONALITY_ENGINE
```

로 판정한다.

조건:

```text
FAIL = 0
UNSUPPORTED_TRAIT = 0
MISSING_EXTRACTION = 0
```

그리고:

```text
P2-A PASS
P2-B PASS
P2-C PASS
tsc PASS
build PASS
```

SOURCE_GAP은 허용한다.

SOURCE_CONFLICT도 다음 조건이면 허용한다.

```text
canonical fact는 정확
Registry는 canonical 사용
conflicting source에서 잘못된 trait를 생성하지 않음
conflict provenance가 보존됨
```

---

# 50. 이번 감사 이후

`READY_FOR_PERSONALITY_ENGINE`이 나오기 전에는
Personality Engine을 구현하지 않는다.

통과 후 다음 단계에서 처음으로:

```text
PersonalityFact
TenGodProminence
PositionExpression
DayPillarModifier
PersonalityConflict
PersonalityResult
```

계산 엔진 설계를 시작한다.