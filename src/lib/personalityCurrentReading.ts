import { calculateDayRelationships, calculateTenGod } from './dayRelationships'
import type { LuckScopeState } from './judgment/core/luckScope'
import type { HeavenlyStem } from './twelveStages'
import type {
  CurrentStructuralRoleState, LuckPersonalityOccurrence, PersonalityPeriod, PersonalityStructuralScope,
} from './personality/current/types'

const SCOPE = {
  natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month', dailyLuck: 'day',
} as const

type ConfirmedLuckStem = { snapshotId: string; entityId: string; stem: HeavenlyStem }

function periodOf(validity: LuckScopeState['validity']): PersonalityPeriod | undefined {
  if (validity.from.kind !== 'exact' || validity.to.kind !== 'exact') return undefined
  const start = Date.parse(validity.from.instant)
  const end = Date.parse(validity.to.instant)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return undefined
  return { periodId: validity.periodId, start: new Date(start).toISOString(), end: new Date(end).toISOString() }
}

/** Translate read-only Judgment outputs at the boundary shared by the two engines. */
export function projectCurrentPersonalityScopes(
  snapshots: readonly LuckScopeState[], dayStem: HeavenlyStem, referenceTime: string,
  confirmedLuckStems: readonly ConfirmedLuckStem[] = [],
): PersonalityStructuralScope[] {
  const now = Date.parse(referenceTime)
  if (!Number.isFinite(now)) throw new TypeError('Current personality requires a valid Judgment evaluation time.')
  const snapshotById = new Map(snapshots.map(snapshot => [snapshot.id, snapshot]))
  const natal = snapshots.find(item => item.scope === 'natal')
  const natalRoleHistory = natal?.roleEngine.roleHistory ?? []
  const natalRoleById = new Map(natalRoleHistory.map(item => [item.roleId, item]))
  return snapshots.map(snapshot => {
    const period = periodOf(snapshot.validity)
    const scope = SCOPE[snapshot.scope]
    const inPeriod = Boolean(period && Date.parse(period.start) <= now && now < Date.parse(period.end))
    const direct = new Set(snapshot.directEntityIds)
    const occurrences: LuckPersonalityOccurrence[] = []
    const branches = snapshot.formationBranchPool.filter(branch => branch.scope === snapshot.scope && direct.has(branch.id))
    const participants = [...snapshot.stemFacts, ...snapshot.patternFacts]
      .flatMap(fact => [fact.source, fact.target])
    const observed = participants.find(item => item.scope === snapshot.scope && item.position === 'luck' && direct.has(item.id))
    const parent = snapshot.parentScopeId ? snapshotById.get(snapshot.parentScopeId) : undefined
    const supplied = confirmedLuckStems.find(item => item.snapshotId === snapshot.id && parent
      && direct.has(item.entityId) && !parent.directEntityIds.includes(item.entityId)
      && snapshot.runtime.some(state => state.entityId === item.entityId)
      && !participants.some(participant => participant.id === item.entityId
        && (participant.scope !== snapshot.scope || participant.position !== 'luck')))
    if (scope !== 'natal' && inPeriod) {
      if (observed) {
        occurrences.push({
          entityId: observed.id, stem: observed.stem, tenGod: observed.tenGod, mode: 'outward',
          sourceIds: [observed.id],
        })
      } else if (supplied) {
        occurrences.push({
          entityId: supplied.entityId, stem: supplied.stem, tenGod: calculateTenGod(dayStem, supplied.stem), mode: 'outward',
          sourceIds: [supplied.entityId],
        })
      }
      for (const branch of branches) {
        for (const hidden of calculateDayRelationships(dayStem, branch.branch).hiddenStems) {
          occurrences.push({
            entityId: branch.id, stem: hidden.stem, tenGod: hidden.tenGod, mode: 'inner',
            sourceIds: [branch.id, `canonical:hidden:${branch.id}:${hidden.role}:${hidden.stem}`],
          })
        }
      }
    }

    const functions = new Map([
      ...snapshot.actualFunctions.map(actual => [actual.relationFactId, actual] as const),
      ...snapshot.inheritedRoleFunctions.map(({ fact, actual }) => [fact.id, actual] as const),
    ])
    const roles: CurrentStructuralRoleState[] = snapshot.roleEngine.currentRoles.flatMap(current => {
      const original = natalRoleById.get(current.roleId)
      if (!original) return []
      const runtime = snapshot.runtime.find(item => item.entityId === original.entityId)?.state
      const trigger = original.role === 'ConditionalByeong' ? snapshot.conditionalByeong.find(item =>
        item.sourceEntityId === original.entityId && original.pathRefs.includes(item.supportingRelationFactId)
        && item.currentState === 'active' && item.triggerRelationFactId && current.pathRefs.includes(item.triggerRelationFactId)) : undefined
      const originalDamage = original.role === 'Byeong' ? natal?.policyRoles.byeong.filter(item =>
        item.sourceEntityId === original.entityId && item.relationFactIds.length === original.pathRefs.length
        && item.relationFactIds.every(ref => original.pathRefs.includes(ref))) : undefined
      const damageState = originalDamage?.length === 1
        ? snapshot.policyRoles.byeong.find(item => item.id === originalDamage[0].id)?.currentState : undefined
      const triggerFunction = trigger?.triggerRelationFactId ? functions.get(trigger.triggerRelationFactId)?.function : undefined
      // ConditionalByeong's own evaluated trigger is authoritative if the inherited function isn't exported.
      const activeTriggerFunction = triggerFunction ?? trigger?.currentFunction
      const triggerLive = activeTriggerFunction === 'operating' || activeTriggerFunction === 'reduced'
      return [{
        roleId: current.roleId, currentState: current.currentState, currentFunction: current.currentFunction,
        ...(runtime && { runtimeState: runtime }), ...(damageState && { damageState }), pathRefs: [...current.pathRefs],
        actualFunctionRefs: current.pathRefs.filter(ref => functions.has(ref)),
        ...(triggerLive && trigger?.triggerRelationFactId && { activeTriggerRef: trigger.triggerRelationFactId, activeTriggerFunction }),
      }]
    })
    return {
      id: snapshot.id, scope, parentScopeId: snapshot.parentScopeId, ...(period && { period }),
      currentlyEffective: scope === 'natal' || inPeriod,
      occurrences,
      roles,
      effects: snapshot.luckEffectStates.map(state => ({
        id: state.event.id, effectType: state.event.effectType, subjectId: state.event.subjectId,
        sourceEntityId: state.event.sourceLuckEntityId, originScope: SCOPE[state.originScope], originScopeId: state.originScopeId,
        originPeriod: periodOf(state.originPeriod), currentlyEffective: state.currentlyEffective,
        expired: state.expired, sourceIds: [...state.event.evidenceRefs],
      })),
    }
  })
}
