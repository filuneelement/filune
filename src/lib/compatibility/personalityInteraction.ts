import { recordId, sortedUnique } from '../judgment/producers/shared'
import type { CurrentResourceOutputExpression, NatalResourceOutputExpression } from '../reading/personalityResourceOutput'

export interface PersonalityInteractionPerson {
  readonly id: string
  readonly natal: NatalResourceOutputExpression
  readonly current?: CurrentResourceOutputExpression
}

export interface PersonalityInteractionFact {
  readonly id: string
  readonly interactionType: 'mutual_expression_restraint' | 'communication_friction' | 'expression_withholding'
    | 'communication_relief' | 'communication_friction_strengthened'
  readonly axis: 'expression' | 'communication'
  readonly direction: 'mutual' | 'directed'
  readonly personIds: readonly [string, string]
  readonly certainty: 'confirmed'
  readonly scopes: readonly { personId: string; scope: string; scopeId?: string; expressionId: string }[]
  readonly sourcePersonalityFactIds: readonly string[]
  readonly sourceJudgmentFactIds: readonly string[]
  readonly provenance: readonly string[]
}

/** Combines only the approved expression path. It takes no C2 result and predicts no dates. */
export function buildPersonalityInteraction(first: PersonalityInteractionPerson, second: PersonalityInteractionPerson) {
  if (!first.id || !second.id || first.id === second.id) throw new TypeError('Personality Interaction requires distinct people')
  const [a, b] = [first, second].sort((left, right) => left.id < right.id ? -1 : 1)
  const people = [a, b] as const
  const constrained = (person: PersonalityInteractionPerson) =>
    person.natal.resourceDominance === 'confirmed' && person.natal.expressionConstraint === 'confirmed'
  function makeFact(kind: PersonalityInteractionFact['interactionType'], axis: PersonalityInteractionFact['axis'],
    direction: PersonalityInteractionFact['direction'], participants: readonly [PersonalityInteractionPerson, PersonalityInteractionPerson],
    useCurrent = false): PersonalityInteractionFact {
    const basis = participants.map(person => ({ person, expression: useCurrent ? person.current! : person.natal }))
    const personIds = [participants[0].id, participants[1].id] as const
    return {
      id: recordId('personality-interaction', [kind, direction, ...basis.flatMap(({ person, expression }) => [person.id, expression.id])]),
      interactionType: kind, axis, direction, personIds, certainty: 'confirmed',
      scopes: basis.map(({ person, expression }) => ({
        personId: person.id, scope: expression.scope, scopeId: expression.scopeId, expressionId: expression.id,
      })),
      sourcePersonalityFactIds: sortedUnique(basis.flatMap(({ expression }) => expression.sourcePersonalityFactIds)),
      sourceJudgmentFactIds: sortedUnique(basis.flatMap(({ expression }) => expression.sourceJudgmentFactIds)),
      provenance: sortedUnique(['Master16:ResourceOutputInteraction', ...basis.flatMap(({ expression }) => expression.provenance)]),
    }
  }

  const natalFacts: PersonalityInteractionFact[] = []
  const mutual = people.every(constrained)
  if (mutual) {
    natalFacts.push(makeFact('mutual_expression_restraint', 'expression', 'mutual', people),
      makeFact('communication_friction', 'communication', 'mutual', people))
  } else {
    for (const [source, target] of [[a, b], [b, a]] as const) {
      if (constrained(source) && target.natal.expressionConstraint === 'not_applicable') {
        natalFacts.push(makeFact('expression_withholding', 'expression', 'directed', [source, target]))
      }
    }
  }

  const currentFacts: PersonalityInteractionFact[] = []
  const aligned = Boolean(a.current && b.current && a.current.natalExpressionId === a.natal.id
    && b.current.natalExpressionId === b.natal.id && a.current.evaluatedAt === b.current.evaluatedAt
    && a.current.certainty === 'confirmed' && b.current.certainty === 'confirmed')
  let currentState: 'relieved' | 'partially_relieved' | 'strengthened' | 'mixed' | 'retained' | 'deferred' = 'deferred'
  if (mutual && aligned) {
    if (people.every(person => person.current!.state === 'relieved')) {
      currentState = 'relieved'
      currentFacts.push(makeFact('communication_relief', 'communication', 'mutual', people, true))
    } else if (people.some(person => person.current!.state === 'strengthened')) {
      for (const [source, target] of [[a, b], [b, a]] as const) {
        if (source.current!.state === 'strengthened') {
          currentFacts.push(makeFact('communication_friction_strengthened', 'communication', 'directed', [source, target], true))
        }
      }
      currentState = people.some(person => person.current!.state === 'relieved') ? 'mixed' : 'strengthened'
    } else if (people.some(person => person.current!.state === 'relieved')) currentState = 'partially_relieved'
    else currentState = 'retained'
  }
  const natalStatus = natalFacts.length ? 'confirmed' : people.some(person => person.natal.expressionConstraint === 'deferred')
    ? 'deferred' : 'not_applicable'
  return {
    natal: { status: natalStatus, facts: natalFacts },
    current: { state: currentState, facts: currentFacts,
      participants: people.flatMap(person => person.current ? [{ personId: person.id, expression: person.current }] : []) },
  } as const
}
