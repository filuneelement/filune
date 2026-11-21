import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const at = '2027-03-01T00:00:00.000Z'
const exactPeriod = { periodId: 'fixture-scope', from: { kind: 'exact', instant: '2026-02-01T00:00:00.000Z' },
  to: { kind: 'exact', instant: '2036-02-01T00:00:00.000Z' } }

try {
  const [{ buildNatalPersonality }, { buildNatalResourceOutputExpression, buildCurrentResourceOutputExpression },
    { buildPersonalityInteraction }, { runJudgmentCore }, { calculateTenGod, calculateDayRelationships },
    { calculateTwelveStage }] = await Promise.all([
    load('personality/index'), load('reading/personalityResourceOutput'), load('compatibility/index'), load('judgment/core/luckScope'), load('dayRelationships'), load('twelveStages'),
  ])

  function snapshot(id, pillars, attest = [], luckPillar, currentAttest = []) {
    const pillar = (position, value) => ({
      stem: { id: `stem:${position}`, value: value[0] },
      branch: { id: `branch:${position}`, value: value[1] },
    })
    const positions = ['year', 'month', 'day', 'time']
    const values = pillars.split(' ')
    const dayStem = values[2][0]
    const chart = {
      pillars: Object.fromEntries(positions.map((pos, i) =>
        [pos, { status: 'confirmed', value: { stem: values[i][0], branch: values[i][1], ganZhi: values[i] } }])),
      basicRelations: Object.fromEntries(positions.map((pos, i) =>
        [pos, { status: 'confirmed', value: { stemTenGod: calculateTenGod(dayStem, values[i][0]),
          relationships: calculateDayRelationships(dayStem, values[i][1]), twelveStage: calculateTwelveStage(dayStem, values[i][1]) } }])),
    }
    const judgments = runJudgmentCore({
      executionId: id, natal: Object.fromEntries(positions.map((pos, i) => [pos, pillar(pos, values[i])])),
      natalValidity: { periodId: id, from: { kind: 'unknown', reason: 'snapshot' }, to: { kind: 'unknown', reason: 'snapshot' } },
      natalCombinations: [], resourceExcessEvidenceIds: attest,
      ...(luckPillar && { referenceTime: at }),
      luck: luckPillar ? [{ scope: 'greatLuck', pillar: pillar('luck', luckPillar), validity: exactPeriod,
        resourceExcessEvidenceIds: currentAttest }] : [],
    })
    const personality = buildNatalPersonality(chart)
    const before = JSON.stringify({ personality, judgments })
    const natal = buildNatalResourceOutputExpression(personality, judgments[0])
    const current = judgments[1] && buildCurrentResourceOutputExpression(natal, judgments[0], judgments[1], at)
    assert.deepEqual(buildNatalResourceOutputExpression(personality, judgments[0]), natal)
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

  // Existing C00-03 pillars. The confirmed resource dominance is the explicit
  // expert observation at the cited lines, supplied through the existing
  // qualitative Judgment input; no fixture ID is inspected by the engine.
  const attestation = ['src/docs/source/primary/07-사주풀이예시.md#L3322']
  const sourceA = snapshot('C00-03:A', '庚戌 癸未 庚戌 丙戌', attestation)
  const sourceB = snapshot('C00-03:B', '壬寅 壬寅 丙子 庚寅', attestation)
  for (const source of [sourceA, sourceB]) assert.deepEqual(
    [source.natal.resourceDominance, source.natal.outputFunctionSuppressed, source.natal.expressionConstraint],
    ['confirmed', 'confirmed', 'confirmed'])
  const source = pair(sourceA, sourceB)
  assert.deepEqual(source.natal.facts.map(fact => fact.interactionType), ['mutual_expression_restraint', 'communication_friction'])

  const baseline = ['contract:confirmed-resource-dominance']
  const relief = snapshot('relief:A', '癸子 丙酉 甲辰 庚亥', baseline, '戊寅')
  const otherRelief = snapshot('relief:B', '癸子 丙酉 甲辰 庚亥', baseline, '戊寅')
  const retained = snapshot('retained:B', '癸子 丙酉 甲辰 庚亥', baseline, '壬酉', baseline)
  const worsening = snapshot('worsening:A', '癸卯 丙午 甲午 庚酉', baseline, '辛亥')
  assert.equal(relief.current.effect, 'current_expression_relief')
  assert.equal(relief.natal.expressionConstraint, 'confirmed')
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
  const ungraded = snapshot('ungraded:B', '壬寅 壬寅 丙子 庚寅')
  assert.equal(ungraded.natal.resourceDominance, 'deferred')
  assert.equal(pair(sourceA, ungraded).natal.status, 'deferred')
  const expired = buildCurrentResourceOutputExpression(relief.natal, relief.judgments[0], relief.judgments[1], '2036-02-01T00:00:00.000Z')
  assert.equal(expired.state, 'deferred')
  const offTime = { ...otherRelief, current: { ...otherRelief.current, evaluatedAt: '2027-04-01T00:00:00.000Z' } }
  assert.equal(pair(relief, offTime).current.state, 'deferred')
  const [{ runInternalReading }, { CURRENT_CALCULATION_VERSION }] = await Promise.all([
    load('judgment/pipeline/internalReading'), load('canonical/version'),
  ])
  const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const birthCases = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const authority = name => read(`src/docs/source/authority/${name}.md`)
  function fromBirth(id, key, known = false) {
    const fixture = birthCases[key]
    const source = runInternalReading({
      birth: { date: fixture.date, time: { known: true, value: fixture.time },
        gender: fixture.gender ?? '女性', timeCorrectionMode: 'none' },
      calculation: { referenceTime: at, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
      executionId: id, natalInspectionPeriod: exactPeriod,
      sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
        D: authority('D_rev152'), approval: authority('25-7_rev16') },
      ...(known && { resourceExcessEvidence: { natal: [`contract:verified-resource-assessment:${id}`] } }),
    })
    const personality = buildNatalPersonality(source.canonical.chart)
    return { id, natal: buildNatalResourceOutputExpression(personality, source.judgmentCore[0]), personality, judgments: source.judgmentCore }
  }
  const birthA = fromBirth('birth:A', 'CS-126', true)
  const birthB = fromBirth('birth:B', 'CS-127', true)
  assert.ok(pair(birthA, birthB).natal.facts.some(fact => fact.interactionType === 'communication_friction'))
  const rawBirth = fromBirth('raw-birth:B', 'CS-127')
  assert.equal(rawBirth.natal.resourceDominance, 'deferred')
  console.log(JSON.stringify({ result: 'PASS', sourceFixture: 'C00-03 with source attestation', currentRelief: relief.current.state,
    currentWorsening: worsening.current.state, oneSide: oneSide.natal.facts[0].interactionType,
    birthWithJudgmentEvidence: 'confirmed', birthWithoutJudgmentEvidence: 'deferred' }))
} finally {
  await server.close()
}
