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
  const input=prepare(producer), before=JSON.stringify(input)
  freeze(input)
  const result=candidates(input)
  const find=(type,output=result)=>output.candidates.filter((c)=>c.patternType===type)
  const structure=(output)=>output.candidates.map((c)=>({type:c.patternType,status:c.status,tenGods:c.basis.components.map((p)=>p.tenGod).sort()})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  check(()=>assert.equal(JSON.stringify(result),JSON.stringify(candidates(input))))
  check(()=>{assert.equal(JSON.stringify(input),before);assert.equal(JSON.stringify(producer),saved)})
  check(()=>{
    assert.ok(result.candidates.every((c)=>c.status==='candidate'))
    for(const c of result.candidates) {
      assert.ok(patternCandidateSchema.is(c))
      assert.ok(!patternCandidateSchema.is({...c,status:'confirmed'}))
      assert.ok(!patternCandidateSchema.is({...c,score:1}))
      assert.ok(!patternCandidateSchema.is({...c,sourceRuleIds:[]}))
      assert.ok(!patternCandidateSchema.is({...c,sourceRuleIds:['TEST']}))
    }
  })
  check(()=>{
    const missing=clone(input)
    missing.producer.entities=missing.producer.entities.filter((e)=>!(e.position==='month'&&e.part==='branch'&&e.origin==='natal'))
    const actual=candidates(missing)
    assert.ok(actual.candidates.every((c)=>c.status==='deferred'))
    assert.equal(actual.candidates[0].basis.monthBranchEntityId,null)
  })
  check(()=>{
    const missing=clone(input);missing.derived.hiddenObservations=missing.derived.hiddenObservations.filter((h)=>h.role!=='main')
    assert.ok(candidates(missing).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const missing=clone(input);missing.derived.exposures=[]
    const actual=candidates(missing)
    assert.equal(find('겸격',actual).length,0)
    assert.ok(find('미정',actual).some((c)=>c.status==='deferred'))
    assert.equal(find('월령본기격',actual).length,1)
  })
  check(()=>{
    const changed=clone(input)
    // Existing positive root facts and sameElementVisible cannot regenerate a false exposure fact.
    for(const f of changed.derived.exposures) if(f.hiddenStem==='丙') f.exposed=false
    const actual=candidates(changed)
    assert.equal(find('변격',actual).length,0)
    assert.equal(find('겸격',actual).length,0)
    assert.equal(find('정격',actual).length,1)
  })
  check(()=>{
    const missing=clone(input);missing.derived.roots=[]
    const actual=candidates(missing)
    assert.deepEqual(structure(actual),structure(result))
    assert.ok(actual.candidates.every((c)=>c.basis.rootFactIds.length===0))
  })
  check(()=>{
    const partial=clone(input)
    partial.derived.authority.entries.find((e)=>e.branch==='寅').completeness='partial'
    assert.ok(candidates(partial).candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const missing=clone(input)
    missing.producer.facts=missing.producer.facts.filter((f)=>!f.canonicalPointer.endsWith('/stemTenGod'))
    assert.ok(find('미정',candidates(missing)).some((c)=>c.status==='deferred'))
  })
  check(()=>{
    const allowed=['I-01','I-02','I-02a','C-10']
    assert.ok(result.candidates.every((c)=>c.sourceRuleIds.length&&c.sourceRuleIds.every((id)=>allowed.includes(id)&&A.includes(id))))
    assert.ok(!/percentage|score|strength|weight/.test(JSON.stringify(result.candidates)))
  })
  check(()=>{
    assert.deepEqual(Object.keys(result).sort(),['candidates','evidence','roleStates','scopeId','sourceScope'].sort())
    assert.deepEqual(result.roleStates,[])
    assert.ok(result.candidates.every((c)=>!('roles' in c)&&!('verdict' in c)&&!('favorable' in c)))
  })
  check(()=>{
    const known=new Set([...producer.facts,...input.derived.hiddenObservations,...input.derived.exposures,...input.derived.roots].map((f)=>f.id))
    input.natalCombination.states.forEach((s)=>known.add(s.stateId))
    input.natalCombination.relations.forEach((s)=>known.add(s.relationFactId))
    for(const c of result.candidates) {
      assert.deepEqual(c.provenance.producerRef,producer.producerRef)
      assert.equal(c.provenance.ruleVersion,'A179')
      assert.equal(c.provenance.sourceDocument.section,'A-8-1')
      assert.ok([...c.supportingFactIds,...c.conflictingFactIds,...c.basis.rootFactIds].every((id)=>known.has(id)))
      assert.ok(c.evidenceIds.every((id)=>result.evidence.records.some((e)=>e.evidenceId===id)))
    }
    assert.equal(new Set(result.candidates.map((c)=>c.candidateId)).size,result.candidates.length)
  })
  check(()=>{
    const rows=C.split('C-10-1.')[1].split('C-10-2.')[0].split('\n')
    const baseExpected=rows.find((line)=>line.startsWith('3 지지 격\t')).split('\t')[1]
    const combinedExpected=rows.find((line)=>line.startsWith('5 정격·변격·겸격\t')).split('\t')[1]
    const trace=JSON.stringify(result,null,2)
    assert.equal(baseExpected,'칠살격')
    assert.equal(find('월령본기격')[0].basis.components[0].tenGod,'偏官',trace)
    assert.ok(combinedExpected.includes('겸격(칠살 + 편인)'))
    assert.deepEqual(find('겸격')[0].basis.components.map((c)=>c.tenGod).sort(),['偏官','偏印'].sort(),trace)
    assert.deepEqual(find('정격')[0].basis.components.map((c)=>c.tenGod),['偏官'],trace)
    assert.deepEqual(find('변격')[0].basis.components.map((c)=>c.tenGod),['偏印'],trace)
    assert.equal(result.candidates.length,4)
    assert.equal(result.candidates.filter((c)=>c.status==='deferred').length,0)
  })
  check(()=>{
    const exById=new Map(input.derived.exposures.map((f)=>[f.id,f]))
    const monthBranch=producer.entities.find((e)=>e.origin==='natal'&&e.part==='branch'&&e.position==='month')
    for(const c of result.candidates) for(const component of c.basis.components) {
      assert.ok(component.exposureFactIds.every((id)=>exById.get(id).sourceBranchEntityId===monthBranch.entityId))
      assert.ok(component.stemEntityIds.every((id)=>producer.entities.find((e)=>e.entityId===id).position!=='day'))
    }
    assert.equal(find('겸격')[0].conflictingFactIds.length,0)
    assert.equal(find('월령본기격')[0].conflictingFactIds.length,0)
    assert.equal(find('정격')[0].conflictingFactIds.length,1)
    assert.equal(exById.get(find('정격')[0].conflictingFactIds[0]).hiddenStem,'丙')
  })
  check(()=>{
    const upstreamBefore=JSON.stringify({n:input.natalCombination,d:input.derived})
    const luckBefore=evaluate({producer,context:context(producer,'natal',jan)})
    candidates(input)
    assert.equal(JSON.stringify({n:input.natalCombination,d:input.derived}),upstreamBefore)
    assert.deepEqual(evaluate({producer,context:context(producer,'natal',jan)}),luckBefore)
    assert.deepEqual(derive({producer,context:input.context},sources),input.derived)
    assert.deepEqual(natalEvaluate({producer,context:input.context}),input.natalCombination)
  })
  function synthetic(values,branch='寅') {
    const facts=clone(chart)
    const day=values[2]
    for(const [i,pos] of ['year','month','day','time'].entries()) {
      const pillar=facts.chart.pillars[pos].value
      pillar.stem=values[i]
      if(pos==='month')pillar.branch=branch
      pillar.ganZhi=pillar.stem+pillar.branch
      const rel=facts.chart.basicRelations[pos].value
      rel.stemTenGod=calculateTenGod(day,pillar.stem)
      rel.relationships=calculateDayRelationships(day,pillar.branch)
    }
    const produced=p.produceJudgmentEngineFacts(facts,{hiddenStemSystem:{systemId:'filune-a179',sourceText:A}})
    return prepare(produced)
  }
  check(()=>{
    const synth=synthetic(['甲','丙','戊','辛'])
    const stopped=synth.natalCombination.states.filter((s)=>s.functionalState==='stopped')
    assert.equal(stopped.length,2)
    const actual=candidates(freeze(synth))
    const altered=find('변격',actual)[0]
    assert.equal(altered.status,'candidate')
    assert.equal(altered.basis.classificationRetainedAfterStop,true)
    assert.ok(altered.sourceRuleIds.includes('I-02a'))
    assert.ok(stopped.some((s)=>altered.conflictingFactIds.includes(s.stateId)))
    assert.ok(altered.basis.combinationRelationFactIds.length)
    assert.equal(find('겸격',actual)[0].status,'candidate')
  })
  check(()=>{
    const synth=synthetic(['甲','丙','戊','壬'])
    const state=synth.natalCombination.states.find((s)=>synth.producer.entities.find((e)=>e.entityId===s.targetEntityId).position==='month')
    synth.natalCombination.states=synth.natalCombination.states.filter((s)=>s.stateId!==state.stateId)
    assert.equal(find('겸격',candidates(synth)).length,0)
    assert.ok(find('미정',candidates(synth)).some((c)=>c.status==='deferred'))
  })
  check(()=>{
    const synth=synthetic(['甲','丙','丙','戊'])
    const actual=candidates(synth)
    const rejected=actual.candidates.filter((c)=>c.status==='rejected')
    assert.ok(rejected.some((c)=>c.basis.components.some((c)=>c.tenGod==='比肩')))
    assert.ok(!actual.candidates.filter((c)=>c.status==='candidate').flatMap((c)=>c.basis.components).some((c)=>c.tenGod==='比肩'||c.tenGod==='劫財'))
  })
  check(()=>{
    const actual=candidates(synthetic(['丙','甲','甲','壬']))
    assert.equal(find('비겁월특수',actual)[0].status,'deferred')
    assert.ok(!actual.candidates.some((c)=>c.status==='candidate'))
  })
  check(()=>{
    const actual=candidates(synthetic(['丙','壬','甲','丁'],'未'))
    assert.ok(actual.candidates.every((c)=>c.status==='deferred'))
  })
  check(()=>{
    const actual=candidates(synthetic(['丙','丁','甲','壬'],'午'))
    assert.ok(find('정격',actual).length)
    assert.equal(find('변격',actual).length,0)
    assert.equal(find('겸격',actual).length,0)
  })
  check(()=>{
    const mutated=clone(input);mutated.context.stage='monthlyLuck'
    assert.throws(()=>candidates(mutated),/natal/)
    const lineage=clone(input);lineage.derived.exposures.find((e)=>e.monthCommand).hiddenStemSystemId='legacy'
    assert.throws(()=>candidates(lineage),/lineage/)
  })
  check(()=>{
    const reordered=clone(input)
    reordered.producer.facts.reverse();reordered.derived.exposures.reverse();reordered.derived.roots.reverse()
    assert.deepEqual(candidates(reordered),result)
  })
  check(()=>{
    const duplicate=clone(input);duplicate.natalCombination.states.push(clone(duplicate.natalCombination.states[0]))
    assert.throws(()=>candidates(duplicate),/Ambiguous/)
    const conflict=clone(input);conflict.natalCombination.bundle.evidence.records[0].note='different-source-claim'
    assert.throws(()=>candidates(conflict),/Conflicting evidence/)
    const stale=clone(input);stale.natalCombination.provenance.producerSnapshotIdentity='unrelated-snapshot'
    assert.throws(()=>candidates(stale),/context/)
  })
  console.log(`CS-005 pattern candidates: ${checks} checks passed; C-10-1 candidate structure matched; no final pattern or roles generated.`)
} finally { await server.close() }
