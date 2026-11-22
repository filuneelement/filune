import type { TenGod } from '../dayRelationships'
import type { LuckScopeState } from '../judgment/core/luckScope'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import { recordId, sortedUnique } from '../judgment/producers/shared'
import { buildResourceDominanceFact, isResource as resource, type ResourceDominanceFact } from './resourceDominance'
import { TEN_GOD_PROFILES } from '../personality/knowledge/tenGodProfiles'
import type { NatalPersonalityResult } from '../personality/types'

type Qualifier = 'confirmed' | 'deferred'
type NatalQualifier = Qualifier | 'not_applicable'
type OutputTenGod = '食神' | '傷官'
const output = (god: TenGod): god is OutputTenGod => god === '食神' || god === '傷官'
const authority = 'Master11:ResourceOutputExpression'

export interface NatalResourceOutputExpression {
  readonly id: string
  readonly scope: 'natal'
  readonly scopeId?: string
  readonly resourceDominanceFact: ResourceDominanceFact
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
  readonly outputFunctionSuppressed: 'reduced' | 'strengthened' | 'confirmed' | 'deferred'
  readonly resourceFunctionWeakened: boolean
  readonly expressionTraits: readonly {
    tenGod: OutputTenGod
    trait: string
    sourceRefs: readonly string[]
  }[]
  readonly expressionConstraint: 'reduced' | 'strengthened' | 'confirmed' | 'deferred'
  readonly effect?: 'current_expression_relief' | 'current_expression_constraint_strengthened'
  readonly certainty: Qualifier
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceJudgmentFactIds: readonly string[]
  readonly provenance: readonly string[]
}

export function buildNatalResourceOutputExpression(personality: NatalPersonalityResult,
  judgment?: LuckScopeState, sourcePerson = judgment?.id ?? personality.dayPillar): NatalResourceOutputExpression {
  const resourceDominanceFact = buildResourceDominanceFact(sourcePerson, personality, judgment)
  const certainty = resourceDominanceFact.certainty === 'not_confirmed' ? 'not_applicable' : resourceDominanceFact.certainty
  const facts = personality.facts.filter(fact => fact.status !== 'deferred'
    && (fact.tenGod === '正印' || fact.tenGod === '偏印' || fact.tenGod === '食神' || fact.tenGod === '傷官'))
  return {
    id: recordId('natal-resource-output', [judgment?.id ?? personality.dayPillar, ...facts.map(fact => fact.id).sort()]),
    scope: 'natal', ...(judgment && { scopeId: judgment.id }),
    resourceDominanceFact, resourceDominance: certainty, outputFunctionSuppressed: certainty, expressionConstraint: certainty,
    sourcePersonalityFactIds: sortedUnique([...facts.map(fact => fact.id), ...resourceDominanceFact.sourcePersonalityFactIds]),
    sourceJudgmentFactIds: resourceDominanceFact.sourceJudgmentFactIds,
    provenance: sortedUnique([authority, resourceDominanceFact.id, ...facts.flatMap(fact => fact.provenanceIds)]),
  }
}

function actualFunction(scope: LuckScopeState, relationId: string) {
  return scope.actualFunctions.find(fact =>
    fact.relationFactId === relationId && fact.structuralEffect?.currentlyEffective)?.function
}

function changeEvidence(previous: LuckScopeState, current: LuckScopeState, forGod: (god: TenGod) => boolean) {
  const livePath = (entityId: string) => current.stemFacts.find(fact => fact.action !== 'combine'
    && (fact.source.id === entityId || fact.action === 'generate' && fact.target.id === entityId)
    && actualFunction(current, fact.id))
  const weakened = current.combinationEffects.flatMap(effect => {
    if (effect.originScopeId !== current.id || !effect.currentlyEffective || effect.expired) return []
    const relation = current.combinationHistory.find(entry => entry.relation.id === effect.sourceRelationFactId)?.relation
    const affected = relation && [relation.source, relation.target].find(part => forGod(part.tenGod)
      && previous.runtime.some(state => state.entityId === part.id && state.state === 'active')
      && current.runtime.some(state => state.entityId === part.id && state.state === effect.effect))
    if (!affected) return []
    const before = previous.stemFacts.find(fact => fact.action !== 'combine'
      && (fact.source.id === affected.id || fact.action === 'generate' && fact.target.id === affected.id)
      && actualFunction(previous, fact.id) === 'operating')
    return before ? [effect.sourceRelationFactId, before.id] : []
  })
  for (const relation of current.stemFacts.filter(fact => fact.action === 'control'
    && fact.source.scope === current.scope && forGod(fact.target.tenGod) && actualFunction(current, fact.id))) {
    const path = current.stemFacts.find(fact => fact.source.id === relation.target.id && fact.action !== 'combine'
      && actualFunction(current, fact.id) === 'reduced')
    const before = path && previous.stemFacts.find(fact => fact.source.id === path.source.id
      && fact.target.id === path.target.id && fact.action === path.action)
    if (path && before && actualFunction(previous, before.id) === 'operating') {
      weakened.push(relation.id, before.id, path.id)
    }
  }
  const strengthenedActors = new Set<TenGod>()
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
    if (!forGod(actor.tenGod)) return []
    strengthenedActors.add(actor.tenGod)
    return [event.id, path.id, ...after.factIds, ...after.formationIds]
  })
  return { weakened, strengthened, strengthenedActors }
}

