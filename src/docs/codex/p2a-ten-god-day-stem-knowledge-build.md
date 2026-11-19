# FILUNE Codex P2-A
## 십성 10개 · 일간 10개 Personality Knowledge 구축

이번 작업은 FILUNE Personality Engine 구현 전 단계다.

이번 단계에서는 **성격 판정 엔진을 구현하지 않는다.**

목표는 원자료:

```text
src/docs/source/personality/십성.md
src/docs/source/personality/일주풀이.md
```

에서 다음 Knowledge Registry를 만드는 것이다.

```text
DayStemProfile[10]
TenGodProfile[10]
PositionExpressionRules
```

60일주 Profile은 이번 작업에서 만들지 않는다.

---

# 1. 기준 문서

최우선:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

원자료:

```text
src/docs/source/personality/십성.md
src/docs/source/personality/일주풀이.md
```

Structural Engine 결과는 참고할 수 있으나 이번 작업에서 수정하지 않는다.

---

# 2. 작업 원칙

이번 작업은:

```text
source extraction
→ normalization
→ provenance 보존
→ Registry 생성
```

이다.

다음은 하지 않는다.

```text
PersonalityResult 생성
성격 우선순위 계산
TenGodProminence 계산
Role modifier 실행
운에 따른 Personality 변화
고객용 문장 생성
60일주 Profile 작성
```

---

# 3. Source 우선

성격 데이터는 반드시 제공된 원자료에서 추출한다.

금지:

```text
일반 명리 지식으로 빈 항목 보충
웹 검색으로 성격 추가
Codex가 알고 있는 십성 성격 추가
원자료에 없는 10천간 성격 창작
```

원자료가 충분하지 않으면:

```text
source_gap
```

으로 기록한다.

---

# 4. 십성 Profile 대상

다음 10개를 모두 만든다.

```text
比肩
劫財
食神
傷官
偏財
正財
偏官
正官
偏印
正印
```

---

# 5. TenGodPersonalityProfile schema

`12-personality-knowledge-schema.md`를 기준으로 최소 다음 구조를 사용한다.

```ts
interface TenGodPersonalityProfile {
  tenGod: TenGod;

  coreDrive: string[];

  coreStrengths: string[];

  ordinaryExpression: string[];

  productiveExpression: string[];

  excessiveExpression: string[];

  deficientExpression: string[];

  socialExpression: string[];

  innerExpression: string[];

  workStyle: string[];

  relationshipStyle: string[];

  decisionStyle: string[];

  stressResponse: string[];

  cautionPatterns: string[];

  traitVariants: PersonalityTraitVariant[];

  evidenceNotes: PersonalityEvidence[];
}
```

기존 프로젝트 타입 구조와 맞춰 파일명/타입명은 조정 가능하다.

의미는 바꾸지 않는다.

---

# 6. 십성 상위 핵심축

`십성.md`에 있는 다음 핵심축을 보존한다.

```text
比肩
→ 주체성 · 독립성

劫財
→ 모험성 · 경쟁성

食神
→ 창조성 · 연구·탐구

傷官
→ 혁신성 · 응용성

偏財
→ 과감성 · 통제성

正財
→ 치밀성 · 정확성

偏官
→ 권력성 · 극기성

正官
→ 명예성 · 합리성

偏印
→ 신비성 · 영감성

正印
→ 교육성 · 자비성
```

이 항목은 `coreDrive` 또는 동등한 상위 분류에 기록한다.

고객용 문장으로 변환하지 않는다.

---

# 7. 십성의 긍정/부정/부재/과다 분리

원자료에 제시된:

```text
긍정작용
부정작용
부재의 문제
과다의 문제
```

를 다음처럼 정규화한다.

```text
긍정작용
→ productiveExpression / coreStrengths

부정작용
→ cautionPatterns / ordinary shadow expression

부재의 문제
→ deficientExpression

과다의 문제
→ excessiveExpression
```

원문 의미를 임의로 바꾸지 않는다.

---

# 8. 길신/흉신은 Personality polarity가 아니다

원자료에 전통적인 길신/흉신 구분이 존재하더라도:

```text
正官 = good personality
傷官 = bad personality
劫財 = bad personality
```

처럼 사용하지 않는다.

전통 분류가 필요하면 evidence metadata에만 보존한다.

Personality Profile에는:

```text
productive
excessive
deficient
contextual
```

로 분리한다.

---

