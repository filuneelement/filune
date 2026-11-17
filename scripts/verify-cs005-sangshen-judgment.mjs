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

  const { evaluateSangShenJudgment: finalHelper, sangShenJudgmentSchema }=await load('judgment/evaluators/sangShenJudgment/index')
  const helperInput={...upstream,yongShenResult:finalize(upstream)},helperResult=helpers(helperInput)
  const input={...helperInput,sangShenCandidates:helperResult.candidates,sangShenEvidence:helperResult.evidence},before=JSON.stringify(input);freeze(input)
  const result=finalHelper(input)
  const at=(pos,out=result)=>out.judgments.find((j)=>producer.entities.find((e)=>e.entityId===j.entityId)?.position===pos)
  const diagnostic=(out=result)=>JSON.stringify({candidates:input.sangShenCandidates,judgments:out.judgments,assessment:out.judgments.map(j=>[j.stem,j.assessment]),evidence:out.evidence,trace:out.judgments.map(j=>j.trace)},null,2)
  const source=await readFile('src/lib/judgment/evaluators/sangShenJudgment/index.ts','utf8')
  check(()=>assert.equal(JSON.stringify(result),JSON.stringify(finalHelper(input))))
  check(()=>assert.equal(JSON.stringify(input),before))
  check(()=>{
    assert.ok(!/evaluateSangShenCandidates\(|evaluateYongShenJudgment\(|evaluatePatternJudgment\(|produceExposureRootFacts\(|calculateTenGod\(/.test(source))
    assert.ok(!/caseId|expectedPattern|CS-005/.test(source))
  })
  check(()=>{
    assert.equal(at('month').status,'confirmed',diagnostic())
    assert.equal(at('month').assessment,'confirmed');assert.equal(at('year').status,'rejected');assert.equal(at('day').status,'rejected');assert.equal(at('time').status,'rejected')
    for(const j of result.judgments){assert.ok(sangShenJudgmentSchema.is(j));assert.ok(!sangShenJudgmentSchema.is({...j,status:'candidate'}));assert.ok(!sangShenJudgmentSchema.is({...j,sourceRuleIds:[]}))}
  })
  check(()=>{
    const expected=C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n').find(line=>line.startsWith('7 상신\t')).split('\t')[1]
    assert.deepEqual(result.judgments.filter(j=>j.status==='confirmed').map(j=>j.stem),[expected],diagnostic())
  })
  check(()=>{
    const changed=clone(input);changed.sangShenCandidates.find(c=>c.entityId===at('month').entityId).assessment='provisional'
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input);delete changed.derived.authority.ruleReceiptIds['I-03']
    assert.ok(finalHelper(changed).judgments.every(j=>j.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input),id=at('month').functionBasis.relationFactIds[0]
    changed.producer.relations.find(r=>r.relationFactId===id).assessment='provisional'
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),c=changed.sangShenCandidates.find(c=>c.entityId===at('month').entityId)
    c.functionBasis.relationFactIds=c.functionBasis.relationFactIds.slice(0,1)
    assert.equal(c.status,'candidate');assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),c=changed.sangShenCandidates.find(c=>c.entityId===at('month').entityId)
    c.functionBasis.rootFactIds=[]
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),c=changed.sangShenCandidates.find(c=>c.entityId===at('month').entityId)
    c.relatedYongShenIds=[]
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),j=changed.yongShenResult.judgments.find(j=>j.judgmentId===at('month').relatedYongShenIds[0])
    j.status='deferred';j.assessment='provisional';j.uncertainty.blockingIds=['test:yong']
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input);changed.patternJudgment.status='deferred';changed.patternJudgment.assessment='provisional';changed.patternJudgment.uncertainty.blockingIds=['test:pattern']
    assert.ok(finalHelper(changed).judgments.every(j=>j.status==='deferred'))
  })
  function stateInput(kind) {
    // Supplied-state handoff only; this test does not introduce a natal weakening/stopping rule.
    const changed=clone(input),state=changed.natalCombination.states.find(s=>s.targetEntityId===at('month').entityId)
    state.functionalState=kind
    if(kind==='weakened')state.weakeningDescription={wording:'Supplied weakened handoff',ruleId:state.causingApplicationRefs[0].ruleId}
    Object.assign(changed.natalCombination.bundle.states.find(s=>s.stateId===state.stateId),clone(state))
    const candidate=changed.sangShenCandidates.find(c=>c.entityId===state.targetEntityId)
    Object.assign(candidate.runtimeStates.find(s=>s.stateId===state.stateId),clone(state))
    return changed
  }
  check(()=>{
    const out=finalHelper(stateInput('stopped')),j=at('month',out)
    assert.equal(j.status,'deferred');assert.equal(out.roleStates.length,0)
    assert.ok(j.trace.some(t=>t.ruleId==='I-02a'&&t.reasonCodes.includes('STOPPED_FUNCTION_DEFERRED_NOT_AUTOMATIC_REJECTION')))
  })
  check(()=>{
    const j=at('month',finalHelper(stateInput('weakened')))
    assert.equal(j.status,'confirmed');assert.ok(j.runtimeStates.some(s=>s.functionalState==='weakened'))
    assert.ok(j.trace.some(t=>t.reasonCodes.includes('WEAKENED_FUNCTION_RETAINED_NO_INVENTED_THRESHOLD')))
  })
  check(()=>{
    const changed=clone(input),state=changed.natalCombination.states.find(s=>s.targetEntityId===at('month').entityId)
    state.functionalState='stopped';Object.assign(changed.natalCombination.bundle.states.find(s=>s.stateId===state.stateId),clone(state))
    assert.ok(at('month',finalHelper(changed)).uncertainty.blockingIds.includes('CANDIDATE_CURRENT_STATE_HANDOFF_MISMATCH'))
  })
  check(()=>{
    for(const j of result.judgments){
      const c=input.sangShenCandidates.find(c=>c.entityId===j.entityId)
      assert.deepEqual(j.sourceCandidateIds,[c.candidateId]);assert.deepEqual(j.relatedYongShenIds,c.relatedYongShenIds)
      assert.deepEqual(j.conflictingFactIds,c.conflictingFactIds);assert.ok(c.supportingFactIds.every(id=>j.supportingFactIds.includes(id)))
      assert.ok(j.trace.every(t=>j.sourceRuleIds.includes(t.ruleId)))
      assert.ok(j.evidenceIds.every(id=>result.evidence.records.some(e=>e.evidenceId===id&&e.status==='confirmed')))
    }
  })
  check(()=>{
    assert.equal(result.roleStates.length,1);assert.equal(result.roleStates[0].role,'상신')
    assert.equal(result.roleStates[0].entityId,at('month').entityId);assert.ok(!result.roleStates[0].provisional)
    assert.equal(result.bundle.roles.filter(r=>r.role==='용신').length,input.yongShenResult.bundle.roles.filter(r=>r.role==='용신').length)
    const roles=result.bundle.roles.filter(r=>r.entityId===at('month').entityId)
    assert.ok(roles.some(r=>r.role==='용신')&&roles.some(r=>r.role==='상신'))
    assert.ok(!result.bundle.roles.some(r=>['병','구응'].includes(r.role)))
    assert.ok(contracts.validateContractBundle(result.bundle))
  })
  check(()=>{
    assert.ok(!/score|percentage|weight|rootStrength/.test(JSON.stringify(result.judgments)))
    assert.ok(!sangShenJudgmentSchema.is({...at('month'),percentage:100}))
    assert.ok(!/조후|억부|희용신/.test(source))
  })
  check(()=>{
    const id=input.derived.authority.ruleReceiptIds['I-03'],changed=clone(input)
    for(const records of [changed.derived.evidence.records,changed.natalCombination.bundle.evidence.records,changed.yongShenResult.evidence.records,changed.sangShenEvidence.records]){
      const r=records.find(r=>r.evidenceId===id);if(r){r.status='provisional';r.uncertaintyIds=['test:receipt']}
    }
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input);changed.sangShenCandidates=[]
    const out=finalHelper(changed);assert.equal(out.judgments.length,0);assert.equal(out.roleStates.length,0);assert.ok(out.deferred.length)
  })
  check(()=>{
    assert.deepEqual(helpers(helperInput),helperResult)
    assert.deepEqual(finalize(upstream),input.yongShenResult)
    assert.deepEqual(judge(upstream).judgment,input.patternJudgment)
    assert.equal(JSON.stringify(input),before);assert.equal(JSON.stringify(producer),saved)
  })

  check(()=>{
    const known=new Map([...producer.facts,...producer.relations.map(r=>({...r,id:r.relationFactId})),...input.derived.exposures,...input.derived.hiddenObservations,...input.derived.roots].map(f=>[f.id,f]))
    assert.ok(at('month').supportingFactIds.every(id=>known.get(id)?.assessment==='confirmed'))
    assert.deepEqual(result.bundle.states,input.natalCombination.bundle.states)
    assert.ok(result.roleStates.every(r=>result.applications.some(a=>a.applicationId===r.applicationRef.applicationId)))
  })
  check(()=>{
    const changed=clone(input),ids=at('month').functionBasis.rootFactIds
    changed.derived.roots.filter(r=>ids.includes(r.id)).forEach(r=>r.provenance.assessmentBasis.legacyFallback=true)
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),id=at('month').functionBasis.relationFactIds[0],relation=changed.producer.relations.find(r=>r.relationFactId===id)
    const previous=relation.sourceEntityId;relation.sourceEntityId=relation.targetEntityId;relation.targetEntityId=previous
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),j=changed.yongShenResult.judgments.find(j=>j.judgmentId===at('month').relatedYongShenIds[0])
    j.stem='乙'
    assert.equal(at('month',finalHelper(changed)).status,'deferred')
  })
  console.log(`CS-005 sangshen judgment: ${checks} checks passed; final=${result.judgments.filter(j=>j.status==='confirmed').map(j=>j.stem).join(',')}; no damage/rescue/fortune output`)
} finally { await server.close() }
