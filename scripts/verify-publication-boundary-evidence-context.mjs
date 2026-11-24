import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/${path}.ts`)
try {
  const [{ runInternalReading }, { birthReadingContext }, reading, { buildCustomerReadingPlan },
    { evaluateOutcomePublicationEligibility }, { renderCustomerReadingKo }] = await Promise.all([
    load('lib/judgment/pipeline/internalReading'), load('lib/product/readBirthChart'), load('lib/reading/index'),
    load('lib/reading/customer/buildCustomerReadingPlan'), load('lib/reading/publicationEligibility'),
    load('lib/reading/customer/renderCustomerReadingKo'),
  ])
  const birth = read('scripts/fixtures/byeong-judgment-inputs.json')['CS-126']
  const referenceTime = '2027-07-15T00:00:00.000Z'
  const context = birthReadingContext(referenceTime)
  const judgment = runInternalReading({ ...context, birth: { date: birth.date,
    time: { known: true, value: birth.time }, gender: birth.gender ?? '女性', timeCorrectionMode: 'none' },
    executionId: 'publication-boundary:CS-126' })
  const produced = reading.moneyOutcomeFromReading({ judgment })
  const acquisition = produced.find(item => item.semanticType === 'money_acquisition'
    && item.lifecycle === 'active' && item.currentlyEffective && item.certainty === 'confirmed')
  const retention = produced.find(item => item.semanticType === 'money_retention'
    && item.lifecycle === 'deferred' && item.currentlyEffective === false)
  assert(acquisition, 'CS-126 confirmed/effective acquisition fixture is required')
  assert(retention, 'CS-126 deferred retention fixture is required')
  const base = { canonical: judgment.canonical, judgment, productScope: 'premium', referenceTime }
  const makePlan = (outcome, publicationConditions = {}) => {
    const moneyOutcomes = [outcome]
    const assembly = reading.assembleReading({ ...base, moneyOutcomes, publicationConditions })
    const plan = buildCustomerReadingPlan({ assembly, moneyOutcomes })
    return { assembly, plan, unit: plan.semanticUnits.find(item => item.meaningRef.recordId === outcome.id) }
  }
  const clone = (fact, id, fields) => ({ ...fact, id: `${fact.id}:${id}`, ...fields })
  const cases = []

  // P-01: confirmed and effective.
  const p01 = makePlan(acquisition)
  assert(p01.unit, 'P-01 must publish a CustomerSemanticUnit')
  assert.equal(p01.unit.publicationQualification?.kind, 'confirmed')
  cases.push({ id: 'P-01', publishable: true })

  // P-02: actual chart deferred Outcome with resolved competing causes.
  const p02 = makePlan(retention)
  assert.equal(p02.unit, undefined, 'P-02 must not publish a semantic unit')
  const p02Evidence = p02.plan.evidenceContext.outcomes.find(item => item.outcomeFactId === retention.id)
  assert(p02Evidence, 'P-02 must remain in internal evidence context')
  assert.equal(p02Evidence.lifecycle, 'deferred')
  assert(p02Evidence.explanationUnitIds.length)
  const p02Explanation = p02.plan.evidenceContext.explanationUnits.find(item => item.outcomeFactId === retention.id)
  assert(p02Explanation && p02Explanation.competingCauseRefs.length >= 1)
  assert.equal(p02Explanation.unresolvedCauseRefs.length, 0)
  assert(!p02.plan.chapters.flatMap(chapter => chapter.paragraphPlans)
    .some(paragraph => paragraph.sourceOutcomeIds.includes(retention.id)), 'P-02 must not reach a paragraph')
  const p02Rendered = renderCustomerReadingKo(p02.plan)
  assert(!p02Rendered.flatMap(chapter => chapter.paragraphs)
    .some(paragraph => paragraph.plan.sourceOutcomeIds.includes(retention.id)),
  'Renderer must not publish evidence-context-only Outcomes')
  cases.push({ id: 'P-02', publishable: false, preserved: true,
    competingCauseRefs: p02Explanation.competingCauseRefs.length })

  // P-03: inactive and ineffective.
  const inactive = clone(acquisition, 'P-03', { lifecycle: 'inactive', currentlyEffective: false })
  const p03 = makePlan(inactive)
  assert.equal(p03.unit, undefined)
  assert(p03.plan.evidenceContext.inactiveOutcomeIds.includes(inactive.id))
  const p03Evidence = p03.plan.evidenceContext.outcomes.find(item => item.outcomeFactId === inactive.id)
  assert(p03Evidence?.explanationUnitIds.length)
  assert(p03.plan.evidenceContext.explanationUnits.some(item => item.outcomeFactId === inactive.id))
  cases.push({ id: 'P-03', publishable: false, preserved: true })

  // P-04: reduced but still effective; the qualification remains on the published unit.
  const reduced = clone(acquisition, 'P-04', { lifecycle: 'reduced', certainty: 'contextual', currentlyEffective: true })
  const p04 = makePlan(reduced)
  assert(p04.unit)
  assert.equal(p04.unit.lifecycle, 'reduced')
  assert.equal(p04.unit.publicationQualification?.kind, 'reduced')
  cases.push({ id: 'P-04', publishable: true, qualification: p04.unit.publicationQualification })

  // P-05: conditional publication requires explicit confirmed trigger evidence.
  const conditional = clone(acquisition, 'P-05', { certainty: 'conditional' })
  const condition = { triggerConfirmed: true, evidenceIds: ['fixture:P-05:confirmed-trigger'] }
  const p05 = makePlan(conditional, { [conditional.id]: condition })
  assert(p05.unit)
  assert.equal(p05.unit.publicationQualification?.kind, 'conditional')
  assert.deepEqual(p05.unit.publicationQualification?.evidenceIds, condition.evidenceIds)
  cases.push({ id: 'P-05', publishable: true, qualification: p05.unit.publicationQualification })

  // P-06: conditional with no trigger evidence remains internal.
  const conditionalMissing = clone(acquisition, 'P-06', { certainty: 'conditional' })
  const p06 = makePlan(conditionalMissing)
  assert.equal(p06.unit, undefined)
  const p06Evidence = p06.plan.evidenceContext.outcomes.find(item => item.outcomeFactId === conditionalMissing.id)
  assert.equal(p06Evidence?.publicationReason, 'conditional_trigger_missing')
  assert(p06.plan.evidenceContext.gaps.some(gap => gap.classification === 'PUBLICATION_INELIGIBLE'
    && gap.outcomeIds.includes(conditionalMissing.id)))
  cases.push({ id: 'P-06', publishable: false, reason: p06Evidence.publicationReason })

  // Shared eligibility classifications and effective-state safety.
  assert.equal(evaluateOutcomePublicationEligibility({ ...acquisition, temporalStatus: 'expired' }).reason, 'expired_history')
  assert.equal(evaluateOutcomePublicationEligibility({ ...acquisition, lifecycle: 'stopped' }).reason, 'stopped')
  assert.equal(evaluateOutcomePublicationEligibility({ ...acquisition, currentlyEffective: false }).reason, 'currently_ineffective')

  // Order invariance for semantic IDs, evidence context, explanations, and gap classes.
  const combined = [acquisition, retention, inactive, reduced, conditional, conditionalMissing]
  const conditions = { [conditional.id]: condition }
  const assemble = moneyOutcomes => reading.assembleReading({ ...base, moneyOutcomes, publicationConditions: conditions })
  const planFor = assembly => buildCustomerReadingPlan({ assembly, moneyOutcomes: combined })
  const orderedAssembly = assemble(combined)
  const reversedAssembly = assemble([...combined].reverse())
  const orderedPlan = planFor(orderedAssembly)
  const reversedPlan = planFor(reversedAssembly)
  assert.deepEqual(orderedPlan.semanticUnits.map(item => item.id), reversedPlan.semanticUnits.map(item => item.id))
  assert.deepEqual(orderedPlan.evidenceContext, reversedPlan.evidenceContext)
  assert.deepEqual(orderedPlan.structuralExplanationUnits.map(item => item.id),
    reversedPlan.structuralExplanationUnits.map(item => item.id))
  assert.deepEqual(orderedPlan.evidenceContext.gaps.map(item => [item.id, item.classification]),
    reversedPlan.evidenceContext.gaps.map(item => [item.id, item.classification]))

  console.log(JSON.stringify({ fixture: 'CS-126', cases, determinism: 'PASS',
    evidenceContextOutcomeCount: p02.plan.evidenceContext.outcomes.length,
    p02ExplanationIds: p02Evidence.explanationUnitIds,
    p02CauseRefs: { primary: p02Explanation.primaryCauseRefs, competing: p02Explanation.competingCauseRefs,
      protection: p02Explanation.functionalChanges.flatMap(change => change.protectionRefs),
      damage: p02Explanation.functionalChanges.flatMap(change => change.damageRefs) } }, null, 2))
} finally { await server.close() }
