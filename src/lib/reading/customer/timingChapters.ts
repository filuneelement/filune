import type { HealthOutcomeFact, MoneyOutcomeFact } from '../../outcome'
import type { WorkStudyOutcomeFact } from '../../outcome/workStudy'
import { relationshipComparisonUnitInput } from '../relationshipUnits'
import { moneyComparisonUnitInput } from '../moneyUnits'
import { bounds, compare, makeUnit, uniqueIds, withinPeriod } from '../semanticUnit'
import type { ReadingAssembly, ReadingSemanticUnit, TemporalSnapshot } from '../types'
import { mapMoney, mapRelationship, outcomeMeaningKey, type CustomerOutcome } from './outcomeMapping'
import { customerChapterTitleKeys, type CustomerChapterPlan, type CustomerReadingParagraphPlan, type OutcomeVoice } from './types'

export type TimingChapterRole = 'current_change' | 'long_term_transition' | 'opportunity_window' | 'caution_window'
type TimingId = 'CR-04' | 'CR-08' | 'CR-09'
type WindowRole = 'opportunity_window' | 'caution_window'
type TemporalStatus = 'past' | 'current' | 'upcoming' | 'future' | 'expired'
type ChangeType = 'burden_ended' | 'new_activation' | 'strengthening' | 'weakening' | 'direction_change' | 'protection_change' | 'burden_change' | 'suppression' | 'release'
export interface TemporalQuality {
  baselineCoverage?: number
  currentCoverage?: number
  changeCount?: number
  evaluatedPairCount?: number
  transitionCount?: number
  unknownSideCount?: number
  timingWindowCount?: number
  opportunityCount?: number
  cautionCount?: number
}
type TimingOutcome = CustomerOutcome | HealthOutcomeFact | WorkStudyOutcomeFact
type Voice = 'healthPressure' | 'workSupport' | 'workPressure' | 'studySupport' | 'studyPressure'
  | OutcomeVoice | NonNullable<ReadingSemanticUnit['eventType']>
interface Observation {
  readonly unit: ReadingSemanticUnit
  readonly fact?: TimingOutcome
  readonly voice: Voice
  readonly mappingId: string
  readonly mechanism: string
  readonly target: string
  readonly key: string
  readonly windowRole?: WindowRole
}
export interface TemporalActivation {
  readonly semanticUnitId: string
  readonly sourceId: string
  readonly voice: Voice
  readonly role: TimingChapterRole
  readonly scope: ReadingSemanticUnit['scope']
  readonly certainty: ReadingSemanticUnit['certainty']
  readonly periodRef?: string
  readonly interval?: readonly [string, string]
  readonly meaning: string
  readonly target: string
  readonly mechanism: string
  readonly direction?: string
  readonly lifecycle?: string
}

/** Calendar windows qualify a claim without creating another life meaning. */
export function timingClaimIdentity(value: TemporalContribution) {
  const claim = (item: TemporalActivation) => [
    item.voice, item.target, item.mechanism, item.direction, item.lifecycle, item.certainty,
  ]
  return JSON.stringify(['time', value.change, value.before && claim(value.before),
    [...new Set(value.activations.map(item => JSON.stringify(claim(item))))].sort()])
}
export interface TimingCard {
  readonly periodRef: string
  readonly startsAt: string
  readonly endsBefore: string
  readonly target: string
  readonly scope: ReadingSemanticUnit['scope']
  readonly status: TemporalStatus
  readonly opportunity: readonly TemporalContribution[]
  readonly caution: readonly TemporalContribution[]
}

type ComparedSnapshot = { readonly snapshotId: string; readonly periodRef?: string; readonly interval?: readonly [string, string] }
type EvaluatedPair = readonly [ComparedSnapshot, ComparedSnapshot]

export interface TemporalContribution {
  readonly role: TimingChapterRole
  readonly status?: TemporalStatus
  readonly origin: 'outcome_activation' | 'event_timing' | 'comparison'
  readonly change?: ChangeType
  readonly before?: TemporalActivation
  readonly boundary?: string
  readonly structuralEvidenceIds?: readonly string[]
  readonly evaluatedPair?: EvaluatedPair
  readonly additionalEvaluatedPairs?: readonly EvaluatedPair[]
  readonly significance?: 'major' | 'meaningful' | 'minor'
  readonly activations: readonly TemporalActivation[]
}

