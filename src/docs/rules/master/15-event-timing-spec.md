# FILUNE Event Timing Source Contract

Status: source contract ready for implementation of the explicitly supported subset. This document fixes event meanings, evidence gates, scope behavior and source classifications. It does not implement Judgment, Outcome, Event Timing, customer rendering, or action recommendations.

## 1. Purpose and authority

Event Timing identifies a source-supported interval or execution point for a named event. It reads existing Canonical and scoped Judgment results and any separately approved domain Outcomes. It does not infer a favorable event from a generally favorable period.

Primary evidence:

- `04-행운론.md` §1–2: judge each luck character in relation to the natal structure; a useful or harmful effect depends on its structural role.
- `07-사주풀이예시.md` lines 2725–39, 2810–39 and 2928–40: distinguish long environment, annual event theme, monthly realization and daily event completion; a good smaller interval does not reverse the whole upper interval, while a supported smaller result is retained.
- `07-사주풀이예시.md` lines 3150–59: an event context (contract/new work) is distinct from the judgment whether it succeeds; external and internal axes may differ.
- `08-luck-master.md` LK-004–006, LK-020–023 and LK-200: no numeric scope weighting; use the direct-scope and immediate-parent contracts; day is subordinate to Daewoon/Sewoon/Month.
- `09-engine-integration-spec.md` EX-131–153: scope inheritance, current direct comparison and staged Judgment execution.
- `13-reading-assembly-spec.md` §§2, 6–13: Assembly consumes read-only semantic references, preserves scope and certainty, and keeps day outside the fixed chapter registry.
- `14-outcome-semantic-spec.md` Boundary, Outcome assertion policy and Exclusions: event claims require an independently supported mapping; Money contract/business timing was previously deferred pending specific support. This Master supplies only the narrow mapping in this contract; it does not authorize amounts, investment decisions or generic Work claims.

This Master supplies the specific support previously missing from Master 14 only for the rows below. It narrows that prior deferral for this event subset; all unlisted contract, business, spending, collaboration and Work assertions remain deferred. It does not otherwise amend Master 14.

Source classifications used below:

| Classification | Meaning |
|---|---|
| `SOURCE_EXPLICIT` | Primary text directly states the event meaning or timing role. |
| `SOURCE_INFERENCE` | A constrained event mapping follows from explicit source statements, but is not itself stated as a universal rule. Keep the stated prerequisites and uncertainty. |
| `FILUNE_APPROVED_OVERRIDE` | FILUNE policy deliberately excludes an otherwise source-mentioned technique. |
| `SOURCE_CONFLICT` | Relevant sources materially disagree; do not resolve by selecting a convenient interpretation. |
| `DEFERRED` | A required mapping, engine fact or fixture is absent. Preserve other independent results. |

## 2. Event Timing is event-specific

Do not emit `generic_good_period`. Each fact names one event and one assertion. An event requires:

1. The relevant natal structure, read through existing Judgment.
2. A current, scoped Judgment result and its lifecycle/current function.
3. An independently mapped function relevant to that named event.
4. A time-scope activation or corroboration appropriate to the result.
5. The source modality, target, interval, certainty and provenance.

Use known customer context to identify an event that is actually in view. Do not infer that the customer currently owns a business, is negotiating a contract, is preparing a startup, or has decided to expand. Where event context is unknown, a renderer may use a conditional such as “계약을 준비 중이라면”; it must not assert the event is underway.

Money acquisition is not a business-start or contract-success shortcut. A relationship outcome is not a business partnership shortcut. Until an event-specific Judgment mapping exists, defer that event assertion while preserving any independently confirmed Money, Relationship, Health or structural facts.

## 3. Timing hierarchy

| Scope | Timing role | Contract |
|---|---|---|
| Natal | Baseline structure and available event-related functions | Source for prerequisites only; it is not a dated event window. |
| Daewoon | Long-term environment, activity stage and direction | Establishes the background and whether the relevant event path can operate over a broad interval. It cannot by itself identify a month or day. |
| Sewoon | Annual event theme and realization | Tests how the year changes the natal structure within the current Daewoon context. It can support an annual event opportunity, delay risk, expansion or adjustment result. |
| Month | Concrete concentration or interruption of the annual theme | Use FILUNE's existing 12 solar-term months. Identify the actual monthly activation, support or interference. A favorable year does not make every month favorable. |
| Day | Final execution, decision or event completion point | Only a supported day result can narrow a previously established event opportunity to a finalization point. Day alone never creates the event or reverses the year. |

These roles are qualitative durations and concretization levels, not a numerical hierarchy. A weaker or adverse lower scope does not erase the upper-scope conclusion. A supported favorable lower-scope opportunity is also not erased by an adverse upper scope: record both at their own scopes and meanings. A day-level finalization opportunity does not make an unfavorable year favorable.

## 4. Numeric weighting and source conflict

