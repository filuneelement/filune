# FILUNE Codex P2-G
## Personality Engine 최종 통합 감사

P2-A부터 P2-F까지 Personality Knowledge와 Personality Engine 구현이 완료되었다.

현재 파이프라인:

```text
Knowledge Layer
↓
Natal Personality
↓
StructuralRoleModifier
↓
Current Personality
```

구체적으로:

```text
DayStemProfile[10]
TenGodProfile[10]
PositionRules[6]
DayPillarProfile[60]

↓

buildNatalPersonality()

↓

applyStructuralRoleModifiers()

↓

buildCurrentPersonality()
```

현재 검증 상태:

```text
P2-A PASS
P2-B PASS
P2-C PASS
P2-D PASS
P2-E PASS
P2-F PASS

Judgment regression 35/35 PASS

FAIL 0
PARTIAL 0
```

이번 작업은 **최종 통합 감사만 수행한다.**

고객용 Renderer는 아직 구현하지 않는다.

---

# 1. 감사 목표

다음 전체 파이프라인이 서로 모순 없이 동작하는지 검증한다.

```text
Source
→ Knowledge Registry
→ Natal Personality
→ Structural Role Modifier
→ Current Personality
```

최종 목표는:

```text
READY_FOR_PERSONALITY_RENDERER
```

또는:

```text
P2G_FIX_REQUIRED
```

판정이다.

---

# 2. 기준 문서

최우선:

```text
src/docs/rules/master/11-personality-master.md
src/docs/rules/master/12-personality-knowledge-schema.md
```

Knowledge 결과:

```text
src/docs/codex/p2a-ten-god-day-stem-knowledge-build-result.md
src/docs/codex/p2b-day-pillar-60-knowledge-build-result.md
src/docs/codex/p2c-personality-knowledge-integration-audit-result.md
src/docs/codex/p2c-personality-knowledge-fix-result.md
```

Engine 결과:

```text
src/docs/codex/p2d-personality-engine-core-result.md
src/docs/codex/p2e-personality-structural-role-modifier-result.md
src/docs/codex/p2f-current-personality-engine-result.md
```

---

# 3. 감사 범위

전수 확인:

```text
DayStemProfile
TenGodProfile
PositionExpressionRules
DayPillarProfile

PersonalityFact
TenGod occurrence
Prominence evidence
PositionExpression
DayPillarModifier
PersonalityConflict
NatalPersonalityResult

StructuralRolePersonalityModifier

CurrentPersonalityFact
PersonalityScopeExpression
PersonalityEffectHistory
CurrentPersonalityResult
```

---

# 4. Knowledge Layer 완전성

반드시:

```text
DayStem = 10
TenGod = 10
Position = 6
DayPillar = 60
```

각 일간:

```text
DayPillar = 6
```

이어야 한다.

---

# 5. Knowledge → Engine 연결 누락 감사

Knowledge Registry에 존재하는 주요 trait가
Engine에서 전혀 접근 불가능한 구조인지 확인한다.

특히:

```text
DayStem traits
TenGod traits
DayPillar modifiers
Position rules
```

각각 실제 Engine 경로에서 사용 가능해야 한다.

---

# 6. Knowledge 무단 확장 감사

Engine이 Knowledge에 없는 trait를 새로 만들고 있는지 확인한다.

금지:

```text
일반 명리 지식
암묵적 심리 추론
Renderer용 문장 생성
```

으로 새 trait 생성.

Expected:

```text
UNSUPPORTED_ENGINE_TRAIT = 0
```

---

# 7. DayStem base 감사

일간 기본 성격은:

```text
Natal base
```

로 존재해야 한다.

운이나 Role 때문에 삭제되면 FAIL.

---

# 8. DayPillar modifier 감사

DayPillar는 반드시:

```text
additive modifier
```

이어야 한다.

금지:

```text
DayPillar
→ DayStem base overwrite
```

---

# 9. TenGod occurrence 감사

일간 자체 제외.

원국의:

```text
year stem
month stem
hour stem
branches / hidden stems
```

만 실제 TenGod occurrence로 처리하는지 확인.

시각 미정이면 hour 관련 occurrence 0.

---

# 10. PositionExpression 감사

반드시:

```text
Stem
→ outward/social

MonthBranch
→ innate

DayBranch
→ inner/decision

HourBranch
→ private/long-term

YearBranch
→ supporting context
```

계약 유지.

---

# 11. Position이 trait를 덮어쓰지 않는지 감사

위치는:

```text
trait context
```

