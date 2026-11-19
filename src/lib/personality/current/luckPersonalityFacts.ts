import { canonicalIds, compareId, createFactStore, TEN_GOD_BASE_FIELDS, TEN_GOD_INNER_FIELDS, TEN_GOD_OUTWARD_FIELDS } from '../facts/personalityFacts'
import { TEN_GOD_PROFILES } from '../knowledge/tenGodProfiles'
import { TEN_GOD_TO_PERSONALITY_ID, type PersonalityFact, type PersonalityTraitType } from '../types'
import type { CurrentPersonalityOrigin, LuckPersonalityScope, PersonalityEffectHistory, PersonalityPeriod, PersonalityStructuralScope } from './types'

export const factKey = (mode: 'outward' | 'inner', fact: Pick<PersonalityFact, 'tenGod' | 'traitType' | 'trait'>) =>
  JSON.stringify([mode, fact.tenGod, fact.traitType, fact.trait])

export function natalMode(fact: PersonalityFact): 'outward' | 'inner' | undefined {
  if (fact.sourceType !== 'ten_god') return undefined
  if (fact.sourcePosition?.endsWith('_stem')) return 'outward'
  if (fact.sourcePosition !== 'year_branch' && fact.sourcePosition?.endsWith('_branch')) return 'inner'
  return undefined
}

export function createLuckExpressions(natalFacts: readonly PersonalityFact[], chain: readonly PersonalityStructuralScope[]) {
  const natalMatches = new Map<string, PersonalityFact>()
  for (const fact of [...natalFacts].sort((a, b) => compareId(a.id, b.id))) {
    const mode = natalMode(fact)
    if (mode && !natalMatches.has(factKey(mode, fact))) natalMatches.set(factKey(mode, fact), fact)
  }
  const store = createFactStore()
  const temporary = new Map<string, PersonalityFact>()
  const modes = new Map<string, 'outward' | 'inner'>()
  const origins = new Map<string, CurrentPersonalityOrigin[]>()
  const events: PersonalityEffectHistory[] = []
  const selected = chain[chain.length - 1]

  for (const scope of chain) {
    if (scope.scope === 'natal' || !scope.period) continue
    const period: PersonalityPeriod = scope.period
    const originScope: LuckPersonalityScope = scope.scope
    const occurrenceGroups = new Map<string, { mode: 'outward' | 'inner'; entityId: string; factSources: Map<string, Set<string>> }>()
    for (const occurrence of scope.occurrences) {
      const tenGod = TEN_GOD_TO_PERSONALITY_ID[occurrence.tenGod]
      const profile = TEN_GOD_PROFILES[tenGod]
      const groupKey = JSON.stringify([occurrence.mode, occurrence.entityId])
      const group = occurrenceGroups.get(groupKey) ?? {
        mode: occurrence.mode, entityId: occurrence.entityId, factSources: new Map<string, Set<string>>(),
      }
      occurrenceGroups.set(groupKey, group)
      const fields = {
        ...TEN_GOD_BASE_FIELDS, ...(occurrence.mode === 'outward' ? TEN_GOD_OUTWARD_FIELDS : TEN_GOD_INNER_FIELDS),
      }
      for (const [field, traitType] of Object.entries(fields) as [keyof typeof fields, PersonalityTraitType][]) {
        for (const trait of profile[field]) {
          const key = factKey(occurrence.mode, { tenGod, traitType, trait })
          const existing = natalMatches.get(key)
          const id = existing?.id ?? `fact:current:${encodeURIComponent(key)}`
          const witnesses = group.factSources.get(id) ?? new Set<string>()
          occurrence.sourceIds.forEach(ref => witnesses.add(ref))
          group.factSources.set(id, witnesses)
          if (existing) continue
          modes.set(id, occurrence.mode)
          const provenanceId = store.registerEvidence('ten_god', tenGod, field, profile.evidenceNotes)
          const previous = temporary.get(id)
          temporary.set(id, {
            id, sourceType: 'ten_god', tenGod, trait, traitType, status: 'contextual', occurrenceIds: [],
            provenanceIds: canonicalIds([...(previous?.provenanceIds ?? []), provenanceId]),
          })
        }
      }
    }

    for (const group of [...occurrenceGroups.values()].sort((a, b) => compareId(a.mode, b.mode) || compareId(a.entityId, b.entityId))) {
      if (!group.factSources.size) continue
      const id = `effect:personality:temporary:${JSON.stringify([originScope, period.periodId, period.start, period.end, group.mode, group.entityId])}`
      const origin: Omit<CurrentPersonalityOrigin, 'sourceLuckFactIds'> = {
        originScope, originScopeId: scope.id, originPeriod: { ...period }, originEffectId: id,
        inherited: scope.id !== selected.id,
      }
      const factIds = canonicalIds(group.factSources.keys())
      for (const factId of factIds) {
        const sourceLuckFactIds = canonicalIds(group.factSources.get(factId) ?? [])
        origins.set(factId, [...(origins.get(factId) ?? []), { ...origin, sourceLuckFactIds }])
      }
      events.push({
        id, type: 'temporary_ten_god_expression', originScope, originScopeId: scope.id, originPeriod: { ...period },
        currentlyEffective: true, expired: false, inherited: origin.inherited, sourceIds: canonicalIds([...group.factSources.values()].flatMap(ids => [...ids])), factIds,
      })
    }
  }
  return { temporary, modes, origins, events, provenance: [...store.provenance.values()] }
}
