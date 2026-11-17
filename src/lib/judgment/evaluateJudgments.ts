import { serializeCanonical } from '../canonical/serialization'
import type { CalculatedChart } from '../canonical/types'
import { fromCanonical } from './facts/fromCanonical'
import { unresolvedOperatorReview } from './policies/operatorReview'
import { CONFIRMED_INPUTS_ONLY } from './policies/uncertainty'
import { validateRegistry } from './registry/validateRegistry'
import type { RuleExecutionContext } from './registry/types'
import type { DeepReadonly, JudgmentEvidence, JudgmentResult, RuleApplication } from './types'

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

// Engine types already contain JSON values. Avoid recursively remapping JsonValue's
// recursive union through Serialized<T>; validate and detach at the runtime boundary.
function copyJson<T>(value: T): T {
  return serializeCanonical<unknown>(value) as T
}

/** Trusted synchronous evaluators receive only declared facts and dependency results.
 * This is an API boundary, not a sandbox for arbitrary/untrusted JavaScript plugins.
 * All new policies/rules must themselves remain pure; no implicit clock is provided.
 */
export function evaluateJudgments(chart: DeepReadonly<CalculatedChart>, context: RuleExecutionContext): JudgmentResult {
  const facts = fromCanonical(chart)
  const ordered = validateRegistry(context)
  const factIndex = new Map(facts.map((fact) => [fact.id, fact]))
  const applications: RuleApplication[] = []
  const evidence: JudgmentEvidence[] = []
  for (const rule of ordered) {
    const used = rule.requiredInputs.map(({ key, factId }) => ({ inputKey: key, factId }))
    const selected = rule.requiredInputs.map(({ factId }) => factIndex.get(factId))
    const dependencies = rule.dependsOn.map((id) => applications.find((app) => app.rule.ruleId === id)!)
    const app: RuleApplication = {
      id: `application:${rule.id}`, rule: serializeCanonical(rule.sources[0]),
      inputsUsed: used, evaluation: { status: 'deferred', reasonCode: 'INPUT_UNAVAILABLE', evidenceIds: [] },
      operatorReview: unresolvedOperatorReview(rule.reviewPolicyId),
    }
    const required = selected.filter((fact) => fact !== undefined)
    if (required.length === selected.length
      && !(context.uncertaintyPolicy ?? CONFIRMED_INPUTS_ONLY).defer(freeze(copyJson(required)))
      && dependencies.every(({ evaluation }) => evaluation.status === 'applied')) {
      const input = freeze({
        facts: Object.fromEntries(required.map((fact) => [fact.id, copyJson(fact)])),
        dependencyResults: Object.fromEntries(dependencies.map((dep) => [dep.rule.ruleId, copyJson(dep)])),
      })
      const evaluated = copyJson(rule.evaluator(input))
      if (!['applied', 'not-applicable', 'deferred', 'unsupported', 'error'].includes(evaluated.status)
        || !Array.isArray(evaluated.evidence)) throw new TypeError(`Invalid rule evaluation: ${rule.id}.`)
      if (evaluated.status === 'applied') {
        if (!evaluated.evidence.length) throw new TypeError(`Applied result requires evidence: ${rule.id}.`)
        if (!context.registry.outputSchemas.find(({ id }) => id === rule.outputSchemaId)!.validate(freeze(copyJson(evaluated.result)))) {
          throw new TypeError(`Output schema rejected result: ${rule.id}.`)
        }
      }
      const evidenceIds: string[] = []
      for (const [index, draft] of evaluated.evidence.entries()) {
        if (!draft.clauseId || !['satisfied', 'not-satisfied', 'undetermined'].includes(draft.outcome)
          || !draft.factIds.length || draft.factIds.some((id) => !required.some((fact) => fact.id === id))
          || draft.dependencyApplicationIds.some((id) => !dependencies.some((dep) => dep.id === id))) {
          throw new TypeError(`Invalid evidence links: ${rule.id}.`)
        }
        const item = { ...draft, id: `evidence:${rule.id}:${index}`, rule: app.rule }
        evidence.push(item)
        evidenceIds.push(item.id)
      }
      app.evaluation = evaluated.status === 'applied'
        ? { status: 'applied', result: evaluated.result, evidenceIds }
        : { status: evaluated.status, reasonCode: evaluated.reasonCode, evidenceIds }
      const policy = context.reviewPolicies?.find(({ id }) => id === rule.reviewPolicyId)
      if (policy && app.evaluation.status === 'applied') {
        const review = copyJson(policy.evaluate(freeze(copyJson(app))))
        if (review.policyId !== policy.id || !['auto-approved', 'review-required', 'blocked'].includes(review.status)
          || ![true, false, 'unresolved'].includes(review.operatorApprovalRequired)
          || !Array.isArray(review.reasonCodes)
          || (review.status === 'auto-approved' && review.operatorApprovalRequired !== false)) {
          throw new TypeError('Invalid operator review result.')
        }
        app.operatorReview = review
      }
    } else if (dependencies.some(({ evaluation }) => evaluation.status !== 'applied')) {
      app.evaluation = { status: 'deferred', reasonCode: 'DEPENDENCY_UNAVAILABLE', evidenceIds: [] }
    }
    applications.push(app)
  }
  return copyJson<JudgmentResult>({
    schemaVersion: '1',
    input: { canonicalSchemaVersion: chart.schemaVersion, calculationContext: chart.context },
    ruleManifest: context.manifest, facts, evidence, applications,
    completeness: applications.some(({ evaluation }) => evaluation.status === 'error') ? 'failed'
      : applications.some(({ evaluation, operatorReview }) =>
        ['deferred', 'unsupported'].includes(evaluation.status)
        || (evaluation.status === 'applied' && operatorReview.status !== 'auto-approved')) ? 'partial' : 'complete',
  })
}
