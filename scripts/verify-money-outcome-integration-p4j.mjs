import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const authority = name => read(`src/docs/source/authority/${name}.md`)
const reverse = items => [...items].reverse()
const sorted = items => [...new Set(items)].sort()
const chapter = (reading, id) => reading.chapters.find(item => item.id === id)
const scopes = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' }
const timing = { daewoon: 'CH-08', sewoon: 'CH-09', month: 'CH-10' }
const allowed = {
  money_acquisition: ['can_earn'],
  money_generation_method: ['skill_and_output', 'ingenuity_and_expression'],
  money_retention: ['harder_to_retain', 'retention_supported_by_protection', 'unresolved'],
  money_loss_or_division: ['wealth_can_be_divided_or_flow_out'],
  money_related_problem: ['wealth_path_can_bring_difficulty', 'wealth_can_weaken_needed_support'],
  money_duration: ['harder_to_sustain_accumulation'],
}
const earningPolicies = new Set(['FOOD-01', 'FOOD-04', 'WEALTH-01', 'HO-01', 'PEER-03', 'ROB-04'])
const forbidden = /salary_amount|asset_amount|loss_amount|lottery|investment_recommendation|stock_pick|buy_signal|sell_signal|loan_advice|money_?score|money_?rank|(?:best|worst)_?money_?month|contract_timing|spending_timing|business_timing|collaboration_timing/iu
const tally = {
  facts: 0, withProvenance: 0, orphan: 0, wrongScope: 0, duplicateIds: 0, duplicatePath: 0,
  active: 0, reduced: 0, expired: 0, future: 0, expiredAtBoundary: 0, currentLeakage: 0,
  structuralOnlyWeakening: 0, confirmedAxisSuppression: 0, mixedCollapse: 0, unsupportedInvention: 0,
  duplicateConclusion: 0, b6Mismatch: 0, forbidden: 0,
  freeLeakage: { daewoon: 0, sewoon: 0, month: 0, day: 0 },
  natalMismatch: { semantic: 0, certainty: 0, provenance: 0 },
  reuse: { 'CH-08': 0, 'CH-09': 0, 'CH-10': 0 },
}
const failures = []
function check(condition, counter, kind, detail) {
  if (condition) return
  tally[counter]++
  failures.push({ kind, detail })
}
const asMoney = reading => reading.semanticUnits.filter(unit => unit.topic === 'money' || unit.meaningRef.kind === 'outcome_fact'
  && unit.meaningRef.recordId.startsWith('money:'))
const isWealth = god => ['正財', '偏財'].includes(god)
const isLive = actual => actual?.structuralEffect?.currentlyEffective
  && ['operating', 'reduced'].includes(actual.function)
const matches = (unit, fact) => unit.scope === fact.scope && unit.certainty === fact.certainty
  && unit.direction === fact.direction && unit.lifecycle === fact.lifecycle
  && JSON.stringify(unit.evidenceIds) === JSON.stringify(fact.provenance)

