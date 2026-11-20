import assert from 'node:assert/strict'
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
  const { assembleReading, healthOutcomeFromReading, validateReadingAssembly } = await load('reading/index')
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
    return !!unit && reading.chapters.find(chapter => chapter.id === 'CH-10').placements
      .some(item => item.unitId === unit.id)
  }
  assert.ok(isPlaced(full))
  const windowFact = window.find(fact => fact.id === completeFact.id)
  console.log(JSON.stringify({
    fullChain: { scope: completeFact.scope, semanticType: completeFact.semanticType,
      certainty: completeFact.certainty, areas: completeFact.traditionalBodyAreas, placedInCH10: true },
    window: { sameFact: !!windowFact, placedInCH10: isPlaced(window) },
  }, null, 2))
} finally {
  await server.close()
}
