import { runtimeStateSchema, validateContractBundle } from '../../contracts'
import type { RuntimeStateContract } from '../../contracts'
import { detach, recordId } from '../../producers/shared'
import { asContractScope, assertExecutionScopeContext } from '../../runtime'
import type { Work, StemCombinationResult } from './types'
import { exactContains } from './types'

/** Preserve source states/applications; never carry a luck-pair weakening as a natal change. */
export function carryForward(work: Work, upstream?: StemCombinationResult): void {
  const context = work.input.context
  if (!upstream) {
    if (context.stage !== 'natal') throw new TypeError('Explicit preceding stage snapshot required.')
    return
  }
  assertExecutionScopeContext(work.input.producer, upstream.context)
  if (upstream.status !== 'evaluated' || upstream.producerSnapshotIdentity !== context.producerSnapshotIdentity) {
    throw new TypeError('Upstream must be evaluated and belong to the same producer snapshot.')
  }
  const required = { natal: null, greatLuck: 'natal', yearlyLuck: 'greatLuck', monthlyLuck: 'yearlyLuck' } as const
  if (required[context.stage] !== upstream.context.stage) throw new TypeError('Invalid preceding stage.')
  for (const scope of ['greatLuck', 'yearlyLuck'] as const) {
    if (context.selectedPeriodRefs[scope] && upstream.context.selectedPeriodRefs[scope]
      && context.selectedPeriodRefs[scope] !== upstream.context.selectedPeriodRefs[scope]) throw new TypeError('Parent luck period mismatch.')
  }
  if (context.stage === 'monthlyLuck' && (context.selectedPeriodRefs.yearlyLuck !== upstream.context.selectedPeriodRefs.yearlyLuck
    || !exactContains(upstream.context.effectivePeriod, context.referenceTime))) {
    throw new TypeError('Monthly parent must be the yearly period containing referenceTime.')
  }
  const previous = validateContractBundle(upstream.bundle)
  // Reject stale/forged current-state views even if the history envelope itself is valid.
  for (const state of upstream.states) {
    const stored = previous.states.find((s) => s.stateId === state.stateId)
    if (JSON.stringify(detach(stored)) !== JSON.stringify(detach(state))) {
      throw new TypeError('Upstream current state differs from its validated snapshot.')
    }
  }
  const directStems = work.input.producer.entities.filter((e) => e.part === 'stem' && upstream.context.includedEntityIds.includes(e.entityId))
  if (new Set(upstream.states.map((s) => s.targetEntityId)).size !== directStems.length || upstream.states.length !== directStems.length) {
    throw new TypeError('Upstream state view is incomplete or duplicated.')
  }
  for (const entity of directStems) {
    const state = upstream.states.find((s) => s.targetEntityId === entity.entityId)!
    const latest = previous.states.filter((s) => s.scopeId === upstream.context.scopeId && s.targetEntityId === entity.entityId).at(-1)
    if (latest ? latest.stateId !== state?.stateId : !(entity.origin !== 'natal' && state?.functionalState === 'stopped'
      && previous.carry.processedRelationRecords.some((record) => record.sourceScopeId === state.scopeId
        && record.effectClass === 'natal-change' && record.affectedLuckEntityIds.includes(entity.entityId)
        && state.causingApplicationRefs.some((app) => app.applicationId === record.applicationRef.applicationId)))) {
      throw new TypeError('Upstream state view is superseded or has no historical processing source.')
    }
  }
  const merge = <T>(left: T[], right: T[], key: (item: T) => string): T[] => {
    const map = new Map(left.map((item) => [key(item), item]))
    for (const item of right) {
      const existing = map.get(key(item))
      if (existing && JSON.stringify(detach(existing)) !== JSON.stringify(detach(item))) throw new TypeError('Conflicting history identity.')
      map.set(key(item), item)
    }
    return [...map.values()]
  }
  work.bundle = { ...work.bundle,
    scopes: merge(previous.scopes, work.bundle.scopes, (s) => s.scopeId),
    periods: merge(previous.periods, work.bundle.periods, (p) => p.periodId),
    applications: detach(previous.applications), states: detach(previous.states),
    relations: merge(previous.relations, work.bundle.relations, (r) => r.relationFactId),
    coverage: merge(previous.coverage, work.bundle.coverage, (c) => c.coverageId),
    carry: { ...detach(previous.carry), carryStateId: recordId('stem-carry', [context.scopeId]) } }
  const destination = work.bundle.scopes.find((s) => s.scopeId === context.scopeId)!
  const history = previous.carry.processedRelationRecords.filter((r) => {
    const period = previous.periods.find((p) => p.periodId === r.sourcePeriodRef)!
    return exactContains(period, context.referenceTime)
  })
  // IR-01 guards only earlier luck/natal actions; luck-pair weakness is never inherited.
  for (const record of history.filter((r) => r.effectClass === 'natal-change')) {
    for (const id of record.affectedLuckEntityIds) work.priorLuckProcessing.add(id)
    if (!destination.priorProcessingRefs.includes(record.processingId)) destination.priorProcessingRefs.push(record.processingId)
  }
  for (const ref of destination.priorProcessingRefs) {
    if (!work.bundle.carry.priorProcessingRefs.includes(ref)) work.bundle.carry.priorProcessingRefs.push(ref)
  }
  const seen = new Set<string>()
  for (const state of upstream.states) {
    const entity = work.input.producer.entities.find((e) => e.entityId === state.targetEntityId)!
    if (entity.origin !== 'natal' || state.functionalState !== 'stopped') continue
    let source = state
    while (source.originMode === 'inherited') source = previous.states.find((s) => s.stateId === source.inheritedFromStateRef)!
    const sourceScope = previous.scopes.find((s) => s.scopeId === source.scopeId)!
    if (!['great', 'year'].includes(sourceScope.stage)) throw new TypeError('Natal internal combinations are outside this slice.')
    if (seen.has(source.stateId)) throw new TypeError('Duplicate source-state consumption.')
    seen.add(source.stateId)
    if (context.effectivePeriod.from.kind !== 'exact' || context.effectivePeriod.to.kind !== 'exact'
      || !exactContains(source.validity, context.effectivePeriod.from.instant, context.effectivePeriod.to.instant)) {
      throw new TypeError('Carry does not cover full destination period; boundary split required.')
    }
    const snapshot = work.bundle.carry.snapshots.find((s) => s.scopeId === source.scopeId)!
    const changeId = recordId('natal-change', [source.stateId])
    const entryId = recordId('stem-carry-entry', [changeId, context.scopeId])
    const prior = previous.carry.entries.find((e) => e.sourceStateRef === source.stateId && e.inheritedIntoScopeId === upstream.context.scopeId)
    work.bundle.carry.entries.push({ carryEntryId: entryId, changeId, natalEntityId: source.targetEntityId,
      sourceStage: sourceScope.stage as 'great' | 'year', sourceScopeId: source.scopeId, sourceSnapshotRef: snapshot.snapshotId,
      sourceStateRef: source.stateId, causedByRuleIds: [...new Set(source.causingApplicationRefs.map((a) => a.ruleId))],
      causedByApplicationRefs: detach(source.causingApplicationRefs), validity: detach(source.validity),
      inheritedIntoScopeId: context.scopeId, inheritedThrough: prior ? [...prior.inheritedThrough, upstream.context.scopeId] : [],
      evidenceIds: [...source.evidenceIds], uncertaintyIds: [...source.uncertaintyIds] })
    snapshot.outgoingCarryEntryRefs.push(entryId)
    destination.inheritedChangeIds.push(changeId)
    work.bundle.carry.consumedAtStage.push({ scopeId: context.scopeId, changeId,
      consumptionRef: recordId('stem-consumption', [context.scopeId, source.stateId]),
      sourceApplicationRef: source.causingApplicationRefs[0].applicationId })
    const inherited: RuntimeStateContract = runtimeStateSchema.parse({ ...detach(source),
      stateId: recordId('inherited-stem-state', [context.scopeId, source.stateId]), scopeId: context.scopeId,
      originMode: 'inherited', transition: 'unchanged', priorStateRef: source.stateId, inheritedFromStateRef: source.stateId })
    work.states.set(source.targetEntityId, inherited); work.bundle.states.push(inherited)
  }
  // A luck stem stopped in a prior luck/natal action is a historical reference, not an
  // inherited luck-pair weakening or a newly generated state. Keep its original ID/scope/cause.
  for (const state of upstream.states) {
    const entity = work.stems.find((e) => e.entityId === state.targetEntityId)
    if (entity && entity.origin !== 'natal' && state.functionalState === 'stopped'
      && history.some((record) => record.effectClass === 'natal-change' && record.affectedLuckEntityIds.includes(entity.entityId))) {
      work.states.set(entity.entityId, detach(state))
    }
  }
  // Existing validator enforces provenance identity, duplicate consumption, source/destination and periods.
  validateContractBundle(work.bundle)
}
export function finishSnapshot(work: Work): void {
  const scope = asContractScope(work.input.context)
  work.bundle.carry.snapshots.push({ snapshotId: recordId('stem-snapshot', [scope.scopeId]), scopeId: scope.scopeId, stage: scope.stage,
    natalStructureRefs: [], natalInternalStateRefs: [],
    inheritedNatalChangeRefs: [...work.bundle.scopes.find((s) => s.scopeId === scope.scopeId)!.inheritedChangeIds],
    currentLuckPairApplicationRefs: work.events.filter((e) => e.effect === 'weakening').flatMap((e) => e.applicationRefs.map((a) => a.applicationId)),
    currentLuckNatalApplicationRefs: work.events.filter((e) => e.effect === 'stopping').flatMap((e) => e.applicationRefs.map((a) => a.applicationId)),
    outgoingCarryEntryRefs: [] })
}
