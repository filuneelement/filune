import type {
  DayPillarTraits, DayStemTraits, PersonalityEvidence, PersonalityFact, PersonalityProvenance,
  PersonalityTraitType, TenGodTraits,
} from '../types'

export const DAY_STEM_FIELDS = {
  coreNature: 'core',
  coreDrive: 'core',
  strengths: 'strength',
  shadowTraits: 'shadow',
  decisionStyle: 'decision',
  socialExpression: 'social',
  innerExpression: 'inner',
  stressResponse: 'stress',
  growthDirection: 'growth',
} as const satisfies Record<keyof DayStemTraits, PersonalityTraitType>

export const DAY_PILLAR_FIELDS = {
  corePersonality: 'core',
  decisionStyle: 'decision',
  interpersonalStyle: 'interpersonal',
  strengths: 'strength',
  shadowPatterns: 'shadow',
  expressionPattern: 'expression',
  growthDirection: 'growth',
} as const satisfies Partial<Record<keyof DayPillarTraits, PersonalityTraitType>>

export const TEN_GOD_BASE_FIELDS = {
  coreDrive: 'core',
  ordinaryExpression: 'expression',
} as const satisfies Partial<Record<keyof TenGodTraits, PersonalityTraitType>>

export const TEN_GOD_SHARED_CONTEXT_FIELDS = {
  coreStrengths: 'strength',
  productiveExpression: 'strength',
  relationshipStyle: 'interpersonal',
} as const satisfies Partial<Record<keyof TenGodTraits, PersonalityTraitType>>

export const TEN_GOD_OUTWARD_FIELDS = {
  socialExpression: 'social',
  workStyle: 'work',
} as const satisfies Partial<Record<keyof TenGodTraits, PersonalityTraitType>>

export const TEN_GOD_INNER_FIELDS = {
  innerExpression: 'inner',
  decisionStyle: 'decision',
  stressResponse: 'stress',
} as const satisfies Partial<Record<keyof TenGodTraits, PersonalityTraitType>>

// The caller must match an evaluated condition and an approved interpretation.
// Presence, count, or reduced expression alone never selects one of these fields.
export const TEN_GOD_CONDITION_FIELDS = {
  excessive: 'excessiveExpression',
  deficient: 'deficientExpression',
  caution: 'cautionPatterns',
} as const satisfies Record<string, keyof TenGodTraits>

export function supportedConditionTrait(
  profile: TenGodTraits & { evidenceNotes: readonly PersonalityEvidence[] },
  condition: keyof typeof TEN_GOD_CONDITION_FIELDS,
  trait: string,
) {
  const field = TEN_GOD_CONDITION_FIELDS[condition]
  if (!profile[field].includes(trait)) return []
  return canonicalIds(profile.evidenceNotes.flatMap(note => note.fields.includes(field) && note.sourceRef
    ? [note.sourceRef, ...(note.corroboratingRefs ?? [])] : []))
}

type FactContext = Omit<PersonalityFact, 'id' | 'trait' | 'traitType' | 'provenanceIds'>

export function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function canonicalIds(ids: Iterable<string>): string[] {
  return [...new Set(ids)].sort(compareId)
}

export function createFactStore() {
  const facts = new Map<string, PersonalityFact>()
  const provenance = new Map<string, PersonalityProvenance>()

  function registerEvidence(
    sourceType: PersonalityEvidence['sourceType'], profileId: string,
    field: string, notes: readonly PersonalityEvidence[],
  ): string {
    const id = `knowledge:${sourceType}:${profileId}:${field}`
    if (!provenance.has(id)) {
      const sourceRefs = canonicalIds(notes
        .flatMap(note => note.sourceRef && note.fields.includes(field)
          ? [note.sourceRef, ...(note.corroboratingRefs ?? [])] : []))
      provenance.set(id, { id, sourceType, profileId, field, sourceRefs })
    }
    return id
  }

  function add(context: FactContext, traitType: PersonalityTraitType, trait: string, provenanceIds: readonly string[]): string {
    const { sourceType, sourcePosition, tenGod, dayPillar, status } = context
    const id = `fact:${[sourceType, sourcePosition ?? '', tenGod ?? '', dayPillar ?? '', traitType, status, encodeURIComponent(trait)].join(':')}`
    const existing = facts.get(id)
    if (existing) {
      existing.provenanceIds = canonicalIds([...existing.provenanceIds, ...provenanceIds])
      existing.occurrenceIds = canonicalIds([...existing.occurrenceIds, ...context.occurrenceIds])
    } else {
      facts.set(id, { ...context, id, trait, traitType, provenanceIds: canonicalIds(provenanceIds) })
    }
    return id
  }

  function addFields<Field extends string>(
    profile: Record<NoInfer<Field>, string[]> & { evidenceNotes: readonly PersonalityEvidence[] },
    profileId: string,
    fields: Record<Field, PersonalityTraitType>,
    context: FactContext,
    positionProvenance: readonly string[] = [],
  ): void {
    for (const field of Object.keys(fields) as Field[]) {
      for (const trait of profile[field]) {
        const evidenceId = registerEvidence(context.sourceType, profileId, field, profile.evidenceNotes)
        add(context, fields[field], trait, [evidenceId, ...positionProvenance])
      }
    }
  }

  return { facts, provenance, registerEvidence, add, addFields }
}
