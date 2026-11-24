import { moneyAxisFor, type MoneyOutcomeFact } from '../outcome'
import type { UnitRoute } from './chapterRegistry'
import { bounds, withinPeriod, type RoutedUnits, type UnitInput } from './semanticUnit'

export function collectMoneyUnits(facts: readonly MoneyOutcomeFact[], referenceTime: string | undefined, out: RoutedUnits) {
  for (const fact of facts) {
    if (fact.lifecycle !== 'active' && fact.lifecycle !== 'reduced') continue
    if (fact.scope === 'natal') {
      if (!fact.currentlyEffective || fact.temporalStatus !== 'baseline') continue
    } else {
      if (!fact.period || !referenceTime) continue
      const interval = bounds(fact.period)
      const current = fact.temporalStatus === 'current' && fact.currentlyEffective && withinPeriod(referenceTime, fact.period)
      const future = fact.temporalStatus === 'future' && !fact.currentlyEffective && interval
        && Date.parse(referenceTime) < Date.parse(interval[0]) && Date.parse(interval[0]) < Date.parse(interval[1])
      if (!current && !future) continue
    }
    const contextIds = [fact.id, ...fact.sourceRelationIds]
    const timing: UnitRoute[] = fact.scope === 'daewoon'
      ? [{ chapterId: 'CH-08', role: 'timing', contextIds }]
      : fact.scope === 'sewoon' ? [{ chapterId: 'CH-09', role: 'timing', contextIds }]
        : fact.scope === 'month'
          ? [{ chapterId: 'CH-09', role: 'context', contextIds }, { chapterId: 'CH-10', role: 'timing', contextIds }]
          : []
    out.add(moneyUnitInput(fact), { chapterId: 'CH-05', role: 'conclusion' }, ...timing)
  }
}

export function moneyUnitInput(fact: MoneyOutcomeFact): UnitInput {
  return {
    topic: 'money', scope: fact.scope, certainty: fact.certainty,
    sourceStatus: fact.temporalStatus, lifecycle: fact.lifecycle,
    direction: fact.direction, moneyAxis: moneyAxisFor(fact), moneyTargetId: fact.wealthEntityId,
    ...(fact.burdenPath && { moneyBurdenPath: fact.burdenPath }),
    meaningRef: { producer: 'outcome', kind: 'outcome_fact', recordId: fact.id, scopeId: fact.scopeId },
    period: fact.period,
    sourceFactIds: [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds],
    sourceRoleIds: fact.sourceRoleIds, sourceEffectIds: fact.sourceLuckEffectIds, evidenceIds: fact.provenance,
  }
}
