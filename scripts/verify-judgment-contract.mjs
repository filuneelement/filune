import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false } })
try {
  const load = (name) => server.ssrLoadModule(`/src/lib/${name}.ts`)
  const { evaluateJudgments } = await load('judgment/evaluateJudgments')
  const { fromCanonical } = await load('judgment/facts/fromCanonical')
  const { PRODUCTION_MANIFEST, PRODUCTION_REGISTRY } = await load('judgment/versions/manifest')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const birth = { date: { year: 1985, month: 1, day: 4 },
    time: { known: true, value: { hour: 9, minute: 0 } }, gender: '男性', timeCorrectionMode: 'none' }
  const calculation = { referenceTime: '2026-06-01T00:00:00.000Z',
    calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2026 }
  const chart = calculateCanonicalChart(birth, calculation)
  const factId = 'canonical:/chart/pillars/day/value/stem'
  const clone = (value) => JSON.parse(JSON.stringify(value))
  const freeze = (value) => {
    if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
    return value
  }
  const before = JSON.stringify(chart)
  freeze(chart)
  const production = { manifest: PRODUCTION_MANIFEST, registry: PRODUCTION_REGISTRY }
  const empty = evaluateJudgments(chart, production)
  assert.deepEqual(empty.applications, [])
  assert.deepEqual(empty.evidence, [])
  assert.equal(PRODUCTION_REGISTRY.rules.length, 0)
  assert.equal(PRODUCTION_MANIFEST.rules.length, 0)
  assert.equal(empty.completeness, 'complete') // Complete empty execution, not document coverage.

  // Synthetic contract rules exist only in this script; no astrology predicates or judgments.
  const rule = (id, options = {}) => ({
    id, version: 'test-1', description: 'Contract-only fixed JSON output',
    sources: [{ ruleId: id, ruleVersion: 'test-1', sourceDocument: 'TEST', sourceRevision: 1,
      sourceSection: 'verify-judgment-contract', sourceContentHash: 'synthetic-test-source-1' }],
    requiredInputs: [{ key: 'input', factId }], dependsOn: [], outputSchemaId: 'fixed-test-json', reviewPolicyId: 'test-auto',
    evaluator: ({ facts, dependencyResults }) => {
      assert.ok(!('birthInput' in facts))
      assert.deepEqual(Object.keys(facts), [factId])
      assert.ok(Object.isFrozen(facts[factId]))
      return { status: 'applied', result: { testOnly: true }, evidence: [{
        factIds: [factId], dependencyApplicationIds: Object.values(dependencyResults).map(({ id }) => id),
        clauseId: 'fixed-test-output', observedValues: { input: facts[factId].value }, outcome: 'satisfied',
      }] }
    }, ...options,
  })
  const review = (id, status, required) => ({ id, scope: 'test', evaluate: () => ({
    policyId: id, status, operatorApprovalRequired: required, reasonCodes: ['TEST_ONLY'],
  }) })
  const policies = [review('test-auto', 'auto-approved', false), review('test-review', 'review-required', true),
    review('test-blocked', 'blocked', 'unresolved')]
  function context(rules) {
    return {
      manifest: { ...clone(PRODUCTION_MANIFEST), id: 'test-manifest-1', scope: 'test',
        rules: rules.map((r) => ({ ruleId: r.id, ruleVersion: r.version, sources: clone(r.sources) })) },
      registry: { rules, outputSchemas: [{ id: 'fixed-test-json', validate: (value) => value?.testOnly === true }] },
      reviewPolicies: policies,
    }
  }
  const rules = [rule('second', { dependsOn: ['first'] }), rule('first')]
  const execution = context(rules)
  const result = evaluateJudgments(chart, execution)
  assert.equal(result.completeness, 'complete')
  assert.deepEqual(result.applications.map(({ rule: ref }) => ref.ruleId), ['first', 'second'])
  assert.equal(result.evidence.length, 2)
  assert.deepEqual(result.applications[0].inputsUsed, [{ inputKey: 'input', factId }])
  assert.deepEqual(result.evidence[1].dependencyApplicationIds, ['application:first'])
  assert.equal(JSON.stringify(result), JSON.stringify(evaluateJudgments(chart, execution)))
  assert.equal(JSON.stringify(chart), before)
  assert.deepEqual(result, JSON.parse(JSON.stringify(result)))
  const reversed = { ...execution, registry: { ...execution.registry, rules: [...rules].reverse() } }
  assert.deepEqual(result, evaluateJudgments(chart, reversed))

  const facts = fromCanonical(chart)
  const day = facts.find(({ id }) => id === factId)
  assert.equal(day.value, chart.chart.pillars.day.value.stem)
  assert.equal(day.assessment, 'confirmed')
  assert.equal(day.canonicalPointer, '/chart/pillars/day/value/stem')
  const hidden = facts.find(({ canonicalPointer }) => canonicalPointer === '/chart/basicRelations/day/value/relationships/hiddenStems')
  assert.deepEqual(hidden.value, chart.chart.basicRelations.day.value.relationships.hiddenStems)
  assert.ok(facts.some(({ canonicalPointer }) => canonicalPointer.startsWith('/greatLuck/value/cards/')))
  assert.ok(facts.some(({ canonicalPointer }) => canonicalPointer.startsWith('/yearlyLuck/cards/')))
  assert.ok(facts.some(({ canonicalPointer }) => canonicalPointer.startsWith('/monthlyLuck/cards/')))

  assert.throws(() => evaluateJudgments(chart, context([rule('dup'), rule('dup')])), /Duplicate/)
  assert.throws(() => evaluateJudgments(chart, context([rule('one', { dependsOn: ['missing'] })])), /Missing dependency/)
  assert.throws(() => evaluateJudgments(chart, context([rule('one', { dependsOn: ['two'] }), rule('two', { dependsOn: ['one'] })])), /cycle/)
  assert.throws(() => evaluateJudgments(chart, context([rule('one', { outputSchemaId: 'absent' })])), /output schema/)
  const absent = context([rule('one')]); absent.manifest.rules = []
  assert.throws(() => evaluateJudgments(chart, absent), /Manifest mismatch/)
  const mismatch = context([rule('one')]); mismatch.manifest.rules[0].ruleVersion = 'wrong'
  assert.throws(() => evaluateJudgments(chart, mismatch), /Manifest mismatch/)
  const sourceMismatch = context([rule('one')]); sourceMismatch.manifest.rules[0].sources[0].sourceRevision = 2
  assert.throws(() => evaluateJudgments(chart, sourceMismatch), /Manifest mismatch/)
  assert.throws(() => evaluateJudgments(chart, { ...execution, manifest: { ...execution.manifest, engineVersion: 'wrong' } }), /Manifest mismatch/)
  assert.throws(() => evaluateJudgments(chart, { ...execution, manifest: { ...execution.manifest, scope: 'production' } }), /Production rules/)
  assert.throws(() => evaluateJudgments({ ...chart, schemaVersion: 'other' }, production), /canonical schema/)
  const badVersion = clone(chart); badVersion.context.calculationVersion.id = 'other'
  assert.throws(() => evaluateJudgments(badVersion, production), /calculation version/)

  assert.throws(() => evaluateJudgments(chart, context([rule('no-evidence', {
    evaluator: () => ({ status: 'applied', result: { testOnly: true }, evidence: [] }),
  })])), /requires evidence/)
  const wrongOutput = rule('bad-output')
  const originalOutput = wrongOutput.evaluator
  wrongOutput.evaluator = (args) => ({ ...originalOutput(args), result: { testOnly: false } })
  assert.throws(() => evaluateJudgments(chart, context([wrongOutput])), /Output schema rejected/)
  const mutator = rule('mutator')
  mutator.evaluator = ({ facts }) => {
    facts[factId].value = 'mutation'
    throw new Error('mutation should have been rejected')
  }
  assert.throws(() => evaluateJudgments(chart, context([mutator])), TypeError)
  assert.equal(JSON.stringify(chart), before)
  const badEvidenceRule = rule('bad-link')
  const evaluator = badEvidenceRule.evaluator
  badEvidenceRule.evaluator = (args) => {
    const output = evaluator(args); output.evidence[0].factIds = ['made-up']; return output
  }
  assert.throws(() => evaluateJudgments(chart, context([badEvidenceRule])), /Invalid evidence/)

  for (const [status, requiredId] of [
    ['provisional', 'canonical:/chart/pillars/year/value/stem'],
    ['unknown', 'canonical:/chart/pillars/time'],
    ['unsupported', 'canonical:/chart/pillars/time'],
  ]) {
    const input = status === 'provisional'
      ? { ...birth, date: { year: 2026, month: 2, day: 4 }, time: { known: false } }
      : status === 'unknown' ? { ...birth, time: { known: false } }
        : { ...birth, timeCorrectionMode: 'trueSolarTime' }
    const uncertain = calculateCanonicalChart(input, calculation)
    let called = false
    const ctx = context([rule('uncertain', { requiredInputs: [{ key: 'uncertain', factId: requiredId }],
      evaluator: () => { called = true; throw new Error('must not execute') } }),
    rule('dependent', { dependsOn: ['uncertain'] })])
    const judged = evaluateJudgments(uncertain, ctx)
    assert.equal(judged.facts.find(({ id }) => id === requiredId).assessment, status)
    assert.ok(judged.facts.find(({ id }) => id === requiredId).uncertaintyIds.length)
    assert.equal(judged.applications.find(({ rule: ref }) => ref.ruleId === 'uncertain').evaluation.status, 'deferred')
    assert.equal(judged.applications.find(({ rule: ref }) => ref.ruleId === 'dependent').evaluation.reasonCode, 'DEPENDENCY_UNAVAILABLE')
    assert.equal(judged.completeness, 'partial')
    assert.equal(called, false)
  }
  const missingFact = evaluateJudgments(chart, context([rule('missing', { requiredInputs: [{ key: 'missing', factId: 'absent' }] })]))
  assert.equal(missingFact.applications[0].evaluation.status, 'deferred')
  const unknown = calculateCanonicalChart({ ...birth, time: { known: false } }, calculation)
  const unknownFacts = fromCanonical(unknown)
  assert.equal(unknownFacts.find(({ canonicalPointer }) => canonicalPointer === '/greatLuck/value/startInstant').assessment, 'unknown')
  assert.equal(unknownFacts.find(({ canonicalPointer }) => canonicalPointer === '/greatLuck/value/currentIndex').assessment, 'unknown')
  assert.equal(unknownFacts.find(({ canonicalPointer }) => canonicalPointer === '/greatLuck/value/cards/0/pillar').assessment, 'confirmed')

  for (const [policyId, status] of [['test-auto', 'auto-approved'], ['test-review', 'review-required'], ['test-blocked', 'blocked'], ['unmapped', 'blocked']]) {
    const judged = evaluateJudgments(chart, context([rule('review', { reviewPolicyId: policyId })]))
    assert.equal(judged.applications[0].operatorReview.status, status)
    assert.equal(judged.completeness, status === 'auto-approved' ? 'complete' : 'partial')
  }
  const failed = evaluateJudgments(chart, context([rule('error', {
    evaluator: () => ({ status: 'error', reasonCode: 'TEST_ERROR', evidence: [] }),
  })]))
  assert.equal(failed.completeness, 'failed')

  // Clock prohibition after chart construction: engine execution requires no Date API.
  const NativeDate = globalThis.Date
  globalThis.Date = class extends NativeDate {
    constructor() { throw new Error('Date API forbidden in engine') }
    static now() { throw new Error('Date.now forbidden in engine') }
  }
  try { assert.deepEqual(evaluateJudgments(chart, execution), result) }
  finally { globalThis.Date = NativeDate }
  const unreadableBirth = { ...chart }
  Object.defineProperty(unreadableBirth, 'birthInput', { get() { throw new Error('BirthInput access forbidden') } })
  assert.deepEqual(evaluateJudgments(unreadableBirth, execution), result)
  for (const file of ['evaluateJudgments.ts', 'facts/fromCanonical.ts', 'policies/uncertainty.ts', 'policies/operatorReview.ts', 'registry/validateRegistry.ts']) {
    const source = await readFile(new URL(`../src/lib/judgment/${file}`, import.meta.url), 'utf8')
    assert.ok(!/new Date\s*\(|Date\.(now|parse|UTC)\s*\(|from ['"].*(?:calculateEightChar|calculateGreatLuck|calculateYearlyLuck|calculateMonthlyLuck|solarTermPillars)['"]/.test(source))
  }
  console.log('Judgment contract checks passed: deterministic execution; immutable canonical facts; registry/manifest validation; dependency ordering; evidence; uncertainty deferral; test-only review policies; empty production registry; no clock or BirthInput access.')
} finally {
  await server.close()
}
