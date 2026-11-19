export function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child)
    Object.freeze(value)
  }
  return value
}

export async function loadPersonalityRendererFixtures(load) {
  const { buildNatalPersonality, applyStructuralRoleModifiers, buildCurrentPersonality } = await load('personality/index')
  const { projectNatalStructuralReading } = await load('personalityStructuralReading')
  const { projectCurrentPersonalityScopes } = await load('personalityCurrentReading')
  const { runJudgmentCore } = await load('judgment/core/luckScope')
  const { calculateDayRelationships, calculateTenGod } = await load('dayRelationships')
  const { calculateTwelveStage } = await load('twelveStages')

  const pillar = (id, stem, branch) => ({ stem: { id, value: stem }, branch: { id: id + '-branch', value: branch } })
  const day = pillar('self', '甲', '寅')
  const officer = { day, month: pillar('officer', '辛', '酉') }
  const wealth = { day, month: pillar('wealth', '戊', '辰'), year: pillar('food', '丙', '巳') }
  const start = '2027-01-01T00:00:00.000Z'
  const end = '2028-01-01T00:00:00.000Z'
  const validity = (periodId, from, to) => ({ periodId, from: { kind: 'exact', instant: from }, to: { kind: 'exact', instant: to } })
  const natalValidity = validity('natal', '2000-01-01T00:00:00.000Z', '2100-01-01T00:00:00.000Z')
  const luck = [{ scope: 'greatLuck', pillar: pillar('great', '丁', '巳'), validity: validity('great-a', start, end) }]

  function chart(positions) {
    const chart = { pillars: {}, basicRelations: {} }
    for (const key of ['year', 'month', 'day', 'time']) {
      const item = positions[key]
      if (!item) {
        chart.pillars[key] = chart.basicRelations[key] = { status: 'unknown', uncertaintyIds: ['fixture'] }
        continue
      }
      const stem = item.stem.value
      const branch = item.branch.value
      const dayStem = positions.day.stem.value
      chart.pillars[key] = { status: 'confirmed', value: { stem, branch, ganZhi: stem + branch } }
      chart.basicRelations[key] = { status: 'confirmed', value: {
        stemTenGod: calculateTenGod(dayStem, stem), relationships: calculateDayRelationships(dayStem, branch),
        twelveStage: calculateTwelveStage(dayStem, branch),
      } }
    }
    return chart
  }

  function reading(positions, periods = [], time = start, previousEffectHistory) {
    const snapshots = runJudgmentCore({ executionId: 'p3a', natal: positions, natalValidity, natalCombinations: [],
      luck: periods, referenceTime: time })
    const natal = freeze(applyStructuralRoleModifiers(buildNatalPersonality(chart(positions)), projectNatalStructuralReading(snapshots[0])))
    const current = freeze(buildCurrentPersonality({ natalPersonality: natal, evaluationScope: 'daewoon', referenceTime: time,
      structuralScopes: projectCurrentPersonalityScopes(snapshots, natal.dayStem, time), previousEffectHistory }))
    return { natal, current, snapshots }
  }

  const food = pillar('food', '丙', '巳')
  const hurt = { ...officer, year: pillar('hurt', '丁', '巳') }
  const guarded = { ...hurt, time: pillar('guard', '壬', '子') }
  const standby = { ...officer, year: pillar('standby', '癸', '子') }
  const remedy = { day, month: food, year: guarded.time, time: wealth.month }
  const makeLuck = (id, stem, branch, policyEvidence) => [{
    scope: 'greatLuck', pillar: pillar(id, stem, branch), validity: validity(id, start, end),
    ...(policyEvidence && { policyEvidence }),
  }]
  const stopped = reading(guarded, makeLuck('stopper', '丁', '巳'))
  const activated = reading(wealth, makeLuck('killing', '庚', '申', [
    { entityId: 'killing', condition: 'harmful_killing', evidenceIds: ['fixture:reviewed-killing'] },
  ]))
  const currentConflict = reading(hurt, makeLuck('resource', '癸', '子'))
  const currentSimple = reading(officer, luck)
  const known = reading(guarded)
  const guardReading = projectNatalStructuralReading(known.snapshots[0])
  const weakened = applyStructuralRoleModifiers(buildNatalPersonality(chart(guarded)), {
    ...guardReading, runtime: guardReading.runtime.map(item => item.entityId === 'guard' ? { ...item, state: 'weakened' } : item),
  })

  const fixtures = [
    ['A', '단순 원국', reading({ day: pillar('simple', '丙', '寅') })],
    ['B', '바깥 표현과 내부 판단', reading({ ...hurt, month: pillar('resource', '癸', '子') })],
    ['C', '일주 내부 충돌', reading({ day: pillar('explicit', '甲', '子') })],
    ['D', '활성 보호 역할', known],
    ['E', '한 글자의 두 역할', activated],
    ['F', '보호 대기', reading(standby)],
    ['G', '조건부 방해 역할', reading(wealth)],
    ['H', '실제 완화 경로', reading(remedy)],
    ['I', '방해 역할 없음', reading(officer)],
    ['J', '운에서 역할 정지', stopped],
    ['K', '약화된 보호 역할', { natal: weakened }],
    ['L', '임시 현재 표현', currentSimple],
    ['M', '원국과 현재의 충돌', currentConflict],
    ['N', '현재 효과 만료', reading(hurt, [], end, currentConflict.current.effectHistory)],
    ['O', '출생시각 미정', reading(hurt)],
    ['P', 'SOURCE_GAP', reading({ day: pillar('gap', '癸', '亥') })],
    ['Q', '戊午 canonical', reading({ day: pillar('wu', '戊', '午') })],
  ]
  return fixtures
}
