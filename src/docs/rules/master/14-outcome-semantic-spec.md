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
| OUT-HEALTH-01 · A I-16 and ⑲-A A/B/F | Natal reference | Known day stem and element. Apply the stem evidence limits in the Health contract. | Traditional element/body-area correspondence, with no inferred health condition. |
| OUT-HEALTH-02 · A I-16, B W-35 and ⑲-A C–F | Evaluated structural interval | Verified Health-specific path, target and lifecycle. Apply the Level 3 gate to timing. | Structural pressure and supported traditional reference, with bounded attention timing where qualified. |
| OUT-MONEY-01 · 02 용신론 and scope policy | Natal mechanism | Existing, effective Food God → Wealth production path in the supported context. Retain competition, interruption and direction from Judgment. | Contextual wealth-formation mechanism. |
| OUT-MONEY-02 · 07 사주풀이예시 and Master 04/06 | Natal mechanism | Documented Wealth pattern, weak support/capacity and relevant actual constraint; check evidenced routing, protection and relief. | Conditional retention constraint, distinct from inflow. If available facts cannot establish the condition, keep it deferred. |

The final two rows document the narrow source-backed candidates for input validation. They do not activate an income, asset, spending or loss projection. Health uses the contract below.

## Health source contract

Health Outcome Source Contract READY. The following semantics are candidates for implementation. Structural overall direction, favorable or unfavorable, supplies no Health result. Each Health fact requires its own evidence even when the structural axes agree.

| Level | Semantic | Source, condition, effect and limit |
|---|---|---|
| 1 | `traditional_body_correspondence` | Start with the Canonical day stem and its element. A I-16 supplies the approved customer correspondence table. ⑲-A A/B/F and R-43 document direct correspondence evidence for 甲 (head/nerves/skin), 丙 (eyes/cardiovascular), 戊 and 己 (shared Earth reference for stomach/digestion/flank/lower back), 辛 (lungs/teeth/joints and the CS-077 case details), and 癸 (kidney and gynecological reference). These are provenance for traditional reference only. Case-only areas and image-only additions do not replace or extend the approved A I-16 output. For 乙 Wood, 丁 Fire, 庚 Metal and 壬 Water use element-level introduction only. Do not inherit another stem's specific areas or create `weak_area` or `attention_area` from their day stem. Levels 2–3 have independent eligibility. |
| 2 | `structural_health_attention`, `health_pressure_condition` | ⑲-A B–F and B 7-2/W-35 support an identified path of pressure. Read the day stem, relevant YongShen/SangShen function, and the source and target of the actual or explicitly conditional pressure. An established harmful path supports structural attention. A conditional pressure can be described with its trigger and certainty, without a current attention claim. Apply the specific paths below. |
| 3 | `health_attention_period` | ⑲-A C–F (CS-014/026/034/071 and repeated Killing cases) supports a bounded interval where scoped Judgment substantiates the same Health-specific pressure path. For a month, require affirmative local evidence of recurrence or activation and independent support for any named target and traditional area under W-35. With conditional evidence, omit the area and keep any wording at B's conditional rhythm level. Missing inputs defer timing. The interval expresses attention to a traditional structural condition. |
| 4 | `PROHIBITED` | A I-16, B W-30–35 and D Q10 prohibit clinical or event outputs. No diagnosis (including mental-health diagnoses), symptom inference, disease naming/prediction, onset confirmation or timing, lifespan, death, accident or surgery prediction, tests or hospital decisions, treatment, medication, medical constitution, dietary or other wellness prescriptions from the chart, medical risk scores, Health scores or best/worst Health months. Do not create outcome types for these outputs. |

### Eligible structural paths

- **YongShen pressure.** ⑲-A B/C/D/F, CS-026 (甲 Food God; retrospective) and CS-071 (Fire Resource; source interpretation), connect the actually damaged YongShen's element to traditional reference. Require the scoped OP-P06/P07 result that a valid adverse control reaches the relevant function and remains material after protection or routing. Preserve `weaken`/`reduced`; stopping requires a separate upstream finding. Reference the affected element via A I-16. A case event, elemental conflict, or role label alone cannot produce an area or period.
- **SangShen pressure.** A OP-P06/P07, B W-35, C CS-005 and ⑲-A F support the structural target when a current, Health-relevant support path is actually impaired and independently evidenced. Use its verified target for traditional reference only. SangShen status alone cannot establish an area of weakness. The applied CS-005 examples in ⑲-A E cannot establish Health damage from conjunction.
- **Harmful Killing activation.** ⑲-A C/D/F (CS-014, 010, 039, 088, 110, 123 and related cases) supports attention where Judgment confirms a currently effective harmful Seven Killing path. This includes Wealth generating Killing, a strengthened structural 病 through renewed Killing, or Formation establishing the harmful path (CS-103/110/123). Require actual source and target, PatternContext, CurrentFunction, Runtime and ActualStructuralFunction, including Root/Formation proof where required by Judgment. Master 01/06 governs needed Killing in the Yang Blade context and PP-503 governs Wealth interfering with actual control versus production and control coexisting. Presence, a formation label, or a favorable/required path supplies no caution. Preserve reduced function and actual protection.
- **Limits of extrapolation.** YongShen conjunction, independent root weakness/removal, generic strengthening or resolution of 病, standalone Food God reduction and unsupported chart markers remain outside the subset. 水剋火 may evidence a verified adverse path as in CS-034/071. Generic elemental lack, surplus or control, clash-to-body damage, all punishment, and automatic health inference from 조후 are excluded. CS-031's 丑戌未 삼형 is case-level corroboration only. Seasonal transition (CS-034/R-43) and combined Daewoon/Sewoon directional concentration (CS-031) can be contextual provenance for an otherwise qualified path. Neither supplies a trigger. Stress language may describe traditional structural pressure only.

