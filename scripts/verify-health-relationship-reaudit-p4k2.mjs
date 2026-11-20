import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

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
  const input = { executionId: 'p4k2', referenceTime, natalValidity: great, natalCombinations: [],
    natal: { day: pillar('dm', '甲', '寅'), month: pillar('officer', '辛', '酉'),
      year: pillar('hurt', '丁', '巳'), time: pillar('guard', '壬', '子') },
    luck: [
      { scope: 'greatLuck', pillar: pillar('peer', '甲', '寅'), validity: great },
      { scope: 'yearlyLuck', pillar: pillar('annual', '乙', '丑'), validity: annual },
      { scope: 'monthlyLuck', pillar: pillar('stopper', '丁', '巳'), validity: monthly },
    ],
  }
  const states = freeze(runJudgmentCore(input))
  const healthBefore = JSON.stringify(states)
  const [natal, , parent, month] = states
  assert.equal(month.parentScopeId, parent.id)
  const full = healthOutcomeFromReading({ judgment: { canonical, judgmentCore: states, luck: {} } })
  const { recordId } = await load('judgment/producers/shared')
  const monthFacts = facts => facts.filter(fact => fact.scope === 'month')
  const sorted = items => [...new Set(items)].sort()
  function monthlyWindow(judgmentCore, parentJudgmentCore, at, chart = canonical) {
    return healthOutcomeFromReading({ judgment: { canonical: chart, judgmentCore: [natal], luck: {
      monthlyWindow: [{ judgmentCore, parentJudgmentCore: {
        id: parentJudgmentCore.id, scope: parentJudgmentCore.scope, actualFunctions: parentJudgmentCore.actualFunctions,
        stemFacts: parentJudgmentCore.stemFacts,
      }, referenceTime: at }],
    } } })
  }
  const sameSnapshot = monthlyWindow(month, parent, referenceTime)
  assert.equal(monthFacts(full).length, 1)
  assert.deepEqual(monthFacts(sameSnapshot), monthFacts(full))
  const [health] = monthFacts(full)
  assert.equal(health.certainty, 'confirmed')
  assert.deepEqual(health.lifeMeanings.map(meaning => meaning.type), [
    'health_burden', 'health_problem_prone_period', 'health_management_period', 'body_area_burden',
  ])
  assert.ok(health.lifeMeanings.at(-1).areas.length)
  assert.ok(!('lifeMeanings' in full.find(fact => fact.semanticType === 'traditional_body_correspondence')))

  // Reapply the same known P4-K policy fixture at its window start using the
  // execution-ID convention of runMonthlyWindow. All Judgment records are real.
  const windowStart = monthly.from.instant
  const independent = runJudgmentCore({ ...input,
    executionId: recordId('monthly-window-run', [input.executionId, windowStart]),
    referenceTime: windowStart,
    natalValidity: { ...monthly, periodId: recordId('monthly-window-natal-inspection', [windowStart]) },
  })
  const regenerated = monthlyWindow(independent[3], independent[2], windowStart)
  assert.equal(monthFacts(regenerated).length, 1)
  const [windowHealth] = monthFacts(regenerated)
  assert.deepEqual([windowHealth.conditionId, windowHealth.semanticType, windowHealth.lifeMeanings,
    windowHealth.period, windowHealth.certainty, windowHealth.scope, windowHealth.lifecycle],
  [health.conditionId, health.semanticType, health.lifeMeanings, health.period, health.certainty, health.scope, health.lifecycle])
  const parity = {
    missing: 0,
    duplicate: monthFacts(regenerated).length - new Set(monthFacts(regenerated).map(fact => fact.id)).size,
    idMismatch: Number(windowHealth.id !== health.id),
    sourceIdentityMismatch: Number(JSON.stringify([windowHealth.sourceJudgmentIds, windowHealth.sourceRelationIds]) !==
      JSON.stringify([health.sourceJudgmentIds, health.sourceRelationIds])),
    provenanceMismatch: Number(JSON.stringify(windowHealth.provenance) !== JSON.stringify(health.provenance)),
    originScopeMismatch: Number(windowHealth.originScope !== health.originScope || windowHealth.originScopeId !== health.originScopeId),
    originScopeFull: health.originScope,
    originScopeWindow: windowHealth.originScope,
  }
  const combined = healthOutcomeFromReading({ judgment: { canonical, judgmentCore: states, luck: {
    monthlyWindow: [{ judgmentCore: independent[3], parentJudgmentCore: independent[2], referenceTime: windowStart }],
  } } })
  assert.deepEqual(monthFacts(combined), monthFacts(full))

  const reorder = snapshot => ({
    ...snapshot, stemFacts: [...snapshot.stemFacts].reverse(), branchFacts: [...snapshot.branchFacts].reverse(),
    patternFacts: [...snapshot.patternFacts].reverse(), actualFunctions: [...snapshot.actualFunctions].reverse(),
    formationFacts: [...snapshot.formationFacts].reverse(), luckEffectStates: [...snapshot.luckEffectStates].reverse(),
    luckEffectHistory: [...snapshot.luckEffectHistory].reverse(),
    roleEngine: { ...snapshot.roleEngine, currentRoles: [...snapshot.roleEngine.currentRoles].reverse(),
      roleHistory: [...snapshot.roleEngine.roleHistory].reverse() },
  })
  const healthOf = judgmentCore => healthOutcomeFromReading({ judgment: { canonical, judgmentCore, luck: {} } })
  assert.deepEqual(healthOf(states.map(reorder)), full)
  assert.deepEqual(healthOf(runJudgmentCore(input)), full)
  const atExpiry = { ...canonical, context: { ...canonical.context, referenceTime: monthly.to.instant } }
  const history = healthOutcomeFromReading({ judgment: { canonical: atExpiry, judgmentCore: [natal], luck: {} },
    evaluatedLuckScopes: states.slice(1).map(snapshot => ({ snapshot, evaluatedAt: referenceTime })) })
  assert.deepEqual(history.find(fact => fact.id === health.id), { ...health, currentlyEffective: false, temporalStatus: 'expired' })
  const windowHistory = monthlyWindow(independent[3], independent[2], windowStart, atExpiry)
  assert.deepEqual(windowHistory.find(fact => fact.id === windowHealth.id), {
    ...windowHealth, currentlyEffective: false, temporalStatus: 'expired',
  })

  function assembly(facts, chapterId, fact, options = {}) {
    const input = { canonical, ...options, ...facts }
    const premium = assembleReading({ ...input, productScope: 'premium' })
    const free = assembleReading({ ...input, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    assert.ok(!free.semanticUnits.some(unit => ['health', 'relationship'].includes(unit.topic)))
    const unit = premium.semanticUnits.find(item => item.meaningRef.recordId === fact.id)
    assert.ok(unit)
    assert.equal(unit.scope, fact.scope)
    assert.equal(unit.certainty, fact.certainty)
    assert.deepEqual(unit.evidenceIds, sorted(fact.provenance))
    assert.deepEqual(unit.sourceFactIds, sorted([...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds]))
    assert.deepEqual(unit.sourceRoleIds, sorted(fact.sourceRoleIds))
    assert.deepEqual(unit.sourceEffectIds, sorted(fact.sourceLuckEffectIds))
    assert.ok(premium.chapters.find(chapter => chapter.id === chapterId).placements.some(item => item.unitId === unit.id))
    return unit
  }
  assert.deepEqual(assembly({ healthOutcomes: sameSnapshot }, 'CH-10', health).healthLifeMeanings, health.lifeMeanings)
  assembly({ healthOutcomes: regenerated }, 'CH-10', windowHealth)
  assert.ok(!assembleReading({ canonical: atExpiry, healthOutcomes: history, productScope: 'premium' })
    .semanticUnits.some(unit => unit.meaningRef.recordId === health.id))
  assert.ok(!assembleReading({ canonical: atExpiry, healthOutcomes: windowHistory, productScope: 'premium' })
    .semanticUnits.some(unit => unit.meaningRef.recordId === windowHealth.id))
  assert.equal(JSON.stringify(states), healthBefore)
  console.log('Health month parity', JSON.stringify(parity))

  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const authority = name => read(`src/docs/source/authority/${name}.md`)
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const { date, time } = births['CS-127']
  const birthInput = {
    birth: { date, time: { known: true, value: time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'p4k2-cs127', natalInspectionPeriod: monthly,
    sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
      D: authority('D_rev152'), approval: authority('25-7_rev16') },
  }
  const birthJudgment = freeze(runInternalReading(birthInput))
  const { buildNatalPersonality } = await load('personality/index')
  const personality = freeze(buildNatalPersonality(birthJudgment.canonical.chart))
  const before = JSON.stringify({ birthJudgment, personality, states })
  const relationship = relationshipOutcomeFromReading({ judgment: birthJudgment })
  const formation = relationship.find(fact => fact.semanticType === 'relationship_formation')
  assert.equal(formation?.certainty, 'confirmed')
  assert.equal(formation.result, 'opportunity_to_form_close_relationship')
  assert.ok(relationship.some(fact => fact.semanticType === 'relationship_contact_signal'
    && fact.scopeId === formation.scopeId && fact.sourceRelationIds[0] === formation.sourceRelationIds[0]))
  assert.ok(relationship.some(fact => fact.semanticType === 'relationship_change_signal'))
  assert.deepEqual(relationshipOutcomeFromReading({ judgment: runInternalReading(birthInput) }), relationship)
  assert.deepEqual(relationshipOutcomeFromReading({ judgment: { ...birthJudgment,
    judgmentCore: birthJudgment.judgmentCore.map(reorder) } }), relationship)
  assembly({ relationshipOutcomes: relationship }, 'CH-09', formation, { canonical: birthJudgment.canonical,
    judgment: birthJudgment, personality })
  assert.equal(JSON.stringify({ birthJudgment, personality, states }), before)
  // Match the P1-1 OFF-T2 policy fixture's chart and entity IDs at the Outcome boundary.
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
  const policy = runJudgmentCore({ executionId: 'p4k2-off-t2', natal: policyNatal, natalValidity: great,
    referenceTime, natalCombinations: [], luck: [] })
  const pressureFacts = relationshipOutcomeFromReading({ judgment: { canonical: policyChart, judgmentCore: policy, luck: {} } })
  const pressure = pressureFacts.find(fact => fact.semanticType === 'relationship_pressure')
  assert.equal(pressure?.certainty, 'confirmed')
  assert.ok(pressure.sourceRelationIds.every(id => policy[0].actualFunctions.some(actual =>
    actual.relationFactId === id && actual.policyId === 'OFF-03' && actual.function === 'operating')))
  assert.ok(pressureFacts.every(fact => !/breakdown|divorce|breakup/u.test(fact.semanticType)))
  assert.equal(pressure.result, 'close_relationship_can_face_strain')
  assembly({ relationshipOutcomes: pressureFacts }, 'CH-06', pressure, { canonical: policyChart })
  const failures = Object.entries(parity).filter(([key, value]) => key.endsWith('Mismatch') && value)
  console.log('CS-127 formation: confirmed; independent rerun, reordered inputs, provenance, Free and mutation checks: PASS')
  console.log(failures.length ? 'P4K2_FIX_REQUIRED' : 'P4-K.2 supplemental audit checks PASS')
  if (failures.length) process.exitCode = 1
} finally {
  await server.close()
}
