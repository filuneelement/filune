import type { ContractBundle } from '../../contracts'
import { validateProducerOutput } from '../../producers'
import { asContractScope, assertExecutionScopeContext, producerPeriod, selectExecutionCandidates } from '../../runtime'
import { detach, recordId } from '../../producers/shared'
import type { StemCombinationInput } from './types'

/** Producer observations are untouched. Execution observations retain producer/evidence lineage. */
export function selectScope(input: StemCombinationInput) {
  const { producer, context } = input
  validateProducerOutput(producer)
  if (producer.hiddenStemSystem.systemId !== 'filune-a179') throw new TypeError('Judgment authority must be filune-a179.')
  assertExecutionScopeContext(producer, context)
  const stems = producer.entities.filter((e) => e.part === 'stem' && context.includedEntityIds.includes(e.entityId))
  const selected = selectExecutionCandidates(producer, context)
  const observations = selected.relations.filter((r) => r.kind === 'stem-combination')
  const seen = new Set<string>()
  const relations = observations.filter((relation) => {
    const key = JSON.stringify([...relation.participantEntityIds].sort())
    if (seen.has(key)) return false
    seen.add(key); return true
  }).map((relation) => ({ ...relation, scopeId: context.scopeId,
    relationFactId: recordId('execution-relation', [context.scopeId, relation.relationFactId]),
    coverageRef: recordId('execution-coverage', [context.scopeId, 'stem-combination']) }))
  const investigated: string[][] = []
  for (let i = 0; i < stems.length; i++) for (let j = i + 1; j < stems.length; j++) {
    const pair = [stems[i].entityId, stems[j].entityId].sort()
    const surveys = producer.coverage.filter((c) => c.kind === 'stem-combination' && c.completion === 'complete'
      && c.universeEntityIds.includes(pair[0]) && c.universeEntityIds.includes(pair[1])
      && c.investigatedParticipantSets.some((p) => JSON.stringify([...p].sort()) === JSON.stringify(pair)))
    if (!surveys.length) throw new TypeError('Complete producer coverage required before combination absence can be used.')
    investigated.push(pair)
  }
  const periods = [...new Set(producer.entities.flatMap((e) => e.periodRef ? [e.periodRef] : []))]
    .map((ref) => producerPeriod(producer, ref))
  if (!periods.some((p) => p.periodId === context.effectivePeriod.periodId)) periods.push(context.effectivePeriod)
  const evidenceIds = ['producer-evidence:source-A179', 'producer-evidence:relation-existence']
  const bundle: ContractBundle = { purpose: 'runtime-input', factIds: producer.facts.map((f) => f.id), structureIds: [],
    entities: producer.entities.map(({ entityId, origin, part, canonicalFactRef, position, periodRef }) =>
      ({ entityId, origin, part, canonicalFactRef, position, periodRef })),
    scopes: [asContractScope(context, evidenceIds)], periods, applications: [], hiddenStemSystems: [], hiddenStemEntries: [],
    relations, coverage: stems.length ? [{ contractVersion: '1', coverageId: recordId('execution-coverage', [context.scopeId, 'stem-combination']),
      scopeId: context.scopeId, kind: 'stem-combination', universeEntityIds: stems.map((e) => e.entityId),
      investigatedParticipantSets: investigated, completion: 'complete', producerRef: producer.producerRef,
      evidenceIds: ['producer-evidence:relation-existence'], uncertaintyIds: [] }] : [],
    states: [], carry: { contractVersion: '1', carryStateId: recordId('stem-carry', [context.scopeId]), entries: [],
      processedRelationRecords: [], snapshots: [], consumedAtStage: [], priorProcessingRefs: [] },
    evidence: producer.evidence, roles: [] }
  return { stems: detach(stems), relations: detach(relations), bundle: detach(bundle) }
}
