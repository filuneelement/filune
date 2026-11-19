import type { Validity } from '../contracts'
import { recordId } from '../producers/shared'
import type { CombinationHistory } from './combineHistory'
import type { EffectState, ScopedPath } from './luckEffects'
import { luckOriginKey, luckPeriodStatus } from './luckValidity'
import type { PolicyByeongPath } from './patternRoles'
import type { RoleEngineState } from './roleEngine'
import { structuralPathKey } from './structuralEffect'
import type { LuckEffect, LuckEffectEvent, LuckEffectState } from './types'

type ProjectionContext = EffectState & {
  paths: readonly ScopedPath[]
  roles: RoleEngineState['currentRoles']
  byeong: readonly PolicyByeongPath[]
  combinations: readonly CombinationHistory[]
}

const live = ({ actual }: ScopedPath) => actual.function === 'operating' || actual.function === 'reduced'
const formationKey = ({ kind, elementStem, participants }: EffectState['formationFacts'][number]) =>
  JSON.stringify([kind, elementStem, [...participants].sort()])

function outcome(effect: LuckEffect, state: ProjectionContext, origin?: LuckEffectEvent): string | null {
  const { effectType, subjectId, sourceLuckEntityId } = effect
  const { patternContext, conditionalByeong, currentRoles, paths, roles, byeong, combinations } = state
  const effectiveManifestation = (id: string) => patternContext.effectiveManifestedYongShen.some((item) => item.entityId === id)
  const combination = combinations.find(({ relation }) =>
    origin?.sourceRelationFactId === relation.id || effect.evidenceRefs.includes(relation.id))
  if (origin?.combinationKey && !combinations.some(({ relation }) => structuralPathKey(relation) === origin.combinationKey)) return null
  if (origin?.requiresManifestation && !effectiveManifestation(sourceLuckEntityId)) return null
  if (origin?.requiredPath && !paths.some((path) => structuralPathKey(path.fact) === origin.requiredPath && live(path))) return null
  switch (effectType) {
    case 'manifests_yongshen': return effectiveManifestation(subjectId) ? 'manifested' : null
    case 'changes_pattern_mode': return patternContext.patternMode
    case 'changes_root_state': return state.rootStates.find(({ entityId }) => entityId === subjectId)?.state ?? null
    case 'changes_capacity': return state.capacity?.state ?? null
    case 'changes_formation': return null // Formation additions and removals are projected using their participant key.
    case 'activates_sangshen_function':
    case 'weakens_sangshen': {
      const role = roles.find(({ roleId }) => roleId === subjectId)
      const legacy = currentRoles.find(({ roleHistoryRef }) => roleHistoryRef === subjectId)
      const fn = (role ?? legacy)?.currentFunction
      if (effectType === 'activates_sangshen_function') return fn === 'operating' || fn === 'reduced' ? 'active' : null
      return fn === 'reduced' || fn === 'inactive' && role?.currentState !== 'protective_standby' ? fn : null
    }
    case 'activates_byeong':
    case 'relieves_byeong':
    case 'weakens_byeong':
    case 'strengthens_byeong': {
      const policy = byeong.find(({ id }) => id === subjectId)
      if (policy) return policy.currentState
      const conditional = conditionalByeong.find(({ sourceEntityId }) => sourceEntityId === subjectId)
      if (conditional) {
        const trigger = paths.find(({ fact }) => fact.id === conditional.triggerRelationFactId)
        const functionState = effectType === 'activates_byeong' ? conditional.currentState : conditional.currentFunction
        return trigger ? JSON.stringify([functionState, structuralPathKey(trigger.fact)]) : conditional.currentState
      }
      return currentRoles.find(({ roleHistoryRef }) => roleHistoryRef === subjectId)?.currentFunction ?? null
    }
    case 'attacks_yongshen':
    case 'protects_yongshen': {
      if (combination) return structuralPathKey(combination.relation)
      if (origin?.combinationKey) return origin.combinationKey
      const role = currentRoles.find(({ roleHistoryRef }) => roleHistoryRef === subjectId)
      if (role?.currentState === 'stopped') return 'stopped'
      const witness = paths.find((path) => {
        const { fact, actual } = path
        if (fact.source.id !== sourceLuckEntityId || !live(path)) return false
        if (origin ? origin.outcome !== structuralPathKey(fact) : !effect.evidenceRefs.includes(fact.id)) return false
        return effectType === 'protects_yongshen' ? actual.direction === 'favorable'
          : fact.target.id === subjectId && (actual.direction === 'unfavorable' || actual.direction === 'unfavorable_candidate')
      })
      return witness ? structuralPathKey(witness.fact) : null
    }
  }
}