`07-사주풀이예시.md` lines 2804–20 and 2942–68 contains scope scores, percentages and arithmetic examples. These conflict with `08-luck-master.md` LK-004 and LK-200, which prohibit numeric scope weights and arbitrary Luck scores.

```text
classification: FILUNE_APPROVED_OVERRIDE
decision: do not use those numbers as engine inputs, scores, thresholds, probabilities, ordering, or customer copy.
```

Retain the qualitative statements in those passages only where compatible with this contract: longer environment, annual topic, monthly realization, day finalization, and separate simultaneous effects. No “55% likely,” “85 points,” or equivalent is allowed.

## 5. Contract event source contract

| Event | Trigger | Supporting scope | Blocking / delay condition | Result | Provenance |
|---|---|---|---|---|---|
| `CONTRACT_FAVORABLE_WINDOW` | A contract is in the known customer context; a mapped contract/document function is supported by current Judgment; the year supports realization and the month independently supports concrete progress. Day may narrow a finalization opportunity only after these conditions. | Sewoon, then Month; Day only for a separately supported finalization point. | Missing event context or contract-specific functional mapping; current harmful function, protection loss or local interference. Any independent delay risk remains alongside opportunity. | “계약을 현실화하기 좋은 흐름/시기” at the supported scope. Do not weaken to a vague document signal when gates are met. | `SOURCE_INFERENCE` from 07 lines 2810–18, 2928–40 and 3152–59; event completion role is explicit at 2815–16 and 2937–40. |
| `CONTRACT_DELAY_WINDOW` | A known contract process has a mapped active path; an otherwise supported annual opportunity is locally obstructed or the current year carries source-supported delay conditions. | Sewoon and especially Month. | No contract context; no event-specific obstruction mapping; an explicit failure/termination finding is not relabeled as delay. | “계약 진행이 늦어지기 쉬운 시기.” Delay is not failure. It can coexist with a favorable annual or contract opportunity. | `SOURCE_INFERENCE` from 07 lines 2822–34 (plans delayed; good month can resolve a contract) and 2737–39 (month may support or obstruct the year). The specific contract-delay trigger still requires an approved Judgment mapping. |
| `CONTRACT_FINALIZATION_WINDOW` | A contract opportunity/process is already supported at year and/or month scope; the day-specific Judgment path completes or activates the required event function. | Day, conditioned on Sewoon and Month. | Day-only signal; missing upper event opportunity; unknown or inactive current event function. | A supported date window for signing, decision, announcement or payment. It does not guarantee completion and does not improve the whole year. | `SOURCE_EXPLICIT` for daily contract/announcement/payment outcomes and completion role: 07 lines 2815–16, 2937–40, with engine sequence 08 LK-006/LK-022 and 09 EX-153. Exact Day runtime remains an engine gap. |
| `CONTRACT_TERMINATION_OR_RESTRUCTURE_WINDOW` | A known existing contract/transaction is supported; Judgment confirms the source-mapped termination or change path in the relevant period. | Sewoon or Month for the transition; Day may identify execution only with separate Day evidence. | Clash, pressure or a generic adverse year alone is insufficient; do not infer legal termination, breach or a specific party's conduct. | Contract ending or a materially changed arrangement, as the distinct source-supported event. Keep termination separate from delay and favorable completion. | `SOURCE_EXPLICIT` for existing contract ending/business-mode change and day-level contract termination: 07 lines 2865–89, especially 2867 and 2875–89. |

Contract closure, restructuring, delay and finalization are independent assertions. Do not force them into a single positive/negative state. A failed or aborted new contract is not automatically a delay; use only the event type supported by the Judgment and source mapping.

### Contract function mapping gate

The source identifies 印 as documentation/contract context (07 lines 481, 3152–57), and distinguishes that event context from whether the year structure succeeds. This permits a contract-specific mapping only where the existing Judgment path actually affects that documented function. Do not translate every 印 role, appearance or favorable relationship into a contract opportunity. A confirmed function without a known contract context remains a structural prerequisite, not a claim that the customer has a contract.

## 6. Business event source contract

