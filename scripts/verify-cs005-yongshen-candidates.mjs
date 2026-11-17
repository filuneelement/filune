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
  const input=ready(producer),before=JSON.stringify(input);freeze(input)
  const result=yong(input)
  const at=(position,output=result,source=producer)=>output.candidates.find((c)=>source.entities.find((e)=>e.entityId===c.entityId).position===position)
  const summary=(out)=>out.candidates.map((c)=>[c.stem,c.status,c.assessment,c.roleBasis.tenGod,c.roleBasis.handlingRequirement]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  const diagnostic=(out=result,source=input)=>JSON.stringify({judgment:source.patternJudgment,candidates:out.candidates,evidence:out.evidence},null,2)
  const moduleSource=await readFile('src/lib/judgment/evaluators/yongShenCandidates/index.ts','utf8')
  check(()=>assert.equal(JSON.stringify(result),JSON.stringify(yong(input))))
  check(()=>assert.equal(JSON.stringify(input),before))
  check(()=>{
    assert.ok(!moduleSource.includes('evaluatePatternJudgment(')&&!moduleSource.includes('evaluatePatternCandidates('))
    assert.ok(!moduleSource.includes('calculateTenGod(')&&!moduleSource.includes('produceExposureRootFacts('))
    assert.ok(!moduleSource.includes('caseId')&&!moduleSource.includes('expectedPattern'))
  })
  check(()=>{
    for(const c of result.candidates) {
      assert.ok(yongShenCandidateSchema.is(c))
      assert.ok(!yongShenCandidateSchema.is({...c,status:'confirmed'}))
      assert.ok(!yongShenCandidateSchema.is({...c,sourceRuleIds:[]}))
      assert.ok(!yongShenCandidateSchema.is({...c,score:1}))
    }
    assert.ok(!result.candidates.some((c)=>c.status==='confirmed'))
  })
  check(()=>{
    assert.equal(at('year').status,'candidate',diagnostic())
    assert.equal(at('month').status,'candidate',diagnostic())
    assert.equal(at('year').assessment,'confirmed')
    assert.equal(at('month').assessment,'confirmed')
    assert.equal(at('year').roleBasis.handlingRequirement,'역용 구조 검토')
    assert.equal(at('month').roleBasis.handlingRequirement,'순용 구조 검토')
    assert.equal(at('day').status,'rejected')
    assert.ok(at('day').trace.some((t)=>t.reasonCodes.includes('I02_DAY_STEM_EXCLUDED')))
    assert.equal(at('time').status,'rejected')
    assert.ok(at('time').trace.some((t)=>t.reasonCodes.includes('I02_NOT_A_CONFIRMED_MONTH_EXPOSURE_COMPONENT')))
  })
  check(()=>{
    const changed=clone(input)
    changed.patternJudgment.status='deferred';changed.patternJudgment.assessment='provisional';changed.patternJudgment.uncertainty.blockingIds=['test:unconfirmed-pattern']
    const output=yong(changed)
    assert.ok(output.candidates.every((c)=>c.status==='deferred'))
    assert.ok(!output.candidates.some((c)=>c.status==='candidate'))
  })
  check(()=>{
    const changed=clone(input),core=changed.derived.exposures.find((f)=>f.monthCommand&&f.exposed)
    core.assessment='provisional'
    assert.ok(yong(changed).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const changed=clone(input),main=changed.derived.hiddenObservations.find((h)=>h.id===changed.candidates.find((c)=>c.patternType==='월령본기격').basis.mainHiddenObservationId)
    main.assessment='unknown';main.uncertaintyIds=['test:unknown-main']
    assert.ok(yong(changed).candidates.every((c)=>c.status==='deferred'&&c.assessment==='unknown'))
  })
  check(()=>{
    const changed=clone(input);delete changed.derived.authority.ruleReceiptIds['I-03']
    assert.ok(yong(changed).candidates.every((c)=>c.status==='deferred'))
    const wrong=clone(input);wrong.derived.authority.ruleReceiptIds['I-04-1']=wrong.derived.authority.ruleReceiptIds['I-02']
    assert.ok(yong(wrong).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const allowed=['I-01','I-02','I-02a','C-10','I-03','I-04-1']
    for(const c of result.candidates) {
      assert.ok(c.sourceRuleIds.every((id)=>allowed.includes(id)&&A.includes(id)))
      assert.ok(c.trace.every((t)=>allowed.includes(t.ruleId)&&t.reasonCodes.length))
      assert.ok(c.evidenceIds.every((id)=>result.evidence.records.find((r)=>r.evidenceId===id)?.status==='confirmed'))
    }
    assert.ok(!/score|percentage|weight|rootStrength/.test(JSON.stringify(result.candidates)))
  })
  check(()=>{
    assert.deepEqual(result.roleStates,[])
    assert.deepEqual(Object.keys(result).sort(),['candidates','evidence','roleStates'].sort())
    assert.ok(result.candidates.every((c)=>!('roles'in c)&&!('finalRole'in c)&&!('supportingGod'in c)&&!('verdict'in c)))
  })
  check(()=>{
    const known=new Set([...producer.facts,...input.derived.hiddenObservations,...input.derived.exposures,...input.derived.roots].map((f)=>f.id))
    input.natalCombination.states.forEach((s)=>known.add(s.stateId));input.natalCombination.relations.forEach((r)=>known.add(r.relationFactId))
    for(const c of result.candidates) {
      assert.deepEqual(c.provenance.producerRef,producer.producerRef)
      assert.equal(c.roleBasis.sourceJudgmentId,input.patternJudgment.judgmentId)
      assert.ok(c.roleBasis.sourcePatternCandidateIds.every((id)=>input.patternJudgment.sourceCandidateIds.includes(id)))
      assert.ok([...c.supportingFactIds,...c.conflictingFactIds,...c.contextFactIds].every((id)=>known.has(id)))
      assert.ok(c.evidenceIds.every((id)=>result.evidence.records.some((r)=>r.evidenceId===id)))
    }
    assert.equal(new Set(result.candidates.map((c)=>c.candidateId)).size,result.candidates.length)
  })
  check(()=>{
    const cell=C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n').find((line)=>line.startsWith('4 천간 용신·투출\t')).split('\t')[1]
    const positions={'년간':'year','월간':'month','시간':'time'},roles={'본기':'main','중기':'middle','여기':'residual'}
    const expected=[...cell.matchAll(/([甲乙丙丁戊己庚辛壬癸])\((년간|월간|시간)\) (본기|중기|여기) 투출/g)].map((m)=>[m[1],positions[m[2]],roles[m[3]]]).sort()
    const actual=result.candidates.filter((c)=>c.status==='candidate').map((c)=>[c.stem,producer.entities.find((e)=>e.entityId===c.entityId).position,input.derived.exposures.find((f)=>f.id===c.roleBasis.exposureFactIds[0]).hiddenStemRole]).sort()
    assert.ok(expected.length>0)
    assert.deepEqual(actual,expected,diagnostic())
    // C's final roles/supporting-god cell is never consumed by this evaluator.
  })
  check(()=>{
    const jBefore=JSON.stringify(input.patternJudgment),nBefore=JSON.stringify(input.natalCombination),dBefore=JSON.stringify(input.derived)
    yong(input)
    const recalculatedForRegression=judge({producer,derived:input.derived,natalCombination:input.natalCombination,context:input.context,candidates:input.candidates})
    assert.deepEqual(recalculatedForRegression.judgment,input.patternJudgment)
    assert.equal(JSON.stringify(input.patternJudgment),jBefore)
    assert.equal(JSON.stringify(input.natalCombination),nBefore)
    assert.equal(JSON.stringify(input.derived),dBefore)
  })
  check(()=>{
    const changed=clone(input);changed.derived.roots=[]
    assert.deepEqual(summary(yong(changed)),summary(result))
    changed.derived.authority.entries=changed.derived.authority.entries.filter((e)=>!['未','亥'].includes(e.branch))
    assert.deepEqual(summary(yong(changed)),summary(result))
  })
  function synthetic(values,branch='寅') {
    const facts=clone(chart),day=values[2]
    for(const [i,pos]of ['year','month','day','time'].entries()) {
      const pillar=facts.chart.pillars[pos].value
      pillar.stem=values[i];if(pos==='month')pillar.branch=branch;pillar.ganZhi=pillar.stem+pillar.branch
      facts.chart.basicRelations[pos].value.stemTenGod=calculateTenGod(day,pillar.stem)
      facts.chart.basicRelations[pos].value.relationships=calculateDayRelationships(day,pillar.branch)
    }
    return ready(p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}}))
  }
  check(()=>{
    const source=synthetic(['甲','丙','戊','辛']),output=yong(source)
    const month=at('month',output,source.producer),year=at('year',output,source.producer)
    assert.equal(month.roleBasis.runtimeState.functionalState,'stopped')
    assert.equal(month.status,'deferred')
    assert.ok(month.trace.some((t)=>t.ruleId==='I-02a'&&t.reasonCodes.includes('EXPOSURE_RETAINED_FUNCTION_STOPPED_NO_AUTOMATIC_REJECTION')))
    assert.ok(month.roleBasis.exposureFactIds.length)
    assert.equal(year.status,'candidate')
    assert.equal(source.patternJudgment.status,'confirmed')
  })
  check(()=>{
    // Contract handoff fixture only; it does not add a natal weakening rule.
    const changed=clone(input),id=at('month').entityId,state=changed.natalCombination.states.find((s)=>s.targetEntityId===id)
    state.functionalState='weakened';state.weakeningDescription={wording:'Supplied weakened state for handoff only',ruleId:state.causingApplicationRefs[0].ruleId}
    const c=at('month',yong(changed))
    assert.equal(c.status,'candidate')
    assert.equal(c.roleBasis.runtimeState.functionalState,'weakened')
    assert.ok(c.trace.some((t)=>t.reasonCodes.includes('WEAKENED_FUNCTION_RETAINED_NO_INVENTED_THRESHOLD')))
  })
  check(()=>{
    const changed=clone(input),id=at('month').entityId,state=changed.natalCombination.states.find((s)=>s.targetEntityId===id)
    state.functionalState='unknown';state.transition='unresolved';state.uncertaintyIds=['test:unknown-function']
    const c=at('month',yong(changed))
    assert.equal(c.status,'deferred');assert.equal(c.assessment,'unknown')
  })
  check(()=>{
    const source=synthetic(['甲','丙','丙','戊']),output=yong(source)
    assert.equal(at('month',output,source.producer).status,'rejected')
    assert.ok(at('month',output,source.producer).trace.some((t)=>t.reasonCodes.includes('I02_PEER_NOT_INDEPENDENT')))
  })
  check(()=>{
    const source=synthetic(['丙','甲','甲','壬']),output=yong(source)
    assert.ok(output.candidates.every((c)=>c.status==='deferred'))
    assert.ok(!output.candidates.some((c)=>c.status==='candidate'))
  })
  check(()=>{
    const changed=clone(input);changed.context.stage='monthlyLuck'
    assert.throws(()=>yong(changed),/natal/)
    const conflict=clone(input);conflict.judgmentEvidence.records[0].note='different-evidence'
    assert.throws(()=>yong(conflict),/Conflicting evidence/)
  })
  console.log(`CS-005 yongshen candidates: ${checks} checks passed; C-10-1 visible candidate structure matched; no final role assigned.`)
} finally { await server.close() }
