import { recordId } from '../producers/shared'
import type { CombinationHistory } from './combineHistory'
import { isGod, matchesPolicyFact } from './patternPolicyRegistry'
import type { Condition, PolicyFact } from './patternPolicyRegistry'
import type { ActualStructuralFunction } from './policies'
import { generationCanReach } from './structuralEffect'
import { buildPeerConditions } from './peerPatterns'
import { buildP12Conditions } from './patternPolicyP12Evidence'
import type { CapacityEvidence, FinalPatternContext, Scope, StemParticipant, StemRelationFact, StemRuntime } from './types'

export type PatternPolicyEvidence = {
  entityId: string
  relatedEntityId?: string
  condition: 'harmful_killing' | 'excessive_killing' | 'needed_insufficient_killing' | 'insufficient_killing' | 'excessive_food_control'
    | 'needed_resource_chain' | 'key_food_control' | 'mixed' | 'necessary_protector' | 'wealth_damage'
    | 'weak_resource_strong_wealth' | 'excessive_resource_and_day' | 'necessary_output'
    | 'excessive_food' | 'blocked_wealth_feed' | 'necessary_hurting_regulation' | 'necessary_officer' | 'necessary_killing'
    | 'peer_excess' | 'problematic_rob' | 'harmful_wealth' | 'material_wealth_feed' | 'restores_blade_control'
  evidenceIds: readonly string[]
}
export function supersedesPolicyEvidence(current: PatternPolicyEvidence, prior: PatternPolicyEvidence) {
  if (current.entityId !== prior.entityId || current.relatedEntityId !== prior.relatedEntityId) return false
  const harmful = ['harmful_killing', 'excessive_killing']
  const insufficient = ['needed_insufficient_killing', 'insufficient_killing', 'necessary_killing']
  return current.condition === prior.condition || harmful.includes(current.condition) && insufficient.includes(prior.condition)
    || insufficient.includes(current.condition) && harmful.includes(prior.condition)
}

type RootEvidence = ActualStructuralFunction['rootEvidence']

export function observePolicyFacts(scopeId: string, context: FinalPatternContext, stems: readonly StemParticipant[]): PolicyFact[] {
  const branch = context.branchPattern
  const wealth = branch === '正財' || branch === '偏財'
  if (!wealth && branch !== '正官' && branch !== '偏官') return []
  return stems.filter((stem) => !stem.dayMaster && isGod(stem.tenGod, wealth ? 'wealth' : 'officer')).flatMap((source) =>
    stems.filter((stem) => !stem.dayMaster && isGod(stem.tenGod, wealth ? 'resource' : 'killing')).map((target) => ({
      id: recordId('p11-coexistence', [scopeId, source.id, target.id]), action: 'coexist', source, target,
    })))
}

