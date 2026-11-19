import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({
  root, appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const first = '2027-01-01T00:00:00.000Z'
const during = '2027-02-10T00:00:00.000Z'
const boundary = '2027-03-01T00:00:00.000Z'
const yearEnd = '2028-01-01T00:00:00.000Z'
const greatEnd = '2035-01-01T00:00:00.000Z'
const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const natalValidity = validity('natal', '2000-01-01T00:00:00.000Z', '2100-01-01T00:00:00.000Z')
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
const luck = (name, stem, branch, scope, period) => ({ scope, validity: period, pillar: pillar(name, stem, branch) })
const day = pillar('day', '甲', '寅')
const officer = { day, month: pillar('officer', '辛', '酉') }
const hurt = { ...officer, year: pillar('hurt', '丁', '巳') }
const wealth = { day, month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
const great = luck('great-hurting', '丁', '巳', 'greatLuck', validity('great-a', first, greatEnd))
const year = luck('year', '乙', '卯', 'yearlyLuck', validity('year-a', first, yearEnd))
const month = luck('month-resource', '癸', '子', 'monthlyLuck', validity('month-a', '2027-02-01T00:00:00.000Z', boundary))
const daily = luck('daily', '己', '未', 'dailyLuck', validity('day-a', during, '2027-02-11T00:00:00.000Z'))
const nextMonth = luck('month-next', '己', '未', 'monthlyLuck', validity('month-b', boundary, '2027-04-01T00:00:00.000Z'))
const results = []

function check(id, label, run) {
  try {
    run()
    results.push({ id, label, status: 'PASS' })
    console.log(`PASS ${id} ${label}`)
  } catch (error) {
    results.push({ id, label, status: 'FAIL', message: error.message, actual: error.actual, expected: error.expected })
    console.error(`FAIL ${id} ${label}: ${error.message}`)
    if ('actual' in error) console.error(JSON.stringify({ actual: error.actual, expected: error.expected }))
  }
}

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

function verifyImports() {
  const config = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile)
  assert.ok(!config.error)
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const cache = ts.createModuleResolutionCache(root, file => file, options)
  const sourceRoot = path.join(root, 'src')
  const personalityRoot = path.join(sourceRoot, 'lib/personality') + path.sep
  const judgmentRoot = path.join(sourceRoot, 'lib/judgment') + path.sep
  const canonicalRoot = path.join(sourceRoot, 'lib/canonical') + path.sep
  const map = new Map()
  for (const file of ts.sys.readDirectory(sourceRoot, ['.ts', '.tsx', '.js', '.jsx', '.mts'])) {
    const source = readFileSync(file, 'utf8')
    const imports = ts.preProcessFile(source, true, /\.[cm]?jsx?$/.test(file)).importedFiles
    map.set(file, imports.flatMap(item => {
      const resolved = ts.resolveModuleName(item.fileName, file, options, ts.sys, cache).resolvedModule?.resolvedFileName
      return resolved?.startsWith(sourceRoot + path.sep) ? [resolved] : []
    }))
  }
  function reaches(from, predicate, seen = new Set()) {
    if (seen.has(from)) return false
    seen.add(from)
    return (map.get(from) ?? []).some(target => predicate(target) || reaches(target, predicate, seen))
  }
  for (const file of map.keys()) {
    if (file.startsWith(judgmentRoot) || file.startsWith(canonicalRoot)) {
      assert.ok(!reaches(file, target => target.startsWith(personalityRoot)), file)
    }
    if (file.startsWith(personalityRoot)) {
      assert.ok(!reaches(file, target => target.startsWith(judgmentRoot)), file)
      assert.ok(!reaches(file, target => target === file), file)
    }
  }
  for (const adapter of ['personalityStructuralReading.ts', 'personalityCurrentReading.ts']) {
    const source = ts.createSourceFile(adapter, readFileSync(path.join(sourceRoot, 'lib', adapter), 'utf8'), ts.ScriptTarget.Latest, true)
    const authorityImports = source.statements.filter(ts.isImportDeclaration)
      .filter(node => node.moduleSpecifier.text.includes('judgment/'))
    assert.ok(authorityImports.length && authorityImports.every(node => node.importClause?.isTypeOnly), adapter)
  }
}

try {
  const { buildNatalPersonality, applyStructuralRoleModifiers, buildCurrentPersonality } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { projectCurrentPersonalityScopes } = await load('personalityCurrentReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage, EARTHLY_BRANCH_ORDER } = await load('twelveStages')
  const { DAY_STEM_PROFILES } = await load('personality/knowledge/dayStemProfiles')
  const { TEN_GOD_PROFILES } = await load('personality/knowledge/tenGodProfiles')
  const { DAY_PILLAR_PROFILES } = await load('personality/knowledge/dayPillarProfiles')
  const { POSITION_EXPRESSION_RULES } = await load('personality/knowledge/positionRules')
  const { TEN_GOD_TO_PERSONALITY_ID } = await load('personality/types')
  const registries = { day_stem: DAY_STEM_PROFILES, ten_god: TEN_GOD_PROFILES, day_pillar: DAY_PILLAR_PROFILES, position: POSITION_EXPRESSION_RULES }
  const registryBefore = structuredClone(registries)

  function chart(natal) {
    const chart = { pillars: {}, basicRelations: {} }
    const dm = natal.day.stem.value
    for (const key of ['year', 'month', 'day', 'time']) {
      const position = natal[key]
      if (!position) {
        chart.pillars[key] = { status: 'unknown', uncertaintyIds: ['fixture:hour-unknown'] }
        chart.basicRelations[key] = { ...chart.pillars[key] }
        continue
      }
      const { stem: { value: stem }, branch: { value: branch } } = position
      assert.ok(EARTHLY_BRANCH_ORDER.includes(branch))
      chart.pillars[key] = { status: 'confirmed', value: { stem, branch, ganZhi: stem + branch } }
      chart.basicRelations[key] = { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(dm, stem), relationships: calculateDayRelationships(dm, branch),
        twelveStage: calculateTwelveStage(dm, branch),
      } }
    }
    return chart
  }

  function inputFor(natal, periods, referenceTime = during, evaluationScope = 'day', priorHistory) {
    const snapshots = runJudgmentCore({
      executionId: 'p2g-fixture', natal, natalValidity, natalCombinations: [], luck: periods, referenceTime, priorHistory,
    })
    const raw = buildNatalPersonality(chart(natal))
    const reading = freeze(projectNatalStructuralReading(snapshots[0]))
    const base = freeze(applyStructuralRoleModifiers(raw, reading))
    const structuralScopes = freeze(projectCurrentPersonalityScopes(snapshots, base.dayStem, referenceTime))
    return { natalPersonality: base, raw, snapshots, structuralScopes, referenceTime, evaluationScope }
  }

  function fieldValues(profile, field) {
    if (field === 'internalConflict') return profile.internalConflict.flatMap(item => [
      item.sourceA, item.sourceB, item.tension, ...item.possibleExpression,
    ])
    return profile[field] ?? []
  }

  const seen = { day_stem: new Set(), ten_god: new Set(), day_pillar: new Set(), position: new Set() }
  const unsupported = []
  const forbidden = /배우자|남편|아내|결혼|이혼|외도|궁합|질병|수명|재물운|직업운|부자가 된|당신은|반드시|무조건|평생 고생|(?:남자|여자|남성|여성)(?:는|은|라면)/
  function auditFacts(facts, provenance) {
    const records = new Map(provenance.map(note => [note.id, note]))
    assert.equal(new Set(facts.map(fact => fact.id)).size, facts.length)
    for (const fact of facts) {
      assert.doesNotMatch(fact.trait, forbidden)
      const notes = fact.provenanceIds.map(id => records.get(id))
      const sourceNotes = notes.filter(note => note?.sourceType === fact.sourceType)
      if (!sourceNotes.some(note =>
        fieldValues(registries[note.sourceType][note.profileId], note.field).includes(fact.trait))) unsupported.push(fact.id)
      for (const note of notes) {
        assert.ok(note?.sourceRefs.length, fact.id)
        seen[note.sourceType].add(note.profileId)
        if (note.sourceType === 'ten_god') {
          assert.ok(!['excessiveExpression', 'deficientExpression'].includes(note.field), fact.id)
          if (note.field === 'productiveExpression') assert.equal(fact.status, 'contextual')
        }
      }
    }
  }

  const full = inputFor(officer, [great, year, month, daily])
  const current = buildCurrentPersonality(full)
  const nativeWealth = inputFor(wealth, [])
  const roleLifecycle = inputFor(wealth, [luck('wealth-stopper', '癸', '子', 'greatLuck', great.validity)])
  const roleCurrent = buildCurrentPersonality(roleLifecycle)
  const manifestInput = inputFor({ day: pillar('manifest-day', '丙', '午'), month: pillar('manifest-month', '壬', '申') },
    [luck('manifest', '庚', '亥', 'greatLuck', great.validity)])
  const manifest = buildCurrentPersonality(manifestInput)

  check('A', 'Knowledge → Natal and Current, all 60 day pillars and all 10 TenGod entries', () => {
    for (const [layer, count] of Object.entries({ day_stem: 10, ten_god: 10, day_pillar: 60, position: 6 })) {
      assert.equal(Object.keys(registries[layer]).length, count)
    }
    for (const stem of Object.keys(DAY_STEM_PROFILES)) assert.equal(Object.keys(DAY_PILLAR_PROFILES).filter(key => key.startsWith(stem)).length, 6)
    for (const id of Object.keys(DAY_PILLAR_PROFILES)) {
      const natal = buildNatalPersonality(chart({ ...officer, day: pillar('audit-day', ...id), year: pillar('audit-year', '丁', '巳'),
        time: pillar('audit-hour', '壬', '子') }))
      auditFacts(natal.facts, natal.provenance)
      for (const rule of natal.positionExpressions) {
        for (const id of rule.ruleIds) seen.position.add(id)
      }
      assert.ok(natal.tenGodStates.every(state => state.prominence.status === 'deferred'))
      assert.ok(!natal.occurrences.some(item => item.position === 'day_stem'))
      assert.equal(natal.dayPillarModifier.dayBranchTenGod, TEN_GOD_TO_PERSONALITY_ID[calculateDayRelationships(...id).mainHiddenTenGod])
      for (const [field, values] of Object.entries(DAY_STEM_PROFILES[natal.dayStem])) {
        if (!Array.isArray(values) || field === 'evidenceNotes') continue
        for (const trait of values) assert.ok(natal.facts.some(fact => fact.sourceType === 'day_stem' && fact.trait === trait), `${id}.${field}`)
      }
    }
    for (const scope of [current, manifest, roleCurrent]) auditFacts(scope.temporaryFacts, scope.provenance)
    assert.deepEqual(Object.fromEntries(Object.entries(seen).map(([key, value]) => [key, value.size])),
      { day_stem: 10, ten_god: 10, day_pillar: 60, position: 6 })
    assert.deepEqual(unsupported, [])
  })

  check('B', 'additive DayPillar and explicit source conflict', () => {
    const item = buildNatalPersonality(chart({ ...hurt, day: pillar('self', '甲', '子') }))
    assert.ok(item.facts.some(fact => fact.sourceType === 'day_stem'))
    assert.ok(item.dayPillarModifier.factIds.every(id => item.facts.some(fact => fact.id === id && fact.sourceType === 'day_pillar')))
    const source = item.conflicts.find(conflict => conflict.conflictType === 'source_explicit')
    assert.equal(source.resolution, 'coexist')
    assert.ok(source.factIds.length > 1)
  })

  check('C', 'position contexts and non-promoting TenGod evidence', () => {
    const natal = buildNatalPersonality(chart({ ...hurt, time: pillar('time', '壬', '子') }))
    const positionModes = Object.fromEntries(natal.positionExpressions.map(item => [item.position, item.expressionMode]))
    assert.deepEqual(positionModes, {
      year_stem: 'outward', year_branch: 'supporting_context', month_stem: 'outward',
      month_branch: 'innate', day_branch: 'decision', hour_stem: 'outward', hour_branch: 'private',
    })
    assert.ok(natal.facts.filter(item => item.sourcePosition === 'year_branch').every(fact => fact.status === 'contextual'))
    assert.ok(natal.tenGodStates.some(item => item.prominence.evidence.some(evidence => evidence.type === 'repeated')))
    assert.ok(natal.tenGodStates.some(item => item.occurrence === 'absent' && !item.activeTraitFactIds.length))
    assert.ok(natal.tenGodStates.every(item => item.prominence.status === 'deferred'))
  })

  check('D', 'conflict coexistence and selected-result references', () => {
    const lookup = new Set(current.currentFacts.map(fact => fact.personalityFactId))
    assert.ok(current.conflicts.some(conflict => conflict.conflictType === 'temporary_expression_tension'))
    assert.ok(current.conflicts.every(conflict => conflict.resolution === 'coexist' || conflict.resolution === 'context_split'))
    assert.ok(current.conflicts.every(conflict => conflict.factIds.length > 1 && conflict.factIds.every(id => lookup.has(id))))
  })

  check('E', 'role projection changes role state only', () => {
    assert.strictEqual(roleLifecycle.natalPersonality.facts, roleLifecycle.raw.facts)
    assert.strictEqual(roleCurrent.natal, roleLifecycle.natalPersonality)
    assert.ok(roleCurrent.structuralRoleModifiers.every(modifier =>
      roleLifecycle.natalPersonality.structuralRoleModifiers.some(base => base.id === modifier.id)))
    assert.ok(roleCurrent.structuralRoleModifiers.some(modifier => modifier.sourceEntityId === 'wealth' && modifier.status === 'inactive'))
  })

  check('F', 'native same-actor favorable role and ConditionalByeong coexist', () => {
    const siblingRoles = nativeWealth.natalPersonality.structuralRoleModifiers.filter(item => item.sourceEntityId === 'wealth')
    assert.ok(siblingRoles.some(item => item.sourceRole === 'yongshen' && item.status === 'confirmed'))
    assert.ok(siblingRoles.some(item => item.sourceRole === 'byeong' && item.status === 'contextual'))
    assert.ok(nativeWealth.natalPersonality.roleConflicts.some(item => item.conflictType === 'conditional_role_shift'))
  })

  check('G', 'frozen inputs and independent parent calculation', () => {
    const before = structuredClone(full)
    const parent = buildCurrentPersonality({ ...full, evaluationScope: 'daewoon' })
    const child = buildCurrentPersonality(full)
    assert.deepEqual(full, before)
    assert.strictEqual(child.natal, full.natalPersonality)
    assert.deepEqual(child.scopeExpressions.find(item => item.scope === 'daewoon'), parent.scopeExpressions.find(item => item.scope === 'daewoon'))
    assert.deepEqual(registries, registryBefore)
  })

  check('H', 'four temporary scopes and manifestation without a natal role', () => {
    assert.deepEqual(current.scopeExpressions.map(item => item.scope), ['natal', 'daewoon', 'sewoon', 'month', 'day'])
    assert.ok(current.scopeExpressions.slice(1).every(item => item.temporaryFactIds.length))
    const manifestation = manifest.effectHistory.find(item => item.structuralEffectType === 'manifests_yongshen' && item.currentlyEffective)
    assert.ok(manifestation?.factIds.length)
    assert.ok(manifest.structuralRoleModifiers.every(item => manifestInput.natalPersonality.structuralRoleModifiers.some(role => role.id === item.id)))
    assert.ok(!JSON.stringify(current).includes('excludedClaims'))
  })

  check('I', 'inherited effect identity and stable ordering', () => {
    const original = current.effectHistory.filter(item => item.type === 'temporary_ten_god_expression' && item.originScope === 'daewoon')
    assert.ok(original.length && original.every(item => item.inherited && item.currentlyEffective))
    for (const scope of current.scopeExpressions.slice(2)) {
      assert.ok(original.every(item => scope.inheritedEffectIds.includes(item.id)))
    }
    assert.equal(new Set(current.effectHistory.map(item => item.id)).size, current.effectHistory.length)
    const shuffled = full.structuralScopes.map(scope => ({ ...scope, occurrences: [...scope.occurrences].reverse(),
      roles: [...scope.roles].reverse(), effects: [...scope.effects].reverse() })).reverse()
    assert.deepEqual(buildCurrentPersonality({ ...full, structuralScopes: shuffled }), current)
  })

  const replacement = inputFor(officer, [great, year, nextMonth], boundary, 'month', full.snapshots[3])
  const oldHistory = freeze(structuredClone(current.effectHistory))
  const withoutHistory = buildCurrentPersonality(replacement)
  const withHistory = buildCurrentPersonality({ ...replacement, previousEffectHistory: oldHistory })
  const oldTemporary = current.effectHistory.filter(item => item.type === 'temporary_ten_god_expression'
    && (item.originScope === 'month' || item.originScope === 'day'))

  check('J', 'old temporary effects expire with their own periods', () => {
    assert.ok(oldTemporary.length)
    for (const item of oldTemporary) {
      const record = withHistory.effectHistory.find(value => value.id === item.id)
      assert.ok(record?.expired && !record.currentlyEffective)
      assert.ok(!withHistory.currentFacts.some(fact => fact.origins.some(origin => origin.originEffectId === item.id)))
    }
  })

  check('K', 'history and current state are separated, with deduplicated replay', () => {
    const replay = buildCurrentPersonality({ ...replacement, previousEffectHistory: withHistory.effectHistory })
    assert.deepEqual(replay, withHistory)
    assert.ok(withHistory.effectHistory.length > withoutHistory.effectHistory.length)
    assert.equal(new Set(withHistory.effectHistory.map(item => item.id)).size, withHistory.effectHistory.length)
    assert.deepEqual(current.effectHistory, oldHistory)
  })

  check('L', 'BLOCKING independent reads with and without earlier history', () => {
    const { effectHistory: previous, ...activeWithHistory } = withHistory
    const { effectHistory: fresh, ...activeWithoutHistory } = withoutHistory
    assert.deepEqual(activeWithHistory, activeWithoutHistory)
    assert.deepEqual(previous.filter(item => item.currentlyEffective), fresh.filter(item => item.currentlyEffective))
    assert.deepEqual(withHistory.natal, withoutHistory.natal)
  })

  check('M', 'unknown hour removes hour-derived facts only', () => {
    const known = inputFor({ ...officer, time: pillar('known-hour', '壬', '子') }, [great])
    const unknown = inputFor(officer, [great])
    for (const result of [unknown.natalPersonality, buildCurrentPersonality(unknown).natal]) {
      assert.ok(!result.facts.some(fact => fact.sourcePosition?.startsWith('hour_')))
      assert.ok(!result.occurrences.some(item => item.position.startsWith('hour_')))
    }
    assert.deepEqual(unknown.natalPersonality.facts, known.natalPersonality.facts.filter(fact => !fact.sourcePosition?.startsWith('hour_')))
    assert.ok(buildCurrentPersonality(unknown).temporaryFacts.length)
  })

  check('N', '戊午 canonical 正印 and excluded conflict never enters traits', () => {
    const wu = inputFor({ day: pillar('wu-day', '戊', '午'), month: pillar('wu-month', '戊', '午') },
      [luck('wu-great', '己', '未', 'greatLuck', great.validity)])
    const result = buildCurrentPersonality(wu)
    assert.equal(result.natal.dayPillarModifier.dayBranchTenGod, '正印')
    assert.ok(![...result.natal.facts, ...result.temporaryFacts].some(fact => fact.tenGod === '偏財'))
    assert.ok(!JSON.stringify(result).includes('L3837'))
  })

  check('O', 'numeric scoring and unsupported trait injection are absent', () => {
    for (const file of ts.sys.readDirectory(path.join(root, 'src/lib/personality'), ['.ts', '.tsx'])) {
      const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, readFileSync(file, 'utf8'))
      while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
        if (scanner.getToken() !== ts.SyntaxKind.Identifier) continue
        assert.doesNotMatch(scanner.getTokenText().replace(/([a-z])([A-Z])/g, '$1_$2'),
          /(?:^|_)(?:score|weight|percent|probability|points|rank|threshold)(?:_|$)/i, file)
      }
    }
    assert.deepEqual(unsupported, [])
  })
  check('P', 'no structural reverse import, runtime Judgment call, or cycle', verifyImports)

  check('G-01', 'joint conflict effect begins in the first scope with both sides and ends with the shorter period', () => {
    const factIds = current.conflicts.find(conflict => conflict.conflictType === 'temporary_expression_tension')?.factIds
    const history = current.effectHistory.find(item => item.type === 'conflict_activation'
      && JSON.stringify(item.factIds) === JSON.stringify(factIds))
    assert.ok(history)
    const retired = withHistory.effectHistory.find(item => item.id === history.id)
    assert.deepEqual({
      origin: history.originScope, end: history.originPeriod.end, inherited: history.inherited,
      effectiveAfter: retired?.currentlyEffective, expiredAfter: retired?.expired,
      inDaewoon: current.scopeExpressions.find(item => item.scope === 'daewoon').conflictIds
        .some(id => current.conflicts.find(conflict => conflict.id === id)?.conflictType === 'temporary_expression_tension'),
    }, { origin: 'month', end: boundary, inherited: true, effectiveAfter: false, expiredAfter: true, inDaewoon: false })
    assert.equal(history.originPeriod.start, month.validity.from.instant)
    assert.equal(history.sourceIds.length, 2)
    assert.ok(!withHistory.conflicts.some(item => JSON.stringify(item.factIds) === JSON.stringify(factIds)))

    const monthly = buildCurrentPersonality({ ...full, evaluationScope: 'month' })
    assert.deepEqual(monthly.effectHistory.find(item => item.id === history.id), { ...history, inherited: false })
    assert.ok(current.scopeExpressions.find(item => item.scope === 'day').inheritedEffectIds.includes(history.id))
    assert.equal(current.effectHistory.filter(item => item.id === history.id).length, 1)
    const monthOccurrences = full.structuralScopes.find(item => item.scope === 'month').occurrences
    const repeatingDay = buildCurrentPersonality({ ...full, structuralScopes: full.structuralScopes.map(item =>
      item.scope === 'day' ? { ...item, occurrences: monthOccurrences } : item) })
    assert.deepEqual(repeatingDay.effectHistory.filter(item => item.type === 'conflict_activation'
      && JSON.stringify(item.factIds) === JSON.stringify(factIds)), [history])

    const recurrenceStart = '2027-04-01T00:00:00.000Z'
    const recurrence = luck('month-resource', '癸', '子', 'monthlyLuck',
      validity('month-c', recurrenceStart, '2027-05-01T00:00:00.000Z'))
    const recurringInput = inputFor(officer, [great, year, recurrence], recurrenceStart, 'month')
    const renewed = buildCurrentPersonality({ ...recurringInput, previousEffectHistory: withHistory.effectHistory })
    const fresh = buildCurrentPersonality(recurringInput)
    const { effectHistory: renewedHistory, ...renewedState } = renewed
    const { effectHistory: freshHistory, ...freshState } = fresh
    assert.deepEqual(renewedState, freshState)
    const renewedEvent = freshHistory.find(item => item.type === 'conflict_activation'
      && JSON.stringify(item.factIds) === JSON.stringify(factIds))
    assert.ok(renewedEvent?.currentlyEffective)
    assert.notEqual(renewedEvent.id, history.id)
    assert.deepEqual(renewedHistory.find(item => item.id === history.id), retired)

    for (const [outwardScope, innerScope, scope, natal] of [
      ['month', 'day', 'day', officer],
      ['sewoon', 'month', 'month', officer],
      ['daewoon', 'sewoon', 'sewoon', officer],
      [undefined, 'month', 'month', hurt],
    ]) {
      const fixture = inputFor(natal, [great, year, month, daily])
      // Isolate the participant origins while keeping the canonical scope chain.
      const outward = full.structuralScopes.flatMap(item => item.occurrences)
        .find(item => item.tenGod === '傷官' && item.mode === 'outward')
      const inner = full.structuralScopes.flatMap(item => item.occurrences)
        .find(item => item.tenGod === '印綬' && item.mode === 'inner')
      assert.ok(outward && inner)
      const structuralScopes = fixture.structuralScopes.map(item => ({ ...item,
        occurrences: item.scope === outwardScope ? [outward] : item.scope === innerScope ? [inner] : [],
      }))
      const scopedInput = { ...fixture, structuralScopes, evaluationScope: scope }
      const scoped = buildCurrentPersonality(scopedInput)
      const period = structuralScopes.find(item => item.scope === scope).period
      const events = scoped.effectHistory.filter(item => item.type === 'conflict_activation')
      assert.ok(events.length)
      assert.ok(events.every(item => item.originScope === scope && !item.inherited))
      assert.deepEqual(events[0].originPeriod, period)
      if (scope === 'day') {
        const earlierEnd = '2027-02-10T12:00:00.000Z'
        const clipped = buildCurrentPersonality({ ...scopedInput, structuralScopes: structuralScopes.map(item =>
          item.scope === 'month' ? { ...item, period: { ...item.period, end: earlierEnd } } : item) })
        assert.deepEqual(clipped.effectHistory.find(item => item.type === 'conflict_activation').originPeriod,
          { ...period, end: earlierEnd })
        const nonOverlap = buildCurrentPersonality({ ...scopedInput, structuralScopes: structuralScopes.map(item =>
          item.scope === 'month' ? { ...item, period: { ...item.period, end: period.start } } : item) })
        assert.ok(!nonOverlap.effectHistory.some(item => item.type === 'conflict_activation'))
        assert.ok(!nonOverlap.conflicts.some(item => item.conflictType === 'temporary_expression_tension'))
      }
    }
  })

  check('G-02', 'natal conflict definitions remain reachable after a child role goes inactive', () => {
    const baseline = roleCurrent.scopeExpressions.find(scope => scope.scope === 'natal')
    const child = roleCurrent.scopeExpressions.find(scope => scope.scope === 'daewoon')
    const baseRoleIds = new Set(roleLifecycle.natalPersonality.roleConflicts.map(conflict => conflict.id))
    assert.ok(baseline.conflictIds.some(id => baseRoleIds.has(id)))
    assert.ok(!child.conflictIds.some(id => baseRoleIds.has(id)))
    const definitions = new Set([...roleCurrent.natal.conflicts, ...roleCurrent.conflicts].map(conflict => conflict.id))
    assert.deepEqual(baseline.conflictIds.filter(id => !definitions.has(id)), [],
      'Natal scope conflict IDs must resolve in the selected result or its embedded natal result')
  })

  console.log(JSON.stringify({
    audit: 'P2-G',
    checks: results,
    unsupportedEngineTraits: new Set(unsupported).size,
    coverage: Object.fromEntries(Object.entries(seen).map(([layer, ids]) => [layer, ids.size])),
  }))
  if (results.some(item => item.status === 'FAIL')) process.exitCode = 1
} finally {
  await server.close()
}
