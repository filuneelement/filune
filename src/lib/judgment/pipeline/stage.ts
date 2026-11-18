import type { Validity } from '../contracts'
import type { ProducerReference } from '../producers/types'
import { sortedUnique } from '../producers/shared'

export type StageStatus = 'confirmed' | 'deferred' | 'not-applicable' | 'rejected'
export type StageResult = {
  stageId: string
  scopeId: string
  status: StageStatus
  resultRefs: string[]
  reasonCodes: string[]
  ruleIds: string[]
  evidenceIds: string[]
  provenance: { producerRef: ProducerReference; method: string }
  uncertaintyIds: string[]
  effectivePeriod: Validity | null
}

export function stageResult(context: { scopeId: string; effectivePeriod: Validity | null }, producerRef: ProducerReference,
  stageId: string, status: StageStatus,
  details: Partial<Pick<StageResult, 'resultRefs' | 'reasonCodes' | 'ruleIds' | 'evidenceIds' | 'uncertaintyIds'>> = {}): StageResult {
  return {
    stageId, scopeId: context.scopeId, effectivePeriod: context.effectivePeriod, status,
    resultRefs: sortedUnique(details.resultRefs ?? []), reasonCodes: sortedUnique(details.reasonCodes ?? []),
    ruleIds: sortedUnique(details.ruleIds ?? []), evidenceIds: sortedUnique(details.evidenceIds ?? []),
    uncertaintyIds: sortedUnique(details.uncertaintyIds ?? []), provenance: { producerRef, method: stageId },
  }
}