| Event | Trigger | Supporting scope | Blocking / delay condition | Result | Provenance |
|---|---|---|---|---|---|
| `BUSINESS_START_FAVORABLE_WINDOW` | Business start is a known goal/context; the annual event theme and an independently mapped start/execution function are favorable; a month confirms concrete readiness or execution. | Sewoon, then Month. | A general favorable year, Money acquisition, or “business” TenGod label alone is insufficient. If start-specific Judgment evidence is absent, defer only this assertion. | “사업을 준비하고 있다면 실행하기 좋은 시기.” This does not state that the customer is currently starting a business. | `SOURCE_INFERENCE`: start is an annual event class at 07 lines 2725–35 and 2728; 3152–59 separates the new-work/contract context from its success judgment. A positive start-specific function mapping is still required. |
| `BUSINESS_START_DELAY_WINDOW` | A known start plan and mapped execution path exist; source-supported annual or monthly obstruction is active for that path. | Sewoon and Month. | Do not infer delay from lack of a positive result. Do not convert an explicit failed/aborted start into delay. | “사업 실행이 늦어지기 쉬운 시기,” separate from cancellation/failure. | `SOURCE_INFERENCE` from 07 lines 2822–34 and 2737–39, plus the start-event distinction at 3154–57. The start-specific delay mapping is an `ENGINE_GAP` until current Judgment can identify it. |
| `BUSINESS_EXPANSION_FAVORABLE_WINDOW` | A business is known to be operating; a favorable long-term/annual path and business-related functioning support growth; Month corroborates the timing. | Daewoon and Sewoon, with Month for concentration. | Business already operating is required. Money acquisition alone, generic favorable luck or customer status inferred from chart is insufficient. Preserve any simultaneous retention, cost or difficulty result. | “사업을 확장하기 좋은 시기.” | `SOURCE_EXPLICIT` for higher-flow expansion and increased sales/trade counterparties: 07 lines 2810–20, 3041–46. The corresponding event-specific Judgment path remains to be registered before implementation. |
| `BUSINESS_ADJUSTMENT_WINDOW` | A supportive Daewoon environment remains, while the current Sewoon is adverse or disruptive for the existing business path; source supports maintenance/repair over additional expansion. | Daewoon + Sewoon; Month may identify a remediation interval. | Do not recommend adjustment from a generally bad period alone. Do not erase an independent opportunity or treat a good Month as reversing the year. | “무리한 확장보다 기존 사업 구조를 조정·정비하기 좋은 시기.” | `SOURCE_EXPLICIT` for annual delay/cleanup and a good long-term flow absorbing an adverse year: 07 lines 2822–37 and 3045–46. |
| `BUSINESS_RESTRUCTURE_WINDOW` | A known existing business has a source-mapped structural change; current Judgment supports transition in operating form, contracts, product or partnership arrangement. | Sewoon for the event theme; Month for concrete transition; Day only for an evidenced decision/execution point. | Clash or disruption without a mapped business target is insufficient. Do not infer business closure, insolvency or a particular revenue model. | “기존 사업 방식/거래 구조가 바뀌기 쉬운 시기,” with favorable transition only when separately supported. | `SOURCE_EXPLICIT` for business form, sales method, product and partnership restructuring: 07 lines 2870–89; an applied expansion/closure case at 1863–73. |

Business start, expansion, adjustment and restructure are not interchangeable. Expansion requires a known operating business. Start requires a known start context or explicit customer goal. Preserve sequential outcomes such as “기존 방식 정비” and later “새 방식 확장” as separate scoped facts when each is supported.

### Business function mapping gate

The source connects 食傷 with expression, production, movement and business activity (07 lines 2722–23), and describes business expansion through sales and counterparties (lines 2810–20). Existing Money acquisition/generation facts may corroborate productive output or earnings; they do not by themselves prove business start, expansion or success. Require event context and a current Judgment function that the business mapping explicitly uses. No fixed TenGod-to-business-result shortcut is approved.

## 6A. Event Evidence Mapping Contract

This section defines the adapter boundary between existing Judgment results and Event Timing. It does not add or alter a Judgment rule. The adapter may translate only a complete, current structural path whose participants, action, role/function, direction, lifecycle and scope can be traced in existing output. An event-domain label is an adapter interpretation, not a new Judgment fact.

### Mapping vocabulary

`EventEvidenceFact` is a conceptual adapter record, not a code type in this document:

```ts
EventEvidenceFact {
  id
  eventDomain
  functionType
  direction
  sourceType
  originScope
  currentlyEffective
  certainty
  sourceJudgmentIds
  sourceRelationIds
  sourceRoleIds
  sourceOutcomeIds
  sourceLuckEffectIds
  provenance
}
```

Use only these function types when the corresponding row below qualifies:

```text
supports | blocks | delays | destabilizes | protects | activates | binds
```

`sourceType` retains `SOURCE_EXPLICIT`, `SOURCE_INFERENCE`, `FILUNE_APPROVED_OVERRIDE`, `SOURCE_CONFLICT`, or `DEFERRED`. A row marked conditional is not an unconditional rule: all listed event context, structural path and current-function gates are conjunctive. One function can support one event axis while a different function blocks or destabilizes it; do not collapse them.

### Existing Judgment inputs and sufficiency

