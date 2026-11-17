import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
const check = (fn) => { fn(); checks++ }
try {
  const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const { evaluateNatalStemCombination: evaluate } = await load('judgment/evaluators/natalStemCombination/index')
  const p = await load('judgment/producers/index')
  const r = await load('judgment/runtime/index')
  const contracts = await load('judgment/contracts/index')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const A = await readFile('src/docs/source/A_rev179.md', 'utf8')
  const C = await readFile('src/docs/source/C_rev215.md', 'utf8')
  const clone = (x) => JSON.parse(JSON.stringify(x))
  const freeze = (x) => { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x) } return x }
  const jan = '2027-01-15T00:00:00.000Z', july = '2027-07-15T00:00:00.000Z'
  const c1 = C.split('C-1. CS-005')[1].split('③ 전문가')[0]
  const birthDate = /출생일\t(\d{4})-(\d{2})-(\d{2})/.exec(c1)
  const range = /戌시\((\d{2}):(\d{2})~/.exec(c1)
  assert.ok(birthDate && range)
  // A synthetic representative AT THE DOCUMENTED RANGE'S LOWER BOUND, not an observed exact birth time.
  // Full boundary-range calculation, independent validation and publication remain unverified.
  const chart = calculateCanonicalChart({ date: { year: +birthDate[1], month: +birthDate[2], day: +birthDate[3] },
    time: { known: true, value: { hour: +range[1], minute: +range[2] } }, gender: '女性', timeCorrectionMode: 'none' },
    { referenceTime: jan, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
  const producer = p.produceJudgmentEngineFacts(chart, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
  const saved = JSON.stringify(producer)
  freeze(producer)
  const periodAt = (output, scope, at) => {
    const refs = [...new Set(output.entities.filter((e) => e.sourceScope === scope).map((e) => e.periodRef))]
    const result = refs.find((ref) => {
      const period = r.producerPeriod(output, ref)
      return period.from.kind === 'exact' && period.to.kind === 'exact' && period.from.instant <= at && at < period.to.instant
    })
    assert.ok(result, `${scope} at ${at}`); return result
  }
  function context(output, stage, at, name = stage) {
    const selectedPeriodRefs = {}
    if (['greatLuck', 'yearlyLuck'].includes(stage)) selectedPeriodRefs.greatLuck = periodAt(output, 'greatLuck', at)
    if (['yearlyLuck', 'monthlyLuck'].includes(stage)) selectedPeriodRefs.yearlyLuck = periodAt(output, 'yearlyLuck', at)
    if (stage === 'monthlyLuck') selectedPeriodRefs.monthlyLuck = periodAt(output, 'monthlyLuck', at)
    return r.createExecutionScopeContext(output, { executionId: `test:${name}:${at}`, stage, referenceTime: at, selectedPeriodRefs,
      ...(stage === 'natal' ? { natalInspectionPeriod: r.producerPeriod(output, periodAt(output, 'greatLuck', at)) } : {}) })
  }
  const natalInput = { producer, context: context(producer, 'natal', jan) }
  const result = evaluate(natalInput)
  const trace = (x) => JSON.stringify({ events: x.events, states: x.states, evidence: x.bundle.evidence }, null, 2)
  check(() => assert.equal(result.status, 'evaluated', trace(result)))
  check(() => assert.equal(JSON.stringify(result), JSON.stringify(evaluate(natalInput))))
  check(() => assert.equal(JSON.stringify(producer), saved))
  check(() => assert.ok(result.states.every((s) => producer.entities.find((e) => e.entityId === s.targetEntityId).sourceScope === 'natal')))
  check(() => assert.deepEqual(result.roleStates, []))
  check(() => assert.equal(result.hiddenStemJudgments, 'deferred-not-consumed'))
  check(() => assert.ok(!JSON.stringify(result).includes('structureJudgments')))
  check(() => assert.deepEqual(result.provenance.producerRef, producer.producerRef))
  check(() => {
    const expected = C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n').find((line) => line.startsWith('10 원국 천간합\t')).split('\t')[1]
    assert.equal(expected, '없음')
    assert.equal(result.events.length, 0, trace(result))
    assert.ok(result.states.every((s) => s.functionalState === 'active'), trace(result))
  })
  function synthetic(values) {
    const facts = clone(chart)
    for (const [i, pos] of ['year', 'month', 'day', 'time'].entries()) {
      facts.chart.pillars[pos].value.stem = values[i]
      facts.chart.pillars[pos].value.ganZhi = values[i] + facts.chart.pillars[pos].value.branch
    }
    const output = p.produceJudgmentEngineFacts(facts, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
    const input = { producer: output, context: context(output, 'natal', jan, 'unit') }
    const before = JSON.stringify(input); freeze(input)
    const actual = evaluate(input)
    assert.equal(JSON.stringify(input), before)
    assert.equal(JSON.stringify(actual), JSON.stringify(evaluate(input)))
    assert.equal(actual.status, 'evaluated', trace(actual))
    const used = actual.events.filter((e) => e.stopping).flatMap((e) => e.participantEntityIds)
    assert.equal(new Set(used).size, used.length)
    for (const event of actual.events) {
      assert.equal(event.sourceScope, 'natal')
      assert.ok(event.evidenceIds.length && event.before.length === 2 && event.after.length === 2)
      assert.deepEqual(event.provenance.producerRef, output.producerRef)
      assert.ok(event.ruleIds.every((id) => ['OP-T01','OP-T02','OP-T04','OP-T09','OP-T12'].includes(id) && A.includes(id)))
    }
    assert.ok(actual.bundle.states.filter((s) => s.functionalState !== 'unknown').every((s) => s.causingApplicationRefs.length && s.causingApplicationRefs.every((a) => ['OP-T01','OP-T02','OP-T04','OP-T09','OP-T12'].includes(a.ruleId) && A.includes(a.ruleId))))
    assert.deepEqual(actual.roleStates, [])
    assert.equal(actual.hiddenStemJudgments, 'deferred-not-consumed')
    return { actual, state: (pos) => actual.states.find((s) => output.entities.find((e) => e.entityId === s.targetEntityId).position === pos) }
  }
  check(() => { const {actual,state} = synthetic(['甲','己','丙','己']); assert.equal(state('year').functionalState,'stopped'); assert.equal(state('time').functionalState,'active'); assert.equal(actual.events.length,2) })
  check(() => { const {state} = synthetic(['壬','壬','甲','丁']); assert.equal(state('year').functionalState,'active'); assert.equal(state('month').functionalState,'stopped'); assert.equal(state('time').functionalState,'stopped') })
  check(() => { const {actual,state} = synthetic(['甲','丙','壬','己']); assert.equal(actual.events[0].stopping,false); assert.equal(state('year').functionalState,'active'); assert.ok(actual.events[0].ruleIds.includes('OP-T02')) })
  check(() => { const {actual,state} = synthetic(['甲','丙','己','壬']); assert.equal(state('day').functionalState,'active'); assert.ok(actual.events.some((e) => e.ruleIds.includes('OP-T04') && !e.stopping)) })
  check(() => { const {state} = synthetic(['丙','丁','甲','壬']); assert.equal(state('month').functionalState,'stopped'); assert.equal(state('time').functionalState,'stopped') })
  check(() => assert.throws(() => evaluate({ producer, context: context(producer, 'greatLuck', jan) }), /Natal execution/))
  check(() => { const altered = clone(natalInput); altered.context.includedEntityIds.push(producer.entities.find((e) => e.sourceScope === 'greatLuck').entityId); assert.throws(() => evaluate(altered), /altered|natal/i) })
  check(() => { const stripped = clone(producer); stripped.hiddenStems = []; stripped.hiddenStemEntries = []; stripped.roleStates = []; assert.deepEqual(evaluate({ ...natalInput, producer: stripped }).states, result.states) })
  console.log(`CS-005 natal stem-combination: ${checks} checks passed; C-10-1 expectation matched.`)
} finally { await server.close() }
