# FILUNE Compatibility-08A
## Product Integration Contract Result

Status: `COMPATIBILITY_PRODUCT_INTEGRATION_CONTRACT_READY`

## 1. Current Product Architecture

- `src/App.tsx` owns the current wizard and route. It uses browser History API; there is no client router.
- Onboarding is held in React state (`wizardStep` 1–7). The single-person journey collects name, gender, date/time or unknown time, birthplace/country, time correction, topic, optional relationship status/duration, optional question, and optional event context.
- Birth form submission validates date/time and advances the wizard. `beginReading` sets the transition step and `isTransitioning`, then awaits `calculateAndShowResult`.
- `calculateAndShowResult` builds one canonical `BirthInput`, calls `prepareProductResult`, and pushes `/result` with `{ filuneResult: ResultRouteData }` in `history.state`. `ResultRouteData` contains calculated pillars plus input/display fields; the normal path has no `reading` unless the optional event-context path requests one.
- Initial load and `popstate` restore `filuneResult`. `/result` without valid state is replaced with `/`. Back from a result uses browser history; in the active app session, returning to `/` resumes the wizard at step 6.
- `locale` is global `Locale` React state persisted as `filune:locale` in localStorage. `getSavedLocale` accepts `ko` and `en`; absent/invalid values resolve to `ja`. Locale is not stored in current single-person result history state.
- `interestTopic`, `relationshipStatus`, duration, and optional question are wizard context. Existing status choices are `single`, `dating`, `married`; the result page receives the selected topic, not relationship status.
- `BasicChartResult` renders when `isResultPage && pillars && chart && fullAge !== null`. It owns the single-person presentation and composes `ResultHero`, `BasicReading`, chart cards, luck sections, selected-topic reading, and premium placeholder cards.
- Existing premium cards are locked and disabled placeholders. Product errors are a localized `error` string shown with `role="alert"`; calculation failure returns the wizard to step 3. The transition view shows a loader. There is no explicit duplicate-submit guard; the transition step removes the submit controls.

## 2. Compatibility Public Path

```text
two canonical BirthInput values
  + deterministic pair-slot execution IDs
  + one referenceTime
  + optional explicit relationshipStatus
        ↓
prepareCompatibilityProductResult (new C8-B product orchestration)
        ↓
readBirthCompatibility({ birth, executionId }, { birth, executionId }, referenceTime, options)
        ↓
FinalCompatibilityResult
        ↓
renderCompatibilityKo / renderCompatibilityJa / renderCompatibilityEn
        ↓
serializable customer result
        ↓
Compatibility Result UI
```

Signature detail: current `readBirthCompatibility` takes each person as `{ birth: BirthInput; executionId: string }`, followed by a shared `referenceTime` and options. It evaluates each person independently and runs C1–C5 internally. Product/UI code must not call the C1–C5 builders directly.

## 3. Proposed Product Contract

`prepareProductResult(birth, options)` remains the single-person chart preparation owner. It calculates pillars and optionally invokes `readBirthChart`; it is not a pair compatibility API. `readBirthChart` evaluates one BirthInput, outcomes, and optional Event Timing context, then assembles one `ReadingAssembly`.

Add a separate product owner in C8-B, following the `prepareProductResult` naming convention:

```ts
type CompatibilityLocale = Locale
type CompatibilityPersonInput = { name?: string; birth: BirthInput }
type PrepareCompatibilityProductInput = {
  first: CompatibilityPersonInput
  second: CompatibilityPersonInput
  locale: CompatibilityLocale
  relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married'
  referenceTime?: string
}
type CompatibilityProductResult = {
  kind: 'compatibility'
  locale: CompatibilityLocale
  referenceTime: string
  final: FinalCompatibilityResult
  customerResult: CompatibilityCustomerResultKO
    | CompatibilityCustomerResultJA
    | CompatibilityCustomerResultEN
}
```

The orchestration owner will:

1. Accept two existing `BirthInput` objects; no compatibility-specific chart schema.
2. Assign fixed pair-slot IDs such as `compatibility:first` and `compatibility:second`. IDs are deterministic, independent of names, and distinct when names match.
3. Capture one ISO `referenceTime` and use one `readBirthCompatibility` call.
4. Pass only explicitly supplied relationship status through existing `userContext.relationshipStatus`.
5. Build `displayNames` keyed by those IDs for renderer input. Names stay outside engine identity and existing renderer validation remains in effect.
6. Send the same `FinalCompatibilityResult` to the renderer selected by the global `Locale`.
7. Return the final result and locale-specific customer DTO; both are serializable. The page consumes `customerResult`, not a locally reconstructed semantic model.

The route/history layer should store the compact `customerResult`, two original inputs and display names, reference time, locale snapshot, and explicit relationship context. Do not put full `FinalCompatibilityResult` in `history.state` by default: the C5 graph contains extensive facts and provenance, while the rendered DTO has source references and is enough to restore the customer page without recalculation. The in-memory product result can retain `final`.

## 4. Route Decision

Use a separate `/compatibility/result` route with the existing History API. This isolates existing `/result` `ResultRouteData` and `BasicChartResult`, leaving the single-person route contract untouched. No router dependency or result-kind union migration is needed.

Compatibility history state should use a separate versioned key, for example:

```ts
{
  filuneCompatibilityResult: {
    version: 1,
    kind: 'compatibility',
    first: { birth: BirthInput, name?: string },
    second: { birth: BirthInput, name?: string },
    relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married',
    locale: Locale,
    referenceTime: string,
    customerResult: CompatibilityCustomerResultKO
      | CompatibilityCustomerResultJA
      | CompatibilityCustomerResultEN
  }
}
```

