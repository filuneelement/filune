import type { CombinationHistory } from './combineHistory'
import { matchesPolicyFact } from './patternPolicyRegistry'
import type { Condition, PolicyFact } from './patternPolicyRegistry'
import type { PatternPolicyEvidence } from './patternPolicyEvidence'
import type { CapacityEvidence, FinalPatternContext, StemRelationFact, StemRuntime } from './types'

type Supply = (id: string, condition: PatternPolicyEvidence['condition']) => PatternPolicyEvidence | undefined
type Add = (condition: Condition, ids: readonly string[]) => void

export function buildP12Conditions(context: FinalPatternContext, facts: readonly StemRelationFact[],
  runtime: ReadonlyMap<string, StemRuntime>, rooted: (id: string) => boolean, supplied: Supply,
  harmfulEvidence: (id: string) => string[] | null, combinations: readonly CombinationHistory[],
  evidence: readonly PatternPolicyEvidence[], capacity?: CapacityEvidence | null) {
  const branch = context.branchPattern
  const live = (id: string) => runtime.get(id) === 'active' || runtime.get(id) === 'weakened'
  const blockedFeed = (fact: PolicyFact) => branch === '食神' && matchesPolicyFact(fact, 'WealthGeneratesKilling')
    ? evidence.find(({ entityId, relatedEntityId, condition }) => condition === 'blocked_wealth_feed'
      && entityId === fact.source.id && relatedEntityId === fact.target.id) : undefined
  const operating = (fact: StemRelationFact) => live(fact.source.id) && live(fact.target.id) && !blockedFeed(fact)
  const resourceChain = (killingId: string) => facts.flatMap((link) => {
    if (link.source.id !== killingId || !matchesPolicyFact(link, 'KillingGeneratesResource')
      || !operating(link) || !rooted(link.target.id)) return []
    const need = supplied(link.target.id, 'needed_resource_chain')
    const body = facts.find((path) => path.source.id === link.target.id && matchesPolicyFact(path, 'ResourceGeneratesDay') && operating(path))
    return need && body ? [{ link, body, need }] : []
  })
  const coreFood = (fact: StemRelationFact) => matchesPolicyFact(fact, 'IndirectResourceControlsFood') && operating(fact)
    && (context.effectiveManifestedYongShen.some(({ entityId }) => entityId === fact.target.id)
      || supplied(fact.target.id, 'necessary_output'))
  const necessaryRegulation = (fact: StemRelationFact) => matchesPolicyFact(fact, 'ResourceControlsHurting')
    && operating(fact) && rooted(fact.source.id) ? supplied(fact.target.id, 'necessary_hurting_regulation') : undefined

  return (fact: PolicyFact, add: Add) => {
    const blocked = blockedFeed(fact)
    let flowConstraint = false
    let verifiedDamage = false
    if ((branch === '印綬' || branch === '偏印') && fact.action !== 'coexist') {
      const day = fact.source.dayMaster ? fact.source : fact.target.dayMaster ? fact.target : undefined
      const excess = day && supplied(day.id, 'excessive_resource_and_day')
      if (excess && operating(fact)) {
        if (matchesPolicyFact(fact, 'DayGeneratesOutput')) add('excessive_resource_and_day', excess.evidenceIds)
        if (matchesPolicyFact(fact, 'ResourceGeneratesDay')) flowConstraint = true
      }
      if (matchesPolicyFact(fact, 'WealthControlsResource')) {
        const imbalance = supplied(fact.target.id, 'weak_resource_strong_wealth')
        if (imbalance && operating(fact)) add('weak_resource_strong_wealth', imbalance.evidenceIds)
      }
      if (matchesPolicyFact(fact, 'ResourceControlsOutput') && operating(fact)) {
        const need = supplied(fact.target.id, 'necessary_output')
        const support = facts.find((path) => operating(path)
          && (path.source.id === fact.target.id && path.action === 'control' && path.target.tenGod === '偏官'
            || path.target.id === fact.target.id && matchesPolicyFact(path, 'DayGeneratesOutput')))
        if (need && support) add('necessary_output', [support.id, ...need.evidenceIds])
      }
      if (matchesPolicyFact(fact, 'WealthGeneratesKilling') && operating(fact)) {
        for (const { link, body, need } of resourceChain(fact.target.id)) {
          const breaks = facts.find((path) => path.source.id === fact.source.id && path.target.id === link.target.id
            && matchesPolicyFact(path, 'WealthControlsResource') && operating(path))
          if (breaks) add('disrupts_resource_chain', [breaks.id, link.id, body.id, ...need.evidenceIds])
        }
      }
    }

    if (branch === '食神' && fact.action !== 'coexist') {
      if (matchesPolicyFact(fact, 'ResourceControlsFood') && operating(fact)) {
        const excess = supplied(fact.target.id, 'excessive_food')
        if (excess) add('excessive_food', excess.evidenceIds)
        else if (coreFood(fact)) add('core_food', [fact.id, ...(supplied(fact.target.id, 'necessary_output')?.evidenceIds ?? [])])
      }
      if (matchesPolicyFact(fact, 'WealthControlsResource') && operating(fact)) {
        const attack = facts.find((path) => path.source.id === fact.target.id && coreFood(path)
          && !supplied(path.target.id, 'excessive_food'))
        if (attack) add('resource_attacks_food_god', [attack.id])
      }
      if (matchesPolicyFact(fact, 'WealthGeneratesKilling') && operating(fact)) {
        const control = facts.find((path) => path.target.id === fact.target.id
          && matchesPolicyFact(path, 'FoodControlsKilling') && operating(path))
        if (control) add('controlled_killing', [control.id])
      }
      if (matchesPolicyFact(fact, 'FoodGeneratesWealth') && operating(fact)) {
        for (const control of facts.filter((path) => path.source.id === fact.source.id
          && matchesPolicyFact(path, 'FoodControlsKilling') && operating(path))) {
          const feed = facts.find((path) => path.source.id === fact.target.id && path.target.id === control.target.id
            && matchesPolicyFact(path, 'WealthGeneratesKilling'))
          if (!feed || !operating(feed)) add('food_coexisting_paths', [control.id,
            ...(feed ? [feed.id, ...(blockedFeed(feed)?.evidenceIds ?? [])] : [])])
        }
      }
      if (matchesPolicyFact(fact, 'DayGeneratesFood') && operating(fact) && capacity?.state === 'output_capacity_insufficient') {
        add('insufficient_output_capacity', capacity.evidenceIds)
      }
    }

    if (branch === '傷官' && fact.action !== 'coexist') {
      const regulation = necessaryRegulation(fact)
      if (regulation) add('necessary_hurting_regulation', regulation.evidenceIds)
      if (matchesPolicyFact(fact, 'HurtingControlsOfficer') && operating(fact) && rooted(fact.source.id)) {
        const necessary = supplied(fact.target.id, 'necessary_officer')
        if (necessary) {
          verifiedDamage = true
          add('necessary_officer_damage', necessary.evidenceIds)
        }
      }
      if (matchesPolicyFact(fact, 'HurtingCombinesKilling')) {
        const event = combinations.find(({ participants }) => participants.includes(fact.source.id) && participants.includes(fact.target.id))
        if (event) {
          add('valid_combine', [event.relation.id])
          const necessary = supplied(fact.target.id, 'necessary_killing') || supplied(fact.target.id, 'needed_insufficient_killing')
          const contradictory = necessary && (supplied(fact.target.id, 'harmful_killing') || supplied(fact.target.id, 'excessive_killing'))
          const harmful = harmfulEvidence(fact.target.id)
          if (necessary && !contradictory) add('valid_necessary_combine', [event.relation.id, ...necessary.evidenceIds])
          if (harmful) add('valid_harmful_combine', [event.relation.id, ...harmful])
        }
      }
      if (matchesPolicyFact(fact, 'WealthControlsResource') && operating(fact)) {
        for (const control of facts.filter((path) => path.source.id === fact.target.id)) {
          const need = necessaryRegulation(control)
          if (need) add('necessary_hurting_resource', [control.id, ...need.evidenceIds])
        }
      }
      if (matchesPolicyFact(fact, 'KillingGeneratesResource') && operating(fact)) {
        for (const guard of facts.filter((path) => path.source.id === fact.target.id && necessaryRegulation(path))) {
          const control = facts.find((path) => path.source.id === guard.target.id && path.target.id === fact.source.id
            && matchesPolicyFact(path, 'HurtingControlsKilling') && operating(path))
          if (control) add('hurting_resource_killing_chain', [guard.id, control.id, ...necessaryRegulation(guard)!.evidenceIds])
        }
      }
    }
    return { blockedRefs: blocked?.evidenceIds ?? [], flowConstraint, verifiedDamage }
  }
}