export function buildPolicyConditions(context: FinalPatternContext, facts: readonly StemRelationFact[],
  runtime: ReadonlyMap<string, StemRuntime>, roots: RootEvidence, combinations: readonly CombinationHistory[],
  evidence: readonly PatternPolicyEvidence[], capacity?: CapacityEvidence | null, bladeFacts: readonly PolicyFact[] = [],
  luckClashes: readonly { id: string; scopes: readonly Scope[] }[] = [],
  requiredResourceRefs: ReadonlyMap<string, readonly string[]> = new Map()) {
  const live = (id: string) => runtime.get(id) === 'active' || runtime.get(id) === 'weakened'
  const rooted = (id: string) => roots.some(({ entityId, state }) => entityId === id && (state === 'present' || state === 'strengthened'))
  const observed = (fact: StemRelationFact) => fact.action === 'generate'
    ? generationCanReach(runtime.get(fact.source.id), runtime.get(fact.target.id),
      roots.find(({ entityId }) => entityId === fact.source.id)?.state)
    : live(fact.source.id) && live(fact.target.id)
  const supplied = (id: string, condition: PatternPolicyEvidence['condition']) =>
    evidence.find((item) => item.entityId === id && item.condition === condition && item.relatedEntityId === undefined && item.evidenceIds.length)
  const center = (id: string, god: 'officer' | 'killing') =>
    context.effectiveManifestedYongShen.some(({ entityId, tenGod }) => entityId === id && isGod(tenGod, god))
  const attacksDay = (id: string) => facts.find((fact) => fact.source.id === id && fact.target.dayMaster && fact.action === 'control')
  const stoppedBy = (id: string) => combinations.find((event) => event.effect === 'stopped' && event.participants.includes(id))
  const mixing = (officer: StemParticipant, killing: StemParticipant) => {
    const core = context.branchPattern === '正官' ? officer : killing
    const extra = context.branchPattern === '正官' ? killing : officer
    const attestation = supplied(extra.id, 'mixed')
    const attack = attacksDay(extra.id)
    return center(core.id, context.branchPattern === '正官' ? 'officer' : 'killing')
      && (attestation || attack && rooted(extra.id)) ? [...(attestation?.evidenceIds ?? []), ...(attack ? [attack.id] : [])] : null
  }
  const protection = (fact: StemRelationFact) => matchesPolicyFact(fact, 'ResourceControlsHurting')
    && observed(fact) && rooted(fact.source.id)
    ? facts.find((attack) => matchesPolicyFact(attack, 'HurtingControlsOfficer') && attack.source.id === fact.target.id
      && observed(attack) && center(attack.target.id, 'officer'))
    : undefined
  const harmfulEvidence = (id: string) => {
    const attestation = supplied(id, 'harmful_killing') || supplied(id, 'excessive_killing')
    if (supplied(id, 'needed_insufficient_killing') || supplied(id, 'insufficient_killing') || supplied(id, 'necessary_killing')) return null
    const attack = attacksDay(id)
    return attestation && attack ? [...attestation.evidenceIds, attack.id] : null
  }

  const peer = buildPeerConditions(context.branchPattern, facts, bladeFacts, runtime, rooted, supplied, harmfulEvidence, combinations, capacity)
  const p12 = buildP12Conditions(context, facts, runtime, rooted, supplied, harmfulEvidence, combinations, evidence, capacity)
  return (fact: PolicyFact) => {
    const conditions = new Set<Condition>()
    const refs = new Set<string>()
    const add = (condition: Condition, ids: readonly string[]) => {
      conditions.add(condition)
      ids.forEach((id) => refs.add(id))
    }

    if (matchesPolicyFact(fact, 'OfficerKilling')) {
      const mixed = mixing(fact.source, fact.target)
      if (mixed && runtime.get(fact.source.id) === 'active' && runtime.get(fact.target.id) === 'active') add('mixed', mixed)
      const killed = stoppedBy(fact.target.id)
      const removedOfficer = stoppedBy(fact.source.id)
      if (mixed && killed && runtime.get(fact.source.id) === 'active') add('killing_removed', [...mixed, killed.relation.id])
      if (mixed && removedOfficer && runtime.get(fact.target.id) === 'active') add('officer_removed', [...mixed, removedOfficer.relation.id])
    }
    if (fact.action !== 'coexist') {
      if (context.branchPattern === '劫財' && matchesPolicyFact(fact, 'OutputGeneratesWealth') && observed(fact)
        && context.effectiveManifestedYongShen.some(({ entityId }) => entityId === fact.target.id)
        && rooted(fact.source.id) && rooted(fact.target.id)) add('output_bridge', [fact.id, context.id, 'SRC-07-2328'])
      if (context.branchPattern === '傷官' && matchesPolicyFact(fact, 'PeerControlsWealth') && observed(fact) && rooted(fact.source.id)) {
        const feed = facts.find((path) => path.target.id === fact.target.id
          && matchesPolicyFact(path, 'HurtingGeneratesWealth') && observed(path))
        if (feed) add('peer_pressure_on_supported_wealth', [fact.id, feed.id])
      }
      if (context.branchPattern === '傷官' && matchesPolicyFact(fact, 'WealthControlsResource') && observed(fact)
        && context.monthHiddenStemCandidates.some(({ tenGod }) => isGod(tenGod, 'resource'))
        && rooted(fact.source.id) && rooted(fact.target.id) && fact.source.scope !== fact.target.scope) {
        const clash = luckClashes.find(({ scopes }) => scopes.includes(fact.source.scope) && scopes.includes(fact.target.scope))
        if (clash) add('necessary_hurting_resource', [fact.id, context.id, clash.id, 'SRC-07-0999'])
        const inherited = requiredResourceRefs.get(fact.target.id)
        if (inherited) add('necessary_hurting_resource', [fact.id, ...inherited])
      }
      const protectedAttack = protection(fact)
      if (protectedAttack) add('protects_officer', [fact.id, protectedAttack.id])
      if (matchesPolicyFact(fact, 'WealthControlsResource') && observed(fact) && rooted(fact.source.id)) {
        for (const guard of facts.filter(({ source }) => source.id === fact.target.id)) {
          const attack = protection(guard)
          if (!attack) continue
          const alternative = facts.some((other) => other.source.id !== guard.source.id && protection(other)?.id === attack.id)
          const required = supplied(guard.source.id, 'necessary_protector')
          if (required || !alternative) add('necessary_protector', [guard.id, attack.id, ...(required?.evidenceIds ?? [])])
        }
      }
    }
    if (matchesPolicyFact(fact, 'HurtingCombinesKilling')) {
      const event = combinations.find(({ participants }) => participants.includes(fact.source.id) && participants.includes(fact.target.id))
      const officer = facts.map(({ source }) => source).find((stem) => isGod(stem.tenGod, 'officer')
        && runtime.get(stem.id) === 'active' && mixing(stem, fact.target) !== null)
      if (event && officer) add('mixed_killing_combined', [event.relation.id, ...mixing(officer, fact.target)!])
    }
    if (matchesPolicyFact(fact, 'FoodControlsKilling') || matchesPolicyFact(fact, 'ResourceControlsFood')) {
      const food = matchesPolicyFact(fact, 'FoodControlsKilling') ? fact.source.id : fact.target.id
      const controls = facts.filter((path) => path.source.id === food && matchesPolicyFact(path, 'FoodControlsKilling')
        && observed(path) && (fact.action !== 'control' || fact.source.tenGod !== '食神' || path.id === fact.id))
      for (const control of controls) {
        const proof = (condition: PatternPolicyEvidence['condition']) =>
          evidence.find((item) => item.entityId === food && item.relatedEntityId === control.target.id
            && item.condition === condition && item.evidenceIds.length) ?? supplied(food, condition)
        const excessive = proof('excessive_food_control')
        const key = proof('key_food_control')
        const insufficient = supplied(control.target.id, 'insufficient_killing') || supplied(control.target.id, 'needed_insufficient_killing')
        const harmful = harmfulEvidence(control.target.id)
        const contraryHarm = supplied(control.target.id, 'harmful_killing') || supplied(control.target.id, 'excessive_killing')
        if (key) add('key_food_control', [...key.evidenceIds, control.id])
        const capacityRefs = capacity?.evidenceIds ?? []
        if (key && harmful) {
          // A necessary, functioning control of this harmful killer takes precedence over generic excess.
          add('required_harmful_food_control', [...(excessive?.evidenceIds ?? []), ...harmful, ...capacityRefs, control.id])
          continue
        }
        if (!excessive) continue
        if (insufficient && !contraryHarm) {
          add('excessive_food_control', [...excessive.evidenceIds, ...insufficient.evidenceIds, ...capacityRefs, control.id])
          if (!key) continue
        }
        add('unresolved_food_control', [
          ...excessive.evidenceIds, ...(key?.evidenceIds ?? []), ...(contraryHarm?.evidenceIds ?? []),
          ...(insufficient?.evidenceIds ?? []), ...capacityRefs, control.id,
        ])
      }
    }
    if (matchesPolicyFact(fact, 'KillingGeneratesResource')) {
      const needed = supplied(fact.target.id, 'needed_resource_chain')
      const reachesDay = facts.find((path) => path.source.id === fact.target.id && path.target.dayMaster
        && path.action === 'generate' && observed(path))
      if (needed && reachesDay && rooted(fact.target.id)) add('needed_resource_chain', [...needed.evidenceIds, reachesDay.id])
    }
    const killing = fact.target.tenGod === '偏官' ? fact.target.id : null
    if (killing) {
      const harmful = harmfulEvidence(killing)
      const insufficient = supplied(killing, 'needed_insufficient_killing')
      if (harmful) add('harmful_killing', harmful)
      else if (insufficient && !supplied(killing, 'harmful_killing') && !supplied(killing, 'excessive_killing')) add('needed_insufficient_killing', insufficient.evidenceIds)
      if (harmful && ['control', 'combine'].includes(fact.action)) {
        const feeding = facts.find((path) => path.target.id === killing && matchesPolicyFact(path, 'WealthGeneratesKilling')
          && live(path.source.id))
        if (feeding && fact.action === 'control' && live(killing) && rooted(fact.source.id)) {
          add('controls_wealth_generated_killing', [feeding.id, ...harmful])
        }
        const event = combinations.find(({ participants }) => participants.includes(fact.source.id) && participants.includes(killing))
        if (feeding && fact.action === 'combine' && event) add('combines_wealth_generated_killing', [feeding.id, event.relation.id, ...harmful])
      }
    }
    peer(fact, add)
    const functionEvidence = p12(fact, add)
    const damage = supplied(fact.target.id, 'wealth_damage')
    return { conditions, refs: [...refs], rootedSource: rooted(fact.source.id), wealthDamageRefs: damage?.evidenceIds ?? [], ...functionEvidence }
  }
}
