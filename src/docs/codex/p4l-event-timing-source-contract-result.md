# FILUNE Codex P4-L Event Timing Source Contract

**Final: `EVENT_TIMING_SOURCE_CONTRACT_READY`**

The source and engine contracts for the limited contract and business timing subset are fixed in [Master 15](../rules/master/15-event-timing-spec.md). This was a document audit only: no application code, Judgment rule, Outcome meaning, or existing Master 13/14 text was changed.

## A. Timing hierarchy

| Scope | Contract |
|---|---|
| Long-term environment | Daewoon supplies the long-term setting and activity direction; it does not identify a month or day. `SOURCE_EXPLICIT` · Master 08 LK-005; primary 07 lines 2712–23, 3013–20. |
| Annual realization | Sewoon supplies the year's event theme within Daewoon; it does not mechanically override it. `SOURCE_EXPLICIT` · Master 08/09; primary 07 lines 2725–35. |
| Monthly concretization | Month identifies where the year theme is concentrated or obstructed. Use the existing 12 solar-term months. `SOURCE_EXPLICIT` · Master 08 LK-005; primary 07 lines 2737–39, 2936–39. |
| Daily finalization | Day may supply a final execution/decision point only after the higher event path exists. It cannot turn the whole year favorable. `SOURCE_EXPLICIT` for meaning; Engine `PARTIAL` · primary 07 lines 2815–16, 2937–40; Master 08 LK-006/LK-022. |
| Numeric weighting | `0` in the FILUNE Source Contract. 07 includes example percentages and scores, but Master 08 LK-004/LK-200 and this task prohibit their use. `FILUNE_APPROVED_OVERRIDE`. |

Higher-scope and lower-scope results remain separate. A day cannot reverse a year, and an adverse year cannot erase a supported local opportunity. Delay, finalization, expansion, adjustment and disruption are separate axes, not one good/bad score.

## B. Contract source table

| Event | Source status | Source-supported contract | Engine boundary |
|---|---|---|---|
| Contract favorable | `SOURCE_INFERENCE` | Known contract context + current mapped contract/document function + favorable annual support + local monthly progress; retain the living result “계약을 현실화하기 좋은 흐름/시기.” 07 lines 2810–18, 2928–40, 3152–59. | Contract-specific active Judgment function must be registered; generic 印, general favorable Luck or Money acquisition is insufficient. |
| Contract delay | `SOURCE_INFERENCE` | Known active contract process + source-supported obstruction. Preserve “계약 진행이 늦어지기 쉬운 시기”; delay may coexist with an annual opportunity and does not mean failure. 07 lines 2737–39, 2822–34. | Specific delay trigger/function is not yet in the runtime mapping registry. An explicit failure is not recast as delay. |
| Contract finalization | `SOURCE_EXPLICIT` | Day may identify signing/decision/announcement/payment only when the year/month event opportunity already exists. 07 lines 2815–16, 2937–40. | Day-level Judgment generation is not end-to-end implemented; defer Day only. |
| Contract termination / restructure | `SOURCE_EXPLICIT` | Existing contract ending and business-mode transition are separate outcomes; a supported day may execute termination. 07 lines 2865–89. | Clash or generic adversity alone cannot create the event. Legal breach, causation or a party's conduct is out of scope. |

## C. Business source table

| Event | Source status | Source-supported contract | Engine boundary |
|---|---|---|---|
| Business start | `SOURCE_INFERENCE` | Business start is an annual event class; the event context is distinct from whether the structure succeeds. With known intent and a mapped favorable start function, preserve “사업을 실행하기 좋은 시기.” 07 lines 2725–35, 2728 and 3152–59. | No customer business status inference. The positive start-specific Judgment mapping must be registered; a general favorable year is insufficient. |
| Business start delay | `SOURCE_INFERENCE` | Known start context plus mapped obstruction can support a delay window; it does not imply failure/cancellation. 07 lines 2737–39, 2822–34, 3154–57. | Start-specific delay path is an `ENGINE_GAP`; no output until verified. |
| Business expansion | `SOURCE_EXPLICIT` | For a known operating business, source supports increased sales/counterparties and favorable expansion under supportive long-term/annual conditions. Preserve “사업을 확장하기 좋은 시기.” 07 lines 2810–20, 3041–46. | Must not infer an operating business. Money acquisition alone does not establish expansion. |
| Business adjustment | `SOURCE_EXPLICIT` | Supportive Daewoon with an adverse/disruptive year can favor adjustment and preparation rather than further expansion. 07 lines 2822–37, 3045–46. | Requires an adverse function tied to the existing business path; a generally negative period is insufficient. |
| Business restructure | `SOURCE_EXPLICIT` | A supported transition of existing trade relationships, business mode, sales method, product or partnership structure. 07 lines 2870–89; applied business lifecycle example at 1863–73. | Disruption alone does not prove closure, insolvency or a specific business-model change. |

The scope-specific event/function gates and the distinction between start, expansion, adjustment and restructure are detailed in Master 15. Business and contract are not interchangeable: one does not automatically establish the other.

