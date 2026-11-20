# FILUNE P4-F Relationship Outcome Integration Audit

## A. 최종 판정

**`RELATIONSHIP_OUTCOME_BATCH1_COMPLETE`**

감사 대상은 P4-E Batch 1의 원국 자리, 육친 significator, 제한된 접점·변화 신호와 범위·시기·출처 전달이다. 새 판정 규칙이나 애플리케이션 코드는 추가하지 않았다. [14 Outcome](../rules/master/14-outcome-semantic-spec.md) · [13 Reading Assembly](../rules/master/13-reading-assembly-spec.md) · [P4-D](./p4d-outcome-semantic-source-audit-result.md) · [P4-E](./p4e-relationship-outcome-batch1-result.md) · [P4-C](./p4c-reading-assembly-integration-audit-result.md)

## B. Actual integration

| 경로 | 검증 |
|---|---|
| Canonical | 기존 실제 출생 fixture로 계산. 확정 일지와 원국 Judgment 참여자의 branch 일치 |
| Judgment | 같은 원국에서 확인한 십성·역할·runtime, 역할별 현재 기능과 RelationFact를 역추적 |
| Luck | 세운·대운·절기월의 원천 scope와 기간 참조. CS-005 절기월 12개와 실제 일진 snapshot 포함 |
| Relationship Outcome | 검증된 일지 참가 관계와 Formation ID 재사용. 같은 입력의 반복 및 배열 역순에서도 동일 결과 |
| ReadingAssembly | 위 사실을 명시적 입력으로 조립. 기존 Personality도 함께 조립하고 무료·유료 및 반복 실행 비교 |

