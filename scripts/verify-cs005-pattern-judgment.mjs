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
  const awaitJudgeSource=await readFile('src/lib/judgment/evaluators/patternJudgment/index.ts','utf8')
  const prepared=prepare(producer)
  const supplied=candidates(prepared)
  const input={...prepared,candidates:supplied.candidates}
  const before=JSON.stringify(input); freeze(input)
  const actual=judge(input), j=actual.judgment
  const diagnostic=(output=actual,source=input)=>JSON.stringify({candidates:source.candidates,rules:output.judgment.sourceRuleIds,factAssessments:source.candidates.map((c)=>c.inputAssessments),evidence:output.evidence,trace:output.judgment.trace,judgment:output.judgment},null,2)
  const known=new Map([...producer.facts,...prepared.derived.hiddenObservations,...prepared.derived.exposures,...prepared.derived.roots].map((f)=>[f.id,f]))
  check(()=>assert.equal(JSON.stringify(actual),JSON.stringify(judge(input))))
  check(()=>assert.equal(JSON.stringify(input),before))
  check(()=>{
    assert.equal(j.status,'confirmed',diagnostic())
    assert.equal(j.assessment,'confirmed')
    assert.ok(patternJudgmentSchema.is(j))
    assert.ok(!patternJudgmentSchema.is({...j,status:'candidate'}))
    assert.ok(!patternJudgmentSchema.is({...j,sourceCandidateIds:[]}))
    assert.ok(!patternJudgmentSchema.is({...j,evidenceIds:[]}))
    assert.ok(!patternJudgmentSchema.is({...j,uncertainty:{blockingIds:['missing'],contextIds:[]}}))
  })
  check(()=>{
    const missing=clone(input);missing.candidates=[]
    assert.equal(judge(missing).judgment.status,'deferred')
    const noCombined=clone(input);noCombined.candidates=noCombined.candidates.filter((c)=>c.patternType!=='겸격')
    const output=judge(noCombined).judgment
    assert.equal(output.status,'deferred')
    assert.ok(output.uncertainty.blockingIds.includes('COMBINED_CANDIDATE_UNAVAILABLE_OR_AMBIGUOUS'))
  })
  check(()=>{
    assert.ok(j.evidenceIds.length)
    assert.ok(j.evidenceIds.every((id)=>actual.evidence.records.find((r)=>r.evidenceId===id)?.status==='confirmed'))
    assert.ok(j.supportingFactIds.every((id)=>known.get(id)?.assessment==='confirmed'))
    assert.ok(j.contextEvidenceIds.some((id)=>actual.evidence.records.find((r)=>r.evidenceId===id)?.status==='provisional'))
    assert.equal(j.uncertainty.blockingIds.length,0)
  })
  check(()=>{
    const changed=clone(input)
    const f=changed.derived.hiddenObservations.find((h)=>h.id===changed.candidates.find((c)=>c.patternType==='월령본기격').basis.mainHiddenObservationId)
    f.assessment='provisional'
    const result=judge(changed).judgment
    assert.equal(result.status,'deferred');assert.equal(result.assessment,'provisional')
    assert.ok(result.uncertainty.blockingIds.some((r)=>r.includes(f.id)))
  })
  check(()=>{
    const changed=clone(input)
    const f=changed.derived.exposures.find((f)=>f.monthCommand&&f.exposed)
    f.assessment='provisional'
    assert.equal(judge(changed).judgment.status,'deferred')
  })
  check(()=>{
    const changed=clone(input)
    const f=changed.derived.exposures.find((f)=>f.monthCommand&&f.exposed)
    const receipt=changed.derived.evidence.records.find((r)=>r.verification.claimRef===f.id)
    receipt.status='provisional';receipt.uncertaintyIds=['test:receipt-not-confirmed']
    const result=judge(changed).judgment
    assert.equal(result.status,'deferred')
    assert.ok(!result.evidenceIds.includes(receipt.evidenceId))
  })
  check(()=>{
    const changed=clone(input),id=changed.derived.authority.ruleReceiptIds['I-01']
    changed.derived.evidence.records=changed.derived.evidence.records.filter((r)=>r.evidenceId!==id)
    assert.equal(judge(changed).judgment.status,'deferred')
  })
  check(()=>{
    const changed=clone(input),f=changed.derived.exposures.find((f)=>f.monthCommand&&!f.dayStemExcluded&&!f.exposed)
    changed.derived.exposures=changed.derived.exposures.filter((r)=>r.id!==f.id)
    assert.equal(judge(changed).judgment.status,'deferred')
  })
  check(()=>{
    assert.deepEqual(j.sourceCandidateIds,[...input.candidates.map((c)=>c.candidateId)].sort())
    assert.deepEqual(j.trace.map((t)=>t.candidateId).sort(),j.sourceCandidateIds)
    for(const c of input.candidates) {
      const t=j.trace.find((t)=>t.candidateId===c.candidateId)
      assert.deepEqual(t.supportingFactIds,c.supportingFactIds)
      assert.deepEqual(t.conflictingFactIds,c.conflictingFactIds)
      assert.deepEqual(t.sourceRuleIds,c.sourceRuleIds)
      assert.ok(t.reasonCodes.length)
    }
  })
  check(()=>{
    const all=new Set([...known.keys(),...input.natalCombination.states.map((s)=>s.stateId),...input.natalCombination.relations.map((r)=>r.relationFactId)])
    assert.ok([...j.supportingFactIds,...j.conflictingFactIds,...j.contextFactIds].every((id)=>all.has(id)))
    assert.deepEqual(j.conflictingFactIds,[...new Set(input.candidates.flatMap((c)=>c.conflictingFactIds))].sort())
    assert.ok(j.trace.filter((t)=>['정격','변격'].includes(t.patternType)).every((t)=>t.status==='rejected'))
    assert.equal(j.trace.find((t)=>t.patternType==='월령본기격').status,'confirmed')
    assert.equal(j.trace.find((t)=>t.patternType==='겸격').status,'confirmed')
  })
  check(()=>{
    assert.deepEqual(j.sourceRuleIds.sort(),['C-10','I-01','I-02','I-02a'].sort())
    assert.ok(j.trace.every((t)=>t.sourceRuleIds.every((id)=>j.sourceRuleIds.includes(id))))
    assert.ok(j.evidenceIds.every((id)=>actual.evidence.records.some((r)=>r.evidenceId===id)))
  })
  check(()=>{
    assert.ok(!patternJudgmentSchema.is({...j,score:1}))
    assert.ok(!patternJudgmentSchema.is({...j,percentage:100}))
    assert.ok(!/score|percentage|weight|rootStrength/.test(JSON.stringify(j)))
    assert.deepEqual(actual.roleStates,[])
    assert.deepEqual(Object.keys(actual).sort(),['judgment','evidence','roleStates'].sort())
    assert.ok(!('roles' in j)&&!('verdict' in j)&&!('supportingGod' in j))
  })
  check(()=>{
    const rows=C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n')
    const monthExpected=rows.find((line)=>line.startsWith('3 지지 격\t')).split('\t')[1]
    const classificationExpected=rows.find((line)=>line.startsWith('5 정격·변격·겸격\t')).split('\t')[1]
    const names={'比肩':'비견','劫財':'겁재','食神':'식신','傷官':'상관','偏財':'편재','正財':'정재','偏官':'칠살','正官':'정관','偏印':'편인','印綬':'정인'}
    assert.equal(names[j.monthPatternTenGod]+'격',monthExpected,diagnostic())
    const match=/^(정격|변격|겸격)\(([^)]+)\)/.exec(classificationExpected)
    assert.ok(match,diagnostic())
    assert.equal(j.patternType,match[1],diagnostic())
    assert.deepEqual(j.componentTenGods.map((v)=>names[v]).sort(),match[2].split('+').map((v)=>v.trim()).sort(),diagnostic())
    assert.equal(j.status,'confirmed',diagnostic())
    // The rest of the C cell (유정/성패) is outside this structural judgment.
  })
  check(()=>{
    const natalBefore=JSON.stringify(input.natalCombination),derivedBefore=JSON.stringify(input.derived),candidateBefore=JSON.stringify(supplied)
    const luckBefore=evaluate({producer,context:input.context})
    judge(input)
    assert.equal(JSON.stringify(input.natalCombination),natalBefore)
    assert.equal(JSON.stringify(input.derived),derivedBefore)
    assert.equal(JSON.stringify(candidates(prepared)),candidateBefore)
    assert.deepEqual(natalEvaluate({producer,context:input.context}),input.natalCombination)
    assert.deepEqual(derive({producer,context:input.context},sources),input.derived)
    assert.deepEqual(evaluate({producer,context:input.context}),luckBefore)
  })
  function synthetic(values,branch='寅') {
    const facts=clone(chart),day=values[2]
    for(const [i,pos]of ['year','month','day','time'].entries()) {
      const pillar=facts.chart.pillars[pos].value
      pillar.stem=values[i];if(pos==='month')pillar.branch=branch;pillar.ganZhi=pillar.stem+pillar.branch
      const rel=facts.chart.basicRelations[pos].value
      rel.stemTenGod=calculateTenGod(day,pillar.stem);rel.relationships=calculateDayRelationships(day,pillar.branch)
    }
    const output=p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}})
    const prepared=prepare(output)
    return {...prepared,candidates:candidates(prepared).candidates}
  }
  check(()=>{
    const source=synthetic(['甲','丙','戊','辛']),result=judge(freeze(source)).judgment
    assert.equal(source.natalCombination.states.filter((s)=>s.functionalState==='stopped').length,2)
    assert.equal(result.status,'confirmed',diagnostic({judgment:result,evidence:actual.evidence},source))
    assert.equal(result.patternType,'겸격')
    const combined=result.trace.find((t)=>t.patternType==='겸격')
    assert.equal(combined.status,'confirmed')
    assert.ok(combined.reasonCodes.includes('I02A_STOPPED_EXPOSURE_CLASSIFICATION_RETAINED'))
    assert.ok(combined.sourceRuleIds.includes('I-02a'))
    assert.ok(result.conflictingFactIds.some((id)=>source.natalCombination.states.some((s)=>s.stateId===id&&s.functionalState==='stopped')))
  })
  check(()=>{
    // Contract-level handoff only: no new natal weakening rule is asserted.
    const source=clone(input),state=source.natalCombination.states.find((s)=>s.targetEntityId===producer.entities.find((e)=>e.origin==='natal'&&e.position==='month'&&e.part==='stem').entityId)
    state.functionalState='weakened';state.weakeningDescription={wording:'Supplied state for handoff test',ruleId:state.causingApplicationRefs[0].ruleId}
    const result=judge(source).judgment
    assert.equal(result.status,'confirmed')
    assert.ok(result.trace.find((t)=>t.patternType==='겸격').reasonCodes.includes('I02_WEAKENING_IS_CONTEXT_NO_DOCUMENTED_PATTERN_EXCLUSION'))
  })
  check(()=>{
    const result=judge(synthetic(['甲','壬','戊','辛'])).judgment
    assert.equal(result.patternType,'정격');assert.equal(result.status,'confirmed')
    assert.deepEqual(result.componentTenGods,['偏官'])
  })
  check(()=>{
    const result=judge(synthetic(['壬','丙','戊','辛'])).judgment
    assert.equal(result.patternType,'변격');assert.equal(result.status,'deferred')
    assert.ok(result.uncertainty.blockingIds.includes('I02_VARIANT_REVIEW_HAS_NO_ADDITIONAL_CONFIRMATION_BASIS'))
  })
  check(()=>{
    const result=judge(synthetic(['甲','丙','丙','戊'])).judgment
    assert.equal(result.status,'confirmed')
    assert.ok(!result.componentTenGods.some((g)=>['比肩','劫財'].includes(g)))
    assert.ok(result.trace.some((t)=>t.status==='rejected'&&t.reasonCodes.includes('UPSTREAM_CANDIDATE_REJECTED')))
  })
  check(()=>assert.equal(judge(synthetic(['丙','甲','甲','壬'])).judgment.status,'deferred'))
  check(()=>{
    const changed=clone(input)
    changed.derived.authority.entries=changed.derived.authority.entries.filter((e)=>e.branch!=='未')
    assert.deepEqual(judge(changed),actual)
  })
  check(()=>{
    const changed=clone(input),main=changed.derived.hiddenObservations.find((f)=>f.id===input.candidates.find((c)=>c.patternType==='월령본기격').basis.mainHiddenObservationId)
    main.assessment='unknown';main.uncertaintyIds=['test:unknown-main']
    assert.equal(judge(changed).judgment.assessment,'unknown')
    const duplicate=clone(input);duplicate.candidates.push(clone(duplicate.candidates[0]))
    assert.throws(()=>judge(duplicate),/Duplicate candidate/)
  })
  check(()=>{
    const reversed=clone(input);reversed.candidates.reverse()
    assert.deepEqual(judge(reversed),actual)
    const missing=clone(input);delete missing.candidates[0].uncertaintyIds
    assert.throws(()=>judge(missing),/array/)
  })
  check(()=>{
    const source=awaitJudgeSource
    assert.ok(!source.includes('evaluatePatternCandidates('))
    assert.ok(!source.includes('calculateTenGod(')&&!source.includes('produceExposureRootFacts('))
    assert.ok(!source.includes('caseId')&&!source.includes('expectedPattern'))
  })
  check(()=>{
    const changed=clone(input),combined=changed.candidates.find((c)=>c.patternType==='겸격')
    combined.basis.components.push(clone(combined.basis.components[0]))
    assert.equal(judge(changed).judgment.status,'deferred')
    const wrongRule=clone(input);wrongRule.candidates.find((c)=>c.patternType==='정격').sourceRuleIds=['C-10']
    assert.equal(judge(wrongRule).judgment.status,'deferred')
  })
  check(()=>{
    const changed=clone(input)
    for(const f of changed.derived.roots) { f.assessment='provisional';f.uncertaintyIds=['test:reference-root-unconfirmed'] }
    const result=judge(changed).judgment
    assert.equal(result.status,'confirmed')
    assert.ok(result.uncertainty.contextIds.includes('test:reference-root-unconfirmed'))
    assert.ok(!result.supportingFactIds.some((id)=>changed.derived.roots.some((f)=>f.id===id)))
  })
  check(()=>{
    const changed=clone(input),id=changed.candidates.find((c)=>c.patternType==='변격').basis.components[0].tenGodFactIds[0]
    changed.producer.facts.find((f)=>f.id===id).assessment='provisional'
    assert.equal(judge(changed).judgment.status,'deferred')
    const badBinding=clone(input),component=badBinding.candidates.find((c)=>c.patternType==='변격').basis.components[0]
    component.hiddenObservationIds=[badBinding.candidates.find((c)=>c.patternType==='월령본기격').basis.mainHiddenObservationId]
    assert.equal(judge(badBinding).judgment.status,'deferred')
  })
  console.log(`CS-005 pattern judgment: ${checks} checks passed; C-10-1 month pattern and combined classification confirmed; no roles or fortune evaluation.`)
} finally { await server.close() }
