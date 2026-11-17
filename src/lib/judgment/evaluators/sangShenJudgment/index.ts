import { evidenceContextSchema, evidenceRecordSchema, relationCoverageSchema, relationFactSchema, roleStateSchema, runtimeStateSchema, validateContractBundle } from '../../contracts'
import type { ApplicationReference, EvidenceRecord, RoleStateContract } from '../../contracts'
import type { ValueStatus } from '../../../canonical/types'
import { combineAssessment, detach, recordId, sortedUnique } from '../../producers/shared'
import { patternJudgmentSchema } from '../patternJudgment/types'
import { yongShenJudgmentSchema } from '../yongShenJudgment/types'
import { SANG_SHEN_RULE_IDS, sangShenCandidateDataSchema } from '../sangShenCandidates/types'
import { tenGodSchema } from '../patternCandidates/types'
import { sangShenJudgmentSchema } from './types'
import type { SangShenJudgment, SangShenJudgmentInput } from './types'
export * from './types'
const same = (a: unknown, b: unknown) => JSON.stringify(detach(a)) === JSON.stringify(detach(b))
const sections: Record<string, string> = { 'I-01': 'A-8-1.', 'I-02a': 'A-8-1.', 'I-03': 'A-2-2.', 'I-04-1': 'A-8-2.', 'I-05': 'A-2-3.', 'I-07': 'A-2-3.' }

