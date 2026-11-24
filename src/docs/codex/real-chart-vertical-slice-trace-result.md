# Real Chart Vertical Slice Trace Result

## Verdict

The production trace on actual chart fixture **CS-126** finds a complete customer-plan chain for favorable money acquisition. It also finds a `money_retention` Outcome with two competing cause refs; the Judgment relations resolve and a StructuralExplanationUnit preserves them, but that Outcome has no Assembly or Plan semantic unit because its lifecycle is `deferred` and it is not currently effective.

This is the first missing customer-plan link for the competing-path assertion: **`ASSEMBLY_GAP` at `collectMoneyUnits`**. Stop here. No Renderer or later publication behavior was investigated.

## 1. Verify inventory and classification

All 49 registered `verify:*` scripts were rerun after provenance path changes. Result: **28 PASS / 21 FAIL**. All 21 remaining failures report old `src/docs/source/<id>_rev<revision>.md` paths; current authority files are under `src/docs/source/authority/`. No old document copy was made, no source/master was edited, and no verifier was deleted or skipped.

| Classification | Failed verifiers | Evidence |
|---|---|---|
| `STALE_DOCUMENT_PATH` | `verify:judgment-runtime-context`, `verify:judgment-authority-provenance`, `verify:cs005-stem-combination`, `verify:cs005-natal-stem-combination`, `verify:cs005-exposure-root`, `verify:cs005-pattern-candidates`, `verify:cs005-assessment-propagation`, `verify:cs005-pattern-judgment`, `verify:cs005-yongshen-candidates`, `verify:cs005-yongshen-judgment`, `verify:cs005-sangshen-candidates`, `verify:cs005-sangshen-judgment`, `verify:byeong-judgment`, `verify:byeong-contract`, `verify:gueung-v1`, `verify:cs005-end-to-end`, `verify:cs005-monthly-window`, `verify:effect-fact-producer`, `verify:cs005-effect-facts`, `verify:role-function-state`, `verify:cs005-role-function-state` | Failures point to legacy A rev179/A rev180 or C rev215 paths. Current authority files exist as `src/docs/source/authority/A_rev179.md`, `A_rev180.md`, and `C_rev215.md`. These remaining errors are not needed to execute the CS-126 production chart path. |
| `STALE_DOCUMENT_CLAIM` | none observed | D rev152 role-order claim is in current authority; P4-C source/provenance integration passes. |
| `ACTUAL_CODE_REGRESSION` | none observed in this vertical slice | CS-126 runner and P4-C pass; build passes. |
| `LEGACY_TEST_ASSUMPTION` | none conclusively established | Recorded failures are path-resolution errors, not failed assertions against a retired rule. |
| `UNRELATED_TO_VERTICAL_SLICE` | none as the primary classification | Some failed suites are outside the real-chart path, but their observed failure is still stale path. |
| `UNKNOWN` | none | — |

The prior A179/A180 path concern and D hidden-role-order concern were checked against canonical authority locations. The D claim was not force-added to a master.

## 2. Unblock changes

Runtime authority references and byte pins now match existing canonical source files:

- `src/lib/judgment/systems/documentReceipt.ts`: A/C/D/25-7 SHA-256 pins and canonical `authority/` path helper.
- `src/lib/judgment/systems/exposureRootAuthority.ts`, `src/lib/judgment/producers/assessmentPropagation.ts`, `src/lib/judgment/runtime/guEungEffectEvidence.ts`: canonical receipt paths.
- A179/A180 consumers in `hiddenStemFiluneA179.ts`, `byeongCandidates/draftPaths.ts`, and `byeongCandidates/ruleEvidence.ts`: current checked bytes.
- Static A179 refs in Pattern, YongShen, and SangShen evaluators: current authority path.

No Judgment, Outcome, Mapping, Renderer, master, or source rule was changed. The diagnostic runner is `scripts/trace-real-chart-vertical-slice.mjs`.

## 3. Fixture and canonical

