# Existing Synthesis Pipeline Trace Audit — 결과

## 범위와 판정 기준

코드와 master는 수정하지 않았다. 현재 작업은 요청한 결과 문서 작성뿐이다. 아래 trace는 기존 production 경로와 그 경로를 검증하는 P4 스크립트/결과를 정적으로 대조한 것이다. 주어진 다섯 서술과 완전히 일치하는 공개 fixture ID는 확인되지 않아, 기존 검증 fixture 중 가장 가까운 구조 경로를 재사용했다. 따라서 fixture A–E의 개별 trace 값은 테스트 런타임에서 새로 관측한 값이 아니라, 해당 producer 계약에 대한 적용 가능성 표기다. (검증 스크립트를 새로 실행하지 않음.)

## A. Existing Synthesis Already Implemented

| 책임 | 이미 존재하는 계약/구현 | 판정 |
|---|---|---|
| 사실에서 종합까지 | `runInternalReading` → `runJudgmentCore`; `LuckScopeState`는 scope별 `patternContext`, stem/branch/pattern facts, runtime, actual functions, role engine, branch facts, effects를 보유한다. `ActualStructuralFunction`은 policy 방향, 실제 function, 조건·runtime·root·formation evidence와 `structuralEffect`를 보존한다. | 경로별 구조판정이 존재한다. `StructuralOutcome`이라는 별도 통합 결과 타입은 확인되지 않았다. 실제 구조 결과는 scope snapshot과 여러 경로별 records에 분산돼 있다. |
| 복수 동시 경로 | `LuckScopeState.stemFacts`/`patternFacts`/`actualFunctions`가 path 단위 배열이며, P4 money producer는 각 유효 경로를 순회해 독립 OutcomeFact를 발행한다. | 경로 합산 점수 없이 병렬 경로 표현 가능. 경로 간 cause graph의 단일 공용 객체는 없음. |
| 궁성 | branch participants/facts는 위치·entity를 갖고, Relationship Outcome 계약은 궁성 조합/충·활성 참여자와 관계 축에 대해 별도 의미를 발행한다. | 궁성 기반 관계의 제한적 사용은 존재. 일반 역할/기능에서 궁성까지 이어지는 삶의 actor attribution은 Outcome→Customer 경로에 연결되지 않음. |
| 구조/체감 분리 | 구조 방향과 `function`은 `ActualStructuralFunction`; pressure 등 별도 결과도 `OutcomeFact` domain별로 다룬다. | 구조 결과와 실제 삶의 결과를 분리하는 데이터 경계는 존재. 하나의 고객 판단의 양쪽을 원인 그래프로 결합하는 기능은 미확인. |
| 시간 계층 | `runJudgmentCore`는 연속된 natal→luck scope를 강제하며, product path는 canonical Daewoon/Sewoon/month window를 snapshot으로 전달한다. Outcome은 scope/기간/생명주기 및 origin effect를 가진다. | 기간 축과 상속/현재효력 정보는 상당 부분 보존됨. |
| Cause-to-Life | Master 17은 actor→relation→target→actual function/effect chain과 보호/손상/제한 근거 연결, 서로 다른 원인의 독립 보존을 계약한다. Outcome producers는 source Judgment ID, relation/role/effect/participant IDs, provenance를 내보낸다. | 문서 계약은 full chain을 요구하지만 runtime refs는 평탄한 ID 배열이며 후속 mapping은 chain을 복원하지 않는다. |

## Runtime Pipeline Trace

