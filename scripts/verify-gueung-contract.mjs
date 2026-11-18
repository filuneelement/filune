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
  const { guEungStatusSchema, guEungJudgmentSchema } = await load('contracts/guEung')
  const { prepareGuEungBoundary: prepare } = await load('runtime/guEungBoundary')
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
  check(() => {
    const input = result('no-byeong')
    addJudgment(input, 'excluded', { status: 'rejected' })
    const output = prepare(input)
    assert.equal(output.status, 'not-applicable')
    assert.deepEqual(output.damagePaths, [])
    assert.deepEqual(output.candidates, [])
    assert.deepEqual(output.roleStates, [])
  })
  check(() => {
    const input = result('deferred')
    addJudgment(input, 'unresolved', { status: 'deferred' })
    const output = prepare(input)
    assert.equal(output.status, 'deferred')
    assert.deepEqual(output.damagePaths, [])
    assert.deepEqual(output.candidates, [])
  })
  check(() => {
    const output = prepare(mixed())
    assert.equal(output.status, 'deferred')
    assert.deepEqual(output.damagePaths.map((path) => [path.byeongEntityId, path.damagePathId]),
      [['first', 'damage'], ['second', 'damage']])
    assert.deepEqual(output.candidates, [])
    assert.deepEqual(output.effectLinks, [])
    assert.deepEqual(output.roleStates, [])
    assert.deepEqual(output.applications, [])
  })
  check(() => {
    const input = mixed()
    input.byeong.scopeId = 'wrong'
    assert.throws(() => prepare(input), /scope/)
    input.byeong.scopeId = scopeId
    input.byeong.judgments[0].runtimeState.scopeId = 'wrong'
    assert.throws(() => prepare(input), /scope/)
    assert.throws(() => prepare(result('has-byeong')), /requires a confirmed/)
    const contradictory = mixed()
    contradictory.byeong.status = 'no-byeong'
    assert.throws(() => prepare(contradictory), /contradicts/)
  })
  check(() => {
    const input = mixed()
    input.referenceTime = validity.to.instant
    const output = prepare(input)
    assert.deepEqual(output.damagePaths, [])
    assert.ok(output.reasonCodes.includes('BYEONG_STATE_OUTSIDE_CONFIRMED_VALIDITY'))
  })
  check(() => {
    const input = mixed()
    input.evidence.records = []
    const output = prepare(input)
    assert.deepEqual(output.damagePaths, [])
    assert.ok(output.reasonCodes.includes('BYEONG_DAMAGE_EVIDENCE_UNAVAILABLE'))
    input.evidence.records = [{ ...clone(record), usage: 'regression-expectation' }]
    assert.throws(() => prepare(input), /regression expectations/)
  })
  function graph() {
    const output = prepare(mixed())
    output.candidates = ['one', 'two'].map((candidateId) => ({
      candidateId, entityId: candidateId, scopeId, evidenceIds, provenance, runtimeState: null,
    }))
    output.effectLinks = output.candidates.flatMap(({ candidateId }) => output.damagePaths.map(({ byeongJudgmentId, damagePathId }) => ({
      effectPathId: `effect:${candidateId}:${byeongJudgmentId}`, candidateId, byeongJudgmentId, damagePathId,
      scopeId, relationFactIds: ['a', 'b'], evidenceIds,
    })))
    return output
  }
  check(() => {
    const output = graph()
    assert.deepEqual(guEungJudgmentSchema.parse(output).effectLinks, output.effectLinks)
    assert.equal(output.effectLinks.length, 4)
    output.effectLinks[0].byeongJudgmentId = 'unavailable'
    assert.throws(() => guEungJudgmentSchema.parse(output), /invalid effect links/)
  })
  check(() => {
    const output = graph(), link = output.effectLinks[0]
    output.effectLinks.push(clone(link))
    assert.throws(() => guEungJudgmentSchema.parse(output), /duplicate/)
    output.effectLinks[4] = { ...link, effectPathId: 'new-id', relationFactIds: ['b', 'a'] }
    assert.throws(() => guEungJudgmentSchema.parse(output), /duplicate/)
  })
  check(() => {
    const output = graph()
    for (const status of ['no-gu-eung', 'confirmed']) {
      assert.ok(guEungStatusSchema.is(status))
      assert.throws(() => guEungJudgmentSchema.parse({ ...output, status }), /unsupported 구응 conclusion/)
      assert.throws(() => guEungJudgmentSchema.parse({ ...output, status, coverage: 'complete' }), /unsupported 구응 conclusion/)
    }
    assert.throws(() => guEungJudgmentSchema.parse({ ...output, roleStates: mixed().byeong.roleStates }), /unsupported 구응 conclusion/)
  })
  check(() => {
    const input = freeze(mixed()), before = JSON.stringify(input)
    const output = prepare(input)
    assert.equal(JSON.stringify(output), JSON.stringify(prepare(input)))
    const reversed = clone(input)
    reversed.byeong.judgments.reverse()
    assert.equal(JSON.stringify(output), JSON.stringify(prepare(reversed)))
    assert.equal(JSON.stringify(input), before)
  })
  console.log(`GuEung contract verification passed (${checks} checks).`)
} finally {
  await server.close()
}
