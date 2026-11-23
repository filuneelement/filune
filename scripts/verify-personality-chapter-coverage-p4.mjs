import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const symbols = { covered: '✓', candidate: 'C', KNOWLEDGE_GAP: 'K', ADAPTER_GAP: 'D',
  ASSEMBLY_GAP: 'A', SOURCE_GAP: 'S', NOT_APPLICABLE: 'N' }

try {
  const { assembleReading, validateReadingAssembly } = await load('reading/index')
  const { customerContextFromSingleResult, selectCompetitionScenes } = await load('reading/customerContext')
  const fixtures = (await loadPersonalityRendererFixtures(load)).filter(([id]) => 'ABCDEFGHIOPQ'.includes(id))
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { buildNatalPersonality } = await load('personality/index')
  const readFixture = filename => JSON.parse(readFileSync(new URL(`./fixtures/${filename}.json`, import.meta.url)))
  const births = readFixture('byeong-judgment-inputs')
  const expected = readFixture('byeong-contract-inputs')
  for (const [id, { date, time }] of Object.entries(births)) {
    const calculated = calculateCanonicalChart({ date, time: { known: true, value: time },
      gender: '女性', timeCorrectionMode: 'none' }, {
      referenceTime: '2027-01-15T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027,
    })
    const pillars = ['year', 'month', 'day', 'time'].map(key => calculated.chart.pillars[key].value.ganZhi)
    assert.deepEqual(pillars, expected[id].pillars)
    fixtures.push([id, 'Canonical 출생 검증', { natal: buildNatalPersonality(calculated.chart) }])
  }
  assert.equal(fixtures.length, 15)
  const rows = fixtures.map(([id, label, { natal }]) => {
    const input = { personality: natal, productScope: 'free' }
    const assembly = assembleReading(input)
    validateReadingAssembly(assembly)
    const reordered = assembleReading({ ...input, personality: { ...natal,
      facts: [...natal.facts].reverse(), conflicts: [...natal.conflicts].reverse() } })
    const premium = assembleReading({ ...input, productScope: 'premium' })
    const projection = assembly.natalPersonalityChapters
    assert.deepEqual(projection, reordered.natalPersonalityChapters)
    assert.deepEqual(projection, premium.natalPersonalityChapters)
    const facts = new Map(natal.facts.map(fact => [fact.id, fact]))
    const provenance = new Map(natal.provenance.map(item => [item.id, item]))
    const beforeUnits = new Set(assembly.semanticUnits.filter(unit => unit.meaningRef.kind === 'personality_fact')
      .map(unit => unit.meaningRef.recordId))
    const uncoveredBefore = []
    for (const [chapterId, slots] of Object.entries(projection)) {
      for (const [name, slot] of Object.entries(slots)) {
        for (const factId of slot.sourcePersonalityFactIds) {
          const fact = facts.get(factId)
          assert(fact && fact.status !== 'deferred')
          assert(!natal.unavailablePositions.includes(fact.sourcePosition))
        }
        assert(slot.evidenceIds.every(item => provenance.get(item)?.sourceRefs.length))
        assert.equal(slot.sourcePersonalityFactIds.length > 0, ['covered', 'candidate'].includes(slot.status))
        if (slot.sourcePersonalityFactIds.length && (slot.sourceConflictIds.length
          || slot.sourcePersonalityFactIds.every(id => !beforeUnits.has(id)))) uncoveredBefore.push(`${chapterId}/${name}`)
      }
    }
    assert.equal(projection['CR-03'].repetitionMechanism.status, 'SOURCE_GAP')
    assert(projection['CR-01'].coreNature.sourcePersonalityFactIds.some(id => facts.get(id)?.sourceType === 'day_stem'))
    return { id, label, pillar: natal.dayPillar, projection, uncoveredBefore }
  })
  const byId = new Map(rows.map(row => [row.id, row]))
  assert.equal(byId.get('C').projection['CR-01'].internalContradiction.status, 'covered')
  assert(rows.some(row => row.projection['CR-01'].internalContradiction.status === 'NOT_APPLICABLE'))
  for (const [raw, canonical] of [['job-seeking', 'job_seeking'], ['job_seeking', 'job_seeking'],
    ['employed', 'employed'], ['business-owner', 'business'], ['business', 'business']]) {
    const context = customerContextFromSingleResult({ careerStatus: raw, relationshipStatus: 'dating' })
    const result = assembleReading({ productScope: 'premium', customerContext: context })
    assert.deepEqual(result.customerReadingContext, { careerStatus: canonical, relationshipStatus: 'dating' })
    assert.deepEqual(result.semanticUnits, assembleReading({ productScope: 'premium' }).semanticUnits)
  }
  for (const relationshipStatus of ['single', 'dating', 'married']) {
    assert.deepEqual(customerContextFromSingleResult({ relationshipStatus }).knownFacts, { relationshipStatus })
  }
  assert.deepEqual(customerContextFromSingleResult({ careerStatus: 'student', relationshipStatus: 'partnered' }).knownFacts, {})
  assert.deepEqual(customerContextFromSingleResult({ lifeStage: 'student' }).knownFacts, { lifeStage: 'student' })
  const scenes = ['friends', 'colleagues', 'performance_evaluation', 'revenue_sharing']
  assert.deepEqual(selectCompetitionScenes({ lifeStage: 'student', careerStatus: 'employed' }, 'study', scenes), ['friends'])
  assert.deepEqual(selectCompetitionScenes({ lifeStage: 'student', careerStatus: 'employed' }, 'work', scenes),
    ['colleagues', 'performance_evaluation'])
  assert.deepEqual(selectCompetitionScenes({ careerStatus: 'business' }, 'work', scenes), [])
  assert.deepEqual(selectCompetitionScenes({ careerStatus: 'business' }, 'money', scenes), ['revenue_sharing'])
  assert.deepEqual(selectCompetitionScenes({ careerStatus: 'job_seeking' }, 'work', scenes), [])
  assert.deepEqual(selectCompetitionScenes({}, 'study', scenes), [])

  for (const [chapter, example] of Object.entries(rows[0].projection)) {
    const names = Object.keys(example)
    const row = values => `| ${values.join(' | ')} |`
    console.log(`### ${chapter}\n`)
    console.log(row(['Fixture', ...names]))
    console.log(row(['---', ...names.map(() => '---')]))
    for (const item of rows) {
      console.log(row([`${item.id} ${item.pillar}`, ...names.map(name => symbols[item.projection[chapter][name].status])]))
    }
    console.log(row(['직접 / 후보', ...names.map(name => {
      const values = rows.map(item => item.projection[chapter][name].status)
      return `${values.filter(status => status === 'covered').length} / ${values.filter(status => status === 'candidate').length}`
    })]))
    console.log()
  }
  console.log('### 기존 무료 Assembly에서 슬롯 근거가 전부 빠졌거나 갈등 연결이 없던 경우\n')
  for (const item of rows) console.log(`- ${item.id} ${item.pillar} · ${item.uncoveredBefore.join(', ') || '없음'}`)
  console.log('\nPASS · 15 fixtures, provenance, product invariance, reordered inputs, context validation and target routing')
} finally {
  await server.close()
}
