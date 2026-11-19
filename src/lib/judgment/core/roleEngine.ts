import { calculateTenGod } from '../../dayRelationships'
import { STEM_COMBINATIONS } from '../producers/relationCatalog'
import { recordId } from '../producers/shared'
import { isGod } from './patternPolicyRegistry'
import type { CombinationHistory } from './combineHistory'
import type { ScopedPath } from './luckEffects'
import type { policyRoleCandidates } from './patternRoles'
import type { specialPatternSelection } from './peerPatterns'
import type {
  FinalPatternContext, LuckEffect, RoleCurrentState, RoleHistory, Scope, StemParticipant, StemRelationFact, StemRuntime,
} from './types'

type PolicyRoles = ReturnType<typeof policyRoleCandidates>
type ConditionalPath = { sourceEntityId: string; supportingRelationFactId: string; currentState: 'conditional' | 'active'; triggerRelationFactId: string | null }
type RoleKind = 'YongShen' | 'SangShen' | 'Byeong' | 'ConditionalByeong' | 'GuEung'
type History = {
  roleId: string
  role: RoleKind
  entityId: string
  pathRefs: readonly string[]
  targetByeongId?: string
  protectedFunction?: { entityId: string; kind: 'officer' }
  conditionalThreat?: { attackerStem: string; action: 'control'; targetEntityId: string }
}
type Current = {
  roleId: string
  currentState: 'active' | 'weakened' | 'stopped' | 'inactive' | 'conditional' | 'protective_standby' | 'deferred'
  currentFunction: RoleCurrentState['currentFunction'] | 'favorable'
  pathRefs: readonly string[]
}
export type RoleEngineState = {
  roleHistory: readonly History[]
  currentRoles: readonly Current[]
  byeongStatus: 'confirmed' | 'conditional' | 'none' | 'deferred'
  guEungStatus: 'confirmed' | 'none' | 'not_applicable' | 'deferred'
  luckEffects: readonly LuckEffect[]
}

const stemValues = STEM_COMBINATIONS.flatMap((pair) => Array.from(pair))
const controls = (source: string, target: string) => isGod(calculateTenGod(source, target), 'wealth')

