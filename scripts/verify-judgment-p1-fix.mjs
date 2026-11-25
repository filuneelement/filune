import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const validity = { periodId: 'p1-fix', from: { kind: 'exact', instant: '2027-01-01T00:00:00Z' },
  to: { kind: 'exact', instant: '2028-01-01T00:00:00Z' } }
const pillar = (id, value, branch) => ({ stem: { id, value }, ...(branch && { branch: { id: id + '-branch', value: branch } }) })
const luck = (scope, id, value, branch, policyEvidence) => ({ scope, pillar: pillar(id, value, branch), validity, policyEvidence })
const proof = (entityId, condition, relatedEntityId) => ({ entityId, condition,
  ...(relatedEntityId ? { relatedEntityId } : {}), evidenceIds: [condition] })
const relation = (state, sourceId, targetId, action) => state.stemFacts.find(({ source, target, action: type }) =>
  source.id === sourceId && target.id === targetId && type === action)
const actual = (state, source, target, action) => {
  const fact = relation(state, source, target, action)
  assert.ok(fact)
  return state.actualFunctions.find(({ relationFactId }) => relationFactId === fact.id)
}

try {
  const load = (file) => server.ssrLoadModule('/src/lib/judgment/core/' + file + '.ts')
  const { runJudgmentCore } = await load('luckScope')
  const { patternEffectRegistry, resolvePatternEffectPolicy } = await load('policies')
  const run = (natal, options = {}) => runJudgmentCore({
    executionId: 'p1-fix', natal, natalValidity: validity, natalCombinations: [], luck: [], ...options,
  })
  const day = pillar('day', '甲', '寅')
  const killing = { day, month: pillar('killing', '庚', '申'), year: pillar('food', '丙', '巳'), time: pillar('guard', '壬', '子') }
  const key = proof('food', 'key_food_control', 'killing')
  const excess = proof('food', 'excessive_food_control', 'killing')
  const insuff = proof('killing', 'insufficient_killing')
  const harm = proof('killing', 'harmful_killing')
  const capacity = { state: 'killing_capacity_adequate', evidenceIds: ['capacity-reviewed'] }
  const [unresolved] = run(killing, { natalPolicyEvidence: [key, excess, insuff], natalCapacityEvidence: capacity })

  // A. The exact live control, function requirement, excess appraisal and capacity evidence remain auditable.
  const resourceControl = actual(unresolved, 'guard', 'food', 'control')
  assert.deepEqual(resourceControl.matchedPolicies, ['KILL-04', 'KILL-04-required-food'])
  assert.equal(resourceControl.selectedPolicy, null)
  assert.equal(resourceControl.selectionReason, 'conflicting_directions')
  assert.equal(resourceControl.direction, 'deferred')
  const unresolvedControl = actual(unresolved, 'food', 'killing', 'control')
  assert.equal(unresolvedControl.selectionReason, 'unresolved_food_control')
  assert.equal(unresolvedControl.direction, 'deferred')
  assert.ok(['key_food_control', 'excessive_food_control', 'insufficient_killing', 'capacity-reviewed',
    relation(unresolved, 'food', 'killing', 'control').id].every((ref) => resourceControl.conditionEvidence.includes(ref)))
  const [necessary] = run(killing, { natalPolicyEvidence: [key, excess, harm], natalCapacityEvidence: capacity })
  const necessaryControl = actual(necessary, 'food', 'killing', 'control')
  assert.equal(necessaryControl.direction, 'favorable')
  assert.equal(necessaryControl.selectionReason, 'required_function')
  assert.ok(['key_food_control', 'excessive_food_control', 'harmful_killing', 'capacity-reviewed']
    .every((ref) => necessaryControl.conditionEvidence.includes(ref)))
  assert.equal(actual(necessary, 'guard', 'food', 'control').direction, 'unfavorable')
  const [excessive] = run(killing, { natalPolicyEvidence: [excess, insuff] })
  assert.equal(actual(excessive, 'guard', 'food', 'control').direction, 'favorable_candidate')
  assert.equal(actual(run(killing, { natalPolicyEvidence: [excess] })[0], 'food', 'killing', 'control').direction, 'deferred')
  console.log('PASS A — killing conditions and conflicting assessments')

  // B. Compare the actual registry with its reverse, including incomparable opposing conditions
  // and the documented resource-excess exception.
  const verifyOrder = (context, fact, tokens, expected, reason) => {
    const evaluate = (registry) => resolvePatternEffectPolicy(context, fact, new Set(tokens), [], registry)
    const result = evaluate(patternEffectRegistry)
    assert.deepEqual(evaluate([...patternEffectRegistry].reverse()), result)
    assert.equal(result.selectedPolicy, expected)
    assert.equal(result.selectionReason, reason)
    return result
  }
  verifyOrder(unresolved.patternContext, relation(unresolved, 'guard', 'food', 'control'),
    ['key_food_control', 'excessive_food_control'], null, 'conflicting_directions')
  verifyOrder(unresolved.patternContext, relation(unresolved, 'food', 'killing', 'control'),
    ['excessive_food_control'], 'KILL-02', 'specific_conditions')
  const [resource] = run({ day, month: pillar('resource', '壬', '亥'), year: pillar('wealth', '戊', '辰') })
  verifyOrder(resource.patternContext, relation(resource, 'wealth', 'resource', 'control'),
    ['resource_excessive', 'weak_resource_strong_wealth'], 'resource-excess-uses-wealth', 'documented_override')
  console.log('PASS B — reverse registry and protected cross-pattern override')

  // C/D. A stopped source keeps its original observed relation and an inactive effect in both descendants.
  const officer = { day, month: pillar('officer', '辛', '酉') }
  const [natal, great, year, month] = run({ ...officer, year: pillar('hurt', '丁', '巳') }, {
    luck: [luck('greatLuck', 'stopper', '壬', '子'), luck('yearlyLuck', 'year', '戊', '辰'), luck('monthlyLuck', 'month', '戊', '辰')],
  })
  const origin = relation(natal, 'hurt', 'officer', 'control')
  const originalRole = natal.roleEngine.roleHistory.find(({ role, entityId }) => role === 'Byeong' && entityId === 'hurt')
  for (const stage of [great, year, month]) {
    const current = actual(stage, 'hurt', 'officer', 'control')
    assert.equal(current.function, 'inactive')
    assert.equal(current.structuralEffect.currentlyEffective, false)
    assert.equal(current.structuralEffect.originScope, 'greatLuck')
    assert.equal(current.structuralEffect.relationOriginFactId, origin.id)
    assert.equal(current.structuralEffect.inherited, stage !== great)
    assert.equal(current.structuralEffect.blockedBy.kind, 'stopped_participant')
    assert.deepEqual(stage.roleEngine.roleHistory.find(({ roleId }) => originalRole.roleId === roleId), originalRole)
    assert.equal(stage.roleEngine.currentRoles.find(({ roleId }) => originalRole.roleId === roleId).currentFunction, 'inactive')
  }
  assert.ok(great.combinations.length)
  assert.equal(year.combinations.length, 0)
  assert.equal(month.combinations.length, 0)
  console.log('PASS C — stopped natal path and relation/role history')

  // Exact audit F2. In the monthly scope the original luck participant is outside the comparison range.
  const damage = { roleStateId: 'audit-ref', entityId: 'wealth', role: '병', status: 'evaluated', provisional: false, evidenceIds: ['reviewed'] }
  const [, blockGreat, blockYear, blockMonth] = run({
    day, month: pillar('food', '丙', '巳'), year: pillar('wealth', '戊', '辰'),
  }, {
    luck: [luck('greatLuck', 'killer', '庚', '申', [proof('wealth', 'blocked_wealth_feed', 'killer')]),
      luck('yearlyLuck', 'year', '壬', '子'), luck('monthlyLuck', 'month', '丁', '未')],
    roleHistory: [damage], roleFunctionBases: [{ roleHistoryRef: 'audit-ref', sourceEntityId: 'wealth',
      targetEntityId: 'killer', action: 'generate', evidenceIds: ['registered-purpose'] }],
  })
  const inherited = blockMonth.inheritedRoleFunctions.find(({ fact }) =>
    fact.source.id === 'wealth' && fact.target.id === 'killer' && fact.action === 'generate')
  assert.ok(!relation(blockMonth, 'wealth', 'killer', 'generate'))
  assert.equal(inherited.actual.function, 'inactive')
  assert.deepEqual(inherited.actual.structuralEffect.blockedBy, { kind: 'required_path_blocked', evidenceRefs: ['blocked_wealth_feed'] })
  assert.equal(inherited.actual.structuralEffect.inherited, true)
  assert.equal(inherited.actual.structuralEffect.relationOriginFactId, relation(blockGreat, 'wealth', 'killer', 'generate').id)
  for (const stage of [blockGreat, blockYear, blockMonth]) {
    assert.equal(stage.currentRoles.find(({ roleHistoryRef }) => roleHistoryRef === 'audit-ref').currentFunction, 'inactive')
  }
  console.log('PASS D — positional block survives beyond the ordinary comparison range')

  // E. Executing policy roles and a confirmed loss of the same guard path.
  const [protectedNatal, stopped, child] = run({ ...officer, year: pillar('hurt', '丁', '巳'), time: pillar('guard', '壬', '子') }, {
    luck: [luck('greatLuck', 'stopper', '丁', '巳'), luck('yearlyLuck', 'child', '戊', '辰')],
  })
  const helper = protectedNatal.roleEngine.roleHistory.find(({ role, entityId }) => role === 'SangShen' && entityId === 'guard')
  const current = (state) => state.roleEngine.currentRoles.find(({ roleId }) => roleId === helper.roleId)
  assert.equal(current(protectedNatal).currentState, 'active')
  for (const stage of [stopped, child]) {
    assert.ok(stage.roleEngine.roleHistory.some(({ roleId }) => roleId === helper.roleId))
    assert.equal(current(stage).currentState, 'stopped')
    assert.equal(current(stage).currentFunction, 'inactive')
  }
  const weakness = stopped.luckEffects.filter(({ effectType, subjectId }) => effectType === 'weakens_sangshen' && subjectId === helper.roleId)
  assert.equal(weakness.length, 1)
  assert.equal(weakness[0].sourceLuckEntityId, 'stopper')
  assert.ok(child.luckEffects.every(({ effectType }) => effectType !== 'weakens_sangshen'))
  assert.equal(actual(protectedNatal, 'hurt', 'officer', 'control').structuralEffect.blockedBy.kind, 'active_protection')
  assert.equal(actual(stopped, 'hurt', 'officer', 'control').structuralEffect.blockedBy, undefined)
  assert.equal(actual(stopped, 'hurt', 'officer', 'control').function, 'operating')
  const [, brokenProtection] = run({ ...officer, year: pillar('hurt', '丁', '巳'), time: pillar('guard', '壬', '子') }, {
    luck: [luck('greatLuck', 'wealth', '戊', '辰')],
  })
  assert.equal(actual(brokenProtection, 'wealth', 'guard', 'control').policyId, 'OFF-04')
  assert.equal(actual(brokenProtection, 'hurt', 'officer', 'control').function, 'operating')
  // SG-030/031/035: material damage to the required controller reopens the
  // original officer attack, with the controller's exact loss in the evidence.
  const controllerDamage = actual(brokenProtection, 'wealth', 'guard', 'control').relationFactId
  const reopened = brokenProtection.roleEngine.damagePaths.find(({ sourceEntityId, targetEntityId, state }) =>
    sourceEntityId === 'hurt' && targetEntityId === 'officer' && state === 'active')
  assert.ok(reopened?.relationRefs.includes(controllerDamage))
  assert.equal(brokenProtection.roleEngine.byeongStatus, 'confirmed')
  console.log('PASS E — active helper stops once and its verified protection ends')

  // F. Standby transitions are projected from the same role history.
  const [standby, active] = run({ ...officer, year: pillar('standby', '癸', '子') }, {
    luck: [luck('greatLuck', 'threat', '丁', '巳')],
  })
  const standbyRole = standby.roleEngine.roleHistory.find(({ conditionalThreat }) => conditionalThreat)
  assert.equal(standby.roleEngine.currentRoles.find(({ roleId }) => roleId === standbyRole.roleId).currentState, 'protective_standby')
  assert.equal(active.roleEngine.currentRoles.find(({ roleId }) => roleId === standbyRole.roleId).currentState, 'active')
  assert.equal(active.luckEffects.filter(({ effectType, subjectId }) =>
    effectType === 'activates_sangshen_function' && subjectId === standbyRole.roleId).length, 1)
  const [, stoppedStandby] = run({ ...officer, year: pillar('standby', '癸', '子') }, {
    luck: [luck('greatLuck', 'stopper', '戊', '辰')],
  })
  assert.equal(stoppedStandby.roleEngine.currentRoles.find(({ roleId }) => roleId === standbyRole.roleId).currentState, 'stopped')
  assert.equal(stoppedStandby.luckEffects.filter(({ effectType, subjectId }) =>
    effectType === 'weakens_sangshen' && subjectId === standbyRole.roleId).length, 1)
  console.log('PASS F — standby activation and stop')
  console.log('P1 fix regressions: 6/6')
} finally {
  await server.close()
}