| 단계 | 실제 Type / producer → consumer | 전달 내용과 경계 |
|---|---|---|
| 계산 입력 | `CalculatedChart`; `readBirthChart` → `runInternalReading` (`src/lib/product/readBirthChart.ts`) | 원국/운 canonical 및 계산 문맥. |
| judgment 실행 결과 | `ReadingJudgmentResult = Omit<ReturnType<typeof runInternalReading>, 'luck'> & ...` (`src/lib/reading/types.ts`); 생성자는 `runInternalReading` | 제품 경로의 Judgment는 registry형 `JudgmentResult` (`src/lib/judgment/types.ts`)와 별개의 `judgmentCore` snapshot 실행 결과다. registry `JudgmentResult` 자체를 고객 조립 경로로 넘기지는 않는다. |
| RelationFact | `StemRelationFact` (`src/lib/judgment/core/types.ts`), branch fact types (`branches.ts`); producer는 stems/branches 및 luckScope | ID, action, source/target participant (scope·position·TenGod·entity)를 유지한다. |
| PatternContext / Policy | `FinalPatternContext`, `PolicyResolution` (`types.ts`, `policies.ts`); `runJudgmentCore`가 resolver 호출 | pattern/context ID와 선택된 policy, direction, 매칭·조건 evidence는 경로별 기록. |
| ActualStructuralFunction | `ActualStructuralFunction` (`src/lib/judgment/core/policies.ts`); `resolveActualFunction`/`resolveStructuralEffect` | relation/context IDs, function 상태, root/runtime/formation, structural-effect origin·현재효력·block/protection을 갖는다. |
| Role | `RoleEngineState`, `RoleHistory`, current-role records (`roleEngine.ts`, `types.ts`); `evaluateRoleEngine` | 역할 ID와 지원 path refs/evidence가 scope snapshot 안에 존재한다. 역할 및 경로 관계는 유지되나 고객 Outcome까지 전부 전달되지 않는다. |
| StructuralOutcome | 전용 타입/ID를 찾지 못함. 동등한 실제 producer 출력은 `LuckScopeState` (`src/lib/judgment/core/luckScope.ts`)의 여러 배열 | 여러 path와 opposing direction을 독립 records로 유지한다. 단일 overall verdict나 통합 outcome graph로 만들지는 않는다. |
| OutcomeFact | `OutcomeFact`, `MoneyOutcomeFact`, `RelationshipOutcomeFact`; `moneyOutcomeFromReading`/`relationshipOutcomeFromReading` | `sourceJudgmentIds`, `sourceRelationIds`, `sourceRoleIds`, `sourceLuckEffectIds`, `sourceParticipantIds`, `provenance`와 domain-specific fields. source Judgment ID는 snapshot ID다. effect/protection relation IDs는 `sourceRelationIds`에 들어갈 수 있다. |
| OutcomeMapping / Cause-to-Life | `outcomeMapping.ts`: `mapMoney`, `mapRelationship` | money는 `result`와 `provenance`의 source labels/policy refs, 제한적으로 `burdenPath`를 확인. relationship은 `semanticType`, 일부 `provenance`, `relationKind`를 확인. sourceJudgment/role/effect IDs를 따라 전체 chain을 재구성하지 않는다. |
| Reading assembly | `ReadingSemanticUnit`, `UnitInput`; `collectMoneyUnits`, `collectRelationshipUnits` | Outcome unit는 `meaningRef.recordId=Outcome ID`, sourceFactIds에 Judgment/relation/participant, sourceRoleIds/effect IDs 및 evidence/provenance를 기록한다. `ReadingSemanticUnit`은 별도 구조 reason graph를 정의하지 않는다. |
| CustomerReadingPlan | `CustomerReadingParagraphPlan`, `OutcomeActivation` (`customer/types.ts`); `buildCustomerReadingPlan.ts` | `sourceOutcomeIds`, `sourceMappingIds`, `lifeMechanismIds`, `semanticUnitIds`, activation(여러 source outcome 가능)을 묶는다. mapping mechanism은 있으나 relation의 source→target→function→보호/경쟁 chain이나 palace actor를 plan expression에 넣지 않는다. |
| CustomerSemanticUnit | `ReadingSemanticUnit` (customer가 이를 가져다 씀) | semantic unit 자체는 Outcome fact ID/scope/topic/period 및 provenance IDs를 남긴다. 구체 structuralReason 필드는 없다. |
| Renderer | `renderCustomerReadingKo` (`src/lib/reading/customer/renderCustomerReadingKo.ts`) | Outcome `voice`별 고정 `outcomeCopy`와 money explanation을 선택한다. `CustomerReadingParagraphPlan`의 source IDs/reason chain을 문장 생성 근거로 소비하지 않는다. |
| 결과/UI | `singleResultCopy.ts` → `renderCustomerReadingKo(buildCustomerReadingPlan(...))`; Result consumers | rendered text와 debug source/semantic/evidence/effect IDs를 반환한다. 근거 ID는 진단 metadata이며 본문에 원인 chain이 들어간다는 뜻은 아니다. |