### Scope, lifecycle and fact reuse

Read Natal → Daewoon → Sewoon → Month as a sequence of existing Judgment results. Keep the natal basis and the scope where each condition arose distinct. Do not recalculate Pattern, roles, Luck, relations or formation. Under OP-L01 the ordinary Month comparison reads natal, annual and monthly direct participants. Read only eligible upstream state and already judged effects under OP-L02 and the applicable upstream Formation rules. OP-P03 requires evidence within the requested scope. A repeated element or an upper-scope case cannot fill a missing lower-scope result.

Retain original source IDs, scope, interval, axis, direction and certainty, with explicit links to independently evaluated recurrence or activation. RoleHistory supplies attribution only. Stopped, inactive and expired pressure cannot sustain an active fact. Reduced pressure retains its reduced state. A conditional path requires confirmed activation for a current attention claim. For the same identified pressure pathway, verified cessation may be recorded as a lifecycle change, including whether the causal effect expired or stopped. Missing evidence, GuEung alone or an unrelated favorable effect cannot establish cessation. `health_relief_period` and claims of recovery or improvement remain deferred or excluded respectively.

Reuse the same Health OutcomeFact ID and provenance for the same condition and effective interval across CH-7/8/9/10. A distinct interval with independently evaluated activation can reference the originating condition while preserving its own interval and evidence. Reading Assembly applies B-6 repetition and D Q10/Q13 consistency checks. No chapter-specific monthly Health calculation.

Preserve source categories in provenance: A I-16 approved traditional correspondence, R-43 references as recorded in ⑲-A, direct case ID and stated scope, traditional image table (bibliographic source unknown), analyst inference, and FILUNE decision. Retrospective and applied cases may contextualize a rule. They supply no customer event forecast. G's proposed literature and draft applications supply no additional v1 rule.

[⑲-A Health evidence](../../source/health/FILUNE-19A-premium-health-evidence.md) · [Health supplement audit](../../codex/p4d-health-outcome-supplement-audit-result.md)

## Exclusions and deferred gates

- Work: work style, organization versus independent work, outcome of performance conditions, current work direction, occupation suggestions and timing all require a source-backed relevance contract. Repeated explanations in 07 remain inference.
- Money: actual income, assets, protection inferred from Resource, contracts, business, spending, collaboration, and selection of principles remain deferred. Investment and borrowing instructions are excluded.
- Relationship: relationship style and guaranteed partner quality, marriage/divorce and compatibility are excluded from these projections. I-22 forms ③ and ④ remain deferred. Form ④ requires the approved favorable judgment of the same period and verified absence of damage to both the partner significator and SangShen. A missing check cannot satisfy this condition.
- Health: generalized timing and a separate relief-period semantic remain deferred. See the Health source contract for supported timing and prohibited outputs.
- Duplicates cannot count as independent evidence. This contract makes no top-three, best/worst month, question routing, or ranking decisions.

## Scope, certainty and conflicts

Use OP-L01/L02 for direct comparisons, inheritance and expiry. A higher-scope case cannot supply a missing monthly rule. Preserve separate stem and branch results per OP-L03 and I-14 evidence bookkeeping. No merged rating or conversion of opposite axes into a domain outcome has been approved. Lower certainty survives assembly and rendering.

Use RoleHistory for attribution. Use CurrentFunction and ActualStructuralFunction for operation in the specified interval. Preserve reduced and conditional states; stopped and inactive do not contribute as active effects. Preserve the applicable pattern-specific policy for Wealth restraining Resource or generating Seven Killings. Expired effects remain historical. When the authority or upstream result cannot establish a prerequisite, do not emit an active outcome.

[Audit and evidence register](../../codex/p4d-outcome-semantic-source-audit-result.md) · [A rev182](../../source/authority/A_rev182.md) · [B rev38](../../source/authority/B_rev38.md) · [Assembly specification](./13-reading-assembly-spec.md)
