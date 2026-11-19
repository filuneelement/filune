import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze, loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const referenceTime = '2027-01-01T00:00:00.000Z'
const chapter = (result, id) => result.chapters.find(item => item.id === id)
const unitAt = (result, id, predicate) => {
  const units = new Map(result.semanticUnits.map(item => [item.id, item]))
  return chapter(result, id).placements.filter(item => predicate(units.get(item.unitId)))
}

try {
  const { assembleReading, chapterRegistry, validateReadingAssembly } = await load('reading/index')
  const fixtures = Object.fromEntries((await loadPersonalityRendererFixtures(load)).map(([id, , fixture]) => [id, fixture]))
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { buildNatalPersonality } = await load('personality/index')
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const assemble = input => {
    const result = assembleReading(freeze(input))
    validateReadingAssembly(result)
    return result
  }
  const inputs = id => ({
    personality: fixtures[id].current ?? fixtures[id].natal, luckScopes: fixtures[id].snapshots,
    referenceTime, productScope: 'premium',
  })
  const f = assemble({ ...inputs('L'), productScope: 'free' })
  const p = assemble(inputs('L'))
  const free = ['F-01', 'F-02', 'F-03', 'F-04', 'F-LINK']
  const premium = Array.from({ length: 11 }, (_, i) => `CH-${String(i + 1).padStart(2, '0')}`)
  assert.deepEqual(chapterRegistry.map(item => item.id), [...free, ...premium, 'CH-Q'])
  assert.deepEqual(f.chapters.map(item => item.id), free)
  assert.deepEqual(p.chapters.map(item => item.id), [...free, ...premium, 'CH-Q'])
  assert.ok(f.semanticUnits.every(unit => unit.scope === 'natal'))
  assert.deepEqual(f.historyEffectIds, [])
  assert.ok(!f.referenceTime)
  assert.deepEqual(f.chapters, p.chapters.slice(0, free.length))
  for (const unit of f.semanticUnits) assert.deepEqual(unit, p.semanticUnits.find(item => item.id === unit.id))
  assert.equal(chapter(f, 'F-LINK').placements.length, 0)
  assert.deepEqual(chapter(f, 'F-LINK').navigationChapterIds, ['CH-04', 'CH-05', 'CH-06', 'CH-07', 'CH-08', 'CH-10'])
  assert.ok(!p.customerRenderable && p.assemblyReady)
  console.log('PASS registry 17/17, nested product access and W-99 natal identity')

  const f3 = chapter(p, 'F-03').placements.find(item =>
    chapter(p, 'CH-02').placements.some(later => later.unitId === item.unitId))
  assert.ok(f3)
  assert.equal(f3.role, 'conclusion')
  const ch2 = chapter(p, 'CH-02').placements.find(item => item.unitId === f3.unitId)
  assert.equal(ch2.role, 'context')
  assert.ok(ch2.contextIds.length)
  for (const kind of ['strength', 'challenge']) {
    const base = chapter(p, 'F-04').selections.find(s => s.kind === kind)
    const later = chapter(p, 'CH-03').selections.find(s => s.kind === kind)
    assert.ok(base.candidateUnitIds.length)
    assert.deepEqual(base, later)
    assert.equal(base.selectionStatus, 'deferred')
    assert.deepEqual(base.selectedUnitIds, [])
  }
  assert.equal(chapter(p, 'F-04').availableUnitIds.length, 0)
  const six = {
    ...fixtures.L.natal, conflicts: [], structuralRoleModifiers: [],
    facts: Array.from({ length: 6 }, (_, i) => ({ ...fixtures.L.natal.facts[0], id: `synthetic-strength-${i}`, traitType: 'strength' })),
  }
  const sixReading = assemble({ personality: six, productScope: 'premium' })
  const top = chapter(sixReading, 'F-04').selections.find(item => item.kind === 'strength')
  assert.equal(top.candidateUnitIds.length, 6)
  assert.deepEqual(top.selectedUnitIds, [])
  assert.ok(chapter(sixReading, 'F-04').gaps.some(item => item.type === 'selection_rule_missing'))
  const three = assemble({ personality: { ...six, facts: six.facts.filter((_, index) => index % 2 === 0) }, productScope: 'free' })
  const deferredThree = chapter(three, 'F-04').selections.find(item => item.kind === 'strength')
  assert.equal(deferredThree.candidateUnitIds.length, 3)
  assert.equal(deferredThree.selectionStatus, 'deferred')
  assert.deepEqual(deferredThree.selectedUnitIds, [])
  assert.ok(unitAt(p, 'CH-01', item => item.scope === 'daewoon').some(first =>
    chapter(p, 'CH-08').placements.some(later => later.unitId === first.unitId && later.role === 'context')))
  console.log('PASS B-6 shared identities, candidate context and deferred selections')

  const reverse = list => [...list].reverse()
  const current = fixtures.L.current
  const shuffled = {
    ...current, currentFacts: reverse(current.currentFacts), temporaryFacts: reverse(current.temporaryFacts),
    scopeExpressions: reverse(current.scopeExpressions), conflicts: reverse(current.conflicts),
    structuralRoleModifiers: reverse(current.structuralRoleModifiers), effectHistory: reverse(current.effectHistory),
    natal: {
      ...current.natal, facts: reverse(current.natal.facts), positionExpressions: reverse(current.natal.positionExpressions),
      conflicts: reverse(current.natal.conflicts), structuralRoleModifiers: reverse(current.natal.structuralRoleModifiers),
    },
  }
  assert.deepEqual(assemble(inputs('L')), p)
  assert.deepEqual(assemble({ ...inputs('L'), personality: shuffled, luckScopes: reverse(inputs('L').luckScopes) }), p)
  assert.ok(p.semanticUnits.some(item => item.scope === 'daewoon' && item.meaningRef.kind === 'current_personality_fact'))
  assert.ok(p.semanticUnits.filter(item => item.meaningRef.kind === 'current_personality_fact').every(item => item.scope !== 'natal'))
  const expired = assemble({ ...inputs('L'), referenceTime: '2028-01-01T00:00:00.000Z' })
  assert.ok(expired.historyEffectIds.length)
  assert.ok(!expired.semanticUnits.some(item => item.scope !== 'natal'))
  const staleHistory = assemble({ ...inputs('L'), personality: {
    ...current, effectHistory: current.effectHistory.map(item => ({ ...item, expired: true, currentlyEffective: false })),
  } })
  assert.ok(!staleHistory.semanticUnits.some(item => item.meaningRef.kind === 'current_personality_fact'))
  const stopped = assemble(inputs('J'))
  const inactive = fixtures.J.current.structuralRoleModifiers.filter(item => item.status === 'inactive')
  assert.ok(inactive.length)
  assert.ok(inactive.every(role => stopped.semanticUnits.some(item => item.scope === 'natal' && item.sourceRoleIds.includes(role.sourceRoleId))
    && !stopped.semanticUnits.some(item => item.scope !== 'natal' && item.sourceRoleIds.includes(role.sourceRoleId))))
  const dual = assemble(inputs('E'))
  const roleIds = fixtures.E.natal.structuralRoleModifiers.filter(item => item.roleContext === 'conditional_byeong')
    .flatMap(item => [item.sourceRoleId, ...fixtures.E.natal.structuralRoleModifiers.filter(other =>
      other.sourceEntityId === item.sourceEntityId && other.sourceRole === 'yongshen').map(other => other.sourceRoleId)])
  assert.ok(new Set(roleIds).size >= 2)
  assert.ok(roleIds.every(id => dual.semanticUnits.some(item => item.scope === 'natal' && item.sourceRoleIds.includes(id))))
  const actuals = fixtures.E.snapshots[0].actualFunctions
  const functions = dual.semanticUnits.filter(unit => unit.meaningRef.kind === 'structural_function')
  assert.ok(functions.length)
  for (const unit of functions) {
    const source = actuals.find(item => item.relationFactId === unit.meaningRef.recordId)
    assert.equal(unit.direction, source.direction)
    assert.equal(unit.directionEvidence, source.evidenceStatus)
    if (source.evidenceStatus === 'SOURCE_INFERENCE') assert.notEqual(unit.certainty, 'confirmed')
  }
  const noByeong = assemble(inputs('I'))
  assert.ok(!noByeong.semanticUnits.some(item => item.topic === 'challenge' && item.meaningRef.kind === 'personality_modifier'))
  console.log('PASS stable IDs, source-only scopes, expiration, role history and coexistence')

  const unknownCanonical = calculateCanonicalChart({
    date: { year: 1985, month: 1, day: 4 }, time: { known: false }, gender: '男性', timeCorrectionMode: 'none',
  }, { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
  const unknown = assemble({ canonical: unknownCanonical, personality: buildNatalPersonality(unknownCanonical.chart), productScope: 'free' })
  assert.ok(chapter(unknown, 'F-01').gaps.some(item => item.id.endsWith(':unknown-hour')))
  assert.ok(!unknown.semanticUnits.some(item => item.meaningRef.recordId.endsWith('/time') || item.sourcePersonalityFactIds.some(id => id.includes(':hour_'))))

  const authority = name => read(`src/docs/source/authority/${name}.md`)
  const profile = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))['CS-005']
  const judgment = runInternalReading({
    birth: { date: profile.date, time: { known: true, value: profile.time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime: '2027-01-15T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
    executionId: 'p4b', natalInspectionPeriod: { periodId: 'natal-inspection',
      from: { kind: 'exact', instant: referenceTime }, to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } },
    sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
      D: authority('D_rev152'), approval: authority('25-7_rev16') },
  })
  const { canonical } = judgment
  const { applyStructuralRoleModifiers } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const canonicalPersonality = applyStructuralRoleModifiers(buildNatalPersonality(canonical.chart),
    projectNatalStructuralReading(judgment.judgmentCore[0]))
  assert.ok(judgment.judgmentCore.some(item => item.scope === 'yearlyLuck'))
  const native = assemble({ judgment, productScope: 'premium' })
  assert.ok(native.semanticUnits.some(item => item.meaningRef.kind === 'pattern' && item.sourceFactIds.length))
  assert.ok(native.semanticUnits.some(item => item.scope === 'sewoon'))
  for (const item of native.semanticUnits.filter(unit => unit.scope !== 'natal' && unit.meaningRef.kind === 'scope_snapshot')) {
    assert.equal(item.certainty, 'deferred')
    assert.equal(item.direction, undefined)
  }

  // Calendar-backed 12-vectors exercise the assembly contract without executing the monthly evaluator again.
  const stages = { calendar: 'confirmed', stemState: 'deferred', byeong: 'deferred', guEung: 'deferred',
    successState: 'deferred', functionEffects: 'deferred' }
  const window = canonical.monthlyLuck.cards.map((card, i) => ({
    monthIndex: i + 1, pillar: card.pillar, startInstant: card.startInstant, endInstant: card.endInstant,
    effectivePeriod: { periodId: `test-month-${i}`, from: { kind: 'exact', instant: card.startInstant },
      to: { kind: 'exact', instant: card.endInstant } },
    referenceTime: card.startInstant, scopeId: `test-month-scope-${i}`, parentSewoonId: 'fixture-sewoon',
    natalPatternRef: judgment.natal.pattern.judgmentId, natalRoles: judgment.natal.roles,
    relationFacts: judgment.luck.month.relations, runtimeStates: judgment.luck.month.runtimeStates,
    roleFunctions: judgment.luck.month.roleFunctions,
    stages: [{ ...judgment.luck.month.calendarStage, resultRefs: [`fixture-calendar-${i}`] }],
    evidenceRefs: ['fixture-calendar'], judgmentCore: null, status: 'deferred', stageStatus: stages,
  }))
  const reading = assemble({ judgment: { ...judgment, luck: { ...judgment.luck, monthlyWindow: reverse(window) } },
    personality: canonicalPersonality, productScope: 'premium',
    customerContext: { name: 'customer-marker', question: 'question-marker', knownFacts: { arbitrary: 'fact-marker' } } })
  const months = reading.semanticUnits.filter(item => item.meaningRef.kind === 'monthly_snapshot')
  assert.equal(months.length, 12)
  assert.deepEqual(months.map(item => item.month.startInstant), window.map(item => item.startInstant).sort())
  assert.ok(months.every(item => item.certainty === 'deferred' && item.direction === undefined && item.month.parentSewoonId === 'fixture-sewoon'))
  for (const item of months) {
    assert.ok(item.sourceFactIds.some(id => id.startsWith('fixture-calendar-')))
    assert.ok(judgment.luck.month.relations.every(relation => item.sourceFactIds.includes(relation.relationFactId)))
    assert.ok(judgment.luck.month.roleFunctions.every(role => item.month.roleFunctionIds.includes(role.postEffect.roleFunctionStateId)))
    assert.ok(judgment.luck.month.runtimeStates.every(state => item.month.runtimeStateIds.includes(state.stateId)))
  }
  assert.ok(chapter(reading, 'CH-10').selections.every(item => item.selectionStatus === 'deferred' && !item.selectedUnitIds.length))
  assert.doesNotMatch(JSON.stringify(reading), /"(?:bestMonth|worstMonth|score|rank)"|customer-marker|question-marker|fact-marker/u)
  for (const id of ['CH-04', 'CH-05', 'CH-06', 'CH-07']) {
    assert.equal(chapter(reading, id).readiness, 'outcome_not_implemented')
    assert.equal(chapter(reading, id).placements.length, 0)
  }
  assert.equal(chapter(reading, 'CH-Q').readiness, 'engine_gap')
  assert.equal(chapter(reading, 'CH-Q').placements.length, 0)
  assert.ok(judgment.canonical.chart.basicRelations.day.value.twelveStage)
  assert.ok(fixtures.E.natal.occurrences.some(item => item.tenGod === '偏財' || item.tenGod === '正財'))
  assert.deepEqual(chapter(dual, 'CH-05').placements, [])
  // Positive domain and question controls come from independent actual inputs.
  const withRelationshipTraits = assemble({ ...inputs('L'), customerContext: { question: 'Am I getting married?' } })
  assert.ok(fixtures.L.natal.facts.some(item => item.traitType === 'interpersonal'))
  assert.deepEqual(chapter(withRelationshipTraits, 'CH-06').placements, [])
  assert.deepEqual(chapter(withRelationshipTraits, 'CH-Q').placements, [])
  const withHealthQuestion = assemble({ judgment, productScope: 'premium', customerContext: { question: 'Is this a health risk?' } })
  assert.deepEqual(withHealthQuestion, native)
  const monthSnapshot = judgment.judgmentCore.find(item => item.scope === 'monthlyLuck')
  assert.ok(monthSnapshot)
  const withDay = assemble({ judgment, luckScopes: [{ ...monthSnapshot, scope: 'dailyLuck', id: 'fixture-day' }], productScope: 'premium' })
  assert.ok(withDay.engineScopes.includes('day'))
  assert.ok(!withDay.semanticUnits.some(item => item.scope === 'day'))
  console.log('PASS unknown hour, actual judgment adapter, 12 chronological month references, outcome guards and day exclusion')

  const bad = structuredClone(p)
  bad.semanticUnits.push(bad.semanticUnits[0])
  assert.throws(() => validateReadingAssembly(bad), /duplicate unit IDs/u)
  const noSource = structuredClone(p)
  for (const key of ['sourceFactIds', 'sourceRoleIds', 'sourceEffectIds', 'sourcePersonalityFactIds']) noSource.semanticUnits[0][key] = []
  assert.throws(() => validateReadingAssembly(noSource), /missing semantic provenance/u)
  const illegalSelection = structuredClone(p)
  chapter(illegalSelection, 'F-04').selections[0].selectedUnitIds.push(chapter(p, 'F-04').selections[0].candidateUnitIds[0])
  assert.throws(() => validateReadingAssembly(illegalSelection), /unsupported selection/u)
  assert.throws(() => validateReadingAssembly({ ...p, semanticUnits: p.semanticUnits.map((unit, index) =>
    index === 0 ? { ...unit, textEn: 'untrusted text' } : unit) }), /localized text/u)
  assert.throws(() => validateReadingAssembly({ ...f, semanticUnits: [...f.semanticUnits, p.semanticUnits.find(unit => unit.scope === 'daewoon')] }),
    /scope leakage/u)
  const dir = 'src/lib/reading'
  const architecture = readdirSync(new URL(`../${dir}/`, import.meta.url)).map(file => read(`${dir}/${file}`))
  assert.equal(architecture.filter(code => /export function assembleReading\(/u.test(code)).length, 1)
  for (const code of architecture) {
    assert.doesNotMatch(code, /runInternalReading\(|runJudgmentCore\(|renderPersonality(?:Ko|Ja|En)\(|\bfetch\(|openai|Math.random\(/iu)
    assert.doesNotMatch(code, /import(?! type)[^\n]+from ['"]\.\.\/(?:judgment|personality|canonical)\//u)
  }
  console.log('PASS validation rejects duplicate/missing provenance and assembly has no runtime engine dependencies')
  console.log('METRICS', JSON.stringify({
    totalUnits: reading.semanticUnits.length, provenance: reading.semanticUnits.filter(item =>
      item.sourceFactIds.length || item.sourceEffectIds.length || item.sourceRoleIds.length || item.sourcePersonalityFactIds.length).length,
    uiOnly: reading.chapters.filter(item => item.navigationChapterIds).length,
    monthCount: months.length, freeUnits: f.semanticUnits.length,
  }))
} finally {
  await server.close()
}
