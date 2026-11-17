import type { FactEntity, HiddenStemFact, JudgmentProducerOutput, SourceScope } from '../producers'
import type { ExecutionScopeContext } from '../runtime'
import type { JsonValue } from '../types'

/** Shared lineage only; exposure and root remain separate facts, never RoleState. */
export type DerivedStemFactBasis = {
  id: string; stemEntityId: string; hiddenStem: string | null; hiddenStemRole: HiddenStemFact['role'] | null
  hiddenStemSystemId: string; sourceScope: SourceScope; scopeId: string
  evidenceIds: string[]; uncertaintyIds: string[]; assessment: FactEntity['assessment']
  provenance: { producerRef: JudgmentProducerOutput['producerRef']; inputFactIds: string[]
    sourceDocumentRefs: string[]; sourceRuleIds: string[]; calculationVersion: JsonValue
    ruleVersion: 'A179'; method: string
    assessmentBasis: { parentFactIds: string[]; receiptEvidenceIds: string[]; localCoverage: string; legacyFallback: boolean } }
}
export type ExposureFact = DerivedStemFactBasis & {
  kind: 'exposure'; sourceBranchEntityId: string; sourceBranchScope: SourceScope
  visibleStemPosition: 'year' | 'month' | 'day' | 'hour' | null
  exposed: boolean | null; sameElementVisible: boolean | null
  /** I-02 applies to natal month command only. Other branches record visibility without extending that rule. */
  monthCommand: boolean; dayStemExcluded: boolean
}
export type ExposureRootSelection = { producer: JudgmentProducerOutput; context: ExecutionScopeContext }
