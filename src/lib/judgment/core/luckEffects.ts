import type { ActualStructuralFunction } from './policies'
import type {
  CapacityEvidence, ConditionalByeong, FinalPatternContext, LuckEffect, RoleCurrentState,
  RoleFunctionBasis, RoleHistory, Scope, StemParticipant, StemRelationFact, StemRuntime,
} from './types'
import type { formations, roots } from './branches'

export type ScopedPath = { fact: StemRelationFact; actual: ActualStructuralFunction }
const operating = (state: RoleCurrentState['currentFunction']) => state === 'operating' || state === 'reduced'

export function evaluateCurrentRoles(history: readonly RoleHistory[], bases: readonly RoleFunctionBasis[],
  runtime: ReadonlyMap<string, StemRuntime>, paths: readonly ScopedPath[]): RoleCurrentState[] {
  return history.map((role) => {
    const state = role.entityId && role.status === 'evaluated' && !role.provisional ? runtime.get(role.entityId) : undefined
    const matching = role.entityId ? paths.filter(({ fact, actual }) =>
      bases.some((basis) => basis.roleHistoryRef === role.roleStateId && basis.evidenceIds.length > 0
        && fact.source.id === basis.sourceEntityId && fact.target.id === basis.targetEntityId && fact.action === basis.action
        && [fact.source.id, fact.target.id].includes(role.entityId!))
      || role.role === '용신' && actual.policyId !== null && actual.direction === 'favorable' && fact.source.id === role.entityId)
      : []
    const functioning = matching.filter(({ actual }) => operating(actual.function))
    const currentFunction = !state ? 'deferred' : state === 'stopped' ? 'inactive'
      : functioning.length ? state === 'active' && functioning.some(({ actual }) => actual.function === 'operating') ? 'operating' : 'reduced'
        : matching.length && matching.every(({ actual }) => actual.function === 'inactive') ? 'inactive' : 'deferred'
    const refs = matching.filter(({ actual }) => currentFunction === 'inactive' ? actual.function === 'inactive'
      : currentFunction === 'reduced' ? operating(actual.function) : actual.function === currentFunction)
    return { roleHistoryRef: role.roleStateId, currentState: state ?? 'deferred', currentFunction,
      ...(refs.length ? { functionRefs: refs.map(({ fact }) => fact.id) } : {}) }
  })
}

export function evaluateConditionalByeong(history: readonly ConditionalByeong[], paths: readonly ScopedPath[],
  rootFacts: readonly StemRelationFact[]) {
  return history.map((candidate) => {
    const basis = rootFacts.find(({ id }) => id === candidate.supportingRelationFactId)
    const supported = basis?.action === 'generate' && (basis.source.tenGod === '食神' || candidate.triggerPolicyId === 'PEER-05' && basis.source.tenGod === '傷官')
      && basis.target.id === candidate.sourceEntityId && ['正財', '偏財'].includes(basis.target.tenGod)
      && paths.some(({ fact, actual }) => fact.action === 'generate' && fact.source.id === basis.source.id
        && fact.target.id === basis.target.id && operating(actual.function))
    const trigger = supported ? paths.find(({ fact, actual }) => fact.source.id === candidate.sourceEntityId
      && fact.target.scope !== 'natal' && fact.target.tenGod === '偏官' && fact.action === 'generate'
      && (!candidate.requiresHarmfulKilling || actual.policyId === (candidate.triggerPolicyId ?? 'WEALTH-06'))
      && operating(actual.function)) : undefined
    return { ...candidate, currentState: trigger ? 'active' as const : 'conditional' as const,
      triggerRelationFactId: trigger?.fact.id ?? null, currentFunction: trigger?.actual.function ?? 'inactive' }
  })
}

export type EffectState = {
  patternContext: FinalPatternContext
  currentRoles: readonly RoleCurrentState[]
  conditionalByeong: readonly ReturnType<typeof evaluateConditionalByeong>[number][]
  capacity: CapacityEvidence | null
  rootStates: readonly ReturnType<typeof roots>['states'][number][]
  formationFacts: readonly ReturnType<typeof formations>[number][]
}

