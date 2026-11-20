# FILUNE P4-E Relationship Outcome Semantic Engine — Batch 1

## A. 판정

**`READY_FOR_RELATIONSHIP_OUTCOME_AUDIT`**

## B. Architecture

| 항목 | 결과 |
|---|---:|
| Outcome engine | 1 common outcome layer |
| Relationship-specific Judgment recalculation | 0 |
| Pair/Compatibility engine | 0 |
| Locale-specific outcome | 0 |
| LLM | 0 |

[Outcome 진입점](../../lib/outcome/index.ts)은 기존 Canonical, 원국 Judgment 및 평가된 운 snapshot을 소비한다. 기존 내부 읽기 결과의 편의 어댑터는 `relationshipOutcomeFromReading({ judgment, luckScopes, evaluatedLuckScopes })`이다. 결과를 `assembleReading({ judgment, productScope, relationshipOutcomes })`의 명시적 입력으로 전달한다. 12개월 window의 독립 평가 결과가 동일 기간의 현재월 snapshot과 겹칠 경우 window 원천을 사용한다. 이전 Assembly 호출은 Outcome 입력 없이 계속 동작한다.

## C. Coverage

| 항목 | 상태 |
|---|---|
| Relationship palace | OUT-REL-01. 확인된 원국 일지의 전통 관계 자리 분류 |
| Relationship significator | A I-15. 확인된 원국 천간 십성에서 상징 역할 분류. 배우자·자녀처럼 적용 구분이 필요한 항목은 명시된 출생 입력으로 제한 |
| Natal relation signal | 일지의 기존 육합·충 및 Formation을 방향 없는 구조 맥락으로 기록 |
| Luck contact signal | OUT-REL-02. 해당 운 참여자가 있는 검증된 일지 육합·삼합. 접점과 변화의 가능성을 함께 보존 |
| Luck change signal | OUT-REL-02. 해당 운 참여자가 있는 검증된 일지 충. 조건부 구조 변화 |
| Half formation | 기존 일지 반합의 구조 맥락만 유지. 독립 접점·변화 시기 신호에는 사용하지 않음 |
| Commitment timing | DEFERRED |
| Favorable relationship timing | DEFERRED |
| Compatibility | NOT_IMPLEMENTED |

원국 significator는 천간의 존재와 해당 snapshot의 실제 runtime을 읽고, 일치하는 구조 역할이 있으면 현재 역할 상태도 인용한다. runtime 가용성과 구조 기능의 작동은 구별된다. 미표출 육친, 형·파·해·원진의 독립 시기 해석, 천간 일간합은 채택하지 않았다. 구조와 시기 근거에서 고객의 실제 관계 상태를 유추하지 않는다. [14 명세](../rules/master/14-outcome-semantic-spec.md) · [P4-D](./p4d-outcome-semantic-source-audit-result.md) · [A I-15/I-22](../source/authority/A_rev182.md) · [B W-87~89](../source/authority/B_rev38.md) · [C C-7](../source/authority/C_rev215.md)

## D. Safety

| 출력 | 건수 |
|---|---:|
| Marriage prediction | 0 |
| Divorce prediction | 0 |
| Affair prediction | 0 |
| Fated partner | 0 |
| Partner quality | 0 |
| Compatibility score | 0 |
| Relationship probability | 0 |

## E. Provenance

CS-005 원국·운 scope와 절기월 window의 원천 snapshot, 관계·Formation, 참여자, 역할·효과 원장을 대조한다.

| 지표 | 결과 |
|---|---:|
| OutcomeFacts | 11 |
| With upstream provenance | 11 |
| Orphan | 0 |
| Duplicate ID | 0 |
| Scope mismatch | 0 |

ID는 의미 유형·scope·snapshot과 관계 또는 참여자 식별자를 사용한다. Significator는 동일 참여자의 여러 상징 역할을 구별한다. 분류 확정도와 기능 상태는 별도 필드다.

## F. Lifecycle

| 상태 | 검증 결과 |
|---|---|
| Active | PASS · 기준 시점에 유효한 1월 접점과 원국 구조를 확인 |
| Reduced | PASS · 약화 상태와 conditional 확정도 유지 |
| Stopped / inactive | PASS · 정지된 사실을 보존하고 현재 읽기 단위에서 제외 |
| Expired | PASS · 만료 경계에서 currentlyEffective=false 및 조립 누출 0 |
| History | PASS · 독립 평가 snapshot의 동일 사실 ID와 출처 보존 |
| Future | PASS · 독립 평가된 미래 기간을 시기 참조로 사용하며 currentlyEffective=false |

## G. Assembly

| 항목 | 결과 |
|---|---|
| CH-06 | Relationship 입력을 활성화한 조립에서 PARTIAL. 관계 발전 및 큰 약속 시기는 공백 유지 |
| CH-09 | 세운 신호의 시기 참조 및 월 신호의 맥락 참조 |
| CH-10 | 같은 월 신호의 시기 참조 |
| Same OutcomeFact reuse | CS-005의 10개 조립 단위가 원래 사실 ID·확정도·출처 보존. 1월 접점은 CH-06·09·10에서 동일 단위 참조 |
| B-6 duplicate conclusion | 중복 0. CH-06에 한 번 배치. 후속 장은 context/timing 참조 |
| Free scope leakage | 0 |

A OP-R01의 고객 문장 범위를 유지하면서 CH-09/10에는 내부 참조만 제공한다. Reading Assembly의 dedupe, selection, 기존 Judgment 및 Personality 의미와 Health·Work·Money 계약은 그대로다. 해당 파일 변경은 0건이다. [Reading Assembly Spec](../rules/master/13-reading-assembly-spec.md) · [P4-C](./p4c-reading-assembly-integration-audit-result.md)

## H. Regression

| 항목 | 결과 |
|---|---|
| Judgment | PASS · 35/35 |
| P2-A~G | PASS |
| P3-A~F | PASS |
| P4-B | PASS |
| P4-C | PASS |
| P4-E | PASS |
| TypeScript | PASS |
| Build | PASS |

Judgment 회귀는 기존 스크립트가 참조하는 레거시 문서 경로를 임시 사본에서 복원해 실행했다. P4-E fixture의 Judgment 계산은 기존 pipeline 문서 고정을 사용하고, 관계 의미는 A rev182의 I-15/I-22 및 14 명세를 따른다.

재현 명령은 `node scripts/verify-relationship-outcome-p4e.mjs`다. 테스트는 실제 CS-005 파이프라인과 기존 Judgment Core로 평가한 대운 입력을 사용하고, 정지·약화의 경계 상태는 테스트용 snapshot으로 확인한다. [P4-E verifier](../../../scripts/verify-relationship-outcome-p4e.mjs)

## I. 다음 단계

P4-F에서 실제 입력별 Judgment/Luck → OutcomeFact → Reading Assembly 통합 범위를 감사한다. 이후 Money와 Health의 승인 subset을 비교한다. Work `SOURCE_GAP`과 Selection Layer 분리를 유지한다.
