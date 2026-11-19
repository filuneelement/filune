import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
const validity = { periodId: 'fixture', from: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' },
  to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } }
const pillar = (id, stem, branch) => ({ ...(stem && { stem: { id, value: stem } }),
  ...(branch && { branch: { id: id + '-branch', value: branch } }) })

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { resolveStemRuntime, killingFormula } = await load('judgment/core/stems')
  const { validatePatternEffectRegistry } = await load('judgment/core/policies')
  const run = (natal, luck = [], resourceExcessEvidenceIds, natalCombinations = [], roleHistory = []) => runJudgmentCore({
    executionId: 'p0', natal, natalValidity: validity, natalCombinations, luck, resourceExcessEvidenceIds, roleHistory,
  })
  const luck = (scope, stem, branch) => ({ scope, pillar: pillar(scope, stem, branch), validity })
  const stateOf = (state, id) => state.runtime.find((item) => item.entityId === id)?.state

  // A natal stop changes the final effective pattern without deleting either manifestation.
  const pattern = { day: pillar('dm', '丙', '午'), month: pillar('m', '壬', '申'), year: pillar('y', '丁'), time: pillar('t', '庚') }
  const [natal] = run(pattern, [], undefined, [['m', 'y']])
  assert.equal(natal.provisionalPatternContext.patternMode, 'combined')
  assert.equal(natal.patternContext.patternMode, 'proper')
  assert.deepEqual(natal.patternContext.heavenlyPatterns, ['偏財'])
  assert.equal(natal.patternContext.manifestationHistory.length, 2)
  assert.equal(natal.patternContext.effectiveManifestedYongShen.length, 1)

  const transformed = { day: pillar('dm', '丙', '午'), month: pillar('m', '壬', '申') }
  const [base, great, year, month, day] = run(transformed, [
    luck('greatLuck', '庚', '亥'), luck('yearlyLuck', '乙', '卯'), luck('monthlyLuck', '戊', '未'), luck('dailyLuck', '辛', '子'),
  ])
  assert.equal(base.patternContext.patternMode, 'transformed')
  assert.equal(great.patternContext.patternMode, 'combined')
  for (const snapshot of [great, year, month, day]) assert.equal(snapshot.patternContext.branchPattern, base.patternContext.branchPattern)
  assert.equal(stateOf(great, 'greatLuck'), 'active')
  assert.equal(stateOf(year, 'greatLuck'), 'weakened')
  assert.equal(stateOf(year, 'yearlyLuck'), 'weakened')
  assert.equal(year.patternContext.effectiveManifestedYongShen.find(({ entityId }) => entityId === 'greatLuck').effectiveness, 'weakened')
  assert.ok(Object.isFrozen(base.patternContext.effectiveManifestedYongShen))
  assert.equal(day.parentScopeId, month.id)
  assert.ok(month.formationFacts.some(({ kind }) => kind === 'three'))
  assert.ok(!month.directEntityIds.includes('greatLuck-branch'))
  assert.ok(!day.directEntityIds.includes('yearlyLuck-branch'))
  assert.ok(day.formationBranchPool.some(({ scope }) => scope === 'greatLuck'))

  const [unmanifested, proper] = run({ day: pillar('dm', '丙'), month: pillar('month', null, '申') },
    [luck('greatLuck', '庚', '午')])
  assert.equal(unmanifested.patternContext.patternMode, 'month_command_unusable')
  assert.equal(proper.patternContext.patternMode, 'proper')
  const [excludedYangBlade] = run({ day: pillar('dm', '戊'), month: pillar('month', null, '午') })
  assert.equal(excludedYangBlade.patternContext.branchPattern, '印綬')
  const [yangBlade] = run({ day: pillar('dm', '甲'), month: pillar('month', null, '卯') })
  assert.equal(yangBlade.patternContext.branchPattern, '羊刃')
  assert.equal(yangBlade.evidence.overrides[0].conflict, 'SOURCE_CONFLICT')

  const [before, afterGreat, afterYear] = run({ ...transformed, year: pillar('y', '乙') }, [
    luck('greatLuck', '乙', '卯'), luck('yearlyLuck', '庚', '申'),
  ])
  assert.equal(stateOf(before, 'y'), 'active')
  assert.equal(stateOf(afterGreat, 'y'), 'active')
  assert.equal(stateOf(afterYear, 'greatLuck'), 'weakened')
  assert.equal(stateOf(afterYear, 'y'), 'active')
  const makeStem = (id, scope, stem, tenGod = '比肩', dayMaster = false) => ({ id, scope, stem, tenGod, dayMaster })
  const resolved = resolveStemRuntime('dailyLuck', [
    makeStem('n', 'natal', '乙'), makeStem('day-master', 'natal', '丁', '比肩', true),
    makeStem('d', 'dailyLuck', '庚'), makeStem('y', 'yearlyLuck', '乙'), makeStem('g', 'greatLuck', '乙'),
    makeStem('m', 'monthlyLuck', '壬'),
  ], new Map())
  assert.equal(resolved.runtime.get('g'), 'weakened')
  assert.equal(resolved.runtime.get('d'), 'weakened')
  assert.equal(resolved.runtime.get('y'), 'active')
  assert.equal(resolved.runtime.get('n'), 'active')
  const dayMasterOnly = resolveStemRuntime('greatLuck', [makeStem('dm', 'natal', '丁', '比肩', true),
    makeStem('luck', 'greatLuck', '壬')], new Map())
  assert.equal(dayMasterOnly.runtime.get('luck'), 'active')

  const role = { roleStateId: 'natal-byeong', entityId: 'natal-year', status: 'evaluated', provisional: false, role: '병' }
  const [,, stopped] = run({ ...transformed, year: pillar('natal-year', '乙', '亥') },
    [luck('greatLuck', '己', '卯'), luck('yearlyLuck', '庚', '未')], undefined, [], [role])
  assert.deepEqual(stopped.roleHistory, [role])
  assert.deepEqual(stopped.currentRoles, [{ roleHistoryRef: 'natal-byeong', currentState: 'stopped', currentFunction: 'inactive' }])
  assert.equal(stateOf(stopped, 'natal-year'), 'stopped')
  assert.equal(stateOf(stopped, 'yearlyLuck'), 'stopped')
  assert.equal(stopped.rootStates.find(({ entityId }) => entityId === 'natal-year').state, 'strengthened')
  assert.ok(stopped.patternContext.manifestationHistory.some(({ entityId }) => entityId === 'yearlyLuck'))
  assert.ok(!stopped.patternContext.effectiveManifestedYongShen.some(({ entityId }) => entityId === 'yearlyLuck'))
  assert.equal(stopped.provisionalPatternContext.patternMode, 'combined')
  assert.equal(stopped.patternContext.patternMode, 'transformed')
  const stoppedControl = stopped.stemFacts.find((item) => item.source.id === 'natal-year' && item.target.id === 'greatLuck' && item.action === 'control')
  assert.equal(stopped.actualFunctions.find(({ relationFactId }) => relationFactId === stoppedControl.id).function, 'inactive')

  const wr = (branch, evidence) => run({ day: pillar('dm', '甲', '子'), month: pillar('m', '壬', branch),
    year: pillar('y', '戊'), time: pillar('t', '丙') }, [], evidence)[0]
  for (const [branch, evidence, direction] of [['辰', undefined, 'favorable'], ['亥', undefined, 'unfavorable'],
    ['亥', ['resource-condition-reviewed'], 'favorable'], ['巳', undefined, 'favorable']]) {
    const snapshot = wr(branch, evidence)
    const fact = snapshot.stemFacts.find((item) => item.source.id === 'y' && item.target.id === 'm' && item.action === 'control')
    const actual = snapshot.actualFunctions.find(({ relationFactId }) => relationFactId === fact.id)
    assert.equal(actual.direction, direction)
    assert.equal(actual.byeongCandidate, direction === 'unfavorable')
    assert.equal(actual.patternContextId, snapshot.patternContext.id)
    assert.ok(!('direction' in fact) && !('good' in fact) && !('bad' in fact))
    if (evidence) assert.ok(snapshot.formulas.some(({ formulaType }) => formulaType === 'ResourceExcessUsesWealth'))
  }

  // For a yin day master the Hurting Officer and Seven Killing can form a real five-stem combination.
  const [, combined] = run({ day: pillar('dm', '乙', '卯'), month: pillar('m', '辛', '酉'), year: pillar('y', '丁') },
    [luck('greatLuck', '丙', '午')])
  assert.ok(combined.formulas.some(({ formulaType }) => formulaType === 'HurtingOfficerCombinesKilling'))
  assert.equal(stateOf(combined, 'm'), 'stopped')
  assert.equal(stateOf(combined, 'greatLuck'), 'stopped')
  assert.ok(combined.formulas.some(({ formulaType }) => formulaType === 'FoodGodControlsKilling'))
  const [foodControl] = run({ day: pillar('dm', '甲'), month: pillar('m', '庚', '申'), year: pillar('y', '丙') })
  assert.ok(foodControl.formulas.some(({ formulaType }) => formulaType === 'FoodGodControlsKilling'))
  assert.equal(stateOf(foodControl, 'm'), 'active')
  const [,, luckCombine] = run({ day: pillar('dm', '乙'), month: pillar('m', '丁', '午') },
    [luck('greatLuck', '辛', '酉'), luck('yearlyLuck', '丙', '午')])
  assert.ok(luckCombine.formulas.some(({ formulaType }) => formulaType === 'HurtingOfficerCombinesKilling'))
  assert.equal(stateOf(luckCombine, 'greatLuck'), 'weakened')
  assert.equal(stateOf(luckCombine, 'yearlyLuck'), 'weakened')
  const [control] = run({ day: pillar('dm', '甲', '寅'), month: pillar('m', '庚', '申'), year: pillar('y', '丁') })
  assert.ok(control.formulas.some(({ formulaType }) => formulaType === 'HurtingOfficerControlsKilling'))
  assert.equal(stateOf(control, 'm'), 'active')
  const combinationFact = combined.stemFacts.find((item) => item.source.id === 'greatLuck' && item.target.id === 'm' && item.action === 'combine')
  assert.equal(killingFormula(combinationFact, false), undefined)
  assert.throws(() => validatePatternEffectRegistry([{ policyId: 'bad', branchPattern: 'resource',
    relationType: 'WealthControlsResource', requiredConditions: [], patternMode: 'any', activeYongShenTypes: [],
    evidenceStatus: 'SOURCE_EXPLICIT', ruleId: 'test', defaultDirection: 'deferred' }]))

  // P0.1 A: the same manifested pair can have a live, missing, or inactive path.
  const harmonyNatal = { day: pillar('dm', '丙', '午'), month: pillar('m', '庚', '申'), year: pillar('food', '戊') }
  const quality = (snapshot) => snapshot.patternContext.yongShenRelations.find(({ stems }) =>
    stems.includes('庚') && stems.includes('戊'))
  const [harmony, stoppedHarmony] = run(harmonyNatal, [luck('greatLuck', '癸', '子')])
  assert.equal(quality(harmony).relationQuality, 'favorable_harmony')
  assert.equal(quality(harmony).currentFunction, 'operating')
  assert.ok(harmony.stemFacts.some((fact) => quality(harmony).relationFactIds.includes(fact.id)
    && fact.source.id === 'food' && fact.source.position === 'year'
    && fact.target.id === 'm' && fact.target.position === 'month' && fact.action === 'generate'))
  assert.equal(quality(stoppedHarmony).currentFunction, 'inactive')
  assert.notEqual(quality(stoppedHarmony).relationQuality, 'favorable_harmony')
  assert.ok(stoppedHarmony.patternContext.manifestationHistory.some(({ entityId }) => entityId === 'food'))
  const [,,, noDirectRelation] = run({ day: pillar('dm', '丙'), month: pillar('m', null, '申') },
    [luck('greatLuck', '戊', '辰'), luck('yearlyLuck', '壬', '子'), luck('monthlyLuck', '庚', '申')])
  assert.equal(quality(noDirectRelation).relationQuality, 'deferred')
  assert.deepEqual(quality(noDirectRelation).relationFactIds, [])
  const [, conflict] = run({ day: pillar('dm', '丙'), month: pillar('m', '戊', '辰') }, [luck('greatLuck', '癸', '子')])
  const cut = conflict.patternContext.yongShenRelations.find(({ relationQuality }) => relationQuality === 'unfavorable_conflict')
  assert.equal(cut.currentFunction, 'inactive')
  assert.ok(cut.relationFactIds.includes(conflict.combinationEffects[0].sourceRelationFactId))

  // P0.1 B/C: retain both observational facts when source effectiveness changes.
  const effectNatal = { day: pillar('dm', '丙'), month: pillar('water', '壬'), year: pillar('wood', '甲') }
  const [,, reduced] = run(effectNatal, [luck('greatLuck', '庚', '申'), luck('yearlyLuck', '乙', '卯')])
  const [, inactive] = run({ ...effectNatal, time: pillar('stopper', '乙') }, [luck('greatLuck', '庚', '申')])
  for (const [snapshot, expected] of [[reduced, 'reduced'], [inactive, 'inactive']]) {
    for (const [action, target] of [['generate', 'water'], ['control', 'wood']]) {
      const fact = snapshot.stemFacts.find((item) => item.source.id === 'greatLuck'
        && item.target.id === target && item.action === action)
      assert.ok(fact)
      const actual = snapshot.actualFunctions.find(({ relationFactId }) => relationFactId === fact.id)
      assert.equal(actual.function, expected)
      if (expected === 'inactive') assert.ok(snapshot.luckEffects.every(({ evidenceRefs }) => !evidenceRefs.includes(fact.id)))
    }
  }

  // P0.1 D: each ordered competition has an independent winner and untouched loser.
  for (const [earlier, later, pivot] of [
    ['greatLuck', 'yearlyLuck', 'monthlyLuck'], ['yearlyLuck', 'monthlyLuck', 'dailyLuck'],
    ['monthlyLuck', 'dailyLuck', 'yearlyLuck'],
  ]) {
    const { runtime, combinations } = resolveStemRuntime('dailyLuck', [
      makeStem(later, later, '乙'), makeStem(pivot, pivot, '庚'), makeStem(earlier, earlier, '乙'),
    ], new Map())
    assert.equal(runtime.get(earlier), 'weakened')
    assert.equal(runtime.get(pivot), 'weakened')
    assert.equal(runtime.get(later), 'active')
    assert.equal(combinations.length, 1)
  }

  // P0.1 E: origin history and ongoing effect are separate from current events.
  const inheritedNatal = { day: pillar('dm', '乙', '卯'), month: pillar('target', '辛', '酉') }
  const [, origin, inherited] = run(inheritedNatal,
    [luck('greatLuck', '丙', '午'), luck('yearlyLuck', '戊', '辰')])
  const originFormula = origin.formulas.find(({ formulaType }) => formulaType === 'HurtingOfficerCombinesKilling')
  const inheritedEffect = inherited.combinationEffects.find(({ sourceFormulaFactId }) => sourceFormulaFactId === originFormula.id)
  assert.equal(inheritedEffect.originScope, 'greatLuck')
  assert.equal(inheritedEffect.inherited, true)
  assert.equal(inheritedEffect.currentlyEffective, true)
  assert.equal(inheritedEffect.sourceRelationFactId, originFormula.relationFactIds[0])
  assert.deepEqual(inherited.combinationHistory.find(({ formula }) => formula?.id === originFormula.id).formula, originFormula)
  assert.equal(stateOf(inherited, 'greatLuck'), 'stopped')
  assert.equal(stateOf(inherited, 'target'), 'stopped')
  assert.equal(inherited.combinations.length, 0)
  assert.ok(inherited.formulas.every(({ formulaType }) => formulaType !== 'HurtingOfficerCombinesKilling'))
  const ongoingFact = inherited.stemFacts.find(({ action, target }) => action === 'combine' && target.id === 'target')
  assert.equal(inherited.actualFunctions.find(({ relationFactId }) => relationFactId === ongoingFact.id).function, 'operating')

  // P0.1 F and role current function: confirmed existing path, conditional trigger, and relief.
  assert.ok(great.luckEffects.some(({ effectType }) => effectType === 'manifests_yongshen'))
  assert.ok(great.luckEffects.some(({ effectType }) => effectType === 'changes_pattern_mode'))
  const supportingFact = harmony.stemFacts.find(({ source, target, action }) =>
    source.id === 'food' && target.id === 'm' && action === 'generate')
  const conditionalByeong = [{ kind: 'can_generate_future_killing', sourceEntityId: 'm',
    supportingRelationFactId: supportingFact.id, status: 'conditional' }]
  const activation = runJudgmentCore({ executionId: 'p0', natalValidity: validity, natal: harmonyNatal,
    natalCombinations: [], conditionalByeong, luck: [luck('greatLuck', '壬', '子')] })
  assert.equal(activation[0].conditionalByeong[0].currentState, 'conditional')
  assert.equal(activation[1].conditionalByeong[0].currentState, 'active')
  assert.ok(activation[1].luckEffects.some(({ effectType }) => effectType === 'activates_byeong'))
  assert.equal(activation[1].roleHistory.length, 0)

  const damageNatal = { day: pillar('dm', '丙'), month: pillar('resource', '甲', '寅'), year: pillar('damage', '庚') }
  const damageRole = { ...role, entityId: 'damage' }
  const roleFunctionBases = [{ roleHistoryRef: damageRole.roleStateId, sourceEntityId: 'damage', targetEntityId: 'resource',
    action: 'control', evidenceIds: ['confirmed-path'] }]
  const [withDamage, relieved, staysRelieved] = runJudgmentCore({ executionId: 'relief', natalValidity: validity,
    natal: damageNatal, natalCombinations: [], roleHistory: [damageRole], roleFunctionBases,
    luck: [luck('greatLuck', '乙', '卯'), luck('yearlyLuck', '丙', '午')] })
  assert.equal(withDamage.currentRoles[0].currentFunction, 'operating')
  assert.ok(withDamage.currentRoles[0].functionRefs.length)
  assert.equal(relieved.currentRoles[0].currentFunction, 'inactive')
  assert.equal(staysRelieved.currentRoles[0].currentFunction, 'inactive')
  assert.ok(relieved.luckEffects.some(({ effectType }) => effectType === 'relieves_byeong'))
  assert.ok(staysRelieved.luckEffects.every(({ effectType }) => effectType !== 'relieves_byeong'))
  assert.deepEqual(staysRelieved.roleHistory, withDamage.roleHistory)
  const { evaluateCurrentRoles } = await load('judgment/core/luckEffects')
  const weakFact = reduced.stemFacts.find(({ source, target, action }) =>
    source.id === 'greatLuck' && target.id === 'wood' && action === 'control')
  const weakActual = reduced.actualFunctions.find(({ relationFactId }) => relationFactId === weakFact.id)
  const weakRole = { ...damageRole, entityId: 'wood' }
  const [weakFunction] = evaluateCurrentRoles([weakRole], [{
    ...roleFunctionBases[0], sourceEntityId: 'greatLuck', targetEntityId: 'wood',
  }], new Map(reduced.runtime.map(({ entityId, state }) => [entityId, state])), [{ fact: weakFact, actual: weakActual }])
  assert.equal(weakFunction.currentFunction, 'reduced')
  assert.deepEqual(weakFunction.functionRefs, [weakFact.id])
  assert.equal(evaluateCurrentRoles([weakRole], [], new Map([['wood', 'active']]), [])[0].currentFunction, 'deferred')

  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const fixture = JSON.parse(await readFile(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))['CS-005']
  const [A, draftA, C, D, approval] = await Promise.all(['A_rev179', 'A_rev180', 'C_rev215', 'D_rev152', '25-7_rev16']
    .map((name) => readFile(new URL(`../src/docs/source/authority/${name}.md`, import.meta.url), 'utf8')))
  const reading = runInternalReading({
    birth: { date: fixture.date, time: { known: true, value: fixture.time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { calculationVersion: CURRENT_CALCULATION_VERSION, referenceTime: '2027-01-15T00:00:00.000Z', monthlyLuckYear: 2027 },
    sources: { A, draftA, C, D, approval }, executionId: 'p0-reading', natalInspectionPeriod: validity,
    dailyLuck: luck('dailyLuck', '甲', '子'),
  })
  assert.deepEqual(reading.judgmentCore.map(({ scope }) => scope), ['natal', 'greatLuck', 'yearlyLuck', 'monthlyLuck', 'dailyLuck'])
  const monthBranch = reading.canonical.chart.pillars.month.value.branch
  const dayStem = reading.canonical.chart.pillars.day.value.stem
  const { calculateTenGod } = await load('dayRelationships')
  const { HIDDEN_STEM_ROLE_TABLE } = await load('hiddenStemRoleTable')
  const expectedPattern = calculateTenGod(dayStem, HIDDEN_STEM_ROLE_TABLE[monthBranch].find(({ role }) => role === 'main').stem)
  assert.ok(Object.isFrozen(reading.judgmentCore))
  assert.ok(reading.judgmentCore.every((snapshot) => Object.isFrozen(snapshot) && snapshot.patternContext.branchPattern === expectedPattern))
  console.log('P0 judgment regressions passed')
} finally {
  await server.close()
}
