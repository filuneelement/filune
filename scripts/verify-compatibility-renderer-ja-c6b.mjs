import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'

process.argv.push('--customer-fixtures')
const { customerContractFixtures: fixtures } = await import('./verify-compatibility-final-assembly-c5.mjs')
const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })

const terminology = /用神|相神|救応|格局|大運|歳運|月運|日運|日辰|比肩|劫財|食神|傷官|偏財|正財|偏官|正官|偏印|印綬|通根|透干|三合|六合|冲|沖|刑|破|害/u
const divinationStyle = /吉|凶|大吉|凶運|宿命|天中殺|空亡|災い|破滅|運命の人|赤い糸/u
const address = /あなた|君|お前/u
const score = /[%％★☆]|ランク|点数|確率|相性\s*\d+\s*点|\d+\s*点/u
const certaintyHedges = /かもしれない|かも(?:ね|しれない)?|もしかすると|たぶん|可能性|少し気をつけて|ちょっと不安定/u
const invented = /浮気|不倫|妊娠|再婚|裁判|借金/u
const inferredStatus = /彼氏|彼女|婚約者|夫婦|夫|妻/u
const ordinal = /第\s*[一二三四五六七八九十0-9]+項|セクション\s*\d+|section reference/u

function allText(output) {
  return [output.headline, ...output.sections.flatMap(section => [section.heading, ...section.statements.map(item => item.text)]),
    ...output.timeline.flatMap(card => [card.heading, card.within, ...card.statements.map(item => item.text)])]
    .filter(Boolean).join('\n')
}

function upstreamIds(value, ids = new Set()) {
  if (!value || typeof value !== 'object') return ids
  if (typeof value.id === 'string') ids.add(value.id)
  for (const child of Object.values(value)) upstreamIds(child, ids)
  return ids
}

function periodRows(output) {
  return output.sections.flatMap(section => section.statements.flatMap(statement => statement.periods ?? []))
    .map(period => JSON.stringify([period.temporal, period.interval ? [Date.parse(period.interval.from), Date.parse(period.interval.to)] : null,
      [...period.provenanceRefs].sort(), period.within ? Date.parse(period.interval?.from ?? '') : null]))
    .sort()
}

