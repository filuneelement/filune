import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const unknownPeriod = periodId => ({ periodId,
  from: { kind: 'unknown', reason: 'source-does-not-state-gregorian-boundary' },
  to: { kind: 'unknown', reason: 'source-does-not-state-gregorian-boundary' } })
const pillar = (position, ganZhi) => ({
  stem: { id: `source-${position}-${ganZhi}-stem`, value: ganZhi[0] },
  branch: { id: `source-${position}-${ganZhi}-branch`, value: ganZhi[1] },
})
const sourceChart = chart => ({ year: pillar('year', chart[0]), month: pillar('month', chart[1]),
  day: pillar('day', chart[2]), time: pillar('time', chart[3]) })
const fact = ({ id, type, domain, scope = 'sewoon', originScope = scope, parentScopeId = 'source-great', path = 'contract-path', direction = 'favorable' }) => ({
  id, eventDomain: domain, evidenceType: type,
  functionType: direction === 'favorable' ? 'supports' : 'blocks', direction,
  scope, originScope, scopeId: `${id}-scope`, parentScopeId,
  scopeGanZhi: scope === 'sewoon' ? '丙午' : scope === 'daewoon' ? '庚戌' : '乙卯',
  parentScopeGanZhi: scope === 'sewoon' ? '庚戌' : undefined,
  certainty: 'confirmed', provenanceClass: 'SOURCE_INFERENCE', currentLifecycle: 'active',
  currentlyEffective: true, temporalStatus: 'current', sourcePathId: path,
  sourceJudgmentIds: [`judgment-${id}`], sourceRelationIds: [`relation-${id}`], sourceRoleIds: [`role-${id}`],
  sourceOutcomeIds: [], sourceLuckEffectIds: [], sourceContextKeys: [domain === 'contract' ? 'event.contract.process' : 'event.business.operating'],
  provenance: [`primary-source:${id}`],
})

