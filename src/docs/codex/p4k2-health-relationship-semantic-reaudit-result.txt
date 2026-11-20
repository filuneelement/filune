# FILUNE P4-K.2 Health & Relationship Semantic Reaudit

**최종 판정 `HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE`**

진입 판정 `READY_FOR_HEALTH_RELATIONSHIP_REAUDIT`, `OUTCOME_ASSERTION_POLICY_READY`, 그리고 P4-K.2A의 `READY_TO_RERUN_P4K2`를 확인했다. P4-K.2의 기존 기준·fixture·기대값을 변경하지 않고 재실행했다. P4-K.2A에서 수정한 Health identity/origin 처리가 동일 재현에서 통과했고, Relationship 기존 결과도 재검증했다. 새 명리 fixture나 코드 변경은 없었다. [P4-K.1 결과](./p4k1-health-relationship-semantic-expansion-result.md) · [P4-K.2A 결과](./p4k2a-health-month-window-identity-fix-result.md) · [Assertion Policy](./p4-outcome-assertion-policy-correction-result.md) · [기존 재현 스크립트](../../../scripts/verify-health-relationship-reaudit-p4k2.mjs)

## A. Health

| 축 | 생성 조건과 검증 |
|---|---|
| `traditional_body_correspondence` | Canonical 일간 확정 및 대응표. P4-G/H의 10일간에서 乙·丁·庚·壬 구체 부위 상속 0건. 전통 대응의 부담 자동 승격 0건. |
| `body_area_burden` | 실제 불리 경로, 영향을 받는 확인된 기능과 승인 영역. P4-K 보호 상실 fixture의 영역 배열과 별도 의미 확인. |
| `health_burden` | 해당 경로가 실제 작동하거나 약화된 상태로 유효할 때. 원국 OFF-T2 및 P4-K 월운에서 확인. |
| `health_problem_prone_period` | 해당 기간의 직접 작용 또는 재활성 근거와 확정 구간. P4-K 월운 fact의 `lifeMeanings` 확인. |
| `health_management_period` | 같은 적격 조건과 평가 기간. 살펴볼 수 있는 구간의 의미를 CH-10에 보존. |
| 확정도 | 기간만으로 하향 0건. 실제 작동·불리 경로는 `confirmed`. reduced와 불리 후보의 contextual은 근거 강도에 따른 기존 구분. |
| 의료 예측 | 질병·진단·검사·약·치료·수술·수명·사망에 관한 새 결과 각각 0건. |
| Lifecycle | active·reduced·stopped·발동 전 conditional·expired·reactivated 회귀. 이전 월 종료 시 같은 fact는 역사에 남고 CH-10 현재 누출 0건. |

[Health 발행](../../lib/outcome/health/healthOutcome.ts) · [Health 조립](../../lib/reading/healthUnits.ts) · [Master 14](../rules/master/14-outcome-semantic-spec.md) · [P4-G.1](./p4g1-health-outcome-reactivation-fix-result.md) · [P4-H](./p4h-health-outcome-integration-audit-result.md)

### 월운 경로 재현

| 비교 | 동일 평가 스냅샷 전달 | 창의 독립 평가 결과 전달 |
|---|---:|---:|
| 전체 체인 / 월운 창 fact | 1 / 1 | 1 / 1 |
| 누락 / 중복 | 0 / 0 | 0 / 0 |
| Semantic·확정도·결과 scope 불일치 | 0 | 0 |
| Fact ID 불일치 | 0 | 1 → 0 |
| Judgment·relation 출처 ID 불일치 | 0 | 1 → 0 |
| Provenance 불일치 | 0 | 1 → 0 |
| 원천 scope 불일치 | 0 | 1 → 0 |
| 만료된 이전 월의 현재 노출 | 0 | 0 |

