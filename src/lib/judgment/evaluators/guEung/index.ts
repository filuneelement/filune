import { roleStateSchema } from '../../contracts/roleState'
import { guEungEvaluationInputSchema, guEungEvaluationResultSchema, scopedGuEungLinksSchema } from '../../contracts/guEungEffect'
import type { GuEungEvaluationInput } from '../../contracts/guEungEffect'
import type { GuEungEffectLink } from '../../contracts/guEung'
import type { ApplicationReference, RoleStateContract } from '../../contracts'
import { detach, recordId, sortedUnique } from '../../producers/shared'
import { prepareGuEungBoundary } from '../../runtime/guEungBoundary'
import { containsTime, effectEvidence, sameValue } from '../../runtime/guEungEffectEvidence'

export { guEungFactClaim } from '../../runtime/guEungEffectEvidence'

function index<T>(items: T[], key: (item: T) => string): Map<string, T> {
  const result = new Map(items.map((item) => [key(item), item]))
  if (result.size !== items.length) throw new TypeError('duplicate 구응 input identity')
  return result
}
const pathKey = (item: { byeongJudgmentId: string; damagePathId: string }) => recordId('damage-path', [item.byeongJudgmentId, item.damagePathId])

/** Consumes independently attested outcomes. Does not determine a physical or 명리 effect. */
export function evaluateGuEung(input: GuEungEvaluationInput) {
  const { boundary, candidates, relations, states, effects, links } = guEungEvaluationInputSchema.parse(input)
  const base = prepareGuEungBoundary(boundary)
  const { scopeId, referenceTime } = boundary
  const verdicts: { effectPathId: string; status: 'confirmed' | 'rejected' | 'deferred'; effectId: string | null; reasonCode: string }[] = []
  const roleStates: RoleStateContract[] = []
  const applications: ApplicationReference[] = []
  const effectLinks: GuEungEffectLink[] = []
  scopedGuEungLinksSchema.parse(links)
  if (links.some((link) => link.effectFactRef)) throw new TypeError('구응 link cannot assert its own effect result')
  if ([...candidates, ...relations, ...states, ...effects, ...links].some((item) => item.scopeId !== scopeId)) throw new TypeError('구응 scope mismatch')
  if (boundary.byeong.status !== 'has-byeong') return detach(guEungEvaluationResultSchema.parse({ ...base, verdicts }))
  const paths = index(base.damagePaths, pathKey)
  const candidateById = index(candidates, (item) => item.candidateId)
  const relationById = index(relations, (item) => item.relationFactId)
  const stateById = index(states, (item) => item.stateId)
  index(effects, (item) => item.effectId)
  index(candidates, (item) => item.entityId)
  if (effects.some((fact) => !links.some((link) => pathKey(fact) === pathKey(link)
    && candidateById.get(link.candidateId)?.entityId === fact.candidateEntityId
    && sameValue([...link.relationFactIds].sort(), [...fact.relationFactIds].sort())))) {
    throw new TypeError('구응 effect candidate or path mismatch')
  }
  const { attested, supportsRule } = effectEvidence(boundary.evidence.records)
  const eligibleLinks = links.slice().sort((a, b) => a.effectPathId.localeCompare(b.effectPathId))
  for (const link of eligibleLinks) {
    const path = paths.get(pathKey(link)), candidate = candidateById.get(link.candidateId)
    if (!path || !candidate) throw new TypeError('구응 link requires a confirmed current damage path and a supplied candidate')
    const matching = effects.filter((fact) => pathKey(fact) === pathKey(link) && sameValue([...fact.relationFactIds].sort(), [...link.relationFactIds].sort())
      && fact.candidateEntityId === candidate.entityId)
    const effect = matching.length === 1 ? matching[0] : undefined
    const pending = (reasonCode: string) => verdicts.push({ effectPathId: link.effectPathId, status: 'deferred', effectId: null, reasonCode })
    if (!effect) { pending('INDEPENDENT_EFFECT_UNAVAILABLE'); continue }
    if (effect.provenance.attribution !== 'individual') { pending('INDIVIDUAL_ATTRIBUTION_UNAVAILABLE'); continue }
    if (effect.provenance.causeEntityId !== candidate.entityId) throw new TypeError('구응 cause entity mismatch')
    if (effect.coverage !== 'complete' || !containsTime(effect.effectivePeriod, referenceTime)
      || !attested(effect, effect.effectId, effect.provenance.producerRef)
      || !effect.ruleIds.every((rule) => supportsRule(effect.evidenceIds, rule)
        || (effect.sourceMechanism === 'stem-combination' && rule === 'OP-T07'
          && effect.provenance.producerRef.producerId === 'filune-stem-path-effect'))) {
      pending('EFFECT_COVERAGE_OR_PROVENANCE_UNAVAILABLE'); continue
    }
    const observedRelations = link.relationFactIds.map((id) => relationById.get(id))
    if (effect.sourceMechanism === 'tongguan' || !observedRelations.length || observedRelations.some((item) =>
      !item || !item.kind.startsWith('stem-') || item.assessment !== 'confirmed' || item.uncertaintyIds.length || item.existence !== 'present')
      || (effect.sourceMechanism === 'direct-control' && !observedRelations.some((item) =>
        item?.kind === 'stem-controls' && item.sourceEntityId === candidate.entityId && item.targetEntityId === effect.targetEntityId))
      || !observedRelations.some((item) => item?.participantEntityIds.includes(candidate.entityId)
        && item.participantEntityIds.includes(effect.targetEntityId))) {
      pending('MECHANISM_OR_RELATION_UNSUPPORTED'); continue
    }
    if ((effect.target === 'byeong-source' && effect.targetEntityId !== path.byeongEntityId)
      || (['protected-target', 'protected-function'].includes(effect.target) && effect.targetEntityId !== path.protectedEntityId)) {
      throw new TypeError('구응 effect target mismatch')
    }
    const scopeStates = effect.runtimeStateRefs.map((id) => stateById.get(id))
    const candidateState = candidate.runtimeState
    if (!candidateState || !sameValue(candidateState, stateById.get(candidateState.stateId))
      || candidateState.targetEntityId !== candidate.entityId || !effect.runtimeStateRefs.includes(candidateState.stateId)
      || scopeStates.some((state) => !state || state.uncertaintyIds.length || !containsTime(state.validity, referenceTime))) {
      pending('EFFECT_RUNTIME_STATE_UNAVAILABLE'); continue
    }
    if (effect.sourceMechanism === 'stem-combination') {
      const source = scopeStates.find((state) => state?.targetEntityId === path.byeongEntityId)
      const sharesStop = source?.causingApplicationRefs.some((app) => ['OP-T01', 'OP-T07', 'OP-T09'].includes(app.ruleId)
        && candidateState.causingApplicationRefs.some((other) => sameValue(app, other)))
      if (effect.provenance.producerRef.producerId !== 'filune-stem-path-effect' || effect.target !== 'byeong-source'
        || source?.functionalState !== 'stopped' || source.priorStateRef !== path.runtimeStateRef
        || candidateState.functionalState !== 'stopped' || !sharesStop
        || observedRelations.some((relation) => relation?.kind !== 'stem-combination')) {
        pending('STEM_PATH_TERMINATION_UNVERIFIED'); continue
      }
    } else if (effect.effectType !== 'no-effect' && !['active', 'weakened'].includes(candidateState.functionalState)) {
      pending('CANDIDATE_NOT_CURRENTLY_FUNCTIONAL'); continue
    }
    if (effect.effectType === 'no-effect') {
      verdicts.push({ effectPathId: link.effectPathId, effectId: effect.effectId, status: 'rejected', reasonCode: 'NO_EFFECT' })
      continue
    }
    verdicts.push({ effectPathId: link.effectPathId, effectId: effect.effectId, status: 'confirmed', reasonCode: effect.effectType })
    effectLinks.push({ ...link, effectFactRef: effect.effectId, evidenceIds: sortedUnique([...link.evidenceIds, ...effect.evidenceIds]) })
  }
  for (const candidateId of sortedUnique(effectLinks.map((link) => link.candidateId))) {
    const candidate = candidateById.get(candidateId)!
    const successful = new Set(effectLinks.filter((link) => link.candidateId === candidateId).map((link) => link.effectPathId))
    const applied = effects.filter((effect) => verdicts.some((verdict) => successful.has(verdict.effectPathId) && verdict.effectId === effect.effectId))
    const app = { applicationId: recordId('gu-eung-application', [scopeId, candidateId]), executionId: scopeId, scopeId,
      ruleId: 'I-03', ruleVersion: 'GuEung-v1' }
    applications.push(app)
    roleStates.push(roleStateSchema.parse({ contractVersion: '1', roleStateId: recordId('gu-eung-role', [scopeId, candidateId]),
      subjectKind: 'entity', entityId: candidate.entityId, structureRef: null, role: '구응', status: 'evaluated',
      sourceRuleIds: sortedUnique(['I-03', ...applied.flatMap((fact) => fact.ruleIds)]), evidenceIds: sortedUnique(applied.flatMap((fact) => fact.evidenceIds)),
      validScopeId: scopeId, provisional: false, uncertaintyIds: [], origin: 'rule-result', applicationRef: app, usage: 'runtime-result' }))
  }
  return detach(guEungEvaluationResultSchema.parse({ ...base, status: roleStates.length ? 'confirmed' as const : base.status,
    reasonCodes: sortedUnique([...base.reasonCodes.filter((reason) => reason !== 'GUEUNG_RULE_NOT_IMPLEMENTED'),
      ...(roleStates.length ? [] : ['GUEUNG_INDEPENDENT_EFFECT_NOT_CONFIRMED'])]),
    candidates: candidates.slice().sort((a, b) => a.candidateId.localeCompare(b.candidateId)), effectLinks, verdicts, roleStates, applications }))
}
