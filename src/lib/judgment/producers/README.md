# Canonical → judgment fact producers

`produceJudgmentFacts(calculatedChart, options?)` is a detached, deterministic fact pipeline.
It does not call or extend the existing evaluator and does not alter canonical calculations,
contract semantics, UI, i18n, review policies, or persistence. No CS data is imported.

- `fromCanonical`: reuses the existing canonical fact projector; adds original birth/time,
  solar-term, uncertainty and version metadata. Pillar character splitting is an adapter,
  not a calendar calculation. No unavailable natal time entity is synthesized. Existing
  stem ten gods, twelve stages and luck cards are copied, not recomputed.
- `hiddenStemProducer`: imports `HIDDEN_STEM_ROLE_TABLE`, retaining all its entries and
  display role order, and uses the existing `calculateTenGod` function. The table is not
  duplicated. Its legacy identity is explicit and document-default compatibility remains
  unverified (`separate-reference`, `not-checked`); this layer does not silently repair it.
- `relationFactProducer`: emits structural presence candidates and investigated sets using
  versioned lookup data in `relationCatalog.ts`. It covers five stem combinations; directed
  generation/control via the existing ten-god function; six/half/three/season combinations,
  clash, pair/full punishment, harm, break and wonjin. Same-letter entities at distinct
  positions/periods remain distinct. No combination means actual removal, transformation,
  weakening, role or favorable/unfavorable judgment. Catalog data is a producer definition,
  not a claimed operator confirmation or new interpretation rule.
- `evidenceProducer`: records only the actual deterministic pipeline. Customer input is
  additionally attributed only when the caller supplies a receipt reference. No independent
  cross-check, reverse-inference, source-document or operator-confirmed record is fabricated.
  Evidence remains provisional with explicit verification limitations. Canonical value
  assessment is preserved separately; legacy `confirmed` is not document certification.
- `validation`: checks graph identities, source facts, evidence links, contract schemas,
  participant coverage, and consistent pipeline provenance. It does not verify calendar
  truth or replace the contract bundle's execution-scope validation.

## Observation versus execution scope

By default all supplied canonical entities belong to one **unselected observation universe**,
including luck cards for different periods. No current period or OP-L01 comparison scope is
selected. `options.relationScopes` lets the caller declare explicit observation universes;
it does not drop the original projected entities/facts. Scope IDs and each participant's
`sourceScope` (`natal`, `greatLuck`, `yearlyLuck`, `monthlyLuck`) preserve the origin.
Structural candidates across nonconcurrent periods are not claims of simultaneous action.

Coverage is complete **for the declared available entity universe and relation kind**.
Unknown/missing pillars remain in `unavailableEntityFactRefs` and canonical uncertainty;
complete coverage is not proof that an entire natal chart is known. Present relations are
emitted; investigated sets also retain nonmatching combinations. No absence inferred from
missing input is emitted. All parties belong to their coverage universe.

These observation scopes deliberately are not `ScopeReference` execution scopes. They must
not be passed to `validateContractBundle` as already OP-L01-approved direct comparisons.
A future evaluator must select and bind a valid execution scope with provenance, handling
OP-L02/IR-01 state separately. This stage generates no RuntimeState, carry decision, rule
application, approval, publication decision or RoleState (`roleStates` is always empty).

The pipeline has one versioned producer identity. Component method/table/catalog references
explain each fact's derivation; input canonical roots and evidence output references remain
explicit. This avoids pretending independent component calls are independent cross-checks.
Future external producers must use the existing explicit handoff contract; this stage accepts
no external derived facts or prefilled roles.

## Verification

`npm run verify:judgment-producers` uses non-CS calculation input and generic labeled
entities. It checks stable JSON (including reordered input keys), input immutability,
unchanged canonical values, existing table/ten-god parity, relation categories and coverage,
producer identity, unique IDs, uncertain/unsupported time, honest evidence and empty roles.
The existing 118 contract checks and prior verify scripts remain separate and unchanged.

Remaining evaluator prerequisites include document-compatible hidden-stem data verification,
real birth/independent calculation provenance where required, and the still-separate role,
execution-scope and carry-state integration. Producer completion does not grant publication
or claim that the CS-005 judgment evaluator is already ready or implemented.
