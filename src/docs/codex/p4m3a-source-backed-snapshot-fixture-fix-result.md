# FILUNE P4-M.3A Source-backed Snapshot Fixture Qualification

## Final

```text
SOURCE_SNAPSHOT_FIXTURE_GAP_REMAINS
```

This audit applied the corrected two-lane fixture contract. Gregorian BirthInput is not required for Lane B, and no BirthInput was reverse-engineered. However, the cited source cases do not provide the complete **scoped, time-effective Judgment snapshot inputs** needed by the existing Event Timing API to emit source-backed TimingFacts without inventing evaluation dates or structural facts.

No application code, Master 15 mapping, Judgment rule, Outcome rule, fixture expectation, or source inference was changed. No snapshot fixture was added because the missing fields are required inputs, not derivable details.

## A. Fixture strategy

| Lane | Existing/qualified input | Coverage | Result |
|---|---|---|---|
| Production wiring | Four existing BirthInput cases in the P4-M.2 verifier: CS-005, CS-126, CS-127, and runtime-context | BirthInput → Canonical → Judgment → Event Timing → Reading Assembly; 4 cases, no false-positive event facts, no mutation, no shortcut violations | `PASS` per P4-M.2 verifier; EventEvidenceFacts 0 and EventTimingFacts 0, so this is the negative/wiring lane only |
| Source-backed semantic | Primary 07 source examples with chart pillars, named Luck pillars/ages, and retrospective expert interpretation | Source chart facts can be catalogued, but a qualifying scoped snapshot with source-supported evaluation period and all current-function gates cannot be established for both required positive domains | `FIXTURE_GAP` |

```text
Production BirthInput fixtures: 4 (existing P4-M.2 lane)
Source-backed snapshot fixtures: 0 executable
Reverse-engineered BirthInputs: 0
Invented Gregorian dates/times: 0
```

## B. Candidate source cases

| Fixture candidate | Source chart / Luck context | Expert-stated result | Snapshot assessment | Status |
|---|---|---|---|---|
| Contract positive — Primary 07 §§644–53 | Natal: 辛未 / 己亥 / 丙午 / 癸巳; named 癸卯 Daewoon, 癸卯 Sewoon, 乙卯 Month | A favorable document and position; the month is described as a document opportunity with an elder/senior proposal | Source supports the case meaning and scope sequence. It does not identify Gregorian year/solar-term boundaries for this repeated sexagenary sequence. The engine requires effective interval evaluation. No dates were selected to force `currentlyEffective`. | `ENGINE_GAP` for executable timing; semantic candidate retained |
| Contract negative — Primary 07 §§999–1009 | Natal: 丁卯 / 丁未 / 丙寅 / 壬申; named 庚戌 Daewoon, 甲辰 year, 庚午 Month in June | A favorable document is impaired by the Daewoon; the source describes money becoming tied up by document/contract issues | Source gives strong structural and negative event detail. It does not specify which 甲辰 Gregorian cycle or a complete solar-term interval. A precise event snapshot cannot be time-evaluated without selecting an unsupported date window. | `SOURCE_CHART_INCOMPLETE` for exact scoped interval; obstruction candidate retained |
| Business activity/result — Primary 07 §§1026–33 | Natal: 丁巳 / 庚戌 / 丁卯 / 戊申; described as active 상관생재 | The person operates a large company and earns through ideas/sales/operating ability while experiencing outflow and operational trouble | Natal structure and retrospective outcome are explicit. No scoped Sewoon interval is tied to the stated business performance, so this cannot establish the engine's time-specific `business_start_support` or `business_expansion_support`. | `REQUIRED_JUDGMENT_FACT_NOT_RECONSTRUCTABLE` for timing scope |
| Business expansion + contract/Money obstruction — Primary 07 §§2039–58 | Natal: 癸酉 / 乙卯 / 乙未 / 庚辰; named 戊午 Daewoon from age 27 | The existing shopping business tried to expand; supplier contracts tied up money and the person moved to freelance work | Source is a strong mixed counterexample. It states age-based Daewoon but does not identify the Gregorian validity interval or a separate favorable Daewoon+Sewoon expansion path. The described contract blockage cannot be upgraded to expansion timing support. | `SOURCE_CHART_INCOMPLETE`; mixed timing `NOT_TESTABLE` |
| Business expansion then closure — Primary 07 §§1863–74 | Natal pillar table and age-based Daewoon discussion | Academy expanded in one period and was later closed amid business problems | The source supplies retrospective sequencing, but not the complete current Judgment paths/interval identities required by the adapter and timing policy. | `REQUIRED_JUDGMENT_FACT_NOT_RECONSTRUCTABLE` |

