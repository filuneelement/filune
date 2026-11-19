# FILUNE v1 성격 지식베이스 구조화 명세 v0.1

## 0. 목적

이 문서는 FILUNE Personality Engine이 사용할 성격 지식 데이터를 어떤 단위와 구조로 저장할지 정의한다.

기준 원자료:

```text
src/docs/source/personality/십성.md
src/docs/source/personality/일주풀이.md
```

상위 해석 규칙:

```text
src/docs/rules/master/11-personality-master.md
```

이 문서는 성격 해석 문장을 직접 생성하는 Renderer 문서가 아니다.

목적은 다음 데이터를 안정적으로 구조화하는 것이다.

```text
DayStemProfile[10]
TenGodProfile[10]
PositionExpressionRules
DayPillarProfile[60]
YinYangProfile
StructuralRoleModifier
PersonalityResult
```

---

# 1. Personality Engine의 기본 계층

성격 데이터는 다음 계층으로 분리한다.

```text
CanonicalChart
↓
DayStemProfile
↓
TenGodProfile
↓
PositionExpressionRules
↓
DayPillarProfile
↓
StructuralRoleModifier
↓
CurrentLuckPersonalityModifier
↓
PersonalityResult
```

각 계층은 서로 다른 역할을 가진다.

---

# 2. 일간 Profile과 일주 Profile을 분리한다

같은 일간 설명을 60일주마다 반복 저장하지 않는다.

예:

```text
甲子
甲寅
甲辰
甲午
甲申
甲戌
```

에는 모두 甲의 공통 기질이 존재한다.

따라서:

```text
DayStemProfile[10]
```

에 일간 공통 성향을 저장하고,

```text
DayPillarProfile[60]
```

에는 일간과 일지의 결합으로 생기는 추가 성향만 저장한다.

---

# 3. DayStemPersonalityProfile

## PK-010

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

# 4. 일간 10개

반드시 다음 10개를 별도 Profile로 가진다.

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

# 5. 일간 Profile의 역할

일간 Profile은 다음만 설명한다.

```text
기본 사고방식
기본 반응 방향
행동을 시작하는 방식
결정의 기본 성향
자기표현의 기본 톤
```

다음을 설명하지 않는다.

```text
격국
용신
성패
배우자 복
재물운
직업 성공
운의 길흉
```

---

# 6. TenGodPersonalityProfile

## PK-020

각 십성은 하나의 고정 성격 문장으로 저장하지 않는다.

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

---

# 7. 십성 10개

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

각각 독립 Profile을 가진다.

---

# 8. 십성의 상위 핵심축

원자료의 요약축을 상위 분류에 사용한다.

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

이것은 최종 출력 문장이 아니라 Profile 분류용 상위 키워드다.

---

# 9. 십성의 긍정·부정·부재·과다 자료 보존

원자료에는 십성별로:

```text
긍정작용
부정작용
부재의 문제
과다의 문제
```

가 정리되어 있다.

이를 그대로 다음으로 매핑한다.

```text
긍정작용
→ productiveExpression

부정작용
→ cautionPatterns / shadowTraits

부재의 문제
→ deficientExpression

과다의 문제
→ excessiveExpression
```

---

# 10. 여러 견해를 하나로 합쳐 삭제하지 않는다

같은 십성에 대해 원자료 안에서도 여러 설명이 존재할 수 있다.

예:

```text
정인
→ 보호
→ 학습
→ 생각
→ 안정

과다 시
→ 행동 지연
→ 안정 집착
```

처럼 서로 다른 측면을 모두 보존한다. 정인이 보호와 생각의 기능을 가지면서 과하면 행동을 미루거나 안정에 집착할 수 있다는 설명이 원자료에 존재한다.

---

# 11. PersonalityTraitVariant

## PK-021

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

---

# 12. 서로 충돌하는 설명 처리

서로 반대처럼 보이는 성향도 삭제하지 않는다.

예:

```text
상관
→ 혁신적
→ 표현력이 강함

동시에
→ 기존 질서와 충돌
→ 말이 날카로울 수 있음
```

둘 다 같은 십성의 서로 다른 발현이다.

---

# 13. PositionExpressionRule

## PK-030

천간과 지지의 성격 발현 차이를 별도 규칙으로 저장한다.

```ts
interface PositionExpressionRule {
  positionType:
    | "stem"
    | "month_branch"
    | "day_branch"
    | "hour_branch"
    | "year_branch";

  expressionDomain: string[];

  interpretationRules: string[];

  evidenceNotes: PersonalityEvidence[];
}
```

---

# 14. 천간

