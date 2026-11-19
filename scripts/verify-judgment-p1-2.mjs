import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const validity = { periodId: 'p12-fixture', from: { kind: 'exact', instant: '2027-01-01T00:00:00Z' },
  to: { kind: 'exact', instant: '2028-01-01T00:00:00Z' } }
const pillar = (id, value, branch) => ({ stem: { id, value }, ...(branch && { branch: { id: id + '-branch', value: branch } }) })
const luck = (scope, id, stem, branch, policyEvidence) => ({ scope, pillar: pillar(id, stem, branch), validity, policyEvidence })
const proof = (entityId, condition, relatedEntityId) => ({
  entityId, condition, ...(relatedEntityId ? { relatedEntityId } : {}), evidenceIds: [entityId + '-' + condition],
})
const stateOf = (scope, id) => scope.runtime.find(({ entityId }) => entityId === id)?.state
const factFor = (scope, actual) => scope.stemFacts.find(({ id }) => id === actual.relationFactId)
function assertPolicy(scope, id, direction) {
  const actual = scope.actualFunctions.find((item) => item.policyId === id)
  assert.ok(actual, id)
  assert.equal(actual.direction, direction, id)
  assert.equal(actual.evidenceStatus, id === 'WEALTH-04' ? 'FILUNE_APPROVED_OVERRIDE' : 'SOURCE_EXPLICIT')
  return actual
}
const counts = { RES: 0, FOOD: 0, HO: 0, CROSS: 0 }
function check(id, test) {
  try { test() } catch (error) { throw new Error(id, { cause: error }) }
  counts[id.split('-')[0]]++
}

