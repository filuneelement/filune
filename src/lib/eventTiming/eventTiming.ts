import type {
  EventEvidenceFact, EventEvidenceInput, EventTimingDecision, EventTimingFact, EventTimingProjection,
  EventTimingResult, EventTimingType, TimedEventScope,
} from './types'
import { buildEventEvidence } from './eventEvidence'
import { luckPeriodStatus } from '../judgment/core/luckValidity'
import type { Validity } from '../judgment/contracts'

const timed = (scope: EventEvidenceFact['scope']): scope is TimedEventScope => scope === 'daewoon' || scope === 'sewoon' || scope === 'month'
const sort = (values: readonly string[]) => [...new Set(values.filter(Boolean))].sort()
const decisionIdFor = (type: EventTimingType, direction: EventTimingDecision['direction'], scope: EventEvidenceFact,
  evidence: readonly EventEvidenceFact[]) => `event-decision:${JSON.stringify([
  type, direction, scope.scope, scope.scopeGanZhi ?? scope.scopeId, sort(evidence.map(item => item.id)),
])}`
const parentLinked = (child: EventEvidenceFact, parent: EventEvidenceFact) => child.parentScopeId === parent.scopeId
const byType = (facts: readonly EventEvidenceFact[], type: EventEvidenceFact['evidenceType'], scope: EventEvidenceFact['scope']) =>
  facts.filter(fact => fact.evidenceType === type && fact.scope === scope && fact.currentlyEffective
    && fact.temporalStatus !== 'expired' && fact.certainty !== 'deferred')
const samePath = (left: EventEvidenceFact, right: EventEvidenceFact) => left.sourcePathId === right.sourcePathId

export function createEventTimingDecision(type: EventTimingType, direction: EventTimingDecision['direction'], scope: EventEvidenceFact,
  supporting: readonly EventEvidenceFact[]): EventTimingDecision {
  const evidence = [...supporting].sort((a, b) => a.id.localeCompare(b.id))
  const classes = new Set(evidence.map(item => item.provenanceClass))
  const provenanceClass = classes.has('SOURCE_CONFLICT') ? 'SOURCE_CONFLICT'
    : classes.has('SOURCE_INFERENCE') ? 'SOURCE_INFERENCE'
      : classes.has('FILUNE_APPROVED_OVERRIDE') ? 'FILUNE_APPROVED_OVERRIDE' : 'SOURCE_EXPLICIT'
  const all = <K extends 'sourceJudgmentIds' | 'sourceRelationIds' | 'sourceRoleIds' | 'sourcePatternContextIds' | 'sourceOutcomeIds' | 'sourceLuckEffectIds'>(key: K) =>
    sort(evidence.flatMap(item => item[key]))
  return {
    id: decisionIdFor(type, direction, scope, evidence), eventType: type, direction,
    originScope: scope.originScope, scope: scope.scope as TimedEventScope,
    scopeId: scope.scopeId, parentScopeId: scope.parentScopeId,
    ...(scope.scopeGanZhi && { scopeGanZhi: scope.scopeGanZhi }),
    ...(scope.parentScopeGanZhi && { parentScopeGanZhi: scope.parentScopeGanZhi }),
    certainty: evidence.every(item => item.certainty === 'confirmed') ? 'confirmed' : 'contextual',
    provenanceClass, currentLifecycle: evidence.some(item => item.currentLifecycle === 'reduced') ? 'reduced' : 'active',
    currentlyEffective: evidence.every(item => item.currentlyEffective),
    sourceEvidenceIds: sort(evidence.map(item => item.id)), sourceJudgmentIds: all('sourceJudgmentIds'),
    sourceRelationIds: all('sourceRelationIds'), sourceRoleIds: all('sourceRoleIds'),
    sourcePatternContextIds: all('sourcePatternContextIds'),
    sourceOutcomeIds: all('sourceOutcomeIds'), sourceLuckEffectIds: all('sourceLuckEffectIds'),
    provenance: sort(evidence.flatMap(item => item.provenance)),
  }
}

type AddDecision = (type: EventTimingType, direction: EventTimingDecision['direction'], anchor: EventEvidenceFact,
  sources: readonly EventEvidenceFact[]) => void