원자료에 따라 천간은:

```text
외부에 빠르게 보이는 성격
사회적 표현
말과 행동으로 드러나는 태도
타인이 인식하기 쉬운 모습
```

을 중심으로 사용한다.

---

# 15. 지지

지지는:

```text
숨겨진 성격
내재된 판단기제
가까운 사람에게 드러나는 모습
본능적 반응
```

을 중심으로 사용한다.

---

# 16. 월지

월지는 다음 Personality Context를 가진다.

```text
타고난 본성
쉽게 바뀌지 않는 반응
사회환경에서 반복되는 기질
직업환경에서 드러나는 기본 성향
```

원자료에서도 월지를 타고난 본성을 파악하는 중요한 위치로 설명한다.

---

# 17. 일지

Personality Engine에서는 다음에 사용한다.

```text
개인적 판단
생활 속 본능적 선택
친밀한 관계에서의 반응
내부 결정 기준
```

배우자 운명 예측과 분리한다.

---

# 18. 시지

다음에 사용한다.

```text
개인적인 욕구
장기 계획
미래를 생각하는 방식
혼자 있을 때의 판단기제
```

---

# 19. 년지

성격 엔진에서 년지는 보조 Context로 사용한다.

```text
초기환경에서 형성된 반응
외부환경과의 기본 접점
사회적으로 익숙하게 사용하는 태도
```

단 월지·일지보다 우선하지 않는다.

---

# 20. DayPillarPersonalityProfile

## PK-040

```ts
interface DayPillarPersonalityProfile {
  dayPillar: DayPillar;

  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;

  dayBranchTenGod: TenGod;

  twelveLifeStage?: TwelveLifeStage;

  branchSeason?: string;
  branchNature?: string[];

  corePersonality: string[];

  decisionStyle: string[];

  interpersonalStyle: string[];

  strengths: string[];

  shadowTraits: string[];

  internalConflict: PersonalityConflict[];

  expressionPattern: string[];

  excludedClaims: ExcludedPersonalityClaim[];

  evidenceNotes: PersonalityEvidence[];
}
```

---

# 21. 60일주 전부 Profile화한다

반드시:

```text
甲子 ~ 癸亥
```

60개 Profile을 가진다.

현재 원자료는 60번째 癸亥까지 포함한다.

---

# 22. 일주 Profile에는 일간 공통 설명을 반복 저장하지 않는다

예:

```text
甲子
甲寅
甲辰
```

마다:

```text
甲 = 큰 나무
전진
직진
시작
```

을 중복 복사하지 않는다.

그 내용은:

```text
DayStemProfile[甲]
```

에서 가져온다.

---

# 23. 일주 Profile은 결합 특성을 저장한다

중심 질문:

```text
이 일간이
이 일지 위에 앉았을 때
어떤 성격적 긴장 또는 특징이 추가되는가?
```

이다.

---

# 24. internalConflict를 적극 사용한다

## PK-041

```ts
interface PersonalityConflict {
  sourceA: string;
  sourceB: string;

  tension: string;

  possibleExpression: string[];
}
```

예:

```text
甲
→ 앞으로 나가려 함

子 / 正印
→ 생각·검토

결과
→ 실행 욕구는 강하지만 결정 전에 고민이 길어질 수 있음
```

---

# 25. 일주론 원문에서 추출할 항목

각 일주에서 다음만 우선 추출한다.

```text
일간 공통 기질과 다른 추가 특징
일지 성향
일지 십성
십이운성 보조
내부 갈등
의사결정 방식
대인관계 스타일
강점
과할 때의 문제
반복되는 행동 패턴
```

---

# 26. 일주론에서 제외할 항목

다음은 `DayPillarPersonalityProfile`에 넣지 않는다.

```text
배우자 복
이혼 가능성
외도 가능성
배우자 건강
자식복
특정 질병
사고
재산 규모
직업 성공 단정
사업 성공 단정
궁합 단정
특정 성별 운명
```

원문에는 남겨두되 Personality Registry에는 넣지 않는다.

---

# 27. ExcludedPersonalityClaim

필요하면 추출 과정에서 제외 사실만 기록할 수 있다.

```ts
interface ExcludedPersonalityClaim {
  sourceTextSummary: string;

  exclusionReason:
    | "relationship_prediction"
    | "health_prediction"
    | "wealth_prediction"
    | "career_prediction"
    | "gender_determinism"
    | "compatibility_prediction"
    | "non_personality_claim";
}
```

최종 고객 출력에는 사용하지 않는다.

---

# 28. 십이운성

일주 원자료에 존재하더라도:

