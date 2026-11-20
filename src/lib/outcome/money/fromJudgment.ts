import type { LuckScopeState } from '../../judgment/core/luckScope'
import type { runInternalReading } from '../../judgment/pipeline/internalReading'
import { buildMoneyOutcome, type EvaluatedMoneyScope, type MoneyOutcomeFact } from './moneyOutcome'

type InternalReading = ReturnType<typeof runInternalReading>
type Month = Extract<InternalReading['luck'], { monthlyWindow: unknown }>['monthlyWindow'][number]

export function moneyOutcomeFromReading(input: {
  readonly judgment?: Pick<InternalReading, 'canonical' | 'judgmentCore'> & {
    readonly luck: { readonly monthlyWindow?: readonly Month[] }
  }
  readonly luckScopes?: readonly LuckScopeState[]
  readonly evaluatedLuckScopes?: readonly EvaluatedMoneyScope[]
}): readonly MoneyOutcomeFact[] {
  const { judgment, luckScopes = [], evaluatedLuckScopes = [] } = input
  const natal = judgment?.judgmentCore.find(snapshot => snapshot.scope === 'natal')
  if (!judgment || !natal) return []
  const evaluatedAt = judgment.canonical.context.referenceTime
  return buildMoneyOutcome({
    referenceTime: evaluatedAt, natal,
    luck: [
      ...(judgment.luck.monthlyWindow ?? []).flatMap(month => month.judgmentCore
        ? [{ snapshot: month.judgmentCore, evaluatedAt: month.referenceTime,
          parentSnapshot: month.parentJudgmentCore ?? undefined }] : []),
      ...evaluatedLuckScopes,
      ...[...judgment.judgmentCore, ...luckScopes].map(snapshot => ({ snapshot, evaluatedAt })),
    ],
  })
}
