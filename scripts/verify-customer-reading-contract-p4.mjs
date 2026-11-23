import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze } from './fixtures/personality-renderer.mjs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const births = JSON.parse(read('scripts/fixtures/byeong-judgment-inputs.json'))
const authority = revision => read(`src/docs/source/authority/${revision}.md`)
const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0
const exact = instant => ({ kind: 'exact', instant })

// Candidate paths are invented test records, isolated from the production input.
const studyMappings = [
  ['CL-S01', 'peer_competition_harms_study', 'peer_attention_fragmentation', '07:L134–135'],
  ['CL-S02', 'needed_resource_damaged', 'learning_accumulation_interrupted', '07:L574–577,619–623'],
  ['CL-S03', 'expression_conflicts_with_formal_study', 'independent_method_friction', '07:L892–895,1013–1024'],
  ['CL-S04', 'wealth_damages_needed_resource', 'immediate_results_displace_learning', '07:L610–624'],
]

function studyPrototype(assertion, paths, context) {
  const matches = studyMappings.flatMap(([id, type, mechanism, source]) =>
    paths.filter(path => context.lifeStage === 'student' && assertion.domain === 'work'
      && assertion.semanticType === 'study_difficulty' && path.type === type
      && path.scopeId === assertion.scopeId && path.targetId === assertion.targetId
      && assertion.pathIds.includes(path.id) && path.state === 'operating' && path.direction === 'harmful')
      .map(path => ({ id, mechanism, source, pathId: path.id, originId: path.originId })))
  const mappings = matches.filter(match => match.id !== 'CL-S02'
    || !matches.some(other => other.id === 'CL-S04' && other.originId === match.originId))
    .sort((a, b) => compare(a.id, b.id) || compare(a.pathId, b.pathId))
  return {
    assertion: assertion.semanticType,
    certainty: assertion.certainty,
    sourceOutcomeIds: [assertion.id],
    scope: assertion.scope,
    scopeId: assertion.scopeId,
    causeAvailable: paths.some(path => assertion.pathIds.includes(path.id) && path.scopeId === assertion.scopeId
      && path.targetId === assertion.targetId && path.state === 'operating' && path.direction === 'harmful'),
    lifeMappingAvailable: mappings.length > 0,
    reasonStatus: mappings.length ? 'complete' : 'partial',
    paragraphs: ['conclusion', ...mappings.flatMap(() => ['cause', 'life_expression'])],
    mappings,
    customerRenderable: false,
  }
}

