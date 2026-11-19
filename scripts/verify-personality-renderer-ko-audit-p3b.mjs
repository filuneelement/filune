import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync, writeFileSync } from 'node:fs'

const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const sections = ['overview', 'outward', 'closeRelations', 'decision', 'emotion', 'strengths', 'cautions', 'currentExpression']
const paragraphs = result => sections.flatMap(section => result[section]?.paragraphs ?? [])
const text = result => sections.map(section => result[section]?.text ?? '').join('\n')
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child)
    Object.freeze(value)
  }
  return value
}

try {
  const { buildNatalPersonality, applyStructuralRoleModifiers, buildCurrentPersonality, renderPersonalityKo } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { projectCurrentPersonalityScopes } = await load('personalityCurrentReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { isCustomerSafeKo } = await load('personality/render/ko/guardrails')
  const { traitPhrase } = await load('personality/render/ko/wording')

  const pillar = (id, stem, branch) => ({ stem: { id, value: stem }, branch: { id: id + '-branch', value: branch } })
  const day = pillar('self', '甲', '寅')
  const officer = { day, month: pillar('officer', '辛', '酉') }
  const wealth = { day, month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
  const start = '2027-01-01T00:00:00.000Z'
  const end = '2028-01-01T00:00:00.000Z'
  const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
  const natalValidity = validity('natal', '2000-01-01T00:00:00.000Z', '2100-01-01T00:00:00.000Z')
  const luck = [{ scope: 'greatLuck', pillar: pillar('great', '丁', '巳'), validity: validity('great-a', start, end) }]

  function chart(positions) {
    const chart = { pillars: {}, basicRelations: {} }
    for (const key of ['year', 'month', 'day', 'time']) {
      const item = positions[key]
      if (!item) {
        chart.pillars[key] = chart.basicRelations[key] = { status: 'unknown', uncertaintyIds: ['fixture'] }
        continue
      }
      const stem = item.stem.value
      const branch = item.branch.value
      const dayStem = positions.day.stem.value
      chart.pillars[key] = { status: 'confirmed', value: { stem, branch, ganZhi: stem + branch } }
      chart.basicRelations[key] = { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(dayStem, stem), relationships: calculateDayRelationships(dayStem, branch),
        twelveStage: calculateTwelveStage(dayStem, branch),
      } }
    }
    return chart
  }

  function reading(positions, periods = [], time = start, previousEffectHistory) {
    const snapshots = runJudgmentCore({ executionId: 'p3a', natal: positions, natalValidity, natalCombinations: [],
      luck: periods, referenceTime: time })
    const natal = freeze(applyStructuralRoleModifiers(buildNatalPersonality(chart(positions)), projectNatalStructuralReading(snapshots[0])))
    const current = freeze(buildCurrentPersonality({ natalPersonality: natal, evaluationScope: 'daewoon', referenceTime: time,
      structuralScopes: projectCurrentPersonalityScopes(snapshots, natal.dayStem, time), previousEffectHistory }))
    return { natal, current, snapshots }
  }

  function assertEvidence(output, natal, current) {
    const factIds = new Set([...natal.facts, ...(current?.temporaryFacts ?? [])].map(item => item.id))
    const roleIds = new Set([...natal.structuralRoleModifiers, ...(current?.structuralRoleModifiers ?? [])].map(item => item.id))
    const conflictIds = new Set([...natal.conflicts, ...(current?.conflicts ?? [])].map(item => item.id))
    for (const section of sections) {
      const block = output[section]
      if (!block) continue
      assert.ok(isCustomerSafeKo(block.heading))
      assert.equal(block.text, block.paragraphs.map(item => item.text).join('\n\n'))
      assert.ok(block.paragraphs.length)
      for (const paragraph of block.paragraphs) {
        assert.ok(isCustomerSafeKo(paragraph.text), paragraph.text)
        assert.match(paragraph.text, /(?:있어|쓰여|받쳐 줘|도와줘|드러나|하기도 해)\.$/u)
        assert.ok(paragraph.sourceFactIds.length)
        assert.ok(paragraph.sourceFactIds.every(id => factIds.has(id)))
        assert.ok(paragraph.sourceModifierIds.every(id => roleIds.has(id)))
        assert.ok(paragraph.sourceConflictIds.every(id => conflictIds.has(id)))
      }
    }
  }

  const food = pillar('food', '丙', '巳')
  const hurt = { ...officer, year: pillar('hurt', '丁', '巳') }
  const guarded = { ...hurt, time: pillar('guard', '壬', '子') }
  const standby = { ...officer, year: pillar('standby', '癸', '子') }
  const remedy = { day, month: food, year: guarded.time, time: wealth.month }
  const makeLuck = (id, stem, branch, policyEvidence) => [{
    scope: 'greatLuck', pillar: pillar(id, stem, branch), validity: validity(id, start, end),
    ...(policyEvidence && { policyEvidence }),
  }]
  const stopped = reading(guarded, makeLuck('stopper', '丁', '巳'))
  const activated = reading(wealth, makeLuck('killing', '庚', '申', [
    { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['fixture:reviewed-killing'] },
  ]))
  const currentConflict = reading(hurt, makeLuck('resource', '癸', '子'))
  const currentSimple = reading(officer, luck)
  const known = reading(guarded)
  const guardReading = projectNatalStructuralReading(known.snapshots[0])
  const weakened = applyStructuralRoleModifiers(buildNatalPersonality(chart(guarded)), {
    ...guardReading, runtime: guardReading.runtime.map(item => item.entityId === 'guard' ? { ...item, state: 'weakened' } : item),
  })

  const fixtures = [
    ['A', '단순 원국', reading({ day: pillar('simple', '丙', '寅') })],
    ['B', '바깥 표현과 내부 판단', reading({ ...hurt, month: pillar('resource', '癸', '子') })],
    ['C', '일주 내부 충돌', reading({ day: pillar('explicit', '甲', '子') })],
    ['D', '활성 보호 역할', known],
    ['E', '한 글자의 두 역할', activated],
    ['F', '보호 대기', reading(standby)],
    ['G', '조건부 방해 역할', reading(wealth)],
    ['H', '실제 완화 경로', reading(remedy)],
    ['I', '방해 역할 없음', reading(officer)],
    ['J', '운에서 역할 정지', stopped],
    ['K', '약화된 보호 역할', { natal: weakened }],
    ['L', '임시 현재 표현', currentSimple],
    ['M', '원국과 현재의 충돌', currentConflict],
    ['N', '현재 효과 만료', reading(hurt, [], end, currentConflict.current.effectHistory)],
    ['O', '출생시각 미정', reading(hurt)],
    ['P', 'SOURCE_GAP', reading({ day: pillar('gap', '癸', '亥') })],
    ['Q', '戊午 canonical', reading({ day: pillar('wu', '戊', '午') })],
  ]
  const records = Object.fromEntries(fixtures.map(([id, label, { natal, current }]) => {
    const internal = structuredClone({ natal, current })
    const output = renderPersonalityKo(freeze({ natal, current }))
    assert.deepEqual(renderPersonalityKo({ natal, current }), output)
    const reverse = array => [...array].reverse()
    assert.deepEqual(renderPersonalityKo({
      natal: { ...natal, facts: reverse(natal.facts), conflicts: reverse(natal.conflicts),
        positionExpressions: reverse(natal.positionExpressions), structuralRoleModifiers: reverse(natal.structuralRoleModifiers) },
      current: current && { ...current, currentFacts: reverse(current.currentFacts), conflicts: reverse(current.conflicts),
        temporaryFacts: reverse(current.temporaryFacts), effectHistory: reverse(current.effectHistory) },
    }), output)
    assert.deepEqual({ natal, current }, internal)
    assertEvidence(output, natal, current)
    const facts = new Map(natal.facts.map(fact => [fact.id, fact]))
    const coverage = natal.facts.filter(fact => fact.status === 'active').map(fact => {
      const links = paragraphs(output).filter(paragraph => paragraph.sourceFactIds.includes(fact.id))
      const phrase = traitPhrase(fact.trait)
      const equivalents = links.some(paragraph => paragraph.sourceFactIds.some(id => {
        const other = facts.get(id)
        return other && id !== fact.id && other.traitType === fact.traitType
          && other.status === fact.status && traitPhrase(other.trait) === phrase
      }))
      return { id: fact.id, trait: fact.trait, status: !links.length ? 'lost'
        : equivalents ? 'merged' : 'rendered' }
    })
    return [id, { label, internal, output, coverage }]
  }))
  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(records, null, 2) + '\n')
  const record = id => records[id]
  const natalRole = (id, role, actor) => record(id).internal.natal.structuralRoleModifiers.find(item =>
    item.sourceRole === role && (!actor || item.sourceEntityId === actor))
  const currentRole = (id, role, actor) => record(id).internal.current.structuralRoleModifiers.find(item =>
    item.sourceRole === role && (!actor || item.sourceEntityId === actor))
  const wording = (id, role) => paragraphs(record(id).output).filter(item => item.sourceModifierIds.includes(role.id))
  const blocks = Object.values(records).flatMap(item => paragraphs(item.output))
  for (const paragraph of blocks) {
    assert.doesNotMatch(paragraph.text, /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|Ten God|Yong Shen|Day Master|RoleModifier|PersonalityFact|제일 두드러|최고의 강점|앞뒤가 달라|성격이 나빠/u)
  }
  for (const file of ['renderPersonalityKo.ts', 'guardrails.ts', 'wording.ts']) {
    const source = readFileSync(new URL(`../src/lib/personality/render/ko/${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /from\s+['"][^'"]*(?:judgment|knowledge)\//u)
  }
  assert.ok(record('B').internal.natal.conflicts.some(item => item.conflictType === 'outward_vs_inner'))
  assert.ok(record('C').internal.natal.conflicts.some(item => item.conflictType === 'source_explicit'))
  assert.equal(natalRole('D', 'sangshen', 'guard').status, 'confirmed')
  assert.equal(currentRole('E', 'byeong', 'wealth').status, 'confirmed')
  assert.ok(currentRole('E', 'yongshen', 'wealth'))
  assert.equal(natalRole('F', 'sangshen', 'standby').roleContext, 'protective_standby')
  const standbyText = wording('F', natalRole('F', 'sangshen', 'standby'))
  assert.ok(standbyText.length && standbyText.every(item => item.certainty === 'conditional'))
  assert.equal(natalRole('G', 'byeong', 'wealth').status, 'contextual')
  const conditionalText = wording('G', natalRole('G', 'byeong', 'wealth'))
  assert.ok(conditionalText.length && conditionalText.every(item => item.certainty === 'conditional'))
  assert.equal(natalRole('H', 'gueung', 'wealth').operation, 'resolves_tension')
  assert.ok(natalRole('H', 'gueung', 'wealth').targetByeongId)
  assert.ok(!natalRole('I', 'byeong'))
  assert.deepEqual(record('I').output.cautions.sourceModifierIds, [])
  assert.equal(currentRole('J', 'sangshen', 'guard').status, 'inactive')
  assert.ok(!record('J').output.currentExpression?.sourceModifierIds.includes(currentRole('J', 'sangshen', 'guard').id))
  assert.equal(natalRole('K', 'sangshen', 'guard').status, 'reduced')
  assert.ok(record('L').output.currentExpression)
  assert.ok(record('M').internal.current.conflicts.some(item => item.conflictType === 'natal_vs_current'))
  for (const [id, layer, kind] of [['B', 'natal', 'outward_vs_inner'], ['C', 'natal', 'source_explicit'],
    ['M', 'current', 'natal_vs_current']]) {
    const conflicts = record(id).internal[layer].conflicts.filter(item => item.conflictType === kind)
    for (const conflict of conflicts) {
      const paragraph = paragraphs(record(id).output).find(item => item.sourceConflictIds.includes(conflict.id))
      assert.ok(paragraph && conflict.factIds.every(factId => paragraph.sourceFactIds.includes(factId)), id)
    }
  }
  assert.ok(record('N').internal.current.effectHistory.some(item => item.expired))
  assert.equal(record('N').output.currentExpression, undefined)
  assert.ok(!record('O').internal.natal.facts.some(item => item.sourcePosition?.startsWith('hour_')))
  assert.ok(record('P').output.overview && !record('P').output.cautions)
  assert.equal(record('Q').internal.natal.dayPillarModifier.dayBranchTenGod, '正印')
  assert.ok(!record('Q').internal.natal.facts.some(item => item.tenGod === '偏財'))
  for (const [id, item] of Object.entries(records)) {
    const temporary = new Set(item.internal.current?.temporaryFacts.map(fact => fact.id))
    const allFacts = new Map([...item.internal.natal.facts, ...(item.internal.current?.temporaryFacts ?? [])]
      .map(fact => [fact.id, fact]))
    for (const paragraph of paragraphs(item.output)) {
      if (paragraph.sourceFactIds.some(factId => allFacts.get(factId)?.status !== 'active')) {
        assert.notEqual(paragraph.certainty, 'confirmed', id)
      }
    }
    for (const section of sections.filter(section => section !== 'currentExpression')) {
      assert.ok(!item.output[section]?.sourceFactIds.some(fact => temporary.has(fact)), id)
    }
    console.log(id, item.label, 'paragraphs', paragraphs(item.output).length, 'active fact coverage',
      Object.fromEntries(['rendered', 'merged', 'lost'].map(status =>
        [status, item.coverage.filter(fact => fact.status === status).length])))
  }
  console.log('BASELINE: 17/17 fixture renders, guardrails, provenance and stable ordering')
  const semanticCases = [
    ['P3B-01', 'F', 'UNSUPPORTED', natalRole('F', 'sangshen', 'standby'), items =>
      items.some(item => /받쳐 줄 수 있어|도울 수 있어|보탤 수 있어/u.test(item.text))
        && items.every(item => !item.text.includes('선택의 기준'))],
    ['P3B-02', 'G', 'PARTIAL_LOSS', natalRole('G', 'byeong', 'wealth'), items =>
      items.some(item => item.certainty === 'conditional'
        && /평소에도 쓰여.*상황에서는.*다른 면을 드러내기 어렵게 할 수 있어/u.test(item.text))],
    ['P3B-03', 'E', 'PARTIAL_LOSS', currentRole('E', 'byeong', 'wealth'), items =>
      items.some(item => /^요즘은.*다른 면을 드러내기 어렵게 하기도 해\.$/u.test(item.text)
        && item.certainty === 'confirmed')],
  ]
  for (const [id, fixture, severity, role, accepts] of semanticCases) {
    const items = wording(fixture, role).filter(item => fixture !== 'E' || item.text.startsWith('요즘은'))
    if (accepts(items)) console.log('PASS', id)
    else {
      process.exitCode = 1
      console.error('FAIL', id, severity, JSON.stringify({
        fixture, operation: role.operation, status: role.status, currentState: role.currentState,
        currentFunction: role.currentFunction, roleContext: role.roleContext, output: items.map(item => item.text),
      }))
    }
  }

  const operations = {
    supports_expression: /다른 면이 드러나는 데 힘을 보태|다른 면이 드러나는 데 힘을 보탤/u,
    channels_expression: /행동의 방향을 잡는 데/u,
    restrains_expression: /다른 면의 표현을 누그러뜨리|다른 면의 표현을 누그러뜨릴/u,
    distorts_expression: /다른 면을 드러내기 어렵게/u,
    protects_expression: /다른 면이 제 역할을 하도록 받쳐/u,
    resolves_tension: /엇갈리는 면이 균형을 잡도록/u,
    contextualizes: /상황에 따라 쓰이는 방식/u,
  }
  const observed = record('A').internal
  const anchor = observed.natal.facts.find(fact => fact.status === 'active')
  const base = natalRole('D', 'sangshen', 'guard')
  assert.ok(anchor && base)
  for (const [operation, meaning] of Object.entries(operations)) {
    for (const status of ['confirmed', 'contextual', 'deferred', 'reduced', 'inactive']) {
      const role = { ...base, id: 'fixture:role-operation', targetPersonalityFactIds: [anchor.id], operation, status }
      const input = { natal: observed.natal, current: {
        ...observed.current, structuralRoleModifiers: [role],
      } }
      const output = renderPersonalityKo(input)
      assertEvidence(output, input.natal, input.current)
      const items = output.currentExpression?.paragraphs.filter(item => item.sourceModifierIds.includes(role.id)) ?? []
      const context = `${operation} / ${status}`
      if (status === 'inactive') {
        assert.equal(items.length, 0, context)
        continue
      }
      assert.equal(items.length, 1, context)
      const { text, certainty, sourceFactIds } = items[0]
      assert.deepEqual(sourceFactIds, [anchor.id])
      assert.match(text, meaning, context)
      assert.doesNotMatch(text, /선택의 기준|핵심 가치|정체성|가장 중요한/u, context)
      const assertive = status === 'confirmed' && operation !== 'contextualizes'
      assert.equal(certainty, assertive ? 'confirmed' : 'conditional', context)
      if (assertive) assert.doesNotMatch(text, /수도 있어|수 있어|가능성이/u, context)
      else assert.match(text, /수 있어/u, context)
      if (status === 'reduced') assert.match(text, /제한적으로/u, context)
      const noTarget = renderPersonalityKo({ ...input, current: {
        ...input.current, structuralRoleModifiers: [{ ...role, targetPersonalityFactIds: [] }],
      } })
      assert.ok(!noTarget.currentExpression?.sourceModifierIds.includes(role.id), context)
    }
  }
  console.log('PASS operation / certainty matrix: 35/35')
} finally {
  await server.close()
}
