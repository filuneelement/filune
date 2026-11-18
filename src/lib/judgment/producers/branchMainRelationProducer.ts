import { calculateTenGod } from '../../dayRelationships'
import { runtimeStateSchema } from '../contracts'
import type { RuntimeStateContract } from '../contracts'
import { tenGodSchema } from '../evaluators/patternCandidates/types'
import { assertExecutionScopeContext } from '../runtime/executionScopeContext'
import type { ExecutionScopeContext } from '../runtime/executionScopeContext'
import type { produceExposureRootFacts } from './exposureRootProducer'
import { combineAssessment, detach, recordId, sortedUnique } from './shared'
import type { JudgmentProducerOutput } from './types'

export type BranchMainRelationInput = {
  producer: JudgmentProducerOutput
  context: ExecutionScopeContext
  derived: ReturnType<typeof produceExposureRootFacts>
  runtimeStates: RuntimeStateContract[]
}

/** C-09/C-10 structural observation using the main hidden stems only.
 * I-07 supplies the stem relation semantics. This does not establish functional branch control.
 */
export function produceBranchMainRelations({ producer, context, derived, runtimeStates }: BranchMainRelationInput) {
  assertExecutionScopeContext(producer, context)
  if (derived.scopeId !== context.scopeId) throw new TypeError('Branch observation scope mismatch')
  const branches = producer.entities.filter((entity) => entity.origin === 'natal' && entity.part === 'branch'
    && context.includedEntityIds.includes(entity.entityId))
  const stateFor = (entityId: string) => {
    const states = runtimeStates.filter((state) => state.targetEntityId === entityId && state.scopeId === context.scopeId)
    if (states.length !== 1 || !runtimeStateSchema.is(states[0])) return null
    const state = states[0]
    const { from, to } = state.validity
    const start = from.kind === 'exact' ? from.instant : from.kind === 'range' ? from.latest : null
    const end = to.kind === 'exact' ? to.instant : to.kind === 'range' ? to.earliest : null
    return start && end && start <= context.referenceTime && context.referenceTime < end && !state.uncertaintyIds.length ? state : null
  }
  const subjects = branches.flatMap((entity) => {
    const canonicalPrefix = `/chart/basicRelations/${entity.position}/value/relationships/`
    const canonicalStem = producer.facts.find((fact) => fact.canonicalPointer === canonicalPrefix + 'mainHiddenStem')
    const canonicalRole = producer.facts.find((fact) => fact.canonicalPointer === canonicalPrefix + 'mainHiddenTenGod')
    if (!canonicalStem || typeof canonicalStem.value !== 'string' || !canonicalRole || !tenGodSchema.is(canonicalRole.value)) return []
    const main = derived.hiddenObservations.find((fact) => fact.branchEntityId === entity.entityId && fact.role === 'main')
    if (main && main.hiddenStem !== canonicalStem.value) return []
    const supported = main?.assessment === 'confirmed' && !main.uncertaintyIds.length
    return [{ entity, stem: canonicalStem.value, role: canonicalRole.value,
      assessment: combineAssessment(entity.assessment, canonicalStem.assessment, canonicalRole.assessment, supported ? 'confirmed' : 'provisional'),
      factIds: [entity.canonicalFactRef, canonicalStem.id, canonicalRole.id, ...(main ? [main.id] : [])],
      evidenceIds: [...entity.evidenceIds, ...canonicalStem.evidenceIds, ...canonicalRole.evidenceIds, ...(main?.evidenceIds ?? [])],
      uncertaintyIds: sortedUnique([...entity.uncertaintyIds, ...canonicalStem.uncertaintyIds, ...canonicalRole.uncertaintyIds,
        ...(main?.uncertaintyIds ?? []), ...(!supported ? ['BRANCH_MAIN_AUTHORITY_UNCONFIRMED'] : [])]),
      state: stateFor(entity.entityId) }]
  })

  const observations = subjects.flatMap((source) => subjects.flatMap((target) => {
    if (source.entity.entityId === target.entity.entityId) return []
    const tenGod = calculateTenGod(source.stem, target.stem)
    const existence = tenGod === '偏財' || tenGod === '正財' ? 'present' as const : 'absent' as const
    const factIds = sortedUnique([...source.factIds, ...target.factIds])
    return [{
      id: recordId('branch-main-controls', [context.scopeId, source.entity.entityId, target.entity.entityId]),
      sourceEntityId: source.entity.entityId, targetEntityId: target.entity.entityId,
      relationType: 'main-hidden-stem-controls' as const, existence,
      sourceRole: source.role, targetRole: target.role, sourceMainStem: source.stem, targetMainStem: target.stem,
      origin: { source: source.entity.origin, target: target.entity.origin }, scopeId: context.scopeId,
      sourceRuleIds: ['C-09', 'C-10', 'I-07'], inputFactIds: factIds,
      evidenceIds: sortedUnique([...source.evidenceIds, ...target.evidenceIds]),
      uncertaintyIds: sortedUnique([...source.uncertaintyIds, ...target.uncertaintyIds]),
      assessment: combineAssessment(source.assessment, target.assessment),
      sourceStateId: source.state?.stateId ?? null, targetStateId: target.state?.stateId ?? null,
      provenance: { producerRef: producer.producerRef, inputFactIds: factIds, method: 'main-hidden-stem-elemental-control' },
    }]
  }))
  return detach(observations)
}
