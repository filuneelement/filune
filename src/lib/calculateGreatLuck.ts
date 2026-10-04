import { calculateTenGod } from './dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from './hiddenStemRoleTable'
import { findAdjacentJieBoundaries, toJstInstant, type JieBoundary } from './solarTermPillars'
import type { BirthDateTime } from './calculateEightChar'

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const YANG_STEMS = new Set(['甲', '丙', '戊', '庚', '壬'])
const JIE_TO_AGE_DAY_MS = 12 * 60 * 1000 // 2 solar hours correspond to 10 age-days.
const JST_OFFSET_MS = 9 * 60 * 60 * 1000
const SEXAGENARY_CYCLE = Array.from({ length: 60 }, (_, index) => (
  HEAVENLY_STEMS[index % 10] + EARTHLY_BRANCHES[index % 12]
))

export type GreatLuckDirection = 'forward' | 'reverse'
export type GreatLuckGender = '女性' | '男性'

export type GreatLuckCard = {
  pillar: string
  stem: string
  branch: string
  stemTenGod: string
  branchTenGod: string
  startDateLabel?: string
  startInstant?: Date
  endInstant?: Date
}

export type GreatLuckResult = {
  direction: GreatLuckDirection
  directionLabel: '順行' | '逆行'
  cards: GreatLuckCard[]
  startAgeLabel?: string
  startAgeEquivalentDays?: number
  boundaryUsed?: JieBoundary
  startInstant?: Date
  currentIndex: number | null
  timeUnknown: boolean
}

function getDirection(yearStem: string, gender: GreatLuckGender): GreatLuckDirection {
  const yangYear = YANG_STEMS.has(yearStem)
  return (yangYear === (gender === '男性')) ? 'forward' : 'reverse'
}

function makePillarSequence(monthPillar: string, direction: GreatLuckDirection, count: number): string[] {
  const monthIndex = SEXAGENARY_CYCLE.indexOf(monthPillar)
  if (monthIndex < 0) throw new Error(`Invalid sexagenary month pillar: ${monthPillar}`)
  const step = direction === 'forward' ? 1 : -1
  return Array.from({ length: count }, (_, offset) => {
    const cycleIndex = (monthIndex + step * (offset + 1) + 60) % 60
    return SEXAGENARY_CYCLE[cycleIndex]
  })
}

function splitAgeDays(ageDays: number) {
  const years = Math.floor(ageDays / 360)
  const afterYears = ageDays - years * 360
  const months = Math.floor(afterYears / 30)
  const afterMonths = afterYears - months * 30
  const days = Math.floor(afterMonths)
  return { years, months, days, remainderDays: afterMonths - days }
}

function formatAge(ageDays: number): string {
  const { years, months, days } = splitAgeDays(ageDays)
  return `${years}歳${months}か月${days > 0 ? `${days}日` : ''}`
}

function formatStartDate(instant: Date): string {
  const date = toJstPseudoDate(instant)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}.${month}.${day}~`
}

function toJstPseudoDate(instant: Date): Date {
  return new Date(instant.getTime() + JST_OFFSET_MS)
}

function lastDayOfMonth(year: number, month: number): number {
  const date = new Date(0)
  date.setUTCFullYear(year, month, 0)
  return date.getUTCDate()
}

/** Add each displayed age component in order, clamping at each calendar boundary. */
export function addCalendarDuration(
  birth: BirthDateTime,
  duration: { years: number; months: number; days: number },
): BirthDateTime {
  let year = birth.year
  let month = birth.month
  let day = birth.day

  year += duration.years
  day = Math.min(day, lastDayOfMonth(year, month))

  const monthIndex = month - 1 + duration.months
  year += Math.floor(monthIndex / 12)
  month = (monthIndex % 12) + 1
  day = Math.min(day, lastDayOfMonth(year, month))

  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(birth.hour, birth.minute, 0, 0)
  date.setUTCDate(date.getUTCDate() + duration.days)

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: birth.hour,
    minute: birth.minute,
  }
}

function mainHiddenStem(branch: string): string {
  const stems = HIDDEN_STEM_ROLE_TABLE[branch as keyof typeof HIDDEN_STEM_ROLE_TABLE]
  const main = stems?.find(({ role }) => role === 'main')
  if (!main) throw new Error(`No main hidden stem for branch ${branch}`)
  return main.stem
}

export function calculateGreatLuck(args: {
  yearPillar: string
  monthPillar: string
  dayStem: string
  gender: GreatLuckGender
  birthDateTime?: BirthDateTime
  timeUnknown: boolean
  now?: Date
}): GreatLuckResult {
  const direction = getDirection(args.yearPillar[0], args.gender)
  const sequence = makePillarSequence(args.monthPillar, direction, 8)
  const cards: GreatLuckCard[] = sequence.map((pillar) => {
    const stem = pillar[0]
    const branch = pillar[1]
    return {
      pillar,
      stem,
      branch,
      stemTenGod: calculateTenGod(args.dayStem, stem),
      branchTenGod: calculateTenGod(args.dayStem, mainHiddenStem(branch)),
    }
  })

  if (args.timeUnknown || !args.birthDateTime) {
    return {
      direction,
      directionLabel: direction === 'forward' ? '順行' : '逆行',
      cards,
      currentIndex: null,
      timeUnknown: true,
    }
  }

  const birthInstant = toJstInstant(args.birthDateTime)
  const boundaries = findAdjacentJieBoundaries(args.birthDateTime)
  const boundaryUsed = direction === 'forward' ? boundaries.next : boundaries.previous
  const differenceMs = direction === 'forward'
    ? boundaryUsed.instant.getTime() - birthInstant.getTime()
    : birthInstant.getTime() - boundaryUsed.instant.getTime()
  const startAgeDays = differenceMs / JIE_TO_AGE_DAY_MS
  const startAge = splitAgeDays(startAgeDays)
  const firstStartBirthDateTime = addCalendarDuration(args.birthDateTime, startAge)
  const startInstant = toJstInstant(firstStartBirthDateTime)
  const now = args.now ?? new Date()
  let currentIndex: number | null = null
  let cardStartBirthDateTime = firstStartBirthDateTime

  cards.forEach((card, index) => {
    const cardEndBirthDateTime = addCalendarDuration(cardStartBirthDateTime, { years: 10, months: 0, days: 0 })
    const cardStart = toJstInstant(cardStartBirthDateTime)
    const cardEnd = toJstInstant(cardEndBirthDateTime)
    card.startInstant = cardStart
    card.endInstant = cardEnd
    card.startDateLabel = formatStartDate(cardStart)
    if (now.getTime() >= cardStart.getTime() && now.getTime() < cardEnd.getTime()) currentIndex = index
    cardStartBirthDateTime = cardEndBirthDateTime
  })

  return {
    direction,
    directionLabel: direction === 'forward' ? '順行' : '逆行',
    cards,
    startAgeLabel: formatAge(startAgeDays),
    startAgeEquivalentDays: startAgeDays,
    boundaryUsed,
    startInstant,
    currentIndex,
    timeUnknown: false,
  }
}
