import type { TenGod } from '../dayRelationships'
import { calculateTenGod } from '../dayRelationships'
import type { LuckScopeState } from '../judgment/core/luckScope'
import { recordId, sortedUnique } from '../judgment/producers/shared'
import type { NatalPersonalityResult, NatalTenGodOccurrence } from '../personality/types'

export const isResource = (tenGod: TenGod) => tenGod === '印綬' || tenGod === '偏印'

export interface ResourceDominanceFact {
  readonly id: string
  readonly sourcePerson: string
  readonly scope: 'natal'
  readonly scopeId?: string
  readonly dayMaster: NatalPersonalityResult['dayStem']
  readonly certainty: 'confirmed' | 'not_confirmed' | 'deferred'
  readonly evidencePath?: 'branch_layer_dominant' | 'month_resource_reinforced'
  readonly branchPositions: readonly NatalTenGodOccurrence['position'][]
  readonly occurrenceIds: readonly string[]
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceJudgmentFactIds: readonly string[]
  readonly stemFactIds: readonly string[]
  readonly formationFactIds: readonly string[]
}

/** Master 11 RD-01/RD-02. Consumes natal facts without resolving generic prominence. */
export function buildResourceDominanceFact(sourcePerson: string, personality: NatalPersonalityResult,
  judgment?: LuckScopeState): ResourceDominanceFact {
  if (judgment && judgment.scope !== 'natal') throw new TypeError('Resource dominance requires natal Judgment')

  const mains = personality.occurrences.filter(occurrence => occurrence.hiddenStemRole === 'main')
  const resourceMains = mains.filter(occurrence => isResource(occurrence.canonicalTenGod))
  const monthResource = resourceMains.some(occurrence => occurrence.position === 'month_branch')
  // Unknown positions must be allowed to count against a strict majority.
  const branchDominant = resourceMains.length > 4 - resourceMains.length
  const stemFactIds: string[] = []
  const rootFactIds: string[] = []
  const formationFactIds: string[] = []
  const stemOccurrences = new Set<string>()
  let rootedReinforcement = false
  let unresolvedReinforcement = false

  if (monthResource && !branchDominant) {
    const candidates = personality.occurrences.filter(occurrence =>
      !occurrence.hiddenStemRole && isResource(occurrence.canonicalTenGod))
    for (const candidate of candidates) {
      // Each Resource stem generates the day master in the canonical stem relation facts.
      const position = candidate.position === 'hour_stem' ? 'time' : candidate.position.split('_')[0]
      const path = judgment?.stemFacts.find(fact => fact.action === 'generate' && fact.target.dayMaster
        && fact.source.position === position && fact.source.stem === candidate.stem && isResource(fact.source.tenGod))
      if (!path || !judgment) {
        unresolvedReinforcement = true
        continue
      }
      const root = judgment.rootStates.find(state => state.entityId === path.source.id)
      const runtime = judgment.runtime.find(state => state.entityId === path.source.id)
      if (root?.state === 'absent' || runtime?.state === 'stopped') continue
      if (!root || !runtime || judgment.runtimeStatus !== 'resolved') {
        unresolvedReinforcement = true
        continue
      }
      if (!root.factIds.length) continue
      stemOccurrences.add(candidate.id)
      stemFactIds.push(path.id)
      rootFactIds.push(...root.factIds)
      // A weakened stem's root is evidence. Its actual operating function determines sufficiency.
      const actual = judgment.actualFunctions.find(fact => fact.relationFactId === path.id)
      if (runtime.state === 'active' || actual?.structuralEffect?.currentlyEffective) {
        rootedReinforcement = true
      } else if (!actual || actual.function === 'deferred') {
        unresolvedReinforcement = true
      }
    }
    for (const formation of judgment?.formationFacts ?? []) {
      if (isResource(calculateTenGod(personality.dayStem, formation.elementStem))) formationFactIds.push(formation.id)
    }
    unresolvedReinforcement ||= !judgment
  }

  const reinforcedMonth = monthResource && (resourceMains.length > 1 || rootedReinforcement || formationFactIds.length > 0)
  const evidencePath = branchDominant ? 'branch_layer_dominant' : reinforcedMonth ? 'month_resource_reinforced' : undefined
  const certainty = evidencePath ? 'confirmed' : mains.length < 4 || unresolvedReinforcement ? 'deferred' : 'not_confirmed'
  const occurrenceIds = sortedUnique([...mains.map(occurrence => occurrence.id), ...stemOccurrences])
  const usedOccurrences = new Set(occurrenceIds)
  return {
    id: recordId('resource-dominance', [sourcePerson, judgment?.id ?? personality.dayPillar]),
    sourcePerson, scope: 'natal', ...(judgment && { scopeId: judgment.id }),
    dayMaster: personality.dayStem, certainty, ...(evidencePath && { evidencePath }),
    branchPositions: resourceMains.map(occurrence => occurrence.position),
    occurrenceIds,
    sourcePersonalityFactIds: sortedUnique(personality.facts.filter(fact =>
      fact.occurrenceIds.some(id => usedOccurrences.has(id))).map(fact => fact.id)),
    sourceJudgmentFactIds: sortedUnique([...(judgment ? [judgment.id] : []), ...stemFactIds, ...rootFactIds, ...formationFactIds]),
    stemFactIds: sortedUnique(stemFactIds),
    formationFactIds: sortedUnique(formationFactIds),
  }
}
