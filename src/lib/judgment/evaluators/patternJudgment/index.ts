import { evidenceContextSchema, evidenceRecordSchema, runtimeStateSchema } from '../../contracts'
import type { EvidenceRecord } from '../../contracts'
import type { ValueStatus } from '../../../canonical/types'
import { combineAssessment, detach, recordId, sortedUnique } from '../../producers/shared'
import { patternCandidateSchema, tenGodSchema } from '../patternCandidates/types'
import type { PatternCandidate } from '../patternCandidates/types'
import { patternJudgmentSchema } from './types'
import type { PatternJudgment, PatternJudgmentInput } from './types'
export * from './types'

type Component = PatternCandidate['basis']['components'][number]
const peer = (tenGod: string) => tenGod === '比肩' || tenGod === '劫財'
const elementGroup = (tenGod: string) => ['比肩劫財', '食神傷官', '偏財正財', '偏官正官', '偏印印綬'].find((pair) => pair.includes(tenGod))

/** Structural pattern only. No candidate, hidden-stem, ten-god, exposure, root or combination recalculation. */
export function evaluatePatternJudgment(input: PatternJudgmentInput) {
  const { producer, derived, natalCombination: natal, context } = input
  const candidates = input.candidates.map((c) => patternCandidateSchema.parse(c)).sort((a, b) => a.candidateId.localeCompare(b.candidateId))
  if (context.stage !== 'natal' || natal.sourceScope !== 'natal' || derived.scopeId !== context.scopeId
    || natal.provenance.producerSnapshotIdentity !== context.producerSnapshotIdentity
    || candidates.some((c) => c.scopeId !== context.scopeId || JSON.stringify(detach(c.provenance.producerRef)) !== JSON.stringify(detach(producer.producerRef)))
    || JSON.stringify(detach(natal.provenance.producerRef)) !== JSON.stringify(detach(producer.producerRef))) throw new TypeError('Matching natal candidate/fact context required')
  if (new Set(candidates.map((c) => c.candidateId)).size !== candidates.length) throw new TypeError('Duplicate candidate ID')
  natal.states.forEach((state) => runtimeStateSchema.parse(state))
  if (new Set(natal.states.map((s) => s.targetEntityId)).size !== natal.states.length) throw new TypeError('Ambiguous natal states')
  const catalog = new Map<string, EvidenceRecord>()
  for (const r of [...derived.evidence.records, ...natal.bundle.evidence.records]) {
    const existing = catalog.get(r.evidenceId)
    if (existing && JSON.stringify(detach(existing)) !== JSON.stringify(detach(r))) throw new TypeError('Conflicting evidence identity')
    catalog.set(r.evidenceId, evidenceRecordSchema.parse(r))
  }
  type Fact = { assessment?: ValueStatus; uncertaintyIds: string[]; evidenceIds: string[] }
  const facts = new Map<string, Fact>()
  for (const f of [...producer.facts, ...derived.hiddenObservations, ...derived.exposures, ...derived.roots]) {
    if (facts.has(f.id)) throw new TypeError('Duplicate fact ID')
    facts.set(f.id, f)
  }
  natal.states.forEach((s) => facts.set(s.stateId, s))
  natal.relations.forEach((r) => facts.set(r.relationFactId, r))
  for (const c of candidates) {
    if ([...c.supportingFactIds, ...c.conflictingFactIds, ...c.basis.rootFactIds].some((id) => !facts.has(id))) throw new TypeError('Candidate fact reference unavailable')
  }
  const receiptAssessments: ValueStatus[] = []
  const blocking = new Set<string>(context.uncertaintyIds), core = new Set<string>(), proof = new Set<string>()
  const block = (reason: string) => blocking.add(reason)
  if (context.periodSelectionStatus !== 'confirmed') block('NATAL_CONTEXT_PERIOD_UNRESOLVED')
  const requireFact = (id: string) => {
    const f = facts.get(id)
    if (!f) { block(`FACT_MISSING:${id}`); return }
    core.add(id)
    if (f.assessment !== 'confirmed') block(`CORE_FACT_NOT_CONFIRMED:${id}`)
    if (!Array.isArray(f.uncertaintyIds) || f.uncertaintyIds.length) block(`CORE_FACT_UNCERTAINTY:${id}`)
  }
  const requireProof = (id: string | undefined) => {
    const r = id && catalog.get(id)
    receiptAssessments.push(r ? r.status : 'unknown')
    if (!r || r.status !== 'confirmed' || r.usage !== 'runtime-evidence' || r.uncertaintyIds.length
      || !r.verification.checkedByRef || !r.verification.basisEvidenceIds.length) { block(`CORE_RECEIPT_NOT_CONFIRMED:${id ?? 'missing'}`); return }
    proof.add(r.evidenceId)
  }
  const requireDerived = (f: typeof derived.hiddenObservations[number] | typeof derived.exposures[number]) => {
    requireFact(f.id)
    if (f.scopeId !== context.scopeId || f.hiddenStemSystemId !== 'filune-a179'
      || JSON.stringify(detach(f.provenance.producerRef)) !== JSON.stringify(detach(producer.producerRef))) block(`DERIVED_LINEAGE_MISMATCH:${f.id}`)
    const basis = f.provenance.assessmentBasis
    if (!basis || basis.localCoverage !== 'complete' || basis.legacyFallback || !basis.receiptEvidenceIds.length) {
      block(`LOCAL_AUTHORITY_UNAVAILABLE:${f.id}`); return
    }
    basis.parentFactIds.forEach(requireFact)
    basis.receiptEvidenceIds.forEach(requireProof)
    const receipts = [...catalog.values()].filter((r) => r.sourceType === 'deterministic-calculation' && r.verification.claimRef === f.id)
    if (receipts.length !== 1) block(`FACT_RECEIPT_AMBIGUOUS:${f.id}`)
    else requireProof(receipts[0].evidenceId)
  }
  const ruleIds: PatternJudgment['sourceRuleIds'] = ['C-10', 'I-01', 'I-02', 'I-02a']
  for (const ruleId of ruleIds) {
    const ref = derived.authority.ruleReceiptIds[ruleId]
    const receipt = ref && catalog.get(ref)
    requireProof(ref)
    if (!receipt || receipt.ruleId !== ruleId || receipt.sourceRef.kind !== 'source-document'
      || receipt.sourceRef.document.documentId !== 'A' || receipt.documentRevision !== 179
      || receipt.sourceRef.document.section !== 'A-8-1.') block(`CURRENT_RULE_RECEIPT_MISSING:${ruleId}`)
  }
  const entities = producer.entities.filter((e) => e.origin === 'natal' && e.sourceScope === 'natal' && context.includedEntityIds.includes(e.entityId))
  const month = entities.find((e) => e.position === 'month' && e.part === 'branch')
  if (!month) block('MONTH_COMMAND_MISSING')
  else {
    requireFact(month.canonicalFactRef)
    if (month.assessment !== 'confirmed' || month.uncertaintyIds.length) block('MONTH_ENTITY_NOT_CONFIRMED')
  }
  const observed = derived.hiddenObservations.filter((h) => h.branchEntityId === month?.entityId)
  const main = observed.find((h) => h.role === 'main')
  const entry = derived.authority.entries.find((e) => e.branch === month?.value)
  if (!entry || entry.completeness !== 'complete' || !main
    || observed.length !== Object.keys(entry.roles).length || new Set(observed.map((h) => h.role)).size !== observed.length
    || observed.some((h) => !h.role || entry.roles[h.role] !== h.hiddenStem)) block('MONTH_LOCAL_COVERAGE_INCOMPLETE')
  observed.forEach(requireDerived)
  const bases = candidates.filter((c) => c.patternType === '월령본기격' && c.status === 'candidate')
  const base = bases.length === 1 ? bases[0] : undefined
  if (!base || base.basis.mainHiddenObservationId !== main?.id || base.basis.monthBranchEntityId !== month?.entityId
    || base.basis.components.length !== 1 || base.basis.components[0].hiddenObservationIds.length !== 1
    || base.basis.components[0].hiddenObservationIds[0] !== main?.id) block('MONTH_MAIN_CANDIDATE_UNAVAILABLE')
  const baseComponent = base?.basis.components[0]
  const monthTenGod = baseComponent?.tenGod ?? null
  if (monthTenGod && peer(monthTenGod)) block('PEER_MONTH_SPECIAL_PROVISIONS_DEFERRED')
  function validateComponent(c: PatternCandidate, component: Component) {
    const requiredRules = c.patternType === '월령본기격' ? ['I-01', 'C-10'] : ['I-02', 'C-10']
    if (!requiredRules.every((rule) => (c.sourceRuleIds as string[]).includes(rule))) block(`CANDIDATE_RULE_REFERENCE_MISSING:${c.candidateId}`)
    if (c.basis.monthBranchEntityId !== month?.entityId || c.basis.mainHiddenObservationId !== main?.id) block(`CANDIDATE_MONTH_MISMATCH:${c.candidateId}`)
    for (const id of component.tenGodFactIds) {
      requireFact(id)
      const f = producer.facts.find((f) => f.id === id)
      if (!f || f.value !== component.tenGod || !tenGodSchema.is(f.value)) block(`TEN_GOD_REFERENCE_MISMATCH:${id}`)
    }
    for (const id of component.hiddenObservationIds) {
      const h = observed.find((h) => h.id === id)
      if (!h) block(`NON_MONTH_HIDDEN_REFERENCE:${id}`)
      else requireDerived(h)
    }
  }
  if (base && baseComponent) {
    validateComponent(base, baseComponent)
    for (const id of baseComponent.tenGodFactIds) {
      const f = producer.facts.find((f) => f.id === id)
      const prefix = f?.canonicalPointer.replace(/\/tenGod$/, '')
      if (!prefix || !/^\/chart\/basicRelations\/month\/value\/relationships\/hiddenStems\/\d+$/.test(prefix) || producer.facts.find((f) => f.canonicalPointer === prefix + '/stem')?.value !== main?.hiddenStem
        || producer.facts.find((f) => f.canonicalPointer === prefix + '/role')?.value !== 'main') block('MAIN_TEN_GOD_SOURCE_MISMATCH')
    }
  }
  const visible = entities.filter((e) => e.part === 'stem' && e.position !== 'day')
  const matrix = derived.exposures.filter((f) => f.sourceBranchEntityId === month?.entityId && f.monthCommand
    && f.sourceScope === 'natal' && f.sourceBranchScope === 'natal' && !f.dayStemExcluded)
  if (visible.length !== 3) block('NATAL_VISIBLE_ENTITY_COVERAGE_INCOMPLETE')
  for (const h of observed) for (const stem of visible) {
    const found = matrix.filter((f) => f.stemEntityId === stem.entityId && f.hiddenStem === h.hiddenStem && f.hiddenStemRole === h.role)
    if (found.length !== 1 || found[0].exposed === null) block('EXPOSURE_COVERAGE_INCOMPLETE')
    else requireDerived(found[0])
  }
  const singles = candidates.filter((c) => ['정격', '변격'].includes(c.patternType) && c.status === 'candidate')
  if (singles.some((c) => c.basis.components.length !== 1)) block('SINGLE_CANDIDATE_COMPONENT_ARITY_INVALID')
  const components = singles.flatMap((c) => c.basis.components.map((component) => ({ candidate: c, component })))
  const exposureSignature = (cs: Component[]) => sortedUnique(cs.flatMap((c) => c.exposureFactIds)).join('\0')
  for (const { candidate: c, component } of components) {
    validateComponent(c, component)
    if (peer(component.tenGod) || !component.hiddenObservationIds.length || !component.exposureFactIds.length || !component.stemEntityIds.length) block('INDEPENDENT_EXPOSURE_COMPONENT_INVALID')
    for (const id of component.exposureFactIds) {
      const f = matrix.find((f) => f.id === id)
      if (!f || f.exposed !== true || !component.stemEntityIds.includes(f.stemEntityId)
        || !component.hiddenObservationIds.some((id) => observed.some((h) => h.id === id && h.hiddenStem === f.hiddenStem && h.role === f.hiddenStemRole))
        || c.patternType === '정격' && f.hiddenStemRole !== 'main'
        || c.patternType === '변격' && f.hiddenStemRole === 'main') block(`EXPOSURE_CANDIDATE_MISMATCH:${id}`)
    }
    for (const id of component.stemEntityIds) {
      const stem = visible.find((s) => s.entityId === id)
      if (!stem) { block('DAY_OR_OUT_OF_SCOPE_COMPONENT'); continue }
      if (stem.assessment !== 'confirmed' || stem.uncertaintyIds.length) block(`STEM_NOT_CONFIRMED:${id}`)
      const expected = `/chart/basicRelations/${stem.position}/value/stemTenGod`
      if (!component.tenGodFactIds.some((id) => producer.facts.find((f) => f.id === id)?.canonicalPointer === expected)) block('VISIBLE_TEN_GOD_SOURCE_MISMATCH')
      if (!natal.states.some((s) => s.targetEntityId === id && s.scopeId === context.scopeId)) block('NATAL_STATE_REFERENCE_MISSING')
    }
  }
  // Check supplied positive facts are represented; never fill a missing candidate by rerunning its evaluator.
  for (const f of matrix.filter((f) => f.exposed)) {
    const stem = visible.find((s) => s.entityId === f.stemEntityId)
    const god = producer.facts.find((p) => p.canonicalPointer === `/chart/basicRelations/${stem?.position}/value/stemTenGod`)
    if (!god || !tenGodSchema.is(god.value)) { block('POSITIVE_EXPOSURE_TEN_GOD_MISSING'); continue }
    requireFact(god.id)
    if (peer(god.value)) continue
    const sameMain = f.hiddenStemRole !== 'main' && matrix.some((m) => m.stemEntityId === f.stemEntityId && m.hiddenStemRole === 'main' && m.exposed)
    if (!sameMain && !components.some((c) => c.component.exposureFactIds.includes(f.id))) block(`SUPPLIED_CANDIDATE_MISSING_FOR_EXPOSURE:${f.id}`)
  }
  if (candidates.some((c) => c.status === 'deferred')) block('UPSTREAM_CANDIDATE_DEFERRED')
  const groups = new Set(components.map((c) => elementGroup(c.component.tenGod)))
  let selected: PatternCandidate | undefined
  let patternType: PatternJudgment['patternType'] = '미정'
  if (groups.size > 1) {
    patternType = '겸격'
    const combined = candidates.filter((c) => c.patternType === '겸격' && c.status === 'candidate'
      && exposureSignature(c.basis.components) === exposureSignature(components.map((c) => c.component)))
    if (combined.length !== 1) block('COMBINED_CANDIDATE_UNAVAILABLE_OR_AMBIGUOUS')
    else {
      selected = combined[0]
      const signatures = (items: Component[]) => items.map((item) => item.tenGod + '\0' + exposureSignature([item])).sort().join('\n')
      if (signatures(selected.basis.components) !== signatures(components.map((c) => c.component))) block('COMBINED_COMPONENT_MULTIPLICITY_DISAGREES')
      selected.basis.components.forEach((component) => validateComponent(selected!, component))
      if (selected.basis.components.some((component) => !components.some((c) => c.component.tenGod === component.tenGod
        && exposureSignature([c.component]) === exposureSignature([component])))) block('COMBINED_COMPONENTS_DISAGREE')
    }
  } else if (components.length && singles.every((c) => c.patternType === '정격')) {
    patternType = '정격'; selected = singles[0]
  } else if (components.length) {
    patternType = '변격'; block('I02_VARIANT_REVIEW_HAS_NO_ADDITIONAL_CONFIRMATION_BASIS')
  } else block('NO_INDEPENDENT_EXPOSURE_CLASSIFICATION_SUPPLIED')
  if (!selected && patternType !== '변격') block('FINAL_CLASSIFICATION_CANDIDATE_MISSING')
  const confirmed = blocking.size === 0
  const sourceIds = sortedUnique(candidates.map((c) => c.candidateId))
  const contextFacts = sortedUnique(candidates.flatMap((c) => [...c.supportingFactIds, ...c.conflictingFactIds,
    ...c.basis.rootFactIds]).filter((id) => !core.has(id)))
  const conflicts = sortedUnique(candidates.flatMap((c) => c.conflictingFactIds))
  const contextEvidence = sortedUnique([...candidates.flatMap((c) => c.evidenceIds), ...contextFacts.flatMap((id) => facts.get(id)?.evidenceIds ?? [])]
    .filter((id) => !proof.has(id)))
  const contextUncertainty = sortedUnique([...candidates.flatMap((c) => c.uncertaintyIds),
    ...contextFacts.flatMap((id) => facts.get(id)?.uncertaintyIds ?? []), ...contextEvidence.flatMap((id) => catalog.get(id)?.uncertaintyIds ?? [])])
  const traces: PatternJudgment['trace'] = candidates.map((c) => {
    const states = natal.states.filter((s) => c.basis.components.some((p) => p.stemEntityIds.includes(s.targetEntityId)))
    const isBase = c === base, isSelected = c === selected || patternType === '정격' && singles.includes(c)
    const rejected = c.status === 'rejected' || confirmed && !isBase && !isSelected
    const reasons = c.status === 'rejected' ? ['UPSTREAM_CANDIDATE_REJECTED', ...c.basis.reasons] : !confirmed ? ['CORE_CONDITIONS_NOT_CONFIRMED']
      : isBase ? ['I01_MONTH_MAIN_PATTERN_RETAINED'] : isSelected ? [patternType === '겸격' ? 'I02_MULTIPLE_ELEMENTS_COMBINED' : 'I02_MAIN_ELEMENT_EXPOSURE_CONFIRMED']
        : ['I02_SINGLE_CLASSIFICATION_NOT_COMPLETE_WITH_MULTIPLE_EXPOSURES']
    if (states.some((s) => s.functionalState === 'stopped')) reasons.push('I02A_STOPPED_EXPOSURE_CLASSIFICATION_RETAINED')
    if (states.some((s) => s.functionalState === 'weakened')) reasons.push('I02_WEAKENING_IS_CONTEXT_NO_DOCUMENTED_PATTERN_EXCLUSION')
    return { candidateId: c.candidateId, patternType: c.patternType,
      status: rejected ? 'rejected' : confirmed ? 'confirmed' : 'deferred', reasonCodes: reasons,
      sourceRuleIds: c.sourceRuleIds, supportingFactIds: c.supportingFactIds, conflictingFactIds: c.conflictingFactIds,
      evidenceIds: sortedUnique([...proof].filter((id) => c.evidenceIds.includes(id) || ruleIds.some((r) => derived.authority.ruleReceiptIds[r] === id))),
      contextFactIds: sortedUnique(states.map((s) => s.stateId)) }
  })
  const finalComponents = patternType === '정격' ? components.map((c) => c.component) : selected?.basis.components ?? components.map((c) => c.component)
  const componentTenGods = sortedUnique(finalComponents.map((c) => c.tenGod))
  const inputAssessment = combineAssessment(...[...core].map((id) => facts.get(id)?.assessment ?? 'unknown'), ...receiptAssessments)
  const judgment = patternJudgmentSchema.parse({ judgmentId: recordId('pattern-judgment', [context.scopeId, patternType]),
    patternType, status: confirmed ? 'confirmed' : 'deferred', monthPatternTenGod: monthTenGod, componentTenGods,
    sourceCandidateIds: sourceIds, supportingFactIds: [...core].sort(), conflictingFactIds: conflicts, sourceRuleIds: ruleIds,
    evidenceIds: [...proof].sort(), reasonCodes: confirmed ? ['I01_MONTH_MAIN_BASIS_VERIFIED', 'I02_CONFIRMED_EXPOSURE_CLASSIFICATION', 'I02A_FUNCTION_AND_CLASSIFICATION_SEPARATED'] : ['CORE_INPUT_OR_DOCUMENT_CONDITION_UNRESOLVED'],
    assessment: confirmed ? 'confirmed' : inputAssessment === 'unknown' || inputAssessment === 'unsupported' ? inputAssessment : 'provisional', uncertainty: { blockingIds: [...blocking].sort(), contextIds: contextUncertainty },
    contextFactIds: contextFacts, contextEvidenceIds: contextEvidence, trace: traces, scopeId: context.scopeId, sourceScope: 'natal',
    provenance: { producerRef: producer.producerRef, ruleVersion: 'A179',
      sourceDocument: { documentId: 'A', documentRevision: 179, path: 'src/docs/source/A_rev179.md', section: 'A-8-1', location: 'I-01 / I-02 / I-02a / C-10' },
      method: 'existing-confirmed-facts-and-candidates-only-structural-pattern-classification' } })
  return detach({ judgment, evidence: evidenceContextSchema.parse({ contractVersion: '1',
    evidenceContextId: recordId('pattern-judgment-evidence', [context.scopeId]), records: [...catalog.values()].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)) }), roleStates: [] })
}
