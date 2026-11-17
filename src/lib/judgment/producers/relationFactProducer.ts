import { calculateTenGod } from '../../dayRelationships'
import { branchSchema, RELATION_KINDS, relationCoverageSchema, relationFactSchema, stemSchema } from '../contracts'
import type { RelationCoverage, RelationFactContract } from '../contracts'
import type { CanonicalProjection, FactEntity, ObservationScope, ProducerOptions } from './types'
import { combineAssessment, detach, recordId, RELATION_EVIDENCE, sortedUnique } from './shared'
import { BREAKS, CLASHES, HARMS, hasGroup, hasPair, isHalfCombination, isPunishmentPair,
  SEASON_COMBINATIONS, SIX_COMBINATIONS, STEM_COMBINATIONS,
  THREE_COMBINATIONS, THREE_PUNISHMENTS, WONJIN } from './relationCatalog'

export function relationFactProducer(projection: CanonicalProjection, requests?: ProducerOptions['relationScopes']) {
  for (const entity of projection.entities) (entity.part === 'stem' ? stemSchema : branchSchema).parse(entity.value)
  const byId = new Map(projection.entities.map((entity) => [entity.entityId, entity]))
  const declared = requests ?? [{ scopeId: 'observation:all-canonical-entities', entityIds: [...byId.keys()] }]
  const observationScopes: ObservationScope[] = [], relations: RelationFactContract[] = [], coverage: RelationCoverage[] = []
  if (new Set(declared.map((scope) => scope.scopeId)).size !== declared.length) throw new TypeError('Duplicate observation scope.')
  for (const request of declared) {
    if (!request.scopeId.trim() || new Set(request.entityIds).size !== request.entityIds.length
      || request.entityIds.some((id) => !byId.has(id))) throw new TypeError('Invalid observation scope universe.')
    const members = [...request.entityIds].sort().map((id) => byId.get(id)!)
    observationScopes.push({ scopeId: request.scopeId, purpose: 'unselected-candidates',
      entityIds: members.map((entity) => entity.entityId), sourceScopes: [...new Set(members.map((entity) => entity.sourceScope))].sort() })
    for (const kind of RELATION_KINDS) {
      const stems = kind.startsWith('stem-')
      const universe = members.filter((entity) => (entity.part === 'stem') === stems)
      if (universe.length === 0) continue
      const coverageId = recordId('coverage', [request.scopeId, kind])
      const investigatedParticipantSets: string[][] = []
      function investigate(participants: FactEntity[], present: boolean, directed = false): void {
        const ids = participants.map((entity) => entity.entityId)
        // Directional observations share the same coverage participant set.
        const key = JSON.stringify([...ids].sort())
        if (!investigated.has(key)) { investigated.add(key); investigatedParticipantSets.push([...ids].sort()) }
        if (!present) return
        const inputFactIds = sortedUnique(participants.map((entity) => entity.canonicalFactRef))
        relations.push(relationFactSchema.parse({ contractVersion: '1',
          relationFactId: recordId('relation', [request.scopeId, kind, ...ids]), kind, participantEntityIds: ids,
          ...(directed ? { sourceEntityId: ids[0], targetEntityId: ids[1] } : {}), scopeId: request.scopeId,
          existence: 'present', coverageRef: coverageId, producerRef: detach(projection.producerRef), inputFactIds,
          assessment: combineAssessment(...participants.map((entity) => entity.assessment)),
          evidenceIds: [RELATION_EVIDENCE], uncertaintyIds: sortedUnique(participants.flatMap((entity) => entity.uncertaintyIds)),
          natalPositionRefs: participants.filter((entity) => entity.origin === 'natal').map((entity) => entity.entityId) }))
      }
      const investigated = new Set<string>()
      for (let i = 0; i < universe.length; i++) for (let j = i + 1; j < universe.length; j++) {
        const a = universe[i], b = universe[j]
        const pairs: Partial<Record<typeof kind, readonly string[]>> = {
          'stem-combination': STEM_COMBINATIONS, 'branch-six-combination': SIX_COMBINATIONS,
          'branch-clash': CLASHES, 'branch-harm': HARMS, 'branch-break': BREAKS, 'branch-wonjin': WONJIN,
        }
        if (kind === 'stem-generates' || kind === 'stem-controls') {
          for (const [source, target] of [[a, b], [b, a]]) {
            const tenGod = calculateTenGod(source.value, target.value)
            const present = kind === 'stem-generates' ? tenGod === '食神' || tenGod === '傷官'
              : tenGod === '偏財' || tenGod === '正財'
            investigate([source, target], present, true)
          }
        } else if (pairs[kind]) investigate([a, b], hasPair(pairs[kind]!, a.value, b.value))
        else if (kind === 'branch-half-combination') investigate([a, b], isHalfCombination(a.value, b.value))
        else if (kind === 'branch-punishment') investigate([a, b], isPunishmentPair(a.value, b.value))
      }
      if (['branch-three-combination', 'branch-season-combination', 'branch-punishment'].includes(kind)) {
        const groups = kind === 'branch-three-combination' ? THREE_COMBINATIONS
          : kind === 'branch-season-combination' ? SEASON_COMBINATIONS : THREE_PUNISHMENTS
        for (let i = 0; i < universe.length; i++) for (let j = i + 1; j < universe.length; j++) {
          for (let k = j + 1; k < universe.length; k++) {
            const participants = [universe[i], universe[j], universe[k]]
            investigate(participants, hasGroup(groups, participants.map((entity) => entity.value)))
          }
        }
      }
      coverage.push(relationCoverageSchema.parse({ contractVersion: '1', coverageId, scopeId: request.scopeId, kind,
        universeEntityIds: universe.map((entity) => entity.entityId), investigatedParticipantSets,
        completion: 'complete', producerRef: detach(projection.producerRef), evidenceIds: [RELATION_EVIDENCE],
        uncertaintyIds: sortedUnique(universe.flatMap((entity) => entity.uncertaintyIds)) }))
    }
  }
  return { observationScopes, relations, coverage }
}
