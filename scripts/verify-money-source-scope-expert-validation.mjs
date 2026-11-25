import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/money-expert-source-case-snapshots.json', import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const integrated = process.argv.includes('--integrated')
const unknownPeriod = periodId => ({ periodId,
  from: { kind: 'unknown', reason: 'source-does-not-state-gregorian-boundary' },
  to: { kind: 'unknown', reason: 'source-does-not-state-gregorian-boundary' } })
const pillar = (fixtureId, position, ganZhi) => ({
  stem: { id: `${fixtureId}:${position}:${ganZhi}:stem`, value: ganZhi[0] },
  branch: { id: `${fixtureId}:${position}:${ganZhi}:branch`, value: ganZhi[1] },
})

const scopeInputs = (fixture, scopes) => scopes.map(({ scope, ganZhi, label }) => ({
  scope, pillar: pillar(fixture.fixtureId, label, ganZhi), validity: unknownPeriod(`${fixture.fixtureId}:${label}`),
}))

try {
  const [{ runJudgmentCore }, { buildMoneyOutcome }, { assembleReading }] = await Promise.all([
    load('judgment/core/luckScope'), load('outcome/money/moneyOutcome'), load('reading/index'),
  ])
  const support = integrated ? Object.assign({}, ...await Promise.all([
    'judgment/producers/shared', 'dayRelationships', 'twelveStages', 'personality/index',
    'personalityStructuralReading', 'outcome/relationship/relationshipOutcome', 'outcome/health/healthOutcome',
    'outcome/workStudy', 'reading/customer/buildCustomerReadingPlan', 'reading/customer/renderCustomerReadingKo',
  ].map(load))) : undefined
  const evaluate = (fixture, declaredScopes, evaluationId = fixture.fixtureId) => {
    const natal = Object.fromEntries(Object.entries(fixture.pillars).map(([position, ganZhi]) => {
      const value = pillar(fixture.fixtureId, position, ganZhi)
      if (support) for (const part of ['stem', 'branch']) {
        value[part].id = support.recordId('entity', [`/chart/pillars/${position}/value/ganZhi`, part])
      }
      return [position, value]
    }))
    const luck = scopeInputs({ ...fixture, fixtureId: evaluationId }, declaredScopes)
    const snapshots = runJudgmentCore({ executionId: evaluationId, natal,
      natalValidity: unknownPeriod(`${evaluationId}:natal`),
      // Source §§952–961 states 戊癸合 and specifies that the time stem remains.
      natalCombinations: (fixture.natalStops ?? []).map((pair) => pair.map((position) => natal[position].stem.id)), luck,
      natalPolicyEvidence: fixture.study ? [{
        entityId: natal.time.stem.id, condition: 'harmful_killing', evidenceIds: ['07:L1013–1024:residual-killing-pressure'],
      }] : [] })
    const [natalSnapshot, ...luckSnapshots] = snapshots
    const evaluatedLuck = luckSnapshots.map((snapshot, index) => ({ snapshot, evaluatedAt: '',
      parentSnapshot: luckSnapshots[index - 1] ?? natalSnapshot }))
    const moneyOutcomes = buildMoneyOutcome({ natal: natalSnapshot, referenceTime: '', luck: evaluatedLuck })
    const domain = {}
    let natalPersonality
    if (support) {
      const confirmed = value => ({ status: 'confirmed', value })
      const chart = { pillars: {}, basicRelations: {} }
      const dayStem = natal.day.stem.value
      for (const [position, { stem, branch }] of Object.entries(natal)) {
        chart.pillars[position] = confirmed({ stem: stem.value, branch: branch.value, ganZhi: stem.value + branch.value })
        chart.basicRelations[position] = confirmed({
          relationships: support.calculateDayRelationships(dayStem, branch.value),
          stemTenGod: support.calculateTenGod(dayStem, stem.value),
          twelveStage: support.calculateTwelveStage(dayStem, branch.value),
        })
      }
      const canonical = { chart, context: { referenceTime: '' },
        birthInput: { gender: { 여성: '女性', 남성: '男性' }[fixture.gender] } }
      const outcomeInput = { canonical, natal: natalSnapshot, luck: evaluatedLuck }
      domain.relationshipOutcomes = support.buildRelationshipOutcome(outcomeInput)
      domain.healthOutcomes = support.buildHealthOutcome(outcomeInput)
      natalPersonality = support.applyStructuralRoleModifiers(support.buildNatalPersonality(chart),
        support.projectNatalStructuralReading(natalSnapshot))
      const task = fixture.study ? ['HO-04', 'learning', '07:L1013–1024:learning-and-imitation']
        : fixture.fixtureId === 'SRC-07-1026' ? ['HO-01', 'work_task', '07:L1026–1031:management-and-sales'] : null
      if (task) {
        const [policy, kind, evidence] = task
        const actual = natalSnapshot.actualFunctions.find(item => item.policyId === policy && item.structuralEffect?.currentlyEffective)
        const relation = natalSnapshot.stemFacts.find(item => item.id === actual?.relationFactId)
        assert.ok(relation, policy)
        domain.workStudyOutcomes = support.buildWorkStudyOutcomes(snapshots, [{
          assessment: 'confirmed', scopeId: natalSnapshot.id, relationId: relation.id, targetId: kind,
          entityId: relation.source.id, kind, evidenceIds: [evidence],
        }], '')
        assert.ok(domain.workStudyOutcomes.some(fact => fact.semanticType === (fixture.study ? 'study_capacity' : 'work_capacity')))
      }
      if (fixture.fixtureId === 'SRC-07-2328' && declaredScopes[1]?.ganZhi === '乙巳') {
        const latest = snapshots.at(-1)
        const damage = latest.branchDamage.paths.find(({ damagedFunction }) => damagedFunction === 'branch_officer')
        assert.ok(damage)
        domain.workStudyOutcomes = support.buildWorkStudyOutcomes(snapshots, [{
          assessment: 'confirmed', scopeId: latest.id, relationId: damage.relationRefs[0], targetId: 'existing-role',
          entityId: damage.targetEntityId, kind: 'existing_role', evidenceIds: ['07:L2334–2337:officer-and-role'],
        }], '')
        assert.deepEqual(domain.workStudyOutcomes.map(({ semanticType, temporalStatus, currentlyEffective }) =>
          [semanticType, temporalStatus, currentlyEffective]), [['work_difficulty', 'undated', false]])
      }
    }
    const assembly = assembleReading({ luckScopes: snapshots, moneyOutcomes, ...domain,
      personality: natalPersonality, productScope: 'premium', referenceTime: '' })
    let preview
    if (support) {
      const plan = support.buildCustomerReadingPlan({ assembly, natal: natalPersonality })
      assert.ok(plan.semanticUnits.every(unit => unit.scope === 'natal'))
      const rendered = support.renderCustomerReadingKo(plan, natalPersonality)
      assert.ok(rendered.some(({ paragraphs }) => paragraphs.length))
      preview = {
        natalInternalPreview: rendered.map(({ chapterId, paragraphs }) => ({ chapterId,
          paragraphs: paragraphs.map(({ text, plan }) => ({ text, slots: plan.slots, mapping: plan.sourceMappingIds })) })),
        outcomes: Object.fromEntries(Object.entries(domain).map(([key, facts]) =>
          [key, facts.map(({ semanticType, scope, direction, certainty }) => ({ semanticType, scope, direction, certainty }))])),
      }
    }
    const snapshotSummaries = snapshots.map((snapshot, index) => {
      const sourcePeriod = declaredScopes[index - 1]
      const relations = [...snapshot.stemFacts, ...snapshot.patternFacts]
      const relationsById = new Map(relations.map(relation => [relation.id, relation]))
      return {
        snapshotId: snapshot.id,
        scope: snapshot.scope,
        sourceScopeLabel: sourcePeriod?.label ?? 'natal',
        sourceGanZhi: sourcePeriod?.ganZhi,
        runtimeStatus: snapshot.runtimeStatus,
        structuralSuccess: snapshot.structuralSuccess,
        capacity: snapshot.capacity,
        protections: snapshot.actualFunctions.flatMap(({ policyId, structuralEffect }) =>
          structuralEffect?.blockedBy?.kind === 'active_protection'
            ? [{ policyId, ...structuralEffect.blockedBy }] : []),
        outputDrains: snapshot.stemFunctionEffects.filter(effect => effect.kind === 'drain'
          && snapshot.stemFacts.some(({ id, source, target }) => id === effect.relationFactId
            && source.dayMaster && ['食神', '傷官'].includes(target.tenGod))),
        byeongStatus: snapshot.roleEngine.byeongStatus,
        guEungStatus: snapshot.roleEngine.guEungStatus,
        damagePaths: snapshot.roleEngine.damagePaths,
        incompleteDamageChecks: snapshot.roleEngine.incompleteDamageChecks,
        pattern: { branchPattern: snapshot.patternContext.branchPattern,
          heavenlyPatterns: snapshot.patternContext.heavenlyPatterns,
          specialYongShen: snapshot.patternContext.specialYongShen,
          yongShenRelations: snapshot.patternContext.yongShenRelations },
        branchRelations: snapshot.branchFacts.map(({ kind, participants }) => ({ kind, participants })),
        actualFunctions: snapshot.actualFunctions.filter(item => ['operating', 'reduced'].includes(item.function))
          .map(item => {
            const relation = relationsById.get(item.relationFactId)
            return { id: item.id, relationFactId: item.relationFactId, action: relation?.action,
              actor: relation?.source.tenGod, target: relation?.target.tenGod,
              participantIds: relation ? [relation.source.id, relation.target.id] : [],
              function: item.function, direction: item.direction, policyId: item.policyId,
              roleId: item.roleId, effect: item.structuralEffect?.effect,
              currentlyEffective: item.structuralEffect?.currentlyEffective }
          }),
        roles: snapshot.roleEngine.currentRoles.map(role => ({ id: role.roleId,
          currentFunction: role.currentFunction, currentState: role.currentState, pathRefs: role.pathRefs,
          strengthened: role.strengthened, functionEffects: role.functionEffects })),
      }
    })
    const money = moneyOutcomes.map(fact => ({ id: fact.id, semanticType: fact.semanticType,
      result: fact.result, direction: fact.direction, scope: fact.scope, certainty: fact.certainty,
      lifecycle: fact.lifecycle, currentlyEffective: fact.currentlyEffective,
      sourceJudgmentIds: fact.sourceJudgmentIds, sourceRelationIds: fact.sourceRelationIds,
      sourceRoleIds: fact.sourceRoleIds, provenance: fact.provenance }))
    const explanations = assembly.structuralExplanationUnits.map(unit => ({ id: unit.id,
      outcomeFactId: unit.outcomeFactId, direction: unit.direction, scope: unit.scope,
      primaryCauseRefs: unit.primaryCauseRefs, supportingCauseRefs: unit.supportingCauseRefs,
      competingCauseRefs: unit.competingCauseRefs, unresolvedCauseRefs: unit.unresolvedCauseRefs,
      causePaths: unit.causePaths, functionalChanges: unit.functionalChanges, provenanceIds: unit.provenanceIds }))
    return { evaluationId, sourceScopes: declaredScopes, snapshots: snapshotSummaries, moneyOutcomes: money,
      explanations, ...(preview ?? {}), outcomeLimitation: luckSnapshots.length
        ? 'PUBLICATION_LIMIT: scoped money outcomes require exact validity; the internal Judgment runs on the stated pillars.'
        : null }
  }

  const byId = new Map(fixtures.map(item => [item.fixtureId, item]))
  const results = [
    evaluate(byId.get('SRC-07-0982'), []),
    evaluate(byId.get('SRC-07-1026'), []),
    evaluate(byId.get('SRC-07-0952'), [
      { scope: 'greatLuck', ganZhi: '丁卯', label: 'daewoon-丁卯' },
      { scope: 'yearlyLuck', ganZhi: '乙巳', label: 'sewoon-乙巳' },
    ]),
    evaluate(byId.get('SRC-07-0999'), [
      { scope: 'greatLuck', ganZhi: '庚戌', label: 'daewoon-庚戌' },
      { scope: 'yearlyLuck', ganZhi: '甲辰', label: 'sewoon-甲辰' },
      { scope: 'monthlyLuck', ganZhi: '庚午', label: 'month-庚午' },
    ]),
    evaluate(byId.get('SRC-07-2301'), [
      { scope: 'greatLuck', ganZhi: '丙辰', label: 'daewoon-丙辰' },
      { scope: 'yearlyLuck', ganZhi: '癸卯', label: 'sewoon-癸卯' },
    ], 'SRC-07-2301-丙辰-癸卯'),
    evaluate(byId.get('SRC-07-2301'), [
      { scope: 'greatLuck', ganZhi: '丁巳', label: 'later-daewoon-丁巳' },
    ], 'SRC-07-2301-later-丁巳'),
  ]
  assert.equal(results.length, 6)
  const supportedWealth = results[1].snapshots[0]
  assert.ok(supportedWealth.actualFunctions.some(({ policyId, function: state }) =>
    policyId === 'HO-01' && ['operating', 'reduced'].includes(state)))
  assert.ok(supportedWealth.actualFunctions.some(({ policyId }) => policyId === 'HO-supported-wealth-pressure'))
  assert.ok(supportedWealth.damagePaths.some(({ damagedFunction, state }) =>
    damagedFunction === 'wealth' && state === 'weakened'))
  assert.equal(supportedWealth.byeongStatus, 'confirmed')
  const [, , resourceYear, resourceMonth] = results[3].snapshots
  assert.ok(resourceYear.actualFunctions.some(({ policyId }) => policyId === 'HO-06'))
  assert.ok(resourceMonth.actualFunctions.some(({ policyId }) => policyId === 'HO-06'))
  assert.equal(resourceYear.structuralSuccess.overall.grade, '不利優勢')
  assert.equal(resourceMonth.structuralSuccess.overall.grade, '不利優勢')
  assert.ok(results.slice(2).every(({ moneyOutcomes }) => moneyOutcomes.every(({ scope }) => scope === 'natal')))
  assert.ok(results[4].snapshots[1].actualFunctions.some(({ policyId }) => policyId === 'ROB-04'))
  assert.ok(results[5].snapshots[1].actualFunctions.some(({ policyId }) => policyId === 'ROB-04'))
  assert.deepEqual(results.slice(2).map(item => item.snapshots.slice(1).map(state => state.scope)), [
    ['greatLuck', 'yearlyLuck'], ['greatLuck', 'yearlyLuck', 'monthlyLuck'],
    ['greatLuck', 'yearlyLuck'], ['greatLuck'],
  ])
  if (integrated) {
    assert.equal(results[0].snapshots[0].outputDrains.length, 2)
    assert.ok(results[0].moneyOutcomes.some(({ semanticType }) => semanticType === 'money_acquisition'))
    const [base, guarded, reactivated] = results[2].snapshots
    const resourceId = support.recordId('entity', ['/chart/pillars/time/value/ganZhi', 'stem'])
    const dayId = support.recordId('entity', ['/chart/pillars/day/value/ganZhi', 'stem'])
    assert.ok(base.actualFunctions.some(({ action, participantIds }) => action === 'generate'
      && participantIds[0] === resourceId && participantIds[1] === dayId))
    assert.ok(guarded.protections.some(({ policyId, protectorId, evidenceRefs }) =>
      policyId === 'killing-pressure-after-protection' && protectorId === resourceId && evidenceRefs.length >= 2))
    assert.equal(reactivated.structuralSuccess.branch.grade, '有利優勢')
    assert.equal(reactivated.structuralSuccess.overall.grade, '不利優勢')
    assert.equal(reactivated.byeongStatus, 'confirmed')
    assert.ok(reactivated.damagePaths.some(({ damagedFunction, relationRefs, state }) =>
      damagedFunction === 'day_master' && ['active', 'weakened'].includes(state) && relationRefs.length >= 3))
    const study = { fixtureId: 'SRC-07-1013', gender: '남성',
      pillars: { year: '庚申', month: '己丑', day: '丙申', time: '壬辰' }, study: true }
    const work = byId.get('SRC-07-2328')
    for (const ganZhi of ['庚寅', '辛卯']) {
      const evaluated = evaluate(study, [{ scope: 'greatLuck', ganZhi, label: ganZhi }], `${study.fixtureId}-${ganZhi}`)
      assert.deepEqual(evaluated.outcomes.workStudyOutcomes.map(({ semanticType }) => semanticType),
        ['study_capacity', 'study_difficulty'])
      results.push(evaluated)
    }
    for (const year of ['甲辰', '乙巳']) {
      const evaluated = evaluate(work, [
        { scope: 'greatLuck', ganZhi: '壬申', label: 'daewoon-壬申' },
        { scope: 'yearlyLuck', ganZhi: year, label: `sewoon-${year}` },
      ], `${work.fixtureId}-壬申-${year}`)
      assert.ok(evaluated.snapshots[1].branchRelations.some(({ kind, participants }) =>
        kind === 'punishment' && participants.length === 3))
      results.push(evaluated)
    }
  }
  const report = integrated && !process.argv.includes('--details') ? results.map(result => ({
    evaluationId: result.evaluationId, sourceScopes: result.sourceScopes,
    snapshots: result.snapshots.map(({ scope, structuralSuccess, byeongStatus, guEungStatus }) => ({
      scope, stem: structuralSuccess.stem.grade, branch: structuralSuccess.branch.grade,
      overall: structuralSuccess.overall.grade, byeongStatus, guEungStatus,
    })),
    semantics: [...new Set([...result.moneyOutcomes, ...Object.values(result.outcomes).flat()].map(({ semanticType }) => semanticType))],
    chapterParagraphCounts: Object.fromEntries(result.natalInternalPreview.map(({ chapterId, paragraphs }) => [chapterId, paragraphs.length])),
  })) : results
  console.log(JSON.stringify({ validationType: 'source-scope-interpretation',
    input: 'published-pillars-without-dates', guessedGregorianValues: 0, results: report }, null, 2))
} finally {
  await server.close()
}
