import type { LuckScopeState } from '../judgment/core/luckScope'
import { conclusionRoutes, contextRoutes, type UnitRoute } from './chapterRegistry'
import { bounds, compare, uniqueIds, withinPeriod, type RoutedUnits, type UnitInput } from './semanticUnit'
import type { ReadingAssemblyInput, ReadingScope, ReadingSemanticUnit } from './types'

export const scopeNames = {
  natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month', dailyLuck: 'day',
} as const satisfies Record<LuckScopeState['scope'], ReadingScope>

type Judgment = NonNullable<ReadingAssemblyInput['judgment']>
type Month = NonNullable<Judgment['luck']['monthlyWindow']>[number]

const structureEvidence = (ids: readonly string[]): UnitRoute => ({ ...contextRoutes.structure, contextIds: ids })

export function collectNatalJudgment(snapshot: LuckScopeState | undefined, judgment: Judgment | undefined, out: RoutedUnits) {
  const pattern = judgment?.natal.pattern
  if (pattern?.supportingFactIds.length) {
    out.add({
      topic: 'structure', scope: 'natal', certainty: pattern.status, sourceStatus: pattern.status,
      meaningRef: { producer: 'judgment', kind: 'pattern', recordId: pattern.judgmentId, scopeId: pattern.scopeId },
      sourceFactIds: pattern.supportingFactIds, evidenceIds: pattern.evidenceIds,
    }, conclusionRoutes.structure, structureEvidence(pattern.supportingFactIds))
  } else if (snapshot?.patternContext.branchPattern && snapshot.directEntityIds.length) {
    const context = snapshot.patternContext
    out.add({
      topic: 'structure', scope: 'natal', certainty: 'unknown', sourceStatus: context.phase,
      meaningRef: { producer: 'judgment', kind: 'pattern', recordId: context.id, scopeId: snapshot.id },
      sourceFactIds: snapshot.directEntityIds, evidenceIds: snapshot.evidence.ruleIds,
    }, conclusionRoutes.structure, structureEvidence(snapshot.directEntityIds))
  }
  for (const role of judgment?.natal.roles ?? []) {
    if (role.usage !== 'runtime-result') continue
    out.add({
      topic: 'structure', scope: 'natal', certainty: role.status === 'evaluated'
        ? role.provisional ? 'provisional' : 'confirmed' : role.status === 'unknown' ? 'unknown' : 'deferred',
      sourceStatus: role.status,
      meaningRef: { producer: 'judgment', kind: 'role_assignment', recordId: role.roleStateId, scopeId: role.validScopeId },
      sourceRoleIds: [role.roleStateId], evidenceIds: role.evidenceIds,
    }, conclusionRoutes.structure, structureEvidence(role.evidenceIds))
  }
  if (!snapshot) return
  for (const relation of [...snapshot.stemFacts, ...snapshot.branchFacts]) {
    const ids = 'participants' in relation ? relation.participants : [relation.source.id, relation.target.id]
    out.add({
      topic: 'structure', scope: 'natal', certainty: 'confirmed', sourceStatus: 'observed_relation',
      meaningRef: { producer: 'judgment', kind: 'relation', recordId: relation.id, scopeId: snapshot.id },
      sourceFactIds: [relation.id, ...ids],
    }, conclusionRoutes.structure, structureEvidence(ids))
  }
  for (const actual of snapshot.actualFunctions) {
    if (actual.function === 'inactive') continue
    const evidence = [
      ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? []),
      ...actual.rootEvidence.flatMap(root => root.factIds), ...actual.formationEvidence,
      ...(actual.capacityEvidence ?? []),
    ]
    const deferred = actual.function === 'deferred' || actual.direction === 'deferred'
      || actual.evidenceStatus === 'DEFERRED' || actual.evidenceStatus === 'CONFLICT'
    const contextual = actual.function === 'reduced' || actual.evidenceStatus === 'SOURCE_INFERENCE'
    out.add({
      topic: 'structure', scope: 'natal', certainty: deferred ? 'deferred' : contextual ? 'contextual' : 'confirmed',
      sourceStatus: actual.function, currentFunction: actual.function,
      direction: actual.direction, directionEvidence: actual.evidenceStatus,
      meaningRef: { producer: 'judgment', kind: 'structural_function', recordId: actual.relationFactId, scopeId: snapshot.id },
      sourceFactIds: [actual.relationFactId], evidenceIds: evidence,
    }, conclusionRoutes.structure, ...(evidence.length ? [structureEvidence(evidence)] : []),
    { chapterId: 'CH-11', role: 'context', candidate: true, contextIds: [actual.relationFactId] })
  }
  collectRoles(snapshot, 'natal', { chapterId: 'CH-01', role: 'context' }, out)
}

