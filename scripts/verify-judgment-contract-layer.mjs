import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
try {
  const c = await server.ssrLoadModule('/src/lib/judgment/contracts/index.ts')
  const clone = (v) => JSON.parse(JSON.stringify(v))
  const accept = (schema, v) => { const before = JSON.stringify(v); const parsed = schema.parse(v)
    assert.equal(JSON.stringify(v), before); assert.equal(schema.is(v), true); checks++; return parsed }
  const reject = (schema, value, mutate) => {
    const v = clone(value); mutate(v)
    assert.throws(() => schema.parse(v), c.ContractValidationError)
    assert.equal(schema.is(v), false); checks++
  }
  const boundary = (instant) => ({ kind: 'exact', instant })
  const period = (periodId, start, end) => ({ periodId, from: boundary(start), to: boundary(end) })
  const long = period('great-period', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z')
  const short = period('year-period', '2024-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z')
  const app = { applicationId: 'original-app', executionId: 'execution-one', scopeId: 'great-scope',
    ruleId: 'TEST-STRUCTURAL-ONLY', ruleVersion: 'test-1' }
  const producer = { producerId: 'declared-producer', version: 'test-1', sourceRef: 'external-source', inputFactIds: ['fact'] }
  const doc = { documentId: 'TEST', documentRevision: 1, path: 'synthetic-only', section: 'contract-shape', location: 'synthetic-record' }
  const ev = { evidenceId: 'evidence', sourceType: 'source-document', sourceRef: { kind: 'source-document', document: doc },
    documentRevision: 1, ruleId: null, status: 'unknown', verification: { claimRef: 'claim', method: 'not-yet-verified', basisEvidenceIds: [] },
    note: 'Schema test only; no astrological input or expected judgment.', uncertaintyIds: ['unverified'], usage: 'runtime-evidence' }
  const system = { contractVersion: '1', systemId: 'test-system', systemName: '본기·중기·여기 체계', systemVersion: 'test-1',
    usage: 'default-judgment', semanticRoles: { main: '본기', middle: '중기', residual: '여기' },
    semanticOrder: ['main', 'middle', 'residual'], sourceDisplayOrder: ['residual', 'middle', 'main'],
    entriesRef: 'external-table-not-supplied', sourceRefs: ['evidence'],
    compatibility: { legacyTableRef: 'external-legacy-table', status: 'not-checked', comparisonEvidenceIds: [] },
    assessment: 'unknown', uncertaintyIds: ['unverified'] }
  accept(c.hiddenStemSystemSchema, system)
  reject(c.hiddenStemSystemSchema, system, (v) => { v.semanticOrder.reverse() })
  reject(c.hiddenStemSystemSchema, system, (v) => { v.sourceDisplayOrder = ['main', 'main', 'residual'] })
  reject(c.hiddenStemSystemSchema, system, (v) => { v.systemName = 'unverified default' })
  reject(c.hiddenStemSystemSchema, system, (v) => { v.compatibility.status = 'verified' })
  const unknownEntry = { systemId: 'test-system', branch: '子', completeness: 'unknown', roles: {}, evidenceIds: ['evidence'], uncertaintyIds: ['unverified'] }
  accept(c.hiddenStemEntrySchema, unknownEntry)
  reject(c.hiddenStemEntrySchema, unknownEntry, (v) => { v.completeness = 'complete' })
  reject(c.hiddenStemEntrySchema, unknownEntry, (v) => { v.roles.main = '甲' })
  reject(c.hiddenStemEntrySchema, unknownEntry, (v) => { v.completeness = 'partial'; v.roles = { main: '甲', middle: '甲' } })

  const scope = (scopeId, stage, targetPeriodRef, directEntityIds) => ({ scopeId, stage, targetPeriodRef, directEntityIds,
    inheritedChangeIds: [], priorProcessingRefs: [], evidenceIds: ['evidence'], scopeApprovalApplicationRef: null })
  const natal = { entityId: 'natal-stem', origin: 'natal', part: 'stem', canonicalFactRef: 'fact', position: 'year' }
  const great = { entityId: 'great-stem', origin: 'great', part: 'stem', canonicalFactRef: 'fact', periodRef: 'great-period' }
  const year = { entityId: 'year-stem', origin: 'year', part: 'stem', canonicalFactRef: 'fact', periodRef: 'year-period' }
  accept(c.entityReferenceSchema, natal)
  reject(c.entityReferenceSchema, natal, (v) => { v.periodRef = 'great-period' })
  reject(c.entityReferenceSchema, great, (v) => { v.position = 'year' })
  accept(c.validitySchema, long)
  reject(c.validitySchema, long, (v) => { v.to = v.from })
  reject(c.validitySchema, long, (v) => { v.from.instant = '2020-02-30T00:00:00.000Z' })
  reject(c.validitySchema, long, (v) => { v.from.instant = '2020-01-01' })

  const coverage = { contractVersion: '1', coverageId: 'coverage', scopeId: 'great-scope', kind: 'stem-combination',
    universeEntityIds: ['natal-stem', 'great-stem'], investigatedParticipantSets: [['natal-stem', 'great-stem']],
    completion: 'complete', producerRef: producer, evidenceIds: ['evidence'], uncertaintyIds: [] }
  const relation = { contractVersion: '1', relationFactId: 'relation', kind: 'stem-combination',
    participantEntityIds: ['natal-stem', 'great-stem'], scopeId: 'great-scope', existence: 'present', coverageRef: 'coverage',
    producerRef: producer, inputFactIds: ['fact'], assessment: 'confirmed', evidenceIds: ['evidence'], uncertaintyIds: [] }
  accept(c.relationFactSchema, relation)
  reject(c.relationFactSchema, relation, (v) => { v.functionalState = 'stopped' })
  reject(c.relationFactSchema, relation, (v) => { v.judgment = 'favorable' })
  reject(c.relationFactSchema, relation, (v) => { v.kind = 'stem-controls' })
  accept(c.relationFactSchema, { ...relation, kind: 'stem-controls', sourceEntityId: 'natal-stem', targetEntityId: 'great-stem' })
  reject(c.relationFactSchema, relation, (v) => { v.kind = 'branch-three-combination' })
  reject(c.relationFactSchema, relation, (v) => { v.participantEntityIds = ['natal-stem', 'natal-stem'] })
  reject(c.relationFactSchema, relation, (v) => { v.existence = 'unknown' })
  reject(c.relationCoverageSchema, coverage, (v) => { v.investigatedParticipantSets.push(['great-stem', 'natal-stem']) })
  reject(c.relationCoverageSchema, coverage, (v) => { v.completion = 'unknown' })

  const state = { contractVersion: '1', stateId: 'source-state', targetEntityId: 'natal-stem', scopeId: 'great-scope',
    functionalState: 'stopped', originMode: 'local', transition: 'established', causingApplicationRefs: [app],
    evidenceIds: ['evidence'], uncertaintyIds: [], validity: long }
  accept(c.runtimeStateSchema, state)
  accept(c.runtimeStateSchema, { ...state, functionalState: 'weakened', weakeningDescription: { wording: '원문 정성 표현', ruleId: app.ruleId } })
  accept(c.runtimeStateSchema, { ...state, functionalState: 'unknown', transition: 'unresolved', causingApplicationRefs: [], uncertaintyIds: ['missing-input'] })
  reject(c.runtimeStateSchema, state, (v) => { v.functionalState = 'inherited' })
  reject(c.runtimeStateSchema, state, (v) => { v.functionalState = 'weakened' })
  reject(c.runtimeStateSchema, state, (v) => { v.percentage = 50 })
  reject(c.runtimeStateSchema, state, (v) => { v.causingApplicationRefs = [] })
  reject(c.runtimeStateSchema, state, (v) => { v.transition = 'restored' })
  reject(c.runtimeStateSchema, state, (v) => { v.originMode = 'inherited' })
  const restored = { ...state, stateId: 'restored-state', functionalState: 'active', transition: 'restored', priorStateRef: 'source-state',
    restorationBasis: { kind: 'constraint-expired', expiredStateRefs: ['source-state'], reassessmentApplicationRef: app.applicationId } }
  accept(c.runtimeStateSchema, restored)
  reject(c.runtimeStateSchema, restored, (v) => { v.restorationBasis.kind = 'same-stem-arrived' })
  reject(c.runtimeStateSchema, restored, (v) => { v.restorationBasis.reassessmentApplicationRef = 'missing-app' })

  const role = { contractVersion: '1', roleStateId: 'role', subjectKind: 'entity', entityId: 'natal-stem', structureRef: null,
    role: '상신', status: 'evaluated', sourceRuleIds: [app.ruleId], evidenceIds: ['evidence'], validScopeId: 'great-scope',
    provisional: false, uncertaintyIds: [], origin: 'rule-result', applicationRef: app, usage: 'runtime-result' }
  accept(c.roleStateSchema, role)
  reject(c.roleStateSchema, role, (v) => { v.applicationRef = null })
  reject(c.roleStateSchema, role, (v) => { v.role = '격' })
  reject(c.roleStateSchema, role, (v) => { v.origin = 'document-assertion' })
  reject(c.roleStateSchema, role, (v) => { v.applicationRef.scopeId = 'another-scope' })
  const assertion = { ...role, status: 'asserted', origin: 'document-assertion', usage: 'reference-only', applicationRef: null }
  accept(c.roleStateSchema, assertion)
  reject(c.roleStateSchema, assertion, (v) => { v.usage = 'runtime-result' })
  reject(c.roleStateSchema, role, (v) => { v.provisional = true })

  accept(c.evidenceRecordSchema, ev)
  reject(c.evidenceRecordSchema, ev, (v) => { v.status = 'confirmed' })
  reject(c.evidenceRecordSchema, ev, (v) => { v.verification.checkedAt = 'yesterday' })
  reject(c.evidenceRecordSchema, ev, (v) => { v.documentRevision = 2 })
  reject(c.evidenceRecordSchema, ev, (v) => { v.sourceType = 'operator-confirmed' })
  reject(c.evidenceRecordSchema, ev, (v) => { v.confidence = 0.9 })
  reject(c.evidenceRecordSchema, ev, (v) => { v.hash = { algorithm: 'SHA-256', value: 'fake', hashTarget: 'doc' } })
  reject(c.evidenceRecordSchema, ev, (v) => { v.uncertaintyIds = [] })
  accept(c.evidenceRecordSchema, { ...ev, sourceType: 'customer-input', documentRevision: null,
    sourceRef: { kind: 'customer-input', recordId: 'record', fieldPath: 'field', receiptRef: 'receipt' } })
  const calc = (evidenceId, producerId) => ({ ...ev, evidenceId, sourceType: 'deterministic-calculation', documentRevision: null,
    sourceRef: { kind: 'deterministic-calculation', producer: { ...producer, producerId }, outputRefs: ['output'], timePolicyRef: 'policy' } })
  const comparison = { ...ev, evidenceId: 'comparison', sourceType: 'independent-cross-check', documentRevision: null,
    sourceRef: { kind: 'independent-cross-check', observationRefs: ['obs-a', 'obs-b'], independenceBasis: 'declared-method', comparisonResultRef: 'result', verifierRef: 'verifier' } }
  accept(c.evidenceRecordSchema, comparison)
  reject(c.evidenceRecordSchema, comparison, (v) => { v.sourceRef.observationRefs = ['obs-a', 'obs-a'] })
  for (const [sourceType, sourceRef] of [
    ['reverse-inference', { kind: 'reverse-inference', candidateRefs: ['candidate'], adoptionReason: 'reason', targetFieldRef: 'field', documentRefs: [doc] }],
    ['operator-confirmed', { kind: 'operator-confirmed', decisionRecordRef: 'record', approvalScope: 'scope', documentRefs: [doc] }],
  ]) accept(c.evidenceRecordSchema, { ...ev, sourceType, sourceRef, documentRevision: null })

  const entry = { carryEntryId: 'carry-entry', changeId: 'change', natalEntityId: 'natal-stem', sourceStage: 'great',
    sourceScopeId: 'great-scope', sourceSnapshotRef: 'great-snapshot', sourceStateRef: 'source-state',
    causedByRuleIds: [app.ruleId], causedByApplicationRefs: [app], validity: long,
    inheritedIntoScopeId: 'year-scope', inheritedThrough: [], evidenceIds: ['evidence'], uncertaintyIds: [] }
  const processing = { processingId: 'processed', sourceScopeId: 'great-scope', relationFactRef: 'relation', applicationRef: app,
    targetNatalEntityIds: ['natal-stem'], affectedLuckEntityIds: ['great-stem'], effectClass: 'natal-change', sourcePeriodRef: 'great-period', evidenceIds: ['evidence'] }
  const snapshot = { snapshotId: 'great-snapshot', scopeId: 'great-scope', stage: 'great', natalStructureRefs: [],
    natalInternalStateRefs: [], inheritedNatalChangeRefs: [], currentLuckPairApplicationRefs: [], currentLuckNatalApplicationRefs: [app.applicationId], outgoingCarryEntryRefs: ['carry-entry'] }
  const carry = { contractVersion: '1', carryStateId: 'carry', entries: [entry], processedRelationRecords: [processing], snapshots: [snapshot],
    consumedAtStage: [{ scopeId: 'year-scope', changeId: 'change', consumptionRef: 'consumed', sourceApplicationRef: app.applicationId }], priorProcessingRefs: ['processed'] }
  accept(c.carryEntrySchema, entry)
  reject(c.carryEntrySchema, entry, (v) => { v.causedByRuleIds = ['other-rule'] })
  const inherited = { ...state, stateId: 'inherited-state', scopeId: 'year-scope', originMode: 'inherited',
    inheritedFromStateRef: 'source-state', priorStateRef: 'source-state', transition: 'unchanged' }
  const yearScope = { ...scope('year-scope', 'year', 'year-period', ['natal-stem', 'year-stem']), inheritedChangeIds: ['change'], priorProcessingRefs: ['processed'] }
  const bundle = { purpose: 'runtime-input', factIds: ['fact'], structureIds: [], entities: [natal, great, year],
    scopes: [scope('great-scope', 'great', 'great-period', ['natal-stem', 'great-stem']), yearScope],
    periods: [long, short], applications: [app], hiddenStemSystems: [system], hiddenStemEntries: [unknownEntry],
    relations: [relation], coverage: [coverage], states: [state, inherited], carry,
    evidence: { contractVersion: '1', evidenceContextId: 'context', records: [ev] }, roles: [role] }
  accept(c.contractBundleSchema, bundle)
  reject(c.contractBundleSchema, bundle, (v) => { v.entities.push(v.entities[0]) })
  reject(c.contractBundleSchema, bundle, (v) => { v.states[0].causingApplicationRefs[0].executionId = 'wrong' })
  reject(c.contractBundleSchema, bundle, (v) => { v.evidence.records[0].usage = 'regression-expectation' })
  reject(c.contractBundleSchema, bundle, (v) => { v.roles[0] = assertion })
  reject(c.contractBundleSchema, bundle, (v) => { v.scopes[1].stage = 'month'; v.scopes[1].directEntityIds.push('great-stem') })
  reject(c.contractBundleSchema, bundle, (v) => { v.relations[0].participantEntityIds[1] = 'year-stem' })
  reject(c.contractBundleSchema, bundle, (v) => { v.relations[0].existence = 'absent'; v.coverage[0].completion = 'partial' })
  reject(c.contractBundleSchema, bundle, (v) => { v.relations.push({ ...v.relations[0], relationFactId: 'duplicate-relation' }) })
  reject(c.contractBundleSchema, bundle, (v) => { v.entities[0].part = 'branch' })
  reject(c.contractBundleSchema, bundle, (v) => { v.carry.consumedAtStage.push({ ...v.carry.consumedAtStage[0], consumptionRef: 'second' }) })
  reject(c.contractBundleSchema, bundle, (v) => { v.carry.entries.push({ ...v.carry.entries[0], carryEntryId: 'second' }) })
  reject(c.contractBundleSchema, bundle, (v) => { v.carry.entries[0].natalEntityId = 'great-stem' })
  reject(c.contractBundleSchema, bundle, (v) => { v.carry.processedRelationRecords[0].effectClass = 'luck-pair-weakening' })
  reject(c.contractBundleSchema, bundle, (v) => { v.states[1].inheritedFromStateRef = 'missing' })
  reject(c.contractBundleSchema, bundle, (v) => { v.states[1].functionalState = 'active' })
  reject(c.contractBundleSchema, bundle, (v) => { v.scopes[1].inheritedChangeIds = [] })
  reject(c.contractBundleSchema, bundle, (v) => { v.states[0].priorStateRef = 'inherited-state' })
  reject(c.contractBundleSchema, bundle, (v) => { v.periods[1].to.instant = '2031-01-01T00:00:00.000Z' })
  reject(c.contractBundleSchema, bundle, (v) => { v.periods[0].to = { kind: 'unknown', reason: 'missing' }; v.states.forEach((s) => { s.validity = v.periods[0] }); v.carry.entries[0].validity = v.periods[0] })
  const unverified = clone(bundle)
  unverified.periods[0].to = { kind: 'unknown', reason: 'missing' }
  unverified.states.forEach((s) => { s.validity = unverified.periods[0] })
  unverified.carry.entries[0].validity = unverified.periods[0]
  unverified.carry.entries[0].uncertaintyIds = ['validity-unconfirmed']
  accept(c.contractBundleSchema, unverified)
  const cross = clone(bundle)
  cross.evidence.records.push(calc('obs-a', 'producer-a'), calc('obs-b', 'producer-b'), comparison)
  accept(c.contractBundleSchema, cross)
  reject(c.contractBundleSchema, cross, (v) => { v.evidence.records[2].sourceRef.producer.producerId = 'producer-a' })
  reject(c.contractBundleSchema, cross, (v) => {
    v.evidence.records[1].usage = 'regression-expectation'
    v.states[0].evidenceIds = ['comparison']
  })
  reject(c.contractBundleSchema, bundle, (v) => { v.evidence.records[0].verification.basisEvidenceIds = ['evidence'] })
  reject(c.contractBundleSchema, bundle, (v) => {
    v.periods[1].from.instant = '2031-01-01T00:00:00.000Z'
    v.periods[1].to.instant = '2032-01-01T00:00:00.000Z'
    v.scopes[0].directEntityIds.push('year-stem') // year cannot participate at great stage
  })
  reject(c.contractBundleSchema, bundle, (v) => {
    v.evidence.records.push({ ...ev, evidenceId: 'expected-answer', usage: 'regression-expectation' })
    v.evidence.records[0].verification.basisEvidenceIds = ['expected-answer']
  })
  const reference = clone(bundle)
  reference.purpose = 'reference-only'; reference.roles = [assertion]
  reference.evidence.records[0].usage = 'regression-expectation'
  accept(c.contractBundleSchema, reference)
  const verified = clone(bundle)
  verified.evidence.records.push({ ...ev, evidenceId: 'verified-claim', status: 'confirmed', uncertaintyIds: [],
    verification: { claimRef: 'specific-claim', method: 'declared-check', checkedByRef: 'reviewer', basisEvidenceIds: ['evidence'] } })
  accept(c.contractBundleSchema, verified)
  const restoration = clone(bundle)
  const future = period('future-period', '2030-01-01T00:00:00.000Z', '2031-01-01T00:00:00.000Z')
  const futureApp = { ...app, applicationId: 'reassessment', scopeId: 'future-scope' }
  restoration.periods.push(future)
  restoration.scopes.push(scope('future-scope', 'year', future.periodId, ['natal-stem']))
  restoration.applications.push(futureApp)
  restoration.states.push({ ...restored, scopeId: 'future-scope', validity: future, causingApplicationRefs: [futureApp],
    restorationBasis: { ...restored.restorationBasis, reassessmentApplicationRef: futureApp.applicationId } })
  accept(c.contractBundleSchema, restoration)
  reject(c.contractBundleSchema, restoration, (v) => {
    v.periods[2].from.instant = '2029-01-01T00:00:00.000Z'
    v.states[2].validity = v.periods[2]
  })
  const getterRecord = clone(ev)
  Object.defineProperty(getterRecord, 'note', { get() { throw new Error('must not execute accessor') }, enumerable: true })
  assert.throws(() => c.evidenceRecordSchema.parse(getterRecord), c.ContractValidationError); checks++
  // Parsing is deterministic and detached; it does not modify input or choose roles.
  const parsed = accept(c.contractBundleSchema, bundle)
  parsed.states[0].functionalState = 'active'
  assert.equal(bundle.states[0].functionalState, 'stopped')
  assert.deepEqual(c.validateContractBundle(bundle), c.validateContractBundle(clone(bundle))); checks++
  const baselineChecks = checks
  assert.equal(baselineChecks, 95, 'keep the original 95 contract checks')

  // Gap A: changing wrapper IDs must not duplicate an original source state/event.
  function addWrappedChange(value, sourceState = value.states[0]) {
    const wrapped = { ...clone(value.carry.entries[0]), carryEntryId: 'wrapped-entry', changeId: 'wrapped-change',
      sourceStateRef: sourceState.stateId, causedByApplicationRefs: clone(sourceState.causingApplicationRefs),
      causedByRuleIds: [...new Set(sourceState.causingApplicationRefs.map((ref) => ref.ruleId))],
      validity: clone(sourceState.validity) }
    value.carry.entries.push(wrapped)
    value.scopes[1].inheritedChangeIds.push(wrapped.changeId)
    value.carry.snapshots[0].outgoingCarryEntryRefs.push(wrapped.carryEntryId)
    value.carry.consumedAtStage.push({ scopeId: wrapped.inheritedIntoScopeId, changeId: wrapped.changeId,
      consumptionRef: 'wrapped-consumption', sourceApplicationRef: wrapped.causedByApplicationRefs[0].applicationId })
  }
  const duplicateSource = clone(bundle)
  addWrappedChange(duplicateSource)
  reject(c.contractBundleSchema, duplicateSource, () => {})
  const aliasedState = clone(bundle)
  aliasedState.states.push({ ...clone(state), stateId: 'aliased-state' })
  addWrappedChange(aliasedState, aliasedState.states.at(-1))
  reject(c.contractBundleSchema, aliasedState, () => {})
  const unchangedState = clone(bundle)
  const unchangedApp = { ...app, applicationId: 'unchanged-application' }
  unchangedState.applications.push(unchangedApp)
  unchangedState.states.push({ ...clone(state), stateId: 'unchanged-state', transition: 'unchanged',
    priorStateRef: state.stateId, causingApplicationRefs: [unchangedApp] })
  unchangedState.carry.processedRelationRecords.push({ ...clone(processing), processingId: 'unchanged-processing', applicationRef: unchangedApp })
  addWrappedChange(unchangedState, unchangedState.states.at(-1))
  reject(c.contractBundleSchema, unchangedState, () => {})

  // Gap B: a real new transition may have the same ancestor, entity and rule.
  const sequential = clone(bundle)
  const transitionApp = { ...app, applicationId: 'new-transition-application' }
  sequential.applications.push(transitionApp)
  const transitionPeriod = period('transition-period', '2023-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z')
  sequential.periods.push(transitionPeriod)
  sequential.states.push({ ...clone(state), stateId: 'new-transition-state', priorStateRef: state.stateId,
    supersedesStateRef: state.stateId, functionalState: 'weakened', validity: transitionPeriod,
    causingApplicationRefs: [transitionApp], weakeningDescription: { wording: 'synthetic categorical state', ruleId: app.ruleId } })
  sequential.carry.processedRelationRecords.push({ ...clone(processing), processingId: 'new-transition-processing', applicationRef: transitionApp })
  addWrappedChange(sequential, sequential.states.at(-1))
  accept(c.contractBundleSchema, sequential)
  const anotherStage = clone(bundle)
  anotherStage.periods.push(period('month-period', '2024-01-01T00:00:00.000Z', '2024-02-01T00:00:00.000Z'))
  anotherStage.scopes.push({ ...scope('month-scope', 'month', 'month-period', ['natal-stem']), inheritedChangeIds: ['change'] })
  anotherStage.carry.entries.push({ ...clone(entry), carryEntryId: 'monthly-entry', inheritedIntoScopeId: 'month-scope', inheritedThrough: ['year-scope'] })
  anotherStage.carry.snapshots[0].outgoingCarryEntryRefs.push('monthly-entry')
  anotherStage.carry.consumedAtStage.push({ ...clone(carry.consumedAtStage[0]), scopeId: 'month-scope', consumptionRef: 'month-consumption' })
  accept(c.contractBundleSchema, anotherStage)

  // Gap C/D: even an unknown relation must belong to its coverage universe.
  const outsideCoverage = clone(bundle)
  outsideCoverage.coverage[0].universeEntityIds = ['natal-stem']
  outsideCoverage.coverage[0].investigatedParticipantSets = []
  outsideCoverage.relations[0].existence = 'unknown'
  outsideCoverage.relations[0].assessment = 'unknown'
  outsideCoverage.relations[0].uncertaintyIds = ['not-investigated']
  reject(c.contractBundleSchema, outsideCoverage, () => {})
  const insideCoverage = clone(outsideCoverage)
  insideCoverage.coverage[0].universeEntityIds.push('great-stem')
  accept(c.contractBundleSchema, insideCoverage)

  // Gap E/F: producer changes require explicit, scoped, target-bound provenance.
  const mismatchProducer = clone(bundle)
  mismatchProducer.relations[0].producerRef.producerId = 'other-producer'
  reject(c.contractBundleSchema, mismatchProducer, () => {})
  const transferred = clone(mismatchProducer)
  const handoff = { handoffId: 'handoff', scopeId: 'great-scope', source: { kind: 'coverage', coverageId: 'coverage' },
    target: { kind: 'relation', relationFactId: 'relation' }, fromProducerRef: clone(producer),
    toProducerRef: clone(transferred.relations[0].producerRef), evidenceIds: ['evidence'] }
  transferred.evidence.producerHandoffs = [handoff]
  transferred.relations[0].producerHandoffRefs = ['handoff']
  accept(c.contractBundleSchema, transferred)
  reject(c.contractBundleSchema, transferred, (v) => { v.relations[0].producerHandoffRefs = [] })
  reject(c.contractBundleSchema, transferred, (v) => { v.evidence.producerHandoffs[0].target.relationFactId = 'other-relation' })
  reject(c.contractBundleSchema, transferred, (v) => { v.evidence.producerHandoffs[0].scopeId = 'year-scope' })
  reject(c.contractBundleSchema, transferred, (v) => { v.evidence.producerHandoffs[0].fromProducerRef.version = 'wrong-version' })
  reject(c.contractBundleSchema, transferred, (v) => { v.evidence.producerHandoffs[0].toProducerRef.inputFactIds = [] })
  reject(c.contractBundleSchema, transferred, (v) => {
    v.evidence.records.push({ ...clone(ev), evidenceId: 'expected-transfer', usage: 'regression-expectation' })
    v.evidence.producerHandoffs[0].evidenceIds = ['expected-transfer']
  })
  reject(c.contractBundleSchema, bundle, (v) => { v.relations[0].producerRef.version = 'different-version' })
  reject(c.contractBundleSchema, bundle, (v) => { v.relations[0].producerRef.sourceRef = 'different-source' })
  const reorderedInputs = clone(bundle)
  reorderedInputs.factIds.push('fact-two')
  reorderedInputs.coverage[0].producerRef.inputFactIds = ['fact', 'fact-two']
  reorderedInputs.relations[0].producerRef.inputFactIds = ['fact-two', 'fact']
  accept(c.contractBundleSchema, reorderedInputs)

  const calculatedEvidence = clone(bundle)
  calculatedEvidence.evidence.records.push(calc('external-observation', 'external-producer'))
  calculatedEvidence.relations[0].evidenceIds = ['external-observation']
  reject(c.contractBundleSchema, calculatedEvidence, () => {})
  calculatedEvidence.evidence.producerHandoffs = [{ handoffId: 'observation-transfer', scopeId: 'great-scope',
    source: { kind: 'calculation-evidence', evidenceId: 'external-observation' },
    target: { kind: 'relation', relationFactId: 'relation' },
    fromProducerRef: clone(calculatedEvidence.evidence.records.at(-1).sourceRef.producer),
    toProducerRef: clone(producer), evidenceIds: ['evidence'] }]
  calculatedEvidence.relations[0].producerHandoffRefs = ['observation-transfer']
  accept(c.contractBundleSchema, calculatedEvidence)
  const coverageEvidence = clone(calculatedEvidence)
  coverageEvidence.relations[0].evidenceIds = ['evidence']
  coverageEvidence.relations[0].producerHandoffRefs = []
  coverageEvidence.coverage[0].evidenceIds = ['external-observation']
  coverageEvidence.evidence.producerHandoffs = []
  reject(c.contractBundleSchema, coverageEvidence, () => {})
  coverageEvidence.coverage[0].producerHandoffRefs = ['observation-transfer']
  coverageEvidence.evidence.producerHandoffs = [{ ...clone(calculatedEvidence.evidence.producerHandoffs[0]),
    target: { kind: 'coverage', coverageId: 'coverage' } }]
  accept(c.contractBundleSchema, coverageEvidence)
  const indirectProducer = clone(calculatedEvidence)
  indirectProducer.relations[0].producerHandoffRefs = []
  indirectProducer.evidence.producerHandoffs = []
  indirectProducer.relations[0].evidenceIds = ['evidence']
  indirectProducer.evidence.records[0].verification.basisEvidenceIds = ['external-observation']
  reject(c.contractBundleSchema, indirectProducer, () => {})

  const probes = {
    duplicateSourceConsume: c.contractBundleSchema.is(duplicateSource),
    participantOutsideCoverage: c.contractBundleSchema.is(outsideCoverage),
    producerMismatchWithoutHandoff: c.contractBundleSchema.is(mismatchProducer),
  }
  assert.deepEqual(Object.values(probes), [false, false, false])
  console.log('Additional audit probes accepted:', JSON.stringify(probes))
  console.log(`Judgment contract layer: ${checks} checks passed (${baselineChecks} original + ${checks - baselineChecks} regression; synthetic data only).`)
} finally { await server.close() }
