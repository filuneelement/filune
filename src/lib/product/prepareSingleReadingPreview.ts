import type { BirthInput } from '../canonical/types'
import { runInternalReading } from '../judgment/pipeline/internalReading'
import { applyStructuralRoleModifiers, buildCurrentPersonality, buildNatalPersonality } from '../personality'
import { projectCurrentPersonalityScopes } from '../personalityCurrentReading'
import { projectNatalStructuralReading } from '../personalityStructuralReading'
import { birthReadingContext } from './readBirthChart'

/** Use the active long-term scope already evaluated by the existing single-birth pipeline. */
export function prepareSingleReadingPreview(birth: BirthInput, referenceTime: string) {
  const context = birthReadingContext(referenceTime)
  const { canonical, judgmentCore } = runInternalReading({
    ...context, birth, executionId: 'single-result-preview',
  })
  const snapshot = judgmentCore.find(scope => scope.scope === 'natal')
  if (!snapshot) return undefined

  const natal = applyStructuralRoleModifiers(
    buildNatalPersonality(canonical.chart), projectNatalStructuralReading(snapshot),
  )
  const current = buildCurrentPersonality({
    natalPersonality: natal,
    structuralScopes: projectCurrentPersonalityScopes(judgmentCore, natal.dayStem, referenceTime),
    evaluationScope: 'daewoon',
    referenceTime,
  })
  return current.evaluationScope === 'daewoon' ? current : undefined
}
