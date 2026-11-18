import { produceBranchMainRelations } from '../../producers/branchMainRelationProducer'
import { evidenceContextSchema, evidenceRecordSchema, relationCoverageSchema, relationFactSchema, roleStateSchema, runtimeStateSchema } from '../../contracts'
import { detach, recordId, sortedUnique } from '../../producers/shared'
import { assertExecutionScopeContext } from '../../runtime/executionScopeContext'
import { patternJudgmentSchema } from '../patternJudgment/types'
import { sangShenJudgmentSchema } from '../sangShenJudgment/types'
import { yongShenJudgmentSchema } from '../yongShenJudgment/types'
import { DOCUMENT_PINS } from '../../systems/documentReceipt'
import { inspectDraftPath, verifyByeongDraft } from './draftPaths'
import { BYEONG_RULE_SECTIONS } from './types'
import type { ByeongCandidate, ByeongCandidateInput, ByeongCandidateResult, ByeongRuleId, FoodDamagePath, FoodDamageReview } from './types'

export * from './types'

export const sameByeongInput = (a: unknown, b: unknown) => JSON.stringify(detach(a)) === JSON.stringify(detach(b))

export function foodDamageReviewClaim(review: FoodDamageReview): string {
  const { evidenceIds: _evidenceIds, paths, ...subject } = review
  return recordId('food-damage-review', [JSON.stringify(detach({ ...subject, pathIds: sortedUnique(paths.map((path) => path.pathId)) }))])
}

export function foodDamagePathClaim(reviewId: string, path: FoodDamagePath): string {
  const { evidenceIds: _evidenceIds, ...subject } = path
  return recordId('food-damage-path', [reviewId, JSON.stringify(detach(subject))])
}

