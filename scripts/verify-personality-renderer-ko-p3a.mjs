import assert from 'node:assert/strict'
import { createServer } from 'vite'

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

let count = 0
function check(id, label, run) {
  try {
    run()
    ++count
    console.log(`PASS ${id} ${label}`)
  } catch (cause) {
    throw new Error(`${id} ${label}`, { cause })
  }
}

try {
  const { buildNatalPersonality, applyStructuralRoleModifiers, buildCurrentPersonality, renderPersonalityKo } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { projectCurrentPersonalityScopes } = await load('personalityCurrentReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { DAY_PILLAR_PROFILES } = await load('personality/knowledge/dayPillarProfiles')
  const { isCustomerSafeKo } = await load('personality/render/ko/guardrails')

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
    return { natal, current }
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

  const active = reading(officer, luck)
  const result = renderPersonalityKo(active)
  const withRelations = reading({ ...officer, year: pillar('peer', '甲', '子') })
  const withRoles = reading(wealth)
  const roleText = renderPersonalityKo({ natal: withRoles.natal })
  const plain = renderPersonalityKo({ natal: active.natal })
  const corpus = [result, plain, roleText]
  check('A', 'DayStem base and additive day pillar', () => {
    const sources = result.overview.sourceFactIds.map(id => active.natal.facts.find(fact => fact.id === id))
    assert.ok(sources.some(fact => fact.sourceType === 'day_stem'))
    assert.match(result.overview.text, /힘 있게 밀고 나가는/u)
    assert.doesNotMatch(result.overview.text, /밀어붙이는 기질/u)
    assertEvidence(result, active.natal, active.current)
    for (const pillarId of Object.keys(DAY_PILLAR_PROFILES)) {
      const [stem, branch] = pillarId
      const natal = buildNatalPersonality(chart({ day: pillar('view', stem, branch) }))
      const rendered = renderPersonalityKo({ natal })
      assert.ok(rendered.overview, pillarId)
      assertEvidence(rendered, natal)
      assert.ok(natal.facts.filter(fact => fact.sourceType === 'day_stem' && fact.traitType === 'shadow')
        .every(fact => rendered.cautions.sourceFactIds.includes(fact.id)), pillarId)
      corpus.push(rendered)
    }
  })
  check('B', 'both outward and close relationship sections and sourced strengths', () => {
    const rendered = renderPersonalityKo({ natal: withRelations.natal })
    assert.ok(rendered.outward && rendered.closeRelations && rendered.strengths)
    assert.match(rendered.outward.text, /겉으로/u)
    assertEvidence(rendered, withRelations.natal)
  })
  check('C', 'decision wording retains confirmed input', () => {
    assert.match(plain.decision.text, /결정을 내리기 전에는 오래 따져보고/u)
    assert.ok(plain.decision.paragraphs.some(paragraph => paragraph.certainty === 'confirmed'
      && !paragraph.text.includes('드러날 수 있어')))
  })
  check('D', 'explicit conflict with both sides', () => {
    const first = { id: 'first', trait: '빠른 판단', traitType: 'social', sourceType: 'day_stem', status: 'active', provenanceIds: ['first-source'] }
    const second = { ...first, id: 'second', trait: '신중한 판단', traitType: 'decision' }
    const natal = { ...active.natal, facts: [first, second], structuralRoleModifiers: [],
      positionExpressions: [{ expressionMode: 'outward', factIds: [first.id] }, { expressionMode: 'inner', factIds: [second.id] }],
      conflicts: [{ id: 'two-sides', factIds: [first.id, second.id], conflictType: 'outward_vs_inner', resolution: 'context_split' }],
    }
    const rendered = renderPersonalityKo({ natal })
    assert.match(rendered.emotion.text, /겉으로는 빠르게 결정을 내리는.*속으로는 결정하기 전에 신중하게 살피는/u)
    assert.deepEqual(rendered.emotion.sourceFactIds, [first.id, second.id])
    assert.deepEqual(rendered.emotion.sourceConflictIds, ['two-sides'])
    assert.doesNotMatch(rendered.emotion.text, /모순|이중적/u)
    assert.equal(renderPersonalityKo({ natal: { ...natal, conflicts: [] } }).emotion, undefined)
  })
  check('E', 'roles use supplied operations and stance', () => {
    assert.ok(roleText.overview.sourceModifierIds.some(id => withRoles.natal.structuralRoleModifiers
      .some(role => role.id === id && role.sourceRole === 'yongshen')))
    const standby = reading({ ...officer, year: pillar('guard', '癸', '子') })
    const ids = standby.natal.structuralRoleModifiers.filter(role => role.roleContext === 'protective_standby').map(role => role.id)
    assert.ok(ids.length)
    const textWithStandby = renderPersonalityKo(standby)
    const matched = paragraphs(textWithStandby).filter(item => item.sourceModifierIds.some(id => ids.includes(id)))
    assert.ok(matched.length && matched.every(item => item.certainty === 'conditional' && /필요가 생기면/u.test(item.text)))
    assertEvidence(textWithStandby, standby.natal, standby.current)
  })
  check('F', 'conditional damage stays conditional and missing roles add no cautions', () => {
    const conditional = withRoles.natal.structuralRoleModifiers.find(role => role.roleContext === 'conditional_byeong')
    assert.ok(conditional)
    const paragraph = paragraphs(roleText).find(item => item.sourceModifierIds.includes(conditional.id))
    assert.equal(paragraph.certainty, 'conditional')
    assert.match(paragraph.text, /상황에서는.*수 있어/u)
    const natal = { ...active.natal, facts: active.natal.facts.filter(fact => fact.traitType === 'core'),
      structuralRoleModifiers: [], conflicts: [] }
    assert.equal(renderPersonalityKo({ natal }).cautions, undefined)
  })
  check('G', 'temporary expressions have their own section', () => {
    const temporary = new Set(active.current.temporaryFacts.map(fact => fact.id))
    assert.ok(result.currentExpression.sourceFactIds.some(id => temporary.has(id)))
    assert.match(result.currentExpression.text, /요즘은/u)
    assert.deepEqual(result.overview, plain.overview)
    for (const section of sections.filter(section => section !== 'currentExpression')) {
      assert.deepEqual(result[section], plain[section])
      assert.ok(!result[section]?.sourceFactIds.some(id => temporary.has(id)))
    }
  })
  check('H', 'expired effects are excluded even with explicit history', () => {
    const expired = reading(officer, [], end, active.current.effectHistory)
    assert.ok(expired.current.effectHistory.some(item => item.expired))
    assert.equal(renderPersonalityKo(expired).currentExpression, undefined)
    const stale = { ...active.current, effectHistory: active.current.effectHistory.map(item =>
      ({ ...item, expired: true, currentlyEffective: false })) }
    assert.equal(renderPersonalityKo({ natal: active.natal, current: stale }).currentExpression, undefined)
  })
  check('I', 'unknown hour and 戊午 canonical data', () => {
    const known = reading({ ...officer, time: pillar('time', '壬', '子') })
    const timeIds = new Set(known.natal.facts.filter(item => item.sourcePosition?.startsWith('hour_')).map(item => item.id))
    assert.ok(timeIds.size)
    assert.ok(!result.provenance.some(item => item.sourceFactIds.some(id => timeIds.has(id))))
    const wu = reading({ day: pillar('wu', '戊', '午') })
    assert.equal(wu.natal.dayPillarModifier.dayBranchTenGod, '正印')
    assert.ok(!wu.natal.facts.some(item => item.tenGod === '偏財'))
    assertEvidence(renderPersonalityKo(wu), wu.natal, wu.current)
  })
  check('J', 'empty fields and missing provenance have no filler', () => {
    const natal = { ...active.natal, facts: [{ ...active.natal.facts[0], provenanceIds: [] }],
      structuralRoleModifiers: [], conflicts: [] }
    assert.deepEqual(renderPersonalityKo({ natal }), { provenance: [] })
  })
  function guardCase(pattern, value) {
    const original = active.natal.facts.find(fact => fact.sourceType === 'day_stem')
    const natal = { ...active.natal, facts: [{ ...original, trait: value }], conflicts: [], structuralRoleModifiers: [] }
    assert.deepEqual(renderPersonalityKo({ natal }), { provenance: [] })
    corpus.forEach(item => assert.doesNotMatch(text(item), pattern))
  }
  check('K', 'no terminology or engine tokens', () => {
    guardCase(/용신|상신|구응|병격|정관|상관 같은|지장간|통근|originScope/u, '상관 성향')
    assert.ok(isCustomerSafeKo('상관없이 꼼꼼한 면이 있어.'))
  })
  check('L', 'no Han character', () => guardCase(/\p{Script=Han}/u, '甲의 기질'))
  check('M', 'no prediction, events or health claims', () => {
    for (const value of ['사업에 성공해', '결혼 예정', '몸이 먼저 아픔', '궁합이 좋음', '돈을 많이 번다', '이직함']) {
      guardCase(/배우자|궁합|이직|결혼|질병|통증|돈을 많이 번/u, value)
    }
  })
  check('N', 'no scoring or strength ranking', () => guardCase(/[％%★]|\d+\s*점|순위|확률|가장 강한/u, '독립성 80점'))
  check('O', 'no second person or supplied name', () => {
    guardCase(/당신|\b너\b|네가/u, '당신의 기질')
    assert.deepEqual(renderPersonalityKo({ ...active, name: '사용자 이름' }), result)
  })
  check('P', 'deterministic ordering with frozen engine inputs', () => {
    assert.deepEqual(renderPersonalityKo(active), result)
    const reverse = array => [...array].reverse()
    assert.deepEqual(renderPersonalityKo({
      natal: { ...active.natal, facts: reverse(active.natal.facts), conflicts: reverse(active.natal.conflicts),
        positionExpressions: reverse(active.natal.positionExpressions), structuralRoleModifiers: reverse(active.natal.structuralRoleModifiers) },
      current: { ...active.current, currentFacts: reverse(active.current.currentFacts), conflicts: reverse(active.current.conflicts),
        temporaryFacts: reverse(active.current.temporaryFacts), effectHistory: reverse(active.current.effectHistory) },
    }), result)
  })

  assert.equal(count, 16)
  console.log('PASS P3-A 16/16')
} finally {
  await server.close()
}
