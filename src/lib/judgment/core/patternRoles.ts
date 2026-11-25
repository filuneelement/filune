import { recordId } from '../producers/shared'
import type { ScopedPath } from './luckEffects'
import type { PatternPolicyEvidence } from './patternPolicyEvidence'
import type { CombinationHistory } from './combineHistory'
import type { LuckEffect, Scope, StemParticipant } from './types'

function live(path: ScopedPath) {
  return path.actual.function === 'operating' || path.actual.function === 'reduced'
}
export type PolicyByeongPath = {
  id: string
  sourceEntityId: string
  targetEntityId: string
  action: 'control' | 'generate' | 'combine'
  relationFactIds: readonly string[]
  policyId: string
  status: 'candidate'
  evidenceRefs: readonly string[]
  damagedFunction: 'officer' | 'day_master' | 'officer_protection' | 'killing_control' | 'wealth'
    | 'resource' | 'output' | 'output_capacity' | 'necessary_killing'
  structuralConsequence: 'damage_candidate'
  currentState: 'active' | 'weakened' | 'inactive'
  originScope: Scope
}
const damageFunctions = {
  'OFF-03': 'officer', 'OFF-04': 'officer_protection', 'KILL-04-required-food': 'killing_control',
  'wealth-controls-resource-in-resource': 'resource', 'RES-06': 'resource', 'RES-08': 'output', 'RES-09': 'resource',
  'FOOD-03': 'killing_control', 'FOOD-05': 'output', 'FOOD-08': 'output_capacity',
  'HO-03': 'officer', 'HO-05-needed': 'necessary_killing', 'HO-06': 'resource',
  'HO-supported-wealth-pressure': 'wealth',
  'PEER-05': 'day_master', 'ROB-05-harmful': 'day_master', 'PEER-06': 'wealth', 'ROB-03': 'wealth',
  'BLADE-04': 'necessary_killing', 'BLADE-05': 'necessary_killing', 'BLADE-06': 'necessary_killing',
  'KILL-05': 'day_master', 'WEALTH-05': 'wealth', 'WEALTH-06': 'day_master',
  'killing-pressure-after-protection': 'day_master',
} as const
export function officerProtectionPath(attack: ScopedPath, paths: readonly ScopedPath[]) {
  return paths.find((guard) =>
    guard.actual.policyId === 'OFF-02' && guard.fact.target.id === attack.fact.source.id
    && guard.actual.conditionEvidence?.includes(attack.fact.id) && guard.actual.function === 'operating'
    && !paths.some((damage) => damage.actual.policyId === 'OFF-04' && damage.fact.target.id === guard.fact.source.id && live(damage)))
}

export function foodProtectionPath(attack: ScopedPath, paths: readonly ScopedPath[]) {
  return paths.find((guard) => guard.actual.policyId === 'food-god-wealth-protects-output'
    && guard.fact.target.id === attack.fact.source.id && guard.actual.conditionEvidence?.includes(attack.fact.id)
    && guard.actual.function === 'operating' && guard.actual.rootEvidence.some(({ entityId, state }) =>
      entityId === guard.fact.source.id && (state === 'present' || state === 'strengthened')))
}

const supportPolicies = ['OFF-02', 'KILL-01', 'KILL-03', 'WEALTH-01', 'WEALTH-07', 'WEALTH-08',
  'RES-02', 'RES-03', 'resource-excess-uses-wealth', 'FOOD-01', 'FOOD-02', 'FOOD-04', 'food-god-wealth-protects-output',
  'HO-01', 'HO-02', 'HO-04', 'PEER-01', 'PEER-03', 'ROB-01', 'ROB-02', 'ROB-04', 'BLADE-01', 'BLADE-02', 'BLADE-03']

