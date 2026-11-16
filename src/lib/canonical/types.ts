import type { BirthDateTime } from '../calculateEightChar'
import type { GreatLuckGender, GreatLuckResult } from '../calculateGreatLuck'
import type { MonthlyLuckResult } from '../calculateMonthlyLuck'
import type { YearlyLuckResult } from '../calculateYearlyLuck'
import type { DayRelationships, TenGod } from '../dayRelationships'
import type { JieBoundary } from '../solarTermPillars'
import type { Birthplace, TimeCorrection, TimeCorrectionMode } from '../timeCorrection'
import type { EarthlyBranch, HeavenlyStem, TwelveStage } from '../twelveStages'
import type { Serialized } from './serialization'

export type BirthInput = {
  date: Pick<BirthDateTime, 'year' | 'month' | 'day'>
  time: { known: true; value: Pick<BirthDateTime, 'hour' | 'minute'> } | { known: false }
  birthplace?: Birthplace
  gender?: GreatLuckGender
  timeCorrectionMode: TimeCorrectionMode
}

export type CalculationVersion = {
  id: string
  implementationRevision: string
  timePolicyId: 'legacy-filune-jst-v1'
  dependencies: { lunarTypescript: string; astronomyEngine: string }
  /** Host Intl data remains an external reproducibility requirement. */
  temporalEnvironmentId: string
}

export type CalculationContext = {
  referenceTime: string
  calculationVersion: CalculationVersion
  monthlyLuckYear: number
}

/** Confirmed means established under the recorded legacy policy, not document certification. */
export type ValueStatus = 'confirmed' | 'provisional' | 'unknown' | 'unsupported'
export type AssessedValue<T> =
  | { status: 'confirmed'; value: T }
  | { status: 'provisional'; value: T; uncertaintyIds: string[] }
  | { status: 'unknown' | 'unsupported'; uncertaintyIds: string[] }

export type CalculationAvailability<T> =
  | { status: 'available'; value: T }
  | { status: 'unknown' | 'unsupported'; uncertaintyIds: string[] }

export type Uncertainty = {
  id: string
  code: 'BIRTH_TIME_UNKNOWN' | 'SOLAR_TERM_AMBIGUOUS' | 'TRUE_SOLAR_TIME_UNSUPPORTED' | 'GENDER_MISSING'
  status: Exclude<ValueStatus, 'confirmed'>
  /** JSON pointers into CalculatedChart. */
  affectedFields: string[]
  reason: string
}

export type CanonicalPillar = { ganZhi: string; stem: HeavenlyStem; branch: EarthlyBranch }
export type PillarPosition = 'year' | 'month' | 'day' | 'time'
export type CanonicalChart = {
  pillars: Record<PillarPosition, AssessedValue<CanonicalPillar>>
  basicRelations: Record<PillarPosition, AssessedValue<{
    relationships: DayRelationships
    stemTenGod: TenGod
    twelveStage: TwelveStage
  }>>
}

export type TimeCorrectionResult = CalculationAvailability<TimeCorrection>
export type TimeUsage = {
  basis: 'recorded-clock' | 'corrected-clock' | 'internal-noon'
  timezoneInterpretation: 'fixed-jst' | 'library-wall-clock' | 'not-applicable'
  status: ValueStatus
  effectiveDateTime?: BirthDateTime
  instant?: string
  dayOffsetApplied: boolean
}

export type TimePolicy = {
  policyId: CalculationVersion['timePolicyId']
  recorded: {
    date: BirthInput['date']
    time: BirthInput['time']
    birthplaceTimezone?: Birthplace['timezone']
  }
  correction: TimeCorrectionResult
  usage: Record<'yearMonthPillars' | 'dayPillar' | 'timePillar' | 'greatLuckStart', TimeUsage>
}

export type SolarTermContext = {
  basis: 'legacy-fixed-jst'
  evaluation: AssessedValue<{
    input: BirthDateTime
    instant: string
    risshun: Serialized<JieBoundary>
    previousJie: Serialized<JieBoundary>
    nextJie: Serialized<JieBoundary>
  }>
  ambiguousOnRecordedDate: boolean
}

/** Keep legacy fields, including display labels, without redefining their meaning. */
export type CanonicalGreatLuckResult = Omit<Serialized<GreatLuckResult>, 'cards'> & {
  cards: (Serialized<GreatLuckResult>['cards'][number] & { twelveStage: TwelveStage })[]
}
export type CanonicalYearlyLuckResult = Serialized<YearlyLuckResult>
export type CanonicalMonthlyLuckResult = Serialized<MonthlyLuckResult>

export type CalculatedChart = {
  schemaVersion: '1'
  birthInput: BirthInput
  context: CalculationContext
  timePolicy: TimePolicy
  chart: CanonicalChart
  solarTerms: SolarTermContext
  greatLuck: CalculationAvailability<CanonicalGreatLuckResult>
  yearlyLuck: CanonicalYearlyLuckResult
  monthlyLuck: CanonicalMonthlyLuckResult
  uncertainties: Uncertainty[]
}
