import { sortedUnique } from '../../judgment/producers/shared'
import { compatibilityPairIdentity } from '../buildCompatibilityFacts'
import type { assemblePersonalityPair } from '../personalityFromBirth'
import type { buildPairRelationshipTimeline } from '../relationshipLifecycle'
import type { DirectionalCompatibilityResult } from '../structuralPolicy'
import type { CompatibilityFacts } from '../types'

type Personality = ReturnType<typeof assemblePersonalityPair>
type Lifecycle = ReturnType<typeof buildPairRelationshipTimeline>
type PairTiming = Lifecycle['windows'][number] | Lifecycle['oneSidedWindows'][number] | Lifecycle['communicationWindows'][number]

export interface FinalCompatibilityInput {
  readonly personIds: readonly [string, string]
  readonly referenceTime: string
  readonly crossChart: CompatibilityFacts
  readonly structural: readonly DirectionalCompatibilityResult[]
  readonly personality: Personality
  readonly relationshipLifecycle: Lifecycle
  readonly userContext?: { readonly relationshipStatus?: 'married' | 'dating' | 'partnered' | 'single' }
}

/** These entries point at upstream facts and retain their identities. */
interface FactIndexEntry {
  readonly id: string
  readonly axis: 'structural' | 'personality' | 'lifecycle'
  readonly semantic: string
  readonly personIds: readonly string[]
  readonly certainty: 'confirmed'
  readonly priority?: DirectionalCompatibilityResult['supportEffects'][number]['priority']
  readonly scope?: string
  readonly scopeId?: string
  readonly sourceFactIds: readonly string[]
}

function orderedIndex<T extends { id: string }>(items: readonly T[]) {
  return [...new Map(items.map(item => [item.id, item])).values()].sort((a, b) => a.id.localeCompare(b.id))
}

function timingIndex(lifecycle: Lifecycle, personality: Personality, referenceTime: string) {
  const at = Date.parse(referenceTime)
  const individual = lifecycle.people.flatMap(person => person.facts.filter(fact => fact.certainty === 'confirmed').map(fact => ({
    ...fact, windowType: 'individual' as const, personIds: [person.personId],
    sourceFactIds: sortedUnique([fact.decisionId, ...fact.sourceEvidenceIds, ...(fact.breakdownPathIds ?? [])]),
  })))
  const individualById = new Map(individual.map(fact => [fact.id, fact]))
  const decisionById = new Map(lifecycle.people.flatMap(person => person.decisions.map(decision => [decision.id, decision] as const)))
  const interactionById = new Map(personality.current.facts.map(fact => [fact.id, fact]))
  const pair = [...lifecycle.oneSidedWindows, ...lifecycle.windows, ...lifecycle.communicationWindows]
    .flatMap((window: PairTiming) => {
      const start = Date.parse(window.from)
      const end = Date.parse(window.to)
      if (!Number.isFinite(at) || !Number.isFinite(start) || !Number.isFinite(end) || start >= end) return []
      const temporalStatus = at < start ? 'future' as const : at >= end ? 'expired' as const : 'current' as const
      return [{ ...window, temporalStatus, windowType: window.kind === 'one_sided_marriage_window'
        ? 'one_sided' as const : window.kind === 'mutual_marriage_window' ? 'mutual' as const : 'communication' as const,
        personIds: 'personId' in window ? [window.personId] : window.personIds,
        scopes: window.sourceFactIds.flatMap(id => {
          const individualFact = individualById.get(id)
          if (individualFact) return [{ personId: individualFact.personIds[0], scope: individualFact.scope,
            originScope: individualFact.originScope, scopeId: individualFact.scopeId,
            parentScopeId: decisionById.get(individualFact.decisionId)?.parentScopeId ?? null,
            ...(individualFact.scopeGanZhi && { scopeGanZhi: individualFact.scopeGanZhi }),
            ...(individualFact.parentScopeGanZhi && { parentScopeGanZhi: individualFact.parentScopeGanZhi }) }]
          return (interactionById.get(id)?.scopes ?? []).map(({ personId, scope, scopeId }) => ({ personId, scope, scopeId }))
        }) }]
    })
  return orderedIndex([...individual, ...pair])
}

