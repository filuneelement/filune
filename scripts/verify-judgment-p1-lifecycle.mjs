import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const start = '2027-01-01T00:00:00.000Z'
const end = '2028-01-01T00:00:00.000Z'
const previous = '2027-12-31T23:59:59.999Z'
const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const oldPeriod = validity('old', start, end)
const newPeriod = validity('new', end, '2029-01-01T00:00:00.000Z')
const natalValidity = validity('natal', '2000-01-01T00:00:00.000Z', '2100-01-01T00:00:00.000Z')
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
const luck = (id, stem, branch, scope = 'greatLuck', period = oldPeriod) =>
  ({ scope, pillar: pillar(id, stem, branch), validity: period })
const selection = (state, type) => state.luckEffects.find(({ effectType }) => effectType === type)
const runtime = (state, entityId) => state.runtime.find((item) => item.entityId === entityId)?.state
const current = (state, role, entityId) => {
  const identity = state.roleEngine.roleHistory.find((item) => item.role === role && item.entityId === entityId)
  return state.roleEngine.currentRoles.find(({ roleId }) => roleId === identity?.roleId)
}
function projection(state, event, expected) {
  assert.ok(event?.id)
  assert.deepEqual(state.luckEffectHistory.filter(({ id }) => id === event.id), [event])
  const view = state.luckEffectStates.find(({ event: occurrence }) => occurrence.id === event.id)
  assert.deepEqual(view.event, event)
  assert.equal(view.originScope, event.originScope)
  assert.deepEqual(view.originPeriod, event.originPeriod)
  for (const [key, value] of Object.entries(expected)) assert.equal(view[key], value, key)
}
const inheritedActive = { inherited: true, currentlyEffective: true, expired: false }
const inheritedExpired = { inherited: true, currentlyEffective: false, expired: true }
let count = 0
function check(label, test) {
  test()
  count++
  console.log('PASS ' + label)
}

