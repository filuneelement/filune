import { resolveCustomerReadingContext } from './customerContext'
import { projectNatalPersonalityChapters } from './personalityChapterProjection'
import type { CalculatedChart } from '../canonical/types'
import { chapterRegistry, conclusionRoutes } from './chapterRegistry'
import { collectReadingUnits } from './deduplication'
import { chapterGaps, gap, selectionKinds } from './gaps'
import { collectMoneyUnits } from './moneyUnits'
import { collectHealthUnits } from './healthUnits'
import { collectLuck, collectNatalJudgment, scopeNames } from './judgmentUnits'
import { collectCurrentPersonality, collectNatalPersonality } from './personalityUnits'
import { collectRelationshipUnits } from './relationshipUnits'
import { collectEventTimingUnits } from './eventTimingUnits'
import { buildStructuralExplanationUnits, collectStructuralInterpretation } from './structuralExplanation'
import { evaluateOutcomePublicationEligibility } from './publicationEligibility'
import { bounds, compare, intersectValidity, uniqueIds, withinPeriod, type RoutedUnits } from './semanticUnit'
import type { Validity } from '../judgment/contracts'
import type { LuckScopeState } from '../judgment/core/luckScope'
import type { ChapterId, ReadingAssembly, ReadingAssemblyInput, ReadingCertainty, ReadingScope, SelectionKind, TemporalSnapshot } from './types'

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

const byId = <T extends { readonly id: string }>(items: readonly T[]) =>
  [...items].sort((a, b) => compare(a.id, b.id))
const sortedFacts = <T extends { readonly id: string }>(items?: readonly T[]) => items && byId(items)

function temporalProjection(snapshot: NonNullable<ReadingAssemblyInput['luckScopes']>[number]): TemporalSnapshot {
  return {
    id: snapshot.id, scope: snapshot.scope, parentScopeId: snapshot.parentScopeId, validity: snapshot.validity,
    structuralSuccess: snapshot.structuralSuccess,
    stemFacts: byId(snapshot.stemFacts), patternFacts: byId(snapshot.patternFacts),
    branchFacts: byId(snapshot.branchFacts), formationFacts: byId(snapshot.formationFacts),
    formationBranchPool: byId(snapshot.formationBranchPool),
    runtime: [...snapshot.runtime].sort((a, b) => compare(a.entityId, b.entityId)),
    actualFunctions: [...snapshot.actualFunctions].sort((a, b) => compare(a.relationFactId, b.relationFactId)),
    inheritedRoleFunctions: [...snapshot.inheritedRoleFunctions].sort((a, b) => compare(a.fact.id, b.fact.id)),
  }
}

