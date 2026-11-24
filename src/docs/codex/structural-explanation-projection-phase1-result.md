# Structural Explanation Projection Phase 1 — 결과

## 결과 요약

Money와 Relationship Outcome producer 및 기존 assertion을 그대로 두고, Reading Assembly에 source ID 기반 `StructuralExplanationUnit` Projection을 연결했다. Projection은 판단을 재실행하거나 새 Outcome을 발행하지 않는다. Outcome이 가리키는 Judgment snapshot에서 동일 relation ID, 실제 function, role/effect 및 연결된 relation records를 조회한다. 미해결 relation ref도 제거하지 않고 `unresolvedCauseRefs`에 남긴다.

새 EX verifier 5개가 통과했고 input permutation 결과가 동일했다. `npm run build`도 통과했다. 전체 등록 `verify:*` 49개 중 26개 통과, 23개는 기존 source document 경로/hash 검증 문제로 실패했다. P4-I 독립 Outcome verifier는 통과했다. P4-J/P4-F/P4-H/P4-B/P4-C의 실제 Judgment integration verifier는 같은 upstream document receipt 검증에서 멈춰 Projection 경로까지 실행되지 못했다.

## 1. 변경한 runtime path

```text
runInternalReading / LuckScopeState snapshots
  + existing MoneyOutcomeFact / RelationshipOutcomeFact
  → assembleReading
  → buildStructuralExplanationUnits(outcomes, source snapshots)
  → ReadingAssembly.structuralExplanationUnits
  → ReadingSemanticUnit.structuralExplanationUnitIds
  → buildCustomerReadingPlan
  → CustomerReadingParagraphPlan.expression.structuralExplanationUnitIds
     + CustomerReadingPlan.structuralExplanationUnits
  → renderCustomerReadingKo(plan)
```

`assembleReading`는 기존 `judgmentCore`, 추가 평가 scope, month snapshot을 Explanation resolver에 공급한다. 기존 Judgment collection 경로에서 사용하던 snapshot 배열은 바꾸지 않아 중복/재집계를 추가하지 않았다. Outcome producer 코드는 수정하지 않았다. `singleResultCopy` free personality preview는 Outcome 자체를 만들지 않아 이 vertical slice의 진입 경로가 아니다. Premium customer plan 및 renderer 입력은 full unit과 ID reference를 가진다.

## 2. 추가 타입과 변경

추가: [structuralExplanation.ts](../../lib/reading/structuralExplanation.ts)

- `StructuralExplanationUnit`: Outcome ID, domain/target/direction/certainty, cause refs, functional changes, 조건부 palace attribution, 지원되는 experienced process, scope/period/provenance.
- `StructuralCausePath`: primary/supporting/competing 구분과 relation/participant/function/source refs.
- `StructuralFunctionalChange`: actor→relation→target, participant IDs, TenGod labels, resolved `ActualStructuralFunction.function/direction`, policy, Role ID, luck effect, protection/damage evidence refs.
- Branch palace relation은 source relation과 participant IDs를 보존한다. 전용 ActualStructuralFunction이 없는 branch fact에 function을 만들어내지 않고 `actualEffect: "not_evaluated"`로 남긴다.

변경: `ReadingAssembly.structuralExplanationUnits`, `ReadingSemanticUnit.structuralExplanationUnitIds`, outcome expression의 `structuralExplanationUnitIds`, `CustomerReadingPlan.structuralExplanationUnits`. Money/Relationship Outcome 타입 및 생성자는 변경하지 않았다. `experiencedProcess`는 기존 `relationship_pressure`/`money_related_problem` assertion에만 복사하며, `recommendedDirection`은 기존 source-supported 값이 없는 Phase 1 입력에서 생략한다.

## 3. Cause resolution / 보호 / 경쟁 경로

- Snapshot은 `OutcomeFact.scopeId`와 `sourceJudgmentIds`가 실제 snapshot ID를 지시할 때만 조회한다.
- Primary cause refs는 Outcome `sourceRelationIds` 전체를 유지한다. snapshot에서 확인되지 않는 것은 `unresolvedCauseRefs`에 별도 기록하고 삭제하지 않는다.
- Money는 source relation participant가 연결하는 동일 scope relation 경로를 찾아 별도 path로 유지한다. 연결되는 관계는 한 `mixed` 의미로 합치지 않는다.
- actual function의 `function`, `direction`, `policyId`, condition/resolution evidence, Role path refs, current effects, protection block 및 Byeong damage refs를 원본 ID로 참조한다.
- `competing`은 연결된 path의 저장된 실제 direction이 Outcome direction과 반대일 때만 표시한다. `deferred`/미평가 function은 경쟁으로 분류하지 않는다.
- 결정적 ID는 source Outcome ID 및 snapshot/relation identity 기반이다. 입력 목록/record는 출력 전에 ID 정렬하고, 같은 Outcome·target·cause·scope·period identity만 중복 제거한다.

