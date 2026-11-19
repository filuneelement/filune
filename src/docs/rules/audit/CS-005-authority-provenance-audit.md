# CS-005 authority / provenance audit

Scope: hidden-stem authority separation and actual provenance supply only. No rule evaluator, role judgment, CS expected outcome fixture, canonical formula, UI, or AI changes.

## Source authority and integrity

A rev179, A-8 (highest priority), A-8-1 C-10/I-02, A-8-9 IR-02. Frozen source SHA-256: `4d918e24854c5d48724779e2167cd2d0fa9b7c6140afb5ff8c076f067c40d80c`.

A names the default 本기·중기·여기 system but does **not** supply a complete twelve-branch role table. I-02 explicitly assigns 子 main 癸; IR-02 uses 子(지장간 癸). C-10 presents alternate 亥 lists 壬甲 / 戊甲壬 without assigning all roles to a selected exhaustive table. Case exposure examples 寅甲 / 戌戊 do not specify full role lists. No values are inferred from these examples.

Thus filune-a179 has frozen authority metadata, but partial DATA. It is not a complete production table. `sourceDisplayOrder` main/middle/residual follows A's system naming; it is a technical serialization order, not a newly claimed complete source table order. Legacy display order remains residual/middle/main. Omitted roles mean unknown, never absent/nonexistent.

## Twelve-branch comparison

Legacy column is exact existing display order 여기 → 중기 → 본기, with missing positions shown —. A column records only explicitly assigned roles. “Unverified” does not mean equal or different.

| Branch | Legacy 여기 / 중기 / 본기 | A179 explicit role data | Difference / comparison | CS-005 impact |
|---|---|---|---|---|
| 子 | 壬 / — / 癸 | main 癸; exhaustive role list unconfirmed | main matches; legacy residual 壬 not asserted by A | natal day: emits main 癸 only; no default fallback 壬 |
| 丑 | 癸 / 辛 / 己 | unknown | unverified | 2027.1 辛丑: full hidden facts deferred |
| 寅 | 戊 / 丙 / 甲 | unknown; A mentions 甲 exposure | full roles/order unverified | natal month: full hidden facts deferred |
| 卯 | 甲 / — / 乙 | unknown | unverified | outside specified four stage branches |
| 辰 | 乙 / 癸 / 戊 | unknown | unverified | natal year: full hidden facts deferred |
| 巳 | 戊 / 庚 / 丙 | unknown | unverified | outside specified four stage branches |
| 午 | 丙 / 己 / 丁 | unknown | unverified | January 2027 still belongs to 2026 丙午 yearly period; do not substitute 丁未 |
| 未 | 丁 / 乙 / 己 | unknown | unverified | 己未 great luck and post-立春 2027 丁未 yearly period: full facts deferred |
| 申 | 戊 / 壬 / 庚 | unknown | unverified | outside specified four stage branches |
| 酉 | 庚 / — / 辛 | unknown | unverified | outside specified four stage branches |
| 戌 | 辛 / 丁 / 戊 | unknown; A mentions 戊 exposure | full roles/order unverified | natal hour per C source; unknown exact input time produces no hour entity |
| 亥 | 戊 / 甲 / 壬 | alternate list examples 壬甲 / 戊甲壬, no full role assignment | selected full roles/order unverified | outside specified four stage branches |

The prior A/C/D compatibility audit remains separate: D rev152 H-3-1 gives 子 main 癸 only and full lists for 丑/寅/辰/午/戌; C rev215 C-10-1 excludes 戊 in default 亥. That combined audit detects legacy 子 residual 壬 and 亥 residual 戊 differences. Those observations are NOT silently promoted into A-only table authority. No A-only assertion is made for the other eleven full rows. A-only complete compatibility remains unverified.

## Implementation boundary

