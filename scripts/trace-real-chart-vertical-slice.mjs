import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/${path}.ts`)
try {
  const [{ runInternalReading }, { birthReadingContext }, reading, { buildCustomerReadingPlan }] = await Promise.all([
    load('lib/judgment/pipeline/internalReading'), load('lib/product/readBirthChart'), load('lib/reading/index'),
    load('lib/reading/customer/buildCustomerReadingPlan'),
  ])
  const births = read('scripts/fixtures/byeong-judgment-inputs.json')
  const fixtureId = process.argv[2] ?? 'CS-126'
  const birth = births[fixtureId]
  if (!birth) throw new Error(`Unknown existing chart fixture: ${fixtureId}`)
  const at = process.argv[3] ?? '2027-07-15T00:00:00.000Z'
  const context = birthReadingContext(at)
  const judgment = runInternalReading({ ...context, birth: { date: birth.date,
    time: { known: true, value: birth.time }, gender: birth.gender ?? '女性', timeCorrectionMode: 'none' },
    executionId: `real-chart-vertical-slice:${fixtureId}` })
  const outcomes = reading.moneyOutcomeFromReading({ judgment })
  const relationships = reading.relationshipOutcomeFromReading({ judgment })
  const assembly = reading.assembleReading({ canonical: judgment.canonical, judgment, moneyOutcomes: outcomes,
    relationshipOutcomes: relationships, productScope: 'premium', referenceTime: at })
  const plan = buildCustomerReadingPlan({ assembly, moneyOutcomes: outcomes, relationshipOutcomes: relationships })
  const allOutcomes = [...outcomes, ...relationships]
  const unitFor = outcome => assembly.structuralExplanationUnits.find(unit => unit.outcomeFactId === outcome.id)
  const selectedOutcomes = [
    outcomes.find(item => unitFor(item)?.competingCauseRefs.length) ?? outcomes.find(item => item.sourceRelationIds?.length) ?? outcomes[0],
    outcomes.find(item => item.semanticType === 'money_acquisition' && item.sourceRelationIds?.length),
    relationships.find(item => item.sourceRelationIds?.length) ?? relationships[0],
  ].filter((item, index, all) => item && all.findIndex(other => other?.id === item.id) === index)
  const selectedIds = new Set(selectedOutcomes.map(item => item.id))
  const selectedUnits = assembly.structuralExplanationUnits.filter(item => selectedIds.has(item.outcomeFactId))
  const relevantScopeIds = new Set(selectedOutcomes.map(item => item.scopeId))
  const relationIdsByScope = new Map(selectedUnits.map(unit => [unit.scopeId,
    new Set(unit.functionalChanges.map(change => change.relationId))]))
  const outcomeSummary = item => ({ id: item.id, semanticType: item.semanticType, domain: item.domain,
    target: item.wealthEntityId ?? item.target ?? null, direction: item.direction, scope: item.scope,
    scopeId: item.scopeId, period: item.period, certainty: item.certainty,
    sourceJudgmentIds: item.sourceJudgmentIds, sourceRelationIds: item.sourceRelationIds,
    sourceRoleIds: item.sourceRoleIds, sourceLuckEffectIds: item.sourceLuckEffectIds,
    sourceParticipantIds: item.sourceParticipantIds, provenance: item.provenance })
  const explanationSummary = item => ({ id: item.id, outcomeFactId: item.outcomeFactId, domain: item.domain,
    target: item.target, direction: item.direction, certainty: item.certainty,
    primaryCauseRefs: item.primaryCauseRefs, supportingCauseRefs: item.supportingCauseRefs,
    competingCauseRefs: item.competingCauseRefs, unresolvedCauseRefs: item.unresolvedCauseRefs,
    causePaths: item.causePaths, functionalChanges: item.functionalChanges,
    palaceAttribution: item.palaceAttribution, experiencedProcess: item.experiencedProcess,
    period: item.period, provenanceIds: item.provenanceIds })
  const reverseSnapshot = snapshot => ({ ...snapshot, stemFacts: [...snapshot.stemFacts].reverse(),
    patternFacts: [...snapshot.patternFacts].reverse(), branchFacts: [...snapshot.branchFacts].reverse(),
    actualFunctions: [...snapshot.actualFunctions].reverse(),
    roleEngine: { ...snapshot.roleEngine, currentRoles: [...snapshot.roleEngine.currentRoles].reverse(),
      roleHistory: [...snapshot.roleEngine.roleHistory].reverse() },
    luckEffectStates: [...snapshot.luckEffectStates].reverse() })
  const reversedInput = { canonical: judgment.canonical,
    judgment: { ...judgment, judgmentCore: judgment.judgmentCore.map(reverseSnapshot).reverse() },
    moneyOutcomes: [...outcomes].reverse(), relationshipOutcomes: [...relationships].reverse(),
    productScope: 'premium', referenceTime: at }
  const reversedAssembly = reading.assembleReading(reversedInput)
  const reversedOutcomes = reading.moneyOutcomeFromReading({ judgment: reversedInput.judgment })
  const reversedRelationships = reading.relationshipOutcomeFromReading({ judgment: reversedInput.judgment })
  const reversedPlan = buildCustomerReadingPlan({ assembly: reversedAssembly,
    moneyOutcomes: reversedInput.moneyOutcomes, relationshipOutcomes: reversedInput.relationshipOutcomes })
  assert.deepEqual(reversedOutcomes, outcomes)
  assert.deepEqual(reversedRelationships, relationships)
  assert.deepEqual(reversedAssembly.structuralExplanationUnits, assembly.structuralExplanationUnits)
  assert.deepEqual(reversedPlan.semanticUnits, plan.semanticUnits)
  const chain = selectedUnits.map(unit => {
    const outcome = selectedOutcomes.find(item => item.id === unit.outcomeFactId)
    const assemblySemantic = assembly.semanticUnits.find(item => item.meaningRef.recordId === outcome.id)
    const semantic = plan.semanticUnits.find(item => item.meaningRef.recordId === outcome.id)
    const evidence = plan.evidenceContext.outcomes.find(item => item.outcomeFactId === outcome.id)
    const paragraph = plan.chapters.flatMap(item => item.paragraphPlans)
      .find(item => item.expression.kind === 'outcome' && item.sourceOutcomeIds.includes(outcome.id))
    return { judgmentFactId: outcome.sourceRelationIds?.[0], structuralFunctionIds: unit.functionalChanges.map(item => item.id),
      outcomeFactId: outcome.id, explanationUnitId: unit.id, assemblySemanticUnitId: assemblySemantic?.id,
      semanticUnitId: semantic?.id,
      evidenceContextOutcomeId: evidence?.outcomeFactId,
      evidenceContextExplanationUnitIds: evidence?.explanationUnitIds,
      paragraphId: paragraph?.id, paragraphExplanationRefs: paragraph?.expression.kind === 'outcome'
        ? paragraph.expression.structuralExplanationUnitIds : [],
      explanationRefOnPlanParagraph: paragraph?.expression.kind === 'outcome'
        && paragraph.expression.structuralExplanationUnitIds.includes(unit.id) }
  })
  const competingRetention = outcomes.find(item => item.semanticType === 'money_retention'
    && unitFor(item)?.competingCauseRefs.length)
  assert(competingRetention, 'CS-126 must contain the existing competing retention Outcome')
  assert.equal(competingRetention.lifecycle, 'deferred')
  assert.equal(competingRetention.currentlyEffective, false)
  assert.equal(unitFor(competingRetention).unresolvedCauseRefs.length, 0)
  assert.equal(assembly.semanticUnits.some(item => item.meaningRef.recordId === competingRetention.id), false,
    'deferred retention is filtered before assembly semantic-unit creation')
  assert(plan.evidenceContext.deferredOutcomeIds.includes(competingRetention.id),
    'deferred retention must remain internal in CustomerEvidenceContext')
  assert(plan.evidenceContext.explanationUnits.some(item => item.outcomeFactId === competingRetention.id),
    'the competing explanation must be available in CustomerEvidenceContext')
  const acquisition = outcomes.find(item => item.semanticType === 'money_acquisition')
  assert(acquisition && plan.semanticUnits.some(item => item.meaningRef.recordId === acquisition.id),
    'favorable acquisition must reach CustomerReadingPlan')
  const snapshots = judgment.judgmentCore
  const compact = value => JSON.parse(JSON.stringify(value))
  const result = {
    fixture: fixtureId, referenceTime: at,
    canonical: { pillars: Object.fromEntries(Object.entries(judgment.canonical.chart.pillars)
      .map(([key, item]) => [key, item.value.ganZhi])), luck: judgment.canonical.luck },
    snapshotKeys: snapshots.filter(s => relevantScopeIds.has(s.id)).map(s => {
      const relationIds = relationIdsByScope.get(s.id) ?? new Set()
      return ({ id: s.id, scope: s.scope, scopeId: s.scopeId,
      patternContext: { id: s.patternContext?.id, pattern: s.patternContext?.branchPattern,
        currentFunction: s.patternContext?.currentFunction },
      relationFacts: s.stemFacts.filter(f => relationIds.has(f.id)).map(f => ({ id: f.id, kind: f.kind, action: f.action,
        source: { id: f.source.id, tenGod: f.source.tenGod }, target: { id: f.target.id, tenGod: f.target.tenGod } })),
      patternFacts: s.patternFacts.filter(f => relationIds.has(f.id)).map(f => ({ id: f.id, kind: f.kind, action: f.action,
        source: { id: f.source.id, tenGod: f.source.tenGod }, target: { id: f.target.id, tenGod: f.target.tenGod } })),
      actualFunctions: s.actualFunctions.filter(f => relationIds.has(f.relationFactId)).map(f => ({ id: f.id, relationFactId: f.relationFactId,
        function: f.function, direction: f.direction, policyId: f.policyId, structuralEffect: f.structuralEffect,
        roleId: f.roleId, patternContextId: f.patternContextId, ruleId: f.ruleId,
        conditionEvidence: f.conditionEvidence, resolutionEvidence: f.resolutionEvidence })),
      roleStates: s.roleEngine.currentRoles.filter(f => f.pathRefs.some(id => relationIds.has(id))).map(f => ({ roleId: f.roleId, participantId: f.participantId,
        currentFunction: f.currentFunction, currentState: f.currentState, pathRefs: f.pathRefs })),
      policyRoles: s.policyRoles, luckEffectStates: s.luckEffectStates.map(f => ({ id: f.event.id,
        sourceRelationFactId: f.event.sourceRelationFactId, evidenceRefs: f.event.evidenceRefs,
        state: f.state, effect: f.event.effect })),
      branchFacts: s.branchFacts.filter(f => relationIds.has(f.id)).map(f => ({ id: f.id, kind: f.kind, participants: f.participants })) })}),
    counts: { judgmentSnapshots: snapshots.length, allOutcomes: allOutcomes.length,
      explanationUnits: assembly.structuralExplanationUnits.length, planSemanticUnits: plan.semanticUnits.length },
    allOutcomeDiagnostics: allOutcomes.map(item => {
      const unit = assembly.structuralExplanationUnits.find(explanation => explanation.outcomeFactId === item.id)
      return { id: item.id, domain: item.domain, semanticType: item.semanticType, direction: item.direction,
        scope: item.scope, lifecycle: item.lifecycle, temporalStatus: item.temporalStatus, currentlyEffective: item.currentlyEffective,
        sourceRelationIds: item.sourceRelationIds,
        primary: unit?.primaryCauseRefs.length ?? 0, supporting: unit?.supportingCauseRefs.length ?? 0,
        competing: unit?.competingCauseRefs.length ?? 0, unresolved: unit?.unresolvedCauseRefs.length ?? 0,
        protectionRefs: unit?.functionalChanges.reduce((count, change) => count + change.protectionRefs.length, 0) ?? 0,
        damageRefs: unit?.functionalChanges.reduce((count, change) => count + change.damageRefs.length, 0) ?? 0,
        assemblySemanticUnitId: assembly.semanticUnits.find(semantic => semantic.meaningRef.recordId === item.id)?.id ?? null,
        planSemanticUnitId: plan.semanticUnits.find(semantic => semantic.meaningRef.recordId === item.id)?.id ?? null }
    }),
    outcomeFacts: selectedOutcomes.map(outcomeSummary),
    explanationUnits: selectedUnits.map(explanationSummary),
    customerPlan: { version: plan.version,
      semanticUnits: compact(plan.semanticUnits.filter(unit => selectedIds.has(unit.meaningRef.recordId))),
      linkedParagraphs: plan.chapters.filter(c => ['CH-05','CH-06'].includes(c.chapterId)).flatMap(c => c.paragraphPlans
        .filter(p => p.expression.kind === 'outcome' && selectedIds.has(p.expression.outcomeId))
        .map(p => ({ chapterId: c.chapterId, id: p.id, semanticUnitIds: p.semanticUnitIds,
          sourceOutcomeIds: p.sourceOutcomeIds, expression: p.expression }))),
      structuralExplanationUnits: plan.structuralExplanationUnits.filter(item => selectedIds.has(item.outcomeFactId)).map(explanationSummary) },
    idChains: chain, determinism: { reversedRelevantArraysEqual: true },
  }
  console.log(JSON.stringify(result, null, 2))
} finally { await server.close() }