## 4. EX-01–EX-05 fixture 전문 및 JSON 요약

Verifier: [verify-structural-explanation-phase1.mjs](../../../scripts/verify-structural-explanation-phase1.mjs). 아래 fixture는 기존 relation/action/source label과 Outcome 의미를 재사용한 contract fixture다. source ID, 확정 상태나 기능을 producer 밖에서 추정하지 않는다.

### EX-01 · production

입력: `Outcome=EX-01`, `sourceJudgmentIds=[J-EX]`, `sourceRelationIds=[R-food-wealth]`, existing `R-food-wealth: 食神 → 財`, `ActualStructuralFunction=(operating,favorable)`.

```json
{
  "id": "explanation:[EX-01,money,J-EX,EX-period]",
  "outcomeFactId": "EX-01",
  "domain": "money",
  "target": { "id": "wealth", "referent": "money" },
  "direction": "favorable",
  "certainty": "confirmed",
  "primaryCauseRefs": ["R-food-wealth"],
  "unresolvedCauseRefs": [],
  "functionalChanges": [{
    "actorId": "food", "relationId": "R-food-wealth", "relation": "generate",
    "targetId": "wealth", "actorTenGod": "食神", "targetTenGod": "正財",
    "actualEffect": "operating", "direction": "favorable", "policyId": "POL-R-food-wealth",
    "roleStateIds": [], "effectIds": [], "protectionRefs": [], "damageRefs": []
  }],
  "scope": "natal", "scopeId": "J-EX"
}
```

기대 충족: earning assertion 그대로 유지, 食神→財 producer edge와 function state 확인 가능.

### EX-02 · damage and protection

입력: `Outcome=EX-02`의 기존 `wealth_can_weaken_needed_support`, relation refs `R-wealth-resource` 및 `R-peer-wealth`; 둘째 경로의 `ActualStructuralFunction.structuralEffect.blockedBy.active_protection` evidence refs에 기존 두 relation ID.

```json
{
  "outcomeFactId": "EX-02",
  "domain": "money",
  "direction": "unfavorable",
  "primaryCauseRefs": ["R-peer-wealth", "R-wealth-resource"],
  "functionalChanges": [
    { "relationId": "R-peer-wealth", "actorId": "peer", "relation": "control",
      "targetId": "wealth", "actualEffect": "reduced", "direction": "favorable",
      "protectionRefs": ["R-peer-wealth", "R-wealth-resource"] },
    { "relationId": "R-wealth-resource", "actorId": "wealth", "relation": "control",
      "targetId": "resource", "actualEffect": "operating", "direction": "favorable",
      "protectionRefs": [] }
  ],
  "experiencedProcess": { "result": "wealth_can_weaken_needed_support", "sourceIds": ["EX-02", "J-EX", "R-peer-wealth", "R-wealth-resource"] }
}
```

Protection refs는 fixture가 넣은 `active_protection` block evidence에서만 복사된다. 새 보호 판정은 하지 않는다.

### EX-03 · concurrent paths

입력 relation 3개: `R-food-wealth`(食神→財, favorable), `R-wealth-killing`(財→殺, unfavorable), `R-food-killing`(食神→殺, favorable). Outcome의 primary cause ref는 `R-food-wealth`; 나머지는 동일 snapshot에서 실제 participant로 연결됨.

```json
{
  "outcomeFactId": "EX-03",
  "primaryCauseRefs": ["R-food-wealth"],
  "supportingCauseRefs": ["R-food-killing"],
  "competingCauseRefs": ["R-wealth-killing"],
  "causePaths": [
    { "role": "primary", "relationIds": ["R-food-wealth"] },
    { "role": "supporting", "relationIds": ["R-food-killing"] },
    { "role": "competing", "relationIds": ["R-wealth-killing"] }
  ]
}
```

3개 path 및 3개 `ActualStructuralFunction`이 개별 ref로 유지되고 결과는 `mixed`로 바뀌지 않는다.

### EX-04 · source-supported attribution / palace-only negative

Positive fixture는 `relationship_formation`, 기존 `A:I-22` + `A:OP-R03` provenance, 실제 day-palace branch relation, source participant에 포함된 favorable+operating `ActualStructuralFunction`이 전부 있을 때만 `palaceAttribution.referent="partner"` candidate를 만든다. 해당 function relation ID와 rule/policy 및 승인 source IDs가 attribution source list에 포함된다.

