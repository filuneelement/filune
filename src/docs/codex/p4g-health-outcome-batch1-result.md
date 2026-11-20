# FILUNE P4-G Health Outcome Semantic Engine — Batch 1

**`READY_FOR_HEALTH_OUTCOME_AUDIT`**

## 범위

| 항목 | 결과 |
|---|---|
| 전통 신체 대응 | Canonical 일간 10/10. A I-16 승인 표와 ⑲-A 근거 수준을 구분했다. |
| 구조적 건강 주의 | 원국의 해로운 칠살 경로와 유효 용신 제어를 기존 P1 Judgment 정책 fixture에서 확인했다. 상신은 정확한 대상과 유효한 기능 손상 근거를 요구한다. |
| 대운·세운·월운 주의 | Judgment 정책 fixture로 각 scope의 양성 경로, 원본 기간, 만료와 장 간 참조를 확인했다. |
| 실제 출생 통합 | CS-005의 Canonical → Judgment → Luck → Health Outcome → Reading Assembly를 실행했다. 12절기월 경계는 기존 snapshot과 일치했다. 이 실행의 Health 출력은 전통 대응 1건이다. |
| Health relief | DEFERRED |
| 질병·의료 권고 | PROHIBITED |

Health adapter는 기존 PatternContext, 역할·현재 기능, Runtime, ActualStructuralFunction, 관계·운 효과 및 통근·Formation 근거를 읽는다. 財生殺의 관계 존재만으로는 결과가 생기지 않는다. 상신 제어와 Formation 발동의 독립 양성 경로는 이번 fixture에서 확인하지 못했다. [14 Health Source Contract](../rules/master/14-outcome-semantic-spec.md#health-source-contract) · [P4-D 보강 감사](./p4d-health-outcome-supplement-audit-result.md)

## 일간별 근거

| 일간 | 근거 수준 | 과잉 구체화 |
|---|---|---:|
| 甲 | direct-source-specific | 0 |
| 乙 | element-level-only | 0 |
| 丙 | direct-source-specific | 0 |
| 丁 | element-level-only | 0 |
| 戊 | direct-source-specific | 0 |
| 己 | direct-source-specific | 0 |
| 庚 | element-level-only | 0 |
| 辛 | direct-source-specific | 0 |
| 壬 | element-level-only | 0 |
| 癸 | direct-source-specific | 0 |

## Provenance 및 lifecycle

| 항목 | 측정 |
|---|---:|
| 대표 Health facts | 9 |
| 근거 포함 | 9 |
| Upstream orphan | 0 |
| 중복 ID | 0 |
| Scope 불일치 | 0 |
| 활성 구조 facts | 4 |
| reduced → confirmed 승격 | 0 |
| stopped/inactive 현재 유입 | 0 |
| 발동 전 조건부 confirmed 유입 | 0 |
| 만료 재실행 | 3 |
| 만료 조립 유입 | 0 |
| 가짜 회복·개선·relief | 0 |

전통 대응에는 지식 출처를 보존한다. 구조 fact에는 Judgment scope와 관계·역할·관련 운 효과 ID를 보존한다. conditionId와 최초 관계 ID로 동일 경로를 연결한다. 하위 scope 승계 상태는 확인된 증거를 이력으로 유지하며 자체 발동 근거가 있는 구간에 timing fact를 생성한다. 당시 유효 구간에서 이미 평가된 snapshot은 만료 이력으로 읽을 수 있다. 동일 입력의 재실행과 역할·관계·효과 배열의 역순에도 의미와 근거는 동일했다. [P4-G 검증](../../../scripts/verify-health-outcome-p4g.mjs)

## Reading Assembly

| 항목 | 결과 |
|---|---|
| CH-07 | PARTIAL |
| CH-08 | 대운 fact 재사용 |
| CH-09 | 세운 timing 및 월 context에서 원본 fact 재사용 |
| CH-10 | 절기월 timing에서 원본 fact 재사용 |
| 동일 fact 재사용 | 대운·세운·월운 3건에서 ID·근거·확정도 일치 |
| Free timing 노출 | 대운·세운·월운·일진 각각 0 |

Health fact 생산은 상품 범위와 독립적이다. 무료 목차의 Health 고객 슬롯은 0개다. Premium에서는 CH-07이 결론을 보유하고 운 장이 같은 단위를 시기·맥락으로 사용한다. [13 Reading Assembly Spec](../rules/master/13-reading-assembly-spec.md)

## Safety 및 격리

Health 출력에서 질병명·예측·진단·발병 시기, 의료 권고·약·치료·수술, 수명·사망 시기, 점수·확률·등급·순위 및 최고·최저 Health 월은 각각 0건이다.

Judgment·Personality·Relationship·Money·Work·Selection·Compatibility 의미 변경은 각각 0건이다. Locale Renderer와 런타임 LLM/API 의존 변경은 0건이다.

## 회귀

| 항목 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A~G | PASS |
| P3-A~F | PASS |
| P4-B / P4-C / P4-E / P4-F | PASS |
| P4-G | PASS |
| npx tsc -b | PASS |
| npm run build | PASS |

레거시 Judgment 스크립트가 읽는 문서 경로는 임시 저장소 사본에서 현재 파일로 연결했다. 기존 테스트 기대값과 저장소의 문서 배치를 유지했다.
