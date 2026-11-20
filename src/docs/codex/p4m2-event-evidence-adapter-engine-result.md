# FILUNE P4-M.2 Event Evidence Adapter + Event Timing Engine

Final: `READY_FOR_EVENT_TIMING_AUDIT`

## A. Architecture

| Layer | Implementation |
|---|---|
| Common Event Evidence adapter | `buildEventEvidence()` reads existing scope snapshots, relations, actual functions, current roles, LuckEffects, Money Outcome corroboration and explicitly supplied event context. |
| Common Event Timing entry point | `buildEventTiming()` invokes the adapter, then applies event policies without recalculating Judgment. |
| Contract policy | Independent `applyContractTimingPolicy()` for opportunity, delay and process trouble. |
| Business policy | Independent `applyBusinessTimingPolicy()` for start, delay, expansion, adjustment and restructure. |
| Reading Assembly | Accepts `eventTimingFacts` as read-only input and reuses each fact ID in the existing time chapters. |
| Judgment / Outcome direction | Event Timing imports Judgment and existing Money Outcome types. No Judgment or domain Outcome producer imports Event Timing. Relationship outcomes are not used as a business shortcut. |

Event context keys are explicit: `event.contract.process`, `event.business.startGoal`, `event.business.operating`, `event.business.adjustment`, and `event.business.restructure`. No customer state is inferred from the chart. Event facts preserve source class, source scope, scope ID, period, certainty, current lifecycle, Judgment/relation/role/Outcome/LuckEffect IDs and provenance.

## B. Event Evidence Mapping

The following Master 15 §6A mappings are implemented conditionally. Every mapped fact requires a current linked path and explicit matching event context; a TenGod label or overall favorable/unfavorable direction alone cannot emit a fact.

| Evidence row | Implementation gate |
|---|---|
| Contract `document_support` | Current favorable relation involving an 印 participant that is itself a current linked role, plus known contract context. |
| Contract `document_obstruction` | Current adverse control path linking 印 and a required 食神/傷官 role. |
| Contract `institutional_instability` | Current adverse relation involving a current 官 role and known contract context. |
| Contract `support_function_stopped` | Required current 印 role is stopped/inactive with a source-linked block. |
| Contract `binding` | Effective current 合 relation linked to an already mapped document-support path. |
| Contract `contract_trouble` | Current adverse resource/officer role path; does not assert legal dispute, breach or failure. |
| Business `business_activity_support` | Current favorable 食神/傷官生財 path, current role link and non-deferred matching Money Outcome. |
| Business `business_result_support` | Same linked realized-output path; kept separate from activity. |
| Business `business_start_support` | Start goal explicitly supplied and the linked production/result path is current. |
| Business `business_expansion_support` | Existing business explicitly supplied and the linked production/result path is current. Money acquisition alone is insufficient. |
| Business `business_adjustment_need` | Explicit adjustment context plus current adverse output-related path; Timing additionally requires the same path supported in Daewoon. |
| Business `business_restructure_trigger` | Explicit existing-business context, current business path, branch clash linked through root facts, and weakened target root. Clash alone is insufficient. |
| Business `business_execution_obstruction` | Known start/operating context plus current adverse output-related control/combine path. |

All adapter mappings retain `SOURCE_INFERENCE`; no mapping is upgraded to `SOURCE_EXPLICIT`. Event evidence is read-only and is deduplicated by event/evidence type, participant path, origin and source snapshot.

## C. Timing Results

| Event | Status | Implemented behavior / remaining scope |
|---|---|---|
| Contract favorable | `IMPLEMENTED · CONDITIONAL` | Sewoon support remains independently reportable; Month requires its own support and the direct parent annual opportunity. |
| Contract delay | `IMPLEMENTED · CONDITIONAL` | Sewoon obstruction can stand alone; a locally obstructed Month requires the linked annual opportunity. Delay never creates failure. |
| Contract process trouble | `IMPLEMENTED · CONDITIONAL` | Kept separate from delay and termination. Legal dispute claims are excluded. |
| Contract finalization | `ENGINE_GAP` | Day Judgment generation/finalization remains not implemented end-to-end. Year/Month facts are not blocked. |
| Contract termination/restructure | `ENGINE_GAP` | The existing Event Evidence mapping does not provide a target-specific termination/change trigger. No clash-only inference is made. |
| Business start favorable | `IMPLEMENTED · CONDITIONAL` | Explicit start goal and linked current production/result path; annual result survives absent Month evidence. |
| Business start delay | `IMPLEMENTED · CONDITIONAL` | Current annual or monthly execution obstruction is separate from success/failure. |
| Business expansion | `IMPLEMENTED · CONDITIONAL` | Requires known operating-business context, linked path at Daewoon and Sewoon, and Month corroboration for a monthly window. |
| Business adjustment | `IMPLEMENTED · CONDITIONAL` | Requires supportive Daewoon and adverse Sewoon on the same source path. |
| Business restructure | `IMPLEMENTED · CONDITIONAL` | Requires an explicitly linked current clash/root change; direction follows the affected path. |

Scope roles: Daewoon supplies long-term expansion context; Sewoon carries annual event assertions; Month independently confirms or obstructs the annual path using the supplied 12 solar-term scope snapshots. Day remains `PARTIAL / ENGINE_GAP`. No numeric scope weighting, score, threshold, rank or exact date is created.

## D. Fixture Results and Mixed Outcomes