```json
{
  "outcomeFactId": "EX-04",
  "palaceAttribution": {
    "referent": "partner", "palaceEntityId": "PALACE-DAY",
    "sourceIds": ["EX-04", "A:I-22", "A:OP-R03", "BR-PALACE", "PALACE-DAY", "STEM-PARTNER", "R-partner-favorable", "RULE-R-partner-favorable", "POL-R-partner-favorable"]
  },
  "functionalChanges": [
    { "relationId": "BR-PALACE", "relation": "six_combination", "actorId": null,
      "participantIds": ["BR-INCOMING", "PALACE-DAY"], "actualEffect": "not_evaluated" },
    { "relationId": "R-partner-favorable", "relation": "generate", "actorId": "STEM-PARTNER",
      "targetId": "BR-INCOMING", "actualEffect": "operating", "direction": "favorable" }
  ]
}
```

Palace-only negative fixture에는 partner attribution이 없다. `比劫 exists → friend helps` 경로도 생성하지 않는다. Renderer 문장은 생성하지 않으며 actor attribution은 source-linked candidate data다.

### EX-05 · relationship timing

기존 관계 pressure Outcome과 snapshot ID `J-EX`, sewoon scope, period `[2026-01-01, 2027-01-01)`를 입력한다.

```json
{
  "outcomeFactId": "EX-05",
  "domain": "relationship",
  "target": { "id": "close_relationship", "referent": "close_relationship" },
  "direction": "unfavorable", "certainty": "confirmed",
  "primaryCauseRefs": ["R-food-wealth"],
  "functionalChanges": [{ "relationId": "R-food-wealth", "actualEffect": "operating" }],
  "experiencedProcess": { "result": "close_relationship_can_face_strain", "sourceIds": ["EX-05", "J-EX", "R-food-wealth", "A:I-15", "A:OP-R03"] },
  "scope": "sewoon", "scopeId": "J-EX",
  "period": { "periodId": "EX-period", "from": "2026-01-01T00:00:00.000Z", "to": "2027-01-01T00:00:00.000Z" }
}
```

기간/확정도/relationship source reason은 Outcome에서 그대로 보존된다. branch relation은 실제 구조 function record가 없는 경우 `not_evaluated`로 유지한다.

## 5. Source→Outcome→Explanation→Plan ID chain

```text
LuckScopeState.id = Outcome.sourceJudgmentIds[0] = Outcome.scopeId
Outcome.sourceRelationIds[] / sourceRoleIds[] / sourceLuckEffectIds[] / provenance[]
  → StructuralExplanationUnit.outcomeFactId = Outcome.id
  → StructuralExplanationUnit.primaryCauseRefs / functionalChanges / provenanceIds
  → ReadingSemanticUnit.meaningRef.recordId = Outcome.id
  → ReadingSemanticUnit.structuralExplanationUnitIds[]
  → CustomerReadingParagraphPlan.sourceOutcomeIds[]
     + expression.structuralExplanationUnitIds[]
  → CustomerReadingPlan.structuralExplanationUnits[].id
  → renderCustomerReadingKo(plan)
```

Customer plan은 기존 `sourceMappingIds`/`lifeMechanismIds`도 호환 목적상 유지하되, outcome expression에 구체 Explanation unit IDs를 추가한다. Renderer가 아직 길게 설명하지는 않지만 입력 Plan에는 structural reason graph를 참조할 ID와 실제 unit payload가 함께 있다.

## 6. Determinism 및 Dedup 결과

- EX verifier에서 outcome 배열과 Judgment relation/function record 순서를 뒤집어도 JSON 전체 unit 결과가 같았다.
- unit/cause path/provenance refs는 explicit lexicographic ID sort를 쓴다.
- 같은 EX-01 source assertion을 그대로 두 번 전달했을 때 한 unit으로 dedup됐다.
- 각 unit key는 Outcome assertion ID + target + cause refs + scope + period다. 다른 Outcome IDs 또는 다른 relation path는 같은 결과 의미여도 제거하지 않는다.
- `verify-customer-reading-ko-p4c.mjs`에 assembly→Plan unit links 확인 및 기존 전체 Plan permutation `deepEqual` 검사를 추가했다. 단, 실행 시 source receipt 선행 문제로 이 추가 assertion까지 도달하지 못했다.

## 7. Regression 결과

