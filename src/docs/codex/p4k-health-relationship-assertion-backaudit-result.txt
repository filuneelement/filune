# FILUNE P4-K Health & Relationship Outcome Assertion Backaudit

**감사 완료 상태** `HEALTH_RELATIONSHIP_ASSERTION_AUDIT_COMPLETE`  
**최종 의미 판정** `SEMANTIC_EXPANSION_REQUIRED`

Health의 현행 발행 조건과 교정된 명세 사이에 의미 손실이 있다. 이미 자격을 충족한 부담 경로와 기간을 별도 생활 결과로 확장해야 한다. 기존 월운 창에서 확인된 Health fact가 사라지는 문제도 재현했다. Relationship의 현행 접점과 변화는 승인된 의미를 유지한다. 관계 형성·큰 약속·부담에는 각각 추가 매핑과 검증이 필요하다. 감사 완료 상태와 후속 제품 판정을 따로 기록했다. [Assertion Policy 교정 결과](./p4-outcome-assertion-policy-correction-result.md) · [Master 14](../rules/master/14-outcome-semantic-spec.md)

## 감사 범위와 집계 기준

전문가 원고 07의 3,348줄을 대상으로 건강·부위·증상 계열 73행과 인연·혼인·동업·갈등 계열 134행을 검색했다. 검색 결과는 사례·반례를 찾기 위한 색인이다. 건강 원자료 ⑲-A의 24개 사례 색인, 부위별 대응·판정 수준과 사례의 사후 관찰 여부를 함께 대조했다. 관계는 P8·P22·P80·P118·P123, 이혼 사례와 조건부 반례를 A I-20–22 및 B W-50·W-85·W-87–88로 대조했다. 승인된 운영 규칙, 전문가 사례, 현대 일반 해설, 분석자 추정을 구별했다. [원고 07](../source/primary/07-사주풀이예시.md) · [⑲-A 원자료](../source/health/FILUNE-19A-premium-health-evidence.md#L110) · [A I-20–22](../source/authority/A_rev182.md#L293) · [B 출판 규칙](../source/authority/B_rev38.md#L79)

P4-E/F 및 P4-G/G.1/H 결과를 구현의 타입·발행 조건과 비교했다. Master 03의 지지 관계와 Formation, Master 05의 실제 손상 및 보호, Master 08의 직접 비교·승계·만료, Master 09의 구조 실행 경계, Master 13의 확정도·장별 재사용·표현 분리를 적용했다. 아래 오류 건수는 확인한 **서로 다른 방출 계약 또는 재현된 결함**을 센다. 출생 표본에서 발생할 총 횟수나 키워드 검색 건수는 이 집계에 포함하지 않는다. [P4-E](./p4e-relationship-outcome-batch1-result.md) · [P4-F](./p4f-relationship-outcome-integration-audit-result.md) · [P4-G](./p4g-health-outcome-batch1-result.md) · [P4-G.1](./p4g1-health-outcome-reactivation-fix-result.md) · [P4-H](./p4h-health-outcome-integration-audit-result.md) · [Master 03](../rules/master/03-branch-relations-master.md) · [Master 05](../rules/master/05-sangshen-byeong-gueung-master.md) · [Master 08](../rules/master/08-luck-master.md) · [Master 09](../rules/master/09-engine-integration-spec.md) · [Master 13](../rules/master/13-reading-assembly-spec.md)

## A. Health

| 축 | 상태 | 근거와 발행 범위 |
|---|---|---|
| Baseline tendency | PARTIAL | 일간·전통 영역은 확인 가능하다. 원국에서 실제 불리 경로가 입증될 때만 비임상적 부담 바탕을 추가할 수 있다. 일반 건강 상태나 체질·평생 취약성은 도출할 근거가 없다. |
| Body-area mapping | SUPPORTED | A I-16의 대응과 ⑲-A의 일간별 증거 수준을 유지한다. 甲·丙·戊·己·辛·癸에는 승인 영역, 乙·丁·庚·壬에는 오행 수준의 소개가 가능하다. |
| Body-area burden | PARTIAL | CS-026의 손상 대상, CS-034의 일간·반복, CS-071의 해당 기능처럼 대상·실제 손상·승인 영역 연결을 함께 확인하면 가능하다. 현행 영역 배열에는 부담 의미가 없다. |
| Health burden | PARTIAL | 일간을 실제 압박하는 해로운 칠살, 해로운 재생살, 검증된 핵심 기능 손상에서 비임상적 부담 또는 어려움 가능성을 기록할 수 있다. 원국과 기간은 각각 근거가 필요하다. |
| Health problem-prone period | PARTIAL | 기간 안에서 조건이 실제 활성화되어 출처의 생활 결과와 맞으면 건강상 부담이 나타나기 쉬운 시기라는 내부 의미까지 가능하다. 독립 발병·위험도·발생일은 금지한다. |
| Health management period | SUPPORTED | 자격을 충족한 기간을 살펴볼 시기로 전달할 수 있다. CH-07에서 승인된 일정·책임 조정과 관찰 범위를 적용한다. 새 의학 처방이나 회복 기간은 출처 공백이다. |
| Body-area weakness / disease | PROHIBITED | 원고 CS-034·061의 취약 표현은 역사적 출처 맥락이고, 고객용 W-30/Q10은 약함·증상·질환 확정을 허용하지 않는다. |

**Too conservative mappings** 2개 발행 계약 및 scoped 확정도에 대한 일괄 상한 1개. **Missing source-supported outcomes** 독립적인 부위 부담 1축 및 재현된 월운 발행 누락 1건. 원국·기간 부담 의미는 앞의 두 발행 계약에 포함했다. **Renderer-only issues** 1개 통합 과제. **Prohibited items preserved** 질병명, 발병 확정·예측, 진단, 검사·치료·약물 권고, 수술, 수명·사망, 의료 위험률 및 점수·순위의 Outcome 발행을 확인하지 않았다. [Health 타입과 발행](../../lib/outcome/health/healthOutcome.ts#L21) · [⑲-A C–F](../source/health/FILUNE-19A-premium-health-evidence.md#L136) · [B W-30–35](../source/authority/B_rev38.md#L79) · [D Q10](../source/authority/D_rev155.md#L38)

**경로 적용 범위.** CS-014 및 CS-010·039·050·058·088·103·110·123·126·133의 관련 조건은 동일 사례가 건강·관계·직업 부담 중 무엇을 언급했는지와 실제 일간 압박을 함께 읽는다. 財生殺, 칠살 소생, 관살 증가, 보호 손상은 이름만으로 충분하지 않다. 필요한 칠살, 발동 전 조건부, 정지·만료는 현재 부담이 아니다. CS-026은 손상된 식신 용신의 사후 기록, CS-034는 계절 전환과 절기월 반복을 함께 설명한 사후 기록, CS-071은 손상된 火 기능의 원고 해석이다. CS-005의 적용 사례는 독립 검증 사례로 세지 않았다. CS-031의 집중·삼형, CS-058의 수화 갈등은 보조 맥락이며 단독 발행 근거는 부족하다. CS-002 단독 식신 약화, 068 년지의 건강 귀속, 단독 무근·묶임·조후, 보호 회복의 건강 개선은 각각 매핑 근거가 부족하다. 사례에서 건강, 재물, 직업이 함께 언급되더라도 각각 독립 근거를 갖고 발행해야 한다. [⑲-A C–F](../source/health/FILUNE-19A-premium-health-evidence.md#L136) · [원고 07 L1091](../source/primary/07-사주풀이예시.md#L1091) · [원고 07 L1262–1273](../source/primary/07-사주풀이예시.md#L1262) · [Master 14 Health 경로](../rules/master/14-outcome-semantic-spec.md#eligible-structural-paths)

## B. Relationship

| 축 | 상태 | 근거와 발행 범위 |
|---|---|---|
| Contact | SUPPORTED | 유효한 일지 육합·삼합에 가까운 관계의 접점 또는 변화. 같은 증거로 둘을 구별할 수 없으면 조건부 복수 해석을 유지한다. |
| Formation | PARTIAL | I-22 ①과 원고 L202–207에 새 인연이 생기기 쉬운 조건이 있다. 접점에서 실제 인연 형성 가능성을 독립 승인할 결합 조건이 필요하다. |
| Commitment | PARTIAL | I-22 ③, W-88, P8·P22·P80에 근거 후보가 있다. 성사 신호, 방향, 실제 사건은 각각의 조건이 필요하며 현행 명세에서 ③·④는 보류다. |
| Pressure | PARTIAL | 원고 L165의 갈등 가능성, P22의 불리 구조, P80의 결혼과 불화 병존이 있다. 현재 배우자궁·배우자성 또는 해당 기능의 불리 작용과 사례 근거가 연결돼야 한다. |
| Change | SUPPORTED | 일지 충에 가까운 관계·생활 자리의 변화 가능성. 합이 개입할 때 압력 약화, 실제 손해와 변화 가능성은 별개다. |
| Breakdown / ending | SOURCE_GAP | L3252–3256, L3274에 사후 사례는 있으나 관계 상태와 가중·보호·외부 맥락을 일반 판정할 운영 규칙이 없다. 충 단독 이별과 혼인·이혼 단정은 금지된다. |
| Partnership / cooperation | SOURCE_GAP | L2788·2812·2878은 동업·중요 협력 형성 및 재편을 말한다. 연애·협업을 구분하는 입력 및 선택 조건이 없다. |

**Too conservative mappings** 현행 자격이 충족된 접점·변화에서 0건. **Missing source-supported outcomes** 현행 승인 자격으로 바로 발행 가능한 누락 0건. 명세·매핑 확장 후보는 형성, 약속, 부담 3개다. **Renderer-only issues** 1개 통합 과제. **Compatibility boundary** I-21/OP-R02의 두 명식 비교는 개인 관계와 분리된다. 현행 발행은 일지 및 육친 참조와 그 개인의 평가 구간을 소비한다. 출생 성별의 명세상 적용 여부와 기혼·미혼·교제 등 실제 생활 상태는 별개의 정보다. [관계 타입·채택](../../lib/outcome/relationship/relationshipOutcome.ts#L8) · [A I-20–22](../source/authority/A_rev182.md#L321) · [B W-87–88](../source/authority/B_rev38.md#L149)

**Mapping Rule 후보.** 형성은 유효한 일지 관계, 적용 가능한 운의 역할, 현 관계 상태가 알려졌는지 여부를 입력 계약으로 구분한다. 약속 신호는 형성·기존 관계 변화·유리한 발전과 분리한다. ④의 유리한 발전은 동일 월의 승인된 유리 판정과 배우자성·상신 무손상 근거가 각각 필요하다. 부담은 실제 관계 대상에 닿는 불리 경로와 보호·완화 상태를 확인한다. 일지 충·배우자성 등장·관살혼잡의 이름만으로 갈등을 만들지 않는다. 새 인연이나 약속의 조건과 별도로 확인된 갈등이 있으면 두 fact를 보존할 후보가 된다. P80의 관찰은 이 독립성을 보여 주지만 사후 불화를 다른 고객에게 예측할 자격은 주지 않는다. 연애·가까운 관계와 업무 협력은 별도의 domain/context subtype 후보로 두고, 직업·사업 해설의 접점을 연애로 변환하지 않는다. [원고 07 L202–208](../source/primary/07-사주풀이예시.md#L202) · [L602](../source/primary/07-사주풀이예시.md#L602) · [L1849](../source/primary/07-사주풀이예시.md#L1849) · [L2788–2812](../source/primary/07-사주풀이예시.md#L2788) · [L3252–3256](../source/primary/07-사주풀이예시.md#L3252)

### Source Evidence Table

| Domain | Current Semantic | Source-Supported Meaning | Current Too Conservative? | Classification | Evidence |
|---|---|---|---|---|---|
| Health | `traditional_body_correspondence` | 전통 영역 참조와 일간별 근거 수준 | 아니오 | NO_CHANGE | [A I-16](../source/authority/A_rev182.md#L180) · [⑲-A B](../source/health/FILUNE-19A-premium-health-evidence.md#L122) |
| Health | `structural_health_attention` | 자격 있는 현재 경로에서 비임상적 부담 가능성을 독립 기록 | 예 | SEMANTIC_EXPANSION_REQUIRED | [타입](../../lib/outcome/health/healthOutcome.ts#L30) · [명세](../rules/master/14-outcome-semantic-spec.md#health-source-contract) |
| Health | `health_attention_period` | 해당 기간에 건강상 어려움이나 부담이 나타날 수 있음 | 예 | SEMANTIC_EXPANSION_REQUIRED | [발행](../../lib/outcome/health/healthOutcome.ts#L175) · [⑲-A E](../source/health/FILUNE-19A-premium-health-evidence.md#L176) |
| Health | 기간 전체 `contextual` 상한 | 실제 발동·확정 조건과 결과의 가능성 표현을 독립 보존 | 예. 확정된 구조의 기간도 범위만으로 낮춘다 | SEMANTIC_EXPANSION_REQUIRED | [확정도](../../lib/outcome/health/healthOutcome.ts#L193) · [Master 14](../rules/master/14-outcome-semantic-spec.md#outcome-assertion-policy) |
| Health | 영역 배열 | 입증된 특정 전통 영역 부담. 조건부 월은 출판 시 부위 생략 | 예 | SEMANTIC_EXPANSION_REQUIRED | [⑲-A C-1](../source/health/FILUNE-19A-premium-health-evidence.md#L138) · [B W-35](../source/authority/B_rev38.md#L86) |
| Health | 월운 창 보호 상실 | 기존 Health fact가 전체 체인과 창에 동일하게 존재 | 예. 확인된 월운 fact 누락 | MAPPING_EXPANSION_REQUIRED | [어댑터](../../lib/outcome/health/fromJudgment.ts#L18) · [재현](../../../scripts/audit-health-window-p4k.mjs) |
| Health | 현재 부담 게이트 | Formation·독립 상신 손상의 직접 판정과 양성 fixture, 별도 조건부 trigger payload | 자격을 입증할 검증이 먼저 필요 | MAPPING_EXPANSION_REQUIRED | [P4-H fixture coverage](./p4h-health-outcome-integration-audit-result.md#j-fixture-coverage) · [Master 14](../rules/master/14-outcome-semantic-spec.md#eligible-structural-paths) |
| Health | 회복·별도 부담 경로 미구현 | 독립 회복·조후·단독 무근/식신 약화에는 직접 발행 근거 부족 | 아니오 | SOURCE_GAP | [⑲-A D](../source/health/FILUNE-19A-premium-health-evidence.md#L158) |
| Health | 승인 A I-16 영역 매핑 | 이미지의 눈 木과 원고 丙(火)은 영역 출처가 다름. 승인표를 유지 | 아니오 | SOURCE_CONFLICT | [⑲-A B](../source/health/FILUNE-19A-premium-health-evidence.md#L122) |
| Health | 고객용 주의 문구 미연결 | B의 전통 부위 및 살펴볼 시기 서술 | 고객 출력 미연결 | RENDERER_ONLY | [B CH-7](../source/authority/B_rev38.md#L255) |
| Health | 임상 사건 없음 | 질병·진단·검사·치료·약·수술·수명의 배제 | 아니오 | PROHIBITED | [D Q10](../source/authority/D_rev155.md#L38) · [Master 14 Health Level 4](../rules/master/14-outcome-semantic-spec.md#health-source-contract) |
| Relationship | Palace context/relation, significator, contact/change | 상대 상태를 전제하지 않는 자리·참조와 조건부 접점·변화 | 아니오 | NO_CHANGE | [P4-F](./p4f-relationship-outcome-integration-audit-result.md#c-outcome-coverage) · [W-87](../source/authority/B_rev38.md#L149) |
| Relationship | Contact/change만 발행 | I-22 ① 형성, ③ 큰 약속, 별도 압력. 각각 다른 경로 조건 | 현재 접점 자체는 적정. 독립 축 매핑 필요 | MAPPING_EXPANSION_REQUIRED | [A I-22](../source/authority/A_rev182.md#L325) · [P22·P80](../source/authority/A_rev182.md#L304) |
| Relationship | 유리한 발전 보류 | I-22 ④ 동일 월의 유리 판정과 대상·보호 무손상 | 아니오 | SOURCE_GAP | [Master 14](../rules/master/14-outcome-semantic-spec.md#exclusions-and-deferred-gates) |
| Relationship | 종료·동업 신호 미구현 | 조건이 복합적인 사후 이혼 및 현대 협력 해설. 각각 별도 매핑과 사례 검증 필요 | 아니오 | SOURCE_GAP | [원고 07 L2812](../source/primary/07-사주풀이예시.md#L2812) · [L3252](../source/primary/07-사주풀이예시.md#L3252) |
| Relationship | 합의 보편 개선·충의 보편 종료 추론 없음 | 같은 합에서 혼인과 불화, 충에서 혼인·변화·종료 사례 모두 존재 | 아니오 | SOURCE_CONFLICT | [A 사례 비교](../source/authority/A_rev182.md#L300) · [원고 07 L3256](../source/primary/07-사주풀이예시.md#L3256) |
| Relationship | 현재 생활 상태 추정 없음 | 실제 사용자 상태 입력 또는 조건부 문장만 허용 | 아니오 | PROHIBITED | [W-88](../source/authority/B_rev38.md#L150) |
| Relationship | 고객용 접점·변화 문구 미연결 | 같은 확정도·기간을 읽기 쉬운 말로 전달 | 고객 출력 미연결 | RENDERER_ONLY | [W-87–88](../source/authority/B_rev38.md#L149) |

### Assertion Policy 직접 검사

| 위반 종류 | Health | Relationship |
|---|---:|---:|
| Source-supported result weakened to structural-only | 2 | 0 |
| Confirmed result weakened to vague possibility | 1 | 0 |
| Confirmed axis hidden by deferred axis | 0 | 0 |
| Mixed outcome collapsed | 0 | 0 |
| Unsupported outcome invented | 0 | 0 |

Health의 2건은 원국 부담과 기간 부담의 방출 분기다. 확정도 1건은 `scope !== 'natal'`에 따른 일괄 `contextual` 상한이다. 검증 fixture의 월운은 `operating`, `unfavorable`, 정확한 기간을 가지고도 일괄 상한을 받는다. 확정할 것은 자격과 부담 조건이고, 건강 사건 발생은 가능성으로 남는다. 월운 창에서의 추가 누락 1건은 독립 축의 deferred로 일어난 억제가 아니라 상위 입력 전달 누락이므로 표 바깥에 기록했다. 현행 조립은 확정도와 ID를 전달하므로 표현 손실 지점은 Outcome 발행과 어댑터다. Relationship 코드에서 유효 관계마다 ID를 만들며 상반 경로를 한 결과로 합치는 분기는 발견되지 않았다. P4-F의 같은 scope 접점·변화 동시 양성 fixture는 0건이다. 새 형성·갈등 혼합은 아직 데이터로 검증할 수 없다. [Health 확정도](../../lib/outcome/health/healthOutcome.ts#L175) · [Health Assembly](../../lib/reading/healthUnits.ts) · [Relationship Assembly](../../lib/reading/relationshipUnits.ts) · [P4-F 검증](../../../scripts/verify-relationship-outcome-integration-p4f.mjs)

## C. 고객 용어와 Renderer

KO/JA/EN 구현은 `PersonalityRenderInput`을 소비한다. CH-06/07 OutcomeFact와 Assembly unit을 고객 본문으로 옮기는 연결은 세 언어 모두 없다. 따라서 Health·Relationship Outcome 고객 문장의 직접 명리 용어 노출은 **0건, 출력 표본 0건**이다. 두 영역 renderer의 표현 강도는 현행 고객 문장으로 평가할 수 없다. KO/JA/EN Personality 검증 P3-B·D·F는 통과했다. 기본 결과 화면의 일반 설명과 차트 UI는 별개로 고객에게 노출된다. KO 설명의 ‘대운’과 JA 설명의 ‘大運’, KO/JA 운 카드의 장기·연간·월간 명리 명칭을 확인했다. 요청의 0 기준을 전체 고객 UI에 적용하면 미충족이다. 일반 UI의 기존 문구는 이번 감사에서 변경하지 않았다. [Personality renderer](../../lib/personality/render/renderPersonality.ts) · [선택 주제 화면](../../components/result/SelectedTopicReading.tsx) · [레거시 결과 설명](../../components/BasicChartResult.tsx#L90) · [KO](../../i18n/ko.ts#L9) · [JA](../../i18n/ja.ts#L12) · [EN](../../i18n/en.ts#L9)

제한 문구 검색에서 영어 `only signal` 등과 같은 문구의 유무뿐 아니라 타입과 분기의 효과도 확인했다. Health의 ‘주의’는 W-30 고객 표현에는 정당하지만 교정된 내부 생활 의미를 대신하면 과도하다. ‘전통 대응’은 원국의 승인 영역에 적절하며 실제 부담 대상의 독립 기록까지 대체할 수 없다. Relationship의 ‘접점/변화 가능성’은 W-87의 일반 접점 및 변화에서 정당하다. 이를 향후 I-22 ①–④와 개별 부담을 모두 처리하는 공통 상한으로 사용하면 매핑 손실이 된다. 사건 단정 금지, 조건부 월의 부위 생략, 보호 유지·정지·만료의 현재 발행 제한은 보존한다. 고객 표현 연결 시 ‘장기적인 흐름’, ‘올해’, ‘이 시기’, ‘○월’을 사용해 원래 기간과 확정도를 전달한다. [Master 14](../rules/master/14-outcome-semantic-spec.md) · [B W-30–35](../source/authority/B_rev38.md#L79) · [B W-87–88](../source/authority/B_rev38.md#L149)

## D. Required fixes

| 우선순위 | 후속 범위와 합격 기준 |
|---|---|
| P0 | Health의 승인 경로에서 내부 부담 의미를 보존한다. 후보 `health_burden`, `health_burden_period`를 독립 의미로 검토한다. 동일 결과·대상·기간을 `health_problem_prone_period`로 중복 발행하지 않는다. 확정된 발동 사실과 비임상적 가능성을 분리하고, reduced·조건부·만료는 원천 상태를 유지한다. |
| P0 | Health 월운 어댑터가 해당 평가의 직전 상위 기능 증거를 전달하도록 보완한다. P4-G.1 동일 체인의 전체 입력과 월운 창 입력에서 같은 fact 및 CH-10 배치를 검증한다. 조건이 살아나지 않았을 때는 현재 발행 0건을 유지한다. |
| P1 | 근거가 있는 부위의 부담을 `body_area_burden` 후보로 분리한다. Health의 일반 부담, 부위, 기간, Money/Work 난제는 독립 검증한다. 독립 상신 손상 및 Formation의 양성 fixture 확보는 발행 확대에 선행한다. |
| P1 | Relationship 형성·큰 약속·압력을 I-22/OP-R03과 사례·반례로 나눠 매핑한다. 접점 결과는 별도로 유지한다. 기존 관계의 종료, ④ 유리 발전, 업무 협력은 추가 자료와 입력 계약을 먼저 확인한다. |
| P2 | 승인된 Health·Relationship 결과를 KO/JA/EN 고객 문장에 연결한다. B의 출판 제약과 금지 용어를 검증하고, 전체 고객 UI까지 적용할 경우 기존 화면의 용어를 별도로 점검한다. |

### 재현 및 작업 범위

P4-G.1의 기존 P1-Fix E Judgment 체인에서 보호 상실 후 한 건이 `health_attention_period`로 발행되고 CH-10에 배치됐다. 같은 평가 스냅샷과 실제 월운 창의 데이터 형태를 사용하면 월운 창에서는 **0건**이었다. 월운 스냅샷에는 상위 증거가 있고, Health 어댑터는 해당 필드를 전달하지 않는다. 이 재현은 기존 정책 fixture를 사용하는 어댑터 시험이며, 출생 날짜에서 보호 상실을 새로 판정한 시험과 구별한다. CS-126의 P4-J 경계와는 별도의 현상이다. 기존 P4-G.1 및 KO/JA/EN Personality 감사 재실행은 통과했다. [P4-K 재현 스크립트](../../../scripts/audit-health-window-p4k.mjs) · [P4-G.1](./p4g1-health-outcome-reactivation-fix-result.md) · [P4-J 결과](./p4j-money-outcome-integration-audit-result.md)

작업 시작 시 이미 존재한 P4-J 변경을 포함해 비교한 결과 `src/lib changes = 0`이다. Master 14 해시도 일치한다. P4-K 산출물은 이 문서와 재현 스크립트다. 후속 순서는 Health/Relationship 보강, P4-J의 Judgment 경계 수정과 Money 재감사, 그 뒤 Event Timing Layer다.