| Existing output | Reusable data | Adapter use and limit |
|---|---|---|
| `StemRelationFact` / `branchFacts` | Stable relation ID, participants, action or relation kind and scope snapshot | Establish the observed path/change. Presence alone does not establish direction, event meaning or current effectiveness. A branch clash has no favorable/unfavorable direction by itself. |
| `FormulaFact` | Formula type, relation IDs, PatternContext ID and validity | Corroborate an existing named formula such as a food-to-wealth path. It does not create an event result by formula name alone. |
| `ActualStructuralFunction` | Policy/rule ID, direction, evidence status, relation ID, current `function`, runtime/root/formation/capacity and resolution evidence | Primary current-path gate. Require an operating or reduced, currently effective path; honor `inactive`, `deferred`, protection and competing paths. |
| `PatternContext` | Current scope, pattern mode, manifested/effective YongShen and current relations | Supplies context to interpret a path, never a positive/negative event shortcut. Natal context is not rewritten by Luck. |
| Role history/current roles | Role identity, `currentState`, `currentFunction`, and path references | Confirms the role of a participating path and whether it is currently operating, reduced, stopped or deferred. History alone is not current evidence. |
| `LuckEffectState` / structural effect | Origin identity/scope/period, `currentlyEffective`, `expired`, relation lineage, blocked/protection state | Supplies lifecycle and scope activation. Expired or inactive effects cannot support a current event fact. |
| Root, Formation, Capacity | Entity IDs and evidence IDs/states | Qualify only the existing path whose source contract requires them. None is a stand-alone event signal. |
| Money Outcome | Semantic type, current scope, independent provenance and lifecycle | `money_acquisition`/generation may corroborate output; retention, division and difficulty remain separate. None alone proves contract success, business start or expansion. |
| Relationship Outcome | Formation/pressure and context when available | May corroborate business partnership only when the source/customer context is explicitly professional cooperation. Romantic or generic relationship facts do not map to a business event. |
| Known customer context | Explicit customer-provided event goal/process/operating-business context | Required to select a particular event. Never infer a current contract, startup plan or operating business from the chart. The current `knownFacts` record may carry boolean keys `event.contract.process`, `event.business.startGoal`, `event.business.operating`, `event.business.adjustment`, and `event.business.restructure`; only an explicitly supplied `true` qualifies. Missing/false/unknown does not qualify. Chart-derived guesses are invalid. |

**Judgment extension assessment:** no new Judgment fact is required for the conditional mappings below when the existing snapshot contains the referenced path and current-function data. Event context is external, not a Judgment fact. Where a source case needs an event-specific actor/target or an active function that the snapshot cannot identify, classify that row `JUDGMENT_FACT_GAP`; do not infer it from role names. Day finalization remains the existing end-to-end Day engine gap.

### Required mapping matrix