# 9. 육친 대응은 성격 Profile에서 제외

`십성.md`에는:

```text
남성 육친
여성 육친
```

대응표가 존재한다.

이번 Personality Registry에는 넣지 않는다.

필요하면:

```text
excludedSourceNotes
```

또는 audit report에만 기록한다.

향후 육친 Domain에서 별도로 사용한다.

---

# 10. 성별 고정관념 제외

다음 형태는 Personality Registry에 넣지 않는다.

```text
남자는 ~
여자는 ~
여자가 양팔통이면 ~
남자가 음팔통이면 ~
```

음양 기질은 성별과 분리하여 표현한다.

---

# 11. TenGod Profile에서 여러 견해 보존

원자료의 서로 다른 설명을 하나의 문장으로 억지 통합하지 않는다.

예:

```text
正印:
학습
보호
안정
도덕
생각
```

등이 여러 위치에서 등장하면 각 의미를 보존한다.

겹치는 표현만 정리한다.

---

# 12. PersonalityTraitVariant 사용

서로 상반되거나 조건에 따라 달라지는 설명은:

```ts
interface PersonalityTraitVariant {
  id: string;

  trait: string;

  expressionType:
    | "core"
    | "positive"
    | "shadow"
    | "excess"
    | "deficiency"
    | "contextual"
    | "traditional"
    | "modern";

  condition?: PersonalityCondition[];

  sourceRef: string;

  confidence:
    | "source_explicit"
    | "source_synthesis"
    | "filune_interpretation";
}
```

또는 기존 동등 타입으로 보존한다.

---

# 13. source_explicit / source_synthesis 구분

원문이 직접 말하는 성향:

```text
source_explicit
```

여러 원문 표현을 겹침 제거하여 정리한 것:

```text
source_synthesis
```

FILUNE이 구현 편의를 위해 분류만 한 것:

```text
filune_interpretation
```

으로 구분한다.

내용 자체를 새로 창작하지 않는다.

---

# 14. 일간 Profile 대상

다음 10개를 모두 만든다.

```text
甲
乙
丙
丁
戊
己
庚
辛
壬
癸
```

---

# 15. DayStemProfile의 핵심 소스

`일주풀이.md` 안의 반복되는:

```text
어떤 사람인가요? 일간 ○의 기질
```

부분을 우선 사용한다.

60일주마다 반복되는 동일 일간 설명을 모아서 공통성만 추출한다.

---

# 16. DayStemPersonalityProfile schema

```ts
interface DayStemPersonalityProfile {
  stem: HeavenlyStem;

  coreNature: string[];

  coreDrive: string[];

  strengths: string[];

  shadowTraits: string[];

  decisionStyle: string[];

  socialExpression: string[];

  innerExpression: string[];

  stressResponse: string[];

  growthDirection: string[];

  evidenceNotes: PersonalityEvidence[];
}
```

---

# 17. 일간 공통성과 일주 고유성을 분리

예:

```text
甲子
甲寅
甲辰
甲午
甲申
甲戌
```

여러 갑목 일주에서 반복되는:

```text
甲 자체의 공통 성향
```

만 `DayStemProfile[甲]`에 넣는다.

특정 일지 때문에 생기는 성향은 넣지 않는다.

---

# 18. 일지 때문에 생긴 성향 제외

예를 들어 원문에서:

```text
병화 + 자수
→ 활동적 성향과 응축 성향 충돌
```

을 설명한다면:

```text
丙의 기본 기질
```

만 DayStemProfile에 넣고,

```text
子 때문에 생긴 내적 긴장
```

은 이번 단계에서 제외한다.

그 내용은 향후 `DayPillarProfile[丙子]`에 들어간다.

---

# 19. 일지 십성 영향도 제외

원문에:

```text
일지 정관이므로 정직하고 합리적이다
```

처럼 설명되어 있다면,

그 부분을 병화 공통 DayStemProfile에 넣지 않는다.

그것은:

```text
DayPillarProfile
또는
DayBranch TenGod modifier
```

영역이다.

---

# 20. 십이운성 영향 제외

일주 원문에:

```text
십이운성 = 제왕 / 묘 / 목욕 ...
```

이 있어도 DayStemProfile에는 넣지 않는다.

---

# 21. 배우자·연애·궁합 내용 제외

`일주풀이.md`에는 다음 내용이 섞여 있다.

```text
배우자 자리
배우자 복
남편/아내
궁합
이성관계
결혼
이별
```

