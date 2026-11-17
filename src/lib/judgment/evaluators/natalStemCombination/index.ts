import { runtimeStateSchema, validateContractBundle } from '../../contracts'
import type { ApplicationReference, RuntimeStateContract } from '../../contracts'
import { detach, recordId, sortedUnique } from '../../producers/shared'
import { selectScope } from '../stemCombination/selectScope'
import type { StemCombinationInput } from '../stemCombination/types'

/** Natal context only. Relation presence never itself means functional stopping. */
export function evaluateNatalStemCombination(input: Omit<StemCombinationInput, 'upstream'>) {
  if (input.context.stage !== 'natal') throw new TypeError('Natal execution context required')
  const { stems, relations, bundle } = selectScope(input)
  if (stems.length !== 4 || stems.some((e) => e.origin !== 'natal' || e.sourceScope !== 'natal')) {
    throw new TypeError('Four natal stems required')
  }
  const { context } = input
  const app = (ruleId: string, target: string): ApplicationReference => {
    const ref = { applicationId: recordId('natal-application', [context.scopeId, ruleId, target]),
      executionId: context.executionId, scopeId: context.scopeId, ruleId, ruleVersion: 'A179' }
    if (!bundle.applications.some((a) => a.applicationId === ref.applicationId)) bundle.applications.push(ref)
    return ref
  }
  const states = new Map<string, RuntimeStateContract>()
  // unknown is the contract's unassessed baseline; active means only no natal-combination stop.
  const baseline = stems.map((e) => runtimeStateSchema.parse({ contractVersion: '1',
    stateId: recordId('natal-baseline', [context.scopeId, e.entityId]), targetEntityId: e.entityId,
    scopeId: context.scopeId, functionalState: 'unknown', originMode: 'local', transition: 'unresolved',
    causingApplicationRefs: ['OP-T01', 'OP-T02', 'OP-T04', 'OP-T09', 'OP-T12'].map((id) => app(id, e.entityId)),
    evidenceIds: sortedUnique([...e.evidenceIds, 'producer-evidence:source-A179']), uncertaintyIds: ['natal-combination:not-assessed'],
    validity: context.effectivePeriod }))
  const present = relations.filter((r) => r.existence === 'present')
  const byId = (id: string) => stems.find((e) => e.entityId === id)!
  const ruleFor = (ids: string[]) => {
    const positions = ids.map((id) => byId(id).position)
    return positions.includes('day') ? 'OP-T04' : positions.includes('year')
      ? positions.includes('month') ? 'OP-T01' : 'OP-T02' : 'OP-T09'
  }
  const eligible = present.filter((r) => ['OP-T01', 'OP-T09'].includes(ruleFor(r.participantEntityIds)))
  const distance = (ids: string[]) => Math.abs(['year', 'month', 'day', 'time'].indexOf(byId(ids[0]).position!)
    - ['year', 'month', 'day', 'time'].indexOf(byId(ids[1]).position!))
  eligible.sort((a, b) => distance(a.participantEntityIds) - distance(b.participantEntityIds)
    || a.relationFactId.localeCompare(b.relationFactId))
  const consumed = new Set<string>()
  const selected = new Set<string>()
  const deferred: string[] = []
  if (context.periodSelectionStatus !== 'confirmed') deferred.push('Natal inspection period unresolved')
  for (const relation of eligible) {
    if (relation.participantEntityIds.some((id) => consumed.has(id))) continue
    const ties = eligible.filter((other) => other !== relation && distance(other.participantEntityIds) === distance(relation.participantEntityIds)
      && other.participantEntityIds.some((id) => relation.participantEntityIds.includes(id)))
    if (ties.length) { deferred.push('OP-T12 has no documented equal-distance tie breaker'); continue }
    selected.add(relation.relationFactId)
    relation.participantEntityIds.forEach((id) => consumed.add(id))
  }
  const events = present.map((relation) => {
    const ruleId = ruleFor(relation.participantEntityIds)
    const stopping = selected.has(relation.relationFactId) && !deferred.length
    return { relationFactId: relation.relationFactId, participantEntityIds: [...relation.participantEntityIds], sourceScope: 'natal' as const,
      ruleIds: sortedUnique([ruleId, ...(['OP-T01', 'OP-T09'].includes(ruleId) && eligible.length > 1 ? ['OP-T12'] : [])]),
      relation: detach(relation), stopping, evidenceIds: sortedUnique([...relation.evidenceIds, 'producer-evidence:source-A179']),
      provenance: { producerRef: relation.producerRef, inputFactIds: relation.inputFactIds, producerHandoffRefs: relation.producerHandoffRefs },
      before: baseline.filter((s) => relation.participantEntityIds.includes(s.targetEntityId)),
      after: [] as RuntimeStateContract[] }
  })
  if (!deferred.length) {
    bundle.states.push(...baseline)
    for (const entity of stems) {
      const related = events.filter((e) => e.participantEntityIds.includes(entity.entityId))
      const stopped = related.find((e) => e.stopping)
      const refs = (stopped ? [stopped] : related).flatMap((event) => event.ruleIds.map((id) => app(id, event.relationFactId)))
      // Complete six-pair coverage plus all applicable natal rules establishes absence of a stop.
      if (!refs.length) for (const id of ['OP-T01', 'OP-T02', 'OP-T04', 'OP-T09', 'OP-T12']) refs.push(app(id, entity.entityId))
      const prior = baseline.find((s) => s.targetEntityId === entity.entityId)!
      const state = runtimeStateSchema.parse({ ...prior, stateId: recordId('natal-state', [context.scopeId, entity.entityId]),
        functionalState: stopped ? 'stopped' : 'active', transition: 'established', priorStateRef: prior.stateId,
        causingApplicationRefs: refs, uncertaintyIds: entity.uncertaintyIds,
        evidenceIds: sortedUnique([...entity.evidenceIds, 'producer-evidence:source-A179', 'producer-evidence:relation-existence',
          ...related.flatMap((e) => e.evidenceIds)]) })
      states.set(entity.entityId, state); bundle.states.push(state)
    }
    for (const event of events) event.after = event.participantEntityIds.map((id) => states.get(id)!)
  }
  return detach({ status: deferred.length ? 'deferred' : 'evaluated', sourceScope: 'natal',
    states: [...states.values()], events, relations, bundle: validateContractBundle(bundle), deferred,
    roleStates: [], hiddenStemJudgments: 'deferred-not-consumed',
    provenance: { producerSnapshotIdentity: context.producerSnapshotIdentity, producerRef: input.producer.producerRef } })
}