try {
  const { runJudgmentCore } = await server.ssrLoadModule('/src/lib/judgment/core/luckScope.ts')
  const run = (natal, periods, referenceTime = start, priorHistory, options = {}) =>
    runJudgmentCore({ executionId: 'lifecycle', natal, natalValidity, natalCombinations: [], luck: periods,
      referenceTime, priorHistory, ...options }).at(-1)
  const day = pillar('day', '甲', '寅')
  const officer = { day, month: pillar('officer', '辛', '酉') }
  const hurt = { ...officer, year: pillar('hurt', '丁', '巳') }
  const guarded = { ...hurt, time: pillar('guard', '壬', '子') }
  const stopper = luck('stopper', '丁', '巳')
  const replacement = luck('replacement', '己', '未', 'greatLuck', newPeriod)
  const oldStop = run(guarded, [stopper], previous)
  check('A — direct expired input retains the event but releases runtime', () => {
    const state = run(guarded, [stopper], end)
    assert.deepEqual(state.combinationHistory, oldStop.combinationHistory)
    assert.equal(state.combinationEffects[0].currentlyEffective, false)
    assert.equal(state.combinationEffects[0].expired, true)
    assert.equal(runtime(state, 'guard'), 'active')
    assert.equal(runtime(state, 'stopper'), undefined)
    assert.equal(current(state, 'SangShen', 'guard').currentFunction, 'operating')
    assert.equal(state.luckEffects.length, 0)
    projection(state, selection(oldStop, 'weakens_sangshen'), { currentlyEffective: false, expired: true })
    const future = run(guarded, [replacement], previous)
    assert.equal(runtime(future, 'replacement'), undefined)
    assert.equal(future.combinationHistory.length, 0)
  })
  check('B — the active interval includes its start and excludes its end', () => {
    for (const state of [run(guarded, [stopper]), oldStop]) {
      assert.equal(state.combinationEffects[0].currentlyEffective, true)
      assert.equal(state.combinationEffects[0].expired, false)
      assert.equal(runtime(state, 'guard'), 'stopped')
      assert.equal(runtime(state, 'stopper'), 'stopped')
    }
  })

  const standby = { ...officer, year: pillar('standby', '癸', '子') }
  const threat = luck('threat', '丁', '巳')
  const child = luck('child', '乙', '丑', 'yearlyLuck')
  const activation = selection(run(standby, [threat]), 'activates_sangshen_function')
  check('C — inherited active and stable under reevaluation', () => {
    projection(run(standby, [threat, child]), activation, inheritedActive)
    const refreshed = run(standby, [threat, child], start, run(standby, [threat]), { executionId: 'other-reading' })
    projection(refreshed, activation, inheritedActive)
    assert.equal(refreshed.luckEffectHistory.filter(({ effectType }) => effectType === activation.effectType).length, 1)
  })
  check('D — inherited expired and standby restored', () => {
    const state = run(standby, [replacement], end, run(standby, [threat]))
    projection(state, activation, inheritedExpired)
    assert.equal(current(state, 'SangShen', 'standby').currentState, 'protective_standby')
  })

  check('E — conditional illness activation expires', () => {
    const wealth = { day, month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
    const killing = { ...luck('killing', '庚', '申'), policyEvidence: [
      { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['harmful-killing-reviewed'] },
    ] }
    const active = run(wealth, [killing])
    const event = selection(active, 'activates_byeong')
    assert.equal(active.conditionalByeong[0].currentState, 'active')
    projection(run(wealth, [killing, child]), event, inheritedActive)
    const later = run(wealth, [replacement], end, active)
    assert.equal(later.conditionalByeong[0].currentState, 'conditional')
    projection(later, event, inheritedExpired)
  })
  check('F — temporary relief expires and the natal path operates again', () => {
    const relief = luck('relief', '壬', '子')
    const active = run(hurt, [relief])
    const event = selection(active, 'relieves_byeong')
    assert.equal(current(active, 'Byeong', 'hurt').currentFunction, 'inactive')
    projection(run(hurt, [relief, child]), event, inheritedActive)
    const later = run(hurt, [replacement], end, active)
    assert.equal(current(later, 'Byeong', 'hurt').currentFunction, 'operating')
    projection(later, event, inheritedExpired)
  })
  check('G — weakening ends when the SangShen stop ends', () => {
    const event = selection(oldStop, 'weakens_sangshen')
    projection(run(guarded, [stopper, child], previous), event, inheritedActive)
    const later = run(guarded, [luck('replacement', '乙', '未', 'greatLuck', newPeriod)], end, oldStop)
    assert.equal(current(later, 'SangShen', 'guard').currentState, 'active')
    projection(later, event, inheritedExpired)
    const attackedHelper = run(guarded, [replacement], end, oldStop)
    assert.equal(current(attackedHelper, 'SangShen', 'guard').currentFunction, 'reduced')
    assert.ok(current(attackedHelper, 'SangShen', 'guard').functionEffects.some(({ kind, sourceEntityId }) =>
      kind === 'weaken' && sourceEntityId === 'replacement'))
    projection(attackedHelper, event, inheritedExpired)
  })
  check('H — manifestation history survives but the effective mode is restored', () => {
    const pattern = { day: pillar('dm', '丙', '午'), month: pillar('month', '壬', '申') }
    const prior = run(pattern, [luck('manifestation', '庚', '亥')])
    // A-8-1 I-02: isolate expiry from a new manifestation of 申's earth element.
    const nonManifestingReplacement = luck('replacement', '乙', '未', 'greatLuck', newPeriod)
    const later = run(pattern, [nonManifestingReplacement], end, prior)
    assert.equal(prior.patternContext.patternMode, 'combined')
    assert.equal(later.patternContext.patternMode, 'transformed')
    const natal = run(pattern, [], end, prior)
    assert.ok(natal.patternContext.manifestationHistory.every(({ manifestationScope }) => manifestationScope === 'natal'))
    const directExpired = run(pattern, [luck('manifestation', '庚', '亥')], end)
    assert.ok(directExpired.patternContext.manifestationHistory.some(({ entityId }) => entityId === 'manifestation'))
    assert.ok(later.patternContext.manifestationHistory.some(({ entityId }) => entityId === 'manifestation'))
    assert.ok(!later.patternContext.effectiveManifestedYongShen.some(({ entityId }) => entityId === 'manifestation'))
    for (const type of ['manifests_yongshen', 'changes_pattern_mode']) projection(later, selection(prior, type), inheritedExpired)
  })
  check('I — one origin event across three descendant scopes', () => {
    const periods = [threat, child, luck('month', '己', '未', 'monthlyLuck'), luck('daily', '庚', '辰', 'dailyLuck')]
    for (let count = 2; count <= 4; count++) {
      const state = run(standby, periods.slice(0, count))
      projection(state, activation, inheritedActive)
      assert.ok(!selection(state, 'activates_sangshen_function'))
    }
  })
  check('J — formation, root, and capacity effects end at their origin boundary', () => {
    const chart = { day: pillar('dm', '丙', '午'), month: pillar('month', '壬', '申'), year: pillar('wood', '乙', '亥') }
    const options = { natalCapacityEvidence: { state: 'killing_capacity_adequate', evidenceIds: ['natal-capacity'] } }
    const changed = { ...luck('hare', '己', '卯'), capacityEvidence: { state: 'killing_capacity_insufficient', evidenceIds: ['period-capacity'] } }
    const formed = luck('goat', '庚', '未', 'yearlyLuck')
    const first = run(chart, [changed], start, undefined, options)
    const combined = run(chart, [changed, formed], start, undefined, options)
    const later = run(chart, [replacement], end, combined, options)
    const root = selection(first, 'changes_root_state') ?? selection(combined, 'changes_root_state')
    const formation = selection(combined, 'changes_formation')
    const capacity = selection(first, 'changes_capacity')
    for (const event of [root, formation, capacity]) {
      assert.ok(event)
      assert.equal(combined.luckEffectStates.find((item) => item.event.id === event.id)?.currentlyEffective, true)
      projection(later, event, inheritedExpired)
    }
    assert.equal(later.capacity.state, options.natalCapacityEvidence.state)
    assert.ok(!later.formationFacts.some(({ kind }) => kind === 'three'))
  })
  check('K — a reused canonical period reference does not reuse old events', () => {
    const reused = { ...threat, validity: { ...newPeriod, periodId: oldPeriod.periodId } }
    const prior = run(standby, [threat])
    const next = run(standby, [reused], end, prior)
    const nextEvent = selection(next, 'activates_sangshen_function')
    assert.notEqual(nextEvent.id, activation.id)
    projection(next, activation, inheritedExpired)
    projection(next, nextEvent, { inherited: false, currentlyEffective: true, expired: false })
  })
  check('L — loss of the originating protection ends its current effect inside the period', () => {
    const stopGuard = luck('stop-guard', '戊', '辰', 'yearlyLuck')
    const state = run(standby, [threat, stopGuard])
    assert.equal(current(state, 'SangShen', 'standby').currentState, 'stopped')
    projection(state, activation, inheritedExpired)
    assert.ok(!selection(state, 'activates_sangshen_function'))

    const longerThreat = { ...threat, validity: { ...oldPeriod, to: newPeriod.to } }
    const stopped = run(standby, [longerThreat, stopGuard])
    const weakening = selection(stopped, 'weakens_sangshen')
    const restored = run(standby, [longerThreat, stopGuard], end)
    assert.equal(current(restored, 'SangShen', 'standby').currentState, 'active')
    assert.equal(restored.combinationEffects.find((effect) => effect.participants.includes('stop-guard')).expired, true)
    projection(restored, weakening, { inherited: false, currentlyEffective: false, expired: true })
    const longerActivation = selection(run(standby, [longerThreat]), 'activates_sangshen_function')
    projection(restored, longerActivation, inheritedActive)
  })
  check('M — combination-based relief keeps its relation and formula links', () => {
    const chart = { day: pillar('yin-day', '乙', '卯'), month: pillar('wealth', '己', '丑'), year: pillar('killing', '辛', '酉') }
    const options = { natalPolicyEvidence: [{ entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['harmful-killing-reviewed'] }] }
    const periods = [luck('hurt', '丙', '午'), luck('annual', '戊', '戌', 'yearlyLuck')]
    const origin = run(chart, periods.slice(0, 1), start, undefined, options)
    const event = selection(origin, 'relieves_byeong')
    const combination = origin.combinationHistory.find(({ formula }) => formula?.formulaType === 'HurtingOfficerCombinesKilling')
    assert.equal(event.sourceRelationFactId, combination.relation.id)
    assert.equal(event.sourceFormulaFactId, combination.formula.id)
    const descendant = run(chart, periods, start, undefined, options)
    projection(descendant, event, inheritedActive)
    assert.ok(!selection(descendant, 'relieves_byeong'))
    const later = run(chart, [replacement], end, descendant, options)
    projection(later, event, inheritedExpired)
    assert.ok(later.combinationHistory.some(({ formula }) => formula?.id === event.sourceFormulaFactId))
    assert.equal(later.policyRoles.byeong.find(({ id }) => id === event.subjectId).currentState, 'active')
  })
  console.log('P1 lifecycle regressions: ' + count + '/13')
} finally {
  await server.close()
}