function collectRoles(snapshot: LuckScopeState, scope: ReadingScope, route: UnitRoute, out: RoutedUnits) {
  const history = new Map(snapshot.roleEngine.roleHistory.map(role => [role.roleId, role]))
  for (const role of snapshot.roleEngine.roleHistory) {
    if (scope !== 'natal') break
    out.add({
      topic: 'structure', scope, certainty: role.role === 'ConditionalByeong' ? 'conditional' : 'unknown',
      sourceStatus: role.role,
      meaningRef: { producer: 'judgment', kind: 'role_assignment', recordId: role.roleId, scopeId: snapshot.id },
      sourceRoleIds: [role.roleId], sourceFactIds: role.pathRefs,
    }, conclusionRoutes.structure, { ...structureEvidence(role.pathRefs.length ? role.pathRefs : [role.entityId]) })
  }
  for (const role of snapshot.roleEngine.currentRoles) {
    if (role.currentState === 'stopped' || role.currentState === 'inactive' || role.currentFunction === 'inactive') continue
    if (!history.has(role.roleId)) continue
    const certainty = role.currentState === 'conditional' || role.currentState === 'protective_standby' ? 'conditional'
      : role.currentFunction === 'deferred' ? 'deferred' : role.currentFunction === 'reduced' ? 'contextual' : 'confirmed'
    out.add({
      topic: scope === 'natal' ? 'structure' : timeTopic(scope), scope, certainty, sourceStatus: role.currentState,
      ...(scope !== 'natal' && { period: snapshot.validity }),
      currentFunction: role.currentFunction, lifecycle: role.currentState,
      meaningRef: { producer: 'judgment', kind: 'role_function', recordId: role.roleId, scopeId: snapshot.id },
      sourceRoleIds: [role.roleId], sourceFactIds: role.pathRefs,
    }, { ...route, contextIds: [role.roleId, ...role.pathRefs] })
  }
}

function timeTopic(scope: ReadingScope): UnitInput['topic'] {
  return scope === 'daewoon' ? 'daewoon' : scope === 'sewoon' ? 'year' : 'month'
}

function monthUnit(month: Month): UnitInput {
  const snapshot = month.judgmentCore
  const calendarFacts = month.stages.filter(stage => stage.stageId === 'monthlyLuck').flatMap(stage => stage.resultRefs)
  return {
    topic: 'month', scope: 'month', certainty: month.status, sourceStatus: month.status,
    period: month.effectivePeriod,
    meaningRef: { producer: 'judgment', kind: 'monthly_snapshot', recordId: month.scopeId, scopeId: snapshot?.id },
    sourceFactIds: [...(calendarFacts.length ? calendarFacts : [`canonical:solar-month:${month.startInstant}:${month.endInstant}`]),
      ...month.relationFacts.map(fact => fact.relationFactId)],
    sourceRoleIds: month.natalRoles.map(role => role.roleStateId),
    sourceEffectIds: snapshot?.luckEffectStates.filter(state => state.currentlyEffective && !state.expired
      && withinPeriod(month.referenceTime, state.originPeriod)).map(state => state.event.id),
    evidenceIds: [...month.evidenceRefs, month.natalPatternRef],
    month: {
      startInstant: month.startInstant, endInstant: month.endInstant, pillar: month.pillar,
      parentSewoonId: month.parentSewoonId, snapshotId: snapshot?.id ?? null,
      patternContextId: snapshot?.patternContext.id, stageStatus: { ...month.stageStatus },
      runtimeStateIds: uniqueIds(month.runtimeStates.map(state => state.stateId)),
      roleFunctionIds: uniqueIds(month.roleFunctions.map(role => role.postEffect.roleFunctionStateId)),
    },
  }
}