## Fixture A–E 추적 요약

표의 `P`는 보존 여부, `—`는 해당 chain에 들어오지 않거나 현재 파이프라인에서 확인되지 않음을 뜻한다. 각 행에서 최초로 고객 설명에 필요한 **상세 인과 chain**이 빠지는 단계도 함께 표시한다.

| Fixture / 가장 가까운 기존 검증 | Stage / IDs (실제 ID 생성 규칙) | 의미·actor·target·relation·function·보호·경쟁·궁성·domain·period | 최초 손실 / 분류 |
|---|---|---|---|
| A 보호 구조: 財 damages 印, 比劫 controls 財, 印 protected. 근접: `verify-cs005-sangshen-judgment.mjs`, `verify-cs005-end-to-end.mjs`; policies `HO-06`/wealth protection | `JudgmentCore` snapshot ID → `StemRelationFact.id` → `ActualStructuralFunction.relationFactId`; money burden Outcome ID는 `money:[semanticType,snapshot.id,conditionId]` 형식 | judgment에서 source/target/action/function/policy/evidence 및 경로별 보호 evidence P. producer는 적격 `wealth_damages_needed_resource`일 때 `burdenPath(affectedEntityId,supportingRelationId)`와 관련 refs를 P. 전체 3경로 묶음, palace, 고객용 actor는 —. natal/운 scope는 P. 이 A 전체를 그대로 표현하는 하나의 fixture는 확인하지 못함. | Judgment snapshot 내부에는 각 edge가 살아 있지만 세 path를 하나의 보호·피해 graph로 묶은 계약이 없음. Outcome은 특정 qualifying assertion의 refs만 보존. **OUTCOME_FLATTENING** (독립 assertion 보존은 정상, shared cause graph 부재). |
| B 동시 경로: 食神生財, 財生殺, 食神制殺. 근접: `verify-money-outcome-p4i.mjs`, `verify-cs005-sangshen-judgment.mjs` | relation별 facts/actuals; 동일 snapshot의 `sourceJudgmentIds=[snapshot.id]`; Outcome IDs semanticType/scope/condition별 독립 생성 | 3 관계와 각 function은 snapshot에서 동시 보유 가능. `moneyOutcome`은 earning/wealth damage/killing path를 qualifying 조건에 맞춰 따로 처리하나 이 전체 3개를 한 결과 graph로 보존하지 않는다. target/domain/scope 부분 보존, palace —. | 개별 Outcome producer가 고객 결과별 필요 relation refs만 고른 뒤 mapping은 `result/provenance`로 단일 mechanism 선택. 경쟁 path 전체로 재조합되지 않음. **MAPPING_GAP**. |
| C 좋은 구조 역할의 比劫 + 배우자궁. 근접: `verify-relationship-outcome-p4f.mjs`, `verify-customer-reading-ko-p4c.mjs`; 궁성 관계 계약은 `relationshipOutcome.ts` | branch relation/fact IDs 및 participant entity/position; 해당 관계 Outcome은 `relationship:[semanticType,snapshot.id,...]` 계열 | 배우자궁 자체의 관계 접점/변화 신호는 해당 contract에서 의미화 가능. 일반 比劫 Role→ActualStructuralFunction→day branch palace→배우자 benefit chain은 Outcome/plan에 없음. actor publication regex도 배우자 등의 명사를 차단하지만 relationship outcome map에는 actor allowlist/지원 palace ref 연결이 없음. | 현재 Outcome palace-specific association 또는 source-supported actor evidence를 Customer mapping까지 전달하지 않음. **PALACE_ATTRIBUTION_GAP**. actor guard는 relationship publisher에서 이 두 케이스를 구별하는 evidence를 받지 않음. |
| D money favorable, document/contract unfavorable. 근접: money P4-I/J; `src/lib/judgment/systems/documentReceipt.ts` 및 `src/lib/outcome/money` | money outcome IDs와 domain/result/direction; document receipt facts는 별도 Judgment system | domain별 Outcome 분리는 타입상 가능하지만 현재 customer outcome mapping은 relationship/money만 구현 (`CustomerOutcome` union); document/contract 결과를 CR-07에 연결하는 mapping/assembly route는 없음. 두 domain의 period 비교는 기존 scope/period에 한함. | Money outcome은 매핑되나 문서/계약 source는 customer outcome plan으로 합류하지 않는다. **ASSEMBLY_GAP**. |
| E structural favorable, experienced pressure high. 근접: P4-H/P4-K relationship/health audits 및 money pressure path P4-I/J | `ActualStructuralFunction.direction/function`; 별도 domain Outcome IDs; `OutcomeFact.direction`, `lifecycle`, `certainty` | 서로 다른 structural result와 experience assertion을 독립 fact로 둘 수 있다. Money outcome은 adverse burden path에 `burdenPath` 제공. relationship/health는 자체 domain facts. 공통 link/competing structural cause graph는 —. 기간별 상태는 각 fact에서 P. | 개별 사실은 유지하지만 같은 고객 판단에 대한 structural result와 experienced pressure를 연결할 shared graph/referential key 없음. **OUTCOME_FLATTENING**. |

