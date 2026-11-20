# FILUNE P4-M.3 Event Timing Source-backed Fixture Qualification

## Final

```text
EVENT_TIMING_FIXTURE_GAP_REMAINS
```

No new Event Evidence mapping, Judgment rule, Outcome rule, or source inference was added. No application code or existing fixture expectation was changed. The source examples contain useful retrospective event evidence, but the inspected source does not provide the Gregorian birth date/time required to replay them through the repository's Canonical `BirthInput`. Reconstructing or guessing those inputs would violate the fixture contract.

## Source-backed candidates and executable fixture status

| Fixture | Source-backed | Judgment path | Evidence Fact | Timing Fact | Result |
|---|---|---|---:|---:|---|
| Contract support candidate — Primary 07 §§481, 650–53 | Yes, source case interpretation | Not executable: no complete Gregorian BirthInput located | NOT TESTABLE | NOT TESTABLE | `FIXTURE_GAP` |
| Contract negative — Primary 07 §1137 | Yes; money condition favorable while document/contract is unfavorable | Not executable: no complete Gregorian BirthInput located | NOT TESTABLE | NOT TESTABLE | `FIXTURE_GAP` |
| Business activity/result — Primary 07 §§1026–33 | Yes; company/revenue and operating trouble coexist | Not executable: natal pillars and retrospective interpretation only; no complete BirthInput | NOT TESTABLE | NOT TESTABLE | `FIXTURE_GAP` |
| Business expansion + contract/Money obstruction — Primary 07 §§2050–58 | Yes; shopping business expansion, supplier contracts tie up funds and work changes | Not executable: natal pillars and retrospective interpretation only; no complete BirthInput | NOT TESTABLE | NOT TESTABLE | `FIXTURE_GAP` |
| Business expansion then closure — Primary 07 §§1863–74 | Yes; retrospective academy expansion and later closure | Not executable: no complete Gregorian BirthInput located | NOT TESTABLE | NOT TESTABLE | `FIXTURE_GAP` |
| Existing business adjustment — Primary 07 §§1671–75 | Yes; business/revenue persists alongside difficulty and later work adjustment | Not executable: no complete Gregorian BirthInput located | NOT TESTABLE | NOT TESTABLE | `FIXTURE_GAP` |
| Generic-event shortcut negative — existing CS-005, CS-126, CS-127 and runtime-context fixtures | Existing pipeline fixtures; not positive source-event fixtures | Existing Birth Input → Canonical → Judgment path was used by P4-M.2 | 0 | 0 | PASS for no generic emission; does not satisfy source-backed positive qualification |

## Fixture counts

```text
Contract positive fixtures: 0 executable (1+ source candidate)
Contract negative fixtures: 0 executable (1+ source candidate)

Business start fixtures: 0 executable
Business expansion fixtures: 0 executable (2 source candidates)
Business adjustment fixtures: 0 executable (1 source candidate)
Business restructure fixtures: 0 executable

Mixed fixtures: 0 executable (Primary 07 §§1026–33 and §§2050–58 are source candidates)
Negative shortcut fixtures: 4 existing pipeline fixtures; no generic EventEvidenceFact/EventTimingFact emitted in P4-M.2
```

The source candidates are not represented as executable fixture passes. They are retrospective descriptions and natal pillar tables, not full input records. In particular, no candidate was mapped to an invented event-year/month or supplied with fabricated customer event context for a positive assertion.

## Input and source audit

`src/lib/canonical/types.ts` defines `BirthInput.date` with `year`, `month`, and `day`, and `time` as either a known hour/minute or explicitly unknown. The cited Primary 07 cases provide four pillars, sex in some cases, and retrospective interpretations/luck intervals, but the inspected passages do not provide a complete Gregorian date/time record that can be passed unchanged through `calculateCanonicalChart`. A four-pillar label does not uniquely specify that input; deriving a date or time would be an unsupported reconstruction.

No source/Canonical disagreement was established because the cases could not be replayed. Therefore `SOURCE_CONFLICT` is not asserted. No `EventEvidenceFact` was manually injected, and no `EventTimingFact` was directly fabricated.

## Gap classification

```text
ENGINE_GAP:
  Day finalization remains the P4-M.2 gap; excluded from this qualification.
JUDGMENT_FACT_GAP:
  No new gap established. The candidate cases were not replayable to test path linkage.
SOURCE_GAP:
  Legal dispute/breach/lawsuit claims remain outside the approved source contract.
SOURCE_CONFLICT:
  None established; no executable canonical comparison was possible.
FIXTURE_GAP:
  Complete BirthInput for the source-backed contract and business cases is absent from the inspected source/repository records. Thus executable contract-positive and business-positive fixtures remain 0.
```

## Shortcut and assertion checks

P4-M.2's unchanged negative-fixture evidence remains authoritative for its four existing pipeline fixtures: EventEvidenceFacts and EventTimingFacts were both 0, so generic favorable conditions did not create event results. This is a useful negative guard, not evidence that positive mappings work.

```text
New mapping / Judgment / Outcome rules: 0
New source inference: 0
Existing fixture expectation changes: 0
Unsupported source-backed positive assertions: 0
Manual EventEvidenceFact / EventTimingFact injection: 0
```

| Required qualification | Status |
|---|---|
| At least one executable source-backed contract positive | FAIL — `FIXTURE_GAP` |
| At least one executable source-backed business positive | FAIL — `FIXTURE_GAP` |
| Existing generic-shortcut negative fixtures | PASS (4; P4-M.2 record) |
| Source provenance, stable identity, orphan/duplicate checks for new positive facts | NOT TESTABLE — no positive facts emitted |
| Mixed source cases independently preserved at runtime | NOT TESTABLE — source candidates are not executable |

## Verification

```text
P4-M.2 verifier: PASS
npx tsc -b: PASS
npm run build: PASS
```

P4-M.2 verifier output: 4 pipeline fixtures; EvidenceFacts 0; TimingFacts 0; orphan, duplicate, scope mismatch, unsupported context, free leakage, mutation, stable identity mismatch, Assembly missing, and shortcut violation tallies all 0. It reports `sourceBackedPositiveFixture: NOT_TESTABLE_WITH_CURRENT_FIXTURE` and `conditionalPositivePathCandidatesObserved: 0`. This confirms the known negative-fixture behavior but does not meet P4-M.3's positive fixture requirement. No full P2/P3/P4 regression was repeated because this task made no code or existing fixture changes; P4-M.2's recorded regression remains unchanged.

## Conclusion

The source contains meaningful real-life candidates, including positive business outcomes coexisting with financial/operational difficulty. The required pipeline fixture qualification cannot be completed without source-supplied BirthInput records or an approved source-data fixture containing such records. Do not fill this gap by reversing the four pillars into guessed calendar dates. Final status remains:

```text
EVENT_TIMING_FIXTURE_GAP_REMAINS
```
