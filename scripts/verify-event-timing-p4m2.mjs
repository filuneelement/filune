import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const clone = value => structuredClone(value)
const reverse = items => [...items].reverse()
const scopesFromSnapshot = scope => ({ natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month', dailyLuck: 'day' })[scope]
const tally = { pipelines: 0, evidence: 0, timing: 0, orphanEvidence: 0, orphanTiming: 0,
  duplicateEvidence: 0, duplicateTiming: 0, scopeMismatch: 0, unsupportedContext: 0, freeLeakage: 0,
  mutation: 0, stableIdentityMismatch: 0, assemblyMissing: 0, shortcutViolation: 0 }

try {
  const [{ runInternalReading }, { CURRENT_CALCULATION_VERSION }, { buildEventTiming },
    { assembleReading, validateReadingAssembly, moneyOutcomeFromReading, relationshipOutcomeFromReading }] = await Promise.all([
    load('judgment/pipeline/internalReading'), load('canonical/version'), load('eventTiming/index'),
    load('reading/index'),
  ])
  const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
  births['runtime-context'] = { date: { year: 1985, month: 1, day: 4 }, time: { hour: 9, minute: 0 }, gender: '男性' }
  const period = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
  const sources = { A: read('src/docs/source/authority/A_rev179.md'), draftA: read('src/docs/source/authority/A_rev180.md'),
    C: read('src/docs/source/authority/C_rev215.md'), D: read('src/docs/source/authority/D_rev152.md'),
    approval: read('src/docs/source/authority/25-7_rev16.md') }
  const execute = (birthKey, referenceTime, label) => runInternalReading({
    birth: { date: births[birthKey].date, time: { known: true, value: births[birthKey].time },
      gender: births[birthKey].gender ?? '女性', timeCorrectionMode: 'none' },
    calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: Number(referenceTime.slice(0, 4)) },
    executionId: `p4m2-${label}`, natalInspectionPeriod: period('natal-inspection', referenceTime,
      new Date(Date.parse(referenceTime) + 86_400_000).toISOString()), sources,
    ...(referenceTime === '2027-01-15T00:00:00.000Z' && { monthlyWindowStart: { year: 2026, month: 11 } }),
  })
  const cases = [
    ['CS-005', '2027-01-15T00:00:00.000Z'],
    ['CS-126', '2027-07-15T00:00:00.000Z'],
    ['CS-127', '2027-01-15T00:00:00.000Z'],
    ['runtime-context', '2003-02-15T00:00:00.000Z'],
  ]
  let sourcePathCandidates = 0
  let assemblyInput
  for (const [birthKey, at] of cases) {
    const judgment = execute(birthKey, at, birthKey)
    const before = JSON.stringify(judgment)
    const months = judgment.luck.monthlyWindow ?? []
    const scopeEntries = [...judgment.judgmentCore.map(snapshot => ({ snapshot, evaluatedAt: at })),
      ...months.flatMap(month => month.judgmentCore ? [{ snapshot: month.judgmentCore, evaluatedAt: month.startInstant }] : [])]
    const uniqueScopes = [...new Map(scopeEntries.map(item => [item.snapshot.id, item])).values()]
    const money = moneyOutcomeFromReading({ judgment })
    const relationship = relationshipOutcomeFromReading({ judgment })
    const upstreamBefore = JSON.stringify({ judgment, money, relationship })
    const knownFacts = { 'event.contract.process': true, 'event.business.startGoal': true,
      'event.business.operating': true, 'event.business.adjustment': true, 'event.business.restructure': true }
    const result = buildEventTiming({ scopes: uniqueScopes, moneyOutcomes: money,
      relationshipOutcomes: relationship, knownFacts, referenceTime: at })
    const resultAgain = buildEventTiming({ scopes: uniqueScopes, moneyOutcomes: money,
      relationshipOutcomes: relationship, knownFacts, referenceTime: at })
    assert.deepEqual(resultAgain, result)
    const noContext = buildEventTiming({ scopes: uniqueScopes, moneyOutcomes: money,
      relationshipOutcomes: relationship, knownFacts: {}, referenceTime: at })
    assert.deepEqual(noContext.evidence, [])
    assert.deepEqual(noContext.facts, [])
    const assembly = assembleReading({ judgment, moneyOutcomes: money, relationshipOutcomes: relationship,
      eventTimingFacts: result.facts, productScope: 'premium', referenceTime: at })
    const free = assembleReading({ judgment, moneyOutcomes: money, relationshipOutcomes: relationship,
      eventTimingFacts: result.facts, productScope: 'free', referenceTime: at })
    validateReadingAssembly(assembly)
    validateReadingAssembly(free)
    const eventUnits = assembly.semanticUnits.filter(unit => unit.topic === 'event_timing')
    const freeEventUnits = free.semanticUnits.filter(unit => unit.topic === 'event_timing')
    tally.freeLeakage += freeEventUnits.length
    assert.equal(freeEventUnits.length, 0)
    assert.equal(eventUnits.length, result.facts.filter(fact => fact.temporalStatus !== 'expired').length)
    for (const fact of result.evidence) {
      const snapshot = uniqueScopes.find(item => item.snapshot.id === fact.scopeId)?.snapshot
      const relations = snapshot && [...snapshot.stemFacts, ...snapshot.patternFacts].filter(item => item.action !== 'coexist')
      const valid = Boolean(snapshot && fact.sourceJudgmentIds.includes(snapshot.id)
        && fact.sourceRelationIds.length && fact.sourceRelationIds.every(id => relations?.some(item => item.id === id)
          || snapshot.branchFacts.some(item => item.id === id)
          || snapshot.combinationHistory.some(item => item.relation.id === id))
        && fact.sourceRoleIds.every(id => snapshot.roleEngine.roleHistory.some(role => role.roleId === id))
        && fact.sourcePatternContextIds.every(id => id === snapshot.patternContext.id)
        && fact.sourceLuckEffectIds.every(id => snapshot.luckEffectStates.some(effect => effect.event.id === id))
        && fact.provenance.length && fact.sourceContextKeys.length)
      const scopeMatches = Boolean(snapshot && fact.scope === scopesFromSnapshot(snapshot.scope)
        && fact.period && JSON.stringify(fact.period) === JSON.stringify(snapshot.validity))
      const contextMatches = fact.sourceContextKeys.every(key => knownFacts[key] === true)
      tally.evidence++
      if (!valid) tally.orphanEvidence++
      if (!scopeMatches) tally.scopeMismatch++
      if (!contextMatches) tally.unsupportedContext++
      if ((!fact.sourceRoleIds.length && !fact.sourcePatternContextIds.length) || !fact.sourceRelationIds.length) tally.shortcutViolation++
      assert.ok(valid, fact.id)
      assert.ok(scopeMatches, fact.id)
      assert.ok(contextMatches, fact.id)
      assert.ok(fact.scope !== 'natal' && fact.scope !== 'day')
      assert.equal(fact.provenanceClass, 'SOURCE_INFERENCE')
      if (fact.direction === 'favorable') sourcePathCandidates++
    }
    const evidenceIds = result.evidence.map(fact => fact.id)
    tally.duplicateEvidence += evidenceIds.length - new Set(evidenceIds).size
    const timingIds = result.facts.map(fact => fact.id)
    tally.duplicateTiming += timingIds.length - new Set(timingIds).size
    for (const fact of result.facts) {
      tally.timing++
      const valid = fact.sourceEvidenceIds.length > 0 && fact.sourceJudgmentIds.length > 0
        && fact.sourceRelationIds.length > 0 && fact.provenance.length > 0
      if (!valid) tally.orphanTiming++
      if (!fact.sourceEvidenceIds.every(id => result.evidence.some(evidence => evidence.id === id))) tally.orphanTiming++
      assert.ok(valid, fact.id)
      assert.ok(fact.sourceEvidenceIds.every(id => result.evidence.some(evidence => evidence.id === id)), fact.id)
      assert.ok(fact.scope === 'daewoon' || fact.scope === 'sewoon' || fact.scope === 'month')
      assert.ok(!['contract_finalization', 'contract_failure', 'business_failure'].includes(fact.eventType))
    }
    const reversedScopes = reverse(uniqueScopes).map(({ snapshot, evaluatedAt }) => ({ snapshot: {
      ...snapshot, stemFacts: reverse(snapshot.stemFacts), patternFacts: reverse(snapshot.patternFacts),
      actualFunctions: reverse(snapshot.actualFunctions), branchFacts: reverse(snapshot.branchFacts),
      rootFacts: reverse(snapshot.rootFacts), rootStates: reverse(snapshot.rootStates),
      luckEffectStates: reverse(snapshot.luckEffectStates), roleEngine: { ...snapshot.roleEngine,
        currentRoles: reverse(snapshot.roleEngine.currentRoles), roleHistory: reverse(snapshot.roleEngine.roleHistory) },
    }, evaluatedAt }))
    const reversed = buildEventTiming({ scopes: reversedScopes, moneyOutcomes: reverse(money),
      relationshipOutcomes: reverse(relationship), knownFacts, referenceTime: at })
    if (JSON.stringify(reversed) !== JSON.stringify(result)) tally.stableIdentityMismatch++
    assert.deepEqual(reversed, result)
    const byId = new Map(assembly.semanticUnits.filter(unit => unit.topic === 'event_timing')
      .map(unit => [unit.meaningRef.recordId, unit]))
    for (const fact of result.facts.filter(item => item.temporalStatus !== 'expired')) {
      const unit = byId.get(fact.id)
      if (!unit || unit.eventType !== fact.eventType || unit.eventDirection !== fact.direction
        || unit.scope !== fact.scope || unit.certainty !== fact.certainty || unit.sourceStatus !== fact.temporalStatus
        || JSON.stringify(unit.sourceRoleIds) !== JSON.stringify([...fact.sourceRoleIds].sort())
        || JSON.stringify(unit.sourceEffectIds) !== JSON.stringify([...fact.sourceLuckEffectIds].sort())) tally.assemblyMissing++
      assert.ok(unit, fact.id)
      const expectedChapter = fact.scope === 'daewoon' ? 'CH-08' : fact.scope === 'sewoon' ? 'CH-09' : 'CH-10'
      assert.ok(assembly.chapters.find(chapter => chapter.id === expectedChapter)?.placements.some(item => item.unitId === unit.id))
    }
    assert.equal(JSON.stringify(result).match(/(?:timingScore|eventScore|weightedScore|55%|30%|10%|5%|\+85)/gu)?.length ?? 0, 0)
    assert.equal(JSON.stringify(eventUnits).match(/대운|세운|월운|일운|일진|용신|상신|병|구응|격/gu)?.length ?? 0, 0)
    assert.equal(JSON.stringify(judgment), before)
    tally.mutation += JSON.stringify({ judgment, money, relationship }) !== upstreamBefore ? 1 : 0
    assemblyInput = { judgment, moneyOutcomes: money, relationshipOutcomes: relationship, referenceTime: at }
    tally.pipelines++
  }
  // Schema/routing smoke only: this record is not a chart prediction or a source-backed event fixture.
  const yearly = assemblyInput.judgment.judgmentCore.find(snapshot => snapshot.scope === 'yearlyLuck')
  const relation = yearly.stemFacts.find(item => item.action !== 'coexist')
    ?? yearly.patternFacts.find(item => item.action !== 'coexist')
  if (yearly && relation && Date.parse(yearly.validity.from.instant) <= Date.parse(assemblyInput.referenceTime)
    && Date.parse(assemblyInput.referenceTime) < Date.parse(yearly.validity.to.instant)) {
    const assemblyOnlyFact = { id: 'event-timing:assembly-contract', eventType: 'contract_favorable', direction: 'favorable',
      originScope: 'sewoon', scope: 'sewoon', scopeId: yearly.id, period: yearly.validity,
      certainty: 'contextual', provenanceClass: 'SOURCE_INFERENCE', currentLifecycle: 'active', temporalStatus: 'current',
      currentlyEffective: true, sourceEvidenceIds: ['event-evidence:assembly-smoke'], sourceJudgmentIds: [yearly.id],
      sourceRelationIds: [relation.id], sourceRoleIds: [], sourceOutcomeIds: [], sourceLuckEffectIds: [],
      provenance: ['assembly-smoke-only'] }
    const premium = assembleReading({ ...assemblyInput, eventTimingFacts: [assemblyOnlyFact], productScope: 'premium' })
    const free = assembleReading({ ...assemblyInput, eventTimingFacts: [assemblyOnlyFact], productScope: 'free' })
    const unit = premium.semanticUnits.find(item => item.meaningRef.recordId === assemblyOnlyFact.id)
    assert.ok(unit && unit.eventType === assemblyOnlyFact.eventType && unit.eventDirection === assemblyOnlyFact.direction)
    assert.ok(premium.chapters.find(item => item.id === 'CH-09')?.placements.some(item => item.unitId === unit.id))
    assert.equal(free.semanticUnits.some(item => item.meaningRef.recordId === assemblyOnlyFact.id), false)
  }
  assert.equal(tally.orphanEvidence, 0)
  assert.equal(tally.orphanTiming, 0)
  assert.equal(tally.duplicateEvidence, 0)
  assert.equal(tally.duplicateTiming, 0)
  assert.equal(tally.scopeMismatch, 0)
  assert.equal(tally.unsupportedContext, 0)
  assert.equal(tally.freeLeakage, 0)
  assert.equal(tally.mutation, 0)
  assert.equal(tally.stableIdentityMismatch, 0)
  assert.equal(tally.assemblyMissing, 0)
  assert.equal(tally.shortcutViolation, 0)
  console.log(JSON.stringify({ result: 'PASS', tally,
    sourceBackedPositiveFixture: 'NOT_TESTABLE_WITH_CURRENT_FIXTURE', conditionalPositivePathCandidatesObserved: sourcePathCandidates,
    eventContext: 'explicit only', dayFinalization: 'ENGINE_GAP', legalDispute: 'SOURCE_GAP' }, null, 2))
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await server.close()
}