```text
Personality primary factor
```

로 만들지 않는다.

다음처럼 보조정보로만 저장한다.

```ts
twelveLifeStageSupport?: {
  stage: TwelveLifeStage;
  supportingNotes: string[];
}
```

---

# 29. YinYangPersonalityProfile

## PK-050

원자료에는 양·음 편중을 성격 보조 요소로 보는 설명이 존재한다.

따라서 별도 Context로 둔다.

```ts
interface YinYangPersonalityProfile {
  balance:
    | "balanced"
    | "yang_dominant"
    | "yin_dominant"
    | "all_yang"
    | "all_yin";

  expressionNotes: string[];
}
```

---

# 30. 성별 고정관념은 제거한다

원자료에:

```text
여자가 양팔통이면 남성적
남자가 음팔통이면 여성적
```

같은 표현이 존재하더라도 Personality Engine에서는 그대로 사용하지 않는다.

대신:

```text
yang dominant
→ 외향적·즉각적·표현적 경향

yin dominant
→ 내향적·응축적·관찰적 경향
```

처럼 성별과 분리한다.

---

# 31. StructuralRoleModifier

## PK-060

Structural Engine 결과를 Personality 표현 보정에 사용할 수 있다.

```ts
interface StructuralRoleModifier {
  tenGod: TenGod;

  structuralFunction:
    | "favorable"
    | "unfavorable"
    | "mixed"
    | "inactive";

  emphasizedTraits: string[];

  cautionTraits: string[];

  explanationRules: string[];
}
```

---

# 32. RoleModifier는 기본 Personality를 삭제하지 않는다

예:

```text
傷官 기본:
혁신
응용
표현
비판
```

### favorable function

```text
혁신
창의적 해결
표현력
문제 발견
```

강조.

### adverse function

```text
지나친 비판
권위와 충돌
날카로운 표현
```

강조.

기본 Profile 자체는 유지한다.

---

# 33. YongShenRole과 좋은 성격을 동일시하지 않는다

금지:

```text
YongShen
→ 좋은 성격
```

Role은:

```text
그 성향이 현재 구조 안에서 어떻게 쓰이는가
```

를 보정할 뿐이다.

---

# 34. ByeongRole과 나쁜 성격을 동일시하지 않는다

금지:

```text
Byeong
→ 나쁜 사람
```

대신:

```text
해당 성향이 실제 문제와 연결되기 쉬운 발현 경로
```

로 설명한다.

---

# 35. TenGodProminence

## PK-070

십성의 성격적 두드러짐은 단순 개수로 정하지 않는다.

```ts
interface TenGodProminence {
  tenGod: TenGod;

  state:
    | "low"
    | "present"
    | "prominent"
    | "very_prominent";

  evidence: TenGodProminenceEvidence[];
}
```

---

# 36. Prominence에 사용할 근거

최소 다음을 검토한다.

```text
천간 투출 여부
월지·지지에서의 기반
RootState
Formation으로 인한 강화
RuntimeState
실제 구조 기능
반복 출현
```

---

# 37. 숫자 점수 금지

금지:

```text
천간 +30
월지 +50
통근 +20
```

또는:

```text
십성 3개 = very_prominent
```

같은 규칙.

정성적 evidence 기반으로 판정한다.

---

# 38. Prominence 상태와 과다는 동일하지 않다

```text
prominent
```

는 단순히 잘 드러나는 성향일 수 있다.

```text
excessiveExpression
```

은 실제로 그 성향이 과하게 작동할 때만 사용한다.

둘을 구분한다.

---

# 39. PersonalityEvidence

## PK-080

```ts
interface PersonalityEvidence {
  sourceType:
    | "day_stem"
    | "ten_god"
    | "position"
    | "day_pillar"
    | "yin_yang"
    | "structural_role"
    | "luck";

  sourceId: string;

  sourceRef?: string;

  note?: string;
}
```

---

# 40. PersonalityFact

엔진 내부에서 먼저 Fact를 만든다.

```ts
interface PersonalityFact {
  id: string;

  trait: string;

  domain:
    | "core"
    | "outward"
    | "inner"
    | "decision"
    | "work"
    | "relationship"
    | "strength"
    | "caution";

  sourceType: PersonalityEvidence["sourceType"];

  sourceId: string;

  polarity:
    | "productive"
    | "neutral"
    | "shadow";

  currentState:
    | "active"
    | "prominent"
    | "background"
    | "inactive";
}
```

---

# 41. Personality Engine도 Fact와 Interpretation을 분리한다

금지:

```text
傷官 있음
→ 말이 세다
```

바로 출력.

