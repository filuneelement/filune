import type { Validity } from '../judgment/contracts'
import type { PersonalityPeriod } from '../personality/current/types'
import type { UnitRoute } from './chapterRegistry'
import type { ChapterId, ReadingCertainty, ReadingPlacement, ReadingProvenance, ReadingSemanticUnit } from './types'

export const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
export const uniqueIds = (values: readonly string[] = []) => [...new Set(values.filter(Boolean))].sort(compare)

export function bounds(period?: Readonly<Validity | PersonalityPeriod>): readonly [string, string] | undefined {
  if (!period) return undefined
  if ('start' in period) return [period.start, period.end]
  if (period.from.kind === 'exact' && period.to.kind === 'exact') return [period.from.instant, period.to.instant]
  return undefined
}

export function withinPeriod(referenceTime: string | undefined, period?: Readonly<Validity | PersonalityPeriod>): boolean {
  const interval = bounds(period)
  if (!referenceTime || !interval) return false
  const now = Date.parse(referenceTime)
  return Date.parse(interval[0]) <= now && now < Date.parse(interval[1])
}

export type UnitInput = Omit<ReadingSemanticUnit,
  keyof ReadingProvenance | 'id' | 'semanticKey' | 'status' | 'firstOccurrenceChapterId' | 'allowedChapterIds'>
  & Partial<ReadingProvenance>

export function makeUnit(input: UnitInput, routes: readonly [UnitRoute, ...UnitRoute[]]): ReadingSemanticUnit {
  const { meaningRef, period, scope } = input
  const semanticKey = JSON.stringify([meaningRef.producer, meaningRef.kind, scope,
    meaningRef.scopeId ?? null, period?.periodId ?? null, bounds(period) ?? null, meaningRef.recordId])
  return {
    ...input,
    ...(period && { period: structuredClone(period) }),
    id: `reading:${semanticKey}`,
    semanticKey,
    sourceFactIds: uniqueIds(input.sourceFactIds),
    sourceRoleIds: uniqueIds(input.sourceRoleIds),
    sourceEffectIds: uniqueIds(input.sourceEffectIds),
    sourcePersonalityFactIds: uniqueIds(input.sourcePersonalityFactIds),
    sourceConflictIds: uniqueIds(input.sourceConflictIds),
    evidenceIds: uniqueIds(input.evidenceIds),
    status: input.certainty === 'confirmed' ? 'ready'
      : ['contextual', 'conditional', 'provisional'].includes(input.certainty) ? 'partial' : 'deferred',
    firstOccurrenceChapterId: routes[0].chapterId,
    allowedChapterIds: [...new Set(routes.map(route => route.chapterId))],
  }
}

export function compareUnits(a: ReadingSemanticUnit, b: ReadingSemanticUnit): number {
  const order = ['natal', 'daewoon', 'sewoon', 'month', 'day']
  return order.indexOf(a.scope) - order.indexOf(b.scope)
    || compare(bounds(a.period)?.[0] ?? '', bounds(b.period)?.[0] ?? '')
    || compare(a.semanticKey, b.semanticKey)
}

export function activeCertainty(status: 'active' | 'contextual' | 'deferred'): ReadingCertainty {
  return status === 'active' ? 'confirmed' : status
}

export interface RoutedUnits {
  readonly add: (input: UnitInput, first: UnitRoute, ...later: UnitRoute[]) => void
  readonly units: () => ReadingSemanticUnit[]
  readonly placements: (chapter: ChapterId) => ReadingPlacement[]
}
