import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/lib/${path}.ts`)
const referenceTime = '2027-01-15T00:00:00.000Z'
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const natalValidity = validity('inspection', '2027-01-01T00:00:00.000Z', '2027-02-01T00:00:00.000Z')
const great = incoming => ({ scope: 'greatLuck', pillar: incoming,
  validity: validity('great', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z') })
const day = pillar('dm', '甲', '寅')
const wealth = pillar('wealth', '戊', '辰')
const food = pillar('food', '丙', '巳')
const earning = { day, month: food, year: wealth }
const wealthPattern = { day, month: wealth, year: food }
const guarded = { day, month: pillar('peer', '甲', '寅'), year: wealth, time: pillar('guard', '辛', '酉') }
const reserve = { state: 'wealth_capacity_insufficient', evidenceIds: ['reviewed-wealth-bearing-capacity'] }
const moneyDamage = { entityId: wealth.stem.id, condition: 'wealth_damage', evidenceIds: ['reviewed-effective-wealth-damage'] }
const harmful = { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['killing-harmful-killing'] }
const necessaryRegulation = { entityId: 'hurt', condition: 'necessary_hurting_regulation',
  evidenceIds: ['hurt-necessary_hurting_regulation'] }
const outputWithSupport = { day: pillar('dm', '乙', '未'), month: pillar('hurt', '丙', '巳'),
  year: pillar('resource', '癸', '子'), time: wealth }

const cases = [
  ['M1', earning, {}],
  ['M2', wealthPattern, { natalCapacityEvidence: reserve }],
  ['M3', guarded, { luck: [great(pillar('incoming-output', '丁', '巳'))] }],
  ['M4', guarded, { luck: [great(pillar('stopper', '丙', '巳'))] }],
  ['M5', { day: pillar('dm', '乙', '卯'), month: pillar('rob', '甲', '寅'), year: pillar('wealth', '己', '丑') }, {}],
  ['M6A', { ...wealthPattern, time: pillar('killing', '庚', '申') }, { natalPolicyEvidence: [harmful] }],
  ['M6B', outputWithSupport, { natalPolicyEvidence: [necessaryRegulation] }],
  ['M7', guarded, {}],
  ['M8', { ...wealthPattern, time: pillar('rob', '乙', '卯') }, {
    natalCapacityEvidence: reserve, natalPolicyEvidence: [moneyDamage],
  }],
  ['SCOPED_SUPPORT', { day: outputWithSupport.day, month: outputWithSupport.month, year: outputWithSupport.year }, {
    natalPolicyEvidence: [necessaryRegulation], luck: [{ ...great(pillar('wealth', '己', '丑')), policyEvidence: [necessaryRegulation] }],
  }],
  ['NO_NEED', outputWithSupport, {}],
  ['STOPPED_WEALTH', { ...outputWithSupport, year: pillar('resource', '癸', '子') }, {
    natalPolicyEvidence: [necessaryRegulation], natalCombinations: [['wealth', 'resource']],
  }],
  ['GENERIC_CONTROL', { day, month: pillar('resource', '壬', '亥'), year: wealth }, {}],
  ['RELIEF', { day, month: pillar('resource', '壬', '亥'), year: wealth }, { resourceExcessEvidenceIds: ['reviewed-excess'] }],
  ['NO_RULE', { day }, {}],
]

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { buildMoneyOutcome } = await load('outcome/index')
  const { assembleReading, validateReadingAssembly } = await load('reading/index')
  const { buildCustomerReadingPlan } = await load('reading/customer/buildCustomerReadingPlan')
  const { renderCustomerReadingKo } = await load('reading/customer/renderCustomerReadingKo')
  function project(id, natal, options) {
    const [baseline, ...scoped] = runJudgmentCore({ executionId: `p4f:${id}`, natal, referenceTime,
      natalValidity, natalCombinations: [], luck: [], ...options })
    const moneyOutcomes = buildMoneyOutcome({ natal: baseline, referenceTime,
      luck: scoped.map(snapshot => ({ snapshot, evaluatedAt: referenceTime })) })
    const assembly = assembleReading({ productScope: 'premium', referenceTime, moneyOutcomes })
    validateReadingAssembly(assembly)
    const plan = buildCustomerReadingPlan({ assembly, moneyOutcomes })
    assert.deepEqual(buildCustomerReadingPlan({ assembly, moneyOutcomes: [...moneyOutcomes].reverse() }), plan)
    const chapter = renderCustomerReadingKo(plan).find(chapter => chapter.chapterId === 'CR-07')
    for (const key of ['unsupportedClaimCount', 'duplicateMeaningCount', 'moneyActorInferenceCount', 'unsupportedMoneySubdivisionCount', 'unsupportedContrastCount']) {
      assert.equal(chapter.quality[key], 0, `${id} ${key}`)
    }
    assert.equal(chapter.quality.explainedMajorAxisCount, chapter.quality.moneyAxisCount, id)
    assert.equal(chapter.quality.unexplainedSupportedAxisCount, 0, id)
    const ids = new Map(moneyOutcomes.map(outcome => [outcome.id, outcome]))
    const units = new Map(plan.semanticUnits.map(unit => [unit.id, unit]))
    for (const { plan: paragraph } of chapter.paragraphs) {
      for (const activation of paragraph.activations) {
        const fact = ids.get(activation.sourceOutcomeId)
        assert.equal(activation.scope, fact.scope)
        assert.equal(activation.periodRef, fact.period?.periodId)
        assert.equal(activation.certainty, fact.certainty)
        assert.equal(units.get(activation.semanticUnitId).direction, fact.direction)
        assert.equal(units.get(activation.semanticUnitId).moneyTargetId, fact.wealthEntityId)
      }
    }
    return { id, baseline, scoped, facts: moneyOutcomes, plan, chapter }
  }
  const results = new Map(cases.map(([id, natal, options]) => [id, project(id, natal, options)]))
  const row = id => results.get(id)
  const expect = (id, ...axes) => assert.deepEqual(new Set(row(id).chapter.quality.moneyAxes), new Set(axes), id)
  expect('M1', 'earning', 'earning_method')
  expect('M2', 'earning', 'earning_method', 'retention', 'accumulation_continuity')
  expect('M3', 'earning', 'earning_method', 'protection')
  expect('M4', 'retention', 'combined_outflow_or_division', 'protection')
  expect('M5', 'retention', 'combined_outflow_or_division')
  expect('M6A', 'earning', 'earning_method', 'burden')
  expect('M6B', 'earning', 'earning_method', 'burden')
  expect('M7', 'protection')
  expect('M8', 'earning', 'earning_method', 'retention', 'accumulation_continuity', 'combined_outflow_or_division')
  expect('NO_RULE')
  const protectedThenDamaged = row('M4').chapter
  assert(protectedThenDamaged.paragraphs.some(({ plan }) => plan.scope === 'natal' && plan.moneyAxes.includes('protection')))
  assert(protectedThenDamaged.paragraphs.some(({ plan }) => plan.scope === 'daewoon' && plan.moneyAxes.includes('combined_outflow_or_division')))
  for (const id of ['NO_NEED', 'STOPPED_WEALTH', 'GENERIC_CONTROL', 'RELIEF']) {
    assert(!row(id).facts.some(fact => fact.result === 'wealth_can_weaken_needed_support'), id)
  }
  const scopedSupport = row('SCOPED_SUPPORT')
  assert(scopedSupport.facts.some(fact => fact.result === 'wealth_can_weaken_needed_support' && fact.scope === 'daewoon'),
    JSON.stringify(scopedSupport.scoped.map(s => [s.patternContext.branchPattern, s.actualFunctions.map(f => [f.policyId, f.direction, f.function]), s.runtime])))
  assert(!row('SCOPED_SUPPORT').facts.some(fact => fact.result === 'wealth_can_weaken_needed_support' && fact.scope === 'natal'))
  const support = row('M6B').facts.find(outcome => outcome.result === 'wealth_can_weaken_needed_support')
  assert(support)
  assert.equal(support.wealthEntityId, 'wealth')
  assert.equal(support.burdenPath.affectedEntityId, 'resource')
  const links = new Map(row('M6B').baseline.stemFacts.map(item => [item.id, item]))
  const supportingRelation = links.get(support.burdenPath.supportingRelationId)
  assert.equal(supportingRelation.source.id, 'resource')
  assert.equal(supportingRelation.target.id, 'hurt')
  assert(support.sourceRelationIds.includes(supportingRelation.id))
  assert(row('M6B').chapter.paragraphs.some(p => p.plan.sourceMappingIds.includes('CL-M06B')))
  assert.equal(row('M6A').facts.find(f => f.semanticType === 'money_related_problem').burdenPath.kind, 'wealth_feeds_harmful_killing')
  for (const [id, expected] of [
    ['M1', 'partial'], ['M2', 'ready'], ['M3', 'ready'], ['M4', 'partial'], ['M5', 'partial'],
    ['M6A', 'ready'], ['M6B', 'ready'], ['M7', 'partial'], ['M8', 'ready'], ['NO_RULE', 'deferred'],
  ]) {
    const chapter = row(id).chapter
    assert.equal(chapter.semanticReadiness, expected, id)
    assert.equal(chapter.publicationReadiness, expected === 'deferred' ? 'deferred' : 'partial', id)
  }

  const { plan } = row('M5')
  const chapter = plan.chapters.find(chapter => chapter.chapterId === 'CR-07')
  const [combined] = chapter.paragraphPlans
  const invalid = renderCustomerReadingKo({ ...plan, chapters: [{ ...chapter,
    paragraphPlans: [{ ...combined, slots: [...combined.slots, 'loss', 'division', 'competition', 'cost'] }],
  }] })[0]
  assert.equal(invalid.quality.unsupportedMoneySubdivisionCount, 1)
  assert.equal(invalid.qualityStatus, 'FAIL')
  assert.equal(invalid.paragraphs.length, 0)

  const m1 = row('M1')
  assert.equal(m1.chapter.quality.contrastCount, 0)
  for (const id of ['M2', 'M8']) {
    const coverage = row(id).chapter.quality.moneyExplanationCoverage
    assert(coverage.earningRetentionContrast && coverage.retentionAccumulationContrast, id)
  }
  assert(row('M4').chapter.quality.moneyExplanationCoverage.damageProtectionContrast)
  assert.equal(row('M3').chapter.quality.contrastCount, 1)
  assert.equal(row('M7').chapter.quality.contrastCount, 0)
  const burden = id => row(id).chapter.paragraphs.find(p => p.plan.moneyAxes.includes('burden')).text
  assert.notEqual(burden('M6A'), burden('M6B'))
  assert.match(burden('M6A'), /기존 부담/u)
  assert.match(burden('M6B'), /조절하는 데 필요한 기반/u)
  assert(!row('M2').chapter.quality.moneyExplanationCoverage.outflowExplained)
  assert(row('M8').chapter.quality.moneyExplanationCoverage.outflowExplained)
  const moneyPlan = m1.plan.chapters.find(ch => ch.chapterId === 'CR-07')
  const [earningPlan] = moneyPlan.paragraphPlans
  const [earningUnit] = earningPlan.semanticUnitIds
  const falseContrast = { kind: 'earning_retention', semanticUnitIds: [earningUnit, 'absent-retention'] }
  const rejected = renderCustomerReadingKo({ ...m1.plan,
    chapters: [{ ...moneyPlan, paragraphPlans: [{ ...earningPlan, moneyContrasts: [falseContrast] }] }],
  })[0]
  assert.equal(rejected.quality.unsupportedContrastCount, 1)
  assert.equal(rejected.quality.contrastCount, 0)
  assert.equal(rejected.qualityStatus, 'FAIL')
  assert.equal(rejected.paragraphs[0].text, m1.chapter.paragraphs[0].text)

  const readyPlan = row('M2').plan
  const retentionChapter = readyPlan.chapters.find(ch => ch.chapterId === 'CR-07')
  const contrast = retentionChapter.paragraphPlans.flatMap(p => p.moneyContrasts ?? [])
    .find(item => item.kind === 'earning_retention')
  const wrongTarget = renderCustomerReadingKo({ ...readyPlan, chapters: [retentionChapter],
    semanticUnits: readyPlan.semanticUnits.map(unit => unit.id === contrast.semanticUnitIds[0]
      ? { ...unit, moneyTargetId: 'different-wealth' } : unit),
  })[0]
  assert.equal(wrongTarget.quality.unsupportedContrastCount, 1)

  console.log(JSON.stringify([...results.values()].map(({ id, facts, chapter }) => ({ id,
    facts: facts.map(({ result, scope, direction, burdenPath }) => ({ result, scope, direction, burdenPath })), chapter,
  })), null, 2))
} finally {
  await server.close()
}