| Event Evidence | Required Judgment Facts | Required Current Function | Blocking Conditions | Source Status | Engine Ready |
|---|---|---|---|---|---|
| Contract support (`document_support`) | Known contract/document process; current 印/document function participating in a source-described protective or successful path; linked relation/formula and any applicable Outcome IDs | The mapped 印 path is operating/reduced and not stopped or materially impaired; retain the annual path and require local Month corroboration for a favorable window | 印 existence, generic favorable scope, or role history alone; no known contract context; harmed/stopped 印; unverified relationship between 印 and the contract path | `SOURCE_EXPLICIT` case meanings; adapter mapping remains `SOURCE_INFERENCE` | `CONDITIONAL`; existing relation, role, runtime, effects and scope data are sufficient for the evidenced cases. No universal 印 rule. |
| Contract obstruction (`document_obstruction` / `support_function_stopped`) | Known contract context; specific supporting document/contract function and its linked path; an actual damaging relation/effect or lost protection | Required support path is currently reduced/stopped/inactive with source-linked evidence in the evaluated scope | Generic unfavorable scope; 印 presence without function; unrelated damage; infer failure from a delay signal | `SOURCE_EXPLICIT` case meanings; timing generalization remains `SOURCE_INFERENCE` | `CONDITIONAL`; active path/lifecycle is available. The particular event target must be supplied by known context. |
| Contract instability (`institutional_instability`) | Known institutional/contract process; current 官/position function and a path that directly damages or destabilizes it; linked Judgment direction and current role | The relevant 官 path is operating/reduced but adversely affected, or its required function is currently inactive; preserve separate positive paths | 官 exists; generic clash/adversity; employment-only evidence when the event context is a contract | `SOURCE_EXPLICIT` in linked cases; event-level mapping `SOURCE_INFERENCE` | `CONDITIONAL`; facts exist, but the event target/context gate is required. |
| Contract binding / finalization support (`binding`) | Known contract context; an effective 合/Formula/Relation that involves the already established contract-support function; for finalization, pre-existing year/month event opportunity plus Day Judgment | Binding path currently effective; finalization additionally requires an independently active Day function after Sewoon/Month gates | Any 合; Day-only signal; missing upper opportunity; stopped or unrelated participant | `SOURCE_EXPLICIT` for contract/relationship binding and daily completion role; exact mapping `SOURCE_INFERENCE` | `PARTIAL`; non-Day binding evidence can be adapted conditionally. Day finalization is `NOT_IMPLEMENTED` end-to-end. |
| Contract dispute / process trouble (`contract_trouble`) | Known contract process; source-linked adverse relation/formula/current role or document/官 path; preserve which target is affected | An adverse active/reduced path with source linkage; obstruction must be current in the period | Generic unfavorable direction; unrelated financial difficulty; chart-only prediction of legal dispute, breach, lawsuit or counterparty conduct | `SOURCE_EXPLICIT` for case-level contract trouble; legal dispute mapping `DEFERRED` | `PARTIAL`; generic contract trouble can be represented conditionally, but legal-dispute assertion is not approved. |
| Business activity support (`business_activity_support`) | Known business/activity context; current production/expression path linked to a realized result (e.g. independently supported Food/Hurting-to-Wealth relation), not an isolated TenGod | Linked path is operating/reduced and its current function is favorable for that existing output; retain simultaneous difficulty/outflow | Food/Hurting presence; Money acquisition alone; no known business context; stopped/blocked path | `SOURCE_EXPLICIT` activity meaning; path-to-activity mapping `SOURCE_INFERENCE` | `CONDITIONAL`; relation/formula/current function and Money corroboration are available. |
| Business start support (`business_start_support`) | Explicit start goal/context; current activity/execution path; Sewoon event theme and Month readiness/activation, each with its own scope provenance | Start-related execution path is active and favorable in the evaluated scope; output/result path can corroborate but cannot be the only gate | Generic favorable year; Money acquisition alone; existing business status inferred; no known start goal | `SOURCE_INFERENCE` (07 lines 2725–35, 2728, 3152–59; retrospective business start at 1026–33) | `CONDITIONAL`; adapter can read current paths and known context. A specific universal startup formula is not supported and must not be added. |
| Business expansion support (`business_external_expansion`) | Known operating business; source-supported favorable long/annual direction; a current business activity/result path and Month corroboration; preserve independent Money retention/outflow/difficulty facts | Business-related path currently operating and favorable; current scope confirms the expansion interval | Business start context only; no operating-business context; Money acquisition alone; generic favorable period; current damaged path | `SOURCE_EXPLICIT` for expansion/revenue/counterparty meaning (07 lines 2810–20, 3041–46, 1863); specific path mapping `SOURCE_INFERENCE` | `CONDITIONAL`; existing paths and context can supply the bounded subset. Do not infer exact revenue or successful expansion. |
| Business adjustment need (`business_adjustment_need`) | Known existing business; supportive Daewoon context plus adverse Sewoon path tied to that business's current operating function; identify what requires maintenance/repair | Existing business path remains present but is adversely affected/reduced or disrupted at Sewoon; do not promote a generic bad year | Generic unfavorable Sewoon; no operating-business context; adverse path unrelated to business; a good month cannot reverse the annual result | `SOURCE_EXPLICIT` for adjustment/maintenance meaning (07 lines 2822–37, 3045–46, 1672–75) | `CONDITIONAL`; scope snapshots, current paths and lifecycle are available; event context is required. |
| Business restructure (`business_restructure_trigger`) | Known existing business; valid current change relation (such as a source-described clash/transition) linked through participants/root/formation or an actual function to its business activity path; direction of the affected path | Change is current and effective; separately classify whether it breaks a harmful form (transition/improvement) or a needed operating path (disruption) | Clash exists alone; unrelated participant; no linked business function; no current activation; a change is automatically called improvement or failure | `SOURCE_EXPLICIT` for change types (07 lines 2791–2800, 2877–89, 1863); event-path linkage `SOURCE_INFERENCE` | `CONDITIONAL`; source lineage and current path data exist, but only when the participant/function link is explicit. If the link cannot be recovered, `JUDGMENT_FACT_GAP`. |
| Business execution obstruction (`business_execution_obstruction`) | Explicit start/operating context; known active execution path; current source-linked obstruction to that same path in Sewoon/Month | Path is currently impeded/reduced/stopped in that interval; preserve any separate support evidence | No positive result therefore delay; generic adverse scope; explicit failure/termination relabeled as delay | `SOURCE_INFERENCE` (07 lines 2737–39, 2822–34, case 2058) | `CONDITIONAL`; current path/lifecycle and 12-solar-term Month data exist; exact target must be known. |

For each fact, the adapter must link the actual source snapshot ID, relation/formula ID, applicable current role IDs, LuckEffect IDs and corroborating Outcome IDs. `originScope` is the scope where the supporting evidence originated; later chapter placement or evaluation in a narrower interval does not rewrite it. `currentlyEffective` is recalculated independently from origin. The adapter is read-only and never upgrades `SOURCE_INFERENCE` to `SOURCE_EXPLICIT`.

### Source case register

