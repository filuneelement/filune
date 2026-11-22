import type { CustomerCompatibilityUnit, CustomerTemporal } from './customerCompatibility'

type Interval = NonNullable<NonNullable<CustomerCompatibilityUnit['period']>['interval']>
type PresentationTemporal = CustomerTemporal | 'current_spanning'

export const timeLabelsEn = {
  current: 'Current', current_spanning: 'Long-term flow including the present',
  future: 'Coming up', expired: 'Earlier', undated: 'Calendar timing not yet available',
} satisfies Record<PresentationTemporal, string>

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
})
const order = { current: 0, current_spanning: 0, future: 1, expired: 2, undated: 3 }

export interface CompatibilityPeriodEN {
  readonly temporal: PresentationTemporal
  readonly interval?: Interval
  readonly intervalLabel?: string
  readonly within?: string
  readonly withinProvenanceRefs?: readonly string[]
  readonly provenanceRefs: readonly string[]
}

export function intervalLabelEn(interval: Interval) {
  const start = dateFormat.format(Date.parse(interval.from))
  const end = dateFormat.format(Date.parse(interval.to))
  return start === end ? start : `${start}–${end}`
}

export function displayPeriodEn(unit: CustomerCompatibilityUnit, at: number): CompatibilityPeriodEN | undefined {
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
  return { temporal: relation, interval, intervalLabel: intervalLabelEn(interval), provenanceRefs: unit.sourceFactIds }
}

export function periodIdentityEn(period: CompatibilityPeriodEN) {
  return JSON.stringify([period.temporal,
    period.interval ? [Date.parse(period.interval.from), Date.parse(period.interval.to)] : undefined])
}

export function comparePeriodsEn(a: CompatibilityPeriodEN, b: CompatibilityPeriodEN) {
  return order[a.temporal] - order[b.temporal]
    || (a.interval ? Date.parse(a.interval.from) : 0) - (b.interval ? Date.parse(b.interval.from) : 0)
    || (b.interval ? Date.parse(b.interval.to) : 0) - (a.interval ? Date.parse(a.interval.to) : 0)
}

export function strictContainerEn(inner: CompatibilityPeriodEN, candidates: readonly CompatibilityPeriodEN[]) {
  if (!inner.interval) return undefined
  const start = Date.parse(inner.interval.from)
  const end = Date.parse(inner.interval.to)
  return candidates.find(candidate => {
    if (!candidate.interval || comparePeriodsEn(candidate, inner) >= 0) return false
    const from = Date.parse(candidate.interval.from)
    const to = Date.parse(candidate.interval.to)
    return from <= start && end <= to && (from < start || end < to)
  })
}