export function recordLuckEffects(effects: readonly LuckEffect[], scopeId: string, validity: Validity,
  state: ProjectionContext, parentFormations: EffectState['formationFacts']): LuckEffectEvent[] {
  const events = new Map<string, LuckEffectEvent>()
  for (const effect of effects) {
    const formation = state.formationFacts.find(({ id }) => id === effect.subjectId)
    const formerFormation = parentFormations.find(({ id }) => id === effect.subjectId)
    const identifiedFormation = formation ?? formerFormation
    const subjectKey = effect.effectType === 'changes_pattern_mode' ? 'pattern-mode'
      : identifiedFormation ? formationKey(identifiedFormation) : effect.subjectId
    const id = recordId('luck-effect', [luckOriginKey(effect.scope, validity), effect.effectType, effect.sourceLuckEntityId, subjectKey])
    const evidenceRefs = [...new Set([...(events.get(id)?.evidenceRefs ?? []), ...effect.evidenceRefs])]
    const combination = state.combinations.find(({ relation }) => evidenceRefs.includes(relation.id))
    const relation = state.paths.find(({ fact }) => evidenceRefs.includes(fact.id) && fact.source.id === effect.sourceLuckEntityId)
    const guard = effect.effectType === 'activates_sangshen_function' ? state.paths.find((path) =>
      evidenceRefs.includes(path.fact.id) && path.actual.policyId === 'OFF-02' && live(path)) : undefined
    const manifestation = effect.effectType === 'changes_pattern_mode'
      && state.patternContext.effectiveManifestedYongShen.some(({ entityId }) => entityId === effect.sourceLuckEntityId)
    const effectOutcome = effect.effectType === 'changes_formation'
      ? formation ? JSON.stringify([true, formationKey(formation)])
        : formerFormation ? JSON.stringify([false, formationKey(formerFormation)]) : null
      : outcome({ ...effect, evidenceRefs }, state)
    events.set(id, {
      ...effect, evidenceRefs, id, originScope: effect.scope, originScopeId: scopeId, originPeriod: validity, outcome: effectOutcome,
      ...(combination || relation ? { sourceRelationFactId: combination?.relation.id ?? relation?.fact.id } : {}),
      ...(combination?.formula ? { sourceFormulaFactId: combination.formula.id } : {}),
      ...(combination ? { combinationKey: structuralPathKey(combination.relation) } : {}),
      ...(guard ? { requiredPath: structuralPathKey(guard.fact) } : {}),
      ...(manifestation ? { requiresManifestation: true } : {}),
    })
  }
  return [...events.values()]
}

export function projectLuckEffects(history: readonly LuckEffectEvent[], scopeKey: string,
  referenceTime: string | undefined, activeLuckSources: ReadonlyMap<string, string>, state: ProjectionContext): LuckEffectState[] {
  const formations = new Set(state.formationFacts.map(formationKey))
  return history.map((event) => {
    const { originScope, originScopeId, originPeriod } = event
    const period = luckPeriodStatus(originPeriod, referenceTime)
    const originKey = luckOriginKey(originScope, originPeriod)
    const inChain = activeLuckSources.has(originKey)
    let supported = false
    if (activeLuckSources.get(originKey) === event.sourceLuckEntityId && period === 'effective' && event.outcome !== null) {
      if (event.effectType === 'changes_formation') {
        const [formed, key]: [boolean, string] = JSON.parse(event.outcome)
        supported = formations.has(key) === formed
      } else {
        supported = outcome(event, state, event) === event.outcome
      }
    }
    return { event, originScope, originScopeId, originPeriod, inherited: originKey !== scopeKey,
      currentlyEffective: supported, expired: period === 'expired' || period === 'effective' && inChain && !supported }
  })
}
