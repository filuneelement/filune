import type { CalculatedChart, ValueStatus } from '../../canonical/types'
import { serializeCanonical } from '../../canonical/serialization'
import { assertSupportedVersion } from '../../canonical/version'
import type { DeepReadonly, JudgmentFact, JsonValue } from '../types'

const statuses: ValueStatus[] = ['confirmed', 'provisional', 'unknown', 'unsupported']
const rank: Record<ValueStatus, number> = { confirmed: 0, provisional: 1, unknown: 2, unsupported: 3 }
const escapePointer = (key: string) => key.replace(/~/g, '~0').replace(/\//g, '~1')

/** Projection only. Does not read birthInput, call a clock, or recalculate any fact. */
export function fromCanonical(chart: DeepReadonly<CalculatedChart>): JudgmentFact[] {
  if (chart.schemaVersion !== '1') throw new RangeError('Unsupported canonical schema version.')
  assertSupportedVersion(chart.context.calculationVersion)
  const facts: JudgmentFact[] = []
  function visit(raw: unknown, pointer: string, status: ValueStatus, ids: readonly string[] = []): void {
    const value = serializeCanonical(raw) as JsonValue
    if (value && typeof value === 'object' && !Array.isArray(value) && 'status' in value) {
      const envelope = value as Record<string, JsonValue>
      const next = envelope.status
      if (next !== 'available' && !statuses.includes(next as ValueStatus)) throw new TypeError('Invalid canonical assessment.')
      const assessment = next === 'available' ? status : next as ValueStatus
      const refs = Array.isArray(envelope.uncertaintyIds) ? envelope.uncertaintyIds as string[] : ids
      if ('value' in envelope) {
        if (assessment === 'unknown' || assessment === 'unsupported') throw new TypeError('Unavailable canonical value must not be exposed.')
        visit(envelope.value, `${pointer}/value`, assessment, refs)
      } else {
        if (assessment === 'confirmed' || assessment === 'provisional') throw new TypeError('Canonical assessed value is missing.')
        facts.push({ id: `canonical:${pointer}`, value: null, assessment, canonicalPointer: pointer, uncertaintyIds: [...refs] })
      }
      return
    }
    // Aggregate facts inherit uncertainty from affected descendants as well as ancestors.
    // Child facts are assessed independently, so one unknown field does not taint siblings.
    const matching = chart.uncertainties.filter((item) => item.affectedFields.some((path) =>
      pointer === path || pointer.startsWith(`${path}/`) || path.startsWith(`${pointer}/`)))
    let assessment = status
    for (const item of matching) if (rank[item.status] > rank[assessment]) assessment = item.status
    facts.push({ id: `canonical:${pointer}`, value, assessment, canonicalPointer: pointer,
      uncertaintyIds: [...new Set([...ids, ...matching.map(({ id }) => id)])].sort() })
    if (value && typeof value === 'object') {
      for (const key of Object.keys(value).sort()) {
        visit((value as Record<string, JsonValue>)[key], `${pointer}/${escapePointer(key)}`, status, ids)
      }
    }
  }
  for (const position of ['year', 'month', 'day', 'time'] as const) {
    visit(chart.chart.pillars[position], `/chart/pillars/${position}`, 'confirmed')
    visit(chart.chart.basicRelations[position], `/chart/basicRelations/${position}`, 'confirmed')
  }
  visit(chart.greatLuck, '/greatLuck', 'confirmed')
  visit(chart.yearlyLuck, '/yearlyLuck', 'confirmed')
  visit(chart.monthlyLuck, '/monthlyLuck', 'confirmed')
  // Optional legacy fields have no value when unknown; expose explicit non-confirmed facts.
  if (chart.greatLuck.status === 'available' && chart.greatLuck.value.timeUnknown) {
    for (const key of ['startInstant', 'startAgeEquivalentDays', 'boundaryUsed'] as const) {
      if (!(key in chart.greatLuck.value)) facts.push({ id: `canonical:/greatLuck/value/${key}`, value: null,
        assessment: 'unknown', canonicalPointer: `/greatLuck/value/${key}`, uncertaintyIds: ['birth-time-unknown'] })
    }
  }
  return facts.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}
