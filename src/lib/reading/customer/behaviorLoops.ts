import type { PersonalityConflict, PersonalityFact } from '../../personality/types'

interface LoopStages {
  readonly trigger: readonly string[]
  readonly response: readonly string[]
  readonly judgment: readonly string[]
  readonly behavior: readonly string[]
  readonly result: readonly string[]
  readonly recurrence: readonly string[]
}

export interface CustomerBehaviorPattern extends LoopStages {
  readonly mechanism: string
  readonly context: readonly string[]
  readonly status: 'ready' | 'partial'
  readonly mappingIds: readonly string[]
  readonly resultCoverage: 'supported' | 'gap'
  readonly recurrenceCoverage: 'supported' | 'gap'
  readonly conflictId?: string
}

// A stage refers to the exact statement that supplies it. A source sentence
// can supply several stages without becoming several independent meanings.
const reactions = new Map<string, { mechanism: string; response?: true; judgment?: true; result?: true }>([
  ['기분이 상하면 표정에 바로 드러남', { mechanism: 'discomfort_visible', response: true }],
  ['속상한 일이 생기면 말을 아끼는 경향', { mechanism: 'upset_withdraws_from_speech', response: true }],
  ['완료한 작업도 다시 점검함', { mechanism: 'rechecking_after_completion', judgment: true }],
  ['힘들 때도 자신의 어려움을 말하지 않음', { mechanism: 'difficulty_kept_private' }],
  ['사회적 마찰이 커지면 반항이 강해짐', { mechanism: 'friction_pushback', response: true }],
  ['검토가 길어지면 시도하기 전에 스스로 포기할 수 있음', { mechanism: 'extended_review_inhibits_action', judgment: true, result: true }],
  ['빠른 결단이 성급해지면 실수가 늘어날 수 있음', { mechanism: 'haste_increases_errors', judgment: true, result: true }],
  ['실수가 없어야 한다는 기준 때문에 시작이나 경로 변경을 주저함', { mechanism: 'error_avoidance_delays_action', judgment: true }],
  ['자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함', { mechanism: 'rigid_standard_reduces_listening', judgment: true }],
  ['결과를 중시한 나머지 목표에 집착하거나 결과가 마음에 들지 않을 일은 시작하지 않기 쉬움', { mechanism: 'expected_result_inhibits_action', judgment: true }],
])

export const hasBehaviorStages = (trait: string) => reactions.has(trait)

export function buildBehaviorPatterns(
  facts: readonly PersonalityFact[],
  conflicts: readonly PersonalityConflict[],
  sourceRefsFor: (fact: PersonalityFact) => readonly string[],
) {
  const candidates = new Map<string, CustomerBehaviorPattern>()
  function add(candidate: Omit<CustomerBehaviorPattern, 'status' | 'context' | 'mappingIds' | 'resultCoverage' | 'recurrenceCoverage'>) {
    const { trigger, response, judgment, behavior, result, recurrence, mechanism, conflictId } = candidate
    if (candidates.has(mechanism)) return
    const contextSwitch = mechanism === 'expression_review_context_split' && conflictId && judgment.length && behavior.length
    const context = contextSwitch ? [behavior[0], judgment[0]] : trigger
    const ready = context.length && (response.length || judgment.length) && behavior.length
    candidates.set(mechanism, {
      ...candidate, context, status: ready ? 'ready' : 'partial',
      mappingIds: [conflictId ? 'CL-P02' : 'CL-P03', ...(result.length ? ['CL-P04'] : []),
        ...(recurrence.length ? ['CL-P05'] : [])],
      resultCoverage: result.length ? 'supported' : 'gap',
      recurrenceCoverage: recurrence.length ? 'supported' : 'gap',
    })
  }
  for (const fact of facts) {
    const reaction = reactions.get(fact.trait)
    if (!reaction) continue
    const ids = [fact.id]
    const standard = reaction.mechanism === 'rechecking_after_completion'
      ? facts.find(other => fact.sourceType === 'day_stem' && other.sourceType === 'day_stem'
        && other.trait === '자신의 결과물에 타인의 결과물보다 높은 기준을 적용함'
        && sourceRefsFor(other).some(ref => sourceRefsFor(fact).includes(ref))) : undefined
    if (reaction.mechanism === 'rechecking_after_completion' && !standard) continue
    add({
      mechanism: reaction.mechanism, trigger: ids, response: reaction.response ? ids : [], behavior: ids,
      judgment: standard ? [standard.id] : reaction.judgment ? ids : [], result: reaction.result ? ids : [], recurrence: [],
    })
  }
  for (const conflict of conflicts) {
    if (conflict.conflictType === 'source_explicit' && conflict.explanationEvidence.length) {
      const linked = facts.filter(fact => conflict.factIds.includes(fact.id))
      const intent = linked.find(fact => fact.trait === '선두에 서려는 의욕')
      const reconsideration = linked.find(fact => fact.trait === '움직여도 되는지 재확인하는 망설임')
      const delay = linked.find(fact => fact.trait === '하고 싶은 일이 있어도 실제 착수가 늦어짐')
      if (intent && reconsideration && delay) {
        const mechanism = 'intent_reconsideration_delays_start'
        add({
          mechanism, conflictId: conflict.id,
          trigger: [intent.id], response: [], judgment: [reconsideration.id],
          behavior: [reconsideration.id], result: [delay.id], recurrence: [],
        })
      }
    }
    if (conflict.conflictType !== 'outward_vs_inner' || conflict.resolution !== 'context_split'
      || conflict.factIds.length !== 2 || !conflict.explanationEvidence.length) continue
    const outward = facts.find(fact => conflict.factIds.includes(fact.id) && fact.traitType === 'social')
    const inward = facts.find(fact => conflict.factIds.includes(fact.id) && fact.traitType === 'decision')
    const mechanism = 'expression_review_context_split'
    if (!outward || !inward) continue
    add({
      mechanism, conflictId: conflict.id, trigger: [], response: [], judgment: [inward.id], behavior: [outward.id],
      result: [], recurrence: [],
    })
  }
  return [...candidates.values()].sort((a, b) => Number(b.status === 'ready') - Number(a.status === 'ready'))
}