try {
  const { runJudgmentCore } = await server.ssrLoadModule('/src/lib/judgment/core/luckScope.ts')
  const run = (natal, natalPolicyEvidence = [], options = {}) => runJudgmentCore({
    executionId: 'p12', natal, natalValidity: validity, natalCombinations: [], natalPolicyEvidence, luck: [], ...options,
  })
  const money = pillar('wealth', '戊', '辰')
  const officer = pillar('officer', '辛', '酉')
  const kill = pillar('kill', '庚', '申')
  const output = pillar('food', '丙', '午')
  const day = pillar('dm', '甲', '寅')
  const resource = { day, month: pillar('resource', '壬', '亥') }
  const food = { day, month: pillar('food', '丙', '巳') }
  const robber = pillar('resource', '壬', '子')
  const hurt = { day: pillar('dm', '乙', '未'), month: pillar('hurt', '丙', '巳') }
  const hurtResource = pillar('resource', '癸', '子')
  const hurtKilling = pillar('kill', '辛', '酉')
  const necessaryResource = proof('resource', 'needed_resource_chain')
  const necessaryHurtingRegulation = proof('hurt', 'necessary_hurting_regulation')
  const harmful = proof('kill', 'harmful_killing')

  check('RES-T1', () => {
    const [natal] = run(resource)
    const actual = assertPolicy(natal, 'RES-01', 'favorable')
    assert.equal(factFor(natal, actual).target.dayMaster, true)
    assert.equal(natal.policyRoles.byeong.length, 0)
  })
  check('RES-T2', () => {
    const [natal] = run({ ...resource, year: officer })
    assertPolicy(natal, 'RES-02', 'favorable')
    assert.ok(natal.policyRoles.sangShen.some(({ entityId }) => entityId === 'officer'))
    assert.ok(natal.patternContext.manifestationHistory.every(({ entityId }) => entityId !== 'officer'))
  })
  check('RES-T3', () => {
    const [natal] = run({ ...resource, year: money })
    assert.equal(assertPolicy(natal, 'wealth-controls-resource-in-resource', 'unfavorable').byeongCandidate, true)
    assert.ok(natal.policyRoles.byeong.some(({ damagedFunction }) => damagedFunction === 'resource'))
    const [resolved] = run({ ...resource, year: money, time: pillar('resource-resolver', '癸', '子') }, [], {
      natalCombinations: [['wealth', 'resource-resolver']],
    })
    const remedy = resolved.policyRoles.guEung.find(({ entityId }) => entityId === 'resource-resolver')
    assert.ok(remedy && resolved.policyRoles.byeong.some(({ id, currentState }) =>
      id === remedy.targetByeongId && currentState === 'inactive'))
  })
  check('RES-T4', () => {
    const [natal] = run({ ...resource, year: money }, [], { resourceExcessEvidenceIds: ['reviewed-excess'] })
    const actual = assertPolicy(natal, 'resource-excess-uses-wealth', 'favorable')
    assert.equal(actual.byeongCandidate, false)
    assert.ok(natal.formulas.some(({ formulaType, relationFactIds }) =>
      formulaType === 'ResourceExcessUsesWealth' && relationFactIds.includes(actual.relationFactId)))
    assert.ok(natal.policyRoles.sangShen.some(({ entityId }) => entityId === 'wealth'))
  })
  check('RES-T5', () => {
    const [natal] = run({ ...resource, year: output }, [proof('food', 'necessary_output')])
    assertPolicy(natal, 'RES-08', 'unfavorable')
    assert.ok(natal.policyRoles.byeong.some(({ damagedFunction }) => damagedFunction === 'output'))
  })
  check('RES-T6', () => {
    const [natal] = run({ ...resource, year: kill }, [necessaryResource])
    assertPolicy(natal, 'RES-03', 'favorable_candidate')
    assert.ok(natal.policyRoles.sangShen.some(({ entityId, supportingPath }) => entityId === 'resource' && supportingPath.length > 1))
    assert.ok(run({ ...resource, year: kill })[0].actualFunctions.every(({ policyId }) => policyId !== 'RES-03'))
  })
  check('RES-T7', () => {
    const [natal] = run({ ...resource, year: kill, time: money }, [necessaryResource])
    const compound = assertPolicy(natal, 'RES-09', 'unfavorable_candidate')
    const resourceControl = assertPolicy(natal, 'wealth-controls-resource-in-resource', 'unfavorable')
    const chain = assertPolicy(natal, 'RES-03', 'favorable_candidate')
    assert.ok(compound.conditionEvidence.includes(resourceControl.relationFactId))
    assert.ok(compound.conditionEvidence.includes(chain.relationFactId))
    assert.ok(natal.policyRoles.byeong.some(({ policyId, relationFactIds }) => policyId === 'RES-09' && relationFactIds.length === 4))
  })
  check('RES-T8', () => {
    const [natal] = run({ ...resource, year: money }, [proof('resource', 'weak_resource_strong_wealth')])
    assertPolicy(natal, 'RES-06', 'unfavorable')
    const [excess] = run({ ...resource, year: output }, [proof('dm', 'excessive_resource_and_day')])
    assert.equal(assertPolicy(excess, 'RES-01', 'favorable').flowConstraint, 'excessive_resource_and_day')
    assert.equal(assertPolicy(excess, 'RES-01', 'favorable').function, 'reduced')
    assertPolicy(excess, 'RES-07', 'favorable_candidate')
  })

  check('FOOD-T1', () => {
    const [natal] = run({ ...food, year: money })
    assertPolicy(natal, 'FOOD-01', 'favorable')
    assert.ok(natal.policyRoles.sangShen.some(({ entityId }) => entityId === 'food'))
  })
  check('FOOD-T2', () => {
    const [natal] = run({ ...food, year: kill })
    assert.equal(factFor(natal, assertPolicy(natal, 'FOOD-02', 'favorable')).action, 'control')
    assert.equal(stateOf(natal, 'kill'), 'active')
  })
  check('FOOD-T3', () => {
    const [natal] = run({ ...food, year: robber })
    assert.equal(assertPolicy(natal, 'FOOD-05', 'unfavorable').byeongCandidate, true)
    assert.ok(natal.policyRoles.byeong.some(({ targetEntityId }) => targetEntityId === 'food'))
  })
  check('FOOD-T4', () => {
    const [natal] = run({ ...food, year: robber, time: money })
    assertPolicy(natal, 'food-god-wealth-protects-output', 'favorable')
    const [resolver] = natal.policyRoles.guEung
    assert.equal(resolver.entityId, 'wealth')
    assert.ok(natal.policyRoles.byeong.some(({ id, currentState }) => id === resolver.targetByeongId && currentState === 'inactive'))
  })
  check('FOOD-T5', () => {
    const [natal] = run({ ...food, year: kill, time: money })
    const control = assertPolicy(natal, 'FOOD-02', 'favorable')
    const feed = assertPolicy(natal, 'FOOD-03', 'unfavorable_candidate')
    assert.ok(feed.conditionEvidence.includes(control.relationFactId))
    assert.equal(factFor(natal, feed).action, 'generate')
    assertPolicy(natal, 'FOOD-01', 'favorable')
  })
  check('FOOD-T6', () => {
    const [natal] = run({ ...food, year: kill, time: money }, [proof('wealth', 'blocked_wealth_feed', 'kill')])
    assertPolicy(natal, 'FOOD-02', 'favorable')
    assertPolicy(natal, 'FOOD-04', 'favorable')
    const blocked = natal.stemFacts.find(({ action, source, target }) =>
      action === 'generate' && source.id === 'wealth' && target.id === 'kill')
    assert.equal(natal.actualFunctions.find(({ relationFactId }) => relationFactId === blocked.id).function, 'inactive')
    assert.ok(natal.actualFunctions.every(({ policyId }) => policyId !== 'FOOD-03'))
    assert.equal(natal.policyRoles.byeong.length, 0)
  })
  check('FOOD-T7', () => {
    const natal = { ...food, year: robber }
    const [excess] = run(natal, [proof('food', 'excessive_food')])
    assertPolicy(excess, 'FOOD-07', 'favorable_candidate')
    assert.equal(excess.policyRoles.byeong.length, 0)
    const [insufficient] = run(food, [], {
      natalCapacityEvidence: { state: 'output_capacity_insufficient', evidenceIds: ['reviewed-capacity'] },
    })
    assertPolicy(insufficient, 'FOOD-08', 'unfavorable_candidate')
    assert.ok(insufficient.policyRoles.byeong.some(({ damagedFunction }) => damagedFunction === 'output_capacity'))
    assert.ok(run(food)[0].actualFunctions.every(({ policyId }) => policyId !== 'FOOD-08'))
  })
  check('FOOD-T8', () => {
    const [natal, protectedScope] = run({ ...food, year: robber }, [], {
      luck: [luck('greatLuck', 'wealth', '戊', '辰')],
    })
    const [path] = natal.policyRoles.byeong
    assert.ok(protectedScope.luckEffects.some(({ effectType, subjectId }) => effectType === 'relieves_byeong' && subjectId === path.id))
    assert.equal(protectedScope.policyRoles.guEung.length, 0)
    assert.ok(protectedScope.policyRoles.sangShen.every(({ entityId }) => entityId !== 'wealth'))
    const [before, after] = run({ ...food, year: money }, [], { luck: [luck('greatLuck', 'kill', '庚', '申')] })
    assert.equal(before.conditionalByeong[0].currentState, 'conditional')
    assert.equal(after.conditionalByeong[0].currentState, 'active')
    assert.ok(after.luckEffects.some(({ effectType }) => effectType === 'activates_byeong'))
  })

  check('HO-T1', () => {
    const [natal] = run({ ...hurt, year: money })
    assertPolicy(natal, 'HO-01', 'favorable')
    assert.ok(natal.policyRoles.sangShen.some(({ entityId }) => entityId === 'hurt'))
  })
  check('HO-T2', () => {
    const [natal] = run({ ...hurt, year: pillar('officer', '庚', '申') })
    assert.equal(assertPolicy(natal, 'HO-03', 'unfavorable_candidate').byeongCandidate, false)
    const [confirmed] = run({ ...hurt, year: pillar('officer', '庚', '申') }, [proof('officer', 'necessary_officer')])
    assert.equal(assertPolicy(confirmed, 'HO-03', 'unfavorable_candidate').byeongCandidate, true)
  })
  check('HO-T3', () => {
    const [natal] = run({ ...hurt, year: hurtResource }, [necessaryHurtingRegulation])
    assertPolicy(natal, 'HO-02', 'favorable_candidate')
    assert.ok(natal.policyRoles.sangShen.some(({ entityId }) => entityId === 'resource'))
  })
  check('HO-T4', () => {
    const [natal] = run({ ...hurt, year: hurtKilling }, [harmful])
    assert.equal(factFor(natal, assertPolicy(natal, 'HO-04', 'favorable_candidate')).action, 'control')
    assert.ok(natal.formulas.every(({ formulaType }) => formulaType !== 'HurtingOfficerCombinesKilling'))
  })
  check('HO-T5', () => {
    const [natal] = run({ ...hurt, year: hurtKilling }, [harmful], { natalCombinations: [['hurt', 'kill']] })
    assert.equal(factFor(natal, assertPolicy(natal, 'HO-05-harmful', 'favorable')).action, 'combine')
    assert.equal(stateOf(natal, 'kill'), 'stopped')
    const [remedy] = natal.policyRoles.guEung
    assert.equal(remedy.entityId, 'hurt')
    assert.ok(natal.policyRoles.byeong.some(({ id, currentState }) => id === remedy.targetByeongId && currentState === 'inactive'))
    const [, , weak] = run({ ...hurt, month: pillar('m', '戊', '巳') }, [], {
      luck: [luck('greatLuck', 'kill', '辛', '酉', [harmful]), luck('yearlyLuck', 'hurt', '丙', '午')],
    })
    assert.equal(assertPolicy(weak, 'HO-05-harmful', 'favorable').function, 'reduced')
    assert.equal(stateOf(weak, 'kill'), 'weakened')
  })
  check('HO-T6', () => {
    const [natal] = run({ ...hurt, year: hurtKilling }, [proof('kill', 'necessary_killing')], {
      natalCombinations: [['hurt', 'kill']],
    })
    assertPolicy(natal, 'HO-05-needed', 'unfavorable')
    assert.ok(natal.policyRoles.byeong.some(({ damagedFunction }) => damagedFunction === 'necessary_killing'))
    const [unknown] = run({ ...hurt, year: hurtKilling }, [], { natalCombinations: [['hurt', 'kill']] })
    assertPolicy(unknown, 'HO-05', 'context_dependent')
  })
  check('HO-T7', () => {
    const [natal] = run({ ...hurt, year: hurtResource, time: money }, [necessaryHurtingRegulation])
    const broken = assertPolicy(natal, 'HO-06', 'unfavorable')
    assert.ok(broken.conditionEvidence.includes(assertPolicy(natal, 'HO-02', 'favorable_candidate').relationFactId))
    assert.ok(natal.policyRoles.byeong.some(({ targetEntityId }) => targetEntityId === 'resource'))
  })
  check('HO-T8', () => {
    const [natal] = run({ ...hurt, year: hurtResource, time: hurtKilling }, [necessaryHurtingRegulation, harmful])
    for (const [id, action] of [['HO-02', 'control'], ['HO-04', 'control'], ['HO-07', 'generate']]) {
      assert.equal(factFor(natal, assertPolicy(natal, id, 'favorable_candidate')).action, action)
    }
  })

  check('CROSS-WEALTH-CONTROLS-RESOURCE', () => {
    const cases = [
      [run({ day, month: money, year: robber })[0], 'WEALTH-04', 'favorable', false],
      [run({ ...resource, year: money })[0], 'wealth-controls-resource-in-resource', 'unfavorable', true],
      [run({ ...resource, year: money }, [], { resourceExcessEvidenceIds: ['excess'] })[0],
        'resource-excess-uses-wealth', 'favorable', false],
      [run({ ...food, year: robber, time: money })[0], 'food-god-wealth-protects-output', 'favorable', false],
      [run({ ...hurt, year: hurtResource, time: money }, [necessaryHurtingRegulation])[0], 'HO-06', 'unfavorable', true],
    ]
    for (const [snapshot, id, expected, candidate] of cases) {
      const actual = assertPolicy(snapshot, id, expected)
      const fact = factFor(snapshot, actual)
      assert.equal(fact.action, 'control')
      assert.equal(fact.source.id, 'wealth')
      assert.equal(fact.target.id, 'resource')
      assert.equal(actual.byeongCandidate, candidate)
      assert.ok(!('direction' in fact) && !('good' in fact) && !('bad' in fact))
    }
  })
  console.log('P1-2', JSON.stringify(counts), 'total', Object.values(counts).reduce((sum, count) => sum + count, 0))
} finally {
  await server.close()
}
