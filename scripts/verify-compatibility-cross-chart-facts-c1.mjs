import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })
const load = file => server.ssrLoadModule(`/src/lib/${file}.ts`)
const fixtures = [
  // Primary 07 §13, lines 3217–36. Same-palace clashes/breaks with wonjin deferred.
  { id: 'C00-01', charts: ['辛酉 己亥 丙午 辛卯', '甲寅 戊辰 丙子 甲午'] },
  // Lines 3238–83. Male 甲/丙 bind female 己/辛; 卯 provides an 乙 root.
  { id: 'C00-02', charts: ['丁巳 己酉 乙亥 辛巳', '丙辰 甲午 癸卯 丙辰'] },
  // Lines 3285–3324. Male 子 supports female 癸; female 戌 supports male 庚
  // and its evidenced wealth-to-killing path. 寅戌 is a non-forming relation.
  { id: 'C00-03', charts: ['庚戌 癸未 庚戌 丙戌', '壬寅 壬寅 丙子 庚寅'] },
]
const forbidden = /"(?:compatibilityScore|weightedScore|score|verdict|favorable|unfavorable)":/
const tally = { stem: 0, branch: 0, root: 0, role: 0, AtoB: 0, BtoA: 0, symmetric: 0,
  unstable: 0, duplicates: 0, orphan: 0, mutation: 0 }

export const sourceFactResults = []
export const sourceFixtureJudgments = []

