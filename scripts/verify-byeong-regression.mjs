import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
try {
  const inputs = JSON.parse(await readFile(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))
  const [A, draftRuleSource, C, D, approval] = await Promise.all(
    ['A_rev179', 'A_rev180', 'C_rev215', 'D_rev152', '25-7_rev16'].map((name) => readFile(`src/docs/source/${name}.md`, 'utf8')),
  )
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { produceJudgmentEngineFacts, produceExposureRootFacts } = await load('judgment/producers/index')
  const { produceBranchMainRelations } = await load('judgment/producers/branchMainRelationProducer')
  const { createExecutionScopeContext } = await load('judgment/runtime/executionScopeContext')
  const evaluator = (name) => load(`judgment/evaluators/${name}/index`)
  const { evaluateNatalStemCombination } = await evaluator('natalStemCombination')
  const { evaluatePatternCandidates } = await evaluator('patternCandidates')
  const { evaluatePatternJudgment } = await evaluator('patternJudgment')
  const { evaluateYongShenCandidates } = await evaluator('yongShenCandidates')
  const { evaluateYongShenJudgment } = await evaluator('yongShenJudgment')
  const { evaluateSangShenCandidates } = await evaluator('sangShenCandidates')
  const { evaluateSangShenJudgment } = await evaluator('sangShenJudgment')
  const { evaluateByeongCandidates } = await evaluator('byeongCandidates')
  const { evaluateByeongJudgment } = await evaluator('byeongJudgment')
  const { evaluateGuEung } = await evaluator('guEung')
  const { issueByeongRuleReceipts } = await load('judgment/evaluators/byeongCandidates/ruleEvidence')
  const referenceTime = '2027-01-15T00:00:00.000Z'
  const pillarsRow = C.split('C-10-1. 사례별 20항목')[1].split('\n').find((line) => line.startsWith('1 원국·출처\t')).split('\t')

  function run(caseId, birth) {
    // The hour is a representative within the source's published window.
    assert.deepEqual(Object.keys(birth).sort(), ['date', 'time'])
    assert.deepEqual(Object.keys(birth.date).sort(), ['day', 'month', 'year'])
    assert.deepEqual(Object.keys(birth.time).sort(), ['hour', 'minute'])
    const chart = calculateCanonicalChart({ date: birth.date, time: { known: true, value: birth.time },
      gender: '女性', timeCorrectionMode: 'none' }, { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
    const producer = produceJudgmentEngineFacts(chart, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
    const context = createExecutionScopeContext(producer, { executionId: `independent:${caseId}`, stage: 'natal', referenceTime,
      selectedPeriodRefs: {}, natalInspectionPeriod: { periodId: 'regression-window',
        from: { kind: 'exact', instant: '2027-01-01T00:00:00.000Z' }, to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } } })
    const derived = produceExposureRootFacts({ producer, context }, { A, C, D, approval })
    const natalCombination = evaluateNatalStemCombination({ producer, context })
    const base = { producer, context, derived, natalCombination }
    const { candidates } = evaluatePatternCandidates(base)
    const pattern = evaluatePatternJudgment({ ...base, candidates })
    const roleInput = { ...base, candidates, patternJudgment: pattern.judgment, judgmentEvidence: pattern.evidence }
    const yongCandidates = evaluateYongShenCandidates(roleInput)
    const yong = evaluateYongShenJudgment({ ...roleInput, yongShenCandidates: yongCandidates.candidates, candidateEvidence: yongCandidates.evidence })
    const helperInput = { ...base, patternJudgment: pattern.judgment, yongShenResult: yong }
    const helperCandidates = evaluateSangShenCandidates(helperInput)
    const sang = evaluateSangShenJudgment({ ...helperInput, sangShenCandidates: helperCandidates.candidates, sangShenEvidence: helperCandidates.evidence })
    const records = [...new Map([...pattern.evidence.records, ...natalCombination.bundle.evidence.records, ...yong.evidence.records,
      ...sang.evidence.records, ...issueByeongRuleReceipts(A, 'exposure-root:source-A')].map((record) => [record.evidenceId, record])).values()]
    const roles = [...new Map([...yong.roleStates, ...sang.roleStates].map((role) => [role.roleStateId, role])).values()]
    const input = { producer, context, patternJudgment: pattern.judgment, natalScopeId: context.scopeId, draftRuleSource,
      yongShenJudgments: yong.judgments, sangShenJudgments: sang.judgments, upstreamRoles: roles,
      runtimeStates: natalCombination.states, evidence: { contractVersion: '1', evidenceContextId: `independent:${caseId}`, records }, reviews: [] }
    if (pattern.judgment.monthPatternTenGod === '食神') input.branchMainBasis = derived
    const branchInput = { producer, context, derived, runtimeStates: natalCombination.states }
    const branchBefore = JSON.stringify(branchInput)
    const branchRelations = input.branchMainBasis ? produceBranchMainRelations(branchInput) : []
    if (input.branchMainBasis) assert.deepEqual(produceBranchMainRelations(branchInput), branchRelations)
    assert.equal(JSON.stringify(branchInput), branchBefore)
    const before = JSON.stringify(input)
    const candidateResult = evaluateByeongCandidates(input)
    const result = evaluateByeongJudgment({ ...input, candidateResult })
    assert.equal(JSON.stringify(input), before)
    assert.deepEqual(evaluateByeongJudgment({ ...input, candidateResult }), result)
    assert.equal(result.status, 'deferred')
    assert.deepEqual(result.roleStates, [])
    const guEung = evaluateGuEung({ boundary: { contractVersion: '1', scopeId: context.scopeId, referenceTime,
      byeong: result, evidence: input.evidence }, candidates: [], relations: [], states: [], effects: [], links: [] })
    assert.equal(guEung.status, 'deferred')
    assert.deepEqual(guEung.roleStates, [])
    assert.ok(result.judgments.every((item) => item.status === 'deferred' && item.provenance.ruleVersion === 'A180-draft'))
    return { producer, pattern, yong, sang, result, branchRelations }
  }

  for (const [caseId, birth, column] of Object.entries(inputs).map(([id, birth]) => [id, birth, { 'CS-005': 1, 'CS-126': 3, 'CS-127': 4 }[id]])) {
    const { producer, pattern, yong, sang, result, branchRelations } = run(caseId, birth)
    const at = (position, part) => producer.entities.find((entity) => entity.position === position && entity.part === part && entity.origin === 'natal')
    const pillars = ['year', 'month', 'day', 'time'].map((position) => at(position, 'stem').value + at(position, 'branch').value).join(' ')
    assert.ok(pillarsRow[column].startsWith(pillars), `${caseId}: ${pillars}`)
    const judgment = (position, part) => result.judgments.find((item) => item.entityId === at(position, part).entityId)
    if (caseId === 'CS-005') {
      assert.ok(judgment('time', 'stem').factIds.some((id) => id.startsWith('relation:')))
      assert.ok(judgment('time', 'stem').reasonCodes.includes('A180_7_POST_CONTROL_DAMAGE_AND_WEALTH_ATTRIBUTION_UNVERIFIED'))
      assert.ok(judgment('day', 'branch').reasonCodes.includes('A180_7_BRANCH_WEALTH_TO_KILL_PATH_UNAVAILABLE'))
    }
    if (caseId === 'CS-126') {
      assert.ok(judgment('year', 'stem').reasonCodes.includes('A180_8_CONFIRMED_HELPER_CONTROL_UNAVAILABLE'))
      assert.ok(judgment('year', 'stem').reasonCodes.includes('A180_8_RESIDUAL_KILL_DAMAGE_AND_ATTRIBUTION_UNVERIFIED'))
    }
    if (caseId === 'CS-127') {
      assert.equal(pattern.judgment.monthPatternTenGod, '食神')
      const month = at('month', 'branch')
      for (const [position, assessment] of [['year', 'confirmed'], ['day', 'provisional']]) {
        const source = at(position, 'branch')
        const fact = branchRelations.find((item) => item.sourceEntityId === source.entityId && item.targetEntityId === month.entityId)
        assert.equal(fact.relationType, 'main-hidden-stem-controls')
        assert.equal(fact.existence, 'present')
        assert.equal(fact.assessment, assessment)
        assert.equal(fact.targetRole, '食神')
        assert.ok(fact.evidenceIds.length && fact.sourceRuleIds.length && fact.provenance.inputFactIds.length)
        assert.ok(judgment(position, 'branch').factIds.includes(fact.id))
        assert.equal(fact.sourceStateId, null)
        assert.equal(fact.targetStateId, null)
        assert.equal(branchRelations.find((item) => item.sourceEntityId === month.entityId && item.targetEntityId === source.entityId).existence, 'absent')
        console.log(`  ${source.value}→${month.value}: ${fact.relationType}, ${fact.existence}, ${assessment}, branch runtime states unavailable`)
      }
      const reference = C.split('C-10-1. 사례별 20항목')[1].split('\n').find((line) => line.startsWith('8 병\t')).split('\t')[column]
      const documented = reference.split(' / ')[0].match(/[子丑寅卯辰巳午未申酉戌亥](?=\((?:편인|정인)\))/g)
      assert.ok(documented?.length, 'C reference is available for comparison')
      assert.deepEqual(result.judgments.filter((item) => item.status === 'confirmed'), [])
      console.log(`  C reference: ${documented.join('·')}; independent positive and no-byeong still unverified`)
      for (const position of ['year', 'day']) {
        assert.ok(judgment(position, 'branch').reasonCodes.includes('I04_2_DIRECTED_FOOD_CONTROL_UNAVAILABLE'))
        assert.ok(judgment(position, 'branch').reasonCodes.includes('I04_2_MEDIATION_AND_ACTUAL_DAMAGE_UNVERIFIED'))
      }
    }
    console.log(`${caseId}: ${result.status}; Pattern=${pattern.judgment.status}, YongShen=${yong.judgments.map((item) => item.status).join(',')}, SangShen=${sang.judgments.map((item) => item.status).join(',')}`)
    console.log(`  ${[...new Set(result.judgments.flatMap((item) => item.reasonCodes))].sort().join(', ')}`)
  }
  console.log('Independent-input regression passed (3 deferral cases; no independent positive case established).')
} finally {
  await server.close()
}
