# FILUNE Codex P2-B
## 60일주 Personality Knowledge 구축

P2-A에서 다음 Knowledge Registry 구축이 완료되었다.

```text
DayStemProfile     10/10
TenGodProfile      10/10
PositionRules       6/6
```

검증 상태:

```text
FAIL 0
PARTIAL 0
SOURCE_GAP 존재 — 허용
```

이번 작업의 목표는 `일주풀이.md`에서 **60개 DayPillarProfile을 성격 정보만 추출하여 구조화**하는 것이다.

이번 단계에서는 Personality Engine 결과 계산을 구현하지 않는다.

---

# 1. 기준 문서

최우선:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

P2-A Registry:

```text
src/lib/personality/knowledge/dayStemProfiles.ts
src/lib/personality/knowledge/tenGodProfiles.ts
src/lib/personality/knowledge/positionRules.ts
```

원자료:

```text
src/docs/source/personality/일주풀이.md
```

보조 원자료:

```text
src/docs/source/personality/십성.md
```

---

# 2. 이번 작업 범위

구현:

```text
DayPillarProfile[60]
DayPillar Registry
source provenance
excluded claim audit
knowledge validation
```

구현하지 않음:

```text
Personality Engine
TenGodProminence
StructuralRoleModifier 실행
Luck Personality Modifier
고객용 문장 Renderer
최종 PersonalityResult
```

---

# 3. 60일주 완전성

60갑자 전체가 정확히 한 번씩 존재해야 한다.

```text
甲子 乙丑 丙寅 丁卯 戊辰 己巳 庚午 辛未 壬申 癸酉
甲戌 乙亥 丙子 丁丑 戊寅 己卯 庚辰 辛巳 壬午 癸未
甲申 乙酉 丙戌 丁亥 戊子 己丑 庚寅 辛卯 壬辰 癸巳
甲午 乙未 丙申 丁酉 戊戌 己亥 庚子 辛丑 壬寅 癸卯
甲辰 乙巳 丙午 丁未 戊申 己酉 庚戌 辛亥 壬子 癸丑
甲寅 乙卯 丙辰 丁巳 戊午 己未 庚申 辛酉 壬戌 癸亥
```

누락/중복:

```text
FAIL
```

---

# 4. DayPillarProfile 역할

DayPillarProfile은:

```text
일간 공통 기질
+
일지와의 결합으로 생기는 성격 Modifier
```

중 **두 번째 부분만 저장하는 것을 원칙**으로 한다.

이미 P2-A의 `DayStemProfile`에 있는 일간 공통 문장은 반복 저장하지 않는다.

---

# 5. 핵심 분리

예:

```text
丙子
```

에서 원자료가:

```text
丙 = 밝고 활동적
子 = 응축되고 정적
둘의 긴장으로 감정·행동의 내부 충돌
```

을 설명한다면,

DayPillarProfile에는:

```text
丙의 밝고 활동적 성향
```

자체를 반복 저장하지 않는다.

대신:

```text
외부 표현과 내부 판단 사이에 긴장이 생기기 쉬움
```

같은 **丙子 고유 Modifier**만 저장한다.

---

# 6. 권장 schema

`12-personality-knowledge-schema.md` 기준을 따른다.

최소:

```ts
interface DayPillarProfile {
  pillar: DayPillar;

  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;

  dayBranchTenGod: TenGod;

  branchNature: string[];

  corePersonality: string[];

  decisionStyle: string[];

  interpersonalStyle: string[];

  strengths: string[];

  shadowPatterns: string[];

  internalConflict: string[];

  expressionPattern: string[];

  growthDirection: string[];

  excludedClaims: ExcludedPersonalityClaim[];

  evidenceNotes: PersonalityEvidence[];
}
```

기존 타입이 이미 있으면 그것을 우선 사용한다.

---

# 7. 일지 십성은 metadata

일지의 본기 기준 십성을:

```text
dayBranchTenGod
```

에 저장할 수 있다.

그러나:

```text
일지 정관
→ 무조건 합리적
```

