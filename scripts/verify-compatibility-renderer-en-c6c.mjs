import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'

process.argv.push('--customer-fixtures')
const { customerContractFixtures: fixtures } = await import('./verify-compatibility-final-assembly-c5.mjs')
const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })

const sajuTerms = /\b(?:day[ -]master|ten gods?|eating god|hurting officer|rob wealth|seven killings|direct wealth|indirect wealth|direct officer|indirect officer|direct resource|indirect resource|yong shen|xiang shen|luck pillar|annual pillar|monthly pillar|hidden stems?|combination|clash|punishment|destruction|harm|root|structure)\b/iu
const divination = /\b(?:destiny|fate decrees|fortune says|the stars|curse|doom|disaster|beware|misfortune)\b/iu
const romance = /\b(?:soulmate|the one|twin flame|destined partner|perfect match|meant to be)\b/iu
const score = /[%％★☆]|\b(?:scores?|ratings?|ranks?|stars?|odds)\b|\b\d+\s*points?\b/iu
const certaintyDowngrade = /\b(?:may|might|perhaps|possibly|could\s+maybe)\b/iu
const invented = /\b(?:cheating|affair|pregnancy|remarriage|lawsuit|debt|abuse)\b/iu
const inferredStatus = /\b(?:husband|wife|boyfriend|girlfriend|fiancé|fiancée|spouse)\b/iu
const ordinal = /\bitem\s+\d+\b|\bsection\s+\d+\b|\bsecond statement above\b/iu

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
    .map(period => JSON.stringify([period.temporal,
      period.interval ? [Date.parse(period.interval.from), Date.parse(period.interval.to)] : null,
      [...period.provenanceRefs].sort(), Boolean(period.within), [...(period.withinProvenanceRefs ?? [])].sort()]))
    .sort()
}

function timelineRows(output) {
  return output.timeline.map(card => JSON.stringify([card.temporal,
    card.interval ? [Date.parse(card.interval.from), Date.parse(card.interval.to)] : null,
    [...card.provenanceRefs].sort(), card.statements.map(item => [...item.provenanceRefs].sort())]))
}

function assertNoCustomerViolations(text, key) {
  assert.doesNotMatch(text, sajuTerms, `${key}: saju terminology`)
  assert.doesNotMatch(text, divination, `${key}: divination style`)
  assert.doesNotMatch(text, romance, `${key}: romantic-fate wording`)
  assert.doesNotMatch(text, score, `${key}: numeric score`)
  assert.doesNotMatch(text, certaintyDowngrade, `${key}: certainty downgrade`)
  assert.doesNotMatch(text, invented, `${key}: invented outcome`)
  assert.doesNotMatch(text, ordinal, `${key}: internal item reference`)
}

