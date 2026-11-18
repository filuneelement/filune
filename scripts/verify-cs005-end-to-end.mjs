import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
let checks = 0
const check = (test) => { test(); checks++ }
const freeze = (value) => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
try {
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const fixture = JSON.parse(await readFile(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))['CS-005']
  const [A, draftA, C, D, approval] = await Promise.all(
    ['A_rev179', 'A_rev180', 'C_rev215', 'D_rev152', '25-7_rev16'].map((name) => readFile(`src/docs/source/${name}.md`, 'utf8')),
  )
  const time = '2027-01-15T00:00:00.000Z'
  const input = freeze({
    birth: { date: fixture.date, time: { known: true, value: fixture.time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime: time, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'cs005-e2e',
    natalInspectionPeriod: { periodId: 'natal-inspection', from: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' },
      to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } },
    sources: { A, draftA, C, D, approval },
  })
  const before = JSON.stringify(input)
  const result = runInternalReading(input)
  const { canonical, natal, luck, diagnostics, interpretationInputs } = result
  const natalScope = natal.pattern.scopeId
  const stage = (id, scopeId = natalScope) => diagnostics.stages.find((item) => item.stageId === id && item.scopeId === scopeId)
  const current = [luck.daewoon, luck.sewoon, luck.month]
  // Expectations are read or asserted only after executing the pipeline.
  const reference = C.split('C-10-1. 사례별 20항목')[1].split('C-10-2.')[0].split('\n')
  const cell = (label) => reference.find((line) => line.startsWith(label + '\t')).split('\t')[1]
  check(() => {
    assert.deepEqual(Object.keys(fixture).sort(), ['date', 'time'])
    assert.deepEqual(Object.keys(fixture.date).sort(), ['day', 'month', 'year'])
    assert.deepEqual(Object.keys(fixture.time).sort(), ['hour', 'minute'])
    assert.deepEqual(Object.keys(input).sort(), ['birth', 'calculation', 'executionId', 'natalInspectionPeriod', 'sources'])
  })
  check(() => {
    const pillars = ['year', 'month', 'day', 'time'].map((position) => canonical.chart.pillars[position].value.ganZhi).join(' ')
    assert.ok(cell('1 원국·출처').startsWith(pillars))
    assert.equal(stage('canonical').status, 'confirmed')
    assert.equal(stage('judgment-facts').status, 'confirmed')
    assert.ok(stage('judgment-facts').resultRefs.every((id) => diagnostics.facts.some((fact) => fact.id === id)))
  })
  check(() => {
    assert.equal(natal.pattern.status, 'confirmed')
    assert.equal(natal.pattern.monthPatternTenGod, '偏官')
    const yong = [...cell('4 천간 용신·투출').matchAll(/([甲乙丙丁戊己庚辛壬癸])\((?:년간|월간|시간)\)/g)].map((item) => item[1]).sort()
    assert.deepEqual(natal.yongShen.filter((item) => item.status === 'confirmed').map((item) => item.stem).sort(), yong)
    assert.deepEqual(natal.sangShen.filter((item) => item.status === 'confirmed').map((item) => item.stem), [cell('7 상신')])
    for (const id of ['natal-stem-state', 'pattern', 'yongshen', 'sangshen']) assert.equal(stage(id).status, 'confirmed')
  })
  check(() => {
    assert.equal(natal.byeong.status, 'deferred')
    assert.equal(natal.guEung.status, 'deferred')
    assert.equal(natal.successState.status, 'deferred')
    assert.equal(diagnostics.completeness, 'partial')
    assert.ok(natal.byeong.judgments.some((item) => item.reasonCodes.includes('A180_7_POST_CONTROL_DAMAGE_AND_WEALTH_ATTRIBUTION_UNVERIFIED')))
  })
  check(() => {
    assert.deepEqual([luck.daewoon.pillar, luck.sewoon.pillar, luck.month.pillar], ['己未', '丙午', '辛丑'])
    assert.deepEqual(luck.month.scope.includedScopes, ['natal', 'yearlyLuck', 'monthlyLuck'])
    for (const item of current) {
      assert.equal(item.calendarStage.status, 'confirmed')
      assert.equal(item.stemState.status, 'confirmed')
      assert.equal(item.interpretation.status, 'deferred')
      assert.equal(item.byeong.status, 'deferred')
      assert.equal(item.guEung.status, 'deferred')
      assert.equal(item.scope.producerSnapshotIdentity, luck.daewoon.scope.producerSnapshotIdentity)
      assert.ok(item.effectivePeriod.from.instant <= time && time < item.effectivePeriod.to.instant)
      assert.ok(item.relations.some((fact) => fact.kind.startsWith('stem-')))
      assert.ok(item.relations.some((fact) => fact.kind.startsWith('branch-')))
      assert.ok(item.relations.every((fact) => fact.participantEntityIds.every((id) => item.scope.includedEntityIds.includes(id))))
    }
  })
  check(() => {
    assert.equal(luck.daewoon.carryContext.length, 0)
    const stopped = luck.daewoon.runtimeStates.find((item) => item.functionalState === 'stopped'
      && luck.month.scope.includedEntityIds.includes(item.targetEntityId))
    assert.ok(stopped)
    for (const item of [luck.sewoon, luck.month]) {
      assert.deepEqual(item.carryContext.map((entry) => entry.sourceStateId), [stopped.stateId])
      const inherited = item.runtimeStates.find((state) => state.targetEntityId === stopped.targetEntityId)
      assert.equal(inherited.inheritedFromStateRef, stopped.stateId)
      assert.equal(inherited.functionalState, 'stopped')
      assert.deepEqual(inherited.validity, stopped.validity)
      assert.ok(item.carryContext.every((entry) => entry.causedByRuleIds.includes('OP-T07')))
    }
    const weakened = luck.month.runtimeStates.filter((item) => item.functionalState === 'weakened')
    assert.equal(weakened.length, 2)
    assert.ok(weakened.every((item) => item.originMode === 'local' && item.weakeningDescription.ruleId === 'OP-T10'))
    assert.ok(luck.month.carryContext.every((entry) => !entry.causedByRuleIds.includes('OP-T10')))
    const monthHelper = natal.sangShen.find((item) => item.status === 'confirmed')
    assert.equal(luck.month.runtimeStates.find((item) => item.targetEntityId === monthHelper.entityId).functionalState, 'active')
    assert.equal(monthHelper.scopeId, natalScope)
  })
  check(() => {
    assert.equal(interpretationInputs.length, 3)
    assert.ok(interpretationInputs.every((item) => item.status === 'deferred' && item.effectDirection === null))
    assert.doesNotMatch(JSON.stringify(interpretationInputs), /용신|상신|병|구응|no-gu-eung|has-byeong/)
    assert.ok(diagnostics.stages.every((item) => item.stageId && item.scopeId && item.effectivePeriod
      && item.provenance.producerRef && ['resultRefs', 'reasonCodes', 'ruleIds', 'evidenceIds', 'uncertaintyIds'].every((key) => Array.isArray(item[key]))))
    assert.ok(diagnostics.stages.every((item) => item.evidenceIds.every((id) => diagnostics.evidence.some((record) => record.evidenceId === id))))
  })
  check(() => {
    assert.equal(JSON.stringify(result), JSON.stringify(runInternalReading(input)))
    assert.equal(JSON.stringify(input), before)
    assert.deepEqual(JSON.parse(JSON.stringify(result)), result)
  })
  console.log(`CS-005 internal end-to-end passed (${checks} checks): ${current.map((item) => item.pillar).join(' / ')}; ${diagnostics.completeness}`)
  console.log(diagnostics.stages.map((item) => `${item.stageId}=${item.status}`).join(', '))
} finally {
  await server.close()
}
