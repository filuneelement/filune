import { contractHeader, documentReferenceSchema, factStatusSchema, instantSchema, producerReferenceSchema } from './common'
import { array, enumeration, id, literal, nonEmptyIds, object, optional, positiveInteger, refine, text, union, uniqueIds } from './schema'
import type { Infer } from './schema'

const sourceReferenceSchema = union(
  object({ kind: literal('customer-input'), recordId: id, fieldPath: id, receiptRef: id }),
  object({ kind: literal('source-document'), document: documentReferenceSchema }),
  object({ kind: literal('deterministic-calculation'), producer: producerReferenceSchema,
    outputRefs: nonEmptyIds, timePolicyRef: id }),
  refine(object({ kind: literal('independent-cross-check'), observationRefs: nonEmptyIds,
    independenceBasis: id, comparisonResultRef: id, verifierRef: id }),
  (value) => value.observationRefs.length >= 2, 'independent cross-check requires distinct observations'),
  object({ kind: literal('reverse-inference'), candidateRefs: nonEmptyIds, adoptionReason: id,
    targetFieldRef: id, documentRefs: refine(array(documentReferenceSchema), (value) => value.length > 0, 'document source required') }),
  object({ kind: literal('operator-confirmed'), decisionRecordRef: id, approvalScope: id,
    documentRefs: refine(array(documentReferenceSchema), (value) => value.length > 0, 'document source required') }),
)
const sourceTypes = ['customer-input', 'source-document', 'deterministic-calculation',
  'independent-cross-check', 'reverse-inference', 'operator-confirmed'] as const
export const evidenceRecordSchema = refine(object({
  evidenceId: id, sourceType: enumeration(sourceTypes), sourceRef: sourceReferenceSchema,
  documentRevision: union(positiveInteger, literal(null)), ruleId: union(id, literal(null)),
  hash: optional(object({ algorithm: literal('SHA-256'), value: refine(text,
    (value) => /^[a-f0-9]{64}$/.test(value), 'expected lowercase SHA-256 digest'), hashTarget: id })),
  status: factStatusSchema,
  verification: object({ claimRef: id, method: id, checkedByRef: optional(id),
    basisEvidenceIds: uniqueIds, checkedAt: optional(instantSchema) }),
  note: text, uncertaintyIds: uniqueIds,
  usage: enumeration(['runtime-evidence', 'rule-definition', 'regression-expectation', 'audit-only'] as const),
  sourceLayer: optional(enumeration(['S1', 'S2', 'S3', 'S4', 'S5', 'OP'] as const)),
}), (value) => value.sourceType === value.sourceRef.kind
  && (value.sourceRef.kind === 'source-document'
    ? value.documentRevision === value.sourceRef.document.documentRevision
    : value.documentRevision === null)
  && (value.status !== 'confirmed' || value.verification.checkedByRef !== undefined
    && value.verification.basisEvidenceIds.length > 0)
  && (!['unknown', 'unsupported', 'provisional'].includes(value.status) || value.uncertaintyIds.length > 0),
'source discriminator/revision mismatch or missing verification/uncertainty')
export type EvidenceRecord = Infer<typeof evidenceRecordSchema>
/** Explicit transfer between declared producers; does not execute or certify a producer. */
export const producerHandoffSchema = object({
  handoffId: id, scopeId: id,
  source: union(object({ kind: literal('coverage'), coverageId: id }),
    object({ kind: literal('calculation-evidence'), evidenceId: id })),
  target: union(object({ kind: literal('relation'), relationFactId: id }),
    object({ kind: literal('coverage'), coverageId: id })),
  fromProducerRef: producerReferenceSchema, toProducerRef: producerReferenceSchema,
  evidenceIds: nonEmptyIds,
})
export type ProducerHandoff = Infer<typeof producerHandoffSchema>
export const evidenceContextSchema = refine(object({
  ...contractHeader, evidenceContextId: id, records: array(evidenceRecordSchema),
  producerHandoffs: optional(array(producerHandoffSchema)),
}), (value) => new Set(value.records.map((record) => record.evidenceId)).size === value.records.length
  && new Set(value.producerHandoffs?.map((record) => record.handoffId)).size === (value.producerHandoffs?.length ?? 0),
'duplicate evidence or producer handoff identifiers')
export type EvidenceContextContract = Infer<typeof evidenceContextSchema>
