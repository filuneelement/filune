# P4 Personality Coverage Audit

[고객 장 계약](../rules/master/18-customer-chapter-content-contract.md) · [성향 지식 스키마](../rules/master/12-personality-knowledge-schema.md) · [재현 스크립트](../../../scripts/verify-personality-chapter-coverage-p4.mjs)

기존 Personality Renderer 회귀 fixture A–I·O·P·Q 12개(역할·보호·갈등·미상 위치를 포함하는 구조 입력)와 Canonical 출생 회귀 CS-005·126·127 3개를 사용했다. 후자는 기대 천간·지지 4주를 비교한 뒤 Personality를 계산했다. 같은 일주를 공유하는 구조 fixture가 있어 분포 추정에는 사용하지 않는다. 행은 서로 다른 검증 맥락이며 인구 표본을 뜻하지 않는다.

- **✓** 해당 슬롯을 직접 지지하는 provenance가 존재한다. 각 Fact의 원천 확정도는 유지한다.
- **C** 근거 후보. 순위·인과 연결·조건 등 해당 슬롯의 완결 요건이 남아 있다. 두 개의 CH-03 단서가 같은 Fact를 가리킬 수 있다. 각각을 새 의미나 완성 루프로 세지 않는다.
- **K** KNOWLEDGE_GAP. 해당 fixture의 승인된 지식에서 독립적으로 연결할 수 있는 구조화 슬롯 근거가 없다. 특히 수용·적응, 협업, 촉발·행동의 범위는 명시적으로 검토한 지식 항목에 제한된다.
- **D** ADAPTER_GAP. 승인된 슬롯 근거까지 확인됐지만 Fact·provenance로 빠져나오지 않은 경우. 이번 검토에서 확인된 일주 decisionStyle·internalConflict·expressionPattern·shadowPatterns는 이미 Fact로 나와 이 코드에 해당하지 않았다.
- **A** ASSEMBLY_GAP. Fact가 있지만 기존 무료 Assembly에 슬롯 근거가 보이지 않았거나 갈등 연결이 없었던 경우. 본문 아래 기준선에서 별도로 표시했다.
- **S** SOURCE_GAP. 발행 수준의 적용·과사용·결과·반복 인과를 승인할 연결 근거가 없다. 후보 존재가 인과를 확정하지 않는다.
- **N** NOT_APPLICABLE. 이 명식에서 실제 연결된 이중성·긴장이 확인되지 않아 해당 슬롯을 요청하지 않는다.

## 투영 보강

기존 NatalPersonalityResult의 Fact와 Conflict를 Assembly에 원국 슬롯 근거로 투영한다. 기존 무료 경로에서 보이지 않던 일간·일주 기본 기질, 관계·내부 판단 단위, 일주/위치 긴장, 일 방식 후보를 해당 장에 귀속한다. 일주 자료의 characteristicExpression은 승인된 expressionPattern으로 표현되고, stressResponse는 현행 일간·십성에 있다. 일주에 독립적으로 승인된 behaviorPattern이나 stressResponse 필드는 없다. 승인된 일주 shadowPatterns 가운데 명시된 촉발·행동·조건·결과만 해당 문단의 후보에 쓰며, 필드 별칭으로 새 Fact를 만들지 않는다.

강점은 분리된 출처 프로필과 원천 ID를 남기고 primary/secondary를 선택하지 않는다. CR-03의 원인·결과 연결과 행동이 지속·반복되는 기제는 독립 근거가 필요하다. 확보된 조건·반응을 연결해 하나의 역사나 두 개의 완성 루프로 세지 않는다. 자료에 확정/맥락 Fact가 있더라도 글자 수 충족은 별도 검증이다. 세 장 모두 완성본 발행에는 문단 plan과 renderer가 필요하다.

## CustomerContext

단일 UI 결과 상태 → singleResultCopy → customerContextFromSingleResult → ReadingAssemblyInput.customerContext → Assembly.customerReadingContext. 제품 진입점 readBirthChart와 이벤트 결과 preparation도 선택 Context를 전달할 수 있다. 값은 allowlist로 확인하고 이전 job-seeking/business-owner를 이관한다. 모르는 값, 이름·질문·기타 knownFacts는 상태로 투영하지 않는다. student는 향후 lifeStage의 명시 입력만 사용한다. 경쟁 장면 선택은 target별 context 후보와 mapping이 허용한 장면의 교집합이다. Work target에서 사업자 수익 배분을 출력할 수 없고, Study에서 학생·재직이 공존해도 학업 장면만 선택한다. 이벤트 자격과 Judgment·Outcome은 이 어댑터에서 수정되지 않는다.

## Fixture별 커버리지

### CR-01

