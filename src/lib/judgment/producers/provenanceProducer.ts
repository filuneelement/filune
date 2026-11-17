import type { CalculatedChart } from '../../canonical/types'
import type { DeepReadonly } from '../types'
import type { JudgmentProducerOutput } from './types'
import { fromCanonical } from './fromCanonical'
import { validateProducerOutput } from './validation'
import { detach } from './shared'
import { evidenceContextSchema } from '../contracts'
import { assessEvidenceAvailability, CS005_CANDIDATE_RULE_IDS } from '../runtime/evidenceAvailability'
import { FILUNE_A179, a179SourceEvidence } from '../systems/hiddenStemFiluneA179'

/** Source inventory describes the actual code paths, not independent verification observations. */
export const CALCULATION_SOURCE_INVENTORY = Object.freeze([
  { field: 'birthDateTime', sourceRef: 'canonical:/birthInput', method: 'supplied-input; unknown time remains unknown' },
  { field: 'birthplace', sourceRef: 'canonical:/birthInput/birthplace', method: 'optional supplied location metadata' },
  { field: 'timezone', sourceRef: 'canonical:/timePolicy', method: 'recorded timezone and actual per-calculation interpretation' },
  { field: 'localTimeCorrection', sourceRef: 'src/lib/timeCorrection.ts', method: 'existing longitude correction; US Intl/IANA; trueSolarTime unsupported' },
  { field: 'jieInstant', sourceRef: 'src/lib/solarTermPillars.ts', method: 'astronomy-engine SunPosition/SearchSunLongitude; fixed JST conversion' },
  { field: 'fourPillars', sourceRef: 'src/lib/calculateEightChar.ts', method: 'year/month astronomy-engine; day/hour lunar-typescript; optional corrected hour' },
  { field: 'greatLuckStart', sourceRef: 'src/lib/calculateGreatLuck.ts', method: 'same astronomy-engine jie boundaries and existing conversion convention' },
] as const)

async function sha256(value: string): Promise<string> {
  const bytes = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
/** Receipt assertions remain provisional. This adapter does not create external observations,
 * reverse-inference adoption decisions, approvals, or independent cross-checks.
 * Multiple projections of the same calculation retain ONE origin identity.
 */
export async function provenanceProducer(chart: DeepReadonly<CalculatedChart>, output: JudgmentProducerOutput,
  sourceText?: string) {
  validateProducerOutput(output)
  const expected = fromCanonical(chart)
  if (expected.facts.length !== output.facts.length || expected.facts.some((fact) => {
    const actual = output.facts.find((item) => item.id === fact.id)
    return !actual || JSON.stringify(detach({ value: actual.value, assessment: actual.assessment }))
      !== JSON.stringify(detach({ value: fact.value, assessment: fact.assessment }))
  })) throw new TypeError('Provenance fact values do not match canonical input.')
  const context = evidenceContextSchema.parse(output.evidence)
  if (JSON.stringify(detach(chart.context)) !== JSON.stringify(detach(output.canonicalContext))) {
    throw new TypeError('Provenance chart/context mismatch.')
  }
  // Verify values against the projection, not just an equal calculation version/reference time.
  for (const pointer of ['birthInput', 'context', 'timePolicy', 'solarTerms', 'uncertainties'] as const) {
    const fact = output.facts.find((item) => item.canonicalPointer === '/' + pointer)
    if (!fact || JSON.stringify(detach(fact.value)) !== JSON.stringify(detach(chart[pointer]))) {
      throw new TypeError('Provenance input differs from projected canonical source.')
    }
  }
  const inputHash = await sha256(JSON.stringify(detach(chart.birthInput)))
  const calculationOrigin = await sha256(JSON.stringify(detach({ input: chart.birthInput, context: chart.context })))
  const source = sourceText === undefined ? undefined : a179SourceEvidence(sourceText)
  const sourceHash = sourceText === undefined ? null : await sha256(sourceText)
  if (sourceHash && sourceHash !== FILUNE_A179.sourceSha256) throw new TypeError('Frozen A179 source hash mismatch.')
  const records = await Promise.all(context.records.map(async (record) => {
    if (!['customer-input', 'deterministic-calculation', 'source-document'].includes(record.sourceType)) {
      throw new TypeError('Adapter cannot attest externally supplied verification, inference or approval.')
    }
    if (record.sourceType === 'source-document' && (!source || record.evidenceId !== source.evidenceId
      || JSON.stringify(record) !== JSON.stringify(source))) {
      throw new TypeError('Actual matching source text is required for document provenance.')
    }
    const documentHash = record.sourceType === 'source-document' ? sourceHash : null
    const enrichedRecord = { ...record, hash: { algorithm: 'SHA-256' as const,
      value: documentHash ?? inputHash,
      hashTarget: documentHash ? FILUNE_A179.path : 'canonical:/birthInput' } }
    return { evidence: enrichedRecord, sourceType: record.sourceType, sourceRef: detach(record.sourceRef),
      calculationVersion: detach(chart.context.calculationVersion), documentRevision: record.documentRevision,
      producedAt: null, referenceTime: chart.context.referenceTime, inputHash: { algorithm: 'SHA-256' as const, value: inputHash },
      sourceHash: documentHash ? { algorithm: 'SHA-256' as const, value: documentHash } : null,
      independent: false, originIdentity: record.sourceType === 'deterministic-calculation'
        ? 'canonical-computation:' + calculationOrigin : record.evidenceId,
      status: record.status,
      note: 'Reference time is not an observed production timestamp; hash identifies inputs/content, not truth.' }
  }))
  const evidenceIds = context.records.map((record) => record.evidenceId)
  return { evidenceContext: evidenceContextSchema.parse({ ...context, records: records.map((item) => item.evidence) }), records,
    sourceInventory: CALCULATION_SOURCE_INVENTORY.map((item) => ({ ...item, independent: false,
      independentSourceStatus: 'unavailable' as const })),
    hiddenStemSystemId: output.hiddenStemSystem.systemId,
    hiddenStemAuthority: output.hiddenStemSystem.systemId === FILUNE_A179.id
      ? { canonicalBasicRelations: 'legacy-reference-only', completeTableAvailable: false } : null,
    availability: { 'customer-input': context.records.some((r) => r.sourceType === 'customer-input') ? 'provisional' : 'unavailable',
      'deterministic-calculation': 'provisional', 'source-document': source ? 'provisional' : 'unavailable',
      'independent-cross-check': 'unavailable', 'reverse-inference': 'unavailable', 'operator-confirmed': 'unavailable' },
    ruleAvailability: CS005_CANDIDATE_RULE_IDS.map((ruleId) => assessEvidenceAvailability(ruleId, context, evidenceIds)) }
}
