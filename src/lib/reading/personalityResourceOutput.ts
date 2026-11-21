import type { TenGod } from '../dayRelationships'
import type { LuckScopeState } from '../judgment/core/luckScope'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import { recordId, sortedUnique } from '../judgment/producers/shared'
import type { NatalPersonalityResult } from '../personality/types'

type Qualifier = 'confirmed' | 'deferred'
type NatalQualifier = Qualifier | 'not_applicable'
const resource = (god: TenGod) => god === '印綬' || god === '偏印'
const output = (god: TenGod) => god === '食神' || god === '傷官'
const authority = 'Master11:ResourceOutputExpression'

export interface NatalResourceOutputExpression {
  readonly id: string
  readonly scope: 'natal'
  readonly scopeId?: string
  readonly resourceDominance: NatalQualifier
  readonly outputFunctionSuppressed: NatalQualifier
  readonly expressionConstraint: NatalQualifier
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceJudgmentFactIds: readonly string[]
  readonly provenance: readonly string[]
}

export interface CurrentResourceOutputExpression {
  readonly id: string
  readonly natalExpressionId: string
  readonly scope: Exclude<LuckScopeState['scope'], 'natal'>
  readonly scopeId: string
  readonly evaluatedAt: string
  readonly state: 'relieved' | 'strengthened' | 'retained' | 'deferred'
  readonly expressionConstraint: 'reduced' | 'strengthened' | 'confirmed' | 'deferred'
  readonly effect?: 'current_expression_relief' | 'current_expression_constraint_strengthened'
  readonly certainty: Qualifier
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceJudgmentFactIds: readonly string[]
  readonly provenance: readonly string[]
}

export function buildNatalResourceOutputExpression(personality: NatalPersonalityResult,
  judgment?: LuckScopeState): NatalResourceOutputExpression {
  if (judgment && judgment.scope !== 'natal') throw new TypeError('Expression baseline requires natal Judgment')
  const states = personality.tenGodStates.filter(state => state.tenGod === '正印' || state.tenGod === '偏印')
  const dominant = states.filter(state => state.prominence.status === 'confirmed'
    && (state.prominence.level === 'prominent' || state.prominence.level === 'very_prominent'))
  const excess = judgment?.evidence.resourceExcessEvidenceIds ?? []
  const assessedBelowDominance = states.length === 2 && states.every(state =>
    state.occurrence === 'absent' || state.prominence.status === 'confirmed'
      && (state.prominence.level === 'low' || state.prominence.level === 'present'))
  const certainty = dominant.length || excess.length ? 'confirmed' : assessedBelowDominance ? 'not_applicable' : 'deferred'
  const facts = personality.facts.filter(fact => fact.status !== 'deferred'
    && (fact.tenGod === '正印' || fact.tenGod === '偏印' || fact.tenGod === '食神' || fact.tenGod === '傷官'))
  return {
    id: recordId('natal-resource-output', [judgment?.id ?? personality.dayPillar, ...facts.map(fact => fact.id).sort()]),
    scope: 'natal', ...(judgment && { scopeId: judgment.id }),
    resourceDominance: certainty, outputFunctionSuppressed: certainty, expressionConstraint: certainty,
    sourcePersonalityFactIds: sortedUnique(facts.map(fact => fact.id)),
    sourceJudgmentFactIds: sortedUnique([...(judgment ? [judgment.id] : []), ...excess]),
    provenance: sortedUnique([authority, ...facts.flatMap(fact => fact.provenanceIds),
      ...dominant.flatMap(state => state.prominence.evidence.flatMap(entry => entry.sourceIds))]),
  }
}