먼저:

```text
TenGodFact
PositionRule
Prominence
StructuralRole
```

를 확인한다.

---

# 42. PersonalityConflict

서로 다른 성향이 반대 방향으로 작동할 때 conflict를 생성한다.

```ts
interface PersonalityConflict {
  id: string;

  traitA: string;
  traitB: string;

  expressionDifference:
    | "outward_vs_inner"
    | "desire_vs_decision"
    | "speed_vs_caution"
    | "independence_vs_relationship"
    | "stability_vs_change"
    | "other";

  interpretation: string;
}
```

---

# 43. PersonalityResult

## PK-090

```ts
interface PersonalityResult {
  coreDisposition: string[];

  outwardTraits: string[];

  innerTraits: string[];

  decisionStyle: string[];

  workStyle: string[];

  relationshipStyle: string[];

  strengths: string[];

  cautionPatterns: string[];

  contradictions: PersonalityConflict[];

  dayPillarModifiers: string[];

  structuralRoleModifiers: string[];

  currentExpressionModifiers: string[];

  evidence: PersonalityEvidence[];
}
```

---

# 44. NatalPersonality와 CurrentPersonalityExpression

분리한다.

```ts
interface PersonalityState {
  natal: PersonalityResult;

  current?: PersonalityCurrentExpression;
}
```

```ts
interface PersonalityCurrentExpression {
  scope: JudgmentScope;

  activatedTraits: string[];

  softenedTraits: string[];

  newlyVisibleTraits: string[];

  temporaryConflicts: PersonalityConflict[];
}
```

---

# 45. 운이 Personality Profile 자체를 변경하지 않는다

운은:

```text
현재 더 잘 드러나는 성향
현재 눌리는 성향
현재 일시적으로 강해지는 행동방식
```

을 설명한다.

원국 Personality History를 덮어쓰지 않는다.

---

# 46. Customer Rendering은 별도 단계다

Knowledge Registry에는 다음 같은 고객용 문장을 직접 대량 저장하지 않는다.

```text
당신은 누구보다 강한 사람입니다.
당신은 사업가가 될 운명입니다.
```

Registry에는:

```text
trait
condition
expression
evidence
```

를 저장하고 Renderer가 최종 문장으로 만든다.

---

# 47. 고객 출력에서 단정 완화

원자료의 강한 표현은:

```text
반드시
무조건
평생
절대
```

를 그대로 사용하지 않는다.

다음 형태를 우선한다.

```text
~하는 경향이 있습니다.
~하게 반응하기 쉽습니다.
~한 상황에서 두드러질 수 있습니다.
```

---

# 48. 소스 문구와 고객 문구 분리

```ts
interface PersonalityKnowledgeItem {
  sourceMeaning: string;

  normalizedMeaning: string;

  customerSafeMeaning?: string;
}
```

원문 의미는 보존하되 고객 Renderer는 별도 문구를 사용한다.

---

# 49. Knowledge Registry 권장 구조

```text
src/lib/personality/knowledge/

├─ dayStemProfiles.ts
├─ tenGodProfiles.ts
├─ dayPillarProfiles.ts
├─ positionRules.ts
├─ yinYangProfiles.ts
└─ structuralRoleModifiers.ts
```

P0 Structural Engine과 분리한다.

---

# 50. Personality Engine 권장 구조

```text
src/lib/personality/

├─ knowledge/
│
├─ facts/
│  ├─ collectTenGodPersonalityFacts.ts
│  ├─ collectPositionFacts.ts
│  └─ collectDayPillarFacts.ts
│
├─ prominence/
│  └─ evaluateTenGodProminence.ts
│
├─ conflicts/
│  └─ resolvePersonalityConflicts.ts
│
├─ modifiers/
│  ├─ applyStructuralRoleModifiers.ts
│  └─ applyLuckPersonalityModifiers.ts
│
├─ result/
│  └─ buildPersonalityResult.ts
│
└─ types.ts
```

---

# 51. Structural Engine과의 연결점

Personality Engine은 Structural Engine의 내부 판정을 다시 계산하지 않는다.

입력만 받는다.

예:

```text
RootState
RuntimeState
StructuralRole
CurrentStructuralFunction
```

을 읽는다.

---

# 52. Personality Engine이 Structural Engine에 영향을 주지 않는다

절대 금지:

```text
일주론이 강한 성격
→ 일간 강함 처리

상관 성격이 강함
→ 상관을 YongShen으로 선택

일주 Profile이 좋음
→ 성격/운세 成
```

성격 엔진은 구조 판정을 역으로 수정하지 않는다.

---