처럼 자동 성격을 생성하지 않는다.

실제 `일주풀이.md`가 해당 일주 성격으로 설명한 내용만 Profile trait로 저장한다.

---

# 8. 십이운성

원자료의:

```text
장생
목욕
관대
건록
제왕
쇠
병
사
묘
절
태
양
```

은 metadata 또는 supporting evidence로만 보존 가능하다.

이번 Personality trait의 직접 생성 근거로 사용하지 않는다.

즉:

```text
십이운성 = 제왕
→ 추진력이 강함
```

처럼 Codex가 별도 해석하지 않는다.

---

# 9. branchNature

일지 자체의 계절·이미지·기질 설명 중,

원자료가 실제 Personality 해석에 사용한 부분만 기록한다.

예:

```text
子 = 차갑고 정적이며 응축되는 이미지
午 = 뜨겁고 확산되는 이미지
```

단 일반 명리 지식으로 부족한 설명을 추가하지 않는다.

---

# 10. corePersonality

특정 일주에만 나타나는 핵심 Personality Modifier를 기록한다.

예시 구조:

```text
丙子
→ 외향적 표현과 내적 억제 사이의 긴장
```

원자료가 실제로 지원할 때만 기록한다.

---

# 11. internalConflict

다음 같은 명시적 내부 충돌은 적극적으로 구조화한다.

```text
천간 성향 vs 지지 성향
하고 싶은 방식 vs 실제 판단 방식
외부 표현 vs 내부 반응
빠른 행동 vs 신중한 판단
```

단 원자료가 이를 실제로 설명해야 한다.

---

# 12. 상반된 성향 공존 허용

다음처럼 모순처럼 보이는 두 성향이 동시에 존재할 수 있다.

```text
외부에서는 적극적
내부에서는 신중함
```

이를 하나로 합치거나 한쪽을 삭제하지 않는다.

FILUNE Personality는 contradiction을 허용한다.

---

# 13. 일간 Profile 중복 제거

이미 P2-A에 있는:

```text
甲의 공통 성향
乙의 공통 성향
...
癸의 공통 성향
```

을 DayPillarProfile에 복사하지 않는다.

검증에서 P2-A 일간 profile과의 과도한 중복을 검사한다.

---

# 14. 십성 Profile 중복 제거

예:

```text
일지 偏財
```

라는 이유만으로 P2-A `偏財 TenGodProfile` 전체를 복사하지 않는다.

DayPillarProfile은 **해당 일주에서 실제로 나타난 변형·결합**만 저장한다.

---

# 15. 배우자궁 설명 제외

원자료의:

```text
배우자 자리(일지)
배우자궁
배우자 복
배우자 덕
남편
아내
결혼
이별
외도
```

는 Personality trait에 넣지 않는다.

---

# 16. 배우자궁 문단 안의 성격 표현

배우자궁 문단 안에 성격적인 표현이 섞여 있어도 자동 채택하지 않는다.

다음 조건을 모두 만족해야 추출 가능하다.

```text
1. 해당 표현이 사람 자신의 성향을 설명함
2. 배우자·관계 결과와 독립적으로 해석 가능
3. 다른 Personality 문단에서 근거가 확인됨
```

하나라도 불분명하면 제외.

---

# 17. 재물 예측 제외

다음 제외:

```text
돈을 잘 번다
재물복
부자가 된다
돈이 모인다
사업 성공
재산이 늘어난다
```

---

# 18. 직업 예측 제외

다음 제외:

```text
공무원에 적합
대기업에 적합
전문직
사업가
특정 업종
승진
직업운
```

단:

```text
규칙을 선호한다
체계적 업무 방식을 선호한다
빠르게 판단한다
```

처럼 순수 Personality/WorkStyle 요소가 원문에서 독립적으로 지원되면 Personality 요소만 추출 가능.

---

# 19. 건강 예측 제외

다음 제외:

```text
질병
수명
사고
중독
음주 위험
신체기관
건강운
```

---

# 20. 궁합 제외

