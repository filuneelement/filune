import { applicationReferencesSchema, contractHeader, validitySchema } from './common'
import { enumeration, id, literal, nonEmptyIds, object, optional, refine, union, uniqueIds } from './schema'
import type { Infer } from './schema'

/** Function, provenance and transition are deliberately separate axes. */
export const runtimeStateSchema = refine(object({
  ...contractHeader, stateId: id, targetEntityId: id, scopeId: id,
  functionalState: enumeration(['active', 'weakened', 'stopped', 'unknown'] as const),
  originMode: enumeration(['local', 'inherited'] as const),
  transition: enumeration(['established', 'unchanged', 'restored', 'unresolved'] as const),
  priorStateRef: optional(id), inheritedFromStateRef: optional(id),
  causingApplicationRefs: applicationReferencesSchema, evidenceIds: nonEmptyIds, uncertaintyIds: uniqueIds,
  validity: validitySchema,
  weakeningDescription: optional(object({ wording: id, ruleId: id })),
  restorationBasis: optional(object({ kind: literal('constraint-expired'), expiredStateRefs: nonEmptyIds,
    reassessmentApplicationRef: id })),
  supersedesStateRef: optional(id),
}), (value) => {
  const known = value.functionalState !== 'unknown'
  return (known ? value.causingApplicationRefs.length > 0 && value.transition !== 'unresolved'
    : value.transition === 'unresolved' && value.uncertaintyIds.length > 0)
    && (value.originMode === 'inherited' ? value.inheritedFromStateRef !== undefined
      : value.inheritedFromStateRef === undefined)
    && (value.functionalState === 'weakened' ? value.weakeningDescription !== undefined
      && value.causingApplicationRefs.some((app) => app.ruleId === value.weakeningDescription?.ruleId)
      : value.weakeningDescription === undefined)
    && (value.transition === 'established' || value.transition === 'unresolved' || value.priorStateRef !== undefined)
    && (value.transition === 'restored' ? value.restorationBasis !== undefined
      && value.causingApplicationRefs.some((app) => app.applicationId === value.restorationBasis?.reassessmentApplicationRef)
      : value.restorationBasis === undefined)
}, 'invalid function/provenance/transition combination or missing supporting application')
export type RuntimeStateContract = Infer<typeof runtimeStateSchema>

/** Export the null variant for consumers that store explicitly absent state references. */
export const nullableRuntimeStateSchema = union(runtimeStateSchema, literal(null))
