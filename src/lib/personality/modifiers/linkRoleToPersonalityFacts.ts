import { TEN_GOD_TO_PERSONALITY_ID, type NatalPersonalityResult, type NatalStructuralActor } from '../types'

export function linkRoleToPersonalityFacts(base: NatalPersonalityResult, actor: NatalStructuralActor) {
  if (actor.position === 'day_stem') {
    return { facts: [], code: actor.stem === base.dayStem ? 'NO_PERSONALITY_TRAIT_TARGET' : 'ROLE_PERSONALITY_LINK_MISMATCH' } as const
  }

  const position = base.occurrences.filter(item => item.position === actor.position)
  if (!position.length && base.unavailablePositions.includes(actor.position)) {
    return { facts: [], code: 'NO_PERSONALITY_TRAIT_TARGET' } as const
  }
  const occurrence = position.find(item => item.stem === actor.stem && item.canonicalTenGod === actor.tenGod
    && item.hiddenStemRole === actor.hiddenStemRole)
  if (!occurrence) return { facts: [], code: 'ROLE_PERSONALITY_LINK_MISMATCH' } as const

  const facts = base.facts.filter(fact => fact.sourceType === 'ten_god' && fact.sourcePosition === actor.position
    && fact.tenGod === TEN_GOD_TO_PERSONALITY_ID[actor.tenGod] && fact.occurrenceIds.includes(occurrence.id)
    && (fact.traitType === 'core' || fact.traitType === 'expression'))
  return { facts, code: facts.length ? undefined : 'NO_PERSONALITY_TRAIT_TARGET' } as const
}
