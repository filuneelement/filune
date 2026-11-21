import type { LuckScopeState } from '../judgment/core/luckScope'
import type { CrossPathEvidence, CrossRoleInteractionFact } from './types'

type Role = LuckScopeState['roleEngine']['roleHistory'][number]
type Current = LuckScopeState['roleEngine']['currentRoles'][number]

/** Only the current role's exact, operating personal paths can establish a contribution. */
export function linkCrossPathEvidence(judgment: LuckScopeState, role: Role, current: Current | undefined,
  action: CrossRoleInteractionFact['action'], interactionId: string, effective: boolean): CrossPathEvidence[] {
  if (!effective || (current?.currentFunction !== 'operating' && current?.currentFunction !== 'reduced')) return []
  const contribution = action === 'combine' ? 'stopped' : action === 'control' ? 'weakened'
    : action === 'generate' ? 'generated' : 'root_supported'
  const change = contribution === 'stopped' ? 'blocked' : contribution === 'weakened' ? 'weakened' : 'supported'
  return [...judgment.stemFacts, ...judgment.patternFacts].flatMap<CrossPathEvidence>(path => {
    if (path.source.id !== role.entityId || !current.pathRefs.includes(path.id)
      || (path.action !== 'generate' && path.action !== 'control')) return []
    const actual = judgment.actualFunctions.find(item => item.relationFactId === path.id)
    if (!actual?.policyId || !actual.structuralEffect?.currentlyEffective
      || (actual.function !== 'operating' && actual.function !== 'reduced')) return []

    const damage = role.role === 'Byeong' && actual.byeongCandidate && judgment.policyRoles.byeong.find(item =>
      item.policyId === actual.policyId && item.sourceEntityId === path.source.id && item.targetEntityId === path.target.id
      && item.action === path.action && item.currentState !== 'inactive' && item.relationFactIds.includes(path.id))
    const required = actual.selectionReason === 'required_function'
      && (actual.direction === 'favorable' || actual.direction === 'favorable_auxiliary')
      && (role.role === 'YongShen' || role.role === 'SangShen' || role.role === 'GuEung')
    if (!damage && !required) return []
    // An already diminished function can still be fully stopped; an additional decrease
    // requires evidence beyond a second label of "weakened".
    if (change === 'weakened' && (actual.function !== 'operating' || current.currentFunction !== 'operating')) return []
    return [{
      pathId: path.id, patternContextId: actual.patternContextId,
      sourceEntityId: path.source.id, targetEntityId: path.target.id, policyId: actual.policyId,
      classification: damage ? 'harmful' : 'required',
      critical: damage ? damage.damagedFunction === 'day_master' || damage.damagedFunction === 'necessary_killing' : true,
      before: actual.function, change, contribution,
      sourceFactIds: [judgment.id, role.roleId, path.id, actual.patternContextId, interactionId, ...(damage ? [damage.id] : [])],
    }]
  }).sort((a, b) => a.pathId < b.pathId ? -1 : a.pathId > b.pathId ? 1 : 0)
}
