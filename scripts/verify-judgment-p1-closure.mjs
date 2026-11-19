import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const boundary = '2028-01-01T00:00:00Z'
const during = '2027-07-01T00:00:00Z'
const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const oldPeriod = period('old', '2027-01-01T00:00:00Z', boundary)
const nextPeriod = period('next', boundary, '2029-01-01T00:00:00Z')
const natalValidity = period('natal', '2000-01-01T00:00:00Z', '2100-01-01T00:00:00Z')
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
const great = (id, stem, branch, validity = oldPeriod, policyEvidence) =>
  ({ scope: 'greatLuck', pillar: pillar(id, stem, branch), validity, policyEvidence })
const events = (state, type) => state.luckEffects.filter(({ effectType }) => type === effectType)
// LuckEffect currently identifies an event by its origin and participants.
const eventKey = ({ scope, effectType, sourceLuckEntityId, subjectId }) =>
  JSON.stringify([scope, effectType, sourceLuckEntityId, subjectId])
const history = (state, role, entityId) => state.roleEngine.roleHistory.find((entry) => entry.role === role && entry.entityId === entityId)
const current = (state, entry) => {
  assert.ok(entry, 'expected natal role history')
  assert.deepEqual(state.roleEngine.roleHistory.find(({ roleId }) => roleId === entry.roleId), entry)
  return state.roleEngine.currentRoles.find(({ roleId }) => roleId === entry.roleId)
}
let passed = 0
let failed = 0

function check(id, test) {
  try {
    test()
    passed++
    console.log('PASS ' + id)
  } catch (error) {
    failed++
    console.error('FAIL ' + id + '\n' + error.message)
  }
}