export function collectLuck(input: ReadingAssemblyInput, snapshots: readonly LuckScopeState[], referenceTime: string | undefined, out: RoutedUnits) {
  const window = input.judgment?.luck.monthlyWindow
  const monthIds = new Map<string, string>()
  for (const month of window ?? []) {
    const key = JSON.stringify([month.startInstant, month.endInstant])
    const previous = monthIds.get(key)
    if (previous !== undefined && previous !== month.scopeId) throw new TypeError('Conflicting monthly snapshots for the same period')
    monthIds.set(key, month.scopeId)
    out.add(monthUnit(month), conclusionRoutes.month)
  }

  const timed = [
    ...snapshots.map(snapshot => ({ snapshot, evaluatedAt: referenceTime })),
    ...(input.evaluatedLuckScopes ?? []),
  ]
  const canonical = input.canonical ?? input.judgment?.canonical
  const yearly = canonical?.yearlyLuck
  const great = canonical?.greatLuck.status === 'available' ? canonical.greatLuck.value : undefined
  const effects = new Map<string, {
    state: LuckScopeState['luckEffectStates'][number]
    projections: Map<string, NonNullable<ReadingSemanticUnit['effectProjections']>[number]>
  }>()
  // A current child scope can invalidate an event that was effective in its parent.
  const expired = new Set<string>()
  for (const { snapshot, evaluatedAt } of timed) {
    const scope = scopeNames[snapshot.scope]
    if (scope === 'natal' || scope === 'day') continue
    if (!withinPeriod(evaluatedAt, snapshot.validity)) continue
    const isCurrent = withinPeriod(referenceTime, snapshot.validity)
    if (!isCurrent && scope === 'month') continue
    const periodBounds = bounds(snapshot.validity)
    if (!isCurrent && scope === 'daewoon' && (!referenceTime || !periodBounds || periodBounds[0] >= referenceTime)) {
      const next = great?.currentIndex != null ? great.cards[great.currentIndex + 1] : undefined
      if (!next || !periodBounds || next.startInstant !== periodBounds[0] || next.endInstant !== periodBounds[1]) continue
    }
    if (!isCurrent && scope === 'sewoon') {
      const next = yearly?.cards[yearly.currentIndex + 1]
      if (next ? next.startInstant !== periodBounds?.[0] || next.endInstant !== periodBounds?.[1] : true) continue
    }
    if (isCurrent) {
      for (const state of snapshot.luckEffectStates) {
        if (state.expired) expired.add(state.event.id)
        if (!state.currentlyEffective || state.expired || !withinPeriod(referenceTime, state.originPeriod)) continue
        const event = effects.get(state.event.id) ?? { state, projections: new Map() }
        event.projections.set(snapshot.id, { scope, scopeId: snapshot.id, inherited: state.inherited })
        effects.set(state.event.id, event)
      }
    }
    if (scope === 'month' && window?.length) continue
    const first: UnitRoute = scope === 'daewoon'
      ? isCurrent ? conclusionRoutes.daewoon : { chapterId: 'CH-08', role: 'conclusion' }
      : scope === 'sewoon' ? conclusionRoutes.sewoon : conclusionRoutes.month
    const details = [...snapshot.actualFunctions.map(actual => actual.relationFactId),
      ...snapshot.branchFacts.map(fact => fact.id), ...snapshot.formationFacts.map(fact => fact.id)]
    const later = scope === 'daewoon' && isCurrent
      ? [{ ...contextRoutes.daewoon, contextIds: [snapshot.patternContext.id, ...details] }] : []
    out.add({
      topic: timeTopic(scope), scope, period: snapshot.validity, certainty: 'deferred', sourceStatus: snapshot.runtimeStatus,
      meaningRef: { producer: 'judgment', kind: 'scope_snapshot', recordId: snapshot.id, scopeId: snapshot.id },
      sourceFactIds: [snapshot.patternContext.id, ...snapshot.directEntityIds, ...details],
      evidenceIds: snapshot.evidence.ruleIds,
    }, first, ...later)
    if (!isCurrent) continue
    const route: UnitRoute = { chapterId: later[0]?.chapterId ?? first.chapterId, role: 'context' }
    collectRoles(snapshot, scope, route, out)
  }
  for (const { state, projections } of effects.values()) {
    const { event, originPeriod, originScopeId } = state
    const scope = scopeNames[state.originScope]
    if (expired.has(event.id) || scope === 'day') continue
    if (scope === 'month' && window?.length && !window.some(month => month.judgmentCore?.id === originScopeId
      || month.startInstant === bounds(originPeriod)?.[0] && month.endInstant === bounds(originPeriod)?.[1])) continue
    const chapterId = scope === 'daewoon' ? 'CH-08' : scope === 'sewoon' ? 'CH-09' : 'CH-10'
    out.add({
      topic: timeTopic(scope), scope, certainty: 'confirmed', sourceStatus: 'currently_effective', lifecycle: 'active',
      period: originPeriod,
      meaningRef: { producer: 'judgment', kind: 'luck_effect', recordId: event.id, scopeId: originScopeId },
      sourceEffectIds: [event.id], sourceFactIds: event.sourceRelationFactId ? [event.sourceRelationFactId] : [],
      evidenceIds: event.evidenceRefs,
      effectProjections: [...projections.values()].sort((a, b) => compare(a.scopeId, b.scopeId)),
    }, { chapterId, role: 'context', contextIds: [event.id, ...event.evidenceRefs] })
  }
  return uniqueIds(timed.flatMap(({ snapshot }) => snapshot.luckEffectHistory.map(event => event.id)))
}