const events = {
  contract_favorable: 'opportunity_window',
  contract_delay: 'caution_window',
  contract_process_trouble: 'caution_window',
  contract_termination_or_restructure: 'caution_window',
  business_start_favorable: 'opportunity_window',
  business_start_delay: 'caution_window',
  business_expansion_favorable: 'opportunity_window',
  business_adjustment: 'caution_window',
  business_restructure: 'caution_window',
} as const
const windows: Partial<Record<OutcomeVoice, WindowRole>> = {
  earning: 'opportunity_window', formation: 'opportunity_window',
  retention: 'caution_window', capacity: 'caution_window', divisionRetention: 'caution_window',
  sustainability: 'caution_window', division: 'caution_window', pressure: 'caution_window',
  supportPressure: 'caution_window', relationshipPressure: 'caution_window',
}
const scopeOrder = ['natal', 'daewoon', 'sewoon', 'month']
const date = Date.parse
const valid = (unit: ReadingSemanticUnit) => {
  const interval = bounds(unit.period)
  return unit.status !== 'deferred' && unit.evidenceIds.length > 0 && scopeOrder.includes(unit.scope)
    && (unit.scope === 'natal' || Boolean(unit.period?.periodId && interval && date(interval[0]) < date(interval[1])))
}
const money = (fact?: TimingOutcome): fact is MoneyOutcomeFact => fact?.domain === 'money'
const health = (fact: TimingOutcome): fact is HealthOutcomeFact => fact.domain === 'health'
const provenance = (units: readonly ReadingSemanticUnit[]) => ({
  sourceFactIds: uniqueIds(units.flatMap(unit => unit.sourceFactIds)),
  sourceRoleIds: uniqueIds(units.flatMap(unit => unit.sourceRoleIds)),
  sourceEffectIds: uniqueIds(units.flatMap(unit => unit.sourceEffectIds)),
  sourcePersonalityFactIds: [],
  sourceConflictIds: [],
  evidenceIds: uniqueIds(units.flatMap(unit => unit.evidenceIds)),
})

function observe(unit: ReadingSemanticUnit, fact?: TimingOutcome): Observation[] {
  if (!valid(unit)) return []
  if (unit.meaningRef.kind === 'event_timing_fact' && unit.eventType && Object.hasOwn(events, unit.eventType)) {
    const event = unit.eventType as keyof typeof events
    const target = event.startsWith('contract_') ? 'contract' : event.split('_').slice(0, 2).join('_')
    // Event evidence has no reusable actor/target identity across periods.
    return [{ unit, voice: event, mappingId: 'CL-E01', mechanism: event, target,
      key: JSON.stringify([event, unit.meaningRef.recordId]), windowRole: events[event] }]
  }
  if (!fact || !['active', 'reduced'].includes(fact.lifecycle)) return []
  if ('publicationEvidenceIds' in fact) {
    if (unit.publicationQualification?.kind !== 'conditional' || !fact.sourceRelationIds.length) return []
    const support = fact.direction === 'favorable'
    return [{ unit, fact, voice: fact.domain === 'work' ? support ? 'workSupport' : 'workPressure' : support ? 'studySupport' : 'studyPressure',
      mappingId: fact.mappingId, mechanism: fact.semanticType, target: fact.target.targetId,
      key: JSON.stringify([fact.domain, fact.semanticType, fact.target.targetId, fact.target.entityId, fact.direction]) }]
  }
  if (health(fact)) {
    if (fact.semanticType !== 'health_attention_period' || unit.scope === 'natal'
      || !fact.provenance.includes('OUT-HEALTH-02') || !fact.sourceRelationIds.length
      || !fact.targetEntityId || !fact.lifeMeanings.some(meaning => meaning.type === 'health_management_period')) return []
    return [{ unit, fact, voice: 'healthPressure', mappingId: 'CL-H03', mechanism: fact.path, target: fact.targetEntityId,
      key: JSON.stringify([fact.domain, fact.semanticType, fact.path, fact.targetEntityId, fact.direction]), windowRole: 'caution_window' }]
  }
  const mapping = money(fact) ? mapMoney(fact) : mapRelationship(fact)
  if (!mapping) return []
  const target = money(fact) ? JSON.stringify([fact.wealthEntityId, fact.burdenPath?.affectedEntityId]) : 'close_relationship'
  const direction = money(fact) ? fact.direction : undefined
  return [{ unit, fact, voice: mapping.slots.includes('earning') ? 'earning' : mapping.voice, mappingId: mapping.id, mechanism: mapping.mechanism, target,
    key: JSON.stringify([fact.domain, outcomeMeaningKey(fact), target, mapping.mechanism, direction]),
    windowRole: mapping.slots.includes('earning') ? 'opportunity_window' : windows[mapping.voice] }]
}

