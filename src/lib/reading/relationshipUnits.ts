import type { RelationshipOutcomeFact } from '../outcome'
import type { UnitRoute } from './chapterRegistry'
import { bounds, withinPeriod, type RoutedUnits } from './semanticUnit'

export function collectRelationshipUnits(facts: readonly RelationshipOutcomeFact[],
  referenceTime: string | undefined, out: RoutedUnits) {
  for (const fact of facts) {
    if (fact.lifecycle !== 'active' && fact.lifecycle !== 'reduced') continue
    if (fact.scope === 'natal') {
      if (!fact.currentlyEffective) continue
    } else {
      if (!referenceTime || !fact.period) continue
      const isCurrent = fact.currentlyEffective && fact.temporalStatus === 'current' && withinPeriod(referenceTime, fact.period)
      const interval = bounds(fact.period)
      const isFuture = !fact.currentlyEffective && fact.temporalStatus === 'future' && interval
        && Date.parse(referenceTime) < Date.parse(interval[0]) && Date.parse(interval[0]) < Date.parse(interval[1])
      if (!isCurrent && !isFuture) continue
    }
    const contextIds = [fact.id, ...fact.sourceRelationIds]
    const timing: UnitRoute[] = fact.scope === 'month'
      ? [{ chapterId: 'CH-09', role: 'context', contextIds }, { chapterId: 'CH-10', role: 'timing', contextIds }]
      : fact.scope === 'sewoon' ? [{ chapterId: 'CH-09', role: 'timing', contextIds }]
        : fact.scope === 'daewoon' && 'result' in fact ? [{ chapterId: 'CH-08', role: 'timing', contextIds }] : []
    out.add({
      topic: 'relationship', scope: fact.scope, certainty: fact.certainty,
      sourceStatus: fact.temporalStatus, lifecycle: fact.lifecycle,
      ...('currentFunction' in fact && { currentFunction: fact.currentFunction }),
      meaningRef: { producer: 'outcome', kind: 'outcome_fact', recordId: fact.id, scopeId: fact.scopeId },
      period: fact.period,
      sourceFactIds: [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds],
      sourceRoleIds: fact.sourceRoleIds, sourceEffectIds: fact.sourceLuckEffectIds, evidenceIds: fact.provenance,
    }, { chapterId: 'CH-06', role: 'conclusion' }, ...timing)
  }
}
