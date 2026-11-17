import { validateContractBundle } from '../../contracts'
import { detach } from '../../producers/shared'
import { selectScope } from './selectScope'
import { application, initializeStates } from './applyCombinationState'
import { carryForward, finishSnapshot } from './carryForward'
import { evaluateLuckToLuckCombination } from './evaluateLuckToLuckCombination'
import { evaluateLuckToNatalCombination } from './evaluateLuckToNatalCombination'
import type { StemCombinationInput, StemCombinationResult, Work } from './types'
export * from './types'
export { selectScope, carryForward, evaluateLuckToLuckCombination, evaluateLuckToNatalCombination }

/** Minimal structural evaluator. Does not read hidden-stem entries, CS outcomes or RoleState. */
export function evaluateStemCombination(input: StemCombinationInput): StemCombinationResult {
  const selected = selectScope(input)
  const work: Work = { input, ...selected, states: new Map(), events: [], excludedFromNatal: new Set(), priorLuckProcessing: new Set() }
  const deferred: StemCombinationResult['deferred'] = []
  if (input.context.periodSelectionStatus !== 'confirmed') deferred.push({ reason: 'Execution period unresolved', ruleIds: ['OP-L01'] })
  const natalPairs = selected.relations.filter((r) => r.participantEntityIds.every((id) =>
    selected.stems.find((e) => e.entityId === id)?.origin === 'natal')
    && r.participantEntityIds.every((id) => selected.stems.find((e) => e.entityId === id)?.position !== 'day'))
  if (natalPairs.length) deferred.push({ reason: 'Natal-internal combination resolution is outside this minimal slice',
    ruleIds: ['OP-T01', 'OP-T02', 'OP-T09', 'OP-T12'] })
  if (selected.stems.filter((e) => e.origin === 'natal').length !== 4) deferred.push({ reason: 'Four explicit natal stem facts required', ruleIds: ['OP-T03', 'OP-T04'] })
  if (!deferred.length) {
    carryForward(work, input.upstream)
    initializeStates(work)
    if (input.context.stage !== 'natal') {
      if (input.upstream) application(work, 'OP-L02', input.upstream.context.scopeId)
      if (input.context.stage === 'monthlyLuck') application(work, 'IR-01', input.upstream!.context.scopeId)
      evaluateLuckToLuckCombination(work)
      evaluateLuckToNatalCombination(work)
    }
    finishSnapshot(work)
  }
  const bundle = validateContractBundle(work.bundle)
  return detach({ status: deferred.length ? 'deferred' : 'evaluated', producerSnapshotIdentity: input.context.producerSnapshotIdentity,
    context: input.context, states: [...work.states.values()].sort((a, b) => a.targetEntityId.localeCompare(b.targetEntityId)),
    events: work.events, bundle, deferred, roleStates: [], hiddenStemJudgments: 'deferred-not-consumed',
    regressionReady: false, publicationReady: false })
}