function activation(item: Observation, role: TimingChapterRole): TemporalActivation {
  const { unit } = item
  return {
    semanticUnitId: unit.id, sourceId: unit.meaningRef.recordId, voice: item.voice, role, scope: unit.scope,
    certainty: unit.certainty, periodRef: unit.period?.periodId, interval: bounds(unit.period),
    meaning: item.key, target: item.target, mechanism: item.mechanism, direction: unit.direction ?? unit.eventDirection, lifecycle: unit.lifecycle,
  }
}

function matchingStructuralPath(snapshot: TemporalSnapshot, fact: MoneyOutcomeFact) {
  const relation = [...snapshot.stemFacts, ...snapshot.patternFacts].find(item =>
    'money-condition:' + JSON.stringify([item.action, item.source.id, item.target.id]) === fact.conditionId)
  if (!relation) return undefined
  const actual = snapshot.actualFunctions.find(value => value.relationFactId === relation.id)
    ?? snapshot.inheritedRoleFunctions.find(value => value.fact.id === relation.id)?.actual
  return actual && { actual, relation }
}

function comparePath(from: TemporalSnapshot, to: TemporalSnapshot, item: Observation, prior: readonly Observation[]) {
  const fact = item.fact
  if (!fact) return undefined
  if (health(fact)) {
    if (fact.semanticType !== 'health_attention_period') return undefined
    const relation = to.stemFacts.find(value => fact.sourceRelationIds.includes(value.id)
      && [value.source, value.target].some(entity => entity.scope === to.scope
        && !from.runtime.some(({ entityId }) => entityId === entity.id)))
    return relation ? { change: 'burden_change' as const, before: prior.find(candidate => candidate.key === item.key),
      structuralEvidenceIds: [relation.id] } : undefined
  }
  if (!money(fact)) {
    const priorEntities = new Set([...from.runtime.map(item => item.entityId), ...from.formationBranchPool.map(item => item.id)])
    const localBranch = [...to.branchFacts, ...to.formationFacts].some(relation => fact.sourceRelationIds.includes(relation.id)
      && relation.participants.some(id => !priorEntities.has(id)
        && to.formationBranchPool.some(entity => entity.id === id && entity.scope === to.scope)))
    const localStem = to.stemFacts.some(relation => fact.sourceRelationIds.includes(relation.id)
      && [relation.source, relation.target].some(entity => entity.scope === to.scope && !priorEntities.has(entity.id)))
    if (!localBranch && !localStem) return undefined
    return { change: 'new_activation' as const, before: prior.find(candidate => candidate.key === item.key) }
  }
  const oldPath = matchingStructuralPath(from, fact)
  const newPath = matchingStructuralPath(to, fact)
  const oldBlock = oldPath?.actual.structuralEffect?.blockedBy
  if (oldBlock && newPath?.actual.structuralEffect?.currentlyEffective && item.voice !== 'protection') {
    return { change: 'release' as const, before: undefined,
      structuralEvidenceIds: uniqueIds([oldPath.relation.id, newPath.relation.id, ...oldBlock.evidenceRefs]) }
  }
  const previous = prior.find(candidate => money(candidate.fact) && candidate.fact.conditionId === fact.conditionId
    && candidate.fact.wealthEntityId === fact.wealthEntityId
    && candidate.fact.semanticType === fact.semanticType)
  if (previous && money(previous.fact)) {
    if (previous.fact.direction !== fact.direction) return {
      before: previous,
      change: (previous.voice === 'protection' || item.voice === 'protection' ? 'protection_change' : 'direction_change') as ChangeType,
    }
    if (previous.key === item.key && previous.fact.lifecycle !== fact.lifecycle) return {
      before: previous, change: (fact.lifecycle === 'reduced' ? 'weakening' : 'strengthening') as ChangeType,
    }
  }
  const currentPath = [...to.stemFacts, ...to.patternFacts].find(relation => fact.sourceRelationIds.includes(relation.id)
    && fact.sourceParticipantIds.includes(relation.source.id) && fact.sourceParticipantIds.includes(relation.target.id)
    && [relation.source, relation.target].some(entity => entity.scope === to.scope
      && !from.runtime.some(({ entityId }) => entity.id === entityId)))
  if (!currentPath || previous) return undefined
  const before = prior.find(candidate => candidate.key === item.key)
  return { before, change: (fact.semanticType === 'money_related_problem' ? 'burden_change' : 'new_activation') as ChangeType }
}

