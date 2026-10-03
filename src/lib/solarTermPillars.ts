import { SearchSunLongitude, SunPosition } from 'astronomy-engine'
import type { BirthDateTime } from './calculateEightChar'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const MEAN_SOLAR_MOTION_DEGREES_PER_DAY = 0.9856
const JIE_LONGITUDE_START = 315
const JIE_COUNT = 12
const JIE_NAMES = ['立春', '啓蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'] as const

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const MONTH_BRANCHES_FROM_YIN = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

export type SolarTermPillars = {
  year: string
  month: string
}

export function toJstInstant({ year, month, day, hour, minute }: BirthDateTime): Date {
  const instant = new Date(0)
  instant.setUTCFullYear(year, month - 1, day)
  instant.setUTCHours(hour - 9, minute, 0, 0)
  return instant
}

export type JieBoundary = {
  name: (typeof JIE_NAMES)[number]
  instant: Date
}

const JIE_CALENDAR_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
const JIE_INDICES_BY_CALENDAR_MONTH = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}

function findCurrentJieIndex(instant: Date, solarLongitude: number): number {
  let index = Math.floor(positiveModulo(solarLongitude - JIE_LONGITUDE_START, 360) / 30)

  // Search a narrow window around the estimated crossing; the estimate only selects
  // a bracket. SearchSunLongitude determines the actual apparent-longitude instant.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const targetLongitude = positiveModulo(JIE_LONGITUDE_START + index * 30, 360)
    const degreesSinceJie = positiveModulo(solarLongitude - targetLongitude, 360)
    const estimatedDaysSinceJie = degreesSinceJie / MEAN_SOLAR_MOTION_DEGREES_PER_DAY
    const searchStart = new Date(
      instant.getTime() - (estimatedDaysSinceJie + 3) * DAY_IN_MILLISECONDS,
    )
    const jie = SearchSunLongitude(targetLongitude, searchStart, 6)

    if (jie && jie.date.getTime() <= instant.getTime()) {
      return index
    }

    index = positiveModulo(index - 1, JIE_COUNT)
  }

  throw new Error('Unable to determine the latest solar-term boundary.')
}

function sexagenaryYearPillar(year: number): string {
  const cycleIndex = positiveModulo(year - 1984, 60)
  return HEAVENLY_STEMS[cycleIndex % 10] + EARTHLY_BRANCHES[cycleIndex % 12]
}

export function calculateSolarTermPillars(birthDateTime: BirthDateTime): SolarTermPillars {
  const instant = toJstInstant(birthDateTime)
  const solarLongitude = SunPosition(instant).elon
  const jieIndex = findCurrentJieIndex(instant, solarLongitude)
  const risshun = findRisshunBoundary(birthDateTime.year)
  const solarYear = instant.getTime() < risshun.instant.getTime()
    ? birthDateTime.year - 1
    : birthDateTime.year
  const yearPillar = sexagenaryYearPillar(solarYear)
  const yearStemIndex = positiveModulo(solarYear - 1984, 60) % 10
  const yinMonthStemIndex = positiveModulo((yearStemIndex % 5) * 2 + 2, 10)
  const monthStemIndex = positiveModulo(yinMonthStemIndex + jieIndex, 10)

  return {
    year: yearPillar,
    month: HEAVENLY_STEMS[monthStemIndex] + MONTH_BRANCHES_FROM_YIN[jieIndex],
  }
}

export function isSolarTermAmbiguousOnJstDate({ year, month, day }: Pick<BirthDateTime, 'year' | 'month' | 'day'>): boolean {
  const start = calculateSolarTermPillars({ year, month, day, hour: 0, minute: 0 })
  const end = calculateSolarTermPillars({ year, month, day, hour: 23, minute: 59 })
  return start.year !== end.year || start.month !== end.month
}

export function findAdjacentJieBoundaries(birthDateTime: BirthDateTime): { previous: JieBoundary; next: JieBoundary } {
  const instant = toJstInstant(birthDateTime)
  const longitude = SunPosition(instant).elon
  const currentIndex = findCurrentJieIndex(instant, longitude)
  const previousLongitude = positiveModulo(JIE_LONGITUDE_START + currentIndex * 30, 360)
  const degreesSinceJie = positiveModulo(longitude - previousLongitude, 360)
  const estimatedDaysSinceJie = degreesSinceJie / MEAN_SOLAR_MOTION_DEGREES_PER_DAY
  const searchStart = new Date(instant.getTime() - (estimatedDaysSinceJie + 3) * DAY_IN_MILLISECONDS)
  const previous = SearchSunLongitude(previousLongitude, searchStart, 6)

  const nextIndex = positiveModulo(currentIndex + 1, JIE_COUNT)
  const nextLongitude = positiveModulo(JIE_LONGITUDE_START + nextIndex * 30, 360)
  const next = SearchSunLongitude(nextLongitude, instant, 40)

  if (!previous || !next) throw new Error('Unable to determine adjacent JST solar-term boundaries.')
  return {
    previous: { name: JIE_NAMES[currentIndex], instant: previous.date },
    next: { name: JIE_NAMES[nextIndex], instant: next.date },
  }
}

/** Returns the twelve actual solar-term instants that begin the monthly luck periods
 * within a Gregorian year, ordered from 小寒 through 大雪. */
export function findJieBoundariesForGregorianYear(year: number): JieBoundary[] {
  return JIE_CALENDAR_MONTHS.map((month, calendarIndex) => {
    const jieIndex = JIE_INDICES_BY_CALENDAR_MONTH[calendarIndex]
    const longitude = positiveModulo(JIE_LONGITUDE_START + jieIndex * 30, 360)
    // Each monthly Jie occurs after the first day of its Gregorian month.
    const searchStart = new Date(Date.UTC(year, month - 1, 1))
    const result = SearchSunLongitude(longitude, searchStart, 40)
    if (!result) throw new Error(`Unable to determine ${JIE_NAMES[jieIndex]} for ${year}.`)
    return { name: JIE_NAMES[jieIndex], instant: result.date }
  })
}

export function findRisshunBoundary(year: number): JieBoundary {
  const instant = SearchSunLongitude(315, new Date(Date.UTC(year, 0, 1)), 60)
  if (!instant) throw new Error(`Unable to determine 立春 for ${year}.`)
  return { name: '立春', instant: instant.date }
}
