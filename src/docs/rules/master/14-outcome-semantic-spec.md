# FILUNE Outcome Semantic Spec

Status: audited subset, implementation deferred. Authority: A rev182, 25-7 rev16, and the source record in P4-D. B rev38 supplies publication constraints. The audit IDs identify evidence rows and do not constitute a runtime rule registry.

## Boundary

Outcome consumes the existing Canonical and scoped Judgment results as read-only input. An outcome record points to its source judgment, relation/participant, role and effect IDs where applicable. Each record carries the original scope and effective interval, evidence classification, and certainty. A domain label requires its own source-backed connection. Structural effects retain their original axis, direction, role state and function.

Reading Assembly handles chapter placement. Locale Renderer handles wording. Outcome records contain neither chapter IDs nor localized text. Customer-provided facts may resolve known context within an approved rule; they do not revise structural judgment.

## Supported subsets

| Evidence | Scope | Prerequisite | Allowed semantic content |
|---|---|---|---|
| OUT-REL-01 · A I-15 | Natal | Known day branch or supported relative-role assignment. Significator rules requiring an applicability input require a known value. | Partner palace; A I-15 significators. Classification may be confirmed if the input is certain. |
| OUT-REL-02 · A I-22, OP-R01/R03 | Valid evaluated luck interval | Effective relation to the natal day branch, verified participants and scope. Keep the identity of conjunction or clash. Preserve ambiguity if contact and change cannot be distinguished. | Conditional contact/change signal. Conflicts and limitations remain as structural evidence. |
| OUT-HEALTH-01 · A I-16 | Natal reference | Known element of the day stem or supported SangShen target. | Traditional element/body-area correspondence, with no inferred health condition. |
| OUT-HEALTH-02 · A I-16 and B W-35 | Evaluated structural interval | Actual pressure or instability of an identified target. A month-level body-area reference requires support for the target and affirmative period evidence. Conditional evidence omits the body area. | Reference to a structural pressure and its traditional correspondence; no inferred health event or monthly health assessment. |
| OUT-MONEY-01 · 02 용신론 and scope policy | Natal mechanism | Existing, effective Food God → Wealth production path in the supported context. Retain competition, interruption and direction from Judgment. | Contextual wealth-formation mechanism. |
| OUT-MONEY-02 · 07 사주풀이예시 and Master 04/06 | Natal mechanism | Documented Wealth pattern, weak support/capacity and relevant actual constraint; check evidenced routing, protection and relief. | Conditional retention constraint, distinct from inflow. If available facts cannot establish the condition, keep it deferred. |

The final two rows document the narrow source-backed candidates for input validation. They do not activate an income, asset, spending or loss projection. The health correspondence table is the one in A I-16. It is reference metadata and does not describe a person's physiology.

## Exclusions and deferred gates

- Work: work style, organization versus independent work, outcome of performance conditions, current work direction, occupation suggestions and timing all require a source-backed relevance contract. Repeated explanations in 07 remain inference.
- Money: actual income, assets, protection inferred from Resource, contracts, business, spending, collaboration, and selection of principles remain deferred. Investment and borrowing instructions are excluded.
- Relationship: relationship style and guaranteed partner quality, marriage/divorce and compatibility are excluded from these projections. I-22 forms ③ and ④ remain deferred. Form ④ requires the approved favorable judgment of the same period and verified absence of damage to both the partner significator and SangShen. A missing check cannot satisfy this condition.
- Health: complete attention/relief timing remains deferred. Structural relief applies only to the same identified pathway. Disease, symptom, lifespan and accident predictions, diagnosis and medical/lifestyle recommendations derived from these correspondences are prohibited.
- Duplicates cannot count as independent evidence. This contract makes no top-three, best/worst month, question routing, or ranking decisions.

## Scope, certainty and conflicts

Use OP-L01/L02 for direct comparisons, inheritance and expiry. A higher-scope case cannot supply a missing monthly rule. Preserve separate stem and branch results per OP-L03 and I-14 evidence bookkeeping. No merged rating or conversion of opposite axes into a domain outcome has been approved. Lower certainty survives assembly and rendering.

Use RoleHistory for attribution. Use CurrentFunction and ActualStructuralFunction for operation in the specified interval. Preserve reduced and conditional states; stopped and inactive do not contribute as active effects. Preserve the applicable pattern-specific policy for Wealth restraining Resource or generating Seven Killings. Expired effects remain historical. When the authority or upstream result cannot establish a prerequisite, do not emit an active outcome.

[Audit and evidence register](../../codex/p4d-outcome-semantic-source-audit-result.md) · [A rev182](../../source/authority/A_rev182.md) · [B rev38](../../source/authority/B_rev38.md) · [Assembly specification](./13-reading-assembly-spec.md)
