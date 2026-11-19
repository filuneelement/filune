import type { CalculatedChart } from '../canonical/types'
import { chapterRegistry, conclusionRoutes } from './chapterRegistry'
import { collectReadingUnits } from './deduplication'
import { chapterGaps, gap, selectionKinds } from './gaps'
import { collectLuck, collectNatalJudgment, scopeNames } from './judgmentUnits'
import { collectCurrentPersonality, collectNatalPersonality } from './personalityUnits'
import { bounds, uniqueIds, type RoutedUnits } from './semanticUnit'
import type { ChapterId, ReadingAssembly, ReadingAssemblyInput, ReadingCertainty, ReadingScope, SelectionKind } from './types'

function collectCanonical(chart: Readonly<CalculatedChart>, input: ReadingAssemblyInput, unknownHour: boolean, out: RoutedUnits) {
  const ids = (pointer: string) => input.judgment?.diagnostics.facts
    .filter(fact => fact.canonicalPointer === pointer).map(fact => fact.id) ?? []
  const add = (pointer: string, certainty: ReadingCertainty, evidenceIds: readonly string[] = []) => {
    const factIds = ids(pointer)
    const recordId = `${chart.context.calculationVersion.id}:${pointer}`
    out.add({
      topic: 'birth', scope: 'natal', certainty, sourceStatus: certainty,
      meaningRef: { producer: 'canonical', kind: 'canonical_value', recordId },
      sourceFactIds: factIds.length ? factIds : [`canonical:${recordId}`], evidenceIds,
    }, conclusionRoutes.birth)
  }
  add('/birthInput/date', 'confirmed')
  if (!unknownHour) add('/birthInput/time', 'confirmed')
  for (const position of ['year', 'month', 'day', 'time'] as const) {
    if (position === 'time' && unknownHour) continue
    const pillar = chart.chart.pillars[position]
    add(`/chart/pillars/${position}`, pillar.status, 'uncertaintyIds' in pillar ? pillar.uncertaintyIds : [])
  }
  const terms = chart.solarTerms.evaluation
  add('/solarTerms/evaluation', terms.status, 'uncertaintyIds' in terms ? terms.uncertaintyIds : [])
}