| Source location | Original interpretation | Structural path described by the source | Event meaning | Mapping strength |
|---|---|---|---|---|
| 07 §481 | Killing function is converted/removed through the specified 운; the document/contract situation improves | Current Killing path, incoming function and transformed Resource/document role; not merely Resource presence | Conditional contract/document support | `SOURCE_EXPLICIT` case; no standalone universal rule |
| 07 §§650–53 | Good position and a favorable document appear under a particular Officer/Resource and remedy context | Scoped Officer plus Resource path/function, relief of an existing adverse function and favorable Year/Month context | Institutional/document support in that evaluated case | `SOURCE_EXPLICIT` case; adapters retain required path/context |
| 07 §§923–30 | 印 damaging a needed 食神 can obstruct livelihood and produce bad-document/contract issues; strong roots/protection can attenuate it | Resource controls Food path, whether Food is the needed function, actual runtime/root and protection, plus the separate Wealth path | Contract/document obstruction may coexist with other money/structure outcomes | `SOURCE_EXPLICIT` case mapping; not every Resource→Food relation qualifies |
| 07 §1137 | Wealth function can be alive while damaged Resource makes document/contract unfavorable | Separate favorable Wealth path and damaged Resource/document function in one chart/year | Contract negative evidence coexists with positive Money evidence | `SOURCE_EXPLICIT` case; demonstrates independent axes |
| 07 §1565 | A money-earning context can still have problems obtaining what is due or documenting/contracting it | Active Killing/wealth context plus month-specific interference with the needed function | Contract trouble/obstruction at a scoped period | `SOURCE_EXPLICIT` case; monthly gate is separately evaluated |
| 07 §§1026–33 | Hurting Officer produces Wealth through ideas/eloquence; the person runs a large company, earns but experiences loss, staff and relationship problems | Current Hurting-to-Wealth path alongside separate active harmful/outflow/difficulty paths | Business activity/result support and simultaneous difficulty; not a claim that all such charts imply startup or expansion | `SOURCE_EXPLICIT` retrospective case; mapping to forward support remains `SOURCE_INFERENCE` |
| 07 §§1671–75 | A maintained business/revenue result coexists with damaged Food/staff difficulty; a later independent-business move under adverse structure worsens | Resource and Food paths have different current functions; later Wealth affects required Resource; paths must remain separate | Business activity can continue while adjustment/constraint is indicated | `SOURCE_EXPLICIT` case; requires known-business context |
| 07 §§1863–74 | Existing academy expanded in one interval and was later closed/put down amid business problems; the source describes the relevant current Luck changes | Business context plus different Daewoon/Sewoon function states; do not collapse intervals | Expansion and later adjustment/termination are distinct; timing sequence is possible | `SOURCE_EXPLICIT` retrospective case; forecast mapping remains conditional |
| 07 §§2050–58 | Shopping business was being expanded, but supplier contracts tied up money and changed the work arrangement | The described chart/scope has interacting role/function paths; expansion intention and contract blockage coexist | Expansion support does not cancel contract/process or Money obstruction | `SOURCE_EXPLICIT` case; use as a counterexample, not a general prediction |
| 07 §§2725–39, 2810–20, 2822–37 | Year raises event themes; month realizes/obstructs; longer favorable business flow can coexist with an adverse year and adjustment | Sewoon within Daewoon, then direct Month evidence; no numeric weighting | Business start event class, expansion opportunity, delay/adjustment windows | `SOURCE_EXPLICIT` timing role; event mapping remains `SOURCE_INFERENCE` |
| 07 §§2781–2800, 2877–89 | 合 binds and can create contracts; 冲 changes forms, but direction follows the affected good/harmful path | Actual relation participants, their current structural function and effect; valid scope operation | Binding or business/contract restructure only when the affected event path is identified | `SOURCE_EXPLICIT` for event categories; adapter linkage `SOURCE_INFERENCE` |
| 07 §§3152–59 | 印/官 provide document/institutional context, but a new contract/work event can fail when the current year structure is adverse; some internal result may remain | Known event context separated from current external/institutional function and internal outcome | Contract opportunity/trouble must follow the relevant independent paths, not generic overall direction | `SOURCE_EXPLICIT` case and event/context distinction |

These examples are not a license to forecast the same events in another chart without matching current paths, event context and scope. Retrospective cases establish mapping candidates, not guaranteed recurrence.

### Required counterexamples and shortcut audit