다음 전부 제외:

```text
잘 맞는 일주
좋은 궁합
나쁜 궁합
천간합에 의한 궁합
교귀
배우자 궁합
```

---

# 21. 성별 단정 제외

다음 제외:

```text
남자라면
여자라면
남성은
여성은
남자는 배우자...
여자는 남편...
```

성격 자체가 성별과 독립적으로 재구성 가능하면 그 성격만 검토할 수 있다.

---

# 22. 운명적 결과 제외

다음 제외:

```text
평생 고생
말년에 성공
큰 자리에 오른다
돈과 명예를 얻는다
반드시 성공한다
가정이 깨진다
```

---

# 23. 사회 결과와 Personality 분리

예:

```text
빠르게 판단하기 때문에 사업에 성공한다
```

라면:

Personality:

```text
빠른 판단
```

만 추출 가능.

다음:

```text
사업 성공
```

은 제외.

---

# 24. 행동 조언 처리

원자료:

```text
관계를 다시 받아들이는 연습이 필요하다
```

와 같은 조언은 바로 `growthDirection`에 넣지 않는다.

먼저 앞 문장에서:

```text
한번 실망하면 관계를 빠르게 정리한다
```

같은 실제 성격 Fact가 있는지 확인한다.

있다면:

```text
shadowPatterns:
관계 단절 판단이 빠름
```

을 저장하고,

조언은 `growthDirection`에 source-based modifier로 넣을 수 있다.

---

# 25. 감정 표현

다음은 Personality로 포함 가능하다.

원자료가 지원하는 경우:

```text
감정 표현이 직접적
표정에 감정이 드러남
감정 변화가 빠름
감정을 오래 내부에 저장함
```

---

# 26. 판단 스타일

포함 가능:

```text
판단이 빠름
숙고 후 결정
직관 우선
규칙 우선
상황 적응
관계 고려
```

단 실제 source 근거 필요.

---

# 27. interpersonalStyle

포함 가능:

```text
관계를 쉽게 열음
갈등을 직접 해결
갈등을 우회
한번 실망하면 관계를 정리
상대를 챙김
거절이 어려움
```

배우자 예측과 분리한다.

---

# 28. strengths / shadowPatterns

같은 특성이 양면적으로 나타날 수 있다.

예:

```text
빠른 판단
```

Strength:

```text
상황 대응이 빠름
```

Shadow:

```text
성급한 결정 가능
```

원자료가 둘 다 지원하면 둘 다 보존한다.

---

# 29. expressionPattern

일간과 일지 결합으로:

```text
겉과 속이 다르게 보임
외부는 활발하지만 내부는 신중
내부 기준은 강하지만 표현은 부드러움
```

등이 source explicit이면 저장한다.

---

# 30. source_explicit

원문이 직접 말한 일주 성향:

```text
source_explicit
```

---

# 31. source_synthesis

여러 문장에서 명확히 같은 의미를 정리:

```text
source_synthesis
```

---

# 32. FILUNE inference 제한

FILUNE이 source에서 한 단계 추론해야만 생기는 trait는 가능하면 넣지 않는다.

불가피하면:

```text
filune_interpretation
```

으로 명시하고 audit에서 별도 집계한다.

목표는 최소화다.

---

# 33. provenance 필수

각 Profile에는 최소 하나 이상의 실제 sourceRef가 있어야 한다.

```text
src/docs/source/personality/일주풀이.md:<line-range>
```

형태를 권장한다.

---

# 34. line range

가능하면 해당 일주의 Personality 문단에 가장 가까운 최소 line range를 사용한다.

일주 전체 수십 줄을 하나의 evidence로 잡지 않는다.

---

# 35. 원문 장문 저장 금지

Registry에 일주 원문을 그대로 복사하지 않는다.

정규화된 trait만 저장한다.

---

# 36. 고객용 문장 금지

다음 같은 표현 금지:

```text
당신은 태양처럼 빛나는 사람입니다.
당신의 운명은...
당신은 사랑받을 사람입니다.
```