이지 새로운 trait source가 아니다.

금지:

```text
branch이므로 무조건 신중함
stem이므로 무조건 적극적
```

---

# 12. Prominence 감사

현재 P2-D/P2-F에서:

```text
Prominence = deferred
```

가 기본이다.

다음을 확인한다.

```text
numeric threshold 없음
occurrence count threshold 없음
월지 가중치 점수 없음
role 기반 prominence 승격 없음
luck 기반 prominence 승격 없음
```

---

# 13. Prominence evidence와 level 분리

다음은 가능:

```text
stem_manifested
month_branch
rooted
repeated
```

evidence.

하지만:

```text
evidence count
→ prominent
```

자동 변환 금지.

---

# 14. absent → deficient 감사

TenGod absence만으로:

```text
deficientExpression
```

이 활성화되지 않아야 한다.

Expected:

```text
absence fact만 기록 가능
deficient trait automatic = 0
```

---

# 15. repeated → excessive 감사

같은 TenGod 반복만으로:

```text
excessiveExpression
```

자동 활성화 금지.

---

# 16. productive 자동 활성 감사

TenGod이 존재한다는 이유만으로:

```text
productiveExpression
```

전체가 active가 되지 않아야 한다.

---

# 17. PersonalityConflict 감사

상반된 Fact를 삭제하지 않는다.

최소:

```text
outward vs inner
DayPillar internal conflict
natal vs current
structural role tension
```

등 실제로 발생한 conflict를 coexist/context_split으로 보존.

---

# 18. Conflict overgeneration 검사

단순히 trait 문구가 다르다는 이유로 Conflict를 만들지 않는다.

실제 의미상 상반되거나 source explicit conflict인 경우만 생성.

---

# 19. StructuralRoleModifier 감사

다음 역할:

```text
YongShen
SangShen
Byeong
GuEung
```

이 Personality를 새로 만드는 것이 아니라 기존 Fact를 보정해야 한다.

---

# 20. YongShen 감사

금지:

```text
YongShen = 좋은 성격
YongShen = 가장 강한 성격
YongShen = prominent
```

---

# 21. SangShen 감사

다음 구분 유지:

```text
active SangShen
protective_standby SangShen
```

standby를 항상 active personality modifier로 만들면 FAIL.

---

# 22. Byeong 감사

금지:

```text
Byeong = 나쁜 성격
Byeong = shadow 전체 활성
Byeong = excessive
```

실제 structural path 기반 modifier여야 한다.

---

# 23. ConditionalByeong 감사

ConditionalByeong은:

```text
contextual
```

이어야 한다.

현재 harmful path가 활성화되지 않았는데 confirmed로 나오면 FAIL.

---

# 24. GuEung 감사

반드시:

```text
targetByeongId
```

연결 유지.

GuEung label만으로 generic positive personality 생성 금지.

---

# 25. Role non-exclusive 감사

같은 actor가:

```text
YongShen + Byeong
```

또는:

```text
favorable current + ConditionalByeong
```

일 때 두 역할 모두 보존되어야 한다.

---

# 26. Runtime 상태 감사

Role modifier가 현재 structural state를 정확히 따라야 한다.

```text
active → confirmed
weakened → reduced
stopped → inactive
```

또는 동등 의미.

---

# 27. Natal immutable 감사

Current Personality 계산 후에도:

```text
NatalPersonalityResult
```

deep equality 유지.

운이 Natal 결과를 mutate하면 FAIL.

---

# 28. Luck temporary 감사

운에 들어온 TenGod은:

```text
temporary current expression
```

이어야 한다.

Natal Knowledge 또는 Natal Personality에 영구 추가 금지.

---

# 29. Scope 지원

반드시:

```text
Daewoon
Sewoon
Month
Day
```

모두 현재 표현 계산 가능.

---

# 30. Scope 강도 점수 금지

금지:

```text
Daewoon > Sewoon > Month > Day
```

를 숫자 강도나 절대 덮어쓰기 우선순위로 사용.

Scope 차이는:

```text
기간
origin
current effectiveness
```

로 표현.

---

# 31. inherited current effect 감사

상위 scope effect가 하위 scope에서 계속 유효한 경우:

```text
same effect identity
inherited = true
currentlyEffective = true
```

또는 동등 의미.

새 이벤트 중복 생성 금지.

---

# 32. effect ID 안정성

Daewoon에서 발생한 PersonalityEffect가:

```text
Sewoon
Month
Day
```

로 내려갈 때 origin ID 유지.

---

