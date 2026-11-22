import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
export let evaluateLifecycleFixture
export const sourceLifecycleInputs = []
const at = '2028-07-15T00:00:00.000Z'
const interval = (periodId, start, end) => ({ periodId, from: { kind: 'exact', instant: start }, to: { kind: 'exact', instant: end } })
const durations = [
  interval('fixture-long', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z'),
  interval('fixture-year', '2028-02-04T00:00:00.000Z', '2029-02-03T00:00:00.000Z'),
  interval('fixture-month', '2028-07-06T00:00:00.000Z', '2028-08-07T00:00:00.000Z'),
]

try {
  const [{ buildIndividualRelationshipTimeline, buildPairRelationshipTimeline }, { runJudgmentCore },
    { buildRelationshipOutcome }, { calculateTenGod, calculateDayRelationships }, { recordId },
    { buildNatalPersonality }, expression, { buildPersonalityInteraction }] = await Promise.all([
    load('compatibility/relationshipLifecycle'), load('judgment/core/luckScope'),
    load('outcome/relationship/relationshipOutcome'), load('dayRelationships'), load('judgment/producers/shared'),
    load('personality/natalPersonality'), load('reading/personalityResourceOutput'), load('compatibility/personalityInteraction'),
  ])

  function evaluate(personId, values, luck, { gender = '女性', source = false, stops = [], policy = {} } = {}) {
    const positions = ['year', 'month', 'day', 'time']
    const parts = values.split(' ')
    const day = parts[2][0]
    const entity = (position, part) => recordId('entity', [`/chart/pillars/${position}/value/ganZhi`, part])
    const canonical = {
      context: { referenceTime: at }, birthInput: { gender },
      chart: {
        pillars: Object.fromEntries(positions.map((position, i) => [position,
          { status: 'confirmed', value: { stem: parts[i][0], branch: parts[i][1], ganZhi: parts[i] } }])),
        basicRelations: Object.fromEntries(positions.map((position, i) => [position, { status: 'confirmed', value: {
          stemTenGod: calculateTenGod(day, parts[i][0]), relationships: calculateDayRelationships(day, parts[i][1]),
        } }])),
      },
    }
    const unknown = { periodId: 'source-natal', from: { kind: 'unknown', reason: 'fixture' }, to: { kind: 'unknown', reason: 'fixture' } }
    const [natal, ...snapshots] = runJudgmentCore({
      executionId: personId, natalValidity: unknown,
      natal: Object.fromEntries(positions.map((position, i) => [position, {
        stem: { id: entity(position, 'stem'), value: parts[i][0] },
        branch: { id: entity(position, 'branch'), value: parts[i][1] },
      }])),
      natalCombinations: stops.map(pair => pair.map(position => entity(position, 'stem'))),
      ...(source ? {} : { referenceTime: at }),
      luck: luck.map((pillar, i) => ({
        scope: ['greatLuck', 'yearlyLuck', 'monthlyLuck'][i],
        pillar: { stem: { id: `stem:luck:${i}`, value: pillar[0] }, branch: { id: `branch:luck:${i}`, value: pillar[1] } },
        validity: source ? { ...unknown, periodId: `source:${i}` } : durations[i],
        policyEvidence: policy[i],
      })),
    })
    const scopes = snapshots.map((snapshot, i) => ({ snapshot, evaluatedAt: source ? undefined : at,
      scopeGanZhi: luck[i], parentScopeGanZhi: luck[i - 1] }))
    const outcomes = buildRelationshipOutcome({ canonical, natal,
      luck: source ? [] : scopes.map(scope => ({ ...scope, evaluatedAt: at })) })
    return { personId, gender, natal, scopes, outcomes, canonical,
      ...(source ? { evaluationMode: 'source_snapshot' } : { referenceTime: at }) }
  }

  const named = [
    ['07:L1849', evaluate('source-1849', '己巳 癸酉 壬午 乙巳', ['庚午', '戊戌'], { gender: '男性', source: true })],
    ['07:L596-L605', evaluate('source-602', '丁丑 甲辰 壬午 丙午', ['丁未', '戊申'], { source: true, policy: {
      1: [{ entityId: 'stem:luck:1', condition: 'harmful_killing',
        evidenceIds: ['src/docs/source/primary/07-사주풀이예시.md#L603-L604'] }],
    } })],
    ['07:L3274', evaluate('source-3274', '丙辰 甲午 癸卯 丙辰', ['丁酉'], { gender: '男性', source: true })],
    ['07:L1451', evaluate('source-1451', '甲戌 戊辰 癸未 庚申', ['乙丑', '甲辰'], { source: true })],
  ]
  evaluateLifecycleFixture = evaluate
  sourceLifecycleInputs.push(...named.map(([, input]) => input))
  const result = input => {
    const before = JSON.stringify(input)
    const output = buildIndividualRelationshipTimeline(input)
    assert.equal(JSON.stringify(input), before)
    assert.deepEqual(buildIndividualRelationshipTimeline(input), output)
    for (const records of [output.evidence, output.decisions, output.facts]) assert.equal(new Set(records.map(item => item.id)).size, records.length)
    const judgments = [input.natal, ...input.scopes.map(entry => entry.snapshot)]
    const relations = new Set(judgments.flatMap(scope => [
      ...scope.stemFacts, ...scope.branchFacts, ...scope.formationFacts, ...scope.patternFacts,
      ...scope.combinationHistory.map(entry => entry.relation),
    ].map(f => f.id)))
    const judgmentIds = new Set(judgments.flatMap(scope => [scope.id, ...scope.rootFacts.map(f => f.id), ...scope.formationFacts.map(f => f.id),
      ...scope.luckEffectStates.map(item => item.event.id), ...scope.combinationHistory.map(item => item.relation.id),
      ...scope.stemFacts.map(f => f.id)]))
    for (const item of output.evidence) {
      assert.ok(judgments.some(scope => scope.id === item.scopeId && ({ natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' })[scope.scope] === item.scope))
      assert.ok(item.sourceRelationIds.every(id => relations.has(id)))
      assert.ok(item.sourceJudgmentIds.every(id => judgmentIds.has(id)))
      assert.ok(item.sourceOutcomeIds.every(id => input.outcomes.some(outcome => outcome.id === id)))
    }
    assert.ok(output.decisions.every(item => item.sourceEvidenceIds.every(id => output.evidence.some(e => e.id === id))))
    assert.ok(output.facts.every(item => output.decisions.some(d => d.id === item.decisionId && d.scopeId === item.scopeId)))
    return output
  }
  const has = (r, kind, pillar) => r.decisions.some(item => item.eventType === kind && (!pillar || item.scopeGanZhi === pillar))
  const sourceResults = named.map(([ref, input]) => {
    const output = result(input)
    assert.equal(output.facts.length, 0)
    assert.ok(output.projections.every(item => item.status === 'not_projectable'))
    return { ref, output }
  })
  assert.ok(has(sourceResults[0].output, 'marriage_opportunity', '戊戌'))
  assert.ok(sourceResults[0].output.evidence.some(item => item.evidenceType === 'spouse_palace_contact'
    && item.scopeGanZhi === '戊戌' && item.sourceRelationIds.some(id => id.includes('"half"'))))
  assert.ok(has(sourceResults[1].output, 'marriage_opportunity', '戊申'))
  assert.ok(has(sourceResults[1].output, 'marriage_caution', '戊申'))
  assert.ok(has(sourceResults[2].output, 'relationship_change', '丁酉'))
  const disruption = sourceResults[2].output
  const disruptionRisk = disruption.decisions.find(item => item.eventType === 'relationship_breakdown_risk'
    && item.scopeGanZhi === '丁酉' && item.certainty === 'confirmed')
  assert.ok(disruptionRisk)
  for (const type of ['spouse_relationship_axis', 'spouse_event_activation', 'spouse_palace_disruption']) {
    assert.ok(disruption.evidence.some(item => item.evidenceType === type && item.certainty === 'confirmed'
      && disruptionRisk.sourceEvidenceIds.includes(item.id)))
  }
  assert.ok(disruption.breakdownPaths.some(path => path.kind === 'BREAKDOWN-B' && disruptionRisk.breakdownPathIds.includes(path.id)))
  const disruptionInput = named[2][1]
  const missingAxis = result({ ...disruptionInput, outcomes: disruptionInput.outcomes.filter(fact => fact.significator !== 'partner') })
  assert.ok(has(missingAxis, 'relationship_change'))
  assert.ok(!has(missingAxis, 'relationship_breakdown_risk'))
  const missingEffect = result({ ...disruptionInput, scopes: disruptionInput.scopes.map(scope => ({
    ...scope, snapshot: { ...scope.snapshot, actualFunctions: [] },
  })) })
  assert.ok(has(missingEffect, 'relationship_change'))
  assert.ok(!has(missingEffect, 'relationship_breakdown_risk'))
  assert.deepEqual(disruption.gaps, [])
  assert.ok(has(sourceResults[3].output, 'relationship_breakdown_risk', '乙丑'))
  const highSourceRisk = sourceResults[3].output.decisions.find(decision =>
    decision.eventType === 'relationship_breakdown_risk' && decision.scopeGanZhi === '甲辰')
  assert.ok(highSourceRisk && sourceResults[3].output.highRiskDecisionIds.includes(highSourceRisk.id))
  assert.ok(sourceResults[3].output.breakdownPaths.some(path => path.kind === 'BREAKDOWN-A'
    && highSourceRisk.breakdownPathIds.includes(path.id)))

  const clash = evaluate('clash-only', '丙午 丁巳 丙午 丁巳', ['壬子'], { gender: '男性' })
  assert.ok(has(result(clash), 'relationship_change'))
  assert.ok(!has(result(clash), 'relationship_breakdown_risk'))
  assert.deepEqual(result({ ...clash, moneyOutcomes: [{ semanticType: 'money_difficulty', certainty: 'confirmed' }] }), result(clash))
  const hasEvidence = (timeline, type) => timeline.evidence.some(item => item.evidenceType === type && item.certainty === 'confirmed')
  assert.ok(hasEvidence(result(clash), 'spouse_palace_disruption'))
  assert.ok(!hasEvidence(result(clash), 'spouse_event_activation'))
  const actorOnly = result(evaluate('actor-only', '丙辰 甲午 癸卯 丙辰', ['丁亥'], { gender: '男性' }))
  assert.ok(hasEvidence(actorOnly, 'spouse_event_activation'))
  assert.ok(!hasEvidence(actorOnly, 'spouse_palace_disruption'))
  assert.ok(!has(actorOnly, 'relationship_breakdown_risk'))
  const stoppedInput = evaluate('stopped-actor', '丙辰 甲午 癸卯 壬辰', ['丁酉'], { gender: '男性' })
  assert.ok(stoppedInput.scopes[0].snapshot.runtime.some(state => state.entityId === 'stem:luck:0' && state.state === 'stopped'))
  const stopped = result(stoppedInput)
  assert.ok(has(stopped, 'relationship_change'))
  assert.ok(hasEvidence(stopped, 'spouse_palace_disruption'))
  assert.ok(!hasEvidence(stopped, 'spouse_event_activation'))
  assert.ok(!has(stopped, 'relationship_breakdown_risk'))
  const vulnerabilityOnly = evaluate('vulnerability-only', '丁巳 辛酉 甲午 己未', ['甲寅'])
  assert.ok(vulnerabilityOnly.natal.actualFunctions.some(item =>
    item.policyId === 'OFF-03' && item.function === 'operating' && item.byeongCandidate))
  assert.ok(!has(result(vulnerabilityOnly), 'relationship_breakdown_risk'))

  const carriedInput = evaluate('carried-spouse', '丙辰 甲午 癸卯 丙辰', ['丁亥', '癸酉'], { gender: '男性' })
  const carried = result(carriedInput)
  const carriedRisk = carried.decisions.find(item => item.eventType === 'relationship_breakdown_risk' && item.scope === 'sewoon')
  assert.ok(carriedRisk)
  assert.ok(carried.evidence.some(item => carriedRisk.sourceEvidenceIds.includes(item.id)
    && item.evidenceType === 'spouse_event_activation' && item.originScope === 'daewoon' && item.scope === 'sewoon'))
  assert.ok(carried.facts.some(fact => fact.decisionId === carriedRisk.id
    && JSON.stringify(fact.breakdownPathIds) === JSON.stringify(carriedRisk.breakdownPathIds)))
  assert.ok(!has(result({ ...carriedInput, scopes: carriedInput.scopes.slice(1) }), 'relationship_breakdown_risk'))

  const together = result(evaluate('both-breakdown-paths', '甲戌 戊辰 癸未 庚申', ['戊辰', '乙丑']))
  const combinedRisk = together.decisions.filter(item => item.eventType === 'relationship_breakdown_risk' && item.scope === 'sewoon')
  assert.equal(combinedRisk.length, 1)
  assert.deepEqual(together.breakdownPaths.filter(path => combinedRisk[0].breakdownPathIds.includes(path.id))
    .map(path => path.kind).sort(), ['BREAKDOWN-A', 'BREAKDOWN-B'])

  if (process.argv.includes('--c4b')) {
    console.log('PASS 丁酉 BREAKDOWN-B, active actor only, stopped actor + clash, clash only, vulnerability only, BREAKDOWN-A and marriage fixtures')
  } else {
    const contact = evaluate('contact-only', '丙午 丁巳 丙午 丁巳', ['辛未'], { gender: '男性' })
    assert.ok(has(result(contact), 'marriage_opportunity'))
    assert.ok(!has(result(contact), 'marriage_favorable'))
    const appearance = evaluate('appearance-only', '丙午 丁巳 丙午 丁巳', ['庚申'], { gender: '男性' })
    assert.ok(!has(result(appearance), 'marriage_opportunity'))
    assert.ok(!has(result(appearance), 'relationship_breakdown_risk'))
    const favorable = evaluate('favorable', '戊辰 辛酉 甲午 丙寅', ['己未'])
    assert.ok(has(result(favorable), 'marriage_favorable'))
    assert.ok(result(favorable).evidence.some(item => item.evidenceType === 'day_master_combine'))
    const mixing = evaluate('officer-mixing', '戊辰 辛酉 甲午 丙寅', ['庚申'])
    assert.ok(has(result(mixing), 'marriage_opportunity'))
    assert.ok(has(result(mixing), 'marriage_caution'))
    const food = evaluate('food-with-palace', '戊辰 己酉 甲午 庚寅', ['丙戌'])
    assert.ok(result(food).evidence.some(item => item.evidenceType === 'food_god_activation'))
    const harmful = evaluate('linked-damage', '丁巳 辛酉 甲午 己未', ['丁巳', '丁未'])
    assert.ok(has(result(harmful), 'relationship_breakdown_risk'))
    assert.ok(result(harmful).highRiskDecisionIds.length)
    assert.ok(has(result(harmful), 'relationship_strain'))
    const relief = evaluate('expression-relief', '癸子 丙酉 甲子 庚亥', ['戊寅'], { gender: '男性' })
    const personality = buildNatalPersonality(relief.canonical.chart)
    const natalExpression = expression.buildNatalResourceOutputExpression(personality, relief.natal, relief.personId)
    relief.expressions = [expression.buildCurrentResourceOutputExpression(natalExpression, relief.natal, relief.scopes[0].snapshot, at)]
    assert.ok(has(result(relief), 'relationship_relief'))

    const otherRelief = evaluate('other-relief', '癸子 丙酉 甲子 庚亥', ['戊寅'], { gender: '男性' })
    const otherNatal = expression.buildNatalResourceOutputExpression(personality, otherRelief.natal, otherRelief.personId)
    otherRelief.expressions = [expression.buildCurrentResourceOutputExpression(otherNatal, otherRelief.natal, otherRelief.scopes[0].snapshot, at)]
    const c3 = buildPersonalityInteraction(
      { id: relief.personId, natal: natalExpression, current: relief.expressions[0] },
      { id: otherRelief.personId, natal: otherNatal, current: otherRelief.expressions[0] },
    )
    const communication = buildPairRelationshipTimeline(relief, otherRelief, { structural: [], personality: c3.current.facts })
    assert.equal(communication.communicationWindows[0].kind, 'relationship_relief')
    assert.deepEqual(communication.communicationWindows[0].sourceFactIds, [c3.current.facts[0].id])

    const both = buildPairRelationshipTimeline(contact, favorable, { structural: [] })
    assert.deepEqual(buildPairRelationshipTimeline(favorable, contact, { structural: [] }), both)
    assert.ok(both.windows.some(window => window.kind === 'mutual_marriage_window'))
    const unfavorableBaseline = [{ sourcePersonId: contact.personId, targetPersonId: favorable.personId,
      verdict: 'unfavorable', supportEffects: [], damageEffects: [], deferredRoleIds: [] }]
    const stillMutual = buildPairRelationshipTimeline(contact, favorable, { structural: unfavorableBaseline })
    assert.deepEqual(stillMutual.windows, both.windows)
    assert.deepEqual(stillMutual.baseline.structural, unfavorableBaseline)
    const favorableBaseline = [{ ...unfavorableBaseline[0], targetPersonId: harmful.personId, verdict: 'favorable' }]
    assert.ok(buildPairRelationshipTimeline(contact, harmful, { structural: favorableBaseline }).people
      .some(person => has(person, 'relationship_breakdown_risk')))
    const one = buildPairRelationshipTimeline(appearance, contact, { structural: [] })
    assert.equal(one.windows.length, 0)
    assert.equal(one.oneSidedWindows[0].personId, contact.personId)

    console.log(JSON.stringify({
      source: sourceResults.map(({ ref, output }) => ({ ref, decisions: output.decisions.map(d => [d.scopeGanZhi, d.eventType]), deferred: output.deferred.length, gaps: output.gaps })),
      favorable: result(favorable).decisions.map(d => d.eventType),
      breakdown: result(harmful).decisions.map(d => [d.scopeGanZhi, d.eventType]),
    }, null, 2))
  }
} finally {
  await server.close()
}
