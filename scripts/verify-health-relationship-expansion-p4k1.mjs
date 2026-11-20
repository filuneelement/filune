import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const referenceTime = '2027-01-15T00:00:00.000Z'
const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { assembleReading, healthOutcomeFromReading, relationshipOutcomeFromReading, validateReadingAssembly } = await load('reading/index')
  const canonical = calculateCanonicalChart({
    date: { year: 1964, month: 2, day: 9 }, time: { known: true, value: { hour: 19, minute: 30 } },
    gender: '女性', timeCorrectionMode: 'none',
  }, { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
  const great = period('great-active', '2027-01-01T00:00:00.000Z', '2028-01-01T00:00:00.000Z')
  const annual = period('sewoon', '2027-01-02T00:00:00.000Z', '2027-12-31T00:00:00.000Z')
  const monthly = period('month', '2027-01-05T00:00:00.000Z', '2027-02-04T00:00:00.000Z')
  // P4-G.1 uses the canonical fixture for the reference and P1-Fix E for the Judgment chain.
  const states = runJudgmentCore({ executionId: 'p4k', referenceTime, natalValidity: great, natalCombinations: [],
    natal: { day: pillar('dm', '甲', '寅'), month: pillar('officer', '辛', '酉'),
      year: pillar('hurt', '丁', '巳'), time: pillar('guard', '壬', '子') },
    luck: [
      { scope: 'greatLuck', pillar: pillar('peer', '甲', '寅'), validity: great },
      { scope: 'yearlyLuck', pillar: pillar('annual', '乙', '丑'), validity: annual },
      { scope: 'monthlyLuck', pillar: pillar('stopper', '丁', '巳'), validity: monthly },
    ],
  })
  const [natal, , parent, month] = states
  assert.equal(month.parentScopeId, parent.id)
  const full = healthOutcomeFromReading({ judgment: { canonical, judgmentCore: states, luck: {} } })
  const window = healthOutcomeFromReading({ judgment: {
    canonical, judgmentCore: [natal], luck: { monthlyWindow: [{
      judgmentCore: month, referenceTime, parentJudgmentCore: {
        id: parent.id, scope: parent.scope, actualFunctions: parent.actualFunctions, stemFacts: parent.stemFacts,
      },
    }] },
  } })
  const completeFact = full.find(fact => fact.semanticType === 'health_attention_period' && fact.scopeId === month.id)
  assert.ok(completeFact)
  assert.equal(completeFact.currentFunction, 'operating')
  assert.equal(completeFact.direction, 'unfavorable')
  assert.deepEqual(completeFact.period, monthly)
  const isPlaced = healthOutcomes => {
    const reading = assembleReading({ canonical, healthOutcomes, productScope: 'premium' })
    validateReadingAssembly(reading)
    const unit = reading.semanticUnits.find(item => item.meaningRef.recordId === completeFact.id)
    if (unit) assert.deepEqual(unit.healthLifeMeanings, completeFact.lifeMeanings)
    return !!unit && reading.chapters.find(chapter => chapter.id === 'CH-10').placements
      .some(item => item.unitId === unit.id)
  }
  assert.ok(isPlaced(full))
  const windowFact = window.find(fact => fact.id === completeFact.id)
  assert.deepEqual(window.filter(fact => fact.scope === 'month'), full.filter(fact => fact.scope === 'month'))
  const withWindow = healthOutcomeFromReading({ judgment: {
    canonical, judgmentCore: states, luck: { monthlyWindow: [{ judgmentCore: { ...month, id: 'window-copy' },
      referenceTime, parentJudgmentCore: parent }] },
  } })
  assert.deepEqual(withWindow, full)
  assert.ok(isPlaced(window))
  assert.equal(windowFact.certainty, 'confirmed')
  assert.deepEqual(windowFact.lifeMeanings.map(item => item.type), [
    'health_burden', 'health_problem_prone_period', 'health_management_period', 'body_area_burden',
  ])
  assert.ok(windowFact.lifeMeanings.find(item => item.type === 'body_area_burden').areas.length)
  assert.ok(!('lifeMeanings' in full.find(fact => fact.semanticType === 'traditional_body_correspondence')))
  assert.ok(full.every(fact => !/diagnosis|health_relief_period|disease|surgery_prediction/u.test(fact.semanticType)))
  const expiredCanonical = { ...canonical, context: { ...canonical.context, referenceTime: monthly.to.instant } }
  const expired = healthOutcomeFromReading({ judgment: { canonical: expiredCanonical, judgmentCore: [natal], luck: {} },
    evaluatedLuckScopes: states.slice(1).map(snapshot => ({ snapshot, evaluatedAt: referenceTime })) })
  assert.deepEqual(expired.find(fact => fact.id === completeFact.id), { ...completeFact,
    temporalStatus: 'expired', currentlyEffective: false })
  assert.ok(!assembleReading({ canonical: expiredCanonical, healthOutcomes: expired, productScope: 'premium' })
    .semanticUnits.some(unit => unit.meaningRef.recordId === completeFact.id))

  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const authority = name => read(`src/docs/source/authority/${name}.md`)
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const { date, time } = births['CS-127']
  const birthJudgment = runInternalReading({
    birth: { date, time: { known: true, value: time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'p4k1-cs127', natalInspectionPeriod: monthly,
    sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
      D: authority('D_rev152'), approval: authority('25-7_rev16') },
  })
  const relationship = relationshipOutcomeFromReading({ judgment: birthJudgment })
  console.log('actual relationship', relationship.map(fact => [fact.scope, fact.semanticType, fact.certainty]))
  const formation = relationship.find(fact => fact.semanticType === 'relationship_formation')
  assert.equal(formation?.certainty, 'confirmed')
  assert.ok(relationship.some(fact => fact.semanticType === 'relationship_contact_signal'
    && fact.scopeId === formation.scopeId && fact.sourceRelationIds[0] === formation.sourceRelationIds[0]))
  assert.ok(relationship.some(fact => fact.semanticType === 'relationship_change_signal'))
  const relationshipReading = assembleReading({ judgment: birthJudgment, relationshipOutcomes: relationship, productScope: 'premium' })
  validateReadingAssembly(relationshipReading)
  assert.ok(relationshipReading.semanticUnits.some(unit => unit.meaningRef.recordId === formation.id
    && unit.certainty === 'confirmed'))
  const withoutApplicability = relationshipOutcomeFromReading({ judgment: {
    ...birthJudgment, canonical: { ...birthJudgment.canonical, birthInput: { ...birthJudgment.canonical.birthInput, gender: undefined } },
  } })
  assert.ok(withoutApplicability.some(fact => fact.semanticType === 'relationship_contact_signal'))
  assert.ok(withoutApplicability.every(fact => fact.semanticType !== 'relationship_formation'))

  // Match the P1-1 OFF-T2 policy fixture's chart and entity IDs at the Outcome boundary.
  const { recordId } = await load('judgment/producers/shared')
  const known = (stem, branch) => ({ status: 'confirmed', value: { stem, branch } })
  const policyPillars = { day: known('甲', '寅'), month: known('辛', '酉'), year: known('丁', '巳') }
  const policyNatal = Object.fromEntries(Object.entries(policyPillars).map(([position, { value }]) => [
    position, {
      stem: { id: recordId('entity', [`/chart/pillars/${position}/value/ganZhi`, 'stem']), value: value.stem },
      branch: { id: recordId('entity', [`/chart/pillars/${position}/value/ganZhi`, 'branch']), value: value.branch },
    },
  ]))
  const policyChart = { ...canonical, chart: {
    pillars: { ...policyPillars, time: { status: 'unknown' } },
    basicRelations: Object.fromEntries(['year', 'month', 'time'].map(position => [position, { status: 'unknown' }])),
  } }
  const policy = runJudgmentCore({ executionId: 'p4k1-off-t2', natal: policyNatal, natalValidity: great,
    referenceTime, natalCombinations: [], luck: [] })
  const pressureFacts = relationshipOutcomeFromReading({ judgment: { canonical: policyChart, judgmentCore: policy, luck: {} } })
  const pressure = pressureFacts.find(fact => fact.semanticType === 'relationship_pressure')
  assert.equal(pressure?.certainty, 'confirmed')
  assert.ok(pressure.sourceRelationIds.every(id => policy[0].actualFunctions.some(actual =>
    actual.relationFactId === id && actual.policyId === 'OFF-03' && actual.function === 'operating')))
  assert.ok(pressureFacts.every(fact => !/breakdown|divorce|breakup/u.test(fact.semanticType)))
  const natalHealth = healthOutcomeFromReading({ judgment: { canonical: policyChart, judgmentCore: policy, luck: {} } })
  assert.ok(natalHealth.some(fact => fact.scope === 'natal' && fact.lifeMeanings?.some(item => item.type === 'health_burden')))
  console.log('PASS P4-K.1 Health burden, expiry, window parity, Relationship formation and pressure')
} finally {
  await server.close()
}