- `systems/hiddenStemFiluneA179.ts`: frozen metadata; twelve entries, 子 partial / eleven unknown. Validates supplied A metadata and cited clauses. Provenance adapter checks entire supplied text against frozen source hash.
- `produceJudgmentEngineFacts`: requires explicit `filune-a179` selection and actual source text. Emits only documented assigned roles and existing `calculateTenGod` results; partial/unknown availability accompanies every branch entity. No legacy fallback.
- `produceJudgmentFacts` default path remains legacy, preserving existing 41 producer checks. No legacy table modification.
- Raw Canonical basicRelations remains unchanged and is marked `legacy-reference-only` in the selected A projection. It must not be consumed as A-authoritative hidden-stem data.
- Existing `calculateTenGod` is reused; A 子 main 癸 produces its existing relationship to the supplied day stem. No exposure, strength, structure, useful-god or supporting-god judgment is calculated.
- No claim that partial A facts validate C's complete judgments. CS-005's 丙 support persistence cannot be established by these facts alone.

## CS-005 four-stage impact

C rev215 C-1 supplies natal 甲辰 丙寅 戊子 壬戌 and reverse-inferred birth date 1964-02-09 with 戌 hour RANGE 19:30–21:29. No midpoint is invented. Source-date routing verification uses unknown time and therefore creates no time-pillar fact. This is an authority-routing check, not a CS expectation fixture.

| Stage | Branches / context | A-only availability | Result boundary |
|---|---|---|---|
| Natal | 辰 寅 子 戌 (C original pillars) | 子 main 癸 partial; 辰/寅/戌 unknown | no full structure/role inference; exact birth time provenance absent |
| 己未 great luck | 未 | unknown | no state change produced |
| 2027 yearly | 丁未 after 立春, 丙午 before it | 未/午 unknown | explicit effective period required; no yearly role outcome |
| January 2027 辛丑 | 丑, still 丙午 yearly period | unknown | no合去/weakening/丙 persistence result |

## Actual provenance inventory

`provenanceProducer` reprojects/validates actual Canonical values, checks context and fact values, records sourceType/sourceRef, calculationVersion, documentRevision, referenceTime, SHA-256 input hash and actual source-text hash. `producedAt=null`: referenceTime is not a witnessed production timestamp. Hashes identify bytes, not truth. Sidecar metadata extends no contract-schema meaning. Projections from one calculation share one originIdentity; renaming a producer cannot establish independence. This adapter cannot register independent-cross-check, reverse-inference or operator-confirmed records.

| Item | Actual current source | Independent second source currently recorded? | Provenance storage | A compliance status |
|---|---|---|---|---|
| Birth date/time | canonical birthInput; customer receipt only if supplied | none; input is not an observed birth certificate | actual input hash; receipt ref provisional | C-03/OP-P02 boundary/uncertainty metadata inspectable; C source reverse-inferred date is not customer-confirmed exact time |
| Birthplace | optional Birthplace metadata / supplied selection | none | birthInput snapshot/hash; absent stays absent | does not itself verify historic standard time C-04 |
| Timezone | birthInput birthplace.timezone; timePolicy per-field interpretation; fixed-JST calendar path; US Intl historical conversion | none; host ICU/tzdata unpinned | version/timePolicy and source references | C-04 external historical checking missing; no false compliance |
| Local correction | timeCorrection.ts; US usTimeCorrection.ts; selected none/longitude; trueSolarTime unsupported | none | existing correction/timePolicy snapshot | C-03/OP-P02 metadata available; tool/document boundary differences unresolved |
| Jie instant | astronomy-engine SunPosition/SearchSunLongitude via solarTermPillars.ts | none in runtime evidence | canonical solarTerms + calculation version | C-01/C-08 facts available; C-02 direct independent comparison missing |
| Four pillars | year/month astronomy-engine; day/hour lunar-typescript; optional existing corrected-hour function | none computes and records all same items independently | canonical pillar facts + version/timePolicy | C-01/C-03/C-08 facts projected only, not document certification |
| Great-luck start | calculateGreatLuck.ts using same astronomy jie and existing conversion | none; same boundary library is not independent | canonical greatLuck / input hash / version | C-05/C-06 facts projected; unknown-hour range and C-07 wording not newly implemented |

