import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const src = path.join(root, 'src')
const server = await createServer({
  appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false },
})

function verifyImports() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile)
  assert.ok(!config.error)
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const cache = ts.createModuleResolutionCache(root, filename => filename, options)
  const graph = new Map()
  const personality = path.join(src, 'lib/personality') + path.sep
  const structural = ['judgment', 'canonical'].map(dir => path.join(src, 'lib', dir) + path.sep)
  for (const file of ts.sys.readDirectory(src, ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'])) {
    const content = readFileSync(file, 'utf8')
    if (file.startsWith(personality)) {
      const code = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, content)
      while (code.scan() !== ts.SyntaxKind.EndOfFileToken) {
        assert.doesNotMatch(code.getTokenText(), /\b(?:score|weight|percent|probability|points|threshold)\b/i, file)
      }
    }
    const imports = ts.preProcessFile(content, true, /\.[cm]?jsx?$/.test(file)).importedFiles
    graph.set(file, imports.flatMap(({ fileName }) => {
      const target = ts.resolveModuleName(fileName, file, options, ts.sys, cache).resolvedModule?.resolvedFileName
      return target?.startsWith(src + path.sep) ? [target] : []
    }))
  }
  function reaches(from, matches, seen = new Set()) {
    if (seen.has(from)) return false
    seen.add(from)
    return (graph.get(from) ?? []).some(target => matches(target) || reaches(target, matches, seen))
  }
  const isPersonality = filename => filename.startsWith(personality)
  const isStructural = filename => structural.some(dir => filename.startsWith(dir))
  assert.ok([...graph.keys()].some(isPersonality))
  for (const file of graph.keys()) {
    if (isStructural(file)) assert.equal(reaches(file, isPersonality), false, file)
    if (isPersonality(file)) {
      assert.equal(reaches(file, filename => filename.startsWith(structural[0])), false, file)
      assert.equal(reaches(file, filename => filename === file), false, file)
    }
  }
}

function assertLinks(result) {
  const ids = new Set(result.facts.map(fact => fact.id))
  const occurrences = new Set(result.occurrences.map(item => item.id))
  const provenance = new Set(result.provenanceIds)
  const conflicts = new Set(result.conflicts.map(item => item.id))
  assert.equal(ids.size, result.facts.length)
  assert.equal(occurrences.size, result.occurrences.length)
  assert.equal(provenance.size, result.provenance.length)
  assert.equal(conflicts.size, result.conflicts.length)
  function resolves(sourceIds, target) {
    assert.ok(sourceIds.every(id => target.has(id)), JSON.stringify(sourceIds))
  }
  for (const fact of result.facts) {
    assert.ok(fact.provenanceIds.length)
    resolves(fact.provenanceIds, provenance)
    resolves(fact.occurrenceIds, occurrences)
    assert.notEqual(fact.trait, 'source_gap')
  }
  for (const state of result.tenGodStates) {
    resolves(state.occurrenceIds, occurrences)
    resolves(state.activeTraitFactIds, ids)
    resolves(state.contextualTraitFactIds, ids)
    for (const evidence of state.prominence.evidence) resolves(evidence.sourceIds, occurrences)
  }
  for (const expression of result.positionExpressions) {
    resolves(expression.factIds, ids)
    resolves(expression.provenanceIds, provenance)
    assert.ok(expression.factIds.length && expression.ruleIds.length)
    assert.ok(expression.factIds.every(id => result.facts.find(fact => fact.id === id).sourcePosition === expression.position))
  }
  for (const conflict of result.conflicts) {
    resolves(conflict.factIds, ids)
    assert.ok(conflict.factIds.length > 1 && conflict.explanationEvidence.length)
    resolves(conflict.explanationEvidence.filter(ref => !ref.startsWith('src/')), provenance)
  }
  for (const dimension of result.summaryDimensions) {
    resolves([...dimension.confirmedFactIds, ...dimension.contextualFactIds, ...dimension.conflictingFactIds], ids)
  }
  resolves(result.dayPillarModifier.factIds, ids)
  resolves(result.dayPillarModifier.conflictIds, conflicts)
}