전부 이번 Registry에서 제외한다.

---

# 22. 재물·직업 성공 단정 제외

다음 내용도 제외한다.

```text
돈을 잘 번다
사업 성공
특정 직업에 적합
공무원
대기업
부자가 된다
명예를 얻는다
```

단 이러한 문장 안에서 순수 성격 요소:

```text
체계적
빠른 판단
규칙 선호
독립적
```

가 명확히 분리 가능하면 성격 요소만 추출할 수 있다.

---

# 23. 건강·사고·음주 등 예측 제외

다음은 Personality Registry에 넣지 않는다.

```text
질병
사고
수명
술을 피해야 한다
건강 문제
```

---

# 24. 운명·결과 단정 제외

다음도 제외:

```text
반드시 성공
평생 고생
인생이 다사다난
사회적으로 큰 자리
돈과 명예를 얻는다
```

---

# 25. 행동 조언과 성격 Fact 분리

원자료의:

```text
~하는 연습이 필요하다
~을 멀리해야 한다
~해야 한다
```

는 `growthDirection`으로 직접 복사하지 않는다.

먼저 실제 성격 Fact가 원문에 있는지 확인한다.

예:

```text
한번 실망하면 관계를 바로 정리한다
```

가 source explicit이면:

```text
shadowTraits:
관계 단절이 빠름
```

가능.

그 뒤 원문의 조언:

```text
한번 끊은 사람을 다시 부르는 연습
```

은 evidence note로만 보존하거나 `growthDirection`에 source-based로 넣을 수 있다.

---

# 26. 일간 Profile 중복 제거 기준

동일 일간의 여러 일주에서 반복되는 표현을 수집한다.

최소:

```text
2개 이상의 서로 다른 일주에서 반복
```

되는 성향은 공통 Profile 후보로 본다.

단 원문에서 명시적으로:

```text
일간 ○의 기질
```

이라고 정의한 내용은 한 사례만 있어도 source explicit 후보가 될 수 있다.

숫자 점수를 만들지 않는다.

---

# 27. 서로 충돌하는 일간 설명

같은 일간에 대해:

```text
적극적
신중함
```

처럼 상반되는 설명이 나오면 바로 하나를 삭제하지 않는다.

먼저 확인:

```text
일간 자체 설명인가
일지와 결합된 설명인가
십성 영향인가
특정 상황 설명인가
```

일지/십성 영향이면 DayStemProfile에서 제외한다.

그래도 순수 일간 설명끼리 충돌하면 `traitVariants` 또는 evidenceNotes에 남긴다.

---

# 28. PositionExpressionRules도 같이 고정

`십성.md`에서 제시된 위치 원칙을 별도 Registry로 만든다.

최소:

```text
Stem
MonthBranch
DayBranch
HourBranch
YearBranch
```

---

# 29. Stem Position

```text
외부에서 빠르게 보이는 성격
사회생활에서의 표현
말과 행동으로 직접 드러나는 태도
타인이 비교적 빨리 인식하는 성향
```

---

# 30. Branch Position

지지 일반:

```text
내재된 판단기제
본능적 성향
가까운 사람에게 드러나는 성격
오래 관계했을 때 보이는 성향
```

---

# 31. MonthBranch Position

```text
타고난 본성
쉽게 바뀌지 않는 반응
사회·직업 환경에서 반복되는 기본 기질
```

단:

```text
월지 = 전체 성격
```

으로 구현하지 않는다.

---

# 32. DayBranch Position

```text
개인적 판단
생활 속 본능적 선택
친밀한 관계에서의 반응
내부 결정 기준
```

배우자 예측은 제외한다.

---

# 33. HourBranch Position

```text
개인적 욕구
장기 계획
미래를 생각하는 방식
혼자 있을 때의 판단
```

---

# 34. YearBranch Position

원자료가 충분히 명시하지 않는다면 과도한 규칙을 만들지 않는다.

11-personality-master에 정의된 범위만 사용한다.

---

# 35. 십성 prominence 구현 금지

이번 단계에서는:

```text
low
present
prominent
very_prominent
```

판정을 구현하지 않는다.

그것은 Personality Engine 단계에서 한다.

---

# 36. 원국 구조 역할 연결 금지

이번 단계에서는:

```text
YongShen
SangShen
Byeong
GuEung
```

에 따른 Personality Modifier를 실행하지 않는다.