Keep legacy `{ filuneResult }` unchanged. Missing/malformed compatibility state at direct route access returns to `/` using the existing invalid `/result` fallback pattern. `popstate` restores the matching state. Browser back returns to prior onboarding state in the active app session.

## 5. State Contract

- Each person owns optional name and complete canonical `BirthInput`: date; known time with hour/minute or unknown; optional gender; optional canonical birthplace; `timeCorrectionMode`.
- Form state holds separate participant records. Birthplace and correction are per person; country may default via existing locale helper, and each participant may select a different supported country.
- Execution IDs are fixed by pair slot, not names. Display names are keyed separately by execution ID.
- Relationship context is omitted unless explicitly selected. Reuse existing values `single | dating | partnered | married`. Existing single-person choices are `single | dating | married`; `partnered` is already supported by compatibility engine but is optional in new UI.
- Locale is existing `Locale` (`ja | ko | en`). Use global locale when entering the flow and snapshot the selected locale into result history so restored output matches its rendered DTO. Do not infer locale from birthplace.
- Loading uses existing localized transition convention with explicit `idle | calculating | success | error`; disable submit while calculating so only one request is in flight.
- Validation, calculation, unsupported route state, and unsupported runtime locale are product errors—not compatibility verdicts. Risk/unfavorable results remain successful calculations.
- Push `/compatibility/result` once on success. On error, keep the input flow and show a localized alert. Back uses `history.back()`; `popstate` restores the route snapshot. Direct access without valid state returns to onboarding.

## 6. Locale Contract

Use current `Locale` and `messages[locale]` authority. Route directly:

```text
ko → renderCompatibilityKo(rendererInput)
ja → renderCompatibilityJa(rendererInput)
en → renderCompatibilityEn(rendererInput)
```

Each renderer receives the same C5 `FinalCompatibilityResult`; its input may add `userContext.displayNames` and retain `relationshipStatus`. No renderer consumes another locale's strings.

## 7. Result UI Contract

All three actual return types share this top-level shape:

```text
headline?; headline provenance refs?
sections[]: { key, heading, statements[] }
timeline[]: { temporal, heading, interval?, within?, statements[], provenanceRefs[] }
```

Statements expose `text`, optional `periods`, and `provenanceRefs`. JA/EN also expose `semanticIds` and headline semantic IDs; KO does not. The UI renders the common intersection only. It may use shared section `key` for stable identity but must not infer semantics from locale strings. Periods already provide localized labels, temporal classification, optional Gregorian interval, overlap context, and provenance. `provenanceRefs` remain internal.

```text
CompatibilityResult receives one locale-specific customer DTO
  → render headline when present
  → render only returned sections in returned order
  → render returned timeline cards chronologically
  → use renderer-provided labels and text; no local semantic mapping
```

Do not synthesize omitted sections. React does not calculate verdict, certainty, direction, marriage quality, or breakdown status.

## 8. Free/Paid Exposure Boundary

`BasicChartResult` currently has locked premium placeholders; they do not define Compatibility access. C6 renderers return the full customer DTO. A future entitlement/visibility adapter can control display after renderer output and before the component while retaining the full result and provenance.

C8-A does not choose free/paid sections, prices, or payment behavior. The component contract can display the complete DTO until a separate explicit product policy sets access. No integration blocker is created by the current placeholder.

## 9. Files Expected to Change in C8-B

Expected additions/edits, subject to implementation layout:

```text
src/App.tsx
src/i18n/ja.ts
src/i18n/ko.ts
src/i18n/en.ts
src/lib/product/prepareCompatibilityProductResult.ts          (new)
src/components/compatibility/CompatibilityInput.tsx            (new)
src/components/compatibility/CompatibilityResult.tsx           (new)
src/style.css
```

Reuse existing `BirthInput`, `readBirthCompatibility`, renderer exports, `Locale`, birthplace helpers, and History API. No expected changes to C1–C7 semantics, `BasicChartResult`, `prepareProductResult`, `readBirthChart`, Judgment, or the existing single-person result contract.

## 10. Risks / Gaps

| Class | Finding | C8-B handling |
|---|---|---|
| `IMPLEMENTATION_GAP` | Public engine/renderer APIs exist, but no compatibility input/result UI or product orchestration wrapper exists. | Expected C8-B work; wire through existing public API only. |
| `PRESENTATION_GAP` | `BasicChartResult` is single-person specific and cannot display compatibility DTO sections/timeline. | Add isolated compatibility result component; leave existing component unchanged. |
| `PRODUCT_POLICY_GAP` | Existing premium placeholders do not specify Compatibility free/paid exposure. | C8-A leaves visibility policy undecided; do not hard-code gating in result component. |

No unresolved engine semantic issue was found. No new compatibility rule or locale semantic is needed. Product integration can proceed without a policy decision.

## 11. Regression Plan

For C8-B wiring, run:

```text
existing single-person form → /result → browser back / history restore
Compatibility two-person input → readBirthCompatibility → locale renderer → result route
invalid direct /result and /compatibility/result state fallback
compatibility loading, duplicate-submit guard, and localized product-error states
Compatibility C1–C7 verifier suite
KO/JA/EN renderer parity and source fixtures
npx tsc -b
npm run build
git diff --check
```

Assert the existing one-person route state and behavior are unchanged, both BirthInputs are distinct and unmutated, one shared `referenceTime` is used, explicit context/names route correctly, and browser back restores the prior app state.

## 12. Final Decision

```text
COMPATIBILITY_PRODUCT_INTEGRATION_CONTRACT_READY
```
