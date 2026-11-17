import type { Work } from './types'
import { applyCombinationState, application } from './applyCombinationState'
export function evaluateLuckToNatalCombination(work: Work): void {
  const priority = { year: 0, month: 1, time: 2, day: 3 }
  // Only the current stage's newly introduced luck gets a new luck-to-natal pass.
  // Earlier-stage luck/natal processing is history, not a fresh monthly relation (IR-01).
  const current = work.stems.filter((e) => e.sourceScope === work.input.context.stage)
  for (const luck of current) {
    if (work.excludedFromNatal.has(luck.entityId) || work.priorLuckProcessing.has(luck.entityId)
      || work.states.get(luck.entityId)?.functionalState !== 'active') continue
    const possible = work.relations.filter((r) => r.existence === 'present' && r.participantEntityIds.includes(luck.entityId))
      .flatMap((relation) => {
        const entity = work.stems.find((e) => e.entityId === relation.participantEntityIds.find((id) => id !== luck.entityId))!
        if (entity.origin !== 'natal') return []
        if (entity.position === 'day') { application(work, 'OP-T04', relation.relationFactId); return [] }
        if (work.states.get(entity.entityId)?.functionalState === 'stopped') {
          application(work, 'OP-T08', relation.relationFactId); return []
        }
        return [{ relation, entity }]
      }).sort((a, b) => priority[a.entity.position!] - priority[b.entity.position!])
    if (possible[0]) applyCombinationState(work, possible[0].relation, 'stopping', ['OP-T03', 'OP-T07'])
  }
}
