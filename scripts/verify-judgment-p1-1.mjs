import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const validity = { periodId: 'p11-fixture', from: { kind: 'exact', instant: '2027-01-01T00:00:00Z' },
  to: { kind: 'exact', instant: '2028-01-01T00:00:00Z' } }
const pillar = (id, value, branch) => ({ stem: { id, value }, ...(branch && { branch: { id: id + '-branch', value: branch } }) })
const luck = (scope, id, stem, branch, policyEvidence) => ({ scope, pillar: pillar(id, stem, branch), validity, policyEvidence })
const evidence = (entityId, condition) => ({ entityId, condition, evidenceIds: [entityId + '-' + condition] })
const runtime = (scope, id) => scope.runtime.find(({ entityId }) => entityId === id)?.state
const result = (scope, policyId) => scope.actualFunctions.find((item) => item.policyId === policyId)
const factFor = (scope, actual) => [...scope.stemFacts, ...scope.patternFacts].find(({ id }) => id === actual.relationFactId)
const direction = (scope, policyId, expected) => {
  const actual = result(scope, policyId)
  assert.ok(actual, policyId)
  assert.equal(actual.direction, expected, policyId)
  assert.equal(actual.evidenceStatus, policyId === 'WEALTH-04' ? 'FILUNE_APPROVED_OVERRIDE' : 'SOURCE_EXPLICIT')
  return actual
}
const counts = { OFF: 0, KILL: 0, WEALTH: 0 }
function check(id, test) {
  try { test() } catch (error) { throw new Error(id, { cause: error }) }
  counts[id.split('-')[0]]++
}

