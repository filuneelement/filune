# P2-C Personality Knowledge Layer 통합 감사

## 판정

**NOT_READY_FOR_PERSONALITY_ENGINE**

완전성, Canonical 대조, 금지 표현 검사 및 구조 엔진 격리는 통과했다. 원자료 대조에서 추출 누락 7건과 근거 불충분 4건이 확인되어 준비 조건을 충족하지 못했다. 이번 작업은 공통 타입과 네 Registry를 대상으로 한 감사다. 원자료, Registry 데이터 및 기존 계산은 변경하지 않았다.

[11번 마스터](../rules/master/11-personality-master.md) · [12번 스키마](../rules/master/12-personality-knowledge-schema.md) · [P2-C 검증](../../../scripts/verify-personality-knowledge-integration-p2c.mjs)

## Coverage

Traits는 Variant와 내적 충돌을 각각 항목당 1개로 계산했다. Evidence는 sourceRef를 가진 레코드 수다. 일주 도입부의 메타데이터 근거를 포함하며 보강 참조와 Variant의 자체 출처는 별도 합산하지 않았다. Gap은 Registry에 저장된 빈 필드 수다.

### DayStem

| DayStem | Traits | Evidence | Gap | Unsupported |
|---|---:|---:|---:|---:|
| 甲 | 5 | 2 | 4 | 0 |
| 乙 | 4 | 1 | 5 | 0 |
| 丙 | 5 | 1 | 4 | 0 |
| 丁 | 5 | 1 | 4 | 0 |
| 戊 | 4 | 1 | 5 | 0 |
| 己 | 7 | 2 | 2 | 0 |
| 庚 | 5 | 2 | 4 | 0 |
| 辛 | 7 | 2 | 2 | 0 |
| 壬 | 4 | 1 | 5 | 1 |
| 癸 | 4 | 1 | 5 | 0 |

### TenGod

| TenGod | Traits | Evidence | Gap | Unsupported |
|---|---:|---:|---:|---:|
| 比肩 | 20 | 8 | 2 | 0 |
| 劫財 | 22 | 9 | 3 | 0 |
| 食神 | 24 | 8 | 3 | 0 |
| 傷官 | 32 | 10 | 2 | 0 |
| 偏財 | 24 | 8 | 3 | 0 |
| 正財 | 29 | 9 | 2 | 0 |
| 偏官 | 28 | 11 | 2 | 0 |
| 正官 | 26 | 9 | 2 | 0 |
| 偏印 | 21 | 6 | 4 | 0 |
| 正印 | 35 | 9 | 3 | 0 |

### DayPillar

| Stem | Pillars | Traits | Evidence | Gaps | 내적 충돌 |
|---|---:|---:|---:|---:|---:|
| 甲 | 6/6 | 16 | 22 | 38 | 1 |
| 乙 | 6/6 | 15 | 21 | 39 | 1 |
| 丙 | 6/6 | 15 | 21 | 39 | 1 |
| 丁 | 6/6 | 13 | 19 | 41 | 1 |
| 戊 | 6/6 | 17 | 23 | 37 | 2 |
| 己 | 6/6 | 14 | 20 | 40 | 0 |
| 庚 | 6/6 | 16 | 22 | 38 | 1 |
| 辛 | 6/6 | 14 | 20 | 40 | 1 |
| 壬 | 6/6 | 13 | 19 | 41 | 1 |
| 癸 | 6/6 | 13 | 19 | 41 | 1 |

### PositionExpressionRules

6/6. 발현 영역과 해석 규칙 25개, 근거 레코드 6개, 빈 필드 1개다. 년지 고유 발현은 P2-A의 범위대로 원자료와 마스터의 지지 일반 원칙까지만 적용했다. 스키마 §19에는 향후 세부 역할을 위한 근거가 있다.

## 내용 및 입력 계약