try {
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { calculateEightChar } = await load('calculateEightChar')
  const { assembleReading, validateReadingAssembly, moneyOutcomeFromReading,
    healthOutcomeFromReading, relationshipOutcomeFromReading } = await load('reading/index')
  const { buildMoneyOutcome } = await load('outcome/index')
  const { buildNatalPersonality } = await load('personality/index')
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  // Existing input from verify-judgment-runtime-context.mjs.
  births['runtime-context'] = { date: { year: 1985, month: 1, day: 4 }, time: { hour: 9, minute: 0 }, gender: '男性' }
  const referenceTime = '2027-01-15T00:00:00.000Z'
  const day = calculateEightChar({ year: 2027, month: 1, day: 15, hour: 9, minute: 0 }).day
  const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
  const sources = { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
    D: authority('D_rev152'), approval: authority('25-7_rev16') }
  const pipeline = (name, label, at, window) => runInternalReading({
    birth: { date: births[name].date, time: { known: true, value: births[name].time },
      gender: births[name].gender ?? '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime: at, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: Number(at.slice(0, 4)) },
    executionId: `p4j-${label}`, natalInspectionPeriod: at === referenceTime
      ? period('natal-inspection', '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z')
      : period('natal-inspection', at, new Date(Date.parse(at) + 86_400_000).toISOString()),
    sources, ...(window && { monthlyWindowStart: { year: 2026, month: 11 } }),
    ...(at === referenceTime && { dailyLuck: {
      pillar: { stem: { id: 'p4j-day', value: day[0] }, branch: { id: 'p4j-day-branch', value: day[1] } },
      validity: period('p4j-day', '2027-01-14T15:00:00.000Z', '2027-01-15T15:00:00.000Z') } }),
  })
  const permute = snapshot => ({ ...snapshot, stemFacts: reverse(snapshot.stemFacts),
    patternFacts: reverse(snapshot.patternFacts), actualFunctions: reverse(snapshot.actualFunctions),
    luckEffectStates: reverse(snapshot.luckEffectStates), luckEffectHistory: reverse(snapshot.luckEffectHistory),
    roleEngine: { ...snapshot.roleEngine, currentRoles: reverse(snapshot.roleEngine.currentRoles),
      roleHistory: reverse(snapshot.roleEngine.roleHistory) } })
  const mixed = { retention: [], outflow: [], difficulty: [] }
  const observed = {}

  const cases = [
    { birth: 'CS-005', at: referenceTime, window: true },
    { birth: 'CS-126', name: 'CS-126 early luck', at: '1998-01-15T00:00:00.000Z' },
    { birth: 'CS-126', at: '2027-07-15T00:00:00.000Z' },
    { birth: 'CS-127', at: referenceTime },
    { birth: 'runtime-context', name: 'runtime-context outflow', at: '1999-09-15T00:00:00.000Z' },
    { birth: 'runtime-context', name: 'runtime-context hurting officer', at: '2003-02-15T00:00:00.000Z' },
  ]
  for (const { birth, at, window, name = birth } of cases) {
    const judgment = freeze(pipeline(birth, name, at, window))
    const personality = freeze(buildNatalPersonality(judgment.canonical.chart))
    const before = JSON.stringify({ judgment, personality })
    const months = judgment.luck.monthlyWindow ?? []
    const snapshots = new Map([...judgment.judgmentCore, ...months.map(month => month.judgmentCore).filter(Boolean)]
      .map(snapshot => [snapshot.id, snapshot]))
    assert.deepEqual(judgment.judgmentCore.map(snapshot => snapshot.scope),
      [...Object.keys(scopes), ...(at === referenceTime ? ['dailyLuck'] : [])], name)
    const facts = freeze(moneyOutcomeFromReading({ judgment }))
    const shuffled = { ...judgment, judgmentCore: judgment.judgmentCore.map(permute),
      luck: { ...judgment.luck, monthlyWindow: reverse(months).map(month =>
        ({ ...month, judgmentCore: month.judgmentCore && permute(month.judgmentCore) })) } }
    assert.deepEqual(moneyOutcomeFromReading({ judgment: shuffled }), facts, name)
    const baselineInput = { judgment, personality, healthOutcomes: healthOutcomeFromReading({ judgment }),
      relationshipOutcomes: relationshipOutcomeFromReading({ judgment }) }
    const input = { ...baselineInput, moneyOutcomes: facts }
    const premium = assembleReading({ ...input, productScope: 'premium' })
    const free = assembleReading({ ...input, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    assert.equal(chapter(premium, 'CH-05').readiness, 'partial')
    assert.deepEqual(assembleReading({ ...baselineInput, productScope: 'free' }), free)
    const baselineReading = assembleReading({ ...baselineInput, productScope: 'premium' })
    const moneyUnitIds = new Set(asMoney(premium).map(unit => unit.id))
    assert.deepEqual(premium.semanticUnits.filter(unit => !moneyUnitIds.has(unit.id)), baselineReading.semanticUnits)
    const units = new Map(asMoney(premium).map(unit => [unit.meaningRef.recordId, unit]))
    const paths = new Set()
    const ids = new Set()
    tally.facts += facts.length

    for (const fact of facts) {
      const snapshot = snapshots.get(fact.scopeId)
      assert.ok(snapshot, fact.id)
      const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
      const path = JSON.stringify([fact.semanticType, fact.scope, fact.period?.from, fact.period?.to, fact.conditionId])
      const evidence = fact.sourceJudgmentIds.length === 1 && fact.sourceJudgmentIds[0] === snapshot.id
        && fact.provenance.length > 0 && fact.sourceRelationIds.length > 0
        && fact.sourceRelationIds.every(id => relations.some(relation => relation.id === id))
        && fact.sourceRoleIds.every(id => snapshot.roleEngine.roleHistory.some(role => role.roleId === id))
        && fact.sourceLuckEffectIds.every(id => snapshot.luckEffectStates.some(state => state.event.id === id))
      if (evidence) tally.withProvenance++
      check(evidence, 'orphan', 'P4I_OUTCOME_BUG', fact.id)
      check(fact.scope === scopes[snapshot.scope] && (fact.scope === 'natal' ||
        JSON.stringify(fact.period) === JSON.stringify(snapshot.validity)), 'wrongScope', 'P4I_OUTCOME_BUG', fact.id)
      check(!ids.has(fact.id), 'duplicateIds', 'P4I_OUTCOME_BUG', fact.id)
      check(!paths.has(path), 'duplicatePath', 'P4I_OUTCOME_BUG', fact.id)
      ids.add(fact.id)
      paths.add(path)
      const relation = relations.find(item => item.id === fact.originRelationId
        || snapshot.actualFunctions.some(actual => actual.relationFactId === item.id
          && actual.structuralEffect?.relationOriginFactId === fact.originRelationId
          && fact.conditionId === 'money-condition:' + JSON.stringify([item.action, item.source.id, item.target.id])))
      const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation?.id)
      const runtimeValid = relation && [relation.source.id, relation.target.id]
        .every(id => snapshot.runtime.some(state => state.entityId === id && state.state !== 'stopped'))
      check(allowed[fact.semanticType]?.includes(fact.result) && runtimeValid && isLive(actual),
        'unsupportedInvention', 'ASSERTION_POLICY_VIOLATION', fact.id)
      const unit = units.get(fact.id)
      const expectedStatus = fact.scope === 'natal' ? 'baseline' : Date.parse(at) < Date.parse(fact.period.from.instant)
        ? 'future' : Date.parse(at) >= Date.parse(fact.period.to.instant) ? 'expired' : 'current'
      check(fact.temporalStatus === expectedStatus && fact.currentlyEffective ===
        (fact.lifecycle !== 'deferred' && ['baseline', 'current'].includes(expectedStatus)),
      'currentLeakage', 'P4I_OUTCOME_BUG', fact.id)
      const visible = ['active', 'reduced'].includes(fact.lifecycle) && fact.temporalStatus !== 'expired'
      if (!visible) {
        check(!unit && !fact.currentlyEffective, 'currentLeakage', 'P4J_ASSEMBLY_BUG', fact.id)
      } else {
        check(unit && matches(unit, fact), 'confirmedAxisSuppression', 'P4J_ASSEMBLY_BUG', fact.id)
        if (unit) {
          assert.deepEqual(unit.sourceFactIds, sorted([...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds]))
          assert.deepEqual(unit.sourceRoleIds, fact.sourceRoleIds)
          assert.deepEqual(unit.sourceEffectIds, fact.sourceLuckEffectIds)
          assert.deepEqual(unit.period, fact.period)
          assert.equal(unit.meaningRef.scopeId, fact.scopeId)
          const routes = premium.chapters.flatMap(section => section.placements
            .filter(placement => placement.unitId === unit.id).map(placement => [section.id, placement]))
          check(routes.filter(([, item]) => item.role === 'conclusion').length === 1,
            'duplicateConclusion', 'P4J_ASSEMBLY_BUG', fact.id)
          assert.ok(routes.some(([id, item]) => id === 'CH-05' && item.role === 'conclusion'))
          if (timing[fact.scope]) {
            const reused = routes.some(([id, item]) => id === timing[fact.scope] && item.role === 'timing'
              && item.contextIds.includes(fact.id))
            check(reused && (fact.scope !== 'month' || routes.some(([id, item]) => id === 'CH-09'
              && item.role === 'context' && item.contextIds.includes(fact.id))), 'b6Mismatch', 'P4J_ASSEMBLY_BUG', fact.id)
            if (reused) tally.reuse[timing[fact.scope]]++
          }
        }
      }
      if (fact.currentlyEffective && fact.lifecycle === 'active') tally.active++
      if (fact.lifecycle === 'reduced') tally.reduced++
      if (fact.temporalStatus === 'expired') tally.expired++
      if (fact.temporalStatus === 'future') tally.future++
    }

    // Evaluate each winning path in its own snapshot so an omitted fact cannot pass
    // by disappearing from both Outcome and Assembly.
    const effective = new Map(judgment.judgmentCore.map(snapshot => [snapshot.id, snapshot]))
    const chosen = new Map()
    for (const snapshot of [...months.map(month => month.judgmentCore).filter(Boolean), ...effective.values()]) {
      if (!scopes[snapshot.scope]) continue
      const key = JSON.stringify([snapshot.scope, snapshot.scope === 'natal' ? null : snapshot.validity.from.instant])
      if (!chosen.has(key)) chosen.set(key, snapshot)
    }
    for (const snapshot of chosen.values()) {
      const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
      for (const actual of snapshot.actualFunctions) {
        if (!earningPolicies.has(actual.policyId) || !isLive(actual)
          || !['favorable', 'favorable_auxiliary'].includes(actual.direction)) continue
        const relation = relations.find(item => item.id === actual.relationFactId)
        if (!relation || relation.action !== 'generate' || !isWealth(relation.target.tenGod)
          || !['食神', '傷官'].includes(relation.source.tenGod)
          || ![relation.source.id, relation.target.id].every(id => snapshot.runtime.some(item =>
            item.entityId === id && item.state !== 'stopped'))) continue
        if (snapshot.scope !== 'natal' && relation.source.scope !== snapshot.scope
          && relation.target.scope !== snapshot.scope) continue
        const expectedMethod = relation.source.tenGod === '食神' ? 'skill_and_output' : 'ingenuity_and_expression'
        const matching = facts.filter(fact => fact.scopeId === snapshot.id && fact.sourceRelationIds.includes(relation.id))
        check(matching.some(fact => fact.result === 'can_earn') && matching.some(fact => fact.result === expectedMethod),
          'structuralOnlyWeakening', 'ASSERTION_POLICY_VIOLATION', `${name} ${snapshot.scope} ${actual.policyId}`)
      }
    }

    for (const snapshot of snapshots.values()) {
      const current = facts.filter(fact => fact.scopeId === snapshot.id && fact.certainty === 'confirmed'
        && fact.temporalStatus !== 'expired')
      if (!current.some(fact => fact.result === 'can_earn')) continue
      for (const [axis, result] of Object.entries({ retention: 'harder_to_retain',
        outflow: 'wealth_can_be_divided_or_flow_out', difficulty: 'wealth_path_can_bring_difficulty' })) {
        if (current.some(fact => fact.result === result)) {
          mixed[axis].push(`${name}:${scopes[snapshot.scope]}:${snapshot.validity.from.instant}`)
          check(current.filter(fact => ['can_earn', result].includes(fact.result)).every(fact => units.has(fact.id)),
            'mixedCollapse', 'ASSERTION_POLICY_VIOLATION', `${name} ${axis}`)
        }
      }
    }
    for (const unit of free.semanticUnits) {
      if (unit.scope !== 'natal') tally.freeLeakage[unit.scope]++
      if (!asMoney(free).includes(unit)) continue
      const same = units.get(unit.meaningRef.recordId)
      if (!same || unit.direction !== same.direction) tally.natalMismatch.semantic++
      if (!same || unit.certainty !== same.certainty) tally.natalMismatch.certainty++
      if (!same || JSON.stringify(unit.evidenceIds) !== JSON.stringify(same.evidenceIds)) tally.natalMismatch.provenance++
    }
    check(!forbidden.test(JSON.stringify({ facts, moneyUnits: asMoney(premium) })),
      'forbidden', 'ASSERTION_POLICY_VIOLATION', name)
    const currentMonthFacts = facts.filter(fact => fact.scope === 'month' && fact.currentlyEffective)
    if (!window && currentMonthFacts.length) {
      const end = currentMonthFacts[0].period.to.instant
      const elapsed = buildMoneyOutcome({ natal: judgment.judgmentCore[0], referenceTime: end,
        luck: judgment.judgmentCore.slice(1).map(snapshot => ({ snapshot, evaluatedAt: at })) })
      const after = assembleReading({ referenceTime: end, moneyOutcomes: elapsed, productScope: 'premium' })
      // Crossing a half-open boundary changes the temporal state, not the life result.
      assert.deepEqual(elapsed.map(fact => fact.id), facts.map(fact => fact.id))
      for (const fact of currentMonthFacts) {
        const expired = elapsed.find(item => item.id === fact.id)
        assert.deepEqual(expired, { ...fact, temporalStatus: 'expired', currentlyEffective: false })
        assert.ok(asMoney(after).every(unit => unit.meaningRef.recordId !== fact.id))
        tally.expiredAtBoundary++
      }
    }
    if (window) {
      assert.equal(months.length, 12)
      const assembledMonths = premium.semanticUnits.filter(unit => unit.month)
      assert.equal(assembledMonths.length, 12)
      for (const [index, month] of months.entries()) {
        assert.ok(month.judgmentCore)
        assert.equal(month.parentJudgmentCore?.id, month.judgmentCore.parentScopeId)
        assert.equal(month.parentJudgmentCore?.scope, 'yearlyLuck')
        const unit = assembledMonths[index]
        assert.deepEqual([unit.month.startInstant, unit.month.endInstant], [month.startInstant, month.endInstant])
        assert.equal(unit.month.snapshotId, month.judgmentCore.id)
        if (index) assert.equal(months[index - 1].endInstant, month.startInstant)
      }
      const expired = facts.filter(fact => fact.temporalStatus === 'expired')
      const reevaluated = buildMoneyOutcome({ natal: judgment.judgmentCore[0], referenceTime: at,
        luck: months.map(month => ({ snapshot: month.judgmentCore, evaluatedAt: month.referenceTime,
          parentSnapshot: month.parentJudgmentCore })) })
      for (const fact of expired) {
        assert.ok(reevaluated.some(item => item.id === fact.id && !item.currentlyEffective))
        assert.ok(!units.has(fact.id))
      }
      console.log('solar window', months[0].startInstant, months.at(-1).endInstant)
    }
    assert.deepEqual(moneyOutcomeFromReading({ judgment }), facts)
    assert.equal(JSON.stringify({ judgment, personality }), before, name)
    observed[name] = facts.map(fact => [fact.scope, fact.result, fact.certainty, fact.temporalStatus, fact.period?.from.instant])
    console.log('fixture', name, JSON.stringify(observed[name]))
  }

  // This fixture crosses a real Luck boundary. Keep the upstream failure visible
  // even when the successful CS-005 window has already covered all twelve terms.
  try {
    pipeline('CS-126', 'CS-126-boundary-window', '2027-07-15T00:00:00.000Z', true)
  } catch (error) {
    if (!(error instanceof TypeError) || !/Carry does not cover full destination period/u.test(error.message)) throw error
    failures.push({ kind: 'UPSTREAM_JUDGMENT_REGRESSION', detail: `CS-126 12-term window: ${error.message}` })
  }

  // Reuse the P4-I protection chart and the P1 closure transition protocol.
  const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
  const protectedChart = { day: pillar('dm', '甲', '寅'), month: pillar('peer', '甲', '寅'),
    year: pillar('wealth', '戊', '辰'), time: pillar('guard', '辛', '酉') }
  const prior = period('great', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z')
  const next = period('next-great', prior.to.instant, '2040-01-01T00:00:00.000Z')
  const recoveryInput = { executionId: 'p4j-protection-recovery', natal: protectedChart,
    natalValidity: prior, natalCombinations: [] }
  const [baseline, lost] = runJudgmentCore({ ...recoveryInput, referenceTime,
    luck: [{ scope: 'greatLuck', pillar: pillar('stopper', '丙', '巳'), validity: prior }] })
  const [restoredBaseline, restored] = runJudgmentCore({ ...recoveryInput, referenceTime: next.from.instant,
    priorHistory: lost,
    luck: [{ scope: 'greatLuck', pillar: pillar('resource-luck', '壬', '子'), validity: next }] })
  assert.ok(lost.runtime.some(item => item.entityId === 'guard' && item.state === 'stopped'))
  const recoveredPath = restored.actualFunctions.find(actual => actual.policyId === 'PEER-06'
    && restored.stemFacts.some(relation => relation.id === actual.relationFactId
      && relation.source.id === 'peer' && relation.target.id === 'wealth'))
  assert.ok(restored.runtime.some(item => item.entityId === 'guard' && item.state !== 'stopped'))
  assert.equal(recoveredPath?.byeongCandidate, false)
  assert.equal(recoveredPath.function, 'reduced')
  assert.ok(restored.stemFacts.some(relation => recoveredPath.resolutionEvidence?.includes(relation.id)
    && relation.source.id === 'guard'))
  const outcomesAt = (natal, instant, luck) => buildMoneyOutcome({ natal, referenceTime: instant, luck })
  const original = outcomesAt(baseline, referenceTime, [{ snapshot: lost, evaluatedAt: referenceTime }])
  const outflow = original.find(fact => fact.scopeId === lost.id && fact.result === 'wealth_can_be_divided_or_flow_out')
  assert.ok(outflow?.currentlyEffective)
  const replacement = outcomesAt(restoredBaseline, next.from.instant, [
    { snapshot: lost, evaluatedAt: referenceTime }, { snapshot: restored, evaluatedAt: next.from.instant },
  ])
  const history = replacement.find(fact => fact.id === outflow.id)
  assert.equal(history?.temporalStatus, 'expired')
  assert.equal(history.currentlyEffective, false)
  assert.ok(!replacement.some(fact => fact.conditionId === outflow.conditionId
    && fact.scopeId === restored.id && fact.result === outflow.result))
  const replacementReading = assembleReading({ moneyOutcomes: replacement,
    referenceTime: next.from.instant, productScope: 'premium' })
  assert.ok(asMoney(replacementReading).every(unit => unit.meaningRef.recordId !== history.id))
  console.log('PASS P4-I protection chart with P1 closure transition: stopped, reactivated, restored and expired')

  const [monthlyNatal, , annual, month] = runJudgmentCore({ ...recoveryInput, executionId: 'p4j-protection-month',
    referenceTime, luck: [
      { scope: 'greatLuck', pillar: pillar('great', '己', '丑'), validity: prior },
      { scope: 'yearlyLuck', pillar: pillar('year', '甲', '寅'),
        validity: period('year', '2026-02-04T00:00:00.000Z', '2027-02-04T00:00:00.000Z') },
      { scope: 'monthlyLuck', pillar: pillar('stopper', '丙', '巳'),
        validity: period('month', '2027-01-05T00:00:00.000Z', '2027-02-04T00:00:00.000Z') },
    ] })
  const windowInput = { judgment: { canonical: { context: { referenceTime } }, judgmentCore: [monthlyNatal],
    luck: { monthlyWindow: [{ judgmentCore: month, parentJudgmentCore: annual, referenceTime }] } } }
  const windowFacts = moneyOutcomeFromReading(windowInput)
  const monthlyNegative = windowFacts.filter(fact => fact.scope === 'month' && fact.direction === 'unfavorable')
  assert.deepEqual(monthlyNegative.map(fact => fact.result), ['wealth_can_be_divided_or_flow_out', 'harder_to_retain'])
  for (const fact of monthlyNegative) {
    assert.equal(fact.sourceJudgmentIds[0], month.id)
    assert.ok(fact.sourceRelationIds.some(id => month.combinationEffects.some(item => item.sourceRelationFactId === id)))
  }
  const fromChain = outcomesAt(monthlyNatal, referenceTime, [annual, month].map(snapshot => ({ snapshot, evaluatedAt: referenceTime })))
  assert.deepEqual(monthlyNegative, fromChain.filter(fact => fact.scope === 'month'))
  assert.ok(!windowFacts.some(fact => fact.scope === 'sewoon'))
  const windowReading = assembleReading({ moneyOutcomes: windowFacts, referenceTime, productScope: 'premium' })
  assert.ok(monthlyNegative.every(fact => chapter(windowReading, 'CH-10').placements.some(placement => placement.role === 'timing'
    && asMoney(windowReading).some(unit => unit.id === placement.unitId && unit.meaningRef.recordId === fact.id))))
  console.log('PASS monthly window preserves protection-loss evidence and reuses the affected Money facts')

  // The existing P1 RES-T4 override still determines the relation direction.
  const [resource] = runJudgmentCore({ ...recoveryInput, executionId: 'p4j-res-t4', referenceTime, luck: [],
    natal: { day: pillar('dm', '甲', '寅'), month: pillar('resource', '壬', '亥'), year: pillar('wealth', '戊', '辰') },
    resourceExcessEvidenceIds: ['reviewed-excess'] })
  const reversal = resource.actualFunctions.find(actual => actual.policyId === 'resource-excess-uses-wealth')
  assert.equal(reversal?.direction, 'favorable')
  assert.equal(reversal.byeongCandidate, false)
  assert.ok(!outcomesAt(resource, referenceTime, []).some(fact => fact.direction === 'unfavorable'
    && fact.sourceRelationIds.includes(reversal.relationFactId)))
  console.log('PASS P1 RES-T4 favorable reversal has no Money damage')

  for (const path of ['src/lib/judgment', 'src/lib/outcome/money', 'src/lib/reading']) {
    for (const file of readdirSync(new URL(`../${path}/`, import.meta.url), { recursive: true }).filter(name => name.endsWith('.ts'))) {
      const source = read(`${path}/${file}`)
      if (path.endsWith('/judgment')) assert.doesNotMatch(source, /(?:from\s+|import\s*\()\s*['"][^'"]*\/outcome(?:\/|['"])/u)
      else assert.doesNotMatch(source, /\b(?:runInternalReading|runJudgmentCore|calculateMonthlyLuck|fetch)\s*\(|\bopenai\b/iu)
    }
  }
  console.log(JSON.stringify({ tally, mixed, failures }))
  assert.ok(Object.values(tally.freeLeakage).every(count => count === 0))
  assert.ok(Object.values(tally.natalMismatch).every(count => count === 0))
  assert.ok(Object.values(tally.reuse).every(count => count > 0))
  assert.ok(tally.expiredAtBoundary > 0)
  console.log(failures.length ? 'P4J_FIX_REQUIRED' : 'MONEY_OUTCOME_BATCH1_COMPLETE')
  if (failures.length) process.exitCode = 1
} finally {
  await server.close()
}
