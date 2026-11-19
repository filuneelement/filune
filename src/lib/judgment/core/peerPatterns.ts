import { calculateTenGod } from '../../dayRelationships'
import { recordId } from '../producers/shared'
import { isGod, matchesPolicyFact } from './patternPolicyRegistry'
import type { Condition, PolicyFact } from './patternPolicyRegistry'
import type { CombinationHistory } from './combineHistory'
import type { PatternPolicyEvidence } from './patternPolicyEvidence'
import type { BranchPattern, CapacityEvidence, StemParticipant, StemRelationFact, StemRuntime } from './types'

const profiles = {
  比肩: { type: 'peer_pattern', main: ['officer', 'wealth'], sevenKillingAsMainYongShen: false, ordering: 'listed' },
  劫財: { type: 'rob_wealth_pattern', main: ['officer', 'killing', 'wealth'], sevenKillingAsMainYongShen: true, ordering: 'deferred' },
  羊刃: { type: 'yang_blade_pattern', main: ['killing', 'officer', 'wealth'], sevenKillingAsMainYongShen: true, ordering: 'priority' },
} as const

export function specialPatternSelection(branch: BranchPattern | null, stems: readonly StemParticipant[],
  runtime: ReadonlyMap<string, StemRuntime>) {
  if (branch !== '比肩' && branch !== '劫財' && branch !== '羊刃') return null
  const profile = profiles[branch]
  const available = stems.filter(({ dayMaster, id }) => !dayMaster && ['active', 'weakened'].includes(runtime.get(id) ?? ''))
  const mainCandidates = profile.ordering === 'deferred'
    ? available.filter(({ tenGod }) => profile.main.some((group) => isGod(tenGod, group)))
    : profile.main.flatMap((group) => available.filter(({ tenGod }) => isGod(tenGod, group)))
  return { ...profile, evidenceStatus: 'FILUNE_APPROVED_OVERRIDE' as const,
    auxiliary: ['output'] as const, mainCandidates, auxiliaryCandidates: available.filter(({ tenGod }) => isGod(tenGod, 'output')) }
}

export function observeBladeControl(id: string, branch: BranchPattern | null, bladeId: string | undefined,
  mainStem: string | undefined, stems: readonly StemParticipant[]): PolicyFact[] {
  if (branch !== '羊刃' || !bladeId || !mainStem) return []
  const target = { id: bladeId, stem: mainStem, tenGod: '劫財', dayMaster: false, scope: 'natal', position: 'month' } as const
  return stems.filter(({ stem, tenGod, dayMaster }) => !dayMaster && (tenGod === '正官' || tenGod === '偏官')
    && isGod(calculateTenGod(stem, mainStem), 'wealth')).map((source) => ({
    id: recordId('p13-blade-control', [id, source.id, bladeId]), action: 'control', source, target, basis: 'month_blade',
  }))
}

type Supply = (id: string, condition: PatternPolicyEvidence['condition']) => PatternPolicyEvidence | undefined
type Add = (condition: Condition, ids: readonly string[]) => void