lunar-typescript and astronomy-engine are distinct packages but currently supply DIFFERENT pillar components. Calling shared solarTermPillars functions from multiple paths is the same source. KASI snippets/tests are not a fresh runtime comparison evidence record. No false independent-check record is generated.

| Evidence type | Actual supply |
|---|---|
| customer-input | only caller-supplied real receipt reference; provisional; no receipt from bare birthInput |
| deterministic-calculation | actual canonical projection, existing ten-god lookup, structural relation producer; provisional |
| source-document | actual supplied A text checked against metadata/clauses and frozen SHA; provisional, existence ≠ confirmation |
| independent-cross-check | unavailable; no paired independent same-item runtime observations |
| reverse-inference | unavailable as runtime evidence; C-1 describes historical selection, but no original candidate/adoption provenance supplied to adapter |
| operator-confirmed | unavailable; no actual decision event/approval scope supplied; historical document status is not runtime approval |

## Evidence execution policy

Direct independent comparison requirements: C-02 and OP-P04. C-01/C-03/C-04/C-05/C-06/C-07/C-08/OP-P02 have no universal standalone independent comparison clause; the existing implementation policy defers these behind the upstream calendar-compliance gate (D H-2/H-5-2). This is explicitly a conservative runtime gate, not a new A rule. C-04 additionally needs historical external data when applicable; OP-P02 needs actual boundary/time-policy compliance and provenance. Deterministic facts may still be produced while certification is deferred.

Deferred policy IDs with current evidence: C-01, C-02, C-03, C-04, C-05, C-06, C-07, C-08, OP-P02, OP-P04. Other mapped rules having “no direct independent requirement” are NOT thereby implemented, approved or executable. No evaluator is connected.

## Remaining decisions / blockers (two)

1. Supply an authoritative A-backed complete twelve-branch role table (or explicitly authorize a separate supplemental source, revision and authority relationship). Current original A cannot support the requested complete table; copying D/C without authorization would violate A-only sourcing.
2. Supply actual same-item independent observations plus their sources/timezones, original reverse-inference candidate/adoption provenance, and birth-time range/source (including applicable historical timezone evidence). Existing Canonical input cannot express an hour range; do not invent an exact timestamp or modify canonical formulas here.

Evaluator implementation start: NO. Infrastructure available; document-conformant CS-005 execution remains deferred. No evaluator, role assignment, UI, AI, or canonical formula was added.

## Verification result

- New verify:judgment-authority-provenance: 49 checks passed, including frozen source hash, twelve-row partial/unknown coverage, explicit selection, CS source-date unknown-time routing, real evidence restrictions, no mutation and legacy preservation.
- Existing verify commands: 16/16 passed (17 total including new command).
- verify:judgment-runtime-context: 41 checks passed.
- verify:judgment-producers: 41 checks passed unchanged.
- verify:judgment-contract-layer: 118 checks passed (95 original + 23 regression); three audit probes rejected.
- verify:judgment-contract: passed.
- TypeScript/Vite build: passed. Client asset filenames/hashes unchanged from the pre-change build.
- Existing verify scripts, contract schemas, canonical, legacy table, evaluator and UI files were not edited in this task.

## Task file manifest

New: systems/hiddenStemFiluneA179.ts; producers/provenanceProducer.ts; scripts/verify-judgment-authority-provenance.mjs; this audit and companion .txt.
Modified: producers/hiddenStemProducer.ts, evidenceProducer.ts, index.ts, types.ts, validation.ts; package.json adds one verify command.
Pre-existing package-lock.json changes were retained without edits. The judgment/docs directories were already untracked on entry; this manifest describes changes during this task, not an attribution of the entire git status.
