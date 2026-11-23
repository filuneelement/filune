import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/${path}.ts`)
const freeIds = ['CR-01', 'CR-02', 'CR-03']
const paidIds = ['CR-05', 'CR-07']
const textOf = chapter => chapter.paragraphs.map(paragraph => paragraph.text)

try {
  const { calculateCanonicalChart } = await load('lib/canonical/calculateCanonicalChart')
  const { runInternalReading } = await load('lib/judgment/pipeline/internalReading')
  const { birthReadingContext } = await load('lib/product/readBirthChart')
  const { buildNatalPersonality, applyStructuralRoleModifiers } = await load('lib/personality/index')
  const { projectNatalStructuralReading } = await load('lib/personalityStructuralReading')
  const { assembleReading, validateReadingAssembly, moneyOutcomeFromReading, relationshipOutcomeFromReading } = await load('lib/reading/index')
  const { buildCustomerReadingPlan } = await load('lib/reading/customer/buildCustomerReadingPlan')
  const { renderCustomerReadingKo } = await load('lib/reading/customer/renderCustomerReadingKo')
  const { customerContextFromSingleResult } = await load('lib/reading/customerContext')
  const { synthesizeSingleResult } = await load('components/result/singleResultCopy')
  const { default: ko } = await load('i18n/ko')
  const sample = read('scripts/fixtures/single-result-synthesis-sample.json')
  const births = read('scripts/fixtures/byeong-judgment-inputs.json')
  const canonical = read('scripts/fixtures/byeong-contract-inputs.json')
  const birth = id => ({ date: births[id].date, time: { known: true, value: births[id].time },
    gender: births[id].gender ?? '女性', timeCorrectionMode: 'none' })
  const cases = [
    { id: 'A', birth: sample.birth, at: sample.referenceTime, context: sample.context, scope: 'free' },
    { id: 'B', known: 'CS-005', birth: birth('CS-005'), at: '2024-01-15T00:00:00.000Z',
      context: { relationshipStatus: 'dating' }, scope: 'premium' },
    { id: 'C', known: 'CS-126', birth: birth('CS-126'), at: '2027-07-15T00:00:00.000Z',
      context: { careerStatus: 'business' }, scope: 'premium' },
    { id: 'D', known: 'CS-127', birth: birth('CS-127'), at: '2027-01-15T00:00:00.000Z',
      context: { relationshipStatus: 'married' }, scope: 'free' },
    { id: 'E', birth: { date: { year: 1985, month: 1, day: 4 }, time: { known: true, value: { hour: 9, minute: 0 } },
      gender: '男性', timeCorrectionMode: 'none' }, at: '1999-09-15T00:00:00.000Z', context: {}, scope: 'premium' },
  ]
  const observed = new Map()
  for (const fixture of cases) {
    const { id, at, context, scope } = fixture
    const contextAt = birthReadingContext(at)
    const judgment = scope === 'premium' ? runInternalReading({
      ...contextAt, birth: fixture.birth, executionId: `p4c-ko:${id}`,
    }) : undefined
    const calculated = judgment?.canonical ?? calculateCanonicalChart(fixture.birth, contextAt.calculation)
    const pillars = ['year', 'month', 'day', 'time'].map(key => calculated.chart.pillars[key].value.ganZhi)
    if (fixture.known) assert.deepEqual(pillars, canonical[fixture.known].pillars)
    // The free UI normally supplies Canonical Personality; paid fixture additionally uses evaluated role modifiers.
    const base = buildNatalPersonality(calculated.chart)
    const natal = !judgment ? base : applyStructuralRoleModifiers(base, projectNatalStructuralReading(judgment.judgmentCore[0]))
    const moneyOutcomes = judgment ? moneyOutcomeFromReading({ judgment }) : undefined
    const relationshipOutcomes = judgment ? relationshipOutcomeFromReading({ judgment }) : undefined
    const input = { canonical: calculated, judgment, personality: natal, productScope: scope, moneyOutcomes, relationshipOutcomes,
      customerContext: customerContextFromSingleResult(context), referenceTime: at }
    const assembly = assembleReading(input)
    validateReadingAssembly(assembly)
    const plan = buildCustomerReadingPlan({ assembly, natal, moneyOutcomes, relationshipOutcomes })
    const rendered = renderCustomerReadingKo(plan, natal)
    assert.deepEqual(rendered.map(chapter => chapter.chapterId), scope === 'free' ? freeIds : [...freeIds, ...paidIds])
    assert.deepEqual(buildCustomerReadingPlan({ assembly, natal, moneyOutcomes, relationshipOutcomes }), plan)
    assert.deepEqual(renderCustomerReadingKo(plan, natal), rendered)
    const reverse = items => items && [...items].reverse()
    const permuted = buildCustomerReadingPlan({
      assembly: { ...assembly, semanticUnits: reverse(assembly.semanticUnits) },
      natal: { ...natal, facts: reverse(natal.facts) }, moneyOutcomes: reverse(moneyOutcomes),
      relationshipOutcomes: reverse(relationshipOutcomes),
    })
    assert.deepEqual(permuted, plan)
    const facts = new Map(natal.facts.map(fact => [fact.id, fact]))
    const outcomes = new Map([...(moneyOutcomes ?? []), ...(relationshipOutcomes ?? [])].map(fact => [fact.id, fact]))
    const unitIds = new Set(plan.semanticUnits.map(unit => unit.id))
    for (const chapter of rendered) {
      assert.equal(chapter.quality.unsupportedClaimCount, 0, `${id} ${chapter.chapterId}`)
      assert.equal(chapter.quality.duplicateMeaningCount, 0, `${id} ${chapter.chapterId}`)
      assert.doesNotMatch(textOf(chapter).join(' '), /향초|인테리어|커피|반드시|무조건|이별|제3자|질병|수술|손실액|돈이 들어옵니다/u)
      for (const { plan: paragraph } of chapter.paragraphs) {
        assert(paragraph.semanticUnitIds.length && paragraph.semanticUnitIds.every(id => unitIds.has(id)))
        assert(paragraph.sourcePersonalityFactIds.every(id => facts.has(id)))
        assert(paragraph.sourceOutcomeIds.every(id => outcomes.has(id)))
        assert.equal(paragraph.reasonStatus === 'complete', paragraph.causeAvailable && paragraph.lifeMappingAvailable)
        if (paragraph.scope !== 'natal') {
          assert(paragraph.periodRef && paragraph.expression.startsAt && paragraph.expression.endsBefore)
          assert(paragraph.sourceOutcomeIds.every(id => outcomes.get(id).period.periodId === paragraph.periodRef))
        }
        if (chapter.chapterId === 'CR-05') {
          assert.equal(paragraph.layer === 'outcome', paragraph.sourceOutcomeIds.length > 0)
        }
      }
    }
    observed.set(id, { rendered, plan, pillars, input, natal, moneyOutcomes, relationshipOutcomes })
  }
  assert.equal(new Set([...observed.values()].map(value => value.pillars.join(''))).size, 5)
  for (const chapterId of ['CR-01', 'CR-02']) {
    const texts = [...observed.values()].map(item => textOf(item.rendered.find(chapter => chapter.chapterId === chapterId)).join('\n'))
    assert.equal(new Set(texts).size, 5, chapterId)
    for (let index = 0; index < texts.length; index++) {
      const current = texts[index].split('\n')
      for (const earlier of texts.slice(0, index)) {
        const previous = new Set(earlier.split('\n'))
        const shared = current.filter(text => previous.has(text)).length
        assert(shared / Math.max(current.length, previous.size) <= 2 / 3, `${chapterId} ${index} ${shared}\n${current.join('\n')}\n---\n${[...previous].join('\n')}`)
      }
    }
  }
  // P4-I's verified mixed acquisition and capacity path, with the actual producer.
  const { runJudgmentCore } = await load('lib/judgment/core/luckScope')
  const { buildMoneyOutcome } = await load('lib/outcome/index')
  const pillar = (id, stem, branch) => ({ stem: { id, value: stem }, branch: { id: id + '-branch', value: branch } })
  const at = '2027-01-15T00:00:00.000Z'
  const [mixedNatal] = runJudgmentCore({ executionId: 'p4c-ko-mixed', referenceTime: at, luck: [], natalCombinations: [],
    natal: { day: pillar('dm', '甲', '寅'), month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') },
    natalValidity: { periodId: 'p4i-mixed', from: { kind: 'exact', instant: at },
      to: { kind: 'exact', instant: '2027-02-01T00:00:00.000Z' } },
    natalCapacityEvidence: { state: 'wealth_capacity_insufficient', evidenceIds: ['reviewed-wealth-bearing-capacity'] },
  })
  const mixedMoney = buildMoneyOutcome({ natal: mixedNatal, referenceTime: at, luck: [] })
  const mixedPlan = buildCustomerReadingPlan({
    assembly: assembleReading({ productScope: 'premium', referenceTime: at, moneyOutcomes: mixedMoney }),
    moneyOutcomes: mixedMoney,
  })
  const mixed = renderCustomerReadingKo(mixedPlan).find(chapter => chapter.chapterId === 'CR-07')
  assert(mixed.paragraphs.some(p => p.plan.slots.includes('earning') && p.plan.sourceMappingIds.includes('CL-M01')))
  assert(mixed.paragraphs.some(p => p.plan.slots.includes('retention') && p.plan.sourceMappingIds.includes('CL-M03')))
  assert(mixed.paragraphs.some(p => p.plan.slots.includes('sustainability')))
  assert.equal(mixed.quality.unsupportedClaimCount, 0)
  const a = observed.get('A')
  const ui = synthesizeSingleResult(a.natal, undefined, sample.referenceTime, sample.context, 'ko', ko)
  assert.deepEqual(ui.free.map(chapter => chapter.paragraphs.map(item => item.text)), a.rendered.map(textOf))
  assert(a.rendered[2].gaps.some(gap => gap.type === 'PARTIAL_LOOP'))
  assert.doesNotMatch(textOf(a.rendered[2]).join(' '), /반복되기 쉽|반복합니다/u)
  const b = observed.get('B')
  const rel = b.rendered.find(chapter => chapter.chapterId === 'CR-05')
  assert(rel.paragraphs.some(item => item.plan.layer === 'personality'))
  assert(rel.paragraphs.some(item => item.plan.sourceMappingIds.includes('CL-R01')))
  const changed = assembleReading({ ...b.input, customerContext: customerContextFromSingleResult({ relationshipStatus: 'married' }) })
  const alternate = renderCustomerReadingKo(buildCustomerReadingPlan({ ...b, assembly: changed }), b.natal)
    .find(chapter => chapter.chapterId === 'CR-05')
  assert.notDeepEqual(textOf(rel), textOf(alternate))
  assert.deepEqual(rel.paragraphs.map(p => p.plan.sourceOutcomeIds), alternate.paragraphs.map(p => p.plan.sourceOutcomeIds))
  const c = observed.get('C')
  const money = c.rendered.find(chapter => chapter.chapterId === 'CR-07')
  assert(money.paragraphs.some(p => p.plan.slots.includes('earning') && p.plan.slots.includes('earning_method')))
  assert(money.gaps.some(gap => gap.slot === 'retention'))
  const e = observed.get('E')
  const outflow = e.rendered.find(chapter => chapter.chapterId === 'CR-07')
  assert(outflow.paragraphs.some(p => p.plan.sourceMappingIds.includes('CL-M04')))
  assert(outflow.gaps.some(gap => gap.slot === 'loss') && outflow.gaps.some(gap => gap.slot === 'division'))

  // An accepted retention assertion with its mapping evidence withheld keeps the conclusion.
  const damaged = e.moneyOutcomes.find(fact => fact.result === 'harder_to_retain')
  assert(damaged)
  const limitedMoney = [{ ...damaged, provenance: [] }]
  const limited = buildCustomerReadingPlan({
    assembly: assembleReading({ ...e.input, moneyOutcomes: limitedMoney }),
    natal: e.natal, moneyOutcomes: limitedMoney,
  }).chapters.find(chapter => chapter.chapterId === 'CR-07')
  assert.equal(limited.paragraphPlans[0].reasonStatus, 'partial')
  assert.deepEqual(limited.paragraphPlans[0].sourceMappingIds, [])

  const results = [['A', freeIds], ['B', ['CR-05']], ['C', ['CR-07']]].flatMap(([id, ids]) =>
    observed.get(id).rendered.filter(chapter => ids.includes(chapter.chapterId)).map(chapter => ({ fixture: id, ...chapter })))
  if (process.argv.includes('--json')) console.log(JSON.stringify(results, null, 2))
  else if (process.argv.includes('--report')) {
    for (const chapter of results) {
      console.log(`## Fixture ${chapter.fixture} · ${chapter.chapterId} ${chapter.title}\n`)
      console.log(`${chapter.readiness.toUpperCase()} · ${chapter.quality.characterCount}자 · ${chapter.quality.paragraphCount}문단 · 의미 ${chapter.quality.distinctSemanticCount}개.\n`)
      console.log(textOf(chapter).join('\n\n') + '\n')
      if (!chapter.paragraphs.length) console.log('설명할 수 있는 근거가 아직 충분하지 않습니다.\n')
      for (const [index, { plan }] of chapter.paragraphs.entries()) {
        const sources = observed.get(chapter.fixture)
        const personality = plan.sourcePersonalityFactIds.map(id => sources.natal.facts.find(fact => fact.id === id)?.trait)
        const outcomes = plan.sourceOutcomeIds.map(id => [...(sources.moneyOutcomes ?? []), ...(sources.relationshipOutcomes ?? [])]
          .find(fact => fact.id === id)?.semanticType)
        console.log(`- P${index + 1} · ${[...personality, ...outcomes].join(' / ')} · ${plan.sourceMappingIds.join(', ')} · ${plan.lifeMechanismIds.join(', ')} · ${plan.scope} · ${plan.reasonStatus}`)
      }
      console.log()
    }
  } else console.log('PASS · five charts, five chapters, provenance, scope, determinism, KO UI, partial reason and context routing')
} finally {
  await server.close()
}