export function evaluateRoleEngine(input: {
  scope: Scope
  stems: readonly StemParticipant[]
  luck: StemParticipant | undefined
  pattern: FinalPatternContext
  special: ReturnType<typeof specialPatternSelection>
  runtime: ReadonlyMap<string, StemRuntime>
  rootStates: readonly { entityId: string; state: string; factIds: readonly string[] }[]
  paths: readonly ScopedPath[]
  effectiveCombinations: readonly CombinationHistory[]
  natalFacts: readonly StemRelationFact[]
  policyRoles: PolicyRoles
  existingRoles: readonly RoleHistory[]
  existingCurrent: readonly RoleCurrentState[]
  conditionalByeong: readonly ConditionalPath[]
  prior: RoleEngineState | null
}): RoleEngineState {
  const { scope, stems, luck, pattern, special, runtime, rootStates, paths, policyRoles, existingRoles,
    existingCurrent, conditionalByeong, prior, effectiveCombinations, natalFacts } = input
  const history = new Map(prior?.roleHistory.map((role) => [role.roleId, role]))
  const currentRoles: Current[] = []
  const add = (role: RoleKind, entityId: string, pathRefs: readonly string[], key = entityId,
    extra?: Pick<History, 'targetByeongId' | 'conditionalThreat' | 'protectedFunction'>) => {
    const roleId = recordId('structural-role', [role, entityId, key])
    if (scope === 'natal' && !history.has(roleId)) history.set(roleId, { roleId, role, entityId, pathRefs, ...extra })
    return roleId
  }
  const current = (roleId: string, entityId: string, fn: Current['currentFunction'], pathRefs: readonly string[],
    state?: Current['currentState'], continuingCombination = false) => {
    if (!history.has(roleId)) return
    const stem = runtime.get(entityId)
    currentRoles.push({ roleId,
      currentState: stem === 'stopped' ? 'stopped' : state ?? stem ?? 'deferred',
      currentFunction: stem === 'stopped' && !continuingCombination ? 'inactive' : fn,
      pathRefs })
  }

  const allowedMain = (id: string) => !special || special.mainCandidates.some((stem) => stem.id === id)
  const legacySangShen = new Set<string>()
  for (const assignment of existingRoles) {
    const kind = assignment.role === '용신' ? 'YongShen' : assignment.role === '상신' ? 'SangShen'
      : assignment.role === '병' ? 'Byeong' : null
    if (!kind || !assignment.entityId || assignment.status !== 'evaluated' || assignment.provisional) continue
    if (kind === 'YongShen' && !allowedMain(assignment.entityId)) continue
    const snapshot = existingCurrent.find((item) => item.roleHistoryRef === assignment.roleStateId)
    const id = add(kind, assignment.entityId, assignment.evidenceIds, assignment.roleStateId)
    if (kind === 'SangShen') legacySangShen.add(id)
    current(id, assignment.entityId, snapshot?.currentFunction ?? 'deferred', snapshot?.functionRefs ?? [])
  }
  for (const { entityId } of pattern.effectiveManifestedYongShen.filter(({ entityId }) => allowedMain(entityId))) {
    const id = add('YongShen', entityId, [pattern.id])
    current(id, entityId, runtime.get(entityId) === 'weakened' ? 'reduced' : 'operating', [pattern.id])
  }
  if (special) {
    const supportive = paths.filter(({ actual }) => ['PEER-01', 'PEER-03', 'ROB-01', 'ROB-02', 'ROB-04', 'ROB-05',
      'BLADE-01', 'BLADE-02', 'BLADE-03'].includes(actual.policyId ?? '')
      && ['operating', 'reduced'].includes(actual.function))
    for (const stem of special.mainCandidates) {
      const basis = supportive.find(({ fact }) => fact.source.id === stem.id || fact.target.id === stem.id)
      if (!basis) continue
      const id = add('YongShen', stem.id, [basis.fact.id])
      if (!currentRoles.some(({ roleId }) => roleId === id)) current(id, stem.id, basis.actual.function, [basis.fact.id])
    }
  }
  for (const helper of policyRoles.sangShen) {
    const basis = paths.find(({ fact }) => fact.id === helper.supportingPath[0])
    if (!basis) continue
    const id = add('SangShen', helper.entityId, helper.supportingPath, JSON.stringify([basis.fact.source.id, basis.fact.target.id, basis.fact.action]))
    current(id, helper.entityId, helper.currentFunction, helper.supportingPath,
      helper.currentFunction === 'reduced' ? 'weakened' : 'active')
  }

  const standby = [...history.values()].filter(({ conditionalThreat }) => conditionalThreat)
  if (scope === 'natal' && pattern.branchPattern === '正官') {
    for (const officer of pattern.effectiveManifestedYongShen.filter(({ tenGod }) => tenGod === '正官')) {
      const protectedStem = stems.find(({ id }) => id === officer.entityId)
      if (!protectedStem || !rootStates.some(({ entityId, state }) => entityId === officer.entityId && ['present', 'strengthened'].includes(state))) continue
      const day = stems.find(({ dayMaster }) => dayMaster)
      const attacker = day && stemValues.find((stem) => calculateTenGod(day.stem, stem) === '傷官' && controls(stem, protectedStem.stem))
      if (!attacker || stems.some((stem) => stem.stem === attacker && runtime.get(stem.id) !== 'stopped')) continue
      for (const guard of stems.filter(({ tenGod, scope, id, stem }) => scope === 'natal' && isGod(tenGod, 'resource')
        && runtime.get(id) === 'active' && controls(stem, attacker))) {
        const root = rootStates.find(({ entityId, state }) => entityId === guard.id && ['present', 'strengthened'].includes(state))
        if (!root) continue
        const id = add('SangShen', guard.id, [officer.entityId, ...root.factIds], 'protective:' + officer.entityId,
          { protectedFunction: { entityId: officer.entityId, kind: 'officer' },
            conditionalThreat: { attackerStem: attacker, action: 'control', targetEntityId: officer.entityId } })
        current(id, guard.id, 'inactive', [officer.entityId, ...root.factIds], 'protective_standby')
      }
    }
  }
  const luckEffects: LuckEffect[] = []
  for (const record of standby) {
    const active = paths.find(({ fact, actual }) => fact.source.id === record.entityId && actual.policyId === 'OFF-02'
      && ['operating', 'reduced'].includes(actual.function) && paths.some(({ fact: threat }) =>
        threat.source.id === fact.target.id && threat.target.id === record.protectedFunction?.entityId
        && actual.conditionEvidence?.includes(threat.id)))
    const root = rootStates.find(({ entityId, state }) => entityId === record.entityId && ['present', 'strengthened'].includes(state))
    const references = active ? [active.fact.id, ...(active.actual.conditionEvidence ?? [])] : record.pathRefs
    const state = active && root ? active.actual.function === 'reduced' ? 'weakened' : 'active' : root ? 'protective_standby' : 'deferred'
    current(record.roleId, record.entityId, active && root ? active.actual.function : 'inactive', references, state)
  }
  for (const damage of policyRoles.byeong) {
    const id = add('Byeong', damage.sourceEntityId, damage.relationFactIds, damage.id)
    current(id, damage.sourceEntityId, damage.currentState === 'active' ? 'operating'
      : damage.currentState === 'weakened' ? 'reduced' : 'inactive', damage.relationFactIds, damage.currentState)
  }
  for (const item of conditionalByeong) {
    const id = add('ConditionalByeong', item.sourceEntityId, [item.supportingRelationFactId], item.supportingRelationFactId)
    const basis = natalFacts.find(({ id }) => id === item.supportingRelationFactId)
    const supportOperating = basis && paths.some(({ fact, actual }) => fact.source.id === basis.source.id
      && fact.target.id === basis.target.id && fact.action === basis.action && ['operating', 'reduced'].includes(actual.function))
    current(id, item.sourceEntityId, item.currentState === 'active' ? 'operating' : supportOperating ? 'favorable' : 'inactive',
      item.triggerRelationFactId ? [item.supportingRelationFactId, item.triggerRelationFactId] : [item.supportingRelationFactId], item.currentState)
  }
  for (const remedy of policyRoles.guEung.filter(({ targetByeongId }) => policyRoles.byeong.some(({ id }) => id === targetByeongId))) {
    const id = add('GuEung', remedy.entityId, remedy.supportingPath, remedy.targetByeongId, { targetByeongId: remedy.targetByeongId })
    const intact = policyRoles.byeong.some(({ id, currentState }) => id === remedy.targetByeongId && currentState === 'inactive')
    const continuingCombination = effectiveCombinations.some(({ relation }) =>
      remedy.supportingPath.includes(relation.id))
    current(id, remedy.entityId, intact ? 'operating' : 'deferred', remedy.supportingPath, intact ? 'active' : 'deferred', continuingCombination)
  }
  for (const role of history.values()) if (!currentRoles.some(({ roleId }) => roleId === role.roleId)) {
    const blocked = role.role === 'SangShen' && paths.find(({ fact, actual }) => actual.function === 'inactive'
      && recordId('structural-role', ['SangShen', role.entityId,
        JSON.stringify([fact.source.id, fact.target.id, fact.action])]) === role.roleId)
    current(role.roleId, role.entityId, blocked ? 'inactive' : 'deferred',
      blocked ? [blocked.fact.id, ...(blocked.actual.resolutionEvidence ?? [])] : role.pathRefs,
      blocked ? 'inactive' : 'deferred')
  }
  if (scope !== 'natal' && luck && prior) for (const next of currentRoles) {
    const role = history.get(next.roleId)
    if (role?.role !== 'SangShen' || legacySangShen.has(next.roleId)) continue
    const previous = prior.currentRoles.find(({ roleId }) => roleId === next.roleId)
    if (!previous) continue
    const activated = previous.currentState === 'protective_standby' && next.currentState === 'active'
      && next.currentFunction === 'operating'
    const stoppedOrInactive = next.currentState === 'stopped' || next.currentState === 'inactive'
      || next.currentFunction === 'inactive' && next.currentState !== 'protective_standby'
    const weakened = previous.currentState === 'active' && (next.currentState === 'weakened' || stoppedOrInactive)
      || previous.currentState === 'protective_standby' && stoppedOrInactive
    if (activated || weakened) {
      const stops = effectiveCombinations.filter(({ originScope, participants }) => originScope === scope
        && participants.includes(role.entityId)).map(({ relation }) => relation.id)
      luckEffects.push({ effectType: activated ? 'activates_sangshen_function' : 'weakens_sangshen',
        scope, sourceLuckEntityId: luck.id, subjectId: next.roleId,
        evidenceRefs: [...new Set([...previous.pathRefs, ...next.pathRefs, ...stops])] })
    }
  }
  const activeDamage = policyRoles.byeong.filter(({ currentState }) => currentState !== 'inactive')
  const confirmed = currentRoles.some(({ roleId, currentFunction }) => history.get(roleId)?.role === 'Byeong'
    && existingRoles.some(({ roleStateId, role, entityId }) => role === '병' && entityId && roleId === recordId('structural-role', ['Byeong', entityId, roleStateId]))
    && (currentFunction === 'operating' || currentFunction === 'reduced')) || conditionalByeong.some(({ currentState }) => currentState === 'active') || activeDamage.some((damage) =>
    paths.some(({ fact, actual }) => damage.relationFactIds.includes(fact.id) && actual.byeongCandidate && actual.direction === 'unfavorable'))
  const byeongStatus = confirmed ? 'confirmed' : activeDamage.length || !runtime.size ? 'deferred'
    : conditionalByeong.length ? 'conditional' : 'none'
  const guEungStatus = currentRoles.some(({ roleId, currentFunction }) => history.get(roleId)?.role === 'GuEung'
    && currentFunction === 'operating') ? 'confirmed' : byeongStatus === 'deferred' ? 'deferred' : byeongStatus === 'confirmed' || policyRoles.byeong.length ? 'none' : 'not_applicable'
  return { roleHistory: [...history.values()], currentRoles, byeongStatus, guEungStatus, luckEffects }
}