export function assembleReading(input: ReadingAssemblyInput): ReadingAssembly {
  const { judgment, personality, productScope } = input
  const customerReadingContext = resolveCustomerReadingContext(input.customerContext)
  const canonical = input.canonical ?? judgment?.canonical
  const referenceTime = canonical?.context.referenceTime ?? input.referenceTime
  const natal = personality && ('natal' in personality ? personality.natal : personality)
  const current = personality && ('natal' in personality ? personality : undefined)
  const unknownHour = canonical ? !canonical.birthInput.time.known || canonical.chart.pillars.time.status !== 'confirmed'
    : natal?.unavailablePositions.some(position => position.startsWith('hour_')) === true
  const chapters = chapterRegistry.filter(entry => productScope === 'premium' || entry.access === 'free')
  const out = collectReadingUnits(new Set<ChapterId>(chapters.map(entry => entry.id)))
  const raw = [...(judgment?.judgmentCore ?? []), ...(input.luckScopes ?? [])]
  const monthsEvaluated = judgment?.luck.monthlyWindow ?? []
  const evaluatedAncestors = (input.evaluatedLuckScopes ?? []).flatMap(item => item.publicationAncestors ?? [])
  const byScope = new Map([...raw, ...(input.evaluatedLuckScopes ?? [])
    .flatMap(item => [...(item.publicationAncestors ?? []), item.snapshot]),
    ...monthsEvaluated.flatMap(month => [...(month.publicationAncestors ?? []), ...(month.judgmentCore ? [month.judgmentCore] : [])])]
    .map(snapshot => [snapshot.id, snapshot]))
  function publicationValidity(scopeId: string, period: Validity) {
    let scope = byScope.get(scopeId)
    const seen = new Set([scopeId])
    while (scope && (scope.scope === 'monthlyLuck' || scope.scope === 'yearlyLuck' || scope.scope === 'dailyLuck')) {
      const parentId = scope.parentScopeId
      if (!parentId || seen.has(parentId)) return undefined
      seen.add(parentId)
      const parent = byScope.get(parentId)
      if (!parent || parent.scope === 'natal') return parent ? period : undefined
      const overlap = intersectValidity(period, parent.validity)
      if (!overlap) return undefined
      period = overlap
      scope = parent
    }
    return period
  }
  const publicSnapshot = (snapshot: LuckScopeState) => {
    const validity = publicationValidity(snapshot.id, snapshot.validity)
    return validity ? [{ ...snapshot, validity }] : []
  }
  const snapshots = raw.flatMap(publicSnapshot)
  const adjacent = (input.evaluatedLuckScopes ?? []).flatMap(({ snapshot, evaluatedAt }) =>
    publicSnapshot(snapshot).filter(snapshot => withinPeriod(evaluatedAt, snapshot.validity)))
  const windows = monthsEvaluated.flatMap(month => month.judgmentCore
    ? publicSnapshot(month.judgmentCore).filter(snapshot => withinPeriod(month.referenceTime, snapshot.validity)) : [])
  const explanationSnapshots = [...snapshots, ...adjacent, ...windows]
  function scopedFacts<T extends { readonly scopeId: string; readonly period?: Validity }>(facts?: readonly T[]) {
    return facts?.flatMap(fact => {
      if (!fact.period) return [fact]
      const period = publicationValidity(fact.scopeId, fact.period)
      return period ? [{ ...fact, period }] : []
    })
  }
  input = { ...input, moneyOutcomes: scopedFacts(input.moneyOutcomes), healthOutcomes: scopedFacts(input.healthOutcomes),
    relationshipOutcomes: scopedFacts(input.relationshipOutcomes), workStudyOutcomes: scopedFacts(input.workStudyOutcomes),
    transitionOutcomes: scopedFacts(input.transitionOutcomes), eventTimingFacts: scopedFacts(input.eventTimingFacts) }
  const natalSnapshot = snapshots.filter(item => item.scope === 'natal')
  if (new Set(natalSnapshot.map(item => item.id)).size > 1) {
    throw new TypeError('Expected snapshots for one natal judgment')
  }
  if (canonical) collectCanonical(canonical, input, unknownHour, out)
  collectNatalJudgment(natalSnapshot[0], judgment, out)
  const natalIds = natal ? collectNatalPersonality(natal, unknownHour, out) : new Set<string>()
  let historyEffectIds: readonly string[] = []
  if (productScope === 'premium') {
    if (judgment && natalSnapshot[0]) collectStructuralInterpretation(natalSnapshot[0], snapshots,
      adjacent, windows, referenceTime, out, new Map(evaluatedAncestors.map(snapshot => [snapshot.id, snapshot])))
    historyEffectIds = uniqueIds([
      ...collectLuck(input, snapshots, referenceTime, out),
      ...(current?.effectHistory.map(effect => effect.id) ?? []),
    ])
    collectRelationshipUnits(input.relationshipOutcomes ?? [], referenceTime, out, input.publicationConditions)
    collectHealthUnits(input.healthOutcomes ?? [], referenceTime, out, input.publicationConditions)
    collectMoneyUnits(input.moneyOutcomes ?? [], referenceTime, out, input.publicationConditions)
    for (const fact of input.workStudyOutcomes ?? []) {
      const eligibility = evaluateOutcomePublicationEligibility(fact, { triggerConfirmed: true, evidenceIds: fact.publicationEvidenceIds })
      if (!eligibility.publishable || (fact.scope === 'natal' ? fact.temporalStatus !== 'baseline'
        : fact.temporalStatus !== 'current' || !referenceTime || !withinPeriod(referenceTime, fact.period))) continue
      out.add({ topic: fact.domain, scope: fact.scope, certainty: fact.certainty, sourceStatus: fact.temporalStatus,
        lifecycle: fact.lifecycle, direction: fact.direction, period: fact.period,
        publicationQualification: { kind: eligibility.qualification, evidenceIds: eligibility.evidenceIds },
        meaningRef: { producer: 'outcome', kind: 'outcome_fact', recordId: fact.id, scopeId: fact.scopeId },
        sourceFactIds: [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds],
        sourceRoleIds: fact.sourceRoleIds, sourceEffectIds: fact.sourceLuckEffectIds,
        evidenceIds: [...fact.provenance, ...eligibility.evidenceIds],
      }, { chapterId: 'CH-04', role: 'conclusion' })
    }
    collectEventTimingUnits(input.eventTimingFacts ?? [], referenceTime, out)
    if (current) collectCurrentPersonality(current, natalIds, referenceTime, out)
  }
  const explanationOutcomes = productScope === 'premium'
    ? [...(input.moneyOutcomes ?? []), ...(input.relationshipOutcomes ?? []), ...(input.workStudyOutcomes ?? [])] : []
  const structuralExplanationUnits = buildStructuralExplanationUnits(explanationOutcomes, explanationSnapshots)
  const explanationIdsByOutcome = new Map<string, string[]>()
  for (const explanation of structuralExplanationUnits) {
    const ids = explanationIdsByOutcome.get(explanation.outcomeFactId) ?? []
    ids.push(explanation.id)
    explanationIdsByOutcome.set(explanation.outcomeFactId, ids)
  }
  const semanticUnits = out.units().map(unit => {
    const explanationIds = explanationIdsByOutcome.get(unit.meaningRef.recordId)
    return explanationIds?.length ? { ...unit, structuralExplanationUnitIds: [...explanationIds].sort(compare) } : unit
  })
  const months = semanticUnits.filter(unit => unit.month).map(unit => unit.month!)
  const fullWindow = months.length === 12 && months.every((month, index) =>
    month.startInstant < month.endInstant && (index === 0 || months[index - 1].endInstant === month.startInstant))
  const annualPeriods = new Set(semanticUnits.filter(unit => unit.scope === 'sewoon'
    && unit.meaningRef.kind === 'scope_snapshot').map(unit => JSON.stringify(bounds(unit.period))))
  const eventTimingAvailable = (input.eventTimingFacts?.length ?? 0) > 0
  const units = new Map(semanticUnits.map(unit => [unit.id, unit]))
  const chapterResults = chapters.map(entry => {
    const placements = out.placements(entry.id)
    const relationshipEnabled = entry.id === 'CH-06' && input.relationshipOutcomes !== undefined
    const healthEnabled = entry.id === 'CH-07' && input.healthOutcomes !== undefined
    const moneyEnabled = entry.id === 'CH-05' && input.moneyOutcomes !== undefined
    const workEnabled = entry.id === 'CH-04' && input.workStudyOutcomes !== undefined
    const gaps = [...chapterGaps.filter(item => item.chapterId === entry.id && !relationshipEnabled && !healthEnabled && !moneyEnabled && !workEnabled)]
    if (workEnabled && !placements.length) gaps.push(gap(entry.id, 'work-study-target', 'source_gap',
      'No verified work or learning target was linked to a currently qualifying path.', 'Master 21'))
    if (moneyEnabled && !eventTimingAvailable) {
      gaps.push(gap(entry.id, 'money-coverage', 'source_gap',
        'Contract, business, spending and collaboration timing remains deferred.', 'B CH-5', 'OUT-MONEY-06'))
    }
    if (moneyEnabled && eventTimingAvailable) {
      gaps.push(gap(entry.id, 'money-coverage', 'source_gap',
        'Spending and collaboration timing remain deferred; contract and business timing is available only for mapped event evidence.',
        'B CH-5', 'OUT-MONEY-06', 'Master 15 §6A'))
    }
    if (healthEnabled) {
      gaps.push(gap(entry.id, 'health-coverage', 'source_gap',
        'Independent attention relief timing remains deferred.', 'B CH-7', 'OUT-HEALTH-02'))
      if (!placements.length) gaps.push(gap(entry.id, 'health-input', 'engine_gap',
        'Evaluated Health facts are unavailable.', 'OUT-HEALTH-01', 'OUT-HEALTH-02'))
    }
    if (relationshipEnabled) {
      gaps.push(gap(entry.id, 'relationship-coverage', 'source_gap',
        'Relationship development and commitment timing remain deferred.', 'B CH-6', 'OUT-REL-03', 'OUT-REL-05'))
      if (!placements.length) gaps.push(gap(entry.id, 'relationship-input', 'engine_gap',
        'Evaluated relationship facts are unavailable.', 'OUT-REL-01', 'OUT-REL-02'))
    }
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
      id: entry.id, readiness: relationshipEnabled || healthEnabled || moneyEnabled || workEnabled ? 'partial' as const : entry.readiness, placements, gaps, selections,
      availableUnitIds: uniqueIds(placements.filter(item => item.visibility === 'available').map(item => item.unitId)),
      customerRenderable: false as const,
      ...(entry.id === 'F-LINK' && { navigationChapterIds: ['CH-04', 'CH-05', 'CH-06', 'CH-07', 'CH-08', 'CH-10'] as const }),
    }
  })
  const availableScopes = new Set<ReadingScope>([...snapshots, ...(input.evaluatedLuckScopes ?? []).map(item => item.snapshot)]
    .map(item => scopeNames[item.scope]))
  if (canonical || natal) availableScopes.add('natal')
  if (judgment?.luck.monthlyWindow?.length) availableScopes.add('month')
  const temporalSnapshots = productScope === 'premium' ? [
    ...snapshots.filter(snapshot => snapshot.scope === 'natal' || (referenceTime && withinPeriod(referenceTime, snapshot.validity))),
    ...adjacent, ...windows,
  ] : []
  const comparisonSnapshots = byId([...new Set(temporalSnapshots)].filter(snapshot => snapshot.runtimeStatus === 'resolved')
    .map(temporalProjection))

  return {
    structuralExplanationUnits,
    ...(productScope === 'premium' && input.publicationConditions && { publicationConditions: Object.fromEntries(Object.entries(input.publicationConditions)
      .sort(([a], [b]) => compare(a, b)).map(([id, condition]) => [id, {
        triggerConfirmed: condition.triggerConfirmed, evidenceIds: uniqueIds(condition.evidenceIds),
      }])) }),
    ...(productScope === 'premium' && { temporalSnapshots: comparisonSnapshots,
      transitionOutcomes: sortedFacts(input.transitionOutcomes), temporalMoneyOutcomes: sortedFacts(input.moneyOutcomes),
      temporalRelationshipOutcomes: sortedFacts(input.relationshipOutcomes), temporalHealthOutcomes: sortedFacts(input.healthOutcomes) }),
    ...(productScope === 'premium' && input.workStudyOutcomes && { workStudyOutcomes: sortedFacts(input.workStudyOutcomes) }),
    version: '1', productScope,
    ...(Object.keys(customerReadingContext).length > 0 && { customerReadingContext }),
    ...(natal && { natalPersonalityChapters: projectNatalPersonalityChapters(natal, unknownHour) }), ...(productScope === 'premium' && referenceTime && { referenceTime }),
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