| Counterexample | Evidence | Mapping consequence |
|---|---|---|
| 印 exists but contract is unfavorable | 07 §1137: Wealth is in a favorable state, while the damaged Resource leaves document/contract unfavorable. 07 §§923–24 and 1967 further qualify document trouble by an actually damaged/blocked path. | Never map 印 presence to favorable contract; preserve independent document obstruction. |
| 食傷 exists but business is unfavorable or burdened | 07 §§1030–33: active output/Wealth and a company coexist with large outflow and operational trouble. 07 §§1672–75: business activity under a later adverse path becomes difficult. | Food/Hurting presence or output does not guarantee startup/expansion success; preserve burden/adjustment separately. |
| Wealth is alive but contract is unfavorable | 07 §1137. | Money support cannot suppress contract-specific negative evidence. |
| Expansion is possible while money trouble also exists | 07 §3043: business can expand while internal Money problems remain; 07 §2058: expansion attempt coexists with supplier contracts tying up funds. | Keep expansion and Money/contract obstruction as independent facts. |
| Clash causes damage, not improvement | 07 §§2793–2800: clash breaks a stable good structure as well as a harmful one; direction follows the affected structure. 07 §2058 describes adverse consequences during expansion; no clash-only inference is allowed. | Clash is a change trigger only; classify the actual affected path before calling restructure favorable or disruptive. |

```text
印 → contract favorable                         = prohibited shortcut (0)
官 → contract favorable                         = prohibited shortcut (0)
合 → contract success                           = prohibited shortcut (0)
食傷 → business start                           = prohibited shortcut (0)
財 → business expansion                         = prohibited shortcut (0)
沖 → business restructure                       = prohibited shortcut (0)
generic favorable → every event favorable       = prohibited shortcut (0)
generic unfavorable → delay/adjustment/failure  = prohibited shortcut (0)
numeric source ratios/scores used               = 0 (FILUNE_APPROVED_OVERRIDE)
```

### Adapter boundaries and unresolved subsets

- Business start, contract delay and business execution obstruction retain `SOURCE_INFERENCE`; none is promoted to `SOURCE_EXPLICIT`.
- A successful binding/contract opportunity is distinct from Day finalization. Day requires existing upper event evidence and remains deferred until the end-to-end Day pipeline exists.
- “Contract trouble” may retain the source's generic process/document meaning. Legal dispute, breach, lawsuit, counterparty intent and actual failure remain `DEFERRED` absent a separate explicit contract.
- Expansion requires known operating-business context; start requires an explicitly known goal. These facts are supplied by the customer/context layer, not inferred from the chart.
- Professional partnership is not inferred from a generic Relationship Outcome. It requires explicit business-cooperation context and a source-mapped participating function.
- If a business/contract target cannot be linked to a current relation/role/effect path using existing IDs, that record is `JUDGMENT_FACT_GAP`; do not substitute an unrelated path. Day runtime is an `ENGINE_GAP`. Source-specific legal-dispute conditions remain `SOURCE_GAP`.
- No scores, thresholds, rankings, probabilities or weighted scope arithmetic are permitted.

## 7. Decision and calendar projection

Event semantics and Gregorian placement are separate concerns:

```text
EventEvidenceFact
→ EventTimingDecision
→ Calendar Projection
→ EventTimingFact
```

`EventTimingDecision` records an event assertion in a named Judgment scope. It does not require Gregorian dates:

```ts
EventTimingDecision {
  id
  eventType
  direction
  originScope
  scope
  scopeGanZhi?
  parentScopeGanZhi?
  certainty
  provenanceClass
  currentlyEffective
  sourceEvidenceIds
  sourceOutcomeIds
  sourceJudgmentIds
  sourceRelationIds
  sourceRoleIds
  sourceLuckEffectIds
  provenance
}
```

`eventType` identifies the assertion, such as contract opportunity, contract delay, business start, business expansion or adjustment. `direction` identifies that assertion's result, such as `favorable`, `delay` or `restructure`; it is not an overall good/bad rating. Source regression may identify a scope by its internal scope and GanZhi when the source provides them. This does not map a GanZhi to a Gregorian year or imply that the interval is active today.

Production calendar projection consumes a Decision and the matching existing Canonical/Judgment interval. It creates an `EventTimingFact` only when the interval and evaluation time are available:

```ts
EventTimingFact {
  id
  decisionId
  eventType
  direction
  originScope
  scope
  scopeGanZhi?
  parentScopeGanZhi?
  period
  certainty
  currentLifecycle
  sourceEvidenceIds
  sourceOutcomeIds
  sourceJudgmentIds
  sourceRelationIds
  sourceRoleIds
  sourceLuckEffectIds
  provenance
}
```

If the semantic decision is supported but no Gregorian interval can be resolved, keep the Decision and report projection as `not_projectable`; do not lower its certainty or turn it into `deferred`. A Decision is not itself a customer calendar statement. Assembly of calendar-specific Reading units consumes projected `EventTimingFact` records only.

Store one Decision per independently supported event assertion and scope. Projected fact identity combines the stable Decision identity and resolved interval identity. Chapter placement, renderer wording and customer context do not alter Decision identity, direction, certainty or provenance.

