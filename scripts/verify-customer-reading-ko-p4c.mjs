import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/${path}.ts`)
const freeIds = ['CR-01', 'CR-02', 'CR-03']
const paidIds = ['CR-04', 'CR-05', 'CR-07', 'CR-08', 'CR-09']
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
  const personalityFixtures = await loadPersonalityRendererFixtures(path => load(`lib/${path}`))
  for (const [key, label, { natal }] of personalityFixtures.filter(([key]) => ['B', 'C', 'Q'].includes(key))) {
    cases.push({ id: `P3-${key}`, label, natal, at: sample.referenceTime, context: {}, scope: 'free' })
  }
  const observed = new Map()
  for (const fixture of cases) {
    const { id, at, context, scope } = fixture
    const contextAt = birthReadingContext(at)
    const judgment = scope === 'premium' ? runInternalReading({
      ...contextAt, birth: fixture.birth, executionId: `p4c-ko:${id}`,
    }) : undefined
    const calculated = judgment?.canonical ?? (fixture.birth && calculateCanonicalChart(fixture.birth, contextAt.calculation))
    const pillars = calculated ? ['year', 'month', 'day', 'time'].map(key => calculated.chart.pillars[key].value.ganZhi)
      : [fixture.natal.dayPillar, fixture.label]
    if (fixture.known) assert.deepEqual(pillars, canonical[fixture.known].pillars)
    // The free UI normally supplies Canonical Personality; paid fixture additionally uses evaluated role modifiers.
    const base = fixture.natal ?? buildNatalPersonality(calculated.chart)
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
        if (paragraph.expression.kind === 'temporal') {
          assert(paragraph.expression.contribution.activations.every(item => item.interval && item.periodRef))
          continue
        }
        if (paragraph.scope !== 'natal') {
          assert(paragraph.periodRef && paragraph.expression.startsAt && paragraph.expression.endsBefore)
          if (!paragraph.activations) {
            assert(paragraph.sourceOutcomeIds.every(id => outcomes.get(id).period.periodId === paragraph.periodRef))
          }
        }
        if (paragraph.activations) {
          assert.deepEqual(new Set(paragraph.activations.map(item => item.sourceOutcomeId)), new Set(paragraph.sourceOutcomeIds))
          for (const activation of paragraph.activations) {
            const fact = outcomes.get(activation.sourceOutcomeId)
            const unit = plan.semanticUnits.find(item => item.id === activation.semanticUnitId)
            assert.equal(fact.scope, activation.scope)
            assert.equal(fact.period?.periodId, activation.periodRef)
            assert.equal(unit.certainty, activation.certainty)
            assert.equal(unit.meaningRef.recordId, fact.id)
          }
        }
        if (chapter.chapterId === 'CR-05') {
          assert.equal(paragraph.layer === 'outcome', paragraph.sourceOutcomeIds.length > 0)
        }
      }
    }
    observed.set(id, { rendered, plan, pillars, input, natal, moneyOutcomes, relationshipOutcomes })
  }
  assert.equal(new Set([...observed.values()].map(value => value.pillars.join(''))).size, cases.length)
  for (const chapterId of ['CR-01', 'CR-02']) {
    const texts = [...observed.values()].map(item => textOf(item.rendered.find(chapter => chapter.chapterId === chapterId)).join('\n'))
    assert.equal(new Set(texts).size, cases.length, chapterId)
    for (let index = 0; index < 5; index++) {
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
  const { buildMoneyOutcome, buildRelationshipOutcome } = await load('lib/outcome/index')
  const pillar = (id, stem, branch) => ({ stem: { id, value: stem }, branch: { id: id + '-branch', value: branch } })
  const at = '2027-01-15T00:00:00.000Z'
  const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from },
    to: { kind: 'exact', instant: to } })
  const natalValidity = validity('p4i-inspection', at, '2027-02-01T00:00:00.000Z')
  const wealth = { day: pillar('dm', '甲', '寅'), month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
  const guarded = { day: wealth.day, month: pillar('peer', '甲', '寅'),
    year: wealth.month, time: pillar('guard', '辛', '酉') }
  const moneyCases = [
    { id: 'P4-I capacity', natal: wealth, options: { natalCapacityEvidence: {
      state: 'wealth_capacity_insufficient', evidenceIds: ['reviewed-wealth-bearing-capacity'],
    } }, expected: ['CL-M01', 'CL-M03'] },
    { id: 'P4-I protected → outflow', natal: guarded, options: { luck: [{
      scope: 'greatLuck', pillar: pillar('stopper', '丙', '巳'),
      validity: validity('great', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z'),
    }] }, expected: ['CL-M04', 'CL-M05'] },
    { id: 'P4-I protected + earning', natal: guarded, options: { luck: [{
      scope: 'greatLuck', pillar: pillar('additional-output', '丁', '巳'),
      validity: validity('great', '2020-01-01T00:00:00.000Z', '2030-01-01T00:00:00.000Z'),
    }] }, expected: ['CL-M02', 'CL-M05'] },
    { id: 'P4-I earning + burden', natal: { ...wealth, time: pillar('killing', '庚', '申') },
      options: { natalPolicyEvidence: [{ entityId: 'killing', condition: 'harmful_killing',
        evidenceIds: ['killing-harmful_killing'] }] }, expected: ['CL-M01', 'CL-M06'] },
  ].map(({ id, natal, options, expected }) => {
    const [baseline, ...scoped] = runJudgmentCore({ executionId: id, referenceTime: at, luck: [], natalCombinations: [],
      natal, natalValidity, ...options })
    const moneyOutcomes = buildMoneyOutcome({ natal: baseline, referenceTime: at,
      luck: scoped.map(snapshot => ({ snapshot, evaluatedAt: at })) })
    const assembly = assembleReading({ productScope: 'premium', referenceTime: at, moneyOutcomes })
    validateReadingAssembly(assembly)
    const chapter = renderCustomerReadingKo(buildCustomerReadingPlan({ assembly, moneyOutcomes }))
      .find(chapter => chapter.chapterId === 'CR-07')
    for (const path of expected) assert(chapter.paragraphs.some(p => p.plan.sourceMappingIds.includes(path)), `${id} ${path}`)
    assert.equal(chapter.quality.unsupportedClaimCount, 0, id)
    assert.equal(chapter.quality.duplicateMeaningCount, 0, id)
    return { id, chapter, results: [...new Set(moneyOutcomes.map(outcome => outcome.result))] }
  })
  const [{ chapter: mixed }] = moneyCases
  assert(mixed.paragraphs.some(p => p.plan.slots.includes('earning') && p.plan.sourceMappingIds.includes('CL-M01')))
  assert(mixed.paragraphs.some(p => p.plan.slots.includes('retention') && p.plan.sourceMappingIds.includes('CL-M03')))
  assert(mixed.paragraphs.some(p => p.plan.slots.includes('qualitative_sustainability')))
  const a = observed.get('A')
  const ui = synthesizeSingleResult(a.natal, undefined, sample.referenceTime, sample.context, 'ko', ko)
  assert.deepEqual(ui.free.map(chapter => chapter.paragraphs.map(item => item.text)), a.rendered.map(textOf))
  if (process.argv.includes('--baseline')) assert(a.rendered[2].gaps.some(gap => gap.type === 'PARTIAL_LOOP'))
  else assert.equal(a.rendered[2].title, '상황에 따라 달라지는 나의 반응')
  assert.doesNotMatch(textOf(a.rendered[2]).join(' '), /반복되기 쉽|반복합니다/u)
  const b = observed.get('B')
  // P4-E's standalone evaluated contact interval. Inspect the complete producer output.
  const contactNatal = Object.fromEntries(['year', 'month', 'day', 'time'].map(position => {
    const value = b.input.canonical.chart.pillars[position].value
    return [position, {
      stem: { id: 'entity:' + JSON.stringify([`/chart/pillars/${position}/value/ganZhi`, 'stem']), value: value.stem },
      branch: { id: 'entity:' + JSON.stringify([`/chart/pillars/${position}/value/ganZhi`, 'branch']), value: value.branch },
    }]
  }))
  const [contactBase, contactGreat] = runJudgmentCore({ executionId: 'p4e-great-fixture', referenceTime: at,
    natal: contactNatal, natalValidity, natalCombinations: [],
    luck: [{ scope: 'greatLuck', pillar: pillar('p4e-great', '辛', '丑'),
      validity: validity('p4e-great', '2026-01-01T00:00:00.000Z', '2036-01-01T00:00:00.000Z') }],
  })
  const contactCanonical = calculateCanonicalChart(birth('CS-005'), birthReadingContext(at).calculation)
  const relationshipOutcomes = buildRelationshipOutcome({ canonical: contactCanonical, natal: contactBase,
    luck: [{ snapshot: contactGreat, evaluatedAt: at }] })
  const contactAssembly = assembleReading({ productScope: 'premium', referenceTime: at,
    canonical: contactCanonical, personality: b.natal, relationshipOutcomes })
  const contactOnly = renderCustomerReadingKo(buildCustomerReadingPlan({
    assembly: contactAssembly, natal: b.natal, relationshipOutcomes,
  }), b.natal).find(chapter => chapter.chapterId === 'CR-05')
  assert(contactOnly.paragraphs.some(p => p.plan.slots.includes('contact_or_change')),
    JSON.stringify(relationshipOutcomes.map(fact => [fact.semanticType, fact.scope, fact.temporalStatus])))
  assert(!contactOnly.paragraphs.some(p => p.plan.slots.includes('formation')))
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

  if (!process.argv.includes('--baseline')) {
    assert.equal(a.plan.version, 'p4g-1')
    assert.equal(a.rendered[0].qualityStatus, 'PASS')
    assert.equal(a.rendered[1].qualityStatus, 'PASS')
    assert.deepEqual(money.paragraphs[0].plan.activations.map(item => item.scope).filter((scope, index, all) =>
      all.indexOf(scope) === index), ['natal', 'sewoon', 'month'])
    assert.equal(money.quality.repeatedScopeMeaningCount, 2)
    assert.equal(money.quality.distinctSemanticCount, 6)
    assert.equal(rel.quality.repeatedScopeMeaningCount, 1)
    assert.equal(rel.paragraphs.filter(p => p.plan.slots.includes('formation')).length, 2)
    assert.equal(contactOnly.quality.unsupportedClaimCount, 0)
    const opposed = moneyCases.find(item => item.id === 'P4-I protected → outflow').chapter
    assert(opposed.paragraphs.some(p => p.plan.lifeMechanismIds.includes('wealth_protection') && p.plan.scope === 'natal'))
    assert(opposed.paragraphs.some(p => p.plan.lifeMechanismIds.includes('wealth_damage') && p.plan.scope === 'daewoon'))
    assert(rel.paragraphs.some(p => p.plan.expression.composite === 'relation_sequence'
      && p.plan.expression.traitFactIds.length === 3))
    assert(a.rendered[0].quality.compositeParagraphCount >= 1)
    for (const [id, value] of observed) {
      const chapter = value.plan.chapters.find(item => item.chapterId === 'CR-03')
      const rendered = value.rendered.find(item => item.chapterId === 'CR-03')
      for (const pattern of chapter.behaviorPatterns) {
        assert.equal(pattern.status === 'ready', Boolean(pattern.context.length && (pattern.response.length || pattern.judgment.length)
          && pattern.behavior.length), id)
        if (pattern.conflictId) {
          const conflict = value.natal.conflicts.find(item => item.id === pattern.conflictId)
          assert([...pattern.context, ...pattern.trigger, ...pattern.response, ...pattern.judgment, ...pattern.behavior, ...pattern.result]
            .every(id => conflict.factIds.includes(id)))
        }
      }
      const ready = chapter.behaviorPatterns.filter(pattern => pattern.status === 'ready').length
      assert.equal(rendered.quality.responsePatternCount, ready)
      assert.equal(rendered.semanticReadiness, ready >= 2 ? 'ready' : ready ? 'partial' : 'deferred')
      assert.equal(rendered.publicationReadiness, ready ? 'partial' : 'deferred')
      assert.equal(rendered.quality.densityGap, Boolean(ready))
      assert.equal(rendered.gaps.some(gap => gap.type === 'RENDERER_GAP' && gap.slot === 'density_target'), Boolean(ready))
      assert.doesNotMatch(textOf(rendered).join(' '), /늘 반복|계속 같은 선택|비슷한 일이 되풀이|항상 이런 결과/u)
      assert.equal(rendered.quality.unsupportedRecurrenceCount, 0)
    }
    assert.equal(observed.get('D').rendered.find(item => item.chapterId === 'CR-03').quality.resultSupportedCount, 1)
    assert.equal(observed.get('P3-C').rendered.find(item => item.chapterId === 'CR-03').quality.resultSupportedCount, 1)
    assert(a.plan.chapters.find(item => item.chapterId === 'CR-03').behaviorPatterns
      .some(pattern => pattern.mechanism === 'rechecking_after_completion'
        && pattern.judgment[0] !== pattern.behavior[0] && pattern.resultCoverage === 'gap'))
    assert.equal(rel.title, '관계에서 드러나는 나의 방식')
    assert.equal(rel.titleKey, 'relationship_style')
    assert.equal(a.rendered[2].titleKey, 'situational_responses')
    assert.equal(ui.free[2].semanticReadiness, 'ready')
    assert.equal(ui.free[2].publicationReadiness, 'partial')
    assert.deepEqual(ui.free[2], sample.free[2])
    for (const { rendered } of observed.values()) for (const chapter of rendered) {
      assert.equal(chapter.semanticReadiness, chapter.quality.semanticReadiness)
      assert.equal(chapter.publicationReadiness, chapter.quality.publicationReadiness)
      assert.equal(chapter.readiness, chapter.publicationReadiness)
    }
    assert.equal(rel.quality.personalityOutcomeCausalLeakCount, 0)
    assert.equal(rel.quality.relationshipSequenceCoverage, 'supported')
    assert.equal(rel.quality.relationshipRecurrenceCoverage, 'gap')
  }

  const results = [['A', freeIds], ['B', ['CR-05']], ['C', ['CR-07']]].flatMap(([id, ids]) =>
    observed.get(id).rendered.filter(chapter => ids.includes(chapter.chapterId)).map(chapter => ({ fixture: id, ...chapter })))
  if (process.argv.includes('--all-json')) console.log(JSON.stringify({
    ...(process.argv.includes('--ui') && { ui }),
    cases: [...observed].map(([id, value]) => ({
      id, pillars: value.pillars, chapters: value.rendered,
      conflicts: value.natal.conflicts.map(item => item.conflictType),
      relationship: [...new Set((value.relationshipOutcomes ?? []).map(item => item.semanticType))],
      money: [...new Set((value.moneyOutcomes ?? []).map(item => item.result))],
      loops: value.plan.chapters.find(chapter => chapter.chapterId === 'CR-03').behaviorPatterns,
      ...(process.argv.includes('--facts') && { facts: value.natal.facts.map(item => [item.traitType, item.trait, item.sourceType, item.status]) }),
    })), moneyCases, contactOnly,
  }, null, 2))
  else if (process.argv.includes('--json')) console.log(JSON.stringify(results, null, 2))
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
  } else console.log('PASS · eight charts, five chapters, loops, scope compression, provenance, determinism, KO UI and source gaps')
} finally {
  await server.close()
}
