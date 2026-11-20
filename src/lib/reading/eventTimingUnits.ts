import type { EventTimingFact } from '../eventTiming/types'
import type { UnitRoute } from './chapterRegistry'
import { bounds, withinPeriod, type RoutedUnits } from './semanticUnit'

export function collectEventTimingUnits(facts: readonly EventTimingFact[], referenceTime: string | undefined, out: RoutedUnits) {
  for (const fact of facts) {
    if (!referenceTime || !fact.period || fact.temporalStatus === 'expired' || fact.currentLifecycle === 'expired') continue
    const period = bounds(fact.period)
    const current = fact.temporalStatus === 'current' && fact.currentlyEffective && withinPeriod(referenceTime, fact.period)
    const future = fact.temporalStatus === 'future' && !fact.currentlyEffective && period
      && Date.parse(referenceTime) < Date.parse(period[0]) && Date.parse(period[0]) < Date.parse(period[1])
    if (!current && !future) continue
    const contextIds = [fact.id, ...fact.sourceEvidenceIds]
    const timing: UnitRoute[] = fact.scope === 'daewoon'
      ? [{ chapterId: 'CH-08', role: 'conclusion' }]
      : fact.scope === 'sewoon' ? [{ chapterId: 'CH-09', role: 'conclusion' }]
        : [{ chapterId: 'CH-10', role: 'conclusion' }, { chapterId: 'CH-09', role: 'context', contextIds }]
    const conclusion = timing[0]
    const repeats = timing.slice(1).map(route => ({ ...route, contextIds }))
    out.add({
      topic: 'event_timing', scope: fact.scope, certainty: fact.certainty,
      sourceStatus: fact.temporalStatus, lifecycle: fact.currentLifecycle,
      eventType: fact.eventType, eventDirection: fact.direction,
      meaningRef: { producer: 'event_timing', kind: 'event_timing_fact', recordId: fact.id, scopeId: fact.scopeId },
      period: fact.period,
      sourceFactIds: [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceOutcomeIds, ...fact.sourceEvidenceIds],
      sourceRoleIds: fact.sourceRoleIds, sourceEffectIds: fact.sourceLuckEffectIds, evidenceIds: fact.provenance,
    }, conclusion, ...repeats)
  }
}
