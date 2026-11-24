import type { produceBranchMainRelations } from '../../producers/branchMainRelationProducer'
import { sourceSha256 } from '../../systems/documentReceipt'
import { sortedUnique } from '../../producers/shared'
import type { FactEntity, ProducedFact } from '../../producers/types'
import type { ByeongCandidateInput } from './types'

const DRAFT_HASH = '1d454b4b243d431152c9e655b246d161572941d76f3969dca370a4b9c1033235'

export function verifyByeongDraft(input: ByeongCandidateInput): void {
  if (input.draftRuleSource === undefined) return
  if (sourceSha256(input.draftRuleSource) !== DRAFT_HASH) throw new TypeError('Unexpected A rev180 draft bytes')
  if (input.reviews.length) throw new TypeError('A rev180 independent path does not accept supplied damage reviews')
}

export function inspectDraftPath(input: ByeongCandidateInput, entity: FactEntity, target: FactEntity | undefined, branchMain: ReturnType<typeof produceBranchMainRelations>) {
  const { producer, context, patternJudgment } = input
  const natalStems = producer.entities.filter((item) => item.origin === 'natal' && item.part === 'stem'
    && context.includedEntityIds.includes(item.entityId))
  const stemGod = (item: FactEntity) => item.origin === 'natal' && item.part === 'stem'
    ? producer.facts.find((fact) => fact.canonicalPointer === `/chart/basicRelations/${item.position}/value/stemTenGod`)
    : undefined
  const role = (fact: ProducedFact | undefined) => fact?.assessment === 'confirmed' && !fact.uncertaintyIds.length ? fact.value : null
  const god = stemGod(entity)
  const branchGod = entity.origin === 'natal' && entity.part === 'branch'
    ? producer.facts.find((fact) => fact.canonicalPointer === `/chart/basicRelations/${entity.position}/value/relationships/mainHiddenTenGod`)
    : undefined
  const localRelations = producer.relations.filter((relation) => relation.existence === 'present'
    && relation.producerRef.producerId === producer.producerRef.producerId
    && relation.producerRef.version === producer.producerRef.version
    && relation.producerRef.sourceRef === producer.producerRef.sourceRef
    && relation.assessment === 'confirmed' && !relation.uncertaintyIds.length
    && relation.participantEntityIds.every((id) => context.includedEntityIds.includes(id))
    && producer.coverage.some((coverage) => coverage.coverageId === relation.coverageRef
      && coverage.kind === relation.kind && coverage.scopeId === relation.scopeId && coverage.completion === 'complete'
      && !coverage.uncertaintyIds.length && coverage.investigatedParticipantSets.some((ids) =>
        ids.length === relation.participantEntityIds.length && ids.every((id) => relation.participantEntityIds.includes(id)))))
  const selected: typeof localRelations = []
  const mainControl = branchMain.find((fact) => fact.sourceEntityId === entity.entityId && fact.targetEntityId === target?.entityId)
  const reasons: string[] = []
  const factIds = [entity.canonicalFactRef]
  if (god) factIds.push(god.id)
  if (branchGod) factIds.push(branchGod.id)
  if (target) factIds.push(target.canonicalFactRef)
  const hasRole = (item: FactEntity, values: string[]) => values.some((value) => value === role(stemGod(item)))
  const wealth = natalStems.filter((item) => hasRole(item, ['偏財', '正財']))
  const kill = natalStems.filter((item) => hasRole(item, ['偏官']))
  const helpers = input.sangShenJudgments.filter((item) => item.status === 'confirmed' && item.tenGod === '食神')
  switch (patternJudgment.monthPatternTenGod) {
    case '食神':
      // Preserve relevant branch observations separately from an actual directed control.
      selected.push(...localRelations.filter((relation) => relation.kind.startsWith('branch-')
        && relation.participantEntityIds.includes(entity.entityId)
        && !!target && relation.participantEntityIds.includes(target.entityId)))
      reasons.push('I04_2_DIRECTED_FOOD_CONTROL_UNAVAILABLE', 'I04_2_MEDIATION_AND_ACTUAL_DAMAGE_UNVERIFIED')
      if (entity.part === 'branch' && mainControl?.assessment !== 'confirmed') reasons.push('I04_2_BRANCH_MAIN_AUTHORITY_UNCONFIRMED')
      if (!target || !input.runtimeStates.some((state) => state.targetEntityId === target.entityId && state.scopeId === context.scopeId)
        || !input.runtimeStates.some((state) => state.targetEntityId === entity.entityId && state.scopeId === context.scopeId)) {
        reasons.push('I04_2_PATH_RUNTIME_STATE_UNAVAILABLE')
      }
      break
    case '偏官':
      if (entity.part === 'branch') reasons.push('A180_7_BRANCH_WEALTH_TO_KILL_PATH_UNAVAILABLE')
      else if (wealth.some((item) => item.entityId === entity.entityId)) {
        selected.push(...localRelations.filter((relation) => relation.kind === 'stem-generates'
          && relation.sourceEntityId === entity.entityId && kill.some((item) => item.entityId === relation.targetEntityId)))
        if (!selected.length) reasons.push('A180_7_WEALTH_TO_KILL_GENERATION_UNVERIFIED')
      }
      reasons.push('A180_7_POST_CONTROL_DAMAGE_AND_WEALTH_ATTRIBUTION_UNVERIFIED')
      break
    case '正財':
    case '偏財':
      if (kill.some((item) => item.entityId === entity.entityId)) {
        const generation = localRelations.filter((relation) => relation.kind === 'stem-generates'
          && relation.targetEntityId === entity.entityId && wealth.some((item) => item.entityId === relation.sourceEntityId))
        const control = localRelations.filter((relation) => relation.kind === 'stem-controls'
          && relation.targetEntityId === entity.entityId && helpers.some((item) => item.entityId === relation.sourceEntityId))
        selected.push(...generation, ...control)
        if (!generation.length) reasons.push('A180_8_WEALTH_TO_KILL_GENERATION_UNVERIFIED')
        if (!control.length) reasons.push('A180_8_CONFIRMED_HELPER_CONTROL_UNAVAILABLE')
      }
      reasons.push('A180_8_RESIDUAL_KILL_DAMAGE_AND_ATTRIBUTION_UNVERIFIED')
      break
    default:
      reasons.push('A180_APPLICABLE_DAMAGE_RULE_UNVERIFIED')
  }
  return {
    reasons,
    factIds: sortedUnique([...factIds, ...(mainControl ? [mainControl.id, ...mainControl.inputFactIds] : []), ...selected.flatMap((item) => [item.relationFactId, ...item.inputFactIds])]),
    evidenceIds: sortedUnique([...(god?.evidenceIds ?? []), ...(branchGod?.evidenceIds ?? []), ...(mainControl?.evidenceIds ?? []), ...selected.flatMap((item) => item.evidenceIds)]),
    coverageRefs: sortedUnique(selected.map((item) => item.coverageRef)),
  }
}
