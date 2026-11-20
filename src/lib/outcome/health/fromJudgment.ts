import type { LuckScopeState } from '../../judgment/core/luckScope'
import type { runInternalReading } from '../../judgment/pipeline/internalReading'
import { buildHealthOutcome, type EvaluatedHealthScope, type HealthOutcomeFact } from './healthOutcome'

type InternalReading = ReturnType<typeof runInternalReading>
type Month = Extract<InternalReading['luck'], { monthlyWindow: unknown }>['monthlyWindow'][number]

export function healthOutcomeFromReading(input: {
  readonly judgment?: Pick<InternalReading, 'canonical' | 'judgmentCore'> & {
    readonly luck: { readonly monthlyWindow?: readonly Month[] }
  }
  readonly luckScopes?: readonly LuckScopeState[]
  readonly evaluatedLuckScopes?: readonly EvaluatedHealthScope[]
}): readonly HealthOutcomeFact[] {
  const { judgment, luckScopes = [], evaluatedLuckScopes = [] } = input
  const natal = judgment?.judgmentCore.find(snapshot => snapshot.scope === 'natal')
  if (!judgment || !natal) return []
  const evaluatedAt = judgment.canonical.context.referenceTime
  return buildHealthOutcome({
    canonical: judgment.canonical, natal,
    luck: [
      ...(judgment.luck.monthlyWindow ?? []).flatMap(month => month.judgmentCore
        ? [{ snapshot: month.judgmentCore, evaluatedAt: month.referenceTime }] : []),
      ...evaluatedLuckScopes,
      ...[...judgment.judgmentCore, ...luckScopes].map(snapshot => ({ snapshot, evaluatedAt })),
    ],
  })
}
