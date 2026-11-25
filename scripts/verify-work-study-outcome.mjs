import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/lib/${path}.ts`)
const referenceTime = '2027-01-15T00:00:00.000Z'
const undated = { periodId: 'undated', from: { kind: 'unknown', reason: 'source' }, to: { kind: 'unknown', reason: 'source' } }

try {
  const [{ runJudgmentCore }, { buildWorkStudyOutcomes }, { buildMoneyOutcome }, { assembleReading },
    { buildCustomerReadingPlan }, { renderCustomerReadingKo }, { readBirthCustomerPlan }, { validateReadingAssembly }] = await Promise.all([
    load('judgment/core/luckScope'), load('outcome/workStudy'), load('outcome/money/moneyOutcome'), load('reading/assembleReading'),
    load('reading/customer/buildCustomerReadingPlan'), load('reading/customer/renderCustomerReadingKo'), load('product/readBirthChart'),
    load('reading/validateReadingAssembly'),
  ])
  const chartChain = (id, values, natalPolicyEvidence = [], natalValidity = undated, luck = []) => runJudgmentCore({
    executionId: id, natalValidity, natalCombinations: [], luck, natalPolicyEvidence,
    natal: Object.fromEntries(['year', 'month', 'day', 'time'].map((position, i) => [position, {
      stem: { id: `${position}:stem`, value: values[i][0] }, branch: { id: `${position}:branch`, value: values[i][1] },
    }])),
  })
  const chart = (...input) => chartChain(...input)[0]
  const relation = (snapshot, policy) => {
    const actual = snapshot.actualFunctions.find(item => item.policyId === policy && item.structuralEffect?.currentlyEffective)
    return snapshot.stemFacts.find(item => item.id === actual?.relationFactId)
  }
  const link = (snapshot, edge, kind, evidenceId, entityId = edge.source.id) => ({
    assessment: 'confirmed', scopeId: snapshot.id, relationId: edge.id, targetId: kind, entityId, kind, evidenceIds: [evidenceId],
  })

  const wealthChart = chart('SRC-07-1026', ['丁巳', '庚戌', '丁卯', '戊申'])
  const earning = relation(wealthChart, 'HO-01')
  assert.ok(earning)
  const work = link(wealthChart, earning, 'work_task', '07:L1026–1031:management-and-sales')
  const workFacts = buildWorkStudyOutcomes([wealthChart], [work], referenceTime)
  assert.deepEqual(workFacts.map(fact => fact.semanticType), ['work_capacity'])
  assert.equal(workFacts[0].certainty, 'conditional')
  assert.equal(buildWorkStudyOutcomes([wealthChart], [{ ...work, evidenceIds: [] }, { ...work, assessment: 'provisional' },
    { ...work, entityId: 'unrelated' }, { ...work, scopeId: 'unrelated' },
    { ...work, kind: 'role_opportunity', opportunityEvidenceIds: ['offer-without-verified-recovery'] }], referenceTime).length, 0)
  const moneyFacts = buildMoneyOutcome({ natal: wealthChart, referenceTime })
  assert.ok(moneyFacts.some(fact => fact.semanticType === 'money_acquisition'))
  assert.ok(moneyFacts.some(fact => fact.semanticType === 'money_loss_or_division'))
  assert.ok(moneyFacts.some(fact => fact.semanticType === 'money_retention' && fact.direction === 'unfavorable'))

  // Source 07 L1013–1024 explicitly links the functioning output/control path to imitation and learning.
  const studyPillars = ['庚申', '己丑', '丙申', '壬辰']
  const studyPolicy = [{
    entityId: 'time:stem', condition: 'harmful_killing', evidenceIds: ['07:L1013–1024:residual-killing-pressure'],
  }]
  const studyChart = chart('SRC-07-1013', studyPillars, studyPolicy)
  const learning = relation(studyChart, 'HO-04')
  assert.ok(learning)
  const study = link(studyChart, learning, 'learning', '07:L1013–1024:learning-and-imitation')
  const studyFacts = buildWorkStudyOutcomes([studyChart], [study], referenceTime)
  // 07 L1013–1024 distinguishes expression-led learning from the
  // independently supported difficulty sustaining the same pace.
  assert.deepEqual(studyFacts.map(({ semanticType, direction }) => [semanticType, direction]),
    [['study_capacity', 'favorable'], ['study_difficulty', 'unfavorable']])
  assert.deepEqual(buildWorkStudyOutcomes([{ ...studyChart, capacity: null }], [study], referenceTime)
    .map(({ semanticType }) => semanticType), ['study_capacity'])
  assert.equal(buildWorkStudyOutcomes([studyChart], [{ ...study, kind: 'formal_learning' }], referenceTime).length, 0)

  function planFor(snapshot, facts, productScope, knownFacts) {
    const assembly = assembleReading({ luckScopes: [snapshot],
      referenceTime, workStudyOutcomes: facts, customerContext: { knownFacts }, productScope })
    validateReadingAssembly(assembly)
    return buildCustomerReadingPlan({ assembly })
  }
  const boundaries = {
    periodId: 'publication-boundary-fixture', from: { kind: 'exact', instant: referenceTime },
    to: { kind: 'exact', instant: '2027-01-16T00:00:00.000Z' },
  }
  const boundaryChart = chart('study-publication-fixture', studyPillars, studyPolicy, boundaries)
  const scopedLearning = link(boundaryChart, relation(boundaryChart, 'HO-04'), 'learning', 'fixture:confirmed-learning-target')
  const scopedStudyFacts = buildWorkStudyOutcomes([boundaryChart], [scopedLearning], referenceTime)
  const officerPillars = ['丁巳', '辛酉', '甲寅', '甲子']
  const branchChart = chart('branch-formal-learning', ['丙午', '辛酉', '甲寅', '甲戌'], [], boundaries)
  const branchAttack = branchChart.branchDamage.relations.find(path =>
    path.source.id === 'year:branch' && path.target.id === 'month:branch' && path.action === 'control')
  assert.ok(branchAttack)
  const branchStudy = link(branchChart, branchAttack, 'formal_learning', 'fixture:verified-learning-environment', branchAttack.target.id)
  const branchFacts = buildWorkStudyOutcomes([branchChart], [branchStudy], referenceTime)
  assert.deepEqual(branchFacts.map(fact => fact.semanticType), ['expression_vs_formal_learning_conflict'])
  const branchPlan = planFor(branchChart, branchFacts, 'premium', { lifeStage: 'student' })
  assert.ok(branchPlan.structuralExplanationUnits.some(item => item.functionalChanges.some(change =>
    change.relationId === branchAttack.id && change.branchParticipants.some(part => part.position === 'month' && part.tenGod === '正官'))))
  const [exposed, relieved] = chartChain('officer-loss-and-relief', officerPillars, [], boundaries, [{
    scope: 'greatLuck', validity: { ...boundaries, periodId: 'officer-relief-period' },
    pillar: { stem: { id: 'relief:stem', value: '壬' }, branch: { id: 'relief:branch', value: '子' } },
  }])
  const exposure = relation(exposed, 'OFF-03')
  const role = link(exposed, exposure, 'existing_role', 'fixture:existing-role', exposure.target.id)
  const formal = link(exposed, exposure, 'formal_learning', 'fixture:formal-learning-requirement', exposure.target.id)
  assert.deepEqual(buildWorkStudyOutcomes([exposed], [role, formal], referenceTime).map(fact => fact.semanticType).sort(),
    ['expression_vs_formal_learning_conflict', 'work_difficulty'])
  const guarded = chart('guarded-officer', ['丁巳', '辛酉', '甲寅', '壬子'], [], boundaries)
  const guardedAttack = guarded.stemFacts.find(({ source, target, action }) =>
    source.id === exposure.source.id && target.id === exposure.target.id && action === exposure.action)
  assert.equal(buildWorkStudyOutcomes([guarded], [link(guarded, guardedAttack, 'existing_role',
    'fixture:existing-role', guardedAttack.target.id)], referenceTime).length, 0)
  const removedAttack = relieved.stemFacts.find(({ source, target, action }) =>
    source.id === exposure.source.id && target.id === exposure.target.id && action === exposure.action)
  const resolvedRole = link(relieved, removedAttack, 'existing_role', 'fixture:existing-role', removedAttack.target.id)
  const opportunity = { ...resolvedRole, kind: 'role_opportunity', targetId: 'reviewed-role-offer' }
  assert.deepEqual(buildWorkStudyOutcomes([relieved], [resolvedRole, opportunity], referenceTime)
    .map(fact => fact.semanticType), ['work_resolution'])
  const scopedOutcomes = buildWorkStudyOutcomes([relieved], [resolvedRole, { ...opportunity, opportunityEvidenceIds: ['fixture:existing-offer'] }],
    referenceTime)
  assert.deepEqual(scopedOutcomes.map(fact => fact.semanticType).sort(), ['role_acquisition', 'work_resolution'])
  const scopedPlan = buildCustomerReadingPlan({ assembly: assembleReading({ luckScopes: [exposed, relieved],
    referenceTime, workStudyOutcomes: scopedOutcomes, productScope: 'premium' }) })
  assert.ok(scopedPlan.chapters.find(chapter => chapter.chapterId === 'CR-04').paragraphPlans.some(plan =>
    plan.sourceOutcomeIds.some(id => scopedOutcomes.some(outcome => outcome.id === id))))
  assert.ok(!scopedPlan.chapters.find(chapter => chapter.chapterId === 'CR-09').paragraphPlans.some(plan =>
    plan.sourceOutcomeIds.some(id => scopedOutcomes.some(outcome => outcome.id === id))))
  assert.equal(planFor(studyChart, studyFacts, 'premium', { lifeStage: 'student' })
    .chapters.find(chapter => chapter.chapterId === 'CR-06').paragraphPlans.length, 0)
  const student = planFor(boundaryChart, scopedStudyFacts, 'premium', { lifeStage: 'student' })
  const studentParagraph = student.chapters.find(chapter => chapter.chapterId === 'CR-06').paragraphPlans[0]
  assert.equal(studentParagraph.expression.scene, 'student')
  assert.equal(studentParagraph.reasonStatus, 'complete')
  assert.ok(student.structuralExplanationUnits.some(item => item.functionalChanges.some(change =>
    change.actorTenGod === '傷官' && change.actorPosition === 'month')))
  assert.ok(studentParagraph.expression.structuralExplanationUnitIds.length)
  assert.ok(renderCustomerReadingKo(student).find(chapter => chapter.chapterId === 'CR-06').paragraphs
    .some(({ text }) => text.includes('어려운 과제를 다루는 데')))
  const unboundStudent = planFor(studyChart, [], 'premium', { lifeStage: 'student' })
  assert.equal(unboundStudent.chapters.find(chapter => chapter.chapterId === 'CR-06').paragraphPlans.length, 0)
  assert.ok(!planFor(boundaryChart, scopedStudyFacts, 'free', { lifeStage: 'student' }).chapters.some(chapter => chapter.chapterId === 'CR-06'))
  const expired = scopedStudyFacts.map(fact => ({ ...fact, temporalStatus: 'expired', currentlyEffective: false }))
  assert.equal(planFor(boundaryChart, expired, 'premium', {}).chapters.find(chapter => chapter.chapterId === 'CR-06').paragraphPlans.length, 0)

  const births = JSON.parse(readFileSync(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))
  const input = births['CS-126']
  const actualPlan = readBirthCustomerPlan({ date: input.date, time: { known: true, value: input.time },
    gender: '女性', timeCorrectionMode: 'none' }, { referenceTime, productScope: 'premium', customerContext: {
    knownFacts: { careerStatus: 'employed' },
  } })
  assert.ok(['CR-01', 'CR-02', 'CR-03', 'CR-04', 'CR-05', 'CR-06', 'CR-07'].every(id =>
    actualPlan.chapters.some(chapter => chapter.chapterId === id)))
  assert.deepEqual(actualPlan.chapterGroups, [
    ['CR-01'], ['CR-02'], ['CR-03'], ['CR-05'], ['CR-06'], ['CR-07'], ['CR-04', 'CR-08', 'CR-09'],
  ])
  const laterPlan = readBirthCustomerPlan({ date: input.date, time: { known: true, value: input.time },
    gender: '女性', timeCorrectionMode: 'none' }, { referenceTime: '2027-07-15T00:00:00.000Z', productScope: 'premium',
    workStudyTargets: ([natal]) => {
      const output = ['WEALTH-01', 'FOOD-01', 'FOOD-04', 'HO-01', 'PEER-03', 'ROB-04']
        .map(policy => relation(natal, policy)).find(Boolean)
      return output ? [link(natal, output, 'work_task', 'fixture:reviewed-work-task-on-real-birth')] : []
    },
  })
  assert.ok(laterPlan.chapters.find(chapter => chapter.chapterId === 'CR-06').paragraphPlans.some(plan =>
    plan.expression.kind === 'work_study' && plan.slots.includes('work_capacity')))
  assert.ok(renderCustomerReadingKo(laterPlan).find(chapter => chapter.chapterId === 'CR-06').paragraphs.some(text =>
    JSON.stringify(text).includes('수익으로 이어 갈')))
  const behaviorBirth = births['CS-127']
  const behavior = readBirthCustomerPlan({ date: behaviorBirth.date, time: { known: true, value: behaviorBirth.time },
    gender: '女性', timeCorrectionMode: 'none' }, { referenceTime, productScope: 'free' })
  assert.ok(behavior.chapters.find(chapter => chapter.chapterId === 'CR-03').paragraphPlans.some(plan =>
    plan.expression.kind === 'personality' && plan.expression.pattern?.resultCoverage === 'supported'))
  const chapterSummary = actualPlan.chapters.map(({ chapterId, paragraphPlans }) => [chapterId, paragraphPlans.length])
  console.log(JSON.stringify({ work: workFacts.map(fact => fact.semanticType), study: studyFacts.map(fact => fact.semanticType),
    scoped: scopedOutcomes.map(fact => fact.semanticType), money: [...new Set(moneyFacts.map(fact => fact.semanticType))],
    actual: 'CS-126', chapters: chapterSummary,
    july: laterPlan.chapters.map(({ chapterId, paragraphPlans }) => [chapterId, paragraphPlans.length]) }))
  console.log('PASS work/study evidence, life mapping, expiry and premium boundary')
} finally {
  await server.close()
}
