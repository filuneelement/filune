import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/money-expert-source-case-snapshots.json', import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const pillar = (fixtureId, position, ganZhi) => ({
  stem: { id: `${fixtureId}:${position}:${ganZhi}:stem`, value: ganZhi[0] },
  branch: { id: `${fixtureId}:${position}:${ganZhi}:branch`, value: ganZhi[1] },
})
const unknownPeriod = periodId => ({ periodId,
  from: { kind: 'unknown', reason: 'source-does-not-state-gregorian-boundary' },
  to: { kind: 'unknown', reason: 'source-does-not-state-gregorian-boundary' },
})

try {
  const [{ runJudgmentCore }, { buildMoneyOutcome }, { assembleReading }, { buildCustomerReadingPlan }] = await Promise.all([
    load('judgment/core/luckScope'), load('outcome/money/moneyOutcome'), load('reading/index'),
    load('reading/customer/buildCustomerReadingPlan'),
  ])
  const results = fixtures.map(fixture => {
    const natal = Object.fromEntries(Object.entries(fixture.pillars).map(([position, ganZhi]) =>
      [position, pillar(fixture.fixtureId, position, ganZhi)]))
    const [snapshot] = runJudgmentCore({ executionId: fixture.fixtureId, natal,
      natalValidity: unknownPeriod(`${fixture.fixtureId}:natal`), natalCombinations: [], luck: [] })
    const moneyOutcomes = buildMoneyOutcome({ natal: snapshot, referenceTime: '' })
    const assembly = assembleReading({ luckScopes: [snapshot], moneyOutcomes,
      productScope: 'premium', referenceTime: '' })
    const plan = buildCustomerReadingPlan({ assembly, moneyOutcomes })
    const publishableIds = new Set(plan.semanticUnits
      .filter(unit => unit.meaningRef.kind === 'outcome_fact').map(unit => unit.meaningRef.recordId))
    const explanations = assembly.structuralExplanationUnits
    return {
      fixtureId: fixture.fixtureId, source: fixture.source, pillars: fixture.pillars, gender: fixture.gender,
      sourceScope: fixture.sourceScope, sourceExpectation: fixture.expectation,
      canonical: { status: 'not-run-source-pillar-snapshot', birthInputAvailable: false },
      judgment: {
        snapshotId: snapshot.id, scope: snapshot.scope, patternContext: snapshot.patternContext,
        currentFunctions: snapshot.actualFunctions.filter(item => ['operating', 'reduced'].includes(item.function))
          .map(item => ({ id: item.id, relationFactId: item.relationFactId, function: item.function,
            direction: item.direction, policyId: item.policyId, roleId: item.roleId,
            effect: item.structuralEffect?.effect, currentlyEffective: item.structuralEffect?.currentlyEffective })),
        currentRoles: snapshot.roleEngine.currentRoles.map(role => ({ roleId: role.roleId,
          participantId: role.participantId, currentFunction: role.currentFunction,
          currentState: role.currentState, pathRefs: role.pathRefs })),
      },
      moneyOutcomes: moneyOutcomes.map(fact => ({ id: fact.id, semanticType: fact.semanticType,
        result: fact.result, direction: fact.direction, scope: fact.scope, certainty: fact.certainty,
        lifecycle: fact.lifecycle, currentlyEffective: fact.currentlyEffective,
        sourceJudgmentIds: fact.sourceJudgmentIds, sourceRelationIds: fact.sourceRelationIds,
        sourceRoleIds: fact.sourceRoleIds, provenance: fact.provenance })),
      explanations: explanations.map(unit => ({ id: unit.id, outcomeFactId: unit.outcomeFactId,
        direction: unit.direction, scope: unit.scope, primaryCauseRefs: unit.primaryCauseRefs,
        supportingCauseRefs: unit.supportingCauseRefs, competingCauseRefs: unit.competingCauseRefs,
        unresolvedCauseRefs: unit.unresolvedCauseRefs, causePaths: unit.causePaths,
        functionalChanges: unit.functionalChanges, provenanceIds: unit.provenanceIds })),
      publicationAndPlan: {
        publishableOutcomeIds: [...publishableIds].sort(),
        moneySemanticUnits: plan.semanticUnits.filter(unit => unit.topic === 'money')
          .map(unit => ({ id: unit.id, meaningRef: unit.meaningRef,
            structuralExplanationUnitIds: unit.structuralExplanationUnitIds ?? [],
            moneyAxis: unit.moneyAxis, certainty: unit.certainty, scope: unit.scope, period: unit.period })),
        internalDeferredOutcomeIds: plan.evidenceContext?.deferredOutcomeIds ?? [],
        explanationUnitIds: plan.structuralExplanationUnits.map(unit => unit.id),
      },
      comparisons: Object.entries(fixture.expectation).filter(([key]) =>
        ['money_acquisition', 'money_retention', 'money_pressure'].includes(key)).map(([axis, expected]) => ({
        axis, expected, verdict: fixture.sourceScope.kind === 'natal' ? 'compare-natal-scope-only' : 'not-comparable-scope',
      })),
    }
  })
  assert.equal(results.length, fixtures.length)
  console.log(JSON.stringify({ fixtureCount: fixtures.length, allUseSourcePillarValues: true,
    guessedBirthInputs: 0, results }, null, 2))
} finally {
  await server.close()
}
