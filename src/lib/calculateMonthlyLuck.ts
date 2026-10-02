import { calculateTenGod } from './dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from './hiddenStemRoleTable'
import { findJieBoundariesForGregorianYear } from './solarTermPillars'
import { calculateTwelveStage, type EarthlyBranch, type HeavenlyStem } from './twelveStages'

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const MONTH_BRANCHES_BY_JIE = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'] as const
const JIE_INDEX_BY_NAME = {
  立春: 0,
  啓蟄: 1,
  清明: 2,
  立夏: 3,
  芒種: 4,
  小暑: 5,
  立秋: 6,
  白露: 7,
  寒露: 8,
  立冬: 9,
  大雪: 10,
  小寒: 11,
} as const
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

export type MonthlyLuckCard = {
  month: number
  jieName: string
  startInstant: Date
  endInstant: Date
  startLabel: string
  pillar: string
  stemTenGod: string
  branchTenGod: string
  twelveStage: string
}

export type MonthlyLuckResult = {
  year: number
  cards: MonthlyLuckCard[]
  currentIndex: number | null
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

function jstDateParts(instant: Date) {
  const jst = new Date(instant.getTime() + JST_OFFSET_MS)
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
    day: jst.getUTCDate(),
    hour: jst.getUTCHours(),
    minute: jst.getUTCMinutes(),
  }
}

function monthStemFor(year: number, jieName: keyof typeof JIE_INDEX_BY_NAME): string {
  const jieIndex = JIE_INDEX_BY_NAME[jieName]
  const solarYear = jieIndex === 11 ? year - 1 : year
  const yearStemIndex = positiveModulo(solarYear - 1984, 60) % 10
  // 五虎遁: 丙/辛年庚寅起, 戊/癸年甲寅起, 甲/己年丙寅起,
  // 乙/庚年戊寅起, 丁/壬年壬寅起. Advance one stem per Jie month.
  const yinMonthStemIndex = positiveModulo((yearStemIndex % 5) * 2 + 2, 10)
  return HEAVENLY_STEMS[positiveModulo(yinMonthStemIndex + jieIndex, 10)]
}

function mainHiddenStem(branch: string): string {
  const roleEntries = HIDDEN_STEM_ROLE_TABLE[branch as keyof typeof HIDDEN_STEM_ROLE_TABLE]
  const main = roleEntries?.find(({ role }) => role === 'main')
  if (!main) throw new Error(`No main hidden stem for branch ${branch}`)
  return main.stem
}

function formatJstStart(instant: Date): string {
  const { month, day, hour, minute } = jstDateParts(instant)
  return `${month}.${day} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}〜`
}

export function calculateMonthlyLuck(year: number, dayStem: string, now = new Date()): MonthlyLuckResult {
  const boundaries = findJieBoundariesForGregorianYear(year)
  const nextJanuaryBoundary = findJieBoundariesForGregorianYear(year + 1)[0]
  const intervalBoundaries = [...boundaries, nextJanuaryBoundary]
  const cards = boundaries.map((boundary, calendarIndex) => {
    const jieIndex = JIE_INDEX_BY_NAME[boundary.name as keyof typeof JIE_INDEX_BY_NAME]
    const branch = MONTH_BRANCHES_BY_JIE[jieIndex]
    const stem = monthStemFor(year, boundary.name as keyof typeof JIE_INDEX_BY_NAME)
    const mainStem = mainHiddenStem(branch)
    const parts = jstDateParts(boundary.instant)
    return {
      month: parts.month,
      jieName: boundary.name,
      startInstant: boundary.instant,
      endInstant: intervalBoundaries[calendarIndex + 1].instant,
      startLabel: formatJstStart(boundary.instant),
      pillar: stem + branch,
      stemTenGod: calculateTenGod(dayStem, stem),
      branchTenGod: calculateTenGod(dayStem, mainStem),
      twelveStage: calculateTwelveStage(dayStem as HeavenlyStem, branch as EarthlyBranch),
    }
  })

  const currentIndex = cards.findIndex(({ startInstant, endInstant }) => (
    now.getTime() >= startInstant.getTime() && now.getTime() < endInstant.getTime()
  ))

  return { year, cards, currentIndex: currentIndex < 0 ? null : currentIndex }
}

export function getCurrentJstYear(now = new Date()): number {
  return jstDateParts(now).year
}
