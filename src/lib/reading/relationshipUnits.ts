import type { RelationshipOutcomeFact } from '../outcome'
import type { UnitRoute } from './chapterRegistry'
import { bounds, withinPeriod, type RoutedUnits, type UnitInput } from './semanticUnit'
import { evaluateOutcomePublicationEligibility, type PublicationConditionEvidence } from './publicationEligibility'

export function collectRelationshipUnits(facts: readonly RelationshipOutcomeFact[],
  referenceTime: string | undefined, out: RoutedUnits,
  conditions: Readonly<Record<string, PublicationConditionEvidence>> = {}) {
  for (const fact of facts) {
    const publication = evaluateOutcomePublicationEligibility(fact, conditions[fact.id])
    if (!publication.publishable) continue
    if (fact.scope === 'natal') {
      if (fact.temporalStatus !== 'baseline') continue
    } else {
      if (!referenceTime || !fact.period) continue
      const isCurrent = fact.currentlyEffective && fact.temporalStatus === 'current' && withinPeriod(referenceTime, fact.period)
      const interval = bounds(fact.period)
      if (!isCurrent || !interval) continue
    }
    const contextIds = [fact.id, ...fact.sourceRelationIds]
    const timing: UnitRoute[] = fact.scope === 'month'
      ? [{ chapterId: 'CH-09', role: 'context', contextIds }, { chapterId: 'CH-10', role: 'timing', contextIds }]
      : fact.scope === 'sewoon' ? [{ chapterId: 'CH-09', role: 'timing', contextIds }]
        : fact.scope === 'daewoon' && 'result' in fact ? [{ chapterId: 'CH-08', role: 'timing', contextIds }] : []
    out.add(relationshipUnitInput(fact, publication), { chapterId: 'CH-06', role: 'conclusion' }, ...timing)
  }
}

export function relationshipUnitInput(fact: RelationshipOutcomeFact,
  publication = evaluateOutcomePublicationEligibility(fact)): UnitInput {
  if (!publication.publishable) throw new TypeError(`Outcome is not publication-eligible: ${fact.id}`)
  return {
    topic: 'relationship', scope: fact.scope, certainty: fact.certainty,
    sourceStatus: fact.temporalStatus, lifecycle: fact.lifecycle,
    publicationQualification: { kind: publication.qualification, evidenceIds: publication.evidenceIds },
    ...('currentFunction' in fact && { currentFunction: fact.currentFunction }),
    meaningRef: { producer: 'outcome', kind: 'outcome_fact', recordId: fact.id, scopeId: fact.scopeId },
    period: fact.period,
    sourceFactIds: [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds],
    sourceRoleIds: fact.sourceRoleIds, sourceEffectIds: fact.sourceLuckEffectIds, evidenceIds: fact.provenance,
  }
}
