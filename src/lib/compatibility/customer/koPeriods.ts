import type { CustomerCompatibilityUnit, CustomerTemporal } from './customerCompatibility'

type Interval = NonNullable<NonNullable<CustomerCompatibilityUnit['period']>['interval']>
type PresentationTemporal = CustomerTemporal | 'current_spanning'

export const timeLabels = {
  current: '현재', current_spanning: '현재를 포함한 장기 흐름',
  future: '앞으로', expired: '지난 시기', undated: '달력 시점 미확인',
} satisfies Record<PresentationTemporal, string>

const dateFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' })
const order = { current: 0, current_spanning: 0, future: 1, expired: 2, undated: 3 }

export interface CompatibilityPeriodKO {
  readonly temporal: PresentationTemporal
  readonly interval?: Interval
  readonly intervalLabel?: string
  readonly within?: string
  readonly withinProvenanceRefs?: readonly string[]
  readonly provenanceRefs: readonly string[]
}

export function intervalLabel(interval: Interval) {
  const start = dateFormat.format(Date.parse(interval.from))
  const end = dateFormat.format(Date.parse(interval.to))
  return start === end ? start : `${start}~${end}`
}

export function displayPeriod(unit: CustomerCompatibilityUnit, at: number): CompatibilityPeriodKO | undefined {
  if (!unit.period) return undefined
  const { temporal, interval } = unit.period
  if (!interval) return { temporal, provenanceRefs: unit.sourceFactIds }
  const start = Date.parse(interval.from)
  const end = Date.parse(interval.to)
  if (!Number.isFinite(at) || !(start < end)) return { temporal: 'undated', provenanceRefs: unit.sourceFactIds }
  const anniversary = new Date(start)
  anniversary.setUTCFullYear(anniversary.getUTCFullYear() + 1)
  const relation = at >= end ? 'expired' : at < start ? 'future'
    : start < at && end > anniversary.getTime() ? 'current_spanning' : 'current'
  return { temporal: relation, interval, intervalLabel: intervalLabel(interval), provenanceRefs: unit.sourceFactIds }
}

export function periodIdentity(period: CompatibilityPeriodKO) {
  return JSON.stringify([period.temporal,
    period.interval ? [Date.parse(period.interval.from), Date.parse(period.interval.to)] : undefined])
}

export function comparePeriods(a: CompatibilityPeriodKO, b: CompatibilityPeriodKO) {
  return order[a.temporal] - order[b.temporal]
    || (a.interval ? Date.parse(a.interval.from) : 0) - (b.interval ? Date.parse(b.interval.from) : 0)
    || (b.interval ? Date.parse(b.interval.to) : 0) - (a.interval ? Date.parse(a.interval.to) : 0)
}

export function strictContainer(inner: CompatibilityPeriodKO, candidates: readonly CompatibilityPeriodKO[]) {
  if (!inner.interval) return undefined
  const start = Date.parse(inner.interval.from)
  const end = Date.parse(inner.interval.to)
  // A container must already appear earlier in the timeline and cover the whole interval.
  return candidates.find(candidate => {
    if (!candidate.interval || comparePeriods(candidate, inner) >= 0) return false
    const from = Date.parse(candidate.interval.from)
    const to = Date.parse(candidate.interval.to)
    return from <= start && end <= to && (from < start || end < to)
  })
}
