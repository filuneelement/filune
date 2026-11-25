import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const read = name => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'))
const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } })
const load = name => server.ssrLoadModule(`/src/lib/${name}.ts`)
const branchComparison = process.argv.includes('--branch-comparison')

function branchTrace(snapshot) {
  const labels = new Map(snapshot.formationBranchPool.map(({ id, branch, scope }) => {
    const context = snapshot.branchContexts.find(item => item.id === id)
    return [id, `${context?.position === 'luck' ? scope : context?.position}:${branch}:${context?.tenGod ?? '?'}`]
  }))
  const participants = ids => ids.map(id => labels.get(id) ?? id)
  const relations = snapshot.branchFacts.map(({ id, kind, participants: ids }, index) =>
    ({ ref: `R${index + 1}`, id, kind, participants: participants(ids) }))
  const formations = snapshot.formationFacts.map(({ id, kind, elementStem, participants: ids }, index) =>
    ({ ref: `F${index + 1}`, id, kind, elementStem, participants: participants(ids) }))
  const actions = snapshot.branchDamage.relations.map(({ id, source, target, action, confirmed, reachable }, index) =>
    ({ ref: `A${index + 1}`, id, action, source: labels.get(source.id), target: labels.get(target.id), confirmed, reachable }))
  const refs = new Map([...relations, ...formations, ...actions].map(({ id, ref }) => [id, ref]))
  const evidence = ids => ids.map(id => refs.get(id) ?? id)
  const strip = ({ id, ...record }) => record
  return {
    relation: relations.map(strip),
    runtimeAndFormation: {
      pool: [...labels.values()],
      runtime: snapshot.branchRuntimeStates.map(({ entityId, state }) => [labels.get(entityId), state]),
      clashes: snapshot.branchRelationEffects.filter(({ relationId }) =>
        relations.some(({ id, kind }) => id === relationId && kind === 'clash'))
        .map(({ relationId, effect }) => [refs.get(relationId), effect]),
      formations: formations.map(strip),
      roots: snapshot.rootStates.map(({ entityId, state }) => [entityId.split('/').slice(-3, -2)[0], state]),
    },
    actualFunction: {
      directed: actions.map(strip),
      commandRecovery: evidence(snapshot.branchDamage.commandRecoveryRefs ?? []),
      capacityDamage: snapshot.branchDamage.paths.filter(({ damagedFunction }) => damagedFunction === 'branch_wealth_capacity')
        .map(({ sourceEntityId, targetEntityId, state, relationRefs }) =>
          [labels.get(sourceEntityId), labels.get(targetEntityId), state, evidence(relationRefs)]),
    },
    illnessAndProtection: {
      protection: snapshot.branchDamage.protectivePaths.map(({ entityId, relationRefs }) =>
        [labels.get(entityId), evidence(relationRefs)]),
      incomplete: snapshot.branchDamage.incomplete,
    },
    remainingDamage: snapshot.branchDamage.paths.map(({ sourceEntityId, targetEntityId, damagedFunction, state, relationRefs }) =>
      [labels.get(sourceEntityId), labels.get(targetEntityId), damagedFunction, state, evidence(relationRefs)]),
    branchSuccess: snapshot.structuralSuccess.branch,
  }
}
try {
  const [{ evaluateBirthReading }, { buildCustomerReadingPlan }, { renderCustomerReadingKo }, { calculateEightCharWithoutBirthTime }] =
    await Promise.all(['product/readBirthChart', 'reading/customer/buildCustomerReadingPlan',
      'reading/customer/renderCustomerReadingKo', 'calculateEightChar'].map(load))
  const births = read('byeong-judgment-inputs')
  const expectations = read('byeong-contract-inputs')
  const cases = []
  for (const [id, month] of [['CS-005', 1], ['CS-005', 7], ['CS-126', 1], ['CS-126', 7],
    ['CS-127', 1], ['CS-127', 7]]) {
    if (branchComparison && (month !== 1 || id === 'CS-005')) continue
    const birth = births[id]
    const reference = { year: 2027, month, day: 15 }
    const [stem, branch] = calculateEightCharWithoutBirthTime(reference).day
    const start = Date.UTC(reference.year, reference.month - 1, reference.day, -9)
    const referenceTime = new Date(start + 9 * 3600000).toISOString()
    const { assembly, natal, judgment } = evaluateBirthReading({
      date: birth.date, time: { known: true, value: birth.time }, gender: '女性', timeCorrectionMode: 'none',
    }, { productScope: 'premium', referenceTime, dailyLuck: {
      pillar: { stem: { id: 'comparison-day-stem', value: stem }, branch: { id: 'comparison-day-branch', value: branch } },
      validity: { periodId: 'comparison-day', from: { kind: 'exact', instant: new Date(start).toISOString() },
        to: { kind: 'exact', instant: new Date(start + 86400000).toISOString() } },
    } })
    const pillars = ['year', 'month', 'day', 'time'].map(position => judgment.canonical.chart.pillars[position].value.ganZhi)
    assert.deepEqual(pillars, expectations[id].pillars)
    assert.equal(judgment.judgmentCore[0].patternContext.branchPattern, expectations[id].pattern)
    assert.deepEqual(judgment.judgmentCore.map(({ scope }) => scope), ['natal', 'greatLuck', 'yearlyLuck', 'monthlyLuck', 'dailyLuck'])
    const [radix] = judgment.judgmentCore
    if (branchComparison) {
      cases.push({ id, beforeLuck: branchTrace(radix),
        scoped: branchTrace(judgment.judgmentCore[id === 'CS-126' ? 1 : 2]) })
      continue
    }
    // Authority C-10-1, items 4–5 and 10–11.
    if (id === 'CS-005') assert.ok(radix.patternContext.yongShenRelations.some(({ stems, relationQuality, relationFactIds }) =>
      stems.join('') === '甲丙' && relationQuality === 'favorable_harmony' && relationFactIds.length >= 2))
    if (id === 'CS-005') {
      assert.ok(radix.roleEngine.damagePaths.some(({ damagedFunction, state }) =>
        damagedFunction === 'branch_killing_protection' && state === 'weakened'))
      assert.ok(radix.roleEngine.resolutionPaths.some(({ remedyEntityId }) => remedyEntityId.includes('/pillars/time/')))
      assert.equal(radix.roleEngine.byeongStatus, 'confirmed')
      assert.equal(radix.roleEngine.guEungStatus, 'confirmed')
    }
    if (id === 'CS-126') assert.ok(radix.branchFacts.some(({ kind, participants }) =>
      kind === 'punishment' && participants.length === 3))
    if (id === 'CS-126') {
      assert.ok(radix.patternContext.yongShenRelations.some(({ stems, relationQuality }) =>
        stems.join('') === '辛戊' && relationQuality === 'unfavorable_conflict'))
      assert.ok(radix.roleEngine.damagePaths.some(({ damagedFunction, state }) => damagedFunction === 'day_master' && state === 'weakened'))
      assert.equal(radix.roleEngine.guEungStatus, 'confirmed')
      if (month === 1) {
        const greatLuck = judgment.judgmentCore[1]
        assert.ok(radix.branchDamage.paths.every(({ damagedFunction }) => damagedFunction !== 'branch_wealth_capacity'))
        const damage = greatLuck.branchDamage.paths.find(({ damagedFunction }) => damagedFunction === 'branch_wealth_capacity')
        assert.ok(damage?.state === 'active')
        assert.ok(greatLuck.branchContexts.some(({ id, branch, tenGod }) =>
          id === damage.sourceEntityId && branch === '丑' && tenGod === '偏財'))
        assert.ok(greatLuck.branchFacts.some(({ id, kind, participants }) =>
          damage.relationRefs.includes(id) && kind === 'punishment' && participants.length === 3
            && participants.includes(damage.sourceEntityId)))
        assert.equal(greatLuck.structuralSuccess.branch.grade, '不利優勢')
      }
    }
    if (id === 'CS-127') {
      assert.equal(radix.patternContext.manifestationHistory.filter(({ stem, sourceClass }) => stem === '壬' && sourceClass === 'main').length, 2)
      assert.equal(radix.patternContext.effectiveManifestedYongShen.filter(({ stem }) => stem === '壬').length, 1)
      assert.ok(radix.branchFacts.some(({ kind }) => kind === 'wonjin'))
      const greatLuck = judgment.judgmentCore[1]
      assert.equal(greatLuck.structuralSuccess.stem.grade, '有利優勢')
      assert.equal(greatLuck.structuralSuccess.branch.grade, '不利優勢')
      assert.equal(greatLuck.structuralSuccess.overall.grade, '不利優勢')
      const year = judgment.judgmentCore[2]
      if (month === 1) {
        const yearBranch = year.formationBranchPool.find(({ scope }) => scope === 'yearlyLuck')
        const dog = year.formationBranchPool.find(({ branch }) => branch === '戌')
        const half = year.formationFacts.find(({ kind, participants }) =>
          kind === 'half' && participants.includes(dog.id) && participants.includes(yearBranch.id))
        assert.ok(half)
        assert.equal(year.branchFacts.filter(({ kind, participants }) =>
          kind === 'six_combination' && participants.includes(yearBranch.id)).length, 2)
        const remaining = year.branchDamage.paths.filter(({ damagedFunction }) => damagedFunction === 'branch_food')
        assert.ok(remaining.some(({ sourceEntityId, relationRefs, state }) =>
          sourceEntityId === dog.id && relationRefs.includes(half.id) && state === 'weakened'))
        assert.equal(remaining.filter(({ sourceEntityId, state }) => state === 'weakened'
          && year.formationBranchPool.some(({ id, branch }) => id === sourceEntityId && branch === '未')).length, 2)
        assert.equal(year.structuralSuccess.branch.grade, '有利優勢')
        assert.ok(year.branchDamage.commandRecoveryRefs?.includes(half.id))
      }
      if (month === 7) {
        assert.ok(year.roleEngine.damagePaths.some(({ damagedFunction, action, state }) =>
          damagedFunction === 'day_master' && action === 'control' && state === 'active'))
        assert.equal(year.structuralSuccess.branch.grade, '不利優勢')
        assert.equal(year.branchDamage.commandRecoveryRefs, undefined)
      }
    }
    const plan = buildCustomerReadingPlan({ assembly, natal })
    const rendered = renderCustomerReadingKo(plan, natal)
    assert.ok(plan.chapters.some(({ paragraphPlans }) => paragraphPlans.length))
    assert.ok(rendered.some(({ paragraphs }) => paragraphs.length))
    assert.ok(plan.semanticUnits.every(unit => unit.scope !== 'day'))
    cases.push({ id, pillars, referenceTime, expected: expectations[id],
      scopes: judgment.judgmentCore.map(snapshot => ({
        scope: snapshot.scope, branchPattern: snapshot.patternContext.branchPattern, stems: snapshot.patternContext.heavenlyPatterns,
        yongRelations: snapshot.patternContext.yongShenRelations.map(({ stems, relationQuality }) => [stems.join(''), relationQuality]),
        success: Object.fromEntries(['stem', 'branch', 'overall'].map(axis => [axis, snapshot.structuralSuccess[axis].grade])),
        byeong: snapshot.roleEngine.byeongStatus, guEung: snapshot.roleEngine.guEungStatus, pending: snapshot.roleEngine.incompleteDamageChecks,
        damage: snapshot.roleEngine.damagePaths.map(({ damagedFunction, action, state }) => [damagedFunction, action, state]),
        relations: snapshot.branchFacts.map(({ kind }) => kind), formations: snapshot.formationFacts.map(({ kind, elementStem }) => [kind, elementStem]),
        roots: snapshot.rootStates.map(({ state }) => state),
        roles: snapshot.roleEngine.roleHistory.map(({ role, roleId }) => [role,
          snapshot.roleEngine.currentRoles.find(item => item.roleId === roleId)?.currentFunction]),
        effects: snapshot.stemFunctionEffects.map(({ kind, sourceRoot }) => [kind, sourceRoot?.monthStage]),
      })),
      outcomes: [assembly.temporalMoneyOutcomes, assembly.temporalRelationshipOutcomes, assembly.temporalHealthOutcomes,
        assembly.workStudyOutcomes].flatMap(facts => (facts ?? []).map(({ semanticType, scope, certainty }) => [semanticType, scope, certainty])),
      rendered: rendered.map(chapter => ({ id: chapter.chapterId,
        paragraphs: chapter.paragraphs.map(({ text, plan }) => ({ text, slots: plan.slots, mapping: plan.sourceMappingIds,
          scope: plan.scope, causes: plan.sourceFactIds.length, mechanisms: plan.lifeMechanismIds })) })),
    })
  }
  const summary = branchComparison ? cases : cases.map(({ id, referenceTime, scopes, rendered }) => ({ id, referenceTime,
    scopes: scopes.map(({ scope, success, byeong, guEung }) => ({ scope, success, byeong, guEung })),
    chapterParagraphCounts: Object.fromEntries(rendered.map(({ id, paragraphs }) => [id, paragraphs.length])),
  }))
  console.log(JSON.stringify(branchComparison || process.argv.includes('--details') ? cases : summary))
} finally {
  await server.close()
}