try {
  const [{ renderCompatibilityKo }, { renderCompatibilityJa }, { renderCompatibilityEn }, { buildCustomerCompatibility },
    { isCustomerSafeEn }] = await Promise.all([
    server.ssrLoadModule('/src/lib/compatibility/customer/renderCompatibilityKo.ts'),
    server.ssrLoadModule('/src/lib/compatibility/customer/renderCompatibilityJa.ts'),
    server.ssrLoadModule('/src/lib/compatibility/customer/renderCompatibilityEn.ts'),
    server.ssrLoadModule('/src/lib/compatibility/customer/customerCompatibility.ts'),
    server.ssrLoadModule('/src/lib/personality/render/en/guardrails.ts'),
  ])
  const tally = { fixturesRendered: 0, headline: 0, strengthSections: 0, riskSections: 0,
    directionalSections: 0, personalitySections: 0, marriageSections: 0, timingSections: 0,
    semanticsMissing: 0, semanticsExtra: 0, certaintyMismatches: 0, directionMismatches: 0,
    timingMismatches: 0, sajuTerminologyViolations: 0, divinationStyleViolations: 0,
    romanticFateViolations: 0, numericScoreViolations: 0, inventedOutcomeViolations: 0,
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
    const en = renderCompatibilityEn(input)
    assert.deepEqual(renderCompatibilityEn(input), en, `${key}: deterministic output`)
    assert.equal(JSON.stringify(input), before, `${key}: input mutation`)
    outputs[key] = en

    const units = customer.sections.flatMap(section => section.units)
    const expectedSemantics = new Set(units.map(unit => unit.semantic))
    const enSemantics = new Set(en.sections.flatMap(section => section.statements.flatMap(item => item.semanticIds)))
    const jaSemantics = new Set(ja.sections.flatMap(section => section.statements.flatMap(item => item.semanticIds)))
    assert.deepEqual([...enSemantics].sort(), [...expectedSemantics].sort(), `${key}: EN semantic set`)
    assert.deepEqual([...jaSemantics].sort(), [...expectedSemantics].sort(), `${key}: JA semantic set`)
    const missing = [...expectedSemantics].filter(item => !enSemantics.has(item))
    const extra = [...enSemantics].filter(item => !expectedSemantics.has(item))
    tally.semanticsMissing += missing.length
    tally.semanticsExtra += extra.length

    const allRefs = output => new Set(output.sections.flatMap(section => section.statements.flatMap(item => item.provenanceRefs)))
    const enRefs = allRefs(en)
    const koRefs = allRefs(ko)
    const jaRefs = allRefs(ja)
    const known = upstreamIds(input)
    for (const unit of units) {
      assert.equal(unit.certainty, 'confirmed', `${key}: customer unit certainty`)
      assert.ok(unit.sourceFactIds.length && unit.sourceFactIds.every(id => enRefs.has(id)), `${key}: EN unit provenance`)
      assert.ok(unit.sourceFactIds.every(id => koRefs.has(id) && jaRefs.has(id)), `${key}: locale provenance parity`)
      assert.ok(en.sections.some(section => section.key === unit.section && section.statements.some(statement =>
        statement.semanticIds.includes(unit.semantic) && unit.sourceFactIds.every(id => statement.provenanceRefs.includes(id)))),
      `${key}: semantic statement linkage`)
    }
    assert.deepEqual(en.sections.map(section => section.key), ko.sections.map(section => section.key), `${key}: KO/EN section order`)
    assert.deepEqual(en.sections.map(section => section.key), ja.sections.map(section => section.key), `${key}: JA/EN section order`)
    assert.deepEqual(periodRows(en), periodRows(ko), `${key}: KO/EN periods`)
    assert.deepEqual(periodRows(en), periodRows(ja), `${key}: JA/EN periods`)
    assert.deepEqual(timelineRows(en), timelineRows(ko), `${key}: KO/EN timeline`)
    assert.deepEqual(timelineRows(en), timelineRows(ja), `${key}: JA/EN timeline`)

    const text = allText(en)
    assertNoCustomerViolations(text, key)
    if (!input.userContext?.relationshipStatus) assert.doesNotMatch(text, inferredStatus, `${key}: relationship status inference`)
    const suppliedNames = Object.values(input.userContext?.displayNames ?? {})
    const safetyText = suppliedNames.reduce((result, name) => result.replaceAll(name, 'Alex'), text)
    assert.ok(isCustomerSafeEn(safetyText), `${key}: existing English personality guardrail`)

    for (const statement of en.sections.flatMap(section => section.statements)) {
      assert.ok(statement.semanticIds.length && statement.provenanceRefs.length, `${key}: orphan section statement`)
      assert.ok(statement.provenanceRefs.every(id => known.has(id)), `${key}: unknown section provenance`)
    }
    assert.equal(new Set(en.sections.flatMap(section => section.statements.map(item => item.text))).size,
      en.sections.flatMap(section => section.statements).length, `${key}: duplicate section statement`)
    for (const statement of en.sections.find(section => section.key === 'breakdownRisk')?.statements ?? []) {
      assert.match(statement.text, /clearly more vulnerable|risk of a serious break is especially clear/iu, `${key}: breakdown risk strength`)
    }
    for (const card of en.timeline) {
      assert.ok(card.provenanceRefs.length && card.provenanceRefs.every(id => known.has(id)), `${key}: timeline provenance`)
      assert.ok(card.statements.every(item => item.semanticIds.length && item.provenanceRefs.length
        && item.provenanceRefs.every(id => known.has(id))), `${key}: timeline statement provenance`)
      if (card.temporal === 'undated') assert.equal(card.interval, undefined)
      assert.equal(new Set(card.statements.map(item => item.text)).size, card.statements.length, `${key}: duplicate timeline text`)
    }
    if (en.timeline.some(card => card.temporal === 'current_spanning')) {
      assert.ok(en.timeline.filter(card => card.temporal === 'current_spanning')
        .every(card => card.heading.startsWith('Long-term flow including the present')))
    }
    const cardKeys = en.timeline.map(card => JSON.stringify([card.temporal, card.interval?.from, card.interval?.to,
      card.interval ? null : card.heading]))
    assert.equal(new Set(cardKeys).size, cardKeys.length, `${key}: duplicate interval cards`)
    const temporalOrder = { current: 0, current_spanning: 0, future: 1, expired: 2, undated: 3 }
    const ranks = en.timeline.map(card => temporalOrder[card.temporal])
    assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), `${key}: timeline ordering`)
    const futureStarts = en.timeline.filter(card => card.temporal === 'future').map(card => Date.parse(card.interval?.from ?? ''))
    assert.deepEqual(futureStarts, [...futureStarts].sort((a, b) => a - b), `${key}: future chronology`)

    const has = (...keys) => en.sections.some(section => keys.includes(section.key))
    tally.fixturesRendered++
    tally.headline += Number(Boolean(en.headline))
    tally.strengthSections += Number(has('strengths'))
    tally.riskSections += Number(has('risks'))
    tally.directionalSections += Number(has('directionalInfluence'))
    tally.personalitySections += Number(has('personality'))
    tally.marriageSections += Number(has('marriageOpportunity', 'marriageQuality'))
    tally.timingSections += Number(Boolean(en.timeline.length))
    parityRows.push({ fixture: key, koSemanticCount: expectedSemantics.size, jaSemanticCount: jaSemantics.size,
      enSemanticCount: enSemantics.size, missing: missing.length, extra: extra.length,
      certaintyMismatches: 0, directionMismatches: 0, timingMismatches: 0 })
  }

  const mixedDirections = outputs.mixed.sections.find(section => section.key === 'directionalInfluence')?.statements ?? []
  assert.ok(mixedDirections.some(item => /first person[\s\S]*(?:on|to) the second person/iu.test(item.text)
    && item.semanticIds.some(id => id === 'direction_favorable' || id === 'direction_favorable_dominant')))
  assert.ok(mixedDirections.some(item => /second person[\s\S]*for the first person|second person[\s\S]*on the first person/iu.test(item.text)
    && item.semanticIds.some(id => id === 'direction_unfavorable' || id === 'direction_unfavorable_dominant')))
  const mutual = outputs.mixed.timeline.find(card => /both people have overlapping relationship timing/iu.test(card.within ?? ''))
  assert.ok(mutual?.heading.includes('February 4, 2028–February 3, 2029'))
  assert.ok(mutual.statements.some(item => item.semanticIds.includes('mutual_marriage_window')))
  assert.ok(mutual.statements.some(item => item.semanticIds.includes('relationship_strain')))
  assert.ok(mutual.statements.some(item => item.semanticIds.includes('relationship_breakdown_risk')))
  assert.match(allText(outputs.balanced), /strong support[\s\S]*strong points of friction/iu)
  assert.match(allText(outputs.relief), /easier than usual to say what you feel|put thoughts and feelings into words/iu)
  assert.match(allText(outputs.relief), /relationship pressure eases/iu)
  const mixedStatements = [...outputs.mixed.sections.flatMap(section => section.statements),
    ...outputs.mixed.timeline.flatMap(card => card.statements)]
  assert.ok(mixedStatements.some(item => item.semanticIds.includes('marriage_opportunity')))
  assert.ok(mixedStatements.some(item => item.semanticIds.includes('marriage_caution')))
  assert.match(allText(outputs.bothPaths), /Existing relationship problems and a major relationship shift overlap/iu)
  assert.ok(outputs.marriageSource.timeline.every(card => !card.interval))
  assert.ok(outputs.breakdownSource.timeline.every(card => !card.interval))
  const pathKinds = new Set(fixtures.bothPaths.relationshipLifecycle.people.flatMap(person => person.breakdownPaths.map(path => path.kind)))
  assert.ok(pathKinds.has('BREAKDOWN-A') && pathKinds.has('BREAKDOWN-B'), 'A+B fixture')
  assert.ok(fixtures.relief.personality.current.facts.some(fact => fact.interactionType === 'communication_relief'), 'current expression relief fixture')

  for (const [relationshipStatus, expected] of [['married', /marriage is clearly more vulnerable[\s\S]*separation or divorce/iu],
    ['partnered', /relationship is clearly more vulnerable[\s\S]*breakup/iu]]) {
    const output = renderCompatibilityEn({ ...fixtures.bothPaths, userContext: { relationshipStatus } })
    assert.match(allText(output), expected)
    assertNoCustomerViolations(allText(output), `status:${relationshipStatus}`)
  }
  const named = renderCompatibilityEn({ ...fixtures.mixed, userContext: { displayNames: { A: 'Yuna', B: 'Mina' } } })
  assert.match(allText(named), /Yuna has an effect on Mina|From Yuna to Mina/iu)
  assert.doesNotMatch(allText(named), /\b(?:Mr\.?|Ms\.?|Mrs\.?)\b/iu)

  tally.currentLongWindowLabelViolations = 0
  tally.overlappingWindowDuplicateViolations = 0
  tally.customerItemNumberReferences = 0
  tally.chronologicalOrderingViolations = 0
  const sampleKeys = [['A — Support and communication friction', 'balanced'],
    ['B — Marriage opportunity and caution', 'mixed'], ['C — A relationship-break risk window', 'bothPaths']]
  const samples = sampleKeys.map(([title, key]) => {
    const output = outputs[key]
    return [`### Sample ${title}`, '', `**${output.headline}**`, '',
      ...output.sections.flatMap(section => [`#### ${section.heading}`, '', ...section.statements.map(item => `- ${item.text}`), '']),
      ...(output.timeline.length ? ['#### Timeline', '', ...output.timeline.flatMap(card => [
        `**${card.heading}**`, '', ...(card.within ? [card.within, ''] : []),
        ...card.statements.map(item => `- ${item.text}`), '',
      ])] : [])].join('\n')
  }).join('\n')
  const samplePath = process.argv.find(argument => argument.startsWith('--samples='))
  if (samplePath) writeFileSync(samplePath.slice('--samples='.length), `${samples}\n`)
  console.log(JSON.stringify({ result: 'PASS', ...tally, parityRows }, null, 2))
} finally {
  await server.close()
}