/** Final helper role for the supplied drain/support path. No candidate generation or success/damage judgment. */
export function evaluateSangShenJudgment(input: SangShenJudgmentInput) {
  const { producer, derived, context, natalCombination: natal } = input
  const pattern = patternJudgmentSchema.parse(input.patternJudgment)
  const sources = input.sangShenCandidates.map((c) => sangShenCandidateDataSchema.parse(c)).sort((a, b) => a.entityId.localeCompare(b.entityId))
  const yong = input.yongShenResult.judgments.map((j) => yongShenJudgmentSchema.parse(j))
  if (context.stage !== 'natal' || derived.scopeId !== context.scopeId || pattern.scopeId !== context.scopeId
    || !same(pattern.provenance.producerRef, producer.producerRef) || !same(natal.provenance.producerRef, producer.producerRef)
    || natal.provenance.producerSnapshotIdentity !== context.producerSnapshotIdentity
    || [...sources, ...yong].some((s) => s.scopeId !== context.scopeId || !same(s.provenance.producerRef, producer.producerRef))) throw new TypeError('Matching natal judgments/candidates/provenance required')
  if (new Set(sources.map((c) => c.entityId)).size !== sources.length || new Set(sources.map((c) => c.candidateId)).size !== sources.length
    || new Set(yong.map((j) => j.judgmentId)).size !== yong.length) throw new TypeError('Duplicate candidate/entity/judgment identity')
  const records = new Map<string, EvidenceRecord>()
  for (const r of [...derived.evidence.records, ...natal.bundle.evidence.records, ...input.yongShenResult.evidence.records, ...input.sangShenEvidence.records]) {
    const parsed = evidenceRecordSchema.parse(r), old = records.get(r.evidenceId)
    if (old && !same(old, parsed)) throw new TypeError('Conflicting evidence identity')
    records.set(parsed.evidenceId, parsed)
  }
  type Fact = { assessment?: ValueStatus; uncertaintyIds: string[]; evidenceIds: string[] }
  const facts = new Map<string, Fact>()
  for (const f of [...producer.facts, ...derived.hiddenObservations, ...derived.exposures, ...derived.roots]) {
    if (facts.has(f.id)) throw new TypeError('Duplicate fact identity')
    facts.set(f.id, f)
  }
  producer.relations.forEach((r) => { relationFactSchema.parse(r); facts.set(r.relationFactId, r) })
  natal.states.forEach((s) => runtimeStateSchema.parse(s))
  if (new Set(natal.states.map((s) => s.targetEntityId)).size !== natal.states.length) throw new TypeError('Ambiguous current state')
  const entities = producer.entities.filter((e) => e.origin === 'natal' && e.sourceScope === 'natal' && context.includedEntityIds.includes(e.entityId))
  const day = entities.find((e) => e.part === 'stem' && e.position === 'day')
  const globalBlocks = new Set([...context.uncertaintyIds, ...pattern.uncertainty.blockingIds])
  if (pattern.status !== 'confirmed' || pattern.assessment !== 'confirmed') globalBlocks.add('PATTERN_NOT_CONFIRMED')
  if (pattern.monthPatternTenGod !== '偏官') globalBlocks.add('OTHER_PATTERN_METHOD_NOT_SUPPORTED')
  if (!day || context.periodSelectionStatus !== 'confirmed') globalBlocks.add('NATAL_CONTEXT_UNRESOLVED')
  if (natal.states.some((s) => !natal.bundle.states.some((r) => r.stateId === s.stateId && same(r, s)))) globalBlocks.add('CURRENT_STATE_CATALOG_MISMATCH')
  const judgments: SangShenJudgment[] = [], roleStates: RoleStateContract[] = [], applications: ApplicationReference[] = []
  for (const source of sources) {
    const blocks = new Set([...globalBlocks, ...source.uncertainty.blockingIds]), proof = new Set<string>(), supporting = new Set<string>()
    const statuses: ValueStatus[] = [pattern.assessment, source.assessment]
    const needFact = (id: string) => {
      supporting.add(id); const f = facts.get(id); statuses.push(f?.assessment ?? 'unknown')
      if (!f || f.assessment !== 'confirmed' || f.uncertaintyIds.length) blocks.add(`CORE_FACT_UNRESOLVED:${id}`)
    }
    const needEvidence = (id: string | undefined) => {
      const r = id && records.get(id); statuses.push(r ? r.status : 'unknown')
      if (!r || r.status !== 'confirmed' || r.usage !== 'runtime-evidence' || r.uncertaintyIds.length || !r.verification.checkedByRef || !r.verification.basisEvidenceIds.length) { blocks.add(`CORE_EVIDENCE_UNRESOLVED:${id ?? 'missing'}`); return }
      proof.add(r.evidenceId)
    }
    ;[...pattern.supportingFactIds, ...source.supportingFactIds].forEach(needFact)
    ;[...pattern.evidenceIds, ...source.evidenceIds].forEach(needEvidence)
    for (const ruleId of SANG_SHEN_RULE_IDS) {
      const id = derived.authority.ruleReceiptIds[ruleId], r = id && records.get(id); needEvidence(id)
      if (!r || r.ruleId !== ruleId || r.documentRevision !== 179 || r.sourceRef.kind !== 'source-document'
        || r.sourceRef.document.documentId !== 'A' || r.sourceRef.document.section !== sections[ruleId]) blocks.add(`DIRECT_RULE_RECEIPT_MISSING:${ruleId}`)
    }
    if (source.assessment !== 'confirmed' || source.status === 'deferred') blocks.add('CANDIDATE_PREMISES_NOT_CONFIRMED')
    if (source.sourcePatternJudgmentId !== pattern.judgmentId) blocks.add('CANDIDATE_PATTERN_LINK_MISMATCH')
    if (!SANG_SHEN_RULE_IDS.every((id) => (source.sourceRuleIds as string[]).includes(id)) || !source.supportingFactIds.length || !source.evidenceIds.length) blocks.add('CANDIDATE_RULE_OR_PROOF_MISSING')
    const entity = entities.find((e) => e.entityId === source.entityId && e.part === 'stem')
    if (!entity || entity.value !== source.stem || entity.assessment !== 'confirmed' || entity.uncertaintyIds.length) blocks.add('CANDIDATE_ENTITY_UNRESOLVED')
    if (entity) needFact(entity.canonicalFactRef)
    if (day) { needFact(day.canonicalFactRef); if (day.assessment !== 'confirmed' || day.uncertaintyIds.length) blocks.add('DAY_ENTITY_UNRESOLVED') }
    const godFact = producer.facts.find((f) => f.canonicalPointer === `/chart/basicRelations/${entity?.position}/value/stemTenGod`)
    const god = godFact && tenGodSchema.is(godFact.value) ? godFact.value : null
    if (godFact) needFact(godFact.id)
    if (!god || god !== source.tenGod) blocks.add('TEN_GOD_HANDOFF_MISMATCH')
    const excluded = source.status === 'rejected' && !source.functionBasis.relationFactIds.length && !source.relatedYongShenIds.length
    const linked = source.relatedYongShenIds.map((id) => yong.find((j) => j.judgmentId === id))
    const stateEntities = sortedUnique([source.entityId, ...(day ? [day.entityId] : []), ...source.functionBasis.relatedYongEntityIds])
    const states = natal.states.filter((s) => stateEntities.includes(s.targetEntityId)).sort((a, b) => a.stateId.localeCompare(b.stateId))
    if (!excluded) {
      if (source.status !== 'candidate') blocks.add('ELIGIBLE_CANDIDATE_REQUIRED')
      if (!linked.length || linked.some((j) => !j || j.status !== 'confirmed' || j.assessment !== 'confirmed' || j.tenGod !== pattern.monthPatternTenGod
        || j.sourcePatternJudgmentId !== pattern.judgmentId || j.uncertainty.blockingIds.length)) blocks.add('RELATED_YONGSHEN_NOT_CONFIRMED')
      if (!same(sortedUnique(linked.flatMap((j) => j ? [j.entityId] : [])), source.functionBasis.relatedYongEntityIds)) blocks.add('RELATED_YONGSHEN_ENTITY_HANDOFF_MISMATCH')
      for (const j of linked) if (j) {
        j.supportingFactIds.forEach(needFact); j.evidenceIds.forEach(needEvidence); statuses.push(j.assessment)
        const target = entities.find((e) => e.entityId === j.entityId && e.part === 'stem')
        if (!target || target.value !== j.stem || target.assessment !== 'confirmed' || target.uncertaintyIds.length) blocks.add('RELATED_YONGSHEN_ENTITY_HANDOFF_MISMATCH')
        if (!same(j.runtimeState, natal.states.find((s) => s.targetEntityId === j.entityId))) blocks.add('RELATED_YONGSHEN_CURRENT_STATE_MISMATCH')
        const role = input.yongShenResult.roleStates.find((r) => r.roleStateId === j.roleStateRef)
        if (!role || !roleStateSchema.is(role) || role.role !== '용신' || role.entityId !== j.entityId || role.provisional
          || role.status !== 'evaluated' || role.validScopeId !== context.scopeId) blocks.add('YONGSHEN_ROLE_REFERENCE_INVALID')
      }
      if (god !== '偏印' && god !== '印綬') blocks.add('FUNCTION_PATH_RESOURCE_HANDOFF_INVALID')
      const path = source.functionBasis.relationFactIds.map((id) => producer.relations.find((r) => r.relationFactId === id))
      if (!path.length || path.some((r) => !r || r.kind !== 'stem-generates' || r.existence !== 'present'
        || !same(r.producerRef, producer.producerRef) || !r.participantEntityIds.every((id) => entities.some((e) => e.entityId === id)))) blocks.add('SUPPLIED_FUNCTION_PATH_INVALID')
      source.functionBasis.relationFactIds.forEach(needFact)
      for (const j of linked) if (j && !path.some((r) => r?.sourceEntityId === j.entityId && r.targetEntityId === source.entityId)) blocks.add('YONGSHEN_TO_HELPER_EDGE_MISSING')
      if (!path.some((r) => r?.sourceEntityId === source.entityId && r.targetEntityId === day?.entityId)) blocks.add('HELPER_TO_DAY_EDGE_MISSING')
      for (const r of path) if (r) {
        const coverage = producer.coverage.find((c) => c.coverageId === r.coverageRef)
        if (!coverage || !relationCoverageSchema.is(coverage) || coverage.kind !== r.kind || coverage.scopeId !== r.scopeId
          || coverage.completion !== 'complete' || coverage.uncertaintyIds.length || !same(coverage.producerRef, producer.producerRef)
          || !source.functionBasis.coverageRefs.includes(coverage.coverageId)
          || !coverage.investigatedParticipantSets.some((ids) => same([...ids].sort(), [...r.participantEntityIds].sort()))
          || !producer.observationScopes.some((s) => s.scopeId === coverage.scopeId && r.participantEntityIds.every((id) => s.entityIds.includes(id)))) blocks.add('FUNCTION_COVERAGE_UNRESOLVED')
      }
      if (!source.functionBasis.rootFactIds.length) blocks.add('DOCUMENTED_ROOT_REQUIRED')
      for (const id of source.functionBasis.rootFactIds) {
        needFact(id); const root = derived.roots.find((r) => r.id === id)
        const branch = entities.find((e) => e.entityId === root?.rootBranchEntityId && e.part === 'branch')
        if (!root || !branch || root.stemEntityId !== source.entityId || root.rootExistence !== 'present' || root.rootScope !== 'natal'
          || root.scopeId !== context.scopeId || root.hiddenStemSystemId !== 'filune-a179' || !root.hiddenStemMatched
          || !same(root.provenance.producerRef, producer.producerRef) || root.provenance.assessmentBasis.localCoverage !== 'complete'
          || root.provenance.assessmentBasis.legacyFallback || !derived.authority.entries.some((e) => e.branch === branch.value && e.completeness === 'complete')) { blocks.add('ROOT_LOCAL_AUTHORITY_INVALID'); continue }
        root.provenance.assessmentBasis.parentFactIds.forEach(needFact); root.provenance.assessmentBasis.receiptEvidenceIds.forEach(needEvidence)
        needEvidence([...records.values()].find((r) => r.sourceType === 'deterministic-calculation' && r.verification.claimRef === root.id)?.evidenceId)
      }
      if (!same(states, source.runtimeStates)) blocks.add('CANDIDATE_CURRENT_STATE_HANDOFF_MISMATCH')
      for (const id of stateEntities) {
        const s = states.find((s) => s.targetEntityId === id && s.scopeId === context.scopeId)
        if (!s || s.functionalState === 'unknown' || s.uncertaintyIds.length) { blocks.add('CURRENT_FUNCTION_UNKNOWN'); statuses.push('unknown') }
        else if (s.functionalState === 'stopped') blocks.add('I02A_FUNCTION_STOPPED_HELPER_DEFERRED')
      }
    }
    // Preserve supplied control context; no damage/bing classification or automatic rejection.
    for (const id of source.conflictingFactIds) if (!producer.relations.some((r) => r.relationFactId === id && r.kind === 'stem-controls'
      && r.targetEntityId === source.entityId && same(r.producerRef, producer.producerRef))) blocks.add('CONFLICT_HANDOFF_UNAVAILABLE')
    const status: SangShenJudgment['status'] = blocks.size ? 'deferred' : excluded ? 'rejected' : 'confirmed'
    const assessment = combineAssessment(...statuses), roleRef = status === 'confirmed' ? recordId('sangshen-role', [context.scopeId, source.entityId]) : null
    if (roleRef) {
      const application: ApplicationReference = { applicationId: recordId('sangshen-application', [context.scopeId, source.candidateId]), executionId: context.executionId, scopeId: context.scopeId, ruleId: 'I-03', ruleVersion: 'A179' }
      applications.push(application)
      roleStates.push(roleStateSchema.parse({ contractVersion: '1', roleStateId: roleRef, subjectKind: 'entity', entityId: source.entityId, structureRef: null,
        role: '상신', status: 'evaluated', sourceRuleIds: [...SANG_SHEN_RULE_IDS], evidenceIds: [...proof].sort(), validScopeId: context.scopeId,
        provisional: false, uncertaintyIds: [], origin: 'rule-result', applicationRef: application, usage: 'runtime-result' }))
    }
    const reasons = status === 'confirmed' ? ['I03_CONFIRMED_STRUCTURAL_HELPER_FUNCTION', 'I041_EXISTING_DRAIN_AND_DAY_SUPPORT_PATH', 'NOT_CONFIRMED_BY_CANDIDATE_STATUS_ALONE']
      : status === 'rejected' ? ['SOURCE_EXCLUDED_FROM_SUPPORTED_FUNCTION_PATH'] : ['CORE_FUNCTION_OR_PREMISES_UNRESOLVED', ...blocks]
    const trace: SangShenJudgment['trace'] = SANG_SHEN_RULE_IDS.map((ruleId) => ({ ruleId,
      outcome: ruleId === 'I-07' ? 'context-only' : status === 'confirmed' ? 'satisfied' : status,
      reasonCodes: ruleId === 'I-02a' ? [states.some((s) => s.functionalState === 'stopped') ? 'STOPPED_FUNCTION_DEFERRED_NOT_AUTOMATIC_REJECTION'
        : states.some((s) => s.functionalState === 'weakened') ? 'WEAKENED_FUNCTION_RETAINED_NO_INVENTED_THRESHOLD' : 'ACTIVE_ALONE_DOES_NOT_CONFIRM_ROLE']
        : ruleId === 'I-07' ? ['SUPPLIED_RELATIONS_ONLY_NO_DAMAGE_OR_SUCCESS_JUDGMENT'] : reasons,
      candidateIds: [source.candidateId], factIds: ruleId === 'I-02a' ? states.map((s) => s.stateId) : [...supporting].sort(), evidenceIds: [...proof].sort() }))
    judgments.push(sangShenJudgmentSchema.parse({ judgmentId: recordId('sangshen-judgment', [context.scopeId, source.entityId]), entityId: source.entityId,
      stem: source.stem, tenGod: god, status, relatedYongShenIds: source.relatedYongShenIds, sourceCandidateIds: [source.candidateId],
      supportingFactIds: [...supporting].sort(), conflictingFactIds: source.conflictingFactIds, sourceRuleIds: [...SANG_SHEN_RULE_IDS], evidenceIds: [...proof].sort(),
      reasonCodes: reasons, assessment: assessment === 'confirmed' && blocks.size ? 'provisional' : assessment,
      uncertainty: { blockingIds: [...blocks].sort(), contextIds: sortedUnique([...source.uncertainty.contextIds, ...pattern.uncertainty.contextIds]) },
      trace, sourcePatternJudgmentId: pattern.judgmentId, runtimeStates: states, roleStateRef: roleRef, functionBasis: { relationFactIds: source.functionBasis.relationFactIds, rootFactIds: source.functionBasis.rootFactIds, coverageRefs: source.functionBasis.coverageRefs },
      contextFactIds: source.contextFactIds, contextEvidenceIds: source.contextEvidenceIds, sourceScope: 'natal', scopeId: context.scopeId,
      provenance: { producerRef: producer.producerRef, ruleVersion: 'A179', sourceDocument: source.provenance.sourceDocument, method: 'existing-candidate-linked-path-root-and-current-function-validation-only' } }))
  }
  const evidence = evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('sangshen-judgment-evidence', [context.scopeId]), records: [...records.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) })
  const inheritedApplications = new Map<string, ApplicationReference>()
  for (const app of [...natal.bundle.applications, ...input.yongShenResult.bundle.applications]) {
    const old = inheritedApplications.get(app.applicationId)
    if (old && !same(old, app)) throw new TypeError('Conflicting application identity')
    inheritedApplications.set(app.applicationId, app)
  }
  const bundle = validateContractBundle({ ...detach(natal.bundle), evidence,
    roles: [...input.yongShenResult.bundle.roles, ...roleStates], applications: [...inheritedApplications.values(), ...applications],
    factIds: sortedUnique([...input.yongShenResult.bundle.factIds, ...producer.relations.map((r) => r.relationFactId)]) })
  return detach({ judgments, roleStates, applications, evidence, bundle, deferred: sources.length ? [] : [{ reasonCode: 'SOURCE_CANDIDATE_LIST_EMPTY', sourceRuleIds: [...SANG_SHEN_RULE_IDS] }] })
}
