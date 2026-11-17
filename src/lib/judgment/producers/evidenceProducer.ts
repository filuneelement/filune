import { evidenceContextSchema, evidenceRecordSchema } from '../contracts'
import type { EvidenceRecord } from '../contracts'
import type { CanonicalProjection, ProducerOptions } from './types'
import { detach, HIDDEN_EVIDENCE, PROJECTION_EVIDENCE, RELATION_EVIDENCE, TABLE_REF } from './shared'
import { a179SourceEvidence, FILUNE_A179 } from '../systems/hiddenStemFiluneA179'
import { RELATION_CATALOG_REF } from './relationCatalog'

/** Records actual pipeline provenance, never invents an external verification or approval. */
export function evidenceProducer(projection: CanonicalProjection, outputRefs: {
  hidden: string[]; relations: string[]; coverage: string[]
}, options: ProducerOptions = {}) {
  const records: EvidenceRecord[] = []
  for (const [evidenceId, outputs, method, note] of [
    [PROJECTION_EVIDENCE, projection.facts.map((fact) => fact.id), 'canonical-value-projection',
      'Values are unchanged legacy canonical outputs; birth origin and independent verification are not established.'],
    [HIDDEN_EVIDENCE, outputRefs.hidden, options.hiddenStemSystem ? FILUNE_A179.path : TABLE_REF,
      options.hiddenStemSystem ? 'A179 explicitly documented roles only; missing roles unavailable, no legacy fallback.' : 'Existing table and calculateTenGod only; compatibility with document default remains unverified.'],
    [RELATION_EVIDENCE, [...outputRefs.relations, ...outputRefs.coverage], RELATION_CATALOG_REF,
      'Structural existence only, all declared participants retained; no OP-L01 selection or actual action/judgment.'],
  ] as const) {
    if (!outputs.length) continue
    records.push(evidenceRecordSchema.parse({ evidenceId, sourceType: 'deterministic-calculation',
      sourceRef: { kind: 'deterministic-calculation', producer: detach(projection.producerRef),
        outputRefs: [...outputs], timePolicyRef: 'canonical:/timePolicy' },
      documentRevision: null, ruleId: null, status: 'provisional',
      verification: { claimRef: evidenceId, method, basisEvidenceIds: [] },
      note, uncertaintyIds: ['no-independent-cross-check-supplied'], usage: 'runtime-evidence' }))
  }
  if (options.hiddenStemSystem) records.push(a179SourceEvidence(options.hiddenStemSystem.sourceText))
  if (options.customerInputReceipt) records.push(evidenceRecordSchema.parse({
    evidenceId: 'producer-evidence:customer-input', sourceType: 'customer-input',
    sourceRef: { kind: 'customer-input', ...options.customerInputReceipt, fieldPath: '/birthInput' },
    documentRevision: null, ruleId: null, status: 'provisional',
    verification: { claimRef: 'canonical:/birthInput', method: 'caller-supplied-receipt-reference', basisEvidenceIds: [] },
    note: 'Receipt reference supplied by caller; not independent verification of the entered birth facts.',
    uncertaintyIds: ['customer-input-not-independently-verified'], usage: 'runtime-evidence',
  }))
  return evidenceContextSchema.parse({ contractVersion: '1', evidenceContextId: 'canonical-producer-evidence-v1', records })
}
