# FILUNE P4-M.3B Event Timing Decision / Calendar Projection Split

## Final result

```text
P4M3B_FIX_REQUIRED
```

The Decision/projection split is implemented and its contract-only and production wiring checks pass. The required source-backed contract-negative snapshots do not emit EventEvidence or EventTimingDecision, so the source-semantic acceptance gate remains open. The existing adapter mapping was not loosened and no expected source fact was fabricated.

## Architecture

| Layer | Responsibility | Status |
|---|---|---|
| `EventEvidenceFact` | Translate current, linked Judgment/Outcome paths into event evidence | Existing mapping retained; source snapshot mode can evaluate a named scope without a Gregorian reference instant |
| `EventTimingDecision` | Assert event type, direction, named scope, certainty, lifecycle and source lineage | Implemented; stable identity does not require Gregorian timestamps |
| Calendar Projection | Resolve a Decision against its matching existing scope and real validity interval | Implemented; a missing interval or mismatched scope returns `not_projectable` |
| `EventTimingFact` | Carry projected interval plus the Decision identity and provenance | Implemented; preserves source `originScope`, scope GanZhi labels, certainty and lineage |

`ReadingAssembly` consumes projected `EventTimingFact` records. Source-only Decisions are not treated as customer calendar statements.

## Source regression

| Source case | Snapshot | Event Evidence | Decision | Result |
|---|---|---:|---:|---|
| 07 §1131–38, 壬戌/乙巳/壬子/丙午, 庚戌/丙午 | Existing `runJudgmentCore` from source-transcribed pillars; Gregorian boundaries unknown | 0 | 0 | `JUDGMENT_FACT_GAP` |
| 07 §1958–67, 戊午/甲寅/丁未/己酉, 己酉/甲辰 | Existing `runJudgmentCore` from source-transcribed pillars; Gregorian boundaries unknown | 0 | 0 | `JUDGMENT_FACT_GAP` |

Both cases remain explicit negative-contract source regressions. They emit no positive contract Decision, but also fail the required negative Decision expectation. In §1131–38 the current output exposes an operating `比肩` control path with `unfavorable_candidate`, while the described 印 damage is not available as an adapter-qualifying current contract function. In §1958–67 the relevant 印/食神 combine and related paths resolve as `deferred`; the source-described contract loss is not represented as an active adverse function and linked current role in the snapshot. These source statements do not authorize the verifier to add or rewrite Judgment facts.

No Gregorian dates, birth times, or source facts were invented. No EventEvidenceFact was injected directly. Source snapshot timing facts: 0; EventTimingDecision records: 0.

## Contract-only branch coverage

| Mapping | Coverage type | Result |
|---|---|---|
| Contract favorable | `CONTRACT_TEST_ONLY` | PASS |
| Contract delay | `CONTRACT_TEST_ONLY` | PASS |
| Business start | `CONTRACT_TEST_ONLY` | PASS |
| Business start delay | `CONTRACT_TEST_ONLY` | PASS |
| Business expansion | `CONTRACT_TEST_ONLY` | PASS |
| Business adjustment | `CONTRACT_TEST_ONLY` | PASS |
| Business restructure | `CONTRACT_TEST_ONLY` | PASS |

These fixtures verify Master 15 policy branches only; they are not represented as real or source-backed charts. A no-interval contract Decision remains `confirmed` and its projection is `not_projectable`. Projected identity preserves a natal origin scope while retaining the target scope identity. The production BirthInput lane generated no unsupported event and reached Reading Assembly without an event fact.

## Projection and policy checks

```text
Decision without Gregorian interval: confirmed / not_projectable
Gregorian birth-date or interval invention: 0
single TenGod shortcut: 0
generic favorable shortcut: 0
unsupported exact date: 0
production false-positive EventTimingFact: 0
```

## Gaps

```text
JUDGMENT_FACT_GAP:
  The two required contract-negative source cases do not expose a complete current adverse document/contract path and linked role in existing Judgment output.

ENGINE_GAP:
  None added by this split. Day finalization remains the pre-existing gap.

SOURCE_GAP:
  Legal dispute mapping remains unchanged.

FIXTURE_GAP:
  No source-backed positive contract or business decision was established in this step.
```

## Isolation

```text
Judgment semantic changes: 0
Money semantic changes: 0
Health semantic changes: 0
Relationship semantic changes: 0
Personality changes: 0
Compatibility changes: 0
```

## Regression and build

```text
npx tsc -b: PASS
npm run build: PASS
P4-K.2: PASS (supplemental reevaluation)
P4-K.2A: PASS (Health month identity/provenance parity)
P2/P3: verifier runs reported passes for the completed suites; see run limitations below.
```

The requested full `Judgment 35/35` result could not be confirmed in this workspace run: `verify-byeong-regression.mjs` exits with `ENOENT` for `src/docs/source/A_rev179.md`. Several long-running verifiers also returned live session IDs without a final status from the runner; those are not counted as PASS. Existing P4-M.2 and P4-J closure result records remain unchanged.

## Change boundary

The implementation change is limited to Event Timing Decision/projection identity and source-snapshot evaluation, plus this specification and verifier. No Judgment or domain Outcome rule was modified.