Profile 데이터만 만든다.

---

# 37. 운에 따른 Personality 변화 구현 금지

이번 단계에서는:

```text
NatalPersonality
CurrentPersonalityExpression
```

계산을 하지 않는다.

---

# 38. 권장 코드 위치

기존 프로젝트 구조와 충돌하지 않는다면:

```text
src/lib/personality/
├─ types.ts
└─ knowledge/
   ├─ dayStemProfiles.ts
   ├─ tenGodProfiles.ts
   └─ positionRules.ts
```

를 권장한다.

Personality Engine 함수는 아직 만들지 않는다.

---

# 39. 타입 위치

기존 공통 HeavenlyStem / TenGod 타입이 있으면 재사용한다.

새로운 중복 enum을 만들지 않는다.

---

# 40. DayStem Registry completeness

반드시 10개 모두 존재:

```text
甲 乙 丙 丁 戊 己 庚 辛 壬 癸
```

누락 시 FAIL.

---

# 41. TenGod Registry completeness

반드시 10개 모두 존재:

```text
比肩 劫財 食神 傷官 偏財 正財 偏官 正官 偏印 正印
```

누락 시 FAIL.

---

# 42. 빈 배열 처리

원자료가 특정 field를 지원하지 않으면:

```ts
[]
```

가능.

Codex가 추측해 채우지 않는다.

가능하면 evidenceNote에:

```text
source_gap
```

을 기록한다.

---

# 43. provenance 필수

모든 주요 trait는 source 추적이 가능해야 한다.

최소:

```ts
interface PersonalityEvidence {
  sourceType: "day_stem" | "ten_god" | "position";
  sourceId: string;
  sourceRef?: string;
  note?: string;
}
```

---

# 44. sourceRef

가능하면:

```text
src/docs/source/personality/십성.md#...
src/docs/source/personality/일주풀이.md#...
```

형태로 기록한다.

정확한 heading anchor가 불안정하면:

```text
filename + section title
```

방식도 허용한다.

---

# 45. source text를 Registry에 장문 복사하지 않는다

원문을 대량 그대로 저장하지 않는다.

Registry에는 정규화된 trait를 저장한다.

원문 자체는 source 문서에 남긴다.

---

# 46. 고객용 문체 저장 금지

예:

```text
당신은 어디서든 빛나는 사람입니다.
당신의 가장 큰 무기는...
```

같은 문장은 Registry에 넣지 않는다.

대신:

```text
사회적 존재감이 드러나기 쉬움
표현이 직접적임
```

처럼 normalized trait로 저장한다.

---

# 47. 과도한 추상화도 금지

반대로 모든 성격을:

```text
positive
negative
active
passive
```

정도로만 줄이지 않는다.

원자료의 구체성을 보존한다.

---

# 48. audit report 작성

Knowledge Registry 생성 후 별도 감사 보고서를 만든다.

권장 파일:

```text
src/docs/codex/p2a-ten-god-day-stem-knowledge-build-result.md
```

---

# 49. audit — 십성

각 십성별 보고:

| 십성 | coreDrive | productive | excessive | deficient | variants | source gap |
|---|---|---:|---:|---:|---:|---|

---

# 50. audit — 일간

각 일간별 보고:

| 일간 | coreNature | strengths | shadow | decision | evidence 수 | source gap |
|---|---|---:|---:|---:|---:|---|

---

# 51. excluded claims audit

제외한 원자료 유형도 집계한다.

```text
relationship_prediction
gender_determinism
wealth_prediction
career_prediction
health_prediction
compatibility_prediction
non_personality_claim
```

실제 원문을 전부 복사할 필요는 없다.

유형과 건수만 보고한다.

---

# 52. 십성 상호 중복 검사

서로 다른 십성 Profile이 완전히 동일한 문장 묶음으로 복제되지 않았는지 확인한다.

공통 표현이 있다고 삭제하지는 않는다.

단 copy/paste 오류는 수정한다.

---

# 53. 정편 구분 유지

다음은 각각 독립 Profile이다.

```text
正財 ≠ 偏財
正官 ≠ 偏官
正印 ≠ 偏印
食神 ≠ 傷官
比肩 ≠ 劫財
```

상위 오행 기능이 같다는 이유로 합치지 않는다.

---

# 54. 겁재와 양인 혼동 금지

원자료에서도 겁재와 양인은 관련이 있지만 동일 개념이 아니라고 구분한다.