export function policyRoleCandidates(scope: Scope, paths: readonly ScopedPath[], previousByeong: readonly PolicyByeongPath[],
  effectiveCombinations: readonly CombinationHistory[], luck: StemParticipant | undefined, evidence: readonly PatternPolicyEvidence[] = []) {
  const sangShen = paths.flatMap(({ fact, actual }) => {
    const policyId = actual.policyId
    if (!policyId || !supportPolicies.includes(policyId) || !live({ fact, actual })) return []
    const participants = policyId === 'RES-03' ? [fact.source, fact.target]
      : [policyId === 'KILL-03' ? fact.target : fact.source]
    return participants.filter((stem) => stem.scope === 'natal' && actual.rootEvidence.some(({ entityId, state }) =>
      entityId === stem.id && (state === 'present' || state === 'strengthened')))
      .map(({ id }) => ({ entityId: id, status: 'candidate' as const, policyId,
        currentFunction: actual.function, supportingPath: [fact.id, ...(actual.conditionEvidence ?? [])] }))
  })

  const byeong = new Map(previousByeong.map((item) => [item.id, item]))
  const guEung: { entityId: string; targetByeongId: string; supportingPath: readonly string[]; status: 'candidate' }[] = []
  const luckEffects: LuckEffect[] = []
  const combineRelief = (targetEntityId: string) => effectiveCombinations.find(({ participants, effect, relation }) =>
    effect === 'stopped' && participants.includes(targetEntityId)
    && paths.some((path) => path.fact.action === 'combine' && path.fact.source.id === relation.source.id
      && path.fact.target.id === relation.target.id && path.actual.policyId === 'WEALTH-09' && live(path)))
  for (const path of paths) {
    const { fact, actual } = path
    const policyId = actual.policyId
    const damagedFunction = policyId && damageFunctions[policyId as keyof typeof damageFunctions]
    if (!policyId || !damagedFunction) continue
    const id = recordId('policy-byeong', [policyId, fact.source.id, fact.target.id])
    const prior = byeong.get(id)
    const relief = damagedFunction === 'day_master' && combineRelief(fact.target.id)
    const protection = policyId === 'OFF-03' && officerProtectionPath(path, paths)
    const foodProtection = policyId === 'FOOD-05' ? foodProtectionPath(path, paths) : undefined
    const sourceStop = (prior || ['RES-06', 'RES-08', 'RES-09', 'wealth-controls-resource-in-resource'].includes(policyId))
      ? effectiveCombinations.find(({ effect, participants }) => effect === 'stopped' && participants.includes(fact.source.id))
      : undefined
    const natalResolver = scope === 'natal'
      ? relief && relief.originScope === 'natal' ? relief.relation
        : foodProtection?.fact.source.scope === 'natal' ? foodProtection.fact
          : sourceStop?.originScope === 'natal' ? sourceStop.relation : undefined
      : undefined
    if (!prior && !natalResolver && (!actual.byeongCandidate || !live(path))) continue
    const bladeRestorer = ['BLADE-04', 'BLADE-05', 'BLADE-06'].includes(policyId) ? paths.find((replacement) =>
      replacement.actual.policyId === 'BLADE-02' && replacement.actual.function === 'operating'
      && replacement.actual.rootEvidence.some(({ entityId, state }) => entityId === replacement.fact.source.id
        && ['present', 'strengthened'].includes(state))
      && evidence.some((item) => item.condition === 'restores_blade_control' && item.entityId === replacement.fact.source.id
        && item.relatedEntityId === fact.target.id && item.evidenceIds.length)) : undefined
    const currentState = bladeRestorer || sourceStop || relief || protection || foodProtection || !live(path)
      || ['PEER-06', 'ROB-03'].includes(policyId) && !actual.byeongCandidate ? 'inactive'
        : actual.function === 'reduced' || policyId === 'HO-supported-wealth-pressure' ? 'weakened' : 'active'
    if (!prior && protection) continue
    const supportingRelations = paths.map(({ fact }) => fact.id)
    const evidenceRefs = [...new Set([fact.id, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? []),
      ...(relief ? [relief.relation.id] : []), ...(foodProtection ? [foodProtection.fact.id] : []),
      ...(sourceStop ? [sourceStop.relation.id] : []), ...(bladeRestorer ? [bladeRestorer.fact.id] : [])])]
    const relationFactIds = evidenceRefs.filter((ref) => supportingRelations.includes(ref) || ref === (relief && relief.relation.id) || ref === sourceStop?.relation.id)
    byeong.set(id, { id, policyId, sourceEntityId: fact.source.id, targetEntityId: fact.target.id, action: fact.action,
      relationFactIds, evidenceRefs, status: 'candidate', damagedFunction, structuralConsequence: 'damage_candidate', currentState, originScope: prior?.originScope ?? scope })
    const resolver = natalResolver ?? (prior ? (protection ? protection.fact : undefined) ?? foodProtection?.fact ?? (relief ? relief.relation : undefined)
      ?? sourceStop?.relation ?? bladeRestorer?.fact : undefined)
    if (resolver) {
      guEung.push({ status: 'candidate', entityId: resolver.source.id === fact.source.id ? resolver.target.id : resolver.source.id, targetByeongId: id,
        supportingPath: [...new Set([resolver.id, ...relationFactIds])] })
    }
    if (scope === 'natal' && bladeRestorer?.fact.source.scope === 'natal') {
      guEung.push({ status: 'candidate', entityId: bladeRestorer.fact.source.id, targetByeongId: id, supportingPath: relationFactIds })
    }
    if (scope !== 'natal' && luck && !prior && currentState !== 'inactive'
      && ['BLADE-04', 'BLADE-05', 'BLADE-06'].includes(policyId)
      && [fact.source.id, fact.target.id].includes(luck.id)) {
      luckEffects.push({ effectType: 'attacks_yongshen', scope, sourceLuckEntityId: luck.id, subjectId: fact.target.id, evidenceRefs })
    }
    if (scope !== 'natal' && luck && !prior && currentState !== 'inactive' && actual.resolutionEvidence?.length
      && actual.structuralEffect?.currentlyEffective) {
      luckEffects.push({ effectType: 'activates_byeong', scope, sourceLuckEntityId: luck.id, subjectId: id, evidenceRefs })
    }
    if (scope !== 'natal' && luck && prior && prior.currentState !== currentState) {
      const effectType = currentState === 'inactive' ? 'relieves_byeong'
        : currentState === 'weakened' ? 'weakens_byeong' : 'strengthens_byeong'
      luckEffects.push({ effectType, scope, sourceLuckEntityId: luck.id, subjectId: id, evidenceRefs: relationFactIds })
    }
  }
  // A verified harmful killing can be addressed by a specific HO control/combine policy.
  for (const resolution of paths.filter(({ actual }) => ['HO-04', 'HO-05-harmful'].includes(actual.policyId ?? '') && ['operating', 'reduced'].includes(actual.function))) {
    const attack = paths.find(({ fact }) => fact.source.id === resolution.fact.target.id
      && fact.target.dayMaster && fact.action === 'control' && resolution.actual.conditionEvidence?.includes(fact.id))
    if (!attack) continue
    const id = recordId('policy-byeong', ['HO-harmful-killing', attack.fact.source.id, attack.fact.target.id])
    const prior = byeong.get(id)
    const stop = effectiveCombinations.find(({ participants, effect }) => effect === 'stopped'
      && participants.includes(attack.fact.source.id) && participants.includes(resolution.fact.source.id))
    if (!live(attack) && !stop) continue
    const currentState = stop ? 'inactive' : attack.actual.function === 'reduced' ? 'weakened' : 'active'
    if (prior?.currentState === 'inactive' && currentState !== 'inactive') continue
    const relationFactIds = [...new Set([attack.fact.id, resolution.fact.id, ...(stop ? [stop.relation.id] : [])])]
    const evidenceRefs = [...new Set([...relationFactIds, ...(resolution.actual.conditionEvidence ?? [])])]
    byeong.set(id, { id, policyId: resolution.actual.policyId!, sourceEntityId: attack.fact.source.id,
      targetEntityId: attack.fact.target.id, action: 'control', relationFactIds, evidenceRefs, status: 'candidate',
      damagedFunction: 'day_master', structuralConsequence: 'damage_candidate', currentState, originScope: prior?.originScope ?? scope })
    if (stop?.originScope === 'natal' && scope === 'natal') {
      guEung.push({ status: 'candidate', entityId: resolution.fact.source.id, targetByeongId: id, supportingPath: relationFactIds })
    }
    if (scope !== 'natal' && luck && prior && prior.currentState !== currentState) {
      const effectType = currentState === 'inactive' ? 'relieves_byeong'
        : currentState === 'weakened' ? 'weakens_byeong' : 'strengthens_byeong'
      luckEffects.push({ effectType, scope, sourceLuckEntityId: luck.id, subjectId: id, evidenceRefs })
    }
  }
  // A prior path can survive outside ordinary scope. A stopped required participant still cuts it.
  for (const prior of previousByeong) {
    if (prior.currentState === 'inactive' || byeong.get(prior.id)?.currentState === 'inactive') continue
    const reassessed = paths.find(({ fact }) => fact.source.id === prior.sourceEntityId
      && fact.target.id === prior.targetEntityId && fact.action === prior.action)
    if (reassessed && reassessed.actual.policyId !== prior.policyId
      && reassessed.actual.direction === 'favorable_candidate' && !reassessed.actual.byeongCandidate) {
      byeong.set(prior.id, { ...prior, currentState: 'inactive' })
      continue
    }
    const stop = effectiveCombinations.find((event) => event.effect === 'stopped'
      && (event.participants.includes(prior.sourceEntityId) || event.participants.includes(prior.targetEntityId)))
    if (!stop) continue
    const relationFactIds = [...new Set([...prior.relationFactIds, stop.relation.id])]
    byeong.set(prior.id, { ...prior, currentState: 'inactive', relationFactIds })
    if (scope !== 'natal' && luck) {
      luckEffects.push({ effectType: 'relieves_byeong', scope, sourceLuckEntityId: luck.id, subjectId: prior.id, evidenceRefs: relationFactIds })
    }
  }
  if (scope !== 'natal' && luck) {
    for (const path of paths) {
      if (!live(path) || path.fact.source.id !== luck.id) continue
      if (path.actual.policyId === 'food-god-wealth-protects-output') {
        const attack = paths.find((damage) => damage.actual.policyId === 'FOOD-05'
          && damage.actual.resolutionEvidence?.includes(path.fact.id))
        if (attack) luckEffects.push({ effectType: 'protects_yongshen', scope, sourceLuckEntityId: luck.id,
          subjectId: attack.fact.target.id, evidenceRefs: [path.fact.id, attack.fact.id] })
      }
      if (path.actual.policyId !== 'OFF-02') continue
      const protectedOfficer = paths.find((attack) => attack.actual.policyId === 'OFF-03'
        && path.actual.conditionEvidence?.includes(attack.fact.id))
      if (protectedOfficer && officerProtectionPath(protectedOfficer, paths)) {
        luckEffects.push({ effectType: 'protects_yongshen', scope, sourceLuckEntityId: luck.id,
          subjectId: protectedOfficer.fact.target.id, evidenceRefs: [path.fact.id, protectedOfficer.fact.id] })
      }
    }
  }
  return { sangShen, byeong: [...byeong.values()], guEung, luckEffects }
}
