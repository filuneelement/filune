import type { MoneyAxis } from '../../outcome'
import type { ReadingSemanticUnit } from '../types'
import type { CustomerReadingParagraphPlan } from './types'

export const moneyContrastAxes = {
  earning_retention: ['earning', 'retention'],
  retention_accumulation: ['retention', 'accumulation_continuity'],
  damage_protection: ['combined_outflow_or_division', 'protection'],
  retention_protection: ['retention', 'protection'],
  earning_protection: ['earning', 'protection'],
  earning_burden: ['earning', 'burden'],
} as const satisfies Record<string, readonly [MoneyAxis, MoneyAxis]>

export interface MoneyContrast {
  readonly kind: keyof typeof moneyContrastAxes
  readonly semanticUnitIds: readonly [string, string]
}

export function planMoneyContrasts(
  paragraphs: CustomerReadingParagraphPlan[],
  units: ReadonlyMap<string, ReadingSemanticUnit>,
) {
  const evidence = paragraphs.flatMap((paragraph, index) => paragraph.reasonStatus !== 'complete' ? []
    : paragraph.semanticUnitIds.flatMap(id => {
      const unit = units.get(id)
      const target = unit?.moneyTargetId
      return unit?.moneyAxis && target && unit.direction !== 'deferred' && unit.sourceStatus !== 'future'
        ? [{ id, axis: unit.moneyAxis, target, index }] : []
    }))
  const byParagraph = new Map<number, MoneyContrast[]>()
  const kinds = Object.keys(moneyContrastAxes) as MoneyContrast['kind'][]
  for (const kind of kinds) {
    const [left, right] = moneyContrastAxes[kind]
    const pair = evidence.filter(item => item.axis === right).flatMap(second => {
      const first = evidence.find(item => item.axis === left && item.target === second.target && item.index < second.index)
      return first ? [{ first, second }] : []
    })[0]
    if (!pair) continue
    const { first, second } = pair
    const contrasts = byParagraph.get(second.index) ?? []
    // One protection explanation per paragraph. Prefer damage, then retention, then earning.
    if (right === 'protection' && contrasts.length) continue
    contrasts.push({ kind, semanticUnitIds: [first.id, second.id] })
    byParagraph.set(second.index, contrasts)
  }
  for (const [index, moneyContrasts] of byParagraph) {
    paragraphs[index] = { ...paragraphs[index], moneyContrasts }
  }
}
