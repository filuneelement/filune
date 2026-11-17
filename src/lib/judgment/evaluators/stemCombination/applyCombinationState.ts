import { runtimeStateSchema } from '../../contracts'
import type { ApplicationReference, RelationFactContract, RuntimeStateContract } from '../../contracts'
import { recordId, sortedUnique } from '../../producers/shared'
import type { Work } from './types'
export function application(work: Work, ruleId: string, target: string): ApplicationReference {
  const { context } = work.input
  const app = { applicationId: recordId('stem-application', [context.scopeId, ruleId, target]),
    executionId: context.executionId, scopeId: context.scopeId, ruleId, ruleVersion: 'A179' }
  if (!work.bundle.applications.some((item) => item.applicationId === app.applicationId)) work.bundle.applications.push(app)
  return app
}
/** active is a technical baseline: no combination restriction established in this slice. */
export function initializeStates(work: Work): void {
  for (const entity of work.stems) {
    if (work.states.has(entity.entityId)) continue
    const state = runtimeStateSchema.parse({ contractVersion: '1', stateId: recordId('stem-state', [work.input.context.scopeId, entity.entityId, 'baseline']),
      targetEntityId: entity.entityId, scopeId: work.input.context.scopeId, functionalState: 'active', originMode: 'local',
      transition: 'established', causingApplicationRefs: [application(work, 'OP-L01', entity.entityId)],
      evidenceIds: entity.evidenceIds, uncertaintyIds: [...entity.uncertaintyIds], validity: work.input.context.effectivePeriod })
    work.states.set(entity.entityId, state); work.bundle.states.push(state)
  }
}
export function applyCombinationState(work: Work, relation: RelationFactContract, effect: 'weakening' | 'stopping', ruleIds: string[]): void {
  const refs = ruleIds.map((rule) => application(work, rule, relation.relationFactId))
  const evidenceIds = sortedUnique([...relation.evidenceIds, 'producer-evidence:source-A179'])
  for (const entityId of relation.participantEntityIds) {
    const prior = work.states.get(entityId)!
    if (prior.functionalState !== 'active') throw new TypeError('Combination cannot reuse a restricted entity.')
    const state: RuntimeStateContract = runtimeStateSchema.parse({ contractVersion: '1',
      stateId: recordId('stem-state', [work.input.context.scopeId, entityId, effect]),
      targetEntityId: entityId, scopeId: work.input.context.scopeId,
      functionalState: effect === 'weakening' ? 'weakened' : 'stopped', originMode: 'local', transition: 'established',
      priorStateRef: prior.stateId, causingApplicationRefs: refs, evidenceIds,
      uncertaintyIds: sortedUnique([...prior.uncertaintyIds, ...relation.uncertaintyIds]), validity: work.input.context.effectivePeriod,
      ...(effect === 'weakening' ? { weakeningDescription: { wording: '운끼리 합: 작용력 약화, 합거 아님; 생극 강도 수치 미산정', ruleId: 'OP-T10' } } : {}) })
    work.states.set(entityId, state); work.bundle.states.push(state)
    if (effect === 'weakening') work.excludedFromNatal.add(entityId)
  }
  const natal = relation.participantEntityIds.filter((id) => work.stems.find((e) => e.entityId === id)!.origin === 'natal')
  work.bundle.carry.processedRelationRecords.push({ processingId: recordId('stem-processing', [work.input.context.scopeId, relation.relationFactId]),
    sourceScopeId: work.input.context.scopeId, relationFactRef: relation.relationFactId,
    applicationRef: refs.find((a) => a.ruleId === (effect === 'weakening' ? 'OP-T10' : 'OP-T07'))!,
    targetNatalEntityIds: natal, affectedLuckEntityIds: relation.participantEntityIds.filter((id) => !natal.includes(id)),
    effectClass: effect === 'weakening' ? 'luck-pair-weakening' : 'natal-change',
    sourcePeriodRef: work.input.context.effectivePeriod.periodId, evidenceIds })
  work.events.push({ ruleIds, relationFactId: relation.relationFactId, participantEntityIds: [...relation.participantEntityIds],
    effect, applicationRefs: refs, evidenceIds })
}
