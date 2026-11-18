import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/judgment/${path}.ts`)
const fixture = JSON.parse(await readFile(new URL('./fixtures/byeong-contract-inputs.json', import.meta.url), 'utf8'))
// Expected results for synthetic contract inputs, including injected damage.
const expected = { 'CS-005': ['壬', '子'], 'CS-126': ['辛'], 'CS-127': ['戌', '未'] }
const copy = structuredClone
const freeze = (value) => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
let checks = 0
const check = (fn) => { fn(); checks++ }
try {
  const { evaluateByeongCandidates, foodDamageReviewClaim, foodDamagePathClaim } = await load('evaluators/byeongCandidates/index')
  const { issueByeongRuleReceipts } = await load('evaluators/byeongCandidates/ruleEvidence')
  const { evaluateByeongJudgment } = await load('evaluators/byeongJudgment/index')
  const { createExecutionScopeContext } = await load('runtime/executionScopeContext')
  const A = await readFile('src/docs/source/A_rev179.md', 'utf8')
  const C = await readFile('src/docs/source/C_rev215.md', 'utf8')
  const direct = issueByeongRuleReceipts(A, 'raw-A179')
  const reference = C.split('C-10-1. 사례별 20항목')[1].split('\n').find((line) => line.startsWith('8 병\t')).split('\t')
  check(() => {
    for (const [caseId, columns] of [['CS-005', 1], ['CS-126', 3], ['CS-127', 4]]) {
      for (const value of expected[caseId]) assert.ok(reference[columns].includes(value))
    }
    assert.throws(() => issueByeongRuleReceipts(A.replace('실제로 식신을 손상하는', '식신을 손상하는'), 'raw-A179'))
  })

  const date = (year) => `${year}-01-01T00:00:00.000Z`
  const window = { periodId: 'natal-window', from: { kind: 'exact', instant: date(2026) }, to: { kind: 'exact', instant: date(2028) } }
  function setup(caseId) {
    const data = fixture[caseId]
    const positions = ['year', 'month', 'day', 'time']
    const producerRef = { producerId: 'fixture-observations', version: '1', sourceRef: caseId, inputFactIds: positions.map((pos) => `pillar:${pos}`) }
    const evidence = { contractVersion: '1', evidenceContextId: `evidence:${caseId}`, records: [] }
    const producer = {
      producerRef, evidence, coverage: [], relations: [], unavailableEntityFactRefs: [],
      facts: positions.map((pos, i) => ({ id: `pillar:${pos}`, value: data.pillars[i], assessment: 'confirmed',
        uncertaintyIds: [], evidenceIds: ['input-premises'], provenance: { producerRef, method: 'test-fixture' } })),
      entities: positions.flatMap((position, i) => ['stem', 'branch'].map((part, j) => ({
        entityId: `${position}:${part}`, part, position, value: data.pillars[i][j], origin: 'natal', sourceScope: 'natal',
        canonicalFactRef: `pillar:${position}`, evidenceIds: ['input-premises'], assessment: 'confirmed', uncertaintyIds: [],
      }))),
    }
    const context = createExecutionScopeContext(producer, { executionId: caseId, stage: 'natal', referenceTime: date(2027),
      selectedPeriodRefs: {}, natalInspectionPeriod: window })
    const app = (ruleId) => ({ applicationId: `app:${ruleId}`, executionId: caseId, scopeId: context.scopeId, ruleId, ruleVersion: 'A179' })
    const doc = direct[0].sourceRef.document
    const attest = (evidenceId, claimRef) => ({ evidenceId, sourceType: 'operator-confirmed', documentRevision: null, ruleId: null,
      sourceRef: { kind: 'operator-confirmed', decisionRecordRef: `fixture:${evidenceId}`, approvalScope: context.scopeId, documentRefs: [doc] },
      status: 'confirmed', usage: 'runtime-evidence', uncertaintyIds: [], note: 'Synthetic handoff test only',
      verification: { claimRef, method: 'fixture-observation', checkedByRef: 'verify-byeong-contract', basisEvidenceIds: [direct[0].evidenceId] } })
    evidence.records.push(attest('input-premises', 'fixture-upstream-premises'), ...direct)
    const common = { status: 'confirmed', assessment: 'confirmed', uncertainty: { blockingIds: [], contextIds: [] },
      sourceCandidateIds: ['test-candidate'], supportingFactIds: ['pillar:month'], conflictingFactIds: [],
      evidenceIds: ['input-premises'], contextFactIds: [], contextEvidenceIds: [], reasonCodes: ['FIXTURE'],
      scopeId: context.scopeId, sourceScope: 'natal', trace: [],
      provenance: { producerRef, ruleVersion: 'A179', sourceDocument: doc, method: 'test-fixture' } }
    const patternJudgment = { ...common, judgmentId: 'pattern', patternType: data.components.length > 1 ? '겸격' : '정격',
      monthPatternTenGod: data.pattern, componentTenGods: data.components.map((item) => item.tenGod), sourceRuleIds: ['I-01'] }
    const makeRole = (entityId, role, rule) => ({
      contractVersion: '1', roleStateId: `role:${role}:${entityId}`, subjectKind: 'entity', role, entityId,
      structureRef: null, status: 'evaluated', sourceRuleIds: [rule], evidenceIds: ['input-premises'],
      validScopeId: context.scopeId, provisional: false, uncertaintyIds: [], origin: 'rule-result', applicationRef: app(rule), usage: 'runtime-result',
    })
    const runtimeStates = producer.entities.map(({ entityId }) => ({
      contractVersion: '1', stateId: `state:${entityId}`, targetEntityId: entityId, scopeId: context.scopeId,
      functionalState: 'active', originMode: 'local', transition: 'established', validity: window, uncertaintyIds: [],
      causingApplicationRefs: [app('OP-L01')], evidenceIds: ['input-premises'],
    }))
    const upstreamRoles = data.components.map(({ position }) => makeRole(`${position}:stem`, '용신', 'I-02'))
    const yongShenJudgments = data.components.map(({ position, tenGod }, i) => {
      const entityId = `${position}:stem`
      return { ...common, judgmentId: `yong:${position}`, sourcePatternJudgmentId: 'pattern', entityId, tenGod,
        stem: producer.entities.find((entity) => entity.entityId === entityId).value, sourceRuleIds: ['I-02'],
        runtimeState: runtimeStates.find((state) => state.targetEntityId === entityId), roleStateRef: upstreamRoles[i].roleStateId,
        functionBasis: { axis: '천간', monthBranchEntityId: 'month:branch', exposureFactIds: ['exposure'],
          sourcePatternCandidateIds: ['test-candidate'], hiddenObservationIds: [], handlingRequirement: null } }
    })
    const sangShenJudgments = []
    if (caseId === 'CS-005') {
      const helper = makeRole('month:stem', '상신', 'I-03')
      upstreamRoles.push(helper)
      sangShenJudgments.push({ ...common, judgmentId: 'sang:month', sourcePatternJudgmentId: 'pattern',
        entityId: 'month:stem', stem: '丙', tenGod: '偏印', roleStateRef: helper.roleStateId,
        relatedYongShenIds: ['yong:year'], runtimeStates: runtimeStates.filter((state) => state.targetEntityId === 'month:stem'),
        sourceRuleIds: ['I-03'], functionBasis: { relationFactIds: ['drain', 'support'], rootFactIds: ['root'], coverageRefs: [] } })
    }
    // The existing SangShenJudgment schema is stem-only. Exercise a supplied evaluated branch role.
    if (caseId === 'CS-127') upstreamRoles.push(makeRole('time:branch', '상신', 'I-03'))
    const input = { producer, context, natalScopeId: context.scopeId, patternJudgment, yongShenJudgments, sangShenJudgments,
      upstreamRoles, runtimeStates, evidence, reviews: [] }
    const reviewFor = (entityId) => input.reviews.find((review) => review.sourceEntityId === entityId)
    function sign(review) {
      const observationIds = new Set([review.reviewId, ...review.paths.map((path) => path.pathId)])
      evidence.records = evidence.records.filter((record) => !observationIds.has(record.evidenceId))
      review.evidenceIds = [review.reviewId]
      evidence.records.push(attest(review.reviewId, foodDamageReviewClaim(review)))
      for (const path of review.paths) {
        path.evidenceIds = [path.pathId]
        evidence.records.push(attest(path.pathId, foodDamagePathClaim(review.reviewId, path)))
      }
    }
    function addReview(entityId, resource, observation) {
      const review = { reviewId: `review:${entityId}`, ruleId: 'I-04-2', sourceEntityId: entityId, targetEntityId: 'month:branch',
        scopeId: context.scopeId, producerRef, resource, assessment: 'confirmed', uncertaintyIds: [], completion: 'complete',
        factIds: [...new Set([producer.entities.find((entity) => entity.entityId === entityId).canonicalFactRef, 'pillar:month'])],
        paths: observation ? [{ pathId: `path:${entityId}`, sourceStateId: `state:${entityId}`, targetStateId: 'state:month:branch',
          relation: observation.relation, existence: observation.existence, effect: observation.effect }] : [] }
      input.reviews.push(review)
      sign(review)
      return review
    }
    for (const observation of data.observations ?? []) {
      assert.equal(observation.targetPosition, 'month')
      addReview(`${observation.sourcePosition}:branch`, observation.resource, observation)
    }
    return { input, reviewFor, addReview, sign, app }
  }
  const run = (input) => evaluateByeongJudgment({ ...input, candidateResult: evaluateByeongCandidates(input) })
  const ids = (output) => output.judgments.filter((item) => item.status === 'confirmed').map((item) => item.entityId).sort()
  const resultFor = (result, id) => result.judgments.find((item) => item.entityId === id)

  const { input } = setup('CS-127')
  const before = JSON.stringify(input)
  freeze(input)
  const baseline = run(input)
  check(() => { assert.equal(JSON.stringify(run(input)), JSON.stringify(baseline)); assert.equal(JSON.stringify(input), before) })
  check(() => {
    assert.equal(baseline.status, 'has-byeong')
    assert.deepEqual(ids(baseline), ['day:branch', 'year:branch'])
    assert.deepEqual(ids(baseline).map((id) => input.producer.entities.find((entity) => entity.entityId === id).value).sort(), [...expected['CS-127']].sort())
    assert.ok(baseline.roleStates.every((role) => role.role === '병'))
    assert.equal(resultFor(baseline, 'year:stem').status, 'deferred')
    assert.equal(baseline.otherDamageAssessment, 'unassessed')
  })
  for (const caseId of ['CS-005', 'CS-126']) check(() => {
    const result = run(setup(caseId).input)
    assert.equal(result.status, 'deferred')
    assert.ok(result.reasonCodes.includes('DAMAGE_RULE_UNAVAILABLE'))
    assert.equal(result.reasonCodes.includes('SANGSHEN_NOT_CONFIRMED'), caseId === 'CS-126')
    assert.deepEqual(result.roleStates, [])
  })
  check(() => {
    const trial = setup('CS-127')
    const review = trial.reviewFor('day:branch')
    review.paths = []
    trial.sign(review)
    assert.equal(evaluateByeongCandidates(trial.input).candidates.find((item) => item.entity.entityId === 'day:branch').status, 'candidate')
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'deferred')
    assert.deepEqual(ids(run(trial.input)), ['year:branch'])
  })
  check(() => {
    const trial = setup('CS-127')
    const review = trial.reviewFor('day:branch')
    review.paths[0].effect = 'unknown'
    trial.sign(review)
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'deferred')
    review.paths[0].effect = 'damage'
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'deferred', 'changed path cannot reuse signed claim')
  })
  check(() => {
    const trial = setup('CS-127')
    const state = trial.input.runtimeStates.find((item) => item.targetEntityId === 'day:branch')
    state.functionalState = 'weakened'
    state.stateId = 'weakened:day:branch'
    state.causingApplicationRefs = [trial.app('OP-T10')]
    state.weakeningDescription = { ruleId: 'OP-T10', wording: '약화 관측' }
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'deferred')
    const review = trial.reviewFor('day:branch')
    review.paths[0].sourceStateId = state.stateId
    trial.sign(review)
    const judgment = resultFor(run(trial.input), 'day:branch')
    assert.equal(judgment.status, 'confirmed')
    assert.equal(judgment.runtimeState.functionalState, 'weakened')
    assert.equal(resultFor(run(trial.input), 'year:branch').runtimeState.functionalState, 'active')
  })
  check(() => {
    const trial = setup('CS-127')
    trial.addReview('time:stem', '偏印', { relation: 'controls', existence: 'present', effect: 'damage' })
    const before = run(trial.input)
    trial.input.natalByeongRoles = before.roleStates
    const state = trial.input.runtimeStates.find((item) => item.targetEntityId === 'time:stem')
    state.functionalState = 'stopped'
    state.causingApplicationRefs = [trial.app('OP-T09')]
    const result = run(trial.input)
    const judgment = resultFor(result, 'time:stem')
    assert.equal(judgment.runtimeState.functionalState, 'stopped')
    assert.equal(judgment.status, 'rejected')
    assert.deepEqual(judgment.natalRoleHistory, before.roleStates.filter((role) => role.entityId === 'time:stem'))
    assert.deepEqual(ids(result), ['day:branch', 'year:branch'])
    assert.deepEqual(result.removalEvidence.map(({ entityId, ruleId }) => [entityId, ruleId]), [['time:stem', 'I-04a']])
  })
  check(() => {
    const trial = setup('CS-127')
    const observation = trial.addReview('time:stem', '偏印', { relation: 'controls', existence: 'present', effect: 'damage' })
    trial.input.natalByeongRoles = run(trial.input).roleStates
    const { producer, context } = trial.input
    const pair = ['year:stem', 'time:stem']
    const common = { contractVersion: '1', scopeId: context.scopeId, kind: 'stem-controls',
      producerRef: producer.producerRef, evidenceIds: ['input-premises'], uncertaintyIds: [] }
    producer.coverage.push({ ...common, coverageId: 'control-coverage', universeEntityIds: pair,
      investigatedParticipantSets: [pair], completion: 'complete' })
    producer.relations.push({ ...common, relationFactId: 'control-witness', coverageRef: 'control-coverage',
      participantEntityIds: pair, sourceEntityId: pair[0], targetEntityId: pair[1], inputFactIds: ['pillar:year', 'pillar:time'],
      assessment: 'confirmed', existence: 'present' })
    observation.paths[0].effect = 'excluded'
    observation.paths[0].controlRelationFactId = 'control-witness'
    trial.sign(observation)
    const result = run(trial.input)
    assert.deepEqual(result.removalEvidence.map(({ entityId, ruleId }) => [entityId, ruleId]), [['time:stem', 'I-04c']])
    assert.equal(result.status, 'has-byeong')
    assert.equal(result.otherDamageAssessment, 'unassessed')
  })
  check(() => {
    const trial = setup('CS-127')
    const review = trial.reviewFor('day:branch')
    review.paths.push({ ...review.paths[0], pathId: 'second-observation' })
    trial.sign(review)
    const result = run(trial.input)
    assert.deepEqual(ids(result), ['day:branch', 'year:branch'])
    assert.equal(resultFor(result, 'day:branch').trace.length, 2)
    assert.equal(result.roleStates.filter((role) => role.entityId === 'day:branch').length, 1)
  })
  check(() => {
    const trial = setup('CS-127')
    trial.input.producer.entities.find((item) => item.entityId === 'day:branch').value = '戌'
    trial.input.producer.facts.find((item) => item.id === 'pillar:day').value = '辛戌'
    trial.input.context = createExecutionScopeContext(trial.input.producer, { executionId: 'CS-127', stage: 'natal',
      referenceTime: date(2027), selectedPeriodRefs: {}, natalInspectionPeriod: window })
    assert.deepEqual(ids(run(trial.input)), ['day:branch', 'year:branch'])
  })
  check(() => {
    const trial = setup('CS-127')
    trial.input.reviews = []
    for (const entityId of trial.input.context.includedEntityIds.filter((id) => id !== 'month:branch')) trial.addReview(entityId, 'excluded')
    assert.equal(run(trial.input).status, 'no-byeong')
    trial.input.reviews.pop()
    assert.equal(run(trial.input).status, 'deferred')
  })
  check(() => {
    const trial = setup('CS-127')
    trial.input.upstreamRoles = trial.input.upstreamRoles.filter((item) => item.role !== '상신')
    assert.equal(run(trial.input).status, 'deferred')
    assert.ok(run(trial.input).reasonCodes.includes('SANGSHEN_NOT_CONFIRMED'))
    trial.input.yongShenJudgments = []
    assert.ok(run(trial.input).reasonCodes.includes('YONGSHEN_NOT_CONFIRMED'))
  })
  check(() => {
    const trial = setup('CS-127')
    const candidates = evaluateByeongCandidates(trial.input)
    candidates.candidates.pop()
    const result = evaluateByeongJudgment({ ...trial.input, candidateResult: candidates })
    assert.equal(result.status, 'deferred')
    assert.ok(result.reasonCodes.includes('CANDIDATE_HANDOFF_MISMATCH'))
  })
  check(() => {
    const trial = setup('CS-127')
    trial.input.evidence.records.find((record) => record.evidenceId === 'path:day:branch').usage = 'regression-expectation'
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'deferred')
    trial.input.evidence.records = trial.input.evidence.records.filter((record) => record.ruleId !== 'I-04-2')
    trial.input.producer.evidence = trial.input.evidence
    assert.equal(run(trial.input).status, 'deferred')
  })
  check(() => {
    const trial = setup('CS-127')
    const review = trial.reviewFor('day:branch')
    review.paths[0].effect = 'excluded'
    trial.sign(review)
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'rejected')
    review.paths[0].relationFactId = 'missing-relation'
    trial.sign(review)
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'deferred')
  })
  const draftRuleSource = await readFile('src/docs/source/A_rev180.md', 'utf8')
  check(() => {
    const trial = setup('CS-127')
    assert.throws(() => evaluateByeongCandidates({ ...trial.input, draftRuleSource }), /does not accept supplied damage reviews/)
  })
  check(() => {
    const trial = setup('CS-127')
    const review = trial.reviewFor('day:branch')
    Object.assign(review.paths[0], { existence: 'absent', effect: 'excluded' })
    trial.sign(review)
    assert.equal(resultFor(run(trial.input), 'day:branch').status, 'rejected')
    assert.equal(resultFor(run(trial.input), 'year:branch').status, 'confirmed')
  })
  const runtime = await Promise.all(['byeongCandidates/index', 'byeongCandidates/draftPaths', 'byeongJudgment/index'].map((path) =>
    readFile(`src/lib/judgment/evaluators/${path}.ts`, 'utf8')))
  check(() => {
    for (const code of runtime) assert.doesNotMatch(code, /CS-00[589]|CS-12[679]|evaluate(?:Pattern|YongShen|SangShen)|calculateTenGod|percentage|score|대길|role: '구응'/)
  })
  console.log(`Byeong contract verification passed (${checks} checks).`)
} finally {
  await server.close()
}