export function assembleReading(input: ReadingAssemblyInput): ReadingAssembly {
  const { judgment, personality, productScope } = input
  const canonical = input.canonical ?? judgment?.canonical
  const referenceTime = canonical?.context.referenceTime ?? input.referenceTime
  const natal = personality && ('natal' in personality ? personality.natal : personality)
  const current = personality && ('natal' in personality ? personality : undefined)
  const unknownHour = canonical ? !canonical.birthInput.time.known || canonical.chart.pillars.time.status !== 'confirmed'
    : natal?.unavailablePositions.some(position => position.startsWith('hour_')) === true
  const chapters = chapterRegistry.filter(entry => productScope === 'premium' || entry.access === 'free')
  const out = collectReadingUnits(new Set<ChapterId>(chapters.map(entry => entry.id)))
  const snapshots = [...(judgment?.judgmentCore ?? []), ...(input.luckScopes ?? [])]
  const natalSnapshot = snapshots.filter(item => item.scope === 'natal')
  if (new Set(natalSnapshot.map(item => item.id)).size > 1) {
    throw new TypeError('Expected snapshots for one natal judgment')
  }
  if (canonical) collectCanonical(canonical, input, unknownHour, out)
  collectNatalJudgment(natalSnapshot[0], judgment, out)
  const natalIds = natal ? collectNatalPersonality(natal, unknownHour, out) : new Set<string>()
  let historyEffectIds: readonly string[] = []
  if (productScope === 'premium') {
    historyEffectIds = uniqueIds([
      ...collectLuck(input, snapshots, referenceTime, out),
      ...(current?.effectHistory.map(effect => effect.id) ?? []),
    ])
    if (current) collectCurrentPersonality(current, natalIds, referenceTime, out)
  }
  const semanticUnits = out.units()
  const months = semanticUnits.filter(unit => unit.month).map(unit => unit.month!)
  const fullWindow = months.length === 12 && months.every((month, index) =>
    month.startInstant < month.endInstant && (index === 0 || months[index - 1].endInstant === month.startInstant))
  const annualPeriods = new Set(semanticUnits.filter(unit => unit.scope === 'sewoon'
    && unit.meaningRef.kind === 'scope_snapshot').map(unit => JSON.stringify(bounds(unit.period))))
  const units = new Map(semanticUnits.map(unit => [unit.id, unit]))
  const chapterResults = chapters.map(entry => {
    const placements = out.placements(entry.id)
    const gaps = [...chapterGaps.filter(item => item.chapterId === entry.id)]
    if (entry.id === 'F-01' && unknownHour) {
      gaps.push(gap(entry.id, 'unknown-hour', 'source_gap', 'Birth-hour publication is unresolved.', 'B F-①', 'W-97'))
    }
    if (entry.id === 'F-01' && canonical?.solarTerms.ambiguousOnRecordedDate) {
      gaps.push(gap(entry.id, 'solar-term-boundary', 'engine_gap', 'The birth scene requires the solar-term publication gate.', 'B F-①'))
    }
    if (entry.id === 'CH-09' && annualPeriods.size < 2) {
      gaps.push(gap(entry.id, 'sewoon-coverage', 'engine_gap', 'Evaluated snapshots of both years were not supplied.', 'B CH-9'))
    }
    if ((entry.id === 'F-01' || entry.id === 'F-03') && !placements.length) {
      gaps.push(gap(entry.id, 'input', 'engine_gap', 'Source results are unavailable.', `B ${entry.sourceSection}`))
    }
    if (entry.id === 'CH-10' && !fullWindow) {
      gaps.push(gap(entry.id, 'month-window', 'engine_gap', 'Twelve evaluated solar-term months were not supplied.', 'B CH-10'))
    }
    const selections = (selectionKinds[entry.id] ?? []).map(kind => {
      gaps.push(gap(entry.id, kind, 'selection_rule_missing', `No approved selection for ${kind}.`, `B ${entry.sourceSection}`, 'B-6'))
      return {
        kind, selectionStatus: 'deferred' as const, selectedUnitIds: [] as const,
        candidateUnitIds: uniqueIds(placements.filter(item => {
          const unit = units.get(item.unitId)!
          return isSelectionCandidate(kind, unit.topic, item.visibility, unit.meaningRef.kind)
        }).map(item => item.unitId)),
      }
    })
    if (!placements.length && !gaps.length && entry.id !== 'F-LINK') {
      gaps.push(gap(entry.id, 'input', 'engine_gap', 'Source results are unavailable.', `B ${entry.sourceSection}`))
    }
    return {
      id: entry.id, readiness: entry.readiness, placements, gaps, selections,
      availableUnitIds: uniqueIds(placements.filter(item => item.visibility === 'available').map(item => item.unitId)),
      customerRenderable: false as const,
      ...(entry.id === 'F-LINK' && { navigationChapterIds: ['CH-04', 'CH-05', 'CH-06', 'CH-07', 'CH-08', 'CH-10'] as const }),
    }
  })
  const availableScopes = new Set<ReadingScope>([...snapshots, ...(input.evaluatedLuckScopes ?? []).map(item => item.snapshot)]
    .map(item => scopeNames[item.scope]))
  if (canonical || natal) availableScopes.add('natal')
  if (judgment?.luck.monthlyWindow?.length) availableScopes.add('month')
  return {
    version: '1', productScope, ...(productScope === 'premium' && referenceTime && { referenceTime }),
    source: { canonical: Boolean(canonical), judgment: Boolean(judgment || snapshots.length || input.evaluatedLuckScopes?.length),
      personality: Boolean(personality) },
    chapters: chapterResults, semanticUnits,
    gaps: chapterResults.flatMap(entry => entry.gaps),
    engineScopes: (['natal', 'daewoon', 'sewoon', 'month', 'day'] as const).filter(scope =>
      availableScopes.has(scope) && (productScope === 'premium' || scope === 'natal')),
    historyEffectIds, assemblyReady: true, customerRenderable: false,
  }
}

function isSelectionCandidate(kind: SelectionKind, topic: ReadingAssembly['semanticUnits'][number]['topic'],
  visibility: 'available' | 'candidate', meaning: ReadingAssembly['semanticUnits'][number]['meaningRef']['kind']) {
  if (kind === 'best_month' || kind === 'worst_month') return meaning === 'monthly_snapshot' || meaning === 'scope_snapshot'
  if (visibility !== 'candidate') return false
  return kind === 'remember' || topic === (kind === 'core_structure' ? 'structure' : kind)
}
