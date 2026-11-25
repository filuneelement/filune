import { calculateTenGod } from '../../dayRelationships'
import { STEM_COMBINATIONS } from '../producers/relationCatalog'
import { recordId } from '../producers/shared'
import { isGod } from './patternPolicyRegistry'
import type { CombinationHistory } from './combineHistory'
import type { ScopedPath } from './luckEffects'
import type { ActualStructuralFunction } from './policies'
import { functionDamageEstablished } from './policies'
import type { evaluateBranchDamage } from './branches'
import type { PolicyFact } from './patternPolicyRegistry'
import type { StemFunctionEffect } from './structuralEffect'
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
  strengthened?: true
  pathRefs: readonly string[]
  functionEffects?: readonly StemFunctionEffect[]
}
type DamagePath = {
  sourceEntityId: string
  targetEntityId: string
  damagedFunction: string
  action: string
  state: 'active' | 'weakened' | 'relieved' | 'conditional'
  relationRefs: readonly string[]
}
export type RoleEngineState = {
  roleHistory: readonly History[]
  currentRoles: readonly Current[]
  byeongStatus: 'confirmed' | 'conditional' | 'none' | 'deferred'
  guEungStatus: 'confirmed' | 'none' | 'not_applicable' | 'deferred'
  damagePaths: readonly DamagePath[]
  relievedYongShenStops: readonly { entityId: string; relationId: string }[]
  resolutionPaths: readonly { remedyEntityId: string; targetByeongId: string; relationRefs: readonly string[] }[]
  incompleteDamageChecks: readonly string[]
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
  capacity?: { state: string; evidenceIds: readonly string[] } | null
  completeNatal?: boolean
  stemFunctionEffects?: readonly StemFunctionEffect[]
  paths: readonly ScopedPath[]
  coexistence?: readonly { fact: PolicyFact; actual: ActualStructuralFunction }[]
  rootDamage?: readonly { sourceEntityId: string; targetEntityId: string; relationRefs: readonly string[] }[]
  branchDamage?: ReturnType<typeof evaluateBranchDamage>
  requiredControllerIds?: ReadonlySet<string>
  effectiveCombinations: readonly CombinationHistory[]
  natalFacts: readonly StemRelationFact[]
  policyRoles: PolicyRoles
  existingRoles: readonly RoleHistory[]
  existingCurrent: readonly RoleCurrentState[]
  conditionalByeong: readonly ConditionalPath[]
  prior: RoleEngineState | null
}): RoleEngineState {
  const { scope, stems, luck, pattern, special, runtime, rootStates, paths, policyRoles, existingRoles,
    existingCurrent, conditionalByeong, prior, effectiveCombinations, natalFacts, stemFunctionEffects = [] } = input
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
    const rootWeakened = rootStates.some((item) => item.entityId === entityId && item.state === 'weakened')
    const kind = history.get(roleId)?.role
    const functionEffects = (kind === 'YongShen' || kind === 'SangShen') && stem !== 'stopped'
      && (fn === 'operating' || fn === 'reduced') ? stemFunctionEffects.filter((effect) => effect.targetEntityId === entityId) : []
    const reduced = (rootWeakened || functionEffects.some((effect) => effect.reducesFunction
      && (effect.kind === 'drain' || paths.some(({ fact, actual }) =>
        fact.id === effect.relationFactId && functionDamageEstablished(actual)))))
      && (fn === 'operating' || fn === 'reduced')
    currentRoles.push({ roleId,
      currentState: stem === 'stopped' ? 'stopped' : reduced && state !== 'stopped' ? 'weakened' : state ?? stem ?? 'deferred',
      currentFunction: stem === 'stopped' && !continuingCombination ? 'inactive' : reduced ? 'reduced' : fn,
      ...(functionEffects.some(({ kind }) => kind === 'strengthen') ? { strengthened: true as const } : {}),
      pathRefs, ...(functionEffects.length ? { functionEffects } : {}) })
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
  const protectedRoles = [...history.values()].filter(({ role, conditionalThreat }) =>
    role === 'YongShen' || role === 'SangShen' && !conditionalThreat)
  const damagePaths: DamagePath[] = policyRoles.byeong.map((damage) => ({
    sourceEntityId: damage.sourceEntityId, targetEntityId: damage.targetEntityId, damagedFunction: damage.damagedFunction,
    action: damage.action, relationRefs: damage.relationFactIds,
    state: damage.currentState === 'inactive' ? 'relieved' : damage.currentState,
  }))
  damagePaths.push(...(input.branchDamage?.paths ?? []))
  for (const path of input.rootDamage ?? []) {
    if (protectedRoles.some(({ entityId }) => entityId === path.targetEntityId)) {
      damagePaths.push({ ...path, damagedFunction: 'root_support', action: 'clash', state: 'weakened' })
    }
  }
  const inspectedStops = new Set<string>()
  const unresolvedStoppedControllers = new Set<string>()
  const relievedYongShenStops: { entityId: string; relationId: string }[] = []
  for (const role of protectedRoles) {
    for (const stop of effectiveCombinations.filter(({ participants, effect }) =>
      effect === 'stopped' && participants.includes(role.entityId))) {
      const key = recordId('stopped-function-review', [role.entityId, stop.relation.id])
      if (inspectedStops.has(key)) continue
      inspectedStops.add(key)
      const actor = stems.find(({ id }) => id === role.entityId)
      const requiredOutput = input.requiredControllerIds?.has(role.entityId)
        || protectedRoles.some(helper => helper.entityId === role.entityId && helper.role === 'SangShen')
      // A-8-1 I-04a / C-10-1: stopping an adverse exposed function can
      // relieve the stem axis while the independent branch damage persists.
      if (pattern.branchPattern === '食神' && role.role === 'YongShen' && actor?.tenGod === '傷官' && !requiredOutput) {
        relievedYongShenStops.push({ entityId: role.entityId, relationId: stop.relation.id })
        continue
      }
      // SG-067/069/080/101: stopping Killing may relieve pressure. A loss needs
      // separate evidence that this specific controller was necessary.
      if (actor?.tenGod === '偏官' && !input.requiredControllerIds?.has(role.entityId)) {
        unresolvedStoppedControllers.add(key)
        continue
      }
      const sourceEntityId = stop.participants.find((entityId) => entityId !== role.entityId)
      if (sourceEntityId) damagePaths.push({ sourceEntityId, targetEntityId: role.entityId, damagedFunction: role.role,
        action: 'combine', state: 'active', relationRefs: [stop.relation.id] })
    }
  }
  for (const { fact, actual } of input.coexistence ?? []) {
    if (!['OFF-05', 'KILL-06'].includes(actual.policyId ?? '') || !actual.conditionEvidence?.length
      || actual.function !== 'operating') continue
    const core = pattern.branchPattern === '正官' ? fact.source : fact.target
    const extra = core === fact.source ? fact.target : fact.source
    damagePaths.push({ sourceEntityId: extra.id, targetEntityId: core.id, damagedFunction: 'officer_killing_distinction',
      action: 'coexist', state: 'active', relationRefs: [fact.id, ...actual.conditionEvidence] })
  }
  for (const candidate of conditionalByeong) {
    const trigger = paths.find(({ fact }) => fact.id === candidate.triggerRelationFactId)
    const basis = natalFacts.find(({ id }) => id === candidate.supportingRelationFactId)
    if (!basis) continue
    damagePaths.push({ sourceEntityId: candidate.sourceEntityId, targetEntityId: trigger?.fact.target.id ?? basis.target.id,
      action: trigger ? 'generate' : 'future_killing', damagedFunction: 'killing_control',
      state: trigger ? trigger.actual.function === 'reduced' ? 'weakened' : 'active' : 'conditional',
      relationRefs: [basis.id, ...(trigger ? [trigger.fact.id] : [])] })
  }
  if (input.capacity?.state === 'killing_capacity_insufficient') {
    const attack = paths.find(({ fact, actual }) => fact.target.dayMaster && fact.source.tenGod === '偏官'
      && fact.action === 'control' && actual.structuralEffect?.currentlyEffective
      && input.capacity?.evidenceIds.includes(fact.id))
    if (attack) damagePaths.push({ sourceEntityId: attack.fact.source.id, targetEntityId: attack.fact.target.id,
      damagedFunction: 'day_master_capacity', action: 'control', state: 'active', relationRefs: [attack.fact.id] })
  }
  const incompleteDamageChecks = [
    ...(input.branchDamage?.incomplete ?? []),
    ...(unresolvedStoppedControllers.size ? ['STOPPED_KILLING_FUNCTION_UNRESOLVED'] : []),
    ...(!input.completeNatal || !runtime.size || !pattern.branchPattern ? ['STRUCTURE_COVERAGE_INCOMPLETE'] : []),
    ...(paths.some(({ fact, actual }) => fact.action === 'control' && actual.direction === 'deferred'
      && actual.structuralEffect?.currentlyEffective && protectedRoles.some(({ entityId }) => entityId === fact.target.id))
      ? ['ROLE_ATTACK_UNRESOLVED'] : []),
    ...(paths.some(({ fact, actual }) => actual.direction === 'deferred' && actual.structuralEffect?.currentlyEffective
      && fact.action === 'generate' && fact.target.tenGod === '偏官') ? ['WEALTH_OR_KILLING_FLOW_UNRESOLVED'] : []),
    ...(paths.some(({ fact, actual }) => fact.action === 'control' && actual.direction === 'deferred'
      && actual.structuralEffect?.currentlyEffective && fact.source.tenGod === '偏印' && fact.target.tenGod === '食神')
      ? ['RESOURCE_OUTPUT_DAMAGE_UNRESOLVED'] : []),
    ...(paths.some(({ fact, actual }) => fact.action === 'control' && actual.structuralEffect?.currentlyEffective
      && actual.direction === 'deferred' && isGod(fact.source.tenGod, 'peer') && isGod(fact.target.tenGod, 'wealth')
      && protectedRoles.some(({ entityId }) => entityId === fact.target.id)) ? ['PEER_WEALTH_DAMAGE_UNRESOLVED'] : []),
    ...(paths.some(({ fact, actual }) => fact.action === 'control' && actual.structuralEffect?.currentlyEffective
      && actual.direction === 'deferred' && paths.some(({ fact: control, actual: use }) =>
        control.source.id === fact.target.id && ['OFF-02', 'KILL-01', 'BLADE-01', 'BLADE-02'].includes(use.policyId ?? '')
        && use.structuralEffect?.currentlyEffective)) ? ['REQUIRED_CONTROLLER_DAMAGE_UNRESOLVED'] : []),
    ...((input.coexistence ?? []).some(({ actual }) => actual.function === 'operating' && actual.direction === 'deferred'
      && actual.runtimeEvidence.some(({ entityId }) => protectedRoles.some((role) => role.entityId === entityId)))
      && ['正官', '偏官'].includes(pattern.branchPattern ?? '') ? ['OFFICER_KILLING_MIXING_UNRESOLVED'] : []),
    ...(pattern.yongShenRelations.some(({ relationQuality }) => relationQuality === 'deferred') ? ['MULTI_PATTERN_CONFLICT_UNRESOLVED'] : []),
    ...(!input.capacity && paths.some(({ fact, actual }) => actual.structuralEffect?.currentlyEffective
      && (fact.target.dayMaster && fact.action === 'control' || fact.source.dayMaster && fact.action === 'generate'))
      ? ['CAPACITY_UNRESOLVED'] : []),
  ]
  const activeDamage = policyRoles.byeong.filter(({ currentState }) => currentState !== 'inactive')
  const confirmed = currentRoles.some(({ roleId, currentFunction }) => history.get(roleId)?.role === 'Byeong'
    && existingRoles.some(({ roleStateId, role, entityId }) => role === '병' && entityId && roleId === recordId('structural-role', ['Byeong', entityId, roleStateId]))
    && (currentFunction === 'operating' || currentFunction === 'reduced')) || conditionalByeong.some(({ currentState }) => currentState === 'active') || activeDamage.some((damage) =>
    paths.some(({ fact, actual }) => damage.relationFactIds.includes(fact.id) && functionDamageEstablished(actual)))
    || damagePaths.some(({ action, state, damagedFunction }) =>
      state === 'active' && (action === 'combine' || action === 'coexist' || damagedFunction === 'day_master_capacity'))
    || damagePaths.some(({ state, action }) => state === 'weakened' && action === 'clash')
    || Boolean(input.branchDamage?.paths.length)
  const byeongStatus = confirmed ? 'confirmed' : activeDamage.length || incompleteDamageChecks.length ? 'deferred'
    : conditionalByeong.length ? 'conditional' : 'none'
  const resolutionPaths = policyRoles.guEung.flatMap((remedy) => {
    const damage = policyRoles.byeong.find(({ id }) => id === remedy.targetByeongId)
    const relationRef = remedy.supportingPath[0]
    const effective = effectiveCombinations.some(({ relation }) => relation.id === relationRef)
      || paths.some(({ fact, actual }) => fact.id === relationRef && actual.structuralEffect?.currentlyEffective)
    return damage?.currentState === 'inactive' && effective
      ? [{ remedyEntityId: remedy.entityId, targetByeongId: remedy.targetByeongId, relationRefs: remedy.supportingPath }] : []
  })
  for (const path of input.branchDamage?.paths ?? []) {
    if (path.protection) resolutionPaths.push({ remedyEntityId: path.protection.entityId,
      targetByeongId: path.relationRefs[0], relationRefs: path.protection.relationRefs })
  }
  for (const { fact, actual } of paths) {
    if (actual.policyId !== 'killing-pressure-after-protection') continue
    const effect = actual.structuralEffect
    const guard = effect?.blockedBy?.kind === 'active_protection' ? effect.blockedBy : effect?.mitigatedBy
    if (guard) resolutionPaths.push({ remedyEntityId: guard.protectorId,
      targetByeongId: recordId('policy-byeong', [actual.policyId, fact.source.id, fact.target.id]),
      relationRefs: [...guard.evidenceRefs, fact.id] })
  }
  const guEungStatus = currentRoles.some(({ roleId, currentFunction }) => history.get(roleId)?.role === 'GuEung'
    && currentFunction === 'operating') || resolutionPaths.length ? 'confirmed'
    : byeongStatus === 'deferred' ? 'deferred' : byeongStatus === 'confirmed' || policyRoles.byeong.length ? 'none' : 'not_applicable'
  return { roleHistory: [...history.values()], currentRoles, byeongStatus, guEungStatus, damagePaths, relievedYongShenStops,
    resolutionPaths, incompleteDamageChecks, luckEffects }
}
