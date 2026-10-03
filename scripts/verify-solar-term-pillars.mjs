import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { hmr: false, middlewareMode: true, ws: false },
})

try {
  const { calculateEightChar } = await server.ssrLoadModule('/src/lib/calculateEightChar.ts')
  const { calculateGreatLuck } = await server.ssrLoadModule('/src/lib/calculateGreatLuck.ts')
  const { findRisshunBoundary } = await server.ssrLoadModule('/src/lib/solarTermPillars.ts')
  const corePillars = ({ year, month, day, time }) => ({ year, month, day, time })

  assert.deepEqual(
    corePillars(calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 1 })),
    { year: '乙巳', month: '己丑', day: '己酉', time: '丁卯' },
    '2026-02-04 05:01 JST must be before Risshun',
  )
  assert.deepEqual(
    corePillars(calculateEightChar({ year: 2026, month: 2, day: 4, hour: 5, minute: 3 })),
    { year: '丙午', month: '庚寅', day: '己酉', time: '丁卯' },
    '2026-02-04 05:03 JST must be after Risshun',
  )

  const janFourth = calculateEightChar({ year: 1985, month: 1, day: 4, hour: 9, minute: 0 })
  assert.deepEqual(corePillars(janFourth), {
    year: '甲子', month: '丙子', day: '癸卯', time: '丁巳',
  }, '1985-01-04 09:00 JST must use the previous solar year stem for 子月')

  assert.equal(
    calculateEightChar({ year: 1985, month: 2, day: 4, hour: 6, minute: 11 }).year,
    '甲子',
    '1985-02-04 06:11 JST must be before Risshun',
  )
  assert.equal(
    calculateEightChar({ year: 1985, month: 2, day: 4, hour: 6, minute: 13 }).year,
    '乙丑',
    '1985-02-04 06:13 JST must be after Risshun',
  )
  assert.equal(
    calculateEightChar({ year: 1985, month: 1, day: 5, hour: 18, minute: 34 }).month,
    '丙子',
    '1985-01-05 18:34 JST must be before 小寒',
  )
  assert.equal(
    calculateEightChar({ year: 1985, month: 1, day: 5, hour: 18, minute: 36 }).month,
    '丁丑',
    '1985-01-05 18:36 JST must be after 小寒',
  )

  const janExpectedYears = new Map([[1984, '癸亥'], [1985, '甲子'], [1986, '乙丑']])
  for (const [year, janPillar] of janExpectedYears) {
    assert.equal(
      calculateEightChar({ year, month: 1, day: 15, hour: 12, minute: 0 }).year,
      janPillar,
      `${year} January must use Gregorian year - 1 for its year pillar`,
    )

    const boundary = findRisshunBoundary(year).instant
    const jstMinute = new Date(Math.floor((boundary.getTime() + 9 * 60 * 60 * 1000) / 60000) * 60000)
    const before = new Date(jstMinute.getTime() - 60000)
    const after = new Date(jstMinute.getTime() + 60000)
    const asBirthDateTime = (date) => ({
      year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(),
      hour: date.getUTCHours(), minute: date.getUTCMinutes(),
    })
    const expectedBefore = janPillar
    const nextCycleYear = new Map([[1984, '甲子'], [1985, '乙丑'], [1986, '丙寅']]).get(year)
    assert.equal(calculateEightChar(asBirthDateTime(before)).year, expectedBefore, `${year} immediately before Risshun`)
    assert.equal(calculateEightChar(asBirthDateTime(after)).year, nextCycleYear, `${year} immediately after Risshun`)
  }

  const greatLuck = calculateGreatLuck({
    yearPillar: janFourth.year,
    monthPillar: janFourth.month,
    dayStem: janFourth.dayRelationships.dayStem,
    gender: '男性',
    birthDateTime: { year: 1985, month: 1, day: 4, hour: 9, minute: 0 },
    timeUnknown: false,
    now: new Date('1985-01-04T00:00:00Z'),
  })
  assert.equal(greatLuck.directionLabel, '順行', '甲年男性 must move forward')
  assert.equal(greatLuck.cards[0].pillar, '丁丑', 'forward 大運 must advance from 丙子')
  assert.equal(greatLuck.boundaryUsed?.name, '小寒', 'forward 起運 must use the next Jie boundary')
  assert.ok(greatLuck.startInstant, 'timed birth must calculate a new 起運時期')
  const beforeWhiteDew = calculateEightChar({ year: 2026, month: 9, day: 7, hour: 23, minute: 40 })
  assert.deepEqual(
    { year: beforeWhiteDew.year, month: beforeWhiteDew.month },
    { year: '丙午', month: '丙申' },
    '2026-09-07 23:40 JST must be before White Dew',
  )
  const afterWhiteDew = calculateEightChar({ year: 2026, month: 9, day: 7, hour: 23, minute: 42 })
  assert.deepEqual(
    { year: afterWhiteDew.year, month: afterWhiteDew.month },
    { year: '丙午', month: '丁酉' },
    '2026-09-07 23:42 JST must be after White Dew',
  )

  console.log('Solar-term boundary checks passed:')
  console.log('1985-01-04 09:00 JST → 年柱 甲子 / 月柱 丙子 / 日柱 癸卯 / 時柱 丁巳; 大運 順行')
  console.log(`大運初回 ${greatLuck.cards[0].pillar}; 起運 ${greatLuck.startAgeLabel} / ${greatLuck.startInstant.toISOString()}`)
  console.log('1985-02-04 06:11 / 06:13 JST → 年柱 甲子 / 乙丑')
  console.log('1985-01-05 18:34 / 18:36 JST → 月柱 丙子 / 丁丑')
  console.log('1984–1986 January and immediately-before/after 立春 checks passed')
  console.log('2026-02-04 05:01 JST → 年柱 乙巳 / 月柱 己丑')
  console.log('2026-02-04 05:03 JST → 年柱 丙午 / 月柱 庚寅')
  console.log('2026-09-07 23:40 JST → 年柱 丙午 / 月柱 丙申')
  console.log('2026-09-07 23:42 JST → 年柱 丙午 / 月柱 丁酉')
} finally {
  await server.close()
}
