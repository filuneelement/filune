import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const now = '2027-01-15T00:00:00.000Z'
const boundary = '2030-01-01T00:00:00.000Z'
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: `${id}-branch`, value: branch } })
const period = (periodId, start, end) => ({
  periodId, from: { kind: 'exact', instant: start }, to: { kind: 'exact', instant: end },
})
const decade = (id, stem, branch, start = '2020-01-01T00:00:00.000Z', end = boundary) => ({
  scope: 'greatLuck', pillar: pillar(id, stem, branch), validity: period(id, start, end),
})
const day = pillar('dm', '甲', '寅')
const wealth = pillar('wealth', '戊', '辰')
const guarded = { day, month: pillar('peer', '甲', '寅'), year: wealth, time: pillar('guard', '辛', '酉') }
const wealthPattern = { day, month: wealth, year: pillar('food', '丙', '巳'), time: pillar('killing', '庚', '申') }

try {
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { buildMoneyOutcome } = await load('outcome/index')
  const { assembleReading } = await load('reading/index')
  const { buildCustomerReadingPlan } = await load('reading/customer/buildCustomerReadingPlan')
  const { readBirthChart } = await load('product/readBirthChart')
  const { renderCustomerReadingKo } = await load('reading/customer/renderCustomerReadingKo')

  function evaluate(natal, luck, referenceTime, policy = {}) {
    return runJudgmentCore({ executionId: 'p4g', natal, luck, referenceTime, natalCombinations: [],
      natalValidity: period('inspection', '2027-01-01T00:00:00.000Z', '2040-01-01T00:00:00.000Z'), ...policy })
  }

  function project(id, natal, scopes, options = {}) {
    const [baseline, ...active] = evaluate(natal, scopes, now, options.policy)
    const independentlyEvaluated = options.next
      ? evaluate(natal, [options.next], boundary, options.policy).slice(1).map(snapshot => ({ snapshot, evaluatedAt: boundary }))
      : []
    const evaluatedLuckScopes = [...active.map(snapshot => ({ snapshot, evaluatedAt: now })), ...independentlyEvaluated]
    const moneyOutcomes = buildMoneyOutcome({ natal: baseline, referenceTime: now, luck: evaluatedLuckScopes })
    const create = (outcomes, evaluated) => assembleReading({ productScope: 'premium', referenceTime: now,
      ...(options.noBaseline ? {} : { luckScopes: [baseline], evaluatedLuckScopes: evaluated }), moneyOutcomes: outcomes })
    const assembly = create(moneyOutcomes, evaluatedLuckScopes)
    const plan = buildCustomerReadingPlan({ assembly })
    assert.deepEqual(buildCustomerReadingPlan({ assembly: create([...moneyOutcomes].reverse(), [...evaluatedLuckScopes].reverse()) }), plan, id)
    const rendered = renderCustomerReadingKo(plan).filter(chapter => ['CR-04', 'CR-08', 'CR-09'].includes(chapter.chapterId))
    for (const row of rendered) {
      for (const key of ['unsupportedClaimCount', 'duplicateMeaningCount', 'unsupportedChangeCount', 'unsupportedTransitionCount',
        'unsupportedOpportunityCount', 'unsupportedCautionCount', 'crossChapterRoleCollisionCount', 'crossChapterDuplicateMeaningCount']) {
        assert.equal(row.quality[key], 0, `${id}/${row.chapterId}/${key}`)
      }
      assert.doesNotMatch(row.paragraphs.map(item => item.text).join(' '), /좋은 달|나쁜 달|투자하세요|계약하세요/u)
    }
    return { id, plan, rendered }
  }

  const protectedToDamage = project('protection-direction', guarded, [decade('stopper', '丙', '巳')])
  const newActivation = project('new-activation', guarded, [decade('incoming-output', '丁', '巳')])
  const major = project('major', guarded, [decade('protector', '丁', '巳')],
    { next: decade('stopper', '丙', '巳', boundary, '2040-01-01T00:00:00.000Z') })
  const noTransition = project('unchanged-pair', { day }, [decade('one', '乙', '卯')],
    { next: decade('two', '乙', '卯', boundary, '2040-01-01T00:00:00.000Z') })
  const reversedProtection = project('damage-to-protection', guarded, [decade('stopper', '丙', '巳')],
    { next: decade('protector', '丁', '巳', boundary, '2040-01-01T00:00:00.000Z') })
  const currentOnly = project('current-only', guarded, [decade('incoming-output', '丁', '巳')], { noBaseline: true })
  const empty = project('none', { day }, [])
  const capacity = { state: 'wealth_capacity_insufficient', evidenceIds: ['reviewed-wealth-bearing-capacity'] }
  const coexist = project('opportunity-and-caution', wealthPattern, [
    { ...decade('output', '丙', '巳'), capacityEvidence: capacity },
  ])
  const fixtures = JSON.parse(readFileSync(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))
  function canonical(id, at, extra = {}) {
    const fixture = fixtures[id]
    const assembly = readBirthChart({ date: fixture.date, time: { known: true, value: fixture.time },
      gender: fixture.gender ?? '女性', timeCorrectionMode: 'none' }, { referenceTime: at, productScope: 'premium', ...extra })
    const plan = buildCustomerReadingPlan({ assembly })
    return { id, plan, rendered: renderCustomerReadingKo(plan).filter(row => row.quality.supportedSemanticCount !== undefined) }
  }
  const nested = canonical('CS-126', '2027-07-15T00:00:00.000Z')
  const chapter = (row, id) => row.rendered.find(value => value.chapterId === id)
  assert.equal(chapter(protectedToDamage, 'CR-04').semanticReadiness, 'ready')
  assert(chapter(protectedToDamage, 'CR-04').paragraphs.some(({ plan }) => plan.slots.includes('protection_change')))
  assert(chapter(newActivation, 'CR-04').paragraphs.some(({ plan }) => plan.slots.includes('new_activation')))
  assert.equal(chapter(major, 'CR-08').quality.evaluatedPairCount, 1)
  const [majorChange] = chapter(major, 'CR-08').paragraphs
  const { contribution } = majorChange.plan.expression
  assert.equal(contribution.significance, 'major')
  assert.equal(contribution.boundary, boundary)
  assert.equal(contribution.evaluatedPair[0].interval[1], boundary)
  assert.equal(contribution.evaluatedPair[1].interval[0], boundary)
  assert.equal(contribution.before.direction, 'favorable')
  assert.equal(contribution.activations[0].direction, 'unfavorable')
  assert(chapter(reversedProtection, 'CR-08').paragraphs.some(({ plan }) => {
    const change = plan.expression.contribution
    return change.change === 'protection_change' && change.before.direction === 'unfavorable'
      && change.activations[0].direction === 'favorable'
  }))
  assert.equal(chapter(noTransition, 'CR-08').quality.transitionCount, 0)
  assert.equal(chapter(noTransition, 'CR-08').paragraphs.length, 0)
  assert.equal(chapter(currentOnly, 'CR-04').semanticReadiness, 'partial')
  assert.equal(chapter(newActivation, 'CR-08').quality.unknownSideCount, 1)
  assert.equal(chapter(empty, 'CR-09').semanticReadiness, 'deferred')
  assert(chapter(nested, 'CR-09').paragraphs.some(({ plan }) => {
    const scopes = plan.expression.contribution.activations.map(item => item.scope)
    return scopes.includes('sewoon') && scopes.includes('month')
  }))
  assert.equal(chapter(coexist, 'CR-09').semanticReadiness, 'ready')
  assert(chapter(coexist, 'CR-09').quality.opportunityCount > 0 && chapter(coexist, 'CR-09').quality.cautionCount > 0)
  assert(chapter(coexist, 'CR-09').timingCards.some(card => card.opportunity.length && card.caution.length))
  assert.equal(chapter(nested, 'CR-08').quality.evaluatedPairCount, 1)
  const report = [protectedToDamage, newActivation, major, reversedProtection, noTransition, currentOnly, empty, coexist, nested].map(({ id, rendered }) => ({
    id, chapters: rendered.map(({ chapterId, semanticReadiness, publicationReadiness, quality, gaps, paragraphs }) =>
      ({ chapterId, semanticReadiness, publicationReadiness, quality, gaps,
        text: paragraphs.map(({ text }) => text), contributions: paragraphs.map(({ plan }) => plan.expression.contribution) })),
  }))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await server.close()
}
