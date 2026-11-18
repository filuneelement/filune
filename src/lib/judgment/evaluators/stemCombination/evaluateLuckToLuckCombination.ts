import { exactContains, UnsupportedPriorStopLuckPairError } from './types'
import type { Work } from './types'
import { application, applyCombinationState } from './applyCombinationState'
export function evaluateLuckToLuckCombination(work: Work): void {
  const luck = new Set(work.stems.filter((e) => e.origin !== 'natal').map((e) => e.entityId))
  const { referenceTime } = work.input.context
  const pairs = work.relations.filter((relation) => {
    if (relation.existence !== 'present' || !relation.participantEntityIds.every((id) => luck.has(id))) return false
    const hasStoppedParticipant = relation.participantEntityIds.some((id) => {
      const state = work.states.get(id)
      return state?.functionalState === 'stopped'
        && exactContains(state.validity, referenceTime)
        && state.causingApplicationRefs.some((ref) => ref.ruleId === 'OP-T07')
    })
    if (hasStoppedParticipant) application(work, 'OP-T08', relation.relationFactId)
    return !hasStoppedParticipant
  })
  // Current OP-L01 scopes contain at most two direct luck stems. Do not invent a multi-luck tie-breaker.
  if (pairs.length > 1 || luck.size > 2) throw new TypeError('Multi-luck selection requires a separate supported scope.')
  for (const pair of pairs) {
    if (pair.participantEntityIds.some((id) => work.states.get(id)?.functionalState !== 'active')) {
      throw new UnsupportedPriorStopLuckPairError()
    }
    applyCombinationState(work, pair, 'weakening', ['OP-T10'])
  }
}
