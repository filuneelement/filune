import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
const check = (fn) => { fn(); checks++ }
try {
  const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const p = await load('judgment/producers/index')
  const c = await load('judgment/contracts/index')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { fromCanonical: oldProjection } = await load('judgment/facts/fromCanonical')
  const { HIDDEN_STEM_ROLE_TABLE: table } = await load('hiddenStemRoleTable')
  const { calculateTenGod } = await load('dayRelationships')
  const { isPunishmentPair } = await load('judgment/producers/relationCatalog')
  const clone = (value) => JSON.parse(JSON.stringify(value))
  const freeze = (value) => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) } return value }
  // Existing calculation only; deliberately unrelated to CS-005/109/126/127.
  const birth = { date: { year: 1985, month: 1, day: 4 }, time: { known: true, value: { hour: 9, minute: 0 } },
    gender: '男性', timeCorrectionMode: 'none' }
  const context = { referenceTime: '2026-06-01T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2026 }
  const chart = calculateCanonicalChart(birth, context)
  const before = JSON.stringify(chart)
  freeze(chart)
  const result = p.produceJudgmentFacts(chart)
  check(() => assert.equal(JSON.stringify(result), JSON.stringify(p.produceJudgmentFacts(chart))))
  check(() => assert.equal(JSON.stringify(chart), before))
  check(() => {
    const reordered = Object.fromEntries(Object.entries(clone(chart)).reverse())
    reordered.context.calculationVersion = Object.fromEntries(Object.entries(reordered.context.calculationVersion).reverse())
    assert.equal(JSON.stringify(p.fromCanonical(reordered)), JSON.stringify(p.fromCanonical(chart)))
  })
  check(() => assert.deepEqual(result.roleStates, []))
  check(() => assert.ok(!('applications' in result) && !('states' in result) && !('operatorReview' in result)))
  const facts = new Map(result.facts.map((fact) => [fact.id, fact]))
  check(() => {
    for (const original of oldProjection(chart)) {
      const actual = facts.get(original.id)
      assert.deepEqual(actual.value, original.value)
      assert.equal(actual.assessment, original.assessment)
      assert.deepEqual(actual.uncertaintyIds, original.uncertaintyIds)
    }
  })
  check(() => {
    for (const key of ['birthInput', 'context', 'timePolicy', 'solarTerms', 'uncertainties']) {
      assert.deepEqual(facts.get(`canonical:/${key}`).value, chart[key])
    }
    assert.deepEqual(result.timePolicy, chart.timePolicy)
    assert.deepEqual(result.calculationProvenance, chart.context.calculationVersion)
  })
  const entities = new Map(result.entities.map((entity) => [entity.entityId, entity]))
  const day = result.entities.find((entity) => entity.origin === 'natal' && entity.position === 'day' && entity.part === 'stem')
  check(() => {
    for (const fact of result.hiddenStems) {
      const entity = entities.get(fact.branchEntityId)
      const entry = table[entity.value][fact.roleOrder]
      assert.equal(fact.hiddenStem, entry.stem); assert.equal(fact.role, entry.role)
      assert.equal(fact.tenGod, calculateTenGod(day.value, entry.stem))
      assert.equal(fact.sourceSystemId, result.hiddenStemSystem.systemId)
    }
  })
  check(() => {
    assert.equal(result.hiddenStemSystem.usage, 'separate-reference')
    assert.equal(result.hiddenStemSystem.compatibility.status, 'not-checked')
    for (const entry of result.hiddenStemEntries) assert.deepEqual(entry.roles,
      Object.fromEntries(table[entry.branch].map((item) => [item.role, item.stem])))
  })
  check(() => {
    for (const fact of result.facts) assert.ok(fact.evidenceIds.length && fact.provenance.producerRef)
    assert.ok(result.facts.some((fact) => fact.canonicalPointer.includes('/twelveStage')))
    assert.ok(result.facts.some((fact) => fact.canonicalPointer.includes('/stemTenGod')))
    for (const sourceScope of ['natal', 'greatLuck', 'yearlyLuck', 'monthlyLuck']) {
      assert.ok(result.entities.some((entity) => entity.sourceScope === sourceScope))
    }
  })
  const coverage = new Map(result.coverage.map((survey) => [survey.coverageId, survey]))
  check(() => {
    for (const fact of result.relations) {
      const survey = coverage.get(fact.coverageRef)
      assert.ok(fact.participantEntityIds.every((id) => survey.universeEntityIds.includes(id)))
      assert.deepEqual(fact.producerRef, survey.producerRef)
      assert.deepEqual(fact.producerRef, result.producerRef)
      c.relationFactSchema.parse(fact)
      assert.ok(!('functionalState' in fact) && !('role' in fact) && !('judgment' in fact))
    }
    for (const survey of result.coverage) c.relationCoverageSchema.parse(survey)
  })
  check(() => {
    const ids = [...result.facts.map((f) => f.id), ...result.entities.map((e) => e.entityId),
      ...result.hiddenStems.map((f) => f.id), ...result.relations.map((f) => f.relationFactId),
      ...result.coverage.map((f) => f.coverageId)]
    assert.equal(new Set(ids).size, ids.length)
  })
  check(() => {
    assert.ok(result.relations.some((fact) => fact.participantEntityIds.some((id) => entities.get(id).origin === 'great')
      && fact.participantEntityIds.some((id) => entities.get(id).origin === 'month')))
    assert.equal(result.observationScopes[0].purpose, 'unselected-candidates')
    assert.deepEqual(result.observationScopes[0].entityIds, result.entities.map((entity) => entity.entityId).sort())
  })
  check(() => {
    assert.ok(result.evidence.records.every((record) => record.sourceType === 'deterministic-calculation'))
    assert.ok(result.evidence.records.every((record) => record.status === 'provisional'))
    for (const record of result.evidence.records) {
      assert.equal(record.documentRevision, null)
      assert.equal(record.ruleId, null)
      assert.equal(record.sourceRef.producer.producerId, result.producerRef.producerId)
    }
  })
  check(() => p.validateProducerOutput(result))
  const projection = p.fromCanonical(chart)
  const natalIds = projection.entities.filter((entity) => entity.origin === 'natal').map((entity) => entity.entityId)
  const scoped = p.produceJudgmentFacts(chart, { relationScopes: [{ scopeId: 'caller-declared-natal', entityIds: natalIds }],
    customerInputReceipt: { recordId: 'synthetic-receipt-record', receiptRef: 'synthetic-receipt' } })
  check(() => {
    assert.ok(scoped.evidence.records.some((record) => record.sourceType === 'customer-input'))
    assert.ok(scoped.relations.every((fact) => fact.participantEntityIds.every((id) => natalIds.includes(id))))
    assert.equal(scoped.entities.length, result.entities.length) // Caller relation universe does not discard source data.
    assert.ok(scoped.facts.find((fact) => fact.canonicalPointer === '/birthInput').evidenceIds.includes('producer-evidence:customer-input'))
  })
  check(() => assert.throws(() => p.relationFactProducer(projection, [{ scopeId: 'bad', entityIds: ['missing'] }]), /universe/))
  check(() => assert.throws(() => p.relationFactProducer(projection, [{ scopeId: 'dup', entityIds: natalIds }, { scopeId: 'dup', entityIds: natalIds }]), /Duplicate/))
  const unknown = calculateCanonicalChart({ ...birth, time: { known: false } }, context)
  const unknownResult = p.produceJudgmentFacts(unknown, { relationScopes: [] })
  check(() => {
    assert.ok(!unknownResult.entities.some((entity) => entity.origin === 'natal' && entity.position === 'time'))
    assert.equal(unknownResult.facts.find((fact) => fact.canonicalPointer === '/chart/pillars/time').assessment, 'unknown')
    assert.ok(unknownResult.unavailableEntityFactRefs.includes('canonical:/chart/pillars/time'))
    assert.ok(!unknownResult.hiddenStems.some((fact) => fact.branchEntityId.includes('/pillars/time/')))
  })
  const unsupported = calculateCanonicalChart({ ...birth, timeCorrectionMode: 'trueSolarTime' }, context)
  check(() => assert.ok(!p.produceJudgmentFacts(unsupported, { relationScopes: [] }).entities.some((entity) => entity.position === 'time')))
  const uncertain = calculateCanonicalChart({ ...birth, date: { year: 2026, month: 2, day: 4 }, time: { known: false } }, context)
  check(() => {
    const produced = p.produceJudgmentFacts(uncertain, { relationScopes: [] })
    assert.ok(produced.entities.filter((entity) => entity.origin === 'natal' && ['year', 'month'].includes(entity.position))
      .every((entity) => entity.assessment === 'provisional'))
    assert.deepEqual(produced.uncertainties, uncertain.uncertainties)
  })
  check(() => {
    const altered = clone(chart)
    altered.birthInput.date = { year: 2000, month: 1, day: 1 }
    const a = p.fromCanonical(altered)
    assert.deepEqual(a.entities, projection.entities) // Entity values are not recalculated from birthInput.
  })
  // Exhaustive structural catalog checks use generic labeled entities, never CS inputs.
  const sourceFact = projection.facts[0]
  const syntheticEntity = (value, index, part) => ({ entityId: `synthetic-${part}-${index}`, origin: 'natal', part,
    canonicalFactRef: sourceFact.id, position: 'year', value, assessment: 'confirmed', uncertaintyIds: [],
    sourceScope: 'natal', evidenceIds: sourceFact.evidenceIds })
  const generic = { ...projection, entities: [
    ...Array.from('甲乙丙丁戊己庚辛壬癸').map((value, index) => syntheticEntity(value, index, 'stem')),
    ...Array.from('子丑寅卯辰巳午未申酉戌亥').map((value, index) => syntheticEntity(value, index, 'branch')),
    syntheticEntity('辰', 12, 'branch'),
  ] }
  const observed = p.relationFactProducer(generic)
  const genericEntities = new Map(generic.entities.map((entity) => [entity.entityId, entity]))
  const pairsFor = (kind) => observed.relations.filter((fact) => fact.kind === kind && fact.participantEntityIds.length === 2)
    .map((fact) => fact.participantEntityIds.map((id) => genericEntities.get(id).value).sort().join(''))
  const expectedPairs = {
    'stem-combination': ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'],
    'branch-six-combination': ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'],
    'branch-clash': ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'],
    'branch-harm': ['子未', '丑午', '寅巳', '卯辰', '申亥', '酉戌'],
    'branch-break': ['子酉', '丑辰', '寅亥', '卯午', '巳申', '未戌'],
    'branch-wonjin': ['子未', '丑午', '寅酉', '卯申', '辰亥', '巳戌'],
  }
  for (const [kind, expected] of Object.entries(expectedPairs)) check(() => assert.deepEqual(
    [...new Set(pairsFor(kind))].sort(), expected.map((pair) => Array.from(pair).sort().join('')).sort()))
  check(() => {
    const stems = generic.entities.filter((entity) => entity.part === 'stem')
    for (const source of stems) for (const target of stems) {
      if (source.entityId === target.entityId) continue
      const tenGod = calculateTenGod(source.value, target.value)
      for (const [kind, matches] of [['stem-generates', ['食神', '傷官']], ['stem-controls', ['偏財', '正財']]]) {
        const found = observed.relations.some((fact) => fact.kind === kind
          && fact.sourceEntityId === source.entityId && fact.targetEntityId === target.entityId)
        assert.equal(found, matches.includes(tenGod))
      }
    }
  })
  check(() => {
    assert.ok(pairsFor('branch-punishment').includes('辰辰'))
    assert.ok(isPunishmentPair('寅', '申'))
    assert.ok(pairsFor('branch-half-combination').includes(Array.from('寅戌').sort().join('')))
    assert.ok(observed.relations.some((fact) => fact.kind === 'branch-three-combination'))
    assert.ok(observed.relations.some((fact) => fact.kind === 'branch-season-combination'))
  })
  check(() => {
    const bad = clone(scoped); bad.relations.find((fact) => !fact.sourceEntityId).participantEntityIds[0] = 'outside'
    assert.throws(() => p.validateProducerOutput(bad), /coverage/)
  })
  check(() => {
    const bad = clone(scoped); bad.relations[0].producerRef.version = 'forged'
    assert.throws(() => p.validateProducerOutput(bad), /provenance/)
  })
  check(() => {
    const bad = { ...projection, entities: projection.entities.map((entity, index) => index === 0 ? { ...entity, value: 'invalid' } : entity) }
    assert.throws(() => p.relationFactProducer(bad))
  })
  check(() => {
    const bad = clone(scoped); bad.evidence.records[0].sourceType = 'operator-confirmed'
    assert.throws(() => p.validateProducerOutput(bad))
  })
  check(() => {
    const bad = clone(scoped); bad.roleStates.push({ role: '상신' })
    assert.throws(() => p.validateProducerOutput(bad), /RoleState/)
  })
  const nativeDate = globalThis.Date
  globalThis.Date = class extends nativeDate { constructor() { throw new Error('Producer cannot read a clock') } static now() { throw new Error('Producer clock access') } }
  try { check(() => assert.deepEqual(p.produceJudgmentFacts(chart, { relationScopes: [] }).entities, projection.entities)) }
  finally { globalThis.Date = nativeDate }
  for (const file of ['fromCanonical', 'hiddenStemProducer', 'relationFactProducer', 'evidenceProducer', 'index']) {
    const source = await readFile(new URL(`../src/lib/judgment/producers/${file}.ts`, import.meta.url), 'utf8')
    check(() => assert.ok(!/from ['"].*(?:calculateEightChar|calculateGreatLuck|calculateYearlyLuck|calculateMonthlyLuck|solarTermPillars|evaluateJudgments)['"]/.test(source)))
  }
  console.log(`Judgment producer checks passed: ${checks}; deterministic projection, immutable input, existing hidden stems/ten gods, structural relations/coverage, provenance, no fake time/roles/approvals.`)
} finally { await server.close() }
