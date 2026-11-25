import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const authority = name => read(`src/docs/source/authority/${name}.md`)
const interval = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: `${id}-branch`, value: branch } })
const referenceTime = '2027-01-15T00:00:00.000Z'
const intervals = [
  interval('daewoon', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z'),
  interval('sewoon', '2026-02-04T00:00:00.000Z', '2027-02-04T00:00:00.000Z'),
  interval('month', '2027-01-05T00:00:00.000Z', '2027-02-04T00:00:00.000Z'),
]
const pressure = facts => facts.filter(fact => fact.semanticType !== 'traditional_body_correspondence')
const harmful = { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['killing-harmful_killing'] }
const needed = { entityId: 'killing', condition: 'needed_insufficient_killing', evidenceIds: ['killing-needed_insufficient_killing'] }

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { buildHealthOutcome } = await load('outcome/index')
  const { assembleReading, healthOutcomeFromReading, validateReadingAssembly } = await load('reading/index')
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const birth = { date: births['CS-005'].date, time: { known: true, value: births['CS-005'].time },
    gender: '女性', timeCorrectionMode: 'none' }
  const calculation = { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 }
  const judgment = freeze(runInternalReading({
    birth, calculation, executionId: 'p4g-CS-005', monthlyWindowStart: { year: 2026, month: 11 },
    sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
      D: authority('D_rev152'), approval: authority('25-7_rev16') },
    natalInspectionPeriod: intervals[2],
  }))
  const before = JSON.stringify(judgment)
  const actualFacts = healthOutcomeFromReading({ judgment })
  assert.deepEqual(healthOutcomeFromReading({ judgment }), actualFacts)
  assert.equal(actualFacts.find(fact => fact.semanticType === 'traditional_body_correspondence').dayStem, '戊')
  const actualAssembly = assembleReading({ judgment, healthOutcomes: actualFacts, productScope: 'premium' })
  validateReadingAssembly(actualAssembly)
  const months = actualAssembly.semanticUnits.filter(unit => unit.month).map(unit => unit.month)
  assert.equal(months.length, 12)
  assert.ok(months.every((month, index) => month.startInstant === judgment.luck.monthlyWindow[index].startInstant
    && month.endInstant === judgment.luck.monthlyWindow[index].endInstant))
  assert.equal(JSON.stringify(judgment), before)

  const common = { day: pillar('dm', '甲', '寅'), month: pillar('killing', '庚', '申'),
    year: pillar('wealth', '戊', '辰') }
  const run = (natal, natalPolicyEvidence = [], luck = [], natalCombinations = []) =>
    runJudgmentCore({ executionId: 'p4g-policy', referenceTime, natal, natalPolicyEvidence,
      natalValidity: intervals[2], natalCombinations, luck })
  const build = (states, canonical = judgment.canonical) => buildHealthOutcome({ canonical,
    natal: states[0], luck: states.slice(1).map(snapshot => ({ snapshot, evaluatedAt: referenceTime })) })

  const seen = new Map()
  for (let day = 1; day <= 10; day++) {
    const canonical = calculateCanonicalChart({ ...birth, date: { year: 2000, month: 1, day } }, calculation)
    const fact = buildHealthOutcome({ canonical, natal: judgment.judgmentCore[0] })
      .find(({ semanticType }) => semanticType === 'traditional_body_correspondence')
    assert.ok(fact)
    const isElementOnly = ['乙', '丁', '庚', '壬'].includes(fact.dayStem)
    assert.equal(fact.specificity, isElementOnly ? 'element-level-only' : 'direct-source-specific')
    assert.equal(fact.traditionalBodyAreas.length === 0, isElementOnly)
    assert.deepEqual(fact.sourceJudgmentIds, [])
    assert.ok(fact.provenance.includes('A I-16'))
    seen.set(fact.dayStem, fact.specificity)
  }
  assert.equal(seen.size, 10)

  // Reuse the KILL-T2/T3, WEALTH-T7/T8/T9 and OFF-T2 Judgment cases.
  const harmfulNatal = run(common, [harmful])
  const [natalFact] = pressure(build(harmfulNatal))
  assert.equal(natalFact.path, 'harmful_killing')
  assert.equal(natalFact.scope, 'natal')
  assert.equal(natalFact.certainty, 'confirmed')
  assert.equal(natalFact.lifecycle, 'active')
  assert.equal(natalFact.currentlyEffective, true)
  assert.equal(pressure(build(run(common, [needed]))).length, 0)
  assert.equal(pressure(build(run(common))).length, 0)
  const officer = run({ day: common.day, month: pillar('officer', '辛', '酉'), year: pillar('hurt', '丁', '巳') })
  assert.ok(pressure(build(officer)).some(fact => fact.path === 'yongshen_pressure'))
  const wealth = { day: common.day, month: common.year, year: pillar('food', '丙', '巳') }
  assert.equal(run(wealth)[0].conditionalByeong[0].currentState, 'conditional')
  assert.equal(pressure(build(run(wealth))).length, 0)
  const yin = { day: pillar('dm', '乙', '卯'), month: pillar('wealth', '己', '丑') }
  const stopped = run({ ...yin, year: pillar('killing', '辛', '酉'), time: pillar('hurt', '丙', '午') },
    [harmful], [], [['killing', 'hurt']])
  assert.ok(stopped[0].runtime.some(item => item.entityId === 'killing' && item.state === 'stopped'))
  assert.equal(pressure(build(stopped)).length, 0)

  const scopeNames = ['greatLuck', 'yearlyLuck', 'monthlyLuck']
  const stage = (index, p, policyEvidence) => ({ scope: scopeNames[index], pillar: p, validity: intervals[index], policyEvidence })
  const killer = pillar('killing', '庚', '申')
  const filler = [pillar('great-peer', '甲', '寅'), pillar('annual-resource', '壬', '子')]
  const scoped = scopeNames.map((_, index) => run(wealth, [], [
    ...filler.slice(0, index).map((p, i) => stage(i, p)), stage(index, killer, [harmful]),
  ]))
  const daily = run(wealth, [], [
    stage(0, filler[0]), stage(1, filler[1]), stage(2, killer, [harmful]),
    { scope: 'dailyLuck', pillar: pillar('day-killing', '庚', '申'),
      validity: interval('day', '2027-01-15T00:00:00.000Z', '2027-01-16T00:00:00.000Z') },
  ])
  assert.deepEqual(build(daily), build(scoped[2]))
  const reduced = run({ ...yin, year: pillar('food', '丁', '巳') }, [], [stage(0, pillar('killing', '辛', '酉'), [harmful]),
    stage(1, pillar('add-hurt', '丙', '午'))])
  const reducedFacts = pressure(build(reduced))
  assert.ok(reducedFacts.some(fact => fact.scopeHistory.some(state =>
    state.scope === 'sewoon' && state.lifecycle === 'reduced')))
  assert.ok(reducedFacts.every(fact => fact.lifecycle !== 'reduced' || fact.certainty !== 'confirmed'))

  const totals = { realStructural: pressure(actualFacts).length, facts: 0, withProvenance: 0, orphan: 0, duplicateId: 0, scopeMismatch: 0,
    active: 0, historical: 0, reused: 0, freeLeakage: 0 }
  const verified = []
  for (const [index, states] of scoped.entries()) {
    const facts = build(states)
    const scope = ['daewoon', 'sewoon', 'month'][index]
    const timing = pressure(facts).filter(fact => fact.scope === scope)
    assert.equal(timing.length, 1, scope)
    assert.deepEqual(timing[0].period, intervals[index])
    assert.equal(timing[0].currentlyEffective, true)
    assert.deepEqual(build(states), facts)
    const shuffled = states.map(snapshot => ({ ...snapshot, stemFacts: [...snapshot.stemFacts].reverse(),
      actualFunctions: [...snapshot.actualFunctions].reverse(), luckEffectStates: [...snapshot.luckEffectStates].reverse(),
      roleEngine: { ...snapshot.roleEngine, roleHistory: [...snapshot.roleEngine.roleHistory].reverse(),
        currentRoles: [...snapshot.roleEngine.currentRoles].reverse() } }))
    assert.deepEqual(build(shuffled), facts)
    const premium = assembleReading({ canonical: judgment.canonical, healthOutcomes: facts, productScope: 'premium' })
    const free = assembleReading({ canonical: judgment.canonical, healthOutcomes: facts, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    const unit = premium.semanticUnits.find(item => item.meaningRef.recordId === timing[0].id)
    const chapter = id => premium.chapters.find(item => item.id === id)
    assert.equal(chapter('CH-07').readiness, 'partial')
    assert.ok(chapter('CH-07').placements.some(item => item.unitId === unit.id && item.role === 'conclusion'))
    assert.ok(chapter(['CH-08', 'CH-09', 'CH-10'][index]).placements.some(item => item.unitId === unit.id && item.role === 'timing'))
    if (scope === 'month') assert.ok(chapter('CH-09').placements.some(item => item.unitId === unit.id && item.role === 'context'))
    assert.deepEqual(unit.evidenceIds, timing[0].provenance)
    assert.equal(unit.certainty, timing[0].certainty)
    assert.ok(free.semanticUnits.every(item => item.topic !== 'health' || item.scope === 'natal'))
    totals.reused++

    const next = { ...judgment.canonical, context: { ...judgment.canonical.context, referenceTime: intervals[index].to.instant } }
    const expired = build(states, next).find(item => item.id === timing[0].id)
    assert.equal(expired.temporalStatus, 'expired')
    assert.equal(expired.currentlyEffective, false)
    const post = assembleReading({ canonical: next, healthOutcomes: [expired], productScope: 'premium' })
    assert.ok(post.semanticUnits.every(item => item.meaningRef.recordId !== expired.id))
    totals.historical++
    verified.push([facts, states])
  }
  for (const [facts, states] of [[actualFacts, judgment.judgmentCore], [build(harmfulNatal), harmfulNatal], ...verified]) {
    assert.equal(new Set(facts.map(item => item.id)).size, facts.length)
    for (const fact of facts) {
      totals.facts++
      assert.ok(fact.provenance.length)
      totals.withProvenance++
      if (fact.semanticType === 'traditional_body_correspondence') continue
      totals.active += Number(fact.currentlyEffective)
      const snapshot = states.find(item => item.id === fact.scopeId)
      assert.ok(snapshot && fact.sourceJudgmentIds.includes(snapshot.id))
      assert.ok(fact.sourceRelationIds.every(id => [...snapshot.stemFacts, ...snapshot.patternFacts].some(item => item.id === id)))
      assert.ok(fact.sourceRoleIds.every(id => snapshot.roleEngine.roleHistory.some(item => item.roleId === id)))
      assert.ok(fact.sourceLuckEffectIds.every(id => snapshot.luckEffectHistory.some(item => item.id === id)))
      assert.ok(fact.sourceParticipantIds.includes(fact.targetEntityId))
      for (const projection of fact.scopeHistory) {
        const child = states.find(item => item.id === projection.scopeId)
        assert.ok(child && [...child.actualFunctions, ...child.inheritedRoleFunctions.map(item => item.actual)]
          .some(item => item.relationFactId === projection.sourceRelationId))
      }
    }
    assert.ok(facts.every(item => ['traditional_body_correspondence', 'structural_health_attention', 'health_attention_period'].includes(item.semanticType)))
    assert.doesNotMatch(JSON.stringify(facts), /"(?:health_(?:improved|recovered|relief_period|score|rank)|disease_(?:prediction|timing)|diagnosis|medical_advice|treatment|surgery_prediction|life_expectancy|best_health_month|worst_health_month)"/u)
  }
  console.log('PASS P4-G', JSON.stringify({ stems: Object.fromEntries(seen), actualMonths: months.length, ...totals }))
} finally {
  await server.close()
}
