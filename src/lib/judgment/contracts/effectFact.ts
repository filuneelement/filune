import { contractHeader, producerReferenceSchema, validitySchema } from './common'
import { enumeration, id, literal, nonEmptyIds, object, positiveInteger, refine, uniqueIds } from './schema'
import type { Infer } from './schema'

export const effectFactSchema = refine(object({
  ...contractHeader, effectId: id, scopeId: id,
  sourceEntityId: id, targetEntityId: id, targetFunctionId: id,
  relationFactId: id, effectType: literal('weaken'),
  runtimeStateRefs: uniqueIds, roleStateRefs: uniqueIds,
  ruleIds: nonEmptyIds, evidenceIds: uniqueIds,
  provenance: object({ producerRef: producerReferenceSchema, ruleRevision: positiveInteger }),
  coverage: enumeration(['complete', 'partial'] as const),
  effectivePeriod: validitySchema, reasonCodes: uniqueIds,
  status: enumeration(['confirmed', 'deferred'] as const),
}), (fact) => fact.sourceEntityId !== fact.targetEntityId && fact.ruleIds.includes('OP-P06')
  && (fact.status === 'confirmed'
    ? fact.coverage === 'complete' && fact.runtimeStateRefs.length === 2 && fact.evidenceIds.length > 0
      && fact.effectivePeriod.from.kind === 'exact' && fact.effectivePeriod.to.kind === 'exact' && !fact.reasonCodes.length
    : fact.coverage === 'partial' && fact.reasonCodes.length > 0),
'inconsistent OP-P06 effect status or evidence')

export type EffectFact = Infer<typeof effectFactSchema>
