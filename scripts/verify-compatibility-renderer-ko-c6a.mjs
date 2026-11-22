import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'

process.argv.push('--customer-fixtures')
const { customerContractFixtures: fixtures } = await import('./verify-compatibility-final-assembly-c5.mjs')
const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })

const jargon = /\p{Script=Han}|용신|상신|구응|격국|비견|겁재|식신|편재|정재|편관|정관|편인|정인|대운|세운|월운|일진|통근|투출|형충회합|(?:^|[^가-힣])(?:병|상관)(?:[은는이가을를의에와도만]|[^가-힣]|$)/u
const score = /d+s*점|[%％]|[A-F]s*등급|점수|상위s*d+/u
const hedges = /그럴 수도|가능성이 있습니다|영향이 있을 수|일지도 모|조금 조심하세요|판단하기 어렵|애매한 궁합/u
const invented = /외도|바람을 피|임신|재혼|법적 분쟁|반드시 이혼|이때 이혼합니다|헤어집니다|천생연분|최악의 궁합/u
const customerText = result => [result.headline, ...result.sections.flatMap(section =>
  [section.heading, ...section.statements.map(statement => statement.text)])].filter(Boolean).join('\n')

function upstreamIds(value, ids = new Set()) {
  if (!value || typeof value !== 'object') return ids
  if (typeof value.id === 'string') ids.add(value.id)
  for (const child of Object.values(value)) upstreamIds(child, ids)
  return ids
}