function changeEvidence(previous: LuckScopeState, current: LuckScopeState, forGod: (god: TenGod) => boolean) {
  const active = (snapshot: LuckScopeState, relationId: string) => snapshot.actualFunctions.some(fact =>
    fact.relationFactId === relationId && fact.structuralEffect?.currentlyEffective
    && (fact.function === 'operating' || fact.function === 'reduced'))
  const livePath = (entityId: string) => current.stemFacts.find(fact => fact.action !== 'combine'
    && (fact.source.id === entityId || fact.action === 'generate' && fact.target.id === entityId)
    && active(current, fact.id))
  const weakened = current.combinationEffects.flatMap(effect => {
    if (effect.originScopeId !== current.id || !effect.currentlyEffective || effect.expired) return []
    const relation = current.combinationHistory.find(entry => entry.relation.id === effect.sourceRelationFactId)?.relation
    const affected = relation && [relation.source, relation.target].find(part => forGod(part.tenGod)
      && previous.runtime.some(state => state.entityId === part.id && state.state === 'active')
      && current.runtime.some(state => state.entityId === part.id && state.state === effect.effect))
    return affected ? [effect.sourceRelationFactId] : []
  })
  for (const relation of current.stemFacts.filter(fact => fact.action === 'control'
    && fact.source.scope === current.scope && forGod(fact.target.tenGod) && active(current, fact.id))) {
    const path = current.stemFacts.find(fact => fact.source.id === relation.target.id && fact.action !== 'combine'
      && current.actualFunctions.some(actual => actual.relationFactId === fact.id && actual.function === 'reduced'
        && actual.structuralEffect?.currentlyEffective))
    const before = path && previous.stemFacts.find(fact => fact.source.id === path.source.id
      && fact.target.id === path.target.id && fact.action === path.action)
    if (path && before && previous.actualFunctions.some(actual => actual.relationFactId === before.id
      && actual.function === 'operating' && actual.structuralEffect?.currentlyEffective)) {
      weakened.push(relation.id, before.id, path.id)
    }
  }
  const strengthened = current.luckEffectStates.flatMap(state => {
    const { event } = state
    if (state.originScopeId !== current.id || !state.currentlyEffective || state.expired
      || event.effectType !== 'changes_root_state') return []
    const after = current.rootStates.find(root => root.entityId === event.subjectId)
    const before = previous.rootStates.find(root => root.entityId === event.subjectId)
    const path = livePath(event.subjectId)
    if (!path || !before || !after || before.state === after.state
      || (after.state !== 'present' && after.state !== 'strengthened')
      || before.state === 'strengthened' || !current.runtime.some(item => item.entityId === event.subjectId && item.state === 'active')) return []
    const actor = path.source.id === event.subjectId ? path.source : path.target
    return forGod(actor.tenGod) ? [event.id, path.id, ...after.factIds, ...after.formationIds] : []
  })
  return { weakened, strengthened }
}

/** Projects a verified change in the existing current Judgment scope; it creates no period. */
export function buildCurrentResourceOutputExpression(natal: NatalResourceOutputExpression, previous: LuckScopeState,
  current: LuckScopeState, referenceTime: string): CurrentResourceOutputExpression {
  if (current.scope === 'natal' || current.parentScopeId !== previous.id) {
    throw new TypeError('Expected a direct parent and a non-natal Judgment snapshot')
  }
  if (previous.scope === 'natal' && natal.scopeId !== undefined && natal.scopeId !== previous.id) {
    throw new TypeError('Expression baseline does not match the evaluated natal Judgment')
  }
  const evaluatedAt = new Date(referenceTime).toISOString()
  const effective = luckPeriodStatus(current.validity, evaluatedAt) === 'effective'
    && current.runtimeStatus === 'resolved' && previous.runtimeStatus === 'resolved'
  const resourceChange = effective ? changeEvidence(previous, current, resource) : undefined
  const outputChange = effective ? changeEvidence(previous, current, output) : undefined
  const relief = [...(resourceChange?.weakened ?? []), ...(outputChange?.strengthened ?? [])]
  const worsening = [...(resourceChange?.strengthened ?? []), ...(outputChange?.weakened ?? [])]
  const relieved = natal.expressionConstraint === 'confirmed' && Boolean(resourceChange?.weakened.length && outputChange?.strengthened.length)
  const linkedSuppression = natal.expressionConstraint === 'confirmed' && current.stemFacts.some(fact =>
    fact.action === 'control' && resource(fact.source.tenGod) && output(fact.target.tenGod)
    && outputChange?.weakened.includes(fact.id))
  const strengthened = linkedSuppression || Boolean(resourceChange?.strengthened.length && outputChange?.weakened.length)
  const retained = effective && natal.expressionConstraint === 'confirmed' && !relief.length && !worsening.length
    && current.evidence.resourceExcessEvidenceIds.length > 0
  const state = relieved && strengthened ? 'deferred' : relieved ? 'relieved'
    : strengthened ? 'strengthened' : retained ? 'retained' : 'deferred'
  return {
    id: recordId('current-resource-output', [natal.id, current.id]), natalExpressionId: natal.id,
    scope: current.scope, scopeId: current.id, evaluatedAt, state,
    expressionConstraint: state === 'relieved' ? 'reduced' : state === 'retained' ? 'confirmed' : state,
    ...(state === 'relieved' && { effect: 'current_expression_relief' as const }),
    ...(state === 'strengthened' && { effect: 'current_expression_constraint_strengthened' as const }),
    certainty: state === 'deferred' ? 'deferred' : 'confirmed',
    sourcePersonalityFactIds: [...natal.sourcePersonalityFactIds],
    sourceJudgmentFactIds: sortedUnique([...natal.sourceJudgmentFactIds, previous.id, current.id, ...relief, ...worsening,
      ...(retained ? current.evidence.resourceExcessEvidenceIds : [])]),
    provenance: [...natal.provenance],
  }
}
