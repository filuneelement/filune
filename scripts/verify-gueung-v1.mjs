import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/judgment/${path}.ts`)
const clone = structuredClone
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}
let checks = 0
const check = (run) => { run(); checks++ }

try {
  const scopeId = 'scope:fixture'
  const time = '2027-01-15T00:00:00.000Z'
  const validity = { periodId: 'period', from: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' },
    to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } }
  const provenance = { ruleVersion: 'A179', producerRef: { producerId: 'fixture', version: '1', sourceRef: 'test', inputFactIds: ['fact'] } }
  const record = { evidenceId: 'independent-observation', sourceType: 'deterministic-calculation',
    sourceRef: { kind: 'deterministic-calculation', producer: provenance.producerRef, outputRefs: ['fact'], timePolicyRef: 'fixture' },
    documentRevision: null, ruleId: 'I-04-2', status: 'confirmed', usage: 'runtime-evidence', uncertaintyIds: [],
    verification: { claimRef: 'fixture-trace', method: 'fixture', checkedByRef: 'verify', basisEvidenceIds: ['fact-receipt'] }, note: '' }
  const evidenceIds = [record.evidenceId]
  function result(status = 'has-byeong') {
    return { contractVersion: '1', scopeId, referenceTime: time,
      byeong: { scopeId, status, judgments: [], roleStates: [], applications: [], removalEvidence: [], otherDamageAssessment: 'unassessed', reasonCodes: [] },
      evidence: { contractVersion: '1', evidenceContextId: 'context', records: [clone(record)] } }
  }
  function addJudgment(input, entityId, { status = 'confirmed', provisional = false } = {}) {
    const app = { applicationId: `app:${entityId}`, executionId: 'fixture', scopeId, ruleId: 'I-04-2', ruleVersion: 'A179' }
    const roleStateId = `role:${entityId}`
    const judgment = { judgmentId: `judge:${entityId}`, candidateId: `candidate:${entityId}`, entityId,
      protectedEntityId: 'protected', status, currentRoleRef: status === 'confirmed' ? roleStateId : null, natalRoleHistory: [],
      runtimeState: { contractVersion: '1', stateId: `state:${entityId}`, targetEntityId: entityId, scopeId, functionalState: 'active',
        originMode: 'local', transition: 'established', causingApplicationRefs: [app], evidenceIds, uncertaintyIds: [], validity },
      ruleIds: ['I-04-2'], factIds: ['fact'], evidenceIds, relationCoverageRefs: [], reasonCodes: [], provenance,
      trace: [{ pathId: 'damage', outcome: 'damage', relationFactId: 'relation', evidenceIds },
        { pathId: 'excluded', outcome: 'excluded', evidenceIds },
        { pathId: 'deferred', outcome: 'deferred', evidenceIds }, { pathId: 'stopped', outcome: 'stopped', evidenceIds }] }
    input.byeong.judgments.push(clone(judgment))
    if (status === 'confirmed') {
      input.byeong.applications.push(clone(app))
      input.byeong.roleStates.push({ contractVersion: '1', roleStateId, entityId, structureRef: null, subjectKind: 'entity', role: '병',
        status: 'evaluated', origin: 'rule-result', usage: 'runtime-result', validScopeId: scopeId, sourceRuleIds: ['I-04-2'],
        evidenceIds, provisional, uncertaintyIds: provisional ? ['provisional-test'] : [], applicationRef: clone(app) })
    }
  }
  function mixed() {
    const input = result()
    addJudgment(input, 'second')
    addJudgment(input, 'first')
    addJudgment(input, 'rejected', { status: 'rejected' })
    addJudgment(input, 'deferred', { status: 'deferred' })
    addJudgment(input, 'provisional', { provisional: true })
    return input
  }
  const { evaluateGuEung: evaluate, guEungFactClaim } = await load('evaluators/guEung/index')
  const { produceStemPathEffects } = await load('producers/stemPathEffectProducer')
  const { verifyDocumentClaim, DOCUMENT_PINS } = await load('systems/documentReceipt')
  const { readFile } = await import('node:fs/promises')
  const A = await readFile('src/docs/source/authority/A_rev179.md','utf8')
  const rawId = 'test:raw-A'
  const citedRule = verifyDocumentClaim({ documentId: 'A', ...DOCUMENT_PINS.A, path: 'src/docs/source/authority/A_rev179.md', text: A, rawEvidenceId: rawId },
    { evidenceId: 'test:I-04c', section: 'A-8-2.', ruleId: 'I-04c', quote: '운이 병을 합거·제어해 격국 손상을 풀면 유리로 인정한다.', claimRef: 'test-rule' })
  const raw = { ...citedRule, evidenceId: rawId, status: 'provisional', uncertaintyIds: ['raw-source'],
    verification: { claimRef: 'raw-source', method: 'fixture-document-input', basisEvidenceIds: [] } }
  const receipt = (fact, outputId, ruleId, producerRef, id) => ({ ...clone(record),
    evidenceId: id, ruleId, sourceRef: { ...record.sourceRef, producer: producerRef, outputRefs: [outputId] },
    verification: { claimRef: guEungFactClaim(fact), method: 'synthetic-contract-attestation', checkedByRef: 'verify-gueung-v1',
      basisEvidenceIds: [citedRule.evidenceId] } })
  const baseInput = (boundary = mixed()) => ({ boundary, candidates: [], states: [], relations: [], effects: [], links: [] })
  function addEffect(input, { actor = 'helper', victim = 'first', effectType = 'partial-relief', coverage = 'complete', attribution = 'individual' } = {}) {
    const scope = input.boundary.scopeId
    const stateId = `helper-state:${actor}`
    const relationId = `relation:${actor}:${victim}`
    const relation = { contractVersion: '1', relationFactId: relationId, scopeId: scope, kind: 'stem-controls',
      sourceEntityId: actor, targetEntityId: victim, participantEntityIds: [actor, victim], existence: 'present', coverageRef: 'coverage',
      producerRef: provenance.producerRef, inputFactIds: ['fact'], assessment: 'confirmed', evidenceIds, uncertaintyIds: [] }
    input.relations.push(relation)
    if (!input.candidates.some((item) => item.entityId === actor)) {
      const state = { ...clone(input.boundary.byeong.judgments[0].runtimeState), stateId, targetEntityId: actor }
      input.candidates.push({ candidateId: actor, entityId: actor, scopeId: scope, runtimeState: state, evidenceIds, provenance })
      input.states.push(state)
    }
    input.links.push({ effectPathId: `link:${actor}:${victim}`, candidateId: actor, byeongJudgmentId: `judge:${victim}`,
      damagePathId: 'damage', scopeId: scope, relationFactIds: [relationId], evidenceIds })
    const effectId = `effect:${actor}:${victim}`
    const fact = { contractVersion: '1', effectId, scopeId: scope, candidateEntityId: actor,
      byeongJudgmentId: `judge:${victim}`, damagePathId: 'damage', sourceMechanism: 'direct-control', effectType,
      target: 'byeong-source', targetEntityId: victim, relationFactIds: [relationId],
      runtimeStateRefs: [stateId], evidenceIds: [`proof:${effectId}`], ruleIds: ['I-04c'], effectivePeriod: validity, coverage,
      provenance: { ...provenance, causeEntityId: actor, attribution } }
    input.effects.push(fact)
    input.boundary.evidence.records.push(receipt(fact, effectId, 'I-04c', provenance.producerRef, fact.evidenceIds[0]))
    return fact
  }
  function setup(options) {
    const input = baseInput()
    input.boundary.evidence.records.push(raw, citedRule)
    const effect = addEffect(input, options)
    return { input, effect }
  }

  check(() => assert.equal(evaluate(baseInput(result('no-byeong'))).status, 'not-applicable'))
  check(() => assert.equal(evaluate(baseInput(result('deferred'))).status, 'deferred'))
  check(() => {
    const { input } = setup()
    input.effects = []
    const output = evaluate(input)
    assert.equal(output.status, 'deferred')
    assert.equal(output.verdicts[0].reasonCode, 'INDEPENDENT_EFFECT_UNAVAILABLE')
  })
  for (const effectType of ['partial-relief', 'complete-relief']) check(() => {
    const { input } = setup({ effectType })
    const output = evaluate(input)
    assert.equal(output.status, 'confirmed')
    assert.equal(output.verdicts[0].reasonCode, effectType)
    assert.equal(output.roleStates[0].role, '구응')
    assert.equal(output.effectLinks.length, 1)
    assert.equal(output.effectLinks[0].effectFactRef, output.verdicts[0].effectId)
  })
  check(() => {
    const { input } = setup({ effectType: 'no-effect' })
    const output = evaluate(input)
    assert.equal(output.verdicts[0].status, 'rejected')
    assert.equal(output.status, 'deferred')
    assert.equal(evaluate(setup({ effectType: 'no-effect', coverage: 'partial' }).input).verdicts[0].status, 'deferred')
  })
  check(() => {
    const { input, effect } = setup()
    delete effect.provenance
    assert.throws(() => evaluate(input), /provenance/)
  })
  check(() => {
    const { input, effect } = setup()
    effect.provenance.causeEntityId = 'different'
    assert.throws(() => evaluate(input), /cause entity mismatch/)
    effect.candidateEntityId = 'unlinked'
    assert.throws(() => evaluate(input), /candidate or path mismatch/)
  })
  check(() => {
    const { input, effect } = setup()
    effect.scopeId = 'different'
    assert.throws(() => evaluate(input), /scope mismatch/)
  })
  check(() => {
    const { input } = setup()
    input.links.push(clone(input.links[0]))
    assert.throws(() => evaluate(input), /duplicate effect link/)
  })
  check(() => {
    const { input } = setup()
    addEffect(input, { victim: 'second', effectType: 'no-effect' })
    const output = evaluate(input)
    assert.equal(output.effectLinks.length, 1)
    assert.equal(output.roleStates.length, 1)
    assert.deepEqual(new Set(output.verdicts.map((item) => item.status)), new Set(['confirmed', 'rejected']))
  })
  check(() => {
    const { input } = setup()
    addEffect(input, { actor: 'other' })
    assert.equal(evaluate(input).effectLinks.length, 2)
    assert.equal(evaluate(input).roleStates.length, 2)
  })
  check(() => assert.equal(evaluate(setup({ attribution: 'joint-unresolved' }).input).verdicts[0].status, 'deferred'))
  check(() => {
    const { input, effect } = setup()
    effect.effectType = 'complete-relief'
    assert.equal(evaluate(input).status, 'deferred', 'the receipt is bound to the exact effect')
  })
  check(() => {
    const { input } = setup()
    const before = JSON.stringify(input)
    freeze(input)
    assert.equal(JSON.stringify(evaluate(input)), JSON.stringify(evaluate(input)))
    assert.equal(JSON.stringify(input), before)
  })

  // Real structural combination output, with a synthetic necessary dependency used only as a contract test.
  const { calculateCanonicalChart } = await server.ssrLoadModule('/src/lib/canonical/calculateCanonicalChart.ts')
  const { CURRENT_CALCULATION_VERSION } = await server.ssrLoadModule('/src/lib/canonical/version.ts')
  const { produceJudgmentEngineFacts } = await load('producers/index')
  const { createExecutionScopeContext, producerPeriod } = await load('runtime/executionScopeContext')
  const { evaluateStemCombination } = await load('evaluators/stemCombination/index')
  const chart = calculateCanonicalChart({ date: { year: 1964, month: 2, day: 9 }, time: { known: true, value: { hour: 19, minute: 30 } },
    gender: '女性', timeCorrectionMode: 'none' }, { referenceTime: time, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
  const producer = produceJudgmentEngineFacts(chart, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
  const period = producer.entities.filter((item) => item.sourceScope === 'greatLuck' && item.part === 'stem').map((item) => producerPeriod(producer, item.periodRef))
    .find((item) => item.from.kind === 'exact' && item.to.kind === 'exact' && item.from.instant <= time && time < item.to.instant)
  assert.ok(period)
  const natal = createExecutionScopeContext(producer, { executionId: 'stem-test', stage: 'natal', referenceTime: time,
    selectedPeriodRefs: {}, natalInspectionPeriod: period })
  const great = createExecutionScopeContext(producer, { executionId: 'stem-test', stage: 'greatLuck', referenceTime: time, selectedPeriodRefs: { greatLuck: period.periodId } })
  const combination = evaluateStemCombination({ producer, context: great, upstream: evaluateStemCombination({ producer, context: natal }) })
  const event = combination.events.find((item) => item.effect === 'stopping')
  assert.ok(event)
  const victim = producer.entities.find((item) => item.origin === 'natal' && event.participantEntityIds.includes(item.entityId))
  assert.ok(victim)
  const stopped = combination.states.find((item) => item.targetEntityId === victim.entityId)
  const prior = combination.bundle.states.find((item) => item.stateId === stopped.priorStateRef)
  const stemBoundary = result()
  addJudgment(stemBoundary, victim.entityId)
  stemBoundary.scopeId = stemBoundary.byeong.scopeId = great.scopeId
  const j = stemBoundary.byeong.judgments[0]
  j.provenance.producerRef = producer.producerRef
  j.runtimeState = prior
  stemBoundary.byeong.applications[0].scopeId = great.scopeId
  stemBoundary.byeong.roleStates[0].validScopeId = great.scopeId
  stemBoundary.byeong.roleStates[0].applicationRef.scopeId = great.scopeId
  const dependency = { contractVersion: '1', scopeId: great.scopeId, dependencyId: 'dependency', byeongJudgmentId: j.judgmentId,
    damagePathId: 'damage', sourceEntityId: victim.entityId, sourceStateRef: prior.stateId, dependency: 'required',
    producerRef: producer.producerRef, evidenceIds: ['dependency-receipt'] }
  stemBoundary.evidence.records.push(raw, citedRule, receipt(dependency, 'dependency', 'I-04-2', producer.producerRef, 'dependency-receipt'))

  check(() => {
    const { effects, evidence } = produceStemPathEffects(stemBoundary, combination, [dependency])
    assert.equal(effects.length, 1)
    assert.equal(effects[0].effectType, 'complete-relief')
    const effect = effects[0]
    const input = baseInput(clone(stemBoundary))
    input.boundary.evidence.records.push(...evidence)
    input.effects = effects
    input.states = combination.states
    input.relations = combination.bundle.relations.filter((item) => effect.relationFactIds.includes(item.relationFactId))
    input.candidates = [{ candidateId: 'actor', entityId: effect.candidateEntityId, scopeId: great.scopeId, evidenceIds, provenance,
      runtimeState: combination.states.find((item) => item.targetEntityId === effect.candidateEntityId) }]
    input.links = [{ effectPathId: 'stem-link', candidateId: 'actor', byeongJudgmentId: j.judgmentId, damagePathId: 'damage',
      scopeId: great.scopeId, relationFactIds: effect.relationFactIds, evidenceIds }]
    assert.equal(evaluate(input).status, 'confirmed')
  })
  check(() => {
    assert.deepEqual(produceStemPathEffects(stemBoundary, combination, []).effects, [])
    assert.deepEqual(produceStemPathEffects(stemBoundary, combination, [{ ...dependency, dependency: 'unknown' }]).effects, [])
    assert.equal(evaluate(baseInput(stemBoundary)).status, 'deferred')
  })
  console.log(`GuEung v1 verification passed (${checks} checks; synthetic effects and dependency are contract inputs).`)
} finally {
  await server.close()
}
