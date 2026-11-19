import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createServer } from 'vite'
import { loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

const sections = ['overview', 'outward', 'closeRelations', 'decision', 'emotion', 'strengths', 'cautions', 'currentExpression']
const evidenceKeys = ['sourceFactIds', 'sourceModifierIds', 'sourceConflictIds']
const counts = Object.fromEntries([...sections, 'conflicts'].map(section => [section, { ko: 0, ja: 0 }]))
const paragraphs = result => sections.flatMap(section => result[section]?.paragraphs ?? [])
const unique = items => [...new Set(items)].sort()
const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')

const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
let testCount = 0
function check(id, label, run) {
  try {
    run()
    ++testCount
    console.log(`PASS ${id} ${label}`)
  } catch (cause) {
    throw new Error(`${id} ${label}`, { cause })
  }
}

try {
  const fixtures = Object.fromEntries((await loadPersonalityRendererFixtures(load))
    .map(([id, , { natal, current }]) => [id, { natal, current }]))
  const { renderPersonalityJa } = await load('personality/render/ja/renderPersonalityJa')
  const { renderPersonalityKo } = await load('personality/render/ko/renderPersonalityKo')
  const { buildNatalPersonality } = await load('personality/natalPersonality')
  const { DAY_PILLAR_PROFILES } = await load('personality/knowledge/dayPillarProfiles')
  const { DAY_STEM_PROFILES } = await load('personality/knowledge/dayStemProfiles')
  const { TEN_GOD_PROFILES } = await load('personality/knowledge/tenGodProfiles')
  const fields = await load('personality/facts/personalityFacts')
  const { traitPhraseJa } = await load('personality/render/ja/wording')
  const { isCustomerSafeJa } = await load('personality/render/ja/guardrails')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')

  function parity(input, label, count = false) {
    const ko = renderPersonalityKo(input)
    const ja = renderPersonalityJa(input)
    for (const section of sections) {
      assert.equal(ja[section]?.certainty, ko[section]?.certainty, `${label}: ${section} certainty`)
      const grouped = (block, key) => unique((block?.paragraphs ?? [])
        .flatMap(item => item[key].map(id => JSON.stringify([item.certainty, id]))))
      for (const key of evidenceKeys) {
        assert.deepEqual(ja[section]?.[key], ko[section]?.[key], `${label}: ${section} ${key}`)
        assert.deepEqual(grouped(ja[section], key), grouped(ko[section], key), `${label}: ${section} ${key} / certainty`)
        if (count) {
          counts[section].ko += ko[section]?.[key].length ?? 0
          counts[section].ja += ja[section]?.[key].length ?? 0
          if (key === 'sourceConflictIds') {
            counts.conflicts.ko += ko[section]?.[key].length ?? 0
            counts.conflicts.ja += ja[section]?.[key].length ?? 0
          }
        }
      }
      const linked = block => unique((block?.paragraphs ?? [])
        .filter(item => item.sourceModifierIds.length || item.sourceConflictIds.length)
        .map(item => JSON.stringify([item.certainty, ...evidenceKeys.map(key => item[key])])))
      assert.deepEqual(linked(ja[section]), linked(ko[section]), `${label}: ${section} role and conflict links`)
      if (ja[section]) {
        assert.ok(isCustomerSafeJa(ja[section].heading), ja[section].heading)
        assert.ok(isCustomerSafeJa(ja[section].text), ja[section].text)
        assert.equal(ja[section].text, ja[section].paragraphs.map(item => item.text).join('\n\n'))
        for (const item of ja[section].paragraphs) {
          assert.ok(item.sourceFactIds.length, item.text)
          assert.ok(item.text.endsWith('。'), item.text)
        }
      }
    }
    return ja
  }

  const input = id => fixtures[id]
  const results = Object.fromEntries(Object.entries(fixtures).map(([id, fixture]) => [id, parity(fixture, id, true)]))
  const role = (id, condition, current = false) => (current ? input(id).current : input(id).natal).structuralRoleModifiers.find(condition)
  const roleParagraph = (id, modifier, current = false) => {
    assert.ok(modifier)
    const pool = current ? results[id].currentExpression.paragraphs : paragraphs(results[id])
    const item = pool.find(item => item.sourceModifierIds.includes(modifier.id))
    assert.ok(item, modifier.id)
    return item
  }
  const { natal, current } = input('L')
  const empty = { ...natal, facts: [], conflicts: [], structuralRoleModifiers: [] }

  check('A', 'direct natal input', () => {
    const directory = new URL('src/lib/personality/render/ja/', root)
    for (const filename of readdirSync(directory)) {
      const code = readFileSync(new URL(filename, directory), 'utf8')
      assert.doesNotMatch(code, /renderPersonalityKo|[/'"]ko\/|JudgmentResult|[/'"]judgment\//u)
    }
    assert.doesNotMatch(read('src/lib/personality/render/renderPersonality.ts'), /renderPersonalityKo|[/'"]ko\/|JudgmentResult|[/'"]judgment\//u)
    assert.match(results.A.overview.text, /もともと、.*明るさが表に出る/u)
  })
  check('B', 'outward and inward positions', () => {
    assert.match(results.B.outward.text, /表では、.*核心を鋭く/u)
    assert.match(results.B.decision.text, /内面では、知識と検討をもとに慎重に決める/u)
  })
  check('C', 'both sides of a day pillar conflict', () => {
    const conflict = input('C').natal.conflicts.find(item => item.conflictType === 'source_explicit')
    const item = results.C.emotion.paragraphs.find(item => item.sourceConflictIds.includes(conflict.id))
    assert.deepEqual(item.sourceFactIds, unique(conflict.factIds))
    assert.match(item.text, /先頭に立ちたい/u)
    assert.match(item.text, /もう一度確かめてためらう/u)
    const temporary = input('M').current.conflicts.find(conflict =>
      results.M.currentExpression.sourceConflictIds.includes(conflict.id))
    assert.ok(temporary)
    const currentPair = results.M.currentExpression.paragraphs.find(item => item.sourceConflictIds.includes(temporary.id))
    assert.deepEqual(currentPair.sourceFactIds, unique(temporary.factIds))
    assert.equal(currentPair.certainty, 'conditional')
    assert.match(currentPair.text, /^今は、/u)
  })
  check('D', 'day pillar remains additive', () => {
    const facts = input('C').natal.facts.filter(fact => results.C.overview.sourceFactIds.includes(fact.id))
    assert.ok(facts.some(fact => fact.sourceType === 'day_pillar'))
    assert.ok(facts.some(fact => fact.sourceType === 'day_stem'))
  })
  check('E', 'support acts on an existing tendency', () => {
    const item = roleParagraph('G', role('G', item => item.operation === 'supports_expression'))
    assert.match(item.text, /別の傾向が働くのを支え/u)
    assert.doesNotMatch(item.text, /選択の基準|人生の価値観/u)
  })
  check('F', 'conditional interference retains ordinary expression and its trigger', () => {
    const item = roleParagraph('G', role('G', role => role.roleContext === 'conditional_byeong'))
    assert.equal(item.certainty, 'conditional')
    assert.match(item.text, /普段から働いている.*場面では、.*妨げることもある/u)
  })
  check('G', 'confirmed interference is operating now', () => {
    const item = roleParagraph('E', role('E', role => role.operation === 'distorts_expression' && role.status === 'confirmed', true), true)
    assert.equal(item.certainty, 'confirmed')
    assert.match(item.text, /^今は、.*働くのを妨げているよ。$/u)
    assert.doesNotMatch(item.text, /かもしれない|こともある/u)
  })
  check('H', 'protective standby is conditional', () => {
    const item = roleParagraph('F', role('F', role => role.roleContext === 'protective_standby'))
    assert.equal(item.certainty, 'conditional')
    assert.match(item.text, /必要になったときは、.*支えになることもある/u)
  })
  check('I', 'relief references existing tension', () => {
    const item = roleParagraph('H', role('H', role => role.operation === 'resolves_tension'))
    assert.match(item.text, /緊張を和らげ/u)
  })
  check('J', 'no unsupported caution and no inactive role output', () => {
    assert.equal(parity({ natal: { ...empty, facts: natal.facts.filter(fact => fact.traitType === 'core') } }, 'core only').cautions, undefined)
    const inactive = input('J').current.structuralRoleModifiers.filter(role => role.status === 'inactive')
    assert.ok(inactive.length)
    assert.ok(inactive.every(role => !results.J.currentExpression?.sourceModifierIds.includes(role.id)))
    const reduced = roleParagraph('K', role('K', role => role.status === 'reduced'))
    assert.equal(reduced.certainty, 'conditional')
    assert.match(reduced.text, /働きは弱まっている/u)
  })
  check('K', 'temporary traits and repeated natal traits stay in current context', () => {
    const temporary = new Set(current.temporaryFacts.map(fact => fact.id))
    assert.ok(results.L.currentExpression.sourceFactIds.some(id => temporary.has(id)))
    assert.match(results.L.currentExpression.text, /今は、/u)
    const baseline = renderPersonalityJa({ natal })
    for (const section of sections.filter(section => section !== 'currentExpression')) {
      assert.deepEqual(results.L[section], baseline[section])
      assert.ok(!results.L[section]?.sourceFactIds.some(id => temporary.has(id)))
    }
    const repeated = current.currentFacts.find(fact => fact.origin === 'natal' && fact.currentlyEffective && fact.origins.length)
    assert.ok(repeated)
    const repeat = results.L.currentExpression.paragraphs.find(item => item.sourceFactIds.includes(repeated.personalityFactId))
    assert.match(repeat.text, /面も、今の反応に表れることがある/u)
    assert.ok(!paragraphs(baseline).some(item => item.text === repeat.text))
    const weaker = { ...current, currentFacts: current.currentFacts.map(fact =>
      fact === repeated ? { ...fact, state: 'reduced' } : fact) }
    const reduced = parity({ natal, current: weaker }, 'current fact reduced').currentExpression.paragraphs
      .find(item => item.sourceFactIds.includes(repeated.personalityFactId))
    assert.match(reduced.text, /表れ方が弱まっている/u)
  })
  check('L', 'expired structural and temporary effects are omitted', () => {
    assert.ok(input('N').current.effectHistory.some(item => item.expired))
    assert.equal(results.N.currentExpression, undefined)
    const stale = { ...current, effectHistory: current.effectHistory.map(item => ({ ...item, expired: true, currentlyEffective: false })) }
    assert.equal(parity({ natal, current: stale }, 'stale').currentExpression, undefined)
  })
  check('M', 'unknown hour contributes no fact', () => {
    const facts = input('O').natal.facts.filter(fact => fact.sourcePosition?.startsWith('hour_'))
    assert.equal(facts.length, 0)
    assert.ok(!paragraphs(results.O).flatMap(item => item.sourceFactIds).some(id => id.includes(':hour_')))
  })
  check('N', 'source gaps, unknown wording and missing evidence do not generate filler', () => {
    const gap = DAY_PILLAR_PROFILES['癸亥']
    assert.ok(gap.evidenceNotes.some(note => note.note === 'source_gap' && note.fields.includes('corePersonality')))
    assert.ok(!input('P').natal.facts.some(fact => fact.sourceType === 'day_pillar' && fact.traitType === 'core'))
    assert.deepEqual(parity({ natal: empty }, 'empty'), { provenance: [] })
    const fact = natal.facts[0]
    assert.deepEqual(parity({ natal: { ...empty, facts: [{ ...fact, provenanceIds: [] }] } }, 'no provenance'), { provenance: [] })
    assert.throws(() => renderPersonalityJa({ natal: { ...empty, facts: [{ ...fact, trait: '未登録' }] } }),
      /^Error: UNMAPPED_TRAIT:/u)
  })
  check('O', 'canonical 戊午 with no source dispute in customer text', () => {
    assert.equal(input('Q').natal.dayPillarModifier.dayBranchTenGod, '正印')
    assert.ok(!input('Q').natal.facts.some(fact => fact.tenGod === '偏財'))
    assert.doesNotMatch(paragraphs(results.Q).map(item => item.text).join(''), /戊午|原典|出典/u)
  })
  check('P', 'stable results and provenance parity across fixtures and all 60 pillars', () => {
    const reverse = list => [...list].reverse()
    for (const [id, fixture] of Object.entries(fixtures)) {
      const { natal, current } = fixture
      assert.deepEqual(renderPersonalityJa({ natal, current, name: 'お前' }), results[id])
      assert.deepEqual(renderPersonalityJa({
        natal: { ...natal, facts: reverse(natal.facts), positionExpressions: reverse(natal.positionExpressions),
          conflicts: reverse(natal.conflicts), structuralRoleModifiers: reverse(natal.structuralRoleModifiers) },
        current: current && { ...current, currentFacts: reverse(current.currentFacts), temporaryFacts: reverse(current.temporaryFacts),
          conflicts: reverse(current.conflicts), structuralRoleModifiers: reverse(current.structuralRoleModifiers),
          effectHistory: reverse(current.effectHistory) },
      }), results[id])
    }
    for (const ganZhi of Object.keys(DAY_PILLAR_PROFILES)) {
      const [stem, branch] = ganZhi
      const unknown = { status: 'unknown', uncertaintyIds: ['fixture'] }
      const chart = {
        pillars: { day: { status: 'confirmed', value: { stem, branch, ganZhi } }, year: unknown, month: unknown, time: unknown },
        basicRelations: { day: { status: 'confirmed', value: {
          stemTenGod: calculateTenGod(stem, stem), relationships: calculateDayRelationships(stem, branch),
          twelveStage: calculateTwelveStage(stem, branch),
        } }, year: unknown, month: unknown, time: unknown },
      }
      parity({ natal: buildNatalPersonality(chart) }, ganZhi, true)
    }
  })

  const invalid = [
    '用神', '相神', '病', '救応', '比肩', '劫財', '食神', '傷官', '正財', '偏財', '正官', '偏官', '印綬', '偏印',
    '月令', '通変星', '十二運', '身強', '身弱', '五行', '天干', '地支', '戊午', '甲の気質', '酉の気質',
    'あなたは', '君は', 'お前は', '花子様。', '花ちゃん。', 'だぞ。', 'であろう。', 'なり。', 'すべし。', 'と出ております。',
    '宿命', '天中殺', '空亡', '大吉', '凶運', '破滅', '災い', '危険', '不幸が訪れる',
    '転職したでしょう', '別れたはず', '覚えてる？', '実際に失敗した', '夫が', '妻が', '子どもが', '会社で', '上司は',
    '痛む', 'こる', '肩がこる', '張る', '詰まる', '病院', '検診', '90％', '90点', '確率', 'ランク', '★',
    '七殺', '日干', '透干', '大運', '守護神', '正格', '一番強い', '最も目立つ', 'あくまで参考に',
  ]
  for (const text of invalid) assert.ok(!isCustomerSafeJa(text), text)
  for (const text of ['判断するときは、気持ちを整理するよ。', '君主について考える。', '辛抱強く続ける面だよ。', '難しいときに踏ん張る。']) {
    assert.ok(isCustomerSafeJa(text), text)
  }
  console.log(`PASS guardrails: ${invalid.length} forbidden samples and ordinary kanji`)

  const operations = {
    supports_expression: /別の傾向が働くのを支え/u,
    channels_expression: /行動の方向づけ/u,
    restrains_expression: /別の面の表れ方を抑え/u,
    distorts_expression: /別の面が働くのを妨げ/u,
    protects_expression: /別の面が力を発揮/u,
    resolves_tension: /緊張を和らげ/u,
    contextualizes: /場面によって働き方が変わ/u,
  }
  const simple = input('A')
  const anchor = simple.natal.facts.find(fact => fact.status === 'active')
  const base = role('D', item => item.sourceRole === 'sangshen' && item.roleContext === 'assigned')
  assert.ok(anchor && base)
  let operationCount = 0
  for (const [operation, meaning] of Object.entries(operations)) {
    for (const status of ['confirmed', 'contextual', 'deferred', 'reduced', 'inactive']) {
      const modifier = { ...base, id: 'fixture:operation', targetPersonalityFactIds: [anchor.id], operation, status }
      const scenario = { natal: simple.natal, current: { ...simple.current, structuralRoleModifiers: [modifier] } }
      const label = `${operation} / ${status}`
      const output = parity(scenario, label)
      const items = output.currentExpression?.paragraphs.filter(item => item.sourceModifierIds.includes(modifier.id)) ?? []
      assert.equal(items.length, status === 'inactive' ? 0 : 1, label)
      if (status !== 'inactive') {
        const item = items[0]
        assert.deepEqual(item.sourceFactIds, [anchor.id])
        assert.match(item.text, meaning, label)
        const confirmed = status === 'confirmed' && operation !== 'contextualizes'
        assert.equal(item.certainty, confirmed ? 'confirmed' : 'conditional', label)
        if (confirmed) assert.doesNotMatch(item.text, /かもしれない|こともある/u, label)
        else assert.match(item.text, /こともある/u, label)
        if (status === 'reduced') assert.match(item.text, /働きは弱まっている/u, label)
      }
      const unlinked = { ...scenario, current: { ...scenario.current,
        structuralRoleModifiers: [{ ...modifier, targetPersonalityFactIds: [] }] } }
      assert.ok(!parity(unlinked, label + ' without target').currentExpression?.sourceModifierIds.includes(modifier.id))
      operationCount++
    }
  }
  console.log(`PASS operation / certainty matrix: ${operationCount}/35`)

  const lexicon = new Set()
  function collect(profiles, fieldMap) {
    for (const profile of Object.values(profiles)) {
      for (const key of Object.keys(fieldMap)) for (const trait of profile[key]) lexicon.add(trait)
    }
  }
  collect(DAY_STEM_PROFILES, fields.DAY_STEM_FIELDS)
  collect(TEN_GOD_PROFILES, { ...fields.TEN_GOD_BASE_FIELDS, ...fields.TEN_GOD_SHARED_CONTEXT_FIELDS,
    ...fields.TEN_GOD_OUTWARD_FIELDS, ...fields.TEN_GOD_INNER_FIELDS })
  collect(DAY_PILLAR_PROFILES, fields.DAY_PILLAR_FIELDS)
  for (const profile of Object.values(DAY_PILLAR_PROFILES)) {
    for (const conflict of profile.internalConflict) {
      for (const trait of [conflict.sourceA, conflict.sourceB, conflict.tension, ...conflict.possibleExpression]) lexicon.add(trait)
    }
  }
  for (const trait of lexicon) {
    const phrase = traitPhraseJa(trait)
    assert.ok(phrase && isCustomerSafeJa(phrase), `${trait} → ${phrase}`)
  }
  console.log(`PASS lexicon: ${lexicon.size}/${lexicon.size} canonical trait values`)
  console.log('PROVENANCE', JSON.stringify(counts))
  assert.equal(testCount, 16)
  console.log('PASS P3-C 16/16')
} finally {
  await server.close()
}
