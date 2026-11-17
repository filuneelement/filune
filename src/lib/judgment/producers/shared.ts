import { serializeCanonical } from '../../canonical/serialization'
import type { ValueStatus } from '../../canonical/types'
import type { JsonValue } from '../types'

export const PRODUCER_ID = 'filune-canonical-contract-facts'
export const PRODUCER_VERSION = '1'
export const PROJECTION_EVIDENCE = 'producer-evidence:canonical-projection'
export const HIDDEN_EVIDENCE = 'producer-evidence:hidden-stems'
export const RELATION_EVIDENCE = 'producer-evidence:relation-existence'
export const HIDDEN_SYSTEM_ID = 'filune-legacy-hidden-stem-role-table-v1'
export const TABLE_REF = 'src/lib/hiddenStemRoleTable.ts:HIDDEN_STEM_ROLE_TABLE'
export function detach<T>(value: T): T {
  const json = serializeCanonical(value)
  function order(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(order)
    if (input !== null && typeof input === 'object') return Object.fromEntries(
      Object.entries(input).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, order(item)]))
    return input
  }
  return order(json) as T
}
export const jsonValue = (value: unknown): JsonValue => serializeCanonical(value) as JsonValue
export const combineAssessment = (...statuses: ValueStatus[]): ValueStatus => {
  // Availability propagation, never a strength/likelihood score.
  if (statuses.includes('unsupported')) return 'unsupported'
  if (statuses.includes('unknown')) return 'unknown'
  return statuses.includes('provisional') ? 'provisional' : 'confirmed'
}
export const sortedUnique = (ids: readonly string[]): string[] => [...new Set(ids)].sort()
export const recordId = (prefix: string, parts: readonly string[]): string => `${prefix}:${JSON.stringify(parts)}`
