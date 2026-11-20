import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const authority = name => read(`src/docs/source/authority/${name}.md`)
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const byId = rows => new Map(rows.map(row => [row.id, row]))
const sorted = ids => [...new Set(ids)].sort()
const relationshipUnits = assembly => assembly.semanticUnits.filter(unit => unit.meaningRef.producer === 'outcome')
const scopeNames = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' }
const relationKinds = ['six_combination', 'clash', 'three', 'half']
const allowedTypes = ['relationship_palace_context', 'relationship_significator', 'relationship_palace_relation',
  'relationship_contact_signal', 'relationship_change_signal']
const forbidden = /"(?:marriage_prediction|divorce_prediction|affair_prediction|fated_partner|perfect_match|partner_quality|compatibility(?:_score)?|relationship_score|relationship_probability|has_spouse|is_married|is_single|has_partner|partner_exists|married|dating|breakup|relationship_failure|relationship_favorable|relationship_unfavorable|score|rank|probability|textKo|textJa|textEn|localeText|customerText|relationshipStyle)"|\d+\s*%/iu

try {
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { calculateEightChar } = await load('calculateEightChar')
  const { buildNatalPersonality } = await load('personality/index')
  const { buildRelationshipOutcome } = await load('outcome/index')
  const { assembleReading, relationshipOutcomeFromReading, validateReadingAssembly } = await load('reading/index')
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const currentReference = '2027-01-15T00:00:00.000Z'
  const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
  const day = calculateEightChar({ year: 2027, month: 1, day: 15, hour: 9, minute: 0 }).day
  const sources = { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
    D: authority('D_rev152'), approval: authority('25-7_rev16') }
  const summarize = []
  const tallies = { facts: 0, withProvenance: 0, natalContact: 0, natalChange: 0, luckContact: 0, luckChange: 0,
    significators: 0, stopped: 0, reduced: 0, coexistence: 0, overlappingScopes: 0, inheritedPair: 0, excludedRelations: 0,
    reusedAnnual: 0, reusedMonth: 0, commonFreePremium: 0 }
  let main

  const fixtures = [...Object.entries(births), ['CS-005 past Daewoon', births['CS-005']]]
  for (const [name, birth] of fixtures) {
    // A second evaluation inside the same source-backed CS-005 Daewoon.
    const referenceTime = name === 'CS-005 past Daewoon' ? '2024-01-15T00:00:00.000Z' : currentReference
    const judgment = freeze(runInternalReading({
      birth: { date: birth.date, time: { known: true, value: birth.time }, gender: '女性', timeCorrectionMode: 'none' },
      calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: Number(referenceTime.slice(0, 4)) },
      executionId: `p4f-${name}`, sources,
      natalInspectionPeriod: period('inspection', `${referenceTime.slice(0, 4)}-01-01T00:00:00.000Z`,
        `${referenceTime.slice(0, 4)}-02-01T00:00:00.000Z`),
      ...(name === 'CS-005' && {
        monthlyWindowStart: { year: 2026, month: 11 },
        dailyLuck: { pillar: { stem: { id: 'p4f-day-stem', value: day[0] }, branch: { id: 'p4f-day-branch', value: day[1] } },
          validity: period('p4f-day', '2027-01-14T15:00:00.000Z', '2027-01-15T15:00:00.000Z') },
      }),
    }))
    const canonical = judgment.canonical
    const natal = judgment.judgmentCore[0]
    const months = judgment.luck.monthlyWindow ?? []
    const snapshots = byId([...judgment.judgmentCore, ...months.map(month => month.judgmentCore).filter(Boolean)])
    const personality = freeze(buildNatalPersonality(canonical.chart))
    const before = JSON.stringify({ judgment, personality })
    const facts = freeze(relationshipOutcomeFromReading({ judgment }))
    const index = byId(facts)
    assert.equal(index.size, facts.length)
    const palace = facts.find(fact => fact.semanticType === 'relationship_palace_context')
    assert.equal(canonical.chart.pillars.day.status, 'confirmed')
    assert.equal(palace.branch, canonical.chart.pillars.day.value.branch)
    const [palaceId] = palace.sourceParticipantIds
    assert.equal(natal.formationBranchPool.find(item => item.id === palaceId).branch, palace.branch)
    const positions = ['year', 'month', 'time']
    const natalRelations = facts.filter(fact => fact.scope === 'natal' && fact.sourceRelationIds.length)

    for (const fact of facts) {
      const snapshot = snapshots.get(fact.scopeId)
      assert.ok(snapshot)
      assert.equal(fact.scope, scopeNames[snapshot.scope])
      assert.deepEqual(fact.sourceJudgmentIds, [snapshot.id])
      assert.ok(fact.provenance.length)
      assert.ok(allowedTypes.includes(fact.semanticType))
      if (fact.scope !== 'natal') assert.deepEqual(fact.period, snapshot.validity)
      const participants = byId(snapshot.formationBranchPool)
      for (const id of fact.sourceParticipantIds) assert.ok(participants.has(id) || snapshot.directEntityIds.includes(id))
      for (const id of fact.sourceRoleIds) assert.ok(snapshot.roleEngine.roleHistory.some(role => role.roleId === id
        && fact.sourceParticipantIds.includes(role.entityId)))
      for (const id of fact.sourceLuckEffectIds) {
        assert.ok(snapshot.luckEffectHistory.some(event => event.id === id))
        assert.ok(snapshot.luckEffectStates.some(state => state.event.id === id && state.originScopeId === snapshot.id
          && fact.sourceRelationIds.includes(state.event.sourceRelationFactId)))
      }
      for (const id of fact.sourceRelationIds) {
        const relation = [...snapshot.branchFacts, ...snapshot.formationFacts].find(item => item.id === id)
        assert.ok(relation?.participants.includes(palaceId))
        assert.equal(relation.kind, fact.relationKind)
        assert.deepEqual(fact.sourceParticipantIds, sorted(relation.participants))
        assert.ok(relation.participants.some(participant => participant !== palaceId && participants.get(participant)?.scope === snapshot.scope))
        assert.ok(relationKinds.includes(relation.kind))
        if (fact.semanticType === 'relationship_contact_signal') assert.deepEqual(fact.possibleInterpretations, ['contact', 'change'])
        if (fact.semanticType === 'relationship_change_signal') assert.deepEqual(fact.possibleInterpretations, ['change'])
        if (relation.kind === 'half') assert.equal(fact.semanticType, 'relationship_palace_relation')
        if (fact.scope !== 'natal') assert.notEqual(fact.certainty, 'confirmed')
      }
      if (fact.semanticType === 'relationship_significator') {
        const [entity] = fact.sourceParticipantIds
        const position = positions.find(position => entity === 'entity:' + JSON.stringify([`/chart/pillars/${position}/value/ganZhi`, 'stem']))
        assert.ok(position)
        assert.equal(fact.tenGod, canonical.chart.basicRelations[position].value.stemTenGod)
        const upstreamGods = natal.stemFacts.flatMap(({ source, target }) => [source, target]).filter(item => item.id === entity)
        assert.ok(upstreamGods.every(item => item.tenGod === fact.tenGod))
        const runtime = natal.runtime.find(item => item.entityId === entity)?.state
        if (runtime === 'stopped') {
          assert.equal(fact.currentFunction, 'inactive')
          assert.equal(fact.currentlyEffective, false)
          tallies.stopped++
        }
        if (runtime === 'weakened') {
          assert.equal(fact.currentFunction, 'reduced')
          assert.equal(fact.certainty, 'contextual')
          tallies.reduced++
        }
        for (const fn of fact.structuralFunctions) {
          const role = natal.roleEngine.currentRoles.find(item => item.roleId === fn.roleId)
          assert.equal(fn.state, role.currentState)
          assert.equal(fn.function, role.currentFunction)
        }
      }
      tallies.withProvenance++
    }

    for (const snapshot of snapshots.values()) {
      if (snapshot.scope === 'dailyLuck') {
        assert.ok(facts.every(fact => fact.scopeId !== snapshot.id))
        continue
      }
      for (const relation of snapshot.branchFacts.filter(item => item.participants.includes(palaceId)
        && ['punishment', 'break', 'harm'].includes(item.kind))) {
        assert.ok(facts.every(fact => !fact.sourceRelationIds.includes(relation.id)))
        tallies.excludedRelations++
      }
      const sameScope = facts.filter(fact => fact.scopeId === snapshot.id)
      if (sameScope.some(fact => fact.semanticType === 'relationship_contact_signal')
        && sameScope.some(fact => fact.semanticType === 'relationship_change_signal')) tallies.coexistence++
    }

    const reverse = snapshot => ({
      ...snapshot, branchFacts: [...snapshot.branchFacts].reverse(), formationFacts: [...snapshot.formationFacts].reverse(),
      actualFunctions: [...snapshot.actualFunctions].reverse(), luckEffectStates: [...snapshot.luckEffectStates].reverse(),
      luckEffectHistory: [...snapshot.luckEffectHistory].reverse(),
      roleEngine: { ...snapshot.roleEngine, roleHistory: [...snapshot.roleEngine.roleHistory].reverse(),
        currentRoles: [...snapshot.roleEngine.currentRoles].reverse() },
    })
    const reordered = { ...judgment, judgmentCore: [...judgment.judgmentCore].reverse().map(reverse),
      luck: { ...judgment.luck, monthlyWindow: [...months].reverse().map(month => ({
        ...month, judgmentCore: month.judgmentCore && reverse(month.judgmentCore),
      })) } }
    assert.deepEqual(relationshipOutcomeFromReading({ judgment: reordered }), facts)
    const allFactIds = facts.map(fact => fact.id)
    assert.deepEqual(relationshipOutcomeFromReading({ judgment }).map(fact => fact.id), allFactIds)
    assert.deepEqual(relationshipOutcomeFromReading({ judgment }), facts)

    const input = { judgment, personality, relationshipOutcomes: facts, productScope: 'premium' }
    const premium = freeze(assembleReading(input))
    const originalAssembly = JSON.stringify(premium)
    assert.deepEqual(assembleReading(input), premium)
    const free = assembleReading({ ...input, productScope: 'free' })
    validateReadingAssembly(premium)
    validateReadingAssembly(free)
    assert.equal(premium.customerRenderable, false)
    assert.equal(free.customerRenderable, false)
    assert.ok(premium.chapters.every(chapter => !chapter.customerRenderable))
    assert.equal(JSON.stringify({ judgment, personality }), before)
    assert.equal(JSON.stringify(premium), originalAssembly)
    const units = relationshipUnits(premium)
    const shared = relationshipUnits(free)
    assert.ok(shared.every(unit => unit.scope === 'natal'))
    for (const unit of shared) assert.deepEqual(unit, units.find(item => item.id === unit.id))
    assert.equal(shared.length, 0)
    tallies.commonFreePremium += shared.length
    const chapter = id => premium.chapters.find(item => item.id === id)
    assert.equal(chapter('CH-06').readiness, 'partial')
    for (const id of ['CH-04', 'CH-05', 'CH-07']) assert.equal(chapter(id).readiness, 'outcome_not_implemented')
    for (const unit of units) {
      const fact = index.get(unit.meaningRef.recordId)
      assert.ok(fact)
      assert.equal(unit.scope, fact.scope)
      assert.equal(unit.meaningRef.scopeId, fact.scopeId)
      assert.equal(unit.certainty, fact.certainty)
      assert.equal(unit.lifecycle, fact.lifecycle)
      assert.equal(unit.currentFunction, fact.currentFunction)
      assert.deepEqual(unit.period, fact.period)
      assert.deepEqual(unit.sourceFactIds, sorted([...fact.sourceJudgmentIds, ...fact.sourceRelationIds, ...fact.sourceParticipantIds]))
      assert.deepEqual(unit.sourceRoleIds, fact.sourceRoleIds)
      assert.deepEqual(unit.sourceEffectIds, fact.sourceLuckEffectIds)
      assert.deepEqual(unit.evidenceIds, sorted(fact.provenance))
      assert.deepEqual(unit.sourcePersonalityFactIds, [])
      assert.ok(!['stopped', 'inactive', 'deferred'].includes(fact.lifecycle) && fact.temporalStatus !== 'expired')
      const occurrences = premium.chapters.flatMap(section => section.placements.filter(item => item.unitId === unit.id)
        .map(item => [section.id, item.role]))
      assert.deepEqual(occurrences, [['CH-06', 'conclusion'], ...(unit.scope === 'sewoon' ? [['CH-09', 'timing']]
        : unit.scope === 'month' ? [['CH-09', 'context'], ['CH-10', 'timing']] : [])])
      if (unit.scope === 'sewoon') tallies.reusedAnnual++
      if (unit.scope === 'month') tallies.reusedMonth++
    }
    const currentContact = facts.find(fact => fact.currentlyEffective && fact.semanticType === 'relationship_contact_signal')
    const currentChange = facts.find(fact => fact.currentlyEffective && fact.semanticType === 'relationship_change_signal')
    if (currentContact && currentChange) {
      for (const fact of [currentContact, currentChange]) {
        assert.ok(Date.parse(fact.period.from.instant) <= Date.parse(referenceTime)
          && Date.parse(referenceTime) < Date.parse(fact.period.to.instant))
        assert.ok(units.some(unit => unit.meaningRef.recordId === fact.id && unit.scope === fact.scope))
      }
      if (currentContact.scope !== currentChange.scope) tallies.overlappingScopes++
    }
    assert.doesNotMatch(JSON.stringify([facts, units, shared]), forbidden)
    if (name === 'CS-005 past Daewoon') {
      const daewoon = judgment.judgmentCore.find(snapshot => snapshot.scope === 'greatLuck')
      assert.ok(facts.some(fact => fact.scopeId === daewoon.id && fact.scope === 'daewoon'
        && fact.currentlyEffective && fact.semanticType === 'relationship_contact_signal'))
    }
    if (name === 'CS-005') {
      assert.ok(judgment.judgmentCore.some(snapshot => snapshot.scope === 'dailyLuck'))
      assert.equal(months.length, 12)
      main = { judgment, natal, facts, months }
    }

    // Core recalculates the visible relation table per scope. A parent-only pair in
    // a child table must continue to reference its original outcome, never the child row.
    for (const fact of facts.filter(item => item.scope === 'sewoon' && item.currentlyEffective && item.relationKind === 'clash')) {
      for (const child of snapshots.values()) {
        if (child.scope !== 'monthlyLuck') continue
        const samePair = child.branchFacts.find(relation => relation.kind === fact.relationKind
          && JSON.stringify(sorted(relation.participants)) === JSON.stringify(fact.sourceParticipantIds))
        if (!samePair) continue
        assert.ok(facts.every(item => !item.sourceRelationIds.includes(samePair.id)))
        assert.ok(units.some(unit => unit.meaningRef.recordId === fact.id))
        tallies.inheritedPair++
      }
    }
    tallies.facts += facts.length
    tallies.natalContact += natalRelations.filter(fact => fact.relationKind !== 'clash').length
    tallies.natalChange += natalRelations.filter(fact => fact.relationKind === 'clash').length
    tallies.luckContact += facts.filter(fact => fact.semanticType === 'relationship_contact_signal').length
    tallies.luckChange += facts.filter(fact => fact.semanticType === 'relationship_change_signal').length
    tallies.significators += facts.filter(fact => fact.semanticType === 'relationship_significator').length
    summarize.push({ name, facts: facts.length, units: units.length, natalKinds: natalRelations.map(fact => fact.relationKind),
      luck: facts.filter(fact => fact.scope !== 'natal').map(fact => [fact.scope, fact.relationKind, fact.temporalStatus]),
      significators: facts.filter(fact => fact.semanticType === 'relationship_significator').map(fact => [fact.tenGod, fact.lifecycle]) })
    console.log('FIXTURE', JSON.stringify(summarize.at(-1)))
  }

  const { judgment, natal, facts, months } = main
  const january = months.find(month => month.calendarYear === 2027 && month.calendarMonth === 1)
  const contact = facts.find(fact => fact.scopeId === january.judgmentCore.id && fact.semanticType === 'relationship_contact_signal')
  assert.equal(contact.currentlyEffective, true)
  assert.equal(contact.relationKind, 'six_combination')
  assert.equal(contact.lifecycle, 'active')
  const boundaryChart = { ...judgment.canonical, context: { ...judgment.canonical.context, referenceTime: january.endInstant } }
  const history = buildRelationshipOutcome({ canonical: boundaryChart, natal,
    luck: [{ snapshot: january.judgmentCore, evaluatedAt: january.referenceTime }] })
  const expired = history.find(item => item.id === contact.id)
  assert.equal(expired.currentlyEffective, false)
  assert.equal(expired.temporalStatus, 'expired')
  assert.deepEqual(expired.sourceRelationIds, contact.sourceRelationIds)
  const boundaryReading = assembleReading({ canonical: boundaryChart, productScope: 'premium', relationshipOutcomes: history })
  validateReadingAssembly(boundaryReading)
  assert.ok(relationshipUnits(boundaryReading).every(item => item.meaningRef.recordId !== expired.id))

  assert.ok(tallies.luckContact && tallies.luckChange && tallies.natalContact
    && tallies.inheritedPair && tallies.overlappingScopes && tallies.reusedAnnual && tallies.reusedMonth)
  for (const directory of ['judgment', 'personality']) {
    const root = new URL(`../src/lib/${directory}/`, import.meta.url)
    for (const name of readdirSync(root, { recursive: true }).filter(file => file.endsWith('.ts'))) {
      assert.doesNotMatch(readFileSync(new URL(name, root), 'utf8'), /(?:from\s+|import\s*\()\s*['"][^'"]*\/outcome(?:\/|['"])/u)
    }
  }
  const outcomeRoot = new URL('../src/lib/outcome/', import.meta.url)
  for (const name of readdirSync(outcomeRoot, { recursive: true }).filter(file => file.endsWith('.ts'))) {
    assert.doesNotMatch(readFileSync(new URL(name, outcomeRoot), 'utf8'),
      /\b(?:runJudgmentCore|runInternalReading|calculateTenGod|branchRelations|calculateMonthlyLuck|calculateCanonicalChart|fetch)\s*\(/u)
  }
  console.log('METRICS', JSON.stringify(tallies))
  console.log('P4-F relationship outcome integration PASS')
} finally {
  await server.close()
}
