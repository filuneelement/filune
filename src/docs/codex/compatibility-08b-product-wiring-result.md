# FILUNE Compatibility-08B
## Product Wiring Result

Status: `COMPATIBILITY_PRODUCT_WIRING_READY`

## 1. Implemented Files

| File | Change | Reason |
|---|---|---|
| `src/App.tsx` | Added compatibility entry action, separate input/result path state, versioned history payload validation, duplicate-submit lock, localized calculation errors, and `popstate` restoration. Legacy `ResultRouteData` and `/result` validation remain in place. | Connect compatibility flow without changing the single-person result data contract. |
| `src/lib/product/prepareCompatibilityProductResult.ts` | Added product orchestration, fixed pair IDs, one shared reference time, explicit context forwarding, display-name routing, and direct locale renderer dispatch. | Keep C1–C5 out of UI and reuse the public compatibility API. |
| `src/components/compatibility/CompatibilityInput.tsx` | Added separate Person A/B forms with canonical BirthInput creation, date/time validation, unknown-time support, gender, country, birthplace search, correction mode, and optional relationship status. | Collect two independent existing BirthInput values. |
| `src/components/compatibility/CompatibilityResult.tsx` | Added customer DTO presentation for headline, returned sections, periods, and renderer-ordered timeline. | Display renderer output without semantic reconstruction. |
| `src/i18n/ja.ts`, `src/i18n/ko.ts`, `src/i18n/en.ts` | Added localized product labels, errors, and form status values only. | Localize product UI while leaving customer reading text to C6 renderers. |
| `src/style.css` | Added compatibility form/result layout, desktop two-column and narrow-screen single-column inputs, cards, focus, and button styles. | Keep the new route usable without redesigning existing screens. |
| `scripts/verify-compatibility-product-wiring-c8b.mjs` | Added locale orchestration, product DTO serialization, input immutability, and server-rendered input/result smoke checks. | Verify product wiring and all three locale output paths. |
| `src/docs/codex/compatibility-08b-product-wiring-result.md` | Added this result report. | Record C8-B implementation and verification. |

No Compatibility engine, Judgment, Event Timing, Outcome, renderer semantic, Master rule, or `BasicChartResult` code changed.

## 2. Product Flow

```text
FILUNE home → compatibility input at /compatibility
  → two canonical BirthInput objects
  → prepareCompatibilityProductResult
  → readBirthCompatibility once
  → FinalCompatibilityResult
  → selected KO / JA / EN renderer
  → compact locale customer DTO in history state
  → /compatibility/result
  → CompatibilityResult
```

The normal single-person path continues to use `prepareProductResult` and `/result` with the original `filuneResult` history key.

## 3. Compatibility Product Orchestration

```ts
prepareCompatibilityProductResult({
  first: { name?: string; birth: BirthInput },
  second: { name?: string; birth: BirthInput },
  locale: Locale,
  relationshipStatus?: 'single' | 'dating' | 'partnered' | 'married',
  referenceTime?: string,
})
```

- Uses `compatibility:first` and `compatibility:second`; names do not participate in engine identity.
- Resolves `referenceTime` once at orchestration entry when the caller omits it, then passes that same value through one `readBirthCompatibility` call.
- Passes `userContext.relationshipStatus` only when explicitly provided.
- Supplies names through renderer `userContext.displayNames`, keyed by execution ID, and leaves renderer validation intact.
- Selects `renderCompatibilityKo`, `renderCompatibilityJa`, or `renderCompatibilityEn` directly from `FinalCompatibilityResult`.
- Returns `{ kind, locale, referenceTime, final, customerResult }`. History stores the two inputs and customer DTO, not the full C5 graph.

Verifier result: all locales used the same fixed execution IDs and reference time; duplicate display names did not collide with identity; omitted relationship status remained omitted; BirthInput mutation count was 0.

## 4. Input UI

- Person A and Person B have separate name, date, time/unknown-time, gender, country, birthplace, and correction controls.
- Both create the existing `BirthInput` shape. Unknown time maps to `{ known: false }`; known time maps to `{ known: true, value: { hour, minute } }`.
- Existing Japan/Korea/US location search helpers are reused independently for each participant.
- Correction mode uses the existing `none` / `longitude` contract based on the explicit toggle and selected birthplace.
- Relationship status is optional. The control offers only current engine-supported values and sends `undefined` when left unspecified.
- Calendar date and known time are validated before submit. While calculating, submit is disabled and an in-flight ref prevents duplicate calls.
- Calculation failures display a localized `role="alert"` and keep the input route available. An unfavorable compatibility result remains a successful result.

