# Judgment contract layer

Six versioned contracts, with strict JSON schemas and a pure in-memory bundle validator.
This layer imports no calculator, rule evaluator, table data, UI, review policy, persistence,
clock, or case expectations. Canonical and existing judgment APIs are unchanged.

| Contract | Responsibility |
| --- | --- |
| `HiddenStemSystemContract` | System identity, semantic/display order, entry references and legacy compatibility claims. No table supplied. |
| `RelationFactContract` | Relation observations, participant/direction/scope references and coverage declarations. No strength, role or judgment. |
| `RuntimeStateContract` | Function (`active/weakened/stopped/unknown`), provenance (`local/inherited`) and transition (including `restored`) on separate axes. |
| `LuckCarryStateContract` | Original natal changes, scoped consumption, source validity, six snapshot compartments, and historical processing records. |
| `EvidenceContextContract` | Six source variants, claim-specific verification, revision, optional digest and runtime/reference usage. |
| `RoleStateContract` | Referenced assertions or application-backed results. Does not assign roles. Document assertions are reference-only. |

Use each `...Schema.parse(unknown)` for detached shape validation, or `.is(unknown)` for
an acceptance check. Both reject extra fields. Use `validateContractBundle` for complete
in-memory reference validation: unique IDs, correct participant kinds, allowed stage scopes,
coverage-backed absence, evidence isolation/cycles, original-state inheritance, validity,
consumption deduplication, and state predecessor cycles. Individual schemas alone cannot
resolve foreign IDs. `ContractValidationError` carries a path and explanation.

The `purpose: runtime-input` bundle cannot consume regression/audit evidence or document
role assertions. A `reference-only` bundle may hold them. Regression records may be stored
in a runtime bundle's evidence catalog but cannot be reached by its runtime consumers,
including through verification dependencies.

No verifier can prove a producer's claim from metadata alone. Distinct producer IDs and a
written independence basis do not establish actual computational independence. A confirmed
claim requires declared verification evidence; source existence, revision or hash alone is
not confirmation. Partial/unknown inputs remain representable; schema acceptance does not
mean the data is ready for an evaluator or approved for publication.

Time intervals are half-open. Exact UTC boundaries are compared for consistency only;
uncertain carry/restoration boundaries require uncertainty IDs rather than invented dates.
No solar terms, periods, relationships, roles, scores or strength thresholds are calculated.
`restored` requires an expiry claim and reassessment application, not a repeated stem arrival.
This validator checks that claim's structure/timing, not its astrological truth or absence of
other constraints. IR-01 processing records are historical references and never make an
upper luck entity a direct monthly participant or carry its functional weakening downward.

Supply of document-compatible hidden stems, relationship/coverage producers, birth and
independent calculation provenance, role-result generation and execution/orchestration
ownership remain external. No `OperatorReview` or publication status mapping is included.

Validation and type tests (synthetic contract records, no CS fixtures):

```
npm run verify:judgment-contract-layer
npx tsc -b
```

Runtime tests do not call producers/evaluators or persist state. The negative TypeScript
checks ensure provenance/transition cannot be used as function status and incomplete or
non-contract fields are rejected by the types. Cross-field invariants are runtime schema
checks; these inferred types are intentionally not a claim of compile-time semantic proof.

Carry identity is scoped to the destination and follows the original state/provenance,
not a caller's `changeId`. Inherited and unchanged aliases follow their predecessor;
copying a state with the same causal applications is the same event. A new transition
backed by a distinct application remains a separate event even with the same ancestor.
The same original change can still be inherited once in each distinct lower-stage scope.

Every relation participant, including an unknown observation, must belong to the linked
coverage universe. Relation/coverage producers are compared by ID, version, source and
order-independent input fact set. Different producers require `producerHandoffRefs` into
`EvidenceContextContract.producerHandoffs`. Each handoff binds a coverage or calculation
evidence source to a particular relation/coverage target and scope, with matching producer
endpoints and provenance evidence. A catalog record alone without a consumer reference
does not authorize mixing. Calculation evidence reached through verification or independent
cross-check references is subject to the same producer check. This records a declared
transfer; it does not compute coverage, execute a producer or prove a transfer's truth.
