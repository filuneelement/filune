import { calculateTenGod } from './dayRelationships'
import type { GreatLuckCard } from './calculateGreatLuck'
import { HIDDEN_STEM_ROLE_TABLE } from './hiddenStemRoleTable'
import { findRisshunBoundary } from './solarTermPillars'
import { calculateTwelveStage, type EarthlyBranch, type HeavenlyStem } from './twelveStages'

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

export type YearlyLuckCard = {
  year: number
  pillar: string
  startInstant: Date
  endInstant: Date
  stemTenGod: string
  branchTenGod: string
  twelveStage: string
  /** Great Luck period containing the current instant for this year, or its Risshun instant for other years. */
  greatLuckPillar?: string
}

export type YearlyLuckResult = {
  currentSolarYear: number
  cards: YearlyLuckCard[]
  currentIndex: number
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

export function getSexagenaryYearPillar(year: number): string {
  const cycleIndex = positiveModulo(year - 1984, 60)
  return HEAVENLY_STEMS[cycleIndex % 10] + EARTHLY_BRANCHES[cycleIndex % 12]
}

function jstCalendarYear(instant: Date): number {
  return new Date(instant.getTime() + JST_OFFSET_MS).getUTCFullYear()
}

function getMainHiddenStem(branch: string): string {
  const roleEntries = HIDDEN_STEM_ROLE_TABLE[branch as keyof typeof HIDDEN_STEM_ROLE_TABLE]
  const main = roleEntries?.find(({ role }) => role === 'main')
  if (!main) throw new Error(`No main hidden stem for branch ${branch}`)
  return main.stem
}

function findGreatLuckPillarAt(instant: Date, periods: GreatLuckCard[]): string | undefined {
  return periods.find(({ startInstant, endInstant }) => (
    startInstant && endInstant
    && instant.getTime() >= startInstant.getTime()
    && instant.getTime() < endInstant.getTime()
  ))?.pillar
}

export function calculateYearlyLuck(
  dayStem: string,
  now = new Date(),
  greatLuckPeriods: GreatLuckCard[] = [],
): YearlyLuckResult {
  const calendarYear = jstCalendarYear(now)
  const currentYearRisshun = findRisshunBoundary(calendarYear)
  const currentSolarYear = now.getTime() >= currentYearRisshun.instant.getTime()
    ? calendarYear
    : calendarYear - 1
  const firstYear = currentSolarYear - 4
  const solarYears = Array.from({ length: 11 }, (_, index) => firstYear + index)
  const boundaries = solarYears.map((year) => findRisshunBoundary(year))
  const cards = solarYears.slice(0, 10).map((year, index) => {
    const pillar = getSexagenaryYearPillar(year)
    const stem = pillar[0]
    const branch = pillar[1]
    const startInstant = boundaries[index].instant
    const endInstant = boundaries[index + 1].instant
    const associationInstant = year === currentSolarYear ? now : startInstant
    return {
      year,
      pillar,
      startInstant,
      endInstant,
      stemTenGod: calculateTenGod(dayStem, stem),
      branchTenGod: calculateTenGod(dayStem, getMainHiddenStem(branch)),
      twelveStage: calculateTwelveStage(dayStem as HeavenlyStem, branch as EarthlyBranch),
      greatLuckPillar: findGreatLuckPillarAt(associationInstant, greatLuckPeriods),
    }
  })

  return {
    currentSolarYear,
    cards,
    currentIndex: currentSolarYear - firstYear,
  }
}