- **일간과 일주.** 일간 10개에서 반복 문단 여섯 곳씩을 확인했다. 甲의 두 보강 근거는 일간 자체를 명시한다. 일주 성향은 각각 번호 구간의 개별 해설에서 가져왔다. 도입부, 공통 일간 문단, 배우자 요약 및 반복된 일지 예시는 성향 근거에서 제외됐다.
- **중복.** 불필요한 공통 일간 복제와 십성 프로필 전체 복제는 0건이다. 甲申의 자기 뜻 유지와 丙辰의 열정은 각각 갈등에 직접 부딪히는 방식과 냉정함과의 공존을 설명하는 allowed_with_reason이다. 辛巳의 정직·성실 성향은 辛의 예민한 기준과 결합한 설명이 있어 allowed_source_explicit이다. 문자열 검사는 동일·포함·유사도를 확인하고 의미 판단은 원자료 대조로 보완했다. [甲申](../source/personality/일주풀이.md#L1526-L1532) · [丙辰](../source/personality/일주풀이.md#L3745-L3753) · [辛巳](../source/personality/일주풀이.md#L1322-L1325)
- **위치와 십성.** 위치 규칙의 개별 프로필 하드코딩 0건이다. 생산적·일반·과다·부재·맥락별 발현을 구분한다. 길신·흉신을 성격의 좋고 나쁨으로 사용한 항목은 0건이다. 正偏 다섯 쌍은 핵심축과 발현 구성이 다르다.
- **제외 항목과 문체.** 배우자·결혼·연애 결과, 궁합, 재물·직업·건강·운명 결과와 성별 단정, 고객용·결정론적 표현 0건이다. 관계 태도와 업무 방식은 허용 범위에 있다. 제외 claim은 감사 메타데이터로 보관한다.
- **출처와 규칙.** 값이 있는 성향 필드의 출처 누락 0건이다. 甲子 branchNature의 겨울 이미지는 82행, 정적 이미지와 제동은 현재 연결된 47–48행에서 확인한다. 겨울 이미지를 직접 탐색할 수 있게 보강 참조를 연결할 정밀도 이슈가 있다. 핵심 성향에서 filune_interpretation은 0개다. 그 표기는 P2-A 비핵심 성장 방향 근거 3개와 위치 규칙 근거 6개에 있다. P2-B에서는 0개다. [甲子 결합 소개](../source/personality/일주풀이.md#L82)
- **성장 방향.** 저장된 己·庚·辛과 庚寅·庚戌 성장 방향 5개는 성향 사실과 직접 연결된 조언을 확인했다. 癸卯의 같은 유형 근거는 추출 누락으로 기록했다.
- **스키마.** 네 Registry 모두 PersonalityEvidence를 공유하며 Variant는 별도 출처를 가진다. 일간 기질, 십성 성향, 위치 발현, 일주 결합 보정을 각 키로 조회할 수 있고 빈 배열과 source_gap은 유효한 입력이다. DayPillar 타입은 간지의 형태를 보장하고 실제 60갑자 소속은 레지스트리 검증이 보장한다. pillar와 shadowPatterns는 이전 단계의 스키마 동등 필드다.
- **격리.** 구조 관련 102개 파일에서 Personality로 이어지는 정적 의존성 경로 0건, Personality 5개 파일을 경유하는 순환 0건이다. 印綬 → 正印은 Personality 경계에서만 매핑한다. 기존 TenGod 및 Canonical 계산은 그대로다.

### P2-B source_synthesis 27건 대조

내적 충돌 10개는 원문에서 서로 다른 반응이나 동기를 함께 설명하는 구절을 확인했다.

| 일주 | 필드 | 원자료 줄 | 판정 |
|---|---|---:|---|
| 甲子 | corePersonality | [44-49](../source/personality/일주풀이.md#L44-L49) | 지원 확인 |
| 甲子 | internalConflict | [44-49](../source/personality/일주풀이.md#L44-L49) | 지원 확인 |
| 己巳 | expressionPattern | [544-548](../source/personality/일주풀이.md#L544-L548) | 지원 확인 |
| 庚午 | internalConflict | [635-637](../source/personality/일주풀이.md#L635-L637) | 지원 확인 |
| 丙子 | corePersonality | [992-993](../source/personality/일주풀이.md#L992-L993) | 지원 확인 |
| 丙子 | internalConflict | [991-993](../source/personality/일주풀이.md#L991-L993) | 지원 확인 |
| 戊寅 | internalConflict | [1105-1112](../source/personality/일주풀이.md#L1105-L1112) | 지원 확인 |
| 丙戌 | expressionPattern | [1665-1667](../source/personality/일주풀이.md#L1665-L1667) | 지원 확인 |
| 丁亥 | internalConflict | [1721-1732](../source/personality/일주풀이.md#L1721-L1732) | 지원 확인 |
| 庚寅 | growthDirection | [1939-1945](../source/personality/일주풀이.md#L1939-L1945) | 지원 확인 |
| 癸巳 | expressionPattern | [2153-2160](../source/personality/일주풀이.md#L2153-L2160) | 부분 근거 불충분 |
| 己亥 | expressionPattern | [2617-2621](../source/personality/일주풀이.md#L2617-L2621) | 지원 확인 |
| 庚子 | expressionPattern | [2707-2710](../source/personality/일주풀이.md#L2707-L2710) | 지원 확인 |
| 丙午 | corePersonality | [3079-3085](../source/personality/일주풀이.md#L3079-L3085) | 지원 확인 |
| 庚戌 | growthDirection | [3352-3354](../source/personality/일주풀이.md#L3352-L3354) | 지원 확인 |
| 辛亥 | expressionPattern | [3417-3423](../source/personality/일주풀이.md#L3417-L3423) | 지원 확인 |
| 辛亥 | internalConflict | [3417-3423](../source/personality/일주풀이.md#L3417-L3423) | 지원 확인 |
| 壬子 | expressionPattern | [3472-3476](../source/personality/일주풀이.md#L3472-L3476) | 지원 확인 |
| 癸丑 | expressionPattern | [3537-3541](../source/personality/일주풀이.md#L3537-L3541) | 지원 확인 |
| 乙卯 | internalConflict | [3688-3692](../source/personality/일주풀이.md#L3688-L3692) | 지원 확인 |
| 丙辰 | expressionPattern | [3745-3753](../source/personality/일주풀이.md#L3745-L3753) | 지원 확인 |
| 戊午 | expressionPattern | [3860-3862](../source/personality/일주풀이.md#L3860-L3862) | 지원 확인 |
| 戊午 | internalConflict | [3860-3866](../source/personality/일주풀이.md#L3860-L3866) | 지원 확인 |
| 己未 | expressionPattern | [3896-3900](../source/personality/일주풀이.md#L3896-L3900) | 지원 확인 |
| 壬戌 | internalConflict | [4087-4095](../source/personality/일주풀이.md#L4087-L4095) | 지원 확인 |
| 癸亥 | expressionPattern | [4125-4134](../source/personality/일주풀이.md#L4125-L4134) | 지원 확인 |
| 癸亥 | internalConflict | [4125-4135](../source/personality/일주풀이.md#L4125-L4135) | 지원 확인 |

## 차단 항목

기존 SOURCE_GAP 표시 461필드 가운데 아래 7필드는 원자료에서 해당 성향을 확인하여 MISSING_EXTRACTION으로 판정했다. 나머지 454필드는 이번 감사에서 확정된 추출 누락으로 분류하지 않았다. UNSUPPORTED_TRAIT는 저장 문구의 전부 또는 일부가 원자료에서 뒷받침되지 않는 경우다.

### MISSING_EXTRACTION · 7건

| 프로필 | 필드 | 감사 소견 |
|---|---|---|
| 丁 | stressResponse | 속상한 사건이 생겼을 때 말을 아끼는 반응이 반복 문단에 명시된다. 현재 필드에는 사건과 반응의 연결이 없다. [원자료 L436](../source/personality/일주풀이.md#L436) |
| 偏印 | socialExpression | 편인이 강할 때 집단에 섞이기 어렵다는 사회적 발현이 본문에 있다. [원자료 L850-L853](../source/personality/십성.md#L850-L853) |
| 正印 | relationshipStyle | 과다 맥락에서 관계가 원만해 보이더라도 주위와 거리감을 느낄 수 있다고 명시한다. [원자료 L322-L329](../source/personality/십성.md#L322-L329) |
| 戊辰 | strengths | 융통성을 갖춘 상태에서도 유지되는 꼼꼼함과 책임감을 별도 강점으로 설명한다. [원자료 L493-L499](../source/personality/일주풀이.md#L493-L499) |
| 庚子 | decisionStyle | 스스로 미룰 만하다고 판단한 일을 자기 마감 기준에 맞춰 처리하는 판단 패턴이 있다. [원자료 L2698-L2700](../source/personality/일주풀이.md#L2698-L2700) |
| 辛丑 | decisionStyle | 신중하게 움직이며 최소한의 행동으로 효율을 높이려 한다는 판단 기준이 있다. [원자료 L2764-L2768](../source/personality/일주풀이.md#L2764-L2768) |
| 癸卯 | growthDirection | 낯선 과제에서 집중력이 급히 떨어진다는 사실과, 과거 경험을 새 과제의 적응에 활용하라는 조언이 이어진다. [원자료 L2895-L2905](../source/personality/일주풀이.md#L2895-L2905) |

### UNSUPPORTED_TRAIT · 4건

| 프로필 | 필드 | 감사 소견 |
|---|---|---|
| 壬 | coreDrive | 반복 문단은 한곳에서 느끼는 답답함과 이동 후 얻은 지식을 말한다. 새 경험을 얻으려고 이동한다는 동기는 제시하지 않는다. [원자료 L811-L812](../source/personality/일주풀이.md#L811-L812) |
| 癸巳 | expressionPattern | 2158행은 부드러운 외관과 냉정한 실속 판단을 지지한다. 2153–2155행의 빠른 실행을 이 내면 판단의 속도로 옮길 결합 근거가 없다. [원자료 L2153-L2160](../source/personality/일주풀이.md#L2153-L2160) |
| 丙辰 | branchNature | 진토의 이중성과 변동성은 명시되지만, 지지 자체의 온도 변화는 명시되지 않는다. [원자료 L3752-L3754](../source/personality/일주풀이.md#L3752-L3754) |
| 己酉 | strengths | 배움·분석·미래지향성은 명시된다. 배운 것을 계획에 적용하려는 과정은 인용 범위에 없다. [원자료 L3297-L3299](../source/personality/일주풀이.md#L3297-L3299) |

## 戊午 SOURCE_CONFLICT

| 항목 | 대상과 결과 |
|---|---|
| Source text | 3837행의 합·연애 설명은 일지에 偏財를 표기한다. 3883행 도입부와 3888행 본기 설명은 正印이다. |
| Canonical | 午 본기 丁에 대한 戊의 십성은 印綬다. |
| Registry | Personality 매핑 결과는 正印이다. 일지 십성과 십이운성은 각각 60/60 기존 계산과 일치한다. |
| Personality trait impact | 성향 근거 3860–3866행은 평온한 표현과 내면의 힘, 발산·절제에 관한 서술이다. 편재 표기는 근거 범위 밖에 있다. |
| Resolution | canonical retained, source conflict preserved. P2-B 보고서와 검증에 기록이 남아 있으며 P2-C도 해당 원자료 줄을 확인한다. |

[표기 차이](../source/personality/일주풀이.md#L3837) · [도입부 및 본기](../source/personality/일주풀이.md#L3883-L3888) · [성향 근거](../source/personality/일주풀이.md#L3860-L3866)

## 검증과 종료 상태

| 검증 | 결과 |
|---|---|
| P2-A 검증 | PASS |
| P2-B 검증 | PASS |
| P2-C 검증 | FAIL. 자동 구조·출처·격리 검사를 통과했으며 편집 감사 차단 항목 11건을 재현해 종료 코드 1을 반환했다. |
| npx tsc -b | PASS |
| npm run build | PASS |

스크립트는 편집 감사에서 확인한 사례가 현재 Registry에 남아 있는지 재현한다. 출처의 의미와 정규화 문구가 일치하는지는 사람이 대조한 감사 결과다.

| 상태 | 결과 |
|---|---|
| FAIL | 엔진 준비 판정 1개 실패 |
| PARTIAL | 0 |
| SOURCE_GAP | 기존 표시 461필드. 그중 7필드는 추출 누락으로 별도 판정 |
| SOURCE_CONFLICT | 戊午 1건. Canonical과 원자료 표기 차이 보존 |
| MISSING_EXTRACTION | 7건 |
| UNSUPPORTED_TRAIT | 4건 |
| NOT_IMPLEMENTED | Personality Engine, Prominence, 점수, 구조·운 보정, Renderer |

Judgment 및 Canonical 소스 변경은 0건이다. Personality Engine 설계 시작 조건은 보류한다.
