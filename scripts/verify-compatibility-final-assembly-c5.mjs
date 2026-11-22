import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { sourceFactResults } from './verify-compatibility-cross-chart-facts-c1.mjs'
import { structuralContractFixtures } from './verify-compatibility-structural-policy-c2.mjs'
import { evaluateLifecycleFixture, sourceLifecycleInputs } from './verify-compatibility-lifecycle-timing-c4.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
export const customerContractFixtures = {}
const at = '2027-03-01T00:00:00.000Z'
const births = [
  { executionId: 'A', birth: { date: { year: 1970, month: 7, day: 29 }, time: { known: true, value: { hour: 20, minute: 0 } },
    gender: '女性', timeCorrectionMode: 'none' } },
  { executionId: 'B', birth: { date: { year: 1962, month: 2, day: 7 }, time: { known: true, value: { hour: 4, minute: 0 } },
    gender: '男性', timeCorrectionMode: 'none' } },
]
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

try {
  const [{ assembleFinalCompatibility, buildPairRelationshipTimeline, buildStructuralCompatibility },
    { readBirthCompatibility }, { buildNatalPersonality }, { buildNatalResourceOutputExpression, buildCurrentResourceOutputExpression }, { assemblePersonalityPair }] = await Promise.all([
    load('compatibility/index'), load('reading/index'), load('personality/natalPersonality'),
    load('reading/personalityResourceOutput'), load('compatibility/personalityFromBirth'),
  ])
  const tally = { fixtures: 0, structural: 0, personality: 0, lifecycle: 0, aToB: 0, bToA: 0,
    strengths: 0, risks: 0, current: 0, future: 0, history: 0, mixed: 0, asymmetric: 0,
    duplicateIds: 0, orphanProvenance: 0, fakeDates: 0, mutations: 0, events: {} }

  function verify(input) {
    const before = JSON.stringify(input)
    const final = assembleFinalCompatibility(freeze(input))
    assert.equal(JSON.stringify(input), before)
    assert.equal(final.crossChart, input.crossChart)
    assert.deepEqual(final.structural.directions, input.structural)
    assert.equal(final.personality, input.personality)
    assert.equal(final.relationshipLifecycle, input.relationshipLifecycle)
    assert.deepEqual(final.currentState.personality, input.personality.current)
    assert.deepEqual(final.currentState.timingWindows, final.timingWindows.filter(item => item.temporalStatus === 'current'))
    assert.deepEqual(final.futureWindows, final.timingWindows.filter(item => item.temporalStatus === 'future'))
    assert.deepEqual(final.historyWindows, final.timingWindows.filter(item => item.temporalStatus === 'expired'))

    const [a, b] = input.personIds
    assert.equal(final.structural.aToB, input.structural.find(item => item.sourcePersonId === a && item.targetPersonId === b))
    assert.equal(final.structural.bToA, input.structural.find(item => item.sourcePersonId === b && item.targetPersonId === a))
    const swapped = assembleFinalCompatibility({ ...input, personIds: [b, a] })
    assert.equal(swapped.pairId, final.pairId)
    assert.notDeepEqual(swapped.identity.inputOrder, final.identity.inputOrder)
    assert.deepEqual(swapped.identity.canonicalOrder, final.identity.canonicalOrder)
    assert.equal(swapped.structural.aToB, final.structural.bToA)
    for (const key of ['crossChart', 'personality', 'relationshipLifecycle', 'strengths', 'risks', 'timingWindows', 'overallSummary', 'provenance']) {
      assert.deepEqual(swapped[key], final[key], key)
    }

    const lifecycle = input.relationshipLifecycle
    const projected = [...lifecycle.people.flatMap(person => person.facts),
      ...lifecycle.windows, ...lifecycle.oneSidedWindows, ...lifecycle.communicationWindows]
    const effects = input.structural.flatMap(direction => [...direction.supportEffects, ...direction.damageEffects])
    const interactions = [...input.personality.natal.facts, ...input.personality.current.facts]
    const decisions = lifecycle.people.flatMap(person => person.decisions)
    const ownerRefs = [...effects, ...interactions, ...decisions]
    const upstream = new Set([
      ...Object.values(input.crossChart).flat().flatMap(fact => fact.id ? [fact.id, ...fact.sourceFactIds] : []),
      ...effects.flatMap(fact => [fact.id, ...fact.sourceFactIds]),
      ...interactions.flatMap(fact => [fact.id, ...fact.sourceJudgmentFactIds, ...fact.sourcePersonalityFactIds, ...fact.scopes.map(scope => scope.expressionId)]),
      ...input.personality.current.participants.map(item => item.expression.id),
      ...lifecycle.people.flatMap(person => [...person.evidence, ...person.breakdownPaths, ...person.decisions, ...person.facts].map(fact => fact.id)),
    ])
    for (const facts of [final.strengths, final.risks, final.timingWindows, final.currentState.timingWindows, final.futureWindows, final.historyWindows]) {
      assert.equal(new Set(facts.map(item => item.id)).size, facts.length)
    }
    for (const item of [...final.strengths, ...final.risks]) {
      assert.ok(ownerRefs.some(fact => fact.id === item.id))
      assert.ok(item.sourceFactIds.length && item.sourceFactIds.every(id => upstream.has(id)))
      assert.equal(item.certainty, 'confirmed')
    }
    const summaries = [...final.overallSummary.structural, final.overallSummary.personality.natal,
      final.overallSummary.personality.current, ...final.overallSummary.lifecycle.flatMap(person => person.confirmed)]
    for (const item of summaries) assert.ok(item.sourceFactIds.every(id => upstream.has(id)))
    for (const window of final.timingWindows) {
      const original = projected.find(fact => fact.id === window.id)
      assert.ok(original)
      assert.ok(window.sourceFactIds.every(id => upstream.has(id)))
      if (window.windowType === 'individual') {
        for (const key of ['period', 'scope', 'scopeId', 'certainty', 'sourceEvidenceIds', 'breakdownPathIds']) {
          assert.deepEqual(window[key], original[key])
        }
      } else {
        assert.equal(window.from, original.from)
        assert.equal(window.to, original.to)
        assert.ok(window.scopes.length && window.scopes.every(scope => scope.scopeId))
      }
    }
    assert.doesNotMatch(JSON.stringify(final), /"(compatibilityScore|weightedScore|overallScore|score|percentage)":/)
    tally.fixtures++
    tally.structural++
    tally.personality++
    tally.lifecycle++
    tally.aToB += Number(Boolean(final.structural.aToB))
    tally.bToA += Number(Boolean(final.structural.bToA))
    tally.strengths += final.strengths.length
    tally.risks += final.risks.length
    tally.current += final.currentState.timingWindows.length
    tally.future += final.futureWindows.length
    tally.history += final.historyWindows.length
    for (const decision of decisions) tally.events[decision.eventType] = (tally.events[decision.eventType] ?? 0) + 1
    return final
  }

  const natalInputs = [
    evaluateLifecycleFixture('A', '庚戌 癸未 庚戌 丙戌', []),
    evaluateLifecycleFixture('B', '壬寅 壬寅 丙子 庚寅', [], { gender: '男性' }),
  ]
  const basePersonality = assemblePersonalityPair(...natalInputs.map(input => ({
    id: input.personId, currentScopes: [],
    natal: buildNatalResourceOutputExpression(buildNatalPersonality(input.canonical.chart), input.natal, input.personId),
  })))
  assert.ok(basePersonality.natal.facts.some(item => item.interactionType === 'communication_friction'))

  // Combine already verified C2/C3/C4 contract outputs to exercise independent assembly axes.
  const harmful = evaluateLifecycleFixture('A', '丁巳 辛酉 甲午 己未', ['丁巳', '丁未'])
  const favorable = evaluateLifecycleFixture('B', '戊辰 辛酉 甲午 丙寅', ['己未'])
  const runTimeline = (first, second, structural, referenceTime, personality = basePersonality) =>
    buildPairRelationshipTimeline({ ...first, referenceTime }, { ...second, referenceTime }, {
      structural, personality: [...personality.natal.facts, ...personality.current.facts],
    })
  const families = structuralContractFixtures.asymmetric
  const mixed = verify({ personIds: ['A', 'B'], referenceTime: at, ...families, personality: basePersonality,
    relationshipLifecycle: runTimeline(harmful, favorable, families.structural, at) })
  assert.equal(mixed.structural.aToB.verdict, 'favorable')
  assert.equal(mixed.structural.bToA.verdict, 'unfavorable')
  assert.ok(mixed.risks.some(fact => fact.semantic === 'communication_friction'))
  assert.ok(mixed.futureWindows.some(fact => fact.eventType === 'relationship_breakdown_risk' && fact.certainty === 'confirmed'))
  assert.ok(mixed.futureWindows.some(fact => fact.eventType === 'marriage_opportunity'))
  assert.ok(mixed.futureWindows.some(fact => fact.eventType === 'marriage_caution'))
  assert.ok(mixed.currentState.timingWindows.some(fact => fact.eventType === 'marriage_favorable'))
  assert.ok(mixed.futureWindows.some(fact => fact.windowType === 'mutual'))
  assert.ok(mixed.futureWindows.some(fact => fact.windowType === 'one_sided'))
  assert.ok(mixed.strengths.length > 0 && mixed.risks.length > 0)
  customerContractFixtures.mixed = mixed
  tally.mixed++
  tally.asymmetric++

  const balanced = structuralContractFixtures.balanced
  const dated = '2028-07-15T00:00:00.000Z'
  const current = verify({ personIds: ['A', 'B'], referenceTime: dated, ...balanced, personality: basePersonality,
    relationshipLifecycle: runTimeline(harmful, favorable, balanced.structural, dated) })
  assert.equal(current.structural.aToB.verdict, 'balanced_mixed')
  assert.ok(current.currentState.timingWindows.length)
  customerContractFixtures.balanced = current
  const later = '2032-01-01T00:00:00.000Z'
  const history = verify({ personIds: ['A', 'B'], referenceTime: later, ...families, personality: basePersonality,
    relationshipLifecycle: runTimeline(harmful, favorable, families.structural, later) })
  assert.ok(history.historyWindows.length)
  assert.equal(history.futureWindows.length, 0)
  customerContractFixtures.history = history

  const reliefInputs = ['A', 'B'].map(id =>
    evaluateLifecycleFixture(id, '癸子 丙酉 甲子 庚亥', ['戊寅'], { gender: '男性' }))
  const reliefPeople = reliefInputs.map(input => {
    const natal = buildNatalResourceOutputExpression(buildNatalPersonality(input.canonical.chart), input.natal, input.personId)
    const current = buildCurrentResourceOutputExpression(natal, input.natal, input.scopes[0].snapshot, dated)
    input.expressions = [current]
    return { id: input.personId, natal, current, currentScopes: input.expressions }
  })
  const reliefPersonality = assemblePersonalityPair(...reliefPeople)
  const relief = verify({ personIds: ['A', 'B'], referenceTime: dated, ...families, personality: reliefPersonality,
    relationshipLifecycle: runTimeline(...reliefInputs, families.structural, dated, reliefPersonality) })
  assert.ok(relief.risks.some(fact => fact.semantic === 'communication_friction'))
  assert.ok(relief.strengths.some(fact => fact.semantic === 'communication_relief'))
  assert.ok(relief.strengths.some(fact => fact.semantic === 'relationship_relief'))
  assert.ok(relief.currentState.timingWindows.some(fact => fact.windowType === 'communication'))
  customerContractFixtures.relief = relief

  const bothPaths = evaluateLifecycleFixture('A', '甲戌 戊辰 癸未 庚申', ['戊辰', '乙丑'])
  const bothPathResult = verify({ personIds: ['A', 'B'], referenceTime: dated, ...families, personality: basePersonality,
    relationshipLifecycle: runTimeline(bothPaths, favorable, families.structural, dated) })
  const combined = bothPathResult.timingWindows.find(window => window.eventType === 'relationship_breakdown_risk'
    && window.breakdownPathIds?.length === 2)
  assert.ok(combined)
  const originalCombined = bothPathResult.relationshipLifecycle.people[0].facts.find(fact => fact.id === combined.id)
  assert.deepEqual(combined.breakdownPathIds, originalCombined.breakdownPathIds)
  customerContractFixtures.bothPaths = bothPathResult

  const [marriage, caution, disruption, aggravation] = sourceLifecycleInputs
  for (const pair of [[marriage, caution], [disruption, aggravation]]) {
    const people = pair.map(input => ({ id: input.personId, currentScopes: [],
      natal: buildNatalResourceOutputExpression(buildNatalPersonality(input.canonical.chart), input.natal, input.personId) }))
    const personality = assemblePersonalityPair(...people)
    const source = verify({ personIds: pair.map(input => input.personId), referenceTime: at,
      crossChart: { stemInteractions: [], branchInteractions: [], rootSupport: [], roleInteractions: [], diagnostics: [] },
      structural: [], personality, relationshipLifecycle: buildPairRelationshipTimeline(...pair, { structural: [] }) })
    assert.equal(source.timingWindows.length, 0)
    assert.ok(source.relationshipLifecycle.people.every(person => person.decisions.length))
    customerContractFixtures[pair[0] === marriage ? 'marriageSource' : 'breakdownSource'] = source
  }

  // Preserve a real C1 source family without introducing a new expected C2 verdict.
  const crossChart = sourceFactResults[2]
  const structural = buildStructuralCompatibility(crossChart)
  assert.equal(structural.length, 2)
  const withoutPersonality = { people: [], natal: { status: 'deferred', facts: [] }, current: { state: 'deferred', facts: [], participants: [] } }
  const source = verify({ personIds: structural.map(item => item.sourcePersonId), referenceTime: at, crossChart, structural,
    personality: withoutPersonality, relationshipLifecycle: {
      people: [], windows: [], oneSidedWindows: [], communicationWindows: [], baseline: { structural },
    } })
  assert.equal(source.personality.natal.status, 'deferred')
  assert.ok(source.structural.directions.length)
  if (!process.argv.includes('--customer-fixtures')) {
    const product = readBirthCompatibility(births[0], births[1], at, { userContext: { relationshipStatus: 'partnered' } })
    const reversed = readBirthCompatibility(births[1], births[0], at)
    assert.deepEqual(product.crossChart, reversed.crossChart)
    assert.deepEqual(product.structural.aToB, reversed.structural.bToA)
    assert.deepEqual(product.relationshipLifecycle, reversed.relationshipLifecycle)
    assert.equal(product.pairId, reversed.pairId)
    assert.deepEqual(product.userContext, { relationshipStatus: 'partnered' })
    assert.deepEqual(product.overallSummary, reversed.overallSummary)
    assert.equal(product.natal, product.personality.natal)
    assert.deepEqual(product.structural.directions, buildStructuralCompatibility(product.crossChart))
    assert.ok(product.personality.natal.facts.some(item => item.interactionType === 'communication_friction'))
    verify({ personIds: ['A', 'B'], referenceTime: at, crossChart: product.crossChart, structural: product.structural.directions,
      personality: product.personality, relationshipLifecycle: product.relationshipLifecycle })

  }

  console.log(JSON.stringify({ result: 'PASS', ...tally }, null, 2))
} finally {
  await server.close()
}