# 53. Source 데이터와 Rule 데이터 분리

```text
source/personality/
→ 원문

rules/master/11-personality-master.md
→ 해석 원칙

rules/master/12-personality-knowledge-schema.md
→ 데이터 구조

src/lib/personality/knowledge/
→ 코드 Registry
```

이 네 층을 섞지 않는다.

---

# 54. Source Provenance

각 Profile 항목은 가능하면 원자료 출처를 추적할 수 있게 한다.

예:

```ts
{
  trait: "경쟁심",
  sourceRef: "source/personality/십성.md#겁재"
}
```

---

# 55. 일주 Profile 작성 원칙

60일주 Profile을 만들 때 다음 절차를 따른다.

```text
1. 일주 원문 읽기
2. 일간 공통 설명 제거
3. 일지 성향 추출
4. 일지 십성 확인
5. 십이운성은 보조로만 기록
6. 고유 성격 표현 추출
7. 내부 갈등 추출
8. 성별·배우자·질병·재물 단정 제거
9. 중복 표현 정리
10. sourceRef 기록
```

---

# 56. TenGod Profile 작성 원칙

```text
1. 십성의 여러 설명 수집
2. coreDrive 추출
3. ordinary / productive 구분
4. excessive / deficiency 구분
5. social / inner 구분
6. work / relationship 구분
7. 충돌하는 견해는 Variant로 보존
8. 길신·흉신 표시는 성격 polarity에 사용하지 않음
```

---

# 57. DayStem Profile 작성 원칙

```text
1. 60일주 자료에서 동일 일간 설명 수집
2. 반복되는 공통 기질 추출
3. 특정 일지 때문에 생긴 성향 제거
4. 10개 일간 공통 Profile 생성
5. 일주 Profile에서 공통 설명 중복 제거
```

---

# 58. Personality Engine 실행 순서

```text
CanonicalChart
↓
resolve DayStemProfile
↓
collect TenGod PersonalityFacts
↓
apply PositionExpressionRules
↓
evaluate TenGodProminence
↓
apply MonthBranch Context
↓
apply Day/Hour Decision Context
↓
apply DayPillarProfile
↓
resolve PersonalityConflicts
↓
apply StructuralRoleModifiers
↓
apply CurrentLuckModifiers
↓
build PersonalityResult
```

---

# 59. Personality Engine 구현 금지

다음은 금지한다.

```text
십성 개수만으로 강약 판정
십성을 길신/흉신으로 성격 판정
일주론으로 격국 판정
일주론으로 용신 결정
일주론으로 운의 길흉 결정
배우자/건강/재물 단정을 Personality Profile에 포함
성별 고정관념을 성격 규칙으로 사용
Role = 좋은/나쁜 성격
운이 NatalPersonality를 덮어쓰기
상충하는 성격 중 하나를 삭제
숫자 성격 점수 사용
```

---

# 60. 최소 구현 단위

Personality Engine 구현 시 최소 다음 Registry가 완성되어야 한다.

```text
[ ] DayStemProfile 10개
[ ] TenGodProfile 10개
[ ] PositionExpressionRules
[ ] DayPillarProfile 60개
[ ] YinYangProfile
[ ] StructuralRoleModifier
```

---

# 61. 성격 결과의 목적

최종적으로 FILUNE이 보여줘야 할 것은 단순한 성격 키워드 목록이 아니다.

```text
무엇을 중요하게 생각하는가
밖에서는 어떻게 보이는가
실제로는 어떻게 판단하는가
일할 때 어떤 방식인가
사람과 어떻게 관계 맺는가
어떤 점이 강점인가
어떤 성향이 지나치면 문제가 되는가
서로 모순된 성향은 어떻게 함께 존재하는가
```

를 설명할 수 있어야 한다.

---

# 62. 최종 원칙

FILUNE Personality Knowledge는 다음 세 가지를 분리한다.

```text
Trait
Expression
StructuralFunction
```

예:

```text
傷官

Trait:
혁신·응용·표현

Expression:
천간이면 외부 표현으로 강하게 보일 수 있음
지지이면 내부 판단·가까운 관계에서 강하게 작동

StructuralFunction:
현재 구조에서 favorable / adverse / mixed 가능
```

따라서:

```text
십성이 무엇인가
+
어디에 있는가
+
얼마나 실제로 작동하는가
+
일주가 어떤 추가 특성을 만드는가
+
현재 구조에서 어떻게 발현되는가
```

를 결합하여 PersonalityResult를 생성한다.

그리고 일주론은 끝까지:

```text
Personality Modifier only
```

로 유지한다.