export function inspectByeongInputs(input: ByeongCandidateInput) {
  const { producer, context, natalScopeId, patternJudgment: pattern } = input
  assertExecutionScopeContext(producer, context)
  verifyByeongDraft(input)
  const sources = evidenceContextSchema.parse(input.evidence)
  const evidence = new Map(producer.evidence.records.map((item) => [item.evidenceId, item]))
  for (const item of sources.records) {
    const prior = evidence.get(item.evidenceId)
    if (prior && !sameByeongInput(prior, item)) throw new TypeError('Conflicting byeong evidence identity')
    evidence.set(item.evidenceId, item)
  }
  const qualifies = (id: string, upstream = false) => {
    const item = evidence.get(id)
    return !!item && evidenceRecordSchema.is(item) && item.usage === 'runtime-evidence'
      && item.status === 'confirmed' && item.uncertaintyIds.length === 0
      && (item.sourceRef.kind !== 'source-document' || !['C', '25-7'].includes(item.sourceRef.document.documentId)
        || upstream && item.sourceRef.document.documentId === 'C' && item.hash?.value === DOCUMENT_PINS.C.sha256
          && item.sourceRef.document.section === 'C-10-1.' && item.verification.claimRef.startsWith('document-pillars:'))
  }
  const verified = (ids: string[], claim?: string) => ids.length > 0 && ids.every((id) => qualifies(id))
    && (claim === undefined || ids.some((id) => {
      const item = evidence.get(id)
      return item?.verification.claimRef === claim && item.sourceRef.kind !== 'source-document'
        && (item.sourceRef.kind !== 'operator-confirmed' || item.sourceRef.approvalScope === context.scopeId)
        && item.verification.basisEvidenceIds.every((basis) => qualifies(basis))
    }))
  const verifiedUpstream = (ids: string[]) => ids.length > 0 && ids.every((id) => qualifies(id, true))
  const receipt = (rule: ByeongRuleId) => [...evidence.values()].filter((item) =>
    qualifies(item.evidenceId) && item.ruleId === rule && item.documentRevision === 179
    && item.hash?.value === DOCUMENT_PINS.A.sha256
    && item.sourceRef.kind === 'source-document' && item.sourceRef.document.documentId === 'A'
    && item.sourceRef.document.section === BYEONG_RULE_SECTIONS[rule]).map((item) => item.evidenceId).sort()[0]

  const facts = new Map(producer.facts.map((fact) => [fact.id, fact]))
  const entities = producer.entities.filter((entity) => context.includedEntityIds.includes(entity.entityId))
    .sort((a, b) => a.entityId.localeCompare(b.entityId))
  const factConfirmed = (id: string) => {
    const fact = facts.get(id)
    return fact?.assessment === 'confirmed' && !fact.uncertaintyIds.length
      && sameByeongInput(fact.provenance.producerRef, producer.producerRef)
  }
  const entityConfirmed = (entity: typeof entities[number]) => {
    const pillar = facts.get(entity.canonicalFactRef)?.value
    return entity.assessment === 'confirmed' && !entity.uncertaintyIds.length && factConfirmed(entity.canonicalFactRef)
      && typeof pillar === 'string' && Array.from(pillar)[entity.part === 'stem' ? 0 : 1] === entity.value
  }
  const target = entities.find((entity) => entity.origin === 'natal' && entity.part === 'branch' && entity.position === 'month')
  const blocks: string[] = []
  if (context.periodSelectionStatus !== 'confirmed' || context.uncertaintyIds.length || producer.unavailableEntityFactRefs.some((id) => id.includes('/chart/pillars/')
    || Object.values(context.selectedPeriodRefs).some((ref) => id.startsWith(ref.replace('canonical-period:', 'canonical:') + '/')))) {
    blocks.push('EXECUTION_SCOPE_INCOMPLETE')
  }
  const upstream = (judgment: PatternJudgmentLike) => judgment.status === 'confirmed' && judgment.assessment === 'confirmed'
    && judgment.scopeId === natalScopeId && !judgment.uncertainty.blockingIds.length && verifiedUpstream(judgment.evidenceIds)
    && sameByeongInput(judgment.provenance.producerRef, producer.producerRef)
    && judgment.supportingFactIds.length > 0
  const validRole = (item: ByeongCandidateInput['upstreamRoles'][number], scopeId: string) =>
    roleStateSchema.is(item) && item.status === 'evaluated' && item.usage === 'runtime-result'
    && !item.provisional && !item.uncertaintyIds.length && item.validScopeId === scopeId && verifiedUpstream(item.evidenceIds)
  const role = (id: string | null, name: '용신' | '상신', entityId: string) => {
    const matched = input.upstreamRoles.filter((item) => item.roleStateId === id)
    return matched.length === 1 && matched[0].role === name && matched[0].entityId === entityId && validRole(matched[0], natalScopeId)
  }
  if (!patternJudgmentSchema.is(pattern) || !upstream(pattern) || (context.stage === 'natal' && natalScopeId !== context.scopeId)) {
    blocks.push('PATTERN_NOT_CONFIRMED')
  }
  const yong = input.yongShenJudgments.filter((item) => yongShenJudgmentSchema.is(item) && upstream(item)
    && item.sourcePatternJudgmentId === pattern.judgmentId && role(item.roleStateRef, '용신', item.entityId)
    && entities.some((entity) => entity.entityId === item.entityId && entity.part === 'stem' && entity.origin === 'natal'
      && entity.value === item.stem && entityConfirmed(entity))
    && item.functionBasis.monthBranchEntityId === target?.entityId)
  if (!yong.length || pattern.componentTenGods.some((god) => !yong.some((item) => item.tenGod === god)) || input.yongShenJudgments.some((item) => item.status !== 'rejected' && !yong.includes(item))) {
    blocks.push('YONGSHEN_NOT_CONFIRMED')
  }
  const helpers = input.sangShenJudgments.filter((item) => sangShenJudgmentSchema.is(item) && upstream(item)
    && item.sourcePatternJudgmentId === pattern.judgmentId && role(item.roleStateRef, '상신', item.entityId)
    && entities.some((entity) => entity.entityId === item.entityId && entity.part === 'stem' && entity.origin === 'natal'
      && entity.value === item.stem && entityConfirmed(entity))
    && item.relatedYongShenIds.every((id) => yong.some((judgment) => judgment.judgmentId === id)))
  const branchHelper = input.upstreamRoles.some((item) => item.role === '상신' && validRole(item, natalScopeId)
    && entities.some((entity) => entity.entityId === item.entityId && entity.part === 'branch' && entity.origin === 'natal' && entityConfirmed(entity))
    && item.applicationRef?.ruleId === 'I-03')
  if ((!helpers.length && !branchHelper) || input.sangShenJudgments.some((item) => item.status !== 'rejected' && !helpers.includes(item))) {
    blocks.push('SANGSHEN_NOT_CONFIRMED')
  }
  if (input.draftRuleSource === undefined && pattern.monthPatternTenGod !== '食神') blocks.push('DAMAGE_RULE_UNAVAILABLE')
  if (!target || !entityConfirmed(target)) blocks.push('PROTECTED_ENTITY_UNRESOLVED')
  if (!receipt('I-03') || (input.draftRuleSource === undefined || pattern.monthPatternTenGod === '食神') && !receipt('I-04-2')) blocks.push('DIRECT_RULE_RECEIPT_MISSING')

  const relations = new Map(producer.relations.map((relation) => [relation.relationFactId, relation]))
  const coverages = new Map(producer.coverage.map((coverage) => [coverage.coverageId, coverage]))
  const validRelation = (id: string, source: string, destination: string, existence: string) => {
    const item = relations.get(id)
    if (!item || !relationFactSchema.is(item) || item.kind !== 'stem-controls' || item.existence !== existence
      || item.sourceEntityId !== source || item.targetEntityId !== destination || item.scopeId !== context.scopeId
      || item.assessment !== 'confirmed' || item.uncertaintyIds.length || !verified(item.evidenceIds)
      || !sameByeongInput(item.producerRef, producer.producerRef)) return false
    const coverage = coverages.get(item.coverageRef)
    return !!coverage && relationCoverageSchema.is(coverage) && coverage.scopeId === item.scopeId
      && coverage.kind === item.kind && coverage.completion === 'complete' && !coverage.uncertaintyIds.length
      && verified(coverage.evidenceIds) && sameByeongInput(coverage.producerRef, producer.producerRef)
      && coverage.investigatedParticipantSets.some((ids) => sameByeongInput(sortedUnique(ids), sortedUnique([source, destination])))
  }
  const states = (entityId: string) => input.runtimeStates.filter((state) => state.targetEntityId === entityId && state.scopeId === context.scopeId)
  const stateFor = (entityId: string) => {
    const found = states(entityId)
    const state = found.length === 1 ? found[0] : undefined
    if (!state || !runtimeStateSchema.is(state) || state.uncertaintyIds.length
      || state.functionalState === 'stopped' && entities.some((entity) => entity.entityId === entityId && entity.part === 'branch')
      || !state.evidenceIds.every((id) => evidence.get(id)?.usage === 'runtime-evidence')) return null
    const { from, to } = state.validity
    const validFrom = from.kind === 'exact' ? from.instant : from.kind === 'range' ? from.latest : null
    const validTo = to.kind === 'exact' ? to.instant : to.kind === 'range' ? to.earliest : null
    return validFrom && validTo && validFrom <= context.referenceTime && context.referenceTime < validTo ? state : null
  }
  const reviewValid = (review: FoodDamageReview, entity: typeof entities[number]) =>
    !!target && review.ruleId === 'I-04-2' && review.scopeId === context.scopeId && review.sourceEntityId === entity.entityId
    && review.targetEntityId === target?.entityId && sameByeongInput(review.producerRef, producer.producerRef)
    && review.assessment === 'confirmed' && !review.uncertaintyIds.length && verified(review.evidenceIds, foodDamageReviewClaim(review))
    && review.factIds.includes(entity.canonicalFactRef) && review.factIds.includes(target.canonicalFactRef)
    && review.factIds.every(factConfirmed)
  return { entities, target, blocks, receipt, verified, entityConfirmed, reviewValid, stateFor, validRelation, validRole, relations }
}

