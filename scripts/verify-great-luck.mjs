import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { addCalendarDuration, calculateGreatLuck } = await server.ssrLoadModule('/src/lib/calculateGreatLuck.ts')
  const { calculateFullAge } = await server.ssrLoadModule('/src/lib/calculateFullAge.ts')
  const { toJstInstant } = await server.ssrLoadModule('/src/lib/solarTermPillars.ts')
  assert.deepEqual(addCalendarDuration(
    { year: 1985, month: 1, day: 22, hour: 14, minute: 22 },
    { years: 5, months: 7, days: 8 },
  ), { year: 1990, month: 8, day: 30, hour: 14, minute: 22 }, '起運 must add calendar years, months, and days in order')
  assert.deepEqual(addCalendarDuration(
    { year: 1990, month: 8, day: 30, hour: 14, minute: 22 },
    { years: 10, months: 0, days: 0 },
  ), { year: 2000, month: 8, day: 30, hour: 14, minute: 22 }, 'later 大運 dates must advance by calendar decades')
  const expectedDaewoonDates = ['1990-08-30', '2000-08-30', '2010-08-30', '2020-08-30', '2030-08-30']
  let daewoonDate = { year: 1985, month: 1, day: 22, hour: 0, minute: 0 }
  daewoonDate = addCalendarDuration(daewoonDate, { years: 5, months: 7, days: 8 })
  const calculatedDaewoonDates = []
  for (let index = 0; index < expectedDaewoonDates.length; index += 1) {
    calculatedDaewoonDates.push(`${daewoonDate.year}-${String(daewoonDate.month).padStart(2, '0')}-${String(daewoonDate.day).padStart(2, '0')}`)
    daewoonDate = addCalendarDuration(daewoonDate, { years: 10, months: 0, days: 0 })
  }
  assert.deepEqual(calculatedDaewoonDates, expectedDaewoonDates, 'all expected 大運 starts must use calendar decade arithmetic')
  assert.ok('2026-01-01' >= calculatedDaewoonDates[3] && '2026-01-01' < calculatedDaewoonDates[4], '2026 must select the 大運 that starts in 2020')
  assert.deepEqual(addCalendarDuration(
    { year: 2020, month: 1, day: 31, hour: 0, minute: 0 }, { years: 0, months: 1, days: 0 },
  ), { year: 2020, month: 2, day: 29, hour: 0, minute: 0 }, 'month addition must clamp safely at leap-month end')
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