export function buildPeerConditions(branch: BranchPattern | null, facts: readonly StemRelationFact[],
  bladeFacts: readonly PolicyFact[], runtime: ReadonlyMap<string, StemRuntime>, rooted: (id: string) => boolean,
  supplied: Supply, harmfulEvidence: (id: string) => string[] | null, combinations: readonly CombinationHistory[],
  capacity?: CapacityEvidence | null) {
  const peerKind = branch === '比肩' ? '比肩' : '劫財'
  const live = (id: string) => runtime.get(id) === 'active' || runtime.get(id) === 'weakened'
  const operating = (fact: StemRelationFact) => live(fact.source.id) && live(fact.target.id)
  const wealthAttacks = (id: string) => facts.filter((path) => path.source.id === id && path.source.tenGod === peerKind
    && path.action === 'control' && isGod(path.target.tenGod, 'wealth') && operating(path) && rooted(id)
    && !supplied(path.target.id, 'harmful_wealth'))
  const controlNeed = (id: string) => {
    const reviewed = supplied(id, branch === '比肩' ? 'peer_excess' : 'problematic_rob')
    return [...(reviewed?.evidenceIds ?? []), ...wealthAttacks(id).map(({ id: relationId }) => relationId)]
  }
  const adequate = capacity?.state === 'killing_capacity_adequate' && capacity.evidenceIds.length > 0
  const excessive = (id: string) => supplied(id, 'harmful_killing') || supplied(id, 'excessive_killing')
  const neededKilling = (id: string) => supplied(id, 'necessary_killing') || supplied(id, 'needed_insufficient_killing')
  const bladeControl = (id: string) => bladeFacts.find((fact) => fact.source.id === id)
  const safeBlade = (id: string) => adequate && rooted(id) && neededKilling(id) && !excessive(id)
  const bridges = (sourceId: string, wealthId: string) => facts.flatMap((tail) => {
    if (tail.target.id !== wealthId || !matchesPolicyFact(tail, 'OutputGeneratesWealth') || !operating(tail)) return []
    return facts.filter((head) => head.source.id === sourceId && head.target.id === tail.source.id
      && matchesPolicyFact(head, 'PeerGeneratesOutput') && operating(head)).map((head) => [head.id, tail.id])
  })

  return (fact: PolicyFact, add: Add) => {
    if (branch !== '比肩' && branch !== '劫財' && branch !== '羊刃') return
    const { source, target } = fact
    if (branch !== '羊刃') {
      const controller = source.tenGod === '正官' || branch === '劫財' && source.tenGod === '偏官'
      if (controller && fact.action === 'control' && target.tenGod === peerKind && rooted(source.id)) {
        const need = controlNeed(target.id)
        if (need.length && live(source.id) && live(target.id)) add(branch === '比肩' ? 'peer_needs_control' : 'rob_needs_control', need)
        if (adequate && !excessive(source.id)) add('safe_killing_control', capacity.evidenceIds)
      }
      if (matchesPolicyFact(fact, 'OutputGeneratesWealth') && live(source.id) && live(target.id)) {
        for (const head of facts.filter((path) => path.source.tenGod === peerKind && path.target.id === source.id
          && matchesPolicyFact(path, 'PeerGeneratesOutput') && operating(path))) add('output_bridge', [head.id, fact.id])
      }
      if (fact.action === 'control' && source.tenGod === peerKind && isGod(target.tenGod, 'wealth')) {
        const harmful = supplied(target.id, 'harmful_wealth')
        if (harmful) add('wealth_is_harmful', harmful.evidenceIds)
        for (const path of bridges(source.id, target.id)) add('protected_peer_wealth', path)
        const guard = facts.find((path) => path.target.id === source.id && path.action === 'control'
          && path.source.tenGod === '正官' && operating(path) && rooted(path.source.id))
        if (guard) add('protected_peer_wealth', [guard.id])
      }
      if (matchesPolicyFact(fact, 'WealthGeneratesKilling') && live(source.id) && live(target.id)) {
        const harm = harmfulEvidence(target.id)
        const material = rooted(source.id) ? [] : supplied(source.id, 'material_wealth_feed')?.evidenceIds
        if (harm && material) add('material_harmful_feed', [...harm, ...material])
        const need = neededKilling(target.id)
        if (adequate && need && !excessive(target.id) && rooted(target.id)) {
          const control = facts.find((path) => path.source.id === target.id && matchesPolicyFact(path, 'KillingControlsRob')
            && operating(path) && controlNeed(path.target.id).length)
          if (control) add('feeds_needed_rob_killing', [control.id, ...need.evidenceIds, ...capacity.evidenceIds])
        }
      }
      return
    }

    if (matchesPolicyFact(fact, 'KillingControlsBlade') && live(source.id) && safeBlade(source.id)) {
      add('safe_needed_blade_killing', [...neededKilling(source.id)!.evidenceIds, ...capacity!.evidenceIds])
    }
    if (matchesPolicyFact(fact, 'WealthFeedsController') && live(source.id) && live(target.id)) {
      const control = bladeControl(target.id)
      const protective = target.tenGod === '偏官' ? safeBlade(target.id) : rooted(target.id)
      if (control && protective) add('feeds_blade_controller', [control.id, ...(neededKilling(target.id)?.evidenceIds ?? [])])
    }
    const bladePath = target.tenGod === '偏官' ? bladeControl(target.id) : undefined
    const required = bladePath && neededKilling(target.id)
    if (!required || excessive(target.id) || !rooted(target.id)) return
    const refs = [bladePath.id, ...required.evidenceIds]
    if (fact.action === 'control' && live(source.id) && live(target.id)) add('attacks_needed_blade_killing', refs)
    if (fact.action === 'combine') {
      const event = combinations.find(({ participants }) => participants.includes(source.id) && participants.includes(target.id))
      if (event) add('combines_needed_blade_killing', [event.relation.id, ...refs])
    }
  }
}