type PatternJudgmentLike = Pick<ByeongCandidateInput['patternJudgment'],
  'status' | 'assessment' | 'scopeId' | 'uncertainty' | 'evidenceIds' | 'provenance' | 'supportingFactIds'>

export function evaluateByeongCandidates(input: ByeongCandidateInput): ByeongCandidateResult {
  return projectByeongCandidates(input, inspectByeongInputs(input))
}

export function projectByeongCandidates(input: ByeongCandidateInput, checked: ReturnType<typeof inspectByeongInputs>): ByeongCandidateResult {
  const { context, patternJudgment, producer } = input
  const branchMain = input.draftRuleSource !== undefined && input.branchMainBasis && patternJudgment.monthPatternTenGod === '食神'
    ? produceBranchMainRelations({ producer, context, derived: input.branchMainBasis, runtimeStates: input.runtimeStates }) : []
  const candidates: ByeongCandidate[] = checked.entities.filter((entity) => entity.entityId !== checked.target?.entityId).map((entity) => {
    const reviews = input.reviews.filter((item) => item.sourceEntityId === entity.entityId && item.scopeId === context.scopeId)
    const accepted = reviews.filter((item) => checked.reviewValid(item, entity))
    const review = reviews.length === 1 && accepted.length === 1 ? accepted[0] : undefined
    const state = checked.stateFor(entity.entityId)
    const draft = input.draftRuleSource === undefined ? null : inspectDraftPath(input, entity, checked.target, branchMain)
    const reasons = [...checked.blocks, ...(draft?.reasons ?? [])]
    const ruleIds: ByeongRuleId[] = !draft || patternJudgment.monthPatternTenGod === '食神'
      ? ['I-03', 'I-04-2'] : ['I-03']
    if (!checked.entityConfirmed(entity)) reasons.push('CANDIDATE_ENTITY_UNCONFIRMED')
    if (!review && !draft) reasons.push('FUNCTION_REVIEW_UNAVAILABLE')
    const status = reasons.length || !review ? 'deferred'
      : review.resource === 'excluded' && review.completion === 'complete' && !review.paths.length ? 'rejected'
      : review.resource === '偏印' || review.resource === '印綬' ? 'candidate' : 'deferred'
    return {
      candidateId: recordId('byeong-candidate', [context.scopeId, entity.entityId]),
      entity, scopeId: context.scopeId, patternJudgmentId: patternJudgment.judgmentId,
      protectedEntityId: !draft || patternJudgment.monthPatternTenGod === '食神' ? checked.target?.entityId ?? null : null, status, runtimeState: state,
      reviewIds: sortedUnique(reviews.map((item) => item.reviewId)),
      paths: (review?.paths ?? []).slice().sort((a, b) => a.pathId.localeCompare(b.pathId)),
      factIds: sortedUnique([entity.canonicalFactRef, ...(review?.factIds ?? []), ...(draft?.factIds ?? [])]),
      evidenceIds: sortedUnique([...(review?.evidenceIds ?? []), ...(draft?.evidenceIds ?? []), ...(state?.evidenceIds ?? []),
        ...ruleIds.flatMap((rule) => checked.receipt(rule) ?? [])]),
      relationCoverageRefs: sortedUnique(draft?.coverageRefs ?? (review?.paths ?? []).flatMap((path) =>
        [path.relationFactId, path.controlRelationFactId].flatMap((id) => id ? checked.relations.get(id)?.coverageRef ?? [] : []))),
      coverage: review?.completion ?? 'unknown',
      ruleIds,
      reasonCodes: sortedUnique([...reasons, ...(status === 'deferred' && !reasons.length ? ['RESOURCE_STATUS_UNRESOLVED'] : [])]),
      provenance: { producerRef: producer.producerRef, ruleVersion: draft ? 'A180-draft' : 'A179' },
    }
  })
  return detach({ scopeId: context.scopeId, candidates, reasonCodes: sortedUnique(checked.blocks) })
}