P4-K의 기존 P1-Fix E 정책 fixture를 사용했다. 창 코드와 같은 `monthly-window-run` 실행 ID 규칙, 월 시작 기준 시각 및 원국 검사 구간으로 실제 Judgment 스냅샷을 다시 생성했다. 창 어댑터 입력 형태로 해당 월과 직전 세운을 전달했다. P4-K.2 최초 실행에서 독립 재평가 결과에 ID·출처·provenance·origin scope 불일치가 각각 1건이었다. P4-K.2A 후 동일 fixture를 다시 실행해 네 불일치가 모두 0임을 확인했다. 별도로 CS-005 출생 12절기월 회귀를 실행했으며 해당 표본에는 실제 월 부담 양성이 없었다.

재실행에서 두 평가의 조건 ID, 대상, 기간, 월 scope, 확정도와 생활 의미가 같고, Fact ID·sourceJudgmentIds·sourceRelationIds·provenance·certainty·origin scope/ID도 완전히 일치했다. 원인은 독립 월 window에서 실행별 scope ID 때문에 natal origin relation의 정확한 ID 조회가 빗나가던 것이었다. 현재 Outcome은 제공된 parent Judgment가 외부 natal 실행과 같은 실행 계보임을 확인한 경우에만 scope reference를 그 계보의 실제 ID로 되돌린다. exact origin ID가 없으면 action/source/target 좌표로 실제 natal relation을 찾아 연결한다. 다른 window 실행은 자체 Judgment ID를 보존한다. Fact의 `scope = month`와 기간은 CH-10 배치를 위해 유지하고 `originScope = natal`은 원천 사실대로 유지한다. [Health ID와 원천 범위](../../lib/outcome/health/healthOutcome.ts)

**Health gaps** 의미 축소·period certainty·월 identity/origin gap은 0건 남음. 월 origin 양성 fact 및 동일 양성 fact의 여러 달 연속 활성화는 `NOT_TESTABLE_WITH_CURRENT_FIXTURE`; 새 fixture는 만들지 않았다. 독립 상신 손상과 Formation 양성 사례는 기존 `FIXTURE_GAP`.

## B. Relationship

| 축 | 상태 |
|---|---|
| Contact / Change | PASS. P4-E/F 기존 사례 및 CS-127의 조건부 접점·변화를 재확인. |
| Formation | PASS. CS-127 실제 출생에서 같은 세운의 유효한 일지 합과 적용 가능한 역할이 확인됐다. 가까운 관계가 형성될 기회가 `confirmed`이며 접점과 다른 ID다. |
| Commitment | `DEFERRED` / `NOT_TESTABLE_WITH_CURRENT_FIXTURE`. I-22 ③의 독립 양성 사례 없음. 특정 결혼 사건 시기는 `SOURCE_GAP`. |
| Pressure | PASS. OFF-T2의 실제 OFF-03 작용에서 가까운 관계가 부담을 겪을 수 있는 결과가 `confirmed`. CH-06은 ID·scope·확정도·근거를 보존. |
| Breakdown | `SOURCE_GAP` / `NOT_IMPLEMENTED`. 부담에서 이별·이혼·종료 자동 발행 0건. |
| Partnership / general relationship context | 가까운 관계 형성의 기회를 보존하며 연애·혼인 상태를 추정하지 않는다. 동업·업무 협력의 독립 매핑은 `SOURCE_GAP`. |
| Compatibility | 개인 결과 범위 밖. 두 명식 궁합 의존성 추가 0건. |

[관계 발행](../../lib/outcome/relationship/relationshipOutcome.ts) · [관계 조립](../../lib/reading/relationshipUnits.ts) · [P4-E](./p4e-relationship-outcome-batch1-result.md) · [P4-F](./p4f-relationship-outcome-integration-audit-result.md)

**Relationship gaps** before 3 · fixed 2 · remaining 1개 약속 보류. 형성 + 부담, 약속 + 부담은 각각 `NOT_TESTABLE_WITH_CURRENT_FIXTURE`. 발행 축은 독립이며 접점과 형성의 동시 보존은 직접 확인했다.

## C. Assertion Policy와 고객 용어