try {
  const { runJudgmentCore } = await server.ssrLoadModule('/src/lib/judgment/core/luckScope.ts')
  const { evaluateRoleEngine } = await server.ssrLoadModule('/src/lib/judgment/core/roleEngine.ts')
  const run = (natal, luck, referenceTime = during, natalCapacityEvidence, priorHistory) =>
    runJudgmentCore({ priorHistory, executionId: 'p1-closure', natal, natalValidity, natalCombinations: [], luck, referenceTime, natalCapacityEvidence })
  const officer = { day: pillar('day', '甲', '寅'), month: pillar('officer', '辛', '酉') }
  const standbyChart = { ...officer, year: pillar('standby', '癸', '子') }
  const threat = great('threat', '丁', '巳')
  const yearly = { ...great('annual', '乙', '丑'), scope: 'yearlyLuck' }
  const next = great('next-luck', '己', '未', nextPeriod)
  const monthly = { ...great('monthly', '己', '未'), scope: 'monthlyLuck' }
  const [standby, activated, inherited, month] = run(standbyChart, [threat, yearly, monthly])
  const helper = history(standby, 'SangShen', 'standby')
  const replacement = run(standbyChart, [next], boundary, undefined, activated).at(-1)

  check('A — standby activation', () => {
    assert.equal(current(standby, helper).currentState, 'protective_standby')
    assert.equal(standby.policyRoles.byeong.length, 0)
    assert.equal(current(activated, helper).currentState, 'active')
    assert.equal(current(activated, helper).currentFunction, 'operating')
    assert.equal(events(activated, 'activates_sangshen_function').filter(({ subjectId }) => subjectId === helper.roleId).length, 1)
  })
  check('B — inherited activation without duplicate event', () => {
    for (const descendant of [inherited, month]) {
      assert.equal(current(descendant, helper).currentState, 'active', descendant.scope)
      assert.equal(current(descendant, helper).currentFunction, 'operating', descendant.scope)
      assert.equal(events(descendant, 'activates_sangshen_function').length, 0, descendant.scope)
    }
  })
  check('C — threat expiry with next selected period', () => {
    assert.equal(current(replacement, helper).currentState, 'protective_standby')
    assert.equal(events(replacement, 'activates_sangshen_function').length, 0)
  })

  const attacked = { ...officer, year: pillar('hurt', '丁', '巳') }
  const guarded = { ...attacked, time: pillar('guard', '壬', '子') }
  const guardStop = great('guard-stopper', '丁', '巳')
  const [protectedNatal, stopped, stoppedChild] = run(guarded, [guardStop, yearly])
  const guard = history(protectedNatal, 'SangShen', 'guard')
  check('D — SangShen stopped and event emitted once', () => {
    assert.equal(current(protectedNatal, guard).currentState, 'active')
    for (const state of [stopped, stoppedChild]) {
      assert.equal(current(state, guard).currentState, 'stopped')
      assert.equal(current(state, guard).currentFunction, 'inactive')
    }
    assert.equal(events(stopped, 'weakens_sangshen').filter(({ subjectId }) => subjectId === guard.roleId).length, 1)
    assert.equal(events(stoppedChild, 'weakens_sangshen').length, 0)
  })
  check('E — SangShen stop expiry with next selected period', () => {
    const restored = run(guarded, [next], boundary, undefined, stopped).at(-1)
    assert.equal(current(restored, guard).currentState, 'active')
    assert.equal(current(restored, guard).currentFunction, 'operating')
    assert.equal(events(restored, 'weakens_sangshen').length, 0)
    const standbyStop = run(standbyChart, [great('standby-stopper', '戊', '辰')]).at(-1)
    assert.equal(current(standbyStop, helper).currentState, 'stopped')
    assert.equal(current(replacement, helper).currentState, 'protective_standby')
  })

  const wealth = { day: officer.day, month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
  const killing = great('killing', '庚', '申', oldPeriod,
    [{ entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['reviewed-harmful-killing'] }])
  const [conditional, harmful] = run(wealth, [killing])
  const laterWealth = run(wealth, [next], boundary, undefined, harmful).at(-1)
  check('F — ConditionalByeong active path expires', () => {
    assert.equal(conditional.conditionalByeong[0].currentState, 'conditional')
    assert.equal(harmful.conditionalByeong[0].currentState, 'active')
    assert.equal(events(harmful, 'activates_byeong').length, 1)
    assert.deepEqual(laterWealth.conditionalByeong[0], conditional.conditionalByeong[0])
    assert.equal(events(laterWealth, 'activates_byeong').length, 0)
  })

  const relief = great('relief', '壬', '子')
  const [damage, relieved, reliefChild] = run(attacked, [relief, yearly])
  const byeong = history(damage, 'Byeong', 'hurt')
  const laterDamage = run(attacked, [next], boundary, undefined, relieved).at(-1)
  check('G — relief expires and original harm resumes', () => {
    assert.equal(current(damage, byeong).currentFunction, 'operating')
    assert.equal(current(relieved, byeong).currentFunction, 'inactive')
    assert.equal(current(reliefChild, byeong).currentFunction, 'inactive')
    assert.ok(events(relieved, 'relieves_byeong').length)
    assert.equal(events(reliefChild, 'relieves_byeong').length, 0)
    assert.equal(current(laterDamage, byeong).currentFunction, 'operating')
  })

  const pattern = { day: pillar('dm', '丙', '午'), month: pillar('month', '壬', '申') }
  const manifestation = great('manifestation', '庚', '亥')
  const [transformed, combined] = run(pattern, [manifestation])
  const laterPattern = run(pattern, [next], boundary, undefined, combined).at(-1)
  check('H — manifestation and pattern mode expire', () => {
    assert.equal(transformed.patternContext.patternMode, 'transformed')
    assert.equal(combined.patternContext.patternMode, 'combined')
    assert.equal(laterPattern.patternContext.patternMode, 'transformed')
    assert.equal(laterPattern.patternContext.branchPattern, combined.patternContext.branchPattern)
    assert.ok(events(combined, 'changes_pattern_mode').length)
    assert.ok(events(combined, 'manifests_yongshen').length)
    assert.ok(!laterPattern.patternContext.effectiveManifestedYongShen.some(({ entityId }) => entityId === 'manifestation'))
  })

  check('I — expired stop cannot remain in current runtime', () => {
    const expired = run(guarded, [guardStop], boundary).at(-1)
    assert.ok(expired.combinationHistory.length)
    assert.ok(expired.combinationEffects.length)
    assert.ok(!expired.combinationEffects.some(({ currentlyEffective }) => currentlyEffective))
    assert.deepEqual({
      runtime: expired.runtime.find(({ entityId }) => entityId === 'guard').state,
      role: current(expired, guard).currentState,
    }, { runtime: 'active', role: 'active' })
  })
  check('J — active inherited LuckEffect retains its origin without a duplicate event', () => {
    const [activation] = events(activated, 'activates_sangshen_function')
    const projection = inherited.luckEffectStates?.find(({ event }) => event && eventKey(event) === eventKey(activation))
    assert.ok(projection, 'no inherited projection for the original SangShen activation event')
    assert.equal(projection.originScope, activated.scope)
    assert.equal(projection.inherited, true)
    assert.equal(projection.currentlyEffective, true)
  })
  check('K — expired events remain in history with inactive projections', () => {
    const pairs = [
      [activated, replacement, 'activates_sangshen_function'],
      [stopped, run(guarded, [next], boundary, undefined, stopped).at(-1), 'weakens_sangshen'],
      [harmful, laterWealth, 'activates_byeong'],
      [relieved, laterDamage, 'relieves_byeong'],
      [combined, laterPattern, 'manifests_yongshen'],
      [combined, laterPattern, 'changes_pattern_mode'],
    ]
    const missing = pairs.filter(([before, after, type]) => {
      const [event] = events(before, type)
      return !event || !after.luckEffectHistory?.some((past) => eventKey(past) === eventKey(event))
        || !after.luckEffectStates?.some((projection) => projection.event && eventKey(projection.event) === eventKey(event)
          && projection.currentlyEffective === false)
    })
    assert.deepEqual(missing.map(([, , type]) => type), [], 'missing history or expiry projections')
  })
  check('L — root, formation, and capacity recompute after period replacement', () => {
    const natal = { ...pattern, year: pillar('hare', '乙', '卯') }
    const natalCapacity = { state: 'killing_capacity_adequate', evidenceIds: ['natal-capacity'] }
    const changedCapacity = { state: 'killing_capacity_insufficient', evidenceIds: ['period-capacity'] }
    const [, change, carried] = run(natal, [
      { ...manifestation, capacityEvidence: changedCapacity },
      { ...great('goat', '戊', '未'), scope: 'yearlyLuck' },
    ], during, natalCapacity)
    const later = run(natal, [great('next-luck', '辛', '丑', nextPeriod)], boundary, natalCapacity).at(-1)
    assert.equal(change.capacity.state, changedCapacity.state)
    assert.equal(carried.capacity.state, changedCapacity.state)
    assert.equal(later.capacity.state, natalCapacity.state)
    assert.equal(events(change, 'changes_capacity').length, 1)
    assert.equal(events(carried, 'changes_capacity').length, 0)
    assert.ok(carried.formationFacts.some(({ kind }) => kind === 'three'))
    assert.ok(events(carried, 'changes_formation').length)
    assert.ok(!later.formationFacts.some(({ kind }) => kind === 'three'))
    const rootState = (state, entityId) => state.rootStates.find((root) => root.entityId === entityId)?.state
    const rootNatal = { ...pattern, year: pillar('wood', '乙', '亥') }
    const [baseRoot, rootGreat, strengthened] = run(rootNatal, [great('hare', '己', '卯'),
      { ...great('goat', '庚', '未'), scope: 'yearlyLuck' }])
    const restoredRoot = run(rootNatal, [great('next-luck', '己', '丑', nextPeriod)], boundary).at(-1)
    assert.notEqual(rootState(strengthened, 'wood'), rootState(baseRoot, 'wood'))
    assert.equal(rootState(restoredRoot, 'wood'), rootState(baseRoot, 'wood'))
    assert.ok([rootGreat, strengthened].flatMap((state) => events(state, 'changes_root_state')).some(({ subjectId }) => subjectId === 'wood'))
  })
  check('M — a stopped threat with no operating attack returns its guard to standby', () => {
    // Luck-to-luck combinations only weaken. Test the role projection with a stopped
    // threat and its already-resolved inactive paths supplied explicitly.
    const runtime = new Map(activated.runtime.map(({ entityId, state }) => [entityId, state]))
    runtime.set('threat', 'stopped')
    const paths = activated.stemFacts.flatMap((fact) => {
      const actual = activated.actualFunctions.find(({ relationFactId }) => relationFactId === fact.id)
      if (!actual) return []
      const stoppedParticipant = [fact.source.id, fact.target.id].includes('threat')
      return [{ fact, actual: stoppedParticipant ? { ...actual, function: 'inactive' } : actual }]
    })
    const roleEngine = evaluateRoleEngine({
      scope: 'yearlyLuck', stems: [], luck: undefined, pattern: activated.patternContext,
      special: activated.patternContext.specialYongShen, runtime, rootStates: activated.rootStates,
      paths, effectiveCombinations: [], natalFacts: standby.stemFacts,
      policyRoles: { sangShen: [], byeong: [], guEung: [] }, existingRoles: [], existingCurrent: [],
      conditionalByeong: [], prior: activated.roleEngine,
    })
    assert.equal(current({ roleEngine }, helper).currentState, 'protective_standby')
    assert.equal(current({ roleEngine }, helper).currentFunction, 'inactive')
  })
  console.log('P1 closure regressions: ' + passed + '/' + (passed + failed))
  if (failed) process.exitCode = 1
} finally {
  await server.close()
}
