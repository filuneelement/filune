import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] },
  server: { hmr: false, middlewareMode: true, ws: false },
})
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const first = '2027-01-01T00:00:00.000Z'
const next = '2028-01-01T00:00:00.000Z'
const during = '2027-01-01T12:00:00.000Z'
const nextDay = '2027-01-02T00:00:00.000Z'
const nextMonth = '2027-02-01T00:00:00.000Z'
const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
const natalValidity = validity('natal', '2000-01-01T00:00:00.000Z', '2100-01-01T00:00:00.000Z')
const old = validity('great-a', first, next)
const yearly = validity('year-a', first, next)
const month = validity('month-a', first, nextMonth)
const dayPeriod = validity('day-a', first, nextDay)
const replacement = validity('great-b', next, '2029-01-01T00:00:00.000Z')
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
const luck = (id, stem, branch, scope = 'greatLuck', period = old, policyEvidence) =>
  ({ scope, pillar: pillar(id, stem, branch), validity: period, ...(policyEvidence && { policyEvidence }) })

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}
const checks = new Set()
function check(label, run) {
  try { run() } catch (cause) { throw new Error(label, { cause }) }
  checks.add(label[0])
  console.log('PASS ' + label)
}

try {
  const { buildNatalPersonality, applyStructuralRoleModifiers, buildCurrentPersonality } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { projectCurrentPersonalityScopes } = await load('personalityCurrentReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { TEN_GOD_PROFILES } = await load('personality/knowledge/tenGodProfiles')
  const savedKnowledge = structuredClone(TEN_GOD_PROFILES)

  function chart(natal) {
    const result = { pillars: {}, basicRelations: {} }
    const dayStem = natal.day.stem.value
    for (const key of ['year', 'month', 'day', 'time']) {
      const value = natal[key]
      if (!value) {
        result.pillars[key] = result.basicRelations[key] = { status: 'unknown', uncertaintyIds: ['fixture'] }
        continue
      }
      const { stem: { value: stem }, branch: { value: branch } } = value
      result.pillars[key] = { status: 'confirmed', value: { stem, branch, ganZhi: stem + branch } }
      result.basicRelations[key] = { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(dayStem, stem), relationships: calculateDayRelationships(dayStem, branch),
        twelveStage: calculateTwelveStage(dayStem, branch),
      } }
    }
    return result
  }

  function read(natal, luckPeriods = [], time = during, priorHistory) {
    return runJudgmentCore({
      executionId: 'p2f-fixture', natal, natalValidity, natalCombinations: [], luck: luckPeriods,
      referenceTime: time, priorHistory,
    })
  }

  function sample(natal, luckPeriods = [], time = during, scope = 'daewoon', previous, priorHistory) {
    const snapshots = read(natal, luckPeriods, time, priorHistory)
    const saved = structuredClone(snapshots)
    const base = freeze(applyStructuralRoleModifiers(buildNatalPersonality(chart(natal)), projectNatalStructuralReading(snapshots[0])))
    const savedBase = structuredClone(base)
    const scopes = freeze(projectCurrentPersonalityScopes(snapshots, base.dayStem, time))
    const input = { natalPersonality: base, structuralScopes: scopes, referenceTime: time,
      evaluationScope: scope, previousEffectHistory: previous?.effectHistory }
    const result = buildCurrentPersonality(input)
    assert.strictEqual(result.natal, base)
    assert.deepEqual(base, savedBase)
    assert.deepEqual(snapshots, saved)
    return { result, base, scopes, snapshots, input }
  }

  const role = (result, kind, actor) => result.structuralRoleModifiers.find(item =>
    item.sourceRole === kind && item.sourceEntityId === actor)
  const expressions = (result, scope) => result.scopeExpressions.find(item => item.scope === scope)
  const event = (result, type, effective) => result.effectHistory.find(item =>
    item.structuralEffectType === type && (effective === undefined || item.currentlyEffective === effective))
  const temps = result => result.effectHistory.filter(item => item.type === 'temporary_ten_god_expression')
  const isFrom = (result, id, scope) => result.currentFacts.find(fact => fact.personalityFactId === id)?.origins.some(origin => origin.originScope === scope)
  const day = pillar('day', '甲', '寅')
  const officer = { day, month: pillar('officer', '辛', '酉') }
  const hurt = { ...officer, year: pillar('hurt', '丁', '巳') }
  const guarded = { ...hurt, time: pillar('guard', '壬', '子') }
  const standby = { ...officer, year: pillar('standby', '癸', '子') }
  const wealth = { day, month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
  const great = luck('great', '乙', '卯')
  const year = luck('year', '乙', '卯', 'yearlyLuck', yearly)
  const monthly = luck('month', '己', '未', 'monthlyLuck', month)
  const daily = luck('day-luck', '庚', '辰', 'dailyLuck', dayPeriod)
  const after = luck('replacement', '己', '未', 'greatLuck', replacement)
  const chain = sample(officer, [great, year, monthly, daily], during, 'day')

  check('A — frozen natal and independent scope states', () => {
    assert.deepEqual(chain.result.scopeExpressions.map(item => item.scope), ['natal', 'daewoon', 'sewoon', 'month', 'day'])
    assert.deepEqual(chain.base.tenGodStates, chain.result.natal.tenGodStates)
    const natalFacts = chain.result.currentFacts.filter(item => item.origin === 'natal')
    assert.ok(natalFacts.every(item => item.state === 'baseline'))
    const parentReading = buildCurrentPersonality({ ...chain.input, evaluationScope: 'daewoon' })
    assert.deepEqual(expressions(parentReading, 'daewoon'), expressions(chain.result, 'daewoon'))
  })
  const initial = sample(officer, [great])
  check('B — daewoon brings a temporary outward TenGod', () => {
    assert.ok(!initial.base.occurrences.some(item => item.tenGod === '劫財'))
    assert.ok(initial.result.temporaryFacts.some(fact => fact.tenGod === '劫財' && isFrom(initial.result, fact.id, 'daewoon')))
    assert.ok(initial.result.currentFacts.some(fact => fact.originScope === 'daewoon' && fact.expressionMode === 'outward'))
  })
  check('C — sewoon inherits one daewoon origin event', () => {
    const own = temps(initial.result).filter(item => item.originScope === 'daewoon')
    for (const item of own) {
      assert.equal(chain.result.effectHistory.filter(value => value.id === item.id).length, 1)
      assert.ok(expressions(chain.result, 'sewoon').inheritedEffectIds.includes(item.id))
      assert.ok(chain.result.effectHistory.find(value => value.id === item.id).inherited)
    }
  })
  check('D — replacement daewoon retires old effects without resurrecting their facts', () => {
    const later = sample(officer, [after], next, 'daewoon', initial.result, initial.snapshots.at(-1))
    for (const item of temps(initial.result)) {
      const record = later.result.effectHistory.find(value => value.id === item.id)
      assert.ok(record?.expired && !record.currentlyEffective)
      assert.equal(later.result.currentFacts.some(fact => fact.origins.some(origin => origin.originEffectId === item.id)), false)
    }
    const explicit = buildCurrentPersonality({
      ...later.input, structuralScopes: [...later.scopes, initial.scopes[1]], previousEffectHistory: [],
    })
    assert.ok(explicit.effectHistory.some(item => item.type === 'temporary_ten_god_expression'
      && item.originPeriod.periodId === old.periodId && item.expired))
  })
  check('E — month expression expires at the exact end', () => {
    assert.ok(expressions(chain.result, 'month').temporaryFactIds.length)
    const later = sample(officer, [great, year, monthly], nextMonth, 'month', chain.result)
    assert.equal(later.result.evaluationScope, 'sewoon')
    assert.ok(temps(later.result).filter(item => item.originScope === 'month').every(item => item.expired && !item.currentlyEffective))
  })
  check('F — day expression expires in the next daily period', () => {
    assert.ok(expressions(chain.result, 'day').temporaryFactIds.length)
    const secondDay = luck('day-luck-next', '癸', '丑', 'dailyLuck', validity('day-b', nextDay, '2027-01-03T00:00:00.000Z'))
    const later = sample(officer, [great, year, monthly, secondDay], nextDay, 'day', chain.result)
    const retired = temps(later.result).filter(item => item.originPeriod.periodId === dayPeriod.periodId)
    assert.ok(retired.length && retired.every(item => item.expired && !item.currentlyEffective))
    assert.ok(temps(later.result).some(item => item.originPeriod.periodId === 'day-b' && item.currentlyEffective))
  })
  check('G — native standby SangShen activates and keeps its ID', () => {
    const item = sample(standby, [luck('threat', '丁', '巳'), year], during, 'sewoon')
    const baseline = role(item.base, 'sangshen', 'standby')
    const modifier = role(item.result, 'sangshen', 'standby')
    assert.equal(baseline.status, 'contextual')
    assert.equal(modifier.id, baseline.id)
    assert.equal(modifier.status, 'confirmed')
    assert.ok(event(item.result, 'activates_sangshen_function', true)?.inherited)
    assert.ok(expressions(item.result, 'sewoon').roleModifierStates.some(state => state.modifierId === baseline.id && state.status === 'confirmed'))
  })
  check('H — native stop changes SangShen influence only', () => {
    const item = sample(guarded, [luck('stopper', '丁', '巳')])
    const baseline = role(item.base, 'sangshen', 'guard')
    const modifier = role(item.result, 'sangshen', 'guard')
    assert.equal(baseline.status, 'confirmed')
    assert.equal(modifier.status, 'inactive')
    assert.equal(modifier.runtimeState, 'stopped')
    assert.ok(event(item.result, 'weakens_sangshen', true))
    assert.ok(modifier.targetPersonalityFactIds.every(id => item.result.currentFacts.some(fact =>
      fact.personalityFactId === id && fact.state === 'baseline')))
  })
  check('I — evaluated conditional Byeong becomes active without shadow promotion', () => {
    const trigger = luck('killing', '庚', '申', 'greatLuck', old, [
      { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['fixture:reviewed-killing'] },
    ])
    const item = sample(wealth, [trigger])
    assert.equal(role(item.base, 'byeong', 'wealth').status, 'contextual')
    const modifier = role(item.result, 'byeong', 'wealth')
    assert.equal(modifier.status, 'confirmed')
    assert.equal(modifier.operation, 'distorts_expression')
    assert.ok(event(item.result, 'activates_byeong', true))
    assert.ok(!item.result.temporaryFacts.some(fact => fact.traitType === 'shadow'))
    assert.deepEqual(item.result.natal.facts, item.base.facts)
  })
  const relief = sample(hurt, [luck('relief', '壬', '子')])
  check('J — confirmed Byeong path is relieved for the current period', () => {
    const before = role(relief.base, 'byeong', 'hurt')
    const modifier = role(relief.result, 'byeong', 'hurt')
    assert.equal(before.status, 'confirmed')
    assert.equal(modifier.id, before.id)
    assert.equal(modifier.status, 'inactive')
    assert.equal(modifier.damagePath.currentState, 'inactive')
    assert.ok(event(relief.result, 'relieves_byeong', true))
  })
  check('K — relief expiry restores current native functioning', () => {
    const item = sample(hurt, [after], next, 'daewoon', relief.result, relief.snapshots.at(-1))
    assert.equal(role(item.result, 'byeong', 'hurt').status, 'confirmed')
    assert.equal(role(item.result, 'byeong', 'hurt').damagePath.currentState, 'active')
    const past = event(item.result, 'relieves_byeong', false)
    assert.ok(past?.expired && past.id === event(relief.result, 'relieves_byeong', true).id)
  })
  check('L — attack and protection evidence follows supplied current authority', () => {
    const nativeAttack = sample(officer, [luck('attacker', '丁', '巳')])
    const attack = event(nativeAttack.result, 'attacks_yongshen', true)
    assert.ok(attack?.factIds.length)
    assert.deepEqual(nativeAttack.result.natal.facts, nativeAttack.base.facts)
    // Projected boundary fixture isolates the two evidence labels from runtime resolution.
    const id = role(initial.base, 'yongshen', 'officer').sourceRoleId
    for (const [effectType, fn, expected] of [
      ['attacks_yongshen', 'reduced', 'reduced'], ['protects_yongshen', 'operating', 'confirmed'],
      ['attacks_yongshen', 'operating', 'confirmed'],
    ]) {
      const scope = initial.scopes[1]
      const projected = {
        ...scope,
        roles: scope.roles.map(role => role.roleId === id ? { ...role, currentFunction: fn, currentState: 'active' } : role),
        effects: [...scope.effects, {
          id: 'fixture:' + effectType, effectType, subjectId: id, sourceEntityId: 'great',
          originScope: 'daewoon', originPeriod: scope.period, currentlyEffective: true, expired: false, sourceIds: ['fixture:judged'],
        }],
      }
      const output = buildCurrentPersonality({ ...initial.input, structuralScopes: [initial.scopes[0], projected] })
      assert.equal(role(output, 'yongshen', 'officer').status, expected)
      assert.ok(event(output, effectType, true)?.factIds.length)
      assert.strictEqual(output.natal.facts, initial.base.facts)
    }
  })
  check('M — matching natal and two luck TenGods consolidate textual facts', () => {
    const same = sample(officer, [luck('great-officer', '辛', '酉'), luck('year-officer', '辛', '酉', 'yearlyLuck', yearly)], during, 'sewoon')
    const facts = same.result.currentFacts.filter(item => item.origins.length > 1)
    assert.ok(facts.some(item => item.origin === 'natal' && item.origins.some(origin => origin.originScope === 'daewoon')
      && item.origins.some(origin => origin.originScope === 'sewoon')))
    assert.equal(new Set(same.result.temporaryFacts.map(item => item.id)).size, same.result.temporaryFacts.length)
  })
  check('N — natal outward and temporary inner tensions coexist and expire', () => {
    const current = sample(hurt, [luck('resource', '癸', '子')])
    assert.ok(current.result.conflicts.some(item => item.conflictType === 'natal_vs_current' && item.resolution === 'context_split'
      && item.factIds.some(id => current.base.facts.some(fact => fact.id === id && fact.sourcePosition === 'year_stem'))
      && item.factIds.some(id => current.result.temporaryFacts.some(fact => fact.id === id))))
    const oldConflict = current.result.effectHistory.find(item => item.type === 'conflict_activation')
    const later = sample(hurt, [after], next, 'daewoon', current.result)
    const retired = later.result.effectHistory.find(item => item.id === oldConflict.id)
    assert.ok(retired?.expired && !retired.currentlyEffective)
  })
  check('O — an empty Knowledge field has no temporary provenance or invented trait', () => {
    assert.deepEqual(TEN_GOD_PROFILES.劫財.socialExpression, [])
    assert.ok(!initial.result.temporaryFacts.some(item => item.tenGod === '劫財' && item.traitType === 'social'))
    for (const result of [initial.result, chain.result, relief.result]) {
      assert.ok(!result.provenance.some(item => ['productiveExpression', 'excessiveExpression', 'deficientExpression'].includes(item.field)
        && !result.natal.provenance.some(note => note.id === item.id)))
    }
  })
  check('P — unknown hour remains unavailable, and 戊午 stays canonical', () => {
    assert.ok(chain.base.unavailablePositions.includes('hour_stem'))
    assert.ok(!chain.base.facts.some(item => item.sourcePosition?.startsWith('hour_')))
    assert.ok(chain.result.temporaryFacts.length)
    const wu = sample({ day: pillar('wu-day', '戊', '午'), month: pillar('wu-month', '戊', '午') }, [luck('wu-great', '己', '未')])
    assert.equal(wu.result.natal.dayPillarModifier.dayBranchTenGod, '正印')
    assert.ok(!wu.result.temporaryFacts.some(fact => fact.tenGod === '偏財'))
  })
  check('Q — expired direct data is history only; selected effect flags are authoritative', () => {
    const projected = { ...relief.scopes[1], currentlyEffective: false }
    const time = next
    const expired = buildCurrentPersonality({ ...relief.input, structuralScopes: [relief.scopes[0], projected], referenceTime: time })
    assert.equal(expired.evaluationScope, 'natal')
    assert.ok(!expired.temporaryFacts.length && expired.currentFacts.every(item => item.origin === 'natal'))
    assert.ok(expired.effectHistory.length && expired.effectHistory.every(item => !item.currentlyEffective && item.expired))
    const marked = buildCurrentPersonality({ ...relief.input, structuralScopes: [relief.scopes[0], {
      ...relief.scopes[1], effects: relief.scopes[1].effects.map(item => ({ ...item, currentlyEffective: false, expired: true })),
    }] })
    assert.ok(!event(marked, 'relieves_byeong', false)?.currentlyEffective)
    assert.ok(marked.currentFacts.every(item => item.sourceStructuralEffectIds.length === 0))
  })
  check('R — IDs, ordering, and effect history are deterministic', () => {
    const reversed = [...chain.scopes].reverse().map(scope => ({ ...scope, occurrences: [...scope.occurrences].reverse() }))
    assert.deepEqual(buildCurrentPersonality({ ...chain.input, structuralScopes: reversed }), chain.result)
    assert.deepEqual(buildCurrentPersonality({ ...chain.input, previousEffectHistory: chain.result.effectHistory }), chain.result)
    const ids = new Set(chain.result.currentFacts.map(item => item.personalityFactId))
    assert.equal(ids.size, chain.result.currentFacts.length)
    assert.ok(chain.result.conflicts.every(conflict => conflict.factIds.every(id => ids.has(id))))
    assert.equal(new Set(chain.result.effectHistory.map(item => item.id)).size, chain.result.effectHistory.length)
    assert.ok(chain.result.natal.tenGodStates.every(item => item.prominence.status === 'deferred'))
    assert.deepEqual(TEN_GOD_PROFILES, savedKnowledge)

    const nativeManifestation = sample({
      day: pillar('manifest-day', '丙', '午'), month: pillar('manifest-month', '壬', '申'),
    }, [luck('manifested', '庚', '亥')])
    const manifestation = event(nativeManifestation.result, 'manifests_yongshen', true)
    assert.ok(manifestation?.factIds.length)
    assert.ok(nativeManifestation.result.structuralRoleModifiers.every(modifier =>
      nativeManifestation.base.structuralRoleModifiers.some(original => original.id === modifier.id)))

    // A confirmed supplied actor can expose an otherwise isolated native luck stem.
    const isolated = sample({ day }, [luck('isolated', '甲', '寅')])
    const scopeId = isolated.snapshots[1].id
    const withBinding = projectCurrentPersonalityScopes(isolated.snapshots, '甲', during, [
      { snapshotId: scopeId, entityId: 'day', stem: '甲' },
      { snapshotId: scopeId, entityId: 'isolated', stem: '甲' },
    ])
    assert.equal(withBinding[1].occurrences.find(item => item.mode === 'outward')?.entityId, 'isolated')
  })

  for (const file of ts.sys.readDirectory(path.join(root, 'src/lib/personality'), ['.ts'])) {
    const code = readFileSync(file, 'utf8')
    assert.doesNotMatch(code, /\b(?:luckWeight|scopeWeight|traitScore|currentScore|personalityStrength|modifierScore)\b/)
    assert.ok(ts.preProcessFile(code, true).importedFiles.every(({ fileName }) => !/judgment/i.test(fileName)), file)
  }
  assert.equal(checks.size, 18)
  console.log('PASS: P2-F A–R (18/18)')
} finally {
  await server.close()
}