## 5. Route / History

- Added `/compatibility/result`; the entry form lives at `/compatibility`. Both use the existing browser History API.
- Success pushes a separate `filuneCompatibilityResult` state containing `version`, `kind`, first/second input and optional name, optional relationship status, locale snapshot, reference time, and the locale customer DTO.
- The existing `filuneResult` shape is unchanged. Full `FinalCompatibilityResult` is not stored in history.
- `popstate` selects and restores `/result`, `/compatibility/result`, `/compatibility`, or the existing onboarding path. Returning from a compatibility result to the input keeps the in-memory two-person form state.
- A missing or malformed compatibility result state is replaced with `/`, matching the existing invalid `/result` fallback.
- A valid restored compatibility route uses its saved locale and customer DTO; it does not recalculate or reinterpret that DTO using a different current locale.

## 6. Result UI

`CompatibilityResult` accepts only the locale-specific customer DTO union. It displays a present headline, returned sections in their supplied order, supplied statement text, renderer-provided period labels, and timeline cards in renderer order. It does not sort, invent dates, parse keywords, display provenance IDs, or infer semantic meaning. It does not render omitted sections.

Server-render smoke checks rendered both the two-person input and result components for KO, JA, and EN. Each locale produced 5 populated sections and 6 timeline windows for the verifier fixture.

## 7. Locale

All three direct renderer paths passed:

```text
ko → renderCompatibilityKo → KO DTO
ja → renderCompatibilityJa → JA DTO
en → renderCompatibilityEn → EN DTO
```

No KO/JA text translation path exists. `customerResult` remains the renderer output, and the result page uses the stored locale snapshot.

## 8. Existing Product Regression

- `prepareProductResult` single-person preparation smoke: PASS; returned the existing pillars result without requesting a reading.
- Existing `/result` state key, `ResultRouteData`, and `BasicChartResult` were not changed.
- `npx tsc -b` and production build passed.
- No browser executable or browser automation dependency is configured in this workspace. Interactive browser back/forward and direct-route navigation were reviewed in `App.tsx` but were not exercised in a real browser; this is recorded as a test infrastructure gap below.

## 9. Compatibility Regression

All current C1–C7 compatibility verifiers passed:

```text
C1 Cross-chart facts: PASS
C2 Structural policy: PASS
C3 Personality interaction: PASS
C4B spouse-event disruption: PASS
C4 lifecycle/timing: PASS
C5 final assembly: PASS
C6-A Korean renderer: PASS
C6-A.1 Korean presentation: PASS
C6-B Japanese renderer/parity: PASS
C6-C English renderer/KO-JA-EN parity: PASS
C8-B product wiring / three locale component smoke: PASS
```

The existing renderer verifiers reported zero semantic, certainty, direction, or timing mismatches; zero certainty downgrade, terminology, numeric score, invented outcome, status inference, duplicate statement, and orphan statement violations.

## 10. Static Checks

```text
npx tsc -b: PASS
npm run build: PASS
git diff --check: PASS
```

Vite reported its existing advisory that some chunks exceed 500 kB; build completed successfully.

## 11. Remaining Gaps

| Class | Finding | Impact |
|---|---|---|
| `TEST_INFRA_GAP` | No browser automation or browser binary is configured, so actual click-through/history navigation was not exercised in a browser. Component server-render, product orchestration, route-state code review, all compatibility verifiers, typecheck, and build passed. | Add browser-level route/history coverage when the project adopts a browser test harness. No known implementation failure. |
| `IMPLEMENTATION_BUG` | None found. | — |
| `PRESENTATION_BUG` | None found. | — |
| `PRODUCT_POLICY_GAP` | None required for wiring. Free/paid exposure remains intentionally undecided and no gating was added. | Separate product policy can define exposure later. |

```text
Engine semantic changes: 0
New Saju rules: 0
```

## 12. Final Decision

```text
COMPATIBILITY_PRODUCT_WIRING_READY
```
