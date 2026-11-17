import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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
  const A = await readFile('src/docs/source/A_rev179.md', 'utf8')
  const C = await readFile('src/docs/source/C_rev215.md', 'utf8')
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
  const { evaluateNatalStemCombination: natalEvaluate } = await load('judgment/evaluators/natalStemCombination/index')
  const { evaluatePatternCandidates: candidates, patternCandidateSchema } = await load('judgment/evaluators/patternCandidates/index')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const sources = { A, C, D: await readFile('src/docs/source/D_rev152.md','utf8'), approval: await readFile('src/docs/source/25-7_rev16.md','utf8') }
  function prepare(output) {
    const ctx=context(output,'natal',jan)
    const input={producer:output,context:ctx}
    return {...input,derived:derive(input,sources),natalCombination:natalEvaluate(input)}
  }
  const { localFactAssessment } = await load('judgment/producers/assessmentPropagation')
  const { sourceSha256, DOCUMENT_PINS } = await load('judgment/systems/documentReceipt')
  const awaitReadBaseline=await readFile('scripts/fixtures/cs005-structural-facts.json','utf8')
  const input=prepare(producer),before=JSON.stringify(input)
  freeze(input);freeze(sources)
  const d=input.derived, result=candidates(input)
  const entity=(position,part='stem',output=producer)=>output.entities.find((e)=>e.origin==='natal'&&e.position===position&&e.part===part)
  const branchId=entity('month','branch').entityId
  const hidden=d.hiddenObservations.filter((h)=>h.branchEntityId===branchId)
  const positive=d.exposures.filter((f)=>f.sourceBranchEntityId===branchId&&f.exposed)
  const positiveRoots=d.roots.filter((f)=>f.rootBranchEntityId===branchId&&['year','month'].some((p)=>entity(p).entityId===f.stemEntityId)&&f.rootExistence==='present')
  const factReceipt=(f)=>d.evidence.records.find((r)=>r.verification.claimRef===f.id&&r.sourceType==='deterministic-calculation')
  check(()=>{ assert.deepEqual(hidden.map((h)=>[h.hiddenStem,h.role]).sort(),[['甲','main'],['丙','middle'],['戊','residual']].sort()); assert.ok(hidden.every((h)=>h.assessment==='confirmed')) })
  check(()=>{const f=positive.find((f)=>f.stemEntityId===entity('year').entityId);assert.equal(f.hiddenStem,'甲');assert.equal(f.assessment,'confirmed')})
  check(()=>{const f=positive.find((f)=>f.stemEntityId===entity('month').entityId);assert.equal(f.hiddenStem,'丙');assert.equal(f.assessment,'confirmed')})
  check(()=>{assert.equal(positiveRoots.length,2);assert.ok(positiveRoots.every((f)=>f.assessment==='confirmed'))})
  check(()=>{assert.equal(entity('month','branch').assessment,'confirmed');assert.ok(positive.every((f)=>f.provenance.sourceDocumentRefs.some((id)=>id.includes('document-pillars:'))))})
  check(()=>{
    assert.equal(producer.hiddenStemSystem.assessment,'provisional')
    assert.ok(d.authority.entries.some((e)=>e.completeness==='unknown'))
    assert.ok(hidden.every((h)=>h.assessment==='confirmed'&&h.uncertaintyIds.length===0))
    for(const b of ['未','亥'])assert.equal(d.authority.entries.find((e)=>e.branch===b).completeness,'partial')
    for(const b of ['卯','巳','申','酉'])assert.deepEqual(d.authority.entries.find((e)=>e.branch===b).roles,{})
  })
  check(()=>{
    const unknown=d.roots.filter((f)=>f.rootExistence==='unknown')
    assert.equal(unknown.length,3);assert.ok(unknown.every((f)=>f.assessment==='unknown'&&f.uncertaintyIds.length))
    assert.ok(producer.evidence.records.every((r)=>r.status==='provisional'))
    assert.ok(d.evidence.records.filter((r)=>r.evidenceId.startsWith('producer-evidence:')).every((r)=>r.status==='provisional'))
    assert.ok(!d.evidence.records.some((r)=>r.sourceType==='independent-cross-check'||r.sourceType==='operator-confirmed'))
  })
  check(()=>{
    for(const f of [...hidden,...positive,...positiveRoots]) {
      const receipt=factReceipt(f)
      assert.equal(receipt.status,'confirmed')
      assert.ok(receipt.verification.checkedByRef&&receipt.verification.basisEvidenceIds.length)
      assert.ok(receipt.verification.basisEvidenceIds.every((id)=>d.evidence.records.some((r)=>r.evidenceId===id)))
      assert.ok(f.provenance.assessmentBasis.receiptEvidenceIds.every((id)=>d.evidence.records.find((r)=>r.evidenceId===id).status==='confirmed'))
      assert.ok(f.provenance.assessmentBasis.parentFactIds.length)
      assert.equal(f.provenance.assessmentBasis.legacyFallback,false)
      assert.deepEqual(f.provenance.producerRef,producer.producerRef)
    }
  })
  check(()=>{
    for(const r of d.authority.evidence.filter((r)=>r.status==='confirmed')) {
      const doc=r.sourceRef.document,pin=DOCUMENT_PINS[doc.documentId]
      assert.ok(pin&&doc.documentRevision===pin.revision&&doc.section&&doc.location&&r.ruleId)
      assert.equal(r.hash.value,pin.sha256)
      assert.ok(r.verification.checkedByRef&&r.verification.basisEvidenceIds.length)
    }
  })
  const monthClaims=d.authority.entryReceiptIds['寅']
  function gate(changes={}) {return localFactAssessment({parents:[{assessment:'confirmed',uncertaintyIds:[]}],uncertaintyIds:[],receipts:d.authority.evidence,receiptIds:monthClaims,localCoverage:'complete',legacyFallback:false,unavailable:false,...changes})}
  check(()=>{assert.equal(gate().assessment,'confirmed');assert.equal(gate({parents:[{assessment:'provisional',uncertaintyIds:[]}]}).assessment,'provisional')})
  check(()=>{assert.equal(gate({parents:[{assessment:'unknown',uncertaintyIds:['unavailable']}]}).assessment,'unknown');assert.equal(gate({parents:[{assessment:'unsupported',uncertaintyIds:['unsupported']}]}).assessment,'unsupported')})
  check(()=>assert.equal(gate({parents:[{assessment:'confirmed',uncertaintyIds:['parent-not-certain']}]}).assessment,'provisional'))
  check(()=>{assert.equal(gate({localCoverage:'partial'}).assessment,'provisional');assert.equal(gate({legacyFallback:true}).assessment,'provisional');assert.equal(gate({receiptIds:[]}).assessment,'provisional')})
  check(()=>{
    for(const change of [(r)=>delete r.sourceRef.document,(r)=>delete r.sourceRef.document.documentRevision,(r)=>delete r.sourceRef.document.section,(r)=>delete r.ruleId,(r)=>delete r.verification.checkedByRef,(r)=>r.verification.basisEvidenceIds=[],(r)=>r.status='provisional',(r)=>r.hash.value='0'.repeat(64)]) {
      const records=clone(d.authority.evidence);change(records.find((r)=>r.evidenceId===monthClaims[1]))
      assert.equal(gate({receipts:records}).assessment,'provisional')
    }
  })
  check(()=>{
    const changed=clone(producer),branch=entity('month','branch',changed)
    branch.assessment='provisional'
    changed.facts.find((f)=>f.id===branch.canonicalFactRef).assessment='provisional'
    const ctx=context(changed,'natal',jan)
    const derived=derive({producer:changed,context:ctx},sources)
    assert.ok(derived.hiddenObservations.filter((h)=>h.branchEntityId===branch.entityId).every((f)=>f.assessment==='provisional'))
    assert.ok(derived.exposures.filter((f)=>f.sourceBranchEntityId===branch.entityId).every((f)=>f.assessment==='provisional'))
    const c=candidates({producer:changed,context:ctx,derived,natalCombination:natalEvaluate({producer:changed,context:ctx})})
    assert.ok(c.candidates.some((c)=>c.inputAssessments.some((f)=>f.assessment==='provisional')))
  })
  check(()=>{
    const changed=clone(producer),stem=entity('year','stem',changed)
    changed.facts.find((f)=>f.id===stem.canonicalFactRef).assessment='provisional'
    const derived=derive({producer:changed,context:context(changed,'natal',jan)},sources)
    assert.ok(derived.exposures.filter((f)=>f.stemEntityId===stem.entityId).every((f)=>f.assessment==='provisional'))
  })
  check(()=>{
    const greatInput={producer,context:context(producer,'greatLuck',jan)}
    const derived=derive(greatInput,sources)
    const branch=producer.entities.find((e)=>e.part==='branch'&&e.sourceScope==='greatLuck'&&greatInput.context.includedEntityIds.includes(e.entityId))
    assert.equal(branch.value,'未')
    assert.ok(derived.hiddenObservations.filter((h)=>h.branchEntityId===branch.entityId).every((f)=>f.assessment==='provisional'))
    assert.ok(derived.exposures.filter((f)=>f.sourceBranchEntityId===branch.entityId).every((f)=>f.assessment!=='confirmed'))
  })
  check(()=>{
    for(const c of result.candidates) {
      assert.equal(c.status,'candidate')
      const ids=[...new Set([...c.supportingFactIds,...c.conflictingFactIds,...c.basis.rootFactIds])].sort()
      assert.deepEqual(c.inputAssessments.map((f)=>f.inputId),ids)
      assert.deepEqual(c.evidenceAssessments.map((f)=>f.evidenceId),c.evidenceIds)
      for(const f of c.evidenceAssessments)assert.equal(f.assessment,result.evidence.records.find((r)=>r.evidenceId===f.evidenceId).status)
      for(const f of c.inputAssessments) {
        const parent=[...producer.facts,...d.hiddenObservations,...d.exposures,...d.roots].find((p)=>p.id===f.inputId)
        assert.equal(f.assessment,parent?.assessment??null)
      }
      assert.ok(c.inputAssessments.some((f)=>f.assessment==='confirmed'))
      assert.ok(c.evidenceAssessments.some((f)=>f.assessment==='provisional'))
      assert.ok(c.uncertaintyIds.includes('no-independent-cross-check-supplied'))
    }
  })
  check(()=>{
    const old=JSON.stringify(input.natalCombination)
    assert.equal(JSON.stringify(input),before)
    assert.equal(JSON.stringify(derive({producer,context:input.context},sources)),JSON.stringify(d))
    assert.equal(JSON.stringify(natalEvaluate({producer,context:input.context})),old)
    assert.equal(JSON.stringify(candidates(input)),JSON.stringify(result))
  })
  check(()=>{
    const baseline=JSON.parse(awaitReadBaseline)
    const e=new Map(producer.entities.map((e)=>[e.entityId,e]))
    const order=(rows)=>rows.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en'))
    const actual={hidden:order(d.hiddenObservations.map((h)=>[e.get(h.branchEntityId).position,h.hiddenStem,h.role])),exposures:order(d.exposures.map((f)=>[e.get(f.stemEntityId).position,e.get(f.sourceBranchEntityId).position,f.hiddenStem,f.hiddenStemRole,f.exposed])),roots:order(d.roots.map((f)=>[e.get(f.stemEntityId).position,e.get(f.rootBranchEntityId).position,f.hiddenStem,f.hiddenStemRole,f.rootExistence,f.hiddenStemMatched]))}
    for(const key of Object.keys(baseline))assert.deepEqual(order(actual[key]),order(baseline[key]))
  })
  check(()=>{
    assert.throws(()=>derive({producer,context:input.context},{...sources,D:sources.D+'\n'}),/Unverified document/)
    assert.throws(()=>derive({producer,context:input.context},{...sources,A:sources.A.replace('revision: 179','revision: 178')}),/metadata|rev179/)
    const legacy=p.produceJudgmentFacts(chart)
    assert.throws(()=>derive({producer:legacy,context:context(legacy,'natal',jan)},sources),/legacy/)
  })
  check(()=>{
    for(const text of ['', 'abc', '寅 甲 丙 戊', sources.D])assert.equal(sourceSha256(text),createHash('sha256').update(text).digest('hex'))
  })
  check(()=>{
    assert.deepEqual(d.roleStates,[]);assert.deepEqual(result.roleStates,[])
    assert.ok(!result.candidates.some((c)=>c.status==='confirmed'))
  })
  check(()=>{
    assert.equal(gate({parents:[]}).assessment,'unknown')
    assert.equal(gate({parents:[{assessment:'confirmed'}]}).assessment,'unknown')
    assert.equal(gate({parents:[{uncertaintyIds:[]}]}).assessment,'unknown')
  })
  console.log(`CS-005 assessment propagation: ${checks} checks passed; local facts confirmed; partial authority and unverified provenance retained.`)
} finally { await server.close() }
