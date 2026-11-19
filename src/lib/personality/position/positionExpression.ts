import type { PersonalityPosition, PositionExpression } from '../types'

export const POSITION_CONTEXTS = {
  year_stem: { expressionMode: 'outward', ruleIds: ['stem'] },
  year_branch: { expressionMode: 'supporting_context', ruleIds: ['branch', 'year_branch'] },
  month_stem: { expressionMode: 'outward', ruleIds: ['stem'] },
  month_branch: { expressionMode: 'innate', ruleIds: ['branch', 'month_branch'] },
  day_branch: { expressionMode: 'decision', ruleIds: ['branch', 'day_branch'] },
  hour_stem: { expressionMode: 'outward', ruleIds: ['stem'] },
  hour_branch: { expressionMode: 'private', ruleIds: ['branch', 'hour_branch'] },
} as const satisfies Record<PositionExpression['position'], {
  expressionMode: PositionExpression['expressionMode']
  ruleIds: readonly PersonalityPosition[]
}>

export const OCCURRENCE_POSITION_ORDER: PositionExpression['position'][] = [
  'year_stem', 'year_branch', 'month_stem', 'month_branch', 'day_branch', 'hour_stem', 'hour_branch',
]
