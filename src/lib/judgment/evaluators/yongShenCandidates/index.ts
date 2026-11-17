import { evidenceContextSchema, evidenceRecordSchema, runtimeStateSchema } from '../../contracts'
import type { EvidenceRecord } from '../../contracts'
import type { ValueStatus } from '../../../canonical/types'
import { combineAssessment, detach, recordId, sortedUnique } from '../../producers/shared'
import { patternCandidateSchema, tenGodSchema } from '../patternCandidates/types'
import { patternJudgmentSchema } from '../patternJudgment/types'
import { YONG_SHEN_CANDIDATE_RULE_IDS, yongShenCandidateSchema } from './types'
import type { YongShenCandidate, YongShenCandidateInput } from './types'
export * from './types'

const same = (a: unknown, b: unknown) => JSON.stringify(detach(a)) === JSON.stringify(detach(b))
const peer = (god: string) => god === '比肩' || god === '劫財'
/** FILUNE month-command visible candidates only. Does not calculate facts, patterns or assign any RoleState. */
export function evaluateYongShenCandidates(input: YongShenCandidateInput) {
  const { producer, derived, natalCombination: natal, context } = input
  const judgment = patternJudgmentSchema.parse(input.patternJudgment)
  const patternCandidates = input.candidates.map((c) => patternCandidateSchema.parse(c))
  if (context.stage !== 'natal' || judgment.scopeId !== context.scopeId || derived.scopeId !== context.scopeId
    || natal.sourceScope !== 'natal' || !same(judgment.provenance.producerRef, producer.producerRef)
    || !same(natal.provenance.producerRef, producer.producerRef)
    || natal.provenance.producerSnapshotIdentity !== context.producerSnapshotIdentity
    || patternCandidates.some((c) => c.scopeId !== context.scopeId || !same(c.provenance.producerRef, producer.producerRef))) {
    throw new TypeError('Matching natal judgment, candidate and fact provenance required')
  }
  if (new Set(patternCandidates.map((c) => c.candidateId)).size !== patternCandidates.length) throw new TypeError('Duplicate pattern candidate')
  const evidenceMap = new Map<string, EvidenceRecord>()
  for (const record of [...derived.evidence.records, ...natal.bundle.evidence.records, ...input.judgmentEvidence.records]) {
    const parsed = evidenceRecordSchema.parse(record), previous = evidenceMap.get(parsed.evidenceId)
    if (previous && !same(previous, parsed)) throw new TypeError('Conflicting evidence identity')
    evidenceMap.set(parsed.evidenceId, parsed)
  }
  const evidence = evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('yongshen-candidate-evidence', [context.scopeId]),
    records: [...evidenceMap.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) })
  type Fact = { assessment?: ValueStatus; uncertaintyIds: string[]; evidenceIds: string[] }
  const facts = new Map<string, Fact>()
  for (const f of [...producer.facts, ...derived.hiddenObservations, ...derived.exposures, ...derived.roots]) {
    if (facts.has(f.id)) throw new TypeError('Duplicate source fact')
    facts.set(f.id, f)
  }
  natal.states.forEach((s) => { runtimeStateSchema.parse(s); facts.set(s.stateId, s) })
  natal.relations.forEach((r) => facts.set(r.relationFactId, r))
  if (new Set(natal.states.map((s) => s.targetEntityId)).size !== natal.states.length) throw new TypeError('Ambiguous natal states')
  const globalBlocks = new Set<string>([...judgment.uncertainty.blockingIds, ...context.uncertaintyIds])
  if (judgment.status !== 'confirmed' || judgment.assessment !== 'confirmed') globalBlocks.add('PATTERN_JUDGMENT_NOT_CONFIRMED')
  if (context.periodSelectionStatus !== 'confirmed') globalBlocks.add('NATAL_CONTEXT_UNRESOLVED')
  const coreStatuses: ValueStatus[] = [judgment.assessment]
  for (const id of judgment.supportingFactIds) {
    const fact = facts.get(id)
    coreStatuses.push(fact?.assessment ?? 'unknown')
    if (fact?.assessment !== 'confirmed' || !Array.isArray(fact.uncertaintyIds) || fact.uncertaintyIds.length) globalBlocks.add(`PATTERN_CORE_FACT_UNRESOLVED:${id}`)
  }
  const proof = new Set<string>()
  const checkProof = (id: string | undefined, blocks: Set<string>) => {
    const record = id && evidenceMap.get(id)
    if (!record || record.status !== 'confirmed' || record.usage !== 'runtime-evidence' || record.uncertaintyIds.length
      || !record.verification.checkedByRef || !record.verification.basisEvidenceIds.length) { blocks.add(`CONFIRMED_EVIDENCE_UNAVAILABLE:${id ?? 'missing'}`); return }
    proof.add(record.evidenceId)
  }
  judgment.evidenceIds.forEach((id) => checkProof(id, globalBlocks))
  const expectedSections: Record<string, string> = { 'I-01': 'A-8-1.', 'I-02': 'A-8-1.', 'I-02a': 'A-8-1.', 'C-10': 'A-8-1.', 'I-03': 'A-2-2.', 'I-04-1': 'A-8-2.' }
  for (const ruleId of YONG_SHEN_CANDIDATE_RULE_IDS) {
    const ref = derived.authority.ruleReceiptIds[ruleId], record = ref && evidenceMap.get(ref)
    checkProof(ref, globalBlocks)
    if (!record || record.sourceRef.kind !== 'source-document' || record.sourceRef.document.documentId !== 'A'
      || record.documentRevision !== 179 || record.ruleId !== ruleId || record.sourceRef.document.section !== expectedSections[ruleId]) {
      globalBlocks.add(`CURRENT_ROLE_RULE_RECEIPT_MISSING:${ruleId}`)
    }
  }
  const month = producer.entities.find((e) => e.sourceScope === 'natal' && e.origin === 'natal' && e.part === 'branch' && e.position === 'month')
  const monthEntry = derived.authority.entries.find((e) => e.branch === month?.value)
  if (!month || !context.includedEntityIds.includes(month.entityId) || monthEntry?.completeness !== 'complete') globalBlocks.add('MONTH_LOCAL_AUTHORITY_INCOMPLETE')
  const selectedTrace = judgment.trace.filter((t) => t.status === 'confirmed' && t.patternType === judgment.patternType)
  const selected = patternCandidates.filter((c) => selectedTrace.some((t) => t.candidateId === c.candidateId))
  if (!selected.length || selected.length !== selectedTrace.length || selected.some((c) => c.status !== 'candidate' || c.patternType !== judgment.patternType)
    || judgment.sourceCandidateIds.length !== patternCandidates.length
    || judgment.sourceCandidateIds.some((id) => !patternCandidates.some((c) => c.candidateId === id))) globalBlocks.add('CONFIRMED_PATTERN_COMPONENT_TRACE_UNAVAILABLE')
  const components = selected.flatMap((c) => c.basis.components.map((component) => ({ component, source: c })))
  if (!same(sortedUnique(components.map(({ component }) => component.tenGod)), sortedUnique(judgment.componentTenGods))) globalBlocks.add('PATTERN_COMPONENTS_DISAGREE')
  const entities = producer.entities.filter((e) => e.origin === 'natal' && e.sourceScope === 'natal' && e.part === 'stem'
    && context.includedEntityIds.includes(e.entityId)).sort((a, b) => a.entityId.localeCompare(b.entityId))
  if (components.some(({ component }) => component.stemEntityIds.some((id) => !entities.some((e) => e.entityId === id)))) globalBlocks.add('PATTERN_STEM_ENTITY_UNAVAILABLE')
  const candidates: YongShenCandidate[] = []
  for (const entity of entities) {
    const matches = components.filter(({ component }) => component.stemEntityIds.includes(entity.entityId))
    const exposureIds = sortedUnique(matches.flatMap(({ component }) => component.exposureFactIds))
    const hiddenIds = sortedUnique(matches.flatMap(({ component }) => component.hiddenObservationIds))
    const sourceIds = sortedUnique(matches.map(({ source }) => source.candidateId))
    const supporting = new Set<string>([entity.canonicalFactRef, ...judgment.supportingFactIds])
    const blocks = new Set(globalBlocks), extraStatuses: ValueStatus[] = [entity.assessment]
    const state = natal.states.find((s) => s.targetEntityId === entity.entityId && s.scopeId === context.scopeId) ?? null
    const godFact = producer.facts.find((f) => f.canonicalPointer === `/chart/basicRelations/${entity.position}/value/stemTenGod`)
    const god = godFact && tenGodSchema.is(godFact.value) ? godFact.value : null
    const needFact = (id: string) => {
      const f = facts.get(id); extraStatuses.push(f?.assessment ?? 'unknown'); supporting.add(id)
      if (!f || f.assessment !== 'confirmed' || !Array.isArray(f.uncertaintyIds) || f.uncertaintyIds.length) blocks.add(`CORE_FACT_UNRESOLVED:${id}`)
    }
    needFact(entity.canonicalFactRef)
    if (entity.assessment !== 'confirmed' || entity.uncertaintyIds.length) blocks.add('STEM_ENTITY_NOT_CONFIRMED')
    if (!godFact || !god) blocks.add('TEN_GOD_FACT_UNAVAILABLE')
    else needFact(godFact.id)
    for (const { component } of matches) {
      if (component.tenGod !== god) blocks.add('COMPONENT_TEN_GOD_MISMATCH')
      component.tenGodFactIds.forEach(needFact)
    }
    for (const id of exposureIds) {
      const f = derived.exposures.find((f) => f.id === id)
      needFact(id)
      if (!f || f.stemEntityId !== entity.entityId || f.sourceBranchEntityId !== month?.entityId || !f.monthCommand
        || f.sourceScope !== 'natal' || f.sourceBranchScope !== 'natal' || f.exposed !== true || f.dayStemExcluded || f.scopeId !== context.scopeId || f.hiddenStemSystemId !== 'filune-a179'
        || !same(f.provenance.producerRef, producer.producerRef)) blocks.add(`MONTH_EXPOSURE_LINK_UNAVAILABLE:${id}`)
      else {
        if (f.provenance.assessmentBasis.localCoverage !== 'complete' || f.provenance.assessmentBasis.legacyFallback) blocks.add('LOCAL_ASSESSMENT_BASIS_INVALID')
        f.provenance.assessmentBasis.parentFactIds.forEach(needFact)
        f.provenance.assessmentBasis.receiptEvidenceIds.forEach((id) => checkProof(id, blocks))
      }
    }
    for (const id of hiddenIds) {
      const h = derived.hiddenObservations.find((h) => h.id === id)
      needFact(id)
      if (!h || h.sourceScope !== 'natal' || h.branchEntityId !== month?.entityId || h.scopeId !== context.scopeId || h.hiddenStemSystemId !== 'filune-a179'
        || !same(h.provenance.producerRef, producer.producerRef) || !h.role || monthEntry?.roles[h.role] !== h.hiddenStem
        || !exposureIds.some((id) => derived.exposures.some((e) => e.id === id && e.hiddenStem === h.hiddenStem && e.hiddenStemRole === h.role))) blocks.add('NON_MONTH_HIDDEN_REFERENCE')
    }
    const rejectedReason = entity.position === 'day' ? 'I02_DAY_STEM_EXCLUDED' : god && peer(god) ? 'I02_PEER_NOT_INDEPENDENT'
      : !matches.length ? 'I02_NOT_A_CONFIRMED_MONTH_EXPOSURE_COMPONENT' : null
    // Function stopping does not erase the structural source; it requires a later role review.
    if (!rejectedReason) {
      if (!state || state.functionalState === 'unknown' || state.uncertaintyIds.length) { blocks.add('CURRENT_FUNCTION_UNRESOLVED'); extraStatuses.push('unknown') }
      else if (state.functionalState === 'stopped') blocks.add('I02A_FUNCTION_STOPPED_ROLE_CANDIDACY_REVIEW_REQUIRED')
    }
    const status: YongShenCandidate['status'] = blocks.size ? 'deferred' : rejectedReason ? 'rejected' : 'candidate'
    const handling = matches.length && god && !peer(god) ? ['偏官', '傷官'].includes(god) ? '역용 구조 검토' as const : '순용 구조 검토' as const : null
    const rootIds = derived.roots.filter((r) => r.scopeId === context.scopeId && r.rootScope === 'natal' && r.rootBranchEntityId === month?.entityId && r.stemEntityId === entity.entityId).map((r) => r.id).sort()
    const conflicts = sortedUnique([...selected.filter((c) => matches.some((m) => m.source.candidateId === c.candidateId)).flatMap((c) => c.conflictingFactIds),
      ...(state?.functionalState === 'stopped' ? [state.stateId] : [])])
    const contextFacts = sortedUnique([...rootIds, ...conflicts, ...(state ? [state.stateId] : [])])
    const contextEvidence = sortedUnique([...judgment.contextEvidenceIds, ...contextFacts.flatMap((id) => facts.get(id)?.evidenceIds ?? [])].filter((id) => !proof.has(id)))
    const assessment = combineAssessment(...coreStatuses, ...extraStatuses)
    const trace: YongShenCandidate['trace'] = [
      { ruleId: 'I-01', outcome: globalBlocks.size ? 'deferred' : 'satisfied', reasonCodes: [globalBlocks.size ? 'PREREQUISITES_FOR_ROLE_CANDIDACY_UNRESOLVED' : 'CONFIRMED_MONTH_PATTERN_CONSUMED'], factIds: judgment.supportingFactIds, evidenceIds: judgment.evidenceIds.filter((id) => proof.has(id)) },
      { ruleId: 'I-02', outcome: blocks.size ? 'deferred' : rejectedReason ? 'rejected' : 'satisfied', reasonCodes: [rejectedReason ?? 'CONFIRMED_MONTH_EXPOSURE_COMPONENT'], factIds: sortedUnique([...exposureIds, ...hiddenIds, ...(godFact ? [godFact.id] : [])]), evidenceIds: [...proof].sort() },
      { ruleId: 'I-02a', outcome: state?.functionalState === 'stopped' ? 'deferred' : 'context-only', reasonCodes: [state?.functionalState === 'stopped' ? 'EXPOSURE_RETAINED_FUNCTION_STOPPED_NO_AUTOMATIC_REJECTION' : state?.functionalState === 'weakened' ? 'WEAKENED_FUNCTION_RETAINED_NO_INVENTED_THRESHOLD' : 'EXISTING_FUNCTION_STATE_PRESERVED'], factIds: state ? [state.stateId] : [], evidenceIds: [] },
      { ruleId: 'I-03', outcome: 'context-only', reasonCodes: ['FILUNE_MONTH_COMMAND_DEFINITION_NO_OTHER_ROLE_ASSIGNMENT'], factIds: [], evidenceIds: [derived.authority.ruleReceiptIds['I-03']].filter((id) => proof.has(id)) },
      { ruleId: 'I-04-1', outcome: 'context-only', reasonCodes: [handling ? 'HANDLING_STRUCTURE_REVIEW_REQUIRED_NOT_FINAL_ROLE' : 'NO_INDEPENDENT_VISIBLE_COMPONENT_TO_REVIEW'], factIds: godFact ? [godFact.id] : [], evidenceIds: [derived.authority.ruleReceiptIds['I-04-1']].filter((id) => proof.has(id)) },
    ]
    candidates.push(yongShenCandidateSchema.parse({ candidateId: recordId('yongshen-candidate', [context.scopeId, judgment.judgmentId, entity.entityId]),
      entityId: entity.entityId, stem: entity.value, roleBasis: { axis: '천간', definition: '월령 투출 격국 구성',
        sourceJudgmentId: judgment.judgmentId, sourcePatternCandidateIds: sourceIds, tenGod: god,
        hiddenObservationIds: hiddenIds, exposureFactIds: exposureIds, rootFactIds: rootIds, runtimeState: state, handlingRequirement: handling },
      status, supportingFactIds: [...supporting].sort(), conflictingFactIds: conflicts, sourceRuleIds: [...YONG_SHEN_CANDIDATE_RULE_IDS],
      evidenceIds: [...proof].sort(), assessment: assessment === 'confirmed' && blocks.size ? 'provisional' : assessment,
      uncertainty: { blockingIds: [...blocks].sort(), contextIds: sortedUnique([...judgment.uncertainty.contextIds,
        ...contextFacts.flatMap((id) => facts.get(id)?.uncertaintyIds ?? []), ...contextEvidence.flatMap((id) => evidenceMap.get(id)?.uncertaintyIds ?? [])]) },
      trace, contextFactIds: contextFacts, contextEvidenceIds: contextEvidence, scopeId: context.scopeId, sourceScope: 'natal',
      provenance: { producerRef: producer.producerRef, ruleVersion: 'A179', sourceDocument: { documentId: 'A', documentRevision: 179,
        path: 'src/docs/source/A_rev179.md', section: 'A-8-1 / A-8-2; A-2-2 I-03', location: 'I-01 / I-02 / I-02a / C-10 / I-03 / I-04-1' },
        method: 'existing-pattern-and-facts-only-FILUNE-visible-yongshen-candidacy' } }))
  }
  return detach({ candidates, evidence, roleStates: [] })
}
