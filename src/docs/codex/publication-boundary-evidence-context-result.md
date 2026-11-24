# Publication Boundary & Evidence Context Result

## Result

The publication boundary now separates eligible customer claims from non-public Outcome evidence. CS-126 `money_retention` remains deferred and does not create a customer semantic unit or paragraph. Its Outcome and full Structural Explanation are preserved in `CustomerReadingPlan.evidenceContext`, including two competing cause refs.

```text
money_retention Outcome
→ StructuralExplanationUnit
→ CustomerEvidenceContext
↛ CustomerSemanticUnit
↛ paragraph
```

`not publishable ≠ discarded` is verified for the requested deferred and inactive cases.

## 1. Publication eligibility table

The shared rule is `evaluateOutcomePublicationEligibility()` in `src/lib/reading/publicationEligibility.ts`. It adds no Judgment rule.

| Outcome state | Decision | Plan representation |
|---|---|---|
| confirmed + active + currently effective | publishable | semantic unit; qualification `confirmed` |
| contextual + effective | publishable | semantic unit; qualification `contextual` |
| reduced + effective | publishable | semantic unit; lifecycle `reduced` and qualification preserved |
| conditional + effective + confirmed trigger with evidence IDs | publishable | semantic unit; qualification `conditional` and trigger evidence IDs preserved |
| conditional without confirmed trigger evidence | internal only | evidence context; `PUBLICATION_INELIGIBLE` |
| deferred | internal only | evidence context; `PUBLICATION_INELIGIBLE` |
| inactive | internal only | evidence context; `PUBLICATION_INELIGIBLE` |
| stopped | current claim prohibited | evidence context; `PUBLICATION_INELIGIBLE` |
| expired temporal status | history only | evidence context; `PUBLICATION_INELIGIBLE` |
| any `currentlyEffective=false` | not a current customer semantic | evidence context where supplied to the premium plan |

Existing domain and period checks remain after the shared rule. Money, Relationship, and Health collectors all call it. Future facts with `currentlyEffective=false` are no longer emitted as customer semantic units. Existing source facts remain available to premium internal evidence context. Conditional publication requires the new `ReadingAssemblyInput.publicationConditions` entry with a confirmed trigger and nonempty evidence IDs; absent evidence is not inferred.

## 2. Changed runtime types and paths

- `ReadingAssemblyInput.publicationConditions`: explicit source evidence for a conditional trigger. It is retained on premium Assembly for deterministic evidence reconstruction and omitted from free Assembly.
- `ReadingSemanticUnit.publicationQualification`: preserves the publication qualification (`confirmed`, `contextual`, `reduced`, or `conditional`) and any condition evidence IDs.
- `CustomerEvidenceContext` in `src/lib/reading/customer/types.ts`: contains sorted outcome IDs/status/provenance, explanation unit IDs and full Explanation Units, unresolved cause refs, and classified gap IDs.
- `CustomerReadingPlan.evidenceContext`: includes facts absent from the Plan’s publishable semantic units. It has deferred, inactive, stopped, expired, and ineffective outcome ID sets.
- `buildCustomerEvidenceContext()` in `src/lib/reading/customer/evidenceContext.ts`: creates stable IDs and deterministic sorted context.
- `assembleReading()` publishes Outcome Explanation Units only for premium scope. Free scope does not receive premium-only Explanation or conditional evidence.
- `collectMoneyUnits`, `collectRelationshipUnits`, and `collectHealthUnits` use the same eligibility function.

The existing `CustomerReadingPlan.structuralExplanationUnits` contract remains limited to explanations used by published semantic units. Non-public explanations are stored under `evidenceContext.explanationUnits` instead.

## 3. CS-126 before / after

Fixture: existing real birth chart **CS-126**, from `scripts/fixtures/byeong-judgment-inputs.json`; reference `2027-07-15T00:00:00.000Z`; pillars `辛未 / 戊戌 / 乙丑 / 丁丑`. The real-chart runner returns 4 Judgment scopes and 16 Money/Relationship OutcomeFacts.

### Before

`money_retention` had lifecycle `deferred`, temporal status `current`, `currentlyEffective=false`; the Outcome and Explanation existed, with two competing cause refs. `collectMoneyUnits()` correctly withheld it from semantic units. But the Plan kept only explanations referenced by used semantic units, so the deferred Explanation did not survive into the Plan.

### After

- No semantic unit and no paragraph are created for the deferred Outcome.
- `evidenceContext.deferredOutcomeIds` includes the Outcome ID.
- `evidenceContext.outcomes` retains lifecycle, temporal status, effectiveness, certainty, domain, scope, exact period, Judgment/relation/role/effect/participant IDs, provenance, and explanation IDs.
- `evidenceContext.explanationUnits` contains the full StructuralExplanationUnit: primary cause, both competing cause refs, functional changes, protection/damage refs (empty for this fixture), period, certainty, provenance, and unresolved refs.
- The context includes a `PUBLICATION_INELIGIBLE` gap classification. It does not create a Renderer gap or alter chapter readiness.

