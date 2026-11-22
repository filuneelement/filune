import type { BirthInput } from '../canonical/types'
import { buildCompatibilityFacts, compatibilityPairIdentity } from '../compatibility/buildCompatibilityFacts'
import { assembleFinalCompatibility, type FinalCompatibilityInput } from '../compatibility/final/assembleFinalCompatibility'
import { assemblePersonalityPair, evaluateCompatibilityBirth } from '../compatibility/personalityFromBirth'
import { buildPairRelationshipTimeline, type RelationshipLifecycleInput } from '../compatibility/relationshipLifecycle'
import { buildStructuralCompatibility } from '../compatibility/structuralPolicy'
import type { CompatibilityPerson } from '../compatibility/types'
import { recordId } from '../judgment/producers/shared'
import { relationshipOutcomeFromReading } from '../outcome/relationship/fromJudgment'
import { birthReadingContext, collectEventScopes } from './readBirthChart'
import type { BirthReadingOptions } from './readBirthChart'

export interface BirthCompatibilityOptions {
  readonly monthlyWindowStart?: BirthReadingOptions['monthlyWindowStart']
  readonly userContext?: FinalCompatibilityInput['userContext']
}

type EvaluatedBirth = ReturnType<typeof evaluateCompatibilityBirth>

function crossChartPerson({ reading, person }: EvaluatedBirth): CompatibilityPerson {
  const [judgment] = reading.judgmentCore
  const known = new Set(judgment.directEntityIds)
  const chart: CompatibilityPerson['chart'] = Object.fromEntries((['year', 'month', 'day', 'time'] as const)
    .flatMap(position => {
      const pillar = reading.canonical.chart.pillars[position]
      if (pillar.status !== 'confirmed') return []
      const pointer = `/chart/pillars/${position}/value/ganZhi`
      const parts = (['stem', 'branch'] as const).flatMap(part => {
        const id = recordId('entity', [pointer, part])
        return known.has(id) ? [[part, { id, value: pillar.value[part] }]] : []
      })
      return [[position, Object.fromEntries(parts)]]
    }))
  return { id: person.id, chart, judgment }
}

function lifecyclePerson({ reading, person }: EvaluatedBirth): RelationshipLifecycleInput {
  const referenceTime = reading.canonical.context.referenceTime
  const judgment = {
    ...reading,
    luck: { ...reading.luck, monthlyWindow: 'monthlyWindow' in reading.luck ? reading.luck.monthlyWindow : undefined },
  }
  return { personId: person.id, gender: reading.canonical.birthInput.gender, natal: reading.judgmentCore[0],
    scopes: collectEventScopes(judgment, referenceTime), outcomes: relationshipOutcomeFromReading({ judgment }),
    expressions: person.currentScopes, referenceTime }
}

/** One independent reading per birth, followed by the existing Compatibility stages. */
export function readBirthCompatibility(
  first: { birth: BirthInput; executionId: string },
  second: { birth: BirthInput; executionId: string },
  referenceTime: string,
  options: BirthCompatibilityOptions = {},
) {
  compatibilityPairIdentity(first.executionId, second.executionId)
  const context = birthReadingContext(referenceTime)
  const a = evaluateCompatibilityBirth(first, context, options.monthlyWindowStart)
  const b = evaluateCompatibilityBirth(second, context, options.monthlyWindowStart)
  const crossChart = buildCompatibilityFacts(crossChartPerson(a), crossChartPerson(b))
  const structural = buildStructuralCompatibility(crossChart)
  const personality = assemblePersonalityPair(a.person, b.person)
  const relationshipLifecycle = buildPairRelationshipTimeline(lifecyclePerson(a), lifecyclePerson(b), {
    structural, personality: [...personality.natal.facts, ...personality.current.facts],
  })
  const final = assembleFinalCompatibility({
    personIds: [first.executionId, second.executionId], referenceTime: context.calculation.referenceTime,
    crossChart, structural, personality, relationshipLifecycle, userContext: options.userContext,
  })
  // Keep the existing C3 entry-point fields available to callers.
  return { ...final, people: personality.people, natal: personality.natal, current: personality.current }
}
