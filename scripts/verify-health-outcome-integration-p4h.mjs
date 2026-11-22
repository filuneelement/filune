import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const authority = name => read(`src/docs/source/authority/${name}.md`)
const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: `${id}-branch`, value: branch } })
const referenceTime = '2027-01-15T00:00:00.000Z'
const inspection = period('inspection', '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z')
const scopes = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' }
const timingChapters = { daewoon: 'CH-08', sewoon: 'CH-09', month: 'CH-10' }
const ordered = ids => [...new Set(ids)].sort()
const structural = facts => facts.filter(fact => fact.semanticType !== 'traditional_body_correspondence')
const healthUnits = assembly => assembly.semanticUnits.filter(unit => unit.topic === 'health')
const allowed = new Set(['traditional_body_correspondence', 'structural_health_attention', 'health_attention_period'])
const forbidden = /(?:disease[_ -]?(?:prediction|timing)|illness[_ -]?prediction|diagnosis|medical[_ -]?(?:advice|risk)|doctor|hospital|check[_ -]?up|medication|treatment|surgery|life[_ -]?expectancy|death[_ -]?timing|health[_ -]?(?:score|rank|grade|recovered|improved|relief[_ -]?period)|(?:best|worst)[_ -]?health[_ -]?month|weak[_ -]?area|vulnerable[_ -]?organ|\d+\s*%)/iu
const failures = []
const counts = { facts: 0, provenance: 0, active: 0, reduced: 0, stopped: 0, conditional: 0, inherited: 0,
  expired: 0, reuse: { daewoon: 0, sewoon: 0, month: 0 }, sharedNatal: 0 }

function verifyFacts(facts, snapshots) {
  const byId = new Map(snapshots.filter(Boolean).map(snapshot => [snapshot.id, snapshot]))
  assert.equal(new Set(facts.map(fact => fact.id)).size, facts.length, 'duplicate Outcome ID')
  for (const fact of facts) {
    assert.ok(allowed.has(fact.semanticType))
    assert.doesNotMatch(JSON.stringify(fact), forbidden)
    assert.ok(fact.provenance.length)
    counts.facts++
    counts.provenance++
    if (fact.semanticType === 'traditional_body_correspondence') {
      assert.equal(fact.scope, 'natal')
      assert.ok(fact.provenance.includes('A I-16'))
      assert.deepEqual([...fact.sourceJudgmentIds, ...fact.sourceRoleIds,
        ...fact.sourceRelationIds, ...fact.sourceLuckEffectIds], [])
      continue
    }
    const snapshot = byId.get(fact.scopeId)
    assert.ok(snapshot, 'orphan scope')
    assert.deepEqual(fact.sourceJudgmentIds, [snapshot.id])
    assert.equal(fact.scope, scopes[snapshot.scope])
    assert.equal(fact.patternContextId, snapshot.patternContext.id)
    assert.ok(fact.sourceParticipantIds.includes(fact.targetEntityId))
    const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
    assert.ok(fact.sourceRelationIds.length)
    assert.ok(fact.sourceRelationIds.every(id => relations.some(relation => relation.id === id)), 'orphan or cross-scope current relation')
    assert.ok(fact.sourceRoleIds.every(id => snapshot.roleEngine.roleHistory.some(role => role.roleId === id)), 'orphan role')
    assert.ok(fact.sourceLuckEffectIds.every(id => snapshot.luckEffectStates.some(state => state.event.id === id
      && state.currentlyEffective && !state.expired
      && (state.inherited ? state.originScopeId !== snapshot.id : state.originScopeId === snapshot.id))), 'wrong-scope effect')
    if (fact.originScopeId) {
      const origin = byId.get(fact.originScopeId)
      assert.ok(origin?.actualFunctions.some(actual => actual.relationFactId === fact.originRelationId), 'orphan origin')
      assert.equal(fact.originScope, scopes[origin.scope])
    }
    for (const projection of fact.scopeHistory) {
      const child = byId.get(projection.scopeId)
      assert.equal(projection.scope, scopes[child?.scope])
      assert.deepEqual(projection.period, child.validity)
      assert.ok([...child.actualFunctions, ...child.inheritedRoleFunctions.map(item => item.actual)]
        .some(actual => actual.relationFactId === projection.sourceRelationId
          && actual.structuralEffect?.relationOriginFactId === fact.originRelationId))
      counts.inherited++
      if (projection.lifecycle === 'reduced') counts.reduced++
      if (projection.lifecycle === 'stopped') counts.stopped++
    }
    if (fact.scope === 'natal') assert.equal(fact.period, undefined)
    else {
      assert.deepEqual(fact.period, snapshot.validity)
      const primary = relations.filter(relation => fact.sourceRelationIds.includes(relation.id))
      const localParticipant = primary.some(relation => relation.source.scope === snapshot.scope || relation.target.scope === snapshot.scope)
      const localEffect = snapshot.luckEffectStates.some(state => !state.inherited && state.originScopeId === snapshot.id
        && fact.sourceLuckEffectIds.includes(state.event.id))
      assert.ok(localParticipant || localEffect, 'timing requires a local cause')
    }
    if (fact.currentlyEffective && fact.lifecycle === 'active') counts.active++
    if (fact.lifecycle === 'reduced') {
      counts.reduced++
      assert.notEqual(fact.certainty, 'confirmed')
    }
    if (fact.temporalStatus === 'expired') {
      counts.expired++
      assert.equal(fact.currentlyEffective, false)
    }
  }
}