### Money acquisition path remains published

The separate CS-126 favorable `money_acquisition` remains connected:

```text
Month StemRelationFact (generate; Month stem → natal month stem)
→ ActualStructuralFunction / StructuralFunctionalChange (operating, favorable)
→ MoneyOutcomeFact (money_acquisition; Month)
→ StructuralExplanationUnit (one primary, two supporting refs)
→ ReadingSemanticUnit
→ outcome paragraph with StructuralExplanationUnit reference
```

The trace runner `scripts/trace-real-chart-vertical-slice.mjs CS-126` emits the complete serialized IDs and asserts the links.

## 4. P-01 through P-06 fixtures

`scripts/verify-publication-boundary-evidence-context.mjs` uses CS-126 production Outcomes as the base and varies only publication state/evidence for boundary cases.

| Fixture | State | Semantic unit | Evidence context | Result |
|---|---|---:|---:|---|
| P-01 | confirmed + effective | yes | n/a | PASS |
| P-02 | actual CS-126 deferred retention, Explanation has 2 competing refs | no | yes, full Explanation and refs | PASS |
| P-03 | inactive + ineffective | no | yes, Explanation retained | PASS |
| P-04 | reduced + effective | yes | qualification `reduced` retained | PASS |
| P-05 | conditional + trigger confirmed with source ID | yes | qualification and source ID retained on semantic unit | PASS |
| P-06 | conditional + trigger missing | no | yes, reason `conditional_trigger_missing` | PASS |

The verifier also checks stopped, expired, and ineffective decisions; reverse input order yields identical semantic IDs, evidence context IDs/content, Explanation IDs, and gap classification.

## 5. Renderer and readiness boundary

`renderCustomerReadingKo()` constructs its lookup from `plan.semanticUnits` (`src/lib/reading/customer/renderCustomerReadingKo.ts`). It does not read `evidenceContext`. P-02 additionally verifies no paragraph lists the deferred Outcome ID. QA/readiness tooling can inspect the context without making it customer copy.

Gap categories are kept distinct:

- Actual source gaps remain `SOURCE_GAP`.
- Actual missing engine/plan mapping links are `ENGINE_GAP`.
- Deferred, inactive, stopped, expired, or otherwise ineligible claims are `PUBLICATION_INELIGIBLE`.
- `RENDERER_GAP` is copied only from an existing assembly Renderer gap; ineligible Outcome evidence does not create one.

Publication-ineligible evidence does not make a chapter less ready by itself. The context records why it was withheld.

## 6. Determinism

The P-01~P-06 verifier reverses the Outcome list and relevant Judgment scope/fact arrays. It compares semantic unit IDs, evidence context, Explanation IDs, and gap IDs/classifications. **PASS.** The real-chart runner also reports stable Outcome, Explanation, and Plan semantic results after reversing related arrays.

## 7. Regression results

| Check | Result |
|---|---|
| Structural Explanation Phase 1 | PASS — 5 fixtures; order invariant; duplicate handling |
| Real-chart vertical slice, CS-126 | PASS — acquisition reaches Plan; deferred retention reaches evidence context only |
| P-01~P-06 publication fixtures | PASS |
| P4-C customer reading | PASS — eight charts, five chapters, provenance, compression, determinism, KO UI |
| P4-I Money | PASS — 55 facts/provenance; mixed retention/outflow/difficulty, protection/reactivation/expiry |
| P4-J Money integration (additional run) | PASS — protection evidence, monthly window, scope reuse, Free leakage zero |
| Relationship Outcome P4-F | PASS — 32 facts/provenance; inactive/future publication checks and order invariance |
| TypeScript + production build (`npm.cmd run build`) | PASS; existing large-chunk advisory remains |
| `git diff --check` | PASS |

The P4-C and P4-F verifier expectations were updated to assert the new shared publication rule: non-effective/non-publishable facts are absent from semantic units and retained in premium evidence context.

## 8. Older authority-path failures

The previous registered 49-script inventory recorded **28 PASS / 21 FAIL**. The 21 remaining failures were classified `STALE_DOCUMENT_PATH` and reference legacy A rev179/A rev180/C rev215 paths rather than `src/docs/source/authority/`. They are tracked separately from this publication-boundary regression set; no authority documents or claims were fabricated to clear them. The new publication verifier is registered separately as `verify:publication-boundary-evidence-context` and passes.

## 9. Remaining gaps

- Production does not yet supply conditional trigger evidence; P-05 verifies the explicit Assembly input contract only. Until such source evidence is wired, conditional facts remain internal.
- CS-126 has no protection/damage refs on the selected deferred retention. The context preserves empty arrays and all actual competing refs; a separate real chart is needed to exercise a nonempty protection chain at this boundary.
- Free scope intentionally omits premium Outcome explanations and evidence context. Premium internal evidence context does not become Renderer input.
- Existing stale authority-path verifiers remain as listed above.
