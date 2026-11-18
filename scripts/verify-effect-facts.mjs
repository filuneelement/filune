import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const mode = process.argv[2]
assert.ok(['contract', 'producer', 'cs005', 'role-function', 'cs005-role-function'].includes(mode))
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
const period = (periodId, from, to) =>
  ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const inspection = period('inspection', '2027-02-01T00:00:00.000Z', '2027-03-01T00:00:00.000Z')
try {
  const { effectFactSchema } = await load('judgment/contracts/index')
  if (mode === 'contract') {
    const fact = { contractVersion: '1', effectId: 'effect', scopeId: 'scope', sourceEntityId: 'source',
      targetEntityId: 'target', targetFunctionId: 'function', relationFactId: 'relation', effectType: 'weaken',
      runtimeStateRefs: ['a', 'b'], roleStateRefs: [], ruleIds: ['OP-P06'], evidenceIds: ['evidence'],
      provenance: { producerRef: { producerId: 'producer', version: '1', sourceRef: 'src', inputFactIds: [] }, ruleRevision: 181 },
      coverage: 'complete', effectivePeriod: inspection, reasonCodes: [], status: 'confirmed' }
    assert.deepEqual(effectFactSchema.parse(fact), fact)
    assert.equal(effectFactSchema.is({ ...fact, status: 'deferred', coverage: 'partial', reasonCodes: ['missing'] }), true)
    for (const invalid of [{ effectType: 'stop' }, { effectType: 'strengthen' }, { runtimeStateRefs: ['a'] },
      { evidenceIds: [] }, { reasonCodes: ['missing'] }, { coverage: 'partial' }, { importance: 'high' }, { score: 1 },
      { polarity: 'bad' }, { status: 'deferred' }, { sourceEntityId: 'target' }]) {
      assert.equal(effectFactSchema.is({ ...fact, ...invalid }), false, JSON.stringify(invalid))
    }
  } else {
    const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
    const fixture = JSON.parse(await readFile('scripts/fixtures/byeong-judgment-inputs.json', 'utf8'))['CS-005']
    const [A, draftA, C, D, approval] = await Promise.all(
      ['A_rev179', 'A_rev180', 'C_rev215', 'D_rev152', '25-7_rev16'].map((file) => readFile(`src/docs/source/${file}.md`, 'utf8')))
    const birth = { date: fixture.date, time: { known: true, value: fixture.time }, gender: '女性', timeCorrectionMode: 'none' }
    const calculation = { referenceTime: '2027-02-15T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 }
    if (mode === 'cs005' || mode === 'cs005-role-function') {
      const { runInternalReading } = await load('judgment/pipeline/internalReading')
      const input = { birth, calculation, executionId: 'cs005-effect-february',
        natalInspectionPeriod: inspection, sources: { A, draftA, C, D, approval } }
      const reading = runInternalReading(input)
      const month = reading.luck.month
      assert.equal(month.pillar, '壬寅')
      const withExpected = runInternalReading({ ...input, expected: { status: 'confirmed' } }).luck.month
      assert.deepEqual(withExpected.functionEffects, month.functionEffects)
      const candidates = [['ten-god', '偏印'], ['yongshen', '용신'], ['sangshen', '상신'], ['ten-god', '偏財']]
      for (const [kind, name] of candidates) {
        const diagnostics = month.functionEffects.diagnostics.filter((item) => item.functionKind === kind && item.functionName === name)
        const candidate = diagnostics.find((item) => {
          const rel = month.relations.find((record) => record.relationFactId === item.relationFactId)
          const sourceIsMonth = rel?.sourceEntityId.includes('/monthlyLuck/')
          return name === '偏財' ? rel?.sourceEntityId.includes('/pillars/day/') && rel.targetEntityId.includes('/monthlyLuck/')
            : sourceIsMonth && rel.targetEntityId.includes('/pillars/month/')
        })
        assert.ok(candidate, `Missing candidate ${name}`)
        assert.equal(candidate.relation, 'confirmed')
        console.log(JSON.stringify({ functionName: name, relation: candidate.relation, sourceState: candidate.sourceState,
          targetState: candidate.targetState, functionOwnership: candidate.functionOwnership, functionActive: candidate.functionActive,
          reach: candidate.reach, status: candidate.status, reasonCodes: candidate.reasonCodes }))
        const ordinary = kind === 'ten-god'
        assert.equal(candidate.status, ordinary ? 'confirmed' : 'deferred')
        assert.equal(candidate.functionOwnership, 'confirmed')
        assert.equal(candidate.reach, ordinary ? 'confirmed' : 'unknown')
        const record = month.functionEffects.effects.find((item) => item.relationFactId === candidate.relationFactId
          && item.targetFunctionId === candidate.targetFunctionId)
        assert.ok(effectFactSchema.is(record))
        assert.equal(record.status, candidate.status)
        assert.equal(record.effectType, 'weaken')
        assert.deepEqual(record.reasonCodes, candidate.reasonCodes)
        if (!ordinary) assert.deepEqual(candidate.reasonCodes, ['ROLE_ACTION_UNSPECIFIED'])
      }
      const carriedStop = month.functionEffects.diagnostics.find((item) =>
        item.targetEntityId.includes('/yearlyLuck/') && item.reasonCodes.includes('TARGET_STOPPED'))
      assert.equal(carriedStop?.status, 'blocked')
      assert.ok(!month.functionEffects.effects.some((item) => item.relationFactId === carriedStop.relationFactId
        && item.targetFunctionId === carriedStop.targetFunctionId))
      console.log('February scope:', JSON.stringify({
        confirmed: month.functionEffects.effects.filter((item) => item.status === 'confirmed').length,
        deferred: month.functionEffects.effects.filter((item) => item.status === 'deferred').length,
        blocked: month.functionEffects.diagnostics.filter((item) => item.status === 'blocked').length,
      }))
      if (mode === 'cs005-role-function') {
        const roles = reading.natal.roles.filter((role) => role.entityId?.includes('/pillars/month/')
          && ['용신', '상신'].includes(role.role))
        assert.equal(roles.length, 2)
        assert.ok(roles.every((role) => role.status === 'evaluated' && !role.provisional))
        assert.ok(!month.roleFunctions.some(({ preEffect }) => roles.some((role) => role.roleStateId === preEffect.roleStateRef)))
        const incoming = month.relationActions.find((action) => action.sourceEntityId.includes('/pillars/year/'))
        const outgoing = month.relationActions.find((action) => action.targetEntityId.includes('/pillars/day/'))
        assert.equal(incoming?.status, 'stopped')
        assert.equal(outgoing?.status, 'investigable')
        assert.equal(outgoing?.sourceState, 'active')
        assert.equal(outgoing?.targetState, 'active')
        const resource = month.functionEffects.effects.find((effect) => effect.status === 'confirmed'
          && effect.targetEntityId.includes('/pillars/month/'))
        assert.ok(resource)
        const context = month.roleEffectContexts.find(({ effectId }) => effectId === resource.effectId)
        assert.deepEqual(context?.roleStateRefs, roles.map((role) => role.roleStateId).sort())
        for (const role of roles) {
          const deferral = month.roleEffectDeferrals.find((item) => item.roleStateRef === role.roleStateId)
          assert.deepEqual(deferral?.reasonCodes, ['ROLE_ACTION_UNSPECIFIED'])
        }
        assert.deepEqual(withExpected.roleFunctions, month.roleFunctions)
        assert.deepEqual(withExpected.roleEffectContexts, month.roleEffectContexts)
        console.log(JSON.stringify({ roleAssignments: roles.map(({ role }) => role), incoming: incoming.status,
          outgoing: outgoing.status, effectContextCount: month.roleEffectContexts.length }))
      }
      assert.equal(reading.natal.successState.status, 'deferred')
      assert.equal(month.byeong?.status, 'deferred')
      assert.equal(month.guEung?.status, 'deferred')
    } else {
      const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
      const { produceJudgmentEngineFacts } = await load('judgment/producers/index')
      const { createExecutionScopeContext } = await load('judgment/runtime/executionScopeContext')
      const { produceEffectFacts } = await load('judgment/producers/effectFactProducer')
      const producer = produceJudgmentEngineFacts(calculateCanonicalChart(birth, calculation),
        { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
      const context = createExecutionScopeContext(producer, { executionId: 'synthetic', stage: 'natal',
        referenceTime: calculation.referenceTime, selectedPeriodRefs: {}, natalInspectionPeriod: inspection })
      const stems = producer.entities.filter((item) => item.origin === 'natal' && item.part === 'stem')
      const source = stems.find((item) => item.position === 'day')
      const target = stems.find((item) => item.position === 'time')
      const roleEvidence = { ...producer.evidence.records.find((item) => item.evidenceId === 'producer-evidence:canonical-projection'),
        evidenceId: 'synthetic-role-evidence', status: 'confirmed', uncertaintyIds: [] }
      const evidence = [...producer.evidence.records, roleEvidence]
      const evidenceIds = source.evidenceIds
      const application = { applicationId: 'application', executionId: context.executionId, scopeId: context.scopeId,
        ruleId: 'OP-T10', ruleVersion: 'fixture' }
      const states = [source, target].map((item) => ({ contractVersion: '1', stateId: `state:${item.entityId}`,
        targetEntityId: item.entityId, scopeId: context.scopeId, functionalState: 'active', originMode: 'local',
        transition: 'established', causingApplicationRefs: [application], evidenceIds, uncertaintyIds: [], validity: inspection }))
      const tenGod = producer.facts.find((item) => item.canonicalPointer === '/chart/basicRelations/time/value/stemTenGod')
      const fn = { targetEntityId: target.entityId, kind: 'ten-god', name: tenGod.value, scopeId: context.scopeId,
        effectivePeriod: inspection, ownershipFactRef: tenGod.id }
      const priority = { scopeId: context.scopeId, status: 'clear', evidenceIds }
      const input = { producer, context, states, roles: [], functions: [fn], evidence, priority }
      const tested = (overrides = {}) => {
        const result = produceEffectFacts({ ...input, ...overrides })
        return { effects: result.effects.filter((item) => item.sourceEntityId === source.entityId),
          diagnostics: result.diagnostics.filter((item) => item.sourceEntityId === source.entityId) }
      }
      const confirmed = tested()
      assert.equal(confirmed.effects.length, 1)
      assert.equal(confirmed.effects[0].status, 'confirmed', JSON.stringify(confirmed.diagnostics))
      assert.equal(confirmed.diagnostics[0].reach, 'confirmed')
      assert.deepEqual(tested(), confirmed)
      assert.deepEqual(tested({ functions: [fn, { ...fn }], expected: [] }), confirmed)
      assert.deepEqual(tested({ expected: [{ effectType: 'stop' }] }), confirmed)
      for (const [index, code] of [[0, 'SOURCE_STOPPED'], [1, 'TARGET_STOPPED']]) {
        const result = tested({ states: states.map((state, i) => i === index ? { ...state, functionalState: 'stopped' } : state) })
        assert.equal(result.effects.length, 0)
        assert.ok(result.diagnostics[0].reasonCodes.includes(code))
      }
      assert.equal(tested({ states: states.map((state) => ({ ...state, functionalState: 'weakened',
        weakeningDescription: { wording: 'fixture', ruleId: 'OP-T10' } })) }).effects[0].status, 'confirmed')
      const roles = ['용신', '상신'].map((role) => ({ contractVersion: '1', roleStateId: role, subjectKind: 'entity',
        entityId: target.entityId, structureRef: null, role, status: 'evaluated', sourceRuleIds: ['OP-T10'], evidenceIds: [roleEvidence.evidenceId],
        validScopeId: context.scopeId, provisional: false, uncertaintyIds: [], origin: 'rule-result',
        applicationRef: application, usage: 'runtime-result' }))
      const multiple = tested({ roles, functions: [fn, ...roles.map((role, i) => ({ ...fn, ownershipFactRef: undefined,
        kind: i === 0 ? 'yongshen' : 'sangshen', name: role.role, roleStateRef: role.roleStateId }))] }).effects
      assert.equal(multiple.length, 3)
      assert.ok(multiple.every((item) => item.status === 'confirmed'))
      assert.equal(new Set(multiple.map((item) => item.targetFunctionId)).size, 3)
      assert.equal(new Set(multiple.map((item) => item.relationFactId)).size, 1)
      const historicalRole = { ...roles[0], validScopeId: 'origin-scope',
        applicationRef: { ...application, scopeId: 'origin-scope' } }
      const roleFunction = { ...fn, kind: 'yongshen', name: '용신',
        ownershipFactRef: undefined, roleStateRef: historicalRole.roleStateId }
      const history = tested({ roles: [historicalRole], natalScopeId: historicalRole.validScopeId, functions: [roleFunction] })
      assert.equal(history.diagnostics[0].functionOwnership, 'confirmed')
      assert.equal(history.diagnostics[0].functionActive, 'unknown')
      assert.equal(history.effects[0].status, 'deferred')
      assert.equal(tested({ roles: [historicalRole], natalScopeId: historicalRole.validScopeId, functions: [{ ...roleFunction,
        currentRole: { status: 'active', evidenceIds: [roleEvidence.evidenceId] } }] }).effects[0].status, 'confirmed')
      for (const [overrides, code] of [
        [{ functions: [{ ...fn, ownershipFactRef: undefined }] }, 'FUNCTION_OWNERSHIP_UNCONFIRMED'],
        [{ priority: undefined }, 'REACH_PRIORITY_UNRESOLVED'],
        [{ states: [{ ...states[0], functionalState: 'unknown', transition: 'unresolved', uncertaintyIds: ['unknown'] }, states[1]] }, 'SOURCE_STATE_UNCONFIRMED'],
        [{ functions: [{ ...fn, effectivePeriod: period('past', '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z') }] }, 'EFFECT_PERIOD_UNCONFIRMED'],
        [{ states: [{ ...states[0], scopeId: 'other' }, states[1]] }, 'SOURCE_STATE_UNCONFIRMED'],
      ]) {
        const result = tested(overrides).effects[0]
        assert.equal(result.status, 'deferred')
        assert.ok(result.reasonCodes.includes(code))
      }
      assert.throws(() => tested({ context: { ...context, scopeId: 'other' } }), /scope/i)
      assert.throws(() => tested({ functions: [{ ...fn, scopeId: 'other' }] }), /scope/i)
      assert.equal(tested({ priority: { ...priority, status: 'blocked' } }).effects.length, 0)
      if (mode === 'role-function') {
        const { evaluateRoleFunctions, applyRoleFunctionEffects } = await load('judgment/evaluators/roleFunctionState/index')
        const { roleFunctionStateSchema } = await load('judgment/contracts/index')
        const roleInput = { producer, context, natalScopeId: context.scopeId, roles, states, evidence, restrictionsResolved: true }
        const path = { roleStateRef: roles[0].roleStateId, judgmentRef: 'synthetic-judgment',
          requiredRelationRefs: [confirmed.effects[0].relationFactId], requiredParticipantIds: [source.entityId],
          structuralFactRefs: [tenGod.id], structuralStatus: 'confirmed', exclusive: true, evidenceIds: [roleEvidence.evidenceId] }
        const evaluate = (overrides = {}) => evaluateRoleFunctions({ ...roleInput, paths: [path], ...overrides })
        const find = (result, type = 'yongshen') => result.find((item) => item.fact.functionType === type).fact
        const result = evaluate()
        const pre = find(result)
        assert.equal(pre.status, 'active')
        const withoutRelations = { ...path, actionId: 'independent-action', requiredRelationRefs: [], requiredParticipantIds: [] }
        const independent = find(evaluate({ paths: [withoutRelations] }))
        assert.equal(independent.status, 'active')
        const together = evaluate({ paths: [{ ...path, actionId: 'first-action' }, withoutRelations],
          states: states.map((state, i) => i === 0 ? { ...state, functionalState: 'stopped' } : state) })
          .filter((item) => item.fact.functionType === 'yongshen')
        assert.equal(new Set(together.map(({ fact }) => fact.functionId)).size, 2)
        assert.deepEqual(together.map(({ fact }) => fact.status), ['stopped', 'active'])
        const independentTarget = { ...fn, ownershipFactRef: undefined, kind: 'yongshen', name: '용신',
          roleStateRef: independent.roleStateRef, preRoleFunction: independent }
        const independentEffect = tested({ roles, functions: [independentTarget] }).effects[0]
        assert.equal(independentEffect.targetFunctionId, independent.functionId)
        assert.equal(applyRoleFunctionEffects(independent, [independentEffect], context.referenceTime).status, 'weakened')
        assert.equal(applyRoleFunctionEffects(pre, [independentEffect], context.referenceTime).status, 'active')

        assert.ok(!result.some(({ fact }) => fact.functionType === 'sangshen'))
        const linkedHelper = { ...path, roleStateRef: roles[1].roleStateId, requiredFunctionIds: [pre.functionId] }
        assert.equal(find(evaluate({ paths: [path, linkedHelper], roles: [...roles].reverse() }), 'sangshen').status, 'active')
        assert.equal(find(evaluate({ paths: [linkedHelper] }), 'sangshen').status, 'deferred')
        assert.deepEqual(evaluate({ expected: [] }), result)
        assert.deepEqual(evaluate({ expected: ['stopped'] }), result)
        assert.deepEqual(evaluate(), result)
        assert.equal(find(evaluate({ paths: [{ ...path, requiredRelationRefs: ['missing'] }] })).status, 'deferred')
        const alter = (index, patch) => states.map((item, i) => i === index ? { ...item, ...patch } : item)
        assert.equal(find(evaluate({ states: alter(1, { functionalState: 'stopped' }) })).status, 'stopped')
        const stopped = alter(0, { functionalState: 'stopped' })
        assert.equal(find(evaluate({ states: stopped })).status, 'stopped')
        assert.equal(find(evaluate({ states: stopped, paths: [{ ...path, exclusive: false }] })).status, 'deferred')
        assert.ok(roles.every((role) => role.status === 'evaluated'))
        assert.equal(find(evaluate({ states: alter(0, { functionalState: 'weakened',
          weakeningDescription: { wording: 'fixture', ruleId: 'OP-T10' } }) })).status, 'weakened')
        const structural = { ...fn, ownershipFactRef: undefined, kind: 'yongshen', name: '용신',
          roleStateRef: pre.roleStateRef, preRoleFunction: pre }
        const direct = tested({ roles, functions: [structural] }).effects[0]
        assert.equal(direct.status, 'confirmed')
        assert.ok(direct.provenance.producerRef.inputFactIds.includes(pre.roleFunctionStateId))
        const post = applyRoleFunctionEffects(pre, [direct], context.referenceTime)
        assert.equal(post.status, 'weakened')
        assert.deepEqual(post.effectRefs, [direct.effectId])
        assert.equal(applyRoleFunctionEffects(pre, [{ ...direct, scopeId: 'prior-scope' }], context.referenceTime).status, 'active')
        const helperPre = find(evaluate({ paths: [path, linkedHelper] }), 'sangshen')
        assert.equal(applyRoleFunctionEffects(helperPre, [direct], context.referenceTime, [pre.functionId]).status, 'weakened')
        assert.equal(roleFunctionStateSchema.is({ ...pre, effectRefs: [direct.effectId] }), false)
        assert.throws(() => applyRoleFunctionEffects(post, [], context.referenceTime), /pre-effect/)
        assert.throws(() => tested({ roles, functions: [{ ...structural, preRoleFunction: post }] }), /pre-effect/)
      }

    }
  }
  console.log(`PASS effect facts ${mode}`)
} finally {
  await server.close()
}