try {
  const { runInternalReading } = await load('judgment/pipeline/internalReading')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { buildNatalPersonality, applyStructuralRoleModifiers } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { assembleReading, validateReadingAssembly, moneyOutcomeFromReading } = await load('reading/index')
  const sources = { A: authority('A_rev179'), draftA: authority('A_rev180'), C: authority('C_rev215'),
    D: authority('D_rev152'), approval: authority('25-7_rev16') }
  const cases = [
    ['CS-127', 'CR-06', { lifeStage: 'student' }, '2027-01-15T00:00:00.000Z'],
    ['CS-005', 'CR-01', { careerStatus: 'employed' }, '2027-01-15T00:00:00.000Z'],
    ['CS-126', 'CR-07', { careerStatus: 'business' }, '2027-07-15T00:00:00.000Z'],
  ]
  const outputs = cases.map(([caseId, chapterId, knownFacts, referenceTime]) => {
    const birth = births[caseId]
    const judgment = freeze(runInternalReading({
      birth: { date: birth.date, time: { known: true, value: birth.time }, gender: '女性', timeCorrectionMode: 'none' },
      calculation: { referenceTime, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: Number(referenceTime.slice(0, 4)) },
      executionId: `p4-content-${caseId}`,
      natalInspectionPeriod: { periodId: 'natal-inspection', from: exact(referenceTime),
        to: exact(new Date(Date.parse(referenceTime) + 86_400_000).toISOString()) },
      sources,
    }))
    const personality = freeze(applyStructuralRoleModifiers(buildNatalPersonality(judgment.canonical.chart),
      projectNatalStructuralReading(judgment.judgmentCore[0])))
    const moneyOutcomes = freeze(moneyOutcomeFromReading({ judgment }))
    const input = freeze({ judgment, personality, moneyOutcomes, customerContext: { knownFacts }, productScope: 'premium' })
    const assembly = assembleReading(input)
    validateReadingAssembly(assembly)
    assert.deepEqual(assembly, assembleReading(input))
    assert.deepEqual(assembly, assembleReading({ ...input, moneyOutcomes: [...moneyOutcomes].reverse() }))
    const select = (slot, unit, mapping, mechanism, purpose) => ({
      slot, purpose, unitId: unit.id, scope: unit.scope, certainty: unit.certainty,
      periodRef: unit.period?.periodId, sourceFactIds: unit.sourceFactIds, evidenceIds: unit.evidenceIds,
      sourcePersonalityFactIds: unit.sourcePersonalityFactIds,
      sourceOutcomeIds: unit.meaningRef.kind === 'outcome_fact' ? [unit.meaningRef.recordId] : [],
      mapping, mechanism,
    })
    const slots = []
    if (chapterId === 'CR-06') {
      assert(assembly.chapters.find(chapter => chapter.id === 'CH-04').gaps
        .some(gap => gap.type === 'outcome_layer_not_implemented'))
      const workFacts = personality.facts.filter(fact => fact.status !== 'deferred' && fact.traitType === 'work')
        .sort((a, b) => compare(a.id, b.id))
      const unit = workFacts.map(fact => assembly.semanticUnits.find(unit =>
        unit.meaningRef.kind === 'personality_fact' && unit.meaningRef.recordId === fact.id)).find(Boolean)
      assert(unit, caseId)
      slots.push(select('work_approach', unit, 'CL-P01', knownFacts.lifeStage ? 'learning_style' : 'work_style', 'conclusion'))
    } else if (chapterId === 'CR-01') {
      for (const [slot, traitType] of [['core_nature', 'core'], ['internal_decision_style', 'decision']]) {
        const ids = new Set(personality.facts.filter(fact => fact.traitType === traitType && fact.status !== 'deferred')
          .map(fact => fact.id))
        const unit = assembly.semanticUnits.filter(unit => unit.meaningRef.kind === 'personality_fact'
          && ids.has(unit.meaningRef.recordId)).sort((a, b) => compare(a.id, b.id))[0]
        assert(unit, slot)
        slots.push(select(slot, unit, 'CL-P01', traitType, 'conclusion'))
      }
    } else {
      const use = new Map([
        ['harder_to_retain', 'CL-M03'],
        ['harder_to_sustain_accumulation', 'CL-M03'],
        ['skill_and_output', 'CL-M01'],
        ['ingenuity_and_expression', 'CL-M02'],
        ['wealth_can_be_divided_or_flow_out', 'CL-M04'],
        ['retention_supported_by_protection', 'CL-M05'],
      ])
      for (const fact of moneyOutcomes.filter(fact => fact.scope === 'natal')) {
        const unit = assembly.semanticUnits.find(unit => unit.meaningRef.recordId === fact.id)
        const earningPath = fact.provenance.includes('07:L1256') ? 'CL-M01'
          : fact.provenance.includes('07:L764,L984') ? 'CL-M02' : undefined
        const mapping = fact.result === 'can_earn' ? earningPath : use.get(fact.result)
        if (unit && mapping && (mapping !== 'CL-M03' || fact.provenance.includes('OUT-MONEY-02')
          && fact.provenance.some(ref => ref.startsWith('07:L140-L144,L1117')))) {
          slots.push(select(fact.semanticType, unit, mapping, fact.result, 'cause'))
        }
      }
      assert(slots.some(slot => slot.slot === 'money_acquisition' && slot.mapping === 'CL-M01'), caseId)
      assert(slots.some(slot => slot.slot === 'money_generation_method' && slot.mapping === 'CL-M01'), caseId)
      assert(!slots.some(slot => slot.slot === 'money_retention'), caseId)
      slots.sort((a, b) => compare(a.slot, b.slot) || compare(a.unitId, b.unitId))
    }
    return { caseId, context: knownFacts, chapterId, referenceTime, readiness: 'PARTIAL', customerRenderable: false, slots,
      gaps: chapterId === 'CR-06' ? ['ENGINE_GAP:work_study_outcome', 'SOURCE_GAP:work_study_domain_mapping']
        : chapterId === 'CR-01' ? ['GAP:complete_personality_axes'] : ['GAP:complete_money_axes_and_timing'] }
  })
  assert.notDeepEqual(outputs[0].slots[0].sourcePersonalityFactIds, outputs[1].slots[0].sourcePersonalityFactIds)
  const assertion = { id: 'test:study-difficulty', domain: 'work', semanticType: 'study_difficulty',
    certainty: 'confirmed', scope: 'natal', scopeId: 'test:natal', targetId: 'learning',
    pathIds: studyMappings.map(([id]) => `test:${id}`) }
  const paths = studyMappings.map(([id, type]) => ({ id: `test:${id}`, originId: id,
    type, state: 'operating', direction: 'harmful', scopeId: assertion.scopeId, targetId: assertion.targetId }))
  const context = outputs[0].context
  const variants = paths.map(path => studyPrototype(assertion, [path], context))
  assert(variants.every(result => result.reasonStatus === 'complete'))
  assert.equal(new Set(variants.flatMap(result => result.mappings.map(mapping => mapping.mechanism))).size, 4)
  const combined = studyPrototype(assertion, paths, context)
  assert.deepEqual(combined, studyPrototype(assertion, [...paths].reverse(), context))
  for (const change of [{ state: 'stopped' }, { state: 'expired' }, { direction: 'supportive' },
    { scopeId: 'other' }, { targetId: 'other' }, { id: 'unlinked' }]) {
    assert.equal(studyPrototype(assertion, [{ ...paths[0], ...change }], context).reasonStatus, 'partial')
  }
  assert.equal(studyPrototype(assertion, paths, { careerStatus: 'employed' }).lifeMappingAvailable, false)
  const unapproved = studyPrototype(assertion, [{ ...paths[0], type: 'unknown_path' }], context)
  assert.equal(unapproved.causeAvailable, true)
  assert.equal(unapproved.lifeMappingAvailable, false)
  assert.equal(unapproved.reasonStatus, 'partial')
  assert.equal(studyPrototype(assertion, [{ ...paths[1], originId: paths[3].originId }, paths[3]], context)
    .mappings[0].id, 'CL-S04')
  console.log(JSON.stringify({ result: 'PASS', chapters: outputs, unpublishedStudyVariants: variants,
    missingReason: studyPrototype(assertion, [], context) }, null, 2))
} finally {
  await server.close()
}
