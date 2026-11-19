import type { CurrentPersonalityResult } from '../personality/current/types'
import type { NatalPersonalityResult, PersonalityFact, StructuralRolePersonalityModifier } from '../personality/types'
import { conclusionRoutes, contextRoutes, type UnitRoute } from './chapterRegistry'
import { activeCertainty, withinPeriod, type RoutedUnits, type UnitInput } from './semanticUnit'
import type { ReadingCertainty, ReadingScope } from './types'

function roleCertainty(role: StructuralRolePersonalityModifier): ReadingCertainty {
  if (role.roleContext === 'conditional_byeong' && role.currentFunction !== 'operating') return 'conditional'
  return role.status === 'reduced' ? 'contextual' : role.status === 'inactive' ? 'deferred' : role.status
}

const liveRole = (role: StructuralRolePersonalityModifier) =>
  role.status !== 'inactive' && role.currentFunction !== 'inactive' && role.runtimeState !== 'stopped'
  && role.currentState !== 'inactive' && role.currentState !== 'stopped'

export function collectNatalPersonality(natal: Readonly<NatalPersonalityResult>, unknownHour: boolean, out: RoutedUnits) {
  const facts = natal.facts.filter(fact => fact.provenanceIds.length > 0
    && (!unknownHour || !fact.sourcePosition?.startsWith('hour_')))
  const factIds = new Set(facts.map(fact => fact.id))
  const context = new Map<string, string[]>()
  const index = (ids: readonly string[], evidence: readonly string[]) => {
    for (const id of ids) context.set(id, [...(context.get(id) ?? []), ...evidence])
  }
  for (const position of natal.positionExpressions) {
    if (unknownHour && position.position.startsWith('hour_')) continue
    index(position.factIds, position.provenanceIds)
  }
  for (const conflict of natal.conflicts) {
    if (conflict.factIds.every(id => factIds.has(id))) index(conflict.factIds, [conflict.id])
  }
  for (const role of natal.structuralRoleModifiers.filter(liveRole)) {
    index(role.targetPersonalityFactIds, [role.sourceRoleId, ...role.actualFunctionRefs])
  }

  const freeTypes = new Set(['social', 'interpersonal', 'inner', 'decision', 'stress', 'internal_conflict', 'expression'])
  for (const fact of facts) {
    if (fact.traitType === 'growth') continue
    const contexts = context.get(fact.id) ?? []
    const topic = fact.traitType === 'strength' ? 'strength' : fact.traitType === 'shadow' ? 'challenge' : 'personality'
    const input: UnitInput = {
      topic, scope: 'natal', certainty: activeCertainty(fact.status), sourceStatus: fact.status,
      meaningRef: { producer: 'personality', kind: 'personality_fact', recordId: fact.id },
      sourcePersonalityFactIds: [fact.id], evidenceIds: fact.provenanceIds,
    }
    if (topic !== 'personality') {
      out.add(input, conclusionRoutes.traits,
        { ...contextRoutes.traits, contextIds: contexts.length ? contexts : fact.provenanceIds },
        { chapterId: 'CH-11', role: 'evidence', candidate: true, contextIds: fact.provenanceIds })
    } else if (freeTypes.has(fact.traitType)) {
      out.add(input, conclusionRoutes.personality, ...(contexts.length
        ? [{ ...contextRoutes.personality, contextIds: contexts }] : []))
    } else {
      out.add(input, { chapterId: 'CH-02', role: 'conclusion' })
    }
  }
  for (const conflict of natal.conflicts) {
    if (!conflict.factIds.length || !conflict.factIds.every(id => factIds.has(id))) continue
    const contextual = facts.some(fact => conflict.factIds.includes(fact.id) && fact.status !== 'active')
    out.add({
      topic: 'personality', scope: 'natal', sourceStatus: conflict.resolution,
      certainty: conflict.resolution === 'deferred' ? 'deferred' : contextual ? 'contextual' : 'confirmed',
      meaningRef: { producer: 'personality', kind: 'personality_conflict', recordId: conflict.id },
      sourceConflictIds: [conflict.id], sourcePersonalityFactIds: conflict.factIds, evidenceIds: conflict.explanationEvidence,
    }, { chapterId: 'CH-02', role: 'context', contextIds: conflict.factIds })
  }
  for (const role of natal.structuralRoleModifiers.filter(liveRole)) {
    const targets = role.targetPersonalityFactIds.filter(id => factIds.has(id))
    if (!targets.length) continue
    const candidate = role.operation === 'distorts_expression' || role.roleContext === 'conditional_byeong' ? 'challenge'
      : role.operation === 'supports_expression' || role.operation === 'protects_expression' || role.operation === 'resolves_tension'
        || role.roleContext === 'protective_standby' ? 'strength' : undefined
    if (candidate) {
      const evidence = [...role.currentPathRefs, ...role.historyPathRefs, ...role.actualFunctionRefs, ...targets]
      out.add(modifierUnit(role, targets, 'natal', candidate), conclusionRoutes.traits,
        { ...contextRoutes.traits, contextIds: evidence })
    } else {
      out.add(modifierUnit(role, targets, 'natal', 'personality'),
        { chapterId: 'CH-02', role: 'context', contextIds: targets })
    }
  }
  return factIds
}

