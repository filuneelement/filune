import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
let checks = 0
const check = (run) => { run(); checks++ }
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}

try {
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { findJieBoundariesForGregorianYear, findRisshunBoundary } = await load('solarTermPillars')
  const fixture = JSON.parse(await readFile(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))['CS-005']
  const [A, draftA, C, D, approval] = await Promise.all(
    ['A_rev179', 'A_rev180', 'C_rev215', 'D_rev152', '25-7_rev16'].map((name) => readFile(`src/docs/source/authority/${name}.md`, 'utf8')),
  )
  const input = freeze({
    birth: { date: fixture.date, time: { known: true, value: fixture.time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime: '2027-01-15T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'cs005-e2e',
    natalInspectionPeriod: { periodId: 'natal-inspection', from: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' },
      to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } },
    sources: { A, draftA, C, D, approval },
    monthlyWindowStart: { year: 2026, month: 11 },
  })
  const before = JSON.stringify(input)
  const result = runInternalReading(input)
  const window = result.luck.monthlyWindow
  // C's expected structural values are read only after all twelve executions.
  const cWindow = C.split('\nC-10-2. 월별 회귀 결과')[1].split('\nC-10-3.')[0]
  const pillars = cWindow.split('\n').flatMap((line) => {
    const match = /^(?:\d{4}\.)?\d{1,2} ([^\s\t]{2})\t/.exec(line)
    return match ? [match[1]] : []
  })
  const yearReference = C.split('\nC-10-1. 사례별')[1].split('\n').find((line) => line.startsWith('13 세운\t')).split('\t')[1]
  const parents = [...yearReference.matchAll(/(2026|2027) ([^:\s]{2}):/g)].map((match) => match[2])
  const jie = [2026, 2027].flatMap((year) => findJieBoundariesForGregorianYear(year)).slice(10, 23)
  const bounds = jie.map((item) => item.instant.toISOString())
  const risshun = findRisshunBoundary(2027).instant.toISOString()

  check(() => assert.equal(window.length, 12))
  check(() => assert.deepEqual(window.map((month) => month.pillar), pillars))
  check(() => assert.deepEqual(window.map((month) => month.monthIndex), Array.from({ length: 12 }, (_, i) => i + 1)))
  check(() => assert.ok(window.every((month, i) => month.startInstant === bounds[i] && month.endInstant === bounds[i + 1]
    && month.jieName === jie[i].name && month.referenceTime === month.startInstant)))
  check(() => assert.ok(window.every((month) => month.effectivePeriod.from.instant === month.startInstant
    && month.effectivePeriod.to.instant === month.endInstant)))
  check(() => assert.ok(window.every((month, i) => i === 0 || window[i - 1].endInstant >= month.startInstant), 'no gap'))
  check(() => assert.ok(window.every((month, i) => month.startInstant < month.endInstant
    && (i === 0 || window[i - 1].endInstant <= month.startInstant)), 'no overlap'))
  check(() => {
    assert.equal(parents.length, 2)
    assert.equal(window[2].calendarMonth, 1)
    assert.equal(window[2].parentSewoon.pillar, parents[0])
    assert.equal(window[2].parentSewoon.effectivePeriod.to.instant, risshun)
    assert.equal(window[3].startInstant, risshun)
    assert.equal(window[3].parentSewoon.pillar, parents[1])
    assert.equal(window[3].parentSewoon.effectivePeriod.from.instant, risshun)
    assert.notEqual(window[2].parentSewoonId, window[3].parentSewoonId)
  })
  check(() => {
    for (const month of window) {
      const parent = month.parentSewoon
      assert.equal(parent.id, month.parentSewoonId)
      assert.equal(parent.pillar, month.referenceTime < risshun ? parents[0] : parents[1])
      assert.ok(parent.effectivePeriod.from.instant <= month.startInstant && month.endInstant <= parent.effectivePeriod.to.instant)
    }
  })
  check(() => assert.equal(new Set(window.map((month) => month.scopeId)).size, 12))
  check(() => {
    for (const month of window) {
      assert.deepEqual(month.scope.includedScopes, ['natal', 'yearlyLuck', 'monthlyLuck'])
      assert.equal(month.scope.selectedPeriodRefs.greatLuck, undefined)
      assert.equal(month.scope.selectedPeriodRefs.yearlyLuck, month.parentSewoon.effectivePeriod.periodId)
      assert.ok(month.relationFacts.length)
      assert.ok(month.natalPatternRef)
      assert.ok(month.natalRoles.length && month.natalRoles.every((role) => role.validScopeId === month.natalScopeId))
      assert.ok(month.relationFacts.every((fact) => fact.participantEntityIds.every((id) => month.scope.includedEntityIds.includes(id))))
    }
  })
  check(() => {
    const monthScopeIds = new Set(window.map((month) => month.scopeId))
    for (const month of window) {
      assert.ok(month.carryRefs.length > 0)
      for (const entry of month.carryRefs) {
        assert.ok(entry.sourceStage === 'great' || entry.sourceStage === 'year')
        assert.ok(!monthScopeIds.has(entry.sourceScopeId))
        assert.ok(entry.validFrom.instant <= month.startInstant && month.endInstant <= entry.validTo.instant)
        assert.ok(entry.causedByRuleIds.includes('OP-T07'))
        const inherited = month.runtimeStates.find((state) => state.inheritedFromStateRef === entry.sourceStateId)
        assert.equal(inherited.functionalState, 'stopped')
        assert.equal(inherited.originMode, 'inherited')
      }
    }
  })
  check(() => {
    for (const month of window) {
      assert.ok(month.runtimeStates.length)
      assert.ok(month.runtimeStates.every((state) => state.functionalState !== 'weakened' || state.originMode === 'local'))
      assert.ok(month.runtimeStates.every((state) => state.originMode !== 'local' || state.scopeId === month.scopeId))
      assert.ok(month.currentApplications.every((app) => app.scopeId === month.scopeId))
    }
    assert.ok(window[2].runtimeStates.some((state) => state.functionalState === 'weakened'))
    assert.ok(window[3].runtimeStates.every((state) => state.inheritedFromStateRef !== window[2].runtimeStates.find((s) => s.functionalState === 'weakened').stateId))
  })
  check(() => {
    assert.ok(window.every((month) => month.status === 'deferred' && month.stageStatus.calendar === 'confirmed'
      && (month.stageStatus.stemState === 'confirmed'
        || (month.reasonCodes.includes('PRIOR_STOP_LUCK_PAIR_UNSUPPORTED')
          && month.runtimeStates.every((state) => state.originMode === 'inherited') && !month.currentApplications.length))
      && month.stageStatus.successState === (month.judgmentCore?.structuralSuccess.overall.grade ? 'confirmed' : 'deferred')
      && month.stageStatus.byeong === 'deferred' && month.stageStatus.guEung === 'deferred'))
    assert.ok(window.every((month) => month.evidenceRefs.every((id) => month.evidence.some((item) => item.evidenceId === id))))
  })
  check(() => {
    const february = window[3]
    assert.equal(february.stageStatus.stemState, 'confirmed')
    assert.ok(february.currentApplications.some((app) => app.ruleId === 'OP-T08'))
    assert.ok(february.historicalStateRefs.length)
    assert.ok(window.every((month) => month.stageStatus.stemState === 'confirmed'))
  })
  check(() => assert.deepEqual(Object.keys(input.monthlyWindowStart).sort(), ['month', 'year']))
  const baseline = runInternalReading({ ...input, monthlyWindowStart: undefined })
  check(() => {
    const { monthlyWindow, ...currentLuck } = result.luck
    assert.equal(monthlyWindow.length, 12)
    assert.deepEqual({ ...result, luck: currentLuck }, baseline)
  })
  check(() => {
    assert.equal(JSON.stringify(result), JSON.stringify(runInternalReading(input)))
    assert.equal(JSON.stringify(input), before)
  })
  check(() => {
    const february = window[3]
    const febReading = runInternalReading({ ...input, monthlyWindowStart: undefined,
      executionId: `monthly-window-run:${JSON.stringify([input.executionId, february.startInstant])}`,
      natalInspectionPeriod: { periodId: `monthly-window-natal-inspection:${JSON.stringify([february.startInstant])}`,
        from: { kind: 'exact', instant: february.startInstant }, to: { kind: 'exact', instant: february.endInstant } },
      calculation: { ...input.calculation, referenceTime: february.startInstant } })
    const month = febReading.luck.month
    const year = febReading.luck.sewoon
    const stemId = (pointer) => `entity:${JSON.stringify([pointer, 'stem'])}`
    const yearId = stemId(year.effectivePeriod.periodId.replace('canonical-period:', '') + '/pillar')
    const monthId = stemId(month.effectivePeriod.periodId.replace('canonical-period:', '') + '/pillar')
    const expected = new Map([
      ...[['year', 'stopped'], ['month', 'active'], ['day', 'active'], ['time', 'stopped']]
        .map(([position, state]) => [stemId(`/chart/pillars/${position}/value/ganZhi`), state]),
      [yearId, 'stopped'], [monthId, 'active'],
    ])
    assert.deepEqual(new Map(month.runtimeStates.map((state) => [state.targetEntityId, state.functionalState])), expected)
    const historical = month.runtimeStates.filter((state) => state.scopeId !== month.scope.scopeId)
    assert.equal(historical.length, 1)
    assert.ok(year.runtimeStates.some((state) => state.stateId === historical[0].stateId))
    const pairs = month.relations.filter((relation) => relation.kind === 'stem-combination')
    assert.deepEqual(pairs.map((pair) => [...pair.participantEntityIds].sort()).sort(),
      [[yearId, monthId].sort(), [yearId, stemId('/chart/pillars/time/value/ganZhi')].sort()].sort())
    assert.deepEqual(febReading.natal.roles, february.natalRoles)
    assert.equal(month.runtimeStates.filter((state) => state.originMode === 'inherited').length, 2)
    assert.deepEqual(month.currentApplications.filter((app) => ['OP-T07', 'OP-T10'].includes(app.ruleId)), [])
    assert.ok(month.currentApplications.some((app) => app.ruleId === 'OP-T08'))
  })
  console.log(`CS-005 monthly window passed (${checks} checks). UTC half-open intervals [start, end).`)
  for (const month of window) console.log(`${month.monthIndex} ${month.pillar} ${month.startInstant} → ${month.endInstant} parent=${month.parentSewoon.pillar} stem=${month.stageStatus.stemState} effect=${month.status}`)
} finally {
  await server.close()
}
