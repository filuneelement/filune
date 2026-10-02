import { Solar } from 'lunar-typescript'
import { calculateSolarTermPillars, isSolarTermAmbiguousOnJstDate } from './solarTermPillars'
import { calculateDayRelationships, type DayRelationships } from './dayRelationships'

export type BirthDateTime = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export type FourPillars = {
  year: string
  month: string
  day: string
  time: string
  timeKnown?: true
  dayRelationships: DayRelationships
}

export type ThreePillars = {
  year: string
  month: string
  day: string
  timeKnown: false
  solarTermAmbiguous: boolean
  dayRelationships: DayRelationships
}

export function calculateEightChar({ year, month, day, hour, minute }: BirthDateTime): FourPillars {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()
  const solarTermPillars = calculateSolarTermPillars({ year, month, day, hour, minute })
  const dayRelationships = calculateDayRelationships(
    eightChar.getDayGan(),
    eightChar.getDayZhi(),
    eightChar.getDayHideGan(),
  )

  return {
    year: solarTermPillars.year,
    month: solarTermPillars.month,
    day: eightChar.getDay(),
    time: eightChar.getTime(),
    timeKnown: true,
    dayRelationships,
  }
}

export function calculateEightCharWithoutBirthTime({ year, month, day }: Pick<BirthDateTime, 'year' | 'month' | 'day'>): ThreePillars {
  // Noon is an internal reference only: it stabilizes the local day's day-pillar
  // lookup and is never exposed or used to produce a time pillar.
  const eightChar = Solar.fromYmdHms(year, month, day, 12, 0, 0).getLunar().getEightChar()
  const solarTermPillars = calculateSolarTermPillars({ year, month, day, hour: 12, minute: 0 })
  const dayRelationships = calculateDayRelationships(
    eightChar.getDayGan(),
    eightChar.getDayZhi(),
    eightChar.getDayHideGan(),
  )

  return {
    year: solarTermPillars.year,
    month: solarTermPillars.month,
    day: eightChar.getDay(),
    timeKnown: false,
    solarTermAmbiguous: isSolarTermAmbiguousOnJstDate({ year, month, day }),
    dayRelationships,
  }
}
