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
  const input=roleInput(producer),before=JSON.stringify(input);freeze(input)
  const result=finalize(input)
  const at=(pos,output=result,source=producer)=>output.judgments.find((j)=>source.entities.find((e)=>e.entityId===j.entityId).position===pos)
  const known=new Map([...producer.facts,...input.derived.hiddenObservations,...input.derived.exposures,...input.derived.roots].map((f)=>[f.id,f]))
  const diagnostic=(output=result,source=input)=>JSON.stringify({pattern:source.patternJudgment,candidates:source.yongShenCandidates,judgments:output.judgments,evidence:output.evidence,trace:output.judgments.map((j)=>j.trace)},null,2)
  const moduleSource=await readFile('src/lib/judgment/evaluators/yongShenJudgment/index.ts','utf8')
  check(()=>assert.equal(JSON.stringify(result),JSON.stringify(finalize(input))))
  check(()=>assert.equal(JSON.stringify(input),before))
  check(()=>{
    assert.ok(!moduleSource.includes('evaluateYongShenCandidates(')&&!moduleSource.includes('evaluatePatternJudgment('))
    assert.ok(!moduleSource.includes('calculateTenGod(')&&!moduleSource.includes('produceExposureRootFacts('))
    assert.ok(!moduleSource.includes('caseId')&&!moduleSource.includes('expectedPattern'))
  })
  check(()=>{
    assert.equal(at('year').status,'confirmed',diagnostic())
    assert.equal(at('month').status,'confirmed',diagnostic())
    assert.equal(at('day').status,'rejected');assert.equal(at('time').status,'rejected')
    assert.equal(at('year').assessment,'confirmed');assert.equal(at('month').assessment,'confirmed')
    assert.equal(result.judgments.filter((j)=>j.status==='deferred').length,0)
    for(const j of result.judgments) {
      assert.ok(yongShenJudgmentSchema.is(j))
      assert.ok(!yongShenJudgmentSchema.is({...j,status:'candidate'}))
      assert.ok(!yongShenJudgmentSchema.is({...j,sourceRuleIds:[]}))
    }
  })
  check(()=>{
    const changed=clone(input),c=changed.yongShenCandidates.find((c)=>c.entityId===at('year').entityId)
    c.assessment='provisional'
    const output=finalize(changed)
    assert.equal(at('year',output).status,'deferred')
    assert.ok(!output.roleStates.some((r)=>r.entityId===c.entityId))
    assert.equal(c.status,'candidate')
  })
  check(()=>{
    const changed=clone(input),c=changed.yongShenCandidates.find((c)=>c.entityId===at('month').entityId)
    c.status='deferred'
    assert.equal(at('month',finalize(changed)).status,'deferred')
    c.status='rejected'
    assert.equal(at('month',finalize(changed)).status,'deferred')
  })
  check(()=>{
    const changed=clone(input),c=changed.yongShenCandidates.find((c)=>c.entityId===at('year').entityId)
    c.sourceRuleIds=['C-10']
    assert.equal(at('year',finalize(changed)).status,'deferred')
    const missing=clone(input);delete missing.derived.authority.ruleReceiptIds['I-02']
    assert.ok(finalize(missing).judgments.every((j)=>j.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input),f=changed.derived.exposures.find((f)=>f.monthCommand&&f.exposed)
    f.assessment='provisional'
    const out=finalize(changed)
    assert.ok(out.judgments.every((j)=>j.status==='deferred'))
    assert.equal(out.roleStates.length,0)
  })
  check(()=>{
    const changed=clone(input),id=changed.derived.authority.ruleReceiptIds['I-04-1']
    for(const records of [changed.derived.evidence.records,changed.natalCombination.bundle.evidence.records,changed.judgmentEvidence.records,changed.candidateEvidence.records]) {
      const r=records.find((r)=>r.evidenceId===id)
      if(r){r.status='provisional';r.uncertaintyIds=['test:rule-not-confirmed']}
    }
    assert.ok(finalize(changed).judgments.every((j)=>j.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input)
    changed.patternJudgment.status='deferred';changed.patternJudgment.assessment='provisional';changed.patternJudgment.uncertainty.blockingIds=['test:pattern-not-confirmed']
    const out=finalize(changed)
    assert.ok(out.judgments.every((j)=>j.status==='deferred'))
    assert.equal(out.roleStates.length,0)
  })
  check(()=>{
    for(const j of result.judgments) {
      const source=input.yongShenCandidates.find((c)=>c.entityId===j.entityId)
      assert.deepEqual(j.sourceCandidateIds,[source.candidateId])
      assert.deepEqual(j.conflictingFactIds,source.conflictingFactIds)
      assert.ok(source.supportingFactIds.every((id)=>j.supportingFactIds.includes(id)))
      assert.ok(j.trace.every((t)=>t.candidateIds.every((id)=>input.yongShenCandidates.some((c)=>c.candidateId===id))))
      assert.ok(j.trace.every((t)=>j.sourceRuleIds.includes(t.ruleId)))
      assert.ok(j.evidenceIds.every((id)=>result.evidence.records.find((r)=>r.evidenceId===id)?.status==='confirmed'))
      if(j.status==='confirmed')assert.ok(j.supportingFactIds.every((id)=>known.get(id)?.assessment==='confirmed'))
    }
  })
  check(()=>{
    assert.equal(result.roleStates.length,2)
    assert.ok(result.roleStates.every((r)=>r.role==='용신'&&r.status==='evaluated'&&!r.provisional))
    assert.ok(result.roleStates.every((r)=>r.applicationRef&&result.applications.some((a)=>a.applicationId===r.applicationRef.applicationId)))
    assert.ok(result.judgments.filter((j)=>j.status==='confirmed').every((j)=>result.roleStates.some((r)=>r.roleStateId===j.roleStateRef&&r.entityId===j.entityId)))
    assert.ok(contracts.validateContractBundle(result.bundle))
  })
  check(()=>{
    assert.ok(!/score|percentage|weight|rootStrength/.test(JSON.stringify(result.judgments)))
    assert.ok(!yongShenJudgmentSchema.is({...at('year'),percentage:100}))
    assert.ok(!result.roleStates.some((r)=>['상신','병','구응'].includes(r.role)))
    assert.ok(result.judgments.every((j)=>!('favorable'in j)&&!('verdict'in j)))
  })
  check(()=>{
    const cell=C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n').find((line)=>line.startsWith('4 천간 용신·투출\t')).split('\t')[1]
    const positions={'년간':'year','월간':'month','시간':'time'}
    const expected=[...cell.matchAll(/([甲乙丙丁戊己庚辛壬癸])\((년간|월간|시간)\)/g)].map((m)=>[m[1],positions[m[2]]]).sort()
    const actual=result.judgments.filter((j)=>j.status==='confirmed').map((j)=>[j.stem,producer.entities.find((e)=>e.entityId===j.entityId).position]).sort()
    assert.ok(expected.length)
    assert.deepEqual(actual,expected,diagnostic())
    assert.equal(result.roleStates.length,expected.length,diagnostic())
  })
  check(()=>{
    const cBefore=JSON.stringify(input.yongShenCandidates),pBefore=JSON.stringify(input.patternJudgment),nBefore=JSON.stringify(input.natalCombination)
    finalize(input)
    const upstream=yong(input)
    assert.deepEqual(upstream.candidates,input.yongShenCandidates)
    assert.deepEqual(judge(input).judgment,input.patternJudgment)
    assert.equal(JSON.stringify(input.yongShenCandidates),cBefore)
    assert.equal(JSON.stringify(input.patternJudgment),pBefore)
    assert.equal(JSON.stringify(input.natalCombination),nBefore)
  })
  function synthetic(values,branch='寅') {
    const facts=clone(chart),day=values[2]
    for(const [i,pos]of ['year','month','day','time'].entries()) {
      const pillar=facts.chart.pillars[pos].value;pillar.stem=values[i];if(pos==='month')pillar.branch=branch;pillar.ganZhi=pillar.stem+pillar.branch
      facts.chart.basicRelations[pos].value.stemTenGod=calculateTenGod(day,pillar.stem)
      facts.chart.basicRelations[pos].value.relationships=calculateDayRelationships(day,pillar.branch)
    }
    return roleInput(p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}}))
  }
  check(()=>{
    const source=synthetic(['甲','丙','戊','辛']),out=finalize(source)
    const month=at('month',out,source.producer),year=at('year',out,source.producer)
    assert.equal(month.status,'deferred')
    assert.equal(month.runtimeState.functionalState,'stopped')
    assert.ok(month.functionBasis.exposureFactIds.length)
    assert.ok(month.trace.some((t)=>t.ruleId==='I-02a'&&t.reasonCodes.includes('STOPPED_CLASSIFICATION_RETAINED_NO_AUTOMATIC_REJECTION')))
    assert.equal(year.status,'confirmed')
    assert.ok(!out.roleStates.some((r)=>r.entityId===month.entityId))
  })
  check(()=>{
    // Supplied-state handoff test, not a new natal weakening rule.
    const changed=clone(input),state=changed.natalCombination.states.find((s)=>s.targetEntityId===at('month').entityId)
    state.functionalState='weakened';state.weakeningDescription={wording:'Supplied weakened state for handoff',ruleId:state.causingApplicationRefs[0].ruleId}
    Object.assign(changed.natalCombination.bundle.states.find((s)=>s.stateId===state.stateId),clone(state))
    const refreshed=yong(changed);changed.yongShenCandidates=refreshed.candidates;changed.candidateEvidence=refreshed.evidence
    const out=finalize(changed)
    assert.equal(at('month',out).status,'confirmed')
    assert.equal(at('month',out).runtimeState.functionalState,'weakened')
    assert.ok(at('month',out).trace.some((t)=>t.reasonCodes.includes('WEAKENED_STATE_RETAINED_NO_INVENTED_THRESHOLD')))
  })
  check(()=>{
    const changed=clone(input),c=changed.yongShenCandidates.find((c)=>c.entityId===at('year').entityId)
    c.roleBasis.exposureFactIds=[]
    assert.equal(at('year',finalize(changed)).status,'deferred')
    assert.equal(c.roleBasis.runtimeState.functionalState,'active')
  })
  check(()=>{
    const changed=clone(input),c=changed.yongShenCandidates.find((c)=>c.entityId===at('year').entityId)
    changed.yongShenCandidates=changed.yongShenCandidates.filter((s)=>s!==c)
    assert.ok(finalize(changed).judgments.every((j)=>j.status==='deferred'))
    const empty=clone(input);empty.yongShenCandidates=[]
    const result=finalize(empty)
    assert.equal(result.judgments.length,0);assert.equal(result.roleStates.length,0)
    assert.ok(result.deferred.some((r)=>r.reasonCode==='SOURCE_CANDIDATE_LIST_EMPTY'))
  })
  check(()=>{
    const changed=clone(input);changed.derived.roots=[]
    const out=finalize(changed)
    assert.deepEqual(out.judgments.map((j)=>[j.entityId,j.status]),result.judgments.map((j)=>[j.entityId,j.status]))
    assert.ok(at('year',out).uncertainty.contextIds.some((r)=>r.startsWith('CONTEXT_FACT_UNAVAILABLE:')))
  })
  check(()=>{
    const changed=clone(input),id=at('year').entityId,f=changed.producer.facts.find((f)=>f.id===producer.entities.find((e)=>e.entityId===id).canonicalFactRef)
    f.assessment='unknown';f.uncertaintyIds=['test:parent-unknown']
    const out=finalize(changed)
    assert.equal(at('year',out).status,'deferred');assert.equal(at('year',out).assessment,'unknown')
  })
  check(()=>{
    const reordered=clone(input);reordered.yongShenCandidates.reverse()
    assert.deepEqual(finalize(reordered),result)
    const duplicate=clone(input);duplicate.yongShenCandidates.push(clone(duplicate.yongShenCandidates[0]))
    assert.throws(()=>finalize(duplicate),/Duplicate source candidate/)
    const wrongScope=clone(input);wrongScope.context.stage='monthlyLuck'
    assert.throws(()=>finalize(wrongScope),/natal/)
  })
  check(()=>{
    const changed=clone(input),c=changed.yongShenCandidates.find((c)=>c.entityId===at('month').entityId)
    c.roleBasis.handlingRequirement='역용 구조 검토'
    assert.equal(at('month',finalize(changed)).status,'deferred')
    const uncertain=clone(input);uncertain.yongShenCandidates.find((c)=>c.entityId===at('year').entityId).uncertainty.blockingIds=['test:pending-review']
    assert.equal(at('year',finalize(uncertain)).status,'deferred')
    const missing=clone(input);delete missing.yongShenCandidates[0].uncertainty
    assert.throws(()=>finalize(missing),/object/)
  })
  console.log(`CS-005 yongshen judgment: ${checks} checks passed; C-10-1 visible yongshen set confirmed; only yongshen RoleState emitted.`)
} finally { await server.close() }
