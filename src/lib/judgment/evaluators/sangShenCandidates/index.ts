import { evidenceContextSchema, evidenceRecordSchema, relationCoverageSchema, relationFactSchema, roleStateSchema, runtimeStateSchema } from '../../contracts'
import type { EvidenceRecord, RelationFactContract } from '../../contracts'
import type { ValueStatus } from '../../../canonical/types'
import { combineAssessment, detach, recordId, sortedUnique } from '../../producers/shared'
import { patternJudgmentSchema } from '../patternJudgment/types'
import { yongShenJudgmentSchema } from '../yongShenJudgment/types'
import { tenGodSchema } from '../patternCandidates/types'
import { SANG_SHEN_RULE_IDS, sangShenCandidateSchema } from './types'
import type { SangShenCandidate, SangShenCandidateInput } from './types'
export * from './types'
const ruleSections: Record<string, string> = { 'I-01': 'A-8-1.', 'I-02a': 'A-8-1.', 'I-03': 'A-2-2.', 'I-04-1': 'A-8-2.', 'I-05': 'A-2-3.', 'I-07': 'A-2-3.' }
const same = (a: unknown, b: unknown) => JSON.stringify(detach(a)) === JSON.stringify(detach(b))

/** A narrow I-04-1 drain/support path review; no general-purpose helper theory or final role assignment. */
export function evaluateSangShenCandidates(input: SangShenCandidateInput) {
  const { producer, derived, natalCombination: natal, context } = input
  const pattern = patternJudgmentSchema.parse(input.patternJudgment)
  const yong = input.yongShenResult.judgments.map((j) => yongShenJudgmentSchema.parse(j))
  if (context.stage !== 'natal' || pattern.scopeId !== context.scopeId || derived.scopeId !== context.scopeId
    || !same(pattern.provenance.producerRef, producer.producerRef) || !same(natal.provenance.producerRef, producer.producerRef)
    || natal.provenance.producerSnapshotIdentity !== context.producerSnapshotIdentity
    || yong.some((j) => j.scopeId !== context.scopeId || !same(j.provenance.producerRef, producer.producerRef))) throw new TypeError('Matching natal pattern/yongshen/fact context required')
  const catalog = new Map<string, EvidenceRecord>()
  for (const r of [...derived.evidence.records, ...natal.bundle.evidence.records, ...input.yongShenResult.evidence.records]) {
    const parsed = evidenceRecordSchema.parse(r), old = catalog.get(r.evidenceId)
    if (old && !same(old, parsed)) throw new TypeError('Conflicting evidence identity')
    catalog.set(parsed.evidenceId, parsed)
  }
  type Fact = { assessment?: ValueStatus; evidenceIds: string[]; uncertaintyIds: string[] }
  const facts = new Map<string, Fact>()
  for (const f of [...producer.facts, ...derived.exposures, ...derived.hiddenObservations, ...derived.roots]) {
    if (facts.has(f.id)) throw new TypeError('Duplicate fact ID')
    facts.set(f.id, f)
  }
  natal.states.forEach((s) => { runtimeStateSchema.parse(s); facts.set(s.stateId, s) })
  if (new Set(natal.states.map((s) => s.targetEntityId)).size !== natal.states.length) throw new TypeError('Ambiguous natal state')
  const entities = producer.entities.filter((e) => e.origin === 'natal' && e.sourceScope === 'natal' && e.part === 'stem'
    && context.includedEntityIds.includes(e.entityId)).sort((a, b) => a.entityId.localeCompare(b.entityId))
  const day = entities.find((e) => e.position === 'day')
  const rawRelated = yong.filter((j) => j.status === 'confirmed' && j.tenGod === pattern.monthPatternTenGod)
  const related = rawRelated.filter((j) => entities.some((e) => e.entityId === j.entityId))
  const globalBlocks = new Set([...context.uncertaintyIds, ...pattern.uncertainty.blockingIds])
  if (rawRelated.length !== related.length) globalBlocks.add('RELATED_YONGSHEN_OUTSIDE_NATAL_SCOPE')
  if (related.some((j) => j.sourcePatternJudgmentId !== pattern.judgmentId)) globalBlocks.add('RELATED_YONGSHEN_PATTERN_MISMATCH')
  if (pattern.status !== 'confirmed' || pattern.assessment !== 'confirmed') globalBlocks.add('PATTERN_NOT_CONFIRMED')
  if (pattern.monthPatternTenGod !== '偏官') globalBlocks.add('OTHER_PATTERN_FUNCTION_REQUIRES_DOCUMENTED_METHOD')
  if (!related.length || related.some((j) => j.assessment !== 'confirmed')) globalBlocks.add('MONTH_PATTERN_YONGSHEN_NOT_CONFIRMED')
  if (!day || context.periodSelectionStatus !== 'confirmed') globalBlocks.add('NATAL_DAY_OR_CONTEXT_UNAVAILABLE')
  if (natal.states.some((s) => !natal.bundle.states.some((r) => r.stateId === s.stateId && same(r, s)))) globalBlocks.add('CURRENT_STATE_CATALOG_MISMATCH')
  const relation = (from: string, to: string) => {
    if (from === to) return { records: [] as RelationFactContract[], surveys: [] as typeof producer.coverage, present: false, complete: true, uncertain: false }
    const surveys = producer.coverage.filter((c) => c.kind === 'stem-generates' && c.universeEntityIds.includes(from) && c.universeEntityIds.includes(to)
      && c.investigatedParticipantSets.some((p) => same([...p].sort(), [from, to].sort())))
    const matches = producer.relations.filter((r) => r.kind === 'stem-generates' && r.sourceEntityId === from && r.targetEntityId === to)
    for (const s of surveys) {
      relationCoverageSchema.parse(s)
      if (!same(s.producerRef, producer.producerRef) || !producer.observationScopes.some((o) => o.scopeId === s.scopeId && o.entityIds.includes(from) && o.entityIds.includes(to))) throw new TypeError('Relation coverage lineage mismatch')
    }
    for (const r of matches) {
      relationFactSchema.parse(r)
      if (!same(r.producerRef, producer.producerRef) || !surveys.some((s) => s.coverageId === r.coverageRef && s.scopeId === r.scopeId)) throw new TypeError('Relation fact lineage mismatch')
      facts.set(r.relationFactId, r)
    }
    return { uncertain: matches.some((r) => r.existence === 'unknown' || r.assessment !== 'confirmed' || r.uncertaintyIds.length > 0), records: matches, surveys, present: matches.some((r) => r.existence === 'present'), complete: surveys.some((s) => s.completion === 'complete' && !s.uncertaintyIds.length) }
  }
  const candidates: SangShenCandidate[] = []
  for (const entity of entities) {
    const blocks = new Set(globalBlocks), proof = new Set<string>(), supporting = new Set<string>(), statuses: ValueStatus[] = [pattern.assessment]
    const needFact = (id: string) => {
      const f = facts.get(id); supporting.add(id); statuses.push(f?.assessment ?? 'unknown')
      if (!f || f.assessment !== 'confirmed' || !Array.isArray(f.uncertaintyIds) || f.uncertaintyIds.length) blocks.add(`CORE_FACT_UNRESOLVED:${id}`)
    }
    const needProof = (id: string | undefined) => {
      const r = id && catalog.get(id); statuses.push(r ? r.status : 'unknown')
      if (!r || r.status !== 'confirmed' || r.usage !== 'runtime-evidence' || r.uncertaintyIds.length || !r.verification.checkedByRef || !r.verification.basisEvidenceIds.length) { blocks.add(`CORE_EVIDENCE_UNRESOLVED:${id ?? 'missing'}`); return }
      proof.add(r.evidenceId)
    }
    pattern.supportingFactIds.forEach(needFact); pattern.evidenceIds.forEach(needProof)
    for (const ruleId of SANG_SHEN_RULE_IDS) {
      const id = derived.authority.ruleReceiptIds[ruleId], r = id && catalog.get(id); needProof(id)
      if (!r || r.ruleId !== ruleId || r.documentRevision !== 179 || r.sourceRef.kind !== 'source-document' || r.sourceRef.document.documentId !== 'A' || r.sourceRef.document.documentRevision !== 179 || r.sourceRef.document.section !== ruleSections[ruleId]) blocks.add(`DIRECT_RULE_RECEIPT_MISSING:${ruleId}`)
    }
    needFact(entity.canonicalFactRef)
    if (entity.assessment !== 'confirmed' || entity.uncertaintyIds.length) blocks.add('CANDIDATE_ENTITY_UNCERTAIN')
    if (day) needFact(day.canonicalFactRef)
    const godFact = producer.facts.find((f) => f.canonicalPointer === `/chart/basicRelations/${entity.position}/value/stemTenGod`)
    const god = godFact && tenGodSchema.is(godFact.value) ? godFact.value : null
    if (!godFact || !god) blocks.add('TEN_GOD_UNAVAILABLE'); else needFact(godFact.id)
    const resource = god === '偏印' || god === '印綬'
    const witnesses: string[] = [], coverageIds: string[] = [], relatedIds: string[] = [], relatedEntities: string[] = []
    let potential = false, pathCoverageUnknown = false
    for (const y of related) {
      y.supportingFactIds.forEach(needFact); y.evidenceIds.forEach(needProof); statuses.push(y.assessment)
      if (y.uncertainty.blockingIds.length) blocks.add('YONGSHEN_HAS_BLOCKING_UNCERTAINTY')
      const role = input.yongShenResult.roleStates.find((r) => r.roleStateId === y.roleStateRef)
      if (!role || !roleStateSchema.is(role) || role.role !== '용신' || role.entityId !== y.entityId || role.provisional || role.status !== 'evaluated' || role.usage !== 'runtime-result' || role.validScopeId !== context.scopeId) blocks.add('YONGSHEN_ROLE_REFERENCE_UNAVAILABLE')
      const first = relation(y.entityId, entity.entityId), second = day ? relation(entity.entityId, day.entityId) : null
      coverageIds.push(...first.surveys.map((s) => s.coverageId), ...(second?.surveys.map((s) => s.coverageId) ?? []))
      if (!first.complete || !second?.complete || first.uncertain || second?.uncertain) pathCoverageUnknown = true
      if (resource && first.present && second?.present) {
        potential = true; relatedIds.push(y.judgmentId); relatedEntities.push(y.entityId)
        const path = [...first.records, ...second.records]
        for (const r of path) { needFact(r.relationFactId); witnesses.push(r.relationFactId); if (r.existence !== 'present') blocks.add('FUNCTION_RELATION_NOT_PRESENT') }
        for (const s of [...first.surveys, ...second.surveys]) if (s.completion !== 'complete' || s.uncertaintyIds.length) blocks.add('FUNCTION_COVERAGE_UNCERTAIN')
      }
    }
    if (pathCoverageUnknown) blocks.add('FUNCTION_RELATION_COVERAGE_INCOMPLETE')
    const roots = derived.roots.filter((r) => r.scopeId === context.scopeId && r.rootScope === 'natal' && r.stemEntityId === entity.entityId
      && r.rootExistence === 'present' && producer.entities.some((e) => e.entityId === r.rootBranchEntityId && e.origin === 'natal'
        && context.includedEntityIds.includes(e.entityId) && derived.authority.entries.some((entry) => entry.branch === e.value && entry.completeness === 'complete')))
    const states = natal.states.filter((s) => [entity.entityId, day?.entityId, ...relatedEntities].includes(s.targetEntityId)).sort((a, b) => a.stateId.localeCompare(b.stateId))
    if (potential) {
      if (!roots.length) blocks.add('DOCUMENTED_ROOT_BASIS_UNAVAILABLE')
      for (const root of roots) {
        needFact(root.id)
        if (root.hiddenStemSystemId !== 'filune-a179' || !same(root.provenance.producerRef, producer.producerRef) || !root.hiddenStemMatched
          || root.provenance.assessmentBasis.localCoverage !== 'complete' || root.provenance.assessmentBasis.legacyFallback) blocks.add('ROOT_LOCAL_AUTHORITY_INCOMPLETE')
        root.provenance.assessmentBasis.parentFactIds.forEach(needFact); root.provenance.assessmentBasis.receiptEvidenceIds.forEach(needProof)
        const receipt = [...catalog.values()].find((r) => r.verification.claimRef === root.id && r.sourceType === 'deterministic-calculation')
        needProof(receipt?.evidenceId)
      }
      for (const id of sortedUnique([entity.entityId, ...(day ? [day.entityId] : []), ...relatedEntities])) {
        const s = states.find((s) => s.targetEntityId === id)
        if (!s || s.functionalState === 'unknown' || s.uncertaintyIds.length) { blocks.add('FUNCTION_STATE_UNKNOWN'); statuses.push('unknown') }
        else if (s.functionalState === 'stopped') blocks.add('FUNCTION_PATH_STOPPED_REVIEW_DEFERRED')
      }
    }
    const conflicts = producer.relations.filter((r) => r.kind === 'stem-controls' && r.targetEntityId === entity.entityId
      && r.participantEntityIds.every((id) => entities.some((e) => e.entityId === id)))
    conflicts.forEach((r) => {
      relationFactSchema.parse(r)
      const survey = producer.coverage.find((s) => s.coverageId === r.coverageRef && s.kind === r.kind && s.scopeId === r.scopeId)
      if (!same(r.producerRef, producer.producerRef) || !survey || !same(survey.producerRef, producer.producerRef)) throw new TypeError('Conflicting relation lineage mismatch')
    })
    const status: SangShenCandidate['status'] = blocks.size ? 'deferred' : potential ? 'candidate' : 'rejected'
    const reason = potential ? 'I03_I041_DRAIN_AND_DAY_SUPPORT_PATH' : 'NO_SUPPORTED_DRAIN_AND_DAY_SUPPORT_PATH_IN_THIS_SLICE'
    const contextFacts = sortedUnique([...conflicts.map((r) => r.relationFactId), ...states.map((s) => s.stateId)])
    const contextEvidence = sortedUnique([...pattern.contextEvidenceIds, ...related.flatMap((j) => j.contextEvidenceIds),
      ...producer.relations.filter((r) => witnesses.includes(r.relationFactId)).flatMap((r) => r.evidenceIds), ...conflicts.flatMap((r) => r.evidenceIds),
      ...states.flatMap((s) => s.evidenceIds)].filter((id) => !proof.has(id)))
    const assessment = combineAssessment(...statuses)
    const trace: SangShenCandidate['trace'] = [
      { ruleId: 'I-01', outcome: globalBlocks.size ? 'deferred' : 'satisfied', reasonCodes: ['EXISTING_MONTH_PATTERN_AND_YONGSHEN_CONSUMED'], factIds: pattern.supportingFactIds, evidenceIds: pattern.evidenceIds.filter((id) => proof.has(id)) },
      { ruleId: 'I-03', outcome: status === 'candidate' ? 'satisfied' : status, reasonCodes: [reason, 'EXISTING_YONGSHEN_ROLE_IS_NEITHER_AUTOMATIC_HELPER_NOR_EXCLUSION'], factIds: witnesses, evidenceIds: [...proof].sort() },
      { ruleId: 'I-04-1', outcome: potential ? status === 'deferred' ? 'deferred' : 'satisfied' : pathCoverageUnknown ? 'deferred' : 'rejected', reasonCodes: ['TWO_EDGE_FUNCTIONAL_PATH_NOT_SINGLE_GENERATION_SHORTCUT'], factIds: witnesses, evidenceIds: [...proof].sort() },
      { ruleId: 'I-05', outcome: potential ? status === 'deferred' ? 'deferred' : roots.length ? 'satisfied' : 'deferred' : 'context-only', reasonCodes: ['ROOT_EXISTENCE_ONLY_NO_COUNT_OR_STRENGTH'], factIds: roots.map((r) => r.id), evidenceIds: [...proof].sort() },
      { ruleId: 'I-07', outcome: 'context-only', reasonCodes: ['EXISTING_DIRECTED_RELATIONS_NOT_RECALCULATED', 'INCOMING_CONTROL_RECORDED_NO_DAMAGE_ROLE_ASSIGNED'], factIds: [...witnesses, ...conflicts.map((r) => r.relationFactId)], evidenceIds: [] },
      { ruleId: 'I-02a', outcome: states.some((s) => s.functionalState === 'stopped') ? 'deferred' : 'context-only', reasonCodes: ['SUPPLIED_FUNCTION_STATE_PRESERVED_NO_AUTOMATIC_REJECTION'], factIds: states.map((s) => s.stateId), evidenceIds: [] },
    ]
    candidates.push(sangShenCandidateSchema.parse({ candidateId: recordId('sangshen-candidate', [context.scopeId, entity.entityId]), entityId: entity.entityId, stem: entity.value,
      tenGod: god, relatedYongShenIds: sortedUnique(relatedIds), status, supportingFactIds: [...supporting].sort(), conflictingFactIds: sortedUnique(conflicts.map((r) => r.relationFactId)),
      sourceRuleIds: [...SANG_SHEN_RULE_IDS], evidenceIds: [...proof].sort(), assessment: assessment === 'confirmed' && blocks.size ? 'provisional' : assessment,
      uncertainty: { blockingIds: [...blocks].sort(), contextIds: sortedUnique([...pattern.uncertainty.contextIds, ...related.flatMap((j) => j.uncertainty.contextIds),
        ...contextEvidence.flatMap((id) => catalog.get(id)?.uncertaintyIds ?? []), ...conflicts.flatMap((r) => r.uncertaintyIds)]) },
      functionBasis: { mechanism: '칠살 역용의 설·일간 생조 검토', relatedYongEntityIds: sortedUnique(relatedEntities), relationFactIds: sortedUnique(witnesses),
        coverageRefs: sortedUnique(coverageIds), rootFactIds: potential ? roots.map((r) => r.id).sort() : [],
        existingYongRoleIds: yong.filter((j) => j.status === 'confirmed' && j.entityId === entity.entityId).map((j) => j.roleStateRef!).sort() },
      runtimeStates: states, sourcePatternJudgmentId: pattern.judgmentId, trace, contextFactIds: contextFacts, contextEvidenceIds: contextEvidence,
      sourceScope: 'natal', scopeId: context.scopeId, provenance: { producerRef: producer.producerRef, ruleVersion: 'A179',
        sourceDocument: { documentId: 'A', documentRevision: 179, path: 'src/docs/source/A_rev179.md', section: 'A-8-1 / A-8-2; A-2-2 I-03; A-2-3 I-05/I-07', location: 'I-01 / I-03 / I-04-1 / I-05 / I-07 / I-02a' },
        method: 'existing-judgments-and-facts-only-drain-and-support-helper-candidate' } }))
  }
  return detach({ candidates, evidence: evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('sangshen-evidence', [context.scopeId]),
    records: [...catalog.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) }), roleStates: [] })
}