ID 결론: 고정 fixture의 relation/Outcome ID 문자열은 scripts에서 scenario별로 생성되거나 assertion에 로컬로 선언된다. 위에 문자열이 고정된 경우만 production ID 생성 식을 적었다. 결과 문서 및 스크립트에 없는 runtime ID를 추정해 만들지 않았다.

## 핵심 질문 답변

| 질문 | 감사 결과 |
|---|---|
| Q1 Judgment에 전체 interaction graph가 있는가? | 한 `LuckScopeState` 안에서 다중 relation/function/role/effect와 evidence를 동시에 열람할 수 있다. Master 17이 요구하는 actor→relation→target→function/effect 연결을 위한 refs는 일부 있으나, 보호/경쟁 path를 묶는 단일 graph object는 없다. **부분적으로만 있다.** |
| Q2 StructuralOutcome이 competing path를 보존하는가? | Master 05/08/09에는 Stem/Branch/Overall StructuralOutcome 책임이 정의돼 있다. inspected core에는 같은 이름의 runtime type/ID가 없고, `actualFunctions[]`가 relation별 방향/기능을 보존하며 경로를 공존시킨다. outcome 대상별 competing set은 아니다. |
| Q3 OutcomeFact가 source Judgment와 effect/protection IDs를 보존하는가? | 예, 실제 producer는 `sourceJudgmentIds`, relation/role/luck effect IDs와 participants/provenance를 쓴다. protection refs가 relation ID인 경우 relation refs로 유지된다. 다만 structural effect IDs와 policy-role IDs 전부가 별도 source namespace로 보존되는 것은 아니다. |
| Q4 OutcomeMapping이 full cause chain을 읽는가? | Master 17의 목표 계약은 그렇다. 실제 `mapMoney/mapRelationship`은 result/provenance와 제한된 domain payload만 읽는다. `mapMoney`만 일부 `burdenPath`를 검사하며 Judgment snapshot graph를 순회하지 않는다. |
| Q5 Plan이 하나의 Outcome에 복수 원인을 재결합하는가? | 동일 voice/mechanism/기간 signature 버킷에 parallel Outcome들을 모으고 각 activation/sourceOutcomeId를 남길 수 있다. 그러나 source IDs로 원인 chain을 재결합하지는 않는다. |
| Q6 dedup/scope compression이 원인 chain을 제거하는가? | 동일 고객 의미 signature에서는 entries/activations를 누적하고 cross-scope progression은 `outcomeMeaningKey`와 target key까지 비교한다. 기존 로직에 서로 다른 cause refs를 먼저 버리는 분기는 발견되지 않았다. 하지만 서로 다른 원인이 같은 mechanism/target/기간 signature에 합쳐지면 문단의 mapping mechanism만 하나라 원인 차이가 가려진다. **재현된 ID 소실 없음; 설명상 세부 병합 위험 있음.** |
| Q7 Palace는 어디서 사라지는가? | 특정 Relationship Outcome은 palace-combination/clash source를 outcome semantic/provenance로 바꿔 기록한다. 일반 structural role palace 연결은 Outcome producer에서 만들어지지 않는다. 그 타입의 경우 그보다 앞서, Outcome 투영 시점이 최초 단절이다. 이후 `ReadingSemanticUnit`은 palace field가 없고, Mapping/Plan에도 없다. |
| Q8 actor guard가 둘을 구별하는가? | money renderer는 `moneyActorKo` regex로 가족/배우자/동료 등 actor 문구를 차단한다. source-supported palace attribution evidence를 검사하는 predicate는 확인되지 않는다. 결과적으로 unsupported attribution 억제는 있으나 supported case도 허용할 방법이 없어 **PUBLICATION_GUARD_OVERREACH**. |
| Q9 Renderer payload에 구체 structuralReason이 있는가? | 아니다. plan에 IDs, `lifeMechanismIds`, voice와 activation은 있으나 structuralReason object/chain은 없다. semantic unit에도 해당 필드는 없다. |
| Q10 generic phrase 최초 발생 지점은? | 사용자 예시 문구 각각이 현재 고객 renderer에 literal로 존재한다고 확인하지 못했다. 현 출력의 일반화된 outcome 설명은 OutcomeMapping에서 mechanism/voice로 축약되고, 고정 `outcomeCopy`가 voice만으로 본문을 만들면서 구체 chain을 읽지 않는 데서 발생한다. 따라서 최초 정보 축약은 mapping/plan 경계, 문구가 실제 문자열로 확정되는 최초 단계는 Renderer다. 주 원인은 **MAPPING_GAP**이며 표현 재현은 **RENDERER_GAP** 단독으로 분류하지 않는다. |