Registry에는:

```text
표현이 외부로 직접 드러나는 경향
```

처럼 중립적 trait를 저장한다.

---

# 37. deterministic language 완화

원문에:

```text
~한 사람이다
~할 수밖에 없다
```

가 있어도 Registry는 성격 경향으로 정규화한다.

예:

```text
관계를 빠르게 정리하는 경향
```

---

# 38. 일주의 성격과 구조 엔진 분리

DayPillarProfile은 다음에 절대 영향을 주면 안 된다.

```text
PatternContext
YongShen
SangShen
Byeong
GuEung
PatternEffectPolicy
Luck structural judgment
```

Personality Engine이 읽기만 한다.

---

# 39. DayPillarProfile → Structural Engine 금지

다음 방향 금지:

```text
DayPillar personality
→ Pattern judgment
```

허용 방향:

```text
Structural Engine
→ Personality modifier
```

는 향후 Personality Engine 단계에서만 구현.

---

# 40. 60일주 ID

각 Profile에는 안정적인 ID를 둔다.

예:

```text
jia-zi
yi-chou
bing-yin
...
```

또는 프로젝트 기존 naming 규칙 사용.

한자 pillar를 primary identity로 유지한다.

---

# 41. Registry 권장 위치

```text
src/lib/personality/knowledge/dayPillarProfiles.ts
```

파일이 너무 커질 경우:

```text
src/lib/personality/knowledge/dayPillars/
├─ jia.ts
├─ yi.ts
├─ bing.ts
...
└─ index.ts
```

처럼 일간별 6개씩 분할 가능.

단 Registry export는 하나로 제공한다.

---

# 42. 권장 분할

가독성을 위해 다음이 좋다.

```text
甲 6개
乙 6개
丙 6개
丁 6개
戊 6개
己 6개
庚 6개
辛 6개
壬 6개
癸 6개
```

---

# 43. 일간별 6개 완전성

각 일간:

```text
exactly 6 DayPillarProfile
```

이어야 한다.

---

# 44. dayBranchTenGod 검증

각 일주의 `dayBranchTenGod`이 기존 TenGod 계산 규칙과 일치하는지 검증한다.

단 Personality source 텍스트를 맞추기 위해 TenGod 계산 규칙을 바꾸지 않는다.

불일치 발견 시:

```text
SOURCE_CONFLICT
```

로 보고한다.

---

# 45. 원자료 오류 가능성

일주풀이 원자료와 기존 canonical TenGod 계산 결과가 다를 경우:

```text
코드 계산값을 임의 수정하지 않는다.
원자료를 임의 교정하지 않는다.
```

감사에서:

```text
SOURCE_CONFLICT
```

로 보고한다.

---

# 46. 십이운성 충돌도 동일

원자료 십이운성과 기존 canonical 계산이 다르면:

```text
SOURCE_CONFLICT
```

로 기록.

Personality trait 생성에는 사용하지 않는다.

---

# 47. P2-A Profile 재사용

DayPillarProfile에서 필요하면:

```text
dayStem
dayBranchTenGod
```

ID만 참조한다.

P2-A trait 배열을 복제하지 않는다.

---

# 48. knowledge completeness와 trait completeness 구분

60개 Profile은 모두 있어야 한다.

그러나 모든 필드가 채워질 필요는 없다.

원자료가 없는 경우:

```text
[]
```

와:

```text
source_gap
```

허용.

---

# 49. 빈 Profile

어떤 일주가 Personality 정보가 매우 적더라도 임의로 채우지 않는다.

최소 identity + metadata + evidence + source_gap로 Registry에 존재하게 한다.

---

# 50. excludedClaims

각 일주에서 제외된 대표 claim category를 기록할 수 있다.

예:

```text
relationship_prediction
compatibility_prediction
wealth_prediction
career_prediction
health_prediction
gender_determinism
non_personality_claim
```

원문 전체를 저장할 필요는 없다.

---

# 51. excludedClaims는 PersonalityResult에 사용 금지

