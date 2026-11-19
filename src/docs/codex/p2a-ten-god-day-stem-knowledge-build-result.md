# P2-A 십성·일간 Personality Knowledge 감사 결과

## A. 구현 결과

- 일간 10/10, 십성 10/10, 위치 6/6
- 위치 6개는 천간·지지 공통과 월지·일지·시지·년지다. 년지는 11번 마스터 §9와 12번 스키마 §19에 근거해 지지의 보조 맥락으로 기록했다. 년지 고유 성향은 `source_gap`이다.
- 기존 `TenGod`의 `印綬`는 레지스트리의 `正印`에 매핑했다. 다른 9개 표기는 동일하다.
- 각 원자료 참조는 저장소 상대 경로와 줄 범위를 사용한다. 실근거 수는 `sourceRef`가 있는 evidence 항목 수다. 보강 참조와 Variant는 별도이며, gap 수는 빈 필드 수다.
- 일간별 6개 일주에서 해당 일간의 기질 제목과 바로 아래 문단이 동일함을 확인했다. 동일 문단은 한 번 정규화하고 여섯 위치를 모두 참조했다. 甲의 시작·앞서감은 일간을 명시한 두 구절에서 추가했다. 己·庚·辛의 성장 방향은 반복 문단에 성격 사실과 조언이 함께 있을 때만 분류했다.

## B. 파일

| 파일 | 역할 |
|---|---|
| [types.ts](../../lib/personality/types.ts) | 스키마와 기존 십성 식별자 대응 |
| [dayStemProfiles.ts](../../lib/personality/knowledge/dayStemProfiles.ts) | 일간별 공통 기질 및 출처 |
| [tenGodProfiles.ts](../../lib/personality/knowledge/tenGodProfiles.ts) | 십성별 발현, 변이 및 출처 |
| [positionRules.ts](../../lib/personality/knowledge/positionRules.ts) | 위치별 발현 맥락과 기준 |
| [verify-personality-knowledge-p2a.mjs](../../../scripts/verify-personality-knowledge-p2a.mjs) | 레지스트리 완전성·중복·금지 표현·출처 검사 |

## C. 십성 Coverage

| 십성 | 상태 | coreDrive | productive | excessive | deficient | variants | evidence | source gap |
|---|---|---|---:|---:|---:|---:|---:|---|
| 比肩 | 등록 | 주체성 · 독립성 | 2 | 2 | 3 | 2 | 8 | socialExpression, stressResponse |
| 劫財 | 등록 | 모험성 · 경쟁성 | 2 | 2 | 2 | 2 | 9 | socialExpression, decisionStyle, stressResponse |
| 食神 | 등록 | 창조성 · 연구·탐구 | 3 | 4 | 3 | 2 | 8 | innerExpression, decisionStyle, stressResponse |
| 傷官 | 등록 | 혁신성 · 응용성 | 4 | 4 | 0 | 5 | 10 | deficientExpression, decisionStyle |
| 偏財 | 등록 | 과감성 · 통제성 | 3 | 3 | 0 | 2 | 8 | deficientExpression, relationshipStyle, stressResponse |
| 正財 | 등록 | 치밀성 · 정확성 | 3 | 3 | 3 | 3 | 9 | innerExpression, stressResponse |
| 偏官 | 등록 | 권력성 · 극기성 | 3 | 2 | 0 | 2 | 11 | deficientExpression, stressResponse |
| 正官 | 등록 | 명예성 · 합리성 | 3 | 5 | 3 | 2 | 9 | relationshipStyle, stressResponse |
| 偏印 | 등록 | 신비성 · 영감성 | 3 | 2 | 0 | 2 | 6 | deficientExpression, socialExpression, relationshipStyle, stressResponse |
| 正印 | 등록 | 교육성 · 자비성 | 5 | 7 | 4 | 5 | 9 | innerExpression, relationshipStyle, stressResponse |

과다·부재 표 칸이 비어 있는 경우 본문을 확인했다. 예를 들어 劫財는 양쪽 근거를 본문에서 보완했고, 傷官·偏財·偏官·偏印의 부재 성향은 공백으로 유지했다. 正財 표에 부재와 과다 모두에서 현실 감각 저하가 등장해 각각 보존했다. 傷官의 배려와 무관심, 食神의 임기응변과 과다 시 변화 회피 역시 별도 변이로 기록했다.

## D. 일간 Coverage