## B–G. 손실, generic copy, attribution 및 compression

### B. Missing Runtime Links

1. `LuckScopeState` path records → Outcome에는 특정 assertion의 source IDs가 연결되지만, assertion 간 `caused by / protected by / limited by` 관계를 가리키는 공유 key가 없다.
2. palace participant/position → 일반 Role/Outcome attribution 연결이 없다. Relationship palace signal은 별도 contract이며 “역할이 배우자궁에서 수행됨”을 의미하지 않는다.
3. `OutcomeMapping` → 전체 `LuckScopeState` 또는 `ActualStructuralFunction` 입력이 없어 cause-chain 검증이 불가능하다.
4. `CustomerReadingPlan`/Renderer는 mechanism과 voice만으로 문장을 정한다. `sourceOutcomeIds`는 trace용 연결이지 문장 이유 슬롯이 아니다.
5. document/contract domain은 requested CR-07 Outcome consumer union/mapping/assembly에 연결된 경로가 확인되지 않았다.

### C. First Information Loss Point

| 유형 | 최초 단절 | 분류 |
|---|---|---|
| A 보호 구조 | 독립 judgment paths 자체가 아니라, Outcome assertion 사이의 protection/damage relation graph를 만들지 않는 투영 경계 | OUTCOME_FLATTENING |
| B 동시 경로 | Outcome→Mapping: 동시에 가능한 세 경로 중 하나 assertion의 provenance/result를 customer mechanism 하나로 투영 | MAPPING_GAP |
| C 역할+배우자궁 | Role/ActualFunction에서 해당 palace actor association을 Outcome으로 투영하지 않음 | PALACE_ATTRIBUTION_GAP |
| D money+document split | document/contract Outcome을 customer plan의 지원 domain에 연결하지 않음 | ASSEMBLY_GAP |
| E favorable+pressure | 양쪽 Outcome은 각각 존재 가능하지만 같은 판단의 cause/experienced-result link 부재 | OUTCOME_FLATTENING |

### D. Generic Reason Trace