# 33. expired effect 감사

기간 종료:

```text
currentlyEffective = false
expired = true
```

History 보존.

Current output에서는 제외.

---

# 34. expired effect revival 금지

과거 effect History가 존재한다는 이유로
다음 scope에서 다시 active가 되면 FAIL.

---

# 35. current role lifecycle

운에 따라:

```text
SangShen activation
SangShen weakening
Byeong activation
Byeong relief
YongShen attack/protection
```

이 Current Role Modifier 상태에만 영향을 주는지 확인.

Natal trait 삭제 금지.

---

# 36. SangShen activation 감사

원국:

```text
protective_standby
```

운:

```text
activates_sangshen_function
```

Expected:

```text
current modifier confirmed
```

---

# 37. SangShen weakening 감사

운:

```text
weakens_sangshen
```

Structural state가 stopped면:

```text
modifier inactive
```

Natal PersonalityFact 유지.

---

# 38. ConditionalByeong activation 감사

운:

```text
activates_byeong
```

Expected:

```text
contextual → confirmed
```

단 다른 shadow trait 전체 자동 활성화 금지.

---

# 39. Byeong relief 감사

운:

```text
relieves_byeong
```

Expected:

```text
current modifier reduced/inactive
```

RoleHistory 유지.

---

# 40. Byeong relief expiry 감사

relief source 종료 후
Judgment current snapshot에서 harmful path가 다시 유효하면:

```text
modifier 재평가
```

과거 relief 때문에 영구 inactive 금지.

---

# 41. YongShen attack/protection 감사

다음은 PersonalityFact를 삭제하지 않는다.

```text
attacks_yongshen
protects_yongshen
```

Role modifier current status만 조정.

---

# 42. changes_pattern_mode 감사

PatternMode 변화만으로
새 personality trait를 직접 만들지 않는지 확인.

---

# 43. changes_root_state 감사

Root 변화만으로:

```text
성격 강해짐
자신감 상승
```

같은 새 rule을 만들지 않는지 확인.

---

# 44. changes_capacity 감사

Capacity 변화만으로 Personality trait 생성 금지.

---

# 45. Formation 감사

Formation 변화만으로 Personality trait 생성 금지.

---

# 46. Judgment result consumption 감사

Personality Engine은
Judgment가 만든 결과를 읽어야 한다.

다음 재계산 금지:

```text
PatternContext
YongShen
SangShen
Byeong
GuEung
Runtime
PatternEffectPolicy
ActualStructuralFunction
```

---

# 47. reverse dependency 감사

반드시:

```text
Judgment → Personality import = 0
```

---

# 48. circular dependency 감사

Personality 도입으로 Judgment/Canonical/Personality 간 순환 import가 없어야 한다.

---

# 49. canonical duplication 감사

Personality 내부에:

```text
TenGod 계산
HiddenStem table
DayPillar 계산
```

중복 구현이 없어야 한다.

---

# 50. 戊午 특별감사

반드시:

```text
戊午 dayBranchTenGod = 正印
```

유지.

금지:

```text
偏財 원자료 오표기 기반 personality fact
```

Expected:

```text
0
```

---

# 51. SOURCE_GAP 안전성

현재 Knowledge의 SOURCE_GAP이 존재해도:

```text
crash 없음
fallback 창작 없음
generic filler trait 없음
```

이어야 한다.

---

# 52. SOURCE_CONFLICT 처리

SOURCE_CONFLICT는 debug/audit metadata로만 존재.

고객 personality trait가 되어서는 안 된다.

---

# 53. excludedClaims 감사

다음은 Engine 결과에 다시 유입되면 안 된다.

```text
배우자
연애 결과
결혼 결과
궁합
재물 결과
직업 결과
건강 예측
성별 운명 단정
```

---

# 54. Personality와 Outcome 분리

금지:

```text
경쟁심 활성
→ 경쟁에서 이김

빠른 판단
→ 사업 성공

관계 단절 경향
→ 이혼
```

Personality Fact는 사건 결과가 아니다.

---

# 55. deterministic language 여부

내부 Knowledge에:

```text
반드시 성공
평생 고생
무조건
```

같은 운명 단정이 없어야 한다.

---

# 56. Customer prose 없음

현재 Engine 결과는 구조화 데이터여야 한다.

금지:

```text
당신은 요즘...
당신은 원래...
```

문장 생성.

Renderer 단계가 아니다.

---

# 57. Numeric scoring 전수검사

`src/lib/personality/` 전체 검사.

금지:

