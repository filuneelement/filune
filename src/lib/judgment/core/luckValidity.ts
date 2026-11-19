import type { Validity } from '../contracts'

export function luckPeriodStatus(validity: Validity, referenceTime?: string) {
  if (referenceTime === undefined) return 'effective'
  const time = Date.parse(referenceTime)
  const start = validity.from.kind === 'exact' ? Date.parse(validity.from.instant) : NaN
  const end = validity.to.kind === 'exact' ? Date.parse(validity.to.instant) : NaN
  if (![time, start, end].every(Number.isFinite) || start >= end) return 'unknown'
  return time < start ? 'future' : time >= end ? 'expired' : 'effective'
}

/** The last instant inside an already validated exact period. */
export function lastLuckInstant(validity: Validity) {
  return validity.to.kind === 'exact' ? new Date(Date.parse(validity.to.instant) - 1).toISOString() : undefined
}

/** A canonical period reference can reuse the same array slot in another reading. */
export function luckOriginKey(scope: string, validity: Validity) {
  const boundaryKey = (boundary: Validity['from']) => boundary.kind === 'exact' ? Date.parse(boundary.instant) : boundary
  return JSON.stringify([scope, validity.periodId, boundaryKey(validity.from), boundaryKey(validity.to)])
}
