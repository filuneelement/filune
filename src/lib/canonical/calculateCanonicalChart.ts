import { calculateEightChar, calculateEightCharWithoutBirthTime, type BirthDateTime } from '../calculateEightChar'
import { calculateGreatLuck, type GreatLuckResult } from '../calculateGreatLuck'
import { calculateMonthlyLuck } from '../calculateMonthlyLuck'
import { calculateYearlyLuck } from '../calculateYearlyLuck'
import { calculateDayRelationships, calculateTenGod } from '../dayRelationships'
import { findAdjacentJieBoundaries, findRisshunBoundary, toJstInstant } from '../solarTermPillars'
import { EARTHLY_BRANCH_ORDER, TWELVE_STAGE_RULES, calculateTwelveStage, type HeavenlyStem } from '../twelveStages'
import { serializeCanonical } from './serialization'
import { assertSupportedVersion } from './version'
import type {
  AssessedValue, BirthInput, CalculatedChart, CalculationContext, CanonicalChart,
  CanonicalPillar, PillarPosition, TimeCorrectionResult, TimeUsage, Uncertainty,
} from './types'

/** The sole gan-zhi string adapter; no calendar/astrology formula lives here. */
function toPillar(ganZhi: string): CanonicalPillar {
  const [stem, branch] = Array.from(ganZhi)
  if (Array.from(ganZhi).length !== 2 || !Object.hasOwn(TWELVE_STAGE_RULES, stem)
    || !EARTHLY_BRANCH_ORDER.some((item) => item === branch)) {
    throw new TypeError(`Invalid legacy pillar: ${ganZhi}`)
  }
  return { ganZhi, stem: stem as HeavenlyStem, branch: branch as CanonicalPillar['branch'] }
}

function validateInput(input: BirthInput, context: CalculationContext): Date {
  assertSupportedVersion(context.calculationVersion)
  const reference = new Date(context.referenceTime)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(context.referenceTime)
    || !Number.isFinite(reference.getTime())
    || reference.toISOString() !== context.referenceTime.replace(/Z$/, context.referenceTime.includes('.') ? 'Z' : '.000Z')) {
    throw new RangeError('referenceTime must be a valid UTC ISO timestamp.')
  }
  const { year, month, day } = input.date
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  if (![year, month, day].every(Number.isInteger) || year < 1 || year > 9999
    || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new RangeError('Invalid birth date.')
  }
  if (typeof input.time.known !== 'boolean') throw new TypeError('Invalid birth time discriminator.')
  if (input.time.known) {
    const { hour, minute } = input.time.value
    if (!Number.isInteger(hour) || hour < 0 || hour > 23
      || !Number.isInteger(minute) || minute < 0 || minute > 59) throw new RangeError('Invalid birth time.')
  }
  if (!Number.isInteger(context.monthlyLuckYear) || context.monthlyLuckYear < 100 || context.monthlyLuckYear > 9998) {
    throw new RangeError('monthlyLuckYear must be between 100 and 9998 (legacy Date.UTC range).')
  }
  if (input.gender !== undefined && input.gender !== '男性' && input.gender !== '女性') throw new TypeError('Invalid gender.')
  if (!['none', 'longitude', 'trueSolarTime'].includes(input.timeCorrectionMode)) throw new TypeError('Invalid correction mode.')
  if (input.timeCorrectionMode === 'longitude' && !input.birthplace) throw new RangeError('Longitude correction requires a birthplace.')
  return reference
}

