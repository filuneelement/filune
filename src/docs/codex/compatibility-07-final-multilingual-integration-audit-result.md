# FILUNE Compatibility-07 — Final Multilingual Integration Audit

Status: `COMPATIBILITY_ENGINE_MULTILINGUAL_COMPLETE`

## Result summary

```text
C1: PASS
C2: PASS
C3: PASS
C4: PASS
C5: PASS
KO: PASS
JA: PASS
EN: PASS

Public entry point: readBirthCompatibility(BirthInput, BirthInput, referenceTime, options)

Semantic mismatches: 0
Certainty mismatches: 0
Direction mismatches: 0
Timing mismatches: 0

Duplicate IDs: 0
Orphan provenance: 0
Invented dates: 0
Input mutations: 0

Terminology violations: 0
Numeric-score violations: 0
Invented outcomes: 0
Relationship-status inference: 0

Implementation bugs: 0 remaining (one additive scope-provenance fix applied and verified)
Presentation bugs: 0
Test infra gaps: 1 non-blocking ancillary Judgment runtime-context fixture unavailable
Policy gaps: 0
```

## Public path and exposure

`readBirthCompatibility` is exported from `src/lib/reading/index.ts`. One call evaluates both BirthInputs independently, then runs C1 cross-chart facts, C2 structural policy, C3 personality interaction, C4 relationship lifecycle/timing, and C5 final assembly. It returns a serializable result. It does not mutate the supplied inputs or the independent Judgment/Personality results.

`renderCompatibilityKo`, `renderCompatibilityJa`, and `renderCompatibilityEn` are public exports from `src/lib/compatibility/index.ts`. Each takes `FinalCompatibilityResult` directly. The Japanese and English renderers use locale-specific templates and period formatting; neither consumes Korean or Japanese customer strings as translation input.

The compatibility library API is available for product use. The current app does not call this API from a customer result page yet; the `/result` screen, input UX, loading/error states, and layout connection are Compatibility-08 scope.

## C1–C6 audit matrix

| Layer | Input | Output | Direction | Scope | Provenance | Deterministic | Status |
|---|---|---|---|---|---|---|---|
| C1 Cross-chart facts | Two independent evaluated charts | Stem, branch, root-support, and role interaction facts | Source/target retained | Natal and supported cross-chart scopes | Source fact IDs retained | PASS | PASS |
| C2 Structural | C1 facts and each person's canonical Judgment requirements | Directional verdicts and effects | A→B and B→A retained | Source effects retain scope references | Effect IDs point to C1 evidence | PASS | PASS |
| C3 Personality | Public Personality facts for both people | Natal and current interaction facts | Mutual/directed identity retained | Natal/current separate | Personality and Judgment fact IDs retained | PASS | PASS |
| C4 Lifecycle/timing | Independent per-person Judgment, relationship outcomes, C2/C3 outputs | Individual and pair relationship decisions/windows | A-only, B-only, mutual retained | Supported scopes and projected intervals retained | Decision, evidence, path, and source IDs retained | PASS | PASS |
| C5 Final assembly | C1–C4 outputs | Structural, Personality, Lifecycle, strengths, risks, current/future/history windows | Directional axes retained | Current/future/history classified | Upstream facts remain reachable | PASS | PASS |
| C6 KO/JA/EN | FinalCompatibilityResult | Locale-specific customer result | Identity and direction preserved | Shared temporal classification and windows | Rendered statements reference source semantics/facts | PASS | PASS |

### Scope metadata fix

Audit found that C5 copied only `scope` and `scopeId` into pair-window scope references, dropping `originScope`, `parentScopeId`, `scopeGanZhi`, and `parentScopeGanZhi` even though the underlying individual facts retained them. `assembleFinalCompatibility` now carries the available fields from the source fact/decision into each pair-window scope reference. The C5 verifier asserts those fields against the source. C5 passes after this additive change; no judgment or timing semantics changed.

## Locale matrix

Seven shared fixtures were checked: `mixed`, `balanced`, `history`, `relief`, `bothPaths`, `marriageSource`, and `breakdownSource`.

| Check | KO | JA | EN |
|---|---:|---:|---:|
| Semantic parity | PASS | PASS | PASS |
| Certainty | PASS | PASS | PASS |
| Direction | PASS | PASS | PASS |
| Timing identity/classification | PASS | PASS | PASS |
| Terminology violations | 0 | 0 | 0 |
| Numeric score | 0 | 0 | 0 |
| Invented outcomes | 0 | 0 | 0 |
| Relationship-status inference | 0 | 0 | 0 |
| Orphan statements | 0 | 0 | 0 |

