import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const pillar = (id, value, branch) => ({ stem: { id, value }, ...(branch && { branch: { id: id + '-branch', value: branch } }) })
const referenceTime = '2027-01-15T00:00:00.000Z'
const valid = [
  period('great', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z'),
  period('year', '2026-02-04T00:00:00.000Z', '2027-02-04T00:00:00.000Z'),
  period('month', '2027-01-05T00:00:00.000Z', '2027-02-04T00:00:00.000Z'),
]
const scopes = ['greatLuck', 'yearlyLuck', 'monthlyLuck']
const luck = (index, pillar, policyEvidence) => ({ scope: scopes[index], pillar, validity: valid[index], policyEvidence })
const has = (facts, semanticType, result, certainty = 'confirmed') =>
  facts.some(fact => fact.semanticType === semanticType && fact.result === result && fact.certainty === certainty)
const acquisition = facts => has(facts, 'money_acquisition', 'can_earn')
const division = facts => has(facts, 'money_loss_or_division', 'wealth_can_be_divided_or_flow_out')
const problem = facts => has(facts, 'money_related_problem', 'wealth_path_can_bring_difficulty')
const types = facts => facts.map(fact => fact.semanticType)
const tally = { facts: 0, provenance: 0, mixedRetention: 0, mixedOutflow: 0, mixedDifficulty: 0,
  active: 0, reduced: 0, protected: 0, reactivated: 0, expired: 0, reuse: [] }

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { buildMoneyOutcome } = await load('outcome/index')
  const { assembleReading, validateReadingAssembly, moneyOutcomeFromReading } = await load('reading/index')
  const run = (natal, options = {}) => runJudgmentCore({
    executionId: 'p4i', natal, natalValidity: valid[2], natalCombinations: [], referenceTime, luck: [], ...options,
  })
  const build = ([natal, ...states], instant = referenceTime) => buildMoneyOutcome({ natal, referenceTime: instant,
    luck: states.map(snapshot => ({ snapshot, evaluatedAt: referenceTime })) })
  function verify(states, facts = build(states)) {
    assert.equal(new Set(facts.map(fact => fact.id)).size, facts.length)
    for (const fact of facts) {
      const snapshot = states.find(item => item.id === fact.scopeId)
      assert.ok(snapshot)
      assert.equal(fact.scope, snapshot.scope === 'natal' ? 'natal' : ['daewoon', 'sewoon', 'month'][scopes.indexOf(snapshot.scope)])
      assert.deepEqual(fact.sourceJudgmentIds, [snapshot.id])
      assert.ok(fact.provenance.length && fact.sourceRelationIds.length)
      assert.ok(fact.sourceRelationIds.every(id => [...snapshot.stemFacts, ...snapshot.patternFacts].some(item => item.id === id)))
      assert.ok(fact.sourceRoleIds.every(id => snapshot.roleEngine.roleHistory.some(item => item.roleId === id)))
      assert.ok(fact.sourceLuckEffectIds.every(id => snapshot.luckEffectStates.some(item => item.event.id === id)))
      assert.doesNotMatch(JSON.stringify(fact), /(?:salary_amount|asset_amount|lottery|investment_recommendation|loan_advice|stock_pick|buy_signal|sell_signal|contract_timing|best_money_month)/u)
      tally.facts++
      tally.provenance++
      if (fact.currentlyEffective && fact.lifecycle === 'active') tally.active++
      if (fact.lifecycle === 'reduced') tally.reduced++
      if (fact.temporalStatus === 'expired') tally.expired++
    }
    return facts
  }
  const dm = pillar('dm', '甲', '寅')
  const food = pillar('food', '丙', '巳')
  const hurt = pillar('hurt', '丁', '午')
  const wealth = pillar('wealth', '戊', '辰')
  const kill = pillar('killing', '庚', '申')
  const proof = condition => ({ entityId: 'killing', condition, evidenceIds: [`killing-${condition}`] })

  // P1 FOOD-T1, HO-T1, WEALTH-T3/T5, PEER-T1/T3 and ROB-T3/T4.
  const foodPattern = { day: dm, month: food, year: wealth }
  const foodStates = run(foodPattern)
  const earned = verify(foodStates)
  assert.ok(acquisition(earned))
  assert.ok(has(earned, 'money_generation_method', 'skill_and_output'))
  assert.ok(has(earned, 'money_retention', 'unresolved', 'deferred'))
  // Actual relation removed at the adapter boundary while both participants and the policy output remain.
  assert.ok(!acquisition(build([{ ...foodStates[0], stemFacts: foodStates[0].stemFacts.filter(item =>
    !(item.action === 'generate' && item.source.id === 'food' && item.target.id === 'wealth')) }])))
  const hurting = verify(run({ day: pillar('dm', '乙', '未'), month: pillar('hurt', '丙', '巳'),
    year: wealth }))
  assert.ok(has(hurting, 'money_generation_method', 'ingenuity_and_expression'))

  const wealthPattern = { day: dm, month: wealth, year: food }
  const capacity = verify(run(wealthPattern, { natalCapacityEvidence: {
    state: 'wealth_capacity_insufficient', evidenceIds: ['reviewed-wealth-bearing-capacity'],
  } }))
  assert.ok(acquisition(capacity))
  assert.ok(has(capacity, 'money_retention', 'harder_to_retain'))
  assert.ok(has(capacity, 'money_duration', 'harder_to_sustain_accumulation'))
  tally.mixedRetention++
  const capacityChange = run(wealthPattern, {
    natalCapacityEvidence: { state: 'wealth_capacity_adequate', evidenceIds: ['reviewed-adequate-bearing-capacity'] },
    luck: [{ ...luck(0, pillar('peer-luck', '甲', '寅')), capacityEvidence: {
      state: 'wealth_capacity_insufficient', evidenceIds: ['reviewed-current-bearing-capacity'],
    } }],
  })
  const scopedCapacity = verify(capacityChange).filter(fact => fact.scope === 'daewoon')
  assert.ok(has(scopedCapacity, 'money_retention', 'harder_to_retain'))
  assert.ok(!acquisition(scopedCapacity))
  assert.ok(scopedCapacity.every(fact => fact.sourceLuckEffectIds.some(id =>
    capacityChange[1].luckEffectStates.some(state => state.event.id === id && state.event.effectType === 'changes_capacity'))))

  const moneyAndKilling = verify(run({ ...wealthPattern, time: kill }, { natalPolicyEvidence: [proof('harmful_killing')] }))
  assert.ok(acquisition(moneyAndKilling) && problem(moneyAndKilling))
  tally.mixedDifficulty++
  const needed = verify(run({ day: dm, month: kill, year: wealth },
    { natalPolicyEvidence: [proof('needed_insufficient_killing')] }))
  assert.ok(!problem(needed))
  assert.ok(!problem(verify(run({ day: dm, month: kill, year: wealth }))))

  const rob = { day: pillar('dm', '乙', '卯'), month: pillar('rob', '甲', '寅') }
  const yinWealth = pillar('wealth', '己', '丑')
  assert.ok(division(verify(run({ ...rob, year: yinWealth }))))
  assert.ok(!division(verify(run(rob))))
  const twoPaths = verify(run({ ...wealthPattern, time: pillar('rob', '乙', '卯') }, { natalPolicyEvidence: [
    { entityId: 'wealth', condition: 'wealth_damage', evidenceIds: ['reviewed-effective-wealth-damage'] },
  ] }))
  assert.ok(acquisition(twoPaths) && division(twoPaths))
  tally.mixedOutflow++

  const resource = pillar('resource', '壬', '亥')
  for (const [chart, policy, direction] of [
    [{ day: dm, month: wealth, year: resource }, 'WEALTH-04', 'favorable'],
    [{ day: dm, month: resource, year: wealth }, 'wealth-controls-resource-in-resource', 'unfavorable'],
    [{ day: dm, month: food, year: pillar('resource', '壬', '子'), time: wealth }, 'food-god-wealth-protects-output', 'favorable'],
  ]) {
    const states = run(chart)
    assert.ok(states[0].actualFunctions.some(actual => actual.policyId === policy && actual.direction === direction), policy)
    const facts = verify(states)
    assert.ok(!division(facts) && !problem(facts), policy)
  }

  const peer = { day: dm, month: pillar('peer', '甲', '寅'), year: wealth, time: pillar('guard', '辛', '酉') }
  const protectionLost = run(peer, { luck: [luck(0, pillar('stopper', '丙', '巳'))] })
  const [before, after] = protectionLost
  assert.ok(after.runtime.some(item => item.entityId === 'guard' && item.state === 'stopped'))
  const reopened = verify(protectionLost)
  assert.ok(has(reopened, 'money_retention', 'retention_supported_by_protection', 'contextual'))
  assert.ok(!division(reopened.filter(fact => fact.scopeId === before.id)))
  assert.ok(division(reopened.filter(fact => fact.scopeId === after.id)))
  tally.protected++
  tally.reactivated++
  const stopped = run({ ...foodPattern, time: pillar('stopper', '癸', '子') },
    { natalCombinations: [['wealth', 'stopper']] })
  assert.ok(stopped[0].runtime.some(item => item.entityId === 'wealth' && item.state === 'stopped'))
  assert.ok(!types(verify(stopped)).includes('money_acquisition'))

  // Existing luck-luck weakening contract with a scoped functioning generation path.
  const weakened = run({ day: dm, month: food }, { luck: [
    luck(0, wealth), luck(1, pillar('weakener', '癸', '子')),
  ] })
  assert.ok(weakened[2].runtime.some(item => item.entityId === 'wealth' && item.state === 'weakened'))
  const attenuated = verify(weakened)
  const source = attenuated.find(item => item.scope === 'daewoon' && item.semanticType === 'money_acquisition')
  const current = attenuated.find(item => item.scope === 'sewoon' && item.semanticType === 'money_acquisition')
  assert.equal(current.certainty, 'contextual')
  assert.equal(current.lifecycle, 'reduced')
  assert.equal(current.conditionId, source.conditionId)
  assert.equal(current.originRelationId, source.originRelationId)
  assert.ok(current.sourceRelationIds.includes(weakened[2].combinationEffects.find(item => item.effect === 'weakened').sourceRelationFactId))

  const fillers = [pillar('peer-luck', '甲', '寅'), pillar('resource-luck', '壬', '子')]
  for (const [index, chapterId] of ['CH-08', 'CH-09', 'CH-10'].entries()) {
    const states = run({ day: dm, month: wealth }, { luck: [
      ...fillers.slice(0, index).map((p, i) => luck(i, p)), luck(index, food),
    ] })
    const facts = verify(states)
    assert.deepEqual(build(states), facts)
    assert.deepEqual(build(states.map(state => ({ ...state, stemFacts: [...state.stemFacts].reverse(),
      actualFunctions: [...state.actualFunctions].reverse(), luckEffectStates: [...state.luckEffectStates].reverse(),
      roleEngine: { ...state.roleEngine, currentRoles: [...state.roleEngine.currentRoles].reverse() } }))), facts)
    const fact = facts.find(item => item.semanticType === 'money_acquisition' && item.scopeId === states.at(-1).id)
    assert.ok(fact)
    assert.deepEqual(fact.period, valid[index])
    const judgment = { canonical: { context: { referenceTime } }, judgmentCore: states, luck: {} }
    assert.deepEqual(moneyOutcomeFromReading({ judgment }), facts)
    const premium = assembleReading({ referenceTime, moneyOutcomes: facts, productScope: 'premium' })
    const free = assembleReading({ referenceTime, moneyOutcomes: facts, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    assert.ok(free.semanticUnits.every(unit => unit.topic !== 'money' || unit.scope === 'natal'))
    const unit = premium.semanticUnits.find(item => item.meaningRef.recordId === fact.id)
    assert.equal(unit.certainty, fact.certainty)
    assert.deepEqual(unit.evidenceIds, fact.provenance)
    const ch5 = premium.chapters.find(chapter => chapter.id === 'CH-05')
    assert.equal(ch5.readiness, 'partial')
    assert.ok(ch5.placements.some(item => item.unitId === unit.id && item.role === 'conclusion'))
    assert.ok(premium.chapters.find(chapter => chapter.id === chapterId).placements
      .some(item => item.unitId === unit.id && item.role === 'timing'))
    assert.equal(premium.chapters.flatMap(chapter => chapter.placements)
      .filter(item => item.unitId === unit.id && item.role === 'conclusion').length, 1)
    tally.reuse.push(chapterId)
    const expired = verify(states, build(states, valid[index].to.instant))
    assert.ok(expired.some(item => item.id === fact.id && item.temporalStatus === 'expired' && !item.currentlyEffective))
    assert.ok(assembleReading({ referenceTime: valid[index].to.instant, moneyOutcomes: expired, productScope: 'premium' })
      .semanticUnits.every(item => item.meaningRef.recordId !== fact.id))
  }
  console.log('PASS P4-I', JSON.stringify(tally))
} finally {
  await server.close()
}
