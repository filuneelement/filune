import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'
import { freeze, loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const sections = ['overview', 'outward', 'closeRelations', 'decision', 'emotion', 'strengths', 'cautions', 'currentExpression']
const refs = ['sourceFactIds', 'sourceModifierIds', 'sourceConflictIds']
const sorted = list => [...new Set(list)].sort()
const paragraphs = result => sections.flatMap(section => result[section]?.paragraphs ?? [])
const rawSource = path => readFileSync(new URL(`../src/lib/personality/${path}`, import.meta.url), 'utf8')

try {
  const { buildNatalPersonality, renderPersonalityJa, renderPersonalityKo } = await load('personality/index')
  const { traitPhraseJa } = await load('personality/render/ja/wording')
  const { isCustomerSafeJa } = await load('personality/render/ja/guardrails')
  const { DAY_STEM_PROFILES } = await load('personality/knowledge/dayStemProfiles')
  const { TEN_GOD_PROFILES } = await load('personality/knowledge/tenGodProfiles')
  const { DAY_PILLAR_PROFILES } = await load('personality/knowledge/dayPillarProfiles')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const fields = await load('personality/facts/personalityFacts')
  const fixtureRows = await loadPersonalityRendererFixtures(load)
  const fixtures = Object.fromEntries(fixtureRows.map(([id, , { natal, current }]) => [id, { natal, current }]))
  const base = fixtures.A.natal.facts.find(item => item.status === 'active' && item.traitType === 'core')
  const soloNatal = { ...fixtures.A.natal, conflicts: [], structuralRoleModifiers: [], positionExpressions: [] }

  const registry = new Set()
  const collect = (profiles, map) => {
    for (const profile of Object.values(profiles)) {
      for (const field of Object.keys(map)) for (const trait of profile[field]) registry.add(trait)
    }
  }
  collect(DAY_STEM_PROFILES, fields.DAY_STEM_FIELDS)
  collect(TEN_GOD_PROFILES, { ...fields.TEN_GOD_BASE_FIELDS, ...fields.TEN_GOD_OUTWARD_FIELDS,
    ...fields.TEN_GOD_INNER_FIELDS, ...fields.TEN_GOD_SHARED_CONTEXT_FIELDS })
  collect(DAY_PILLAR_PROFILES, fields.DAY_PILLAR_FIELDS)
  for (const profile of Object.values(DAY_PILLAR_PROFILES)) {
    for (const item of profile.internalConflict) {
      for (const trait of [item.sourceA, item.sourceB, item.tension, ...item.possibleExpression]) registry.add(trait)
    }
  }
  assert.equal(registry.size, 348)
  // Read declarations before Map construction so overwritten keys are visible.
  const dictionary = rawSource('render/ja/wording.ts').split('new Map([')[1].split('\n])')[0].trim()
  const keys = dictionary.split('\n').map(line => {
    const row = line.trim().match(/^\['([^']+)', '[^']+'\],$/u)
    assert.ok(row, line)
    return row[1]
  })
  assert.equal(keys.length, new Set(keys).size, 'duplicate declaration')
  assert.equal(keys.length, new Set(keys.map(key => key.trim())).size, 'SEMANTIC_COLLISION')
  assert.deepEqual(sorted(keys.filter(key => !registry.has(key))), ['빠른 판단'])
  const equivalents = new Map()
  for (const trait of registry) {
    assert.ok(keys.includes(trait), `UNMAPPED_TRAIT: ${trait}`)
    const phrase = traitPhraseJa(trait)
    assert.equal(traitPhraseJa(` \t${trait}　`), phrase)
    assert.ok(isCustomerSafeJa(phrase), `unsafe atomic wording: ${trait}`)
    const rendered = renderPersonalityJa({ natal: { ...soloNatal, facts: [{ ...base, trait }] } })
    assert.ok(rendered.overview?.text.includes(phrase), `empty or lost: ${trait}`)
    assert.deepEqual(rendered.overview.sourceFactIds, [base.id])
    const like = equivalents.get(phrase) ?? []
    like.push(trait)
    equivalents.set(phrase, like)
  }
  assert.ok([...equivalents.values()].every(group => group.length === 1), 'ambiguous canonical output phrase')
  assert.equal(traitPhraseJa('빠른 판단'), traitPhraseJa('신속한 판단'))
  for (const variant of [base.trait + '.', base.trait + ' (변형)', base.trait + '은', base.trait.replaceAll(' ', '  ')]) {
    assert.throws(() => renderPersonalityJa({ natal: { ...soloNatal, facts: [{ ...base, trait: variant }] } }),
      /^Error: UNMAPPED_TRAIT:/u)
  }
  console.log('PASS dictionary: 348/348, duplicate keys 0, collision 0, ambiguous 0, empty 0, guardrail loss 0')

  const guard = {
    korean: /\p{Script=Hangul}/u,
    terminology: /日干|日柱|月令|天干|地支|通変星|比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|印綬|用神|相神|救応|十二運/u,
    pronouns: /あなた|君|お前/u,
    fortune: /であろう|なり。|すべし|と出ております|宿命|天中殺|空亡|大吉|凶運|だぜ。|だわ。|のよ。/u,
    fear: /破滅|災い|危険|不幸が訪れる/u,
    events: /転職した|別れた|失敗した|成功した/u,
    life: /(?:^|[^\p{Script=Han}])(?:夫|妻)(?!\p{Script=Han})|子ども|上司|会社/u,
    health: /痛む|肩がこる|詰まる|病院|検診/u,
    score: /[%％★]|\d+点|確率|ランク/u,
    ranking: /最も強い|一番強い|一番目立つ|最も目立つ|圧倒的/u,
  }
  function audit(input, label) {
    const ko = renderPersonalityKo(input)
    const ja = renderPersonalityJa(input)
    for (const section of sections) {
      const k = ko[section]
      const j = ja[section]
      assert.equal(j?.certainty, k?.certainty, `${label}: ${section} certainty`)
      const evidenceByCertainty = (block, ref) => sorted((block?.paragraphs ?? [])
        .flatMap(p => p[ref].map(id => JSON.stringify([p.certainty, id]))))
      for (const ref of refs) {
        assert.deepEqual(j?.[ref], k?.[ref], `${label}: ${section} ${ref}`)
        assert.deepEqual(evidenceByCertainty(j, ref), evidenceByCertainty(k, ref), `${label}: ${section} ${ref} certainty`)
      }
      if (!j) continue
      const text = j.heading + '\n' + j.text
      assert.ok(isCustomerSafeJa(text), label)
      for (const [category, pattern] of Object.entries(guard)) assert.doesNotMatch(text, pattern, `${label}: ${category}`)
      assert.doesNotMatch(text, /audit-name|(?:様|ちゃん)[、。]/u)
      assert.ok(j.paragraphs.every(item => item.sourceFactIds.length && !refs.some(ref => item[ref].some(id => text.includes(id)))))
    }
    return ja
  }

  const rendered = Object.fromEntries(Object.entries(fixtures)
    .map(([id, input]) => [id, audit({ ...input, name: 'audit-name' }, id)]))
  for (const ganZhi of Object.keys(DAY_PILLAR_PROFILES)) {
    const [stem, branch] = ganZhi
    const unknown = { status: 'unknown', uncertaintyIds: ['audit'] }
    const day = { status: 'confirmed', value: { stem, branch, ganZhi } }
    const relations = { status: 'confirmed', value: {
      stemTenGod: calculateTenGod(stem, stem), relationships: calculateDayRelationships(stem, branch),
      twelveStage: calculateTwelveStage(stem, branch),
    } }
    const natal = buildNatalPersonality({
      pillars: { day, year: unknown, month: unknown, time: unknown },
      basicRelations: { day: relations, year: unknown, month: unknown, time: unknown },
    })
    const output = audit({ natal }, ganZhi)
    const ids = new Set(paragraphs(output).flatMap(item => item.sourceFactIds))
    assert.ok(natal.facts.filter(fact => fact.sourceType === 'day_pillar').every(fact => ids.has(fact.id)), ganZhi)
  }
  console.log('PASS 17 engine fixtures and 60 canonical day pillars: provenance, certainty, customer guardrails')

  const roleSample = (id, select, pattern, certainty, current = false) => {
    const source = current ? fixtures[id].current : fixtures[id].natal
    const modifier = source.structuralRoleModifiers.find(select)
    assert.ok(modifier, id)
    const pool = current ? rendered[id].currentExpression.paragraphs : paragraphs(rendered[id])
    const item = pool.find(paragraph => paragraph.sourceModifierIds.includes(modifier.id))
    assert.ok(item)
    assert.equal(item.certainty, certainty)
    assert.match(item.text, pattern)
    return item.text
  }
  const operation = name => item => item.operation === name
  const context = name => item => item.roleContext === name
  const restrained = fixtures.D.natal.structuralRoleModifiers.find(operation('protects_expression'))
  const restraintInput = freeze({ natal: { ...fixtures.D.natal, structuralRoleModifiers: [
    { ...restrained, operation: 'restrains_expression' },
  ] } })
  const restraint = paragraphs(audit(restraintInput, 'explicit restraint contract')).find(item => item.sourceModifierIds.includes(restrained.id))
  assert.equal(restraint.certainty, 'confirmed')
  assert.match(restraint.text, /別の面の表れ方を抑えているよ/u)

  const conflict = fixtures.C.natal.conflicts.find(item => item.conflictType === 'source_explicit')
  const pair = rendered.C.emotion.paragraphs.find(item => item.sourceConflictIds.includes(conflict.id))
  assert.deepEqual(pair.sourceFactIds, sorted(conflict.factIds))
  assert.match(pair.text, /先頭に立ちたい.*もう一度確かめてためらう/u)
  const overviewD = rendered.C.overview.paragraphs.find(item =>
    item.sourceFactIds.some(id => fixtures.C.natal.facts.find(fact => fact.id === id)?.sourceType === 'day_pillar'))
  assert.ok(overviewD && rendered.C.overview.paragraphs.some(item => item.sourceFactIds.includes(base.id)
    || item.sourceFactIds.some(id => fixtures.C.natal.facts.find(fact => fact.id === id)?.sourceType === 'day_stem')))
  assert.ok(rendered.L.currentExpression.sourceFactIds.some(id => fixtures.L.current.temporaryFacts.some(fact => fact.id === id)))
  assert.deepEqual(sections.slice(0, -1).map(section => rendered.L[section]),
    sections.slice(0, -1).map(section => renderPersonalityJa({ natal: fixtures.L.natal })[section]))
  assert.ok(fixtures.N.current.effectHistory.some(item => item.expired))
  assert.equal(rendered.N.currentExpression, undefined)
  const inactive = fixtures.J.current.structuralRoleModifiers.filter(item => item.status === 'inactive')
  assert.ok(inactive.length && inactive.every(item => !rendered.J.currentExpression?.sourceModifierIds.includes(item.id)))
  assert.ok(!fixtures.O.natal.facts.some(fact => fact.sourcePosition?.startsWith('hour_')))
  assert.ok(!paragraphs(rendered.O).some(p => p.sourceFactIds.some(id => id.includes(':hour_'))))
  assert.ok(fixtures.I.natal.structuralRoleModifiers.every(item => item.sourceRole !== 'byeong'))
  assert.deepEqual(rendered.I.cautions, renderPersonalityJa({ natal: { ...fixtures.I.natal, structuralRoleModifiers: [] } }).cautions)

  const comparison = {
    A: rendered.A.overview.paragraphs[0].text,
    B: [rendered.B.outward.paragraphs.find(p => /核心を鋭く/u.test(p.text)).text,
      rendered.B.decision.paragraphs.find(p => /慎重に決める/u.test(p.text)).text].join(' '),
    C: pair.text,
    D: overviewD.text,
    E: roleSample('G', operation('supports_expression'), /支えている/u, 'confirmed'),
    F: roleSample('G', operation('channels_expression'), /方向づけに使われている/u, 'confirmed'),
    G: restraint.text,
    H: roleSample('O', operation('distorts_expression'), /妨げている/u, 'confirmed'),
    I: roleSample('D', operation('protects_expression'), /力を発揮できるように支えている/u, 'confirmed'),
    J: roleSample('H', operation('resolves_tension'), /緊張を和らげている/u, 'confirmed'),
    K: roleSample('F', context('protective_standby'), /必要になったときは.*支えになることもある/u, 'conditional'),
    L: roleSample('G', context('conditional_byeong'), /普段から.*場面では.*妨げることもある/u, 'conditional'),
    M: roleSample('E', item => item.operation === 'distorts_expression'
      && item.status === 'confirmed' && item.currentFunction === 'operating', /^今は.*妨げている/u, 'confirmed', true),
    N: rendered.I.cautions.paragraphs[0].text,
    O: rendered.L.currentExpression.paragraphs.find(p => p.sourceFactIds.some(id =>
      fixtures.L.current.temporaryFacts.some(fact => fact.id === id))).text,
    P: '',
    Q: rendered.O.overview.paragraphs[0].text,
    reduced: roleSample('K', item => item.status === 'reduced', /働きは弱まっている/u, 'conditional'),
  }

  for (const path of ['render/ja/renderPersonalityJa.ts', 'render/ja/wording.ts', 'render/ja/guardrails.ts',
    'render/renderPersonality.ts', 'render/types.ts']) {
    assert.doesNotMatch(rawSource(path), /renderPersonalityKo|Japanese(?:Personality|TenGod|Luck)Engine|JudgmentResult|(?:\/ko\/|\/judgment\/|\/knowledge\/)/u)
  }
  assert.match(rawSource('render/ja/renderPersonalityJa.ts'), /renderPersonality\(input, wording\)/u)
  assert.match(rawSource('index.ts'), /buildNatalPersonality.*natalPersonality/u)

  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify({ comparison, rendered }, null, 2) + '\n')
  console.log('PASS P3-D automated checks: 17 comparison scenarios, reduced and inactive checks, and shared engine boundary')
} finally {
  await server.close()
}
