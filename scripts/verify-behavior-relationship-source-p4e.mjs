import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = path => server.ssrLoadModule(`/src/lib/${path}.ts`)
const referenceTime = '2024-01-15T00:00:00.000Z'

try {
  const { DAY_PILLAR_PROFILES } = await load('personality/knowledge/dayPillarProfiles')
  const { buildNatalPersonality } = await load('personality/index')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { assembleReading, relationshipOutcomeFromReading } = await load('reading/index')
  const { buildCustomerReadingPlan } = await load('reading/customer/buildCustomerReadingPlan')
  const { renderCustomerReadingKo } = await load('reading/customer/renderCustomerReadingKo')
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { birthReadingContext } = await load('product/readBirthChart')

  function plan(natal, relationshipOutcomes, canonical) {
    const assembly = assembleReading({ personality: natal, relationshipOutcomes, canonical,
      productScope: 'premium', referenceTime })
    return buildCustomerReadingPlan({ assembly, natal, relationshipOutcomes })
  }
  const patterns = natal => plan(natal).chapters.find(chapter => chapter.chapterId === 'CR-03').behaviorPatterns
  const complete = patterns => patterns.filter(pattern => pattern.resultCoverage === 'supported')
  const render = (natal, outcomes, canonical) => renderCustomerReadingKo(plan(natal, outcomes, canonical), natal)
  const profiles = Object.keys(DAY_PILLAR_PROFILES).map(ganZhi => {
    const [stem, branch] = ganZhi
    const unknown = { status: 'unknown', uncertaintyIds: ['day-only-audit'] }
    const natal = buildNatalPersonality({
      pillars: { year: unknown, month: unknown, day: { status: 'confirmed', value: { stem, branch, ganZhi } }, time: unknown },
      basicRelations: { year: unknown, month: unknown, time: unknown, day: { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(stem, stem), relationships: calculateDayRelationships(stem, branch),
        twelveStage: calculateTwelveStage(stem, branch),
      } } },
    })
    const loops = patterns(natal)
    const chapter = render(natal).find(item => item.chapterId === 'CR-03')
    assert.equal(chapter.quality.unsupportedClaimCount, 0, ganZhi)
    return { ganZhi, loops: complete(loops).map(loop => loop.mechanism), recurrence: loops.filter(loop => loop.recurrence.length).length,
      fixture: { readiness: chapter.readiness, ...chapter.quality } }
  })
  assert.equal(profiles.length, 60)
  assert(profiles.some(profile => profile.loops.length === 1))
  assert(profiles.every(profile => profile.loops.length <= 1 && profile.recurrence === 0))

  const samples = new Map((await loadPersonalityRendererFixtures(load)).map(([id, , reading]) => [id, reading.natal]))
  const intent = samples.get('C')
  const [causal] = complete(patterns(intent))
  assert.equal(causal.mechanism, 'intent_reconsideration_delays_start')
  assert(causal.result.every(id => intent.conflicts.some(conflict => conflict.id === causal.conflictId && conflict.factIds.includes(id))))
  // Remove only the supported consequence. Both sides of the original tension remain.
  const noResult = { ...intent, facts: intent.facts.filter(fact => !causal.result.includes(fact.id)) }
  assert(causal.behavior.every(id => noResult.facts.some(fact => fact.id === id)))
  assert.equal(complete(patterns(noResult)).length, 0)
  assert(patterns(samples.get('B')).some(loop => loop.mechanism === 'expression_review_context_split' && loop.status === 'ready' && !loop.result.length))
  assert.equal(patterns(samples.get('Q')).length, 0)

  const guarded = samples.get('D')
  const protectedExpression = guarded.structuralRoleModifiers.filter(modifier => modifier.operation === 'protects_expression'
    && modifier.status === 'confirmed')
  assert(protectedExpression.length)
  // OFF-02 protects an evaluated structural expression. It supplies no observed
  // inhibition of the specific pushback behavior under the same trigger.
  assert(!patterns(guarded).some(loop => loop.recurrence.length))
  assert(!patterns(guarded).some(loop => loop.mechanism === 'friction_pushback' && loop.result.length))

  const { date, time } = JSON.parse(readFileSync(new URL('./fixtures/byeong-judgment-inputs.json', import.meta.url), 'utf8'))['CS-005']
  const judgment = runInternalReading({ ...birthReadingContext(referenceTime),
    birth: { date, time: { known: true, value: time }, gender: '女性', timeCorrectionMode: 'none' },
    executionId: 'p4e-source-audit:CS-005' })
  const canonical = judgment.canonical
  const natal = buildNatalPersonality(canonical.chart)
  const relationshipOutcomes = relationshipOutcomeFromReading({ judgment })
  const relationship = (personality, outcomes) => render(personality, outcomes, canonical)
    .find(chapter => chapter.chapterId === 'CR-05')
  const natalOnly = relationship(natal, [])
  const outcomeOnly = relationship(undefined, relationshipOutcomes)
  const combined = relationship(natal, relationshipOutcomes)
  const slots = new Set(natalOnly.paragraphs.flatMap(p => p.plan.slots))
  for (const slot of ['socialExpression', 'relationshipStyle', 'afterCloseness', 'communication', 'conflictMechanism']) {
    assert(slots.has(slot), slot)
  }
  assert(natalOnly.gaps.some(gap => gap.slot === 'beginnings'))
  assert(natalOnly.paragraphs.every(({ plan: p }) => p.layer === 'personality' && !p.sourceOutcomeIds.length))
  assert.equal(outcomeOnly.paragraphs.length, 0)
  assert.equal(outcomeOnly.sections.length, 1)
  const internalOutcome = outcomeOnly.sections[0]
  assert.equal(internalOutcome.visibility, 'internal')
  assert(internalOutcome.paragraphs.some(({ plan: p }) => p.slots.includes('formation')))
  assert(internalOutcome.paragraphs.every(({ plan: p }) => p.layer === 'outcome' && !p.sourcePersonalityFactIds.length))
  assert.equal(outcomeOnly.semanticReadiness, 'deferred')
  assert.equal(outcomeOnly.publicationReadiness, 'deferred')
  assert.equal(outcomeOnly.quality.relationshipTimingAvailability, 'available')
  assert.equal(natalOnly.sections.length, 1)
  assert.equal(natalOnly.quality.relationshipTimingAvailability, 'none')
  assert(!natalOnly.gaps.some(gap => gap.slot === 'outcome'))
  assert.equal(natalOnly.semanticReadiness, 'ready')
  assert.equal(natalOnly.publicationReadiness, 'partial')
  assert.equal(combined.semanticReadiness, 'ready')
  assert.equal(combined.publicationReadiness, 'partial')
  assert.equal(combined.quality.relationshipTimingAvailability, 'available')
  assert.equal(natalOnly.quality.relationshipAxisCount, combined.quality.relationshipAxisCount)
  for (const result of [natalOnly, outcomeOnly, combined]) assert.equal(result.title, '관계에서 드러나는 나의 방식')
  assert(outcomeOnly.gaps.some(gap => gap.slot === 'relationshipRecurrence'))
  assert.equal(combined.quality.relationshipSequenceCoverage, 'supported')
  const isolatedMappings = [
    ['CL-R04', '수평적인 대화와 동등한 대우를 중시함'],
    ['CL-R05', '교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음'],
  ].map(([mapping, trait]) => {
    const witness = relationship({ ...natal, facts: natal.facts.filter(fact => fact.trait === trait) }, [])
    assert(witness.paragraphs.some(({ plan }) => plan.sourceMappingIds.includes(mapping)))
    assert.equal(witness.quality.natalParagraphCount, 1)
    assert.equal(witness.quality.outcomeParagraphCount, 0)
    assert.equal(witness.semanticReadiness, 'partial')
    assert.equal(witness.quality.relationshipAxisCount, 1)
    assert.equal(witness.quality.relationshipSequenceCoverage, 'gap')
    return { mapping, paragraphs: witness.quality.natalParagraphCount }
  })
  assert(combined.paragraphs.some(p => p.plan.sourceMappingIds.includes('CL-R04') && p.plan.sourceMappingIds.includes('CL-R05')))
  for (const result of [natalOnly, outcomeOnly, combined]) {
    assert.equal(result.quality.personalityOutcomeCausalLeakCount, 0)
    assert.equal(result.quality.unsupportedClaimCount, 0)
    assert.equal(result.quality.duplicateMeaningCount, 0)
    assert.equal(result.quality.relationshipRecurrenceCoverage, 'gap')
  }
  for (const index of [0, 1]) {
    const isolated = index === 0 ? natalOnly : outcomeOnly
    assert.deepEqual(combined.sections[index].paragraphs.map(p => [p.text, p.plan.semanticUnitIds]),
      isolated.sections[0].paragraphs.map(p => [p.text, p.plan.semanticUnitIds]))
  }

  const withReasonGap = relationship(natal, relationshipOutcomes.map(fact =>
    fact.semanticType === 'relationship_formation' ? { ...fact, sourceRelationIds: [] } : fact))
  assert.equal(withReasonGap.semanticReadiness, 'ready')
  assert.equal(withReasonGap.quality.relationshipTimingAvailability, 'partial')
  assert.equal(withReasonGap.publicationReadiness, 'partial')

  const corrupt = plan(natal, relationshipOutcomes, canonical)
  const rel = corrupt.chapters.find(chapter => chapter.chapterId === 'CR-05')
  const mixed = { ...rel.paragraphPlans.find(p => p.layer === 'outcome'), sourcePersonalityFactIds: [natal.facts[0].id] }
  const falseRecurrence = { ...rel.paragraphPlans[0], slots: ['relationshipRecurrence'] }
  const rejected = renderCustomerReadingKo({ ...corrupt,
    chapters: [{ ...rel, paragraphPlans: [mixed, falseRecurrence] }],
  }, natal)[0]
  assert.equal(rejected.quality.personalityOutcomeCausalLeakCount, 1)
  assert.equal(rejected.quality.unsupportedRecurrenceCount, 1)
  assert.equal(rejected.paragraphs.length, 0)
  assert.equal(rejected.semanticReadiness, 'ready')
  assert.equal(rejected.publicationReadiness, 'partial')
  assert.equal(rejected.qualityStatus, 'FAIL')

  console.log(JSON.stringify({
    dayOnlyProfiles: profiles.length, complete: profiles.filter(profile => profile.loops.length),
    behavior: Object.fromEntries([
      ...profiles.filter(profile => ['甲子', '辛未', '丙申', '戊午'].includes(profile.ganZhi))
        .map(profile => [profile.ganZhi, profile.fixture]),
      ['P3-B', (() => {
        const chapter = render(samples.get('B')).find(chapter => chapter.chapterId === 'CR-03')
        return { readiness: chapter.readiness, ...chapter.quality }
      })()],
    ]),
    recurrenceSupported: profiles.filter(profile => profile.recurrence).length,
    contrast: { positive: causal.mechanism, noResult: 0, contextualConflict: 'ready_pattern', noRule: 0,
      protection: protectedExpression.map(modifier => modifier.operation) },
    relationship: { natalOnly: natalOnly.quality, outcomeOnly: outcomeOnly.quality, combined: combined.quality },
    internalOutcomeCharacters: internalOutcome.paragraphs.reduce((sum, p) => sum + [...p.text.normalize('NFC')].length, 0),
    isolatedMappings,
    rejected: { causalLeak: rejected.quality.personalityOutcomeCausalLeakCount,
      recurrence: rejected.quality.unsupportedRecurrenceCount },
  }, null, 2))
} finally {
  await server.close()
}
