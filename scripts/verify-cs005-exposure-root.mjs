import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { hmr: false, middlewareMode: true, ws: false } })
let checks = 0
const check = (fn) => { fn(); checks++ }
try {
  const load = (path) => server.ssrLoadModule(`/src/lib/${path}.ts`)
  const { evaluateStemCombination: evaluate } = await load('judgment/evaluators/stemCombination/index')
  const p = await load('judgment/producers/index')
  const r = await load('judgment/runtime/index')
  const contracts = await load('judgment/contracts/index')
  const { calculateCanonicalChart } = await load('canonical/calculateCanonicalChart')
  const { CURRENT_CALCULATION_VERSION } = await load('canonical/version')
  const A = await readFile('src/docs/source/authority/A_rev179.md', 'utf8')
  const C = await readFile('src/docs/source/authority/C_rev215.md', 'utf8')
  const clone = (x) => JSON.parse(JSON.stringify(x))
  const freeze = (x) => { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x) } return x }
  const jan = '2027-01-15T00:00:00.000Z', july = '2027-07-15T00:00:00.000Z'
  const c1 = C.split('C-1. CS-005')[1].split('③ 전문가')[0]
  const birthDate = /출생일\t(\d{4})-(\d{2})-(\d{2})/.exec(c1)
  const range = /戌시\((\d{2}):(\d{2})~/.exec(c1)
  assert.ok(birthDate && range)
  // A synthetic representative AT THE DOCUMENTED RANGE'S LOWER BOUND, not an observed exact birth time.
  // Full boundary-range calculation, independent validation and publication remain unverified.
  const chart = calculateCanonicalChart({ date: { year: +birthDate[1], month: +birthDate[2], day: +birthDate[3] },
    time: { known: true, value: { hour: +range[1], minute: +range[2] } }, gender: '女性', timeCorrectionMode: 'none' },
    { referenceTime: jan, calculationVersion: CURRENT_CALCULATION_VERSION, monthlyLuckYear: 2027 })
  const producer = p.produceJudgmentEngineFacts(chart, { hiddenStemSystem: { systemId: 'filune-a179', sourceText: A } })
  const saved = JSON.stringify(producer)
  freeze(producer)
  const periodAt = (output, scope, at) => {
    const refs = [...new Set(output.entities.filter((e) => e.sourceScope === scope).map((e) => e.periodRef))]
    const result = refs.find((ref) => {
      const period = r.producerPeriod(output, ref)
      return period.from.kind === 'exact' && period.to.kind === 'exact' && period.from.instant <= at && at < period.to.instant
    })
    assert.ok(result, `${scope} at ${at}`); return result
  }
  function context(output, stage, at, name = stage) {
    const selectedPeriodRefs = {}
    if (['greatLuck', 'yearlyLuck'].includes(stage)) selectedPeriodRefs.greatLuck = periodAt(output, 'greatLuck', at)
    if (['yearlyLuck', 'monthlyLuck'].includes(stage)) selectedPeriodRefs.yearlyLuck = periodAt(output, 'yearlyLuck', at)
    if (stage === 'monthlyLuck') selectedPeriodRefs.monthlyLuck = periodAt(output, 'monthlyLuck', at)
    return r.createExecutionScopeContext(output, { executionId: `test:${name}:${at}`, stage, referenceTime: at, selectedPeriodRefs,
      ...(stage === 'natal' ? { natalInspectionPeriod: r.producerPeriod(output, periodAt(output, 'greatLuck', at)) } : {}) })
  }
  const { produceExposureRootFacts: derive } = await load('judgment/producers/exposureRootProducer')
  const { exposureRootAuthority } = await load('judgment/systems/exposureRootAuthority')
  const sources = freeze({ A, C, D: await readFile('src/docs/source/authority/D_rev152.md', 'utf8'), approval: await readFile('src/docs/source/authority/25-7_rev16.md', 'utf8') })
  const serverModuleNatal = await load('judgment/evaluators/natalStemCombination/index')
  const natalInput = { producer, context: context(producer, 'natal', jan) }
  const before = JSON.stringify(natalInput); freeze(natalInput)
  const combinedBefore = evaluate(natalInput)
  const result = derive(natalInput, sources)
  const entity = (pos, part = 'stem') => producer.entities.find((e) => e.origin === 'natal' && e.position === pos && e.part === part)
  const exposure = (pos, branch, hidden) => result.exposures.find((f) => f.stemEntityId === entity(pos).entityId && f.sourceBranchEntityId === entity(branch, 'branch').entityId && f.hiddenStem === hidden)
  const root = (pos, branch, hidden) => result.roots.find((f) => f.stemEntityId === entity(pos).entityId && f.rootBranchEntityId === entity(branch, 'branch').entityId && f.hiddenStem === hidden)
  check(() => assert.equal(JSON.stringify(result), JSON.stringify(derive(natalInput, sources))))
  check(() => { assert.equal(JSON.stringify(natalInput), before); assert.equal(JSON.stringify(producer), saved) })
  check(() => { assert.ok(result.exposures.every((f) => f.kind === 'exposure' && !('rootExistence' in f))); assert.ok(result.roots.every((f) => f.kind === 'root' && !('exposed' in f))) })
  check(() => {
    for (const fact of result.exposures.filter((f) => f.exposed)) {
      assert.ok(result.hiddenObservations.some((h) => h.branchEntityId === fact.sourceBranchEntityId && h.hiddenStem === fact.hiddenStem))
      assert.notEqual(fact.visibleStemPosition, 'day')
    }
    assert.equal(exposure('time', 'month', '甲').exposed, false)
    assert.equal(exposure('day', 'month', '戊').exposed, false)
    assert.equal(exposure('day', 'month', '戊').sameElementVisible, true)
  })
  check(() => {
    assert.equal(root('year','day','癸').rootExistence, 'absent')
    assert.ok(result.roots.filter((f) => f.rootExistence === 'present').every((f) => f.hiddenStemMatched && result.hiddenObservations.some((h) => h.branchEntityId === f.rootBranchEntityId && h.hiddenStem === f.hiddenStemMatched)))
  })
  check(() => {
    const authority = result.authority
    assert.deepEqual(authority.entries.filter((e) => e.completeness === 'complete').map((e) => e.branch).sort(), ['子','丑','寅','辰','午','戌'].sort())
    for (const b of ['卯','巳','申','酉']) { const e = authority.entries.find((e) => e.branch === b); assert.equal(e.completeness,'unknown'); assert.deepEqual(e.roles,{}) }
    assert.deepEqual(authority.entries.find((e) => e.branch === '未').roles, {})
    assert.deepEqual(authority.entries.find((e) => e.branch === '亥').roles, {main:'壬'})
  })
  check(() => assert.ok([...result.exposures,...result.roots].every((f) => f.hiddenStemSystemId === 'filune-a179')))
  check(() => {
    for (const f of [...result.exposures,...result.roots]) {
      assert.deepEqual(f.provenance.producerRef, producer.producerRef)
      assert.deepEqual(f.provenance.calculationVersion, producer.calculationProvenance)
      assert.equal(f.provenance.ruleVersion, 'A179')
      assert.ok(f.provenance.inputFactIds.length >= 1 && f.provenance.sourceRuleIds.length && f.scopeId === natalInput.context.scopeId)
      assert.ok(f.evidenceIds.every((id) => result.evidence.records.some((e) => e.evidenceId === id)))
      if (f.assessment === 'unknown') assert.ok(f.uncertaintyIds.length)
    }
  })
  check(() => { const ids = [...result.exposures,...result.roots,...result.hiddenObservations,...result.branchMainObservations].map((f) => f.id); assert.equal(new Set(ids).size, ids.length) })
  check(() => assert.deepEqual(result.roleStates, []))
  check(() => {
    const allowed = ['exposures','roots','hiddenObservations','branchMainObservations','authority','evidence','scopeId','roleStates'].sort()
    assert.deepEqual(Object.keys(result).sort(), allowed)
    assert.ok(!/percentage|rootStrength|weight|structureJudgment|supportingGod|remedy|favorable/.test(JSON.stringify(result)))
  })
  check(() => {
    const expected = C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n').find((line) => line.startsWith('4 천간 용신·투출\t')).split('\t')[1]
    assert.ok(expected.includes('甲(년간) 본기 투출 + 丙(월간) 중기 투출'))
    const actual = result.exposures.filter((f) => f.monthCommand && f.exposed).map((f) => [producer.entities.find((e) => e.entityId === f.stemEntityId).value, f.visibleStemPosition, f.hiddenStemRole]).sort()
    assert.deepEqual(actual, [['甲','year','main'],['丙','month','middle']].sort(), JSON.stringify(result,null,2))
    assert.equal(root('year','month','甲').rootExistence,'present')
    assert.equal(root('month','month','丙').rootExistence,'present')
    assert.equal(root('day','year','戊').rootExistence,'present')
    assert.equal(root('day','time','戊').rootExistence,'present')
    assert.equal(root('month','time','丁').rootExistence,'present')
    // Opposite-polarity root generalization is not explicitly supplied by I-05.
    assert.equal(root('time','day','癸').rootExistence,'unknown')
  })
  check(() => assert.deepEqual(evaluate(natalInput), combinedBefore))
  check(() => {
    const { evaluateNatalStemCombination } = serverModuleNatal
    const snapshot = evaluateNatalStemCombination(natalInput)
    derive(natalInput,sources)
    assert.deepEqual(evaluateNatalStemCombination(natalInput),snapshot)
  })
  const greatInput = {producer, context:context(producer,'greatLuck',jan)}
  const yearInput = {producer, context:context(producer,'yearlyLuck',jan)}
  const monthInput = {producer, context:context(producer,'monthlyLuck',jan)}
  check(() => {
    const great = derive(greatInput,sources)
    const branch = producer.entities.find((e) => e.sourceScope === 'greatLuck' && e.part === 'branch' && greatInput.context.includedEntityIds.includes(e.entityId))
    assert.equal(branch.value,'未')
    const h = great.hiddenObservations.filter((h) => h.branchEntityId === branch.entityId)
    assert.deepEqual(h.map((h) => [h.hiddenStem,h.role]), [['乙',null]])
    assert.ok(great.roots.some((f) => f.rootBranchEntityId === branch.entityId && f.rootExistence === 'unknown'))
    assert.ok(!h.some((h) => h.hiddenStem === '己' || h.hiddenStem === '丁'))
    assert.ok(great.exposures.some((f) => f.sourceBranchEntityId === branch.entityId && f.exposed === null))
  })
  check(() => {
    for (const [input, value] of [[yearInput,'午'],[monthInput,'丑']]) {
      const output = derive(input,sources)
      assert.ok(output.hiddenObservations.some((h) => producer.entities.find((e) => e.entityId === h.branchEntityId).value === value))
      assert.ok(output.roots.every((f) => input.context.includedEntityIds.includes(f.stemEntityId) && input.context.includedEntityIds.includes(f.rootBranchEntityId)))
    }
  })
  check(() => {
    const legacy = p.produceJudgmentFacts(chart)
    assert.throws(() => derive({producer:legacy,context:context(legacy,'natal',jan)},sources), /legacy/)
    assert.throws(() => exposureRootAuthority({...sources,D:sources.D.replace('revision: 152','revision: 151')}), /rev152/)
    assert.throws(() => exposureRootAuthority({...sources,approval:sources.approval.replace('동일 오행이면 본기 투출','폐기')}), /approval/)
  })
  // Synthetic fact arrangement: verifies partial/not-specified handling and polarity without claiming calendar validity.
  check(() => {
    const facts = clone(chart)
    for (const [pos,branch] of [['year','卯'],['month','亥'],['day','未'],['time','酉']]) {
      facts.chart.pillars[pos].value.branch=branch; facts.chart.pillars[pos].value.ganZhi=facts.chart.pillars[pos].value.stem+branch
    }
    facts.chart.pillars.year.value.stem='戊'
    facts.chart.pillars.year.value.ganZhi='戊卯'
    const output=p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}})
    const derived=derive({producer:output,context:context(output,'natal',jan)},sources)
    const branch=(pos)=>output.entities.find((e)=>e.part==='branch'&&e.position===pos)
    assert.ok(!derived.hiddenObservations.some((h)=>['year','time'].some((p)=>h.branchEntityId===branch(p).entityId)))
    assert.ok(derived.roots.filter((f)=>f.rootBranchEntityId===branch('year').entityId).every((f)=>f.rootExistence==='unknown'))
    assert.ok(!derived.hiddenObservations.some((h)=>h.branchEntityId===branch('month').entityId&&h.hiddenStem==='戊'))
    assert.ok(derived.roots.some((f)=>output.entities.find((e)=>e.entityId===f.stemEntityId).value==='戊'&&f.rootBranchEntityId===branch('month').entityId&&f.rootExistence==='absent'))
    assert.ok(derived.hiddenObservations.some((h)=>h.branchEntityId===branch('day').entityId&&h.hiddenStem==='乙'&&h.role===null))
    // 25-7 §§5-1/5-2 supplies main-only receipts for 未 and 酉.
    // The exposure/root table retains its original incomplete coverage.
    assert.deepEqual(derived.branchMainObservations.map(({ hiddenStem, role, assessment }) =>
      [hiddenStem, role, assessment]).sort(), [['己', 'main', 'confirmed'], ['辛', 'main', 'confirmed']].sort())
  })
  check(() => {
    const facts=clone(chart)
    for (const [pos,stem,branch] of [['year','壬','辰'],['month','庚','戌'],['day','甲','子'],['time','乙','午']]) {
      Object.assign(facts.chart.pillars[pos].value,{stem,branch,ganZhi:stem+branch})
    }
    const output=p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}})
    const input={producer:output,context:context(output,'natal',jan)}
    const stopped=serverModuleNatal.evaluateNatalStemCombination(input)
    const visible=output.entities.find((e)=>e.part==='stem'&&e.position==='month')
    assert.equal(stopped.states.find((s)=>s.targetEntityId===visible.entityId).functionalState,'stopped')
    const d=derive(input,sources)
    assert.ok(d.exposures.some((f)=>f.monthCommand&&f.stemEntityId===visible.entityId&&f.hiddenStem==='辛'&&f.exposed))
    assert.deepEqual(serverModuleNatal.evaluateNatalStemCombination(input),stopped)
  })
  check(() => {
    const facts=clone(chart)
    Object.assign(facts.chart.pillars.year.value,{stem:'乙',branch:'未',ganZhi:'乙未'})
    const output=p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}})
    const d=derive({producer:output,context:context(output,'natal',jan)},sources)
    assert.ok(d.roots.some((f)=>f.hiddenStem==='乙'&&f.hiddenStemRole===null&&f.rootExistence==='present'))
    for(const h of d.hiddenObservations) {
      assert.ok(h.provenance.sourceRuleIds.includes('C-10'))
      assert.deepEqual(h.provenance.producerRef,output.producerRef)
      assert.ok(h.evidenceIds.every((id)=>d.evidence.records.some((e)=>e.evidenceId===id)))
    }
  })
  console.log(`CS-005 exposure/root: ${checks} checks passed; natal exposure structure matched; incomplete roots remain unknown.`)
} finally { await server.close() }