향후 Renderer가 `excludedClaims`를 사용자에게 출력하지 않도록 타입 의미를 명확히 한다.

audit/provenance 전용이다.

---

# 52. 반복 일간 문단 검사

P2-A에서 이미 확인한:

```text
일간 ○의 기질
```

공통 반복 문단이 60일주에 반복될 수 있다.

이를 DayPillarProfile 고유 trait로 카운트하지 않는다.

---

# 53. 일주 결합 문단 시작점

공통 일간 기질 다음에 나오는:

```text
그 ○ 기질이 ○ 위에 앉아 있다
```

이후부터 일주 고유 Personality Modifier 후보로 본다.

단 배우자궁/재물/직업으로 전환되는 지점부터 다시 제외한다.

---

# 54. section segmentation

각 일주를 가능하면 다음 구간으로 나눈다.

```text
A. pillar intro
B. dayStem common nature
C. stem + branch personality combination
D. day-branch TenGod / spouse section
E. career / wealth / relationship / health claims
F. compatibility
```

주 추출 대상:

```text
C
```

보조 추출:

```text
B — P2-A 검증용
D — 순수 personality만 매우 제한적으로
```

제외 대상:

```text
E
F
```

---

# 55. 자동 segmentation 검증

가능하면 60개 일주 모두:

```text
section detected = true
```

인지 검사한다.

heading 누락 등 원자료 형식 차이가 있으면 수동 예외 map을 둬도 된다.

---

# 56. 위험한 자동 추출 금지

키워드만으로:

```text
배우자 → 전체 문단 삭제
직업 → 전체 문단 삭제
```

식의 거친 제거는 피한다.

한 문단 안에 Personality Fact와 예측이 섞여 있을 수 있기 때문이다.

성격 사실만 source에서 분리 가능한지 확인한다.

---

# 57. source_gap 범주

최소 다음을 구분 가능하면 좋다.

```text
missing_core_personality
missing_decision_style
missing_interpersonal_style
missing_strength
missing_shadow
missing_internal_conflict
missing_expression_pattern
missing_growth_direction
```

---

# 58. audit — 60일주 coverage

결과 보고:

| 일주 | core | decision | interpersonal | strengths | shadow | conflict | evidence | gap |
|---|---:|---:|---:|---:|---:|---:|---:|---:|

60행.

---

# 59. audit — 일간별 summary

| 일간 | Profile 수 | evidence | source_gap | conflict |
|---|---:|---:|---:|---:|

각 6개인지 확인.

---

# 60. audit — excluded claims

60일주 전체에서 제외한 항목을 유형별 집계한다.

```text
relationship_prediction
gender_determinism
wealth_prediction
career_prediction
health_prediction
compatibility_prediction
non_personality_claim
```

---

# 61. audit — P2-A 중복

DayPillarProfile trait 중 DayStemProfile과 동일/거의 동일한 표현을 탐지한다.

목표:

```text
P2-A common stem duplicate = 0
```

의미상 필요한 연결 표현은 예외 사유를 기록한다.

---

# 62. audit — TenGod generic duplicate

DayPillarProfile이 TenGodProfile 전체를 그대로 복제한 경우 FAIL.

특정 일주에서 그 TenGod 표현이 source explicit이면 일부 중복은 허용한다.

---

# 63. audit — forbidden deterministic claims

trait field에 다음이 직접 포함되면 검사한다.

```text
배우자
남편
아내
이혼
외도
궁합
재물복
부자가 된다
질병
수명
반드시 성공
평생 고생
```

sourceRef / excludedClaims metadata는 예외.

---

# 64. audit — gender

Personality trait field에서:

```text
남자는
여자는
남성은
여성은
```

0건이어야 한다.

---

# 65. audit — source provenance

60개 전부:

```text
evidence >= 1
```

또는 원자료에 Personality 정보가 정말 없는 경우:

```text
explicit source_gap
```

이어야 한다.

출처도 gap도 없는 Profile은 FAIL.

---

# 66. 신규 validation script

권장:

