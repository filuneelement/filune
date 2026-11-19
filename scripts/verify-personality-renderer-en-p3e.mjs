import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { freeze, loadPersonalityRendererFixtures } from './fixtures/personality-renderer.mjs'

export let auditResult

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
  const { buildNatalPersonality, renderPersonalityEn, renderPersonalityJa, renderPersonalityKo } = await load('personality/index')
  const { traitPhraseEn } = await load('personality/render/en/wording')
  const { isCustomerSafeEn } = await load('personality/render/en/guardrails')
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
  const dictionary = rawSource('render/en/wording.ts').split('new Map([')[1].split('\n])')[0].trim()
  const keys = dictionary.split('\n').map(line => {
    const row = line.trim().match(/^\["([^"]+)", "(?:[^"\\]|\\.)+"\],$/u)
    assert.ok(row, line)
    return row[1]
  })
  assert.equal(keys.length, new Set(keys).size, 'duplicate declaration')
  assert.equal(keys.length, new Set(keys.map(key => key.trim())).size, 'SEMANTIC_COLLISION')
  assert.deepEqual(sorted(keys.filter(key => !registry.has(key))), ['빠른 판단'])
  const equivalents = new Map()
  for (const trait of registry) {
    assert.ok(keys.includes(trait), `UNMAPPED_TRAIT: ${trait}`)
    const phrase = traitPhraseEn(trait)
    assert.equal(traitPhraseEn(` \t${trait}　`), phrase)
    assert.ok(isCustomerSafeEn(phrase), `unsafe atomic wording: ${trait}`)
    const rendered = renderPersonalityEn({ natal: { ...soloNatal, facts: [{ ...base, trait }] } })
    assert.ok(rendered.overview?.text.includes(phrase), `empty or lost: ${trait}`)
    assert.deepEqual(rendered.overview.sourceFactIds, [base.id])
    const like = equivalents.get(phrase) ?? []
    like.push(trait)
    equivalents.set(phrase, like)
  }
  assert.ok([...equivalents.values()].every(group => group.length === 1), 'ambiguous canonical output phrase')
  assert.equal(traitPhraseEn('빠른 판단'), traitPhraseEn('신속한 판단'))
  for (const variant of [base.trait + '.', base.trait + ' (변형)', base.trait + '은', base.trait.replaceAll(' ', '  ')]) {
    assert.throws(() => renderPersonalityEn({ natal: { ...soloNatal, facts: [{ ...base, trait: variant }] } }),
      /^Error: UNMAPPED_TRAIT:/u)
  }
  console.log('PASS dictionary: 348/348, duplicate keys 0, collision 0, ambiguous 0, empty 0, guardrail loss 0')

  const forbiddenSamples = [
    '독립성', '判断のしかた', 'だよ', '甲', 'Day Master', 'Companion', 'Rooted',
    'Yong Shen', 'Xiang Shen', 'Jiu Ying', 'sourceFactId', 'RoleModifier', 'confirmed',
    'thou', 'destiny decrees', 'beware of danger', 'disaster', 'your boss', 'your husband',
    "you'll meet someone", 'you changed jobs', 'hospital', 'pain', '70%', 'ranking',
    'your strongest trait', 'for entertainment only', 'your deepest value',
  ]
  for (const sample of forbiddenSamples) assert.ok(!isCustomerSafeEn(sample), sample)
  for (const sample of ["You think things through.", "It's easier to act on a clear choice."]) {
    assert.ok(isCustomerSafeEn(sample), sample)
  }
  function audit(input, label) {
    const references = [renderPersonalityKo(input), renderPersonalityJa(input)]
    const en = renderPersonalityEn(input)
    for (const section of sections) {
      const j = en[section]
      const evidenceByCertainty = (block, ref) => sorted((block?.paragraphs ?? [])
        .flatMap(p => p[ref].map(id => JSON.stringify([p.certainty, id]))))
      const linked = block => sorted((block?.paragraphs ?? [])
        .filter(p => p.sourceModifierIds.length || p.sourceConflictIds.length)
        .map(p => JSON.stringify([p.certainty, ...refs.map(ref => p[ref])])))
      for (const reference of references) {
        const k = reference[section]
        assert.equal(j?.certainty, k?.certainty, `${label}: ${section} certainty`)
        assert.deepEqual(linked(j), linked(k), `${label}: ${section} role or conflict linkage`)
        for (const ref of refs) {
          assert.deepEqual(j?.[ref], k?.[ref], `${label}: ${section} ${ref}`)
          assert.deepEqual(evidenceByCertainty(j, ref), evidenceByCertainty(k, ref), `${label}: ${section} ${ref} certainty`)
        }
      }
      if (!j) continue
      const text = j.heading + '\n' + j.text
      assert.ok(isCustomerSafeEn(text), label)
      assert.doesNotMatch(text, /[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u)
      assert.doesNotMatch(text, /audit-name|(?:様|ちゃん)[、。]/u)
      assert.ok(j.paragraphs.every(item => item.sourceFactIds.length && !refs.some(ref => item[ref].some(id => text.includes(id)))))
    }
    return en
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
  assert.match(restraint.text, /holds back how another tendency comes through/u)

  const conflict = fixtures.C.natal.conflicts.find(item => item.conflictType === 'source_explicit')
  const pair = rendered.C.emotion.paragraphs.find(item => item.sourceConflictIds.includes(conflict.id))
  assert.deepEqual(pair.sourceFactIds, sorted(conflict.factIds))
  assert.match(pair.text, /want to be out in front.*hesitate while checking|hesitate while checking.*want to be out in front/u)
  const overviewD = rendered.C.overview.paragraphs.find(item =>
    item.sourceFactIds.some(id => fixtures.C.natal.facts.find(fact => fact.id === id)?.sourceType === 'day_pillar'))
  assert.ok(overviewD && rendered.C.overview.paragraphs.some(item => item.sourceFactIds.includes(base.id)
    || item.sourceFactIds.some(id => fixtures.C.natal.facts.find(fact => fact.id === id)?.sourceType === 'day_stem')))
  assert.ok(rendered.L.currentExpression.sourceFactIds.some(id => fixtures.L.current.temporaryFacts.some(fact => fact.id === id)))
  assert.deepEqual(sections.slice(0, -1).map(section => rendered.L[section]),
    sections.slice(0, -1).map(section => renderPersonalityEn({ natal: fixtures.L.natal })[section]))
  assert.ok(fixtures.N.current.effectHistory.some(item => item.expired))
  assert.equal(rendered.N.currentExpression, undefined)
  const inactive = fixtures.J.current.structuralRoleModifiers.filter(item => item.status === 'inactive')
  assert.ok(inactive.length && inactive.every(item => !rendered.J.currentExpression?.sourceModifierIds.includes(item.id)))
  assert.ok(!fixtures.O.natal.facts.some(fact => fact.sourcePosition?.startsWith('hour_')))
  assert.ok(!paragraphs(rendered.O).some(p => p.sourceFactIds.some(id => id.includes(':hour_'))))
  assert.ok(fixtures.I.natal.structuralRoleModifiers.every(item => item.sourceRole !== 'byeong'))
  assert.deepEqual(rendered.I.cautions, renderPersonalityEn({ natal: { ...fixtures.I.natal, structuralRoleModifiers: [] } }).cautions)

  const comparison = {
    A: rendered.A.overview.paragraphs[0].text,
    B: [rendered.B.outward.paragraphs.find(p => /heart of a matter/u.test(p.text)).text,
      rendered.B.decision.paragraphs.find(p => /make careful decisions/u.test(p.text)).text].join(' '),
    C: pair.text,
    D: overviewD.text,
    E: roleSample('G', operation('supports_expression'), /helps another tendency come through/u, 'confirmed'),
    F: roleSample('G', operation('channels_expression'), /shapes the direction/u, 'confirmed'),
    G: restraint.text,
    H: roleSample('O', operation('distorts_expression'), /is getting in the way/u, 'confirmed'),
    I: roleSample('D', operation('protects_expression'), /helps keep another tendency working/u, 'confirmed'),
    J: roleSample('H', operation('resolves_tension'), /eases the tension/u, 'confirmed'),
    K: roleSample('F', context('protective_standby'), /When support is needed.*can help keep/u, 'conditional'),
    L: roleSample('G', context('conditional_byeong'), /everyday situations.*When this response overlaps.*can get in the way/u, 'conditional'),
    M: roleSample('E', item => item.operation === 'distorts_expression'
      && item.status === 'confirmed' && item.currentFunction === 'operating', /^Right now.*is getting in the way/u, 'confirmed', true),
    N: rendered.I.cautions.paragraphs[0].text,
    O: rendered.L.currentExpression.paragraphs.find(p => p.sourceFactIds.some(id =>
      fixtures.L.current.temporaryFacts.some(fact => fact.id === id))).text,
    P: '',
    Q: rendered.O.overview.paragraphs[0].text,
    reduced: roleSample('K', item => item.status === 'reduced', /That effect is weaker/u, 'conditional'),
  }

  for (const path of ['render/en/renderPersonalityEn.ts', 'render/en/wording.ts', 'render/en/guardrails.ts',
    'render/renderPersonality.ts', 'render/types.ts']) {
    assert.doesNotMatch(rawSource(path), /renderPersonalityKo|renderPersonalityJa|English(?:Personality|TenGod|Luck|StructuralRole)Engine|JudgmentResult|(?:\/ko\/|\/ja\/|\/judgment\/|\/knowledge\/)/u)
  }
  assert.match(rawSource('render/en/renderPersonalityEn.ts'), /renderPersonality\(input, wording\)/u)
  assert.match(rawSource('index.ts'), /buildNatalPersonality.*natalPersonality/u)

  const reverse = items => [...items].reverse()
  for (const [id, input] of Object.entries(fixtures)) {
    assert.deepEqual(renderPersonalityEn(input), rendered[id])
    const { natal, current } = input
    assert.deepEqual(renderPersonalityEn({
      natal: { ...natal, facts: reverse(natal.facts), conflicts: reverse(natal.conflicts),
        positionExpressions: reverse(natal.positionExpressions), structuralRoleModifiers: reverse(natal.structuralRoleModifiers) },
      current: current && { ...current, currentFacts: reverse(current.currentFacts),
        temporaryFacts: reverse(current.temporaryFacts), conflicts: reverse(current.conflicts),
        structuralRoleModifiers: reverse(current.structuralRoleModifiers), effectHistory: reverse(current.effectHistory) },
    }), rendered[id])
  }
  assert.doesNotMatch(comparison.M, /\b(?:may|might|perhaps|can)\b/u)
  assert.match(comparison.O, /^Right now/u)
  const { natal, current } = fixtures.L
  const repeated = current.currentFacts.find(fact => fact.origin === 'natal' && fact.currentlyEffective && fact.origins.length)
  assert.ok(repeated)
  const sameTrait = output => output.currentExpression.paragraphs
    .find(p => p.sourceFactIds.includes(repeated.personalityFactId))
  assert.match(sameTrait(rendered.L).text, /part of a familiar response/u)
  const reducedCurrent = { ...current, currentFacts: current.currentFacts.map(fact =>
    fact === repeated ? { ...fact, state: 'reduced' } : fact) }
  assert.match(sameTrait(audit({ natal, current: reducedCurrent }, 'reduced current fact')).text, /less strongly/u)
  const stale = { ...current, effectHistory: current.effectHistory.map(event =>
    ({ ...event, expired: true, currentlyEffective: false })) }
  assert.equal(audit({ natal, current: stale }, 'stale current').currentExpression, undefined)

  const operations = {
    supports_expression: /help(?:s)? another tendency come through/u,
    channels_expression: /shape(?:s)? the direction/u,
    restrains_expression: /hold(?:s)? back how another tendency/u,
    distorts_expression: /(?:is getting|can get) in the way/u,
    protects_expression: /help(?:s)? keep another tendency working/u,
    resolves_tension: /ease(?:s)? the tension/u,
    contextualizes: /work(?:s)? differently depending on the situation/u,
  }
  let matrixCount = 0
  for (const [name, pattern] of Object.entries(operations)) {
    for (const status of ['confirmed', 'contextual', 'deferred', 'reduced', 'inactive']) {
      const modifier = { ...restrained, id: 'audit-en-role', operation: name, status,
        targetPersonalityFactIds: [base.id] }
      const input = fixtures.A
      const scenario = { natal: input.natal, current: { ...input.current, structuralRoleModifiers: [modifier] } }
      const output = audit(scenario, `${name} / ${status}`)
      const matches = output.currentExpression?.paragraphs.filter(p => p.sourceModifierIds.includes(modifier.id)) ?? []
      assert.equal(matches.length, status === 'inactive' ? 0 : 1)
      if (matches.length) {
        const { text, certainty } = matches[0]
        const assertive = status === 'confirmed' && name !== 'contextualizes'
        assert.match(text, pattern)
        assert.equal(certainty, assertive ? 'confirmed' : 'conditional')
        if (assertive) assert.doesNotMatch(text, /\b(?:can|may|might|perhaps)\b/u)
        else assert.match(text, /\bcan\b/u)
        if (status === 'reduced') assert.match(text, /That effect is weaker/u)
      }
      matrixCount++
    }
  }
  assert.equal(matrixCount, 35)
  console.log('PASS operation and state matrix: 35/35')

  auditResult = { comparison, rendered }
  if (process.argv[2] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    writeFileSync(process.argv[2], JSON.stringify(auditResult, null, 2) + '\n')
  }
  console.log('PASS P3-E automated checks: 17 comparison scenarios, reduced and inactive checks, and shared engine boundary')
} finally {
  await server.close()
}
