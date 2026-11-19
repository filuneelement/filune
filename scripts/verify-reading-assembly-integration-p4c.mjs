import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze, loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const authority = name => read(`src/docs/source/authority/${name}.md`)
const chapter = (reading, id) => reading.chapters.find(item => item.id === id)
const kind = (reading, name) => reading.semanticUnits.filter(unit => unit.meaningRef.kind === name)
const reverse = items => [...items].reverse()
const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const scopes = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month', dailyLuck: 'day' }

try {
  const { assembleReading, validateReadingAssembly } = await load('reading/index')
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { applyStructuralRoleModifiers, buildNatalPersonality, buildCurrentPersonality } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { projectCurrentPersonalityScopes } = await load('personalityCurrentReading')
  const { calculateEightChar } = await load('calculateEightChar')

  function verifyProvenance(reading, input) {
    const { judgment, personality } = input
    const canonical = input.canonical ?? judgment?.canonical
    const resolveCanonical = pointer => pointer.replace(/^\//u, '').split('/')
      .reduce((value, key) => value?.[key], canonical)
    const natal = personality?.natal ?? personality
    const months = judgment?.luck.monthlyWindow ?? []
    const snapshots = [...(judgment?.judgmentCore ?? []), ...(input.luckScopes ?? []),
      ...months.flatMap(month => month.judgmentCore ? [month.judgmentCore] : [])]
    const facts = new Set(judgment?.diagnostics.facts.map(fact => fact.id))
    for (const evidence of judgment?.diagnostics.evidence ?? []) {
      for (const id of evidence.sourceRef?.outputRefs ?? []) facts.add(id)
    }
    const roles = new Set(judgment?.natal.roles.map(role => role.roleStateId))
    const events = new Set(personality?.effectHistory?.map(event => event.id))
    const personalityFacts = new Map([...(natal?.facts ?? []), ...(personality?.temporaryFacts ?? [])].map(fact => [fact.id, fact]))
    const conflicts = new Set([...(natal?.conflicts ?? []), ...(personality?.conflicts ?? [])].map(conflict => conflict.id))
    const modifiers = new Map([...(natal?.structuralRoleModifiers ?? []),
      ...(personality?.structuralRoleModifiers ?? [])].map(modifier => [modifier.id, modifier]))
    for (const snapshot of snapshots) {
      facts.add(snapshot.patternContext.id)
      for (const id of snapshot.directEntityIds) facts.add(id)
      for (const fact of snapshot.stemFacts) [fact.id, fact.source.id, fact.target.id].forEach(id => facts.add(id))
      for (const fact of snapshot.branchFacts) [fact.id, ...fact.participants].forEach(id => facts.add(id))
      for (const fact of snapshot.formationFacts) facts.add(fact.id)
      for (const role of snapshot.roleEngine.roleHistory) {
        roles.add(role.roleId)
        // Some role paths are published as references to prior scope evidence.
        role.pathRefs.forEach(id => facts.add(id))
      }
      for (const role of snapshot.roleEngine.currentRoles) role.pathRefs.forEach(id => facts.add(id))
      for (const event of snapshot.luckEffectHistory) {
        events.add(event.id)
        if (event.sourceRelationFactId) facts.add(event.sourceRelationFactId)
      }
    }
    for (const month of months) {
      for (const stage of month.stages.filter(stage => stage.stageId === 'monthlyLuck')) stage.resultRefs.forEach(id => facts.add(id))
      for (const fact of month.relationFacts) facts.add(fact.relationFactId)
      for (const role of month.natalRoles) roles.add(role.roleStateId)
    }
    for (const modifier of modifiers.values()) {
      roles.add(modifier.sourceRoleId)
      modifier.sourceFactIds.forEach(id => facts.add(id))
    }
    for (const fact of personality?.currentFacts ?? []) {
      for (const origin of fact.origins) origin.sourceLuckFactIds.forEach(id => facts.add(id))
    }
    for (const unit of reading.semanticUnits) {
      const { recordId, scopeId, kind } = unit.meaningRef
      const snapshot = snapshots.find(item => item.id === scopeId)
      if (kind === 'canonical_value') {
        const [version, ...parts] = recordId.split(':/')
        assert.equal(version, canonical.context.calculationVersion.id)
        const pointed = resolveCanonical(parts.join(':/'))
        assert.notEqual(pointed, undefined, recordId)
        facts.add(`canonical:${recordId}`)
      }
      if (kind === 'scope_snapshot' || kind === 'role_function') {
        assert.equal(scopes[snapshot?.scope], unit.scope, recordId)
      }
      if (kind === 'role_function') {
        const role = snapshot.roleEngine.currentRoles.find(role => role.roleId === recordId)
        assert.equal(unit.currentFunction, role?.currentFunction)
        assert.equal(unit.lifecycle, role?.currentState)
      }
      if (kind === 'relation') assert.ok([...snapshot.stemFacts, ...snapshot.branchFacts].some(fact => fact.id === recordId))
      if (kind === 'pattern') assert.ok(judgment?.natal.pattern.judgmentId === recordId || snapshot?.patternContext.id === recordId)
      if (kind === 'role_assignment') assert.ok(roles.has(recordId))
      if (kind === 'personality_modifier') assert.ok(modifiers.has(recordId))
      if (kind === 'personality_conflict') assert.ok(conflicts.has(recordId))
      if (kind === 'structural_function') {
        const actual = snapshot.actualFunctions.find(item => item.relationFactId === recordId)
        assert.equal(unit.direction, actual.direction)
        assert.equal(unit.currentFunction, actual.function)
      }
      if (kind === 'personality_fact') {
        const fact = personalityFacts.get(recordId)
        assert.ok(fact)
        assert.equal(unit.certainty, fact.status === 'active' ? 'confirmed' : fact.status)
      }
      if (kind === 'current_personality_fact') {
        const fact = personality.currentFacts.find(item => item.personalityFactId === recordId && item.currentlyEffective)
        assert.ok(fact)
        assert.equal(unit.scope, personality.evaluationScope)
        assert.equal(unit.lifecycle, fact.state)
      }
      if (kind === 'luck_effect') {
        const event = snapshots.flatMap(s => s.luckEffectHistory).find(event => event.id === recordId)
        assert.ok(event)
        assert.equal(unit.scope, scopes[event.originScope])
        assert.equal(scopeId, event.originScopeId)
      }
      for (const [ids, source] of [[unit.sourceFactIds, facts], [unit.sourceRoleIds, roles],
        [unit.sourceEffectIds, events], [unit.sourcePersonalityFactIds, personalityFacts], [unit.sourceConflictIds, conflicts]]) {
        for (const id of ids) assert.ok(source.has(id) || (source === facts && id.startsWith('canonical:/')
          && resolveCanonical(id.slice('canonical:'.length)) !== undefined), `Orphan ${id} in ${recordId}`)
      }
    }
  }

  function check(input, label) {
    const before = structuredClone(input)
    const premium = assembleReading(freeze({ ...input, productScope: 'premium' }))
    const free = assembleReading({ ...input, productScope: 'free' })
    for (const result of [premium, free]) {
      validateReadingAssembly(result)
      verifyProvenance(result, input)
      assert.equal(result.customerRenderable, false)
      assert.ok(result.semanticUnits.every(unit => unit.scope !== 'day'))
      const units = new Map(result.semanticUnits.map(unit => [unit.id, unit]))
      const placements = result.chapters.flatMap(section => section.placements.map(p =>
        JSON.stringify([units.get(p.unitId).semanticKey, p.role])))
      assert.equal(new Set(placements).size, placements.length)
      for (const section of result.chapters) {
        for (const selection of section.selections) {
          assert.equal(selection.selectionStatus, 'deferred')
          assert.deepEqual(selection.selectedUnitIds, [])
          assert.ok(section.gaps.some(gap => gap.type === 'selection_rule_missing'))
        }
      }
    }
    assert.deepEqual(premium.chapters.map(item => item.id), ['F-01','F-02','F-03','F-04','F-LINK',
      'CH-01','CH-02','CH-03','CH-04','CH-05','CH-06','CH-07','CH-08','CH-09','CH-10','CH-11','CH-Q'])
    assert.deepEqual(free.chapters, premium.chapters.slice(0, 5))
    assert.ok(free.semanticUnits.every(unit => unit.scope === 'natal'))
    const byId = new Map(premium.semanticUnits.map(unit => [unit.id, unit]))
    for (const unit of free.semanticUnits) assert.deepEqual(byId.get(unit.id), unit)
    for (const id of ['CH-04', 'CH-05', 'CH-06', 'CH-07', 'CH-Q']) {
      const section = chapter(premium, id)
      assert.notEqual(section.readiness, 'ready')
      assert.ok(section.gaps.length)
      assert.deepEqual(section.placements, [])
    }
    assert.deepEqual(assembleReading({ ...input, productScope: 'premium' }), premium)
    assert.deepEqual(input, before)
    assert.doesNotMatch(JSON.stringify(premium), /"(?:textKo|textJa|textEn|bestMonth|worstMonth|topMonth|score|rank)":/u)
    console.log(`PASS ${label}: ${premium.semanticUnits.length} premium / ${free.semanticUnits.length} free units`)
    return premium
  }

  // P1 closure inputs exercise real lifecycle projections independently of calendar coverage.
  const during = '2027-07-01T00:00:00Z'
  const boundary = '2028-01-01T00:00:00Z'
  const old = period('old', '2027-01-01T00:00:00Z', boundary)
  const next = period('next', boundary, '2029-01-01T00:00:00Z')
  const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
  const run = (luck, referenceTime = during, priorHistory) => runJudgmentCore({
    executionId: 'p4c-p1-closure', natal: { day: pillar('day', '甲', '寅'), month: pillar('officer', '辛', '酉'),
      year: pillar('standby', '癸', '子') }, natalValidity: period('natal', '2000-01-01T00:00:00Z', '2100-01-01T00:00:00Z'),
    natalCombinations: [], luck, referenceTime, priorHistory,
  })
  const lifecycle = run([
    { scope: 'greatLuck', pillar: pillar('threat', '丁', '巳'), validity: old },
    { scope: 'yearlyLuck', pillar: pillar('annual', '乙', '丑'), validity: old },
    { scope: 'monthlyLuck', pillar: pillar('monthly', '己', '未'), validity: old },
  ])
  const activation = lifecycle[1].luckEffectHistory.find(item => item.effectType === 'activates_sangshen_function')
  assert.ok(activation)
  const live = check({ luckScopes: lifecycle, referenceTime: during }, 'P1 closure active and inherited')
  assert.deepEqual(assembleReading({ luckScopes: reverse(lifecycle), referenceTime: during, productScope: 'premium' }), live)
  const activationUnits = kind(live, 'luck_effect').filter(unit => unit.meaningRef.recordId === activation.id)
  assert.equal(activationUnits.length, 1)
  const [unit] = activationUnits
  assert.equal(unit.scope, 'daewoon')
  assert.equal(unit.meaningRef.scopeId, activation.originScopeId)
  assert.deepEqual(unit.period, activation.originPeriod)
  assert.deepEqual(unit.effectProjections.map(p => p.scope).sort(), ['daewoon', 'month', 'sewoon'])
  for (const projection of unit.effectProjections) {
    const source = lifecycle.find(snapshot => snapshot.id === projection.scopeId)
    assert.equal(scopes[source.scope], projection.scope)
    assert.ok(source.luckEffectStates.some(state => state.event.id === activation.id
      && state.currentlyEffective && state.inherited === projection.inherited))
  }
  const replacement = run([{ scope: 'greatLuck', pillar: pillar('next-luck', '己', '未'), validity: next }], boundary, lifecycle[1])
  assert.ok(replacement.at(-1).luckEffectStates.some(state => state.event.id === activation.id && state.expired))
  const expired = check({ luckScopes: replacement, referenceTime: boundary }, 'P1 closure expired')
  assert.ok(expired.historyEffectIds.includes(activation.id))
  assert.ok(expired.semanticUnits.every(item => !item.sourceEffectIds.includes(activation.id)))

  const fixtures = Object.fromEntries((await loadPersonalityRendererFixtures(load)).map(([id, , fixture]) => [id, fixture]))
  for (const id of ['E', 'I', 'J', 'K', 'L']) {
    const fixture = fixtures[id]
    const reading = check({ personality: fixture.current ?? fixture.natal, luckScopes: fixture.snapshots,
      referenceTime: '2027-01-01T00:00:00.000Z' }, `P3 engine fixture ${id}`)
    const natalRoles = fixture.snapshots?.[0]?.roleEngine.roleHistory ?? []
    if (id === 'I') {
      assert.ok(natalRoles.every(role => !role.role.includes('Byeong')))
      assert.ok(reading.semanticUnits.every(item => item.topic !== 'challenge' || item.meaningRef.kind !== 'personality_modifier'))
    }
    if (id === 'E') {
      const conditional = natalRoles.find(role => role.role === 'ConditionalByeong')
      assert.ok(conditional)
      const paired = natalRoles.filter(role => role.entityId === conditional.entityId)
      assert.ok(paired.length > 1)
      assert.ok(paired.every(role => kind(reading, 'role_assignment').some(item => item.sourceRoleIds.includes(role.roleId))))
    }
    if (id === 'J') {
      const stopped = fixture.snapshots.flatMap(snapshot => snapshot.roleEngine.currentRoles
        .filter(role => ['stopped', 'inactive'].includes(role.currentState)).map(role => [snapshot.id, role.roleId]))
      assert.ok(stopped.length)
      for (const [scopeId, roleId] of stopped) assert.ok(kind(reading, 'role_function')
        .every(item => item.meaningRef.scopeId !== scopeId || !item.sourceRoleIds.includes(roleId)))
    }
    if (id === 'K') {
      const reduced = reading.semanticUnits.filter(item => item.currentFunction === 'reduced' || item.sourceStatus === 'reduced')
      assert.ok(reduced.length && reduced.every(item => ['contextual', 'conditional'].includes(item.certainty)))
    }
    if (id === 'L') {
      const temporaryIds = new Set(fixture.current.temporaryFacts.map(fact => fact.id))
      assert.ok(kind(reading, 'current_personality_fact').some(item =>
        item.scope !== 'natal' && temporaryIds.has(item.meaningRef.recordId)))
    }
  }

  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const birthFixture = births['CS-005']
  const referenceTime = '2027-01-15T00:00:00.000Z'
  const day = calculateEightChar({ year: 2027, month: 1, day: 15, hour: 9, minute: 0 }).day
  const input = {
    birth: { date: birthFixture.date, time: { known: true, value: birthFixture.time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'p4c-cs005', natalInspectionPeriod: period('natal-inspection', '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z'),
    sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
      D: authority('D_rev152'), approval: authority('25-7_rev16') },
  }
  // Evaluate at the real daily pillar for the reference instant (09:00 KST / JST).
  const judgment = runInternalReading({ ...input, monthlyWindowStart: { year: 2026, month: 11 },
    dailyLuck: { pillar: pillar('p4c-reference-day', day[0], day[1]),
      validity: period('p4c-day', '2027-01-14T15:00:00.000Z', '2027-01-15T15:00:00.000Z') } })
  function personalityFor(result, withCurrent) {
    const natal = applyStructuralRoleModifiers(buildNatalPersonality(result.canonical.chart),
      projectNatalStructuralReading(result.judgmentCore.find(s => s.scope === 'natal')))
    return withCurrent ? buildCurrentPersonality({ natalPersonality: natal, evaluationScope: 'month',
      referenceTime, structuralScopes: projectCurrentPersonalityScopes(result.judgmentCore, natal.dayStem, referenceTime) }) : natal
  }
  const personality = personalityFor(judgment, true)
  const premium = check({ judgment, personality }, 'CS-005 birth to reading')
  const nativeTemporary = new Set(personality.temporaryFacts.map(fact => fact.id))
  assert.ok(kind(premium, 'current_personality_fact').some(unit =>
    unit.scope === 'month' && nativeTemporary.has(unit.meaningRef.recordId)))
  assert.ok(judgment.judgmentCore.some(s => s.scope === 'dailyLuck'))
  assert.ok(premium.engineScopes.includes('day'))
  assert.ok(kind(premium, 'scope_snapshot').some(unit => unit.scope === 'daewoon'))
  assert.ok(kind(premium, 'scope_snapshot').some(unit => unit.scope === 'sewoon'))
  assert.ok(chapter(premium, 'CH-09').gaps.some(gap => gap.id === 'CH-09:sewoon-coverage'))
  assert.ok(chapter(premium, 'F-03').availableUnitIds.length)
  assert.equal(chapter(premium, 'CH-02').readiness, 'partial')
  let shared = 0
  for (const placement of chapter(premium, 'F-03').placements) {
    const later = chapter(premium, 'CH-02').placements.find(item => item.unitId === placement.unitId)
    if (!later) continue
    assert.equal(placement.role, 'conclusion')
    assert.equal(later.role, 'context')
    assert.ok(later.contextIds.length)
    assert.equal(premium.semanticUnits.find(item => item.id === placement.unitId).firstOccurrenceChapterId, 'F-03')
    shared++
  }
  assert.ok(shared)
  assert.deepEqual(chapter(premium, 'CH-03').selections, chapter(premium, 'F-04').selections)
  const months = kind(premium, 'monthly_snapshot')
  const window = judgment.luck.monthlyWindow
  assert.equal(months.length, 12)
  assert.equal(window.length, 12)
  let expiredProjections = 0
  for (const [index, item] of months.entries()) {
    const source = window[index]
    assert.equal(item.meaningRef.recordId, source.scopeId)
    assert.equal(item.scope, 'month')
    assert.deepEqual(item.period, source.effectivePeriod)
    assert.deepEqual([item.month.startInstant, item.month.endInstant, item.month.pillar, item.month.parentSewoonId],
      [source.startInstant, source.endInstant, source.pillar, source.parentSewoonId])
    assert.equal(item.month.snapshotId, source.judgmentCore?.id ?? null)
    assert.equal(item.month.patternContextId, source.judgmentCore?.patternContext.id)
    assert.deepEqual(item.month.runtimeStateIds, [...new Set(source.runtimeStates.map(state => state.stateId))].sort())
    assert.deepEqual(item.month.roleFunctionIds,
      [...new Set(source.roleFunctions.map(role => role.postEffect.roleFunctionStateId))].sort())
    const at = Date.parse(source.referenceTime)
    const active = source.judgmentCore?.luckEffectStates.filter(state => state.currentlyEffective && !state.expired
      && Date.parse(state.originPeriod.from.instant) <= at && at < Date.parse(state.originPeriod.to.instant)) ?? []
    assert.deepEqual(item.sourceEffectIds, [...new Set(active.map(state => state.event.id))].sort())
    for (const state of source.judgmentCore?.luckEffectStates ?? []) {
      if (!state.expired) continue
      expiredProjections++
      assert.ok(!item.sourceEffectIds.includes(state.event.id))
    }
    assert.deepEqual(item.month.stageStatus, source.stageStatus)
    assert.deepEqual(item.sourceRoleIds, [...new Set(source.natalRoles.map(role => role.roleStateId))].sort())
    assert.deepEqual(item.sourceFactIds, [...new Set([
      ...source.stages.filter(stage => stage.stageId === 'monthlyLuck').flatMap(stage => stage.resultRefs),
      ...source.relationFacts.map(fact => fact.relationFactId),
    ])].sort())
    assert.equal(item.certainty, source.status)
    assert.ok(chapter(premium, 'CH-10').availableUnitIds.includes(item.id))
    if (index) assert.equal(months[index - 1].month.endInstant, item.month.startInstant)
  }
  assert.ok(expiredProjections > 0)
  console.log(`PASS 12 real contiguous solar months ${months[0].month.startInstant}–${months.at(-1).month.endInstant}, B-6 shared ${shared}, expired projections excluded ${expiredProjections}`)

  const reordered = {
    ...judgment,
    judgmentCore: reverse(judgment.judgmentCore).map(s => ({ ...s, stemFacts: reverse(s.stemFacts),
      branchFacts: reverse(s.branchFacts), actualFunctions: reverse(s.actualFunctions),
      luckEffectStates: reverse(s.luckEffectStates), luckEffectHistory: reverse(s.luckEffectHistory) })),
    diagnostics: { ...judgment.diagnostics, facts: reverse(judgment.diagnostics.facts) },
    luck: { ...judgment.luck, monthlyWindow: reverse(window) },
  }
  const reorderedPersonality = { ...personality, currentFacts: reverse(personality.currentFacts),
    temporaryFacts: reverse(personality.temporaryFacts), effectHistory: reverse(personality.effectHistory),
    natal: { ...personality.natal, facts: reverse(personality.natal.facts), conflicts: reverse(personality.natal.conflicts) } }
  assert.deepEqual(assembleReading({ judgment: reordered, personality: reorderedPersonality, productScope: 'premium',
    customerContext: { name: 'p4c-name', question: 'p4c-question', knownFacts: { sample: 'p4c-detail' } } }), premium)

  const conditional = runInternalReading({ ...input, executionId: 'p4c-cs126',
    birth: { ...input.birth, date: births['CS-126'].date, time: { known: true, value: births['CS-126'].time } } })
  const conditionalReading = check({ judgment: conditional, personality: personalityFor(conditional, true) }, 'CS-126 birth to reading')
  const conditionalRoles = conditional.judgmentCore[0].roleEngine.roleHistory.filter(role => role.role === 'ConditionalByeong')
  assert.ok(conditionalRoles.length)
  for (const role of conditionalRoles) assert.ok(kind(conditionalReading, 'role_assignment')
    .some(unit => unit.sourceRoleIds.includes(role.roleId) && unit.certainty === 'conditional'))
  assert.ok(judgment.judgmentCore[0].roleEngine.roleHistory.every(role => !role.role.includes('Byeong')))
  assert.ok(premium.semanticUnits.every(item => item.topic !== 'challenge' || item.meaningRef.kind !== 'personality_modifier'))
  const unknownBirth = { ...input.birth, time: { known: false } }
  assert.throws(() => runInternalReading({ ...input, executionId: 'p4c-unknown-hour', birth: unknownBirth }),
    /Four natal stems required/u)
  console.log('NOT_TESTABLE_WITH_CURRENT_PIPELINE: full unknown-hour Judgment requires four natal stems')
  const unknown = calculateCanonicalChart(unknownBirth, input.calculation)
  const unknownReading = check({ canonical: unknown, personality: buildNatalPersonality(unknown.chart) },
    'CS-005 birth time withheld (Canonical and Personality)')
  assert.ok(chapter(unknownReading, 'F-01').gaps.some(gap => gap.id.endsWith(':unknown-hour')))
  assert.ok(unknownReading.semanticUnits.every(item => !item.meaningRef.recordId.endsWith('/time')
    && item.sourcePersonalityFactIds.every(id => !id.includes(':hour_'))))
  const missing = assembleReading({ productScope: 'free' })
  validateReadingAssembly(missing)
  assert.deepEqual(missing.semanticUnits, [])
  assert.ok(chapter(missing, 'F-01').gaps.some(gap => gap.id === 'F-01:input'))
  assert.ok(chapter(missing, 'F-03').gaps.some(gap => gap.id === 'F-03:input'))
  for (const path of readdirSync(new URL('../src/lib/reading/', import.meta.url))) {
    if (!path.endsWith('.ts')) continue
    assert.doesNotMatch(read(`src/lib/reading/${path}`),
      /runInternalReading\(|runJudgmentCore\(|renderPersonality(?:Ko|Ja|En)\(|\bfetch\(|openai|Math\.random\(/iu)
  }
  console.log('PASS P4-C actual assembly integration')
} finally {
  await server.close()
}
