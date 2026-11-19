import { chapterRegistry } from './chapterRegistry'
import type { ReadingAssembly, ReadingScope } from './types'

export function validateReadingAssembly(assembly: ReadingAssembly): void {
  const expected = chapterRegistry.filter(entry => entry.access === 'free' || assembly.productScope === 'premium')
  const registered = new Set(chapterRegistry.map(entry => entry.id))
  const units = new Map(assembly.semanticUnits.map(unit => [unit.id, unit]))
  const chapters = new Map(assembly.chapters.map(chapter => [chapter.id, chapter]))
  const seenKeys = new Set<string>()
  const seenEvents = new Set<string>()
  const placed = new Set<string>()
  const occurrences = new Set<string>()
  const assert = (condition: unknown, message: string) => {
    if (!condition) throw new TypeError(`Invalid ReadingAssembly: ${message}`)
  }
  assert(assembly.chapters.map(chapter => chapter.id).join() === expected.map(entry => entry.id).join(), 'chapter order or access')
  assert(units.size === assembly.semanticUnits.length, 'duplicate unit IDs')
  for (const unit of assembly.semanticUnits) {
    assert(!seenKeys.has(unit.semanticKey) && unit.id === `reading:${unit.semanticKey}`, 'duplicate or unstable semantic identity')
    seenKeys.add(unit.semanticKey)
    assert(unit.sourceFactIds.length + unit.sourceRoleIds.length + unit.sourceEffectIds.length + unit.sourcePersonalityFactIds.length > 0,
      'missing semantic provenance')
    assert(unit.scope !== 'day' && (assembly.productScope === 'premium' || unit.scope === 'natal'), 'scope leakage')
    assert(!['inactive', 'stopped', 'expired'].includes(unit.lifecycle ?? ''), 'inactive or expired current unit')
    if (unit.meaningRef.kind === 'luck_effect') {
      const event = unit.meaningRef.recordId
      const projections = unit.effectProjections ?? []
      assert(unit.sourceEffectIds.includes(event) && !seenEvents.has(event), 'duplicate or unreferenced luck event')
      assert(projections.length > 0 && new Set(projections.map(item => item.scopeId)).size === projections.length
        && projections.every(item => item.scope !== 'natal' && item.scope !== 'day'), 'invalid luck effect projections')
      seenEvents.add(event)
    }
    assert(registered.has(unit.firstOccurrenceChapterId) && unit.allowedChapterIds.includes(unit.firstOccurrenceChapterId)
      && unit.allowedChapterIds.every(id => registered.has(id)), 'invalid chapter ID in semantic routing')
  }
  for (const entry of expected) {
    const chapter = chapters.get(entry.id)!
    assert(!chapter.customerRenderable, 'chapter is not yet a customer report')
    const available = new Set(chapter.availableUnitIds)
    for (const placement of chapter.placements) {
      const unit = units.get(placement.unitId)
      if (!unit) throw new TypeError('Invalid ReadingAssembly: unresolved placement')
      assert(unit.allowedChapterIds.includes(chapter.id) && (entry.scopes as readonly ReadingScope[]).includes(unit.scope), 'chapter scope')
      const key = JSON.stringify([unit.semanticKey, placement.role])
      assert(!occurrences.has(key), 'duplicate semantic placement')
      occurrences.add(key)
      placed.add(unit.id)
      assert(placement.role === 'conclusion' ? unit.firstOccurrenceChapterId === chapter.id : placement.contextIds.length > 0,
        'first occurrence or missing later context')
      assert(placement.visibility !== 'available' || available.delete(unit.id), 'available placement mismatch')
    }
    assert(!available.size, 'unresolved available unit')
    for (const selection of chapter.selections) {
      assert(selection.selectionStatus === 'deferred' && !selection.selectedUnitIds.length, 'unsupported selection')
      assert(selection.candidateUnitIds.every(id => chapter.placements.some(placement => placement.unitId === id)), 'unresolved selection candidate')
      assert(chapter.gaps.some(item => item.type === 'selection_rule_missing' && item.id === `${chapter.id}:${selection.kind}`), 'missing selection gap')
    }
  }
  assert(placed.size === units.size, 'unplaced semantic unit')
  assert(!assembly.customerRenderable, 'assembly is not yet a customer report')
  assert(!/"(?:textKo|textJa|textEn|customerText|localeText)"\s*:/u.test(JSON.stringify(assembly)), 'localized text')
}