function activatedOutput(previous: LuckScopeState, current: LuckScopeState) {
  return current.stemFacts.flatMap(path => {
    if (path.action === 'combine') return []
    const actor = output(path.source.tenGod) ? path.source
      : path.action === 'generate' && output(path.target.tenGod) ? path.target : undefined
    if (!actor || !output(actor.tenGod)) return []
    const root = current.rootStates.find(item => item.entityId === actor.id)
    if (!root || (root.state !== 'present' && root.state !== 'strengthened')
      || !current.runtime.some(item => item.entityId === actor.id && item.state === 'active')) return []
    const before = previous.stemFacts.find(fact => fact.action === path.action
      && fact.source.id === path.source.id && fact.target.id === path.target.id)
    if (actualFunction(current, path.id) !== 'operating' || (before && actualFunction(previous, before.id) === 'operating')) return []
    // A new downstream relation alone does not activate a natal actor already operating elsewhere.
    if (actor.scope !== current.scope && previous.stemFacts.some(fact =>
      (fact.source.id === actor.id || fact.action === 'generate' && fact.target.id === actor.id)
      && fact.action !== 'combine' && actualFunction(previous, fact.id) === 'operating')) return []
    return [{ tenGod: actor.tenGod, sourceIds: [path.id, ...root.factIds, ...root.formationIds] }]
  })
}

function outputTraits(tenGods: readonly TenGod[]) {
  return [...new Set(tenGods.filter(output))].sort().flatMap(tenGod => {
    const profile = TEN_GOD_PROFILES[tenGod]
    const fields = ['ordinaryExpression', 'productiveExpression', 'socialExpression', 'relationshipStyle'] as const
    return fields.flatMap(field => {
      const sourceRefs = sortedUnique(profile.evidenceNotes.flatMap(note =>
        'sourceRef' in note && (note.fields as readonly string[]).includes(field) && note.sourceRef ? [note.sourceRef] : []))
      return sourceRefs.length ? profile[field].map(trait => ({ tenGod, trait, sourceRefs })) : []
    })
  })
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
  const activation = effective ? activatedOutput(previous, current) : []
  const outputSupports = [...(outputChange?.strengthened ?? []), ...activation.flatMap(item => item.sourceIds)]
  const relief = [...(resourceChange?.weakened ?? []), ...outputSupports]
  const worsening = [...(resourceChange?.strengthened ?? []), ...(outputChange?.weakened ?? [])]
  const relieved = natal.expressionConstraint === 'confirmed' && Boolean(resourceChange?.weakened.length && outputSupports.length)
  const linkedSuppression = natal.expressionConstraint === 'confirmed' && current.stemFacts.some(fact =>
    fact.action === 'control' && resource(fact.source.tenGod) && output(fact.target.tenGod)
    && outputChange?.weakened.includes(fact.id))
  const stoppedOutput = current.combinationEffects.some(effect => effect.originScopeId === current.id
    && effect.effect === 'stopped' && effect.currentlyEffective && !effect.expired
    && outputChange?.weakened.includes(effect.sourceRelationFactId))
  const strengthened = natal.expressionConstraint === 'confirmed' && (linkedSuppression || stoppedOutput
    || Boolean(resourceChange?.strengthened.length && outputChange?.weakened.length))
  const retained = effective && natal.expressionConstraint === 'confirmed' && !relief.length && !worsening.length
    && current.evidence.resourceExcessEvidenceIds.length > 0
  const state = relieved && strengthened ? 'deferred' : relieved ? 'relieved'
    : strengthened ? 'strengthened' : retained ? 'retained' : 'deferred'
  const expressionConstraint = state === 'relieved' ? 'reduced' : state === 'retained' ? 'confirmed' : state
  return {
    id: recordId('current-resource-output', [natal.id, current.id]), natalExpressionId: natal.id,
    scope: current.scope, scopeId: current.id, evaluatedAt, state,
    expressionConstraint, outputFunctionSuppressed: expressionConstraint,
    resourceFunctionWeakened: Boolean(resourceChange?.weakened.length),
    expressionTraits: state === 'relieved' ? outputTraits([...(outputChange?.strengthenedActors ?? []),
      ...activation.map(item => item.tenGod)]) : [],
    ...(state === 'relieved' && { effect: 'current_expression_relief' as const }),
    ...(state === 'strengthened' && { effect: 'current_expression_constraint_strengthened' as const }),
    certainty: state === 'deferred' ? 'deferred' : 'confirmed',
    sourcePersonalityFactIds: [...natal.sourcePersonalityFactIds],
    sourceJudgmentFactIds: sortedUnique([...natal.sourceJudgmentFactIds, previous.id, current.id, ...relief, ...worsening,
      ...(retained ? current.evidence.resourceExcessEvidenceIds : [])]),
    provenance: [...natal.provenance],
  }
}
