import type { JudgmentFact, JsonValue, OperatorReview, RuleApplication, RuleReference, RuleVersionManifest } from '../types'

export type EvidenceDraft = {
  factIds: string[]
  dependencyApplicationIds: string[]
  clauseId: string
  observedValues: Record<string, JsonValue>
  outcome: 'satisfied' | 'not-satisfied' | 'undetermined'
}
export type RuleEvaluation =
  | { status: 'applied'; result: JsonValue; evidence: EvidenceDraft[] }
  | { status: 'not-applicable' | 'deferred' | 'unsupported' | 'error'; reasonCode: string; evidence: EvidenceDraft[] }
export type RuleDefinition = {
  id: string
  version: string
  sources: RuleReference[]
  description: string
  requiredInputs: { key: string; factId: string }[]
  dependsOn: string[]
  outputSchemaId: string
  reviewPolicyId: string
  evaluator: (input: {
    facts: Readonly<Record<string, Readonly<JudgmentFact>>>
    dependencyResults: Readonly<Record<string, Readonly<RuleApplication>>>
  }) => RuleEvaluation
}
export type OutputSchema = { id: string; validate: (value: JsonValue) => boolean }
export type ReviewPolicy = {
  id: string
  scope: 'test'
  evaluate: (application: Readonly<RuleApplication>) => OperatorReview
}
export type UncertaintyPolicy = {
  id: string
  defer: (facts: readonly Readonly<JudgmentFact>[]) => boolean
}
export type RuleRegistry = { rules: readonly RuleDefinition[]; outputSchemas: readonly OutputSchema[] }
export type RuleExecutionContext = {
  manifest: RuleVersionManifest
  registry: RuleRegistry
  reviewPolicies?: readonly ReviewPolicy[]
  uncertaintyPolicy?: UncertaintyPolicy
}
