import { applicationReferencesSchema, entityReferenceSchema, producerReferenceSchema, scopeReferenceSchema, validitySchema } from './common'
import { evidenceContextSchema } from './evidenceContext'
import { hiddenStemEntrySchema, hiddenStemSystemSchema } from './hiddenStemSystem'
import { luckCarryStateSchema } from './luckCarryState'
import { relationCoverageSchema, relationFactSchema } from './relationFact'
import { roleStateSchema } from './roleState'
import { runtimeStateSchema } from './runtimeState'
import { array, enumeration, object, requireContract, schema, uniqueIds } from './schema'
import type { Infer } from './schema'

/** In-memory validation envelope, not a persistence or orchestration API. */
const bundleShape = object({
  purpose: enumeration(['runtime-input', 'reference-only'] as const),
  factIds: uniqueIds, structureIds: uniqueIds,
  entities: array(entityReferenceSchema), scopes: array(scopeReferenceSchema),
  periods: array(validitySchema), applications: applicationReferencesSchema,
  hiddenStemSystems: array(hiddenStemSystemSchema), hiddenStemEntries: array(hiddenStemEntrySchema),
  relations: array(relationFactSchema), coverage: array(relationCoverageSchema),
  states: array(runtimeStateSchema), carry: luckCarryStateSchema,
  evidence: evidenceContextSchema, roles: array(roleStateSchema),
})
export type ContractBundle = Infer<typeof bundleShape>

