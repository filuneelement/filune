import type { HealthOutcomeFact } from '../outcome'
import type { UnitRoute } from './chapterRegistry'
import { bounds, withinPeriod, type RoutedUnits } from './semanticUnit'

export function collectHealthUnits(facts: readonly HealthOutcomeFact[], referenceTime: string | undefined, out: RoutedUnits) {
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
    out.add({
      topic: 'health', scope: fact.scope, certainty: fact.certainty,
      sourceStatus: fact.temporalStatus, lifecycle: fact.lifecycle,
      ...('direction' in fact && { direction: fact.direction, currentFunction: fact.currentFunction }),
      ...('lifeMeanings' in fact && { healthLifeMeanings: structuredClone(fact.lifeMeanings) }),
      meaningRef: { producer: 'outcome', kind: 'outcome_fact', recordId: fact.id, scopeId: fact.scopeId },
      period: fact.period,
      sourceFactIds: [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds,
        ...(fact.semanticType === 'traditional_body_correspondence' ? fact.provenance : [])],
      sourceRoleIds: fact.sourceRoleIds, sourceEffectIds: fact.sourceLuckEffectIds, evidenceIds: fact.provenance,
    }, { chapterId: 'CH-07', role: 'conclusion' }, ...timing)
  }
}