try {
  const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
  const { buildNatalPersonality } = await load('personality/index')
  const { DAY_STEM_PROFILES } = await load('personality/knowledge/dayStemProfiles')
  const { DAY_PILLAR_PROFILES } = await load('personality/knowledge/dayPillarProfiles')
  const { TEN_GOD_PROFILES } = await load('personality/knowledge/tenGodProfiles')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION: version } = await load('canonical/version')

  function fixture({ year, month, day, time }) {
    const chart = { pillars: {}, basicRelations: {} }
    for (const [position, value] of Object.entries({ year, month, day, time })) {
      if (!value) {
        chart.pillars[position] = { status: 'unknown', uncertaintyIds: ['test-time-unknown'] }
        chart.basicRelations[position] = { ...chart.pillars[position] }
        continue
      }
      const [stem, branch] = value
      chart.pillars[position] = { status: 'confirmed', value: { ganZhi: value, stem, branch } }
      chart.basicRelations[position] = { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(day[0], stem),
        relationships: calculateDayRelationships(day[0], branch),
        twelveStage: calculateTwelveStage(day[0], branch),
      } }
    }
    return chart
  }

  // A/C/D/E: manifested 傷官, branch 印, and the explicit 甲子 tension.
  const input = fixture({ year: '丁卯', month: '丁丑', day: '甲子', time: '甲戌' })
  const savedInput = structuredClone(input)
  const natal = buildNatalPersonality(input)
  assert.deepEqual(input, savedInput)
  assert.deepEqual(buildNatalPersonality(structuredClone(input)), natal)
  const state = (result, god) => result.tenGodStates.find(item => item.tenGod === god)
  const position = (result, name) => result.positionExpressions.find(item => item.position === name)
  const factsAt = (result, name) => result.facts.filter(item => item.sourcePosition === name)
  assert.equal(natal.occurrences.some(item => item.position === 'day_stem'), false)
  assert.equal(natal.occurrences.length, 3 + Object.values(input.basicRelations)
    .reduce((sum, item) => sum + item.value.relationships.hiddenStems.length, 0))
  assert.equal(state(natal, '傷官').occurrence, 'present')
  assert.equal(position(natal, 'year_stem').expressionMode, 'outward')
  assert.ok(factsAt(natal, 'year_stem').some(fact => fact.tenGod === '傷官' && fact.traitType === 'social'))
  assert.ok(factsAt(natal, 'year_stem').some(fact => fact.tenGod === '傷官' && fact.traitType === 'core'))
  assert.equal(position(natal, 'year_branch').expressionMode, 'supporting_context')
  assert.deepEqual(position(natal, 'year_branch').ruleIds, ['branch', 'year_branch'])
  assert.ok(factsAt(natal, 'year_branch').every(fact => fact.status === 'contextual'))
  assert.equal(position(natal, 'day_branch').expressionMode, 'decision')
  assert.equal(position(natal, 'hour_branch').expressionMode, 'private')
  assert.ok(natal.conflicts.some(conflict =>
    conflict.conflictType === 'outward_vs_inner' && conflict.resolution === 'context_split' &&
    conflict.factIds.some(id => factsAt(natal, 'year_stem').some(fact => fact.id === id)) &&
    conflict.factIds.some(id => factsAt(natal, 'day_branch').some(fact => fact.id === id))))
  assert.ok(natal.conflicts.some(conflict => conflict.resolution === 'coexist' && conflict.conflictType === 'source_explicit'))
  assert.ok(natal.dayPillarModifier.factIds.length && natal.dayPillarModifier.conflictIds.length)
  assert.ok(DAY_PILLAR_PROFILES.甲子.internalConflict.every(conflict =>
    [conflict.sourceA, conflict.sourceB, conflict.tension].every(trait =>
      natal.facts.some(fact => fact.sourceType === 'day_pillar' && fact.trait === trait))))
  for (const [field, traits] of Object.entries(DAY_STEM_PROFILES.甲)) {
    if (!Array.isArray(traits) || field === 'evidenceNotes') continue
    for (const trait of traits) assert.ok(natal.facts.some(fact => fact.sourceType === 'day_stem' && fact.trait === trait), field)
  }

  // B: month hidden stems inherit the innate context, without replacing other facts.
  const innate = position(natal, 'month_branch')
  assert.equal(innate.expressionMode, 'innate')
  assert.ok(innate.expressionDomain.includes('타고난 본성'))
  assert.ok(natal.facts.some(fact => innate.factIds.includes(fact.id) && fact.tenGod === '正印' && fact.traitType === 'decision'))
  const noMonth = structuredClone(input)
  for (const record of [noMonth.pillars, noMonth.basicRelations]) {
    record.month = { status: 'provisional', value: record.month.value, uncertaintyIds: ['test-solar-term'] }
  }
  const provisional = buildNatalPersonality(noMonth)
  assert.deepEqual(provisional.unavailablePositions, ['month_stem', 'month_branch'])
  assert.deepEqual(provisional.facts, natal.facts.filter(fact => !fact.sourcePosition?.startsWith('month_')))
  const repeated = state(natal, '傷官').prominence
  assert.equal(repeated.status, 'deferred')
  assert.ok(repeated.evidence.some(item => item.type === 'repeated' && item.sourceIds.includes('occurrence:year_stem:丁')
    && item.sourceIds.includes('occurrence:month_stem:丁')))
  assert.ok(state(natal, '正印').prominence.evidence.some(item => item.type === 'month_branch'))
  assert.ok(repeated.evidence.some(item => item.type === 'stem_manifested'))
  assert.ok(state(natal, '正印').prominence.evidence.some(item => item.type === 'branch_basis'))

  // F: true unknown hour, plus real CanonicalChart integration.
  const unknownInput = { date: { year: 1985, month: 7, day: 15 }, time: { known: false }, timeCorrectionMode: 'none' }
  const context = { referenceTime: '2026-06-01T00:00:00.000Z', calculationVersion: version, monthlyLuckYear: 2026 }
  const actualChart = calculateCanonicalChart(unknownInput, context).chart
  const unknownHour = buildNatalPersonality(actualChart)
  assert.equal(actualChart.pillars.time.status, 'unknown')
  assert.deepEqual(unknownHour.unavailablePositions, ['hour_stem', 'hour_branch'])
  assert.equal(unknownHour.occurrences.some(occurrence => occurrence.position.startsWith('hour_')), false)
  assert.equal(unknownHour.positionExpressions.some(expression => expression.position.startsWith('hour_')), false)
  assert.equal(unknownHour.facts.some(fact => fact.sourcePosition?.startsWith('hour_')), false)
  assert.ok(unknownHour.occurrences.length && unknownHour.tenGodStates.some(item => item.occurrence === 'undetermined'))
  const dirtyHour = structuredClone(actualChart)
  dirtyHour.basicRelations.time = input.basicRelations.time
  assert.deepEqual(buildNatalPersonality(dirtyHour), unknownHour)

  // G: 壬 has a coreDrive gap, and a known-hour fixture still computes all proven fields.
  assert.deepEqual(DAY_STEM_PROFILES.壬.coreDrive, [])
  const gap = buildNatalPersonality(fixture({ year: '甲子', month: '丁卯', day: '壬申', time: '庚戌' }))
  assert.ok(gap.facts.some(fact => fact.sourceType === 'day_stem' && fact.traitType === 'core'))
  assert.equal(gap.provenance.some(item => item.profileId === '壬' && item.field === 'coreDrive'), false)
  const actualKnown = buildNatalPersonality(calculateCanonicalChart({
    ...unknownInput, time: { known: true, value: { hour: 9, minute: 0 } },
  }, context).chart)
  assert.ok(position(actualKnown, 'hour_stem') && position(actualKnown, 'hour_branch'))

  // H: fixture isolates the conflicting source label from legitimate appearances of 偏財.
  const conflictChart = fixture({ year: '戊午', month: '戊午', day: '戊午', time: '戊午' })
  const wuWu = buildNatalPersonality(conflictChart)
  assert.equal(wuWu.dayPillarModifier.dayBranchTenGod, '正印')
  const canonicalMain = wuWu.occurrences.find(item => item.position === 'day_branch' && item.hiddenStemRole === 'main')
  assert.equal(canonicalMain.canonicalTenGod, '印綬')
  assert.equal(canonicalMain.tenGod, '正印')
  assert.equal(state(wuWu, '偏財').occurrence, 'absent')
  assert.ok(wuWu.dayPillarModifier.conflictIds.length)
  assert.ok(!wuWu.facts.some(fact => fact.tenGod === '偏財'))
  assert.ok(!JSON.stringify(wuWu).includes('L3837'))
  assert.ok(!JSON.stringify(natal).includes('excludedClaims'))

  // Presence, prominence and expression polarity are independent.
  for (const result of [natal, provisional, unknownHour, gap, actualKnown, wuWu]) {
    assertLinks(result)
    for (const item of result.tenGodStates) {
      assert.equal(item.prominence.status, 'deferred')
      if (item.occurrence !== 'present') assert.deepEqual(item.activeTraitFactIds, [])
    }
    for (const fact of result.facts.filter(item => item.sourceType === 'ten_god')) {
      const fields = result.provenance.filter(item => fact.provenanceIds.includes(item.id) && item.sourceType === 'ten_god')
      assert.ok(fields.every(item => !['deficientExpression', 'excessiveExpression'].includes(item.field)))
      if (fact.status === 'active') assert.ok(fields.every(item => ['coreDrive', 'ordinaryExpression'].includes(item.field)))
    }
    assert.ok(!result.facts.some(fact => /배우자|남편|아내|결혼|궁합|질병|수명|돈을 잘 번/.test(fact.trait)))
  }

  for (const [day, profile] of Object.entries(DAY_PILLAR_PROFILES)) {
    const result = buildNatalPersonality(fixture({ year: '丁卯', month: '丁丑', day }))
    assert.equal(result.dayPillar, day)
    assert.equal(result.dayPillarModifier.dayBranchTenGod, profile.dayBranchTenGod)
    assert.ok(result.dayPillarModifier.factIds.length)
    assert.equal(result.dayPillarModifier.conflictIds.length, profile.internalConflict.length)
    assertLinks(result)
  }

  // Registry order changes should leave fact/evidence IDs and arrays intact.
  const arrays = [
    TEN_GOD_PROFILES.傷官.socialExpression, TEN_GOD_PROFILES.傷官.evidenceNotes,
    DAY_STEM_PROFILES.甲.evidenceNotes, DAY_PILLAR_PROFILES.甲子.evidenceNotes,
  ]
  arrays.forEach(array => array.reverse())
  try {
    assert.deepEqual(buildNatalPersonality(input), natal)
  } finally {
    arrays.forEach(array => array.reverse())
  }

  verifyImports()
  console.log('PASS: P2-D A–H and all 60 day pillars, deterministic output, provenance links, context coexistence, no automatic deficiency/excess, no scoring or structural dependency')
} finally {
  await server.close()
}