`관계 형성에 유리한 작용이 활성됩니다`, `연결을 돕는 쪽이 우세합니다`, `재물에 유리한 작용입니다`, `도움을 받을 수 있습니다`는 literal text search에서 현재 구현 문구로 확인되지 않았다. 따라서 검증 가능한 ID 역추적은 불가능하며 해당 문자열에 임의 ID를 붙이지 않았다.

현재 확인 가능한 경로의 ID 형태:

```text
Outcome ID (money: [semanticType, snapshot.id, conditionId])
← sourceJudgmentIds=[snapshot.id], sourceRelationIds, sourceRoleIds, sourceLuckEffectIds
← ReadingSemanticUnit.meaningRef.recordId=Outcome ID
← OutcomeMapping ID (예: CL-M01..CL-M06B / CL-R01..CL-R03)
← CustomerReadingParagraphPlan.sourceOutcomeIds + sourceMappingIds + lifeMechanismIds
← expression={kind:'outcome', voice}
← renderCustomerReadingKo outcomeCopy[voice] / renderMoneyExplanation
← singleResultCopy
```

연결이 끊기는 곳은 “Outcome→Mapping 입력에서 graph chain을 읽지 않음”과 “Plan expression에 structural reason을 싣지 않음”이다. 실제 money IDs는 deterministic formula이고, relationship producer IDs는 별도 domain type에 의존한다. 실제 chart fixture를 실행하지 않았으므로 특정 고객 문장의 concrete IDs는 산출할 수 없다.

### E. Palace Attribution Result

`비견 → 친구 도움`은 actor guard의 금지 대상이다. `비겁이 실제 필요 기능을 보호 + 그 entity의 palace가 배우자궁 + source가 허용`은 별도 supported candidate여야 한다. 현재 mapping/plan은 source allowance와 palace-linked role/function 증거를 함께 검사하지 않는다. 단순 TenGod→배우자/친구 귀속은 막지만 source-supported attribution도 publishable로 승인할 근거가 전달되지 않는다. 분류: **PALACE_ATTRIBUTION_GAP**, publication 단계 차단은 **PUBLICATION_GUARD_OVERREACH**.

### F. Dedup / Compression Result

`outcomeMeaningKey = [semanticType,result]`, money target key는 wealth entity/direction/burden affected entity, paragraph bucket은 voice/mechanism/direction/scope/period, progression은 의미 key와 target key 집합을 비교한다. 같은 scope/기간의 서로 다른 Outcome IDs는 `entries`와 `activations`에 병렬로 남는다. ID 수준의 destructive dedup은 확인되지 않았다. 다만 같은 meaning/target/mechanism signature면 renderer는 대표 `voice`만 표현해 원인 설명은 드러나지 않는다. 분류: **NO_GAP** (Outcome ID 보존), shared causal refs 연결은 **OUTCOME_FLATTENING**, 설명 선택은 **MAPPING_GAP**.

### G. Minimal Fix Plan (감사 후 제안, 이번 변경 아님)

1. 기존 `LuckScopeState`/OutcomeFact를 보존하면서 Outcome ID를 root로 참조하는 최소 cause-link/protection/limitation reference만 연결할 수 있는지 먼저 확인한다. 새 점수·새 판정 규칙은 필요하지 않다.
2. OutcomeMapping에 이미 존재하는 provenance 및 domain payload로 원인 경로가 충분히 정당화되는지 audit한다. 누락된 link만 기존 타입 확장 여부를 검토한다.
3. Customer plan은 Outcome 독립 assertion을 유지하면서 모든 sourceOutcomeId와 연결된 cause refs를 전달하도록 한다. 대표 cause 선택이 필요한 경우 선정 이유/미표현 cause를 추적 가능하게 둔다.
4. Palace actor publication은 source-supported palace-role-function 조합이 실제 근거로 전달될 때만 허용하고, actor 추론만 있는 경우는 현재 guard를 유지한다.
5. document/contract의 기존 Outcome 구현·master 계약을 확인한 뒤 customer assembly 지원 누락만 결정한다.
6. Renderer 표현 변경은 위 trace link가 plan에 도달한 뒤 검토한다. 이 감사에서 renderer 문구 수정은 하지 않는다.

