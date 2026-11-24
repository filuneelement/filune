import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/money-expert-source-case-snapshots.json', import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
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
  const evaluate = (fixture, declaredScopes, evaluationId = fixture.fixtureId) => {
    const natal = Object.fromEntries(Object.entries(fixture.pillars).map(([position, ganZhi]) =>
      [position, pillar(fixture.fixtureId, position, ganZhi)]))
    const luck = scopeInputs({ ...fixture, fixtureId: evaluationId }, declaredScopes)
    const snapshots = runJudgmentCore({ executionId: evaluationId, natal,
      natalValidity: unknownPeriod(`${evaluationId}:natal`), natalCombinations: [], luck })
    const [natalSnapshot, ...luckSnapshots] = snapshots
    const evaluatedLuck = luckSnapshots.map((snapshot, index) => ({ snapshot, evaluatedAt: '',
      parentSnapshot: luckSnapshots[index - 1] ?? natalSnapshot }))
    const moneyOutcomes = buildMoneyOutcome({ natal: natalSnapshot, referenceTime: '', luck: evaluatedLuck })
    const assembly = assembleReading({ luckScopes: snapshots, moneyOutcomes, productScope: 'premium', referenceTime: '' })
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
        pattern: { branchPattern: snapshot.patternContext.branchPattern,
          heavenlyPatterns: snapshot.patternContext.heavenlyPatterns,
          specialYongShen: snapshot.patternContext.specialYongShen },
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
          currentFunction: role.currentFunction, currentState: role.currentState, pathRefs: role.pathRefs })),
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
      explanations, outcomeLimitation: luckSnapshots.length
        ? 'ENGINE_SCOPE_GAP: buildMoneyOutcome requires effective exact validity bounds for luck scopes; source has no Gregorian boundaries.'
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
    evaluate(byId.get('SRC-07-2328'), [
      { scope: 'greatLuck', ganZhi: '丙辰', label: 'daewoon-丙辰' },
      { scope: 'yearlyLuck', ganZhi: '癸卯', label: 'sewoon-癸卯' },
    ], 'SRC-07-2328-丙辰-癸卯'),
    evaluate(byId.get('SRC-07-2328'), [
      { scope: 'greatLuck', ganZhi: '丁巳', label: 'later-daewoon-丁巳' },
    ], 'SRC-07-2328-later-丁巳'),
  ]
  assert.equal(results.length, 6)
  assert.deepEqual(results.slice(2).map(item => item.snapshots.slice(1).map(state => state.scope)), [
    ['greatLuck', 'yearlyLuck'], ['greatLuck', 'yearlyLuck', 'monthlyLuck'],
    ['greatLuck', 'yearlyLuck'], ['greatLuck'],
  ])
  console.log(JSON.stringify({ validationType: 'source-scope-interpretation', canonicalE2e: 'not-run',
    guessedGregorianValues: 0, results }, null, 2))
} finally {
  await server.close()
}
