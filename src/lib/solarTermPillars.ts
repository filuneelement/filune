import { SearchSunLongitude, SunPosition } from 'astronomy-engine'
import type { BirthDateTime } from './calculateEightChar'

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const MEAN_SOLAR_MOTION_DEGREES_PER_DAY = 0.9856
const JIE_LONGITUDE_START = 315
const JIE_COUNT = 12

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const MONTH_BRANCHES_FROM_YIN = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']

export type SolarTermPillars = {
  year: string
  month: string
}

function toJstInstant({ year, month, day, hour, minute }: BirthDateTime): Date {
  const instant = new Date(0)
  instant.setUTCFullYear(year, month - 1, day)
  instant.setUTCHours(hour - 9, minute, 0, 0)
  return instant
}

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
  const solarYear = jieIndex === 11 ? birthDateTime.year - 1 : birthDateTime.year
  const yearPillar = sexagenaryYearPillar(solarYear)
  const yearStemIndex = positiveModulo(solarYear - 1984, 60) % 10
  const yinMonthStemIndex = positiveModulo((yearStemIndex % 5) * 2 + 2, 10)
  const monthStemIndex = positiveModulo(yinMonthStemIndex + jieIndex, 10)

  return {
    year: yearPillar,
    month: HEAVENLY_STEMS[monthStemIndex] + MONTH_BRANCHES_FROM_YIN[jieIndex],
  }
}