function applyContractTimingPolicy(evidence: readonly EventEvidenceFact[], add: AddDecision) {
  const annualContract = byType(evidence, 'document_support', 'sewoon')
  const monthContractSupport = byType(evidence, 'document_support', 'month')
  const monthContractBlocks = evidence.filter(fact => ['document_obstruction', 'support_function_stopped', 'institutional_instability']
    .includes(fact.evidenceType) && fact.scope === 'month' && fact.currentlyEffective && fact.temporalStatus !== 'expired')
  for (const year of annualContract) add('contract_favorable', 'favorable', year, [year])
  for (const month of monthContractSupport) {
    const year = annualContract.find(parent => parentLinked(month, parent))
    if (year) add('contract_favorable', 'favorable', month, [year, month])
  }
  for (const month of monthContractBlocks) {
    const year = annualContract.find(parent => parentLinked(month, parent))
    if (year) add('contract_delay', 'delay', month, [year, month])
  }
  for (const obstruction of evidence.filter(fact => ['document_obstruction', 'support_function_stopped', 'institutional_instability']
    .includes(fact.evidenceType) && fact.scope === 'sewoon' && fact.currentlyEffective && fact.temporalStatus !== 'expired')) {
    add('contract_delay', 'delay', obstruction, [obstruction])
  }
  for (const trouble of byType(evidence, 'contract_trouble', 'sewoon')) add('contract_process_trouble', 'trouble', trouble, [trouble])
  for (const trouble of byType(evidence, 'contract_trouble', 'month')) add('contract_process_trouble', 'trouble', trouble, [trouble])
}

function applyBusinessTimingPolicy(evidence: readonly EventEvidenceFact[], add: AddDecision) {
  const annualStart = byType(evidence, 'business_start_support', 'sewoon')
  for (const year of annualStart) add('business_start_favorable', 'favorable', year, [year])
  for (const month of byType(evidence, 'business_start_support', 'month')) {
    const year = annualStart.find(parent => parentLinked(month, parent))
    if (year) add('business_start_favorable', 'favorable', month, [year, month])
  }
  for (const block of evidence.filter(item => item.evidenceType === 'business_execution_obstruction'
    && (item.scope === 'sewoon' || item.scope === 'month') && item.currentlyEffective && item.temporalStatus !== 'expired')) {
    const year = block.scope === 'month' ? annualStart.find(parent => parentLinked(block, parent)) : undefined
    add('business_start_delay', 'delay', block, year ? [year, block] : [block])
  }

  const longBusiness = byType(evidence, 'business_expansion_support', 'daewoon')
  const annualBusiness = byType(evidence, 'business_expansion_support', 'sewoon')
  for (const year of annualBusiness) {
    const long = longBusiness.find(item => parentLinked(year, item) || samePath(item, year))
    if (long) add('business_expansion_favorable', 'favorable', year, [long, year])
  }
  for (const month of byType(evidence, 'business_expansion_support', 'month')) {
    const year = annualBusiness.find(item => parentLinked(month, item))
    const long = year && longBusiness.find(item => parentLinked(year, item) || samePath(item, year))
    if (year && long) add('business_expansion_favorable', 'favorable', month, [long, year, month])
  }

  for (const adverse of byType(evidence, 'business_adjustment_need', 'sewoon')) {
    const long = longBusiness.find(item => samePath(item, adverse))
    if (long) add('business_adjustment', 'adjustment', adverse, [long, adverse])
  }
  for (const change of evidence.filter(item => item.evidenceType === 'business_restructure_trigger'
    && item.currentlyEffective && item.temporalStatus !== 'expired' && (item.scope === 'sewoon' || item.scope === 'month'))) {
    add('business_restructure', change.direction === 'favorable' ? 'restructure' : 'disruption', change, [change])
  }
}

export function buildEventTimingDecisions(evidence: readonly EventEvidenceFact[]): readonly EventTimingDecision[] {
  const decisions: EventTimingDecision[] = []
  const add: AddDecision = (type, direction, anchor, sources) => {
    if (timed(anchor.scope) && sources.length) decisions.push(createEventTimingDecision(type, direction, anchor, sources))
  }
  applyContractTimingPolicy(evidence, add)
  applyBusinessTimingPolicy(evidence, add)
  const unique = new Map(decisions.sort((a, b) => a.id.localeCompare(b.id)).map(decision => [decision.id, decision]))
  return [...unique.values()]
}

