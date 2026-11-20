# P4-K.2A Health Month Window Identity / Provenance Fix

**Final: `READY_TO_RERUN_P4K2`**

The unchanged P4-K.2 reproduction now reports missing 0, duplicate 0, ID mismatch 0, source identity mismatch 0, provenance mismatch 0, and origin scope mismatch 0. The natal-origin month fact remains `originScope = natal`; its evaluated scope remains `month` for CH-10 timing placement.

## Before

Fixture: the P4-K.2 P1-Fix E Judgment path, evaluated once as the full chain and once with the same month independently regenerated using the monthly-window execution convention.

```text
full chain:
  origin scope: natal
  ID: health:["health_attention_period", <p4k2 monthly scope ID>, <health-condition ID>]
  provenance: natal-origin relation plus current-month Judgment evidence

monthly window:
  origin scope: month (incorrect fallback)
  ID: health:["health_attention_period", <monthly-window-run scope ID>, <same health-condition ID>]
  provenance: equivalent evidence with monthly-window-run IDs
```

The two records had the same semantic type, life meanings, effective period, certainty (`confirmed`) and lifecycle, but different Judgment scope IDs in the fact ID, source arrays and provenance. The independently regenerated natal relation also had a different relation ID, so its exact lookup missed and the month evaluation scope was left as the origin.

## After

```text
full chain:
  origin scope: natal
  ID: health:["health_attention_period", <p4k2 monthly scope ID>, <health-condition ID>]
  sourceJudgmentIds: [<p4k2 monthly scope ID>]
  originRelationId: <p4k2 natal control relation: hurt → officer>
  originScopeId: <p4k2 natal scope ID>
  certainty: confirmed
  provenance: exact source array retained

monthly window:
  origin scope: natal
  ID: same as full chain
  sourceJudgmentIds: same as full chain
  originRelationId: same p4k2 natal control relation: hurt → officer
  originScopeId: same p4k2 natal scope ID
  certainty: confirmed
  provenance: exact same source array
```

The re-run compared the complete facts. Its parity counters were:

| Check | Result |
|---|---:|
| Missing / duplicate | 0 / 0 |
| Stable ID mismatch | 0 |
| Source judgment/relation identity mismatch | 0 |
| Provenance mismatch | 0 |
| Origin scope / origin scope ID mismatch | 0 |
| Semantic / certainty mismatch | 0 |

The stable IDs are the actual root-run Judgment IDs. No synthetic source IDs are introduced. The fact keeps `scope = month` and its monthly period so Reading can place it in CH-10; its origin remains natal.

## Root cause and fix

Root cause was in `src/lib/outcome/health/healthOutcome.ts`:

- `structural()` built an Outcome ID using the evaluated `snapshot.id` and retained that execution's raw IDs in source/provenance references.
- `buildHealthOutcome()` resolved `originRelationId` only by exact ID in `originScopes`. The isolated monthly evaluation uses a different execution ID and natal inspection interval, so the equivalent natal relation was not found and `originScope` stayed at its evaluation-scope fallback.
- The monthly adapter already supplies the parent Judgment projection. The Outcome layer now uses that parent's execution identity to rebase only independently evaluated scope references when the supplied parent proves they belong to the outer natal run. A regular production monthly-window run keeps its own actual Judgment references.
- When an independently regenerated origin relation has no exact match, its upstream relation coordinates (action, source entity, target entity) are matched to the natal Judgment relation. The fact then retains the real natal relation and scope IDs as provenance.

No Judgment evaluator or rule semantics, Master 14, Relationship, Money, Work, Personality, or Compatibility code was changed in this fix. Health meaning, certainty, lifecycle, and period evaluation were preserved.

## Scope and lifecycle checks

| Check | Result |
|---|---|
| CH-10 placement of natal-origin fact | PASS; placement does not change fact origin |
| Same month full-chain vs independent window | PASS; exact identity and provenance |
| Repeated run and reversed upstream arrays | PASS; deterministic, order-independent |
| Expiry and current leakage | PASS; expired fact is not assembled |
| Reactivation regression | PASS; P4-G.1 |
| Missing / duplicate facts | 0 / 0 |
| Month-origin positive Health fixture | `NOT_TESTABLE_WITH_CURRENT_FIXTURE`; no qualifying fixture found |
| Same natal-origin positive fact across multiple active months | `NOT_TESTABLE_WITH_CURRENT_FIXTURE`; available 12-month CS-005 fixture has no positive monthly Health fact |
| Free month leakage | 0 |
| Judgment / Personality / Luck mutation | 0 |

P4-K.2's existing Relationship contact, change, formation and pressure checks passed unchanged. Commitment and mixed-positive fixture availability remains as recorded in P4-K.2.

## Regression and build

| Verification | Result |
|---|---|
| Judgment regression suite | PASS · 35/35 existing commands; P1 closure 13/13 scenarios |
| P2-A–G | PASS |
| P3-A–F | PASS |
| P4-B / P4-C | PASS |
| P4-E / P4-F | PASS · `RELATIONSHIP_OUTCOME_BATCH1_COMPLETE` |
| P4-G / P4-G.1 / P4-H | PASS · `HEALTH_OUTCOME_BATCH1_COMPLETE` |
| P4-I | PASS · existing `MONEY_OUTCOME_BATCH1_COMPLETE` verifier |
| P4-K.1 | PASS |
| Unchanged P4-K.2 fixture | PASS |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

The existing `src/lib/judgment/` remains unchanged by P4-K.2A. P4-J's upstream Judgment boundary regression is outside this task and remains untouched.

## Files

- Implementation: `src/lib/outcome/health/healthOutcome.ts`
- Verification wrapper: `scripts/verify-health-month-window-identity-p4k2a.mjs`
- Unchanged source fixture: `scripts/verify-health-relationship-reaudit-p4k2.mjs`