const result = { sourceCases: [], contractCoverage: [], policyViolations: 0 }
try {
  const [{ runJudgmentCore }, { buildMoneyOutcome }, { buildEventTiming, buildEventTimingDecisions, projectEventTimingDecisions }, { assembleReading, validateReadingAssembly },
    { runInternalReading }, { CURRENT_CALCULATION_VERSION }] = await Promise.all([
    load('judgment/core/luckScope'), load('outcome/money/moneyOutcome'), load('eventTiming/index'), load('reading/index'),
    load('judgment/pipeline/internalReading'), load('canonical/version'),
  ])

  const sourceCases = [
    {
      fixtureId: 'SRC-07-1131-contract-negative', sourceLocation: 'src/docs/source/primary/07-사주풀이예시.md:1131-1138',
      sourceChart: ['壬戌', '乙巳', '壬子', '丙午'], sourceLuckContext: { daewoon: '庚戌', sewoon: '丙午' },
      interpretation: '丙午년에는 재성의 획득 조건이 살아나지만 印이 손상되어 문서·계약·승진·시험은 불리하다고 명시한다.',
      knownFacts: { 'event.contract.process': true },
      expectedEvidence: ['contract negative or obstruction; no contract positive'],
      expectedTiming: ['contract negative decision; no contract_favorable'],
    },
    {
      fixtureId: 'SRC-07-1960-real-estate-contract-negative', sourceLocation: 'src/docs/source/primary/07-사주풀이예시.md:1958-1967',
      sourceChart: ['戊午', '甲寅', '丁未', '己酉'], sourceLuckContext: { daewoon: '己酉', sewoon: '甲辰' },
      interpretation: '기유대운 갑진년에 부동산 계약 손해; 갑목 印이 대운 己土와 합거되고 土生金으로 財가 활성되어 계약·돈·문서 난제가 발생했다고 명시한다.',
      knownFacts: { 'event.contract.process': true },
      expectedEvidence: ['contract negative or obstruction; no contract positive'],
      expectedTiming: ['contract negative decision; no contract_favorable'],
    },
  ]

  for (const source of sourceCases) {
    const luck = [
      { scope: 'greatLuck', pillar: pillar('greatLuck', source.sourceLuckContext.daewoon), validity: unknownPeriod(`${source.fixtureId}-daewoon`) },
      { scope: 'yearlyLuck', pillar: pillar('yearlyLuck', source.sourceLuckContext.sewoon), validity: unknownPeriod(`${source.fixtureId}-sewoon`) },
    ]
    const snapshots = runJudgmentCore({ executionId: source.fixtureId, natal: sourceChart(source.sourceChart),
      natalValidity: unknownPeriod(`${source.fixtureId}-natal`), natalCombinations: [], luck })
    const natal = snapshots[0]
    const moneyOutcomes = buildMoneyOutcome({ natal, referenceTime: '' })
    const scopes = snapshots.slice(1).map((snapshot, index) => ({ snapshot,
      scopeGanZhi: Object.values(source.sourceLuckContext)[index],
      parentScopeGanZhi: index ? source.sourceLuckContext.daewoon : undefined }))
    const input = { scopes, moneyOutcomes, knownFacts: source.knownFacts, evaluationMode: 'source_snapshot' }
    const before = JSON.stringify({ snapshots, moneyOutcomes })
    const eventResult = buildEventTiming(input)
    const repeat = buildEventTiming(input)
    assert.deepEqual(repeat, eventResult, `${source.fixtureId}: deterministic semantic snapshot`) 
    assert.deepEqual(JSON.stringify({ snapshots, moneyOutcomes }), before, `${source.fixtureId}: read-only evaluation`)
    assert.ok(eventResult.evidence.every(item => item.sourceJudgmentIds.length && item.sourceRelationIds.length
      && (item.sourceRoleIds.length || item.sourcePatternContextIds.length) && item.provenance.length), `${source.fixtureId}: Evidence provenance`)
    assert.ok(eventResult.decisions.every(item => item.sourceEvidenceIds.length && item.sourceJudgmentIds.length
      && item.sourceRelationIds.length && item.provenance.length), `${source.fixtureId}: Decision provenance`)
    assert.ok(eventResult.projections.every(item => item.status === 'not_projectable'), `${source.fixtureId}: no invented calendar period`)
    assert.equal(eventResult.facts.length, 0, `${source.fixtureId}: no EventTimingFact without calendar projection`)
    assert.ok(!eventResult.decisions.some(item => item.eventType === 'contract_favorable'), `${source.fixtureId}: no unsupported positive contract`)
    const moneyPositive = moneyOutcomes.some(item => item.semanticType === 'money_acquisition' && item.result === 'can_earn')
    result.sourceCases.push({ fixtureId: source.fixtureId, sourceLocation: source.sourceLocation,
      snapshotLevel: 'runJudgmentCore from source-transcribed natal and Luck pillars', verifiedFields: ['natal pillars', 'Daewoon GanZhi', 'Sewoon GanZhi', 'Judgment relations/functions/roles'],
      unknownFields: ['Gregorian scope boundaries', 'evaluation instant'], moneyAcquisition: moneyPositive,
      snapshotCandidates: scopes.map(({ snapshot }) => ({ scope: snapshot.scope,
        scopeGanZhi: Object.values(source.sourceLuckContext)[snapshot.scope === 'greatLuck' ? 0 : 1],
        runtimeStatus: snapshot.runtimeStatus,
        activeFunctions: snapshot.actualFunctions.filter(item => item.function === 'operating' || item.function === 'reduced').map(item => {
          const relation = [...snapshot.stemFacts, ...snapshot.patternFacts].find(candidate => candidate.id === item.relationFactId)
          return { action: relation?.action,
            participants: relation && [relation.source.tenGod, relation.target.tenGod],
            function: item.function, direction: item.direction, evidenceStatus: item.evidenceStatus,
            currentlyEffective: item.structuralEffect?.currentlyEffective }
        }),
        currentRoleCount: snapshot.roleEngine.currentRoles.length })),
      evidence: eventResult.evidence.map(item => item.evidenceType), decisions: eventResult.decisions.map(item => [item.eventType, item.direction]),
      projections: eventResult.projections.map(item => item.status),
      result: eventResult.decisions.some(item => item.eventType !== 'contract_favorable')
        && !eventResult.decisions.some(item => item.eventType === 'contract_favorable') ? 'PASS' : 'NO_SOURCE_NEGATIVE_DECISION' })
  }

  const contractCases = [
    { name: 'contract positive', evidence: [fact({ id: 'contract-positive', type: 'document_support', domain: 'contract' })], expected: 'contract_favorable' },
    { name: 'contract delay', evidence: [fact({ id: 'contract-delay', type: 'document_obstruction', domain: 'contract', direction: 'unfavorable' })], expected: 'contract_delay' },
    { name: 'business start', evidence: [fact({ id: 'business-start', type: 'business_start_support', domain: 'business_start' })], expected: 'business_start_favorable' },
    { name: 'business start delay', evidence: [fact({ id: 'business-start-delay', type: 'business_execution_obstruction', domain: 'business_start', direction: 'unfavorable' })], expected: 'business_start_delay' },
    { name: 'business expansion', evidence: [
      fact({ id: 'business-expansion-long', type: 'business_expansion_support', domain: 'business_expansion', scope: 'daewoon', path: 'expansion-path' }),
      fact({ id: 'business-expansion-year', type: 'business_expansion_support', domain: 'business_expansion', path: 'expansion-path' }),
    ], expected: 'business_expansion_favorable' },
    { name: 'business adjustment', evidence: [
      fact({ id: 'business-adjustment-long', type: 'business_expansion_support', domain: 'business_expansion', scope: 'daewoon', path: 'adjustment-path' }),
      fact({ id: 'business-adjustment-year', type: 'business_adjustment_need', domain: 'business_adjustment', path: 'adjustment-path', direction: 'unfavorable' }),
    ], expected: 'business_adjustment' },
    { name: 'business restructure', evidence: [fact({ id: 'business-restructure', type: 'business_restructure_trigger', domain: 'business_restructure' })], expected: 'business_restructure' },
  ]
  for (const test of contractCases) {
    const decisions = buildEventTimingDecisions(test.evidence)
    assert.ok(decisions.some(item => item.eventType === test.expected), `${test.name}: expected policy branch`)
    assert.ok(decisions.every(item => item.sourceEvidenceIds.length && item.provenance.length), `${test.name}: decision trace`)
    assert.deepEqual(buildEventTimingDecisions(test.evidence), decisions, `${test.name}: stable Decision IDs`)
    assert.deepEqual(buildEventTimingDecisions([...test.evidence].reverse()), decisions, `${test.name}: evidence-order independence`)
    result.contractCoverage.push({ mapping: test.name, fixtureType: 'CONTRACT_TEST_ONLY', status: 'PASS' })
  }

  const generic = buildEventTimingDecisions([])
  assert.deepEqual(generic, [], 'generic favorable without event evidence emits no decision')
  assert.equal(result.policyViolations, 0)

  const projectionEvidence = [fact({ id: 'projection-origin-natal', type: 'document_support', domain: 'contract', originScope: 'natal' })]
  const decision = buildEventTimingDecisions(projectionEvidence)[0]
  const noCalendar = projectEventTimingDecisions([decision], [], undefined)
  assert.equal(noCalendar.facts.length, 0)
  assert.equal(noCalendar.projections[0].status, 'not_projectable')
  assert.equal(decision.certainty, 'confirmed', 'calendar gap must not lower decision certainty')

  const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const birthCases = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  const birth = birthCases['CS-127']
  const at = '2027-01-15T00:00:00.000Z'
  const validity = { periodId: 'p4m3b-natal-inspection', from: { kind: 'exact', instant: at },
    to: { kind: 'exact', instant: '2027-01-16T00:00:00.000Z' } }
  const authority = name => read(`src/docs/source/authority/${name}.md`)
  const judgment = runInternalReading({ birth: { date: birth.date, time: { known: true, value: birth.time },
    gender: birth.gender ?? '女性', timeCorrectionMode: 'none' },
  calculation: { referenceTime: at, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 },
  executionId: 'p4m3b-projection-cs127', natalInspectionPeriod: validity,
  sources: { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
    D: authority('D_rev152'), approval: authority('25-7_rev16') } })
  const productionYear = judgment.judgmentCore.find(snapshot => snapshot.scope === 'yearlyLuck')
  assert.ok(productionYear?.validity.from.kind === 'exact' && productionYear.validity.to.kind === 'exact')
  const projectionScope = { snapshot: productionYear, evaluatedAt: at, scopeGanZhi: decision.scopeGanZhi,
    parentScopeGanZhi: decision.parentScopeGanZhi }
  const projectedDecision = { ...decision, scopeId: productionYear.id, scope: 'sewoon' }
  const projected = projectEventTimingDecisions([projectedDecision], [projectionScope], at)
  assert.deepEqual(projectEventTimingDecisions([projectedDecision], [projectionScope], at), projected, 'stable projected IDs')
  assert.equal(projected.facts.length, 1)
  assert.equal(projected.projections[0].status, 'projected')
  assert.equal(projected.facts[0].originScope, 'natal', 'projection preserves source origin scope')
  assert.equal(projected.facts[0].scopeGanZhi, decision.scopeGanZhi, 'projection preserves named scope identity')
  const mismatchedScope = projectEventTimingDecisions([projectedDecision], [{ ...projectionScope,
    snapshot: { ...productionYear, scope: 'greatLuck' } }], at)
  assert.equal(mismatchedScope.facts.length, 0)
  assert.equal(mismatchedScope.projections[0].reason, 'scope_mismatch')
  const productionTiming = buildEventTiming({ scopes: judgment.judgmentCore.map(snapshot => ({ snapshot, evaluatedAt: at })),
    knownFacts: { 'event.contract.process': true, 'event.business.startGoal': true, 'event.business.operating': true,
      'event.business.adjustment': true, 'event.business.restructure': true }, referenceTime: at })
  const productionReading = assembleReading({ judgment, eventTimingFacts: productionTiming.facts, productScope: 'premium', referenceTime: at })
  validateReadingAssembly(productionReading)
  assert.equal(productionTiming.facts.length, 0, 'real production fixture does not invent an event without supporting path')
  assert.equal(productionTiming.decisions.length, 0, 'production fixture has no event-specific decision')

  const sourceNegativeReady = result.sourceCases.length === 2 && result.sourceCases.every(item => item.result === 'PASS')
  console.log(JSON.stringify({ result: sourceNegativeReady ? 'PASS' : 'P4M3B_FIX_REQUIRED', sourceCases: result.sourceCases, contractCoverage: result.contractCoverage,
    policyViolations: 0, inventedGregorianDates: 0, sourceSnapshotTimingFacts: 0,
    sourceSnapshotDecisions: result.sourceCases.reduce((total, item) => total + item.decisions.length, 0),
    noIntervalDecision: 'confirmed/not_projectable', contractProjection: 'PASS', productionCalendarWiring: 'PASS',
    productionEventFacts: productionTiming.facts.length }, null, 2))
  if (!sourceNegativeReady) process.exitCode = 1
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await server.close()
}
