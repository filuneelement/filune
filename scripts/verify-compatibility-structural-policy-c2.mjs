import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { sourceFactResults, sourceFixtureJudgments } from './verify-compatibility-cross-chart-facts-c1.mjs'

const server = await createServer({ appType: 'custom', logLevel: 'error',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false, ws: false } })
const census = { effects: 0, AtoB: 0, BtoA: 0, deferredRoleIds: 0, mixed: 0, asymmetric: 0,
  duplicate: 0, orphan: 0, unstable: 0, mutation: 0, effectTypes: {}, verdicts: {} }
const participant = (personId, entityId, value) => ({ personId, judgmentId: `natal:${personId}`, entityId, position: 'month', value })
const empty = () => ({ stemInteractions: [], branchInteractions: [], rootSupport: [], roleInteractions: [] })
const fixtureReferences = new WeakMap()
export const structuralContractFixtures = {}

// Synthetic C2 contracts supply independently verified path observations. This does
// not stand in for the producer assertions over C1's unchanged source snapshots.
function add(input, seed, { action = 'combine', classification = 'harmful', before = 'operating',
  critical = true, reverse = false, pathKey = seed, omitEvidence = false, activate = false } = {}) {
  const source = participant(reverse ? 'B' : 'A', `actor:${seed}`,
    action === 'generate' ? '丙' : action === 'root_support' ? '丑' : '甲')
  const target = participant(reverse ? 'A' : 'B', `target:${pathKey}`, '己')
  const direction = { source, target }
  const refs = [source.judgmentId, source.entityId, target.judgmentId, target.entityId]
  const root = action === 'root_support'
  const interactionId = `cross:${seed}`
  const provenance = ['synthetic-contract']
  const record = { id: interactionId, sourceFactIds: refs, provenance }
  if (root) {
    input.rootSupport.push({ ...record, provider: source, receiver: target, hiddenStem: '己',
      hiddenStemLevel: 'main', rootPriority: 'main', rootType: 'same_element_hidden_stem' })
  } else {
    input.stemInteractions.push({ ...record, action, participants: [source, target],
      ...(action !== 'combine' && { direction }), compatibilityRuntimeEffects: action === 'generate' ? [] :
        [{ ...direction, state: action === 'combine' ? 'stopped' : 'weakened' },
          ...(action === 'combine' ? [{ source: target, target: source, state: 'stopped' }] : [])] })
  }
  const pathId = `path:${pathKey}`
  const roleId = `role:${pathKey}`
  const patternContextId = `pattern:${target.personId}`
  fixtureReferences.set(input, [...(fixtureReferences.get(input) ?? []), ...refs, pathId, roleId, patternContextId])
  const contribution = root ? 'root_supported' : action === 'generate' ? 'generated'
    : action === 'combine' ? 'stopped' : 'weakened'
  const change = activate ? 'activated' : action === 'combine' ? 'blocked' : action === 'control' ? 'weakened' : 'supported'
  input.roleInteractions.push({ id: `link:${seed}`, ...direction, action, sourceInteractionId: interactionId,
    interactionType: classification === 'required' ? 'support_candidate' : 'harmful_activation_candidate',
    targetRoleId: roleId, targetRole: classification === 'required' ? 'SangShen' : 'Byeong',
    ...(classification === 'harmful' && { targetByeongId: roleId }), targetPathIds: [pathId],
    sourceFactIds: [...refs, roleId, pathId, interactionId], provenance,
    ...(omitEvidence ? {} : { pathEvidence: [{ pathId, patternContextId, sourceEntityId: target.entityId,
      targetEntityId: `affected:${pathKey}`, policyId: 'synthetic-policy', classification, critical,
      before, change, contribution, sourceFactIds: [...refs, interactionId, roleId, pathId, patternContextId] }] }),
  })
}

