import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false } })
try {
  const load = (name) => server.ssrLoadModule(`/src/lib/${name}.ts`)
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION: version } = await load('canonical/version')
  const { serializeCanonical } = await load('canonical/serialization')
  const { calculateEightChar } = await load('calculateEightChar')
  const { calculateGreatLuck } = await load('calculateGreatLuck')
  const { calculateYearlyLuck } = await load('calculateYearlyLuck')
  const { calculateMonthlyLuck } = await load('calculateMonthlyLuck')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { calculateTimeCorrection } = await load('timeCorrection')
  const { findRisshunBoundary } = await load('solarTermPillars')
  const { searchUSCities } = await load('usCitySearch')
  const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'))
  assert.equal(version.dependencies.lunarTypescript, lock.packages['node_modules/lunar-typescript'].version)
  assert.equal(version.dependencies.astronomyEngine, lock.packages['node_modules/astronomy-engine'].version)

  const context = { referenceTime: '2026-06-01T00:00:00.000Z', calculationVersion: version, monthlyLuckYear: 2026 }
  const base = { date: { year: 1985, month: 1, day: 4 },
    time: { known: true, value: { hour: 9, minute: 0 } }, gender: '男性', timeCorrectionMode: 'none' }
  const seoul = { code: 'KR:Seoul', countryCode: 'KR', region: '서울', city: '서울', displayName: '서울',
    latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul', standardMeridian: 135 }
  const cases = [base,
    { ...base, birthplace: seoul, timeCorrectionMode: 'longitude' },
    { ...base, date: { year: 1985, month: 7, day: 15 }, birthplace: searchUSCities('New York')[0], timeCorrectionMode: 'longitude' },
    { ...base, date: { year: 2026, month: 2, day: 4 }, time: { known: true, value: { hour: 5, minute: 1 } }, gender: '女性' },
    { ...base, date: { year: 2026, month: 2, day: 4 }, time: { known: true, value: { hour: 5, minute: 3 } } },
  ]
  function freezeDeep(value) {
    if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value) }
    return value
  }
  function compare(input, ctx) {
    const before = JSON.stringify({ input, ctx })
    freezeDeep(input); freezeDeep(ctx)
    const actual = calculateCanonicalChart(input, ctx)
    const birth = { ...input.date, ...input.time.value }
    const legacy = calculateEightChar(birth, { mode: input.timeCorrectionMode, birthplace: input.birthplace })
    for (const position of ['year', 'month', 'day', 'time']) {
      const pillar = actual.chart.pillars[position]
      assert.equal(pillar.status, 'confirmed')
      assert.equal(pillar.value.ganZhi, legacy[position])
      assert.equal(pillar.value.stem + pillar.value.branch, legacy[position])
      assert.deepEqual(actual.chart.basicRelations[position].value, {
        relationships: calculateDayRelationships(legacy.dayRelationships.dayStem, pillar.value.branch),
        stemTenGod: calculateTenGod(legacy.dayRelationships.dayStem, pillar.value.stem),
        twelveStage: calculateTwelveStage(legacy.dayRelationships.dayStem, pillar.value.branch),
      })
    }
    const great = calculateGreatLuck({ yearPillar: legacy.year, monthPillar: legacy.month,
      dayStem: legacy.dayRelationships.dayStem, gender: input.gender, birthDateTime: birth,
      timeUnknown: false, now: new Date(ctx.referenceTime) })
    assert.equal(actual.greatLuck.status, 'available')
    const stripped = { ...actual.greatLuck.value,
      cards: actual.greatLuck.value.cards.map(({ twelveStage, ...card }) => {
        assert.equal(twelveStage, calculateTwelveStage(legacy.dayRelationships.dayStem, card.branch))
        return card
      }) }
    assert.deepEqual(stripped, serializeCanonical(great))
    assert.deepEqual(actual.yearlyLuck, serializeCanonical(calculateYearlyLuck(legacy.dayRelationships.dayStem, new Date(ctx.referenceTime), great.cards)))
    assert.deepEqual(actual.monthlyLuck, serializeCanonical(calculateMonthlyLuck(ctx.monthlyLuckYear, legacy.dayRelationships.dayStem, new Date(ctx.referenceTime))))
    assert.deepEqual(actual.timePolicy.correction.value,
      serializeCanonical(calculateTimeCorrection(birth.hour, birth.minute, input.timeCorrectionMode, input.birthplace, input.date)))
    assert.equal(new Date(actual.greatLuck.value.startInstant).getTime(), great.startInstant.getTime())
    assert.equal(new Date(actual.solarTerms.evaluation.value.risshun.instant).getTime(), findRisshunBoundary(birth.year).instant.getTime())
    assert.equal(JSON.stringify(actual), JSON.stringify(calculateCanonicalChart(input, ctx)))
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), actual)
    assert.equal(JSON.stringify({ input, ctx }), before)
    assert.ok(!('displayMetrics' in actual))
    return actual
  }
  cases.forEach((input) => compare(input, context))

  // Exercise exact Great Luck interval boundaries and compare every result to legacy functions.
  const initial = compare(base, context)
  const edge = new Date(initial.greatLuck.value.cards[4].startInstant).getTime()
  const beforeEdge = compare(base, { ...context, referenceTime: new Date(edge - 1).toISOString() })
  const afterEdge = compare(base, { ...context, referenceTime: new Date(edge).toISOString() })
  assert.notEqual(beforeEdge.greatLuck.value.currentIndex, afterEdge.greatLuck.value.currentIndex)
  assert.deepEqual(beforeEdge.chart, afterEdge.chart)
  assert.deepEqual(beforeEdge.timePolicy, afterEdge.timePolicy)
  const yearBoundary = findRisshunBoundary(2026).instant.getTime()
  const beforeYear = compare(base, { ...context, referenceTime: new Date(yearBoundary - 1).toISOString() })
  const afterYear = compare(base, { ...context, referenceTime: new Date(yearBoundary).toISOString() })
  assert.notEqual(beforeYear.yearlyLuck.currentSolarYear, afterYear.yearlyLuck.currentSolarYear)
  assert.notEqual(beforeYear.monthlyLuck.currentIndex, afterYear.monthlyLuck.currentIndex)
  assert.deepEqual(beforeYear.chart, afterYear.chart)

  const unknown = calculateCanonicalChart({ ...base, time: { known: false } }, context)
  assert.equal(unknown.chart.pillars.time.status, 'unknown')
  assert.ok(!('value' in unknown.chart.pillars.time))
  assert.ok(!('value' in unknown.chart.basicRelations.time))
  assert.ok(!('startInstant' in unknown.greatLuck.value))
  assert.equal(unknown.greatLuck.value.currentIndex, null)
  assert.equal(unknown.solarTerms.evaluation.status, 'provisional')
  assert.equal(unknown.timePolicy.correction.status, 'unknown')
  assert.ok(!('effectiveDateTime' in unknown.timePolicy.usage.timePillar))
  const ambiguous = calculateCanonicalChart({ ...base, date: { year: 2026, month: 2, day: 4 }, time: { known: false } }, context)
  for (const key of ['year', 'month']) {
    assert.equal(ambiguous.chart.pillars[key].status, 'provisional')
    assert.equal(ambiguous.chart.basicRelations[key].status, 'provisional')
  }
  assert.equal(ambiguous.greatLuck.status, 'unknown')
  assert.ok(!('value' in ambiguous.greatLuck))
  const unsupported = calculateCanonicalChart({ ...base, timeCorrectionMode: 'trueSolarTime' }, context)
  assert.equal(unsupported.timePolicy.correction.status, 'unsupported')
  assert.equal(unsupported.chart.pillars.time.status, 'unsupported')
  assert.ok(!('value' in unsupported.chart.pillars.time))
  assert.deepEqual(unsupported.chart.pillars.day, initial.chart.pillars.day)
  assert.ok(unsupported.uncertainties.some(({ code }) => code === 'TRUE_SOLAR_TIME_UNSUPPORTED'))
  const noGender = calculateCanonicalChart({ ...base, gender: undefined }, context)
  assert.equal(noGender.greatLuck.status, 'unknown')
  assert.deepEqual(noGender.greatLuck.uncertaintyIds, ['gender-missing'])
  assert.equal(noGender.timePolicy.usage.greatLuckStart.status, 'unknown')
  const unknownUnsupported = calculateCanonicalChart({ ...base, time: { known: false }, timeCorrectionMode: 'trueSolarTime' }, context)
  assert.equal(unknownUnsupported.chart.pillars.time.status, 'unsupported')
  assert.ok(unknownUnsupported.uncertainties.some(({ code }) => code === 'BIRTH_TIME_UNKNOWN'))
  assert.ok(unknownUnsupported.uncertainties.some(({ code }) => code === 'TRUE_SOLAR_TIME_UNSUPPORTED'))

  const rollover = calculateCanonicalChart({ ...base, birthplace: seoul, timeCorrectionMode: 'longitude',
    time: { known: true, value: { hour: 0, minute: 5 } } }, context)
  assert.equal(rollover.timePolicy.correction.value.dayOffset, -1)
  assert.equal(rollover.timePolicy.usage.timePillar.dayOffsetApplied, false)
  assert.deepEqual(rollover.timePolicy.usage.timePillar.effectiveDateTime,
    { ...base.date, hour: 23, minute: 33 })

  for (const invalid of [new Date(NaN), NaN, Infinity, -Infinity, { nested: NaN }]) {
    assert.throws(() => serializeCanonical(invalid), /Invalid Date|Non-finite/)
  }
  const circular = {}; circular.self = circular
  assert.throws(() => serializeCanonical(circular), /Circular/)
  assert.deepEqual(serializeCanonical({ optional: undefined, value: null }), { value: null })
  assert.throws(() => calculateCanonicalChart(base, { ...context, referenceTime: '2026-02-30T00:00:00Z' }), /referenceTime/)
  assert.throws(() => calculateCanonicalChart(base, { ...context, calculationVersion: { ...version, id: 'other' } }), /version/)
  assert.throws(() => calculateCanonicalChart({ ...base, date: { year: 2026, month: 2, day: 30 } }, context), /birth date/)
  assert.throws(() => calculateCanonicalChart({ ...base, timeCorrectionMode: 'longitude' }, context), /birthplace/)

  // A no-argument Date would fail here, including inside any legacy wrapper call.
  const NativeDate = globalThis.Date
  globalThis.Date = class extends NativeDate {
    constructor(...args) {
      assert.ok(args.length > 0, 'implicit current time is forbidden')
      super(...args)
    }
    static now() { throw new Error('implicit Date.now is forbidden') }
  }
  try { assert.equal(JSON.stringify(calculateCanonicalChart(base, context)), JSON.stringify(initial)) }
  finally { globalThis.Date = NativeDate }

  console.log('Canonical chart checks passed: legacy parity; explicit reference time; boundaries; ISO epochs; deterministic JSON; uncertainty; validation; no mutation or implicit clock.')
} finally {
  await server.close()
}
