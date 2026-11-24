# FILUNE P4-E Behavior & Relationship Pattern Source Expansion

## 1. Source audit summary

저장소 원문에서 행동 후보 14개와 관계 후보 14개를 추출했다. 행동에서는 신미의 사전 포기와 을미의 만족 기준 상향에 되먹임 단서가 있다. 관계에서는 접근과 내면 개방, 신뢰 축적, 동등한 의견 교환, 기준 초과 뒤 경계 설정의 근거를 찾았다. 관계 갈등의 재발을 입증하는 후보는 확보하지 못했다.

| 범위 | APPROVED | CONDITIONAL | CASE_ONLY | SOURCE_GAP | REJECTED |
| --- | ---: | ---: | ---: | ---: | ---: |
| 행동 | 4 | 6 | 1 | 2 | 1 |
| 관계 | 3 | 6 | 2 | 2 | 1 |

APPROVED는 명시된 범위의 출처 판단이다. 예를 들어 재점검 행동과 바깥·안쪽 맥락 대비는 승인 범위에 들지만 그 승인으로 결과나 재발이 생기지는 않는다. 신규 후보의 실행 권한은 source rule, typed semantic, 양성·반례 fixture, provenance, Assembly integration이 모두 검증될 때 검토한다.

### 읽은 자료와 추출 경계

