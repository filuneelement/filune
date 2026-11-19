import { canonicalIds, compareId, type createFactStore } from '../facts/personalityFacts'
import type { DayPillarProfile, PersonalityConflict, PersonalityFact, PositionExpression } from '../types'

const OUTWARD_INNER_RULE = 'src/docs/rules/master/11-personality-master.md#L410-L422'

export function addDayPillarConflicts(profile: DayPillarProfile, store: ReturnType<typeof createFactStore>): PersonalityConflict[] {
  return profile.internalConflict.map(conflict => {
    const provenanceId = store.registerEvidence('day_pillar', profile.pillar, 'internalConflict', profile.evidenceNotes)
    const factContext = { sourceType: 'day_pillar', dayPillar: profile.pillar, status: 'active', occurrenceIds: [] as string[] } as const
    // Keep both sides and the source's stated tension independently traceable.
    const factIds = [conflict.sourceA, conflict.sourceB, conflict.tension]
      .map(trait => store.add(factContext, 'internal_conflict', trait, [provenanceId]))
    for (const expression of conflict.possibleExpression) {
      factIds.push(store.add(factContext, 'expression', expression, [provenanceId]))
    }
    return {
      id: `conflict:day_pillar:${profile.pillar}:${encodeURIComponent(conflict.tension)}`,
      factIds: canonicalIds(factIds),
      conflictType: 'source_explicit',
      resolution: 'coexist',
      explanationEvidence: [provenanceId],
    }
  })
}

export function collectPositionConflicts(
  facts: readonly PersonalityFact[], expressions: readonly PositionExpression[],
): PersonalityConflict[] {
  const modes = new Map(expressions.map(item => [item.position, item.expressionMode]))
  // The master gives 傷官 expression versus 印 review as a contextual contrast.
  // Its relative prominence is unavailable, so both linked style candidates stay contextual.
  const outward = facts.filter(fact =>
    fact.tenGod === '傷官' && fact.status === 'contextual' && fact.traitType === 'social' && fact.trait === '예리한 표현'
    && fact.sourcePosition && fact.sourcePosition !== 'day_stem' && modes.get(fact.sourcePosition) === 'outward')
  const inner = facts.filter(fact =>
    (fact.tenGod === '正印' || fact.tenGod === '偏印') && fact.status === 'contextual' && fact.traitType === 'decision'
    && (fact.sourcePosition === 'month_branch' || fact.sourcePosition === 'day_branch' || fact.sourcePosition === 'hour_branch'))

  return outward.flatMap(external => inner.map((internal): PersonalityConflict => ({
    id: `conflict:outward_vs_inner:${external.id}:${internal.id}`,
    factIds: canonicalIds([external.id, internal.id]),
    conflictType: 'outward_vs_inner',
    resolution: 'context_split',
    explanationEvidence: canonicalIds([OUTWARD_INNER_RULE, ...external.provenanceIds, ...internal.provenanceIds]),
  }))).sort((a, b) => compareId(a.id, b.id))
}