/** Checks referential/integrity constraints only; a producer's claims are not independently verified. */
export const contractBundleSchema = schema<ContractBundle>((raw, path) => {
  const bundle = bundleShape.parse(raw, path)
  const check = (condition: unknown, message: string): void => requireContract(condition, path, message)
  function index<T>(values: T[], key: (value: T) => string, label: string): Map<string, T> {
    const result = new Map<string, T>()
    for (const value of values) {
      const name = key(value)
      check(!result.has(name), `duplicate ${label}: ${name}`); result.set(name, value)
    }
    return result
  }
  const entities = index(bundle.entities, (value) => value.entityId, 'entity')
  const scopes = index(bundle.scopes, (value) => value.scopeId, 'scope')
  const periods = index(bundle.periods, (value) => value.periodId, 'period')
  const applications = index(bundle.applications, (value) => value.applicationId, 'application')
  const systems = index(bundle.hiddenStemSystems, (value) => value.systemId, 'hidden-stem system')
  const relations = index(bundle.relations, (value) => value.relationFactId, 'relation')
  const coverage = index(bundle.coverage, (value) => value.coverageId, 'coverage')
  const states = index(bundle.states, (value) => value.stateId, 'state')
  const snapshots = index(bundle.carry.snapshots, (value) => value.snapshotId, 'snapshot')
  const entries = index(bundle.carry.entries, (value) => value.carryEntryId, 'carry entry')
  const changes = new Set(bundle.carry.entries.map((value) => value.changeId))
  const processing = index(bundle.carry.processedRelationRecords, (value) => value.processingId, 'processing record')
  const evidence = index(bundle.evidence.records, (value) => value.evidenceId, 'evidence')
  const handoffs = index(bundle.evidence.producerHandoffs ?? [], (value) => value.handoffId, 'producer handoff')
  index(bundle.roles, (value) => value.roleStateId, 'role')
  index(bundle.carry.consumedAtStage, (value) => value.consumptionRef, 'consumption')
  index(bundle.carry.consumedAtStage, (value) => `${value.scopeId}\0${value.changeId}`, 'scope/change consumption')
  index(bundle.carry.entries, (value) => `${value.inheritedIntoScopeId}\0${value.changeId}`, 'scope/change carry')
  index(bundle.hiddenStemEntries, (value) => `${value.systemId}\0${value.branch}`, 'system/branch entry')
  const defaults = bundle.hiddenStemSystems.filter((system) => system.usage === 'default-judgment')
  check(defaults.length <= 1, 'cannot merge multiple default hidden-stem systems')

  function useEvidence(ids: string[]): void {
    const visited = new Set<string>()
    function visit(id: string): void {
      const item = evidence.get(id)
      check(item, `missing evidence: ${id}`)
      if (!item || visited.has(id)) return
      visited.add(id)
      check(bundle.purpose !== 'runtime-input' || !['regression-expectation', 'audit-only'].includes(item.usage),
        'reference evidence cannot be consumed as runtime input')
      item.verification.basisEvidenceIds.forEach(visit)
      if (item.sourceRef.kind === 'independent-cross-check') item.sourceRef.observationRefs.forEach(visit)
    }
    ids.forEach(visit)
  }
  function useApplication(ref: Infer<typeof applicationReferencesSchema>[number]): void {
    const item = applications.get(ref.applicationId)
    check(item && item.executionId === ref.executionId && item.scopeId === ref.scopeId
      && item.ruleId === ref.ruleId && item.ruleVersion === ref.ruleVersion, 'application reference mismatch')
  }
  function useValidity(validity: Infer<typeof validitySchema>): void {
    const period = periods.get(validity.periodId)
    check(period && JSON.stringify(period) === JSON.stringify(validity), 'period reference mismatch')
  }
  for (const app of bundle.applications) check(scopes.has(app.scopeId), 'application scope missing')
  for (const entity of bundle.entities) {
    check(bundle.factIds.includes(entity.canonicalFactRef), 'entity fact missing')
    if (entity.periodRef) check(periods.has(entity.periodRef), 'entity period missing')
  }
  for (const scope of bundle.scopes) {
    check(periods.has(scope.targetPeriodRef), 'scope period missing')
    useEvidence(scope.evidenceIds)
    if (scope.scopeApprovalApplicationRef) {
      useApplication(scope.scopeApprovalApplicationRef)
      check(scope.scopeApprovalApplicationRef.scopeId === scope.scopeId, 'scope approval scope mismatch')
    }
    const allowed = scope.stage === 'natal' ? ['natal'] : scope.stage === 'great' ? ['natal', 'great']
      : scope.stage === 'year' ? ['natal', 'great', 'year'] : ['natal', 'year', 'month']
    for (const id of scope.directEntityIds) {
      const entity = entities.get(id)
      check(entity && allowed.includes(entity.origin), 'entity outside stage direct comparison scope')
      const ownPeriod = entity?.periodRef && periods.get(entity.periodRef)
      const targetPeriod = periods.get(scope.targetPeriodRef)
      if (ownPeriod && targetPeriod && ownPeriod.from.kind === 'exact' && ownPeriod.to.kind === 'exact'
        && targetPeriod.from.kind === 'exact' && targetPeriod.to.kind === 'exact') {
        check(ownPeriod.from.instant < targetPeriod.to.instant && targetPeriod.from.instant < ownPeriod.to.instant,
          'direct luck entity does not overlap target period')
      }
    }
    for (const id of scope.inheritedChangeIds) check(changes.has(id), 'scope inherited change missing')
    for (const id of scope.priorProcessingRefs) check(processing.has(id), 'scope processing history missing')
  }
  for (const item of bundle.evidence.records) {
    // Evidence can be stored for regression; only actual runtime consumers are restricted above.
    for (const id of item.verification.basisEvidenceIds) check(evidence.has(id), 'verification evidence missing')
    if (item.sourceRef.kind === 'independent-cross-check') {
      for (const ref of item.sourceRef.observationRefs) {
        const observation = evidence.get(ref)
        check(observation?.sourceType === 'deterministic-calculation', 'cross-check observation must be a calculation record')
      }
      const producers = item.sourceRef.observationRefs.map((ref) => {
        const source = evidence.get(ref)!.sourceRef
        return source.kind === 'deterministic-calculation' ? source.producer.producerId : ''
      })
      check(new Set(producers).size >= 2, 'cross-check requires distinct declared producers (independence still needs verification)')
    }
  }
  const evidenceVisiting = new Set<string>(), evidenceVisited = new Set<string>()
  function visitEvidence(id: string): void {
    if (evidenceVisited.has(id)) return
    check(!evidenceVisiting.has(id), 'evidence basis cycle'); evidenceVisiting.add(id)
    const item = evidence.get(id)!
    const refs = [...item.verification.basisEvidenceIds,
      ...(item.sourceRef.kind === 'independent-cross-check' ? item.sourceRef.observationRefs : [])]
    refs.forEach(visitEvidence)
    evidenceVisiting.delete(id); evidenceVisited.add(id)
  }
  bundle.evidence.records.forEach((record) => visitEvidence(record.evidenceId))
  type Producer = Infer<typeof producerReferenceSchema>
  // Producer lineage includes the version, source and input set, not only a display ID.
  const producerIdentity = (producer: Producer): string => JSON.stringify([
    producer.producerId, producer.version, producer.sourceRef, [...producer.inputFactIds].sort(),
  ])
  for (const handoff of handoffs.values()) {
    const source = handoff.source.kind === 'coverage' ? coverage.get(handoff.source.coverageId)
      : evidence.get(handoff.source.evidenceId)
    const target = handoff.target.kind === 'relation' ? relations.get(handoff.target.relationFactId)
      : coverage.get(handoff.target.coverageId)
    const from = source && 'producerRef' in source ? source.producerRef
      : source && 'sourceRef' in source && source.sourceRef.kind === 'deterministic-calculation'
        ? source.sourceRef.producer : undefined
    check(from && target && producerIdentity(from) === producerIdentity(handoff.fromProducerRef)
      && producerIdentity(target.producerRef) === producerIdentity(handoff.toProducerRef), 'handoff producer endpoint mismatch')
    check(target?.scopeId === handoff.scopeId && scopes.has(handoff.scopeId)
      && (!(source && 'scopeId' in source) || source.scopeId === handoff.scopeId), 'handoff scope mismatch')
    useEvidence(handoff.evidenceIds)
    if (handoff.source.kind === 'calculation-evidence') useEvidence([handoff.source.evidenceId])
  }
  function checkProducerLineage(
    target: ContractBundle['relations'][number] | ContractBundle['coverage'][number],
    sourceProducer: Producer, source: { kind: 'coverage'; coverageId: string }
      | { kind: 'calculation-evidence'; evidenceId: string },
  ): void {
    if (producerIdentity(sourceProducer) === producerIdentity(target.producerRef)) return
    check((target.producerHandoffRefs ?? []).some((ref) => {
      const handoff = handoffs.get(ref)
      return handoff && JSON.stringify(handoff.source) === JSON.stringify(source)
        && producerIdentity(handoff.fromProducerRef) === producerIdentity(sourceProducer)
        && producerIdentity(handoff.toProducerRef) === producerIdentity(target.producerRef)
    }), 'producer mismatch requires an explicit bound handoff')
  }
  function checkProducerEvidence(target: ContractBundle['relations'][number] | ContractBundle['coverage'][number]): void {
    for (const ref of target.producerHandoffRefs ?? []) {
      const handoff = handoffs.get(ref)
      check(handoff && handoff.scopeId === target.scopeId
        && ('relationFactId' in target ? handoff.target.kind === 'relation'
          && handoff.target.relationFactId === target.relationFactId
          : handoff.target.kind === 'coverage' && handoff.target.coverageId === target.coverageId),
      'handoff is missing or bound to a different target')
    }
    const visited = new Set<string>()
    function visit(ref: string): void {
      if (visited.has(ref)) return
      visited.add(ref)
      const record = evidence.get(ref)!
      if (record.sourceRef.kind === 'deterministic-calculation') {
        checkProducerLineage(target, record.sourceRef.producer, { kind: 'calculation-evidence', evidenceId: ref })
      }
      record.verification.basisEvidenceIds.forEach(visit)
      if (record.sourceRef.kind === 'independent-cross-check') record.sourceRef.observationRefs.forEach(visit)
    }
    target.evidenceIds.forEach(visit)
  }
  for (const system of bundle.hiddenStemSystems) {
    useEvidence(system.sourceRefs); useEvidence(system.compatibility.comparisonEvidenceIds)
  }
  for (const entry of bundle.hiddenStemEntries) {
    check(systems.has(entry.systemId), 'entry hidden-stem system missing'); useEvidence(entry.evidenceIds)
  }
  for (const item of bundle.coverage) {
    const scope = scopes.get(item.scopeId)
    check(scope, 'coverage scope missing')
    check(item.universeEntityIds.every((id) => scope?.directEntityIds.includes(id)), 'coverage entity outside direct scope')
    check(item.producerRef.inputFactIds.every((id) => bundle.factIds.includes(id)), 'coverage producer fact missing')
    useEvidence(item.evidenceIds)
    checkProducerEvidence(item)
  }
  const relationKeys = new Set<string>()
  for (const item of bundle.relations) {
    const scope = scopes.get(item.scopeId), survey = coverage.get(item.coverageRef)
    check(scope && survey?.scopeId === item.scopeId && survey.kind === item.kind, 'relation coverage mismatch')
    check(item.participantEntityIds.every((id) => scope?.directEntityIds.includes(id)), 'relation participant outside direct scope')
    check(item.participantEntityIds.every((id) => survey?.universeEntityIds.includes(id)), 'relation participant outside coverage universe')
    check(item.participantEntityIds.every((id) => entities.get(id)?.part === (item.kind.startsWith('stem-') ? 'stem' : 'branch')),
      'relation participant part mismatch')
    const investigated = survey?.investigatedParticipantSets.some((set) =>
      [...set].sort().join('\0') === [...item.participantEntityIds].sort().join('\0'))
    check(item.existence === 'unknown' || investigated, 'asserted relation was not investigated')
    check(item.existence !== 'absent' || survey?.completion === 'complete', 'absence requires complete coverage')
    check(item.inputFactIds.every((id) => bundle.factIds.includes(id))
      && item.producerRef.inputFactIds.every((id) => bundle.factIds.includes(id)), 'relation input fact missing')
    if (item.natalPositionRefs) check(item.natalPositionRefs.every((id) =>
      item.participantEntityIds.includes(id) && entities.get(id)?.origin === 'natal'), 'position references require natal participants')
    const key = [item.scopeId, item.kind, ...[...item.participantEntityIds].sort(),
      item.sourceEntityId ?? '', item.targetEntityId ?? ''].join('\0')
    check(!relationKeys.has(key), 'duplicate relation observation'); relationKeys.add(key)
    useEvidence(item.evidenceIds)
    checkProducerEvidence(item)
    checkProducerLineage(item, survey!.producerRef, { kind: 'coverage', coverageId: survey!.coverageId })
  }
  for (const state of bundle.states) {
    const entity = entities.get(state.targetEntityId), scope = scopes.get(state.scopeId)
    check(entity && scope, 'state entity/scope missing'); useValidity(state.validity)
    check(scope?.directEntityIds.includes(state.targetEntityId), 'state target outside direct scope')
    check(!(entity?.part === 'branch' && state.functionalState === 'stopped'), 'branch state cannot be stopped by this contract')
    state.causingApplicationRefs.forEach((app) => {
      useApplication(app)
      check(state.originMode === 'inherited' || app.scopeId === state.scopeId, 'local state cause scope mismatch')
    })
    for (const ref of [state.priorStateRef, state.inheritedFromStateRef, state.supersedesStateRef]) {
      if (ref) check(states.has(ref) && ref !== state.stateId
        && states.get(ref)?.targetEntityId === state.targetEntityId, 'invalid state predecessor')
    }
    if (state.originMode === 'inherited') {
      const original = states.get(state.inheritedFromStateRef!)
      check(original?.functionalState === state.functionalState
        && JSON.stringify(original.validity) === JSON.stringify(state.validity), 'inheritance must preserve original function and validity')
      check(state.causingApplicationRefs.length === original?.causingApplicationRefs.length
        && state.causingApplicationRefs.every((app) => original?.causingApplicationRefs.some((cause) =>
          cause.applicationId === app.applicationId)), 'inheritance cannot invent a new cause')
      check(bundle.carry.entries.some((entry) => entry.sourceStateRef === state.inheritedFromStateRef
        && entry.inheritedIntoScopeId === state.scopeId && entry.natalEntityId === state.targetEntityId), 'inherited state has no carry entry')
    }
    if (state.restorationBasis) {
      for (const ref of state.restorationBasis.expiredStateRefs) {
        const expired = states.get(ref)
        check(expired && ref !== state.stateId && expired.targetEntityId === state.targetEntityId, 'restoration constraint missing')
        if (expired?.validity.to.kind === 'exact' && state.validity.from.kind === 'exact') {
          check(expired.validity.to.instant <= state.validity.from.instant, 'restoration precedes constraint expiry')
        } else check(state.uncertaintyIds.length > 0, 'uncertain restoration expiry requires uncertainty')
      }
    }
    useEvidence(state.evidenceIds)
  }
  // Predecessor links may not introduce cycles; this is structural, not rule evaluation.
  const visiting = new Set<string>(), visited = new Set<string>()
  function visitState(id: string): void {
    if (visited.has(id)) return
    check(!visiting.has(id), 'state predecessor cycle'); visiting.add(id)
    const state = states.get(id)!
    for (const ref of [state.priorStateRef, state.inheritedFromStateRef, state.supersedesStateRef]) if (ref) visitState(ref)
    visiting.delete(id); visited.add(id)
  }
  bundle.states.forEach((state) => visitState(state.stateId))
  const rank = { natal: 0, great: 1, year: 2, month: 3 }
  const originalChanges = new Map<string, string>()
  const sourceStatesAtDestination = new Set<string>(), provenanceAtDestination = new Set<string>()
  const provenanceIdentities = new Map<string, string>()
  function stateProvenanceIdentity(stateId: string): string {
    const cached = provenanceIdentities.get(stateId)
    if (cached) return cached
    const state = states.get(stateId)!
    // A copied/inherited/unchanged record is the same event, not a new transition.
    const predecessor = state.inheritedFromStateRef
      ?? (state.transition === 'unchanged' ? state.priorStateRef : undefined)
    const identity = predecessor ? stateProvenanceIdentity(predecessor) : JSON.stringify([
      state.targetEntityId, state.scopeId,
      state.causingApplicationRefs.map((ref) => JSON.stringify([
        ref.executionId, ref.scopeId, ref.ruleId, ref.ruleVersion, ref.applicationId,
      ])).sort(),
    ])
    provenanceIdentities.set(stateId, identity)
    return identity
  }
  for (const entry of bundle.carry.entries) {
    const entity = entities.get(entry.natalEntityId), source = states.get(entry.sourceStateRef)
    const snapshot = snapshots.get(entry.sourceSnapshotRef), dest = scopes.get(entry.inheritedIntoScopeId)
    check(entity?.origin === 'natal', 'carry target must be natal')
    check(source?.scopeId === entry.sourceScopeId && source.targetEntityId === entry.natalEntityId
      && source.originMode === 'local' && source.functionalState !== 'unknown', 'carry must reference original known natal change')
    // Source identity is independent of change/state labels. A new, application-backed
    // transition may share an ancestor without being the same original event.
    const sourceKey = JSON.stringify([entry.inheritedIntoScopeId, entry.sourceStateRef])
    const provenanceKey = JSON.stringify([entry.inheritedIntoScopeId, stateProvenanceIdentity(entry.sourceStateRef)])
    check(!sourceStatesAtDestination.has(sourceKey) && !provenanceAtDestination.has(provenanceKey),
      'duplicate original state/provenance at destination, regardless of change ID')
    sourceStatesAtDestination.add(sourceKey); provenanceAtDestination.add(provenanceKey)
    check(snapshot?.scopeId === entry.sourceScopeId && snapshot.stage === entry.sourceStage, 'carry source snapshot mismatch')
    check(dest && rank[dest.stage] > rank[entry.sourceStage], 'carry destination must be a lower luck stage')
    check(dest?.inheritedChangeIds.includes(entry.changeId), 'destination scope must declare inherited change')
    const signature = JSON.stringify([entry.natalEntityId, entry.sourceStage, entry.sourceScopeId,
      entry.sourceSnapshotRef, entry.sourceStateRef, entry.validity,
      [...entry.causedByApplicationRefs.map((app) => app.applicationId)].sort()])
    check(!originalChanges.has(entry.changeId) || originalChanges.get(entry.changeId) === signature,
      'same change ID must preserve original source and validity')
    originalChanges.set(entry.changeId, signature)
    check(entry.causedByApplicationRefs.every((app) => source?.causingApplicationRefs.some((cause) =>
      cause.applicationId === app.applicationId)), 'carry causes differ from original state')
    entry.causedByApplicationRefs.forEach(useApplication); useValidity(entry.validity)
    check(source?.validity.periodId === entry.validity.periodId, 'carry changed original validity')
    let previousRank = rank[entry.sourceStage]
    for (const ref of entry.inheritedThrough) {
      const intermediate = scopes.get(ref)
      check(intermediate && rank[intermediate.stage] > previousRank
        && dest && rank[intermediate.stage] < rank[dest.stage], 'carry intermediate scopes must progress strictly')
      if (intermediate) previousRank = rank[intermediate.stage]
    }
    const targetPeriod = dest && periods.get(dest.targetPeriodRef)
    if (targetPeriod?.from.kind === 'exact' && targetPeriod.to.kind === 'exact'
      && entry.validity.from.kind === 'exact' && entry.validity.to.kind === 'exact') {
      check(entry.validity.from.instant <= targetPeriod.from.instant
        && entry.validity.to.instant >= targetPeriod.to.instant, 'carry destination exceeds validity')
    } else check(entry.uncertaintyIds.length > 0, 'uncertain carry validity requires uncertainty')
    check(bundle.carry.processedRelationRecords.some((record) => record.effectClass === 'natal-change'
      && record.targetNatalEntityIds.includes(entry.natalEntityId)
      && entry.causedByApplicationRefs.some((app) => app.applicationId === record.applicationRef.applicationId)),
    'carry requires a natal-change processing record, not luck-pair weakening')
    useEvidence(entry.evidenceIds)
  }
  for (const item of bundle.carry.processedRelationRecords) {
    useApplication(item.applicationRef)
    check(item.applicationRef.scopeId === item.sourceScopeId && scopes.has(item.sourceScopeId)
      && relations.get(item.relationFactRef)?.scopeId === item.sourceScopeId && periods.has(item.sourcePeriodRef), 'processing record reference mismatch')
    check(item.targetNatalEntityIds.every((id) => entities.get(id)?.origin === 'natal')
      && item.affectedLuckEntityIds.every((id) => entities.has(id) && entities.get(id)?.origin !== 'natal'), 'processing target origin mismatch')
    check(item.effectClass !== 'luck-pair-weakening' || item.targetNatalEntityIds.length === 0,
      'luck-pair weakening is not a natal change')
    useEvidence(item.evidenceIds)
  }
  for (const item of bundle.carry.consumedAtStage) {
    check(bundle.carry.entries.some((entry) => entry.changeId === item.changeId && entry.inheritedIntoScopeId === item.scopeId
      && entry.causedByApplicationRefs.some((app) => app.applicationId === item.sourceApplicationRef)), 'consumption has no carry source')
  }
  for (const id of bundle.carry.priorProcessingRefs) check(processing.has(id), 'carry processing history missing')
  for (const snapshot of bundle.carry.snapshots) {
    check(scopes.get(snapshot.scopeId)?.stage === snapshot.stage, 'snapshot stage mismatch')
    check(snapshot.natalStructureRefs.every((id) => bundle.structureIds.includes(id)), 'snapshot structure missing')
    for (const ref of snapshot.natalInternalStateRefs) check(states.has(ref)
      && scopes.get(states.get(ref)!.scopeId)?.stage === 'natal', 'snapshot natal state missing')
    check(snapshot.inheritedNatalChangeRefs.every((id) => bundle.carry.entries.some((entry) =>
      entry.changeId === id && entry.inheritedIntoScopeId === snapshot.scopeId)), 'snapshot inherited change missing')
    for (const ref of [...snapshot.currentLuckPairApplicationRefs, ...snapshot.currentLuckNatalApplicationRefs]) {
      check(applications.get(ref)?.scopeId === snapshot.scopeId, 'snapshot current application scope mismatch')
    }
    check(snapshot.outgoingCarryEntryRefs.every((id) => entries.get(id)?.sourceScopeId === snapshot.scopeId), 'snapshot outgoing carry missing')
  }
  for (const role of bundle.roles) {
    check(scopes.has(role.validScopeId), 'role scope missing')
    check(role.entityId === null || entities.has(role.entityId), 'role entity missing')
    check(role.entityId === null || scopes.get(role.validScopeId)?.directEntityIds.includes(role.entityId), 'role entity outside valid scope')
    check(role.structureRef === null || bundle.structureIds.includes(role.structureRef), 'role structure missing')
    if (role.applicationRef) useApplication(role.applicationRef)
    check(bundle.purpose !== 'runtime-input' || role.usage === 'runtime-result', 'document role assertion is reference-only')
    useEvidence(role.evidenceIds)
  }
  return bundle
})

export const validateContractBundle = (value: unknown): ContractBundle => contractBundleSchema.parse(value)