| 일간 | 상태 | coreNature | strengths | shadow | decision | evidence | source gap |
|---|---|---:|---:|---:|---:|---:|---|
| 甲 | 등록 | 1 | 1 | 1 | 1 | 2 | socialExpression, innerExpression, stressResponse, growthDirection |
| 乙 | 등록 | 1 | 1 | 0 | 1 | 1 | coreDrive, shadowTraits, innerExpression, stressResponse, growthDirection |
| 丙 | 등록 | 1 | 1 | 1 | 0 | 1 | coreDrive, decisionStyle, innerExpression, growthDirection |
| 丁 | 등록 | 1 | 0 | 1 | 0 | 1 | strengths, decisionStyle, stressResponse, growthDirection |
| 戊 | 등록 | 1 | 1 | 1 | 1 | 1 | coreDrive, socialExpression, innerExpression, stressResponse, growthDirection |
| 己 | 등록 | 1 | 1 | 1 | 1 | 2 | coreDrive, socialExpression |
| 庚 | 등록 | 1 | 1 | 1 | 0 | 2 | coreDrive, decisionStyle, innerExpression, stressResponse |
| 辛 | 등록 | 1 | 1 | 1 | 1 | 2 | coreDrive, stressResponse |
| 壬 | 등록 | 1 | 1 | 1 | 0 | 1 | decisionStyle, socialExpression, innerExpression, stressResponse, growthDirection |
| 癸 | 등록 | 1 | 1 | 0 | 0 | 1 | coreDrive, shadowTraits, decisionStyle, stressResponse, growthDirection |

## E. 제외된 자료

두 원자료에서 아래 표지에 해당하는 줄을 유형별로 집계했다. 한 줄에 같은 유형이 여럿 있어도 1건이며, 다른 유형과는 중복 집계한다. 제목, 설명, 인용, 반박을 포함하는 원자료 표지 집계이며 문장별 예측 명제의 전수 집계는 아니다. 표지 밖에 있는 일주 결합과 기타 예측도 프로필의 추출 근거에서 제외했다. 성향과 제외 대상이 같은 줄에 있으면 독립적으로 뒷받침되는 성향만 추출했다.

| 유형 | 십성 | 일주풀이 | 합계 | 표지 정규식 |
|---|---:|---:|---:|---|
| `relationship_prediction` | 8 | 164 | 172 | `배우자 자리\(일지\)\|배우자궁\|배우자\s*(복\|덕\|인연)\|남편\s*(복\|덕)\|아내\s*(복\|덕)\|이혼수\|외도운\|연애운\|결혼운` |
| `gender_determinism` | 14 | 116 | 130 | `(?:남자\|여자\|남성\|여성)(?:의 경우\|라면\|는\s)\|남성적\|여성적\|남자 같은 면모\|여성스러운 면모` |
| `wealth_prediction` | 13 | 6 | 19 | `재물운\|횡재수\|재물복\|재복\|금전운\|부자가 (?:될\|된\|되는)\|돈을 (?:잘\|많이) (?:벌\|번)` |
| `career_prediction` | 7 | 0 | 7 | `직업운\|(?:직업\|직종\|분야\|업종)(?:이\|에\|과)?\s*(?:잘 어울\|적합\|알맞)\|승진운\|사업(?:에\|으로) 성공\|공무원(?:이\|에) (?:적합\|잘 맞)` |
| `health_prediction` | 1 | 1 | 2 | `질병\|수명\|건강운\|병에 걸\|사고를?\s*(?:당\|조심)\|병이나 사고\|술을 (?:피\|멀리)\|과음을 (?:피\|조심)` |
| `compatibility_prediction` | 1 | 62 | 63 | `궁합` |
| `non_personality_claim` | 18 | 197 | 215 | `십이운성\|12운성\|지장간\|배우자 자리\(일지\)\|^(?:남성 육친\|십신이름\s+일간과의 관계)\|길신\|흉신\|평생 고생\|운명적\|말년엔 반드시` |

- 남·여 육친 대응 10행은 별도 제외했다. 전통적 길신·흉신 구분은 성격 발현 필드로 옮기지 않았다.
- 겁재·양인·건록 비교는 서로 다른 개념임을 확인하는 근거로 사용했다. 양인 기질을 별도 십성으로 등록하지 않았다.
- 후속 검토 후보는 일간 왕·약의 맥락(십성 원자료 1508–1514행)과 성별을 제거한 음양 편중(1525–1526행)이다.
- 60개 공통 기질 문단 다음의 일지 결합 문단과 뒤따르는 일지 십성·십이운성·배우자 설명은 공통 일간 근거에서 제외했다. 예를 들어 丙子의 긴장은 공통 기질로 올리지 않았다.

## F. 검증

| 명령 | 결과 |
|---|---|
| `npx tsc -b` | PASS |
| `npm run build` | PASS |
| `node scripts/verify-personality-knowledge-p2a.mjs` | PASS |

중복 키·십성 성향 묶음 복제·필수 식별자 누락·금지 필드와 성향 표현·근거 누락 모두 0건. 기존 Structural Engine과 Judgment 소스에는 변경이 없어 Judgment 회귀 전체 실행 조건에 해당하지 않았다.

## G. 남은 항목

- **FAIL** 0
- **PARTIAL** 0
- **SOURCE_GAP** 일간 40개, 십성 26개, 위치 1개 필드
- **NOT_IMPLEMENTED** 60일주 Profile, Personality Engine 및 결과 계산, 십성 우선순위·Prominence, 구조 역할·운 보정, 고객용 렌더링, 음양 편중 레지스트리.