The unchanged chart fixtures CS-005, CS-126, CS-127 and the existing runtime-context fixture were run through the actual Birth Input → Canonical → Judgment path. Explicit event context was supplied only to the Event Timing request. Across these four pipeline cases:

```text
EventEvidenceFacts observed: 0
EventTimingFacts observed: 0
conditional positive path candidates observed: 0
source-backed positive contract/business fixture: NOT_TESTABLE_WITH_CURRENT_FIXTURE
```

The verifier does not invent a chart or expected event result to fill this fixture gap. Thus evidence/provenance and mixed-result runtime counts below are zero by observation; source-backed positive behavior is not claimed as empirically exercised.

| Mixed result | Status |
|---|---|
| Contract favorable + delay | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |
| Business start favorable + delay | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |
| Business expansion + Money difficulty/retention weakness | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |
| Business restructure + improvement/disruption | `NOT_TESTABLE_WITH_CURRENT_FIXTURE` |

Policy code emits independent facts by event type and scope and does not aggregate them into a generic mixed result. A separate Assembly-only smoke record verified routing and Free exclusion; it is explicitly not a chart or source-backed event fixture.

## E. Provenance, Identity and Lifecycle

| Check over the actual four chart fixtures | Result |
|---|---:|
| EventEvidenceFacts / with provenance | 0 / 0 |
| EventTimingFacts / with provenance | 0 / 0 |
| Orphan evidence / orphan timing | 0 / 0 |
| Duplicate evidence IDs / duplicate timing IDs | 0 / 0 |
| Wrong scope / unapproved event context | 0 / 0 |
| Determinism mismatch / array-order mismatch | 0 / 0 |
| Judgment, Money Outcome and Relationship Outcome mutation | 0 |
| Free timing leakage | 0 |

The runtime identity checks are vacuous for source event facts because the existing fixtures emitted no event facts. IDs are formed from stable source path, scope and source IDs; chapter placement does not create a new fact. Expired facts are omitted from active Assembly. Day-scope facts are not emitted.

## F. Shortcut, Assertion and Safety Audit

| Prohibited path | Violations |
|---|---:|
| 印 → contract favorable | 0 |
| 官 → contract favorable | 0 |
| 合 → contract success | 0 |
| 食傷 → business start | 0 |
| 財 → business expansion | 0 |
| 沖 → business restructure | 0 |
| Generic favorable/unfavorable → event | 0 |
| Contract delay → failure; business delay → failure | 0 |
| Day gap suppressing Sewoon/Month result | 0 |
| Numeric scoring/ranking | 0 |
| Unsupported exact date or customer Saju jargon | 0 |

`contract_finalization_day` and legal-dispute/breach assertions are not emitted. Mapped event facts retain explicit life-result event types rather than generic “opportunity” labels. No customer renderer or action recommendation was added.

## G. Reading Assembly

| Check | Result |
|---|---|
| Existing chapter registry only | PASS; no chapter added |
| Daewoon route | CH-08 |
| Sewoon route | CH-09 |
| Month route | CH-10 conclusion, same fact as CH-09 context |
| Same fact identity/provenance on repeated placement | Preserved by `event_timing_fact` record reference |
| Free product | Event Timing units excluded |
| Assembly-only route smoke | PASS; non-astrological plumbing check |
| CH-05 Money readiness | `PARTIAL` contract preserved; residual spending/collaboration scope remains deferred |

## H. Isolation and Regression

| Area | Changes in P4-M.2 |
|---|---:|
| Judgment semantics | 0 |
| Money Outcome semantics | 0 |
| Health Outcome semantics | 0 |
| Relationship Outcome semantics | 0 |
| Personality / Work / Compatibility | 0 |
| Master 14 | 0 |

Regression results:

| Suite | Result |
|---|---|
| Judgment contract, P0, P1-1/2/3/fix/integration/lifecycle/closure | PASS |
| Judgment 35/35 | PASS in unchanged P4-J.1/P4-J.2 recorded regression; P0/P1 suites rerun in this task |
| P2-A–G | PASS |
| P3-A–F | PASS |
| P4-B / P4-C | PASS |
| P4-E / P4-F | PASS |
| P4-G / P4-G.1 / P4-H | PASS |
| P4-I / unchanged P4-J | PASS · `MONEY_OUTCOME_BATCH1_COMPLETE` |
| P4-K.1 / P4-K.2 (including Month identity/provenance parity) | PASS |
| P4-L source contract | Existing approved source contract read; no code verifier exists |
| P4-M.2 verifier | PASS; four real pipeline fixtures, zero source-backed event facts |
| `npx tsc -b` / `npm run build` | PASS / PASS |
| `git diff --check` | PASS |

## I. Remaining Gaps

```text
JUDGMENT_FACT_GAP:
  No path-target gap was observed in emitted facts. Positive event mappings remain untestable because existing fixtures contain no event-specific expected assertions.
ENGINE_GAP:
  Day finalization; contract finalization; target-specific contract termination/restructure mapping.
SOURCE_GAP:
  Legal dispute, breach, lawsuit, counterparty conduct and exact legal outcome.
FIXTURE_GAP:
  Source-backed positive contract/business timing and mixed-result chart fixtures.
```

## Final

```text
READY_FOR_EVENT_TIMING_AUDIT
```

Event Timing Batch 1 has a conditional, event-specific evidence adapter and separate contract/business timing policies connected to Reading Assembly. The audit should treat source-backed positive event paths as `NOT_TESTABLE_WITH_CURRENT_FIXTURE`; Day finalization and legal-dispute assertions remain explicit gaps.
