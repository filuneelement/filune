import type { ApplicationReference, ContractBundle, RuntimeStateContract, RelationFactContract, Validity } from '../../contracts'
import type { JudgmentProducerOutput, FactEntity } from '../../producers'
import type { ExecutionScopeContext } from '../../runtime'
export type StemCombinationInput = { producer: JudgmentProducerOutput; context: ExecutionScopeContext; upstream?: StemCombinationResult }
export type CombinationEvent = { ruleIds: string[]; relationFactId: string; participantEntityIds: string[];
  effect: 'weakening' | 'stopping'; applicationRefs: ApplicationReference[]; evidenceIds: string[] }
export type StemCombinationResult = {
  status: 'evaluated' | 'deferred'; producerSnapshotIdentity: string; context: ExecutionScopeContext
  states: RuntimeStateContract[]; events: CombinationEvent[]; bundle: ContractBundle
  deferred: { reason: string; ruleIds: string[] }[]; roleStates: []; hiddenStemJudgments: 'deferred-not-consumed'
  regressionReady: false; publicationReady: false
}
export type Work = { input: StemCombinationInput; bundle: ContractBundle; stems: FactEntity[];
  relations: RelationFactContract[]; states: Map<string, RuntimeStateContract>; events: CombinationEvent[];
  excludedFromNatal: Set<string>; priorLuckProcessing: Set<string> }
export function exactContains(period: Validity, from: string, to = from): boolean {
  return period.from.kind === 'exact' && period.to.kind === 'exact'
    && period.from.instant <= from && (to === from ? from < period.to.instant : to <= period.to.instant)
}

/** A candidate remains, but its current participation or effect cannot be established. */
export class UnsupportedPriorStopLuckPairError extends TypeError {
  constructor() { super('New luck pair participation or effect is unresolved; unsupported boundary requires review.') }
}