```text
score
weight
percent
probability
points
rank
strengthScore
luckWeight
roleWeight
traitWeight
```

성격 강도를 산술 계산하는 코드 0.

false positive는 보고서에 설명.

---

# 58. stable ID 감사

동일 입력이면:

```text
PersonalityFact IDs
RoleModifier IDs
CurrentEffect IDs
Conflict IDs
```

안정적이어야 한다.

---

# 59. stable ordering 감사

Registry/입력 배열 순서를 바꿔도 의미 결과가 동일해야 한다.

출력 순서는 deterministic.

---

# 60. 같은 trait 중복 감사

Natal + Luck + multiple scopes에서 동일 trait 문구가 무한 복제되지 않는지 확인.

가능하면:

```text
same fact
+
multiple evidence/origin contexts
```

구조.

---

# 61. context가 다르면 분리 허용

예:

```text
Natal branch 正官 = inner
Daewoon stem 正官 = outward temporary
```

는 distinct context이므로 별도 expression 허용.

---

# 62. Unknown hour 감사

시각 미정:

```text
hour PersonalityFact = 0
```

운 계산 때문에 hour trait 생성 금지.

---

# 63. snapshot immutability

각 scope:

```text
Natal
Daewoon
Sewoon
Month
Day
```

Personality state가 독립 snapshot인지 확인.

Child 계산이 parent snapshot을 mutate하면 FAIL.

---

# 64. previousEffectHistory 계약

P2-F 보고서에서 독립된 다음 리딩으로 이력을 이어가려면:

```text
previousEffectHistory
```

또는 이전 운 snapshot 입력이 필요하다고 명시했다.

이번 감사에서 다음을 확인한다.

```text
같은 reading chain 내부
→ history 자동 승계

독립된 다음 reading
→ 이전 history를 명시적으로 전달해야 함
```

이 동작이 타입/API에 분명히 드러나는지 확인.

---

# 65. history 선택 입력이면 명확히 보고

`previousEffectHistory`가 optional이면:

```text
없음
→ 현재 상태 계산은 정상
→ 과거 personality event history는 재구성되지 않음
```

을 명확히 해야 한다.

이를 기능 결함으로 숨기지 않는다.

---

# 66. current accuracy와 history continuity 구분

반드시:

```text
현재 성격 계산 정확성
≠
이전 리딩 history 연속성
```

을 분리한다.

현재 state가 history 없이도 정확하다면
history continuity 문제와 혼동하지 않는다.

---

# 67. history가 판정에 영향 주면 안 됨

과거 PersonalityEffectHistory가
현재 structural/personality 결과를 임의로 결정하면 안 된다.

Current state는 현재 scope 근거로 계산.

History는 provenance/audit 목적.

---

# 68. independent read consistency

같은 날짜/같은 chart를:

```text
history 있음
history 없음
```

두 방식으로 계산했을 때
**현재 active Personality 상태는 동일**해야 한다.

차이는 historical event list뿐이어야 한다.

이 테스트는 BLOCKING.

---

# 69. history duplicate audit

이전 History를 입력했을 때
동일 origin effect가 중복 append되지 않는지 확인.

---

# 70. history expiry audit

과거 effect를 넘겼을 때
현재 scope에서 만료되었다면:

```text
expired = true
currentlyEffective = false
```

유지.

다시 current로 살아나면 FAIL.

---

# 71. Natal result independent history

NatalPersonalityResult는 previousEffectHistory 유무와 무관하게 동일해야 한다.

---

# 72. Known-hour / unknown-hour 두 축

가능하면 같은 명식에 대해:

```text
known hour
unknown hour
```

fixture 비교.

Unknown hour는 hour-derived fact만 빠지고
나머지 base가 변형되지 않아야 한다.

---

# 73. 전체 fixture coverage

최소 다음 유형 포함 여부 확인.

```text
일반 명식
DayPillar internal conflict
동일 TenGod 반복
No-Byeong
Active Byeong
ConditionalByeong
GuEung
Protective Standby SangShen
stopped Role
weakened Role
Luck manifestation
Luck expiry
unknown hour
戊午
```

---

# 74. P2-A 검증

실행:

```text
node scripts/verify-personality-knowledge-p2a.mjs
```

---

# 75. P2-B 검증

실행:

```text
node scripts/verify-personality-knowledge-p2b.mjs
```

---

# 76. P2-C 검증

실행:

```text
node scripts/verify-personality-knowledge-integration-p2c.mjs
```

---

# 77. P2-D 검증

실행:

