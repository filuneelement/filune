import type { CalculatedChart, ValueStatus } from '../../canonical/types'
import type { HiddenStemRole, TenGod } from '../../dayRelationships'
import type { EntityReference, EvidenceContextContract, HiddenStemEntry, HiddenStemSystemContract,
  RelationCoverage, RelationFactContract, RoleStateContract } from '../contracts'
import type { Infer } from '../contracts/schema'
import type { producerReferenceSchema } from '../contracts/common'
import type { JudgmentFact, JsonValue } from '../types'

export type SourceScope = 'natal' | 'greatLuck' | 'yearlyLuck' | 'monthlyLuck'
export type ProducerReference = Infer<typeof producerReferenceSchema>
export type ProducedFact = JudgmentFact & {
  sourceScope: SourceScope | 'context'
  evidenceIds: string[]
  provenance: { producerRef: ProducerReference; method: string }
}
export type FactEntity = EntityReference & {
  value: string
  assessment: ValueStatus
  uncertaintyIds: string[]
  sourceScope: SourceScope
  evidenceIds: string[]
}
export type HiddenStemFact = {
  id: string; branchEntityId: string; hiddenStem: string; role: HiddenStemRole; roleOrder: number
  tenGod: TenGod | null; sourceSystemId: string; assessment: ValueStatus; uncertaintyIds: string[]
  inputFactIds: string[]; evidenceIds: string[]
  provenance: { producerRef: ProducerReference; tableRef: string; method: string }
}
/** Observation universe, NOT an OP-L01 direct execution scope. */
export type ObservationScope = {
  scopeId: string; purpose: 'unselected-candidates'; entityIds: string[]; sourceScopes: SourceScope[]
}
export type ProducerOptions = {
  /** Explicit authority selection requires actual source text. Legacy callers keep their existing system. */
  hiddenStemSystem?: { systemId: 'filune-a179'; sourceText: string }
  /** Caller-supplied universe only. No implicit current-period/OP-L01 selection. */
  relationScopes?: { scopeId: string; entityIds: string[] }[]
  /** Omit unless the caller actually has a customer receipt; birthInput alone proves no source. */
  customerInputReceipt?: { recordId: string; receiptRef: string }
}
export type CanonicalProjection = {
  facts: ProducedFact[]; entities: FactEntity[]; producerRef: ProducerReference
  unavailableEntityFactRefs: string[]; canonicalContext: CalculatedChart['context']
}
export type JudgmentProducerOutput = CanonicalProjection & {
  /** Present only for A authority; absence of a role is unknown, never proof of nonexistence. */
  hiddenStemAvailability?: { branchEntityId: string; completeness: 'complete' | 'partial' | 'unknown'; uncertaintyIds: string[] }[]
  canonicalHiddenStemUsage?: 'legacy-reference-only'
  hiddenStems: HiddenStemFact[]; hiddenStemSystem: HiddenStemSystemContract; hiddenStemEntries: HiddenStemEntry[]
  observationScopes: ObservationScope[]; relations: RelationFactContract[]; coverage: RelationCoverage[]
  evidence: EvidenceContextContract; roleStates: RoleStateContract[]
  /** Detached original metadata; not an independently verified time/history claim. */
  timePolicy: CalculatedChart['timePolicy']; uncertainties: CalculatedChart['uncertainties']
  calculationProvenance: JsonValue
}
