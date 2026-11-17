import { branchSchema, contractHeader, factStatusSchema, stemSchema } from './common'
import { array, enumeration, id, literal, nonEmptyIds, object, optional, refine, uniqueIds } from './schema'
import type { Infer } from './schema'

const roles = enumeration(['main', 'middle', 'residual'] as const)
const sourceOrder = refine(array(roles), (items) => items.length === 3 && new Set(items).size === 3,
  'display order must contain each role exactly once')
const semanticOrder = refine(array(roles), (items) => items.join(',') === 'main,middle,residual',
  'semantic order must be main,middle,residual')
/** Metadata only. Does not supply or repair any hidden-stem table. */
export const hiddenStemSystemSchema = refine(object({
  ...contractHeader, systemId: id, systemName: id, systemVersion: id,
  usage: enumeration(['default-judgment', 'separate-reference'] as const),
  semanticRoles: object({ main: literal('본기'), middle: literal('중기'), residual: literal('여기') }),
  semanticOrder, sourceDisplayOrder: sourceOrder, entriesRef: id, sourceRefs: nonEmptyIds,
  compatibility: object({ legacyTableRef: id,
    status: enumeration(['verified', 'mismatch', 'not-checked'] as const), comparisonEvidenceIds: uniqueIds }),
  assessment: factStatusSchema, uncertaintyIds: uniqueIds,
}), (value) => (value.usage !== 'default-judgment' || value.systemName === '본기·중기·여기 체계')
  && (value.compatibility.status === 'not-checked' || value.compatibility.comparisonEvidenceIds.length > 0),
'default system must use the documented name; completed compatibility comparison requires evidence')
export type HiddenStemSystemContract = Infer<typeof hiddenStemSystemSchema>
export const hiddenStemEntrySchema = refine(object({
  systemId: id, branch: branchSchema,
  completeness: enumeration(['complete', 'partial', 'unknown'] as const),
  roles: object({ main: optional(stemSchema), middle: optional(stemSchema), residual: optional(stemSchema) }),
  evidenceIds: nonEmptyIds, uncertaintyIds: uniqueIds,
}), (value) => {
  const stems = Object.values(value.roles)
  return new Set(stems).size === stems.length
    && (value.completeness !== 'complete' || value.roles.main !== undefined)
    && (value.completeness !== 'unknown' || stems.length === 0)
}, 'complete entry requires main; unknown entry has no asserted roles; stems cannot repeat')
export type HiddenStemEntry = Infer<typeof hiddenStemEntrySchema>
