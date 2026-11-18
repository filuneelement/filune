import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
try {
  const { evaluateLuckToLuckCombination, UnsupportedPriorStopLuckPairError } =
    await server.ssrLoadModule('/src/lib/judgment/evaluators/stemCombination/index.ts')
  const from = '2027-02-04T00:00:00.000Z'
  const to = '2027-03-06T00:00:00.000Z'
  const validity = { periodId: 'test-month', from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } }
  const relation = { relationFactId: 'year-month-combination', existence: 'present',
    participantEntityIds: ['year-stem', 'month-stem'], evidenceIds: ['test-evidence'], uncertaintyIds: [] }
  function makeWork(status, { referenceTime = from, stopRule = 'OP-T07' } = {}) {
    return {
      input: { context: { scopeId: 'monthly', referenceTime, effectivePeriod: validity, executionId: 'eligibility-contract' } },
      stems: [{ entityId: 'year-stem', origin: 'luck' }, { entityId: 'month-stem', origin: 'luck' }],
      relations: [relation],
      states: new Map([['year-stem', { stateId: 'year-state', functionalState: status, validity,
        causingApplicationRefs: [{ ruleId: stopRule }], uncertaintyIds: [] }],
      ['month-stem', { stateId: 'month-state', functionalState: 'active', uncertaintyIds: [] }]]),
      bundle: { applications: [], states: [], carry: { processedRelationRecords: [] } },
      events: [], excludedFromNatal: new Set(),
    }
  }
  let checks = 0
  const check = (run) => { run(); checks++ }

  check(() => {
    const work = makeWork('stopped')
    const before = JSON.stringify([...work.states])
    evaluateLuckToLuckCombination(work)
    assert.equal(JSON.stringify([...work.states]), before)
    assert.deepEqual(work.events, [])
    assert.deepEqual(work.relations, [relation])
    assert.deepEqual(work.bundle.applications.map((app) => app.ruleId), ['OP-T08'])
  })
  for (const referenceTime of ['2027-02-03T23:59:59.999Z', to]) {
    check(() => {
      const work = makeWork('stopped', { referenceTime })
      assert.throws(() => evaluateLuckToLuckCombination(work), UnsupportedPriorStopLuckPairError)
      assert.equal(work.states.get('year-stem').functionalState, 'stopped')
      assert.deepEqual(work.bundle.applications, [])
    })
  }
  check(() => {
    const work = makeWork('active')
    evaluateLuckToLuckCombination(work)
    assert.deepEqual(work.events.map((event) => event.ruleIds), [['OP-T10']])
    assert.ok([...work.states.values()].every((state) => state.functionalState === 'weakened'))
  })
  for (const [status, options] of [['weakened', {}], ['stopped', { stopRule: 'unspecified-function' }]]) {
    check(() => {
      const work = makeWork(status, options)
      assert.throws(() => evaluateLuckToLuckCombination(work), UnsupportedPriorStopLuckPairError)
      assert.equal(work.states.get('year-stem').functionalState, status)
      assert.deepEqual(work.events, [])
      assert.deepEqual(work.bundle.applications, [])
    })
  }
  console.log(`Stem combination eligibility contract: ${checks}/6 passed.`)
} finally {
  await server.close()
}
