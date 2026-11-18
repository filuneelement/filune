import { contractHeader, producerReferenceSchema, validitySchema } from './common'
import { enumeration, id, literal, nonEmptyIds, object, optional, refine, uniqueIds } from './schema'
import type { Infer } from './schema'

export const roleFunctionStateSchema = refine(object({
  ...contractHeader, roleFunctionStateId: id, scopeId: id, entityId: id, roleStateRef: id, functionId: id,
  actionId: optional(id),
  functionType: enumeration(['yongshen', 'sangshen'] as const),
  phase: enumeration(['pre-effect', 'post-effect'] as const),
  status: enumeration(['active', 'weakened', 'stopped', 'deferred'] as const),
  relationRefs: uniqueIds, runtimeStateRefs: uniqueIds, effectRefs: uniqueIds, ruleIds: nonEmptyIds,
  evidenceIds: uniqueIds, provenance: object({ producerRef: producerReferenceSchema, ruleVersion: literal('A182') }),
  effectivePeriod: validitySchema, reasonCodes: nonEmptyIds,
}), (item) => item.ruleIds.includes('OP-P07') && (item.effectRefs.length === 0 || item.phase === 'post-effect' && item.status === 'weakened')
  && (item.status === 'deferred' || item.evidenceIds.length > 0 && item.runtimeStateRefs.length > 0
    && item.effectivePeriod.from.kind === 'exact' && item.effectivePeriod.to.kind === 'exact'),
'invalid role function phase or supporting evidence')

export type RoleFunctionState = Infer<typeof roleFunctionStateSchema>