function projectDecision(decision: EventTimingDecision, period: Validity, referenceTime: string): EventTimingFact | undefined {
  if (period.from.kind !== 'exact' || period.to.kind !== 'exact') return undefined
  const status = luckPeriodStatus(period, referenceTime)
  if (status === 'unknown') return undefined
  const temporalStatus = status === 'effective' ? 'current' as const : status === 'future' ? 'future' as const : 'expired' as const
  const intervalIdentity = JSON.stringify([period.periodId, period.from.instant, period.to.instant])
  return {
    id: `event-timing:${JSON.stringify([decision.id, intervalIdentity])}`, decisionId: decision.id,
    eventType: decision.eventType, direction: decision.direction,
    originScope: decision.originScope, scope: decision.scope, scopeId: decision.scopeId,
    ...(decision.scopeGanZhi && { scopeGanZhi: decision.scopeGanZhi }),
    ...(decision.parentScopeGanZhi && { parentScopeGanZhi: decision.parentScopeGanZhi }), period,
    certainty: decision.certainty, provenanceClass: decision.provenanceClass,
    currentLifecycle: temporalStatus === 'expired' ? 'expired' : decision.currentLifecycle,
    temporalStatus, currentlyEffective: status === 'effective' && decision.currentlyEffective,
    ...(decision.breakdownPathIds && { breakdownPathIds: decision.breakdownPathIds }),
    sourceEvidenceIds: decision.sourceEvidenceIds, sourceJudgmentIds: decision.sourceJudgmentIds,
    sourceRelationIds: decision.sourceRelationIds, sourceRoleIds: decision.sourceRoleIds,
    sourcePatternContextIds: decision.sourcePatternContextIds,
    sourceOutcomeIds: decision.sourceOutcomeIds, sourceLuckEffectIds: decision.sourceLuckEffectIds,
    provenance: decision.provenance,
  }
}

export function projectEventTimingDecisions(decisions: readonly EventTimingDecision[], scopes: EventEvidenceInput['scopes'],
  referenceTime?: string): { readonly facts: readonly EventTimingFact[]; readonly projections: readonly EventTimingProjection[] } {
  const facts: EventTimingFact[] = []
  const projections: EventTimingProjection[] = []
  const byScopeId = new Map(scopes.map(item => [item.snapshot.id, item]))
  for (const decision of decisions) {
    const scope = byScopeId.get(decision.scopeId)
    if (!scope) {
      projections.push({ decisionId: decision.id, status: 'not_projectable', reason: 'missing_scope' })
      continue
    }
    const scopeName = scope.snapshot.scope === 'greatLuck' ? 'daewoon' : scope.snapshot.scope === 'yearlyLuck' ? 'sewoon'
      : scope.snapshot.scope === 'monthlyLuck' ? 'month' : scope.snapshot.scope === 'dailyLuck' ? 'day' : 'natal'
    if (scopeName !== decision.scope) {
      projections.push({ decisionId: decision.id, status: 'not_projectable', reason: 'scope_mismatch' })
      continue
    }
    if (!referenceTime) {
      projections.push({ decisionId: decision.id, status: 'not_projectable', reason: 'unknown_calendar_state' })
      continue
    }
    const projected = projectDecision(decision, scope.snapshot.validity, referenceTime)
    if (!projected) {
      projections.push({ decisionId: decision.id, status: 'not_projectable', reason: 'missing_calendar_interval' })
      continue
    }
    facts.push(projected)
    projections.push({ decisionId: decision.id, status: 'projected', factId: projected.id })
  }
  facts.sort((a, b) => a.id.localeCompare(b.id))
  projections.sort((a, b) => a.decisionId.localeCompare(b.decisionId))
  return { facts, projections }
}

export function buildEventTiming(input: EventEvidenceInput): EventTimingResult {
  const evidence = buildEventEvidence(input)
  const decisions = buildEventTimingDecisions(evidence)
  const { facts, projections } = projectEventTimingDecisions(decisions, input.scopes, input.referenceTime)
  const contextRequested = ['event.contract.process', 'event.business.startGoal', 'event.business.operating',
    'event.business.adjustment', 'event.business.restructure'].some(key => input.knownFacts?.[key] === true)
  const gaps = new Set<EventTimingResult['gaps'][number]>()
  if (contextRequested) gaps.add('ENGINE_GAP')
  if (input.knownFacts?.['event.contract.process'] === true) gaps.add('SOURCE_GAP')
  return { evidence, decisions, facts, projections, gaps: [...gaps].sort() }
}
