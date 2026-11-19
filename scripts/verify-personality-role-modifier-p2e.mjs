import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({
  appType: 'custom', logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] }, server: { hmr: false, middlewareMode: true, ws: false },
})

const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const validity = {
  periodId: 'p2e-natal', from: { kind: 'exact', instant: '2000-01-01T00:00:00.000Z' },
  to: { kind: 'exact', instant: '2100-01-01T00:00:00.000Z' },
}
const pillar = (id, value, branch) => ({ stem: { id, value }, branch: { id: id + '-branch', value: branch } })
const day = pillar('day', '甲', '寅')
const month = pillar('officer', '辛', '酉')
const hurt = pillar('hurt', '丁', '巳')
const guard = pillar('guard', '壬', '子')
const food = pillar('food', '丙', '巳')
const wealth = pillar('wealth', '戊', '辰')

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

try {
  const { buildNatalPersonality, applyStructuralRoleModifiers } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateTenGod, calculateDayRelationships } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')
  const { TEN_GOD_PROFILES } = await load('personality/knowledge/tenGodProfiles')
  const originalKnowledge = structuredClone(TEN_GOD_PROFILES)

  function sample(natal, ...luck) {
    const chart = { pillars: {}, basicRelations: {} }
    const dayStem = natal.day.stem.value
    for (const position of ['year', 'month', 'day', 'time']) {
      const value = natal[position]
      if (!value) {
        chart.pillars[position] = { status: 'unknown', uncertaintyIds: ['fixture'] }
        chart.basicRelations[position] = { status: 'unknown', uncertaintyIds: ['fixture'] }
        continue
      }
      const { stem: { value: stem }, branch: { value: branch } } = value
      chart.pillars[position] = { status: 'confirmed', value: { stem, branch, ganZhi: stem + branch } }
      chart.basicRelations[position] = { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(dayStem, stem), relationships: calculateDayRelationships(dayStem, branch),
        twelveStage: calculateTwelveStage(dayStem, branch),
      } }
    }
    const [snapshot, ...luckSnapshots] = runJudgmentCore({
      executionId: 'p2e-role-fixture', natal, natalValidity: validity, natalCombinations: [], luck,
      referenceTime: '2026-06-01T00:00:00.000Z',
    })
    const before = structuredClone(snapshot)
    const reading = freeze(projectNatalStructuralReading(snapshot))
    assert.deepEqual(snapshot, before)
    const base = freeze(buildNatalPersonality(chart))
    const result = applyStructuralRoleModifiers(base, reading)
    assert.deepEqual(applyStructuralRoleModifiers(result, reading), result)
    for (const key of Object.keys(base).filter(key =>
      !['structuralRoleModifiers', 'roleConflicts', 'structuralRoleDiagnostics', 'conflicts'].includes(key))) {
      assert.strictEqual(result[key], base[key], key)
    }
    assert.deepEqual(result.conflicts.slice(0, base.conflicts.length), base.conflicts)
    for (const modifier of result.structuralRoleModifiers) {
      const role = reading.roleHistory.find(item => item.roleId === modifier.sourceRoleId)
      const actor = reading.actors.find(item => item.entityId === modifier.sourceEntityId)
      assert.ok(role && actor && modifier.provenanceIds.includes(role.roleId))
      assert.ok(modifier.targetPersonalityFactIds.length)
      for (const id of modifier.targetPersonalityFactIds) {
        const fact = base.facts.find(item => item.id === id)
        assert.ok(fact?.sourceType === 'ten_god' && fact.sourcePosition === actor.position)
        assert.ok(fact.occurrenceIds.some(ref => base.occurrences.some(item =>
          item.id === ref && item.stem === actor.stem && item.canonicalTenGod === actor.tenGod)))
      }
      assert.ok(modifier.actualFunctionRefs.every(ref => reading.paths.some(path => path.actual?.ref === ref)))
    }
    return { snapshot, luckSnapshots, reading, base, result }
  }

  const role = (result, name, actor) => result.structuralRoleModifiers.find(item =>
    item.sourceRole === name && item.sourceEntityId === actor)
  const officer = sample({ day, month })
  const central = role(officer.result, 'yongshen', 'officer')
  // A / F: effective month-command manifestation and No-Byeong.
  assert.equal(central.status, 'confirmed')
  assert.equal(central.operation, 'channels_expression')
  assert.equal(officer.snapshot.roleEngine.byeongStatus, 'none')
  assert.equal(officer.snapshot.roleEngine.guEungStatus, 'not_applicable')
  assert.ok(!officer.result.structuralRoleModifiers.some(item => ['byeong', 'gueung'].includes(item.sourceRole)))
  assert.ok(officer.result.tenGodStates.every(item => item.prominence.status === 'deferred'))

  // B: active protection links to the guard's own natal occurrence.
  const guarded = sample({ day, month, year: hurt, time: guard })
  const helper = role(guarded.result, 'sangshen', 'guard')
  assert.equal(helper.status, 'confirmed')
  assert.equal(helper.operation, 'protects_expression')
  assert.ok(helper.actualFunctionRefs.length && helper.actualFunctionRefs.some(ref =>
    guarded.reading.paths.some(path => path.actual?.ref === ref && path.actual.policyId === 'OFF-02')))
  // Existing P2-D conflict is preserved by reference in the combined result.
  assert.ok(guarded.base.conflicts.some(item => item.conflictType === 'outward_vs_inner'))

  // C: standby remains conditional on a threat, including when a later snapshot activates it.
  const standby = sample({ day, month, year: pillar('standby', '癸', '子') }, {
    scope: 'greatLuck', pillar: hurt, validity,
  })
  const standbyModifier = role(standby.result, 'sangshen', 'standby')
  assert.equal(standbyModifier.status, 'contextual')
  assert.equal(standbyModifier.roleContext, 'protective_standby')
  assert.equal(standbyModifier.currentFunction, 'inactive')
  assert.equal(standbyModifier.protectedEntityId, 'officer')
  assert.throws(() => projectNatalStructuralReading(standby.luckSnapshots[0]), /natal/)
  assert.throws(() => applyStructuralRoleModifiers(standby.base, { ...standby.reading, scope: 'greatLuck' }), /natal/)

  // D: native offense path has its own actor, action, damaged function and consequence.
  const attacked = sample({ day, month, year: hurt })
  const harmful = role(attacked.result, 'byeong', 'hurt')
  assert.equal(harmful.status, 'confirmed')
  assert.equal(harmful.operation, 'distorts_expression')
  assert.deepEqual([
    harmful.damagePath.sourceEntityId, harmful.damagePath.action, harmful.damagePath.targetEntityId,
    harmful.damagePath.damagedFunction, harmful.damagePath.structuralConsequence,
  ], ['hurt', 'control', 'officer', 'officer', 'damage_candidate'])
  const withoutDamage = applyStructuralRoleModifiers(attacked.base, { ...attacked.reading, damagePaths: [] })
  assert.equal(role(withoutDamage, 'byeong', 'hurt'), undefined)
  assert.ok(withoutDamage.structuralRoleDiagnostics.some(item => item.code === 'ROLE_PATH_UNCONFIRMED'))

  // E / J: the native chart emits both favorable current use and a conditional path for the same wealth actor.
  const peer = sample({ day, month: pillar('peer', '甲', '寅'), year: wealth, time: food })
  const latent = role(peer.result, 'byeong', 'wealth')
  const main = role(peer.result, 'yongshen', 'wealth')
  assert.equal(latent.status, 'contextual')
  assert.equal(latent.roleContext, 'conditional_byeong')
  assert.equal(latent.currentFunction, 'favorable')
  assert.equal(main.status, 'confirmed')
  assert.deepEqual(latent.targetPersonalityFactIds, main.targetPersonalityFactIds)
  assert.ok(peer.result.roleConflicts.some(item => item.conflictType === 'conditional_role_shift'
    && item.resolution === 'context_split' && item.modifierIds.includes(main.id) && item.modifierIds.includes(latent.id)))
  assert.equal(peer.result.facts.filter(fact => fact.traitType === 'shadow').length, peer.base.facts.filter(fact => fact.traitType === 'shadow').length)

  // G: a native remedy refers to an actual (now inactive) harm path.
  const remedied = sample({ day, month: food, year: guard, time: wealth })
  const remedy = role(remedied.result, 'gueung', 'wealth')
  assert.equal(remedy.status, 'confirmed')
  assert.equal(remedy.operation, 'resolves_tension')
  assert.equal(remedy.targetByeongId, role(remedied.result, 'byeong', 'guard').damagePath.id)
  assert.equal(role(remedied.result, 'byeong', 'guard').status, 'inactive')
  const withoutTarget = applyStructuralRoleModifiers(remedied.base, {
    ...remedied.reading,
    roleHistory: remedied.reading.roleHistory.map(item => item.role === 'gueung' ? { ...item, targetByeongId: undefined } : item),
  })
  assert.equal(role(withoutTarget, 'gueung', 'wealth'), undefined)

  // H / I: retain the exact role history while independently varying the normalized runtime and actual function.
  const overrideRuntime = (sample, actor, state) => ({
    ...sample.reading,
    runtime: sample.reading.runtime.map(item => item.entityId === actor ? { ...item, state } : item),
  })
  for (const [runtime, expected] of [['stopped', 'inactive'], ['weakened', 'reduced']]) {
    const result = applyStructuralRoleModifiers(guarded.base, overrideRuntime(guarded, 'guard', runtime))
    const actual = role(result, 'sangshen', 'guard')
    assert.equal(actual.status, expected)
    assert.equal(actual.sourceRoleId, helper.sourceRoleId)
    assert.deepEqual(actual.provenanceIds, helper.provenanceIds)
    assert.strictEqual(result.facts, guarded.base.facts)
  }
  const inactivePath = applyStructuralRoleModifiers(guarded.base, {
    ...guarded.reading,
    paths: guarded.reading.paths.map(path => helper.actualFunctionRefs.includes(path.id) ? {
      ...path, actual: { ...path.actual, function: 'inactive' },
    } : path),
  })
  assert.ok(['inactive', 'deferred'].includes(role(inactivePath, 'sangshen', 'guard').status))
  const onlyHistory = applyStructuralRoleModifiers(officer.base, { ...officer.reading, currentRoles: [] })
  assert.equal(role(onlyHistory, 'yongshen', 'officer').status, 'deferred')
  assert.deepEqual(role(onlyHistory, 'yongshen', 'officer').historyPathRefs, central.historyPathRefs)
  assert.deepEqual(role(onlyHistory, 'yongshen', 'officer').currentPathRefs, [])

  // J: a composed boundary fixture supplies two distinct, verified paths for the same harmful actor.
  const secondId = 'fixture:yongshen:hurt'
  const secondPathId = 'fixture:favorable-path:hurt'
  const combined = applyStructuralRoleModifiers(attacked.base, {
    ...attacked.reading,
    roleHistory: [...attacked.reading.roleHistory, {
      roleId: secondId, role: 'yongshen', actorId: 'hurt', pathRefs: [secondPathId],
    }],
    currentRoles: [...attacked.reading.currentRoles, {
      roleId: secondId, currentState: 'active', currentFunction: 'operating', pathRefs: [secondPathId],
    }],
    paths: [...attacked.reading.paths, {
      id: secondPathId, sourceEntityId: 'hurt', targetEntityId: 'day', action: 'control',
      actual: { ref: secondPathId, function: 'operating', direction: 'favorable', policyId: 'fixture', evidenceIds: ['fixture:evidence'] },
    }],
  })
  assert.equal(role(combined, 'yongshen', 'hurt').status, 'confirmed')
  assert.equal(role(combined, 'byeong', 'hurt').status, 'confirmed')
  assert.ok(combined.roleConflicts.some(item => item.conflictType === 'structural_role_tension' && item.resolution === 'coexist'))

  // K: no new traits when a role cannot link to any base facts or points to self.
  const emptyTarget = { ...officer.base, facts: officer.base.facts.filter(fact => fact.tenGod !== '正官') }
  const noTarget = applyStructuralRoleModifiers(emptyTarget, officer.reading)
  assert.strictEqual(noTarget.facts, emptyTarget.facts)
  assert.ok(noTarget.structuralRoleDiagnostics.some(item => item.code === 'NO_PERSONALITY_TRAIT_TARGET'))
  const self = applyStructuralRoleModifiers(officer.base, {
    ...officer.reading, roleHistory: [{ ...officer.reading.roleHistory[0], actorId: 'day' }],
  })
  assert.equal(self.structuralRoleModifiers.length, 0)
  assert.equal(self.structuralRoleDiagnostics[0].code, 'NO_PERSONALITY_TRAIT_TARGET')

  // L: independently wrong stem or canonical TenGod must never fall back to a different occurrence.
  for (const wrong of [{ stem: '庚' }, { tenGod: '偏官' }]) {
    const mismatch = applyStructuralRoleModifiers(officer.base, {
      ...officer.reading, actors: officer.reading.actors.map(actor =>
        actor.entityId === 'officer' ? { ...actor, ...wrong } : actor),
    })
    assert.equal(role(mismatch, 'yongshen', 'officer'), undefined)
    assert.ok(mismatch.structuralRoleDiagnostics.some(item => item.code === 'ROLE_PERSONALITY_LINK_MISMATCH'))
  }
  const hidden = applyStructuralRoleModifiers(officer.base, {
    ...officer.reading,
    actors: officer.reading.actors.map(actor => actor.entityId === 'officer' ?
      { ...actor, position: 'month_branch', hiddenStemRole: 'main' } : actor),
  })
  assert.ok(role(hidden, 'yongshen', 'officer').targetPersonalityFactIds.every(id =>
    hidden.facts.find(fact => fact.id === id).sourcePosition === 'month_branch'))

  for (const item of [officer, guarded, attacked, standby, peer, remedied]) {
    const shuffled = { ...item.reading }
    for (const key of ['actors', 'roleHistory', 'currentRoles', 'runtime', 'paths', 'damagePaths', 'manifestedYongShen']) {
      shuffled[key] = [...shuffled[key]].reverse()
    }
    assert.deepEqual(applyStructuralRoleModifiers(item.base, shuffled), item.result)
  }
  assert.deepEqual(TEN_GOD_PROFILES, originalKnowledge)

  const subjects = [officer, guarded, attacked, standby, peer, remedied]
  const counts = { yongshen: 0, sangshen: 0, byeong: 0, gueung: 0 }
  for (const entry of subjects) for (const item of entry.result.structuralRoleModifiers) counts[item.sourceRole]++
  const lib = path.join(root, 'src/lib')
  for (const file of ts.sys.readDirectory(path.join(lib, 'judgment'), ['.ts', '.tsx'])) {
    assert.ok(ts.preProcessFile(readFileSync(file, 'utf8'), true).importedFiles.every(({ fileName }) => !/personality/i.test(fileName)), file)
  }
  for (const file of ts.sys.readDirectory(path.join(lib, 'personality'), ['.ts', '.tsx'])) {
    const code = readFileSync(file, 'utf8')
    assert.doesNotMatch(code, /\b(?:roleScore|positiveWeight|negativeWeight|modifierWeight)\b/, file)
    assert.ok(ts.preProcessFile(code, true).importedFiles.every(({ fileName }) => !/judgment/i.test(fileName)), file)
  }
  console.log('PASS: P2-E A–L, natal boundary, additive modifiers, stable ordering, no runtime direction/scoring dependency')
  console.log(JSON.stringify(counts))
} finally {
  await server.close()
}
