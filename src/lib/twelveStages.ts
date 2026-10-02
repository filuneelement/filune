export const TWELVE_STAGE_ORDER = [
  '長生',
  '沐浴',
  '冠帯',
  '建禄',
  '帝旺',
  '衰',
  '病',
  '死',
  '墓',
  '絶',
  '胎',
  '養',
] as const

export const EARTHLY_BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export type TwelveStage = (typeof TWELVE_STAGE_ORDER)[number]
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'
export type EarthlyBranch = (typeof EARTHLY_BRANCH_ORDER)[number]

type TwelveStageRule = {
  changShengBranch: EarthlyBranch
  direction: 1 | -1
}

/**
 * FILUNE's fixed 十二運 table rule:
 * stages proceed in TWELVE_STAGE_ORDER; yang stems move 子→亥, yin stems move 亥→子.
 * The 長生 starting branch for each day stem is listed explicitly below.
 */
export const TWELVE_STAGE_RULES: Record<HeavenlyStem, TwelveStageRule> = {
  甲: { changShengBranch: '亥', direction: 1 },
  乙: { changShengBranch: '午', direction: -1 },
  丙: { changShengBranch: '寅', direction: 1 },
  丁: { changShengBranch: '酉', direction: -1 },
  戊: { changShengBranch: '寅', direction: 1 },
  己: { changShengBranch: '酉', direction: -1 },
  庚: { changShengBranch: '巳', direction: 1 },
  辛: { changShengBranch: '子', direction: -1 },
  壬: { changShengBranch: '申', direction: 1 },
  癸: { changShengBranch: '卯', direction: -1 },
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

export function calculateTwelveStage(dayStem: HeavenlyStem, branch: EarthlyBranch): TwelveStage {
  const rule = TWELVE_STAGE_RULES[dayStem]
  const startIndex = EARTHLY_BRANCH_ORDER.indexOf(rule.changShengBranch)
  const branchIndex = EARTHLY_BRANCH_ORDER.indexOf(branch)
  const stageIndex = positiveModulo((branchIndex - startIndex) * rule.direction, 12)
  return TWELVE_STAGE_ORDER[stageIndex]
}