Fixture parity counts from the C6-C verifier:

| Fixture | KO | JA | EN | Missing | Extra | Certainty mismatch | Direction mismatch | Timing mismatch |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| mixed | 13 | 13 | 13 | 0 | 0 | 0 | 0 | 0 |
| balanced | 15 | 15 | 15 | 0 | 0 | 0 | 0 | 0 |
| history | 13 | 13 | 13 | 0 | 0 | 0 | 0 | 0 |
| relief | 7 | 7 | 7 | 0 | 0 | 0 | 0 | 0 |
| bothPaths | 13 | 13 | 13 | 0 | 0 | 0 | 0 | 0 |
| marriageSource | 5 | 5 | 5 | 0 | 0 | 0 | 0 | 0 |
| breakdownSource | 5 | 5 | 5 | 0 | 0 | 0 | 0 | 0 |

The C6-A.1/C6-B/C6-C presentation checks also report zero current-long-window label errors, overlap grouping errors, item-number references, chronology errors, certainty downgrades, terminology violations, score violations, invented outcomes, orphan statements, and duplicate statements.

## Source case matrix

| Source case | Expected | Engine result | KO | JA | EN | PASS |
|---|---|---|---|---|---|---|
| `07:L1849` actual marriage, 戊戌 | Marriage opportunity confirmed | Confirmed; relationship formation also preserved | Present | Present | Present | PASS |
| `07:L596-L605` opportunity with caution | Opportunity and caution both confirmed | Both decisions remain separate | Present | Present | Present | PASS |
| `07:L1451` compound breakdown, 乙丑 + 甲辰 | BREAKDOWN-A confirmed | Breakdown risk retained with path provenance | Present | Present | Present | PASS |
| `07:L3274` 丁酉 spouse-event disruption | BREAKDOWN-B confirmed | Relationship change and breakdown risk both confirmed | Present | Present | Present | PASS |

Negative C4 contracts passed: clash-only, spouse-actor-only, stopped spouse actor plus clash, and baseline-vulnerability-only did not generate breakdown risk. Path A and B can coexist while retaining one breakdown decision and both path IDs.

## Timing, assembly, and mutation checks

- A-only, B-only, and mutual windows remain separately identifiable.
- Marriage opportunity, marriage favorable, and marriage caution remain independent facts. Opportunity and caution coexist in source fixtures.
- Relationship change is not converted to marriage or breakup.
- Structural, Personality, and Lifecycle axes are assembled independently; favorable/unfavorable directional results are not averaged.
- Current, future, and expired/history windows remain separated. Long windows spanning the reference date use `current_spanning`; overlapping individual and mutual facts remain present and are grouped only in customer presentation.
- Real Gregorian projections are used only when available. Fake Gregorian dates: 0. Day finalization remains an upstream `ENGINE_GAP` where the Event Timing engine does not support it; supported longer scopes pass and this does not block compatibility completion.
- Duplicate IDs: 0; orphan provenance: 0; BirthInput/context/Judgment/RootState/Personality mutations: 0.
- Numeric score, generic averaging, and confirmed-certainty downgrade: 0.

## Regression and build

Compatibility C1, C2, C3, C4B targeted, C4, C5, C6-A, C6-A.1, C6-B, and C6-C verifiers passed. Judgment P0/P1 suites passed. Personality KO/JA/EN, Money, Health, Relationship, Event Timing Batch 1 and production wiring regressions passed. English Personality and KO/JA renderer regressions passed.

An additional, non-required Judgment runtime-context command could not load the absent fixture `src/docs/source/A_rev179.md`; the canonical P0/P1 suites passed. This is recorded as a test-infrastructure gap only and did not change expected values or production code.

```text
npx tsc -b: PASS
npm run build: PASS
git diff --check: PASS
```

## Gap classification

| Gap | Class | Affected layer | Exact finding | Resolution / follow-up |
|---|---|---|---|---|
| Pair timing scope references omitted source metadata | IMPLEMENTATION_BUG | C5 timing assembly | Pair windows exposed only `scope` and `scopeId` | Fixed additively; C5 verifier now checks source metadata; PASS |
| Ancillary Judgment runtime-context verifier fixture absent | TEST_INFRA_GAP | Judgment test infrastructure | `src/docs/source/A_rev179.md` is unavailable to the extra verifier | No compatibility impact; canonical Judgment P0/P1 suites PASS |
| Other implementation/presentation/policy gaps | None | — | No remaining contract mismatch found | — |

No policy decision is required. No new astrological rule or expected semantic value was added.

## Final decision

```text
COMPATIBILITY_ENGINE_MULTILINGUAL_COMPLETE
```