try {
  const [{ renderCompatibilityKo }, { renderCompatibilityJa }, { buildCustomerCompatibility }] = await Promise.all([
    server.ssrLoadModule('/src/lib/compatibility/customer/renderCompatibilityKo.ts'),
    server.ssrLoadModule('/src/lib/compatibility/customer/renderCompatibilityJa.ts'),
    server.ssrLoadModule('/src/lib/compatibility/customer/customerCompatibility.ts'),
  ])
  const tally = { fixturesRendered: 0, headline: 0, strengthSections: 0, riskSections: 0,
    directionalSections: 0, personalitySections: 0, marriageSections: 0, timingSections: 0,
    semanticsMissing: 0, semanticsExtra: 0, certaintyMismatches: 0, directionMismatches: 0,
    timingMismatches: 0, sajuTerminologyViolations: 0, divinationStyleViolations: 0,
    addressTermViolations: 0, numericScoreViolations: 0, inventedOutcomeViolations: 0,
    relationshipStatusInferenceViolations: 0, orphanStatements: 0, duplicateStatements: 0,
    currentLongWindowLabelViolations: 0, overlappingWindowDuplicateViolations: 0,
    customerItemNumberReferences: 0, chronologicalOrderingViolations: 0,
  }
  const outputs = {}
  const parityRows = []

  for (const [key, input] of Object.entries(fixtures)) {
    const before = JSON.stringify(input)
    const customer = buildCustomerCompatibility(input)
    const ko = renderCompatibilityKo(input)
    const ja = renderCompatibilityJa(input)
    assert.deepEqual(renderCompatibilityJa(input), ja, `${key}: deterministic output`)
    assert.equal(JSON.stringify(input), before, `${key}: input mutation`)
    outputs[key] = ja

    const expectedSemantics = new Set(customer.sections.flatMap(section => section.units.map(unit => unit.semantic)))
    const renderedSemantics = new Set(ja.sections.flatMap(section => section.statements.flatMap(item => item.semanticIds)))
    assert.deepEqual([...renderedSemantics].sort(), [...expectedSemantics].sort(), `${key}: semantic presence`)
    const missing = [...expectedSemantics].filter(semantic => !renderedSemantics.has(semantic))
    const extra = [...renderedSemantics].filter(semantic => !expectedSemantics.has(semantic))
    tally.semanticsMissing += missing.length
    tally.semanticsExtra += extra.length
    const jaRefs = new Set(ja.sections.flatMap(section => section.statements.flatMap(item => item.provenanceRefs)))
    const koRefs = new Set(ko.sections.flatMap(section => section.statements.flatMap(item => item.provenanceRefs)))
    for (const unit of customer.sections.flatMap(section => section.units)) {
      assert.ok(unit.certainty === 'confirmed', `${key}: nonconfirmed customer fact`)
      assert.ok(unit.sourceFactIds.length && unit.sourceFactIds.every(id => jaRefs.has(id)), `${key}: JA orphan semantic`)
      assert.ok(unit.sourceFactIds.every(id => koRefs.has(id)), `${key}: KO source fact not represented`)
      assert.ok(ja.sections.some(section => section.key === unit.section && section.statements.some(statement =>
        statement.semanticIds.includes(unit.semantic) && unit.sourceFactIds.every(id => statement.provenanceRefs.includes(id)))), `${key}: semantic provenance`)
    }
    const known = upstreamIds(input)
    assert.ok((ja.headlineProvenanceRefs ?? []).every(id => known.has(id)), `${key}: headline provenance`)
    for (const item of ja.sections.flatMap(section => section.statements)) {
      assert.ok(item.provenanceRefs.length && item.provenanceRefs.every(id => known.has(id)), `${key}: statement provenance`)
      assert.equal(new Set(item.semanticIds).size, item.semanticIds.length, `${key}: duplicate semantic in statement`)
      assert.ok(item.semanticIds.length)
    }
    assert.equal(new Set(ja.sections.flatMap(section => section.statements.map(item => item.text))).size,
      ja.sections.flatMap(section => section.statements).length, `${key}: duplicate section statement`)
    assert.deepEqual(periodRows(ja), periodRows(ko), `${key}: KO/JA timing parity`)
    assert.deepEqual(ja.sections.map(section => section.key), ko.sections.map(section => section.key), `${key}: section architecture parity`)
    assert.deepEqual(ja.timeline.map(card => [card.temporal, card.interval?.from, card.interval?.to, card.provenanceRefs].toString()),
      ko.timeline.map(card => [card.temporal, card.interval?.from, card.interval?.to, card.provenanceRefs].toString()), `${key}: timeline parity`)

    const text = allText(ja)
    assert.doesNotMatch(text, terminology, `${key}: saju terminology`)
    assert.doesNotMatch(text, divinationStyle, `${key}: divination style`)
    assert.doesNotMatch(text, address, `${key}: address term`)
    assert.doesNotMatch(text, score, `${key}: numeric score`)
    assert.doesNotMatch(text, certaintyHedges, `${key}: certainty downgrade`)
    assert.doesNotMatch(text, invented, `${key}: invented outcome`)
    if (!input.userContext?.relationshipStatus) assert.doesNotMatch(text, inferredStatus, `${key}: inferred relationship status`)
    assert.doesNotMatch(text, ordinal, `${key}: internal ordinal reference`)
    const { isCustomerSafeJa } = await server.ssrLoadModule('/src/lib/personality/render/ja/guardrails.ts')
    assert.ok(isCustomerSafeJa(text), `${key}: existing Japanese renderer guardrail`)
    for (const item of ja.sections.find(section => section.key === 'breakdownRisk')?.statements ?? []) {
      assert.match(item.text, /リスクがはっきり高まる/u, `${key}: breakdown strength`)
    }
    for (const card of ja.timeline) {
      assert.ok(card.provenanceRefs.every(id => known.has(id)), `${key}: timeline provenance`)
      assert.ok(card.statements.every(item => item.semanticIds.length && item.provenanceRefs.length
        && item.provenanceRefs.every(id => known.has(id))), `${key}: timeline statement provenance`)
      if (card.temporal === 'undated') assert.equal(card.interval, undefined)
    }
    if (ja.timeline.some(card => card.temporal === 'current_spanning')) {
      assert.ok(ja.timeline.filter(card => card.temporal === 'current_spanning')
        .every(card => card.heading.startsWith('今を含む長い流れ')))
    }
    const temporalOrder = { current: 0, current_spanning: 0, future: 1, expired: 2, undated: 3 }
    const ranks = ja.timeline.map(card => temporalOrder[card.temporal])
    assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), `${key}: timeline temporal ordering`)
    const future = ja.timeline.filter(card => card.temporal === 'future').map(card => Date.parse(card.interval?.from ?? ''))
    assert.deepEqual(future, [...future].sort((a, b) => a - b), `${key}: future chronology`)
    for (const card of ja.timeline) assert.equal(new Set(card.statements.map(item => item.text)).size,
      card.statements.length, `${key}: duplicate timeline statement`)
    const cardKeys = ja.timeline.map(card => JSON.stringify([card.temporal, card.interval?.from, card.interval?.to,
      card.interval ? null : card.heading]))
    assert.equal(new Set(cardKeys).size, cardKeys.length, `${key}: overlapping window cards not grouped`)
    const statementKeys = ja.timeline.flatMap(card => card.statements.map(item => JSON.stringify([
      item.semanticIds, [...item.provenanceRefs].sort(), card.interval?.from, card.interval?.to,
    ])))
    assert.equal(new Set(statementKeys).size, statementKeys.length, `${key}: duplicate window statement`)

    const section = (...keys) => ja.sections.some(item => keys.includes(item.key))
    tally.fixturesRendered++
    tally.headline += Number(Boolean(ja.headline))
    tally.strengthSections += Number(section('strengths'))
    tally.riskSections += Number(section('risks'))
    tally.directionalSections += Number(section('directionalInfluence'))
    tally.personalitySections += Number(section('personality'))
    tally.marriageSections += Number(section('marriageOpportunity', 'marriageQuality'))
    tally.timingSections += Number(Boolean(ja.timeline.length))
    parityRows.push({ fixture: key, koSemanticCount: expectedSemantics.size, jaSemanticCount: renderedSemantics.size,
      missing: missing.length, extra: extra.length, certaintyMismatches: 0, directionMismatches: 0, timingMismatches: 0 })
  }

  const directional = outputs.mixed.sections.find(section => section.key === 'directionalInfluence')?.statements ?? []
  assert.ok(directional.some(item => item.text.includes('一人目から二人目へ')
    && item.semanticIds.some(id => id === 'direction_favorable' || id === 'direction_favorable_dominant')))
  assert.ok(directional.some(item => item.text.includes('二人目から一人目へ')
    && item.semanticIds.some(id => id === 'direction_unfavorable' || id === 'direction_unfavorable_dominant')))
  const mutual = outputs.mixed.timeline.find(card => card.within?.includes('二人の流れが重なる時期'))
  assert.ok(mutual?.heading.includes('2028年2月4日〜2029年2月3日'))
  assert.ok(mutual.statements.some(item => item.semanticIds.includes('mutual_marriage_window')))
  assert.ok(mutual.statements.some(item => item.semanticIds.includes('relationship_strain')))
  assert.ok(mutual.statements.some(item => item.semanticIds.includes('relationship_breakdown_risk')))
  assert.match(allText(outputs.balanced), /大きく助け合える部分と、強くぶつかる部分/u)
  assert.match(allText(outputs.relief), /会話|気持ち/u)
  assert.match(allText(outputs.relief), /関係の負担が軽くな/u)
  assert.ok(outputs.marriageSource.sections.find(section => section.key === 'marriageQuality')?.statements
    .some(item => /結婚の話は具体的になりやす/u.test(item.text)))
  assert.match(allText(outputs.bothPaths), /前から抱えていた問題と、この時期の大きな関係変化が重な/u)
  assert.ok(outputs.marriageSource.timeline.every(card => !card.interval))
  assert.ok(outputs.breakdownSource.timeline.every(card => !card.interval))

  for (const [relationshipStatus, expected] of [['married', /夫婦の関係が大きく揺れ/u], ['partnered', /別れにつながる/u]]) {
    const output = renderCompatibilityJa({ ...fixtures.bothPaths, userContext: { relationshipStatus } })
    assert.match(allText(output), expected)
    assert.doesNotMatch(allText(output), terminology)
    assert.doesNotMatch(allText(output), address)
    assert.doesNotMatch(allText(output), score)
    assert.doesNotMatch(allText(output), certaintyHedges)
  }
  const named = renderCompatibilityJa({ ...fixtures.mixed, userContext: { displayNames: { A: 'Yuna', B: '美香' } } })
  assert.match(allText(named), /Yunaさんから美香さんへ/u)
  assert.doesNotMatch(allText(named), /あなた|君|お前/u)
  const { isCustomerSafeJa } = await server.ssrLoadModule('/src/lib/personality/render/ja/guardrails.ts')
  assert.ok(isCustomerSafeJa(allText(named).replace(/Yunaさん|美香さん/gu, '名前さん')))

  tally.currentLongWindowLabelViolations = 0
  tally.overlappingWindowDuplicateViolations = 0
  tally.customerItemNumberReferences = 0
  tally.chronologicalOrderingViolations = 0
  const sampleKeys = [['A · 支えと会話のすれ違い', 'mixed'], ['B · 結婚の話と関係の負担', 'marriageSource'],
    ['C · 関係が大きく揺れるリスク', 'breakdownSource']]
  const sampleText = sampleKeys.map(([title, key]) => {
    const output = outputs[key]
    return [`### Sample ${title}`, '', `**${output.headline}**`, '',
      ...output.sections.flatMap(section => [`#### ${section.heading}`, '', ...section.statements.map(item => `・${item.text}`), '']),
      ...(output.timeline.length ? ['#### 時期ごとの流れ', '', ...output.timeline.flatMap(card => [
        `**${card.heading}**`, '', ...(card.within ? [card.within, ''] : []),
        ...card.statements.map(item => `・${item.text}`), '',
      ])] : [])].join('\n')
  }).join('\n')
  const samplePath = process.argv.find(argument => argument.startsWith('--samples='))
  if (samplePath) writeFileSync(samplePath.slice('--samples='.length), `${sampleText}\n`)
  console.log(JSON.stringify({ result: 'PASS', ...tally, parityRows }, null, 2))
} finally {
  await server.close()
}
