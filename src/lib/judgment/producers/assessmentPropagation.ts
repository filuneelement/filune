import { evidenceRecordSchema, factStatusSchema } from '../contracts'
import type { EvidenceRecord } from '../contracts'
import type { ValueStatus } from '../../canonical/types'
import type { ProducerReference } from './types'
import { DOCUMENT_PINS } from '../systems/documentReceipt'
import { combineAssessment, sortedUnique, recordId } from './shared'

export type AssessedParent = { assessment: ValueStatus; uncertaintyIds: string[] }
/** No global-system completeness gate. Receipts establish the local claim; parents cannot be upgraded. */
export function localFactAssessment(input: { parents: AssessedParent[]; uncertaintyIds: string[];
  receipts: EvidenceRecord[]; receiptIds: string[]; localCoverage: string; legacyFallback: boolean; unavailable: boolean }) {
  const completeParents = input.parents.length > 0 && input.parents.every((p) => p && factStatusSchema.is(p.assessment)
    && Array.isArray(p.uncertaintyIds) && p.uncertaintyIds.every((id) => typeof id === 'string' && id.length > 0))
  const uncertaintyIds = sortedUnique([...(Array.isArray(input.uncertaintyIds) ? input.uncertaintyIds : ['uncertainty-metadata-unavailable']),
    ...input.parents.flatMap((p) => Array.isArray(p?.uncertaintyIds) ? p.uncertaintyIds : [])])
  const parentStatus = combineAssessment(...input.parents.map((p) => p.assessment))
  const verified = input.receiptIds.length > 0 && input.receiptIds.every((id) => {
    const record = input.receipts.find((r) => r.evidenceId === id)
    if (!record || !evidenceRecordSchema.is(record) || record.status !== 'confirmed' || record.uncertaintyIds.length) return false
    if (record.sourceRef.kind !== 'source-document') return false
    const doc = record.sourceRef.document
    const pin = DOCUMENT_PINS[doc.documentId as keyof typeof DOCUMENT_PINS]
    return !!pin && doc.documentRevision === pin.revision
      && doc.path === `src/docs/source/${doc.documentId}_rev${pin.revision}.md` && record.hash?.value === pin.sha256
      && record.hash.hashTarget === doc.path && !!doc.section && !!record.ruleId && !!record.verification.checkedByRef && record.verification.basisEvidenceIds.length > 0
  })
  const reasons = sortedUnique([...uncertaintyIds, ...(completeParents ? [] : ['parent-assessment-metadata-unavailable']),
    ...(parentStatus === 'confirmed' ? [] : [`parent-assessment:${parentStatus}`]),
    ...(input.localCoverage === 'complete' ? [] : ['local-document-coverage-incomplete']),
    ...(verified ? [] : ['local-verification-receipt-unavailable']),
    ...(input.legacyFallback ? ['legacy-fallback-not-document-authority'] : []),
    ...(input.unavailable ? ['local-fact-unavailable'] : [])])
  const assessment: ValueStatus = input.unavailable || !completeParents ? 'unknown' : parentStatus === 'unknown' || parentStatus === 'unsupported'
    ? parentStatus : reasons.length ? 'provisional' : 'confirmed'
  return { assessment, uncertaintyIds: reasons }
}
/** An executed structural verification receipt, never an independent cross-check or birth receipt. */
export function localFactReceipt(factId: string, result: ReturnType<typeof localFactAssessment>, producer: ProducerReference,
  receiptIds: string[], inputFactIds: string[], method: string): EvidenceRecord {
  return evidenceRecordSchema.parse({ evidenceId: recordId('exposure-root:fact-receipt', [factId]), sourceType: 'deterministic-calculation',
    sourceRef: { kind: 'deterministic-calculation', producer, outputRefs: [factId], timePolicyRef: 'canonical:/timePolicy' },
    documentRevision: null, ruleId: null, status: result.assessment,
    verification: { claimRef: factId, method, checkedByRef: 'src/lib/judgment/producers/assessmentPropagation.ts:localFactReceipt',
      basisEvidenceIds: receiptIds },
    note: `Local structural result from existing parent facts ${JSON.stringify(inputFactIds)}; no independent calculation or birth verification asserted.`,
    uncertaintyIds: result.uncertaintyIds, usage: 'runtime-evidence' })
}