try {
  const { renderCompatibilityKo } = await server.ssrLoadModule('/src/lib/compatibility/customer/renderCompatibilityKo.ts')
  const { buildCustomerCompatibility } = await server.ssrLoadModule('/src/lib/compatibility/customer/customerCompatibility.ts')
  const tally = { fixturesRendered: 0, headline: 0, strengthSections: 0, riskSections: 0, directionalSections: 0,
    personalitySections: 0, marriageSections: 0, timingSections: 0, certaintyDowngradeViolations: 0,
    sajuTerminologyViolations: 0, numericScoreViolations: 0, inventedOutcomeViolations: 0,
    duplicateSentenceViolations: 0, orphanRenderedStatements: 0 }

  const outputs = Object.fromEntries(Object.entries(fixtures).map(([key, input]) => {
    const before = JSON.stringify(input)
    const structure = buildCustomerCompatibility(input)
    const output = renderCompatibilityKo(input)
    assert.deepEqual(renderCompatibilityKo(input), output)
    assert.equal(JSON.stringify(input), before)
    const known = upstreamIds(input)
    assert.ok((output.headlineProvenanceRefs ?? []).every(id => known.has(id)))
    const statements = output.sections.flatMap(section => section.statements)
    assert.equal(new Set(statements.map(item => item.text)).size, statements.length, key)
    assert.ok(statements.every(item => item.provenanceRefs.length && item.provenanceRefs.every(id => known.has(id))), key)
    const presented = new Set(statements.flatMap(item => item.provenanceRefs))
    assert.ok(structure.sections.flatMap(section => section.units).every(unit =>
      unit.certainty === 'confirmed' && unit.sourceFactIds.every(id => presented.has(id))))
    assert.doesNotMatch(customerText(output), jargon)
    assert.doesNotMatch(customerText(output), score)
    assert.doesNotMatch(customerText(output), hedges)
    assert.doesNotMatch(customerText(output), invented)
    for (const item of output.sections.find(item => item.key === 'breakdownRisk')?.statements ?? []) {
      assert.match(item.text, /위험이 뚜렷하게 높아집니다/u)
    }
    for (const item of output.sections.find(item => item.key === 'marriageOpportunity')?.statements ?? []) {
      assert.match(item.text, /결혼|공식화/u)
    }
    for (const card of output.timeline) {
      assert.ok(card.provenanceRefs.every(id => known.has(id)))
      assert.ok(card.statements.every(statement => statement.provenanceRefs.length
        && statement.provenanceRefs.every(id => known.has(id))))
      if (card.temporal === 'undated') assert.equal(card.interval, undefined)
    }
    const visible = output.timeline.flatMap(card => [card.heading, card.within, ...card.statements.map(item => item.text)])
      .filter(Boolean).join('\n')
    assert.doesNotMatch(visible, jargon)
    assert.doesNotMatch(visible, score)
    assert.doesNotMatch(visible, hedges)
    assert.doesNotMatch(visible, invented)
    const section = (...keys) => output.sections.some(item => keys.includes(item.key))
    tally.fixturesRendered++
    tally.headline += Number(Boolean(output.headline))
    tally.strengthSections += Number(section('strengths'))
    tally.riskSections += Number(section('risks'))
    tally.directionalSections += Number(section('directionalInfluence'))
    tally.personalitySections += Number(section('personality'))
    tally.marriageSections += Number(section('marriageOpportunity', 'marriageQuality'))
    tally.timingSections += Number(Boolean(output.timeline.length))
    return [key, output]
  }))

  const mixed = customerText(outputs.mixed)
  assert.match(mixed, /첫 번째 사람 → 두 번째 사람 방향.*돕는 힘이 큽니다/u)
  assert.match(mixed, /두 번째 사람 → 첫 번째 사람 방향.*영향이 뚜렷합니다/u)
  assert.match(mixed, /속마음을 꺼내는 일을 미루면서 마찰/u)
  assert.match(mixed, /위험이 뚜렷하게 높아집니다/u)
  assert.match(customerText(outputs.balanced), /중요한 도움과 큰 부담이 동시에/u)
  assert.match(customerText(outputs.relief), /문제를 키우거나 필요한 역할을 약하게 하는/u)
  assert.match(customerText(outputs.relief), /관계 부담이 줄고/u)
  assert.match(customerText(outputs.relief), /평소에는 대화가 막히기 쉽지만 지금은/u)
  assert.ok(outputs.marriageSource.sections.some(section => section.key === 'marriageOpportunity'))
  assert.match(customerText(outputs.marriageSource), /결혼 이야기는 구체화되기 쉽지만 같은 시기에.*부담도 커집니다/u)
  assert.doesNotMatch(customerText(outputs.marriageSource), /\d{4}년/u)
  assert.match(customerText(outputs.breakdownSource), /달력 시점 미확인/u)
  assert.match(customerText(outputs.bothPaths), /기존 관계 문제와 큰 관계 변화가 겹치며/u)
  assert.match(customerText(outputs.history), /지난 시기/u)
  assert.ok(outputs.mixed.sections.find(section => section.key === 'marriageQuality')?.statements
    .some(item => /관계도 그 결정을 함께 받쳐/u.test(item.text)))

  function snapshot(key, section, phrase, expected) {
    const statements = outputs[key].sections.find(item => item.key === section)?.statements ?? []
    const text = statements.find(item => item.text.includes(phrase))?.text
    assert.equal(text?.replace(/^\[[^\]]+\] /u, ''), expected)
  }
  snapshot('mixed', 'personality', '안에서 오래 정리', '두 사람 모두 생각과 감정을 안에서 오래 정리하는 편이라, 가까워질수록 서로 필요한 말을 미루고 대화가 막히기 쉽습니다.')
  snapshot('relief', 'relationshipRelief', '쌓였던 관계 부담', '쌓였던 관계 부담이 줄고 서로 지내는 일이 한결 수월해집니다.')
  snapshot('balanced', 'directionalInfluence', '중요한 도움과 큰 부담', '중요한 도움과 큰 부담이 동시에 나타납니다.')
  snapshot('marriageSource', 'marriageQuality', '같은 시기에', '결혼 이야기는 구체화되기 쉽지만 같은 시기에 두 사람이 함께 감당해야 할 부담도 커집니다.')
  snapshot('bothPaths', 'breakdownRisk', '큰 관계 변화가 겹치며', '기존 관계 문제와 큰 관계 변화가 겹치며 중요한 관계가 크게 흔들리거나 이어지기 어려워질 위험이 뚜렷하게 높아집니다.')
  assert.deepEqual(outputs.mixed.sections.find(item => item.key === 'directionalInfluence')?.statements.map(item => item.text), [
    '[첫 번째 사람 → 두 번째 사람 방향] 중요한 문제를 풀거나 꼭 필요한 일을 해내도록 돕는 힘이 큽니다.',
    '[두 번째 사람 → 첫 번째 사람 방향] 기존 문제를 키우거나 필요한 역할을 약하게 하는 영향이 뚜렷합니다.',
  ])
  const groupedRisk = outputs.mixed.sections.find(item => item.key === 'breakdownRisk')?.statements
  assert.equal(groupedRisk?.length, 1)
  assert.deepEqual(groupedRisk[0].periods.map(period => period.temporal), ['current_spanning', 'future'])

  for (const [relationshipStatus, expected] of [['married', /별거·이혼으로 이어질 위험/u], ['partnered', /이별로 이어질 위험/u]]) {
    const output = renderCompatibilityKo({ ...fixtures.bothPaths, userContext: { relationshipStatus } })
    assert.match(customerText(output), expected)
    assert.doesNotMatch(customerText(output), invented)
  }
  assert.doesNotMatch(customerText(outputs.bothPaths), /이혼|별거|이별/u)
  const named = renderCompatibilityKo({ ...fixtures.mixed, userContext: { displayNames: { A: '민서', B: '준' } } })
  assert.match(customerText(named), /민서 → 준/u)
  const masked = renderCompatibilityKo({ ...fixtures.mixed, userContext: { displayNames: { A: '용신', B: '<script>' } } })
  assert.equal(customerText(masked), mixed)
  const sameName = renderCompatibilityKo({ ...fixtures.mixed, userContext: { displayNames: { A: '민서', B: '민서' } } })
  assert.equal(customerText(sameName), mixed)

  if (process.argv.includes('--presentation-polish')) {
    const { displayPeriod } = await server.ssrLoadModule('/src/lib/compatibility/customer/koPeriods.ts')
    const period = (from, to, at) => displayPeriod({
      period: { temporal: 'undated', interval: { from, to } }, sourceFactIds: ['test-ref'],
    }, Date.parse(at)).temporal
    assert.equal(period('2020-01-01', '2030-01-01', '2027-03-01'), 'current_spanning')
    assert.equal(period('2027-02-04', '2028-02-04', '2027-03-01'), 'current')
    assert.equal(period('2027-02-04', '2028-02-04', '2028-02-04'), 'expired')
    assert.equal(period('2027-02-04', '2028-02-04', '2027-01-01'), 'future')
    for (const output of Object.values(outputs)) {
      const visible = [customerText(output), ...output.timeline.flatMap(card => [card.heading, card.within,
        ...card.statements.map(item => item.text)])].filter(Boolean).join('\n')
      assert.doesNotMatch(visible, /\d+번째 항목|섹션\s*\d+|section reference/u)
      const order = { current: 0, current_spanning: 0, future: 1, expired: 2, undated: 3 }
      const ranks = output.timeline.map(card => order[card.temporal])
      assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b))
      const future = output.timeline.filter(card => card.temporal === 'future').map(card => Date.parse(card.interval.from))
      assert.deepEqual(future, [...future].sort((a, b) => a - b))
      assert.ok(output.timeline.filter(card => card.temporal === 'current_spanning')
        .every(card => card.heading.startsWith('현재를 포함한 장기 흐름')))
      const allRefs = new Set(output.timeline.flatMap(card => card.provenanceRefs))
      const expected = output.sections.filter(section => section.key !== 'personality')
        .flatMap(section => section.statements.flatMap(statement => statement.periods ?? []))
        .flatMap(period => period.provenanceRefs)
      assert.ok(expected.every(ref => allRefs.has(ref)))
      for (const card of output.timeline) assert.equal(new Set(card.statements.map(item => item.text)).size, card.statements.length)
    }
    const focus = outputs.mixed.timeline.find(card => card.within?.includes('두 사람에게 관계 공식화 흐름이 겹치는 구간'))
    assert.ok(focus?.heading.includes('2028년 2월 4일~2029년 2월 3일'))
    assert.ok(focus.statements.some(statement => /두 사람 모두 관계를 공식화/u.test(statement.text)))
    assert.ok(focus.statements.some(statement => /부담/u.test(statement.text)))
    assert.ok(focus.statements.some(statement => /위험이 뚜렷하게 높아지/u.test(statement.text)))
    const married = renderCompatibilityKo({ ...fixtures.mixed, userContext: { relationshipStatus: 'married' } })
    assert.ok(married.timeline.find(card => card.heading === focus.heading)?.statements
      .some(statement => /별거·이혼으로 이어질 위험이 뚜렷하게 높아지는 세부 구간/u.test(statement.text)))
    assert.ok(focus.provenanceRefs.length > new Set(focus.statements.flatMap(item => item.provenanceRefs)).size)

    assert.ok(outputs.mixed.timeline.some(card => card.heading.includes('현재를 포함한 장기 흐름 · 2020년 1월 1일~2030년 1월 1일')))
    assert.ok(outputs.marriageSource.timeline.every(card => !card.interval))
    assert.equal(outputs.breakdownSource.timeline.flatMap(card => card.statements)
      .filter(statement => /위험이 뚜렷하게 높아집니다/u.test(statement.text)).length, 2)
    for (const [key, value] of Object.entries({
      currentLongWindowLabelViolations: 0, overlappingWindowDuplicateViolations: 0,
      customerItemNumberReferences: 0, chronologicalOrderingViolations: 0,
    })) tally[key] = value
  }

  const samples = [['A · 구조적 도움과 소통 마찰', 'mixed'], ['B · 결혼 기회와 결혼 주의', 'marriageSource'],
    ['C · 파탄 위험 시기', 'breakdownSource']]
  const markdown = samples.map(([title, key]) => {
    const output = outputs[key]
    return [
      `### Sample ${title}`, '', `**${output.headline}**`, '',
      ...output.sections.flatMap(section => [`#### ${section.heading}`, '', ...section.statements.map(item => `- ${item.text}`), '']),
      ...(output.timeline.length ? ['#### 시기별 보기', '', ...output.timeline.flatMap(card => [
        `**${card.heading}**`, '',
        ...(card.within ? [card.within, ''] : []),
        ...card.statements.map(statement => `- ${statement.text}`), '',
      ])] : []),
    ].join('\n')
  }).join('\n')
  const samplePath = process.argv.find(argument => argument.startsWith('--samples='))
  if (samplePath) writeFileSync(samplePath.slice('--samples='.length), markdown + '\n')
  console.log(JSON.stringify({ result: 'PASS', ...tally }, null, 2))
} finally {
  await server.close()
}
