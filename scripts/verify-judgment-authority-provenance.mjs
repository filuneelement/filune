import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createServer } from 'vite'
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
const check = async (fn) => { await fn(); checks++ }
try {
  const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const p = await load('judgment/producers/index')
  const a = await load('judgment/systems/hiddenStemFiluneA179')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const { HIDDEN_STEM_ROLE_TABLE: table } = await load('hiddenStemRoleTable')
  const { auditHiddenStemCompatibility } = await load('judgment/runtime/hiddenStemCompatibility')
  const { calculateTenGod } = await load('dayRelationships')
  const sourceText = await readFile(a.FILUNE_A179.path, 'utf8')
  const legacyBefore = JSON.stringify(table)
  const context = { referenceTime: '2026-06-01T00:00:00.000Z', calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2026 }
  const input = { date: { year: 1985, month: 1, day: 4 }, time: { known: true, value: { hour: 9, minute: 0 } }, gender: '男性', timeCorrectionMode: 'none' }
  const chart = calculateCanonicalChart(input, context)
  const before = JSON.stringify(chart)
  const options = { hiddenStemSystem: { systemId: 'filune-a179', sourceText } }
  const result = p.produceJudgmentEngineFacts(chart, options)
  const provenance = await p.provenanceProducer(chart, result, sourceText)
  await check(() => assert.equal(createHash('sha256').update(sourceText).digest('hex'), a.FILUNE_A179.sourceSha256))
  await check(() => assert.equal(a.FILUNE_A179.status, 'frozen'))
  await check(() => assert.equal(result.hiddenStemSystem.systemId, 'filune-a179'))
  await check(() => assert.equal(result.hiddenStemSystem.usage, 'default-judgment'))
  await check(() => assert.throws(() => p.produceJudgmentEngineFacts(chart, {})))
  await check(() => assert.throws(() => p.produceJudgmentEngineFacts(chart, { hiddenStemSystem: { systemId: 'legacy', sourceText } })))
  await check(() => assert.throws(() => p.produceJudgmentEngineFacts(chart, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: sourceText.replace('revision: 179', 'revision: 178') } })))
  await check(() => assert.equal(a.a179Entries().length, 12))
  for (const entry of a.a179Entries()) await check(() => {
    // A has one explicit role assignment, not a twelve-branch role table. Do not invent the other rows.
    if (entry.branch === '子') { assert.equal(entry.roles.main, '癸'); assert.equal(entry.completeness, 'partial') }
    else { assert.deepEqual(entry.roles, {}); assert.equal(entry.completeness, 'unknown') }
  })
  await check(() => { for (const quote of a.A179_REQUIRED_QUOTES) assert.ok(sourceText.includes(quote)) })
  await check(() => assert.deepEqual(auditHiddenStemCompatibility().rows.filter((r) => r.comparison === 'mismatch').map((r) => r.branch), ['子', '亥']))
  await check(() => {
    const day = result.entities.find((e) => e.origin === 'natal' && e.part === 'stem' && e.position === 'day')
    assert.ok(result.hiddenStems.length)
    for (const fact of result.hiddenStems) {
      assert.equal(fact.sourceSystemId, 'filune-a179'); assert.equal(fact.hiddenStem, '癸')
      assert.equal(fact.tenGod, calculateTenGod(day.value, fact.hiddenStem)); assert.equal(fact.assessment, 'provisional')
      assert.ok(fact.evidenceIds.includes(a.FILUNE_A179.evidenceId))
    }
  })
  await check(() => assert.ok(result.hiddenStemAvailability.every((e) => e.completeness !== 'complete')))
  await check(() => assert.equal(result.canonicalHiddenStemUsage, 'legacy-reference-only'))
  await check(() => assert.deepEqual(result.roleStates, []))
  await check(() => assert.equal(JSON.stringify(result), JSON.stringify(p.produceJudgmentEngineFacts(chart, options))))
  await check(async () => assert.deepEqual(provenance, await p.provenanceProducer(chart, result, sourceText)))
  await check(() => assert.equal(provenance.records.find((r) => r.sourceType === 'source-document').sourceHash.value, a.FILUNE_A179.sourceSha256))
  await check(() => assert.ok(provenance.records.every((r) => r.independent === false && r.producedAt === null)))
  await check(() => assert.equal(new Set(provenance.records.filter((r) => r.sourceType === 'deterministic-calculation').map((r) => r.originIdentity)).size, 1))
  await check(() => assert.ok(provenance.records.every((r) => r.inputHash.value === createHash('sha256').update(JSON.stringify(p.fromCanonical(chart).facts.find((f) => f.canonicalPointer === '/birthInput').value)).digest('hex'))))
  await check(() => assert.equal(provenance.availability['customer-input'], 'unavailable'))
  await check(() => assert.equal(provenance.availability['independent-cross-check'], 'unavailable'))
  await check(() => assert.equal(provenance.availability['reverse-inference'], 'unavailable'))
  await check(() => assert.equal(provenance.availability['operator-confirmed'], 'unavailable'))
  await check(() => assert.equal(provenance.ruleAvailability.filter((r) => r.status === 'deferred').length, 10))
  await check(() => assert.ok(provenance.ruleAvailability.filter((r) => ['C-02', 'OP-P04'].includes(r.ruleId)).every((r) => r.status === 'deferred')))
  await check(async () => assert.rejects(p.provenanceProducer(chart, result), /source text/))
  await check(async () => assert.rejects(p.provenanceProducer(chart, result, sourceText + '\n'), /hash mismatch/))
  await check(async () => {
    const forged = structuredClone(result)
    forged.evidence.records[0].sourceType = 'independent-cross-check'
    await assert.rejects(p.provenanceProducer(chart, forged))
  })
  await check(async () => {
    const other = calculateCanonicalChart({ ...input, date: { ...input.date, day: 5 } }, context)
    await assert.rejects(p.provenanceProducer(other, result, sourceText), /canonical input|differs/)
  })
  await check(async () => {
    const receipt = p.produceJudgmentEngineFacts(chart, { ...options, customerInputReceipt: { recordId: 'external-receipt-test', receiptRef: 'external:test-receipt' } })
    const supplied = await p.provenanceProducer(chart, receipt, sourceText)
    assert.equal(supplied.availability['customer-input'], 'provisional')
    assert.equal(supplied.availability['operator-confirmed'], 'unavailable')
  })
  await check(() => assert.equal(JSON.stringify(chart), before))
  await check(() => assert.equal(JSON.stringify(table), legacyBefore))
  await check(() => assert.equal(p.produceJudgmentFacts(chart).hiddenStemSystem.systemId, 'filune-legacy-hidden-stem-role-table-v1'))
  await check(() => {
    const unknown = calculateCanonicalChart({ ...input, time: { known: false } }, context)
    const facts = p.produceJudgmentEngineFacts(unknown, options)
    assert.ok(!facts.entities.some((e) => e.origin === 'natal' && e.position === 'time'))
  })
  // Read source identifiers for impact audit; no regression outcome or role is supplied to a producer.
  await check(() => assert.ok(result.hiddenStemAvailability.some((e) => e.completeness === 'unknown')))
  await check(async () => {
    // The source supplies a reverse-inferred DATE and hour RANGE, not an observed exact birth instant.
    // Test authority routing with unknown time; do not invent a midpoint or a judgment fixture.
    const text = await readFile('src/docs/source/C_rev215.md', 'utf8')
    const section = text.split('C-1. CS-005')[1].split('③ 전문가')[0]
    const date = /출생일\t(\d{4})-(\d{2})-(\d{2})/.exec(section)
    assert.ok(date)
    const actual = calculateCanonicalChart({ date: { year: +date[1], month: +date[2], day: +date[3] },
      time: { known: false }, gender: '女性', timeCorrectionMode: 'none' },
      { ...context, monthlyLuckYear: 2027 })
    const produced = p.produceJudgmentEngineFacts(actual, options)
    assert.equal(produced.hiddenStemSystem.systemId, 'filune-a179')
    assert.ok(produced.hiddenStems.every((fact) => fact.sourceSystemId === 'filune-a179'))
    assert.ok(produced.hiddenStemAvailability.some((item) => item.completeness === 'unknown'))
    assert.deepEqual(produced.roleStates, [])
    assert.ok(!produced.entities.some((item) => item.position === 'time'))
  })
  console.log(`Judgment authority/provenance: ${checks} checks passed (partial A data remains blocked).`)
} finally { await server.close() }
