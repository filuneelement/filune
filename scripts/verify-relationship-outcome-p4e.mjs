import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const authority = name => read(`src/docs/source/authority/${name}.md`)
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = (name) => server.ssrLoadModule(`/src/lib/${name}.ts`)
const section = (reading, id) => reading.chapters.find(chapter => chapter.id === id)

try {
  const { buildRelationshipOutcome } = await load('outcome/index')
  const { assembleReading, relationshipOutcomeFromReading, validateReadingAssembly } = await load('reading/index')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { date, time } = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))['CS-005']
  const referenceTime = '2027-01-15T00:00:00.000Z'
  const judgment = freeze(runInternalReading({
    birth: { date, time: { known: true, value: time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'p4e-cs005',
    natalInspectionPeriod: { periodId: 'natal-inspection',
      from: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' },
      to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } },
    sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
      D: authority('D_rev152'), approval: authority('25-7_rev16') },
    monthlyWindowStart: { year: 2026, month: 11 },
  }))
  const canonical = judgment.canonical
  const natal = judgment.judgmentCore.find(scope => scope.scope === 'natal')
  const months = judgment.luck.monthlyWindow
  const relationshipOutcomes = relationshipOutcomeFromReading({ judgment })
  assert.deepEqual(relationshipOutcomeFromReading({ judgment }), relationshipOutcomes)
  const byId = new Map(relationshipOutcomes.map(fact => [fact.id, fact]))
  assert.equal(byId.size, relationshipOutcomes.length)
  const palace = relationshipOutcomes.find(fact => fact.semanticType === 'relationship_palace_context')
  assert.equal(palace.branch, canonical.chart.pillars.day.value.branch)
  assert.equal(palace.scope, 'natal')
  assert.ok(relationshipOutcomes.some(fact => fact.semanticType === 'relationship_significator'
    && fact.significator === 'partner' && fact.tenGod === '偏官'))
  assert.ok(relationshipOutcomes.some(fact => fact.semanticType === 'relationship_significator'
    && fact.significator === 'mother' && fact.tenGod === '偏印'))
  const unknown = buildRelationshipOutcome({ canonical: { ...canonical, birthInput: { ...canonical.birthInput, gender: undefined } }, natal })
  assert.ok(unknown.every(fact => !['partner', 'child'].includes(fact.significator)))
  assert.ok(unknown.some(fact => fact.significator === 'father'))
  const male = buildRelationshipOutcome({ canonical: { ...canonical, birthInput: { ...canonical.birthInput, gender: '男性' } }, natal })
  assert.ok(male.some(fact => fact.significator === 'partner' && ['正財', '偏財'].includes(fact.tenGod)))
  assert.ok(male.every(fact => fact.significator !== 'child'))

  const january = months.find(month => month.calendarYear === 2027 && month.calendarMonth === 1)
  const jan = relationshipOutcomes.find(fact => fact.scopeId === january.judgmentCore.id
    && fact.semanticType === 'relationship_contact_signal')
  assert.ok(jan)
  assert.equal(jan.relationKind, 'six_combination')
  assert.equal(jan.certainty, 'conditional')
  assert.equal(jan.currentlyEffective, true)
  assert.deepEqual(jan.possibleInterpretations, ['contact', 'change'])
  assert.ok(relationshipOutcomes.some(fact => fact.scope === 'month' && fact.semanticType === 'relationship_change_signal'
    && fact.relationKind === 'clash'))
  assert.ok(relationshipOutcomes.some(fact => fact.scope === 'month' && fact.relationKind === 'three'))
  assert.ok(relationshipOutcomes.some(fact => fact.scope === 'month' && fact.relationKind === 'half'
    && fact.semanticType === 'relationship_palace_relation'))

  const scopeNames = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' }
  const snapshots = new Map([...judgment.judgmentCore, ...months.map(month => month.judgmentCore)]
    .filter(Boolean).map(scope => [scope.id, scope]))
  for (const fact of relationshipOutcomes) {
    const snapshot = snapshots.get(fact.scopeId)
    assert.equal(scopeNames[snapshot.scope], fact.scope)
    assert.deepEqual(fact.sourceJudgmentIds, [snapshot.id])
    assert.ok(fact.provenance.length)
    if (fact.scope !== 'natal') assert.deepEqual(fact.period, snapshot.validity)
    for (const id of fact.sourceParticipantIds) assert.ok(snapshot.directEntityIds.includes(id)
      || snapshot.formationBranchPool.some(participant => participant.id === id))
    for (const id of fact.sourceRoleIds) assert.ok(snapshot.roleEngine.roleHistory.some(role => role.roleId === id))
    for (const id of fact.sourceLuckEffectIds) assert.ok(snapshot.luckEffectHistory.some(effect => effect.id === id))
    for (const id of fact.sourceRelationIds) {
      if (fact.semanticType === 'relationship_pressure') {
        assert.ok(snapshot.stemFacts.some(relation => relation.id === id && relation.action === 'control'))
        continue
      }
      const relation = [...snapshot.branchFacts, ...snapshot.formationFacts].find(relation => relation.id === id)
      assert.ok(relation?.participants.includes(palace.sourceParticipantIds[0]))
      assert.ok(['six_combination', 'clash', 'three', 'half'].includes(relation.kind))
    }
  }

  const known = { snapshot: january.judgmentCore, evaluatedAt: january.referenceTime }
  const build = (snapshot, chart = canonical) => buildRelationshipOutcome({
    canonical: chart, natal, luck: [{ ...known, snapshot }],
  })
  const participant = jan.sourceParticipantIds.find(id => id !== palace.sourceParticipantIds[0])
  const setRuntime = state => ({ ...known.snapshot, runtime: [...known.snapshot.runtime, { entityId: participant, state }] })
  const stopped = build(setRuntime('stopped'))
  assert.equal(stopped.find(fact => fact.id === jan.id).lifecycle, 'stopped')
  assert.equal(stopped.find(fact => fact.id === jan.id).currentlyEffective, false)
  const reduced = build(setRuntime('weakened')).find(fact => fact.id === jan.id)
  assert.equal(reduced.lifecycle, 'reduced')
  assert.equal(reduced.certainty, 'conditional')
  const expiredChart = { ...canonical, context: { ...canonical.context, referenceTime: january.endInstant } }
  const history = build(known.snapshot, expiredChart)
  const expired = history.find(fact => fact.id === jan.id)
  assert.equal(expired.temporalStatus, 'expired')
  assert.equal(expired.currentlyEffective, false)
  assert.deepEqual(expired.sourceRelationIds, jan.sourceRelationIds)
  const early = buildRelationshipOutcome({ canonical, natal, luck: [{ ...known, evaluatedAt: january.endInstant }] })
  assert.ok(early.every(fact => fact.scope === 'natal'))

  // Natal relation uses only the scoped observation. The CS-005 natal grouping
  // also exercises the case where the relation is represented as a formation.
  const natalRelation = relationshipOutcomes.find(fact => fact.scope === 'natal' && fact.semanticType === 'relationship_palace_relation')
  assert.ok(natalRelation)
  assert.equal(natalRelation.certainty, 'contextual')

  const assemble = (facts, chart = canonical, productScope = 'premium') => {
    const reading = assembleReading({ judgment, canonical: chart, productScope, relationshipOutcomes: facts })
    validateReadingAssembly(reading)
    return reading
  }
  const premium = assemble(relationshipOutcomes)
  const free = assemble(relationshipOutcomes, canonical, 'free')
  assert.ok(free.semanticUnits.every(unit => unit.topic !== 'relationship'))
  assert.equal(section(premium, 'CH-06').readiness, 'partial')
  assert.ok(section(premium, 'CH-06').gaps.some(gap => gap.type === 'source_gap'))
  const units = premium.semanticUnits.filter(unit => unit.meaningRef.producer === 'outcome')
  const januaryUnit = units.find(unit => unit.meaningRef.recordId === jan.id)
  assert.ok(januaryUnit)
  for (const [chapter, role] of [['CH-06', 'conclusion'], ['CH-09', 'context'], ['CH-10', 'timing']]) {
    assert.ok(section(premium, chapter).placements.some(item => item.unitId === januaryUnit.id && item.role === role))
  }
  for (const unit of units) {
    const fact = byId.get(unit.meaningRef.recordId)
    assert.equal(unit.certainty, fact.certainty)
    assert.equal(unit.scope, fact.scope)
    assert.deepEqual(unit.sourceFactIds, [...new Set([
      ...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds,
    ])].sort())
    assert.deepEqual(unit.evidenceIds, [...fact.provenance].sort())
  }
  assert.ok(assemble(stopped).semanticUnits.every(unit => unit.meaningRef.recordId !== jan.id))
  assert.ok(assemble(history, expiredChart).semanticUnits.every(unit => unit.meaningRef.recordId !== jan.id))
  const future = relationshipOutcomes.filter(fact => fact.temporalStatus === 'future')
  assert.ok(future.length && future.every(fact => !fact.currentlyEffective))
  assert.ok(units.some(unit => future.some(fact => fact.id === unit.meaningRef.recordId)))
  const annual = relationshipOutcomes.find(fact => fact.scope === 'sewoon' && fact.relationKind === 'clash')
  assert.ok(annual)
  assert.ok(section(premium, 'CH-09').placements.some(placement => placement.role === 'timing'
    && units.some(unit => unit.id === placement.unitId && unit.meaningRef.recordId === annual.id)))
  assert.ok(!section(premium, 'CH-10').placements.some(placement =>
    units.some(unit => unit.id === placement.unitId && unit.meaningRef.recordId === annual.id)))

  // Independently evaluated great-luck contact with no reliance on a fabricated relation.
  const fixtureNatal = Object.fromEntries(['year', 'month', 'day', 'time'].map(position => {
    const pillar = canonical.chart.pillars[position].value
    return [position, {
      stem: { id: 'entity:' + JSON.stringify([`/chart/pillars/${position}/value/ganZhi`, 'stem']), value: pillar.stem },
      branch: { id: 'entity:' + JSON.stringify([`/chart/pillars/${position}/value/ganZhi`, 'branch']), value: pillar.branch },
    }]
  }))
  const fixturePeriod = { periodId: 'p4e-great', from: { kind: 'exact', instant: '2026-01-01T00:00:00.000Z' },
    to: { kind: 'exact', instant: '2036-01-01T00:00:00.000Z' } }
  const [fixtureBase, great] = runJudgmentCore({ executionId: 'p4e-great-fixture', referenceTime,
    natal: fixtureNatal, natalValidity: natal.validity, natalCombinations: [],
    luck: [{ scope: 'greatLuck', validity: fixturePeriod,
      pillar: { stem: { id: 'p4e-great-stem', value: '辛' }, branch: { id: 'p4e-great-branch', value: '丑' } } }] })
  const greatFact = buildRelationshipOutcome({ canonical, natal: fixtureBase, luck: [{ snapshot: great, evaluatedAt: referenceTime }] })
    .find(fact => fact.scope === 'daewoon' && fact.semanticType === 'relationship_contact_signal')
  assert.ok(greatFact)
  assert.equal(greatFact.scopeId, great.id)
  assert.deepEqual(greatFact.period, fixturePeriod)
  assert.ok(great.branchFacts.some(relation => relation.id === greatFact.sourceRelationIds[0]))
  assert.ok(section(assemble([greatFact]), 'CH-06').availableUnitIds.length)

  const allowedTypes = new Set(['relationship_palace_context', 'relationship_significator', 'relationship_palace_relation',
    'relationship_contact_signal', 'relationship_change_signal', 'relationship_formation', 'relationship_pressure'])
  assert.ok(relationshipOutcomes.every(fact => allowedTypes.has(fact.semanticType)))
  assert.doesNotMatch(JSON.stringify(relationshipOutcomes),
    /"(?:textKo|textJa|textEn|score|rank|probability|partnerQuality|event|partnerChart)"\s*:/u)
  const counts = Object.fromEntries([...allowedTypes].map(type =>
    [type, relationshipOutcomes.filter(fact => fact.semanticType === type).length]))
  console.log(JSON.stringify({ facts: relationshipOutcomes.length, units: units.length, counts,
    scopes: [...new Set(relationshipOutcomes.map(fact => fact.scope))] }))
  console.log('P4-E relationship outcome PASS')
} finally {
  await server.close()
}