```text
scripts/verify-personality-engine-p2d.mjs
```

실제 명령 방식에 맞춰 실행.

---

# 78. P2-E 검증

실행:

```text
scripts/verify-personality-role-modifier-p2e.mjs
```

---

# 79. P2-F 검증

실행:

```text
scripts/verify-current-personality-p2f.mjs
```

---

# 80. Judgment 전체 회귀

현재 프로젝트의 Judgment 회귀 전체 실행.

기존 결과:

```text
35/35
```

유지 확인.

---

# 81. TypeScript / Build

```text
npx tsc -b
npm run build
```

PASS.

---

# 82. P2-G audit script

권장:

```text
scripts/verify-personality-engine-integration-p2g.mjs
```

---

# 83. P2-G BLOCKING 테스트

최소:

```text
A. Knowledge → Natal
B. DayPillar additive
C. Position context
D. Conflict coexistence
E. Role modifier additive
F. Role non-exclusive
G. Natal immutable
H. Luck temporary
I. inherited effect identity
J. effect expiry
K. history/current separation
L. independent reading history consistency
M. unknown hour
N. 戊午 canonical
O. no scoring
P. no reverse dependency
```

---

# 84. 수정 원칙

이번 단계는 감사가 우선이다.

FAIL이 발견되면:

```text
문제
근거
영향
최소 수정 위치
```

를 먼저 확인한다.

테스트를 통과시키기 위해 기존 계약을 완화하지 않는다.

---

# 85. Knowledge source 수정 금지

이번 감사 중:

```text
십성.md
일주풀이.md
```

원자료 수정 금지.

---

# 86. Knowledge Registry 임의 확장 금지

현재 gap을 메우기 위해 trait 추가 금지.

---

# 87. Judgment 변경 금지

Personality 테스트를 위해 Judgment 결과를 수정하지 않는다.

---

# 88. 최종 결과 파일

```text
src/docs/codex/p2g-personality-engine-final-integration-audit-result.md
```

---

# 89. 최종 보고 형식

## A. 전체 판정

```text
READY_FOR_PERSONALITY_RENDERER
```

또는:

```text
P2G_FIX_REQUIRED
```

---

## B. Layer Audit

| Layer | 상태 | 핵심 문제 |
|---|---|---|
| Knowledge | | |
| Natal | | |
| Position | | |
| DayPillar | | |
| Conflict | | |
| StructuralRole | | |
| Current | | |
| History | | |

---

## C. Data integrity

```text
DayStem:
TenGod:
Position:
DayPillar:

unsupported traits:
missing extraction:
source conflicts:
```

---

## D. Engine integrity

```text
Natal mutation:
duplicate facts:
duplicate effects:
expired active effects:
role mismatch:
```

---

## E. History

```text
same-chain inheritance:
independent read with history:
independent read without history:
current state consistency:
duplicate history:
expiry correctness:
```

---

## F. Prominence

```text
Prominence changed:
numeric resolver:
status:
```

Expected:

```text
changed = no
numeric resolver = no
status = deferred
```

---

## G. Reverse dependency

```text
Judgment → Personality imports:
Personality → Judgment read-only dependency:
circular imports:
```

---

## H. Regression

```text
P2-A:
P2-B:
P2-C:
P2-D:
P2-E:
P2-F:
P2-G:

Judgment:
tsc:
build:
```

---

## I. 남은 항목

```text
FAIL:
PARTIAL:
DEFERRED:
NOT_IMPLEMENTED:
```

DEFERRED는 Prominence 등 이미 승인된 항목만 허용.

---

# 90. 최종 종료 조건

다음이면:

```text
READY_FOR_PERSONALITY_RENDERER
```

판정한다.

필수:

```text
FAIL = 0
NOT_IMPLEMENTED = 0
```

허용되는 DEFERRED:

```text
Prominence deterministic boundary
기존 source gap
기존 戊午 source conflict provenance
```

단 다음은 허용되지 않는다.

```text
Natal mutation
Luck effect expiry 오류
History/current 혼동
Role modifier 오류
Knowledge 밖 trait 생성
numeric scoring
reverse dependency
```

---

# 91. 다음 단계

P2-G에서:

```text
READY_FOR_PERSONALITY_RENDERER
```

가 확인된 후에만
고객용 Personality Renderer를 설계한다.

Renderer는 별도 단계에서:

```text
Internal Personality Result
→ customer-safe wording
```

으로 변환한다.

Renderer가 판정을 새로 계산하거나
성격 의미를 추가해서는 안 된다.