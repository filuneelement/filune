import type { EvidenceContextContract, Validity } from '../contracts'
import type { ProducerReference } from '../producers/types'
import { DOCUMENT_PINS } from '../systems/documentReceipt'
import { detach, recordId } from '../producers/shared'

export const sameValue = (a: unknown, b: unknown) => a === undefined || b === undefined ? a === b : JSON.stringify(detach(a)) === JSON.stringify(detach(b))
export function containsTime(period: Validity, instant: string): boolean {
  const { from, to } = period
  const start = from.kind === 'exact' ? from.instant : from.kind === 'range' ? from.latest : undefined
  const end = to.kind === 'exact' ? to.instant : to.kind === 'range' ? to.earliest : undefined
  return !!start && !!end && start <= instant && instant < end
}
export function guEungFactClaim(fact: { evidenceIds: string[] }): string {
  const { evidenceIds: _evidenceIds, ...payload } = fact
  return recordId('gu-eung-upstream-claim', [JSON.stringify(detach(payload))])
}

export function effectEvidence(records: EvidenceContextContract['records'], matchingNatalPillars?: string) {
  // A matching pillar receipt may support a natal assignment. It supplies no expected role or effect.
  const permitsCasePillarReceipt = (item: EvidenceContextContract['records'][number]) =>
    !!matchingNatalPillars && item.sourceRef.kind === 'source-document'
    && item.sourceRef.document.documentId === 'C'
    && item.sourceRef.document.documentRevision === DOCUMENT_PINS.C.revision
    && item.sourceRef.document.path === `src/docs/source/C_rev${DOCUMENT_PINS.C.revision}.md`
    && item.sourceRef.document.section === 'C-10-1.' && item.hash?.value === DOCUMENT_PINS.C.sha256
    && item.verification.claimRef === `document-pillars:${matchingNatalPillars}`
  const byId = new Map(records.map((item) => [item.evidenceId, item]))
  const eligible = (id: string, visited = new Set<string>()): boolean => {
    const item = byId.get(id)
    if (!item || visited.has(id) || item.usage !== 'runtime-evidence' || item.status !== 'confirmed'
      || item.uncertaintyIds.length || item.sourceType === 'reverse-inference'
      || (item.sourceRef.kind === 'source-document' && ['C', '25-7'].includes(item.sourceRef.document.documentId)
        && !permitsCasePillarReceipt(item))) return false
    return item.verification.basisEvidenceIds.every((basis) => {
      const parent = byId.get(basis)
      // A verified local document receipt may reference the unpromoted raw source.
      if (item.sourceRef.kind === 'source-document' && parent?.sourceRef.kind === 'source-document'
        && item.sourceRef.document.documentId === parent.sourceRef.document.documentId
        && item.sourceRef.document.documentRevision === parent.sourceRef.document.documentRevision
        && item.sourceRef.document.path === parent.sourceRef.document.path && parent.usage === 'runtime-evidence'
        && item.hash?.value !== undefined) {
        if (item.hash.value === parent.hash?.value) return true
        // Exposure receipts verify the pinned bytes while their raw attachment is provisional.
        const doc = item.sourceRef.document
        const pin = DOCUMENT_PINS[doc.documentId as keyof typeof DOCUMENT_PINS]
        if (matchingNatalPillars && !parent.hash && parent.status === 'provisional'
          && !parent.verification.basisEvidenceIds.length
          && item.verification.checkedByRef === 'src/lib/judgment/systems/documentReceipt.ts:verifyDocumentClaim'
          && item.verification.method === 'pinned-document-bytes-and-direct-clause-comparison-v1'
          && pin && doc.documentRevision === pin.revision && doc.path === `src/docs/source/${doc.documentId}_rev${pin.revision}.md`
          && item.hash.value === pin.sha256) return true
      }
      return eligible(basis, new Set([...visited, id]))
    })
  }
  const attested = (fact: { evidenceIds: string[] }, id: string, producer: ProducerReference) =>
    !producer.producerId.startsWith('gu-eung') && fact.evidenceIds.length > 0 && fact.evidenceIds.every((ref) => eligible(ref))
    && fact.evidenceIds.some((ref) => {
      const receipt = byId.get(ref)
      const source = receipt?.sourceRef
      return !!receipt && source?.kind === 'deterministic-calculation' && sameValue(source.producer, producer)
        && source.outputRefs.includes(id) && receipt.verification.claimRef === guEungFactClaim(fact)
    })
  const supportsRule = (refs: string[], ruleId: string): boolean => {
    const pending = [...refs], seen = new Set<string>()
    while (pending.length) {
      const id = pending.pop()!
      if (seen.has(id)) continue
      seen.add(id)
      const item = byId.get(id)
      if (!item || !eligible(id)) continue
      if (item.ruleId === ruleId && item.sourceRef.kind === 'source-document') {
        const doc = item.sourceRef.document
        const pin = DOCUMENT_PINS[doc.documentId as keyof typeof DOCUMENT_PINS]
        if (pin && doc.documentRevision === pin.revision && doc.path === `src/docs/source/${doc.documentId}_rev${pin.revision}.md`
          && item.hash?.value === pin.sha256) return true
      }
      pending.push(...item.verification.basisEvidenceIds)
    }
    return false
  }
  return { byId, eligible, attested, supportsRule }
}
