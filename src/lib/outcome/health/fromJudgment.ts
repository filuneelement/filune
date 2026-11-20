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
  const currentMonth = judgment.judgmentCore.find(snapshot => snapshot.scope === 'monthlyLuck'
    && snapshot.runtimeStatus === 'resolved' && snapshot.patternContext.scope === snapshot.scope)
  return buildHealthOutcome({
    canonical: judgment.canonical, natal,
    luck: [
      ...(currentMonth ? [{ snapshot: currentMonth, evaluatedAt }] : []),
      ...(judgment.luck.monthlyWindow ?? []).flatMap(month => month.judgmentCore
        ? [{ snapshot: month.judgmentCore, evaluatedAt: month.referenceTime,
          parentSnapshot: month.parentJudgmentCore ?? undefined }] : []),
      ...evaluatedLuckScopes,
      ...[...judgment.judgmentCore.filter(snapshot => snapshot !== currentMonth), ...luckScopes]
        .map(snapshot => ({ snapshot, evaluatedAt })),
    ],
  })
}
