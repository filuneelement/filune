import { runInternalReading, type InternalReadingInput } from '../judgment/pipeline/internalReading'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import { buildNatalPersonality } from '../personality/natalPersonality'
import { buildCurrentResourceOutputExpression, buildNatalResourceOutputExpression } from '../reading/personalityResourceOutput'
import { buildPersonalityInteraction } from './personalityInteraction'

type BirthPerson = Pick<InternalReadingInput, 'birth' | 'executionId'>
type ReadingContext = Pick<InternalReadingInput, 'calculation' | 'natalInspectionPeriod' | 'sources'>

/** Evaluates one birth and projects the existing Personality result per effective scope. */
export function evaluateCompatibilityBirth({ birth, executionId }: BirthPerson, context: ReadingContext,
  monthlyWindowStart?: InternalReadingInput['monthlyWindowStart']) {
  const reading = runInternalReading({ ...context, birth, executionId, monthlyWindowStart })
  const [judgment] = reading.judgmentCore
  const personality = buildNatalPersonality(reading.canonical.chart)
  const natal = buildNatalResourceOutputExpression(personality, judgment, executionId)
  const at = context.calculation.referenceTime
  const currentScopes = reading.judgmentCore.flatMap(snapshot => {
    if (snapshot.scope === 'natal' || luckPeriodStatus(snapshot.validity, at) !== 'effective') return []
    const parent = reading.judgmentCore.find(candidate => candidate.id === snapshot.parentScopeId)
    return parent ? [buildCurrentResourceOutputExpression(natal, parent, snapshot, at)] : []
  })
  return { reading, person: { id: executionId, natal, current: currentScopes.at(-1), currentScopes } }
}

type Person = ReturnType<typeof evaluateCompatibilityBirth>['person']

export function assemblePersonalityPair(a: Person, b: Person) {
  return { ...buildPersonalityInteraction(a, b), people: a.id < b.id ? [a, b] : [b, a] }
}

export function buildPersonalityInteractionFromBirth(first: BirthPerson, second: BirthPerson, context: ReadingContext) {
  return assemblePersonalityPair(evaluateCompatibilityBirth(first, context).person, evaluateCompatibilityBirth(second, context).person)
}
