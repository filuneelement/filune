import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const validity = { periodId: 'p13-fixture', from: { kind: 'exact', instant: '2027-01-01T00:00:00Z' },
  to: { kind: 'exact', instant: '2028-01-01T00:00:00Z' } }
const pillar = (id, value, branch) => ({ stem: { id, value }, ...(branch && { branch: { id: id + '-branch', value: branch } }) })
const luck = (scope, id, stem, branch, policyEvidence) => ({ scope, pillar: pillar(id, stem, branch), validity, policyEvidence })
const proof = (entityId, condition) => ({ entityId, condition, evidenceIds: [entityId + '-' + condition] })
const capacity = { state: 'killing_capacity_adequate', evidenceIds: ['reviewed-adequate-capacity'] }
const actual = (state, id) => state.actualFunctions.find(({ policyId }) => policyId === id)
const runtimeOf = (state, id) => state.runtime.find(({ entityId }) => entityId === id)?.state
function direction(state, id, value) {
  const resolved = actual(state, id)
  assert.ok(resolved, id)
  assert.equal(resolved.direction, value, id)
  return resolved
}
const counts = { PEER: 0, ROB: 0, BLADE: 0, ROLE: 0, CROSS: 0 }
function check(id, test) {
  try { test() } catch (error) { throw new Error(id, { cause: error }) }
  counts[id.split('-')[0]]++
}