| Fixture 요구 | 관측 및 결과 |
|---|---|
| A 원국 자리 | CS-127은 원국 자리와 상징 역할을 확인. 승인된 원국 자리 합·충·Formation 신호 0 |
| B 원국 접점 | CS-005의 일지 반합은 원국 구조 맥락 |
| C 원국 변화 | CS-126의 일지 충은 원국 구조 맥락 |
| D 운 접점 | CS-005의 월운 육합·삼합, CS-127의 세운 육합. CS-005의 2024년 실제 대운 삼합 |
| E 운 변화 | CS-005 세운·월운과 CS-127 월운의 일지 충 |
| F 만료 | CS-005 1월 접점의 동일한 실제 snapshot을 종료 경계에서 다시 읽음. 동일 ID와 출처 유지, 현재 조립 0 |
| G 정지·비활성 | CS-127의 원국 significator 2건은 실제 stopped runtime. 지지 합·충 자체가 stopped/inactive가 되는 실제 관계 사례는 `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |

A의 I-15, I-22, OP-R01/R03 및 OP-Z10/11과 B의 W-50~56, W-87~89, B-6, W-99를 적용했다. Master 03의 직접 관계·Formation·형파해, Master 08의 OP-L01/L02 및 LK-090~092 범위, Master 09의 Runtime→CurrentFunction 경계를 대조했다. 육합은 접점/변화의 조건부 출처이며, 합화·정지·유리 분류를 만들지 않는다. 충은 구조 변화에 한정한다. 형·파·해의 원천 관계는 Judgment에 남고 독립 관계 신호로 승격되지 않는다. [Authority A](../source/authority/A_rev182.md) · [Authority B](../source/authority/B_rev38.md) · [Master 03](../rules/master/03-branch-relations-master.md) · [Master 08](../rules/master/08-luck-master.md) · [Master 09](../rules/master/09-engine-integration-spec.md)

## C. Outcome coverage

| 의미 | 결과 |
|---|---|
| Relationship palace | PASS · 확정 일지 원천 일치 |
| Significator | PASS · 확인된 원국 천간 십성 참조. 실제 기능과 역할 이력을 구분 |
| Natal contact | PASS · 원국 반합의 contextual 구조 |
| Natal change | PASS · 원국 충의 contextual 구조 |
| Luck contact | PASS · scope별 육합·삼합의 조건부 신호 |
| Luck change | PASS · scope별 충의 조건부 신호 |
| Commitment | DEFERRED |
| Favorable development | DEFERRED |
| Compatibility | NOT_IMPLEMENTED |

## D. Provenance

| 지표 | 건수 |
|---|---:|
| OutcomeFacts | 29 |
| With provenance | 29 |
| Orphan | 0 |
| Duplicate IDs | 0 |
| Wrong scope reference | 0 |

실제 출생 3건을 4개의 평가 입력으로 실행했다. 관계 자리 4건, significator 12건, 원국 접점 맥락 2건, 원국 충 맥락 1건, 운 접점 5건, 운 변화 3건을 확인했다. 운의 반합 구조 맥락 2건은 접점·변화 시기 수치에서 제외했다. 형·파·해 원천 관계 39건의 독립 신호 생성은 0건이다.

RelationFact 및 Formation은 원래 scope에서 역추적했다. 참여자는 직접 입력 ID 또는 해당 Formation pool과 대조했다. 원국 significator는 Canonical 계산값, 동일 entity의 Judgment 십성 및 Runtime과 대조했다. 역할 ID는 해당 entity의 역할 원장에, 역할별 상태·함수는 현재 역할 출력에 연결했다. 운 신호의 출처는 평가 snapshot ID와 유효구간, 실제 관계 ID다. 관계에 연결된 별도 LuckEffect가 없으면 효과 ID를 합성하지 않는다.

## E. Lifecycle

| 항목 | 실측 |
|---|---|
| Active | PASS · 평가 시각과 유효구간이 일치한 현재 원국·운 신호 |
| Reduced | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` · 실제 대상 약화 0건. P4-E의 약화 격리 회귀에서 conditional 유지 확인 |
| Stopped / inactive | PASS · 실제 원국 significator 정지 2건을 기능 비활성으로 보존. 실제 지지 관계 정지/비활성은 위 G의 fixture 제한 적용 |
| Expired | PASS · CS-005 1월의 종료 시각에서 동일 사실이 `expired`, `currentlyEffective=false` |
| Inherited | PASS · 하위 관계표에 보이는 상위 일지 쌍을 원래 범위의 사실로 유지. 관계표의 반복 4건에서 하위 관계 ID로 중복 출력 0 |
| Current leakage | 0 |

CS-005와 CS-127에서 같은 기준 시각에 세운·월운의 접점과 변화가 함께 유효했고 각각의 관계·scope를 유지했다. **같은 원천 snapshot**에서 두 신호가 함께 생성되는 사례는 `NOT_TESTABLE_WITH_CURRENT_FIXTURE`다. 현행 원장에 해당 일지와 현재 운 참가자가 있는 관계만 해당 운의 신호 후보가 되며, 다른 범위에서 시작된 신호의 scope를 바꿔 재발행하지 않는다.

## F. Assembly

| 항목 | 결과 |
|---|---|
| CH-06 readiness | PARTIAL |
| CH-09 reuse | 동일 세운 사실 2건의 timing 참조와 동일 월운 사실 6건의 context 참조 |
| CH-10 reuse | 동일 월운 사실 6건의 timing 참조 |
| Same fact reuse | PASS · 최초 사실 ID·출처·확정도·기간과 동일 |
| Duplicate conclusion | 0 |
| B-6 role mismatch | 0 |
| Day leakage | 0 · 실제 일진은 내부 엔진 범위 |
| customerRenderable | false · 전체, 무료 및 모든 유료 장 |

## G. Free / Premium

| 지표 | 건수 |
|---|---:|
| 무료 대운 / 세운 / 월운 / 일진 관계 누출 | 0 / 0 / 0 / 0 |
| 무료 관계 Outcome 원국 단위 | 0 |
| 공통 원국 관계 Outcome 단위 | 0 |
| 공통 단위의 semantic / certainty / provenance mismatch | 0 / 0 / 0 |

