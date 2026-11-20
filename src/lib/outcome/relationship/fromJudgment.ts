import type { LuckScopeState } from '../../judgment/core/luckScope'
import { luckPeriodStatus } from '../../judgment/core/luckValidity'
import type { runInternalReading } from '../../judgment/pipeline/internalReading'
import { buildRelationshipOutcome, type EvaluatedRelationshipScope, type RelationshipOutcomeFact } from './relationshipOutcome'

type InternalReading = ReturnType<typeof runInternalReading>
type ReadingMonths = Extract<InternalReading['luck'], { monthlyWindow: unknown }>['monthlyWindow']
type JudgmentInput = Pick<InternalReading, 'canonical' | 'judgmentCore'> & {
  readonly luck: { readonly monthlyWindow?: Readonly<ReadingMonths> }
}

/** Produce the explicit Outcome input from the same evaluated scopes used by Assembly. */
export function relationshipOutcomeFromReading(input: {
  readonly judgment?: Readonly<JudgmentInput>
  readonly luckScopes?: readonly LuckScopeState[]
  readonly evaluatedLuckScopes?: readonly EvaluatedRelationshipScope[]
}): readonly RelationshipOutcomeFact[] {
  const { judgment, luckScopes = [], evaluatedLuckScopes = [] } = input
  const natal = judgment?.judgmentCore.find(snapshot => snapshot.scope === 'natal')
  if (!judgment || !natal) return []
  const monthly = (judgment.luck.monthlyWindow ?? []).flatMap(month => month.judgmentCore
    ? [{ snapshot: month.judgmentCore, evaluatedAt: month.referenceTime }] : [])
  const evaluatedAt = judgment.canonical.context.referenceTime
  const luck = [...monthly, ...evaluatedLuckScopes,
    ...[...judgment.judgmentCore, ...luckScopes].map(snapshot => ({ snapshot, evaluatedAt }))]
  const representedPeriods = new Set<string>()
  return buildRelationshipOutcome({ canonical: judgment.canonical, natal, luck: luck.filter(({ snapshot, evaluatedAt }) => {
    if (snapshot.scope === 'natal' || snapshot.scope === 'dailyLuck'
      || snapshot.patternContext.scope !== snapshot.scope
      || luckPeriodStatus(snapshot.validity, evaluatedAt) !== 'effective') return false
    const { from, to } = snapshot.validity
    const key = JSON.stringify([snapshot.scope, from, to])
    if (representedPeriods.has(key)) return false
    representedPeriods.add(key)
    return true
  }) })
}

