import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
const check = (fn) => { fn(); checks++ }
try {
  const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const { evaluateStemCombination: evaluate } = await load('judgment/evaluators/stemCombination/index')
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
  const natal = evaluate(natalInput)
  const greatInput = { producer, context: context(producer, 'greatLuck', jan), upstream: natal }
  const great = evaluate(greatInput)
  const yearJanInput = { producer, context: context(producer, 'yearlyLuck', jan), upstream: great }
  const yearJan = evaluate(yearJanInput)
  const yearJuly = evaluate({ producer, context: context(producer, 'yearlyLuck', july), upstream: great })
  const monthInput = { producer, context: context(producer, 'monthlyLuck', jan), upstream: yearJan }
  const fullInputBefore = JSON.stringify(monthInput)
  freeze(monthInput)
  const month = evaluate(monthInput)
  const entity = (output, positionOrScope, value) => output.entities.find((e) => e.part === 'stem'
    && (e.position === positionOrScope || e.sourceScope === positionOrScope) && (!value || e.value === value))
  const state = (result, item) => result.states.find((s) => s.targetEntityId === item.entityId)
  const natalYear = entity(producer, 'year'), natalMonth = entity(producer, 'month'), natalTime = entity(producer, 'time')
  const selectedStem = (result, scope) => producer.entities.find((e) => e.part === 'stem' && e.sourceScope === scope
    && e.periodRef === result.context.selectedPeriodRefs[scope])
  const greatStem = selectedStem(great, 'greatLuck'), janYearStem = selectedStem(yearJan, 'yearlyLuck'), monthStem = selectedStem(month, 'monthlyLuck')
  check(() => assert.equal(month.status, 'evaluated'))
  check(() => assert.equal(JSON.stringify(month), JSON.stringify(evaluate(monthInput))))
  check(() => { assert.equal(JSON.stringify(producer), saved); assert.equal(JSON.stringify(monthInput), fullInputBefore) })
  check(() => assert.deepEqual(month.context.includedScopes, ['natal', 'yearlyLuck', 'monthlyLuck']))
  check(() => assert.ok(month.events.every((event) => !event.participantEntityIds.includes(greatStem.entityId))))
  check(() => assert.equal(state(month, janYearStem).functionalState, 'weakened'))
  check(() => assert.equal(state(month, monthStem).functionalState, 'weakened'))
  check(() => assert.equal(state(month, natalMonth).functionalState, 'active'))
  check(() => assert.ok(!month.events.some((event) => event.effect === 'stopping' && event.participantEntityIds.includes(monthStem.entityId))))
  check(() => assert.equal(state(great, natalYear).functionalState, 'stopped'))
  check(() => assert.equal(state(great, greatStem).functionalState, 'stopped'))
  check(() => assert.equal(state(yearJuly, natalTime).functionalState, 'stopped'))
  check(() => assert.equal(state(month, natalYear).originMode, 'inherited'))
  check(() => assert.equal(state(month, natalYear).inheritedFromStateRef, state(great, natalYear).stateId))
  check(() => assert.deepEqual(state(month, natalYear).validity, state(great, natalYear).validity))
  check(() => assert.deepEqual(state(month, natalYear).causingApplicationRefs, state(great, natalYear).causingApplicationRefs))
  check(() => assert.ok(month.bundle.carry.entries.filter((entry) => entry.inheritedIntoScopeId === month.context.scopeId)
    .every((entry) => entry.sourceStage === 'great' && entry.inheritedThrough.includes(yearJan.context.scopeId))))
  check(() => assert.equal(selectedStem(month, 'yearlyLuck').value, '丙'))
  check(() => assert.equal(selectedStem(yearJuly, 'yearlyLuck').value, '丁'))
  check(() => assert.throws(() => evaluate({ ...monthInput, upstream: yearJuly }), /period mismatch|parent/))
  check(() => assert.equal(month.bundle.carry.processedRelationRecords.filter((record) => record.sourceScopeId === month.context.scopeId
    && record.effectClass === 'natal-change').length, 0))
  check(() => assert.deepEqual(month.roleStates, []))
  check(() => assert.equal(month.hiddenStemJudgments, 'deferred-not-consumed'))
  check(() => assert.equal(month.publicationReady, false))
  check(() => assert.equal(month.regressionReady, false))
  check(() => assert.ok(month.states.every((s) => s.transition !== 'restored' && s.functionalState !== 'inherited')))
  check(() => contracts.validateContractBundle(month.bundle))
  check(() => {
    const duplicate = clone(month.bundle)
    const entry = duplicate.carry.entries.find((e) => e.inheritedIntoScopeId === month.context.scopeId)
    duplicate.carry.entries.push({ ...entry, carryEntryId: 'different-entry', changeId: 'different-change' })
    duplicate.scopes.find((s) => s.scopeId === month.context.scopeId).inheritedChangeIds.push('different-change')
    assert.throws(() => contracts.validateContractBundle(duplicate), /duplicate original state\/provenance/)
  })
  // Frozen C outputs are consumed only by assertions, never evaluator/producer input.
  check(() => {
    const c10 = C.split('C-10-1.')[1].split('C-10-2.')[0]
    const directNatal = c10.split('\n').find((line) => line.startsWith('1 원국·출처\t')).split('\t')[1].split('(')[0].trim()
    const actualNatal = ['year', 'month', 'day', 'time'].map((position) => chart.chart.pillars[position].value.ganZhi).join(' ')
    assert.equal(actualNatal, directNatal)
    const expected = C.split('C-10-2.')[1].split('\n').find((line) => line.startsWith('2027.1 辛丑\t')).split('\t')[1]
    assert.ok(expected.includes('상신 丙 유지'))
    const trace = JSON.stringify({ source: 'C rev215 C-10-2 / 2027.1 CS-005', expected,
      events: month.events, states: month.states, processing: month.bundle.carry.processedRelationRecords,
      evidence: month.bundle.evidence.records }, null, 2)
    assert.equal(natalMonth.value, '丙', trace)
    assert.equal(state(month, natalMonth).functionalState, 'active', trace)
    // The categorical favorable/unfavorable labels and supporting-god role are intentionally not evaluated.
  })
  // Rule-unit synthetic FACT arrangements only: deliberately not valid calendar-chart assertions.
  // They exercise selection on arbitrary stems while borrowing a finite period envelope.
  // No altered chart is returned to canonical code or used as a CS regression expectation.
  function synthetic(natalStems, greatValue = '己', yearValue = '己') {
    const facts = clone(chart)
    for (const [index, position] of ['year', 'month', 'day', 'time'].entries()) {
      const pillar = facts.chart.pillars[position].value
      pillar.stem = natalStems[index]; pillar.ganZhi = natalStems[index] + pillar.branch
    }
    for (const card of facts.greatLuck.value.cards) { card.stem = greatValue; card.pillar = greatValue + Array.from(card.pillar)[1] }
    for (const card of facts.yearlyLuck.cards) { card.stem = yearValue; card.pillar = yearValue + Array.from(card.pillar)[1] }
    const produced = p.produceJudgmentEngineFacts(facts, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
    const n = evaluate({ producer: produced, context: context(produced, 'natal', jan, 'synthetic-natal') })
    return { produced, n, g: evaluate({ producer: produced, context: context(produced, 'greatLuck', jan, 'synthetic-great'), upstream: n }) }
  }
  check(() => {
    const { produced, g } = synthetic(['甲', '甲', '丙', '甲'])
    assert.equal(state(g, entity(produced, 'year')).functionalState, 'stopped')
    assert.equal(state(g, entity(produced, 'month')).functionalState, 'active')
    assert.equal(state(g, entity(produced, 'time')).functionalState, 'active')
  })
  check(() => {
    const { produced, g } = synthetic(['丙', '甲', '丙', '甲'])
    assert.equal(state(g, entity(produced, 'month')).functionalState, 'stopped')
    assert.equal(state(g, entity(produced, 'time')).functionalState, 'active')
  })
  check(() => {
    const { produced, g } = synthetic(['丙', '丙', '丙', '甲'])
    assert.equal(state(g, entity(produced, 'time')).functionalState, 'stopped')
  })
  check(() => {
    const { produced, g } = synthetic(['丙', '丙', '甲', '丙'])
    assert.equal(state(g, entity(produced, 'day')).functionalState, 'active')
    assert.ok(g.events.length === 0)
    assert.ok(g.bundle.applications.some((a) => a.ruleId === 'OP-T04'))
  })
  check(() => {
    const { produced, g } = synthetic(['甲', '甲', '丙', '甲'])
    const y = evaluate({ producer: produced, context: context(produced, 'yearlyLuck', jan, 'synthetic-year'), upstream: g })
    assert.equal(state(y, entity(produced, 'year')).originMode, 'inherited')
    assert.equal(state(y, entity(produced, 'month')).functionalState, 'stopped')
    assert.ok(y.bundle.applications.some((a) => a.scopeId === y.context.scopeId && a.ruleId === 'OP-T08'))
    assert.ok(!y.events.some((e) => e.participantEntityIds.includes(entity(produced, 'year').entityId)))
  })
  check(() => {
    const tampered = clone(yearJan); tampered.states = []
    assert.throws(() => evaluate({ ...monthInput, upstream: tampered }), /incomplete/)
  })
  check(() => {
    const duplicate = clone(yearJan); duplicate.states.push(clone(duplicate.states.find((s) => s.originMode === 'inherited')))
    assert.throws(() => evaluate({ ...monthInput, upstream: duplicate }), /incomplete|duplicated/)
  })
  check(() => {
    const wrongScope = clone(monthInput.context)
    wrongScope.includedEntityIds.push(greatStem.entityId)
    assert.throws(() => evaluate({ ...monthInput, context: wrongScope }), /altered/)
  })
  check(() => {
    const withoutHidden = clone(producer)
    withoutHidden.hiddenStems = []; withoutHidden.hiddenStemEntries = []
    const result = evaluate({ ...monthInput, producer: withoutHidden })
    assert.deepEqual(result.states, month.states)
  })
  check(() => assert.ok(yearJan.states.some((s) => s.targetEntityId === greatStem.entityId
    && s.stateId === state(great, greatStem).stateId && s.functionalState === 'stopped')))
  check(() => assert.ok(month.events.flatMap((e) => e.ruleIds).every((id) => id !== 'OP-T11')))
  check(() => assert.ok(month.bundle.carry.entries.every((e) =>
    !month.bundle.states.some((s) => s.stateId === e.sourceStateRef && s.functionalState === 'weakened'))))
  console.log(`CS-005 stem-combination: ${checks} checks passed; structural expectation matched; full regression/publication remain NOT READY.`)
} finally { await server.close() }