try {
  const load = (name) => server.ssrLoadModule('/src/lib/judgment/core/' + name + '.ts')
  const { runJudgmentCore } = await load('luckScope')
  const { monthCommand, provisionalPattern, finalPattern } = await load('pattern')
  const { observeBladeControl, buildPeerConditions } = await load('peerPatterns')
  const { resolveStemRuntime, stemRelations } = await load('stems')
  const { recordCombinations } = await load('combineHistory')
  const { resolvePatternEffectPolicy, resolveActualFunction } = await load('policies')
  const { calculateTenGod } = await server.ssrLoadModule('/src/lib/dayRelationships.ts')
  const run = (natal, natalPolicyEvidence = [], options = {}) => runJudgmentCore({
    executionId: 'p13', natal, natalValidity: validity, natalCombinations: [], natalPolicyEvidence, luck: [], ...options,
  })
  const money = pillar('wealth', '戊', '辰')
  const yinMoney = pillar('wealth', '己', '丑')
  const food = pillar('food', '丙', '巳')
  const hurt = pillar('hurt', '丁', '巳')
  const officer = pillar('officer', '辛', '酉')
  const killing = pillar('kill', '庚', '申')
  const harmfulKilling = proof('kill', 'harmful_killing')
  const needed = proof('kill', 'necessary_killing')
  const peer = { day: pillar('dm', '甲'), month: pillar('peer', '甲', '寅') }
  const rob = { day: pillar('dm', '乙'), month: pillar('rob', '甲', '寅') }
  const blade = { day: pillar('dm', '甲'), month: pillar('blade-month', '乙', '卯') }

  check('PEER-T1', () => {
    const [state] = run({ ...peer, year: money, time: officer })
    direction(state, 'PEER-01', 'favorable')
    assert.ok(state.policyRoles.sangShen.some(({ entityId }) => entityId === 'officer'))
    assert.equal(direction(state, 'PEER-06', 'unfavorable_candidate').byeongCandidate, false)
    assert.equal(actual(run({ ...peer, year: officer })[0], 'PEER-01'), undefined)
  })
  check('PEER-T2', () => {
    const [state] = run({ ...peer, year: money })
    assert.equal(direction(state, 'PEER-06', 'unfavorable_candidate').byeongCandidate, true)
    assert.ok(state.policyRoles.byeong.some(({ damagedFunction }) => damagedFunction === 'wealth'))
  })
  check('PEER-T3', () => {
    const [state] = run({ ...peer, year: money, time: food })
    const effect = direction(state, 'PEER-03', 'favorable_auxiliary')
    assert.equal(effect.conditionEvidence.length, 2)
    assert.equal(state.patternContext.specialYongShen.auxiliaryCandidates[0].id, 'food')
    assert.ok(state.patternContext.specialYongShen.mainCandidates.every(({ id }) => id !== 'food'))
  })
  check('PEER-T4', () => {
    const [state] = run({ ...peer, year: killing })
    assert.equal(state.patternContext.specialYongShen.evidenceStatus, 'FILUNE_APPROVED_OVERRIDE')
    assert.equal(state.patternContext.specialYongShen.sevenKillingAsMainYongShen, false)
    assert.ok(state.patternContext.specialYongShen.mainCandidates.every(({ id }) => id !== 'kill'))
    assert.equal(state.roleEngine.byeongStatus, 'none')
    const [manifested] = run({ day: pillar('dm', '己'), month: pillar('peer', '己', '未'), year: pillar('kill', '乙', '卯') })
    assert.ok(manifested.patternContext.manifestationHistory.some(({ entityId }) => entityId === 'kill'))
    assert.ok(manifested.roleEngine.roleHistory.every(({ entityId, role }) => entityId !== 'kill' || role !== 'YongShen'))
  })
  check('PEER-T5', () => {
    const [state] = run({ ...peer, year: money, time: killing })
    assert.equal(actual(state, 'PEER-05'), undefined)
    assert.ok(state.stemFacts.some(({ action, source, target }) => action === 'generate' && source.id === 'wealth' && target.id === 'kill'))
  })
  check('PEER-T6', () => {
    const [state] = run({ ...peer, year: money, time: killing }, [harmfulKilling])
    assert.equal(direction(state, 'PEER-05', 'unfavorable').byeongCandidate, true)
    const [before, after] = run({ ...peer, year: money, time: food }, [], {
      luck: [luck('greatLuck', 'kill', '庚', '申', [harmfulKilling])],
    })
    assert.equal(before.conditionalByeong[0].currentState, 'conditional')
    assert.equal(after.conditionalByeong[0].currentState, 'active')
    assert.ok(after.luckEffects.some(({ effectType }) => effectType === 'activates_byeong'))
  })
  check('ROB-T1', () => direction(run({ ...rob, year: yinMoney, time: pillar('officer', '庚', '酉') })[0], 'ROB-01', 'favorable'))
  check('ROB-T2', () => {
    const natal = { ...rob, year: yinMoney, time: pillar('kill', '辛', '酉') }
    const [state] = run(natal, [], { natalCapacityEvidence: capacity })
    assert.equal(direction(state, 'ROB-02', 'favorable_candidate').evidenceStatus, 'FILUNE_APPROVED_OVERRIDE')
    assert.equal(actual(run(natal)[0], 'ROB-02'), undefined)
  })
  check('ROB-T3', () => {
    const natal = { ...rob, year: yinMoney }
    assert.equal(direction(run(natal)[0], 'ROB-03', 'unfavorable_candidate').byeongCandidate, true)
    const [exception] = run(natal, [proof('wealth', 'harmful_wealth')])
    assert.equal(actual(exception, 'ROB-03').byeongCandidate, false)
  })
  check('ROB-T4', () => direction(run({ ...rob, year: yinMoney, time: pillar('food', '丁', '午') })[0], 'ROB-04', 'favorable_auxiliary'))
  check('ROB-T5', () => {
    const [state] = run({ ...rob, year: pillar('kill', '辛', '酉') })
    const profile = state.patternContext.specialYongShen
    assert.equal(profile.sevenKillingAsMainYongShen, true)
    assert.equal(profile.ordering, 'deferred')
    assert.ok(profile.mainCandidates.some(({ id }) => id === 'kill'))
  })
  check('ROB-T6', () => {
    const natal = { ...rob, year: yinMoney, time: pillar('kill', '辛', '酉') }
    direction(run(natal, [needed], { natalCapacityEvidence: capacity })[0], 'ROB-05', 'favorable_candidate')
    direction(run(natal, [harmfulKilling], { natalCapacityEvidence: capacity })[0], 'ROB-05-harmful', 'unfavorable_candidate')
    assert.equal(actual(run(natal, [needed])[0], 'ROB-05'), undefined)
  })
  check('BLADE-T1', () => {
    for (const [day, branch] of [['甲', '卯'], ['丙', '午'], ['庚', '酉'], ['壬', '子']]) {
      assert.equal(monthCommand(day, branch).branchPattern, '羊刃')
    }
  })
  check('BLADE-T2', () => assert.equal(monthCommand('戊', '午').branchPattern, '印綬'))
  check('BLADE-T3', () => {
    const natal = { ...blade, year: killing }
    const [state] = run(natal, [needed], { natalCapacityEvidence: capacity })
    const result = direction(state, 'BLADE-01', 'favorable_priority')
    assert.ok(state.patternFacts.some(({ id, basis }) => id === result.relationFactId && basis === 'month_blade'))
    assert.deepEqual(state.patternContext.specialYongShen.main, ['killing', 'officer', 'wealth'])
    assert.equal(actual(run(natal, [needed])[0], 'BLADE-01'), undefined)
    assert.equal(actual(run(natal, [harmfulKilling], { natalCapacityEvidence: capacity })[0], 'BLADE-01'), undefined)
  })
  check('BLADE-T4', () => direction(run({ ...blade, year: officer })[0], 'BLADE-02', 'favorable'))
  check('BLADE-T5', () => direction(run({ ...blade, year: killing, time: money }, [needed],
    { natalCapacityEvidence: capacity })[0], 'BLADE-03', 'favorable_candidate'))
  check('BLADE-T6', () => {
    direction(run({ ...blade, year: killing, time: food }, [needed])[0], 'BLADE-04', 'unfavorable_candidate')
    // Cover the restoration contract with the existing independent officer control and a verified target.
    const restorer = { ...proof('officer', 'restores_blade_control'), relatedEntityId: 'kill' }
    const restoreNatal = { day: pillar('dm', '甲'), month: pillar('officer', '辛', '卯'), year: killing, time: food }
    const [restored] = run(restoreNatal, [needed, restorer])
    const remedy = restored.roleEngine.roleHistory.find(({ role }) => role === 'GuEung')
    assert.equal(remedy.entityId, 'officer')
    assert.ok(restored.policyRoles.byeong.some(({ id, currentState }) => id === remedy.targetByeongId && currentState === 'inactive'))
  })
  check('BLADE-T7', () => direction(run({ ...blade, year: killing, time: hurt }, [needed])[0], 'BLADE-05', 'unfavorable_candidate'))
  // None of the four admitted yang day stems yields a Hurting Officer / Seven Killing five-stem pair.
  // Exercise the conditional policy contract with tagged participants and a real valid pair, separately from chart reachability.
  const abstractBladeCombo = (sourceScope, targetScope) => {
    const cmd = monthCommand('甲', '卯')
    const source = { id: 'hurt', tenGod: '傷官', stem: '丙', scope: sourceScope, dayMaster: false, position: 'luck' }
    const target = { id: 'kill', tenGod: '偏官', stem: '辛', scope: targetScope, dayMaster: false,
      position: targetScope === 'natal' ? 'year' : 'luck' }
    const scope = sourceScope
    const stems = [source, target]
    const facts = stemRelations('abstract', stems)
    const { runtime, combinations } = resolveStemRuntime(scope, stems, new Map())
    const ctx = finalPattern(provisionalPattern('abstract', scope, cmd, stems, [], new Map()), runtime)
    const history = recordCombinations(combinations, facts, scope, 'abstract', ctx.id, validity)
    const observedBlade = observeBladeControl('abstract', cmd.branchPattern, 'blade-branch', '乙', stems)
    const contextualize = buildPeerConditions(cmd.branchPattern, facts, observedBlade, runtime, () => true,
      (id, condition) => id === 'kill' && condition === 'necessary_killing' ? needed : undefined,
      () => null, history, capacity)
    const combine = facts.find(({ action }) => action === 'combine')
    const conditions = new Set()
    contextualize(combine, (key) => conditions.add(key))
    const resolved = resolvePatternEffectPolicy(ctx, combine, conditions)
    const result = resolveActualFunction(resolved, ctx, combine, runtime, [], [], Boolean(history.length))
    return { result, runtime }
  }
  check('BLADE-T8', () => {
    const stems = Array.from('甲乙丙丁戊己庚辛壬癸')
    const pairings = ['甲己', '乙庚', '丙辛', '丁壬', '戊癸']
    for (const day of Array.from('甲丙庚壬')) {
      const hurt = stems.find((stem) => calculateTenGod(day, stem) === '傷官')
      const kill = stems.find((stem) => calculateTenGod(day, stem) === '偏官')
      assert.ok(pairings.every((pair) => !(pair.includes(hurt) && pair.includes(kill))))
    }
    for (const [source, target, expected] of [['greatLuck', 'natal', 'stopped'], ['yearlyLuck', 'greatLuck', 'weakened']]) {
      const { result, runtime } = abstractBladeCombo(source, target)
      assert.equal(result.policyId, 'BLADE-06')
      assert.equal(result.direction, 'unfavorable')
      assert.equal(runtime.get('hurt'), expected)
      assert.equal(runtime.get('kill'), expected)
    }
  })
  check('BLADE-T9', () => {
    const [state] = run({ ...blade, year: pillar('resource', '壬', '子') })
    const fact = state.stemFacts.find(({ source, target, action }) => source.id === 'resource' && target.dayMaster && action === 'generate')
    assert.equal(state.actualFunctions.find(({ relationFactId }) => relationFactId === fact.id).direction, 'deferred')
  })

  const standardOfficer = { day: pillar('dm', '甲'), month: officer }
  const foodChart = { day: pillar('dm', '甲'), month: food, year: pillar('resource', '壬', '子'), time: money }
  check('ROLE-T1', () => {
    const [state] = run({ ...peer, year: money, time: food })
    const roles = state.roleEngine.roleHistory.filter(({ entityId }) => entityId === 'wealth')
    assert.ok(roles.some(({ role }) => role === 'YongShen'))
    const latent = roles.find(({ role }) => role === 'ConditionalByeong')
    const current = state.roleEngine.currentRoles.find(({ roleId }) => roleId === latent.roleId)
    assert.equal(current.currentState, 'conditional')
    assert.equal(current.currentFunction, 'favorable')
  })
  check('ROLE-T2', () => {
    const [state] = run(standardOfficer)
    assert.equal(state.roleEngine.byeongStatus, 'none')
    assert.equal(state.roleEngine.guEungStatus, 'not_applicable')
  })
  check('ROLE-T3', () => {
    const [natal, current] = run({ ...standardOfficer, year: pillar('guard', '癸', '子') }, [], {
      luck: [luck('greatLuck', 'hurt', '丁', '巳')],
    })
    const role = natal.roleEngine.roleHistory.find(({ conditionalThreat }) => conditionalThreat)
    assert.equal(role.conditionalThreat.attackerStem, '丁')
    assert.equal(natal.roleEngine.currentRoles.find(({ roleId }) => roleId === role.roleId).currentState, 'protective_standby')
    assert.equal(natal.roleEngine.byeongStatus, 'none')
    assert.equal(current.roleEngine.currentRoles.find(({ roleId }) => roleId === role.roleId).currentState, 'active')
    assert.ok(current.luckEffects.some(({ effectType, subjectId }) => effectType === 'activates_sangshen_function' && subjectId === role.roleId))
  })
  check('ROLE-T4', () => {
    const [state] = run(foodChart)
    const remedy = state.roleEngine.roleHistory.find(({ role }) => role === 'GuEung')
    assert.ok(remedy.targetByeongId)
    assert.ok(state.policyRoles.byeong.some(({ id }) => id === remedy.targetByeongId))
    assert.equal(run({ ...standardOfficer, year: hurt })[0].roleEngine.guEungStatus, 'none')
    const natal = { day: standardOfficer.day, month: money, year: food }
    const [baseline] = run(natal)
    const basis = baseline.stemFacts.find(({ action, source, target }) =>
      action === 'generate' && source.id === 'food' && target.id === 'wealth')
    const [, activated] = run(natal, [], {
      conditionalByeong: [{ kind: 'can_generate_future_killing', sourceEntityId: 'wealth',
        supportingRelationFactId: basis.id, status: 'conditional' }],
      luck: [luck('greatLuck', 'kill', '庚', '申')],
    })
    assert.equal(activated.roleEngine.byeongStatus, 'confirmed')
    assert.equal(activated.roleEngine.guEungStatus, 'none')
  })
  const roleRelief = () => run({ ...standardOfficer, year: hurt }, [], {
    luck: [luck('greatLuck', 'stopper', '壬', '子'), luck('yearlyLuck', 'child', '戊', '辰')],
  })
  check('ROLE-T5', () => {
    const [natal, parent, child] = roleRelief()
    const damage = natal.roleEngine.roleHistory.find(({ role }) => role === 'Byeong')
    assert.equal(natal.roleEngine.byeongStatus, 'confirmed')
    for (const scope of [parent, child]) {
      assert.ok(scope.roleEngine.roleHistory.some(({ roleId }) => roleId === damage.roleId))
      const current = scope.roleEngine.currentRoles.find(({ roleId }) => roleId === damage.roleId)
      assert.equal(current.currentState, 'stopped')
      assert.equal(current.currentFunction, 'inactive')
    }
  })
  check('ROLE-T6', () => {
    const [, parent, child] = roleRelief()
    assert.ok(parent.luckEffects.some(({ effectType }) => effectType === 'relieves_byeong'))
    assert.ok(child.luckEffects.every(({ effectType }) => effectType !== 'relieves_byeong'))
    assert.ok(parent.roleEngine.roleHistory.every(({ role }) => role !== 'GuEung'))
  })

  check('CROSS-WEALTH-RESOURCE', () => {
    const resource = { day: standardOfficer.day, month: pillar('resource', '壬', '亥'), year: money }
    const hurting = { day: pillar('dm', '乙'), month: pillar('hurt', '丙', '巳'), year: pillar('resource', '癸', '子'), time: money }
    const cases = [
      [run({ day: standardOfficer.day, month: money, year: pillar('resource', '壬', '子') })[0], 'WEALTH-04', 'favorable'],
      [run(resource)[0], 'wealth-controls-resource-in-resource', 'unfavorable'],
      [run(resource, [], { resourceExcessEvidenceIds: ['over'] })[0], 'resource-excess-uses-wealth', 'favorable'],
      [run(foodChart)[0], 'food-god-wealth-protects-output', 'favorable'],
      [run(hurting, [proof('hurt', 'necessary_hurting_regulation')])[0], 'HO-06', 'unfavorable'],
    ]
    for (const [state, id, value] of cases) {
      const resolved = direction(state, id, value)
      const fact = state.stemFacts.find(({ id }) => id === resolved.relationFactId)
      assert.equal(fact.action, 'control')
      assert.ok(!('direction' in fact) && !('good' in fact) && !('bad' in fact))
    }
  })
  check('CROSS-FOOD-KILLING', () => {
    const day = standardOfficer.day
    for (const [state, id, value] of [
      [run({ day, month: killing, year: food })[0], 'KILL-01', 'favorable'],
      [run({ day, month: money, year: killing, time: food }, [harmfulKilling])[0], 'WEALTH-07', 'favorable'],
      [run({ day, month: food, year: killing })[0], 'FOOD-02', 'favorable'],
      [run({ ...blade, year: killing, time: food }, [needed])[0], 'BLADE-04', 'unfavorable_candidate'],
    ]) {
      const resolved = direction(state, id, value)
      assert.ok(state.stemFacts.some(({ id, action }) => id === resolved.relationFactId && action === 'control'))
      assert.equal(runtimeOf(state, 'kill'), 'active')
    }
  })
  check('CROSS-HURTING-COMBINE', () => {
    const day = pillar('dm', '乙')
    const kill = pillar('kill', '辛', '酉')
    const ho = luck('greatLuck', 'hurt', '丙', '午')
    const [officer, wealth, hurting] = [
      run({ day, month: pillar('officer', '庚', '申'), year: kill }, [], { luck: [ho] })[1],
      run({ day, month: yinMoney, year: kill }, [harmfulKilling], { luck: [ho] })[1],
      run({ day, month: pillar('m', '戊', '巳'), year: kill }, [harmfulKilling], { luck: [ho] })[1],
    ]
    direction(officer, 'OFF-07', 'favorable')
    direction(wealth, 'WEALTH-09', 'favorable')
    direction(hurting, 'HO-05-harmful', 'favorable')
    assert.equal(abstractBladeCombo('greatLuck', 'natal').result.direction, 'unfavorable')
  })
  console.log('P1-3', JSON.stringify(counts), 'total', Object.values(counts).reduce((a, b) => a + b, 0))
} finally {
  await server.close()
}