/** Indexes C1–C4 output without running any of those engines. */
export function assembleFinalCompatibility(input: FinalCompatibilityInput) {
  const { crossChart, personality, relationshipLifecycle, referenceTime } = input
  const [a, b] = input.personIds
  const identity = { ...compatibilityPairIdentity(a, b), inputOrder: [a, b] as const }
  const direction = (from: string, to: string) => input.structural.find(item =>
    item.sourcePersonId === from && item.targetPersonId === to)
  const [first, second] = identity.canonicalOrder
  const directions = [direction(first, second), direction(second, first)].flatMap(item => item ? [item] : [])
  const structural = { aToB: direction(a, b), bToA: direction(b, a), directions }
  const strengths: FactIndexEntry[] = []
  const risks: FactIndexEntry[] = []

  for (const item of directions) {
    for (const [effects, index] of [[item.supportEffects, strengths], [item.damageEffects, risks]] as const) {
      for (const effect of effects) index.push({ id: effect.id, axis: 'structural', semantic: effect.effectType,
        personIds: [item.sourcePersonId, item.targetPersonId], certainty: 'confirmed', priority: effect.priority, sourceFactIds: effect.sourceFactIds })
    }
  }
  for (const fact of [...personality.natal.facts, ...personality.current.facts]) {
    const index = fact.interactionType === 'communication_relief' ? strengths : risks
    index.push({ id: fact.id, axis: 'personality', semantic: fact.interactionType,
      personIds: fact.personIds, certainty: fact.certainty,
      sourceFactIds: sortedUnique([...fact.scopes.map(scope => scope.expressionId), ...fact.sourcePersonalityFactIds, ...fact.sourceJudgmentFactIds]) })
  }
  for (const person of relationshipLifecycle.people) {
    for (const decision of person.decisions) {
      if (decision.certainty !== 'confirmed') continue
      const index = decision.eventType === 'marriage_favorable' || decision.eventType === 'relationship_relief' ? strengths
        : decision.eventType === 'marriage_caution' || decision.eventType === 'relationship_strain'
          || decision.eventType === 'relationship_breakdown_risk' ? risks : undefined
      index?.push({ id: decision.id, axis: 'lifecycle', semantic: decision.eventType, personIds: [person.personId],
        certainty: decision.certainty, scope: decision.scope, scopeId: decision.scopeId, sourceFactIds: sortedUnique([...decision.sourceEvidenceIds, ...(decision.breakdownPathIds ?? [])]) })
    }
  }
  const timingWindows = timingIndex(relationshipLifecycle, personality, referenceTime)
  const current = timingWindows.filter(window => window.temporalStatus === 'current')
  const structuralBasis = (item: DirectionalCompatibilityResult) => {
    const effects = [...item.supportEffects, ...item.damageEffects].map(effect => effect.id)
    if (effects.length) return sortedUnique(effects)
    const matches = (source: string, target: string) => source === item.sourcePersonId && target === item.targetPersonId
    return sortedUnique([...item.deferredRoleIds,
      ...crossChart.branchInteractions.map(fact => fact.id),
      ...crossChart.stemInteractions.filter(fact => fact.action === 'combine' || fact.direction
        && matches(fact.direction.source.personId, fact.direction.target.personId)).map(fact => fact.id),
      ...crossChart.rootSupport.filter(fact => matches(fact.provider.personId, fact.receiver.personId)).map(fact => fact.id),
      ...crossChart.roleInteractions.filter(fact => matches(fact.source.personId, fact.target.personId)).map(fact => fact.id),
    ])
  }
  const overallSummary = {
    structural: directions.map(item => ({ sourcePersonId: item.sourcePersonId, targetPersonId: item.targetPersonId,
      verdict: item.verdict, sourceFactIds: structuralBasis(item),
      deferredRoleIds: item.deferredRoleIds })),
    personality: {
      natal: { status: personality.natal.status, sourceFactIds: personality.natal.facts.map(fact => fact.id) },
      current: { state: personality.current.state, sourceFactIds: sortedUnique([
        ...personality.current.facts.map(fact => fact.id), ...personality.current.participants.map(item => item.expression.id),
      ]) },
    },
    lifecycle: relationshipLifecycle.people.map(person => ({
      personId: person.personId,
      confirmed: person.decisions.filter(item => item.certainty === 'confirmed').map(item => ({ semantic: item.eventType, sourceFactIds: [item.id] })),
      deferred: person.deferred,
    })),
  }
  return {
    pairId: identity.pairId, identity, referenceTime, crossChart, structural, personality, relationshipLifecycle,
    strengths: orderedIndex(strengths), risks: orderedIndex(risks),
    currentState: { personality: personality.current, timingWindows: current },
    timingWindows, futureWindows: timingWindows.filter(window => window.temporalStatus === 'future'),
    historyWindows: timingWindows.filter(window => window.temporalStatus === 'expired'),
    overallSummary,
    provenance: {
      crossChartFactIds: sortedUnique([...crossChart.stemInteractions, ...crossChart.branchInteractions,
        ...crossChart.rootSupport, ...crossChart.roleInteractions].map(fact => fact.id)),
      structuralEffectIds: sortedUnique(directions.flatMap(item => [...item.supportEffects, ...item.damageEffects].map(effect => effect.id))),
      personalityFactIds: sortedUnique([...personality.natal.facts, ...personality.current.facts].map(fact => fact.id)),
      lifecycleDecisionIds: sortedUnique(relationshipLifecycle.people.flatMap(person => person.decisions.map(item => item.id))),
      timingWindowIds: timingWindows.map(item => item.id),
    },
    ...(input.userContext && { userContext: { ...input.userContext } }),
  }
}

export type FinalCompatibilityResult = ReturnType<typeof assembleFinalCompatibility>
