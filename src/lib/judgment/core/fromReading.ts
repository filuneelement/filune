import type { Validity, RoleStateContract } from '../contracts'
import type { FactEntity, JudgmentProducerOutput } from '../producers'
import type { evaluateNatalStemCombination } from '../evaluators/natalStemCombination'
import type { JudgmentCoreInput, LuckScopeInput, ResourceExcessEvidence, ScopePillar } from './luckScope'
import type { PatternPolicyEvidence } from './patternPolicyEvidence'
import type { CapacityEvidence, Scope } from './types'
import { luckPeriodStatus } from './luckValidity'
import { runJudgmentCore } from './luckScope'

function pillar(entities: readonly FactEntity[]): ScopePillar {
  const stem = entities.find((entity) => entity.part === 'stem' && entity.assessment === 'confirmed')
  const branch = entities.find((entity) => entity.part === 'branch' && entity.assessment === 'confirmed')
  return {
    ...(stem ? { stem: { id: stem.entityId, value: stem.value } } : {}),
    ...(branch ? { branch: { id: branch.entityId, value: branch.value as NonNullable<ScopePillar['branch']>['value'] } } : {}),
  }
}

export type JudgmentCoreEvidence = Pick<JudgmentCoreInput, 'roleFunctionBases' | 'conditionalByeong' | 'natalPolicyEvidence' | 'priorHistory'> & {
  capacityByPeriod?: Partial<Record<Exclude<Scope, 'natal'>, Readonly<Record<string, CapacityEvidence>>>>
  policyEvidenceByPeriod?: Readonly<Record<string, readonly PatternPolicyEvidence[]>>
  natalCapacityEvidence?: CapacityEvidence
}

export function judgmentCoreFromReading(producer: JudgmentProducerOutput, executionId: string, natalValidity: Validity,
  natalCombination: ReturnType<typeof evaluateNatalStemCombination>, roleHistory: readonly RoleStateContract[],
  periods: Partial<Record<'greatLuck' | 'yearlyLuck' | 'monthlyLuck', Validity>>,
  dailyLuck?: Omit<LuckScopeInput, 'scope'>, resourceExcessEvidence?: ResourceExcessEvidence, evidence?: JudgmentCoreEvidence,
  unconfirmedBranchMainIds?: readonly string[]) {
  const natal: JudgmentCoreInput['natal'] = {}
  for (const position of ['year', 'month', 'day', 'time'] as const) {
    natal[position] = pillar(producer.entities.filter((entity) => entity.origin === 'natal' && entity.position === position))
  }
  const luck: LuckScopeInput[] = []
  for (const scope of ['greatLuck', 'yearlyLuck', 'monthlyLuck'] as const) {
    const validity = periods[scope]
    if (!validity) break
    const selected = pillar(producer.entities.filter((entity) => entity.sourceScope === scope && entity.periodRef === validity.periodId))
    if (!selected.stem || !selected.branch) break
    luck.push({ scope, pillar: selected, validity, resourceExcessEvidenceIds: resourceExcessEvidence?.[scope],
      capacityEvidence: evidence?.capacityByPeriod?.[scope]?.[validity.periodId],
      policyEvidence: evidence?.policyEvidenceByPeriod?.[validity.periodId] })
  }
  if (dailyLuck && luck.length === 3 && luckPeriodStatus(dailyLuck.validity, producer.canonicalContext.referenceTime) === 'effective') {
    luck.push({ ...dailyLuck, scope: 'dailyLuck',
      policyEvidence: evidence?.policyEvidenceByPeriod?.[dailyLuck.validity.periodId] ?? dailyLuck.policyEvidence,
      resourceExcessEvidenceIds: resourceExcessEvidence?.dailyLuck ?? dailyLuck.resourceExcessEvidenceIds })
  }
  return runJudgmentCore({ executionId, referenceTime: producer.canonicalContext.referenceTime,
    priorHistory: evidence?.priorHistory, roleFunctionBases: evidence?.roleFunctionBases, conditionalByeong: evidence?.conditionalByeong,
    natalCapacityEvidence: evidence?.natalCapacityEvidence, natalPolicyEvidence: evidence?.natalPolicyEvidence, natalValidity, natal, roleHistory, luck,
    unconfirmedBranchMainIds, resourceExcessEvidenceIds: resourceExcessEvidence?.natal,
    natalCombinations: natalCombination.status === 'evaluated'
      ? natalCombination.events.filter((event) => event.stopping).map((event) => event.participantEntityIds) : null })
}