| 검사 | 건수 |
|---|---:|
| Health structural-only weakening | 0 |
| Health period-only certainty downgrade | 0 |
| Health confirmed-axis suppression | 0 |
| Health unsupported invention | 0 |
| Relationship formation → contact-only collapse | 0 |
| Relationship commitment → change-only collapse | 0 관측 · 양성 검증 보류 |
| Relationship pressure → change-only collapse | 0 |
| Relationship mixed → ambiguous collapse | 0 관측 · 동시 양성 검증 보류 |
| Relationship unsupported invention | 0 |
| Customer-visible Saju jargon 신규 노출 | 0 |
| Free의 Health·Relationship 유료 시기 누출 | 0 |

Health·Relationship 고객 렌더러는 미연결이다. 내부 역할명과 근거 ID는 고객 노출 집계에서 제외했다. 기존 KO/JA 차트 UI 용어는 P4-K 기록과 동일하다. 수정 후 새 고객 용어 노출은 0이며 생활 의미와 확인된 결과 축은 유지됐다. [P4-K 고객 용어](./p4k-health-relationship-assertion-backaudit-result.md#c-고객-용어와-renderer) · [Assembly 명세](../rules/master/13-reading-assembly-spec.md)

## D. 결정론, 격리와 회귀

CS-127 실제 출생과 P4-K 정책 fixture의 동일 입력 재실행에서 ID·의미·확정도·scope·provenance가 일치했다. Relation·Role·Effect 배열을 역순으로 전달해도 결과가 같았다. JudgmentResult·PersonalityResult·Luck snapshots 입력 변이는 각각 0건이다. P4-K.2 재실행에는 애플리케이션 코드·기존 테스트·기대값 수정이 없다.

작업 전후 `src/lib` 파일 목록과 SHA-256을 대조했다. 기존 회귀 스크립트의 기대값과 Master 14는 변경하지 않았다. P4-K.1 전후 Judgment·Money·Personality는 P4-J 검증 사본과 현재 파일을 비교했다. Judgment / Money / Personality / Work / Compatibility 변경은 각각 0건이다.

P4-J의 독립 blocker도 기존 CS-126 출생과 같은 절기월 창으로 재현됐다. Money 발행 전 Judgment의 `Carry does not cover full destination period; boundary split required.`가 발생한다. 이번 Health 실패는 정상적으로 계산된 스냅샷을 조립할 때 발생하며 두 실패의 경로가 다르다. [P4-J 결과](./p4j-money-outcome-integration-audit-result.md)

| 검증 | 결과 |
|---|---|
| Judgment | PASS · 35/35. 기존 스크립트용 문서 경로만 임시 사본에 복원했다. |
| P2-A–G / P3-A–F | PASS · 7/7 및 6/6. |
| P4-B / P4-C | PASS. |
| P4-E / P4-F | PASS · `RELATIONSHIP_OUTCOME_BATCH1_COMPLETE` 유지. |
| P4-G / P4-G.1 / P4-H | PASS · `HEALTH_OUTCOME_BATCH1_COMPLETE` 기존 회귀 유지. |
| P4-I / P4-K.1 | PASS. |
| P4-K.2A identity/origin fix regression | PASS · `READY_TO_RERUN_P4K2`. |
| P4-K.2 기존 재현 | PASS · 종료 코드 0; Health ID/source/provenance/origin scope mismatch 각 0. |
| `npx tsc -b` / `npm run build` | PASS / PASS. |

이 재실행에서 P4-E/F/G/G.1/H 및 P4-K.1을 다시 실행해 통과했다. P4-K.2A 직후 같은 코드 상태에서 Judgment 35개 명령, P2-A–G, P3-A–F, P4-B/C/E/F/G/G.1/H/I/K.1, TypeScript 및 Build도 모두 통과했다. P4-J의 CS-126 상위 Judgment blocker는 별도 과제로 그대로 두며 이번 감사에서 수정하지 않았다.