- 일주 원문에서 판단·갈등·표현·그림자·대인 관계를 재검토했다. PK-040/041의 `decisionStyle`, `internalConflict`, `expressionPattern`, `shadowPatterns`, `characteristicExpression`과 현재 코드의 `interpersonalStyle`에 대응시켰다. 일주는 인과가 명시된 성향 보정으로만 쓴다. [일주풀이](../source/personality/일주풀이.md) · [PK-040/041](../rules/master/12-personality-knowledge-schema.md#20-daypillarpersonalityprofile)
- 십성 원문에서 규칙·표현·실리·인정·역할·경쟁·관계를 분리했다. PK-020/021의 보통·과다·조건부 발현과 PK-070의 prominence를 대조했다. 출현·우세·과다는 서로 다른 증거 상태다. [십성](../source/personality/십성.md) · [PK-020](../rules/master/12-personality-knowledge-schema.md#6-tengodpersonalityprofile)
- 07의 빠른 모방 사례와 관계 갈등 사례를 조회했다. 평가받는 특정 원국, 운, 당시 사정을 보존하는 대조 자료다. 17의 CL-R01~03에 해당하는 구조적 접점·형성·압박은 독립 층에 머문다. [사주풀이예시](../source/primary/07-사주풀이예시.md) · [원인 대응](../rules/master/17-cause-to-life-mapping.md)
- PK-030 위치 규칙은 천간의 외부 표출, 월지의 기본 기질, 일지의 가까운 관계, 시지의 안쪽 반응을 비교하는 근거를 제공한다. 각 위치의 유효한 Fact를 연결해야 하며 맥락 대비만으로 시간 순서나 반복을 만들 수 없다. 11의 바깥 傷官과 안쪽 印의 예가 그 경계에 해당한다. [성격 마스터](../rules/master/11-personality-master.md#29-겉과-속의-차이를-적극적으로-표현) · [위치 규칙](../rules/master/12-personality-knowledge-schema.md#13-positionexpressionrule)
- DayPillar Conflict는 두 성향과 결과가 같은 출처에 묶인 경우 유용하다. Position Conflict의 `context_split`은 발현 맥락의 대비까지 지지한다. Structural Role Conflict는 역할의 공존이나 조건 갈림을 전달하며 실제 대화와 후속 행동의 관측 근거로 쓰려면 별도 원문 연결이 필요하다. [Conflict 계약](../rules/master/12-personality-knowledge-schema.md#42-personalityconflict) · [현행 갈등 producer](../../lib/personality/conflicts/personalityConflicts.ts)
- 18은 CR-03에 독립 고리 두 개, CR-05에 관계의 반복 기제와 구조·시기의 구분을 요구한다. 19의 미지원 역할 생략과 20의 GOOD SAMPLE은 조립 기준과 예시로 읽었다. 예시 자체는 source authority가 아니다. [장 계약](../rules/master/18-customer-chapter-content-contract.md) · [전개 계약](../rules/master/19-reading-narrative-blueprint.md) · [품질 레퍼런스](../rules/master/20-reading-renderer-quality-reference.md)

분류 필드는 복수다. `SOURCE_EXPLICIT`은 행에 명시한 좁은 주장, `CASE_ONLY`는 사례·예시 수준, `GENERALIZABLE_CANDIDATE`는 추가 검증 가치, `COUNTEREXAMPLE_PRESENT`는 역조건 또는 성립하지 않는 경로가 있는 상태다. `FILUNE_INFERENCE`는 후보 이름에 담긴 추론이 원문에 끝까지 연결되지 않았다는 표시다. `REJECTED` 행에서 이를 명시한다. 빈 칸은 해당 후보에서 확보하지 못한 단계다.

## 2. Behavior Pattern rules

### B01 · `hesitation_after_initial_intent`

**APPROVED** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L44-L49](../source/personality/일주풀이.md#L44-L49) · [일주풀이 L90-L97](../source/personality/일주풀이.md#L90-L97) |
| 관찰 의미 | 착수 의욕과 재확인이 한 갈등 안에서 맞물림 |
| 촉발 | 하고 싶은 일을 앞둠 |
| 내부 반응 | 움직여도 되는지 걱정 |
| 판단·해석 | 착수 여부를 재확인 |
| 행동·소통·경계 | 검토를 이어감 |
| 결과 | 착수 지연 |
| 반복 기제 |  |
| 필요 조건 | 甲子의 같은 Conflict와 지연 근거 |
| 역조건 | 다른 원국 판단과 공존. 같은 사건 안의 반복 검토만 명시 |
| 허용 맥락 | 개인 결정 |
| 금지 추론 | 독립 고리 두 개, 여러 기회에서의 실제 반복 |

### B02 · `extended_review_before_action`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L725-L746](../source/personality/일주풀이.md#L725-L746) |
| 관찰 의미 | 검토·포기가 다음 시도의 예상까지 되먹임 |
| 촉발 | 새 시도를 검토 |
| 내부 반응 | 해내려는 의욕과 결단 저하 |
| 판단·해석 | 시도해도 안 될 것이라고 미리 판단 |
| 행동·소통·경계 | 움직이지 않거나 일찍 포기 |
| 결과 | 시도 전에 중단 |
| 반복 기제 | 누적된 검토·포기 뒤 다음 시도도 부정적으로 예단 |
| 필요 조건 | 辛未 modifier에서 실제 검토→예단→포기 경로에 한정 |
| 역조건 | 다른 기둥의 보완과 결단 발현. 어떤 조합이 보호하는지는 원문 미특정 |
| 허용 맥락 | 개인 결정·시도 |
| 금지 추론 | 편인 전체로 일반화, 실제 놓친 기회와 자존감 진단 |

### B03 · `pushback_under_pressure`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L740-L755](../source/personality/십성.md#L740-L755) · [십성 L771-L798](../source/personality/십성.md#L771-L798) · [07 사주풀이예시 L861-L875](../source/primary/07-사주풀이예시.md#L861-L875) |
| 관찰 의미 | 불합리하다고 보는 규칙 또는 사회 마찰에서 이의를 표시 |
| 촉발 | 마찰이 커지거나 규칙이 불합리하다고 느낌 |
| 내부 반응 | 억압에 대한 반감 |
| 판단·해석 | 규칙의 타당성을 문제 삼음 |
| 행동·소통·경계 | 반대 의견 표명 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 발현 위치와 마찰 근거. 타당한 조언까지 거부하는 가지는 과잉 조건 별도 |
| 역조건 | 조절된 비판, 학습·전문성으로 표현 전환. 상관패인은 실제 구조와 별도 행동 gate 필요 |
| 허용 맥락 | 사회 규칙·대화 |
| 금지 추론 | 반대 의사 표현을 다시 결과로 계산하거나 반복 갈등을 단정 |

### B04 · `overchecking_before_commitment`

**CONDITIONAL** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L1464-L1477](../source/personality/일주풀이.md#L1464-L1477) · [일주풀이 L3344-L3352](../source/personality/일주풀이.md#L3344-L3352) |
| 관찰 의미 | 확신 기준 때문에 시작·경로 변경 앞에서 주저 |
| 촉발 | 시작 또는 전환 |
| 내부 반응 | 확신 부족 |
| 판단·해석 | 될 만한지, 바꿔도 될지 의심 |
| 행동·소통·경계 | 주저하거나 확인에 시간을 씀 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 癸未·庚戌을 각각 별도 modifier로 확인. 癸未의 시작 후 포기 문장은 별도 가지 |
| 역조건 | 庚戌은 공인된 근거 또는 확신이 기준에 닿으면 움직이는 반대 경로도 기술한다. 공통 포기·기회 손실은 미지지 |
| 허용 맥락 | 개인 결정 |
| 금지 추론 | 두 프로필 연결, 계속 확인한다는 동작의 횟수나 실직 |

### B05 · `rapid_action_when_gain_is_clear`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `GENERALIZABLE_CANDIDATE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L669-L683](../source/personality/십성.md#L669-L683) · [십성 L1199-L1219](../source/personality/십성.md#L1199-L1219) |
| 관찰 의미 | 실익이 보일 때 실행으로 빨리 옮김 |
| 촉발 | 실익을 포착 |
| 내부 반응 |  |
| 판단·해석 | 실제로 해볼 만하다고 판단 |
| 행동·소통·경계 | 위험을 감수해 시도 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 실리 판단과 실행이 함께 드러나는 편재 발현 |
| 역조건 | 목표만 크고 실행이 뒤따르지 않는 경우 T648-656. T679의 실패 후 재시도는 별도 문장·조건 |
| 허용 맥락 | 결정·일상 계획 |
| 금지 추론 | 투자 성과, 빠른 실행과 실패 후 재시도를 한 고리로 조립 |

### B06 · `boundary_setting_after_overextension`

**SOURCE_GAP** · `FILUNE_INFERENCE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L440-L455](../source/personality/십성.md#L440-L455) · [일주풀이 L3682-L3694](../source/personality/일주풀이.md#L3682-L3694) |
| 관찰 의미 | 과하게 관계를 돌본 사람이 이후 직접 경계를 세운다는 연결은 확인되지 않음 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 같은 사람의 과확장·자기 경계 전환을 명시한 근거 필요 |
| 역조건 | T447-451은 기준 초과, D3688-3692는 시간 부족. 서로 다른 조건 |
| 허용 맥락 | 관계 |
| 금지 추론 | 두 원천을 붙여 경계 설정 결과 생성 |

### B07 · `independent_method_after_constraint`

**SOURCE_GAP** · `SOURCE_EXPLICIT` · `FILUNE_INFERENCE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L400-L425](../source/personality/십성.md#L400-L425) · [십성 L771-L783](../source/personality/십성.md#L771-L783) |
| 관찰 의미 | 독립적으로 해결하려는 성향과 규칙에 이의 제기는 각각 존재 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 | 자력으로 해결하려 함 |
| 행동·소통·경계 | 스스로 해결 또는 규칙에 이의 제기 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 같은 제약 뒤 독자적 방법으로 옮기는 직접 연결 필요 |
| 역조건 | 수평적 협업과 자력 해결은 공존 가능 |
| 허용 맥락 | 업무·공동 과제 |
| 금지 추론 | 조직 이탈, 제약 뒤 자동으로 방식 전환 |

### B08 · `withdrawal_when_control_is_lost`

**REJECTED** · `FILUNE_INFERENCE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L1105-L1112](../source/personality/일주풀이.md#L1105-L1112) · [일주풀이 L3609-L3619](../source/personality/일주풀이.md#L3609-L3619) · [일주풀이 L4084-L4097](../source/personality/일주풀이.md#L4084-L4097) |
| 관찰 의미 | 주도권 상실 불안·압박의 내면화·소진 뒤 거리 욕구는 이질적 근거 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 |  |
| 역조건 | 주도권을 유지하려 애쓰는 방향과 소진 뒤 거리를 원한다는 방향을 분리 |
| 허용 맥락 |  |
| 금지 추론 | 통제 상실을 공통 촉발로 만들거나 실제 철수를 추정 |

### B09 · `rechecking_after_completion`

**APPROVED** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L760-L761](../source/personality/일주풀이.md#L760-L761) · [일주풀이 L4042-L4043](../source/personality/일주풀이.md#L4042-L4043) |
| 관찰 의미 | 자기 결과물에 높은 기준을 적용해 완료 후 재점검 |
| 촉발 | 자기 작업 완료 |
| 내부 반응 | 흡족하지 않음 |
| 판단·해석 | 자기 결과물에 더 엄격한 기준 |
| 행동·소통·경계 | 완료한 일을 다시 확인 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 辛 일간 결과물 평가·재점검 근거 |
| 역조건 | 타인의 결과물에는 같은 기준을 적용하지 않는 대비. 일주마다 재인용된 일간 설명은 하나로 집계 |
| 허용 맥락 | 자기 작업 검토 |
| 금지 추론 | 검토가 성과나 피로를 실제 초래했다고 단정, 재점검 자체를 recurrence로 집계 |

### B10 · `switch_between_social_expression_and_private_judgment`

**APPROVED** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [11 성격 마스터 L410-L422](../rules/master/11-personality-master.md#L410-L422) · [십성 L1524-L1544](../source/personality/십성.md#L1524-L1544) |
| 관찰 의미 | 외부 표현과 내부 검토의 맥락 대비 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 | 개인 판단에서는 신중하게 검토 |
| 행동·소통·경계 | 외부에서는 빠르게 표현·비판 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 바깥 위치·내부 위치의 두 Fact와 context_split Conflict |
| 역조건 | 양쪽 증거 중 하나가 없거나 시간 미상 위치가 원천이면 유보 |
| 허용 맥락 | 일반·관계 대화의 대비 |
| 금지 추론 | 같은 대화 뒤 반드시 재고, 같은 갈등의 재발 |

### B11 · `haste_increases_errors`

**APPROVED** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L2375-L2385](../source/personality/일주풀이.md#L2375-L2385) · [07 사주풀이예시 L861-L875](../source/primary/07-사주풀이예시.md#L861-L875) |
| 관찰 의미 | 빠른 결정이 성급한 경우 실수가 늘어날 수 있음 |
| 촉발 | 판단이 성급해지는 상황 |
| 내부 반응 |  |
| 판단·해석 | 빠르게 판단 |
| 행동·소통·경계 | 생각에서 실행으로 빠르게 이동 |
| 결과 | 실수 가능성이 높아짐 |
| 반복 기제 |  |
| 필요 조건 | 丙申 modifier와 성급함 조건 |
| 역조건 | 빠른 실행 자체가 성급함을 뜻하지 않음. 07 사례는 빠른 모방의 이점도 기술 |
| 허용 맥락 | 결정·실행 |
| 금지 추론 | 실수 횟수, 빠른 판단 일반의 실패 |

### B12 · `raised_standard_after_reaching_result`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L2338-L2349](../source/personality/일주풀이.md#L2338-L2349) |
| 관찰 의미 | 기준 상향과 다시 추구하는 과정에 반복 후보 |
| 촉발 | 만족 기준 도달 또는 결과 확인 |
| 내부 반응 | 불안·미충족감 |
| 판단·해석 | 기준을 다시 높임 |
| 행동·소통·경계 | 높인 기준을 향해 다시 움직임 |
| 결과 | 만족이 유지되지 않음 |
| 반복 기제 | 성취 뒤 기준 상향으로 추구가 다시 시작된다는 서술 |
| 필요 조건 | 乙未 문맥에 한정. 산업 예시는 case-only. 반복 경로를 별도 typed 근거로 확보 |
| 역조건 | 빠르게 전환해 성과를 얻는 예도 원문에 있음 |
| 허용 맥락 | 자기 목표·기준 |
| 금지 추론 | 사업 성패, 손실, 동일 고리를 대기 불내성까지 분할 계수 |

### B13 · `recognition_maintenance_rigidity`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L1694-L1734](../source/personality/일주풀이.md#L1694-L1734) |
| 관찰 의미 | 인정 유지 판단이 몰입과 경직으로 이어짐 |
| 촉발 | 인정과 역할 유지가 중요해짐 |
| 내부 반응 | 조바심·부담 |
| 판단·해석 | 인정을 유지해야 가치가 유지된다고 여김 |
| 행동·소통·경계 | 대상·역할에 과몰입 |
| 결과 | 생각과 행동의 경직 |
| 반복 기제 |  |
| 필요 조건 | 丁亥의 양쪽 Conflict와 보완 조건 |
| 역조건 | 동일 절에 다른 원국 요소의 보완 명시. 구체 차단 조건 미정 |
| 허용 맥락 | 자기 역할·인정 |
| 금지 추론 | 가족 행동, 소진 진단, 압박이 반복을 재활성한다고 자동 추정 |

### B14 · `rapid_imitation_as_general_pattern`

**CASE_ONLY** · `CASE_ONLY` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [07 사주풀이예시 L861-L875](../source/primary/07-사주풀이예시.md#L861-L875) |
| 관찰 의미 | 특정 명식에서 빠른 실행과 모방을 설명 |
| 촉발 | 악기·스포츠·실행의 사례 문맥 |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 | 빠르게 먼저 움직이고 모방 |
| 결과 | 사례의 모방 강점 |
| 반복 기제 |  |
| 필요 조건 | 해당 사례 원국과 맥락 |
| 역조건 | 깊이·지속의 제약 및 구조의 차이를 같은 해설이 명시 |
| 허용 맥락 | 내부 사례 비교 |
| 금지 추론 | 상관이 있는 모두가 빠르고 지속력이 약하다는 규칙 |

## 3. Relationship Pattern rules

### R01 · `wide_social_contact_but_selective_closeness`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `GENERALIZABLE_CANDIDATE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L440-L455](../source/personality/십성.md#L440-L455) · [일주풀이 L353-L365](../source/personality/일주풀이.md#L353-L365) |
| 관찰 의미 | 넓은 접점과 내면 개방을 구분 |
| 촉발 | 처음 교류하거나 진심을 나눌 사람을 살핌 |
| 내부 반응 |  |
| 판단·해석 | 충분히 지켜본 뒤 마음을 열 수 있는지 판단 |
| 행동·소통·경계 | 교류하되 속내를 선별적으로 공개 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 丁卯의 개방 조건과 사회 접근 근거. 편관 쪽 증거는 넓은 접점·경계만 별도 사용 |
| 역조건 | 넓은 교류만 있는 경우 선택적 친밀감 없음 |
| 허용 맥락 | 일반 교류·친밀감 |
| 금지 추론 | 편관과 丁卯 합성, 연애 시작·횟수 |

### R02 · `trust_built_through_consistency`

**APPROVED** · `SOURCE_EXPLICIT` · `GENERALIZABLE_CANDIDATE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L1205-L1211](../source/personality/십성.md#L1205-L1211) |
| 관찰 의미 | 가까운 관계에서 오랜 신뢰 축적을 선호 |
| 촉발 | 가까운 관계 |
| 내부 반응 |  |
| 판단·해석 | 폭넓은 인맥보다 가까운 신뢰 중시 |
| 행동·소통·경계 | 시간을 두고 관계를 쌓음 |
| 결과 | 신뢰 축적을 지향 |
| 반복 기제 |  |
| 필요 조건 | 유효한 대인 Fact와 가까운 관계 발현 |
| 역조건 | 약속 개별 이행이 신뢰를 형성했다는 별도 사건 근거 없음 |
| 허용 맥락 | 가까운 관계 |
| 금지 추론 | 신뢰 성공·상대 평가·특정 약속을 반복 원인으로 사용 |

### R03 · `boundary_after_threshold_crossed`

**APPROVED** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L440-L455](../source/personality/십성.md#L440-L455) |
| 관찰 의미 | 교류 폭과 기준 초과 시 단호함이 함께 서술됨 |
| 촉발 | 자신의 관계 기준을 넘었다고 판단 |
| 내부 반응 |  |
| 판단·해석 | 허용 한계 확인 |
| 행동·소통·경계 | 선을 긋거나 접촉 범위를 줄이는 방향 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 맥락형 대인 Fact와 조건이 보존된 variant |
| 역조건 | 허용 범위에서는 교류가 계속될 수 있음 |
| 허용 맥락 | 경계·갈등 |
| 금지 추론 | 특정 임계 행동, 단절·이별·타인 잘못 단정 |

### R04 · `equal_voice_preference`

**APPROVED** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L412-L425](../source/personality/십성.md#L412-L425) · [십성 L785-L793](../source/personality/십성.md#L785-L793) |
| 관찰 의미 | 동등한 의견 교환을 선호 |
| 촉발 | 의견이나 대우의 균형이 걸린 대화 |
| 내부 반응 |  |
| 판단·해석 | 공정성과 동등함 중시 |
| 행동·소통·경계 | 자기 의견·권리를 표현하는 경로는 T785-793에 한해 지원 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 비견과 상관 자료를 각각 식별하고 실제 대화 축에서만 적용 |
| 역조건 | 조언 거부는 과다 조건의 별도 경로 |
| 허용 맥락 | 소통 |
| 금지 추론 | 상대가 일방적이거나 통제적이라고 추정 |

### R05 · `distance_when_expectations_are_unclear`

**SOURCE_GAP** · `FILUNE_INFERENCE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L322-L330](../source/personality/십성.md#L322-L330) · [일주풀이 L353-L365](../source/personality/일주풀이.md#L353-L365) |
| 관찰 의미 | 겉의 원만함과 거리감은 확인되지만 기대의 모호함이 촉발한다는 연결은 없음 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 모호한 기대→자기 해석→거리 조절의 직접 근거 필요 |
| 역조건 | 정인 과한 발현과 상호성 걱정을 하나로 취급하지 않음 |
| 허용 맥락 | 관계 |
| 금지 추론 | 기대의 모호함이 거리감의 원인이라고 출력 |

### R06 · `direct_expression_under_conflict`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L1526-L1532](../source/personality/일주풀이.md#L1526-L1532) · [십성 L771-L793](../source/personality/십성.md#L771-L793) |
| 관찰 의미 | 갈등에서 우회보다 직접 입장을 드러낼 수 있음 |
| 촉발 | 기준 또는 의견 충돌 |
| 내부 반응 |  |
| 판단·해석 | 자기 뜻을 지키려 함 |
| 행동·소통·경계 | 논점을 직접 드러냄 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 甲申의 대인 modifier 또는 별도 십성 조건을 각각 요구 |
| 역조건 | 조절된 직설·전문성의 표현 T794-798. 갈등 그 자체가 행동 뒤 결과는 아님 |
| 허용 맥락 | 소통·갈등 |
| 금지 추론 | 상대의 상처나 관계 손상을 사실로 표시 |

### R07 · `private_reconsideration_after_public_expression`

**REJECTED** · `FILUNE_INFERENCE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [11 성격 마스터 L410-L422](../rules/master/11-personality-master.md#L410-L422) · [일주풀이 L368-L370](../source/personality/일주풀이.md#L368-L370) |
| 관찰 의미 | 겉·속 공존은 지원되지만 발화 이후 재검토한다는 시간 순서 없음 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | B10의 원천 ID는 맥락 대비에만 공유 |
| 역조건 | 겉으로 동의하면서 속 판단을 유지할 수도 있음 |
| 허용 맥락 | 소통 대비 |
| 금지 추론 | 같은 대화 후 검토·재협상·반복 사건 |

### R08 · `independence_vs_closeness_tension`

**SOURCE_GAP** · `GENERALIZABLE_CANDIDATE` · `FILUNE_INFERENCE`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L400-L423](../source/personality/십성.md#L400-L423) · [일주풀이 L353-L365](../source/personality/일주풀이.md#L353-L365) · [일주풀이 L3682-L3692](../source/personality/일주풀이.md#L3682-L3692) |
| 관찰 의미 | 자립 선호와 친밀감의 공존은 조사 가치가 있으나 동일 원천 갈등으로 연결되지 않음 |
| 촉발 |  |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 친밀 진입과 자립의 전환을 명시한 같은 Conflict 필요 |
| 역조건 | 乙卯의 갈등은 기존 관계 유지와 새 경험에 관한 것 |
| 허용 맥락 | 친밀·거리 |
| 금지 추론 | 두 Fact를 엮어 관계 회피·독립 대 친밀의 양자택일 추정 |

### R09 · `role_expectation_conflict`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [십성 L1108-L1155](../source/personality/십성.md#L1108-L1155) · [일주풀이 L1710-L1734](../source/personality/일주풀이.md#L1710-L1734) · [17 CL-R03](../rules/master/17-cause-to-life-mapping.md#승인-범위) |
| 관찰 의미 | 역할 기준 사이의 부담과 자신의 경직을 구분 |
| 촉발 | 상충하는 기준 또는 인정 유지 압박 |
| 내부 반응 | 부담 |
| 판단·해석 | 어느 기준을 따르거나 인정을 유지할지 고민 |
| 행동·소통·경계 | 역할에 몰입하는 부분은 丁亥 갈등에서만 확인 |
| 결과 | 경직은 丁亥에 한정 |
| 반복 기제 |  |
| 필요 조건 | 사회 문맥의 정관·편관은 실제 양축 확인. 친밀 문맥에는 별도 출처 필요 |
| 역조건 | 원국 보완 조합. CL-R03 Outcome과 같은 Fact로 취급 금지 |
| 허용 맥락 | 사회 역할. 친밀 관계 갈등은 미확정 |
| 금지 추론 | 파트너의 통제·실제 갈등·시기 예측 |

### R10 · `initiation_after_observation_or_approach`

**CONDITIONAL** · `SOURCE_EXPLICIT` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L353-L365](../source/personality/일주풀이.md#L353-L365) · [일주풀이 L2526-L2532](../source/personality/일주풀이.md#L2526-L2532) · [일주풀이 L241-L254](../source/personality/일주풀이.md#L241-L254) |
| 관찰 의미 | 마음을 열기 전 지켜보는 방향과 먼저 접근을 받은 뒤 열리는 방향은 다른 후보 |
| 촉발 | 관계를 먼저 살피거나 접근을 받은 상황 |
| 내부 반응 | 진심이 돌아올지 염려하는 쪽은 丁卯에 한정 |
| 판단·해석 | 마음을 열어도 될지 살핌 |
| 행동·소통·경계 | 내면 공개를 미루거나 서서히 열기 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 프로필·문장별 분리, 성별 고정관념 제거 후 남는 자기 행동만 재검토 |
| 역조건 | 丙寅 서술은 적극적 주도라는 다른 경로. 상대 접근은 실제 맥락이 있을 때만 |
| 허용 맥락 | 친밀 진입 후보 |
| 금지 추론 | 연애 개시 성사·상대가 먼저 다가온다고 예측 |

### R11 · `holding_back_to_avoid_burden`

**CASE_ONLY** · `CASE_ONLY` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L436](../source/personality/일주풀이.md#L436) · [일주풀이 L2487](../source/personality/일주풀이.md#L2487) · [일주풀이 L3181](../source/personality/일주풀이.md#L3181) · [일주풀이 L3818](../source/personality/일주풀이.md#L3818) |
| 관찰 의미 | 같은 문장이 여러 일주에 반복된 vignette. 속상함을 말하지 않는 동작과 늦은 공개를 서술 |
| 촉발 | 속상한 일 |
| 내부 반응 | 부담을 줄 수 있다는 걱정 |
| 판단·해석 | 말을 아낌 |
| 행동·소통·경계 | 표현 보류 후 늦게 말함 |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 개별 표현 근거와 문단의 편집 계통 검증 필요 |
| 역조건 | 중복 문구는 독립 corroboration이 아님. 상대 서운함·거리감은 제외 |
| 허용 맥락 | 친밀 소통의 내부 비교 |
| 금지 추론 | 상대가 상처받았음, 몇 달 지연, 실제 이별 |

### R12 · `maintaining_relationships_crowds_out_new_experience`

**CONDITIONAL** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L3682-L3694](../source/personality/일주풀이.md#L3682-L3694) |
| 관찰 의미 | 관계 안정에 투입한 시간·에너지가 새 시도를 제약 |
| 촉발 | 기존 관계를 돌볼 기회와 새 경험 욕구가 공존 |
| 내부 반응 | 새 경험 욕구 |
| 판단·해석 | 관계 안정 우선 |
| 행동·소통·경계 | 관계 유지에 시간 투입 |
| 결과 | 새 시도의 시간·여유 감소 |
| 반복 기제 | 관계 안정 때문에 지속 투입한다는 반복 후보. 갈등 재발은 미지지 |
| 필요 조건 | 乙卯의 같은 Conflict와 관계 유지 문맥 |
| 역조건 | 다른 구조에서 활동 자체가 약할 수 있다는 L3693. 상대가 떠난다는 부분 제외 |
| 허용 맥락 | 가까운 관계·일상 일정 |
| 금지 추론 | 연애 횟수·이별·실제 일정 손실 |

### R13 · `exhaustion_then_wanting_space`

**CONDITIONAL** · `SOURCE_EXPLICIT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [일주풀이 L4084-L4097](../source/personality/일주풀이.md#L4084-L4097) |
| 관찰 의미 | 소진이 관계/역할에서 물러나고 싶어지는 전환으로 이어짐 |
| 촉발 | 관계와 역할에 힘을 쏟은 뒤 지침 |
| 내부 반응 | 허무함·소진 |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 |  |
| 반복 기제 |  |
| 필요 조건 | 壬戌의 관계 참여와 소진 양쪽 Conflict. 지친 시기의 거리 욕구까지만 |
| 역조건 | 원문에서 이후 방향이 여럿. 욕구와 실제 행동을 분리 |
| 허용 맥락 | 거리 조절의 내적 단서 |
| 금지 추론 | 연락 두절·관계 종료·상대 행동·원인이 주도권 상실이라는 추정 |

### R14 · `relationship_case_conflict_to_divorce`

**CASE_ONLY** · `CASE_ONLY` · `COUNTEREXAMPLE_PRESENT`

| 항목 | 추출 |
| --- | --- |
| 출처·원문 위치 | [07 사주풀이예시 L3252-L3256](../source/primary/07-사주풀이예시.md#L3252-L3256) |
| 관찰 의미 | 사례는 실제 외부 가족 갈등과 운에 대한 사후 설명을 포함 |
| 촉발 | 사례에 기술된 갈등 |
| 내부 반응 |  |
| 판단·해석 |  |
| 행동·소통·경계 |  |
| 결과 | 사례에서 이혼. 연구 열람에만 제한 |
| 반복 기제 |  |
| 필요 조건 | 특정 사례의 전체 맥락 |
| 역조건 | 원문도 일지 충만으로 설명할 수 없다고 명시 |
| 허용 맥락 | 내부 사례 비교 |
| 금지 추론 | 배우자 행동·미래 이혼·사용자 재발로 일반화 |

## 4. CR-03 완성 고리와 readiness

P4-D의 8개 명식을 재실행했다. CS-127과 P3-C에 각각 1개, 나머지 6개에 0개다. 신미와 갑자의 경로는 별개의 명식에 나타난다. 이어 실제 Personality와 Assembly에서 일주 60개를 주입하고 나머지 기둥을 미상으로 두어 일주 보정만 격리했다. 완성 고리 1개가 나온 프로필은 **3개(`甲子`, `辛未`, `丙申`)**, 2개 이상 나온 프로필은 **0개**다. 현재 typed `recurrence`가 채워진 프로필은 **0개**다. 이 테스트는 일주 보정의 범위를 확인하는 통제 실험이고 전체 출생 명식의 모집단 추정에는 쓸 수 없다.

| 구분 | 근거 판정 |
| --- | --- |
| 결과까지 연결된 경로 | B01은 의욕·재확인·착수 지연, B02는 명시 조건의 검토·시도 중단, B11은 빠른 결단이 성급해질 때의 실수 가능성이다. |
| typed 확장 후보 | B02의 원문에는 다음 시도까지 이어지는 예단이 있다. B12에도 반복 경로가 서술되지만 업종 예시와 자기 기준의 일반 문장을 분리해서 검증해야 한다. B13은 인정 유지로 인한 경직까지 확인된다. |
| 독립성 | B01의 한 번의 결정에서 생각을 되풀이하는 행위는 착수 지연과 같은 경로다. B02의 포기와 후속 예단은 같은 고리의 결과와 되먹임이다. 두 경우 모두 둘로 나누어 READY를 만들 수 없다. |
| 결과와 재발의 관계 | 결과 또는 재발 기제로 구조 완성 후보를 판정한다. 제목에서 반복을 고객에게 주장하려면 재발 단계가 따로 근거를 가져야 한다. |

독립 고리 2개 요건은 유지한다. 원문 감사에서 별도 사례를 확보했지만 대부분 명식에 2개를 지지할 정도로 승인된 조합·조건·역조건이 갖춰졌다고 볼 근거는 없다.

## 5. CR-05 관계 시작·친밀·갈등의 커버리지

| 축 | 판정 | 확인한 근거 및 남은 경계 |
| --- | --- | --- |
| 사회적 접근 | 기존 범위에서 사용 가능 | 처음 만난 사람과 교류하는 방식과 넓은 접점. 이 의미는 관계 개시와 분리한다. |
| 친밀 관계 시작 | `SOURCE_GAP/beginnings` 유지 | R10에서 관찰 뒤 마음을 여는 자기 행동은 조건부 후보로 남겼다. 상대가 먼저 접근한다는 예측, 성별에 따른 연애 개시 규칙, 관계 형성 성사는 지원하지 않는다. |
| 친밀·신뢰 | 제한적 지원 | R01과 R02가 개방 기준과 신뢰를 쌓는 방향을 지지한다. 특정 약속을 통한 검증이나 신뢰 손상 인과는 별도 근거가 필요하다. |
| 소통 | 제한적 지원 | R04의 의견 교환, R06의 직접 표현. R11은 문구가 여러 일주에 복제된 예시로 다루며 상대의 반응은 배제한다. |
| 갈등·경계 | 제한적 지원 | R03의 기준 초과 시 선 긋기. R09의 역할 기대는 사회 문맥에 한정하며 관계 Outcome의 압박과 별도다. |
| 갈등 뒤 거리·회복 | 부분 후보 | R13은 물러나고 싶은 내적 전환까지. 같은 갈등에서 실제 거리두기·재협상·신뢰 회복으로 이어진 근거는 없다. |
| 재발 | `SOURCE_GAP` | R12의 반복은 관계 유지에 시간·에너지를 쓰는 경로에 관한 것이다. 같은 관계 갈등이 재발한다는 재확인 경로는 없다. |

P4-D의 CR-05는 관계 스타일·소통·갈등 Fact가 모이면 `relation_sequence`와 함께 `repetitionMechanism` 슬롯을 채운다. 이 구성은 맥락을 연결해 읽는 데 유효하다. 향후 Assembly에서는 이 슬롯을 `relationshipSequence`로 분리하고, 관계 재발은 명시적 `recurrence` evidence가 있을 때만 채우도록 제안한다. [현행 연결 지점](../../lib/reading/customer/buildCustomerReadingPlan.ts#L290)

## 6. Cause-to-Life 확장안

### 후보 레지스트리 설계

검토 자료의 후보와 실행 의미를 별도 타입으로 둔다. 빈 필드는 감사 단계에서 비어 있을 수 있다. 활성화 시에는 단계별 출처를 충족한 Fact와 적용·역조건까지 확인한다.

```ts
type Stage = 'trigger' | 'internalResponse' | 'judgment' | 'behavior' | 'result' | 'recurrence'
type SourceStatus = 'SOURCE_EXPLICIT' | 'CASE_ONLY' | 'GENERALIZABLE_CANDIDATE'
  | 'COUNTEREXAMPLE_PRESENT' | 'FILUNE_INFERENCE' | 'REJECTED'

interface BehaviorPatternRuleProposal {
  readonly id: string
  readonly domain: 'behavior' | 'natal_relationship'
  readonly sourceStatus: readonly SourceStatus[]
  readonly decision: 'APPROVED' | 'CONDITIONAL' | 'CASE_ONLY' | 'SOURCE_GAP' | 'REJECTED'
  readonly requiredTraits: readonly string[]
  readonly requiredConflicts?: readonly string[]
  readonly requiredStructuralStates?: readonly string[]
  readonly stages: Readonly<Partial<Record<Stage, readonly { meaning: string; sourceRefs: readonly string[] }[]>>>
  readonly allowedContexts: readonly string[]
  readonly counterConditions: readonly string[]
  readonly prohibitedInferences: readonly string[]
}

interface PatternProjectionProposal {
  readonly ruleId: string
  readonly mechanismId: string
  readonly scope: 'natal'
  readonly stages: Readonly<Partial<Record<Stage, readonly string[]>>> // Resolved evidence IDs.
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceConflictIds: readonly string[]
  readonly sourceModifierIds: readonly string[]
  readonly evidenceIds: readonly string[]
  readonly resultCoverage: 'supported' | 'gap'
  readonly recurrenceCoverage: 'supported' | 'gap'
}
```

관계 단계에서는 `judgment`에 기대·해석, `behavior`에 소통과 경계·갈등 역할을 각각 부여한다. 동일 단계에 여러 Fact가 있어도 역할별 근거 ID를 역추적할 수 있어야 한다. 조합을 검증할 때는 같은 명식·같은 맥락·같은 갈등 및 역할 경로에 속하는지 확인한다. 조건이 미상인 후보는 조건부 또는 미확정으로 보존한다.

### 17에 추가할 수 있는 번호와 범위

| 후보 | 필수 근거 | 허용 범위 |
| --- | --- | --- |
| CL-P02 판단 전환 | 같은 Conflict의 양쪽 Fact, 상황 또는 위치 근거 | B01의 착수 직전 전환, B10의 맥락 대비. B10에는 시간 순서 없음. |
| CL-P03 상황 반응 | 실제 발현 Fact와 촉발, 보호·과잉 조건의 적용 여부 | B03의 이의 표명. 이후의 실패·관계 사건은 별도 검증. |
| CL-P04 행동 결과·반복 | 촉발, 반응 또는 판단, 행동, 결과 또는 재발 각 단계 provenance | B02·B11의 결과와 B02·B12의 재발 후보는 독립 필드. |
| CL-R04 관계 소통 | 상황·대화 선호·자기 반응 Fact와 적용 맥락 | R04·R06의 의견 교환과 발화 방식. |
| CL-R05 경계·갈등 | 자신의 관계 기준, 갈등 맥락과 대응 Fact | R03의 기준 초과 뒤 경계. 이후 거리와 재발은 각각 별도 Fact. |

17의 기존 CL-P01과 CL-R01~03 및 master 전체에서 제안 번호의 충돌을 확인했다. 위 표가 별도 master 변경 제안이다. 새로운 매핑은 기존 문서를 승인 절차 없이 변경하지 않고 이 보고서에만 등록했다.

Assembly 적용을 승인할 때 CR-03과 CR-05가 같은 Personality Fact, 동일한 `mechanismId`와 semantic unit ID를 참조하도록 한다. B10을 관계에 재사용해도 근거가 있는 대화 맥락만 붙인다. 새 관계 사건이나 새 의미 수를 만들지 않는다. Outcome과 periodRef는 지금처럼 평가된 별도 레이어에 둔다. 고객용 Renderer는 승인된 역할·단계가 있을 때만 표현한다.

## 7. Fixture 결과

| 범위 | 사례 | 관측 결과 |
| --- | --- | --- |
| 행동 양성·갈등 | P3-C 甲子 | Conflict의 양쪽 Fact와 연결 결과로 착수 지연 고리 1개. |
| 행동 양성·조건 | CS-127 辛未 | 검토 후 시도 중단 1개. 기존 구조가 원문의 재발 근거를 typed evidence로 발행하진 않는다. |
| 행동 결과 반례 | P3-C에서 결과 Fact만 제외 | 양쪽 Fact는 유지되고 완성 수는 0개. 원천 결과의 부재를 renderer가 메울 수 없다. |
| 행동 맥락 대비 | P3-B 바깥 표현·내부 검토 | 같은 Conflict의 두 축은 부분 후보. 결과·재발 미확인. |
| 행동 보호 대조 | P3-D OFF-02 확인 fixture | 역할 기반 표현 보호는 확인됐다. 동일 마찰에서 특정 반발 행동이 차단됐음을 입증할 source는 미확보다. 그 효과를 합성하지 않았다. |
| 행동 무규칙 | P3-Q 戊午 | CR-03 후보 0개. |
| 관계 접근·친밀 | CS-005 natal only | 넓은 교류와 관계에 대한 선택적 참여가 함께 표현된다. 연애 시작은 여전히 공백이다. |
| 관계 신뢰·경계·대화 | CS-005 natal only | 신뢰 축적, 동등한 소통, 기준 초과 뒤 경계 Fact 확인. 결과와 재발은 자료의 별도 검토를 요구한다. |
| 관계 Outcome만 | CS-005의 동일 producer 출력, natal 미제공 | 접점·형성 Outcome이 남고 Personality 반응 및 반복 근거는 생기지 않는다. |
| 관계 natal만 | CS-005 natal 및 빈 Outcome 배열 | 성향 층만 존재하고 Outcome ID는 0개다. |

- `node scripts/verify-behavior-relationship-source-p4e.mjs`로 일주 60개, 단계 제외 반례, 역할 보호 대조, 관계 두 층을 확인했다.
- `node scripts/verify-customer-reading-ko-p4c.mjs --all-json --facts`로 P4-D 8개 명식을 재실행했다.
- P3의 보호 fixture는 구조 보호를 검증한다. 같은 촉발을 관찰해 보호가 행동을 차단한 사례는 후속 연구 항목이다. 이 차이는 차단 예제를 준비할 때 보존해야 한다.

## 8. Remaining GAP

1. B02의 역조건은 다른 기둥의 보완이라는 원문 표현에 머문다. 검토·포기 경로를 완화하는 구체 조합과 실제 행동 연결이 필요하다. B12는 사업 예시를 제외해도 기준 상향이 반복되는지 독립 근거가 필요하다.
2. 같은 명식에서 서로 독립인 두 행동 고리가 공존하며 각각의 조건과 역조건이 확인된 사례가 없다.
3. 친밀 관계 개시의 조건부 자기 행동, 기대가 어긋났을 때의 해석과 소통, 갈등 뒤 신뢰 변화·재협상, 동일 유형의 갈등을 반복하게 하는 조건은 추가 검증이 필요하다.
4. `EXTERNAL_RESEARCH_CANDIDATE`는 후속 검토용 구분이다. 동일 참여자의 반복 관찰 자료를 포함한 장기 기록, 관계 시작과 사회적 접근을 구별한 자료, 맥락이 보존된 보호 사례를 별도로 검토할 수 있다. 이번 감사의 판정 근거는 저장소 corpus다.

## 9. Recommendation

| 대상 | 안 | 판단 |
| --- | --- | --- |
| CR-03 | A. 현재 제목 유지 + source 보강 | 반복이라는 질문에 직접 답하려면 이 안이 적합하다. 근거가 확보된 명식만 완성할 수 있고 나머지는 PARTIAL이다. 독립 두 고리라는 기준을 계속 사용한다. |
| CR-03 | B. 상황에 따라 달라지는 나의 반응 | 촉발과 반응·판단까지 있는 후보를 고객에게 설명하기 쉽다. 반복·결과를 약속하지 않는 별도 장 계약과 readiness가 필요하다. 당장 반응 근거의 활용이 우선인 제품 결정에는 이 안이 맞는다. |
| CR-05 | 단일 흐름 유지 | 표현이 매끄러울 수 있지만 관계 습관과 외부 타이밍의 연결이 인과로 읽힐 여지가 있다. |
| CR-05 | 한 장 안에서 Natal pattern과 Outcome/timing 분리 | 성향이 뒷받침된 범위와 평가된 기간을 구별할 수 있다. A는 ‘관계에서 반복되는 나의 방식’, B는 ‘관계의 흐름이 움직이는 시기’라는 구조를 검토했다. A의 반복 소제목은 재발 근거가 있을 때 사용한다. 재발이 미확인이라면 ‘관계에서 드러나는 나의 방식’으로 신뢰·대화·경계를 전달한다. B에는 유효한 접점·형성·압박 및 기간을 둔다. |

지금은 CR-03 계약과 제목을 유지하면서 B02의 조건·역조건과 독립 두 번째 경로를 우선 검증하는 편이 계약에 부합한다. CR-05는 같은 장 안에서 두 섹션을 분리하는 설계안을 권장한다. 현행 출력의 변경은 별도 승인 범위다.
