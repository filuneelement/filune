import type { Work } from './types'
import { applyCombinationState } from './applyCombinationState'
export function evaluateLuckToLuckCombination(work: Work): void {
  const luck = new Set(work.stems.filter((e) => e.origin !== 'natal').map((e) => e.entityId))
  const pairs = work.relations.filter((r) => r.existence === 'present' && r.participantEntityIds.every((id) => luck.has(id)))
  // Current OP-L01 scopes contain at most two direct luck stems. Do not invent a multi-luck tie-breaker.
  if (pairs.length > 1 || luck.size > 2) throw new TypeError('Multi-luck selection requires a separate supported scope.')
  for (const pair of pairs) {
    if (pair.participantEntityIds.some((id) => work.states.get(id)?.functionalState !== 'active')) {
      throw new TypeError('Prior luck/natal stop intersects a new luck pair; unsupported boundary requires review.')
    }
    applyCombinationState(work, pair, 'weakening', ['OP-T10'])
  }
}