try {
  const { runJudgmentCore } = await server.ssrLoadModule('/src/lib/judgment/core/luckScope.ts')
  const run = (natal, natalPolicyEvidence = [], scopes = [], natalCombinations = []) =>
    runJudgmentCore({ executionId: 'p11', natal, natalValidity: validity, natalCombinations, natalPolicyEvidence, luck: scopes })
  const officer = { day: pillar('dm', '甲', '寅'), month: pillar('officer', '辛', '酉') }
  const hurt = pillar('hurt', '丁', '巳')
  const guard = pillar('guard', '壬', '子')
  const wealthStem = pillar('wealth', '戊', '辰')
  check('OFF-T1', () => direction(run({ ...officer, year: wealthStem })[0], 'OFF-01', 'favorable'))
  check('OFF-T2', () => {
    const [state] = run({ ...officer, year: hurt })
    assert.equal(direction(state, 'OFF-03', 'unfavorable').byeongCandidate, true)
    assert.equal(state.policyRoles.byeong[0].damagedFunction, 'officer')
    assert.equal(state.policyRoles.byeong[0].currentState, 'active')
  })
  check('OFF-T3', () => {
    const [state] = run({ ...officer, year: hurt, time: guard })
    const actual = direction(state, 'OFF-02', 'favorable')
    const helper = state.policyRoles.sangShen.find(({ entityId }) => entityId === 'guard')
    assert.ok(helper.supportingPath.includes(actual.relationFactId))
    assert.equal(state.policyRoles.byeong.length, 0)
    assert.equal(result(state, 'OFF-03').byeongCandidate, false)
    const [natal, scope] = run({ ...officer, year: hurt }, [], [luck('greatLuck', 'luck-guard', '壬', '子')])
    // 壬–丁 is a valid stop here, so relief is attributed to the stop, not 印護官.
    assert.ok(scope.luckEffects.some(({ effectType, subjectId }) =>
      effectType === 'relieves_byeong' && subjectId === natal.policyRoles.byeong[0].id))
    assert.ok(scope.policyRoles.sangShen.every(({ entityId }) => entityId !== 'luck-guard'))
  })
  check('OFF-T4', () => {
    const [state] = run({ ...officer, year: pillar('killing', '庚', '申') })
    const actual = direction(state, 'OFF-05', 'unfavorable_candidate')
    assert.equal(factFor(state, actual).action, 'coexist')
    assert.equal(state.policyRoles.byeong.length, 0)
    assert.equal(actual.byeongCandidate, false)
    assert.equal(result(run({ ...officer, day: pillar('dm', '甲', '卯'), year: pillar('killing', '庚') })[0], 'OFF-05'), undefined)
  })
  check('OFF-T5', () => {
    const [natal, scope] = run({ day: pillar('dm', '乙'), month: pillar('officer', '庚', '申'),
      year: pillar('killing', '辛', '酉') }, [], [luck('greatLuck', 'luck-hurt', '丙', '午')])
    direction(natal, 'OFF-05', 'unfavorable_candidate')
    const combine = direction(scope, 'OFF-07', 'favorable')
    direction(scope, 'OFF-06', 'favorable')
    assert.equal(factFor(scope, combine).action, 'combine')
    assert.equal(runtime(scope, 'officer'), 'active')
    assert.equal(runtime(scope, 'luck-hurt'), 'stopped')
    assert.equal(runtime(scope, 'killing'), 'stopped')
  })
  check('OFF-T6', () => {
    const [, scope] = run({ ...officer, year: hurt, time: guard }, [], [luck('greatLuck', 'wealth', '戊', '辰')])
    direction(scope, 'OFF-04', 'unfavorable')
    assert.equal(result(run({ ...officer, year: wealthStem, time: guard })[0], 'OFF-04'), undefined)
  })

  const killing = { day: pillar('dm', '甲', '寅'), month: pillar('killing', '庚', '申') }
  const food = pillar('food', '丙', '巳')
  const harmful = evidence('killing', 'harmful_killing')
  const needed = evidence('killing', 'needed_insufficient_killing')
  check('KILL-T1', () => {
    const [state] = run({ ...killing, year: food })
    assert.equal(factFor(state, direction(state, 'KILL-01', 'favorable')).action, 'control')
    assert.equal(runtime(state, 'killing'), 'active')
    assert.ok(state.policyRoles.sangShen.some(({ entityId }) => entityId === 'food'))
  })
  check('KILL-T2', () => {
    const [state] = run({ ...killing, year: wealthStem }, [harmful])
    direction(state, 'KILL-05', 'unfavorable')
    assert.equal(state.policyRoles.byeong[0].policyId, 'KILL-05')
    direction(run({ ...killing, year: wealthStem }, [evidence('killing', 'excessive_killing')])[0], 'KILL-05', 'unfavorable')
  })
  check('KILL-T3', () => {
    const natal = { ...killing, year: wealthStem }
    direction(run(natal, [needed])[0], 'KILL-05-needed-killing', 'favorable_candidate')
    const [unknown] = run(natal)
    const fact = unknown.stemFacts.find(({ source, target, action }) => source.id === 'wealth'
      && target.id === 'killing' && action === 'generate')
    assert.equal(unknown.actualFunctions.find(({ relationFactId }) => relationFactId === fact.id).direction, 'deferred')
  })
  check('KILL-T4', () => {
    const [state] = run({ ...killing, year: guard }, [evidence('guard', 'needed_resource_chain')])
    const actual = direction(state, 'KILL-03', 'favorable_candidate')
    assert.ok(state.policyRoles.sangShen.some(({ entityId, supportingPath }) => entityId === 'guard'
      && supportingPath.includes(actual.relationFactId)))
  })
  check('KILL-T5', () => {
    const [state] = run({ ...killing, year: hurt }, [harmful])
    assert.equal(factFor(state, direction(state, 'KILL-08', 'favorable_candidate')).action, 'control')
    assert.ok(state.formulas.some(({ formulaType }) => formulaType === 'HurtingOfficerControlsKilling'))
    assert.ok(state.formulas.every(({ formulaType }) => formulaType !== 'HurtingOfficerCombinesKilling'))
  })
  check('KILL-T6', () => {
    const natal = { ...killing, year: food, time: guard }
    const [over] = run(natal, [evidence('food', 'excessive_food_control'), evidence('killing', 'insufficient_killing')])
    direction(over, 'KILL-02', 'context_dependent')
    direction(over, 'KILL-04', 'favorable_candidate')
    direction(run(natal, [evidence('food', 'key_food_control')])[0], 'KILL-04-required-food', 'unfavorable')
  })
  check('KILL-T7', () => {
    const [natal, state] = run({ day: pillar('dm', '乙'), month: pillar('killing', '辛', '酉'),
      year: pillar('officer', '庚', '申') }, [], [luck('greatLuck', 'remove', '乙', '卯')])
    direction(natal, 'KILL-06', 'unfavorable_candidate')
    direction(state, 'KILL-07', 'favorable')
    assert.equal(runtime(state, 'killing'), 'active')
    assert.equal(runtime(state, 'officer'), 'stopped')
  })

  const wealth = { day: pillar('dm', '甲', '寅'), month: wealthStem }
  const wealthKilling = { ...wealth, year: pillar('killing', '庚', '申') }
  check('WEALTH-T1', () => {
    const [state] = run({ ...wealth, year: guard })
    assert.equal(direction(state, 'WEALTH-04', 'favorable').byeongCandidate, false)
    assert.equal(state.policyRoles.byeong.length, 0)
  })
  check('WEALTH-T2', () => {
    const [state] = run({ ...wealth, year: guard })
    const actual = direction(state, 'WEALTH-03', 'favorable')
    assert.equal(actual.byeongCandidate, false)
    assert.equal(factFor(state, actual).action, 'coexist')
  })
  check('WEALTH-T3', () => {
    const [state] = run({ ...wealth, year: food })
    direction(state, 'WEALTH-01', 'favorable')
    assert.ok(state.policyRoles.sangShen.some(({ entityId }) => entityId === 'food'))
  })
  check('WEALTH-T4', () => {
    const [state] = run(wealthKilling, [harmful])
    assert.equal(direction(state, 'WEALTH-06', 'unfavorable_candidate').byeongCandidate, true)
    assert.ok(state.policyRoles.byeong.some(({ damagedFunction, relationFactIds }) =>
      damagedFunction === 'day_master' && relationFactIds.length > 1))
  })
  check('WEALTH-T5', () => {
    const [state] = run({ ...wealthKilling, time: food }, [harmful])
    for (const [policy, expected, action] of [
      ['WEALTH-01', 'favorable', 'generate'], ['WEALTH-06', 'unfavorable_candidate', 'generate'], ['WEALTH-07', 'favorable', 'control'],
    ]) assert.equal(factFor(state, direction(state, policy, expected)).action, action)
  })
  check('WEALTH-T6', () => {
    const [state] = run({ ...wealthKilling, time: hurt }, [harmful])
    assert.equal(factFor(state, direction(state, 'WEALTH-08', 'favorable')).action, 'control')
  })
  const yinWealth = { day: pillar('dm', '乙'), month: pillar('wealth', '己', '丑') }
  check('WEALTH-T7', () => {
    const [natal, origin, child] = run({ ...yinWealth, year: pillar('killing', '辛', '酉') }, [harmful],
      [luck('greatLuck', 'add-hurt', '丙', '午'), luck('yearlyLuck', 'annual', '戊', '戌')])
    const pathId = natal.policyRoles.byeong[0].id
    direction(origin, 'WEALTH-09', 'favorable')
    assert.equal(runtime(origin, 'add-hurt'), 'stopped')
    assert.equal(runtime(origin, 'killing'), 'stopped')
    assert.equal(child.policyRoles.byeong.find(({ id }) => id === pathId).currentState, 'inactive')
    assert.ok(origin.luckEffects.some(({ effectType, subjectId }) => effectType === 'relieves_byeong' && subjectId === pathId))
    assert.ok(child.luckEffects.every(({ effectType }) => effectType !== 'relieves_byeong'))
    assert.equal(child.policyRoles.guEung.length, 0)
    const [, , weak] = run(yinWealth, [], [luck('greatLuck', 'killing', '辛', '酉', [harmful]),
      luck('yearlyLuck', 'add-hurt', '丙', '午')])
    assert.equal(direction(weak, 'WEALTH-09', 'favorable').function, 'reduced')
    assert.equal(runtime(weak, 'add-hurt'), 'weakened')
    assert.equal(runtime(weak, 'killing'), 'weakened')
  })
  check('WEALTH-T8', () => {
    const [natal, active] = run({ ...wealth, year: food }, [],
      [luck('greatLuck', 'killing', '庚', '申', [harmful])])
    assert.equal(natal.conditionalByeong[0].currentState, 'conditional')
    assert.equal(active.conditionalByeong[0].currentState, 'active')
    assert.ok(active.luckEffects.some(({ effectType }) => effectType === 'activates_byeong'))
    const [, unresolved] = run({ ...wealth, year: food }, [], [luck('greatLuck', 'killing', '庚', '申')])
    assert.equal(unresolved.conditionalByeong[0].currentState, 'conditional')
    assert.ok(unresolved.luckEffects.every(({ effectType }) => effectType !== 'activates_byeong'))
  })
  check('WEALTH-T9', () => {
    const [natal] = run({ ...yinWealth, year: pillar('killing', '辛', '酉'), time: pillar('hurt', '丙', '午') },
      [harmful], [], [['killing', 'hurt']])
    const [role] = natal.policyRoles.guEung
    assert.equal(role.entityId, 'hurt')
    assert.ok(natal.policyRoles.byeong.some(({ id, currentState }) => id === role.targetByeongId && currentState === 'inactive'))
  })
  check('WEALTH-T10', () => {
    const [state] = run({ ...wealth, year: pillar('peer', '乙', '卯'), time: pillar('officer', '辛', '酉') })
    direction(state, 'WEALTH-02', 'favorable')
    assert.equal(direction(state, 'WEALTH-05', 'unfavorable_candidate').byeongCandidate, false)
  })
  console.log('P1-1', JSON.stringify(counts), 'total', Object.values(counts).reduce((a, b) => a + b, 0))
} finally {
  await server.close()
}
