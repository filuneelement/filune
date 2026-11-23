import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const observed = { event: [], assembly: [] }
const observationKey = Symbol.for('filune.p4n1.wiring')
globalThis[observationKey] = observed

// Observe the production service's calls while forwarding the original values to the real engines.
const trackedImports = {
  '../eventTiming': ['event', 'buildEventTiming', '/src/lib/eventTiming/index.ts'],
  '../reading/assembleReading': ['assembly', 'assembleReading', '/src/lib/reading/assembleReading.ts'],
}
const server = await createServer({
  appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false },
  plugins: [{
    name: 'observe-production-reading-calls',
    enforce: 'pre',
    resolveId(source, importer) {
      if (importer?.endsWith('/product/readBirthChart.ts') && Object.hasOwn(trackedImports, source)) {
        return `\0p4n1:${source}`
      }
    },
    load(id) {
      if (!id.startsWith('\0p4n1:')) return
      const [kind, name, target] = trackedImports[id.slice('\0p4n1:'.length)]
      return `
        import { ${name} as run } from ${JSON.stringify(target)};
        export function ${name}(input) {
          const before = JSON.stringify(input);
          const result = run(input);
          globalThis[Symbol.for('filune.p4n1.wiring')].${kind}.push({ input, before, result });
          return result;
        }`
    },
  }],
})

try {
  const load = path => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const [{ prepareProductResult }, legacy, { validateReadingAssembly }] = await Promise.all([
    load('product/prepareProductResult'), load('calculateEightChar'), load('reading/validateReadingAssembly'),
  ])
  const app = read('src/App.tsx')
  assert.match(app, /await prepareProductResult\(birth\)/)
  assert.doesNotMatch(app, /eventContext/)

  const fixture = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))['CS-127']
  const birth = { date: fixture.date, time: { known: true, value: fixture.time },
    gender: fixture.gender ?? '女性', timeCorrectionMode: 'none' }
  const birthBefore = JSON.stringify(birth)
  const referenceTime = '2027-01-15T00:00:00.000Z'
  const options = { referenceTime, productScope: 'premium' }
  const legacyResult = await prepareProductResult(birth)
  assert.deepEqual(legacyResult, { pillars: legacy.calculateEightChar({ ...fixture.date, ...fixture.time }, { mode: 'none' }) })
  const unknown = { ...birth, time: { known: false } }
  assert.deepEqual(await prepareProductResult(unknown), { pillars: legacy.calculateEightCharWithoutBirthTime(birth.date) })
  assert.deepEqual(observed, { event: [], assembly: [] })
  await assert.rejects(prepareProductResult(birth, { ...options, eventContext: 'toString' }), /Unsupported event context/)
  assert.deepEqual(observed, { event: [], assembly: [] })

  async function execute(eventContext, key, readingOptions = options) {
    const previousCount = observed.event.length
    const result = await prepareProductResult(birth, { ...readingOptions, eventContext })
    assert.equal(observed.event.length, previousCount + 1, 'exactly one Event Timing call')
    assert.equal(observed.assembly.length, previousCount + 1, 'exactly one Assembly call')
    const event = observed.event.at(-1)
    const assembly = observed.assembly.at(-1)
    assert.deepEqual(event.input.knownFacts, { [key]: true })
    assert.strictEqual(assembly.input.eventTimingFacts, event.result.facts, 'same projected facts delivered to Assembly')
    assert.strictEqual(assembly.input.moneyOutcomes, event.input.moneyOutcomes)
    assert.strictEqual(assembly.input.relationshipOutcomes, event.input.relationshipOutcomes)
    assert.equal(JSON.stringify(event.input), event.before, 'Event Timing did not mutate snapshots or Outcomes')
    assert.equal(JSON.stringify(assembly.input), assembly.before, 'Assembly did not mutate Canonical, Judgment, Outcomes or snapshots')
    assert.equal(JSON.stringify(birth), birthBefore, 'product entrypoint did not mutate BirthInput')
    const canonical = assembly.input.judgment.canonical
    assert.equal(canonical.context.referenceTime, readingOptions.referenceTime)
    assert.equal(canonical.monthlyLuck.cards.length, 12, 'canonical solar-term months are retained')
    const month = canonical.monthlyLuck.cards[canonical.monthlyLuck.currentIndex]
    assert.ok(month.startInstant <= readingOptions.referenceTime && readingOptions.referenceTime < month.endInstant)
    const monthScope = event.input.scopes.find(({ snapshot }) => snapshot.scope === 'monthlyLuck')?.snapshot
    if (monthScope) {
      assert.equal(monthScope.validity.from.instant, month.startInstant)
      assert.equal(monthScope.validity.to.instant, month.endInstant)
    }
    assert.deepEqual(assembly.input.judgment.canonical.birthInput, birth)
    assert.deepEqual(result.pillars, legacyResult.pillars)
    assert.strictEqual(result.reading, assembly.result)
    validateReadingAssembly(result.reading)
    for (const fact of event.result.facts) {
      const scope = event.input.scopes.find(({ snapshot }) => snapshot.id === fact.scopeId)
      assert.deepEqual(fact.period, scope.snapshot.validity)
      if (readingOptions.productScope === 'premium' && fact.temporalStatus !== 'expired') {
        assert.ok(result.reading.semanticUnits.some(unit => unit.meaningRef.recordId === fact.id))
      }
    }
    return { event: event.result, reading: result.reading, currentMonth: month }
  }

  const { readBirthChart } = await load('reading/index')
  const { assembleReading } = await load('reading/assembleReading')
  const contextless = readBirthChart(birth, options)
  assert.equal(observed.event.length, 0)
  assert.equal(observed.assembly.length, 1)
  const baseline = observed.assembly.pop()
  assert.equal(Object.hasOwn(baseline.input, 'eventTimingFacts'), false)
  assert.deepEqual(contextless, assembleReading(baseline.input))

  const contract = await execute('contract', 'event.contract.process')
  const repeat = await execute('contract', 'event.contract.process')
  assert.deepEqual(repeat, contract, 'repeat invocation preserves IDs and provenance')
  const business = await execute('business_start', 'event.business.startGoal', { referenceTime })
  assert.equal(business.reading.productScope, 'free')
  assert.equal(business.reading.semanticUnits.filter(unit => unit.topic === 'event_timing').length, 0)
  const beforeJanuaryJie = await execute('contract', 'event.contract.process', {
    ...options, referenceTime: '2027-01-02T00:00:00.000Z',
  })
  assert.equal(beforeJanuaryJie.currentMonth.month, 12, 'early January still belongs to the preceding solar-term month')
  assert.deepEqual([contract.event.facts.length, business.event.facts.length], [0, 0],
    'CS-127 does not provide a supported timing window at this reference instant')

  console.log(JSON.stringify({
    result: 'PASS',
    entrypoint: 'App → context-free prepareProductResult; explicit service context → readBirthChart',
    productionFixtures: 3, contractContext: 2, businessContext: 1,
    eventTimingInvocations: observed.event.length, assemblyHandoffs: observed.assembly.length,
    contextlessLegacy: 'PASS (known and unknown birth hour)',
    invalidContext: 'rejected', falsePositives: 0, mutation: 0, freeLeakage: 0,
    stableIdentity: 'PASS', solarTermCalendar: 'PASS', contractEventFacts: contract.event.facts.length, businessEventFacts: business.event.facts.length,
  }, null, 2))
} finally {
  delete globalThis[observationKey]
  await server.close()
}
