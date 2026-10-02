import { calculateTenGod } from './dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from './hiddenStemRoleTable'
import { findAdjacentJieBoundaries, toJstInstant, type JieBoundary } from './solarTermPillars'
import type { BirthDateTime } from './calculateEightChar'

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const YANG_STEMS = new Set(['甲', '丙', '戊', '庚', '壬'])
const JIE_TO_AGE_DAY_MS = 12 * 60 * 1000 // 2 solar hours correspond to 10 age-days.
const DAY_MS = 24 * 60 * 60 * 1000
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
  startAgeLabel?: string
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

function toJstPseudoDate(instant: Date): Date {
  return new Date(instant.getTime() + JST_OFFSET_MS)
}

function fromJstPseudoDate(localDate: Date): Date {
  return new Date(localDate.getTime() - JST_OFFSET_MS)
}

function addAgeDuration(birthInstant: Date, ageDays: number): Date {
  const { years, months, days, remainderDays } = splitAgeDays(ageDays)
  const localBirth = toJstPseudoDate(birthInstant)
  const birthYear = localBirth.getUTCFullYear()
  const birthMonth = localBirth.getUTCMonth()
  const birthDay = localBirth.getUTCDate()
  const targetMonthIndex = birthMonth + years * 12 + months
  const targetYear = birthYear + Math.floor(targetMonthIndex / 12)
  const targetMonth = targetMonthIndex % 12
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  const localStart = new Date(Date.UTC(
    targetYear,
    targetMonth,
    Math.min(birthDay, lastDayOfTargetMonth) + days,
    localBirth.getUTCHours(),
    localBirth.getUTCMinutes(),
    localBirth.getUTCSeconds(),
    localBirth.getUTCMilliseconds(),
  ) + remainderDays * DAY_MS)
  return fromJstPseudoDate(localStart)
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
  const startInstant = addAgeDuration(birthInstant, startAgeDays)
  const now = args.now ?? new Date()
  let currentIndex: number | null = null

  cards.forEach((card, index) => {
    const cardAgeDays = startAgeDays + index * 3600
    card.startAgeLabel = formatAge(cardAgeDays)
    const cardStart = addAgeDuration(birthInstant, cardAgeDays)
    const cardEnd = addAgeDuration(birthInstant, cardAgeDays + 3600)
    card.startInstant = cardStart
    card.endInstant = cardEnd
    if (now.getTime() >= cardStart.getTime() && now.getTime() < cardEnd.getTime()) currentIndex = index
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