try {
  const [{ runJudgmentCore }, { buildCompatibilityFacts }] = await Promise.all([
    load('judgment/core/luckScope'), load('compatibility/index'),
  ])
  function person(id, pillars, { unresolved = false, stopped = [], evidence = [] } = {}) {
    const chart = Object.fromEntries(pillars.split(' ').map((pillar, index) => {
      const position = ['year', 'month', 'day', 'time'][index]
      return [position, { stem: { id: `stem:${position}`, value: pillar[0] },
        branch: { id: `branch:${position}`, value: pillar[1] } }]
    }))
    const judgment = runJudgmentCore({
      executionId: id, natal: chart, natalCombinations: unresolved ? null : stopped, luck: [], natalPolicyEvidence: evidence,
      natalValidity: { periodId: id, from: { kind: 'unknown', reason: 'snapshot-only' },
        to: { kind: 'unknown', reason: 'snapshot-only' } },
    })[0]
    return { id, chart, judgment, personality: Object.freeze({ fixtureSentinel: id }) }
  }

  function verify(a, b) {
    const before = JSON.stringify([a, b])
    const result = buildCompatibilityFacts(a, b)
    assert.deepEqual(buildCompatibilityFacts(a, b), result)
    assert.deepEqual(buildCompatibilityFacts(b, a), result)
    assert.equal(JSON.stringify([a, b]), before)
    assert.doesNotMatch(JSON.stringify(result), forbidden)
    const { stemInteractions: stems, branchInteractions: branches, rootSupport: roots, roleInteractions: roles } = result
    const all = [...stems, ...branches, ...roots, ...roles]
    assert.equal(new Set(all.map(item => item.id)).size, all.length)
    const knownIds = new Set([a, b].flatMap(({ judgment }) => [judgment.id, ...judgment.directEntityIds,
      ...[...judgment.stemFacts, ...judgment.patternFacts].map(path => path.id),
      ...judgment.roleEngine.roleHistory.map(role => role.roleId)]).concat(stems.map(item => item.id), roots.map(item => item.id)))
    for (const fact of all) {
      assert.ok(fact.sourceFactIds.length > 0 && fact.provenance.length > 0, fact.id)
      assert.ok(fact.sourceFactIds.every(id => knownIds.has(id)), fact.id)
    }
    const owners = new Map([a, b].map(person => [person.id, person.judgment]))
    const verifyEndpoint = part => {
      const judgment = owners.get(part.personId)
      assert.equal(part.judgmentId, judgment.id)
      assert.ok(judgment.directEntityIds.includes(part.entityId))
    }
    for (const fact of [...stems, ...branches]) {
      assert.equal(new Set(fact.participants.map(part => part.personId)).size, 2)
      fact.participants.forEach(verifyEndpoint)
    }
    for (const root of roots) [root.provider, root.receiver].forEach(verifyEndpoint)
    for (const role of roles) {
      [role.source, role.target].forEach(verifyEndpoint)
      const owner = owners.get(role.target.personId)
      if (role.targetRoleId) assert.ok(owner.roleEngine.roleHistory.some(item =>
        item.roleId === role.targetRoleId && item.entityId === role.target.entityId))
      assert.ok(role.targetPathIds.every(path => [...owner.patternFacts, ...owner.stemFacts].some(item => item.id === path)))
    }
    const directions = [...stems.flatMap(fact => fact.direction ? [fact.direction] : fact.compatibilityRuntimeEffects),
      ...roots.map(root => ({ source: root.provider, target: root.receiver })), ...roles]
    tally.AtoB += directions.filter(direction => direction.source.personId === a.id && direction.target.personId === b.id).length
    tally.BtoA += directions.filter(direction => direction.source.personId === b.id && direction.target.personId === a.id).length
    tally.symmetric += branches.length + stems.filter(fact => fact.action === 'combine').length
    tally.stem += stems.length
    tally.branch += branches.length
    tally.root += roots.length
    tally.role += roles.length
    return result
  }

  const sourcePairs = fixtures.map(({ id, charts }) => {
    // Primary 07:3254, 3279–80 explicitly treats the woman's 辛 killing as harmful.
    // Feed the source prerequisite through the existing personal Judgment evidence API.
    const evidence = id === 'C00-02' ? [{ entityId: 'stem:time', condition: 'harmful_killing',
      evidenceIds: ['src/docs/source/primary/07-사주풀이예시.md#L3280'] }] : []
    return [person(`${id}:A`, charts[0], { evidence }), person(`${id}:B`, charts[1])]
  })
  const [negative, positive, mixed] = sourcePairs.map(([a, b]) => verify(a, b))
  sourceFactResults.push(negative, positive, mixed)
  sourceFixtureJudgments.push(...sourcePairs.map(pair => pair.map(person => person.judgment)))
  const relation = (result, kind, test) => result.branchInteractions.find(fact => fact.relationType === kind && test(fact))
  assert.ok(relation(negative, 'clash', fact => fact.spousePalacePair))
  assert.ok(relation(negative, 'break', fact => fact.participants.every(part => part.position === 'hour')))
  for (const [from, to] of [['甲', '己'], ['丙', '辛']]) {
    assert.ok(positive.stemInteractions.some(fact => fact.action === 'combine' && fact.compatibilityRuntimeEffects.some(effect =>
      effect.source.personId === 'C00-02:B' && effect.source.value === from && effect.target.value === to && effect.state === 'stopped')))
  }
  assert.ok(relation(positive, 'half', fact => fact.elementStem === '甲' && fact.participants.some(part => part.value === '亥')
    && fact.participants.some(part => part.value === '卯')))
  assert.ok(positive.rootSupport.some(fact => fact.provider.personId === 'C00-02:B' && fact.provider.value === '卯'
    && fact.receiver.value === '乙' && fact.receiver.position === 'day' && fact.hiddenStemLevel === 'main'))
  assert.ok(positive.roleInteractions.some(fact => fact.target.personId === 'C00-02:A' && fact.target.value === '己'
    && fact.targetByeongId && fact.source.value === '甲' && fact.interactionType === 'relief_candidate'))
  assert.ok(relation(mixed, 'three_partial_without_center', fact => !fact.formation && !fact.strengthensElement))
  assert.ok(!relation(mixed, 'half', fact => fact.elementStem === '丙'))
  assert.ok(mixed.rootSupport.some(fact => fact.provider.personId === 'C00-03:B' && fact.provider.value === '子'
    && fact.receiver.personId === 'C00-03:A' && fact.receiver.value === '癸'))
  const wealthRoot = mixed.rootSupport.find(fact => fact.provider.personId === 'C00-03:A' && fact.provider.value === '戌'
    && fact.receiver.personId === 'C00-03:B' && fact.receiver.value === '庚' && fact.receiver.position === 'hour')
  assert.ok(wealthRoot)
  const [, mixedMan] = sourcePairs[2]
  const wealthFeedsKilling = mixedMan.judgment.stemFacts.filter(path => path.action === 'generate'
    && path.source.id === wealthRoot.receiver.entityId && path.target.stem === '壬')
  assert.ok(wealthFeedsKilling.length > 0)
  assert.ok(mixed.roleInteractions.some(fact => fact.sourceInteractionId === wealthRoot.id
    && wealthFeedsKilling.some(path => fact.targetPathIds.includes(path.id)) && fact.interactionType === 'path_contact'))
  assert.ok(mixed.stemInteractions.some(fact => fact.action === 'generate'))
  assert.ok(mixed.stemInteractions.some(fact => fact.action === 'control'))

  const a = person('contract:A', '甲寅 丙卯 壬亥')
  const b = person('contract:B', '己辰 庚戌 丁未')
  const synthetic = verify(a, b)
  const combined = synthetic.stemInteractions.find(fact => fact.action === 'combine'
    && fact.participants.some(part => part.value === '甲') && fact.participants.some(part => part.value === '己'))
  assert.ok(combined)
  assert.deepEqual(combined.compatibilityRuntimeEffects.map(effect => effect.state), ['stopped', 'stopped'])
  for (const member of combined.participants) {
    const { judgment } = member.personId === a.id ? a : b
    assert.equal(judgment.runtime.find(entry => entry.entityId === member.entityId).state, 'active')
  }
  const control = synthetic.stemInteractions.filter(fact => fact.action === 'control')
  assert.ok(control.length > 0 && control.every(fact => fact.compatibilityRuntimeEffects.length === 1
    && fact.compatibilityRuntimeEffects[0].state === 'weakened'))
  assert.ok(relation(synthetic, 'season', fact => fact.participants.length === 3 && fact.elementStem === '甲'))
  assert.ok(relation(synthetic, 'three', fact => fact.participants.length === 3 && fact.elementStem === '甲'))
  const partial = verify(person('partial:A', '甲寅 丙卯 壬亥', { unresolved: true }),
    person('partial:B', '己戌 庚未 丁丑 辛酉'))
  assert.ok(!relation(partial, 'season', fact => fact.elementStem === '甲'))
  assert.deepEqual(partial.diagnostics, [{ personId: 'partial:A', code: 'HOUR_UNAVAILABLE', unavailableParts: ['stem', 'branch'] }])
  assert.ok(relation(partial, 'clash', fact => fact.participants.some(part => part.personId === 'partial:B' && part.position === 'hour')))
  assert.ok(partial.stemInteractions.length > 0 && partial.branchInteractions.length > 0 && partial.rootSupport.length > 0)
  assert.ok(partial.stemInteractions.every(fact => fact.compatibilityRuntimeEffects.length === 0))
  const half = verify(person('half:A', '甲亥 丙辰 壬戌'), person('half:B', '己卯 庚丑 丁酉'))
  assert.ok(relation(half, 'half', fact => fact.formation && fact.strengthensElement && fact.elementStem === '甲'
    && new Set(fact.participants.map(part => part.value)).size === 2))
  assert.ok(synthetic.rootSupport.every(fact => fact.rootType === 'same_element_hidden_stem'
    && fact.rootPriority === (fact.hiddenStemLevel === 'main' ? 'main' : 'secondary')))
  const [withRoles] = sourcePairs[1]
  const rootContract = verify(withRoles, person('contract:root-provider', '庚申 戊辰 丁丑'))
  for (const role of ['YongShen', 'Byeong']) {
    assert.ok(rootContract.roleInteractions.some(link => link.targetRole === role
      && link.target.personId === withRoles.id && rootContract.rootSupport.some(root => root.id === link.sourceInteractionId)))
  }
  assert.ok(rootContract.roleInteractions.some(link => link.action === 'root_support'
    && link.interactionType === 'harmful_activation_candidate' && link.targetByeongId))

  const stopped = person('stopped:A', '甲寅 己卯 壬亥', { stopped: [['stem:year', 'stem:month']] })
  const stoppedPair = verify(stopped, b).stemInteractions.find(fact => fact.action === 'combine'
    && fact.participants.some(part => part.value === '甲'))
  assert.ok(stoppedPair && stoppedPair.compatibilityRuntimeEffects.length === 0)
  assert.throws(() => buildCompatibilityFacts(a, a), /distinct person IDs/)

  console.log(JSON.stringify({ result: 'PASS', positive: 'PASS', negative: 'PASS',
    mixed: 'PASS', directional: 'PASS', tally }, null, 2))
} finally {
  await server.close()
}