function suppression(from: TemporalSnapshot, to: TemporalSnapshot, before: Observation) {
  if (!money(before.fact) || before.voice === 'protection') return undefined
  const previous = matchingStructuralPath(from, before.fact)
  const next = matchingStructuralPath(to, before.fact)
  const block = next?.actual.structuralEffect?.blockedBy
  if (!previous?.actual.structuralEffect?.currentlyEffective || !block || !next || !block.evidenceRefs.length) return undefined
  const scope = to.scope === 'greatLuck' ? 'daewoon' : to.scope === 'yearlyLuck' ? 'sewoon' : 'month'
  const ids = uniqueIds([previous.relation.id, next.relation.id, ...block.evidenceRefs])
  const unit = makeUnit({
    topic: 'money', scope, certainty: before.unit.certainty, lifecycle: 'stopped', sourceStatus: 'evaluated',
    meaningRef: { producer: 'judgment', kind: 'structural_function', recordId: next.relation.id, scopeId: to.id },
    period: to.validity, sourceFactIds: [to.id, next.relation.id], evidenceIds: ids,
  }, [{ chapterId: scope === 'daewoon' ? 'CH-08' : 'CH-09', role: 'evidence' }])
  return { item: { ...before, fact: undefined, unit }, change: before.unit.moneyAxis === 'burden'
    ? 'burden_ended' as const : 'suppression' as const, structuralEvidenceIds: ids }
}

const encloses = (outer: Observation, inner: Observation) => {
  const a = bounds(outer.unit.period)
  const b = bounds(inner.unit.period)
  return a && b && outer.key === inner.key && scopeOrder.indexOf(outer.unit.scope) < scopeOrder.indexOf(inner.unit.scope)
    && date(a[0]) <= date(b[0]) && date(a[1]) >= date(b[1])
}
const scopeDiff = (a: Observation, b: Observation) => scopeOrder.indexOf(a.unit.scope) - scopeOrder.indexOf(b.unit.scope)
const intervalOrder = (a: Observation, b: Observation) =>
  date(bounds(a.unit.period)![0]) - date(bounds(b.unit.period)![0]) || scopeDiff(a, b) || compare(a.unit.id, b.unit.id)

