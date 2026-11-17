# Minimal stem-combination evaluator

Source authority: A rev179 A-8-4 OP-T10/OP-T08/OP-T04, A-5 OP-T03/OP-T07, A-8-6 OP-L01/OP-L02, A-8-9 IR-01.

`evaluateStemCombination({ producer, context, upstream? })` is a deterministic, detached, in-memory structural evaluation. It is not wired into the old evaluator, UI or publication. It consumes existing producer relation observations, never hidden-stem values, role assignments or CS expected judgments. A179 must be selected explicitly. Producer observations are retained unchanged; selected execution observations get bound IDs that preserve original relation IDs and producer/evidence lineage.

Responsibilities:

- `selectScope`: validates producer/context, requires investigated combination-pair coverage and projects only current OP-L01 participants.
- `evaluateLuckToLuckCombination`: evaluates current direct luck pair first, both weakened, neither reusable for natal combinations. Weakening is qualitative; no score or generated/controlled outcome is calculated.
- `evaluateLuckToNatalCombination`: evaluates the current newly introduced luck against eligible natal stems in year/month/time order. Day is excluded; stopped natal stems cannot be reused. Earlier luck/natal actions are not reapplied at the monthly stage.
- `applyCombinationState`: emits actual RuntimeState/application/processing records, both stopped on luck/natal combination. Active baseline means no combination restriction established by this slice, not a full assessment of the stem's strength/function.
- `carryForward`: validates original-state lineage, previous stage and period selection, copies natal changes with inherited provenance, preserves IDs/causes/validity, records one destination consumption. Previous luck/natal stopped luck states may be referenced by their original state IDs, without inventing inherited luck states. Luck-pair weakening is never carried. `validateContractBundle` enforces duplicate-source/provenance and consumption integrity.
- `index`: emits empty RoleState, hidden-stem judgment deferred, regressionReady/publicationReady false. No current wall clock is read.

Runtime functional states: active/weakened/stopped. Inheritance is `originMode: inherited`, not a functional enum. No restored transition is produced. Source causation is retained as application refs (`ruleId`, version, scope/execution IDs); carry exposes sourceStateRef/sourceStage/validity/inheritedThrough.

Supported CS route: natal -> 己未 great -> 丙午 year -> January 2027 辛丑 month. 丁未 year is a separate post-立春 branch from the same great snapshot and cannot parent January. The generic evaluator has no CS ID, expected role, birth date or expected judgment in executable logic.

Boundaries remain explicit:

- Natal-internal combinations involving non-day stems are deferred for OP-T01/T02/T09/T12; these rules are not implemented in this slice. No natal combination is present in CS-005.
- Unknown time / incomplete four natal stems or unresolved execution periods return deferred, without active-state claims.
- Source validity must cover the complete destination period. Partially overlapping periods require a separate boundary split; current code rejects them without manufacturing restoration.
- A historical stopped luck stem intersecting a new luck pair is explicitly rejected as an unsupported boundary. No undocumented precedence is inferred for it.
- Current scope contracts support natal/great/year/month, at most two direct luck stems. Daily scope is unsupported; the daily OP-L01 rule is not reinterpreted or implemented through a new enum.
- No natal strength, 未 hidden-stem reconstruction, structure/useful/supporting/harmful/rescue role judgment, branch fortune, customer wording, independent validation or publication is generated.

Verification: `npm run verify:cs005-stem-combination`. Calendar-derived CS input uses the document's reversed date and a synthetic representative at its stated hour-range lower endpoint, never claimed to be an observed exact birth time. Rule-unit synthetic arrangements are labeled as facts, not actual calendar assertions. C C-10 expectations are read only in assertions. The verified January expectation is that natal 丙 is not stopped; favorable/unfavorable grades and the supporting-god role remain outside this evaluator.
