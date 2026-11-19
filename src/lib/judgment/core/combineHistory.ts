import { recordId } from '../producers/shared'
import type { Validity } from '../contracts'
import { luckOriginKey, luckPeriodStatus } from './luckValidity'
import { killingFormula } from './stems'
import type { resolveStemRuntime } from './stems'
import type { FormulaFact, Scope, StemRelationFact, StemRuntime } from './types'

type Combination = ReturnType<typeof resolveStemRuntime>['combinations'][number]
export type CombinationHistory = Combination & {
  originScope: Scope
  originScopeId: string
  relation: StemRelationFact
  formula: FormulaFact | null
  validity: Validity
}

export function recordCombinations(combinations: readonly Combination[], facts: readonly StemRelationFact[],
  scope: Scope, scopeId: string, patternContextId: string, validity: Validity): CombinationHistory[] {
  return combinations.map((event) => {
    const relation = facts.find((fact) => fact.action === 'combine' && matchesCombination(event, fact))
    if (!relation) throw new TypeError('Resolved combination must have a relation fact')
    const formulaType = killingFormula(relation, true)
    const formula = formulaType ? { id: recordId('p0-formula', [relation.id, formulaType]),
      formulaType, relationFactIds: [relation.id], patternContextId, validity } : null
    return { ...event, originScope: scope, originScopeId: scopeId, relation, formula, validity }
  })
}

export function matchesCombination(event: Combination, fact: StemRelationFact) {
  return event.participants.includes(fact.source.id) && event.participants.includes(fact.target.id)
}

export const combinationHistoryKey = (event: CombinationHistory) => JSON.stringify([
  event.originScope === 'natal' ? 'natal' : luckOriginKey(event.originScope, event.validity),
  event.effect, [...event.participants].sort(),
])

export function currentCombinationEffects(history: readonly CombinationHistory[], runtime: ReadonlyMap<string, StemRuntime>,
  scope: Scope, validity: Validity, referenceTime: string | undefined, current: readonly CombinationHistory[]) {
  const currentKeys = new Set(current.map(combinationHistoryKey))
  const scopeKey = luckOriginKey(scope, validity)
  return history.map((event) => {
    const periodStatus = event.originScope === 'natal' ? 'effective' : luckPeriodStatus(event.validity, referenceTime)
    return {
      originScope: event.originScope,
      originScopeId: event.originScopeId,
      originPeriod: event.validity,
      inherited: event.originScope === 'natal' ? scope !== 'natal' : luckOriginKey(event.originScope, event.validity) !== scopeKey,
      currentlyEffective: periodStatus === 'effective' && currentKeys.has(combinationHistoryKey(event))
        && event.participants.every((id) => runtime.get(id) === event.effect),
      expired: periodStatus === 'expired',
      sourceRelationFactId: event.relation.id,
      sourceFormulaFactId: event.formula?.id ?? null,
      participants: event.participants,
      effect: event.effect,
    }
  })
}