| 실행 | 결과 |
|---|---|
| `npm.cmd run build` | PASS. TypeScript + Vite build. Vite existing large chunk warning. |
| `npm.cmd run verify:structural-explanation-phase1` | PASS. EX-01–05, input order invariance, exact duplicate dedup. |
| 등록된 package `verify:*` 49개 | 26 PASS / 23 FAIL. 대부분 `src/docs/source/A_rev179.md` (일부 `A_rev180.md`) 경로 누락 또는 이에 따른 document receipt/hash claim 실패. |
| `node scripts/verify-money-outcome-p4i.mjs` | PASS. 55 facts/provenance; 기존 P4-I mixed outcome coverage. |
| P4-J / P4-F / P4-H / P4-B / P4-C integration scripts | Projection 회귀를 검증하기 전에 공통 `documentReceipt.ts`의 D/hidden-role-order 또는 A_rev179/180 source lookup에서 중단. |

실패한 package script 명칭: `verify:judgment-runtime-context`, `verify:judgment-authority-provenance`, `verify:cs005-stem-combination`, `verify:cs005-natal-stem-combination`, `verify:cs005-exposure-root`, `verify:cs005-pattern-candidates`, `verify:cs005-assessment-propagation`, `verify:cs005-pattern-judgment`, `verify:cs005-yongshen-candidates`, `verify:cs005-yongshen-judgment`, `verify:cs005-sangshen-candidates`, `verify:cs005-sangshen-judgment`, `verify:byeong-judgment`, `verify:byeong-regression`, `verify:byeong-contract`, `verify:gueung-v1`, `verify:cs005-end-to-end`, `verify:cs005-monthly-window`, `verify:effect-fact-producer`, `verify:cs005-effect-facts`, `verify:role-function-state`, `verify:cs005-role-function-state`, `verify:judgment-p0`.

P4-C direct run produced `TypeError: Unverified document claim: D/hidden-role-order` from `documentReceipt.ts` before fixture execution. This was observed in source verification itself; no authority file was changed to bypass it.

## 8. Information loss 결과

EX-01–05의 verifier 입력에서 제공된 Outcome IDs, source refs, matched Judgment functional states, period, certainty 및 provenance 중 Explanation projection에서 사라진 값은 **0**이다. 미해결 relation ID는 제거하지 않고 unresolved ref로 기록한다. Protection, damage, role, luck effect 및 source-supported palace attribution은 값이 실제 snapshot에서 확인될 때만 채운다. 이 결과는 source Outcome/Judgment에 애초에 존재하지 않는 cause evidence가 복원됐다는 뜻은 아니다.

Customer plan IDs의 실제 premium birth fixture round trip은 P4-C upstream 실패 때문에 이번 환경에서 실행 증명되지 않았다. TypeScript build와 plan wiring 컴파일은 통과했고, 동일 링크를 확인하는 회귀 assertion은 추가돼 있다.

## 9. Remaining GAP

1. Branch relation에는 현재 `ActualStructuralFunction`이 없는 경우가 있어 relation/participant/period는 보존되지만 function state는 `not_evaluated`다.
2. 기존 outcome producers가 source participant/role/effect refs를 내보내지 않은 정보는 이번 Phase에서 복원할 수 없다. unresolved source relation ref는 조회 불가로 남는다.
3. Palace attribution은 source-approved relationship formation + active favorable function + natal palace relation이 확인되는 경우에만 `partner` candidate로 보존한다. 다른 생활 actor/영역 source mapping은 추가하지 않았다.
4. Experienced process는 existing money-related problem/relationship pressure semantics에서만 전달한다. 공통 structural favorable + independent high pressure pair를 자동 결합하는 rule은 만들지 않았다.
5. `recommendedDirection`에 연결되는 source-backed advice field는 이번 두 Outcome type에 없어 비어 있다.
6. Renderer는 Phase 1에서 아직 구조 graph를 문장으로 풀지 않는다. Plan payload 차이는 IDs/typed unit으로 전달 가능하나 문장 품질 검증은 Phase 2다.
7. Full integration regressions는 authority/source path mismatch 복구 후 재실행해야 한다.

## 최종 판단

Phase 1 runtime projection은 기존 Money/Relationship Outcome을 하나의 `StructuralExplanationUnit`으로 연결하고, 확인 가능한 actor/relation/target/function, role/effect, protection/damage, competing path, scope/period/certainty/provenance를 source IDs와 함께 Customer Plan까지 넘긴다. 새 판단·점수·Outcome은 추가하지 않았다. EX fixtures의 구조 payload 질문에는 답할 수 있지만, 실제 전체 fixture round trip 중 upstream 문서 receipt가 차단된 항목이 있어 Regression 전체 green은 아직 입증되지 않았다.
