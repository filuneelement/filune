import { calculateTenGod } from '../../dayRelationships'
import { evidenceContextSchema } from '../contracts'
import { assertExecutionScopeContext } from '../runtime'
import { exposureRootAuthority } from '../systems/exposureRootAuthority'
import type { ExposureRootSources } from '../systems/exposureRootAuthority'
import type { DerivedStemFactBasis, ExposureFact, ExposureRootSelection } from '../facts/exposureFact'
import type { RootFact } from '../facts/rootFact'
import type { HiddenStemFact } from './types'
import { localFactAssessment, localFactReceipt } from './assessmentPropagation'
import { validateProducerOutput } from './validation'
import { detach, recordId, sortedUnique } from './shared'

/** Structural equality, using the existing elemental/ten-god table; no strength computation. */
const sameElement = (a: string, b: string) => ['比肩', '劫財'].includes(calculateTenGod(a, b))

/** Observation-only derived facts. Does not consume RuntimeState, roles, branches' actions, or CS expectations. */
export function produceExposureRootFacts(input: ExposureRootSelection, sources: ExposureRootSources) {
  const { producer, context } = input
  validateProducerOutput(producer)
  if (producer.hiddenStemSystem.systemId !== 'filune-a179') throw new TypeError('Document judgment authority required; legacy hidden stems cannot be used')
  assertExecutionScopeContext(producer, context)
  const authority = exposureRootAuthority(sources)
  const selected = producer.entities.filter((e) => context.includedEntityIds.includes(e.entityId))
    .sort((a, b) => a.entityId.localeCompare(b.entityId))
  const stems = selected.filter((e) => e.part === 'stem')
  const branches = selected.filter((e) => e.part === 'branch')
  const exposures: ExposureFact[] = [], roots: RootFact[] = []
  const factReceipts: ReturnType<typeof localFactReceipt>[] = []
  const parents = (...ids: string[]) => ids.flatMap((id) => {
    const entity = selected.find((e) => e.entityId === id)!
    const fact = producer.facts.find((f) => f.id === entity.canonicalFactRef)!
    return [entity, fact]
  })
  const natalPillars = ['year', 'month', 'day', 'time'].map((position) => selected.find((e) => e.origin === 'natal' && e.position === position && e.part === 'stem')?.canonicalFactRef)
    .map((ref) => producer.facts.find((f) => f.id === ref)?.value)
  const bindingId = authority.pillarReceipts.find((r) => JSON.stringify(r.pillars) === JSON.stringify(natalPillars))?.evidenceId
  function assess(factId: string, entityIds: string[], row: { hiddenStem: string | null; role: string | null },
    coverage: string, receiptIds: string[], method: string, extraUncertainty: string[] = [], unavailable = row.hiddenStem === null) {
    const parentFactIds = sortedUnique(entityIds.map((id) => selected.find((e) => e.entityId === id)!.canonicalFactRef))
    const claims = sortedUnique([...receiptIds, ...(bindingId ? [bindingId] : [])])
    const result = localFactAssessment({ parents: parents(...entityIds), receipts: authority.evidence, receiptIds: claims,
      localCoverage: coverage, legacyFallback: false, unavailable,
      uncertaintyIds: sortedUnique([...context.uncertaintyIds, ...extraUncertainty, ...(row.role === null ? ['hidden-role-not-specified'] : [])]) })
    const receipt = localFactReceipt(factId, result, producer.producerRef, claims, parentFactIds, method)
    factReceipts.push(receipt)
    return { ...result, receiptId: receipt.evidenceId,
      assessmentBasis: { parentFactIds, receiptEvidenceIds: claims, localCoverage: coverage, legacyFallback: false } }
  }
  const hiddenObservations: { id: string; branchEntityId: string; hiddenStem: string; role: HiddenStemFact['role'] | null
    hiddenStemSystemId: string; sourceScope: typeof branches[number]['sourceScope']; scopeId: string
    evidenceIds: string[]; uncertaintyIds: string[]; assessment: HiddenStemFact['assessment']
    provenance: DerivedStemFactBasis['provenance'] }[] = []
  for (const branch of branches) {
    const entry = authority.entries.find((e) => e.branch === branch.value)!
    const known: { hiddenStem: string; role: HiddenStemFact['role'] | null; evidenceIds: string[] }[] =
      Object.entries(entry.roles).map(([role, hiddenStem]) => ({ hiddenStem: hiddenStem!, role: role as HiddenStemFact['role'], evidenceIds: entry.evidenceIds }))
    known.push(...authority.unassigned.filter((e) => e.branch === branch.value).map((e) => ({ ...e, role: null })))
    const entryClaims = authority.entryReceiptIds[branch.value] ?? []
    const rules = (ids: string[]) => ids.map((id) => authority.ruleReceiptIds[id]).filter((id): id is string => !!id)
    for (const observation of known) {
      const id = recordId('document-hidden-observation', [context.scopeId, branch.entityId, observation.hiddenStem])
      const method = 'document-hidden-membership-and-explicit-role-extraction'
      const state = assess(id, [branch.entityId], observation, entry.completeness, [...entryClaims, ...rules(['C-10'])], method)
      hiddenObservations.push({ id, branchEntityId: branch.entityId, hiddenStem: observation.hiddenStem, role: observation.role,
        hiddenStemSystemId: authority.hiddenStemSystemId, sourceScope: branch.sourceScope, scopeId: context.scopeId,
        evidenceIds: sortedUnique([...branch.evidenceIds, ...observation.evidenceIds, 'exposure-root:source-A', state.receiptId,
          ...state.assessmentBasis.receiptEvidenceIds]), uncertaintyIds: state.uncertaintyIds, assessment: state.assessment,
        provenance: { producerRef: producer.producerRef, inputFactIds: [branch.canonicalFactRef],
          sourceDocumentRefs: sortedUnique([...observation.evidenceIds, ...state.assessmentBasis.receiptEvidenceIds]),
          sourceRuleIds: ['C-10'], calculationVersion: producer.calculationProvenance, ruleVersion: 'A179', method,
          assessmentBasis: state.assessmentBasis } })
    }
    // One explicit unknown row preserves incomplete coverage; it never asserts absence from an incomplete table.
    const rows = [...known, ...(entry.completeness !== 'complete' ? [{ hiddenStem: null, role: null, evidenceIds: entry.evidenceIds }] : [])]
    for (const stem of stems) for (const row of rows) {
      const monthCommand = branch.origin === 'natal' && branch.position === 'month'
      const dayStemExcluded = stem.origin === 'natal' && stem.position === 'day'
      const elementalMatch = row.hiddenStem === null ? null : sameElement(stem.value, row.hiddenStem)
      const key = [context.scopeId, stem.entityId, branch.entityId, row.hiddenStem ?? 'unavailable']
      const basis = {
        stemEntityId: stem.entityId, hiddenStem: row.hiddenStem, hiddenStemRole: row.role,
        hiddenStemSystemId: authority.hiddenStemSystemId, sourceScope: stem.sourceScope, scopeId: context.scopeId,
        evidenceIds: sortedUnique([...stem.evidenceIds, ...branch.evidenceIds, ...row.evidenceIds, 'exposure-root:source-A', 'exposure-root:source-approval']),
        provenance: { producerRef: producer.producerRef, inputFactIds: sortedUnique([stem.canonicalFactRef, branch.canonicalFactRef]),
          sourceDocumentRefs: sortedUnique([...row.evidenceIds, 'exposure-root:source-A', 'exposure-root:source-approval']),
          sourceRuleIds: [], calculationVersion: producer.calculationProvenance, ruleVersion: 'A179' as const, method: '' } }
      const exposureId = recordId('exposure', key)
      const exposureMethod = monthCommand ? 'I-02-month-command-same-element-visible-excluding-day' : 'deterministic-same-element-visible-observation-excluding-day'
      const exposureAssessment = assess(exposureId, [stem.entityId, branch.entityId], row, entry.completeness,
        [...entryClaims, ...rules(['C-10', 'I-02', 'I-02a', 'OP-Z13'])], exposureMethod)
      exposures.push({ ...basis, id: exposureId, kind: 'exposure', sourceBranchEntityId: branch.entityId, sourceBranchScope: branch.sourceScope,
        assessment: exposureAssessment.assessment, uncertaintyIds: exposureAssessment.uncertaintyIds,
        evidenceIds: sortedUnique([...basis.evidenceIds, exposureAssessment.receiptId, ...exposureAssessment.assessmentBasis.receiptEvidenceIds]),
        visibleStemPosition: stem.position === 'time' ? 'hour' : stem.position ?? null,
        exposed: dayStemExcluded ? false : elementalMatch, sameElementVisible: elementalMatch, monthCommand, dayStemExcluded,
        provenance: { ...basis.provenance, sourceRuleIds: monthCommand ? ['C-10', 'I-02', 'I-02a', 'OP-Z13'] : ['C-10', 'OP-Z13'],
          sourceDocumentRefs: sortedUnique([...basis.provenance.sourceDocumentRefs, ...exposureAssessment.assessmentBasis.receiptEvidenceIds]),
          method: exposureMethod, assessmentBasis: exposureAssessment.assessmentBasis } })
      // I-05 explicitly recognizes 庫 roots, including 丙 in 戌. No automatic generalization to every opposite-polarity pair.
      const exact = row.hiddenStem === stem.value
      const documentedStore = stem.value === '丙' && branch.value === '戌' && row.hiddenStem === '丁'
      const explicitlyExcluded = row.hiddenStem === null && authority.excluded.some((e) => e.branch === branch.value && e.hiddenStem === stem.value)
      const existence = exact || documentedStore ? 'present' : explicitlyExcluded ? 'absent'
        : row.hiddenStem === null || elementalMatch ? 'unknown' : 'absent'
      const rootId = recordId('root', key)
      const rootMethod = exact ? 'document-hidden-stem-exact-match' : documentedStore ? 'I-05-explicit-fire-store-root' : 'document-membership-check-no-inferred-root'
      const rootAssessment = assess(rootId, [stem.entityId, branch.entityId], row, entry.completeness,
        [...entryClaims, ...rules(['C-10', 'I-05', 'OP-Z13'])], rootMethod,
        existence === 'unknown' ? ['root-basis-not-explicitly-specified'] : [], existence === 'unknown')
      roots.push({ ...basis, id: rootId, kind: 'root', rootBranchEntityId: branch.entityId, rootScope: branch.sourceScope,
        hiddenStemMatched: existence === 'present' ? row.hiddenStem : null, rootExistence: existence,
        assessment: rootAssessment.assessment, uncertaintyIds: rootAssessment.uncertaintyIds,
        evidenceIds: sortedUnique([...basis.evidenceIds, rootAssessment.receiptId, ...rootAssessment.assessmentBasis.receiptEvidenceIds]),
        provenance: { ...basis.provenance, sourceRuleIds: ['C-10', 'I-05', 'OP-Z13'], method: rootMethod,
          sourceDocumentRefs: sortedUnique([...basis.provenance.sourceDocumentRefs, ...rootAssessment.assessmentBasis.receiptEvidenceIds]),
          assessmentBasis: rootAssessment.assessmentBasis } })
    }
  }
  return detach({ exposures, roots, hiddenObservations, authority,
    evidence: evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: recordId('exposure-root-evidence', [context.scopeId]),
      records: [...producer.evidence.records, ...authority.evidence, ...factReceipts] }),
    scopeId: context.scopeId, roleStates: [] })
}
