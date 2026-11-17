import type { CalculatedChart } from '../../canonical/types'
import type { DeepReadonly } from '../types'
import type { JudgmentProducerOutput, ProducerOptions } from './types'
import { fromCanonical } from './fromCanonical'
import { hiddenStemProducer } from './hiddenStemProducer'
import { relationFactProducer } from './relationFactProducer'
import { evidenceProducer } from './evidenceProducer'
import { detach, jsonValue } from './shared'
import { validateProducerOutput } from './validation'
export * from './types'
export { fromCanonical, hiddenStemProducer, relationFactProducer, evidenceProducer }
export { validateProducerOutput }

/** Fact production only. Intentionally not wired into the existing judgment evaluator. */
export function produceJudgmentFacts(input: DeepReadonly<CalculatedChart>, options: ProducerOptions = {}): JudgmentProducerOutput {
  const projection = fromCanonical(input)
  const hidden = hiddenStemProducer(projection, options.hiddenStemSystem)
  const relations = relationFactProducer(projection, options.relationScopes)
  const evidence = evidenceProducer(projection, { hidden: [hidden.hiddenStemSystem.systemId, ...hidden.hiddenStems.map((fact) => fact.id)],
    relations: relations.relations.map((fact) => fact.relationFactId),
    coverage: relations.coverage.map((fact) => fact.coverageId) }, options)
  if (options.customerInputReceipt) projection.facts.find((fact) => fact.canonicalPointer === '/birthInput')!
    .evidenceIds.push('producer-evidence:customer-input')
  const metadata = detach(input) as CalculatedChart
  const output: JudgmentProducerOutput = detach({ ...projection, ...hidden, ...relations, evidence, roleStates: [],
    timePolicy: metadata.timePolicy, uncertainties: metadata.uncertainties,
    calculationProvenance: jsonValue(input.context.calculationVersion) })
  validateProducerOutput(output)
  return output
}

/** Judgment-only entry point. Legacy projection remains separate and does not certify document compliance.
 * Canonical basicRelations retains legacy values for audit; only hiddenStems uses the selected authority.
 */
export function produceJudgmentEngineFacts(input: DeepReadonly<CalculatedChart>,
  options: ProducerOptions & { hiddenStemSystem: NonNullable<ProducerOptions['hiddenStemSystem']> }): JudgmentProducerOutput {
  if (options.hiddenStemSystem?.systemId !== 'filune-a179') throw new TypeError('Judgment Engine requires filune-a179.')
  return produceJudgmentFacts(input, options)
}
export * from './provenanceProducer'
export { produceExposureRootFacts } from './exposureRootProducer'
export type { ExposureFact, ExposureRootSelection } from '../facts/exposureFact'
export type { RootFact } from '../facts/rootFact'