export function buildTimingChapters(assembly: ReadingAssembly, facts: readonly CustomerOutcome[],
  used: Map<string, ReadingSemanticUnit>, referenceTime?: string): CustomerChapterPlan[] {
  const now = date(referenceTime ?? '')
  const byId = new Map([...facts, ...(assembly.temporalHealthOutcomes ?? []), ...(assembly.workStudyOutcomes ?? [])]
    .map(fact => [fact.id, fact]))
  const observations = assembly.semanticUnits.flatMap(unit => observe(unit, byId.get(unit.meaningRef.recordId)))
    .sort((a, b) => compare(a.unit.id, b.unit.id))
  const snapshots = [...new Set(assembly.temporalSnapshots ?? [])].sort((a, b) => compare(a.id, b.id))
  const snapshot = (id?: string | null) => {
    const matches = snapshots.filter(value => value.id === id)
    return matches.length === 1 ? matches[0] : undefined
  }
  // Independently evaluated periods are routed through the timing chapter.
  // They do not alter the current Money or Relationship chapters.
  const published = new Set(observations.map(({ unit }) => unit.meaningRef.recordId))
  const evaluatedYearIds = new Set(assembly.semanticUnits.flatMap(unit =>
    unit.scope === 'sewoon' && unit.structuralInterpretation?.kind === 'axis'
      && unit.structuralInterpretation.evaluatedWindow ? [unit.meaningRef.scopeId] : []))
  const comparisonOnly = [...facts, ...(assembly.transitionOutcomes ?? [])].flatMap(fact => {
    const evaluated = snapshot(fact.scopeId)
    const interval = bounds(fact.period)
    const condition = assembly.publicationConditions?.[fact.id]
    const nextYear = fact.scope === 'sewoon' && fact.temporalStatus === 'future' && evaluatedYearIds.has(fact.scopeId)
      && (fact.lifecycle === 'active' || fact.lifecycle === 'reduced') && fact.certainty !== 'deferred'
    if (published.has(fact.id) || (fact.scope !== 'daewoon' && !nextYear) || !evaluated || !interval
      || JSON.stringify(interval) !== JSON.stringify(bounds(evaluated.validity))
      || (fact.certainty === 'conditional' && (!condition?.triggerConfirmed || !condition.evidenceIds.length))
      || !['future', 'expired'].includes(fact.temporalStatus)) return []
    const unit = money(fact) ? moneyComparisonUnitInput(fact) : relationshipComparisonUnitInput(fact)
    return observe(makeUnit(unit, [{ chapterId: money(fact) ? 'CH-05' : 'CH-06', role: 'conclusion' }]), fact)
  })
  const comparables = [...observations, ...comparisonOnly].filter(({ fact }) =>
    fact && (!money(fact) || fact.semanticType !== 'money_generation_method'))
    .sort((a, b) => compare(a.unit.id, b.unit.id))
  const current = observations.filter(({ unit, fact }) =>
    unit.scope !== 'natal' && unit.sourceStatus === 'current' && fact
    && (!money(fact) || fact.semanticType !== 'money_generation_method')
    && withinPeriod(referenceTime, unit.period)).sort((a, b) => scopeDiff(a, b) || intervalOrder(a, b))

  const displayed = new Set<string>()
  const paragraphs: Record<TimingId, CustomerReadingParagraphPlan[]> = { 'CR-04': [], 'CR-08': [], 'CR-09': [] }
  function add(chapterId: TimingId, role: TimingChapterRole, items: readonly Observation[],
    details: Partial<Omit<TemporalContribution, 'role' | 'activations' | 'origin'>> = {}, before?: Observation,
    comparedSnapshots?: readonly [TemporalSnapshot, TemporalSnapshot],
    nestedPairs: readonly (readonly [TemporalSnapshot, TemporalSnapshot])[] = []) {
    const main = items[0]
    const origin = chapterId !== 'CR-09' ? 'comparison' : main.fact ? 'outcome_activation' : 'event_timing'
    const activations = items.map(item => activation(item, role))
    // Multiple structural entities can share one customer-readable function.
    // Keep exact targets separate and select one representative for identical copy.
    const displayKey = JSON.stringify([chapterId, role, details.change, details.boundary, details.status, before?.voice,
      items.map(item => [item.voice, item.voice === 'earning' ? item.mechanism : undefined, item.unit.scope, bounds(item.unit.period)]),
      [...items, ...(before ? [before] : [])].some(item => item.unit.certainty !== 'confirmed')])
    if (displayed.has(displayKey)) return
    displayed.add(displayKey)
    const source = [...(before ? [before] : []), ...items]
    const refs = source.map(item => item.unit)
    refs.forEach(unit => used.set(unit.id, unit))
    const ids = uniqueIds(refs.map(unit => unit.id))
    const describe = (value: TemporalSnapshot) => value.scope === 'natal' ? { snapshotId: value.id }
      : { snapshotId: value.id, periodRef: value.validity.periodId, interval: bounds(value.validity) }
    const describePair = (pair: readonly [TemporalSnapshot, TemporalSnapshot]): EvaluatedPair => [describe(pair[0]), describe(pair[1])]
    const evaluatedPair = comparedSnapshots && describePair(comparedSnapshots)
    const additionalEvaluatedPairs = nestedPairs.map(describePair)
    const sources = provenance(refs)
    const key = JSON.stringify([role, details.change, details.boundary, main.key, main.unit.scope, main.unit.period?.periodId, bounds(main.unit.period)])
    paragraphs[chapterId].push({
      ...sources,
      sourceFactIds: uniqueIds([...sources.sourceFactIds, ...(details.structuralEvidenceIds ?? []), ...[...(comparedSnapshots ?? []), ...nestedPairs.flat()].map(value => value.id)]),
      id: `${chapterId}:${key}`, chapterId, purpose: chapterId === 'CR-09' ? 'timing' : details.change ? 'contrast' : 'conclusion',
      slots: [role, ...(details.change ? [details.change] : [])], scope: main.unit.scope, periodRef: main.unit.period?.periodId,
      certainty: refs.find(unit => unit.certainty !== 'confirmed')?.certainty ?? main.unit.certainty,
      semanticUnitIds: ids, sourceOutcomeIds: uniqueIds(source.flatMap(item => item.fact ? [item.fact.id] : [])),
      sourceMappingIds: uniqueIds(source.map(item => item.mappingId)), lifeMechanismIds: uniqueIds(source.map(item => item.mechanism)),
      contextKeys: [], contributionKeys: [key], causeAvailable: true, lifeMappingAvailable: true, reasonStatus: 'complete',
      expression: { kind: 'temporal', contribution: { role, origin, ...details, ...(evaluatedPair && { evaluatedPair }),
        ...(additionalEvaluatedPairs.length && { additionalEvaluatedPairs }), ...(before && { before: activation(before, role) }), activations } },
    })
  }

  const natal = snapshots.find(value => value.scope === 'natal')
  const currentChanges = new Set<string>()
  const currentKeys = new Set<string>()
  const baselineScopes = new Set<string>()
  const pendingChanges: { readonly item: Observation; readonly before?: Observation; readonly change: ChangeType;
    readonly pair: readonly [TemporalSnapshot, TemporalSnapshot]; readonly structuralEvidenceIds?: readonly string[] }[] = []
  for (const item of current) {
    const to = snapshot(item.unit.meaningRef.scopeId)
    const parent = snapshot(to?.parentScopeId)
    const from = parent ?? (item.unit.scope === 'daewoon' ? natal : undefined)
    if (from && to) baselineScopes.add(from.id)
    const diff = from && to ? comparePath(from, to, item, comparables.filter(value => value.unit.meaningRef.scopeId === from.id)) : undefined
    const key = JSON.stringify([item.key, item.unit.scope, item.unit.period?.periodId, bounds(item.unit.period)])
    if (currentKeys.has(key)) continue
    if (!diff && current.some(outer => encloses(outer, item))) continue
    currentKeys.add(key)
    if (diff && from && to) {
      currentChanges.add(key)
      pendingChanges.push({ item, before: diff.before, change: diff.change, pair: [from, to],
        ...('structuralEvidenceIds' in diff && { structuralEvidenceIds: diff.structuralEvidenceIds }) })
    }
  }
  const grouped = new Set<Observation>()
  for (const entry of pendingChanges) {
    if (grouped.has(entry.item)) continue
    const children = entry.change === 'new_activation' ? pendingChanges.filter(candidate => candidate.change === entry.change
      && !grouped.has(candidate.item) && encloses(entry.item, candidate.item)) : []
    children.forEach(child => grouped.add(child.item))
    const inheritedBaseline = entry.before ?? (entry.change === 'new_activation'
      ? comparables.find(candidate => candidate.unit.scope === 'natal' && candidate.key === entry.item.key) : undefined)
    add('CR-04', 'current_change', [entry.item, ...children.map(child => child.item)], {
      change: entry.change, status: 'current', structuralEvidenceIds: entry.structuralEvidenceIds,
    }, inheritedBaseline, entry.pair, children.map(child => child.pair))
  }
  for (const to of snapshots.filter(value => value.scope !== 'natal' && value.scope !== 'dailyLuck'
    && snapshot(value.id) && withinPeriod(referenceTime, value.validity))) {
    const from = snapshot(to.parentScopeId) ?? (to.scope === 'greatLuck' ? natal : undefined)
    if (!from) continue
    for (const before of comparables.filter(value => value.unit.meaningRef.scopeId === from.id)) {
      const stopped = suppression(from, to, before)
      const key = JSON.stringify([before.key, stopped?.item.unit.scope, to.validity.periodId, bounds(to.validity)])
      if (!stopped || currentChanges.has(key)) continue
      baselineScopes.add(from.id)
      currentChanges.add(key)
      add('CR-04', 'current_change', [stopped.item], {
        change: stopped.change, status: 'current', structuralEvidenceIds: stopped.structuralEvidenceIds,
      }, before, [from, to])
    }
  }
  if (!currentChanges.size) for (const item of current.filter((value, index) =>
    current.findIndex(other => other.key === value.key) === index)) {
    add('CR-04', 'current_change', [item], { status: 'current' })
  }

  const decades = snapshots.filter(value => value.scope === 'greatLuck' && snapshot(value.id) && bounds(value.validity))
    .sort((a, b) => date(bounds(a.validity)![0]) - date(bounds(b.validity)![0]) || compare(a.id, b.id))
  const pairs = decades.flatMap((to, index) => {
    const from = decades[index - 1]
    const exact = bounds(to.validity)!
    return from && bounds(from.validity)![1] === exact[0] && date(exact[1]) > now
      ? [{ from, to, boundary: exact[0] }] : []
  }).slice(0, 2)
  const futurePairs = pairs.filter(({ boundary }) => date(boundary) >= now).length
  const transitions = new Set<string>()
  for (const { from, to, boundary } of pairs) {
    const entered = date(boundary) < now
    const chapter = entered ? 'CR-04' : 'CR-08'
    const role = entered ? 'current_change' : 'long_term_transition'
    const currentStatus = entered ? { status: 'current' as const } : {}
    const prior = comparables.filter(({ unit }) => unit.meaningRef.scopeId === from.id)
    const next = comparables.filter(({ unit }) => unit.meaningRef.scopeId === to.id)
    const changes = new Set<string>()
    for (const item of next) {
      const diff = comparePath(from, to, item, prior)
      const key = JSON.stringify([item.key, diff?.change])
      if (!diff || changes.has(key) || (entered && !diff.before)) continue
      changes.add(key)
      if (!entered) transitions.add(boundary)
      const significance = diff.change === 'protection_change' || diff.change === 'direction_change' || diff.change === 'burden_change'
        ? 'major' : diff.change === 'weakening' || diff.change === 'strengthening' ? 'minor' : 'meaningful'
      add(chapter, role, [item], { change: diff.change, boundary, significance, ...currentStatus,
        ...('structuralEvidenceIds' in diff && { structuralEvidenceIds: diff.structuralEvidenceIds }) }, diff.before, [from, to])
    }
    for (const before of prior) {
      const stopped = suppression(from, to, before)
      const key = JSON.stringify([before.key, stopped?.change])
      if (!stopped || changes.has(key)) continue
      changes.add(key)
      if (!entered) transitions.add(boundary)
      add(chapter, role, [stopped.item], { change: stopped.change, boundary, ...currentStatus,
        significance: stopped.change === 'burden_ended' ? 'major' : 'meaningful',
        structuralEvidenceIds: stopped.structuralEvidenceIds }, before, [from, to])
    }
  }

  const changeOrder = ['direction_change', 'protection_change', 'burden_change', 'burden_ended',
    'suppression', 'release', 'new_activation', 'weakening', 'strengthening']
  const contributionOf = (paragraph: CustomerReadingParagraphPlan) =>
    paragraph.expression.kind === 'temporal' ? paragraph.expression.contribution : undefined
  paragraphs['CR-04'].sort((a, b) => {
    const left = contributionOf(a)
    const right = contributionOf(b)
    return changeOrder.indexOf(left?.change ?? '') - changeOrder.indexOf(right?.change ?? '')
      || scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope)
      || compare(left?.activations[0]?.interval?.[0] ?? '', right?.activations[0]?.interval?.[0] ?? '')
      || compare(a.id, b.id)
  })
  const windowItems = [...observations, ...comparisonOnly.filter(item => item.unit.scope === 'sewoon')]
    .filter(item => item.windowRole && item.unit.scope !== 'natal'
    && ['current', 'future'].includes(item.unit.sourceStatus) && now < date(bounds(item.unit.period)![1]))
    .sort((a, b) => Number(!withinPeriod(referenceTime, a.unit.period)) - Number(!withinPeriod(referenceTime, b.unit.period))
      || intervalOrder(a, b))
  const seenWindows = new Set<string>()
  const independent = new Set<string>()
  const windowRoles = new Set<WindowRole>()
  const upcoming = windowItems.find(item => date(bounds(item.unit.period)![0]) > now)
  const statusAt = (item: Observation): TemporalStatus => {
    const interval = bounds(item.unit.period)!
    if (now >= date(interval[1])) return item.unit.sourceStatus === 'expired' ? 'expired' : 'past'
    if (now >= date(interval[0])) return 'current'
    return interval[0] === (upcoming && bounds(upcoming.unit.period)![0]) ? 'upcoming' : 'future'
  }
  for (const item of windowItems) {
    const findKey = (value: Observation) => JSON.stringify([value.key, value.unit.scope, value.unit.period?.periodId, bounds(value.unit.period)])
    if (seenWindows.has(findKey(item))) continue
    const progression = [item, ...windowItems.filter(child => encloses(item, child))].filter(value => {
      const key = findKey(value)
      if (seenWindows.has(key)) return false
      seenWindows.add(key)
      return true
    })
    const role = item.windowRole!
    windowRoles.add(role)
    independent.add(JSON.stringify([item.unit.scope, item.unit.period?.periodId, bounds(item.unit.period)]))
    add('CR-09', role, progression, { status: statusAt(item) })
  }
  const counts: Record<TimingId, TemporalQuality> = {
    'CR-04': { baselineCoverage: baselineScopes.size, currentCoverage: current.length, changeCount: paragraphs['CR-04'].filter(p => p.slots.length > 1).length },
    'CR-08': { evaluatedPairCount: futurePairs, transitionCount: transitions.size, unknownSideCount: Number(!futurePairs && decades.length > 0) },
    'CR-09': { timingWindowCount: independent.size, opportunityCount: paragraphs['CR-09'].filter(p => p.slots.includes('opportunity_window')).length,
      cautionCount: paragraphs['CR-09'].filter(p => p.slots.includes('caution_window')).length },
  }
  return (['CR-04', 'CR-08', 'CR-09'] as const).map(chapterId => {
    const plan = paragraphs[chapterId]
    const ready = chapterId === 'CR-04' ? currentChanges.size > 0 : chapterId === 'CR-08' ? transitions.size > 0
      : independent.size >= 2 || windowRoles.size === 2
    const partial = plan.length > 0 || (chapterId === 'CR-08' && futurePairs > 0)
    const slot = chapterId === 'CR-04' ? 'current_comparison' : chapterId === 'CR-08' ? 'adjacent_daewoon_transition' : 'independent_timing_windows'
    return {
      chapterId, titleKey: customerChapterTitleKeys[chapterId], semanticReadiness: ready ? 'ready' : partial ? 'partial' : 'deferred',
      paragraphPlans: plan, temporalQuality: counts[chapterId],
      ...(chapterId === 'CR-09' && { timingCards: groupTimingCards(plan) }),
      gaps: ready ? [] : [{ type: partial ? 'SOURCE_GAP' : 'ENGINE_GAP', slot }],
      provenance: {
        ...provenance(plan.flatMap(p => p.semanticUnitIds.map(id => used.get(id)!))),
        sourceFactIds: uniqueIds(plan.flatMap(p => p.sourceFactIds)),
      },
    }
  })
}

