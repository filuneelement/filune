import type { FinalCompatibilityResult } from '../final/assembleFinalCompatibility'

export const customerSectionOrder = [
  'overview', 'strengths', 'risks', 'directionalInfluence', 'personality', 'relationshipFlow',
  'relationshipRelief', 'relationshipStrain', 'marriageOpportunity', 'marriageQuality', 'breakdownRisk',
] as const
export type CustomerSectionKind = typeof customerSectionOrder[number]
type Window = FinalCompatibilityResult['timingWindows'][number]
type Decision = FinalCompatibilityResult['relationshipLifecycle']['people'][number]['decisions'][number]
type StructuralEffect = FinalCompatibilityResult['structural']['directions'][number]['supportEffects'][number]['effectType']
type PersonalitySemantic = FinalCompatibilityResult['personality']['natal']['facts'][number]['interactionType']
type LifecycleSemantic = Extract<Decision['eventType'], `relationship_${string}` | `marriage_${string}`>
type Verdict = Exclude<FinalCompatibilityResult['structural']['directions'][number]['verdict'], 'deferred'>

export type CustomerSemantic = StructuralEffect | PersonalitySemantic | LifecycleSemantic
  | `direction_${Verdict}` | 'expression_constraint' | 'expression_relief' | 'expression_strengthened'
  | 'mutual_marriage_window' | 'one_sided_marriage_window'
export type CustomerTemporal = Window['temporalStatus'] | 'undated'

export interface CustomerCompatibilityUnit {
  readonly semantic: CustomerSemantic
  readonly section: CustomerSectionKind
  readonly personIds: readonly string[]
  readonly certainty: 'confirmed'
  readonly sourceFactIds: readonly string[]
  readonly period?: {
    readonly temporal: CustomerTemporal
    readonly interval?: { readonly from: string; readonly to: string }
  }
  readonly priority?: 'core' | 'required' | 'root' | 'linked'
  readonly directed?: true
  readonly marriageOpportunityAlongside?: true
  readonly breakdownPaths?: readonly ('BREAKDOWN-A' | 'BREAKDOWN-B')[]
}

const lifecycleSections = {
  relationship_formation: 'relationshipFlow', relationship_change: 'relationshipFlow',
  marriage_opportunity: 'marriageOpportunity', marriage_favorable: 'marriageQuality', marriage_caution: 'marriageQuality',
  relationship_strain: 'relationshipStrain', relationship_relief: 'relationshipRelief',
  relationship_breakdown_risk: 'breakdownRisk',
  mutual_marriage_window: 'marriageOpportunity', one_sided_marriage_window: 'marriageOpportunity',
} as const satisfies Record<LifecycleSemantic | 'mutual_marriage_window' | 'one_sided_marriage_window', CustomerSectionKind>

function isLifecycleSemantic(value: string): value is keyof typeof lifecycleSections {
  return Object.hasOwn(lifecycleSections, value)
}

function exactInterval(from: string, to: string) {
  return Date.parse(from) < Date.parse(to) ? { from, to } : undefined
}

const sortedIds = (ids: readonly string[]) => [...new Set(ids)].sort()
const structuralOrder = ['core', 'required', 'root', 'linked'] as const
const timeOrder = { current: 0, future: 1, expired: 2, undated: 3 }

function positionTime(unit: CustomerCompatibilityUnit) {
  return unit.period?.interval ? Date.parse(unit.period.interval.from) : 0
}