export function buildLuckEffects(scope: Scope, luck: StemParticipant | undefined, parent: EffectState | null,
  current: EffectState, roles: readonly RoleHistory[], paths: readonly ScopedPath[],
  causes: readonly StemRelationFact[], bases: readonly RoleFunctionBasis[]): LuckEffect[] {
  if (scope === 'natal' || !luck || !parent) return []
  const effects: LuckEffect[] = []
  const add = (effectType: LuckEffect['effectType'], subjectId: string, refs: readonly string[]) => {
    const prior = effects.find((effect) => effect.effectType === effectType && effect.subjectId === subjectId)
    const evidenceRefs = [...new Set(refs)]
    if (prior) prior.evidenceRefs = [...new Set([...prior.evidenceRefs, ...evidenceRefs])]
    else effects.push({ effectType, scope, sourceLuckEntityId: luck.id, subjectId, evidenceRefs })
  }
  const pattern = current.patternContext
  for (const item of pattern.manifestationHistory.filter(({ entityId }) => entityId === luck.id)) {
    add('manifests_yongshen', item.entityId, [pattern.id])
  }
  if (pattern.patternMode !== parent.patternContext.patternMode && pattern.patternMode !== null) {
    add('changes_pattern_mode', pattern.id, [parent.patternContext.id, pattern.id])
  }

  for (const item of current.conditionalByeong) {
    const prior = parent.conditionalByeong.find(({ supportingRelationFactId, sourceEntityId }) =>
      supportingRelationFactId === item.supportingRelationFactId && sourceEntityId === item.sourceEntityId)
    if (prior?.currentState === 'conditional' && item.triggerRelationFactId) {
      add('activates_byeong', item.sourceEntityId, [item.supportingRelationFactId, item.triggerRelationFactId])
    }
    const previousTrigger = paths.find(({ fact }) => fact.id === prior?.triggerRelationFactId
      || fact.source.id === item.sourceEntityId && fact.target.tenGod === '偏官' && fact.action === 'generate')
    const support = paths.find(({ fact }) => fact.source.tenGod === '食神' && fact.target.id === item.sourceEntityId
      && fact.action === 'generate')
    const participants = [item.sourceEntityId, support?.fact.source.id, previousTrigger?.fact.target.id]
    const causeRefs = causes.filter(({ source, target }) =>
      participants.includes(source.id) || participants.includes(target.id)).map(({ id }) => id)
    if (prior?.currentState === 'active' && item.currentState === 'conditional' && causeRefs.length) {
      add('relieves_byeong', item.sourceEntityId, [item.supportingRelationFactId, ...causeRefs])
    }
    if (prior?.currentFunction === 'operating' && item.currentFunction === 'reduced' && item.triggerRelationFactId) {
      add('weakens_byeong', item.sourceEntityId, [item.triggerRelationFactId, ...causeRefs])
    }
    if (prior?.currentFunction === 'reduced' && item.currentFunction === 'operating' && item.triggerRelationFactId) {
      add('strengthens_byeong', item.sourceEntityId, [item.triggerRelationFactId, ...causeRefs])
    }
  }

  for (const role of current.currentRoles) {
    const previous = parent.currentRoles.find(({ roleHistoryRef }) => roleHistoryRef === role.roleHistoryRef)
    const assignment = roles.find(({ roleStateId }) => roleStateId === role.roleHistoryRef)
    if (!previous || !assignment) continue
    const before = previous.currentFunction
    const after = role.currentFunction
    const relatedBases = bases.filter(({ roleHistoryRef }) => roleHistoryRef === role.roleHistoryRef)
    const participants = [assignment.entityId, ...relatedBases.flatMap((basis) => [basis.sourceEntityId, basis.targetEntityId])]
    const causeRefs = causes.filter(({ source, target }) =>
      participants.includes(source.id) || participants.includes(target.id)).map(({ id }) => id)
    const refs = [...(role.functionRefs ?? []), ...(previous.functionRefs ?? []), ...causeRefs]
    if (assignment.role === '병' && operating(before)) {
      if (after === 'inactive') add('relieves_byeong', role.roleHistoryRef, refs)
      if (before === 'operating' && after === 'reduced') add('weakens_byeong', role.roleHistoryRef, refs)
      if (before === 'reduced' && after === 'operating') add('strengthens_byeong', role.roleHistoryRef, refs)
    }
    if (assignment.role === '상신') {
      if (!operating(before) && operating(after)) add('activates_sangshen_function', role.roleHistoryRef, refs)
      if (operating(before) && after === 'inactive'
        || before === 'operating' && after === 'reduced') add('weakens_sangshen', role.roleHistoryRef, refs)
    }
    if (assignment.role === '구응') {
      for (const basis of relatedBases) {
        const byeong = basis.relievesByeongRoleRef
        if (!byeong || !basis.evidenceIds.length || !roles.some(({ role, roleStateId }) => role === '병' && roleStateId === byeong)) continue
        const linkedPaths = paths.filter(({ fact }) => fact.source.id === basis.sourceEntityId
          && fact.target.id === basis.targetEntityId && fact.action === basis.action)
        if (!operating(before) && operating(after) && linkedPaths.some(({ actual }) => operating(actual.function))) {
          add('relieves_byeong', byeong, [...refs, ...basis.evidenceIds])
        }
        if (operating(before) && after === 'inactive' && causeRefs.length
          && current.currentRoles.some((role) => role.roleHistoryRef === byeong && operating(role.currentFunction))) {
          add('strengthens_byeong', byeong, [...refs, ...basis.evidenceIds])
        }
      }
    }
    if (assignment.role === '용신' && after === 'inactive' && before !== 'inactive' && role.currentState === 'stopped') {
      add('attacks_yongshen', role.roleHistoryRef, refs)
    }
  }
  for (const { fact, actual } of paths) {
    if (fact.source.id !== luck.id || !operating(actual.function)) continue
    const yong = pattern.effectiveManifestedYongShen.some(({ entityId }) => entityId === fact.target.id)
    if (yong && actual.direction === 'unfavorable') add('attacks_yongshen', fact.target.id, [fact.id])
    if (actual.ruleId === 'EX-047') {
      for (const damage of paths.filter(({ fact: adverse, actual: activity }) => adverse.source.id === fact.target.id
        && adverse.target.tenGod === '食神' && adverse.action === 'control' && operating(activity.function))) {
        if (pattern.effectiveManifestedYongShen.some(({ entityId }) => entityId === damage.fact.target.id)) {
          add('protects_yongshen', damage.fact.target.id, [fact.id, damage.fact.id])
        }
      }
    }
  }

  for (const root of current.rootStates) {
    const previous = parent.rootStates.find(({ entityId }) => entityId === root.entityId)
    if (previous && previous.state !== root.state) add('changes_root_state', root.entityId, [...root.factIds, ...root.formationIds])
  }
  const formationKey = ({ kind, elementStem, participants }: EffectState['formationFacts'][number]) =>
    JSON.stringify([kind, elementStem, [...participants].sort()])
  const before = new Set(parent.formationFacts.map(formationKey))
  const after = new Set(current.formationFacts.map(formationKey))
  for (const fact of current.formationFacts.filter((fact) => !before.has(formationKey(fact)))) {
    add('changes_formation', fact.id, [fact.id])
  }
  for (const fact of parent.formationFacts.filter((fact) => !after.has(formationKey(fact)))) {
    add('changes_formation', fact.id, [fact.id])
  }
  if (parent.capacity && current.capacity && parent.capacity.state !== current.capacity.state) {
    add('changes_capacity', luck.id, [...parent.capacity.evidenceIds, ...current.capacity.evidenceIds])
  }
  return effects
}