- **Fixture:** `CS-126`, existing birth fixture `scripts/fixtures/byeong-judgment-inputs.json`, also used by P4-C and P4-J verification.
- **Reason:** actual birth input, production `runInternalReading`, Sewoon and Month evaluation, and both an active favorable Money Outcome and a deferred Money Outcome with competing refs.
- **Reference time:** `2027-07-15T00:00:00.000Z`.
- **Pillars:** year `辛未`, month `戊戌`, day `乙丑`, time `丁丑`.
- **Judgment scopes:** natal, Daewoon, Sewoon, Month (four snapshots).
- **Selected Month period:** `canonical-period:/monthlyLuck/cards/6`, `2027-07-07T07:36:49.151Z`–`2027-08-07T17:26:25.904Z`.

## 4. Runtime trace and IDs

Observed totals: 4 Judgment snapshots, 16 Money/Relationship OutcomeFacts, 16 Explanation Units, 8 Plan semantic units.

### Outcome A — complete acquisition chain

| Stage | Type / producer | Runtime link |
|---|---|---|
| Judgment snapshot | `LuckScopeState`, `runInternalReading` / `luckScope` | ID `p0-scope:[executionId, ["monthlyLuck","canonical-period:/monthlyLuck/cards/6",1814945809151,1817659585904]]` (actual IDs are serialized nested JSON strings) |
| Judgment fact | `StemRelationFact` | `p0-stem-relation:[scopeId,"generate",entity:/monthlyLuck/cards/6/pillar/stem,entity:/chart/pillars/month/value/ganZhi/stem]` |
| Structural function | `ActualStructuralFunction` → `StructuralFunctionalChange` / `src/lib/reading/structuralExplanation.ts` | same relation ID; actor `食神`; target `正財`; function `operating`; direction `favorable` |
| Outcome | `MoneyOutcomeFact`, `moneyOutcomeFromReading` | `money_acquisition`, domain `money`, favorable, Month; `sourceJudgmentIds` and `sourceRelationIds` resolve |
| Explanation | `StructuralExplanationUnit` | ID `explanation:[outcomeFactId,"money",scopeId,"canonical-period:/monthlyLuck/cards/6"]`; 1 primary, 2 supporting, 0 competing, 0 unresolved refs |
| Customer Plan | `ReadingSemanticUnit` | meaning `recordId` equals Outcome ID; `structuralExplanationUnitIds` includes Explanation ID |

The runner emits the full generated IDs under `idChains`. The key identity checks are: Outcome source relation = Judgment relation = Explanation primary ref; Explanation outcome ID = Outcome ID; Plan semantic meaning record ID = Outcome ID; Plan explanation ref = Explanation ID.

### Outcome B — competing path stops before semantic assembly

| Stage | Observed value |
|---|---|
| Outcome | `money_retention`, domain money, direction `deferred`, Month, lifecycle `deferred`, `currentlyEffective=false` |
| Explanation | one primary cause, **two competing cause refs**, zero unresolved refs; functional changes and provenance resolve |
| Assembly semantic unit | **missing** (`assembly.semanticUnits` lookup by Outcome ID is null) |
| Plan semantic unit | **missing** (`plan.semanticUnits` lookup by Outcome ID is null) |
| First loss | `collectMoneyUnits` in `src/lib/reading/moneyUnits.ts` returns early unless lifecycle is `active` or `reduced` |

The two competing paths exist in the current scope snapshot and remain in Explanation. They are not lost by `unresolvedCauseRefs` or deduplication; lifecycle collection excludes the deferred assertion before it can receive a customer semantic unit.

### Relationship companion

The same chart/month produces `relationship_change_signal` with direction unknown. Its branch relation resolves, but its branch function is `not_evaluated`/`deferred`, with no actor and no `palaceAttribution`. No spouse/colleague attribution is made.

## 5. Unresolved causes

For the selected acquisition, competing retention, and relationship assertions, `unresolvedCauseRefs` is empty. The Outcome’s source Judgment snapshot ID and source relation IDs resolve in the relevant snapshot/relation pool. Thus:

- A (relation absent from source Judgment): **not observed**.
- B (Outcome provenance omitted the source relation): **not observed** for selected assertions.
- C (resolver failed to find a supplied relation): **not observed**.
- The first missing retention edge is downstream of resolution: `collectMoneyUnits` emits no semantic unit for deferred lifecycle.

This chart has no protection or damage refs on the selected Money units. The competing retention assertion has two competing refs, but they do not reach Plan semantics.

