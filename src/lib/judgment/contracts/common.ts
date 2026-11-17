import { array, enumeration, id, literal, object, optional, positiveInteger, refine, text, union, uniqueIds } from './schema'
import type { Infer } from './schema'

export const FACT_STATUSES = ['confirmed', 'provisional', 'unknown', 'unsupported'] as const
export const factStatusSchema = enumeration(FACT_STATUSES)
export const stageSchema = enumeration(['natal', 'great', 'year', 'month'] as const)
export const stemSchema = enumeration(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const)
export const branchSchema = enumeration(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const)
/** UTC only; roundtrip rejects normalized invalid dates. No clock is read. */
export const instantSchema = refine(text, (value) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false
  const time = Date.parse(value)
  return Number.isFinite(time) && new Date(time).toISOString() === value
}, 'expected valid UTC ISO instant with milliseconds')
export const boundarySchema = union(
  object({ kind: literal('exact'), instant: instantSchema }),
  refine(object({ kind: literal('range'), earliest: instantSchema, latest: instantSchema }),
    (value) => value.earliest <= value.latest, 'boundary range is reversed'),
  object({ kind: literal('unknown'), reason: id }),
)
function bounds(value: Infer<typeof boundarySchema>): [string, string] | null {
  return value.kind === 'unknown' ? null : value.kind === 'exact'
    ? [value.instant, value.instant] : [value.earliest, value.latest]
}
export const validitySchema = refine(object({ periodId: id, from: boundarySchema, to: boundarySchema }),
  (value) => {
    const from = bounds(value.from), to = bounds(value.to)
    return !from || !to || from[0] < to[1]
  }, 'validity has no possible non-empty [from,to) interval')
export type Validity = Infer<typeof validitySchema>
export const documentReferenceSchema = object({
  documentId: id, documentRevision: positiveInteger, path: id, section: id, location: id,
})
export const applicationReferenceSchema = object({
  applicationId: id, executionId: id, scopeId: id, ruleId: id, ruleVersion: id,
})
export type ApplicationReference = Infer<typeof applicationReferenceSchema>
export const applicationReferencesSchema = refine(array(applicationReferenceSchema), (items) =>
  new Set(items.map((item) => item.applicationId)).size === items.length, 'duplicate application identifiers')
export const entityReferenceSchema = refine(object({
  entityId: id, origin: stageSchema, part: enumeration(['stem', 'branch'] as const), canonicalFactRef: id,
  position: optional(enumeration(['year', 'month', 'day', 'time'] as const)), periodRef: optional(id),
}), (value) => value.origin === 'natal'
  ? value.position !== undefined && value.periodRef === undefined
  : value.position === undefined && value.periodRef !== undefined,
'natal entity requires only position; luck entity requires only periodRef')
export type EntityReference = Infer<typeof entityReferenceSchema>
export const scopeReferenceSchema = object({
  scopeId: id, stage: stageSchema, targetPeriodRef: id, directEntityIds: uniqueIds,
  inheritedChangeIds: uniqueIds, priorProcessingRefs: uniqueIds, evidenceIds: uniqueIds,
  scopeApprovalApplicationRef: union(applicationReferenceSchema, literal(null)),
})
export type ScopeReference = Infer<typeof scopeReferenceSchema>
export const producerReferenceSchema = object({ producerId: id, version: id, sourceRef: id, inputFactIds: uniqueIds })
export const contractHeader = { contractVersion: literal('1') }
export const ruleExecutionStatusSchema = enumeration(['applied', 'not-applicable', 'deferred', 'unsupported', 'error'] as const)
