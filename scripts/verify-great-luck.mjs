import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateGreatLuck } = await server.ssrLoadModule('/src/lib/calculateGreatLuck.ts')
  const { calculateFullAge } = await server.ssrLoadModule('/src/lib/calculateFullAge.ts')
  const { toJstInstant } = await server.ssrLoadModule('/src/lib/solarTermPillars.ts')
  const cases = [
    { yearPillar: '甲子', gender: '男性', direction: 'forward' },
    { yearPillar: '乙丑', gender: '男性', direction: 'reverse' },
    { yearPillar: '丙寅', gender: '女性', direction: 'reverse' },
    { yearPillar: '丁卯', gender: '女性', direction: 'forward' },
  ]

  for (const item of cases) {
    const result = calculateGreatLuck({
      ...item,
      monthPillar: '丁丑',
      dayStem: '甲',
      timeUnknown: true,
    })
    assert.equal(result.direction, item.direction, `${item.yearPillar}/${item.gender} direction`)
    assert.equal(result.startAgeLabel, undefined, 'unknown birth time must not be assigned a start age')
    assert.equal(result.cards[0].startAgeLabel, undefined, 'unknown birth time must not get card age labels')
  }

  const forward = calculateGreatLuck({
    yearPillar: '甲子', monthPillar: '丁丑', dayStem: '甲', gender: '男性', timeUnknown: true,
  })
  assert.deepEqual(forward.cards.slice(0, 3).map(({ pillar }) => pillar), ['戊寅', '己卯', '庚辰'])

  const reverse = calculateGreatLuck({
    yearPillar: '乙丑', monthPillar: '丁丑', dayStem: '甲', gender: '男性', timeUnknown: true,
  })
  assert.deepEqual(reverse.cards.slice(0, 3).map(({ pillar }) => pillar), ['丙子', '乙亥', '甲戌'])

  const beforeRisshun = { year: 2026, month: 2, day: 4, hour: 5, minute: 1 }
  const forwardTimed = calculateGreatLuck({
    yearPillar: '乙巳', monthPillar: '己丑', dayStem: '己', gender: '女性',
    birthDateTime: beforeRisshun, timeUnknown: false, now: new Date('2026-02-04T00:00:00Z'),
  })
  const birthInstant = toJstInstant(beforeRisshun)
  assert.equal(forwardTimed.boundaryUsed.name, '立春')
  assert.ok(forwardTimed.boundaryUsed.instant.getTime() > birthInstant.getTime())
  assert.ok(forwardTimed.boundaryUsed.instant.getTime() < birthInstant.getTime() + 2 * 60 * 1000)
  assert.ok(Math.abs(
    forwardTimed.startAgeEquivalentDays
      - (forwardTimed.boundaryUsed.instant.getTime() - birthInstant.getTime()) / (12 * 60 * 1000),
  ) < 1e-9, 'forward 起運 must use exact JST time until the next actual jie')

  const afterRisshun = { year: 2026, month: 2, day: 4, hour: 5, minute: 3 }
  const reverseTimed = calculateGreatLuck({
    yearPillar: '丙午', monthPillar: '庚寅', dayStem: '己', gender: '女性',
    birthDateTime: afterRisshun, timeUnknown: false, now: new Date('2026-02-04T00:00:00Z'),
  })
  const afterInstant = toJstInstant(afterRisshun)
  assert.equal(reverseTimed.boundaryUsed.name, '立春')
  assert.ok(reverseTimed.boundaryUsed.instant.getTime() < afterInstant.getTime())
  assert.ok(afterInstant.getTime() - reverseTimed.boundaryUsed.instant.getTime() < 2 * 60 * 1000)
  assert.ok(Math.abs(
    reverseTimed.startAgeEquivalentDays
      - (afterInstant.getTime() - reverseTimed.boundaryUsed.instant.getTime()) / (12 * 60 * 1000),
  ) < 1e-9, 'reverse 起運 must use exact JST time since the previous actual jie')

  assert.equal(calculateFullAge(1985, 1, 22, new Date('2026-01-21T14:59:00Z')), 40)
  assert.equal(calculateFullAge(1985, 1, 22, new Date('2026-01-21T15:00:00Z')), 41)

  console.log('Great-luck checks passed: direction rules 4/4; sequence forward/reverse; JST 起運 forward/reverse; full-age boundary 2/2.')
} finally {
  await server.close()
}
