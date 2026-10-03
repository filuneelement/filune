export type TimeCorrectionMode = 'none' | 'longitude' | 'trueSolarTime'

export type Birthplace = {
  code: string
  countryCode: string
  region: string
  city: string
  displayName: string
  latitude: number
  longitude: number
  timezone: string
  standardMeridian?: number
  aliases?: string[]
}

const STANDARD_MERIDIANS_BY_TIMEZONE: Record<string, number> = {
  'Asia/Tokyo': 135,
  'Asia/Seoul': 135,
}

export type TimeCorrection = {
  mode: TimeCorrectionMode
  originalTime: string
  correctionMinutes: number
  calculationTime: string
  dayOffset: number
  birthplace?: Birthplace
}

function formatMinutes(totalMinutes: number): string {
  const minuteOfDay = ((totalMinutes % 1440) + 1440) % 1440
  return `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`
}

export function calculateTimeCorrection(
  hour: number,
  minute: number,
  mode: TimeCorrectionMode,
  birthplace?: Birthplace,
): TimeCorrection {
  if (mode === 'trueSolarTime') {
    throw new Error('True solar time correction is not implemented.')
  }

  const standardMeridian = birthplace
    ? birthplace.standardMeridian ?? STANDARD_MERIDIANS_BY_TIMEZONE[birthplace.timezone]
    : undefined
  if (mode === 'longitude' && birthplace && standardMeridian === undefined) {
    throw new Error(`No standard meridian configured for timezone ${birthplace.timezone}.`)
  }
  const correctionMinutes = mode === 'longitude' && birthplace && standardMeridian !== undefined
    ? Math.round((birthplace.longitude - standardMeridian) * 4)
    : 0
  const recordedMinutes = hour * 60 + minute
  const correctedMinutes = recordedMinutes + correctionMinutes

  return {
    mode,
    originalTime: formatMinutes(recordedMinutes),
    correctionMinutes,
    calculationTime: formatMinutes(correctedMinutes),
    dayOffset: Math.floor(correctedMinutes / 1440),
    birthplace,
  }
}

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function calculateTimePillarFromCorrectedTime(dayStem: string, calculationTime: string): string {
  const [hour, minute] = calculationTime.split(':').map(Number)
  const minutes = hour * 60 + minute
  const branchIndex = Math.floor((((minutes + 60) % 1440) + 1440) % 1440 / 120)
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem)
  if (dayStemIndex < 0) throw new Error(`Invalid day stem: ${dayStem}`)
  const timeStemIndex = (dayStemIndex % 5) * 2 + branchIndex
  return HEAVENLY_STEMS[timeStemIndex % 10] + EARTHLY_BRANCHES[branchIndex]
}