try {
  const { buildCompatibilityFacts, buildStructuralCompatibility } = await server.ssrLoadModule('/src/lib/compatibility/index.ts')
  const { runJudgmentCore } = await server.ssrLoadModule('/src/lib/judgment/core/luckScope.ts')
  function run(input, judgments = []) {
    const snapshot = JSON.stringify(input)
    const beforeJudgment = JSON.stringify(judgments)
    const directions = buildStructuralCompatibility(input)
    assert.deepEqual(buildStructuralCompatibility(input), directions)
    const reversed = Object.fromEntries(['stemInteractions', 'branchInteractions', 'rootSupport', 'roleInteractions']
      .map(key => [key, [...input[key]].reverse()]))
    assert.deepEqual(buildStructuralCompatibility(reversed), directions)
    assert.equal(JSON.stringify(input), snapshot)
    assert.equal(JSON.stringify(judgments), beforeJudgment)
    const known = new Set([
      ...[...input.stemInteractions, ...input.rootSupport, ...input.roleInteractions].map(fact => fact.id),
      ...(fixtureReferences.get(input) ?? []),
      ...judgments.flatMap(j => [j.id, j.patternContext.id, ...j.directEntityIds,
        ...j.roleEngine.roleHistory.map(role => role.roleId), ...j.policyRoles.byeong.map(path => path.id),
        ...[...j.stemFacts, ...j.patternFacts].map(path => path.id)]),
    ])
    const ids = new Set()
    for (const d of directions) {
      const effects = [...d.supportEffects, ...d.damageEffects]
      census.effects += effects.length
      if (d.sourcePersonId.endsWith('A')) census.AtoB += effects.length
      else census.BtoA += effects.length
      if (d.supportEffects.length && d.damageEffects.length) census.mixed++
      census.verdicts[d.verdict] = (census.verdicts[d.verdict] ?? 0) + 1
      census.deferredRoleIds += d.deferredRoleIds.length
      for (const effect of effects) {
        assert.ok(!ids.has(effect.id))
        ids.add(effect.id)
        assert.ok(effect.sourceFactIds.every(id => known.has(id)), effect.id)
        assert.equal(effect.source.personId, d.sourcePersonId)
        assert.equal(effect.target.personId, d.targetPersonId)
        census.effectTypes[effect.effectType] = (census.effectTypes[effect.effectType] ?? 0) + 1
      }
    }
    if (directions.length === 2 && directions[0].verdict !== directions[1].verdict) census.asymmetric++
    assert.doesNotMatch(JSON.stringify(directions), /"(?:compatibilityScore|weightedScore|severity|score)":/)
    return directions
  }

  const [negative, positive, mixed] = sourceFactResults.map((facts, i) => run(facts, sourceFixtureJudgments[i]))
  const branchOnly = { ...empty(), branchInteractions: sourceFactResults[0].branchInteractions }
  assert.deepEqual(run(branchOnly).map(direction => direction.verdict), ['minor_effect', 'minor_effect'])
  const negativeBranches = new Set(branchOnly.branchInteractions.map(fact => fact.id))
  assert.ok(negative.flatMap(d => [...d.supportEffects, ...d.damageEffects]).every(effect => !negativeBranches.has(effect.crossFactId)))
  assert.ok(positive.find(direction => direction.sourcePersonId === 'C00-02:B').supportEffects.some(effect =>
    effect.effectType === 'relieves_byeong' && effect.target.value === '己' && effect.targetByeongId))
  const originalContactIds = sourceFactResults[2].roleInteractions.filter(role => role.interactionType === 'path_contact').map(role => role.id)
  assert.ok(originalContactIds.length)
  assert.ok(mixed.flatMap(d => [...d.supportEffects, ...d.damageEffects]).every(effect => !originalContactIds.includes(effect.roleInteractionId)))
  assert.ok(mixed.some(d => d.deferredRoleIds.some(id => originalContactIds.includes(id))))

  const pillar = (id, stem, branch) => ({ stem: { id, value: stem }, branch: { id: `${id}:branch`, value: branch } })
  const person = (id, chart, evidence = {}) => ({ id, chart, judgment: runJudgmentCore({
    executionId: id, natal: chart, natalCombinations: [], luck: [],
    natalValidity: { periodId: id, from: { kind: 'unknown', reason: 'contract' }, to: { kind: 'unknown', reason: 'contract' } },
    ...evidence,
  })[0] })
  const requirement = person('required:B', {
    year: pillar('food', '丙', '巳'), month: pillar('killing', '庚', '申'),
    day: pillar('day', '甲', '寅'), time: pillar('guard', '壬', '子'),
  }, {
    natalCapacityEvidence: { state: 'killing_capacity_adequate', evidenceIds: ['capacity-reviewed'] },
    natalPolicyEvidence: [
      { entityId: 'food', relatedEntityId: 'killing', condition: 'key_food_control', evidenceIds: ['key-control'] },
      { entityId: 'food', relatedEntityId: 'killing', condition: 'excessive_food_control', evidenceIds: ['excess'] },
      { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['harm'] },
    ],
  })
  const counterpart = person('required:A', {
    year: pillar('wood', '甲', '寅'), month: pillar('metal', '辛', '酉'),
    day: pillar('water', '壬', '子'), time: pillar('fire', '丁', '巳'),
  })
  const requiredPath = requirement.judgment.stemFacts.find(path => path.source.id === 'food' && path.target.id === 'killing' && path.action === 'control')
  assert.ok(requirement.judgment.actualFunctions.some(actual =>
    actual.relationFactId === requiredPath.id && actual.selectionReason === 'required_function'))
  const requiredFacts = buildCompatibilityFacts(counterpart, requirement)
  assert.deepEqual(buildCompatibilityFacts(requirement, counterpart), requiredFacts)
  const requiredEffects = run(requiredFacts, [counterpart.judgment, requirement.judgment])[0]
  for (const [type, contribution] of [
    ['supports_required_function', 'generated'], ['supports_required_root', 'root_supported'],
    ['damages_required_function', 'stopped'], ['damages_required_function', 'weakened'],
  ]) {
    assert.ok([...requiredEffects.supportEffects, ...requiredEffects.damageEffects].some(effect =>
      effect.targetPathId === requiredPath.id && effect.effectType === type && effect.contribution === contribution))
  }

  const asymmetric = empty()
  add(asymmetric, 'relief')
  add(asymmetric, 'damage-stopped', { classification: 'required', reverse: true })
  const asymmetricDirections = run(asymmetric)
  assert.deepEqual(asymmetricDirections.map(d => d.verdict), ['favorable', 'unfavorable'])
  structuralContractFixtures.asymmetric = { crossChart: { ...asymmetric, diagnostics: [] }, structural: asymmetricDirections }

  const favorableDominant = empty()
  add(favorableDominant, 'core-relief')
  add(favorableDominant, 'ordinary-damage', { classification: 'required', action: 'control', critical: false })
  assert.equal(run(favorableDominant)[0].verdict, 'favorable_dominant')

  const unfavorableDominant = empty()
  add(unfavorableDominant, 'core-activation', { action: 'root_support', before: 'inactive', activate: true })
  add(unfavorableDominant, 'ordinary-support', { classification: 'required', action: 'generate', critical: false })
  assert.equal(run(unfavorableDominant)[0].verdict, 'unfavorable_dominant')

  const balanced = empty()
  add(balanced, 'balanced-relief')
  add(balanced, 'balanced-damage', { classification: 'required' })
  add(balanced, 'extra-support', { action: 'root_support', classification: 'required' })
  const balancedDirections = run(balanced)
  structuralContractFixtures.balanced = { crossChart: { ...balanced, diagnostics: [] }, structural: balancedDirections }
  const [both] = balancedDirections
  assert.equal(both.verdict, 'balanced_mixed')
  assert.ok(both.supportEffects.some(effect => effect.effectType === 'relieves_byeong'))
  assert.ok(both.damageEffects.some(effect => effect.effectType === 'damages_required_function'))
  assert.ok(!both.deferredRoleIds.length)

  const exactPath = empty()
  add(exactPath, 'same-relief', { pathKey: 'same' })
  add(exactPath, 'same-harmful-feed', { pathKey: 'same', action: 'generate' })
  const [blocked] = run(exactPath)
  assert.equal(blocked.verdict, 'favorable')
  assert.ok(blocked.damageEffects.some(effect => effect.effectType === 'strengthens_harmful_path'))

  const sameRequired = empty()
  add(sameRequired, 'same-required-feed', { pathKey: 'required', classification: 'required', action: 'generate' })
  add(sameRequired, 'same-required-stop', { pathKey: 'required', classification: 'required' })
  const [requiredBlocked] = run(sameRequired)
  assert.equal(requiredBlocked.verdict, 'unfavorable')
  assert.equal(requiredBlocked.supportEffects.length, 1)

  const weaker = empty()
  add(weaker, 'weakened', { action: 'control' })
  const [minor] = run(weaker)
  assert.equal(minor.verdict, 'minor_effect')
  assert.deepEqual(minor.supportEffects.map(effect => effect.effectType), ['weakens_byeong'])

  const pending = empty()
  add(pending, 'unconfirmed', { omitEvidence: true })
  add(pending, 'wrong-actor')
  const [wrong] = pending.roleInteractions.at(-1).pathEvidence
  wrong.sourceEntityId = 'unrelated'
  add(pending, 'wrong-cross-direction')
  pending.stemInteractions.at(-1).compatibilityRuntimeEffects.shift()
  add(pending, 'already-reduced', { action: 'control', before: 'reduced' })
  const [deferred] = run(pending)
  assert.equal(deferred.verdict, 'deferred')
  assert.equal(deferred.deferredRoleIds.length, 4)
  assert.deepEqual(deferred.supportEffects, [])
  assert.deepEqual(deferred.damageEffects, [])

  for (const type of ['relieves_byeong', 'weakens_byeong', 'activates_byeong', 'strengthens_harmful_path',
    'supports_required_function', 'damages_required_function', 'supports_required_root', 'supports_harmful_root']) {
    assert.ok(census.effectTypes[type], type)
  }
  for (const label of ['favorable', 'favorable_dominant', 'balanced_mixed', 'minor_effect', 'unfavorable_dominant', 'unfavorable']) {
    assert.ok(census.verdicts[label], label)
  }
  console.log(JSON.stringify({ result: 'PASS', sourceSnapshots: 3, ...census }, null, 2))
} finally {
  await server.close()
}