```text
scripts/verify-personality-knowledge-p2b.mjs
```

최소 검사:

```text
DayPillar count = 60
duplicate pillar = 0
each stem count = 6
missing identity = 0
forbidden prediction in trait fields = 0
gender deterministic trait = 0
missing provenance/gap = 0
dayStem common-copy violation = 0
```

---

# 67. 기존 P2-A 검증 유지

반드시:

```text
node scripts/verify-personality-knowledge-p2a.mjs
```

도 다시 PASS해야 한다.

---

# 68. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS 필요.

---

# 69. Structural Engine 변경 금지

다음 경로 수정이 발생하면 이유를 보고한다.

```text
src/lib/judgment/
```

원칙적으로 수정 0건이어야 한다.

---

# 70. Personality Engine 구현 금지

아직 다음을 만들지 않는다.

```text
calculatePersonality()
buildPersonalityResult()
rankTenGods()
scorePersonality()
```

---

# 71. 숫자 성격 점수 금지

금지:

```text
比肩 = 80
傷官 = 35
personalityScore
traitWeight
```

현재 단계는 Knowledge Registry다.

---

# 72. Prominence 구현 금지

다음은 다음 단계:

```text
low
present
prominent
very_prominent
```

이번에는 계산하지 않는다.

---

# 73. 최종 결과 파일

다음 파일에 결과를 저장한다.

```text
src/docs/codex/p2b-day-pillar-60-knowledge-build-result.md
```

---

# 74. 최종 보고 형식

## A. 전체 판정

```text
READY_FOR_PERSONALITY_ENGINE_AUDIT
```

또는:

```text
P2B_FIX_REQUIRED
```

---

## B. Registry

```text
DayPillarProfile: ?/60
甲: ?/6
乙: ?/6
丙: ?/6
丁: ?/6
戊: ?/6
己: ?/6
庚: ?/6
辛: ?/6
壬: ?/6
癸: ?/6
```

---

## C. Source 상태

```text
source_explicit:
source_synthesis:
filune_interpretation:
SOURCE_GAP:
SOURCE_CONFLICT:
```

---

## D. 제외 자료

| 유형 | 건수 |
|---|---:|
| relationship_prediction | |
| gender_determinism | |
| wealth_prediction | |
| career_prediction | |
| health_prediction | |
| compatibility_prediction | |
| non_personality_claim | |

---

## E. 검증

```text
npx tsc -b:
npm run build:
P2-A validation:
P2-B validation:
```

---

## F. 구조 엔진

```text
Judgment source changes:
Judgment regression required:
```

원칙:

```text
Judgment source changes = 0
```

---

## G. 남은 항목

```text
FAIL:
PARTIAL:
SOURCE_GAP:
SOURCE_CONFLICT:
NOT_IMPLEMENTED:
```

---

# 75. 종료 조건

다음 모두 만족하면:

```text
READY_FOR_PERSONALITY_ENGINE_AUDIT
```

판정한다.

```text
[ ] 60/60 Profile
[ ] 각 일간 6/6
[ ] 중복 pillar 0
[ ] forbidden Personality prediction 0
[ ] gender deterministic trait 0
[ ] P2-A common stem 복제 없음
[ ] provenance 또는 explicit source_gap 존재
[ ] P2-A validation PASS
[ ] P2-B validation PASS
[ ] TypeScript PASS
[ ] Build PASS
[ ] Structural Engine 변경 없음
```

SOURCE_GAP 자체는 실패 사유가 아니다.

SOURCE_CONFLICT가 존재하면 내용과 영향을 보고하고 임의 해결하지 않는다.

---

# 76. 작업 종료 후

60일주 Registry를 완성했다고 바로 Personality Engine을 구현하지 않는다.

먼저 결과를 보고한다.

다음 단계에서는:

```text
DayStemProfile[10]
TenGodProfile[10]
PositionRules
DayPillarProfile[60]
```

전체 Knowledge Layer에 대한 **통합 감사**를 먼저 수행한 뒤 Personality Engine으로 넘어간다.