In a source-only snapshot, the adapter may evaluate a named Luck scope without Gregorian timestamps. The Decision records the source scope identity (including GanZhi labels only when the source states them); it does not project those labels into dates. Production projection must resolve the Decision's actual matching Judgment scope and preserve `originScope`, scope identity, certainty and provenance. A mismatch between the Decision scope and the resolved snapshot is `not_projectable`.

`sourceOutcomeIds` may link existing Money/Relationship/Health Outcomes only where their meaning is applicable. Event Timing must not recalculate those domains. A Decision must retain the Judgment and LuckEffect lineage that supports the event-specific function. Missing event-specific function or activation defers that assertion alone; missing Gregorian interval affects calendar projection only.

## 8. Mixed timing and scope consistency

The following combinations are valid when independently supported:

```text
contract opportunity + contract delay risk
annual contract opportunity + a locally obstructed month
annual adverse environment + a favorable Day finalization point
business start opportunity + early contract delay
business expansion opportunity + retention/cost/difficulty result
business adjustment + later expansion under a separate interval
```

Do not cancel them, collapse them to `mixed`, or suppress a confirmed annual/monthly result because Day evidence is unavailable. A missing Day check defers Day only. A Day result never rewrites a year result.

## 9. Scope, intervals and lifecycle

- Use existing Canonical Daewoon/Sewoon intervals and Judgment's existing 12 solar-term Month intervals. Do not calculate calendar months or introduce arbitrary 30-day windows.
- A Day period must come from the existing canonical calendar/Day input. Do not manufacture an exact date from a month-level signal.
- Preserve source period, evaluation scope, current state, `active/reduced/stopped/conditional/expired` lifecycle and certainty independently. Expired evidence is history, not current timing.
- Certainty depends on source strength, current structural evidence and activation—not on interval length or scope name.
- Do not infer delay or recovery from expiry. Re-evaluate the current structure and current scope.
- No rank, top-N, best/worst month, optimization score, probability or recommendation is part of the fact.

## 10. Day implementation boundary

The Judgment core can accept an optional precomputed `dailyLuck` input and `dailyLuck` validity; this is not equivalent to generating a Day Judgment from Birth Input. The current internal pipeline does not calculate an independently evaluated Day scope. Reading maps an existing `dailyLuck` Judgment unit to internal scope `day`, but excludes Day from Outcome timing publication and the fixed Assembly chapter registry.

```text
Day event-finalization engine: PARTIAL / NOT_IMPLEMENTED end-to-end
```

Therefore contract and business year/month facts may be implemented first. Exact Day finalization remains deferred until canonical Day generation, Day↔Month Judgment, lifecycle/provenance and Assembly gating are implemented. This gap does not suppress supported Sewoon or Month results.

## 11. Customer language and prohibited output

Internal Judgment/provenance may retain `Daewoon`, `Sewoon`, `Month`, `Day`, `YongShen`, `SangShen`, `Byeong`, `GuEung` and Pattern names. Customer-facing semantic text, Assembly summaries and Renderers must not expose those terms. Use “장기적인 흐름”, “올해”, “○월”, “○월 ○일”, or “이 시기”.

Source-supported event outcomes must retain their life meaning: “계약을 현실화하기 좋은 시기”, “계약 진행이 늦어지기 쉬운 시기”, “사업을 시작하기 좋은 시기”, “사업을 확장하기 좋은 시기”, or “기존 사업 구조를 조정하기 좋은 시기”. Do not replace them with “문서 관련 구조 신호” or “사업 관련 에너지”. Keep qualifications and event context.

Prohibited: guaranteed event occurrence, an exact event date absent Day evidence, a failure/termination inferred from delay, amount/profit/return prediction, lottery prediction, investment product advice, buy/sell/loan instruction, score/percentage/ranking, generic good-period claim, or current business/contract/relationship status inferred from a chart.

## 12. Implementation acceptance gates

P4-M implementation must prove, on source-backed existing fixtures or mark `NOT_TESTABLE_WITH_CURRENT_FIXTURE` without inventing a chart:

1. Contract opportunity and contract delay are independent; delay does not equal failure.
2. Contract finalization requires an existing upper event opportunity and remains a Day-only assertion.
3. Contract termination/restructure requires an event-specific active function, not clash alone.
4. Business start is distinct from operating-business expansion.
5. Expansion and adjustment/restructure can coexist at distinct scopes or intervals.
6. A supported annual result survives missing Month/Day evidence; local Month/Day results do not rewrite the annual fact.
7. Mixed timing survives without an aggregate rating.
8. IDs, intervals, certainty, provenance, expiry and Assembly reuse are deterministic.
9. No prohibited output, numerical weighting, customer-visible Saju jargon, unsupported outcome or domain recalculation appears.

[Luck Master 08](./08-luck-master.md) · [Engine Integration 09](./09-engine-integration-spec.md) · [Outcome Semantic 14](./14-outcome-semantic-spec.md) · [Reading Assembly 13](./13-reading-assembly-spec.md)