| Fixture | coreNature | externalExpression | internalDecisionStyle | informationAdaptationStyle | relationshipSocialExpression | stressResponse | internalContradiction |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A 丙寅 | ✓ | ✓ | ✓ | K | ✓ | ✓ | N |
| B 甲寅 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| C 甲子 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| D 甲寅 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| E 甲寅 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| F 甲寅 | ✓ | ✓ | ✓ | ✓ | ✓ | K | N |
| G 甲寅 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| H 甲寅 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| I 甲寅 | ✓ | ✓ | ✓ | K | ✓ | K | N |
| O 甲寅 | ✓ | ✓ | ✓ | K | ✓ | K | N |
| P 癸亥 | ✓ | ✓ | ✓ | K | ✓ | ✓ | ✓ |
| Q 戊午 | ✓ | ✓ | ✓ | ✓ | ✓ | K | ✓ |
| CS-005 戊子 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | N |
| CS-126 乙丑 | ✓ | ✓ | ✓ | K | ✓ | K | N |
| CS-127 辛未 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 직접 / 후보 | 15 / 0 | 15 / 0 | 15 / 0 | 10 / 0 | 15 / 0 | 4 / 0 | 9 / 0 |

### CR-02

| Fixture | primaryStrength | secondaryStrength | problemSolving | socialCollaboration | workApplication | overuseRisk |
| --- | --- | --- | --- | --- | --- | --- |
| A 丙寅 | C | C | ✓ | ✓ | S | S |
| B 甲寅 | C | C | ✓ | ✓ | C | S |
| C 甲子 | C | C | K | K | S | S |
| D 甲寅 | C | C | ✓ | ✓ | C | S |
| E 甲寅 | C | C | ✓ | ✓ | C | S |
| F 甲寅 | C | C | ✓ | ✓ | C | S |
| G 甲寅 | C | C | ✓ | ✓ | C | S |
| H 甲寅 | C | C | ✓ | ✓ | C | S |
| I 甲寅 | C | C | ✓ | ✓ | C | S |
| O 甲寅 | C | C | ✓ | ✓ | C | S |
| P 癸亥 | C | C | K | ✓ | S | S |
| Q 戊午 | C | C | K | ✓ | S | S |
| CS-005 戊子 | C | C | ✓ | ✓ | C | S |
| CS-126 乙丑 | C | C | ✓ | ✓ | C | S |
| CS-127 辛未 | C | C | ✓ | ✓ | C | S |
| 직접 / 후보 | 0 / 15 | 0 / 15 | 12 / 0 | 14 / 0 | 0 / 11 | 0 / 0 |

### CR-03

| Fixture | trigger | internalResponse | judgment | behavior | result | repetitionMechanism |
| --- | --- | --- | --- | --- | --- | --- |
| A 丙寅 | ✓ | C | C | ✓ | S | S |
| B 甲寅 | K | C | C | K | S | S |
| C 甲子 | K | C | C | K | S | S |
| D 甲寅 | K | C | C | K | S | S |
| E 甲寅 | K | C | C | K | S | S |
| F 甲寅 | K | C | C | K | S | S |
| G 甲寅 | K | C | C | K | S | S |
| H 甲寅 | K | C | C | K | S | S |
| I 甲寅 | K | C | C | K | S | S |
| O 甲寅 | K | C | C | K | S | S |
| P 癸亥 | ✓ | C | C | ✓ | S | S |
| Q 戊午 | K | C | C | K | S | S |
| CS-005 戊子 | ✓ | C | C | ✓ | S | S |
| CS-126 乙丑 | K | C | C | K | S | S |
| CS-127 辛未 | ✓ | C | C | ✓ | C | S |
| 직접 / 후보 | 4 / 0 | 0 / 15 | 0 / 15 | 4 / 0 | 0 / 1 | 0 / 0 |

### 기준선의 ASSEMBLY_GAP · 기존 무료 근거 누락 또는 갈등 링크 부재

- A 丙寅 · CR-01/coreNature
- B 甲寅 · CR-01/coreNature, CR-01/internalContradiction, CR-02/workApplication
- C 甲子 · CR-01/coreNature, CR-01/internalContradiction
- D 甲寅 · CR-01/coreNature, CR-01/internalContradiction, CR-02/workApplication
- E 甲寅 · CR-01/coreNature, CR-01/internalContradiction, CR-02/workApplication
- F 甲寅 · CR-01/coreNature, CR-02/workApplication
- G 甲寅 · CR-01/coreNature, CR-01/internalContradiction, CR-02/workApplication
- H 甲寅 · CR-01/coreNature, CR-01/internalContradiction, CR-02/workApplication
- I 甲寅 · CR-01/coreNature, CR-02/workApplication
- O 甲寅 · CR-01/coreNature, CR-02/workApplication
- P 癸亥 · CR-01/coreNature, CR-01/internalContradiction
- Q 戊午 · CR-01/coreNature, CR-01/internalContradiction
- CS-005 戊子 · CR-01/coreNature, CR-02/workApplication
- CS-126 乙丑 · CR-01/coreNature, CR-02/workApplication
- CS-127 辛未 · CR-01/coreNature, CR-01/internalContradiction, CR-02/workApplication

PASS · 15 fixtures, provenance, product invariance, reordered inputs, context validation and target routing