## D. Engine readiness

| Scope | Status | Finding |
|---|---|---|
| Natal | `IMPLEMENTED` (supporting input) | Existing canonical structure and Judgment facts can be read as prerequisites; natal alone is not a dated event window. |
| Daewoon | `IMPLEMENTED` (existing Judgment scope) | Current Luck Judgment scope is available for long-term context. |
| Sewoon | `IMPLEMENTED` (existing Judgment scope) | Current annual Judgment scope is available for annual realization. |
| Month | `IMPLEMENTED` (existing Judgment scope) | 12-solar-term monthly window and scope snapshots exist. Do not replace with calendar months. |
| Day | `PARTIAL` / event timing `NOT_IMPLEMENTED` end-to-end | Judgment core accepts optional precomputed `dailyLuck`, but `runInternalReading` does not calculate a daily Judgment scope from the birth input. Reading's Judgment-unit adapter maps `dailyLuck` as `day`, while Outcome conversion excludes Day and Assembly has no fixed Day chapter. Exact finalization is deferred; this does not block year/month outcomes. |

Evidence: [internalReading.ts](../../lib/judgment/pipeline/internalReading.ts) accepts the optional Day input and enumerates the monthly window; [fromReading.ts](../../lib/judgment/core/fromReading.ts) adds it only when supplied and the Luck chain is available; [judgmentUnits.ts](../../lib/reading/judgmentUnits.ts) maps and excludes Day for Outcome publication; [Assembly spec §5/§10](../rules/master/13-reading-assembly-spec.md).

## E. Customer language and assertion policy

```text
direct Saju jargon in customer-facing contract: 0
numeric score/percentage in FILUNE timing contract: 0
vague structural-only wording allowed after gates pass: 0
```

Customer text uses ordinary time expressions (“장기적인 흐름”, “올해”, “○월”, “○월 ○일”, “이 시기”) and preserves supported life meaning. Internal provenance may keep Saju terms.

| Contract-level assertion check | Count |
|---|---:|
| Source-supported contract/business result weakened to vague signal | 0 |
| Confirmed year result suppressed because Month/Day is unavailable | 0 |
| Mixed timing collapsed to ambiguous/good-bad aggregate | 0 |
| Unsupported event or exact date invented | 0 |
| Numeric score/weight introduced | 0 |

These are Source Contract requirements and audit counts, not runtime Event Timing counters: no Event Timing Engine exists yet. P4-M must instrument the runtime regressions before claiming runtime counts.

## F. Evidence gaps

| Class | Item |
|---|---|
| `SOURCE_GAP` | Event-specific conditions for contract delay are described only at the broad timing level; primary 07 does not give a complete Judgment-fact-to-delay rule. |
| `SOURCE_GAP` | Positive/negative function conditions for business start are not formalized beyond start as an annual event and a case where actual success depends on the judgment. |
| `SOURCE_GAP` | Separate full condition sets for contract termination versus restructure are not enumerated. Preserve their distinct meanings and do not infer them from clash alone. |
| `ENGINE_GAP` | No registered current Judgment function mapping for contract opportunity/delay or business start/expansion/adjustment/restructure. P4-M must reuse existing Judgment and approved Outcomes; do not add astrological rules. |
| `ENGINE_GAP` | End-to-end Day evaluation and Day finalization Outcome/Assembly route are not implemented. |
| `FIXTURE_GAP` | No Event Timing-specific positive/negative runtime fixtures were located in the existing P4-J/P4-K results. P4-M must use only existing source-backed fixtures or report `NOT_TESTABLE_WITH_CURRENT_FIXTURE`. |
| `CONFLICT` | 07's numeric sample weighting conflicts with Master 08 and is resolved by `FILUNE_APPROVED_OVERRIDE`; no unresolved source conflict remains for this contract. Master 15 narrows Master 14's former broad timing deferral only for the listed event rows. |

No independent primary source files for separate Daewoon/Sewoon/Month/Day event timing were present under `src/docs/source`; the auditable timing material is in primary 04/07 and Masters 08/09. No additional rule was invented to fill that limitation.

## G. Isolation and final

```text
src/lib changes: 0
Health semantic changes: 0
Relationship semantic changes: 0
Personality changes: 0
Compatibility changes: 0
```

The prior completion records remain in force: `HEALTH_RELATIONSHIP_SEMANTIC_EXPANSION_COMPLETE` and `MONEY_OUTCOME_BATCH1_COMPLETE`. See [P4-K.2](./p4k2-health-relationship-semantic-reaudit-result.md) and [P4-J.2](./p4j2-money-outcome-closure-result.md).

```text
EVENT_TIMING_SOURCE_CONTRACT_READY
```

P4-M may begin with contract favorable/delay and business start/adjustment at Sewoon/Month only where the event-specific existing Judgment function is verifiable. Day finalization remains separate and deferred. Expansion/restructure follow when the source-supported business context and current function are independently established.