export function timingOverlapQuality(chapters: readonly CustomerChapterPlan[]) {
  const seen = new Map<string, Set<string>>()
  let crossChapterRoleCollisionCount = 0
  for (const chapter of chapters) for (const paragraph of chapter.paragraphPlans) {
    if (paragraph.expression.kind !== 'temporal') continue
    for (const item of paragraph.expression.contribution.activations) {
      const key = JSON.stringify([item.semanticUnitId, item.role])
      const chapterIds = seen.get(key) ?? new Set<string>()
      if (chapterIds.size && !chapterIds.has(chapter.chapterId)) crossChapterRoleCollisionCount++
      chapterIds.add(chapter.chapterId)
      seen.set(key, chapterIds)
    }
  }
  const duplicates = new Map<string, string>()
  let crossChapterDuplicateMeaningCount = 0
  for (const chapter of chapters) for (const paragraph of chapter.paragraphPlans) {
    for (const key of paragraph.contributionKeys) {
      const previous = duplicates.get(key)
      if (previous && previous !== chapter.chapterId) crossChapterDuplicateMeaningCount++
      duplicates.set(key, chapter.chapterId)
    }
  }
  return { crossChapterRoleCollisionCount, crossChapterDuplicateMeaningCount }
}

function groupTimingCards(paragraphs: readonly CustomerReadingParagraphPlan[]): TimingCard[] {
  const cards = new Map<string, TimingCard>()
  for (const paragraph of paragraphs) {
    if (paragraph.expression.kind !== 'temporal') continue
    const contribution = paragraph.expression.contribution
    const primary = contribution.activations[0]
    if (!primary?.interval || !primary.periodRef || !contribution.status) continue
    const [startsAt, endsBefore] = primary.interval
    const key = JSON.stringify([primary.periodRef, startsAt, endsBefore, primary.scope, primary.target])
    const existing = cards.get(key)
    cards.set(key, {
      periodRef: primary.periodRef, startsAt, endsBefore, target: primary.target, scope: primary.scope, status: contribution.status,
      opportunity: [...(existing?.opportunity ?? []), ...(contribution.role === 'opportunity_window' ? [contribution] : [])],
      caution: [...(existing?.caution ?? []), ...(contribution.role === 'caution_window' ? [contribution] : [])],
    })
  }
  return [...cards.values()]
}