Birth pillars and sex are transcribed only where the source states them. No source chart was converted to a Gregorian BirthInput. No unreported birth place, time, date, operating state, current function, relation, or OutcomeFact was filled in.

## C. Contract

```text
contract positive source fixture: FIXTURE_GAP
contract obstruction source fixture: FIXTURE_GAP for executable TimingFact
```

The positive candidate at 07 §§644–53 directly states the favorable document/position result and names Daewoon/Sewoon/Month pillars. It is a valid source semantic candidate, but not an executable EventTiming fixture: source does not identify the calendar-cycle instance and valid time boundaries. The negative candidate at §§999–1009 directly describes document/contract obstruction and tied-up money, but likewise lacks an unambiguous absolute scope interval. We did not invent intervals to obtain EventEvidence/Timing output.

## D. Business

```text
business positive: FIXTURE_GAP
business expansion: FIXTURE_GAP (source candidates at §§1863–74 and §§2039–58)
business adjustment: FIXTURE_GAP
business restructure: FIXTURE_GAP
mixed business + money: source candidate exists at §§1026–33 and §§2050–58; runtime NOT_TESTABLE
```

The business sources establish actual outcomes, including business activity with simultaneous trouble and attempted expansion with funds tied up by suppliers. They do not provide the necessary same-path Daewoon+Sewoon snapshot evidence for the engine's positive expansion policy. The §2058 attempt is not treated as a favorable expansion result: the source describes the attempt and its adverse outcome, not a supported favorable timing path.

## E. Generated facts and guardrails

```text
Source-backed snapshot fixtures executed: 0
EventEvidenceFacts from source-backed snapshots: 0
EventTimingFacts from source-backed snapshots: 0
Positive contract: NOT_TESTABLE
Positive business: NOT_TESTABLE
Negative/obstruction: NOT_TESTABLE end-to-end
Mixed: NOT_TESTABLE end-to-end

Invented Gregorian dates: 0
Invented birth times: 0
Invented source facts/current roles/functions: 0
Engine-output-derived expectations: 0
Direct EventEvidenceFact injection as positive proof: 0
Shortcut violations introduced: 0
```

Master 15 gates remain unchanged: 印/官/合/食傷/財/沖 presence alone does not qualify an event. Expected source meanings were recorded from Primary 07 before any adapter output was considered. No adapter output was used to author an expected result.

## F. Gap classification

```text
SOURCE_CHART_INCOMPLETE:
  The cited chart may provide four pillars and Luck pillar names/ages, but often omits the absolute interval identity or complete Luck scope sequence needed to evaluate the current EventTiming validity. No Gregorian conversion was attempted.
REQUIRED_JUDGMENT_FACT_NOT_RECONSTRUCTABLE:
  Retrospective business cases state the result but do not state the same-path, scoped current Judgment function required by the expansion/start mapping. No role, relation or current function was fabricated.
SOURCE_CONFLICT:
  None established; no canonical conversion or source snapshot execution was performed.
ENGINE_GAP:
  Existing Event Timing requires an evaluated time interval for current/future/expired state. Source-only relative/ambiguous Luck periods cannot produce a valid current TimingFact without adding unsupported date boundaries. Day finalization remains the previously approved gap.
FIXTURE_GAP:
  No source-backed contract-positive and business-positive snapshot pair can currently be executed under the existing time-scope contract. Source candidates remain documented for a future source-provided interval/snapshot or a separately approved relative-time fixture contract.
```

## G. Isolation and prior wiring lane

```text
src/lib changes in P4-M.3A: 0
Master 15 mapping changes: 0
Judgment / Outcome rules: 0
Source inference additions: 0
Existing expectation changes: 0
Relationship / Health / Money changes: 0
```

The unchanged P4-M.2 production-wiring verifier previously passed all four BirthInput fixtures. It observed EvidenceFacts 0 and TimingFacts 0, all provenance/order/mutation/shortcut counters 0, and `sourceBackedPositiveFixture: NOT_TESTABLE_WITH_CURRENT_FIXTURE`. This remains a wiring/negative check, not positive semantic coverage. Day finalization remains `ENGINE_GAP`; legal dispute remains `SOURCE_GAP`.

## Conclusion

The P4-M.3 failure was not upheld on the grounds that Gregorian BirthInput is mandatory for every rules-engine fixture. Source-only snapshots are a valid separate lane. The cited materials do not, however, provide enough unambiguous scoped and time-effective data to satisfy the current Event Timing implementation without inventing a calendar interval or current Judgment fact. The positive-fixture exit conditions therefore remain unmet:

```text
SOURCE_SNAPSHOT_FIXTURE_GAP_REMAINS
```
