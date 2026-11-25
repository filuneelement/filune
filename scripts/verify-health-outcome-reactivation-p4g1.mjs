import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: `${id}-branch`, value: branch } })
const referenceTime = '2027-01-15T00:00:00.000Z'
const boundary = '2028-01-01T00:00:00.000Z'
const old = period('great-active', '2027-01-01T00:00:00.000Z', boundary)
const next = period('great-next', boundary, '2029-01-01T00:00:00.000Z')
const scopes = ['greatLuck', 'yearlyLuck', 'monthlyLuck']
const scope = (index, pillar, validity) => ({ scope: scopes[index], pillar, validity })
const attention = facts => facts.filter(fact => fact.semanticType !== 'traditional_body_correspondence')
const healthUnits = reading => reading.semanticUnits.filter(unit => unit.topic === 'health')

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { assembleReading, healthOutcomeFromReading, validateReadingAssembly } = await load('reading/index')
  const canonical = calculateCanonicalChart({ date: { year: 1964, month: 2, day: 9 },
    time: { known: true, value: { hour: 19, minute: 30 } }, gender: '女性', timeCorrectionMode: 'none' },
  { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
  const day = pillar('dm', '甲', '寅')
  // Existing P1-Fix E and P4-H policy fixture. Canonical supplies the reference instant.
  const natal = { day, month: pillar('officer', '辛', '酉'),
    year: pillar('hurt', '丁', '巳'), time: pillar('guard', '壬', '子') }
  const run = (luck = [], options = {}) => runJudgmentCore({ executionId: 'p4g1', natal,
    natalValidity: old, natalCombinations: [], referenceTime, luck, ...options })
  const outcomes = ([natal, ...luck], instant = referenceTime, history = []) => {
    const chart = { ...canonical, context: { ...canonical.context, referenceTime: instant } }
    const judgment = { canonical: chart, judgmentCore: [natal], luck: {} }
    return healthOutcomeFromReading({ judgment, evaluatedLuckScopes: [
      ...luck.map(snapshot => ({ snapshot, evaluatedAt: instant })), ...history,
    ] })
  }
  function adverseControl(snapshot) {
    const fact = snapshot.stemFacts.find(relation => relation.action === 'control'
      && relation.source.id === 'hurt' && relation.target.id === 'officer')
    return snapshot.actualFunctions.find(effect => effect.relationFactId === fact.id)
  }

  const protectedNatal = run()[0]
  assert.equal(adverseControl(protectedNatal).structuralEffect.blockedBy.kind, 'active_protection')
  assert.equal(attention(outcomes([protectedNatal])).length, 0)
  const protectedLuck = run([scope(0, pillar('peer', '甲', '寅'), old)])[1]
  assert.equal(adverseControl(protectedLuck).function, 'inactive')
  const reducedProtector = {
    ...protectedLuck,
    runtime: protectedLuck.runtime.map(state => state.entityId === 'guard' ? { ...state, state: 'weakened' } : state),
    roleEngine: { ...protectedLuck.roleEngine, currentRoles: protectedLuck.roleEngine.currentRoles.map(role =>
      protectedLuck.roleEngine.roleHistory.some(history => history.roleId === role.roleId && history.entityId === 'guard')
        ? { ...role, currentState: 'weakened', currentFunction: 'reduced' } : role) },
  }
  // Adapter boundary check. Keep the resolved suppression unchanged when the protector is reduced.
  assert.equal(attention(outcomes([protectedNatal, reducedProtector])).length, 0)
  const stoppedSource = run([], { natalCombinations: [['hurt', 'guard']] })[0]
  assert.ok(stoppedSource.runtime.some(state => state.entityId === 'hurt' && state.state === 'stopped'))
  assert.equal(attention(outcomes([stoppedSource])).length, 0)

  for (const [trigger, action] of [[pillar('stopper', '丁', '巳'), 'combine'], [pillar('wealth', '戊', '辰'), 'control']]) {
    const interval = [scope(0, trigger, old)]
    const states = run(interval)
    const [birthSnapshot, current] = states
    const attack = adverseControl(current)
    assert.equal(attack.policyId, 'OFF-03')
    assert.equal(attack.function, 'operating')
    assert.equal(attack.direction, 'unfavorable')
    assert.equal(attack.structuralEffect.originScope, current.scope)
    assert.equal(attack.structuralEffect.inherited, false)
    const facts = outcomes(states)
    const [fact] = attention(facts)
    assert.equal(attention(facts).length, 1)
    assert.equal(fact.semanticType, 'health_attention_period')
    assert.equal(fact.path, 'yongshen_pressure')
    assert.equal(fact.scope, 'daewoon')
    assert.equal(fact.scopeId, current.id)
    assert.equal(fact.originRelationId, adverseControl(birthSnapshot).relationFactId)
    assert.equal(fact.originScopeId, birthSnapshot.id)
    assert.deepEqual(fact.period, current.validity)
    assert.equal(fact.certainty, 'confirmed')
    assert.equal(fact.currentlyEffective, true)
    assert.equal(fact.lifecycle, 'active')
    assert.deepEqual(fact.sourceJudgmentIds, [current.id])
    assert.ok(fact.sourceRelationIds.includes(attack.relationFactId))
    assert.ok(current.stemFacts.some(relation => relation.action === action
      && [relation.source.id, relation.target.id].includes(trigger.stem.id)
      && [relation.source.id, relation.target.id].includes('guard') && fact.sourceRelationIds.includes(relation.id)))
    const relations = new Set([...current.stemFacts, ...current.patternFacts].map(relation => relation.id))
    assert.ok(fact.sourceRelationIds.every(id => relations.has(id)))
    assert.ok(fact.sourceRoleIds.every(id => current.roleEngine.roleHistory.some(role => role.roleId === id)))
    assert.ok(fact.sourceLuckEffectIds.every(id => current.luckEffectStates.some(state => state.event.id === id)))
    assert.deepEqual(outcomes(run(interval)), facts)
    assert.deepEqual(outcomes([birthSnapshot, current, current]), facts)

    const premium = assembleReading({ canonical, healthOutcomes: facts, productScope: 'premium' })
    const free = assembleReading({ canonical, healthOutcomes: facts, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    const unit = healthUnits(premium).find(unit => unit.meaningRef.recordId === fact.id)
    assert.deepEqual(unit.evidenceIds, fact.provenance)
    assert.equal(unit.certainty, fact.certainty)
    assert.equal(premium.chapters.find(chapter => chapter.id === 'CH-07').readiness, 'partial')
    assert.ok(premium.chapters.find(chapter => chapter.id === 'CH-08').placements.some(item => item.unitId === unit.id))
    assert.ok(healthUnits(free).every(unit => unit.scope === 'natal'))

    // SG-110/112 and P1 closure E distinguish expiration from an independent new attack.
    // 乙 supplies the unopposed recovery fixture. The original 己 still controls the protector.
    const restored = run([scope(0, pillar('next-luck', '乙', '未'), next)], { referenceTime: boundary, priorHistory: current })
    const guard = restored[1].roleEngine.roleHistory.find(role => role.role === 'SangShen' && role.entityId === 'guard')
    assert.ok(restored[1].roleEngine.currentRoles.some(role => role.roleId === guard.roleId && role.currentFunction === 'operating'))
    const independentlyAttacked = run([scope(0, pillar('next-luck', '己', '未'), next)], { referenceTime: boundary, priorHistory: current })
    assert.ok(independentlyAttacked[1].roleEngine.currentRoles.some(role => role.roleId === guard.roleId && role.currentFunction === 'reduced'))
    // Replacement luck can supply independent damage. Compare the old event by its own identity.
    const history = [{ snapshot: current, evaluatedAt: referenceTime }]
    const after = outcomes(restored, boundary, history)
    const historical = attention(after).find(item => item.id === fact.id)
    assert.ok(historical)
    const natalOnly = run([], { referenceTime: boundary, priorHistory: current })
    assert.equal(adverseControl(natalOnly[0]).function, 'inactive')
    assert.ok(attention(outcomes(natalOnly, boundary, history)).every(item => !item.currentlyEffective))
    assert.equal(historical.temporalStatus, 'expired')
    assert.equal(historical.currentlyEffective, false)
    const laterChart = { ...canonical, context: { ...canonical.context, referenceTime: boundary } }
    assert.ok(healthUnits(assembleReading({ canonical: laterChart, healthOutcomes: after, productScope: 'premium' }))
      .every(item => item.meaningRef.recordId !== fact.id))
    console.log('PASS reactivation and expiry', trigger.stem.id)
  }
  const annual = period('sewoon', '2027-01-02T00:00:00.000Z', '2027-12-31T00:00:00.000Z')
  const monthly = period('month', '2027-01-05T00:00:00.000Z', '2027-02-04T00:00:00.000Z')
  const fillers = [scope(0, pillar('peer', '甲', '寅'), old), scope(1, pillar('annual', '乙', '丑'), annual)]
  for (const [index, validity, expected, chapterId] of [[1, annual, 'sewoon', 'CH-09'], [2, monthly, 'month', 'CH-10']]) {
    const trigger = scope(index, pillar('stopper', '丁', '巳'), validity)
    const states = run([...fillers.slice(0, index), trigger])
    const current = states.at(-1)
    assert.equal(adverseControl(states.at(-2)).function, 'inactive')
    assert.equal(adverseControl(current).function, 'operating')
    const facts = outcomes(states)
    const scoped = attention(facts)
    assert.equal(scoped.length, 1)
    assert.equal(scoped[0].scope, expected)
    assert.equal(scoped[0].scopeId, current.id)
    assert.deepEqual(scoped[0].period, validity)
    const reading = assembleReading({ canonical, healthOutcomes: facts, productScope: 'premium' })
    validateReadingAssembly(reading)
    const unit = healthUnits(reading).find(item => item.meaningRef.recordId === scoped[0].id)
    assert.ok(reading.chapters.find(chapter => chapter.id === chapterId).placements.some(item => item.unitId === unit.id))
    console.log('PASS reactivation scope', expected)
  }
  console.log('PASS P4-G.1 reactivation regression')
} finally {
  await server.close()
}
