import { documentReferenceSchema, evidenceContextSchema, evidenceRecordSchema } from '../contracts'
import type { EvidenceContextContract, EvidenceRecord } from '../contracts'

export const CS005_CANDIDATE_RULE_IDS = [
  'C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07', 'C-08', 'C-09', 'C-10', 'C-11', 'C-12',
  'I-01', 'I-02', 'I-02a', 'I-03', 'I-04', 'I-04-1', 'I-04a', 'I-04c', 'I-05', 'I-06', 'I-07', 'I-08a',
  'I-10', 'I-11', 'I-13', 'I-14', 'OP-T01', 'OP-T02', 'OP-T03', 'OP-T04', 'OP-T07', 'OP-T08', 'OP-T09',
  'OP-T10', 'OP-T12', 'OP-Z01', 'OP-Z02', 'OP-Z03', 'OP-Z04', 'OP-Z05', 'OP-Z07', 'OP-Z09', 'OP-Z10',
  'OP-Z11', 'OP-Z12', 'OP-Z13', 'OP-L01', 'OP-L02', 'OP-L03', 'OP-P01', 'OP-P02', 'OP-P03', 'OP-P04',
  'OP-P05', 'I-04b',
] as const
const DIRECT_CROSS_CHECK = new Set(['C-02', 'OP-P04'])
const CALENDAR_GATE = new Set(['C-01', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07', 'C-08', 'OP-P02'])
export function ruleEvidenceRequirement(ruleId: string) {
  if (!(CS005_CANDIDATE_RULE_IDS as readonly string[]).includes(ruleId)) throw new TypeError('Rule has no mapped evidence policy.')
  const crossCheck = DIRECT_CROSS_CHECK.has(ruleId) ? 'direct' : CALENDAR_GATE.has(ruleId) ? 'upstream-calendar-gate' : 'not-directly-required'
  return { ruleId, independentCrossCheck: crossCheck,
    source: crossCheck === 'direct' ? 'A rev179 C-02 / OP-P04; mapping-A'
      : crossCheck === 'upstream-calendar-gate' ? 'D rev152 H-2 layer 1 / H-5-2 steps 1-2; A-1-3'
        : 'mapping-A: no separate independent-cross-check requirement; upstream fact uncertainty still applies',
    note: 'Evidence availability only, never role correctness, execution approval or publication permission.' }
}
/** Caller chooses evidence IDs relevant to this rule; unrelated catalog entries do not satisfy it. */
export function assessEvidenceAvailability(ruleId: string, context: EvidenceContextContract, evidenceIds: readonly string[]) {
  const requirement = ruleEvidenceRequirement(ruleId)
  const parsed = evidenceContextSchema.parse(context)
  const byId = new Map(parsed.records.map((record) => [record.evidenceId, record]))
  const selected = evidenceIds.map((id) => byId.get(id))
  const missingIds = evidenceIds.filter((id) => !byId.has(id))
  const eligible = selected.filter((record): record is EvidenceRecord => !!record && record.usage === 'runtime-evidence')
  const availableTypes = [...new Set(eligible.map((record) => record.sourceType))].sort()
  const reasons: string[] = []
  if (missingIds.length) reasons.push('EVIDENCE_REFERENCE_MISSING')
  if (!eligible.length) reasons.push('NO_SCOPED_RUNTIME_EVIDENCE')
  if (eligible.length !== selected.length - missingIds.length) reasons.push('REFERENCE_EVIDENCE_NOT_RUNTIME_INPUT')
  if (requirement.independentCrossCheck !== 'not-directly-required') {
    const crossChecks = eligible.filter((record) => record.sourceType === 'independent-cross-check' && record.status === 'confirmed')
    const confirmed = crossChecks.some((record) => {
      if (record.sourceRef.kind !== 'independent-cross-check') return false
      const observations = record.sourceRef.observationRefs.map((id) => byId.get(id))
      const producers = observations.flatMap((observation) => observation?.sourceRef.kind === 'deterministic-calculation'
        ? [observation.sourceRef.producer.producerId] : [])
      return observations.length >= 2 && new Set(producers).size >= 2
        && observations.every((item) => item?.sourceType === 'deterministic-calculation' && item.usage === 'runtime-evidence')
        && record.verification.basisEvidenceIds.every((id) => byId.has(id) && byId.get(id)?.usage === 'runtime-evidence')
    })
    if (!confirmed) reasons.push('REQUIRED_INDEPENDENT_CROSS_CHECK_UNAVAILABLE')
  }
  return { ...requirement, status: reasons.length ? 'deferred' as const : 'available' as const,
    availableTypes, evidenceIds: [...evidenceIds], missingIds, reasons }
}

/** A real supplied local source text can be recorded; existence does not confirm its claims. */
export function sourceDocumentEvidence(document: Parameters<typeof documentReferenceSchema.parse>[0], content: string): EvidenceRecord {
  const reference = documentReferenceSchema.parse(document)
  const metadata = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content)
  const revision = metadata && /^revision:\s*(\d+)\s*$/m.exec(metadata[1])
  if (!revision || Number(revision[1]) !== reference.documentRevision || !content.includes(reference.section)) {
    throw new TypeError('Source text revision/section does not match its reference.')
  }
  return evidenceRecordSchema.parse({ evidenceId: `runtime-source:${reference.documentId}:${reference.documentRevision}:${reference.section}`,
    sourceType: 'source-document', sourceRef: { kind: 'source-document', document: reference },
    documentRevision: reference.documentRevision, ruleId: null, status: 'provisional',
    verification: { claimRef: `${reference.documentId}:${reference.section}`, method: 'supplied-source-text-metadata-check', basisEvidenceIds: [] },
    note: 'Actual supplied text and revision checked; not independent calendar validation, historical verification or operator approval.',
    uncertaintyIds: ['source-claim-not-independently-verified'], usage: 'runtime-evidence' })
}
export function evidenceAvailabilitySummary(context: EvidenceContextContract) {
  const parsed = evidenceContextSchema.parse(context)
  const types: EvidenceRecord['sourceType'][] = ['customer-input', 'source-document', 'deterministic-calculation',
    'independent-cross-check', 'reverse-inference', 'operator-confirmed']
  return types.map((sourceType) => ({ sourceType, count: parsed.records.filter((record) => record.sourceType === sourceType).length }))
}
