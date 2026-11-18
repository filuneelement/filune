import type { ByeongJudgmentResult } from '../evaluators/byeongJudgment/types'
import { applicationReferencesSchema, contractHeader, instantSchema, producerReferenceSchema } from './common'
import { evidenceContextSchema } from './evidenceContext'
import { roleStateSchema } from './roleState'
import { nullableRuntimeStateSchema } from './runtimeState'
import { array, enumeration, id, literal, nonEmptyIds, object, optional, refine, union, uniqueIds } from './schema'
import type { Infer, Schema } from './schema'

export const guEungStatusSchema = enumeration(['not-applicable', 'deferred', 'no-gu-eung', 'confirmed'] as const)
export type GuEungStatus = Infer<typeof guEungStatusSchema>

const provenanceSchema = object({ producerRef: producerReferenceSchema, ruleVersion: id })
const byeongRuleSchema = enumeration(['I-03', 'I-04-2', 'I-04a', 'I-04c'] as const)
const damageTraceSchema = object({
  pathId: id, outcome: enumeration(['damage', 'excluded', 'deferred', 'stopped'] as const),
  relationFactId: optional(id), evidenceIds: uniqueIds,
})
const byeongJudgmentSchema = refine(object({
  judgmentId: id, candidateId: id, entityId: id, protectedEntityId: union(id, literal(null)),
  status: enumeration(['confirmed', 'rejected', 'deferred'] as const),
  runtimeState: nullableRuntimeStateSchema, natalRoleHistory: array(roleStateSchema), currentRoleRef: union(id, literal(null)),
  ruleIds: array(byeongRuleSchema), factIds: uniqueIds, relationCoverageRefs: uniqueIds,
  evidenceIds: uniqueIds, reasonCodes: uniqueIds, trace: array(damageTraceSchema),
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: enumeration(['A179', 'A180-draft'] as const) }),
}), (value) => uniqueBy(value.trace, (item) => item.pathId), 'duplicate damage path IDs within a 병 judgment')

const byeongResultSchema: Schema<ByeongJudgmentResult> = refine(object({
  scopeId: id, status: enumeration(['has-byeong', 'no-byeong', 'deferred'] as const),
  judgments: array(byeongJudgmentSchema), roleStates: array(roleStateSchema), applications: applicationReferencesSchema,
  removalEvidence: array(object({
    entityId: id, ruleId: enumeration(['I-04a', 'I-04c'] as const), priorRoleIds: uniqueIds, stateId: id, evidenceIds: uniqueIds,
  })),
  otherDamageAssessment: literal('unassessed'), reasonCodes: uniqueIds,
}), (value) => uniqueBy(value.judgments, (item) => item.judgmentId)
  && uniqueBy(value.roleStates, (item) => item.roleStateId), 'duplicate 병 judgment or role IDs')

export const guEungInputSchema = object({
  ...contractHeader, scopeId: id, referenceTime: instantSchema, byeong: byeongResultSchema, evidence: evidenceContextSchema,
})
export type GuEungInput = Infer<typeof guEungInputSchema>

export const guEungCandidateSchema = object({
  candidateId: id, entityId: id, scopeId: id, runtimeState: nullableRuntimeStateSchema,
  evidenceIds: uniqueIds, provenance: provenanceSchema,
})
export type GuEungCandidate = Infer<typeof guEungCandidateSchema>

export const guEungEffectLinkSchema = object({
  effectPathId: id, candidateId: id, byeongJudgmentId: id, damagePathId: id, scopeId: id,
  relationFactIds: uniqueIds, evidenceIds: uniqueIds, effectFactRef: optional(id),
})
export type GuEungEffectLink = Infer<typeof guEungEffectLinkSchema>

const guEungDamagePathSchema = object({
  byeongJudgmentId: id, damagePathId: id, byeongEntityId: id, protectedEntityId: id,
  roleStateRef: id, runtimeStateRef: id, relationFactId: optional(id), evidenceIds: nonEmptyIds,
  provenance: provenanceSchema,
})
export type GuEungDamagePath = Infer<typeof guEungDamagePathSchema>

const pathKey = (item: { byeongJudgmentId: string; damagePathId: string }) => JSON.stringify([item.byeongJudgmentId, item.damagePathId])
function uniqueBy<T>(items: readonly T[], key: (item: T) => string): boolean {
  return new Set(items.map(key)).size === items.length
}

/** The result vocabulary reserves positive and complete-negative states for a future evaluator.
 * Version 1 can only acknowledge absence of 병 or defer. Links describe investigation, not effects.
 */
export const guEungJudgmentDataSchema = object({
  ...contractHeader, scopeId: id, status: guEungStatusSchema,
  damagePaths: array(guEungDamagePathSchema), candidates: array(guEungCandidateSchema),
  effectLinks: array(guEungEffectLinkSchema), coverage: enumeration(['unknown', 'partial', 'complete'] as const),
  reasonCodes: uniqueIds, roleStates: array(roleStateSchema), applications: applicationReferencesSchema,
})
export const guEungJudgmentSchema = refine(guEungJudgmentDataSchema, (value) => {
  if (value.status === 'confirmed' || value.status === 'no-gu-eung' || value.roleStates.length || value.applications.length) return false
  if ((value.status === 'not-applicable' || !value.damagePaths.length) && (value.candidates.length || value.effectLinks.length)) return false
  if (value.status === 'not-applicable' && value.damagePaths.length) return false
  const paths = new Set(value.damagePaths.map(pathKey))
  const candidates = new Map(value.candidates.map((candidate) => [candidate.candidateId, candidate]))
  return paths.size === value.damagePaths.length && candidates.size === value.candidates.length
    && uniqueBy(value.effectLinks, (link) => link.effectPathId)
    && uniqueBy(value.effectLinks, (link) => JSON.stringify([link.candidateId, pathKey(link), [...link.relationFactIds].sort()]))
    && value.candidates.every((candidate) => candidate.scopeId === value.scopeId && (!candidate.runtimeState
      || (candidate.runtimeState.targetEntityId === candidate.entityId && candidate.runtimeState.scopeId === value.scopeId)))
    && value.effectLinks.every((link) => !link.effectFactRef && link.scopeId === value.scopeId && candidates.has(link.candidateId) && paths.has(pathKey(link)))
}, 'unsupported 구응 conclusion, duplicate IDs, out-of-scope data or invalid effect links')
export type GuEungJudgment = Infer<typeof guEungJudgmentSchema>