try {
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { calculateEightChar } = await load('calculateEightChar')
  const { buildNatalPersonality } = await load('personality/index')
  const { assembleReading, validateReadingAssembly, healthOutcomeFromReading } = await load('reading/index')
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const birthFor = name => ({ date: births[name].date, time: { known: true, value: births[name].time },
    gender: '女性', timeCorrectionMode: 'none' })
  const calculation = { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 }
  const sources = { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
    D: authority('D_rev152'), approval: authority('25-7_rev16') }
  const day = calculateEightChar({ year: 2027, month: 1, day: 15, hour: 9, minute: 0 }).day
  const snapshotsFor = judgment => [...judgment.judgmentCore, ...(judgment.luck.monthlyWindow ?? []).map(month => month.judgmentCore)]
  const permute = snapshot => ({
    ...snapshot, stemFacts: [...snapshot.stemFacts].reverse(), branchFacts: [...snapshot.branchFacts].reverse(),
    patternFacts: [...snapshot.patternFacts].reverse(), actualFunctions: [...snapshot.actualFunctions].reverse(),
    inheritedRoleFunctions: [...snapshot.inheritedRoleFunctions].reverse(),
    luckEffectStates: [...snapshot.luckEffectStates].reverse(), luckEffectHistory: [...snapshot.luckEffectHistory].reverse(),
    roleEngine: { ...snapshot.roleEngine, roleHistory: [...snapshot.roleEngine.roleHistory].reverse(),
      currentRoles: [...snapshot.roleEngine.currentRoles].reverse() },
  })

  function verifyAssembly(judgment, facts, personality, evaluatedLuckScopes) {
    const upstream = judgment.diagnostics ? { judgment } : { canonical: judgment.canonical, luckScopes: judgment.judgmentCore }
    const input = { ...upstream, personality, evaluatedLuckScopes, healthOutcomes: facts }
    const premium = assembleReading({ ...input, productScope: 'premium' })
    const free = assembleReading({ ...input, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    const byId = new Map(facts.map(fact => [fact.id, fact]))
    const units = healthUnits(premium)
    const chapter = id => premium.chapters.find(item => item.id === id)
    assert.equal(chapter('CH-07').readiness, 'partial')
    assert.equal(new Set(units.map(unit => unit.meaningRef.recordId)).size, units.length)
    for (const unit of units) {
      const fact = byId.get(unit.meaningRef.recordId)
      assert.ok(fact && fact.temporalStatus !== 'expired')
      assert.equal(unit.meaningRef.scopeId, fact.scopeId)
      assert.equal(unit.scope, fact.scope)
      assert.equal(unit.certainty, fact.certainty)
      assert.equal(unit.direction, fact.direction)
      assert.equal(unit.currentFunction, fact.currentFunction)
      assert.equal(unit.lifecycle, fact.lifecycle)
      assert.deepEqual(unit.period, fact.period)
      assert.deepEqual(unit.evidenceIds, fact.provenance)
      assert.deepEqual(unit.sourceRoleIds, fact.sourceRoleIds)
      assert.deepEqual(unit.sourceEffectIds, fact.sourceLuckEffectIds)
      const factsInUnit = [...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds,
        ...(fact.semanticType === 'traditional_body_correspondence' ? fact.provenance : [])]
      assert.deepEqual(unit.sourceFactIds, ordered(factsInUnit))
      const placements = premium.chapters.flatMap(ch => ch.placements.filter(item => item.unitId === unit.id))
      assert.equal(placements.filter(item => item.role === 'conclusion').length, 1)
      assert.ok(chapter('CH-07').placements.some(item => item.unitId === unit.id && item.role === 'conclusion'))
      const timing = timingChapters[unit.scope]
      if (timing) {
        assert.ok(chapter(timing).placements.some(item => item.unitId === unit.id && item.role === 'timing'))
        counts.reuse[unit.scope]++
      }
      if (unit.scope === 'month') assert.ok(chapter('CH-09').placements.some(item => item.unitId === unit.id && item.role === 'context'))
    }
    for (const fact of facts.filter(fact => fact.temporalStatus === 'expired')) {
      assert.ok(units.every(unit => unit.meaningRef.recordId !== fact.id), 'expired leak')
    }
    for (const unit of healthUnits(free)) {
      assert.equal(unit.scope, 'natal')
      assert.deepEqual(unit, units.find(candidate => candidate.id === unit.id))
      counts.sharedNatal++
    }
    assert.doesNotMatch(JSON.stringify(units), forbidden)
    return premium
  }

  const calc = calculateCanonicalChart(birthFor('CS-005'), calculation)
  const intervals = [
    period('daewoon', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z'),
    period('sewoon', '2026-02-04T00:00:00.000Z', '2027-02-04T00:00:00.000Z'),
    period('month', '2027-01-05T00:00:00.000Z', '2027-02-04T00:00:00.000Z'),
  ]
  const scopeNames = ['greatLuck', 'yearlyLuck', 'monthlyLuck']
  const stage = (index, p, policyEvidence) => ({ scope: scopeNames[index], pillar: p, validity: intervals[index], policyEvidence })
  const evidence = condition => ({ entityId: 'killing', condition, evidenceIds: [`killing-${condition}`] })
  const harmful = evidence('harmful_killing')
  const needed = evidence('needed_insufficient_killing')
  const dayMaster = pillar('dm', '甲', '寅')
  const killing = pillar('killing', '庚', '申')
  const wealth = pillar('wealth', '戊', '辰')
  const food = pillar('food', '丙', '巳')
  const run = (natal, natalPolicyEvidence = [], luck = [], natalCombinations = []) => runJudgmentCore({
    executionId: 'p4h-policy', natal, natalPolicyEvidence, luck, natalCombinations, referenceTime, natalValidity: inspection,
  })
  const policyInput = (states, instant = referenceTime) => ({
    judgment: { canonical: { ...calc, context: { ...calc.context, referenceTime: instant } }, judgmentCore: [states[0]], luck: {} },
    evaluatedLuckScopes: states.slice(1).map(snapshot => ({ snapshot, evaluatedAt: referenceTime })),
  })
  const policyFacts = (states, instant) => healthOutcomeFromReading(policyInput(states, instant))

  // P1 KILL-T2/T3 and WEALTH-T7/T8/T9, using existing policy evidence and the scoped cases exercised by P4-G.
  const killNatal = { day: dayMaster, month: killing, year: wealth }
  const [harmFact] = structural(policyFacts(run(killNatal, [harmful])))
  assert.equal(harmFact.path, 'harmful_killing')
  assert.equal(harmFact.certainty, 'confirmed')
  assert.equal(harmFact.currentlyEffective, true)
  for (const precondition of [[], [needed]]) {
    const states = run(killNatal, precondition)
    assert.ok(states[0].stemFacts.some(fact => fact.action === 'generate' && fact.target.id === killing.stem.id))
    assert.equal(structural(policyFacts(states)).length, 0)
  }
  const conditionalNatal = { day: dayMaster, month: wealth, year: food }
  const conditional = run(conditionalNatal)
  assert.ok(conditional[0].conditionalByeong.some(item => item.currentState === 'conditional'))
  assert.equal(structural(policyFacts(conditional)).length, 0)
  counts.conditional++
  const yin = { day: pillar('dm', '乙', '卯'), month: pillar('wealth', '己', '丑') }
  const yinKilling = pillar('killing', '辛', '酉')
  const hurt = pillar('hurt', '丙', '午')
  const stopped = run({ ...yin, year: yinKilling, time: hurt }, [harmful], [], [['killing', 'hurt']])
  assert.ok(stopped[0].runtime.some(item => item.entityId === 'killing' && item.state === 'stopped'))
  assert.equal(structural(policyFacts(stopped)).length, 0)
  counts.stopped++

  const reduced = run({ ...yin, year: pillar('food', '丁', '巳') }, [],
    [stage(0, yinKilling, [harmful]), stage(1, hurt)])
  const inherited = structural(policyFacts(reduced)).find(fact => fact.scope === 'daewoon')
  assert.ok(inherited?.scopeHistory.some(item => item.scope === 'sewoon' && item.lifecycle === 'reduced' && item.currentlyEffective))
  assert.ok(structural(policyFacts(reduced)).every(fact => fact.scope !== 'sewoon' || fact.conditionId === inherited.conditionId))
  verifyFacts(policyFacts(reduced), reduced)

  const filler = [pillar('great-peer', '甲', '寅'), pillar('annual-resource', '壬', '子')]
  for (const [index, scope] of Object.values(scopes).slice(1).entries()) {
    const states = run(conditionalNatal, [], [...filler.slice(0, index).map((p, i) => stage(i, p)), stage(index, killing, [harmful])])
    const facts = policyFacts(states)
    assert.deepEqual(policyFacts(states.map(permute)), facts)
    const timing = structural(facts).filter(fact => fact.scope === scope)
    assert.equal(timing.length, 1)
    assert.equal(timing[0].currentlyEffective, true)
    assert.deepEqual(timing[0].period, intervals[index])
    verifyFacts(facts, states)
    const { judgment, evaluatedLuckScopes } = policyInput(states)
    assert.ok(healthUnits(verifyAssembly(judgment, facts, undefined, evaluatedLuckScopes))
      .some(unit => unit.meaningRef.recordId === timing[0].id))
    const boundary = intervals[index].to.instant
    const expired = policyFacts(states, boundary)
    const same = expired.find(fact => fact.id === timing[0].id)
    assert.equal(same.temporalStatus, 'expired')
    assert.deepEqual(same.provenance, timing[0].provenance)
    verifyFacts(expired, states)
    const later = policyInput(states, boundary)
    verifyAssembly(later.judgment, expired, undefined, later.evaluatedLuckScopes)
  }
  verifyFacts(policyFacts(run(killNatal, [harmful])), run(killNatal, [harmful]))
  console.log('PASS P1 Judgment policy integration and lifecycle')

  // P1-Fix E has two explicit ways for Judgment to reopen a previously protected OFF-03 path.
  const guarded = { day: dayMaster, month: pillar('officer', '辛', '酉'),
    year: pillar('hurt', '丁', '巳'), time: pillar('guard', '壬', '子') }
  for (const reactivation of [pillar('stopper', '丁', '巳'), wealth]) {
    const states = run(guarded, [], [stage(0, reactivation)])
    const [natal, great] = states
    const attack = snapshot => {
      const relation = snapshot.stemFacts.find(item => item.action === 'control'
        && item.source.id === 'hurt' && item.target.id === 'officer')
      return snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
    }
    assert.equal(attack(natal).structuralEffect.blockedBy?.kind, 'active_protection')
    const actual = attack(great)
    assert.equal(actual.policyId, 'OFF-03')
    assert.equal(actual.direction, 'unfavorable')
    assert.equal(actual.function, 'operating')
    assert.ok(actual.structuralEffect.currentlyEffective && !actual.structuralEffect.inherited)
    assert.equal(actual.structuralEffect.originScope, 'greatLuck')
    assert.ok(great.policyRoles.byeong.some(role => role.policyId === 'OFF-03' && role.currentState === 'active'
      && role.relationFactIds.includes(actual.relationFactId)))
    assert.ok(great.patternContext.effectiveManifestedYongShen.some(role => role.entityId === 'officer'))
    const facts = policyFacts(states)
    const { judgment, evaluatedLuckScopes } = policyInput(states)
    const assembly = verifyAssembly(judgment, facts, undefined, evaluatedLuckScopes)
    const fact = structural(facts).find(item => item.path === 'yongshen_pressure' && item.scopeId === great.id
      && item.sourceRelationIds.includes(actual.relationFactId))
    if (!fact) {
      const failure = { classification: 'P4G_OUTCOME_BUG', fixture: 'P1-Fix E',
        trigger: reactivation.stem.id, expected: 'daewoon yongshen_pressure', actual: 'missing upstream Health fact and CH-08 placement' }
      failures.push(failure)
      console.error('FAIL', JSON.stringify(failure))
    } else {
      verifyFacts(facts, states)
      assert.ok(healthUnits(assembly).some(unit => unit.meaningRef.recordId === fact.id))
    }
  }

  const levels = {}
  const levelOnly = new Set(['乙', '丁', '庚', '壬'])
  for (let dayNumber = 1; dayNumber <= 10; dayNumber++) {
    const canonical = calculateCanonicalChart({ ...birthFor('CS-005'), date: { year: 2000, month: 1, day: dayNumber } }, calculation)
    const { judgment } = policyInput(conditional)
    const facts = healthOutcomeFromReading({ judgment: { ...judgment, canonical } })
    const [fact] = facts
    assert.equal(facts.length, 1)
    assert.equal(fact.dayStem, canonical.chart.pillars.day.value.stem)
    assert.equal(fact.specificity, levelOnly.has(fact.dayStem) ? 'element-level-only' : 'direct-source-specific')
    assert.equal(fact.traditionalBodyAreas.length === 0, levelOnly.has(fact.dayStem))
    assert.doesNotMatch(JSON.stringify(fact), forbidden)
    levels[fact.dayStem] = fact.specificity
  }
  assert.equal(Object.keys(levels).length, 10)
  console.log('PASS traditional stems', JSON.stringify(levels))

  const pipeline = name => runInternalReading({
    birth: birthFor(name), calculation, executionId: `p4h-${name}`, natalInspectionPeriod: inspection, sources,
    ...(name === 'CS-005' && {
      monthlyWindowStart: { year: 2026, month: 11 },
      dailyLuck: { pillar: pillar('p4h-reference-day', day[0], day[1]),
        validity: period('p4h-day', '2027-01-14T15:00:00.000Z', '2027-01-15T15:00:00.000Z') },
    }),
  })
  for (const name of Object.keys(births)) {
    const judgment = freeze(pipeline(name))
    const personality = freeze(buildNatalPersonality(judgment.canonical.chart))
    const before = JSON.stringify({ judgment, personality })
    const facts = healthOutcomeFromReading({ judgment })
    verifyFacts(facts, snapshotsFor(judgment))
    const assembly = verifyAssembly(judgment, facts, personality)
    assert.ok(facts.some(fact => fact.semanticType === 'traditional_body_correspondence'))
    const shuffled = { ...judgment, judgmentCore: judgment.judgmentCore.map(permute),
      luck: { ...judgment.luck, monthlyWindow: judgment.luck.monthlyWindow?.map(month =>
        ({ ...month, judgmentCore: month.judgmentCore && permute(month.judgmentCore) })) } }
    assert.deepEqual(healthOutcomeFromReading({ judgment: shuffled }), facts)
    if (name === 'CS-005') {
      const months = assembly.semanticUnits.filter(unit => unit.month)
      assert.equal(months.length, 12)
      assert.equal(judgment.luck.monthlyWindow.length, 12)
      assert.ok(judgment.judgmentCore.some(snapshot => snapshot.scope === 'dailyLuck'))
      assert.ok(healthUnits(assembly).every(unit => unit.scope !== 'day'))
      for (const [index, unit] of months.entries()) {
        const actual = judgment.luck.monthlyWindow[index]
        assert.equal(unit.scope, 'month')
        assert.equal(unit.month.startInstant, actual.startInstant)
        assert.equal(unit.month.endInstant, actual.endInstant)
        assert.equal(unit.month.parentSewoonId, actual.parentSewoonId)
        assert.equal(unit.month.snapshotId, actual.judgmentCore?.id ?? null)
        assert.ok(unit.month.startInstant < unit.month.endInstant)
        if (index) assert.equal(months[index - 1].month.endInstant, unit.month.startInstant)
      }
      console.log('PASS CS-005 12 contiguous solar months and Day exclusion')
    }
    if (name === 'CS-126') {
      const rerun = pipeline(name)
      assert.deepEqual(healthOutcomeFromReading({ judgment: rerun }), facts)
      assert.deepEqual(healthUnits(assembleReading({ judgment: rerun, personality, healthOutcomes: facts, productScope: 'premium' })),
        healthUnits(assembly))
      console.log('PASS independent CS-126 rerun')
    }
    assert.equal(JSON.stringify({ judgment, personality }), before)
    console.log('PASS actual pipeline', name, JSON.stringify({ facts: facts.length, structural: structural(facts).length }))
  }

  for (const directory of ['src/lib/judgment', 'src/lib/outcome/health', 'src/lib/reading']) {
    for (const name of readdirSync(new URL(`../${directory}/`, import.meta.url), { recursive: true })
      .filter(file => file.endsWith('.ts') && !(directory === 'src/lib/reading' && file === 'resourceDominance.ts'))) {
      const source = read(`${directory}/${name}`)
      if (directory === 'src/lib/judgment') assert.doesNotMatch(source, /(?:from\s+|import\s*\()\s*['"][^'"]*\/outcome(?:\/|['"])/u)
      else assert.doesNotMatch(source, /\b(?:runJudgmentCore|runInternalReading|calculateTenGod|calculateMonthlyLuck|calculateCanonicalChart|resolveActualFunction|evaluateRoleEngine|fetch)\s*\(|\bopenai\b/iu)
    }
  }
  console.log('P4-H METRICS', JSON.stringify(counts))
  console.log(failures.length ? 'P4H_FIX_REQUIRED' : 'HEALTH_OUTCOME_BATCH1_COMPLETE')
  if (failures.length) process.exitCode = 1
} finally {
  await server.close()
}