현행 무료 조립에서 이 관계 Outcome 단위를 공유할 배치는 없다. 위 mismatch 수치는 공통 단위가 없는 현재 출시 범위에 해당한다.

## H. Safety / isolation

| 금지 출력 | 건수 |
|---|---:|
| Marriage / divorce / affair prediction | 0 / 0 / 0 |
| Fated partner / partner quality / perfect match | 0 / 0 / 0 |
| Compatibility / score / ranking / probability | 0 / 0 / 0 / 0 |
| Life-state assumption / aggregate relationship polarity | 0 / 0 |
| RelationshipStyle provenance / locale customer text | 0 / 0 |
| Runtime LLM / Relationship Renderer | 0 / 0 |

입력을 동결하고 실행 전후 값을 대조했다. Judgment·Luck·Personality와 기존 조립 결과 mutation은 각각 0건이다. Judgment·Personality에서 Outcome 역방향 import가 없고 Outcome의 Canonical·십성·관계·운 재계산 호출도 0건이다. 작업 전후 파일 해시로 애플리케이션 코드, Health 계약, Work·Money·Selection 변경 0건을 확인했다.

## I. Regression

| 항목 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A / B / C / D / E / F / G | PASS |
| P3-A / B / C / D / E / F | PASS |
| P4-B | PASS |
| P4-C | PASS |
| P4-E | PASS |
| P4-F | PASS |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment 회귀는 오래된 스크립트가 사용하는 문서 경로를 임시 사본에서 연결해 실행했다. 실제 계산 파이프라인은 기존 입력·문서 버전을 사용하고, 감사 대조는 현행 A rev182 및 B rev38을 사용했다. [P4-F 검증 스크립트](../../../scripts/verify-relationship-outcome-integration-p4f.mjs)

## J. 남은 상태와 다음 Batch

| 상태 | 항목 |
|---|---|
| FAIL | 0 |
| PARTIAL | CH-06 Batch 1 |
| DEFERRED | 약속 성사, 유리한 관계 발전 시기, 관계 결과 |
| NOT_IMPLEMENTED | 궁합, 고객 Renderer |
| TECH_DEBT | 실제 지지 관계의 정지·약화 및 같은 원천 scope의 접점·변화 공존을 재현하는 fixture 공백 |
| UPSTREAM_REGRESSION | 0 |

| 후보 | Source readiness | 기존 엔진 의존성 | 고객 가치와 구현 위험 |
|---|---|---|---|
| Health 제한 subset | 보강 감사 READY. A I-16 및 실제 검증된 구조 경로 | Canonical 일간과 scoped 기능·대상·lifecycle. 월 시기에는 W-35의 독립 근거 필요 | CH-7 전통 대응과 구조 설명부터 제공 가능. 의료·취약성 해석으로 읽히지 않도록 대응·시기·표현의 근거를 엄격히 유지 |
| Money 제한 subset | OUT-MONEY-01/02의 식신생재와 감당·보유 제약 | 현재 식신생재 경로, 감당·경쟁·보호와 실제 제약 확인 | CH-5에 형성·유지의 구조 설명 제공 가능. 구조를 수입·자산·손실 또는 계약·사업 시기로 추론할 위험이 있어 미지원 입력을 먼저 확인 |

다음 후보는 **Health 전통 대응과 검증된 구조 참조**다. Health 보강 감사가 승인 범위를 확정했고, 첫 배치를 주의 시기의 일반화 없이 시작할 수 있다. Money는 현행 감당·보호 증거의 입력 가용성을 확인한 뒤 진행한다. Work는 `SOURCE_GAP`을 유지한다. 궁합은 개인 감정서 v1 이후 별도 소스 감사와 구현 트랙으로 남긴다. [P4-D 결과](./p4d-outcome-semantic-source-audit-result.md) · [Health 보강 감사](./p4d-health-outcome-supplement-audit-result.md)
