import type { CalculatedChart, ValueStatus } from '../canonical/types'

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T
export type DocumentId = 'A' | 'B' | 'C' | 'D' | '㉕-7'
export type RuleReference = {
  ruleId: string
  ruleVersion: string
  sourceDocument: DocumentId | 'TEST'
  sourceRevision: number
  sourceSection: string
  sourceContentHash: string
}
export type RuleStatus = 'applied' | 'not-applicable' | 'deferred' | 'unsupported' | 'error'
export type JudgmentFact = {
  id: string
  value: JsonValue
  assessment: ValueStatus
  canonicalPointer: string
  uncertaintyIds: string[]
}
export type JudgmentEvidence = {
  id: string
  rule: RuleReference
  factIds: string[]
  dependencyApplicationIds: string[]
  clauseId: string
  observedValues: Record<string, JsonValue>
  outcome: 'satisfied' | 'not-satisfied' | 'undetermined'
}
export type OperatorReview = {
  policyId: string
  operatorApprovalRequired: boolean | 'unresolved'
  status: 'auto-approved' | 'review-required' | 'blocked'
  reasonCodes: string[]
}
export type RuleApplication = {
  id: string
  rule: RuleReference
  inputsUsed: { inputKey: string; factId: string }[]
  evaluation:
    | { status: 'applied'; result: JsonValue; evidenceIds: string[] }
    | { status: Exclude<RuleStatus, 'applied'>; reasonCode: string; evidenceIds: string[] }
  operatorReview: OperatorReview
}
export type RuleVersionManifest = {
  id: string
  engineVersion: 'judgment-skeleton-1'
  scope: 'production' | 'test'
  documents: Record<DocumentId, { revision: number; contentHash: string | null }>
  rules: { ruleId: string; ruleVersion: string; sources: RuleReference[] }[]
}
export type JudgmentResult = {
  schemaVersion: '1'
  input: {
    canonicalSchemaVersion: CalculatedChart['schemaVersion']
    calculationContext: CalculatedChart['context']
  }
  ruleManifest: RuleVersionManifest
  facts: JudgmentFact[]
  evidence: JudgmentEvidence[]
  applications: RuleApplication[]
  /** Completeness of this registry execution only, not coverage of FILUNE documents. */
  completeness: 'complete' | 'partial' | 'failed'
}
