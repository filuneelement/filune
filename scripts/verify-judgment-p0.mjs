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
  const { evaluateStructuralSuccess } = await load('judgment/core/structuralSuccess')
  const { evaluateBranchDamage } = await load('judgment/core/branches')
  const { resolveStemRuntime, killingFormula } = await load('judgment/core/stems')
  const { validatePatternEffectRegistry } = await load('judgment/core/policies')
  const run = (natal, luck = [], resourceExcessEvidenceIds, natalCombinations = [], roleHistory = []) => runJudgmentCore({
    executionId: 'p0', natal, natalValidity: validity, natalCombinations, luck, resourceExcessEvidenceIds, roleHistory,
  })
  const luck = (scope, stem, branch) => ({ scope, pillar: pillar(scope, stem, branch), validity })
  const stateOf = (state, id) => state.runtime.find((item) => item.entityId === id)?.state
  const [soundOfficer] = runJudgmentCore({ executionId: 'structural-success', natalValidity: validity, luck: [],
    natalCombinations: [], natalCapacityEvidence: { state: 'killing_capacity_adequate', evidenceIds: ['capacity-review'] },
    natal: { day: pillar('self', '甲', '寅'), month: pillar('officer', '辛', '酉'),
      year: pillar('same-officer', '辛', '丑'), time: pillar('same-element', '甲', '亥') } })
  assert.equal(soundOfficer.roleEngine.byeongStatus, 'none')
  assert.equal(soundOfficer.roleEngine.guEungStatus, 'not_applicable')
  assert.deepEqual(['stem', 'branch', 'overall'].map((axis) => soundOfficer.structuralSuccess[axis].grade), ['成', '成', '成'])
  const gradeWithBurden = evaluateStructuralSuccess(soundOfficer.patternContext, soundOfficer.roleEngine, soundOfficer.rootStates,
    { state: 'killing_capacity_insufficient', evidenceIds: ['capacity-review'] }, false, true)
  assert.equal(gradeWithBurden.overall.grade, '不利優勢')
  const gradeWithDisruption = evaluateStructuralSuccess(soundOfficer.patternContext, soundOfficer.roleEngine, soundOfficer.rootStates,
    soundOfficer.capacity, true, true)
  assert.equal(gradeWithDisruption.stem.grade, '成')
  assert.equal(gradeWithDisruption.branch.grade, '有利優勢')
  assert.equal(gradeWithDisruption.overall.grade, '有利優勢')
  const stoppedIds = new Set(soundOfficer.roleEngine.roleHistory.filter(({ role }) => role === 'YongShen').map(({ roleId }) => roleId))
  const gradeAfterStop = evaluateStructuralSuccess({ ...soundOfficer.patternContext, effectiveManifestedYongShen: [] },
    { ...soundOfficer.roleEngine, currentRoles: soundOfficer.roleEngine.currentRoles.map((role) =>
      stoppedIds.has(role.roleId) ? { ...role, currentState: 'stopped', currentFunction: 'inactive' } : role) },
    soundOfficer.rootStates, soundOfficer.capacity, false, true)
  assert.equal(gradeAfterStop.overall.grade, '敗')
  // Authority C-10-1: an independently established wealth-to-killing path can
  // be adverse at the same time that food generates wealth favorably.
  const [mixedWealth] = runJudgmentCore({ executionId: 'mixed-wealth', natalValidity: validity,
    natalCombinations: [], luck: [],
    natal: { year: pillar('killing', '辛', '未'), month: pillar('wealth', '戊', '戌'),
      day: pillar('self', '乙', '丑'), time: pillar('food', '丁', '丑') },
    natalPolicyEvidence: [{ entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['C-10-1:8'] }],
  })
  assert.ok(mixedWealth.patternContext.yongShenRelations.some(({ stems, relationQuality }) =>
    stems.join('') === '辛戊' && relationQuality === 'unfavorable_conflict'))
  assert.ok(mixedWealth.patternContext.yongShenRelations.some(({ stems, relationQuality }) =>
    stems.join('') === '戊丁' && relationQuality === 'favorable_harmony'))
  // I-04-2: use only the branch main stems. The adjacent resource reaches the
  // month-command food. The directed wealth control protects that exact target.
  const branchFood = [
    { id: 'year', branch: '卯', scope: 'natal' }, { id: 'food', branch: '亥', scope: 'natal' },
    { id: 'resource', branch: '戌', scope: 'natal' }, { id: 'wealth', branch: '卯', scope: 'natal' },
  ]
  const branchCases = (unconfirmed = [], bound = [], entries = branchFood) => evaluateBranchDamage('i-04-2', '庚', '食神',
    entries, branchFood.map(({ id }) => id), 'food', [], [], new Set(unconfirmed), bound)
  const protectedFood = branchCases()
  assert.deepEqual(protectedFood.paths.map(({ state, protection }) => [state, protection?.entityId]), [['weakened', 'wealth']])
  assert.ok(protectedFood.paths[0].relationRefs.every((id) => protectedFood.relations.some((relation) => relation.id === id)))
  const exposedFood = branchCases([], ['wealth'])
  assert.equal(exposedFood.paths[0].state, 'active')
  assert.equal(exposedFood.paths[0].protection, undefined)
  assert.equal(branchCases(['resource']).paths.length, 0)
  assert.deepEqual(branchCases(['resource']).incomplete, ['BRANCH_FOOD_ATTACK_REACH_UNRESOLVED'])
  const separated = branchCases([], [], branchFood.map((branch) => branch.id === 'resource' ? { ...branch, id: 'wealth', branch: '戌' }
    : branch.id === 'wealth' ? { ...branch, id: 'resource', branch: '卯' } : branch))
  assert.equal(separated.paths.length, 0)
  // A182 §7 requires damage remaining after a distinct transformation or control.
  const killingBranches = [
    { id: 'kill', branch: '寅', scope: 'natal' }, { id: 'mediator', branch: '午', scope: 'natal' },
    { id: 'peer', branch: '辰', scope: 'natal' }, { id: 'feed', branch: '子', scope: 'yearlyLuck' },
  ]
  const killingBranchReview = (formations = []) => evaluateBranchDamage('a182-7', '戊', '偏官',
    killingBranches, ['kill', 'mediator', 'peer'], 'kill', ['mediator'], formations, new Set(), ['peer'])
  const residual = killingBranchReview()
  assert.deepEqual(residual.paths.map(({ targetEntityId, damagedFunction }) => [targetEntityId, damagedFunction]),
    [['mediator', 'branch_killing_protection']])
  const supported = killingBranchReview([{ id: 'fire-formation', kind: 'three', elementStem: '丙', participants: ['kill', 'mediator', 'other'] }])
  assert.equal(supported.paths.length, 0)
  assert.ok(supported.protectivePaths.some(({ relationRefs }) => relationRefs.includes('fire-formation')))
  const peerBranches = [
    { id: 'rob', branch: '寅', scope: 'natal' }, { id: 'wealth', branch: '未', scope: 'natal' },
    { id: 'output', branch: '巳', scope: 'greatLuck' },
  ]
  const peerBranchReview = (branches) => evaluateBranchDamage('bg-042', '乙', '劫財',
    branches, ['rob', 'wealth'], 'rob', [], [], new Set())
  assert.equal(peerBranchReview(peerBranches.slice(0, 2)).paths[0].state, 'active')
  const bridgedWealth = peerBranchReview(peerBranches)
  assert.equal(bridgedWealth.paths[0].state, 'weakened')
  assert.equal(bridgedWealth.paths[0].protection.entityId, 'output')
  const [branchClash] = run({ day: pillar('bd', '丙', '午'), month: pillar('bm', null, '子') })
  const directClash = branchClash.branchFacts.find((fact) => fact.kind === 'clash')
  assert.ok(directClash)
  assert.equal(branchClash.branchRelationEffects.find(({ relationId }) => relationId === directClash.id).effect, 'active')
  assert.equal(branchClash.rootStates.find(({ entityId }) => entityId === 'bd').state, 'weakened')
  assert.ok(branchClash.branchRuntimeStates.filter(({ entityId }) => directClash.participants.includes(entityId))
    .every(({ state }) => state === 'conflicted'))
  const [branchMitigation] = run({ day: pillar('bd', '丙', '寅'), month: pillar('bm', null, '亥'), year: pillar('by', null, '巳') })
  const mitigatedClash = branchMitigation.branchFacts.find((fact) => fact.kind === 'clash')
  assert.ok(mitigatedClash)
  assert.ok(branchMitigation.branchFacts.some((fact) => fact.kind === 'six_combination'
    && fact.participants.some((id) => mitigatedClash.participants.includes(id))))
  assert.equal(branchMitigation.branchRelationEffects.find(({ relationId }) => relationId === mitigatedClash.id).effect, 'mitigated')
  const mitigatedRoot = run({ day: pillar('bd', '甲', '寅'), month: pillar('bm', null, '申'),
    year: pillar('by', null, '亥') })[0]
  assert.equal(mitigatedRoot.rootStates.find(({ entityId }) => entityId === 'bd').state, 'present')

  const [sourceDrain] = run({ day: pillar('wood', '甲', '卯'), month: pillar('fire', '丙', '子') })
  const transfer = sourceDrain.stemFunctionEffects.filter(({ sourceEntityId }) => sourceEntityId === 'wood')
  assert.ok(transfer.some(({ kind, targetEntityId }) => kind === 'strengthen' && targetEntityId === 'fire'))
  assert.equal(sourceDrain.stemEffectiveness.find(({ entityId }) => entityId === 'fire').currentFunction, 'strengthened')
  assert.ok(transfer.some(({ kind, targetEntityId, reducesFunction }) => kind === 'drain' && targetEntityId === 'wood' && !reducesFunction))
  const [damagedRoot] = run({ day: pillar('wood', '甲', '卯'), month: pillar('fire', '丙', '酉') })
  assert.ok(damagedRoot.stemFunctionEffects.some(({ kind, targetEntityId, reducesFunction }) =>
    kind === 'drain' && targetEntityId === 'wood' && reducesFunction))
  assert.equal(damagedRoot.stemEffectiveness.find(({ entityId }) => entityId === 'wood').currentFunction, 'reduced')
  for (const [older, younger] of [['甲', '丙'], ['丙', '甲'], ['甲', '戊'], ['戊', '甲']]) {
    // Keep this a direction test, without independently rooted water
    // controlling fire after OP-Z11 mitigates a clash.
    const scoped = run({ day: pillar('dm', '壬', '寅') }, [
      luck('greatLuck', older, '寅'), luck('yearlyLuck', younger, '午'),
    ]).at(-1)
    const source = older === '甲' ? 'greatLuck' : 'yearlyLuck'
    const target = source === 'greatLuck' ? 'yearlyLuck' : 'greatLuck'
    const kind = [older, younger].includes('丙') ? 'strengthen' : 'weaken'
    assert.ok(scoped.stemFunctionEffects.some(({ sourceEntityId, targetEntityId, kind: effectKind }) =>
      sourceEntityId === source && targetEntityId === target && effectKind === kind))
    const targetFunction = scoped.stemEffectiveness.find(({ entityId }) => entityId === target)
    assert.equal(targetFunction.currentFunction, kind === 'strengthen' ? 'strengthened' : 'reduced')
  }

  // A natal stop changes the final effective pattern without deleting either manifestation.
  const pattern = { day: pillar('dm', '丙', '午'), month: pillar('m', '壬', '申'), year: pillar('y', '丁'), time: pillar('t', '庚') }
  const [natal] = run(pattern, [], undefined, [['m', 'y']])
  assert.equal(natal.provisionalPatternContext.patternMode, 'combined')
  assert.equal(natal.patternContext.patternMode, 'proper')
  assert.deepEqual(natal.patternContext.heavenlyPatterns, ['偏財'])
  assert.equal(natal.patternContext.manifestationHistory.length, 2)
  assert.equal(natal.patternContext.effectiveManifestedYongShen.length, 1)
  assert.equal(natal.stemEffectiveness.find(({ entityId }) => entityId === 'm').currentFunction, 'inactive')

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
  assert.equal(year.stemEffectiveness.find(({ entityId }) => entityId === 'yearlyLuck').currentFunction, 'reduced')
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
  // A-8-1 I-02: 己 exposes the earth element of 申's residual 戊, even
  // after the 乙/庚 combination stops the incoming metal manifestation.
  assert.equal(stopped.patternContext.patternMode, 'combined')
  assert.ok(stopped.patternContext.effectiveManifestedYongShen.some(({ stem, sourceClass }) =>
    stem === '己' && sourceClass === 'residual'))
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
  const { calculateEightCharWithoutBirthTime } = await load('calculateEightChar')
  const dailyPillar = calculateEightCharWithoutBirthTime({ year: 2027, month: 1, day: 15 }).day
  const reading = runInternalReading({
    birth: { date: fixture.date, time: { known: true, value: fixture.time }, gender: '女性', timeCorrectionMode: 'none' },
    calculation: { calculationVersion: CURRENT_CALCULATION_VERSION, referenceTime: '2027-01-15T00:00:00.000Z', monthlyLuckYear: 2027 },
    sources: { A, draftA, C, D, approval }, executionId: 'p0-reading', natalInspectionPeriod: validity,
    dailyLuck: { pillar: pillar('dailyLuck', dailyPillar[0], dailyPillar[1]), validity: {
      periodId: 'fixture-day-2027-01-15', from: { kind: 'exact', instant: '2027-01-14T15:00:00.000Z' },
      to: { kind: 'exact', instant: '2027-01-15T15:00:00.000Z' },
    } },
  })
  assert.deepEqual(reading.judgmentCore.map(({ scope }) => scope), ['natal', 'greatLuck', 'yearlyLuck', 'monthlyLuck', 'dailyLuck'])
  const [csNatal, csGreat] = reading.judgmentCore
  // C-10-1 items 8–9 and OP-Z11: 辰戌 remains observable, but 戌
  // can still mitigate the damage reaching the month command from 子.
  assert.ok(csNatal.branchDamage.paths.some(({ damagedFunction, state, protection }) =>
    damagedFunction === 'branch_killing_protection' && state === 'weakened'
      && protection?.entityId.includes('/pillars/time/')))
  const natalKilling = csNatal.patternContext.effectiveManifestedYongShen.find(({ tenGod }) => tenGod === '偏官')
  assert.ok(csGreat.runtime.some(({ entityId, state }) => entityId === natalKilling.entityId && state === 'stopped'))
  // C-1 and SG-069/101 prohibit treating the removal of pressure as automatic damage.
  assert.ok(csGreat.roleEngine.damagePaths.every(({ action, targetEntityId }) => action !== 'combine' || targetEntityId !== natalKilling.entityId))
  const natalResource = csNatal.patternContext.effectiveManifestedYongShen.find(({ tenGod }) => tenGod === '偏印')
  // C-10-1/2 and OP-T10 keep natal 丙 active in the January 辛丑 scope.
  assert.ok(reading.judgmentCore[3].runtime.some(({ entityId, state }) =>
    entityId === natalResource.entityId && state === 'active'))
  assert.ok(reading.luck.month.runtimeStates.some(({ targetEntityId, functionalState }) =>
    targetEntityId === natalResource.entityId && functionalState === 'active'))
  const daily = reading.luck.day
  const dailyCore = reading.judgmentCore.at(-1)
  assert.ok(daily.functionEffects.effects.length)
  assert.equal(new Set(daily.functionEffects.effects.map(({ effectId }) => effectId)).size, daily.functionEffects.effects.length)
  assert.deepEqual(reading.interpretationInputs.at(-1).functionEffectRefs, daily.functionEffects.effects.map(({ effectId }) => effectId))
  const dailyStateIds = new Set(daily.runtimeStates.map(({ stateId }) => stateId))
  assert.ok(daily.functionEffects.effects.every((effect) => effect.scopeId === dailyCore.id
    && effect.runtimeStateRefs.every((id) => dailyStateIds.has(id))
    && dailyCore.stemFunctionEffects.some(({ relationFactId, sourceEntityId, targetEntityId, kind }) =>
      relationFactId === effect.relationFactId && sourceEntityId === effect.sourceEntityId
      && targetEntityId === effect.targetEntityId && kind === effect.effectType)))
  const monthBranch = reading.canonical.chart.pillars.month.value.branch
  const dayStem = reading.canonical.chart.pillars.day.value.stem
  const { calculateTenGod } = await load('dayRelationships')
  const { HIDDEN_STEM_ROLE_TABLE } = await load('hiddenStemRoleTable')
  const expectedPattern = calculateTenGod(dayStem, HIDDEN_STEM_ROLE_TABLE[monthBranch].find(({ role }) => role === 'main').stem)
  assert.ok(Object.isFrozen(reading.judgmentCore))
  assert.ok(reading.judgmentCore.every((snapshot) => Object.isFrozen(snapshot) && snapshot.patternContext.branchPattern === expectedPattern))
  console.log(JSON.stringify(reading.judgmentCore.map(({ scope, structuralSuccess, roleEngine, stemFunctionEffects }) => ({
    scope, stem: structuralSuccess.stem.grade, branch: structuralSuccess.branch.grade, overall: structuralSuccess.overall.grade,
    byeong: roleEngine.byeongStatus, guEung: roleEngine.guEungStatus, appliedStemEffects: stemFunctionEffects.length,
    stemReasons: structuralSuccess.stem.reasonCodes, damageChecks: roleEngine.incompleteDamageChecks,
    damage: roleEngine.damagePaths.map(({ damagedFunction, action, state }) => ({ damagedFunction, action, state })),
  }))))
  console.log('P0 judgment regressions passed')
} finally {
  await server.close()
}
