import { Solar } from 'lunar-typescript'
import { calculateSolarTermPillars } from './solarTermPillars'

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
}

export function calculateEightChar({ year, month, day, hour, minute }: BirthDateTime): FourPillars {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0)
  const lunar = solar.getLunar()
  const eightChar = lunar.getEightChar()
  const solarTermPillars = calculateSolarTermPillars({ year, month, day, hour, minute })

  return {
    year: solarTermPillars.year,
    month: solarTermPillars.month,
    day: eightChar.getDay(),
    time: eightChar.getTime(),
  }
}
