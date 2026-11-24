import { evidenceContextSchema, evidenceRecordSchema, roleStateSchema, runtimeStateSchema, validateContractBundle } from '../../contracts'
import type { ApplicationReference, EvidenceRecord, RoleStateContract } from '../../contracts'
import type { ValueStatus } from '../../../canonical/types'
import { combineAssessment, detach, recordId, sortedUnique } from '../../producers/shared'
import { patternCandidateSchema, tenGodSchema } from '../patternCandidates/types'
import { patternJudgmentSchema } from '../patternJudgment/types'
import { YONG_SHEN_CANDIDATE_RULE_IDS, yongShenCandidateDataSchema } from '../yongShenCandidates/types'
import { yongShenJudgmentSchema } from './types'
import type { YongShenJudgment, YongShenJudgmentInput } from './types'
export * from './types'
const same = (a: unknown, b: unknown) => JSON.stringify(detach(a)) === JSON.stringify(detach(b))
const peer = (god: string) => god === '比肩' || god === '劫財'

/** Final FILUNE visible month-command role. Consumes candidates; never generates or re-evaluates them. */
export function evaluateYongShenJudgment(input: YongShenJudgmentInput) {
  const { producer, derived, natalCombination: natal, context } = input
  const pattern = patternJudgmentSchema.parse(input.patternJudgment)
  const patternCandidates = input.candidates.map((c) => patternCandidateSchema.parse(c))
  // Preserve payload status/assessment separately, so a nonconfirmed handoff becomes deferred, never repaired/promoted.
  const sources = input.yongShenCandidates.map((c) => yongShenCandidateDataSchema.parse(c)).sort((a, b) => a.entityId.localeCompare(b.entityId))
  if (context.stage !== 'natal' || pattern.scopeId !== context.scopeId || derived.scopeId !== context.scopeId || natal.sourceScope !== 'natal'
    || !same(pattern.provenance.producerRef, producer.producerRef) || !same(natal.provenance.producerRef, producer.producerRef)
    || natal.provenance.producerSnapshotIdentity !== context.producerSnapshotIdentity
    || patternCandidates.some((c) => c.scopeId !== context.scopeId || !same(c.provenance.producerRef, producer.producerRef))
    || sources.some((c) => c.scopeId !== context.scopeId || !same(c.provenance.producerRef, producer.producerRef))) throw new TypeError('Matching natal role-candidate/fact provenance required')
  if (new Set(sources.map((c) => c.candidateId)).size !== sources.length || new Set(sources.map((c) => c.entityId)).size !== sources.length) throw new TypeError('Duplicate source candidate or entity')
  const records = new Map<string, EvidenceRecord>()
  for (const r of [...derived.evidence.records, ...natal.bundle.evidence.records, ...input.judgmentEvidence.records, ...input.candidateEvidence.records]) {
    const parsed = evidenceRecordSchema.parse(r), previous = records.get(r.evidenceId)
    if (previous && !same(previous, parsed)) throw new TypeError('Conflicting evidence identity')
    records.set(parsed.evidenceId, parsed)
  }
  type Fact = { assessment?: ValueStatus; evidenceIds: string[]; uncertaintyIds: string[] }
  const facts = new Map<string, Fact>()
  for (const f of [...producer.facts, ...derived.hiddenObservations, ...derived.exposures, ...derived.roots]) {
    if (facts.has(f.id)) throw new TypeError('Duplicate input fact')
    facts.set(f.id, f)
  }
  natal.states.forEach((s) => { runtimeStateSchema.parse(s); facts.set(s.stateId, s) })
  natal.relations.forEach((r) => facts.set(r.relationFactId, r))
  if (new Set(natal.states.map((s) => s.targetEntityId)).size !== natal.states.length) throw new TypeError('Ambiguous natal state')
  const globalBlocks = new Set<string>([...context.uncertaintyIds, ...pattern.uncertainty.blockingIds])
  if (pattern.status !== 'confirmed' || pattern.assessment !== 'confirmed') globalBlocks.add('PATTERN_JUDGMENT_NOT_CONFIRMED')
  if (context.periodSelectionStatus !== 'confirmed') globalBlocks.add('NATAL_CONTEXT_UNRESOLVED')
  if (natal.states.some((state) => !natal.bundle.states.some((record) => record.stateId === state.stateId && same(record, state)))) globalBlocks.add('NATAL_STATE_CATALOG_HANDOFF_MISMATCH')
  const month = producer.entities.find((e) => e.origin === 'natal' && e.sourceScope === 'natal' && e.part === 'branch' && e.position === 'month')
  const entry = derived.authority.entries.find((e) => e.branch === month?.value)
  if (!month || !context.includedEntityIds.includes(month.entityId) || entry?.completeness !== 'complete') globalBlocks.add('LOCAL_MONTH_AUTHORITY_INCOMPLETE')
  const selectedTrace = pattern.trace.filter((t) => t.status === 'confirmed' && t.patternType === pattern.patternType)
  const selected = patternCandidates.filter((c) => selectedTrace.some((t) => t.candidateId === c.candidateId))
  if (!selected.length || selected.length !== selectedTrace.length || selected.some((c) => c.status !== 'candidate' || c.patternType !== pattern.patternType)) globalBlocks.add('PATTERN_COMPONENT_TRACE_UNAVAILABLE')
  const components = selected.flatMap((c) => c.basis.components.map((component) => ({ component, source: c })))
  const requiredEntities = sortedUnique(components.flatMap(({ component }) => component.stemEntityIds))
  if (requiredEntities.some((id) => !sources.some((c) => c.entityId === id))) globalBlocks.add('SOURCE_CANDIDATE_COVERAGE_INCOMPLETE')
  if (!same(sortedUnique(components.map(({ component }) => component.tenGod)), sortedUnique(pattern.componentTenGods))) globalBlocks.add('PATTERN_COMPONENTS_DISAGREE')
  const expectedSections: Record<string, string> = { 'I-01': 'A-8-1.', 'I-02': 'A-8-1.', 'I-02a': 'A-8-1.', 'C-10': 'A-8-1.', 'I-03': 'A-2-2.', 'I-04-1': 'A-8-2.' }
  const judgments: YongShenJudgment[] = [], roleStates: RoleStateContract[] = [], applications: ApplicationReference[] = []
  for (const source of sources) {
    const blocks = new Set([...globalBlocks, ...source.uncertainty.blockingIds]), supporting = new Set([...pattern.supportingFactIds, ...source.supportingFactIds])
    const proof = new Set<string>(), statuses: ValueStatus[] = [pattern.assessment, source.assessment]
    const needFact = (id: string) => {
      const f = facts.get(id); supporting.add(id); statuses.push(f?.assessment ?? 'unknown')
      if (!f || f.assessment !== 'confirmed' || !Array.isArray(f.uncertaintyIds) || f.uncertaintyIds.length) blocks.add(`CORE_FACT_UNRESOLVED:${id}`)
    }
    const needEvidence = (id: string | undefined) => {
      const r = id && records.get(id); statuses.push(r ? r.status : 'unknown')
      if (!r || r.status !== 'confirmed' || r.usage !== 'runtime-evidence' || r.uncertaintyIds.length
        || !r.verification.checkedByRef || !r.verification.basisEvidenceIds.length) { blocks.add(`CORE_EVIDENCE_UNRESOLVED:${id ?? 'missing'}`); return }
      proof.add(r.evidenceId)
    }
    ;[...supporting].forEach(needFact)
    ;[...pattern.evidenceIds, ...source.evidenceIds].forEach(needEvidence)
    for (const ruleId of YONG_SHEN_CANDIDATE_RULE_IDS) {
      const id = derived.authority.ruleReceiptIds[ruleId], r = id && records.get(id)
      needEvidence(id)
      if (!r || r.ruleId !== ruleId || r.sourceRef.kind !== 'source-document' || r.sourceRef.document.documentId !== 'A'
        || r.documentRevision !== 179 || r.sourceRef.document.section !== expectedSections[ruleId]) blocks.add(`DIRECT_RULE_RECEIPT_MISSING:${ruleId}`)
    }
    const entity = producer.entities.find((e) => e.entityId === source.entityId && e.origin === 'natal' && e.sourceScope === 'natal' && e.part === 'stem' && context.includedEntityIds.includes(e.entityId))
    if (!entity || entity.value !== source.stem || entity.assessment !== 'confirmed' || entity.uncertaintyIds.length) blocks.add('STEM_ENTITY_NOT_CONFIRMED_OR_MISMATCHED')
    if (source.roleBasis.sourceJudgmentId !== pattern.judgmentId || source.assessment !== 'confirmed') blocks.add('SOURCE_CANDIDATE_NOT_CONFIRMED')
    if (source.status === 'deferred') blocks.add('SOURCE_CANDIDATE_DEFERRED')
    if (!YONG_SHEN_CANDIDATE_RULE_IDS.every((id) => (source.sourceRuleIds as string[]).includes(id))) blocks.add('SOURCE_RULE_REFERENCES_INCOMPLETE')
    if (!source.evidenceIds.length || !source.supportingFactIds.length) blocks.add('SOURCE_CANDIDATE_PROOF_UNAVAILABLE')
    const godFact = producer.facts.find((f) => f.canonicalPointer === `/chart/basicRelations/${entity?.position}/value/stemTenGod`)
    const god = godFact && tenGodSchema.is(godFact.value) ? godFact.value : null
    if (godFact) needFact(godFact.id)
    if (!god || source.roleBasis.tenGod !== god) blocks.add('TEN_GOD_HANDOFF_MISMATCH')
    const matches = components.filter(({ component }) => component.stemEntityIds.includes(source.entityId))
    const expectedSources = sortedUnique(matches.map(({ source }) => source.candidateId))
    const expectedExposureIds = sortedUnique(matches.flatMap(({ component }) => component.exposureFactIds))
    const expectedHiddenIds = sortedUnique(matches.flatMap(({ component }) => component.hiddenObservationIds))
    const excluded = entity?.position === 'day' ? 'I02_DAY_STEM_EXCLUDED' : god && peer(god) ? 'I02_PEER_NOT_INDEPENDENT'
      : !matches.length ? 'I02_NOT_MONTH_EXPOSURE_STRUCTURAL_CENTER' : null
    if (source.status === 'rejected' && !excluded) blocks.add('REJECTED_SOURCE_CONTRADICTS_CONFIRMED_PATTERN')
    if (!excluded) {
      if (source.status !== 'candidate') blocks.add('ELIGIBLE_SOURCE_CANDIDATE_REQUIRED')
      if (!same(source.roleBasis.sourcePatternCandidateIds, expectedSources) || !same(source.roleBasis.exposureFactIds, expectedExposureIds)
        || !same(source.roleBasis.hiddenObservationIds, expectedHiddenIds) || !expectedExposureIds.length) blocks.add('CANDIDATE_PATTERN_FUNCTION_LINK_MISMATCH')
      for (const { component } of matches) {
        if (component.tenGod !== god) blocks.add('PATTERN_TEN_GOD_MISMATCH')
        component.tenGodFactIds.forEach(needFact)
      }
      for (const id of source.roleBasis.exposureFactIds) {
        const f = derived.exposures.find((f) => f.id === id); needFact(id)
        if (!f || f.stemEntityId !== source.entityId || f.sourceBranchEntityId !== month?.entityId || !f.monthCommand || !f.exposed || f.dayStemExcluded
          || f.sourceScope !== 'natal' || f.sourceBranchScope !== 'natal' || f.scopeId !== context.scopeId || f.hiddenStemSystemId !== 'filune-a179'
          || !same(f.provenance.producerRef, producer.producerRef)) { blocks.add(`MONTH_EXPOSURE_LINK_INVALID:${id}`); continue }
        if (f.provenance.assessmentBasis.localCoverage !== 'complete' || f.provenance.assessmentBasis.legacyFallback) blocks.add('LOCAL_RECEIPT_BASIS_INVALID')
        f.provenance.assessmentBasis.parentFactIds.forEach(needFact); f.provenance.assessmentBasis.receiptEvidenceIds.forEach(needEvidence)
      }
      for (const id of source.roleBasis.hiddenObservationIds) {
        const h = derived.hiddenObservations.find((h) => h.id === id); needFact(id)
        if (!h || h.branchEntityId !== month?.entityId || h.scopeId !== context.scopeId || !h.role || entry?.roles[h.role] !== h.hiddenStem
          || !same(h.provenance.producerRef, producer.producerRef) || !source.roleBasis.exposureFactIds.some((id) => derived.exposures.some((e) => e.id === id && e.hiddenStem === h.hiddenStem && e.hiddenStemRole === h.role))) blocks.add('MONTH_HIDDEN_FUNCTION_LINK_INVALID')
      }
    }
    const state = natal.states.find((s) => s.targetEntityId === source.entityId && s.scopeId === context.scopeId) ?? null
    if (!excluded) {
      if (!state || state.functionalState === 'unknown' || state.uncertaintyIds.length) { blocks.add('CURRENT_FUNCTION_UNKNOWN'); statuses.push('unknown') }
      else if (state.functionalState === 'stopped') blocks.add('I02A_FUNCTION_STOPPED_ROLE_REVIEW_DEFERRED')
      if (!same(state, source.roleBasis.runtimeState)) blocks.add('CANDIDATE_STATE_HANDOFF_MISMATCH')
    }
    const expectedHandling = god && !peer(god) && matches.length ? ['偏官', '傷官'].includes(god) ? '역용 구조 검토' : '순용 구조 검토' : null
    if (!excluded && source.roleBasis.handlingRequirement !== expectedHandling) blocks.add('I041_HANDLING_DIRECTION_MISMATCH')
    const status: YongShenJudgment['status'] = blocks.size ? 'deferred' : excluded ? 'rejected' : 'confirmed'
    const assessment = combineAssessment(...statuses)
    const roleStateId = status === 'confirmed' ? recordId('yongshen-role', [context.scopeId, source.entityId]) : null
    if (roleStateId) {
      const application: ApplicationReference = { applicationId: recordId('yongshen-application', [context.scopeId, source.candidateId]),
        executionId: context.executionId, scopeId: context.scopeId, ruleId: 'I-02', ruleVersion: 'A179' }
      applications.push(application)
      roleStates.push(roleStateSchema.parse({ contractVersion: '1', roleStateId, subjectKind: 'entity', entityId: source.entityId, structureRef: null,
        role: '용신', status: 'evaluated', sourceRuleIds: [...YONG_SHEN_CANDIDATE_RULE_IDS], evidenceIds: [...proof].sort(),
        validScopeId: context.scopeId, provisional: false, uncertaintyIds: [], origin: 'rule-result', applicationRef: application, usage: 'runtime-result' }))
    }
    const contextFacts = sortedUnique([...source.contextFactIds, ...source.roleBasis.rootFactIds, ...(state ? [state.stateId] : [])])
    const contextEvidence = sortedUnique([...source.contextEvidenceIds, ...pattern.contextEvidenceIds,
      ...contextFacts.flatMap((id) => facts.get(id)?.evidenceIds ?? [])].filter((id) => !proof.has(id)))
    const reasons = status === 'confirmed' ? ['I02_CONFIRMED_MONTH_EXPOSURE_STRUCTURAL_ROLE',
      source.roleBasis.exposureFactIds.some((id) => derived.exposures.some((f) => f.id === id && f.hiddenStemRole === 'main')) ? 'I02_MAIN_EXPOSED_CENTER_RETAINED' : 'I02_COMBINED_NON_MAIN_EXPOSED_CENTER_RETAINED',
      'I03_FILUNE_DEFINITION_NOT_FAVORABLE_ELEMENT_SELECTION']
      : status === 'rejected' ? [excluded!] : ['CORE_CANDIDATE_FACT_OR_FUNCTION_UNRESOLVED', ...blocks]
    const trace: YongShenJudgment['trace'] = [
      { ruleId: 'I-01', outcome: globalBlocks.size ? 'deferred' : 'satisfied', reasonCodes: ['EXISTING_PATTERN_JUDGMENT_CONSUMED'], candidateIds: [source.candidateId], factIds: pattern.supportingFactIds, evidenceIds: pattern.evidenceIds.filter((id) => proof.has(id)) },
      { ruleId: 'I-02', outcome: status === 'confirmed' ? 'satisfied' : status, reasonCodes: reasons, candidateIds: sources.filter((s) => requiredEntities.includes(s.entityId)).map((s) => s.candidateId), factIds: sortedUnique([...source.roleBasis.exposureFactIds, ...source.roleBasis.hiddenObservationIds, ...(godFact ? [godFact.id] : [])]), evidenceIds: [...proof].sort() },
      { ruleId: 'I-02a', outcome: state?.functionalState === 'stopped' ? 'deferred' : 'context-only', reasonCodes: [state?.functionalState === 'stopped' ? 'STOPPED_CLASSIFICATION_RETAINED_NO_AUTOMATIC_REJECTION' : state?.functionalState === 'weakened' ? 'WEAKENED_STATE_RETAINED_NO_INVENTED_THRESHOLD' : 'ACTIVE_ALONE_DOES_NOT_CONFIRM_ROLE'], candidateIds: [source.candidateId], factIds: state ? [state.stateId] : [], evidenceIds: [] },
      { ruleId: 'I-03', outcome: 'context-only', reasonCodes: ['NO_SINGLE_WINNER_PRIORITY_OR_OTHER_ROLE_ASSIGNMENT'], candidateIds: [source.candidateId], factIds: [], evidenceIds: [derived.authority.ruleReceiptIds['I-03']].filter((id) => proof.has(id)) },
      { ruleId: 'I-04-1', outcome: 'context-only', reasonCodes: ['HANDLING_DIRECTION_RETAINED_NOT_SUCCESS_OR_FORTUNE_JUDGMENT'], candidateIds: [source.candidateId], factIds: godFact ? [godFact.id] : [], evidenceIds: [derived.authority.ruleReceiptIds['I-04-1']].filter((id) => proof.has(id)) },
    ]
    judgments.push(yongShenJudgmentSchema.parse({ judgmentId: recordId('yongshen-judgment', [context.scopeId, source.entityId]),
      entityId: source.entityId, stem: source.stem, tenGod: god, status, sourceCandidateIds: [source.candidateId],
      supportingFactIds: [...supporting].sort(), conflictingFactIds: source.conflictingFactIds, sourceRuleIds: [...YONG_SHEN_CANDIDATE_RULE_IDS],
      evidenceIds: [...proof].sort(), reasonCodes: reasons, assessment: assessment === 'confirmed' && blocks.size ? 'provisional' : assessment,
      uncertainty: { blockingIds: [...blocks].sort(), contextIds: sortedUnique([...source.uncertainty.contextIds, ...pattern.uncertainty.contextIds,
        ...contextFacts.flatMap((id) => facts.get(id)?.uncertaintyIds ?? [`CONTEXT_FACT_UNAVAILABLE:${id}`]), ...contextEvidence.flatMap((id) => records.get(id)?.uncertaintyIds ?? [])]) },
      sourcePatternJudgmentId: pattern.judgmentId, functionBasis: { axis: '천간', monthBranchEntityId: month?.entityId ?? null,
        sourcePatternCandidateIds: source.roleBasis.sourcePatternCandidateIds, hiddenObservationIds: source.roleBasis.hiddenObservationIds,
        exposureFactIds: source.roleBasis.exposureFactIds, handlingRequirement: source.roleBasis.handlingRequirement },
      runtimeState: state, roleStateRef: roleStateId, contextFactIds: contextFacts, contextEvidenceIds: contextEvidence,
      trace, scopeId: context.scopeId, sourceScope: 'natal', provenance: { producerRef: producer.producerRef, ruleVersion: 'A179',
        sourceDocument: { documentId: 'A', documentRevision: 179, path: 'src/docs/source/authority/A_rev179.md', section: 'A-8-1 / A-8-2; A-2-2 I-03', location: 'I-01 / I-02 / I-02a / C-10 / I-03 / I-04-1' },
        method: 'existing-candidates-and-confirmed-structural-facts-only-visible-yongshen-role' } }))
  }
  const evidence = evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('yongshen-judgment-evidence', [context.scopeId]),
    records: [...records.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) })
  const bundle = validateContractBundle({ ...detach(natal.bundle), evidence, roles: roleStates,
    applications: [...natal.bundle.applications, ...applications], factIds: sortedUnique([...natal.bundle.factIds, ...derived.hiddenObservations.map((f) => f.id), ...derived.exposures.map((f) => f.id), ...derived.roots.map((f) => f.id)]) })
  return detach({ judgments, roleStates, applications, evidence, bundle,
    deferred: sources.length ? [] : [{ reasonCode: 'SOURCE_CANDIDATE_LIST_EMPTY', sourceRuleIds: [...YONG_SHEN_CANDIDATE_RULE_IDS] }] })
}
