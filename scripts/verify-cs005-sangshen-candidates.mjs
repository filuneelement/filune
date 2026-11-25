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
  const { evaluateNatalStemCombination: natalEvaluate } = await load('judgment/evaluators/natalStemCombination/index')
  const { evaluatePatternCandidates: candidates, patternCandidateSchema } = await load('judgment/evaluators/patternCandidates/index')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const sources = { A, C, D: await readFile('src/docs/source/authority/D_rev152.md','utf8'), approval: await readFile('src/docs/source/authority/25-7_rev16.md','utf8') }
  function prepare(output) {
    const ctx=context(output,'natal',jan)
    const input={producer:output,context:ctx}
    return {...input,derived:derive(input,sources),natalCombination:natalEvaluate(input)}
  }
  const { evaluatePatternJudgment: judge, patternJudgmentSchema } = await load('judgment/evaluators/patternJudgment/index')
  const { evaluateYongShenCandidates: yong, yongShenCandidateSchema }=await load('judgment/evaluators/yongShenCandidates/index')
  function ready(output) {
    const prepared=prepare(output),pcs=candidates(prepared)
    const upstream=judge({...prepared,candidates:pcs.candidates})
    return {...prepared,candidates:pcs.candidates,patternJudgment:upstream.judgment,judgmentEvidence:upstream.evidence}
  }
  const { evaluateYongShenJudgment: finalize, yongShenJudgmentSchema }=await load('judgment/evaluators/yongShenJudgment/index')
  function roleInput(output) {
    const input=ready(output),upstream=yong(input)
    return {...input,yongShenCandidates:upstream.candidates,candidateEvidence:upstream.evidence}
  }

  const { evaluateSangShenCandidates: helpers, sangShenCandidateSchema } = await load('judgment/evaluators/sangShenCandidates/index')
  const upstream=roleInput(producer)
  const input={...upstream,yongShenResult:finalize(upstream)},before=JSON.stringify(input);freeze(input)
  const result=helpers(input)
  const at=(position,output=result)=>output.candidates.find((c)=>producer.entities.find((e)=>e.entityId===c.entityId)?.position===position)
  const diagnostic=()=>JSON.stringify({candidates:result.candidates,pattern:input.patternJudgment,yong:input.yongShenResult.judgments,evidence:result.evidence},null,2)
  const moduleSource=await readFile('src/lib/judgment/evaluators/sangShenCandidates/index.ts','utf8')
  check(()=>assert.equal(JSON.stringify(result),JSON.stringify(helpers(input))))
  check(()=>assert.equal(JSON.stringify(input),before))
  check(()=>{
    assert.ok(!/evaluateYongShenJudgment\(|evaluateYongShenCandidates\(|evaluatePatternJudgment\(|calculateTenGod\(|produceExposureRootFacts\(/.test(moduleSource))
    assert.ok(!/caseId|expectedPattern|CS-005/.test(moduleSource))
  })
  check(()=>{
    assert.equal(at('month').status,'candidate',diagnostic())
    assert.equal(at('month').assessment,'confirmed')
    assert.equal(at('year').status,'rejected');assert.equal(at('day').status,'rejected');assert.equal(at('time').status,'rejected')
    assert.ok(result.candidates.every((c)=>sangShenCandidateSchema.is(c)))
    assert.ok(!sangShenCandidateSchema.is({...at('month'),status:'confirmed'}))
    assert.ok(!sangShenCandidateSchema.is({...at('month'),sourceRuleIds:[]}))
  })
  check(()=>{
    const cell=C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n').find((line)=>line.startsWith('7 상신\t')).split('\t')[1]
    const expected=[...cell.matchAll(/[甲乙丙丁戊己庚辛壬癸]/g)].map((m)=>m[0])
    assert.ok(expected.length)
    assert.deepEqual(result.candidates.filter((c)=>c.status==='candidate').map((c)=>c.stem).sort(),[...new Set(expected)].sort(),diagnostic())
  })
  check(()=>{
    const source=input.yongShenResult.judgments.find((j)=>j.stem==='甲')
    assert.deepEqual(at('month').relatedYongShenIds,[source.judgmentId])
    assert.equal(at('month').functionBasis.relationFactIds.length,2)
    assert.ok(at('month').functionBasis.rootFactIds.length)
    assert.equal(at('month').functionBasis.existingYongRoleIds.length,1)
    assert.equal(at('year').status,'rejected') // Yong role alone is not a helper.
  })
  check(()=>{
    const changed=clone(input),id=at('month').functionBasis.relationFactIds[0]
    changed.producer.relations.find((r)=>r.relationFactId===id).assessment='provisional'
    assert.equal(at('month',helpers(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),id=at('month').functionBasis.relationFactIds[0]
    const rel=changed.producer.relations.find((r)=>r.relationFactId===id);rel.existence='unknown';rel.assessment='unknown'
    assert.equal(at('month',helpers(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),id=at('month').functionBasis.relationFactIds[1]
    changed.producer.relations=changed.producer.relations.filter((r)=>r.relationFactId!==id)
    assert.equal(at('month',helpers(changed)).status,'rejected') // One generation edge is insufficient.
    assert.equal(changed.yongShenResult.judgments.find((j)=>j.entityId===at('month').entityId).status,'confirmed')
  })
  check(()=>{
    const changed=clone(input)
    changed.producer.coverage=changed.producer.coverage.filter((c)=>c.kind!=='stem-generates')
    changed.producer.relations=changed.producer.relations.filter((r)=>r.kind!=='stem-generates')
    assert.equal(at('month',helpers(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input)
    changed.derived.roots.filter((f)=>at('month').functionBasis.rootFactIds.includes(f.id)).forEach((f)=>f.assessment='provisional')
    assert.equal(at('month',helpers(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input)
    changed.derived.roots=changed.derived.roots.filter((f)=>f.stemEntityId!==at('month').entityId)
    assert.equal(at('month',helpers(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input);delete changed.derived.authority.ruleReceiptIds['I-07']
    assert.ok(helpers(changed).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input)
    changed.patternJudgment.status='deferred';changed.patternJudgment.assessment='provisional';changed.patternJudgment.uncertainty.blockingIds=['test:pattern']
    assert.ok(helpers(changed).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input)
    const y=changed.yongShenResult.judgments.find((j)=>j.stem==='甲')
    y.status='deferred';y.assessment='provisional';y.uncertainty.blockingIds=['test:yong']
    assert.ok(helpers(changed).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input),id=at('month').entityId
    for(const states of [changed.natalCombination.states,changed.natalCombination.bundle.states]) {
      const state=states.find((s)=>s.stateId===changed.natalCombination.states.find((s)=>s.targetEntityId===id).stateId);state.functionalState='stopped'
    }
    const c=at('month',helpers(changed))
    assert.equal(c.status,'deferred');assert.ok(c.trace.some((t)=>t.ruleId==='I-02a'&&t.outcome==='deferred'))
    assert.ok(c.runtimeStates.some((s)=>s.targetEntityId===id&&s.functionalState==='stopped'))
  })
  check(()=>{
    const changed=clone(input),id=at('month').entityId
    for(const states of [changed.natalCombination.states,changed.natalCombination.bundle.states]) { const state=states.find((s)=>s.stateId===changed.natalCombination.states.find((s)=>s.targetEntityId===id).stateId);state.functionalState='weakened';state.weakeningDescription={wording:'Supplied weakened state handoff',ruleId:state.causingApplicationRefs[0].ruleId} }
    const weakened=at('month',helpers(changed));assert.equal(weakened.status,'candidate',JSON.stringify(weakened.uncertainty)) // No undocumented threshold.
  })
  check(()=>{
    const changed=clone(input),id=at('month').entityId
    changed.yongShenResult.judgments=changed.yongShenResult.judgments.filter((j)=>j.entityId!==id)
    changed.yongShenResult.roleStates=changed.yongShenResult.roleStates.filter((j)=>j.entityId!==id)
    assert.equal(at('month',helpers(changed)).status,'candidate') // Own Yong role is not a premise or exclusion.
  })
  check(()=>{
    const known=new Map([...producer.facts,...producer.relations.map((r)=>({...r,id:r.relationFactId})),...input.derived.hiddenObservations,...input.derived.exposures,...input.derived.roots].map((f)=>[f.id,f]))
    for(const c of result.candidates) {
      assert.ok(c.sourceRuleIds.length&&c.trace.every((t)=>c.sourceRuleIds.includes(t.ruleId)))
      assert.ok(c.evidenceIds.every((id)=>result.evidence.records.some((e)=>e.evidenceId===id&&e.status==='confirmed'&&e.verification.checkedByRef)))
      assert.ok(c.supportingFactIds.every((id)=>known.has(id)))
      if(c.status==='candidate')assert.ok(c.supportingFactIds.every((id)=>known.get(id).assessment==='confirmed'))
      assert.equal(c.provenance.sourceDocument.documentRevision,179)
      assert.equal(c.sourceScope,'natal')
    }
  })
  check(()=>{
    assert.ok(at('month').conflictingFactIds.some((id)=>producer.relations.find((r)=>r.relationFactId===id)?.kind==='stem-controls'))
    assert.ok(at('month').trace.some((t)=>t.reasonCodes.includes('INCOMING_CONTROL_RECORDED_NO_DAMAGE_ROLE_ASSIGNED')))
    assert.ok(at('month').contextEvidenceIds.some((id)=>result.evidence.records.some((e)=>e.evidenceId===id&&e.status==='provisional')))
  })
  check(()=>{
    assert.deepEqual(result.roleStates,[])
    assert.deepEqual(Object.keys(result).sort(),['candidates','evidence','roleStates'])
    assert.ok(!/score|percentage|weight|rootStrength/.test(JSON.stringify(result.candidates)))
    assert.ok(!sangShenCandidateSchema.is({...at('month'),percentage:100}))
    assert.ok(!/조후|억부|희용신/.test(moduleSource))
  })
  check(()=>{
    const changed=clone(input)
    changed.derived.authority.entries=changed.derived.authority.entries.filter((e)=>!['未','亥'].includes(e.branch))
    assert.deepEqual(helpers(changed).candidates,result.candidates)
    assert.ok(at('month').functionBasis.relationFactIds.every((id)=>producer.relations.find((r)=>r.relationFactId===id).participantEntityIds.every((id)=>producer.entities.find((e)=>e.entityId===id).origin==='natal')))
  })
  check(()=>{
    assert.equal(new Set(result.candidates.map((c)=>c.candidateId)).size,result.candidates.length)
    assert.deepEqual(finalize(upstream),input.yongShenResult)
    assert.deepEqual(yong(upstream).candidates,upstream.yongShenCandidates)
    assert.deepEqual(judge(upstream).judgment,upstream.patternJudgment)
    assert.deepEqual(candidates(upstream).candidates,upstream.candidates)
    assert.deepEqual(derive(upstream,sources),upstream.derived)
    assert.deepEqual(natalEvaluate(upstream),upstream.natalCombination)
    assert.equal(JSON.stringify(producer),saved)
  })

  check(()=>{
    const changed=clone(input),id=changed.derived.authority.ruleReceiptIds['I-07']
    for(const records of [changed.derived.evidence.records,changed.natalCombination.bundle.evidence.records,changed.yongShenResult.evidence.records]) {
      const e=records.find((e)=>e.evidenceId===id);if(e){e.status='provisional';e.uncertaintyIds=['test:receipt']}
    }
    assert.ok(helpers(changed).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input),id=changed.derived.authority.ruleReceiptIds['I-07']
    for(const records of [changed.derived.evidence.records,changed.natalCombination.bundle.evidence.records,changed.yongShenResult.evidence.records]) {
      const e=records.find((e)=>e.evidenceId===id);if(e)e.sourceRef.document.section='A-8-1.'
    }
    assert.ok(helpers(changed).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input),ids=at('month').functionBasis.rootFactIds
    changed.derived.roots.filter((f)=>ids.includes(f.id)).forEach((f)=>f.provenance.assessmentBasis.legacyFallback=true)
    assert.equal(at('month',helpers(changed)).status,'deferred')
  })
  console.log(`CS-005 sangshen candidates: ${checks} checks passed; candidates=${result.candidates.filter((c)=>c.status==='candidate').map((c)=>c.stem).join(',')}; no final role generated`)
} finally { await server.close() }