Personality Knowledge에서는:

```text
劫財
```

만 TenGodProfile에 넣는다.

```text
羊刃
```

을 TenGodProfile로 추가하지 않는다.

---

# 55. 일간 강약 자료 처리

`십성.md`에:

```text
일간이 왕한 경우
일간이 약한 경우
```

성격 차이가 존재한다.

이번 단계에서는 이를 특정 DayStemProfile에 직접 섞지 않는다.

별도 contextual source note 또는 future modifier candidate로 기록한다.

즉:

```text
甲 = 일간 왕할 때 자신만만
```

식으로 저장하지 않는다.

---

# 56. 음양 편중 자료 처리

양팔통 / 음팔통 설명은:

```text
YinYangProfile
```

후속 데이터로 분리할 수 있으나 이번 작업의 필수 완성 범위는 아니다.

성별 표현은 제거한다.

필요하면:

```text
FOLLOW_UP
```

으로 보고한다.

---

# 57. source contradiction 처리

원자료 내부에서 서로 다른 설명이 있으면:

```text
CONFLICT
```

로 삭제하지 않고:

```text
traitVariants
```

로 보존한다.

단 실제로는 일지·십성 영향 때문에 다르게 보이는 경우라면 공통 일간 Profile에서 제외한다.

---

# 58. 이번 단계 완료 조건

다음이 모두 만족되어야 한다.

```text
[ ] DayStemProfile 10개
[ ] TenGodProfile 10개
[ ] PositionExpressionRules 작성
[ ] source provenance 존재
[ ] 배우자/궁합/건강/재물/직업 단정 제외
[ ] 성별 고정관념 제외
[ ] 60일주 데이터 미작성
[ ] Personality Engine 미구현
[ ] 기존 Structural Engine 수정 없음
```

---

# 59. 검증

반드시:

```text
npx tsc -b
npm run build
```

실행.

기존 Judgment 회귀에 영향을 주는 수정이 있었다면 기존 검증 전체도 실행한다.

원칙적으로 이번 작업은 Structural Engine에 영향을 주지 않아야 한다.

---

# 60. 신규 Knowledge validation

가능하면 신규 검증 스크립트를 작성한다.

예:

```text
scripts/verify-personality-knowledge-p2a.mjs
```

최소 확인:

```text
DayStem count = 10
TenGod count = 10
duplicate key = 0
missing required identity = 0
forbidden prediction field = 0
sourceRef 없는 주요 Profile = 0
```

---

# 61. 금지 문자열/필드 검사

Registry에 다음 유형의 예측 문장이 직접 들어가지 않았는지 검사한다.

예:

```text
배우자
남편
아내
이혼
외도
궁합
질병
수명
부자
돈을 많이 번다
성공한다
```

단 sourceRef/evidence note의 파일 원문 설명에 등장하는 것까지 무조건 실패시키지 않는다.

실제 Personality trait field를 대상으로 검사한다.

---

# 62. 일간 Profile 검증

각 일간 Profile의 trait가 실제로:

```text
일간 자체
```

에 대한 설명인지 확인한다.

다음 근거만 있으면 DayStemProfile에 넣지 않는다.

```text
특정 일지
특정 일지 십성
특정 십이운성
궁합
배우자궁
특정 지장간 구조
```

---

# 63. 결과 보고

최종 보고:

## A. 구현 결과

```text
DayStemProfile: 10/10
TenGodProfile: 10/10
PositionRules: ?
```

## B. 파일

| 파일 | 역할 |
|---|---|

## C. 십성 Coverage

| 십성 | 상태 | evidence | source gap |
|---|---|---:|---|

## D. 일간 Coverage

| 일간 | 상태 | evidence | source gap |
|---|---|---:|---|

## E. 제외된 자료

| 유형 | 건수 |
|---|---:|

## F. 검증

```text
npx tsc -b:
npm run build:
personality knowledge validation:
```

## G. 남은 항목

```text
FAIL:
PARTIAL:
SOURCE_GAP:
NOT_IMPLEMENTED:
```

---

# 64. 다음 단계 금지

이번 작업 완료 후 자동으로 60일주를 생성하지 않는다.

먼저 결과를 보고한다.

FILUNE 측에서:

```text
DayStemProfile 10개
TenGodProfile 10개
```

내용을 감사한 후에만:

```text
DayPillarProfile[60]
```

단계로 넘어간다.