function modifierUnit(role: StructuralRolePersonalityModifier, targets: readonly string[], scope: ReadingScope,
  topic: UnitInput['topic']): UnitInput {
  return {
    topic, scope, certainty: roleCertainty(role), sourceStatus: role.status, currentFunction: role.currentFunction,
    lifecycle: role.currentState,
    meaningRef: { producer: 'personality', kind: 'personality_modifier', recordId: role.id, scopeId: role.sourceScopeId },
    sourceRoleIds: [role.sourceRoleId], sourceFactIds: role.sourceFactIds,
    sourcePersonalityFactIds: targets, evidenceIds: role.provenanceIds,
  }
}

export function collectCurrentPersonality(current: Readonly<CurrentPersonalityResult>,
  natalIds: ReadonlySet<string>, referenceTime: string | undefined, out: RoutedUnits) {
  const scope = current.evaluationScope
  if (scope === 'natal' || scope === 'day') return
  const selected = current.scopeExpressions.find(item => item.scopeId === current.evaluationScopeId && item.currentlyEffective)
  if (!selected || !withinPeriod(referenceTime, selected.period)) return
  const period = selected.period
  const route: UnitRoute = { chapterId: scope === 'daewoon' ? 'CH-08' : scope === 'sewoon' ? 'CH-09' : 'CH-10', role: 'context' }
  const history = new Map(current.effectHistory.map(effect => [effect.id, effect]))
  const liveEffect = (id: string) => {
    const event = history.get(id)
    return event?.currentlyEffective === true && !event.expired
      && event.originScope !== 'day' && withinPeriod(referenceTime, event.originPeriod)
  }
  const facts = new Map<string, PersonalityFact>(current.temporaryFacts
    .filter(fact => fact.provenanceIds.length).map(fact => [fact.id, fact]))
  const available = new Set([...natalIds].filter(id => current.currentFacts.some(fact =>
    fact.personalityFactId === id && fact.currentlyEffective && fact.state !== 'inactive')))
  const temporary = new Set<string>()
  for (const fact of current.currentFacts) {
    if (!fact.currentlyEffective || fact.state === 'inactive') continue
    const origins = fact.origins.filter(origin => liveEffect(origin.originEffectId) && withinPeriod(referenceTime, origin.originPeriod))
    if (!origins.length) continue
    const id = fact.personalityFactId
    if (fact.origin === 'luck' ? !facts.has(id) : !natalIds.has(id)) continue
    if (fact.origin === 'luck') temporary.add(id)
    available.add(id)
    out.add({
      topic: 'personality', scope, period,
      meaningRef: { producer: 'personality', kind: 'current_personality_fact', scopeId: selected.scopeId, recordId: id },
      sourceStatus: fact.state, lifecycle: fact.state,
      certainty: fact.state === 'deferred' ? 'deferred' : fact.state === 'active' ? 'confirmed' : 'contextual',
      sourcePersonalityFactIds: [id],
      sourceEffectIds: [...origins.map(origin => origin.originEffectId), ...fact.sourceStructuralEffectIds.filter(liveEffect)],
      sourceFactIds: origins.flatMap(origin => origin.sourceLuckFactIds),
    }, { ...route, contextIds: origins.map(origin => origin.originEffectId) })
  }
  for (const conflict of current.conflicts) {
    if (!['natal_vs_current', 'temporary_expression_tension'].includes(conflict.conflictType)) continue
    if (!conflict.factIds.every(id => available.has(id)) || !conflict.factIds.some(id => temporary.has(id))) continue
    out.add({
      topic: 'personality', scope, period, sourceStatus: conflict.resolution,
      certainty: conflict.resolution === 'deferred' ? 'deferred' : 'contextual',
      meaningRef: { producer: 'personality', kind: 'personality_conflict', scopeId: selected.scopeId, recordId: conflict.id },
      sourceConflictIds: [conflict.id], sourcePersonalityFactIds: conflict.factIds, evidenceIds: conflict.explanationEvidence,
    }, { ...route, contextIds: conflict.factIds })
  }
  const roleStates = new Map(selected.roleModifierStates.map(state => [state.modifierId, state]))
  const natalModifiers = new Map(current.natal.structuralRoleModifiers.map(role => [role.id, role]))
  for (const role of current.structuralRoleModifiers.filter(liveRole)) {
    const state = roleStates.get(role.id)
    if (!state || state.status === 'inactive' || state.currentFunction === 'inactive') continue
    const previous = natalModifiers.get(role.id)
    if (previous?.status === role.status && previous.operation === role.operation
      && previous.currentFunction === role.currentFunction && previous.roleContext === role.roleContext) continue
    const sourceEffectIds = state.sourceStructuralEffectIds.filter(liveEffect)
    if (state.sourceStructuralEffectIds.length && !sourceEffectIds.length) continue
    const targets = role.targetPersonalityFactIds.filter(id => available.has(id))
    if (!targets.length) continue
    const input = modifierUnit(role, targets, scope, 'personality')
    out.add({ ...input, period, sourceEffectIds, meaningRef: { ...input.meaningRef, scopeId: selected.scopeId } },
      { ...route, contextIds: [...targets, ...sourceEffectIds] })
  }
}
