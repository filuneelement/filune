import type { ChapterId, ReadingPlacement, ReadingSemanticUnit } from './types'
import { compareUnits, makeUnit, uniqueIds, type RoutedUnits } from './semanticUnit'

export function collectReadingUnits(visibleChapters: ReadonlySet<ChapterId>): RoutedUnits {
  const units = new Map<string, ReadingSemanticUnit>()
  const placements = new Map<string, { chapterId: ChapterId; placement: ReadingPlacement }>()
  return {
    add(input, first, ...later) {
      const applicable = [first, ...later].filter(route => visibleChapters.has(route.chapterId))
      if (!applicable.length) return
      const unit = makeUnit(input, [first, ...later])
      const previous = units.get(unit.id)
      if (previous && JSON.stringify(previous) !== JSON.stringify(unit)) {
        throw new TypeError(`Conflicting reading semantic unit: ${unit.id}`)
      }
      units.set(unit.id, unit)
      for (const route of applicable) {
        const key = JSON.stringify([unit.semanticKey, route.role])
        const existing = placements.get(key)
        if (existing && existing.chapterId !== route.chapterId) continue
        placements.set(key, {
          chapterId: route.chapterId,
          placement: {
            unitId: unit.id, role: route.role,
            visibility: route.candidate ? 'candidate' : 'available',
            contextIds: uniqueIds([...(existing?.placement.contextIds ?? []), ...(route.contextIds ?? [])]),
          },
        })
      }
    },
    units: () => [...units.values()].sort(compareUnits),
    placements: chapterId => [...placements.values()].filter(entry => entry.chapterId === chapterId)
      .map(entry => entry.placement)
      .sort((a, b) => compareUnits(units.get(a.unitId)!, units.get(b.unitId)!)),
  }
}
