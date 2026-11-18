import { contractHeader, producerReferenceSchema, validitySchema } from './common'
import { guEungCandidateSchema, guEungEffectLinkSchema, guEungInputSchema, guEungJudgmentDataSchema, guEungJudgmentSchema } from './guEung'
import { relationFactSchema } from './relationFact'
import { runtimeStateSchema } from './runtimeState'
import { array, enumeration, id, nonEmptyIds, object, refine, literal, union, schema, requireContract } from './schema'
import type { Infer } from './schema'

const path = { scopeId: id, byeongJudgmentId: id, damagePathId: id }
export const guEungEffectSchema = object({
  ...contractHeader, ...path, effectId: id, candidateEntityId: id,
  effectType: enumeration(['partial-relief', 'complete-relief', 'no-effect'] as const),
  sourceMechanism: enumeration(['stem-combination', 'direct-control', 'path-block', 'tongguan', 'protected-function-recovery'] as const),
  target: enumeration(['byeong-source', 'mediator', 'protected-target', 'protected-function'] as const),
  targetEntityId: id, relationFactIds: nonEmptyIds, runtimeStateRefs: nonEmptyIds, ruleIds: nonEmptyIds, evidenceIds: nonEmptyIds,
  provenance: object({ producerRef: producerReferenceSchema, ruleVersion: id, causeEntityId: id,
    attribution: enumeration(['individual', 'joint-unresolved'] as const) }),
  coverage: enumeration(['complete', 'partial', 'unknown'] as const), effectivePeriod: validitySchema,
})
export type GuEungEffectFact = Infer<typeof guEungEffectSchema>

export const damageSourceDependencySchema = object({
  ...contractHeader, ...path, dependencyId: id, sourceEntityId: id, sourceStateRef: id,
  dependency: enumeration(['required', 'unknown'] as const),
  evidenceIds: nonEmptyIds, producerRef: producerReferenceSchema,
})
export type DamageSourceDependency = Infer<typeof damageSourceDependencySchema>

export const guEungEvaluationInputSchema = object({
  boundary: guEungInputSchema, candidates: array(guEungCandidateSchema), relations: array(relationFactSchema),
  states: array(runtimeStateSchema), effects: array(guEungEffectSchema), links: array(guEungEffectLinkSchema),
})
export type GuEungEvaluationInput = Infer<typeof guEungEvaluationInputSchema>

export const scopedGuEungLinksSchema = refine(array(guEungEffectLinkSchema), (links) =>
  new Set(links.map((link) => link.effectPathId)).size === links.length
  && new Set(links.map((link) => JSON.stringify([link.scopeId, link.candidateId, link.byeongJudgmentId,
    link.damagePathId, [...link.relationFactIds].sort()]))).size === links.length, 'duplicate effect link')

export const guEungVerdictSchema = object({
  effectPathId: id, status: enumeration(['confirmed', 'rejected', 'deferred'] as const),
  effectId: union(id, literal(null)), reasonCode: id,
})
export type GuEungVerdict = Infer<typeof guEungVerdictSchema>

export const guEungEvaluationResultSchema = schema((value, at) => {
  const source = value as Record<string, unknown> | null
  requireContract(source !== null && typeof source === 'object' && !Array.isArray(source), at, 'expected 구응 result')
  const { verdicts: rawVerdicts, ...base } = source
  const verdicts = array(guEungVerdictSchema).parse(rawVerdicts, at + '.verdicts')
  const result = guEungJudgmentDataSchema.parse(base, at)
  guEungJudgmentSchema.parse({ ...result, status: result.status === 'confirmed' ? 'deferred' : result.status,
    roleStates: [], applications: [], effectLinks: result.effectLinks.map(({ effectFactRef: _, ...link }) => link) }, at)
  const confirmed = verdicts.filter((item) => item.status === 'confirmed')
  requireContract(new Set(verdicts.map((item) => item.effectPathId)).size === verdicts.length
    && (result.status !== 'not-applicable' || !verdicts.length)
    && (result.status === 'confirmed') === (confirmed.length > 0)
    && (result.status === 'confirmed') === (result.roleStates.length > 0)
    && result.applications.length === result.roleStates.length
    && result.effectLinks.length === confirmed.length
    && confirmed.every((item) => item.effectId && result.effectLinks.some((link) => link.effectPathId === item.effectPathId && link.effectFactRef === item.effectId))
    && result.effectLinks.every((link) => result.roleStates.some((role) => role.role === '구응'
      && role.entityId === result.candidates.find((candidate) => candidate.candidateId === link.candidateId)?.entityId))
    && result.roleStates.every((role) => role.role === '구응' && role.validScopeId === result.scopeId && !role.provisional
      && role.status === 'evaluated' && result.applications.some((app) => app.applicationId === role.applicationRef?.applicationId
        && app.scopeId === role.validScopeId)), at, '구응 verdict, links or role references are inconsistent')
  return { ...result, verdicts }
})
export type GuEungEvaluationResult = Infer<typeof guEungEvaluationResultSchema>
