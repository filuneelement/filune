import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const at = '2027-03-01T00:00:00.000Z'
const exactPeriod = { periodId: 'fixture-scope', from: { kind: 'exact', instant: '2026-02-01T00:00:00.000Z' },
  to: { kind: 'exact', instant: '2036-02-01T00:00:00.000Z' } }

try {
  const [{ buildNatalPersonality }, { buildResourceDominanceFact }, { buildNatalResourceOutputExpression, buildCurrentResourceOutputExpression },
    { buildPersonalityInteraction }, { runJudgmentCore }, { calculateTenGod, calculateDayRelationships },
    { calculateTwelveStage }] = await Promise.all([
    load('personality/index'), load('reading/resourceDominance'), load('reading/personalityResourceOutput'), load('compatibility/index'), load('judgment/core/luckScope'), load('dayRelationships'), load('twelveStages'),
  ])

  function snapshot(id, pillars, { luckPillar, currentAttest = [], stopped = [] } = {}) {
    const pillar = (position, value) => ({
      stem: { id: `stem:${position}`, value: value[0] },
      branch: { id: `branch:${position}`, value: value[1] },
    })
    const values = pillars.split(' ')
    const positions = ['year', 'month', 'day', 'time'].slice(0, values.length)
    const chartPositions = ['year', 'month', 'day', 'time']
    const unknown = { status: 'unknown' }
    const dayStem = values[2][0]
    const chart = {
      pillars: Object.fromEntries(chartPositions.map((pos, i) =>
        [pos, !values[i] ? unknown : { status: 'confirmed', value: { stem: values[i][0], branch: values[i][1], ganZhi: values[i] } }])),
      basicRelations: Object.fromEntries(chartPositions.map((pos, i) =>
        [pos, !values[i] ? unknown : { status: 'confirmed', value: { stemTenGod: calculateTenGod(dayStem, values[i][0]),
          relationships: calculateDayRelationships(dayStem, values[i][1]), twelveStage: calculateTwelveStage(dayStem, values[i][1]) } }])),
    }
    const judgments = runJudgmentCore({
      executionId: id, natal: Object.fromEntries(positions.map((pos, i) => [pos, pillar(pos, values[i])])),
      natalValidity: { periodId: id, from: { kind: 'unknown', reason: 'snapshot' }, to: { kind: 'unknown', reason: 'snapshot' } },
      natalCombinations: stopped,
      ...(luckPillar && { referenceTime: at }),
      luck: luckPillar ? [{ scope: 'greatLuck', pillar: pillar('luck', luckPillar), validity: exactPeriod,
        resourceExcessEvidenceIds: currentAttest }] : [],
    })
    const personality = buildNatalPersonality(chart)
    const before = JSON.stringify({ personality, judgments })
    const natal = buildNatalResourceOutputExpression(personality, judgments[0], id)
    const current = judgments[1] && buildCurrentResourceOutputExpression(natal, judgments[0], judgments[1], at)
    assert.deepEqual(buildNatalResourceOutputExpression(personality, judgments[0], id), natal)
    assert.equal(JSON.stringify({ personality, judgments }), before)
    return { id, natal, current, judgments, personality }
  }

  function pair(a, b) {
    const before = JSON.stringify([a, b])
    const result = buildPersonalityInteraction(a, b)
    assert.deepEqual(buildPersonalityInteraction(b, a), result)
    assert.equal(JSON.stringify([a, b]), before)
    const facts = [...result.natal.facts, ...result.current.facts]
    assert.equal(new Set(facts.map(fact => fact.id)).size, facts.length)
    const judgmentIds = new Set([a, b].flatMap(person => person.judgments.flatMap(j => [
      j.id, ...j.evidence.resourceExcessEvidenceIds, ...j.stemFacts.map(f => f.id), ...j.rootFacts.map(f => f.id),
      ...j.formationFacts.map(f => f.id), ...j.luckEffectStates.map(state => state.event.id),
      ...j.combinationHistory.map(entry => entry.relation.id),
    ])))
    for (const fact of facts) {
      assert.ok(fact.sourcePersonalityFactIds.every(id => [a, b].some(person => person.personality.facts.some(item => item.id === id))))
      assert.ok(fact.sourceJudgmentFactIds.every(id => judgmentIds.has(id)), fact.id)
      assert.ok(fact.scopes.every(scope => [a, b].some(person => person.id === scope.personId
        && (person.natal.id === scope.expressionId || person.current?.id === scope.expressionId))))
    }
    return result
  }

  const sourceA = snapshot('C00-03:A', '庚戌 癸未 庚戌 丙戌')
  const sourceB = snapshot('C00-03:B', '壬寅 壬寅 丙子 庚寅')
  for (const [fixture, count] of [[sourceA, 4], [sourceB, 3]]) {
    assert.deepEqual(
      [fixture.natal.resourceDominance, fixture.natal.outputFunctionSuppressed, fixture.natal.expressionConstraint],
      ['confirmed', 'confirmed', 'confirmed'])
    assert.equal(fixture.natal.resourceDominanceFact.evidencePath, 'branch_layer_dominant')
    assert.equal(fixture.natal.resourceDominanceFact.branchPositions.length, count)
    assert.equal(fixture.natal.resourceDominanceFact.sourcePerson, fixture.id)
  }
  const source = pair(sourceA, sourceB)
  assert.deepEqual(source.natal.facts.map(fact => [fact.interactionType, fact.certainty]),
    [['mutual_expression_restraint', 'confirmed'], ['communication_friction', 'confirmed']])

  const twoOfFour = snapshot('two-of-four', '癸子 丙午 甲子 庚午')
  assert.equal(twoOfFour.natal.resourceDominanceFact.certainty, 'not_confirmed')
  const monthOnly = snapshot('month-only', '丙寅 丙子 甲午 庚午')
  assert.equal(monthOnly.natal.resourceDominanceFact.certainty, 'not_confirmed')
  assert.deepEqual(monthOnly.natal.resourceDominanceFact.branchPositions, ['month_branch'])
  const branchReinforcement = snapshot('branch-reinforcement', '壬寅 丁卯 丙午 庚午')
  assert.equal(branchReinforcement.natal.resourceDominanceFact.certainty, 'confirmed')
  assert.equal(branchReinforcement.natal.resourceDominanceFact.evidencePath, 'month_resource_reinforced')
  assert.equal(branchReinforcement.natal.resourceDominanceFact.stemFactIds.length, 0)
  const rooted = snapshot('rooted', '己卯 壬子 甲午 辛酉')
  assert.equal(rooted.natal.resourceDominanceFact.evidencePath, 'month_resource_reinforced')
  assert.equal(rooted.natal.resourceDominanceFact.stemFactIds.length, 1)
  assert.ok(rooted.natal.resourceDominanceFact.sourceJudgmentFactIds.some(id =>
    rooted.judgments[0].rootFacts.some(fact => fact.id === id)))
  const [rootJudgment] = rooted.judgments
  const [stemFactId] = rooted.natal.resourceDominanceFact.stemFactIds
  const stemRelation = rootJudgment.stemFacts.find(fact => fact.id === stemFactId)
  const reducedJudgment = {
    ...rootJudgment,
    runtime: rootJudgment.runtime.map(item => item.entityId === stemRelation.source.id ? { ...item, state: 'weakened' } : item),
    actualFunctions: rootJudgment.actualFunctions.map(fact => fact.relationFactId === stemFactId
      ? { ...fact, function: 'reduced' } : fact),
  }
  assert.equal(buildResourceDominanceFact(rooted.id, rooted.personality, reducedJudgment).certainty, 'confirmed')
  const deferredStem = buildResourceDominanceFact(rooted.id, rooted.personality, {
    ...reducedJudgment,
    actualFunctions: reducedJudgment.actualFunctions.filter(fact => fact.relationFactId !== stemFactId),
  })
  assert.equal(deferredStem.certainty, 'deferred')
  assert.deepEqual(deferredStem.stemFactIds, [stemFactId])
  const stopped = snapshot('stopped', '丁卯 壬子 甲午 辛酉', { stopped: [['stem:year', 'stem:month']] })
  assert.equal(stopped.natal.resourceDominanceFact.certainty, 'not_confirmed')
  const formation = snapshot('formation', '丙申 丙子 甲午 庚午')
  assert.equal(formation.natal.resourceDominanceFact.evidencePath, 'month_resource_reinforced')
  assert.equal(formation.natal.resourceDominanceFact.formationFactIds.length, 1)
  const excludedFormations = [
    ['three-without-center', '己亥 丙寅 丁未 庚午'], // 亥/未 without 卯.
    ['partial-season', '戊辰 丙寅 丙午 庚午'], // 寅/辰 without 卯.
    ['six-combination', '己亥 丙寅 丙午 庚午'], // 寅/亥.
  ]
  for (const [id, pillars] of excludedFormations) {
    const fixture = snapshot(id, pillars)
    assert.equal(fixture.natal.resourceDominanceFact.certainty, 'not_confirmed', id)
    assert.equal(fixture.natal.resourceDominanceFact.formationFactIds.length, 0)
  }
  const middleOnly = snapshot('middle-only', '戊辰 丙戌 甲辰 庚午')
  assert.ok(middleOnly.personality.occurrences.some(item => item.hiddenStemRole !== 'main' && item.tenGod === '正印'))
  assert.equal(middleOnly.natal.resourceDominanceFact.certainty, 'not_confirmed')
  const unknownThree = snapshot('unknown-three', '癸亥 甲子 甲子')
  assert.equal(unknownThree.natal.resourceDominanceFact.evidencePath, 'branch_layer_dominant')
  const unknownTwo = snapshot('unknown-two', '癸子 丙午 甲子')
  assert.equal(unknownTwo.natal.resourceDominanceFact.certainty, 'deferred')
  const unknownReinforced = snapshot('unknown-reinforced', '癸亥 甲子 甲午')
  assert.equal(unknownReinforced.natal.resourceDominanceFact.evidencePath, 'month_resource_reinforced')
  assert.equal(pair(sourceA, unknownTwo).natal.status, 'deferred')
  assert.equal(buildResourceDominanceFact('no-judgment', rooted.personality).certainty, 'deferred')
  assert.ok(sourceA.personality.tenGodStates.every(state =>
    state.prominence.status === 'deferred' && state.prominence.reason === 'no_grade_criteria'))

  const reliefPillars = '癸子 丙酉 甲子 庚亥'
  const relief = snapshot('relief:A', reliefPillars, { luckPillar: '戊寅' })
  const otherRelief = snapshot('relief:B', reliefPillars, { luckPillar: '戊寅' })
  const retained = snapshot('retained:B', reliefPillars, { luckPillar: '壬酉', currentAttest: ['contract:retained-resource'] })
  const worsening = snapshot('worsening:A', '丙午 壬子 甲子 癸丑', { luckPillar: '辛亥' })
  assert.equal(relief.current.effect, 'current_expression_relief')
  assert.equal(relief.natal.expressionConstraint, 'confirmed')
  assert.equal(relief.current.outputFunctionSuppressed, 'reduced')
  assert.equal(relief.current.certainty, 'confirmed')
  assert.ok(relief.current.expressionTraits.some(trait => trait.tenGod === '食神' && trait.sourceRefs.length))
  const resourceOnly = snapshot('resource-only', reliefPillars, { luckPillar: '戊子' })
  assert.equal(resourceOnly.current.resourceFunctionWeakened, true)
  assert.notEqual(resourceOnly.current.effect, 'current_expression_relief')
  const outputOnly = snapshot('output-only', reliefPillars, { luckPillar: '丙寅' })
  assert.notEqual(outputOnly.current.effect, 'current_expression_relief')
  assert.equal(worsening.current.effect, 'current_expression_constraint_strengthened')
  assert.equal(retained.current.state, 'retained')
  assert.equal(pair(relief, otherRelief).current.facts[0].interactionType, 'communication_relief')
  assert.equal(pair(relief, retained).current.state, 'partially_relieved')
  assert.deepEqual(pair(relief, retained).current.facts, [])
  assert.equal(pair(worsening, relief).current.state, 'mixed')
  const worsePair = pair(worsening, retained)
  assert.equal(worsePair.current.state, 'strengthened')
  assert.equal(worsePair.current.facts[0].direction, 'directed')
  assert.equal(worsePair.current.facts[0].interactionType, 'communication_friction_strengthened')

  const noResource = snapshot('no-resource:B', '丙午 丁巳 丙午 丁巳')
  assert.equal(noResource.natal.expressionConstraint, 'not_applicable')
  const oneSide = pair(relief, noResource)
  assert.deepEqual(oneSide.natal.facts.map(fact => [fact.interactionType, fact.direction, ...fact.personIds]),
    [['expression_withholding', 'directed', relief.id, noResource.id]])
  const expired = buildCurrentResourceOutputExpression(relief.natal, relief.judgments[0], relief.judgments[1], '2036-02-01T00:00:00.000Z')
  assert.equal(expired.state, 'deferred')
  const offTime = { ...otherRelief, current: { ...otherRelief.current, evaluatedAt: '2027-04-01T00:00:00.000Z' } }
  assert.equal(pair(relief, offTime).current.state, 'deferred')
  const { readBirthCompatibility } = await load('reading/index')
  const fromBirth = readBirthCompatibility({
    executionId: 'birth:A',
    birth: { date: { year: 1970, month: 7, day: 29 }, time: { known: true, value: { hour: 20, minute: 0 } },
      gender: '女性', timeCorrectionMode: 'none' },
  }, {
    executionId: 'birth:B',
    birth: { date: { year: 1962, month: 2, day: 7 }, time: { known: true, value: { hour: 4, minute: 0 } },
      gender: '男性', timeCorrectionMode: 'none' },
  }, at)
  assert.deepEqual(fromBirth.people.map(person => person.natal.resourceDominanceFact.branchPositions.length), [4, 3])
  assert.ok(fromBirth.people.every(person => person.natal.expressionConstraint === 'confirmed'))
  assert.ok(fromBirth.natal.facts.some(fact => fact.interactionType === 'communication_friction' && fact.certainty === 'confirmed'))
  console.log('PASS C00-03, BirthInput, RD-01/RD-02, unknown hour, current relief/worsening and pair provenance')
} finally {
  await server.close()
}