## 분류 목록

| 분류 | 확인된 항목 |
|---|---|
| ENGINE_GAP | 다섯 시나리오에 대해서는 새 engine rule이 원인임을 입증하지 못함. |
| JUDGMENT_GAP | 관계별 facts/functions는 존재하므로 일반 판정 결손으로 단정하지 않음. unified StructuralOutcome type 부재는 상위 graph/assembly 문제와 별도. |
| OUTCOME_FLATTENING | A, E: 독립 Outcome facts는 유지되나 shared causal graph가 없음. |
| MAPPING_GAP | B, generic reason 경로: full cause chain을 읽지 않고 assertion→mechanism/voice로 투영. |
| ASSEMBLY_GAP | D: document/contract domain의 customer mapping/consumer 연결 누락. |
| PALACE_ATTRIBUTION_GAP | C: 일반 역할의 palace association이 Outcome/customer path에 실리지 않음. |
| PUBLICATION_GUARD_OVERREACH | Q8: actor text guard가 evidence-supported attribution을 구별할 source evidence를 받지 않음. |
| DEDUP_LOSS | 없음: 같은 paragraph signature에서 Outcome IDs/activations는 유지됨. |
| RENDERER_GAP | renderer는 concrete reason을 payload에서 받을 수 없지만, 최초 손실은 그 앞의 mapping/plan 경계. 단독 root cause로 분류하지 않음. |
| NO_GAP | 독립 Outcome ID와 scope/period/effect provenance의 기본 보존, 동기간 parallel assertion ID 보존. |

## 종합 답

전문가식 종합의 문서 계약은 Master 05/08/09/17에 존재한다. Runtime에서는 scope snapshot 안의 RelationFact, PatternContext/Policy, ActualStructuralFunction, Role/effect records와 동시 경로까지 살아 있다. Outcome 발행 단계도 개별 결과에 source Judgment snapshot ID와 관련 refs를 남기며 독립 assertion을 유지한다. 그러나 전용 `StructuralOutcome` runtime type과 assertion 사이의 shared cause/protection/limitation graph는 확인되지 않았다. 가장 결정적인 고객 인과관계 손실은 **Outcome/Mapping 경계에서 평탄한 source refs를 full Judgment chain으로 재결합하지 않고 `semanticType/result/provenance → mechanism/voice`로 투영하는 곳**이다. Customer plan은 parallel Outcome IDs를 trace metadata로 보존할 수 있지만 Renderer는 voice 기반 고정 copy만 사용한다. 병목은 Renderer 문구보다 Mapping/Assembly runtime link 부재다.

## 확인한 주요 파일

- Master: `09-engine-integration-spec`, `05-sangshen-byeong-gueung-master`, `08-luck-master`, `13-reading-assembly-spec`, `14-outcome-semantic-spec`, `17-cause-to-life-mapping`, `18-customer-chapter-content-contract`, `19-reading-narrative-blueprint`, `20-reading-renderer-quality-reference`.
- Implementation audit / P4: `10-implementation-audit`, `p4a`–`p4c` reading assembly, `p4e`–`p4f` relationship outcomes, `p4g`–`p4h` health outcomes, `p4i`–`p4j2` money outcomes, `p4k` assertions audit.
- Runtime: `src/lib/judgment/core/{types,policies,structuralEffect,roleEngine,luckScope}.ts`, `src/lib/outcome/{types,money/moneyOutcome,money/fromJudgment,relationship/relationshipOutcome}.ts`, `src/lib/reading/{types,moneyUnits,relationshipUnits}.ts`, `src/lib/reading/customer/{types,outcomeMapping,buildCustomerReadingPlan,renderCustomerReadingKo}.ts`, `src/components/result/singleResultCopy.ts`.
- Closest existing checks: `verify-cs005-sangshen-judgment.mjs`, `verify-cs005-end-to-end.mjs`, `verify-money-outcome-p4i.mjs`, `verify-money-outcome-integration-p4j.mjs`, `verify-relationship-outcome-integration-p4f.mjs`, `verify-customer-reading-ko-p4c.mjs`.