export function calculateCanonicalChart(birthInput: BirthInput, context: CalculationContext): CalculatedChart {
  const referenceTime = validateInput(birthInput, context)
  // Detach inputs and reject non-JSON/non-finite data before passing them to legacy code.
  const input = serializeCanonical(birthInput)
  const savedContext = serializeCanonical(context)
  savedContext.referenceTime = referenceTime.toISOString()
  const known = input.time.known
  const unsupported = input.timeCorrectionMode === 'trueSolarTime'
  const birth: BirthDateTime = { ...input.date, ...(input.time.known ? input.time.value : { hour: 12, minute: 0 }) }
  // Only unaffected pillars are retained for an unsupported mode; no fallback time pillar is exposed.
  // calculateEightChar calls calculateTimeCorrection itself, so correction is never applied twice.
  const legacy = known
    ? calculateEightChar(birth, { mode: unsupported ? 'none' : input.timeCorrectionMode, birthplace: input.birthplace })
    : calculateEightCharWithoutBirthTime(input.date)
  const ambiguous = legacy.timeKnown === false && legacy.solarTermAmbiguous
  const uncertainties: Uncertainty[] = []
  if (!known) uncertainties.push({
    id: 'birth-time-unknown', code: 'BIRTH_TIME_UNKNOWN', status: 'unknown',
    affectedFields: ['/chart/pillars/time', '/chart/basicRelations/time', '/timePolicy/correction',
      '/solarTerms/evaluation', '/greatLuck/value/startInstant', '/greatLuck/value/currentIndex',
      '/timePolicy/usage/greatLuckStart'],
    reason: 'Birth time is unknown; noon is an internal reference, not a birth time.',
  })
  if (ambiguous) uncertainties.push({
    id: 'solar-term-ambiguous', code: 'SOLAR_TERM_AMBIGUOUS', status: 'provisional',
    affectedFields: ['/chart/pillars/year', '/chart/pillars/month', '/chart/basicRelations/year',
      '/chart/basicRelations/month', '/greatLuck'],
    reason: 'The recorded date crosses a Jie boundary; noon-based year/month pillars are provisional.',
  })
  if (unsupported) uncertainties.push({
    id: 'true-solar-time-unsupported', code: 'TRUE_SOLAR_TIME_UNSUPPORTED', status: 'unsupported',
    affectedFields: ['/chart/pillars/time', '/chart/basicRelations/time', '/timePolicy/correction', '/timePolicy/usage/timePillar'],
    reason: 'The legacy implementation does not support true solar time correction.',
  })
  if (!input.gender) uncertainties.push({
    id: 'gender-missing', code: 'GENDER_MISSING', status: 'unknown', affectedFields: ['/greatLuck'],
    reason: 'Legacy Great Luck direction requires gender.',
  })

  const confirmed = <T>(value: T): AssessedValue<T> => ({ status: 'confirmed', value })
  const yearMonth = (value: CanonicalPillar): AssessedValue<CanonicalPillar> => ambiguous
    ? { status: 'provisional', value, uncertaintyIds: ['solar-term-ambiguous'] } : confirmed(value)
  const timeMissing: AssessedValue<never> = unsupported
    ? { status: 'unsupported', uncertaintyIds: ['true-solar-time-unsupported'] }
    : { status: 'unknown', uncertaintyIds: ['birth-time-unknown'] }
  const pillars: CanonicalChart['pillars'] = {
    year: yearMonth(toPillar(legacy.year)), month: yearMonth(toPillar(legacy.month)),
    day: confirmed(toPillar(legacy.day)),
    time: known && !unsupported && 'time' in legacy ? confirmed(toPillar(legacy.time)) : timeMissing,
  }
  const dayStem = toPillar(legacy.day).stem
  function relationships(position: PillarPosition): CanonicalChart['basicRelations'][PillarPosition] {
    const pillar = pillars[position]
    if (!('value' in pillar)) return pillar
    const value = {
      relationships: position === 'day' ? legacy.dayRelationships : calculateDayRelationships(dayStem, pillar.value.branch),
      stemTenGod: calculateTenGod(dayStem, pillar.value.stem),
      twelveStage: calculateTwelveStage(dayStem, pillar.value.branch),
    }
    return pillar.status === 'provisional' ? { ...pillar, value } : confirmed(value)
  }
  const chart: CanonicalChart = { pillars, basicRelations: {
    year: relationships('year'), month: relationships('month'), day: relationships('day'), time: relationships('time'),
  } }
  let correction: TimeCorrectionResult = timeMissing
  if (known && !unsupported) {
    if (!('timeCorrection' in legacy) || !legacy.timeCorrection) {
      throw new Error('Legacy calculation did not return the requested time correction.')
    }
    correction = { status: 'available', value: legacy.timeCorrection }
  }

  let great: GreatLuckResult | undefined
  const greatMissingIds = [...(!input.gender ? ['gender-missing'] : []), ...(ambiguous ? ['solar-term-ambiguous'] : [])]
  if (input.gender && !ambiguous) great = calculateGreatLuck({
    yearPillar: legacy.year, monthPillar: legacy.month, dayStem, gender: input.gender,
    birthDateTime: known ? birth : undefined, timeUnknown: !known, now: referenceTime,
  })
  const greatLuck: CalculatedChart['greatLuck'] = great ? { status: 'available', value: {
    ...serializeCanonical(great),
    cards: great.cards.map((card) => ({ ...serializeCanonical(card), twelveStage: calculateTwelveStage(dayStem, toPillar(card.pillar).branch) })),
  } } : { status: 'unknown', uncertaintyIds: greatMissingIds }

  const basis = known ? 'recorded-clock' : 'internal-noon'
  const jstUsage: TimeUsage = {
    basis, timezoneInterpretation: 'fixed-jst', status: known ? 'confirmed' : 'provisional',
    effectiveDateTime: birth, instant: toJstInstant(birth).toISOString(), dayOffsetApplied: false,
  }
  let timeUsage: TimeUsage = { basis, timezoneInterpretation: 'not-applicable', status: timeMissing.status, dayOffsetApplied: false }
  if (correction.status === 'available') {
    const corrected = correction.value.mode === 'longitude'
    const [hour, minute] = correction.value.calculationTime.split(':').map(Number)
    timeUsage = {
      basis: corrected ? 'corrected-clock' : 'recorded-clock', timezoneInterpretation: 'library-wall-clock',
      status: 'confirmed', effectiveDateTime: { ...birth, hour, minute }, dayOffsetApplied: false,
    }
  }
  const adjacent = findAdjacentJieBoundaries(birth)
  const solarValue = serializeCanonical({ input: birth, instant: toJstInstant(birth),
    risshun: findRisshunBoundary(birth.year), previousJie: adjacent.previous, nextJie: adjacent.next })
  const result: CalculatedChart = {
    schemaVersion: '1', birthInput: input, context: savedContext, chart,
    timePolicy: { policyId: savedContext.calculationVersion.timePolicyId,
      recorded: { date: input.date, time: input.time, birthplaceTimezone: input.birthplace?.timezone },
      correction, usage: {
        yearMonthPillars: jstUsage,
        dayPillar: { ...jstUsage, timezoneInterpretation: 'library-wall-clock', status: 'confirmed', instant: undefined },
        timePillar: timeUsage,
        greatLuckStart: known && great ? jstUsage
          : { basis, timezoneInterpretation: 'not-applicable', status: 'unknown', dayOffsetApplied: false },
      },
    },
    solarTerms: { basis: 'legacy-fixed-jst', ambiguousOnRecordedDate: ambiguous,
      evaluation: known ? confirmed(solarValue) : { status: 'provisional', value: solarValue, uncertaintyIds: ['birth-time-unknown'] } },
    greatLuck,
    yearlyLuck: serializeCanonical(calculateYearlyLuck(dayStem, referenceTime, great?.cards ?? [])),
    monthlyLuck: serializeCanonical(calculateMonthlyLuck(savedContext.monthlyLuckYear, dayStem, referenceTime)),
    uncertainties,
  }
  return serializeCanonical(result)
}