## 6. Seven expert questions

| Question | Runtime answer | Status |
|---|---|---|
| 1. What is favorable/unfavorable? | Favorable Month money acquisition (Outcome A); Month retention is deferred (Outcome B). | Answerable in runtime; B has no customer semantic unit |
| 2. Why? | A Month stem generates the natal month stem; actual function is operating/favorable. B has a separate primary relation and two competing paths. | Answerable through Explanation |
| 3. What structure created it? | Both Outcomes’ source relation IDs resolve to Judgment relations in the Month snapshot. | Answerable |
| 4. What protects, mitigates, or worsens it? | No protection/damage refs occur. Competing paths exist for B, but no customer unit carries them. | Partial; first Plan link missing |
| 5. Is an opposite path simultaneous? | B has two `competingCauseRefs`; A has two supporting refs. | Answerable in Explanation; B absent from Plan semantics |
| 6. What life domain and why? | Both are Money-domain Outcomes from the Money producer. A reaches a customer semantic unit; B is excluded by assembly collection. | Partial |
| 7. When? | Both assertions carry the Month scope and exact period above. | Answerable |

The complete customer-facing “why” condition is **not met** for the competing retention assertion because its cause graph does not have a semantic unit in the Plan.

## 7. Stop point and classification

Outcome A’s chain is:

```text
Judgment RelationFact ID
→ StructuralFunctionalChange ID (same relation ID)
→ MoneyOutcomeFact ID (sourceRelationIds includes the relation)
→ StructuralExplanationUnit ID (outcomeFactId matches)
→ ReadingSemanticUnit ID (meaningRef.recordId and explanation ref match)
```

Outcome B’s chain stops here:

```text
Judgment RelationFact ID
→ StructuralFunctionalChange ID
→ MoneyOutcomeFact ID
→ StructuralExplanationUnit ID (two competing cause refs retained)
→ [missing] Assembly ReadingSemanticUnit ID
```

Classification: **`ASSEMBLY_GAP`** relative to requested customer-plan cause-chain coverage. The gate may be intentional because the assertion is deferred and ineffective; this trace cannot decide customer publication policy. The user-requested stop condition applies, so Renderer and later expression were not audited.

## 8. Palace attribution

The relationship companion is not functionally evaluated and has no supported favorable-function + active-role + source-approved palace chain. `palaceAttribution` is absent. The trace therefore neither attributes help to a spouse/colleague nor demonstrates that an actor guard overreaches; the supported-attribution candidate is not present in this fixture.

## 9. Dedup / compression

- The 16 OutcomeFacts remain independent; no overall score or merged judgment is produced.
- Each selected Outcome has its own Explanation Unit.
- Outcome A has its own linked semantic unit. Outcome B is excluded by lifecycle filtering before dedup; its distinct cause refs are not collapsed as duplicates.
- Selected causes have no unresolved refs. This run does not claim global cross-chapter dedup correctness beyond these assertions.

## 10. Determinism and regression

The runner reverses related Judgment arrays, scope order, and Outcome input order. Assertions compare Money Outcome data/IDs, Relationship Outcome data/IDs, Explanation units, and Plan semantic units; results are equal. Outcome B remains absent in both orders.

- `node scripts/verify-customer-reading-ko-p4c.mjs`: **PASS** (eight charts, five chapters, provenance, compression, determinism).
- `node scripts/verify-structural-explanation-phase1.mjs`: **PASS** (synthetic projection regression).
- Registered `verify:*`: **28 PASS / 21 FAIL**, all 21 remaining failures classified `STALE_DOCUMENT_PATH` above.
- `npm.cmd run build`: **PASS**; Vite reports the existing large-chunk advisory.

## 11. Minimal next step

Decide whether a deferred, currently ineffective Money Outcome should have a non-publishing context semantic unit so its cause graph can be referenced in `CustomerReadingPlan`. If approved, the minimum change is at the existing `collectMoneyUnits`/Plan link boundary with a CS-126 regression for Outcome B; do not make it an active customer assertion. If deferred assertions should remain invisible, retain the gate and do not claim a complete competing-path customer trace. No new synthesis, Judgment, Outcome, Mapping, or Renderer rule follows from this audit alone.