/** Presentation routing only. Every unit points to a confirmed C5 record or its summary basis. */
export function buildCustomerCompatibility(result: FinalCompatibilityResult) {
  const units = new Map<string, CustomerCompatibilityUnit>()
  const add = (unit: CustomerCompatibilityUnit) => {
    if (!unit.sourceFactIds.length) return
    const key = JSON.stringify([unit.section, unit.semantic, unit.personIds, unit.period, unit.directed,
      unit.marriageOpportunityAlongside, unit.breakdownPaths])
    const prior = units.get(key)
    units.set(key, { ...unit, sourceFactIds: sortedIds([...prior?.sourceFactIds ?? [], ...unit.sourceFactIds]) })
  }

  for (const item of result.overallSummary.structural) {
    if (item.verdict === 'deferred') continue
    add({ semantic: `direction_${item.verdict}`, section: 'directionalInfluence', directed: true, certainty: 'confirmed',
      personIds: [item.sourcePersonId, item.targetPersonId], sourceFactIds: item.sourceFactIds })
  }
  const structural = new Map(result.structural.directions.flatMap(direction =>
    [...direction.supportEffects, ...direction.damageEffects].map(fact => [fact.id, fact] as const)))
  for (const [index, section] of [[result.strengths, 'strengths'], [result.risks, 'risks']] as const) {
    for (const item of index) {
      if (item.axis !== 'structural' || item.certainty !== 'confirmed') continue
      const effect = structural.get(item.id)
      if (!effect) continue
      add({ semantic: effect.effectType, section, directed: true, certainty: 'confirmed',
        personIds: item.personIds, priority: effect.priority, sourceFactIds: [item.id] })
    }
  }
  const natalFriction = result.personality.natal.facts.some(item => item.interactionType === 'communication_friction'
    && item.certainty === 'confirmed')
  for (const fact of result.personality.natal.facts) {
    if (fact.certainty !== 'confirmed') continue
    // These two confirmed facts describe the same presentation when both are present.
    if (fact.interactionType === 'mutual_expression_restraint' && natalFriction) continue
    add({ semantic: fact.interactionType, section: 'personality', certainty: 'confirmed',
      ...(fact.direction === 'directed' && { directed: true }),
      personIds: fact.personIds, sourceFactIds: [fact.id, ...(fact.interactionType === 'communication_friction'
        ? result.personality.natal.facts.filter(item => item.interactionType === 'mutual_expression_restraint'
          && item.certainty === 'confirmed').map(item => item.id) : [])] })
  }
  for (const person of result.personality.people) {
    const natal = person.natal
    if (natal.expressionConstraint === 'confirmed' && !result.personality.natal.facts.some(item =>
      item.certainty === 'confirmed' && (item.direction === 'mutual' && item.personIds.includes(person.id)
        || item.interactionType === 'expression_withholding' && item.personIds[0] === person.id))) {
      add({ semantic: 'expression_constraint', section: 'personality', certainty: 'confirmed',
        personIds: [person.id], sourceFactIds: [natal.id] })
    }
  }
  for (const fact of result.personality.current.facts) {
    if (fact.certainty !== 'confirmed') continue
    add({ semantic: fact.interactionType, section: 'personality', certainty: 'confirmed',
      ...(fact.direction === 'directed' && { directed: true }), personIds: fact.personIds,
      period: { temporal: 'current' }, sourceFactIds: [fact.id] })
  }
  for (const { personId, expression } of result.personality.current.participants) {
    if (expression.certainty !== 'confirmed' || !expression.effect || result.personality.current.facts.some(fact =>
      fact.certainty === 'confirmed' && fact.scopes.some(scope => scope.expressionId === expression.id)
      && (expression.effect === 'current_expression_relief' ? fact.interactionType === 'communication_relief'
        : fact.interactionType === 'communication_friction_strengthened' && fact.personIds[0] === personId))) continue
    add({ semantic: expression.effect === 'current_expression_relief' ? 'expression_relief' : 'expression_strengthened',
      personIds: [personId], section: 'personality', certainty: 'confirmed',
      period: { temporal: 'current' }, sourceFactIds: [expression.id] })
  }

  const paths = new Map(result.relationshipLifecycle.people.flatMap(person => person.breakdownPaths.map(path => [path.id, path.kind] as const)))
  const projectedDecisions = new Set<string>()
  const confirmedOpportunities = new Map<string, string[]>()
  for (const person of result.relationshipLifecycle.people) {
    for (const decision of person.decisions) {
      if (decision.eventType !== 'marriage_opportunity' || decision.certainty !== 'confirmed') continue
      const key = JSON.stringify([person.personId, decision.scopeId])
      confirmedOpportunities.set(key, [...(confirmedOpportunities.get(key) ?? []), decision.id])
    }
  }
  function lifecycle(semantic: keyof typeof lifecycleSections, personIds: readonly string[], id: string,
    period: CustomerCompatibilityUnit['period'], scopeId?: string, breakdownPathIds?: readonly string[]) {
    const breakdownPaths = [...new Set((breakdownPathIds ?? []).flatMap(key => {
      const kind = paths.get(key)
      return kind ? [kind] : []
    }))].sort()
    const opportunities = semantic === 'marriage_caution' && scopeId
      ? confirmedOpportunities.get(JSON.stringify([personIds[0], scopeId])) ?? [] : []
    add({ semantic, section: lifecycleSections[semantic], certainty: 'confirmed', personIds, period,
      sourceFactIds: [id, ...opportunities],
      ...(opportunities.length && { marriageOpportunityAlongside: true }),
      ...(breakdownPaths.length && { breakdownPaths }),
    })
  }
  for (const window of result.timingWindows) {
    if (window.certainty !== 'confirmed') continue
    if (window.windowType === 'individual') {
      if (!isLifecycleSemantic(window.eventType)) continue
      const { from, to } = window.period
      const interval = from.kind === 'exact' && to.kind === 'exact' ? exactInterval(from.instant, to.instant) : undefined
      if (!interval) continue
      projectedDecisions.add(window.decisionId)
      lifecycle(window.eventType, window.personIds, window.id, { temporal: window.temporalStatus, interval },
        window.scopeId, window.breakdownPathIds)
    } else {
      const interval = exactInterval(window.from, window.to)
      if (interval) lifecycle(window.kind, window.personIds, window.id, { temporal: window.temporalStatus, interval })
    }
  }
  for (const person of result.relationshipLifecycle.people) {
    for (const decision of person.decisions) {
      if (decision.certainty !== 'confirmed' || projectedDecisions.has(decision.id) || !isLifecycleSemantic(decision.eventType)) continue
      lifecycle(decision.eventType, [person.personId], decision.id, { temporal: 'undated' }, decision.scopeId, decision.breakdownPathIds)
    }
  }

  const ordered = [...units.values()].sort((a, b) => timeOrder[a.period?.temporal ?? 'current']
    - timeOrder[b.period?.temporal ?? 'current'] || positionTime(a) - positionTime(b) || (a.priority && b.priority
      ? structuralOrder.indexOf(a.priority) - structuralOrder.indexOf(b.priority) : 0))
  const sections = customerSectionOrder.flatMap(kind => {
    const matching = ordered.filter(unit => unit.section === kind)
    return matching.length ? [{ kind, units: matching }] : []
  })
  return { personIds: result.identity.inputOrder, relationshipStatus: result.userContext?.relationshipStatus, sections }
}
